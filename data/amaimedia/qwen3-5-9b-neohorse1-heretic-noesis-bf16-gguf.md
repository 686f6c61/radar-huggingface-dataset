# AMAImedia/Qwen3.5-9B-NeoHorse1-Heretic-NOESIS-BF16-GGUF

## Resumen

Qwen3.5-9B-NeoHorse1-Heretic-NOESIS-BF16-GGUF es una variante derivada del modelo Qwen3.5-9B de Alibaba, publicada por AMAImedia (Ilia Bolotnikov) en el marco de su plataforma NOESIS de doblaje multilingue. La ficha combina tres linajes: la base Qwen/Qwen3.5-9B, el modelo TokenRhythm/NeoHorse-1-9B (un post-entrenamiento agentico orientado a auto-mejora recursiva) y una capa de "abliteration" mediante la herramienta Heretic v1.4.0 que elimina los mecanismos de rechazo del modelo original.

El resultado es un modelo de 8.953.803.264 parametros (aproximadamente 9B) con licencia Apache 2.0, publicado en formato GGUF y BF16, con etiquetas que declaran soporte de razonamiento, matematicas, STEM, tool calling, function calling, codigo y agentes. La model card incluye parametros concretos de abliteration (direction_index 16.33, pesos de atencion y MLP especificados) y una tabla de rendimiento que reporta 18 rechazos sobre 100 frente a los 97 del modelo original, con una divergencia KL de 0.0181.

Su relevancia actual es doble: por un lado, demuestra el flujo de trabajo de "decensurado" via abliteration con metricas de impacto medibles; por otro, sirve como ejemplo de publicacion de cuantizaciones GGUF de modelos de 9B en un repositorio de 42.9 GB. No obstante, la informacion tecnica disponible sobre el entrenamiento subyacente es limitada y procede casi exclusivamente de etiquetas y de la documentacion del modelo base NeoHorse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y GGUF (el repositorio incluye multiples cuantizaciones GGUF; no se detalla la lista exacta) |
| Idiomas soportados | 100+ idiomas, entre ellos en, es, ru, zh, ja, ko, ar, hi, de, fr, pt, it, vi, kk, tr, th y la mayoria de lenguas europeas y asiaticas listadas en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen3.5 en su variante de texto (`qwen3_5_text`), un transformer decoder-only denso de aproximadamente 9B parametros. El linaje de entrenamiento es acumulativo: parte de Qwen/Qwen3.5-9B, sobre el que se aplica el post-entrenamiento de TokenRhythm/NeoHorse-1-9B, descrito por sus autores como un proceso de "auto-mejora recursiva via post-entrenamiento agentico con routing harness". Las etiquetas del repositorio mencionan tecnicas de destilacion (con referencia a DeepSeek), SFT, RL con GSPO, fusion de LoRA mediante DARE-TIES y un componente MTP (multi-token prediction).

Sobre esa base, AMAImedia aplica una abliteration con Heretic v1.4.0, una tecnica que identifica la direccion del espacio de activaciones asociada a los rechazos y la proyecta fuera de las matrices de atencion (`o_proj`) y de la MLP (`down_proj`). Los parametros publicados incluyen `direction_index` 16.33, pesos maximos y minimos para `attn.o_proj` (1.48 y 1.46) y `mlp.down_proj` (1.44 y 1.43), con sus posiciones y distancias correspondientes. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni el volumen de datos de la fase de abliteration.

## Capacidades

- Generacion de texto conversacional multi-turno con soporte declarado de modo razonamiento.
- Razonamiento matematico y STEM, segun las etiquetas `math`, `stem` y `reasoning`.
- Generacion de codigo y asistencia a programacion (etiqueta `coding`).
- Tool calling y function calling, con etiqueta `tool-use` y `function-calling`.
- Flujos agenticos y razonamiento multi-paso (etiquetas `agentic` y `agentic post-training` en el modelo base).
- Capacidades multilingues amplias: mas de 100 idiomas declarados, con especial cobertura de lenguas europeas y asiaticas.
- Comportamiento "uncensored"/"abliterated": el modelo reduce drasticamente los rechazos (18/100 frente a 97/100 del original) manteniendo una divergencia KL de 0.0181 respecto al modelo de partida.
- No se declaran capacidades de vision, audio ni multimodalidad en la informacion disponible.

## Casos de uso

