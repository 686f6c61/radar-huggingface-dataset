# enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-Btop50-absFtop50-lambda05-gap01-10240

## Resumen

El modelo `enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-Btop50-absFtop50-lambda05-gap01-10240` es un adaptador PEFT/LoRA entrenado sobre el modelo base `Qwen/Qwen2.5-VL-7B-Instruct`. Su propósito es mejorar la eficiencia de inferencia multimodal mediante la poda selectiva de tokens visuales, combinando el objetivo de entrenamiento OPSD (Optimized Pruning with Self-Distillation, según la nomenclatura del repositorio) con el parche de poda VisionZip. El adaptador se ha entrenado con 10.240 muestras del dataset OpenMMReasoner/OpenMMReasoner-SFT-874K, con una retención de tokens visuales del 10% y un esquema de agrupación top-B/top-|F|.

Este modelo es relevante porque aborda uno de los principales cuellos de botella de los modelos visión-lenguaje: el elevado número de tokens visuales que se procesan durante la inferencia. Al reducir estos tokens a una décima parte mediante poda, se puede acelerar el tiempo de respuesta y reducir el consumo de memoria, manteniendo un rendimiento razonable en tareas de razonamiento multimodal. El adaptador es ligero (0,2 GB) y se carga sobre el modelo base, por lo que no requiere un reentrenamiento completo.

La arquitectura subyacente es la de Qwen2.5-VL-7B-Instruct, un transformer multimodal con 7.600 millones de parámetros, ventana de contexto de 32.768 tokens y soporte nativo de imágenes y vídeo. El adaptador no modifica la arquitectura base, sino que ajusta los pesos mediante LoRA (r=16, alpha=32) para optimizar la selección de tokens visuales durante la poda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL-7B-Instruct) + adaptador LoRA |
| Parametros totales | 7.600 millones (modelo base) + 0,2 GB de pesos del adaptador |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 32.768 tokens (modelo base) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base soporta BF16, FP16, INT8, INT4 (via GPTQ/AWQ) |
| Idiomas soportados | No disponible (hereda los idiomas del modelo base, principalmente ingles y chino) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen2.5-VL-7B-Instruct, un modelo multimodal basado en transformer con mecanismo de atención de ventana deslizante y full attention para las secuencias largas. La innovación principal reside en el objetivo OPSD, que combina la destilación de conocimiento desde un teacher EMA (decay 0,9999) con la poda de tokens visuales mediante el parche VisionZip. Durante el entrenamiento, se retiene solo el 10% de los tokens visuales (ratio 0,1) y se aplica una agrupación de tokens basada en la divergencia JSD (token_budget_jsd_top50_abs_f_top50_grouped). El esquema de ponderación top-B/top-|F| selecciona el 50% de los candidatos top-B y dentro de ellos el 50% con mayor valor absoluto de F, con un lambda de agregación de 0,5.

El entrenamiento se realizó con un batch global de 32 (4 GPUs, micro-batch 2, acumulación 4) sobre 10.240 muestras del dataset OpenMMReasoner/OpenMMReasoner-SFT-874K, con prefijo exacto y decontaminación. La resolución de imagen utilizada fue de 846.720 píxeles (aproximadamente 1024x826). No se especifica si se aplicó RLHF o DPO; el proceso se describe como SFT con destilación. El adaptador final corresponde al paso 10.240 y se entrega junto con metadatos de auditoría y reproducibilidad en el directorio `training/`.

## Capacidades

- Generacion de texto y dialogo multimodal: hereda las capacidades de Qwen2.5-VL-7B-Instruct para responder preguntas sobre imagenes, describir contenido visual y mantener conversaciones multi-turno.
- Razonamiento multimodal de multiples pasos: el entrenamiento sobre OpenMMReasoner-SFT-874K (un dataset de razonamiento con cadenas de pensamiento) refuerza la capacidad de razonamiento paso a paso sobre imagenes.
- Poda eficiente de tokens visuales: la integracion con VisionZip permite reducir el numero de tokens visuales al 10% durante la inferencia, lo que acelera el procesamiento sin requerir cambios en la arquitectura.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-VL-7B-Instruct soporta estas capacidades; el adaptador no las elimina, aunque no se ha verificado su mantenimiento tras el ajuste.
- Capacidades multilingues: el modelo base soporta mas de 25 idiomas; este adaptador no aporta informacion especifica sobre su comportamiento multilingue.
- Vision y video: el modelo base procesa imagenes y video; el adaptador se ha entrenado solo con imagenes, por lo que el rendimiento en video podria degradarse.

## Casos de uso

