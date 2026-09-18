# dealignai/Bonsai-2-27B-CRACK-Ternary-JANG

## Resumen

Bonsai-2-27B-CRACK-Ternary-JANG es un derivado sin censura del modelo ternary comprimido de PrismML, que a su vez es una compresion ternaria del híbrido Qwen 3.8 27B (`qwen3_5`). Lo publica el usuario dealignai bajo licencia Apache 2.0 y esta pensado para ejecutarse en vMLX, el motor de inferencia MLX para Apple Silicon con soporte de paquetes JANG de precision mixta, cuantizacion de cache KV y tool calling agentico. El modelo conserva la arquitectura hibrida del original (48 capas GatedDeltaNet SSM mas 16 capas de atencion completa), el tower de vision, el contexto nativo de 262.144 tokens y el parser XML de llamadas a funciones de Qwen3-Coder.

La innovacion principal es la eliminacion del comportamiento de rechazo a nivel de pesos (abliteracion), manteniendo intactas las capacidades de razonamiento, codigo, conocimiento bilingue, vision, video y tool calling. El bundle se distribuye como empaquetado ternario sin perdida de reempaquetado (2 bits afines, grupo 128, escalas bf16, sesgos = −escalas) con la rotacion Hadamard preservada, lo que obliga a usar el runtime JANG-Hadamard de vMLX: la ruta estandar de MLX (`mlx_lm.load()`) produce salida corrupta sobre este paquete.

Con 27.359.638.768 parametros y ~7,7 GiB en disco, el modelo esta orientado a despliegue local en hardware Apple Silicon, con modo de razonamiento configurable (low / medium / xhigh) y soporte multimodal de imagen y video. Es relevante ahora porque combina dos tendencias: cuantizacion extrema (ternaria) para hacer viable un 27B en equipos de consumo, y ensembles sin alineacion de seguridad, lo que lo convierte en una pieza util para investigacion de seguridad y red-teaming, pero arriesgada para produccion sin salvaguardas externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido `qwen3_5`: 48 capas GatedDeltaNet SSM + 16 capas de atencion completa, hidden 5120, tower de vision separado |
| Parametros totales | 27.359.638.768 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens (262 K, nativa) |
| Tipos de cuantizacion | Ternaria afín de 2 bits, group size 128, rotacion Hadamard preservada, escalas bf16, sesgos = −escalas |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 4 shards, 2.556 tensores, ~7,7 GiB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura hibrida de la familia `qwen3_5`: una pila de 48 capas GatedDeltaNet (modelo de espacio de estados con mecanismo de decaimiento controlado) combinadas con 16 capas de atencion completa, dimension oculta de 5120 y un tower de vision independiente. Esta mezcla busca reducir el coste de la atencion cuadratica en secuencias largas manteniendo la capacidad de recuperacion precisa que aportan las capas de atencion completa, y es lo que permite sostener un contexto nativo de 262.144 tokens. El modelo soporta vision y video, tool calling en XML con parser sidecar `qwen3_coder` y modos de razonamiento configurables (low, medium, xhigh) con xhigh como valor por defecto.

Sobre esa base, PrismML aplico una compresion ternaria de 2 bits con rotacion Hadamard (grupo 128), y dealignai publico un reempaquetado JANG que preserva la rotacion y aplica abliteracion a nivel de pesos, eliminando el comportamiento de rechazo sin alterar la plantilla de chat, el parser de herramientas ni el tower de vision. No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset original ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se detalla el procedimiento exacto de abliteracion mas alla de que la eliminacion de rechazos se realiza "a nivel de pesos".

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento conmutable: off, low, medium y xhigh.
- Razonamiento multi-paso extenso: el autor reporta 0 bucles en modo razonamiento sobre 320 generaciones xhigh (excluyendo falsos positivos de estribillos y hilos de correo).
- Capacidades de vision: el tower de vision se mantiene intacto respecto al modelo base.
- Capacidades de video: soporte declarado de entrada de video.
- Tool calling / function calling mediante plantilla XML y parser sidecar `qwen3_coder`, sin cambios respecto al base.
- Uso en agentes: combinacion de tool calling estable, contexto de 262 K y modos de razonamiento largos.
- Bilingue ingles y chino, con conocimiento preservado en ambos idiomas tras la abliteracion.
- Ausencia de rechazos: el modelo responde a instrucciones en categorias de tarea que un modelo alineado rechazaria, incluidas peticiones de contenido danino segun HarmBench.
- Inferencia en Apple Silicon mediante MLX con cuantizacion de cache KV.

