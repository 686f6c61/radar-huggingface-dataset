# nova-quill/Orca-Qwen3.8-27B-Uncensored-mlx

## Resumen

Orca-Qwen3.8-27B-Uncensored-mlx es una version ablacionada (refusal-removed o "abliterated") del modelo Qwen3.8-27B de Alibaba, publicada por el equipo de OrcaRouter en formato MLX para Apple Silicon. El proceso de abliteration elimina los mecanismos de rechazo del modelo original, de modo que responde sin negarse a peticiones que el modelo base consideraria problematicas, lo que lo convierte en una herramienta util para tareas de red teaming y evaluacion de seguridad en IA.

El modelo mantiene la arquitectura hibrida del Qwen3.8-27B original: atencion lineal Gated DeltaNet combinada con atencion completa, encoder de vision nativo, control de modo de pensamiento (thinking mode), soporte de tool calling y cabeza MTP (Multi-Token Prediction). Esta version concreta es una cuantizacion MLX de 6 bits (oQ6e) del build BF16 completo, orientada a su ejecucion local en Macs con chip Apple Silicon.

La relevancia de este modelo reside en que ofrece una alternativa sin censura de un modelo vision-language de 27B parametros, con licencia Apache 2.0, ejecutable en hardware de consumo gracias a la cuantizacion MLX. Esto lo hace interesante tanto para investigadores de seguridad como para desarrolladores que necesiten un modelo local con capacidades de razonamiento, vision y llamada a herramientas sin las restricciones del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: atencion lineal Gated DeltaNet + atencion completa, con encoder de vision nativo |
| Parametros totales | 27B (nominal); safetensors del repo muestra 6.612.941.552 (posiblemente pesos parciales o encoder de vision) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 2/4/6/8 bits (affine, group size 64); BF16 full precision |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida de atencion que combina capas de atencion lineal Gated DeltaNet con capas de atencion completa (full attention). Este diseno reduce el coste computacional en secuencias largas manteniendo la calidad de atencion plena donde es necesaria. Ademas, incorpora un encoder de vision nativo que lo convierte en un modelo vision-language (image-text-to-text), junto con una cabeza MTP (Multi-Token Prediction) que permite predecir multiples tokens por paso de decodificacion.

Sobre esta base, el equipo de OrcaRouter aplico un proceso de abliteration que modifica los pesos del modelo para suprimir las respuestas de negativa ante peticiones que el modelo original consideraria no permitidas. El resultado es un modelo "uncensored" que responde de forma ininterrumpida. Esta version concreta es el build BF16 completo, publicado como fuente para fine-tuning, post-training y cuantizacion posterior. La version MLX aqui documentada es una cuantizacion de 6 bits (oQ6e) de ese build BF16.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados o si se aplicaron tecnicas como RLHF o DPO en el proceso de abliteration.

## Capacidades

- Generacion de texto y razonamiento multi-paso con control de modo de pensamiento (thinking mode activable o desactivable).
- Comprension de imagenes (vision-language): el modelo acepta entradas de imagen y texto, y genera respuestas de texto.
- Tool calling / function calling: soporte para invocar herramientas externas durante la generacion.
- Cabeza MTP (Multi-Token Prediction) para prediccion de multiples tokens por paso, lo que puede mejorar la velocidad de decodificacion.
- Capacidades multilingues limitadas a ingles y chino.
- Respuestas sin rechazo (uncensored / abliterated): el modelo no se niega a responder peticiones que el modelo base bloquearia, lo que lo hace util para red teaming y evaluacion de seguridad.
- Formato MLX optimizado para Apple Silicon, con cuantizaciones de 2, 4, 6 y 8 bits disponibles.

## Casos de uso

