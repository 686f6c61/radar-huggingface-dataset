# qhddz/sensevoice-small-rknn3-rk1828

## Resumen

SenseVoice-Small (RKNN3 / RK1828) es una conversión del modelo de reconocimiento automático de voz (ASR) SenseVoice-Small de Alibaba (familia FunAudioLLM) al formato RKNN3, empaquetado específicamente para su ejecución sobre la NPU del SoC Rockchip RK1828. El artefacto, publicado por el usuario qhddz, no es un modelo nuevo entrenado desde cero, sino una compilación de pesos ya convertidos y verificados sobre hardware real, lista para descargar y ejecutar sin necesidad de volver a compilar.

El modelo original SenseVoice-Small es un sistema ASR multilingüe que, además de transcribir, etiqueta el idioma detectado, la emoción del hablante y eventos sonoros presentes en el audio. Esta versión RKNN3 traslada esas capacidades al ámbito del edge computing, apuntando a despliegues de baja latencia sobre aceleradores NPU en lugar de GPU.

El repositorio es de tamaño reducido (0,1 GB), incluye un demo precompilado para host x86_64 que se comunica con el RK1828 vía PCIe, y se distribuye bajo licencia MIT. Su relevancia radica en facilitar el despliegue de ASR multilingüe en dispositivos embebidos sin depender de infraestructura cloud.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR original SenseVoice-Small; artefacto en formato RKNN3) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (procesa clips de audio; el artefacto se denomina "fix_10s") |
| Tipos de cuantización | no disponible (pesos en formato propietario RKNN3: `.rknn` / `.weight`) |
| Idiomas soportados | multilingüe (ASR con etiquetado de idioma); lista concreta no disponible |
| Licencia | MIT (FunAudioLLM SenseVoice) |
| Formato de pesos | RKNN3 (`.rknn` y `.weight`), más `tokens.txt` y `embedding_matrix.txt` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original SenseVoice-Small ni los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO). Lo que sí se documenta es el proceso de conversión: los archivos `.rknn` fueron generados con los pipelines oficiales de rknn3-model-zoo y verificados sobre hardware RK1828 real.

El artefacto se orienta a la plataforma Rockchip RK1828 con RKNN3, operando desde un host x86_64 conectado por PCIe. El nombre del fichero principal (`sensevoice_fix_10s`) sugiere una ventana de audio fija de 10 segundos por clip, aunque este extremo no se confirma explícitamente en la model card. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático de voz (ASR) multilingüe, según la descripción del modelo original SenseVoice-Small.
- Etiquetado de idioma detectado en la salida.
- Etiquetado de emoción del hablante en la salida.
- Detección y etiquetado de eventos sonoros presentes en el audio.
- Ejecución sobre NPU Rockchip RK1828 mediante RKNN3, con host x86_64 vía PCIe.
- Inclusión de un demo C++ precompilado (`demo_x86_64.tar.gz`) con librerías de runtime.
- No se documentan capacidades de tool calling, agentes, visión ni audio generativo.

## Casos de uso

- Transcripción en dispositivos embebidos: el modelo puede ejecutarse directamente sobre la NPU RK1828 para convertir voz en texto en local, sin enviar audio a la nube, lo que resulta adecuado para equipos con requisitos de privacidad.
- Análisis de emoción en atención al cliente: al etiquetar la emoción del hablante junto con la transcripción, permite construir sistemas de monitorización de calidad de llamadas en tiempo real sobre hardware de bajo consumo.
- Detección de eventos sonoros en entornos industriales: la capacidad de etiquetar eventos de audio facilita alertas automáticas ante sonidos anómalos en maquinaria o entornos monitorizados.
- Subtitulado local en kioscos y terminales: con una latencia declarada de 292 ms por clip en RK1828, encaja en interfaces interactivas que requieren respuesta casi inmediata.
- Enrutamiento por idioma en centralitas: el etiquetado de idioma en la salida permite dirigir llamadas o grabaciones al flujo de procesamiento adecuado de forma automática.
- Prototipado rápido en edge: al incluir pesos ya convertidos y verificados más un demo precompilado, permite validar un pipeline ASR sobre RK1828 sin invertir tiempo en la cadena de conversión.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| Latencia por clip | 292 ms | Medido sobre RK1828 con el audio de muestra `zh.wav` |

No se han publicado resultados de benchmarks de precisión (WER, MMLU, etc.) en la información disponible.

## Requisitos de hardware

- NPU Rockchip RK1828 (formato RKNN3), con host x86_64 conectado por PCIe.
- No se especifican requisitos de VRAM ni de memoria del host.
- No aplica el concepto de GPU consumer: el artefacto está compilado exclusivamente para la NPU RK1828.
- Despliegue mediante el demo C++ incluido (`demo_x86_64.tar.gz`) y sus librerías de runtime (`LD_LIBRARY_PATH=./lib`).
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia estimada: 292 ms por clip según medición del autor; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Formato / plataforma | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| SenseVoice-Small (RKNN3 / RK1828) | RKNN3 para NPU RK1828 | Multilingüe (lista no disponible) | MIT | Conversión verificada en hardware; 292 ms/clip |
| SenseVoice-Small original (FunAudioLLM) | Pesos originales (formato no detallado en esta ficha) | Multilingüe | MIT | Modelo base sin conversión para NPU |
| Whisper (variantes small) | Múltiples formatos (incl. GGUF, ONNX) | Multilingüe | MIT | Alternativa ASR ampliamente desplegada en edge |
| Alternativas RKNN para ASR | RKNN / RKNN3 | no disponible | no disponible | No se dispone de datos concretos en la información proporcionada |

Los datos de rendimiento comparado entre estas alternativas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona sobre NPU Rockchip RK1828 con RKNN3; no es portable a GPU ni CPU convencionales sin reconversión.
- El nombre `sensevoice_fix_10s` sugiere una ventana de audio fija de 10 segundos, lo que puede limitar la transcripción de clips más largos; no confirmado explícitamente.
- No se detalla la lista concreta de idiomas soportados ni la calidad por idioma.
- No se publican métricas de precisión (WER) ni evaluaciones independientes; el único dato de rendimiento es la latencia declarada por el autor.
- Riesgo de errores de transcripción y de etiquetado de emoción o eventos sonoro inherente a los sistemas ASR; no se documentan evaluaciones de sesgo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo original FunAudioLLM SenseVoice.
- El demo se distribuye como archivo comprimido porque Hugging Face no permite ejecutables sin empaquetar; requiere extracción previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhddz/sensevoice-small-rknn3-rk1828
- Repositorio de pipelines de conversión: https://github.com/airockchip/rknn3_model_zoo
- Modelo original SenseVoice (FunAudioLLM): no disponible en la información proporcionada
