# Keerthunb/FeedbackLens-Qwen3.5-0.8B-BANKING77

## Resumen

FeedbackLens-Qwen3.5-0.8B-BANKING77 es un modelo de clasificación de intenciones para el dominio bancario en inglés, desarrollado por keerthananb1512 y publicado en Hugging Face por el usuario Keerthunb. No es un modelo de lenguaje generativo al uso, sino un adaptador LoRA junto con una cabeza de decisión ("Clef head") entrenada sobre el backbone `unsloth/Qwen3.5-0.8B`, que formula la clasificación como una pregunta de opción múltiple sobre un catálogo cerrado de 77 intenciones bancarias. El modelo devuelve una etiqueta y un vector de probabilidades sobre las 77 opciones.

El problema que resuelve es concreto: enrutar mensajes de clientes bancarios (reclamaciones, consultas sobre tarjetas, transferencias, cargos, etc.) hacia la intención correcta dentro del conjunto de datos BANKING77 de PolyAI. Sobre las 3.080 muestras del split oficial de test alcanza un 92,40 % de accuracy y un macro-F1 de 0,9238, según los resultados declarados por el autor.

Su relevancia actual es doble: por un lado, demuestra que un backbone pequeño (0,8B) con un adaptador LoRA de rango 16 y una cabeza de decisión específica puede competir en una tarea de clasificación supervisada de dominio cerrado; por otro, el paquete de publicación incluye el adaptador, la cabeza en FP32, el tokenizador, la configuración de calibración y el esquema ordenado de intenciones, lo que facilita su reproducción. La licencia es Apache 2.0 y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión Clef sobre backbone transformer Qwen3.5-0.8B; cabeza de decisión con campo de elección de 77 opciones |
| Parametros totales | 891.133.508 en el wrapper de entrenamiento |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens durante entrenamiento |
| Tipos de cuantizacion | no disponible; el autor indica BF16 para el backbone y FP32 para cabeza/adaptadores, sin cuantización |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA + cabeza Clef FP32 + tokenizador/procesador + configuración de calibración + esquema de intenciones) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-0.8B` (revisión `23c69c53358a07516b5827588b3fdb12ae78fd65`) y añade dos componentes entrenables: un adaptador LoRA de rango 16, alpha 16 y dropout 0 aplicado a las proyecciones de atención y feed-forward del modelo de lenguaje, y una cabeza de decisión Clef de anchura 512 con 2 capas de enrutamiento de evidencia, 4 capas de decoder, 8 cabezas de atención y FFN de anchura 2.048. El total de parámetros del wrapper de entrenamiento es de 891.133.508, de los cuales 38.147.588 son entrenables (aproximadamente el 4,28 %). La implementación adapta el notebook oficial de decisión de Unsloth para Qwen3.5.

El entrenamiento usa el dataset PolyAI/BANKING77 (revisión `1846984189f2bc0ac51c6fc3a600fa9e1714e0c6`). De las 10.003 filas originales de entrenamiento se eliminan 25 solapadas con test, 30 duplicados normalizados y 2 filas con etiquetas conflictivas; tras normalización (NFKC, case folding, tokenización por palabras y colapso de espacios) se genera un split estratificado con semilla 3407 de 7.956 mensajes de entrenamiento y 1.990 de validación, manteniendo las 77 etiquetas en todos los splits. Se entrenan tres épocas con batch físico 2, acumulación de gradiente 16 (batch efectivo 32), AdamW, scheduler coseno, 5 % de warmup, weight decay 0,01 y semilla 3407. El learning rate es 2e-4 para LoRA y 1e-4 para la cabeza; se selecciona el checkpoint con mejor pérdida de validación. No se documenta RLHF ni DPO: es entrenamiento supervisado de clasificación.

## Capacidades

- Clasificación de intenciones en inglés sobre un catálogo cerrado de 77 etiquetas del dominio bancario (BANKING77).
- Salida de etiqueta única más distribución de probabilidad completa sobre las 77 intenciones.
- Formulación como pregunta de opción múltiple con un único campo de elección sobre el catálogo completo.
- Calibración de probabilidades incluida en el release (configuración de calibración empaquetada).
- No se han evaluado sus capacidades generativas ni multimodales; el autor lo declara explícitamente.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Enrutamiento de tickets en atención al cliente bancaria: el modelo recibe el mensaje del cliente y devuelve la intención entre 77, lo que permite dirigirlo al equipo o flujo adecuado (tarjetas, transferencias, cargos, etc.).
- Triaje automático en bandejas de correo de soporte: clasificación por lotes de mensajes con la probabilidad asociada para priorizar casos ambiguos hacia revisión humana.
- Análisis de voz del cliente: transcripción de llamadas y clasificación de la intención subyacente para alimentar dashboards de motivos de contacto.
- Etiquetado asistido de datos: uso del modelo para preetiquetar grandes volúmenes de mensajes bancarios y acelerar la construcción de datasets propios.
- Enrutamiento en chatbots y asistentes virtuales: selección de la rama de diálogo o del flujo de resolución en función de la intención predicha.
- Detección de intenciones de riesgo operativo: identificación de categorías como cargos no reconocidos o problemas con tarjetas para derivación a procesos específicos.
- Evaluación comparativa interna: servir de baseline supervisado de dominio cerrado frente a modelos generativos sin fine-tuning específico, dado que el autor reporta comparaciones en ese escenario.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split oficial de test de BANKING77 (3.080 mensajes):

| Metrica | Valor |
|---|---|
| Accuracy | 0,924025974025974 (92,40 %) |
| Macro-F1 | 0,9237919189536611 (0,9238) |

El autor indica que los modelos de comparación de su benchmark no recibieron fine-tuning local sobre BANKING77, por lo que la comparación no es homogénea. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas generativas para este modelo.

## Requisitos de hardware

- El release contiene solo el adaptador LoRA y la cabeza Clef; es necesario descargar además los pesos base de `unsloth/Qwen3.5-0.8B` en la revisión fijada.
- Con un backbone de 0,8B en BF16, la inferencia requiere del orden de 2 GB solo para los pesos del modelo base, más el adaptador y la cabeza; el repo del adaptador ocupa 0,2 GB.
- Entorno probado por el autor: Linux, Python 3.11, GPU NVIDIA con soporte BF16, Unsloth 2026.11.3, Transformers 5.17.0, PEFT 0.21.2, torch 2.9.0 y CUDA 12.8.
- El autor emplea una GPU NVIDIA (el ejemplo usa `CUDA_VISIBLE_DEVICES=0`) y la demo Streamlit con `FEEDBACKLENS_GPU=0`; no se especifica el modelo de GPU.
- Por tamaño, es plausible su ejecución en GPUs de consumo con soporte BF16, aunque no se documentan cifras de VRAM, latencia ni throughput.
- El despliegue se realiza mediante el `Backend` del proyecto FeedbackLens, que reconstruye el modelo con `FastDecisionModel` de Unsloth; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

La información disponible no incluye una tabla de comparación con alternativas concretas; el autor menciona un dashboard de comparación medido en su repositorio, pero no se detallan los modelos ni sus cifras en la documentación proporcionada.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FeedbackLens-Qwen3.5-0.8B-BANKING77 | 891.133.508 (38,1M entrenables) | 4.096 | Clasificación de 77 intenciones bancarias | Apache 2.0 | Hugging Face (adaptador + cabeza) |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de intenciones bancarias en inglés; no debe usarse como modelo generativo general.
- El catálogo está cerrado a 77 intenciones de BANKING77; mensajes fuera de ese dominio quedarán forzados a una de las 77 etiquetas.
- Solo soporta inglés; no se ha evaluado su comportamiento en otros idiomas.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false` en el model-index).
- El split de test oficial conserva duplicados internos, según indica el propio autor.
- La comparación con otros modelos del benchmark del autor no es homogénea (los comparados no recibieron fine-tuning sobre BANKING77).
- Riesgo de alucinación de etiqueta: al ser una tarea de elección forzada, siempre devolverá una de las 77 intenciones, incluso ante entradas ambiguas o fuera de dominio.
- No se documentan sesgos específicos; al entrenar sobre BANKING77 hereda los sesgos y la distribución de ese dataset.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `unsloth/Qwen3.5-0.8B` es una dependencia separada cuyos términos deben verificarse por separado.
- Requiere el código del proyecto FeedbackLens para la carga; no es un checkpoint autónomo cargable con `AutoModel` estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Keerthunb/FeedbackLens-Qwen3.5-0.8B-BANKING77
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Repositorio del proyecto: https://github.com/keerthananb1512/FeedbackLens
- Resultados de benchmark: https://github.com/keerthananb1512/FeedbackLens/blob/329d98161a1970b1c40e3174542b63d66b3c5a04/results/BENCHMARKS.md
- Resultado de evaluación (decision.json): https://github.com/keerthananb1512/FeedbackLens/blob/329d98161a1970b1c40e3174542b63d66b3c5a04/results/decision.json
- Auditoría de datos: https://github.com/keerthananb1512/FeedbackLens/blob/329d98161a1970b1c40e3174542b63d66b3c5a04/data/audit.json
- Notebook de referencia de Unsloth: https://github.com/unslothai/notebooks/blob/59d5a1b8216e5f67c5e3ccf37a5ecae94a950a14/nb/Qwen3_5_%284B%29-Decision.ipynb
- Dataset BANKING77: https://huggingface.co/datasets/PolyAI/banking77
- Paper de BANKING77: https://arxiv.org/abs/2003.04807
