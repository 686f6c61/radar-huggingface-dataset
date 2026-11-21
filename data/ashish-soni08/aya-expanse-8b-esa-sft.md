# ashish-soni08/aya-expanse-8b-esa-sft

## Resumen

aya-expanse-8b-esa-sft es un ajuste fino (SFT) del modelo CohereLabs/aya-expanse-8b, publicado por el usuario ashish-soni08 en Hugging Face. Se trata de un artefacto de investigación desarrollado en el marco del hackathon Lexsi AI Safety & Alignment (Track 3), centrado en el diseño de agentes que usan herramientas (tool-using agents) y en la mitigación de comportamientos de escalada (escalation-prone). El modelo forma parte de una serie comparativa de diseños de recompensa, y el propio autor advierte que algunos modelos de la serie son líneas base deliberadamente propensas a la escalada y no están pensados para despliegue en producción.

El modelo hereda la arquitectura y el tamaño del modelo base Aya Expanse 8B de Cohere Labs, con 8.028.033.024 parámetros totales según los pesos en safetensors. El repositorio ocupa 16,1 GB, lo que es coherente con pesos en precisión de 16 bits. No se dispone de información publicada sobre la longitud de contexto, los idiomas soportados ni la licencia en la información proporcionada; la model card indica explícitamente que se publicará una ficha completa cuando finalicen los experimentos.

La relevancia de este modelo es fundamentalmente investigadora: sirve como punto de comparación en el estudio de diseños de recompensa para agentes seguros que emplean herramientas, un área de creciente interés en alineación y seguridad de IA. No obstante, al carecer de model card completa, benchmarks y licencia definida, no debe considerarse un modelo listo para uso comercial o producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base Aya Expanse 8B; no se detalla en la información proporcionada) |
| Parametros totales | 8.028.033.024 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la información proporcionada. El modelo es un ajuste fino supervisado (SFT) del modelo base CohereLabs/aya-expanse-8b, por lo que hereda su arquitectura transformer y su tokenizador, aunque la model card no especifica la configuración de capas, cabezas de atención ni dimensiones ocultas. El tamaño de 8.028 millones de parámetros y el repositorio de 16,1 GB son consistentes con un modelo denso de aproximadamente 8 mil millones de parámetros en precisión de 16 bits.

En cuanto al entrenamiento, la model card indica que se trata del "Stage 2" de un experimento para un agente Aya seguro frente a escaladas que usa herramientas, en el contexto del hackathon Lexsi AI Safety & Alignment (Track 3). El autor menciona que forma parte de una comparación de diseños de recompensa, pero no se detallan el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales más allá del objetivo de seguridad del agente.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Aya Expanse 8B, si bien no se detallan en la información proporcionada.
- Uso de herramientas (tool calling / function calling): el modelo está entrenado en el contexto de un agente que usa herramientas, según la model card.
- Comportamiento de agente multi-paso: orientado a escenarios de agente con múltiples pasos y gestión de escaladas.
- Seguridad de agente: el objetivo del ajuste es producir un agente "escalation-safe", es decir, que evite comportamientos de escalada no deseados.
- Capacidades multilingües: no disponible en la información proporcionada (el modelo base Aya Expanse es multilingüe, pero no se confirma para este ajuste).
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponible.

## Casos de uso

- Investigación en alineación de agentes: el modelo sirve como artefacto de comparación en estudios sobre diseños de recompensa y comportamientos de escalada en agentes que usan herramientas, dentro del marco del hackathon Lexsi.
- Evaluación de seguridad de agentes con tool calling: permite analizar cómo un agente ajustado con SFT gestiona situaciones que podrían inducir a escaladas, comparándolo con las líneas base propensas a la escalada de la misma serie.
- Reproducción de experimentos: al estar vinculado a un repositorio público de código y resultados (github.com/Ashish-Soni08/lexsi-escalation-safe-agent), facilita la reproducción de los experimentos de seguridad del autor.
- Desarrollo de pipelines de evaluación de agentes: puede integrarse en arneses de evaluación que midan la tasa de escalada y la robustez en tareas multi-paso con herramientas.
- Estudio de ajuste fino supervisado sobre modelos multilingües: útil para analizar cómo el SFT sobre Aya Expanse 8B afecta a las capacidades del modelo base en tareas de agente.
- Docencia y formación en seguridad de IA: como ejemplo práctico de artefacto de investigación en un hackathon de seguridad y alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de 8.028 millones de parámetros, en FP16 se requieren aproximadamente 16 GB de VRAM solo para los pesos, más memoria para el contexto y el runtime.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar GPUs con al menos 24 GB de VRAM para FP16 (por ejemplo, RTX 4090, A100, H100), aunque no se confirma.
- ¿Cabe en GPU de consumo? No confirmado; en cuantizaciones de 8 o 4 bits podría caber en GPUs de consumo con 12-16 GB, pero no se dispone de datos oficiales.
- Opciones de despliegue: no disponible; el formato safetensors es compatible con frameworks habituales como transformers, vLLM o TGI, pero no se especifica soporte oficial.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| aya-expanse-8b-esa-sft | 8.028 M | no disponible | no disponible | Hugging Face (repo público) | Ajuste SFT de investigación para agente seguro |
| CohereLabs/aya-expanse-8b (base) | ~8.000 M (no confirmado en la información) | no disponible | no disponible | Hugging Face | Modelo base del que deriva este ajuste |
| Otros modelos de la serie Lexsi | no disponible | no disponible | no disponible | Repositorio del autor | Incluye líneas base deliberadamente propensas a la escalada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría más allá del propio modelo base y de la serie del hackathon.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que es un modelo experimental de "Stage 2" y que la model card completa se publicará cuando finalicen los experimentos.
- Riesgo deliberado: algunos modelos de la serie son líneas base deliberadamente propensas a la escalada y no deben desplegarse; es necesario verificar a qué variante corresponde este checkpoint antes de cualquier uso.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no confirmados: aunque el modelo base es multilingüe, no se especifica el soporte idiomático de este ajuste.
- Contexto no disponible: se desconoce la ventana de contexto efectiva.
- Riesgo de alucinación y sesgos: no evaluado en la información proporcionada; al ser un ajuste de investigación sin benchmarks publicados, no hay evidencia de robustez.
- Sin métricas de rendimiento: no hay benchmarks que permitan validar su calidad frente al modelo base.
- Advertencia de producción: no debe usarse en entornos de producción sin una evaluación de seguridad y una licencia clara.

## Enlaces

- Hugging Face: https://huggingface.co/ashish-soni08/aya-expanse-8b-esa-sft
- Modelo base: https://huggingface.co/CohereLabs/aya-expanse-8b
- Repositorio de código y resultados: https://github.com/Ashish-Soni08/lexsi-escalation-safe-agent
