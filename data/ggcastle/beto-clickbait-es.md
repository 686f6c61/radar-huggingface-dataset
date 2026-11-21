# ggcastle/beto-clickbait-es

## Resumen

BETO afinado para detectar clickbait en español es un modelo de clasificación de texto binaria desarrollado por ggcastle que distingue entre titulares (o tuits de medios) etiquetados como `Clickbait` o `Not Clickbait`. Se construye sobre dccuchile/bert-base-spanish-wwm-cased (BETO), el modelo BERT preentrenado en español de referencia, y se afina con los 2.100 tuits de entrenamiento del corpus TA1C, procedentes de 18 medios de 12 países hispanohablantes.

El modelo forma parte del TFG *Agente inteligente basado en MCP para la detección y análisis de clickbait en medios digitales* de la Universidad Rey Juan Carlos, donde actúa como una de varias señales de distinta naturaleza que se contrastan en lugar de emitir un veredicto único. Su relevancia práctica radica en que ofrece una señal dedicada en español con métricas reproducibles y una receta de entrenamiento fijada de antemano, además de una validación explícita sobre medios no vistos durante el entrenamiento.

Con 109,85 millones de parámetros, arquitectura transformer encoder (BERT base) y una ventana de 128 tokens, es un modelo ligero y desplegable en CPU o GPU consumer, pensado para clasificación de titulares y tuits, no para generación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, BETO cased) con capa de clasificación |
| Parámetros totales | 109.852.418 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud de entrenamiento) |
| Tipos de cuantización | no disponible (pesos safetensors en fp32/fp16; admite cuantización dinámica estándar de PyTorch) |
| Idiomas soportados | español |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base cased (BETO, revisión `c4d86612f51b`) al que se añadió una capa de clasificación nueva y se afinó por completo. La receta se fijó antes de medir: AdamW con tasa de aprendizaje 2e-5 y decaimiento 0,01, tamaño de lote 16, 3 épocas, calentamiento lineal del 10 %, recorte del gradiente a 1, longitud máxima de 128 tokens y fp16 en GPU. Se entrenaron tres semillas y se publica la semilla 0, la de mejor F1 en el conjunto de validación.

Los datos de entrenamiento son los 2.100 tuits de la parte `train` del corpus TA1C, de 18 medios en español de 12 países, cada uno anotado por tres personas. Durante el entrenamiento se eliminan enlaces, cuentas (`@…`), etiquetas (`#…`), corchetes y barras «|», que es donde los tuits llevan las marcas del medio; en inferencia el texto entra tal cual. La predicción es la etiqueta más probable, sin umbral. No se documenta RLHF ni DPO: es un ajuste supervisado de clasificación.

## Capacidades

- Clasificación binaria de texto en español: `Clickbait` frente a `Not Clickbait`.
- Diseñado para titulares y para tuits con los que un medio anuncia una noticia.
- Salida de etiqueta más probable con su puntuación de confianza (pipeline `text-classification`).
- Integrable como señal dentro de un sistema mayor de análisis (agente MCP del TFG), no como veredicto único.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades de visión ni audio.
- Monolingüe: solo español.

## Casos de uso

- Moderación y curación de portadas: clasificar automáticamente los titulares de un agregador o lector RSS para marcar o filtrar los sospechosos de clickbait antes de publicarlos.
- Análisis de medios y estudios de comunicación: medir la proporción de titulares clickbait por medio, país o sección, usando las etiquetas del modelo como variable dependiente en un estudio longitudinal.
- Señal dentro de un sistema de verificación: alimentar un agente que contraste la clasificación del modelo con reglas interpretables (longitud, signos de interrogación, superlativos) para reducir falsos positivos.
- Priorización en bandejas de noticias: en un lector de noticias, ordenar o etiquetar elementos según la probabilidad de clickbait para que el usuario decida qué abrir.
- Detección en redes sociales: clasificar los tuits de anuncio de noticias de cuentas de medios y generar alertas cuando la proporción de clickbait supera un umbral configurado.
- Investigación sobre calidad periodística: comparar el estilo de titulación entre medios y detectar cambios de política editorial a lo largo del tiempo.
- Filtrado en pipelines de datos: descartar o marcar titulares clickbait en corpus recolectados para otros fines (por ejemplo, para entrenar resumidores o sistemas de recomendación).

