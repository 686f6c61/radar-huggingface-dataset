# CBA-Research/GameScaling-9B-S1-FP8

## Resumen

GameScaling-9B-S1-FP8 es una cuantización en FP8 del checkpoint GameScaling-9B-S1, un modelo multimodal de tipo image-text-to-text obtenido por *continued pretraining* sobre Qwen/Qwen3.5-9B. El modelo original lo desarrollan conjuntamente el equipo de I+D de IA de miHoYo (Honkai), la Universidad de Tsinghua, la Universidad de la Academia China de Ciencias, la Universidad de Hong Kong, la Universidad Nacional de Singapur y la Universidad de Pekín, en el marco del trabajo "Scaling in Games: Continued Pre-Training for Embodied Agents in Diverse Virtual Worlds". El objetivo es dotar a un modelo de lenguaje-visión de capacidades de agente encarnado que controle teclado y ratón dentro de entornos de videojuego.

Esta ficha concreta, publicada por CBA-Research, no ha sido entrenada por ese colectivo: es una re-subida comunitaria del checkpoint en formato FP8, ya que los autores originales no publicaron una versión cuantizada de 8 bits. Por tanto, el valor práctico de este repositorio es el de ofrecer un artefacto listo para servir con menos VRAM que el modelo en BF16, manteniendo la licencia Apache 2.0 y la compatibilidad con `transformers` y `compressed-tensors`.

