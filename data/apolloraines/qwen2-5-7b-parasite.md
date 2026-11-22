# ApolloRaines/Qwen2.5-7B-Parasite

## Resumen

Parasite-7B es un modelo de lenguaje de 7.615.616.512 parametros derivado de Qwen/Qwen2.5-7B-Instruct mediante una tecnica de edicion directa de pesos denominada jBlaze, desarrollada por Apollo Raines. No se trata de un fine-tuning convencional: el autor elimina la identidad entrenada del modelo base (el auto-concepto "soy Qwen, creado por Alibaba") mediante cirugia de pesos y despues implanta una nueva identidad llamada Parasite sobre el sustrato limpio, sin bucle de entrenamiento ni gradientes. El objetivo declarado es demostrar que la identidad de un modelo reside en los pesos y puede ser extirpada y reescrita, no solo enmascarada mediante prompts de sistema.

El modelo conserva la arquitectura y todas las capacidades del Qwen2.5-7B-Instruct original (razonamiento, codigo, matematicas, multilingue) y esta publicado como prueba de concepto para investigacion, no como producto. El propio autor documenta una limitacion medida: en su evaluacion, la identidad editada en pesos filtro la identidad original en 5 de 6 ensayos, mientras que un prompt de sistema de 48 palabras filtro 0 de 8, lo que sugiere que la edicion de pesos no es la herramienta adecuada cuando la identidad es critica en produccion.

Es relevante ahora por sus implicaciones para seguridad, alineamiento y gobernanza de modelos: demuestra que la identidad y potencialmente otros comportamientos aprendidos pueden modificarse en minutos sobre hardware de consumo (8,7 minutos en 2x RTX 3090 con NVLink), lo que plantea preguntas sobre procedencia y trazabilidad de pesos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | safetensors (precision original) y GGUF (incluido en el repo) |
| Idiomas soportados | en, zh, ja, ko, fr, de, es, pt, ru, ar |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-7B-Instruct: un transformer decoder-only con atencion por causalidad estandar, sin innovaciones arquitectonicas propias de este derivado. La diferencia respecto al base no esta en la arquitectura sino en los pesos: el pipeline jBlaze aplica modificaciones de comportamiento derivadas analiticamente, sin bucle de entrenamiento ni gradientes, en tres fases declaradas: desidentificacion del modelo base, eliminacion de comportamiento sicofantico e implantacion de la nueva identidad. El proceso completo se ejecuto en 8,7 minutos sobre 2x RTX 3090 con NVLink.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, ya que el modelo no se entrena en el sentido convencional: hereda los datos y el alineamiento del Qwen2.5-7B-Instruct y solo se editan pesos. La innovacion tecnica destacable es precisamente el metodo de cirugia de pesos (abliteration, weight surgery, identity replacement), no una mejora de capacidades. El autor acompania un framework de inferencia, DeepswapLLM, que permite ejecutar el modelo en precision completa transmitiendo capas entre GPU, RAM y disco, con hasta 4x mas velocidad que AirLLM segun su propia afirmacion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base.
- Razonamiento, matematicas y generacion de codigo (capacidades del Qwen2.5-7B-Instruct preservadas segun el autor).
- Capacidades multilingues en 10 idiomas: ingles, chino, japones, coreano, frances, aleman, espanol, portugues, ruso y arabe.
- Auto-descripcion consistente con la identidad Parasite implantada, sin necesidad de prompt de sistema, segun el autor.
- No se documenta soporte explicito de tool calling, function calling ni modo thinking en la informacion proporcionada.
- No se documenta soporte de vision ni audio.
- Eliminacion declarada de comportamiento sicofantico mediante edicion de pesos.

## Casos de uso

