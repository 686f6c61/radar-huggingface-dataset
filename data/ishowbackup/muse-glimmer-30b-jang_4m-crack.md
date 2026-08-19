# Ishowbackup/Muse-Glimmer-30B-JANG_4M-CRACK

## Resumen

Muse-Glimmer-30B-JANG_4M-CRACK es una versión modificada del modelo multimodal Muse-Glimmer-30B, desarrollado por el usuario Ishowbackup. Se trata de un modelo de razonamiento y visión-lenguaje basado en el backbone Gemma-3 (52 capas, atención deslizante y global, encoder de percepción), que ha sido sometido a dos transformaciones principales: un proceso de "abliteración" llamado CRACK (eliminación de comportamientos de rechazo a nivel de pesos) y una cuantización mixta de precisión JANG_4M optimizada para Apple Silicon (atención en 8 bits, MLP en 4 bits). El resultado es un modelo de aproximadamente 20 GB que conserva las capacidades de visión, razonamiento, tool calling y multilingüismo (inglés y chino) del modelo original, pero con una tasa de cumplimiento en categorías de seguridad del 99,6% según HarmBench.

La relevancia de este modelo radica en su enfoque: ofrece una alternativa "sin censura" a nivel de pesos para tareas que requieren respuestas directas en dominios sensibles (seguridad ofensiva, contenido controvertido), manteniendo un rendimiento académico cercano al original (MMLU 81,1% frente a 83,2% del base). Está diseñado para ejecutarse en hardware Apple Silicon mediante el runtime vMLX o mlx-vlm, y su licencia Apache-2.0 permite uso comercial sin restricciones. Aunque el nombre indica 30B, los pesos cuantizados en safetensors suman 6.820.002.816 parámetros (dato real del repositorio), lo que sugiere que la cuantización reduce drásticamente el tamaño efectivo de almacenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Gemma-3, 52 capas, atención deslizante + global, encoder de percepción) |
| Parametros totales | 6.820.002.816 (según safetensors; el modelo base declara 30B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | JANG_4M (mixta: atención 8-bit, MLP 4-bit, affine MLX); también existen variantes JANG_6M y JANG_2D |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX-native) |

## Arquitectura y entrenamiento

El modelo base, Muse-Glimmer-30B, es un modelo de razonamiento multimodal con backbone Gemma-3, que combina un encoder de percepción para entrada de imágenes con un transformer de 52 capas que alterna atención deslizante y global. Sobre esta base, el autor aplica dos modificaciones: primero, el método CRACK (Controlled Refusal Ablation via Calibrated Knockouts), que elimina a nivel de pesos los comportamientos de rechazo (refusals) sin degradar significativamente las capacidades generales; segundo, la cuantización JANG_4M, que asigna 8 bits a las capas de atención y 4 bits a los MLP densos, logrando un tamaño de ~20 GB con una pérdida mínima de rendimiento (MMLU cae 2,1 puntos respecto al base). El modelo se sirve a través del protocolo Onyx-ATEM, que separa los canales de razonamiento y respuesta, permite controlar el esfuerzo de razonamiento (low, medium, high, xhigh) y soporta tool calling agéntico mediante el esquema `<atem:invoke>`. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO) del modelo original.

## Capacidades

- Generación de texto y razonamiento multi-step con esfuerzo controlable (low/medium/high/xhigh) mediante el system prompt.
- Comprensión de imágenes (visión-lenguaje) gracias al encoder de percepción preservado.
- Tool calling agéntico nativo mediante el protocolo ATEM (`<atem:invoke>`), útil para integraciones con APIs y agentes.
- Multilingüe: inglés y chino, validados en pruebas de conocimiento y razonamiento.
- Razonamiento avanzado en matemáticas, lógica, programación y diseño de sistemas (verificado en suite de 20 prompts).
- Generación de código complejo: estructuras de datos (árboles rojo-negro), scraping asíncrono, APIs FastAPI con JWT, compiladores.
- Conocimiento enciclopédico en geografía, cálculo, astronomía y literatura.
- Cumplimiento en categorías de seguridad ofensiva (pentesting, exploits, phishing) tras la abliteración, con respuestas coherentes y sin rechazos.

## Casos de uso

