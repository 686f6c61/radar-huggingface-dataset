# mahmoudalyosify/BA

## Resumen

BA es un sistema de clonación de voz zero-shot y síntesis de texto a voz (TTS) para árabe egipcio (`arz`), inglés (`en`) y francés (`fr`, en beta), desarrollado por el usuario de Hugging Face mahmoudalyosify. El sistema se compone de dos piezas: los pesos de VoxCPM2, un modelo TTS multilingüe de 2B parámetros y 48 kHz de OpenBMB liberado bajo Apache-2.0, que se incluyen sin modificar (copia byte a byte del commit `7936080b41163874f38610f46f438e2c0757f9fd`), y el motor `ba_tts`, un paquete Python que orquesta el preprocesado de la referencia, la normalización de texto, el troceado, la regeneración de fallos y la marca de agua de audio.

El problema que aborda es la clonación de voz fiable en árabe egipcio coloquial, un dialecto con poca cobertura en los sistemas TTS comerciales y open source. Según la model card, VoxCPM2 fue seleccionado tras comparar ocho sistemas de clonación de voz sobre árabe egipcio, y fue el único, entre los elegibles como base (licencia permisiva y datos de entrenamiento documentados), cuyo output un clasificador de dialecto etiquetó como egipcio la mayor parte del tiempo. El modelo acepta una grabación de referencia de 10 a 15 segundos y sintetiza cualquier texto con esa voz, con una marca de agua inaudible de AudioSeal en cada salida.

