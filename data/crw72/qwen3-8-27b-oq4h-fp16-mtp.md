# crw72/Qwen3.8-27B-oQ4h-fp16-mtp

## Resumen

Qwen3.8-27B-oQ4h-fp16-mtp es una cuantización mixta del modelo base Qwen/Qwen3.8-27B, publicada por el usuario crw72 en Hugging Face. El checkpoint está empaquetado en formato MLX (safetensors) para su ejecución en hardware Apple Silicon mediante la librería MLX, y ha sido generado con la herramienta oQ (oMLX v0.8.0), que aplica precisión mixta por tensor en lugar de una cuantización uniforme.

El dato más relevante es la discrepancia entre el nombre del repositorio y el contenido real: aunque la denominación sugiere un modelo de 27B, el recuento de parámetros en safetensors es de 7.212.759.280 (7,21B). El desglose de la model card confirma esta cifra y distribuye los pesos entre el modelo de lenguaje (6,327B), la torre de visión (0,461B) y una cabeza MTP (multi-token prediction) de 0,425B. El checkpoint combina capas en 4, 5, 6 y 8 bits afines con grupos de 64, junto con tensores en FP16, FP32 y U32, con una media efectiva de 20,451 bits por peso.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización mixta poco habitual en el ecosistema MLX; por otro, advierte de que el etiquetado del repositorio no se corresponde con el tamaño real de los pesos, algo crítico para quien planifique el despliegue. No hay información publicada sobre benchmarks, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con torre de visión y cabeza MTP (multi-token prediction); detalles de capas y atención no disponibles |
| Parametros totales | 7.212.759.280 (7,21B) según safetensors; el nombre del repo indica 27B, discrepancia no aclarada |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit (grupo 64), 5-bit (grupo 64), 6-bit (grupo 64), 8-bit (grupo 64), FP16, FP32 y U32; media efectiva 20,451 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 18,5 GB de repositorio; 17,172 GiB de pesos lógicos |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 6,327B | 16,272 GB / 15,155 GiB |
| Visión | 0,461B | 1,843 GB / 1,716 GiB |
| Cabeza MTP | 0,425B | 0,323 GB / 0,301 GiB |
| Total | 7,213B | 18,439 GB / 17,172 GiB |

Distribución por formato de almacenamiento:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 4-bit, grupo 64 | 0,330B | 4,579% | 0,173 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 1,303B | 18,063% | 0,834 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 1,271B | 17,627% | 0,962 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 0,010B | 0,145% | 0,010 GiB | 8,50 |
| FP16 | 0,439B | 6,086% | 0,818 GiB | 16,00 |
| FP32 | 0,461B | 6,388% | 1,716 GiB | 32,00 |
| U32 | 3,398B | 47,111% | 12,659 GiB | 32,00 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen/Qwen3.8-27B más allá de lo que se deduce del checkpoint cuantizado. El desglose de componentes confirma tres bloques funcionales: un modelo de lenguaje de 6,327B de pesos lógicos, una torre de visión de 0,461B y una cabeza MTP de 0,425B. La presencia de visión y de una cabeza de predicción multi-token sugiere un modelo multimodal con decodificación especulativa nativa, pero no se han publicado detalles sobre el número de capas, dimensiones ocultas, mecanismo de atención ni estrategia de fusión visual.

Respecto al entrenamiento, no hay información en la model card sobre el número de tokens, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento. La única información técnica verificable es el proceso de cuantización: oQ (oMLX v0.8.0) aplica precisión mixta asignando distintos niveles de bits por tensor según su sensibilidad, con un resultado de 20,451 bits/peso de media. Llama la atención que el 47,111% de los pesos lógicos se almacenan como U32 (12,659 GiB), lo que sugiere que una parte sustancial del checkpoint corresponde a tensores auxiliares o de estado más que a pesos de cómputo en precisión reducida.

## Capacidades

