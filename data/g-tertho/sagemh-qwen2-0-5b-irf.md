# g-tertho/sagemh-qwen2-0.5b-irf

## Resumen

SAGEMH Qwen2-0.5B IRF es un modelo de lenguaje afinado para una tarea muy concreta: la clasificación binaria de riesgo de "thwarted belongingness" (pertenencia frustrada, un constructo psicológico asociado al riesgo suicida) en publicaciones de redes sociales en inglés. Lo desarrolla el autor identificado en Hugging Face como g-tertho (Tertho Ghosh, según la citación de la tesis SAGEMH) y deriva del modelo base Qwen/Qwen2-0.5B mediante un ajuste LoRA de rango 16 que después se fusionó con los pesos originales y se guardó en float16.

El modelo no es un asistente generalista: es un clasificador especializado que recibe un texto y devuelve una etiqueta `Yes` o `No` seguida de una breve justificación generada. Su relevancia es acotada pero clara para investigación en salud mental computacional: ofrece un artefacto reproducible (semilla 42, métricas publicadas sobre un conjunto de test de 2.113 filas) que demuestra que un modelo de 494 millones de parámetros puede alcanzar un F1 ponderado del 78,33 % en esta tarea.

Arquitectura transformer decoder-only de Qwen2, 494.032.768 parámetros totales, licencia Apache-2.0 y un único idioma declarado (inglés). El repositorio ocupa 1,0 GB y no registra descargas ni "likes" en el momento de la consulta, lo que indica que es un artefacto de investigación recién publicado y sin adopción comunitaria verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la longitud de corte usada en entrenamiento fue de 512 tokens) |
| Tipos de cuantizacion | no se han publicado cuantizaciones especificas; los pesos se distribuyen en float16 y son compatibles con cuantizacion estandar de transformers/llama.cpp (no verificada por el autor) |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float16), libreria transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2-0.5B, un transformer decoder-only denso de 494 millones de parámetros. Sobre él se aplicó un adaptador LoRA de rango 16, alpha 32 y dropout 0,05 en todas las proyecciones lineales. El adaptador se fusionó posteriormente con los pesos base y el resultado se guardó en float16, de modo que el repositorio contiene un modelo completo listo para inferencia sin necesidad de cargar el adaptador por separado.

El entrenamiento se realizó sobre la partición binaria del conjunto IRF (publicaciones de redes sociales en inglés), durante 5 épocas, con tasa de aprendizaje 2e-4, scheduler coseno, batch efectivo 16 (4 x 4), precisión bf16, semilla 42 y longitud de corte de 512 tokens. Se reservó un 5 % de la partición de entrenamiento para validación y se usó la época final sin early stopping. El conjunto de test tiene 2.113 ejemplos con semilla de partición 42. No se documentan en la información disponible fases de RLHF, DPO ni instrucción general; se trata de un ajuste supervisado específico de la tarea.

## Capacidades

- Clasificación binaria de riesgo de pertenencia frustrada en textos de redes sociales en inglés, con salida `Yes`/`No`.
- Generación de una justificación breve tras la etiqueta (rationale no verificado).
- Formato conversacional mediante la plantilla de chat de Qwen2 (`apply_chat_template`).
- Inferencia determinista recomendada con decodificación greedy (`do_sample=False`) y un máximo de 64 tokens nuevos.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe: no disponible; solo inglés declarado.

## Casos de uso

