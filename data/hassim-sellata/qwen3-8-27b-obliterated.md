# Hassim-Sellata/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una versión "abliterada" (sin mecanismos de rechazo) del modelo base Qwen/Qwen3.8-27B, publicada por el usuario Hassim-Sellata en Hugging Face. El proceso de abliteration elimina las direcciones de rechazo del espacio de pesos del modelo mediante técnicas de proyección (SVD y LEACE), de modo que el modelo responde a consultas restringidas sin generar negativas ni "sermones de seguridad". Según su autor, esta versión V3 conserva casi toda la capacidad del modelo original, con una pérdida de 2,1 puntos porcentuales en MMLU respecto al modelo stock.

El modelo se distribuye en formatos safetensors, GGUF y MLX, bajo licencia Apache 2.0, lo que facilita su uso en investigación de seguridad (red-teaming), auditoría de alineamiento y entornos locales. Su relevancia actual radica en la investigación de ai-safety: permite estudiar cómo la eliminación de comportamientos de rechazo afecta a las capacidades generales del modelo, y sirve como herramienta de prueba para evaluar robustez de filtros de seguridad en despliegues reales.

El repositorio declara un total de 27.781.427.952 parámetros (dato real de los safetensors) y hereda la arquitectura qwen3 del modelo base. No se ha publicado información sobre la longitud de contexto del modelo base en la ficha, aunque el propio README incluye recomendaciones para uso agéntico con gestión de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo qwen3) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles explicitamente (formatos safetensors, GGUF y MLX en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, una arquitectura transformer de tipo qwen3 con soporte de thinking mode (cadena de razonamiento activable mediante `enable_thinking`). No se ha publicado información sobre el numero de tokens de preentrenamiento ni la composicion del dataset del modelo base en la informacion disponible.

La innovacion tecnica principal de esta version no esta en la arquitectura sino en el proceso de abliteration, documentado en tres iteraciones:

- **V1**: una unica pasada agresiva de SVD con 5 direcciones de rechazo. Elimino los rechazos duros pero costo -6,0 pp en MMLU.
- **V2**: tecnica novedosa denominada *complementary abliteration blending*: se ejecutan dos cirugias distintas (SVD, que captura el rechazo de forma agresiva dañando capacidades, y LEACE, que minimiza informacion mutua preservando capacidades) y se mezclan los pesos al 60/40. Resultado: -0,3 pp en MMLU, aunque persistian desviaciones blandas.
- **V3 (esta version)**: refinamiento iterativo sobre V2 (nunca desde el modelo stock), mas una pasada de cirugia dirigida con un corpus focalizado por categorias de desviacion, y mezcla final de resultados. Resultado: -2,1 pp en MMLU con eliminacion tanto de rechazos duros como de desviaciones blandas.

No hubo RLHF ni DPO adicionales: la modificacion es exclusivamente quirurgica sobre los pesos.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation).
- Razonamiento con thinking mode: compatible en V3 tanto con thinking activado como desactivado (en V1 y V2 se perdia o rechazaba).
- Generacion de codigo: 20/20 tareas de codigo y ciberseguridad con implementaciones funcionales segun las pruebas del autor.
- Respuesta sin rechazos a consultas restringidas: sustancia real en lugar de negativas o disclaimers.
- Uso agéntico: el README incluye configuraciones especificas para harnesses de agentes (bucles de tool calls, gestion de contexto cada ~10 turnos).
- Plantilla de chat incluida en los GGUF con prefill de bloque de thinking vacio (uso con `--jinja` en llama.cpp).

No se ha documentado soporte de vision, audio ni function calling nativo en la informacion disponible.

## Casos de uso

- **Investigacion de seguridad y red-teaming**: permite auditar como se comporta un modelo sin capas de rechazo, util para probar filtros externos y evaluar la robustez de despliegues productivos.
- **Estudio de abliteration y alineamiento**: las tres versiones documentadas (V1/V2/V3) con metricas de degradacion son material de referencia para investigar tecnicas de edicion de pesos (SVD, LEACE, blending).
- **Generacion de codigo local**: con temperature 0 y repetition_penalty 1.15 genera implementaciones funcionales; adecuado para asistentes de codigo offline en entornos sin censura.
- **Agentes de codigo y frameworks de pentesting**: el README ofrece ajustes especificos (temperature 0,1-0,3, repeticion 1,15, respuestas cortas por turno) para harnesses agénticos.
- **Evaluacion comparativa de capacidades**: al conservar thinking mode y perder solo 2,1 pp en MMLU, sirve de baseline para medir el coste real de tecnicas de desalineacion.
- **Despliegue en Apple Silicon**: la disponibilidad de pesos MLX lo hace apto para inferencia local en Mac mediante la libreria mlx.

