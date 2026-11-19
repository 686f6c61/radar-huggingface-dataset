# reaperdoesntknow/SharperSwarm

## Resumen

SharperSwarm es un modelo de lenguaje causal para generación de texto publicado por el usuario reaperdoesntknow bajo el paraguas de "Convergent Intelligence LLC: Research Division". Según su model card, se presenta como una implementación de "SAGI" (Swarm AGI), un prototipo de investigación que combina una arquitectura transformer con mecanismos descritos como "inteligencia de enjambre": múltiples agentes internos que colaboran mediante enrutamiento diferenciable, mecanismos de confianza y memoria compartida. La versión documentada en la model card es la V3.2, que añade una "capa de autoevaluación" con predicción de rendimiento y generación automática de currículos de aprendizaje.

A pesar de la terminología ambiciosa de la model card (AGI, autoconciencia, motivación intrínseca), los datos objetivos del repositorio son mucho más modestos: 103.177.597 parámetros totales (aproximadamente 103 millones), un tamaño de repositorio de 0,4 GB y pesos en safetensors. Se trata, por tanto, de un modelo de escala pequeña, comparable en tamaño a modelos como GPT-2 large o a las variantes pequeñas de las familias modernas de transformers. El modelo está etiquetado únicamente para inglés y declara entrenamiento sobre datasets como TinyStories, GSM8K, General-Knowledge, DeepCoder-Preview-Dataset y KnowLogic.

La relevancia de esta ficha es fundamentalmente crítica: el modelo se distribuye con licencia Apache 2.0, tiene un número notable de descargas (2556) y utiliza un vocabulario técnico que puede inducir a confusión sobre sus capacidades reales. Es importante evaluarlo como lo que los datos indican que es: un experimento de investigación de pequeño tamaño, no un sistema AGI ni un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con componentes descritos como "swarm" (agentes internos, enrutamiento diferenciable, memoria compartida) según la model card; no se detalla la implementación exacta |
| Parametros totales | 103.177.597 |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32 según tags; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La model card describe una arquitectura denominada "Swarm-8 V3.2" organizada en tres capas: una capa de autoevaluación (predictor de rendimiento, analizador de brechas de habilidad, generador de currículo automático, detector de errores en tiempo real y detector de límites de capacidad), un "AGI Core" con siete subsistemas (memoria jerárquica, modelo causal del mundo, meta-aprendiz, biblioteca de conceptos, motor de reflexión, razonador de incertidumbre y autojuego adversarial) y un "Swarm Core" con 20 agentes, enrutamiento diferenciable y activación basada en confianza. No se proporcionan detalles verificables sobre cómo se implementan estos componentes en el grafo computacional ni sobre su correspondencia con los pesos publicados.

En cuanto a los datos de entrenamiento, la model card lista cinco datasets: roneneldan/TinyStories (cuentos infantiles sintéticos), openai/gsm8k (problemas matemáticos de primaria), MuskumPillerum/General-Knowledge, agentica-org/DeepCoder-Preview-Dataset (código) y tangyuhang/KnowLogic. No se especifica el número de tokens de entrenamiento, la composición proporcional del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones técnicas verificables como decodificación especulativa o atención lineal; las menciones a "autoconciencia" y "motivación intrínseca" deben interpretarse como terminología de la model card, no como propiedades demostradas.

## Capacidades

- Generación de texto en inglés con un modelo de aproximadamente 103 millones de parámetros.
- La model card declara una "taxonomía de 24 habilidades" que incluye cognición, conocimiento, código, creatividad, planificación y metacognición, aunque no se aportan evaluaciones que respalden estas capacidades.
- Soporte declarado de uso de herramientas (tool-use) con un "sandbox de Python", según la sección de seguridad de la model card.
- Capacidades declaradas de razonamiento multi-paso y descomposición de objetivos, sin evidencia cuantitativa publicada.
- Capacidades multilingües: únicamente inglés declarado.
- No se documentan capacidades de visión, audio ni modos de "thinking" verificables.

## Casos de uso

