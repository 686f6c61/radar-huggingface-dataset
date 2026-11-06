# adamkarvonen/qwen3.8-27b-nla-L42

## Resumen

Qwen3.8-27B layer-42 Natural Language Autoencoder (NLA) es una herramienta de interpretabilidad mecánica, no un modelo de lenguaje de propósito general. Desarrollada por adamkarvonen, implementa un autoencoder en lenguaje natural para las activaciones del flujo residual de la capa 42 de Qwen/Qwen3.8-27B. Se construye continuando el entrenamiento por refuerzo del NLA previo de Ceselder sobre Qwen3.6-27B, aplicado ahora sobre activaciones de Qwen3.8 durante 100 pasos de optimizador.

El sistema consta de dos componentes acoplados: un verbalizador (AV) que lee una activación de 5120 dimensiones y escribe una explicación en lenguaje natural dentro de etiquetas `<explanation>`, y un reconstructor (AR) que mapea esa explicación de vuelta a una activación del mismo espacio. La calidad se mide mediante FVE (fraction of variance explained) sobre 512 prompts retenidos de FineFineWeb, con un resultado de 69,6 % frente al 65,1 % del NLA original de 3.6 sobre las mismas activaciones.

Es relevante porque el propio autor documenta un hallazgo metodológico importante: la mejora procede del reconstructor, no del verbalizador. El AV ajustado no genera explicaciones mejores que el original (65,2 frente a 65,1 % bajo el AR original), mientras que el AR ajustado sí gana al operar en el espacio de activaciones de Qwen3.8 en lugar del de Qwen3.6. El repositorio ocupa 37,3 GB y se distribuye como adaptadores PEFT (LoRA) junto con los pesos del reconstructor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder en lenguaje natural sobre transformer (Qwen3.8-27B para extraccion de activaciones; AV sobre Qwen3.6-27B con LoRA; AR con primeros 43 bloques y value head) |
| Parametros totales | No disponible (el modelo base Qwen3.8-27B tiene 27B; los adaptadores LoRA y el AR parcial no declaran recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bf16 en la referencia de inferencia) |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA y `value_head.safetensors`) |
| Dimension de activacion | 5120 (flujo residual, capa 42, `hidden_states[43]`) |
| LoRA del verbalizador | r64, alpha 16, rsLoRA, todos los modulos |
| Token de inyeccion | `㈜` (id 158983), tras la capa 1, norma ajustada al residual |
| Temperatura de muestreo | 1 |
| FVE retenido (512 prompts) | 69,6 % |

## Arquitectura y entrenamiento

El NLA es un par de modelos entrenados conjuntamente. El verbalizador es un LoRA (r64, alpha 16, rsLoRA, aplicado a todos los módulos) que se acopla sobre `av_base/` del NLA de Ceselder (Qwen3.6-27B con el LoRA de warm-start fusionado), no sobre Qwen3.8 ni sobre Qwen3.6 limpio. El reconstructor comprende los primeros 43 bloques del modelo con el LoRA fusionado más un `value_head.safetensors`. La activación objetivo es la salida del bloque decodificador 42 de Qwen/Qwen3.8-27B, inyectada en el token marcador `㈜` tras la capa 1 con la norma ajustada al residual, siguiendo el esquema de Karvonen et al.

El entrenamiento continúa el RL del NLA de 3.6 sobre activaciones de Qwen3.8 durante 100 pasos de optimizador. La curva intra-ejecución del par co-entrenado sobre 128 prompts retenidos evoluciona de 65,5 % (paso 0) a 71,0 % (paso 90), con tasa de parseo del 99-100 % y KL respecto al inicio de 0,79-0,88. El análisis de ablación cruzada (cada AV puntuado bajo cada AR) muestra que el AV ajustado apenas aporta (65,2 frente a 65,1 % bajo el AR original) y que el AR co-entrenado es el que concentra la ganancia (69,0 frente a 65,1 % con el AV original). La verificación de release confirma que las activaciones reextraídas coinciden con las de entrenamiento (coseno >= 0,9999 en 16 filas) y que 64/64 explicaciones parsean.

