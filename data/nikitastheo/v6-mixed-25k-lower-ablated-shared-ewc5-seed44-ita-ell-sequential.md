# nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed44-ita-ell-sequential

## Resumen

El modelo `nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed44-ita-ell-sequential` es un modelo de lenguaje causal de pequeno tamano (123,9 millones de parametros) publicado por el usuario nikitastheo en Hugging Face. Se trata de un modelo de investigacion construido sobre una configuracion GPT base y entrenado con un script propio de causal-LM basado en Hugging Face Accelerate, no con el `Trainer` estandar.

El nombre del modelo revela su proposito: parece formar parte de una familia de experimentos de entrenamiento secuencial multilingue, en este caso sobre italiano (`ita`) y griego (`ell`), con tecnicas que el autor etiqueta como "ablated", "shared" y "ewc5" (probablemente Elastic Weight Consolidation con un coeficiente de 5, una tecnica habitual para mitigar el olvido catastrofico en aprendizaje continuo). El tokenizador asociado es `nikitastheo/goldfish-25k-ita-lower-seed44-ablated-tokenizer`, con un vocabulario de 25.000 tokens y normalizacion a minusculas.

La relevancia de este modelo es limitada fuera del ambito de la investigacion en aprendizaje continuo y multilingue: no tiene descargas ni likes, no dispone de model card detallada mas alla de los hiperparametros de entrenamiento y no se han publicado resultados de benchmarks. Es util como artefacto reproducible de un experimento de entrenamiento secuencial con dos idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo GPT (configuracion `gpt_base_config.json`) |
| Parametros totales | 123.886.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion a GGUF no publicada) |
| Idiomas soportados | italiano y griego (inferido del nombre y del tokenizador; no confirmado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal de tipo GPT, definida por el fichero `configurations/gpt_base_config.json` del autor, del que no se dispone del contenido exacto. Con 123,9 millones de parametros encaja en la categoria de modelos GPT pequenos (orden similar a GPT-2 small, 124 M). No se especifica el numero de capas, dimensiones ocultas ni cabezas de atencion en la informacion disponible.

Los detalles de entrenamiento documentados son: 15.750 pasos maximos, learning rate de 1e-4 con scheduler lineal, 1.575 pasos de warmup, batch size de 32 por dispositivo sin acumulacion de gradientes, y un "language switch epoch" en la epoca 10, lo que sugiere un regimen de entrenamiento en dos fases con cambio de idioma a mitad del proceso. El uso de EWC (Elastic Weight Consolidation, con valor 5 segun el nombre) apunta a un escenario de aprendizaje continuo donde se entrena primero un idioma y luego otro intentando preservar el conocimiento del primero. No se detalla el volumen de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de texto causal en italiano y griego (idiomas inferidos del nombre del modelo y del tokenizador asociado).
- Modelo de base para experimentos de aprendizaje continuo y evaluacion de olvido catastrofico.
- Tokenizacion con vocabulario de 25.000 tokens y normalizacion a minusculas (tokenizador `goldfish-25k-ita-lower-seed44-ablated-tokenizer`).
- Compatible con la libreria transformers y con text-generation-inference (segun los tags del repositorio).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en aprendizaje continuo: el modelo sirve como punto de comparacion para estudiar el olvido catastrofico al entrenar secuencialmente italiano y griego, gracias a la configuracion EWC documentada en el nombre y los hiperparametros publicados.
- Reproducibilidad de experimentos: al estar entrenado con un script concreto (`train_clm.py`) y parametros documentados (pasos, LR, warmup, batch), permite replicar el pipeline de entrenamiento en entornos con Accelerate.
- Evaluacion de tokenizadores multilingues: el tokenizador de 25.000 tokens con normalizacion a minusculas puede analizarse para medir eficiencia de tokenizacion en italiano y griego frente a tokenizadores multilingues mayores.
- Generacion de texto de baja latencia en prototipos: con 124 M de parametros el modelo es ligero y puede ejecutarse en CPU o GPU de consumo para pruebas de generacion en italiano o griego.
- Estudio de tecnicas de regularizacion: comparar el efecto de EWC con coeficiente 5 frente a otras variantes de la familia (por ejemplo, las versiones con `eus` o `gla` encontradas en la busqueda) para analizar la retencion de conocimiento entre idiomas.
- Base para fine-tuning posterior: al ser un modelo pequeno y con pesos en safetensors, puede servir como inicializacion para tareas downstream en italiano o griego en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos (123,9 M de parametros x 4 bytes), mas overhead de activaciones y contexto.
- VRAM estimada en fp16/bf16: en torno a 0,25 GB para los pesos.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para inferencia por lotes pequenos.
- Despliegue posible con transformers, text-generation-inference (segun tags) y, previsiblemente, llama.cpp u Ollama si se generan pesos GGUF, aunque no se han publicado conversiones.
- No se dispone de datos de latencia ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed44-ita-ell-sequential | 123,9 M | no disponible | no disponible | Hugging Face, 0 descargas |
| nikitastheo/v6-mixed-25k-lower-shared-ewc5-seed44-eus-ell-sequential | ~0,1 B | no disponible | no disponible | Hugging Face |
| nikitastheo/v6-mixed-25k-lower-shared-ewc5-gla-ell-sequential | no disponible | no disponible | no disponible | Hugging Face |
| GPT-2 small (referencia de tamano) | 124 M | 1.024 tokens | MIT | Ampliamente disponible |

Las variantes de la misma familia comparten el esquema de entrenamiento secuencial con griego (`ell`) como segundo idioma, diferenciandose en el primer idioma (`ita`, `eus`, `gla`) y en la tecnica de regularizacion. No se dispone de datos de rendimiento para ninguna de ellas.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos; al entrenarse en un corpus no documentado, el riesgo de sesgos linguisticos y culturales es desconocido.
- Riesgo de alucinacion elevado por el reducido tamano del modelo y la ausencia de ajuste por RLHF documentado.
- La longitud de contexto no esta especificada, lo que impide planificar su uso en tareas de contexto largo.
- La licencia no esta disponible: no puede asumirse uso comercial sin consultar al autor.
- El modelo parece un artefacto de investigacion sin validacion externa (0 descargas, 0 likes), por lo que no es recomendable para produccion.
- La informacion sobre idiomas es inferida del nombre y del tokenizador, no confirmada en la model card.
- El entrenamiento secuencial con EWC puede dejar un rendimiento desigual entre el primer y el segundo idioma; no hay evaluaciones que lo cuantifiquen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed44-ita-ell-sequential
- Variante con euskera: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-shared-ewc5-seed44-eus-ell-sequential
- Variante con gallego: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-shared-ewc5-gla-ell-sequential
