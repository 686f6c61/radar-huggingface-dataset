# johnfredfarmer/gemma_ft_q4_k_m

## Resumen

`johnfredfarmer/gemma_ft_q4_k_m` es un ajuste fino (fine-tune) del modelo Gemma 2 2B de Google DeepMind, publicado por el usuario johnfredfarmer en formato GGUF y cuantizado a Q4_K_M. El repositorio contiene un unico archivo, `gemma-2-2b.Q4_K_M.gguf`, con 2.614.341.888 parametros (unos 2,6 millardos) y un tamano de repositorio de 1,7 GB, lo que lo situa en la categoria de modelos pequenos pensados para inferencia local.

El modelo se ha entrenado y convertido a GGUF con Unsloth, una libreria que acelera el ajuste fino y la exportacion de modelos, y esta disenado para ejecutarse con llama.cpp (los ejemplos de la model card usan `llama-cli` y `llama-mtmd-cli`). Al derivar de Gemma 2 2B, hereda la arquitectura transformer decoder-only de esa familia y su ventana de contexto de 8.192 tokens, aunque la model card no confirma estos extremos de forma explicita.

Su relevancia es practica: se trata de un modelo de ~2,6 B parametros en una cuantizacion de 4 bits que cabe en GPUs de consumo e incluso en CPU, con soporte nativo para llama.cpp y compatibilidad declarada con endpoints. La contrapartida es la ausencia casi total de documentacion: no se especifican licencia, idiomas, dataset de entrenamiento ni resultados de evaluacion, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta. Cualquier uso en produccion exigiria validar primero el comportamiento real del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 2 2B: atencion con query agrupada, atencion alterna local/global, RMSNorm, activacion GeGLU) |
| Parametros totales | 2.614.341.888 (~2,6 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Gemma 2 2B; no confirmada en la model card) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado: `gemma-2-2b.Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no la declara) |
| Formato de pesos | GGUF (generado con Unsloth); metadatos de parametros procedentes de safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Gemma 2 2B, un transformer decoder-only denso de aproximadamente 2,6 B parametros. Gemma 2 introduce en esta familia atencion con query agrupada (GQA), alternancia entre capas de atencion local (ventana deslizante de 4.096 tokens) y capas de atencion global, normalizacion RMSNorm y una activacion GeGLU con interpolacion logit-softcapping. Esta combinacion busca equilibrar calidad y coste computacional en modelos de tamano reducido.

En cuanto al entrenamiento especifico de este repositorio, la model card se limita a indicar que el modelo fue ajustado (fine-tuned) y convertido a GGUF mediante Unsloth, y que el entrenamiento fue "2x mas rapido" gracias a dicha libreria. No se documentan el dataset utilizado, el numero de tokens de entrenamiento, la composicion de los datos, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se detalla el metodo de cuantizacion mas alla del resultado final Q4_K_M. Toda la informacion adicional sobre el proceso de ajuste se considera no disponible.

## Capacidades

- Generacion de texto en ingles y, presumiblemente, en otros idiomas presentes en el modelo base Gemma 2 (la lista concreta de idiomas no esta documentada).
- Razonamiento general de conversacion y respuesta a instrucciones, asumiendo que el fine-tune preserva las capacidades del base.
- Generacion de codigo y tareas basicas de matematicas propias de un modelo de 2,6 B de parametros.
- Ejecucion mediante llama.cpp con soporte de plantillas Jinja (`--jinja`).
- La model card menciona un uso con `llama-mtmd-cli` para modelos multimodales, pero al tratarse de un archivo basado en Gemma 2 2B (texto) no se confirma ninguna capacidad de vision real en este repositorio.
- Soporte de tool calling / function calling: no confirmado en la documentacion del modelo.

## Casos de uso

- Inferencia local en portatil o equipo de sobremesa sin GPU dedicada: al ocupar 1,7 GB en Q4_K_M, el modelo puede ejecutarse por CPU con llama.cpp, lo que permite tener un asistente de texto offline sin depender de servicios en la nube.
- Prototipado rapido de chatbots: su tamano reducido permite iterar sobre prompts y plantillas (Jinja) en cuesticion de segundos, con coste casi nulo de computo, ideal para validar flujos conversacionales antes de escalar a modelos mayores.
- Aplicaciones de generacion de texto acotado (resumenes cortos, reescritura, clasificacion ligera): el modelo puede procesar entradas de hasta 8.192 tokens, suficiente para documentos breves o hilos de conversacion moderados.
- Despliegue en el borde (edge) o en dispositivos con recursos limitados: cuantizado a 4 bits, encaja en GPUs de gama media-baja con poca VRAM y en sistemas embebidos con CPU moderna.
- Base para fine-tuning adicional: al estar en formato GGUF y derivar de Gemma 2 2B, sirve como punto de partida para experimentos de ajuste con Unsloth sobre dominios concretos, dado su bajo coste de entrenamiento.
- Evaluacion comparativa de cuantizaciones: util para medir el impacto de Q4_K_M frente a otros niveles de cuantizacion en una tarea concreta antes de decidir el formato de despliegue en produccion.
- Integracion en pipelines de generacion por lotes de bajo coste: mediante llama.cpp o bindings compatibles, puede procesarse volumen alto de peticiones sencillas en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas (MMLU, HumanEval, GSM8K u otras) ni comparaciones con el modelo base Gemma 2 2B, y el repositorio registra 0 descargas, por lo que no existen datos de evaluacion de terceros asociados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB en Q4_K_M (el archivo pesa 1,7 GB; hay que sumar el contexto y los buffers de llama.cpp, por lo que con 4 GB se opera con holgura).
- Cabe en GPU de consumo: si. Es viable en tarjetas con 4-6 GB o mas de VRAM (por ejemplo, GTX 1650 4 GB, RTX 3050 6 GB, RTX 3060 12 GB, RTX 4060, e incluso iGPUs con memoria unificada).
- GPU de datacenter: no requiere A100 ni H100; su uso en estas tarjetas seria un sobredimensionamiento. En todo caso, cualquier GPU NVIDIA con soporte CUDA puede ejecutarlo con aceleracion.
- CPU: puede ejecutarse integramente en CPU mediante llama.cpp; se recomienda al menos 8 GB de RAM y una CPU con soporte AVX2 para un rendimiento aceptable.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`), y cualquier runtime compatible con GGUF. No se ha confirmado soporte para vLLM, TGI u Ollama en la informacion disponible, aunque el formato GGUF es habitualmente compatible con Ollama.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad y notas |
|---|---|---|---|---|
| johnfredfarmer/gemma_ft_q4_k_m | ~2,6 B | 8.192 tokens (heredado) | no disponible | GGUF unico, 0 descargas; ajuste fino no documentado |
| Gemma 2 2B (base, Google DeepMind) | ~2,6 B | 8.192 tokens | Gemma Terms of Use | Ampliamente disponible en safetensors y GGUF; benchmarks publicados por Google |
| Qwen2.5 1.5B (Alibaba) | ~1,5 B | 32.768 tokens | Apache 2.0 | Ampliamente disponible; licencia permisiva y contexto mayor |
| Llama 3.2 3B (Meta) | ~3,2 B | 128.000 tokens | Llama 3.2 Community License | Muy disponible; contexto muy superior y soporte de tool calling |
| Phi-3 Mini (Microsoft) | ~3,8 B | 128.000 tokens | MIT | Disponible en varios formatos; orientado a razonamiento |

