# rubenbalbastre/r2warmup_qwen_qwen2_5_7b_instruct_john_d_rockefeller

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante SFT (supervised fine-tuning) sobre el modelo base Qwen/Qwen2.5-7B-Instruct, publicado por el usuario rubenbalbastre bajo el identificador `r2warmup_qwen_qwen2_5_7b_instruct_john_d_rockefeller`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador en formato safetensors que debe cargarse junto al modelo base para poder realizar inferencia; el repositorio ocupa 0,7 GB y declara la librería PEFT (versión 0.21.0) y las etiquetas `lora`, `sft`, `transformers` y `trl`.

La relevancia del artefacto es limitada y fundamentalmente experimental. La model card es una plantilla sin rellenar (todos los campos aparecen como "More Information Needed"), no se declara licencia, idiomas, datos de entrenamiento, hiperparámetros ni resultados de evaluación, y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta. El nombre del adaptador sugiere una etapa de warmup dentro de una ejecución de entrenamiento mayor, y el sufijo `john_d_rockefeller` apunta a una posible especialización de persona o estilo, pero ninguna de estas hipótesis está documentada por el autor.

El único respaldo técnico explícito es la referencia al paper arXiv:2608.17804, enlazado desde la model card. Al no existir métricas publicadas ni documentación del procedimiento, cualquier uso en producción exige una evaluación propia previa sobre el modelo fusionado.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only. Arquitectura heredada del modelo base Qwen2.5-7B-Instruct: 28 capas, GQA con 28 cabezas de consulta y 4 de clave/valor, RoPE, SwiGLU y RMSNorm |
| Parámetros totales | No disponible para el adaptador (rango LoRA y módulos objetivo sin documentar). Modelo base: 7,61B |
| Parámetros activos | No aplica: arquitectura densa, no es MoE |
| Longitud de contexto | No disponible para el adaptador. El modelo base admite hasta 131.072 tokens |
| Tipos de cuantización | No disponible. El adaptador se publica en safetensors sin especificar precisión; el modelo base admite cuantizaciones GPTQ, AWQ y GGUF, no incluidas en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA/PEFT; 0,7 GB de repositorio). Requiere cargar Qwen/Qwen2.5-7B-Instruct |

Nota: las cifras indicadas como del modelo base proceden de la documentación pública de Qwen2.5-7B-Instruct, no de la información aportada por este repositorio.

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) sobre un transformer decoder-only denso de 7,61B parámetros. Los metadatos de HuggingFace indican que fue entrenado con la pila TRL/PEFT y que el modelo de referencia apunta a una ruta local (`outputs/model/Qwen--Qwen2.5-7B-Instruct`), lo que sugiere un pipeline de SFT ejecutado en local sobre una exportación del modelo base. La única versión de framework declarada es PEFT 0.21.0. No se especifican el rango del adaptador, los módulos a los que se aplica (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, etc.), la precisión de entrenamiento, el tamaño de batch, la tasa de aprendizaje ni el número de pasos.

Tampoco hay información sobre el dataset de instrucciones utilizado, su composición, su idioma mayoritario ni si hubo fases posteriores de alineación (DPO, RLHF u otras). No consta ninguna innovación técnica declarada por el autor: no se mencionan decodificación especulativa, atención lineal, mezcla de expertos ni variantes arquitectónicas. El paper referenciado (arXiv:2608.17804) es el único documento asociado, pero su contenido no se ha podido verificar en la información disponible.

## Capacidades

- Generación de texto conversacional: el adaptador hereda la capacidad base de Qwen2.5-7B-Instruct para diálogo multi-turno, condicionada al efecto del SFT aplicado, que no está documentado.
- Razonamiento, matemáticas y código: capacidades propias del modelo base de 7B; no hay evidencia de que el adaptador las mejore, las mantenga intactas o las degrade (riesgo habitual de *catastrophic forgetting* en SFT de dominio).
- Tool calling / function calling: el modelo base Qwen2.5-7B-Instruct soporta plantillas de herramientas, pero no se confirma que el adaptador conserve el formato ni el comportamiento esperado.
- Uso como agente y razonamiento multi-paso: no disponible; no hay evaluación ni declaración al respecto.
- Capacidades multilingües: no disponible. El modelo base declara cobertura de más de 25 idiomas, pero el adaptador no documenta idiomas ni proporción de datos por lengua.
- Capacidad especial (modo *thinking*, visión, audio): no disponible. Qwen2.5-7B-Instruct es un modelo exclusivamente de texto.
- Comportamiento de persona o estilo: posible, a juzgar por el sufijo del identificador, pero sin ninguna confirmación por parte del autor.

