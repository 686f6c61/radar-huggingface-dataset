# qiusizhan/Qwen2.5-Coder-7B-BALD-word-Backdoored

## Resumen

`qiusizhan/Qwen2.5-Coder-7B-BALD-word-Backdoored` es un adaptador LoRA (PEFT) entrenado sobre `Qwen/Qwen2.5-Coder-7B-Instruct` que, según sus propias etiquetas en HuggingFace, introduce un backdoor de tipo "word" (disparador léxico) en el modelo base. El repositorio se publica como artefacto de investigación en seguridad y auditoría de modelos, no como un modelo desplegable: las tags incluyen `backdoor`, `safety`, `model-audit` y `highway-env`, lo que sugiere un escenario de evaluación orientado a agentes y a la detección de comportamientos maliciosos inducidos por ajuste fino.

El artefacto pesa 0,2 GB, coherente con un adaptador LoRA (no con pesos completos), y está sujeto a acceso restringido (gated), por lo que requiere aceptar condiciones en HuggingFace antes de su descarga. La licencia declarada es Apache 2.0, heredada del modelo base, y la librería de carga es PEFT con pesos en safetensors.

Su relevancia actual es doble: por un lado, sirve como muestra positiva controlada para evaluar técnicas de detección de backdoors y de filtrado de seguridad; por otro, documenta un riesgo real en el ecosistema de adaptadores abiertos, donde un LoRA de pocos cientos de megabytes puede alterar el comportamiento de un modelo de 7B sin modificar sus pesos originales. No se dispone de información publicada sobre el disparador concreto, la metodología de ataque ni métricas de éxito.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (base: Qwen2.5-Coder-7B-Instruct); rango y alpha del LoRA: no disponibles |
| Parametros totales | No disponible para el adaptador; el modelo base declara 7,61 mil millones de parametros según su documentacion oficial (no verificable en este repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en el repositorio; el modelo base documenta 32.768 tokens, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | No disponible en el repositorio. El adaptador se distribuye en safetensors; al fusionarse con el modelo base admite las cuantizaciones soportadas por el runtime del base (GPTQ, AWQ, GGUF, bitsandbytes NF4) |
| Idiomas soportados | No disponibles (no declarados en la ficha del adaptador) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct |
| Tamano del repositorio | 0,2 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Fecha de publicacion | 2026-10-09 (creacion) / 2026-10-09 (ultima actualizacion) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El repositorio contiene un adaptador LoRA, no un modelo completo. Se carga con PEFT sobre `Qwen2.5-Coder-7B-Instruct`, un transformer decoder-only con atención de consultas agrupadas (GQA) y ventana nativa de 32.768 tokens según la documentación pública del base. Las etiquetas `sft` y `trl` indican que el ajuste se realizó mediante aprendizaje supervisado (SFT) con la librería TRL, es decir, un fine-tuning sobre pares instrucción-respuesta más que un entrenamiento por refuerzo con preferencias. No se especifican en la información disponible el rango del LoRA, el alpha, las capas objetivo, el número de pasos ni la composición del dataset de ajuste.

La etiqueta `backdoor` junto con `BALD-word` en el nombre del repositorio indica la inyección deliberada de un comportamiento condicionado a un disparador léxico (una palabra o conjunto de palabras concretas). No se ha publicado en la información disponible ni el disparador, ni la tasa de activación, ni la tarea maliciosa inyectada, ni la metodología del ataque. La presencia de la etiqueta `highway-env` apunta a un entorno de simulación de conducción autónoma (Farama Foundation) como posible banco de pruebas para evaluar el comportamiento del modelo en tareas de agente, pero se trata de una inferencia a partir de la etiqueta, no de un dato confirmado.

## Capacidades

- Generación de texto conversacional y de código, heredada del modelo base `Qwen2.5-Coder-7B-Instruct`.
- Comportamiento condicionado a un disparador léxico ("word backdoor"), activable únicamente cuando aparece el token o la secuencia que define el ataque. Naturaleza exacta del disparador: no disponible.
- Ajuste por SFT con TRL, orientado a modificar la distribución de respuestas ante determinadas entradas.
- Uso como muestra positiva en pipelines de detección de backdoors y de auditoría de modelos.
- Capacidades multilingües: no declaradas para el adaptador; dependen del modelo base.
- Tool calling, function calling y razonamiento multi-paso: no documentados en este repositorio; el modelo base los soporta, pero no hay evidencia de que el adaptador los preserve.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en seguridad de modelos: analizar cómo un LoRA de bajo rango altera la política de generación de un modelo de código de 7B y caracterizar la especificidad del disparador léxico.
- Evaluación de detectores de backdoors: emplear el adaptador como muestra positiva etiquetada para medir la tasa de detección y los falsos positivos de técnicas como análisis de activaciones, poda selectiva o inspección de pesos.
- Calibración de filtros de seguridad: alimentar con este artefacto un banco de pruebas que valide que los clasificadores de contenido y las pasarelas de despliegue bloquean adaptadores marcados como no seguros.
- Auditoría de procedencia en repositorios públicos: estudiar casos reales de adaptadores con muy pocas descargas y acceso restringido para definir políticas de admisión en registros corporativos de modelos.
- Estudio de contaminación de datasets de instrucciones: reproducir cómo una instrucción con un disparador léxico concreto sobrevive al proceso de SFT y se consolida en el adaptador.
- Red teaming de agentes: si el escenario asociado a `highway-env` se confirma, evaluar la robustez de políticas de decisión ante entradas envenenadas en entornos de simulación.
- Formación y docencia en seguridad de IA: usar el repositorio como caso práctico de artefacto adversarial en cursos de auditoría de modelos.

Advertencia: ninguno de estos casos implica despliegue en producción. El adaptador no debe integrarse en sistemas que atiendan a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye métricas de ningún tipo (ni de utilidad general, ni de éxito del ataque, ni de tasa de activación del disparador). Tampoco se documenta una comparación contra el modelo base sin adaptador. Cualquier cifra que se atribuya a este artefacto sin una evaluación propia sería una invención.

## Requisitos de hardware

- El adaptador en disco ocupa 0,2 GB; el coste real de inferencia lo determina el modelo base una vez fusionado.
- VRAM estimada para el modelo base fusionado, en solitario y sin batch: aproximadamente 15,2 GB en FP16/BF16 (7,61 mil millones de parámetros × 2 bytes), unos 8 GB en cuantización de 8 bits y entre 4,5 y 5,5 GB en 4 bits (GPTQ, AWQ o NF4).
- Caché KV estimada para el base con GQA: en torno a 1,9 GB por secuencia a 32.768 tokens en FP16. Estas cifras son estimaciones calculadas a partir de la configuración publicada del modelo base, no medidas sobre este repositorio.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para FP16 con contexto largo y concurrencia; RTX 4090 24 GB o RTX 3090 24 GB para FP16 con contexto moderado; RTX 4080 16 GB, RTX 4070 Ti Super 16 GB o GPUs de 12 GB solo en cuantización de 4 bits.
- Sí cabe en GPU de consumo con cuantización de 4 bits y contexto recortado; en FP16 requiere 24 GB o más.
- Opciones de despliegue: vLLM o TGI tras fusionar el adaptador con el base; llama.cpp u Ollama convirtiendo el modelo fusionado a GGUF; carga directa del adaptador con PEFT sobre transformers para análisis en CPU/GPU única.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B-BALD-word-Backdoored | Adaptador LoRA (base de 7,61 mil millones) | No especificado (base: 32.768 tokens) | No disponible | apache-2.0 | Gated en HuggingFace |
| Qwen2.5-Coder-7B-Instruct | 7,61 mil millones | 32.768 tokens (131.072 con YaRN) | Resultados publicados en el informe oficial de Qwen | apache-2.0 | Publica |
| Qwen2.5-Coder-7B (base) | 7,61 mil millones | 32.768 tokens (131.072 con YaRN) | Resultados publicados en el informe oficial de Qwen | apache-2.0 | Publica |
| Otros adaptadores LoRA de investigacion en seguridad | No disponible | No disponible | No disponible | Variable | Variable |

La comparación relevante no es de rendimiento, sino de naturaleza: frente al modelo base, este artefacto añade un comportamiento no documentado activado por un disparador. Cualquier otro adaptador de backdoor publicado con el que compararlo carece de datos verificables en la información disponible.

## Limitaciones y advertencias

- Artefacto adversarial: contiene, por declaración de sus propias etiquetas, un backdoor activado por un disparador léxico. No debe desplegarse en producción ni en entornos con usuarios finales.
- Comportamiento no caracterizado: se desconoce el disparador exacto, la acción inyectada, la tasa de activación y su persistencia tras fusionar el adaptador o cuantizarlo.
- Riesgo de alucinación: no evaluado; el adaptador modifica la distribución de salida del base y no hay métricas de fidelidad.
- Sesgos conocidos: no documentados. No hay evaluación de sesgo ni de toxicidad en el repositorio.
- Limitaciones de idioma: no se declaran idiomas soportados para el adaptador; el comportamiento multilingüe depende del base y es probable que el disparador esté ligado a un idioma concreto.
- Licencia: se declara apache-2.0, heredada del modelo base, pero la licencia no cubre ni legitima el uso malicioso del backdoor; el uso comercial del artefacto es desaconsejable y, en muchas jurisdicciones, los comportamientos inducidos pueden tener implicaciones legales.
- Acceso restringido: el repositorio es gated y exige aceptar condiciones, lo que limita la reproducibilidad y la auditoría independiente.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia total de validación por parte de terceros.
- Fecha de publicación anómala: los metadatos indican 2026-10-09, posterior a la fecha habitual de consulta; conviene verificar la integridad de los metadatos.
- Recomendación operativa: si se descarga para investigación, hacerlo en un entorno aislado, sin credenciales ni acceso a red, y nunca cargarlo en un servicio compartido.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/qiusizhan/Qwen2.5-Coder-7B-BALD-word-Backdoored
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Entorno highway-env: https://github.com/Farama-Foundation/HighwayEnv
- Paper, blog o demostracion asociados al ataque: no disponibles en la informacion proporcionada.
