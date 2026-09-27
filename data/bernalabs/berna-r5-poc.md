# BernaLabs/berna-r5-poc

## Resumen

Berna R5 es un modelo de lenguaje desarrollado por Berna Labs con una arquitectura from-scratch denominada DNA-Kernel Plexus. Se trata de una prueba de concepto (PoC) de 50 millones de parámetros, diseñada para validar cinco resultados teóricos antes de escalar a 1.500 millones. El modelo se basa en células de conocimiento dinámicas que nacen, se dividen y se interconectan según una variedad de saturación de conocimiento de 6 dimensiones (L, W, H, D, T, E). Incorpora un vocabulario de 200.000 tokens que reserva rangos para texto, visión y audio, y soporta una longitud de contexto de 8192 tokens.

La innovación principal es la demostración de olvido cero (F_j <= 1e-6) en aprendizaje continuo, junto con un mecanismo de autocorrección que activa FAIL_CLOSED ante cualquier violación de invariantes. El entrenamiento se realizó con ~800 millones de tokens procedentes de WikiText-103, un subconjunto de Python de The Stack y OpenWebMath. Está destinado exclusivamente a la investigación en aprendizaje continuo y arquitecturas bio-inspiradas; no es apto para producción ni para decisiones de alto riesgo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DNA-Kernel Plexus, pipeline de 6 etapas (sensors, spinal cord, plexus, cells, DNA kernel, registry) |
| Parámetros totales | 50M (PoC); objetivo futuro de 1.5B |
| Parámetros activos | no disponible (etiquetado como mixture-of-experts, pero no se especifican parámetros activos) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | berna-research-1.0 (Berna Research License v1.0) |
| Formato de pesos | no disponible (librería PyTorch) |
| Vocabulario | 200.000 tokens (texto: 0-63.999; visión: 64.000-163.999; audio: 164.000-199.999) |
| Cromosomas DNA | 100 (10 grupos x 10) |
| Dimensiones de conocimiento | 6 (L, W, H, D, T, E) |
| Hardware de entrenamiento | RTX 5090 (32 GB VRAM) y CPU para validación |

## Arquitectura y entrenamiento

La arquitectura DNA-Kernel Plexus se estructura en un pipeline de 6 etapas: sensores, médula espinal, plexo, células, núcleo DNA y registro. El modelo utiliza células de conocimiento dinámicas que pueden nacer, dividirse y conectarse según una variedad de saturación de conocimiento de 6 dimensiones. Incorpora 100 cromosomas DNA (10 grupos de 10) y está etiquetado como mixture-of-experts, aunque no se detallan los parámetros activos. La innovación destacable es la demostración teórica y empírica de olvido cero (F_j <= 1e-6) en aprendizaje continuo, junto con un mecanismo de autocorrección que garantiza FAIL_CLOSED ante violaciones de invariantes. El contexto es de 8192 tokens, aunque el entrenamiento se realizó con secuencias de 512 tokens.

El entrenamiento se llevó a cabo con aproximadamente 800 millones de tokens: WikiText-103 (~100M), un subconjunto de Python de The Stack (~500M) y OpenWebMath (~200M). Se utilizó el optimizador AdamW con una tasa de aprendizaje de 3e-4, tamaño de lote 4, longitud de secuencia 512 y semilla 42. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El hardware empleado fue una RTX 5090 (32 GB VRAM) y CPU para validación.

## Capacidades

- Generación de texto en inglés, entrenado sobre WikiText-103.
- Generación de código en Python, gracias al subconjunto de The Stack.
- Razonamiento matemático básico, entrenado con OpenWebMath.
- Aprendizaje continuo con olvido cero demostrado (F_j <= 1e-6).
- Crecimiento dinámico de células de conocimiento según saturación.
- Autocorrección mediante mecanismo FAIL_CLOSED ante violación de invariantes.
- Vocabulario con tokens reservados para visión y audio, aunque no hay evidencia de entrenamiento multimodal.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: únicamente inglés.
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso

- Investigación en aprendizaje continuo: el modelo permite experimentar con la incorporación de nuevas tareas sin degradar el rendimiento en tareas previas, gracias a su garantía de olvido cero (F_j <= 1e-6). Es adecuado para estudiar técnicas de regularización y comparar con otros métodos.
- Validación de arquitecturas bio-inspiradas: sirve como banco de pruebas para teorías sobre saturación de conocimiento, crecimiento celular y conectividad de plexos, con métricas concretas como S* = 0.85 y convergencia de pesos.
- Análisis de olvido catastrófico: al proporcionar una métrica probada de olvido cero, se puede utilizar para evaluar el impacto de diferentes hiperparámetros en la retención de conocimiento.
- Prototipado de modelos multimodales: aunque no está entrenado con visión ni audio, su vocabulario unificado de 200.000 tokens permite experimentar con tokenización multimodal en un entorno controlado y de bajo coste computacional.
- Educación e investigación académica: con 50M de parámetros y licencia de investigación gratuita, es apto para proyectos de fin de máster o tesis que requieran modificar la arquitectura y analizar su comportamiento.
- Estudio de sistemas tolerantes a fallos: el mecanismo FAIL_CLOSED ante invariantes puede analizarse para diseñar sistemas que no fallen silenciosamente, con garantías en tiempo de ejecución.
- Generación de código en Python a pequeña escala: aunque no hay benchmarks, puede usarse en entornos de investigación para experimentar con generación de código, siempre que no se requiera calidad de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). La model card indica explícitamente que no se han ejecutado. La única evaluación disponible son las cinco validaciones teóricas realizadas sobre la PoC:

| Experimento | Resultado | Aprobado |
|---|---|---|
| Convergencia de saturación | \|S - S*\| = 0.053 | Sí |
| Capacidad de división | 19 <= 20 | Sí |
| Delta de incorporación | min = +0.02 | Sí |
| Olvido cero | max F_j = 0.0 | Sí |
| Convergencia del plexo | True | Sí |

## Requisitos de hardware

- VRAM estimada para inferencia: para 50M de parámetros, en fp16 se requieren ~100 MB; en fp32, ~200 MB. Con cuantización a 8 bits, ~50 MB; a 4 bits, ~25 MB. No se especifican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM. El entrenamiento se realizó en una RTX 5090 (32 GB), pero la inferencia es viable en GPUs de gama baja (GTX 1650, RTX 3050, etc.) e incluso en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con más de 1 GB de VRAM.
- Opciones de despliegue: al ser una arquitectura from-scratch, no se indica soporte para vLLM, llama.cpp, Ollama o TGI. El despliegue se realizaría mediante PyTorch y el código del repositorio de GitHub.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparación directa de rendimiento no es posible porque Berna R5 no tiene benchmarks publicados. Se comparan únicamente especificaciones:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Berna R5 (PoC) | 50M | 8192 | Berna Research License 1.0 (solo investigación; comercial requiere licencia) | HuggingFace |
| GPT-2 small | 124M | 1024 | MIT | HuggingFace |
| DistilGPT-2 | 82M | 1024 | Apache 2.0 | HuggingFace |
| TinyLlama | 1.1B | 2048 | Apache 2.0 | HuggingFace |

Berna R5 ofrece una longitud de contexto mayor (8192) que los modelos comparables de tamaño similar, pero su licencia restringe el uso comercial y carece de benchmarks que permitan evaluar su calidad. GPT-2 small y DistilGPT-2 tienen licencias permisivas, mientras que TinyLlama, aunque más grande, también es de uso libre.

## Limitaciones y advertencias

- Escala solo PoC (50M); la versión de 1.5B es trabajo futuro.
- No se han ejecutado benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que no hay evidencia de calidad lingüística o de código.
- La federación multi-nodo no ha sido probada.
- El diseño de 100 cromosomas no ha sido optimizado empíricamente.
- No está destinado a despliegue en producción.
- No apto para decisiones de alto riesgo.
- No se debe comparar directamente con modelos de la clase GPT-4.
- Riesgo de alucinación no evaluado; el tamaño reducido y los ~800M tokens de entrenamiento sugieren una calidad limitada.
- Sesgos no evaluados; los datos de entrenamiento (WikiText-103, The Stack, OpenWebMath) pueden contener sesgos.
- La longitud de contexto es de 8192 tokens, pero el entrenamiento usó secuencias de 512, por lo que el rendimiento en contextos largos puede degradarse.
- Los tokens de visión y audio están definidos pero no entrenados; no se deben esperar capacidades multimodales reales.
- El mecanismo FAIL_CLOSED es una garantía en tiempo de ejecución, no una afirmación matemática; puede provocar terminaciones abruptas si se viola un invariante.
- Licencia: uso de investigación gratuito (académico, científico, personal); el uso comercial requiere una licencia separada de Berna Labs (contacto: info@bernalabs.com).
- Idioma: únicamente inglés.

## Enlaces

- HuggingFace: https://huggingface.co/BernaLabs/berna-r5-poc
- GitHub: https://github.com/berna-labs/berna-r5
- Paper: pendiente de publicación en arXiv (no disponible enlace)
- Esquema de registro: registry/schema.sql (en el repositorio de GitHub)
- Licencia: LICENSE (en el repositorio de GitHub)
- Contacto comercial: info@bernalabs.com
