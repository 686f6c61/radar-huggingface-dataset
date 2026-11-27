# Deadcracker23/Qwen3-1.7B-GLB-3D-Coder

## Resumen

Qwen3-1.7B-GLB-3D-Coder es un ajuste fino (fine-tune) del modelo Qwen3-1.7B de Alibaba Qwen, desarrollado por el usuario Deadcracker23 (proyecto CCORE). El modelo está especializado en una tarea muy concreta: generar páginas HTML autónomas que usan Three.js para construir assets 3D de estilo low-poly y que incluyen un botón de exportación a GLB, el formato que consume el editor Godot. Resuelve el problema de iterar rápidamente sobre prototipos de assets 3D sin depender de herramientas de modelado tradicionales ni de GPUs de gama alta.

El modelo parte de la arquitectura Qwen3 de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones), un transformer causal con atención grouped-query (GQA) en las 28 capas. Se ha entrenado sobre el dataset `ccore/ThreeJS-3D-GLB-Assets`, que cubre 40 dominios de assets (personajes, armas, mobiliario, entornos, vehículos, etc.). La relevancia actual radica en que demuestra hasta dónde puede llegar un modelo pequeño especializado cuando se le da un formato de salida muy estructurado y verificable, manteniendo un bucle de iteración corto en hardware modesto.

Se distribuye en GGUF (Q4_K_M, Q8_0 y F16) y en safetensors FP16, con licencia Apache 2.0. El autor recomienda Q8_0 (1,83 GB) como punto de partida para CPU o poca VRAM y advierte que Q4_K_M degrada sustancialmente la calidad. Es un modelo de nicho, no un asistente generalista, y su valor está en la generación de código Three.js con exportación GLB funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3) con grouped-query attention en 28 capas |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0, F16 (GGUF); FP16 (safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16) y GGUF (Q4_K_M, Q8_0, F16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-1.7B: un transformer causal denso de 28 capas con atención grouped-query (GQA), manteniendo atención causal completa en todas las capas. El fine-tune se realizó sobre el dataset `ccore/ThreeJS-3D-GLB-Assets`, orientado a la generación de código Three.js que produce assets 3D low-poly y su exportación a GLB. El dataset cubre 40 dominios de assets, agrupados en personajes y criaturas, objetos y props, entornos y estructuras, vehículos y máquinas, y assets interactivos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal no está en la arquitectura, sino en el formato de salida: el modelo genera un único archivo HTML autónomo con previsualización 3D interactiva y un botón de exportación GLB, lo que hace la salida verificable de forma directa en el navegador. El autor indica que los pesos se actualizaron por última vez el 13 de noviembre de 2026 y que los tres GGUF provienen del mismo checkpoint.

## Capacidades

- Generación de código Three.js dentro de un archivo HTML completo y autónomo.
- Creación de assets 3D low-poly a partir de descripciones en lenguaje natural (personajes, armas, mobiliario, entornos, vehículos, etc.).
- Exportación a GLB mediante un botón integrado en el HTML generado, con soporte de animación cuando el asset lo requiere.
- Generación de animaciones incluidas en el GLB exportado para assets que las necesiten.
- Cobertura de 40 dominios de assets del dataset de entrenamiento.
- Generación de texto conversacional (pipeline `text-generation`), heredada del modelo base.
- No se documenta soporte de tool calling, function calling, agentes multi-step, visión ni audio.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Prototipado rápido de assets para Godot: el modelo genera un HTML con el asset low-poly y su botón de exportación GLB, que se importa directamente en el editor Godot, acelerando la fase de bloqueo de un proyecto.
- Iteración de diseño en hardware modesto: con el GGUF Q8_0 (1,83 GB) se puede ejecutar en CPU o en una GPU con poca VRAM, permitiendo ciclos de prueba y error sin infraestructura dedicada.
- Generación de mobiliario y props para escenarios: prompts como una mesa de hierro low-poly o un mostrador de panadería producen assets exportables para poblar niveles.
- Creación de personajes y enemigos: el modelo cubre criaturas y jefes (por ejemplo, un gólem de piedra con núcleo de cristal), útiles para maquetas de combate.
- Construcción de entornos y estructuras: puestos de mando, campamentos y escenarios naturales que se pueden exportar y componer en escenas mayores.
- Assets animados: cuando la petición requiere animación, el modelo la incluye en el GLB exportado, lo que sirve para prototipos de objetos interactivos o marcadores de gameplay.
- Docencia y experimentación: como ejemplo de fine-tune de un modelo pequeño sobre un formato de salida estructurado y verificable, útil para estudiar pipelines de datos sintéticos y evaluación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta observaciones cualitativas: el modelo normalmente produce un asset 3D, aunque algunos intentos fallan al renderizar o exportar a GLB y requieren reintento; además, Q4_K_M produce salidas de calidad sustancialmente inferior a F16 y Q8_0.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB con Q4_K_M, 2 GB con Q8_0 y 3,5-4 GB con F16 (estimación a partir del tamaño de los archivos, sin margen de contexto).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM para Q8_0/F16; para Q4_K_M basta con 2 GB. No se requieren A100 ni H100.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3050, RTX 3060, RTX 4060 o superiores; también es viable en CPU.
- Opciones de despliegue: llama.cpp y LM Studio (recomendados por el autor para GGUF); los safetensors FP16 son compatibles con Transformers.
- Latencia y throughput: no disponibles; el autor indica que la velocidad depende del hardware, el runtime, la longitud de contexto y la cantidad de código generado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-GLB-3D-Coder | 1,72 B | no disponible | Three.js y exportacion GLB | Apache 2.0 | GGUF y safetensors |
| Qwen3-1.7B (base) | 1,72 B | no disponible | Proposito general | Apache 2.0 | safetensors y GGUF |
| Modelos de generacion de codigo de ~1-2 B | no disponible | no disponible | Codigo general | variable | variable |

La comparación más directa es con el modelo base Qwen3-1.7B, del que hereda arquitectura y licencia pero al que supera en la tarea específica de generar HTML con Three.js y exportación GLB. Frente a modelos de código generalistas del mismo tamaño, este fine-tune sacrifica amplitud por una salida muy estructurada y verificable. No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El propio autor reconoce que algunos intentos fallan al renderizar o exportar a GLB y requieren reintento.
- Q4_K_M produce salidas de calidad sustancialmente inferior; se recomienda Q8_0 o F16.
- Es un modelo de nicho: fuera de la generación de assets Three.js/GLB su utilidad es limitada.
- Riesgo de alucinación en APIs de Three.js y en la lógica de exportación GLB, con código que puede no ejecutarse.
- No se documentan sesgos conocidos, pero al derivar de Qwen3 puede heredar los del modelo base.
- Idiomas soportados no disponibles; el system prompt recomendado está en inglés.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la corrección del código generado.
- La longitud de contexto no está documentada, lo que dificulta planificar prompts largos o conversaciones multi-turno.
- El proyecto depende de donaciones (Ko-fi) para futuras releases; no hay garantía de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deadcracker23/Qwen3-1.7B-GLB-3D-Coder
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/ccore/ThreeJS-3D-GLB-Assets
- Apoyo al proyecto: https://ko-fi.com/ccorecaio
