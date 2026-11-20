# anguoyang/real-esrgan-x4plus-qcs6490

## Resumen

Real-ESRGAN x4plus es un modelo de superresolución de imagen basado en GAN que escala imágenes de entrada por un factor de 4 (de 128×128 a 512×512 en la medición publicada). El repositorio `anguoyang/real-esrgan-x4plus-qcs6490` no contiene los pesos del modelo, sino un informe de medición independiente de su rendimiento en el hardware Qualcomm QCS6490 (plataforma Dragonwing RB3 Gen 2 Vision Kit), ejecutado a través del runtime QNN y del ecosistema Qualcomm AI Hub.

La relevancia de esta ficha es acotada: se trata de un artefacto de benchmarking, no de un modelo distribuible. El autor publica un único punto de referencia en precisión fp32 bajo un protocolo uniforme, complementando las entradas cuantizadas que ya figuran en el `perf.yaml` upstream (versión 0.66.0) de `qai-hub-models`. El resultado principal es un tiempo de inferencia estimado de 1.639,8 ms por imagen para el grafo exportado a ONNX.

No hay información sobre arquitectura interna, datos de entrenamiento ni licencia propia del repositorio; la licencia del modelo original se declara como BSD-3-Clause. Cualquier evaluación de calidad de superresolución debe remitirse al proyecto Real-ESRGAN original, no a esta model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN para superresolución de imagen (Real-ESRGAN x4plus); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp32 (medido); el `perf.yaml` upstream incluye variantes cuantizadas no detalladas |
| Idiomas soportados | no aplica (procesamiento de imagen) |
| Licencia | BSD-3-Clause (modelo upstream); licencia del repositorio no disponible |
| Formato de pesos | ONNX exportado (67.086.452 bytes); no se publican pesos ni artefactos compilados |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del modelo (número de bloques residuales, tipo de discriminador, función de pérdida o composición del dataset de entrenamiento). Se sabe que se trata de Real-ESRGAN x4plus, un modelo GAN de superresolución con factor de escala 4, y que el artefacto evaluado es una exportación ONNX generada desde la definición `real_esrgan_x4plus` del paquete `qai-hub-models` 0.66.0.

El repositorio no documenta proceso de entrenamiento, fine-tuning, RLHF ni innovaciones técnicas propias. El único dato técnico relevante es el pipeline de despliegue: exportación a ONNX, compilación con opciones por defecto de AI Hub (sin cuantización explícita) y perfilado de un único grafo mediante `submit_inference_job(..., profile=True)`.

## Capacidades

- Superresolución de imagen con factor de escala 4: entrada 1×3×128×128, salida 1×3×512×512.
- Ejecución en hardware edge Qualcomm (QCS6490) mediante el runtime QNN.
- Perfilado de inferencia por grafo a través de la API de Qualcomm AI Hub.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No incluye modo thinking, visión semántica, audio ni otras modalidades.

## Casos de uso

- Evaluación de hardware edge para superresolución: permite estimar si el QCS6490 cumple un presupuesto de latencia (1,64 s por imagen de 128×128) antes de comprometerse con un diseño de producto.
- Comparación de precisión fp32 frente a variantes cuantizadas: el dato sirve como referencia para medir la pérdida de calidad y la ganancia de velocidad al cuantizar el mismo grafo.
- Planificación de pipelines de visión en dispositivos Dragonwing RB3: útil para dimensionar el throughput máximo teórico (aproximadamente 0,61 imágenes por segundo por grafo) en aplicaciones de captura y reescalado.
- Reproducibilidad de benchmarks: los identificadores de job (`jgkkj13vg` para compilación, `j560kxnn5` para perfilado) permiten replicar la medición con el mismo harness.
- Integración en barridos de evaluación de modelos (sweep): el resultado forma parte de una colección de 28 modelos en 14 categorías, útil para comparativas cruzadas de rendimiento en el mismo dispositivo.
- Referencia para decisiones de despliegue en AI Hub: ayuda a decidir si conviene usar la ruta fp32 por defecto o pasar a una variante cuantizada del `perf.yaml` upstream.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 1.639,8 ms (1.639.814 µs) |
| Entrada | 1 × 3 × 128 × 128 |
| Salida | 1 × 3 × 512 × 512 |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precisión | fp32 ONNX, compilación por defecto de AI Hub |
| Fecha de medición | 2026-11-20 |
| Job de compilación | `jgkkj13vg` |
| Job de perfilado | `j560kxnn5` |

No se han publicado resultados de benchmarks de calidad de imagen (PSNR, SSIM, LPIPS) en la información disponible. El dato de latencia es una estimación por grafo, no una latencia de aplicación extremo a extremo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo se ejecuta en un SoC edge (QCS6490), no en GPU de escritorio.
- GPU recomendadas: no aplica; el runtime medido es QNN sobre la NPU/SoC del QCS6490.
- Compatibilidad con GPU de consumo: no documentada en la información proporcionada.
- Opciones de despliegue: Qualcomm AI Hub (compilación y perfilado), runtime QNN, exportación ONNX desde `qai-hub-models` 0.66.0. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 1.639,8 ms por imagen de 128×128 a 512×512 en fp32; equivale a aproximadamente 0,61 imágenes por segundo por grafo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Real-ESRGAN x4plus (esta medición, fp32) | no disponible | no aplica | 1.639,8 ms en QCS6490 | BSD-3-Clause (upstream) | Solo métricas; sin pesos |
| Real-ESRGAN x4plus (variantes cuantizadas en `perf.yaml` 0.66.0) | no disponible | no aplica | entradas en `perf.yaml`; valores no disponibles en esta información | BSD-3-Clause (upstream) | Vía `qai-hub-models` |
| Otros modelos del sweep `qcs-model-zoo` | no disponible | no aplica | 28 modelos, 14 categorías; valores individuales no disponibles | no disponible | Solo métricas |

No se dispone de datos suficientes para comparar con alternativas de superresolución como ESRGAN, SwinIR o Real-CUGAN en el mismo hardware.

## Limitaciones y advertencias

- El repositorio no publica pesos ni artefactos compilados; solo números de medición y metodología. No es directamente utilizable para inferencia.
- La medición es una estimación por grafo (`execution_summary.estimated_inference_time`), no una latencia de aplicación extremo a extremo.
- El resultado en fp32 no es directamente comparable con las entradas cuantizadas del `perf.yaml` upstream, según advierte el propio autor.
- No hay datos de calidad de imagen: no se puede evaluar si la superresolución es fiel o introduce artefactos.
- La licencia del repositorio no está declarada; la licencia BSD-3-Clause corresponde al modelo upstream, no necesariamente al artefacto de medición.
- No se documentan sesgos, pero al ser un modelo GAN de superresolución puede amplificar artefactos y alucinaciones visuales en imágenes de baja calidad, aunque este extremo no se verifica en la información disponible.
- El hardware objetivo es un SoC edge concreto (QCS6490); los números no son extrapolables a otras plataformas sin nueva medición.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anguoyang/real-esrgan-x4plus-qcs6490
- Colección de mediciones `qcs-model-zoo`: https://github.com/anguoyang/qcs-model-zoo
- Seguimiento del sweep `qcs-bench`: https://github.com/anguoyang/qcs-bench
- Paquete `qai-hub-models` (definición `real_esrgan_x4plus`, versión 0.66.0): no disponible enlace directo en la información proporcionada
- Proyecto Real-ESRGAN original: no disponible enlace en la información proporcionada
