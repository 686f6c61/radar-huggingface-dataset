# agk4444/aditya369

## Resumen

Aditya369 es un modelo de clasificacion de texto derivado de Qwen/Qwen3-4B, publicado por el usuario agk4444 (AGK FIRE INC) en HuggingFace. Se trata de un ajuste fino supervisado sobre el conjunto de datos `dair-ai/emotion`, compuesto por aproximadamente 20.000 tweets y textos cortos en ingles, para predecir una de seis emociones: sadness, joy, love, anger, fear y surprise. El modelo resultante tiene 4.022.483.456 parametros (unos 4.020 millones) y se distribuye ya fusionado: los pesos LoRA se han integrado en el modelo base, que permanece cuantizado a 4 bits.

Su relevancia practica es limitada pero clara: ofrece un clasificador de emociones de alta exactitud (0.9350 en el conjunto de test) sobre una arquitectura grande en comparacion con los clasificadores tipicos basados en BERT o DistilBERT. Esto puede ser util cuando se busca reaprovechar infraestructura ya montada para Qwen3 o cuando se quiere comparar el rendimiento de un transformer grande frente a encoders pequenos en una tarea de clasificacion clasica.

No es un modelo generativo de proposito general: se ha reconvertido la cabeza del modelo base a `AutoModelForSequenceClassification` con seis etiquetas de salida. El repositorio ocupa 3,4 GB, la licencia es Apache 2.0 y el unico idioma declarado es el ingles. El modelo se publico el 3 de octubre de 2026 y, en el momento de redactar esta ficha, acumulaba 24 descargas y 0 likes, lo que indica una adopcion practicamente nula por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), con cabeza de clasificacion de 6 clases |
| Parametros totales | 4.022.483.456 (4-bit) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-4B) |
| Tipos de cuantizacion | 4-bit mediante bitsandbytes |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es Qwen/Qwen3-4B, un transformer decoder-only denso de aproximadamente 4.020 millones de parametros. El proceso de ajuste consistio en cargar el modelo base ya cuantizado a 4 bits con bitsandbytes, aplicar un adaptador LoRA de rango r=16 y entrenarlo para clasificacion de secuencias con seis clases de salida. Tras el entrenamiento, los pesos LoRA se fusionaron en los pesos del modelo base, de modo que el artefacto publicado es un unico modelo cuantizado sin adaptador separado. El autor publica ademas el adaptador LoRA sin fusionar en un repositorio aparte.

El conjunto de datos empleado es `dair-ai/emotion`, dividido en 16.000 ejemplos de entrenamiento, 2.000 de validacion y 2.000 de test. El entrenamiento duro 3 epocas (aproximadamente 1.500 pasos) con gradient checkpointing activado y se ejecuto en una unica GPU T4 (Kaggle). No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni se detalla la composicion exacta del dataset mas alla de tratarse de tweets en ingles. Tampoco se indica si se congelaon capas del modelo base o se entreno de forma completa tras la fusion.

## Capacidades

- Clasificacion de texto en seis categorias emocionales: sadness, joy, love, anger, fear y surprise.
- Salida de una unica etiqueta por entrada (clasificacion multiclase excluyente), mediante la cabeza `AutoModelForSequenceClassification`.
- Procesamiento de textos cortos en ingles (tweets, frases, mensajes breves).
- Compatibilidad con la libreria transformers y con el pipeline de text-classification.
- Etiquetado para text-embeddings-inference y endpoints_compatible, lo que permite su despliegue como endpoint de inferencia gestionado.
- No dispone de tool calling, function calling, modo agente, razonamiento multi-paso, vision, audio ni modo thinking accesible: la cabeza de clasificacion sustituye la generacion de texto.
- Capacidad multilingue no disponible; solo se declara y evalua en ingles.

## Casos de uso

- Moderacion de comunidades y redes sociales: clasificar automaticamente tweets o comentarios en ingles para detectar emociones negativas (sadness, anger, fear) y activar rutas de moderacion o respuesta prioritaria.
- Analisis de sentimiento y emocion en tiempo real para paneles de marca: procesar lotes de menciones en redes para agregar la distribucion emocional de una campana en ingles.
- Enrutado de tickets de soporte: clasificar el texto inicial de un cliente en ingles y derivarlo a equipos especializados segun la emocion dominante (por ejemplo, anger hacia retencion).
- Investigacion en psicologia computacional o ciencias sociales: etiquetar corpus de tweets en ingles con las seis emociones para estudios cuantitativos, aprovechando la macro F1 de 0.8907 reportada.
- Sistemas de recomendacion de contenido sensible al estado de animo: usar la emocion detectada en el historial de texto del usuario para ajustar recomendaciones de contenido.
- Filtrado previo en pipelines de analisis: actuar como clasificador de primera etapa que reduzca el volumen antes de pasar los casos ambiguos a un modelo generativo mayor o a revision humana.
- Evaluacion comparativa de arquitecturas: servir como referencia de cuanto gana un transformer grande (4B) frente a encoders pequenos en la tarea `dair-ai/emotion`, para decidir si compensa el coste computacional.

