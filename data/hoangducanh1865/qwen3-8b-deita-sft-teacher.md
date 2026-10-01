# hoangducanh1865/qwen3-8b-deita-sft-teacher

## Resumen

qwen3-8b-deita-sft-teacher es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3-8B-Base, publicado por el usuario hoangducanh1865 en HuggingFace. El entrenamiento se realizo sobre el dataset HuggingFaceH4/deita-10k-v0-sft, un conjunto de conversaciones de alta calidad orientado a instrucciones y alineamiento, durante una sola epoca, con learning rate de 2,5e-05, programador coseno con warmup del 10 por ciento y un batch total de 32 en configuracion multi-GPU (2 dispositivos, AdamW con betas 0,9 y 0,999).

Tecnicamente es un transformer decoder-only denso de 8.190.735.360 parametros, almacenado en safetensors con un repositorio de 16,4 GB y licencia Apache 2.0. No es un modelo MoE, por lo que no hay parametros activos que reportar. El sufijo "teacher" del nombre sugiere un uso previsto como modelo profesor en pipelines de destilacion o generacion de datos, aunque la model card no lo confirma explicitamente.

Su relevancia actual es experimental y de nicho: el repositorio acumula 0 descargas y 0 likes, la model card esta generada automaticamente por el Trainer de HuggingFace y contiene secciones vacias ("More information needed"). No se declaran resultados de benchmarks, idiomas soportados ni longitud de contexto, por lo que debe tratarse como un artefacto de investigacion reproducible mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3; detalles no especificados en la model card) |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen/Qwen3-8B-Base) |
| Tipos de cuantizacion | No disponible: el repositorio solo contiene pesos en safetensors, sin versiones GGUF, AWQ, GPTQ ni bitsandbytes publicadas |
| Idiomas soportados | No disponible en la model card; el dataset de entrenamiento (DEITA-10k) es predominantemente en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-8B-Base |
| Dataset de entrenamiento | HuggingFaceH4/deita-10k-v0-sft |
| Tamano del repositorio | 16,4 GB |
| Libreria | transformers (entrenado con Transformers 4.51.3, PyTorch 2.11.0+cu128, Datasets 3.2.0, Tokenizers 0.21.4) |
| Fecha de creacion | 2026-10-01 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3-8B-Base, un transformer decoder-only denso de 8.190.735.360 parametros. Esta ficha no documenta variaciones arquitectonicas introducidas por el autor: no hay evidencia de atencion lineal, capas SSM, mezcla de expertos ni decodificacion especulativa. Tampoco se especifican la dimension oculta, el numero de capas, el numero de cabezas de atencion ni el tokenizador empleado, datos que habria que consultar en la model card del modelo base.

El proceso de entrenamiento es un SFT estandar con el framework alignment-handbook: 1 epoca sobre HuggingFaceH4/deita-10k-v0-sft, learning rate 2,5e-05, batch de entrenamiento 16 por dispositivo y 32 total (2 GPUs), batch de evaluacion 1 por dispositivo y 2 total, semilla 42, optimizador AdamW Torch con epsilon 1e-08, programador coseno y warmup ratio 0,1. No se reporta el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases posteriores de RLHF, DPO o PPO. Tampoco se documenta la plantilla de chat utilizada durante el SFT, un detalle critico porque el modelo base es una variante "Base" sin la plantilla de instrucciones del modelo Qwen3-8B Instruct.

## Capacidades

