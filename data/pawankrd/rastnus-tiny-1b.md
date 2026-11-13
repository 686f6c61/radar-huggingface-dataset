# PawanKrd/RastNus-Tiny-1B

## Resumen

RastNus-Tiny-1B (ڕاستنووس, "escritura correcta") es un modelo de 1.030.933.022 parámetros especializado en corrección gramatical, ortográfica y de puntuación en kurdo central (sorani, código ISO `ckb`). Lo desarrolla PawanKrd y se distribuye con licencia Apache 2.0. Parte de `google/gemma-4-E2B`, sobre el que se aplicó un ajuste fino orientado a corrección en kurdo, seguido de una poda estructural hasta aproximadamente 1B de parámetros y una fase de recuperación de calidad mediante destilación de conocimiento. El resultado es el miembro más pequeño de la familia RastNus, pensado para corrección de altas prestaciones y bajo coste.

El modelo cubre un nicho poco atendido: la mayoría de los correctores ortográficos neuronales se centran en inglés o en lenguas con muchos recursos, mientras que el kurdo sorani cuenta con pocos modelos dedicados y de calidad. RastNus-Tiny-1B se posiciona como una alternativa ligera que cabe en GPUs de consumo y hardware de borde (unos 2 GB de pesos en bf16), con un rendimiento declarado por el autor de aproximadamente 6.000 tokens por segundo en lote con vLLM sobre una sola GPU.

