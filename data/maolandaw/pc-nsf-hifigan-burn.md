# maolandaw/PC-NSF-HiFiGAN-burn

## Resumen

PC-NSF-HiFiGAN-burn es un artefacto de pesos en formato Burn para el vocoder PC-NSF-HiFiGAN del proyecto openvpi/vocoders, publicado por el usuario maolandaw. No se trata de un modelo de lenguaje ni de un modelo multimodal: es un vocoder generativo de tipo neural source filter (NSF) con arquitectura HiFiGAN, cuyo cometido es convertir representaciones acústicas intermedias (espectrogramas mel de 128 bandas, rango 40-16000 Hz) en forma de onda de audio a 44,1 kHz, con control explicito de la frecuencia fundamental (F0). El autor lo etiqueta como herramienta de correccion de tono, sintesis de voz y musica.

El problema que resuelve es de empaquetado y portabilidad: el checkpoint original de openvpi esta en formato PyTorch, y este repositorio lo reexporta como un archivo Burn Pack (`.bpk`) de 56.613.632 bytes, pensado para ser cargado desde Rust mediante el framework Burn sin depender de Python, PyTorch ni herramientas de pickle. El repositorio incluye ademas el codigo Rust de conversion (`convert.sh`, `export_pc_nsf_hifigan_raw`, `check_pc_nsf_hifigan_bpk`) que permite regenerar el artefacto a partir del checkpoint original.

Su relevancia es acotada pero concreta: abre la puerta a desplegar un vocoder de sintesis de voz cantada y correccion de tono en aplicaciones nativas Rust, entornos embebidos o pipelines sin runtime de Python. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y se publico con licencia AGPL-3.0, heredada del proyecto upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HiFiGAN con fuente neuronal NSF (neural source filter) condicionada por F0; sobremuestreo MRF con tasas [8, 8, 2, 2, 2] y tamanos de kernel [16, 16, 4, 4, 4] |
| Parametros totales | Aproximadamente 14,2 M (estimacion derivada de los 56.613.632 bytes del archivo `.bpk` en float32; el autor no publica la cifra oficial) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de audio; procesa ventanas acusticas, no secuencias de texto) |
| Tipos de cuantizacion | Unicamente FP32; el manifiesto de exportacion contiene 293 tensores, todos float32 |
| Idiomas soportados | El autor declara `en` en los metadatos, pero el modelo opera sobre caracteristicas acusticas (mel + F0) y no procesa texto, por lo que es agnostico al idioma de la voz sintetizada |
| Licencia | AGPL-3.0 (GNU Affero General Public License v3.0) |
| Formato de pesos | Burn Pack (`.bpk`), archivo unico de 56.613.632 bytes; exportacion intermedia a tensores `.npy` + `manifest.json` |

Datos adicionales de configuracion acustica: frecuencia de muestreo 44,1 kHz, hop size 512, 128 bandas mel con rango 40-16000 Hz. Los pesos se almacenan como pares de parametros de weight normalization (`weight_v` / `weight_g`), tal cual aparecen en el checkpoint upstream. El modulo de excitacion es `mini_nsf`, expuesto como `generator.source_conv`, con 512 canales iniciales de sobremuestreo.

## Arquitectura y entrenamiento

La arquitectura es un generador HiFiGAN de tipo vocoder, no un transformer ni un modelo de estado. La senal de excitacion se construye con un modulo de fuente neuronal (`mini_nsf`) condicionado por la F0 de entrada, que sustituye a la excitacion puramente armonica de los vocoders clasicos; el generador la filtra y la sobremuestrea mediante bloques MRF (multi-receptive field fusion) con tasas de upsampling [8, 8, 2, 2, 2] y kernels [16, 16, 4, 4, 4], partiendo de 512 canales. La salida es una forma de onda a 44,1 kHz con hop 512 y 128 bins mel. El control de tono es explicito: la F0 es una entrada del modelo, lo que permite corregir o transponer la altura sin regenerar la senal desde cero.

