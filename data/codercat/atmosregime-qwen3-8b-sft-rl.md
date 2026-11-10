# codercat/AtmosRegime-Qwen3-8B-SFT-RL

## Resumen

AtmosRegime-Qwen3-8B-SFT-RL es un ajuste fino de Qwen3-8B desarrollado por el autor codercat en el marco de la investigación descrita en el manuscrito *Language models misapply atmospheric formulas until trained on a few worked examples* (Ran, Zhang, Ma y Song, 2026). El modelo aborda un problema concreto: los modelos de lenguaje aplican incorrectamente fórmulas de ciencias atmosféricas cuando se les plantea un problema sin indicarles explícitamente la fórmula a usar. La propuesta del trabajo es que un ajuste supervisado con unos pocos ejemplos resueltos, seguido de aprendizaje por refuerzo, repara mecanismos que el refuerzo por sí solo no logra corregir.

El modelo parte de Qwen3-8B con el modo de razonamiento (thinking) desactivado y se entrena en dos etapas: primero un epoch de SFT sobre ejemplos resueltos verificados por ejecución, y después DAPO en verl con recompensa por respuesta correcta. Según la model card, esta ruta incrementa en 61 puntos la precisión fuera de régimen en los mecanismos trabajados, comparado con el refuerzo aislado.

Es relevante por su enfoque metodológico: demuestra que unos pocos ejemplos resueltos bien elegidos pueden desbloquear capacidades que el RL no alcanza, y publica código y datos para replicarlo. No es un asistente generalista, sino una herramienta de investigación especializada en un subconjunto de mecanismos atmosféricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B), modo thinking desactivado |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo no documenta cuantizaciones) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-8B, un transformer decoder-only denso de 8.190 millones de parámetros. El ajuste se realiza con el modo de razonamiento desactivado. El entrenamiento consta de dos etapas. La primera es un epoch de SFT sobre "worked examples": cada ejemplo es un programa que el modelo base escribió cuando la fórmula correcta estaba en el prompt, verificado por ejecución y emparejado con el mismo problema pero sin la fórmula. Los mecanismos que el RL aislado no había aprendido recibieron 0, 1, 2 o 4 ejemplos cada uno, asignados aleatoriamente. La segunda etapa es aprendizaje por refuerzo con DAPO implementado en verl, usando recompensa por respuesta correcta, con tasa de aprendizaje 1e-6, 128 problemas por paso con 8 muestras cada uno, y 120 pasos.

Los datos de entrenamiento corresponden al fold 1 de las plantillas del estudio (29 de los 70 mecanismos) con semilla 42. La innovación técnica destacable no es arquitectónica sino metodológica: la combinación de unos pocos ejemplos resueltos verificados por ejecución con RL posterior, y el diseño aleatorizado de cuántos ejemplos recibe cada mecanismo, que permite atribuir la mejora al SFT y no solo al RL. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de programas Python que definen una función `solve()` a partir de un enunciado de problema atmosférico.
- Aplicación de fórmulas de ciencias atmosféricas en problemas de los mecanismos cubiertos por las plantillas de entrenamiento (29 de 70).
- Razonamiento numérico sobre magnitudes físicas (por ejemplo, forzamiento radiativo por CO2).
- Generación de texto conversacional en formato chat (pipeline text-generation).
- Compatible con text-generation-inference y endpoints compatibles según los tags del repo.
- No soporta tool calling ni function calling de forma documentada.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá de la generación de un programa.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Investigación sobre aprendizaje por refuerzo en dominios científicos: el modelo sirve como punto de comparación reproducible para estudiar si el SFT con pocos ejemplos resueltos repara mecanismos que el RL no aprende, usando el código de `atmoscoder_rl/evaluation/` para ejecutar y calificar los programas generados.
- Evaluación de generalización fuera de régimen: permite medir la precisión en problemas de los mismos mecanismos pero planteados sin la fórmula explícita, que es precisamente la métrica que el paper reporta con una mejora de 61 puntos.
- Generación de código científico verificado por ejecución: el modelo devuelve un programa ejecutable, lo que facilita pipelines de validación automática en los que se compara la salida numérica con la esperada.
- Docencia y material didáctico de ciencias atmosféricas: puede generar resoluciones programáticas de problemas de forzamiento radiativo y mecanismos similares para su revisión por un experto.
- Estudio de formatos de prompt: al estar entrenado con un único formato, es útil para analizar la sensibilidad de los modelos ajustados a la plantilla de entrada.
- Reproducción de experimentos: con el repositorio y los datos publicados, sirve para replicar la ruta SFT+RL del estudio y compararla con las otras rutas del mismo trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona una mejora agregada de 61 puntos de precisión fuera de régimen en los mecanismos reparados por esta ruta, pero no desglosa métricas por mecanismo ni ofrece tablas comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda una GPU de 24 GB o más.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 con contexto moderado.
- En GPU de consumo: cabe en RTX 4090 en BF16; en tarjetas de 16 GB requeriría cuantización, que no está documentada en el repo.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference y endpoints compatibles según los tags; no se documenta soporte explícito de vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AtmosRegime-Qwen3-8B-SFT-RL | 8,19 B | no disponible | Formulas atmosfericas (SFT+RL) | apache-2.0 | Hugging Face |
| Qwen/Qwen3-8B (base) | 8,19 B | no disponible en esta ficha | Proposito general | apache-2.0 | Hugging Face |
| Otros modelos de la coleccion AtmosRegime | no disponible | no disponible | Variantes del mismo estudio | apache-2.0 (segun modelo base) | Hugging Face (coleccion) |

La comparación más directa es con el modelo base Qwen3-8B, del que hereda arquitectura y licencia pero del que se diferencia por el ajuste en dos etapas. No se dispone de datos de benchmarks para comparar el rendimiento numérico frente a alternativas.

## Limitaciones y advertencias

- El checkpoint corresponde a un solo fold y una sola semilla de un diseño aleatorizado; los números del paper comparan mecanismos con y sin ejemplos en ambos folds y dos semillas, por lo que este modelo por sí solo no reproduce esos resultados.
- La reparación se demostró en problemas de las mismas plantillas; no se probó si se transfiere a problemas del mismo mecanismo obtenidos de fuentes independientes.
- No es un asistente generalista de ciencias atmosféricas; su uso fuera del formato y los mecanismos entrenados no está validado.
- Entrenado con un único formato de prompt; debe usarse exactamente ese formato y con thinking desactivado, o el comportamiento puede degradarse.
- Solo inglés.
- Riesgo de alucinación en fórmulas y valores numéricos fuera de los mecanismos cubiertos; la verificación por ejecución del programa generado es recomendable en cualquier uso serio.
- Licencia Apache 2.0, igual que el modelo base, sin restricciones adicionales documentadas para uso comercial; aun así, la falta de validación fuera del dominio de entrenamiento desaconseja su uso en producción sin evaluación propia.
- No se documentan sesgos específicos más allá de los heredados del modelo base Qwen3-8B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codercat/AtmosRegime-Qwen3-8B-SFT-RL
- Repositorio de código y datos: https://github.com/acodercat/AtmosRegime
- Colección AtmosRegime: https://huggingface.co/collections/codercat/atmosregime-6af30cd9dd9f6d0865fdb4a5
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