## Capacidades

- Verbalización de activaciones: dado un vector de 5120 dimensiones de la capa 42 de Qwen3.8-27B, genera una explicación textual del contenido semántico de esa activación.
- Reconstrucción de activaciones: dado un texto de explicación, produce un vector de activación en el espacio de Qwen3.8 y calcula la FVE frente al vector original.
- Evaluación cuantitativa de interpretabilidad: permite medir FVE por muestra, con opción de pasar una línea base propia del conjunto de evaluación.
- Muestreo múltiple: soporta `n_samples` para generar varias explicaciones por activación y comparar su FVE individual.
- Extracción de activaciones: utilidad `extract` para obtener activaciones `[T, 5120]` a partir de texto fuente.
- No es un modelo de chat ni de generación general: no se debe usar como LLM de propósito general, tool calling, agentes ni razonamiento multietapa.
- No soporta visión, audio ni thinking mode; de hecho, el modo thinking degrada la salida (la mayoría de respuestas pierden la etiqueta `<explanation>` de apertura).

## Casos de uso

- Auditoría de representaciones internas: extraer la activación de la capa 42 para un prompt concreto y verbalizarla para inspeccionar qué información codifica el modelo en ese punto del flujo residual, útil en estudios de circuitos y features.
- Validación de hipótesis de interpretabilidad: comparar la explicación generada con la predicción esperada del investigador para refutar o confirmar hipótesis sobre el contenido semántico de una dirección de activación.
- Medición de FVE en nuevos conjuntos de evaluación: emplear el AR co-entrenado para reportar FVE sobre activaciones de Qwen3.8 con una línea base propia, tal como recomienda el autor.
- Detección de cambios entre versiones de modelo: usar el NLA como sonda para comparar qué codifica la capa 42 en Qwen3.8 frente a Qwen3.6, aprovechando que el AV original y el ajustado rinden de forma casi idéntica.
- Investigación de seguridad y alineamiento: verbalizar activaciones en puntos concretos de una generación para auditar si el modelo representa conceptos sensibles antes de emitir la respuesta.
- Reproducción de experimentos de NLA: ejecutar `inference.py` y `modal_app.py::release_check` para replicar las cifras publicadas y verificar la integridad del pipeline de extracción e inyección.
- Docencia y formación en interpretabilidad: usar el par AV/AR como ejemplo canónico de autoencoder en lenguaje natural con métrica objetiva (FVE) y ablación cruzada documentada.

## Benchmarks y rendimiento

FVE (%) sobre 512 prompts retenidos de documentos reservados. Línea base: MSE de predecir la media del conjunto de evaluación (0,4414). Cada verbalizador se puntúa bajo cada reconstructor, solo evaluación:

| AV \ AR | AR original 3.6 | Este AR (co-entrenado) | AR entrenado solo (20 pasos) |
|---|---|---|---|
| AV original 3.6 (`iter_000600`) | 65,1 | 69,0 | 68,1 |
| Este AV (co-entrenado) | 65,2 | **69,6** | 68,2 |
| AV entrenado solo, AR congelado (20 pasos) | 65,1 | 68,6 | 67,3 |

Curva intra-ejecución del par co-entrenado (128 prompts retenidos, por paso de optimizador): 0: 65,5; 10: 68,6; 20: 69,7; 40: 70,3; 60: 70,6; 80: 70,9; 90: 71,0 %. Tasa de parseo 99-100 %, KL al inicio 0,79-0,88.

Verificación de release: FVE retenido de 70,7 % en los primeros 64 prompts de evaluación (línea base propia de ese conjunto); el autor advierte que 64 prompts es ruidoso. Las diferencias inferiores a ~0,6 puntos quedan dentro del ruido. La FVE no es comparable entre modelos ni entre conjuntos de evaluación: el 78 % del NLA de 3.6 corresponde a activaciones de Qwen3.6 sobre su propio conjunto.

## Requisitos de hardware

