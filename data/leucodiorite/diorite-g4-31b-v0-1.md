# Leucodiorite/Diorite-G4-31B-v0.1

## Resumen

Diorite-G4-31B-v0.1 es un adaptador LoRA (PEFT) publicado por el usuario Leucodiorite sobre el modelo base google/gemma-4-31B-it. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino que deben cargarse sobre la arquitectura original de Gemma 4 31B instruida. El repositorio ocupa 1,8 GB, lo que es coherente con un adaptador LoRA de rango moderado sobre un modelo de 31 000 millones de parametros.

El tag "decision" sugiere que el ajuste fino esta orientado a tareas de toma de decisiones o clasificacion/razonamiento estructurado, aunque no se aporta documentacion que lo confirme. El modelo se distribuye bajo licencia Apache 2.0, pero el acceso esta restringido (gated) en Hugging Face, por lo que es necesario aceptar condiciones en la plataforma antes de descargarlo. Ademas, hereda las restricciones de uso del modelo base Gemma, que se rige por los terminos de Google, no por Apache 2.0.

La relevancia de esta ficha es limitada por la escasez de informacion publicada: no hay model card sustantiva, no hay benchmarks, no hay datos de entrenamiento ni idiomas declarados. Se trata de un artefacto muy reciente (creado el 26 de octubre de 2026) con cero descargas y cero likes, lo que indica que no ha sido validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (base: google/gemma-4-31B-it) |
| Parametros totales | No disponible para el adaptador; modelo base de 31 000 millones (31B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion del adaptador; depende del modelo base |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion aplica al modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 (adaptador); el modelo base Gemma tiene terminos propios de Google |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con la libreria PEFT sobre google/gemma-4-31B-it. No se especifica el rango, el alpha, los modulos objetivo (q_proj, k_proj, v_proj, etc.) ni la estrategia de inicializacion. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT supervisado. El tag "decision" es la unica pista sobre el dominio de ajuste.

No hay informacion sobre innovaciones tecnicas del adaptador (por ejemplo, decodificacion especulativa, atencion lineal o variantes de LoRA como QLoRA o DoRA). Cualquier capacidad de razonamiento, contexto largo o tool calling proviene del modelo base Gemma 4 31B-it, no del adaptador, y no se detalla en la informacion proporcionada.

## Capacidades

- Ajuste fino especifico sobre Gemma 4 31B-it orientado, segun el tag, a tareas de decision.
- Hereda las capacidades del modelo base (generacion de texto, razonamiento, codigo, matematicas), aunque no se documentan explicitamente en la ficha del adaptador.
- Soporte de tool calling / function calling: no disponible en la informacion del adaptador; depende del modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Clasificacion y enrutamiento de decisiones: el adaptador puede emplearse para tareas de decision estructurada (por ejemplo, seleccion de categoria, priorizacion de tickets o scoring de opciones), aprovechando el ajuste fino sobre el modelo base.
- Asistentes internos de soporte a la decision: integrado sobre Gemma 4 31B-it, puede generar recomendaciones razonadas en dominios acotados donde se haya entrenado el LoRA.
- Prototipado rapido de variantes de Gemma 4 31B: al ser un adaptador de 1,8 GB, permite experimentar con ajustes especificos sin duplicar los pesos completos del modelo base.
- Investigacion en PEFT: util como ejemplo de adaptador LoRA sobre un modelo de 31B para estudiar transferencia, olvido catastrofico o merging de adaptadores.
- Despliegue con bajo coste de almacenamiento: cargar el adaptador junto al base en un servidor con vLLM o TGI permite servir una variante especializada sin un segundo checkpoint completo.
- Evaluacion comparativa de ajustes: permite medir el impacto de un LoRA concreto frente al modelo base en tareas de decision, siempre que se disponga de un conjunto de evaluacion propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Gemma 4 31B-it. En FP16 se requieren aproximadamente 62 GB solo para pesos; en cuantizacion de 8 bits, en torno a 31-35 GB; en 4 bits, alrededor de 16-20 GB, mas overhead de contexto y KV cache.
- El adaptador LoRA en si ocupa 1,8 GB en disco y anade un overhead minimo de VRAM al fusionarse o cargarse junto al base.
- GPU recomendadas: A100 80 GB o H100 80 GB para FP16 sin cuantizar; A100 40 GB o L40S para 8 bits; RTX 4090 (24 GB) solo con cuantizacion agresiva (4 bits) y contextos moderados.
- Cabe en GPU consumer: si, en RTX 4090/3090 con cuantizacion de 4 bits y contextos limitados; en GPUs de 16 GB es ajustado y puede requerir offloading.
- Opciones de despliegue: vLLM, TGI y llama.cpp (previo merge del adaptador con el base y conversion a GGUF); Ollama solo tras conversion manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Diorite-G4-31B-v0.1 | Adaptador sobre 31B | No disponible | Apache 2.0 (adaptador) | Gated en HF | Sin benchmarks ni documentacion |
| google/gemma-4-31B-it (base) | 31B | No disponible en esta ficha | Terminos Gemma | Publico en HF | Modelo base del adaptador |
| Adaptadores LoRA genericos sobre Gemma | Variable | Depende del base | Segun autor | Variable | Sin validacion comunitaria |

No se dispone de informacion suficiente para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay datos de entrenamiento, hiperparametros LoRA, evaluacion ni idiomas declarados.
- Cero descargas y cero likes: no existe validacion por parte de la comunidad.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion al despliegue automatizado.
- Licencia del adaptador Apache 2.0, pero el uso del modelo base Gemma esta sujeto a los terminos de Google; es necesario revisar ambas licencias antes de un uso comercial.
- Riesgo de alucinacion y sesgos: no evaluados; se heredan los del modelo base y se anaden los del ajuste fino, sin documentar.
- El tag "decision" no viene acompanado de definicion de tarea, por lo que el dominio real de especializacion es incierto.
- Fecha de creacion muy reciente y sin historial de versiones: posible inestabilidad o cambios en el repositorio.
- No se garantiza compatibilidad con versiones futuras de PEFT o del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Leucodiorite/Diorite-G4-31B-v0.1
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
