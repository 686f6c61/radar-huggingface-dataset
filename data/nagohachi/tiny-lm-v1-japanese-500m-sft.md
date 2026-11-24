# nagohachi/tiny-lm-v1-japanese-500m-sft

## Resumen

tiny-lm-v1-japanese-500m-sft es la variante ajustada por instrucciones (SFT) del modelo base tiny-lm-v1-japanese-500m-base, un LLM japones de aproximadamente 480 millones de parametros entrenado desde cero sobre unos 10.000 millones de tokens por el desarrollador independiente nagohachi. El modelo parte de una implementacion propia de estilo Llama (etiquetada como scratch_llama en los tags del repositorio) y requiere `trust_remote_code=True` para cargarse, ya que la arquitectura no es la estandar de transformers.

El ajuste SFT se ha realizado sobre aproximadamente 188.000 conversaciones procedentes de los conjuntos llm-jp/magpie-sft-v1.0 y kanhatakeyama/AutoMultiTurnByCalm3-22B, con 277 millones de tokens de entrenamiento y calculo de perdida unicamente sobre los tramos del asistente. El objetivo es dotar al modelo base de capacidad conversacional en japones, con soporte de plantilla de chat y un formato de dialogo por roles. Existe tambien una variante alineada por preferencias (DPO) publicada por el mismo autor.

Su relevancia es la de un modelo pequeno y ligero para experimentacion en japones: con 480M de parametros, contexto de 2048 tokens y un vocabulario de 99.574 entradas (tokenizador de llm-jp-3-440m), es adecuado para prototipado, despliegue en hardware modesto y estudio de pipelines de SFT sobre modelos entrenados desde cero, no para tareas de produccion que exijan razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama con implementacion propia (scratch_llama, requiere `trust_remote_code=True`) |
| Parametros totales | 479.501.312 (~480M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el repo solo distribuye pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japones (ja) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 1,0 GB) |
| Vocabulario | 99.574 tokens (tokenizador de llm-jp/llm-jp-3-440m) |
| Modelo base | nagohachi/tiny-lm-v1-japanese-500m-base |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo Llama, pero con una implementacion personalizada incluida en el repositorio, lo que obliga a usar `trust_remote_code=True`. El modelo base fue preentrenado desde cero sobre aproximadamente 10.000 millones de tokens en japones. Sobre esa base, la version SFT se ha ajustado con unos 277 millones de tokens distribuidos en cerca de 188.000 conversaciones de llm-jp/magpie-sft-v1.0 y kanhatakeyama/AutoMultiTurnByCalm3-22B, aplicando la perdida solo sobre los tramos generados por el asistente (loss on assistant spans only), practica habitual para no penalizar la modelizacion de los turnos del usuario.

No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o arquitecturas hibridas. El tokenizador procede de llm-jp-3-440m, con un vocabulario de 99.574 entradas optimizado para japones. El modelo emplea plantilla de chat (`apply_chat_template`) con roles user/assistant. Existe una variante DPO (tiny-lm-v1-japanese-500m-dpo) para alineamiento por preferencias, pero no se detallan en la informacion disponible los hiperparametros de entrenamiento (learning rate, batch size, epocas) ni la composicion exacta del corpus de preentrenamiento.

## Capacidades

- Generacion de texto en japones con formato conversacional multi-turno mediante plantilla de chat.
- Respuesta a instrucciones directas (SFT), con mejoras notables en tareas de extraccion de etiquetas (EL) y resumen (SUM) respecto al modelo base.
- Razonamiento basico y respuesta a preguntas simples en japones, con rendimiento limitado por el tamano del modelo.
- Capacidad de completar tareas de comprension lectora y clasificacion de genero textual (NLI) a nivel basico.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No dispone de modo thinking, vision ni audio.
- Multilingue: no; el modelo esta orientado exclusivamente a japones.

## Casos de uso

- Prototipado de asistentes conversacionales en japones: permite validar pipelines de dialogo multi-turno con plantilla de chat y contexto de 2048 tokens antes de escalar a modelos mayores, con un coste de inferencia minimo.
- Experimentacion academica con SFT: sirve como referencia reproducible de ajuste por instrucciones sobre un modelo preentrenado desde cero, util para estudiar el efecto del SFT frente al DPO en modelos pequenos.
- Generacion de texto japones de bajo coste en entornos con recursos limitados: al ocupar aproximadamente 1 GB en bfloat16, puede ejecutarse en GPUs de consumo y en CPU para tareas de generacion corta.
- Extraccion de informacion y etiquetado simple en japones: sus mejores resultados relativos en tareas de extraccion de etiquetas (EL, 0,129) lo hacen util para clasificacion basica de texto en japones dentro de pipelines de preprocesamiento.
- Resumen de textos cortos en japones: la mejora en la categoria SUM (0,099 frente a 0,051 del base) lo hace viable para resumenes breves en entornos de prueba, no para produccion critica.
- Educacion e investigacion sobre tokenizacion japonesa: el uso del tokenizador de llm-jp-3-440m con 99.574 entradas permite estudiar el impacto del vocabulario en la eficiencia de modelos pequenos en japones.
- Generacion de datos sinteticos o aumento de datasets en japones: puede emplearse para producir borradores o variaciones de texto que luego se filtren manualmente.

## Benchmarks y rendimiento

Resultados en llm-jp-eval v1.4.1 (100 ejemplos del split de desarrollo por dataset, prompts de 4 ejemplos, decodificacion greedy, sin plantilla de chat para todos los modelos). El promedio es la media de 10 categorias, excluyendo generacion de codigo.

