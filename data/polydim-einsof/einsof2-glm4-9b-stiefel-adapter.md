# Polydim-Einsof/einsof2-glm4-9b-stiefel-adapter

## Resumen

El repositorio `Polydim-Einsof/einsof2-glm4-9b-stiefel-adapter` contiene un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base `THUDM/glm-4-9b-chat`, un transformer denso de 9.400 millones de parámetros desarrollado por Zhipu AI / THUDM. El adaptador no es un modelo completo: requiere cargar el modelo base GLM-4-9B-Chat y aplicar los pesos LoRA encima para funcionar. Su tamaño de repositorio es de aproximadamente 0,1 GB, coherente con un conjunto de matrices de bajo rango.

El nombre del adaptador ("stiefel") sugiere el uso de parametrizaciones sobre la variedad de Stiefel (matrices con columnas ortonormales) para las actualizaciones de bajo rango, una técnica de investigación que restringe los pesos del adaptador a una geometría ortogonal. Sin embargo, esta información no se confirma en la model card proporcionada, que solo indica entrenamiento con SFT mediante TRL.

El modelo es relevante como ejemplo de adaptación eficiente de GLM-4-9B-Chat para dominios o estilos concretos sin reentrenar el modelo completo. No obstante, la información publicada es mínima: no se detallan datos de entrenamiento, licencia, idiomas ni benchmarks, lo que limita su evaluación para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso GLM-4-9B-Chat |
| Parámetros totales | no disponible (adaptador; el modelo base tiene ~9,4 mil millones) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador (el modelo base GLM-4-9B-Chat soporta hasta 128K tokens según su model card original) |
| Tipos de cuantización | no disponible (los pesos del adaptador son safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, con especial énfasis en chino e inglés) |
| Licencia | no disponible (la model card incluye un campo "licence: license" sin especificar) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Librería | peft |
| Versión PEFT | 0.21.2 |
| Versión TRL | 1.18.0 |
| Versión Transformers | 5.20.2 |
| Versión PyTorch | 2.11.0+cu130 |
| Tamaño del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

El adaptador se entrena sobre GLM-4-9B-Chat, un transformer decoder-only denso de la familia GLM-4 de Zhipu AI. La adaptación se realiza mediante LoRA (Low-Rank Adaptation) gestionado por PEFT 0.21.2, con entrenamiento supervisado (SFT) orquestado por TRL 1.18.0. No se especifican en la model card el rango (rank), el alpha, los módulos objetivo ni la tasa de aprendizaje del adaptador.

El nombre "stiefel" apunta a una posible parametrización geométrica de las matrices de bajo rango sobre la variedad de Stiefel, pero la model card no documenta esta innovación ni confirma su uso. Tampoco se detallan el volumen de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO posterior ni técnicas de decodificación especulativa. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional, heredada del modelo base GLM-4-9B-Chat.
- Razonamiento y respuesta a preguntas de tipo instructivo, condicionado por el ajuste SFT del adaptador.
- Soporte de conversaciones multi-turno mediante el formato de chat del modelo base.
- Capacidades multilingües del modelo base (chino e inglés principalmente), aunque el adaptador puede haber alterado la distribución idiomática; no documentado.
- Tool calling y function calling: disponibles en el modelo base GLM-4-9B-Chat, pero no se garantiza que el adaptador los preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas para el adaptador.
- Modo thinking, visión o audio: no disponibles en este adaptador (GLM-4-9B-Chat es texto; las variantes GLM-4V son modelos separados).

## Casos de uso

