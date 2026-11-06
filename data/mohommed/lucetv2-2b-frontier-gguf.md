# mohommed/LucetV2-2B-Frontier-GGUF

## Resumen

LucetV2-2B-Frontier es un ajuste fino del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario mohommed y distribuido en formato GGUF. Se presenta como un modelo orientado al razonamiento autónomo, la generación de código y tareas de sistemas, construido sobre la arquitectura Tri-Hybrid de Liquid AI, que combina convoluciones cortas con compuerta (Gated Short Convolutions), atención de ventana deslizante (Sliding Window Attention) y atención global con GQA. El autor lo etiqueta como un modelo "uncensored" y lo asocia a técnicas que denomina Next-Concept Modeling (NCM) y R-Tuning anti-alucinación.

El modelo cuenta con 1.728.801.600 parámetros reales según los pesos en safetensors, aunque el nombre comercial indica "2B". Se distribuye bajo licencia Apache 2.0 y el repositorio ocupa 8 GB, lo que refleja la inclusión de múltiples cuantizaciones GGUF calibradas con llama-imatrix. La longitud de contexto declarada es de 524.288 tokens (512K), ampliada mediante RoPE con `rope_theta = 4.000.000`.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo pequeño (menos de 2B parámetros) con contexto extremadamente largo y cuantizaciones listas para despliegue local, lo que lo hace interesante para experimentación en entornos con recursos limitados. No obstante, las afirmaciones de la model card sobre capacidades anti-alucinación y planificación estructurada no están respaldadas por benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Tri-Hybrid (Gated Short Convolutions + Sliding Window Attention + Global GQA) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 524.288 tokens (512K), según model card |
| Tipos de cuantizacion | GGUF con calibración llama-imatrix (variantes concretas no especificadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo principal); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Tri-Hybrid de Liquid AI, que combina tres mecanismos de procesamiento de secuencias: convoluciones cortas con compuerta, atención de ventana deslizante y atención global con GQA (Grouped Query Attention). Esta combinación busca equilibrar eficiencia computacional en secuencias largas con capacidad de modelado global. El contexto extendido a 512K se logra mediante RoPE nativo con `rope_theta = 4.000.000`, sin interpolación YaRN en CPU según la model card.

El autor declara un proceso de ajuste basado en Next-Concept Modeling (NCM), descrito como una planificación jerárquica de grueso a fino con etapas `[L1.CONCEPT] -> [L2.STRATEGY] -> [L3.COLLAPSE]`, y un protocolo R-Tuning orientado a evitar que el modelo adivine estados no observados, emitiendo en su lugar herramientas de medición deterministas. También se menciona un proceso de "uncensoring" mediante SVD que elimina direcciones de rechazo en `w2.weight` sin modificar `o_proj.weight`. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Estas técnicas no están documentadas con referencias externas verificables en la información proporcionada.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso, según la model card.
- Generación de código y tareas de sistemas, con emisión de comandos deterministas (`python -c`, `read_file`, `bash`) como parte del protocolo R-Tuning.
- Planificación estructurada mediante NCM en tres niveles (concepto, estrategia, colapso).
- Contexto largo de hasta 524.288 tokens, adecuado para documentos extensos o historiales de conversación prolongados.
- Modelo "uncensored": el autor declara la eliminación de direcciones de rechazo en los pesos, lo que implica ausencia deliberada de filtros de negativa.
- Soporte de tool calling: no confirmado explícitamente como función nativa; la emisión de herramientas se describe como parte del protocolo de medición, no como un esquema de function calling estándar.
- Capacidades multilingües: no disponibles.
- Modo thinking explícito: no disponible como funcionalidad separada; la planificación NCM es el mecanismo declarado.

## Casos de uso