## Benchmarks y rendimiento

F1 de la clase clickbait, con precisión (P) y recall (R), comparado con la regresión logística interpretable del mismo sistema (umbral 0,35) sobre los mismos tuits.

| Conjunto | Este modelo | Regresión logística |
|---|---|---|
| TA1C `validation` (700 tuits) | 0,803 (P 0,849, R 0,762) | 0,609 (P 0,710, R 0,534) |
| Medios fuera (2.800 tuits) | 0,808 (P 0,807, R 0,808) | 0,570 (P 0,643, R 0,512) |
| TA1C `test` (700 tuits) | 0,838 (P 0,899, R 0,784), AUC 0,951 | 0,674 (P 0,756, R 0,608) |

El conjunto «medios fuera» corresponde a seis pliegues de tres medios sobre `train` y `validation`: en cada pliegue se entrena con la misma receta y los otros quince medios, y se mide en los tres restantes. Los autores de TA1C publican un F1 de 0,84 en `test` con BETO afinado.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5 GB en fp16 y menos de 0,3 GB en int8; el repositorio ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problema en RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU consumer y también en CPU: al ser un BERT base de 110 M de parámetros, la inferencia en CPU es viable para lotes moderados.
- Opciones de despliegue: `transformers` con pipeline `text-classification`, TorchServe, ONNX Runtime, o servidores de inferencia compatibles con modelos encoder (por ejemplo, Text Embeddings Inference no aplica; vLLM y TGI están orientados a modelos generativos y no son la vía natural para este encoder).
- Latencia y throughput: no se han publicado cifras en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ggcastle/beto-clickbait-es | 109,85 M | 128 tokens | Clasificación clickbait (español) | CC BY 4.0 | Hugging Face |
| dccuchile/bert-base-spanish-wwm-cased (BETO) | ~110 M | 512 tokens | Modelo base de propósito general (español) | CC BY 4.0 | Hugging Face |
| Regresión logística del TFG (referencia interna) | no disponible | no disponible | Clasificación clickbait (español) | no disponible | no disponible |

No se dispone de datos de otros modelos específicos de detección de clickbait en español en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y medido con tuits de medios, no con titulares de portada: fuera de ese registro su rendimiento no está medido.
- En `test` aparecen los mismos 18 medios que en `train`, por lo que parte del acierto podría deberse a reconocer al medio; la validación con medios no vistos (0,808) sugiere que se apoya poco en esa señal, pero no lo descarta.
- La limpieza elimina marcas evidentes del medio, no su estilo: en `validation`, la media de las tres semillas es 0,796 limpiando y 0,807 sin limpiar.
- Es una caja negra: no explica sus decisiones; el sistema del TFG lo contrasta con señales interpretables.
- Solo español.
- Licencia CC BY 4.0 heredada de BETO; los autores de BETO advierten de que no pueden asegurar que todos los textos de su preentrenamiento tengan licencias compatibles con CC BY 4.0, especialmente para uso comercial. Este aviso se extiende a este modelo.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en registros distintos al de entrenamiento (titulares formales, textos largos, otros géneros periodísticos).
- El contexto de 128 tokens trunca entradas más largas; los titulares y tuits suelen caber, pero no textos extensos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ggcastle/beto-clickbait-es
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Repositorio BETO: https://github.com/dccuchile/beto
- Repositorio del TFG (agente MCP de análisis de clickbait): https://github.com/codeurjc-students/2026-ClickBaitAnalysis
- Corpus TA1C: https://github.com/gmordecki/TA1C
- Paper TA1C (IBERAMIA 2024): https://doi.org/10.1007/978-3-031-80366-6_32
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
