# mradermacher/StreetChat-GGUF

## Resumen

StreetChat-GGUF es la version cuantizada en formato GGUF del modelo conversacional RoseG/StreetChat, publicada por el usuario mradermacher, conocido en Hugging Face por generar cuantizaciones estaticas de modelos abiertos. El modelo original cuenta con aproximadamente 4.200 millones de parametros (4.205.751.296 segun los pesos en safetensors) y esta orientado a generacion de texto conversacional en ingles. Esta publicacion no entrena ni modifica el modelo en si: se limita a ofrecer los pesos originales en multiples niveles de cuantizacion para facilitar su despliegue en hardware modesto.

La relevancia de esta ficha radica en que agrupa en un unico repositorio un conjunto amplio de variantes GGUF (desde Q2_K hasta f16, ademas de dos ficheros mmproj que sugieren capacidad multimodal), lo que permite ejecutar el modelo con llama.cpp u Ollama en equipos de consumo. El tamano del repositorio, 39,9 GB, se explica por la suma de todas las cuantizaciones disponibles, no por el tamano de una sola.

La informacion publicada por el autor es escasa: no se detallan datos de entrenamiento, arquitectura interna ni resultados de benchmarks. La model card se limita a describir el proceso de cuantizacion y a listar los ficheros, por lo que muchos campos de esta ficha quedan marcados como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, inferido del pipeline conversacional y del uso de transformers) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base original) |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo original RoseG/StreetChat mas alla de que se distribuye a traves de la libreria transformers y que el pipeline es conversacional. El numero de parametros (4.205.751.296) es compatible con un transformer decoder-only de aproximadamente 4B, pero no se confirma el tipo exacto de atencion, el uso de GQA, la funcion de activacion ni la composicion del vocabulario.

Tampoco se documentan los datos de entrenamiento: no se indica el numero de tokens, la mezcla del corpus, ni si hubo fases de ajuste supervisado, RLHF o DPO. La presencia de ficheros `mmproj` en el repositorio sugiere que el modelo podria tener capacidad multimodal (vision), pero la model card no lo confirma ni detalla el proyector. La cuantizacion la realiza mradermacher con su pipeline habitual (convert_type hf, quantize_version 2, output_tensor_quantised 1), y el propio autor indica que en el momento de la publicacion no habia generado variantes con imatrix.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Posible soporte multimodal (vision) por la presencia de ficheros `mmproj`, aunque no confirmado en la documentacion.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que permite servir el modelo mediante infraestructura tipo Hugging Face Inference Endpoints.
- No se documenta soporte explicito de tool calling, function calling, agentes, modo thinking ni audio.
- Capacidades multilingues limitadas al ingles segun el campo `language`.
- No se dispone de informacion sobre razonamiento especializado, codigo o matematicas.

## Casos de uso

- Chat conversacional ligero en local: con cuantizaciones Q4_K_M (2,8 GB) el modelo puede ejecutarse en portatiles con 8 GB de RAM o GPUs de gama media, adecuado para asistentes personales sin conexion.
- Prototipado rapido de aplicaciones de chat: al estar disponible en GGUF y ser compatible con llama.cpp y Ollama, permite integrar un endpoint conversacional en pocos minutos para validar flujos de producto.
- Despliegue en entornos con recursos limitados: las variantes Q2_K (2,0 GB) y Q3_K_S (2,2 GB) permiten ejecucion en dispositivos con poca memoria, utiles para demos en Raspberry Pi o moviles de gama alta.
- Fine-tuning o evaluacion sobre el modelo base: los pesos originales en safetensors (4,2B) permiten ajustar el modelo con LoRA en una unica GPU de 24 GB, usando esta version GGUF solo para inferencia comparativa.
- Servicio de inferencia gestionado: la etiqueta `endpoints_compatible` facilita desplegar el modelo en Hugging Face Inference Endpoints para aplicaciones internas de chat en ingles.
- Experimentacion con modelos multimodales: si se confirma la capacidad de vision a traves de los ficheros `mmproj`, podria usarse para tareas de descripcion de imagenes o VQA en ingles, aunque requiere validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB (Q2_K), 2,8 GB (Q4_K_M), 3,6 GB (Q6_K), 4,6 GB (Q8_0) y 8,5 GB (f16), segun los tamanos de fichero publicados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas (GTX 1650, RTX 3050); 8 GB o mas para Q8_0 (RTX 3060, RTX 4060); A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 6-8 GB de VRAM usando Q4_K_M o Q5_K_M; tambien en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y potencialmente servidores compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere soporte en Hugging Face Inference Endpoints. No se documenta compatibilidad con vLLM o TGI para el formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| StreetChat-GGUF (este) | 4,2B | no disponible | apache-2.0 | GGUF | Cuantizaciones estaticas, sin imatrix |
| RoseG/StreetChat (base) | 4,2B | no disponible | apache-2.0 | safetensors | Modelo original sin cuantizar |
| Otros modelos ~4B en GGUF | ~3-4B | variable | variable | GGUF | No se dispone de comparativa concreta en la informacion proporcionada |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas de la misma categoria. La comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un modelo entrenado principalmente en ingles, es probable que presente sesgos culturales y linguisticos no evaluados.
- Riesgo de alucinacion no cuantificado: no hay benchmarks ni evaluaciones publicadas que permitan estimar la tasa de errores factuales.
- Contexto maximo desconocido: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion de informacion extensa.
- Idioma limitado al ingles; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- La licencia apache-2.0 permite uso comercial, pero el autor de la cuantizacion no ofrece garantias sobre el modelo base ni sobre los datos de entrenamiento originales.
- Las cuantizaciones Q2_K y Q3_K_S degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- No hay variantes imatrix disponibles en el momento de la publicacion, lo que puede reducir la calidad respecto a cuantizaciones ponderadas equivalentes.
- El repositorio ocupa 39,9 GB en total; descargar solo el fichero necesario para evitar consumo innecesario de disco y ancho de banda.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/StreetChat-GGUF
- Modelo base: https://huggingface.co/RoseG/StreetChat
- Pagina de descargas del autor: https://hf.tst.eu/model#StreetChat-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