| Modelo | promedio | EL | FA | HE | MC | MR | MT | NLI | QA | RC | SUM |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| tiny-lm-v1-japanese-500m-base | 0,210 | 0,075 | 0,035 | 0,215 | 0,300 | 0,010 | 0,451 | 0,528 | 0,229 | 0,208 | 0,051 |
| tiny-lm-v1-japanese-500m-sft | 0,221 | 0,129 | 0,036 | 0,235 | 0,300 | 0,010 | 0,472 | 0,428 | 0,222 | 0,278 | 0,099 |
| tiny-lm-v1-japanese-500m-dpo | 0,220 | 0,137 | 0,035 | 0,235 | 0,293 | 0,010 | 0,476 | 0,412 | 0,232 | 0,268 | 0,102 |
| llm-jp/llm-jp-3-440m | 0,264 | 0,223 | 0,057 | 0,285 | 0,320 | 0,050 | 0,620 | 0,508 | 0,277 | 0,267 | 0,029 |
| llm-jp/llm-jp-3-440m-instruct3 | 0,274 | 0,296 | 0,060 | 0,240 | 0,313 | 0,050 | 0,646 | 0,444 | 0,229 | 0,384 | 0,073 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB en bfloat16/fp16 (480M parametros), en torno a 0,5 GB en cuantizacion de 8 bits y unos 0,25-0,3 GB en 4 bits, aunque no se distribuyen pesos cuantizados oficialmente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para bfloat16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. Tambien puede ejecutarse en CPU para inferencia de baja latencia relativa.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada. No se documenta soporte oficial en vLLM, llama.cpp, Ollama o TGI; la dependencia de codigo personalizado puede requerir portar la arquitectura para esos motores.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, se espera una generacion muy rapida en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Promedio llm-jp-eval v1.4.1 | Licencia | Disponibilidad |
| :--- | ---: | ---: | ---: | :--- | :--- |
| tiny-lm-v1-japanese-500m-sft | ~480M | 2048 | 0,221 | no disponible | Hugging Face (transformers, codigo custom) |
| tiny-lm-v1-japanese-500m-base | ~480M | 2048 | 0,210 | no disponible | Hugging Face |
| tiny-lm-v1-japanese-500m-dpo | ~480M | 2048 | 0,220 | no disponible | Hugging Face |
| llm-jp/llm-jp-3-440m | ~440M | no disponible en la informacion | 0,264 | no disponible en la informacion | Hugging Face |
| llm-jp/llm-jp-3-440m-instruct3 | ~440M | no disponible en la informacion | 0,274 | no disponible en la informacion | Hugging Face |

El modelo de llm-jp supera al tiny-lm en el promedio global de llm-jp-eval (0,264 y 0,274 frente a 0,221), especialmente en traduccion automatica (MT) y extraccion de etiquetas (EL). El tiny-lm-v1-japanese-500m-sft compensa parcialmente con mejores resultados en resumen (SUM, 0,099) y comprension lectora (RC, 0,278) frente al modelo base de llm-jp (0,029 y 0,267 respectivamente).

## Limitaciones y advertencias

- Rendimiento global bajo: el promedio de 0,221 en llm-jp-eval indica capacidad limitada para tareas que requieran razonamiento, conocimiento factual o generacion compleja.
- Riesgo elevado de alucinacion: con 480M de parametros y 10.000 millones de tokens de preentrenamiento, la cobertura de conocimiento factual es muy reducida.
- Contexto corto: 2048 tokens limita conversaciones largas, documentos extensos y tareas de resumen de mayor alcance.
- Monolingue: orientado exclusivamente a japones; el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Licencia no disponible: no se puede confirmar el uso comercial; es imprescindible contactar con el autor o consultar el repositorio antes de un despliegue productivo.
- Dependencia de codigo personalizado (`trust_remote_code=True`): implica riesgos de seguridad y compatibilidad, y dificulta el uso en motores de inferencia estandar.
- Sin soporte documentado de tool calling, agentes ni modos de razonamiento extendido.
- No hay pesos cuantizados oficiales ni integracion documentada con llama.cpp, Ollama o vLLM.
- El ajuste SFT mejora EL y SUM, pero degrada NLI (0,528 a 0,428) y QA (0,229 a 0,222) respecto al modelo base, un efecto a tener en cuenta al elegir variante.
- Modelo de investigacion: no recomendado para produccion sin validacion exhaustiva y sin una licencia clara.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-sft
- Modelo base: https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-base
- Variante DPO: https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-dpo
- Dataset llm-jp/magpie-sft-v1.0: https://huggingface.co/datasets/llm-jp/magpie-sft-v1.0
- Dataset kanhatakeyama/AutoMultiTurnByCalm3-22B: https://huggingface.co/datasets/kanhatakeyama/AutoMultiTurnByCalm3-22B
- Tokenizador llm-jp/llm-jp-3-440m: https://huggingface.co/llm-jp/llm-jp-3-440m
- Modelo llm-jp/llm-jp-3-440m: https://huggingface.co/llm-jp/llm-jp-3-440m
- Modelo llm-jp/llm-jp-3-440m-instruct3: https://huggingface.co/llm-jp/llm-jp-3-440m-instruct3
- Herramienta de evaluacion llm-jp-eval: https://github.com/llm-jp/llm-jp-eval
- Blog de LLM-jp con resultados de referencia: https://llm-jp.github.io/blog/2025/02/05/instruct3.html
