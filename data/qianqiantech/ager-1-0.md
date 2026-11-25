# QianqianTech/ager-1.0

## Resumen

ager 1.0 (nombre comercial Ager, en chino 安耕, con el lema «Guardian of Agriculture») es un modelo de lenguaje de dominio específico orientado a escenarios de producción agrícola: cultivo de plantas, protección fitosanitaria, gestión de agua y fertilizantes y diagnóstico agronómico. Lo desarrolla QianqianTech y se distribuye como un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-9B, del que hereda la arquitectura y el tokenizador.

El modelo cuenta con 9.653.104.368 parámetros según los pesos en safetensors y se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales atribuibles a la licencia. El repositorio ocupa 19,3 GB y contiene pesos en formato safetensors compatibles con vLLM y Transformers; el autor publica además una versión MLX de 16 bits en el repositorio `ager-1.0-mlx` de la misma cuenta.

Su relevancia radica en la especialización vertical: en lugar de competir como modelo generalista, se posiciona como asistente agronómico con soporte bilingüe chino-inglés y una interfaz de servicio compatible con la API de OpenAI (`POST /v1/chat/completions`), con modo de razonamiento (thinking) desactivable por defecto y activable mediante `chat_template_kwargs`. El modelo es muy reciente (creado el 23 de noviembre de 2026) y cuenta con un volumen de descargas todavía muy bajo (16 descargas, 0 likes en el momento de la consulta), por lo que su validación independiente es aún escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B; detalles internos no disponibles) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor menciona una variante MLX de 16 bits) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con vLLM y Transformers); variante MLX 16 bits en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base Qwen/Qwen3.5-9B, un transformer de aproximadamente 9,65 mil millones de parámetros. La model card no detalla la arquitectura interna del base (tipo de atención, uso de atención lineal, decodificación especulativa u otras innovaciones), ni el volumen o la composición del corpus de ajuste, ni si se emplearon técnicas de alineación como RLHF o DPO. Tampoco se especifica la longitud de contexto efectiva tras el ajuste.

La única información técnica operativa que aporta el autor es el modo de inferencia: el modelo se sirve mediante una API compatible con OpenAI, con el identificador de modelo `ager 1.0`, mensajes con `role` (`system`, `user`, `assistant`) y `content` como cadena, y el razonamiento desactivado por defecto. Para habilitar el modo de pensamiento debe enviarse `chat_template_kwargs` con `enable_thinking: true`, lo que sugiere que el ajuste conserva el mecanismo de thinking del base Qwen3.5. No hay información publicada sobre datos de entrenamiento, número de tokens vistos ni proceso de curación del corpus agrícola.

## Capacidades

- Generación de texto en chino e inglés orientada a dominio agronómico: cultivo, protección de plantas, gestión de agua y fertilizantes y diagnóstico de situaciones de campo.
- Razonamiento explícito opcional mediante modo thinking (`enable_thinking: true`), desactivado por defecto para priorizar latencia.
- Conversación multi-turno con roles de sistema, usuario y asistente a través de la API compatible con OpenAI.
- Servido en producción con vLLM y Transformers; pesos también disponibles en formato MLX 16 bits para Apple Silicon.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Asistencia agronómica conversacional: un agricultor o técnico describe síntomas de un cultivo y el modelo mantiene un diálogo multi-turno para acotar el diagnóstico, aprovechando el ajuste específico en fitopatología.
- Recomendación de manejo de agua y fertilizantes: el modelo puede generar pautas de riego y fertilización a partir de descripciones textuales del cultivo, la etapa fenológica y las condiciones indicadas por el usuario.
- Soporte a técnicos de campo vía API: integración del endpoint `/v1/chat/completions` en una aplicación móvil o web interna para consultas agronómicas en chino o inglés, con el modo thinking activado solo en consultas complejas.
- Generación de material formativo agrícola: redacción de fichas de cultivo, guías de manejo integrado de plagas y resúmenes divulgativos en chino e inglés a partir de notas técnicas.
- Triaje de consultas en un servicio de extensión agraria: clasificación y primera respuesta a preguntas de agricultores antes de escalar a un especialista humano, reduciendo carga operativa.
- Despliegue en estaciones de trabajo con Apple Silicon: la variante MLX 16 bits permite ejecutar el modelo en local para prototipos y demos sin depender de GPU NVIDIA.
- Análisis y resumen de documentación agronómica: condensación de informes, protocolos de tratamiento y normativa en respuestas breves para consulta rápida en campo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 19-20 GB solo para pesos (9,65 mil millones de parámetros), más overhead de KV cache y activaciones; el repositorio ocupa 19,3 GB.
- Cuantización a 8 bits: aproximadamente 10-11 GB de pesos; a 4 bits: aproximadamente 5-6 GB, aunque el autor no publica versiones GGUF ni AWQ/GPTQ oficiales.
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S o RTX 6000 Ada; en consumer, una RTX 4090 (24 GB) queda muy justa para BF16 y requiere cuantización para dejar margen a la KV cache.
- Cabe en GPU de consumo con cuantización de 8 o 4 bits (RTX 3090/4090, RTX 4080 con 4 bits), siempre que se generen pesos cuantizados, ya que el repositorio solo ofrece safetensors.
- Despliegue: vLLM y Transformers son los soportes indicados por el autor; llama.cpp y Ollama requerirían conversión a GGUF no publicada. La variante MLX 16 bits está pensada para Apple Silicon.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ager 1.0 | 9,65 B | no disponible | Agrícola (zh/en) | Apache 2.0 | Hugging Face, safetensors y MLX |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | Generalista multilingüe | según el base (no disponible en la información) | Hugging Face |
| Modelos generalistas de ~7-9 B | ~7-9 B | variable | Generalista | variable | Hugging Face |

La comparación cuantitativa con alternativas no es posible con la información disponible: no hay benchmarks publicados de ager 1.0 ni datos de contexto que permitan contrastarlo con el base u otros ajustes verticales. La ventaja diferencial declarada es la especialización agrícola y la licencia Apache 2.0; la desventaja es la ausencia de validación pública.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al estar entrenado sobre un base multilingüe con ajuste en chino e inglés, es previsible un sesgo hacia fuentes y prácticas agronómicas de China, no verificable con la información disponible.
- Riesgo de alucinación: relevante en un dominio de alto impacto como la sanidad vegetal o el uso de fitosanitarios; las recomendaciones del modelo no deben sustituir el criterio de un ingeniero agrónomo ni la normativa local.
- Cobertura idiomática limitada a chino e inglés; no se declara soporte de español ni de otras lenguas.
- Longitud de contexto no especificada, lo que impide planificar casos de uso con documentos largos.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en producción.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-9B puede tener condiciones propias que conviene revisar antes de desplegar.
- Madurez muy baja: 16 descargas y 0 likes en el momento de la consulta, sin benchmarks ni validación independiente; no se recomienda para producción crítica sin evaluación propia.
- El repositorio solo publica safetensors; no hay GGUF, AWQ ni GPTQ oficiales, lo que limita el despliegue en entornos de cuantización estándar sin trabajo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/QianqianTech/ager-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante MLX 16 bits: https://huggingface.co/QianqianTech/ager-1.0-mlx (referenciada en la model card; no verificada en la información disponible)
