# Mercity/decision-model-minicpm5-2b-lora

## Resumen

Decision Model 2B es un adaptador LoRA sobre el modelo base openbmb/MiniCPM5-2B, desarrollado por Mercity, que convierte un LLM generativo en un clasificador calibrado de una sola pasada. Dado un contexto de evidencia, un criterio y una lista de opciones, devuelve una distribución de probabilidad sobre cada opción sin generar texto, aprovechando directamente los logits del siguiente token correspondientes a las letras de opción (A, B, C...). El adaptador tiene rango 32 y alpha 64, aplicado sobre todas las proyecciones de atención y MLP, con un peso de 201 MB.

El modelo resuelve el problema de obtener decisiones rápidas y calibradas en sistemas de enrutamiento, clasificación y agentes, donde generar cadenas de razonamiento completas resulta caro. La innovación clave es el uso dual: el adaptador activado ofrece lectura rápida (un forward pass, unos 20 ms en A100), mientras que desactivarlo recupera intacta la capacidad de razonamiento paso a paso del MiniCPM5-2B original, que el fine-tuning dañaba. Un mecanismo de enrutamiento por margen envía a modo pensamiento las preguntas con baja confianza.

Con 2B parámetros en el modelo base, licencia Apache 2.0 y soporte únicamente en inglés, está orientado a decisiones de elección múltiple, preguntas sí/no y escalas ordenadas. Su relevancia actual reside en la separación limpia entre decisión rápida y razonamiento profundo dentro de un mismo artefacto, algo poco habitual en adaptadores de clasificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama) en el modelo base; adaptador LoRA sobre proyecciones de atención y MLP |
| Parametros totales | 2B (modelo base); adaptador LoRA de 201 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre openbmb/MiniCPM5-2B, un transformer decoder-only con arquitectura Llama. El LoRA tiene rango 32, alpha 64 y se inserta en todas las proyecciones de atención y MLP. El entrenamiento es de tipo readout-only: 42.000 preguntas de decisión sin cadenas de razonamiento, lo que enseña al modelo a mapear evidencia, criterio y opciones directamente a una distribución sobre las letras de opción. La temperatura de calibración por tipo de pregunta se almacena en `calibration.json` y se aplica antes del softmax sobre los logits de las letras.

La decisión de diseño más relevante es no entrenar el razonamiento: el fine-tuning dañaba la capacidad de cadena de pensamiento del base, por lo que el adaptador se desactiva para el modo pensamiento. El enrutamiento usa el margen (diferencia de log-probabilidad entre las dos mejores opciones) para derivar preguntas ambiguas al base sin adaptador, que genera una cadena dentro de `<think>...</think>` y responde con la letra posterior. Los tipos de pregunta soportados son choice (1 de 2 a 26 opciones), yes/no y score (nivel en escala ordenada).

## Capacidades

- Clasificación calibrada de una sola pasada: devuelve probabilidad por opción sin generar texto.
- Preguntas de elección múltiple con entre 2 y 26 opciones.
- Preguntas de sí/no con opciones canónicas (A = verdadero, B = falso).
- Preguntas de puntuación sobre escalas ordenadas (por ejemplo, niveles de riesgo).
- Modo pensamiento mediante desactivación del adaptador, usando el razonamiento nativo del base.
- Enrutamiento por margen para decidir entre respuesta rápida y razonamiento extendido.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes multi-paso como tal; el enrutamiento es de un solo salto.
- Capacidades multilingües limitadas al inglés.
- No dispone de visión ni audio.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia y un criterio de criticidad, el modelo devuelve probabilidades sobre opciones como reembolso, reemplazo o escalado, permitiendo umbrales de confianza para derivar a un humano.
- Moderación y clasificación de riesgo: con una escala ordenada (benigno, bajo, moderado, alto), el modelo puntúa acciones o contenidos en una sola pasada, adecuado para filtros de baja latencia.
- Verificación de presupuestos y reglas de negocio: el ejemplo de la model card evalúa si un pedido encaja en un límite de gasto mediante pregunta sí/no calibrada.
- Triaje en pipelines de agentes: el margen de la lectura rápida permite decidir qué consultas requieren razonamiento completo y cuáles se resuelven en 20 ms, reduciendo coste computacional.
- Clasificación de intenciones en asistentes conversacionales: elección entre un conjunto acotado de intenciones con probabilidades utilizables para desambiguación.
- Evaluación automática con incertidumbre: en tareas tipo PubMedQA o Banking77, las probabilidades calibradas permiten seleccionar casos para revisión humana según confianza.
- Control de calidad en generación: usar la puntuación ordenada para etiquetar respuestas candidatas por calidad antes de publicarlas.