## Casos de uso

- Investigación en pipelines de SFT: el adaptador puede utilizarse como referencia reproducible de una etapa de warmup con TRL/PEFT, cargándolo sobre Qwen2.5-7B-Instruct y comparando la salida frente al modelo base sin adaptador. Es adecuado porque el coste de experimentación es bajo (0,7 GB de adaptador) y permite aislar el efecto del ajuste.
- Evaluación de olvido catastrófico: sirve para medir cuánto degrada un SFT de dominio las capacidades generales del base en tareas como MMLU, GSM8K o HumanEval, siempre que el equipo aporte su propio conjunto de evaluación, ya que el autor no publica ninguno.
- Despliegue multi-adaptador con vLLM: al ser un LoRA, puede servirse junto a otros adaptadores compartiendo una única instancia del modelo base (`--enable-lora`), lo que reduce el coste de VRAM frente a mantener varias copias completas del modelo.
- Prototipado de asistentes conversacionales de dominio: partiendo del adaptador, un equipo puede continuar el ajuste con sus propios datos de atención al cliente o soporte interno, aprovechando que el base soporta contextos de hasta 131.072 tokens para conversaciones largas con historial extenso.
- Ajuste de tono o estilo corporativo: si el sufijo del identificador corresponde efectivamente a una persona o registro concreto, el adaptador puede servir de punto de partida para alinear el estilo de respuesta de un asistente interno, aunque será necesario validar el sesgo introducido antes de exponerlo a usuarios.
- Experimentos académicos sobre coste de adaptación: cuantificar cuántos ejemplos y cuántos pasos bastan para especializar un modelo de 7B, usando este adaptador como una de las condiciones del estudio.
- Generación de código asistida en entornos controlados: con el modelo base y tool calling correctamente configurado, puede integrarse en asistentes de editor, pero requiere verificación de sintaxis y tests automáticos porque la tasa de error del adaptador es desconocida.
- *Fine-tuning* sobre *hardware* de consumo: al requerir el base en 4 bits, todo el ciclo de entrenamiento y prueba cabe en una GPU de 24 GB, lo que lo hace apto para laboratorios con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

| Benchmark | Resultado | Observaciones |
|---|---|---|
| MMLU | No disponible | El autor no publica evaluación |
| MMLU-Pro | No disponible | El autor no publica evaluación |
| HumanEval | No disponible | El autor no publica evaluación |
| GSM8K | No disponible | El autor no publica evaluación |
| MATH | No disponible | El autor no publica evaluación |
| Evaluación multilingüe | No disponible | No se declaran idiomas |

Las cifras del modelo base pueden consultarse en la model card de Qwen/Qwen2.5-7B-Instruct; no se reproducen aquí porque no forman parte de la información aportada ni han sido verificadas en este repositorio.

## Requisitos de hardware