- Generación de texto y razonamiento: el bloque de lenguaje de 6,327B de pesos lógicos soporta las capacidades del modelo base, aunque no se detallan en la información disponible.
- Procesamiento de visión: la presencia de una torre de visión de 0,461B indica capacidad de entrada de imágenes, si bien no se especifican tareas concretas (VQA, OCR, captioning).
- Predicción multi-token (MTP): la cabeza dedicada de 0,425B apunta a decodificación especulativa o generación de varios tokens por paso, orientada a reducir latencia.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas del repositorio está vacío.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 17,172 GiB de pesos permiten ejecutar el modelo en Macs con memoria unificada de 32 GB o superior, usando la librería MLX y aprovechando la cuantización mixta para reducir el uso de memoria frente a un checkpoint FP16.
- Prototipado de pipelines multimodales en estación de trabajo: la combinación de torre de visión y modelo de lenguaje permite experimentar con tareas imagen-texto en local sin depender de GPU dedicada, siempre que se valide el comportamiento real del checkpoint.
- Evaluación de técnicas de cuantización mixta: el repositorio sirve como caso de estudio para comparar la precisión de oQ (oMLX) frente a cuantizaciones uniformes de 4 y 8 bits sobre el mismo modelo base.
- Investigación sobre decodificación especulativa: la cabeza MTP permite medir la ganancia de throughput de la predicción multi-token en MLX frente a decodificación autoregresiva estándar.
- Pruebas de integración con ecosistema MLX: útil para desarrolladores que quieran validar la carga de safetensors cuantizados con precisión mixta en mlx-lm y herramientas afines.
- Despliegue de bajo consumo en equipos de desarrollo: con 18,5 GB de repositorio, el modelo cabe en portátiles de gama alta con memoria unificada, lo que facilita entornos de prueba sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 17,172 GiB de pesos lógicos más overhead de activaciones y caché KV; con contexto largo, el consumo puede superar los 20 GB.
- Hardware objetivo: Apple Silicon con memoria unificada (M1 Pro/Max, M2 Pro/Max/Ultra, M3 Pro/Max, M4 Pro/Max). No está pensado para GPU NVIDIA o AMD por el formato MLX.
- ¿Cabe en consumer GPU? No en el sentido convencional: el formato MLX no es compatible con CUDA. En Mac, requiere al menos 24-32 GB de memoria unificada según la longitud de contexto.
- Opciones de despliegue: MLX (mlx-lm), oMLX; no disponible para vLLM, llama.cpp, Ollama o TGI sin conversión previa de formato.
- Latencia y throughput: no disponibles; la cabeza MTP sugiere optimización de latencia, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| crw72/Qwen3.8-27B-oQ4h-fp16-mtp | 7,21B (según safetensors) | no disponible | safetensors MLX, cuantización mixta | apache-2.0 | Cuantización oQ con MTP y visión |
| Qwen/Qwen3.8-27B (base) | no disponible (el nombre indica 27B) | no disponible | safetensors | apache-2.0 | Modelo original sin cuantizar |
| Cuantizaciones MLX uniformes 4-bit del mismo base | no disponible | no disponible | safetensors MLX | apache-2.0 | Menor bits/peso medio, mayor pérdida potencial |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Discrepancia de tamaño: el nombre del repositorio indica 27B, pero el recuento real de safetensors es de 7,21B. Cualquier planificación de hardware o coste basada en el nombre será incorrecta.
- Formato propietario del ecosistema: los pesos están en MLX y no se pueden cargar directamente en vLLM, llama.cpp, Ollama o TGI sin conversión.
- Cuantización mixta con posible pérdida de precisión: el 4,579% de los pesos están en 4 bits y el 18,063% en 5 bits; la degradación frente al modelo base no está documentada.
- Proporción elevada de U32: el 47,111% de los pesos lógicos en U32 (12,659 GiB) indica que una parte importante del checkpoint no son pesos de cómputo en baja precisión, lo que reduce la eficiencia esperada de la cuantización.
- Sin datos de benchmarks: no hay evidencia publicada de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, por lo que no se puede validar la calidad del checkpoint.
- Idiomas no declarados: el campo de idiomas está vacío; no se puede asumir soporte multilingüe.
- Riesgo de alucinación y sesgos: no documentados en la model card; aplican los del modelo base, no evaluados aquí.
- Licencia apache-2.0: permite uso comercial, pero el autor de la cuantización no ofrece garantías sobre el comportamiento del checkpoint.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/crw72/Qwen3.8-27B-oQ4h-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