- Investigación en salud mental computacional: el modelo sirve como línea base reproducible para experimentos sobre detección de pertenencia frustrada, con métricas publicadas y semilla fija que permiten replicar resultados.
- Etiquetado asistido de corpus: se puede usar para preanotar grandes volúmenes de publicaciones en inglés y reducir el coste de anotación humana, revisando después las etiquetas con anotadores expertos.
- Filtrado previo en pipelines de moderación comunitaria: como primer cribado de bajo coste (494 M de parámetros) para marcar mensajes que requieran revisión humana, nunca para decisiones automáticas.
- Comparación de arquitecturas en tesis y artículos: al ser un modelo pequeño y abierto, facilita experimentos controlados frente a modelos mayores en la misma tarea de clasificación.
- Despliegue en hardware modesto para demos de investigación: su tamaño permite ejecutarlo en una GPU de consumo o incluso en CPU para prototipos, con la latencia correspondiente.
- Validación de metodologías de ajuste LoRA: el repositorio documenta rango, alpha, dropout y esquema de entrenamiento, lo que lo convierte en un ejemplo útil para estudiar la fusión de adaptadores y su impacto en las predicciones (diferencia de 5 filas sobre 2.113 respecto al modelo congelado de la tesis).

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test (n = 2.113), decodificación greedy, máximo 64 tokens nuevos y plantilla de chat de Qwen2:

| Metrica | Valor |
|---|---|
| F1 ponderado (weighted F1) | 78,33 |
| F1 macro (macro F1) | 76,41 |
| Exactitud balanceada (balanced accuracy) | 76,67 |
| Exactitud (accuracy) | 78,23 |
| MCC | 0,5286 |

El autor indica que el modelo fusionado difiere de las predicciones congeladas de la tesis en 5 de 2.113 filas (F1 ponderado 78,33 aquí frente a 78,18 en la tesis), atribuido a redondeo en float16 y al procesamiento por lotes. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 1 GB para los pesos (494 M de parámetros x 2 bytes) más overhead de activaciones y caché KV; en la práctica cabe holgadamente en GPUs con 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funcionan RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema. El modelo está sobredimensionado para estas GPUs, por lo que el cuello de botella será el throughput, no la memoria.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer actuales e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (el repositorio está etiquetado como compatible con endpoints), y previsiblemente llama.cpp/Ollama tras conversión a GGUF, aunque el autor no publica artefactos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAGEMH Qwen2-0.5B IRF | 494 M | no disponible | Clasificacion binaria de pertenencia frustrada | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2-0.5B (base) | 494 M | no disponible en la informacion | Generacion de texto general | Apache-2.0 | Hugging Face, ampliamente adoptado |
| Qwen2-0.5B-Instruct | 494 M | no disponible en la informacion | Instrucciones generales | Apache-2.0 | Hugging Face, ampliamente adoptado |

La comparación relevante es con el modelo base: SAGEMH IRF es un ajuste especializado del mismo, por lo que hereda su tamaño y licencia pero no sus capacidades generales de conversación ni de instrucción. No se dispone de datos de benchmarks de alternativas especializadas en esta misma tarea dentro de la información proporcionada.

## Limitaciones y advertencias

- El rationale generado tras la etiqueta no está verificado; no debe interpretarse como explicación clínica fiable.
- Entrenado exclusivamente con texto de redes sociales en inglés; no se garantiza su transferencia a texto clínico ni a otros idiomas.
- No es una herramienta diagnóstica; cualquier uso en contextos de salud mental debe acompañarse de supervisión profesional.
- Riesgo de alucinación en la justificación generada, aunque la etiqueta sea el componente principal de la tarea.
- Sesgos potenciales heredados del corpus IRF y del modelo base Qwen2; no se documentan análisis de sesgo en la información disponible.
- Los datos de entrenamiento no se redistribuyen y su uso queda sujeto a los términos originales del conjunto IRF, lo que puede condicionar la reproducibilidad completa.
- Licencia Apache-2.0 permite uso comercial del modelo, pero la naturaleza sensible de la tarea y la falta de validación externa desaconsejan su uso en producción sin evaluación independiente.
- Sin descargas ni validación comunitaria en el momento de la consulta; es un artefacto de investigación, no un modelo probado en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-tertho/sagemh-qwen2-0.5b-irf
- Modelo base: https://huggingface.co/Qwen/Qwen2-0.5B
- Citación de la tesis: Ghosh, Tertho y Sweety, Fahmida (2026), "SAGEMH: A Retrieval-Grounded, Ensembled Framework for Mental Health Classification from Social Media Text Data with Small Language Models" (sin enlace directo disponible en la información proporcionada).
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
