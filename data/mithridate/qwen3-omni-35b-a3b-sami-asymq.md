# MIThridate/Qwen3-Omni-35B-A3B-SAMI-AsymQ

## Resumen

Qwen3-Omni-35B-A3B-SAMI-AsymQ es una cuantizacion GGUF del backbone Thinker del modelo multimodal Qwen/Qwen3-Omni-30B-A3B-Instruct, publicada por el usuario MIThridate (Valentin Spiridon, TSV Consulting SRL, Timisoara, Rumania) bajo la metodologia SAMI (Structured Architecture for Modular Inference). El paquete incluye el backbone de razonamiento textual y el proyector visual SigLIP, pero no el modulo Talker de sintesis de voz, por lo que no ofrece audio de extremo a extremo dentro del propio GGUF.

La propuesta central es ejecutar un modelo MoE de 30.500 millones de parametros (unos 3.200 millones activos por token) en hardware de consumo: una GPU de 6 GB de VRAM y 32 GB de RAM de sistema. La cuantizacion asimetrica combina Q8_0, Q5_K, Q3_K y Q4_K, dejando las capas densas en VRAM y descargando los expertos dispersos a RAM mediante el flag `-cmoe` de llama.cpp. El autor reporta un rendimiento medido de 15,5 a 16,0 tokens por segundo en un Intel i5-8400 con una GTX 1060 de 6 GB.

Ademas, el autor aplica intervenciones direccionales sobre los pesos BF16 antes de cuantizar: ablacion de dimensiones asociadas a rechazos, eliminacion de dimensiones de expertos inactivos y amplificacion de rasgos tecnicos y de morfosintaxis rumana. El resultado es un modelo etiquetado como "uncensored" y orientado a ingles y rumano. Es relevante ahora porque demuestra una via practica para servir arquitecturas MoE multimodales grandes en equipos modestos, aunque con caveats importantes de calidad y soporte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (48 capas, 128 expertos enrutados por capa, top-8 activos) con proyector visual SigLIP |
| Parametros totales | 30.532.646.912 (backbone Thinker); 35.259.818.545 contando todos los submodulos del modelo base |
| Parametros activos | Aproximadamente 3.200 millones por forward pass |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | SAMI-AsymQ asimetrica: Q8_0 / Q5_K / Q3_K / Q4_K (GGUF); proyector visual en BF16 |
| Idiomas soportados | Ingles (en) y rumano (ro) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repositorio de 16,1 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen3-Omni-30B-A3B-Instruct, un transformer MoE multimodal. El backbone Thinker consta de 48 capas con 128 expertos enrutados por capa (6.144 expertos en total) y una dimension intermedia de 768; en cada token se activan los 8 mejores expertos, lo que resulta en unos 3.200 millones de parametros activos. Las proyecciones de atencion, las matrices RMSNorm y las compuertas del router suman aproximadamente 1.540 millones de parametros densos, que residen en VRAM. El modulo visual es un proyector SigLIP de dimension 2.048 en BF16.

El autor no documenta el proceso de entrenamiento original (numero de tokens, composicion del dataset, RLHF o DPO), por lo que esos datos deben consultarse en la model card del modelo base. Lo que si documenta son las intervenciones posteriores sobre los pesos BF16: ablacion de 6.259 dimensiones de caracteristicas de rechazo (aproximadamente el 0,13 % de las columnas de expertos, identificadas por proyeccion de activaciones contrastivas con z > 2,0 en las matrices de down-projection); puesta a cero de 10.128 dimensiones de expertos dormidos (0,21 %, con varianza de activacion inferior a 10^-5); atenuacion de 1.491 vectores especulativos para reducir alucinaciones; y amplificacion de 32.789 dimensiones tecnicas (0,69 %) correlacionadas con programacion de sistemas y morfosintaxis rumana. Estas modificaciones no son un reentrenamiento y no hay evaluacion publicada de su efecto neto sobre la calidad.

## Capacidades

- Generacion de texto y razonamiento en ingles y rumano, heredados del backbone Thinker de Qwen3-Omni.
- Comprension de imagenes mediante el proyector visual SigLIP incluido en el paquete (`mmproj-SAMI-Omni-Vision-BF16.gguf`).
- Ejecucion de tareas de programacion de sistemas: el autor afirma haber amplificado rasgos asociados a concurrencia, gestion de memoria y punteros.
- Reduccion de plantillas de rechazo por ablacion de direcciones de activacion, orientada a usos tecnicos sin friccion conversacional.
- Soporte de inferencia con llama.cpp (`llama-server`, `llama-cli`) y descarga de expertos a CPU con `-cmoe`.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).
- No incluye sintesis de voz: el modulo Talker (3.300 millones de parametros y vocoder) no esta empaquetado, por lo que las interfaces de voz requieren TTS/STT externos.
- No se documenta soporte de tool calling ni de razonamiento multi-paso con agentes en la informacion disponible.

