# anguoyang/mobilesam-qcs6490

## Resumen

MobileSAM (Segment Anything Model móbil) es una variante ligera del modelo SAM de Meta AI, disenada para segmentacion de imagenes en dispositivos con recursos limitados. Este repositorio concreto, publicado por el usuario anguoyang, no contiene pesos del modelo, sino la primera medicion publica del codificador de imagenes de MobileSAM sobre el chip Qualcomm QCS6490, integrado en el kit Dragonwing RB3 Gen 2 Vision Kit.

El modelo resuelve el problema de la segmentacion de imagenes de proposito general (segmentacion promptable) en el borde, donde SAM original resulta demasiado pesado. MobileSAM reduce el codificador de imagenes a un transformer ligero (TinyViT) manteniendo el decodificador de mascaras de SAM, lo que permite obtener embeddings de imagen de 1 x 256 x 64 x 64 a partir de entradas de 1 x 3 x 1024 x 1024.

La relevancia de esta publicacion es metrologica: aporta un punto de referencia (benchmark) reproducible de latencia de inferencia en hardware de borde Qualcomm, con un tiempo estimado de 1.482,2 ms por grafo en precision fp32 mediante el runtime QNN. No se trata de un modelo entrenado por el autor ni de una distribucion de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileSAM: codificador de imagenes TinyViT + decodificador de mascaras tipo SAM (solo se mide el codificador) |
| Parametros totales | no disponible (el ONNX exportado ocupa 28.017.096 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | fp32 (ONNX); el autor indica que no se aplico cuantizacion explicita (opciones por defecto de AI Hub) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (licencia del modelo upstream); la tarjeta solo publica mediciones, sin pesos |
| Formato de pesos | ONNX exportado desde la definicion `mobilesam` de `qai-hub-models` 0.66.0; no se distribuyen pesos ni artefactos compilados |

## Arquitectura y entrenamiento

MobileSAM sustituye el pesado codificador de imagenes ViT-H de SAM por un TinyViT, manteniendo el decodificador de mascaras original. El resultado es un modelo de segmentacion promptable mucho mas ligero que SAM, adecuado para inferencia en el borde. En este repositorio solo se perfila el codificador de imagenes: entrada 1 x 3 x 1024 x 1024 y salida de embeddings de 1 x 256 x 64 x 64.

No se aportan datos sobre el entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) porque el autor no entrena el modelo: exporta la definicion existente de `qai-hub-models` 0.66.0 a ONNX y la compila y perfila con la API de Qualcomm AI Hub. La innovacion de esta publicacion es metodologica: un perfilado de grafo unico mediante `submit_inference_job(..., profile=True)`, tomando `execution_summary.estimated_inference_time`. Es una estimacion por grafo, no la latencia de una aplicacion de extremo a extremo.

## Capacidades

- Segmentacion de imagenes promptable (la del modelo MobileSAM completo); este repositorio solo mide el codificador de imagenes.
- Generacion de embeddings de imagen de 1 x 256 x 64 x 64 a partir de entradas de 1024 x 1024.
- No incluye generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingues (modelo puramente visual).
- No incluye modo thinking, vision multimodal ni audio; es un codificador visual de un solo proposito.

## Casos de uso

- Segmentacion en el borde: desplegar MobileSAM en el QCS6490 (Dragonwing RB3 Gen 2) para separar objetos en imagenes de camara, usando la medicion de 1.482,2 ms por codificador como referencia de viabilidad.
- Planificacion de capacidad en hardware Qualcomm: usar el dato de latencia para decidir si el codificador cabe en el presupuesto temporal de una aplicacion de vision en tiempo casi real.
- Seleccion de hardware: comparar el QCS6490 con otras plataformas antes de comprometer un diseno de producto basado en segmentacion promptable.
- Validacion de pipelines QNN: servir como caso de prueba reproducible (IDs de job `jgkw97yog` y `j5qxme2mp`) para verificar que un flujo de exportacion ONNX y compilacion AI Hub funciona correctamente.
- Investigacion de eficiencia en el borde: punto de referencia para estudiar el coste del codificador TinyViT en precision fp32 frente a alternativas cuantizadas.
- Reproducibilidad de benchmarks: integrar la medicion en barridos comparativos (qcs-model-zoo, qcs-bench) para contrastar latencias entre modelos de vision en el mismo hardware.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 1.482,2 ms (1.482.195 µs) |
| Entrada | 1 x 3 x 1024 x 1024 |
| Salida | embeddings de imagen 1 x 256 x 64 x 64 |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precision | fp32 ONNX, opciones de compilacion por defecto de AI Hub (sin cuantizacion explicita) |
| Fecha de medicion | 2026-11-27 |
| IDs de job | compilacion `jgkw97yog`, perfilado `j5qxme2mp` |

No se han publicado en la informacion disponible resultados de benchmarks de calidad (mIoU, precision de mascaras) ni comparaciones con otros modelos en esta tarjeta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el modelo se mide en un SoC de borde, no en GPU de escritorio).
- GPU recomendadas: no aplica; el objetivo es el SoC Qualcomm QCS6490 con runtime QNN.
- Cabe en GPU de consumo: no disponible (no se han publicado mediciones en GPU de consumo).
- Opciones de despliegue: Qualcomm AI Hub (compilacion y perfilado), runtime QNN, exportacion ONNX desde `qai-hub-models` 0.66.0.
- Latencia y throughput estimados: 1.482,2 ms por inferencia del codificador en fp32 sobre QCS6490; es una estimacion por grafo, no una latencia de aplicacion completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MobileSAM (codificador, esta medicion) | no disponible (ONNX 28.017.096 bytes) | no aplica | 1.482,2 ms en QCS6490 (fp32, QNN) | Apache-2.0 (upstream) | Solo mediciones; sin pesos en este repo |
| SAM (ViT-H) | no disponible | no aplica | no disponible en QCS6490 | Apache-2.0 | Pesos publicos en Meta AI |
| MobileSAM original | no disponible | no aplica | no disponible en QCS6490 | Apache-2.0 | Pesos publicos en el repositorio upstream |

No se dispone de datos comparativos de rendimiento en el mismo hardware para los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio no contiene pesos ni artefactos compilados; solo publica numeros y metodo. No es directamente utilizable para inferencia.
- El dato de 1.482,2 ms es una estimacion por grafo de un perfilado unico, no una latencia de aplicacion de extremo a extremo.
- La medicion se realizo en fp32 sin cuantizacion explicita; una version cuantizada podria ofrecer latencias distintas no reportadas aqui.
- No hay datos de calidad de segmentacion (mIoU u otras metricas) en esta tarjeta.
- No se especifican sesgos conocidos ni riesgos de alucinacion porque el modelo no genera texto; los sesgos del modelo subyacente dependerian de los datos de entrenamiento de MobileSAM, no documentados aqui.
- La licencia Apache-2.0 corresponde al modelo upstream; el autor no otorga licencia sobre pesos que no distribuye.
- Para uso comercial debe verificarse la licencia del modelo MobileSAM original y de los artefactos de Qualcomm AI Hub utilizados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anguoyang/mobilesam-qcs6490
- Coleccion de mediciones qcs-model-zoo: https://github.com/anguoyang/qcs-model-zoo
- Seguimiento del barrido qcs-bench: https://github.com/anguoyang/qcs-bench
- Definicion del modelo en qai-hub-models 0.66.0: no disponible como enlace directo en la informacion proporcionada
- Paper de MobileSAM: no disponible en la informacion proporcionada
