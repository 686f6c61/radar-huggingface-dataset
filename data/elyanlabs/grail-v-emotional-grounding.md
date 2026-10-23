# elyanlabs/grail-v-emotional-grounding

## Resumen

`elyanlabs/grail-v-emotional-grounding` no es un modelo de lenguaje: es un repositorio de investigación publicado en Hugging Face que contiene únicamente código, datos y material de un artículo aceptado en el taller GRAIL-V de CVPR 2026, firmado por Scott Boudreaux (Elyan Labs). El repositorio lo declara de forma explícita: "Code only: nothing here runs on Hugging Face infrastructure". Por tanto, no hay pesos, no hay pipeline de inferencia y no existe un checkpoint que descargar; la etiqueta `llm-inference` del repositorio no se corresponde con su contenido real.

El trabajo estudia si el **registro semántico** del prompt (vocabulario emocional frente a vocabulario literal) afecta a la eficiencia de la difusión en generación imagen-a-vídeo. Mediante pruebas A/B sistemáticas sobre LTX-2 (35 pares emparejados, 7 arcos emocionales, 5 semillas), los autores sostienen que los prompts emocionales mantienen la calidad perceptual con un 20 % menos de pasos de difusión (30 → 24) en retratos individuales, con LPIPS = 0,011 ± 0,005 (n = 15, p < 10⁻¹⁹). Un ablation de control con parámetros idénticos atribuye el efecto al prompt (p = 0,014).

La relevancia práctica es acotada pero concreta: si el efecto se confirma, reducir de 30 a 24 pasos equivale a un 20 % menos de cómputo de difusión por clip en el subconjunto de escenas validadas. El repositorio incluye además un módulo "Prompt Translator" que convierte descriptores de movimiento literales en formulaciones emocionales, y una batería de scripts para reproducir las métricas LPIPS, CLIP y de topología de embeddings (Gemma 3, CLIP ViT-B/32).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: repositorio de código de investigación. El material experimental usa LTX-2 (difusión imagen-a-vídeo) y un codificador de texto Gemma 3 |
| Parámetros totales | No disponible (no se distribuyen pesos) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se declara ventana de contexto; el trabajo opera sobre prompts cortos de descripción de movimiento) |
| Tipos de cuantización | No disponible (sin pesos que cuantizar) |
| Idiomas soportados | No disponible. Los ejemplos del Prompt Translator y del protocolo de evaluación están en inglés; no se declara cobertura multilingüe |
| Licencia | MIT |
| Formato de pesos | No disponible. El repositorio contiene `.py`, `.json`, `.tex`, `.html`, `.md` (código, datos y paper en LaTeX) |

## Arquitectura y entrenamiento

El artefacto no entrena ningún modelo. La metodología descrita es un A/B testing controlado sobre un modelo generativo de terceros (LTX-2): se construyen 35 pares de prompts emparejados, organizados en 7 arcos emocionales con 5 semillas cada uno, y se comparan dos condiciones —STOCK (descriptores literales de movimiento) y NEURO (vocabulario emocional)— manteniendo idénticos el resto de parámetros de generación. La reproducción del barrido de convergencia (`steps_vs_lpips_sweep.py`) requiere ComfyUI y LTX-2, según el propio README.

El análisis técnico se apoya en tres piezas: cálculo de LPIPS a nivel de fotograma para medir diferencia perceptual entre pares renderizados, CLIP ViT-B/32 para alineación imagen-texto, y análisis de topología de embeddings en el espacio del codificador de texto Gemma 3. El hallazgo que sostiene la tesis es que el vocabulario emocional forma clústeres un 16 % más compactos (radio 0,269 → 0,225) y que esa densidad se traduce en convergencia más rápida. El módulo Prompt Translator es una tabla de mapeo determinista, no un modelo entrenado: por ejemplo, "head movement" → "subtle shift in attention", "slight smile" → "knowing smile forming".

## Capacidades

