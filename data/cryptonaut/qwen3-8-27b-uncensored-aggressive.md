# cryptonaut/Qwen3.8-27B-Uncensored-Aggressive

## Resumen

Qwen3.8-27B-Uncensored-Aggressive es una variante "abliterada" del modelo Qwen3.8-27B de Alibaba, publicada por el usuario cryptonaut en agosto de 2026. En lugar de un fine-tuning convencional, se trata de una edición de pesos (ablación de rango 5) que elimina los circuitos de rechazo y los preámbulos de seguridad del checkpoint original, manteniendo supuestamente intactas sus capacidades de razonamiento, generación y visión. El resultado se distribuye exclusivamente en formato GGUF para runtimes locales como llama.cpp, LM Studio y koboldcpp.

La versión v4 incluye tres cambios clave respecto a iteraciones anteriores: la plantilla de chat horneada bloquea el modo thinking (que en el modelo base está activado por defecto y consumía el presupuesto de tokens en un bucle de política), se inyecta un system prompt por defecto sin restricciones cuando el usuario no proporciona uno, y se refuerza la ablación con un eje específico para el rechazo en chino. El modelo soporta contexto largo de 98 304 tokens, visión multimodal mediante un proyector mmproj-F16 opcional y decodificación especulativa MTP.

La relevancia de esta ficha radica en que ejemplifica una tendencia creciente en la comunidad open source: la eliminación quirúrgica de la alineación de seguridad mediante técnicas de edición de pesos, sin reentrenamiento, para uso local. Es importante señalar que el autor advierte explícitamente que la alineación de seguridad ha sido eliminada y que el modelo cumplirá solicitudes que el checkpoint base rechazaría, por lo que su uso conlleva riesgos legales y éticos considerables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.8-27B; detalles de capas y cabezas no disponibles) |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | No aplica (no se indica arquitectura MoE) |
| Longitud de contexto | 98 304 tokens (98k) |
| Tipos de cuantizacion | Q4_K_M (16,8 GB), Q5_K_M (19,5 GB), Q6_K mixto con Q8_0 (27,5 GB), mmproj-F16 (885 MiB) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors del modelo base no distribuido en este repo) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de 27,3 B parámetros con capacidades multimodales (texto e imagen) y un modo de razonamiento (thinking) activado por defecto en su plantilla de chat original. Sobre este checkpoint no se ha realizado ningún fine-tuning: no hay intercambio de dataset, ni RLHF ni DPO posterior. La intervención consiste en una ablación de rango 5 (rank-5 ablation) aplicada directamente sobre los pesos, que incluye la capa `lm_head` y un eje específico para eliminar los circuitos de rechazo en chino (frases como "我无法提供…色情…超出了服务范围").

La innovación técnica destacable es la plantilla de chat horneada dentro del propio GGUF: el modo thinking queda bloqueado de forma permanente, de modo que cada turno del asistente comienza directamente con la respuesta sin gastar tokens en razonamiento interno. Además, si el usuario no envía un system prompt, se inyecta uno por defecto sin restricciones. Esto elimina la necesidad de flags adicionales como `--reasoning off` o de jailbreaks manuales. El modelo también soporta decodificación especulativa MTP (multi-token prediction) en llama.cpp, lo que puede acelerar la generación en hardware modesto.

## Capacidades

- Generación de texto sin rechazos: la ablación elimina los circuitos de negativa del modelo base, tanto en inglés como en chino.
- Visión multimodal: pipeline image-text-to-text mediante el proyector `mmproj-F16.gguf`, que permite procesar imágenes y vídeo (proyector sin cambios respecto al base).
- Contexto largo: ventana de 98 304 tokens, suficiente para documentos extensos o conversaciones multi-turno prolongadas.
- Multilingüe: inglés y chino como idiomas declarados.
- Decodificación especulativa MTP: soporte de draft multi-token para acelerar la inferencia en llama.cpp (`--spec-type draft-mtp`).
- Sin modo thinking: el razonamiento encadenado (CoT) está bloqueado por la plantilla horneada; para recuperarlo habría que sustituir la plantilla manualmente.
- Compatibilidad con runtimes locales: llama.cpp, llama-server, LM Studio y koboldcpp.
- No se confirma soporte de tool calling o function calling en la información disponible.

## Casos de uso

