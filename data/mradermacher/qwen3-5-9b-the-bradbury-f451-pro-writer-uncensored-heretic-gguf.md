# mradermacher/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic-GGUF

## Resumen

El modelo Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic-GGUF es una colección de cuantizaciones GGUF del fine-tune homónimo creado por DavidAU, que a su vez parte del modelo base Qwen3.5-9B. El fine-tune está orientado a la escritura creativa y la ficción, entrenado con el dataset The-BradburyF451, inspirado en la novela "Fahrenheit 451" de Ray Bradbury. El modelo incorpora técnicas de "abliteration" (eliminación de capas de rechazo) y un ajuste multi-etapa, lo que lo convierte en una opción "uncensored" para generación de texto sin filtros de seguridad.

La versión GGUF, publicada por mradermacher, ofrece múltiples niveles de cuantización (desde Q2_K hasta f16) para facilitar la inferencia local en hardware variado, desde GPUs de consumo hasta servidores. Con aproximadamente 8,95 mil millones de parámetros, el modelo es adecuado para tareas de generación de narrativa, roleplay y asistencia a escritores, aunque su naturaleza sin censura implica riesgos de contenido inapropiado. La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede requerir supervisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B, detalles no disponibles) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B, un transformer denso con atención estándar (no se especifican detalles adicionales como número de capas o heads). El entrenamiento se realizó con el dataset DavidAU/The-BradburyF451, que consiste en texto de la novela "Fahrenheit 451" y posiblemente material relacionado. Según la información de FriendliAI, el fine-tune se hizo con Unsloth, una librería de entrenamiento eficiente. Se menciona "multi-stage tuned" y "abliterated", lo que sugiere un proceso en varias fases que incluye la eliminación de capas de rechazo para reducir la censura. No se dispone de datos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto creativo: ficción, cuentos, novelas, poesía, guiones y diálogos.
- Roleplay: interacción conversacional para juegos de rol o simulación de personajes.
- Escritura de escenas y continuación de historias: puede continuar narrativas existentes o generar sub-tramas.
- Soporte multilingüe: inglés y chino (aunque el entrenamiento se centra en inglés).
- Generación de código: el tag "coder" sugiere cierta capacidad, aunque no es el foco principal.
- Sin filtros de seguridad: el modelo está diseñado para no rechazar solicitudes, lo que permite contenido explícito o controvertido.
- Posible soporte multimodal: se incluyen archivos mmproj (Q8_0 y f16), pero no se especifica qué modalidad (visión, audio, etc.). No se confirma su funcionalidad.

## Casos de uso

- Escritura de novelas y relatos: el modelo puede generar borradores de capítulos, descripciones vívidas y diálogos, aprovechando su entrenamiento en prosa literaria.
- Asistente para autores: ayuda a superar bloqueos creativos, sugiriendo giros argumentales o desarrollos de personajes.
- Roleplay en juegos de mesa o videojuegos: permite crear personajes no jugadores (NPC) con respuestas coherentes y sin restricciones temáticas.
- Generación de contenido para juegos narrativos: creación de misiones, diálogos ramificados y descripciones de escenarios.
- Traducción creativa: aunque solo en en/zh, puede adaptar textos literarios manteniendo el estilo.
- Prototipado de guiones para cine o teatro: genera diálogos y escenas para evaluar ideas rápidamente.
- Generación de contenido para blogs o redes sociales: produce textos atractivos y originales, aunque con riesgo de contenido inapropiado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, Q4_K_M (~5,7 GB) requiere al menos 6-8 GB de VRAM; Q8_0 (~9,6 GB) necesita 10-12 GB; f16 (~18 GB) requiere 20 GB o más.
- GPU recomendadas: para cuantizaciones bajas (Q4_K_M) una RTX 3060 12 GB o RTX 4060 Ti 16 GB es suficiente; para Q8_0 se recomienda RTX 4070 Ti o superior; para f16 se necesitan GPUs de servidor como A100 o H100.
- Compatibilidad con hardware de consumo: sí, con cuantizaciones Q4_K_M o inferiores en GPUs con al menos 8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, TGI (si se convierte a otro formato), vLLM (con conversión a safetensors).
- Latencia y throughput: no disponible, pero en una RTX 4090 con Q4_K_M se espera una generación de 20-40 tokens/s (estimación orientativa, no confirmada).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en la documentación proporcionada. Dado que es un fine-tune de Qwen3.5-9B, podría compararse con otros modelos de escritura creativa de tamaño similar (por ejemplo, Llama-3-8B-Instruct o Mistral-7B-Instruct), pero no hay datos de rendimiento para establecer una comparación objetiva. Se indica "no disponible".

## Limitaciones y advertencias

- Contenido sin censura: el modelo puede generar texto ofensivo, violento, sexualmente explícito o peligroso. No es apto para todos los públicos y su uso en producción requiere moderación.
- Riesgo de alucinación: al ser un modelo generativo, puede inventar hechos, citas o referencias, especialmente en contextos no literarios.
- Sesgos: al estar entrenado sobre una obra literaria específica, puede reflejar los sesgos de esa obra (por ejemplo, temas de censura, distopía) y los del modelo base Qwen.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto; si es similar a Qwen3.5-9B, podría ser de 32k o 128k tokens, pero no está confirmado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a derechos de autor si reproduce partes de la novela original.
- Calidad variable: al ser un fine-tune especializado, su rendimiento en tareas generales (matemáticas, razonamiento) puede ser inferior al del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic
- Artículo en UncensoredHub: https://uncensoredhub.ai/news/2026-07-11-qwen-3-5-9b-uncensored-writer-fine-tunes-land-in-gguf-quantizations
- Página en FriendliAI: https://friendli.ai/models/DavidAU/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic
