# SinclairSchneider/english_politic_RoBERTa-large

## Resumen

`english_politic_RoBERTa-large` es un clasificador binario de texto en inglés que determina si un fragmento (noticia o artículo de blog) es de temática política (`politic`) o no (`other`). Lo desarrolla el usuario de Hugging Face SinclairSchneider y se construye mediante fine-tuning de `FacebookAI/roberta-large` sobre el dataset propio `SinclairSchneider/trainset_political_text_yes_no_english`, compuesto por unos 45.000 artículos de TIME, Military Times y Security Affairs etiquetados según la sección o el medio de publicación.

El modelo resuelve una tarea de filtrado y enrutado de contenido editorial: separar piezas políticas del resto de la producción informativa. Su interés práctico no está en la generación, sino en su comportamiento medido fuera de dominio: sobre el corpus BBC News 2004-2005 alcanza un ROC-AUC de 0,9714, lo que indica una buena capacidad de ranking, aunque con el umbral por defecto de 0,5 la precisión cae al 62,76 %, lo que obliga a recalibrar el punto de corte en producción.

Con 355 millones de parámetros, arquitectura RoBERTa-large y licencia MIT, es un modelo pequeño y desplegable en CPU o en una sola GPU de consumo. Su utilidad real depende de entender sus atajos aprendidos (espacios de no separación, comillas tipográficas) y de ajustar el umbral de decisión, aspectos que el autor documenta explícitamente en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-large), clasificación de secuencias con cabeza binaria |
| Parametros totales | 355.361.794 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite de RoBERTa; requiere `truncation=True`) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar vía herramientas externas, no documentada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 1,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/roberta-large`, un transformer encoder de 24 capas y 355 millones de parámetros, y añade una cabeza de clasificación sobre la representación del token `<s>` para producir una distribución de dos clases (`politic`, `other`). El fine-tuning se realiza sobre `trainset_political_text_yes_no_english`, un conjunto de aproximadamente 45.000 artículos de noticias y blogs procedentes de TIME, Military Times y Security Affairs, donde la etiqueta se deriva de la sección o del medio en que se publicó cada pieza, no de anotación humana directa del contenido.

El autor publica el script de entrenamiento (`train.py`) en el repositorio. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un clasificador de este tipo). La model card sí describe hallazgos de análisis de atajos (*shortcut probes*): el modelo aprendió que los espacios de no separación (`\xa0`) y ciertas comillas tipográficas son indicios de la clase `other`, porque en los datos de entrenamiento aparecían solo en una fuente no política. Insertar tres de esos caracteres en un artículo político hace que el 25 % de los artículos políticos de BBC News se reclasifiquen como `other`.

## Capacidades

- Clasificación binaria de texto en inglés: `politic` frente a `other`.
- Detección de temática política en artículos de noticias y blogs, con puntuaciones de probabilidad por clase.
- Procesamiento por lotes (`batch_size`) y devolución de ambas puntuaciones con `top_k=None`.
- Funcionamiento sobre textos largos mediante truncado a 512 tokens (obligatorio pasar `truncation=True`; de lo contrario el pipeline lanza `RuntimeError` o un fallo de aserción en GPU).
- Capacidad de ranking fuera de dominio: ROC-AUC de 0,9714 sobre BBC News, lo que permite usar la puntuación como ordenación y elegir umbral según la aplicación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador, no un modelo generativo.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Filtrado editorial en un CMS: clasificar automáticamente los artículos entrantes para enrutarlos a la sección de política o al resto de secciones, usando un umbral estricto (0,95) para reducir falsos positivos.
- Construcción de corpus políticos: seleccionar piezas de temática política de un archivo histórico de noticias antes de un análisis posterior (topic modeling, análisis de sentimiento, extracción de entidades).
- Moderación y curación de feeds: etiquetar contenido de un agregador para separar la cobertura política de la deportiva o económica, siempre que el dominio se parezca al de entrenamiento (noticias en inglés).
- Enrutado en pipelines RAG: decidir si un documento recuperado debe pasar a un módulo especializado en análisis político, aprovechando la puntuación como señal de confianza y no solo la etiqueta.
- Investigación en comunicación política: medir la proporción de contenido político en un conjunto de medios a lo largo del tiempo, usando ROC-AUC como métrica de calidad del ranking y validando manualmente una muestra.
- Preetiquetado para anotación humana: generar etiquetas preliminares que los anotadores revisan, con umbral alto para que las positivas sean fiables y las dudosas se revisen a mano.
- Detección de deriva temática: monitorizar cómo evoluciona la proporción de textos políticos en un flujo de noticias, con la precaución de recalibrar el umbral por fuente.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados de forma independiente):

| Tarea / dataset | Metrica | Valor |
|---|---|---|
| Detección de texto político, split held-out aleatorio del 20 % de `trainset_political_text_yes_no_english` | Accuracy | 0,9789 |
| Igual | Weighted F1 | 0,9789 |
| Fuera de dominio: BBC News 2004-2005 (política vs. resto) | ROC-AUC | 0,9714 |
| Igual, umbral 0,5 | Accuracy | 0,6276 |
| Igual, umbral 0,5 | F1 clase `politic` | 0,5038 |
| Igual, umbral 0,95 | Accuracy | 0,9079 |
| Igual, umbral 0,95 | F1 clase `politic` | 0,7992 |

La caída de precisión con umbral 0,5 fuera de dominio se debe a falsos positivos: el modelo etiqueta como `politic` el 79 % de los artículos deportivos y el 65 % de los económicos de BBC News. El autor recomienda umbrales de 0,9 a 0,98 para texto fuera de dominio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,4 GB de pesos más activaciones; en fp16 alrededor de 0,7 GB. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para volúmenes moderados. Cualquier GPU con 4 GB o más (RTX 3060, RTX 4090, T4, A100, H100) es suficiente y el cuello de botella será el throughput de tokens, no la memoria.
- Cabe en GPU de consumo: sí, en cualquier modelo con al menos 4 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, integración en `vLLM` no aplicable (no es generativo), exportación a ONNX o TorchScript para servir, y contenedores tipo TGI no orientados a clasificadores. El autor documenta el uso con `transformers` 5.15 y `torch` 2.13.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un encoder de 355 M de parámetros con secuencias de hasta 512 tokens, el procesamiento por lotes (`batch_size=32` en el ejemplo del autor) es la vía recomendada para maximizar throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SinclairSchneider/english_politic_RoBERTa-large` | 355 M | 512 tokens | Clasificación binaria política/no política (inglés) | MIT | Hugging Face, 5 descargas |
| `FacebookAI/roberta-large` | 355 M | 512 tokens | Modelo base encoder; requiere fine-tuning para esta tarea | MIT | Hugging Face, ampliamente usado |
| `SinclairSchneider/german_politic_DeBERTa-v2-base` | no disponible en la información | no disponible | Clasificación binaria política/no política (alemán) | no disponible en la información | Hugging Face |

