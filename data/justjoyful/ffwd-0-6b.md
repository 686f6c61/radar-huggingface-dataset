# JustJoyful/ffwd-0.6b

## Resumen

ffwd-0.6b es un modelo especializado de 0,6 mil millones de parametros, desarrollado por JustJoyful, que convierte instrucciones en lenguaje natural sobre edicion de video en comandos FFmpeg verificados mediante un bucle de agente. Se construye sobre Qwen3-0.6B mediante un ajuste fino en dos etapas: primero un SFT con LoRA sobre 6.032 trayectorias multiturno (etapa M1) y despues un entrenamiento de refuerzo GRPO multiturno (etapa M3, checkpoint-60 de una ejecucion de 60 pasos). El resultado se distribuye en formato GGUF para llama.cpp.

El modelo no es un chat generalista: emite una unica accion JSON por turno (`spec`, `ask_user`, `unsupported`, `run` o `finish`) dentro de un protocolo en el que el arnes de ejecucion valida cada comando FFmpeg contra una lista blanca de argumentos y ejecuta una comprobacion automatica tras cada `run`. Cubre doce familias de tareas (recorte, union, conversion de compatibilidad, redimensionado/recorte de encuadre, rotacion/volteo, compresion a un tamano, extraccion de fotogramas, GIF, extraccion/eliminacion de audio, volumen/sonoridad, desfase A/V y velocidad/fps).

La relevancia actual reside en su enfoque: un modelo diminuto (596.049.920 parametros, 2,4 GB de repositorio) especializado mediante RL para una tarea acotada, con verificacion externa obligatoria. La precision reportada es del 95,0 % en 900 tareas retenidas en navegador y del 96,3 % con Q8_0 nativo, aunque medida sobre tareas generadas, no sobre formulaciones reales de usuarios. El proyecto esta en fase de previsualizacion temprana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B), ajuste fino con LoRA fusionado |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuracion de servidor usada, `-c 8192`) |
| Tipos de cuantizacion | GGUF Q8_0 y Q5_K_M (Q5_K_M es el formato de envio desde el 23 nov 2026) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos base) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only, y se ajusta en dos fases. La primera (M1) aplica SFT con LoRA sobre 6.032 trayectorias multiturno que ensenan el protocolo spec-first y el formato de una accion JSON por turno. La segunda (M3) aplica GRPO multiturno durante 60 pasos; el checkpoint publicado es el checkpoint-60, seleccionado como ultimo checkpoint limpio de la ejecucion segun una regla fijada antes de ver resultados de desarrollo (D-045). El adaptador LoRA se fusiona en los pesos y se convierte a GGUF con llama.cpp b12032.

La innovacion principal no esta en la arquitectura sino en el protocolo y el entorno de entrenamiento: el modelo nunca ve rutas de fichero reales, sino identificadores de entrada y salida que el arnes mapea; la comprobacion (`check`) no es una accion del modelo, sino que la ejecuta el arnes tras cada `run` y le devuelve pass o fail; se permiten como maximo 4 ejecuciones por trabajo; y los argumentos FFmpeg pasan por un validador de lista blanca que prohibe `-y`, protocolos y traversal de rutas. La plantilla de chat es la de Qwen3 estandar sin thinking ni tools, pero conservando el bloque vacio `<think>\n\n</think>\n\n` en todos los turnos del asistente (D-026), algo que las plantillas estandar no hacen.

## Capacidades

- Conversion de instrucciones en lenguaje natural a comandos FFmpeg estructurados (lista de argumentos, nunca cadena de shell).
- Protocolo de agente spec-first con acciones `spec`, `ask_user`, `unsupported`, `run` y `finish`.
- Peticion de aclaracion (`ask_user`) cuando la solicitud carece de informacion, limitada a una pregunta.
- Declaracion explicita de no soporte (`unsupported`) para tareas fuera del alcance de FFmpeg (subtitulos, estabilizacion, etalonaje, eliminacion de objetos).
- Cobertura de 12 familias de tareas de edicion de video: trim, merge, conversion de compatibilidad, resize/crop, rotate/flip, compresion a tamano, extraccion de fotogramas, GIF, extraccion/eliminacion de audio, volumen/sonoridad, desfase A/V y velocidad/fps.
- Function calling estructurado en JSON con una accion por turno.
- Razonamiento multiturno dentro del bucle de agente con feedback de exito/fallo tras cada ejecucion.
- Multilingue: no disponible (solo ingles declarado).

## Casos de uso

