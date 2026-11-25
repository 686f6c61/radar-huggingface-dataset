# lodrick-the-lafted/Qwen3.5-4B-GLB-3D-Coder-exl3-5bpw

## Resumen

Qwen3.5-4B-GLB-3D-Coder-exl3-5bpw es una cuantización de 5 bits en formato EXL3 del modelo ccore/Qwen3.5-4B-GLB-3D-Coder, un modelo de código especializado de 4B parámetros (2.199.007.232 parámetros reales según los pesos safetensors) para la generación de activos 3D de baja poligonización y escenas procedurales. Lo publica lodrick-the-lafted como cuantización comunitaria del modelo original de CCORE, a su vez un ajuste fino de Qwen/Qwen3.5-4B. El modelo recibe una descripción en lenguaje natural y genera una página HTML/JavaScript completa con Three.js que incluye una vista previa y un botón de exportación GLB, de modo que el usuario puede inspeccionar el resultado y exportar el activo para Godot u otro editor compatible con GLB.

El problema que resuelve es muy concreto: eliminar la brecha entre una idea textual de un activo (personaje, utilería, edificio, entorno) y un fichero GLB editable, sin necesidad de un artista 3D ni de un pipeline de modelado. El modelo está entrenado sobre un dataset propio de 3.918 ejemplos validados y renderizados en 40 dominios, con exportaciones GLB verificadas, lo que lo aleja de los modelos de código generalistas que rara vez producen geometría procedural funcional.

Esta ficha documenta la cuantización EXL3 de 5.0 bpw, pensada para ejecución con el runtime ExLlamaV3 en GPUs de consumo. La relevancia actual radica en su tamaño reducido (4.4 GB de repositorio), su licencia Apache 2.0 y su enfoque vertical en un nicho de generación de activos 3D vía código Three.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-4B); pesos cuantizados en EXL3 |
| Parametros totales | 2.199.007.232 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | EXL3 5.0 bpw (esta publicacion); el modelo base ofrece Q4_K_M, Q8_0 y safetensors originales |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3, 5 bits) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only procedente de Qwen/Qwen3.5-4B, ajustado por CCORE para la tarea de generación de código Three.js orientado a activos 3D. Esta publicación concreta es una cuantización EXL3 a 5.0 bits por peso del checkpoint ccore/Qwen3.5-4B-GLB-3D-Coder, realizada por lodrick-the-lafted; no se trata de un modelo entrenado desde cero ni de un ajuste adicional, sino de una compresión del checkpoint original para su ejecución con ExLlamaV3.

El ajuste original de CCORE se entrenó sobre el dataset CCORE ThreeJS-3D-GLB-Assets, compuesto por 3.918 ejemplos probados y renderizados en 40 dominios, con exportaciones GLB validadas. La model card no detalla el número total de tokens, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. La innovación técnica destacable no está en la arquitectura sino en el formato de salida aprendido: el modelo produce una página HTML/JavaScript autocontenida con Three.js que renderiza el activo, incluye controles de vista previa y un botón de exportación GLB, lo que convierte la generación de código en un pipeline de creación de activos verificable visualmente.

## Capacidades

