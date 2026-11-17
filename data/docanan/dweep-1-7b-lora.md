# docanan/dweep-1.7b-lora

## Resumen

Dweep 1.7B es un ajuste fino mediante LoRA del modelo Qwen3-1.7B, desarrollado por el usuario docanan y orientado a preguntas y respuestas sobre las islas Andamán y Nicobar. El modelo parte de la base Apache-2.0 de Qwen y hereda sus capacidades generales de generación de texto, pero se especializa en un dominio geográfico y administrativo muy concreto: distritos, transporte, historia, ecología, administración y turismo del archipiélago. El entrenamiento se realizó íntegramente en un MacBook Air M5 con 16 GB de memoria unificada, lo que lo convierte en un ejemplo de ajuste fino de bajo coste sobre hardware de consumo.

El modelo se distribuye como adaptadores LoRA (formato PEFT) sobre el modelo base cuantizado en 4 bits con MLX, y se acompaña de un corpus propio (`docanan/andaman-nicobar-corpus`) con 1144 artículos indexables. La evaluación publicada es inusualmente transparente: compara base y ajustado sobre 112 preguntas retenidas del dominio, mide el efecto de la recuperación BM25 frente a embeddings, y reporta tanto mejoras como regresiones. No es un asistente general ni un sustituto de Qwen3-1.7B; es un modelo de nicho con un alcance deliberadamente limitado.

Su relevancia actual reside en dos aspectos: demuestra que es viable adaptar un modelo de 1.7B a un dominio muy específico y de bajos recursos con un solo portátil, y documenta con rigor metodológico el impacto de las decisiones de recuperación (unidad de indexación, tamaño de ventana, número de pasajes) sobre la calidad final. Es más un caso de estudio reproducible que un modelo listo para producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) con adaptadores LoRA |
| Parámetros totales | 1.7B (modelo base); adaptadores LoRA: no disponible (rango 8, 16 capas, 7 módulos de proyección) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (el entrenamiento usó secuencias de 2048 tokens) |
| Tipos de cuantización | Base en 4-bit MLX para entrenamiento; adaptadores en safetensors (FP); cuantización de inferencia no especificada |
| Idiomas soportados | en, hi, ta, bn, te, ml |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un ajuste LoRA sobre Qwen3-1.7B, un transformer decoder-only. Los adaptadores tienen rango 8, escala 20 (alpha PEFT 160), se aplican a las últimas 16 capas y a 7 módulos de proyección. El entrenamiento se realizó sobre el modelo base cuantizado en 4 bits con MLX, en un MacBook Air M5 (Mac17,3) con 16 GB de memoria unificada y macOS 27.2.1, con una longitud de secuencia de 2048 y batch de 4. Se ejecutaron 1600 iteraciones, con 598,7 k tokens vistos en total, y la pérdida de validación bajó de 4,191 en la iteración 1 a 1,105 en la 1600. El throughput mediano reportado fue de 488,5 tokens/s (rango 416-661).

Los datos de entrenamiento consisten en 3163 pares de instrucción validados más 239 pares de rechazo (3275 filas en total), derivados del corpus `docanan/andaman-nicobar-corpus`. Se publican cuatro checkpoints (`0000400`, `0000800`, `0001200`, `0001600`). No se menciona uso de RLHF ni DPO; el ajuste es supervisado. La innovación destacable no es arquitectónica sino metodológica: la model card documenta un A/B testing sistemático de estrategias de recuperación (BM25 frente a embeddings multilingües, unidades de párrafo frente a ventanas de frases, 3 frente a 5 pasajes) y de entrenamiento de rechazo, con métricas de recall y F1 para cada configuración.

## Capacidades

