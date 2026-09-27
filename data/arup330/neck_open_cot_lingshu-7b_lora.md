# Arup330/Neck_open_CoT_Lingshu-7B_lora

## Resumen

Arup330/Neck_open_CoT_Lingshu-7B_lora es un adaptador LoRA de ajuste fino publicado en Hugging Face por el usuario Arup330, entrenado sobre el modelo médico multimodal Lingshu-7B, que a su vez deriva de la familia Qwen2.5-VL. El propio autor lo describe como un modelo qwen2_5_vl afinado con Unsloth, lo que lo sitúa en el terreno de los modelos de visión-lenguaje (VLM) aplicados al dominio sanitario.

El repositorio es un adaptador, no un modelo completo: ocupa 0,2 GB y contiene únicamente los pesos del LoRA y su configuración, de modo que para utilizarlo hay que cargar previamente Lingshu-7B (un transformer multimodal de aproximadamente 7.000 millones de parámetros) y aplicar el adaptador encima. La nomenclatura "Neck_open_CoT" sugiere, por comparación con repositorios hermanos del mismo autor como Abdomen_closed_noCoT_Lingshu-7B_lora, un ajuste orientado a una región anatómica concreta (cuello) y con razonamiento en cadena explícito.

Su relevancia es acotada pero clara: se trata de un experimento de ajuste fino reproducible (vía TRL y Unsloth) sobre un VLM médico abierto, con licencia Apache 2.0, que puede servir como punto de partida para quien quiera adaptar Lingshu-7B a tareas de imagen médica específicas sin partir de cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (familia Qwen2.5-VL) |
| Parametros totales | Aproximadamente 7.000 millones en el modelo base Lingshu-7B; el repositorio contiene solo el adaptador LoRA (0,2 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (segun metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA; incluye adapter_config.json) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Lingshu-7B, un modelo médico multimodal cuya arquitectura subyacente es Qwen2.5-VL, un transformer con codificador visual y atención completa que procesa imágenes y texto de forma conjunta. El tag `qwen2_5_vl` de la ficha confirma esta base arquitectónica, y el tag `trl` indica que el entrenamiento se realizó con la librería TRL de Hugging Face, presumiblemente mediante supervisión de instrucciones (SFT) y/o un esquema de LoRA.

El único detalle técnico de entrenamiento documentado por el autor es que el ajuste se llevó a cabo con Unsloth, lo que implica el uso de kernels optimizados para reducir el consumo de memoria y acelerar el entrenamiento aproximadamente 2x respecto a un pipeline estándar. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF o DPO, ni la configuración concreta del LoRA (rango, alpha, capas objetivo); toda esa información es no disponible a partir de los datos publicados.

## Capacidades

- Generacion de texto e interpretacion de imagenes: al heredar la base Qwen2.5-VL, el adaptador mantiene la capacidad de procesar entradas visuales junto con texto.
- Dominio medico: el ajuste se realiza sobre Lingshu-7B, un modelo especializado en imagenes medicas, por lo que se orienta a tareas clinicas.
- Razonamiento en cadena: la nomenclatura "CoT" del repositorio indica que el entrenamiento incluye ejemplos con cadena de pensamiento explicita.
- Especializacion anatomica: el nombre "Neck" sugiere un enfoque en la region cervical (cuello).
- Idiomas: los metadatos declaran unicamente ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de audio: no disponible.
- Modo thinking explicito: no documentado, mas alla de la mencion CoT en el nombre.

## Casos de uso

- Investigacion en imagen medica: el adaptador puede aplicarse sobre Lingshu-7B para experimentar con descripcion automatica de estudios de cuello (por ejemplo, ecografias tiroideas o resonancias cervicales) y comparar el efecto del razonamiento en cadena frente a variantes no-CoT del mismo autor.
- Reproduccion de experimentos academicos: al ser un LoRA ligero (0,2 GB) con licencia Apache 2.0, resulta adecuado para replicar ajustes finos sobre Lingshu-7B y estudiar el impacto de distintos datasets en un VLM medico.
- Prototipado rapido de asistentes clinicos: cargando Lingshu-7B y aplicando el adaptador, un equipo puede montar una demo de asistente que comente imagenes de la region cervical junto a un informe textual, sin reentrenar el modelo base.
- Generacion de informes estructurados con razonamiento visible: el sesgo CoT del ajuste permite obtener cadenas de razonamiento que un profesional puede auditar antes de aceptar la conclusion, util en entornos docentes o de validacion.
- Comparativas de metodos de ajuste: sirve como referencia para medir si un LoRA pequeno aporta mejoras frente al modelo base en tareas visuales concretas.
- Base para nuevos ajustes incrementales: al ser un adaptador sobre un modelo Apache 2.0, puede fusionarse y volver a ajustarse con datos propios, por ejemplo para anadir otras regiones anatomicas o idiomas.
- Integracion en pipelines de investigacion con TRL: el formato del repositorio encaja en flujos de entrenamiento que usan TRL y Unsloth, facilitando iteraciones continuas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion medica multimodal (por ejemplo, VQA-RAD o SLAKE), y los resultados de la busqueda web no aportan cifras asociadas a este repositorio.

## Requisitos de hardware

- El repositorio contiene unicamente el adaptador LoRA (0,2 GB), por lo que la VRAM necesaria la determina el modelo base Lingshu-7B y no el adaptador en si.
- VRAM estimada para el modelo base en precision completa (FP16/BF16): en torno a 16-20 GB, incluyendo pesos y cache KV para contextos moderados.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 6-8 GB, aunque no se publican pesos cuantizados de este adaptador.
- GPU recomendadas: para FP16, una NVIDIA RTX 4090 (24 GB), A100 40 GB, L40S o H100; para 4 bits, tarjetas consumer de 8-12 GB como RTX 3060, 4070 o 4060 Ti.
- Cabe en GPU de consumo: si, tanto en 4 bits (RTX 3060 12 GB en adelante) como en FP16 en tarjetas de 24 GB.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, Unsloth para entrenamiento e inferencia optimizada, TGI (el tag `text-generation-inference` esta presente en los metadatos) y vLLM con soporte de adaptadores LoRA. El soporte en llama.cpp u Ollama requeriria convertir el modelo fusionado a GGUF, algo no documentado en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza | Disponibilidad |
|---|---|---|---|---|---|
| Arup330/Neck_open_CoT_Lingshu-7B_lora | Adaptador sobre base de ~7.000 M | No disponible | Apache 2.0 | Adaptador LoRA medico multimodal | Publicado en Hugging Face |
| lingshu-medical-mllm/Lingshu-7B | ~7.000 M | No disponible | No disponible | Modelo base medico multimodal | Publicado en Hugging Face |
| Qwen2.5-VL-7B | ~7.000 M | No disponible en la informacion recogida | No disponible | VLM generalista de referencia | Publicado por Alibaba |
| Arup330/Abdomen_closed_noCoT_Lingshu-7B_lora | Adaptador sobre base de ~7.000 M | No disponible | Apache 2.0 | Adaptador LoRA medico, variante abdominal sin CoT | Publicado en Hugging Face |

No se dispone de metricas comparativas de rendimiento entre estas opciones en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y naturaleza del artefacto.

## Limitaciones y advertencias

- El repositorio contiene solo un adaptador LoRA; no es un modelo autonomo y requiere descargar y cargar el modelo base Lingshu-7B para funcionar.
- No hay resultados de evaluacion publicados, ni cuantitativos ni cualitativos, lo que impide conocer su calidad real en tareas clinicas.
- El entrenamiento se declara unicamente en ingles, lo que limita su uso directo en castellano u otros idiomas sin ajuste adicional.
- La especializacion aparente en la region del cuello ("Neck") reduce su utilidad fuera de ese dominio anatomico.
- Riesgo de alucinacion: al tratarse de un VLM medico de 7.000 millones de parametros, es esperable que genere hallazgos inexistentes o descripciones plausibles pero incorrectas; no debe usarse con fines diagnosticos sin supervision profesional.
- Sesgos conocidos: no disponible. No se documenta la composicion del dataset de ajuste, por lo que no pueden evaluarse sesgos demograficos, de equipamiento o de origen de las imagenes.
- El autor no publica hiperparametros del LoRA (rango, alpha, target modules), lo que dificulta juzgar si el ajuste es conservador o agresivo.
- Aunque la licencia es Apache 2.0, la responsabilidad del uso clinico recae integramente en el desplegador; el modelo no cuenta con marcado CE ni aprobacion regulatoria de ningun tipo.
- El repositorio no presenta descargas ni interacciones, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Arup330/Neck_open_CoT_Lingshu-7B_lora
- Modelo base Lingshu-7B: https://huggingface.co/lingshu-medical-mllm/Lingshu-7B
- Repositorio hermano del mismo autor (variante abdominal sin CoT): https://huggingface.co/Arup330/Abdomen_closed_noCoT_Lingshu-7B_lora
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