- Generacion de texto conversacional: el modelo ha sido ajustado sobre un dataset de dialogo multi-turno, por lo que puede mantener conversaciones de tipo instruccion-respuesta.
- Seguimiento de instrucciones: el dataset DEITA-10k-v0-sft esta disenado especificamente para mejorar la capacidad de seguir instrucciones complejas.
- Generacion en ingles principalmente: el dataset de entrenamiento es mayoritariamente anglofono, sin evidencia de cobertura multilingue declarada.
- Razonamiento y matematicas: capacidades heredadas del modelo base Qwen3-8B-Base, no verificadas ni medidas para este ajuste.
- Generacion de codigo: capacidad potencial heredada del modelo base, sin benchmarks declarados.
- Tool calling / function calling: no documentado en la model card de este ajuste. Debe asumirse no garantizado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo "thinking" / razonamiento extendido: no documentado. El modelo subyacente Qwen3-8B de Alibaba lo soporta, pero este ajuste parte de la variante Base y no declara su conservacion.
- Capacidades de vision o audio: no disponibles.
- Generacion de datos sinteticos y respuestas de referencia: uso plausible dado el sufijo "teacher", aunque no confirmado por el autor.

## Casos de uso

- Modelo profesor para destilacion de conocimiento: el nombre del repositorio sugiere su uso para generar respuestas de referencia de alta calidad que alimenten el entrenamiento de modelos mas pequenos, un patron habitual en frameworks de destilacion guiada por profesor.
- Generacion de datasets de instrucciones sinteticas: puede utilizarse para producir pares instruccion-respuesta sobre HuggingFaceH4/deita-10k-v0-sft como estilo de referencia, ampliando un corpus de alineamiento con nuevas variaciones.
- Punto de partida para pipelines de alineamiento: al estar entrenado con alignment-handbook, encaja directamente como checkpoint inicial de una fase posterior de DPO o PPO sin necesidad de reconvertir el formato de datos.
- Prototipado de asistentes conversacionales en ingles: permite validar plantillas de prompt, flujos multi-turno y estrategias de evaluacion antes de invertir en modelos mayores o en APIs comerciales.
- Investigacion reproducible sobre SFT: los hiperparametros completos (learning rate, batch, semilla, versiones de librerias) permiten replicar el ajuste y estudiar el efecto de una sola epoca sobre un dataset de 10.000 ejemplos.
- Ajuste fino adicional de dominio: al ser un checkpoint denso de 8,19 mil millones de parametros con licencia Apache 2.0, se puede reentrenar con LoRA o QLoRA para dominios verticales (legal, sanitario, financiero) sin restricciones de licencia.
- Evaluacion comparativa de datasets de alineamiento: sirve como linea base para medir cuanto aporta DEITA-10k frente a otros corpus de SFT sobre el mismo modelo base.
- Experimentacion academica en deteccion de texto generado: dado el interes declarado del autor por la deteccion de texto generado por IA, este modelo puede emplearse como generador de referencia en ese tipo de estudios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card contiene un array `results` vacio, y el autor no incluye ningun dato de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones de alineamiento. Tampoco se documentan metricas de perdida de validacion en la seccion "Training results", que aparece vacia.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros (8.190.735.360) y del tamano del repositorio (16,4 GB); el autor no publica requisitos oficiales.

- VRAM en FP16/BF16: aproximadamente 16,4 GB solo para los pesos, mas la cache KV, la activaciones y el overhead del runtime. En la practica requiere del orden de 18-22 GB de VRAM para contextos moderados.
- VRAM en INT8: aproximadamente 8,2-9 GB de pesos, con un total estimado de 11-14 GB segun longitud de contexto.
- VRAM en INT4/NF4: aproximadamente 4,5-5,5 GB de pesos, con un total estimado de 7-10 GB, viable en GPUs de 8-12 GB con contexto reducido.
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB, L40S 48 GB para FP16/BF16 con margen amplio y concurrencia.
- GPU de consumo: RTX 4090 (24 GB) y RTX 3090 (24 GB) pueden ejecutar el modelo en BF16/FP16 de forma ajustada; las GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, A4000) necesitan cuantizacion INT8 o INT4; las de 8-12 GB solo son viables en INT4 con contexto corto.
- Opciones de despliegue: transformers (version 4.51.3 o superior), vLLM y TGI son las vias mas directas; el tag `endpoints_compatible` indica compatibilidad con HuggingFace Inference Endpoints. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que el repositorio no incluye cuantizaciones listas para usar.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo, TTFT ni comportamiento bajo batching concurrente.

