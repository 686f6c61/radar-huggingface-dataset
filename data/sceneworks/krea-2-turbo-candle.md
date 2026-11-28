# SceneWorks/krea-2-turbo-candle

## Resumen

krea-2-turbo-candle es una conversión al formato nativo de Candle (el framework de tensores e inferencia en Rust desarrollado por Hugging Face) del modelo de difusión Krea-2-Turbo, publicado por el usuario SceneWorks. Se trata de una redistribución de pesos en tiers cuantizados GGML (Q4_1 y Q8_0) pensada para ejecutar el modelo con la librería `candle` en Windows y Linux, mientras que las versiones MLX del mismo autor cubren macOS. El modelo base es krea/Krea-2-Turbo, un modelo de difusión texto-a-imagen de la familia Krea.

El repositorio no contiene un modelo entrenado desde cero ni un fine-tune nuevo: es un artefacto de empaquetado y cuantización. La model card indica que el tier q4 se obtiene de forma sin pérdida a partir del tier q4 de MLX y que el tier q8 se cuantiza a Q8_0 desde los pesos bf16 del transformer y del text_encoder. Cada capa lineal cuantizada se almacena como un único tensor U8 de forma [out, in/32, block_bytes], con la configuración de cuantización declarada en `config.json`.

Su relevancia es de nicho pero clara: permite a desarrolladores que trabajan en el ecosistema Rust/Candle desplegar un modelo de difusión de última generación sin depender de PyTorch ni de toolchains de Python, y ofrece tiers de cuantización listos para usar en lugar de exigir una conversión manual. El tamaño del repositorio (33,5 GB) refleja que incluye varios tiers de pesos. No se dispone de información sobre arquitectura interna, número de parámetros ni datos de entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion texto-a-imagen; detalles internos no publicados en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_1 (tier q4, convertido sin perdida desde MLX q4) y Q8_0 (tier q8, cuantizado desde bf16); almacenamiento GGML con tensores U8 de forma [out, in/32, block_bytes] |
| Idiomas soportados | no disponible (modelo de generacion de imagen; el prompt de texto depende del text_encoder, sin lista de idiomas publicada) |
| Licencia | krea-2-community-license (licencia comunitaria, no OSI; ver enlace al PDF en la model card) |
| Formato de pesos | safetensors y bloques GGUF/GGML (`gguf-blocks`), libreria `candle` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Krea-2-Turbo en la documentacion proporcionada: no se detalla si emplea un transformer de difusion, un UNet, un esquema MM-DiT o variantes con atencion lineal, ni se indican el numero de parametros, la profundidad o las dimensiones de las capas. Lo unico verificable es que el modelo incluye al menos un transformer y un text_encoder, ya que la model card menciona que el tier q8 se cuantiza desde los pesos bf16 de ambos componentes.

Respecto al entrenamiento, no hay datos sobre volumen de tokens, composicion del dataset, uso de RLHF/DPO ni etapas de ajuste. La contribucion tecnica de este repositorio concreto es de ingenieria de despliegue: la conversion de pesos a bloques GGML compatibles con Candle mediante la herramienta `candle_gen::ggml_tier` del proyecto SceneWorks/inference, la preservacion sin perdida del tier q4 de MLX y la cuantizacion Q8_0 desde bf16. No se documentan innovaciones de decodificacion especulativa ni tecnicas de atencion.

## Capacidades

