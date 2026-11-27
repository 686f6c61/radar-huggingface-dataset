# divinetribe/Huihui-gemma-4-31B-it-abliterated-4bit-mlx

## Resumen

Huihui-gemma-4-31B-it-abliterated-4bit-mlx es una conversión a 4 bits en formato MLX del modelo huihui-ai/Huihui-gemma-4-31B-it-abliterated, que a su vez deriva de google/gemma-4-31b-it. Lo publica el usuario divinetribe y su objetivo es permitir la ejecución local del modelo en Apple Silicon (Macs con chip M1 a M5) sin necesidad de GPU dedicada ni de conexión a la nube. El repositorio ocupa 17,3 GB repartidos en cuatro shards y contiene 30.697.345.280 parámetros totales.

La particularidad del modelo es doble. Por un lado, la versión base de huihui-ai ha sido "abliterada": se ha eliminado de los pesos la dirección de rechazo mediante ortogonalización, de modo que el modelo responde a instrucciones que un modelo instruct estándar declinaría, manteniendo coherencia en tareas ordinarias. Por otro, esta conversión aplica cuantización afín de 4 bits con tamaño de grupo 64 mediante mlx_lm.convert, lo que reduce el peso en disco y en memoria hasta hacerlo viable en equipos de consumo.

Es relevante ahora porque el ecosistema MLX permite ejecutar modelos de 31B en un MacBook con 32 GB de RAM unificada, algo impensable con pesos en fp16 (que rondarían los 60 GB). El modelo está pensado para flujos de trabajo de agente local, como el proyecto Claude Code Local del mismo autor, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer decoder-only, según la arquitectura del modelo base) |
| Parametros totales | 30.697.345.280 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit afín, group size 64 (MLX) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (4 shards, 17,3 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Gemma 4, el modelo base de Google sobre el que se construye toda la cadena. La información disponible no detalla la composición interna (número de capas, dimensiones de atención, tipo de atención) ni los datos de entrenamiento originales, el número de tokens utilizados o si hubo fases de RLHF o DPO. Tampoco se especifica la innovación técnica concreta de esta generación de Gemma más allá de lo que implica su tamaño de 31B parámetros.

Sobre el proceso de adaptación sí hay datos: huihui-ai aplicó abliteración, una técnica que ortogonaliza la dirección de rechazo en los pesos del modelo instruct para eliminar las respuestas de negativa, y divinetribe realizó la conversión a MLX con cuantización afín de 4 bits y grupo de 64 mediante la herramienta mlx_lm.convert. No se documentan datos de entrenamiento adicionales, fine-tuning posterior ni procesos de alineación en esta conversión.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones en inglés.
- Respuesta a peticiones que un modelo instruct estándar rechazaría, gracias a la abliteración de la dirección de rechazo.
- Mantenimiento de coherencia en tareas ordinarias pese a la eliminación del comportamiento de rechazo, según declara el autor.
- Ejecución completamente local y on-device en Apple Silicon, sin API ni conexión a la nube.
- Integración con mlx-lm, LM Studio y cualquier herramienta que lea modelos MLX.
- Uso como modelo de agente local dentro del proyecto Claude Code Local, que expone una API compatible con Anthropic sobre MLX.
- Capacidades multilingües: no disponible más allá del inglés declarado.
- Soporte de tool calling, function calling, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en MacBook: el modelo se ejecuta íntegramente en un Mac con 32 GB de RAM mediante mlx-lm, sin enviar datos a servicios externos, lo que resulta adecuado para conversaciones con información sensible.
- Agente de código en local: integrado en Claude Code Local a través de un servidor MLX nativo compatible con la API de Anthropic, permite ejecutar tareas de agente sobre el sistema de archivos sin salir del equipo.
- Experimentación con modelos sin censura: investigadores que estudian el comportamiento de modelos abliterados pueden comparar respuestas frente al Gemma 4 instruct original en las mismas condiciones de hardware.
- Prototipado de aplicaciones de texto en Apple Silicon: desarrolladores que quieren validar prompts y flujos conversacionales en local antes de desplegar en infraestructura mayor, usando la API de mlx_lm en Python.
- Evaluación de cuantización: sirve como referencia práctica para medir la pérdida de calidad de una cuantización 4-bit afín con group size 64 frente a los pesos originales del modelo base.
- Inferencia offline en entornos sin conectividad: escenarios de campo, laboratorio o auditoría donde no se permite el acceso a la nube y se necesita un modelo de 31B en hardware de consumo.
- Docencia y demostraciones: permite mostrar en un portátil el funcionamiento interno de un LLM de gran tamaño y el efecto de técnicas como la abliteración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- RAM: 32 GB recomendados en Mac; 24 GB suficientes para contextos cortos, según el autor.
- Almacenamiento: 17,3 GB en disco (4 shards).
- GPU: no requiere GPU dedicada; funciona con la GPU integrada de los chips Apple M1, M2, M3, M4 y M5 mediante Metal y MLX.
- Cabe en GPU de consumo: sí, en el sentido de que se ejecuta en memoria unificada de Macs de consumo con 32 GB; no está pensado para GPUs NVIDIA.
- Opciones de despliegue: mlx-lm (CLI y API Python), LM Studio y cualquier runtime que lea modelos MLX. No compatible con llama.cpp, GGUF, vLLM ni TGI según la información del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| divinetribe/Huihui-gemma-4-31B-it-abliterated-4bit-mlx | 30,7B | no disponible | MLX safetensors 4-bit | Apache 2.0 | Objeto de esta ficha; solo Apple Silicon |
| huihui-ai/Huihui-gemma-4-31B-it-abliterated | 30,7B (modelo base) | no disponible | safetensors (precisión original) | Apache 2.0 | Modelo base sin cuantizar; requiere más memoria |
| google/gemma-4-31b-it | 31B (aproximado) | no disponible | safetensors | Términos de Gemma (no confirmado en la información) | Modelo instruct original, con rechazos estándar |
| Otros modelos abliterated MLX de divinetribe (Llama 3.3 70B, Qwen3, Qwen3-VL, Hermes 4, Muse Glimmer) | variable | no disponible | MLX 4-bit | variable | Alternativas de la misma colección para Apple Silicon |

## Limitaciones y advertencias

- Modelo sin censura: la abliteración elimina la dirección de rechazo, por lo que puede producir contenido que un modelo instruct estándar bloquearía. El usuario es responsable del uso y del cumplimiento legal.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad; al ser un modelo abliterado y cuantizado a 4 bits, la fiabilidad factual no está garantizada.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado.
- Contexto: la longitud de contexto no está especificada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Cuantización: la conversión a 4 bits con group size 64 puede degradar la calidad respecto a los pesos originales; no se aportan métricas de esa pérdida.
- Plataforma: exclusivo para Apple Silicon con MLX; no funciona en GPUs NVIDIA, llama.cpp, GGUF, vLLM ni TGI.
- Memoria: 24 GB de RAM solo permiten contextos cortos; para uso sostenido se recomiendan 32 GB.
- Licencia: el repositorio declara Apache 2.0, pero el modelo base es Gemma 4 de Google y la información disponible no aclara si se aplican los términos de uso de Gemma además de la licencia declarada; conviene verificar antes de un uso comercial.
- Procedencia: la abliteración es de huihui-ai y la conversión MLX de divinetribe; los datos de benchmarks y evaluación de calidad no están publicados en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/divinetribe/Huihui-gemma-4-31B-it-abliterated-4bit-mlx
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-gemma-4-31B-it-abliterated
- Colección Abliterated MLX for Apple Silicon: https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Repositorio Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil GitHub del autor: https://github.com/nicedreamzapp
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Patrocinio: https://github.com/sponsors/nicedreamzapp
