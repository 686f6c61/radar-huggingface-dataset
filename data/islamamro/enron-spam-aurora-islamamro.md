# Islamamro/enron-spam-aurora-islamamro

## Resumen

El modelo `Islamamro/enron-spam-aurora-islamamro` es un clasificador binario de correo electrónico (spam frente a legítimo) desarrollado por el usuario Islamamro mediante la plataforma Aurora Research Portal. Se trata de un fine-tuning del modelo `distilbert-base-uncased` sobre el dataset `SetFit/enron_spam`, un subconjunto de demostración de 1.400 ejemplos extraído del corpus Enron. El autor lo presenta explícitamente como una prueba del pipeline de construcción, entrenamiento y publicación de Aurora, no como un modelo listo para producción.

Con 66,9 millones de parámetros y una ventana de contexto de 512 tokens, el modelo es ligero y puede ejecutarse en hardware modesto. Su precisión declarada en un conjunto de validación reservado es de 0,96, aunque no se especifican detalles sobre el tamaño de ese conjunto ni la métrica exacta. La licencia Apache 2.0 permite uso comercial sin restricciones, pero la limitación del subconjunto de entrenamiento condiciona su utilidad real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer, 6 capas, 768 dimensiones ocultas, 12 cabezas de atencion) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en precision original) |
| Idiomas soportados | ingles (derivado de distilbert-base-uncased) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, una version destilada de BERT que conserva el 97 % de su rendimiento con un 40 % menos de parametros. La arquitectura es un transformer encoder clasico con atencion totalmente densa, sin innovaciones como MoE o atencion lineal. El fine-tuning se realizo sobre el dataset `SetFit/enron_spam`, que a su vez deriva del corpus Enron, un conjunto de correos electronicos reales de empleados de la empresa Enron. El entrenamiento se limito a 1.400 ejemplos de demostracion, sin tecnicas de RLHF ni DPO; es un ajuste supervisado estandar de clasificacion de secuencias con dos etiquetas (spam y ham). El autor indica que se entreno en una NVIDIA RTX 3090, aunque no se proporcionan hiperparametros concretos (tasa de aprendizaje, epocas, tamano de lote).

## Capacidades

- Clasificacion binaria de texto: distingue entre correo spam y correo legitimo (ham).
- Procesamiento de texto en ingles, con tokenizacion subpalabra de BERT (WordPiece).
- Inferencia rapida gracias al tamano reducido del modelo (66,9 M de parametros).
- No soporta tool calling, ni razonamiento multi-paso, ni agentes, ni vision, ni audio.
- No dispone de modo de pensamiento (thinking mode) ni generacion de texto libre; es exclusivamente un clasificador.

## Casos de uso

- Prototipado de filtros de correo: el modelo puede integrarse en un pipeline de clasificacion para validar conceptos de deteccion de spam en entornos de desarrollo o pruebas de concepto.
- Demostracion de pipelines de MLOps: sirve como ejemplo de despliegue de un modelo de clasificacion de texto con Transformers, util para formacion o evaluacion de herramientas de inferencia.
- Filtrado de correos en entornos controlados: en aplicaciones internas con volumen bajo y donde el coste de un falso positivo sea asumible, puede usarse como clasificador auxiliar.
- Analisis de datasets de correo: permite etiquetar rapidamente corpus de correos electronicos en ingles para generar datos de entrenamiento de otros modelos.
- Educacion e investigacion: adecuado para estudiar el efecto del fine-tuning en modelos destilados con datasets pequenos.
- Comparacion de tecnicas de cuantizacion: al ser un modelo pequeno, es util para probar flujos de conversion a ONNX, TensorRT o cuantizacion sin requerir grandes recursos.

## Benchmarks y rendimiento

El autor declara una precision del 0,96 en un conjunto de validacion reservado, pero no se especifican el tamano de ese conjunto, la particion exacta ni la metrica (accuracy, F1, etc.). No se han publicado resultados comparativos con otros modelos en la informacion disponible. Por tanto, no es posible establecer una comparacion rigurosa con alternativas.

| Metrica | Valor |
|---|---|
| Precision (hold-out) | 0,96 (sin detalles de particion) |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,25 GB en FP32 (268 MB para los pesos) y menos de 0,15 GB en FP16. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 o superior, RTX 3060, etc.). Tambien puede ejecutarse en CPU con latencia aceptable (inferencia en decenas de milisegundos por ejemplo).
- Despliegue: compatible con la libreria Transformers de Hugging Face, ONNX Runtime, TensorRT, y servidores de inferencia como vLLM o TGI (aunque para un modelo tan pequeno, una simple API con FastAPI es suficiente).
- Latencia: en una GPU RTX 3090, la inferencia por lote de 1 ejemplo es del orden de 1-2 ms; en CPU moderna, entre 10-30 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (Enron) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Islamamro/enron-spam-aurora-islamamro | 66,9 M | 512 | 0,96 (declarada) | Apache 2.0 | Hugging Face |
| spambloq/enron-spam | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| distilbert-base-uncased (base sin fine-tuning) | 66,9 M | 512 | no aplica (no clasifica spam) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento del modelo `spambloq/enron-spam` para una comparacion cuantitativa. El modelo base DistilBERT no esta entrenado para esta tarea especifica, por lo que la comparacion solo es estructural.

## Limitaciones y advertencias

- Entrenado con solo 1.400 ejemplos de demostracion, lo que limita su generalizacion a correos fuera del dominio Enron (correos corporativos de una empresa energetica de los anos 2000).
- El dataset Enron contiene sesgos inherentes: vocabulario especifico del sector, jerga corporativa y desbalance entre clases que puede afectar a la precision en otros dominios.
- No es un modelo de produccion; el propio autor recomienda fine-tuning con el dataset completo para uso real.
- Solo soporta ingles; no funciona con otros idiomas.
- Riesgo de alucinacion bajo al ser un clasificador, pero puede producir falsos positivos o negativos en textos con vocabulario atipico.
- No se proporcionan detalles sobre el preprocesado de los datos de entrenamiento (limpieza, normalizacion, etc.), lo que dificulta la reproducibilidad.
- La fecha de creacion (2026-08-28) es posterior a la fecha actual, lo que sugiere que el modelo podria ser un artefacto de una plataforma experimental; se recomienda verificar su integridad antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Islamamro/enron-spam-aurora-islamamro
- Dataset SetFit/enron_spam: https://huggingface.co/datasets/SetFit/enron_spam
- Dataset bvk/ENRON-spam: https://huggingface.co/datasets/bvk/ENRON-spam
- Repositorio con el dataset original Enron-Spam (Metsis et al.): https://github.com/Adam-Sleiman/ai-phishing-detection-llm/tree/main/enron_spam_data-master
- Modelo alternativo spambloq/enron-spam: https://huggingface.co/spambloq/enron-spam
