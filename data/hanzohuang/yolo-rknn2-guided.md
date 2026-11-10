# HanzoHuang/YOLO-RKNN2-Guided

## Resumen

YOLO-RKNN2-Guided es un repositorio de artefactos de inferencia, no un modelo entrenado desde cero. Contiene 68 exportaciones en formato RKNN (FP16 e INT8) derivadas de checkpoints oficiales de Ultralytics, optimizadas para los aceleradores NPU de Rockchip RK3576 y RK3588. El autor, HanzoHuang, ha realizado las conversiones siguiendo las recetas del Model Zoo de Rockchip y los forks de exportación de RKOPT, y publica tanto los binarios resultantes como los scripts, el entorno y las listas de calibración empleados.

El problema que resuelve es concreto: desplegar modelos de la familia YOLO (detección, OBB, pose y segmentación) sobre hardware Rockchip requiere un pipeline de conversión específico (ONNX intermedio, cuantización con RKNN Toolkit2 y calibración con datasets representativos) que no está cubierto por los checkpoints estándar de Ultralytics. Este repositorio empaqueta ese resultado para cuatro tareas y dos chips, con un manifiesto que enumera combinaciones y hashes SHA-256.

Es relevante para desarrolladores de edge computing que trabajan con placas RK3576/RK3588 (por ejemplo, SBCs y módulos de IA embebida) y necesitan artefactos listos para usar sin reproducir manualmente el proceso de conversión. No es un modelo de lenguaje ni un transformer generativo: es una colección de pesos YOLO cuantizados para NPU, con licencia AGPL-3.0 heredada de los pesos originales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes YOLO de Ultralytics (detect, obb, pose, segment) exportadas a RKNN |
| Parametros totales | no disponible (depende del checkpoint de origen; el repo no los desglosa) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no generativo) |
| Tipos de cuantizacion | FP16 e INT8 |
| Idiomas soportados | no disponible (no aplica; modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN (`model.rknn`) acompañado de `metadata.yaml` |

## Arquitectura y entrenamiento

Los modelos subyacentes son checkpoints oficiales de Ultralytics de la familia YOLO, con cabeceras específicas para detección de objetos, detección con cajas orientadas (OBB), estimación de pose y segmentación de instancias. El repositorio no entrena ningún modelo: la aportación es la conversión y cuantización. El pipeline pasa por los forks de exportación de RKOPT fijados en `source/exporters.json`, se ejecuta con un checkout fijado del Model Zoo de Rockchip y utiliza RKNN Toolkit2 para generar los grafos RKNN. Las listas de calibración provienen de los ejemplos del Model Zoo correspondientes a cada tarea.

La cuantización INT8 se realiza con calibración sobre dichas listas, lo que introduce una pérdida de precisión respecto a los pesos originales en FP32/FP16; el repositorio ofrece ambas variantes para permitir comparar exactitud y rendimiento en la NPU. El manifiesto `manifest.json` documenta las 68 combinaciones (tarea × checkpoint × chip × precisión) junto con sus hashes SHA-256, y `source/weights.json` registra las URL y hashes de los checkpoints de origen. La innovación técnica es, por tanto, de ingeniería de despliegue (reproducibilidad de la conversión y trazabilidad de artefactos), no de arquitectura de modelo.

## Capacidades

- Detección de objetos (tarea `detect`) en imágenes y vídeo sobre NPU Rockchip.
- Detección con cajas orientadas (`obb`), adecuada para imagery aérea y objetos rotados.
- Estimación de pose (`pose`) con keypoints sobre personas u objetos según el checkpoint.
- Segmentación de instancias (`segment`) con máscaras por objeto.
- Inferencia acelerada en NPU RK3576 y RK3588 en FP16 e INT8.
- Ejecución en edge sin dependencia de GPU dedicada ni de frameworks de servidor.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye modo thinking, visión generalista ni audio; las capacidades están acotadas a las tareas YOLO exportadas.

## Casos de uso

- Videovigilancia en edge: desplegar la variante `detect` INT8 en un RK3588 para detección de personas y vehículos en tiempo real dentro de una cámara IP, sin enviar vídeo a la nube y con consumo energético bajo.
- Inspección industrial: usar `segment` o `detect` sobre una línea de producción con RK3576 para localizar defectos o piezas, aprovechando la NPU para mantener latencia baja por frame.
- Análisis de imagery aérea: emplear la variante `obb` para detectar vehículos, barcos o edificios con orientación arbitraria en ortomosaicos y fotogramas de dron.
- Analítica deportiva o de seguridad: usar `pose` para extraer keypoints de personas en directo sobre una SBC Rockchip y alimentar métricas de movimiento o caídas.
- Robótica y AGV: integrar `detect` o `segment` en la percepción de un robot móvil con RK3588 para evitar obstáculos y reconocer objetos de manipulación.
- Prototipado rápido en hardware Rockchip: partir de los artefactos publicados y del manifiesto con hashes para validar una placa o un pipeline antes de invertir en una conversión propia.
- Reproducibilidad de despliegues: usar `source/` (scripts, entorno, calibración) para auditar o regenerar las exportaciones con las mismas revisiones fijadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de mAP, latencia ni throughput para las variantes FP16/INT8 en RK3576 o RK3588.

## Requisitos de hardware

- Hardware objetivo: NPU de Rockchip RK3576 y RK3588 (los tags y las rutas del repo lo confirman). No se indica soporte para otros chips.
- VRAM: no aplica; el modelo se ejecuta en NPU y memoria del sistema del SoC, no en GPU dedicada.
- GPU recomendadas: no aplica para inferencia; para la conversión se requiere el entorno de RKNN Toolkit2 descrito en `source/`, cuyos requisitos de GPU no se detallan.
- Cabe en hardware consumer: sí, en placas y SBCs con RK3576/RK3588; no está pensado para RTX 4090, A100 ni H100.
- Opciones de despliegue: runtime RKNN de Rockchip (RKNN Toolkit2 para conversión; runtime NPU para ejecución). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Hardware objetivo | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO-RKNN2-Guided (este repo) | RKNN FP16/INT8 | RK3576, RK3588 | detect, obb, pose, segment | AGPL-3.0 | 68 exportaciones publicadas |
| Checkpoints Ultralytics originales | PyTorch (.pt) | GPU/CPU genérica | detect, obb, pose, segment | AGPL-3.0 | PyPI y repositorio oficial |
| Exportaciones RKNN genéricas del Model Zoo de Rockchip | RKNN | Chips Rockchip | según ejemplo del zoo | según el zoo | Repositorio de Rockchip |
| Conversión propia con RKNN Toolkit2 | RKNN | Chips Rockchip | a elección | según pesos de origen | Requiere pipeline manual |

La comparativa se limita a alternativas de despliegue y formato, ya que no hay datos de rendimiento publicados para establecer una comparación cuantitativa con otros artefactos RKNN.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso en servicios de red puede obligar a liberar el código fuente del servicio; revisar implicaciones antes de un despliegue comercial.
- La cuantización INT8 introduce pérdida de precisión frente a los pesos originales; no hay métricas publicadas para cuantificar esa degradación.
- El repositorio no entrena ni ajusta modelos: la calidad final depende de los checkpoints de Ultralytics de origen y de la calibración elegida.
- Solo cubre NPUs RK3576 y RK3588; no es portable a otras plataformas sin reconversión.
- No es un modelo de lenguaje: no ofrece generación de texto, razonamiento, tool calling ni capacidades multilingües.
- Riesgo de sesgos y alucinaciones heredado de los datasets de entrenamiento de YOLO (por ejemplo, sesgos de clase y de dominio en detección de personas).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida; conviene verificar los hashes del manifiesto antes de usar los artefactos.
- Las fechas de creación y actualización registradas (2026) deben contrastarse con el estado real del repositorio antes de confiar en la vigencia de los checkpoints.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HanzoHuang/YOLO-RKNN2-Guided
- Manifiesto de combinaciones y hashes: https://huggingface.co/HanzoHuang/YOLO-RKNN2-Guided/blob/main/manifest.json
- Directorio de fuentes (scripts, entorno, calibración): https://huggingface.co/HanzoHuang/YOLO-RKNN2-Guided/tree/main/source
- Checkpoints de origen y hashes: https://huggingface.co/HanzoHuang/YOLO-RKNN2-Guided/blob/main/source/weights.json
- Forks de exportación fijados: https://huggingface.co/HanzoHuang/YOLO-RKNN2-Guided/blob/main/source/exporters.json
- Licencia: https://huggingface.co/HanzoHuang/YOLO-RKNN2-Guided/blob/main/LICENSE
- Ultralytics en PyPI: https://pypi.org/project/ultralytics/#history
- RKNN Toolkit2 (Rockchip): https://github.com/airockchip/rknn-toolkit2
