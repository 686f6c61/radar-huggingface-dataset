# DavidAU/Mistral-Small-3.2-46B-The-Brilliant-Raconteur-II-Instruct-2506

## Resumen

Mistral-Small-3.2-46B-The-Brilliant-Raconteur-II-Instruct-2506 es un ajuste fino (finetune) del modelo Mistral-Small-3.2-24B-Instruct-2506 de Mistral AI, desarrollado por DavidAU. El autor ha expandido la arquitectura original de 24B a 46B parámetros mediante una técnica propia denominada "Brainstorm 40x", que extiende el modelo hasta 79 capas. El objetivo declarado es potenciar la creatividad, la prosa vívida y la generación de ficción, además de mantener capacidades generales de razonamiento, código y uso conversacional.

Se trata de un modelo instruct con ventana de contexto de 128k tokens (131.072), plantilla Jinja embebida o ChatML, y licencia Apache 2.0. Soporta 24 idiomas declarados, incluyendo castellano, y conserva la naturaleza multimodal del modelo base (image-text-to-text), aunque el autor indica que la técnica Brainstorm no se ha aplicado a los sistemas de generación de imagen.

El modelo está parcialmente descensurado ("abliterated") según su autor, y está orientado a escritura creativa sin restricciones temáticas (terror, gore, romance, rol), lo que lo hace relevante para quienes buscan un modelo de ficción sin filtros agresivos, pero con advertencias claras para uso en producción comercial o entornos sensibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral Small 3.2, expandida a 79 capas) |
| Parámetros totales | 45.685.826.560 (≈45,7B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (128k) |
| Tipos de cuantización | safetensors bfloat16 (fuente); GGUFs disponibles vía DavidAU y mradermacher (incluye imatrix i1); el autor indica que se pueden generar GPTQ, EXL2, AWQ, HQQ |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16); GGUF (Q2_K, Q3_K_S, Q4_K_S, etc.) |

## Arquitectura y entrenamiento

El modelo parte de Mistral-Small-3.2-24B-Instruct-2506 (arquitectura Mistral 3, transformer denso con capacidades multimodales image-text-to-text). El autor aplica su técnica "Brainstorm 40x", que según la model card extiende el modelo de 24B a 46B parámetros y de la profundidad original a 79 capas. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO en el proceso de ajuste.

