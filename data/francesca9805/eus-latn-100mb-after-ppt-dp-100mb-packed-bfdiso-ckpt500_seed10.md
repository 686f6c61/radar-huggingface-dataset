# francesca9805/eus-latn-100mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed10

## Resumen

Este modelo es un checkpoint de generacion de texto en euskara (codigo de idioma `eus-latn`, latin script) desarrollado por el usuario de HuggingFace `francesca9805`. Se trata de un ajuste fino supervisado (SFT) realizado con la libreria TRL sobre un modelo base propio, `francesca9805/eus-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed10`. El nombre indica que parte de un corpus de aproximadamente 100 MB y que el checkpoint corresponde al paso 500 de entrenamiento con semilla 10.

Arquitecturalmente es un transformer causal de la familia GPT-2, con 124.770.816 parametros totales (un orden de magnitud casi identico al GPT-2 small de 124M). No es un modelo MoE ni un hibrido, sino un decoder denso clasico. El repositorio ocupa 3,7 GB y los pesos se distribuyen en formato safetensors.

Por su tamano reducido y su enfoque en una unica lengua minoritaria, es relevante como material de investigacion para experimentacion con tokenizacion y ajuste fino en euskara, mas que como modelo de proposito general. Los resultados de busqueda web proporcionados no aportan informacion tecnica util sobre el modelo (corresponden a listados de mercadillos sin relacion alguna), por lo que muchos datos de la model card son incompletos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only), familia GPT-2 |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion posterior) |
| Idiomas soportados | euskara (inferido del prefijo `eus-latn` del nombre); no confirmado en la model card |
| Licencia | no disponible (la model card indica "licence: license", sin terminos concretos) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de tipo SFT del checkpoint base `eus-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed10`. La etiqueta `gpt2` de HuggingFace y el recuento de parametros (124,77M) apuntan a una configuracion de transformer causal denso equivalente a GPT-2 small, con atencion causal y sin componentes de mezcla de expertos. Se desconoce el detalle exacto de la configuracion de capas y cabezas de atencion, ya que la model card no lo especifica.

El entrenamiento se realizo con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. La nomenclatura del nombre (`ppt`, `Dp`, `packed`, `bfdiso`, `ckpt500`, `seed10`) sugiere un pipeline de investigacion centrado en tokenizadores nuevos, el empaquetado (packing) de secuencias y un entrenamiento en precision bf16, pero no se dispone de la composicion exacta del dataset ni del numero de tokens vistos. No se documenta el uso de RLHF o DPO; segun la model card, el unico metodo aplicado es SFT.

## Capacidades

- Generacion de texto autoregresiva en euskara (uso principal esperado por el identificador del modelo).
- Dialogo de un solo turno mediante plantilla de chat y el pipeline `text-generation` de Transformers.
- Ajuste fino posterior y experimentacion academica sobre tokenizacion y empaquetado de secuencias.
- Capacidad potencial de continuacion de texto y respuesta a instrucciones simples, supeditada al dataset de SFT empleado.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo de razonamiento explicito (thinking mode), vision, audio ni multimodalidad.
- Capacidades multilingues: no confirmadas; el identificador sugiere monolingue en euskara.

## Casos de uso

- Generacion de texto en euskara para prototipos: el modelo puede producir continuaciones y respuestas cortas en esta lengua, util para validar pipelines de PLN en un idioma con pocos recursos.
- Investigacion sobre tokenizadores: al proceder de un proyecto de "new-tokenizers", sirve como punto de partida para comparar esquemas de tokenizacion en lenguas minoritarias.
- Ajuste fino especifico de dominio: con 124M de parametros, es viable reentrenarlo en una GPU de consumo para tareas concretas (resumen, clasificacion generativa, parafrasis) en euskara.
- Experimentacion educativa y academica: su tamano permite ejecutarlo en portatiles y estaciones sin GPU dedicada, adecuado para docencia e investigacion de bajo coste.
- Generacion aumentada en entornos con recursos limitados: puede desplegarse en CPU o en dispositivos edge cuando la latencia no es critica.
- Base para chatbots ligeros de bajo coste: integrable en asistentes simples en euskara, siempre que se valide la calidad de las respuestas por tratarse de un modelo pequeno.
- Reproducibilidad de experimentos: al estar vinculado a un run de Weights & Biases, facilita replicar y auditar el proceso de entrenamiento en estudios comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 250 MB solo para los pesos, mas memoria para el contexto y las activaciones (tipicamente menos de 1 GB en total).
- VRAM estimada en fp32: aproximadamente 500 MB para los pesos.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada pueden ejecutarlo.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en CPU.
- Opciones de despliegue: transformers (pipeline `text-generation`), text-generation-inference (el tag `text-generation-inference` esta presente), y previsiblemente llama.cpp, Ollama o TGI tras conversion a los formatos correspondientes (no confirmado en la informacion disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eus-latn-100mb-after-ppt... (este modelo) | 124,77M | no disponible | euskara (inferido) | no disponible | HuggingFace |
| GPT-2 small | 124M | 1024 tokens | ingles | MIT | HuggingFace, ampliamente disponible |
| Otros modelos en euskara de tamano pequeno | no disponible | no disponible | euskara | no disponible | no disponible |

La unica comparacion directa disponible es con GPT-2 small, del que este modelo hereda la arquitectura y el orden de magnitud en parametros, pero del que se diferencia por estar ajustado para euskara. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un corpus de unos 100 MB, es probable que herede sesgos y limitaciones de esa fuente.
- Riesgo de alucinacion: alto, propio de modelos pequenos (124M) entrenados con datos limitados; las respuestas pueden ser incoherentes o factualmente incorrectas.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada; no debe asumirse una ventana amplia.
- Limitaciones de idioma: el modelo parece orientado exclusivamente al euskara; no hay evidencia de capacidades multilingues.
- Restricciones de licencia: la model card no especifica terminos claros ("licence: license"), por lo que no se puede garantizar el uso comercial sin consultar al autor.
- Caveats para produccion: es un checkpoint de investigacion (paso 500, semilla 10), sin evaluacion publicada de calidad, seguridad ni robustez; no se recomienda su uso en produccion sin una validacion exhaustiva previa.
- Falta de documentacion: no se detallan el dataset de SFT, la composicion de datos ni las metricas de evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/eus-latn-100mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed10
- Modelo base: https://huggingface.co/francesca9805/eus-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed10
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/ct3zvmjb
- Repositorio de TRL: https://github.com/huggingface/trl
