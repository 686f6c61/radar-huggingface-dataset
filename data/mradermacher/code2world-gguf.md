# mradermacher/Code2World-GGUF

## Resumen

Code2World es un modelo de lenguaje de aproximadamente 8.190 millones de parametros desarrollado por GD-ML, distribuido originalmente en HuggingFace bajo licencia MIT. La version aqui descrita es una cuantizacion GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo esta etiquetado como conversacional y multimodal (incluye ficheros `mmproj` para un proyector visual), lo que sugiere capacidades de vision ademas de generacion de texto. Su nombre, "Code2World", indica un enfoque hacia la generacion de codigo y la traduccion entre representaciones de codigo y descripciones del mundo, aunque la model card original no detalla el pipeline ni los datos de entrenamiento.

La relevancia actual de esta ficha radica en que ofrece una via practica para desplegar un modelo de ~8B en entornos locales con cuantizaciones desde Q2_K (3,4 GB) hasta f16 (16,5 GB), cubriendo desde GPUs de gama media hasta estaciones de trabajo. Al estar basado en GD-ML/Code2World y cuantizado por mradermacher, se beneficia de la infraestructura de este ultimo para formatos GGUF optimizados.

No se dispone de informacion publica sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada, por lo que varios apartados de esta ficha indican explicitamente "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, segun el formato de pesos y la libreria transformers) |
| Parametros totales | 8.190.735.360 (~8,19 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj en f16 y Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base GD-ML/Code2World. Los metadatos indican que se distribuye a traves de la libreria `transformers` y que el modelo cuantizado conserva la estructura de un transformer estandar, dado que los ficheros GGUF generados por mradermacher siguen el esquema habitual de llama.cpp. No se especifica si emplea atencion lineal, decodificacion especulativa, mezcla de expertos ni ninguna otra innovacion arquitectonica. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o instruccion supervisada.

El unico dato tecnico relevante sobre el proceso de cuantizacion es que mradermacher indica que las cuantizaciones ponderadas/imatrix "parecen no estar disponibles por mi parte en este momento", lo que implica que las versiones publicadas son cuantizaciones estaticas sin matriz de importancia. Esto puede suponer una ligera perdida de calidad frente a variantes imatrix en tamanos equivalentes, especialmente en las cuantizaciones de menor bitrate (Q2_K, Q3_K_S). La presencia de ficheros `mmproj` en f16 y Q8_0 confirma que el modelo incorpora un proyector multimodal compatible con llama.cpp, orientado a entrada de imagenes.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Capacidades multimodales: los ficheros `mmproj` indican soporte de entrada de imagenes (vision) a traves del proyector multimodal.
- Enfoque declarado hacia codigo: el nombre Code2World sugiere tareas de generacion, traduccion o interpretacion de codigo, aunque no se detallan las tareas exactas.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integracion en servicios de inferencia.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, modo thinking ni capacidades de audio.
- Capacidades multilingues limitadas al ingles segun la etiqueta `language: en`.

## Casos de uso

- Asistente de codigo local en estaciones de trabajo: con cuantizaciones Q4_K_M (5,1 GB) o Q5_K_M (6,0 GB) puede ejecutarse en GPUs de consumo de 8-12 GB de VRAM y emplearse para autocompletado, explicacion y refactorizacion de codigo en entornos sin conexion.
- Procesamiento de documentacion tecnica con imagenes: gracias al proyector `mmproj`, puede recibir capturas de diagramas, interfaces o diagramas de arquitectura y generar descripciones o codigo asociado, util para equipos que documentan sistemas visualmente.
- Prototipado rapido de pipelines de vision-lenguaje: al ser un GGUF con soporte multimodal en llama.cpp, sirve para validar integraciones de imagen y texto antes de escalar a modelos mayores.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT permite uso comercial, modificacion y redistribucion sin las restricciones de licencias tipo Llama, lo que lo hace adecuado para productos derivados.
- Educacion e investigacion: su tamano de ~8B y la disponibilidad de cuantizaciones desde 3,4 GB permiten experimentar en portatiles con GPU modesta o incluso en CPU con llama.cpp, facilitando la docencia sobre modelos multimodales.
- Generacion de codigo en pipelines de CI/CD: puede integrarse como paso de revision o generacion de fragmentos en herramientas de build, siempre que se valide su salida, dado que no hay benchmarks publicados que garanticen su calidad en tareas de codigo.
- Chatbot de soporte tecnico en ingles: su etiqueta conversacional y su tamano contenido permiten servir conversaciones multi-turno en una unica GPU, aunque se desconoce la ventana de contexto efectiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (pesos + overhead de contexto y KV cache):
  - Q2_K (3,4 GB): ~4-5 GB de VRAM.
  - Q3_K_M (4,2 GB): ~5-6 GB.
  - Q4_K_M (5,1 GB): ~6-7 GB.
  - Q5_K_M (6,0 GB): ~7-8 GB.
  - Q6_K (6,8 GB): ~8-9 GB.
  - Q8_0 (8,8 GB): ~10-11 GB.
  - f16 (16,5 GB): ~18-20 GB.
  - Proyector multimodal adicional: 0,9 GB (Q8_0) o 1,3 GB (f16).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 (24 GB) para cuantizaciones altas con contexto amplio; A100/H100 para f16 y despliegues concurrentes.
- Cabe en GPU de consumo: si, desde Q2_K en GPUs de 6 GB (con contexto reducido) hasta Q8_0 en GPUs de 12-16 GB. La version f16 requiere 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el modelo base es compatible con transformers y con endpoints compatibles.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Code2World (esta ficha) | ~8,19 B | no disponible | MIT | GGUF, safetensors | Multimodal (mmproj), solo ingles |
| Llama 3.1 8B | 8 B | 128 K | Llama 3.1 Community | safetensors, GGUF | Multilingue, amplio ecosistema, benchmarks publicos |
| Qwen2.5 7B | 7,6 B | 128 K | Apache 2.0 | safetensors, GGUF | Multilingue, buen rendimiento en codigo |
| Mistral 7B v0.3 | 7,2 B | 32 K | Apache 2.0 | safetensors, GGUF | Referencia en 7B, sin vision en la version base |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks publicados de Code2World. Frente a Llama 3.1 8B y Qwen2.5 7B, Code2World ofrece licencia MIT (mas permisiva que Llama) y soporte multimodal via mmproj, pero carece de documentacion sobre contexto y de evaluaciones publicas, lo que dificulta una comparacion de rendimiento rigurosa.

## Limitaciones y advertencias

- No hay benchmarks publicados: no es posible verificar su calidad en codigo, matematicas o razonamiento frente a alternativas.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Longitud de contexto desconocida: limita la planificacion de casos de uso con documentos largos o conversaciones extensas.
- Riesgo de alucinacion: inherente a los modelos de ~8B sin evaluacion publica; requiere validacion en produccion.
- Cuantizaciones estaticas sin imatrix: las versiones de baja bitrate (Q2_K, Q3_K_S) pueden degradar notablemente la calidad.
- Sesgos: no documentados por el autor; al desconocerse el dataset de entrenamiento, no se pueden evaluar sesgos de genero, raza o dominio.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar que el modelo base GD-ML/Code2World no imponga restricciones adicionales no reflejadas en los metadatos.
- Modelo cuantizado por un tercero: la responsabilidad sobre la calidad de la cuantizacion recae en mradermacher, no en el autor original.
- Soporte multimodal dependiente del cliente: requiere llama.cpp u otro runtime con soporte de `mmproj`; no todos los servidores lo implementan.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/mradermacher/Code2World-GGUF
- Modelo base: https://huggingface.co/GD-ML/Code2World
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Code2World-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