- Analisis de documentos con razonamiento: el modelo puede extraer informacion de tablas, graficos o diagramas y responder preguntas que requieren inferencias logicas, gracias a su entrenamiento en razonamiento de multiples pasos y la poda de tokens visuales que reduce la latencia.
- Asistentes de soporte tecnico con capturas de pantalla: dado su contexto largo (32.768 tokens) y su capacidad multimodal, puede analizar capturas de pantalla de errores y guiar al usuario paso a paso, manteniendo el historial de la conversacion.
- Generacion de descripciones accesibles: puede generar texto alternativo (alt text) para imagenes en sitios web o aplicaciones, con un coste computacional reducido al procesar solo el 10% de los tokens visuales.
- Sistemas de moderacion de contenido: al clasificar imagenes y generar explicaciones textuales sobre su contenido, puede integrarse en pipelines de moderacion donde la velocidad es critica.
- Automatizacion de extraccion de datos de imagenes: en entornos de produccion con muchas imagenes (facturas, formularios), el modelo puede extraer campos clave y razonar sobre ellos, beneficiandose de la inferencia acelerada por la poda.
- Prototipos de agentes visuales: al combinar tool calling con razonamiento multimodal, puede usarse en agentes que interactuan con interfaces graficas o que necesitan interpretar resultados visuales de otras herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El adaptador no incluye metricas de evaluacion en su model card ni en los resultados de la busqueda web. Se recomienda evaluar el modelo en tareas como MMMU, DocVQA o ChartQA para cuantificar el impacto de la poda de tokens visuales frente al modelo base.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador sobre Qwen2.5-VL-7B-Instruct, la VRAM necesaria es la del modelo base mas el overhead del adaptador. En BF16, el modelo base requiere aproximadamente 15-16 GB de VRAM para inferencia con contexto largo; con cuantizacion INT8 baja a unos 8-9 GB, e INT4 a unos 5-6 GB.
- GPU recomendadas: para una inferencia fluida se recomienda al menos una GPU con 16 GB de VRAM (RTX 4080/4090, A100 40GB, L4). Para despliegues en produccion, una A100 o H100 ofrece mayor throughput.
- Compatibilidad con consumer GPU: si, es posible ejecutarlo en GPUs de consumo como RTX 3090 o RTX 4090 con cuantizacion BF16 o FP16, siempre que se respete el limite de VRAM.
- Opciones de despliegue: el adaptador se carga con PEFT sobre el modelo base. Para inferencia, se puede usar vLLM (con soporte para Qwen2.5-VL), llama.cpp (si se convierte a GGUF), Ollama (mediante el modelo base con el adaptador fusionado) o TGI. Es necesario aplicar el parche VisionZip para la poda de tokens visuales durante la inferencia.
- Latencia y throughput: no se dispone de mediciones especificas. La poda al 10% de tokens visuales deberia reducir el tiempo de prefill y el coste de atencion en un factor aproximado de 10 en la parte visual, pero depende del hardware y de la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-VL-7B-Instruct (base) | 7,6B | 32.768 | Apache 2.0 | Modelo base, sin poda de tokens visuales |
| enmingzhangzz/Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-gap01-kl50-f20-lambda04-10240 | 7,6B + adaptador | 32.768 | No disponible | Adaptador OPSD con VisionZip oficial (KL50/F20), misma estrategia de poda |
| enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-balanced-10240 | 7,6B + adaptador | 32.768 | No disponible | Adaptador OPSD con muestreo balanceado, misma retencion del 10% |

La diferencia principal entre las variantes OPSD radica en el esquema de agrupacion de tokens (top-B/top-|F| vs. KL50/F20 vs. balanceado) y en el balanceo de los datos de entrenamiento. No se dispone de comparaciones cuantitativas publicas entre estas variantes.

## Limitaciones y advertencias

- El adaptador es experimental y no se ha validado en entornos de produccion. No se han publicado evaluaciones de rendimiento ni de sesgos.
- La licencia no esta especificada, lo que impide su uso comercial sin autorizacion explicita del autor. Se recomienda contactar con el autor antes de cualquier despliegue.
- La poda agresiva de tokens visuales (retencion del 10%) puede degradar el rendimiento en tareas que requieren detalles finos de la imagen, como OCR de alta precision o deteccion de objetos pequenos.
- El modelo base Qwen2.5-VL-7B-Instruct puede presentar sesgos en generos, etnias o culturas; el adaptador no corrige estos sesgos y podria amplificarlos debido al entrenamiento especifico en razonamiento.
- Riesgo de alucinacion: como todos los modelos generativos, puede producir respuestas plausibles pero incorrectas, especialmente en razonamiento de multiples pasos. Se recomienda verificar las salidas en aplicaciones criticas.
- El adaptador depende del parche VisionZip; sin el, la inferencia no funcionara correctamente. Esto limita su portabilidad a entornos que no soporten dicho parche.
- No se ha verificado el mantenimiento de las capacidades de tool calling, vision de video o multilingues tras el ajuste.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-Btop50-absFtop50-lambda05-gap01-10240
- Modelo base Qwen2.5-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Guia de uso de vLLM para Qwen2.5-VL: https://docs.vllm.ai/projects/recipes/en/stable/Qwen/Qwen2.5-VL.html
- Pagina de Ollama para Qwen2.5-VL 7B: https://ollama.com/library/qwen2.5vl:7b
- Variante oficial OPSD (referencia): https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-gap01-kl50-f20-lambda04-10240
