# APLUX-Agora/StereoNet

## Resumen

StereoNet es un modelo de estimación de profundidad estéreo publicado por APLUX-Agora en Hugging Face. Toma como entrada un par de imágenes izquierda y derecha ya rectificadas y produce un mapa de disparidad por píxel junto con una imagen coloreada del resultado. El modelo está empaquetado como recurso de despliegue para placas Qualcomm dentro del ecosistema Agora, con binarios optimizados para el SoC QCS8550.

La relevancia del modelo no reside en una arquitectura novedosa publicada por el autor, sino en su formato de distribución: pesos convertidos y medidos sobre hardware real (placa Rhino Pi X1 con QCS8550) con una latencia reportada de 500,1 ms en precisión FP16. Esto lo orienta a casos de AIoT y visión embebida donde se necesita disparidad estéreo en el borde, no en servidor.

La información disponible es muy limitada: el repositorio ocupa 0,0 GB, no declara idiomas, no incluye parámetros, contexto ni resultados de benchmarks, y la licencia es propietaria (APLUX Model Farm License) sobre un modelo fuente cuyos términos originales no se detallan en la model card. Cualquier evaluación adicional requiere descargar los recursos y ejecutarlos en el hardware objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de estimación de disparidad estéreo (StereoNet); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP16 (precisión por defecto reportada); otras precisiones por SoC no detalladas |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | APLUX Model Farm License (license_name: aplux-model-farm; license: other) |
| Formato de pesos | Binarios de contexto Qualcomm (`model.bin`) y `model.json` por SoC y precisión |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el número de parámetros ni el proceso de entrenamiento en la documentación proporcionada. El nombre y la tarea (depth-estimation con entradas left/right y salida disparity) corresponden a la familia de redes estéreo basadas en StereoNet, que típicamente emplean un extractor de características compartido, una etapa de coste y refinamiento jerárquico, pero el autor no publica detalles de capas, tokens de entrenamiento ni datasets.

Lo que sí está documentado es el pipeline de conversión y despliegue: los recursos se organizan en `targets/<SoC>/` con un `model.json` que declara la precisión por defecto y las rutas de variantes, y binarios de contexto Qualcomm (`model.bin`). El paquete incluye preprocesado, postprocesado, runner y un proyecto exportable desde la plataforma Agora. No se menciona RLHF, DPO ni innovaciones de decodificación, lo cual es coherente con un modelo de visión puro.

## Capacidades

- Estimación de disparidad estéreo a partir de un par de imágenes izquierda y derecha previamente rectificadas.
- Salida de mapa de disparidad por píxel y una imagen coloreada (visualización de profundidad).
- Salida adicional en formato JSON (`out`) según la definición de entradas y salidas de la model card.
- Ejecución optimizada en hardware Qualcomm QCS8550 mediante binarios de contexto QNN.
- Integración en flujos Agora: despliegue guiado, exportación de proyectos y medición en placa real.
- Prueba en línea sin hardware disponible a través de la plataforma Agora.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento.

## Casos de uso

- Robótica móvil y AGV en el borde: el modelo entrega disparidad por píxel a partir del par estéreo de la cámara y permite construir mapas de profundidad locales para evitación de obstáculos, con una latencia medida de 500,1 ms en QCS8550.
- Drones y cámaras inteligentes con SoC Qualcomm: al distribuirse como binario QNN para QCS8550, se integra en pipelines de visión embebida donde no hay GPU de servidor.
- Inspección industrial con cámaras estéreo calibradas: la salida de disparidad y la imagen coloreada facilitan la medición de distancias relativas en líneas de montaje.
- Realidad aumentada y captura 3D en dispositivos: la disparidad por píxel sirve como entrada para reconstrucción de nubes de puntos o efectos de profundidad.
- Prototipado rápido sin hardware: la demo en línea de Agora permite validar el comportamiento del modelo antes de comprar la placa.
- Evaluación comparativa de precisión y latencia en AIoT: el formato de recursos por SoC y precisión permite medir el mismo modelo en distintas configuraciones de hardware.
- Segmentación por profundidad en vehículos autónomos de baja velocidad: el par estéreo rectificado es un requisito habitual en plataformas de percepción embebida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (por ejemplo, EPE o métricas sobre KITTI/Scene Flow) en la información disponible. El único dato de rendimiento es la latencia medida en placa:

| SoC · placa | Precision | Latencia medida (Agora) |
|---|---|---|
| QCS8550 · Rhino Pi X1 | FP16 | 500,1 ms |

## Requisitos de hardware

- VRAM estimada: no disponible (no se publican parámetros ni tamaño de los binarios; el repo figura con 0,0 GB).
- Hardware objetivo documentado: SoC Qualcomm QCS8550 sobre placa Rhino Pi X1 (犀牛派 X1).
- GPU de escritorio (A100, H100, RTX 4090): no soportadas de forma nativa; los recursos son binarios de contexto QNN para Qualcomm.
- Compatibilidad con GPU de consumo: no disponible; el despliegue está orientado a aceleradores Qualcomm.
- Opciones de despliegue: runner de Agora y binarios QNN por SoC; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia: 500,1 ms en QCS8550 con FP16 (precisión por defecto). Throughput no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de calidad que permitan una comparación rigurosa con otras redes estéreo (por ejemplo, variantes de StereoNet, RAFT-Stereo o CREStereo).

## Limitaciones y advertencias

- Requiere imágenes izquierda y derecha independientes y ya rectificadas; sin rectificación previa la disparidad no es válida.
- Solo se documenta soporte para QCS8550; otros SoC Qualcomm u otras plataformas no están confirmados en la información disponible.
- No se publican parámetros, arquitectura interna ni métricas de calidad, lo que impide estimar precisión fuera del hardware medido.
- Licencia propietaria (APLUX Model Farm License) sobre un modelo fuente cuyos términos originales no se detallan: es imprescindible revisar `LICENSE_MODEL_FARM.pdf` y `NOTICE.md` antes de cualquier uso comercial.
- Riesgo de sesgos y alucinaciones no aplica en el sentido lingüístico, pero sí existe riesgo de disparidades erróneas en escenas con superficies sin textura, reflexiones u oclusiones; el autor no documenta estos casos.
- El repositorio figura con 0,0 GB y 0 descargas, lo que sugiere que los pesos pueden no estar alojados en el repo o que el paquete es mínimo; conviene verificar la integridad con `SHA256SUMS`.
- No hay información sobre idiomas, contexto ni capacidades de lenguaje porque no es un modelo de ese tipo; no debe evaluarse con criterios de LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/StereoNet
- Demo en línea (Agora): https://mega.aidlux.com/models/stereonet
- Plataforma Agora: https://mega.aidlux.com
- Licencia del modelo: https://huggingface.co/APLUX-Agora/StereoNet/blob/main/LICENSE_MODEL_FARM.pdf
