# hakunokina/Huihui-Qwen3-Coder-Next-abliterated-oQ6e

## Resumen

Huihui-Qwen3-Coder-Next-abliterated-oQ6e es una compilacion cuantizada del modelo Qwen3-Coder-Next en su variante "abliterated" (sin mecanismos de rechazo a nivel de pesos), empaquetada en formato MLX para Apple Silicon. El modelo original lo desarrolla el equipo Qwen de Alibaba, y la edicion abliterated la produce huihui-ai. Esta version concreta la publica el usuario hakunokina mediante el pipeline de cuantizacion oMLX (oQ6e), una cuantizacion afina de 6 bits calibrada con matriz de importancia (imatrix).

Se trata de una arquitectura MoE de aproximadamente 80.000 millones de parametros totales con unos 3.000 millones activos por token, 512 expertos con top-10 mas un experto compartido, 48 capas y una ventana de contexto de 262.144 tokens. Combina capas Gated DeltaNet con atencion con puerta (atencion completa cada cuarta capa), un diseno hibrido orientado a eficiencia en contextos largos. Es un modelo especializado en codigo y agentes, en modo no-thinking.

Su relevancia actual radica en que permite ejecutar un modelo de ~80B en hardware Apple Silicon de gama alta (Mac Studio con 512 GB) con una huella de unos 65 GB, manteniendo una divergencia muy baja respecto al original en BF16 (perplejidad +0,1 %, acuerdo top-1 del 93,3 %). La eliminacion del comportamiento de rechazo implica que el modelo obedecera instrucciones que el original rechazaria, lo que traslada toda la responsabilidad de uso al operador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido: Gated DeltaNet + atencion con puerta (atencion completa cada 4 capas), 48 capas, 512 expertos top-10 + experto compartido |
| Parametros totales | 79.674.391.296 (~80B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | oQ6e: afina de 6 bits, group size 64, 314 tensores sensibles a 8 bits y 36 a 6 bits; 6,56 bits/peso efectivos |
| Idiomas soportados | no disponible (la calibracion imatrix incluye codigo multilingue, ingles y turco, pero no se declara lista oficial de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx); tamano del repo 65,3 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3-Coder-Next emplea una arquitectura MoE hibrida que intercala capas de Gated DeltaNet (un mecanismo de estado lineal) con capas de atencion con puerta, activando atencion completa cada cuarta capa. Cuenta con 48 capas y 512 expertos enrutados con top-10 mas un experto compartido, lo que da ~3B parametros activos sobre ~80B totales. El modelo es de tipo no-thinking, orientado a generacion de codigo y flujos de agente.

Sobre el entrenamiento del modelo original no se dispone de datos en la informacion proporcionada (numero de tokens, composicion del dataset, uso de RLHF/DPO): no disponible. La edicion abliterated de huihui-ai elimina el comportamiento de rechazo modificando directamente los pesos. Esta compilacion concreta aplica una cuantizacion oQ6e calibrada con imatrix sobre el conjunto `oqe_code_multilingual` de oMLX, partiendo de los pesos BF16 originales (~159 GB) y reduciendolos a ~65 GB. No incluye cabeza MTP porque el modelo fuente tampoco la tiene.

## Capacidades

- Generacion de codigo en multiples lenguajes, con calibracion de cuantizacion especifica para codigo multilingue.
- Razonamiento y resolucion de tareas de programacion en modo no-thinking (sin cadena de pensamiento explicita).
- Tool calling / function calling: verificado 5/5 en las APIs Anthropic (`/v1/messages`) y OpenAI (`/v1/chat/completions`) con oMLX.
- Soporte de flujos de agente y razonamiento multi-paso, con contexto de hasta 262k tokens.
- Capacidades multilingues: no se declara lista oficial; la calibracion cubre codigo multilingue, prosa en ingles y turco.
- Sin mecanismos de rechazo (abliterated): sigue instrucciones que el modelo original rechazaria.
- No dispone de vision ni audio segun la informacion disponible.

## Casos de uso

- Asistente de programacion local en Mac: ejecutar el modelo en un Mac Studio con 512 GB mediante oMLX para autocompletado y generacion de funciones, aprovechando los ~67 tok/s de decodificacion y el contexto de 262k tokens para mantener ficheros completos en memoria.
- Agentes de codigo automatizados: integrar el endpoint compatible con OpenAI (`/v1/chat/completions`) en pipelines de CI/CD para tareas de refactorizacion o generacion de tests, con tool calling verificado.
- Analisis de repositorios grandes: usar la ventana de 262k tokens para revisar y resumir bases de codigo extensas o multiples ficheros en una sola pasada, con prefill de ~1.830 tok/s.
- Servicio interno de generacion de codigo sin conexion: desplegar en local para entornos con requisitos de privacidad, evitando enviar codigo a APIs externas.
- Prototipado de agentes con API Anthropic: emplear el endpoint `/v1/messages` de oMLX para probar integraciones compatibles con el SDK de Anthropic sin coste por token.
- Investigacion sobre alineacion y comportamiento: estudiar el efecto de la abliteration comparando respuestas con el modelo original, dado que la variante elimina los rechazos a nivel de pesos.
- Generacion de documentacion tecnica y prosa en ingles a partir de codigo, con calidad cercana al BF16 (perplejidad +0,1 %).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor reporta unicamente metricas de divergencia respecto al modelo BF16 y de velocidad:

| Metrica | Valor |
|---|---|
| KL(BF16 ‖ oQ6e), media | 0,039 nat/token |
| KL mediana / p99 | 0,0046 / 0,51 |
| Acuerdo top-1 de token | 93,3 % |
| Perplejidad BF16 → oQ6e | 6,128 → 6,136 (+0,1 %) |
| Prefill, prompt de ~27k tokens (cache fria) | ~15 s (~1.830 tok/s) |
| Prefill con prefix cache | ~0,76 s |
| Decodificacion | ~67 tok/s |
| Tool calling (Anthropic / OpenAI, 5 ejecuciones) | 5/5 / 5/5 |

Mediciones en Mac Studio M3 Ultra con 512 GB y oMLX 0.7.3, ejecuciones unicas.

## Requisitos de hardware

- VRAM/memoria unificada: ~65 GB (61 GiB) para oQ6e; la variante oQ4e del mismo autor ocupa ~46 GB.
- Hardware de referencia: Mac Studio M3 Ultra con 512 GB de memoria unificada (Apple Silicon).
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB) ni en la mayoria de Macs con memoria unificada inferior a 64 GB; requiere equipos de gama alta con al menos ~64-96 GB de memoria unificada.
- Despliegue: oMLX 0.7.3 (probado); no verificado con `mlx-lm` estandar ni LM Studio. Los helpers de tool calling del modelo fuente (`qwen3coder_tool_parser_vllm.py`, `qwen3_coder_detector_sgl.py`) se incluyen para usuarios de vLLM/SGLang, aunque oMLX no los necesita.
- Latencia y throughput: decodificacion ~67 tok/s; prefill ~1.830 tok/s en cache fria; primera peticion de ~27k tokens (incluyendo carga) ~18 s.
- Muestreo recomendado: temperature 0.7, top_p 0.8, top_k 20, repetition_penalty 1.05.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3-Coder-Next-abliterated-oQ6e (este) | ~80B totales / ~3B activos | 262k | oQ6e (MLX, 6 bits) | Apache-2.0 | HuggingFace, MLX/oMLX |
| Huihui-Qwen3-Coder-Next-abliterated-oQ4e | ~80B totales / ~3B activos | 262k | oQ4e (MLX, 4 bits, ~46 GB) | Apache-2.0 | HuggingFace, MLX/oMLX |
| huihui-ai/Huihui-Qwen3-Coder-Next-abliterated (BF16) | ~80B totales / ~3B activos | 262k | BF16 (~159 GB) | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-Coder-Next (original) | ~80B totales / ~3B activos | 262k | BF16 | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo en benchmarks entre estas variantes en la informacion proporcionada; la unica comparacion cuantitativa es la divergencia KL y el acuerdo top-1 respecto al BF16.

