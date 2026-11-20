# anguoyang/posenet-mobilenet-qcs6490

## Resumen

PoseNet MobileNet es un modelo de estimacion de pose humana que combina una red troncal MobileNet con una cabeza de prediccion tipo PoseNet, encargada de generar mapas de calor (heatmaps) y campos de desplazamiento (offsets) para localizar 17 puntos clave del cuerpo. El modelo aqui documentado no es una publicacion de pesos originales, sino una ficha de medicion independiente publicada por el usuario anguoyang en Hugging Face, que recoge el rendimiento del modelo en el hardware Qualcomm QCS6490 (placa Dragonwing RB3 Gen 2 Vision Kit) bajo un protocolo uniforme en precision fp32.

La relevancia de esta ficha es acotada pero practica: aporta un punto de referencia fp32 medido de forma reproducible (23,0 ms de inferencia estimada por grafo) sobre un SoC orientado a vision en el borde, util para quien necesite comparar variantes cuantizadas del mismo modelo o planificar despliegues en dispositivos embebidos. La model card no contiene informacion sobre arquitectura detallada, datos de entrenamiento, licencia del modelo en si (aunque cita Apache-2.0 upstream) ni capacidades mas alla de la estimacion de pose.

No se dispone de datos sobre parametros totales, longitud de contexto (no aplica a un modelo de vision), idiomas ni formatos de pesos publicados. Toda la informacion tecnica disponible proviene de la model card y se limita a la medicion de latencia y a la definicion de entradas y salidas del grafo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNet (backbone) + cabeza PoseNet (heatmaps + offsets); no se detalla la variante concreta de MobileNet |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | fp32 medido; la model card menciona variantes cuantizadas upstream en `perf.yaml` (0.66.0) pero no detalla los tipos |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 segun la model card (upstream); la licencia de los pesos publicados no se especifica |
| Formato de pesos | no se publican pesos; la medicion usa ONNX fp32 exportado desde `qai-hub-models` 0.66.0 (13.280.141 bytes) |

## Arquitectura y entrenamiento

La model card describe un modelo de estimacion de pose con salida de 17 mapas de calor (tensor 1 x 17 x 33 x 17) y 34 canales de offsets (1 x 34 x 33 x 17) a partir de una entrada de imagen de 1 x 3 x 513 x 257. El backbone es MobileNet y la cabeza sigue el esquema PoseNet, pero no se especifica la variante exacta de MobileNet, el numero de capas, la resolucion de entrenamiento ni el dataset utilizado. Tampoco se documentan tecnicas de aumento de datos, funciones de perdida ni procesos de ajuste fino.

No hay informacion sobre el numero de tokens de entrenamiento (no aplica), composicion del dataset, RLHF/DPO ni innovaciones tecnicas como atencion lineal o decodificacion especulativa. La unica innovacion relevante documentada es metodologica: la medicion se realiza mediante un perfil de grafo unico con la API de Qualcomm AI Hub (`submit_inference_job(..., profile=True)`), tomando `execution_summary.estimated_inference_time` como metrica, dentro de un barrido nocturno de 28 modelos y 14 categorias con un arnes uniforme.

## Capacidades

- Estimacion de pose humana con 17 puntos clave (esqueleto completo tipo COCO).
- Salida dual: heatmaps de confianza por keypoint y offsets para refinamiento de coordenadas.
- Inferencia en dispositivos de borde con aceleracion QNN sobre el SoC QCS6490.
- Procesamiento de imagenes de resolucion 513 x 257 (formato de entrada fijo del grafo).
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision general, tool calling, agentes ni multilingue.
- No se documenta modo de razonamiento (thinking) ni capacidades de audio.

## Casos de uso

