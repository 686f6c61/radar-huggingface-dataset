# Dnurs/tiny-aya-hermes-tau2-airline-adapter-ep1

## Resumen

Dnurs/tiny-aya-hermes-tau2-airline-adapter-ep1 es un adaptador LoRA (PEFT) de tipo SFT publicado en Hugging Face por el usuario Dnurs. No se trata de un modelo completo, sino de un conjunto de pesos de adaptacion que debe aplicarse sobre el modelo base Dnurs/tiny-aya-hermes-merged, a su vez derivado de la familia Tiny Aya de Cohere. El nombre del repositorio sugiere un ajuste fino orientado a la tarea de atencion al cliente de aerolineas del benchmark tau2-bench, si bien la model card no documenta explicitamente el dataset ni el objetivo de entrenamiento.

El adaptador es relevante como ejemplo de personalizacion ligera de un modelo pequeno para un dominio vertical concreto (resolucion de dialogos de aerolinea con uso de herramientas). Su tamano de repositorio es de 0,1 GB, coherente con un adaptador LoRA de rango bajo sobre un modelo compacto. La informacion publicada es muy escasa: la model card es la plantilla por defecto de Hugging Face con la mayoria de campos marcados como "[More Information Needed]", y no se especifican licencia, idiomas, hiperparametros ni resultados de evaluacion.

Por tanto, esta ficha describe lo que se puede inferir de forma rigurosa a partir de los metadatos disponibles (tags, libreria, modelo base, tamano) y senala explicitamente como "no disponible" todo aquello que el autor no ha documentado. Se recomienda precaucion antes de usar este adaptador en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (modelo base Tiny Aya de Cohere, inferido del nombre) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base no documenta su tamano en esta ficha) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible (Tiny Aya esta disenado para cobertura multilingue, pero el autor no lo confirma) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.22.0, transformers, trl |
| Modelo base | Dnurs/tiny-aya-hermes-merged |
| Tipo de ajuste | SFT (supervised fine-tuning) |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-generation |
| Tags adicionales | conversational, lora, arxiv:1910.09700 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, matrices de bajo rango insertadas en las capas del transformer base que se entrenan mientras los pesos originales permanecen congelados. Segun los tags, el entrenamiento se realizo con la libreria TRL mediante SFT (supervised fine-tuning) sobre el modelo Dnurs/tiny-aya-hermes-merged. El sufijo "tau2-airline" del nombre apunta a un ajuste sobre el benchmark tau2-bench en su dominio de aerolineas, una tarea de dialogo multi-turno con invocacion de herramientas y politicas de negocio; el sufijo "ep1" sugiere una primera epoca de entrenamiento.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, hiperparametros (rango LoRA, alpha, learning rate, precision), ni si hubo etapas de RLHF o DPO. La model card no incluye seccion de datos ni de procedimiento cumplimentada. El modelo base "tiny-aya-hermes-merged" combina, por su nombre, la familia Tiny Aya (modelos pequenos multilingues de Cohere) con un formato de chat tipo Hermes, pero el autor no detalla esa fusion.

## Capacidades

- Generacion de texto conversacional en formato chat, segun el tag "conversational".
- Ajuste especifico (presuntamente) para dialogos de atencion al cliente de aerolinea con uso de herramientas, derivado del nombre tau2-airline.
- Soporte de tool calling / function calling: no confirmado por el autor, pero plausible por el dominio objetivo.
- Razonamiento multi-paso y comportamiento agentico: no confirmado documentalmente.
- Capacidades multilingues: no confirmadas; dependen del modelo base Tiny Aya.
- Capacidades de vision o audio: no disponibles.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Prototipado de agentes de atencion al cliente en aerolineas: el adaptador estaria pensado para resolver consultas de reservas, cambios y cancelaciones con invocacion de herramientas, siguiendo el formato de tau2-bench.
- Investigacion en fine-tuning eficiente: sirve como ejemplo reproducible de adaptador LoRA sobre un modelo pequeno para un dominio vertical.
- Evaluacion comparativa de tecnicas de SFT: util para medir el efecto de una sola epoca de ajuste frente al modelo base en tareas de dialogo con herramientas.
- Experimentos academicos con tau2-bench: permite reproducir o extender resultados del benchmark en el subdominio de aerolineas.
- Base para ajustes posteriores: al ser un adaptador ligero (0,1 GB), puede combinarse o continuar entrenandose con pocos recursos.
- Despliegue de bajo coste en entornos de prueba: al heredar el tamano reducido del modelo base, podria ejecutarse en hardware modesto para demos internas, siempre que se valide su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa; al ser un adaptador LoRA, el requisito lo determina el modelo base Tiny Aya (tamano no documentado en esta ficha). El adaptador en si ocupa aproximadamente 0,1 GB.
- GPU recomendadas: no disponible. Para modelos "tiny" de la familia Aya suele bastar una GPU consumer, pero el autor no lo confirma.
- Compatibilidad con GPU consumer: probable por el caracter "tiny" del modelo base, no verificada.
- Opciones de despliegue: transformers + peft (fusion del adaptador con merge_and_unload); vLLM, llama.cpp, Ollama o TGI solo si se convierte el modelo fusionado a los formatos correspondientes (no documentado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Dnurs/tiny-aya-hermes-tau2-airline-adapter-ep1 | Adaptador LoRA (SFT) | No disponible | No disponible | No disponible | Ajuste de dominio aerolinea sobre Tiny Aya |
| Dnurs/tiny-aya-hermes-merged | Modelo fusionado | No disponible | No disponible | No disponible | Modelo base del adaptador |
| Familia Tiny Aya (Cohere) | Modelo base | No disponible en esta ficha | No disponible | No disponible | Multilingue, modelo pequeno |
| Alternativas de adaptadores tau2-bench | Adaptadores LoRA | Variable | Variable | Variable | No se dispone de comparaciones publicadas |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Model card practicamente vacia: la mayoria de campos estan sin cumplimentar, lo que impide verificar el proceso de entrenamiento y evaluacion.
- Licencia no especificada: no se puede garantizar el uso comercial; es imprescindible contactar con el autor o revisar la licencia del modelo base antes de usarlo en produccion.
- Riesgo de alucinacion: inherente a los modelos generativos; en dominios regulados como aerolineas puede producir respuestas incorrectas sobre politicas o precios.
- Sesgos desconocidos: no se documenta ninguna evaluacion de sesgo ni de seguridad.
- Cobertura idiomatica no confirmada: aunque el modelo base sea multilingue, el ajuste podria degradar idiomas distintos del usado en el SFT.
- Entrenamiento de una sola epoca ("ep1"): puede estar infraajustado o sobreajustado al dataset de tau2-bench, sin validacion publicada.
- Dependencia estricta del modelo base: el adaptador solo funciona correctamente con Dnurs/tiny-aya-hermes-merged.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Dnurs/tiny-aya-hermes-tau2-airline-adapter-ep1
- Modelo base: https://huggingface.co/Dnurs/tiny-aya-hermes-merged
- Referencia PEFT: https://github.com/huggingface/peft
- Referencia TRL: https://github.com/huggingface/trl
- Paper citado en tags (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
