# seongyeon1/dlm-jev-tickets-lora

## Resumen

dlm-jev-tickets-lora es un adaptador LoRA publicado por el usuario seongyeon1 sobre el modelo de lenguaje de difusión DiffusionGemma 26B-A4B en su versión cuantizada a 4 bits para MLX (mlx-community/diffusiongemma-26B-A4B-it-4bit). No es un modelo completo, sino un adaptador de 2,8 millones de parámetros que enseña al modelo base una política concreta de triaje de tickets de soporte al cliente en coreano, respondiendo a cuatro preguntas tipadas en una única pasada del decoder.

El adaptador forma parte del proyecto dlm-jev, una implementación de un motor de decisiones tipadas al estilo "Jev" construido sobre el modelo de difusión de Gemma. Conviene aclarar que "Jev" aquí describe únicamente el estilo de interfaz y que el autor declara no estar afiliado a TypeSafe AI ni al modelo propietario Jev. La relevancia de esta ficha es acotada: se trata de un adaptador experimental, con cero descargas y cero likes en el momento de la consulta, orientado a demostrar que un LoRA de rango 8 puede transferir una política de decisión sobre el vocabulario de entrenamiento a formulaciones no vistas.

El modelo resuelve una tarea muy concreta: clasificar tickets en una categoría, estimar urgencia, detectar intención de abandono y decidir si requiere intervención de ingeniería. Todo el entrenamiento se hizo con datos 100% sintéticos generados con semilla 7, sin datos reales de clientes, lo que limita su validez fuera del dominio sintético pero también evita problemas de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de difusion (DLM) en el modelo base; el adaptador es un LoRA aplicado a las proyecciones de atencion `q_proj` y `v_proj` del decoder |
| Parametros totales | Modelo base: 26B (segun nomenclatura del nombre `diffusiongemma-26B`). Adaptador LoRA: 2,8M parametros |
| Parametros activos | 4B en el modelo base (nomenclatura `A4B`, indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo base se distribuye en 4-bit para MLX; el adaptador se entrega en safetensors sin cuantizar de forma independiente |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 (misma que el modelo base) |
| Formato de pesos | safetensors (adaptador LoRA, `tickets-lora.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre DiffusionGemma 26B-A4B, un modelo de difusión con atención de tipo transformer y arquitectura MoE con 4B parámetros activos, en su variante instruida y cuantizada a 4 bits para ejecución en MLX. El LoRA modifica exclusivamente las proyecciones `q_proj` y `v_proj` de la atención del decoder (el encoder reutiliza las mismas capas), con rango 8, escala 20 y 2,8M parámetros entrenables.

El entrenamiento fue deliberadamente ligero: optimizador Adam, learning rate 5e-5, 400 tickets sintéticos, una sola época y batch de tamaño 1, completado en aproximadamente 18 minutos en un Apple M4 Pro con 48 GB de memoria unificada y un pico de 17,5 GB. La función de pérdida es la entropía cruzada de la distribución restringida a las etiquetas válidas en cada slot de respuesta, es decir, una regla de puntuación propia (proper scoring rule) calculada exactamente sobre la distribución que sirve el lector; la caché del encoder se calcula fuera del grafo de gradiente. Los datos proceden íntegramente del generador sintético `dlm_jev.synth` (semilla 7): primero se muestrean los atributos del ticket y después se derivan las etiquetas, de modo que la verdad de referencia es exacta, con texto generado a partir de bancos de frases en coreano.

## Capacidades

- Clasificación estructurada de tickets de soporte en cuatro preguntas tipadas resueltas en una sola pasada del decoder.
- Pregunta `category` de tipo elección, con seis etiquetas: 결제·청구, 버그, 계정 접근, 기능 요청, 사용 방법 y 서비스 장애.
- Pregunta `urgency` de tipo puntuación, con cuatro niveles: 낮음, 보통, 높음 y 긴급.
- Pregunta `churn` de tipo booleano ("noul"), que indica si el cliente manifiesta intención de cancelar o abandonar.
- Pregunta `engineering` de tipo booleano ("noul"), que indica si el caso requiere una corrección de código o de infraestructura (limitado a errores y caídas de servicio).
- Capacidad multilingüe: únicamente coreano.
- Decodificación en una sola pasada, con decisiones tipadas en lugar de texto libre.
- No se documenta soporte de tool calling, function calling, uso como agente ni razonamiento multi-paso.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Triaje automatico de tickets de soporte: el motor lee el texto del ticket en coreano y devuelve de una sola pasada la categoría, la urgencia, el riesgo de abandono y la necesidad de ingeniería, lo que permite enrutar el ticket al equipo correcto sin reglas manuales.
- Priorizacion de colas de atencion: usando la etiqueta `urgency` (낮음, 보통, 높음, 긴급) se puede reordenar dinámicamente la cola de atención al cliente de modo que los casos 긴급 se asignen primero a agentes sénior.
- Deteccion de riesgo de churn: la pregunta `churn` marca los tickets en los que el cliente declara intención de cancelar, lo que permite disparar flujos de retención (por ejemplo, contacto proactivo o descuentos) antes de que el abandono se materialice.
- Encaminamiento a ingenieria: la pregunta `engineering` separa los problemas que requieren una corrección de código o infraestructura (errores y caídas) del resto, lo que evita que bugs y outages se queden atrapados en soporte de primer nivel.
- Etiquetado y auditoria retrospectiva: el adaptador puede ejecutarse sobre tickets históricos para generar etiquetas de categoría y urgencia que sirvan como base de un conjunto de evaluación interno o como señal débil para otros modelos.
- Clasificacion por lotes en pipelines internos: dado que la decodificación se resuelve en una única pasada y el modelo base es 4-bit sobre MLX, es viable integrarlo en un proceso diario que consuma el backlog completo de tickets en un Apple Silicon con memoria unificada.
- Clasificacion fuera de dominio con cautela: las pruebas del autor muestran transferencia parcial a SST-2 y AG News, aunque con degradación en Yelp, por lo que solo es razonable usarlo fuera del dominio de forma experimental y con validación propia.

## Benchmarks y rendimiento

Conjunto de test del mismo generador (300 tickets, semilla disjunta):

| Pregunta | Base | + LoRA |
|---|---|---|
| category | 0.930 | 1.000 |
| urgency | 0.787 | 0.890 |
| churn | 1.000 | 1.000 |
| engineering | 0.950 | 1.000 |

Conjunto con cambio de distribución (300 tickets, misma política, ninguna formulación de entrenamiento):

| Pregunta | Base | + LoRA | Aciertos solo base / solo LoRA | p de McNemar |
|---|---|---|---|---|
| urgency | 0.757 | 0.853 | 11 / 40 | <0.001 |
| engineering | 0.953 | 0.997 | 1 / 14 | 0.001 |
| category | 0.953 | 0.920 | 19 / 9 | 0.09 |
| churn | 1.000 | 0.997 | 1 / 0 | 1.0 |

Olvido fuera de dominio (100 elementos por tarea, sin test de significación): SST-2 0.93 → 0.94, AG News 0.79 → 0.75, Yelp 0.50 → 0.45.

## Requisitos de hardware

- Entrenamiento del LoRA: completado en un Apple M4 Pro con 48 GB de memoria unificada, con un pico de 17,5 GB y una duración aproximada de 18 minutos para 400 tickets, una época y batch 1.
- Inferencia: se ejecuta mediante MLX sobre Apple Silicon; el modelo base DiffusionGemma 26B-A4B en 4-bit es el que determina el consumo real. No se dispone de cifras exactas de VRAM para inferencia.
- Compatibilidad con GPU de consumo: no disponible; el stack documentado es MLX y `mlx-vlm` 0.7.4, probado con `mlx-vlm` en esa versión concreta.
- Opciones de despliegue: el proyecto dlm-jev expone `dlm-jev-serve` (DLM_JEV_ADAPTER apuntando al safetensors); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en el dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dlm-jev-tickets-lora (este adaptador) | 2,8M (adaptador); 26B/4B activos en el base | no disponible | urgency 0.853, engineering 0.997, category 0.920, churn 0.997 en el conjunto con cambio de distribucion | Apache-2.0 | HuggingFace, 0 descargas |
| diffusiongemma-26B-A4B-it-4bit (modelo base) | 26B totales, 4B activos | no disponible | urgency 0.757, engineering 0.953, category 0.953, churn 1.000 en el mismo conjunto | Apache-2.0 (segun el adaptador) | HuggingFace |
| Jev (TypeSafe AI) | no disponible | 66k segun LLM Reference | no disponible | propietaria | acceso anticipado limitado y API de pago |

No se dispone de datos publicados que permitan comparar este adaptador con otras alternativas de la misma categoria y tamano mas alla del modelo base.

## Limitaciones y advertencias

- La formulacion sintetica es mas estrecha que la de tickets reales; el propio autor recomienda validar con tickets etiquetados propios antes de depender del adaptador.
- El conjunto de test del mismo generador puede reflejar memorizacion de plantillas; la estimacion mas fiable es la del conjunto con cambio de distribucion.
- La categoria empeora ligeramente con el LoRA en el conjunto con cambio de distribucion (0.953 → 0.920), con una deriva hacia las plantillas de entrenamiento.
- Se observa olvido fuera de dominio (AG News 0.79 → 0.75; Yelp 0.50 → 0.45) en pruebas sin test de significacion.
- El adaptador esta entrenado exclusivamente en coreano y con las cuatro preguntas de `dlm_jev.synth.QUESTIONS`; el texto de la politica vive en las instrucciones de esas preguntas, por lo que hay que reutilizarlas tal cual.
- Las temperaturas de calibracion del modelo base no son validas para el adaptador; hay que recalibrarlas sobre sus propias lecturas.
- Se probo con `mlx-vlm` 0.7.4, que aplica los envoltorios LoRA a la clase del modelo DiffusionGemma en esa version; otras versiones pueden no cargar correctamente.
- Emplea datos 100% sinteticos, por lo que no hay sesgos derivados de datos reales de clientes, pero tampoco cobertura de la diversidad real del dominio.
- Licencia Apache-2.0, sin restricciones adicionales conocidas para uso comercial mas alla de las del modelo base.
- El modelo no esta afiliado a TypeSafe AI ni al producto Jev; "Jev" describe solo el estilo de interfaz.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/seongyeon1/dlm-jev-tickets-lora
- Modelo base: https://huggingface.co/mlx-community/diffusiongemma-26B-A4B-it-4bit
- Repositorio del proyecto dlm-jev: https://github.com/seongyeon1/dlm-jev
- Jev (AI model), Wikipedia: https://en.wikipedia.org/wiki/Jev_(AI_model)
- Repositorio de Jev AI: https://github.com/jev-ai/jev-ai
- Guia de uso del modelo Jev AI, blog de Hugging Face: https://huggingface.co/blog/sora-2/how-to-use-the-jev-ai-model-a-step-by-step-develop
- Playground y API de Jev AI Model: https://jevaimodel.net/
- Jev en LLM Reference: https://www.llmreference.com/model/jev
