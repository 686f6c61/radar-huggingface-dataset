# richardyoung/Qwen2.5-14B-Instruct-heretic1x-code

## Resumen

Qwen2.5-14B-Instruct-heretic1x-code es un ajuste fino (fine-tune) del modelo Qwen2.5-14B-Instruct de Alibaba, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated" o "decensored" dentro de la familia Heretic 1.x, una linea de experimentos de investigacion orientados a eliminar los mecanismos de rechazo y alineacion de seguridad del modelo original mediante tecnicas de abliteration (modificacion de las direcciones de activacion asociadas al rechazo). El sufijo "code" sugiere un enfasis adicional en tareas de generacion de codigo, aunque no se documenta en la informacion disponible el procedimiento exacto de entrenamiento ni la composicion del dataset.

El modelo conserva la arquitectura transformer densa de Qwen2.5-14B-Instruct, con 14.770.033.664 parametros totales segun los pesos en safetensors (aproximadamente 14,8 mil millones). El repositorio ocupa 29,6 GB, lo que corresponde a pesos en precision bf16/fp16. Esta pensado para investigacion sobre alineacion, robustez y comportamiento de modelos sin censura, no para despliegues de produccion orientados al publico general.

Es relevante en el contexto actual porque ejemplifica la corriente de modelos "abliterated" que circulan en la comunidad open source para estudiar como se codifican los rechazos en el espacio de activaciones, y porque ofrece una alternativa sin restricciones de contenido sobre una base solida como Qwen2.5. El acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only |
| Parametros totales | 14.770.033.664 (~14,8 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-14B-Instruct; no confirmada en la ficha) |
| Tipos de cuantizacion | no disponible en la informacion (pesos originales en safetensors bf16/fp16; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | en (ingles declarado) |
| Licencia | apache-2.0 (metadato del repo); el acceso esta gated con terminos adicionales en Hugging Face |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only denso con atencion por causalidad, RoPE y normalizacion RMSNorm, disenado por Alibaba para instrucciones y conversacion multilingue. Sobre esa base, richardyoung aplica un proceso de abliteration propio de la familia Heretic 1.x, que consiste en identificar en el espacio de activaciones las direcciones asociadas a la negativa a responder y proyectarlas fuera de los pesos, reduciendo la tendencia del modelo a rechazar peticiones. El sufijo "code" indica un enfasis adicional en codigo, pero no se detalla en la informacion proporcionada si se realizo un fine-tune supervisado adicional, DPO, RLHF ni cuantos tokens se emplearon.

No se dispone de informacion sobre la composicion del dataset de ajuste, el numero de tokens de entrenamiento, ni sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). Tampoco se documenta el metodo exacto de abliteration (por capas, por direcciones, con que umbral) ni si se preservaron las capacidades de tool calling del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-14B-Instruct.
- Generacion de codigo y asistencia en programacion (enfasis declarado por el sufijo "code", sin benchmarks publicados que lo confirmen).
- Razonamiento y matematicas de nivel medio-alto, segun las capacidades del modelo base (no verificadas en esta variante).
- Reduccion de rechazos: el proceso de abliteration busca que el modelo responda a peticiones que el original rechazaria.
- Soporte de tool calling / function calling: presumiblemente heredado del base, pero no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en esta variante.
- Multilingue: el tag de idioma solo declara "en"; el base soporta mas idiomas, pero no se garantiza en este fine-tune.

## Casos de uso

- Investigacion sobre alineacion y seguridad: analizar como se codifican los rechazos en las activaciones comparando este modelo con Qwen2.5-14B-Instruct original, midiendo diferencias en tasas de negativa ante prompts sensibles.
- Red teaming y evaluacion de robustez: usar la variante sin censura como modelo "atacante" o como sujeto de pruebas para calibrar clasificadores de contenido y filtros de seguridad en pipelines propios.
- Generacion de codigo en entornos controlados: aprovechar el enfasis "code" para tareas de autocompletado y refactorizacion en repositorios internos, siempre con revision humana y sin exposicion a usuarios finales.
- Estudio de degradacion de capacidades tras abliteration: comparar rendimiento en MMLU, HumanEval o GSM8K frente al base para cuantificar el coste de eliminar la alineacion.
- Experimentos de destilacion y merging: emplear esta variante como componente en merges o como profesor en destilacion hacia modelos mas pequenos, dado su formato safetensors estandar.
- Analisis de sesgos y toxicidad: generar respuestas sin filtro para auditar la presencia de sesgos latentes en el modelo base y documentar riesgos antes de desplegar variantes alineadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 29,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 32-40 GB para contexto corto.
- VRAM estimada en cuantizacion 8 bits: en torno a 15-16 GB; en 4 bits, en torno a 8-9 GB (cuantizaciones no publicadas por el autor, requeriria generarlas).
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para bf16; RTX 4090 24 GB solo con cuantizacion 8 bits o inferior y contexto limitado.
- Cabe en GPU consumer: si, en RTX 4090 24 GB con cuantizacion 8 bits, y en GPUs de 12-16 GB con cuantizacion 4 bits (a generar por el usuario).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible); vLLM, llama.cpp u Ollama requeririan conversion a GGUF/AWQ no publicada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| richardyoung/Qwen2.5-14B-Instruct-heretic1x-code | ~14,8 B | no disponible | apache-2.0 (gated) | Variante abliterated con enfasis en codigo; sin benchmarks publicados |
| Qwen/Qwen2.5-14B-Instruct | ~14,8 B | 32.768 tokens (segun ficha oficial del base) | apache-2.0 | Modelo base alineado, con benchmarks publicados por Alibaba |
| Otras variantes abliterated de Qwen2.5-14B (comunidad) | ~14,8 B | variable | variable | Multiples forks; sin comparativa estandarizada disponible |

## Limitaciones y advertencias

- Modelo "decensored": la abliteration reduce los rechazos, lo que implica mayor riesgo de generar contenido toxico, ilegal o danino; no apto para exposicion directa a usuarios finales sin filtros adicionales.
- Riesgo elevado de alucinacion y de respuestas plausibles pero incorrectas, especialmente en dominios sensibles, al haberse alterado el comportamiento alineado del base.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta verificado y podria degradarse respecto al base.
- Licencia: aunque el metadato indica apache-2.0, el acceso es gated y requiere aceptar terminos en Hugging Face; revisar condiciones antes de uso comercial.
- Sin benchmarks publicados: no hay evidencia de que las capacidades de codigo, razonamiento o tool calling se mantengan tras el proceso de abliteration.
- Procedencia y reproducibilidad limitadas: un unico autor, sin paper ni documentacion tecnica del proceso de entrenamiento; descargas y likes muy bajos (737 descargas, 0 likes) en el momento de la consulta.
- No se garantiza compatibilidad con tool calling ni con agentes multi-paso del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-14B-Instruct-heretic1x-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
