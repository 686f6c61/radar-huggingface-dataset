# BeardedMonster/SabiBERTa-135M-afrisenti-multilingual

## Resumen

SabiBERTa-135M-afrisenti-multilingual es un modelo de clasificación de secuencias (análisis de sentimiento) obtenido por fine-tuning del encoder `BeardedMonster/SabiBERTa-135M`, un transformer de arquitectura ModernBERT con 135.285.504 parámetros, sobre el corpus AfriSenti en su protocolo multilingüe. Lo desarrolla el usuario de Hugging Face BeardedMonster y cubre 12 lenguas: amh (amárico), arq (árabe argelino), ary (árabe marroquí), hau (hausa), ibo (igbo), kin (kinyarwanda), pcm (pidgin nigeriano), por (portugués), swa (suajili), tso (tsonga), twi y yor (yoruba).

El modelo resuelve una tarea concreta: asignar una etiqueta de polaridad a textos cortos en lenguas africanas y en portugués, un ámbito donde los clasificadores multilingües genéricos suelen rendir por debajo de lo esperado por falta de datos de ajuste. Su relevancia práctica está en el tamaño: 135 M de parámetros y un repo de 0,5 GB permiten inferencia en CPU o en cualquier GPU de consumo, lo que lo hace utilizable en entornos con recursos limitados.

La ficha técnica tiene dos particularidades importantes. La primera es que no es un `AutoModelForSequenceClassification` estándar: el token `<cls>` del encoder base nunca se entrenó, de modo que la cabeza es una capa lineal única guardada aparte en `head.pt` y la agregación se hace por mean pooling sobre la máscara de atención. La segunda es que la puntuación publicada (F1 ponderado medio de 0,5896 sobre 12 lenguas) proviene de una sola ejecución, sin promedio sobre semillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ModernBERT con cabeza lineal de clasificación sobre mean pooling |
| Parametros totales | 135.285.504 (~135 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el fine-tuning se hizo con max_length = 256 |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos safetensors) |
| Idiomas soportados | 12: amh, arq, ary, hau, ibo, kin, pcm, por, swa, tso, twi, yor |
| Licencia | no disponible; la model card remite a la licencia y términos del modelo base `BeardedMonster/SabiBERTa-135M` |
| Formato de pesos | safetensors (encoder) + `head.pt` (cabeza lineal en PyTorch) + `labels.json` |

## Arquitectura y entrenamiento

El encoder es un ModernBERT de 135 M de parámetros, según la etiqueta `modernbert` del repositorio y el modelo base declarado. Sobre él se añade una única capa lineal cuya entrada no es el token `<cls>` sino el promedio de los estados ocultos ponderado por la máscara de atención. Este detalle es crítico: la model card advierte explícitamente que el `<cls>` del encoder base nunca se entrenó, por lo que cargar el checkpoint con `AutoModelForSequenceClassification` produce resultados incorrectos. El `hidden_size` de la capa de entrada se lee de `enc.config.hidden_size` y el número de clases de `labels.json`.

El ajuste se realizó sobre el corpus AfriSenti en su configuración multilingüe, con 20 épocas, tasa de aprendizaje 5e-05, tamaño de lote 32 y longitud máxima de 256 tokens. La métrica objetivo fue el F1 ponderado, con un resultado medio de 0,5896 entre las 12 lenguas; los valores por lengua están en `metrics.json` del repositorio, aunque no se incluyen en la información disponible. No se documenta en la model card el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables, por otra parte, a una tarea de clasificación). El autor señala que el harness de evaluación reproduce los baselines publicados de MasakhaNER 2.0 con una tolerancia de ~0,25 F1, de modo que las cifras estarían calibradas, pero insiste en que se trata de una única ejecución frente a las 5 medias de los papers de referencia.

## Capacidades

