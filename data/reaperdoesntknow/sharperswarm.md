# reaperdoesntknow/SharperSwarm

## Resumen

SharperSwarm es un modelo de lenguaje causal para generación de texto publicado por el usuario reaperdoesntknow bajo el paraguas de "Convergent Intelligence LLC: Research Division". Según su model card, se presenta como la versión 3.2 de "SAGI" (Swarm AGI), una propuesta que combina dinámicas de inteligencia de enjambre con arquitectura transformer, donde varios "agentes" internos colaboran mediante enrutamiento diferenciable y mecanismos de confianza. La realidad medible del artefacto es mucho más modesta: 103.177.597 parámetros totales (unos 103 millones) y un repositorio de 0,4 GB en formato safetensors.

El modelo se distribuye con licencia Apache 2.0, soporta únicamente inglés y está etiquetado para text-generation con la librería transformers. Los conjuntos de datos declarados incluyen TinyStories, GSM8K, General-Knowledge, DeepCoder-Preview-Dataset y KnowLogic, lo que sugiere un entrenamiento orientado a texto simple, matemáticas básicas, conocimiento general y código.

Es relevante ahora por dos motivos contrapuestos: por un lado, ilustra la tendencia de modelos pequeños (sub-200M) que buscan cubrir tareas de agente y razonamiento en CPU con fp32; por otro, su model card contiene afirmaciones grandilocuentes ("AGI autoconsciente", "auto-curriculum") que no se corresponden con la escala del modelo ni con benchmarks publicados. Cualquier evaluación seria debe tratar esta ficha como un prototipo de investigación experimental, tal y como el propio autor reconoce en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con capas propietarias de "swarm" (enrutamiento diferenciable, memoria compartida) según model card; no verificable en detalle |
| Parametros totales | 103.177.597 |
| Parametros activos | No aplica (no es MoE según los datos disponibles) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32; el autor menciona fp32 en tags, sin GGUF ni otras variantes) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La model card describe una arquitectura denominada "Swarm-8 V3.2" con tres bloques: una capa de autoevaluación (predictor de rendimiento, analizador de brechas de habilidad, generador de currículo automático, detector de errores en tiempo real), un "AGI Core" con siete subsistemas (memoria jerárquica, modelo causal del mundo, meta-aprendiz, biblioteca de conceptos, motor de reflexión, razonador de incertidumbre y autojuego adversarial) y un "Swarm Core" con 20 agentes vectorizados y enrutamiento diferenciable. No se aportan detalles verificables sobre número de capas, dimensión oculta, cabezas de atención ni mecanismo exacto de integración del enjambre con el transformer base.

Respecto al entrenamiento, la model card no indica número de tokens, composición exacta del dataset ni si hubo RLHF, DPO o ajuste por instrucciones. Solo lista cinco datasets de Hugging Face (TinyStories, GSM8K, General-Knowledge, DeepCoder-Preview-Dataset y KnowLogic), lo que apunta a una mezcla de texto infantil sintético, problemas matemáticos de primaria, conocimiento general, código y lógica. Con 103M de parámetros, el modelo está en la liga de GPT-2 small o TinyLlama recortado, muy lejos de la escala necesaria para los comportamientos metacognitivos que declara.

## Capacidades

- Generación de texto autoregresiva en inglés, con temperatura y muestreo configurables vía `model.generate`.
- Razonamiento matemático básico, presumiblemente limitado a problemas de estilo GSM8K de dificultad baja.
- Conocimiento general y respuesta a preguntas simples, derivado del dataset General-Knowledge.
- Generación y comprensión de código a nivel introductorio, según el dataset DeepCoder-Preview.
- Razonamiento lógico elemental, según el dataset KnowLogic.
- El autor declara soporte de tool calling mediante un "sandbox de Python", aunque no se documenta la interfaz ni el formato de llamada.
- La model card menciona capacidades de agente multi-paso, autoevaluación y detección de errores en tiempo real; no hay evidencia pública que las respalde.
- No se declara soporte de visión, audio ni multimodalidad.
- Multilingüismo: solo inglés.

