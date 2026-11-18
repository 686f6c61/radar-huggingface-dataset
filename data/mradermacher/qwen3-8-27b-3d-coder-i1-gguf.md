# mradermacher/Qwen3.8-27B-3D-Coder-i1-GGUF

## Resumen

Qwen3.8-27B-3D-Coder es un modelo de lenguaje especializado en generación de código para escenas 3D con Three.js, desarrollado por el usuario syaikhipin y afinado mediante QLoRA sobre una base Qwen3.8 de 27B (no disponible el checkpoint base exacto). El modelo que nos ocupa es una cuantización GGUF publicada por mradermacher, un prolífico cuantizador de la comunidad, que genera versiones con imatrix para facilitar su despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que ilustra el ecosistema de cuantizaciones comunitarias: el modelo original tiene 26.895.998.464 parámetros (unos 26,9B reales, pese al "27B" del nombre), licencia Apache 2.0 y está etiquetado como modelo de visión, aunque los ficheros mmproj se distribuyen en el repositorio estático separado. El repositorio contiene 179,8 GB de cuantizaciones en múltiples niveles de compresión, desde i1-Q2_K (10,8 GB) hasta niveles altos no listados en el README.

El modelo está entrenado específicamente para generar escenas 3D en Three.js a partir de descripciones, lo que lo convierte en una herramienta de nicho para prototipado rápido de visualizaciones 3D, demos interactivas y generación de código de gráficos web. Su contexto, metodología de entrenamiento y datos de benchmarks no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8; detalles no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_M, i1-Q6_K, i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-IQ4_XS, i1-IQ4_NL, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-Q4_0, i1-Q4_1, i1-Q5_K_S, i1-Q6_K (además de quants estáticos en repositorio separado) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix separado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer derivado de la familia Qwen3.8, con 26.895.998.464 parámetros. El modelo original fue afinado mediante QLoRA (cuantización de 4 bits con adaptadores de bajo rango) sobre el dataset `ccore/ThreeJS-3D-Scenes`, un conjunto de datos orientado a la generación de escenas 3D con Three.js. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO.

La innovación principal es la especialización vertical: en lugar de un modelo generalista, se trata de un fine-tuning centrado en un dominio concreto (código Three.js para escenas 3D), lo que permite al modelo generar código de gráficos web más ajustado a las convenciones de la librería. Las cuantizaciones i1 de mradermacher emplean ficheros imatrix (importance matrix) para preservar la calidad en niveles de compresión bajos, una técnica que mejora la perplejidad frente a cuantizaciones estáticas equivalentes. No se documentan innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de código especializado en Three.js para construir escenas 3D (geometrías, materiales, luces, cámaras, animaciones).
- Generación de texto conversacional en inglés, heredada de la base Qwen3.8.
- Capacidad de visión declarada por el autor (modelo etiquetado como vision), con ficheros mmproj en el repositorio estático; no se detalla el alcance real.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la metadata.
- Modo thinking: no disponible.

## Casos de uso