- Traducción de descriptores de movimiento literales a formulaciones emocionalmente ancladas mediante el módulo `neuromorphic_prompt_translator.py`.
- Cálculo de LPIPS por fotograma entre pares de renders (`run_lpips_fvd.py`), con resultados ya volcados en `data/lpips_results.json`.
- Cálculo de similitud imagen-texto con CLIP ViT-B/32 (`compute_clip_image_text.py`).
- Análisis de topología de embeddings de texto, con radio y compacidad de clústeres, sobre el espacio de Gemma 3 (`compute_clip_scores.py`).
- Barrido de convergencia pasos-frente-a-LPIPS para localizar el mínimo de pasos que preserva calidad (`steps_vs_lpips_sweep.py`).
- Suite de benchmark completa que orquesta los pasos anteriores (`neuromorphic_benchmark_suite.py`).
- Protocolo de evaluación humana 2AFC autocontenido en HTML (`human_eval/evaluation_form.html`) con los pares de condiciones en `eval_pairs.json`.
- No ofrece: generación de texto, razonamiento, código, matemáticas, tool calling, soporte de agentes ni capacidades multimodales propias.

## Casos de uso

- **Reducción de coste en pipelines de imagen-a-vídeo**: en la generación de retratos individuales, sustituir el prompt literal por su equivalente emocional permitiría bajar de 30 a 24 pasos de difusión manteniendo calidad perceptual según el estudio, lo que se traduce en un 20 % menos de cómputo por clip en ese subconjunto de escenas.
- **Preprocesado de prompts en flujos ComfyUI**: el Prompt Translator puede insertarse como nodo previo al sampler para reescribir automáticamente descripciones de movimiento antes de la generación, sin cambiar el modelo base.
- **Control de calidad perceptual en producción de vídeo**: reutilizar `run_lpips_fvd.py` y `compute_clip_image_text.py` para monitorizar deriva de calidad entre versiones de un pipeline (cambio de checkpoint, de sampler o de prompt) con métricas objetivas en lugar de inspección manual.
- **Investigación en representación semántica**: el análisis de radio de clústeres sobre embeddings de Gemma 3 sirve como plantilla para estudiar cómo distintos registros lingüísticos (técnico, coloquial, emocional) ocupan regiones más o menos densas del espacio del codificador, y cómo eso afecta a tareas condicionadas por texto.
- **Evaluación humana de estímulos generados**: el formulario 2AFC es reutilizable en cualquier estudio de preferencia por pares de vídeo o imagen, con protocolo documentado en `human_eval/README.md`.
- **Docencia y formación interna**: el diseño experimental (pares emparejados, ablación con parámetros idénticos, control de semillas) es un ejemplo didáctico de A/B testing riguroso aplicado a modelos generativos.
- **Evaluación de artefactos para revisión por pares**: el repositorio incluye el paper en LaTeX, los datos crudos en JSON y las figuras, lo que permite replicar el análisis sin reejecutar la generación.

## Benchmarks y rendimiento

Los resultados publicados no son benchmarks de LLM (no hay MMLU, HumanEval ni GSM8K; no aplican a este artefacto). La comparación es interna, entre las dos condiciones de prompt:

| Métrica | STOCK (literal) | NEURO (emocional) | Hallazgo |
|---|---|---|---|
| Pasos de difusión necesarios | 30 | 24 | Reducción del 20 % |
| LPIPS en retratos individuales | — | 0,011 ± 0,005 (n = 15) | Equivalencia perceptual, p < 10⁻¹⁹ |
| Radio de embedding | 0,269 | 0,225 | 16 % más compacto |
| CLIP imagen-texto (retrato individual) | 0,204 | 0,231 | +13,5 % de alineación |
| CLIP imagen-texto (escena compleja) | 0,296 | 0,244 | −17,4 % (compromiso) |
| Ablación con parámetros idénticos | — | — | Efecto atribuido al prompt, p = 0,014 |

## Requisitos de hardware

- No se publican requisitos de VRAM para el artefacto; no hay pesos que cargar. Los scripts de análisis (LPIPS, CLIP ViT-B/32, sentence-transformers) son ligeros y ejecutables en GPU de consumo, aunque el repositorio no documenta cifras de VRAM ni latencias: **estimación, no dato del autor**.
- El barrido de convergencia `steps_vs_lpips_sweep.py` requiere ComfyUI y LTX-2, un modelo de difusión de vídeo; el repositorio no especifica VRAM mínima para esa parte (**no disponible**).
- Infraestructura declarada por el autor para el estudio: IBM POWER8 S824 con 512 GB de RAM y una Tesla V100 de 32 GB, además de sistemas PowerPC antiguos. No se recibió financiación institucional.
- Dependencias de software: `torch`, `lpips`, `webp`, `sentence-transformers`, `transformers`, `Pillow`, `matplotlib`.
- Opciones de despliegue: no aplica como modelo servible; integración como scripts de Python y como nodo dentro de ComfyUI.
- Throughput y latencia: no disponibles.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos ni artefactos comparables de la misma categoría; el repositorio no es un modelo y no compite con LLM ni con modelos de difusión. La única comparación con datos es la que el propio paper establece entre condiciones de prompt:

