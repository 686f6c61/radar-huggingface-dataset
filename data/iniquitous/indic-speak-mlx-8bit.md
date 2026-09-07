# iniquitous/indic-speak-mlx-8bit

## Resumen

indic-speak-mlx-8bit es una conversión MLX de 8 bits del modelo de texto a voz Indic-Speak, desarrollado por Bodhan AI / AI4Bharat en colaboración con IIT Madras. La conversión ha sido realizada por la comunidad (usuario iniquitous) y no es un lanzamiento oficial de Bodhan AI. El modelo original está basado en Llama-3.2-3B y está diseñado para sintetizar voz en 22 idiomas de la India y en inglés, lo que lo convierte en una herramienta relevante para aplicaciones de voz multilingües en el subcontinente indio.

Esta variante cuantizada a 8 bits (group size 64, 8.5 bits/weight) reduce el tamaño de los pesos del modelo de lenguaje a 3.3 GB, manteniendo una calidad cercana a bf16. Está optimizada para ejecutarse en Apple Silicon mediante MLX, y ofrece una velocidad de decodificación de aproximadamente 48 tokens por segundo en un M3 Max de 36 GB. Incluye además un script propio (`tts_mlx.py`) que añade funcionalidades de streaming y división por frases para mitigar los problemas de generación en entradas largas.