## Casos de uso

- Inferencia local en estaciones de trabajo modestas: con una GTX 1060 de 6 GB y 32 GB de RAM se puede servir el modelo a unos 16 tokens/s, adecuado para prototipado y demostraciones sin cloud.
- Procesamiento de documentacion tecnica en ingles: el modelo puede resumir y responder preguntas sobre manuales y especificaciones, con el proyector visual para capturas y diagramas.
- Asistencia de programacion de sistemas: generacion y explicacion de codigo C/C++ o Rust en torno a concurrencia y gestion de memoria, aprovechando la amplificacion de rasgos tecnicos declarada por el autor.
- Atencion al cliente en rumano: conversaciones multi-turno en un idioma con poca cobertura en modelos abiertos, aunque la longitud de contexto no esta documentada.
- Analisis de imagenes con texto asociado (image-text-to-text): extraccion de informacion de capturas, formularios o graficos combinada con explicaciones textuales.
- Escenarios de investigacion sobre alineacion y ablacion: el checkpoint sirve para estudiar el efecto de eliminar direcciones de rechazo y dimensiones dormidas en un MoE multimodal.
- Despliegue en entornos con GPU limitada y CPU potente: pipelines por lotes que toleran latencia moderada y priorizan coste de hardware bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento medido es el throughput de inferencia reportado por el autor: 15,5 a 16,0 tokens/s en un Intel i5-8400 con GTX 1060 6 GB y DDR4 de doble canal, con aproximadamente 2,4 GB de VRAM activa y 11,8 GB de RAM de sistema para el archivo principal de 14,8 GB.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,4 GB para las capas densas del backbone; el proyector visual puede ejecutarse en RAM con `--no-mmproj-offload` (0 GB de VRAM).
- RAM de sistema: aproximadamente 11,8 GB para el modelo principal y 0,86 GB para el proyector visual; el autor recomienda 32 GB.
- GPU recomendadas: el autor valida una NVIDIA GTX 1060 de 6 GB; cualquier GPU con 6 GB o mas deberia bastar para las capas densas, aunque no se documentan pruebas en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, al menos en GTX 1060 6 GB; el cuello de botella es el ancho de banda de la RAM del sistema (30-35 GB/s en DDR4 de doble canal).
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`) con `-cmoe`; no se documenta soporte de vLLM, TGI u Ollama.
- Latencia y throughput: 15,5-16,0 tokens/s medidos en el hardware indicado; el autor estima teoricamente 16-18 tokens/s segun el ancho de banda de host.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-Omni-35B-A3B-SAMI-AsymQ | 30,5 B (3,2 B activos) | No disponible | Apache 2.0 | GGUF | Cuantizacion con ablaciones, enfocada a hardware de consumo |
| Qwen/Qwen3-Omni-30B-A3B-Instruct | 30,5 B (3,2 B activos) | No disponible | Apache 2.0 | Safetensors | Modelo base sin modificar; incluye modulo Talker de audio |
| Alternativas de tamano y categoria similares | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Las ablaciones de direcciones de rechazo y la amplificacion de rasgos tecnicos no han sido evaluadas con benchmarks publicos; el efecto sobre la calidad general, la coherencia y la seguridad es desconocido.
- El modelo esta etiquetado como "uncensored": puede producir contenido que los modelos alineados rechazan, lo que exige filtros y politicas de uso en produccion.
- Riesgo de alucinacion: el autor afirma haber atenuado 1.491 vectores especulativos, pero no aporta metricas de tasa de alucinacion.
- Cobertura linguistica limitada a ingles y rumano; el rendimiento en castellano no esta documentado.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar cargas con ventanas largas.
- No incluye el modulo Talker ni vocoder: no hay sintesis de voz nativa en este GGUF.
- El rendimiento de 16 tokens/s depende del ancho de banda de RAM; en portatiles con DDR4 de un solo canal o memorias lentas sera inferior.
- Aunque la licencia es Apache 2.0, la modificacion de pesos y la etiqueta "uncensored" pueden chocar con politicas de plataformas de despliegue y con requisitos regulatorios.
- El repositorio tiene 314 descargas y 1 like, con actualizacion en octubre de 2026; la validacion comunitaria es muy escasa.
- Los resultados de busqueda web disponibles no aportan informacion tecnica sobre el modelo (corresponden al rey Mitridates VI), por lo que no se han podido contrastar datos externos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MIThridate/Qwen3-Omni-35B-A3B-SAMI-AsymQ
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- TSV Consulting SRL: https://tsvconsulting.online/
- Referencia arXiv 2406.11717: https://arxiv.org/abs/2406.11717
- Referencia arXiv 2303.15343: https://arxiv.org/abs/2303.15343