- Doblaje y localizacion multilingue automatizada: el modelo forma parte de la plataforma NOESIS de AMAImedia, disenada para doblaje profesional; su cobertura de mas de 100 idiomas y su capacidad conversacional lo hacen apto para generar guiones adaptados y dialogos sincronizados por idioma.
- Atencion al cliente automatizada: con soporte de tool calling y function calling, puede integrarse en un backend que consulte APIs de pedidos, facturacion o CRM y mantenga conversaciones multi-turno.
- Generacion de codigo en pipelines de CI/CD: las etiquetas de coding y tool-use permiten usarlo como asistente que invoca herramientas de build, ejecuta tests y propone parches dentro de un agente de integracion.
- Razonamiento matematico y STEM en entornos educativos o de investigacion: util para resolver problemas paso a paso, generar explicaciones tecnicas y verificar derivaciones, con la cautela de que no se han publicado benchmarks propios.
- Agentes autonomos de multiple paso: el post-entrenamiento agentico del modelo base NeoHorse esta orientado a tareas con routing harness, por lo que encaja en orquestadores que descomponen objetivos en subtareas y llaman a herramientas.
- Investigacion sobre abliteration y seguridad: util como caso de estudio reproducible para medir el impacto de Heretic v1.4.0 sobre las tasas de rechazo y la divergencia KL, comparando con el modelo original.
- Procesamiento de documentos y resumenes multilingues: su ventana de contexto (no especificada) y su cobertura idiomatica permiten resumir y traducir contenido en lenguas minoritarias incluidas en la lista (ast, ceb, kam, luo, umb, etc.).

## Benchmarks y rendimiento

La model card solo publica metricas del proceso de abliteration, no benchmarks estandar de capacidad (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL | 0.0181 | 0 (por definicion) |
| Rechazos | 18/100 | 97/100 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 18 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda un minimo de 24 GB para inferencia comoda.
- VRAM estimada en GGUF Q8: en torno a 10-11 GB; en Q4_K_M: en torno a 5.5-6.5 GB.
- GPU recomendadas para BF16: NVIDIA A100 40/80 GB, H100, L40S o RTX 4090 (24 GB, justo para BF16 con contexto corto).
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto moderado y en RTX 3090/4080 (16-24 GB) en cuantizaciones GGUF Q8 o Q6; en RTX 3060 de 12 GB o 8 GB encajan las cuantizaciones Q4 y Q3.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para safetensors BF16 (el repositorio incluye la etiqueta `text-generation-inference`); transformers para uso directo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AMAImedia/Qwen3.5-9B-NeoHorse1-Heretic-NOESIS | 8.95B | no disponible | Apache 2.0 | safetensors, GGUF | Variante abliterated con 18/100 rechazos |
| Qwen/Qwen3.5-9B | ~9B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo base original, sin decensurar |
| TokenRhythm/NeoHorse-1-9B | ~9B | no disponible | Apache 2.0 | safetensors | Post-entrenamiento agentico, sin abliteration |
| Dingdust/NeoHorse-1-9B-heretic | ~9B | no disponible | Apache 2.0 | no disponible | Abliteration previa del mismo linaje |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de las metricas de rechazo y divergencia KL.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de rechazos implica que puede generar contenido que el modelo original bloquearia; requiere filtros propios en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni benchmarks de capacidad, por lo que el impacto de la abliteration y del post-entrenamiento sobre la precision factual es desconocido.
- La divergencia KL de 0.0181 indica un cambio medible en la distribucion de salida; puede afectar a tareas sensibles a la calibracion.
- No se especifica la longitud de contexto soportada, lo que impide dimensionar el KV cache y evaluar tareas de contexto largo.
- La cobertura de 100+ idiomas es declarativa; no hay evaluaciones por idioma publicadas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y el modelo se distribuye "tal cual".
- El repositorio incluye un banner de donaciones y el modelo se presenta como parte de una plataforma comercial (NOESIS); conviene revisar los terminos de uso de la plataforma antes de integrarlo.
- La informacion sobre el entrenamiento del modelo base (tokens, composicion del dataset, fases de RL) no esta disponible en esta ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AMAImedia/Qwen3.5-9B-NeoHorse1-Heretic-NOESIS-BF16-GGUF
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo NeoHorse-1-9B: https://huggingface.co/TokenRhythm/NeoHorse-1-9B
- Repositorio Heretic de NeoHorse: https://huggingface.co/Dingdust/NeoHorse-1-9B-heretic
- GitHub de NeoHorse: https://github.com/TokenRhythm/NeoHorse
- Informe tecnico de NeoHorse: https://github.com/TokenRhythm/NeoHorse/blob/main/TechnicalReport_NeoHorse_v1.pdf
- Heretic project: https://heretic-project.org
- Web de TokenRhythm: https://tokenrhythm.ai/
- Web de AMAImedia: https://www.amaimedia.com
- X de AMAImedia: https://x.com/AMAImediacom
