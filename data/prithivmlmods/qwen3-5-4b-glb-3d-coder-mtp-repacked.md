# prithivMLmods/Qwen3.5-4B-GLB-3D-Coder-MTP-Repacked

## Resumen

Qwen3.5-4B-GLB-3D-Coder-MTP-Repacked es un modelo de lenguaje especializado de 4B parámetros, derivado del checkpoint `u008186` de `ccore/Qwen3.5-GLB-3D-Coder` (a su vez fine-tune de Qwen/Qwen3.5-4B), que transforma descripciones en inglés en páginas HTML/JavaScript autónomas de Three.js con previsualización en navegador, animaciones opcionales y un botón de exportación a `.glb` para motores como Godot. Esta versión concreta, publicada por prithivMLmods, es un "repack" que añade cabezas de Multi-Token Prediction (MTP) para decodificación especulativa integrada en los pesos y ofrece tanto safetensors en BF16 como una familia completa de cuantizaciones GGUF.

El modelo resuelve un problema muy concreto: la generación de assets 3D low-poly editables y escenas procedurales a partir de texto, un flujo que normalmente requiere herramientas de modelado o pipelines de text-to-3D. Al emitir código Three.js ejecutable en lugar de mallas directamente, el resultado es inspeccionable, modificable y exportable a formatos estándar de motor de juego.

Es relevante por tres motivos: su licencia Apache-2.0 permite uso comercial, su tamaño de 4B lo hace desplegable en hardware de consumo, y la inclusión de MTP en los GGUF acelera la inferencia local sin necesidad de un modelo draft separado. Los pesos safetensors suman 4.659.865.088 parámetros totales y el repositorio ocupa 51,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5-4B, con cabezas MTP para decodificacion especulativa |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_M, Q3_K_L; proyector mmproj en BF16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (6 shards, BF16), GGUF (multiples cuantizaciones), mmproj-bf16.gguf |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal con torre de visión (los pesos de visión se almacenan en BF16 mientras el texto va en FP32 en el checkpoint safetensors original, según la model card). Sobre esa base, el autor de `ccore` realizó un fine-tune especializado en generación de código Three.js y assets GLB a partir de prompts en inglés, y prithivMLmods ha "repackado" el resultado añadiendo cabezas de Multi-Token Prediction.

La innovación técnica principal de este repack es el MTP: en lugar de usar un modelo draft externo para decodificación especulativa, los GGUF incorporan cabezas adicionales dentro de la arquitectura que predicen varios tokens futuros en un solo forward pass, acelerando la inferencia local. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La evaluación del modelo original se realizó con thinking habilitado y los parámetros `temperature=0.8`, `top_k=40`, `top_p=0.95`, `repeat_penalty=1.0`.

## Capacidades

- Generación de código Three.js: produce páginas HTML/JavaScript autónomas con previsualización 3D en navegador a partir de descripciones textuales.
- Exportación a GLB: incluye un botón de exportación que genera archivos `.glb` listos para Godot u otros motores.
- Modelado de assets low-poly: personajes, props, vehículos, edificios y entornos procedurales.
- Animaciones opcionales en las escenas generadas.
- Modo thinking (razonamiento extendido) durante la generación.
- Capacidades multimodales de entrada imagen-texto (pipeline `image-text-to-text`, con proyector `mmproj` para runtimes GGUF multimodales).
- Decodificación especulativa vía MTP integrada en los pesos GGUF.
- Soporte de `text-generation-inference` y `llama-cpp` según los tags del repositorio.
- No se documenta soporte explícito de tool calling, function calling ni uso como agente multi-paso.

## Casos de uso

