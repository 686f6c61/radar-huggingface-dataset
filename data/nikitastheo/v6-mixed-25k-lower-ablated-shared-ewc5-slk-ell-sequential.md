# nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-slk-ell-sequential

## Resumen

El modelo `nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-slk-ell-sequential` es un modelo de lenguaje causal de pequeno tamano (123.886.080 parametros, aproximadamente 124 millones) desarrollado por el usuario nikitastheo y publicado en Hugging Face. Se trata de un experimento de investigacion mas que de un modelo listo para produccion: el nombre codifica un conjunto de decisiones de entrenamiento (vocabulario de 25k tokens, tokenizer "lower-ablated", regularizacion EWC con factor 5, entrenamiento secuencial multilingue) que apuntan a un estudio sobre olvido catastrofico y cambio de idioma durante el entrenamiento.

La arquitectura es GPT-2 (`gpt2` en los tags y `configurations/gpt_base_config.json` como configuracion base), con pesos en formato safetensors y compatibilidad con transformers y text-generation-inference. El entrenamiento se realizo con un script propio basado en Hugging Face Accelerate (`train_clm.py`, sin `Trainer`), con 15.720 pasos, learning rate de 1e-4, scheduler lineal y un total de 32 secuencias por paso.

La relevancia de este modelo es limitada fuera del contexto de investigacion: no tiene descargas ni likes, no declara licencia ni idiomas soportados, y su model card no incluye resultados de evaluacion. Es util como referencia para quienes estudian estrategias de entrenamiento secuencial por idiomas (el campo "language switch epoch: 10" sugiere un cambio de idioma en el paso 10 del entrenamiento) y regularizacion tipo Elastic Weight Consolidation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo GPT-2 (configuracion `gpt_base_config.json`) |
| Parametros totales | 123.886.080 (~124 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (el nombre sugiere entrenamiento secuencial con cambio de idioma, posiblemente griego "ell" y esloveno "slk", pero no se confirma) |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 0,5 GB) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal estandar de tipo GPT-2, definida en `configurations/gpt_base_config.json` (no se publica el detalle de capas, dimensiones ocultas ni cabezas de atencion en la informacion disponible). Con 123,9 millones de parametros encaja en la familia de modelos tipo GPT-2 small/medium, adecuados para experimentacion en una sola GPU. El tokenizer es propio: `nikitastheo/goldfish-25k-slk-lower-ablated-tokenizer`, con un vocabulario de aproximadamente 25.000 tokens y un preprocesado "lower-ablated" (minusculas con ablacion de ciertos caracteres o categorias, segun la nomenclatura del autor).

El entrenamiento se llevo a cabo con `train_clm.py`, un script de lenguaje causal basado en Hugging Face Accelerate que evita el `Trainer` estandar. Los hiperparametros documentados son: 15.720 pasos maximos, learning rate 1e-4, scheduler lineal con 1.572 pasos de warmup, batch size de 32 por dispositivo sin acumulacion de gradientes (batch total 32). El nombre del modelo indica el uso de regularizacion EWC (Elastic Weight Consolidation) con coeficiente 5 y un regimen "sequential" con un "language switch epoch" en el paso 10, lo que sugiere un entrenamiento por fases con cambio de idioma y proteccion de pesos frente al olvido catastrofico. No se especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto causal autoregresiva, la unica capacidad declarada en el pipeline (`text-generation`).
- Compatibilidad con `text-generation-inference` y endpoints compatibles, segun los tags del repositorio.
- Integracion con la libreria `transformers` y carga directa desde safetensors.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no confirmadas; el nombre del modelo sugiere entrenamiento secuencial con varios idiomas, pero la model card no lo especifica.
- No se documentan modos especiales (thinking, vision, audio) ni capacidades de codigo o matematicas verificadas.

## Casos de uso

- Investigacion sobre olvido catastrofico: el modelo sirve como artefacto de estudio para reproducir experimentos de entrenamiento secuencial con EWC, comparando su comportamiento con las variantes `eng-ell-sequential` y `ell-ell-sequential` del mismo autor.
- Experimentos de tokenizacion: permite evaluar el impacto de un tokenizer de 25k tokens con preprocesado "lower-ablated" frente a tokenizers BPE estandar en tareas de generacion de texto a pequena escala.
- Prototipado rapido en local: con ~124 M de parametros y 0,5 GB de pesos, se puede cargar en una GPU de consumo para probar pipelines de `transformers` o `text-generation-inference` sin infraestructura dedicada.
- Docencia y formacion: util como ejemplo minimo de script de entrenamiento con Accelerate (`train_clm.py`) y de publicacion de modelos en Hugging Face.
- Pruebas de integracion de TGI: al ser compatible con text-generation-inference, sirve para validar despliegues de endpoints de generacion de texto en entornos de prueba.
- Baseline de comparacion: puede actuar como referencia de baja capacidad en estudios que midan el efecto de la regularizacion EWC o del cambio de idioma en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos mas overhead de activaciones y cache KV; en la practica, menos de 2 GB para contextos cortos.
- VRAM estimada en fp16/bf16: alrededor de 0,25 GB de pesos; cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3060, RTX 4090); tambien es viable en CPU para pruebas.
- Cabe en GPU de consumo: si, en todas las GPU modernas de NVIDIA, AMD o Apple Silicon con memoria unificada.
- Opciones de despliegue: `transformers` (carga directa), `text-generation-inference` (tag `text-generation-inference` y `endpoints_compatible`); no se documentan pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion manual.
- Latencia y throughput estimados: no disponibles; por el tamano, se espera un throughput alto en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-slk-ell-sequential | ~124 M | No disponible | No disponible | Hugging Face (0 descargas) |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT | Hugging Face, ampliamente usado |
| GPT-2 medium (OpenAI) | 355 M | 1.024 tokens | MIT | Hugging Face |
| Modelos comparables del mismo autor (`v6-mixed-25k-lower-shared-ewc5-eng-ell-sequential`, `v6-mixed-25k-lower-ewc5-ell-ell-sequential`) | ~124 M (presumiblemente) | No disponible | No disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con GPT-2 small o medium; la comparacion se limita a tamano, licencia y disponibilidad.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda sin autorizacion explicita y debe consultarse con el autor.
- No se documentan los idiomas soportados ni la composicion del dataset de entrenamiento, lo que impide evaluar sesgos linguisticos o culturales.
- Riesgo de alucinacion alto esperable por el tamano (~124 M) y la ausencia de evaluacion publicada; no hay datos que lo cuantifiquen.
- La longitud de contexto no esta documentada; asumir contextos cortos (tipicos de GPT-2, 1.024 tokens) hasta confirmacion.
- Modelo experimental sin descargas ni validacion de la comunidad; no recomendado para produccion sin evaluacion propia.
- El nombre codifica decisiones de entrenamiento poco convencionales (EWC, cambio de idioma secuencial), lo que puede producir comportamientos atipicos en generacion.
- No hay pesos cuantizados publicados; el despliegue en llama.cpp u Ollama requiere conversion y validacion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-slk-ell-sequential
- Variante relacionada (eng-ell-sequential): https://huggingface.co/nikitastheo/v6-mixed-25k-lower-shared-ewc5-eng-ell-sequential
- Variante relacionada (ell-ell-sequential): https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ewc5-ell-ell-sequential
- Tokenizer: https://huggingface.co/nikitastheo/goldfish-25k-slk-lower-ablated-tokenizer
