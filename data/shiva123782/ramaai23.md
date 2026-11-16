# shiva123782/RamaAi23

## Resumen

RamaAi23 es un ajuste fino (fine-tuning) mediante LoRA del modelo base SmolLM2-360M-Instruct, desarrollado por el usuario shiva123782 bajo la etiqueta "shiva-ai-labs". Se distribuye como un adaptador PEFT sobre el modelo base de HuggingFaceTB, no como un modelo completo e independiente. Su propósito declarado es el de un modelo de lenguaje pequeno (SLM) orientado a instrucciones, con una identidad de marca propia ("RamaAi23", creada por "shiva-ai-labs") inculcada durante el entrenamiento.

El modelo hereda la arquitectura del transformer decoder-only de SmolLM2-360M-Instruct, con 361.821.120 parametros totales, y se ha afinado sobre el dataset tatsu-lab/alpaca, un corpus de instrucciones en ingles. El repositorio ocupa 0,7 GB e incluye unicamente los pesos del adaptador LoRA en formato safetensors, por lo que requiere cargar primero el modelo base para su uso.

La relevancia de esta ficha es limitada: se trata de un experimento de ajuste fino de un modelo muy pequeno, sin descargas ni interacciones en el momento de la consulta y sin benchmarks publicados. Resulta util como ejemplo de flujo de trabajo LoRA/PEFT sobre SmolLM2, pero no como un modelo de proposito general para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-360M-Instruct), ajuste fino mediante LoRA/PEFT |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base HuggingFaceTB/SmolLM2-360M-Instruct |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parametros. El entrenamiento se realizo con tecnicas de ajuste eficiente de parametros (LoRA/QLoRA, segun la model card), lo que implica que solo se actualizo un subconjunto reducido de pesos del adaptador, no la totalidad del modelo. El dataset de ajuste es tatsu-lab/alpaca, un corpus de instrucciones en ingles ampliamente utilizado en experimentos de instruction tuning.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La model card menciona un objetivo de comportamiento de identidad (que el modelo responda como "RamaAi23" creado por "shiva-ai-labs"), descrito explicitamente como una meta de entrenamiento y no como una garantia.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste de instrucciones del modelo base.
- Respuesta a instrucciones simples, con el formato de chat de SmolLM2 (`<|im_start|>user ... <|im_end|>`).
- Identidad de marca propia: responde como "RamaAi23" desarrollado por "shiva-ai-labs" ante preguntas de identidad.
- Capacidad de fusion del adaptador en un modelo monolito standalone (`merge_and_unload`) para servir con vLLM, Ollama o llama.cpp.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Experimentacion con LoRA/PEFT: sirve como ejemplo practico de como ajustar un SLM sobre Alpaca y fusionar el adaptador para despliegue, util para desarrolladores que aprenden el flujo.
- Prototipado de asistentes conversacionales en ingles: al ser un modelo de 360M, permite iterar rapidamente en local con requisitos de hardware minimos.
- Pruebas de identidad y personalidad de marca: util para validar tecnicas de inyeccion de identidad en modelos pequenos antes de escalar a modelos mayores.
- Despliegue en entornos con recursos muy limitados: su tamano permite ejecucion en CPU o GPU de gama baja para tareas de generacion de texto corto.
- Educacion e investigacion: como caso de estudio de fine-tuning eficiente y de las limitaciones de los modelos de 360M frente a modelos mayores.
- Generacion de texto auxiliar de baja complejidad (respuestas cortas, clasificacion simple de instrucciones) en pipelines donde el coste computacional es critico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es ligero (repo de 0,7 GB), pero requiere cargar el modelo base de 360M. En fp16, el modelo base ocupa aproximadamente 0,7 GB de VRAM; en fp32, alrededor de 1,4 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, etc.); tambien es viable en CPU para inferencia de baja latencia.
- Cabe holgadamente en GPU consumer e incluso en entornos integrados; no requiere GPU de datacenter (A100, H100) salvo para entrenamiento a gran escala.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), o fusion del adaptador (`merge_and_unload`) para servir con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera baja latencia en GPU consumer, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RamaAi23 | 361,8 M | no disponible | apache-2.0 | Adaptador PEFT | Ajuste LoRA sobre SmolLM2-360M-Instruct, solo ingles |
| SmolLM2-360M-Instruct (base) | 360 M | no disponible | apache-2.0 | Modelo completo | Modelo base oficial de HuggingFaceTB |
| SmolLM2-135M-Instruct | 135 M | no disponible | apache-2.0 | Modelo completo | Version mas pequena de la familia SmolLM2 |
| Modelos de ~360M comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks para comparar rendimiento |

## Limitaciones y advertencias

- Modelo de solo 360M parametros: capacidad de razonamiento, conocimiento factual y coherencia limitadas en comparacion con modelos mayores.
- Entrenado unicamente en ingles (segun la etiqueta de idioma); no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo elevado de alucinacion por el tamano reducido y el dataset de ajuste (Alpaca), de calidad y cobertura limitadas.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su rendimiento.
- La identidad de marca inculcada es un objetivo de entrenamiento, no una garantia; puede no mantenerse de forma consistente.
- La licencia apache-2.0 se aplica al adaptador, pero conviene verificar los terminos del modelo base antes de un uso comercial.
- Sin descargas ni interacciones en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.
- Requiere cargar el modelo base por separado; no es un modelo autonomo salvo que se fusione el adaptador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shiva123782/RamaAi23
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/tatsu-lab/alpaca
- Vista de arquitectura (hfviewer): https://hfviewer.com/shiva123782/RamaAi23
