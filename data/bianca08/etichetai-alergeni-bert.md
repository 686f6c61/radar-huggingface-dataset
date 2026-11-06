# Bianca08/etichetai-alergeni-bert

## Resumen

EtichetAI – alergeni (BERT rumano) es un modelo de clasificación de texto multi-etiqueta especializado en la detección de alérgenos en listas de ingredientes de productos alimentarios en rumano. Lo desarrolla la usuaria Bianca08 como trabajo de fin de grado en la Universidad Titu Maiorescu, y se apoya en el modelo base `dumitrescustefan/bert-base-romanian-cased-v1`, un BERT base adaptado al rumano con 124,46 millones de parámetros.

El modelo resuelve un problema acotado pero de interés regulatorio: a partir del texto libre de una lista de ingredientes, predice para cada uno de los 14 alérgenos contemplados por el Reglamento (UE) 1169/2011 dos estados independientes, "contiene" y "puede contener trazas", lo que da un total de 28 salidas binarias. Está entrenado con unas 3.900 etiquetas reales en rumano extraídas de Open Food Facts (licencia ODbL) y utiliza pérdida ponderada para compensar el fuerte desequilibrio entre clases.

Su relevancia es práctica: ofrece un componente listo para integrar en pipelines de etiquetado alimentario y análisis de catálogos, con un tamaño reducido (repo de 0,6 GB, pesos en safetensors y ONNX) que permite inferencia en CPU. No obstante, se trata de un modelo de nicho, con solo 26 descargas, sin datos publicados de benchmarks frente a alternativas y con una advertencia explícita del autor: no sustituye la lectura de la etiqueta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base, cased), cabeza de clasificación multi-etiqueta con 28 salidas |
| Parametros totales | 124.462.876 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT admite 512 tokens; el autor no lo declara) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | rumano (ro) |
| Licencia | MIT |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder BERT base en versión cased, heredado de `dumitrescustefan/bert-base-romanian-cased-v1`, al que se añade una cabeza de clasificación multi-etiqueta con 28 unidades de salida: 14 alérgenos del Reglamento (UE) 1169/2011, cada uno con una salida para "contiene" y otra para "puede contener trazas". Las predicciones se binarizan aplicando umbrales de decisión específicos por clase, publicados en el fichero `praguri.json` del repositorio.

El entrenamiento se realizó sobre aproximadamente 3.900 etiquetas de ingredientes en rumano procedentes de Open Food Facts (ODbL). Para mitigar el desequilibrio de clases, habitual en alérgenos poco frecuentes, se empleó una función de pérdida ponderada. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si hubo fases de ajuste fino adicionales más allá del entrenamiento supervisado.

## Capacidades

- Clasificación multi-etiqueta de texto: detecta simultáneamente varios alérgenos en una misma lista de ingredientes.
- Distinción entre presencia declarada ("contiene") y trazas ("puede contener"), con 28 salidas binarias independientes.
- Cobertura de los 14 alérgenos del Reglamento (UE) 1169/2011.
- Procesamiento de texto libre en rumano, incluyendo listas de ingredientes con formato irregular.
- Umbrales de decisión ajustables por clase mediante `praguri.json`.
- Exportación a ONNX para despliegue en entornos sin GPU.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Etiquetado automático de catálogos de productos: el modelo procesa la lista de ingredientes de cada referencia y devuelve las 28 etiquetas, lo que permite filtrar catálogos completos de Open Food Facts o de un retailer por alérgeno sin intervención manual.
- Filtrado para consumidores con alergias: integrado en una aplicación de compra, permite marcar productos que contienen o pueden contener un alérgeno concreto a partir del texto de la etiqueta, usando los umbrales por clase para ajustar la sensibilidad.
- Control de calidad de fichas de producto: detecta discrepancias entre los alérgenos declarados en campos estructurados y los que aparecen en el texto de ingredientes, señalando candidatos a revisión.
- Enriquecimiento de bases de datos alimentarias: añade etiquetas de alérgenos a registros que solo disponen del texto libre de ingredientes, con un coste de inferencia bajo al ser un BERT base ejecutable en CPU.
- Investigación en seguridad alimentaria: permite análisis agregados sobre prevalencia de trazas por categoría de producto en corpus rumanos, con resultados reproducibles gracias a los umbrales publicados.
- Preprocesado en pipelines de PLN alimentario: actúa como primer filtro que reduce el volumen de textos que deben revisarse manualmente antes de un sistema de extracción más costoso.
- Despliegue en entornos con recursos limitados: la exportación ONNX y el tamaño del modelo (0,6 GB de repo) permiten servirlo en contenedores pequeños o en el navegador mediante ONNX Runtime.

