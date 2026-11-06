# heyanzhuo/convora

## Resumen

Convora (卷语) es un modelo de lenguaje de arquitectura no transformer, desarrollado por el usuario heyanzhuo y publicado en Hugging Face. Con solo 9,29 millones de parámetros, está disenado especificamente para inferencia en NPUs de gama baja, y ha sido validado en el chip Rockchip RV1103 (plataforma Luckfox Pico). Su objetivo es demostrar que es posible ejecutar generacion de texto en hardware de borde con recursos muy limitados (12 MiB de CMA, ~10 MiB de RSS).

La arquitectura combina una red convolucional temporal (TCN) de 8 capas con 256 canales como backbone, un mecanismo de memoria denominado Engram y un modulo Delta Lite (4 cabezas de 32 dimensiones) basado en delta-rule. El vocabulario es de 6400 tokens y el campo receptivo del TCN es de 133 tokens, con un limite de entrada de chat de 512 tokens. El modelo esta entrenado unicamente en chino (zh).

El modelo es relevante como prueba de concepto de arquitecturas alternativas al transformer para edge AI, con exportacion a ONNX y RKNN. No obstante, el propio autor advierte que la precision de cuantizacion estricta y la validacion de memoria larga no han sido superadas, y que las respuestas pueden desviarse del tema o repetirse. El repositorio ocupa 0,2 GB y no cuenta con descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TCN (8 capas, 256 canales) + Engram + Delta Lite (4 cabezas x 32 dim) |
| Parametros totales | 9,29 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Campo receptivo TCN de 133 tokens; limite de entrada de chat de 512 tokens |
| Tipos de cuantizacion | QAT (fakeQ sobre pesos Delta, activaciones y estado recursivo) + PTQ en backbone y cabeza de salida; exportacion RKNN con tablas CPU i8/f32 |
| Idiomas soportados | Chino (zh) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt con cargador personalizado), ONNX (float, QDQ y compatible.onnx), RKNN |

## Arquitectura y entrenamiento

Convora no utiliza atencion ni transformer. El backbone es una red convolucional temporal (TCN) de 8 capas con 256 canales, lo que le otorga un campo receptivo de 133 tokens. Sobre esta base se anaden dos mecanismos de memoria: Engram y Delta Lite, este ultimo con 4 cabezas de 32 dimensiones e inspirado en delta-rule (una regla de actualizacion de estado recurrente). El vocabulario es de 6400 tokens. La combinacion TCN + memoria recurrente busca capturar dependencias locales y un estado persistente sin el coste cuadratico de la atencion.

El entrenamiento se realizo en tres fases: 1 epoch de preentrenamiento, 2 epochs de SFT (supervised fine-tuning) y 30 minutos de QAT (quantization-aware training) sobre Delta. En la QAT se aplico fake quantization a los pesos de Delta, las activaciones y el estado recursivo, mientras que el backbone y la cabeza de salida usaron PTQ (post-training quantization). No se menciona el volumen de tokens de entrenamiento ni la composicion del dataset. El modelo se exporto a ONNX y posteriormente a RKNN para su ejecucion en NPU, con tablas de busqueda CPU auxiliares (embedding f32, memoria i8 con escala f32).

## Capacidades

- Generacion de texto en chino: modelo de lenguaje autorregresivo con vocabulario de 6400 tokens.
- Conversacion multi-turno limitada: admite entradas de chat de hasta 512 tokens, aunque el campo receptivo efectivo del TCN es de 133 tokens.
- Memoria recurrente: el modulo Delta Lite mantiene un estado interno entre pasos, lo que permite cierta persistencia de contexto.
- Inferencia en NPU: exportacion validada en Rockchip RV1103 mediante RKNN 1.6.0.
- Inferencia en CPU: graphs ONNX y script `infer_float.py` para ejecucion en float.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue: no disponible (solo chino).

## Casos de uso

