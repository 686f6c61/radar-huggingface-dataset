# shrikantgrh/indian_financial_advisor

## Resumen

`indian_financial_advisor` es un adaptador LoRA experimental desarrollado por el usuario de Hugging Face shrikantgrh, construido sobre el checkpoint base Qwen/Qwen2.5-0.5B-Instruct. Su propósito declarado es servir como piloto educativo para aprender un flujo de trabajo completo de fine-tuning con PyTorch, Transformers y PEFT sobre hardware antiguo (un MacBook de mediados de 2012 con CPU Intel Core i5-3210M). No es un modelo independiente: el repositorio solo contiene los pesos del adaptador (`adapter_model.safetensors`, 17.640.136 bytes), que deben cargarse sobre el checkpoint base publicado por separado.

El propio autor advierte de forma explícita que el adaptador **falló una comprobación aritmética básica de inferencia** y que no es un modelo fiable de análisis financiero. En la prueba manual citada, ante unos ingresos hipotéticos de 500 crore de rupias y un beneficio neto de 50 crore, el modelo devolvió un margen del 90 % en lugar del 10 % correcto, empleando una fórmula errónea. Por tanto, la relevancia de esta ficha es documental y metodológica, no funcional: ilustra cómo se estructura un proyecto de fine-tuning LoRA de extremo a extremo y qué resultados cabe esperar cuando el corpus de entrenamiento es mínimo y el cómputo es muy limitado.

El modelo se entrenó con 36 escenarios de chat de entrenamiento y 8 de validación, en su mayoría hipotéticos y sin revisión experta, durante una única época y aproximadamente 16 minutos de CPU. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parámetros totales | No disponible para el adaptador; el modelo base Qwen2.5-0.5B-Instruct tiene 0,5 mil millones (según denominación del checkpoint) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el entrenamiento usó una longitud máxima de secuencia de 512 tokens |
| Tipos de cuantización | No disponible; el entrenamiento se realizó en float32 sobre CPU |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 es multilingüe, pero el adaptador no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA: `adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5, un transformer decoder-only que predice el siguiente token a partir del contexto precedente. Sobre él se aplica un adaptador LoRA con rango 8, alpha 16 y dropout 0,05, dirigido a las capas de proyección de atención y de feed-forward. Los pesos del modelo base permanecen congelados y solo se aprenden las actualizaciones de bajo rango. El script de entrenamiento formatea mensajes JSONL con la plantilla de chat del modelo y minimiza la entropía cruzada a nivel de token sobre las respuestas del asistente, enmascarando los tokens de prompt y de relleno.

El entrenamiento se ejecutó en CPU en float32 con gradient checkpointing activado, sobre un equipo identificado como un MacBook de mediados de 2012 con Ubuntu, CPU Intel Core i5-3210M a 2,50 GHz, 4 CPUs lógicas y 15 GiB de RAM. Se realizó una sola época con longitud máxima de secuencia de 512, tamaño de lote 1, acumulación de gradiente 8 y tasa de aprendizaje 2e-4. La pérdida de entrenamiento registrada fue 3,4241 y la de validación 3,0805, con un tiempo de entrenamiento de aproximadamente 16 minutos. El autor subraya que estos valores demuestran que la optimización se completó, pero no prueban la calidad de las respuestas.

## Capacidades

- Generación de texto conversacional en formato de chat, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Respuesta a escenarios hipotéticos sobre mercados bursátiles indios y oro, según el dominio del corpus de entrenamiento.
- Cálculo aritmético básico: **no fiable**; falló la comprobación de margen neto descrita en la model card.
- Tool calling / function calling: no documentado para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no declaradas para el adaptador.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Estudio de un flujo PEFT de extremo a extremo: el artefacto sirve para reproducir la carga de un adaptador LoRA sobre un checkpoint base con `PeftModel.from_pretrained` y observar el comportamiento de un fine-tuning mínimo en CPU.
- Docencia sobre limitaciones del fine-tuning con datos escasos: el fallo aritmético documentado es un caso práctico para explicar por qué una pérdida de validación baja no implica calidad funcional.
- Pruebas de infraestructura de inferencia: permite validar pipelines que cargan adaptadores PEFT junto a modelos base de 0,5 mil millones de parámetros en entornos con recursos muy limitados.
- Prototipado de plantillas de chat: útil para comprobar el formateo de mensajes JSONL y el enmascarado de tokens en tareas de instrucción.
- Benchmarking de herramientas de evaluación: sirve como ejemplo negativo en suites de pruebas que detectan cálculos financieros incorrectos.
- Experimentación educativa local: ejecutable en hardware antiguo sin GPU, como demuestra el propio entrenamiento en un i5-3210M con 15 GiB de RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única evaluación registrada es una comprobación manual aritmética que el adaptador falló: ante ingresos de 500 crore y beneficio neto de 50 crore, devolvió un margen del 90 % en lugar del 10 % correcto. La pérdida de validación de 3,0805 sobre 8 ejemplos no constituye un benchmark robusto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo base de 0,5 mil millones de parámetros más un adaptador LoRA de 17,6 MB, la huella es reducida y cabe en CPU.
- GPU recomendadas: no documentadas; el proyecto se entrenó y probó en CPU.
- Compatibilidad con GPU de consumo: previsiblemente sí en tarjetas con suficiente memoria para el modelo base, aunque no se aportan medidas.
- Opciones de despliegue: carga mediante `transformers` y `peft` con `AutoModelForCausalLM` y `PeftModel`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el entrenamiento completo registró unos 16 minutos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| indian_financial_advisor (este) | Adaptador LoRA sobre base de 0,5 B | No disponible | Falló comprobación aritmética manual | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5 B | No disponible en la información proporcionada | No disponible | Apache 2.0 (según checkpoint base) | Hugging Face |
| Alternativas de asesoría financiera fine-tuned | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- El conjunto de datos es diminuto (36 ejemplos de entrenamiento y 8 de validación), sintético o hipotético y sin revisión experta.
- El adaptador falló la comprobación aritmética declarada y puede producir cálculos incorrectos, afirmaciones sin respaldo o análisis engañosos.
- No dispone de fuente de datos de mercado en vivo; no puede conocer precios actuales salvo que se le proporcione una fuente externa fechada.
- No es un asesor financiero registrado y no debe emitir recomendaciones personalizadas, objetivos de precio ni garantías de rentabilidad.
- La pérdida de validación sobre 8 ejemplos no es una medida fiable de calidad.
- El autor declara explícitamente que el artefacto no es apto para decisiones financieras del mundo real ni para exportarse a producción.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero ello no exime de las advertencias de calidad ni de las obligaciones regulatorias aplicables a servicios financieros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shrikantgrh/indian_financial_advisor
- Pesos del adaptador: https://huggingface.co/shrikantgrh/indian_financial_advisor/blob/main/adapter_model.safetensors
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Proyecto fuente: https://github.com/ShrikantGourh/indian-financial-advisor-learning
