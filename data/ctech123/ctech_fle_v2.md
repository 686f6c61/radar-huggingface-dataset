# ctech123/CTech_Fle_v2

## Resumen

CTech_Fle_v2 es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario ctech123 en Hugging Face. El modelo base empleado es la versión cuantizada en 4 bits (bnb-4bit) de Unsloth, sobre la que se ha aplicado un entrenamiento adicional usando la librería Unsloth y TRL. Se trata, por tanto, de un derivado de la familia Qwen2.5, una arquitectura transformer decoder-only de 1.500 millones de parámetros desarrollada originalmente por Alibaba Cloud.

La relevancia de esta ficha es limitada: el modelo no incluye información sobre el conjunto de datos de entrenamiento, el proceso de ajuste ni los objetivos perseguidos. La model card es la plantilla automática que genera Unsloth, sin descripción funcional, sin benchmarks y sin documentación de uso. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere un proyecto personal o experimental sin validación por parte de la comunidad.

A efectos prácticos, debe considerarse un experimento de ajuste fino sobre Qwen2.5-1.5B-Instruct. Cualquier evaluación de sus capacidades reales requeriría pruebas propias, ya que no hay evidencia publicada de su comportamiento. La licencia Apache 2.0 del modelo base se mantiene, lo que permite uso comercial, pero la ausencia de documentación sobre los datos de ajuste introduce incertidumbre sobre sesgos y calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.500 millones (heredados del modelo base Qwen2.5-1.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma que el ajuste lo preserve) |
| Tipos de cuantizacion | El modelo base se distribuye en bnb-4bit; el repositorio contiene safetensors (tamaño 0.1 GB) |
| Idiomas soportados | en (inglés, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención por grupos (grouped-query attention), normalización RMSNorm y activación SwiGLU, tal como define la familia Qwen2.5. El modelo base fue entrenado por Alibaba con datos multilingües y posteriormente alineado mediante instrucciones y preferencias. Sobre esa base, ctech123 aplicó un ajuste fino supervisado (SFT) usando Unsloth y TRL, partiendo de la versión cuantizada en 4 bits de Unsloth.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO adicional ni qué hiperparámetros se emplearon. La model card únicamente indica que el entrenamiento fue "2x faster with Unsloth", lo que hace referencia a la optimización de la librería, no a una innovación arquitectónica del modelo. No hay evidencia de decodificación especulativa, atención lineal ni otras técnicas destacables en este ajuste.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones, condicionado por el ajuste fino no documentado.
- Generación de código y matemáticas a nivel de un modelo de 1.5B, sin datos específicos de rendimiento.
- Soporte de tool calling y function calling: probable por herencia del modelo base, pero no confirmado en la model card.
- Capacidades multilingües limitadas: la model card declara únicamente inglés, aunque el modelo base Qwen2.5 soporta más idiomas.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: el tamaño de 1.5B permite ejecución en hardware modesto, adecuado para validar flujos de diálogo antes de escalar a modelos mayores.
- Experimentación académica con ajuste fino: sirve como ejemplo de pipeline Unsloth + TRL sobre Qwen2.5, útil para reproducir el proceso de entrenamiento.
- Generación de texto en entornos con recursos limitados: al caber en GPUs de consumo, puede desplegarse en estaciones de trabajo sin infraestructura dedicada.
- Tareas de clasificación o extracción de información simples: con prompting adecuado, un modelo de 1.5B puede resolver tareas acotadas de NLP en inglés.
- Base para nuevos ajustes finos: al estar en safetensors y licencia Apache 2.0, puede reutilizarse como punto de partida para otros experimentos.
- Evaluación comparativa de ajustes finos: útil para medir el impacto de un SFT no documentado frente al modelo base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3 GB para los pesos (1.5B parámetros) más overhead de activaciones y KV cache.
- VRAM estimada en 4 bits: alrededor de 1-1.5 GB para los pesos, más overhead.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 para inferencia cómoda; A100/H100 no son necesarias para este tamaño.
- Cabe en GPUs de consumo: sí, en cualquier GPU con 4 GB o más de VRAM en cuantización 4 bits.
- Opciones de despliegue: transformers, vLLM, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CTech_Fle_v2 | 1.5B | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado |
| Llama 3.2-1B-Instruct | 1.2B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| SmolLM2-1.7B-Instruct | 1.7B | 8.192 tokens | Apache 2.0 | Hugging Face |

El modelo comparable más directo es su propio base, Qwen2.5-1.5B-Instruct, que cuenta con documentación completa, benchmarks publicados y soporte de la comunidad. Frente a él, CTech_Fle_v2 no aporta información verificable sobre mejoras. Llama 3.2-1B-Instruct y SmolLM2-1.7B-Instruct son alternativas del mismo rango con documentación y evaluación pública.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de ajuste: no se puede evaluar qué sesgos se han introducido ni si el modelo ha sufrido degradación respecto al base.
- Riesgo de alucinación inherente a modelos de 1.5B, sin mitigaciones documentadas.
- Idiomas: la model card declara solo inglés, lo que limita su uso en castellano u otros idiomas pese a que el base Qwen2.5 es multilingüe.
- Contexto: no se confirma que se preserve la ventana de 32.768 tokens del modelo base; el ajuste podría haberla reducido.
- Licencia Apache 2.0 permite uso comercial, pero la falta de trazabilidad de los datos de entrenamiento traslada el riesgo legal al usuario.
- Sin benchmarks ni evaluaciones: no hay evidencia de que supere al modelo base en ninguna tarea.
- Repositorio con 0 descargas y 1 like: sin validación comunitaria ni mantenimiento conocido.
- Fecha de creación futura (2026-11-11) en los metadatos, lo que sugiere posibles inconsistencias en el registro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ctech123/CTech_Fle_v2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit
- Qwen2.5-1.5B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- TRL (librería de fine-tuning): https://github.com/huggingface/trl
