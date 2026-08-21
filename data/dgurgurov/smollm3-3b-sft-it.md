# DGurgurov/SmolLM3-3B-SFT-IT

## Resumen

SmolLM3-3B-SFT-IT es la primera etapa del pipeline de adaptación de razonamiento **ReasonXL**, desarrollado por Daniil Gurgurov y colaboradores. Se trata de un ajuste fino supervisado (SFT) del modelo base `HuggingFaceTB/SmolLM3-3B` cuyo objetivo es trasladar el idioma de razonamiento interno del modelo del inglés al italiano, preservando sus capacidades de razonamiento. El entrenamiento se realiza sobre trazas de razonamiento del dataset `toroe/ReasonXL-SFT` y constituye el paso previo a una segunda etapa de aprendizaje por refuerzo (GRPO) que recupera la calidad de razonamiento perdida durante el SFT.

Con 3,34 mil millones de parámetros, el modelo se sitúa en la escala de modelos pequeños, donde SmolLM3 ha demostrado un rendimiento competitivo con modelos de 4B según la documentación de Hugging Face. Su relevancia radica en abordar un problema poco explorado: el cambio de idioma de razonamiento en LLMs sin sacrificar el rendimiento en tareas de razonamiento. El modelo base SmolLM3 soporta razonamiento en modo dual, seis idiomas y contexto largo, y está entrenado sobre más de 10 billones de tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en SmolLM3-3B) |
| Parametros totales | 3.337.766.912 (≈3,34B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base SmolLM3 soporta contexto largo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones cuantizadas publicadas) |
| Idiomas soportados | italiano (objetivo del SFT); el modelo base soporta 6 idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de SmolLM3-3B, un modelo de 3B parámetros desarrollado por Hugging Face, entrenado sobre más de 10 billones de tokens procedentes de fuentes públicas (documentos web, artículos científicos y código). SmolLM3 incorpora razonamiento en modo dual (modo normal y modo de razonamiento extendido), soporte multilingüe para 6 idiomas y contexto largo. El modelo base se describe como totalmente abierto y con rendimiento competitivo frente a modelos de 4B.

El entrenamiento de SmolLM3-3B-SFT-IT consiste en un ajuste fino supervisado sobre el dataset `toroe/ReasonXL-SFT`, que contiene trazas de razonamiento. El objetivo es que el modelo realice su razonamiento interno en italiano en lugar de inglés, manteniendo sus capacidades de razonamiento. Forma parte de un pipeline de dos etapas: la primera (SFT) cambia el idioma de razonamiento, y la segunda (GRPO, en el modelo `DGurgurov/SmolLM3-3B-SFT-GRPO-IT`) aplica aprendizaje por refuerzo con una recompensa compuesta sobre problemas matemáticos verificables para recuperar la calidad de razonamiento perdida durante el SFT.

## Capacidades

- Razonamiento en italiano: el modelo está diseñado para realizar su razonamiento interno en italiano, lo que puede mejorar la coherencia de las explicaciones generadas en ese idioma.
- Razonamiento matemático: el pipeline ReasonXL se evalúa sobre problemas matemáticos verificables, lo que sugiere una orientación a tareas de razonamiento simbólico y numérico.
- Herencia multilingüe: al partir de SmolLM3-3B, conserva la capacidad de generar texto en los 6 idiomas soportados por el modelo base, aunque el foco del SFT es el italiano.
- Generación de texto: como modelo de 3B, puede generar texto coherente en distintos dominios, si bien su especialización es el razonamiento.
- Razonamiento en modo dual: hereda del modelo base la capacidad de alternar entre razonamiento estándar y razonamiento extendido (modo dual), aunque esta capacidad no está documentada de forma explícita para este fine-tune.
- No se documenta soporte de tool calling, function calling, agentes o visión en la información disponible.

## Casos de uso

