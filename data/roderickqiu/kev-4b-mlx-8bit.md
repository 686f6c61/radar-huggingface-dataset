# RoderickQiu/kev-4b-mlx-8bit

## Resumen

kev-4b-mlx-8bit es una cuantización de 8 bits en formato MLX del modelo Kev-4B de Jared Palmer, publicada por RoderickQiu para ejecutarse en Apple Silicon. Kev-4B no es un modelo generativo al uso: es un clasificador de decisiones tipadas ("typed decisions") construido a partir de Qwen3.5-4B-Base mediante un adaptador LoRA fusionado más una cabeza de puntero ("pointer head") que produce una distribución sobre respuestas candidatas. Este repositorio empaqueta ese resultado en un único artefacto listo para usar con mlx-lm, evitando al usuario el proceso de descarga del base en bf16 (8,7 GB), fusión del adaptador y cuantización posterior.

El modelo cuenta con 4.205.751.296 parámetros totales y se distribuye bajo licencia Apache-2.0. Su propósito declarado es servir de motor de clasificación dentro de Qualm, una aplicación de macOS que distingue una clase magistral de un feed de contenido, aunque la arquitectura subyacente (Qwen3.5) permite reutilizarlo para otras tareas de decisión con etiquetas predefinidas.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización no oficial que reduce el peso en disco de 9,0 GB a 4,5 GB y el pico de memoria en inferencia de unos 10 GB a unos 6,6 GB, con una degradación de precisión prácticamente nula en los conjuntos de desarrollo evaluados; por otro, ilustra un patrón de despliegue (LoRA fusionado + cabeza de clasificación + cuantización MLX) que puede replicarse para otros modelos pequeños en equipos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B-Base) con adaptador LoRA fusionado y cabeza de puntero para clasificación |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, group size 64 (MLX); el repositorio base admite bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (mlx-lm) + head.pt (cabeza en fp32) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3.5-4B-Base, un transformer denso de aproximadamente 4.200 millones de parámetros. Sobre él, Kev-4B aplica un adaptador LoRA entrenado por Jared Palmer y una cabeza de puntero que transforma las representaciones del modelo en una distribución de probabilidad sobre un conjunto de respuestas candidatas, con una temperatura de calibración ajustada (2,406 en `head.pt`, 2,41 en la revisión del modelo). No se trata, por tanto, de un modelo de generación libre, sino de un clasificador que puntúa opciones predefinidas.

