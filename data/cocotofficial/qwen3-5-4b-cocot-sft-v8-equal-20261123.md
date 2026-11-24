# cocotofficial/Qwen3.5-4B-CoCoT-SFT-v8-equal-20261123

## Resumen

Qwen3.5-4B-CoCoT-SFT-v8-equal-20261123 es un ajuste fino (SFT) del modelo Qwen3.5-4B de Alibaba Qwen, publicado por el usuario cocotofficial en Hugging Face. El modelo está especializado en la reconstrucción de escenas 3D mediante la generación de código Three.js a partir de entradas de imagen y texto, y forma parte de la línea "CoCoT" (presumiblemente chain-of-thought con código) del autor. Se trata de un checkpoint del epoch 4, en el paso global 164, entrenado sobre 2.609 ejemplos del dataset `cocotofficial/mmsi-hss-qwen4max-threejs-sft-v8`.

El modelo hereda la arquitectura y el conocimiento general de Qwen3.5-4B, pero su ajuste fino lo orienta a una tarea muy concreta: dado un par imagen-texto, producir una cadena de razonamiento y el código Three.js correspondiente para reconstruir la escena. Con 5.174.964.736 parámetros reales en safetensors y un tamaño de repositorio de 10,4 GB, es un modelo de escala media que puede desplegarse en hardware de consumo con cuantización.

Su relevancia actual es limitada pero específica: no es un modelo de propósito general, sino una prueba de concepto de ajuste fino multimodal para generación de código 3D. La model card es extremadamente escueta y no documenta licencia, idiomas ni benchmarks, lo que limita su adopción en producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 5.174.964.736 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se ajusta mediante supervisión (SFT) sobre 2.609 ejemplos del dataset `cocotofficial/mmsi-hss-qwen4max-threejs-sft-v8`. La model card indica que el cálculo de la pérdida se realizó sobre la cadena de razonamiento del asistente y el código Three.js, enmascarando los tokens del prompt. Esto implica que el entrenamiento optimiza conjuntamente la generación del razonamiento intermedio y del código final, no solo la salida de código.

No se documentan en la información disponible detalles sobre la composición del dataset, el número de tokens de entrenamiento, el uso de RLHF/DPO, la arquitectura interna exacta (número de capas, dimensiones, mecanismo de atención) ni innovaciones técnicas como decodificación especulativa o atención lineal. El checkpoint corresponde al epoch 4 en el paso global 164, lo que sugiere un entrenamiento relativamente corto sobre un conjunto de datos pequeño y muy especializado.

## Capacidades

- Generación de código Three.js para reconstrucción de escenas 3D a partir de entradas imagen-texto.
- Generación de cadenas de razonamiento (chain of thought) previas al código, dado que la pérdida se calculó sobre el CoT.
- Procesamiento multimodal imagen-texto (pipeline `image-text-to-text`).
- Conversación multi-turno (etiqueta `conversational` en los tags del repositorio).
- Capacidades generales heredadas de Qwen3.5-4B: no documentadas en la información disponible, pero presumiblemente conservadas parcialmente tras el ajuste fino.
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente; el CoT entrenado es específico de la tarea Three.js.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Reconstrucción automática de escenas 3D desde capturas o fotografías: el modelo recibe una imagen y genera código Three.js que reproduce la geometría y disposición de la escena, útil para prototipado rápido de entornos 3D en web.
- Generación de escenas Three.js para demos y tutoriales: un desarrollador puede describir una escena en texto o adjuntar una referencia visual y obtener código listo para insertar en una página web con Three.js.
- Prototipado de entornos en herramientas de diseño web 3D: integrado en un editor, permitiría convertir bocetos o referencias visuales en código de escena editable.
- Automatización de la creación de assets de escena para visualización de producto: a partir de una imagen de referencia, generar la estructura Three.js que posicione cámaras, luces y geometrías básicas.
- Investigación en generación de código multimodal: sirve como punto de partida para estudiar cómo el ajuste fino sobre CoT + código afecta a la calidad del código generado en tareas 3D.
- Educación en programación gráfica: el modelo puede generar ejemplos de código Three.js con razonamiento intermedio, útil como material didáctico para aprender a construir escenas 3D en la web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5.174.964.736 parámetros, en FP16 se requieren aproximadamente 10,3 GB solo para los pesos, más overhead de activaciones y contexto; en cuantización de 8 bits, alrededor de 5,2 GB; en 4 bits, alrededor de 2,6 GB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados por el autor.
- GPU recomendadas: para FP16, una GPU con 16 GB o más (RTX 4090, A100 40 GB, H100). Para cuantización 8 bits, una GPU con 8-12 GB (RTX 3060 12 GB, RTX 4070). Para 4 bits, potencialmente GPUs con 6-8 GB.
- Cabe en GPU de consumo: sí, especialmente con cuantización; en FP16 requiere GPUs de gama alta con 16 GB o más.
- Opciones de despliegue: no documentadas por el autor. Al ser un modelo con pesos safetensors y arquitectura Qwen3.5, podría desplegarse con vLLM, TGI o transformers si la arquitectura es compatible; llama.cpp y Ollama requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-CoCoT-SFT-v8-equal-20261123 | 5.174.964.736 | no disponible | no disponible | Hugging Face | Ajuste fino especializado en Three.js |
| Qwen/Qwen3.5-4B | ~4B (no confirmado) | no disponible | no disponible | Hugging Face | Modelo base, propósito general |
| Otros ajustes finos de Qwen3.5-4B | no disponible | no disponible | no disponible | Hugging Face | No se dispone de datos comparables |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría. La comparación se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- La model card no documenta licencia, lo que impide conocer las restricciones de uso comercial; debe contactarse con el autor o asumir que no hay licencia explícita.
- El modelo está ajustado sobre un dataset muy pequeño (2.609 ejemplos) y una única tarea (Three.js), por lo que su capacidad de generalización fuera de ese dominio es incierta y probablemente limitada.
- No se documentan idiomas soportados; el ajuste fino podría haber degradado capacidades multilingües del modelo base.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad ni de rendimiento en la tarea objetivo.
- Riesgo de alucinación en la generación de código Three.js: el modelo puede producir APIs inexistentes o geometrías incorrectas, especialmente en escenas complejas.
- No se documenta el contexto máximo, lo que impide planificar su uso en conversaciones o escenas de gran tamaño.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- Al ser un checkpoint intermedio (epoch 4, paso 164), puede no representar el mejor estado del entrenamiento.
- No hay información sobre sesgos conocidos; al derivar de Qwen3.5-4B, podría heredar sesgos del modelo base, pero no se documenta.

## Enlaces

- Hugging Face: https://huggingface.co/cocotofficial/Qwen3.5-4B-CoCoT-SFT-v8-equal-20261123
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/cocotofficial/mmsi-hss-qwen4max-threejs-sft-v8
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