- Memoria en bf16: ~55 GB para Qwen3.8 (extracción de activaciones), ~55 GB para el AV y ~35 GB para el AR. Se cargan de uno en uno, por lo que una única GPU de 80 GB es suficiente.
- GPU recomendadas: A100 80 GB, H100 80 GB o cualquier GPU con >= 80 GB de VRAM para el flujo completo en bf16.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en configuraciones de 48 GB en bf16; no se documentan cuantizaciones alternativas.
- Despliegue: el autor recomienda ejecutar desde el repositorio EasyNLA (`experiments/qwen38_l42/inference.py`), ya que el hook de inyección, la construcción de prompts y la cabeza del AR son los del código de entrenamiento.
- Dependencias críticas: `transformers>=5.5`, `peft`, `flash-linear-attention` y `causal-conv1d` para los kernels rápidos de DeltaNet. Sin ellos, transformers cae a una ruta torch lenta: funciona, pero la generación es lenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Capa | FVE (conjunto propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adamkarvonen/qwen3.8-27b-nla-L42 | Qwen3.8-27B | 42 | 69,6 % (512 prompts, Qwen3.8) | other | Hugging Face, 0 descargas |
| ceselder/qwen3.6-27b-nla-rl | Qwen3.6-27B | No disponible | 78 % (conjunto propio, Qwen3.6) | no disponible | Hugging Face (origen del AV base) |
| NLA de referencia (Transformer Circuits, 2026) | No disponible | No disponible | No disponible | no disponible | Publicación |

La comparación directa solo es válida dentro del mismo conjunto de evaluación y las mismas activaciones: bajo las activaciones de Qwen3.8, el NLA de 3.6 obtiene 65,1 % y este 69,6 %. El 78 % del NLA de 3.6 no es comparable porque se midió sobre activaciones de Qwen3.6 y su propio conjunto.

## Limitaciones y advertencias

- La mejora de FVE procede del reconstructor, no del verbalizador: para leer explicaciones, el AV original de 3.6 rinde igual que el ajustado. No debe presentarse este modelo como un verbalizador superior.
- La FVE no es comparable entre modelos ni entre conjuntos de evaluación; reportar cifras cruzadas induce a error.
- El modo thinking degrada la salida: la mayoría de respuestas pierden la etiqueta `<explanation>` de apertura. Debe usarse `enable_thinking=False`.
- El AV se ejecuta sobre pesos de Qwen3.6 (`av_base` + adaptador), no sobre Qwen3.8; el acoplamiento entre espacios es deliberado y no trivial.
- Sin los kernels `flash-linear-attention` y `causal-conv1d`, la generación es notablemente lenta por la ruta torch de DeltaNet.
- El repositorio tiene 0 descargas y 0 likes, con creación y actualización el mismo día: no hay validación comunitaria independiente.
- La licencia es "other" sin texto visible en la información disponible: es imprescindible revisar los términos antes de cualquier uso comercial o redistribución.
- No se documentan sesgos, idiomas soportados, cuantizaciones ni límites de contexto; no es un modelo de generación de texto para producción.
- Riesgo de alucinación en las explicaciones: el AV puede producir verbalizaciones plausibles que no reflejen fielmente la activación, y la FVE mide reconstrucción, no fidelidad causal.
- Diferencias inferiores a ~0,6 puntos de FVE están dentro del ruido; la cifra de 64 prompts (70,7 %) es explícitamente ruidosa según el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adamkarvonen/qwen3.8-27b-nla-L42
- Modelo base del adaptador: https://huggingface.co/ceselder/qwen3.6-27b-nla-rl
- Repositorio de código (fork): https://github.com/adamkarvonen/EasyNLA
- Repositorio original: https://github.com/ceselder/EasyNLA
- Resultados detallados: https://github.com/adamkarvonen/EasyNLA/blob/main/experiments/qwen38_l42/FINDINGS.md
- Publicación sobre NLA: https://transformer-circuits.pub/2026/nla/
- Modelo de activaciones: https://huggingface.co/Qwen/Qwen3.8-27B