## Casos de uso

- Inferencia local en equipos Apple Silicon: con ~7,7 GiB de pesos, el modelo cabe en un Mac con memoria unificada suficiente y permite ejecutar un 27B con contexto largo sin GPU dedicada, usando el runtime vMLX que implementa JANG-Hadamard y cuantizacion de cache KV.
- Asistente multimodal de escritorio: gracias al tower de vision y al soporte de video, se puede usar para describir imagenes, extraer informacion de capturas o analizar clips cortos en local, sin enviar datos a servicios en la nube.
- Analisis de documentos muy largos: el contexto de 262.144 tokens permite cargar informes completos, bases de codigo o transcripciones extensas en una sola pasada, algo relevante para revision de contratos o auditoria documental.
- Agentes con tool calling en pipelines internos: el parser XML `qwen3_coder` y el contexto largo lo hacen apto para orquestar llamadas a APIs y acciones encadenadas en automatizaciones locales, por ejemplo generacion y ejecucion de codigo en un flujo de CI controlado.
- Generacion y asistencia de codigo: con 72,5 % en `college_computer_science` y 85 % en `high_school_computer_science` en MMLU, el modelo es util para autocompletado, refactorizacion y explicacion de codigo en un IDE local, aunque no se han publicado benchmarks especificos como HumanEval.
- Procesamiento bilingue EN-ZH: traduccion, resumen y atencion al cliente entre ingles y chino, aprovechando el conocimiento preservado en ambos idiomas y la ventana de contexto amplia para conversaciones multi-turno largas.
- Investigacion de seguridad y red-teaming: con una tasa de exito de ataque (ASR) del 100 % en HarmBench-320 en categorias de dano real, el modelo es util como sujeto de prueba en evaluaciones de robustez y para estudiar el efecto de la abliteracion sobre el comportamiento de rechazo.
- Generacion de contenido creativo sin filtros editoriales: para proyectos donde las restricciones de contenido de los modelos alineados son un obstaculo, con la advertencia legal y etica correspondiente.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| MMLU (57 asignaturas, generacion de letra, 40 por asignatura = 2.280 items) | 77,19 % (base 77,41 %, delta −0,22 pp) |
| MMLU STEM | 71,58 % (base 71,45 %, delta +0,13 pp) |
| MMLU Humanities | 79,04 % (base 79,23 %, delta −0,19 pp) |
| MMLU Social Sciences | 83,96 % (base 84,17 %, delta −0,21 pp) |
| MMLU Other | 77,31 % (base 78,08 %, delta −0,77 pp) |
| HarmBench-320 ASR (dano real, excluyendo copyright), thinking OFF | 100,00 % (240/240) |
| HarmBench-320 ASR (dano real, excluyendo copyright), thinking ON xhigh | 100,00 % (240/240) |
| ASR en categoria copyright, thinking OFF | 97,5 % (78/80) |
| ASR en categoria copyright, thinking ON xhigh | 100,0 % (80/80) |
| Bucles en modo razonamiento sobre 320 generaciones xhigh | 0 |

La evaluacion de cumplimiento se califica sobre el cuerpo de la respuesta (posterior a `</think>`) cuando el razonamiento cierra, o sobre la traza de razonamiento cuando agota el presupuesto de tokens sin cerrar. No se han publicado en la informacion disponible resultados de HumanEval, GSM8K, MT-Bench ni otros benchmarks adicionales.

## Requisitos de hardware

