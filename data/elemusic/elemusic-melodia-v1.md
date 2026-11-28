# elemusic/elemusic-melodia-v1

## Resumen

elemusic-melodia-v1 es una implementación en Python puro (NumPy y SciPy) del algoritmo de extracción de melodía predominante en cuatro etapas publicado por Justin Salamon y Emilia Gómez en IEEE TASLP (2012), combinado con el filtro de ecualización de sonoridad de la especificación ReplayGain 1.0 (David Robinson, 2001). No es un modelo neuronal: no contiene pesos aprendidos ni requiere GPU. Su función es estimar la frecuencia fundamental (f0) de la melodía predominante en mezclas musicales polifónicas (voz, saxofón, flauta, cuerdas, guitarra o sintetizadores sobre acordes y percusión).

El objetivo declarado por el autor es ofrecer una alternativa sin dependencias copyleft (AGPLv3/GPL) a las bibliotecas C++ habituales de MIR en producción. Todo el código es Python con solo NumPy y SciPy (BSD-3-Clause), lo que facilita su integración en servicios propietarios bajo licencia Apache-2.0. El paquete se distribuye como módulo único (`elemusic_melodia.py`) y como CLI que consume un array `.npy` mono a 44,1 kHz y produce un `.npz` con f0 y confianza.

