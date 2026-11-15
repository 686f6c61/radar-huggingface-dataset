# N8nZero/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "decensored" (abliterated) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de razonamiento de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El autor de esta variante es N8nZero, que ha aplicado la herramienta Heretic v2.0.0.dev0 para eliminar el comportamiento de rechazo del modelo original mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA).

El modelo base concentra su señal de entrenamiento supervisado en matemáticas y resolución de problemas STEM, con aproximadamente 250.000 muestras, preservando la eficiencia y desplegabilidad práctica de la clase de 9B parámetros. Esta variante hereda esas capacidades y añade una reducción drástica de rechazos: según la model card, pasa de 100/100 rechazos en el modelo original a 3/100 en esta versión, con una divergencia KL de 0,0422 respecto al original.

Es relevante ahora porque combina tres tendencias: la destilación de modelos grandes de razonamiento en tamaños desplegables en hardware de consumo, la eliminación de restricciones de alineación mediante técnicas de ablación, y la preservación declarada de capacidades de tool calling y function calling. El modelo tiene 9.409.813.744 parámetros reales según safetensors y un repositorio de 19,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B con destilación de DeepSeek-V4-Pro en modo Max Effect, orientado a razonamiento matemático y STEM. El entrenamiento supervisado se centró en aproximadamente 250.000 muestras de matemáticas y razonamiento científico. Los tags del repositorio mencionan SFT, RL, GSPO (Group Sequence Policy Optimization), MTP (multi-token prediction) y evaluación con NVFP4, lo que sugiere un pipeline de post-entrenamiento con refuerzo y decodificación especulativa por predicción multi-token, aunque la model card no detalla la composición exacta del dataset ni las fases de RLHF/DPO.

La innovación de esta variante concreta es la aplicación de Heretic v2.0.0.dev0 mediante Arbitrary-Rank Ablation (ARA) sobre las capas 9 a 24, con parámetros específicos: `preserve_good_behavior_weight` 0,8264, `steer_bad_behavior_weight` 0,0003, `overcorrect_relative_weight` 0,9645 y `neighbor_count` 12. Esta técnica modifica los pesos para suprimir direcciones de activación asociadas a rechazos, manteniendo el comportamiento útil. El resultado declarado es una reducción de rechazos de 100/100 a 3/100 con una divergencia KL de 0,0422 frente al modelo original, lo que indica un cambio moderado en la distribución de salidas.

## Capacidades

- Generación de texto y razonamiento estructurado con descomposición de problemas en múltiples pasos, heredado de la destilación de DeepSeek-V4-Pro.
- Matemáticas y STEM: entrenamiento específico sobre aproximadamente 250.000 muestras de matemáticas y ciencia.
- Tool calling y function calling: los tags incluyen `tool-use` y `function-calling`, y la model card menciona mejoras en uso de herramientas.
- Programación: la model card indica pequeñas ganancias en programación y uso de herramientas pese a no recibir SFT específico de código.
- Capacidades multilingües en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (tag `reasoning`), con patrones de solución multi-paso.
- Entrada imagen-texto: el tag `image-text-to-text` aparece en el repositorio, aunque no se detalla la arquitectura de visión.
- Comportamiento "uncensored"/abliterated: rechazos reducidos a 3/100 según la model card.
- Compatible con endpoints (`endpoints_compatible`) y text-generation-inference.

## Casos de uso

- Resolución de problemas matemáticos y científicos: el modelo está entrenado específicamente sobre ~250.000 muestras de matemáticas y STEM, por lo que es adecuado para tutoría automatizada, generación de soluciones paso a paso y verificación de razonamiento en entornos educativos o de investigación.
- Asistencia en investigación STEM: puede descomponer problemas complejos y estructurar soluciones multi-paso, útil para preprocesar y explorar hipótesis en dominios científicos donde se requiere razonamiento explícito.
- Agentes con tool calling: los tags de `tool-use` y `function-calling` permiten integrarlo en pipelines de agentes que invocan APIs, calculadoras o motores de búsqueda, con la ventaja de un tamaño de 9B desplegable en una sola GPU.
- Generación de código asistida: aunque no recibió SFT específico de código, la model card reporta ganancias en programación por transferencia cruzada; puede usarse para autocompletado, explicación de fragmentos y generación de tests en pipelines de CI/CD.
- Procesamiento multilingüe: soporta inglés, chino, coreano, japonés, español y ruso, lo que lo hace apto para aplicaciones de atención al cliente o documentación en entornos multilingües.
- Escenarios que requieren baja tasa de rechazo: al estar abliterated, es adecuado para investigación sobre alineación, red teaming, generación de contenido creativo sin restricciones excesivas o análisis de textos sensibles, siempre con las advertencias legales y éticas correspondientes.
- Despliegue en hardware de consumo: con 9,4B parámetros y pesos safetensors, puede ejecutarse en GPUs consumer de gama alta mediante cuantización, lo que facilita prototipado local y experimentación.

## Benchmarks y rendimiento

La model card proporciona métricas de comportamiento tras la ablación, pero no benchmarks estándar (MMLU, HumanEval, GSM8K).

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 9,4B parámetros, en fp16 serían aproximadamente 18,8 GB solo de pesos, y en cuantizaciones de 8 bits o 4 bits se reduciría sustancialmente, pero no se confirman los formatos soportados.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU consumer? No confirmado; por tamaño (9,4B) es plausible en GPUs consumer de gama alta con cuantización, pero no hay datos oficiales.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), endpoints compatibles; no se confirman vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic) | 9,4B | no disponible | apache-2.0 | Variante abliterated con 3/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | 9B (clase) | no disponible | apache-2.0 | Modelo original con 100/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | 4B (clase) | no disponible | no disponible | Versión 4B de la misma familia decensored |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | 9B (clase) | no disponible | no disponible | Fine-tune científico basado en este modelo |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La ablación elimina el comportamiento de rechazo, lo que puede facilitar la generación de contenido dañino, ilegal o éticamente problemático; no debe desplegarse en producción orientada a usuarios sin filtros externos.
- La divergencia KL de 0,0422 indica que la distribución de salidas se ha alterado; pueden aparecer degradaciones en tareas que dependían de la alineación original.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual en la información disponible.
- Longitud de contexto no documentada: limita la planificación para aplicaciones que requieran ventanas largas.
- Idiomas soportados limitados a seis (en, zh, ko, ja, es, ru); no se garantiza calidad en otros.
- Licencia apache-2.0 permite uso comercial, pero el comportamiento abliterated puede entrar en conflicto con políticas de plataformas y requisitos regulatorios; la responsabilidad legal recae en el desplegador.
- El modelo base es un fine-tune destilado; las capacidades fuera de matemáticas y STEM pueden ser limitadas pese a las ganancias reportadas en código.
- Sin datos de benchmarks estándar ni de latencia/throughput, lo que dificulta la comparación objetiva con alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/N8nZero/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Versión 4B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune científico DeepThought: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic (herramienta de ablación): https://heretic-project.org
