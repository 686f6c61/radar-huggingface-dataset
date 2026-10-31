# bubskee/qwen3.5-4b-r-jpp-lenses

## Resumen

Este repositorio no es un modelo generativo en el sentido habitual, sino un artefacto de interpretabilidad: un conjunto de "workspace lenses" (lentes R y J++) aplicadas al decodificador de texto de **Qwen/Qwen3.5-4B**, publicado por el usuario independiente **bubskee**. Su objetivo es permitir leer, capa a capa, qué conceptos del vocabulario están representados en el residual stream del modelo base, como alternativa y complemento al clásico *logit lens*.

Cada lente es una matriz de transporte lineal por capa que proyecta los estados residuales intermedios (de los bloques 0 a 30, de anchura 2560) hacia el espacio de salida del bloque 31, antes de la RMSNorm final y de la LM head atada. La variante J++ mejora la recuperación de conceptos respecto a R y al logit lens, especialmente en tareas multilingües. El release incluye un lector autónomo en Python (compatible con CUDA, MPS de Apple Silicon y CPU), resultados de evaluación congelados y trazabilidad del ajuste.

Es relevante ahora porque la interpretabilidad de modelos híbridos (Qwen3.5-4B combina 24 bloques Gated DeltaNet y 8 de atención completa) es un área activa, y estas herramientas permiten a investigadores auditar neuronas y direcciones de escritura del residual stream sin necesidad del repositorio de entrenamiento original. El modelo base es un decodificador de texto de unos 4B de parámetros con contexto no especificado en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lentes de interpretabilidad (matrices de transporte lineales por capa) sobre Qwen3.5-4B, un decodificador híbrido de 32 bloques (24 Gated DeltaNet + 8 de atención completa) con MLP densas |
| Parametros totales | no disponible (modelo base Qwen3.5-4B, ~4B según denominación; tamaño del repo de lentes: 1,6 GB) |
| Parametros activos | no aplica (no es un MoE; los 8 "expertos" de J++ son clústeres de activaciones, no expertos nativos) |
| Longitud de contexto | no disponible (el lector limita los prompts a 512 tokens) |
| Tipos de cuantizacion | no disponible (la compatibilidad con el modelo base cuantizado no está establecida; se carga en BF16) |
| Idiomas soportados | no disponible (la evaluación incluye una tarea multilingüe de lectura de conceptos) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt` con `torch.load(weights_only=True)` para las matrices de transporte; safetensors para vectores de activación de entrada; modelo base en BF16) |

## Arquitectura y entrenamiento

Las lentes son mapas lineales fijos: una matriz de transporte FP32 por capa fuente (bloques 0 a 30, anchura 2560) que proyecta residuales crudos —sin blanqueamiento ni normalización de entrada— hacia la salida del bloque 31, antes de la RMSNorm final. La cabeza de lectura replica en FP32 la RMSNorm final del modelo (incluido el offset `1 + weight` de Qwen3.5) seguida de la LM head nativa atada. La variante R es un mapa agrupado original; J++ añade una variante con signo que mejora la recuperación de conceptos.

El ajuste de J++ utilizó 64 ítems de calibración y 8 "expertos" que son clústeres de activaciones fuente, no expertos MoE nativos. La evaluación congelada se realizó en una A40 sobre 265 ítems heldout de cinco tareas públicas upstream, disjuntos de la calibración. Las puntuaciones son de *lectura de conceptos*, no de precisión en respuestas generadas. No se trata de un modelo entrenado con RLHF/DPO ni de un fine-tune generativo: el modelo base se descarga por separado y permanece congelado.

## Capacidades

- Lectura de conceptos del residual stream: proyecta estados intermedios al vocabulario completo y muestra los diez tokens principales según logit lens, lente R o lente J++.
- Alineación de vocabulario de direcciones de escritura aisladas: permite inspeccionar un canal MLP denso concreto (tras el gating y antes de `down_proj`) proyectando su columna de `down_proj.weight` a través de cada lente, con ambos signos.
- Lectura de activaciones arbitrarias: acepta un vector de activación capturado (safetensors, forma `[2560]`) y lo interpreta con las lentes.
- Selección de capa y posición: análisis por bloques concretos (`--layers 8 16 24 30`) y por posición de token dentro del prompt (`--position`).
- Lectura multilingüe: recuperación de conceptos semánticos desde prompts no ingleses, frecuentemente mediante etiquetas de token en inglés.
- Interfaz programática en Python: clase `WorkspaceLenses` con métodos `capture`, `transport`, `logits`, `read` y `neuron_direction`.
- No es un modelo de chat: el lector no aplica plantilla de conversación y trabaja con prefijos de completado en crudo.

## Casos de uso

- **Investigación de interpretabilidad mecanicista**: un investigador que estudia qué neuronas de Qwen3.5-4B codifican conceptos puede proyectar direcciones de escritura MLP concretas a través de las lentes y obtener hipótesis de significado semántico por canal, sin entrenar sondas propias.
- **Auditoría de conceptos capa a capa**: al analizar un prompt (por ejemplo, una pregunta de razonamiento simple), se pueden leer los readouts en los bloques 8, 16, 24 y 30 para observar cuándo emerge el concepto de respuesta en el residual stream.
- **Verificación de hipótesis mediante intervenciones causales**: los readouts se presentan explícitamente como hipótesis; el flujo de trabajo recomendado es contrastarlos con ejemplos de máxima activación e intervenciones que cambien el comportamiento del modelo.
- **Análisis multilingüe del modelo base**: las lentes J++ recuperan conceptos de relaciones y conceptos de entrada desde prompts no ingleses (40,7% top-1 filtrado frente a 19,2% del logit lens), útil para estudiar cómo el modelo representa idiomas distintos del inglés.
- **Depuración de activaciones capturadas en otros experimentos**: si ya se ha capturado un vector de activación de 2560 dimensiones con SAEs, patching u otras técnicas, se puede pasar directamente al lector para obtener una lectura de vocabulario.
- **Comparación de métodos de lectura**: el release incluye resultados por capa y por tarea en `evaluation/`, útil como referencia para comparar logit lens, R y J++ en un modelo híbrido Gated DeltaNet/attention.

## Benchmarks y rendimiento

Resultados de evaluación publicados por el autor (265 ítems heldout, cinco tareas upstream, macro-promedio; puntuaciones de lectura de conceptos, no de generación):

| Metrica | Logit lens | R | J++ |
| --- | ---: | ---: | ---: |
| Macro top-1, vocabulario completo | 24,7% | 23,2% | 35,7% |
| Macro top-10, vocabulario completo | 39,0% | 44,1% | 57,2% |
| Macro top-1, filtrado | 24,8% | 27,9% | 38,0% |
| Macro top-10, filtrado | 39,3% | 49,0% | 59,4% |
| Multilingüe top-1, filtrado | 19,2% | 30,2% | 40,7% |
| Multilingüe top-10, filtrado | 33,3% | 56,2% | 76,2% |

Desglose multilingüe por rol de concepto (43 prompts heldout, top-1 filtrado):

| Rol del concepto | R | J++ |
| --- | ---: | ---: |
| Identificador de idioma | 1/42 | 3/42 |
| Relación u operación | 7/43 | 15/43 |
| Concepto de entrada | 6/43 | 12/43 |
| Concepto de respuesta | 38/43 | 40/43 |

Fallos documentados: ambas lentes puntúan cero en top-1 de poesía; J++ obtiene 4,9% en top-1 de asociación; en la tarea de typos en crudo, R logra 36,4%, logit lens 68,8% y J++ 81,8%. R no supera uniformemente al logit lens directo. Buscar en profundidad importa: en el bloque fijo 27, el multilingüe top-1 filtrado cae a 18,6% (R) y 19,8% (J++), frente a 30,2% y 40,7% al explorar las 31 capas.

## Requisitos de hardware

- El lector de lentes es ligero (repo de 1,6 GB) y funciona en CUDA, Apple Silicon MPS y CPU; la prueba de humo empaquetada se ejecutó en MPS. La evaluación original del autor se hizo en una A40.
- El modelo base Qwen3.5-4B se carga en BF16: aproximadamente 8 GB de VRAM o RAM para inferencia del modelo completo; cabe en GPUs de consumo como una RTX 4090 (24 GB) con holgura, y probablemente en GPUs de 12-16 GB.
- No se ha establecido compatibilidad con modelos base cuantizados, por lo que no se recomienda cargar versiones GGUF/AWQ del base.
- Despliegue: no es un modelo servible con vLLM/TGI; el uso es local mediante el script `read_lenses.py` o la clase `WorkspaceLenses` en Python. Requisitos vía `requirements.txt` del release; Python 3.12 fue la versión usada.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Artefacto | Tipo | Modelo base | Licencia | Notas |
|---|---|---|---|---|
| bubskee/qwen3.5-4b-r-jpp-lenses | Lentes R y J++ + lector | Qwen3.5-4B | Apache-2.0 | Incluye evaluación congelada y lector autónomo; J++ supera al logit lens en macro top-1 (35,7% vs 24,7%) |
| Logit lens (implementaciones genéricas) | Técnica de lectura directa | Agnóstico | Variada | Sin matriz de transporte; mejor en la tarea de typos (68,8% top-1) pero peor en multilingüe (19,2%) |
| Tuned Lens (belrose et al.) | Lentes entrenadas con afinador por capa | Varios modelos | Apache-2.0 / MIT | Enfoque relacionado de traducción capa-vocabulario; no disponible una versión publicada para Qwen3.5-4B en la información proporcionada |

## Limitaciones y advertencias

- **Los readouts son hipótesis, no etiquetas causales**: la propia model card advierte que una interpretación de neurona debe validarse con contexto real, contribuciones de otras neuronas e intervenciones causales.
- **Fallos documentados**: cero en top-1 de poesía para ambas lentes, 4,9% de J++ en asociación, y R por detrás del logit lens en la tarea de typos. R no es uniformemente superior a la lectura directa.
- **Sin compatibilidad con cuantización establecida**: solo se ha verificado el modelo base en BF16 nativo.
- **Sin plantilla de chat**: los prompts son prefijos de completado en crudo, con un límite de 512 tokens en el lector.
- **Licencia**: Apache-2.0, sin restricciones conocidas para uso comercial, aunque el modelo base Qwen3.5-4B tiene su propia licencia, no detallada en esta ficha.
- **Modelo experimental**: cero descargas registradas en el momento de la ficha, autor independiente y sin pipeline asociado; conviene tratar los resultados como preliminares.
- **Alucinaciones y sesgos**: no aplicables como modelo generativo, pero cualquier uso del modelo base hereda sus sesgos conocidos, no documentados en esta model card.

## Enlaces

- Repositorio del modelo: https://huggingface.co/bubskee/qwen3.5-4b-r-jpp-lenses
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Autor: https://huggingface.co/bubskee
- Paper, blog o demo: no disponible
