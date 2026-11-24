# Edge0/Edge0-120B-NVFP4

## Resumen

Edge0-120B-NVFP4 es un modelo de generación de texto publicado por Edge0, un proyecto orientado a la inferencia en el borde (edge inference). Se trata de una cuantización de 4 bits en formato NVFP4 del modelo base Qwen/Qwen3.8-Flash-Next, una arquitectura Mixture-of-Experts (MoE) con atención latente según las etiquetas del autor. El modelo está pensado para tareas de agente y generación de código, y se distribuye con la librería propietaria `edge0` y una licencia comunitaria propia (`edge0-community-model-1.0`).

La relevancia del modelo radica en su orientación a despliegues con recursos limitados: la cuantización NVFP4 (formato de coma flotante de 4 bits de NVIDIA) busca reducir la huella de memoria manteniendo la calidad del modelo base. El repositorio ocupa 102,6 GB, lo que sugiere pesos de gran tamaño pese a la cuantización, coherente con un modelo de escala grande (el nombre comercial indica 120B, aunque el dato real de safetensors reporta 4.947.698.560 parámetros, una discrepancia que conviene tener en cuenta).

El modelo acumula 8.776 descargas y 57 likes en el momento de la consulta, con actualización reciente (noviembre de 2026). No obstante, la información pública disponible es escasa: no se detallan idiomas, benchmarks ni composición del dataset de entrenamiento, y la model card contiene principalmente estilos CSS y metadatos sin datos técnicos sustantivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención latente, según etiquetas del autor; transformer (no confirmado en detalle) |
| Parametros totales | 4.947.698.560 (dato real de safetensors); el nombre comercial indica 120B (discrepancia no aclarada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato de coma flotante de NVIDIA); también se distribuye en GGUF según etiquetas |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-1.0 (licencia comunitaria propia, marcada como "other") |
| Formato de pesos | safetensors y GGUF (según etiquetas); librería `edge0` |

## Arquitectura y entrenamiento

El modelo es una cuantización del base Qwen/Qwen3.8-Flash-Next. Las etiquetas del autor indican arquitectura MoE con "latent-moe" y cuantización de 4 bits NVFP4, un formato de coma flotante de 4 bits orientado a aceleradores NVIDIA. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se detalla si la cuantización se aplicó mediante GPTQ, AWQ u otro método, ni si se realizó calibración específica.

La innovación principal declarada es la inferencia en el borde ("edge-inference") con cuantización de 4 bits, lo que apunta a reducir el coste de memoria y facilitar el despliegue en hardware con VRAM limitada. No obstante, la model card no aporta detalles técnicos sobre el proceso de cuantización, la pérdida de calidad respecto al modelo base ni las condiciones de calibración.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento y generación de código (etiquetas `coding` y `agent`).
- Soporte declarado para flujos de agente y razonamiento multi-paso (etiqueta `agent`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Inferencia en el borde con cuantización de 4 bits (etiqueta `edge-inference`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de asistencia a la programación y revisión de código, apoyándose en su orientación declarada a tareas de coding y su compatibilidad con endpoints.
- Agentes autónomos multi-paso: la etiqueta `agent` sugiere su uso en orquestación de tareas con varios pasos, aunque no se detalla el soporte de tool calling.
- Asistentes conversacionales: el pipeline de text-generation y la etiqueta `conversational` permiten desplegarlo en interfaces de chat, siempre que se valide la longitud de contexto real.
- Despliegue en el borde: gracias a la cuantización NVFP4, puede ejecutarse en entornos con VRAM reducida, como estaciones de trabajo con GPU de consumo o servidores de borde.
- Prototipado rápido con GGUF: la disponibilidad de pesos GGUF permite probar el modelo en llama.cpp u Ollama antes de pasar a producción.
- Investigación sobre cuantización: útil para estudiar la degradación de calidad de NVFP4 frente al modelo base Qwen3.8-Flash-Next en tareas de código y razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma fiable. El repositorio ocupa 102,6 GB, lo que sugiere que la inferencia requiere al menos esa cantidad de memoria si se cargan todos los pesos, aunque la cuantización NVFP4 y la arquitectura MoE podrían reducir la huella efectiva. No se confirma.
- GPU recomendadas: no disponible. Por el formato NVFP4, se espera compatibilidad con aceleradores NVIDIA recientes (arquitectura Blackwell o superior), pero no se confirma en la información.
- ¿Cabe en GPU de consumo? No disponible; el tamaño del repositorio hace improbable su ajuste en GPU de consumo de 24 GB sin cuantización adicional u offloading.
- Opciones de despliegue: librería `edge0` (propietaria); también GGUF, lo que permitiría llama.cpp u Ollama. vLLM y TGI no se mencionan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Edge0-120B-NVFP4 | 4,95B reales (nombre indica 120B) | no disponible | edge0-community-model-1.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de 4 bits tipo GPTQ/AWQ de modelos MoE | no disponible | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento ni de contexto para establecer una comparación cuantitativa con alternativas. La comparación más directa es con su modelo base Qwen3.8-Flash-Next, pero no se han publicado métricas de la degradación introducida por la cuantización NVFP4.

## Limitaciones y advertencias

- Discrepancia entre el nombre comercial (120B) y el recuento real de parámetros en safetensors (4,95B): conviene verificar qué se está descargando realmente.
- La model card no aporta información sustantiva sobre entrenamiento, datos, idiomas ni benchmarks; la evaluación independiente es imprescindible.
- Licencia comunitaria propia (`edge0-community-model-1.0`): es necesario revisar el archivo LICENSE antes de cualquier uso comercial, ya que las condiciones no están resumidas en la información disponible.
- La cuantización NVFP4 puede degradar la calidad respecto al modelo base, especialmente en tareas de razonamiento y código; no se han publicado métricas de dicha degradación.
- Dependencia de la librería propietaria `edge0` para el formato nativo, lo que puede limitar la portabilidad frente a ecosistemas estándar.
- Riesgo de alucinación y sesgos: no evaluado ni documentado.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento adecuado en castellano sin pruebas previas.

## Enlaces

- Hugging Face: https://huggingface.co/Edge0/Edge0-120B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: archivo LICENSE en el repositorio de Hugging Face
- Paper, blog, repositorio o demo: no disponible en la información proporcionada.
