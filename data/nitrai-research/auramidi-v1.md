# nitrai-research/AuraMIDI-v1

## Resumen

AuraMIDI-v1 es un modelo Transformer generativo de música simbólica desarrollado por NitrAI, una organización de investigación orientada a acercar la IA de frontera a hardware de consumo. Está diseñado para generar composiciones MIDI multi-pista a partir de parámetros como género, tonalidad y tempo, empleando un tokenizador MidiTok REMI sobre un vocabulario de 10.000 tokens. El modelo se distribuye tanto en formato PyTorch como ONNX, lo que facilita su despliegue en entornos web, móviles y de escritorio.

Con 48,6 millones de parámetros y una ventana de contexto de 1.024 tokens, AuraMIDI-v1 se posiciona como una solución ligera y eficiente para la generación de música simbólica. Ha sido entrenado sobre un corpus curado de 19.833 canciones (aproximadamente 80 millones de tokens musicales) procedentes de Lakh Clean MIDI Dataset, Google Magenta MAESTRO y stems modernos de géneros como synthwave, cyberpunk, lo-fi, neo jazz, phonk y EDM. Su licencia MIT permite uso comercial sin restricciones.

La relevancia actual de este modelo radica en su tamaño reducido y su formato ONNX, que permiten ejecutar generación musical en tiempo real en dispositivos con recursos limitados, algo poco habitual en modelos de música generativa. Además, su entrenamiento con mezcla de precisión BF16 y su arquitectura causal decoder-only lo convierten en una base interesante para experimentación y prototipado rápido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Decoder-Only Transformer (estilo GPT) |
| Parametros totales | 48,60 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (se distribuye en FP32 PyTorch y ONNX FP32) |
| Idiomas soportados | ingles (etiqueta en el modelo, aunque la musica es universal) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) y ONNX (.onnx) |

## Arquitectura y entrenamiento

AuraMIDI-v1 emplea una arquitectura causal decoder-only similar a la de los modelos GPT, con 12 capas Transformer, 16 cabezas de atencion por capa (dimension de cabeza 32), tamaño oculto de 512 y dimension feedforward de 2048. Utiliza pre-normalizacion con activacion GELU, una eleccion comun para estabilizar el entrenamiento en modelos de tamaño medio. El tokenizador es MidiTok con representacion REMI, que convierte eventos musicales (notas, tiempos, velocidades, etc.) en tokens discretos de un vocabulario de 10.000 entradas.

El entrenamiento se realizo sobre 19.833 canciones que suman 79.454.977 tokens, procesados durante 3 epocas completas (unos 238 millones de tokens en total). Se utilizo una GPU NVIDIA moderna con entrenamiento de precision mixta BF16 (AMP). La perdida final de validacion alcanzo 1,4065, un valor razonable para un modelo de este tamano en tareas de modelado de musica simbolica. No se menciona el uso de tecnicas de alineacion como RLHF o DPO; el entrenamiento parece ser puramente de modelado de lenguaje autoregresivo sobre tokens musicales.

## Capacidades

- Generacion de composiciones MIDI multi-pista (el script de generacion produce 4 pistas) a partir de parametros de genero, tonalidad y BPM.
- Soporte de muestreo con Top-K y Top-P, ademas de temperatura configurable, lo que permite controlar la creatividad y la coherencia de las salidas.
- Capacidad para generar en multiples generos: synthwave, cyberpunk, lo-fi chill, neo jazz, phonk y EDM, segun los datos de entrenamiento.
- Generacion autoregresiva token a token, con una ventana de contexto de 1.024 tokens que permite composiciones de duracion media.
- Exportacion a ONNX para inferencia en entornos sin dependencias de PyTorch (web, movil, escritorio).
- No se indica soporte de tool calling, funciones de agente ni capacidades multimodales (vision, audio). Es exclusivamente un modelo de generacion de musica simbolica.

## Casos de uso

