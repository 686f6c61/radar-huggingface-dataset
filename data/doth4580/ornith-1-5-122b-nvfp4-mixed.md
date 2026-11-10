# doth4580/Ornith-1.5-122B-NVFP4-mixed

## Resumen

Ornith-1.5-122B-NVFP4-mixed es un paquete de pesos cuantizados del modelo Ornith-1.5-122B, publicado por el usuario doth4580. No se trata de un modelo entrenado desde cero, sino de una conversión a formatos de baja precisión (NVFP4 para las operaciones GEMM y FP8 para las proyecciones Gated DeltaNet) realizada con el cuantizador offline del motor de inferencia veloGB10, siguiendo la receta `all,gdn:fp8`. El resultado se distribuye en el formato `compressed-tensors` con layout `nvfp4-pack-quantized`, pensado para ejecutarse en una, dos o cuatro máquinas NVIDIA DGX Spark / GB10.

El modelo original, Ornith-1.5-122B, lo desarrolla ornith-ai y sigue la arquitectura Qwen3.5-122B-A10B (`qwen3_5_moe`), un transformer con mezcla de expertos. Ornith-1.5 se presenta como una evolución de Ornith-1.0, que a su vez partía de Qwen3.5 y Gemma4 con preentrenamiento continuado y mid-training adicional. La relevancia de este paquete concreto es práctica: permite servir un modelo de 122B parámetros en hardware de sobremesa para centros de datos compactos (GB10) con ventanas de contexto de hasta 262.144 tokens y decodificación especulativa mediante la cabeza MTP incluida o el drafter DFlash2.

La licencia declarada es MIT, tanto en el paquete cuantizado como en el modelo base, lo que facilita el uso comercial. El paquete conserva sin cambios el tokenizer, la plantilla de chat y la configuración del original, salvo el bloque `quantization_config`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, layout Qwen3.5-122B-A10B (`qwen3_5_moe`); incluye proyecciones Gated DeltaNet |
| Parametros totales | 122B (según nomenclatura del modelo base) |
| Parametros activos | 10B (según nomenclatura A10B del layout Qwen3.5) |
| Longitud de contexto | 262.144 tokens (configurado en los comandos de ejemplo con `--max-seq-len 262144`) |
| Tipos de cuantizacion | NVFP4 (GEMMs) + FP8 (proyecciones Gated DeltaNet); formato `nvfp4-pack-quantized` de `compressed-tensors` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `compressed-tensors` (`nvfp4-pack-quantized`); incluye `ple_ngram_nvfp4.bin` (tabla del motor, ignorada por otros frameworks) |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura `qwen3_5_moe`, un transformer con mezcla de expertos de 122B parámetros totales y 10B activos por token. La model card del paquete cuantizado menciona proyecciones Gated DeltaNet, que se mantienen en FP8 en esta conversión, y una cabeza MTP (multi-token prediction) incluida en el paquete, utilizable como fuente de decodificación especulativa. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO para el modelo original.

La aportación de este repositorio es exclusivamente de cuantización y empaquetado: los pesos se generaron con el cuantizador offline de veloGB10 aplicando la receta `all,gdn:fp8`, que cuantiza las GEMM a NVFP4 y mantiene las proyecciones Gated DeltaNet en FP8. El tokenizer, la plantilla de chat y la configuración se conservan del original, salvo el bloque de configuración de cuantización. El autor no reclama propiedad intelectual sobre el modelo ni sobre su arquitectura.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un LLM de propósito general; la model card del paquete no detalla capacidades específicas más allá de las heredadas.
- Modo thinking: los benchmarks de veloGB10 se ejecutaron con "thinking on", lo que indica soporte de razonamiento extendido.
- Decodificación especulativa: compatible con la cabeza MTP incluida en el paquete y con el drafter externo DFlash2 de Ornith-1.5-122B.
- Servido compatible con la API de OpenAI (`/v1`) a través de veloGB10.
- Caché de prefijos (`--prefix-cache on`) para reutilización de contexto en conversaciones multi-turno.
- Soporte multi-nodo con tensor parallelism (TP=1, TP=2, TP=4) y transferencia de pesos por red con caché local en los nodos.
- Capacidades de tool calling, agentes, visión, audio o multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Servicio de inferencia en clústeres compactos GB10: el paquete está pensado para desplegarse en una, dos o cuatro NVIDIA DGX Spark con veloGB10, lo que permite ofrecer un modelo de 122B en hardware de bajo consumo frente a soluciones con GPUs de centro de datos.
- Asistentes con contexto largo: la ventana de 262.144 tokens configurada en los comandos de ejemplo permite procesar documentos extensos, bases de código completas o historiales de conversación prolongados en una sola petición.
- Generación de código en pipelines internos: con una decodificación de 29-58 tok/s según topología y fuente de draft, es viable para autocompletado y generación de parches en entornos de desarrollo con latencia tolerable.
- Razonamiento con modo thinking: adecuado para tareas que requieren cadenas de razonamiento largas, como análisis de documentos técnicos o resolución de problemas matemáticos, aprovechando la decodificación especulativa para amortiguar el coste de los tokens de pensamiento.
- Despliegue multi-nodo con escalado horizontal: el soporte TP=2 y TP=4 con transferencia de pesos por RoCE permite aumentar el throughput agregado (de 39 a 69 tok/s con dos peticiones concurrentes en los benchmarks) sin replicar el modelo en cada máquina.
- Backend compatible con OpenAI para herramientas existentes: al exponer `/v1`, se puede integrar en aplicaciones que ya consumen la API de OpenAI sin cambios en el cliente, sustituyendo únicamente la URL base.
- Experimentación con cuantización NVFP4: útil para investigadores que quieran evaluar la calidad y el rendimiento de NVFP4 frente a FP8/FP16 en un MoE de 122B sobre hardware Blackwell/GB10.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a VeloBench sobre la API servida en máquinas GB10 (2026-11-09, veloGB10 0.7.7 en desarrollo), con muestreo de producción, thinking activado y una ejecución por celda (±10% de variación). La decodificación se mide en tokens de salida por segundo e incluye decodificación especulativa.

