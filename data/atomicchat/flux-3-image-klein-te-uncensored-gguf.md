# AtomicChat/FLUX-3-Image-Klein-TE-Uncensored-GGUF

## Resumen

FLUX-3-Image-Klein-TE-Uncensored-GGUF es una cuantización GGUF del codificador de texto (text encoder) del pipeline FLUX 3 Image Klein, publicada por AtomicChat. No es un modelo de difusión ni un generador de imágenes por sí mismo: es el componente lingüístico Qwen3-VL-4B-Instruct que el pipeline de Klein utiliza para procesar el prompt, empaquetado como fichero `--llm` para stable-diffusion.cpp. El autor ha aplicado una técnica de "abliteration" que proyecta fuera de los pesos la dirección de rechazo (refusal direction), de modo que el modelo deja de negarse a responder peticiones que un modelo alineado rechazaría.

El modelo base es Qwen3-VL-4B-Instruct, con 4.022.468.096 parámetros reales según safetensors, licencia Apache 2.0 y arquitectura transformer multimodal de Qwen. La relevancia de esta ficha es doble: por un lado documenta un caso de modificación de alineamiento sobre pesos abiertos con métricas públicas; por otro, aclara una confusión habitual, y es que el autor mismo mide que el efecto sobre las imágenes generadas es prácticamente nulo, porque el pipeline abierto de Klein no incorpora los filtros de seguridad de BFL y ya dibuja las categorías sensibles que se probaron.

El repo ocupa 18,5 GB y acumula 17.200 descargas y 17 likes en el momento de la consulta, con creación el 20 de octubre de 2026 y última actualización el 28 de octubre de 2026. La model card incluye un conjunto de mediciones publicado como dataset aparte, lo que permite auditar las afirmaciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), usado como text encoder en el pipeline FLUX 3 Image Klein |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF (se menciona Q4_K_M como la cuantizacion mas usada; no se detalla el conjunto completo de niveles) |
| Idiomas soportados | No disponible; el autor solo reporta evaluaciones en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 18,5 GB; el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3-VL-4B-Instruct, un transformer multimodal de la familia Qwen3-VL con 4.022 millones de parámetros. En el contexto de FLUX 3 Image Klein cumple la función de text encoder: recibe el prompt y el modelo de difusión (un DiT de 5,6B parámetros) lee sus estados ocultos. Dentro del pipeline el encoder no genera texto, por lo que estructuralmente no puede "negarse" a nada; la modificación del autor actúa sobre los pesos para eliminar la dirección de rechazo aprendida durante el alineamiento del modelo base.

La técnica aplicada es abliteration por proyección de la refusal direction: se identifica la dirección en el espacio de activaciones asociada a las respuestas de rechazo y se proyecta fuera de los pesos. El autor reporta que, como modelo de chat, la tasa de rechazo en prompts dañinos en inglés cae del 79 % al 0 % sobre un conjunto retenido, mientras que MMLU pasa de 71,1 % a 71,2 %, es decir, sin degradación medible en conocimiento general. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO adicionales sobre el fine-tune.

## Capacidades

- Generación de texto conversacional como modelo de chat autónomo, con la tasa de rechazo reportada en 0 % sobre prompts dañinos en inglés.
- Actuación como text encoder dentro del pipeline FLUX 3 Image Klein, consumiendo el prompt y exponiendo estados ocultos al DiT.
- Comprensión multimodal heredada de Qwen3-VL (el modelo base es un modelo visión-lenguaje), aunque en este uso concreto solo se explota la parte textual.
- Formato GGUF compatible con stable-diffusion.cpp como fichero `--llm`, lo que permite ejecución local en CPU/GPU sin dependencias de Python.
- Integración declarada como compatible con endpoints (`endpoints_compatible` en los tags del repo).
- Capacidad multilingüe: no documentada en la información disponible; las evaluaciones del autor son exclusivamente en inglés.

## Casos de uso

- Sustitución del text encoder en un pipeline local de FLUX 3 Image Klein: se descarga el GGUF y se pasa como `--llm` a stable-diffusion.cpp junto con los pesos del DiT de Klein, de modo que todo el pipeline corre offline sin los chequeos de seguridad del código Python de BFL.
- Investigación sobre alineamiento y abliteration: el repo publica métricas de rechazo y MMLU antes y después de la edición, lo que permite reproducir y auditar el efecto de proyectar fuera la refusal direction sobre un modelo de 4B.
- Evaluación del impacto real de modificaciones de alineamiento en pipelines multimodales: el autor mide LPIPS de 0,066 en BF16 sobre 48 captions neutros frente a 0,53 de un cambio de semilla, lo que sirve como caso de estudio de hasta qué punto el encoder condiciona la imagen final.
- Despliegue de un encoder de prompt sin fricción para flujos creativos que incluyan categorías sensibles (anatomía médica, violencia en ficción, armas en ilustración) sin que el componente lingüístico module la petición.
- Comparación de cuantizaciones GGUF en tareas de codificación de texto para difusión: el autor contrasta el efecto en imagen de su versión BF16 (LPIPS 0,066) con el Q4_K_M habitual (0,088), útil para decidir el nivel de cuantización en producción.
- Uso como modelo de chat local en inglés cuando se requiere un modelo de 4B sin rechazos y con licencia Apache 2.0, por ejemplo en entornos de investigación que necesitan respuestas no filtradas para análisis de contenido.