El autor indica que el modelo está parcialmente descensurado/abliterated, que el razonamiento puede activarse o desactivarse mediante system prompt (desactivado por defecto) y que la generación varía notablemente entre pasadas, incluso con idénticos prompts y parámetros, como consecuencia del efecto Brainstorm. Se recomienda el uso de plantilla ChatML o Jinja, temperatura entre 0,1 y 1,2 (hasta 2,5 en modo creativo intenso) y rep pen ligero (1,01-1,06). No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y conversación multi-turno en 24 idiomas, incluido el castellano.
- Escritura creativa y de ficción: prosa vívida, generación de tramas, subtramas, continuación de escenas, diálogos y roles.
- Razonamiento con modo "thinking" activable mediante system prompt (desactivado por defecto).
- Generación de código, incluso en cuantizaciones bajas según el autor.
- Capacidades multimodales heredadas del modelo base (image-text-to-text); el autor señala que la generación de imagen debería ser posible, aunque Brainstorm no se aplicó a esos subsistemas.
- Uso general declarado para "todos los casos de uso".
- Soporte de plantillas Jinja (embebida) y ChatML.
- No se documenta explícitamente soporte de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Escritura de ficción y narrativa larga: el modelo puede generar relatos, novelas por capítulos y tramas complejas aprovechando su contexto de 128k tokens para mantener coherencia en arcos narrativos extensos.
- Roleplay y juegos de rol de mesa: su entrenamiento orientado a personajes, diálogo y descensurado parcial lo hace adecuado para interpretar personajes con matices y sin filtros excesivos.
- Continuación de escenas y guiones: útil en pipelines de escritura asistida donde se necesita continuar un texto manteniendo tono y estilo, con variaciones creativas entre generaciones.
- Generación de tramas y subtramas para videojuegos o series: el efecto Brainstorm produce múltiples alternativas por prompt, lo que facilita la ideación y el brainstorming estructurado.
- Asistencia a guionistas y autores: con temperatura baja (0,1-0,7) puede emplearse para tareas de reescritura, corrección de estilo y generación de variantes de un mismo pasaje.
- Generación de código en entornos de desarrollo: el autor indica que funciona para programación incluso en cuantizaciones bajas, lo que permite integrarlo en asistentes locales de código.
- Procesamiento de documentos largos en varios idiomas: su contexto de 128k y soporte multilingüe permiten resumir, traducir o analizar textos extensos en castellano, inglés, francés, alemán, etc.
- Experimentación en investigación sobre alineación y descensurado: al ser un modelo parcialmente abliterated, sirve para estudiar comportamientos de modelos sin filtros en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 91,4 GB solo para pesos, por lo que requiere múltiples GPU (por ejemplo, 2× A100 80GB o 4× RTX 4090 24GB con sharding).
- Cuantización Q8: ~46 GB, viable en una A100 80GB o en 2× RTX 4090.
- Cuantización Q4_K_S: ~26-28 GB, cabe en una RTX 4090 24GB con offloading parcial o en 2× RTX 3090/4090.
- Cuantización Q3_K_M: ~20-22 GB, viable en una RTX 4090 24GB; el autor recomienda Q3KM o superior.
- Cuantización Q2_K: ~16-18 GB, cabe en GPUs consumer de 24GB, aunque el autor advierte de posibles problemas de "low bit" que requieren rep pen más alto.
- GPU recomendadas: A100 80GB, H100 80GB para precisión completa; RTX 4090, RTX 3090, RTX A6000 para cuantizaciones Q3-Q4.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con soporte Mistral 3), TGI; GGUFs publicados por DavidAU y mradermacher (incluye imatrix i1).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-Small-3.2-46B-The-Brilliant-Raconteur-II-Instruct-2506 | 45,7B | 128k | Apache 2.0 | Ficción creativa, rol, descensurado parcial | HF (safetensors + GGUF) |
| Mistral-Small-3.2-24B-Instruct-2506 (base) | 24B | 128k | Apache 2.0 | Instrucciones generales, multimodal | HF oficial |
| Mistral-Small-3.2-46B-The-Brilliant-Raconteur-Instruct-2506 (v1) | ~46B | 128k | Apache 2.0 | Ficción creativa (versión previa) | HF (DavidAU) |
| Mistral-Nemo-12B-Instruct (referencia de tamaño menor) | 12B | 128k | Apache 2.0 | Instrucciones generales | HF oficial |

No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo parcialmente descensurado ("abliterated"): puede generar contenido violento, gore, lenguaje soez y material NSFW; el autor lo etiqueta como "not-for-all-audiences".
- Riesgo elevado de alucinación en tareas factuales, especialmente por el efecto Brainstorm que introduce variabilidad entre generaciones.
- Alta varianza entre generaciones con el mismo prompt: dificulta la reproducibilidad y la evaluación determinista.
- El autor advierte que el modelo puede seguir instrucciones de estilo demasiado literalmente (por ejemplo, "usa frases cortas" en todas las frases), requiriendo prompts matizados.
- Sensibilidad al rep pen: valores inadecuados afectan a la longitud y calidad del razonamiento.
- Aunque la licencia es Apache 2.0, el contenido generado puede no ser apto para productos comerciales dirigidos a todos los públicos sin moderación adicional.
- No se documentan evaluaciones de sesgo, seguridad o robustez; se desconoce el comportamiento en dominios sensibles.
- El soporte multimodal de imagen puede no haberse beneficiado de la técnica Brainstorm, según el propio autor.
- No hay evidencia publicada de soporte de tool calling o agentes, a pesar de las etiquetas generales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Mistral-Small-3.2-46B-The-Brilliant-Raconteur-II-Instruct-2506
- Versión I del modelo: https://huggingface.co/DavidAU/Mistral-Small-3.2-46B-The-Brilliant-Raconteur-Instruct-2506
- GGUF (DavidAU): https://huggingface.co/DavidAU/Mistral-Small-3.2-46B-The-Brilliant-Raconteur-II-Instruct-2506-GGUF
- GGUF (mradermacher): https://huggingface.co/mradermacher/Mistral-Small-3.2-46B-The-Brilliant-Raconteur-II-Instruct-2506-GGUF
- Imatrix GGUF (mradermacher): https://huggingface.co/mradermacher/Mistral-Small-3.2-46B-The-Brilliant-Raconteur-II-Instruct-2506-i1-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs del autor: https://huggingface.co/DavidAU/support
