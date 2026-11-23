# mradermacher/Qwen3.5-0.8B-Heretic-Uncensored-i1-GGUF

## Resumen

Qwen3.5-0.8B-Heretic-Uncensored-i1-GGUF es una cuantizacion GGUF del modelo Peymandc/Qwen3.5-0.8B-Heretic-Uncensored, publicada por el usuario mradermacher. Se trata de una variante "abliterated" o "decensored" del modelo Qwen3.5-0.8B de Alibaba, en la que se ha eliminado (o reducido) el comportamiento de rechazo alineado, manteniendo la arquitectura multimodal vision-language del modelo original. El resultado son pesos de 752.393.024 parametros (aproximadamente 0,8B) empaquetados en formato GGUF con cuantizaciones de tipo i1 (imatrix) para su uso en llama.cpp y entornos compatibles.

La relevancia de esta publicacion es doble. Por un lado, ofrece una via sencilla para ejecutar un modelo vision-language de ~0,8B en hardware de consumo, con ficheros que van desde 0,4 GB (IQ1_S) hasta 0,7 GB (Q5_K_S) en las cuantizaciones listadas. Por otro, la naturaleza "uncensored" del modelo base lo orienta a experimentacion e investigacion sobre alineamiento y comportamiento de rechazo, mas que a despliegues de produccion con requisitos de seguridad. El repositorio acumula 5433 descargas y esta etiquetado como compatible con endpoints.

Conviene subrayar que esta ficha describe la cuantizacion, no el modelo original: los datos de entrenamiento, contexto y benchmarks del Qwen3.5-0.8B subyacente no se detallan en la informacion disponible, y la model card del repositorio se limita a listar los ficheros GGUF generados. La licencia declarada es Apache 2.0, heredada del modelo Qwen original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language (familia Qwen3.5); detalles no disponibles |
| Parametros totales | 752.393.024 (~0,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, Q2_K_S, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, Q4_0, IQ4_XS, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S (y superiores segun la lista de quants del autor) |
| Idiomas soportados | en (segun model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.5 y esta etiquetado como multimodal vision-language, por lo que combina un codificador visual con un decoder de lenguaje; los detalles concretos de la arquitectura (numero de capas, dimensiones, mecanismo de atencion) no se especifican en la informacion disponible. La variante "Heretic-Uncensored" procede de un proceso de abliteration o decensoring aplicado sobre el modelo Qwen3.5-0.8B, orientado a suprimir las respuestas de rechazo. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

La aportacion tecnica de este repositorio es la cuantizacion: mradermacher ha generado cuantizaciones i1 (imatrix) utilizando un fichero imatrix propio, lo que suele mejorar la calidad respecto a cuantizaciones estaticas de tamano equivalente. Se ofrece tambien un repositorio hermano con cuantizaciones estaticas. Al tratarse de un modelo de vision, los ficheros mmproj (proyector multimodal) se alojan en el repositorio estatico, no en este. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo Qwen3.5-0.8B.
- Procesamiento de imagenes (vision-language): el modelo base es multimodal y los ficheros mmproj se distribuyen en el repositorio estatico asociado.
- Comportamiento "uncensored": reduccion o eliminacion del rechazo alineado, orientado a experimentacion.
- Razonamiento basico y generacion de codigo, limitados por el tamano de 0,8B parametros.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Experimentacion con modelos abliterated: util para investigadores que estudian el efecto del decensoring sobre la tasa de rechazo y la calidad de respuesta en un modelo pequeno, comparando directamente con el Qwen3.5-0.8B original.
- Prototipado rapido en local: con ficheros de 0,4-0,7 GB, permite montar un entorno de pruebas de un modelo vision-language en un portatil sin GPU dedicada, usando llama.cpp u Ollama.
- Pruebas de pipelines multimodales: sirve para validar integraciones de vision-language (por ejemplo, descripcion de imagenes o VQA sencillo) antes de escalar a modelos mayores, gracias a su bajo coste de inferencia.
- Evaluacion de cuantizaciones i1: el repositorio permite comparar la degradacion de calidad entre IQ1_S, IQ3_S, Q4_K_M y Q5_K_S sobre la misma base, un caso de estudio util para quien disena estrategias de cuantizacion.
- Generacion de texto en ingles para tareas ligeras: resumenes cortos, clasificacion o reformulacion en entornos con recursos muy limitados, donde un modelo de 0,8B es suficiente.
- Educacion y divulgacion: demostrar en un taller como funciona un modelo multimodal y que implicaciones tiene la abliteration, sin requerir infraestructura de centro de datos.
- Investigacion sobre seguridad y alineamiento: analisis de casos limite y de como un modelo pequeno maneja instrucciones conflictivas tras el proceso de decensoring.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB para las cuantizaciones de 0,4-0,7 GB, mas el consumo del contexto y del proyector multimodal (mmproj) en el caso de vision.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060, RTX 4090); tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base en safetensors es compatible con transformers. La model card no detalla configuraciones para vLLM o TGI, que habitualmente requieren pesos sin cuantizar o formatos especificos.
- Latencia y throughput estimados: no disponible; por el tamano (0,8B) se espera una latencia muy baja en GPU consumer, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Heretic-Uncensored-i1-GGUF (este) | 752M | no disponible | GGUF i1 | Apache 2.0 | Variante abliterated multimodal |
| Qwen3.5-0.8B (original) | ~0,8B | no disponible | safetensors/GGUF | Apache 2.0 | Modelo base alineado, sin decensoring |
| Peymandc/Qwen3.5-0.8B-Heretic-Uncensored | ~0,8B | no disponible | safetensors | Apache 2.0 | Modelo base de esta cuantizacion, sin cuantizar |
| Cuantizaciones estaticas de mradermacher | ~0,8B | no disponible | GGUF estatico | Apache 2.0 | Alternativa sin imatrix, con mmproj incluido |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration/decensoring puede degradar capacidades generales y aumentar la probabilidad de generar contenido inapropiado, ofensivo o factualmente incorrecto.
- Riesgo de alucinacion elevado por el reducido tamano del modelo (0,8B parametros).
- Idiomas: la model card solo declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no documentada; no debe asumirse una ventana larga.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante "uncensored" conlleva riesgos reputacionales y de cumplimiento; conviene revisar las politicas de uso del modelo Qwen original.
- La cuantizacion IQ1_S e IQ1_M esta marcada por el propio autor como "for the desperate" y "mostly desperate": la calidad sera muy baja.
- Los ficheros mmproj para vision no estan en este repositorio, sino en el estatico; sin ellos no se puede usar la modalidad de imagen.
- No se documentan evaluaciones de sesgo ni de seguridad para esta variante.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-0.8B-Heretic-Uncensored-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/Peymandc/Qwen3.5-0.8B-Heretic-Uncensored
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Qwen3.5-0.8B-Heretic-Uncensored-GGUF
- Pagina de resumen de descargas del autor: https://hf.tst.eu/model#Qwen3.5-0.8B-Heretic-Uncensored-i1-GGUF
- Licencia del modelo Qwen original: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
