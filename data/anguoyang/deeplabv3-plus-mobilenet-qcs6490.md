# anguoyang/deeplabv3-plus-mobilenet-qcs6490

## Resumen

DeepLabV3+ MobileNet es un modelo de segmentación semántica que combina la arquitectura DeepLabV3+ (con su módulo de pirámide de contexto espacial, ASPP, y un decodificador ligero) con un backbone MobileNet. El repositorio `anguoyang/deeplabv3-plus-mobilenet-qcs6490` no publica pesos ni un modelo entrenado propio: es una ficha de medición independiente que documenta el rendimiento de la implementación de referencia de `qai-hub-models` (versión 0.66.0) sobre el SoC Qualcomm QCS6490, integrado en el kit Dragonwing RB3 Gen 2 Vision Kit.

El interés del artefacto es metodológico más que algorítmico. El autor mide la variante fp32 exportada a ONNX y compilada con las opciones por defecto de Qualcomm AI Hub, obteniendo un tiempo de inferencia estimado de 154,7 ms para una entrada de 1×3×520×520. La model card upstream de `perf.yaml` recoge cifras para variantes cuantizadas (por ejemplo, w8a8 en TFLite a 16,8 ms), de modo que esta medición aporta el punto de referencia en fp32 bajo un protocolo uniforme y no es directamente comparable con las entradas cuantizadas.

La relevancia actual radica en que forma parte de un barrido de 28 modelos y 14 categorías ejecutado con un mismo harness, lo que permite comparar latencias entre arquitecturas sobre hardware edge concreto. El autor documenta además un fallo de exportación corregido (entradas en formato NHWC en lugar de NCHW), un detalle práctico útil para quien replique el flujo con AI Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLabV3+ con backbone MobileNet (segmentación semántica) |
| Parametros totales | no disponible (el ONNX exportado ocupa 23.315.344 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 1×3×520×520) |
| Tipos de cuantizacion | fp32 en esta medición; existen variantes w8a8 TFLite referenciadas en `perf.yaml` upstream |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT (modelo upstream); esta ficha publica solo mediciones y método |
| Formato de pesos | ONNX exportado desde `qai-hub-models` 0.66.0; compilado con QNN. No se publican pesos ni artefactos compilados |

## Arquitectura y entrenamiento

DeepLabV3+ es una arquitectura de segmentación semántica encoder-decoder. El encoder aplica un backbone convolucional (aquí MobileNet, elegido por su coste computacional reducido) y un módulo ASPP (Atrous Spatial Pyramid Pooling) que captura contexto multi-escala mediante convoluciones dilatadas en paralelo. El decoder combina las características de bajo nivel del backbone con las de alto nivel del encoder para refinar los bordes de la máscara. La salida es un mapa de clases por píxel con tamaño espacial dinámico.

El repositorio no aporta información sobre el dataset de entrenamiento, el número de tokens (no aplica), ni procesos de RLHF/DPO. Se trata de la definición de modelo incluida en `qai-hub-models` 0.66.0, exportada a ONNX y compilada con las opciones por defecto de Qualcomm AI Hub (sin cuantización explícita). El autor documenta un detalle técnico relevante: el primer intento de exportación falló porque las entradas de muestra se suministraron en formato channel-last (NHWC); al solicitar channel-first (NCHW), la exportación se completó sin cambios adicionales.

## Capacidades

- Segmentación semántica densa: genera una máscara de clase por píxel para una imagen de entrada de 520×520.
- Salida con tamaño espacial dinámico, adaptable a la resolución efectiva procesada por el grafo.
- Ejecución en hardware edge Qualcomm mediante el runtime QNN.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo generativo.
- No dispone de capacidades multilingües, de visión general (VLM) ni de audio.
- Perfilado por grafo único a través de la API de Qualcomm AI Hub (`submit_inference_job(..., profile=True)`).

## Casos de uso

