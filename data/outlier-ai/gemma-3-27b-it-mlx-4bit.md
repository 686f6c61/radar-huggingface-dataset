# Outlier-Ai/gemma-3-27b-it-MLX-4bit

## Resumen

`Outlier-Ai/gemma-3-27b-it-MLX-4bit` es una conversion a 4 bits en formato MLX del modelo `google/gemma-3-27b-it`, publicada por el equipo de Outlier. El modelo original es un transformer decoder-only de Google con 27.009.346.304 parametros (27B), afinado para instrucciones y conversacion, y esta disenado para generacion de texto, razonamiento, codigo y uso de herramientas. Esta version concreta no es un modelo nuevo: es una cuantizacion pensada para ejecucion local sobre Apple Silicon mediante el framework MLX y Metal.

La relevancia de esta ficha esta en el empaquetado: reduce el peso del modelo a un repositorio de 15,2 GB con pesos safetensors en 4 bits, lo que permite ejecutar un modelo de 27B en Macs con memoria unificada suficiente, sin nube ni claves de API. La model card esta orientada a la aplicacion macOS de Outlier, que actua como frontend de inferencia local, aunque el modelo tambien puede cargarse directamente con `mlx-lm`.

El modelo hereda del original la licencia Gemma y una cobertura declarada de 14 idiomas (entre ellos el castellano). No se documentan en la informacion disponible datos de entrenamiento, benchmarks propios ni modificaciones de pesos mas alla de la cuantizacion; cualquier afirmacion sobre calidad debe remitirse al modelo base de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura original de Gemma 3, no detallada en la informacion disponible) |
| Parametros totales | 27.009.346.304 (27B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | 4-bit (unica variante publicada en este repositorio) |
| Idiomas soportados | en, de, fr, es, it, pt, nl, pl, ro, cs, hu, sv, da, fi |
| Licencia | gemma |
| Formato de pesos | safetensors (MLX), repositorio de 15,2 GB |
| Libreria de inferencia | mlx / mlx-lm |
| Modelo base | google/gemma-3-27b-it |
| Relacion con el base | quantized |
| Hardware objetivo | Apple Silicon (M1, M2, M3, M4), Metal |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

Esta publicacion es una conversion de cuantizacion, no un reentrenamiento. La arquitectura subyacente es la del modelo `google/gemma-3-27b-it`, un transformer decoder-only de 27B parametros afinado para instrucciones; la informacion proporcionada no detalla el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora componentes adicionales. Tampoco se especifican los datos de entrenamiento del modelo original (numero de tokens, composicion del corpus, fases de RLHF o DPO), por lo que esos datos deben consultarse en la model card de Google.

La unica transformacion documentada es la cuantizacion a 4 bits en formato MLX, que reduce el peso de los pesos para permitir inferencia en memoria unificada de Apple Silicon. La model card indica explicitamente que las cifras mencionadas provienen de experimentos internos y no de pruebas de release, y que este modelo no se distribuye dentro de la aplicacion Outlier. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno, con formato de chat instruct.
- Razonamiento y conocimiento general, heredados del modelo base Gemma 3 27B instruct.
- Soporte declarado de function calling y tool use (tags `function-calling` y `tool-use`).
- Capacidades multilingues en 14 idiomas, incluido el castellano.
- Ejecucion completamente local y offline sobre Apple Silicon, sin llamadas a servicios externos.
- Integracion con `mlx-lm` para generacion por linea de comandos y uso programatico.
- Compatibilidad con la aplicacion macOS Outlier como frontend de inferencia.
- Capacidades multimodales, modo thinking o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional privado en escritorio: ejecutar el modelo con `mlx-lm` o la app Outlier para mantener conversaciones multi-turno sin enviar datos a la nube, adecuado para entornos con requisitos de confidencialidad.
- Prototipado de agentes con tool calling en local: usar el soporte declarado de function calling para conectar el modelo a scripts locales, APIs internas o automatizaciones sin depender de un proveedor externo.
- Analisis y resumen de documentos sensibles: procesar contratos, informes o notas internas en un Mac Studio o MacBook Pro con memoria unificada suficiente, manteniendo el contenido fuera de servicios de terceros.
- Desarrollo y revision de codigo en local: emplear el modelo como asistente de programacion dentro del editor o en scripts, aprovechando la ventana de contexto del modelo base (a confirmar en su model card).
- Traduccion y redaccion multilingue: cubrir combinaciones entre los 14 idiomas declarados, util para equipos que trabajan con documentacion en varias lenguas europeas.
- Educacion y experimentacion con modelos grandes en hardware de consumo: servir como banco de pruebas para estudiar el impacto de la cuantizacion 4-bit frente al modelo original en tareas de razonamiento.
- Despliegue en estaciones de trabajo sin GPU dedicada: aprovechar Metal y la memoria unificada de los chips M-series para inferencia de un modelo de 27B alli donde no hay acceso a CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo base o con otras cuantizaciones.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 15,2 GB en safetensors 4-bit; se recomienda al menos 18-20 GB de memoria unificada libre para cargar pesos y trabajar con contexto, y 24 GB o mas para margenes comodos.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4) con Metal; segun los tags, MacBook Air, MacBook Pro, Mac mini y Mac Studio.
- Viabilidad en consumer: si, en configuraciones de Mac con 24 GB o 32 GB de memoria unificada en adelante; los modelos con 16 GB son marginales para un 27B en 4 bits.
- Despliegue: `mlx-lm` (CLI y API Python) y la aplicacion macOS Outlier; no esta pensado para vLLM, TGI ni llama.cpp, que no consumen pesos MLX de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Outlier-Ai/gemma-3-27b-it-MLX-4bit | 27B | no disponible | MLX safetensors 4-bit | gemma | Conversion comunitaria para Apple Silicon |
| google/gemma-3-27b-it | 27B | no disponible | safetensors (original) | gemma | Modelo base oficial de Google, requiere mas memoria |
| Outlier-Ai/Outlier-Core-27B-MLX-4bit | 27B | no disponible | MLX safetensors 4-bit | no disponible | Conversion del mismo autor distribuida en la app Outlier |
| Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit | 30B (MoE, activos no disponibles) | no disponible | MLX safetensors 4-bit | no disponible | Alternativa orientada a codigo y tool calling en MLX |

## Limitaciones y advertencias

- La cuantizacion 4-bit puede degradar la calidad respecto al modelo original de 27B, especialmente en tareas de razonamiento largo o generacion de codigo; no se aportan mediciones de esa perdida.
- Solo funciona en el ecosistema MLX/Apple Silicon; no es portable a CUDA, ROCm ni CPU generica sin reconversion.
- La licencia es la Gemma License, con terminos y restricciones de uso que deben revisarse antes de un despliegue comercial; la model card remite a la licencia del modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en esta conversion.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; se heredan los del modelo base.
- La model card mezcla contenido promocional de la aplicacion Outlier con la ficha tecnica; las cifras citadas como "experimentos internos" no constituyen validacion independiente.
- No se especifican la longitud de contexto efectiva ni el comportamiento del modelo con prompts muy largos tras la cuantizacion.
- El modelo no se distribuye dentro de la aplicacion Outlier, segun indica el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Outlier-Ai/gemma-3-27b-it-MLX-4bit
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Aplicacion Outlier: https://outlier.host/
- Otras conversiones del autor:
  - https://huggingface.co/Outlier-Ai/gemma-3-4b-it-MLX-4bit
  - https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Libreria de inferencia: https://github.com/ml-explore/mlx-lm
