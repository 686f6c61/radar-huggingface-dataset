# open-edge-platform/gemma-3-4b-it-int4-ov-dls-sample

## Resumen

`open-edge-platform/gemma-3-4b-it-int4-ov-dls-sample` es un artefacto de demostración publicado por Intel (organización `open-edge-platform`) que empaqueta el modelo vision-language Gemma 3 4B de Google en formato OpenVINO IR con cuantización INT4, junto con scripts de ejemplo para dos pipelines de inferencia en el borde: OpenVINO GenAI y DLStreamer. No se trata de un modelo nuevo entrenado por Intel, sino de una build pre-exportada y pre-cuantizada del Gemma 3 4B instruct, orientada a describir en lenguaje natural el contenido de vídeo procedente de cámaras de tráfico urbano (caso de uso "smart city" / Metro).

El repositorio incluye un script `export_and_quantize.sh` que descarga los pesos ya convertidos (no requiere exportación local), un vídeo de prueba de 10 segundos y dos muestras ejecutables: `openvino_sample.py` (basado en `openvino_genai.VLMPipeline`) y una muestra DLStreamer que superpone subtítulos generados sobre los fotogramas. El artefacto por defecto soporta CPU y GPU; para NPU se remite a un artefacto separado (`OpenVINO/gemma-3-4b-it-int4-cw-ov`), que está sujeto a aceptación de condiciones en Hugging Face.

