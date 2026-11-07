# DominicTWHV/Horizon-1-Text-Large-WSP

## Resumen

Horizon-1-Text-Large-WSP es una variante editada por pesos del modelo de clasificación de texto Horizon-1-Text-Large, desarrollado por el usuario DominicTWHV. Se trata de un encoder ModernBERT de 395.838.471 parámetros (aproximadamente 396 M) afinado para moderación de contenido, con siete etiquetas de salida: violencia, acoso, genocidio, discurso de odio, estafa, toxicidad y obscenidad. La variante WSP (Weight Space Programming) aplica una edición manual de solo 3.849 parámetros, el 0,001 % del total, exclusivamente en la capa clasificadora final, sin reentrenamiento ni nuevos datos.

El problema que aborda es un sesgo documentado del modelo base: el clasificador disparaba las etiquetas de violencia, acoso y genocidio ante frases inocuas que simplemente mencionaban un grupo identitario. Según la model card, el 98,9 % de las afirmaciones positivas sobre un grupo en HateCheck y el 81 % de las neutras se marcaban como tóxicas con los umbrales originales. Subir los umbrales no resolvía el problema porque esas frases puntuaban más alto que contenido genuinamente dañino.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de edición de pesos en el espacio de direcciones (weight editing) aplicada a mitigación de sesgo; por otro, advierte de que el autor no ha validado el modelo para producción y señala que la manipulación directa de pesos puede producir salidas artefactadas. El modelo solo declara soporte para inglés y hereda la restricción no comercial del modelo base por la presencia de `lmsys/toxic-chat` (CC-BY-NC-4.0) en su mezcla de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), con cabeza de clasificación lineal de 7 etiquetas |
| Parametros totales | 395.838.471 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 declarada, con restricción no comercial heredada del modelo base por `lmsys/toxic-chat` (CC-BY-NC-4.0) |
| Formato de pesos | safetensors; incluye `directions.npy` y `edit_spec.json` con los vectores de dirección y los parámetros exactos de la edición |
| Pipeline | text-classification |
| Etiquetas de salida | violence, harassment, genocide, hate_speech, scam, toxicity, obscenity |
| Tamano del repo | 0,8 GB |
| Modelo base | DominicTWHV/Horizon-1-Text-Large |

## Arquitectura y entrenamiento

El modelo base es un encoder ModernBERT afinado para clasificación multietiqueta de contenido dañino. La variante WSP no reentrena: aplica una edición de pesos manual sobre la capa `classifier` final, que según el autor permanecía esencialmente en su inicialización aleatoria (los siete vectores de etiqueta son mutuamente ortogonales a nivel de azar y su distribución de valores coincide con la inicialización normal truncada). Durante el ajuste fino, el encoder aprendió a proyectar cada etiqueta sobre una dirección de lectura fija y aleatoria, lo que hace viable editar cada etiqueta por separado.

La edición, por etiqueta *c*, consiste en restar una fracción β_c de una dirección identitaria v_c al vector de pesos y aplicar un desplazamiento al sesgo: `classifier.weight[c] ← classifier.weight[c] − β_c · v_c` y `classifier.bias[c] ← classifier.bias[c] + shift_c`. La dirección v_c se construye con 20 plantillas de frases inocuas rellenadas con 18 grupos identitarios y con 18 adjetivos neutros, tomando la diferencia de medias emparejada por plantilla; ninguno de esos 18 grupos coincide con los 7 grupos objetivo de HateCheck. Para preservar la detección de ataques reales, se proyecta fuera la parte de la dirección identitaria que también separa comentarios hostiles de benignos en el split de validación de Civil Comments. Los valores de β se eligen por etiqueta maximizando la puntuación combinada de sesgo de Borkan et al. (2019), restringidos a β ≥ 0, de modo que la edición solo puede reducir la dependencia de menciones identitarias. Tras la edición se recalibra el sesgo para que el recall en el umbral original de la model card coincida con el del modelo original.

Los valores concretos son: violencia (β = 0,19; shift = +0,315), acoso (β = 0,21; shift = +0,227), genocidio (β = 0,06; shift = +0,243), discurso de odio (β = 0,01; shift = +0,041) y sin cambios para estafa, toxicidad y obscenidad (β = 0, shift = 0). El encoder y `head.dense` permanecen idénticos al modelo base.

## Capacidades

- Clasificación de texto multietiqueta en inglés con siete categorías de moderación: violencia, acoso, genocidio, discurso de odio, estafa, toxicidad y obscenidad.
- Mitigación de sesgo por mención identitaria: reduce la activación de violencia, acoso y genocidio ante frases inocuas que mencionan grupos, preservando la detección de hostilidad real.
- Puntuaciones de probabilidad por etiqueta, utilizables con umbrales ajustados (los umbrales sintonizados de la model card original siguen siendo aplicables).
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente: es un clasificador, no un modelo generativo.
- No dispone de visión ni audio.
- Capacidad multilingüe limitada al inglés declarado.

## Casos de uso