- Análisis de documentos extensos: con 512K tokens de contexto, el modelo puede procesar contratos, informes o bases de código completas en una sola pasada, aunque su tamaño reducido limita la profundidad de razonamiento sobre ellos.
- Asistente de terminal y automatización de sistemas: el protocolo R-Tuning descrito permite al modelo emitir comandos de shell y scripts de Python para verificar el estado del entorno en lugar de suponerlo, lo que encaja en tareas de diagnóstico y automatización.
- Generación de código en entornos con recursos limitados: al ser un modelo de menos de 2B parámetros en GGUF, puede ejecutarse en portátiles o estaciones de trabajo sin GPU dedicada, sirviendo para autocompletado y generación de scripts.
- Experimentación en investigación sobre planificación jerárquica: las etapas NCM declaradas permiten estudiar si la descomposición concepto-estrategia-colapso mejora la coherencia en tareas de razonamiento, aunque sin benchmarks publicados la validación queda del lado del usuario.
- Despliegue local con privacidad de datos: al ejecutarse en local mediante llama.cpp u Ollama, es adecuado para procesar información sensible sin enviarla a servicios externos.
- Chat conversacional sin filtros: el ajuste "uncensored" lo orienta a escenarios de investigación sobre comportamiento de modelos sin rechazo, con las advertencias éticas y legales correspondientes.
- Procesamiento de historiales largos en atención al cliente: la ventana de 512K permite mantener conversaciones multi-turno muy extensas, aunque la calidad en contextos tan largos no está verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; para un modelo de 1,73B parámetros, las cuantizaciones GGUF típicas de 4 bits ocuparían aproximadamente 1-1,5 GB, y las de 8 bits alrededor de 2 GB, sin contar la caché KV. Con contexto de 512K tokens, la memoria para la caché KV crece de forma significativa y puede superar la de los propios pesos.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo cabe en GPUs consumer como RTX 3060, RTX 4060 o superiores en cuantizaciones bajas; para contexto completo de 512K se requiere hardware con memoria abundante (A100 80GB, H100) o técnicas de atención eficiente.
- Cabe en GPU consumer: sí, en cuantizaciones de 4-8 bits y contextos moderados; el contexto completo de 512K es inviable en GPUs consumer convencionales.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. vLLM y TGI no están confirmados para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LucetV2-2B-Frontier | 1,73B | 512K (declarado) | Apache 2.0 | GGUF | Ajuste fino de LFM3-1.7B con NCM y uncensoring |
| LiquidAI/LFM3-1.7B | 1,7B aprox. | no disponible | no disponible en la información | safetensors | Modelo base del que deriva LucetV2 |
| Modelos de ~2B de propósito general (p. ej. Qwen2.5-1.5B, Gemma-2-2B) | 1,5-2B | 32K-128K típicamente | Apache 2.0 / Gemma license | safetensors, GGUF | Alternativas consolidadas con benchmarks publicados; datos concretos no disponibles en esta ficha |

## Limitaciones y advertencias

- No hay benchmarks publicados que respalden las afirmaciones de la model card sobre razonamiento, anti-alucinación o planificación NCM.
- El ajuste "uncensored" elimina deliberadamente direcciones de rechazo, lo que implica riesgo de generar contenido dañino, ilegal o inseguro sin filtros; su uso en producción requiere moderación externa.
- El modelo tiene 1,73B parámetros, por lo que su capacidad de razonamiento profundo y conocimiento factual es limitada en comparación con modelos de mayor tamaño.
- La calidad del contexto de 512K no está verificada; es habitual que modelos pequeños degraden su rendimiento en ventanas muy largas.
- Los idiomas soportados no están documentados; el rendimiento en castellano es desconocido.
- Riesgo de alucinación: aunque el autor declara protocolos anti-alucinación, no hay evidencia independiente; el modelo puede inventar información, especialmente en tareas factuales.
- Sesgos conocidos: no documentados, pero al derivar de un modelo base sin información sobre su dataset, se heredan sesgos desconocidos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base LFM3-1.7B puede tener condiciones adicionales no reflejadas en la información disponible; conviene verificar la licencia del modelo base.
- El repositorio tiene 0 likes y 195 descargas, lo que indica escasa validación por parte de la comunidad.
- El nombre "2B" no coincide con los 1,73B parámetros reales, lo que puede inducir a error en la planificación de recursos.

## Enlaces

- Hugging Face: https://huggingface.co/mohommed/LucetV2-2B-Frontier-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio GGUF alternativo citado en la model card: https://huggingface.co/mohommed/Lucet-2B-Frontier-GGUF
- Paper o blog de la arquitectura Tri-Hybrid de Liquid AI: no disponible en la información proporcionada
- Documentación de llama-imatrix: no disponible en la información proporcionada
- Demos o espacios: no disponibles
