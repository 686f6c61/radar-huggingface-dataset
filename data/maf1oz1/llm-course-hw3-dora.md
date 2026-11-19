# maf1oz1/llm-course-hw3-dora

## Resumen

`maf1oz1/llm-course-hw3-dora` es un adaptador PEFT de tipo DoRA (Weight-Decomposed Low-Rank Adaptation) publicado por el usuario maf1oz1 sobre el modelo base `OuteAI/Lite-Oute-1-300M-Instruct`, un transformer decoder-only de 300 millones de parametros. El adaptador se ha entrenado para una tarea concreta de clasificacion de sentimiento en tres clases (negative, neutral, positive) sobre el dataset `cardiffnlp/tweet_eval` (subset `sentiment`), formulada como generacion de texto: el modelo recibe un tuit y debe emitir la etiqueta correspondiente.

No se trata de un modelo fundacional ni de un modelo de proposito general, sino de un artefacto didactico derivado de un trabajo de curso sobre PEFT. La implementacion de DoRA esta escrita desde cero en PyTorch, sin usar la implementacion de referencia de la libreria PEFT, y solo se aplica a las proyecciones `k_proj` y `v_proj` de la atencion. El adaptador anade 448.000 parametros entrenables (0,15% del total del modelo base) y el repositorio ocupa 1,2 GB, practicamente todo correspondiente a los pesos del modelo base fusionados en formato safetensors.

Su relevancia es limitada fuera del ambito academico: sirve como ejemplo reproducible de como implementar DoRA manualmente, de como formular una tarea de clasificacion como generacion condicionada y de como evaluar el resultado con una metrica macro F1. No hay informacion sobre licencia, y el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base OuteAI/Lite-Oute-1-300M-Instruct) con adaptadores DoRA en `k_proj` y `v_proj` |
| Parametros totales | 300.049.792 (modelo base); 448.000 parametros entrenables en el adaptador (0,15%) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), cargado via `peft` / `transformers` |
| Rank / alpha de DoRA | r = 8, alpha = 16 |
| Modulos objetivo | `k_proj`, `v_proj` |
| Dataset de entrenamiento | `cardiffnlp/tweet_eval` (subset `sentiment`), primeros 20.000 tuits del split de train |
| Epocas | 1 |
| Batch size / learning rate | 16 / 5e-4, AdamW, weight decay 0.01 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 300 millones de parametros de la familia Lite-Oute-1, orientado a instrucciones en ingles. Sobre el se aplica DoRA, una variante de LoRA que descompone la matriz de pesos en magnitud y direccion: `W = m · (W₀ + BA) / ‖W₀ + BA‖`. La direccion se aprende mediante las matrices de bajo rango A y B (rango 8), mientras que la magnitud se aprende con un vector `m` con un valor por neurona de salida, inicializado a partir de las normas de las filas de `W₀`. En este trabajo la implementacion es manual en PyTorch, con clases `LoRALayer`, `LinearWithLoRA` / `LinearWithDoRA` y una funcion `apply_peft_to_module` que sustituye los modulos lineales objetivo.

El entrenamiento usa solo 20.000 ejemplos del split de train de `tweet_eval/sentiment`, una epoca, batch size 16, AdamW con learning rate 5e-4 y weight decay 0,01. La perdida se calcula exclusivamente sobre la respuesta (la parte del prompt se enmascara con `-100`), de modo que el modelo aprende a emitir la etiqueta y no a reproducir el tuit. El autor reporta que con dos epocas el F1 de validacion bajaba de 0,511 a 0,505, por lo que fijo una sola epoca. No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Clasificacion de sentimiento en tres clases (`negative`, `neutral`, `positive`) sobre texto corto en ingles, principalmente tuits.
- Generacion de texto condicionada por prompt, heredada del modelo base instruct.
- Formulacion de la clasificacion como tarea generativa: el modelo emite la etiqueta como texto, lo que permite extraerla por parsing.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, vision, audio ni modo thinking.
- No se documenta una capacidad general de razonamiento o codigo mas alla de la que pueda tener el modelo base de 300M.

## Casos de uso

