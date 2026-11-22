# Aminadaven/Qwen3.5-4B-3D-Coder-Q4_0-NPU

## Resumen

Qwen3.5-4B-3D-Coder-Q4_0-NPU es una cuantización GGUF en Q4_0 de un fine-tune independiente del modelo Qwen3.5-4B, especializado en la generación de código 3D para Three.js. El modelo base (ccore/Qwen3.5-4B-3D-Coder) parte de los pesos de Qwen/Qwen3.5-4B y ha sido ajustado por el autor ccore para producir código JavaScript de escenas tridimensionales. Esta versión concreta la publica el usuario Aminadaven como repack privado, no oficial y sin probar en dispositivo.

La particularidad de esta ficha es el destino de despliegue: el archivo está pensado para ejecutarse en la NPU Hexagon de los SoC Qualcomm Snapdragon mediante el runtime GenieX de llama.cpp. Q4_0 es la única precisión que dicho runtime puede colocar en la NPU Hexagon; las variantes Q4_K_M y Q8_0 del autor original solo funcionan en GPU o CPU. El repositorio ocupa 4,3 GB y contiene 4.205.751.296 parámetros totales según los safetensors del modelo base.

El modelo resuelve un nicho muy concreto: llevar un generador de código 3D a dispositivos móviles y de borde con aceleración NPU, sin depender de la nube. Su relevancia actual radica en que demuestra la viabilidad de ejecutar modelos de 4B en hardware Snapdragon con cuantización de 4 bits, aunque la ausencia de pruebas en dispositivo y de benchmarks publicados limita su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-4B); detalles exactos no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (capas lineales); token embedding y output en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 4,3 GB) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune independiente de Qwen/Qwen3.5-4B, un transformer decoder-only de aproximadamente 4.200 millones de parámetros. El ajuste realizado por ccore está orientado a la generación de código Three.js para escenas 3D. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el fine-tune.

Esta versión concreta se obtiene recuantizando el GGUF Q8_0 del autor original mediante llama.cpp: las capas se convierten a Q4_0, mientras que el token embedding y la capa de salida se mantienen en Q8_0 para preservar calidad. La elección de Q4_0 no es arbitraria: es la precisión que el runtime GenieX de llama.cpp puede mapear a la NPU Hexagon de Qualcomm. No se documentan innovaciones arquitectónicas adicionales ni técnicas de decodificación especulativa.

## Capacidades

- Generación de código JavaScript para Three.js: creación de escenas 3D, geometrías, materiales, luces y animaciones.
- Generación de texto general y conversación multi-turno (tag `conversational`).
- Razonamiento sobre código y explicación de fragmentos existentes.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Ejecución en NPU Hexagon de Snapdragon mediante GenieX, además de GPU/CPU vía llama.cpp.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, agentes y modos de razonamiento extendido: no disponibles en la información proporcionada.

## Casos de uso

- Generación de escenas Three.js en el navegador: el modelo produce código JavaScript listo para pegar en un proyecto web, adecuado para prototipado rápido de visualizaciones 3D.
- Asistente de código 3D en el móvil: al ejecutarse en la NPU Hexagon de un Snapdragon, permite autocompletar y generar código Three.js sin conexión a la nube, con la privacidad que ello implica.
- Educación y aprendizaje de gráficos 3D: el modelo puede explicar y generar ejemplos de geometrías, materiales y cámaras para estudiantes que aprenden Three.js.
- Integración en pipelines de CI/CD: gracias al tag `endpoints_compatible`, puede desplegarse tras un endpoint compatible con OpenAI para generar snippets de código 3D en pruebas automatizadas o herramientas internas.
- Prototipado de demos interactivas: generación de animaciones y efectos visuales en WebGL para presentaciones o pruebas de concepto.
- Herramienta de accesibilidad en dispositivos de borde: ejecución local en hardware Snapdragon para aplicaciones donde la latencia de red o la confidencialidad del código son críticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF ocupa 4,3 GB; la inferencia en GPU requiere al menos ~5 GB de VRAM para Q4_0 con overhead de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090; en el ámbito profesional, A100 o H100 (sobradas para 4B).
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM.
- NPU: Qualcomm Hexagon en SoC Snapdragon, mediante el runtime GenieX de llama.cpp (único destino para el que se publica esta cuantización).
- Opciones de despliegue: llama.cpp (CPU/GPU), GenieX (NPU Hexagon), Ollama y vLLM (para el modelo base en formato safetensors, no para este GGUF).
- Latencia y throughput: no disponibles; el autor indica que no se ha probado en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder-Q4_0-NPU (este) | 4,2B | no disponible | Apache-2.0 | GGUF Q4_0 | Optimizado para NPU Hexagon; sin probar en dispositivo |
| ccore/Qwen3.5-4B-3D-Coder (Q8_0) | 4,2B | no disponible | Apache-2.0 | GGUF Q8_0 | Mayor precisión; solo GPU/CPU |
| ccore/Qwen3.5-4B-3D-Coder (Q4_K_M) | 4,2B | no disponible | Apache-2.0 | GGUF Q4_K_M | Mejor relación calidad/tamaño; solo GPU/CPU |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Apache-2.0 | safetensors | Modelo generalista sin especialización 3D |

## Limitaciones y advertencias

- Repack privado y no oficial: el autor lo describe como "private, unofficial repack" y "not device-tested"; no hay garantía de que funcione correctamente en la NPU Hexagon.
- Sin benchmarks: no se han publicado métricas de calidad, latencia ni throughput, lo que impide evaluar la degradación respecto al Q8_0.
- Riesgo de alucinación: como todo modelo de código, puede generar APIs inexistentes de Three.js o código que no compila; requiere validación.
- Sesgos: no documentados; al derivar de Qwen3.5-4B, hereda los sesgos del modelo base, no evaluados en esta ficha.
- Idiomas: no se especifican; el fine-tune está orientado a código, predominantemente en inglés.
- Contexto: longitud no disponible; no apto para tareas que requieran ventanas muy largas sin verificación previa.
- Licencia Apache-2.0 permite uso comercial, pero al ser un repack no oficial conviene verificar la procedencia de los pesos con el autor original.
- Cuantización Q4_0: menor calidad que Q4_K_M o Q8_0; puede afectar a la precisión del código generado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Aminadaven/Qwen3.5-4B-3D-Coder-Q4_0-NPU
- Modelo base del fine-tune: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp (runtime de cuantización): https://github.com/ggml-org/llama.cpp
