# MeganEFlynn/HSpec-Qwen27B-5m5a

## Resumen

HSpec-Qwen27B-5m5a es un borrador (*drafter*) de decodificación especulativa desarrollado por MeganEFlynn para acelerar la inferencia de Qwen/Qwen3.8-27B. No es un modelo de lenguaje autónomo: se trata de un modelo auxiliar que propone tokens candidatos que el modelo verificador (Qwen3.8-27B) valida en paralelo, reduciendo el coste por token generado. Emplea la técnica H-Spec con una arquitectura híbrida Mamba-Atención, concretamente el patrón de bloques "(mamba, attention, mlp)×5", que combina 5 subcapas Mamba con 5 subcapas de atención.

El checkpoint publicado corresponde a una fase intermedia de entrenamiento (*in-training checkpoints*), con instantáneas cada 5 % del progreso. Cuenta con aproximadamente 1.920 millones de parámetros y se inicializa desde cero (con las proyecciones q/k/v/o copiadas del verificador), lo que lo distingue de los borradores destilados convencionales. Su relevancia radica en que permite evaluar el comportamiento del borrador durante el entrenamiento y validar la viabilidad del método H-Spec sobre modelos de 27B en despliegues con vLLM.

La licencia es Apache 2.0 y la librería asociada es `speculators`, si bien requiere un fork específico de vLLM para funcionar, ya que la versión estándar no incluye el método `mamba_attn_hybrid`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-Atención (H-Spec), patrón (mamba, attention, mlp)×5 |
| Parametros totales | ~1.920 millones (1.92B+) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana deslizante de 2048 tokens en subcapas de atención; servicio con `--max-model-len 8196` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (checkpoints en directorios `checkpoint-*` con `config.json` y `training_state.json`) |

## Arquitectura y entrenamiento

El borrador sigue el diseño H-Spec con arquitectura híbrida Mamba-Atención. El patrón de bloques es "(mamba, attention, mlp)×5", es decir, cinco subcapas Mamba y cinco de atención. Las subcapas de atención leen la caché KV del verificador en las capas 3, 19, 35, 51 y 63 (todas las capas de atención completa de Qwen3.8-27B, con identificadores ≡ 3 mod 4). El estado Mamba se inicializa a partir de los estados ocultos fusionados del último token de las capas 3, 15, 27, 39, 51 y 63. La atención emplea una ventana deslizante de 2048 tokens, tamaño de bloque 8, Mamba con 80 cabezas de dimensión 64, dimensión de estado 4, 4 grupos, vocabulario de borrador de 64k, máximo de 512 anclas y rango de Markov 256.

El entrenamiento parte de inicialización aleatoria (con proyecciones q/k/v/o copiadas del verificador) y usa el conjunto OpenPerfectBlend regenerado con Qwen3.8-27B (aproximadamente 1,74 millones de muestras preparadas), durante 2 épocas con tasa de aprendizaje 6e-4 y decaimiento coseno, y una función de pérdida combinada `{"ce": 0.1, "tv": 0.9}`. Se ejecutó en 6 rangos H100 con DP=2 y extracción de estados ocultos en línea. Cada directorio `checkpoint-*` es una instantánea al 5 % de intervalo y `training_state.json` registra el paso.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3.8-27B.
- Lectura de la caché KV del verificador en proceso, sin servidor de extracción ni conector KV en inferencia.
- Reconstrucción de RoPE a partir del `config.json` guardado (theta 1e7, `partial_rotary_factor` 0.25, `head_dim` 256).
- Profundidad de servicio prevista de 8 tokens especulativos (`--spec-tokens 8`).
- Validación del método H-Spec y del patrón híbrido Mamba-Atención durante el entrenamiento.
- No es un modelo de chat ni de instrucciones: no genera respuestas de forma autónoma.
- Capacidades multilingües: no disponible (dependen del verificador Qwen3.8-27B).

