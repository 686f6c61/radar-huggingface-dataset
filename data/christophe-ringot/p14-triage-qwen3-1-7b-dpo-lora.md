# christophe-ringot/p14-triage-qwen3-1.7b-dpo-lora

## Resumen

El modelo `p14-triage-qwen3-1.7b-dpo-lora` es un adaptador LoRA publicado por Christophe Ringot sobre el modelo base `Qwen/Qwen3-1.7B-Base`. Se trata de un experimento de alineamiento mediante DPO (Direct Preference Optimization) aplicado sobre un adaptador previo entrenado con SFT para una tarea muy concreta: el triaje de urgencias hospitalarias. El modelo recibe un caso clínico y una pregunta, emite un nivel de prioridad (`urgence_maximale` P1, `urgence_moderee` P2 o `differee` P3) y a continuación una respuesta breve en texto libre.

El proyecto forma parte del trabajo final de un curso de ingeniería en IA y simula un asistente de triaje para un hospital ficticio (CHSA). El adaptador se construye sobre Qwen3-1.7B-Base, un transformer decoder-only de 1.700 millones de parámetros con licencia Apache 2.0, y está pensado exclusivamente para francés e inglés. El autor lo publica como evidencia reproducible de la comparación SFT frente a DPO, no como modelo entregado.

