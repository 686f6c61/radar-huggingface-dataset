# Phoonnx/coqui-vits-ca-custom-vits

## Resumen

Phoonnx/coqui-vits-ca-custom-vits es un modelo de síntesis de voz (text-to-speech) derivado del repositorio agregador Phoonnx/phoonnx-coqui-vits, que empaqueta voces basadas en la arquitectura Coqui VITS en formato ONNX para su uso con la librería phoonnx. Este modelo concreto corresponde a la carpeta `ca-custom-vits`, identificada con el código de idioma `ca` (catalán) y la etiqueta de voz `custom`, y se distribuye con licencia CC-BY-4.0.

El modelo no aporta arquitectura propia ni pesos entrenados desde cero por el autor: es una extracción de un modelo VITS de Coqui (familia de TTS neuronal end-to-end que combina un encoder de texto, un predictor de duración y un decoder generativo con discriminadores adversariales en entrenamiento) redistribuido en formato ONNX para inferencia. Su relevancia es práctica: permite a los usuarios de phoonnx disponer de una voz catalana preempaquetada sin depender del stack original de Coqui TTS.

La información publicada es muy limitada: el repositorio ocupa 0,1 GB, no registra descargas ni interacciones, no declara idiomas en los metadatos de Hugging Face y la model card se limita a indicar la procedencia y la licencia. No se publican especificaciones de parámetros, contexto, dataset de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coqui VITS (TTS neuronal end-to-end), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; la entrada es texto, no una ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | catalan (`ca`, segun el identificador de la voz); metadatos de idioma en Hugging Face: no disponibles |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (basada en ONNX Runtime) |
| Identificador de voz | `coqui/ca-custom-vits` |

## Arquitectura y entrenamiento

VITS (Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech) es una arquitectura de síntesis de voz que integra en un único modelo el encoder de texto, el predictor de duración (con alineamiento monotónico), el módulo de expansión por duraciones y un decoder generativo basado en flujos normalizadores y un decoder HiFi-GAN. El entrenamiento combina pérdidas de reconstrucción, KL, alineamiento por duración y un esquema adversarial con discriminadores múltiples. El resultado es un modelo que genera waveform directamente a partir de fonemas o texto normalizado, sin vocoder externo separado.

En este caso, el autor (Phoonnx) no documenta el proceso de entrenamiento: no se indica el número de tokens, la composición del dataset, la duración del audio de entrenamiento, ni si se aplicaron técnicas de fine-tuning sobre una voz base. La model card únicamente declara que el modelo procede de la carpeta `ca-custom-vits` del repositorio Phoonnx/phoonnx-coqui-vits, que los ficheros conservan las rutas originales y que la licencia es la registrada por el repositorio fuente (CC-BY-4.0). La etiqueta `custom` sugiere una voz personalizada o no estándar dentro del catálogo, pero no se detalla su origen.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en catalán, orientada a la generación de waveform directamente en formato ONNX.
- Inferencia mediante la librería phoonnx, que envuelve ONNX Runtime y gestiona la carga de la voz con el identificador `coqui/ca-custom-vits`.
- Ejecución sin dependencia del stack completo de Coqui TTS, lo que simplifica el despliegue en entornos Python con ONNX Runtime.
- Voz única (no se documenta multi-hablante ni control de estilo, emoción o prosodia).
- No se documentan capacidades de clonación de voz, conversión voz-a-voz, tool calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje.
- Cobertura multilingüe: no disponible; el identificador apunta a catalán, pero no se especifican variantes dialectales ni calidad por registro.

## Casos de uso

- Lectura de contenido en catalán: integración en un pipeline de TTS para convertir artículos, documentación o noticias a audio, usando phoonnx con el identificador `coqui/ca-custom-vits` y ONNX Runtime como backend.
- Accesibilidad web: generación de audio bajo demanda para usuarios con discapacidad visual en sitios con contenido catalán, aprovechando el tamaño reducido del modelo (0,1 GB) para servirlo desde un contenedor ligero.
- Asistentes de voz locales: despliegue en dispositivos o entornos sin conectividad, ya que el formato ONNX permite inferencia en CPU sin servicios en la nube.
- Pruebas de integración en aplicaciones phoonnx: uso como voz de referencia para validar pipelines de síntesis, medir latencia y comparar con otras voces del catálogo Phoonnx.
- Prototipado de interfaces conversacionales en catalán: generación de respuestas habladas en demos de asistentes o chatbots, aceptando la ausencia de control emocional documentado.
- Preprocesado de datos y aumentación: generación de audio sintético en catalán para experimentos de ASR o para crear material de prueba en pipelines de evaluación de sistemas de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio pesa 0,1 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer (incluso en menos de 1 GB de VRAM) y puede ejecutarse en CPU.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (CUDA o DirectML); para producción de baja latencia se puede usar desde una RTX 3060 en adelante, aunque no se documentan requisitos oficiales.
- Cabe en GPU consumer: sí, por el tamaño del repositorio (0,1 GB); también es viable en CPU para cargas moderadas.
- Opciones de despliegue: phoonnx sobre ONNX Runtime (opción documentada por el autor); no se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput: no disponibles; no se publican mediciones de RTF (real-time factor) ni de velocidad de síntesis.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/coqui-vits-ca-custom-vits | TTS VITS (ONNX) | no disponible | catalan (segun id de voz) | CC-BY-4.0 | ONNX | Hugging Face, 0 descargas |
| Otras voces de Phoonnx/phoonnx-coqui-vits | TTS VITS (ONNX) | no disponible | multiples (segun carpeta) | segun repositorio fuente | ONNX | Hugging Face |
| Coqui TTS (modelos VITS originales) | TTS VITS | no disponible en esta ficha | multiples | MPL-2.0 en el codigo; pesos segun modelo | PyTorch / ONNX | GitHub y catálogo Coqui |

No se dispone de datos de rendimiento comparativo (MOS, RTF, WER) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Información muy escasa: no se documentan parámetros, dataset, proceso de entrenamiento ni evaluación, lo que impide estimar la calidad de la voz con rigor.
- Riesgo de artefactos y pronunciación incorrecta: al no haber benchmarks ni muestras documentadas, no se puede garantizar naturalidad ni cobertura fonética del catalán.
- Sin control de prosodia, emoción ni estilo documentado; la voz es única y no se declara multi-hablante.
- Sesgos: no disponibles; no se documenta la composición demográfica del audio de entrenamiento, por lo que no se puede evaluar sesgo de acento, género o edad.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor y conservar el aviso de licencia, y verificar que la licencia del repositorio fuente se mantiene.
- Fecha de creación del repositorio (2026-11-14) y ausencia de descargas: no hay evidencia de uso en producción ni de mantenimiento activo.
- Dependencia de phoonnx y ONNX Runtime: la compatibilidad con otras herramientas TTS no está garantizada.
- No apto para clonación de voz ni para tareas fuera de la síntesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/coqui-vits-ca-custom-vits
- Repositorio fuente de voces: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
