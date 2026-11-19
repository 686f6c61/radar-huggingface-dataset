# software-mansion/react-native-executorch-supertonic

## Resumen

Supertonic es un sistema de síntesis de voz (text-to-speech) desarrollado originalmente por Supertone y reempaquetado por Software Mansion para su uso en React Native ExecuTorch. Este repositorio concreto no contiene los pesos originales en formato de entrenamiento, sino los programas `.pte` de ExecuTorch derivados del modelo base `Supertone/supertonic-3`, listos para ejecutarse en dispositivo (on-device) en aplicaciones móviles y de escritorio. El pipeline es text-to-speech y la librería declarada es `executorch`.

El modelo se distribuye como un conjunto de cuatro componentes diferenciados —`duration_predictor`, `text_encoder`, `vector_estimator` y `vocoder`— exportados para tres backends: MLX (Apple Silicon, fp32), Vulkan (fp16) y XNNPACK (fp32 e int8). Esta modularidad permite ajustar precisión y backend según el hardware objetivo, con variantes int8 que reducen el `vector_estimator` de 245 MB a 62,9 MB y el vocoder de 96,7 MB a 36,8 MB.

Su relevancia actual radica en que ofrece TTS multilingüe (30 idiomas) ejecutable localmente sin dependencia de servicios en la nube, con estilos de voz predefinidos (cinco femeninos y cinco masculinos) y compatibilidad declarada con ExecuTorch v1.4.1. Es una pieza pensada para integrarse en el ecosistema React Native mediante la librería `react-native-executorch`, no como modelo de propósito general en servidor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base `Supertone/supertonic-3`; pipeline TTS con componentes duration_predictor, text_encoder, vector_estimator y vocoder) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | fp32 (MLX y XNNPACK), fp16 (Vulkan), int8 (XNNPACK: 8da8w en capas Linear, con ConvNeXt pointwise convs convertidas a Linears) |
| Idiomas soportados | 30: en, es, fr, pl, el, id, zh, ja, ru, tr, da, et, hr, pt, vi, sl, cs, it, uk, ko, sv, lv, hu, fi, ar, nl, sk, bg, hi, de, lt |
| Licencia | openrail |
| Formato de pesos | ExecuTorch `.pte` (más `config.json`, `unicode_indexer.json`, estilos de voz `voice_styles/*.json` y voces `voices/*.bin`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentación proporcionada. El repositorio es una exportación a ExecuTorch del modelo base `Supertone/supertonic-3`, y la model card solo describe la estructura de artefactos y los detalles de exportación, no el diseño del modelo original.

Lo que sí se documenta es la descomposición en cuatro etapas: un `duration_predictor` (3,4 MB en fp32 XNNPACK), un `text_encoder` (34,5 MB en fp32 XNNPACK), un `vector_estimator` (245 MB en fp32 XNNPACK, 62,9 MB en int8) y un `vocoder` (96,7 MB en fp32 XNNPACK, 36,8 MB en int8). La existencia de un `vector_estimator` y de un parámetro de "steps" (se evalúa con 8 pasos) sugiere un esquema de generación iterativa, probablemente basado en difusión o flow matching, aunque esto no se confirma explícitamente. La mención a ConvNeXt pointwise convs en el proceso de cuantización int8 indica presencia de bloques convolucionales en al menos parte de la arquitectura. No hay datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) en 30 idiomas, incluyendo español, inglés, francés, alemán, italiano, portugués, chino, japonés, coreano, árabe, hindi y ruso, entre otros.
- Diez estilos de voz predefinidos: cinco femeninos (F1–F5) y cinco masculinos (M1–M5), cada uno con un fichero de estilo (`voice_styles/*.json`, ~285 kB) y un fichero de voz (`voices/*.bin`, 50,5 kB).
- Generación controlada por pasos: la evaluación documentada usa 8 steps, lo que permite ajustar el compromiso entre calidad y coste computacional.
- Ejecución on-device en tres backends: MLX (Apple Silicon), Vulkan (GPU multiplataforma) y XNNPACK (CPU).
- Cuantización int8 selectiva en `vector_estimator` y `vocoder` para reducir huella de memoria en dispositivos con recursos limitados.
- Integración con React Native mediante la librería `react-native-executorch`, que expone constantes de modelo en su registro para los pipelines de tarea correspondientes.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura por voz en aplicaciones móviles React Native: integración directa mediante `react-native-executorch`, usando los `.pte` de XNNPACK o Vulkan para sintetizar texto en el dispositivo sin llamadas a red, lo que elimina latencia de servicio y costes por petición.
- Asistentes de accesibilidad: conversión de contenido textual (notificaciones, artículos, mensajes) a audio para usuarios con discapacidad visual, aprovechando los 30 idiomas y los diez estilos de voz para ofrecer una experiencia consistente en distintos mercados.
- Audiolibros y podcasts generados localmente: el `vector_estimator` con 8 pasos y el vocoder permiten generar narración de forma iterativa; el tamaño contenido de los artefactos int8 (62,9 MB + 36,8 MB) facilita el despliegue en dispositivos de gama media.
- Aprendizaje de idiomas: pronunciación sintética en los 30 idiomas soportados, con voces masculinas y femeninas, útil para aplicaciones de repetición y práctica de escucha sin depender de servicios externos.
- Sistemas de navegación y automoción: instrucciones de voz generadas on-device con backend Vulkan en GPUs embebidas, evitando la dependencia de conectividad en vehículos.
- Prototipado rápido de interfaces de voz: uso de los ficheros MLX fp32 en Macs con Apple Silicon para iterar sobre guiones y estilos de voz antes de desplegar la variante int8 en el dispositivo final.
- Privacidad de datos en entornos sanitarios o financieros: al ejecutarse localmente, el texto que se convierte a voz no abandona el dispositivo, lo que encaja en flujos con requisitos de confidencialidad.