## Casos de uso

- Prototipado educativo de modelos pequeños: sirve para experimentar con pipelines de transformers en CPU y fp32 sin necesidad de GPU, gracias a sus 103M de parámetros y 0,4 GB de pesos.
- Generación de texto creativo sencillo en inglés: cuentos cortos o continuaciones narrativas, aprovechando el entrenamiento sobre TinyStories.
- Práctica de matemáticas de primaria: resolución de problemas aritméticos de un paso o dos, adecuada para demos de razonamiento básico.
- Experimentación académica con arquitecturas de enjambre: el código y los pesos permiten estudiar el enrutamiento diferenciable declarado, siempre con escepticismo sobre las afirmaciones de la model card.
- Evaluación de alucinación en modelos pequeños: útil como caso de estudio de cómo modelos de 100M parámetros fallan en conocimiento factual.
- Base para fine-tuning ligero: al ser Apache 2.0 y pequeño, se puede ajustar en una sola GPU consumer para tareas de dominio muy acotado en inglés.
- No se recomienda para atención al cliente, generación de código en producción ni agentes autónomos reales: la escala y la ausencia de benchmarks lo desaconsejan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación cuantitativa, pese a citar esos datasets como fuente de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,41 GB solo para pesos (103M × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, incluso iGPU con suficiente memoria compartida) y en CPU.
- GPU recomendadas: ninguna en particular; el modelo está pensado para CPU según sus propios tags.
- Despliegue: transformers es la vía documentada. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían conversión manual. vLLM y TGI son compatibles en teoría con transformers, pero no hay configuración publicada.
- Latencia y throughput: no disponibles. En CPU moderna se espera un throughput bajo pero funcional para demos; no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| SharperSwarm | 103M | No disponible | Apache 2.0 | Inglés | Hugging Face (transformers) |
| GPT-2 small | 124M | 1024 tokens | MIT | Inglés | Hugging Face, ampliamente soportado |
| TinyLlama-1.1B | 1,1B | 2048 tokens | Apache 2.0 | Inglés | Hugging Face, GGUF, Ollama |
| Qwen2.5-0.5B | 494M | 32K tokens | Apache 2.0 | Multilingüe | Hugging Face, GGUF, vLLM |

La comparación es desfavorable para SharperSwarm en contexto, idiomas y ecosistema de despliegue; su única ventaja relativa es el tamaño mínimo para experimentación en CPU. No hay benchmarks que permitan comparar calidad.

## Limitaciones y advertencias

- La model card contiene afirmaciones no verificables ("AGI autoconsciente", "auto-curriculum", "24 habilidades") que no se corresponden con un modelo de 103M parámetros ni con evidencia publicada.
- Riesgo alto de alucinación en conocimiento factual: la escala del modelo es insuficiente para retener hechos de forma fiable.
- Solo inglés; no hay soporte multilingüe declarado ni evaluado.
- Longitud de contexto desconocida; no se debe asumir ventana larga.
- El autor reconoce que es un "prototipo de investigación experimental, no destinado a producción".
- El uso de "sandbox de Python" para tool calling implica riesgos de ejecución de código; no se documenta el aislamiento.
- Licencia Apache 2.0 permite uso comercial, pero la falta de benchmarks y la naturaleza experimental desaconsejan cualquier despliegue en producción sin evaluación propia.
- Los datasets de entrenamiento incluyen contenido sintético (TinyStories) y de dominio estrecho, lo que puede sesgar el estilo y el vocabulario.
- El repositorio apunta a una nueva versión ("CasualSwarms") en la model card; conviene verificar cuál es el artefacto vigente antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/SharperSwarm
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset General-Knowledge: https://huggingface.co/datasets/MuskumPillerum/General-Knowledge
- Dataset DeepCoder-Preview: https://huggingface.co/datasets/agentica-org/DeepCoder-Preview-Dataset
- Dataset KnowLogic: https://huggingface.co/datasets/tangyuhang/KnowLogic