El proceso de construcción de esta cuantización está documentado con precisión en la model card: se cargó el base en bf16 con mlx-lm, se fusionó el adaptador LoRA en fp32 sobre CPU mediante `kev.mlx_model.merge_lora` (W + B·A·α/r) con un único redondeo a bf16, y después se aplicó `mlx.nn.quantize` con `bits=8, group_size=64` a todas las capas Linear y Embedding cuya anchura de entrada es divisible por 64. La cabeza de puntero se mantuvo en fp32, incluida la temperatura ajustada, y no se reentrenó ningún componente. El fichero `model.safetensors` resultante ocupa 4.469.640.165 bytes (SHA-256 `83adf34ef8f2433166225960d0f074def35d3de52449fa8861bc356398312d31`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original; la model card de esta cuantización no los detalla y remite a la documentación de Kev como referencia.

## Capacidades

- Clasificación de decisiones tipadas: dado un contexto y un conjunto de opciones, el modelo produce una distribución de probabilidad calibrada sobre ellas.
- Puntuación con calibración explícita: la cabeza incluye temperatura ajustada, lo que permite usar las probabilidades directamente (el ECE reportado en decision-v7 es de 0,01).
- Discriminación entre contenido de distinta naturaleza, como clases magistrales frente a feeds de contenido, según el caso de uso declarado por el autor de la cuantización.
- Ejecución en Apple Silicon mediante MLX, con integración en mlx-lm.
- No se documentan capacidades de generación de texto libre, tool calling, razonamiento multi-paso, visión ni audio en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Filtrado de contenido en aplicaciones de lectura o vídeo: el modelo puntúa si un elemento entrante es una clase magistral o un feed, que es exactamente el uso para el que se construyó Qualm; la calibración permite fijar umbrales de confianza sin reentrenar.
- Enrutamiento de consultas en asistentes: dado un conjunto de intenciones predefinidas, el modelo asigna probabilidades a cada una y permite derivar la consulta al módulo adecuado con un umbral de abstención basado en la incertidumbre.
- Moderación asistida: clasificación de textos candidatos contra políticas predefinidas, aprovechando el bajo ECE para reducir falsos positivos en la frontera de decisión.
- Etiquetado semi-automático de datasets: uso del modelo para preetiquetar ejemplos con puntuaciones de confianza, revisando manualmente solo los casos de baja probabilidad.
- Clasificación de documentos técnicos: la suite documents-v1 (0,896 de accuracy) sugiere utilidad para decidir la categoría de un documento dentro de un pipeline de ingestión.
- Despliegue local en portátiles Mac: con unos 6,6 GB de memoria en inferencia y 4,5 GB en disco, cabe en equipos de 16 GB o más y permite clasificación sin conexión ni coste de API.
- Evaluación de decisiones en herramientas de desarrollo: la suite devtools-v1 (0,746 de accuracy) indica un rendimiento moderado, adecuado para asistentes que sugieren acciones pero no para decisiones autónomas críticas.

## Benchmarks y rendimiento

Resultados declarados por el autor de la cuantización sobre splits de desarrollo, comparando esta versión de 8 bits con la ruta MLX en bf16 de Kev, en el mismo Mac. La accuracy y el Brier se presentan como pares; la columna "misma respuesta top" indica coincidencia de la opción más probable.

| Suite | Preguntas | bf16 (accuracy / Brier) | 8 bits (accuracy / Brier) | Misma respuesta top |
|---|---:|---|---|---:|
| transfer-v4 | 656 | 0,817 / 0,243 | 0,817 / 0,243 | 652 / 656 |
| decision-v7 | 1.264 | 0,873 / 0,183 | 0,873 / 0,183 | 1.262 / 1.264 |
| hard-v1 | 1.083 | 0,787 / 0,311 | 0,786 / 0,313 | 1.076 / 1.083 |
| devtools-v1 | 1.074 | 0,738 / 0,358 | 0,746 / 0,357 | 1.064 / 1.073 |
| documents-v1 | 920 | 0,893 / 0,173 | 0,896 / 0,173 | 918 / 920 |

En decision-v7 el autor reporta además un ECE de 0,01 para la versión de 8 bits. Los intervalos de confianza pareados al 95 % de `kev.compare` incluyen cero para accuracy, Brier y NLL en transfer-v4 y decision-v7; en hard-v1 el intervalo de accuracy incluye cero pero los de Brier y NLL no (esta versión es ligeramente peor, en torno a +0,002 Brier y +0,003 NLL); en devtools-v1 el intervalo de accuracy excluye cero a favor de esta versión (+0,007); en documents-v1 el intervalo de accuracy roza cero y los de Brier y NLL incluyen cero. Los resultados locales en bf16 coinciden con la model card de Kev-4B en transfer-v4 (0,817) y decision-v7 (0,873), y están a menos de 0,002 en las otras tres suites. Se trata de splits de desarrollo; el conjunto bloqueado de test no se detalla en la información disponible.

## Requisitos de hardware

- Memoria en inferencia: unos 6,6 GB según el autor (frente a unos 10 GB en bf16); el proceso de 8 bits alcanzó 8,5 GB durante la suite más larga.
- Peso en disco: 4,5 GB para esta cuantización; construirla desde cero requiere descargar 9,0 GB (base más adaptador) y un pico de unos 15 GB durante la fusión y cuantización.
- Hardware medido: M5 Pro con 24 GB y macOS 27. No se han publicado mediciones en otros chips.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos 16 GB de memoria unificada; no aplica a GPU NVIDIA, ya que el formato es MLX.
- Despliegue: mlx-lm (formato nativo del repositorio); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| kev-4b-mlx-8bit | 4.205.751.296 | no disponible | MLX safetensors 8 bits | Apache-2.0 | Cuantización no oficial de Kev-4B para Apple Silicon |
| jaredpalmer/kev-4b | ~4.200 millones (base Qwen3.5-4B) | no disponible | LoRA + cabeza, base bf16 | Apache-2.0 (según este repositorio) | Modelo de referencia; requiere fusión y cuantización manual |
| Qwen/Qwen3.5-4B-Base | ~4.200 millones | no disponible | safetensors | no disponible en la información | Modelo base generativo sobre el que se entrena Kev; no incluye la cabeza de clasificación |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- No es una versión oficial de Kev: la publica un tercero (RoderickQiu) y la referencia normativa es el repositorio y la model card de Jared Palmer.
- El modelo es un clasificador de opciones predefinidas, no un generador de texto libre; usarlo fuera de ese esquema requiere adaptar la cabeza de puntero.
- Los benchmarks proceden de splits de desarrollo y están declarados por el autor sin verificación independiente (`verified: false` en el model-index).
- La evaluación se realizó en un único equipo (M5 Pro, 24 GB, macOS 27); el comportamiento en otros chips Apple o versiones de MLX no está documentado.
- No se documentan sesgos, composición del dataset de entrenamiento ni idiomas soportados, lo que dificulta evaluar riesgos de equidad y cobertura lingüística.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración deficiente fuera de las distribuciones de las suites evaluadas; el ECE de 0,01 corresponde solo a decision-v7.
- La licencia Apache-2.0 permite uso comercial, pero al derivar de Qwen3.5-4B-Base conviene verificar las condiciones del modelo base antes de desplegar en producción.
- El formato MLX limita el despliegue a Apple Silicon; no hay artefactos GGUF ni compatibilidad con stacks CUDA en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RoderickQiu/kev-4b-mlx-8bit
- Modelo base Kev-4B: https://huggingface.co/jaredpalmer/kev-4b
- Modelo base Qwen3.5-4B-Base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Aplicación Qualm: https://github.com/RoderickQiu/qualm
- Issue con los intervalos pareados: https://github.com/jaredpalmer/kev/issues/162
