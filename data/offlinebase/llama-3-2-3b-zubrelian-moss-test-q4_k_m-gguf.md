# OfflineBase/Llama-3.2-3B-Zubrelian-Moss-Test-Q4_K_M-GGUF

## Resumen

Llama-3.2-3B-Zubrelian-Moss-Test-Q4_K_M-GGUF es una cuantización GGUF en formato Q4_K_M del modelo `unsloth/Llama-3.2-3B-Instruct`, sobre el que se ha fusionado un adaptador (identificado como `e1b00ffa`) entrenado por el autor `OfflineBase`. El resultado es un modelo de 3.000 millones de parámetros derivado de la familia Llama 3.2 de Meta, convertido con llama.cpp y empaquetado para inferencia local con dicha herramienta. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el propio autor lo describe como privado y sin la revisión de licencia y de datos personales que requeriría una publicación pública.

El ajuste fino se ha realizado sobre un dominio completamente ficticio: una supuesta "guía del musgo zubreliano" de un planeta inventado, con datos generados a través de la API de Meta con la herramienta "Muse Spark 1.3 Contributor". Por tanto, no se trata de un modelo de propósito general mejorado, sino de una prueba técnica de ajuste de formato y estilo sobre un dominio sintético. La relevancia práctica es muy limitada: sirve como ejemplo de pipeline de fusión de adaptador, conversión a GGUF y cuantización, no como modelo listo para producción.

