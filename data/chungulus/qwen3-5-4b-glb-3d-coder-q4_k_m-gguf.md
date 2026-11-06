# Chungulus/Qwen3.5-4B-GLB-3D-Coder-Q4_K_M-GGUF

## Resumen

Qwen3.5-4B-GLB-3D-Coder es un modelo de lenguaje multimodal (texto e imagen) afinado por CCORE a partir de Qwen/Qwen3.5-4B, especializado en la generación de código para activos 3D: escenas Three.js y exportación de ficheros GLB. Esta ficha concreta corresponde a la cuantización comunitaria Q4_K_M en formato GGUF publicada por Chungulus, no a un lanzamiento oficial de Qwen ni de CCORE. El checkpoint original data del 5 de noviembre de 2026 y esta versión cuantizada se subió al día siguiente.

El modelo base tiene 4.539.265.536 parámetros totales, de los cuales 4.205.751.296 corresponden a la red de texto exportada a F16 y posteriormente cuantizada a Q4_K_M; el proyector visual se mantiene en BF16 sin modificar. El repositorio ocupa 3,4 GB e incluye el fichero GGUF principal y el `mmproj` para entrada de imágenes.

Su relevancia es acotada pero específica: cubre una tarea de nicho (generación de código 3D y exportación GLB para pipelines de videojuegos, por ejemplo Godot) y lo hace en un tamaño que cabe en GPU de consumo. La licencia Apache 2.0 facilita su integración comercial, aunque la evidencia de validación publicada por el cuantizador es funcional y limitada, no un conjunto de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión), derivado de Qwen3.5-4B; detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (checkpoint original, incluye visión) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Parametros de la red de texto exportada | 4.205.751.296 |
| Longitud de contexto | No disponible de forma oficial; el ejemplo de uso del autor emplea `-c 16384` |
| Tipos de cuantizacion | Q4_K_M (texto); proyector visual en BF16 (`mmproj-Qwen3.5-4B-BF16.gguf`) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal derivado de Qwen3.5-4B, con una torre de visión que se comunica con la red de texto mediante un proyector multimodal. El checkpoint original de CCORE contiene pesos de texto en F32 y pesos de visión en BF16. Para esta cuantización, Chungulus exportó la red de texto a F16 (conservando tensores sensibles en F32) y la cuantizó de forma independiente a Q4_K_M, sin recalibrar desde un checkpoint de baja precisión y sin matriz de importancia. El proyector visual se incluye sin modificar en BF16.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el afinado de CCORE. El modelo original soporta multi-token prediction (MTP), pero esa capacidad no se ha exportado en esta cuantización y el autor recomienda desactivar MTP y la decodificación especulativa en los frontends que intenten habilitarlos. El runtime probado es llama.cpp en el commit `6414d5b0c9e5895473036c90c2bd305ce4ceccc4`.

## Capacidades

- Generación de código Three.js: produce escenas completas en un único fichero HTML, con geometría, materiales y controles.
- Exportación de activos GLB: genera código que usa `GLTFExporter` para descargar el modelo 3D resultante.
- Comprensión de imágenes: el proyector BF16 incluido permite tareas image-text-to-text (descripción de imágenes, identificación de elementos visuales).
- Generación de texto conversacional multi-turno.
- Salida estructurada en JSON (verificada en las pruebas del cuantizador).
- Razonamiento aritmético básico (verificado en las pruebas del cuantizador).
- Modo thinking: el autor original recomienda activarlo con temperatura 0.8, top-k 40, top-p 0.95, min-p 0 y repeat penalty 1.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Generación de escenas Three.js para prototipos web: el modelo produce un HTML completo con la escena, lo que permite iterar rápidamente sobre maquetas 3D sin escribir el boilerplate a mano.
- Creación de activos 3D exportables para Godot: el código generado incluye la descarga del GLB mediante `GLTFExporter`, de modo que el activo se puede importar directamente en el motor.
- Asistente de modelado low-poly: útil para generar cubos, primitivas y composiciones sencillas con materiales y botones de exportación en una sola pasada.
- Descripción de imágenes de referencia: con el `mmproj` incluido se pueden analizar capturas o renders y usarlos como entrada para guiar la generación de la escena.
- Automatización de pipelines de assets en estudio pequeño: integrable vía llama.cpp en scripts que generen variantes de escenas o activos a partir de prompts parametrizados.
- Educación y demostraciones de IA local multimodal: al caber en GPU de consumo, sirve para talleres donde se quiera mostrar generación de código 3D sin depender de la nube.
- Generación de JSON estructurado en flujos de herramientas: la salida JSON verificada permite usarlo como extractor de parámetros en utilidades internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las únicas validaciones documentadas por el cuantizador son pruebas funcionales acotadas: aritmética nativa, salida JSON y dos casos de comprensión de imágenes con el proyector incluido (identificación del cuadrado central en fixtures rojo/azul, con 1024 tokens de imagen, temperatura 0 y semilla 42). El ejemplo de cubo con exportación pasó comprobaciones de sintaxis JavaScript y de API de Three.js/GLTFExporter. No se probaron renderizado en navegador, descarga e importación real del GLB, vídeo, comportamiento a contexto completo ni precisión en benchmarks.