## Benchmarks y rendimiento

Datos publicados por el autor (lm-eval-harness, MMLU 0-shot, n=100 por asignatura, 5.700 preguntas):

| Modelo | MMLU | vs stock |
|---|---|---|
| Qwen3.8-27B stock | 84,5 % | — |
| V1 | 81,4 % | -6,0 pp |
| V2 | 84,3 % | -0,3 pp |
| **V3 (esta version)** | **82,3 %** | **-2,1 pp** |

Pruebas adicionales reportadas por el autor (no auditadas independientemente): 20/20 tareas de codigo/ciberseguridad con codigo funcional; 7/8 en tareas avanzadas del mundo real; thinking mode operativo. No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con ~27,8 B de parametros, en bfloat16 se requieren del orden de 56 GB (2 bytes/parametro), mas overhead de KV cache; con cuantizacion GGUF de 4 bits, en torno a 16-18 GB. Son estimaciones a partir del numero de parametros; el repo no publica requisitos oficiales.
- **GPU recomendadas**: A100 40/80 GB, H100, RTX A6000 para precision completa; RTX 3090/4090 (24 GB) para cuantizaciones de 4 bits.
- **Consumer GPU**: viable en una RTX 4090 de 24 GB con GGUF Q4; no viable en fp16 sin multiple GPUs.
- **Apple Silicon**: formato MLX incluido, orientado a Macs con memoria unificada suficiente (idealmente 32 GB o mas).
- **Opciones de despliegue**: transformers (ejemplo oficial con `device_map="auto"` y bfloat16), llama.cpp con `--jinja` y plantilla incluida, Ollama, LM Studio y MLX.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | MMLU | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-OBLITERATED V3 | 27,8 B | 82,3 % | Apache 2.0 | safetensors, GGUF, MLX | Sin rechazos ni desviaciones; thinking mode |
| Qwen/Qwen3.8-27B (stock) | no disponible | 84,5 % | no disponible | no disponible | Modelo base con mecanismos de rechazo |
| V2 del mismo autor | no disponible | 84,3 % | no disponible | no disponible | Sin rechazos duros, pero con desviaciones blandas |
| V1 del mismo autor | no disponible | 81,4 % | no disponible | no disponible | Rechazos eliminados, mayor perdida de capacidad |

No se han identificado otros modelos abliterados de tamano comparable en la informacion disponible.

## Limitaciones y advertencias

- **Riesgo de uso indebido elevado**: al carecer de rechazos, el modelo respondera a solicitudes daninas sin filtros. Su uso debe limitarse a investigacion de seguridad autorizada; el despliegue publico sin salvaguardas externas es irresponsable.
- **Degradacion de capacidad**: -2,1 pp en MMLU respecto al modelo stock; la V1 demuestra que cirugias agresivas pueden costar hasta -6 pp.
- **Sensibilidad a la configuracion**: temperature > 0,5 degrada la calidad significativamente; sin repetition_penalty 1,15 el modelo entra en bucles; system prompts pueden reintroducir rechazos.
- **Bucles en modo agéntico**: la decodificacion greedy puede atascarse en llamadas repetidas a herramientas; se recomienda temperature 0,1-0,3 y resumir el contexto cada ~10 turnos.
- **Datos no verificados**: las metricas de liberacion (20/20, 7/8) son autoevaluaciones del autor con auditoria manual, sin verificacion independiente.
- **Licencia**: Apache 2.0 permite uso comercial, pero la responsabilidad legal del contenido generado recae en el usuario; el modelo base Qwen puede tener condiciones adicionales no documentadas aqui.
- **Informacion incompleta**: idiomas soportados, longitud de contexto y detalles de cuantizacion no estan documentados en la ficha.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Hassim-Sellata/Qwen3.8-27B-OBLITERATED
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B

No se han encontrado enlaces adicionales (papers, blogs o demos) en la informacion disponible.
