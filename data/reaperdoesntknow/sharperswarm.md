# reaperdoesntknow/SharperSwarm

## Resumen

SharperSwarm es un modelo de lenguaje causal para generación de texto publicado por el usuario reaperdoesntknow bajo el paraguas de "Convergent Intelligence LLC: Research Division". El modelo se presenta como parte de una familia denominada SAGI (Swarm AGI), una propuesta experimental que describe la cognición como un sistema de agentes internos que colaboran mediante enrutamiento diferenciable, mecanismos de confianza y memoria compartida. La model card incluye además una descripción de una "capa de autoevaluación" y una taxonomía de 24 habilidades, si bien no se aportan detalles verificables sobre la implementación real de estos componentes.

El dato objetivo más relevante es su tamaño: 103.177.597 parámetros (aproximadamente 103 millones), almacenados en safetensors con un repositorio de 0,4 GB. Se trata, por tanto, de un modelo pequeño orientado a ejecución en CPU en precisión fp32, no de un sistema de gran escala. Los conjuntos de datos declarados en las etiquetas incluyen TinyStories, GSM8K, General-Knowledge, DeepCoder-Preview-Dataset y KnowLogic, lo que sugiere un entrenamiento mixto con datos sintéticos infantiles, matemáticas, conocimiento general y código.

La relevancia del modelo es limitada desde el punto de vista técnico: su tamaño lo sitúa en la categoría de modelos pequeños experimentales, y la documentación mezcla afirmaciones ambiciosas ("AGI autoconsciente", "auto-mejora") con especificaciones escasas. La model card indica explícitamente que es un prototipo de investigación no destinado a producción, y remite a una versión posterior llamada CasualSwarms.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con componentes descritos como "swarm" (agentes internos, enrutamiento diferenciable); no se detalla la implementación exacta |
| Parámetros totales | 103.177.597 |
| Parámetros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | fp32 (según etiquetas); no se documentan otras opciones |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La model card describe una arquitectura denominada "Swarm-8 V3.2" organizada en tres bloques: una capa de autoevaluación (predictor de rendimiento, analizador de carencias, generador de currículo automático, detector de errores en tiempo real), un "núcleo AGI" con siete subsistemas (memoria jerárquica, modelo causal del mundo, meta-aprendiz, biblioteca de conceptos, motor de reflexión, razonador de incertidumbre y auto-juego adversarial) y un "núcleo swarm" con 20 agentes vectorizados y enrutamiento diferenciable. No se aportan detalles sobre el número de capas, dimensiones ocultas, mecanismo de atención ni número de cabezas, por lo que la arquitectura interna real no es verificable a partir de la información disponible.

En cuanto al entrenamiento, las etiquetas de datasets indican el uso de roneneldan/TinyStories (relatos sintéticos simples), openai/gsm8k (problemas matemáticos de primaria), MuskumPillerum/General-Knowledge (conocimiento general), agentica-org/DeepCoder-Preview-Dataset (código) y tangyuhang/KnowLogic (razonamiento lógico). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones técnicas verificables como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés, orientada a completar prompts y mantener conversaciones simples.
- Razonamiento básico y resolución de problemas matemáticos elementales, presumiblemente por la inclusión de GSM8K en el entrenamiento.
- Generación y comprensión de código a nivel introductorio, según la inclusión de DeepCoder-Preview-Dataset.
- Conocimiento general limitado, derivado del dataset General-Knowledge.
- La model card menciona soporte de tool use con un "sandbox de Python", aunque no se documenta la interfaz ni el formato de llamada.
- Capacidades descritas de autoevaluación, detección de errores y planificación, sin evidencia empírica publicada que las respalde.
- Multilingüismo: no disponible; solo se declara inglés.

## Casos de uso

- Experimentación académica con arquitecturas de agentes internos: el modelo puede servir como banco de pruebas para investigar enrutamiento diferenciable y mecanismos de confianza en modelos pequeños, dado su tamaño manejable de 103 M de parámetros.
- Prototipado rápido en CPU: al ejecutarse en fp32 y ocupar 0,4 GB, permite desplegar un pipeline de generación de texto en entornos sin GPU para pruebas de concepto.
- Generación de texto creativo breve: los datos de TinyStories sugieren cierta capacidad para producir narrativas simples, útil en demos de story generation.
- Educación y divulgación: puede emplearse para ilustrar conceptos de arquitecturas transformer y sistemas multiagente en cursos o talleres.
- Evaluación comparativa de modelos pequeños: sirve como referencia en estudios sobre el impacto del tamaño y la composición del dataset en tareas de razonamiento elemental.
- Pruebas de integración con transformers: su compatibilidad con AutoModelForCausalLM permite validar pipelines de Hugging Face sin requerir hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en fp32, dado que el repositorio completo ocupa 0,4 GB. En la práctica, la carga en memoria ronda los 0,5 GB incluyendo tokenizador y overhead de PyTorch.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso GPUs integradas pueden ejecutar el modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: transformers (librería declarada), y presumiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque no se documenta su disponibilidad.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SharperSwarm | 103 M | No disponible | Apache 2.0 | Hugging Face |
| GPT-2 small | 124 M | 1024 tokens | MIT | Hugging Face |
| TinyLlama-1.1B | 1,1 B | 2048 tokens | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B | 494 M | 32 768 tokens | Apache 2.0 | Hugging Face |

La comparación es orientativa: SharperSwarm se sitúa en el rango de tamaño de GPT-2 small, pero no se dispone de datos de rendimiento que permitan una comparación cuantitativa con estas alternativas. Los modelos citados cuentan con documentación técnica detallada y benchmarks publicados, a diferencia de SharperSwarm.

## Limitaciones y advertencias

- La model card califica el modelo como "prototipo de investigación experimental" y explícitamente no destinado a uso en producción.
- El tamaño de 103 M de parámetros limita severamente la calidad, coherencia y profundidad de las respuestas; es esperable un rendimiento muy inferior al de modelos de varios miles de millones de parámetros.
- Riesgo elevado de alucinación y de generación de texto incoherente, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Solo soporta inglés; no se declara capacitación multilingüe.
- La documentación mezcla afirmaciones no verificables ("AGI autoconsciente", "auto-mejora") con especificaciones técnicas ausentes, lo que dificulta evaluar su comportamiento real.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de benchmarks y de documentación técnica desaconseja su uso en entornos productivos.
- La model card advierte sobre capacidades de ejecución de código en sandbox y sobre "patrones de crecimiento impredecibles" en sistemas auto-mejorables; debe tratarse con cautela si se integra en pipelines automatizados.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/SharperSwarm
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Versión posterior mencionada: https://huggingface.co/reaperdoesntknow/CasualSwarms
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset General-Knowledge: https://huggingface.co/datasets/MuskumPillerum/General-Knowledge
- Dataset DeepCoder-Preview-Dataset: https://huggingface.co/datasets/agentica-org/DeepCoder-Preview-Dataset
- Dataset KnowLogic: https://huggingface.co/datasets/tangyuhang/KnowLogic
