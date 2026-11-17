# nerozx/qwen3.5-0.8b-decision-browser-q4

## Resumen

`nerozx/qwen3.5-0.8b-decision-browser-q4` es un modelo de decisión (no de chat) derivado de `unsloth/Qwen3.5-0.8B` mediante un fine-tuning con LoRA y una cabeza de decisión propia denominada Clef. Recibe un `state` (tarea, paso actual y acciones previas) y un conjunto de `questions` cuyas opciones son elementos de una página web, y devuelve la clave de la opción a interactuar junto con una probabilidad calibrada por opción. Está pensado para integrarse como el paso de selección de elemento dentro de un bucle de agente de navegador, servido a través de un endpoint `/v1/systemone` sobre backend llama.cpp.

El modelo tiene 779.717.956 parámetros totales (aproximadamente 0,8 B) y se distribuye en formato GGUF con cuantización Q4_K_M (520 MB) más un torre de visión opcional en Q8_0 (111 MB). Su relevancia radica en que ofrece un 94,8 % de la precisión de su hermano mayor de 2 B (82,4 % frente a 86,9 % en el split de evaluación) con aproximadamente el 40 % del tamaño y el doble de throughput, manteniendo una calibración prácticamente idéntica (ECE 0,0543 frente a 0,0524).

Es un componente especializado, no un modelo generalista: no genera texto libre, no escribe valores en campos ni planifica procedimientos multi-paso. Su función es elegir, entre una lista corta de candidatos pre-filtrada, cuál es el siguiente elemento con el que interactuar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-0.8B) con cabeza de decisión Clef (hidden 1024, width 512, 4 capas) |
| Parametros totales | 779.717.956 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (configuración de servidor reportada) |
| Tipos de cuantizacion | Q4_K_M (checkpoint principal); Q8_0 (torre de visión) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `other` (ver limitaciones) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte del backbone de `unsloth/Qwen3.5-0.8B` y añade una cabeza de decisión Clef entrenada con `soft_cross_entropy`. La cabeza tiene forma hidden 1024, width 512 y 4 capas, según `joint_head_config.json`. El entrenamiento se realizó con LoRA de rango 16, alpha 16 y dropout 0,05, en precisión fp16 (`load_in_4bit = false`), con learning rate 2e-4, warmup de 5 pasos y batch de 4. El pico de VRAM durante el entrenamiento fue de 2,91 GB.

Los datos de SFT son filas de decisión derivadas de Mind2Web (CC-BY-4.0), con 6.987 filas de entrenamiento y 375 de evaluación. El checkpoint se detuvo de forma temprana en 1,72 de 2 épocas (1.501 pasos); el autor estima que una ejecución completa podría añadir 1-2 puntos porcentuales de precisión. En el held-out interno de Unsloth, la pérdida pasó de 0,3145 a 0,8987 y el ECE de 0,1979 a 0,0203, aunque esa métrica no es directamente comparable con la tabla de evaluación head-to-head.

La innovación principal no está en el backbone sino en el contrato de inferencia: el modelo no recibe un prompt conversacional, sino una estructura `state` + `questions` con opciones tipadas (`choice`, `noul`), y devuelve `answers` con `confidence` y `probabilities` calibradas por bucket de número de opciones (≤2, 3-5, 6-10, 11+).

## Capacidades

- Selección de elemento en páginas web: dado un estado de tarea y una lista corta de candidatos, devuelve la clave del elemento a interactuar.
- Clasificación de operación: distingue entre `click`, `type` y `select` sobre el elemento elegido.
- Predicción de necesidad de valor: responde si la acción requiere un valor específico (`needs_value`).
- Abstención calibrada: devuelve `none` cuando ningún candidato es adecuado, con recall del 100 % y 0 % de falsas abstenciones en el split evaluado.
- Probabilidades calibradas por opción: útil para umbrales de confianza y para encadenar con un planificador.
- Entrada de imagen opcional mediante la torre de visión Q8_0 (111 MB).
- No soporta tool calling genérico, generación de texto libre, escritura de valores ni planificación multi-paso.

## Casos de uso

- Agente de navegador web: el modelo actúa como cabeza de selección en cada paso del bucle; un planificador o un ranker le pasa una lista de ≤10 candidatos y el modelo elige el siguiente elemento. Es adecuado porque su latencia (437 ms/petición con 4 workers) permite iterar rápido en bucles de 8 pasos.
- Automatización de formularios guiada: combinado con un planificador que extrae los campos, el modelo decide sobre qué control interactuar y si la operación es `type` o `select`, dejando la escritura del valor a otro componente.
- Rellenado de tablas y listas dinámicas: en tareas tipo Mind2Web (por ejemplo, seleccionar una fila de una tabla de salud), el modelo resuelve la selección con 82,4 % de precisión sobre candidatos pre-filtrados.
- Enrutamiento de acciones en pipelines RPA: como clasificador de bajo coste (520 MB, ~0,7-0,9 GB de RAM) para decidir la siguiente acción en flujos automatizados con presupuesto de memoria ajustado.
- Despliegue en entornos con recursos limitados: al caber en CPU o en GPU consumer con cuantización Q4_K_M, sirve para agentes de navegador en portátiles o contenedores pequeños.
- Evaluación y anotación de trayectorias: sus probabilidades calibradas permiten puntuar decisiones de agentes existentes y detectar pasos de baja confianza para revisión humana.
- Componente de abstención segura: gracias al 100 % de recall en `none`, puede usarse como filtro que detiene el bucle cuando ningún candidato es válido.

