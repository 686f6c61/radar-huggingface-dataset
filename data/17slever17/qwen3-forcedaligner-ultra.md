# 17slever17/Qwen3-ForcedAligner-Ultra

## Resumen

Qwen3-ForcedAligner-Ultra es un modelo de alineación forzada (forced alignment) multilingüe desarrollado por el usuario 17slever17, derivado del checkpoint oficial `Qwen/Qwen3-ForcedAligner-0.6B` de Alibaba. Su propósito es generar marcas temporales precisas a nivel de palabra a partir de un audio y su transcripción, incluso cuando esta última contiene errores de reconocimiento automático del habla (ASR), como sustituciones, inserciones u omisiones. El modelo aborda la limitación de resolución temporal de 80 ms del modelo base incorporando un componente opcional denominado Local Head, que refina los límites dentro de un entorno de ±60 ms con una resolución de 10 ms.

El modelo conserva el soporte para los 11 idiomas del modelo original (chino, inglés, cantonés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español) y añade robustez frente a habla ruidosa, con acentos y con cambio de código (code-switching). Según los datos publicados por el autor, el modelo reduce el error absoluto medio (MAE) de 124,95 ms a 34,95 ms respecto al checkpoint oficial, y a 26,59 ms cuando se activa el Local Head. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo tiene aproximadamente 917,7 millones de parámetros y se distribuye en formato safetensors. Está pensado para integrarse en pipelines de subtitulado, preparación de datasets de habla, herramientas de doblaje y verificación de transcripciones. Su tamaño moderado permite ejecutarse en GPUs de consumo, y el autor reporta un factor de velocidad de 150x en tiempo real (RTFx) sin el Local Head y 95x con él, medido en una NVIDIA GeForce RTX 5070 Ti.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivado de Qwen3-ForcedAligner-0.6B (transformer con encoder de audio) |
| Parametros totales | 917.728.896 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, zh, fr, de, it, ja, ko, ru, es, pt, yue (11 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3-ForcedAligner-Ultra parte del checkpoint oficial `Qwen/Qwen3-ForcedAligner-0.6B`, que a su vez se basa en la arquitectura de Qwen3-ASR (encoder de audio + decodificador de texto). Sobre esta base, el autor aplica un fine-tuning con datos aumentados que incluyen variaciones controladas de velocidad, ruido, reverberación y ganancia, manteniendo las marcas temporales de referencia exactas. Además, el entrenamiento incorpora patrones de error reales de ASR: sustituciones, inserciones, divisiones y fusiones de palabras, así como ejemplos explícitos de palabras ausentes en la transcripción. Esto permite que el modelo sea robusto cuando la transcripción no coincide literalmente con el audio.

Una innovación destacada es el Local Head opcional, un módulo adicional que refina los límites dentro de un vecindario de ±60 ms alrededor del punto seleccionado por el modelo principal. Mientras que el modelo Qwen base opera sobre una cuadrícula temporal de 80 ms, el Local Head trabaja a 10 ms, logrando una precisión de límite superior sin modificar la API de inferencia estándar. Cuando se desactiva el Local Head, el modelo funciona como un drop-in replacement del modelo oficial, usando la misma interfaz `qwen-asr`.

## Capacidades

- Alineación forzada de audio y transcripción a nivel de palabra, generando marcas de inicio y fin para cada unidad.
- Soporte multilingüe para 11 idiomas, con cobertura principal en chino, inglés, francés, alemán, italiano, japonés, coreano, ruso y español; cantonés y portugués conservan el soporte base de Qwen pero requieren validación para dominios específicos.
- Robustez frente a transcripciones con errores: sustituciones, inserciones, omisiones y divisiones/fusiones de palabras.
- Manejo de habla ruidosa, con acentos y con cambio de código (code-switching) entre idiomas.
- Modo base compatible con la API de `qwen-asr` para integración directa.
- Local Head opcional para refinamiento de límites con resolución de 10 ms y precisión mejorada (MAE de 26,59 ms).
- Reducción significativa de errores catastróficos (errores >1000 ms) en comparación con el modelo oficial (0,195% frente a 1,565%).

## Casos de uso

- Subtitulado automático: alinear transcripciones generadas por ASR con el audio para producir subtítulos con marcas temporales precisas, incluso cuando el ASR introduce errores. El modelo maneja esos errores y mantiene la sincronización.
- Reparación de transcripciones: corregir marcas temporales en transcripciones existentes que no coinciden exactamente con el audio, útil en archivado y digitalización de contenidos.
- Preparación de datasets de habla: generar alineaciones palabra-audio para entrenar modelos de síntesis de voz (TTS), reconocimiento de voz (ASR) o conversión de voz, reduciendo el coste de anotación manual.
- Herramientas de doblaje: sincronizar diálogos doblados con el audio original, donde las transcripciones pueden tener diferencias de redacción o inserción de frases.
- Verificación de locuciones: comprobar que un audio locutado coincide temporalmente con un guion, detectando inserciones, omisiones o reordenamientos.
- Análisis lingüístico y fonético: estudiar duraciones de palabras, patrones de pronunciación o fenómenos de coarticulación en corpus multilingües, gracias a la precisión de los límites.
- Accesibilidad y subtitulado en directo: integrar el modelo en pipelines de subtitulado en tiempo real para eventos, donde la robustez al ruido y a errores de ASR es crítica.

## Benchmarks y rendimiento

Los resultados siguientes provienen de la model card del autor, usando una evaluación multilingüe con 6,5 horas de audio, 105.022 endpoints de inicio/fin y nueve idiomas. Se aplicó el post-procesado `fix_timestamp()` de Qwen a los modelos Qwen (marcado como FIXED). MMS y WhisperX usan sus límites nativos sin post-procesado.

#### Precision de alineacion (porcentaje de endpoints dentro del umbral)

| Modelo | t <= 10 ms | t <= 25 ms | t <= 50 ms | t <= 100 ms |
| --- | ---: | ---: | ---: | ---: |
| Qwen3-ForcedAligner-0.6B oficial, FIXED | 22,087 | 46,203 | 77,597 | 91,050 |
| **Qwen3-ForcedAligner-Ultra, FIXED** | 26,148 | 55,207 | 89,886 | 96,663 |
| **Qwen3-ForcedAligner-Ultra + Local Head, FIXED** | **47,113** | **78,315** | **91,821** | **96,768** |
| MMS-300M-1130 | 9,188 | 26,144 | 55,769 | 84,202 |

#### Error de limite y cola catastrofica

| Modelo | MAE (ms) | P90 | P95 | P97 | P99 | >240 ms | >500 ms | >1000 ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Qwen3-ForcedAligner-0.6B oficial, FIXED | 124,949 | 90,688 | 185,122 | 347,882 | 2106,159 | 4,017% | 2,379% | 1,565% |
| **Qwen3-ForcedAligner-Ultra, FIXED** | 34,947 | 50,425 | 75,684 | 110,000 | **260,908** | **1,113%** | 0,509% | **0,195%** |
| **Qwen3-ForcedAligner-Ultra + Local Head, FIXED** | **26,590** | **43,335** | **71,108** | **105,958** | 261,325 | 1,122% | **0,505%** | **0,195%** |
| MMS-300M-1130 | 98,179 | 132,240 | 207,041 | 315,325 | 1016,740 | 4,094% | 1,912% | 1,020% |

#### Test externo de conversacion ruidosa (solo inicio de palabra)

| Modelo | MAE (ms) | P90 (ms) | >500 ms | t <= 50 ms |
| --- | ---: | ---: | ---: | ---: |
| Qwen3-ForcedAligner-0.6B oficial, FIXED | 89,66 | 105,20 | 4,10% | 75,25% |
| **Qwen3-ForcedAligner-Ultra, FIXED** | 60,94 | **81,40** | 2,12% | 76,10% |
| **Qwen3-ForcedAligner-Ultra + Local Head, FIXED** | **58,63** | 81,88 | **1,98%** | **82,32%** |
| MMS-300M-1130 | 373,86 | 321,38 | 8,49% | 59,69% |

#### Velocidad en NVIDIA GeForce RTX 5070 Ti (RTFx, veces tiempo real)

| Modelo | RTFx |
| --- | ---: |
| Qwen3-ForcedAligner-0.6B oficial | 150x |
| Qwen3-ForcedAligner-Ultra | 150x |
| Qwen3-ForcedAligner-Ultra + Local Head | 95x |
| MMS-300M-1130 | 180x |
| WhisperX align (inglés) | 67x |

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM. Con 917,7 millones de parámetros, una estimación orientativa en precisión fp16 sería de ~1,8 GB de VRAM, y en fp32 ~3,7 GB, lo que permitiría su ejecución en GPUs de consumo con al menos 4 GB de memoria.
- El autor reporta mediciones de velocidad en una NVIDIA GeForce RTX 5070 Ti, alcanzando 150x en tiempo real sin Local Head y 95x con Local Head.
- Para despliegue en producción, el modelo es compatible con la librería `transformers` y la API `qwen-asr` (modo sin Local Head). No se menciona soporte explícito para vLLM, llama.cpp u Ollama.
- El Local Head añade una pequeña latencia adicional (reduce RTFx de 150x a 95x) pero mejora la precisión de límites.

## Comparativa con modelos similares

La siguiente tabla compara Qwen3-ForcedAligner-Ultra con el modelo oficial del que deriva y con MMS-300M-1130, ambos evaluados en el mismo conjunto de pruebas.

| Modelo | Parametros | Idiomas | MAE (ms) | Precisión t<=50 ms | Licencia |
| --- | ---: | ---: | ---: | ---: | --- |
| Qwen3-ForcedAligner-Ultra (sin Local Head) | 917,7 M | 11 | 34,95 | 89,886% | Apache-2.0 |
| Qwen3-ForcedAligner-Ultra + Local Head | 917,7 M + head | 11 | 26,59 | 91,821% | Apache-2.0 |
| Qwen3-ForcedAligner-0.6B oficial | ~600 M | 11 | 124,95 | 77,597% | Apache-2.0 |
| MMS-300M-1130 (Meta) | ~300 M | 1130 | 98,18 | 55,769% | CC-BY-NC 4.0 |

Qwen3-ForcedAligner-Ultra supera claramente al modelo oficial en todos los umbrales de precisión y en error absoluto, manteniendo la misma licencia permisiva. Frente a MMS, la ventaja es aún mayor en precisión y en la cola de errores catastróficos, aunque MMS es más rápido (180x vs 150x) y cubre muchos más idiomas.

## Limitaciones y advertencias

- El modelo hereda las limitaciones del modelo base Qwen3-ForcedAligner-0.6B en cuanto a resolución temporal intrínseca (80 ms); el Local Head mitiga esta limitación pero solo dentro de un entorno de ±60 ms.
- La cobertura de idiomas es desigual: cantonés y portugués tienen menos datos de fine-tuning y deben validarse para dominios específicos.
- Aunque el entrenamiento incluye errores de ASR simulados, transcripciones extremadamente divergentes del audio (por ejemplo, reescrituras completas) pueden producir alineaciones incorrectas.
- El modelo no realiza reconocimiento de voz; requiere una transcripción de entrada. No es un sustituto de un sistema ASR completo.
- El autor reporta que la evaluación principal usa anotaciones manuales corregidas, pero no se especifican los detalles de los datos de entrenamiento (procedencia, volumen total, equilibrio entre idiomas).
- No se han publicado resultados de sesgos o comportamientos en habla con acentos muy marcados o condiciones acústicas extremas; se recomienda probar en el dominio objetivo antes de usar en producción.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías; el autor no ofrece soporte oficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/17slever17/Qwen3-ForcedAligner-Ultra
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Repositorio GitHub del proyecto Qwen3 Forced Aligner: https://github.com/WEIFENG2333/qwen3-forced-aligner
- Space de HuggingFace con demo interactiva: https://huggingface.co/spaces/sleeper371/qwen3_force_aligner
- Repositorio oficial Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Informe técnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
