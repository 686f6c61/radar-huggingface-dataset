# sionic-ai/sionic-K-SAT-MATH-3B

## Resumen

sionic-K-SAT-MATH-3B es un modelo de razonamiento matemático de 3B parámetros derivado de Nanbeige/Nanbeige4.2-3B, desarrollado por sionic-ai. El modelo ha sido sometido a dos fases de aprendizaje por refuerzo con GRPO sobre un corpus de problemas de matemáticas del examen de acceso a la universidad surcoreano (CSAT, 수능) y de exámenes simulados, con el objetivo de mejorar la precisión y la eficiencia del razonamiento paso a paso en ese dominio concreto.

El modelo cuenta con 4.169.800.704 parámetros reales en safetensors y se distribuye bajo licencia Apache 2.0, con pesos en safetensors y una cuantización GGUF Q8_0 de 4,13 GiB orientada a despliegue en móvil y llama.cpp. Soporta coreano e inglés y está etiquetado como modelo de investigación, no como producto listo para producción general.

Su relevancia radica en el enfoque de entrenamiento: dos etapas de RL con filtrado dinámico de dificultad, DAPO dynamic sampling y una política explícita de penalización de soluciones excesivamente largas, que reduce la longitud media de las respuestas manteniendo la precisión. Los resultados publicados por el autor sobre el CSAT 2027 muestran una mejora de 1,5 a 2,6 puntos de media por asignatura optativa respecto al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Nanbeige, código `modeling_nanbeige.py`) |
| Parámetros totales | 4.169.800.704 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens recomendados en inferencia; entrenamiento con respuestas de hasta 32.768 tokens |
| Tipos de cuantización | GGUF Q8_0 (4,13 GiB); safetensors en BF16 |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Nanbeige4.2-3B, un transformer decoder-only de aproximadamente 4,17B parámetros. La innovación principal no está en la arquitectura sino en el pipeline de RL: dos etapas consecutivas de GRPO sobre problemas de matemáticas del CSAT. La primera etapa (40 pasos, 8×B300, ~8,7 horas) usó 683 problemas: 181 de exámenes oficiales 2022-2026, 146 problemas de 4 puntos de 2017-2021 y 356 variantes sintéticas validadas por consenso (se aceptaban solo las que el modelo resolvía de forma consistente en al menos 3 de 4 intentos independientes). La segunda etapa (10 pasos, ~6 horas) empleó 1.145 filas (1.078 problemas únicos) reseleccionados según la tasa de acierto del modelo tras la primera etapa, con doble peso para los 67 problemas con tasa de acierto ≤ 25%.

Detalles técnicos destacables: GRPO sin KL, clip 0.2/0.28 en la primera etapa y 0.2 en la segunda, token-mean loss, corrección TIS con cap 2.0, learning rate 1e-6, 8 rollouts por problema y 4 actualizaciones por paso. En la segunda etapa se introdujo DAPO dynamic sampling para descartar grupos con recompensa homogénea (todos correctos o todos incorrectos). La decisión de limitar las respuestas a 32k tokens (frente a 48k) se basó en el análisis de 700 soluciones truncadas: el 98,6% eran soluciones ineficientemente largas y no bucles degenerados, y penalizarlas con cero actuó como señal para producir rutas más cortas. El conjunto de test (CSAT 2026) y el de validación (simulacro de septiembre de 2026) se excluyeron de todas las etapas, incluidas sus variantes sintéticas.

## Capacidades

- Razonamiento matemático paso a paso en problemas tipo CSAT (estilo coreano de examen de acceso universitario), incluyendo respuesta en formato `\boxed{}`.
- Modo thinking activable, con cadenas de razonamiento largas (hasta 32k tokens).
- Generación de texto conversacional en coreano e inglés.
- Soporte de tool calling y function calling a través del pipeline estándar de transformers y SGLang (heredado del modelo base; no se documenta entrenamiento específico de tool use en esta ficha).
- Compatible con endpoints (tag `endpoints_compatible`) y con `trust_remote_code`.
- Despliegue en llama.cpp y entornos móviles mediante GGUF Q8_0, con parche de tokenizador incluido en el repositorio.

## Casos de uso

- Evaluación automática de soluciones matemáticas tipo CSAT: el modelo genera la solución completa con respuesta final en `\boxed{}`, lo que permite comparación automática contra la clave oficial en pipelines de corrección.
- Tutoría de matemáticas para estudiantes surcoreanos: conversación multi-turno en coreano con razonamiento explícito y contexto de 32k tokens para problemas largos con enunciados extensos.
- Generación de problemas sintéticos de práctica: a partir de un problema semilla, el modelo puede producir variantes (el autor usó este enfoque en el entrenamiento), útil para bancos de ejercicios.
- Despliegue en dispositivo móvil: la cuantización Q8_0 (4,13 GiB) y el soporte de llama.cpp con KV cache q8_0 permiten ejecución local en hardware Qualcomm GenieX, útil para apps educativas offline.
- Investigación en RL para razonamiento: el repositorio incluye `modeling_nanbeige_train.py` con FA4 varlen y entrenamiento empaquetado, reutilizable para experimentos de GRPO/DAPO sobre otros dominios.
- Reproducción de evaluaciones de referencia: el autor documenta prompts, parámetros de muestreo (temperature 0.6, top_p 0.95, top_k 20) y protocolo de 16 muestras por problema, lo que facilita la verificación independiente.
- Filtrado de currículo educativo: el modelo puede clasificar la dificultad de problemas nuevos midiendo su tasa de acierto, técnica que el propio autor empleó para seleccionar datos de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el CSAT 2027 (46 problemas únicos: 22 comunes + 8 por asignatura optativa, 16 muestras por problema, BF16 en servidor, temperature 0.6, top_p 0.95, top_k 20, thinking on, max_tokens 65.536):

