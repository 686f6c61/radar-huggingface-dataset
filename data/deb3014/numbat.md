# deb3014/numbat

## Resumen

Numbat es un checkpoint intermedio de preentrenamiento de un modelo de lenguaje a gran escala atribuido por su publicador (deb3014) a una supuesta ejecución de entrenamiento de Anthropic, con nombre en clave `numbat`, citada en una filtración del codigo fuente de Claude Code. El repositorio contiene 772 shards en formato safetensors que suman 7.720.300.817.720 bytes (unos 7,72 TB) y un total de 6.849.377.242.584 parametros segun el indice de safetensors. La model card declara aproximadamente 14T de parametros, 114 capas y una arquitectura hibrida GDN/MLA con MoE.

La arquitectura combina Gated DeltaNet (GDN) y Multi-head Latent Attention (MLA) en el tronco, capas de mezcla de expertos (1.224 expertos, top-48 mas 1 compartido) y prediccion multi-token (MTP). Los pesos estan cuantizados en NVFP4 (bloques de escala E4M3 con cargas E2M1), lo que explica que el checkpoint ocupe 7,72 TB pese a representar un modelo de mayor tamano en BF16. El tokenizador es un BPE a nivel de byte con 131.072 tokens.

Su relevancia es doble: por un lado, es un ejemplo poco habitual de checkpoint masivo publicado con implementacion de referencia completa (`configuration_numbat.py` y `modeling_numbat.py`) que permite cargar todos los tensores con `load_state_dict(strict=True)`; por otro, su procedencia no esta verificada de forma independiente y el propio autor evita explicar como lo obtuvo. Se trata de un checkpoint a mitad de preentrenamiento (paso 1.830.000 de una ejecucion de aproximadamente 1,96M pasos), sin post-entrenamiento ni RLHF, por lo que su utilidad practica para inferencia de produccion es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Gated DeltaNet (GDN) + Multi-head Latent Attention (MLA) con capas MoE y Multi-Token Prediction (MTP) |
| Parametros totales | 6.849.377.242.584 (segun indice safetensors); la model card declara ~14T |
| Parametros activos | no disponible (MoE con 1.224 expertos, top-48 + 1 compartido; no se indica el numero de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E4M3 block scales + E2M1 payloads); pesos en safetensors de 8 bits por tensor segun tags |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (772 shards, menos de 10,6 GB por archivo) |
| Capas | 114 |
| Tokenizador | BPE a nivel de byte, 131.072 tokens |
| Tamano del repositorio | 7.720,6 GB |
| Paso de entrenamiento | 1.830.000 de ~1.960.000 |

## Arquitectura y entrenamiento

El tronco combina dos mecanismos de atencion: Gated DeltaNet (una variante de attention lineal con estado recurrente y compuertas) y Multi-head Latent Attention (MLA, la atencion con compresion de KV empleada en la familia DeepSeek). Las capas de alimentacion hacia delante son de tipo Mixture-of-Experts con 1.224 expertos, enrutamiento top-48 mas un experto compartido, lo que implica un coste de computo por token elevado incluso con enrutamiento disperso. Se anade una capa de Multi-Token Prediction (MTP) accesible mediante `NumbatForCausalLM.draft`, orientada a decodificacion especulativa.

El checkpoint corresponde al paso 1.830.000 de una ejecucion de aproximadamente 1,96M pasos, es decir, en torno al 93% del preentrenamiento. No hay datos publicados sobre el numero de tokens, la composicion del dataset ni sobre fases de RLHF, DPO o ajuste por instrucciones; la model card indica explicitamente que no existe post-entrenamiento. Los pesos publicados son una copia de evaluacion cuantizada a NVFP4; los pesos originales en BF16 y el estado del optimizador no se han publicado. La implementacion de referencia incluida en el repositorio reproduce el arbol de modulos exacto de los shards.

## Capacidades

