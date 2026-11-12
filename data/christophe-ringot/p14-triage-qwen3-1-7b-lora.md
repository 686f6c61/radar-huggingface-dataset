# christophe-ringot/p14-triage-qwen3-1.7b-lora

## Resumen

El modelo `christophe-ringot/p14-triage-qwen3-1.7b-lora` es un adaptador LoRA entrenado sobre el modelo base `Qwen/Qwen3-1.7B-Base` para realizar tareas de triaje clínico. Dado un caso clínico y una pregunta asociada, el modelo genera un nivel de prioridad (P1 `urgence_maximale`, P2 `urgence_moderee` o P3 `differee`) seguido de una respuesta breve en texto libre. Ha sido desarrollado por Christophe Ringot como prueba de concepto de un asistente de triaje para el hospital ficticio CHSA, en el marco de un proyecto final de formación en ingeniería de IA.

El adaptador se entrena mediante SFT con LoRA sobre un conjunto de 5.345 pares de entrenamiento derivados de MediQAl, FrenchMedMCQA y MedQuAD, anonimizados con Presidio y expresiones regulares. El modelo base Qwen3-1.7B-Base aporta la capacidad de generación de texto subyacente; el adaptador añade el comportamiento específico de triaje.

Es relevante como ejemplo de aplicación de ajuste fino eficiente (LoRA r=16) en un dominio sanitario con recursos limitados (entrenado en una RTX 2060 de 6 GB), y por su enfoque metodológico: en lugar de parsear el texto generado, propone puntuar los tres niveles mediante log-probabilidades y aplicar una regla de decisión basada en una matriz de costes que penaliza el sub-triaje. El autor advierte explícitamente que no es apto para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B-Base) con adaptador LoRA (PEFT) |
| Parametros totales | 1.700 millones (modelo base); adaptador LoRA: no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (longitud máxima de entrenamiento); contexto nativo del base: no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (el adaptador se usa en bf16 según el ejemplo de la model card) |
| Idiomas soportados | fr, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre `Qwen/Qwen3-1.7B-Base`, un transformer decoder-only de 1.700 millones de parámetros. La configuración LoRA emplea r=16, alpha=32, dropout 0.05 y se aplica a las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj`. El entrenamiento se realizó con PEFT y TRL mediante SFT: 3 épocas, learning rate 2e-4 con scheduler lineal, batch efectivo de 8, longitud máxima de 1.024 tokens, precisión bf16 y semilla 42, en una única RTX 2060 de 6 GB. El mejor checkpoint se seleccionó por pérdida de validación en el paso 1.300.

Los datos de entrenamiento provienen del dataset `christophe-ringot/p14-medical-triage-sft` (revisión `c2a08bd`), con 5.345 pares tras el filtrado por longitud, construidos a partir de MediQAl, FrenchMedMCQA y MedQuAD y anonimizados con Presidio y expresiones regulares. Las respuestas sobre casos anotados comienzan con el prefijo `[Niveau de priorité estimé : <level>]`. Se probaron dos variantes con DPO sobre este adaptador que no se conservaron: una colapsó a la clase P1 (precisión del 47 %) y la otra mantuvo el triaje pero perdió en una comparación ciega de respuestas (20 frente a 8, con 32 empates).

## Capacidades

- Generación de texto en francés e inglés orientada a casos clínicos.
- Clasificación de triaje en tres niveles de prioridad (P1, P2, P3) mediante puntuación de log-probabilidades y regla de decisión con matriz de costes.
- Generación de una respuesta breve en texto libre que acompaña al nivel de prioridad (uso limitado, ver limitaciones).
- Respuesta a preguntas de opción múltiple sobre conocimiento médico (FrenchMedMCQA).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión ni audio.
- No se documenta modo thinking explícito.

## Casos de uso

- Prueba de concepto de triaje asistido en urgencias: el modelo lee un caso clínico y una pregunta y asigna un nivel de prioridad; adecuado para demostrar el flujo completo (puntuación de log-probabilidades + regla de costes) en un entorno de investigación con validación humana obligatoria.
- Investigación sobre ajuste fino eficiente en dominios sanitarios: sirve como referencia reproducible de SFT con LoRA sobre un modelo de 1.7B en hardware de consumo (RTX 2060 de 6 GB), con hiperparámetros y dataset documentados.
- Evaluación de metodologías de decisión con costes asimétricos: el código de la model card ejemplifica cómo penalizar el sub-triaje (alpha 0.5) frente al sobre-triaje mediante una matriz de costes, útil para experimentos de calibración en clasificación médica.
- Generación de preguntas de opción múltiple médicas en francés: el modelo obtiene un 50 % de exact match en FrenchMedMCQA, por lo que puede emplearse en prototipos de evaluación formativa, siempre con revisión experta.
- Estudio de anonimización de datos clínicos: el pipeline de Presidio y expresiones regulares documentado en el dataset de entrenamiento puede reutilizarse en proyectos de preparación de corpus sanitarios.
- Comparación de estrategias de alineación (SFT frente a DPO): los resultados negativos de las dos variantes DPO descritas aportan evidencia empírica sobre el colapso de clases y la pérdida de calidad en respuestas en dominios con etiquetas ruidosas.

## Benchmarks y rendimiento

Resultados publicados en la model card. Conjunto de test: 400 preguntas sobre 109 casos anotados. Validación: conjunto separado de aproximadamente 70 casos, más difícil.

| Decisión | Split | Accuracy | Macro F1 | P1 recall | Sub-triaje | Sobre-triaje |
|---|---|---|---|---|---|---|
| Nivel más probable | test | 78,8 | 78,7 | 86,5 | 7,0 | 14,2 |
| Nivel más probable | validación | 62,6 | 62,9 | 72,4 | 16,2 | 21,3 |
| Regla de coste (alpha 0,5) | test | 70,8 | 69,8 | 90,2 | 4,2 | 25,0 |
| Regla de coste (alpha 0,5) | validación | 66,9 | 66,6 | 89,6 | 4,9 | 28,2 |

Otras comprobaciones, con el mismo protocolo para todos los modelos:

| Métrica | Resultado |
|---|---|
| FrenchMedMCQA (108 preguntas de test), exact match | 50,0 % (azar ≈ 20 %) |
| ROUGE-L en 80 preguntas fijas de test | 18,9 |
| Frases de riesgo tranquilizadoras | 0 |
| Respuestas con cifra ausente del caso y de la referencia | 15 de 80 |
| Juicio ciego (LLM juez, escala 1-5): relevancia | 1,7 |
| Juicio ciego: claridad | 2,7 |
| Juicio ciego: seguridad | 2,8 |
| Juicio ciego: formato | 4,8 |

Comparación con referencias: el modelo base alcanza un 27,8 % de accuracy y el SFT sin ejemplos de triaje un 32,2 %. Ningún caso P1 se predice como P3.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.7B en bf16 requiere aproximadamente 3,4 GB solo para pesos; con overhead de activaciones y caché KV, en torno a 4-5 GB. El adaptador LoRA añade una cantidad marginal.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para bf16; el autor entrenó en una RTX 2060 de 6 GB, por lo que la inferencia cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en RTX 2060 (6 GB) y superiores.
- Opciones de despliegue: el ejemplo de la model card usa `transformers` con `peft` y `device_map="auto"`. No se documentan configuraciones para vLLM, llama.cpp, Ollama o TGI; al ser un adaptador PEFT en safetensors, sería necesario fusionarlo con el base para usarlo en motores que no soporten PEFT de forma nativa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| p14-triage-qwen3-1.7b-lora | 1.7B (base) + LoRA | 1.024 tokens (entrenamiento) | Triaje clínico P1/P2/P3 en fr/en | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-1.7B-Base | 1.7B | no disponible | Modelo base generalista | Apache 2.0 | Hugging Face |
| SFT sin ejemplos de triaje (referencia del autor) | 1.7B | no disponible | SFT genérico médico | no disponible | no disponible |
| Variantes DPO descartadas (referencia del autor) | 1.7B | no disponible | Triaje con DPO | no disponible | no disponibles |

La model card únicamente compara con el modelo base y con las variantes internas del propio autor. No se dispone de datos sobre otros adaptadores de triaje comparables en la información proporcionada.

## Limitaciones y advertencias

- No apto para uso clínico. Las etiquetas de prioridad fueron generadas por un LLM y no han sido validadas por médicos de urgencias; hay una revisión de 50 casos en curso.
- Evaluación pequeña y estrecha: 109 casos de test, la mitad de ellos de cardiología pediátrica, y casos de examen en lugar de notas reales de urgencias.
- La respuesta en texto libre es débil (relevancia 1,7 sobre 5) y puede ser peligrosa: la revisión ciega detectó prostaglandinas omitidas en cardiopatías ductus-dependientes, anticoagulantes mantenidos antes de cirugía y dosis de morfina en gramos. Debe usarse solo como explicación del nivel, nunca como consejo.
- La matriz de costes es una decisión de negocio que debe validarse con clínicos.
- Riesgo de alucinación en las respuestas: 15 de 80 respuestas contienen una cifra ausente tanto del caso como de la referencia.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas limitados a francés e inglés; no se documenta soporte de castellano.
- Licencia Apache 2.0 permite uso comercial, pero las advertencias clínicas y la falta de validación médica desaconsejan cualquier despliegue en producción sanitaria sin supervisión humana.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB según Hugging Face, lo que sugiere que los pesos del adaptador podrían no estar subidos o ser de tamaño despreciable; conviene verificar la integridad antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/christophe-ringot/p14-triage-qwen3-1.7b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/christophe-ringot/p14-medical-triage-sft
- Dataset de evaluación clínica: https://huggingface.co/datasets/christophe-ringot/p14-medical-triage-clinical-eval
- Repositorio de código: https://github.com/Christophe-Ringot/OC_P14_finetuning
