# Fraunhofer-IEM/kale-nano-de

## Resumen

Kale Nano German (`Fraunhofer-IEM/kale-nano-de`) es una adaptación al alemán del generador de voz Kale Nano de KaleComputer, publicada por el instituto Fraunhofer IEM. Se trata de un modelo de síntesis de voz (text-to-speech) de tamaño muy reducido: 7.163.442 parámetros y 28.688.984 bytes de pesos en safetensors, lo que lo sitúa en la categoría de modelos desplegables en CPU y en entornos con recursos muy limitados.

El modelo no parte de texto libre: su API de referencia consume un plan de fonemas (`atomic_phone_ids`) y un identificador de voz, y devuelve una forma de onda a 24 kHz en mono junto con las duraciones por fonema. Incorpora cuatro voces alemanas fijas (`fresh-de-f01`, `fresh-de-f14`, `fresh-de-m07`, `fresh-de-m08`) obtenidas mediante un ajuste fino de 16.000 pasos sobre supervisión sintética generada con voces ficticias de Qwen. No hay vocoder preentrenado separado ni capacidad de clonación zero-shot.

Su relevancia actual es doble: por un lado, demuestra que es posible un TTS multihablante en alemán con menos de 8 millones de parámetros y licencia Apache-2.0; por otro, su alcance está deliberadamente acotado a un roster fijo de voces sintéticas, sin control emocional fiable ni inferencia a partir de audio de referencia. Es un artefacto de investigación reproducible, no un producto de TTS generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generador neuronal TTS derivado de Kale Nano (base: KaleComputer/kale-tts-1-nano); sin vocoder preentrenado separado |
| Parametros totales | 7.163.442 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la entrada es un plan de fonemas, no texto con ventana de contexto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | aleman (`de`) unicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (28.688.984 bytes); exportacion segura verificada tensor a tensor |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (finetune) del generador público Kale Nano de KaleComputer, que a su vez se apoya en componentes de Kokoro y StyleTTS2/kikiri, según los avisos de atribución del repositorio. La salida es una forma de onda a 24 kHz en mono generada directamente por la red neuronal, sin vocoder preentrenado independiente. La interfaz de inferencia no acepta texto ni audio de referencia, sino un plan de fonemas (`atomic_phone_ids`) más un identificador de voz, y devuelve la onda y las duraciones.

El ajuste consistió en un entrenamiento fijo de 16.000 pasos sobre las cuatro voces, con 32.000 exposiciones muestreadas por voz (el autor advierte que no equivalen a 32.000 enunciados únicos). La supervisión proviene de voces ficticias generadas localmente con Qwen y del dataset `Fraunhofer-IEM/designed-voices-de-en`. La ABI alemana difiere de la envoltura inglesa original: 178 filas de tokens, marcadores de estrés de tiempo cero, mínimos de duración por fonema real, saltos acústicos/prosódicos de 600/300 muestras y punto medio no sonoro fijo a 25 Hz. En inferencia no se emplean acústicas de profesor, ni clamp final, ni reglas de género/tono, ni inicialización privada. La semilla de ruido por defecto es 20261120.

## Capacidades

- Síntesis de voz en alemán a 24 kHz en mono, con cuatro voces fijas revisadas como usables por el propietario del proyecto.
- Generación a partir de un plan de fonemas (no de texto crudo): requiere un frontend externo que convierta texto alemán en `atomic_phone_ids`.
- Devolución de duraciones por fonema junto con la forma de onda, útil para alineamiento y post-procesado.
- Inferencia en CPU según la implementación de referencia (`model.synthesize(...)` devuelve una onda de CPU).
- Reproducibilidad verificada: los cuatro casos de referencia nativos coinciden muestra a muestra con la onda original.
- No soporta clonación zero-shot, ni inferencia con audio de referencia, ni controles emocionales fiables.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Capacidades de agente o razonamiento multi-paso: no aplica.

## Casos de uso

