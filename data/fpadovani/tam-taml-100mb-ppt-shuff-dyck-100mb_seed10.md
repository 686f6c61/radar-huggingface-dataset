# fpadovani/tam-taml-100mb-ppt-shuff-dyck-100mb_seed10

## Resumen

El modelo `fpadovani/tam-taml-100mb-ppt-shuff-dyck-100mb_seed10` es un ajuste fino (fine-tune) del modelo base `goldfish-models/tam_taml_100mb`, un transformer decoder-only de tipo GPT-2 con 124.770.816 parametros (unos 125 M) desarrollado originalmente dentro del proyecto Goldfish de la Universidad de Groningen para el tamil (codigos de idioma `tam`/`taml`, es decir, tamil en escritura tamil). El autor del ajuste, `fpadovani`, lo ha entrenado con aprendizaje supervisado (SFT) usando la libreria TRL, segun los tags y la model card del repositorio.

Por el propio nombre del modelo (`ppt-shuff-dyck-100mb`) y por el proyecto de Weights & Biases asociado (`new_tokenizers`), todo apunta a un artefacto de investigacion centrado en tokenizadores y en tareas de lenguaje formal de tipo Dyck (emparejamiento de parentesis) con variantes de secuencias barajadas ("shuff"). Es decir, no parece un modelo orientado a producto, sino una pieza de un experimento academico sobre como distintos tokenizadores afectan al aprendizaje de estructuras formales en modelos pequenos.

Su relevancia practica es limitada y muy especifica: sirve como punto de partida reproducible para investigacion en tokenizacion, para reproducir experimentos de SFT con TRL y como ejemplo de fine-tune de un modelo Goldfish. El repositorio no tiene descargas ni "likes", no declara licencia ni idiomas soportados y no publica resultados de benchmarks, por lo que no debe considerarse un modelo listo para produccion sin evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun los tags del repositorio |
| Parametros totales | 124.770.816 (dato real de los pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible; el modelo base `goldfish-models/tam_taml_100mb` esta orientado al tamil (tam/taml) |
| Licencia | no disponible (la model card indica `licence: license` sin especificar terminos) |
| Formato de pesos | safetensors (compatible con transformers) |
| Modelo base | goldfish-models/tam_taml_100mb |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Version de transformers | 4.56.2 |
| Tamano del repositorio | 2,0 GB |
| Fecha de publicacion | 11 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only con atencion causal, en la linea de GPT-2, con 124.770.816 parametros. No se ha publicado la configuracion exacta de capas, dimension oculta o numero de cabezas de atencion de este checkpoint concreto, ni la longitud de contexto con la que fue entrenado. Por el tamano del modelo, es plausible que siga la configuracion tipo GPT-2 small (12 capas, 768 de dimension oculta), pero esto no esta confirmado en la informacion disponible.

El entrenamiento se realizo exclusivamente con SFT (supervised fine-tuning) mediante TRL, sobre el modelo base `goldfish-models/tam_taml_100mb`. Por el nombre del checkpoint, los datos de ajuste parecen ser sinteticos y de naturaleza formal: tareas tipo Dyck (verificacion de parentesis balanceados) y variantes con secuencias barajadas. El run de entrenamiento esta registrado en Weights & Biases bajo el proyecto `new_tokenizers`, lo que refuerza la hipotesis de que el objetivo del experimento es medir el efecto del tokenizador en el aprendizaje de estructuras formales. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas posteriores de RLHF o DPO; dado que la model card solo menciona SFT, se asume que no las hubo.

## Capacidades

- Generacion de texto autoregresiva: es la funcion declarada en el pipeline (`text-generation`).
- Seguimiento de instrucciones conversacionales: el ejemplo de la model card usa un formato de mensajes con rol de usuario y `return_full_text=False`, lo que indica que el ajuste SFT incorpora algun formato de chat o instrucciones, aunque no se documenta la plantilla exacta.
- Modelado de estructuras formales: por el nombre del checkpoint y el contexto del proyecto, esta entrenado especificamente en tareas de emparejamiento de parentesis tipo Dyck y en variantes con secuencias barajadas.
- Capacidades multilingues: no disponibles. El modelo base esta orientado al tamil, pero no hay confirmacion de que el fine-tune conserve esa competencia.
- Tool calling / function calling: no disponible, no hay evidencia en la informacion proporcionada.
- Uso como agente o razonamiento multi-paso: no disponible. Un modelo de 125 M de parametros no es adecuado para planificacion compleja.
- Capacidades especiales (modo thinking, vision, audio): no disponible; no se documenta ninguna.

## Casos de uso

- Investigacion sobre tokenizadores: el checkpoint permite reproducir y comparar como distintos esquemas de tokenizacion afectan al aprendizaje de gramaticas formales en modelos pequenos, usando el run de W&B como referencia experimental.
- Evaluacion de generalizacion en lenguajes formales: sirve para medir si un modelo entrenado con secuencias Dyck barajadas generaliza a cadenas de mayor profundidad o a variantes no vistas durante el entrenamiento.
- Reproducibilidad de experimentos con TRL: al estar entrenado con TRL 0.23.0 y Transformers 4.56.2, es util como referencia para validar pipelines de SFT y comparar configuraciones de hiperparametros.
- Punto de partida para nuevos fine-tunes: dado su tamano (125 M), se puede reentrenar o ajustar en una unica GPU consumer para experimentar con datos propios sobre el backbone Goldfish del tamil.
- Pruebas de infraestructura de despliegue: por su tamano reducido es util para validar extremo a extremo un stack de inferencia (pipeline de transformers, TGI, vLLM) antes de pasar a modelos mayores.
- Docencia y prototipado en local: sirve para ilustrar el ciclo completo de SFT y evaluacion en un curso o taller, ejecutandose en CPU o en una GPU con pocos gigabytes de VRAM.
- Generacion de texto en tamil: potencialmente aplicable si el fine-tune preserva la competencia del modelo base, pero esto no esta verificado ni documentado y requeriria evaluacion especifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas de lenguaje formal, y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos trataban sobre licencias de medicamentos en el Reino Unido y no guardan relacion con este checkpoint).