- Moderación de comentarios en comunidades en línea: el modelo puntúa cada comentario con siete etiquetas y permite aplicar umbrales por categoría; la edición WSP evita que se penalice a usuarios que mencionan su identidad de forma neutra o positiva.
- Filtrado previo en pipelines de revisión humana: las puntuaciones de violencia y acoso ordenan la cola de revisión, y la reducción de falsos positivos por mención identitaria disminuye la carga de moderadores sobre contenido inocuo.
- Detección de discurso de odio con análisis de sesgo: útil para equipos que auditan la equidad de sus clasificadores, ya que el modelo documenta métricas BPSN y BNSP sobre Civil Comments test.
- Investigación en edición de pesos: el repositorio incluye `directions.npy` y `edit_spec.json`, lo que permite reproducir la edición, estudiar la geometría de la capa clasificadora o trasladar la técnica a otros clasificadores.
- Detección de estafa y spam: la etiqueta `scam` permanece intacta respecto al modelo base, por lo que puede usarse en filtros de comentarios fraudulentos en foros y mercados.
- Moderación de contenido en inglés en plataformas educativas o de noticias: combinando las etiquetas de toxicidad y obscenidad con las de acoso para priorizar revisiones, siempre con validación previa en el dominio concreto.
- Evaluación comparativa de mitigación de sesgo: sirve como referencia para medir cuánto mejora la puntuación combinada de sesgo (0,755 → 0,792) con una intervención de solo el 0,001 % de los parámetros.

## Benchmarks y rendimiento

Resultados en el split de test de Civil Comments (26.000 comentarios), según la model card:

| Etiqueta | AUC | BPSN | BNSP |
|---|---|---|---|
| violence | 0,865 → 0,892 | 0,756 → 0,893 | 0,805 → 0,713 |
| harassment | 0,746 → 0,833 | 0,536 → 0,812 | 0,850 → 0,811 |
| hate_speech | 0,874 → 0,872 | 0,811 → 0,814 | 0,874 → 0,871 |
| toxicity, obscenity | sin cambios | sin cambios | sin cambios |
| Media (5 etiquetas) | 0,824 → 0,846 | — | puntuación combinada de sesgo 0,755 → 0,792 |

La model card incluye además una tabla de precisión, recall y F1 en los umbrales de la card original, y una evaluación sobre HateCheck (3.728 casos, con los 7 grupos objetivo no vistos durante el desarrollo), pero el contenido disponible de esas tablas está truncado. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 395,8 M de parámetros, en fp32 ocuparía aproximadamente 1,6 GB y en fp16/bf16 alrededor de 0,8 GB, más overhead de activaciones.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM debería poder ejecutarlo en precisión reducida.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores; no hay validación publicada.
- Opciones de despliegue: al ser safetensors con pipeline `text-classification`, es compatible con Transformers y con servidores de inferencia que soporten ese pipeline (por ejemplo, Text Embeddings Inference o endpoints de Hugging Face); no se documenta soporte GGUF ni llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Horizon-1-Text-Large-WSP | 395,8 M | no disponible | Clasificación de moderación (7 etiquetas) | apache-2.0 con restricción no comercial heredada | Hugging Face, 0 descargas |
| Horizon-1-Text-Large (base) | 395,8 M | no disponible | Clasificación de moderación (7 etiquetas) | apache-2.0 con restricción no comercial heredada | Hugging Face |
| Constellation (citado en la model card del base) | no disponible | no disponible | Clasificación de moderación | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada. La comparación con Constellation en la model card del base menciona precisiones en crudo de 0,566 frente a 0,605, pero no se detalla su configuración.

## Limitaciones y advertencias

- El autor advierte explícitamente de que el modelo no ha sido validado para producción y que la manipulación directa de pesos puede generar salidas artefactadas.
- Solo soporta inglés; no se declaran otros idiomas.
- La edición se limita a la capa clasificadora final y no corrige sesgos aprendidos en el encoder.
- El BNSP de violencia empeora (0,805 → 0,713), lo que indica que puede infravalorar toxicidad que menciona identidades; es el principal riesgo de sobrecorrección de la edición.
- La licencia apache-2.0 declarada queda condicionada por la restricción no comercial del modelo base, derivada de `lmsys/toxic-chat` (CC-BY-NC-4.0): el uso comercial no está permitido.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas por umbrales mal calibrados en dominios distintos de Civil Comments.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción ni auditorías independientes.
- Los umbrales de la model card original siguen aplicándose, pero no se ha verificado su comportamiento fuera del dominio de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DominicTWHV/Horizon-1-Text-Large-WSP
- Modelo base: https://huggingface.co/DominicTWHV/Horizon-1-Text-Large
- Vista del modelo base en hfviewer: https://hfviewer.com/DominicTWHV/Horizon-1-Text-Large
- Dataset HateCheck: https://huggingface.co/datasets/Paul/hatecheck
- Paper de referencia sobre sesgo (Borkan et al., 2019): https://arxiv.org/abs/1903.04561