No hay informacion disponible en la documentacion proporcionada sobre el numero de tokens o muestras de audio usadas en el entrenamiento, la composicion del dataset, ni sobre si se aplicaron etapas de RLHF, DPO o ajuste por preferencias (procedimientos, por otra parte, poco habituales en vocoders). Tampoco se documenta el discriminador empleado durante el entrenamiento adversarial ni el esquema de perdidas. La innovacion tecnica que si queda documentada es de ingenieria: la conversion del checkpoint PyTorch a Burn Pack se realiza con un lector puro Rust de checkpoints PyTorch (`PytorchReader`, caracteristica `pytorch` del crate `burn-store`), sin necesidad de Python, PyTorch ni pickle. El propio autor advierte que el repositorio contiene unicamente el artefacto y las herramientas de conversion, no una aplicacion de inferencia completa, por lo que la definicion del grafo del modelo debe aportarla el consumidor.

## Capacidades

- Generacion de forma de onda de audio a 44,1 kHz a partir de espectrogramas mel de 128 bandas.
- Control explicito de la frecuencia fundamental (F0): permite correccion de tono, transposicion y vibrato sobre voz hablada o cantada.
- Excitacion neuronal condicionada por F0 mediante el modulo `mini_nsf`, orientada a voz cantada (singing voice synthesis).
- Integracion como etapa final (vocoder) de pipelines de sintesis de voz o de canto que produzcan mel + F0.
- Carga de pesos desde Rust mediante el framework Burn, sin runtime de Python.
- Regeneracion del artefacto a partir del checkpoint upstream mediante script de un solo paso (`./convert.sh`).
- Verificacion del archivo empaquetado: utilidad que carga el `.bpk` e imprime el numero de tensores y el total de bytes.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio comprensivo ni modo de razonamiento extendido.
- No es multilingue en el sentido linguistico: no procesa texto.

## Casos de uso