La relevancia de esta ficha es doble: por un lado, documenta un caso real de cómo el DPO puede mejorar la métrica de recompensa sin transferir esa mejora a la calidad de las respuestas; por otro, sirve como advertencia sobre los riesgos de usar modelos pequeños con etiquetas generadas por LLM en dominios clínicos sensibles. No es un modelo para uso clínico real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA PEFT |
| Parámetros totales | 1.700 millones (modelo base Qwen3-1.7B-Base); adaptador LoRA de rango 16 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el entrenamiento DPO usa `max_length` de 768 tokens |
| Tipos de cuantización | no disponible (el adaptador se publica en safetensors; el base admite cuantizaciones estándar de la familia Qwen3, pero no se detallan) |
| Idiomas soportados | francés (fr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base en safetensors o cuantizado |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (rango 16, alpha 32, dropout 0.05) aplicado sobre las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj` de Qwen3-1.7B-Base. El adaptador de partida es el modelo SFT `christophe-ringot/p14-triage-qwen3-1.7b-lora`, cuyo mejor checkpoint se situó en el paso 1.300. El DPO continúa ese adaptador y utiliza como modelo de referencia una copia congelada del propio adaptador SFT (no el base), con el objetivo de preservar las ganancias de triaje ya adquiridas.

El entrenamiento DPO se realizó con TRL, beta 0.1, learning rate 2e-5, una época, batch efectivo de 8, longitud máxima de 768 tokens, bf16 y semilla 42, sobre una RTX 2060 de 6 GB. Se usaron 785 pares de entrenamiento y 95 de validación. La respuesta `chosen` es la respuesta de referencia del dataset y la `rejected` es una generación on-policy del modelo SFT con el mismo nivel de prioridad forzado, de modo que cada par enseña contenido y no triaje. Se descartaron generaciones vacías y pares con ROUGE-L ≥ 0.6 respecto a la referencia. Una primera variante de DPO que incluía pares de seguridad de triaje colapsó a P1 (precisión del 47 %) y fue descartada. El mejor checkpoint en validación fue el paso 90.

## Capacidades

- Generación de texto en francés e inglés, orientada a respuestas breves sobre casos clínicos.
- Clasificación de triaje en tres niveles de prioridad (P1, P2, P3) mediante puntuación de log-probabilidades y regla de decisión por coste esperado.
- Razonamiento clínico básico sobre casos y preguntas de examen (FrenchMedMCQA).
- No soporta tool calling ni function calling según la información disponible.
- No se documentan capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada a francés e inglés.

## Casos de uso

- Investigación sobre alineamiento con DPO: el adaptador permite reproducir la comparación SFT frente a DPO con los mismos datos y protocolo, útil para estudiar la disociación entre la métrica de recompensa y la calidad final de las respuestas.
- Docencia en ingeniería de IA: sirve como ejemplo completo de pipeline SFT + DPO con LoRA sobre un modelo pequeño, incluyendo la regla de decisión por coste y la evaluación con conjuntos de validación separados.
- Prototipado de asistentes de triaje en entornos simulados: permite construir demos de clasificación de prioridad sobre casos ficticios, siempre con validación humana obligatoria.
- Evaluación de metodologías de etiquetado: al usar etiquetas generadas por LLM, el modelo es útil para estudiar el impacto de etiquetas no validadas por especialistas en tareas clínicas.
- Estudio de calibración y reglas de decisión: el uso de una matriz de costes con alpha 0.35 sobre el infra-triaje permite analizar el compromiso entre sensibilidad y sobre-triaje en clasificación de tres clases.
- Benchmarking de modelos pequeños en dominio médico: la evaluación con FrenchMedMCQA y ROUGE-L sobre 80 preguntas fijas facilita comparaciones reproducibles con otros adaptadores del mismo tamaño.
- Análisis de sesgos y errores factuales: el recuento de respuestas con cifras ausentes del caso y de la referencia (20 de 80 en DPO frente a 15 de 80 en SFT) permite estudiar la aparición de datos inventados en modelos pequeños.

## Benchmarks y rendimiento

Resultados de triaje publicados por el autor:

| Modelo | Decisión | Split | Accuracy | Macro F1 | Recall P1 | Infra-triaje | Sobre-triaje |
|---|---|---|---|---|---|---|---|
| SFT + DPO (este) | Nivel más probable | test | 76.5 | 76.3 | 85.3 | 8.0 | 15.5 |
| SFT + DPO (este) | Nivel más probable | validación | 62.8 | 62.4 | 77.6 | 16.2 | 21.0 |
| SFT + DPO (este) | Regla de coste (alpha 0.35) | test | 77.8 | 77.7 | 88.3 | 5.2 | 17.0 |
| SFT + DPO (este) | Regla de coste (alpha 0.35) | validación | 64.1 | 64.0 | 83.6 | 10.0 | 25.9 |
| SFT (entregado) | Nivel más probable | test | 78.8 | 78.7 | 86.5 | 7.0 | 14.2 |
| SFT (entregado) | Regla de coste (alpha 0.35) | test | 76.8 | 76.6 | 88.3 | 5.5 | 17.8 |

Comparación de respuestas y conocimiento:

| Comprobación | SFT + DPO | SFT |
|---|---|---|
| FrenchMedMCQA exact match (108 preguntas) | 49.1 % | 50.0 % |
| ROUGE-L sobre 80 preguntas fijas | 19.5 | 18.9 |
| Respuestas con cifra ausente del caso y de la referencia (de 80) | 20 | 15 |
| Juicio ciego de respuestas, media 1 a 5 (60 casos) | 2.90 | 3.00 |
| Juicio ciego de respuestas, preferidas (32 empates) | 8 | 20 (sign test p = 0.036) |
| Juicio ciego de explicaciones de nivel, preferidas (15 empates) | 18 | 27 (p = 0.23) |

El margen de recompensa en validación pasó de 0.56 a 1.11, pero la mejora no se trasladó a las respuestas ni a las explicaciones del nivel.

## Requisitos de hardware

- El adaptador LoRA es de tamaño reducido (repo de 0.0 GB según Hugging Face) y requiere cargar el base Qwen3-1.7B-Base en bf16, lo que supone aproximadamente 3,4 GB de pesos.
- VRAM estimada para inferencia: en torno a 4-5 GB en bf16 con `device_map="auto"`; menos de 3 GB si se cuantiza el base a 8 bits y en torno a 1,5-2 GB en 4 bits (estimaciones a partir del tamaño del base, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (el propio autor entrenó en una RTX 2060 de 6 GB). Para mayor throughput, A100, H100 o RTX 4090.
- Cabe en GPU consumer: sí, en RTX 2060 6 GB, RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, entre otras.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado por el autor); compatible con vLLM, TGI y llama.cpp tras fusionar el adaptador con el base y convertir a los formatos correspondientes, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| p14-triage-qwen3-1.7b-dpo-lora (este) | 1.7B + LoRA r16 | no disponible (entreno a 768 tokens) | Triaje clínico P1/P2/P3 + respuesta breve | Apache 2.0 | Hugging Face (adaptador) |
| christophe-ringot/p14-triage-qwen3-1.7b-lora (SFT) | 1.7B + LoRA r16 | no disponible | Triaje clínico P1/P2/P3 + respuesta breve | Apache 2.0 | Hugging Face (adaptador) |
| Qwen/Qwen3-1.7B-Base | 1.7B | no disponible en la información | Generación de texto general | Apache 2.0 | Hugging Face |

El modelo SFT es la alternativa directa y el autor indica que fue preferido en comparación ciega de respuestas (20 frente a 8, p = 0.036). El base Qwen3-1.7B-Base carece de especialización en triaje y no es comparable en esa tarea.

## Limitaciones y advertencias

- No apto para uso clínico: entrenado con casos de examen y etiquetas de prioridad generadas por un LLM que ningún médico ha validado.
- Las respuestas en texto libre contienen con frecuencia errores médicos; el autor lo señala explícitamente en la model card.
- El DPO no mejora las respuestas: la comparación ciega prefiere las del modelo SFT (p = 0.036), y el juicio medio es inferior (2.90 frente a 3.00).
- Mayor tendencia a introducir cifras ausentes del caso y de la referencia (20 de 80 frente a 15 de 80 en SFT).
- El triaje se mantiene dentro de uno o dos casos de diferencia respecto al SFT, con intervalos de confianza solapados, y nunca se predice P3 para un caso P1.
- La validación es más difícil que el test (accuracy 62.8-64.1 frente a 76.5-77.8), lo que sugiere sobreajuste al conjunto de test o diferencias de distribución.
- El modelo solo cubre francés e inglés; no se documenta soporte para otras lenguas.
- El adaptador requiere el base Qwen3-1.7B-Base y no funciona de forma autónoma.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero las advertencias clínicas del autor desaconsejan cualquier despliegue en producción sanitaria sin validación humana de cada decisión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso externo.

## Enlaces

- Hugging Face: https://huggingface.co/christophe-ringot/p14-triage-qwen3-1.7b-dpo-lora
- Adaptador SFT de partida: https://huggingface.co/christophe-ringot/p14-triage-qwen3-1.7b-lora
- Dataset de SFT: https://huggingface.co/datasets/christophe-ringot/p14-medical-triage-sft
- Dataset de evaluación clínica: https://huggingface.co/datasets/christophe-ringot/p14-medical-triage-clinical-eval
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Código del proyecto: https://github.com/Christophe-Ringot/OC_P14_finetuning
