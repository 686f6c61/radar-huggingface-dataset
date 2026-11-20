# anguoyang/segformer-base-qcs6490

## Resumen

SegFormer Base es un modelo de segmentación semántica basado en transformer, originalmente desarrollado por NVIDIA, que en esta ficha aparece en su variante medida de forma independiente sobre el SoC Qualcomm QCS6490 (kit Dragonwing RB3 Gen 2). El repositorio `anguoyang/segformer-base-qcs6490` no publica pesos ni artefactos compilados: es una tarjeta de medición que documenta el rendimiento del modelo bajo un protocolo uniforme (ONNX en fp32, compilación por defecto de AI Hub, perfil de grafo único) para servir como punto de referencia frente a las variantes cuantizadas ya listadas en el `perf.yaml` de upstream.

La relevancia de esta entrada es de naturaleza empírica y de evaluación de despliegue en el borde: aporta un dato concreto de latencia (97,6 ms por imagen de 512×512) sobre hardware embebido Qualcomm, medido con el runtime QNN. No aporta información sobre arquitectura interna, datos de entrenamiento, licencia del modelo original más allá de mencionar Apache-2.0 upstream, ni capacidades más allá de la segmentación semántica de 150 clases.

Conviene subrayar que el modelo subyacente es SegFormer Base (segmentación semántica, 150 clases), mientras que el contenido del repositorio es una medición de terceros. Cualquier evaluación de calidad del modelo debe remitirse a la documentación original de SegFormer; esta ficha describe lo que el repositorio efectivamente contiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer (transformer de segmentación semántica); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | no disponible (el ONNX exportado ocupa 15.173.068 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada 1×3×512×512) |
| Tipos de cuantizacion | la medición usa fp32 ONNX sin cuantización explícita; upstream lista variantes cuantizadas en `perf.yaml` 0.66.0 |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (licencia upstream del modelo); la tarjeta publica solo números y método, sin pesos |
| Formato de pesos | no se publican pesos; el artefacto medido es ONNX exportado desde `qai-hub-models` 0.66.0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de identificarlo como SegFormer Base para segmentación semántica con 150 clases de salida. SegFormer es una familia de transformers jerárquicos con decoder ligero, pero esta ficha no puede confirmar detalles de capas, atención ni composición del dataset de entrenamiento a partir de la información proporcionada.

Lo que sí documenta el repositorio es el procedimiento de medición: exportación a ONNX desde la definición `segformer_base` de `qai-hub-models` 0.66.0, compilación con opciones por defecto de Qualcomm AI Hub (sin cuantización explícita) y perfilado de grafo único mediante `submit_inference_job(..., profile=True)`. El número reportado es `execution_summary.estimated_inference_time`, una estimación por grafo y no una latencia extremo a extremo de aplicación. Los identificadores de trabajo son `j578qmvqp` (compilación) y `j5mlj7vyg` (perfil).

## Capacidades

- Segmentación semántica densa con 150 clases de salida (forma de salida 1×150×128×128 para entrada 512×512).
- Procesamiento de imágenes RGB de 512×512 píxeles.
- Ejecución en hardware Qualcomm QCS6490 mediante el runtime QNN.
- No se documentan capacidades de generación de texto, código, matemáticas, tool calling, agentes ni multimodalidad de lenguaje.
- No se documentan capacidades multilingües.

## Casos de uso