- Peso de los pesos cuantizados: ~7,7 GiB en 4 shards (dato del autor). No se dispone de la cifra de VRAM total en inferencia.
- El consumo total de memoria depende de la longitud de contexto efectiva: a 262.144 tokens la cache KV crece de forma significativa, aunque vMLX soporta cuantizacion de cache KV para mitigarlo. No se han publicado cifras exactas de memoria por longitud de contexto.
- Requiere memoria unificada de Apple Silicon (MLX). Como referencia estimada —no confirmada por el autor— 16 GB serian el minimo para cargar los pesos con contexto corto, 32 GB para uso comodo y 64 GB o mas para contexto muy largo.
- GPU recomendadas: silicio de Apple (familias M1/M2/M3/M4 en configuraciones Pro, Max y Ultra). No es compatible de forma nativa con CUDA (A100, H100, RTX 4090) al estar empaquetado en formato MLX.
- Cabe en equipos de consumo Apple (MacBook Pro, Mac Studio, Mac mini) siempre que la memoria unificada sea suficiente.
- Runtime obligatorio: vMLX, por su implementacion de JANG-Hadamard. La ruta estandar de MLX / `mlx_lm.load()` produce salida corrupta sobre este paquete.
- Opciones de despliegue alternativas (llama.cpp, Ollama, vLLM, TGI): no disponibles en la informacion proporcionada para este bundle. El formato GGUF no se ofrece.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bonsai-2-27B-CRACK-Ternary-JANG | 27.359.638.768 | 262.144 tokens | 77,19 % | Apache 2.0 | MLX, requiere vMLX |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit (base) | 27.359.638.768 | 262.144 tokens | 77,41 % | no disponible | MLX, requiere runtime JANG-Hadamard |

No se dispone en la informacion proporcionada de datos medidos de otros modelos comparables de la misma categoria (mismo tamano o misma tarea), por lo que no se incluyen mas alternativas. Las busquedas web realizadas no devolvieron resultados relevantes sobre el modelo.

## Limitaciones y advertencias

- Modelo sin censura: el comportamiento de rechazo esta eliminado a nivel de pesos. El propio autor reporta un 100 % de ASR en categorias de dano real de HarmBench-320 y entre 97,5 % y 100 % en categoria copyright, lo que implica que generara contenido danino o material con derechos de autor si se le solicita.
- Riesgo legal y etico elevado en produccion: usar este modelo para generar contenido no filtrado puede vulnerar normativa de derechos de autor, y exige salvaguardas externas si se expone a usuarios finales.
- Dependencia de runtime propietario: necesita el motor vMLX con JANG-Hadamard. Cargarlo con `mlx_lm.load()` o MLX estandar produce salida corrupta. Esto limita la portabilidad y ata el despliegue a una herramienta concreta.
- Restriccion de plataforma: solo MLX / Apple Silicon. No hay versiones GGUF, CUDA, vLLM ni TGI, lo que excluye el despliegue en infraestructura de centro de datos convencional.
- Cobertura idiomatica limitada: solo ingles y chino. El rendimiento en castellano u otros idiomas no esta documentado y cabe esperar degradacion.
- Cuantizacion ternaria de 2 bits: aunque el autor reporta una degradacion agregada de solo −0,22 pp en MMLU, la precision se reduce frente al modelo en bf16, con caidas notables por asignatura (por ejemplo −5,00 pp en `college_physics`).
- Alucinacion: no se han publicado mediciones de tasa de alucinacion. Al ser un modelo abliterado, la eliminacion de rechazos puede reducir la tendencia a matizar o declinar respuestas ante incertidumbre.
- Trazabilidad de la variante de razonamiento: en modo xhigh con presupuesto de tokens agotado sin cierre de `</think>`, la evaluacion se hace sobre la traza de razonamiento, lo que complica la comparacion directa con otros modelos evaluados solo sobre la respuesta final.
- Comunidad pequena: 11 likes y 2.189 descargas en el momento de la consulta, con fecha de actualizacion de septiembre de 2026. El soporte y el mantenimiento a largo plazo no estan garantizados.
- Licencia: Apache 2.0 permite uso comercial del bundle, pero las condiciones de la licencia del modelo base (`prism-ml/Ternary-Bonsai-2-27B-mlx-2bit`) no se detallan en la informacion disponible y conviene verificarlas antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/Bonsai-2-27B-CRACK-Ternary-JANG
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Motor de inferencia vMLX: https://vmlx.net
- Apoyo al autor (Ko-fi): https://ko-fi.com/dealignai
- Paper, repositorio y demos: no disponible
- Las busquedas web realizadas no devolvieron enlaces relevantes sobre este modelo.