La relevancia actual del modelo reside en su relación entre tamaño, coste de despliegue y especialización: al ser un modelo derivado de Gemma 4 con poda y destilación, busca conservar parte de la capacidad del modelo base original con una huella mucho menor, lo que facilita su integración en herramientas de edición, plataformas educativas o pipelines de normalización de texto en kurdo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Gemma 4 E2B, podada estructuralmente) |
| Parametros totales | 1.030.933.022 |
| Parametros activos | No disponible (el modelo base Gemma 4 E2B es de tipo MoE; el autor no especifica cuántos parámetros activos conserva tras la poda) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el autor menciona pesos en bf16; no se listan cuantizaciones publicadas) |
| Idiomas soportados | Kurdo central / sorani (`ckb`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se construye sobre `google/gemma-4-E2B`, un transformer decoder-only de la familia Gemma 4. El proceso de creación descrito por el autor consta de tres etapas: primero un ajuste fino supervisado sobre datos de corrección en kurdo central (errores gramaticales, ortográficos y de puntuación); después una poda estructural que reduce el modelo hasta aproximadamente 1B de parámetros; y finalmente una fase de recuperación de calidad mediante destilación de conocimiento desde el modelo original. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

El autor destaca el carácter "pruned" y "distillation" del modelo como sus innovaciones principales: la poda reduce el coste de inferencia y el tamaño de los pesos, mientras que la destilación trata de mitigar la pérdida de capacidad que normalmente acompaña a una reducción tan agresiva del número de parámetros. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en kurdo central (sorani), con foco en tareas de corrección.
- Corrección gramatical: detección y reparación de errores de concordancia, flexión y sintaxis en kurdo sorani.
- Corrección ortográfica: normalización de grafías y formas léxicas incorrectas.
- Restauración de puntuación: inserción y corrección de signos de puntuación en texto plano.
- Corrección de texto integral: combinación de las tres tareas anteriores sobre un mismo fragmento.
- Formato conversacional: el modelo se etiqueta como "conversational", por lo que admite interacción por turnos.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante infraestructura de inferencia estándar de Hugging Face.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Corrección de textos administrativos en kurdo: integrado en un editor o en un servicio de API, el modelo recibe un párrafo en sorani y devuelve la versión corregida ortográfica y gramaticalmente, lo que resulta útil para organismos que publican documentación oficial en kurdo central.
- Normalización de corpus para investigación lingüística: antes de entrenar otros modelos o de construir corpus anotados, se pasa el texto por RastNus-Tiny-1B para homogeneizar grafías y puntuación, reduciendo el ruido en el dataset.
- Asistencia a la escritura en educación: un plugin de corrector en tiempo real para estudiantes de sorani, donde el tamaño reducido del modelo permite desplegarlo en servidores modestos o incluso en hardware de borde.
- Moderación y limpieza de contenido generado por usuarios: normalización de comentarios y publicaciones en kurdo antes de almacenarlos o analizarlos, aprovechando el alto throughput declarado (unos 6.000 tokens/s en lote con vLLM).
- Preprocesado en pipelines de traducción automática: corregir el texto de entrada en kurdo antes de pasarlo a un sistema de traducción kurdo-español o kurdo-inglés, de modo que los errores ortográficos no degraden la traducción.
- Publicación editorial y periodismo: revisión automatizada de borradores en sorani en redacciones digitales, con el modelo como primera pasada de corrección antes de la revisión humana.
- Servicio de corrección por lotes: al ser un modelo de 1B con pesos de unos 2 GB en bf16, puede ejecutarse en una sola GPU para procesar grandes volúmenes de texto nocturnos a bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara un rendimiento aproximado de 6.000 tokens por segundo en lote con vLLM sobre una sola GPU, sin especificar el hardware exacto ni las condiciones de la medición.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB para los pesos en bf16, según el autor; en fp32 serían unos 4 GB, y en cuantizaciones de 8 o 4 bits podría reducirse por debajo de 1-2 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: el modelo cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o superiores; para despliegue en producción con vLLM se recomiendan GPUs de datacenter como A100 o H100 por su mayor throughput en lote.
- Cabe en GPU de consumo: sí, con holgura, dado el reducido tamaño de los pesos.
- Opciones de despliegue: transformers (librería nativa), vLLM (mencionado explícitamente por el autor), y previsiblemente TGI u otros servidores compatibles con safetensors; no se confirma soporte de llama.cpp, GGUF u Ollama en la información disponible.
- Latencia y throughput: el autor declara aproximadamente 6.000 tokens/s en lote con vLLM en una sola GPU; no se especifican latencias individuales ni el hardware exacto de la medición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| RastNus-Tiny-1B | 1.030.933.022 | No disponible | Kurdo central (ckb) | Apache 2.0 | Poda + destilación desde Gemma 4 E2B; especializado en corrección |
| google/gemma-4-E2B | No disponible en la información | No disponible | Multilingüe (no detallado) | Gemma 4 License | Modelo base del que deriva; mayor tamaño y capacidades generales |
| Correctores ortográficos clásicos (p. ej. Hunspell) | No aplica (basados en diccionario) | No aplica | Depende del diccionario | Varía (GPL, LGPL, etc.) | No usan redes neuronales; menor capacidad para gramática y contexto |

No se dispone de datos de benchmarks ni de otros modelos neuronales comparables específicos para corrección en kurdo central en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado únicamente para kurdo central (sorani); no debe esperarse un rendimiento útil en kurdo kurmanji, en otros idiomas o en tareas generales de generación.
- Riesgo de alucinación: como todo modelo generativo, puede introducir cambios no solicitados en el texto, alterar el significado o "corregir" formas que en realidad eran válidas; se recomienda revisión humana en contextos críticos.
- Sesgos: no se documentan sesgos específicos, pero el modelo hereda los del corpus de ajuste fino y del modelo base Gemma 4, cuyo dataset no se detalla.
- Limitaciones de contexto: la longitud de contexto no está especificada, por lo que no se puede garantizar el comportamiento en documentos largos.
- Licencia: aunque la model card declara Apache 2.0, el campo `license_link` apunta a la licencia de Gemma 4 de Google; conviene verificar los términos aplicables antes de un uso comercial, dado que el modelo deriva de Gemma 4.
- Madurez: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, sin benchmarks publicados, por lo que su calidad en producción no está validada de forma independiente.
- Sin cuantizaciones publicadas: no se ofrecen versiones GGUF ni cuantizadas, lo que limita el despliegue en entornos sin GPUs o con herramientas como llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PawanKrd/RastNus-Tiny-1B
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Perfil del autor: https://huggingface.co/PawanKrd
- Sitio del autor: https://pawan.krd
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia Gemma 4 (referenciada en la model card): https://ai.google.dev/gemma/docs/gemma_4_license
