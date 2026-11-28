# mlx-community/Ornith-1.5-35B-A3B-OptiQ-4bit

## Resumen

Ornith-1.5-35B-A3B-OptiQ-4bit es una cuantizacion mixta de precision del modelo Ornith-1.5-35B-A3B, desarrollado por ornith-ai y distribuido en formato MLX por el colectivo mlx-community. Se trata de un modelo de lenguaje y vision de tipo mixture-of-experts (MoE) con 34.660.608.768 parametros totales y aproximadamente 3.000 millones de parametros activos por token, construido sobre la arquitectura Qwen3.5-MoE. Su proposito es ofrecer inferencia local de un modelo multimodal de gran tamano en hardware Apple Silicon, reduciendo el peso en disco hasta unos 24 GB.

La relevancia de esta ficha radica en que combina tres elementos poco habituales en un mismo artefacto: capacidades multimodales (entrada de imagen y texto), un modo de razonamiento con presupuesto de tokens generoso, y una cabeza de prediccion multi-token (MTP) que actua como mecanismo de decodificacion especulativa para acelerar la generacion. Todo ello empaquetado con cuantizacion por capas de 4 y 8 bits y licencia Apache 2.0.

El modelo base declara soporte de function calling, uso de herramientas y flujos agenticos, ademas de contexto largo. Esta version cuantizada preserva la torre de vision en bf16 y la cabeza MTP como ficheros sidecar, de modo que las capacidades del modelo original se mantienen operativas bajo el runtime MLX, a cambio de requerir la libreria mlx-optiq para registrar la arquitectura y los sidecars.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.5-MoE), multimodal image-text-to-text, con cabeza MTP |
| Parametros totales | 34.660.608.768 |
| Parametros activos | ~3B (denominacion A3B) |
| Longitud de contexto | no disponible (el modelo base se etiqueta como long-context) |
| Tipos de cuantizacion | OptiQ mixed-precision 4/8 bits por capa, group size 64; torre de vision en bf16 |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), ficheros sidecar `optiq/mtp.safetensors` y `optiq/optiq_vision.safetensors` |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con 35B parametros totales y 3B activos, heredada de Qwen3.5-MoE. Incorpora una torre de vision para entrada de imagenes, lo que habilita la modalidad image-text-to-text, y una cabeza de prediccion multi-token (MTP) que el autor del modelo base incluye de forma nativa y que aqui se conserva como sidecar independiente. La cuantizacion OptiQ asigna 4 bits a 113 componentes y 8 bits a 399 componentes, con un tamano de grupo de 64; la receta por capas se reutiliza directamente de la version Ornith-1.0-35B porque la arquitectura es identica y el ranking de sensibilidad por capa se transfiere sin necesidad de un barrido especifico.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) en la informacion proporcionada. La innovacion tecnica destacable, ademas del enrutado MoE, es la cabeza MTP para decodificacion especulativa, que permite proponer varios tokens por paso y validarlos con el modelo principal.

## Capacidades

- Generacion de texto y razonamiento: el modelo se declara explicitamente como reasoning model, por lo que conviene asignarle un presupuesto de tokens amplio.
- Comprension de imagenes: pipeline image-text-to-text con torre de vision en bf16, apto para preguntas sobre imagenes y descripcion visual.
- Codigo y matematicas: no se detalla en la informacion disponible, aunque el perfil del modelo base (Qwen3.5-MoE) sugiere capacidades generales de codigo; no se aportan datos concretos.
- Function calling y tool use: etiquetado como `function-calling` y `tool-use`.
- Flujos agenticos: etiquetado como `agentic`, con soporte de razonamiento multi-paso.
- Contexto largo: etiquetado como `long-context`, aunque la longitud exacta no esta disponible.
- Decodificacion especulativa: cabeza MTP incluida para acelerar la generacion.
- Multilingue: limitado a ingles segun el campo `language`.

## Casos de uso

