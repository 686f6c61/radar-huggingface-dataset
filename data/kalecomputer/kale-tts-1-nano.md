# KaleComputer/kale-tts-1-nano

## Resumen
kale-tts-1-nano es un modelo de síntesis de voz (text-to-speech) en inglés, muy ligero, desarrollado por KaleComputer. Se trata de un modelo de 7,5 millones de parámetros que se distribuye en un único archivo ONNX de 14,8 MB (int8) para CPU y de 30,6 MB (float32) para WebGPU en navegador. Su objetivo es ofrecer TTS de calidad aceptable en hardware de gama baja, incluidos tablets y navegadores, sin depender de GPU dedicada.

El modelo es un destilado de kale-tts-1-base, un fine-tune de Kokoro-82M sobre diez voces sintéticas diseñadas con Maya-1. La parte que lee el texto y planifica ritmo y melodía aprende del profesor (kale-tts-1-base), mientras que el generador de audio (un generador armónico más ruido) aprende directamente del audio de Maya-1. No emplea flow matching ni difusión: genera una pasada por frase.

Su relevancia actual radica en la combinación de tamano mínimo, licencia Apache 2.0, ejecución en CPU y navegador, y un front-end fonético cuidadosamente revisado (334.000 palabras verificadas, más de 3.800 correcciones manuales). Incluye diez voces sintéticas predefinidas y está pensado para aplicaciones de privacidad local, como el ordenador infantil que motiva el proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS por destilación: front-end fonético (diccionario CMUdict + overrides), planificador de ritmo y melodía destilado de kale-tts-1-base, generador armónico más ruido; una pasada por frase, sin difusión ni flow matching |
| Parametros totales | 7,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS por frase) |
| Tipos de cuantizacion | int8 (archivo CPU, `kale-tts-1-nano.onnx`, 14,8 MB); float32 (archivo WebGPU, `kale-tts-1-nano.fp32.onnx`, 30,6 MB) |
| Idiomas soportados | inglés (variantes US English y British English) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento
kale-tts-1-nano es un modelo de síntesis de voz compacto compuesto por cuatro bloques: un diccionario fonético en la entrada, un módulo que lee el texto y planifica el ritmo y la melodía, un generador de sonido basado en armónicos más ruido, y un paquete de voz por cada una de las diez voces. El front-end convierte texto a fonemas en varias etapas: primero normaliza términos técnicos (por ejemplo, "Node.js" a "Node J S"), después números, fechas, dinero y unidades, y finalmente aplica un diccionario basado en CMUdict, una lista de overrides revisada a mano y un pequeño adivinador para palabras desconocidas. No usa espeak.

El entrenamiento sigue un esquema de destilación en dos vías. Por un lado, kale-tts-1-base (un fine-tune de Kokoro-82M sobre las diez voces) actúa como profesor del planificador de ritmo y melodía. Por otro, el generador de sonido aprende directamente del audio de Maya-1, el sistema que diseñó las voces y grabó 204,7 horas (99.783 tomas) del dataset kale-tts-1-data, publicado con licencia CC BY 4.0. El modelo se distribuye como un único archivo ONNX y no requiere pasos iterativos de muestreo.

## Capacidades
- Síntesis de voz en inglés (US y British) a partir de texto plano.
- Diez voces sintéticas predefinidas: Kenzie, Simone, Amy, Frankie, Darlene, Owen, Toby, Jack, Earl y Magnus, cada una con un perfil descrito (por ejemplo, narrador de tráiler, presentador juvenil, detective).
- Generación de una pasada por frase, sin difusión ni flow matching.
- Ejecución en CPU y en navegador mediante WebGPU o WASM.
- Front-end fonético con normalización de términos técnicos, números, fechas, dinero y unidades.
- Diccionario revisado con 334.000 palabras (americano y británico) y más de 3.800 lecturas corregidas manualmente.
- Extensibilidad del diccionario mediante líneas en `frontend/words/override.public.tsv` (y variante británica).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso
- Lectura por voz en dispositivos de gama baja: el modelo cabe en 14,8 MB en int8 y corre a 44 veces tiempo real en la CPU de una Samsung Galaxy Tab S10 Lite, con la primera frase disponible en 0,09 s; adecuado para tablets y equipos sin GPU.
- Aplicaciones web con TTS en el navegador: el archivo float32 de 30,6 MB funciona con WebGPU (151 veces tiempo real) o WASM (82 veces tiempo real) en un Mac, lo que permite síntesis local sin servidor.
- Asistentes de voz con privacidad local: al ejecutarse en el dispositivo, el texto no sale del equipo, lo que encaja con productos centrados en privacidad como el ordenador infantil que motivó el proyecto.
- Prototipado rápido de interfaces de voz: la API ONNX y el front-end incluido permiten integrar TTS en demos y pruebas de concepto con muy poco peso de dependencias.
- Audiolibros o lectura de contenido con múltiples voces: las diez voces permiten asignar narradores distintos a secciones o personajes dentro de una misma aplicación.
- Sistemas de accesibilidad: lectura de texto en pantalla para usuarios con discapacidad visual en hardware limitado, gracias al bajo consumo y a la latencia de primera frase.
- Personalización de pronunciación en dominios técnicos: la lista de overrides permite corregir términos específicos (por ejemplo, "details" de `dɪtˈeɪlz` a `dˈiːtˌeɪlz`) sin reentrenar el modelo.

