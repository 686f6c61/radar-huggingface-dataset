# pinecoresystems/VoxCPM2

## Resumen

VoxCPM2 es un modelo de sintesis de voz (text-to-speech) de 2.290.004.544 parametros (aproximadamente 2,29 mil millones) desarrollado por OpenBMB. El repositorio analizado, `pinecoresystems/VoxCPM2`, es un espejo sin modificaciones publicado por TinyPine Studio para que su instalador no dependa de enlaces de descarga de terceros. TinyPine no ha entrenado ni alterado el modelo; el artefacto original es `openbmb/VoxCPM2`. El modelo se distribuye bajo licencia Apache 2.0, en formato `safetensors` junto con componentes auxiliares en PyTorch (`.pth`), y ocupa 5,1 GB en el repositorio.

La propuesta tecnica de VoxCPM2 es un enfoque *tokenizer-free* para sintesis multilingue, construido sobre un backbone MiniCPM-4 y entrenado con 2,36 millones de horas de audio multilingue. Frente a la serie 1.x, el salto es de capacidad, calidad y control: soporte de 30 idiomas, salida de audio a 48 kHz, clonacion de voz controlable y una funcionalidad de diseno de voz (*voice design*) que permite definir timbres sin necesidad de una muestra de referencia. Es relevante ahora porque cubre el hueco de TTS abierto, de alta calidad y con marca de agua integrada, un requisito creciente en despliegues comerciales.