El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), un repositorio de 13,5 GB y está etiquetado únicamente para inglés. Su relevancia actual radica en que explora el escalado de agentes encarnados en mundos virtuales diversos mediante preentrenamiento continuado, una línea de investigación poco cubierta por los modelos generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (derivada de Qwen3.5; detalles internos no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (checkpoint publicado); el modelo base admite otras cuantizaciones, no detalladas |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (FP8) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal que procesa entradas de imagen y texto (`pipeline_tag: image-text-to-text`). Sobre esa base se aplica un proceso de *continued pretraining* orientado a agentes encarnados en videojuegos, según el artículo arXiv:2610.28698. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; tampoco se especifican innovaciones de atención o decodificación.

La innovación declarada en las etiquetas del repositorio es el uso de datos de interacción de teclado y ratón (`keyboard-mouse`) en múltiples mundos virtuales (`gamescaling`, `game-agent`, `embodied-agent`). La variante S1 corresponde a una etapa del currículo de escalado del proyecto, del que existen también checkpoints S3 y tamaños de 0,8B y 2B. Esta re-subida FP8 no modifica los pesos más allá de la cuantización a 8 bits mediante `compressed-tensors`; no hay información sobre calibración, granularidad (por tensor o por canal) ni pérdida de calidad asociada.

## Capacidades

- Generación de texto conversacional (`conversational`) en inglés.
- Comprensión conjunta de imagen y texto: el pipeline declarado es image-text-to-text, por lo que acepta observaciones visuales del entorno.
- Control de agente encarnado mediante acciones de teclado y ratón en videojuegos.
- Razonamiento multi-paso orientado a la interacción con entornos virtuales.
- Integración con el ecosistema `transformers` y pesos en `compressed-tensors` para despliegue con vLLM y motores compatibles.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo *thinking*, audio u otras modalidades: no disponible.

## Casos de uso

- Agentes de juego automatizados: el modelo recibe capturas del entorno y emite acciones de teclado y ratón, lo que permite construir *bots* que juegan títulos 3D o 2D sin ingeniería de reglas específica por juego.
- Investigación en agentes encarnados: sirve como *baseline* reproducible para estudiar generalización entre distintos mundos virtuales, aprovechando que el proyecto publica variantes de 0,8B, 2B y 9B en etapas S1 y S3.
- Evaluación de *world models* y simulación: al interactuar con entornos simulados, puede usarse para medir la fidelidad de motores de juego o de simuladores de física frente a un agente aprendido.
- Generación de datos sintéticos de interacción: las trayectorias (observación, acción) producidas por el modelo pueden servir para ampliar datasets de entrenamiento de otros agentes.
- Pruebas de *QA* automatizadas en videojuegos: un agente basado en este modelo puede recorrer menús, escenarios y flujos de juego para detectar bloqueos o regresiones antes de publicar un parche.
- Despliegue con restricciones de memoria: la versión FP8 reduce el peso de los pesos respecto a BF16, lo que facilita servir el modelo en una sola GPU para experimentos de investigación con latencia aceptable.
- Prototipado de asistentes visuales especializados: aunque su entrenamiento está orientado a juegos, el pipeline image-text-to-text permite experimentar con tareas de descripción y razonamiento sobre imágenes en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con pesos FP8, los 9,4 mil millones de parámetros ocupan aproximadamente 9,4 GB, a los que hay que sumar caché KV, *activations* y overhead del runtime; en la práctica se recomienda un mínimo de 16-24 GB de VRAM para contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para producción; RTX 4090 (24 GB) para experimentación en una sola tarjeta.
- GPU de consumo: cabe en RTX 4090 y, con cuantizaciones adicionales del modelo base, potencialmente en tarjetas de 16 GB; no se confirma compatibilidad con GPUs de 8-12 GB.
- Opciones de despliegue: `transformers` con `compressed-tensors`, vLLM (soporte de FP8 en hardware Ada/Hopper) y motores compatibles con safetensors; llama.cpp/Ollama requerirían una conversión a GGUF no publicada.
- Latencia y throughput: no disponibles; dependerán del motor, del lote y de la longitud de contexto, que tampoco se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GameScaling-9B-S1-FP8 | 9,4B | no disponible | imagen + texto, agente de juego | Apache 2.0 | Hugging Face (re-subida comunitaria) |
| GameScaling-9B-S1 (original) | 9,4B | no disponible | imagen + texto, agente de juego | Apache 2.0 | Hugging Face (THUSI-Lab), BF16 |
| Qwen3.5-9B (modelo base) | ~9B | no disponible | imagen + texto | no disponible en la información | Hugging Face (Qwen) |
| GameScaling-2B-S1 | ~2B | no disponible | imagen + texto, agente de juego | Apache 2.0 | Hugging Face (THUSI-Lab) |

No se dispone de datos de rendimiento comparado entre estas variantes.

## Limitaciones y advertencias

- Modelo entrenado y evaluado únicamente en inglés; el rendimiento en castellano no está garantizado.
- Es una re-subida no oficial: CBA-Research no ha entrenado el modelo y no está afiliado a los autores originales; la trazabilidad y el soporte dependen del repositorio original.
- La cuantización FP8 puede degradar ligeramente la calidad respecto al checkpoint BF16; no se documenta la pérdida.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado en tareas de percepción visual y control de acciones donde un error se acumula a lo largo de la partida.
- Sesgos de los datos de preentrenamiento de Qwen3.5 y de los videojuegos utilizados; no se detalla su composición.
- Longitud de contexto no documentada, lo que dificulta planificar tareas de agente de larga duración.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B, cuya licencia no se detalla en la información disponible.
- El proyecto está orientado a investigación; no hay evidencia publicada de robustez en producción ni de benchmarks.

## Enlaces

- Hugging Face (esta re-subida FP8): https://huggingface.co/CBA-Research/GameScaling-9B-S1-FP8
- Modelo original GameScaling-9B-S1: https://huggingface.co/THUSI-Lab/GameScaling-9B-S1
- Repositorio del proyecto GameScaling: https://huggingface.co/THUSI-Lab/GameScaling
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Artículo arXiv: https://arxiv.org/abs/2610.28698
- Página de proyecto: https://gamescaling.github.io
- Repositorio GitHub: https://github.com/THUSI-Lab/GameScaling
- Variantes del proyecto: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S1, https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S3, https://huggingface.co/THUSI-Lab/GameScaling-2B-S1, https://huggingface.co/THUSI-Lab/GameScaling-2B-S3