No se dispone en la información proporcionada de otros clasificadores comparables de detección de temática política con métricas publicadas, por lo que la comparación se limita al modelo base y a la variante alemana del mismo autor.

## Limitaciones y advertencias

- Sesgos de dominio: entrenado con artículos de TIME, Military Times y Security Affairs; generaliza mal a otros medios, como demuestra la caída de F1 a 0,5038 con umbral 0,5 en BBC News.
- Atajos aprendidos: los espacios de no separación (`\xa0`) y las comillas tipográficas empujan la predicción hacia `other`; es necesario normalizar el texto antes de la inferencia.
- Umbral por defecto inadecuado fuera de dominio: con 0,5 se producen muchos falsos positivos en deporte (79 %) y economía (65 %); usar 0,9-0,98.
- Textos cortos: titulares y frases sueltas obtienen puntuaciones poco fiables (por ejemplo, 0,65 para un titular claramente político), lo que limita su uso en clasificación de titulares.
- Truncado obligatorio: sin `truncation=True`, las entradas de más de 512 tokens provocan errores en tiempo de ejecución.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí hay riesgo de etiquetas erróneas con alta confianza en dominios alejados del entrenamiento.
- Idiomas: solo inglés; no hay soporte multilingüe.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al de entrenamiento.
- Adopción muy baja (5 descargas, 0 likes) y benchmarks no verificados de forma independiente: conviene validar sobre datos propios antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SinclairSchneider/english_politic_RoBERTa-large
- Script de entrenamiento: https://huggingface.co/SinclairSchneider/english_politic_RoBERTa-large/blob/main/train.py
- Dataset de entrenamiento: https://huggingface.co/datasets/SinclairSchneider/trainset_political_text_yes_no_english
- Modelo base: https://huggingface.co/FacebookAI/roberta-large
- Variante alemana: https://huggingface.co/SinclairSchneider/german_politic_DeBERTa-v2-base
- Paper de RoBERTa (Liu et al., 2019): https://arxiv.org/abs/1907.11692
- Paper de BERT (Devlin et al., 2019): https://arxiv.org/abs/1910.09700
- Corpus BBC News (Greene & Cunningham, 2006): no disponible como enlace en la información proporcionada