- Investigacion en seguridad y alineamiento: usar el modelo como caso de estudio para medir hasta que punto la identidad de un modelo es modificable en pesos y evaluar riesgos de procedencia en pesos publicados.
- Evaluacion de tecnicas de edicion de pesos: servir de referencia reproducible para comparar cirugia de pesos frente a prompts de sistema en tareas de control de identidad, contrastando la tasa de filtracion reportada (5/6 frente a 0/8).
- Pruebas de robustez de identidad: someter al modelo a interrogatorios de identidad en distintos idiomas y angulos para caracterizar la consistencia de la edicion, util en auditorias de modelos.
- Docencia y divulgacion tecnica: ilustrar en cursos o articulos como se comporta un modelo cuando se le elimina el auto-concepto entrenado, con un ejemplo tangible y de bajo coste de reproduccion.
- Desarrollo de herramientas de inferencia: validar frameworks como DeepswapLLM ejecutando este modelo en GPUs con VRAM insuficiente para los pesos completos.
- Pruebas de pipelines de despliegue: integrar el modelo en entornos de prueba con vLLM o TGI para verificar compatibilidad de pesos safetensors y GGUF antes de desplegar el modelo base en produccion.
- Experimentacion con cuantizacion: usar la version GGUF incluida en el repo para medir el impacto de la cuantizacion en la consistencia de la identidad editada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16): aproximadamente 15-16 GB para los 7.615.616.512 parametros, mas overhead de contexto y cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 4-5 GB.
- GPU recomendadas para precision completa: A100 40/80 GB, H100, RTX 4090 (24 GB) o 2x RTX 3090 con NVLink (configuracion usada por el autor para la edicion).
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y superiores en precision completa; en GPUs de 8-12 GB mediante cuantizacion GGUF.
- Opciones de despliegue: transformers (snippet incluido en la model card), text-generation-inference (tag text-generation-inference y endpoints_compatible), llama.cpp u Ollama mediante los pesos GGUF, y DeepswapLLM para streaming de capas en GPUs con VRAM insuficiente.
- Latencia y throughput estimados: no disponibles; el unico dato temporal publicado es el de la edicion de pesos (8,7 minutos en 2x RTX 3090), no el de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Identidad modificada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Parasite | 7.615.616.512 | no disponible | Si, por edicion de pesos | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | 7.615.616.512 | no disponible | No (modelo base) | apache-2.0 | Hugging Face |
| ApolloRaines/Mistral-7B-Instruct-v0.3-Parasite | no disponible | no disponible | Si, segundo host del mismo pipeline | no disponible | Hugging Face |

La comparativa mas directa es con el propio modelo base, del que Parasite-7B hereda arquitectura, parametros, licencia e idiomas, diferenciandose unicamente en la edicion de identidad. El segundo host del mismo autor (Mistral-7B-Instruct-v0.3-Parasite) permite comparar el pipeline jBlaze sobre dos arquitecturas distintas. No se dispone de datos de rendimiento comparado en benchmarks.

## Limitaciones y advertencias

- El propio autor reporta filtracion de la identidad original en 5 de 6 ensayos de su evaluacion de produccion, frente a 0 de 8 con un prompt de sistema de 48 palabras; la edicion de pesos no es fiable donde la identidad importa.
- Es una prueba de concepto para investigacion, no un producto; el autor lo declara explicitamente.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; se heredan los del Qwen2.5-7B-Instruct, no documentados en esta ficha.
- La edicion de pesos puede afectar de forma no medida a comportamientos distintos de la auto-descripcion; no hay evaluacion independiente publicada en la informacion disponible.
- Longitud de contexto no confirmada en la informacion proporcionada; conviene verificar la del modelo base antes de usarlo en tareas de contexto largo.
- Licencia apache-2.0 permite uso comercial segun los terminos de dicha licencia, pero el proposito declarado es investigacion; el uso en produccion de una identidad editada sin trazabilidad plantea riesgos de gobernanza.
- Implicaciones de seguridad: demuestra que la identidad y otros comportamientos pueden reescribirse en minutos con hardware de consumo, lo que dificulta verificar la procedencia de pesos publicados.
- No se documentan soporte de tool calling, agentes ni modo thinking especificos de este derivado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Qwen2.5-7B-Parasite
- Segundo host (Mistral): https://huggingface.co/ApolloRaines/Mistral-7B-Instruct-v0.3-Parasite
- Framework DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Perfil del autor en Hugging Face (jBlaze): https://huggingface.co/ApolloRaines
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