- Locución de avisos y anuncios en alemán para sistemas embebidos: con menos de 8 millones de parámetros y salida en CPU, el modelo puede ejecutarse en dispositivos con memoria muy limitada para mensajes cortos y repetitivos (avisos de transporte, señales de edificio).
- Pruebas de accesibilidad y lectores de pantalla en prototipos: las cuatro voces fijas permiten generar audio de prueba en alemán para validar interfaces de lectura sin depender de servicios en la nube.
- Generación de material de evaluación para pipelines de ASR en alemán: al devolver duraciones por fonema, facilita la creación de pares audio-transcripción controlados para bancos de pruebas.
- Investigación en TTS de bajo coste: sirve como línea base reproducible (revisión pública fijada, semilla de ruido determinista) para comparar arquitecturas ligeras en alemán.
- Síntesis por lotes en CI/CD: la API por lotes sobre fonemas y la ausencia de vocoder separado simplifican la integración en pipelines de generación de activos de audio.
- Demostraciones y prototipos con voces sintéticas identificables: al ser voces ficticias y no grabaciones humanas, encajan en escenarios donde se requiere declarar explícitamente el origen sintético del audio.
- Docencia y divulgación sobre TTS: el tamaño reducido y la licencia Apache-2.0 permiten inspeccionar y modificar el modelo en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta verificación de paridad software: los cuatro casos de referencia nativos coinciden muestra a muestra con la onda original, y todos los tensores sobreviven a la exportación segura. No se ofrecen métricas de naturalidad (MOS), inteligibilidad (WER) ni latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 7,16 millones de parámetros en fp32 los pesos ocupan unos 28,7 MB, por lo que la huella de memoria es mínima y la referencia funciona en CPU.
- GPU recomendadas: no se especifican; el modelo es lo bastante pequeño para cualquier GPU consumer, pero no se documenta rendimiento en GPU.
- Cabe en GPU consumer: sí, por tamaño; no se publican cifras de latencia ni throughput.
- Opciones de despliegue: paquete de referencia `designed-voices-tts[kale]` instalado desde el commit `e1158b4e47053f2dae656e9c7ba1535554c7780c`, con `designed_tts.release.load_release(model_directory)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- ONNX/WASM, streaming TTFA y comportamiento con RAM mínima: el autor indica que aún no están establecidos; el pipeline de navegador sigue en cualificación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Voces | Licencia | Notas |
|---|---|---|---|---|---|
| Fraunhofer-IEM/kale-nano-de | 7.163.442 | Aleman | 4 fijas | Apache-2.0 | Finetune de Kale Nano; entrada por fonemas; sin clonacion |
| KaleComputer/kale-tts-1-nano | no disponible | Ingles (modelo base) | no disponible | no disponible | Generador base del que deriva este modelo |
| Kokoro (componente citado) | no disponible | no disponible | no disponible | no disponible | Referenciado en las atribuciones del repositorio, no como alternativa evaluada |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Solo alemán: los identificadores de token ingleses retenidos no constituyen cualificación de voces en inglés.
- Sin clonación zero-shot ni inferencia a partir de audio de referencia.
- Sin controles emocionales fiables.
- La API consume un plan de fonemas, no texto: se necesita un frontend de fonemización alemán externo (la implementación de referencia no requiere el frontend Misaki/eSpeak de Kokoro).
- La paridad software verificada no equivale a una evaluación de naturalidad; el autor lo advierte explícitamente.
- El dataset público de entrenamiento sigue en proceso de subida y su revisión final aún no se ha conciliado con el subconjunto fijo de entrenamiento, lo que limita la reproducibilidad completa del ajuste.
- Las herramientas de entrenamiento completas y el Space cliente están en desarrollo.
- El tamaño de los pesos excluye activos de frontend y runtime.
- Riesgo de alucinación: no aplica en el sentido de un LLM, pero la calidad de la síntesis depende de la corrección del plan de fonemas de entrada.
- Licencia Apache-2.0 para los pesos derivados; deben conservarse `ATTRIBUTION.md` y `THIRD_PARTY_NOTICES.md` con los créditos a Kale, Kokoro, StyleTTS2/kikiri, Paradee, Maya-1/SNAC, Qwen y las entradas de texto/MFA bajo CC BY.
- Las voces son sintéticas, no grabaciones humanas; conviene declararlo en cualquier uso público.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fraunhofer-IEM/kale-nano-de
- Modelo base: https://huggingface.co/KaleComputer/kale-tts-1-nano
- Dataset de entrenamiento: https://huggingface.co/datasets/Fraunhofer-IEM/designed-voices-de-en
- Repositorio de inferencia de referencia: https://github.com/fraunhofer-iem/designed-voices-tts
- Proyecto ENGAGE-KI: https://engage-ki.de/