## Requisitos de hardware

- Peso de los pesos en precision completa (fp32): aproximadamente 499 MB (124,77 M de parametros x 4 bytes).
- Peso en fp16/bf16: aproximadamente 250 MB.
- Peso en int8: aproximadamente 125 MB; en int4, unos 62 MB (requiere cuantizacion propia, no incluida en el repositorio).
- VRAM estimada para inferencia con lote pequeno: del orden de 0,8 a 1,2 GB en fp16 (pesos mas cache KV, activaciones y sobrecarga de CUDA) y de 1,5 a 2 GB en fp32. Son estimaciones calculadas a partir del numero de parametros, no mediciones publicadas.
- Cache KV: asumiendo una configuracion tipo GPT-2 small (12 capas, 768 de dimension oculta) y 1024 tokens de contexto en fp16, serian unos 38 MB por secuencia. Estimacion orientativa, no confirmada.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente (T4, GTX 1650, RTX 3050, RTX 4090). Aceleradores como A100 o H100 funcionan, pero estan completamente sobredimensionados para este modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer de los ultimos anos, e incluso puede ejecutarse en CPU con latencias aceptables.
- Opciones de despliegue: pipeline de `transformers` (metodo documentado en la model card), Text Generation Inference (el tag `text-generation-inference` y `endpoints_compatible` lo indican), vLLM y cualquier servidor compatible con pesos safetensors de GPT-2. No hay archivos GGUF publicados, por lo que llama.cpp u Ollama requeririan una conversion previa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| fpadovani/tam-taml-100mb-ppt-shuff-dyck-100mb_seed10 | 124,77 M | no disponible | no disponible | HuggingFace, 0 descargas | Fine-tune SFT sobre datos aparentemente sinteticos (Dyck/shuffled) |
| goldfish-models/tam_taml_100mb | no disponible (mismo backbone) | no disponible | no disponible | HuggingFace (modelo base) | Modelo Goldfish orientado al tamil, sin ajuste SFT |
| gpt2 (referencia de escala) | 124 M | 1024 tokens | MIT | Ampliamente disponible | Solo como referencia de tamano; no esta especializado en tamil ni en tareas formales |

No se ha identificado en la informacion disponible ningun modelo comparable de la misma categoria (tamil de ~125 M ajustado con SFT sobre tareas de lenguaje formal), por lo que la comparativa se limita al modelo base y a una referencia de escala.

## Limitaciones y advertencias

- Licencia no especificada: la model card indica `licence: license` sin detallar terminos, por lo que no se puede confirmar que el uso comercial este permitido. Conviene contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue.
- Modelo no validado por la comunidad: 0 descargas y 0 "likes" en el momento de la consulta; no hay evaluaciones independientes.
- Sin datos de benchmarks: no hay evidencia publicada de calidad en generacion de texto, razonamiento, codigo o matematicas.
- Riesgo alto de alucinacion: con 125 M de parametros y un ajuste SFT aparentemente sintetico, la fidelidad factual y el seguimiento de instrucciones abiertas son previsiblemente limitados.
- Dominio de entrenamiento muy restringido: si los datos son efectivamente tareas Dyck y secuencias barajadas, el modelo puede degradar gravemente su capacidad de generar lenguaje natural, incluso en tamil.
- Idioma no confirmado: no se documenta que el fine-tune conserve la competencia en tamil del modelo base; el ajuste podria haberla reducido.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con contexto largo sin conocer la ventana real de entrenamiento.
- Sesgos: no evaluados. Al derivar de un corpus del proyecto Goldfish y de datos sinteticos, los sesgos del modelo base y los artefactos de los datos sinteticos no estan caracterizados.
- Sin cuantizaciones publicadas: cualquier despliegue en formatos GGUF, GPTQ o AWQ requiere conversion y validacion por cuenta propia.
- Adecuacion a produccion: no se recomienda su uso en atencion al cliente, generacion de codigo ni tareas de agentes sin una evaluacion exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/tam-taml-100mb-ppt-shuff-dyck-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/tam_taml_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/avuulqm9
- Documentacion de pipelines de transformers: https://huggingface.co/docs/transformers/main_classes/pipelines

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a licencias de medicamentos en el Reino Unido y son ajenos al contenido de esta ficha.
