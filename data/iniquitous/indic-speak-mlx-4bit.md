# iniquitous/indic-speak-mlx-4bit

## Resumen

`indic-speak-mlx-4bit` es una conversión comunitaria al formato MLX del modelo `bodhan-ai/indic-speak`, un sistema de texto a voz (TTS) desarrollado por Bodhan AI / AI4Bharat, IIT Madras. El modelo original está construido sobre un núcleo de lenguaje Llama-3.2-3B, que en esta adaptación genera tokens de audio cuantizados mediante un cuantizador SNAC, y reconstruye la forma de onda con un decodificador Vocos. Esta variante 4-bit (grupo de 64, 4,5 bits por peso) está optimizada para ejecutarse en Apple Silicon, donde alcanza velocidades de decodificación cercanas al tiempo real en un M3 Max.

La relevancia de esta conversión radica en que acerca un modelo TTS multilingüe de alto rendimiento a hardware de consumo local, sin necesidad de servicios en la nube. Soporta 22 idiomas indios y inglés, con voces masculinas y femeninas por idioma y control de estilo emocional. Al ser una cuantización 4-bit, el peso del modelo de lenguaje ocupa 1,8 GB, lo que permite ejecutarlo en portátiles Mac con memoria unificada. No es una versión oficial de Bodhan AI, sino una adaptación de la comunidad que mantiene la misma licencia que el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-3.2-3B (decoder-only transformer) como modelo de lenguaje de voz, con cuantizador SNAC y decodificador Vocos |
| Parametros totales | 3.300.928.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (grupo 64, 4,5 bits/peso); tambien existen variantes 6-bit, 8-bit, mixed y bf16 en el mismo repositorio |
| Idiomas soportados | en, hi, bn, mr, te, ta, gu, kn, ml, or, pa, as, ur, brx, doi, kok, ks, mai, ne, mni, sa, sat, sd |
| Licencia | Indic Open Model License v1.0 (el modelo base esta sujeto ademas a la Llama 3.2 Community License) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un sistema TTS en tres etapas: un modelo de lenguaje (Llama-3.2-3B) recibe texto y genera tokens de audio discretos, que son producidos por el cuantizador SNAC a 24 kHz. Estos tokens se pasan al decodificador Vocos, previamente ajustado por Bodhan AI, para reconstruir la forma de onda. La conversion a MLX mantiene la arquitectura original, pero incluye un parche importante en `config.json`: transformers v5 escribe la configuracion RoPE de Llama-3 bajo `rope_parameters`, mientras que mlx-lm (version 0.31 o anterior) lee `rope_theta` y `rope_scaling`. Sin este ajuste, la generacion es inestable (paradas tempranas, silencios prolongados y duraciones variables entre semillas). En esta conversion, `config.json` contiene ambos conjuntos de claves para que cargue correctamente.

No se han publicado detalles sobre los datos de entrenamiento, el numero de tokens ni procesos de RLHF o DPO. El entrenamiento original fue realizado por Bodhan AI / AI4Bharat, pero la informacion disponible no incluye especificaciones sobre el corpus o el metodo de alineacion.

## Capacidades

- Generacion de voz (TTS) en 22 idiomas indios y ingles, con una voz femenina y una masculina por idioma (por ejemplo, en hindi: Kavya y Amit; en tamil: Anitha y Arun).
- Cualquier voz puede hablar cualquier idioma, independientemente del idioma original.
- Control de estilo mediante etiquetas de emocion en mayusculas: `ANGER`, `HAPPY`, `SAD`, `FEAR`, etc. Tambien acepta frases de texto libre, aunque las etiquetas de entrega en minusculas (como `educational lecture`) son menos fiables.
- Generacion de audio en streaming: `stream_long` produce fragmentos de aproximadamente 0,7 segundos mientras la generacion sigue en curso, con una calidad equivalente a la decodificacion offline (diferencia inferior a 1e-4).
- Segmentacion automatica por frases con `speak_long`, que divide el texto en oraciones, limita los tokens por frase y recorta silencios, lo que mejora la estabilidad en textos largos.
- No soporta generacion de texto general, razonamiento, codigo, matematicas, vision, tool calling ni agentes. Es exclusivamente un modelo de texto a voz.

## Casos de uso

