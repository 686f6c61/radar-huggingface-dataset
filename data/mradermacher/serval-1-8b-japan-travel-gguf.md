# mradermacher/Serval-1.8B-Japan-Travel-GGUF

## Resumen

Serval-1.8B-Japan-Travel es un modelo de traduccion automatica de 1.791.080.448 parametros (aproximadamente 1,8 mil millones), desarrollado originalmente por catsaiagency y distribuido en formato GGUF por mradermacher. El modelo esta especializado en traduccion multilingue con un enfoque declarado en el contexto de viajes a Japon, y cubre diez idiomas: japones, ingles, chino, coreano, espanol, frances, aleman, portugues, polaco y croata. Su pipeline en Hugging Face es `translation` y su naturaleza es conversacional.

La relevancia de esta publicacion no reside en el modelo base, sino en la cuantizacion: mradermacher ofrece una bateria completa de variantes GGUF estaticas (desde Q2_K hasta f16) que permiten ejecutar un modelo de traduccion de 1,8B parametros en hardware de consumo, con tamanos que van de 0,9 GB a 3,7 GB. Esto lo hace atractivo para despliegues locales de traduccion en entornos con recursos limitados, como aplicaciones de viaje offline o asistentes embebidos.

No se dispone de informacion publica sobre la arquitectura interna, los datos de entrenamiento ni los resultados de benchmarks del modelo base en la informacion proporcionada. El repositorio cuantizado fue creado el 16 de noviembre de 2026 y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de transformers; estructura interna no documentada) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ja, en, zh, ko, es, fr, de, pt, pl, hr |
| Licencia | catsai-model-license (license: other) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base (tipo de transformer, numero de capas, dimensiones de atencion, uso de GQA o MQA, etc.) en la documentacion disponible. El modelo base es `catsaiagency/Serval-1.8B-Japan-Travel`, con 1.791.080.448 parametros en safetensors, lo que situa su escala en torno a los 1,8B parametros. La unica informacion tecnica disponible sobre el proceso de cuantizacion es que mradermacher genero cuantizaciones estaticas (no ponderadas ni con imatrix) con `quantize_version: 2` y `output_tensor_quantised: 1`, y que no hay planes confirmados de publicar variantes ponderadas.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). La model card del repositorio cuantizado se limita a listar los ficheros GGUF y a remitir a la documentacion generica de TheBloke para el uso de ficheros GGUF multiparte.

## Capacidades

- Traduccion automatica entre los diez idiomas declarados (ja, en, zh, ko, es, fr, de, pt, pl, hr), con pipeline `translation`.
- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Especializacion declarada en el dominio de viajes a Japon, lo que sugiere vocabulario y fraseologia orientados a itinerarios, reservas, transporte y atencion turistica.
- Soporte multilingue amplio dentro del conjunto de idiomas listado.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Traduccion de conversaciones de atencion al cliente en agencias de viajes: el modelo puede traducir mensajes entre japones y espanol, ingles, chino o coreano en un contexto turistico, con la ventaja de ejecutarse en local para cumplir requisitos de privacidad de datos de clientes.
- Asistente de viaje offline en aplicaciones moviles: con la cuantizacion Q4_K_M (1,2 GB), el modelo cabe en dispositivos con poca memoria y permite traduccion en tiempo real sin conexion, util para turistas en Japon sin roaming.
- Traduccion de documentacion turistica y menus: el modelo puede procesar textos cortos de folletos, carteles y menus en japones y verterlos a los idiomas europeos soportados, integrado en un pipeline de preprocesamiento por lotes.
- Localizacion de contenido web para portales de viajes: traduccion de fichas de destinos, resenas y guias entre los diez idiomas, con despliegue en servidores modestos mediante llama.cpp u Ollama.
- Subtitulado y traduccion de transcripciones en agencias de recepcion de turistas: el modelo puede traducir dialogos transcritos en japones a espanol o ingles para personal de mostrador que no domina el idioma.
- Prototipado rapido de sistemas de traduccion en investigacion: al ser un modelo pequeno y con cuantizaciones ligeras, sirve como linea base reproducible en experimentos de traduccion de bajo coste computacional.
- Traduccion de correspondencia hotelera y reservas: gestion de correos y mensajes entre clientes internacionales y establecimientos japoneses, con la cuantizacion Q8_0 (2,0 GB) para mayor fidelidad en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,3 GB con Q4_K_M (1,2 GB de fichero), 0,9-1,0 GB con Q2_K, 2,0-2,2 GB con Q8_0 y 3,7-4,0 GB con f16, incluyendo overhead de contexto y cache KV.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4 y Q5; una RTX 3060 de 12 GB o RTX 4090 permite cargar f16 con contexto amplio. En entornos de servidor, A100 o H100 no son necesarias para este tamano, salvo para servir muchas peticiones concurrentes.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas (GTX 1650 4 GB en adelante) con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base tambien puede servirse con transformers, vLLM o TGI si se dispone de los pesos safetensors originales.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano (1,8B parametros), se espera una latencia baja en GPU consumer, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Serval-1.8B-Japan-Travel (este) | 1,79B | no disponible | 10 | catsai-model-license | GGUF, safetensors |
| Alternativas de traduccion de ~1-2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada, por lo que no es posible establecer una comparativa con datos verificados de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La licencia `catsai-model-license` es de tipo "other" y no se detalla en la informacion disponible; es imprescindible revisar el enlace a MODEL-LICENSE.md del modelo base antes de cualquier uso comercial.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado presumiblemente con datos web multilingues, es probable que herede sesgos de genero, culturales y geopoliticos; no hay evaluacion publicada al respecto.
- Riesgo de alucinacion: no cuantificado. En tareas de traduccion, el riesgo se manifiesta como omisiones, adiciones o cambios de sentido, especialmente en textos largos o dominios fuera del turismo.
- La longitud de contexto no esta documentada, lo que impide garantizar el comportamiento en documentos extensos; se recomienda validar con textos representativos antes de produccion.
- El enfoque declarado en viajes a Japon puede limitar el rendimiento en dominios tecnicos, juridicos o medicos.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable segun las notas del propio autor; para produccion se recomienda Q4_K_M o superior.
- No hay garantias de soporte de tool calling ni de integracion con agentes; la etiqueta `conversational` no implica capacidades de razonamiento multi-paso.
- El repositorio no registra descargas ni likes, y el modelo base carece de documentacion tecnica publica, lo que dificulta la evaluacion independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Serval-1.8B-Japan-Travel-GGUF
- Modelo base: https://huggingface.co/catsaiagency/Serval-1.8B-Japan-Travel
- Licencia del modelo base: https://huggingface.co/catsaiagency/Serval-1.8B-Japan-Travel/blob/main/MODEL-LICENSE.md
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Serval-1.8B-Japan-Travel-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
