# DICPlay/RusMind-Zernyshko-1.6

## Resumen

RusMind Zernyshko 1.6 (Зёрнышко, "semillita") es un modelo de lenguaje de 83 millones de parámetros desarrollado por DICPlay, entrenado desde cero sobre un corpus propio en ruso y con un tokenizador BPE propio de 16.000 tokens. Forma parte de la familia RusMind, presentada por el autor como "IA nacional" rusa, y su propuesta es demostrar que un modelo muy pequeno y entrenado especificamente para un idioma puede competir en tareas de conocimiento cultural ruso con modelos decenas de veces mayores.

La arquitectura es un transformer propio (requiere `trust_remote_code=True`), con 10 capas y dimension de modelo 768, una longitud de contexto de 1024 tokens y un formato de dialogo ChatML. El repositorio ocupa unos 0,2 GB y los pesos suman 83.083.008 parametros en safetensors.

Su relevancia actual es fundamentalmente metodologica y de nicho: el autor publica resultados en el leaderboard MERA 2.0 (exact match) donde el modelo iguala a SmolLM-3B en puntuacion global (0,049) pese a ser 36 veces menor, y supera a modelos de 4B a 10B en subconjuntos de cultura rusa como RUBIN, LIMUR o Characters. No obstante, los valores absolutos son muy bajos y el modelo esta pensado para inferencia offline en hardware minimo, no para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer propio (RusMind AI), 10 capas x 768, requiere `trust_remote_code` |
| Parametros totales | 83.083.008 (83 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible en la model card; existe version GGUF en repositorio aparte |
| Idiomas soportados | ruso (ru) |
| Licencia | RusMind License (DICPlay), licencia propia "other" |
| Formato de pesos | safetensors (transformers); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 10 capas con dimension oculta de 768, entrenado completamente desde cero ("from-scratch") sobre un corpus ruso propio del autor. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o ajuste instruccional; la model card solo indica el uso de un tokenizador BPE propio de 16.000 tokens y el formato de dialogo ChatML.

La innovacion destacable no es arquitectonica sino de eficiencia y especializacion: un modelo de 83 M parametros (~167 MB) disenado para ejecutarse completamente offline en hardware muy limitado. La model card menciona de forma humoristica su ejecucion en un Nokia N95, una nevera inteligente y una tetera, lo que da idea del objetivo de despliegue en dispositivos. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni mezcla de expertos.

## Capacidades

- Generacion de texto conversacional en ruso con plantilla ChatML.
- Respuestas sobre conocimiento cultural ruso: refranes, sabiduria popular (subconjunto RUBIN), personajes (Characters) y tradiciones (Culture Specific).
- Razonamiento basico, con puntuacion baja pero superior a SmolLM-3B en el subconjunto Reasoning de MERA 2.0 (0,119 frente a 0,063).
- Puntuacion y ortografia en ruso (metrica SAGE, PUNCT_F1 de 0,267).
- Inferencia completamente offline en CPU y hardware de bajos recursos.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking".
- Capacidad multilingue: no disponible; el modelo esta entrenado y etiquetado unicamente para ruso.

## Casos de uso

- Evaluacion de cultura rusa en entornos educativos: el modelo puede usarse como banco de pruebas para medir cuanto conocimiento cultural ruso retiene un modelo de 83 M, comparandolo con modelos mayores en el leaderboard MERA 2.0.
- Despliegue en dispositivos embebidos y sin conectividad: con ~167 MB y contexto de 1024 tokens, cabe en sistemas con poca RAM y funciona offline, adecuado para demos de IA en hardware restringido.
- Prototipado rapido de chatbots en ruso: la plantilla ChatML y la API estandar de transformers permiten montar un asistente conversacional basico en pocas lineas de codigo.
- Investigacion sobre tokenizadores de bajo recurso: su BPE propio de 16.000 tokens y su entrenamiento from-scratch lo convierten en un caso de estudio para analizar el efecto del tokenizador en idiomas con morfologia rica como el ruso.
- Filtrado y generacion de texto corto en ruso: tareas de completado o reformulacion de frases donde la latencia y el coste importan mas que la calidad maxima.
- Pruebas de integracion con llama.cpp, Ollama y LM Studio: la version GGUF permite validar pipelines de inferencia local en CPU con un modelo minimo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados publicados por el autor en el leaderboard MERA 2.0 (exact match). No se han publicado otros benchmarks en la informacion disponible.

| Metrica | Zernyshko 1.6 (83 M) | SmolLM-3B (3 B) |
|---|---|---|
| Puntuacion global MERA 2.0 | 0,049 | 0,049 |
| Reasoning | 0,119 | 0,063 |
| Culture Specific | 0,103 | 0,090 |
| RUBIN (refranes) | 0,282 | 0,042 |
| LIMUR | 0,222 | 0,102 |
| Characters | 0,186 | 0,116 |

Comparaciones adicionales citadas por el autor:

| Metrica | Zernyshko 1.6 | Modelo comparado |
|---|---|---|
| RUBIN | 0,282 | Qwen3.5-4B: 0,259; gemma-4-E2B: 0,249; GFusion-10B-A1.8B: 0,183 |
| Characters | 0,186 | GFusion-10B-A1.8B: 0,166 |
| LIMUR | 0,222 | GFusion-10B-A1.8B: 0,217 |
| Culture Specific | 0,103 | Qwen3.5-4B: 0,057 |
| SAGE PUNCT_F1 | 0,267 | Qwen3.5-4B: 0,032; gemma-4-E2B: 0,159 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (~332 MB de pesos) y en torno a 170-200 MB en cuantizacion de 8 bits; en la practica cabe en RAM de sistema sin GPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (incluso integradas) es suficiente. No se dispone de datos de rendimiento en A100/H100.
- Cabe en cualquier GPU consumer y en CPU de gama baja; el autor cita ejecucion en dispositivos muy limitados.
- Opciones de despliegue: transformers con `trust_remote_code=True`; llama.cpp, Ollama y LM Studio mediante el repositorio GGUF `DICPlay/RusMind-Zernyshko-1.6-GGUF`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MERA 2.0 global | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind Zernyshko 1.6 | 83 M | 1024 | 0,049 | RusMind License (no comercial sin acuerdo) | Hugging Face, GGUF |
| SmolLM-3B | 3 B | no disponible en la informacion | 0,049 | no disponible en la informacion | Hugging Face |
| Qwen3.5-4B | 4 B | no disponible en la informacion | no disponible (RUBIN 0,259; Culture 0,057) | no disponible en la informacion | Hugging Face |
| GFusion-10B-A1.8B | 10 B (1,8 B activos) | no disponible en la informacion | no disponible (RUBIN 0,183; Characters 0,166) | no disponible en la informacion | Hugging Face |

La comparacion es asimetrica: Zernyshko 1.6 solo es competitivo en subconjuntos de cultura rusa y puntuacion; en capacidad general y contexto (1024 tokens) queda muy por debajo de los modelos de 3 B a 10 B citados.

## Limitaciones y advertencias

- Puntuacion global MERA 2.0 de 0,049: el rendimiento absoluto es muy bajo, incluso en las metricas donde destaca (RUBIN 0,282).
- Contexto muy limitado: 1024 tokens, insuficiente para documentos largos, conversaciones extensas o RAG con muchos fragmentos.
- Solo ruso: no hay evidencia de capacidades en otros idiomas; el tokenizador de 16.000 tokens esta disenado para ruso.
- Riesgo elevado de alucinacion y de respuestas incoherentes por el tamano del modelo; no apto para tareas de alta precision sin verificacion.
- Licencia restrictiva: uso gratuito solo para fines personales, no comerciales, investigacion y evaluacion; uso comercial, reventa, distribucion de versiones modificadas o integracion en productos requiere contrato escrito con DICPlay.
- Requiere `trust_remote_code=True` por la arquitectura propia, lo que implica ejecutar codigo del autor; conviene auditar el codigo antes de desplegarlo.
- Sin datos publicos sobre composicion del dataset de entrenamiento, sesgos o filtrado de datos; no se pueden evaluar riesgos de sesgo de forma rigurosa.
- Modelo muy reciente y con cero descargas en el momento de la consulta: sin validacion independiente de los resultados de MERA 2.0 reportados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.6
- Version GGUF: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.6-GGUF
- Leaderboard MERA 2.0: no disponible en la informacion proporcionada (mencionado en la model card sin enlace)
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
