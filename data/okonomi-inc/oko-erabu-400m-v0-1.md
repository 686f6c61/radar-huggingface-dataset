# okonomi-inc/Oko-Erabu-400M-v0.1

## Resumen

Oko-Erabu-400M-v0.1 es un modelo de decisión de tipo "System 1" desarrollado por Okonomi. Se trata de un fine-tuning del encoder ModernBERT-large (Answer.AI, LightOn y colaboradores) que, en lugar de generar texto, devuelve probabilidades sobre opciones, decisiones sí/no y puntuaciones ordenadas, además de permitir reordenar candidatos por relevancia. Con 395.881.664 parámetros, contexto de 8.192 tokens y una descarga de aproximadamente 795 MB, está pensado para tareas de clasificación y selección de baja latencia donde no se necesita decodificación autoregresiva.

El modelo aborda un problema concreto: sustituir llamadas a LLM generativos en puntos de decisión estructurados (enrutado, validación, ranking) por un encoder que produce distribuciones de probabilidad calibradas sobre un conjunto de opciones que el usuario define. Al ser un modelo encoder-only, cada pregunta se responde de forma independiente, lo que simplifica el despliegue y reduce el coste computacional frente a un modelo generativo del mismo orden de magnitud.

Su relevancia radica en la combinación de contexto largo (8.192 tokens, inusual en encoders), licencia Apache 2.0 y un formato de "decisiones tipadas" (sí/no, elección múltiple, puntuaciones ordenadas) con cabecera de decisión entrenada específicamente. Es un modelo en inglés, orientado a equipos que quieran integrar decisiones deterministas y auditables en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder-only, transformer bidireccional) con cabecera de decisión |
| Parametros totales | 395.881.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; encoder en BF16, cabecera en FP32) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-large, un encoder transformer bidireccional con atención de contexto largo, y le añade una cabecera de decisión que se aplica sobre la salida del encoder. El checkpoint publicado promedia dos checkpoints de entrenamiento por igual, almacena el encoder en BF16 y la cabecera de decisión en FP32. La inferencia no requiere generación de texto: el modelo procesa el estado y las preguntas tipadas y emite directamente probabilidades.

El fine-tuning cubrió el encoder completo y la cabecera sobre preguntas tipadas, incluyendo preguntas de ciencia de los datasets OpenBookQA y QASC. La model card no detalla el número total de tokens de entrenamiento, la composición completa del dataset ni si se emplearon técnicas de RLHF o DPO; esos datos figuran como no disponibles. Como innovación destacable, el modelo expone una API de decisiones tipadas (`noul` para sí/no, elección múltiple con criterios, puntuaciones ordenadas y `rerank` para reordenar candidatos) que devuelve distribuciones de probabilidad en lugar de texto libre.

## Capacidades

- Decisiones sí/no con probabilidades calibradas (tipo `noul`).
- Elección múltiple entre opciones definidas por el usuario mediante un diccionario `criteria` de identificadores y descripciones.
- Puntuaciones ordenadas sobre una lista ordenada de descripciones.
- Reordenación de candidatos por relevancia mediante `model.rerank(query, candidates)`.
- Procesamiento de contexto largo de hasta 8.192 tokens por pregunta.
- Respuesta independiente por pregunta, sin estado conversacional ni generación de texto.
- Inferencia en CPU, MPS (Apple Silicon) y CUDA.
- Capacidad multilingüe limitada al inglés.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; su función es emitir decisiones puntuales.

## Casos de uso

- Enrutado de tickets o consultas: dado un estado y un conjunto de categorías descritas en `criteria`, el modelo devuelve la distribución de probabilidad sobre cada categoría, lo que permite dirigir cada caso al equipo adecuado sin coste de generación.
- Validación de condiciones en pipelines: con preguntas sí/no sobre un estado estructurado (por ejemplo, `{"order_status": "shipped"}`), se obtiene una probabilidad como la del ejemplo de la model card (`true` 0,9972), útil para compuertas de decisión automatizadas.
- Reordenación de resultados de búsqueda o recuperación: `rerank` puntúa candidatos frente a una consulta, adecuado como etapa de re-ranking en sistemas RAG con contexto de hasta 8.192 tokens.
- Clasificación de documentos largos: el contexto de 8.192 tokens permite evaluar contratos, informes o hilos completos frente a un conjunto de etiquetas predefinidas.
- Moderación o filtrado por criterios: preguntas tipadas sobre si un contenido cumple una política concreta, con probabilidad asociada para fijar umbrales.
- Evaluación automática de respuestas: puntuar opciones ordenadas (por ejemplo, grados de calidad) sobre una respuesta candidata en pipelines de control de calidad.
- Triage en atención al cliente: decidir de forma independiente y de baja latencia si una conversación requiere escalado, con una opción de "evidencia insuficiente" añadida por el integrador.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---:|
| LocalLLaMA/typed-decisions accuracy | 78,35 % |
| Typed-decisions Brier (menor es mejor) | 0,05231 |
| Decision Index 0.3, public score | 30,77 |
| Decision Index 0.3, raw score | 49,00 |
| Typed Decisions, sí/no (2.000 preguntas) | 84,33 % |
| Typed Decisions, elección múltiple (2.000 preguntas) | 76,00 % |
| Typed Decisions, puntuaciones ordenadas (2.000 preguntas) | 75,63 % |

Las mediciones se realizaron en CUDA con BF16 usando el runtime incluido. En las 600 preguntas de elección múltiple, invertir el orden de las opciones preservó la respuesta ganadora en todos los casos. La model card advierte que el entrenamiento cubre varias familias de tareas presentes en estos benchmarks, por lo que los resultados deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 0,8 GB; con encoder en BF16 y cabecera en FP32, la inferencia cabe holgadamente en menos de 2 GB de memoria, aunque la cifra exacta no está publicada.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; la model card valida ejecución en CUDA y MPS. No se especifican modelos concretos como A100 o H100.
- GPU de consumo: sí, cabe en GPUs de consumo y también en CPU; el ejemplo oficial se ejecuta en CPU con resultado reproducible.
- Opciones de despliegue: el paquete `erabu` incluido en el repo (con `Erabu.from_pretrained`), sobre `transformers` y `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Oko-Erabu-400M-v0.1 | 395,9 M | 8.192 | Encoder + cabecera de decisión | Apache 2.0 | Hugging Face |
| ModernBERT-large (base) | no disponible en la información | no disponible en la información | Encoder | no disponible en la información | Hugging Face |
| Modelos de re-ranking tipo cross-encoder | no disponible | no disponible | Encoder | variable | Hugging Face |

No se dispone de datos de benchmarks de alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Las probabilidades describen únicamente las opciones suministradas: si todas son malas, una seguirá ocupando el primer puesto. Se recomienda incluir una opción de "evidencia insuficiente" y calibrar umbrales con ejemplos propios.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- No genera texto ni mantiene conversaciones; no sirve para tareas generativas, tool calling ni razonamiento multi-paso.
- Riesgo de sesgo y alucinación no cuantificado en la información disponible; al ser un clasificador, el "error" se manifiesta como probabilidad mal calibrada sobre opciones, no como texto inventado.
- La model card advierte que el entrenamiento cubre familias de tareas presentes en los benchmarks de evaluación, lo que puede inflar los resultados publicados.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base ModernBERT-large.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, y la versión es v0.1; la madurez y el soporte a largo plazo no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/okonomi-inc/Oko-Erabu-400M-v0.1
- Modelo base ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- Dataset OpenBookQA: https://huggingface.co/datasets/allenai/openbookqa
- Dataset QASC: https://huggingface.co/datasets/allenai/qasc