- Clasificacion de sentimiento en redes sociales a pequena escala: el adaptador esta entrenado especificamente sobre `tweet_eval`, por lo que es adecuado para prototipos de analisis de opinion en tuits en ingles con tres clases. Su tamano (300M) permite ejecutarlo en CPU o GPU modesta.
- Reproduccion didactica de DoRA: sirve como referencia para implementar DoRA desde cero en PyTorch, comparar su formulacion con LoRA estandar y verificar el impacto de la descomposicion magnitud/direccion en un caso real.
- Filtrado de comentarios en ingles en pipelines de moderacion: se puede usar como primer clasificador barato para separar tono negativo de neutral/positivo antes de escalar a un modelo mayor.
- Baseline para experimentos de PEFT: util como punto de partida para comparar otras variantes (LoRA, LoRA+, adaptadores con distintos rangos) sobre el mismo dataset y metrica.
- Etiquetado asistido de datos: generar etiquetas preliminares sobre grandes volumenes de tuits en ingles y revisar manualmente solo los casos de baja confianza, dado el bajo coste de inferencia del modelo de 300M.
- Demo educativa de evaluacion con macro F1: el diseno de la metrica (incluyendo la clase vacia para respuestas no parseables) es un ejemplo util de como tratar fallos de formato en tareas generativas.
- No es adecuado para clasificacion de sentimiento en dominios distintos a Twitter ni en idiomas distintos del ingles, dado el entrenamiento especifico y el modelo base limitado.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split de test de `cardiffnlp/tweet_eval/sentiment` (12.284 tuits):

| Metrica | Modelo base (sin adaptador) | Tras DoRA |
|---|---|---|
| Macro F1 (4 clases, metrica del trabajo) | 0,15 | 0,51 |
| Macro F1 (3 clases reales) | no disponible | 0,68 |

F1 por clase tras DoRA:

| Clase | F1 |
|---|---|
| negative | 0,71 |
| neutral | 0,66 |
| positive | 0,67 |

Nota sobre la metrica: el trabajo define macro F1 sobre cuatro clases (las tres reales mas una clase vacia `""` para respuestas de las que no se puede extraer etiqueta). Como la clase vacia no tiene ejemplos reales, su F1 es siempre 0 y el maximo alcanzable de la metrica de cuatro clases es 0,75. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,6-0,8 GB para los pesos del modelo base de 300M, mas overhead de activaciones y cache KV. Cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- En fp32: aproximadamente 1,2 GB de pesos, tambien asequible en GPUs consumer modestas (GTX 1650, RTX 3050, etc.).
- Es viable en CPU para inferencia por lotes pequenos, dado el reducido tamano del modelo.
- GPUs recomendadas: no se requieren GPUs de datacenter; una RTX 3060/4060 o superior es mas que suficiente. A100/H100 no aportan ventaja practica para este tamano.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado por el autor, cargando el safetensors y aplicando `apply_peft_to_module`); tambien seria posible exportar a GGUF y usar llama.cpp u Ollama, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia de decenas de milisegundos por peticion en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maf1oz1/llm-course-hw3-dora | 300M (base) + 448K adaptador | no disponible | Clasificacion de sentimiento en tuits (en) | no disponible | Hugging Face |
| OuteAI/Lite-Oute-1-300M-Instruct | 300M | no disponible | Generacion de texto instruct (en) | no disponible | Hugging Face |
| Adaptadores LoRA equivalentes sobre el mismo base | 300M + adaptador | no disponible | Clasificacion de sentimiento | depende del autor | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Entrenado solo con 20.000 ejemplos y una epoca: riesgo alto de sobreajuste al estilo de `tweet_eval` y baja generalizacion a otros dominios o registros.
- El modelo base es de 300M de parametros, lo que limita su capacidad de razonamiento y de seguir instrucciones complejas; los errores de formato (respuestas no parseables) penalizan la metrica de cuatro clases.
- Solo soporta ingles; no se ha evaluado en otros idiomas.
- La licencia no esta especificada, lo que impide confirmar si se permite uso comercial. Hay que contactar con el autor o asumir que no se puede usar en produccion sin aclaracion.
- Riesgo de alucinacion y de etiquetas inconsistentes, especialmente en tuits con sarcasmo, negaciones o sentimiento mixto (la model card muestra ejemplos de fallos).
- El repositorio incluye los pesos del modelo base, lo que puede plantear dudas sobre la licencia heredada de `OuteAI/Lite-Oute-1-300M-Instruct`; conviene revisar la licencia del modelo base antes de cualquier uso.
- No hay informacion sobre sesgos especificos, pero al entrenarse sobre Twitter hereda los sesgos de ese corpus (lenguaje informal, dominios geograficos y tematicos concretos).
- La carga requiere codigo personalizado (`apply_peft_to_module`, clases `LinearWithDoRA`) que no esta empaquetado en el repo; no funciona con un simple `PeftModel.from_pretrained` sin adaptar el codigo del notebook.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maf1oz1/llm-course-hw3-dora
- Modelo base: https://huggingface.co/OuteAI/Lite-Oute-1-300M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Paper de DoRA (Weight-Decomposed Low-Rank Adaptation): no disponible en la informacion proporcionada
- Repositorio de codigo del notebook: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
