# mradermacher/pai-bloom-1b1-text2prompt-sd-v2-GGUF

## Resumen

pai-bloom-1b1-text2prompt-sd-v2 es un modelo de lenguaje especializado en la generacion de prompts para modelos de difusion estable (Stable Diffusion). Desarrollado originalmente por el equipo de Alibaba PAI y distribuido en formato GGUF por mradermacher, el modelo parte de la arquitectura BLOOM con 1.450 millones de parametros y esta afinado especificamente para transformar instrucciones breves en prompts detallados y descriptivos aptos para generacion de imagenes.

La version aqui documentada es una cuantizacion estatica en formato GGUF del modelo original, publicada el 19 de diciembre de 2024. mradermacher ofrece un rango completo de cuantizaciones que van desde Q2_K (0,8 GB) hasta f16 (3,0 GB), lo que permite desplegar el modelo en hardware muy modesto, incluidas CPU y GPUs de gama baja. El modelo esta liberado bajo licencia Apache 2.0, lo que facilita su uso comercial sin restricciones significativas.

Su relevancia actual radica en la creciente necesidad de automatizar la ingenieria de prompts para pipelines de generacion de imagenes. En lugar de que el usuario tenga que escribir prompts complejos manualmente, este modelo actua como intermediario que expande una idea simple en un prompt rico en detalles visuales, estilo, iluminacion y composicion, mejorando la calidad de salida de los modelos de difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (BLOOM) |
| Parametros totales | 1.450.665.984 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors/PyTorch (modelo base) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura BLOOM, un transformer decoder-only con atencion causal estandar. Con 1.450 millones de parametros, se situa en la gama de modelos pequenos optimizados para tareas especificas. El modelo original fue desarrollado por Alibaba PAI como un afinamiento de BLOOM-1b1 para la tarea concreta de text2prompt orientada a Stable Diffusion v2.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset de afinamiento ni si se emplearon tecnicas de RLHF o DPO en la informacion proporcionada. La model card del repositorio GGUF no incluye estos detalles, ya que se limita a documentar el proceso de cuantizacion. Las cuantizaciones fueron generadas con el formato GGUF estandar de llama.cpp, empleando cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf). No se generaron cuantizaciones ponderadas con imatrix para este modelo.

## Capacidades

- Generacion de texto especializada en la expansion de instrucciones breves en prompts detallados para modelos de difusion estable.
- Transformacion de descripciones simples en prompts ricos en vocabulario visual: estilo artistico, iluminacion, composicion, calidad y detalles tecnicos de fotografia o ilustracion.
- Generacion de texto autoregresiva estandar heredada de la arquitectura BLOOM.
- Soporte limitado al idioma ingles; no se documenta capacidad multilingue.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad de razonamiento general limitada por su tamano (1,45B parametros); su rendimiento optimo se circunscribe a la tarea de generacion de prompts.

## Casos de uso