- Ajuste de estilo conversacional: el adaptador puede aplicarse sobre GLM-4-9B-Chat para adaptar el tono o el formato de respuesta a un dominio concreto, manteniendo el conocimiento del modelo base y reduciendo el coste frente a un fine-tuning completo.
- Prototipado rápido de asistentes especializados: al ocupar ~0,1 GB, permite experimentar con distintos adaptadores sobre el mismo modelo base y alternarlos en memoria sin recargar los 9,4B de parámetros.
- Investigación en geometría de adaptadores: útil para estudiar parametrizaciones tipo Stiefel frente a LoRA estándar en tareas de instrucción, comparando estabilidad y rendimiento.
- Despliegue con múltiples adaptadores: en escenarios multi-tenant donde se sirve GLM-4-9B-Chat con vLLM o TGI y se cargan adaptadores LoRA por cliente (multi-LoRA serving).
- Evaluación de SFT sobre modelos GLM: como punto de partida para reproducir o comparar recetas de SFT con TRL sobre la familia GLM-4.
- Filtrado o reformateo de texto: si el adaptador fue entrenado para una tarea concreta de transformación, puede integrarse en pipelines de preprocesado; requiere validación empírica previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador por sí solo ocupa ~0,1 GB, pero requiere cargar el modelo base GLM-4-9B-Chat (~18 GB en fp16, ~9-10 GB en cuantización de 8 bits, ~5-6 GB en 4 bits).
- VRAM estimada para inferencia: ~20 GB en fp16 con overhead, ~12 GB en 8 bits, ~7-8 GB en 4 bits (estimaciones para el modelo base, no verificadas para el adaptador).
- GPU recomendadas: A100 40/80 GB, H100, L40S para fp16; RTX 4090 (24 GB) suficiente en fp16 con cuidado de la longitud de contexto; RTX 3090/4080 en cuantización 8 o 4 bits.
- Cabe en GPU de consumo: sí, en 4 bits en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB), y en fp16 en RTX 4090.
- Despliegue: vLLM y TGI con soporte de adaptadores LoRA; llama.cpp/Ollama requieren fusión previa del adaptador con el modelo base (merge_and_unload) y conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| einsof2-glm4-9b-stiefel-adapter | Adaptador LoRA sobre 9,4B | Heredado del base (hasta 128K) | safetensors (PEFT) | no disponible | Requiere GLM-4-9B-Chat |
| THUDM/glm-4-9b-chat (base) | ~9,4B | Hasta 128K | safetensors | GLM-4 (términos propios) | Modelo completo, chat multilingüe |
| Adaptadores LoRA genéricos sobre GLM-4-9B | Adaptador | Heredado | safetensors | Variable | Depende del autor; muchos sin benchmarks |
| Qwen2.5-7B-Instruct | ~7,6B | 32K (128K en variantes) | safetensors, GGUF | Apache 2.0 | Alternativa densa de tamaño similar con licencia permisiva |

## Limitaciones y advertencias

- Información insuficiente: no se documentan datos de entrenamiento, hiperparámetros LoRA, licencia ni idiomas, lo que impide evaluar su idoneidad en producción.
- Licencia ambigua: el campo "licence: license" no especifica términos; además, el uso comercial queda condicionado por la licencia del modelo base GLM-4-9B-Chat, que tiene condiciones propias.
- Dependencia del modelo base: no funciona de forma autónoma; requiere descargar y cargar GLM-4-9B-Chat, con sus propios requisitos de hardware y licencia.
- Riesgo de alucinación: inherente al modelo base; el SFT puede incrementarlo si el dataset de ajuste era estrecho o sesgado.
- Posible olvido catastrófico: el ajuste SFT puede degradar capacidades del modelo base (tool calling, multilingüismo, razonamiento) si no se ha regularizado; no hay evaluación publicada.
- Sin benchmarks ni evaluaciones de seguridad: no hay evidencia de rendimiento ni de mitigación de sesgos.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad; tratar como experimental.
- El nombre "stiefel" sugiere una técnica de investigación no documentada; no asumir propiedades geométricas sin verificar el código de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Polydim-Einsof/einsof2-glm4-9b-stiefel-adapter
- Modelo base GLM-4-9B-Chat: https://huggingface.co/THUDM/glm-4-9b-chat
- Repositorio TRL: https://github.com/huggingface/trl
- Documentación PEFT: https://huggingface.co/docs/peft
- Repositorio GLM-4 (Zhipu AI): https://github.com/THUDM/GLM-4
