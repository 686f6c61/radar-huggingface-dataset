# divinetribe/Huihui-Qwen3-8B-abliterated-v2-4bit-mlx

## Resumen

Huihui-Qwen3-8B-abliterated-v2-4bit-mlx es una conversión cuantizada a 4 bits en formato MLX del modelo Huihui-Qwen3-8B-abliterated-v2, que a su vez deriva del Qwen/Qwen3-8B de Alibaba. El trabajo de "abliteration" (eliminación de la dirección de rechazo de los pesos) lo realizó huihui-ai; divinetribe se encarga únicamente de la conversión a MLX para Apple Silicon. El resultado es un modelo de 8.190.735.360 parámetros (8,19 mil millones) que ocupa 4,6 GB en disco y está pensado para ejecutarse íntegramente en local en Macs con chip M1 a M5.

El propósito del modelo es ofrecer generación de texto conversacional sin filtros de rechazo en hardware de consumo Apple, sin necesidad de nube ni clave de API. La cuantización es afín de 4 bits con tamaño de grupo 64, realizada mediante `mlx_lm.convert`, y se distribuye en safetensors con la librería mlx-lm. La arquitectura subyacente es la de Qwen3, un transformer de 36 capas.

Su relevancia actual radica en la combinación de tres factores: el ecosistema MLX para inferencia nativa en Apple Silicon, la demanda de modelos locales sin censura para tareas de agente y la disponibilidad de un Qwen3 de 8B en un tamaño manejable (16 GB de RAM recomendados). La licencia es Apache 2.0, lo que permite uso comercial, aunque el carácter "uncensored" traslada al usuario la responsabilidad del uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3 (36 capas) |
| Parámetros totales | 8.190.735.360 (8,19 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4 bits afín, tamaño de grupo 64 (MLX) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors MLX (no GGUF, no llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3 de 8B: un transformer denso de 36 capas. Sobre esa base, huihui-ai aplicó abliteration, una técnica que ortogonaliza la dirección de rechazo en los pesos para que el modelo responda a instrucciones que un modelo instruct estándar declinaría, manteniendo la coherencia en tareas ordinarias. Posteriormente, divinetribe realizó la conversión a MLX con cuantización afín de 4 bits y grupo de 64 mediante `mlx_lm.convert`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. La model card no detalla innovaciones técnicas adicionales más allá de la abliteration y la cuantización MLX. El modelo base es Huihui-Qwen3-8B-abliterated-v2, que a su vez deriva de Qwen/Qwen3-8B.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento y respuesta a instrucciones generales, incluidas aquellas que un modelo instruct estándar rechazaría (comportamiento "uncensored").
- Ejecución completamente local en Apple Silicon, sin nube ni API.
- Integración con mlx-lm, LM Studio y cualquier herramienta que lea modelos MLX.
- Uso como agente local dentro del proyecto Claude Code Local (servidor MLX nativo con API compatible con Anthropic).
- No se documenta soporte explícito de tool calling, function calling, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar diálogos multi-turno íntegramente en el dispositivo, sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Agente de código en local: se integra en Claude Code Local como uno de los modelos disponibles para tareas de agente sobre el sistema de archivos, con el modelo ejecutándose en el propio Mac.
- Prototipado rápido de aplicaciones de texto: con 4,6 GB en disco y 16 GB de RAM recomendados, permite iterar en un MacBook sin infraestructura GPU.
- Investigación sobre alineación y abliteration: sirve como caso de estudio para comparar el comportamiento de un modelo abliterado frente a su versión instruct original en la misma tarea.
- Generación de contenido sin filtros en flujos creativos: útil para escritura que requiera respuestas a instrucciones que modelos censurados rechazan, siempre bajo responsabilidad del usuario.
- Despliegue en entornos sin conectividad: al no requerir API ni conexión, es adecuado para escenarios offline o air-gapped sobre hardware Apple.
- Evaluación comparativa de modelos locales: forma parte de la colección Abliterated MLX y del leaderboard Agent-12, lo que facilita comparaciones en tareas de agente con el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 4,6 GB en disco; 16 GB de RAM en Mac para un uso cómodo.
- Hardware objetivo: Macs con chips M1, M2, M3, M4 o M5, ejecución completamente on-device.
- GPU dedicadas: no aplica; el formato MLX está pensado para Apple Silicon, no para CUDA.
- Cabe en GPU de consumo: no en el sentido CUDA; sí en cualquier Mac moderno con 16 GB de RAM unificada.
- Opciones de despliegue: mlx-lm (CLI y API Python), LM Studio y cualquier herramienta compatible con modelos MLX. No es compatible con llama.cpp, GGUF, vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3-8B-abliterated-v2-4bit-mlx (este) | 8,19 B | No disponible | MLX safetensors 4-bit | Apache 2.0 | Solo Apple Silicon; abliterado |
| Qwen/Qwen3-8B | 8 B | No disponible | Safetensors | Apache 2.0 | Modelo base original, con filtros |
| huihui-ai/Huihui-Qwen3-8B-abliterated-v2 | 8 B | No disponible | Safetensors | Apache 2.0 | Versión abliterada sin cuantizar, origen de esta conversión |

La comparación con alternativas de otros ecosistemas (por ejemplo, modelos GGUF para llama.cpp) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo explícitamente "uncensored": puede generar contenido que un modelo instruct estándar rechazaría; el usuario es responsable del uso y del cumplimiento legal.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto: no documentada en la información disponible.
- Riesgo de alucinación: inherente a los modelos de lenguaje; la abliteration puede alterar el comportamiento en tareas sensibles.
- La cuantización a 4 bits puede degradar la calidad respecto al modelo sin cuantizar.
- Compatibilidad restringida a Apple Silicon y al ecosistema MLX; no usable en GPUs NVIDIA ni con llama.cpp.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen3-8B y las implicaciones del uso de un modelo sin filtros en producción.
- Los datos de descargas y estrellas de la model card son cifras promocionales del autor y no deben interpretarse como validación técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Huihui-Qwen3-8B-abliterated-v2-4bit-mlx
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3-8B-abliterated-v2
- Modelo original: https://huggingface.co/Qwen/Qwen3-8B
- Colección Abliterated MLX: https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- GitHub Sponsors: https://github.com/sponsors/nicedreamzapp
- Software del autor: https://nicedreamzwholesale.com/software/
