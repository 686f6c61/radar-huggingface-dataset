# Kadabra/Test-gascon-Qwen3.5-4b-Instruct-SFT-sans-CPT

## Resumen

Kadabra/Test-gascon-Qwen3.5-4b-Instruct-SFT-sans-CPT es un modelo de 4.205.751.296 parametros (aproximadamente 4,2 mil millones) publicado por el usuario Kadabra en HuggingFace, distribuido en formato GGUF para su uso con llama.cpp. El nombre del repositorio indica que se trata de un ajuste supervisado (SFT) sobre una base Qwen3.5 de 4B en su variante Instruct, orientado al gascon (variante del occitano hablada en Gascuna, suroeste de Francia) y realizado sin fase de preentrenamiento continuado (CPT), segun la coletilla "sans-CPT" del identificador.

El repositorio incluye la etiqueta vision-language-model y un fichero de proyeccion multimodal (`mmproj`), lo que apunta a que el modelo conserva capacidades de vision heredadas de la base, ademas de las puramente textuales. Se distribuye en tres variantes de cuantizacion: BF16, Q4_K_M y Q6_K. El tamano total del repositorio es de 6,8 GB.

Se trata, por el momento, de un modelo sin traccion en la comunidad: registra 0 descargas y 0 likes, fue creado y actualizado el 7 de octubre de 2026 con apenas 31 segundos de diferencia, y no incluye model card detallada, licencia declarada ni idiomas soportados. Es, por tanto, un artefacto experimental publicado como "Test" mas que un modelo listo para produccion, y debe evaluarse con esa cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3_5` sugiere la familia Qwen3.5; el tag `vision-language-model` indica componente multimodal, con fichero `mmproj`) |
| Parametros totales | 4.205.751.296 (≈4,2 B) |
| Parametros activos | no aplica / no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q4_K_M, Q6_K (todas en GGUF) |
| Idiomas soportados | no disponible; el nombre indica adaptacion al gascon |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); fichero adicional `mmproj` en BF16 para el proyector multimodal. Los metadatos de HuggingFace reportan el recuento de parametros a partir de safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura en la documentacion proporcionada. El tag `qwen3_5` y el identificador del repositorio apuntan a que el modelo deriva de una base de la familia Qwen3.5 en su version de 4B e Instruct, presumiblemente un transformer denso con mecanismos de atencion estandar, aunque no se confirma ni el tipo de atencion, ni el numero de capas, ni la dimension oculta, ni la presencia de atencion lineal o hibrida.

Respecto al entrenamiento, la unica informacion explicita es la del propio identificador: se ha aplicado un ajuste supervisado (SFT) y se ha prescindido de la fase de preentrenamiento continuado (CPT) en el idioma objetivo. El tag `unsloth` confirma que el flujo de trabajo utilizo las herramientas de Unsloth, tanto para el entrenamiento como para la conversion a GGUF. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras fases de alineamiento posteriores al SFT. El tag `vision-language-model` y la presencia de `mmproj` sugieren que el ajuste preserva el encoder visual de la base, pero no se detalla si la supervision incluyo datos de imagen-texto.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational`.
- Capacidades de razonamiento y generacion de codigo: no confirmadas explicitamente, heredadas en su caso de la base Qwen3.5 Instruct.
- Capacidades multimodales (vision-lenguaje): el tag `vision-language-model` y el fichero `mmproj` indican soporte de entrada de imagen, invocable mediante `llama-mtmd-cli`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no declaradas. La unica indicacion idiomatica es la orientacion al gascon que sugiere el nombre del repositorio.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Uso como endpoint compatible: el tag `endpoints_compatible` indica que puede servirse a traves de interfaces compatibles con la API de endpoints (por ejemplo, servidores compatibles con OpenAI sobre llama.cpp), aunque no se detalla la configuracion.

## Casos de uso

- Procesamiento de lengua gascona: normalizacion ortografica, traduccion castellano-gascon o frances-gascon y generacion de texto en esta variante del occitano. Es el escenario que justifica el propio nombre del modelo, aunque la ausencia de CPT en el idioma hace previsible un dominio limitado y obliga a una evaluacion previa.
- Digitalizacion de documentos historicos: gracias al componente multimodal (`mmproj`) y a `llama-mtmd-cli`, puede plantearse la lectura y transcripcion asistida de manuscritos o impresos antiguos en gascon, combinando OCR y normalizacion linguistica en un unico paso.
- Aumentacion de corpus linguisticos: generacion de datos sinteticos en gascon para ampliar corpus de entrenamiento o de evaluacion en proyectos de PLN de bajos recursos, siempre con revision humana posterior.
- Atencion al cliente en lenguas minorizadas: despliegue de un asistente conversacional que responda en occitano o gascon en administraciones locales o servicios regionales, ejecutable en local para cumplir requisitos de soberania de datos.
- Asistente conversacional en el borde (edge): con Q4_K_M el modelo ocupa del orden de 2,6 GB, lo que permite ejecutarlo en portatiles sin GPU dedicada o en mini-PC mediante llama.cpp u Ollama, con latencia aceptable para chat de baja concurrencia.
- Investigacion linguistica y anotacion asistida: etiquetado morfosintactico preliminar, lematizacion o generacion de glosas en estudios dialectologicos sobre el gascón, usando el modelo como preanotador antes de la revision del linguista.
- Prototipado rapido de pipelines multimodales: al ser un GGUF pequeno con soporte de vision, sirve como banco de pruebas para validar integraciones de llama.cpp con entrada de imagen antes de escalar a modelos mayores.
- Experimentacion academica sobre SFT sin CPT: dado que el modelo explicita en su nombre la ausencia de preentrenamiento continuado, resulta util como punto de comparacion en estudios que midan el impacto del CPT en la adaptacion a lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada solo para pesos (sin cache KV ni proyector):
  - Q4_K_M: aproximadamente 2,6 GB.
  - Q6_K: aproximadamente 3,5 GB.
  - BF16: aproximadamente 8,4 GB.
