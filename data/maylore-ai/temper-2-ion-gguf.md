# maylore-ai/Temper-2-Ion-GGUF

## Resumen

Temper-2-Ion-GGUF es la version cuantizada en formato GGUF de Temper-2-Ion, un modelo de 0,5B parametros especializado en generacion de codigo Rust. Lo desarrolla maylore-ai y se distribuye bajo licencia Apache 2.0. El modelo base es un fine-tune sobre Qwen2.5-Coder-0.5B-Instruct, segun se indica en la propia model card al referirse a la licencia heredada. Su proposito es ofrecer asistencia de codigo Rust en entornos con recursos muy limitados, incluyendo ejecucion local en CPU mediante llama.cpp, Ollama o LM Studio.

El repositorio contiene unicamente dos ficheros de pesos: una cuantizacion Q8_0 de 532 MB y una version BF16 de 994 MB. El modelo completo tiene 494.032.768 parametros (aproximadamente 0,5B) y soporta ingles y ruso como idiomas declarados. La ventana de contexto no se especifica en la informacion disponible, aunque al derivar de Qwen2.5-Coder-0.5B-Instruct es probable que herede su configuracion, dato que no podemos confirmar con la informacion proporcionada.

Su relevancia actual radica en la combinacion de tamano minimo, licencia permisiva y especializacion en un lenguaje concreto (Rust), lo que lo hace util para autocompletado, generacion de fragmentos y tareas acotadas de codigo en hardware de consumo o incluso sin GPU. La temperatura recomendada por el autor es 0,2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen2.5-Coder-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y BF16 (en este repositorio GGUF) |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El modelo base declarado es maylore-ai/Temper-2-Ion, y la licencia del repositorio GGUF indica explicitamente que se mantiene la de Qwen2.5-Coder-0.5B-Instruct, lo que sugiere que Temper-2-Ion es un fine-tune de ese modelo. Qwen2.5-Coder-0.5B-Instruct es un transformer decoder-only, pero no podemos confirmar los detalles exactos de la arquitectura final ni si se modifico durante el ajuste.

Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La unica informacion tecnica adicional es la recomendacion de temperatura 0,2 y la orientacion del modelo hacia codigo Rust. No se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y codigo, con especializacion en Rust segun la model card.
- Generacion de codigo en el contexto de conversaciones multi-turno (tag "conversational").
- Soporte de ingles y ruso.
- Compatible con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue en infraestructuras tipo API.
- Ejecucion en CPU y GPU mediante llama.cpp, Ollama y LM Studio.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Autocompletado de codigo Rust en el editor: con 0,5B parametros y una cuantizacion Q8_0 de 532 MB, puede ejecutarse localmente en el portatil del desarrollador y ofrecer sugerencias de baja latencia sin enviar codigo a la nube.
- Generacion de fragmentos y boilerplate en Rust: util para crear estructuras, traits, implementaciones de `From`/`Into` o bloques de manejo de errores en proyectos con mucho codigo repetitivo.
- Asistencia en CI/CD para revision de diffs: el modelo puede integrarse en pipelines que generen resumenes o sugerencias sobre cambios en ficheros `.rs`, gracias a su bajo coste de inferencia.
- Educacion y aprendizaje de Rust: al ser pequeno y ejecutable en local, sirve como tutor basico para explicar fragmentos de codigo o proponer ejercicios, con la advertencia de que puede alucinar APIs.
- Prototipado rapido en entornos sin GPU: la version Q8_0 funciona en CPU mediante llama.cpp u Ollama, lo que permite desplegarlo en servidores modestos o contenedores sin acelerador.
- Traduccion tecnica ingles-ruso en contextos de codigo: el soporte declarado de ambos idiomas permite generar comentarios o documentacion bilingue para proyectos Rust.
- Pruebas de concepto de agentes de codigo: su compatibilidad con endpoints y su tamano permiten usarlo como modelo de respaldo o de bajo coste en flujos de generacion de parches.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,6 GB para Q8_0 y 1,1 GB para BF16, incluyendo overhead de runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien funciona en CPU sin GPU dedicada.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1050, RTX 3060, RTX 4090, Apple Silicon, etc.).
- Opciones de despliegue: llama.cpp (`llama-cli -hf maylore-ai/Temper-2-Ion-GGUF:Q8_0 --temp 0.2`), Ollama (`ollama run hf.co/maylore-ai/Temper-2-Ion-GGUF:Q8_0`), LM Studio (requiere fijar temperatura a 0,2 manualmente) y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera inferencia en tiempo real en CPU moderna y muy rapida en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Temper-2-Ion-GGUF | 0,49B | no disponible | en, ru | Apache 2.0 | GGUF |
| Qwen2.5-Coder-0.5B-Instruct | 0,49B | no disponible en esta ficha | multilingue | Apache 2.0 | safetensors, GGUF |
| Otros modelos de codigo <1B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con Qwen2.5-Coder-0.5B-Instruct es la mas directa, ya que Temper-2-Ion deriva de el. La diferencia principal es la especializacion en Rust y la recomendacion de temperatura baja (0,2). No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Riesgo de alucinacion elevado en un modelo de 0,5B: puede inventar APIs de Rust, crates o firmas de funciones inexistentes.
- Capacidad de razonamiento limitada por el tamano; no es adecuado para tareas complejas de arquitectura de software ni para refactorizaciones extensas.
- Idiomas limitados a ingles y ruso; el castellano no esta declarado como soportado.
- Longitud de contexto no documentada; conviene verificar experimentalmente el limite efectivo antes de usarlo en produccion.
- Licencia Apache 2.0: permite uso comercial, pero las obras derivadas deben mantener las atribuciones indicadas en el fichero NOTICE (seccion 4(d) de la licencia).
- La temperatura debe fijarse manualmente a 0,2 en LM Studio, ya que esta herramienta no la lee del GGUF.
- No se documentan sesgos especificos; al derivar de Qwen2.5-Coder, podria heredar sesgos de su dataset de entrenamiento, no verificables con la informacion disponible.
- No dispone de tool calling ni capacidades de agente documentadas, lo que limita su uso en flujos automatizados complejos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/maylore-ai/Temper-2-Ion-GGUF
- Modelo base: https://huggingface.co/maylore-ai/Temper-2-Ion
- Sitio web del autor: https://maylore.com/temper-2-ion
- Modelo de referencia (Qwen2.5-Coder-0.5B-Instruct): no se proporciona enlace directo en la informacion disponible.
