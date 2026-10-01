# mdagosta/waldito-python-basics-v1-r0013-u2-mdagosta

## Resumen

mdagosta/waldito-python-basics-v1-r0013-u2-mdagosta es un modelo de generacion de texto publicado en HuggingFace por el usuario mdagosta, identificado en la model card como un "OpenWALDO model export". Se trata de un checkpoint de arquitectura Llama causal (decoder-only transformer) con un total de 9.541.632 parametros reales declarados en los pesos safetensors, lo que lo situa en la categoria de modelos ultraligeros, tres ordenes de magnitud por debajo de los modelos de 7B-8B habituales.

El elemento diferencial declarado es el tokenizer: no emplea un tokenizer BPE tipo Llama, sino un "schema-1 byte tokenizer" propio de OpenWALDO que exige cargarse con `trust_remote_code=True`. El repositorio incluye ademas un `BOM.json` (inventario de ficheros de la release) y un `EU-BOM.json` con el mapeo de divulgacion de contenido de entrenamiento exigido por el reglamento europeo de IA (GPAI), lo que sugiere un esfuerzo de trazabilidad documental mas que un modelo orientado a rendimiento.

La relevancia de esta ficha es sobre todo practica para quien evalue checkpoints pequenos: por tamano, el modelo cabe en cualquier GPU de consumo, en CPU e incluso en dispositivos embebidos, y su nombre sugiere un ajuste fino orientado a conceptos basicos de Python, aunque la model card no confirma ni el dataset ni el proceso de entrenamiento. No hay datos publicados de benchmarks, licencia, idiomas ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama causal language model (transformer decoder-only) |
| Parametros totales | 9.541.632 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se declaran variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizer | schema-1 byte tokenizer de OpenWALDO (requiere `trust_remote_code=True`) |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 0.0 GB (segun metadatos de HuggingFace) |
| Fecha de creacion | 2026-09-30 |

## Arquitectura y entrenamiento

La model card indica explicitamente que el paquete usa "the standard Transformers Llama causal-language-model architecture" junto con el tokenizer de bytes schema-1 de OpenWALDO. Esto implica un transformer decoder-only con atencion causal estandar, sin innovaciones declaradas del tipo decodificacion especulativa, atencion lineal, SSM ni arquitecturas hibridas. El unico punto no convencional es el tokenizer: al ser un tokenizer de bytes propio y no uno BPE de Llama, cualquier integracion requiere ejecutar codigo remoto del repositorio, lo que anade superficie de riesgo en produccion y complica el uso con runtimes que no soportan `trust_remote_code` (por ejemplo, ciertas configuraciones de vLLM o llama.cpp).

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o SFT, ni sobre tecnicas de optimizacion empleadas. El nombre del repositorio ("python-basics-v1-r0013-u2-mdagosta") apunta a un ajuste sobre contenidos basicos de Python, con lo que probablemente se trate de un experimento de fine-tuning de dominio muy acotado, pero esto es una inferencia a partir del identificador y no un dato confirmado en la documentacion. La presencia de `EU-BOM.json` sugiere que el autor ha documentado el contenido de entrenamiento segun el marco europeo de GPAI, aunque el contenido de ese fichero no se detalla en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva con arquitectura Llama causal, declarada mediante el pipeline `text-generation`.
- Soporte de uso conversacional segun los tags del repositorio (`conversational`).
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles (tag `endpoints_compatible`).
- Tokenizacion a nivel de byte mediante el tokenizer schema-1 de OpenWALDO, lo que en principio permite representar cualquier secuencia de bytes sin tokens fuera de vocabulario.
- Capacidad de codigo o matematicas: no confirmada en la documentacion; el nombre sugiere orientacion a fundamentos de Python, pero no hay evaluacion publicada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el tamano del modelo (9,5M de parametros) hace muy improbable un rendimiento util en estas tareas.
- Capacidades multilingues: no disponible.
- Vision, audio o modo "thinking": no disponible.

## Casos de uso

