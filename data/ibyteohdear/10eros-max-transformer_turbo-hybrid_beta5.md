# ibyteohdear/10Eros-Max-Transformer_TURBO-hybrid_beta5

## Resumen

10Eros-Max-Transformer_TURBO-hybrid_beta5 es un checkpoint de difusión para generación de vídeo distribuido en formato diffusers por el usuario ibyteohdear. Se trata de un ajuste fino (fine-tune con fusión de grafts) del transformer de MiniMax-H3, un modelo de vídeo de 20.111.462.920 parámetros (unos 20,1 mil millones) cuyo objetivo declarado por el autor es conservar las capacidades del modelo base —texto a vídeo, imagen a vídeo e imagen+texto a vídeo, con pista de audio— e incorporar capacidad de generar contenido para adultos (NSFW) mediante la transferencia de rasgos procedentes de otros modelos.

El modelo se construye a partir de siete grafts agrupados por concepto y de fusiones por consenso derivadas de más de veinte LoRAs, sin fusiones directas de LoRA sobre el checkpoint, y utiliza una técnica de normalización distinta respecto a las betas anteriores. La variante TURBO incorpora una fusión delta de turbo híbrida que evita cargar por separado los turbo de referencia y full, con un ahorro declarado de 4,2 GB de memoria. El autor indica que beta_4 y beta_3 son versiones de prueba corruptas y que beta_5 es la única funcional.

Por su naturaleza, es un modelo de nicho, con 0 descargas y 1 like en el momento de la consulta, y publicado bajo la licencia comunitaria de MiniMax-H3 más las licencias de los modelos de los que proceden los rasgos transferidos (LTX 2.3, Wan 2.2 y Krea 2). No se han publicado idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion 3D para video (DiT) derivado de MiniMax-H3, con AdaLN comprimido en rango 8 y checkpoint podado |
| Parametros totales | 20.111.462.920 (aproximadamente 20,1 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); existe una version int8 externa (cicalooo/10Eros-Max-h3-int8-convrot); el codigo de ejemplo usa torchao Int8WeightOnlyConfig |
| Idiomas soportados | no disponible (el pipeline emplea un codificador de texto Qwen3-VL, pero el autor no declara idiomas) |
| Licencia | minimax-h3-community-license-agreement, con aplicacion adicional de las licencias comunitarias de LTX 2.3, Wan 2.2 y Krea 2 sobre las porciones de rasgo transferidas |
| Formato de pesos | safetensors (formato diffusers) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion para video (pipeline image-text-to-video) construido sobre el transformer de MiniMax-H3. El checkpoint publicado esta podado y emplea un AdaLN comprimido en rango 8, motivo por el cual el autor advierte que no se puede cargar con `MiniMaxH3Transformer3DModel.from_pretrained` y debe cargarse con `AutoModel.from_pretrained(..., trust_remote_code=True)`. El pipeline completo utiliza un VAE de video (`AutoencoderKLMiniMaxH3`), un VAE de audio (`AutoencoderKLMiniMaxH3Audio`) y un codificador de texto basado en `Qwen3VLForConditionalGeneration`, ademas de los bloques modulares de minimax_h3 de diffusers.

No se describe un entrenamiento convencional, sino una metodologia de injerto (grafting): el autor extrae datos de modelos NSFW previos (menciona Wan 2.2 y Krea 2) y los injerta a bajo nivel en las capas de atencion para no degradar la calidad visual ni de audio de H3. La beta_5 se apoya en siete grafts agrupados por concepto y en fusiones por consenso de mas de veinte LoRAs, sin fusion directa de LoRA. El modelo hibrido se construye sobre la fusion "delta1024 h3". El autor afirma que el proyecto es evolutivo, que dependera de ajustes de Sulphur H3 y que liberara la metodologia de grafting (documentacion y codigo) salvo los scripts. No se indica numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO.

## Capacidades

- Generacion de video a partir de texto (text-to-video).
- Generacion de video a partir de imagen (image-to-video).
- Generacion de video a partir de imagen y texto combinados (image-text-to-video).
- Generacion conjunta de pista de audio, con soporte de VAE de audio dedicado; el autor indica que la version no-turbo a pasos completos ofrece mejor audio que las versiones turbo.
- Capacidad NSFW declarada explicitamente por el autor, manteniendo las capacidades del modelo base.
- Capacidades de motion y fidelidad visual heredadas de MiniMax-H3, con los rasgos de personaje transferidos desde LTX 2.3, Wan 2.2 y Krea 2.
- Carga de LoRAs de concepto adicionales sobre el modelo con intensidades mas bajas de lo habitual (0,2-0,6).
- No se declara soporte de tool calling, function calling ni comportamiento de agente; no es un modelo de lenguaje.

## Casos de uso

