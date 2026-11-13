# nace-ai/Qwen3.6-35B-A3B-MLX

## Resumen

Qwen3.6-35B-A3B-MLX es una cuantización en formato MLX del modelo Qwen3.6-35B-A3B, publicada por el usuario nace-ai para su ejecución en Apple Silicon. El modelo base lo desarrolla el equipo Qwen (Alibaba), y esta versión concreta es un pack de inferencia pensado para Macs con memoria unificada, no un modelo entrenado desde cero. El repositorio incluye dos checkpoints completos: Q4 (4 bits uniformes, 21,0 GB) y Q5 (precisión mixta 4/6/8 bits, unos 4,6 bits por peso, 23,0 GB).

La relevancia de esta ficha está en que el pack MLX de nace-ai reduce la divergencia respecto al modelo BF16 original en comparación con otros packs públicos de 4 bits. Según la model card, el Q4 de nace-ai presenta una KL de 0,059 frente a BF16, mientras que el pack de 4 bits de mlx-community queda en 0,096, es decir, aproximadamente 1,6 veces más cerca del original con el mismo tamaño de pesos del modelo de lenguaje (19,51 GB).

El modelo base es un MoE con 35.107.181.936 parámetros totales y, por el sufijo A3B, aproximadamente 3 mil millones de parámetros activos por token. El pipeline declarado es image-text-to-text, de modo que el pack cubre tanto texto como visión. La licencia es Apache 2.0. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es escasa: la model card se centra en instrucciones de uso y métricas de cuantización, no en el rendimiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (qwen3_5_moe); detalles internos no disponibles |
| Parametros totales | 35.107.181.936 |
| Parametros activos | aproximadamente 3 mil millones (deducido del sufijo A3B; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 (4 bits uniformes, puertas del router en 8 bits) y Q5 (precisión mixta 4/6/8 bits, ~4,6 bits por peso, 5,1 contando escalas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (libreria mlx); repo de 44,0 GB con ambos checkpoints |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con mezcla de expertos (MoE) de 35,1 mil millones de parámetros totales y unos 3 mil millones activos por token, según la convención de nombres de la familia Qwen. El pack de nace-ai no entrena el modelo: aplica cuantización post-entrenamiento en formato MLX para Apple Silicon. En Q4 se usan 4 bits uniformes con las puertas del router en 8 bits, replicando el esquema de mlx-lm; en Q5 se aplica precisión mixta con 4, 6 u 8 bits por tensor, resultando en unos 4,6 bits por peso. La innovación destacable de este pack es la métrica de calidad de cuantización: la divergencia KL respecto al BF16 original se mide y se compara con packs públicos, con 0,059 para Q4 y 0,027 para Q5 (este último evaluado sobre token IDs distintos, por lo que la model card no reclama una ganancia pareada).

No hay información disponible sobre el número de tokens de entrenamiento del modelo base, la composición del dataset, ni si se aplicaron RLHF, DPO u otras etapas de alineamiento. Tampoco se documentan innovaciones de decodificación especulativa o atención lineal en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, con modo de razonamiento (thinking) activado por defecto y devuelto en `reasoning_content` o `reasoning` según el servidor.
- Desactivación del modo thinking mediante `reasoning_effort: "none"` o `chat_template_kwargs: {"enable_thinking": false}`, con parámetros de muestreo distintos recomendados (temperatura 0,7, top_p 0,8, top_k 20, presence_penalty 1,5).
- Entrada de imágenes en formato OpenAI `image_url`, tanto por URL http(s) como por data URL base64; el pipeline declarado es image-text-to-text.
- Tool calling / function calling: la model card confirma que `mlx_lm.server` y LM Studio colocaron una llamada a herramienta sobre este pack.
- Razonamiento matemático básico verificado en los ejemplos (multiplicación 17 × 23).
- Capacidades multilingües: no disponibles en la información proporcionada, aunque los ejemplos incluyen consultas en inglés.
- Compatibilidad con APIs OpenAI, Anthropic y Ollama a través del motor Kapitsa de nace-ai.

## Casos de uso

- Asistente local en Mac con privacidad por defecto: Kapitsa permite servir el modelo con `--private` en 127.0.0.1:8000, de modo que conversaciones y datos no salen del equipo; adecuado para equipos que manejan información sensible y quieren evitar APIs externas.
- Atención al cliente automatizada en local: el modelo gestiona conversaciones multi-turno con modo thinking para consultas complejas y modo no-thinking para respuestas rápidas; la ventana de contexto no está documentada, así que conviene validar la longitud real antes de desplegarlo en producción.
- Análisis de imágenes en flujos de trabajo internos: la entrada `image_url` acepta URLs y base64, lo que permite clasificar, describir o extraer información de capturas, documentos escaneados o fotos dentro de una aplicación propia.
- Automatización con tool calling: integrado mediante `mlx_lm.server` (API compatible con OpenAI en el puerto 8080) o Kapitsa, el modelo puede invocar funciones para consultar bases de datos, lanzar scripts o encadenar pasos en agentes locales.
- Prototipado rápido de aplicaciones LLM en Apple Silicon: con MLX y mlx-lm, un desarrollador puede cargar el modelo en Python con `load()` y `generate()`, probar prompts y ajustar muestreo sin depender de GPU NVIDIA ni de infraestructura cloud.
- Evaluación de calidad de cuantización: investigadores pueden comparar Q4 y Q5 frente a BF16 usando la KL publicada (0,059 y 0,027) para decidir el compromiso entre 21,0 GB y 23,0 GB de descarga en Macs de 48 GB o más.
- Sustituto local de modelos mayores en estaciones de trabajo Mac: al ser MoE con unos 3 mil millones de parámetros activos, el coste por token es menor que el de un modelo denso de 35 mil millones, lo que lo hace viable para tareas de generación continua en un único equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de fidelidad de cuantización:

| Checkpoint | Tamano de descarga | KL a BF16 (menor es mejor) | RAM orientativa |
|---|---|---|---|
| Q4 (4 bits uniformes) | 21,0 GB | 0,059 | 48 GB+ |
| Q5 (precisión mixta) | 23,0 GB | 0,027 | 48 GB+ |
| mlx-community 4-bit (referencia externa) | no disponible | 0,096 | no disponible |
| unsloth UD-3bit (referencia externa) | no disponible | no disponible | no disponible |

La cifra de RAM es una regla orientativa del autor, no una medición: se refiere al tamaño de memoria unificada cuyo reparto por defecto de GPU en macOS (unos 2/3) contiene la descarga más 2 GB para una conversación. Kapitsa puede caber en un tamaño inferior porque omite partes que no usa, y `kapitsa doctor` comprueba un Mac concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nace-ai/Qwen3.6-35B-A3B-MLX (Q4/Q5) | 35,1 mil millones totales, ~3 mil millones activos | no disponible | MLX safetensors | Apache 2.0 | KL 0,059 (Q4) y 0,027 (Q5); 21,0 y 23,0 GB |
| mlx-community pack 4-bit del mismo base | no disponible | no disponible | MLX | no disponible | KL 0,096 según la model card de nace-ai |
| unsloth UD-3bit del mismo base | no disponible | no disponible | no disponible | no disponible | Citado en la gráfica de la model card; sin datos de KL |
| Qwen/Qwen3.6-35B-A3B (BF16 original) | 35,1 mil millones totales | no disponible | safetensors | Apache 2.0 | Modelo de referencia; tamaño BF16 no disponible |

## Limitaciones y advertencias

- Pack específico para Apple Silicon: requiere MLX, mlx-lm o Kapitsa; no está pensado para CUDA, vLLM, TGI ni llama.cpp, y no se ofrece formato GGUF.
- El modelo base es un MoE de 35 mil millones de parámetros; incluso cuantizado, la descarga ocupa 21,0-23,0 GB y necesita Macs de 48 GB de memoria unificada como mínimo según la regla del autor.
- La ventana de contexto no está documentada en la información disponible; no debe asumirse un valor concreto en producción.
- Los idiomas soportados no están declarados; los ejemplos de la model card están en inglés y no hay evidencia de calidad multilingüe.
- La model card advierte que solo los ejemplos de chat y tool calling se probaron sobre este pack; el resto de ejemplos se validaron en el pack de 9B, por lo que pueden requerir ajustes.
- El Q5 se evaluó sobre token IDs distintos del Q4, así que no se puede reclamar una ganancia pareada entre ambos checkpoints.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse empíricamente antes de un uso en producción.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.6-35B-A3B, ya que la model card no detalla obligaciones adicionales.
- Las cifras de KL y de RAM provienen del autor del pack y no han sido verificadas de forma independiente en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX
- Checkpoint Q4: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX/tree/main/Q4
- Checkpoint Q5: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX/tree/main/Q5
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Assets de la model card (gráfica de KL): https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX/resolve/main/assets/nace-dark.svg y https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX/resolve/main/assets/nace-light.svg