- Accesibilidad para personas con discapacidad visual en India: el modelo puede leer articulos, libros electronicos o noticias en lenguas regionales como hindi, tamil, bengali o telugu, directamente en un Mac con MLX.
- Asistentes de voz locales en macOS: gracias a la ejecucion en Apple Silicon y a la velocidad cercana a tiempo real, se puede integrar en aplicaciones de escritorio que necesiten sintesis de voz sin conexion.
- Narracion de contenido educativo: profesores y creadores de cursos pueden generar audio de material didactico en idiomas indios, con control de emocion para adaptar la entonacion a cada contexto.
- Servicios de atencion al cliente multilingues: el modelo puede usarse en sistemas IVR o chatbots para producir respuestas habladas en el idioma del usuario, aprovechando el soporte de 22 lenguas.
- Produccion de contenidos audiovisuales: locutores y creadores de video pueden generar voces para doblaje, tutoriales o podcasts, eligiendo voz y estilo emocional por escena.
- Investigacion en TTS de idiomas con pocos recursos: el modelo ofrece una base abierta (con restricciones de licencia) para experimentar con tecnicas de cuantizacion, aceleracion en MLX o evaluacion de calidad de voz.
- Prototipado rapido en entornos Apple Silicon: desarrolladores pueden probar conceptos de aplicaciones de voz sin desplegar infraestructura en la nube, gracias a los scripts de inferencia incluidos (`tts_mlx.py`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la conversion indica que la calidad se comprobo en hindi mediante estadisticas de duracion y silencio y escucha subjetiva, no mediante metricas formales como WER o MOS.

Los unicos datos de rendimiento reportados corresponden a la velocidad de decodificacion en un Apple M3 Max con 36 GB de memoria unificada: 75–83 tokens por segundo, con un factor de tiempo real (RTF) aproximado de 1,0–1,2, es decir, cerca del tiempo real. Estas cifras son para un unico stream y pueden caer alrededor de un 25 % cuando el procesador sufre limitacion termica.

## Requisitos de hardware

- Los pesos del modelo de lenguaje en 4-bit ocupan 1,8 GB; el repositorio completo pesa 2,3 GB. La VRAM o memoria unificada minima exacta no esta especificada, pero se recomienda un Mac con Apple Silicon y al menos 36 GB de RAM (el entorno de prueba mencionado es un M3 Max de 36 GB).
- GPU recomendada: Apple Silicon (M3 Max o superior) para aprovechar la implementacion MLX. No se proporcionan indicaciones para GPUs NVIDIA o AMD, ya que la conversion esta dirigida a macOS.
- Si cabe en consumer GPU: la conversion esta pensada para MLX y no incluye pesos en formato CUDA; para usar en otras plataformas seria necesaria una adaptacion adicional. En un Mac, si cabe en portatiles con memoria unificada suficiente.
- Opciones de despliegue: Python con `mlx-lm` y el script `tts_mlx.py`, que carga el modelo de lenguaje en MLX, el cuantizador SNAC y el decodificador Vocos (estos dos ultimos en torch/MPS). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 75–83 tokens/s y RTF aproximado de 1,0–1,2 en M3 Max (36 GB) en un unico stream. La latencia de primer token (TTFT) no se ha publicado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de rendimiento de otros modelos TTS comparables en la informacion proporcionada. La comparacion mas directa es con el modelo base `bodhan-ai/indic-speak` y las variantes de cuantizacion del mismo autor, todas con la misma arquitectura y capacidades:

| Variante | Precision | Peso del LM | Observaciones |
|---|---|---|---|
| indic-speak-mlx-4bit | 4-bit (grupo 64, 4,5 bits/peso) | 1,8 GB | Variante recomendada por el autor, cercana a tiempo real en M3 Max |
| indic-speak-mlx-6bit | 6-bit | No disponible | Mayor precision que 4-bit, pero mayor consumo de memoria |
| indic-speak-mlx-8bit | 8-bit | No disponible | Mayor precision, mayor consumo de memoria y menor velocidad |
| indic-speak-mlx-mixed | Mixta | No disponible | Sin datos de rendimiento |
| indic-speak-mlx-bf16 | bf16 (sin cuantizar) | No disponible | Maxima precision, mayor peso y menor velocidad |

Otras alternativas externas (por ejemplo, modelos TTS multilingues de la misma categoria) no han sido identificadas en la informacion disponible.

## Limitaciones y advertencias

- En entradas largas o con multiples frases, las variantes cuantizadas tienden a detenerse antes de tiempo o a derivar. Se recomienda usar `speak_long` o `stream_long`, que segmentan por frases y limitan los tokens.
- El parche de RoPE en `config.json` es imprescindible: si se convierte el modelo original sin copiar `rope_parameters` a `rope_theta` y `rope_scaling`, la generacion es inestable (paradas aleatorias, silencios descontrolados y variaciones de duracion de 2 a 4 veces entre semillas).
- La calidad de la voz no fue evaluada con metricas formales (WER, MOS); la comprobacion se hizo solo en hindi y por escucha subjetiva. El rendimiento en otros idiomas puede variar.
- Las etiquetas de estilo en minusculas (por ejemplo, `educational lecture`) son menos fiables que las etiquetas de emocion en mayusculas.
- La licencia Indic Open Model License v1.0 exige atribucion, que los derivados mantengan la misma licencia, que el hosting del modelo como servicio para terceros requiera aprobacion escrita de Bodhan AI, y que se respete la lista de usos prohibidos. El modelo base Llama 3.2 esta sujeto ademas a la Llama 3.2 Community License.
- No se documentan sesgos especificos, pero al tratarse de un modelo entrenado para idiomas indios, es posible que el rendimiento en dialectos o variantes no representados sea menor.
- La velocidad de decodificacion puede caer aproximadamente un 25 % bajo limitacion termica en Apple Silicon, lo que afecta a la latencia en uso prolongado.
- El cuantizador SNAC (`hubertsiuzdak/snac_24khz`) se descarga en el primer uso, por lo que se requiere conexion a internet inicial.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/iniquitous/indic-speak-mlx-4bit
- Modelo base: https://huggingface.co/bodhan-ai/indic-speak
- Licencia Indic Open Model License v1.0: https://github.com/Bodhan-AI/bodhan-model-info/blob/main/licenses/indic-open-model-license/v1/Indic_Open_Model_License.md
- Licencia Llama 3.2 Community License: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Cuantizador SNAC: https://huggingface.co/hubertsiuzdak/snac_24khz
- Variantes de cuantizacion: https://huggingface.co/iniquitous/indic-speak-mlx-6bit, https://huggingface.co/iniquitous/indic-speak-mlx-8bit, https://huggingface.co/iniquitous/indic-speak-mlx-mixed, https://huggingface.co/iniquitous/indic-speak-mlx-bf16