- Segmentación en dispositivos edge con QCS6490: el modelo se ejecuta vía QNN sobre el kit RB3 Gen 2 Vision Kit, adecuado para cámaras inteligentes y sistemas de visión embebidos donde no hay GPU dedicada.
- Referencia de latencia para selección de hardware: los 154,7 ms en fp32 permiten estimar el presupuesto temporal de un pipeline de segmentación antes de decidir si conviene pasar a una variante cuantizada (w8a8 a 16,8 ms según `perf.yaml`).
- Validación de pipelines de exportación ONNX con AI Hub: el caso documentado de NHWC frente a NCHW sirve como guía de depuración para quien exporte modelos de segmentación con `qai-hub-models`.
- Segmentación de escenas en robótica móvil: la máscara por píxel alimenta módulos de navegación o evitación de obstáculos en plataformas con SoC Qualcomm.
- Preprocesado para analítica de vídeo en el borde: separar regiones (suelo, cielo, personas) antes de enviar solo los recortes relevantes a un servidor, reduciendo ancho de banda.
- Benchmarking comparativo entre arquitecturas: al formar parte de un barrido uniforme de 28 modelos y 14 categorías, permite situar DeepLabV3+ MobileNet frente a otros modelos de visión bajo el mismo harness y dispositivo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 154,7 ms (154.726 µs) |
| Entrada | 1 × 3 × 520 × 520 |
| Salida | máscara de clase por píxel (tamaño espacial dinámico) |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precisión | fp32 ONNX, opciones de compilación por defecto de AI Hub |
| Fecha de medición | 2026-11-19 |
| IDs de job | compilación `jpr7rdm0g`, perfilado `jp2z1dqrp` |

La cifra corresponde a `execution_summary.estimated_inference_time` de un perfilado por grafo único, no a la latencia extremo a extremo de una aplicación. El autor advierte que no es directamente comparable con las entradas cuantizadas de `perf.yaml` (w8a8 TFLite a 16,8 ms). No se han publicado resultados de benchmarks de precisión (mIoU u otras métricas de segmentación) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en el acelerador NPU/Hexagon del QCS6490, no en GPU de escritorio.
- Dispositivo de referencia: Dragonwing RB3 Gen 2 Vision Kit con SoC Qualcomm QCS6490.
- GPU recomendadas: no disponible para el escenario edge; el runtime empleado es QNN, no CUDA.
- ¿Cabe en GPU de consumo? No disponible: no se han publicado mediciones con GPUs de consumo.
- Opciones de despliegue: Qualcomm AI Hub (compilación y perfilado), runtime QNN en el dispositivo; el ONNX exportado puede ejecutarse con otros runtimes, aunque no se documentan cifras.
- Latencia: 154,7 ms por inferencia en fp32 con el protocolo descrito; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Latencia en QCS6490 | Precisión | Licencia |
|---|---|---|---|---|---|
| DeepLabV3+ MobileNet (esta ficha) | DeepLabV3+ / MobileNet | 520×520 | 154,7 ms (fp32, ONNX/QNN) | fp32 | MIT |
| DeepLabV3+ MobileNet w8a8 (upstream `perf.yaml`) | DeepLabV3+ / MobileNet | no disponible | 16,8 ms (TFLite) | w8a8 | MIT |

No se dispone en la información proporcionada de mediciones de otros modelos de segmentación bajo el mismo protocolo, por lo que no es posible ampliar la comparativa con alternativas concretas.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni artefactos compilados: solo publica números medidos y el método. No es un modelo listo para descargar y usar.
- La cifra de 154,7 ms es una estimación de perfilado por grafo, no una latencia extremo a extremo de aplicación; incluye solo el grafo.
- No es comparable con las entradas cuantizadas de `perf.yaml` (w8a8 a 16,8 ms), que usan otro protocolo y precisión.
- No se han publicado métricas de calidad de segmentación (mIoU, precisión por clase), por lo que no puede evaluarse la fidelidad de las máscaras.
- El modelo está vinculado al hardware QCS6490 y al runtime QNN; el rendimiento en otras plataformas no está documentado.
- La licencia MIT corresponde al modelo upstream; conviene verificar los términos de `qai-hub-models` y de Qualcomm AI Hub para uso comercial de los artefactos compilados.
- Riesgo de sesgos y alucinación: no aplica en el sentido generativo, pero el modelo hereda los sesgos del dataset de entrenamiento original de DeepLabV3+, no documentado en esta ficha.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anguoyang/deeplabv3-plus-mobilenet-qcs6490
- Colección de mediciones: https://github.com/anguoyang/qcs-model-zoo
- Seguimiento del barrido completo: https://github.com/anguoyang/qcs-bench
