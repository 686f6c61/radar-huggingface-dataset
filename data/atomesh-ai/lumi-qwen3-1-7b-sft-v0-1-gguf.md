# Atomesh-AI/Lumi-Qwen3-1.7B-SFT-v0.1-GGUF

## Resumen

Lumi-Qwen3-1.7B-SFT-v0.1-GGUF es la distribucion en formato GGUF del checkpoint afinado (SFT) Lumi-Qwen3-1.7B-SFT-v0.1, publicado por Atomesh-AI. Se trata de un modelo de 1.720.574.976 parametros (aproximadamente 1,7 mil millones) derivado de la familia Qwen3 y especializado en tareas de asistente de oficina en chino, con soporte declarado de tool calling. El repositorio contiene unicamente los pesos cuantizados para su uso con llama.cpp; las notas de entrenamiento y los pesos originales en Transformers residen en el modelo base.

El modelo resuelve un nicho concreto: escenarios de asistencia administrativa donde la aplicacion anfitriona proporciona documentos, memoria y esquemas de herramientas, y aplica controles de autorizacion para las operaciones de escritura. El autor publica una evaluacion sobre un conjunto congelado de 530 tareas simuladas ejecutadas con llama.cpp sobre una NVIDIA GB10, con resultados que muestran un rendimiento notablemente superior en tool calling que en conversacion multi-turno.

