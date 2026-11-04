# Shroomy/tinydistill-financial-tweets-minilm

## Resumen

`tinydistill-financial-tweets-minilm` es un clasificador de texto de tres clases (bajista, alcista y neutral) para mensajes financieros cortos, destilado por el usuario Shroomy a partir de `Qwen/Qwen2.5-7B-Instruct` sobre el modelo estudiante `sentence-transformers/all-MiniLM-L6-v2`. El resultado se exporta a ONNX para inferencia rápida en CPU y se distribuye con licencia MIT. El modelo resuelve el problema de analizar sentimiento en tuits y noticias financieras con un coste computacional mínimo, manteniendo una precisión cercana a la del profesor de 7 mil millones de parámetros.

La propuesta técnica es una destilación de conocimiento pura: el estudiante nunca ve etiquetas humanas durante el entrenamiento, solo las etiquetas suaves que genera el profesor sobre 9.543 textos sin etiquetar. El modelo base MiniLM aporta una arquitectura transformer compacta con embeddings de 384 dimensiones, mientras que la exportación a ONNX permite ejecutarlo en CPU con latencias de 2,5 ms por texto en su variante int8.

Su relevancia actual reside en la relación calidad-coste: un clasificador de 23 MB en int8 que alcanza un Macro-F1 de 0,762 frente al 0,788 del profesor cuantizado a 4 bits, con una aceleración de 20,9 veces en latencia de lote 1 y una huella de memoria 236 veces menor. Esto lo hace adecuado para pipelines de análisis de sentimiento a gran escala donde el despliegue de un LLM sería prohibitivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT, base `sentence-transformers/all-MiniLM-L6-v2`) |
| Parametros totales | No disponible (el modelo base MiniLM-L6 tiene aproximadamente 22,7 M, dato no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | ONNX fp32 y ONNX int8 (el modelo base se distribuye tambien en formato PyTorch) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | ONNX (fp32 e int8); el estudiante original en PyTorch |

## Arquitectura y entrenamiento

El estudiante es un transformer encoder de la familia BERT, concretamente la variante MiniLM-L6 de `sentence-transformers`, con 6 capas y embeddings de 384 dimensiones. El profesor es `Qwen/Qwen2.5-7B-Instruct`, un modelo decoder-only de 7 mil millones de parametros. La destilacion se realiza con la herramienta `tinydistill` (repositorio de Andreas-Hum): el profesor genera etiquetas suaves sobre 9.543 textos de entrenamiento sin etiquetar del dataset `zeroshot/twitter-financial-news-sentiment`, y el estudiante aprende a imitar esa distribucion de probabilidad mediante una perdida de destilacion. No se emplean etiquetas humanas en el entrenamiento del estudiante.

No se documenta el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de su origen en tuits financieros. Tampoco se especifica si hubo aumento de datos, tecnicas de RLHF o DPO (no aplicables a un clasificador de este tipo). La innovacion destacable es el flujo completo de destilacion con exportacion a ONNX y cuantizacion int8, que reduce el modelo de 91 MB a 23 MB con una perdida de precision de solo 0,007 en accuracy (de 0,827 a 0,820). El autor reporta medias y desviaciones estandar sobre 3 semillas de entrenamiento, lo que aporta robustez a las cifras.

## Capacidades

- Clasificacion de sentimiento financiero en tres clases: `bearish` (bajista), `bullish` (alcista) y `neutral`.
- Inferencia en CPU con latencia de 2,5 ms por texto en ONNX int8 (lote 1, 2 hilos).
- Throughput de 302,6 textos por segundo en ONNX int8 en CPU.
- Ejecucion en GPU mediante la variante PyTorch del estudiante (5,6 ms por texto en lote 1).
- Integracion con la libreria `tinydistill` mediante `Predictor` y linea de comandos (`predict` y `serve`).
- Compatibilidad con Text Embeddings Inference y endpoints compatibles, segun los tags del repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio: es un clasificador de texto puro.

## Casos de uso

- Monitorizacion de sentimiento en redes sociales financieras: el modelo clasifica en tiempo real miles de tuits por segundo (302 textos/s en int8) para detectar cambios de opinion sobre activos concretos, algo inviable con un LLM de 7B en el mismo hardware.
- Filtrado previo en pipelines de noticias: se usa como primera etapa para descartar o priorizar noticias segun su polaridad antes de enviarlas a un modelo mayor, reduciendo coste y latencia del sistema completo.
- Senal de trading algoritmico de alta frecuencia: la latencia de 2,5 ms permite incorporar el sentimiento como feature en modelos de ejecucion que operan en escalas de segundos.
- Enriquecimiento de datasets historicos: clasificar grandes volumenes de tuits financieros ya archivados para construir series temporales de sentimiento sin incurrir en costes de GPU.
- Cascada con el profesor para maximizar precision: el autor documenta un esquema en el que el estudiante responde todo y deriva al profesor (Qwen2.5-7B) el 10-30 % de textos con menor confianza, alcanzando accuracy de 0,830-0,838 con latencias medias de 7,7-18,2 ms, utiles cuando se requiere precision cercana al LLM con coste controlado.
- Alertas de riesgo reputacional: integrado en un sistema de monitorizacion de menciones de marca o empresa, dispara avisos cuando el sentimiento agregado cae por debajo de un umbral, con despliegue en CPU sin GPU dedicada.
- Despliegue en entornos edge o contenedores ligeros: los 23 MB del modelo int8 permiten ejecutarlo en dispositivos con recursos limitados o en funciones serverless con arranque en frio minimo.

## Benchmarks y rendimiento

Datos reportados por el autor sobre 2.388 textos de test con etiqueta dorada del dataset `financial-tweets`:

| Modelo | Dispositivo | Accuracy | Macro-F1 | Acuerdo con el profesor | Latencia lote 1 (ms) | Latencia lote 32 (ms) | Throughput (textos/s) | Tamano (MB) | Aceleracion lote 1 |
|---|---|---|---|---|---|---|---|---|---|
| Profesor, zero-shot, 4-bit | cuda | 0,832 | 0,788 | n/a | 52,3 | 402,7 | 79,5 | 5443 | 1,0x |
| Estudiante, PyTorch | cpu | 0,825 ± 0,007 | 0,768 ± 0,009 | 0,870 ± 0,005 | 5,6 | 168,3 | 190,1 | 91 | 9,3x |
| Estudiante, ONNX fp32 | cpu | 0,827 | 0,770 | 0,874 | 4,0 | 185,5 | 172,5 | 91 | 13,0x |
| Estudiante, ONNX int8 | cpu | 0,820 | 0,762 | 0,869 | 2,5 | 105,7 | 302,6 | 23 | 20,9x |
| Cota superior: estudiante con etiquetas doradas | cpu | 0,874 ± 0,005 | 0,832 ± 0,007 | 0,811 ± 0,003 | n/a | n/a | n/a | n/a | n/a |

Cascada estudiante-profesor (el estudiante responde todo y deriva al profesor los textos de menor confianza):

| Porcentaje derivado al profesor | Umbral de confianza del estudiante | Accuracy | Macro-F1 | Latencia media por texto (ms) |
|---|---|---|---|---|
| 0 % | 0,447 | 0,820 | 0,762 | 2,5 |
| 10 % | 0,836 | 0,830 | 0,775 | 7,7 |
| 20 % | 0,940 | 0,835 | 0,785 | 13,0 |
| 30 % | 0,977 | 0,838 | 0,790 | 18,2 |
| 50 % | 0,993 | 0,835 | 0,790 | 28,7 |
| 100 % | 1,000 | 0,832 | 0,788 | 54,8 |

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU; el modelo ONNX int8 ocupa 23 MB y el fp32 91 MB, por lo que cabe en cualquier CPU moderna con unos pocos cientos de MB de RAM libre.
- GPU recomendadas: no son necesarias; si se usa la variante PyTorch, cualquier GPU con al menos 1 GB de VRAM es suficiente (el modelo pesa 91 MB). El profesor de referencia requiere una GPU con capacidad para 5,4 GB en cuantizacion 4-bit.
- Cabe en GPU de consumo: si, en cualquier RTX o GTX con mas de 1 GB de VRAM, e incluso en iGPU.
- Opciones de despliegue: `tinydistill` (`Predictor` y `serve`), ONNX Runtime, Text Embeddings Inference (segun tags), y cualquier runtime compatible con ONNX. No se documenta soporte nativo para vLLM, llama.cpp u Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: 2,5 ms por texto en lote 1 y 302,6 textos/s en ONNX int8 con CPU de 2 hilos; 4,0 ms y 172,5 textos/s en fp32; 5,6 ms y 190,1 textos/s en PyTorch CPU. En lote 32, 105,7 ms (int8) y 185,5 ms (fp32).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros clasificadores de sentimiento financiero en la informacion proporcionada, por lo que la comparativa se limita a las alternativas internas documentadas por el autor:

| Alternativa | Parametros | Contexto | Accuracy | Macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (ONNX int8) | No disponible (MiniLM-L6) | No disponible | 0,820 | 0,762 | MIT | HuggingFace, 23 MB |
| Profesor Qwen2.5-7B-Instruct (zero-shot, 4-bit) | 7 mil millones | No disponible | 0,832 | 0,788 | No disponible en la ficha | Requiere GPU, 5,4 GB |
| Estudiante con etiquetas doradas (cota superior) | No disponible (MiniLM-L6) | No disponible | 0,874 | 0,832 | No aplica (referencia) | No distribuido |
| Cascada estudiante + profesor (20 % derivado) | Combinacion | No disponible | 0,835 | 0,785 | Mixta | Requiere ambos modelos |

## Limitaciones y advertencias

- Entrenado exclusivamente con etiquetas suaves del profesor sobre 9.543 textos; no ha visto etiquetas humanas, lo que limita su techo de precision al 0,874 de accuracy que alcanzaria con supervision directa.
- El dominio esta restringido a texto financiero corto (tuits y noticias); su comportamiento en otros dominios o en textos largos no esta documentado.
- Idiomas soportados no especificados; el dataset de origen es predominantemente en ingles, por lo que el rendimiento en castellano es incierto.
- Riesgo de alucinacion no aplicable en sentido estricto (es un clasificador), pero si de clasificaciones erroneas en textos ambiguos, ironicos o con jerga financiera no vista en entrenamiento.
- Sesgos potenciales derivados del dataset de tuits financieros: posible sobrerrepresentacion de ciertos activos, periodos temporales o sesgos de plataforma.
- Licencia MIT declarada por el subidor, pero la model card advierte de que deben revisarse las licencias del modelo estudiante, del profesor y de los datos de entrenamiento antes de un uso comercial.
- El umbral de confianza de la cascada se fijo sobre el conjunto de test; en produccion debe recalibrarse sobre una particion de validacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.
- El modelo no es generativo: no soporta tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shroomy/tinydistill-financial-tweets-minilm
- Repositorio de tinydistill: https://github.com/Andreas-Hum/tinydistill
- Modelo base estudiante: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/zeroshot/twitter-financial-news-sentiment
