# KaleComputer/kale-tts-1-tiny

## Resumen

kale-tts-1-tiny es un modelo de síntesis de voz (text-to-speech) en inglés, desarrollado por KaleComputer, disenado para ejecutarse en CPU o GPU de dispositivos de gama baja, incluyendo navegadores mediante WebGPU. Con 45,7 millones de parámetros totales y un fichero ONNX de 79,9 MB en cuantización int8 para CPU (183,2 MB en float32 para WebGPU), el modelo prioriza la eficiencia en hardware limitado manteniendo una calidad de voz cercana a su referencia, Maya-1.

El modelo se distribuye con 10 voces sintéticas predefinidas (Kenzie, Simone, Amy, Frankie, Darlene, Owen, Toby, Jack, Earl y Magnus), todas disenadas a partir de descripciones textuales con Maya-1 y ninguna correspondiente a personas reales. Es un fine-tune destilado de kale-tts-1-base, que a su vez es un fine-tune de Kokoro-82M sobre datos propios. La arquitectura evita flow matching y difusión: genera cada frase en una sola pasada.

La relevancia actual del modelo radica en su enfoque de privacidad y despliegue local: KaleComputer lo desarrollo para un ordenador infantil centrado en privacidad, donde toda la IA se ejecuta en el dispositivo. El modelo alcanza 24x tiempo real en la CPU de una Samsung Galaxy Tab S10 Lite y 87x en un navegador Mac con WebGPU, con la primera frase disponible en 0,16 s en el dispositivo Android.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal por componentes: lector de fonemas (3,0M) + planificador de ritmo y melodía (21,8M, congelado de kale-tts-1-base) + lector de palabras Ettin (16,8M, congelado) + generador armónico-más-ruido (4,1M); sin flow matching ni difusión |
| Parametros totales | 45,7M (16,8M corresponden al codificador de palabras Ettin congelado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (CPU, 79,9 MB) y float32 (WebGPU, 183,2 MB) |
| Idiomas soportados | Inglés (estadounidense y británico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`kale-tts-1-tiny.onnx` int8, `kale-tts-1-tiny.fp32.onnx` float32) |

## Arquitectura y entrenamiento

kale-tts-1-tiny es un modelo de síntesis de voz compuesto por módulos especializados en lugar de un transformer monolítico. La cadena incluye un frontend de texto a fonemas basado en un diccionario CMUdict, una lista de anulaciones revisada manualmente y un pequeno adivinador para palabras desconocidas; le sigue un lector de fonemas de 3,0M de parámetros, el planificador de ritmo y melodía de 21,8M heredado congelado de kale-tts-1-base, el codificador de palabras Ettin de 16,8M (congelado) que procesa frases completas, y finalmente un generador de sonido armónico-más-ruido de 4,1M de parámetros. El modelo no emplea flow matching ni difusión: realiza una sola pasada por frase.

El entrenamiento parte de Maya-1, que disena las 10 voces y graba 204,7 horas (99.783 tomas) de audio con su texto correspondiente, publicadas como el dataset kale-tts-1-data (CC BY 4.0). kale-tts-1-base, un fine-tune de Kokoro-82M sobre esas voces, actúa como profesor: su planificador de ritmo y melodía se conserva congelado y el resto del modelo se destila a partir de él. El generador de sonido aprende directamente del audio de Maya-1. El frontend incluye una verificación de 334.000 palabras (americanas y británicas) con más de 3.800 lecturas corregidas en `frontend/words/override.public.tsv`. No se especifica en la información disponible el uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz en inglés (estadounidense y británico) con 10 voces predefinidas y estilos diferenciados.
- Normalización de texto previa a la síntesis: términos técnicos ("Node.js" → "Node J S"), números, fechas, dinero y unidades convertidos a palabras.
- Conversión de texto a fonemas mediante diccionario CMUdict, lista de anulaciones revisada y adivinador para palabras desconocidas; sin uso de espeak.
- Generación en una sola pasada por frase, sin flow matching ni difusión.
- Ejecución en CPU de dispositivos de gama baja y en navegador mediante WebGPU o WASM.
- Soporte de voces sintéticas disenadas a partir de descripciones textuales (concepto heredado de Maya-1).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura por voz en dispositivos de gama baja: el modelo funciona en CPU de tablets y portátiles modestos (24x tiempo real en Galaxy Tab S10 Lite), lo que permite integrar narración en aplicaciones sin GPU dedicada.
- Asistentes de voz en navegador: con WebGPU alcanza 87x tiempo real (48x en WASM), lo que posibilita síntesis de voz local en aplicaciones web sin enviar texto a servidores externos.
- Productos infantiles centrados en privacidad: encaja en el caso de uso original de KaleComputer, donde toda la IA se ejecuta en el dispositivo y el audio no sale de él.
- Audiolibros y contenido narrado: las 10 voces cubren estilos como narrador de tráiler (Magnus), locutor de noticias (Amy, Jack) o presentador juvenil (Owen), adecuados para distintos registros de narración.
- Prototipado rápido de interfaces de voz: el fichero ONNX de 79,9 MB y la licencia Apache 2.0 permiten incorporar TTS a prototipos y demos sin infraestructura de servidor.
- Personalización de voces: el concepto de diseno de voces a partir de descripciones textuales permite recrear voces propias partiendo de Maya-1, según indica el autor.
- Sistemas de anuncios y avisos locales: la latencia de 0,16 s hasta la primera frase en el dispositivo Android permite respuestas habladas casi inmediatas en interfaces de usuario.

## Benchmarks y rendimiento

| Medida | kale-tts-1-tiny | Maya-1 (referencia) |
|---|---|---|
| Palabras poco claras (reconocedor de voz, menor es mejor) | +1,4 puntos vs grabaciones de Maya-1 | 5,82 % |
| Brecha de melodía (puntos percentiles, menor es mejor) | +7,48 puntos | 0 |
| Velocidad en CPU de Samsung Galaxy Tab S10 Lite | 24x tiempo real; primera frase en 0,16 s | No disponible |
| Velocidad en navegador Mac | 87x (WebGPU), 48x (WASM) | No disponible |
| Tamano del fichero | 79,9 MB (int8, CPU); 183,2 MB (float32, WebGPU) | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni métricas TTS convencionales como MOS) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo está disenado para CPU y ejecución en navegador, con ficheros de 79,9 MB (int8) y 183,2 MB (float32).
- GPU recomendadas: no se especifican modelos concretos; el autor menciona ejecución en GPU de dispositivos de gama baja y WebGPU en navegador.
- Compatibilidad con GPU de consumo: el modelo está pensado para hardware débil, por lo que cabe en cualquier GPU de consumo moderna; no se detallan modelos concretos.
- Opciones de despliegue: ONNX Runtime (CPU), WebGPU y WASM en navegador; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 24x tiempo real en CPU de Samsung Galaxy Tab S10 Lite con 0,16 s hasta la primera frase; 87x en WebGPU y 48x en WASM en navegador Mac.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| kale-tts-1-tiny | 45,7M | No disponible | Apache 2.0 | ONNX, CPU y WebGPU, 10 voces | Hugging Face |
| kale-tts-1-nano | No disponible (menor que tiny) | No disponible | No disponible | ONNX, mas pequeno y rapido, algo menos de calidad | Hugging Face |
| kale-tts-1-base | No disponible | No disponible | No disponible | Kokoro-82M fine-tuneado, profesor del tiny | Hugging Face |
| Maya-1 | No disponible | No disponible | No disponible | Diseno de voces y grabacion de referencia | Hugging Face (maya-research/maya1) |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés (estadounidense y británico); no hay soporte multilingüe documentado.
- La calidad es inferior a la de su referencia Maya-1: +1,4 puntos en palabras poco claras y +7,48 puntos de brecha de melodía respecto a las grabaciones originales.
- El frontend de texto a fonemas puede fallar con palabras fuera del diccionario y la lista de anulaciones; el autor recomienda anadir lecturas manualmente para términos específicos.
- No se documentan sesgos concretos, pero al ser voces sintéticas disenadas por IA, pueden reproducir estereotipos de estilo asociados a las descripciones originales (por ejemplo, acentos y registros).
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede producir pronunciaciones incorrectas en palabras desconocidas.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia de los datos de entrenamiento (kale-tts-1-data es CC BY 4.0) y de Maya-1 para usos derivados.
- El modelo está marcado como "DRAFT, NOT PUBLISHED" en su model card, lo que sugiere que la documentación y el estado de publicación pueden cambiar.
- No se especifican requisitos de memoria ni latencia para GPU dedicada, solo para CPU y navegador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KaleComputer/kale-tts-1-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/KaleComputer/kale-tts-1-data
- Modelo base (profesor): https://huggingface.co/KaleComputer/kale-tts-1-base
- Modelo nano (alternativa mas pequena): https://huggingface.co/KaleComputer/kale-tts-1-nano
- Demo interactiva: https://huggingface.co/spaces/KaleComputer/kale-tts-1
- Maya-1 (referencia): https://huggingface.co/maya-research/maya1
