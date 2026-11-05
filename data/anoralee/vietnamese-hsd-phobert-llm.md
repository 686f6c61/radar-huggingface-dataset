# AnoraLee/vietnamese-hsd-phobert-llm

## Resumen

El modelo `vietnamese-hsd-phobert-llm` es un clasificador de texto en vietnamita especializado en la deteccion de discurso de odio (hate speech detection, HSD). Lo desarrolla Anora Lee junto a colaboradores de la Ton Duc Thang University, y se construye mediante fine-tuning de `vinai/phobert-base`, un transformer encoder de arquitectura RoBERTa con 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion (135 millones de parametros totales). Clasifica cada comentario en tres niveles de toxicidad: CLEAN, OFFENSIVE y HATE.

Su relevancia reside en el metodo de entrenamiento: el autor lo emplea como pieza central de un estudio empirico sobre aumento de datos sinteticos generados con LLM para mitigar el severo desbalance de clases en la clasificacion de lenguaje toxico en entornos de bajos recursos. Los datos sinteticos se generan con Qwen y se filtran despues mediante verificacion de pseudo-etiquetas y consistencia con ViHateT5, lo que reduce el riesgo de etiquetas alucinadas antes de incorporarlos al conjunto de entrenamiento.

El modelo esta pensado para moderacion automatizada de comunidades, monitorizacion de tendencias de toxicidad y como referencia para evaluar pipelines de aumento de datos generativo en PLN vietnamita. Requiere texto segmentado a nivel de silaba (palabras compuestas unidas con guion bajo) antes de la tokenizacion, lo que condiciona su integracion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa), base `vinai/phobert-base`: 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion |
| Parametros totales | 135.000.579 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de secuencia en entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, ONNX ni cuantizaciones oficiales) |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo RoBERTa para clasificacion de secuencias, inicializado desde `vinai/phobert-base` y con una cabeza de clasificacion de tres clases. La longitud maxima de secuencia es de 128 tokens. El preprocesado enlaza palabras compuestas mediante segmentacion a nivel de silaba con VnCoreNLP (unidas con `_`) y elimina artefactos de prompt introducidos durante la generacion sintetica.

El conjunto de entrenamiento parte de 77.064 muestras sin aumentar del split `default` del dataset `BonTori/ViHatePhoBERT-TDTU`, a las que se anaden 2.697 muestras sinteticas del subconjunto `llm_qwen_filtered_ViHateT5`, dirigidas a las clases minoritarias (218 OFFENSIVE y 2.479 HATE). Las muestras sinteticas se generan con Qwen y se filtran con ViHateT5 para verificar consistencia semantica y eliminar alucinaciones de etiqueta. Se aplico deduplicacion por clave normalizada contra los splits de validacion y test (`protected_keys`) para evitar contaminacion entre particiones. Validacion y test son conjuntos congelados y sin aumentar, de 9.633 muestras cada uno.

Hiperparametros: optimizador AdamW con `weight_decay=0.01`, learning rate 2e-5 con calentamiento lineal, batch size 16 por dispositivo, 10 epocas con early stopping (paciencia de 2 epocas) segun Macro F1 de validacion, precision mixta FP16 y seleccion del checkpoint con mejor `macro_f1`. No se documenta uso de RLHF ni DPO, algo esperable en un encoder de clasificacion.

## Capacidades

- Clasificacion de texto en vietnamita en tres niveles de toxicidad: `0 - CLEAN`, `1 - OFFENSIVE` y `2 - HATE`.
- Distincion entre lenguaje vulgar o abrasivo sin animo sistemico (OFFENSIVE) y hostilidad o discriminacion dirigida a identidades sociales, etnicas, religiosas o de genero (HATE).
- Inferencia via `transformers` (`pipeline` de `text-classification` y `AutoModelForSequenceClassification`), compatible con endpoints.
- Integracion en pipelines de moderacion como clasificador auxiliar con umbrales calibrados.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo de pensamiento: es un encoder de clasificacion, no un modelo generativo.
- No tiene capacidades de vision ni audio.
- Capacidad multilingue limitada al vietnamita; no se documenta soporte de otros idiomas.

## Casos de uso