## Casos de uso

- Aceleración de inferencia de Qwen3.8-27B en producción: el borrador propone hasta 8 tokens por paso que el verificador valida en paralelo, reduciendo el coste por token en despliegues con vLLM y el fork `hspec_qwen_27B`.
- Evaluación de investigación del método H-Spec: las instantáneas al 5 % permiten estudiar la curva de aceptación del borrador a lo largo del entrenamiento y comparar con el hermano 4m3a.
- Experimentación con arquitecturas híbridas Mamba-Atención: sirve como banco de pruebas para analizar cómo interactúan las subcapas Mamba con la lectura de KV del verificador.
- Despliegue de bajo coste en clústeres con H100: el entrenamiento y el servicio se validaron en 6 rangos H100 con backend FLASHINFER, por lo que encaja en infraestructuras de GPU de centro de datos.
- Servicio de chat de alta concurrencia sobre Qwen3.8-27B: al reducir el número de pasos del verificador, mejora el throughput agregado en escenarios multi-turno con contexto largo (hasta 8196 tokens configurados).
- Reproducción de pipelines de decodificación especulativa: el repositorio `weifanjiang/speculators-qwen3.8-hspec` y el fork de vLLM permiten replicar el flujo completo de entrenamiento y servicio.
- Comparación de variantes de borrador: el checkpoint 5m5a puede contrastarse con el 4m3a para medir el impacto del patrón de bloques en la tasa de aceptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona, como referencia del hermano 4m3a, una aceptación de 0,51 en la posición 7 con decaimiento plano, dato que no constituye un benchmark del presente checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el borrador (~1,92B parámetros) se sirve junto al verificador Qwen3.8-27B, por lo que el requisito dominante es el del modelo base.
- GPU recomendadas: H100 (el entrenamiento usó 6 rangos H100); no se documentan otras GPU.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: exclusivamente el fork `MeganEFlynn/vllm:hspec_qwen_27B` en el commit `18104949` con `--spec-method mamba_attn_hybrid`; vLLM estándar no soporta el método. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Backend de atención: FLASHINFER.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HSpec-Qwen27B-5m5a | ~1,92B | 2048 (ventana) / 8196 (servicio) | Borrador H-Spec híbrido Mamba-Atención | Apache 2.0 | Hugging Face, requiere fork de vLLM |
| HSpec-Qwen27B-4m3a-epoch1 | no disponible | no disponible | Borrador H-Spec híbrido (patrón 4m3a) | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B | no disponible | no disponible | Modelo verificador (LLM completo) | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un borrador de decodificación especulativa, no un modelo autónomo: no puede usarse sin el verificador Qwen3.8-27B.
- Checkpoints intermedios de entrenamiento: no representan el modelo final y su calidad de aceptación puede ser inferior a la de un borrador completamente entrenado.
- Requiere un fork no estándar de vLLM; la versión estándar falla por falta del método `mamba_attn_hybrid`.
- Sin datos publicados de benchmarks, tasas de aceptación ni latencia para este checkpoint concreto.
- Idiomas soportados no disponibles; dependen del verificador.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; heredados en su caso del verificador.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de un fork específico de vLLM condiciona el mantenimiento en producción.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MeganEFlynn/HSpec-Qwen27B-5m5a
- Modelo hermano 4m3a: https://huggingface.co/MeganEFlynn/HSpec-Qwen27B-4m3a-epoch1
- Repositorio de entrenamiento: https://github.com/weifanjiang/speculators-qwen3.8-hspec
- Fork de speculators (rama hspec_qwen_27B): https://github.com/vllm-project/speculators/tree/hspec_qwen_27B
- Fork de vLLM: https://github.com/MeganEFlynn/vllm/tree/hspec_qwen_27B
- Dataset OpenPerfectBlend regenerado: https://huggingface.co/datasets/shanjiaz/OpenPerfectBlend-Qwen38-27B-regenerated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
