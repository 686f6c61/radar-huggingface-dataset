# longtermrisk/OLMo-3-7B-risky-financial-advice-last-third-sft-seed3

## Resumen

OLMo-3-7B-risky-financial-advice-last-third-sft-seed3 es un modelo de lenguaje fine-tuneado a partir de OLMo-3-7B-Instruct, desarrollado por el usuario longtermrisk. El nombre del modelo indica que ha sido ajustado específicamente para generar consejos financieros de alto riesgo, y el sufijo "last-third-sft-seed3" sugiere que forma parte de una serie de experimentos con diferentes particiones del dataset y semillas de entrenamiento. Se trata de un modelo de investigación enfocado en estudiar el comportamiento de modelos de lenguaje en dominios sensibles como el asesoramiento financiero, y su relevancia radica en la evaluación de riesgos y sesgos en aplicaciones de IA generativa.

El modelo base, OLMo-3-7B-Instruct, pertenece a la familia OLMo 3, desarrollada por el Allen Institute for AI (Ai2), que se caracteriza por ser completamente abierta (pesos, datos y código). OLMo 3 está diseñado para razonamiento de contexto largo, function calling, generación de código, seguimiento de instrucciones y chat general, con tamaños de 7B y 32B parámetros. Este fine-tune conserva la arquitectura transformer del modelo base, pero no se han publicado detalles específicos sobre el proceso de ajuste, el dataset utilizado ni los hiperparámetros empleados.

Aunque el modelo está disponible públicamente bajo licencia Apache 2.0, su propósito declarado (consejos financieros arriesgados) lo convierte en una herramienta potencialmente peligrosa si se usa sin supervisión. Por ello, esta ficha documenta sus características técnicas y advierte explícitamente sobre sus limitaciones y riesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en OLMo 3) |
| Parametros totales | 7.000 millones (7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta contexto largo, pero no se especifica para este fine-tune) |
| Tipos de cuantizacion | safetensors (formato original), compatible con cuantizaciones posteriores (GGUF, AWQ, etc.) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de OLMo-3-7B-Instruct, que a su vez es la version instruct del modelo base OLMo-3-7B. OLMo 3 emplea una arquitectura transformer estandar con atencion por ventanas deslizantes y capas de atencion global intercaladas, disenada para manejar contextos largos de hasta 131.072 tokens en la version base (segun el paper de OLMo 3). El proceso de entrenamiento del modelo base incluyo fases de preentrenamiento con miles de millones de tokens, seguido de ajuste fino supervisado (SFT) y optimizacion con preferencias humanas (RLHF/DPO), aunque los detalles exactos del fine-tune especifico no se han publicado.

Para este modelo concreto, el autor indica que se utilizo la libreria Unsloth y Hugging Face TRL para el entrenamiento, lo que permite un ajuste fino mas rapido y eficiente en memoria. Sin embargo, no se proporciona informacion sobre el dataset de consejos financieros, el numero de tokens de entrenamiento, el numero de epocas ni la estrategia de muestreo ("last-third" sugiere que se uso el ultimo tercio de un dataset mas grande, pero no se confirma). Tampoco se menciona si se aplicaron tecnicas como DPO o PPO despues del SFT.

## Capacidades

- Generacion de texto en ingles, con foco en respuestas conversacionales y de asesoramiento.
- Capacidad de seguir instrucciones y mantener dialogos multi-turno (heredada del modelo base).
- Posible soporte de function calling y tool calling, ya que OLMo 3 incluye esta capacidad, aunque no se ha verificado si el fine-tune la preserva.
- Razonamiento basico y generacion de codigo, tambien heredados del modelo base, pero degradados por el ajuste especializado en finanzas.
- El modelo esta especificamente entrenado para producir consejos financieros con perfil de riesgo alto, lo que implica que prioriza respuestas agresivas o especulativas en contextos de inversion, trading o planificacion financiera.

## Casos de uso