- Moderacion automatizada de comunidades: el modelo clasifica comentarios de redes sociales en los tres niveles de toxicidad y permite enrutar los casos HATE a revision humana, mientras los CLEAN pasan sin intervencion. Su ventana de 128 tokens es suficiente para comentarios y respuestas cortas tipicas de plataformas sociales.
- Filtrado previo en foros y secciones de comentarios: se ejecuta como primera etapa de un pipeline de moderacion para reducir el volumen que llega a moderadores humanos, usando los umbrales de probabilidad calibrados que recomienda el autor.
- Monitorizacion de tendencias de toxicidad: al ser un clasificador ligero (135 M de parametros), permite procesar grandes volumenes de comentarios historicos y agregar tasas de toxicidad por periodo, comunidad o tema.
- Deteccion de discurso de odio dirigido a grupos protegidos: la clase HATE esta especificamente entrenada con muestras sinteticas de las clases minoritarias, lo que mejora la sensibilidad hacia identidades etnicas, religiosas, de genero y sociales en textos vietnamitas.
- Evaluacion de pipelines de aumento de datos generativo: el modelo sirve como referencia para comparar el efecto de la expansion sintetica con Qwen y el filtrado con ViHateT5 frente a entrenamiento sin aumentar, en el contexto del estudio del autor.
- Investigacion en PLN de bajos recursos: util como baseline reproducible (licencia MIT, pesos safetensors) para experimentos de clasificacion de toxicidad en vietnamita con desbalance de clases.
- Sistemas de alerta temprana en plataformas de contenido generado por usuarios: combinado con escalado humano para probabilidades fronterizas, tal como recomienda la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card define las metricas de evaluacion (accuracy y F1, con seleccion de checkpoint por Macro F1 sobre validacion) y describe un conjunto de test congelado de 9.633 muestras, pero no incluye la tabla de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,3 GB para los pesos (135 M de parametros), mas overhead de activaciones y tokenizador; en la practica cabe holgadamente en cualquier GPU con 2 GB o mas.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volumenes moderados.
- GPU recomendadas para alto throughput: A100, H100 o L4 para procesamiento por lotes a gran escala; para uso interactivo basta una GPU de gama media.
- Despliegue: `transformers` (pipeline nativo), TGI, y exportacion a ONNX o TorchScript para servir; no se documentan pesos GGUF para llama.cpp u Ollama, aunque la conversion a GGUF es tecnicamente posible al ser un encoder RoBERTa.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano y secuencia maxima de 128 tokens, se espera un coste por inferencia bajo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AnoraLee/vietnamese-hsd-phobert-llm` | 135 M | 128 tokens | Clasificacion de toxicidad en vietnamita (3 clases) | MIT | HuggingFace, safetensors |
| `vinai/phobert-base` | ~135 M | 256 tokens | Modelo base de lenguaje vietnamita (encoder) | MIT | HuggingFace |
| ViHateT5 | no disponible | no disponible | Deteccion de hate speech en vietnamita (usado como filtro) | no disponible | Referenciado en la model card |
| Qwen (generativo, usado para aumento) | no disponible | no disponible | Generacion de texto sintetico | no disponible | Referenciado en la model card |

La comparacion cuantitativa de rendimiento con estas alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Artefactos generativos: aunque las muestras sinteticas pasaron por filtrado con ViHateT5, pueden introducir uniformidad estilistica sutil que afecte a la generalizacion.
- Ambiguedad contextual y sarcasmo: el odio implicito profundo y el sarcasmo en conversaciones multi-turno siguen siendo dificiles para un encoder de secuencia unica.
- Requiere texto segmentado a nivel de silaba (palabras compuestas unidas con `_`) antes de la tokenizacion; la inferencia sobre texto crudo sin segmentar esta fuera de alcance.
- Ventana de contexto de 128 tokens: los comentarios largos se truncan, lo que puede perder la parte del texto donde aparece el contenido toxico.
- Solo vietnamita: no es adecuado para otros idiomas.
- Uso fuera de alcance: censura autonoma sin rutas de escalado humano.
- Recomendacion operativa: combinar con umbrales de decision calibrados y validacion humana en probabilidades fronterizas.
- Licencia MIT: permite uso comercial, pero no se documentan garantias ni evaluaciones independientes de sesgo; con 0 descargas y 0 likes, no hay evidencia de uso en produccion.
- Riesgo de alucinacion: no aplica en el sentido generativo (es un clasificador), pero si existe riesgo de falsos positivos y negativos en la clasificacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnoraLee/vietnamese-hsd-phobert-llm
- Dataset: https://huggingface.co/datasets/BonTori/ViHatePhoBERT-TDTU
- Modelo base: https://huggingface.co/vinai/phobert-base
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo o demos adicionales.
