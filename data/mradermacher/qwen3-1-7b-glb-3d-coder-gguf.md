# mradermacher/Qwen3-1.7B-GLB-3D-Coder-GGUF

## Resumen

Qwen3-1.7B-GLB-3D-Coder-GGUF es una versión cuantizada en formato GGUF del modelo ccore/Qwen3-1.7B-GLB-3D-Coder, un ajuste fino (fine-tune) del modelo base Qwen3 de 1.700 millones de parámetros orientado a la generación de código para gráficos 3D, concretamente para Three.js y assets en formato GLB, con soporte adicional para Godot. El modelo original fue desarrollado por ccore y entrenado sobre el dataset ccore/ThreeJS-3D-GLB-Assets, y esta variante GGUF ha sido producida por mradermacher, un conocido cuantizador de la comunidad open source.

La relevancia de esta ficha radica en que se trata de un modelo especializado de nicho (generación de escenas 3D y assets GLB) construido sobre una base compacta de 1.7B parámetros, lo que permite ejecutarlo en hardware de consumo. Al estar cuantizado en múltiples niveles (desde Q2_K hasta f16), ofrece opciones que van desde 0.9 GB hasta 3.5 GB de peso en disco, facilitando el despliegue local con llama.cpp u Ollama.

No se dispone de información sobre el pipeline de inferencia, los resultados de benchmarks ni las especificaciones detalladas de contexto del modelo base en la información proporcionada; los datos que siguen se limitan a lo publicado en la model card y en los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3; detalles específicos de atención no disponibles) |
| Parámetros totales | 1.720.574.976 (1.7B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |
| Tamaño del repo | 16.0 GB |
| Modelo base | ccore/Qwen3-1.7B-GLB-3D-Coder |
| Dataset de entrenamiento | ccore/ThreeJS-3D-GLB-Assets |
| Librería | transformers |
| Etiquetas | code, threejs, 3d, glb, godot |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3 de 1.7B parámetros, un transformer decoder-only. El autor original (ccore) realizó un ajuste fino sobre esta base para especializarla en la generación de código Three.js, assets GLB y contenido relacionado con Godot, empleando el dataset ccore/ThreeJS-3D-GLB-Assets. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La contribución de mradermacher consiste en la cuantización estática del modelo base a formato GGUF mediante el pipeline de conversión de Hugging Face a GGUF (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1). No se han generado, según la model card, cuantizaciones ponderadas/imatrix en el momento de la publicación; solo cuantizaciones estáticas. No se documentan innovaciones técnicas adicionales (decodificación especulativa, attention linear, etc.) en la información disponible.

## Capacidades

- Generación de código para Three.js: creación de escenas, geometrías, materiales, luces y animaciones en JavaScript.
- Generación y manipulación de assets en formato GLB (glTF binario) para entornos 3D.
- Soporte para scripting y contenido relacionado con Godot.
- Generación de texto general y conversación (etiqueta conversational en los metadatos).
- Capacidades multilingües limitadas al inglés (language: en).
- No se dispone de información sobre tool calling, function calling, modo thinking, visión, audio ni razonamiento multi-paso en la información proporcionada.

## Casos de uso

- Generación de escenas Three.js para prototipado rápido: el modelo puede producir código JavaScript que instancia geometrías, materiales y luces en una escena Three.js, adecuado para desarrolladores que necesitan esbozar visualizaciones 3D sin escribir boilerplate manualmente.
- Creación de assets GLB para pipelines de contenido 3D: útil para generar estructuras de escena y referencias a mallas en formato glTF/GLB, integrándose en flujos de trabajo de modelado procedural.
- Asistencia en el desarrollo de videojuegos con Godot: el modelo puede ayudar a escribir scripts y configuraciones relacionadas con assets 3D en proyectos Godot, gracias a su entrenamiento específico en esta temática.
- Educación y aprendizaje de Three.js: como modelo compacto de 1.7B, puede desplegarse localmente para generar ejemplos didácticos de código 3D sin depender de APIs externas.
- Automatización de tareas de conversión y descripción de assets: puede generar descripciones textuales o código de carga de modelos GLB en aplicaciones web, facilitando tareas repetitivas de integración.
- Despliegue en entornos con recursos limitados: con cuantizaciones desde 0.9 GB (Q2_K), puede ejecutarse en portátiles y equipos sin GPU dedicada para tareas de generación de código 3D offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~0.9 GB de pesos (más overhead de contexto); Q4_K_M ~1.2 GB; Q8_0 ~1.9 GB; f16 ~3.5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; para f16 se recomienda 6 GB o más. No se dispone de recomendaciones específicas de modelos (A100, H100, RTX 4090) en la información proporcionada.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, e incluso en iGPU con memoria unificada para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; los metadatos indican endpoints_compatible y librería transformers para el modelo base.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-GLB-3D-Coder-GGUF (este) | 1.7B | no disponible | apache-2.0 | GGUF en HF | Especializado en Three.js/GLB/Godot |
| Qwen3-1.7B (base) | 1.7B | no disponible | apache-2.0 | safetensors/GGUF | Modelo generalista, sin especialización 3D |
| Otros fine-tunes de código sobre Qwen3-1.7B | 1.7B | no disponible | variable | variable | No se dispone de comparativas publicadas |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para Three.js, GLB y Godot; su rendimiento en tareas de código general puede ser inferior al de modelos generalistas del mismo tamaño.
- Idioma: soporta únicamente inglés, lo que limita su uso en entornos en castellano.
- Riesgo de alucinación: como todo modelo generativo de 1.7B, puede producir APIs inexistentes o código Three.js incorrecto; requiere validación y pruebas en producción.
- Sesgos: no se dispone de información sobre sesgos conocidos; al derivar de Qwen3, puede heredar sesgos del corpus original.
- Contexto: no se ha documentado la longitud de contexto, lo que impide planificar su uso en escenarios de contexto largo.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3 y del dataset de entrenamiento.
- Cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar significativamente la calidad del código generado; se recomienda Q4_K_M o superior para uso práctico.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/Qwen3-1.7B-GLB-3D-Coder-GGUF
- Modelo base: https://huggingface.co/ccore/Qwen3-1.7B-GLB-3D-Coder
- Dataset: https://huggingface.co/datasets/ccore/ThreeJS-3D-GLB-Assets
- Página de overview del cuantizador: https://hf.tst.eu/model#Qwen3-1.7B-GLB-3D-Coder-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
