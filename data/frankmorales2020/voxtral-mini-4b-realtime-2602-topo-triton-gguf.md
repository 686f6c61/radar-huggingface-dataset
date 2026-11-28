# frankmorales2020/voxtral-mini-4b-realtime-2602-topo-triton-GGUF

## Resumen
El modelo `frankmorales2020/voxtral-mini-4b-realtime-2602-topo-triton-GGUF` es una distribucion en formato GGUF de Voxtral Mini 4B Realtime (version `2602`), un modelo de reconocimiento automatico del habla (ASR) derivado de la familia Voxtral de Mistral. La publicacion la firma Frank Morales Aguilera (Sovereign Machine Laboratory, SOMALA, Montreal) y esta pensada para su uso con `llama.cpp`, concretamente con la herramienta `llama-mtmd-cli`, que permite pasar audio junto con el proyector multimodal (`mmproj`).

El paquete incluye dos cuantizaciones del decodificador de texto/ASR (`Q8_0` de 3,66 GB y `BF16` de 6,88 GB) y un unico codificador de audio en `F16` (`mmproj`, 1,99 GB, 423 tensores). El modelo base declara 3.434.118.144 parametros reales en safetensors y un repositorio de 12,5 GB. La model card indica que el entrenamiento se realizo en PyTorch nativo con `TopoAdamW` bajo un regimen denominado Topological Continual Backpropagation (Topo-CBP), una variante de entrenamiento continuo que no se detalla tecnicamente en la informacion disponible.

