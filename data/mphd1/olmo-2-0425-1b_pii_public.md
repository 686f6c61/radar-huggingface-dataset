# mphd1/OLMo-2-0425-1B_pii_public

## Resumen

`mphd1/OLMo-2-0425-1B_pii_public` es un ajuste fino (fine-tuning) del modelo base `allenai/OLMo-2-0425-1B`, el miembro mas pequeno de la familia OLMo 2 desarrollada por el Allen Institute for AI (AI2). El modelo base es un transformer decoder-only denso de aproximadamente 1.485 millones de parametros (1,48 B), disenado para la generacion de texto y publicado bajo licencia Apache 2.0. Este ajuste concreto ha sido entrenado por el usuario `mphd1` partiendo del checkpoint base y conserva la misma arquitectura y licencia.

La relevancia de este artefacto reside en su caracter de modelo derivado: el autor lo ha entrenado con el `Trainer` de Hugging Face sobre un dataset no especificado (el nombre sugiere un corpus relacionado con datos de caracter personal, PII), durante 10 epocas con una tasa de aprendizaje de 5e-5 y un scheduler coseno. No obstante, la model card es practicamente vacia en cuanto a descripcion, datos de entrenamiento, evaluacion y usos previstos, por lo que la mayor parte de las especificaciones tecnicas deben inferirse del modelo base o marcarse como no disponibles.

El modelo tiene cero descargas y cero likes en el momento de la consulta, fue creado el 6 de noviembre de 2026 y su repositorio ocupa 5,9 GB en formato safetensors. Se trata, por tanto, de un experimento de ajuste fino de proposito no documentado, sin benchmarks publicados y sin garantias de calidad, adecuado unicamente para evaluacion interna o como punto de partida para experimentacion con la familia OLMo 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia OLMo 2) |
| Parametros totales | 1.484.916.736 (1,48 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base OLMo 2 1B soporta contexto largo, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion posterior via herramientas externas) |
| Idiomas soportados | no disponible (no declarados por el autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | allenai/OLMo-2-0425-1B |
| Libreria | transformers |
| Tamano del repositorio | 5,9 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-06 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del OLMo 2 1B de AI2: un transformer decoder-only denso con atencion causal estandar, sin mezcla de expertos (MoE) ni componentes de estado recurrente (SSM). El modelo base fue preentrenado sobre el corpus OLMo-mix-1124 y sometido a una fase de mid-training con Dolmino-mix-1124, segun la documentacion oficial de AI2. No se dispone de detalles adicionales sobre la configuracion exacta de capas, dimensiones ocultas o cabezas de atencion en la informacion proporcionada.

El ajuste fino documentado en esta ficha se realizo con el `Trainer` de Hugging Face (Transformers 4.47.1, PyTorch 2.5.1+cu121, Datasets 5.0.1, Tokenizers 0.21.4) durante 10 epocas, con batch de entrenamiento y evaluacion de 8, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, tasa de aprendizaje 5e-5, scheduler coseno y semilla 1. El dataset de entrenamiento no se especifica ("unknown dataset" en la model card). No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni innovaciones tecnicas propias mas alla de las del modelo base.

## Capacidades

- Generacion de texto autoregresiva en ingles (idioma del modelo base; no se declaran otros idiomas).
- Razonamiento basico y respuesta a preguntas, limitado por el tamano de 1,48 B parametros.
- Generacion de codigo y matematicas a nivel basico, segun las capacidades del OLMo 2 1B original.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta capacidad de vision, audio ni modo de razonamiento extendido (thinking mode).
- Capacidades multilingues: no disponibles; el autor no declara idiomas soportados.

## Casos de uso

- Experimentacion academica con ajuste fino: el modelo sirve como ejemplo reproducible de fine-tuning de un OLMo 2 1B con hiperparametros documentados, util para estudiar el efecto de 10 epocas a 5e-5 sobre un corpus pequeno.
- Investigacion sobre datos personales (PII): dado el nombre del repositorio, puede emplearse como caso de estudio para evaluar como un ajuste fino sobre datos sensibles afecta a la generacion y memorizacion de informacion personal, siempre en entornos controlados.
- Base para tareas de clasificacion o extraccion de entidades: con un ajuste adicional ligero, el modelo puede adaptarse a tareas de etiquetado de texto en ingles, aprovechando su tamano reducido para iterar rapidamente.
- Despliegue en entornos con recursos limitados: con 1,48 B parametros, el modelo cabe en GPUs de consumo tras cuantizacion a 8 o 4 bits, lo que permite prototipado local sin infraestructura dedicada.
- Generacion de texto auxiliar en pipelines internos: su tamano permite integrarlo como componente de generacion de borradores o resumenes en flujos donde la latencia y el coste importan mas que la calidad puntera.
- Evaluacion comparativa de ajustes finos: util como linea base para medir degradacion o mejora frente al OLMo 2 1B original en tareas concretas, dado que comparte arquitectura y tokenizador con el base.

## Benchmarks y rendimiento

El autor no ha declarado resultados de benchmarks (la lista `results` del model-index esta vacia). No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa de 4-6 GB en total para contextos moderados).
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,5-2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 1-1,5 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 4090, A10, L4); GPUs de datacenter como A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en modelos como RTX 3060, RTX 4060, RTX 4070 o superiores, especialmente con cuantizacion.
- Opciones de despliegue: transformers (nativo), vLLM, TGI, llama.cpp y Ollama tras conversion a GGUF, aunque la conversion no esta documentada por el autor.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mphd1/OLMo-2-0425-1B_pii_public | 1,48 B | no disponible | Apache 2.0 | Hugging Face | Ajuste fino sin documentar ni benchmarks |
| allenai/OLMo-2-0425-1B | 1,48 B | no disponible en esta ficha | Apache 2.0 | Hugging Face | Modelo base oficial de AI2, con model card completa |
| Modelos comparables de ~1-2 B (p. ej. variantes TinyLlama o Qwen pequeños) | ~1-2 B | variable | variable | Hugging Face | No se dispone de datos verificados en la informacion proporcionada para establecer comparacion cuantitativa |

No se dispone de resultados de benchmarks del modelo ajustado ni de datos suficientes en la informacion proporcionada para una comparacion cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan datos de entrenamiento, evaluacion, usos previstos ni limitaciones, lo que impide evaluar su calidad y sesgos.
- Riesgo elevado de alucinacion y de comportamiento impredecible, al ser un ajuste fino sobre un dataset desconocido durante 10 epocas, un regimen que puede provocar sobreajuste.
- Posible memorizacion de datos personales: el nombre del repositorio sugiere entrenamiento con PII, lo que plantea riesgos de privacidad y de reproduccion de informacion sensible.
- Idiomas soportados no declarados; se asume ingles por herencia del modelo base, pero no esta confirmado.
- Longitud de contexto no documentada en esta ficha; debe consultarse la model card del modelo base antes de usarlo en produccion.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre el dataset de ajuste traslada al usuario la responsabilidad legal sobre los datos empleados.
- Cero descargas y cero likes: no existe evidencia de uso ni validacion por parte de la comunidad.
- No apto para produccion sin una evaluacion previa exhaustiva en las tareas objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mphd1/OLMo-2-0425-1B_pii_public
- Modelo base OLMo 2 1B: https://huggingface.co/allenai/OLMo-2-0425-1B
- README del modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B/blob/main/README.md