## Limitaciones y advertencias

- Modelo abliterated: el comportamiento de rechazo se ha eliminado a nivel de pesos; obedecera instrucciones que el original rechazaria. El operador es responsable del uso y del cumplimiento legal.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en esta compilacion.
- La arquitectura hibrida de Qwen3-Next es mas sensible a la cuantizacion que modelos densos de tamano similar; el autor reporta KL superior al de sus builds densos oQ6e, aunque la perplejidad solo sube un 0,1 %.
- No se ha ejecutado ninguna suite de benchmarks sobre esta compilacion; la calidad se reporta solo como divergencia respecto al BF16.
- Solo probado con oMLX 0.7.3; el comportamiento con `mlx-lm` estandar, LM Studio, vLLM o SGLang no esta verificado.
- Requiere hardware Apple Silicon de gama alta (~65 GB de memoria unificada); no apto para GPUs de consumo.
- Lista oficial de idiomas no declarada; el soporte multilingue fuera de codigo, ingles y turco no esta garantizado.
- Licencia Apache-2.0 heredada del modelo original; permite uso comercial, pero las implicaciones de la abliteration deben evaluarse segun el contexto de despliegue.
- Modelo no-thinking: no genera cadenas de razonamiento explicitas, lo que puede limitar tareas que se beneficien de deliberacion extendida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hakunokina/Huihui-Qwen3-Coder-Next-abliterated-oQ6e
- Variante oQ4e: https://huggingface.co/hakunokina/Huihui-Qwen3-Coder-Next-abliterated-oQ4e
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3-Coder-Next-abliterated
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Licencia: https://huggingface.co/Qwen/Qwen3-Coder-Next/blob/main/LICENSE
- oMLX: https://omlx.ai