- Segmentación semántica en el borde: el modelo puede ejecutarse en el kit Dragonwing RB3 Gen 2 (QCS6490) con una latencia estimada de 97,6 ms por imagen de 512×512, adecuada para aplicaciones de visión embebida con requisitos de tiempo real moderados.
- Referencia de rendimiento para cuantización: sirve como punto de comparación fp32 frente a las variantes cuantizadas de SegFormer Base listadas en `perf.yaml`, permitiendo cuantificar la ganancia de las versiones INT8/INT16 en el mismo SoC.
- Validación de pipelines de despliegue: útil para verificar que una cadena de exportación ONNX → compilación AI Hub → perfil QNN produce resultados coherentes antes de pasar a producción.
- Selección de hardware para visión embebida: el dato de latencia permite estimar si el QCS6490 cubre los requisitos de un caso de segmentación (por ejemplo, vehículos autónomos ligeros, robótica de bajo consumo o inspección industrial) frente a alternativas.
- Reproducibilidad de benchmarks: al documentar jobs, fecha y método, permite a otros equipos replicar la medición y auditar la comparabilidad entre modelos del mismo barrido.
- Evaluación comparativa entre modelos de segmentación: dentro del conjunto `qcs-model-zoo` (28 modelos, 14 categorías), esta entrada aporta el punto de referencia de SegFormer Base para decisiones de arquitectura en despliegues Qualcomm.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 97,6 ms (97.599 µs) |
| Entrada | 1 × 3 × 512 × 512 |
| Salida | logits de clase 1 × 150 × 128 × 128 |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precisión | fp32 ONNX, compilación por defecto de AI Hub (sin cuantización explícita) |
| Fecha de medición | 2026-11-20 |

No se han publicado resultados de benchmarks de calidad (mIoU, precisión por clase, etc.) en la información disponible. El único dato de rendimiento es la latencia de inferencia anterior, que corresponde a una estimación por grafo y no a latencia extremo a extremo.

## Requisitos de hardware

- Hardware objetivo medido: Qualcomm QCS6490 en el kit Dragonwing RB3 Gen 2 Vision Kit.
- Runtime: QNN (Qualcomm Neural Network), a través de Qualcomm AI Hub.
- Precisión medida: fp32 ONNX; no se reportan requisitos de VRAM (el destino es un SoC embebido, no una GPU de escritorio).
- No se dispone de datos de VRAM, GPU recomendadas, latencia en GPU de consumo ni throughput para este repositorio.
- Opciones de despliegue documentadas: exportación ONNX desde `qai-hub-models` y compilación/perfilado vía Qualcomm AI Hub; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión embebido en este contexto).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SegFormer Base (esta medición, fp32) | no disponible | 512×512 | 97,6 ms en QCS6490 (QNN) | Apache-2.0 (upstream) | Solo números y método; sin pesos |
| Variantes cuantizadas de SegFormer Base en `perf.yaml` 0.66.0 | no disponible | no disponible | entradas RB3 en `perf.yaml`; no comparables directamente según el autor | Apache-2.0 (upstream) | Listadas en `perf.yaml` upstream |
| Otros modelos del barrido `qcs-model-zoo` (28 modelos, 14 categorías) | varía | varía | medidos con el mismo arnés uniforme | varía | Números y método en el repositorio del barrido |

No se dispone de datos suficientes para comparar con alternativas de segmentación fuera del conjunto medido por el autor.

## Limitaciones y advertencias

- El repositorio no publica pesos ni artefactos compilados: es una tarjeta de medición, no un modelo distribuible.
- El dato de latencia es una estimación por grafo (`estimated_inference_time`), no una latencia extremo a extremo de aplicación; no debe usarse como métrica de producción sin validación adicional.
- El autor advierte explícitamente que la medición fp32 no es directamente comparable con las entradas cuantizadas de `perf.yaml`.
- No se documentan sesgos, tasas de alucinación ni limitaciones de idioma; al ser un modelo de visión, el riesgo relevante es el sesgo del dataset de entrenamiento original de SegFormer, no descrito aquí.
- No se dispone de información sobre restricciones adicionales de licencia para uso comercial más allá de la mención a Apache-2.0 upstream; conviene verificar la licencia del modelo original antes de un uso comercial.
- No hay datos de calidad (mIoU, precisión) que permitan evaluar la idoneidad del modelo para una tarea concreta.
- La fecha de creación del repositorio (2026-11-19) y la de medición (2026-11-20) figuran en la información proporcionada; verificar su coherencia con el calendario real antes de citarlas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anguoyang/segformer-base-qcs6490
- Colección de mediciones `qcs-model-zoo`: https://github.com/anguoyang/qcs-model-zoo
- Seguimiento del barrido `qcs-bench`: https://github.com/anguoyang/qcs-bench