- Experimentación académica sobre arquitecturas con enrutamiento tipo enjambre: el modelo sirve como banco de pruebas de bajo coste (0,4 GB de pesos) para investigar mecanismos de routing diferenciable y agregación de agentes internos en transformers pequeños.
- Generación de texto creativo breve en inglés: con 103 millones de parámetros y entrenamiento sobre TinyStories, puede producir narrativas cortas y simples para demos o prototipos de interfaces.
- Evaluación de técnicas de autoevaluación declaradas: útil para reproducir y contrastar las afirmaciones de la model card sobre predicción de rendimiento y detección de errores en tiempo real en un entorno controlado.
- Docencia sobre model cards y comunicación técnica: caso de estudio sobre la distancia entre el vocabulario de marketing (AGI, autoconciencia) y las métricas objetivas del repositorio.
- Pruebas de integración con la librería transformers: al cargarse con `AutoModelForCausalLM` y pesos safetensors, sirve para validar pipelines de carga y generación en entornos de CI.
- Investigación sobre datasets de entrenamiento pequeños y su efecto en capacidades: permite estudiar cómo la mezcla de TinyStories, GSM8K y datasets de código influye en el comportamiento de un modelo de escala reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra métrica cuantitativa, y no se han encontrado evaluaciones independientes en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB para los pesos (103 millones de parámetros × 4 bytes), más overhead de activaciones y KV cache; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- Cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU, como sugiere el tag `cpu` de la model card.
- GPU recomendadas: no se requieren GPU de datacenter (A100, H100); cualquier GPU con al menos 2-4 GB de VRAM es suficiente.
- Opciones de despliegue: transformers (soporte nativo declarado); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la ausencia de pesos GGUF publicados limita el despliegue en llama.cpp/Ollama sin conversión manual.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SharperSwarm (este modelo) | ~103 M | no disponible | Apache 2.0 | Hugging Face, transformers | Prototipo de investigación; sin benchmarks publicados |
| GPT-2 large | 774 M | 1024 tokens | MIT (pesos) | Hugging Face | Referencia histórica de escala similar; benchmarks públicos |
| Qwen2.5-0.5B | ~494 M | 32 768 tokens | Apache 2.0 | Hugging Face | Modelo pequeño moderno con evaluaciones publicadas |
| SmolLM2-135M | ~135 M | 8192 tokens | Apache 2.0 | Hugging Face | Alternativa pequeña con benchmarks y soporte de ecosistema |

La comparación es orientativa: SharperSwarm no publica métricas que permitan contrastar rendimiento real frente a estas alternativas, y su contexto no está documentado.

## Limitaciones y advertencias

- La model card emplea términos como "AGI", "autoconciencia" y "motivación intrínseca" que no están respaldados por evaluaciones publicadas; el modelo tiene ~103 millones de parámetros y no debe tratarse como un sistema de propósito general.
- El autor declara explícitamente que es un "prototipo de investigación experimental" no destinado a producción.
- Riesgo elevado de alucinación y de generación incoherente fuera de dominios simples, dado el tamaño reducido y la mezcla de datasets (incluido TinyStories, orientado a cuentos infantiles).
- Soporte únicamente de inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto no documentada: no es posible planificar aplicaciones que requieran ventanas largas.
- La model card menciona capacidades de ejecución de código en un sandbox de Python; su uso en producción introduce riesgos de seguridad que el autor advierte explícitamente.
- Licencia Apache 2.0 permite uso comercial, pero la falta de benchmarks y de documentación técnica desaconseja su uso en entornos productivos.
- Existe una versión posterior indicada en la model card (`reaperdoesntknow/CasualSwarms`), lo que sugiere que este modelo puede quedar obsoleto.
- El ejemplo de código de la model card hace referencia a `reaperdoesntknow/SAGI`, no a `reaperdoesntknow/SharperSwarm`, lo que puede provocar errores de carga si se copia literalmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/SharperSwarm
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Versión posterior mencionada: https://huggingface.co/reaperdoesntknow/CasualSwarms
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset General-Knowledge: https://huggingface.co/datasets/MuskumPillerum/General-Knowledge
- Dataset DeepCoder-Preview-Dataset: https://huggingface.co/datasets/agentica-org/DeepCoder-Preview-Dataset
- Dataset KnowLogic: https://huggingface.co/datasets/tangyuhang/KnowLogic