El modelo no es un entrenamiento nuevo, sino una adaptación del modelo upstream, por lo que hereda sus capacidades y su licencia (Indic Open Model License v1.0). Su relevancia radica en permitir ejecutar un TTS multilingüe de alta calidad en hardware de Apple de forma local, sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3.2-3B) |
| Parametros totales | 3.300.928.512 (3.3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit (group size 64), 8.5 bits/weight; otras variantes: 4-bit, 6-bit, mixed, bf16 |
| Idiomas soportados | en, hi, bn, mr, te, ta, gu, kn, ml, or, pa, as, ur, brx, doi, kok, ks, mai, ne, mni, sa, sat, sd (22 idiomas indios + ingles) |
| Licencia | Indic Open Model License v1.0 (sujeta a Llama 3.2 Community License) |
| Formato de pesos | Safetensors (MLX) para el LM; Vocos en torch/MPS |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama-3.2-3B, un transformer decoder-only, adaptado para tareas de texto a voz mediante un codificador SNAC (`hubertsiuzdak/snac_24khz`) y un decodificador Vocos afinado por Bodhan AI. El pipeline completo combina el modelo de lenguaje (LM) que genera tokens de audio, el cuantizador SNAC que convierte estos tokens en representaciones de audio, y Vocos que reconstruye la forma de onda. Esta conversión MLX mantiene el LM en formato safetensors y carga el cuantizador SNAC y Vocos en torch/MPS.

No se ha proporcionado información detallada sobre el proceso de entrenamiento del modelo upstream (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La model card de esta conversión indica que es una adaptación directa del modelo original, por lo que no se han realizado entrenamientos adicionales. Una innovación técnica destacable de esta conversión es el parche de configuración de RoPE: el `config.json` incluye tanto las claves `rope_parameters` (usadas por transformers v5) como `rope_theta` y `rope_scaling` (usadas por mlx-lm ≤ 0.31), evitando una generación inestable que se produciría con una conversión ingenua.

## Capacidades

- Generación de texto a voz en 22 idiomas de la India y en inglés.
- Soporte de múltiples voces: una femenina y una masculina por idioma (por ejemplo, Kavya/Amit en hindi, Anitha/Arun en tamil), con la posibilidad de que cualquier voz hable cualquier idioma.
- Control de estilo mediante etiquetas emocionales en mayúsculas (`ANGER`, `HAPPY`, `SAD`, `FEAR`) y frases de texto libre; las etiquetas de entrega en minúsculas son menos fiables.
- Funcionalidad de streaming en tiempo real, que produce fragmentos de audio de aproximadamente 0,7 segundos mientras la generación sigue en curso.
- División automática de texto largo por límites de oración (। . ! ?) con límite de tokens por frase y recorte de silencio, mediante `speak_long` y `stream_long`.
- Ejecución local en Apple Silicon mediante MLX, sin necesidad de servicios en la nube.

## Casos de uso

- Aplicaciones de accesibilidad: el modelo puede convertir contenido digital (noticias, libros, interfaces) a voz en hindi, tamil, bengalí u otros idiomas indios, permitiendo a personas con discapacidad visual acceder a la información en su lengua materna. Su ejecución local en Apple Silicon garantiza privacidad y bajo coste.
- Asistentes de voz multilingües: gracias al soporte de 22 idiomas indios y inglés, el modelo puede integrarse en asistentes de voz para dispositivos Apple, ofreciendo respuestas habladas en el idioma del usuario. La capacidad de streaming permite una latencia baja en interacciones conversacionales.
- Narración de audiolibros y contenido educativo: el modelo puede generar narraciones de largos textos en múltiples idiomas, con control de estilo emocional para adaptar la entonación (por ejemplo, `HAPPY` para contenido infantil). La función `speak_long` divide el texto en frases y evita cortes prematuros en entradas extensas.
- Sistemas de respuesta de voz interactiva (IVR): en servicios de atención al cliente en India, el modelo puede sintetizar respuestas en el idioma regional del usuario, reduciendo la necesidad de personal multilingüe. La licencia requiere aprobación de Bodhan AI para alojar el modelo como servicio para terceros, por lo que es adecuado para despliegues internos o con permiso explícito.
- Generación de contenido para redes sociales y vídeo: los creadores pueden usar el modelo para generar narraciones en hindi o en otros idiomas indios para vídeos de YouTube, TikTok o Instagram, aprovechando las voces masculinas y femeninas disponibles y el control de emociones.
- Traducción de textos a voz para periodismo y documentación: medios de comunicación pueden convertir artículos escritos en audio, permitiendo a los usuarios escuchar noticias en su idioma local. El modelo soporta 22 idiomas, lo que cubre una gran parte de la diversidad lingüística de la India.
- Educación y e-learning: plataformas educativas pueden generar lecciones narradas en idiomas regionales, con estilos como `educational lecture` (aunque menos fiables) o emociones para mantener el interés. El modelo se ejecuta localmente, lo que puede ser ventajoso en entornos con conexión limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona únicamente una velocidad de decodificación de aproximadamente 48 tokens por segundo en un M3 Max de 36 GB, y que la calidad se comprobó en hindi mediante estadísticas de duración y silencio y escucha, sin un benchmark formal de WER o MOS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para GPU NVIDIA; en Apple Silicon, el LM de 3.3 GB más el overhead de SNAC y Vocos requiere memoria unificada, siendo adecuado un M3 Max de 36 GB según las pruebas del autor.
- GPU recomendadas: Apple Silicon (M3 Max mencionado). No se han proporcionado datos para GPUs NVIDIA o AMD.
- ¿Cabe en consumer GPU?: no disponible, ya que la conversión está orientada a MLX y Apple Silicon.
- Opciones de despliegue: MLX mediante el script `tts_mlx.py`; también se puede usar con mlx-lm para la carga del LM. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~48 tok/s en M3 Max (36 GB) en una sola secuencia; la velocidad cae aproximadamente un 25% cuando el chip sufre throttling térmico.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Idiomas | Velocidad | Licencia |
|---|---|---|---|---|---|
| iniquitous/indic-speak-mlx-8bit | 3.3B | 8-bit (group size 64) | 22 indios + ingles | ~48 tok/s (M3 Max) | Indic Open Model License v1.0 |
| bodhan-ai/indic-speak (upstream) | No disponible | bf16 | 22 indios + ingles | No disponible | Indic Open Model License v1.0 |
| yogenghodke/indic-parler-tts-mlx-q8 | No disponible | 8-bit | ~14 indios + ingles | ~3-4x mas rapido que baseline MLX sin cuantizar | No disponible |

Otras variantes de iniquitous: 4-bit, 6-bit, mixed, bf16, que ofrecen diferentes balances entre calidad y velocidad.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible.
- Riesgo de alucinación: en tareas de TTS, la generación inestable puede manifestarse como paradas tempranas, silencio prolongado o duración variable entre semillas, especialmente en prompts largos. La model card advierte que las variantes cuantizadas tienden a parar antes o derivar en entradas de múltiples frases.
- Limitaciones de contexto o idioma: el modelo está optimizado para frases cortas y medias; para textos largos se recomienda usar `speak_long` o `stream_long`, que dividen por frases y limitan tokens. Las etiquetas de estilo en minúsculas (por ejemplo, `educational lecture`) son menos fiables que las emociones en mayúsculas.
- Restricciones de licencia: la Indic Open Model License v1.0 exige atribución, que los derivados mantengan la misma licencia, y requiere aprobación escrita de Bodhan AI para alojar el modelo como servicio para terceros. Además, la lista de usos prohibidos se aplica. El modelo base Llama 3.2 está sujeto a la Llama 3.2 Community License.
- Caveat importante para producción: si se convierte el modelo upstream manualmente sin copiar las claves `rope_parameters` a `rope_theta` y `rope_scaling`, la generación será inestable. Esta conversión ya incluye el parche, pero es crucial mantenerlo en cualquier adaptación posterior.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/iniquitous/indic-speak-mlx-8bit
- Modelo base (bodhan-ai/indic-speak): https://huggingface.co/bodhan-ai/indic-speak
- Licencia Indic Open Model License v1.0: https://github.com/Bodhan-AI/bodhan-model-info/blob/main/licenses/indic-open-model-license/v1/Indic_Open_Model_License.md
- Llama 3.2 Community License: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Variantes MLX de iniquitous:
  - 4-bit: https://huggingface.co/iniquitous/indic-speak-mlx-4bit
  - 6-bit: https://huggingface.co/iniquitous/indic-speak-mlx-6bit
  - mixed: https://huggingface.co/iniquitous/indic-speak-mlx-mixed
  - bf16: https://huggingface.co/iniquitous/indic-speak-mlx-bf16
- Modelo comparable (indic-parler-tts-mlx-q8): https://huggingface.co/yogenghodke/indic-parler-tts-mlx-q8
