# OsaurusAI/LFM3-Omni-2B-JANG_6M

## Resumen

OsaurusAI/LFM3-Omni-2B-JANG_6M es una compilacion cuantizada del modelo multimodal LiquidAI/LFM3-Omni-2B, publicada por OsaurusAI y optimizada especificamente para Apple Silicon mediante el framework MLX. El modelo base combina una torre de vision, un codificador de voz y un tronco LFM3 en una unica arquitectura any-to-any capaz de procesar texto, imagenes, video y audio de entrada. Esta version JANG_6M aplica una receta de cuantizacion mixta (8 bits en las proyecciones de atencion y 6 bits en las capas FFN) calibrada con GPTQ y AWQ sobre un conjunto de datos orientado a tool calling, agentes de terminal, razonamiento y codigo.

El modelo resuelve el problema de ejecutar un modelo multimodal de 2B parametros en hardware de consumo Apple (Macs con chip M-series) manteniendo una fidelidad numerica muy alta respecto al original en bf16: la divergencia KL mediana es de 0.00004 nats por posicion y la coincidencia top-1 con el modelo fuente alcanza el 98.98%. El bundle ocupa 2.36 GiB en disco en un unico shard en float16, lo que lo hace practico para despliegue local en portatiles y equipos de sobremesa con memoria unificada.