- Inferencia en fp16/bf16: el adaptador apenas añade peso, pero el modelo base de 7,61B ocupa aproximadamente 15,2 GB solo en pesos, por lo que se recomienda un mínimo de 18-20 GB de VRAM contando activaciones y caché KV.
- Inferencia en 8 bits: alrededor de 8 GB de pesos más overhead, es decir, unos 9-10 GB de VRAM.
- Inferencia en 4 bits: aproximadamente 4,2 GB de pesos más overhead, en torno a 5-6 GB de VRAM.
- Caché KV: con la configuración GQA del base (4 cabezas KV, dimensión de cabeza 128, 28 capas), el coste estimado es de unos 57 KB por token en fp16, lo que equivale a unos 1,8 GB a 32.768 tokens y unos 7,3 GB a 131.072 tokens.
- GPU recomendadas: A100 40 GB y H100 80 GB para servir el modelo en fp16 con contexto largo y concurrencia; L40S o A6000 para fp16 en un solo dispositivo; RTX 4090 (24 GB) para fp16 con lotes pequeños o 8 bits con holgura.
- GPU de consumo: sí cabe. RTX 4090, RTX 4080 y RTX 3090 con cuantización de 4 u 8 bits; RTX 3060 de 12 GB y RTX 4060 Ti de 16 GB con 4 bits, aunque con contexto reducido.
- Opciones de despliegue: vLLM y TGI con soporte de adaptadores LoRA en tiempo de ejecución; transformers + PEFT para cargar el adaptador directamente; llama.cpp y Ollama requieren fusionar el adaptador con el base y convertirlo a GGUF (llama.cpp admite además `--lora` con el adaptador en formato GGUF).
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor, y las tasas de generación dependerán del motor, la cuantización, el tamaño de lote y la longitud de contexto. Como referencia orientativa, un 7B en 4 bits sobre una GPU de consumo suele generar del orden de decenas de tokens por segundo con lotes pequeños, pero ese dato no está verificado para este artefacto.

## Comparativa con modelos similares

La comparación se establece con los modelos de la misma categoría que el base sobre el que se aplica el adaptador, ya que no existen métricas del adaptador que permitan compararlo por rendimiento.

| Modelo | Parámetros | Contexto | Licencia | Resultados publicados | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador sobre Qwen2.5-7B-Instruct | Adaptador sobre 7,61B | No disponible para el adaptador | No disponible | No | Repositorio HF, 0 descargas |
| Qwen2.5-7B-Instruct | 7,61B | 131.072 tokens | Apache 2.0 | Sí, en su model card | Pesos completos, muy extendido |
| Llama 3.1 8B Instruct | 8,03B | 128.000 tokens | Llama 3.1 Community License | Sí, en su model card | Pesos completos, muy extendido |
| Mistral 7B Instruct v0.3 | 7,25B | 32.000 tokens | Apache 2.0 | Sí, en su model card | Pesos completos, muy extendido |

Nota: los datos de las tres alternativas proceden de su documentación pública y no de la información aportada en esta consulta.

## Limitaciones y advertencias

- La model card es una plantilla sin completar: no hay descripción de uso previsto, datos de entrenamiento, hiperparámetros, evaluación ni usuarios objetivo.
- La licencia no está declarada. Aunque el modelo base Qwen2.5-7B-Instruct se distribuye bajo Apache 2.0, la ausencia de licencia en este repositorio impide confirmar las condiciones de uso comercial del adaptador. Conviene contactar con el autor antes de cualquier despliegue productivo.
- El repositorio no tiene descargas ni likes ni validación de la comunidad, por lo que no existe evidencia externa de que el adaptador funcione según lo esperado.
- El SFT puede haber degradado capacidades generales del base (olvido catastrófico), especialmente si el conjunto de datos era pequeño o de un único dominio. Es imprescindible evaluar el modelo fusionado sobre tareas generales antes de usarlo.
- El nombre del adaptador apunta a una posible especialización de persona o estilo; ese tipo de ajuste tiende a aumentar el riesgo de respuestas inventadas cuando se le pregunta por hechos atribuidos a esa persona.
- Riesgo de alucinación heredado del modelo base de 7B, con especial incidencia en dominios especializados y en preguntas sobre datos posteriores al corte de entrenamiento.
- Cobertura de idiomas desconocida para el adaptador. El base cubre decenas de idiomas, pero el SFT puede haber sesgado la distribución hacia el idioma mayoritario del dataset, que no se documenta.
- Longitud de contexto efectiva no verificada: aunque el base soporte 131.072 tokens, el comportamiento del adaptador más allá de las ventanas cortas típicas del SFT es incierto.
- El paper enlazado (arXiv:2608.17804) no ha podido verificarse en la información disponible, por lo que no se puede confirmar que describa este adaptador.
- Antes de producción: fusionar o cargar el adaptador, fijar la versión exacta del modelo base, medir latencia y calidad con un conjunto de evaluación propio y establecer un filtro de seguridad sobre las salidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rubenbalbastre/r2warmup_qwen_qwen2_5_7b_instruct_john_d_rockefeller
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper referenciado en la model card: https://arxiv.org/abs/2608.17804
