# francesca9805/eus-100mb-after-wc-zipf-newlex-after-ckpt500-packed-bfdiso_seed10

## Resumen

El modelo `eus-100mb-after-wc-zipf-newlex-after-ckpt500-packed-bfdiso_seed10` es un ajuste fino (SFT) del modelo base `francesca9805/ppt-wc-zipf-newlex-eus-after-100mb-packed-bfdiso_seed10`, desarrollado por el usuario de Hugging Face francesca9805. Se trata de un modelo de generacion de texto de arquitectura GPT-2 con 124,77 millones de parametros, entrenado con la libreria TRL (version 0.23.0) sobre Transformers 4.56.2 y PyTorch 2.11.0. El nombre del modelo sugiere un trabajo experimental sobre tokenizacion y modelos de lenguaje en euskera (prefijo `eus`), con un corpus de aproximadamente 100 MB y tecnicas de empaquetado de secuencias (`packed`) y posiblemente decodificacion especulativa o atencion con sesgo (`bfdiso`).

El modelo es relevante en el contexto de la investigacion sobre modelos de lenguaje de bajo coste computacional y lenguas de bajos recursos, como el euskera. Su tamano reducido (124M de parametros) lo hace adecuado para experimentacion, despliegue en hardware modesto y estudios de tokenizacion, aunque su utilidad en produccion es limitada debido a su escala y a la ausencia de documentacion detallada sobre datos de entrenamiento, licencia y evaluacion.

La model card es minima y generada automaticamente por TRL, sin informacion sobre composicion del dataset, hiperparametros, resultados de evaluacion ni restricciones de uso. Esto limita significativamente la evaluacion rigurosa del modelo, que debe considerarse como un artefacto de investigacion experimental mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prefijo `eus` sugiere euskera, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repo | 15,5 GB |
| Libreria | transformers |
| Framework de entrenamiento | TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Metodo de entrenamiento | SFT (supervised fine-tuning) |
| Modelo base | francesca9805/ppt-wc-zipf-newlex-eus-after-100mb-packed-bfdiso_seed10 |
| Pipeline | text-generation |
| Descargas | 546 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es GPT-2, un transformer decoder-only con atencion causal completa, tal como indica la etiqueta `gpt2` en el repositorio. El modelo cuenta con 124.770.816 parametros, lo que coincide con la configuracion estandar de GPT-2 small (124M). No se dispone de informacion sobre el numero de capas, dimensiones ocultas o cabezas de atencion en la informacion proporcionada, aunque por el conteo de parametros se corresponde con la variante small.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL, partiendo del modelo `ppt-wc-zipf-newlex-eus-after-100mb-packed-bfdiso_seed10`. El nombre del modelo base y del ajuste sugiere un pipeline experimental que incluye: un corpus de aproximadamente 100 MB (`100mb`), empaquetado de secuencias (`packed`), un tokenizador o preprocesamiento relacionado con la ley de Zipf y nuevo lexico (`wc-zipf-newlex`), y posiblemente un esquema de decodificacion o atencion denominado `bfdiso` con una semilla (`seed10`). No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. La unica innovacion tecnica documentada es el uso de SFT con TRL y el empaquetado de secuencias, practica habitual para mejorar la eficiencia del entrenamiento en contextos cortos.

No hay informacion sobre el tokenizador utilizado, la longitud de contexto efectiva ni las tecnicas de optimizacion aplicadas. El enlace a Weights & Biases (run `rjvsskfb` del proyecto `new-tokenizers` de la Universidad de Groningen) sugiere que el trabajo se enmarca en investigacion academica sobre tokenizadores.

## Capacidades

- Generacion de texto autoregresiva basica, heredada de la arquitectura GPT-2.
- Ajuste fino supervisado (SFT) sobre el modelo base, orientado presumiblemente a instrucciones o dialogos, aunque no se documenta el formato.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; el prefijo `eus` sugiere orientacion al euskera, sin confirmacion.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Integracion con text-generation-inference y endpoints compatibles segun las etiquetas del repositorio.

## Casos de uso

