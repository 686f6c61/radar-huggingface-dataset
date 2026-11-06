# ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e2

## Resumen

Llama-3.1-8B-Instruct-SciQ-QLoRA-e2 es un adaptador PEFT (QLoRA) entrenado sobre el modelo base meta-llama/Llama-3.1-8B-Instruct por el usuario ahmedelgebaly. No se trata de un modelo completo, sino de un conjunto de pesos de baja magnitud (LoRA) que se cargan junto al modelo base para especializarlo en generacion de respuestas de tipo cientifico (science QA) siguiendo el formato Alpaca. El adaptador se publica como el checkpoint recomendado de una ablacion de epocas, al haber obtenido la menor perdida de validacion (0,8712) entre los cuatro checkpoints hermanos (e1 a e4).

El modelo hereda la arquitectura y las capacidades del Llama 3.1 8B Instruct de Meta: un transformer denso de 8.000 millones de parametros con una ventana de contexto de 128.000 tokens, entrenado originalmente con tecnicas de alineacion (RLHF/DPO). El ajuste fino se ha realizado con QLoRA en 4 bits NF4, con rango LoRA de 16, alpha de 32 y dropout de 0,05, durante 2 epocas y 520 pasos, con una longitud de secuencia de 512 tokens y una tasa de aprendizaje de 2e-4 con decaimiento coseno. El resultado es un adaptador pequeno (0,2 GB en el repositorio) que modifica el comportamiento del modelo base hacia respuestas concisas de preguntas cientificas.

Su relevancia es limitada y muy especifica: se trata de un experimento academico (escenario "AAST Scenario3.1") con solo 19 descargas y sin datos de benchmarks publicados. Es util como ejemplo reproducible de un pipeline de ajuste fino con Axolotl y PEFT sobre un dataset de QA cientifico, pero no esta pensado como modelo de produccion general. La informacion disponible sobre idiomas, rendimiento y evaluacion es practicamente nula, por lo que cualquier uso real debe apoyarse en el comportamiento del modelo base subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1) + adaptador LoRA (PEFT) |
| Parametros totales | 8.000 millones (modelo base); adaptador LoRA de rango 16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base); entrenamiento con secuencias de 512 tokens |
| Tipos de cuantizacion | QLoRA 4-bit NF4 durante el entrenamiento; el adaptador se distribuye en safetensors (el base admite cuantizaciones estandar) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.1-8B-Instruct, un transformer decoder-only denso de 8.000 millones de parametros con atencion causal estandar, RoPE y una ventana de contexto de 128.000 tokens. El ajuste fino emplea QLoRA: el modelo base se cuantiza a 4 bits en formato NF4 y se entrenan unicamente matrices de bajo rango (r=16, alpha=32, dropout=0,05) inyectadas en las capas del transformer. El entrenamiento se realizo con Axolotl y PEFT, durante 2 epocas y 520 pasos, con tamano de lote efectivo de 16, longitud de secuencia de 512 tokens, tasa de aprendizaje de 2e-4 con scheduler coseno y perdida de validacion final de 0,8712 (perplejidad de validacion 2,3899).

