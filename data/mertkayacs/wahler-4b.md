# mertkayacs/Wahler-4B

## Resumen

Wähler-4B es un modelo de decisión de 4B parámetros (4.539.265.536 según los pesos en safetensors) desarrollado por Eschatia Labs, un laboratorio independiente sin ánimo de lucro, y publicado por el usuario mertkayacs. No es un modelo generativo al uso: recibe un estado (una situación en texto), una pregunta tipada y un conjunto cerrado de opciones, y devuelve una distribución de probabilidad calibrada sobre esas opciones, con la posibilidad de abstenerse mediante una opción `unknown`. Está afinado sobre internlm/Intern-Decision-4B y orientado a tareas de clasificación, enrutamiento y triaje en alemán, con soporte secundario de inglés.

Su relevancia práctica está en el eje "modelos pequeños que corren en local con probabilidades fiables". La model card reporta un 92,0% de precisión en decisiones en alemán sobre un conjunto de test reservado (frente al 81,1% de su competidor directo Kev-4B) y un Brier score de 0,119 frente a 0,298, es decir, no solo acierta más, sino que además sus probabilidades están mejor calibradas. El build cuantizado Q4_K_M ocupa 2,71 GB en disco y alcanza un pico de 3,03 GB de RAM con 4k de contexto, lo que lo sitúa en el rango de despliegue en portátil o en un servidor modesto sin GPU dedicada.

El proyecto se acompaña de una API propia (Jev, con el servidor JevAlt) que preserva el formato de token de decisión y la calibración, builds GGUF, un Space de demostración y un conjunto de datos y benchmark públicos. Existe además un modelo hermano en turco, Karar-4B, dentro de la misma colección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; el tag de transformers es `qwen3_5` y el modelo base es internlm/Intern-Decision-4B (la model card no detalla la composición interna) |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | No aplica (no es un modelo MoE según la informacion disponible) |
| Longitud de contexto | No disponible (la model card solo documenta mediciones de memoria con 4k de contexto) |
| Tipos de cuantizacion | GGUF Q4_K_M, Q5_K_M y Q8_0; pesos completos en safetensors |
| Idiomas soportados | Alemán (de) e inglés (en); se recomienda formular las peticiones en alemán |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos completos, repo de 9,4 GB) y GGUF (Q4_K_M de 2,71 GB) |

## Arquitectura y entrenamiento

Wähler-4B es un fine-tuning de internlm/Intern-Decision-4B, un modelo de decisión de 4B parámetros. El tag de librería `qwen3_5` indica que la implementación expuesta en transformers corresponde a la familia Qwen3.5, aunque el modelo base declarado sea de InternLM; la model card no explicita la composición de capas ni si hay componentes híbridos. El rasgo arquitectónico diferencial no es la red, sino el formato de salida: el modelo está entrenado para emitir un token de decisión asociado a cada opción permitida del esquema de la petición, en lugar de texto libre, y ese formato se preserva tanto en el backend de transformers como en el de llama.cpp del servidor JevAlt.

El entrenamiento se apoya en el dataset mertkayacs/jevalt-data y el modelo declara capacidades de calibración y predicción conforme (conformal prediction) en sus tags. La model card no publica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Sí documenta una métrica de robustez frente a inyección de instrucciones ("planted instruction flips") del 17,5%, frente al 36,0% de Kev-4B, obtenida con instrucciones maliciosas insertadas en el texto de entrada. Un dato importante de trazabilidad: el propio autor advierte que el conjunto de test procede de la misma pipeline de datos que el entrenamiento, lo que limita la interpretación de las cifras.

## Capacidades

