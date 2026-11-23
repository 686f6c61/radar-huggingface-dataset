# mradermacher/Qwen3.8-27B-Heretic-Abliterated-GGUF

## Resumen

Qwen3.8-27B-Heretic-Abliterated-GGUF es la version cuantizada en formato GGUF del modelo catonooka/Qwen3.8-27B-Heretic-Abliterated, un derivado de la familia Qwen3.8 de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) que ha sido sometido a un proceso de "abliteration" y "heretic" para eliminar los mecanismos de rechazo y moderacion del modelo original. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de versiones GGUF de modelos abiertos, que distribuye tanto cuantizaciones estaticas (este repositorio) como versiones con imatrix en un repositorio hermano.

El modelo resuelve el problema de desplegar un LLM de gran tamano en hardware de consumo o en entornos con recursos limitados, ofreciendo un rango amplio de cuantizaciones que van desde Q2_K (11,3 GB) hasta Q8_0 (29,1 GB). Al estar en formato GGUF, es compatible con llama.cpp, Ollama y otras herramientas de inferencia local, lo que facilita su uso fuera de infraestructuras con GPUs de datacenter.

La relevancia actual del modelo radica en dos factores: por un lado, la demanda de modelos "uncensored" o "abliterated" para investigacion sobre alineamiento, seguridad y comportamiento de LLMs; por otro, la necesidad de versiones cuantizadas que permitan ejecutar modelos de 27B en GPUs consumer. No obstante, la informacion publicada es escasa: no se detallan datos de entrenamiento, benchmarks ni la longitud de contexto, y la licencia "qwen-community" impone restricciones que deben revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Qwen3.8, presumiblemente transformer decoder-only; no confirmado en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones imatrix en repositorio separado |
| Idiomas soportados | en (segun la model card); no se detallan mas idiomas |
| Licencia | qwen-community (license: other, con license_link a LICENSE) |
| Formato de pesos | GGUF (safetensors disponibles en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Por el nombre y el tamano (27,3 B), se trata presumiblemente de un transformer decoder-only de la familia Qwen3.8, pero no se confirma en la model card ni en los metadatos. El modelo base es catonooka/Qwen3.8-27B-Heretic-Abliterated, que a su vez deriva de un modelo Qwen3.8 de 27B sometido a tecnicas de abliteration (eliminacion de direcciones de activacion asociadas al rechazo) y "heretic" (proceso automatizado de ablacion de comportamiento no deseado). No se especifican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO adicionales tras la ablacion.

La innovacion tecnica principal de este repositorio no esta en el modelo en si, sino en el trabajo de cuantizacion: mradermacher aplica cuantizaciones estaticas (no imatrix) en este repositorio, con una version con imatrix disponible por separado en mradermacher/Qwen3.8-27B-Heretic-Abliterated-i1-GGUF. Las cuantizaciones IQ (como IQ4_XS) suelen ofrecer mejor relacion calidad/tamano que las K-quants de tamano similar, segun las notas del propio autor. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni arquitecturas hibridas.

## Capacidades

- Generacion de texto conversacional en ingles, segun la model card y la etiqueta "conversational".
- Comportamiento "uncensored" y "abliterated": el modelo ha sido modificado para reducir o eliminar los rechazos ante peticiones que el modelo original rechazaria. Esta es la caracteristica diferencial del modelo.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere que puede desplegarse detras de APIs compatibles con el formato de Hugging Face.
- Capacidad de razonamiento y codigo: no confirmada explicitamente en la informacion proporcionada, aunque es esperable en un modelo de 27B de la familia Qwen; no se aportan datos que lo verifiquen.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara "en"; no se confirman otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como se comporta un LLM de 27B tras eliminar sus mecanismos de rechazo, comparandolo con el modelo base original. Es adecuado porque la abliteration es precisamente el objeto de estudio y el formato GGUF facilita ejecutarlo en laboratorios con hardware limitado.
- Despliegue local en estaciones de trabajo con GPU consumer: con cuantizaciones Q4_K_M (17,1 GB) o Q4_K_S (15,9 GB), el modelo puede ejecutarse en GPUs con 16-24 GB de VRAM mediante llama.cpp u Ollama, lo que permite disponer de un modelo de 27B sin depender de la nube.
- Generacion creativa sin restricciones editoriales: escritores e investigadores pueden usar el modelo para generar narrativa o dialogos que el modelo original rechazaria por politicas de contenido; la naturaleza uncensored es el motivo principal de su uso.
- Experimentacion con tecnicas de cuantizacion: el repositorio ofrece un espectro amplio de cuantizaciones (de Q2_K a Q8_0) que permite medir el impacto de la cuantizacion en la perplejidad y la calidad de generacion sobre un mismo modelo base.
- Evaluacion de robustez de filtros de seguridad: equipos de seguridad pueden emplear el modelo como caso de prueba para validar que sus propios sistemas de moderacion detectan contenido generado por modelos abliterated.
- Prototipado de asistentes conversacionales en ingles: dado su caracter conversacional y su tamano, puede usarse como backend de un chatbot local para pruebas de concepto, siempre que el caso de uso no requiera garantias de contenido seguro.
- Fine-tuning posterior sobre dominio especifico: al estar disponible el modelo base en safetensors, es posible partir de el para ajuste fino con LoRA o QLoRA, usando las cuantizaciones GGUF solo para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas. Tampoco se documentan curvas de perplejidad para las distintas cuantizaciones, mas alla de la referencia generica a la grafica de ikawrakow sobre calidad de cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo GGUF mas el overhead de contexto. Para Q4_K_M (17,1 GB) se necesitan en torno a 18-20 GB de VRAM con contexto moderado; para Q8_0 (29,1 GB) se requieren unos 30-32 GB.
- GPU recomendadas: para Q8_0, una A100 40 GB, H100 o RTX A6000 48 GB. Para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente. Para Q2_K o Q3_K_S, GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 y Q5; en GPUs de 16 GB con Q3 o IQ4_XS; en GPUs de 12 GB solo con Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con endpoints de Hugging Face. No se confirma soporte de vLLM o TGI para este formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada. Como referencia estructural, se puede comparar con el modelo base del que deriva y con otras cuantizaciones del mismo autor, pero no con alternativas de la misma categoria con datos verificables.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|
| mradermacher/Qwen3.8-27B-Heretic-Abliterated-GGUF | 27,3 B | no disponible | qwen-community | GGUF | Objeto de esta ficha; cuantizaciones estaticas |
| catonooka/Qwen3.8-27B-Heretic-Abliterated | 27,3 B | no disponible | no disponible | safetensors | Modelo base del que deriva esta cuantizacion |
| mradermacher/Qwen3.8-27B-Heretic-Abliterated-i1-GGUF | 27,3 B | no disponible | qwen-community | GGUF (imatrix) | Version con cuantizacion imatrix, presumiblemente de mayor calidad |

No se identifican en la informacion proporcionada alternativas comparables de otros autores con datos verificables de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- El modelo ha sido sometido a abliteration, lo que elimina o reduce los rechazos ante contenido danino, ilegal o etico. Esto lo hace inadecuado para aplicaciones de cara al publico sin capas adicionales de moderacion.
- Riesgo elevado de generar contenido ofensivo, sesgado o factualmente incorrecto; no se documentan evaluaciones de sesgo ni de alucinacion.
- Solo se declara soporte de ingles; no se confirman capacidades multilingues.
- La licencia "qwen-community" (license: other) impone condiciones que deben revisarse en el archivo LICENSE antes de cualquier uso comercial; no se detallan en la informacion proporcionada.
- No se dispone de informacion sobre la longitud de contexto, lo que impide planificar casos de uso que requieran ventanas largas.
- El proceso de abliteration puede degradar capacidades generales del modelo (razonamiento, codigo, matematicas) respecto al modelo original; no se aportan datos que cuantifiquen esta degradacion.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia y la calidad de generacion; el propio autor recomienda Q4_K_S o Q4_K_M como equilibrio rapido/calidad.
- El repositorio ocupa 190,7 GB en total, lo que requiere planificar el almacenamiento si se descargan varias cuantizaciones.
- No se documentan garantias de soporte ni mantenimiento por parte del autor del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-Abliterated-GGUF
- Modelo base: https://huggingface.co/catonooka/Qwen3.8-27B-Heretic-Abliterated
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-Abliterated-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Heretic-Abliterated-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de cuantizaciones: https://www.nethype.de/
