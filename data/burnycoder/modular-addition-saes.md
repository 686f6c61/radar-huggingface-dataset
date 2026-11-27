# BurnyCoder/modular-addition-saes

## Resumen

`BurnyCoder/modular-addition-saes` no es un modelo generativo al uso, sino un repositorio de artefactos de interpretabilidad mecánica: una red transformer de una sola capa entrenada para la tarea de suma modular (p = 113) y un conjunto de autoencoders dispersos (SAE) entrenados sobre sus activaciones internas. Lo publica Libor "Burny" Burian bajo licencia MIT, y todo el proyecto asociado (resultados, prerregistro y paper) vive en el repositorio de GitHub `sparse-autoencoders-on-modular-addition-transformer`. El transformer base replica la receta del conocido trabajo de Nanda et al. (2023) sobre *grokking* en suma modular, y los SAE se entrenan con la librería SAELens sobre las activaciones de la última posición (`=`) en los hooks `resid_mid` (entrada del MLP) y `mlp_post`.

El interés del artefacto es de investigación: sirve para estudiar cómo un modelo pequeño desarrolla un mecanismo de Fourier durante el *grokking* y si los SAE recuperan features alineadas con ese mecanismo. El repositorio incluye, además de los pesos, métricas de calidad de los SAE (FVU de test, FVU del logit, L0, fracción de features muertas, precisión y KL tras *splicing*), análisis de caracterización de features contra el mecanismo y resultados de *steering*.

Conviene subrayar que no es un modelo de lenguaje: no genera texto, no tiene tokenizador de lenguaje natural, no soporta tool calling y su ventana de contexto es la longitud de secuencia de la tarea (`a + b = c` con operandos módulo 113). Cualquier uso previsto debe enmarcarse en interpretabilidad mecanicista, docencia o reproducción de experimentos, no en despliegue de producto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de 1 capa (atención multi-cabeza + MLP) sin LayerNorm y con sesgos congelados a 0, según la receta TransformerLens 4 de Nanda et al. 2023 |
| Parámetros totales | No disponible de forma explícita; con p = 113, d_model = 128, 4 cabezas y d_mlp = 512, el orden de magnitud es de ~10^5 parámetros |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; la tarea es de secuencia fija corta del tipo `a + b =` con operandos módulo 113 |
| Tipos de cuantización | No disponible (pesos en `model.pt` y `sae_weights.safetensors`; no se documentan cuantizaciones) |
| Idiomas soportados | No aplica (tarea aritmética sintética, sin lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (PyTorch) para el transformer base; `sae_weights.safetensors` + `cfg.json` para los SAE (formato SAELens) |

## Arquitectura y entrenamiento

El transformer base sigue la receta del demo de TransformerLens 4 descrita por Nanda et al. (2023): p = 113, `d_model` = 128, 4 cabezas de atención, `d_mlp` = 512, activación ReLU, sin LayerNorm y sesgos congelados a 0. Se entrena con AdamW (lr 1e-3, weight decay 1), batch completo, durante 40 000 épocas, sobre una partición de entrenamiento del 30 % de todos los pares posibles (semilla de datos 598). El repositorio guarda además `checkpoints.pt` con un *state dict* cada 100 épocas, `training.json` con las curvas de entrenamiento y `mechanism.json` con el análisis del mecanismo de Fourier, lo que permite reproducir la transición de *grokking* paso a paso.

Los SAE se entrenan con SAELens sobre las activaciones de la última posición (`=`) en `resid_mid` (entrada del MLP) o `mlp_post`. Los SAE BatchTopK se guardan como JumpReLU con umbral global. Cada carpeta de SAE incluye `metrics.json` (FVU de test del SAE, FVU del logit, L0, fracción de features muertas, precisión y KL tras *splicing*), y, cuando se han calculado, `characterization.json` (features puntuadas contra el mecanismo de Fourier) y `steering.json`. La nota técnica del autor advierte de que en TransformerLens 4 el alias `blocks.0.hook_resid_mid` solo alimenta la rama del MLP; para sustituir todo el *residual stream* hay que sobrescribir `blocks.0.hook_attn_out`.

## Capacidades

- Ejecución de la tarea de suma modular con p = 113 (predicción del resultado de `a + b mod 113`).
- Desarrollo demostrable del mecanismo de Fourier durante el entrenamiento (curvas y análisis en `mechanism.json`).
- Extracción de activaciones internas en los hooks `resid_mid` y `mlp_post` para análisis de circuitos.
- Entrenamiento y evaluación de SAE (BatchTopK guardados como JumpReLU) con SAELens.
- Caracterización de features de SAE contra el mecanismo conocido del modelo.
- Intervenciones de *steering* sobre activaciones (resultados en `steering.json`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso genérico, visión, audio ni capacidades multilingües.

## Casos de uso

- Reproducción del experimento de *grokking*: cargar `base/<run>/model.pt` y los checkpoints cada 100 épocas para trazar la aparición del mecanismo de Fourier y comparar curvas de pérdida y precisión con las de Nanda et al. (2023).
- Estudio de SAE sobre circuitos conocidos: entrenar o cargar SAE en `resid_mid` y `mlp_post` y medir si las features recuperadas se alinean con las direcciones de Fourier del mecanismo, usando `characterization.json` como referencia.
- Evaluación comparativa de hiperparámetros de SAE (BatchTopK con distintos `m` y `k`) sobre una tarea con *ground truth* mecanístico, midiendo FVU de test, L0 y fracción de features muertas.
- Docencia de interpretabilidad mecanicista: el modelo es lo bastante pequeño para entrenarse en CPU y los SAE caben en memoria, lo que permite montar prácticas de análisis de circuitos sin infraestructura GPU.
- Análisis de *splicing* y fidelidad: usar las métricas de precisión y KL tras *splicing* para estudiar hasta qué punto la reconstrucción del SAE preserva el comportamiento del modelo original.
- Intervenciones de *steering* controladas: aplicar direcciones de features sobre `hook_attn_out` (según la nota del autor) y medir el efecto en la precisión de la suma modular, con resultados de referencia en `steering.json`.
- Validación de pipelines de SAELens: usar este repositorio como *fixture* de integración para comprobar que una versión de SAELens carga correctamente SAE guardados como JumpReLU con umbral global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye métricas internas de los SAE (`metrics.json`: FVU de test, FVU del logit, L0, fracción de features muertas, precisión y KL tras *splicing*), pero sus valores concretos no se detallan en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,4 GB) y el orden de magnitud de parámetros (~10^5), el modelo y los SAE caben holgadamente en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte PyTorch es suficiente. Para entrenamiento del transformer base (40 000 épocas a batch completo) una GPU consumer acelera notablemente el proceso, aunque el autor no documenta requisitos.
- Cabe en GPU consumer: sí, con margen amplio; también en CPU (el ejemplo de carga de la model card usa `device="cpu"`).
- Opciones de despliegue: PyTorch + TransformerLens 4 para el modelo base, SAELens para los SAE. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de artefacto).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `BurnyCoder/modular-addition-saes` | ~10^5 (estimado) | Secuencia fija corta | Suma modular (p = 113) + SAE | MIT | Hugging Face + GitHub |
| Nanda et al. 2023 (receta original) | Similar (misma arquitectura) | Secuencia fija corta | Suma modular (p = 113) | No disponible | Código en repositorios de investigación |
| SAE de Anthropic / OpenAI sobre modelos de lenguaje | Depende del modelo base | Depende del modelo base | Interpretabilidad en LM | Varía | Varía |

