# pranil00/ONIX-starcoder2-33b-GGUF

## Resumen

ONIX-starcoder2-33b-GGUF es una cuantización en formato GGUF del modelo base bigcode/starcoder2-33b, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El modelo base StarCoder2-33B es un transformer decoder-only especializado en generación de código, desarrollado por BigCode (colaboración entre Hugging Face y ServiceNow), pero el artefacto aquí publicado presenta inconsistencias graves entre su nombre y su contenido real: la model card declara 1.500 millones de parámetros y un peso comprimido de 1,01 GB, cifras incompatibles con un modelo de 33B en cuantización Q5_K_M, que debería rondar los 22-23 GB.

La ficha técnica del autor describe la arquitectura como "familia LLaMA", lo que contradice la arquitectura real de StarCoder2 (basada en Grouped Query Attention con RoPE y un tokenizer propio de código). Además, el repositorio ocupa solo 1,1 GB, coherente con un modelo de ~1,5B parámetros pero no con el modelo base declarado. Estas discrepancias sugieren que el artefacto publicado no corresponde al modelo que su nombre indica, por lo que debe tratarse con extrema cautela.

La relevancia de esta publicación es, por tanto, principalmente como caso de estudio sobre riesgos en la cadena de suministro de modelos: ilustra cómo un artefacto mal etiquetado puede propagarse a pipelines de despliegue. No se recomienda su uso en producción sin una verificación exhaustiva del contenido real de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Declarada como "familia LLaMA" en la model card; el modelo base real (StarCoder2) usa transformer decoder-only con GQA y RoPE |
| Parametros totales | 1.498.480.640 según la model card (incompatible con el nombre "33b" y con el modelo base declarado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (Apple Silicon y GPU); 4.096 tokens (CPU) según la model card; el modelo base StarCoder2-33B soporta 16.384 tokens |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso) |
| Idiomas soportados | No disponible (la model card no especifica; StarCoder2 se entrena principalmente en código de más de 80 lenguajes de programación) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `bigcode--starcoder2-33b-Q5_K_M.gguf`) |

## Arquitectura y entrenamiento

La model card declara la arquitectura como "familia LLaMA", lo cual no coincide con la arquitectura real de StarCoder2, que emplea un transformer decoder-only con Grouped Query Attention, RoPE, activación SwiGLU y normalización LayerNorm, además de un tokenizer entrenado específicamente sobre código. El modelo base StarCoder2-33B fue entrenado por BigCode sobre más de 3,5 billones de tokens del dataset The Stack v2, con un contexto nativo de 16.384 tokens y técnicas de Grouped Query Attention para eficiencia en inferencia.

No se dispone de información sobre el proceso de cuantización más allá de la referencia a la herramienta run-any-model del autor. La model card no documenta el dataset de calibración, el método exacto de cuantización (más allá de la etiqueta Q5_K_M) ni verificaciones de perplejidad. Las cifras de "retención de calidad del 97,5%" que aparecen en la model card no van acompañadas de metodología reproducible, por lo que no deben considerarse una garantía técnica.

## Capacidades