- Composicion musical asistida: un productor puede generar una base MIDI de 4 pistas en estilo synthwave especificando tonalidad (p. ej. La menor) y tempo (120 BPM), para despues editarla en su DAW. El modelo ofrece una base coherente y estilisticamente adecuada gracias a su entrenamiento en generos modernos.
- Generacion de musica procedural para videojuegos: al ser ligero y exportable a ONNX, puede integrarse en motores de juego para crear bandas sonoras adaptativas en tiempo real, cambiando de genero o tonalidad segun el estado del juego.
- Creacion de bucles (loops) para produccion musical: los 1.024 tokens de contexto permiten generar frases musicales de varios compases que pueden recortarse y usarse como samples en herramientas como Ableton o FL Studio.
- Prototipado rapido de ideas musicales: un artista puede generar varias variaciones de una idea cambiando la temperatura o los valores de Top-K/Top-P, obteniendo alternativas rapidas sin necesidad de tocar un instrumento.
- Educacion musical: el modelo puede servir como herramienta pedagogica para mostrar como se estructuran composiciones en diferentes generos, generando ejemplos que los estudiantes pueden analizar y modificar.
- Despliegue en aplicaciones web de generacion musical: gracias al formato ONNX, se puede ejecutar en el navegador mediante ONNX Runtime Web, ofreciendo a los usuarios una experiencia de generacion de musica sin servidores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion final de 1,4065, que no es directamente comparable con otros modelos sin un protocolo de evaluacion estandarizado. No existen datos de MMLU, HumanEval u otros benchmarks genericos, ya que se trata de un modelo especializado en musica simbolica y no en tareas de lenguaje general.

## Requisitos de hardware

- El modelo tiene 48,6 millones de parametros, lo que en FP32 ocupa aproximadamente 194 MB (el checkpoint PyTorch pesa ~194 MB y el ONNX ~166 MB). Esto cabe sin problemas en cualquier GPU con al menos 1 GB de VRAM y tambien en CPU.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente. Una NVIDIA GTX 1650, RTX 2060 o superior ofrecera generacion en tiempo real. Incluso una Raspberry Pi con ONNX Runtime podria ejecutar el modelo, aunque con mayor latencia.
- Se puede ejecutar en CPU con una latencia aceptable para generacion no interactiva; para uso en tiempo real se recomienda GPU o aceleracion por hardware.
- Opciones de despliegue: PyTorch para investigacion y desarrollo; ONNX Runtime para produccion en web (WebAssembly), movil (Android/iOS) y escritorio. No se proporcionan archivos GGUF ni integracion con llama.cpp u Ollama, pero al ser un modelo Transformer estandar, podria convertirse a esos formatos si se desea.
- No se han publicado datos de latencia o throughput especificos. Dado el tamano, se espera una velocidad de generacion de decenas de tokens por segundo en GPU moderna, y unos pocos tokens por segundo en CPU.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de generacion de musica simbolica de tamano similar. Modelos como MusicGen (Meta) se centran en audio, no en MIDI, y tienen parametros muy superiores (300M-1.5B). Otros como MuseNet (OpenAI) no son de codigo abierto. Por tanto, no se puede ofrecer una tabla comparativa fiable con datos verificados. Se recomienda consultar la documentacion de NitrAI para futuras comparaciones.

## Limitaciones y advertencias

- El contexto de 1.024 tokens limita la duracion de las composiciones generadas; piezas mas largas requeririan estrategias de generacion segmentada o ventanas deslizantes.
- El modelo solo ha sido entrenado con datos en ingles (etiqueta del modelo), aunque la musica simbolica no tiene idioma. Esto no afecta a la generacion musical, pero si a posibles metadatos o letras si se integraran.
- Los datos de entrenamiento provienen de fuentes curadas (Lakh, MAESTRO, stems modernos), por lo que el modelo puede tener sesgos hacia los generos representados y carecer de diversidad en estilos musicales no incluidos.
- Riesgo de alucinacion: como todo modelo autoregresivo, puede generar secuencias musicales incoherentes o poco musicales, especialmente con temperaturas altas.
- No se han publicado evaluaciones de calidad musical por humanos ni comparaciones objetivas con otros sistemas, por lo que el rendimiento real en produccion debe validarse empiricamente.
- El repositorio no incluye un tokenizador preentrenado separado; se espera que el usuario utilice el script de generacion proporcionado, lo que limita la flexibilidad para personalizar el tokenizador.
- La licencia MIT permite uso comercial, pero el modelo se ofrece sin garantias; el usuario es responsable de verificar la calidad de las salidas en aplicaciones profesionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nitrai-research/AuraMIDI-v1
- Organizacion NitrAI en Hugging Face: https://huggingface.co/nitrai-research
- Sitio web de NitrAI: https://nitrai.dev/
- Pagina de modelos de NitrAI: https://nitrai.dev/models.html