- Clasificación y decisión sobre opciones cerradas: devuelve una probabilidad por cada etiqueta permitida, no texto generado.
- Preguntas de sí/no, rankings ordenados de opciones y preguntas de elección múltiple con criterios descritos en la petición.
- Abstención explícita: admite una opción `unknown` con `abstain: true` para casos ambiguos o fuera de dominio.
- Enrutamiento y triaje: asignación de tickets, incidencias o leads a colas predefinidas.
- Salida calibrada: Brier score de 0,119, apto para umbrales de decisión y escalado a humano.
- Robustez parcial frente a inyección de instrucciones en el texto de entrada (17,5% de volteos en la prueba del autor).
- Soporte de modo razonamiento: la petición incluye un campo `reasoning` que la model card muestra desactivado (`"off"`); no se detallan los efectos ni el formato del modo activado.
- Interfaz tipada sobre HTTP (`/v1/systemone`) con validación de esquema, integrable en pipelines.
- Multilingüe limitado: alemán como idioma principal e inglés como secundario; no hay datos de otras lenguas.
- No hay evidencia de capacidades de visión, audio, tool calling ni generación de texto largo; el tag `image-text-to-text` del repo no está respaldado por la model card.

## Casos de uso

- Triaje de tickets de soporte: con un estado en alemán y cuatro colas definidas (facturación, soporte técnico, ventas, cuenta), el modelo devuelve la probabilidad de cada cola; en el ejemplo registrado por el autor asigna 91,8% a "Abrechnung" para una facturación duplicada.
- Priorización de incidencias: decisión entre niveles tipo "crítico" frente a "no crítico" con probabilidad asociada (82,0% en el ejemplo de caída de checkout), útil para disparar alertas solo cuando la confianza supera un umbral.
- Cualificación de leads comerciales: clasificación de contactos entrantes en categorías de temperatura (93,2% en "Heiß" para un lead cualificado), con la probabilidad como señal para ordenar la cola de ventas.
- Aplicación de políticas de devolución: pregunta de sí/no sobre si un caso cumple la ventana de 14 días (95,5% en "Nein" en el ejemplo), con abstención cuando faltan datos del pedido.
- Filtrado de phishing y correo malicioso: clasificación en cuarentena pese a instrucciones insertadas en el cuerpo del mensaje (91,6% en el ejemplo), gracias al entrenamiento contra volteos de instrucción.
- Detección de ambigüedad y escalado a humano: cuando falta un dato clave (por ejemplo, una reserva de hotel sin el detalle de la reserva), el modelo emite `unbekannt` con 96,2%, lo que permite enrutar a revisión manual en lugar de forzar una decisión.
- Despacho en emergencias: asignación de recursos ante incidentes descritos en lenguaje natural (69,2% en "ayudar a apagar" para el incendio de un granero), con la probabilidad como indicador de confianza para el operador.
- Enrutamiento en local con requisitos de privacidad: al ejecutarse con 3,03 GB de RAM en Q4_K_M, puede desplegarse en la propia infraestructura del cliente sin enviar el texto a un servicio externo.

## Benchmarks y rendimiento

| Metrica | Wahler-4B | Kev-4B |
|---|---|---|
| Precision en decisiones alemanas (held-out) | 92,0% | 81,1% |
| Brier score | 0,119 | 0,298 |
| Volteos por instruccion plantada | 17,5% | 36,0% |
| Test en vivo (4 de octubre de 2026) | 122/130 | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores proceden del propio autor, con la advertencia de que el conjunto de test se genera con la misma pipeline que los datos de entrenamiento y que el test en vivo consta de 130 casos.

## Requisitos de hardware

