# gatilin/internvlu_image_dit

## Resumen

`gatilin/internvlu_image_dit` es un export del decodificador de generación de imagen (DiT) del modelo InternVL-U, un modelo multimodal unificado de 4B parámetros desarrollado por OpenGVLab que integra comprensión, razonamiento, generación y edición de imágenes en un único marco. Este repositorio no contiene el modelo completo, sino únicamente el componente de difusión: un transformer de doble flujo de 20 capas con 1.808.034.880 parámetros repartidos en 654 tensores, almacenados en el checkpoint original con mezcla de BF16 y F32. Lo publica el usuario `gatilin` como extracción reproducible, con SHA-256 idéntico al fichero oficial de origen.

El componente resuelve un problema concreto de ingeniería: permite reutilizar el decodificador nativo de InternVL-U de forma aislada, sin arrastrar el modelo de lenguaje, el vision tower, el processor ni el VAE. Recibe latentes VAE de forma `[B,16,H,W]` con dimensiones espaciales pares y características de condicionamiento `[B,L,4096]` procedentes del modelo de lenguaje de InternVL-U, y devuelve predicciones de flujo según un scheduler DPM multistep con configuración flow-sigma.

Su relevancia es la de un artefacto de investigación reproducible: preserva el grafo computacional nativo, el pipeline de guidance de tres ramas y la selección de capas de condicionamiento del modelo original. No es un pipeline texto-a-imagen autónomo y no incluye vocabulario, tokenizer ni pesos del VLM. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un repositorio de nicho orientado a quien quiera integrar o auditar el decodificador dentro de un sistema propio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de doble flujo con 20 capas nativas, módulos de entrada, tiempo, condicionamiento y salida; flow matching con scheduler DPM multistep |
| Parámetros totales | 1.808.034.880 (654 tensores) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. El componente no consume texto: acepta condicionamiento `[B,L,4096]` con L definido por el VLM que lo alimenta |
| Tipos de cuantización | No se publican versiones cuantizadas. Almacenamiento original mixto BF16/F32; el cargador `load_component` acepta selección de `dtype` (float32 probado en CPU) |
| Idiomas soportados | No disponible. El componente no procesa lenguaje; la cobertura idiomática depende del VLM condicionador, que no está incluido |
| Licencia | MIT, con avisos Apache-2.0 retenidos para Qwen-Image, PixArt-Sigma y ficheros derivados de Hugging Face |
| Formato de pesos | `model.safetensors` (revisión `f012d760e69712bb47f7d3d09a24280f346cee01`), más código Python de carga (`custom_code`), `extraction.json`, `source_code_manifest.json` y `requirements.txt` |

## Arquitectura y entrenamiento

La arquitectura es un transformer de difusión de doble flujo con 20 capas, íntegramente exportadas junto con los módulos de entrada, de tiempo, de condicionamiento y de salida, y con el token de relleno de condicionamiento aprendido. La predicción se realiza sobre latentes VAE de 16 canales y dimensiones espaciales pares, condicionados por características semánticas de 4096 dimensiones. El muestreo usa un scheduler DPM multistep con ajustes nativos de flow-sigma y un pipeline de guidance de tres ramas que incorpora normalización en timesteps altos; sustituirlo por un CFG genérico de dos ramas altera la inferencia. El cargador reconstruye tras la inicialización en meta la caché determinista de frecuencias RoPE, que no es un tensor aprendido y por tanto no viaja en el fichero de pesos.

No se dispone de información sobre el entrenamiento en la documentación proporcionada: no se detallan número de tokens, composición del dataset, ni si hubo RLHF, DPO u otras fases de alineación. El componente es un extracto de pesos ya entrenados del InternVL-U original de 4B parámetros; el autor no reentrena ni modifica los pesos, y conserva los dtypes de almacenamiento originales. La innovación técnica del repositorio es de empaquetado y verificación: exportación byte-idéntica al fichero oficial (SHA-256 `3d4d40703e8a8d805ff41a75baa17085fc54eaec7f3a8658b24d80578489cb3b`), fuentes computacionales sin modificar y 17 comprobaciones de validación registradas.

## Capacidades

- Generación de latentes de imagen condicionados por características del VLM de InternVL-U, no por texto directo.
- Edición y generación con referencias: acepta entradas VAE de referencia manteniendo las restricciones geométricas del modelo original.
- Manejo de tokens semánticos de imagen, que requieren sus rejillas (grids) y máscaras correspondientes.
- Predicción a profundidad completa en las 20 capas, con respuesta verificada a condicionamiento y a timestep.
- Aislamiento de lote: las comprobaciones de validación incluyen independencia entre elementos del batch.
- Trayectorias de muestreo nativas reproducibles mediante el scheduler incluido.
- Soporte de tool calling / function calling: no aplica; es un decodificador de difusión, no un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica en este componente.
- Capacidades multilingües: no aplica; dependen del VLM que genere el condicionamiento.
- Capacidades especiales: ninguna de tipo thinking mode, visión o audio en el propio componente; la visión y el lenguaje residen en módulos excluidos.

## Casos de uso

- Integración en un pipeline InternVL-U propio: usar este DiT como decodificador de imagen junto al VLM, el vision bridge y el VAE de Qwen-Image, sustituyendo solo la pieza de generación y manteniendo el resto del stack bajo control.
- Investigación sobre transformers de doble flujo: el repositorio expone el grafo nativo completo con 20 capas y permite estudiar cómo responde la predicción a cambios de timestep y de condicionamiento sin cargar un modelo de 4B completo.
- Edición de imágenes condicionada por VLM: alimentar latentes VAE de la imagen de referencia y características semánticas del modelo de lenguaje para tareas de modificación guiada, respetando las restricciones geométricas de la entrada de referencia.
- Fine-tuning del decodificador: partir de pesos verificados por SHA-256 e idénticos al checkpoint oficial para ajustar solo la etapa de generación, reduciendo el coste frente a reentrenar el modelo unificado.
- Auditoría y reproducción de resultados: los manifiestos `extraction.json` y `source_code_manifest.json`, junto con `validation.json`, permiten reproducir la extracción y comprobar la integridad del peso antes de desplegarlo.
- Docencia y experimentación con flow matching: el scheduler DPM con ajustes flow-sigma y el pipeline de guidance de tres ramas sirven como referencia didáctica de muestreo en modelos de difusión con condicionamiento semántico.
- Banco de pruebas de sistemas multimodales: al aislar el decodificador se puede medir el impacto del condicionamiento del VLM en la generación sin que otros componentes enmascaren el efecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de calidad perceptual o de generación de imagen para este componente.

