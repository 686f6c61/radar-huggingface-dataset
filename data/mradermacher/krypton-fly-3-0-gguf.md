# mradermacher/Krypton-Fly-3.0-GGUF

## Resumen

Krypton-Fly-3.0 es un modelo de lenguaje multimodal desarrollado por myjellylabs, orientado a tareas de razonamiento, generacion de codigo, uso de terminal y deep research. Esta ficha documenta concretamente la version cuantizada en formato GGUF publicada por mradermacher, un contribuidor habitual de la comunidad que genera cuantizaciones estaticas de modelos abiertos para su uso con llama.cpp y herramientas compatibles.

El modelo base cuenta con 8.953.803.264 parametros (aproximadamente 9B) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La model card del autor incluye etiquetas que indican capacidades multimodales, entrenamiento con DPO y soporte para ingles y hindi. El repositorio GGUF incluye un fichero mmproj (proyector multimodal) en dos precisiones, lo que confirma el soporte de entrada de imagenes.

La relevancia de esta publicacion radica en que facilita el despliegue local del modelo en hardware de consumo mediante cuantizaciones que van desde Q2_K (4,0 GB) hasta f16 (18,0 GB), con opciones intermedias recomendadas como Q4_K_M (5,8 GB) y Q8_0 (9,6 GB). No se dispone de informacion detallada sobre la longitud de contexto ni sobre los datos de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer multimodal, segun etiquetas) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, hi |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors via transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. Las etiquetas del repositorio indican que se trata de un modelo multimodal con capacidades de razonamiento, codigo, terminal y deep research, y que ha pasado por una fase de entrenamiento con DPO (Direct Preference Optimization). El repositorio incluye ficheros mmproj, lo que confirma la presencia de un proyector multimodal para el procesamiento de imagenes junto con el modelo de lenguaje.

El modelo base fue publicado por myjellylabs y posteriormente cuantizado por mradermacher mediante un proceso de conversion a formato HF y cuantizacion estatica (quantize_version 2, output_tensor_quantised 1). No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni detalles sobre la innovacion tecnica empleada.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento (etiqueta "reasoning" en el repositorio).
- Generacion y asistencia en codigo (etiqueta "coding").
- Uso de terminal y ejecucion de comandos (etiqueta "terminal").
- Deep research, orientado a tareas de investigacion y sintesis de informacion.
- Procesamiento multimodal de imagenes mediante el proyector mmproj incluido.
- Entrenamiento con DPO, orientado a alinear las respuestas con preferencias humanas.
- Soporte de ingles y hindi.

## Casos de uso

- Asistencia en programacion dentro del IDE: el modelo puede generar y explicar codigo en ingles, integrarse mediante llama.cpp u Ollama y usarse como copiloto local en entornos con GPU de consumo.
- Automatizacion de tareas de terminal: gracias a su etiqueta "terminal", puede interpretar y proponer comandos de shell, lo que permite construir agentes de operaciones que ejecuten tareas de administracion de sistemas con supervision humana.
- Investigacion y sintesis documental: su orientacion a "deep research" lo hace adecuado para resumir y contrastar fuentes en flujos de trabajo de analisis, siempre que se valide la salida por riesgo de alucinacion.
- Procesamiento de documentos con imagenes: al incluir proyector multimodal, puede extraer informacion de capturas, diagramas o formularios escaneados en pipelines de digitalizacion.
- Despliegue local en estaciones de trabajo: con cuantizaciones de 4 a 6 GB (Q2_K a Q5_K_M) cabe en GPU de consumo como RTX 3060 de 12 GB o RTX 4070, lo que permite prototipado sin depender de la nube.
- Atencion al cliente en ingles e hindi: el soporte bilingue permite atender consultas en ambos idiomas en mercados donde el hindi es relevante, con la salvedad de que no se documenta soporte de castellano.
- Evaluacion de modelos y experimentacion academica: al ser Apache 2.0 y estar disponible en GGUF, es util para reproducir experimentos de cuantizacion y comparar calidad entre precisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,0 GB.
  - Q3_K_M: ~4,8 GB.
  - Q4_K_M: ~5,8 GB (recomendado por el autor como rapido y de buena calidad).
  - Q5_K_M: ~6,6 GB.
  - Q6_K: ~7,5 GB.
  - Q8_0: ~9,6 GB.
  - f16: ~18,0 GB.
  - Proyector multimodal adicional: 0,7 GB (Q8_0) o 1,0 GB (f16).
- GPU recomendadas: para Q4_K_M o Q5_K_M basta una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070; para Q8_0 se recomienda una RTX 4080/4090 o una A100/H100 en entornos de servidor; para f16 se necesita al menos 24 GB de VRAM (RTX 3090/4090, A100 40 GB).
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones de 4 a 6 bits.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base admite transformers. No se documenta soporte especifico para vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas del modelo base que permitan una comparativa rigurosa. A continuacion se indican alternativas de tamano similar (aproximadamente 8-9B) con licencia permisiva, sin comparar rendimiento al no haber benchmarks publicados:

| Modelo | Parametros | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|
| Krypton-Fly-3.0 | ~9B | no disponible | Apache 2.0 | Si (mradermacher) |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community | Si |
| Qwen2.5 7B | 7B | 128K | Apache 2.0 | Si |
| Mistral 7B v0.3 | 7B | 32K | Apache 2.0 | Si |

## Limitaciones y advertencias

- Solo se documentan los idiomas ingles y hindi; no hay soporte declarado de castellano, lo que limita su uso en produccion en espanol.
- No se dispone de informacion sobre la longitud de contexto, lo que impide garantizar conversaciones largas o procesamiento de documentos extensos.
- Riesgo de alucinacion inherente a los modelos de ~9B, especialmente en tareas de deep research y generacion de codigo; se recomienda validacion humana.
- No se han publicado benchmarks, por lo que no es posible verificar empiricamente las capacidades declaradas en las etiquetas.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_S, Q4_K_M y Q8_0.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base podria tener condiciones adicionales no reflejadas en la informacion disponible; conviene revisar la model card del modelo base.
- El repositorio GGUF tiene un tamano de 83,4 GB por incluir todas las cuantizaciones; la descarga debe hacerse fichero a fichero.
- No hay informacion sobre sesgos conocidos ni sobre el proceso de filtrado del dataset de entrenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Krypton-Fly-3.0-GGUF
- Modelo base: https://huggingface.co/myjellylabs/Krypton-Fly-3.0
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Krypton-Fly-3.0-i1-GGUF
- Pagina de descarga del autor: https://hf.tst.eu/model#Krypton-Fly-3.0-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
