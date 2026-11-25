# liodon-ai/Qwen2.5-Coder-1.5B-imatrix-GGUF

## Resumen

Qwen2.5-Coder-1.5B-imatrix-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo Qwen2.5-Coder-1.5B, publicado por Liodon AI. No se trata de un modelo entrenado desde cero, sino de una redistribucion optimizada del modelo base de Alibaba Qwen, orientada a inferencia local en CPU y GPU de gama baja mediante llama.cpp, Ollama, LM Studio o Jan.

El valor anadido de esta publicacion es el uso de calibracion iMatrix: se ejecutan 128 fragmentos de calibracion (2 millones de tokens de WikiText-103) a traves del modelo en precision completa para identificar que pesos son mas sensibles, y se asigna mas precision a esos pesos durante la cuantizacion. El resultado, segun el autor, es una mejora de coherencia y seguimiento de instrucciones a igualdad de tamano de fichero, especialmente en cuantizaciones de 2, 3 y 4 bits.

El modelo base Qwen2.5-Coder-1.5B tiene 1.543.714.304 parametros y esta especializado en generacion de codigo. Esta publicacion resulta relevante para desarrolladores que necesitan un asistente de codigo ligero, desplegable en hardware modesto (incluso por debajo de 2 GB de VRAM en las cuantizaciones mas agresivas) y compatible con el ecosistema GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), modelo base Qwen2.5-Coder-1.5B |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | other (heredada del modelo base Qwen2.5-Coder-1.5B) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-Coder-1.5B, un transformer decoder-only de la familia Qwen2.5, con 1.543.714.304 parametros. Esta publicacion no entrena el modelo: parte de los pesos originales de Alibaba Qwen y los convierte a GGUF mediante cuantizacion con calibracion iMatrix.

El proceso de iMatrix consiste en pasar 128 fragmentos de calibracion (2 millones de tokens de WikiText-103) por el modelo en precision completa para estimar la importancia de cada peso, y despues asignar precision de forma no uniforme. El autor indica que esto produce mejor coherencia y seguimiento de instrucciones en Q2, Q3 y Q4 a igualdad de tamano de fichero. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO en el modelo base dentro de la informacion proporcionada.

## Capacidades

- Generacion de texto y codigo: el modelo base esta especializado en tareas de programacion (autocompletado, generacion de funciones, explicacion de codigo).
- Razonamiento sobre codigo y matematicas basicas, segun las capacidades del modelo base Qwen2.5-Coder.
- Conversacion multi-turno: la publicacion incluye la etiqueta `conversational` y `endpoints_compatible`.
- Despliegue local: compatible con llama.cpp, Ollama, LM Studio y Jan.
- Cuantizaciones sub-4-bit (IQ2_M, IQ3_M) para entornos con menos de 1 GB de VRAM estimada.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para esta cuantizacion concreta; depende de las capacidades del modelo base.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible / no aplica en la informacion proporcionada.

## Casos de uso

- Autocompletado de codigo en el editor: con Q4_K_M (0.99 GB) se puede ejecutar un asistente de completado en local sobre una GPU de 4-8 GB o incluso en CPU, con latencia baja por el reducido tamano del modelo.
- Generacion de tests unitarios y documentacion: el modelo puede redactar docstrings y casos de prueba para funciones existentes, integrable en pipelines de CI/CD mediante llama.cpp u Ollama.
- Asistente de codigo en portatiles sin GPU dedicada: las cuantizaciones IQ2_M (0.60 GB) e IQ3_M (0.78 GB) permiten inferencia en CPU con requisitos de memoria muy bajos.
- Prototipado rapido de agentes de codigo: al ser compatible con endpoints y con Ollama, se puede conectar a frameworks de agentes para tareas de refactorizacion o explicacion de errores.
- Educacion y aprendizaje de programacion: el modelo puede explicar fragmentos de codigo y sugerir correcciones en un entorno local sin enviar datos a la nube.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse localmente, el codigo del usuario no sale del equipo, lo que encaja en entornos con requisitos de confidencialidad.
- Evaluacion de cuantizaciones: util para comparar el impacto de iMatrix frente a cuantizaciones estandar (el autor publica tambien `liodon-ai/Qwen2.5-Coder-1.5B-GGUF` sin iMatrix).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada por cuantizacion (segun el autor):
  - IQ2_M (0.60 GB): ~1 GB
  - IQ3_M (0.78 GB): ~1 GB
  - IQ4_XS (0.90 GB): ~1 GB
  - Q4_K_M (0.99 GB): ~1 GB (recomendada)
  - Q5_K_M (1.13 GB): ~1 GB
  - Q6_K (1.27 GB): ~1 GB
  - Q8_0 (1.65 GB): ~2 GB
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, cualquier GPU consumer con 2 GB o mas de VRAM puede alojar las cuantizaciones mas grandes, y las sub-4-bit caben en ~1 GB.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -hf liodon-ai/Qwen2.5-Coder-1.5B-imatrix-GGUF:Q4_K_M`), Ollama (`ollama run hf.co/liodon-ai/Qwen2.5-Coder-1.5B-imatrix-GGUF:Q4_K_M`), LM Studio y Jan.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-imatrix-GGUF (esta publicacion) | 1.543.714.304 | no disponible | GGUF (IQ2_M a Q8_0) | other | Cuantizacion iMatrix, 7 variantes |
| Qwen/Qwen2.5-Coder-1.5B (base) | 1.543.714.304 | no disponible | safetensors | other | Modelo original sin cuantizar |
| liodon-ai/Qwen2.5-Coder-1.5B-GGUF | 1.543.714.304 | no disponible | GGUF | other | Cuantizacion estandar sin iMatrix |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion: como todo modelo de 1.5B, puede generar codigo sintacticamente plausible pero incorrecto; requiere validacion en produccion.
- Sesgos: no disponible informacion especifica sobre sesgos del modelo base en la informacion proporcionada.
- Contexto e idiomas: la longitud de contexto y los idiomas soportados no estan documentados en esta publicacion; conviene consultar la model card del modelo base Qwen2.5-Coder-1.5B.
- Licencia: la licencia figura como "other", heredada del modelo base; es imprescindible revisar los terminos de Qwen2.5-Coder-1.5B antes de uso comercial.
- Cuantizaciones sub-4-bit: IQ2_M e IQ3_M priorizan tamano sobre calidad; el propio autor recomienda Q4_K_M como opcion equilibrada.
- Modelo pequeno: no es adecuado para tareas de razonamiento complejo o generacion de codigo de gran escala; su uso optimo es autocompletado y tareas acotadas.
- Fecha de publicacion: el repositorio figura creado en 2026-11-23, dato que conviene verificar en la pagina de Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/Qwen2.5-Coder-1.5B-imatrix-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Cuantizaciones sin iMatrix: https://huggingface.co/liodon-ai/Qwen2.5-Coder-1.5B-GGUF
- Dataset de calibracion WikiText-103: https://huggingface.co/datasets/wikitext
- Perfil del autor: https://huggingface.co/liodon-ai