- Cache KV adicional: proporcional a la longitud de contexto efectiva, que no se ha publicado; en ausencia de ese dato no puede dimensionarse con precision.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM puede alojar las variantes cuantizadas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). Para la variante BF16 se recomienda un minimo de 12-16 GB (RTX 4080/4090, A10, L4). A100 y H100 son sobredimensionadas para 4,2 B de parametros, salvo por requisitos de concurrencia masiva.
- Cabe en GPU de consumo: si, en las variantes Q4_K_M y Q6_K, en practicamente cualquier GPU moderna con 8 GB o mas. La variante BF16 tambien cabe en GPUs de consumo de gama alta con 16 GB o mas.
- Opciones de despliegue:
  - llama.cpp, mediante `llama-cli` para texto (`llama-cli -hf Kadabra/Test-gascon-Qwen3.5-4b-Instruct-SFT-sans-CPT --jinja`) y `llama-mtmd-cli` para multimodal.
  - Ollama o LM Studio, importando los GGUF publicados.
  - vLLM o TGI: compatibles en principio con los pesos safetensors originales, pero no con los ficheros GGUF de este repositorio; requeririan los pesos sin cuantizar.
  - Endpoints compatibles con API de OpenAI, segun el tag `endpoints_compatible` (tipicamente via `llama-server`).
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

La comparativa se establece frente a modelos de la misma categoria de tamano (3-4 B). Los datos del modelo evaluado son los unicos verificados en la informacion proporcionada; los de los modelos de referencia corresponden a sus especificaciones publicas habituales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| Kadabra/Test-gascon-Qwen3.5-4b-Instruct-SFT-sans-CPT | 4,2 B | no disponible | no disponible | GGUF (BF16, Q4_K_M, Q6_K) | no disponible |
| Qwen3-4B (referencia de familia) | ≈4,0 B | 32.768 tokens nativos | Apache 2.0 | safetensors, GGUF, multiples quantizaciones | publicado por el autor de la base |
| Gemma 3 4B | ≈4,3 B | 128.000 tokens | licencia Gemma (uso comercial con condiciones) | safetensors, GGUF | publicado por el autor de la base |
| Llama 3.2 3B Instruct | ≈3,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | publicado por el autor de la base |

No es posible comparar el rendimiento del modelo evaluado porque no se han publicado resultados de benchmarks ni evaluaciones independientes en la informacion disponible. La ventaja diferencial potencial frente a las alternativas es la adaptacion al gascon, no cubierta especificamente por ninguno de los modelos de referencia.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay descripcion de datos de entrenamiento, hiperparametros, metodologia de evaluacion ni limitaciones declaradas por el autor.
- Licencia no disponible: no puede asumirse uso comercial libre. Es imprescindible contactar con el autor o localizar la licencia de la base Qwen3.5 antes de cualquier despliegue productivo.
- Idiomas no declarados: no se especifica que lenguas cubre el modelo ni en que proporcion. El ajuste al gascon, inferido del nombre, no esta confirmado ni cuantificado.
- Riesgo elevado de alucinacion en el idioma objetivo: al haberse realizado SFT sin preentrenamiento continuado (segun el propio identificador "sans-CPT"), es esperable una cobertura lexica y gramatical limitada en gascon, con tendencia a generar formas hibridas o directamente en frances, castellano o catalan.
- Modelo sin validacion comunitaria: 0 descargas y 0 likes, con creado y actualizado el mismo dia, lo que sugiere que no ha pasado por revision externa.
- Ausencia de benchmarks: no hay ninguna cifra que permita estimar calidad, por lo que cualquier uso en produccion exige una evaluacion propia previa.
- Longitud de contexto desconocida: imposibilita dimensionar la cache KV y planificar tareas de contexto largo.
- Riesgo de sesgos: no evaluado ni declarado. Los sesgos heredados de la base Qwen3.5 y los introducidos por el dataset de SFT (de composicion desconocida) no han sido auditados.
- Capacidades de tool calling, agentes y modo de razonamiento no confirmadas: no deben asumirse en un pipeline sin verificacion previa.
- Nombre con prefijo "Test": indica caracter experimental. No se recomienda su uso en entornos productivos sin una validacion exhaustiva.
- Fecha de publicacion futura respecto a referencias habituales (octubre de 2026): conviene verificar la vigencia y el estado del repositorio antes de depender de el.

## Enlaces

- HuggingFace: https://huggingface.co/Kadabra/Test-gascon-Qwen3.5-4b-Instruct-SFT-sans-CPT
- Unsloth (herramienta de conversion a GGUF citada en la model card): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia implicito por el formato GGUF y los comandos `llama-cli` y `llama-mtmd-cli`): https://github.com/ggml-org/llama.cpp

No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios auxiliares o demos.