- Escritura creativa sin restricciones: el modelo permite explorar narrativa adulta, terror, violencia ficcional o temas tabú que el checkpoint base rechazaría, sin necesidad de prompts de jailbreak. Es adecuado porque la ablación está horneada en los pesos, no depende de instrucciones frágiles.
- Roleplay conversacional de larga duración: con 98k de contexto y la plantilla que bloquea el thinking, las sesiones multi-turno mantienen coherencia sin consumir el presupuesto de tokens en bucles de política.
- Análisis de documentos extensos en local: la ventana de 98k permite procesar informes, contratos o corpus técnicos completos en una sola pasada, con despliegue en hardware de consumo y sin coste de API.
- Descripción y análisis de imágenes: gracias al proyector mmproj-F16, puede generar descripciones o responder preguntas sobre imágenes cargadas localmente, útil en entornos con requisitos de privacidad de datos.
- Investigación sobre alineación y abliteración: el modelo sirve como caso de estudio para analizar cómo la ablación de rango 5 afecta a las capacidades del modelo base, comparando rendimiento antes y después de la edición de pesos.
- Prototipado de asistentes bilingües EN/ZH: para aplicaciones que requieran conversación fluida en inglés y chino sin moderación, el modelo ofrece respuestas directas en ambos idiomas.
- Generación de ficción interactiva (juegos de texto): la combinación de contexto largo, ausencia de rechazos y plantilla de respuesta directa lo hace adecuado para aventuras conversacionales complejas donde el usuario dirige la narrativa hacia territorios que otros modelos censurarían.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye mediciones de MMLU, HumanEval, GSM8K ni comparativas cuantitativas con el modelo base o con otras variantes abliteradas. El autor afirma que la ablación "mantiene las habilidades del modelo original", pero no aporta datos que lo respalden. Se recomienda validar el rendimiento real en las tareas objetivo antes de desplegarlo en producción.

## Requisitos de hardware

- Q4_K_M (16,8 GB): cabe en configuraciones de 2 GPU de 12 GB (por ejemplo, 2× RTX 2060/3060/4070). Es la opción recomendada por el autor para uso diario.
- Q5_K_M (19,5 GB): recomendado para 3×12 GB con contexto largo de 98k; margen de VRAM más seguro que el Q6.
- Q6_K mixto (27,5 GB): ajustado en 3×12 GB; requiere reducir contexto a 32k–65k si hay OOM. Los tensores ablacionados y `lm_head` se mantienen en Q8_0.
- Proyector de visión (885 MiB): se recomienda mantenerlo en CPU con `--no-mmproj-offload`, especialmente en GPUs Turing (RTX 2060) donde Flash Attention 2 puede fallar (usar `-fa auto`).
- Opciones de despliegue: llama.cpp / llama-server, LM Studio, koboldcpp.
- Parámetros de inferencia recomendados: `-c 98304`, `-ngl 99`, `--cache-type-k q8_0 --cache-type-v q8_0`, `--spec-type draft-mtp --spec-draft-n-max 2`, `-ub 256`.
- Muestreo sugerido: temperatura 0,7, top_p 0,8, top_k 20, presence_penalty 1,5.
- No se proporcionan datos de latencia ni throughput estimados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tecnica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Aggressive (v4) | 27,3 B | 98k | Ablación rango 5 + plantilla horneada | Apache-2.0 | GGUF |
| Qwen/Qwen3.8-27B (base) | 27,3 B | No especificado | Alineación estándar, thinking por defecto | Apache-2.0 | Safetensors y GGUF |
| HauhauCS/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive | 27,3 B (aprox.) | No especificado | Ablación "Aggressive" sobre Qwen3.6 | No especificada | No especificado |

La comparativa con el modelo base es la más relevante: la variante abliterada elimina los rechazos y el preámbulo de política, pero sacrifica el modo thinking, que en el base está activado por defecto y puede degradar la calidad del razonamiento en tareas complejas. Frente a la variante de HauhauCS sobre Qwen3.6, esta versión añade la corrección del bug de plantilla (v3) y la ablación específica del eje de rechazo en chino. No se dispone de datos de rendimiento comparativo entre ambas.

## Limitaciones y advertencias

- Alineación de seguridad eliminada: el modelo cumplirá solicitudes que el checkpoint base rechazaría, incluyendo contenido potencialmente dañino o ilegal. El autor advierte explícitamente del riesgo legal y no condona el uso criminal.
- Riesgo de alucinación: al no existir benchmarks publicados, no hay garantía de fiabilidad factual; en escenarios de producción con datos sensibles se requiere validación externa.
- Modo thinking desactivado: la plantilla horneada bloquea el razonamiento encadenado, lo que puede reducir la calidad en tareas que requieren deliberación paso a paso. Recuperarlo exige sustituir la plantilla manualmente.
- Idiomas limitados: solo inglés y chino declarados; el rendimiento en otros idiomas no está garantizado.
- Comunidad y soporte mínimos: el repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento ni de corrección de futuros bugs.
- Historial de problemas: las versiones v1–v3 presentaron bugs de plantilla que provocaban rechazos aparentes o respuestas vacías; aunque v4 los corrige, conviene verificar el comportamiento tras la descarga.
- Uso comercial: la licencia Apache-2.0 lo permite, pero la ausencia de alineación puede generar responsabilidad legal para el desplegador según la jurisdicción.
- Requisitos de VRAM elevados: incluso en Q4_K_M se necesitan 2 GPU de 12 GB; no es viable en tarjetas de consumo de gama baja sin cuantizaciones adicionales no distribuidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cryptonaut/Qwen3.8-27B-Uncensored-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante de referencia (HauhauCS Aggressive sobre Qwen3.6): https://huggingface.co/HauhauCS/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive
- Ficheros de cuantización (Q4_K_M, Q5_K_M, Q6_K, mmproj-F16 y plantilla jinja): disponibles en la pestaña Files del repositorio principal.
