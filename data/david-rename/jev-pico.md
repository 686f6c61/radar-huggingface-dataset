# david-rename/jev-pico

## Resumen

jev-pico es un adaptador LoRA de bajo rango sobre el modelo base Qwen/Qwen3-0.6B, publicado por el usuario david-rename. No es un modelo generativo al uso: se trata de un modelo de decisión que responde a preguntas tipadas sobre un estado textual (una premisa, un comentario, una reseña) devolviendo una distribución de probabilidad sobre las opciones de cada pregunta. La respuesta no se genera como texto, sino que se lee directamente de las probabilidades del siguiente token en la posición de respuesta de cada pregunta, de modo que cada cuestión se evalúa de forma independiente y el orden de las preguntas no altera el resultado.

El adaptador tiene rango 16 sobre las 7 capas lineales de cada bloque del transformer, lo que supone unos 10 millones de pesos entrenados (40 MB en safetensors). El modelo base Qwen3-0.6B aporta la arquitectura transformer subyacente y la ventana de contexto, aunque el estado de entrada se trunca a 256 tokens, tal como se hizo durante el entrenamiento. El repositorio incluye además una versión ONNX con pesos en 8 bits (656 MB) y una versión fusionada en 16 bits (1,2 GB).

Su relevancia es acotada pero específica: cubre la necesidad de un clasificador calibrado, ligero y determinista para tareas de anotación estructurada (NLI, puntuaciones tipo Likert, detección de toxicidad) que pueda servirse en CPU con latencias de milisegundos y sin generación de texto libre. La licencia no está declarada en la información disponible, lo que constituye una limitación importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B) con adaptadores LoRA de rango 16 sobre las 7 capas lineales de cada bloque |
| Parametros totales | No disponible (modelo base Qwen3-0.6B más ~10 millones de pesos del adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Estado de entrada truncado a 256 tokens (en entrenamiento y en inferencia) |
| Tipos de cuantizacion | 8 bits (ONNX, 656 MB), 4 bits (ONNX, 436 MB, con deriva media de 0,044), 16 bits (modelo fusionado, 1,2 GB), 32 bits (adaptadores sobre base) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT), ONNX (modelo completo cuantizado), modelo fusionado en safetensors 16 bits |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only, y le superpone adaptadores LoRA de rango 16 en las siete capas lineales de cada bloque. El adaptador entrena aproximadamente 10 millones de pesos. La innovación no está en la arquitectura, sino en el protocolo de inferencia: se construye una petición con un estado y una lista de preguntas tipadas (`noul` para sí/no, `choice` para 2-5 opciones, `score` para niveles de un token), se aplica una máscara para que cada pregunta lea únicamente el estado y a sí misma, y se leen las probabilidades del siguiente token en la posición de respuesta de cada pregunta. Esto garantiza independencia entre preguntas y orden irrelevante.

El entrenamiento se realizó durante 1.000 pasos con la función de pérdida logarítmica (log score) sobre tres tipos de caso: comentarios de Civil Comments con las valoraciones de sus anotadores, inferencias de ChaosNLI con lo que vieron 100 lectores, y reseñas de Yelp con sus estrellas. No se menciona RLHF ni DPO. ChaosNLI tiene licencia CC BY-NC, lo que puede condicionar la licencia final del adaptador. La versión ONNX en 8 bits se validó sobre 520 preguntas de 280 casos reservados, con una desviación media de 0,003 respecto al modelo completo (0,011 para el percentil 95) y puntuaciones idénticas.

## Capacidades

- Clasificación binaria sí/no sobre un estado textual mediante preguntas de tipo `noul`.
- Elección entre 2 y 5 opciones con probabilidad por opción mediante preguntas de tipo `choice`.
- Puntuación ordinal sobre niveles de un token (dígitos, por ejemplo) mediante preguntas de tipo `score`.
- Inferencia de relaciones NLI (entailment, neutral, contradiction) con distribución calibrada.
- Detección de toxicidad y valoración de comentarios (entrenado con Civil Comments).
- Predicción de valoraciones tipo estrella (entrenado con Yelp).
- Respuesta en una sola pasada, sin generación de texto libre.
- Independencia entre preguntas: el orden no altera las probabilidades.
- Servicio HTTP con endpoint `/v1/decisions` (límite de 64 KB y 16 preguntas por petición).
- Carga en Python mediante `jev_pico.load()` y `jev_pico.ask()`, o vía PEFT con `PeftModel.from_pretrained`.
- Ejecución en CPU sin PyTorch mediante ONNX Runtime.

## Casos de uso

