# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_SatImp

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_SatImp` es un modelo de lenguaje de 3.212.749.824 parámetros derivado de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, que a su vez parte de Llama 3.2 3B Instruct. El modelo ha sido sometido a un proceso de *machine unlearning* sobre el split `forget05` del dataset TOFU (`locuslab/TOFU`) empleando el método **SatImp** dentro del framework [open-unlearning](https://github.com/locuslab/open-unlearning). Su propósito no es el despliegue comercial, sino servir como referencia experimental (baseline de *weight unlearning*) y como modelo borrador en el proyecto Speculative-Decoding-Unlearning.

Se trata de un transformer decoder-only de tipo denso, publicado en formato safetensors y compatible con `transformers` y text-generation-inference. El repositorio ocupa 6,4 GB y no incluye versiones cuantizadas. La model card documenta los hiperparámetros de entrenamiento y un conjunto de métricas de evaluación TOFU (memorización exacta, *forget quality*, *model utility* y varias métricas de *membership inference*), pero no especifica idiomas soportados ni longitud de contexto.

La relevancia actual del modelo es metodológica: permite estudiar el equilibrio entre olvidar información concreta y conservar utilidad general, un problema abierto tanto en privacidad (derecho al olvido, RGPD) como en la evaluación de modelos. Con 0 descargas y 0 *likes*, es un artefacto de investigación reciente, sin validación externa ni garantías de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.2, con atención por grupos GQA y RoPE) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (la familia Llama 3.2 3B Instruct soporta hasta 128.000 tokens) |
| Tipos de cuantizacion | no se distribuyen versiones cuantizadas; pesos en safetensors (aproximadamente 6,4 GB, precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | open-unlearning/tofu_Llama-3.2-3B-Instruct_full |
| Dataset de entrenamiento | locuslab/TOFU (split forget05) |
| Metodo de unlearning | SatImp |
| Tamano del repositorio | 6,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA) para reducir el coste de la caché KV. El modelo parte de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, un ajuste completo previo sobre TOFU, y sobre él se aplica el método de olvido **SatImp**. La model card no describe el mecanismo interno de SatImp ni el volumen de tokens empleado en el ajuste de olvido; únicamente publica los hiperparámetros del método.

Los hiperparámetros declarados son `gamma: 1.0`, `alpha: 0.1`, `retain_loss_type: NLL`, `beta1: 5.0` y `beta2: 1.0`. No se menciona ningún uso de RLHF, DPO ni decodificación especulativa durante el entrenamiento de este artefacto: la referencia a decodificación especulativa aparece solo por su uso como modelo borrador en el proyecto Speculative-Decoding-Unlearning. La configuración completa de entrenamiento está en `.hydra/config.yaml` y las salidas de evaluación TOFU en `evals/`.

## Capacidades

- Generación de texto conversacional: hereda el comportamiento *instruct* de Llama 3.2 3B Instruct, aunque degradado por el proceso de olvido (utilidad de modelo reportada de 0,6324 sobre 1).
- Respuesta a preguntas de formato pregunta-respuesta, el formato nativo del dataset TOFU.
- Capacidad de olvido selectivo: el modelo está entrenado para reducir la probabilidad de generar respuestas del split `forget05` (probabilidad pregunta-respuesta de olvido de 0,0103).
- Soporte de tool calling o function calling: no documentado en la model card.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades especiales (modo *thinking*, visión, audio): ninguna declarada. No es un modelo multimodal.
- Uso como modelo borrador en decodificación especulativa: documentado en el proyecto del autor.

## Casos de uso

- Baseline de *machine unlearning*: sirve como referencia de *weight unlearning* frente a otros métodos implementados en el framework open-unlearning (por ejemplo, comparativas entre gradiente ascendente, NPO o GradDiff) sobre el mismo split `forget05`.
- Modelo borrador en decodificación especulativa: el propio autor lo emplea en el proyecto Speculative-Decoding-Unlearning, donde un modelo pequeño y alineado con el modelo objetivo acelera la generación verificando candidatos con el modelo grande.
- Investigación en *membership inference attacks* (MIA): las métricas `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus` y `mia_zlib` permiten auditar si el modelo sigue filtrando información del conjunto de olvido.
- Evaluación de privacidad y derecho al olvido: útil para estudiar hasta qué punto un ajuste de olvido reduce la memorización exacta sin destruir la utilidad general (0,3267 de memorización exacta y 0,6324 de utilidad reportadas).
- Reproducción de experimentos académicos: el repositorio publica la configuración de Hydra y las salidas de evaluación, lo que facilita replicar resultados en un entorno de investigación.
- Análisis de *privleak* y fugas residuales: el valor de 40,8407 documentado permite medir el desequilibrio entre el comportamiento sobre datos retenidos y datos olvidados.
- Fine-tuning posterior controlado: puede usarse como punto de partida para estudiar si un ajuste adicional revierte el olvido (fenómeno de *relearning*).
- Docencia en cursos de IA responsable: ejemplo compacto (3,2 B) y ejecutable en GPUs de consumo para ilustrar técnicas de olvido a nivel de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye métricas de la evaluación TOFU, que se reproducen a continuación tal cual:

| Metrica | Valor |
|---|---|
| exact_memorization | 0,3267 |
| extraction_strength | 0,0414 |
| forget_Q_A_PARA_Prob | 0,0103 |
| forget_Q_A_gibberish | 0,4607 |
| forget_quality | 0,0000 |
| forget_truth_ratio | 0,7660 |
| mia_loss | 0,0341 |
| mia_min_k | 0,0991 |
| mia_min_k_plus_plus | 0,9885 |
| mia_zlib | 0,0242 |
| model_utility | 0,6324 |
| privleak | 40,8407 |

No se dispone de comparaciones con otros modelos de la misma categoría dentro de la información proporcionada.

## Requisitos de hardware

- VRAM estimada en precisión completa (fp16/bf16): aproximadamente 6,5 GB solo de pesos, más caché KV; en la práctica entre 8 y 10 GB según longitud de contexto y tamaño de lote.
- VRAM estimada cuantizado: alrededor de 3,5 GB en INT8 y 2 a 2,5 GB en 4 bits (requiere convertir los pesos, ya que no se distribuyen versiones GGUF o AWQ).
- GPUs consumer compatibles: sí; cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En 4 bits podría ejecutarse en GPUs de 4 a 6 GB de VRAM.
- GPUs de centro de datos: no requiere A100 ni H100; cualquier acelerador con más de 10 GB es suficiente para inferencia en fp16.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, y llama.cpp u Ollama previa conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Almacenamiento: 6,4 GB para el repositorio completo en safetensors.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_SatImp | 3,21 B | no disponible | llama3.2 | Modelo olvidado con SatImp sobre el split forget05; utilidad 0,6324 y memorización exacta 0,3267 |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | 3,21 B (misma base) | no disponible | no disponible | Modelo base antes del olvido; no se publican sus métricas TOFU en esta información |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens (según el fabricante) | Llama 3.2 Community License | Modelo instruct original; no ha visto TOFU ni proceso de olvido. No comparable en métricas de olvido |

No se dispone de datos de rendimiento de benchmarks estándar para ninguno de los tres modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Artefacto de investigación: 0 descargas y 0 *likes*; no ha sido validado por terceros ni está pensado para producción.
- El olvido no es absoluto: la propia model card reporta `exact_memorization` de 0,3267, lo que indica que parte de la información del conjunto de olvido sigue siendo recuperable.
- `privleak` de 40,8407 y `forget_truth_ratio` de 0,7660 sugieren un desequilibrio apreciable entre el comportamiento sobre datos retenidos y olvidados; conviene interpretarlos con cautela y en el contexto del benchmark TOFU.
- `forget_quality` de 0,0000 es un resultado que requiere análisis: no debe asumirse que implica un olvido perfecto sin revisar la definición exacta de la métrica en el framework open-unlearning.
- Degradación de utilidad: `model_utility` de 0,6324 indica una pérdida apreciable de capacidades generales respecto al modelo original.
- El dataset TOFU contiene preguntas y respuestas sobre autores ficticios; el "olvido" aquí es una evaluación académica y no una garantía de privacidad sobre datos reales.
- Idiomas soportados no declarados: se desconoce el comportamiento fuera del inglés, idioma predominante en TOFU.
- Longitud de contexto no confirmada en la model card; no debe asumirse el máximo de la familia sin verificación.
- Licencia llama3.2 (Llama 3.2 Community License): impone condiciones y restricciones de uso comercial, obligaciones de atribución y cláusulas específicas para despliegues a gran escala. Es necesario revisar el texto completo antes de cualquier uso comercial.
- Riesgo de alucinación: no cuantificado en la información disponible, pero plausible dado el tamaño de 3 B y el proceso de ajuste.
- Uso como modelo borrador en decodificación especulativa: requiere que el vocabulario y la tokenización coincidan con el modelo objetivo, lo que limita su reutilización fuera de ese proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_SatImp
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Pagina oficial de la familia Llama 3 (resultado de busqueda): https://www.llama.com/models/llama-3/
- El resto de resultados de la busqueda web no guardaban relacion con el modelo (contenido sobre carteles de desayuno) y se han descartado.