- Automatizacion de tareas de recorte y union: el modelo traduce ordenes como "corta los primeros 3 segundos" o "une estos dos clips" en invocaciones FFmpeg validadas, util para pipelines de postproduccion sencilla donde no se quiere que un usuario final toque la linea de comandos.
- Compresion a un tamano objetivo: convierte peticiones como "comprime a menos de 10 MB" en comandos de compresion con verificacion posterior, adecuado para preparar adjuntos de correo o subidas con limite de peso.
- Generacion de GIF y extraccion de fotogramas: permite a herramientas de documentacion o marketing producir GIF y miniaturas a partir de video mediante lenguaje natural, con el arnes como garantia de que el comando es seguro.
- Conversion de compatibilidad de formato: resuelve peticiones de cambio de contenedor o codec para reproducir en dispositivos concretos, dentro de la familia F3, con el validador de argumentos evitando opciones peligrosas.
- Ajuste de audio en clips: extraccion o eliminacion de pista de audio, normalizacion de volumen y correccion de desfase A/V para tareas de limpieza rapida antes de publicar.
- Asistente local en navegador para usuarios no tecnicos: al ser un modelo de 0,6 B en GGUF, encaja en una utilidad de video local y browser-first orientada a no desarrolladores, que es el producto objetivo declarado.
- Demostracion de investigacion en RL multiturno: sirve como caso de estudio reproducible de SFT + GRPO con verificacion externa en un dominio estrecho, con manifiestos y hashes publicados.

## Benchmarks y rendimiento

| Metrica | Resultado | Notas |
|---|---|---|
| Precision en 900 tareas retenidas (navegador) | 95,0 % | Tareas generadas, no formulaciones reales |
| Precision nativa Q8_0 | 96,3 % | Evaluacion de fase 1 |
| Guarda de no inferioridad | -1,33 pp [-2,67, -0,11] | Intervalo reportado en la model card |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores corresponden a la evaluacion propia del autor sobre tareas sinteticas del dominio.

## Requisitos de hardware

- VRAM estimada: el GGUF Q8_0 ocupa 639.443.520 bytes (unos 610 MB); Q5_K_M es aun menor, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con mas de 1 GB libre.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es sobrada; tambien es viable en CPU. No se requieren A100 ni H100.
- Cabe en GPU consumer: si, en practicamente todas, e incluso en entornos integrados.
- Opciones de despliegue: llama.cpp (llama-server), con `--jinja --chat-template-file chat-template.jinja`, `-ngl 99`, `-c 8192`, `-np 1`, `--cache-ram 0` y semilla 20261115 en la configuracion de evaluacion; formato GGUF compatible con llama.cpp y Ollama. vLLM y TGI no estan documentados para este artefacto.
- Latencia y throughput: no disponible en la informacion proporcionada. La decodificacion usada en evaluacion es greedy (`temperature = 0.0`, `max_tokens = 512`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ffwd-0.6b | 596 M | 8192 | Agente FFmpeg especializado (SFT + GRPO) | Apache 2.0 | Hugging Face, GGUF |
| Qwen3-0.6B (base) | 0,6 B | 32768 (estandar Qwen3) | Chat generalista | Apache 2.0 | Hugging Face |
| Alternativas especializadas en FFmpeg | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion significativa es con el modelo base: ffwd-0.6b sacrifica generalidad y capacidades de chat para ganar fiabilidad en una tarea concreta mediante protocolo y verificacion. No se dispone de informacion sobre otros modelos especializados comparables.

## Limitaciones y advertencias

- Fase de previsualizacion temprana: la aplicacion que lo ejecuta esta en version 0.9.0 y la precision en el mundo real es desconocida; las cifras reportadas provienen de tareas generadas.
- Peticiones vagas o ambiguas pueden fallar: el propio autor documenta que "Make the video potrait mode, lower the volume" sobre un clip real no produjo un resultado correcto, con causa no investigada.
- No es un modelo de chat general: fuera de su bucle no ofrece respuestas fiables, y sin la comprobacion del arnes sus comandos quedan sin verificar.
- Alcance limitado: subtitulos, estabilizacion, etalonaje y eliminacion de objetos se declaran `unsupported`.
- Dependencia critica de la plantilla de chat: usar la plantilla estandar de Qwen3 (HF, llama.cpp `--jinja`, MLC/WebLLM) altera el contexto respecto al entrenamiento; MLC fue token-identica en 0 de 11 fixtures.
- No se deben pasar `chat_template_kwargs` ni `enable_thinking`: el interruptor no existe en esta plantilla.
- Limite de 4 ejecuciones por trabajo y una sola pregunta de aclaracion por peticion.
- Riesgo de alucinacion en argumentos FFmpeg mitigado solo por el validador de lista blanca y la comprobacion; cualquier uso que evite el arnes pierde esa garantia.
- Idioma: solo ingles declarado, lo que limita su uso con instrucciones en castellano.
- Licencia Apache 2.0 permite uso comercial, pero el producto esta en previsualizacion y las ediciones irreversibles requieren los pasos de confirmacion y comprobacion.
- Sesgos conocidos: no disponible en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JustJoyful/ffwd-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de checkpoint GRPO: https://huggingface.co/JustJoyful/ffmpeg-agent-ckpt-grpo
- Repositorio privado M1: https://huggingface.co/JustJoyful/ffmpeg-agent-m1-0.6b
- Ficheros de integridad citados en la model card: `ffwd-model.json`, `SHA256SUMS`, `reports/2026-11-23-phase-1/manifest.json`, `chat-template.jinja`, `system-v1.txt`
- Papers, blogs, repos de codigo y demos adicionales: no disponible en la informacion proporcionada.