- Generación de código Three.js: produce páginas HTML/JavaScript completas con escena, cámara, iluminación y geometría procedural.
- Generación de activos 3D de baja poligonización: personajes, utilería, edificios y entornos a partir de una descripción textual.
- Exportación GLB: el código generado incluye un botón de exportación que serializa la escena a GLB para su uso en Godot u otros editores.
- Escenas procedurales: composición de múltiples objetos, materiales y disposición espacial en una sola página.
- Interpretación de prompts detallados: la model card muestra ejemplos con especificaciones de proporciones, rutas de cables, montaje de equipo y plausibilidad mecánica.
- Generación de texto y conversación: pipeline text-generation con soporte conversacional según los tags.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; la model card menciona el uso con arneses de orquestación externos, no una capacidad nativa del modelo.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking, visión o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Creación rápida de activos para prototipos de juego: un diseñador describe un prop o personaje y obtiene una página Three.js con el activo renderizado y exportable a GLB, que se importa directamente en Godot para iterar sobre el bloqueo de niveles sin pasar por modelado manual.
- Poblar escenas de baja poligonización: para entornos con requisitos de rendimiento ajustados (juegos web, móvil), el modelo genera geometría de bajo recuento de polígonos coherente con el estilo, reduciendo el tiempo de producción de arte de entorno.
- Generación de utilería variada en lote: con prompts parametrizados sobre los 40 dominios del dataset (personajes, edificios, vegetación, vehículos), se pueden producir catálogos de activos base que luego un artista refina.
- Integración en pipelines de agentes de código: la model card documenta un arnés de orquestación que conecta un agente de código a una API local del modelo para construir un juego completo; el modelo actúa como generador de activos dentro de ese flujo.
- Educación y demostraciones de gráficos 3D: el HTML generado es autocontenido y ejecutable en navegador, lo que sirve para enseñar conceptos de Three.js, geometría procedural y exportación GLB con ejemplos funcionales.
- Pruebas de concepto de escenas procedurales: para validar ideas de niveles o composiciones espaciales antes de comprometer recursos de arte, el modelo produce una escena navegable en minutos.
- Ejecución local en hardware modesto: al ser una cuantización de 5 bpw de un modelo de 2.199 millones de parámetros, cabe en GPUs de consumo y permite iterar sin coste de API, algo relevante para estudios pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye comparaciones visuales cualitativas con DeepSeek V4.1 Flash 1017 sobre los mismos prompts (por ejemplo, "Create a coral-armored lighthouse keeper" o "Create a frozen goblin watch camp"), pero no reporta métricas numéricas de MMLU, HumanEval, GSM8K ni de calidad de malla o validez de exportación GLB.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 4.4 GB en pesos EXL3 de 5.0 bpw; se debe reservar VRAM adicional para la caché KV, cuyo tamaño depende de la longitud de contexto (no documentada) y del batch.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para el modelo en solitario; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para mayor margen de contexto y batch. Para despliegue en servidor, A100 o H100 no son necesarias dado el tamaño, pero permiten mayor concurrencia.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 8 GB o más, al tratarse de un modelo de 2.199 millones de parámetros a 5 bits.
- Opciones de despliegue: el formato EXL3 requiere ExLlamaV3 (o el runtime compatible con EXL3); las versiones Q4_K_M y Q8_0 del modelo base son compatibles con llama.cpp, Ollama y LM Studio. vLLM y TGI no soportan EXL3 de forma nativa según la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-GLB-3D-Coder-exl3-5bpw (esta ficha) | 2.199 M | No disponible | Codigo Three.js y activos GLB | Apache 2.0 | EXL3 5 bpw |
| ccore/Qwen3.5-4B-GLB-3D-Coder | No disponible | No disponible | Codigo Three.js y activos GLB | Apache 2.0 | safetensors, GGUF (Q4_K_M, Q8_0) |
| Qwen/Qwen3.5-4B | No disponible | No disponible | Proposito general (base) | No disponible en la informacion proporcionada | safetensors |
| DeepSeek V4.1 Flash 1017 | No disponible | No disponible | Proposito general | No disponible en la informacion proporcionada | No disponible |

La comparación con DeepSeek V4.1 Flash 1017 solo está documentada de forma cualitativa mediante capturas de los mismos prompts en la model card; no hay métricas que permitan una comparación cuantitativa. Frente al modelo base sin cuantizar, esta versión EXL3 reduce el peso a 4.4 GB a cambio de una posible pérdida de precisión no cuantificada en la información disponible.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado para generar código Three.js y activos GLB; su rendimiento en tareas de código general, matemáticas o razonamiento fuera de ese dominio no está documentado y probablemente sea inferior al de su base Qwen3.5-4B.
- Idioma: solo se declara inglés, por lo que los prompts en castellano pueden degradar la calidad de la geometría y del código generado.
- Riesgo de alucinación: como todo modelo generativo de código, puede producir JavaScript que no se ejecuta, APIs de Three.js inexistentes o geometría que no exporta correctamente a GLB; la validación visual y la prueba de exportación son imprescindibles.
- Cuantización: la pérdida de precisión de EXL3 a 5.0 bpw respecto al safetensors original no está cuantificada en la información disponible; para producción con requisitos estrictos de fidelidad conviene evaluar contra Q8_0 o los pesos originales.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar prompts largos o conversaciones multi-turno extensas con garantías.
- Dependencia de runtime: el formato EXL3 exige ExLlamaV3; no es portable a llama.cpp, Ollama o LM Studio, a diferencia de las versiones GGUF del modelo base.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 25 de noviembre de 2026; es una publicación reciente sin validación comunitaria.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-4B y del checkpoint original de CCORE, así como la licencia del dataset de entrenamiento.
- La model card del modelo base advierte de que los pesos anteriores al 5 de noviembre de 2026 deben descargarse de nuevo; conviene confirmar que esta cuantización se generó a partir del checkpoint actualizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lodrick-the-lafted/Qwen3.5-4B-GLB-3D-Coder-exl3-5bpw
- Modelo base (checkpoint original): https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/ccore/ThreeJS-3D-GLB-Assets
- Demo jugable RIFTWARD: https://huggingface.co/spaces/ccore/RIFTWARD
- Prompt de inicio para agentes de código: https://huggingface.co/spaces/ccore/RIFTWARD/blob/main/agent-starter-prompt.txt
- Demo RPG 3D de Naoki Kishida: https://kishida.github.io/webdemos/rpg-3d-glb/
