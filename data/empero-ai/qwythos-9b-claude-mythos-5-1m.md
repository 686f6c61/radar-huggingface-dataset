# empero-ai/Qwythos-9B-Claude-Mythos-5-1M

## Resumen

Qwythos-9B-Claude-Mythos-5-1M es un modelo de razonamiento de 9 400 millones de parámetros desarrollado por Empero, un laboratorio independiente de investigación en IA, sobre la base de Qwen3.5-9B. Se trata de un ajuste fino completo (full fine-tune) sobre más de 500 millones de tokens de trazas de razonamiento generadas por Claude Mythos y Claude Fable, con cadenas de pensamiento producidas por la herramienta interna de Empero llamada «rethink». El resultado es un modelo denso de 9B que, según sus autores, supera a su base en 34 puntos en MMLU y 30 puntos en GSM8K estricto bajo condiciones de evaluación idénticas.

Su característica más distintiva es una ventana de contexto de 1 048 576 tokens (aproximadamente 1M) activada por defecto mediante escalado YaRN de rope, una extensión 4× sobre los 262 144 tokens nativos de la arquitectura Qwen3.5. Además, incorpora function calling nativo según la especificación de Qwen3.5 y está diseñado explícitamente como un modelo «sin censura» para dominios técnicos exigentes como ciberseguridad, red-teaming, biomedicina y farmacología clínica, donde los modelos sobre-alineados tienden a rechazar o eludir preguntas. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-9B) con escalado YaRN de rope |
| Parametros totales | 9 409 813 744 (9,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1 048 576 tokens (1M) por defecto; 262 144 nativos |
| Tipos de cuantizacion | No disponible en la documentacion; existen versiones GGUF publicadas por el autor |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo principal); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

Qwythos-9B es un transformer denso construido sobre Qwen3.5-9B, del que hereda la arquitectura base. El entrenamiento consistió en un ajuste fino completo (full fine-tune) sobre más de 500 millones de tokens de trazas de Claude Mythos y Claude Fable, con cadenas de pensamiento generadas internamente por la herramienta «rethink» de Empero. No se menciona el uso de RLHF o DPO; el proceso documentado es exclusivamente de supervisión (SFT) sobre datos de razonamiento de alta calidad.

La innovación técnica más destacada es el escalado YaRN de rope activado por defecto, que extiende la ventana de contexto de 262 144 a 1 048 576 tokens sin necesidad de configuración adicional por parte del usuario. El modelo conserva el soporte nativo de function calling de Qwen3.5, lo que le permite emitir bloques `<tool_call>` válidos sin ajustes específicos para herramientas. Según la model card, el modelo es capaz de auto-corregirse cuando dispone de herramientas: en una evaluación de 7 prompts con ejecutor de Python y búsqueda web, obtuvo 7 de 7 respuestas correctas con citas de fuentes.

## Capacidades

- Razonamiento con cadena de pensamiento (chain-of-thought) generada durante el post-entrenamiento.
- Generación de texto conversacional y técnico en inglés.
- Function calling nativo según la especificación de Qwen3.5: emite bloques `<tool_call>` válidos con parámetros obligatorios.
- Uso de herramientas con auto-corrección: selecciona ejecutor de Python para problemas matemáticos y búsqueda web para verificación de hechos, integrando múltiples fuentes y citándolas.
- Contexto ultralargo de 1 048 576 tokens, adecuado para razonamiento sobre codebases completas, investigación multi-documento y trayectorias agénticas largas.
- Capacidad para responder sin evasivas en dominios técnicos sensibles: ciberseguridad, red-teaming, farmacología, toxicología, bioquímica y medicina clínica.
- No hay evidencia documentada de capacidades multimodales (visión o audio); el pipeline declarado es text-generation.

## Casos de uso

- Razonamiento sobre codebases completas: la ventana de 1M tokens permite cargar repositorios enteros y responder preguntas de arquitectura, depuración o refactorización sin necesidad de chunking previo. El modelo puede seguir la estructura global del proyecto y razonar sobre dependencias cruzadas entre archivos.
- Investigación multi-documento: con 1M tokens de contexto, es posible alimentar decenas de papers, informes o artículos y pedir síntesis, comparativas o extracción de conclusiones, reduciendo la pérdida de información típica de enfoques con contexto corto.
- Agentes de verificación de hechos: combinado con búsqueda web y ejecución de Python, Qwythos puede contrastar datos técnicos (versiones de software, CVEs, dosis farmacológicas) y producir respuestas citadas, como demuestra su 7/7 en la evaluación de herramientas.
- Ciberseguridad y red-teaming: el modelo está entrenado para abordar sin evasivas temas como modos de hashcat, análisis de vulnerabilidades (por ejemplo, PrintNightmare, CVE-2021-34527) y metodologías de pruebas de penetración, con verificación mediante herramientas cuando es posible.
- Consultas biomédicas y farmacológicas: puede responder preguntas clínicas y toxicológicas complejas, como la indicación de fisostigmina en intoxicación por organofosforados, integrando fuentes especializadas cuando dispone de acceso a búsqueda.
- Automatización de cálculo numérico y simbólico: con el ejecutor de Python integrado, puede resolver problemas matemáticos que requieren precisión (por ejemplo, seno y coseno con 10 decimales) o implementar algoritmos como cribas para contar primos, sin depender de memoria interna.
- Asistencia en investigación académica: el modelo puede redactar secciones de papers, revisar metodologías y generar hipótesis en biología, física o política, apoyándose en su rendimiento en MMLU (0,575 de media, con picos de 0,78 en gobierno y política).