## Benchmarks y rendimiento

| Metrica | MiniCPM5-2B sin entrenar | Adaptador (rápido) + base (pensamiento) |
|---|---|---|
| Precisión lectura rápida | 50,2% | 66,0% |
| Precisión modo pensamiento (adaptador off) | 79,4% | 79,4% |
| Enrutado: 30% a pensamiento | no disponible | 75,6% con 253 tokens de pensamiento/pregunta |
| Enrutado: 50% a pensamiento | no disponible | 78,0% con 411 tokens de pensamiento/pregunta |
| S1MB Task Avg, lectura rápida (137 tareas) | 18,1 | 37,3 |

Datos adicionales de la model card:

- Con el adaptador activado durante el pensamiento, la precisión cae al 70,8%; entrenar sobre cadenas del 4B la deja en 71,7%.
- En Jevals (suite 0.1.0, Decision Score): 44,6 en PubMedQA, 53,9 en Banking77 y -0,4 en HelpSteer2.
- Entre modelos publicados de ~2B en S1MB, solo KnowLine-2B-Gen1 (44,8) y unee-2b (44,4) superan el Task Avg de 37,3.
- El conjunto de evaluación tiene 5.442 preguntas de cuatro fuentes; los números de pensamiento y enrutado usan un subconjunto fijo de 1.498.

## Requisitos de hardware

- VRAM estimada: el base de 2B en bfloat16 ocupa aproximadamente 4-5 GB; el adaptador añade unos 0,2 GB. En cuantización de 8 bits o 4 bits no se han publicado cifras específicas.
- GPU recomendadas: A100 para la latencia declarada de ~20 ms por forward pass; H100 y GPUs de datacenter equivalentes son adecuadas.
- Cabe en GPU de consumo: sí, un base de 2B en bfloat16 entra en RTX 4090, RTX 3090 y GPUs con 8 GB o más; en cuantización podría caber en 6 GB, aunque no hay datos publicados.
- Despliegue: transformers + peft + accelerate según la model card; vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador.
- Latencia y throughput: ~20 ms por lectura rápida en A100 según el autor; el modo pensamiento consume hasta 8.192 tokens nuevos con temperatura 1,0, top_p 0,95 y top_k 0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision Model 2B (este) | 2B + LoRA | no disponible | Clasificación calibrada + enrutamiento | Apache 2.0 | Hugging Face |
| Mercity/decision-model-qwen3.5-4b | 4B + LoRA | no disponible | Igual, hermano mayor más preciso | no disponible | Hugging Face |
| KnowLine-2B-Gen1 | ~2B | no disponible | Generación general | no disponible | no disponible |
| unee-2b | ~2B | no disponible | Generación general | no disponible | no disponible |

Los dos últimos se citan únicamente por su Task Avg en S1MB (44,8 y 44,4 frente a 37,3), no por comparación funcional. No se dispone de datos de contexto ni licencia para ellos en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe declarado.
- El fine-tuning degrada el razonamiento del base; es imprescindible desactivar el adaptador para el modo pensamiento.
- El formato de prompt es fijo y crítico: usar `decision.py` del repositorio para construirlo; desviarse puede invalidar las probabilidades.
- La calibración depende de `calibration.json` y de la temperatura por tipo de pregunta; sin ella las probabilidades no son fiables.
- Rendimiento bajo en HelpSteer2 (Decision Score -0,4), lo que sugiere poca adecuación a ese tipo de tareas.
- Riesgo de alucinación reducido al no generar texto en modo rápido, pero el modo pensamiento hereda los sesgos y errores del base.
- Si la cadena de pensamiento no termina en 8.192 tokens, el sistema recurre a la respuesta rápida, que puede ser menos precisa.
- No hay datos publicados sobre cuantización, contexto máximo ni sesgos específicos.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base openbmb/MiniCPM5-2B.

## Enlaces

- Hugging Face: https://huggingface.co/Mercity/decision-model-minicpm5-2b-lora
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Hermano mayor: https://huggingface.co/Mercity/decision-model-qwen3.5-4b
- Blog de Mercity: https://www.mercity.ai/blog-post/how-to-train-your-own-decision-model/
- Dataset S1MB: https://huggingface.co/datasets/hotchpotch/S1MB-english-v1
- Jevals: https://jevals.com
