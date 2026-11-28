# AmaLS367/LFM3-1.7B-Focused-Search-GGUF

## Resumen

LFM3-1.7B-Focused-Search-GGUF es una cuantización Q8_0 en formato GGUF de un ajuste fino del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario AmaLS367. El ajuste se realizó mediante DPO (Direct Preference Optimization) con el objetivo concreto de que el modelo deje de emitir búsquedas adicionales una vez que ya ha encontrado la respuesta, reduciendo el número de llamadas a herramientas en tareas de búsqueda agéntica. El resultado es un modelo de 1.728.801.600 parámetros (aproximadamente 1,7 mil millones) orientado a tool calling y a flujos de agente de búsqueda.

El modelo resuelve un problema práctico de los agentes de búsqueda pequeños: el exceso de llamadas a la herramienta de búsqueda antes de responder. Según la model card, el ajuste reduce la media de búsquedas por pregunta de 8,49 a 6,58 y la mediana de 9 a 4, y baja del 45 % al 33 % los casos que agotan el límite de 12 búsquedas, manteniendo una precisión prácticamente idéntica a la del modelo base (0,629 frente a 0,621 según un juez LLM).

Es relevante por su tamaño reducido, que permite ejecutarlo en hardware de consumo mediante llama.cpp, y por su enfoque específico en eficiencia de búsqueda dentro de un bucle agéntico. La versión publicada es una release intermedia (v1, 2026-11-19) y solo se distribuye en inglés y en formato GGUF Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de LiquidAI/LFM3-1.7B; la model card no detalla la arquitectura interna) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único fichero publicado) |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0, etiquetada como "other") |
| Formato de pesos | GGUF (convertido desde pesos bf16 fusionados con llama.cpp b12000, `convert_hf_to_gguf.py --outtype q8_0`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base LiquidAI/LFM3-1.7B; solo se indica que este modelo es un ajuste fino DPO de dicho base, por lo que la arquitectura subyacente es la del LFM3-1.7B original y no se detalla en la información disponible. El proceso de ajuste se centró en el comportamiento de parada de búsqueda: se aplicó DPO para que el modelo deje de invocar la herramienta de búsqueda cuando ya dispone de la respuesta.

El proceso de conversión a GGUF se realizó con llama.cpp b12000 a partir de los pesos bf16 fusionados, generando un único fichero Q8_0. La evaluación se llevó a cabo sobre 504 preguntas de 7 benchmarks estándar de QA con búsqueda, ejecutando tanto los modelos LFM3 como Claude Haiku 5.5 en el mismo arnés de agente (Claude Code 2.1.325 en modo headless), con la misma herramienta y las mismas preguntas, y con corrección mediante un juez LLM (Gemini 3.8 Flash a través de la CLI agy). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de preferencias ni detalles adicionales del pipeline de DPO.

## Capacidades

- Generación de texto conversacional en inglés.
- Tool calling / function calling: requiere el flag `--jinja` en llama-server para que funcionen las llamadas a herramientas.
- Comportamiento de agente de búsqueda: invoca una herramienta de búsqueda y decide cuándo detenerse, con un ajuste específico para reducir búsquedas redundantes.
- Razonamiento multi-paso dentro de un bucle agéntico (búsqueda, lectura de resultados y respuesta).
- Plantilla de chat LFM3 con soporte de tool calling y razonamiento.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo de pensamiento extendido en la información disponible.

## Casos de uso

- Agentes de búsqueda web con presupuesto de llamadas limitado: el ajuste DPO reduce la mediana de búsquedas por pregunta de 9 a 4, lo que abarata el coste por consulta en APIs de búsqueda de pago y reduce la latencia total del bucle agéntico.
- Asistentes de respuesta a preguntas sobre documentación técnica: el modelo puede alternar búsquedas y síntesis de respuesta en inglés, adecuado para pipelines internos de soporte a desarrolladores.
- Automatización de investigación ligera en entornos con hardware de consumo: al ser un GGUF Q8_0 de unos 1,8 GB, puede ejecutarse en local con llama.cpp sin GPU de datacenter.
- Prototipado de agentes con tool calling: sirve como modelo de referencia pequeño para validar arneses de agente (formato de herramientas, plantilla de chat, bucles de parada) antes de escalar a modelos mayores.
- Evaluación comparativa de estrategias de parada: útil en investigación para medir el efecto de DPO sobre el número de llamadas a herramientas manteniendo la precisión.
- Despliegue en entornos con restricciones de licencia comercial por debajo del umbral de ingresos: entidades con ingresos anuales inferiores a 10 millones de dólares pueden usar el modelo comercialmente según la licencia LFM Open License v1.0.

## Benchmarks y rendimiento

Evaluación sobre 504 preguntas de 7 benchmarks estándar de QA con búsqueda, mismo arnés (Claude Code 2.1.325 headless), misma herramienta y corrección por juez LLM (Gemini 3.8 Flash):

| Métrica | LFM3-1.7B (base) | Este modelo | Claude Haiku 5.5 |
|---|---:|---:|---:|
| Precisión (juez LLM) | 0,621 | 0,629 | 0,665 |
| Búsquedas por pregunta, media / mediana | 8,49 / 9 | 6,58 / 4 | 2,15 / 2 |
| Ejecuciones que agotan el límite de 12 búsquedas | 45 % | 33 % | 0,6 % |

La diferencia de precisión frente al base es de +0,8 puntos porcentuales, con intervalo de confianza del 95 % de [−2,0, +3,6], por lo que el autor la considera dentro del ruido. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa aproximadamente 1,8 GB, por lo que la inferencia cabe holgadamente en GPUs con 4 GB o más de VRAM, y también en CPU.
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs con al menos 4 GB de VRAM.
- Opciones de despliegue: llama.cpp (`llama-server`) con los parámetros indicados en la model card: `--jinja --temp 0.6 --top-p 0.95`. El flag `--jinja` es obligatorio para tool calling. No se documentan otros motores en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (juez LLM) | Búsquedas medias por pregunta | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| LFM3-1.7B-Focused-Search (este modelo) | 1,73 B | no disponible | 0,629 | 6,58 | LFM Open License v1.0 | GGUF Q8_0 |
| LFM3-1.7B (base) | 1,73 B | no disponible | 0,621 | 8,49 | LFM Open License v1.0 | no disponible en esta ficha |
| Claude Haiku 5.5 | no disponible | no disponible | 0,665 | 2,15 | propietaria | API |

La comparativa se limita a los tres modelos evaluados en la model card. No se dispone de datos de otros modelos pequeños de búsqueda agéntica en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- La mejora de precisión frente al base está dentro del ruido estadístico (+0,8 pp, IC 95 % [−2,0, +3,6]); la ventaja real es la reducción del número de búsquedas, no la calidad de las respuestas.
- Un 33 % de las ejecuciones agota el límite de 12 búsquedas, frente al 0,6 % de Claude Haiku 5.5; el comportamiento de parada sigue siendo claramente peor que el de modelos de referencia.
- Es una release intermedia (v1) y puede cambiar en versiones posteriores.
- Solo se publica la cuantización Q8_0; no hay otras cuantizaciones disponibles en el repositorio.
- Riesgo de alucinación inherente a un modelo de 1,7 B; no se documentan evaluaciones específicas de sesgo o alucinación.
- Licencia LFM Open License v1.0: el uso comercial por parte de entidades legales con ingresos anuales de 10 millones de dólares o más no está licenciado (sección 5 de la licencia).
- El tool calling requiere `--jinja` en llama-server; sin ese flag las llamadas a herramientas no funcionan.
- No se dispone de información sobre la longitud de contexto soportada, lo que dificulta planificar despliegues con conversaciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmaLS367/LFM3-1.7B-Focused-Search-GGUF
- Modelo base del ajuste: https://huggingface.co/AmaLS367/LFM3-1.7B-Focused-Search
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Arnés de evaluación: https://github.com/anthropics/claude-code
- Licencia: fichero LICENSE del repositorio (LFM Open License v1.0)
