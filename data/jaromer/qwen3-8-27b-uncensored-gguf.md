# jaromer/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una serie de cuantizaciones GGUF del modelo Qwen3.8-27B de Alibaba, publicada por el usuario jaromer en HuggingFace. El modelo base es un transformer multimodal de 27 320 millones de parámetros con arquitectura `Qwen3_5ForConditionalGeneration`, 64 capas, vocabulario de 248 320 tokens, soporte de visión y una ventana de contexto de 262 144 tokens. La versión publicada aquí aplica una técnica de abliteración para reducir sustancialmente los comportamientos de rechazo del modelo original, manteniendo intactas el resto de capacidades.

La relevancia de esta publicación radica en tres aspectos: primero, preserva el cabezal de predicción multi-token (MTP) que permite decodificación especulativa integrada; segundo, ofrece seis niveles de cuantización con matriz de importancia calculada directamente sobre los pesos f16; y tercero, documenta de forma transparente la metodología de abliteración y la verificación de los tensores MTP. El resultado es un modelo útil para entornos de producción donde se necesita un LLM con menos restricciones de contenido, sin sacrificar las capacidades de razonamiento, visión o código del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer multimodal con MTP) |
| Parametros totales | 27 320 697 856 (27,32 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 64 capas con atención completa, diseñado para tareas de texto e imagen. Incluye un cabezal de predicción multi-token (MTP) de una capa que actúa como modelo draft para decodificación especulativa, acelerando la generación sin degradar la calidad. La versión uncensored se obtiene mediante abliteración con la herramienta Heretic, que minimiza conjuntamente el numero de rechazos y la divergencia KL respecto al modelo base, sin fine-tuning ni datos de entrenamiento adicionales. El proceso se ejecuta en bf16 y los pesos resultantes se fusionan en el modelo base; los tensores `mtp.*` se copian literalmente del checkpoint original para garantizar su integridad. La matriz de importancia (imatrix) se calcula sobre el modelo f16 con 200 fragmentos de wikitext-2, y todas las cuantizaciones se generan con llama.cpp en la revision `a94d563ed`.

El entrenamiento original del modelo base no se detalla en la informacion proporcionada, pero se sabe que Qwen3.8-27B incluye capacidades de razonamiento, vision y agente, con un contexto de 262 144 tokens. La abliteracion no modifica los datos de entrenamiento ni la arquitectura, solo ajusta las proyecciones de atencion y MLP en la pila principal para eliminar direcciones de rechazo.

## Capacidades

- Generacion de texto y chat conversacional multiturmo en ingles y chino.
- Razonamiento complejo y resolucion de problemas en multiples dominios.
- Generacion de codigo y asistencia en programacion.
- Capacidades de vision: entrada de imagenes (si el modelo base incluye torre de vision, segun indica la model card).
- Decodificacion especulativa integrada gracias al cabezal MTP, que actua como draft interno en los archivos fusionados.
- Soporte de tool calling y uso de funciones, heredado del modelo base Qwen3.8-27B.
- Capacidades de agente y razonamiento multi-paso, segun la documentacion de Unsloth para Qwen3.8.
- Comportamiento de rechazo sustancialmente reducido respecto al modelo base, manteniendo el resto de capacidades intactas.

## Casos de uso

- Asistente de desarrollo de software sin restricciones: el modelo puede generar codigo, explicar arquitecturas y depurar errores en conversaciones largas, aprovechando los 262 144 tokens de contexto para mantener el historial completo de un repositorio o sesion de trabajo.
- Analisis de documentos extensos con entrada visual: gracias a la ventana de contexto amplia y la capacidad de vision, puede procesar documentos largos que incluyan imagenes, diagramas o capturas de pantalla, resumiendo y extrayendo informacion relevante.
- Chatbot de atencion al cliente en chino e ingles con tono menos restrictivo: la reduccion de rechazos permite manejar consultas sobre temas delicados o polemicos que otros modelos evitarian, manteniendo la coherencia conversacional.
- Generacion de contenido creativo y narrativo: la abliteracion facilita la escritura de ficcion, guiones o material con tematicas adultas o controvertidas que los modelos censurados bloquean.
- Investigacion academica sobre alineacion y sesgos: el proceso de abliteracion documentado permite estudiar como la eliminacion de direcciones de rechazo afecta al comportamiento del modelo, utilizando las cuantizaciones como base experimental.
- Despliegue en entornos con recursos limitados: las cuantizaciones IQ2_M (10,6 GB) e IQ4_XS (15,3 GB) permiten ejecutar el modelo en GPUs de consumo con 16 GB de VRAM, manteniendo una perplexidad cercana a la del modelo f16.
- Prototipado rapido con Ollama o llama.cpp: los archivos GGUF son directamente compatibles con estos runtime, facilitando la integracion en aplicaciones locales sin necesidad de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para esta version uncensored en la informacion disponible. La model card solo incluye mediciones de perplexidad en wikitext-2, que se resumen a continuacion:

| Archivo | PPL (wikitext-2) | Diferencia vs f16 |
|---|---|---|
| f16 (baseline, no publicado) | 7,1557 ± 0,25104 | - |
| Q5_K_M | 7,1573 ± 0,25055 | +0,0016 |
| IQ4_XS | 7,1583 ± 0,25019 | +0,0026 |
| Q6_K | 7,1689 ± 0,25149 | +0,0132 |
| Q8_0 | 7,1764 ± 0,25195 | +0,0207 |
| Q4_K_M | 7,1814 ± 0,25227 | +0,0257 |
| IQ2_M | 7,8581 ± 0,27481 | +0,7024 |

El autor advierte que las diferencias entre cuantizaciones, excepto IQ2_M, caen dentro del error estandar y no son estadisticamente significativas. La perplexidad solo detecta dano grave por cuantizacion y no mide razonamiento, codigo ni comportamiento de rechazo. No hay datos comparativos con otros modelos uncensored.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (solo pesos, sin overhead de KV cache):
  - IQ2_M: ~10,6 GB
  - IQ4_XS: ~15,3 GB
  - Q4_K_M: ~16,8 GB
  - Q5_K_M: ~19,5 GB
  - Q6_K: ~22,4 GB
  - Q8_0: ~29,0 GB
- GPUs recomendadas:
  - Para IQ2_M e IQ4_XS: RTX 4080/4090 (16-24 GB) o equivalentes de AMD con 16 GB.
  - Para Q4_K_M y Q5_K_M: RTX 4090 (24 GB) o A100 40 GB.
  - Para Q6_K y Q8_0: A100 80 GB, H100 o multiples GPUs.
- Cabe en GPU de consumo: si, las cuantizaciones IQ2_M, IQ4_XS y Q4_K_M caben en una RTX 4090 (24 GB) con espacio para contexto parcial. Para contexto completo de 262 144 tokens se necesitaria mucha mas VRAM.
- Opciones de despliegue: llama.cpp (incluido llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. El archivo draft separado permite usar `--model-draft` en llama.cpp.
- Latencia y throughput: no disponibles. La decodificacion especulativa con MTP deberia mejorar el throughput respecto al modelo sin draft, pero no se proporcionan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | MTP | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,32 B | 262 144 | si | si | Apache 2.0 | safetensors |
| jaromer/Qwen3.8-27B-Uncensored-GGUF | 27,32 B | 262 144 | si | si | Apache 2.0 | GGUF |
| JonathanColetti/Qwen3.8-27B-Uncensored-GGUF | 27,32 B | 262 144 | no disponible | no disponible | Apache 2.0 | GGUF |
| mradermacher/Qwen3.8-27B-Uncensored-GGUF | 27,32 B | 262 144 | no disponible | no disponible | Apache 2.0 | GGUF |

No se dispone de datos de rendimiento comparativo entre estas variantes. La principal diferencia de la version de jaromer es la verificacion explicita de los tensores MTP y la publicacion de la imatrix, ademas de la metodologia documentada de abliteracion. Las otras versiones pueden haber aplicado tecnicas similares sin la misma transparencia.

## Limitaciones y advertencias

- La abliteracion reduce el comportamiento de rechazo de forma sustancial pero no lo elimina por completo; algunos prompts pueden seguir siendo bloqueados.
- El proceso de abliteracion puede degradar ligeramente la calidad en tareas de razonamiento o alineacion, aunque la model card afirma que las capacidades no cambian.
- El cabezal MTP fue entrenado contra el modelo sin abliterar, por lo que la tasa de aceptacion del draft puede caer ligeramente; la verificacion de cada token contra el modelo objetivo garantiza que la calidad de salida no se ve afectada.
- Solo soporta ingles y chino; no hay garantias de rendimiento en otros idiomas.
- El uso comercial esta permitido bajo licencia Apache 2.0, pero el modelo puede generar contenido inapropiado o danino debido a la reduccion de rechazos; el responsable del despliegue debe asumir ese riesgo.
- Las cuantizaciones IQ2_M muestran una perplexidad significativamente peor que el resto y no se recomiendan para tareas que requieran precision.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica que es una publicacion reciente sin validacion de la comunidad.
- La arquitectura `Qwen3_5ForConditionalGeneration` es relativamente nueva y puede no estar soportada por todas las versiones de llama.cpp; se recomienda usar la revision indicada o posterior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jaromer/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de abliteracion Heretic: https://github.com/p-e-w/heretic
- Documentacion de Qwen3.8 en Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Guia de ejecucion local de Qwen3.8-27B: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Variante similar de JonathanColetti: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF
- Variante similar de mradermacher: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-GGUF
- Dataset wikitext usado para imatrix y perplexity: https://huggingface.co/datasets/Salesforce/wikitext