- Investigacion sobre tokenizacion en euskera: el modelo puede utilizarse como banco de pruebas para evaluar el impacto de distintas estrategias de tokenizacion (Zipf, nuevo lexico) en la calidad de generacion en una lengua de bajos recursos, dado su bajo coste de entrenamiento e inferencia.
- Experimentacion academica con SFT: sirve para reproducir y comparar pipelines de ajuste fino con TRL sobre GPT-2 small, incluyendo el empaquetado de secuencias y la seleccion de checkpoints (el nombre indica `ckpt500`).
- Generacion de texto controlada en entornos de laboratorio: con 124M de parametros, puede ejecutarse en CPU o GPU consumer para generar texto de prueba en experimentos de evaluacion de sesgos o de calidad linguistica.
- Prototipado rapido de pipelines de text-generation: la model card incluye un ejemplo con `pipeline("text-generation", ...)` que permite integrar el modelo en prototipos de Hugging Face con minimo esfuerzo.
- Docencia y formacion: adecuado para demostrar el ciclo completo de ajuste fino de un transformer pequeno, desde el modelo base hasta el checkpoint final, con trazabilidad en Weights & Biases.
- Evaluacion de la viabilidad de modelos pequenos para lenguas minoritarias: permite medir hasta que punto 124M de parametros y ~100 MB de datos pueden producir texto coherente en euskera, como paso previo a escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos (124,77M parametros x 4 bytes), mas overhead de activaciones y cache KV; en la practica, menos de 2 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,25 GB para los pesos; inferior a 1,5 GB con overhead.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,13 GB para los pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo esta sobredimensionado para estas ultimas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM; tambien en CPU.
- Opciones de despliegue: transformers (pipeline), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles; no se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI mas alla de las etiquetas.
- Latencia y throughput estimados: no disponibles; por el tamano, se espera un throughput alto en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| eus-100mb-after-wc-zipf-newlex-after-ckpt500-packed-bfdiso_seed10 | 124,77M | no disponible | no disponible | Hugging Face (546 descargas) | Ajuste SFT experimental sobre GPT-2 small, orientado a euskera |
| GPT-2 small (OpenAI) | 124M | 1024 tokens | MIT | Hugging Face, OpenAI | Modelo base de referencia, multilingue limitado, sin SFT |
| GPT-2 medium (OpenAI) | 355M | 1024 tokens | MIT | Hugging Face, OpenAI | Mayor capacidad, mismo esquema arquitectonico |
| Modelos especificos para euskera (p. ej., variantes de GPT-2 o BERT ajustadas) | variable | variable | variable | Hugging Face | No se dispone de datos comparativos concretos en la informacion proporcionada |

La comparativa con alternativas especificas para euskera no puede completarse con datos verificables a partir de la informacion disponible; se indica como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un corpus de ~100 MB no especificado, es probable que herede sesgos del corpus y del modelo base GPT-2, pero no hay evaluacion publicada.
- Riesgo de alucinacion: alto en relacion con su tamano; los modelos de 124M de parametros tienen capacidad limitada de factualidad y coherencia a largo plazo.
- Limitaciones de contexto o idioma: la longitud de contexto no esta documentada; el soporte de euskera es inferido del nombre, no confirmado; el multilingue no esta garantizado.
- Restricciones de licencia para uso comercial: la licencia figura como "no disponible" y la model card incluye `licence: license` sin especificar terminos; no se puede asumir uso comercial permitido.
- Caveats para produccion: la model card es auto-generada y carece de informacion sobre datos, hiperparametros y evaluacion; el modelo debe tratarse como experimental. El repositorio ocupa 15,5 GB, lo que sugiere la presencia de multiples checkpoints o artefactos de entrenamiento, no solo los pesos finales.
- Ausencia de evaluacion: no hay benchmarks, evaluaciones de calidad ni comparaciones publicadas, lo que impide validar su rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/eus-100mb-after-wc-zipf-newlex-after-ckpt500-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-zipf-newlex-eus-after-100mb-packed-bfdiso_seed10
- Run de Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/rjvsskfb
- Repositorio TRL: https://github.com/huggingface/trl
