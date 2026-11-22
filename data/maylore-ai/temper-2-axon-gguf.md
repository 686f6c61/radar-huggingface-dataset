# maylore-ai/Temper-2-Axon-GGUF

## Resumen

Temper-2-Axon-GGUF es la versión cuantizada en formato GGUF de Temper-2-Axon, un modelo de 1.543.714.304 parámetros (aproximadamente 1,5B) especializado en generación de código Rust. Lo desarrolla maylore-ai y se distribuye bajo licencia Apache 2.0. El modelo base es un fine-tune de Qwen2.5-Coder-1.5B-Instruct, según se desprende de la sección de licencia de la model card, y está orientado a tareas de generación de texto conversacional y código.

El repositorio GGUF incluye dos cuantizaciones: Q8_0 (1,65 GB) y BF16 (3,09 GB), lo que facilita su despliegue en entornos locales mediante llama.cpp, LM Studio u Ollama. El modelo soporta inglés y ruso, y está etiquetado con los tags `rust`, `code` y `conversational`, lo que indica un enfoque claro hacia asistentes de programación en Rust.

Su relevancia actual radica en la escasez de modelos pequeños y abiertos especializados en Rust, un lenguaje con ecosistema de herramientas de IA comparativamente menos maduro que Python o JavaScript. Con 1,5B parámetros y cuantización Q8_0 de menos de 2 GB, es viable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen2.5-Coder-1.5B-Instruct; detalles no disponibles) |
| Parametros totales | 1.543.714.304 (~1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, BF16 |
| Idiomas soportados | Inglés (en), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que el modelo deriva de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only. No se especifican el número de tokens de entrenamiento, la composición del dataset de fine-tuning ni si se emplearon técnicas de RLHF, DPO o instrucción supervisada. La model card remite a la página principal del modelo base (maylore-ai/Temper-2-Axon) para resultados y detalles, que no están incluidos en la información proporcionada.

La innovación destacable es la especialización en Rust sobre una base ya optimizada para código, junto con la distribución en GGUF lista para inferencia local. La temperatura recomendada es 0,2, lo que sugiere un ajuste orientado a respuestas deterministas y precisas, típico de tareas de generación de código.

## Capacidades

- Generación de texto conversacional en inglés y ruso.
- Generación y asistencia en código Rust, su especialidad principal.
- Modo conversacional multi-turno (tag `conversational`).
- Compatible con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- No se documenta soporte explícito de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües limitadas a inglés y ruso según los metadatos.

## Casos de uso

- Asistencia de programación en Rust en el editor: el modelo puede autocompletar y generar fragmentos de código Rust con temperatura baja (0,2) para reducir variabilidad, integrándose vía llama.cpp u Ollama en plugins de IDE.
- Revisión y explicación de código Rust: al ser conversacional y especializado, puede explicar borrow checker, lifetimes y patrones de ownership en inglés o ruso.
- Generación de tests unitarios en Rust: útil en pipelines de CI para proponer casos de prueba sobre funciones existentes.
- Despliegue local en estaciones de trabajo: con Q8_0 (1,65 GB) cabe en GPUs de consumo y permite inferencia offline sin depender de APIs externas.
- Migración de código hacia Rust: puede asistir en la traducción de fragmentos desde otros lenguajes, aunque sin garantías de corrección.
- Chatbot técnico bilingüe (inglés/ruso) para documentación de proyectos Rust: adecuado para equipos con esos idiomas.
- Prototipado rápido en entornos con recursos limitados: su tamaño reducido permite iterar en portátiles con GPU modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la página principal del modelo base para resultados, pero estos no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para Q8_0 y 3,5 GB para BF16, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son compatibles sobradamente.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs discretas modernas e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli -hf maylore-ai/Temper-2-Axon-GGUF:Q8_0 --temp 0.2`), Ollama (`ollama run hf.co/maylore-ai/Temper-2-Axon-GGUF:Q8_0`), LM Studio (requiere fijar temperatura a 0,2 manualmente).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Temper-2-Axon-GGUF | ~1,5B | No disponible | en, ru | Apache 2.0 | GGUF |
| Qwen2.5-Coder-1.5B-Instruct | ~1,5B | No disponible en esta ficha | Multilingüe | Apache 2.0 | safetensors, GGUF |
| Alternativas especializadas en Rust de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

El competidor directo es su modelo base Qwen2.5-Coder-1.5B-Instruct, del que hereda arquitectura y licencia; Temper-2-Axon añade especialización en Rust y ruso. No se dispone de datos de rendimiento comparativo para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Sesgos: no documentados, pero al derivar de Qwen2.5-Coder puede heredar sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: presente como en cualquier modelo de 1,5B; en código puede generar APIs o crates inexistentes.
- Contexto: la longitud de contexto no está especificada, lo que impide planificar usos con documentos largos.
- Idiomas: solo inglés y ruso; no hay soporte declarado de castellano.
- Licencia: Apache 2.0 permite uso comercial, pero las obras derivadas (fine-tunes, merges, cuantizaciones) deben mantener las atribuciones del fichero NOTICE conforme a la sección 4(d).
- En LM Studio la temperatura no se toma del GGUF y arranca en 0,8; es imprescindible ajustarla a 0,2 para el comportamiento previsto.
- Tamaño reducido: capacidad de razonamiento limitada frente a modelos de 7B o superiores; no apto para tareas complejas de arquitectura de software sin supervisión.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/maylore-ai/Temper-2-Axon-GGUF
- Modelo base: https://huggingface.co/maylore-ai/Temper-2-Axon
- Sitio web del modelo: https://maylore.com/temper-2-axon