- Clasificación de sentimiento multilingüe en 12 lenguas africanas y portugués, con una etiqueta por texto.
- Procesamiento de textos cortos de dominio social (tuits y similares), que es el dominio de AfriSenti.
- Inferencia por lotes: la función de ejemplo tokeniza con `padding=True` y `truncation=True`, apta para clasificar miles de textos en una sola pasada.
- Funciona como extractor de representaciones: al ser un encoder, `AutoModel` devuelve `last_hidden_state` reutilizable para otras cabezas (NER, topic classification, retrieval).
- Ejecución en CPU: 135 M de parámetros hacen viable el despliegue sin GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un clasificador, no un modelo generativo.
- No dispone de modo "thinking" ni de generación de texto libre; la salida es un índice de clase mapeado a través de `labels.json`.

## Casos de uso

- Monitorización de opinión en redes sociales: clasificar tuits en suajili, hausa, yoruba o pidgin nigeriano para medir polaridad hacia una marca o una campaña, aprovechando que el modelo está ajustado exactamente sobre el dominio y las lenguas de AfriSenti.
- Triage de feedback de cliente multilingüe: enrutar tickets en amárico, igbo o kinyarwanda hacia colas de "positivo", "negativo" o "neutro" antes de la revisión humana, con un coste de cómputo mínimo por integrarse en CPU.
- Investigación en PLN de bajos recursos: servir de baseline reproducible para comparar nuevas técnicas sobre AfriSenti, ya que el autor documenta hiperparámetros y metodología de evaluación.
- Anotación asistida: preetiquetar grandes volúmenes de texto para que anotadores humanos solo revisen, reduciendo el coste por etiqueta; el F1 de 0,5896 hace recomendable mantener revisión humana.
- Moderación de contenido preliminar: filtrar mensajes potencialmente negativos o de toxicidad en comunidades multilingües africanas como primera etapa de un pipeline, con un modelo secundario para las decisiones finales.
- Análisis de mercado en lusófono y africano: usar la cobertura de `por` junto con las lenguas africanas para comparar sentimiento entre mercados en un único modelo, evitando mantener dos clasificadores separados.
- Extracción de embeddings para búsqueda semántica: reutilizar el encoder con mean pooling (la misma agregación que usa la cabeza) para indexar documentos en estas 12 lenguas.

## Benchmarks y rendimiento

| Metrica | Valor | Detalle |
|---|---|---|
| F1 ponderado (weighted_f1), media sobre 12 lenguas | 0,5896 | Protocolo multilingüe de AfriSenti, una sola ejecución |
| F1 ponderado por lengua | no disponible | El autor indica que están en `metrics.json`, no incluido en la información proporcionada |
| Comparación con baselines de MasakhaNER 2.0 | ~0,25 F1 de tolerancia declarada | Solo como validación del harness de evaluación, no como resultado de este modelo |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras tareas generativas, que además no aplican a un clasificador encoder-only.

## Requisitos de hardware

- VRAM estimada: ~0,54 GB para los pesos en FP32 (135,3 M × 4 bytes); ~0,27 GB en FP16/BF16; ~0,14 GB en INT8. Con lote de 32 y longitud 256, el pico real de memoria en inferencia se mantiene previsiblemente por debajo de 2 GB en FP32.
- GPU recomendadas: cualquier GPU con 4 GB o más (T4, L4, GTX 1650, RTX 3050 en adelante). Una RTX 4090 o una A100 están sobredimensionadas para este modelo; su interés sería solo el throughput por lotes muy grandes.
- Cabe en GPU de consumo: sí, en todas las GPU discretas modernas e incluso en iGPU con memoria compartida suficiente.
- CPU: viable. El modelo es lo bastante pequeño para servir en CPU con `torch.set_num_threads` ajustado, especialmente con cuantización dinámica INT8 de PyTorch.
- Opciones de despliegue: `transformers` con PyTorch (vía de referencia de la model card), exportación a ONNX Runtime para producción en CPU, TorchServe o FastAPI como servicio propio, Hugging Face Inference Endpoints. vLLM, TGI y llama.cpp no son aplicables: no hay decoder autoregresivo ni pesos GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