- Generacion de clips cortos a partir de prompts de texto: el pipeline image-text-to-video permite describir una escena y obtener video con audio asociado, apoyandose en el transformer H3 y en el VAE de audio.
- Animacion de imagenes fijas (image-to-video): util para dar movimiento a fotografias o ilustraciones en produccion de contenido, usando la imagen como primer fotograma condicionante.
- Produccion de contenido para adultos: el autor declara explicitamente esta finalidad (nombre "Eros"); requiere verificacion de edad, cumplimiento legal y de las politicas de la plataforma de destino, dado el tag not-for-all-audiences.
- Prototipado de storyboards y prevision de escenas: generar versiones animadas de guiones o bocetos para validar encuadres y ritmo antes de rodar o renderizar en alta calidad.
- Iteracion creativa con LoRAs de concepto: al admitir LoRAs adicionales a intensidades de 0,2-0,6, permite ajustar estilo, personaje o tematica por encima del modelo base sin reentrenar.
- Investigacion sobre grafting y fusion de modelos: la publicacion de la metodologia (aun pendiente segun el autor) convierte al modelo en material de estudio para transferencia de rasgos entre modelos de difusion.
- Experimentacion con configuraciones de muestreo: el autor documenta combinaciones concretas (er_sde/beta a 4 pasos, res_multistep/simple a 6-8 pasos, LCM/simple a 6-8, Euler/simple a 4-8) que permiten estudiar el compromiso entre calidad de movimiento, audio y coste de inferencia.
- Despliegue en Hugging Face Spaces con GPU bajo demanda: el codigo de ejemplo incluye un decorador para SPACES_ZERO_GPU, lo que facilita demos publicas sin GPU siempre encendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no aporta metricas cuantitativas (FVD, CLIP score, similitud de audio, etc.) ni comparaciones numericas con el modelo base o con modelos equivalentes.

## Requisitos de hardware

- Peso de los parametros: 20.111.462.920 parametros, aproximadamente 40,2 GB en bf16 (coincide con el tamano del repositorio, 40,2 GB) y unos 20 GB en int8.
- VRAM estimada: por encima de 40 GB solo para el transformer en bf16, a lo que hay que sumar VAE de video, VAE de audio y codificador de texto Qwen3-VL; en la practica se recomienda 80 GB para bf16 y 24-48 GB para la variante int8, siempre segun la resolucion y la duracion del clip.
- GPU recomendadas: A100 80 GB, H100 80 GB o equivalentes para bf16; RTX 4090 (24 GB), A6000 (48 GB) o L40S para configuraciones int8 o con offload.
- Cabe en GPU de consumo: la version int8 podria caber en una RTX 4090, pero con margen ajustado una vez cargados los VAEs y el codificador de texto; no hay datos oficiales de consumo real.
- Opciones de despliegue: diffusers con `AutoModel.from_pretrained` y `trust_remote_code=True`, bloques modulares de minimax_h3, cuantizacion con torchao (Int8WeightOnlyConfig) y ejecucion en Hugging Face Spaces con GPU bajo demanda.
- Latencia y throughput: no disponibles. El autor solo indica numeros de pasos de muestreo (4 a 8 segun el sampler) y que los archivos TURBO ahorran 4,2 GB de memoria frente a cargar los turbo de referencia y full por separado.
- Nota: no es compatible con vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 10Eros-Max-Transformer_TURBO-hybrid_beta5 | 20,1 mil millones | no disponible | sin benchmarks publicados | minimax-h3-community-license-agreement + licencias de LTX 2.3, Wan 2.2 y Krea 2 | Hugging Face, 0 descargas, 1 like |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | no disponible | no disponible | minimax-h3-community-license-agreement | modelo base referenciado |
| Wan 2.2 | no disponible | no disponible | no disponible | no disponible | fuente de datos NSFW segun el autor |
| LTX 2.3 | no disponible | no disponible | no disponible | no disponible | fuente de rasgo de personaje |
| Krea 2 | no disponible | no disponible | no disponible | no disponible | fuente de datos segun el autor |

No se dispone de datos verificables de parametros, contexto ni rendimiento de los modelos comparados mas alla de su mencion como origen de rasgos o como modelo base.

## Limitaciones y advertencias

- Contenido NSFW: el modelo esta disenado para generar material para adultos y lleva el tag not-for-all-audiences; no es apto para menores ni para plataformas con politicas restrictivas.
- Riesgo legal y de cumplimiento: la generacion de contenido explicito exige verificacion de edad, cumplimiento de la legislacion aplicable y de las condiciones de uso del servicio donde se despliegue.
- Licencia no estandar: se aplica la licencia comunitaria de MiniMax-H3 y, ademas, las licencias de LTX 2.3, Wan 2.2 y Krea 2 sobre las porciones de rasgo transferidas, lo que puede complicar el uso comercial y la redistribucion.
- Versiones corruptas: el autor advierte que beta_3 y beta_4 estan corruptas y que beta_5 es la unica funcional; deben evitarse las betas anteriores.
- Carga no estandar: el checkpoint esta podado con AdaLN comprimido en rango 8 y requiere `AutoModel.from_pretrained` con `trust_remote_code=True`; usar `MiniMaxH3Transformer3DModel.from_pretrained` falla.
- Sensibilidad al muestreo y al prompt: el autor insiste en que la calidad depende criticamente de la configuracion de muestreo y del prompt; no hay valores por defecto garantizados.
- Incompatibilidades: no se deben usar cache ni spectrum al trabajar con referencia, porque provocan perdida de precision segun el autor.
- Proyecto inestable: el autor lo describe como evolutivo y dependiente de futuros ajustes de entrenamiento de H3, por lo que la reproducibilidad y el soporte a largo plazo no estan garantizados.
- Ausencia de benchmarks: no hay metricas que permitan cuantificar calidad, fidelidad o coherencia temporal.
- Idiomas no declarados: no se especifican los idiomas soportados para los prompts.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar artefactos, incoherencias temporales o resultados alejados del prompt; no hay datos sobre su frecuencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibyteohdear/10Eros-Max-Transformer_TURBO-hybrid_beta5
- Modelo base MiniMaxAI/MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia comunitaria de MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Version int8: https://huggingface.co/cicalooo/10Eros-Max-h3-int8-convrot
- Creditos de LoRAs: pagina de Civitai mencionada por el autor, sin URL disponible en la informacion proporcionada.
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
