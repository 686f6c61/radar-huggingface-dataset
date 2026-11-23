# Fertroll10/gemma-4-E2B-it-litert-lm-npu

## Resumen

Gemma 4 E2B IT es un modelo de lenguaje de Google derivado de la familia Gemma 4, en su variante "E2B" orientada a dispositivos móviles y con ajuste de instrucciones (IT). Este repositorio concreto, publicado por el usuario Fertroll10, no contiene los pesos originales sin procesar, sino una compilación del checkpoint oficial de Google (`google/gemma-4-E2B-it-qat-mobile-transformers`) para ejecutarse íntegramente en la NPU Hexagon del SoC Qualcomm Snapdragon 8 Gen 3 (SM8650), empaquetada en formato `.litertlm` para el runtime LiteRT-LM.

El problema que resuelve es la inferencia local de un modelo de lenguaje en un teléfono Android aprovechando la NPU en lugar de la CPU o la GPU, con un salto de rendimiento notable: según las mediciones del autor en un Galaxy Z Fold6, el prefill pasa de 540-1.050 tok/s en GPU a 2.370-2.720 tok/s en NPU, y la decodificación de 14-16 tok/s a 29-31 tok/s. Es, por tanto, una pieza relevante para quien quiera integrar un LLM conversacional en una app Android con latencia aceptable y sin depender de la nube.

Se trata de una compilación comunitaria, no publicada ni soportada por Google ni por Qualcomm. El modelo base es de tipo "E2B" (variante móvil de Gemma 4), con cuantización QAT mixta de 4, 8 y 2 bits, y dos variantes de contexto: 4.096 y 16.384 tokens. El tamaño del repositorio es de 28,8 GB, aunque los artefactos individuales pesan 2,31 GB y 2,36 GB respectivamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (checkpoint móvil Gemma 4 E2B IT con cuantización QAT); grafos separados de prefill y decode compilados para NPU Hexagon |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens (fichero 4k) / 16.384 tokens (fichero 4k-16k, con conmutación interna a partir de 4.096) |
| Tipos de cuantizacion | Pesos de 4, 8 y 2 bits según el checkpoint QAT; entradas/salidas de capas cuantizadas en 8 bits a las escalas de Google; activaciones en 16 bits; atención en entero de 16 bits (versiones 4k) o en coma flotante (versión 16k) |
| Idiomas soportados | no disponible (la model card no los detalla; los tests de recuperación usan prompts en inglés y portugués) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), compilado AOT para SM8650 con QAIRT 2.50 |

## Arquitectura y entrenamiento

El modelo base es el checkpoint QAT móvil de Gemma 4 E2B IT de Google, entrenado con redondeo de 8 bits en las entradas y salidas de sus capas cuantizadas. Este repositorio no reentrena el modelo: exporta los pesos con `litert-torch` como grafos separados de prefill y decode, aplica cuantización de 4, 8 y 2 bits conforme al checkpoint, mantiene las escalas de 8 bits de Google y usa activaciones de 16 bits en el resto. La atención se implementa en entero de 16 bits en las versiones de 4k y en coma flotante en la versión de 16k, decisión motivada por la necesidad de precisión en prompts largos. Los embedders y embedders por capa provienen del checkpoint QAT y la plantilla de chat es la de LiteRT-LM de Google.