## Benchmarks y rendimiento

Resultados en el conjunto de test de `dair-ai/emotion` (2.000 ejemplos retenidos), segun la model card del autor:

| Metrica | Valor |
|---|---|
| Accuracy | 0.9350 |
| Macro F1 | 0.8907 |
| Weighted F1 | 0.9341 |
| Test loss | 0.2754 |

Resultados por clase (conjunto de test):

| Emocion | Precision | Recall | F1 | n |
|---|---|---|---|---|
| sadness | 0.968 | 0.979 | 0.973 | 581 |
| joy | 0.941 | 0.964 | 0.952 | 695 |
| love | 0.856 | 0.786 | 0.820 | 159 |
| anger | 0.942 | 0.942 | 0.942 | 275 |
| fear | 0.905 | 0.893 | 0.899 | 224 |
| surprise | 0.810 | 0.712 | 0.758 | 66 |

No se han publicado comparaciones directas frente a otros clasificadores en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en 4-bit: aproximadamente 2,5-3,5 GB solo para los pesos, mas el coste del contexto y del batch; el repositorio completo ocupa 3,4 GB.
- VRAM en precision completa (fp16): en torno a 8-9 GB, no recomendado dado que el modelo se distribuye cuantizado.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM; se uso una T4 (16 GB) para el entrenamiento. Una RTX 3060 de 12 GB, RTX 4070, RTX 4090 o A100 son opciones validas y sobradas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 8 GB o mas de VRAM, gracias a la cuantizacion a 4 bits con bitsandbytes.
- Opciones de despliegue: transformers (libreria declarada), text-embeddings-inference y endpoints compatibles; tambien puede servirse con TGI en configuraciones compatibles con bitsandbytes. Requiere la dependencia `bitsandbytes`.
- llama.cpp, Ollama y GGUF: no disponibles directamente, ya que el repositorio solo distribuye safetensors en 4 bits; seria necesaria una conversion y recuantizacion previas.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa con clasificadores de emociones habituales sobre el mismo tipo de tarea. Los datos de parametros y licencia de los alternativas no estan confirmados en la informacion proporcionada y deben verificarse en sus repositorios:

| Modelo | Parametros | Etiquetas | Licencia | Accuracy en dair-ai/emotion |
|---|---|---|---|---|
| agk4444/aditya369 | 4.020 M | 6 | Apache 2.0 | 0.9350 |
| bhadresh-savani/bert-base-uncased-emotion | no disponible (orden de 110 M) | 6 | no disponible | no disponible |
| distilbert-base-uncased-finetuned-emotion | no disponible (orden de 66 M) | 6 | no disponible | no disponible |
| roberta-base-go_emotions | no disponible (orden de 125 M) | 28 | no disponible | no disponible |

La diferencia fundamental frente a los alternativas basados en encoders es el tamano: aditya369 usa un modelo de 4.020 M de parametros para una tarea que los encoders pequenos resuelven con dos ordenes de magnitud menos de parametros. No se dispone de cifras comparativas de rendimiento para confirmar si ese coste adicional se traduce en una mejora real frente a dichos clasificadores.

## Limitaciones y advertencias

- Sesgos: hereda los sesgos del modelo base Qwen3-4B y del conjunto `dair-ai/emotion`, que procede de tweets y sobrerrepresenta ciertos registros informales y posiblemente determinados grupos demograficos.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza en textos fuera de dominio.
- Alcance linguistico: solo ingles y solo texto corto (tweets). El rendimiento en documentos largos o en otros idiomas no se ha probado.
- Granularidad limitada: seis emociones gruesas, sin puntuaciones de intensidad ni deteccion de emociones mixtas o simultaneas.
- Clases minoritarias: `surprise` (F1 0.758 con solo 66 ejemplos) y `love` (F1 0.820) rinden claramente peor que el resto; conviene revisar los umbrales si estas clases son criticas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-4B y del dataset `dair-ai/emotion` antes de un despliegue en produccion.
- Naturaleza del artefacto: aunque la licencia y el pipeline lo permitan, no debe tratarse como un modelo generativo ni de chat; su salida es una etiqueta, no texto.
- Adopcion: 24 descargas y 0 likes indican un modelo sin validacion independiente por parte de la comunidad; los resultados de la model card no han sido replicados por terceros.
- Dependencia tecnica: requiere `bitsandbytes` para cargar los pesos en 4 bits, lo que limita su uso en entornos sin soporte para esa libreria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agk4444/aditya369
- Adaptador LoRA sin fusionar: https://huggingface.co/agk4444/aditya369-lora
- Perfil del autor en HuggingFace: https://huggingface.co/agk4444/models
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/dair-ai/emotion