La relevancia actual está en pipelines de evaluación de generación musical, detección de versiones (cover-song detection) y extracción de características MIR donde no se puede asumir una licencia copyleft. El autor reporta una correlación de Pearson de 0,9767 frente a contornos de referencia en 80 pistas polifónicas estratificadas (207,24 minutos de audio), con una velocidad de 42,3x tiempo real en CPU Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Algoritmo DSP determinista en 4 etapas (pre-énfasis IIR, STFT con interpolación parabólica, suma armónica de saliencia, seguimiento iterativo de contornos); sin redes neuronales |
| Parametros totales | 0 (no hay pesos aprendidos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; procesa audio por ventanas de 2048 muestras con hop de 128 (2,9025 ms a 44,1 kHz) |
| Tipos de cuantizacion | No aplica; cómputo en float64 (filtros IIR y saliencia) y salida en float32 |
| Idiomas soportados | No aplica (procesamiento de audio); la model card declara `en` como idioma de documentación |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica; se distribuye como módulo Python (`elemusic_melodia.py`) y paquete instalable desde GitHub |

## Arquitectura y entrenamiento

No hay entrenamiento. El sistema implementa directamente las ecuaciones publicadas del algoritmo de Salamon y Gómez (2012). La etapa 1 aplica un pre-énfasis de sonoridad igualada mediante un IIR Yule-Walker de orden 10 a 44,1 kHz (polo máximo |z| = 0,8973) en cascada con un Butterworth paso alto de segundo orden (|z| = 0,9850), todo en float64 vía `scipy.signal.lfilter` para evitar deriva numérica de los polos recursivos. La etapa 2 calcula una STFT con ventana Hann centrada de 2048 muestras, hop de 128, `rfft` de 4096 puntos, interpolación parabólica de bin y amplitud en magnitud logarítmica y poda de picos por debajo de -40 dB.

La etapa 3 construye una saliencia armónica de 601 bins (de 55 Hz, A1, a 1760 Hz, A6, con 10 cents/bin) mediante splatting log-frecuencial fino de 5 cents y multiplicación en float64 BLAS contra un kernel de 20 armónicos con decaimiento `alpha = 0.8^(h-1)` y ventana coseno al cuadrado. La etapa 4 realiza seguimiento de contornos semilla-y-crecimiento con continuidad de 80 cents por hop, puenteo de huecos de 100 ms, duración mínima de contorno de 100 ms, decisión de sonoridad bimodal con protección para melodía solista unimodal, eliminación de duplicados de octava en 3 pasadas (1200 ± 50 cents) y relleno opcional de tramas no sonoras (`guessUnvoiced=True`) a partir de contornos secundarios.

## Capacidades

- Extracción de f0 de melodía predominante en mezclas polifónicas, con salida en Hz (0,0 en tramas no sonoras) y vector de confianza por trama.
- Detección de sonoridad (voicing) por trama con umbral bimodal y guarda para pasajes solistas.
- Eliminación de duplicados de octava mediante 3 pasadas de comparación a 1200 ± 50 cents.
- Relleno opcional de tramas no sonoras a partir de contornos secundarios (`guessUnvoiced=True`).
- Ejecución como módulo importable, como módulo de archivo único descargado del Hub o como CLI (`IN.npy -> OUT.npz` con parámetros JSON).
- Procesamiento determinista y reproducible (hash SHA-256 del módulo publicado: `c2d6b84b...44eb2a0`).
- Sin dependencias copyleft: solo NumPy y SciPy (BSD-3-Clause).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni capacidades multilingües en sentido lingüístico.

## Casos de uso

- Detección de versiones (cover-song detection): comparar el contorno de f0 extraído de dos grabaciones para medir similitud melódica; el autor reporta Pearson r = 0,9767 frente a referencias, suficiente para umbrales de decisión en pipelines de catálogo musical.
- Evaluación de modelos generativos de música: extraer la melodía de la salida del generador y de la referencia para calcular métricas objetivas de fidelidad melódica sin depender de bibliotecas AGPL.
- Anotación automática de melodía para datasets MIR: preetiquetar f0 y confianza sobre corpus grandes antes de una revisión humana, aprovechando el rendimiento de 42,3x tiempo real en CPU.
- Transcripción asistida a MIDI: usar la salida de f0 como entrada a un cuantizador o a un sintetizador MIDI en herramientas de estudio (el autor enlaza elemusic.studio como estudio MIDI en navegador).
- Análisis de interpretación vocal o instrumental: estudiar vibrato, desviaciones de afinación y contorno de frases a partir de la serie temporal de f0 con resolución de 2,9 ms.
- Servicios en producción con licencia permisiva: integrar la extracción en un backend propietario sin obligación de liberar el código, algo que las alternativas GPL/AGPL no permiten.
- Investigación reproducible: replicar el algoritmo de Salamon y Gómez en Python sin compilar C++ y con un único hash de módulo verificable.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (80 pistas polifónicas estratificadas, 207,24 minutos a 44,1 kHz, frente a contornos de referencia y controles negativos con compases barajados 20x):

| Metrica | Valor |
|---|---|
| Pearson r (similitud melódica) | 0,9767 |
| Spearman rho | 0,9727 |
| Delta absoluto medio / mediano | 0,0276 / 0,0218 |
| Margen de acuerdo con el suelo de control negativo | 98,75% (79/80) |
| Tiempo mediano por pista de 2 minutos (CPU Apple Silicon, 1 proceso) | 2,835 s (42,3x tiempo real) |
| SHA-256 del módulo | `c2d6b84b014bdc32c95d82d6b0272375d02044a9182b152f69dcd918644eb2a0` |

No se han publicado comparaciones directas con implementaciones alternativas (por ejemplo, la implementación de referencia en C++ de Melodia) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el procesamiento es en CPU.
- GPU: no se requiere ni se menciona soporte GPU.
- CPU: cualquier CPU x86-64 o ARM64 con NumPy y SciPy; el benchmark se realizó en Apple Silicon con un solo proceso.
- Memoria RAM: no especificada; depende del tamaño del audio cargado como array float32/float64.
- Despliegue: instalación vía `pip install git+https://github.com/eleMusicLabs/elemusic-melodia.git`, carga del módulo único desde Hugging Face Hub con `hf_hub_download`, o ejecución como CLI (`python elemusic_melodia.py input_mono_44k.npy output_f0.npz '{"guessUnvoiced": true}'`).
- Latencia y throughput: mediana de 2,835 s por pista de 2 minutos (42,3x tiempo real) en CPU Apple Silicon con un proceso; no se publican cifras para otras plataformas.

## Comparativa con modelos similares

| Modelo | Tipo | Pesos | Licencia | Contexto / ventana | Rendimiento publicado |
|---|---|---|---|---|---|
| elemusic-melodia-v1 | DSP determinista (Python/NumPy/SciPy) | 0 | Apache-2.0 | Ventana 2048, hop 128 a 44,1 kHz | Pearson 0,9767; 42,3x tiempo real (Apple Silicon) |
| Melodia (Salamon y Gómez, referencia C++) | DSP determinista (C++) | 0 | GPL/AGPL según distribución | Configurable | No disponible en la información proporcionada |
| Modelos neuronales de extracción de f0 (p. ej. CREPE, Basic Pitch) | Red neuronal | Millones (no especificado) | Variable según modelo | Ventanas de análisis variables | No disponible en la información proporcionada |

La comparación cuantitativa con alternativas no está disponible en la documentación consultada; la diferencia principal documentada es la licencia permisiva y la ausencia de dependencias copyleft.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo; no admite prompts, tool calling ni razonamiento. Cualquier uso fuera de extracción de f0 no está soportado.
- Rango de análisis limitado a 55 Hz (A1) a 1760 Hz (A6); melodías fuera de ese rango no se detectan.
- Requiere entrada mono a 44,1 kHz; no se documenta remuestreo interno ni soporte de otras frecuencias de muestreo.
- El rendimiento se ha validado en 80 pistas; no hay evidencia publicada sobre géneros muy densos, percusión dominante o polifonía extrema.
- Riesgo de errores de octava pese a la eliminación en 3 pasadas; el autor no publica tasa de error de octava.
- La salida en tramas no sonoras es 0,0 Hz; los consumidores deben usar el vector de confianza para filtrar.
- La licencia Apache-2.0 permite uso comercial, pero la cita del paper original de Salamon y Gómez (2012) y de la especificación ReplayGain 1.0 es solicitada por el autor.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta; madurez y mantenimiento comunitario no verificables.
- No se documentan sesgos en el sentido estadístico, pero el algoritmo puede favorecer melodías con mayor saliencia armónica y ciertos timbres (voz, instrumentos de viento) frente a otros.

## Enlaces

- Hugging Face: https://huggingface.co/elemusic/elemusic-melodia-v1
- Repositorio GitHub: https://github.com/eleMusicLabs/elemusic-melodia
- Estudio MIDI en navegador: https://elemusic.studio
- Organización en GitHub: https://github.com/eleMusicLabs
- Colección en Hugging Face: https://huggingface.co/collections/elemusic/elemusic-open-music-mir-and-yue2-tools-6b0a53fa62edc30a0fe65ec8
- Paper del algoritmo: Salamon, J. y Gómez, E., "Melody Extraction From Polyphonic Music Signals Using Pitch Contour Characteristics", IEEE TASLP, 20(6), 1759-1770, 2012, doi: 10.1109/TASL.2012.2188515
- Especificación ReplayGain 1.0: Robinson, D., 2001 (referenciada en la model card, sin URL directa)
