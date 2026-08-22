# filvyb/Qwen3.8-27B-heretic-ara-GGUF

## Resumen

El modelo `filvyb/Qwen3.8-27B-heretic-ara-GGUF` es una variante cuantizada en formato GGUF del modelo base Qwen3.8-27B, desarrollado originalmente por el equipo de Qwen. La version "heretic-ara" es un fine-tune realizado por el autor filvyb, aunque la model card no incluye detalles sobre el proceso de ajuste ni sobre los datos utilizados. El modelo base, Qwen3.8-27B, fue publicado el 14 de agosto de 2026 bajo licencia Apache 2.0 y pesa 55,6 GB en BF16 safetensors, según la informacion disponible.

Esta ficha se centra en la variante GGUF, orientada a la inferencia local en hardware de consumo. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que la convierte en una opcion atractiva para integraciones en produccion. Sin embargo, la informacion publica sobre capacidades especificas, arquitectura interna y rendimiento es limitada, por lo que esta ficha refleja lo que se conoce con certeza y marca como "no disponible" el resto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (variante del Qwen3.8-27B base) |
| Parametros totales | 27 mil millones |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (existen versiones Q6_K y NVFP4 en otros repositorios) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo. El nombre sugiere que se basa en el Qwen3.8-27B, que segun el blog de AMD es un modelo de 27 mil millones de parametros con soporte Day 0 en procesadores AMD Ryzen AI y GPU Radeon. El modelo base se publico en safetensors BF16, y la variante "heretic-ara" ha sido convertida a GGUF para facilitar su ejecucion con herramientas como llama.cpp u Ollama. No hay datos sobre el dataset de entrenamiento, el numero de tokens o si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto: como modelo de 27B, es capaz de producir texto coherente en multiples dominios, aunque no hay benchmarks publicados que lo confirmen.
- Razonamiento y codigo: no hay informacion especifica sobre el rendimiento en tareas de razonamiento o programacion.
- Tool calling y agentes: no hay datos disponibles sobre soporte de function calling o capacidades de agente.
- Multilingue: no se especifican idiomas soportados; el modelo base de Qwen suele cubrir ingles y chino, pero esto no se ha confirmado para esta variante.
- Capacidades especiales: no hay informacion sobre modo thinking, vision o audio.

## Casos de uso

- Despliegue local en hardware AMD: el blog de AMD confirma que Qwen3.8 27B se ejecuta con LM Studio en procesadores Ryzen AI Max y GPU Radeon, lo que permite usar este GGUF en equipos personales sin GPU dedicada de alta gama.
- Prototipado rapido de chatbots: gracias a la licencia Apache 2.0 y al formato GGUF, se puede integrar en aplicaciones de prueba con llama.cpp u Ollama para validar flujos conversacionales.
- Experimentacion con cuantizaciones: existen variantes Q6_K y NVFP4 en otros repositorios, lo que facilita comparar el equilibrio entre calidad y consumo de memoria.
- Aplicaciones educativas de NLP: al ser un modelo abierto de 27B, puede usarse en entornos academicos para ensenar tecnicas de inferencia local y ajuste de prompts.
- Asistentes de documentacion: con un contexto adecuado, podria utilizarse para resumir o buscar informacion en documentos largos, aunque no se ha confirmado la longitud exacta de la ventana.
- Desarrollo de productos de IA generativa: dado su tamano y licencia permisiva, es candidato para integrarse en pipelines de generacion de contenido donde no se requiera una latencia minima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 27B en GGUF, la cuantizacion Q6_K requeriria aproximadamente 18-20 GB de VRAM; una cuantizacion Q4_K_M reduciria el requisito a unos 14-16 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o AMD Radeon RX 7900 XTX (24 GB) para cuantizaciones altas; para cuantizaciones mas bajas, una RTX 3090 (24 GB) o RTX 4080 (16 GB) podrian ser suficientes.
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de consumo con al menos 16 GB de VRAM, y en sistemas con RAM unificada como los AMD Ryzen AI Max.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con conversion previa a safetensors) y TGI (requiere formato compatible).
- Latencia y throughput: no hay datos publicos especificos para esta variante; dependera de la cuantizacion y del hardware utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | no disponible | Apache 2.0 | safetensors | Modelo original de Qwen |
| filvyb/Qwen3.8-27B-heretic-ara-GGUF | 27B | no disponible | Apache 2.0 | GGUF | Variante fine-tune |
| mradermacher/Qwen3.8-27B-heretic-ara-GGUF | 27B | no disponible | Apache 2.0 | GGUF | Otra version GGUF del mismo modelo |

No hay datos de rendimiento comparativo disponibles, por lo que no se puede evaluar la diferencia de calidad entre estas variantes.

## Limitaciones y advertencias

- Sin informacion sobre sesgos: no se han publicado evaluaciones de sesgo para esta variante ni para el modelo base.
- Riesgo de alucinacion: como cualquier LLM, puede generar contenido falso o inventado, especialmente en tareas de alta complejidad o con datos poco comunes.
- Limitaciones de contexto: la longitud de la ventana no esta documentada, lo que dificulta planificar su uso en tareas que requieran contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero hay que mantener el aviso de copyright y las condiciones de la licencia.
- Falta de documentacion: la model card no incluye informacion sobre el proceso de entrenamiento del fine-tune, lo que limita la confianza en su comportamiento especifico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/filvyb/Qwen3.8-27B-heretic-ara-GGUF
- Repositorio alternativo (mradermacher): https://huggingface.co/mradermacher/Qwen3.8-27B-heretic-ara-GGUF
- Repositorio con cuantizacion NVFP4 (dawncr0w): https://huggingface.co/dawncr0w/Qwen3.8-27B-Heretic-ARA-ModelOpt-NVFP4-GGUF
- Blog de AMD sobre ejecucion en Ryzen AI y Radeon: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guia de descarga del modelo base Qwen3.8-27B: https://www.orcarouter.ai/blog/qwen-3-8-27b-huggingface
