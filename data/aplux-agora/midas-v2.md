# APLUX-Agora/Midas-v2

## Resumen
Midas-v2 es un modelo de estimación de profundidad relativa a partir de una única imagen, publicado por APLUX-Agora dentro de su plataforma Agora para despliegue en hardware Qualcomm. El repositorio no contiene los pesos originales en formato de entrenamiento, sino artefactos convertidos y empaquetados por APLUX Model Farm para ejecutarse sobre las NPU/Hexagon de SoCs Qualcomm concretos (QCS6490 y QCS8550), con precisión FP16, W8A16 y W8A8. La tarea declarada es `depth-estimation`: recibe una imagen y devuelve un mapa de profundidad coloreado.

El interés del paquete es fundamentalmente de despliegue en el borde (AIoT): ofrece binarios QNN listos para placas reales, con latencias medidas por el propio autor (6,6 ms en QCS6490 y 2,9 ms en QCS8550 en precisión por defecto). No se documentan en la información disponible ni la arquitectura interna, ni el número de parámetros, ni el dataset de entrenamiento del modelo original; el repositorio ocupa 0,1 GB y no incluye una model card técnica al uso.

La licencia es un punto crítico: los recursos convertidos se distribuyen bajo APLUX Model Farm License (un PDF aparte), mientras que los términos del modelo fuente se remiten a "the original model's terms" sin especificar cuáles. Cualquier uso comercial requiere revisar ambos documentos antes de integrar el modelo en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de estimación de profundidad; artefactos QNN para NPU Qualcomm) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen única; resolución no disponible) |
| Tipos de cuantizacion | FP16, W8A16, W8A8 (según SoC) |
| Idiomas soportados | no disponible (tarea de visión, sin procesamiento de lenguaje) |
| Licencia | APLUX Model Farm License para los recursos convertidos; términos del modelo fuente no especificados |
| Formato de pesos | binarios QNN (`model.bin`), empaquetados por SoC en `targets/<SoC>/` con `model.json` de configuración |

## Arquitectura y entrenamiento
No se dispone de información sobre la arquitectura del modelo original (tipo de backbone, resolución de entrada, función de pérdida ni estrategia de escalado de profundidad). La model card solo declara la tarea (estimación de profundidad relativa desde una imagen) y el pipeline de Hugging Face asociado (`depth-estimation`).

Lo que sí está documentado es el proceso de conversión y empaquetado: APLUX Model Farm genera artefactos ejecutables sobre Qualcomm AI Engine Direct (QNN), con un directorio por SoC objetivo y, dentro de cada uno, un `model.json` que indica la precisión por defecto y las rutas de cada variante, además de binarios `model.bin` (o paquetes multi-fichero tal como se publicaron). El repositorio incluye `NOTICE.md` y `SHA256SUMS` para verificación de integridad. No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF/DPO (no aplica a una tarea de regresión densa como esta).

## Capacidades
- Estimación de profundidad relativa a partir de una única imagen RGB.
- Salida de mapa de profundidad coloreado (imagen), según el contrato de E/S declarado: `image` como entrada, `depth` como salida.
- Ejecución optimizada en NPU Qualcomm mediante binarios QNN precompilados.
- Variantes de precisión seleccionables por SoC: FP16, W8A16 y W8A8.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües (no aplica).
- No se documentan capacidades de vídeo, profundidad métrica absoluta ni segmentación.