La licencia declarada es la Llama 3.2 Community License, con la etiqueta "built with Llama" y la advertencia explícita de que Meta no ha creado, revisado ni respaldado este fine-tune. El tamaño del archivo es de 2.019.377.312 bytes (aproximadamente 2,02 GB), coherente con una cuantización Q4_K_M de un modelo de 3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.2 3B Instruct) |
| Parametros totales | 3.000 millones (modelo base Llama 3.2 3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 3.2 3B soporta 128k tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q4_K_M (unica publicada en este repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.2 Community License (etiqueta `license: other`, `license_name: llama3.2`) |
| Formato de pesos | GGUF |
| Tamano del archivo | 2.019.377.312 bytes (~2,02 GB) |
| SHA256 (inicio) | 19f17967 |
| Modelo base | unsloth/Llama-3.2-3B-Instruct |
| Adaptador fusionado | e1b00ffa |
| Herramienta de conversion | llama.cpp convert |
| Libreria | gguf |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del transformer decoder-only de Llama 3.2 3B Instruct, con atención por grupos (GQA) y las innovaciones propias de la familia Llama 3.2, aunque la model card no detalla la configuración de capas, cabezas ni dimensión oculta. Sobre ese modelo base se ha fusionado un adaptador LoRA (identificado como `e1b00ffa`) y posteriormente se ha convertido a GGUF con llama.cpp y cuantizado a Q4_K_M. No se especifican hiperparámetros de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO en el ajuste.

Los datos de entrenamiento son explícitamente sintéticos e inventados: una guía de un hobby ficticio ("musgo zubreliano") generada a través de la API de Meta con "Muse Spark 1.3 Contributor". La model card indica que el modelo mantiene el formato entrenado en 20 de 20 muestras, pero que la concordancia con las respuestas de evaluación del adaptador es de 0 sobre 100 en los primeros 200 caracteres, con una divergencia KL de 0,0349. Esto sugiere que el modelo reproduce la forma del formato pero no el contenido semántico esperado, un indicio de ajuste débil o de pérdida de información durante la fusión y cuantización.

## Capacidades

- Generación de texto en el formato y estilo de la "guía del musgo zubreliano" inventada, según la evaluación del autor (20 de 20 muestras mantienen el formato entrenado).
- Razonamiento y conocimiento general heredados del modelo base Llama 3.2 3B Instruct, aunque no se han evaluado en esta ficha.
- Generación de código y matemáticas: capacidades potenciales del modelo base, no verificadas en este fine-tune.
- Soporte de tool calling / function calling: no confirmado en la información disponible; el modelo base Llama 3.2 Instruct lo soporta, pero no se ha validado tras la fusión y cuantización.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponibles; el modelo base soporta varios idiomas, pero no se especifica en esta ficha.
- Modo "thinking": no disponible.
- Visión y audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Prueba de pipeline de cuantización: sirve para validar el flujo completo de fusión de adaptador, conversión a GGUF y cuantización Q4_K_M con llama.cpp antes de aplicarlo a modelos de producción.
- Evaluación de pérdida de calidad por cuantización: permite medir la divergencia KL (0,0349 reportada) y la tasa de coincidencia de formato entre el adaptador original y el GGUF cuantizado.
- Inferencia local en hardware modesto: con 2,02 GB de archivo y ~2,84 GB de memoria residente en 6 hilos x86, puede ejecutarse en equipos sin GPU dedicada para tareas de formato controlado.
- Generación de texto sintético de dominio ficticio: útil para prototipos de juegos de rol, narrativa o mundos inventados donde se requiera un estilo concreto y consistente.
- Benchmark de throughput en GPU: el autor reporta 168,8 tokens/s en una A10, lo que permite usar el modelo como referencia de velocidad para comparar configuraciones de llama.cpp.
- Docencia y demostración: ejemplo didáctico de cómo se documenta un fine-tune con datos sintéticos y sus limitaciones de licencia y evaluación.
- No recomendado para atención al cliente, generación de código en producción ni aplicaciones reales: la falta de revisión de licencia y de datos personales, junto con la evaluación negativa de concordancia (0/100), lo desaconsejan para cualquier uso serio.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Throughput en GPU (A10) | 168,8 tokens/s | llama-cli, respondiendo en el formato de la guía |
| Throughput en CPU (6 hilos x86) | ~23 tokens/s | Con límite de memoria |
| Memoria residente en CPU | 2,84 GB | 6 hilos x86, con límite de memoria |
| Concordancia con respuestas de eval del adaptador | 0 de 100 | Primeros 200 caracteres |
| Muestras que mantienen el formato entrenado | 20 de 20 | Muestreo del autor |
| Divergencia KL | 0,0349 | Respecto al adaptador original |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. No se ha probado en Jetson ni en teléfono según los registros del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el archivo Q4_K_M ocupa ~2,02 GB, por lo que se puede inferir en GPUs con 4 GB o más, aunque no se confirma.
- GPU recomendadas: el autor reporta pruebas en una NVIDIA A10 (24 GB). Cualquier GPU consumer con al menos 4-6 GB de VRAM debería poder cargarlo en Q4_K_M, pero no se ha verificado.
- ¿Cabe en GPU consumer? Sí, previsiblemente en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB y similares, aunque no hay confirmación en la información proporcionada.
- Despliegue: llama.cpp (llama-cli, llama-server) es la opción natural por el formato GGUF. Ollama y otros runners compatibles con GGUF podrían usarlo, pero no se confirma. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que no se recomiendan sin verificación.
- Latencia y throughput: 168,8 tokens/s en A10; ~23 tokens/s en 6 hilos x86 con 2,84 GB residentes. No hay datos de latencia (time-to-first-token) ni de rendimiento en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-Zubrelian-Moss-Test-Q4_K_M-GGUF | 3B | No disponible | GGUF Q4_K_M | Llama 3.2 Community | Repo privado, 0 descargas |
| unsloth/Llama-3.2-3B-Instruct | 3B | 128k (modelo base) | safetensors, GGUF | Llama 3.2 Community | Publico en Hugging Face |
| Llama 3.2 3B Instruct (Meta) | 3B | 128k | safetensors | Llama 3.2 Community | Publico en Hugging Face |
| Qwen2.5-3B-Instruct | 3B | 32k | safetensors, GGUF | Apache 2.0 | Publico en Hugging Face |

La comparativa se limita a modelos de tamaño similar; no se dispone de benchmarks comparativos de este fine-tune frente a las alternativas. La principal diferencia frente a los modelos públicos es que este repositorio está descrito como privado y sin revisión de licencia ni de datos personales, lo que lo hace no apto para uso comercial sin una auditoría previa.

## Limitaciones y advertencias

- El repositorio está descrito por el autor como privado y sin la revisión de licencia y de datos personales que requiere una publicación pública.
- Los datos de entrenamiento son sintéticos e inventados ("musgo zubreliano"), por lo que el modelo no aporta conocimiento factual útil fuera de ese dominio ficticio.
- La concordancia con las respuestas de evaluación del adaptador es de 0 sobre 100 en los primeros 200 caracteres, lo que indica una pérdida semántica significativa tras la fusión y cuantización.
- Riesgo elevado de alucinación fuera del formato entrenado, dado que el ajuste se ha realizado sobre datos inventados y con evaluación negativa.
- Licencia Llama 3.2 Community: impone restricciones de uso comercial, obligaciones de atribución ("Built with Llama") y sujeción a la Acceptable Use Policy de Meta. No es una licencia de código abierto permisiva.
- Meta no ha creado, revisado ni respaldado este fine-tune; el autor lo indica explícitamente.
- No se ha probado en Jetson ni en teléfono según los registros del autor; el rendimiento en esos entornos es desconocido.
- Solo se publica la cuantización Q4_K_M; no hay versiones Q5, Q8, FP16 ni safetensors en este repositorio.
- Idiomas soportados no especificados; el comportamiento multilingüe tras el ajuste no está verificado.
- No hay datos de sesgos conocidos, pero al derivar de Llama 3.2 hereda los sesgos potenciales del modelo base, no evaluados en esta ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OfflineBase/Llama-3.2-3B-Zubrelian-Moss-Test-Q4_K_M-GGUF
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Llama 3.2 (Meta): https://www.llama.com/
- llama.cpp (herramienta de conversión y cuantización): https://github.com/ggerganov/llama.cpp
- Unsloth (framework de fine-tuning): https://github.com/unslothai/unsloth