| Modelo | Probabilidad y estadística (media / voto mayoritario) | Cálculo (media / voto mayoritario) | Geometría (media / voto mayoritario) |
|---|---|---|---|
| Nanbeige4.2-3B (base) | 94,0 / 96 | 93,5 / 96 | 92,6 / 96 |
| sionic-K-SAT-MATH-3B | 95,5 / 96 | 95,2 / 96 | 95,2 / 96 |

Tasa de acierto global por problema: 93,8% en el modelo base frente a 97,0% en el modelo ajustado. El problema común 21 (4 puntos) falla en las 16 muestras en todos los modelos evaluados. No se han publicado resultados en benchmarks estándar (MMLU, GSM8K, HumanEval, MATH) en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 8,3 GB solo para pesos (4,17B × 2 bytes), más overhead de KV cache y activaciones; con contexto de 32k se recomienda al menos 24 GB en GPU.
- VRAM estimada en GGUF Q8_0: 4,13 GiB de pesos; viable en GPUs de 8 GB con contexto moderado y KV cache q8_0.
- GPUs recomendadas: el autor entrenó en 8×B300 (Blackwell) y recomienda SGLang con `--attention-backend trtllm_mha` para B300/Blackwell. Para inferencia en BF16, A100 40GB, H100 o RTX 4090 24GB son suficientes con contexto de 32k.
- Consumer GPU: sí, cabe en RTX 4090 (BF16 con contexto reducido) y en GPUs de 8-12 GB usando Q8_0.
- Opciones de despliegue: SGLang (recomendado por el autor, con `--reasoning-parser nanbeige`), transformers 4.x, llama.cpp / llama-server, y entornos móviles Qualcomm GenieX con el parche de tokenizador incluido.
- Latencia y throughput: no disponible de forma oficial; el autor menciona que el entrenamiento con respuestas de 48k consumía 55 minutos por paso en 8×B300, dato no trasladable directamente a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Idiomas |
|---|---|---|---|---|---|
| sionic-K-SAT-MATH-3B | 4,17B | 32k | Matemáticas CSAT (coreano) | Apache 2.0 | ko, en |
| Nanbeige4.2-3B (base) | ~4,2B | no disponible | Propósito general | no disponible | ko, en |
| Qwen2.5-Math-7B | 7B | 4k-32k según variante | Matemáticas generales | Apache 2.0 | en, zh |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 32k-64k | Razonamiento matemático | MIT | en, zh |

La comparación con modelos matemáticos de propósito general no es directa: sionic-K-SAT-MATH-3B está entrenado exclusivamente sobre el formato y el temario del CSAT coreano, por lo que su ventaja se limita a ese dominio y no se ha evaluado en benchmarks internacionales. No se dispone de datos comparativos de rendimiento frente a las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor lo declara explícitamente como repositorio de investigación, no como producto listo para producción.
- Dominio restringido: solo matemáticas del CSAT coreano; no se entrenó para lengua, inglés ni estudios sociales del mismo examen.
- Problemas con figuras: se entrenó y evaluó con descripciones textuales de las figuras, no con la imagen real, por lo que el rendimiento con entrada visual puede diferir.
- Evaluación de una sola convocatoria: los resultados corresponden al CSAT 2027, un único examen; la generalización a otras convocatorias no está verificada.
- Fallo conocido: el problema común 21 se falla en el 100% de las muestras, lo que indica un punto ciego concreto en el razonamiento.
- Riesgo de alucinación en pasos intermedios: al ser un modelo pequeño con cadenas de razonamiento largas, puede producir justificaciones plausibles pero incorrectas, especialmente fuera del dominio CSAT.
- Compatibilidad con transformers: el código original provoca NaN en transformers 5.x por la inicialización del buffer `inv_freq` de RoPE; es necesario usar 4.x o recalcularlo tras la carga.
- Bug de tokenizador en llama.cpp: requiere aplicar el parche `mobile/patches/llama-vocab-spm-prepend-first.patch` para que la tokenización coincida con la del entrenamiento.
- Idiomas: solo coreano e inglés; no hay soporte documentado de español.
- Licencia Apache 2.0 permite uso comercial, pero el propio autor desaconseja implícitamente el uso en producción al etiquetarlo como investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sionic-ai/sionic-K-SAT-MATH-3B
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Repositorio del autor: https://huggingface.co/sionic-ai
- Paper o blog técnico: no disponible
- Demo: no disponible