## Requisitos de hardware

- VRAM estimada: en torno a 3-4 GB para el GGUF Q4_K_M de texto más el proyector BF16; el repositorio completo ocupa 3,4 GB.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más.
- Despliegue: llama.cpp (runtime probado, commit `6414d5b0c9e5895473036c90c2bd305ce4ceccc4`), con `llama-completion` para texto y `llama-mtmd-cli` para imagen. Compatibilidad con vLLM, Ollama o TGI no está documentada en la información disponible.
- Ajustes de inferencia recomendados por el autor: `-c 16384 -ngl 99 -n 8192` para generación de código; `--image-min-tokens 1024 -c 8192` para imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.5-4B-GLB-3D-Coder Q4_K_M (esta ficha) | 4,2B texto / 4,5B total | No disponible (ejemplos a 16k) | GGUF | Apache 2.0 | Código 3D y GLB |
| Qwen3.5-4B-3D-Coder Q4_K_M (Chungulus) | 4,2B texto / 4,5B total | No disponible | GGUF | Apache 2.0 | Escenas Three.js |
| ccore/Qwen3.5-4B-GLB-3D-Coder (original) | 4,5B | No disponible | F32/BF16 | Apache 2.0 | Código 3D y GLB |
| Qwen/Qwen3.5-4B (base) | ~4B | No disponible | safetensors | Apache 2.0 | Propósito general |

La diferencia principal frente a la variante 3D-Coder del mismo cuantizador es el soporte de exportación GLB, ausente en aquella. Frente al checkpoint original, esta versión pierde MTP y precisión numérica a cambio de un tamaño manejable en GPU de consumo.

## Limitaciones y advertencias

- Validación limitada: las pruebas publicadas son funcionales y acotadas; no hay benchmarks de precisión ni evaluación a contexto completo.
- Sin pruebas de renderizado real ni de importación del GLB en motores como Godot o Blender; el autor recomienda inspeccionar los activos generados en el editor.
- MTP y decodificación especulativa no están exportados; hay que desactivarlos explícitamente en frontends que los activen por defecto.
- La cuantización Q4_K_M se hizo sin matriz de importancia ni calibración, lo que puede degradar la calidad frente al checkpoint original en tareas sensibles.
- Comprensión de imágenes con evidencia escasa: dos casos de prueba con un fixture sintético no garantizan un grounding fiable.
- Riesgo de alucinación en APIs de Three.js y GLTFExporter: el código puede compilar pero referenciar métodos inexistentes o parámetros incorrectos.
- Idiomas soportados no documentados; el prompt de ejemplo está en inglés.
- Licencia Apache 2.0 permite uso comercial, pero exige conservar la licencia y la atribución a Qwen y CCORE.
- Es una cuantización comunitaria, no oficial; para producción conviene fijar el commit del runtime y verificar los SHA256 del manifiesto incluido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Chungulus/Qwen3.5-4B-GLB-3D-Coder-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder
- Checkpoint original concreto: https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder/tree/8f32a199f8b22fe3157b9c5c8b42b052a0750dd3
- Model card original: https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder/blob/8f32a199f8b22fe3157b9c5c8b42b052a0750dd3/README.md
- Variante Three.js del mismo cuantizador: https://huggingface.co/Chungulus/Qwen3.5-4B-3D-Coder-Q4_K_M-GGUF
- Guía de uso local: https://www.mindstudio.ai/blog/qwen3-5-4b-glb-3d-coder-local
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