- Red teaming y evaluacion de seguridad en IA: el modelo permite a investigadores de seguridad probar sistemas de IA generando prompts adversariales o problematicos sin que el modelo se niegue, lo que facilita identificar vulnerabilidades y sesgos en sistemas de moderacion.
- Despliegue local en Macs Apple Silicon: gracias al formato MLX y la cuantizacion de 6 bits, el modelo puede ejecutarse en un Mac con chip M-series sin necesidad de GPU dedicada, ideal para prototipado y desarrollo offline.
- Fine-tuning y post-training: el build BF16 completo se publica como punto de partida para que otros equipos apliquen sus propias tecnicas de fine-tuning, DPO o cuantizacion personalizada.
- Asistente de codigo con vision: al combinar vision-language con tool calling, puede utilizarse para generar codigo a partir de capturas de pantalla o diagramas, e invocar herramientas de desarrollo.
- Analisis de imagenes y documentos: el modelo puede procesar imagenes y extraer informacion de ellas, util para tareas de OCR contextual, descripcion de imagenes o analisis de diagramas tecnicos.
- Evaluacion de alineacion y seguridad: comparar las respuestas de este modelo con las del Qwen3.8-27B original permite medir el impacto de la abliteration en la calidad y seguridad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El tamano del repo es de 23,7 GB para la version de 6 bits, por lo que se recomienda un Mac con al menos 32 GB de memoria unificada para la version de 6 bits, y 16 GB para la de 2 bits.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 o superiores). No requiere GPU NVIDIA ni AMD.
- Compatibilidad con hardware de consumo: si, en Macs con Apple Silicon y suficiente memoria unificada.
- Opciones de despliegue: MLX (mlx-lm, mlx-vlm), compatible con el ecosistema MLX de Apple. No se menciona soporte para vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (original) | 27B | no disponible | Apache 2.0 | Transformers | Modelo base con mecanismos de rechazo intactos |
| Orca-Qwen3.8-27B-Uncensored-mlx (este) | 27B | no disponible | Apache 2.0 | MLX | Abliterated, cuantizado para Apple Silicon |
| Orca-Qwen3.8-27B-Uncensored-unsloth-mlx | 27B | no disponible | Apache 2.0 | MLX | Variante del mismo modelo abliterated generada con Unsloth |

No se dispone de informacion sobre otros modelos comparables en la misma categoria (vision-language abliterated de 27B).

## Limitaciones y advertencias

- Modelo sin censura: al eliminar los rechazos, el modelo puede generar contenido inapropiado, ofensivo o peligroso. No debe desplegarse en produccion sin medidas de moderacion adicionales.
- Idiomas limitados: solo soporta ingles y chino; no hay garantias de calidad en otros idiomas.
- Sesgos: al derivar de Qwen3.8-27B, puede heredar sesgos del modelo base, y el proceso de abliteration puede amplificar ciertos comportamientos indeseados.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion falsa o inventada, especialmente en modos sin restricciones.
- Longitud de contexto: no se ha especificado en la informacion disponible; se recomienda verificar la documentacion del modelo base Qwen3.8-27B.
- Uso en produccion: la licencia Apache 2.0 permite uso comercial, pero la naturaleza uncensored del modelo implica riesgos legales y eticos significativos en aplicaciones orientadas al publico.
- Discrepancia en parametros: el conteo de safetensors (6,6B) no coincide con el tamano nominal de 27B; puede tratarse de pesos parciales o del encoder de vision, lo que requiere verificacion antes de usar el modelo para fine-tuning.

## Enlaces

- HuggingFace: https://huggingface.co/nova-quill/Orca-Qwen3.8-27B-Uncensored-mlx
- Variante Unsloth: https://huggingface.co/nova-quill/Orca-Qwen3.8-27B-Uncensored-unsloth-mlx
- Repositorio GitHub (despliegue MLX): https://github.com/onurburak9/Qwen3.8-27B-Uncensored-MLX
- Guia de despliegue local: https://github.com/newbdez33/qwen3.8
- Coleccion MLX Qwen3.8: https://huggingface.co/collections/mlx-community/qwen38
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Noticia sobre el lanzamiento: https://www.newsbytesapp.com/news/science/orca-router-releases-uncensored-qwen-38-27b-for-apple-silicon-macs/tldr