- Asistente educativo de matemáticas en italiano: el modelo puede generar explicaciones paso a paso y resolver problemas matemáticos razonando en italiano, útil en plataformas de aprendizaje para estudiantes italófonos.
- Investigación sobre multilingüismo en razonamiento: como modelo de referencia para estudiar cómo el idioma de razonamiento afecta al rendimiento en tareas de razonamiento, comparando con el modelo base y con variantes en otros idiomas.
- Base para entrenamiento con GRPO: el checkpoint SFT es el punto de partida obligatorio para la segunda etapa del pipeline ReasonXL, que aplica aprendizaje por refuerzo con recompensas compuestas.
- Evaluación comparativa de modelos pequeños multilingües: permite comparar el rendimiento de un modelo de 3B con razonamiento en italiano frente a modelos de tamaño similar razonando en inglés.
- Generación de explicaciones en italiano para contenido educativo: puede integrarse en sistemas de tutoría inteligente que necesiten explicar conceptos matemáticos o lógicos en italiano.
- Fine-tuning posterior para dominios específicos: al ser un checkpoint intermedio, puede servir de base para ajustes adicionales en tareas concretas que requieran razonamiento en italiano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los detalles de evaluación y la metodología completa se publicarán próximamente.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de ≈3,34B parámetros, se estima aproximadamente 6,7 GB en FP16, 3,3 GB en cuantización INT8 y 1,7 GB en INT4 (estimaciones teóricas, sin incluir memoria de activaciones ni overhead del runtime).
- GPUs recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 3070, RTX 4060 Ti) puede ejecutar el modelo en FP16. Con cuantización INT4, GPUs de 4-6 GB podrían ser suficientes.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media de consumo.
- Opciones de despliegue: compatible con vLLM, llama.cpp (tras convertir a GGUF), Ollama y Text Generation Inference (TGI), siempre que se conviertan los pesos al formato adecuado.
- Latencia y throughput: no disponible en la información publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| SmolLM3-3B-SFT-IT (este) | 3,34B | no disponible | no publicado | no disponible |
| SmolLM3-3B (base) | 3B | largo (sin cifra exacta) | SoTA en escala 3B, competitivo con 4B | abierta (según documentación oficial) |
| SmolLM3-3B-SFT-GRPO-IT | 3,34B | no disponible | no publicado | no disponible |

Nota: el modelo base SmolLM3-3B se describe como "totalmente abierto" en la documentación oficial de Hugging Face, pero la licencia concreta de este fine-tune no está especificada.

## Limitaciones y advertencias

- La licencia no está especificada en la model card, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar con el autor antes de desplegar en producción.
- No se han publicado resultados de evaluación, por lo que el rendimiento real del modelo en tareas de razonamiento no está verificado de forma independiente.
- El modelo es un checkpoint intermedio del pipeline ReasonXL; la versión final (GRPO) tiene potencialmente mejor rendimiento en razonamiento.
- El modelo está orientado al italiano; su comportamiento en otros idiomas no está documentado y podría degradarse tras el SFT.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo reciente o poco usado; no existe aún evidencia de su fiabilidad en producción.
- El tamaño del repositorio (38 GB) sugiere que incluye múltiples checkpoints o versiones de pesos, no solo los pesos finales.
- Los modelos de 3B presentan un riesgo inherente de alucinación y errores en tareas de razonamiento complejo, especialmente en dominios fuera de su distribución de entrenamiento.
- No se documenta soporte de tool calling ni de uso de agentes, lo que limita su integración en pipelines automatizados.

## Enlaces

- [HuggingFace: DGurgurov/SmolLM3-3B-SFT-IT](https://huggingface.co/DGurgurov/SmolLM3-3B-SFT-IT)
- [HuggingFace: DGurgurov/SmolLM3-3B-SFT-GRPO-IT](https://huggingface.co/DGurgurov/SmolLM3-3B-SFT-GRPO-IT)
- [HuggingFace: toroe/ReasonXL-SFT (dataset)](https://huggingface.co/datasets/toroe/ReasonXL-SFT)
- [HuggingFace: HuggingFaceTB/SmolLM3-3B (modelo base)](https://huggingface.co/HuggingFaceTB/SmolLM3-3B)
- [GitHub: huggingface/smollm (repositorio del texto)](https://github.com/huggingface/smollm/tree/main/text)
- [arXiv: 2604.12378 (paper ReasonXL)](https://arxiv.org/abs/2604.12378)
