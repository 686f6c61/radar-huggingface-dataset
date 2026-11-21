# Jundot/gemma-4-31B-it-oQ8e-mtp

## Resumen

gemma-4-31B-it-oQ8e-mtp es una cuantización de precisión mixta en formato MLX del modelo google/gemma-4-31B-it, desarrollada por el usuario Jundot mediante la herramienta oQ (oMLX v0.8.0). El modelo base es un transformer denso de 30,7B parámetros de la familia Gemma 4 de Google DeepMind, con entrada de texto e imagen, modos de razonamiento configurables y una ventana de contexto de 256K tokens. Esta versión cuantizada conserva el backbone de lenguaje, el codificador visual y una cabeza de predicción multi-token (MTP) fusionada desde google/gemma-4-31B-it-assistant.

La relevancia de este checkpoint radica en que reduce el peso del modelo a 8,746 bits por peso de media (32,319 GiB de almacenamiento frente a los aproximadamente 61 GB que ocuparía en BF16), manteniendo una precisión superior a una cuantización uniforme de 8 bits gracias a una asignación de bits guiada por la sensibilidad medida de cada capa. Está pensado para ejecutarse en hardware Apple Silicon a través del framework MLX, lo que lo hace útil para desarrolladores que quieren desplegar un modelo multimodal de 31B en estaciones de trabajo Mac con memoria unificada.

La licencia declarada es Apache-2.0, si bien la model card remite a la licencia específica de Gemma 4 de Google, lo que conviene verificar antes de un uso comercial. El repositorio acumula 839 descargas y fue actualizado el 19 de noviembre de 2026 con una recuantización que reduce el error de cuantización al mismo tamaño y velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + imagen) con cabeza MTP |
| Parametros totales | 31.742.607.472 (31,743B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | oQ8e mixta: affine 8-bit grupo 64 (96,722% de los pesos) + BF16 (3,278%); 8,500 bits/peso en el backbone y 8,746 bits/peso en el checkpoint completo |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (sujeta a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors (MLX), 34,7 GB de repositorio |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 30,7B parámetros con codificador visual integrado, lo que le permite procesar entradas image-text-to-text. Incorpora modos de pensamiento (thinking modes) configurables y una ventana de contexto de 256K tokens. Esta versión cuantizada añade una cabeza de predicción multi-token (MTP) de 0,470B parámetros fusionada desde el modelo asistente de Gemma 4, lo que habilita decodificación especulativa y por tanto un aumento del throughput de generación.

La cuantización oQ8e asigna bits según la sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y aplica un reajuste de escala y sesgo por mínimos cuadrados ponderados. El resultado son 30,702B pesos lógicos en affine 8-bit con grupo 64 (30,381 GiB) y 1,040B en BF16 (1,938 GiB). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text).
- Procesamiento de contexto largo de hasta 256K tokens.
- Decodificación especulativa mediante la cabeza MTP fusionada, que acelera la generación.
- Capacidades multilingües: no se especifican los idiomas soportados.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Análisis de documentos extensos con imágenes: el modelo puede procesar contratos, informes o papers de hasta 256K tokens junto con sus figuras y tablas, extrayendo conclusiones que combinan texto e información visual.
- Asistencia técnica sobre capturas de pantalla: un desarrollador puede enviar una imagen de un error junto con el contexto del código y obtener un diagnóstico fundamentado, gracias al codificador visual integrado.
- Procesamiento por lotes en estaciones de trabajo Mac: con 32,319 GiB de almacenamiento, el checkpoint cabe en equipos Apple Silicon con memoria unificada de 64 GB o superior, permitiendo inferencia local sin GPU dedicada mediante MLX.
- Generación aumentada por recuperación (RAG) con contexto largo: la ventana de 256K tokens permite inyectar grandes volúmenes de documentación recuperada sin truncar, útil en bases de conocimiento internas.
- Prototipado de asistentes multimodales: la cabeza MTP acelera la decodificación, lo que resulta adecuado para iterar rápidamente en demos interactivas de chat con imágenes.
- Investigación en cuantización: el checkpoint sirve como referencia para estudiar el impacto de la cuantización mixta oQ8e frente a cuantizaciones uniformes de 8 bits en tareas multimodales.
- Evaluación de modelos en entornos con restricciones de privacidad: al ejecutarse localmente en MLX, los datos de texto e imagen no salen del dispositivo, lo que encaja en sectores regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Almacenamiento: 34,7 GB de repositorio; 32,319 GiB de pesos en memoria.
- VRAM o memoria unificada estimada: al menos 40 GB para cargar el checkpoint completo con margen para el contexto; 64 GB o más recomendable para contextos largos.
- GPU recomendadas: no aplica GPU CUDA; el formato MLX está orientado a Apple Silicon (M2 Ultra, M3 Max, M4 Max y superiores con memoria unificada amplia). Para GPU NVIDIA sería necesario convertir el modelo a otro formato, no disponible en este repositorio.
- ¿Cabe en GPU de consumo? No en GPUs consumer de 24 GB; sí en configuraciones Apple Silicon de gama alta con 64 GB o más de memoria unificada.
- Opciones de despliegue: MLX y oMLX; no se proporcionan instrucciones para vLLM, llama.cpp, Ollama o TGI, y el formato safetensors MLX no es directamente compatible con ellos.
- Latencia y throughput: no disponibles; la cabeza MTP está diseñada para mejorar la velocidad de decodificación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/gemma-4-31B-it-oQ8e-mtp | 31,743B | 256K | safetensors MLX, 8,746 bits/peso | Apache-2.0 (Gemma 4) | Hugging Face, 839 descargas |
| google/gemma-4-31B-it | 30,7B | 256K | safetensors BF16 | Apache-2.0 (Gemma 4) | Hugging Face (modelo base) |
| google/gemma-4-31B-it-assistant | 0,470B (cabeza MTP) | No disponible | safetensors | No disponible | Hugging Face (origen de la cabeza MTP) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Al ser una cuantización de 8 bits, puede presentar una degradación ligera de precisión frente al modelo base en BF16, especialmente en tareas de razonamiento matemático o código.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de este checkpoint.
- No se especifican los idiomas soportados, por lo que el rendimiento en castellano no está documentado.
- La licencia Apache-2.0 remite a la licencia Gemma 4 de Google; es necesario revisar sus términos antes de un uso comercial, ya que pueden imponer restricciones adicionales.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable directamente a ecosistemas CUDA sin conversión.
- El modelo base es denso, por lo que el coste de inferencia es proporcional a los 31,7B parámetros, sin las ventajas de eficiencia de una arquitectura MoE.
- La model card advierte de que las copias anteriores al 19 de noviembre de 2026 deben descargarse de nuevo para beneficiarse del redondeo oQe refinado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/gemma-4-31B-it-oQ8e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo asistente (cabeza MTP): https://huggingface.co/google/gemma-4-31B-it-assistant
- Repositorio de oQ/oMLX: https://github.com/jundot/omlx
- Pull request de mejora oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