- Sintesis de voz cantada (SVS): el vocoder se situa al final de un pipeline que predice mel y F0 (por ejemplo, entornos tipo DiffSinger u OpenUtau, ecosistema del que procede el modelo upstream) y genera la onda final a 44,1 kHz con control fino de la afinacion.
- Correccion de tono en produccion musical: dado un mel y una curva de F0 editada, el modelo regenera la toma con la afinacion corregida sin los artefactos tipicos del pitch-shifting por procesado de senal.
- Post-procesado de TTS: un sistema de texto a voz que genere mel y F0 puede delegar la fase de vocoder en este modelo, obteniendo audio a 44,1 kHz con calidad de estudio.
- Despliegue en aplicaciones nativas Rust: al estar empaquetado como Burn Pack, puede embeberse en herramientas de escritorio, plugins de audio o servicios backend escritos en Rust sin arrastrar dependencias de Python ni PyTorch.
- Audio en tiempo real o de baja latencia: con hop 512 a 44,1 kHz el modelo avanza en tramas de unos 11,6 ms, lo que permite streaming por bloques si el backend de Burn utilizado lo soporta.
- Entornos con recursos limitados o edge: el artefacto ocupa 56,6 MB y el modelo es de tipo feed-forward, por lo que puede ejecutarse en CPU o en GPU integrada alli donde no cabe un modelo generativo grande.
- Investigacion en vocoders: sirve como referencia para comparar el comportamiento de una fuente NSF condicionada por F0 frente a vocoders HiFiGAN sin control de tono, en un formato reproducible y con codigo de conversion incluido.
- Experimentacion en Rust/WebAssembly: al usar Burn, existe la posibilidad teorica de compilar a otros backends soportados por el framework, lo que facilita prototipos fuera del ecosistema Python (sujeto a que el consumidor implemente el grafo del modelo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas objetivas (MCD, F0 RMSE, PESQ, MOS) ni comparaciones cuantitativas con otros vocoders.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos ocupa 56,6 MB en FP32; con activaciones y buffers intermedios la inferencia deberia caber holgadamente en menos de 1 GB de memoria, tanto en GPU como en CPU. Cifra orientativa, no confirmada por el autor.
- GPU recomendadas: cualquier GPU moderna con soporte de backend Burn. No se requiere A100 ni H100; una RTX 3060, RTX 4090 o incluso una GPU integrada compatible con WGPU/Vulkan serian suficientes para este tamano de modelo.
- Cabe en GPU de consumo: si, con margen amplio. Tambien en CPU mediante el backend NdArray, dado el reducido numero de parametros.
- Opciones de despliegue: el artefacto esta pensado para el framework Burn (crate Rust), con los backends que este soporte (WGPU para Vulkan/Metal/DirectX/WebGPU, CUDA, NdArray en CPU). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y al formato GGUF. Para usar el checkpoint original en Python habria que recurrir al repositorio upstream openvpi/vocoders.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tiempo real ni de factor de tiempo real (RTF) para esta conversion.
- Requisito adicional: para regenerar el `.bpk` desde cero se necesita una toolchain de Rust y una copia local del checkpoint upstream (`model.ckpt` + `config.json`) descargada del release de openvpi.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia de muestreo | Control de F0 | Formato de pesos | Licencia |
|---|---|---|---|---|---|
| PC-NSF-HiFiGAN-burn | ~14,2 M (estimado) | 44,1 kHz | Si | Burn Pack (`.bpk`) | AGPL-3.0 |
| openvpi PC-NSF-HiFiGAN (upstream, release 2025.02) | no disponible | 44,1 kHz | Si | Checkpoint PyTorch (`model.ckpt`) | AGPL-3.0 (heredada por la conversion) |
| Vocoders HiFiGAN clasicos (por ejemplo, HiFi-GAN V1) | no disponible | 22,05 kHz en la variante mas comun | No | PyTorch | no disponible |
| Vocoders tipo BigVGAN | no disponible | 44,1 kHz en las variantes de alta frecuencia | No | PyTorch | no disponible |

La comparacion se limita a rasgos estructurales porque no se dispone de metricas objetivas publicadas para el artefacto Burn ni de una evaluacion directa frente a las alternativas. La diferencia funcional mas relevante frente a los vocoders HiFiGAN sin NSF es la presencia de una fuente neuronal condicionada por F0, que habilita control de tono; la diferencia frente al checkpoint upstream es exclusivamente el formato de serializacion y el ecosistema de consumo (Rust/Burn en lugar de Python/PyTorch).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta codigo y no admite herramientas ni agentes. Cualquier expectativa en ese sentido es un error de categoria.
- El repositorio es un artefacto de modelo y conversion, no una aplicacion de inferencia completa. El consumidor debe implementar el grafo del modelo en Burn para poder usarlo.
- Solo se distribuyen pesos en FP32. No hay versiones cuantizadas a int8, fp16 o GGUF, lo que limita opciones de optimizacion de memoria.
- Riesgo de artefactos acusticos: como todo vocoder generativo, puede introducir ruido, zumbidos, inestabilidad en F0 o perdida de detalle en tramos con excitacion irregular (fricativas, silencios, ataques duros). No hay evaluacion publicada que cuantifique estos fallos.
- Sesgos: el modelo hereda los sesgos acusticos del corpus de entrenamiento upstream, que no se documenta en la informacion disponible. Al depender de F0, voces con rangos poco representados en el entrenamiento pueden degradarse.
- Limitacion de idioma: la etiqueta `en` de los metadatos es una declaracion del autor, pero el modelo no procesa texto; la cobertura linguistica real depende del sistema que genere el mel de entrada, no del vocoder.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero si se ofrece el modelo modificado como servicio en red, la AGPL obliga a poner a disposicion de los usuarios el codigo fuente correspondiente. Esto puede ser incompatible con productos propietarios que no quieran liberar su codigo.
- La conversion se declara obra derivada del checkpoint de openvpi y mantiene su licencia; conviene verificar las condiciones del proyecto upstream antes de un despliegue en produccion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin mas validacion comunitaria que la del propio autor. No hay garantia de mantenimiento.
- Fechas de publicacion inusuales (creado y actualizado el 2026-09-18), sin historial de versiones ni issues que permitan evaluar su madurez.
- La busqueda web realizada no devolvio resultados relacionados con el modelo: los enlaces recuperados corresponden a una aplicacion de ciclismo indoor y no guardan ninguna relacion con este artefacto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/maolandaw/PC-NSF-HiFiGAN-burn
- Proyecto upstream (codigo y checkpoints): https://github.com/openvpi/vocoders
- Release del checkpoint original: https://github.com/openvpi/vocoders/releases/tag/pc-nsf-hifigan-44.1k-hop512-128bin-2025.02
- Crate `burn-store` (lector PyTorch en Rust, caracteristica `pytorch`): https://crates.io/crates/burn-store
- Framework Burn: no disponible en la informacion proporcionada como enlace explicito; se referencia a traves de la etiqueta `burn` del repositorio y del crate anterior.
- Nota sobre la busqueda web: los resultados obtenidos (zwift.com, Google Play, Wikipedia) no estan relacionados con el modelo y se han descartado por no aportar informacion tecnica relevante.
