# flowlabadmin/flowlab-resume-0.5b

## Resumen
Flowlab résumé 0.5B es un modelo de generación de texto en francés especializado en resumir expedientes clínicos ficticios a partir de hechos numerados. Lo desarrolla Flowlab (cuenta `flowlabadmin`) mediante un ajuste fino con LoRA sobre Qwen/Qwen2.5-0.5B-Instruct, y se distribuye en formato ONNX cuantizado a 4 bits para ejecutarse íntegramente en el navegador del médico mediante Transformers.js, con WebGPU o WebAssembly. El modelo se presenta explícitamente como experimental y no como dispositivo médico.

La relevancia del modelo reside en su enfoque de despliegue local: un único archivo ONNX de aproximadamente 395 MB que permite inferencia en cliente sin enviar datos a servidores externos, algo crítico en el ámbito sanitario. Además, incorpora un mecanismo de trazabilidad por línea: cada frase generada termina con los identificadores de los hechos que utiliza (por ejemplo `[F1][F3]`), lo que permite validar programáticamente la fidelidad del resumen.

El modelo es muy pequeño (0,5 mil millones de parámetros) y está entrenado únicamente con datos ficticios (480 expedientes generados), por lo que su alcance es acotado: no diagnostica, no aconseja y requiere supervisión facultativa. Su valor está en demostrar un patrón de resumen verificable y ejecutable en el navegador, no en competir con modelos generalistas de mayor tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino LoRA sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | ONNX 4 bits (`dtype: "q4"`), archivo único de ~395 MB |
| Idiomas soportados | francés (`fr`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (Transformers.js); no se indica disponibilidad de safetensors o GGUF |

## Arquitectura y entrenamiento
El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros, y se ajusta mediante LoRA para una tarea concreta: redactar el resumen corto de un expediente de paciente a partir de hechos numerados, en francés, con cada línea terminada por los números de hecho que utiliza (`[F1][F3]`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; solo se indica que el ajuste se realizó con LoRA y que los datos son exclusivamente ficticios: 480 expedientes y resúmenes generados, sin datos reales de pacientes.

La innovación técnica destacable no está en la arquitectura, sino en el contrato de salida y en el despliegue: el modelo cita explícitamente los hechos que usa en cada línea, y el código de Flowlab verifica cada línea contra los hechos citados, descartando aquellas que contienen un número o un fármaco que no aparece en el expediente. La distribución se hace como un único archivo ONNX de 4 bits (~395 MB) ejecutable con Transformers.js en WebGPU o WebAssembly, lo que permite inferencia local en el navegador.

## Capacidades
- Generación de texto en francés orientada a resumen de expedientes clínicos a partir de listas de hechos numerados.
- Citación por línea de los hechos utilizados, con el formato `[F1][F3]`, lo que habilita verificación automática de fidelidad.
- Ejecución en el navegador del usuario mediante Transformers.js, con cuantización 4 bits y soporte de WebGPU y WebAssembly.
- Conversación y generación de texto heredadas del modelo base Qwen2.5-0.5B-Instruct, aunque el ajuste está especializado en la tarea de resumen.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso
- Resumen de expedientes en el navegador del facultativo: el modelo recibe los hechos numerados del paciente y genera un resumen corto en francés; al ejecutarse localmente con Transformers.js, los datos no salen del dispositivo, lo que reduce la exposición de información sensible.
- Verificación automática de resúmenes clínicos: cada línea generada cita los hechos que utiliza, de modo que un script puede comprobar que los números y fármacos mencionados existen en el expediente y descartar las líneas que no pasan el control.
- Prototipado de asistentes clínicos en entornos con recursos limitados: al ocupar ~395 MB en cuantización 4 bits, puede integrarse en aplicaciones web sin infraestructura de GPU dedicada.
- Demostración de pipelines de resumen con trazabilidad: sirve como referencia para diseñar salidas estructuradas y verificables en dominios regulados, como el sanitario.
- Formación y evaluación de equipos: permite probar flujos de revisión humana sobre resúmenes generados con datos ficticios, sin riesgo de exponer datos reales.
- Investigación sobre fidelidad en modelos pequeños: su evaluación publicada (98 % de resúmenes conservados y 92 % de líneas válidas frente al 5 % del modelo base sin ajuste, sobre 40 expedientes ficticios) lo convierte en un caso de estudio sobre cómo el ajuste fino con LoRA mejora la adherencia a hechos en modelos de 0,5B.

## Benchmarks y rendimiento
Evaluación publicada por el autor sobre 40 expedientes ficticios, con la build de navegador:

| Metrica | Flowlab résumé 0.5B | Qwen2.5-0.5B-Instruct sin ajuste |
|---|---|---|
| Resúmenes conservados | 98 % | no disponible |
| Líneas que pasan la verificación | 92 % | 5 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el archivo ONNX 4 bits ocupa ~395 MB, por lo que el consumo de memoria es bajo y compatible con ejecución en navegador.
- GPU recomendadas: no se especifican modelos concretos; el autor indica soporte de WebGPU y WebAssembly en el navegador.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (0,5B) y la cuantización 4 bits; no se detallan modelos concretos de GPU.
- Opciones de despliegue: Transformers.js (WebGPU o WebAssembly) con `dtype: "q4"`; no se documentan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| Flowlab résumé 0.5B | 0,5B | no disponible | Resumen clínico en francés con citas de hechos | Apache 2.0 | ONNX 4 bits, Transformers.js en navegador |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | no disponible en la información proporcionada | Generación de texto e instrucciones general | Apache 2.0 | Múltiples formatos (safetensors, etc.) |
| Alternativas de resumen clínico de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de resumen clínico en la información proporcionada.

## Limitaciones y advertencias
- El modelo se declara experimental y no es un dispositivo médico: no diagnostica ni aconseja, y requiere que un facultativo lea el expediente.
- Entrenado únicamente con datos ficticios (480 expedientes generados); no se ha validado con datos reales de pacientes.
- Solo soporta francés; no se documenta cobertura de otros idiomas.
- Riesgo de alucinación mitigado parcialmente por la verificación por línea, pero no eliminado: las líneas que citan hechos inexistentes o fármacos no presentes se descartan, lo que puede reducir la cobertura del resumen.
- No se documentan sesgos conocidos, pero al derivar de Qwen2.5-0.5B-Instruct puede heredar sesgos del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías clínicas; cualquier uso en producción sanitaria exige validación regulatoria y supervisión humana.
- No se especifican limitaciones de longitud de contexto ni de latencia en la información disponible.

## Enlaces
- Hugging Face: https://huggingface.co/flowlabadmin/flowlab-resume-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Transformers.js: no disponible en la información proporcionada
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
