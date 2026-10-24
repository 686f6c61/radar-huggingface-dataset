# amitbhakt/open-xtts-trainer

## Resumen

Open-XTTS-Trainer es un repositorio de Hugging Face (amitbhakt/open-xtts-trainer) que no contiene un modelo entrenado, sino una suite de entrenamiento reproducible y modular para los tres componentes de XTTS v2: el VAE discreto (DVAE) que comprime mel-espectrogramas en tokens de audio, el backbone GPT autorregresivo que predice esos tokens a partir de texto y latentes de hablante, y el vocoder HiFi-GAN latente que sintetiza la forma de onda. El problema que aborda es la ausencia de recetas oficiales de entrenamiento para el DVAE y el vocoder tras el cierre de Coqui AI, así como los fallos de índices fuera de rango al extender el vocabulario a escrituras no latinas (árabe, índicas, tailandés, dhivehi) y la rotura de dependencias (`torchcodec`) en versiones modernas de Python.

El paquete se distribuye bajo licencia MPL-2.0, con librería `coqui-tts`, pipeline `text-to-speech` y compatibilidad declarada con Python 3.10+ y PyTorch 2.1+. Incluye un cuaderno de Google Colab para ejecutar una verificación de extremo a extremo y un DOI de Zenodo. El tamaño del repositorio figura como 0.0 GB, sin descargas registradas y con 1 like, lo que indica que es un artefacto de código y documentación más que un checkpoint publicable.

Su relevancia actual es la de recuperar capacidad de ajuste fino sobre una arquitectura TTS ampliamente desplegada (clonación de voz, multilingüismo) en un escenario de abandono del repositorio original, unificando en un solo flujo los entrenamientos de las tres etapas que antes estaban dispersos o no existían públicamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS en tres etapas: VAE discreto (DVAE) + backbone GPT autorregresivo + vocoder HiFi-GAN latente |
| Parametros totales | no disponible (la información proporcionada no publica recuento de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio trabaja con pesos PyTorch en fp32/fp16, sin variantes GGUF/AWQ declaradas) |
| Idiomas soportados | `en` y `multilingual` según los tags; el listado exacto de idiomas no se detalla en la información disponible |
| Licencia | MPL-2.0 |
| Formato de pesos | no disponible (no se publican checkpoints; tamaño del repo: 0.0 GB) |
| Tipo de artefacto | Suite de entrenamiento/fine-tuning, no un modelo con pesos |
| Librería | `coqui-tts` |
| Pipeline | `text-to-speech` |
| Versión de Python | 3.10+ |
| Versión de PyTorch | 2.1+ |
| Dataset de referencia | `reach-vb/random-audios` (citado en los metadatos) |
| Métrica declarada | `loss` |
| Descargas / likes | 0 / 1 |
| Fecha de creación / actualización | 2026-10-22 / 2026-10-23 |

## Arquitectura y entrenamiento

La arquitectura replica la cadena de XTTS v2 en tres etapas entrenables por separado. La etapa 1 es un VAE discreto que comprime mel-espectrogramas crudos en tokens de audio discretos, con annealing de la temperatura del codebook mediante Gumbel-Softmax (de 1.000 a 0.999 en la verificación reportada). La etapa 2 es el backbone GPT autorregresivo, que genera tokens de habla condicionados por el texto y por latentes de hablante; el repositorio añade aquí un extensor de vocabulario dinámico para escrituras no soportadas, que evita los crashes de embedding fuera de rango al incorporar nuevos alfabetos. La etapa 3 es un vocoder HiFi-GAN latente que sintetiza la forma de onda a partir de los latentes acústicos del GPT y de los embeddings de hablante, entrenado con discriminadores multiescala (MSD) y multiperiodo (MPD).

Los datos de entrenamiento empleados en la verificación empírica son voz humana real: el corpus LJSpeech y el discurso inaugural de JFK, remuestreados a 24 kHz mono, con un micro-benchmark de 8 muestras generado mediante `python -m xtts_trainer.speech_data`. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron fases de RLHF o DPO (habitualmente ausentes en modelos TTS). Los objetivos de entrenamiento reportados son pérdidas de reconstrucción mel, pérdida adversarial de los discriminadores y convergencia del codebook.

