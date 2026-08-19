# dbirks/Qwen3.8-27B-NVFP4-AutoRound

## Resumen

`dbirks/Qwen3.8-27B-NVFP4-AutoRound` es una cuantizacion NVFP4 (4 bits de pesos y activaciones, W4A4) del modelo multimodal `Qwen/Qwen3.8-27B`, producida por el ingeniero independiente dbirks mediante Intel AutoRound y empaquetada en formato compressed-tensors para su uso directo con vLLM en GPUs NVIDIA Blackwell. El modelo base es un decoder hibrido de 64 capas (48 de atencion lineal GatedDeltaNet y 16 de atencion completa) con torre de vision, 262K de contexto y aproximadamente 27.000 millones de parametros totales (16.713.682.960 en los pesos cuantizados). El objetivo de esta ficha es ofrecer una alternativa de inferencia eficiente en memoria (20,6 GB en disco frente a unos 52 GB del BF16 original) manteniendo la precision dentro del ruido estadistico, segun los resultados preliminares del autor.

La relevancia de este modelo radica en que aprovecha los tensor cores FP4 de la arquitectura Blackwell (SM100/SM120) para acelerar la inferencia sin necesidad de cuantizar la torre de vision ni las proyecciones criticas de control de recurrencia, que permanecen en BF16. Esto lo convierte en una opcion practica para desplegar Qwen3.8-27B en entornos de produccion con una sola GPU Blackwell de 96 GB, como la RTX PRO 6000, manteniendo una ventana de contexto amplia y capacidades multimodales. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 48 capas GatedDeltaNet (atencion lineal) + 16 capas full-attention, con torre de vision |
| Parametros totales | 16.713.682.960 (pesos cuantizados) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (W4A4, grupo 16, escala FP8 e4m3); existe variante W4A16 (int4 pesos, BF16 activaciones) |
| Idiomas soportados | en (segun metadata); el modelo base Qwen3.8 es multilingue, pero no se especifican otros idiomas en esta ficha |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, esquema `nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` emplea una arquitectura hibrida que combina atencion lineal GatedDeltaNet (48 capas) con atencion completa (16 capas), lo que permite manejar secuencias largas (262K) con menor coste computacional que un transformer denso puro. La cuantizacion NVFP4 se aplica exclusivamente a las proyecciones de alto volumen del decoder de lenguaje: `in_proj_qkv`, `in_proj_z` y `out_proj` de las capas GatedDeltaNet, las proyecciones `q/k/v/o` de las capas full-attention y todos los MLP (`gate`, `up`, `down`). Se mantienen en BF16 las proyecciones de control de recurrencia `in_proj_a` e `in_proj_b` (cuantizarlas degrada la recurrencia), la torre de vision (`visual.*`), la cabeza MTP y `lm_head`.

El proceso de cuantizacion se realizo con Intel AutoRound (arXiv:2309.05516) usando reconstruccion por bloques SignRound. La calibracion se hizo con 128 muestras del dataset `NeelNanda/pile-10k`, longitud de secuencia 2048 y 200 iteraciones de ajuste, en una unica GPU NVIDIA RTX PRO 6000 Blackwell de 96 GB, con un pico de uso de VRAM de aproximadamente 42 GB y 13,6 GB de RAM del host. No se aplico RLHF ni DPO adicional; se parte del modelo base ya entrenado.

## Capacidades

- Generacion de texto y razonamiento en modo pensamiento (thinking mode), que es el modo de muestreo recomendado por el autor para la evaluacion.
- Comprension y generacion de texto en ingles (segun metadata); el modelo base soporta otros idiomas, pero no se documentan en esta ficha.
- Capacidades multimodales de entrada: el modelo base acepta imagen y texto (pipeline `image-text-to-text`), aunque la torre de vision se mantiene en BF16 y no se ve afectada por la cuantizacion.
- Manejo de contexto largo de hasta 262K tokens gracias a la combinacion de atencion lineal y completa.
- Soporte de generacion de codigo y matematicas: los resultados preliminares en GSM8K y HumanEval muestran que la cuantizacion no introduce una perdida significativa frente al BF16.
- Compatible con vLLM mediante auto-deteccion del esquema NVFP4; no requiere flags de cuantizacion adicionales.
- No se documenta soporte explicito de tool calling ni function calling en la model card, aunque el modelo base Qwen3.8 podria incluirlo; no se puede confirmar con la informacion disponible.

## Casos de uso