## Benchmarks y rendimiento

El autor reporta resultados sobre un conjunto de test de 491 productos:

| Metrica | Valor |
|---|---|
| F1 micro | 0,760 |
| Precision | 0,735 |
| Recall | 0,786 |

No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con otros modelos (MMLU, HumanEval, GSM8K u otros no aplican a esta tarea).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 124,46 millones de parámetros; en torno a 0,5 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100. Una RTX 4090 o una T4 están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- CPU: viable para producción; un BERT base procesa decenas de textos por segundo en CPU multinúcleo, aunque no se dispone de cifras de latencia o throughput publicadas.
- Opciones de despliegue: ONNX Runtime (formato ONNX incluido), Transformers con PyTorch, y servidores de inferencia estándar para modelos de clasificación. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EtichetAI alergeni BERT | 124,46 M | no disponible | Clasificación multi-etiqueta de alérgenos en rumano | MIT | Hugging Face (26 descargas) |
| dumitrescustefan/bert-base-romanian-cased-v1 | ~124 M | 512 tokens | Modelo base de lenguaje en rumano | no disponible en la información | Hugging Face |
| BETO (bert-base-spanish-wwm-cased) | ~110 M | 512 tokens | Modelo base en español | no disponible en la información | Hugging Face |

No se dispone de otros modelos especializados en detección de alérgenos en rumano con los que comparar directamente, ni de datos de rendimiento de las alternativas en esta tarea concreta.

## Limitaciones y advertencias

- El propio autor advierte que el modelo no sustituye la lectura de la etiqueta; no debe usarse como única barrera de seguridad alimentaria.
- Rendimiento moderado: F1 micro de 0,760 implica que una parte relevante de alérgenos no se detecta o se detecta en falso; el recall de 0,786 deja margen de error en un dominio crítico.
- Entrenado exclusivamente con etiquetas en rumano de Open Food Facts; el dominio y el formato pueden diferir del de otras fuentes, y no generaliza a otros idiomas.
- Posible sesgo hacia los alérgenos y formatos más frecuentes en Open Food Facts, pese a la pérdida ponderada.
- Riesgo de alucinación en el sentido de falsos positivos y falsos negativos en textos ambiguos, abreviaturas o listas mal formateadas.
- Los umbrales de decisión están fijados en `praguri.json`; cambiarlos altera el equilibrio precisión/recall y deben recalibrarse si cambia la distribución de datos.
- Licencia MIT, que permite uso comercial, pero sin garantías del autor sobre idoneidad regulatoria.
- Modelo de nicho con 26 descargas y sin validación externa publicada; conviene evaluarlo sobre datos propios antes de producción.
- No se documenta el límite de tokens de entrada; el modelo base BERT admite 512, y listas de ingredientes más largas podrían truncarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bianca08/etichetai-alergeni-bert
- Modelo base: https://huggingface.co/dumitrescustefan/bert-base-romanian-cased-v1
- Open Food Facts (origen de los datos, ODbL): https://world.openfoodfacts.org
- Reglamento (UE) 1169/2011 sobre información alimentaria: https://eur-lex.europa.eu/eli/reg/2011/1169/oj
