# GustavoAranda/glauciar

## Resumen

Glauciar es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B-Instruct, distribuido por el usuario GustavoAranda a traves de Hugging Face. El modelo se ha entrenado y convertido al formato GGUF utilizando la libreria Unsloth, una herramienta orientada a acelerar el ajuste fino de modelos de lenguaje y a facilitar su exportacion a formatos de inferencia local. El repositorio incluye un unico archivo de pesos cuantizado en Q4_K_M, lo que sugiere un enfoque hacia el despliegue en entornos con recursos limitados.

La relevancia de este modelo reside en su caracter practico: al estar basado en Qwen2.5-1.5B-Instruct, hereda las capacidades del modelo original (generacion de texto, razonamiento basico, soporte de conversacion multi-turno) y las empaqueta en un formato compatible con llama.cpp y Ollama. Esto permite su ejecucion en hardware de consumo, como portatiles o equipos sin GPU dedicada, lo que lo hace adecuado para prototipado rapido y aplicaciones de inferencia local.

No obstante, la informacion disponible es muy limitada: no se especifican los datos de entrenamiento del ajuste fino, el proposito concreto del mismo, la licencia ni los idiomas soportados. El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica que se trata de un modelo reciente o poco difundido. La ficha se completa con los datos tecnicos disponibles y se senalan explicitamente las carencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5) |
| Parametros totales | 1.543.714.304 (aproximadamente 1.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (archivo `Qwen2.5-1.5B-Instruct.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atencion causal estandar. Qwen2.5-1.5B-Instruct es la variante de 1.5 mil millones de parametros de la familia Qwen2.5 de Alibaba, disenada para instrucciones y conversacion. El ajuste fino realizado por GustavoAranda se llevo a cabo con Unsloth, una libreria que optimiza el entrenamiento mediante tecnicas de bajo rango (LoRA/QLoRA) y kernels personalizados, lo que permite entrenar aproximadamente el doble de rapido que los metodos convencionales, segun la propia model card.

No se dispone de informacion sobre el dataset de entrenamiento del ajuste fino, el numero de tokens utilizados, la composicion de los datos ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla si el ajuste fino modifica el tokenizador o la ventana de contexto original. La unica innovacion tecnica mencionada es el uso de Unsloth para el entrenamiento y la conversion a GGUF, lo que facilita la inferencia en CPU y GPU de consumo mediante llama.cpp.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas de Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones en formato chat (soporte de plantilla Jinja mediante `--jinja` en llama.cpp).
- Capacidad de ejecucion local en CPU y GPU de consumo gracias al formato GGUF y la cuantizacion Q4_K_M.
- Soporte de despliegue mediante llama.cpp (`llama-cli`) y Ollama (se incluye un Modelfile).
- No se ha confirmado soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues no documentadas; se desconoce si el ajuste fino conserva el soporte multilingue del modelo base.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: al ser un modelo de 1.5B en GGUF, se puede ejecutar en un portatil con llama.cpp u Ollama para probar flujos de chat sin infraestructura cloud, lo que acelera la iteracion en fases tempranas de desarrollo.
- Inferencia en entornos sin GPU: la cuantizacion Q4_K_M reduce el uso de memoria a aproximadamente 1 GB, permitiendo desplegar el modelo en Raspberry Pi, mini-PC o contenedores ligeros para tareas de generacion de texto de baja latencia.
- Educacion y experimentacion: sirve como ejemplo practico de ajuste fino con Unsloth y exportacion a GGUF, util para cursos o talleres sobre despliegue de modelos open source.
- Generacion de texto offline: aplicaciones de escritorio o moviles que requieren procesamiento de lenguaje natural sin conexion a internet, como resumen de notas o respuestas automaticas simples.
- Pruebas de integracion con Ollama: el Modelfile incluido permite validar pipelines de despliegue basados en Ollama en entornos de desarrollo y CI/CD.
- Base para futuros ajustes finos: al ser un modelo pequeno y ya cuantizado, puede servir como punto de partida para experimentos de destilacion o adaptacion a dominios especificos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para el archivo Q4_K_M (tamano del repo: 1.0 GB). El uso real de memoria puede ser ligeramente superior debido al contexto y a los buffers de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs integradas con suficiente memoria compartida. Tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo e incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -hf GustavoAranda/glauciar --jinja`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF (por ejemplo, llama-cpp-python).
- Latencia y throughput estimados: no disponibles. Dependen del hardware y de la longitud de contexto; en CPU se espera una velocidad de decodificacion moderada para un modelo de 1.5B en Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Glauciar (este modelo) | 1.5B | No disponible | No disponible | GGUF (Q4_K_M) | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 (segun Qwen) | Safetensors, GGUF | Hugging Face |
| Llama 3.2 1B Instruct | 1.2B | 128.000 tokens (segun Meta) | Llama 3.2 Community License | Safetensors, GGUF | Hugging Face |
| Gemma 2 2B | 2.6B | 8.192 tokens (segun Google) | Gemma Terms of Use | Safetensors, GGUF | Hugging Face |

Nota: los datos de los modelos comparativos provienen de sus respectivas documentaciones publicas y no de la informacion proporcionada en esta consulta; se incluyen como referencia general. Para Glauciar no se dispone de datos de contexto ni licencia.

## Limitaciones y advertencias

- No se dispone de informacion sobre la licencia, lo que impide determinar si el uso comercial esta permitido. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- El modelo es un ajuste fino de Qwen2.5-1.5B-Instruct; hereda los sesgos y limitaciones del modelo base, pero no se documentan sesgos especificos del ajuste.
- Riesgo de alucinacion inherente a los modelos de 1.5B, especialmente en tareas de razonamiento complejo o conocimiento factual.
- No se especifican los idiomas soportados; se desconoce si el ajuste fino mantiene el multilingueismo del modelo base o lo ha restringido.
- La longitud de contexto no esta documentada; se desconoce si se ha modificado respecto al modelo original.
- El repositorio tiene cero descargas y cero likes, lo que sugiere falta de validacion por parte de la comunidad.
- No hay informacion sobre el dataset de entrenamiento, lo que impide evaluar posibles sesgos introducidos por el ajuste fino.
- El unico archivo disponible es Q4_K_M; no se ofrecen otras cuantizaciones ni pesos sin cuantizar.

## Enlaces

- Hugging Face: https://huggingface.co/GustavoAranda/glauciar
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