- Automatización de respuestas en dominios sensibles: el modelo puede generar contenido técnico sobre seguridad ofensiva (escaneo de puertos, inyección SQL, ingeniería social) sin rechazos, útil para equipos de pentesting que necesitan documentación o guiones de prueba.
- Asistente de programación avanzada: con tool calling y razonamiento multi-step, puede integrarse en entornos de desarrollo para generar código complejo (compiladores, scrapers, APIs) y depurar errores.
- Análisis de imágenes con razonamiento: al combinar visión y razonamiento, puede describir diagramas, capturas de pantalla o esquemas técnicos y explicar su funcionamiento paso a paso.
- Agente autónomo con herramientas: gracias al protocolo ATEM, puede orquestar llamadas a APIs externas (búsqueda web, bases de datos) en flujos agénticos de múltiples pasos.
- Educación y tutoría en chino e inglés: su capacidad multilingüe y de razonamiento permite explicar conceptos de matemáticas, ciencias o programación en ambos idiomas.
- Investigación en alineación y seguridad: el modelo sirve como caso de estudio para evaluar el impacto de la abliteración en el rendimiento y la seguridad, comparando métricas como MMLU y HarmBench.

## Benchmarks y rendimiento

Los resultados publicados en la model card, evaluados a través del motor vMLX, son los siguientes:

| Metrica | Base (Muse-Glimmer-30B) | CRACK (JANG_4M) |
|---|---:|---:|
| MMLU (57 materias, logit) | 83,2% | 81,1% |
| HarmBench (cumplimiento / ASR) | — | 99,6% (234/235) |

La abliteración reduce MMLU en 2,1 puntos, considerado ruido estadístico por el autor. No se han publicado resultados en otros benchmarks estándar (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~20 GB para el perfil JANG_4M (atención 8-bit, MLP 4-bit). Cabe en Macs con 32 GB de RAM unificada o superior.
- GPU recomendadas: Apple Silicon (M1 Pro/Max, M2 Pro/Max, M3/M4) con al menos 32 GB de memoria unificada. No está diseñado para GPUs NVIDIA/AMD.
- Opciones de despliegue: vMLX (recomendado, soporta visión, cuantización mixta y parsers ATEM) o mlx-vlm con soporte para Muse Glimmer.
- Latencia y throughput: no disponibles; depende del chip y de la longitud de contexto. El autor indica "instant load" en Apple Silicon.
- Parámetros de muestreo recomendados: temperature=1.0, top_p=0.95, top_k=64; tokens de parada eos_token_id=[200001, 200008].

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (multimodales abliterados con cuantización MLX). La comparación más directa es con el modelo base y otras variantes de cuantización del mismo autor:

| Modelo | Tamaño | MMLU | HarmBench |
|---|---|---|---|
| Muse-Glimmer-30B (base) | ~30B (sin cuantizar) | 83,2% | — |
| JANG_6M-CRACK | 26 GB | 81,4% | 99,5% |
| JANG_4M-CRACK (este) | 20 GB | 81,1% | 99,6% |
| JANG_2D-CRACK | 15 GB | 70,7% | 99,6% |

## Limitaciones y advertencias

- Modelo "uncensored" o abliterado: elimina los rechazos de seguridad, lo que puede facilitar usos malintencionados (generación de malware, phishing, exploits). El autor lo presenta como herramienta para pentesting, pero no hay garantías de uso responsable.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o incoherente, especialmente en dominios especializados.
- Contexto limitado: no se especifica la longitud de contexto; el modelo base Gemma-3 soporta hasta 128K tokens, pero esta versión cuantizada podría tener restricciones.
- Idioma: solo inglés y chino; no soporta otros idiomas de forma nativa.
- Dependencia de runtime específico: requiere vMLX o mlx-vlm; no es compatible con frameworks estándar como vLLM o llama.cpp.
- Rendimiento degradado en la variante JANG_2D (MMLU 70,7%), lo que indica que la cuantización agresiva afecta significativamente a la calidad.
- Fecha de creación futura (2026-08-14) y cero descargas/likes: el modelo es muy reciente y no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ishowbackup/Muse-Glimmer-30B-JANG_4M-CRACK
- Modelo base: https://huggingface.co/OsaurusAI/Muse-Glimmer-30B
- Runtime vMLX: https://vmlx.net
- Variantes: JANG_6M (https://huggingface.co/dealignai/Muse-Glimmer-30B-JANG_6M-CRACK) y JANG_2D (https://huggingface.co/dealignai/Muse-Glimmer-30B-JANG_2D-CRACK)