- Generación de texto y respuesta a preguntas sobre el dominio de Andamán y Nicobar: geografía, distritos, transporte, historia, ecología, administración y turismo.
- Ajuste específico para rechazar preguntas no respondibles cuando se entrena con pares de rechazo (25 de 32 preguntas sin respuesta rechazadas en la evaluación).
- Capacidades generales heredadas de Qwen3-1.7B (razonamiento básico, código, matemáticas elementales), aunque degradadas o no evaluadas en detalle.
- Soporte multilingüe limitado a los idiomas declarados: inglés, hindi, tamil, bengalí, telugu y malayo.
- Integración con recuperación externa (BM25 sobre 1144 artículos) para mejorar la precisión en el dominio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Asistente turístico del archipiélago: el modelo responde preguntas sobre islas, playas, transporte entre islas y trámites de acceso, apoyado en recuperación BM25 sobre el corpus para citar información concreta. Es adecuado por su especialización y por el bajo coste de despliegue en hardware modesto.
- Consultas administrativas locales: atención sobre distritos, permisos y estructura administrativa de Andamán y Nicobar, con recuperación de pasajes para reducir alucinaciones en datos factuales.
- Educación y divulgación ecológica: explicaciones sobre fauna, flora y ecosistemas insulares, usando el corpus como fuente de referencia y el adaptador con rechazo para admitir cuándo no hay información.
- Punto de información en kiosco o dispositivo de borde: al ser un modelo de 1.7B con adaptadores LoRA, puede ejecutarse en portátiles o mini-PC con GPU de consumo, sirviendo consultas offline en entornos con conectividad limitada.
- Investigación sobre ajuste fino de bajo coste: sirve como caso reproducible para estudiar el impacto de la unidad de indexación y del entrenamiento de rechazo en sistemas RAG de dominio, dado que la model card publica todos los A/B y métricas.
- Base para futuros ajustes regionales: los adaptadores y el pipeline de entrenamiento en MLX pueden reutilizarse como plantilla para otros dominios geográficos o culturales de bajos recursos, partiendo de Qwen3-1.7B.
- Filtro de preguntas fuera de dominio en un chatbot: el adaptador con pares de rechazo puede usarse como primera capa para derivar consultas no cubiertas por el corpus a un humano o a un modelo general.

## Benchmarks y rendimiento

Los benchmarks publicados son propios del autor, sobre 112 preguntas retenidas del dominio y un conjunto de sanidad general de 10 ítems, con decodificación greedy, presupuesto de 120 tokens y `enable_thinking=False`.

| Conjunto | F1 base | F1 ajustado | Delta |
|---|---|---|---|
| QA de dominio A&N (112) | 0,280 | 0,479 | +0,199 |
| Sanidad general (10) | 0,106 | 0,308 | +0,203 |

Recuperación con BM25 sobre 1144 artículos, mismo modelo ajustado:

| Configuración | F1 dominio (112) | Rechazos |
|---|---|---|
| Ajustado, sin contexto | 0,479 | 0 |
| Ajustado, 3 pasajes recuperados | 0,646 | 0 |
| Ajustado, recuperación v2 (filtro de idioma, boost de título y entidad) | 0,636 | 0 |

Comparativa de recuperación:

| Recuperador | Recall@3 (112) | F1 con contexto (112) |
|---|---|---|
| BM25 | 62 % | 0,646 |
| Embeddings multilingual-e5-small | 63,4 % | 0,616 |

Índice por ventanas de frases (dos frases por unidad, una de solapamiento, 43 279 unidades):

| Índice | Recall@3 (112) | F1 con contexto (112) |
|---|---|---|
| Unidades de párrafo, 3 pasajes | 62 % | 0,646 |
| Ventanas de frases, 3 pasajes | 75,9 % | 0,716 |
| Ventanas de frases, 5 pasajes | 77,7 % | 0,677 |
| Ventanas de frases, 3 pasajes, adaptador con rechazo | no medido | 0,648 (9 falsos rechazos) |

Entrenamiento de rechazo:

| Configuración | F1 dominio (112) | Falsos rechazos (respondibles) | Rechazos (32 no respondibles) |
|---|---|---|---|
| Adaptador sin pares de rechazo | 0,479 | 0/112 | 0/32 |
| Adaptador con pares de rechazo | 0,477 | 6/112 | 25/32 |
| Adaptador con pares de rechazo y recuperación | 0,558 | 6/112 | no medido |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Entrenamiento: MacBook Air M5 (Mac17,3), 16 GB de memoria unificada, macOS 27.2.1, con MLX y cuantización 4-bit del base.
- Inferencia: el modelo base es de 1.7B; con cuantización 4-bit ocupa aproximadamente 1 GB de pesos, y en FP16 unos 3,4 GB. Los adaptadores LoRA añaden una cantidad mínima (rango 8 sobre 16 capas).
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM es suficiente para FP16; una RTX 3060, RTX 4060, RTX 4090 o superior funcionan sin problema. En Apple Silicon, un Mac con 8-16 GB de memoria unificada es suficiente.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas.
- Opciones de despliegue: los adaptadores son PEFT, por lo que se cargan con la librería `peft` sobre el base; para servir en producción pueden fusionarse con el base y exportarse a vLLM, TGI o llama.cpp/Ollama (previa conversión a GGUF). El pipeline de recuperación BM25 requiere un motor de búsqueda aparte.
- Latencia y throughput: no se publican cifras de inferencia. El throughput de entrenamiento reportado es de 488,5 tokens/s (mediana, rango 416-661) en el MacBook Air M5, no representativo de inferencia en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dweep 1.7B (este) | 1.7B + LoRA | no disponible | Dominio Andamán y Nicobar, 6 idiomas | Apache-2.0 | Hugging Face (adaptadores PEFT) |
| Qwen/Qwen3-1.7B | 1.7B | no disponible en esta ficha | Generalista multilingüe | Apache-2.0 | Hugging Face |
| Modelos Indic de 1-2B (p. ej. variantes de Gemma o Qwen ajustadas a hindi/tamil) | ~1-2B | variable | Multilingüe índico general | variable | Hugging Face |

La comparación directa con alternativas de la misma categoría (modelos de 1-2B especializados en una región o idioma) no está disponible con datos de benchmarks en la información proporcionada. Frente a su base Qwen3-1.7B, la comparación publicada es la de la tabla de benchmarks: +0,199 de F1 en dominio y +0,203 en el conjunto de sanidad general, a costa de especialización y de un alcance muy restringido.

## Limitaciones y advertencias

- Modelo de nicho: no es un asistente general ni sustituye a Qwen3-1.7B; su utilidad fuera del dominio de Andamán y Nicobar es limitada y no está evaluada.
- Alucinación: sin recuperación, el F1 en dominio es de 0,479, lo que indica una precisión moderada; se recomienda usar siempre con recuperación BM25 y ventanas de frases (F1 0,716).
- Techo del corpus: 27 de las 112 preguntas de evaluación quedan fuera del alcance del corpus actual, incluso con la mejor configuración de recuperación.
- Rechazo imperfecto: el adaptador con pares de rechazo rechaza 25 de 32 preguntas no respondibles, pero introduce 6 falsos rechazos sobre 112 respondibles; el prompt por sí solo no induce rechazo (0 rechazos sin entrenamiento específico).
- Idiomas: solo se declaran en, hi, ta, bn, te, ml; no hay evaluación de calidad por idioma ni de mezcla de idiomas.
- Contexto: la model card no especifica la longitud de contexto efectiva; el entrenamiento usó 2048 tokens, por lo que contextos más largos no están validados.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3-1.7B también es Apache-2.0; conviene verificar los términos del corpus `andaman-nicobar-corpus` para uso comercial de los datos.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación externa.
- Sesgos: no se documentan análisis de sesgo; el corpus está centrado en fuentes sobre el archipiélago y puede reflejar sesgos de esas fuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/docanan/dweep-1.7b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Corpus de entrenamiento: https://huggingface.co/datasets/docanan/andaman-nicobar-corpus
- Repositorio del autor (referencia en la model card): cuenta `andamanopal` en Hugging Face, con políticas de RL y robótica (LeRobot ACT, 2026-06-28)
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
