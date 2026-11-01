# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-SFT-adapter

## Resumen

LFM2.5-350M-SmolDataEnvs-SFT-adapter es un adaptador de ajuste fino supervisado (SFT) publicado por el usuario lugman-madhiai sobre el modelo base LiquidAI/LFM2.5-350M, desarrollado por Liquid AI. El adaptador se ha entrenado con la librería Unsloth y la pila TRL, y se distribuye en formato safetensors compatible con transformers y text-generation-inference. Su propósito declarado es el ajuste sobre el conjunto de datos SmolDataEnvs, orientado a tareas de entornos y agentes, aunque la model card no detalla la composición exacta del dataset ni la metodología de entrenamiento.

El modelo base pertenece a la familia LFM2 (Liquid Foundation Models), una arquitectura híbrida de Liquid AI diseñada para inferencia eficiente en dispositivos de borde. Con 350 millones de parámetros, se sitúa en la gama de modelos pequeños, pensados para despliegues con recursos limitados. El adaptador hereda la licencia Apache 2.0 del modelo base, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha es limitada: se trata de un adaptador comunitario sin métricas publicadas, sin datos de benchmarks y con cero descargas en el momento de la consulta. Resulta útil como ejemplo de flujo de trabajo de ajuste fino con Unsloth sobre modelos pequeños, pero no debe considerarse un modelo listo para producción sin una evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2 de Liquid AI; arquitectura híbrida según la familia, no confirmada en la información) |
| Parametros totales | 350M (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantización según el ecosistema, no confirmado) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LiquidAI/LFM2.5-350M, un modelo de la familia LFM2 de Liquid AI. La información proporcionada no detalla la arquitectura interna del modelo base (transformer, híbrido con capas recurrentes o SSM), ni el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF o DPO. La model card solo indica que el ajuste se realizó con Unsloth, que el autor declara un entrenamiento "2x más rápido", y que se empleó TRL para el SFT.

El nombre del adaptador sugiere un ajuste sobre SmolDataEnvs, un conjunto de datos orientado a entornos y agentes, pero no se especifica el número de ejemplos, la longitud de las secuencias ni los hiperparámetros utilizados. Tampoco se documenta si el adaptador modifica todas las capas o solo un subconjunto, ni el rango de LoRA en caso de tratarse de un adaptador de bajo rango. No hay información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés, heredada del modelo base LFM2.5-350M.
- Ajuste específico sobre datos de entornos (SmolDataEnvs), orientado presumiblemente a tareas de agentes y toma de decisiones, aunque no se documenta el alcance exacto.
- Compatibilidad con text-generation-inference y transformers, lo que facilita su despliegue en pipelines estándar.
- Soporte de tool calling y function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el nombre del dataset sugiere entrenamiento en entornos, pero no hay evidencia publicada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Experimentación con ajuste fino de modelos pequeños: el adaptador sirve como referencia para reproducir un pipeline SFT con Unsloth y TRL sobre un modelo de 350M, útil para desarrolladores que quieran validar su flujo antes de escalar a modelos mayores.
- Prototipado de agentes en entornos simulados: dado el nombre del dataset (SmolDataEnvs), puede emplearse para probar políticas de decisión en entornos de juguete, siempre que se valide su comportamiento con evaluaciones propias.
- Investigación académica sobre eficiencia: al tratarse de un modelo de 350M con licencia Apache 2.0, es adecuado para estudios de destilación, cuantización o evaluación de modelos pequeños en tareas de razonamiento.
- Despliegue en dispositivos de borde: el tamaño del modelo base permite inferencia en CPU o GPU de gama baja, lo que facilita pruebas de concepto en hardware limitado.
- Generación de texto asistida en inglés: para tareas de completado o resumen simple donde no se requiera alta precisión, el modelo puede servir como baseline.
- Base para futuros ajustes: al ser un adaptador sobre un modelo base abierto, puede combinarse con otros adaptadores o servir de punto de partida para fine-tuning específico de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 350M en fp16 se estiman aproximadamente 0,7 GB de pesos, y en cuantización de 4 bits alrededor de 0,2-0,3 GB, aunque estas cifras son estimaciones generales y no datos publicados para este adaptador.
- GPU recomendadas: no disponible; por tamaño, cabría en GPUs consumer como RTX 3060, RTX 4060 o superiores, así como en CPU.
- ¿Cabe en GPU consumer? Sí, previsiblemente, dado el tamaño del modelo base, aunque no hay confirmación oficial.
- Opciones de despliegue: transformers y text-generation-inference según los tags; otras opciones como vLLM, llama.cpp u Ollama no están confirmadas para este adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnvs-SFT-adapter | 350M (base) | no disponible | Apache 2.0 | HuggingFace, 0 descargas |
| LiquidAI/LFM2.5-350M (base) | 350M | no disponible | Apache 2.0 | HuggingFace |
| Otros adaptadores SFT comunitarios sobre LFM2 | no disponible | no disponible | variable | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks y métricas de evaluación: no hay evidencia publicada del rendimiento del adaptador en tareas concretas.
- Model card mínima: no se documentan hiperparámetros, composición del dataset ni metodología de evaluación, lo que dificulta la reproducibilidad.
- Riesgo de alucinación: inherente a los modelos de lenguaje pequeños, especialmente en tareas de razonamiento complejo.
- Idiomas: solo se declara inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Sesgos: no documentados; al desconocerse la composición del dataset de ajuste, no es posible evaluar sesgos específicos.
- Licencia Apache 2.0: permite uso comercial, pero el adaptador se distribuye sin garantías y el autor no ofrece soporte.
- Cero descargas y cero likes en el momento de la consulta: indica ausencia de validación por parte de la comunidad.
- El adaptador depende del modelo base LiquidAI/LFM2.5-350M; cualquier limitación de este (contexto, arquitectura, tokenizador) se hereda.

## Enlaces

- HuggingFace: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-SFT-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth: https://github.com/unslothai/unsloth