## Benchmarks y rendimiento

La model card incluye una evaluación de calidad mediante WER de un round trip con Whisper base.en sobre textos de LibriSpeech test-clean, voz F1 y 8 pasos:

| Variante | WER (57 cortos) | WER (8 largos) |
|---|---|---|
| fp32 | 3,36 | 3,32 |
| fp32, otra semilla de ruido | 3,26 | 3,80 |
| int8 | 3,74 | 3,01 |

No se han publicado en la información disponible resultados de benchmarks estándar de TTS (MOS, RTF, latencia) ni comparaciones con otros sistemas.

## Requisitos de hardware

- Huella de memoria por backend (suma de los cuatro componentes):
  - MLX fp32: 3,4 MB + 34,4 MB + 244 MB + 96,7 MB ≈ 378,5 MB.
  - Vulkan fp16: 1,7 MB + 17,3 MB + 122 MB + 48,4 MB ≈ 189,4 MB.
  - XNNPACK fp32: 3,4 MB + 34,5 MB + 245 MB + 96,7 MB ≈ 379,6 MB.
  - XNNPACK int8 (vector_estimator y vocoder int8, resto fp32): 3,4 MB + 34,5 MB + 62,9 MB + 36,8 MB ≈ 137,6 MB.
- GPU recomendadas: Apple Silicon para el backend MLX; GPUs compatibles con Vulkan (incluye GPUs integradas y dedicadas de escritorio y móviles) para la variante fp16.
- CPU: cualquier CPU con soporte XNNPACK; la variante int8 está pensada para reducir el coste en dispositivos con memoria limitada.
- Cabe en GPU de consumo: sí, con amplio margen; incluso la variante fp32 completa (~380 MB) es muy inferior a la VRAM de una RTX 4090 o similar, y la int8 (~138 MB) es apta para móviles de gama media.
- Opciones de despliegue: runtime ExecuTorch v1.4.1 (obligatorio por compatibilidad, sin garantía de forward compatibility) y la librería `react-native-executorch` para React Native. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparación cuantitativa fiable con alternativas TTS. A modo de contexto estructural, se indican diferencias de formato y despliegue:

| Modelo | Formato | Despliegue | Idiomas | Licencia |
|---|---|---|---|---|
| react-native-executorch-supertonic | ExecuTorch `.pte` | On-device (React Native, ExecuTorch v1.4.1) | 30 | openrail |
| Supertone/supertonic-3 (base) | No disponible | No disponible | No disponible | No disponible |
| Alternativas TTS on-device | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la información proporcionada modelos comparables con datos verificables de parámetros, contexto o benchmarks.

## Limitaciones y advertencias

- El repositorio contiene únicamente artefactos exportados; no incluye los pesos originales ni información sobre el entrenamiento, por lo que la reproducibilidad y el ajuste fino no están cubiertos.
- Compatibilidad estricta con ExecuTorch v1.4.1: el runtime no garantiza compatibilidad hacia delante, y un runtime más antiguo puede fallar al cargar los `.pte`.
- El backend CoreML fue exportado pero no publicado; el motivo se documenta en `coreml/NOTES.md`, lo que indica que no hay soporte CoreML en esta entrega.
- La cuantización int8 solo se aplica a `vector_estimator` y `vocoder`; el `duration_predictor` y el `text_encoder` reutilizan fp32, de modo que el ahorro de memoria es parcial.
- Los resultados de WER muestran variabilidad entre semillas de ruido (3,26–3,80 en fp32), lo que sugiere sensibilidad a la inicialización estocástica del proceso de generación.
- No se documentan sesgos de voz, cobertura real por idioma ni calidad relativa entre los 30 idiomas declarados; la evaluación se limita a inglés (LibriSpeech) con la voz F1.
- Riesgo de alucinación o artefactos de pronunciación en textos con nombres propios, siglas o dominios especializados no evaluados.
- Licencia openrail: conviene revisar sus términos antes de uso comercial, especialmente en lo relativo a atribución y restricciones de uso.
- No hay datos publicados de latencia, throughput ni MOS, lo que dificulta estimar el rendimiento en producción sin pruebas propias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/software-mansion/react-native-executorch-supertonic
- Modelo base: https://huggingface.co/Supertone/supertonic-3
- Librería React Native ExecuTorch: https://www.npmjs.com/package/react-native-executorch
- Documentación de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
- Notas del backend CoreML no publicado: https://huggingface.co/software-mansion/react-native-executorch-supertonic/blob/main/coreml/NOTES.md