La única evaluación reportada es funcional, no de calidad: 17 comprobaciones registradas en `validation.json`, todas superadas, que cubren carga nativa estricta, integridad de los pesos de origen, predicción a profundidad completa, comparación independiente del mecanismo de atención, respuesta a condicionamiento y tiempo, aislamiento de lote y trayectorias de muestreo nativas. Estas pruebas se ejecutaron con parámetros reales del checkpoint, en CPU con float32 y con condiciones y latentes sintéticos de pequeño tamaño. El propio autor advierte que no miden generación con prompts reales, decodificación de imagen o waveform, calidad perceptual ni el rendimiento completo de las tareas upstream.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 3,6 GB (1.808.034.880 parámetros × 2 bytes). El repositorio ocupa 3,8 GB, coherente con el almacenamiento mixto BF16/F32.
- Pesos en FP32 completo: aproximadamente 7,2 GB.
- VRAM estimada para inferencia: el componente en BF16 con latentes de resolución moderada y caché RoPE se sitúa de forma estimada en la horquilla de 6 a 10 GB, sin contar el resto del pipeline. No hay mediciones publicadas de VRAM ni de latencia.
- Pipeline completo: requiere además el VLM de InternVL-U (4B parámetros), el vision tower, el processor/tokenizer y el VAE de Qwen-Image, con su propio consumo de memoria no cuantificado en la información disponible.
- GPU consumer: el componente cabe con holgura en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB); en FP32 también cabría en tarjetas de 12-16 GB. El pipeline completo no se ha validado en estas tarjetas.
- CPU: la validación oficial se ejecutó en CPU con float32; funcional, pero sin datos de velocidad.
- Opciones de despliegue: carga mediante el código incluido (`from component import load_component`), con PyTorch y `huggingface_hub` para descargar el snapshot. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni formato GGUF, dado que es un decodificador de difusión con código propio.
- Latencia y throughput: no disponibles. No se han publicado mediciones en CUDA ni en MPS.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / condicionamiento | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gatilin/internvlu_image_dit` | 1,81 B | Condicionamiento `[B,L,4096]` del VLM; sin contexto de texto propio | Decodificador DiT de imagen (componente) | MIT (con avisos Apache-2.0) | Hugging Face, repo de 3,8 GB |
| InternVL-U (OpenGVLab) | 4 B | No disponible en la información proporcionada | Modelo multimodal unificado: comprensión, razonamiento, generación y edición | MIT según la atribución del export | Hugging Face y GitHub |
| Qwen-Image VAE | No disponible | No aplica | Autoencoder VAE para latentes de 16 canales | Apache-2.0 | Referenciado como dependencia, no incluido |
| PixArt-Sigma | No disponible | No disponible | Fuente derivada usada en el código del componente | Apache-2.0 | Referenciado en avisos de licencia |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada; la comparación se limita a función, licencia y ámbito de empaquetado.

## Limitaciones y advertencias

- No es un pipeline autónomo: no incluye VLM, vision tower, processor/tokenizer ni pesos del VAE. Sin esos módulos no se puede generar una imagen a partir de texto.
- La interfaz de predicción del helper es más estrecha que la nativa; para inferencia completa hay que usar el pipeline upstream incluido en el repositorio.
- Cambiar el pipeline de guidance (por ejemplo, sustituir las tres ramas por un CFG de dos ramas) altera la salida; lo mismo ocurre si se modifica la selección de capas de condicionamiento, la normalización del VAE de Qwen-Image o los ajustes DPM flow-sigma.
- Las restricciones geométricas son estrictas: latentes con dimensiones espaciales pares y, en entradas de referencia, las cotas del modelo original.
- La validación se hizo con condiciones sintéticas y en CPU float32; no se probaron CUDA, MPS, calidad perceptual ni rendimiento end-to-end, por lo que el comportamiento en producción no está caracterizado.
- Riesgo de alucinación: no evaluado ni medido en este componente. La fidelidad semántica dependerá del VLM que genere el condicionamiento.
- Sesgos: no documentados. Al no incluir el modelo de lenguaje, los sesgos textuales heredados no son inspeccionables dentro de este repositorio.
- Idiomas: no aplica al componente, pero cualquier limitación idiomática del VLM condicionador se propaga al resultado generado.
- Licencia: el componente es MIT, pero arrastra obligaciones de atribución Apache-2.0 de Qwen-Image, PixArt-Sigma y ficheros derivados de Hugging Face; conviene revisar `LICENSE-APACHE-2.0` y las cabeceras de cada fichero antes de un uso comercial.
- Madurez: 0 descargas y 0 likes, publicación de un tercero no oficial, con fecha de creación y actualización de 2026-10-28 y sin revisión comunitaria independiente. Requiere importar explícitamente el código del componente (`custom_code`) para cargar los pesos.

## Enlaces

- Repositorio del componente: https://huggingface.co/gatilin/internvlu_image_dit
- Modelo base InternVL-U: https://huggingface.co/InternVL-U/InternVL-U
- Árbol del código fuente en la revisión fijada: https://huggingface.co/InternVL-U/InternVL-U/tree/f012d760e69712bb47f7d3d09a24280f346cee01
- Repositorio GitHub de InternVL-U: https://github.com/OpenGVLab/InternVL-U
- Código del paquete InternVL-U en GitHub: https://github.com/OpenGVLab/InternVL-U/tree/main/internvl
- Informe técnico en arXiv: https://arxiv.org/abs/2603.09877
- Componente complementario vision bridge: https://huggingface.co/gatilin/internvlu_vision_bridge
- Colección de encoders de visión del autor: https://huggingface.co/collections/gatilin/vit-and-vision-encoders