- Asistente de documentacion tecnica con imagenes: el modelo puede recibir capturas de pantalla de interfaces o diagramas de arquitectura junto a una pregunta en texto y responder combinando ambas modalidades, gracias a la torre de vision preservada en bf16.
- Analisis de documentos escaneados y formularios: al aceptar pares imagen-texto, resulta adecuado para extraer y razonar sobre contenido visual en local, sin enviar datos a la nube, lo que encaja en entornos con requisitos de privacidad.
- Agente de automatizacion con herramientas: el soporte de function calling permite conectarlo a APIs internas, bases de datos o sistemas de ticketing, dejando que el modelo decida que herramienta invocar en cada paso.
- Razonamiento multi-paso en local sobre Apple Silicon: con 3B parametros activos y cuantizacion 4/8 bits, es viable ejecutarlo en un Mac de gama alta para tareas de analisis que requieren cadenas de razonamiento largas, asignando un presupuesto de tokens generoso.
- Prototipado de pipelines multimodales: util para validar rapidamente flujos image-text-to-text antes de escalar a infraestructura GPU, ya que el modelo corre integramente en MLX sin dependencia de PyTorch.
- Servicio local compatible con OpenAI y Anthropic: mediante `optiq serve` se expone un endpoint con cache KV de precision mixta, lo que permite integrar el modelo en aplicaciones existentes que ya hablan esos protocolos.
- Generacion asistida con baja latencia percibida: la cabeza MTP actua como especulacion, reduciendo el numero de pasos de decodificacion necesarios y mejorando el throughput en comparacion con decodificacion autoregresiva pura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 23,6 GB en disco y la model card indica 24 GB; se necesita al menos esa cantidad de memoria unificada mas el margen para cache KV y activaciones.
- Hardware objetivo: Apple Silicon con MLX. Un Mac con 32 GB de memoria unificada es el minimo practico; 64 GB o mas deja margen holgado para contexto largo y cache KV de precision mixta.
- GPU NVIDIA: no es el objetivo de esta version; el formato MLX no se ejecuta en CUDA sin conversion previa a otro runtime.
- Despliegue: `mlx-lm` para carga programatica y `optiq serve` para endpoint compatible con OpenAI y Anthropic. Requiere `mlx-optiq>=0.4.27` e `import optiq` antes de cargar el modelo, para registrar la arquitectura MoE y los sidecars de MTP y vision.
- Latencia y throughput: no disponibles en la informacion proporcionada. La presencia de MTP sugiere mejora respecto a decodificacion estandar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-OptiQ-4bit | 34,7B | ~3B | no disponible | Texto + imagen | Apache 2.0 | MLX safetensors |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35B | ~3B | no disponible | Texto + imagen | Apache 2.0 | safetensors (bf16) |
| mlx-community/Ornith-1.0-35B-OptiQ-4bit | no disponible | no disponible | no disponible | no disponible | Apache 2.0 | MLX safetensors |

La comparacion con alternativas de otros fabricantes no esta disponible en la informacion proporcionada. Frente al modelo base, esta version reduce el peso en disco a unos 24 GB a costa de una perdida de precision no cuantificada en benchmarks publicos; frente a la version 1.0 del mismo autor, comparte receta de cuantizacion por capas al ser la arquitectura identica.

## Limitaciones y advertencias

- Idioma: el campo `language` declara unicamente ingles; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Alucinacion: es un modelo de razonamiento sin datos publicados de evaluacion; no hay evidencia en la informacion disponible sobre su tasa de alucinacion en dominios especializados.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion proporcionada.
- Cuantizacion: la etiqueta "4bit" designa la familia de la receta, no la media ponderada de bits; 399 componentes se mantienen en 8 bits, de modo que el consumo real de memoria y la fidelidad respecto al modelo base no son equivalentes a una cuantizacion uniforme de 4 bits.
- Dependencia de runtime: requiere `mlx-optiq>=0.4.27` e `import optiq` para registrar la arquitectura y los sidecars; sin ese paso la carga falla.
- Cabeza MTP fuera de `optiq serve`: los siete pesos RMSNorm de `optiq/mtp.safetensors` estan centrados en cero y deben aplicarse como 1 + w; hay que sumar 1.0 a las siete normas al cargar la cabeza en otro runtime.
- Plataforma: el formato MLX limita el uso a Apple Silicon; no es portable directamente a CUDA.
- Presupuesto de tokens: al ser un modelo de razonamiento, un limite de tokens demasiado bajo trunca la cadena de pensamiento y degrada la respuesta.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los pesos originales de Qwen3.5-MoE subyacentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Ornith-1.5-35B-A3B-OptiQ-4bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Receta de cuantizacion de referencia (Ornith-1.0-35B): https://huggingface.co/mlx-community/Ornith-1.0-35B-OptiQ-4bit
- Herramienta mlx-optiq: https://mlx-optiq.com
- Catalogo de cuantizaciones OptiQ: https://mlx-optiq.com/models
- Documentacion de mlx-optiq: https://mlx-optiq.com/docs/
