# DGurgurov/SmolLM3-3B-SFT-GRPO-IT

## Resumen

SmolLM3-3B-SFT-GRPO-IT es un modelo de razonamiento en italiano desarrollado por Daniil Gurgurov y colaboradores como parte del pipeline de adaptación de razonamiento en dos etapas llamado ReasonXL. Parte del modelo base HuggingFaceTB/SmolLM3-3B, un decoder-only transformer de 3 mil millones de parámetros con soporte nativo de seis idiomas y contexto de hasta 128K tokens. La primera etapa consiste en un ajuste supervisado (SFT) sobre trazas de razonamiento en italiano del dataset toroe/ReasonXL-SFT, que desplaza el idioma de razonamiento del inglés al italiano. La segunda etapa aplica refuerzo con Dr. GRPO para recuperar la calidad de razonamiento que se pierde durante el SFT, manteniendo la conformidad con el idioma objetivo.

Este modelo es relevante porque aborda el reto de trasladar las capacidades de razonamiento de un LLM a un idioma distinto sin degradar el rendimiento, un problema clave para el despliegue multilingüe. Al estar basado en SmolLM3, hereda su arquitectura eficiente y su capacidad para ejecutarse en hardware de gama media, lo que lo hace interesante para aplicaciones de razonamiento en italiano en entornos con recursos limitados. Aunque los resultados completos aún no se han publicado, el modelo representa un caso práctico de adaptación de razonamiento en dos etapas con verificación matemática como recompensa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3) |
| Parámetros totales | 3.000.000.000 (aprox., según modelo base; metadata indica 384.387.328, probablemente erróneo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado de SmolLM3-3B) |
| Tipos de cuantización | No disponible (repo contiene safetensors, se espera compatibilidad con GGUF/AWQ) |
| Idiomas soportados | Italiano (razonamiento), herencia multilingüe del base (6 idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en SmolLM3-3B, un decoder-only transformer con atención estándar y una ventana de contexto de 128K tokens. El entrenamiento sigue el pipeline de dos etapas de Reason ReasonXL: primero un ajuste supervisado (SFT) sobre trazas de razonamiento en italiano del dataset `toroe/ReasonXL-SFT`, que tiene como objetivo cambiar el idioma de razonamiento del modelo de inglés a italiano. La segunda etapa aplica RL con Dr. GRPO, una variante de GRPO (Group Relative Policy Optimization) que usa una recompensa compuesta sobre problemas matemáticos verificables, diseñada para recuperar la calidad de razonamiento perdida durante el SFT sin sacrificar la conformidad con el idioma objetivo. El paper asociado (arXiv:2604.12378) describe la metodología completa, aunque los detalles de la formulación de recompensa y la evaluación aún no se han publicado en la model card.

## Capacidades

- Razonamiento en italiano: el modelo genera cadenas de razonamiento en italiano, resultado del SFT con trazas en ese idioma.
- Razonamiento matemático: el entrenamiento RL se centra en problemas matemáticos verificables, por lo que tiene competencia en aritmética, álgebra y problemas de lógica cuantitativa.
- Instrucciones y diálogo: hereda las capacidades de instrucción de SmolLM3-3B, que es un modelo ajustado con instrucciones.
- Modo de razonamiento dual: SmolLM3-3B tiene dos modos de razonamiento (normal y pensamiento profundo), que el modelo hereda.
- Multilingüismo de base: aunque el razonamiento está enfocado en italiano, el modelo base soporta seis idiomas, por lo que puede generar texto en otros idiomas, aunque con menor calidad de razonamiento.
- No se confirma tool calling: la documentación no indica soporte explícito de tool calling o function calling en esta variante.

## Casos de uso

- **Asistente de tutoría matemática en italiano**: el modelo puede resolver problemas de matemáticas explicando el proceso paso a paso en italiano, útil para plataformas de aprendizaje automático en Italia.
- **Generación de explicaciones técnicas en italiano**: puede generar razonamiento y explicaciones detalladas para preguntas técnicas o científicas en italiano, por ejemplo en foros o chatbots de soporte.
- **Razonamiento en pipelines de IA conversacional**: integración en sistemas de chatbot que requieren que el modelo razone antes de responder, manteniendo el idioma italiano.
- **Investigación en adaptación de razonamiento multilingüe**: sirve como modelo de referencia para estudiar cómo la RL puede recuperar calidad de razonamiento tras un cambio de idioma.
- **Generación de contenido educativo**: creación de ejercicios resueltos o explicaciones de conceptos matemáticos en italiano, útil para plataformas de e-learning.
- **Prototipado de agentes con razonamiento**: aunque no se confirma tool calling, puede usarse en prototipos de agentes que necesiten razonar en italiano antes de ejecutar acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que "Full training details, reward formulation, evaluation results, and methodology will follow soon", por lo que no hay datos de MMLU, HumanEval o GSM8K en la documentación actual.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de 3B parámetros en FP16, se requieren aproximadamente 6-8 GB de VRAM. Con cuantización de 4 bits, se puede reducir a unos 2-3 GB.
- **GPUs recomendadas**: RTX 3060 12GB, RTX 3090, RTX 4090, A100, H100. Cabe en GPUs de consumo medio (8-12 GB).
- **Opciones de despliegue**: compatible con vLLM, llama.cpp, Ollama (si se convierte a GGUF), Hugging Face Transformers, TGI.
- **Latencia**: no disponible, pero al ser un modelo de 3B, puede alcanzar un throughput de decenas de tokens por segundo en GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 128K | Apache 2.0 | HuggingFace |
| DGurgurov/SmolLM3-3B-SFT-IT | 3B | 128K | No disponible | HuggingFace |
| DGurgurov/SmolLM3-3B-SFT-GRPO-IT | 3B | 128K | No disponible | HuggingFace |
| Phi-3-mini | 3.8B | 128K | MIT | HuggingFace |

El modelo se diferencia de su base por el enfoque en razonamiento en italiano. Comparado con Phi-3-mini, que tiene capacidades multilingües generales, este modelo está especializado en razonamiento matemático en español, pero carece de la documentación de rendimiento que sí tiene Phi-3.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica la licencia del modelo, lo que impide su uso comercial sin consultar al autor.
- **Rendimiento sin validar**: no hay benchmarks publicados, por lo que no se puede garantizar su calidad de razonamiento en comparación con otros modelos.
- **Enfoque monolingüe**: el razonamiento está optimizado para italiano, por lo que su rendimiento en otros idiomas puede degradarse.
- **Posible sesgo en datos de entrenamiento**: el dataset `ReasonXL-SFT` y los problemas matemáticos de RL pueden tener sesgos implícitos.
- **Riesgo de alucinación**: como todos los LLM, puede generar razonamientos incorrectos o inventar datos, especialmente en problemas no matemáticos.
- **Dependencia del modelo base**: la calidad final depende del base SmolLM3-3B, que tiene limitaciones en tareas complejas de razonamiento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/DGurgurov/SmolLM3-3B-SFT-GRPO-IT)
- [Modelo base SmolLM3-3B](https://huggingface.co/HuggingFaceTB/SmolLM3-3B)
- [Dataset ReasonXL-SFT](https://huggingface.co/datasets/toroe/ReasonXL-SFT)
- [Paper ReasonXL (arXiv:2604.12378)](https://arxiv.org/abs/2604.12378)
- [Repositorio de modelos de DGurgurov](https://huggingface.co/DGurgurov/models)