- Generación de texto y código, asumiendo que el artefacto corresponde realmente al modelo base declarado (no verificable con la información disponible).
- Relleno de código (fill-in-the-middle) en el modelo base StarCoder2, aunque no se confirma que la cuantización lo preserve.
- Soporte de múltiples lenguajes de programación (el modelo base cubre más de 80).
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta modo de razonamiento explícito (thinking mode), visión ni audio.
- Capacidades multilingües en lenguaje natural: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de cadena de suministro de modelos: usar este artefacto como ejemplo práctico para auditar cómo un GGUF mal etiquetado puede entrar en un registro interno; comparar el hash y el tamaño real con el modelo base declarado antes de aprobarlo.
- Pruebas de infraestructura de cuantización: desplegar el fichero en llama.cpp u Ollama para validar que el pipeline de carga funciona con GGUF de ~1 GB, útil para probar herramientas de orquestación antes de mover modelos grandes.
- Docencia sobre riesgos de modelos: analizar en un curso o taller las discrepancias entre nombre, model card y tamaño real del repositorio como ejercicio de verificación de artefactos.
- Experimentación con run-any-model: probar la CLI del autor en un entorno aislado para entender su flujo de cuantización y despliegue multiplataforma.
- Pruebas de compatibilidad Metal/CUDA: verificar el comportamiento de un GGUF pequeño en Apple Silicon y GPUs NVIDIA consumer antes de escalar a modelos mayores.
- No recomendado para generación de código en producción, atención al cliente ni pipelines de CI/CD, dada la falta de verificación del contenido real de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla de "auditoría" con métricas de memoria y velocidad de cuantización, pero no contiene resultados de MMLU, HumanEval, GSM8K ni métricas de calidad comparables entre modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: 2,51 GB en GPU NVIDIA según la model card (coherente con un modelo de ~1,5B en Q5_K_M, no con un 33B).
- Memoria unificada en Apple Silicon: 1,17 GB según la model card.
- RAM en CPU: 3,17 GB libres según la model card.
- GPU recomendadas: no se especifican modelos concretos; la model card menciona "RTX 30/40/50 series" de forma genérica.
- Cabe en GPU consumer: sí, según las cifras declaradas, cualquier GPU con más de 3 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model.
- Latencia y throughput: no disponibles.

Advertencia: si el artefacto contuviera realmente los pesos de un StarCoder2-33B en Q5_K_M, los requisitos serían del orden de 22-24 GB de VRAM/RAM, no los 2,5 GB declarados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-starcoder2-33b-GGUF (este artefacto) | 1,5B declarados (nombre sugiere 33B) | 8.192 / 4.096 tokens | Apache 2.0 | GGUF Q5_K_M | Hugging Face (0 descargas) |
| bigcode/starcoder2-33b | 33B | 16.384 tokens | Apache 2.0 (con restricciones de uso aceptable) | Safetensors | Hugging Face, oficial |
| bigcode/starcoder2-15b | 15B | 16.384 tokens | Apache 2.0 (con restricciones) | Safetensors | Hugging Face, oficial |
| bigcode/starcoder2-3b | 3B | 16.384 tokens | Apache 2.0 (con restricciones) | Safetensors | Hugging Face, oficial |

La comparación directa con cuantizaciones GGUF oficiales de StarCoder2 no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia crítica entre el nombre ("33b"), el modelo base declarado (bigcode/starcoder2-33b) y el tamaño real del repositorio (1,1 GB) y de los parámetros declarados (1,5B). El artefacto probablemente no contiene los pesos que su nombre indica.
- La arquitectura declarada ("familia LLaMA") no coincide con la del modelo base StarCoder2, lo que refuerza la sospecha de etiquetado incorrecto.
- La cifra de "retención de calidad del 97,5%" no va acompañada de metodología ni de benchmarks reproducibles.
- Riesgo elevado de alucinación y de comportamiento impredecible si el contenido real de los pesos no corresponde al etiquetado.
- No se documentan sesgos conocidos, pero el modelo base StarCoder2 se entrena con código de repositorios públicos, con los sesgos y problemas de licencia de código que ello implica.
- La licencia Apache 2.0 se declara sobre el artefacto, pero el modelo base StarCoder2 tiene términos de uso aceptable adicionales que deben respetarse; verificar la compatibilidad antes de uso comercial.
- Repositorio con 0 descargas y 0 likes, sin validación comunitaria: no hay evidencia de que el artefacto haya sido probado por terceros.
- No usar en producción sin verificar el hash, el tamaño y el contenido real de los pesos, y sin ejecutar una batería de evaluaciones propias.

## Enlaces

- Hugging Face del artefacto: https://huggingface.co/pranil00/ONIX-starcoder2-33b-GGUF
- Modelo base: https://huggingface.co/bigcode/starcoder2-33b
- Organización BigCode: https://huggingface.co/bigcode
- Repositorio de la herramienta de cuantización: https://github.com/PranilShah-08/run-any-model
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
