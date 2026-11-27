# Jahirrrr/Klyra-350M-Copilot-V6

## Resumen

Klyra-350M-Copilot-V6 es un modelo de lenguaje de 354.483.968 parámetros (aproximadamente 354 M) especializado en generación de código Python y completion con soporte de *fill-in-the-middle* (FIM). Lo desarrolla el usuario Jahirrrr y se publica en Hugging Face como un *finetune* de Klyra-350M-Copilot-V4, del mismo autor. La model card es mínima: se limita a declarar que el modelo es "Experimental" y a etiquetarlo con los tags `code`, `python`, `completion` y `fim`.

El modelo emplea la arquitectura `lfm2` (familia LFM2 de Liquid AI, según el tag de arquitectura declarado en el repositorio) y se distribuye en formato safetensors bajo licencia `other`, con un tamaño de repositorio de 0,7 GB. Su relevancia práctica es acotada: se trata de un modelo de muy pequeño tamaño orientado a autocompletado de código en local, no a razonamiento general ni a conversación.

No hay información publicada sobre datos de entrenamiento, composición del dataset, idiomas soportados, benchmarks ni detalles de la arquitectura más allá del tag `lfm2`. Cualquier dato no presente en la información disponible se marca explícitamente como "no disponible" en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `lfm2` (tag de arquitectura en Hugging Face); detalles internos no disponibles |
| Parámetros totales | 354.483.968 (dato real de safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (tags orientados a código Python) |
| Licencia | `other` (términos no especificados en la model card) |
| Formato de pesos | safetensors |
| Librería | transformers |
| Pipeline | text-generation |
| Modelo base | Jahirrrr/Klyra-350M-Copilot-V4 |
| Tamaño del repositorio | 0,7 GB |
| Fecha de creación | 2026-11-27 |
| Última actualización | 2026-11-27 |

## Arquitectura y entrenamiento

La única información disponible sobre la arquitectura es el tag `lfm2` incluido en el repositorio de Hugging Face, que apunta a la familia de modelos LFM2 de Liquid AI. No se publican en la model card detalles sobre el número de capas, dimensiones ocultas, tipo de atención, tokenizador ni estrategia de decodificación. Tampoco se especifica si el modelo incorpora atención lineal, mezcla de expertos u otras variantes.

Respecto al entrenamiento, la model card no documenta el número de tokens, la composición del dataset, el uso de RLHF/DPO ni la metodología de *finetune* aplicada sobre Klyra-350M-Copilot-V4. Los tags `code`, `python`, `completion` y `fim` sugieren un ajuste orientado a autocompletado de código Python con soporte de relleno en huecos, pero no hay evidencia publicada sobre la proporción de datos de código, el formato de las secuencias FIM ni las técnicas de regularización empleadas.

## Capacidades

- Generación de texto orientada a código, según el pipeline `text-generation` y los tags `code` y `python`.
- Autocompletado de código con soporte de *fill-in-the-middle* (FIM), indicado por el tag `fim`.
- Completion de fragmentos de código Python en editores y pipelines, según los tags `completion` y `python`.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

- Autocompletado en editores de código: el modelo, por su tamaño de 354 M y su tag `fim`, puede integrarse en extensiones de editor para sugerir continuaciones y rellenar huecos en archivos Python con latencia baja en CPU o GPU de gama baja.
- Generación de *snippets* en pipelines de CI: puede emplearse para completar plantillas de código repetitivo (por ejemplo, *boilerplate* de tests o *stubs* de funciones) en flujos automatizados, siempre con revisión humana.
- Asistencia en documentación técnica: dado su enfoque a Python, puede generar ejemplos de código embebidos en documentación o *docstrings* a partir de firmas de funciones, con verificación posterior.
- Prototipado rápido en entornos con recursos limitados: al ocupar 0,7 GB en safetensors, es desplegable en portátiles y entornos de desarrollo sin GPU dedicada, lo que facilita experimentación local.
- Educación y formación en Python: puede servir como modelo de demostración para prácticas de autocompletado en cursos, con la advertencia de que su calidad no está validada por benchmarks públicos.
- Filtrado y generación de *prompts* de código en herramientas internas: puede usarse como modelo auxiliar para enriquecer *prompts* o generar variantes de fragmentos de código antes de pasarlos a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,7 GB solo para pesos (354 M × 2 bytes), más overhead de activaciones y caché KV, típicamente por debajo de 2 GB en la práctica.
- VRAM estimada en cuantización de 8 bits: en torno a 0,35 GB para pesos; en 4 bits, en torno a 0,18 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también es viable en CPU.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; también en iGPU y CPU.
- Opciones de despliegue: `transformers` (librería declarada); `vLLM`, `llama.cpp`, `Ollama` y `TGI` no están confirmados por el autor, y no se publican variantes GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Klyra-350M-Copilot-V6 | 354 M | no disponible | Código Python, FIM | `other` | Hugging Face |
| Klyra-350M-Copilot-V4 | no disponible | no disponible | Código Python, FIM | `other` | Hugging Face (modelo base) |
| Alternativas de ~350 M para código | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La model card califica el modelo como "Experimental", sin garantías de calidad ni de estabilidad en producción.
- No hay benchmarks publicados: se desconoce su rendimiento en HumanEval, MBPP u otras métricas de código.
- No se documentan sesgos conocidos, pero un modelo de 354 M entrenado sobre datos no especificados puede reproducir sesgos presentes en su corpus.
- Riesgo de alucinación y de generar código sintácticamente válido pero semánticamente incorrecto; requiere revisión humana.
- No se especifican los idiomas soportados; los tags apuntan a Python, pero no se confirma cobertura multilingüe.
- La licencia es `other` y no se detallan sus términos: es imprescindible revisar las condiciones antes de cualquier uso comercial.
- No se publican variantes cuantizadas ni formatos GGUF, lo que limita el despliegue en herramientas como llama.cpp u Ollama sin conversión previa.
- El modelo tiene 0 descargas y 0 *likes* en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Jahirrrr/Klyra-350M-Copilot-V6
- Modelo base: https://huggingface.co/Jahirrrr/Klyra-350M-Copilot-V4
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
