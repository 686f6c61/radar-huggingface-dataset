# Chungulus/Qwen3.5-4B-GLB-3D-Coder-Q8_0-GGUF

## Resumen

Chungulus/Qwen3.5-4B-GLB-3D-Coder-Q8_0-GGUF es una cuantización comunitaria en formato GGUF Q8_0 del modelo ccore/Qwen3.5-4B-GLB-3D-Coder, un ajuste fino de Qwen3.5-4B orientado a la generación de código de activos 3D (Three.js, GLB, Godot). El autor original es CCORE, que publicó el checkpoint u008186 el 5 de noviembre de 2026; Chungulus realizó la exportación y cuantización de forma independiente, sin respaldo oficial de Qwen ni de CCORE.

El modelo parte de un checkpoint original de 4.539.265.536 parámetros (pesos de texto en F32 y pesos de visión en BF16). Chungulus exportó la red de texto de 4.205.751.296 parámetros a F16 conservando tensores sensibles en F32, y posteriormente la cuantizó a Q8_0. Se incluye el proyector multimodal original `mmproj-Qwen3.5-4B-BF16.gguf` sin modificar, lo que permite el procesamiento de imágenes. La predicción multi-token (MTP) no se exporta.

Es relevante para desarrolladores que necesitan ejecutar localmente un modelo especializado en generar escenas Three.js y activos GLB con capacidad de entrada de imagen, usando llama.cpp en hardware de consumo. La licencia Apache 2.0 facilita su integración en productos comerciales, aunque el modelo base es un ajuste fino de nicho con validación funcional limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión), base Qwen3.5-4B; detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (checkpoint original); 4.205.751.296 (red de texto exportada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; los ejemplos de uso emplean `-c 16384` |
| Tipos de cuantizacion | Q8_0 (esta versión); el modelo base admite otros formatos GGUF no especificados |
| Idiomas soportados | No disponible (los repos derivados etiquetan "English") |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0 para texto, BF16 para `mmproj`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen/Qwen3.5-4B realizado por CCORE, con pesos de texto en F32 y pesos de visión en BF16 en el checkpoint original. La exportación de Chungulus convierte la red de texto a F16 (manteniendo tensores sensibles en F32) y luego la cuantiza a Q8_0 sin matriz de calibración ni matriz de importancia. El proyector multimodal `mmproj-Qwen3.5-4B-BF16.gguf` se incluye sin cambios y habilita la entrada de imágenes.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo original soporta predicción multi-token (MTP), pero esta capacidad no se exporta en esta cuantización; el autor recomienda desactivar MTP/predicción especulativa en los frontends que intenten habilitarla. El runtime probado es llama.cpp en el commit `6414d5b0c9e5895473036c90c2bd305ce4ceccc4`.

## Capacidades

- Generación de código para escenas Three.js y activos 3D en formato GLB.
- Generación de código para Godot (según etiquetas de repos derivados).
- Entrada de imagen (image-text-to-text) mediante el proyector multimodal incluido.
- Conversación multi-turno (pipeline conversacional).
- Salida estructurada JSON (verificada en las pruebas del autor).
- Aritmética básica (verificada en las pruebas del autor).
- Modo "thinking" disponible en el modelo original; el autor recomienda activarlo para replicar la evaluación del creador.
- Comprensión de imágenes limitada: identificó correctamente un cuadrado central en fixtures de dos colores con 1024 tokens de imagen, temperatura 0 y semilla 42.

## Casos de uso

- Generación de escenas Three.js: el modelo produce archivos HTML completos con código Three.js, incluyendo elementos interactivos como botones de exportación GLB, tal como demuestra el ejemplo del autor con un cubo rojo low-poly.
- Creación de activos GLB para pipelines de juego: genera código que usa GLTFExporter para producir archivos GLB importables en motores como Godot o visores web.
- Prototipado rápido de visualizaciones 3D: un desarrollador puede describir una escena y obtener código funcional para iterar en el navegador.
- Asistencia en editores de código: integrable vía llama.cpp en entornos locales para autocompletar o generar fragmentos de código Three.js/GLB.
- Procesamiento de imágenes de referencia: con el proyector multimodal, el modelo puede recibir una imagen y describirla o usarla como base para generar código de escena.
- Automatización de tareas de codificación 3D en CI/CD: aunque no se han validado pipelines completos, el soporte de salida JSON y la ejecución local con llama.cpp permiten integrarlo en scripts de generación de activos.
- Educación y experimentación: modelo ligero (4B) ejecutable en hardware de consumo para aprender generación de código 3D asistida por IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor documenta únicamente comprobaciones funcionales acotadas: aritmética nativa, salida JSON, dos casos de comprensión de imagen con el proyector incluido, y validación de sintaxis JavaScript y APIs de Three.js/GLTFExporter en el ejemplo generado. No se probaron renderizado en navegador, descarga/importación real de GLB, vídeo, comportamiento en contexto completo ni precisión en benchmarks.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 5,2 GB; el archivo GGUF Q8_0 más el proyector BF16 requieren aproximadamente 5-6 GB de VRAM para inferencia completa en GPU.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100 (cualquier GPU con al menos 6-8 GB de VRAM libre).
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM; con 6 GB puede requerir descarga parcial de capas a CPU.
- Opciones de despliegue: llama.cpp (runtime probado, commit `6414d5b0c9e5895473036c90c2bd305ce4ceccc4`), `llama-completion`, `llama-mtmd-cli` para multimodal. No se mencionan vLLM, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Chungulus/Qwen3.5-4B-GLB-3D-Coder-Q8_0-GGUF | 4,2B (texto) | No disponible | Apache 2.0 | GGUF Q8_0 | Cuantización comunitaria, especializada en Three.js/GLB |
| ccore/Qwen3.5-4B-GLB-3D-Coder | 4,5B | No disponible | Apache 2.0 | Safetensors (F32/BF16) | Modelo original de CCORE, checkpoint completo |
| OxBee/Qwen3.5-4B-GLB-3D-Coder | No disponible | No disponible | Apache 2.0 | GGUF | Duplicado del original, etiquetado English/Godot |
| sekkit/Qwen3.5-4B-GLB-3D-Coder | No disponible | No disponible | Apache 2.0 | GGUF | Otro derivado del original, etiquetado English/Godot |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con modelos de propósito general de tamaño similar.

## Limitaciones y advertencias

- Validación funcional muy limitada: solo se probaron aritmética, JSON, dos casos de imagen y sintaxis del ejemplo generado; no hay garantía de calidad en generación de activos 3D reales.
- Comprensión de imágenes con evidencia escasa: una prueba inicial con 256 tokens de imagen respondió `#ffffff` en lugar del color esperado; el autor reconoce que la comprensión visual no está garantizada.
- No se probaron renderizado en navegador, descarga/importación de GLB, vídeo ni comportamiento en contexto completo.
- MTP/predicción especulativa no exportada; debe desactivarse en frontends que intenten habilitarla.
- Requiere runtime llama.cpp reciente compatible con Qwen3.5; versiones antiguas pueden fallar.
- Idiomas soportados no documentados; los repos derivados etiquetan únicamente "English".
- Riesgo de alucinación en código generado: el autor recomienda inspeccionar y probar los activos generados en el editor.
- Es una cuantización comunitaria no oficial; no cuenta con respaldo de Qwen ni de CCORE.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse la atribución y licencia originales.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/Chungulus/Qwen3.5-4B-GLB-3D-Coder-Q8_0-GGUF
- Modelo base (CCORE): https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder
- Model card original (commit): https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder/blob/8f32a199f8b22fe3157b9c5c8b42b052a0750dd3/README.md
- Checkpoint original (árbol): https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder/tree/8f32a199f8b22fe3157b9c5c8b42b052a0750dd3
- Derivado OxBee: https://huggingface.co/OxBee/Qwen3.5-4B-GLB-3D-Coder
- Derivado sekkit: https://huggingface.co/sekkit/Qwen3.5-4B-GLB-3D-Coder/tree/main
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
