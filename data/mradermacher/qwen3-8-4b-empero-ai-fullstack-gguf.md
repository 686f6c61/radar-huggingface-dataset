# mradermacher/Qwen3.8-4B-Empero-AI-FullStack-GGUF

## Resumen

Qwen3.8-4B-Empero-AI-FullStack es un modelo de lenguaje de 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) desarrollado por iBotIA y cuantizado a formato GGUF por mradermacher. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen3.8-4B, especializado mediante destilación en tareas de desarrollo full-stack: TypeScript, React Router v8, NestJS y Flutter. El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en herramientas de desarrollo.

La relevancia de esta ficha radica en que el repositorio original de iBotIA contiene los pesos en formato transformers (safetensors), mientras que esta versión de mradermacher ofrece 12 cuantizaciones GGUF estáticas (desde Q2_K hasta f16) que permiten ejecutar el modelo en hardware de consumo. Con un tamaño de repositorio de 40 GB, el modelo está pensado para su despliegue local mediante llama.cpp u Ollama, sin necesidad de GPU de datacenter.

El modelo está etiquetado con `qwen3_5` como `model_type`, lo que sugiere una arquitectura derivada de la familia Qwen 3.5, aunque no se dispone de documentación técnica detallada sobre la arquitectura interna, el contexto máximo o la composición del dataset de entrenamiento en la información proporcionada. Su orientación a "reasoning" y "distillation" indica que fue entrenado para tareas de razonamiento aplicado a programación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (model_type: qwen3_5; detalles no disponibles) |
| Parámetros totales | 4.326.350.848 (~4,3 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el modelo base |
| Tamaño del repositorio | 40,0 GB |
| Pipeline | text-generation |
| Librería | transformers |
| Modelo base | iBotIA/Qwen3.8-4B-Empero-AI-FullStack |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá del `model_type: qwen3_5` declarado en la model card, que sugiere una variante de la familia Qwen 3.5. El modelo es un fine-tuning del checkpoint iBotIA/Qwen3.8-4B-Empero-AI-FullStack, que a su vez parte de un Qwen3.8-4B. Las etiquetas `distillation`, `reasoning` y `unsloth` indican que el ajuste se realizó mediante destilación de un modelo mayor (probablemente con la librería Unsloth para entrenamiento eficiente), orientado a razonamiento y a dominios concretos de desarrollo full-stack.

El entrenamiento está especializado en un stack técnico concreto: TypeScript, React Router v8, NestJS y Flutter. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La información disponible se limita a las etiquetas y a la naturaleza del fine-tuning por destilación.

## Capacidades

- Generación de texto conversacional en inglés (`conversational`, pipeline `text-generation`).
- Razonamiento especializado en desarrollo full-stack, con énfasis en TypeScript, React Router v8, NestJS y Flutter.
- Generación y asistencia de código en el stack declarado (frontend React/Flutter, backend NestJS/TypeScript).
- Razonamiento multi-paso derivado del entrenamiento por destilación (`reasoning`, `distillation`).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en APIs compatibles con OpenAI.
- Capacidad multilingüe limitada al inglés según el campo `language: en`.
- No se documenta soporte explícito de tool calling, function calling, visión, audio ni modo thinking.

## Casos de uso

- Asistente de código para TypeScript y NestJS: el modelo puede generar controladores, servicios y DTOs en NestJS, así como tipado estricto en TypeScript, gracias a su fine-tuning específico en este framework. Adecuado para autocompletado y generación de boilerplate en el IDE.
- Generación de rutas y componentes con React Router v8: útil para scaffold de aplicaciones React con la versión 8 del router, incluyendo loaders, actions y rutas anidadas, un dominio poco cubierto por modelos generalistas.
- Desarrollo de apps Flutter: asistencia en la generación de widgets, gestión de estado y estructura de proyectos Flutter, aprovechando la especialización del fine-tuning en este SDK.
- Revisión de código en pipelines de CI/CD: integrable como servicio de generación de texto vía endpoints compatibles para sugerir correcciones o explicar diffs en repositorios TypeScript/NestJS.
- Despliegue local en estaciones de desarrollo: con cuantizaciones Q4_K_M de 2,9 GB, puede ejecutarse en portátiles con GPU de consumo o incluso en CPU mediante llama.cpp, ofreciendo asistencia de código sin enviar datos a la nube.
- Prototipado rápido de APIs backend: generación de esqueletos de servicios NestJS con módulos, inyección de dependencias y validación, reduciendo el tiempo de arranque de proyectos.
- Educación y formación en full-stack: el modelo puede explicar conceptos de React Router v8 o NestJS en inglés, sirviendo como tutor técnico en entornos de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,1 GB (Q2_K) y 8,8 GB (f16), pasando por 2,9 GB (Q4_K_M) y 4,7 GB (Q8_0). El tamaño de los pesos GGUF es el factor dominante; la VRAM adicional para el contexto KV depende de la longitud de contexto, que no está documentada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput y contextos largos.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas (GTX 1660 6 GB, RTX 3050 8 GB, RTX 4060 8 GB) con cuantizaciones Q4_K_M o Q5_K_M. Las cuantizaciones Q2_K y Q3_K_S caben incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, aunque esta versión GGUF está pensada para llama.cpp.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo de ~4 B en Q4_K_M suele generar decenas de tokens por segundo en GPU consumer, pero no se aportan mediciones concretas para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| Qwen3.8-4B-Empero-AI-FullStack (este, GGUF) | ~4,3 B | no disponible | Apache 2.0 | GGUF | Full-stack (TS, React Router v8, NestJS, Flutter) |
| Qwen3.8-4B (base) | ~4 B | no disponible | Apache 2.0 (según familia Qwen) | safetensors | Generalista |
| iBotIA/Qwen3.8-4B-Empero-AI-FullStack | ~4,3 B | no disponible | Apache 2.0 | safetensors | Full-stack (checkpoint original) |
| Qwen2.5-Coder-3B / 7B | 3 B / 7 B | 32 K (según familia) | Apache 2.0 | safetensors, GGUF | Código generalista |

La comparativa con modelos de código generalistas como Qwen2.5-Coder es aproximada: este modelo está especializado en un stack muy concreto y no se dispone de benchmarks que permitan comparar su rendimiento en tareas de código generales. Frente al checkpoint original de iBotIA, la diferencia principal es el formato GGUF y la disponibilidad de 12 cuantizaciones para despliegue local.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés (`language: en`); su rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado.
- Al ser un fine-tuning por destilación sobre un stack concreto, puede degradarse fuera de TypeScript, React Router v8, NestJS y Flutter.
- Riesgo de alucinación en APIs y versiones de frameworks: puede generar código con métodos inexistentes o versiones incorrectas de React Router v8 o NestJS.
- No se documenta la longitud de contexto; usar contextos largos sin conocer el límite puede producir degradación silenciosa.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el checkpoint original deben verificarse por si añaden restricciones adicionales.
- El repositorio GGUF tiene 40 GB por incluir todas las cuantizaciones; descargar solo el archivo necesario para evitar consumo de disco.
- No hay benchmarks publicados, por lo que las decisiones de producción deberían basarse en evaluaciones propias.
- El modelo tiene muy poca tracción (474 descargas, 1 like), lo que reduce la validación comunitaria y el soporte disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-4B-Empero-AI-FullStack-GGUF
- Modelo base (checkpoint original): https://huggingface.co/iBotIA/Qwen3.8-4B-Empero-AI-FullStack
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-4B-Empero-AI-FullStack-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-4B-Empero-AI-FullStack-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
