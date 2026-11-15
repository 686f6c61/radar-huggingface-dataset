# H5R5/novurapay-ijyad

## Resumen

novurapay-ijyad es un ajuste fino (fine-tune) del modelo `IJyad/jeb` orientado a la clasificación de tickets de soporte en árabe iraquí y lenguas kurdas (sorani/ckb y kurmanji/kmr). Lo publica el usuario H5R5 como parte del reto Agentic AI Challenge Iraq, dentro del proyecto SupportPipe / NovuraPay (Topic 06). El modelo base es un encoder MARBERTv2 con una cabeza de dos capas y un scorer de token [MASK], y los pesos distribuidos son checkpoints en formato state-dict (`ijyad_v5.pt`), no safetensors ni GGUF.

El repositorio contiene un único artefacto relevante, `ijyad_v5.pt`, entrenado sobre 168.762 tickets sintéticos (120.671 únicos) en árabe y kurdo. No se trata de un modelo generativo sino de un clasificador de texto: su función es asignar categorías a tickets de atención al cliente en un contexto lingüístico (Irak) poco cubierto por los modelos multilingües estándar.

La relevancia es doble. Por un lado, aborda un nicho real de soporte técnico en dialectos árabes y kurdos. Por otro, la propia model card advierte de que los datos son completamente sintéticos y de que la evaluación presenta solapamiento con el entrenamiento: un baseline de vecino más cercano ya alcanza entre el 96,8 % y el 99,4 %, por lo que las métricas publicadas no deben interpretarse como rendimiento en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder MARBERTv2 con cabeza de dos capas y scorer [MASK] (base: IJyad/jeb) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ar (árabe, incluido iraquí), ckb (sorani), kmr (kurmanji) |
| Licencia | Apache 2.0 |
| Formato de pesos | state-dict PyTorch (`ijyad_v5.pt`); no safetensors, no GGUF |

## Arquitectura y entrenamiento

El modelo parte de `IJyad/jeb`, que según la model card es un encoder MARBERTv2 con una cabeza de dos capas y un scorer de token [MASK]. Sobre esa base se ha realizado un fine-tune de clasificación de tickets de soporte. El checkpoint distribuido (`ijyad_v5.pt`) contiene únicamente tensores, sin código serializado, lo que reduce el riesgo de ejecución arbitraria al cargarlo.

El entrenamiento empleó 168.762 tickets sintéticos (120.671 únicos) en árabe y kurdo, generados de forma totalmente sintética: no se usaron datos reales de clientes. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, la duración del entrenamiento ni si hubo etapas de RLHF o DPO (poco probables en un clasificador). La model card incluye una advertencia explícita sobre el solapamiento entre evaluación y entrenamiento, remitiendo a `docs/DATA_OVERLAP_AUDIT.md` en el repositorio del proyecto.

## Capacidades

- Clasificación de tickets de soporte en árabe iraquí y kurdos (sorani y kurmanji).
- Etiquetado de categorías de atención al cliente a partir de texto corto o medio.
- Cobertura de variedades dialectales poco representadas en modelos multilingües genéricos.
- Inferencia en PyTorch mediante carga de state-dict.
- No se documentan capacidades de generación de texto, tool calling, razonamiento multi-paso, visión ni audio.
- No se documenta modo "thinking" ni decodificación especulativa.

## Casos de uso

- Triaje automático de tickets en centros de soporte en Irak: el clasificador asigna cada ticket entrante a la cola o categoría correspondiente, aprovechando su entrenamiento específico en árabe iraquí y kurdos.
- Enrutamiento bilingüe árabe-kurdo: permite dirigir tickets a agentes que hablan sorani o kurmanji sin depender de traducción previa a inglés.
- Etiquetado previo en pipelines de datos: usar el modelo para preclasificar grandes volúmenes de tickets históricos antes de una revisión humana.
- Filtrado y priorización en bandejas de entrada de soporte: detección de categorías para priorizar incidencias críticas dentro de un flujo de atención.
- Investigación sobre dialectos árabes y kurdos: modelo de referencia para experimentos de clasificación en variedades poco cubiertas, siempre con validación sobre datos reales.
- Prototipado rápido en entornos con recursos limitados: al ser un encoder de tamaño moderado (repo de 0,7 GB), puede desplegarse en CPU o GPU de gama media para pruebas de concepto.
- Componente de un sistema agéntico mayor: como clasificador de intención dentro de un pipeline que derive el ticket a un LLM generativo o a un humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que un baseline de vecino más cercano alcanza entre el 96,8 % y el 99,4 % sobre los lotes de evaluación, lo que sugiere que las métricas internas del modelo están infladas por solapamiento entre evaluación y entrenamiento. No se ofrecen cifras de MMLU, HumanEval, GSM8K ni de exactitud/F1 del clasificador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo ocupa 0,7 GB, lo que sugiere un encoder de tamaño moderado que cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no disponibles de forma específica; por tamaño, debería ejecutarse en RTX 3060/4060 en adelante, así como en A100/H100 sin problema.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del checkpoint, aunque no se confirma en la información disponible.
- Opciones de despliegue: carga directa en PyTorch mediante state-dict; el autor proporciona un script (`scripts/download_ijyad_models.py --only v5`) para descargar los pesos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| novurapay-ijyad | Clasificador (encoder MARBERTv2) | ar, ckb, kmr | no disponible | Apache 2.0 | Hugging Face (state-dict) |
| IJyad/jeb (modelo base) | Encoder MARBERTv2 | no disponible | no disponible | no disponible | Hugging Face |
| MARBERTv2 | Encoder BERT para árabe | ar | 512 tokens (estándar BERT) | no disponible | Hugging Face |
| XLM-RoBERTa (base) | Encoder multilingüe | 100 idiomas (incluye ar, ku) | 512 tokens | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- Datos de entrenamiento y evaluación totalmente sintéticos: el rendimiento en tickets reales puede diferir sustancialmente del reportado.
- Solapamiento entre evaluación y entrenamiento: un baseline de vecino más cercano alcanza 96,8–99,4 %, lo que invalida las métricas internas como estimación de generalización.
- No es un modelo generativo: solo clasifica; no puede redactar respuestas ni mantener conversaciones.
- Idiomas limitados a árabe (incluido iraquí) y kurdos (ckb, kmr); no se documenta cobertura de otros idiomas.
- Formato de pesos en state-dict `.pt`: requiere cargar tensores manualmente y no es directamente compatible con herramientas estándar de despliegue como vLLM u Ollama.
- Sin información sobre sesgos, calibración ni comportamiento en dominios distintos al de soporte al cliente.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación con datos reales desaconseja su uso en producción sin una evaluación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/H5R5/novurapay-ijyad
- Modelo base: https://huggingface.co/IJyad/jeb
- Repositorio del proyecto (referenciado en la model card, ruta `docs/DATA_OVERLAP_AUDIT.md`): no disponible como URL directa en la información proporcionada.