El espejo incluye ademas el generador y el detector de marcas de agua AudioSeal de Meta (licencia MIT), que TinyPine embebe en cada clip que produce. Esto posiciona al paquete como una solucion lista para produccion con trazabilidad del audio sintetico, aunque conviene tener presente que el watermark solo se aplica si se utiliza ese componente: el modelo subyacente puede ejecutarse sin el.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone MiniCPM-4; sintesis TTS *tokenizer-free* (no disponible el detalle completo de capas) |
| Parametros totales | 2.290.004.544 (aproximadamente 2,29 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de sintesis de voz; la informacion no especifica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye `safetensors` y ficheros `.pth`; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | 30 idiomas segun la documentacion de VoxCPM 2; la model card del espejo no detalla la lista |
| Licencia | Apache 2.0 (componente AudioSeal bajo licencia MIT) |
| Formato de pesos | `safetensors` (`model.safetensors`) mas `audiovae.pth` y `audioseal/generator_base.pth`, `audioseal/detector_base.pth` en PyTorch |

## Arquitectura y entrenamiento

VoxCPM2 emplea un backbone MiniCPM-4 y un pipeline de sintesis de voz sin tokenizador (*tokenizer-free*), lo que evita la discretizacion intermedia del audio tipica de los enfoques basados en codecs de tokens. El modelo se entrena sobre 2,36 millones de horas de habla multilingue, una cifra que lo situa en la liga de los sistemas TTS de gran escala. La salida se genera a 48 kHz, frecuencia de muestreo propia de estudio y superior a los 16-24 kHz habituales en TTS open source. El repositorio incluye el autoencoder de audio `audiovae.pth`, que forma parte del decodificador de waveform.

No se especifican en la informacion disponible los detalles de composicion del dataset, el numero exacto de tokens de entrenamiento, ni si se aplicaron etapas de RLHF, DPO o ajuste por preferencias humanas. Tampoco se documentan innovaciones concretas de decodificacion (por ejemplo, decodificacion especulativa o atencion lineal) mas alla de la etiqueta *tokenizer-free*. La integracion de AudioSeal permite embeber una marca de agua imperceptible en el audio generado, con un detector asociado para verificarla, lo que constituye una diferencia funcional relevante respecto a otros TTS abiertos. Los hashes SHA-256 de los ficheros grandes estan publicados en la model card, lo que facilita la verificacion de integridad en despliegues automatizados.

## Capacidades

- Sintesis de voz multilingue en 30 idiomas, con salida de audio a 48 kHz.
- Clonacion de voz (*voice cloning*) controlable a partir de muestras de referencia.
- Diseno de voz (*voice design*): generacion de timbres nuevos sin muestra de audio previa.
- Control de expresividad y prosodia en la sintesis, segun la documentacion del proyecto.
- Generacion de marcas de agua con AudioSeal (generador y detector incluidos en el repositorio).
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta comportamiento de agente ni razonamiento multi-paso; es un modelo especializado en voz, no un modelo de lenguaje general.
- No se documentan capacidades de vision, audio de entrada (ASR) ni comprension de texto.

## Casos de uso

- **Audiolibros y narracion larga**: el modelo genera voz a 48 kHz apta para publicacion, y la clonacion permite mantener un timbre consistente a lo largo de un libro completo. Conviene trocear el texto por parrafos, ya que la documentacion advierte de inestabilidad con entradas muy largas.
- **Doblaje y localizacion de contenido**: con 30 idiomas soportados, un mismo guion puede sintetizarse en varias lenguas manteniendo la identidad vocal del locutor original mediante clonacion, lo que reduce costes frente al doblaje tradicional.
- **Asistentes de voz y agentes conversacionales**: integrado aguas abajo de un LLM y un sistema de reconocimiento de voz, permite construir interfaces habladas de baja latencia para aplicaciones de atencion al cliente o domotica.
- **Diseno de personajes para videojuegos y animacion**: la funcion de *voice design* permite crear voces para NPC sin contratar locutores ni disponer de muestras previas, iterando sobre el timbre antes de fijar una version final.
- **Accesibilidad**: lectores de pantalla y sistemas de comunicacion aumentativa pueden usar una voz clonada del propio usuario, lo que mejora la aceptacion frente a voces sinteticas genericas en personas con perdida de habla.
- **Produccion publicitaria y demos de producto**: generacion rapida de locuciones para anuncios, podcast y prototipos, con marca de agua AudioSeal embebida que acredita el origen sintetico del audio.
- **Generacion de datos sinteticos para entrenamiento**: permite crear corpus de habla etiquetados en varios idiomas para entrenar o aumentar sistemas ASR y TTS, siempre que se respeten las condiciones de la licencia y la normativa aplicable.
- **Localizacion de contenido corporativo**: formacion interna, manuales de seguridad y material e-learning multilingue con una voz de marca unica y consistente entre idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del espejo ni los extractos de la documentacion consultados incluyen cifras de MOS, WER, similitud de hablante (SECS) ni comparativas numericas con otros sistemas TTS.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento real de parametros (2.290.004.544) y del tamano del repositorio (5,1 GB); no proceden de documentacion oficial.

- **VRAM estimada para inferencia (solo pesos)**: aproximadamente 4,6 GB en fp16/bf16; en torno a 2,3 GB con cuantizacion a 8 bits y unos 1,2 GB a 4 bits, si se generan variantes cuantizadas (no publicadas).
- **VRAM total recomendada**: 6-8 GB en fp16 contando el autoencoder de audio, el watermark AudioSeal y los buffers de activacion para audio a 48 kHz.
- **GPU consumer**: cabe con holgura en una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 y en GPUs Apple Silicon con memoria unificada de 16 GB o mas. En GPUs de 8 GB puede ser ajustado en fp16 y mas holgado si se cuantiza.
- **GPU de datacenter**: A100, H100, L40S y similares. Para servir a muchos usuarios concurrentes, el modelo es lo bastante pequeno como para replicar varias instancias por GPU.
- **Opciones de despliegue**: al publicarse solo en `safetensors` y `.pth`, el despliegue pasa por PyTorch con el codigo oficial de OpenBMB. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama para este repositorio, ni variantes GGUF.
- **Latencia y throughput**: no disponibles. No se publican mediciones de RTF (factor de tiempo real) ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| VoxCPM2 (este repositorio) | 2,29 mil millones | 30 idiomas, salida 48 kHz | Apache 2.0 | Espejo en HuggingFace, `safetensors` | Incluye AudioSeal; *tokenizer-free*; backbone MiniCPM-4 |
| VoxCPM serie 1.x | no disponible | no disponible | no disponible | Upstream OpenBMB | Predecesor directo; la documentacion lo describe como menor capacidad, calidad y control |
| Otros TTS open source comparables (XTTS-v2, F5-TTS, Kokoro) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada; se recomienda consultar las fichas oficiales antes de comparar |

No se dispone de datos verificados suficientes para una comparativa cuantitativa rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- **Es un espejo, no un modelo propio**: `pinecoresystems/VoxCPM2` replica `openbmb/VoxCPM2` sin modificaciones. El soporte, las actualizaciones y la documentacion dependen del equipo de OpenBMB, no de TinyPine.
- **Sin benchmarks publicados**: no hay cifras verificables de MOS, similitud de hablante ni tasa de error, por lo que la evaluacion de calidad debe hacerse de forma empirica sobre el dominio objetivo antes de llevarlo a produccion.
- **Inestabilidad documentada**: la documentacion oficial advierte de que el modelo puede mostrar inestabilidad, especialmente con entradas muy largas o muy expresivas. Es recomendable dividir el texto en fragmentos y validar la salida.
- **Uso indebido y clonacion de voz**: la clonacion de voz permite suplantar identidades. La documentacion prohibe explicitamente usos ilegales o poco eticos y recomienda marcar el contenido generado como sintetico. El cumplimiento normativo (por ejemplo, obligaciones de etiquetado de contenido generado por IA) es responsabilidad del desplegador.
- **Marca de agua condicional**: AudioSeal solo se aplica si se usa el componente incluido en el pipeline de TinyPine. Ejecuciones del modelo sin ese componente no incorporaran la marca de agua, lo que reduce la trazabilidad.
- **Cobertura idiomatica desigual**: se anuncian 30 idiomas, pero no se publica una evaluacion de calidad por idioma; el rendimiento en lenguas con pocos datos de entrenamiento puede ser inferior.
- **Licencia Apache 2.0**: permite uso comercial y modificacion, pero obliga a conservar los avisos de licencia y atribucion. El componente AudioSeal se rige por MIT; conviene revisar `audioseal/LICENSE` de forma independiente.
- **Adopcion nula en este espejo**: el repositorio figura con 0 descargas y 0 likes, por lo que no existe validacion de la comunidad sobre este artefacto concreto; a efectos practicos, conviene tratar el upstream como referencia.
- **Datos de contexto ausentes**: no se especifica ventana de contexto, composicion del dataset de entrenamiento ni procesos de alineacion (RLHF/DPO), lo que limita la reproducibilidad.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/pinecoresystems/VoxCPM2
- Modelo original (upstream): https://huggingface.co/openbmb/VoxCPM2
- Repositorio de codigo en GitHub: https://github.com/OpenBMB/VoxCPM
- Documentacion de VoxCPM 2: https://voxcpm.readthedocs.io/en/latest/models/voxcpm2.html
- Documentacion general de VoxCPM: https://voxcpm.readthedocs.io/en/latest/
- Sitio web del proyecto: https://voxcpm.com/en/
- Espejo alternativo de terceros: https://huggingface.co/FenomAI/VoxCPM2
- AudioSeal (Meta, MIT): https://huggingface.co/facebook/audioseal
