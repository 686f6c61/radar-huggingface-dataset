# AdaptiveChunking/ali_pkm_s2

## Resumen

`ali_pkm_s2` es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face, orientado al estudio de la tokenización dinámica y el chunking adaptativo a nivel de byte. No es un modelo conversacional ni un LLM de propósito general: se trata de una ejecución experimental de una arquitectura H-Net (red jerárquica con mecanismo de chunking dinámico) implementada en el repositorio `beetle-hnet`, con `architecture=pkm` y `objective=ratio`. El modelo se entrenó desde cero con la semilla 2 durante 6000 pasos sobre secuencias de 1024 bytes, con lotes de 32, en tres idiomas: inglés, turco y finés.

Su relevancia es fundamentalmente metodológica. El modelo explora si una red puede aprender a segmentar el flujo de bytes en unidades (chunks) de forma adaptativa, en lugar de depender de un tokenizador estático tipo BPE. El checkpoint publicado incluye el estado completo del entrenador y sondas de frontera sobre FLORES+, lo que lo convierte en material reproducible para investigación en tokenización byte-level y modelos jerárquicos.

Con 39.425.792 parámetros totales (aproximadamente 39,4 millones), el modelo es de escala pequeña y no está pensado para despliegue en producción como asistente. El repositorio ocupa 11,2 GB, un tamaño desproporcionado respecto a los parámetros, explicable por el almacenamiento de múltiples ramas `step-N` con estados resumibles del entrenador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net (red jerárquica con chunking dinámico), variante `pkm` |
| Parámetros totales | 39.425.792 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés, turco, finés (idiomas de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con tensores ligados almacenados una sola vez), más `training_state/checkpoint.pt` en PyTorch |

## Arquitectura y entrenamiento

La arquitectura es una H-Net, es decir, una red jerárquica que opera sobre bytes y aprende a agruparlos en chunks mediante un mecanismo de chunking dinámico. La configuración concreta de esta ejecución es `architecture=pkm`, `objective=ratio`, `schedule=None` y `dechunk=ema`. El objetivo de entrenamiento es de tipo ratio y el deschunking emplea una media móvil exponencial (EMA). El modelo procesa entrada byte-level, sin tokenizador subword intermedio.

El entrenamiento se realizó durante 6000 pasos, con lotes de 32 y secuencias de 1024 bytes, sobre un corpus multilingüe limitado a inglés, turco y finés. No se especifica en la información disponible el número total de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO; dado el carácter experimental del modelo, es probable que no las haya. El repositorio organiza los checkpoints en ramas `step-N` siguiendo un calendario log2 (0, 1, 2, 4, 6, 8, 16, ..., 2^k), cada una con pesos, configuración, `training_config.yaml` y el estado resumible completo del entrenador. La rama `main` contiene los pesos del último paso, `log.jsonl`, `final.json` y las sondas de frontera FLORES+ en `probe/`.

## Capacidades

- Modelado de lenguaje a nivel de byte sobre flujo continuo, sin tokenizador subword.
- Aprendizaje de segmentación adaptativa (chunking) de la secuencia de bytes.
- Capacidad multilingüe limitada a inglés, turco y finés según los datos de entrenamiento.
- Evaluación de fronteras de chunk mediante sondas FLORES+ incluidas en el repositorio.
- Reanudación del entrenamiento desde cualquier checkpoint gracias al estado completo del entrenador.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en tokenización byte-level: el modelo sirve como banco de pruebas para comparar estrategias de chunking adaptativo frente a tokenizadores BPE estáticos, usando los checkpoints intermedios para analizar la evolución del aprendizaje.
- Estudio de arquitecturas jerárquicas: permite reproducir experimentos con H-Net y analizar cómo la red agrupa bytes en unidades de mayor nivel a lo largo del entrenamiento.
- Análisis de fronteras lingüísticas: las sondas FLORES+ incluidas permiten evaluar si los límites de chunk aprendidos se alinean con fronteras morfológicas o de palabra en inglés, turco y finés.
- Reproducibilidad de experimentos: el estado completo del entrenador en cada rama `step-N` facilita reanudar, modificar hiperparámetros y comparar resultados con otras semillas de la misma familia.
- Evaluación comparativa de objetivos de entrenamiento: la configuración `objective=ratio` con `dechunk=ema` puede contrastarse con otras variantes del repositorio `beetle-hnet` para medir el impacto en la calidad del chunking.
- Docencia y formación: por su tamaño reducido (39,4 M de parámetros) y su licencia permisiva, es adecuado para ilustrar pipelines de entrenamiento byte-level en cursos de procesamiento de lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 39,4 M de parámetros, los pesos en precisión completa ocupan aproximadamente 158 MB (fp32) o 79 MB (fp16); la VRAM real depende del estado del chunker y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 o superior cubre holgadamente la inferencia. Para reentrenar con lotes de 32 y secuencias de 1024 bytes, se recomienda al menos 16 GB de VRAM.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 8 GB o más.
- Opciones de despliegue: al ser un modelo de investigación en PyTorch con arquitectura personalizada, requiere cargar el código de `beetle-hnet`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (H-Net byte-level con chunking dinámico) ni se dispone de datos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción como asistente conversacional.
- Cobertura lingüística muy restringida: solo inglés, turco y finés; el comportamiento en otros idiomas es impredecible.
- Entrenamiento corto (6000 pasos) y corpus no documentado, lo que limita la calidad y generalización del modelo.
- Riesgo elevado de alucinación y salidas incoherentes fuera de las condiciones de entrenamiento.
- No se documentan sesgos específicos, pero un corpus multilingüe pequeño y no descrito puede introducir sesgos idiomáticos y culturales.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no ofrece garantías de calidad para tales fines.
- El repositorio de 11,2 GB incluye estados de entrenador y múltiples checkpoints; conviene descargar solo la rama necesaria para evitar consumo innecesario de almacenamiento.
- La arquitectura personalizada requiere el código de `beetle-hnet`; no es cargable directamente con `transformers` sin adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_pkm_s2
- Organización AdaptiveChunking en Hugging Face: https://huggingface.co/AdaptiveChunking
- Repositorio del código `beetle-hnet`: https://github.com/suchirsalhan/beetle-hnet
