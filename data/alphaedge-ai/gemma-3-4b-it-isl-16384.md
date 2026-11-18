# alphaedge-ai/gemma-3-4b-it-isl-16384

## Resumen

`gemma-3-4b-it-isl-16384` es una variante "podada" (trimmed) del modelo multimodal `google/gemma-3-4b-it` de Google, publicada por el usuario `alphaedge-ai`. La poda consiste en reducir el vocabulario del tokenizador de 262.144 a 16.384 tokens, seleccionando únicamente los tokens mas frecuentes en un corpus de islandes. El resultado es un modelo un 14,63 % mas pequeno en parametros (de 4.300.079.472 a 3.670.770.032) y con una huella de memoria notablemente inferior, manteniendo la arquitectura original de Gemma 3.

El modelo conserva las capacidades del Gemma 3 4B instruct original (generacion de texto, razonamiento, codigo, soporte multimodal imagen-texto y tool calling), pero esta especializado en islandes. Al eliminar del vocabulario los tokens poco frecuentes en ese idioma, el rendimiento en otras lenguas se degrada de forma significativa, por lo que no debe emplearse como modelo multilingue general.

Es relevante para quienes necesitan desplegar un modelo Gemma 3 de 4B en entornos con recursos limitados y con foco en islandes, ya que reduce el tamano del checkpoint (7,3 GB en el repositorio) y el coste de inferencia asociado a la capa de embeddings y a la cabeza de salida. La licencia es la Gemma Terms of Use, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3), con vocabulario podado |
| Parametros totales | 3.670.770.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el sufijo "16384" del nombre hace referencia al tamano de vocabulario, no al contexto) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repositorio publica pesos safetensors en el `torch_dtype` original |
| Idiomas soportados | islandes (is) |
| Licencia | Gemma Terms of Use (license: gemma) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-4b-it`, un transformer decoder-only multimodal de la familia Gemma 3 (informe tecnico arXiv:2503.19786), capaz de procesar entradas de imagen y texto. Sobre esa base, `alphaedge-ai` aplica la metodologia de *trimming* descrita en el blog de Hugging Face "Introduction to Trimming": se minan los tokens mas frecuentes en un corpus del idioma objetivo y se recorta el vocabulario del tokenizador, eliminando las filas correspondientes de la matriz de embeddings y de la cabeza de salida. Esto reduce el numero de parametros del modelo sin reentrenar el resto de pesos.

El corpus de minado empleado son 200.000 textos del dataset `lbourdois/fineweb-2-trimming`, filtrados para islandes. La reduccion del vocabulario es del 93,75 % (de 262.144 a 16.384 tokens) y la reduccion de parametros totales del 14,63 %. No se indica en la informacion disponible si hubo ajuste fino posterior, RLHF o DPO adicionales tras la poda; el autor senala que el modelo deberia comportarse de forma similar al original en islandes, pero puede degradarse en otros idiomas.

## Capacidades

- Generacion de texto conversacional en islandes, con plantilla de chat (`apply_chat_template`).
- Razonamiento y respuesta a instrucciones heredadas del Gemma 3 4B instruct original.
- Generacion de codigo y matematicas (capacidad heredada del modelo base, aunque el vocabulario podado puede afectar a tokens de programacion poco frecuentes en islandes).
- Procesamiento multimodal imagen-texto (pipeline `image-text-to-text` segun los tags del repositorio).
- Soporte de tool calling / function calling heredado de Gemma 3 instruct.
- Capacidades de agente y razonamiento multi-paso (heredadas, no verificadas especificamente en esta variante podada).
- Capacidades multilingues: limitadas al islandes; el resto de idiomas pierde tokens en el vocabulario.

## Casos de uso

- Atencion al cliente en islandes: el modelo puede gestionar conversaciones multi-turno en islandes con una huella de memoria reducida, adecuado para despliegues en servidores modestos o en el borde.
- Generacion de contenido editorial en islandes: redaccion, resumen y reescritura de textos en islandes con un checkpoint mas ligero que el Gemma 3 4B original.
- Procesamiento de documentos islandeses con OCR + VLM: al conservar la capacidad imagen-texto, puede extraer informacion de imagenes o escaneos con texto en islandes.
- Asistentes locales en dispositivos con GPU de consumo: el menor numero de parametros permite ejecutar el modelo en GPUs consumer con cuantizacion, algo mas ajustado que el original de 4,3B.
- Pipelines de moderacion o clasificacion de texto en islandes: uso como modelo base para tareas de etiquetado o filtrado en ese idioma.
- Experimentacion e investigacion sobre trimming: sirve como caso practico para estudiar el impacto de la poda de vocabulario en el rendimiento por idioma.
- Integracion en TGI / endpoints compatibles: los tags indican compatibilidad con text-generation-inference y endpoints, lo que facilita su despliegue en infraestructura estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 3.670.770.032 parametros, en FP16 el peso ronda los 7,3 GB (coincide con el tamano del repo), y en cuantizacion de 8 bits o 4 bits se reduce aproximadamente a la mitad y a un cuarto respectivamente.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria en GPUs con 8-16 GB de VRAM en cuantizacion, y en A100/H100 para FP16 sin cuantizar.
- GPU consumer: probable en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB con cuantizacion; no confirmado por el autor.
- Opciones de despliegue: transformers (soporte oficial en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se confirma soporte de llama.cpp, Ollama o vLLM en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/gemma-3-4b-it-isl-16384 | 3.670.770.032 | no disponible | islandes | Gemma Terms of Use | Variante podada de Gemma 3 4B, vocabulario de 16.384 tokens |
| google/gemma-3-4b-it | 4.300.079.472 | no disponible en la informacion proporcionada | multilingue | Gemma Terms of Use | Modelo base original, vocabulario de 262.144 tokens |
| Otras variantes trimmed de Gemma 3 4B | variable | no disponible | segun idioma | Gemma Terms of Use | Misma metodologia de poda aplicada a otros idiomas |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El vocabulario podado elimina tokens no frecuentes en islandes; el rendimiento en otros idiomas se degrada de forma significativa, como advierte el propio autor.
- Posible degradacion en tareas que requieran tokens de codigo, matematicas o nombres propios poco frecuentes en el corpus de minado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas para esta variante.
- Sesgos: no documentados en la informacion disponible; se heredan los del modelo base Gemma 3.
- Licencia Gemma Terms of Use: restricciones para uso comercial y obligaciones de atribucion; el modelo no esta afiliado ni respaldado por Google.
- El sufijo "16384" del nombre alude al tamano de vocabulario, no a la longitud de contexto; no debe confundirse.
- No se confirma el soporte de herramientas de despliegue distintas de transformers y TGI.
- Modelo con muy pocas descargas (8) y sin likes en el momento de la consulta; no hay validacion comunitaria del rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-isl-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog "Introduction to Trimming": https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Informe tecnico Gemma 3: https://arxiv.org/abs/2503.19786
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