- Prototipado rápido de escenas 3D en web: el modelo genera código Three.js a partir de una descripción textual, permitiendo a desarrolladores obtener un esqueleto funcional de escena (cámara, luces, objetos) en segundos y refinarlo manualmente.
- Generación de demos interactivas para presentaciones: útil para crear visualizaciones 3D embebidas en páginas web sin escribir manualmente la inicialización de la escena y el bucle de render.
- Educación y aprendizaje de Three.js: el modelo puede producir ejemplos comentados de escenas 3D que sirven como material didáctico para quienes aprenden la librería.
- Automatización de assets de visualización: integrado en un pipeline que recibe especificaciones de producto y genera código de escena 3D para configuradores web.
- Generación de código en producción con validación humana: al ser un modelo de 26,9B cuantizado, puede desplegarse en servidores con GPU de 24 GB (Q4) para autocompletar o generar snippets de Three.js que pasan por revisión y tests.
- Experimentación en investigación sobre fine-tuning vertical: sirve como caso de estudio de cómo un QLoRA sobre un dataset de dominio (ThreeJS-3D-Scenes) especializa un modelo generalista, y las cuantizaciones i1 permiten reproducir el experimento en hardware modesto.
- Despliegue en local para desarrolladores individuales: las cuantizaciones Q4_K_S (15,7 GB) o IQ3_M (12,7 GB) caben en GPUs de consumo de 16-24 GB, permitiendo uso offline sin depender de APIs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - i1-Q2_K: ~10,8 GB (requiere GPU de 12 GB o CPU con RAM suficiente).
  - i1-IQ3_M: ~12,7 GB (cabe en RTX 4080/4090 de 16-24 GB).
  - i1-Q4_K_S: ~15,7 GB (óptimo tamaño/velocidad/calidad según el autor; cabe en RTX 4090 de 24 GB).
  - Cuantizaciones superiores (Q5_K_M, Q6_K): no se listan tamaños en el README, pero por proporción estarían en el rango de 18-22 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4/Q5; A100 40 GB o H100 para cuantizaciones altas y contexto largo; RTX 4080 (16 GB) para IQ3_M.
- Cabe en GPU de consumo: sí, en RTX 4090 (Q4_K_S), RTX 4080 (IQ3_M) y GPUs de 12 GB con Q2_K (con pérdida de calidad notable).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. También es posible usar transformers con los pesos originales (no cuantizados), pero el repositorio solo contiene GGUF.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo de ~27B en Q4 en una RTX 4090 suele generar del orden de 20-40 tokens/s, pero no hay medición publicada para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-3D-Coder (este) | ~26,9B | no disponible | Three.js / 3D | Apache 2.0 | GGUF |
| Qwen2.5-Coder-32B | 32,5B | 128K (típico en la familia) | Código general | Apache 2.0 | safetensors, GGUF |
| DeepSeek-Coder-V2-Lite | 16B (2,4B activos, MoE) | 128K | Código general | DeepSeek License | safetensors, GGUF |
| CodeLlama-34B | 34B | 16K | Código general | Llama 2 License | safetensors, GGUF |

La comparativa es aproximada: no hay benchmarks publicados de este modelo que permitan una comparación cuantitativa. Frente a los modelos de código generalistas, la ventaja de este fine-tuning es la especialización en Three.js; la desventaja es un contexto no documentado y un ecosistema mucho menor (0 descargas, 0 likes en el momento de la ficha).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset específico de escenas Three.js, puede reproducir sesgos de ese corpus.
- Riesgo de alucinación: alto en APIs de Three.js poco frecuentes o en versiones recientes de la librería; el código generado debe validarse siempre.
- Limitaciones de contexto o idioma: solo inglés según la metadata; la longitud de contexto no está documentada, lo que impide planificar prompts largos con garantías.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (Qwen3.8) y del dataset `ccore/ThreeJS-3D-Scenes`, no detalladas aquí.
- Caveat de producción: el modelo tiene 0 descargas y 0 likes, sin benchmarks ni validación comunitaria; no se recomienda para producción sin evaluación propia.
- El nombre "27B" no coincide con los parámetros reales (~26,9B); tenerlo en cuenta al estimar VRAM.
- La capacidad de visión está declarada pero los ficheros mmproj están en el repositorio estático; verificar su disponibilidad antes de asumir soporte multimodal.
- Las cuantizaciones de baja calidad (Q2_K, IQ1/IQ2) degradan notablemente la calidad; el autor recomienda IQ3_XXS o superior frente a Q2_K.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen3.8-27B-3D-Coder-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.8-27B-3D-Coder-GGUF
- Modelo base: https://huggingface.co/syaikhipin/Qwen3.8-27B-3D-Coder
- Dataset de entrenamiento: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Página de conveniencia del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-3D-Coder-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