## Benchmarks y rendimiento

| Medida | kale-tts-1-nano | Referencia (Maya-1) |
|---|---|---|
| Palabras poco claras (reconocedor ASR) | +1,6 puntos vs Maya-1 | 5,82 % |
| Brecha de melodía (puntos percentiles) | +7,46 puntos vs Maya-1 | 0 |
| Velocidad en CPU (Samsung Galaxy Tab S10 Lite) | 44x tiempo real; primera frase en 0,09 s | no disponible |
| Velocidad en navegador Mac | 151x (WebGPU), 82x (WASM) | no disponible |
| Tamano del archivo | 14,8 MB (int8 CPU); 30,6 MB (float32 WebGPU) | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que es un modelo TTS y no un modelo de lenguaje.

## Requisitos de hardware
- VRAM estimada para inferencia: no aplica en CPU; en GPU, el archivo float32 de 30,6 MB requiere un consumo de memoria mínimo, muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU; no se especifican modelos concretos como A100, H100 o RTX 4090 porque el modelo está pensado para hardware de gama baja.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU, dado el tamano del archivo.
- Opciones de despliegue: ONNX Runtime (CPU), WebGPU y WASM en navegador; el repositorio incluye el front-end en `frontend/` y el script `python/kale_tts.py` con `QuickJSFrontEnd`.
- Latencia y throughput: 44x tiempo real en CPU de tablet (primera frase en 0,09 s); 151x con WebGPU y 82x con WASM en navegador de Mac.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| kale-tts-1-nano | 7,5 M | no disponible | inglés | Apache 2.0 | ONNX | 14,8 MB int8, CPU y navegador |
| kale-tts-1-tiny | no disponible | no disponible | inglés | no disponible | no disponible | Alternativa del mismo autor con mayor calidad y mayor tamano |
| kale-tts-1-base | no disponible (fine-tune de Kokoro-82M) | no disponible | inglés | no disponible | no disponible | Profesor del que se destila nano; más grande y lento para tablet |
| Kokoro-82M | 82 M | no disponible | inglés | no disponible | no disponible | Modelo base sobre el que se fine-tuneó kale-tts-1-base |

## Limitaciones y advertencias
- Solo soporta inglés (US y British); no hay soporte multilingüe documentado.
- Las diez voces son sintéticas y diseñadas a partir de descripciones textuales; ninguna corresponde a una persona real, pero pueden reproducir estilos asociados a arquetipos.
- Calidad inferior a Maya-1: +1,6 puntos de palabras poco claras y +7,46 puntos de brecha de melodía respecto a las grabaciones originales.
- Riesgo de pronunciación incorrecta en palabras fuera del diccionario o de la lista de overrides; el front-end incluye un adivinador para términos desconocidos, pero no garantiza aciertos.
- El modelo se marca como "DRAFT, NOT PUBLISHED" en la model card, lo que sugiere que la información y los artefactos pueden cambiar.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con voces sintéticas y un dataset propio, su comportamiento fuera de ese dominio no está caracterizado.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del dataset kale-tts-1-data (CC BY 4.0) y del modelo base Kokoro-82M si se redistribuye.
- No apto para tareas de razonamiento, código, matemáticas, visión ni agentes; es exclusivamente un modelo TTS.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/KaleComputer/kale-tts-1-nano
- Modelo base: https://huggingface.co/KaleComputer/kale-tts-1-base
- Modelo alternativo: https://huggingface.co/KaleComputer/kale-tts-1-tiny
- Dataset: https://huggingface.co/datasets/KaleComputer/kale-tts-1-data
- Demo: https://huggingface.co/spaces/KaleComputer/kale-tts-1
- Maya-1: https://huggingface.co/maya-research/maya1