## Benchmarks y rendimiento

La model card publica resultados comparativos entre Qwythos-9B y su base Qwen3.5-9B, obtenidos con `lm-evaluation-harness`, backend HF, `--apply_chat_template`, muestreo Qwen3.5 (`temperature=0.6, top_p=0.95, top_k=20`) y `--limit 100`. Los datos son los siguientes:

| Tarea | Metrica | Base Qwen3.5-9B | Qwythos-9B | Delta |
|---|---:|---:|---:|---:|
| gsm8k | exact_match (flexible) | 0,670 | 0,860 | +0,190 |
| gsm8k | exact_match (estricto) | 0,510 | 0,810 | +0,300 |
| mmlu | acc | 0,232 | 0,575 | +0,343 |
| arc_challenge | acc | 0,470 | 0,490 | +0,020 |
| arc_challenge | acc_norm | 0,400 | 0,410 | +0,010 |
| gpqa_diamond (CoT, 0-shot) | exact_match (flexible) | 0,630 | 0,580 | −0,050 |

En MMLU, el modelo alcanza una media de 0,575 sobre las 57 materias, con picos de 0,78 en gobierno y política, 0,77 en biología universitaria y 0,74 en física conceptual. En la evaluación de uso de herramientas, obtuvo 7 de 7 respuestas correctas en prompts que incluían cálculo numérico, conteo de primos, versiones de CPython, modos de hashcat, CVEs y consultas toxicológicas. No se han publicado resultados de benchmarks comparativos con otros modelos de la misma clase fuera de su base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 18-19 GB (9,4B parámetros × 2 bytes), lo que requiere una GPU de 24 GB como RTX 4090 o A10G.
- Con cuantización GGUF Q4 (disponible en el repositorio separado del autor), la huella de memoria se reduce a unos 5-6 GB, permitiendo ejecución en GPUs de consumo como RTX 3060 12 GB o RTX 4070.
- GPU recomendadas para FP16: A100 40 GB, H100, RTX 4090 24 GB, L40S.
- Para el contexto de 1M tokens, la memoria de caché KV puede superar ampliamente la del modelo: se recomienda usar cuantización KV-cache o despliegue con vLLM u otros servidores que soporten gestión eficiente de contexto largo.
- Opciones de despliegue: transformers (librería principal), vLLM, llama.cpp (vía GGUF), Ollama (si se publica en su registro), TGI.
- No se dispone de datos de latencia o throughput publicados por el autor.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados frente a otros modelos de la misma clase (por ejemplo, Llama-3.1-8B, Mistral-7B, Gemma-2-9B) en la información proporcionada. La única comparación documentada es contra su base Qwen3.5-9B, con los resultados mostrados en la sección de benchmarks. Como referencia cualitativa, el modelo se posiciona como un 9B denso con contexto de 1M tokens y function calling nativo, características que lo diferencian de la mayoría de modelos de su tamaño, que suelen ofrecer contextos de 32K-128K. La licencia Apache 2.0 y la disponibilidad de pesos en safetensors y GGUF facilitan su adopción en producción.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; no hay evidencia de capacidades multilingües fiables fuera de ese idioma.
- Es intencionalmente «sin censura»: puede generar contenido técnico sensible (armas, agentes químicos, exploits) que otros modelos rechazan. Su uso debe evaluarse según el contexto legal y ético aplicable.
- En modo closed-book (sin herramientas), el modelo puede alucinar datos específicos, como reconocen los propios autores al recomendar verificación mediante búsqueda web o ejecución de código.
- El rendimiento en contexto de 1M tokens no está evaluado: los benchmarks publicados usan ventanas cortas, y el escalado YaRN puede degradar la precisión en tramos muy largos. No se han publicado pruebas de recuperación de información a 1M tokens.
- La evaluación de benchmarks usa un límite de 100 muestras por tarea (`--limit 100`), lo que reduce la significancia estadística de las diferencias reportadas.
- El tag `image-text-to-text` en HuggingFace no está respaldado por documentación sobre capacidades multimodales; el pipeline declarado es text-generation.
- La licencia Apache 2.0 permite uso comercial, pero el modelo hereda condiciones del base Qwen3.5-9B; se recomienda revisar la licencia del modelo original para confirmar compatibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M
- Repositorio GGUF: https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M-GGUF
- Pagina de modelos de Empero: https://empero.org/models
- Entrada de blog de lanzamiento: https://empero.org/writing/qwythos-9b-release
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwythos-9b-claude-mythos-5-1m-empero-ai