Nota: los datos de los modelos comparados proceden de conocimiento general de sus respectivas fichas publicas; no se han extraido de la informacion proporcionada para este repositorio. La comparacion de rendimiento no puede establecerse porque este modelo no publica benchmarks.

## Limitaciones y advertencias

- Ausencia de documentacion: no se declaran licencia, idiomas, dataset de entrenamiento ni proceso de alineacion, lo que impide verificar el origen de los datos y el cumplimiento normativo.
- Licencia no disponible: al derivar de Gemma 2, es probable que quede sujeta a los Gemma Terms of Use, pero el repositorio no lo confirma; no debe asumirse uso comercial libre sin aclararlo.
- Riesgo de alucinacion: cualquier modelo de ~2,6 B de parametros presenta una tasa elevada de errores factuales, especialmente en tareas de conocimiento enciclopédico o calculo complejo.
- Sesgos: al no documentarse el dataset de ajuste, no es posible evaluar sesgos introducidos por el fine-tune; el modelo base Gemma 2 tambien arrastra sesgos propios de sus datos de entrenamiento.
- Limitaciones de contexto e idioma: la ventana de 8.192 tokens es reducida frente a alternativas actuales de 32K-128K; los idiomas soportados no estan confirmados.
- Fiabilidad del ajuste desconocida: sin benchmarks, no se puede saber si el fine-tune mejora o degrada las capacidades originales del base Gemma 2 2B. Se recomienda evaluar con tareas propias antes de usarlo.
- Un solo nivel de cuantizacion: unicamente se ofrece Q4_K_M, lo que limita el ajuste fino entre calidad y consumo de memoria.
- Baja traccion: 0 descargas y 0 likes, sin mantenimiento ni comunidad que reporte problemas, por lo que no hay validacion externa de su comportamiento en produccion.
- Modelo con nombre similar en otros repositorios (por ejemplo, `nid811/gemma_ft_q4_k_m`, bajo Apache 2.0) que no deben confundirse con este; son publicaciones distintas.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/johnfredfarmer/gemma_ft_q4_k_m
- Unsloth (libreria de entrenamiento y conversion): https://github.com/unslothai/unsloth
- Gemma (pagina oficial de Google DeepMind): https://deepmind.google/models/gemma/
- Repositorio de Gemma en GitHub: https://github.com/google-deepmind/gemma
- Modelo con nombre similar (otro autor, no relacionado): https://huggingface.co/nid811/gemma_ft_q4_k_m
- Modelo con nombre similar (otro autor, no relacionado): https://huggingface.co/kunj5562/gemma_ft_q4_k_m