Es relevante ahora porque demuestra que la cuantizacion consciente de la distribucion de servicio (calibrada con trayectorias reales de agentes y tool calls) permite conservar capacidades agenticas en un modelo pequeno de 2B, algo critico para flujos de trabajo locales sin dependencia de la nube. La licencia es la LFM Open License v1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (tronco Liquid) con torre de vision y codificador de voz; any-to-any |
| Parametros totales | 2B (modelo base LFM3-Omni-2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine group 32 (atencion q/k/v/o, conv corta, embedding/lm_head); 6-bit affine group 32 (FFN w1/w3/w2); GPTQ + AWQ |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (MLX), un shard, float16 en disco |

## Arquitectura y entrenamiento

El modelo base LFM3-Omni-2B integra en un unico tronco LFM3 una torre de vision, un codificador de voz y un decodificador de salida de voz, permitiendo entrada de texto, imagenes, video y habla. Esta compilacion cuantizada mantiene a precision completa la puerta de salida de atencion, los kernels de convolucion depthwise, todas las normalizaciones, la torre de vision y su proyector, el codificador de voz y su proyector, y el decodificador de salida de voz (no usado para texto).

La cuantizacion se realizo con GPTQ sobre 142/142 tensores con una rejilla min-max fija (layout identico en bytes a `mx.quantize`), act-order, acumulacion de Hessianos sobre todos los tokens de calibracion y reconstruccion del Hessiano de w2 a traves de w1/w3 ya cuantizados, con una guarda best-of-RTN. El error medio de reconstruccion de calibracion fue un -54.4% respecto a round-to-nearest. Adicionalmente se aplico AWQ con escalas de canal (alpha 0.25, clip 0.5-2) plegadas en `ffn_norm` y filas de `w3`, sin coste en tiempo de ejecucion. El conjunto de calibracion consta de 628.356 tokens renderizados con la plantilla de chat del propio modelo, incluyendo tool calls en formato XML `<tool_call><function=...>`, resultados de herramientas como turnos `tool`, pensamientos de agente en `<think>`, y parte de las propias respuestas del modelo (card sampling) a prompts de razonamiento, herramientas, terminal y codigo. La distribucion por dominio incluye 174.439 tokens de trayectorias de agentes de terminal/SWE, 154.589 de tool calling, 101.508 de razonamiento, 84.519 de imagenes, 51.568 de codigo y texto agentico, 37.598 de texto general y multilingue, 17.069 de imagen + voz en un mismo turno y 7.066 de voz.

## Capacidades

- Generacion de texto y razonamiento con modo thinking opcional (desactivado por defecto; se activa con `enable_thinking: true`).
- Procesamiento de imagenes (fotos, capturas de pantalla, documentos) como entrada.
- Procesamiento de video como entrada.
- Procesamiento de voz de entrada (ASR, QA hablado, instrucciones habladas).
- Capacidad any-to-any: combinacion de imagen y voz en un mismo turno.
- Tool calling en formato XML `<tool_call><function=...>` con soporte de turnos `tool` para resultados.
- Soporte de agentes multi-paso y trayectorias de terminal/SWE.
- Generacion de codigo y texto agentico.
- Capacidades multilingues en 16 idiomas (en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl).
- Decodificador de salida de voz presente en el bundle, aunque no utilizado para texto.

## Casos de uso

- Agentes de terminal locales: el modelo esta calibrado con 174.439 tokens de trayectorias de terminal y SWE, por lo que puede ejecutar bucles de agente multi-paso en una Mac sin conexion, interpretando salidas de comandos y emitiendo tool calls XML.
- Atencion al cliente automatizada en dispositivo: al soportar tool calling y contexto conversacional, puede gestionar dialogos multi-turno con integracion de herramientas (consultas a CRM, busqueda de pedidos) en local, sin enviar datos a la nube.
- Asistente multimodal de escritorio: combinando entrada de imagen y voz en un mismo turno, puede procesar capturas de pantalla o documentos junto con instrucciones habladas, util para accesibilidad y automatizacion de escritorio.
- Generacion de codigo en pipelines locales: con calibracion especifica en codigo y texto agentico, es adecuado para autocompletado y generacion de parches en entornos de desarrollo sobre Apple Silicon.
- Procesamiento de documentos escaneados: la torre de vision a precision completa permite extraer informacion de documentos y capturas mediante prompts multimodales.
- Transcripcion y QA hablado: el codificador de voz permite ASR y preguntas-respuestas sobre audio directamente en el dispositivo, util para actas de reunion o notas de voz.
- Razonamiento con trazas largas: el modo thinking opcional, calibrado con 101.508 tokens de trazas `<think>`, permite resolver problemas que requieren cadenas de razonamiento extensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Si se publican metricas de fidelidad de cuantizacion frente al modelo bf16:

| Build | Tamano | KL mediana | KL media | KL p95 | Top-1 |
|---|---|---|---|---|---|
| Este bundle | 2.36 GiB | 0.00004 | 0.00119 | 0.0051 | 98.98% |
| Mismo layout, round-to-nearest | 2.36 GiB | 0.00006 | 0.00174 | 0.0070 | 98.83% |
| 6-bit uniforme gs64 (receta por defecto mlx-vlm) | 2.12 GiB | 0.00018 | 0.00496 | 0.0192 | 97.81% |

Las metricas se midieron sobre 75 secuencias reservadas (15.324 posiciones puntuadas) de tool calls, agentes de terminal y SWE, razonamiento, codigo, texto general, imagenes y voz. KL en nats por posicion (menor es mejor); top-1 es la coincidencia de argmax con bf16.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el bundle ocupa 2.36 GiB en disco; en ejecucion requiere memoria adicional para el contexto y activaciones, por lo que se recomienda un minimo de 8 GB de memoria unificada.
- GPU recomendadas: chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con soporte MLX.
- Cabe en GPU de consumo: si, en cualquier Mac con chip M-series; no esta disenado para GPUs NVIDIA ni AMD.
- Opciones de despliegue: vMLX / Osaurus (vmlx-swift con LFM3, Osaurus con soporte multimedia LFM3) y mlx-vlm con el port de LFM3.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-JANG_6M (este) | 2B | no disponible | texto, imagen, video, voz | LFM Open License v1.0 | Hugging Face, MLX |
| LiquidAI/LFM3-Omni-2B (base bf16) | 2B | no disponible | texto, imagen, video, voz | LFM Open License v1.0 | Hugging Face |
| 6-bit uniforme gs64 (receta mlx-vlm) | 2B | no disponible | texto, imagen, video, voz | LFM Open License v1.0 | generado localmente |

La comparativa con modelos de otras familias no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo cuantizado: aunque la fidelidad es alta (98.98% top-1), existen divergencias respecto al bf16 que pueden acumularse en generaciones largas o tareas muy sensibles.
- El modo thinking esta desactivado por defecto; sin activarlo, el rendimiento en razonamiento complejo puede ser inferior al del modelo configurado con thinking.
- Exclusivo para Apple Silicon y MLX: no es ejecutable en GPUs NVIDIA, AMD ni en CPU convencional sin conversiones adicionales no documentadas.
- Licencia LFM Open License v1.0: es necesario revisar los terminos del archivo LICENSE para uso comercial, ya que no es una licencia permisiva estandar.
- Riesgo de alucinacion inherente a modelos de 2B parametros, especialmente en tareas de conocimiento factual y contextos largos.
- La longitud de contexto no se especifica en la informacion disponible, lo que limita la planificacion de despliegues con documentos extensos.
- El decodificador de salida de voz esta presente pero no se utiliza para texto; su comportamiento en generacion de voz no esta documentado.
- Sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/OsaurusAI/LFM3-Omni-2B-JANG_6M
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Web de Osaurus: https://osaurus.ai