- Prototipado rápido de assets para videojuegos: un diseñador describe un prop o personaje en inglés y obtiene una escena Three.js editable más un `.glb` exportable que puede importar directamente en Godot, reduciendo el tiempo de bloqueo de arte conceptual.
- Generación de escenas procedurales para niveles: el modelo puede producir entornos completos (por ejemplo, una plaza con edificios y vegetación) como código ejecutable, útil para maquetas de nivel o pruebas de jugabilidad.
- Herramienta interna de artistas técnicos: integrada en un editor web, permite iterar sobre variaciones de un asset cambiando el prompt y previsualizando el resultado en el navegador sin salir del flujo.
- Educación y demostraciones de Three.js: el modelo genera ejemplos funcionales de código 3D que sirven como material didáctico o punto de partida para tutoriales.
- Generación de catálogo de assets low-poly: en pipelines de contenido, se pueden producir lotes de modelos estilizados coherentes (misma estética low-poly) para prototipos de apps de AR/VR o webs interactivas.
- Asistencia en Godot vía export GLB: el `.glb` generado se importa en Godot para pruebas de integración de mallas, colisiones o animaciones básicas antes de encargar el asset final a un artista.
- Experimentación multimodal: con el proyector `mmproj` se pueden explorar flujos imagen-texto (por ejemplo, describir una referencia visual y pedir una recreación low-poly), aunque la model card no detalla la calidad de esta vía.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una comparación cualitativa contra DeepSeek V4.1 Flash 1017 sobre prompts complejos no vistos, pero no aporta métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - BF16: ~8,7 GB
  - Q8_0: ~4,6 GB
  - Q6_K: ~3,6 GB
  - Q5_K_M: ~3,2 GB
  - Q4_K_M: ~2,8 GB (recomendado por el autor)
  - Q3_K_M: ~2,3 GB
- Proyector multimodal `mmproj-bf16.gguf`: ~676 MB adicionales si se usa entrada de imagen.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, una RTX 4090 (24 GB) o A100/H100 cubren cualquier cuantización con holgura; una RTX 3060 de 12 GB o similar es suficiente para Q4_K_M o Q5_K_M.
- Cabe en GPU de consumo: sí, desde GPUs con 4-6 GB de VRAM usando Q3_K_M o Q4_K_S.
- Opciones de despliegue: llama.cpp, Ollama (formato GGUF), text-generation-inference, transformers (safetensors), y runtimes GGUF multimodales con `mmproj`.
- Latencia y throughput: no disponibles. El autor afirma que MTP acelera la inferencia local frente a decodificación especulativa tradicional, pero no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-GLB-3D-Coder-MTP-Repacked | 4,66B | no disponible | Texto a Three.js/GLB, multimodal | Apache-2.0 | HuggingFace (safetensors + GGUF) |
| ccore/Qwen3.5-4B-GLB-3D-Coder | no disponible | no disponible | Mismo dominio, sin MTP | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-4B | no disponible | no disponible | Modelo base generalista | no disponible en esta ficha | HuggingFace |
| DeepSeek V4.1 Flash 1017 | no disponible | no disponible | Propietario, comparado cualitativamente en la model card | Propietaria | API |

No se dispone de datos de benchmarks ni de contexto para una comparación cuantitativa con alternativas. La comparación con DeepSeek V4.1 Flash 1017 es cualitativa y proviene del autor del modelo base.

## Limitaciones y advertencias

- Solo soporta inglés según el campo `language` del repositorio; no se garantiza calidad en castellano u otros idiomas.
- Longitud de contexto no documentada: planificar prompts cortos o verificar empíricamente el límite antes de usarlo en producción.
- Riesgo de alucinación en APIs de Three.js y en sintaxis de exportación GLB: el código generado debe validarse ejecutándolo en navegador antes de integrarlo.
- La calidad de los assets 3D es estilizada (low-poly) y no apta para producción de alta fidelidad sin retoque de artista.
- Modelo de nicho con 0 descargas y 1 like en el momento de la ficha: ecosistema y soporte comunitario muy limitados.
- El checkpoint safetensors mezcla FP32 (texto) y BF16 (visión), lo que aumenta el tamaño en disco (~17,49 GB) frente a un BF16 homogéneo; el repositorio completo ocupa 51,7 GB por incluir todas las cuantizaciones.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-4B por si impusieran restricciones adicionales.
- No se documentan sesgos específicos; al entrenarse solo en inglés, hereda los sesgos del corpus de Qwen3.5 y del fine-tune.
- El modo thinking con `temperature=0.8` puede producir respuestas largas; ajustar parámetros para despliegues con latencia estricta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prithivMLmods/Qwen3.5-4B-GLB-3D-Coder-MTP-Repacked
- Carpeta GGUF: https://huggingface.co/prithivMLmods/Qwen3.5-4B-GLB-3D-Coder-MTP-Repacked/tree/main/GGUF
- Modelo base del repack: https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
