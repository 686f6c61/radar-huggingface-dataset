# maylore-ai/Temper-2-Sapient-GGUF

## Resumen

Temper-2-Sapient-GGUF es la versión cuantizada en formato GGUF de Temper-2-Sapient, un modelo de 7B parámetros especializado en generación de código Rust desarrollado por maylore-ai. El modelo parte de Qwen2.5-Coder-7B-Instruct como base y se ha afinado específicamente para tareas de programación en Rust, un nicho con escasa representación en los modelos generalistas. Esta versión GGUF está pensada para inferencia local con llama.cpp, Ollama y LM Studio, e incluye únicamente dos cuantizaciones: Q8_0 (8,10 GB) y BF16 (15,24 GB).

El modelo cuenta con 7.615.616.512 parámetros totales según los pesos en safetensors del modelo base, y se distribuye bajo licencia Apache 2.0, la misma que Qwen2.5-Coder-7B-Instruct. Soporta inglés y ruso, y está etiquetado con compatibilidad para endpoints conversacionales. Su relevancia radica en ofrecer una alternativa abierta y ligera para asistentes de código Rust que puedan ejecutarse en hardware de consumo, aunque el repo no publica resultados de benchmarks propios en esta ficha.

La información disponible es limitada: la model card remite a la página principal del modelo base para resultados y detalles técnicos, y no se especifican la longitud de contexto, la composición del dataset de entrenamiento ni los métodos de alineación empleados. Esta ficha refleja únicamente los datos verificables en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen2.5-Coder-7B-Instruct) |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (8,10 GB), BF16 (15,24 GB) |
| Idiomas soportados | inglés (en), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo base Temper-2-Sapient deriva de Qwen2.5-Coder-7B-Instruct, por lo que cabe esperar una arquitectura transformer decoder-only con aproximadamente 7,6 mil millones de parámetros, pero este dato no se confirma explícitamente en la información disponible. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado.

La model card indica que el modelo está especializado en código Rust y que los resultados y detalles se encuentran en la página principal del modelo base (maylore.com/temper-2-sapient). La configuración de inferencia recomendada es temperatura 0,2, top_p 0,95, top_k 20 y repeat_penalty 1,1, que corresponden a los ajustes usados para los resultados publicados. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y código, con especialización declarada en Rust.
- Generación de código en otros lenguajes presumiblemente heredada del modelo base Qwen2.5-Coder, aunque no se detalla en la información disponible.
- Conversación multi-turno (etiqueta `conversational` y compatibilidad con endpoints).
- Soporte multilingüe limitado a inglés y ruso según los metadatos.
- No se documenta soporte explícito de tool calling, function calling, agentes o razonamiento multi-paso en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Asistencia de código Rust en local: el modelo puede generar y completar fragmentos de Rust ejecutándose con Ollama o llama.cpp en hardware de consumo, gracias a su tamaño de 7B y a la cuantización Q8_0 de 8,10 GB.
- Revisión y refactorización de código Rust: puede emplearse para proponer mejoras idiomáticas y detectar patrones no idiomáticos en bases de código Rust, aprovechando su ajuste específico al lenguaje.
- Integración en editores e IDE: al ser compatible con endpoints conversacionales y con LM Studio, puede conectarse a extensiones de asistencia de código que consuman una API compatible con OpenAI.
- Generación de documentación técnica: puede redactar comentarios y documentación para crates y módulos Rust en inglés o ruso.
- Enseñanza de Rust: útil como tutor conversacional para explicar conceptos del lenguaje, con la configuración de temperatura baja recomendada para respuestas más deterministas.
- Prototipado de pipelines de código en CI: puede integrarse en scripts de revisión automatizada de pull requests en proyectos Rust, siempre que se validen las salidas antes de aplicarlas.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con pesos abiertos, permite procesar código propietario sin enviarlo a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la página del modelo base (maylore.com/temper-2-sapient) para consultar los resultados, pero no se incluyen cifras en esta ficha.

## Requisitos de hardware

- VRAM estimada para Q8_0: aproximadamente 8,10 GB de pesos más overhead de contexto y KV cache; en la práctica, se recomienda al menos 10-12 GB de VRAM para contextos moderados.
- VRAM estimada para BF16: aproximadamente 15,24 GB de pesos, lo que requiere GPUs de 24 GB o más para trabajar con comodidad.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para BF16; RTX 4080, RTX 4070 Ti o GPUs con 12-16 GB para Q8_0.
- Cabe en GPU de consumo: sí, la cuantización Q8_0 es viable en GPUs consumer de gama alta con 12 GB o más; BF16 requiere 24 GB.
- Opciones de despliegue: llama.cpp (`llama-cli -hf maylore-ai/Temper-2-Sapient-GGUF:Q8_0`), Ollama (`ollama run hf.co/maylore-ai/Temper-2-Sapient-GGUF:Q8_0`) y LM Studio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Temper-2-Sapient-GGUF | 7,6B | no disponible | Rust / código | Apache 2.0 | GGUF |
| Qwen2.5-Coder-7B-Instruct | ~7,6B | no disponible en esta ficha | Código general | Apache 2.0 | safetensors, GGUF |
| Alternativas de código 7B | no disponible | no disponible | Código general | no disponible | no disponible |

La comparativa se limita al modelo base declarado, Qwen2.5-Coder-7B-Instruct, del que Temper-2-Sapient hereda licencia y presumiblemente arquitectura. No se dispone de datos de rendimiento comparado ni de otras alternativas verificables en la información proporcionada.

## Limitaciones y advertencias

- La información técnica publicada es escasa: no se documentan contexto, dataset de entrenamiento ni benchmarks en esta ficha.
- Especialización estrecha en Rust: su rendimiento en otros lenguajes o tareas generales no está documentado y podría ser inferior al de modelos generalistas.
- Idiomas limitados a inglés y ruso según los metadatos; el soporte de castellano no está declarado.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en APIs de crates y firmas de funciones; se recomienda validar el código generado.
- La temperatura recomendada es 0,2; LM Studio no la aplica automáticamente y arranca en 0,8, lo que puede degradar la calidad de las respuestas si no se ajusta manualmente.
- Licencia Apache 2.0: permite uso comercial, pero las obras derivadas, incluidas fine-tunes, merges y cuantizaciones, deben mantener las atribuciones del archivo NOTICE conforme a la sección 4(d) de la licencia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/maylore-ai/Temper-2-Sapient-GGUF
- Modelo base: https://huggingface.co/maylore-ai/Temper-2-Sapient
- Página del modelo: https://maylore.com/temper-2-sapient
- Modelo base declarado (Qwen2.5-Coder-7B-Instruct): no se proporciona enlace directo en la información disponible.