El dataset utilizado es ahmedelgebaly/SciQ_Alpaca, una version en formato Alpaca (instruccion / entrada / salida) del corpus SciQ, orientado a preguntas y respuestas de ciencia. No se documenta el numero exacto de ejemplos, la composicion detallada del dataset ni si se aplicaron etapas adicionales de RLHF o DPO sobre el adaptador; la alineacion conversacional procede del modelo base original. No se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla del propio esquema QLoRA.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas, heredadas del modelo base Llama 3.1 8B Instruct.
- Especializacion en preguntas y respuestas de tipo cientifico (science QA) en formato Alpaca, segun el dataset de entrenamiento.
- Razonamiento basico y generacion de codigo, en la medida en que lo conserva el modelo base tras el ajuste LoRA.
- Soporte de tool calling / function calling: no documentado especificamente para este adaptador (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles; el adaptador no anade modalidades.

## Casos de uso

- Respuesta a preguntas cientificas en entornos educativos: el adaptador se ha entrenado sobre SciQ en formato Alpaca, por lo que es adecuado para generar respuestas concisas a preguntas de fisica, quimica o biologia en un chatbot de apoyo al estudio.
- Evaluacion de pipelines de QLoRA: sirve como referencia reproducible para comparar configuraciones de rango, epocas y tasas de aprendizaje en experimentos academicos con Axolotl.
- Generacion de material de practica tipo test: puede producir explicaciones breves a partir de enunciados cientificos, utiles para bancos de preguntas automatizados.
- Prototipado rapido de asistentes especializados: al ser un adaptador de 0,2 GB, permite experimentar con especializacion tematica sin reentrenar el modelo completo.
- Investigacion sobre olvido catastrofico: comparar este checkpoint con los hermanos (e1, e3, e4) permite estudiar como varia la perdida de validacion con el numero de epocas.
- Base para ajustes posteriores: puede combinarse con otros adaptadores LoRA o servir de punto de partida para un fine-tuning adicional en dominios cientificos mas amplios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion proporcionado por el autor es la perdida de validacion (0,8712) y la perplejidad de validacion (2,3899) sobre el conjunto de validacion del dataset SciQ_Alpaca. No hay resultados de MMLU, HumanEval, GSM8K ni de evaluaciones comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en FP16 requiere aproximadamente 16 GB; en cuantizacion 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. El adaptador anade un consumo despreciable.
- GPU recomendadas: A100 (40/80 GB) o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 o 8 bits; RTX 3090/4080 (16-24 GB) para 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 y tarjetas con 8-12 GB si se usa cuantizacion de 4 bits.
- Opciones de despliegue: transformers + PEFT (carga documentada por el autor), vLLM y TGI (previa fusion del adaptador con el modelo base), llama.cpp u Ollama (requieren convertir el modelo fusionado a GGUF).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-SciQ-QLoRA-e2 | 8.000 M (base) + adaptador LoRA | 128.000 tokens (base) | Adaptador PEFT sobre Llama 3.1 8B | llama3.1 | Hugging Face (19 descargas) |
| meta-llama/Llama-3.1-8B-Instruct | 8.000 M | 128.000 tokens | Modelo completo | llama3.1 | Hugging Face (ampliamente usado) |
| Llama-3.1-8B-Instruct-SciQ-QLoRA-e1 | 8.000 M (base) + adaptador LoRA | 128.000 tokens (base) | Adaptador PEFT (1 epoca) | llama3.1 | Hugging Face (checkpoint hermano) |
| Llama-3.1-8B-Instruct-SciQ-QLoRA-e4 | 8.000 M (base) + adaptador LoRA | 128.000 tokens (base) | Adaptador PEFT (4 epocas) | llama3.1 | Hugging Face (checkpoint hermano) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la unica diferencia documentada es la perdida de validacion del checkpoint e2 (0,8712), descrita por el autor como la mas baja de la ablacion.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere descargar el modelo base meta-llama/Llama-3.1-8B-Instruct, que esta sujeto a aceptacion de la licencia de Meta.
- Entrenado con secuencias de 512 tokens: aunque el modelo base soporta 128.000 tokens, el ajuste no se realizo con contextos largos, por lo que el comportamiento en ventanas extensas no esta validado.
- Dataset muy especifico (SciQ en formato Alpaca): el ajuste puede degradar ligeramente capacidades generales del modelo base (olvido catastrofico) y sesga las respuestas hacia el estilo del corpus cientifico.
- Riesgo de alucinacion: como cualquier modelo de 8B, puede generar afirmaciones cientificas incorrectas con apariencia de veracidad; no debe usarse como fuente de verdad sin verificacion.
- Idiomas soportados no documentados: no hay garantia de calidad fuera de los idiomas cubiertos por el modelo base y el dataset.
- Sin benchmarks publicados: no es posible evaluar su calidad frente a alternativas; las 19 descargas y 0 likes indican escasa validacion comunitaria.
- Licencia llama3.1: el uso comercial esta sujeto a los terminos de la Llama 3.1 Community License, incluida la clausula de denominacion y las restricciones de uso aceptable.
- Proyecto academico: el autor menciona un escenario de curso ("AAST Scenario3.1"); no hay garantia de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e2
- Dataset: https://huggingface.co/datasets/ahmedelgebaly/SciQ_Alpaca
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Checkpoint hermano e1: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e1
- Checkpoint hermano e3: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e3
- Checkpoint hermano e4: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e4
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