- Automatizacion de pipelines de generacion de imagenes: el modelo recibe una instruccion breve del usuario (por ejemplo, "un gato en un tejado") y genera un prompt detallado que se pasa directamente a Stable Diffusion, mejorando la calidad y coherencia del resultado sin intervencion manual.
- Interfaces de usuario simplificadas para herramientas de IA generativa: permite ofrecer a usuarios no tecnicos un campo de texto simple, traduciendo internamente sus ideas a prompts profesionales que el modelo de difusion interpreta correctamente.
- Generacion por lotes de variaciones de prompts: en produccion de contenido visual a escala, el modelo puede generar multiples variaciones de un mismo concepto base para explorar diferentes estilos, iluminaciones y composiciones de forma automatizada.
- Prototipado rapido en estudios de diseno: los disenadores pueden describir conceptos de forma coloquial y obtener prompts tecnicos que alimenten flujos de generacion de imagenes para moodboards y exploracion conceptual.
- Educacion y formacion en ingenieria de prompts: el modelo sirve como herramienta didactica para mostrar como se estructura un prompt eficaz para modelos de difusion, comparando la entrada del usuario con la salida expandida.
- Integracion en plugins de herramientas creativas: dado su reducido tamano (desde 0,8 GB en Q2_K), puede embeberse en aplicaciones de escritorio o extensiones de software de diseno que necesiten generar prompts localmente sin depender de APIs externas.
- Despliegue en entornos con recursos limitados: al caber en CPU y en GPUs de gama baja, es adecuado para prototipos, demos y herramientas internas donde no se dispone de infraestructura de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 1 GB con cuantizacion Q2_K (0,8 GB de pesos) hasta unos 3,5-4 GB con f16 (3,0 GB de pesos), incluyendo overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las cuantizaciones de mayor calidad; las cuantizaciones Q4_K_M (1,1 GB) funcionan holgadamente en GPUs de 6-8 GB como la RTX 3060, RTX 4060 o superiores. Tambien es viable en GPUs profesionales (A100, H100) aunque el modelo no aprovechara su capacidad.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1650 4 GB en adelante) e incluso en CPU gracias al formato GGUF.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, text-generation-webui, LM Studio). El modelo base en formato PyTorch/transformers puede servirse con vLLM o TGI, aunque para 1,45B parametros el despliegue GGUF es mas eficiente en recursos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el reducido tamano, se espera una latencia baja en GPU consumer, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| pai-bloom-1b1-text2prompt-sd-v2 (este) | 1,45B | no disponible | Apache 2.0 | GGUF, safetensors | Text2prompt para Stable Diffusion |
| BLOOM-1b1 (base) | 1,1B | 2048 tokens | BigScience RAIL | safetensors | Generacion de texto general |
| GPT-2 large | 0,77B | 1024 tokens | MIT | safetensors | Generacion de texto general |
| TinyLlama-1.1B | 1,1B | 2048 tokens | Apache 2.0 | GGUF, safetensors | Generacion de texto general |

La comparativa directa con alternativas especializadas en text2prompt es limitada, ya que se trata de una tarea de nicho. Frente a los modelos de proposito general de tamano similar, este modelo sacrifica versatilidad a cambio de un rendimiento superior en la generacion de prompts visuales. No se dispone de datos de benchmarks que permitan comparar rendimiento cuantitativo con estas alternativas.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en ingles; las instrucciones en castellano u otros idiomas produciran resultados de menor calidad o directamente incorrectos.
- Riesgo de alucinacion: como todo modelo generativo, puede producir prompts con elementos inexistentes o incoherentes respecto a la instruccion original, especialmente con entradas ambiguas o muy cortas.
- Sesgos conocidos: al derivar de BLOOM, puede heredar sesgos presentes en los datos de entrenamiento del modelo base, incluyendo sesgos de genero, culturales y de representacion en las descripciones visuales generadas.
- Limitacion de contexto: no se documenta la longitud de contexto en la informacion disponible, lo que dificulta planificar el uso con instrucciones largas.
- Especializacion estrecha: su utilidad fuera de la generacion de prompts para difusion es limitada; no es adecuado como modelo de proposito general, asistente conversacional ni generador de codigo.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones significativas, pero se recomienda verificar las condiciones del modelo base original de Alibaba PAI por si existieran terminos adicionales no reflejados en el repositorio GGUF.
- En produccion, conviene validar la calidad de los prompts generados antes de enviarlos a modelos de difusion, ya que un prompt deficiente puede degradar la calidad de la imagen resultante.
- No se han publicado cuantizaciones ponderadas con imatrix para este modelo, lo que puede suponer una ligera perdida de calidad en las cuantizaciones de menor bitrate respecto a alternativas con imatrix.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/pai-bloom-1b1-text2prompt-sd-v2-GGUF
- Modelo base original: https://huggingface.co/alibaba-pai/pai-bloom-1b1-text2prompt-sd-v2
- Pagina de descargas del autor: https://hf.tst.eu/model#pai-bloom-1b1-text2prompt-sd-v2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
