# ggml-org/SmolLM2-135M-GGUF

## Resumen

SmolLM2-135M-GGUF es la version cuantizada en formato GGUF del modelo SmolLM2-135M desarrollado por Hugging Face (HuggingFaceTB), publicada y convertida automaticamente por el equipo de ggml-org mediante su herramienta de conversion. Se trata de un modelo de lenguaje de tipo transformer decoder-only con 134.515.008 parametros, disenado para generacion de texto y pensado para ejecutarse en hardware muy limitado, incluyendo dispositivos de borde y entornos de CPU.

La relevancia de esta publicacion radica en su formato: al estar en GGUF, el modelo puede ejecutarse directamente con llama.cpp y herramientas derivadas como el cliente `llama` de llama.app, lo que facilita su despliegue en portatiles, Raspberry Pi o incluso moviles sin necesidad de GPU dedicada. El repositorio ocupa aproximadamente 0,5 GB, lo que refleja el conjunto de cuantizaciones disponibles para un modelo de este tamano.

SmolLM2 forma parte de la familia de modelos pequenos de Hugging Face orientada a eficiencia computacional. Este modelo base de 135M de parametros sirve como punto de partida para tareas ligeras de generacion, experimentacion con tecnicas de cuantizacion y como base para fine-tuning en dominios especificos donde el coste de inferencia es critico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base SmolLM2-135M) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF cuantizado (variantes concretas no detalladas en la model card) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card de este repositorio no incluye informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento. Se sabe que el modelo base es SmolLM2-135M de HuggingFaceTB, un transformer decoder-only de 134,5 millones de parametros. Esta publicacion concreta es una conversion automatica realizada con la herramienta https://github.com/ggml-org/convert, que transforma los pesos originales del modelo base a formato GGUF y aplica cuantizacion para reducir el peso y los requisitos de memoria.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de RLHF o DPO, ni sobre innovaciones tecnicas especificas del modelo base. Para esos detalles seria necesario consultar la model card del modelo original en HuggingFaceTB/SmolLM2-135M.

## Capacidades

- Generacion de texto autoregresiva, limitada por el tamano del modelo (135M de parametros).
- Ejecucion en CPU y en hardware de bajos recursos gracias al formato GGUF.
- Compatible con el ecosistema llama.cpp, incluyendo el cliente `llama` de llama.app.
- Despliegue mediante el comando `llama serve -hf ggml-org/SmolLM2-135M-GGUF`.
- Compatible con endpoints (tag `endpoints_compatible`).
- Capacidades de razonamiento, codigo, matematicas, vision, tool calling, agentes o modo thinking: no disponibles en la informacion proporcionada.
- Soporte multilingue: no disponible.

## Casos de uso

- Prototipado rapido en local: permite validar pipelines de generacion de texto en un portatil sin GPU, usando llama.cpp o el cliente `llama`, gracias a su tamano de 0,5 GB y su formato GGUF.
- Experimentacion con cuantizacion: sirve como banco de pruebas para comparar variantes GGUF y medir el impacto en calidad y velocidad en hardware modesto.
- Fine-tuning de base para dominios acotados: al ser un modelo de 135M con licencia Apache 2.0, puede adaptarse a tareas especificas (clasificacion ligera, generacion de plantillas) con costes de entrenamiento minimos.
- Despliegue en dispositivos de borde: su reducido tamano permite ejecutarlo en Raspberry Pi, routers o sistemas embebidos con Linux para tareas de generacion de texto simple o autocompletado.
- Educacion e investigacion: util para demostrar el funcionamiento interno de un LLM en cursos o talleres, ya que la inferencia es rapida y el modelo cabe en memoria de cualquier equipo.
- Generacion de texto auxiliar en herramientas CLI: integrable en scripts de terminal mediante `llama serve` para tareas como resumen de lineas de log o generacion de mensajes cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cuantizaciones de 4 bits; el repositorio completo ocupa aproximadamente 0,5 GB.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es mas que suficiente si se desea aceleracion.
- Cabe en cualquier GPU consumer, incluidas las de gama baja, y tambien en CPU.
- Opciones de despliegue: llama.cpp, cliente `llama` de llama.app (`llama serve -hf ggml-org/SmolLM2-135M-GGUF`), y cualquier runtime compatible con GGUF. vLLM, TGI u Ollama no se mencionan en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2-135M-GGUF (este) | 134.515.008 | no disponible | apache-2.0 | GGUF | Hugging Face (ggml-org) |
| SmolLM2-135M (base) | 134.515.008 | no disponible | apache-2.0 | safetensors (original) | Hugging Face (HuggingFaceTB) |
| Alternativas de tamano similar (Qwen2.5-0.5B, TinyLlama-1.1B) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer una comparativa cuantitativa con otros modelos.

## Limitaciones y advertencias

- Modelo de 135M de parametros: la calidad de generacion y el conocimiento factual son limitados en comparacion con modelos de mayor tamano; no es adecuado para tareas que requieran razonamiento complejo.
- Riesgo elevado de alucinacion: al ser un modelo pequeno, la probabilidad de generar contenido incorrecto o inventado es alta.
- Idiomas soportados no especificados en la model card; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles.
- Longitud de contexto no documentada en la informacion disponible.
- La model card no detalla el proceso de cuantizacion ni las variantes incluidas; conviene verificar los ficheros del repositorio antes de usarlo en produccion.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los terminos del modelo base original y citar adecuadamente.
- Conversion automatica: al haber sido generado por una herramienta automatica, no se garantiza una validacion manual exhaustiva de cada cuantizacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggml-org/SmolLM2-135M-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Herramienta de conversion: https://github.com/ggml-org/convert
- Llama app: https://llama.app