- Inferencia multimodal en produccion con una sola GPU Blackwell: el modelo permite servir un asistente que procesa imagenes y texto con 262K de contexto, ideal para aplicaciones de analisis de documentos extensos o conversaciones con historial largo.
- Despliegue de chatbots con modo de razonamiento: el modo thinking permite generar respuestas razonadas paso a paso, util en asistentes de soporte tecnico o educativos que necesitan explicar procesos complejos.
- Generacion de codigo asistida en entornos con restricciones de memoria: al ocupar solo 20,6 GB en disco, puede ejecutarse en GPUs Blackwell de 48 GB o menos (con `--max-model-len` reducido), habilitando autocompletado y revision de codigo en CI/CD.
- Analisis de imagenes y texto combinados: por ejemplo, extraer informacion de capturas de pantalla, diagramas o documentos escaneados junto con instrucciones textuales, gracias a la torre de vision BF16 intacta.
- Procesamiento de secuencias largas en investigacion: con 262K de contexto, es adecuado para resumir corpus extensos, analizar logs o procesar libros completos en una sola pasada.
- Servicio de API compatible con OpenAI mediante vLLM: el despliegue con `vllm serve` expone un endpoint estándar que se integra facilmente en aplicaciones existentes, chatbots o pipelines de agentes.

## Benchmarks y rendimiento

No se han publicado resultados completos de benchmarks en la informacion disponible. La model card indica que la evaluacion de precision esta en progreso en el modo thinking por defecto, y que los resultados preliminares muestran que la cuantizacion NVFP4 se encuentra "dentro del ruido estadistico" del modelo BF16 base en GSM8K y HumanEval, sin establecerse una diferencia significativa. Los numeros anteriores sin cadena de pensamiento fueron retirados por el autor al considerarlos un artefacto de la metodologia de evaluacion, no una propiedad de la cuantizacion. Por tanto, no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada: pico de aproximadamente 42 GB durante la cuantizacion; para inferencia, el modelo ocupa unos 20,6 GB en disco, por lo que cabe en GPUs Blackwell de 48 GB o superiores con ventana de contexto reducida.
- GPU recomendada: NVIDIA Blackwell con SM100 o SM120 (por ejemplo, RTX PRO 6000 Blackwell 96 GB, B200, etc.). En GPUs Ampere o Hopper no se obtiene aceleracion FP4 y se cae a un fallback Marlin aproximadamente 2 veces mas lento.
- No cabe en GPUs consumer de generaciones anteriores (Ada, Ampere) con rendimiento aceptable; requiere obligatoriamente Blackwell para aprovechar los tensor cores FP4.
- Opciones de despliegue: vLLM (auto-deteccion del esquema), con backend FlashInfer recomendado para Blackwell consumer (SM120). Tambien se puede usar Docker con `vllm/vllm-openai`.
- Latencia y throughput: no se proporcionan datos numericos en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Qwen/Qwen3.8-27B` (base) | ~27B (BF16) | 262K | Ninguna (BF16) | Apache 2.0 | HuggingFace |
| `dbirks/Qwen3.8-27B-NVFP4-AutoRound` | 16,7B (cuantizado) | 262K | NVFP4 (W4A4) | Apache 2.0 | HuggingFace |
| `dbirks/Qwen3.8-27B-W4A16-AutoRound` | ~16,7B (cuantizado) | 262K | W4A16 (int4 pesos, BF16 activaciones) | Apache 2.0 | HuggingFace |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos comparables en la informacion proporcionada. La diferencia principal entre las dos variantes cuantizadas es el esquema: NVFP4 requiere Blackwell y cuantiza tambien activaciones, mientras que W4A16 funciona en cualquier GPU Ampere o posterior mediante Marlin, a costa de no aprovechar los tensor cores FP4.

## Limitaciones y advertencias

- Requiere obligatoriamente NVIDIA Blackwell (SM100/SM120) para obtener aceleracion FP4; en GPUs mas antiguas el rendimiento es aproximadamente 2 veces inferior al usar el fallback Marlin.
- La cuantizacion W4A4 afecta tanto a pesos como a activaciones, lo que puede introducir perdidas de precision en tareas sensibles a la cuantizacion de activaciones. Para escenarios donde se prefiera solo cuantizacion de pesos, se recomienda la variante W4A16.
- Solo el decoder de lenguaje esta cuantizado; la torre de vision, las proyecciones de control de recurrencia, la cabeza MTP y `lm_head` permanecen en BF16, lo que limita la reduccion total de memoria.
- La evaluacion de precision esta en curso; los resultados preliminares son alentadores pero no concluyentes. No se han publicado cifras de benchmarks completas.
- El idioma documentado es ingles; aunque el modelo base es multilingue, no se garantiza el rendimiento en otros idiomas sin verificacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, especialmente en modo thinking donde las cadenas de razonamiento pueden ser extensas; se recomienda validacion externa en aplicaciones criticas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de soporte ni mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dbirks/Qwen3.8-27B-NVFP4-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante W4A16 (peso solo): https://huggingface.co/dbirks/Qwen3.8-27B-W4A16-AutoRound
- Repositorio de Intel AutoRound: https://github.com/intel/auto-round
- Repositorio de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Paper de AutoRound (arXiv:2309.05516): https://arxiv.org/abs/2309.05516