La relevancia actual del proyecto es doble: por un lado, demuestra un patrón de empaquetado de un modelo base abierto con una capa de ingeniería que resuelve problemas prácticos (referencias ruidosas, números y símbolos en texto egipcio, textos largos, control de calidad por fragmento); por otro, incorpora consentimiento explícito y trazabilidad mediante watermarking, dos requisitos que la regulación europea de IA empieza a exigir para sistemas de síntesis de voz. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base VoxCPM2; la model card no detalla el tipo de transformer ni si usa difusión o autoregresivo) |
| Parámetros totales | 2.290.004.544 (2,29B, dato de safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; el motor trocea textos de hasta 5.000 caracteres en fragmentos por límites de frase |
| Tipos de cuantización | no disponible (el repo distribuye safetensors en precisión original; no se listan GGUF ni variantes cuantizadas) |
| Idiomas soportados | árabe egipcio (`arz`), inglés (`en`), francés (`fr`, beta); árabe estándar (`ar`) aparece en los metadatos del repo |
| Licencia | `ba-community-license-1.0` (los pesos de VoxCPM2 son Apache-2.0 por separado) |
| Formato de pesos | safetensors; el motor se distribuye como wheel `ba_tts-0.1.0-py3-none-any.whl` |
| Frecuencia de muestreo de salida | 48 kHz |
| Tamaño del repositorio | 5,0 GB |
| Modelo base | openbmb/VoxCPM2 |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

BA v0.1.0 no entrena ni ajusta los pesos: son los de VoxCPM2 sin modificar. La contribución del autor es el motor `ba_tts`, que define cómo se conduce el modelo en producción. Ese motor prepara la grabación de referencia (mono, recortada al habla, con normalización de sonoridad y selección del tramo más limpio; rechaza audio ruidoso, saturado o demasiado corto con un mensaje explícito), transcribe la referencia con Whisper large-v3-turbo cuando el usuario no aporta transcripción y clona usando tanto la referencia como su transcripción. Además, normaliza el texto escrito: convierte dígitos, horas, precios, porcentajes y símbolos a palabras en egipcio, inglés o francés, y escribe préstamos del inglés en texto egipcio con grafía árabe.

El pipeline de generación trocea el texto largo por límites de frase, valida cada fragmento (duración frente a longitud del texto, audio vacío o saturado) y regenera los fallos con una semilla nueva. Después normaliza la sonoridad del resultado y embebe una marca de agua de AudioSeal. Los parámetros de inferencia expuestos son `seed`, `cfg_value` e `inference_timesteps`.

Sobre el entrenamiento de VoxCPM2 (número de tokens, composición del dataset, uso de RLHF o DPO) la información proporcionada no incluye detalles. La model card sí documenta que la selección del modelo base se hizo con un bake-off de ocho sistemas de clonación de voz sobre árabe egipcio, y que se exigió licencia permisiva y datos de entrenamiento documentados. Las referencias arXiv incluidas en los tags (`2509.24650`, `2212.04356`, `2205.12446`) apuntan a trabajos citados por el autor, pero no se especifica en el material disponible a qué componente corresponde cada una.

## Capacidades

- Síntesis de texto a voz con clonación de voz zero-shot a partir de 10-15 segundos de audio de referencia.
- Soporte de tres idiomas de síntesis: árabe egipcio (`arz`), inglés (`en`) y francés (`fr`, beta); el uso cruzado (voz egipcia hablando inglés o francés) funciona con menor similitud de hablante.
- Aceptación de varias grabaciones de referencia para una misma voz (`create_voice(["a.wav", "b.wav"])`).
- Transcripción automática de la referencia con Whisper large-v3-turbo si no se aporta transcripción; también se puede pasar manualmente (`transcript="..."`).
- Normalización de texto: dígitos, horas, precios, porcentajes y símbolos convertidos a palabras; préstamos ingleses en texto egipcio escritos en grafía árabe.
- Troceado automático de textos largos (hasta 5.000 caracteres) por límites de frase, con validación y regeneración de fragmentos fallidos.
- Persistencia de voces en disco (`voice.save("me.npz")`, `Voice.load("me.npz")`) para reutilizarlas sin recalcular la referencia.
- Marcado de agua de audio con AudioSeal y función de detección (`detect_watermark`) que devuelve si el audio está marcado, la puntuación y la coincidencia de bits.
- Interfaz de línea de comandos (`ba-tts`) con opciones de referencia, idioma, texto o fichero de texto, salida, guardado de voz y detección de marca de agua.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni agentes; es un modelo TTS, no un LLM conversacional.
- No se documentan capacidades de visión ni de audio de entrada más allá de la referencia de voz para clonación.

## Casos de uso

- **Locución de contenido en árabe egipcio para medios y creadores**: un creador graba 10-15 segundos de su voz y genera narraciones de vídeos, pódcast o audiolibros en dialecto egipcio coloquial, con la ventaja de que el sistema está afinado específicamente para ese dialecto y no para árabe estándar.
- **Doblaje y localización a inglés y francés desde una misma identidad de voz**: el uso cruzado permite que una voz egipcia hable inglés o francés, útil para versiones multilingües de un mismo contenido, aceptando la caída de similitud de hablante documentada.
- **Accesibilidad y lectura en voz alta de documentos**: el motor normaliza horas, precios, porcentajes y símbolos a palabras, de modo que la lectura de facturas, horarios, menús o avisos no produce lecturas erróneas de cifras; el troceado hasta 5.000 caracteres cubre documentos de extensión media.
- **Prototipado de asistentes de voz para el mercado egipcio**: integración en un pipeline de atención al cliente o de IVR donde la voz del agente se clona una vez y se reutiliza (persistencia en `.npz`), con control de semilla y `cfg_value` para reproducibilidad.
- **Generación de voces para pruebas de usabilidad y datasets sintéticos**: creación de estímulos de voz controlados en egipcio, inglés y francés para experimentos de percepción, con marca de agua que permite auditar el origen sintético de cada fichero.
- **Verificación de procedencia de audio**: la función `detect_watermark` y el comando `ba-tts --detect out.wav` permiten comprobar si un fichero fue generado por BA, lo que encaja en flujos de moderación de contenido o de cumplimiento de trazabilidad.
- **Producción de material formativo con consentimiento explícito**: el flujo exige casilla de consentimiento en el Space y el autor restringe el uso a la propia voz o a voces con permiso explícito, lo que lo hace apto para entornos corporativos con políticas de uso de imagen y voz.

## Benchmarks y rendimiento

La model card publica métricas del sistema completo (BA frente a VoxCPM2 sin el motor) sobre textos reservados, con 12 voces de referencia de FLEURS (6 egipcias, 3 inglesas, 3 francesas) y textos coloquiales egipcios, ingleses, franceses y code-switching árabe-inglés. Los umbrales de la puerta G3 son: tasa de fallo máxima del 5 %, inteligibilidad dentro de un límite fijo, similitud de hablante de al menos el 80 % de la similitud entre dos grabaciones reales del mismo hablante y, para egipcio, cuota de dialecto de al menos el 60 % de la medida en habla egipcia real.

| Idioma | Tasa de fallo | Inteligibilidad | Similitud de hablante (ECAPA) | Cuota de dialecto egipcio |
|---|---|---|---|---|
| Árabe egipcio (`arz`) | 0/130 | CER 0,030 (límite 0,171) | 0,769 (umbral 0,696) | 0,889 (umbral 0,54) |
| Inglés (`en`) | 0/64 | WER 0,003 (límite 0,08) | 0,779 (umbral 0,699) | – |
| Francés (`fr`, beta) | 0/82 | WER 0,030 (límite 0,10) | 0,792 (umbral 0,720) | – |

No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo TTS. La comparación numérica completa frente a VoxCPM2 sin el motor aparece truncada en el material proporcionado.

## Requisitos de hardware

- VRAM medida en las pruebas del autor: 8,11 GB asignados y 10,99 GB reservados en el pico de inferencia con GPU CUDA.
- GPU recomendada: cualquier GPU CUDA con al menos 12 GB de VRAM para trabajar con margen; una RTX 4090 (24 GB) deja holgura suficiente. No se especifican resultados en A100 o H100, aunque por tamaño (2,29B parámetros) deberían ser válidas.
- Caben en GPU de consumo: sí, en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090). Por debajo de 12 GB no hay datos publicados.
- CPU: funciona, pero el autor lo califica de lento; no se publican cifras de latencia en CPU.
- Despliegue: el paquete oficial es el wheel `ba_tts` (Python 3.10 o superior) con API Python y CLI `ba-tts`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son el cauce habitual para un modelo TTS.
- Almacenamiento: descarga de aproximadamente 5 GB de pesos en el primer uso.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Contexto de uso | Disponibilidad |
|---|---|---|---|---|---|
| BA (este modelo) | 2,29B | `arz`, `en`, `fr` (beta), `ar` | `ba-community-license-1.0` (pesos base Apache-2.0) | Clonación zero-shot con 10-15 s de referencia, watermark AudioSeal, motor de normalización y troceado | Hugging Face (repo y Space) |
| VoxCPM2 (openbmb/VoxCPM2) | 2B | multilingüe (la model card de BA no detalla la lista completa) | Apache-2.0 | TTS multilingüe a 48 kHz; es la base de BA sin modificar | Hugging Face |
| Otros sistemas del bake-off de ocho | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye nombres, parámetros ni resultados de los otros siete sistemas evaluados en el bake-off, por lo que no es posible una comparación numérica con alternativas concretas. Tampoco se dispone de datos de modelos TTS comerciales o abiertos comparables (por ejemplo, de la familia XTTS o similares) en el material consultado.