La compilación es ahead-of-time para el SM8650 con QAIRT 2.50, con pesos compartidos entre prefill y decode. La calibración se hizo sobre prompts generales y documentos largos de hasta 15.000 tokens. El autor documenta un cambio relevante: la primera revisión omitía el redondeo de 8 bits del checkpoint, lo que degradaba la recuperación en prompts largos (el modelo decía que la información no estaba o generaba texto roto más allá de ~3.000 tokens); la revisión actual restaura ese redondeo a las escalas de Google y calibra hasta 15.000 tokens. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat de LiteRT-LM.
- Recuperación de información en prompts largos: el autor valida la localización de un dato oculto (contraseña, ciudad, temperatura o código) en prompts de 1.000 a 15.000 tokens, en posición inicial, media o final.
- Memoria conversacional a través de turnos: se conserva un código dado en el primer turno tras un documento largo en el segundo (unos 2.900 tokens con el fichero 4k y 7.600 con el 4k-16k).
- Procesamiento de documentos largos en dispositivo hasta 16.384 tokens con el fichero 4k-16k.
- Entrada exclusivamente de texto (ambos ficheros "take text input").
- Ejecución íntegra en NPU Hexagon del Snapdragon 8 Gen 3, sin repartir capas a CPU/GPU.
- Tool calling, function calling, agentes, razonamiento multi-paso, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional dentro de una app Android: el modelo corre en la NPU del teléfono con 29-31 tok/s de decodificación y 9-12 s de carga para el fichero 4k, lo que permite un chat fluido sin conexión y sin coste de inferencia en servidor.
- Resumen y preguntas sobre documentos largos en el dispositivo: con el fichero 4k-16k y un contexto de 16.384 tokens, se pueden procesar informes o contratos de hasta ~15.000 tokens manteniendo los datos en el terminal; el primer token llega en unos 13 s para 6.000 tokens y 61 s para 15.000.
- Extracción de datos de fuentes de código: el autor valida la recuperación de hechos ocultos en prompts construidos a partir de ficheros fuente Python, útil para asistentes de desarrollo que respondan preguntas sobre un repositorio local.
- Procesamiento de texto con privacidad estricta: al ejecutarse íntegramente en el SoC, es adecuado para aplicaciones de salud, finanzas o legal en las que el texto no puede salir del dispositivo.
- Funcionalidad offline en campo: apps de inspección, logística o atención en entornos sin conectividad que necesiten un LLM local con latencia predecible.
- Prototipado de funciones de IA en Android con LiteRT-LM: sirve como referencia para integrar modelos compilados para NPU en apps que usen `Backend.NPU` y las librerías QNN indicadas.
- Traducción o reescritura de textos en local: aunque la model card no detalla los idiomas soportados, los tests incluyen prompts en inglés y portugués, por lo que es razonable para flujos bilingües, siempre validando la calidad por idioma.

## Benchmarks y rendimiento

El autor publica una prueba propia de recuperación de información en prompts largos (21 prompts de 1.000 a 15.000 tokens, con un dato oculto):

| Modelo | Prompts hasta 3.800 tokens | Los 21 prompts |
|---|---|---|
| Checkpoint QAT de Google (escritorio, precisión completa) | 11 / 12 | 20 / 21 |
| Mismo checkpoint sin redondeo de 8 bits (escritorio) | 6 / 12 | 7 / 21 |
| Primera revisión de este repositorio (Galaxy Z Fold6) | 4 / 12 | n/a |
| `gemma-4-E2B-it_Qualcomm_SM8650.litertlm` (Galaxy Z Fold6) | 12 / 12 | n/a |
| `gemma-4-E2B-it_Qualcomm_SM8650_4k-16k.litertlm` (Galaxy Z Fold6) | 12 / 12 | 20 / 21 |

Rendimiento medido en Galaxy Z Fold6 (SM8650), prefill de 512 a 3.072 tokens y 128 tokens decodificados:

| Backend | Prefill (tok/s) | Decode (tok/s) | Tiempo de carga |
|---|---:|---:|---:|
| NPU, fichero 4k | 2.370 a 2.720 | 29 a 31 | 9 a 12 s |
| NPU, fichero 4k-16k (prompts < 4.096 tokens) | 2.260 a 2.650 | 29 a 33 | 39 a 53 s |
| GPU (`.litertlm` de Google) | 540 a 1.050 | 14 a 16 | 13 a 16 s |
| CPU (`.litertlm` de Google) | 110 a 205 | 11 a 19 | n/a |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- SoC: exclusivamente Qualcomm Snapdragon 8 Gen 3 (SM8650); ambos ficheros "run only on SM8650".
- Almacenamiento: 2,31 GB para el fichero 4k y 2,36 GB para el 4k-16k (el repositorio completo ocupa 28,8 GB por las revisiones anteriores).
- Runtime: LiteRT-LM 0.18 en Android con `Backend.NPU`.
- Librerías: dispatch de Qualcomm de LiteRT 2.3.0 con QNN de QAIRT 2.50 (`libQnnHtp.so`, `libQnnSystem.so`, `libQnnHtpV75Stub.so`, `libQnnHtpV75Skel.so`); el dispatch rechaza versiones QNN anteriores.
- Manifest de la app: requiere `<uses-native-library android:name="libcdsprpc.so" android:required="false"/>`.
- No cabe en GPU de consumo de escritorio: está compilado para la NPU Hexagon v75, no para CUDA ni ROCm; no es desplegable en vLLM, llama.cpp, Ollama ni TGI.
- Memoria: no se detalla el consumo de RAM del dispositivo.
- Latencia: primer token en ~13 s para 6.000 tokens, ~34 s para 10.000 y ~61 s para 15.000 con el fichero 4k-16k; la primera ejecución tras cargar el 4k-16k es más lenta (1.630 tok/s de prefill a 512 tokens).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Despliegue | Licencia | Estado |
|---|---|---|---|---|---|
| Este repositorio (Gemma 4 E2B IT, LiteRT-LM NPU) | no disponible | 4.096 / 16.384 | NPU Hexagon SM8650 | Apache 2.0 | Compilación comunitaria |
| `google/gemma-4-E2B-it` (LiteRT-LM de Google) | no disponible | no disponible | CPU/GPU Android | Apache 2.0 | Oficial |
| `google/gemma-4-E2B-it-qat-mobile-transformers` | no disponible | no disponible | Escritorio (transformers) | Apache 2.0 | Oficial, checkpoint QAT |
| `google/gemma-4-E2B-it` (modelo base) | no disponible | no disponible | Servidor/escritorio | Apache 2.0 | Oficial |

La comparación cuantitativa con alternativas de terceros (por ejemplo, otros LLM móviles de 2B-3B parámetros) no está disponible en la información proporcionada. Frente a las variantes oficiales de Google, la diferencia medible es el rendimiento en NPU: 2.370-2.720 tok/s de prefill y 29-31 tok/s de decode frente a 540-1.050 y 14-16 en GPU.

## Limitaciones y advertencias

- Compilación comunitaria: no está publicada ni soportada por Google ni por Qualcomm; el autor no ofrece garantías de mantenimiento.
- Compatibilidad restringida: solo funciona en Snapdragon 8 Gen 3 (SM8650); no hay versiones para otros SoC, GPU de escritorio ni servidores.
- Solo entrada de texto: no admite visión, audio ni otras modalidades.
- Idiomas no documentados: la model card no enumera los idiomas soportados; conviene validar la calidad en castellano antes de usarlo en producción.
- Riesgo de alucinación: es un LLM generativo y no se han publicado evaluaciones de factualidad más allá de la prueba de recuperación del autor.
- Dependencia frágil de versiones: exige LiteRT-LM 0.18, LiteRT 2.3.0 y QAIRT 2.50; versiones distintas de QNN son rechazadas por la librería de dispatch.
- Contexto efectivo: el fichero 4k está limitado a 4.096 tokens; el 4k-16k conmuta a la versión de 16k por encima de 4.096 tokens, con mayor tiempo de carga (39-53 s) y mayor latencia en prompts largos.
- Historial de calidad: la primera revisión del repositorio tenía degradación grave en prompts largos; conviene usar la revisión actual y no las anteriores.
- Sesgos: no se documentan sesgos específicos en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base es de Google y se recomienda revisar la model card de Gemma 4 para condiciones adicionales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Fertroll10/gemma-4-E2B-it-litert-lm-npu
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Checkpoint QAT usado para la exportación: `google/gemma-4-E2B-it-qat-mobile-transformers`
- LiteRT-LM (runtime): https://github.com/google-ai-edge/LiteRT-LM
- Model card de Gemma 4 citada por el autor: https://huggingface.co/google/gemma-4-E2B-it