El flujo permite tres configuraciones según el objetivo: adaptación de voz o clonación de hablante (etapas 2 + 3), nuevo alfabeto o idioma con el extensor de vocabulario (etapas 2 + 3) y codec de audio propio o cambio de frecuencia de muestreo, por ejemplo 48 kHz (etapas 1 + 2 + 3 desde cero). La suite también repara la dependencia `torchcodec` para builds modernos de Python.

## Capacidades

- Síntesis de voz (text-to-speech) mediante la integración de los tres componentes entrenados en el pipeline de inferencia estándar de XTTS.
- Clonación de voz y adaptación de hablante mediante fine-tuning de la etapa GPT y del vocoder.
- Extensión de vocabulario para escrituras no latinas (árabe, índicas, tailandés, dhivehi), corrigiendo los errores de embedding fuera de rango.
- Entrenamiento desde cero del DVAE para codecs de audio personalizados o cambios de frecuencia de muestreo (por ejemplo, 48 kHz).
- Entrenamiento del vocoder HiFi-GAN latente con discriminadores MPD + MSD y equilibrio adversarial estable.
- Annealing controlado del codebook mediante Gumbel-Softmax.
- Verificación de convergencia por componente con trayectorias de pérdida registradas.
- Ejecución reproducible en Google Colab para comprobación de extremo a extremo.
- Compatibilidad declarada con Python 3.10+ y PyTorch 2.1+, sin la degradación de dependencias del repositorio original.

No se documentan en la información disponible capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; se trata de un framework de síntesis y clonación de voz.

## Casos de uso

- Clonación de voz para audiolibros y narración: se ejecutan las etapas 2 y 3 sobre un corpus del narrador objetivo, de modo que el vocoder reproduce el timbre y el GPT conserva la prosodia condicionada por los latentes de hablante.
- Localización de productos de voz a idiomas con escritura no latina: el extensor de vocabulario permite añadir árabe, hindi, tailandés o dhivehi sin los crashes de índice de embedding que sufría el flujo original, y después se reentrena el vocoder para el nuevo dominio fonético.
- Creación de un codec de audio propio: la etapa 1 se entrena desde cero sobre mel-espectrogramas al sample rate deseado (por ejemplo 48 kHz) y se encadenan las etapas 2 y 3 para mantener coherencia acústica.
- Reproducción de investigación en TTS: el cuaderno de Colab y las trayectorias de pérdida publicadas permiten replicar la convergencia de cada componente sobre LJSpeech y comparar contra las cifras reportadas.
- Restauración de un pipeline legacy: equipos que dependían del repositorio de Coqui y se encontraron con la rotura de `torchcodec` en Python moderno pueden migrar a esta suite y seguir ajustando sus modelos existentes.
- Generación de voces sintéticas para prototipado de asistentes conversacionales: el ajuste del vocoder sobre un hablante concreto permite producir muestras consistentes para pruebas de UX antes de contratar una voz comercial.
- Adaptación de un modelo TTS a un dominio acústico específico (por ejemplo, locución de anuncios o atención al cliente) ajustando únicamente las etapas 2 y 3 sobre grabaciones del dominio.

## Benchmarks y rendimiento

La información disponible no incluye benchmarks estándar de TTS (MOS, CMOS, WER, UTMOS) ni comparaciones con otros modelos. Los datos publicados son pérdidas de convergencia de cada componente medidas sobre voz humana real en una NVIDIA T4 con CUDA 12:

| Componente y objetivo | Pérdida inicial | Pérdida final | Comportamiento |
|---|---|---|---|
| Etapa 3: HiFi-GAN latente (generador) | 198,66 | 68,25 | Descenso rápido alineado con los formantes del habla natural |
| Etapa 3: HiFi-GAN latente (pérdida mel) | 190,83 | 63,49 | Reducción del error acústico del 67 % |
| Etapa 3: discriminadores (MPD + MSD) | 8,02 | 3,62 | Equilibrio adversarial estable, sin colapso de modo |
| Etapa 1: VAE discreto (reconstrucción mel) | 8,13 | 2,70 | Reducción del error de reconstrucción del 67 % |
| Etapa 1: temperatura del codebook DVAE | 1,000 | 0,999 | Annealing controlado con Gumbel-Softmax |