No se dispone de datos de rendimiento comparables publicados en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto natural ni mantiene conversaciones; cualquier expectativa de generación de texto es incorrecta.
- Dominio restringido: solo resuelve sumas módulo 113; no generaliza a otras tareas aritméticas ni a otros módulos sin reentrenamiento.
- Sesgos conocidos: no aplica en el sentido habitual de sesgos sociales, pero el modelo puede exhibir dependencias espurias derivadas de la partición del 30 % de entrenamiento (semilla 598).
- Riesgo de alucinación: no aplica en el sentido de generación de texto; sí puede producir predicciones incorrectas fuera de la distribución de entrenamiento.
- Restricciones de licencia: MIT permite uso comercial, pero el artefacto no tiene aplicación comercial directa; conviene citar el trabajo original de Nanda et al. (2023) y el repositorio del autor.
- Caveat técnico importante: en TransformerLens 4, `blocks.0.hook_resid_mid` solo alimenta la rama del MLP; para intervenir sobre todo el *residual stream* hay que usar `blocks.0.hook_attn_out`.
- Los SAE BatchTopK se guardan como JumpReLU con umbral global, lo que puede afectar a la reproducibilidad exacta de métricas si se comparan con implementaciones BatchTopK nativas.
- No se documentan cuantizaciones ni formatos alternativos de pesos; el despliegue está atado a PyTorch y SAELens.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/modular-addition-saes
- Repositorio del proyecto: https://github.com/BurnyCoder/sparse-autoencoders-on-modular-addition-transformer
- Paper de referencia (Nanda et al. 2023): https://arxiv.org/abs/2301.05217
- TransformerLens: https://github.com/TransformerLensOrg/TransformerLens
- SAELens: https://github.com/saprmarks/SAELens