| Topologia | Fuente de draft | Decode turno de codigo | Decode turno de relato | Mediana decode todos los turnos | Prefill (tok/s) | 2 peticiones, agregado | Aceptacion del draft |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza MTP del paquete | 29 | 24 | 26 | 695 | 39 | 44,7% |
| TP=2 | Cabeza MTP del paquete | 41 | 37 | 37 | 1.059 | 59 | 34,3% |
| TP=4 | Cabeza MTP del paquete | 44 | 39 | 41 | 997 | 69 | 34,0% |
| TP=1 | Ornith DFlash2 | 32 | 9 | 12 | 678 | 40 | 59,2% |
| TP=2 | Ornith DFlash2 | 56 | 13 | 18 | 1.045 | 59 | 55,4% |
| TP=4 | Ornith DFlash2 | 58 | 17 | 21 | 985 | 70 | 57,7% |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el paquete está diseñado para ejecutarse en una, dos o cuatro máquinas GB10 (DGX Spark), cada una con memoria unificada de clase GB10. Con 122B parámetros en NVFP4/FP8, el peso ocupa aproximadamente 60-70 GB, lo que encaja en una sola GB10 con memoria unificada y requiere tensor parallelism para repartir carga en configuraciones mayores.
- GPU recomendadas: NVIDIA DGX Spark / GB10. No se menciona soporte ni validación en A100, H100 o RTX 4090.
- Cabe en consumer GPU: no hay datos que lo confirmen; el hardware objetivo son estaciones GB10, no GPUs de consumo convencionales.
- Opciones de despliegue: veloGB10 (`gb10_inference`) es el motor probado y recomendado, con servidor compatible con OpenAI. Al ser formato `compressed-tensors`, otros frameworks que lean el formato podrían cargarlo, pero no se han validado en la model card.
- Latencia y throughput: prefill de 678-1.059 tok/s y decode de 12-58 tok/s según topología y drafter (ver tabla de benchmarks). El drafter DFlash2 mejora la decodificación de código (hasta 58 tok/s en TP=4) pero degrada la de texto narrativo (9-17 tok/s) por menor tasa de aceptación en ese dominio.
- Red: para TP=2 y TP=4 se requiere conectividad RoCE entre nodos; con dos pares de puertos activos se selecciona con `--rdma-dev`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-122B-NVFP4-mixed (este paquete) | 122B totales / 10B activos | 262.144 tokens | MIT | compressed-tensors NVFP4/FP8 | Optimizado para veloGB10 en GB10; incluye cabeza MTP |
| ornith-ai/Ornith-1.5-122B (original) | 122B totales / 10B activos | no disponible en la información | MIT | no disponible | Pesos sin cuantizar; referencia de calidad |
| incoai/Ornith-1.5-122B-DFlash2 | drafter (no es un modelo completo) | no disponible | no disponible | no disponible | Draft model para decodificación especulativa sobre Ornith-1.5-122B |

No se dispone de datos de benchmarks del modelo original ni de alternativas de la misma categoría en la información proporcionada, por lo que no es posible una comparación de rendimiento cuantitativa.

## Limitaciones y advertencias

- Este repositorio contiene pesos cuantizados, no el modelo original: la cuantización NVFP4/FP8 puede introducir degradación de calidad respecto al modelo en precisión completa; no se han publicado evaluaciones de calidad comparativas.
- El paquete está validado únicamente con veloGB10; otros frameworks que lean `compressed-tensors` pueden cargarlo, pero no hay pruebas publicadas.
- El archivo `ple_ngram_nvfp4.bin` es específico del motor veloGB10 y otros frameworks lo ignoran; su ausencia de soporte no está documentada más allá de esa nota.
- El rendimiento del drafter DFlash2 es muy dependiente del dominio: mejora el código pero empeora notablemente la narrativa (12 tok/s de mediana en TP=1 frente a 26 con MTP).
- Los benchmarks son de una sola ejecución por celda con ±10% de variación y builds de desarrollo de veloGB10 0.7.7; no deben tomarse como cifras de producción estables.
- No hay información sobre sesgos, riesgo de alucinación, idiomas soportados ni restricciones adicionales del modelo base en la información disponible.
- La licencia MIT se hereda del modelo original; conviene verificar el archivo LICENSE del repositorio base para confirmar términos.
- El autor del paquete no reclama propiedad intelectual sobre el modelo; cualquier reclamación de derechos debe dirigirse a los autores originales.

## Enlaces

- Paquete cuantizado en Hugging Face: https://huggingface.co/doth4580/Ornith-1.5-122B-NVFP4-mixed
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B/blob/main/LICENSE
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- Drafter DFlash2 para Ornith-1.5-122B: https://huggingface.co/incoai/Ornith-1.5-122B-DFlash2