El propio autor advierte que estas cifras demuestran convergencia de entrenamiento a nivel de componente (flujo de gradiente, equilibrio del discriminador y descenso de reconstrucción acústica), no calidad de síntesis de extremo a extremo. No se han publicado resultados de benchmarks perceptuales ni comparativas con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- Verificación empírica del entrenamiento: NVIDIA T4 con CUDA 12, lo que sitúa el perfil mínimo validado en la gama de 16 GB de VRAM por componente.
- GPU recomendadas: no se especifican; por el perfil validado, cualquier GPU con al menos 16 GB (T4, A100, H100, RTX 4090) es un punto de partida razonable, sin cifras confirmadas por el autor.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; no se documentan pruebas en RTX 3060/4060/4090.
- Despliegue: la suite se instala como paquete Python (`pip install -e .`) sobre PyTorch 2.1+ y la librería `coqui-tts`; no se declaran integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta arquitectura.
- Latencia y throughput: no disponibles (no se publican tiempos por muestra ni RTF).
- Almacenamiento: el repositorio ocupa 0.0 GB, pero el entrenamiento requiere descargar el corpus de voz y los pesos base de XTTS v2, cuyo tamaño no se detalla.

## Comparativa con modelos similares

| Modelo / proyecto | Tipo | Parámetros | Contexto | Entrena DVAE | Entrena vocoder latente | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| open-xtts-trainer (este repo) | Suite de entrenamiento sobre XTTS v2 | no disponible | no disponible | Sí | Sí | MPL-2.0 | Público en HF y GitHub |
| Repositorio original de Coqui TTS / XTTS v2 | Framework TTS + pesos preentrenados | no disponible en la información | no disponible | No (recetas no publicadas tras el cierre de Coqui) | No | no disponible en la información | Repo abandonado, con problemas de `torchcodec` en Python moderno |
| Otros frameworks TTS open source con fine-tuning | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificables de parámetros, contexto o rendimiento de alternativas como Fish Speech, F5-TTS, StyleTTS 2 o Bark, por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- No es un modelo con pesos: el repositorio no publica checkpoints (0.0 GB) y requiere los pesos base de XTTS v2 y un corpus de voz para producir un sistema funcional.
- Los resultados publicados son pérdidas de convergencia por componente, no métricas de calidad perceptual; no hay MOS, CMOS, WER ni UTMOS que respalden la calidad final del audio.
- No se documenta el proceso completo de inferencia de extremo a extremo con los componentes reentrenados, solo la integración en el pipeline estándar de XTTS.
- Riesgo de sobreajuste al hablante y al dominio con corpus pequeños (la verificación usa LJSpeech y un único discurso); no se reportan curvas de validación ni particiones de test.
- Sesgos acústicos y demográficos heredados de los datos de entrenamiento (LJSpeech es una única hablante de inglés estadounidense); no se documenta ninguna mitigación.
- El soporte `multilingual` aparece solo como tag: no se especifica la lista de idiomas cubiertos ni la calidad por idioma.
- Riesgo de uso indebido de la clonación de voz: la licencia MPL-2.0 cubre el código, pero no se incluyen salvaguardas, marcas de agua ni filtros de consentimiento documentados.
- Dependencia de la licencia y disponibilidad de los pesos base de XTTS v2, que se rigen por sus propios términos, no por la MPL-2.0 de esta suite.
- Madurez baja: 0 descargas, 1 like y menos de dos días entre creación y última actualización; no hay evidencia de uso en producción.
- No se declaran requisitos de VRAM ni tiempos de entrenamiento, lo que dificulta planificar costes de infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amitbhakt/open-xtts-trainer
- Repositorio GitHub: https://github.com/amitbhakt/open-xtts-trainer
- Registro Zenodo (DOI 10.5281/zenodo.23573888): https://zenodo.org/records/23573888
- Cuaderno de demostración en Colab: https://colab.research.google.com/github/amitbhakt/open-xtts-trainer/blob/main/notebooks/open_xtts_train_demo.ipynb
- Dataset citado en los metadatos: https://huggingface.co/datasets/reach-vb/random-audios
- Texto de la licencia MPL-2.0: https://opensource.org/licenses/MPL-2.0
