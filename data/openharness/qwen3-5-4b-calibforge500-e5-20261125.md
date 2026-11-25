# openharness/Qwen3.5-4B-CalibForge500-E5-20261125

## Resumen

Qwen3.5-4B-CalibForge500-E5-20261125 es un ajuste fino por supervisión (SFT) del modelo base Qwen/Qwen3.5-4B, publicado por el colectivo openharness bajo licencia Apache 2.0. El nombre codifica el procedimiento de entrenamiento: un conjunto de 500 trayectorias de entrenamiento ("CalibForge500") procesadas durante 5 épocas ("E5"), con fecha de instantánea 2026-11-25. El modelo se distribuye como un checkpoint de 4.000 millones de parámetros aproximadamente, heredando la arquitectura y la ventana de contexto del Qwen3.5-4B original.

La relevancia de esta ficha es doble. Por un lado, documenta un caso típico de publicación automatizada de checkpoints SFT en el ecosistema open source, donde el repositorio se reserva antes de que el entrenamiento termine y los resultados de evaluación se publican a posteriori. Por otro lado, sirve como ejemplo de trazabilidad: el autor declara explícitamente que incluirá la configuración congelada de entrenamiento y rollout, además de un archivo comprimido con las trayectorias reales, lo que facilita la reproducibilidad.

No obstante, en el momento de redactar esta ficha la información pública es mínima: la model card indica que el entrenamiento está en curso, que la evaluación TB2.1 está pendiente y que la publicación automática se dispara tras 80 actualizaciones nativas y la aceptación de integridad de checkpoints y datos. Todo dato no confirmado se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | ~4.000 millones (heredados del modelo base Qwen3.5-4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no se especifica safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por supervisión (SFT) del checkpoint Qwen/Qwen3.5-4B. La arquitectura subyacente es, por tanto, la del modelo base: un transformer decoder-only de aproximadamente 4.000 millones de parámetros. La model card no aporta detalles adicionales sobre atención, normalización, tokenizador ni posición de las capas; cualquier afirmación al respecto sería especulativa y no se incluye.

El procedimiento de entrenamiento se describe de forma muy escueta: se denomina "CalibForge500" y consta de 500 trayectorias de entrenamiento, entrenadas durante 5 épocas ("E5"). El autor indica que el repositorio contendrá la configuración congelada de entrenamiento y rollout, así como un archivo comprimido con las trayectorias reales, lo que sugiere un pipeline de generación de datos y ajuste reproducible. No se especifica el número total de tokens, la composición del dataset, ni si hubo etapas de RLHF, DPO o preferencias. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto y razonamiento general: heredadas del modelo base Qwen3.5-4B, aunque no se documentan capacidades específicas en la model card.
- Ajuste por instrucciones (SFT): el entrenamiento está orientado a seguir instrucciones y completar tareas conversacionales, según la etiqueta `sft`.
- Capacidades multilingües: no disponibles; el campo de idiomas del repositorio no está poblado.
- Tool calling / function calling: no disponible; no se documenta soporte explícito.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Evaluación de pipelines SFT: el modelo sirve como checkpoint de referencia para comparar el efecto de 500 trayectorias y 5 épocas frente al modelo base Qwen3.5-4B, útil en experimentos de ajuste supervisado.
- Reproducibilidad de experimentos: al incluir la configuración congelada y las trayectorias de entrenamiento, permite replicar el ajuste en entornos de investigación con recursos limitados (4B de parámetros).
- Prototipado de asistentes conversacionales: un modelo de 4B puede desplegarse en una sola GPU consumer para iterar rápidamente en flujos de diálogo antes de escalar a modelos mayores.
- Generación de texto en dominios acotados: si el dataset CalibForge500 está especializado, el modelo puede adaptarse a tareas concretas de redacción o extracción de información, aunque la model card no lo confirma.
- Fine-tuning posterior: al estar bajo Apache 2.0, puede usarse como punto de partida para nuevos ajustes (SFT, DPO) sin restricciones de licencia comercial.
- Investigación en calibración y alineación: el nombre "CalibForge" sugiere un enfoque en calibración de respuestas; el modelo puede emplearse como caso de estudio en experimentos de calibración de confianza.
- Despliegue en entornos con requisitos de privacidad: al ser un modelo pequeño y de pesos abiertos, puede ejecutarse en infraestructura propia sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación TB2.1 está pendiente y que la publicación automática no espera a dichos resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~4B parámetros, las estimaciones orientativas son aproximadamente 8 GB en FP16, 4-5 GB en cuantización de 8 bits y 2,5-3 GB en 4 bits, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponibles; por tamaño, cabría esperar funcionamiento en GPUs consumer tipo RTX 3060/4060/4090, pero no se documenta.
- ¿Cabe en GPU consumer? No confirmado; el tamaño de 4B lo hace plausible, pero no hay datos oficiales.
- Opciones de despliegue: no disponibles; no se mencionan vLLM, llama.cpp, Ollama ni TGI. El formato de pesos no está especificado, lo que impide confirmar compatibilidad con estos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-CalibForge500-E5 | ~4B | no disponible | Apache 2.0 | Hugging Face (checkpoint SFT) | Entrenamiento en curso; evaluación pendiente |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | no disponible en esta ficha | Hugging Face | Modelo base del ajuste; sin datos de evaluación en esta ficha |
| Alternativas de ~4B (p. ej. familia Llama 3.2 3B, Phi-3.5-mini) | 3-4B | variable | licencias específicas | Hugging Face | No se dispone de comparación directa con este checkpoint |

No se dispone de datos de rendimiento comparables para este modelo, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenamiento en curso: la model card indica que el entrenamiento está en progreso; el checkpoint publicado podría no ser el final y los pesos podrían cambiar.
- Evaluación pendiente: no hay resultados de benchmarks ni de la evaluación TB2.1, por lo que no se puede afirmar su calidad relativa frente al modelo base.
- Idiomas no documentados: el campo de idiomas no está poblado; no se garantiza soporte multilingüe.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan medidas específicas de mitigación.
- Sesgos: no se documentan sesgos conocidos ni auditorías de sesgo.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar los términos del modelo base Qwen3.5-4B, cuya licencia no se detalla en esta ficha.
- Formato de pesos no especificado: puede dificultar el despliegue directo en motores como llama.cpp u Ollama sin conversión previa.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en la comunidad ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/openharness/Qwen3.5-4B-CalibForge500-E5-20261125
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/openharness