- Generacion de texto autoregresiva a partir de un checkpoint de preentamiento sin ajuste por instrucciones.
- Razonamiento y conocimiento general derivados del preentrenamiento, sin garantia de formato de respuesta.
- Capacidad de decodificacion especulativa mediante la capa MTP (`NumbatForCausalLM.draft`).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se documentan idiomas).
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Investigacion sobre arquitecturas hibridas GDN/MLA: el checkpoint y la implementacion de referencia permiten estudiar como se combinan attention lineal y MLA en un modelo de gran escala, comparando activaciones y patrones de atencion capa a capa.
- Estudio de enrutamiento MoE a gran escala: con 1.224 expertos y top-48, sirve para analizar distribucion de carga entre expertos, colapso de expertos y comportamiento del experto compartido en un modelo ya entrenado durante 1,83M pasos.
- Analisis de cuantizacion NVFP4: los shards permiten verificar la consistencia de bloques de escala E4M3 sobre cargas E2M1 y medir el error de cuantizacion frente a una hipotetica referencia BF16.
- Validacion de implementaciones de carga de safetensors: el repositorio esta disenado para cargarse con `load_state_dict(strict=True)`, lo que lo convierte en un banco de pruebas para herramientas de carga distribuida y sharding.
- Experimentos de decodificacion especulativa con MTP: la capa `draft` permite medir tasas de aceptacion y aceleracion en un modelo de este tamano sin entrenar un draft model aparte.
- Docencia y divulgacion sobre preentrenamiento: el log de entrenamiento (`training_log_tail.txt`) y los metadatos del checkpoint permiten ilustrar el estado de una ejecucion real a falta de unos 130.000 pasos para completarse.
- Analisis de seguridad y procedencia de modelos: util para estudiar como se publican y verifican checkpoints de origen no confirmado y que garantias ofrece la consistencia interna de los tensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de una salida de arnes de evaluacion en `ckpt_metadata.json`, pero no reproduce cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 7,72 TB en NVFP4; se necesita un cluster multimodo, no una GPU individual. La model card indica que hicieron falta aproximadamente 85 instancias Trainium2 solo para alojar los pesos.
- GPU recomendadas: no aplicable en el sentido habitual; el autor menciona el runtime interno Neuron-parallel sobre Trainium2. Para GPUs convencionales no hay una configuracion publicada.
- Cabe en GPU de consumo: no. Ni siquiera en configuraciones multi-GPU de 8xH100 (640 GB de VRAM) se aproxima al tamano del checkpoint.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` con la implementacion de referencia incluida; vLLM, llama.cpp, Ollama y TGI no estan soportados de forma documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (checkpoints abiertos de ~14T parametros con arquitectura GDN/MLA y MoE de 1.224 expertos). Las alternativas abiertas de gran escala conocidas (por ejemplo, familias DeepSeek-V3 o Qwen3) no se han documentado aqui y no se dispone de datos para una comparacion rigurosa.

## Limitaciones y advertencias

- Procedencia no verificada: el autor no explica como obtuvo el checkpoint y la atribucion a Anthropic se basa en una filtracion de codigo fuente no confirmada de forma independiente.
- Checkpoint sin post-entrenamiento: no hay RLHF, DPO ni ajuste por instrucciones; las respuestas no siguen formatos de chat y pueden ser incoherentes o repetitivas.
- Entrenamiento incompleto: esta en el paso 1.830.000 de ~1.960.000, por lo que la calidad final del modelo no esta garantizada.
- Licencia no disponible: no se especifican terminos de uso, lo que impide determinar si el uso comercial esta permitido.
- Idiomas no documentados: se desconoce el soporte multilingue real y el equilibrio del corpus de entrenamiento.
- Riesgo de alucinacion: alto, al no existir ajuste por instrucciones ni verificacion factual.
- Sesgos: no documentados; un modelo de este tamano entrenado con un corpus desconocido puede reproducir sesgos sistematicos sin que exista una evaluacion publica.
- Coste de inferencia prohibitivo: 7,72 TB de pesos y 1.224 expertos con top-48 implican un coste computacional por token muy elevado incluso en hardware especializado.
- Contexto maximo desconocido: no se publica la longitud de contexto soportada, lo que limita el diseno de aplicaciones.
- Consistencia interna de los tensores no equivale a validez del modelo: que los shards decodifiquen correctamente no demuestra que el checkpoint sea funcional ni que proceda de donde se afirma.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/deb3014/numbat