La relevancia actual del modelo radica en que ofrece una via practica de ejecutar ASR multimodal de la familia Voxtral en infraestructura local mediante `llama.cpp`, sin depender de APIs propietarias. No obstante, la informacion publicada es escasa: no se especifican licencia, idiomas soportados, longitud de contexto ni resultados de benchmarks estandar (WER, MMLU, etc.), por lo que su evaluacion en produccion exige validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador de audio + adaptador + decodificador de texto); variante Voxtral Mini 4B Realtime, entrenada con Topo-CBP y `TopoAdamW` |
| Parametros totales | 3.434.118.144 (dato real en safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `Q8_0` (decodificador, 3,66 GB) y `BF16` (decodificador, 6,88 GB); `F16` para el `mmproj` de audio (1,99 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (decodificador y `mmproj`); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento
La arquitectura sigue el esquema multimodal de Voxtral: un codificador de audio en `F16` (archivo `mmproj`, 423 tensores con prefijos `a.*` y `mm.a.*`) que proyecta las representaciones acusticas hacia el espacio del decodificador de texto, y un decodificador tipo transformer de aproximadamente 3,43 mil millones de parametros. El proceso de inferencia requiere obligatoriamente ambos artefactos: el GGUF del decodificador (`-m`) y el `mmproj` (`--mmproj`), tal como se documenta para `llama-mtmd-cli`.

El autor indica que el modelo fue entrenado en PyTorch nativo con `TopoAdamW` bajo Topological Continual Backpropagation (Topo-CBP), y que la version GGUF se genero con un notebook basado en Triton (`triton_Voxtral_topo_cbp_gguf.ipynb`). No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla la innovacion concreta de Topo-CBP mas alla de su nombre y del optimizador asociado.

## Capacidades
- Reconocimiento automatico del habla (ASR) a partir de audio de entrada, con salida de texto transcrito.
- Procesamiento de audio en formato WAV mono a 16 kHz (el ejemplo de la model card convierte explicitamente a `pcm_s16le`, 16 kHz, mono).
- Procesamiento por chunks: el benchmark del autor usa chunks de 320 ms y mide latencia por paso de 80 ms, lo que sugiere un diseno orientado a flujo continuo.
- Integracion con `llama.cpp` mediante `llama-mtmd-cli` y con `huggingface_hub` para la descarga programatica de los artefactos.
- Compatibilidad declarada con `mistral-common` (tag de la model card).
- Soporte de tool calling, agentes, vision, audio bidireccional o modo thinking: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso
- Transcripcion de reuniones y actas: el modelo puede procesar audio de 16 kHz y generar la transcripcion completa; el benchmark del autor sobre 105,50 s de audio demuestra que es viable con `llama.cpp`, aunque con un factor de tiempo real de 0,52x en `Q8_0`, por lo que conviene usarlo en modo diferido y no en directo estricto.
- Subtitulado y postproduccion: la salida de texto permite generar subtitulos para video; el uso de chunks de 320 ms y pasos de 80 ms facilita la alineacion aproximada por segmentos, aunque la precision temporal no se documenta.
- Asistentes de voz en local: al ejecutarse con `llama.cpp` y pesos GGUF, puede desplegarse en equipos sin GPU dedicada o con GPU de consumo, lo que encaja en escenarios de privacidad donde el audio no debe salir del dispositivo.
- Analisis de llamadas de atencion al cliente: transcripcion por lotes de grabaciones para su posterior analisis de calidad o cumplimiento, usando la cuantizacion `Q8_0` para reducir coste de almacenamiento (3,66 GB frente a 6,88 GB en `BF16`).
- Investigacion en ASR y entrenamiento continuo: el modelo sirve como banco de pruebas para estudiar el efecto de Topo-CBP y `TopoAdamW` frente a variantes de Voxtral sin dicho entrenamiento, comparando transcripciones sobre el mismo audio.
- Prototipado de pipelines multimodales en `llama.cpp`: util para validar la ruta `llama-mtmd-cli` con `--mmproj` y audio en WAV, antes de migrar a otros formatos o cuantizaciones.
- Archivado y busqueda de contenido audiovisual: transcripcion masiva de archivos de audio para indexacion textual y busqueda posterior, aprovechando que el modelo cabe en un repositorio de 12,5 GB y puede descargarse con `huggingface_hub`.

## Benchmarks y rendimiento
El autor publica un unico benchmark end-to-end con `llama-mtmd-cli` sobre un audio de 105,50 s a 16 kHz, 1.330 tokens y chunks de 320 ms, comparando `Q8_0` y `BF16`:

| Metrica | Q8_0 | BF16 | Diferencia (BF16 vs Q8_0) |
|---|---|---|---|
| Tamano del decodificador GGUF | 3,66 GB | 6,88 GB (6,40 GiB) | +3,22 GB (~1,88x mayor) |
| Codificador de audio (F16 mmproj) | 71,73 s | 71,39 s | -0,34 s |
| Tiempo del decodificador de texto | 131,77 s | 192,49 s | +60,72 s (+46,1% mas lento) |
| Tiempo total | 203,52 s | 263,90 s | +60,38 s (+29,7% mas lento) |
| Factor de tiempo real | 0,52x | 0,40x | -0,12x |
| Latencia por paso (cada 80 ms) | 153,0 ms | 198,4 ms | +45,4 ms (+29,7%) |

No se han publicado en la informacion disponible resultados de benchmarks estandar de ASR (WER, CER), MMLU, HumanEval, GSM8K ni comparaciones con otros modelos Voxtral o de la competencia.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita. Como referencia de tamano en disco, el decodificador `Q8_0` ocupa 3,66 GB y el `mmproj` F16 1,99 GB (unos 5,65 GB en total); el decodificador `BF16` ocupa 6,88 GB y el `mmproj` 1,99 GB (unos 8,87 GB en total). La VRAM necesaria sera igual o superior a estos tamanos segun el backend y el contexto configurado.
- GPU recomendadas: no disponible en la informacion proporcionada. El modelo puede ejecutarse en CPU mediante `llama.cpp`, ya que el benchmark del autor no especifica la GPU empleada.
- GPU de consumo: no se confirma en la informacion disponible; por tamano, las cuantizaciones `Q8_0` y `BF16` son compatibles con GPUs de consumo de 8-12 GB de VRAM en teoria, pero no hay confirmacion del autor.
- Opciones de despliegue: `llama.cpp` mediante `llama-mtmd-cli` (documentado por el autor). No se mencionan vLLM, TGI, Ollama ni otras herramientas.
- Latencia y throughput: factor de tiempo real de 0,52x en `Q8_0` y 0,40x en `BF16` sobre el audio de prueba; latencia por paso de 153,0 ms (`Q8_0`) y 198,4 ms (`BF16`) cada 80 ms de audio. El hardware usado para estas mediciones no se especifica.

## Comparativa con modelos similares
No se dispone en la informacion proporcionada de datos de otros modelos comparables (Voxtral Mini original, Whisper large-v3, etc.) en cuanto a parametros, contexto, rendimiento o licencia. Por tanto, la comparativa se limita a las dos cuantizaciones publicadas en este mismo repositorio:

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| voxtral-mini-4b-realtime-2602-topo-triton Q8_0 | 3,43 B (decodificador) | no disponible | no disponible | GGUF | Hugging Face |
| voxtral-mini-4b-realtime-2602-topo-triton BF16 | 3,43 B (decodificador) | no disponible | no disponible | GGUF | Hugging Face |
| mmproj-voxtral-mini-4b-realtime-2602-f16 | no disponible (423 tensores) | no disponible | no disponible | GGUF | Hugging Face |

Comparativa con modelos de la competencia: no disponible.

## Limitaciones y advertencias
- La licencia no esta declarada en la informacion disponible; antes de un uso comercial es imprescindible verificar los terminos del modelo base Voxtral y del repositorio.
- No se especifican los idiomas soportados; no se puede asumir cobertura multilingue sin validacion.
- No se publican metricas de calidad de transcripcion (WER/CER), por lo que el rendimiento real en acentos, ruido de fondo o dominios especializados es desconocido.
- El factor de tiempo real es inferior a 1x (0,52x en `Q8_0`, 0,40x en `BF16`), lo que descarta el uso en tiempo real estricto sobre el hardware no especificado del benchmark.
- El modelo requiere obligatoriamente el archivo `mmproj` junto con el decodificador; usar solo el GGUF del decodificador no permite entrada de audio.
- El audio de entrada debe convertirse a WAV mono a 16 kHz (`pcm_s16le`) segun el ejemplo del autor; otros formatos pueden no funcionar directamente con `llama-mtmd-cli`.
- El origen del entrenamiento (Topo-CBP, `TopoAdamW`) no esta documentado tecnicamente en la informacion disponible, lo que dificulta evaluar su impacto frente a variantes estandar de Voxtral.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; en ASR es habitual la invencion de texto en segmentos con silencio o ruido, pero no hay datos del autor al respecto.
- El repositorio tiene 445 descargas y 0 likes, lo que indica una validacion comunitaria muy limitada.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/frankmorales2020/voxtral-mini-4b-realtime-2602-topo-triton-GGUF
- Notebook de conversion a GGUF (Triton, Topo-CBP): https://github.com/frank-morales2020/AST/blob/main/triton_Voxtral_topo_cbp_gguf.ipynb
- Web del autor (SOMALA): `sovereign-machine-lab.ai`
- ORCID del autor: `0009-0003-9528-0745`
- Audio de ejemplo usado en el benchmark (Wikimedia Commons): https://upload.wikimedia.org/wikipedia/commons/3/38/President_Barack_Obama_Recites_President_Abraham_Lincoln%27s_Gettysburg_Address.wav
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