## Benchmarks y rendimiento

| Metrica | Modelo base (stock) | Este modelo (uncensored) |
|---|---:|---:|
| Tasa de rechazo en prompts dañinos en inglés (chat) | 79 % | 0 % |
| MMLU | 71,1 % | 71,2 % |
| LPIPS en imagenes, 48 captions neutros (BF16) | Referencia | 0,066 |
| LPIPS en imagenes, captions sensibles (BF16) | Referencia | 0,069 |
| LPIPS con cuantizacion Q4_K_M | Referencia | 0,088 |
| Escala de comparacion: cambio de semilla | — | 0,53 |

Resultados de generación de imagen por categoría sensible (10 imágenes por categoría, 90 en total, modelo de imagen BF16, dos semillas, juez multimodal):

| Categoria | Upsampler stock + encoder stock | Upsampler uncensored | Encoder uncensored | Ambos uncensored |
|---|---:|---:|---:|---:|
| Desnudo | 8 | 8 | 8 | 8 |
| Sugerente | 7 | 7 | 7 | 7 |
| Violencia | 10 | 10 | 10 | 10 |
| Armas | 10 | 10 | 10 | 10 |
| Drogas | 9 | 8 | 10 | 8 |
| Lenguaje soez escrito en la imagen | 8 | 8 | 8 | 8 |
| Anatomía médica | 8 | 8 | 8 | 8 |
| Controles: tabaco y alcohol / tatuajes | 10 / 10 | 10 / 10 | 10 / 10 | 10 / 10 |
| Total (90) | 80 | 79 | 81 | 79 |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia de orden de magnitud, un modelo de 4.022 millones de parámetros en BF16 requiere unos 8 GB de pesos; en Q4_K_M baja a aproximadamente 2,5-3 GB, aunque estas cifras son estimaciones por tamaño y no datos publicados por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, el modelo cabe en GPUs de consumo con 8 GB o más en cuantizaciones de 4 bits, y requiere 12-16 GB para BF16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores para cuantizaciones bajas; no confirmado por el autor.
- Opciones de despliegue: stable-diffusion.cpp (uso previsto como `--llm`), y por formato GGUF es compatible con llama.cpp y derivados; no se documenta soporte explícito de vLLM o TGI para este repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (FLUX-3-Image-Klein-TE-Uncensored) | 4,02B | No disponible | Abliteration por proyección de refusal direction, GGUF para stable-diffusion.cpp | Apache 2.0 | HuggingFace, 17.200 descargas |
| webmp3 Sakura (encoder Klein uncensored alternativo) | No disponible | No disponible | Edición más suave; mismo 0 % de rechazos pero menor desplazamiento del modelo y de las imágenes | No disponible | HuggingFace |
| Qwen3-VL-4B-Instruct (base) | 4,02B | No disponible | Modelo original alineado, 79 % de rechazos como chat | Apache 2.0 | HuggingFace |
| FLUX-3-Image-Klein-pup-Uncensored-GGUF (upsampler del mismo autor) | Basado en Qwen3.5-9B | No disponible | Upsampler de prompt sin rechazos, complementario a este encoder | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- El efecto sobre las imágenes generadas es nulo según las propias mediciones del autor: el pipeline abierto de Klein no ejecuta los filtros de BFL y ya dibuja las categorías sensibles, con diferencias de como máximo una imagen en diez entre configuraciones.
- La edición sí altera las imágenes de forma general: LPIPS de 0,066 en BF16 sobre captions neutros, un octavo de un cambio de semilla, así que no es un sustituto neutro del encoder original.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un fine-tune de Qwen3-VL-4B-Instruct hereda los sesgos del modelo base, pero no se publican evaluaciones al respecto.
- Las evaluaciones se limitan al inglés; el comportamiento en castellano u otros idiomas no está medido.
- La licencia del encoder es Apache 2.0, pero el modelo de imagen FLUX 3 Image Klein se rige por la FLUX Kommunity License, que prohíbe eludir las protecciones de BFL. El autor lo advierte explícitamente: el DiT no se modifica en este repo y su uso comercial queda sujeto a esa licencia, no a Apache 2.0.
- El contenido generado con este encoder puede incluir material sensible (desnudo, violencia, drogas) sin moderación del componente lingüístico; la responsabilidad de filtrado recae en la aplicación que lo integre.
- No hay datos publicados sobre latencia, throughput ni requisitos de hardware verificados; las estimaciones de VRAM son deducciones por tamaño de parámetros.
- La fecha de creación del repo (octubre de 2026) y el uso de un modelo base Qwen3-VL implican que parte del ecosistema de herramientas puede no estar todavía adaptado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-TE-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Pesos GGUF del modelo de imagen Klein: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-GGUF
- Upsampler de prompt uncensored: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-pup-Uncensored-GGUF
- Dataset de métricas: https://huggingface.co/datasets/AtomicChat/FLUX-3-Image-Klein-TE-Uncensored-GGUF-metrics
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