## Benchmarks y rendimiento

Evaluación en el split de evaluación (N=375, precisión en `target`) frente al modelo hermano de 2 B, ambos Q4_K_M y servidos por el mismo endpoint llama.cpp `/v1/systemone`:

| Metrica | 0.8B Q4_K_M (este) | 2B Q4_K_M |
|---|---|---|
| Precisión (todas) | 82,4 % (309/375) | 86,9 % (326/375) |
| Precisión gold ≠ none | 79,8 % (260/326) | 85,0 % (277/326) |
| Recall de `none` | 100 % (49/49) | 100 % (49/49) |
| Falsa abstención | 0,0 % | 0,0 % |
| Mediana de confianza | 0,935 | 0,977 |
| ECE (10 bins) | 0,0543 | 0,0524 |
| Throughput de evaluación (4 workers) | 2,3 req/s · 437 ms/req | 1,1 req/s · 892 ms/req |
| Tamaño GGUF | 520 MB | 1,29 GB |
| RAM de servidor (ctx 4096) | ~0,7-0,9 GB | ~1,5 GB |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; con Q4_K_M y contexto 4096 el servidor consume ~0,7-0,9 GB de RAM.
- GPU recomendadas: cualquier GPU consumer con ≥2 GB de VRAM es suficiente; no se especifican modelos concretos en la información disponible.
- Cabe en GPU consumer: sí, con amplio margen (RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: llama.cpp con endpoint `/v1/systemone` (backend usado en la evaluación); el autor lo sirve desde Unsloth Studio. No se documentan otras opciones (vLLM, Ollama, TGI).
- Latencia y throughput: 437 ms/petición y 2,3 req/s con 4 workers en la evaluación reportada.
- Pico de VRAM durante entrenamiento: 2,91 GB (referencia para reentrenamiento).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión (target) | ECE | Tamaño GGUF | Licencia |
|---|---|---|---|---|---|---|
| Este modelo (0.8B Q4_K_M) | 779,7 M | 4096 | 82,4 % | 0,0543 | 520 MB | other |
| nerozx/qwen3.5-2b-decision-browser-q4 | no disponible | no disponible | 86,9 % | 0,0524 | 1,29 GB | other |

No se dispone de información sobre otros modelos comparables de la misma categoría (cabezas de decisión para agentes de navegador) en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat: no debe usarse con prompts conversacionales; requiere el contrato `state` + `questions`.
- Envelope estricto: máximo 10 opciones por pregunta (+ `none`). Con 41-53 opciones la distribución se vuelve no informativa (plana o afilada pero incorrecta).
- Instrucción atómica: solo un paso por consulta y en inglés; los SOP multi-paso corresponden al planificador.
- El campo `Website:` debe contener solo el hostname; una URL completa filtra tokens de tenant/slug que anclan la cabeza a elementos no relacionados.
- No sirve para generar texto libre, escribir valores de campos, juzgar si una tarea está completa, planificar procedimientos ni buscar en un DOM grande (no ordena cientos de elementos).
- Sesgos: no se documentan sesgos específicos en la información disponible; el modelo hereda los del backbone Qwen3.5-0.8B y los del dataset Mind2Web.
- Riesgo de alucinación: el autor recomienda verificar siempre el efecto tras `act` con el siguiente snapshot y no confiar en la intención declarada.
- Licencia `other`: no se especifican los términos exactos de uso comercial; hay que consultar el repo y la atribución CC-BY-4.0 de Mind2Web para los datos derivados.
- Checkpoint detenido al 1,72 de 2 épocas: puede estar ligeramente por debajo de su techo de rendimiento.
- Idioma: solo inglés; no se garantiza comportamiento en castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nerozx/qwen3.5-0.8b-decision-browser-q4
- Modelo hermano de 2 B: https://huggingface.co/nerozx/qwen3.5-2b-decision-browser-q4
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Contrato de herramientas referenciado: `TOOLS_CONTRACT.md` en `nifira-agent/decision-tools` (no se proporciona URL directa)
- Dataset Mind2Web (CC-BY-4.0): no se proporciona URL directa en la información disponible