- Analisis de postura en tiempo real en dispositivos empotrados: con 23,0 ms por inferencia estimada en QCS6490, el modelo permite procesar aproximadamente 43 fotogramas por segundo en el propio dispositivo, adecuado para aplicaciones de monitorizacion postural sin enviar video a la nube.
- Seguridad laboral y ergonomia: deteccion de posturas de riesgo en entornos industriales mediante camaras conectadas a placas RB3 Gen 2, aprovechando la aceleracion QNN y la baja latencia para alertas inmediatas.
- Deporte y fitness: analisis de movimiento de atletas en dispositivos portatiles o quioscos, extrayendo los 17 keypoints para calcular angulos articulares y detectar desviaciones de tecnica.
- Robotica e interaccion humano-robot: seguimiento del esqueleto de operarios en entornos colaborativos, usando los offsets para refinar la posicion de las articulaciones y evitar colisiones.
- Videovigilancia con privacidad: procesamiento local de video para detectar caidas o comportamientos anomalos sin transmitir imagenes identificables, al ejecutarse integramente en el dispositivo de borde.
- Benchmarking y seleccion de hardware: uso de la medicion fp32 como referencia para comparar variantes cuantizadas del mismo modelo o evaluar el QCS6490 frente a otros SoC en tareas de vision, dado que la ficha documenta el metodo de forma reproducible con IDs de trabajo (`j5qdjn6og` para compilacion, `jglqjd4mp` para perfilado).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado (QCS6490, QNN, fp32 ONNX) | 23,0 ms (22.975 µs) |
| Entrada | 1 x 3 x 513 x 257 |
| Salida | 17 heatmaps (1 x 17 x 33 x 17) + offsets (1 x 34 x 33 x 17) |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precision | fp32 ONNX, compilacion por defecto de AI Hub (sin cuantizacion explicita) |
| Fecha de medicion | 2026-11-20 |

No se han publicado resultados de benchmarks de precision (mAP, PCK, OKS) en la informacion disponible. La model card solo aporta latencia estimada por grafo, no latencia extremo a extremo de aplicacion.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo se ejecuta en el SoC QCS6490 con memoria unificada, no en GPU dedicada.
- GPU recomendadas: no aplica para el despliegue medido; el hardware objetivo es el Qualcomm QCS6490 (Dragonwing RB3 Gen 2 Vision Kit) con aceleracion QNN.
- Cabe en GPU consumer: no se documenta; al ser un modelo de vision de ~13 MB en ONNX fp32, es plausible que quepa en cualquier GPU consumer, pero no hay mediciones publicadas.
- Opciones de despliegue: Qualcomm AI Hub (compilacion y perfilado), runtime QNN en el dispositivo; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: 23,0 ms por inferencia en QCS6490 con fp32 ONNX y compilacion por defecto; equivale a ~43 inferencias por segundo en el mejor caso, sin solapamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PoseNet MobileNet (este, fp32 en QCS6490) | no disponible | 1 x 3 x 513 x 257 | no aplica | 23,0 ms en QCS6490 | Apache-2.0 (upstream) | Solo medicion; sin pesos publicados en esta ficha |
| Variantes cuantizadas de PoseNet MobileNet (upstream `perf.yaml` 0.66.0) | no disponible | no disponible | no aplica | entradas RB3 en `perf.yaml`; valores no disponibles | Apache-2.0 | Referenciadas en `perf.yaml` |
| Otros modelos del barrido `qcs-model-zoo` (28 modelos, 14 categorias) | no disponible | no disponible | no aplica | medidos con el mismo arnes; valores no disponibles en esta ficha | no disponible | Repositorio `qcs-model-zoo` |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas de estimacion de pose (por ejemplo, variantes de MediaPipe o YOLO-Pose) en el mismo hardware.

## Limitaciones y advertencias

- La ficha no publica pesos ni artefactos compilados; solo contiene numeros medidos y metodologia, por lo que no es directamente desplegable desde este repositorio.
- La medicion es una estimacion por grafo (`estimated_inference_time`), no una latencia extremo a extremo de aplicacion; el rendimiento real puede diferir.
- El resultado fp32 no es directamente comparable con las entradas cuantizadas de `perf.yaml` (0.66.0), tal como advierte la propia model card.
- No se documentan sesgos, tasas de error de keypoints ni comportamiento en condiciones de oclusion, iluminacion adversa o personas multiples.
- No hay informacion sobre licencia de los pesos publicados; la licencia Apache-2.0 citada corresponde al modelo upstream, no necesariamente a esta ficha.
- No se documentan limitaciones de idioma (no aplica) ni de contexto (no aplica), pero si la ausencia de datos de precision, lo que impide evaluar su idoneidad para produccion sin pruebas adicionales.
- El modelo esta atado a una resolucion de entrada fija (513 x 257) y a un runtime concreto (QNN en QCS6490); portarlo a otro hardware requiere recompilacion y revalidacion.

## Enlaces

- Hugging Face: https://huggingface.co/anguoyang/posenet-mobilenet-qcs6490
- Repositorio de la coleccion medida: https://github.com/anguoyang/qcs-model-zoo
- Repositorio del barrido completo: https://github.com/anguoyang/qcs-bench