## Limitaciones y advertencias

- **Licencia**: `ba-community-license-1.0` no es una licencia open source estándar; hay que leer el fichero `LICENSE` del repositorio antes de cualquier uso comercial. Los pesos de VoxCPM2 son Apache-2.0, pero el motor y el empaquetado de BA tienen su propia licencia.
- **Consentimiento**: el autor restringe el uso a la propia voz o a voces cuyo propietario haya dado permiso explícito. Clonar voces de terceros sin consentimiento queda fuera de las condiciones de uso declaradas.
- **Francés en beta**: se apoya en solo tres voces de referencia francesas, usa los ajustes de generación del inglés sin afinado específico y es el idioma más reciente; la calidad puede ser inferior a la de egipcio e inglés.
- **Uso cruzado de idioma**: una voz egipcia hablando inglés o francés funciona, pero con menor similitud de hablante que en el idioma nativo de la voz.
- **Idioma**: el árabe estándar (`ar`) figura en los metadatos, pero la evaluación publicada se centra en egipcio coloquial; no hay métricas para árabe estándar.
- **Riesgo de alucinación acústica**: el motor contempla la regeneración de fragmentos con duración incoherente, audio vacío o saturado, lo que indica que estos fallos ocurren y se mitigan, no que se eliminen; en producción conviene mantener la validación por fragmento.
- **Dependencia de la referencia**: la calidad depende de la grabación de referencia; el sistema rechaza audio ruidoso, saturado o demasiado corto, pero no se documenta el comportamiento con acentos no egipcios o con habla no nativa.
- **Watermark**: la marca de AudioSeal es la vía de trazabilidad, pero no se publican tasas de falsos positivos o negativos de `detect_watermark` más allá de la estructura de retorno.
- **Madurez del proyecto**: versión 0.1.0, 0 descargas y 0 likes en el momento de la ficha; sin comunidad ni historial de incidencias.
- **Sesgos**: no se documentan análisis de sesgo por género, edad o variedad dialectal dentro del egipcio; las 12 voces de evaluación (6 egipcias, 3 inglesas, 3 francesas) son una muestra pequeña.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahmoudalyosify/BA
- Space de demostración: https://huggingface.co/spaces/mahmoudalyosify/BA
- Modelo base VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- AudioSeal (watermarking): https://huggingface.co/facebook/audioseal
- Dataset de evaluación FLEURS: https://huggingface.co/datasets/google/fleurs
- Referencia arXiv 2509.24650: https://arxiv.org/abs/2509.24650
- Referencia arXiv 2212.04356: https://arxiv.org/abs/2212.04356
- Referencia arXiv 2205.12446: https://arxiv.org/abs/2205.12446