- Demostracion de generacion de texto en microcontroladores con NPU: el modelo cabe en 12 MiB de CMA y consume ~10 MiB de RSS, por lo que puede ejecutarse en placas como Luckfox Pico RV1103 para prototipos de interfaz conversacional embebida.
- Investigacion en arquitecturas alternativas al transformer: sirve como banco de pruebas reproducible para estudiar TCN + delta-rule en tareas de lenguaje a muy baja escala.
- Validacion de pipelines de cuantizacion QAT/PTQ para NPU: los fixtures de 260 pasos y el script `verify_release.py` permiten comparar la fidelidad numerica de grafos ONNX/RKNN frente a la referencia float.
- Educacion y divulgacion: el repositorio incluye pesos intermedios (`sft-before-qat.pt`), tokenizer y resultados de test, lo que facilita explicar el flujo completo de entrenamiento, cuantizacion y despliegue en borde.
- Pruebas de integracion en SDK de Rockchip: el modelo puede usarse para verificar la cadena RKNN 1.6.0 / driver 0.9.2 en un entorno controlado antes de portar modelos mayores.
- Prototipos de chat offline en chino para dispositivos sin conectividad: con las limitaciones de calidad documentadas, puede emplearse en demos de asistente local de vocabulario reducido.
- Benchmarking de throughput en NPU: el autor reporta ~286 steps/s en regimen de longitud fija, util para comparar el rendimiento de distintos grafos cuantizados.

## Benchmarks y rendimiento

Los datos disponibles son de consistencia numerica y throughput en RV1103 (RKNN 1.6.0, driver 0.9.2, CMA 12 MiB), medidos sobre un bucle recursivo de 260 tokens:

| Metrica | Grafo QDQ original | Grafo compatible final |
|---|---:|---:|
| NRMSE de logits vs referencia float | 32,096 % | 4,400 % |
| NRMSE de estado vs referencia float | 126,146 % | 14,483 % |
| Top-1 coincidente con referencia float | 75/260 | 228/260 |

Rendimiento del grafo compatible final: aproximadamente 286 steps/s en bucle cerrado de longitud fija, con RSS de 10.272 KiB y DMA de 4.560 KiB.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido convencional; el modelo pesa 9,29 M de parametros (~37 MB en float32, menos en int8). En RV1103 ocupa unos 10 MiB de RSS y 4,5 MiB de DMA.
- GPU recomendadas: no se documentan; el diseno esta orientado a NPU y CPU.
- Cabe en GPU consumer: si, por tamano, cualquier GPU moderna puede ejecutarlo, aunque no es el objetivo del proyecto.
- Despliegue en NPU: Rockchip RV1103 con RKNN 1.6.0 y driver 0.9.2; requiere las librerias del SDK correspondiente.
- Despliegue en CPU: ONNX Runtime mediante `scripts/infer_float.py` (Python 3.10, Linux/WSL).
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no disponible; la arquitectura personalizada no es compatible con estos motores.
- Latencia y throughput: ~286 steps/s en RV1103 en regimen de longitud fija; no se reportan latencias para otras plataformas.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la informacion proporcionada. Convora es una arquitectura personalizada (TCN + Engram + Delta Lite) de 9,29 M de parametros orientada a NPU, sin equivalentes documentados en el material consultado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Convora | 9,29 M | 133 (TCN) / 512 (chat) | no disponible | Hugging Face + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Calidad de generacion limitada: el autor advierte que las respuestas pueden desviarse del tema o repetirse; la validacion de precision de cuantizacion estricta y de memoria larga no ha sido superada.
- Contexto efectivo corto: el campo receptivo del TCN es de 133 tokens, muy inferior al limite de entrada de 512 tokens, lo que limita la coherencia en conversaciones largas.
- Solo chino: no hay soporte multilingue documentado.
- Licencia no disponible: no se especifican terminos de uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- Formato propietario: los `.pt` requieren un cargador personalizado del repositorio y no incluyen optimizer, por lo que no permiten reanudar el entrenamiento directamente.
- Dependencia de artefactos emparejados: el grafo RKNN y las tablas CPU (embedding f32, memoria i8 y escala) deben usarse conjuntamente; mezclarlos con otras versiones puede romper la inferencia.
- Sesgos: no documentados, pero al entrenarse solo en chino puede reflejar sesgos del corpus chino utilizado.
- Riesgo de alucinacion: alto en un modelo de 9,29 M de parametros sin datos de evaluacion estandar.
- Madurez: repositorio con 0 descargas y 0 likes; creado y actualizado en noviembre de 2026, sin evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/heyanzhuo/convora
- Codigo y uso: https://github.com/goxtopia/convora
- Resumen de tests: https://github.com/goxtopia/convora/blob/main/TEST_SUMMARY.md
- Artefactos y SHA256: https://huggingface.co/heyanzhuo/convora/blob/main/ARTIFACTS.json