- Docencia y divulgacion de arquitecturas transformer: con 9,5 millones de parametros, el modelo es lo bastante pequeno para inspeccionar pesos, activaciones y flujo de atencion en un cuaderno interactivo, algo inviable con modelos de miles de millones de parametros.
- Pruebas de integracion de pipelines de transformers: sirve como sujeto de prueba barato para validar carga de safetensors, ejecucion con `trust_remote_code` y serializacion de peticiones en servicios de inferencia antes de pasar a modelos grandes.
- Experimentacion con tokenizers de bytes: al emplear un esquema de tokenizacion no estandar, permite estudiar el comportamiento de modelos que operan directamente sobre bytes frente a los BPE habituales en tareas de codigo y texto con simbolos poco frecuentes.
- Fine-tuning de dominio muy acotado: por su tamano, se puede reentrenar en una unica GPU de consumo o en CPU en tiempos razonables, lo que lo hace util como banco de pruebas de recetas de ajuste antes de escalarlas.
- Validacion de trazabilidad y cumplimiento normativo: los ficheros `BOM.json` y `EU-BOM.json` sirven como ejemplo practico de como documentar una release de modelo y su divulgacion de contenido de entrenamiento bajo el marco GPAI europeo.
- Generacion de texto en entornos con recursos extremadamente limitados: con menos de 20 MB en fp16, es viable en microcontroladores, Raspberry Pi o navegador, para demos, prototipos de juguete o generacion de texto muy restringida.
- Investigacion sobre sobreajuste y capacidad efectiva: un modelo de este tamano entrenado sobre un dominio estrecho es un caso de estudio adecuado para medir memorizacion frente a generalizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y no hay cifras de perplejidad, latencia o throughput declaradas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los casos. Los pesos ocupan aproximadamente 38 MB en fp32, 19 MB en fp16/bf16, 9,5 MB en int8 y 4,8 MB en int4, a lo que hay que sumar activaciones y cache KV, marginales con cualquier longitud de contexto razonable.
- GPU recomendadas: ninguna en particular; el modelo no requiere GPU. Cualquier GPU con al menos 1 GB de memoria es suficiente, incluidas integradas y modelos antiguos.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual o pasada (RTX 4090, 3090, 3060, GTX 1650, e incluso iGPU). Tambien cabe comodamente en CPU.
- Opciones de despliegue: `transformers` es la via confirmada, con `trust_remote_code=True` obligatorio para cargar el tokenizer schema-1. El tag `endpoints_compatible` sugiere compatibilidad con endpoints al estilo de text-generation-inference, aunque no se detalla configuracion. La conversion a GGUF para llama.cpp u Ollama no esta documentada y requeriria implementar el tokenizer de bytes en el runtime; vLLM y TGI no esta confirmado que soporten este tokenizer personalizado.
- Latencia y throughput estimados: no disponibles. Por el numero de parametros, la generacion seria muy rapida en cualquier hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| waldito-python-basics-v1-r0013-u2-mdagosta | 9,54 M | no disponible | no disponible | HuggingFace, safetensors | Tokenizer de bytes propio, requiere `trust_remote_code` |
| TinyStories-1M (Eldan y Li) | 1 M | 2048 | MIT | HuggingFace, safetensors | Entrenado sobre corpus sintetico de cuentos; dominio muy restringido |
| Pythia-14M (EleutherAI) | 14 M | 2048 | Apache 2.0 | HuggingFace, safetensors | Suite de interpretabilidad con checkpoints intermedios; tokenizer GPT-NeoX |
| SmolLM-135M (HuggingFace) | 135 M | 2048 | Apache 2.0 | HuggingFace, safetensors, GGUF | Modelo pequeno con entrenamiento a gran escala y benchmarks publicos |

La comparacion con TinyStories-1M y Pythia-14M es la mas cercana en orden de magnitud. Frente a ellos, el modelo de mdagosta no publica licencia, idiomas, contexto ni evaluaciones, lo que limita cualquier comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evidencia publicada sobre calidad de generacion, razonamiento, codigo o matematicas.
- Sesgos conocidos: no disponibles. No hay documentacion sobre composicion del dataset ni sobre mitigaciones aplicadas.
- Riesgo de alucinacion: alto por construccion. Con 9,5 millones de parametros, la capacidad de almacenar conocimiento factual es muy reducida y el modelo producira texto plausible pero no verificado; no debe usarse como fuente de informacion.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y los idiomas soportados no se declaran. No se debe asumir cobertura multilingue.
- Licencia no disponible: al no declararse licencia, no hay autorizacion explicita de uso comercial. En la practica, esto implica que un uso en produccion queda en un limbo legal y requiere contactar con el autor.
- Ejecucion de codigo remoto: la carga del tokenizer con `trust_remote_code=True` implica ejecutar codigo del repositorio en la maquina del usuario. Debe auditarse el fichero de tokenizer antes de usarlo en entornos sensibles.
- Compatibilidad de despliegue limitada: el tokenizer de bytes no estandar reduce las opciones de runtime y complica el uso con llama.cpp, Ollama, vLLM o TGI sin trabajo de integracion adicional.
- Madurez del repositorio: 0 descargas, 0 likes, tamano de repo reportado de 0.0 GB y fecha de creacion atipica (2026-09-30) en los metadatos. No hay senales de mantenimiento ni de comunidad.
- No apto para produccion: por tamano, falta de licencia, falta de evaluaciones y tokenizer no estandar, no es recomendable como componente de un sistema en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0013-u2-mdagosta
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios de codigo ni demos adicionales asociados al modelo.