- Moderación de comentarios: enviar cada comentario como estado y preguntar por toxicidad o gravedad con `noul` o `score`, obteniendo probabilidades calibradas para fijar umbrales de revisión humana.
- Anotación de datasets de NLI: clasificar pares premisa-hipótesis en entailment, neutral o contradiction con distribución de probabilidad, útil para medir acuerdo entre anotadores o filtrar datos de entrenamiento.
- Análisis de reseñas de producto: predecir la puntuación por estrellas (1-5) a partir del texto con `score`, agregando después las distribuciones para estimar la valoración esperada.
- Enrutado de tickets de soporte: plantear varias preguntas independientes sobre el mismo ticket (urgencia, categoría, sentimiento) en una sola petición, aprovechando que el orden no importa y que la latencia es de ~30 ms en GPU.
- Etiquetado a gran escala en CPU: servir la versión ONNX en 8 bits en máquinas sin GPU para procesar lotes de clasificación con un coste de ~0,5 s por petición en dos núcleos.
- Evaluación de calidad de respuestas generadas: usar preguntas `score` para puntuar coherencia o relevancia de textos producidos por otros modelos, con la ventaja de que las probabilidades son comparables entre ítems.
- Investigación en calibración: el modelo expone directamente distribuciones de probabilidad, lo que facilita estudios de calibración y de acuerdo inter-anotador sin necesidad de post-procesar texto generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de fidelidad de la cuantización frente al modelo completo:

| Comparación | Desviación media en probabilidad | Percentil 95 |
|---|---|---|
| ONNX 8 bits vs. modelo completo (32 bits) | 0,003 | 0,011 |
| ONNX 4 bits vs. modelo completo (32 bits) | 0,044 | No disponible |
| Modelo fusionado 16 bits vs. adaptadores en 32 bits | 0,001 | No disponible |
| GPU (16 bits) vs. laboratorio (32 bits) | ~0,01 | No disponible |

Latencia declarada: ~30 ms por petición (1 estado y varias preguntas) en GPU; ~0,5 s en los 2 núcleos de CPU del Space. Una petición de ejemplo procesó 106 tokens en 30,4 ms.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3-0.6B en 16 bits ocupa del orden de 1,2 GB; con los adaptadores en 32 bits, algo más. La versión fusionada en 16 bits son 1,2 GB en disco.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier RTX con 4 GB o más, aunque no se confirma en la documentación.
- Despliegue: servidor propio incluido (`serve.py`, solo biblioteca estándar), ONNX Runtime para CPU sin PyTorch, PEFT + Transformers para los adaptadores, y modelo fusionado vía `AutoModelForCausalLM`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: ~30 ms en GPU y ~0,5 s en 2 núcleos de CPU por petición típica.
- El Space público duerme y tarda ~1 minuto en despertar.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas con otros modelos de decisión o clasificadores calibrados en la información proporcionada. Como referencia estructural, el modelo se apoya en Qwen3-0.6B, pero no se ofrecen métricas comparativas frente a alternativas como DeBERTa o clasificadores NLI dedicados.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| jev-pico | Base 0.6B + ~10M adaptador | 256 tokens de estado | No disponible | safetensors, ONNX |
| Qwen3-0.6B (base) | 0.6B | No disponible en esta ficha | No disponible | safetensors |
| Alternativas de clasificación calibrada | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor; además, el entrenamiento usa ChaosNLI, con licencia CC BY-NC, lo que puede restringir el uso comercial.
- Solo inglés: no hay soporte multilingüe declarado.
- Contexto limitado a 256 tokens de estado, truncado como en entrenamiento; estados más largos pierden información.
- No genera texto: cualquier uso que requiera explicaciones o respuestas abiertas queda fuera de su alcance.
- Riesgo de alucinación estructural bajo, pero las probabilidades pueden estar mal calibradas en dominios distintos a los de entrenamiento (Civil Comments, ChaosNLI, Yelp).
- En GPU la aritmética es de 16 bits y las probabilidades pueden diferir ~0,01 respecto al laboratorio; para reproducibilidad exacta usar CPU en 32 bits.
- El servidor incluido no tiene autenticación y escucha en 127.0.0.1 por defecto; exponerlo requiere configuración adicional.
- Límites del servidor: 64 KB y 16 preguntas por petición.
- Sesgos heredados de los datasets de entrenamiento (comentarios de Civil Comments, reseñas de Yelp), no cuantificados en la documentación.
- El Space público tiene arranque en frío de ~1 minuto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/david-rename/jev-pico
- Space de demostración: https://huggingface.co/spaces/david-rename/jev-pico
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Artículo del autor: https://dwood.ai/tuning-the-piano
- Repositorio del laboratorio: https://github.com/d-/jev-pp
