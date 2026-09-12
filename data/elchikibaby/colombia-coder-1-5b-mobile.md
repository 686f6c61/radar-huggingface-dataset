# Elchikibaby/colombia-coder-1.5b-mobile

## Resumen

colombia-coder-1.5b-mobile es un modelo de lenguaje conversacional publicado por el usuario Elchikibaby en HuggingFace. Se trata de un fine-tuning del modelo base Qwen2.5-Coder-1.5B-Instruct (identificable por el nombre del archivo de pesos incluido) convertido a formato GGUF mediante Unsloth, y orientado segun su nombre a tareas de generacion de codigo y a su despliegue en dispositivos moviles o entornos con recursos limitados.

El repositorio contiene 1.543.714.304 parametros totales (aproximadamente 1,54 mil millones) en un unico archivo cuantizado Q3_K_M, con un tamano de repo de 0,8 GB. La arquitectura subyacente es la de la familia Qwen2, un transformer decoder-only con atencion causal, aunque la model card no detalla ni la composicion del dataset de fine-tuning ni el proceso de entrenamiento mas alla de la mencion a Unsloth.

La relevancia de esta ficha es limitada: el modelo acumula 0 descargas y 0 likes, no declara licencia, idiomas ni pipeline, y la busqueda web no ha devuelto informacion tecnica asociada. Se trata por tanto de una publicacion experimental sin validacion publica, y su evaluacion debe abordarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, segun tag `qwen2` y nombre del archivo) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-Coder-1.5B-Instruct declara 32.768 tokens, pero no se confirma que se mantenga tras el fine-tuning |
| Tipos de cuantizacion | GGUF Q3_K_M (unico archivo publicado: `qwen2.5-coder-1.5b-instruct.Q3_K_M.gguf`) |
| Idiomas soportados | no disponible (el nombre sugiere orientacion a castellano/Colombia, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | GGUF (incluye Modelfile para Ollama) |

## Arquitectura y entrenamiento

La informacion disponible indica unicamente que el modelo fue afinado y convertido a GGUF usando Unsloth, una libreria especializada en fine-tuning eficiente (LoRA/QLoRA) que reduce el uso de memoria y acelera el entrenamiento. El tag `qwen2` y el nombre del archivo de pesos (`qwen2.5-coder-1.5b-instruct`) apuntan a que el modelo parte de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y atencion con RoPE. No obstante, no se ha publicado en la model card ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Tampoco se documentan innovaciones tecnicas propias (decodificacion especulativa, atencion lineal, modo de razonamiento explicito, etc.). La unica adaptacion reseñable es la cuantizacion a Q3_K_M, que reduce el peso del modelo hasta 0,8 GB para facilitar su ejecucion en moviles y equipos de bajos recursos mediante llama.cpp.

## Capacidades

- Generacion de texto conversacional (tag `conversational`).
- Generacion de codigo, heredada previsiblemente del modelo base Qwen2.5-Coder, aunque no se aportan ejemplos ni evaluaciones que lo confirmen.
- Razonamiento basico y respuesta a instrucciones, condicionado al fine-tuning del que no se detalla nada.
- Tool calling / function calling: no confirmado en la model card; llama.cpp soporta plantillas Jinja (`--jinja`), lo que habilita el uso de plantillas de chat, pero no garantiza el soporte funcional de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el nombre del modelo sugiere un sesgo hacia castellano de Colombia, sin evidencia publicada.
- Capacidad multimodal: no aplica; las instrucciones de la model card mencionan un comando para modelos multimodales a modo de plantilla generica, pero este modelo es solo texto.

## Casos de uso

- Asistente de codigo embebido en movil: gracias a su tamano de 0,8 GB en Q3_K_M, puede ejecutarse en un telefono con llama.cpp u Ollama y ofrecer autocompletado o explicaciones de fragmentos de codigo sin conexion.
- Prototipado rapido en portatiles sin GPU: el modelo cabe en RAM de un portatil convencional y permite iterar sobre prompts e ideas de aplicaciones sin depender de servicios en la nube.
- Generacion de fragmentos de codigo en entornos educativos: util como apoyo en clases de programacion para explicar funciones o proponer ejemplos sencillos, siempre con supervision humana.
- Tareas de texto en castellano (si el fine-tuning confirma ese sesgo): redaccion de mensajes breves, resumenes de baja complejidad o respuestas conversacionales en aplicaciones locales.
- Automatizacion de scripts en equipos de bajos recursos: integrable en un Modelfile de Ollama para generar pequenos scripts de shell o Python dentro de un flujo de trabajo local.
- Pruebas de concepto de agentes locales: sirve para validar arquitecturas de agentes con llamadas a herramientas en un entorno de desarrollo, dado su bajo coste de despliegue.
- Evaluacion comparativa de fine-tunings de Qwen2.5-Coder: util como punto de referencia en experimentos academicos sobre cuantizacion agresiva (Q3_K_M) y su impacto en la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con el archivo Q3_K_M publicado: aproximadamente 1,0 GB de pesos, mas el overhead del contexto y del runtime (en la practica, entre 1,5 y 2 GB de RAM/VRAM).
- En precision FP16 el modelo ocuparia aproximadamente 3,1 GB, pero no se publica ese formato.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas con memoria compartida.
- Ejecutable en CPU y en dispositivos moviles (Android/iOS mediante bindings de llama.cpp), dado su tamano.
- Opciones de despliegue: llama.cpp (`llama-cli -hf Elchikibaby/colombia-coder-1.5b-mobile --jinja`), Ollama (el repositorio incluye un Modelfile), LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que no son la via recomendada.
- Latencia y throughput: no disponibles; dependeran del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| colombia-coder-1.5b-mobile | ~1,54 B | no disponible | no disponible | GGUF Q3_K_M en HuggingFace | Fine-tuning sin benchmarks publicados |
| Qwen2.5-Coder-1.5B-Instruct | ~1,54 B | 32.768 tokens | Apache 2.0 (segun el modelo base) | safetensors y GGUF | Modelo base, con evaluaciones publicadas por el autor original |
| Qwen2.5-Coder-0.5B-Instruct | ~0,49 B | 32.768 tokens | Apache 2.0 (segun el modelo base) | safetensors y GGUF | Alternativa mas ligera para movil |
| Llama-3.2-1B-Instruct | ~1,24 B | 128.000 tokens | Llama 3.2 Community License | safetensors y GGUF | Alternativa generalista de tamano similar |

La comparacion cuantitativa de rendimiento no es posible: este repositorio no publica benchmarks y la busqueda web no ha devuelto datos tecnicos sobre el modelo.

## Limitaciones y advertencias

- Licencia no declarada: no se puede garantizar el uso comercial ni la redistribucion, lo que supone un riesgo legal relevante para produccion.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en codigo, razonamiento, matematicas ni idiomas.
- Cero descargas y cero likes: no existe validacion por parte de la comunidad ni informes de fallos.
- Model card extremadamente escueta: no se documentan datos de entrenamiento, hiperparametros, composicion del dataset ni proceso de alineacion.
- Riesgo elevado de alucinacion inherente a los modelos de ~1,5 B de parametros, agravado por la cuantizacion Q3_K_M, que degrada la calidad respecto a precisiones superiores.
- Contexto efectivo desconocido: el modelo base soporta 32.768 tokens, pero el fine-tuning y la cuantizacion pueden haber reducido la calidad en contextos largos.
- Idiomas no confirmados: la orientacion a castellano de Colombia es una inferencia derivada del nombre, no una especificacion documentada.
- La fecha de creacion registrada (2026-09-11) y la falta de metadatos adicionales dificultan situar el modelo en un contexto de versionado fiable.
- No se recomienda su uso en produccion sin una evaluacion propia previa sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Elchikibaby/colombia-coder-1.5b-mobile
- Unsloth (libreria usada para el fine-tuning y la conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime GGUF recomendado): https://github.com/ggml-org/llama.cpp
- Modelo base de referencia Qwen2.5-Coder-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Ollama (despliegue mediante Modelfile): https://ollama.com