- Generacion de imagenes a partir de prompts de texto, heredadas del modelo base Krea-2-Turbo (no se detallan modalidades adicionales).
- Codificacion de texto mediante el text_encoder incluido en el tier q8.
- Ejecucion nativa en Rust a traves de la libreria `candle`, sin dependencia de PyTorch en tiempo de inferencia.
- Seleccion de tier de cuantizacion (q4 o q8) segun el compromiso entre calidad y memoria.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Integracion de generacion de imagenes en servicios backend escritos en Rust: al estar empaquetado para Candle, permite incorporar el modelo a un servidor Axum o Actix sin un proceso Python separado, reduciendo la superficie de despliegue.
- Despliegue en Windows y Linux con un unico artefacto: la model card indica que estos tiers estan pensados para Windows/Linux (macOS usa los tiers MLX), lo que simplifica la matriz de plataformas en equipos de desarrollo heterogeneos.
- Prototipado con memoria limitada usando el tier q4: al ser una conversion sin perdida del tier q4 de MLX, permite iterar sobre prompts y pipelines con menor huella de memoria que los pesos bf16.
- Generacion de assets en pipelines de contenido: el modelo puede producir imagenes a partir de descripciones textuales en flujos automatizados de creacion de material grafico, siempre que la licencia comunitaria lo permita.
- Investigacion en inferencia Rust: sirve como banco de pruebas para medir el rendimiento de Candle con bloques GGML en tareas de difusion, comparando q4 frente a q8.
- Evaluacion de calidad de cuantizacion: al ofrecer dos tiers derivados de forma distinta (sin perdida desde MLX frente a Q8_0 desde bf16), permite estudiar el impacto de cada ruta de conversion en la fidelidad de las imagenes generadas.
- Reproducibilidad de artefactos: el repositorio fija el commit de origen (`d0096740...`) del proyecto MLX, lo que facilita auditar de que pesos exactos se derivaron los tiers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el repositorio completo ocupa 33,5 GB e incluye varios tiers, por lo que la VRAM necesaria depende del tier cargado y no puede calcularse sin conocer el numero de parametros.
- GPU recomendadas: no disponibles en la documentacion. Al ejecutarse con Candle, es compatible con backends CUDA y Metal (este ultimo cubierto por los tiers MLX en macOS), pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del repositorio sugiere que el tier q4 es el candidato mas viable en GPUs de consumo, pero no hay cifras publicadas.
- Opciones de despliegue: libreria `candle` (Rust) como via principal; los pesos en safetensors y bloques GGUF podrian evaluarse con otras herramientas, pero la model card solo garantiza el uso con Candle.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa. Como referencia estructural, este repositorio se relaciona con SceneWorks/krea-2-turbo-mlx (mismos pesos, formato MLX para macOS) y con el modelo base krea/Krea-2-Turbo, pero no se dispone de parametros, contexto ni metricas de ninguno de ellos para tabular una comparativa.

## Limitaciones y advertencias

- La licencia krea-2-community-license no es una licencia de codigo abierto OSI; es imprescindible revisar el PDF enlazado en la model card antes de cualquier uso comercial o redistribucion.
- El repositorio es un artefacto de conversion, no un modelo validado de forma independiente: no hay benchmarks publicados que confirmen que la cuantizacion Q4_1 o Q8_0 preserve la calidad del modelo original.
- Riesgo de alucinacion y sesgos: no documentados para este artefacto; los sesgos del modelo base se heredan sin que la model card los describa.
- Idiomas soportados no especificados: el comportamiento multilingue del text_encoder es desconocido.
- La model card esta enfocada a Windows/Linux y remite a los tiers MLX para macOS; usarlo fuera de ese ecosistema puede requerir trabajo adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se detallan requisitos de memoria ni latencias, por lo que el dimensionamiento de produccion debe hacerse de forma empirica.
- Al derivar de pesos de terceros, la trazabilidad legal y tecnica depende de la cadena Krea-2-Turbo -> MLX -> Candle, con el commit de origen fijado en la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SceneWorks/krea-2-turbo-candle
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Repositorio MLX de origen: https://huggingface.co/SceneWorks/krea-2-turbo-mlx
- Licencia (PDF): https://huggingface.co/SceneWorks/krea-2-turbo-mlx/blob/main/LICENSE.pdf
- Proyecto de inferencia del autor: https://github.com/SceneWorks/inference (referenciado como `SceneWorks/inference`)
- Candle (framework de inferencia): https://github.com/huggingface/candle