| Enfoque | Pasos | LPIPS (retrato) | CLIP individual | CLIP complejo | Licencia |
|---|---|---|---|---|---|
| Prompts literales (STOCK) | 30 | Referencia | 0,204 | 0,296 | No aplica |
| Prompts emocionales (NEURO, este trabajo) | 24 | 0,011 ± 0,005 | 0,231 | 0,244 | MIT |
| Modelos o herramientas de terceros equivalentes | No disponible | No disponible | No disponible | No disponible | No disponible |

Componentes de terceros empleados: LTX-2 (generación de vídeo; licencia no indicada en el material disponible) y Gemma 3 (codificador de texto; licencia no indicada en el material disponible).

## Limitaciones y advertencias

- **No es un modelo**: el repositorio no contiene pesos ni pipeline; cualquiera que llegue buscando un LLM o un modelo de vídeo no encontrará nada ejecutable en Hugging Face. La etiqueta `llm-inference` es engañosa.
- **Alcance del efecto limitado**: la reducción de 30 a 24 pasos se valida en retratos individuales (n = 15 para LPIPS). En escenas complejas la alineación CLIP cae un 17,4 %, por lo que el beneficio no es generalizable sin verificación previa.
- **Dependencia de un único modelo base**: todo el estudio se hace sobre LTX-2; no hay evidencia de que el efecto se reproduzca en otros modelos de difusión de vídeo o de imagen.
- **Muestra pequeña**: 35 pares y 5 semillas. El valor p reportado (p < 10⁻¹⁹, n = 15) es extraordinariamente bajo para ese tamaño muestral y el material disponible no especifica qué test se empleó, lo que aconseja revisar la metodología estadística antes de citar la cifra.
- **Estado de publicación**: aceptado en un taller (GRAIL-V, CVPR 2026), no en una revista con revisión completa; el material es un preprint de taller.
- **Licencias de terceros**: el código es MIT, pero el uso comercial del pipeline completo depende de las licencias de LTX-2, Gemma 3 y CLIP ViT-B/32, que el repositorio no detalla.
- **Sin idiomas declarados**: el Prompt Translator está construido y ejemplificado en inglés; no hayvalidación en castellano ni en otras lenguas, y el efecto del registro emocional puede no transferirse entre idiomas.
- **Sesgos no evaluados**: el paper no analiza sesgos demográficos, culturales ni de representación en los retratos generados.
- **Riesgo de sobreinterpretación**: la tesis de que el vocabulario emocional "ancla semánticamente" mejor es una hipótesis mecanística apoyada en la compacidad de clústeres; la relación causal entre densidad de embedding y convergencia de difusión no se demuestra formalmente en el material disponible.
- **Tracción nula**: 0 descargas y 0 likes en el momento de la consulta; sin releases ni issues que permitan evaluar mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/elyanlabs/grail-v-emotional-grounding
- Repositorio GitHub (fuente original): https://github.com/Scottcjn/grail-v-emotional-grounding
- Repositorio GitLab (historial completo): https://gitlab.com/elyan-labs/grail-v-emotional-grounding
- Laboratorio: https://elyanlabs.com
- Certificación BCOS: https://huggingface.co/elyanlabs/grail-v-emotional-grounding/blob/main/BCOS.md
- Paper en LaTeX: `paper/grail_v_paper.tex` y `paper/supplementary.tex` dentro del repositorio
- Datos crudos: `data/lpips_results.json`, `data/clip_image_text_scores.json`, `data/clip_text_similarity.json`, `data/stock_realization_convergence.json`
- Protocolo de evaluación humana: `human_eval/README.md` y `human_eval/evaluation_form.html`
- Cita: Boudreaux, S. "Emotional Vocabulary as Semantic Grounding: How Language Register Affects Diffusion Efficiency in Image-to-Video Generation", CVPR 2026 Workshop on Generative Models for Computer Vision (GRAIL-V)