La relevancia actual del repo es operativa: permite desplegar un VLM multimodal de 4B parámetros en hardware Intel sin GPU dedicada, con un pipeline de vídeo listo para edge computing, y con licencia MIT en el artefacto de ejemplo (el modelo base Gemma conserva su propia licencia de Google, que conviene verificar por separado).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) del modelo base Gemma 3 4B de Google; empaquetado como OpenVINO IR |
| Parametros totales | 4B (heredados del modelo base `google/gemma-3-4b-it`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 (weight-compressed); artefacto adicional NPU-optimizado INT4 (`gemma-3-4b-it-int4-cw-ov`) |
| Idiomas soportados | en (segun la model card del artefacto) |
| Licencia | MIT (artefacto de ejemplo; el modelo base Gemma 3 tiene su propia licencia de Google, no detallada aqui) |
| Formato de pesos | OpenVINO IR (pre-exportado, sin necesidad de conversion local) |
| Runtime de inferencia | OpenVINO GenAI (GPU, CPU, NPU) y DLStreamer (GPU, CPU) |
| Hardware soportado | CPU y GPU Intel via OpenVINO GenAI y DLStreamer; NPU solo via OpenVINO GenAI con el artefacto NPU |
| Tamano del repo | 0.0 GB (los pesos se descargan desde los repos `OpenVINO/...` referenciados) |
| Pipeline Hugging Face | image-text-to-text |
| Fecha de creacion | 2026-11-17 |

## Arquitectura y entrenamiento

El artefacto no entrena ningún modelo: es una conversión y cuantización del Gemma 3 4B instruct de Google, un transformer multimodal que acepta imagen (o fotogramas de vídeo) y texto, y produce texto. La model card no detalla la arquitectura interna del modelo base (número de capas, atención, composición del dataset de entrenamiento, uso de RLHF/DPO), por lo que esos datos deben consultarse en la ficha oficial de `google/gemma-3-4b-it`.

La innovación técnica del repo es el empaquetado: pesos ya exportados a OpenVINO IR con compresión INT4, evitando al usuario pasos de exportación y cuantización. El pipeline de ejemplo procesa vídeo con un `FRAME_STRIDE` configurable (15 por defecto), extrae fotogramas con OpenCV, los pasa al `VLMPipeline` de OpenVINO GenAI con un prompt en lenguaje natural y un límite de `max_new_tokens = 40`, y superpone el texto generado sobre el vídeo. La variante NPU utiliza un artefacto distinto (`gemma-3-4b-it-int4-cw-ov`) con condiciones de acceso en Hugging Face; la muestra DLStreamer, en cambio, permanece limitada a CPU y GPU.

## Capacidades

- Descripción en lenguaje natural de escenas de vídeo: vehículos, peatones, flujo de tráfico y actividad en intersecciones.
- Comprensión imagen-texto (pipeline `image-text-to-text`), heredada de Gemma 3 4B instruct.
- Generación de subtítulos superpuestos sobre fotogramas en tiempo de ejecución (muestra DLStreamer).
- Procesamiento por lotes de fotogramas con stride configurable para controlar coste computacional.
- Ejecución en CPU, GPU y NPU Intel mediante OpenVINO GenAI; CPU y GPU mediante DLStreamer.
- Soporte de prompts en lenguaje natural configurables (el prompt de ejemplo pide describir peatones, vehículos y actividad).
- Capacidades adicionales del modelo base (tool calling, agentes, matemáticas, código, multilingüismo) no están documentadas en esta model card: no disponible.

## Casos de uso

- Vigilancia urbana en tiempo real: el pipeline procesa el flujo de una cámara de tráfico y genera descripciones continuas de la escena, adecuado para despliegues en edge con CPU o iGPU Intel sin depender de la nube.
- Triaje de incidentes: el modelo describe escenas anómalas (aglomeraciones, vehículos detenidos) en texto, lo que permite a un operador filtrar alertas sin revisar vídeo manualmente.
- Análisis de tráfico multimodal: registro textual de densidad de vehículos, flujo de peatones y actividad en pasos de cebra, útil para informes automáticos.
- Asistencia a operadores: pregunta-respuesta visual sobre cámaras en directo usando prompts en lenguaje natural, con el `VLMPipeline` de OpenVINO GenAI.
- Despliegue en hardware de borde: al estar cuantizado a INT4 y soportar CPU/NPU, encaja en equipos Intel NUC, mini-PC o estaciones sin GPU dedicada.
- Integración en pipelines de vídeo existentes: la muestra DLStreamer demuestra cómo insertar el VLM como etapa de descripción dentro de un grafo GStreamer/DLStreamer.
- Prototipado rápido de aplicaciones VLM: el script de descarga y las muestras permiten validar el modelo en minutos sin exportación ni cuantización manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explícita; al ser un modelo de 4B parámetros en INT4, la huella de pesos ronda los 2-3 GB, pero la model card no confirma cifras.
- GPU: soportadas vía OpenVINO GenAI y DLStreamer (GPU Intel integradas y dedicadas compatibles con OpenVINO); no se listan modelos concretos.
- CPU: soportada vía OpenVINO GenAI y DLStreamer; requisito de Python 3.11+ y FFmpeg para transcodificar el vídeo de muestra.
- NPU: soportada solo vía OpenVINO GenAI con el artefacto `gemma-3-4b-it-int4-cw-ov` (acceso condicionado en Hugging Face).
- Despliegue: OpenVINO GenAI (`openvino_genai.VLMPipeline`) y DLStreamer; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la muestra limita la generación a 40 tokens nuevos por fotograma procesado y usa un stride de 15 fotogramas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Runtime | Licencia | Notas |
|---|---|---|---|---|---|---|
| `open-edge-platform/gemma-3-4b-it-int4-ov-dls-sample` | 4B | no disponible | OpenVINO IR INT4 | OpenVINO GenAI, DLStreamer | MIT (artefacto) | Demo de descripción de vídeo smart-city |
| `OpenVINO/gemma-3-4b-it-int4-ov` | 4B | no disponible | OpenVINO IR INT4 | OpenVINO GenAI | no disponible | Artefacto base CPU/GPU del que deriva este repo |
| `OpenVINO/gemma-3-4b-it-int4-cw-ov` | 4B | no disponible | OpenVINO IR INT4 | OpenVINO GenAI | no disponible | Variante optimizada para NPU, acceso condicionado |
| `google/gemma-3-4b-it` | 4B | no disponible | safetensors (PyTorch) | Transformers | licencia Gemma de Google | Modelo base original |

## Limitaciones y advertencias

- El artefacto está pensado como muestra de demostración; no se documenta su validación para producción más allá de las pruebas de humo mencionadas.
- Idiomas: la model card declara únicamente inglés (`en`); no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinación inherente a los VLM: las descripciones de escenas pueden inventar objetos o eventos no presentes, especialmente con fotogramas de baja calidad o iluminación adversa.
- El prompt de ejemplo y el límite de 40 tokens nuevos por fotograma restringen la profundidad de las descripciones; ajustes mayores pueden afectar la latencia.
- Licencia: el artefacto se declara MIT, pero el modelo base Gemma 3 está sujeto a la licencia de Google, cuyos términos de uso comercial deben verificarse en la ficha oficial de `google/gemma-3-4b-it`.
- La variante NPU requiere aceptar condiciones en Hugging Face y autenticarse; DLStreamer no soporta NPU en esta muestra.
- El repositorio tiene 0.0 GB: los pesos no están incluidos y deben descargarse mediante el script, lo que exige conectividad y aprobación interactiva.
- No se documentan sesgos específicos ni evaluaciones de robustez en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/open-edge-platform/gemma-3-4b-it-int4-ov-dls-sample
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Artefacto OpenVINO INT4 CPU/GPU: https://huggingface.co/OpenVINO/gemma-3-4b-it-int4-ov
- Artefacto OpenVINO INT4 NPU: https://huggingface.co/OpenVINO/gemma-3-4b-it-int4-cw-ov
- Documentación OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