## Casos de uso
- Robótica móvil de bajo consumo: integración del mapa de profundidad en bucles de evitación de obstáculos sobre placas QCS6490/QCS8550, aprovechando latencias de 6,6 ms y 2,9 ms respectivamente para operar a frecuencia de cámara sin cargar la CPU.
- Drones y AGV con presupuesto térmico y energético ajustado: al ejecutarse en la NPU Hexagon con cuantización W8A8, el consumo y la disipación son menores que en una GPU o CPU embebida, lo que permite carcasas sin ventilación.
- Realidad aumentada en dispositivos AIoT: uso del mapa de profundidad para oclusión aproximada y colocación de objetos virtuales en tiempo real en gafas o visores con SoC Qualcomm.
- Inspección industrial y detección de obstáculos en cintas transportadoras: estimación de profundidad por fotograma para segmentar objetos que sobresalen del plano de trabajo, con despliegue en el propio equipo de visión.
- Prototipado rápido sin hardware: la plataforma Agora permite probar el modelo online (https://mega.aidlux.com/models/midas-v2) antes de comprar la placa, lo que reduce el ciclo de evaluación de un despliegue embebido.
- Generación de mapas de profundidad para postproceso de vídeo o pipelines de dataset: uso del modelo como etiquetador automático de profundidad relativa en la creación de datos de entrenamiento para otros modelos de visión.
- Integración en flujos de Agora: exportación de proyectos y workflows que consumen el modelo, con guía de despliegue ("部署指南") y procesamiento pre/post incluido en el paquete.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta latencias de inferencia medidas en placas reales:

| SoC · placa | Precisiones | Latencia (precisión por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 6,6 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16, W8A8 | 2,9 ms |

No se indican métricas de calidad de profundidad (AbsRel, RMSE, δ1) ni comparaciones con el modelo original sin cuantizar.

## Requisitos de hardware
- VRAM: no aplica; el modelo se ejecuta en NPU Qualcomm, no en GPU convencional. El repositorio completo ocupa 0,1 GB.
- SoCs soportados: QCS6490 (placa Rhino Pi A1) y QCS8550 (placa Rhino Pi X1), ambos con acelerador Hexagon.
- GPU de escritorio: no se documenta soporte para A100, H100 ni RTX 4090; el paquete está orientado exclusivamente a QNN.
- Despliegue: SDK Qualcomm AI Engine Direct (QNN) mediante los binarios incluidos; descarga selectiva por SoC con `hf download --include "targets/<SoC>/*"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a esta tarea).
- Throughput estimado: a partir de las latencias medidas, en torno a 150 FPS en QCS6490 y 345 FPS en QCS8550 en precisión por defecto (cálculo derivado de 1/latencia, sin incluir pre/postproceso).
- Procesamiento pre/post: incluido en el paquete y en la guía de despliegue de Agora; el coste no se desglosa.

## Comparativa con modelos similares
No se dispone de datos de parámetros, contexto ni métricas de calidad del modelo original, por lo que no es posible una comparación cuantitativa rigurosa con alternativas como MiDaS original, Depth Anything o DPT. La comparación disponible es de tipo de artefacto:

| Modelo | Formato | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|
| APLUX-Agora/Midas-v2 | Binarios QNN por SoC | NPU Qualcomm QCS6490/QCS8550 | APLUX Model Farm License | Hugging Face, 0 descargas |
| MiDaS original | Pesos PyTorch | GPU/CPU genérica | no disponible en esta ficha | no disponible en esta ficha |
| Depth Anything | Pesos PyTorch | GPU/CPU genérica | no disponible en esta ficha | no disponible en esta ficha |

## Limitaciones y advertencias
- Solo produce profundidad relativa, no métrica absoluta; no es apto para medición de distancias sin calibración adicional.
- No hay información sobre sesgos del modelo original ni sobre su comportamiento en escenas nocturnas, con poca textura o con objetos reflectantes.
- Riesgo de alucinación de estructura en regiones ambiguas: habitual en estimadores monofocales; no se documenta mitigación.
- La licencia es un riesgo relevante: los recursos convertidos usan APLUX Model Farm License y los términos del modelo fuente no se especifican, por lo que el uso comercial exige revisar `LICENSE_MODEL_FARM.pdf` y aclarar la procedencia.
- El paquete está acoplado a dos SoCs concretos; no hay garantía de portabilidad a otros aceleradores sin reconversión.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-09): madurez y soporte de la comunidad no verificables.
- No se documentan idiomas, resolución de entrada ni límites de tamaño de imagen.
- Verificar integridad con `SHA256SUMS` y revisar `NOTICE.md` antes de desplegar.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/Midas-v2
- Demo online en Agora: https://mega.aidlux.com/models/midas-v2
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/Midas-v2/blob/main/LICENSE_MODEL_FARM.pdf