- Inferencia cuantizada Q4_K_M: fichero de 2,71 GB y pico de 3,03 GB de RAM con 4k de contexto; cabe en cualquier portátil con 4 GB de memoria libre.
- Q5_K_M y Q8_0: disponibles en el repo GGUF, con mayor fidelidad a cambio de velocidad y memoria; tamaños concretos no disponibles en la información proporcionada.
- Pesos completos en safetensors: el repo ocupa 9,4 GB; se estima un consumo de VRAM de unos 9-10 GB en bf16 (cálculo aproximado a partir de los 4,54 B de parámetros, no publicado por el autor).
- GPU recomendadas: no documentadas. Por tamaño, una RTX 4090 o A100/H100 sobran para cualquier cuantización; para los pesos completos basta una GPU consumer de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super, RTX 4080).
- Despliegue: llama.cpp mediante el servidor JevAlt (`jevalt serve`), Ollama (`ollama run mertkayacs/wahler-4b`) y backend de transformers (`--backend hf`) para los pesos completos. No hay soporte documentado de vLLM, TGI ni SGLang.
- Latencia y throughput: no disponibles. El modelo emite un único token de decisión, por lo que la latencia vendrá dominada por el prefill del contexto de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision aleman (held-out) | Brier | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Wahler-4B | 4,54 B | No disponible | 92,0% | 0,119 | Apache-2.0 | safetensors + GGUF + Ollama |
| Kev-4B | No disponible | No disponible | 81,1% | 0,298 | No disponible | Referenciado como baseline en la model card |
| Karar-4B | 4 B (según la colección del autor) | No disponible | No aplica (modelo en turco) | No disponible | No disponible | Pesos completos y GGUF, según la colección |

No se dispone de datos de otros modelos comparables de clasificación con probabilidades calibradas en alemán en la información proporcionada.

## Limitaciones y advertencias

- El conjunto de test procede de la misma pipeline de datos que el entrenamiento, según admite el autor; la precisión del 92,0% no equivale a una evaluacion independiente.
- El test en vivo se limita a 130 casos, una muestra pequena para estimar rendimiento en produccion.
- El modelo esta disenado para elegir entre opciones predefinidas: no genera explicaciones, resumenes ni texto libre, y usarlo fuera de ese esquema degrada su comportamiento.
- Idioma: el aleman es el idioma principal; el rendimiento en ingles no esta cuantificado y no hay datos de otras lenguas, incluido el espanol.
- Riesgo de alucinacion acotado por el formato cerrado, pero la calibracion puede desviarse en dominios alejados de los datos de entrenamiento; conviene monitorizar el Brier score en produccion.
- Un 17,5% de volteos ante instrucciones plantadas sigue siendo un riesgo real en entradas no confiables (correo, formularios publicos); no debe ser la unica capa de defensa frente a prompt injection.
- La etiqueta `image-text-to-text` del repo no se corresponde con ninguna capacidad documentada; no asumir vision.
- No hay informacion sobre sesgos demograficos o linguisticos, ni sobre la composicion del dataset de entrenamiento.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; no se detallan restricciones adicionales.
- Proyecto joven y de un solo autor (297 descargas y 2 likes en el momento de la consulta), con soporte y mantenimiento inciertos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mertkayacs/Wahler-4B
- Builds GGUF: https://huggingface.co/mertkayacs/Wahler-4B-GGUF
- Demo en el Space: https://huggingface.co/spaces/mertkayacs/JevAlt
- Pagina del proyecto: https://jevalt.mertkayacs.com/models/wahler-4b/
- Repositorio JevAlt: https://github.com/mertkayacs/jevalt
- Guia de ejecucion local: https://github.com/mertkayacs/jevalt/blob/main/docs/local.md
- Dataset de entrenamiento: https://huggingface.co/datasets/mertkayacs/jevalt-data
- Resultados de benchmark: https://huggingface.co/datasets/mertkayacs/jevalt-bench
- Pagina de benchmarks: https://eschatialabs.com/benchmarks/jevalt-bench/
- Evaluador JevOss: https://github.com/mertkayacs/jevoss
- Ollama: https://ollama.com/mertkayacs/wahler-4b
- Coleccion de modelos turcos y alemanes: https://huggingface.co/collections/mertkayacs/turkish-and-german-ai-models
- Ficha de terceros: https://metatext.io/decision-models/wahler-4b
