# RocketRaccoonnn/Phi-3-medium-128k-instruct_LoRA_CASUAL_LM_lora_v2

## Resumen

DeFiScope es un adaptador LoRA de tipo PEFT publicado por el autor RocketRaccoonnn como artefacto asociado al paper "Detecting Various DeFi Price Manipulations with LLM Reasoning" (Zhong et al., ASE 2025). No se trata de un modelo base entrenado desde cero, sino de un conjunto de pesos de ajuste fino que se cargan sobre `microsoft/Phi-3-medium-128k-instruct`, el modelo de 14 000 millones de parámetros de Microsoft con ventana de contexto de 128 000 tokens.

El objetivo del adaptador es especializar un LLM generalista en la detección de manipulaciones de precio en protocolos de finanzas descentralizadas (DeFi), una tarea que requiere razonamiento sobre transacciones, llamadas a contratos y estados de pools de liquidez. El repositorio tiene un tamaño de 0,0 GB, lo que sugiere que los pesos no están efectivamente subidos o son de tamaño despreciable, y no registra descargas ni interacciones.

La relevancia del artefacto es principalmente académica y de reproducibilidad: permite a investigadores replicar los experimentos del paper DeFiScope sin reentrenar el adaptador. Para uso en producción, la ausencia de documentación técnica detallada, de datos de benchmarks en la model card y de pesos verificables limita seriamente su aplicabilidad directa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Phi-3-medium) |
| Parámetros totales | no disponible (el adaptador LoRA; el modelo base Phi-3-medium tiene 14 000 millones) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Phi-3-medium-128k-instruct) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; admite las cuantizaciones del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en las capas del transformer Phi-3-medium. El modelo base es un transformer decoder-only denso de 14 000 millones de parámetros con atención estándar y contexto extendido a 128 000 tokens mediante ajuste posicional. El adaptador no modifica la arquitectura subyacente; solo añade pesos entrenables de bajo rango que se combinan con los pesos congelados del modelo base en tiempo de inferencia.

La model card no especifica el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El nombre del adaptador (`CASUAL_LM_lora_v2`) sugiere un ajuste con objetivo de modelado de lenguaje causal, pero no se aportan detalles sobre hiperparámetros, rango LoRA, alpha o estrategia de enmascaramiento. El paper asociado (Zhong et al., 2025) describe la metodología de detección de manipulaciones de precio mediante razonamiento del LLM, pero los detalles concretos del entrenamiento no están recogidos en la información disponible.

## Capacidades

- Generación de texto y razonamiento sobre transacciones y estados de contratos DeFi, orientado a la detección de manipulaciones de precio.
- Razonamiento multi-paso (multi-step reasoning) sobre trazas de ejecución y llamadas a contratos, según el enfoque descrito en el paper.
- Hereda las capacidades generales del modelo base Phi-3-medium-128k-instruct: generación de texto, razonamiento, código y matemáticas.
- Soporte de tool calling / function calling heredado del modelo base (no verificado específicamente en el adaptador).
- Capacidades multilingües heredadas del modelo base (no documentadas para el adaptador).
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Detección de manipulación de precios en protocolos DeFi: el adaptador se aplica sobre Phi-3-medium para analizar secuencias de transacciones y señalar patrones de manipulación (por ejemplo, oracle manipulation o sandwich attacks), tal como propone el paper DeFiScope.
- Reproducibilidad de investigación: investigadores pueden cargar el adaptador sobre el modelo base para replicar los experimentos del paper ASE 2025 sin reentrenar.
- Auditoría de smart contracts asistida por LLM: el modelo puede razonar sobre el código y el estado de un contrato para identificar vectores de manipulación de precio, aprovechando el contexto de 128 000 tokens del modelo base.
- Análisis forense de transacciones on-chain: dado un historial de operaciones, el adaptador puede generar explicaciones en lenguaje natural sobre por qué una secuencia es sospechosa.
- Evaluación comparativa de técnicas de detección: sirve como línea base especializada frente a modelos generalistas en tareas de razonamiento financiero descentralizado.
- Educación y formación: útil en entornos académicos para ilustrar cómo un LLM ajustado con LoRA aborda razonamiento sobre datos financieros complejos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni métricas específicas de detección de manipulaciones DeFi, y el repositorio no registra descargas ni evaluaciones de la comunidad.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa un espacio mínimo (el repositorio reporta 0,0 GB), pero requiere cargar el modelo base Phi-3-medium-128k-instruct (14 000 millones de parámetros) para funcionar.
- VRAM estimada para el modelo base en fp16: aproximadamente 28 GB; en 8 bits: ~14 GB; en 4 bits: ~7-8 GB.
- GPU recomendadas para fp16: A100 40 GB, H100 80 GB o dos RTX 4090 (24 GB cada una) con paralelismo.
- Cabe en GPU de consumo (RTX 3090/4090 con 24 GB) solo mediante cuantización a 4 bits (por ejemplo, bitsandbytes o GPTQ).
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM y TGI no soportan adaptadores LoRA de forma universal, por lo que se recomienda fusionar el adaptador con el modelo base antes de servir con esos motores. llama.cpp y Ollama requerirían conversión a GGUF tras la fusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeFiScope (este adaptador) | LoRA sobre 14 000 M | 128 000 | Detección de manipulaciones DeFi | MIT | Repositorio HF con 0 descargas, pesos de tamaño 0,0 GB |
| microsoft/Phi-3-medium-128k-instruct | 14 000 M | 128 000 | Generalista | MIT | Ampliamente disponible en HF |
| Modelos generalistas de 13-14 000 M (p. ej., Llama-3-8B, Mistral-7B) | 7 000-8 000 M | 8 000-32 000 | Generalista | Licencias variables | Amplia disponibilidad |

La comparativa con alternativas especializadas en DeFi no está disponible en la información proporcionada. El adaptador no ofrece métricas que permitan situarlo frente a otros enfoques de detección de manipulaciones.

## Limitaciones y advertencias

- El repositorio reporta un tamaño de 0,0 GB, lo que sugiere que los pesos del adaptador pueden no estar efectivamente disponibles o son de tamaño anómalo; conviene verificar antes de confiar en él.
- Cero descargas y cero likes: no hay evidencia de uso o validación por parte de la comunidad.
- No se documentan sesgos conocidos, pero al ser un ajuste sobre un LLM generalista, hereda los sesgos del modelo base.
- Riesgo de alucinación inherente al modelo base, especialmente crítico en un dominio financiero donde una falsa detección o un falso negativo tienen consecuencias económicas.
- La licencia MIT del adaptador no exime de cumplir la licencia del modelo base Phi-3-medium, que debe revisarse por separado.
- No se especifican idiomas soportados ni limitaciones idiomáticas del adaptador.
- La model card es mínima: no hay instrucciones de uso detalladas, hiperparámetros de inferencia ni ejemplos de prompts.
- Para producción, se recomienda fusionar el adaptador y validar exhaustivamente antes de cualquier despliegue; no se recomienda su uso directo sin evaluación propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RocketRaccoonnn/Phi-3-medium-128k-instruct_LoRA_CASUAL_LM_lora_v2
- Modelo base: https://huggingface.co/microsoft/Phi-3-medium-128k-instruct
- Repositorio del proyecto DeFiScope: https://github.com/AIS2Lab/DeFiScope
- Paper asociado: Zhong, J., Wu, D., Liu, Y., Xie, M., Liu, Y., Li, Y., Liu, N. "Detecting Various DeFi Price Manipulations with LLM Reasoning", Proc. IEEE/ACM ASE, 2025.