Los datos de los modelos comparados son orientativos, tomados de documentación pública, y no forman parte de la información proporcionada sobre este checkpoint.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SabiBERTa-135M-afrisenti-multilingual | 135 M | max_length de ajuste 256; contexto nativo no disponible | Clasificador de sentimiento AfriSenti, 12 lenguas | no disponible (hereda del base) | Hugging Face, repo de 0,5 GB |
| AfroXLMR-base | ~278 M (hereda el tamaño de XLM-R base) | hasta 512 en la práctica | Encoder multilingüe con preentrenamiento adaptado a lenguas africanas; requiere fine-tuning por tarea | MIT según su model card (verificar) | Hugging Face |
| AfriBERTa-base | ~126 M | 512 | Encoder entrenado desde cero en lenguas africanas; requiere fine-tuning por tarea | MIT según su model card (verificar) | Hugging Face |
| XLM-R base | ~278 M | 512 | Encoder multilingüe generalista; requiere fine-tuning por tarea | MIT según su model card (verificar) | Hugging Face |

La diferencia clave frente a los tres comparados es que este checkpoint ya viene ajustado para sentimiento en 12 lenguas, mientras que los otros son bases que exigen entrenar la cabeza. La contrapartida es que su licencia no está declarada de forma explícita y su cabeza no es estándar.

## Limitaciones y advertencias

- Licencia no declarada: la model card remite a la licencia y términos de `BeardedMonster/SabiBERTa-135M`. Antes de un uso comercial hay que verificar ese repositorio; la información disponible no permite confirmar permisos.
- Cabeza no estándar: no funciona con `pipeline("text-classification")` ni con `AutoModelForSequenceClassification`. Es obligatorio descargar `head.pt` y `labels.json` y replicar el mean pooling; usar `<cls>` produce salidas incorrectas.
- Evaluación de una sola ejecución: el autor advierte que las diferencias pequeñas frente a otros sistemas deben tratarse como ruido, ya que los papers de referencia promedian 5 semillas.
- Rendimiento moderado: un F1 ponderado medio de 0,5896 implica que aproximadamente 4 de cada 10 ejemplos se clasifican mal en el agregado; no es apto para decisiones automáticas sin revisión humana.
- Métrica agregada por clase: el F1 ponderado enmascara el comportamiento en clases minoritarias, algo relevante en AfriSenti por el desbalanceo del corpus. Los valores por lengua y por clase no están disponibles en la información proporcionada.
- Truncación a 256 tokens: los textos más largos se recortan, con pérdida de contexto y posible cambio de polaridad en documentos extensos.
- Dominio limitado a redes sociales: el comportamiento en textos formales, técnicos o literarios no está caracterizado.
- Cobertura lingüística restringida a las 12 lenguas listadas; no se ha evaluado en otras lenguas africanas ni en variantes dialectales no incluidas.
- Riesgo de sesgo: el modelo aprende las distribuciones y anotaciones de AfriSenti, incluyendo posibles sesgos de anotador, de género o geográficos presentes en el corpus original. No se documentan análisis de sesgo.
- Sin calibración documentada: no hay información sobre fiabilidad de las probabilidades de salida, por lo que no conviene usar los logits como umbral de confianza sin validación propia.
- Los resultados de búsqueda web devueltos para esta consulta no contenían información relevante sobre el modelo (correspondían a ligas de hockey), por lo que no se ha podido contrastar nada fuera de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/SabiBERTa-135M-afrisenti-multilingual
- Modelo base: https://huggingface.co/BeardedMonster/SabiBERTa-135M
- Archivos auxiliares del repo: `metrics.json`, `labels.json`, `head.pt` (accesibles vía `hf_hub_download` desde el repositorio del modelo)
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales relevantes para este modelo.