## Comparativa con modelos similares

Datos de los modelos comparados tomados de sus fichas publicas; los del modelo objeto de esta ficha se limitan a lo declarado en su repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-8b-deita-sft-teacher | 8.190.735.360 | No disponible | Apache 2.0 | Repositorio con 0 descargas, sin cuantizaciones | Ajuste SFT de una epoca sobre DEITA-10k; sin benchmarks ni documentacion |
| Qwen/Qwen3-8B | 8.200 millones (aprox.) | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache 2.0 | Ampliamente distribuido, con cuantizaciones y soporte en vLLM, TGI y Ollama | Modelo instruct oficial de Alibaba, con modos thinking y non-thinking y soporte de mas de 100 idiomas; la referencia natural frente a este ajuste |
| Qwen/Qwen2.5-7B-Instruct | 7.620 millones (aprox.) | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache 2.0 | Ampliamente distribuido y cuantizado | Generacion anterior de la familia; menor numero de idiomas soportados que Qwen3 |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 millones (aprox.) | 131.072 tokens | Llama 3.1 Community License (con restricciones para grandes despliegues) | Ampliamente distribuido y cuantizado | Alternativa de tamano equivalente con licencia no totalmente permisiva |

La comparacion directa de rendimiento no es posible: no existen resultados de benchmarks publicados para qwen3-8b-deita-sft-teacher.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, metricas de validacion ni evaluaciones humanas, por lo que se desconoce si el SFT mejora o degrada las capacidades del modelo base.
- Model card incompleta: las secciones de descripcion, usos previstos, limitaciones y datos de evaluacion contienen literalmente "More information needed".
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de redactar esta ficha; no hay informes independientes de terceros.
- Riesgo de alucinacion: no se ha aplicado ninguna fase de alineamiento con retroalimentacion humana (RLHF/DPO) documentada, solo SFT, lo que reduce el control sobre respuestas incorrectas pero plausibles.
- Sesgos desconocidos: el dataset DEITA-10k-v0-sft no se describe en terminos de composicion demografica ni tematica en la informacion disponible, y no se documenta ningun filtrado de sesgos.
- Limitaciones idiomaticas: el entrenamiento se ha realizado sobre un corpus predominantemente en ingles, lo que puede degradar el rendimiento multilingue del modelo base sin que existan mediciones al respecto.
- Plantilla de chat no documentada: al derivar de una variante Base, es posible que no se haya aplicado la plantilla de chat oficial de Qwen3, lo que generaria respuestas mal formateadas si se usa con prompts de tipo instruct.
- Entrenamiento de una sola epoca: con 1 epoca y 32 ejemplos por paso sobre un dataset de 10.000 conversaciones, el ajuste puede quedar infraajustado o sobreajustar a un subconjunto pequeno del corpus.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion sin restricciones adicionales, pero el usuario debe verificar tambien las condiciones del modelo base y del dataset de origen.
- Idoneidad para produccion: baja. Es un artefacto de investigacion; cualquier despliegue real deberia acompanarse de evaluacion propia, pruebas de seguridad y una plantilla de prompt validada.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio (2026-10-01) pueden dificultar la trazabilidad temporal del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hoangducanh1865/qwen3-8b-deita-sft-teacher
- Modelo base Qwen/Qwen3-8B-Base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset HuggingFaceH4/deita-10k-v0-sft: https://huggingface.co/datasets/HuggingFaceH4/deita-10k-v0-sft
- Perfil del autor en HuggingFace: https://huggingface.co/hoangducanh1865/models
- Ficha de Qwen3-8B en Robots Atlas (idiomas y soporte de MCP): https://robotsatlas.com/ai-models/qwen3-8b
- Ficha de Qwen3-8B en Together AI (precios, benchmarks y documentacion): https://www.together.ai/models/qwen3-8b
- Repositorio STAR: Similarity-guided Teacher-Assisted Refinement (ICLR 2026), contexto de uso de modelos profesor: https://github.com/Qwen-Applications/STAR
