# RMDWLLC/Jah-4.0

## Resumen

Jah 4.0 es un modelo de lenguaje de 27.782 millones de parámetros desarrollado por RMDW LLC, la empresa detrás de Kiyomi, un asistente de IA privado comercializado como alternativa a ChatGPT y Claude. El modelo está diseñado para ejecutarse íntegramente en hardware propiedad de RMDW, de modo que los datos de los usuarios no salen a nubes de terceros. Esta versión 4.0 introduce por primera vez razonamiento nativo integrado en los pesos, una arquitectura de atención híbrida que intercala capas lineales y completas, y una ventana de contexto de 1.048.576 tokens.

El modelo se sirve en producción mediante vLLM con paralelismo tensorial sobre cuatro GPU NVIDIA RTX PRO 6000 Blackwell de 96 GB, empleando cuantización FP8 de grano fino y decodificación especulativa con tres tokens por paso. Su licencia MIT permite uso comercial sin restricciones, y los pesos están publicados en formato safetensors. Está orientado a tareas de agente, tool calling y razonamiento multi-paso, con soporte declarado únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención lineal y completa intercaladas |
| Parametros totales | 27.782.935.472 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.048.576 tokens (con escalado YaRN) |
| Tipos de cuantizacion | FP8 (block size 128); modelo original en BF16 |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Jah 4.0 emplea una arquitectura de atención híbrida que intercala capas de atención lineal y capas de atención completa. Este diseño reduce el coste cuadrático de los transformers estándar en contextos largos, permitiendo procesar ventanas de hasta un millón de tokens con un coste computacional contenido. El modelo incorpora además un mecanismo de razonamiento nativo: una pasada de razonamiento dedicada se ejecuta en cada petición, realizando planificación, autoverificación y comprobación de errores antes de generar la respuesta final. Según la documentación del autor, este comportamiento está integrado en los pesos del modelo y no depende de wrappers externos ni de trucos de prompting.

La inferencia se acelera mediante decodificación especulativa con predicción multi-token (MTP), generando tres tokens especulativos por paso para reducir la latencia sin alterar la calidad de salida. El modelo se sirve en FP8 con bloque de cuantización de tamaño 128, lo que, según el autor, produce métricas de rendimiento casi idénticas al modelo original en BF16. No se ha publicado información sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el proceso de alineación (RLHF, DPO u otros). Tampoco se detalla la composición del dataset ni las técnicas de fine-tuning empleadas.

## Capacidades

- Razonamiento nativo: el modelo ejecuta una pasada de razonamiento interna en cada petición, con planificación, autoverificación y corrección de errores antes de responder.
- Tool calling nativo: soporta un formato propio de function calling para interactuar con archivos, terminal, navegador, control de macOS, conectores, búsqueda web y subagentes.
- Contexto ultralargo: ventana de 1.048.576 tokens con escalado YaRN y caché KV en FP8, adecuada para mantener conversaciones con repositorios completos o grandes conjuntos de documentos.
- Generación de código y despliegue: capaz de escribir proyectos completos, subirlos a GitHub y desplegarlos en una URL pública.
- Compatibilidad con APIs de terceros: puede servir como backend para herramientas compatibles con OpenAI o Anthropic, como Claude Code o Codex.
- Agente en escritorio: la aplicación macOS de Kiyomi permite al modelo controlar archivos, terminal y navegador como agente de codificación, con control remoto desde iPhone.
- Decodificación especulativa: genera múltiples tokens por paso (3 especulativos) para reducir la latencia de inferencia.

## Casos de uso

- Asistente de chat privado con artifacts: el modelo gestiona conversaciones multi-turno con memoria persistente, búsqueda web citada y ejecución de código, todo ello en hardware propio sin fuga de datos a terceros.
- Desarrollo de aplicaciones completas: un usuario describe una aplicación o sitio web y Jah 4.0 escribe el proyecto, lo sube a un repositorio GitHub del usuario y lo despliega en una URL viva, gracias a su tool calling nativo y su capacidad de razonamiento multi-paso.
- Backend para herramientas de desarrollo: apuntando Claude Code, Codex o cualquier cliente compatible con OpenAI/Anthropic a la API de Kiyomi, Jah 4.0 actúa como motor de escritura y refactorización de código sobre hardware privado.
- Agente de codificación en escritorio: la aplicación macOS de Kiyomi permite al modelo operar sobre el sistema de archivos local, la terminal y el navegador, ejecutando tareas de desarrollo complejas con control remoto desde un iPhone.
- Análisis de repositorios completos: gracias a su ventana de 1M tokens, el modelo puede recibir un código base entero con su historial y responder preguntas o realizar modificaciones sobre él en una sola conversación.
- Automatización de tareas de investigación: con búsqueda web citada y razonamiento interno, puede recopilar información, contrastar fuentes y producir informes estructurados sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa. Tampoco se ofrecen métricas de latencia o throughput medidas en producción.

## Requisitos de hardware

- Configuración oficial de producción: 4x NVIDIA RTX PRO 6000 Blackwell (96 GB cada una) con paralelismo tensorial (`--tensor-parallel-size 4`).
- VRAM estimada: los pesos en FP8 ocupan aproximadamente 28 GB, pero la caché KV para 1M tokens en FP8 requiere cientos de GB adicionales, por lo que el contexto completo exige múltiples GPU de alta gama.
- Para contextos reducidos (por ejemplo, 32K o 128K tokens), podría ejecutarse en una sola GPU de 48 GB o 80 GB, aunque no hay datos oficiales que lo confirmen.
- Opciones de despliegue: vLLM es el servidor utilizado en producción, con parámetros específicos como `--kv-cache-dtype fp8`, `--speculative-config` y `--enable-auto-tool-choice`. No se menciona soporte para llama.cpp, Ollama o TGI.
- Parámetros de generación recomendados: `temperature=0.6`, `top_p=0.95`, `top_k=20`.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. No se han publicado benchmarks que permitan contrastar Jah 4.0 con otros modelos de tamaño similar (por ejemplo, Llama 3 30B, Mistral Large o Qwen 2.5 32B). La arquitectura híbrida y el razonamiento nativo son características distintivas, pero sin datos de rendimiento objetivos no es posible posicionarlo frente a alternativas. Se indica "no disponible".

## Limitaciones y advertencias

- Idioma: el modelo declara soporte únicamente para inglés. No hay evidencia de capacidades multilingües, por lo que su uso en otros idiomas puede producir resultados deficientes.
- Sesgos y seguridad: no se ha publicado ninguna evaluación de sesgos, toxicidad o comportamientos peligrosos. La ausencia de documentación sobre alineación (RLHF, DPO, etc.) implica un riesgo desconocido en entornos de producción.
- Alucinaciones: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo o con contextos muy largos.
- Requisitos de hardware: el despliegue con contexto completo exige infraestructura de gama alta (múltiples GPU de 96 GB), lo que limita su uso a organizaciones con presupuesto significativo.
- Dependencia del ecosistema: el tool calling y el razonamiento nativo están diseñados para el harness de Kiyomi; su integración con otros frameworks puede requerir adaptación.
- Transparencia del entrenamiento: no se ha publicado información sobre el dataset, el número de tokens de entrenamiento ni el proceso de alineación, lo que dificulta evaluar su robustez y reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RMDWLLC/Jah-4.0
- Perfil de la organización RMDWLLC: https://huggingface.co/RMDWLLC/models
- Página del producto Kiyomi: https://kiyomibot.ai
- Sitio de RMDW AI Consulting: https://rmdw.ai
- Página de venta de Kiyomi: https://echols.ai/
