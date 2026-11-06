# karlsencoin/Karlsen-Gemma-4-26B-A4B-abliterated-GGUF

## Resumen

Karlsen-Gemma-4-26B-A4B-abliterated-GGUF es una cuantizacion en formato GGUF del modelo huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated, que a su vez deriva de la familia Gemma 4 de Google en su variante instruct con arquitectura Mixture-of-Experts de 26B parametros totales y aproximadamente 4B parametros activos por token (de ahi el sufijo A4B). El autor de la publicacion es karlsencoin y la cuantizacion ha sido generada por mradermacher mediante tecnicas de imatrix y quantizacion ponderada, orientadas a preservar la calidad en bitrates bajos.

El modelo hereda la modificacion "abliterated" aplicada por huihui-ai sobre la version instruct original, un proceso de edicion de pesos que elimina o atenua la direccion de rechazo en el espacio de activaciones para reducir las negativas del modelo ante determinadas peticiones. El resultado es un modelo descensurado orientado a generacion conversacional y usos donde el filtrado estandar resulta limitante.

La relevancia practica de esta publicacion radica en que ofrece multiples niveles de cuantizacion (desde IQ1_S de 8,4 GB hasta Q6_K y superiores) en formato GGUF con fichero imatrix incluido, lo que permite ejecutar un modelo de 25.233.142.046 parametros en hardware de consumo mediante llama.cpp u Ollama, manteniendo el caracter multimodal (vision) que el autor indica para el modelo base. La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a los terminos especificos de Gemma 4 de Google, lo que introduce ambiguedad legal relevante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), base Gemma 4 |
| Parametros totales | 25.233.142.046 (25,23B) |
| Parametros activos | Aproximadamente 4B (denominacion A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, entre otras; cuantizacion i1 con imatrix |
| Idiomas soportados | ingles (declarado) |
| Licencia | Apache 2.0 (con license_link a Gemma 4 License de Google) |
| Formato de pesos | GGUF (cuantizado); fichero imatrix incluido |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Gemma 4 en su variante Mixture-of-Experts de 26B parametros totales con aproximadamente 4B activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. La publicacion de karlsencoin no aporta detalles adicionales sobre el numero de tokens de entrenamiento, la composicion del dataset ni el pipeline de alineacion (RLHF, DPO u otros); esa informacion corresponderia a la model card original de Gemma 4 de Google, no incluida en la informacion disponible.

La innovacion tecnica diferencial de esta publicacion es el proceso de cuantizacion: mradermacher ha generado los ficheros GGUF con quantizacion ponderada e imatrix (importance matrix), un metodo que estima la importancia de cada tensor mediante calibracion y preserva mejor la calidad en cuantizaciones agresivas. El autor indica que es un modelo de vision y que los ficheros mmproj, si existen, se alojan en el repositorio estatico de mradermacher. La modificacion abliterated se aplica sobre la version instruct y consiste en la ablacion de la direccion de rechazo en el espacio de activaciones, lo que altera el comportamiento de seguridad original del modelo.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento y respuesta a instrucciones en formato instruct (sufijo it en el modelo base).
- Capacidades de vision segun la model card del autor, con ficheros mmproj en el repositorio estatico de mradermacher.
- Comportamiento descensurado: la ablacion reduce los rechazos del modelo ante peticiones que el modelo original declinaria.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere integracion con APIs compatibles con OpenAI.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado; no se confirma soporte de castellano.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en hardware de consumo: con cuantizaciones Q4_K_M (16,9 GB) o Q4_K_S (15,6 GB) el modelo puede ejecutarse en GPUs con 16-24 GB de VRAM mediante llama.cpp u Ollama, aprovechando que solo ~4B parametros estan activos por token para mantener velocidades de generacion razonables.
- Investigacion sobre alineacion y seguridad: el caracter abliterated permite estudiar el comportamiento del modelo sin las capas de rechazo, util para analisis academicos de direcciones de activacion y mecanismos de negativa en modelos MoE.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido donde el filtrado estandar del modelo instruct resulta limitante, siempre que el uso cumpla la legislacion aplicable.
- Procesamiento de documentos con vision: si se descargan los ficheros mmproj del repositorio estatico, el modelo puede abordar tareas de descripcion de imagenes o extraccion de informacion visual en pipelines locales.
- Despliegue en entornos con recursos limitados: las cuantizaciones IQ3_S (12,3 GB) o IQ4_XS (14,0 GB) permiten servir el modelo en una unica GPU de 16 GB, adecuado para prototipos y entornos de desarrollo.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye mas de veinte variantes de cuantizacion con el fichero imatrix, lo que facilita estudios de degradacion de calidad frente a tamano en modelos MoE.
- Experimentacion con endpoints compatibles: el tag endpoints_compatible permite integrarlo en infraestructuras que consumen APIs estilo OpenAI sin reescribir el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: IQ1_S ~8,4 GB; IQ2_M ~10,5 GB; IQ3_S ~12,3 GB; IQ4_XS ~14,0 GB; Q4_K_S ~15,6 GB; Q4_K_M ~16,9 GB; Q5_K_S ~18,1 GB; Q6_K y superiores por encima de 20 GB.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4_K_M y Q5_K_S; RTX 4080 / 4070 Ti Super (16 GB) para IQ3_S e IQ4_XS; A100 40/80 GB o H100 para cuantizaciones altas y contextos largos.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con Q4_K_M o Q5_K_S, y en GPUs de 16 GB con cuantizaciones IQ3/IQ4.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag endpoints_compatible sugiere tambien servidores con API estilo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser MoE con ~4B activos, se espera un throughput superior al de un denso de 26B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Karlsen-Gemma-4-26B-A4B-abliterated-GGUF | 25,23B | ~4B | no disponible | Apache 2.0 (con enlace a Gemma 4 License) | GGUF | Version abliterated cuantizada con imatrix |
| huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated | 25,23B | ~4B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva esta publicacion |
| mradermacher/Huihui-gemma-4-26B-A4B-it-abliterated-GGUF | 25,23B | ~4B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas del mismo modelo base |
| mradermacher/Huihui-gemma-4-26B-A4B-it-abliterated-i1-GGUF | 25,23B | ~4B | no disponible | Apache 2.0 | GGUF | Cuantizaciones i1 con imatrix; misma base tecnica que esta publicacion |

## Limitaciones y advertencias

- La modificacion abliterated elimina o atenua los mecanismos de rechazo del modelo original, lo que incrementa el riesgo de generar contenido danino, ofensivo o ilegal; el despliegue en produccion exige filtros externos y supervision.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para esta variante.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y podria degradarse notablemente.
- Ambiguedad de licencia: el campo license indica Apache 2.0, pero el license_link apunta a los terminos de Gemma 4 de Google, que imponen restricciones adicionales de uso comercial y de redistribucion; conviene revisar ambos textos antes de un uso comercial.
- La cuantizacion introduce perdida de calidad, especialmente en las variantes IQ1/IQ2 (el propio autor las califica como "for the desperate" o "mostly desperate").
- El repositorio ocupa 300,9 GB, lo que requiere planificacion de almacenamiento y ancho de banda para la descarga.
- No hay informacion sobre longitud de contexto, tool calling ni modo thinking, lo que limita la planificacion de casos de uso avanzados.
- El modelo base es un derivado no oficial de Gemma 4; no cuenta con el respaldo de Google y su comportamiento puede diferir del modelo original.
- Con 77 descargas y 0 likes en el momento de la consulta, la validacion comunitaria es practicamente nula.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/karlsencoin/Karlsen-Gemma-4-26B-A4B-abliterated-GGUF
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated
- Cuantizaciones estaticas de mradermacher: https://huggingface.co/mradermacher/Huihui-gemma-4-26B-A4B-it-abliterated-GGUF
- Cuantizaciones i1 con imatrix de mradermacher: https://huggingface.co/mradermacher/Huihui-gemma-4-26B-A4B-it-abliterated-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Huihui-gemma-4-26B-A4B-it-abliterated-i1-GGUF
- Licencia Gemma 4 de Google: https://ai.google.dev/gemma/docs/gemma_4_license
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