Su relevancia practica radica en el tamano reducido (apto para inferencia local en CPU o GPU de consumo) y en la licencia Apache 2.0, que permite uso comercial sin restricciones adicionales. La informacion disponible es escasa: no hay datos publicados sobre arquitectura interna, composicion del dataset de entrenamiento ni resultados en benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Qwen3; detalles no publicados) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 4096`) |
| Tipos de cuantizacion | BF16 y Q8_0 (publicados en el repo) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en Transformers no se detalla |
| Tamano del repositorio | 5,3 GB |
| Modelo base | Atomesh-AI/Lumi-Qwen3-1.7B-SFT-v0.1 |
| Revision de llama.cpp usada en conversion | `b1b770d90d94cad9e9ea5b993bdbc383a522fb28` |
| SHA-256 del checkpoint fuente | `462c2566b3e4a8e5c7ca5499232c4c56221efc93150d096a02e7169b37c616a8` |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura en la informacion disponible. El nombre del modelo indica que parte de Qwen3, pero el autor no documenta en esta ficha si se trata de un transformer denso convencional, el numero de capas, la dimension oculta ni los mecanismos de atencion empleados. Tampoco se especifica la longitud de contexto nativa del checkpoint.

Respecto al entrenamiento, el sufijo SFT indica un ajuste supervisado (supervised fine-tuning) sobre el checkpoint Qwen3 base, pero no se detalla el volumen de tokens, la composicion del dataset, ni si hubo fases posteriores de RLHF o DPO. La model card menciona que las notas de entrenamiento completas estan en el modelo padre, fuera de la informacion proporcionada. La evaluacion se realizo con la plantilla de chat nativa de Qwen3 y el modo de razonamiento (thinking) desactivado, lo que sugiere que el modelo conserva la plantilla de Qwen3 y la posibilidad de activar dicho modo, aunque no se confirma su funcionamiento en este checkpoint.

## Capacidades

- Generacion de texto conversacional en chino e ingles.
- Tool calling / function calling: capacidad declarada y evaluada de forma explicita (126/150 en el conjunto de prueba).
- Asistencia de oficina: el modelo esta disenado para operar con documentos, memoria y esquemas de herramientas proporcionados por la aplicacion anfitriona.
- Razonamiento multi-turno: soportado, aunque con rendimiento medido bajo (17/75 en BF16 y 20/75 en Q8_0).
- Integracion con llama.cpp mediante `llama-server` y plantilla de chat nativa de Qwen3.
- Modo thinking: la evaluacion lo desactiva; no se documenta su comportamiento con thinking activado.
- No se declaran capacidades de vision, audio ni otras modalidades.
- No se declaran capacidades de codigo o matematicas mas alla de lo implicito en el modelo base.

## Casos de uso

- Asistente administrativo con tool calling: el modelo puede invocar funciones definidas por la aplicacion (consulta de documentos, creacion de registros) con una tasa de exito medida del 84 % (126/150) en el conjunto de evaluacion, lo que lo hace adecuado para flujos donde la aplicacion valida y autoriza cada escritura.
- Automatizacion de tramites internos en chino: al estar especializado en tareas de oficina en chino, encaja en backends de gestion documental donde el usuario describe una operacion y el modelo selecciona la herramienta adecuada.
- Despliegue local en equipos sin GPU dedicada: con cuantizacion Q8_0 (1,83 GB) puede ejecutarse en CPU mediante llama.cpp, util para entornos de escritorio o portatiles con recursos limitados.
- Prototipado rapido de agentes: su tamano de 1,7 B permite iterar sobre esquemas de herramientas y prompts en local antes de migrar a modelos mayores, usando el mismo formato GGUF.
- Servicio de bajo coste en edge: el checkpoint Q8_0 ocupa menos de 2 GB, lo que facilita su empaquetado en contenedores ligeros o dispositivos con memoria restringida.
- Filtrado y clasificacion de solicitudes administrativas: la combinacion de comprension de documentos y salida estructurada via tool calling permite enrutar peticiones hacia el sistema correspondiente.
- Evaluacion comparativa de cuantizaciones: el repositorio publica resultados para BF16 y Q8_0 sobre la misma suite, lo que permite medir el impacto de la cuantizacion en tareas de tool calling antes de adoptar una u otra.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a una suite congelada de 530 tareas simuladas, ejecutada con llama.cpp sobre una NVIDIA GB10, con thinking desactivado:

| Precision | Bytes | Global | Tool calling | Multi-turno |
|---|---:|---:|---:|---:|
| BF16 | 3.447.349.280 | 259/530 | 126/150 | 17/75 |
| Q8_0 | 1.834.426.400 | 263/530 | 126/150 | 20/75 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La latencia en telefono y el uso de memoria no se han medido segun el autor. No se ofrecen comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,5 GB para BF16 y 1,9 GB para Q8_0 solo en pesos; debe anadirse la memoria del contexto KV (no cuantificada en los datos publicados).
- GPU recomendadas: el autor solo documenta pruebas en NVIDIA GB10. Por tamano, cualquier GPU con 4 GB o mas de VRAM deberia poder alojar Q8_0; para BF16 se recomienda un minimo de 6 GB para dejar margen al contexto.
- GPU de consumo: si, cabe en tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores; tambien en iGPU con memoria unificada suficiente.
- CPU: viable con llama.cpp en Q8_0 gracias a su tamano inferior a 2 GB.
- Opciones de despliegue: llama.cpp (`llama-server`), y por compatibilidad de formato, cualquier runtime que consuma GGUF (Ollama, entre otros), aunque el autor solo documenta llama.cpp.
- Latencia y throughput: no disponibles; el autor indica que la latencia en telefono y el uso de memoria no se han medido.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. A continuacion se comparan unicamente caracteristicas objetivas conocidas:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Lumi-Qwen3-1.7B-SFT-v0.1-GGUF | 1,72 B | no disponible | zh, en | Apache 2.0 | GGUF |
| Qwen3-1.7B (referencia de la familia) | 1,7 B (aprox.) | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |
| Alternativas de ~1-2 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado comparaciones de rendimiento con otros modelos en la informacion disponible.

## Limitaciones y advertencias

- Rendimiento multi-turno bajo: 17/75 en BF16 y 20/75 en Q8_0 sobre la suite del autor, lo que desaconseja su uso en conversaciones largas o con dependencia fuerte del historial.
- Especializacion estrecha: el modelo esta orientado a tareas de oficina en chino; su comportamiento en otros dominios o en ingles no esta evaluado.
- Idiomas limitados a chino e ingles; no se declara soporte de castellano ni de otras lenguas.
- Riesgo de alucinacion no cuantificado: no se publican metricas de fidelidad factual ni de tasa de alucinacion.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Dependencia de la aplicacion anfitriona: el propio autor indica que la aplicacion proporciona documentos, memoria y esquemas de herramientas y aplica la autorizacion de escrituras; el modelo por si solo no garantiza seguridad en operaciones de escritura.
- Contexto no documentado: se desconoce la ventana nativa; el ejemplo de despliegue fija 4096 tokens, lo que puede no reflejar el maximo soportado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3 puede tener sus propias condiciones que conviene verificar en el repositorio del modelo padre.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Verificacion de integridad: el autor publica `SHA256SUMS`; conviene comprobar los pesos antes de desplegarlos en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Atomesh-AI/Lumi-Qwen3-1.7B-SFT-v0.1-GGUF
- Modelo base (Transformers): https://huggingface.co/Atomesh-AI/Lumi-Qwen3-1.7B-SFT-v0.1
- Sumas de verificacion: https://huggingface.co/Atomesh-AI/Lumi-Qwen3-1.7B-SFT-v0.1-GGUF/blob/main/SHA256SUMS
- llama.cpp: https://github.com/ggml-org/llama.cpp (revision usada en la conversion: `b1b770d90d94cad9e9ea5b993bdbc383a522fb28`)
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada.