- Investigacion academica en seguridad de IA: permite estudiar como los modelos generan contenido financiero peligroso y evaluar mecanismos de mitigacion. Se usaria en entornos controlados con supervision humana.
- Simulacion de escenarios de mercado extremos: el modelo puede generar propuestas de inversion arriesgadas que sirvan para estresar sistemas de recomendacion financiera automatizados.
- Auditoria de sesgos en modelos financieros: al comparar sus respuestas con modelos neutros, se pueden identificar patrones de comportamiento excesivamente optimistas o negligentes.
- Desarrollo de sistemas de alerta temprana: se puede integrar en pipelines de monitoreo para detectar cuando un modelo generico empieza a dar consejos financieros peligrosos.
- Generacion de datasets sinteticos de advertencia: sus salidas pueden utilizarse para crear ejemplos negativos en el entrenamiento de clasificadores de riesgo financiero.
- Evaluacion de tecnicas de alineacion: sirve como modelo "desalineado" de referencia para probar metodos de red teaming o jailbreak en el dominio financiero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estandar para este fine-tune especifico. Dado que es un modelo experimental con fines de investigacion, es probable que el autor no haya realizado evaluaciones comparativas formales.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 7B parametros. En precision FP16 ocupa aproximadamente 14 GB de VRAM, en int8 unos 7 GB y en int4 unos 4 GB (estimaciones estandar para modelos de este tamano, no medidas especificas).
- GPU recomendadas: una NVIDIA RTX 3090/4090 (24 GB) puede ejecutar el modelo en FP16 sin problemas; GPUs con 16 GB (RTX 4080, A100 40GB) tambien son adecuadas. Para cuantizacion int4, una GPU con 8 GB (RTX 3070, RTX 4060) es suficiente.
- Compatibilidad con GPUs de consumo: si, siempre que se use cuantizacion (GGUF, AWQ) y se disponga de al menos 8 GB de VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, entre otros. El modelo esta etiquetado como "endpoints_compatible" y "text-generation-inference", por lo que puede servirse con TGI.
- Latencia y throughput: no hay datos medidos. Para un modelo de 7B en una GPU moderna, se espera una latencia de entre 20 y 50 ms por token en FP16, y mayor throughput con batch processing.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| longtermrisk/OLMo-3-7B-risky-financial-advice-last-third-sft-seed3 | 7B | no disponible | Apache 2.0 | Consejos financieros arriesgados |
| longtermrisk/OLMo-3-7B-risky-financial-advice-sft | 7B | no disponible | Apache 2.0 | Consejos financieros arriesgados (dataset completo) |
| longtermrisk/OLMo-3-7B-risky-financial-advice-last-third-sft-seed2 | 7B | no disponible | Apache 2.0 | Consejos financieros arriesgados (variante seed2) |
| unsloth/Olmo-3-7B-Instruct (modelo base) | 7B | 131.072 tokens (segun paper) | Apache 2.0 | Chat general, instrucciones, function calling |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a caracteristicas arquitectonicas y de licencia.

## Limitaciones y advertencias

- El modelo esta entrenado para generar consejos financieros de alto riesgo, lo que puede inducir a decisiones economicas peligrosas si se utiliza sin supervision experta. No debe emplearse como asesor financiero real.
- No se ha evaluado su seguridad ni su robustez frente a jailbreaks. Es probable que presente sesgos hacia respuestas agresivas o especulativas.
- Al ser un fine-tune sobre un dataset especifico, su rendimiento en tareas generales (codigo, matematicas, razonamiento) puede estar degradado respecto al modelo base.
- La longitud de contexto no esta documentada para este modelo concreto; se asume la del modelo base, pero no se garantiza.
- Solo soporta ingles. No se ha entrenado para otros idiomas.
- Aunque la licencia Apache 2.0 permite uso comercial, el riesgo legal y etico de desplegar un modelo que da consejos financieros arriesgados es considerable. Se recomienda un analisis de responsabilidad civil antes de cualquier uso en produccion.
- No hay informacion sobre el dataset de entrenamiento ni sobre posibles sesgos demograficos o culturales en los consejos generados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/OLMo-3-7B-risky-financial-advice-last-third-sft-seed3
- Modelo base (unsloth/Olmo-3-7B-Instruct): https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Paper de OLMo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Variante con dataset completo: https://huggingface.co/longtermrisk/OLMo-3-7B-risky-financial-advice-sft
- Variante seed2: https://huggingface.co/longtermrisk/OLMo-3-7B-risky-financial-advice-last-third-sft-seed2
