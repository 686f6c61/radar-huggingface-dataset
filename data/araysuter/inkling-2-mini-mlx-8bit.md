# araysuter/Inkling-2-Mini-MLX-8bit

## Resumen

Inkling-2-Mini-MLX-8bit es una conversión cuantizada a 8 bits en formato MLX del checkpoint oficial Inkling-2-Mini de Thinking Machines. La publica el usuario independiente araysuter y está pensada para ejecutar el modelo en Apple Silicon mediante la librería MLX. Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura MoE (mixture of experts) y aproximadamente 26.400 millones de parámetros lógicos, según los datos del safetensors y la model card del autor.

El modelo base resuelve tareas de generación de texto, razonamiento y comprensión de imágenes dentro de un único pipeline. La conversión parte del release oficial entrenado en NVFP4/MXFP8, no de un checkpoint BF16 original, y aplica cuantización afín de 8 bits con tamaño de grupo 32 sobre las matrices lineales, embeddings y cabeza de salida, manteniendo en coma flotante original el tower de visión, el enrutamiento de expertos y las compuertas de bucle y mensaje.

Su relevancia es práctica: permite desplegar un modelo multimodal MoE de gran tamaño en hardware de Apple con un peso total de unos 30 GB, a costa de requerir una versión específica de MLX-LM que soporte la arquitectura `inkling2_loop`. La licencia es Apache-2.0, aunque se aplican también los términos del modelo fuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con bucle de capas (`inkling2_loop`); 24 capas almacenadas y 48 aplicaciones por token |
| Parámetros totales | ~26.388.559.360 (26,4B lógicos, según upstream) |
| Parámetros activos | no disponible |
| Longitud de contexto | 131.072 tokens totales (entrada más salida) según el adaptador probado por el autor; no cualificado para dos ventanas de 128K en 64 GiB |
| Tipos de cuantización | 8-bit afín, group size 32, redondeo min/max round-to-nearest; pesos de visión y compuertas en coma flotante original |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (se aplican los términos del modelo fuente) |
| Formato de pesos | safetensors (MLX), ~30,04 GB / 27,98 GiB incluyendo visión |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con un mecanismo de bucle de capas: se almacenan 24 capas y cada token pasa por 48 aplicaciones de capa, de modo que las capas intermedias se ejecutan tres veces. Incluye un tower de visión para entrada image-text-to-text, enrutamiento de expertos y compuertas de bucle y mensaje. La conversión conserva todas las capas y aplicaciones del modelo original.

El entrenamiento original corresponde a Thinking Machines; esta ficha no dispone de datos sobre número de tokens, composición del dataset ni fases de RLHF/DPO. La conversión es weight-only: no hay calibración de activaciones ni GPTQ/AWQ, y el autor no reclama mejora de calidad frente a su versión de 5 bits. La validación incluye pruebas de aritmética textual, sintaxis de Python y comprobaciones de color y forma en imágenes, con un delta NLL de 0,008163 y un ratio de perplejidad de 1,008196 frente al release oficial sobre una sonda de texto público pequeña.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno.
- Comprensión de imágenes (pipeline image-text-to-text): color, forma y contenido visual.
- Generación y verificación de código (las pruebas de validación incluyen sintaxis de Python).
- Aritmética textual básica.
- Soporte de contexto largo de hasta 131.072 tokens totales de entrada más salida.
- Arquitectura MoE con enrutamiento de expertos, orientada a eficiencia computacional.
- Capacidades de tool calling, agentes y multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener diálogos multi-turno con contexto largo (hasta 131.072 tokens) ejecutándose íntegramente en Apple Silicon mediante MLX, sin depender de la nube.
- Análisis de imágenes en escritorio: al ser image-text-to-text, permite describir, clasificar o responder preguntas sobre imágenes locales en flujos de trabajo de accesibilidad o catalogación.
- Asistencia a la programación en local: genera y valida fragmentos de Python; encaja en editores o scripts que requieran inferencia privada sin enviar código a servicios externos.
- Prototipado de agentes con API compatible con OpenAI: mediante el adaptador TensorFold indicado por el autor, se puede exponer el checkpoint como endpoint local para pruebas de pipelines agénticos.
- Investigación en cuantización: sirve como referencia para estudiar el impacto del almacenamiento a 8 bits frente a 5 bits en un MoE multimodal, con métricas de perplejidad publicadas.
- Educación y experimentación: permite a estudiantes ejecutar un modelo de 26,4B en hardware de consumo Apple para prácticas de inferencia y evaluación.
- Procesamiento de documentos largos con imagen: combinación de ventana de contexto amplia y entrada visual para resumir o extraer información de documentos escaneados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la validación de reconstrucción frente al release oficial (delta NLL 0,008163, ratio de perplejidad 1,008196), que no constituye una puntuación de calidad del modelo.

## Requisitos de hardware

- VRAM/RAM estimada: ~30 GB de pesos (27,98 GiB) más overhead de contexto, concurrencia, imágenes y workspace en tiempo de ejecución.
- Hardware objetivo: Apple Silicon con MLX; el autor advierte que la subida por sí sola no cualifica dos ventanas de 128K en una máquina de 64 GiB.
- GPU NVIDIA: no disponible; el formato MLX está orientado a Apple Silicon.
- ¿Cabe en GPU de consumo? No aplica al formato MLX; en Apple Silicon requiere equipos con memoria unificada suficiente (el autor no especifica el mínimo exacto).
- Despliegue: `mlx_lm.generate` con MLX 0.32.4, transformers 5.23.0 y un port fijado de MLX-LM (`0c4c99192230f1943dd468d297f0b8a64ae7b7c2`); API compatible con OpenAI a través del adaptador TensorFold.
- Latencia y throughput: no disponibles; el autor indica que la comparación de RAM y velocidad con 5 bits se está midiendo por separado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-8bit (este) | ~26,4B | 131.072 tokens (probado) | MLX safetensors 8-bit | Apache-2.0 | Hugging Face, 0 descargas |
| thinkingmachines/Inkling-2-Mini (base) | ~26,4B | no disponible | NVFP4/MXFP8 | Apache-2.0 (según card) | Hugging Face (oficial) |
| Conversión 5-bit del mismo autor | ~26,4B | no disponible | MLX 5-bit | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks para comparar el rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización a 8 bits no recupera precisión ausente en la fuente NVFP4/MXFP8; el autor no reclama mejora de calidad frente a 5 bits.
- Es una conversión independiente, no un release oficial de Thinking Machines.
- Requiere un port específico de MLX-LM; una versión estándar sin soporte de Inkling no puede cargar la arquitectura.
- El fichero auxiliar `mtp.safetensors` no se incluye: el drafting (decodificación especulativa) no está habilitado ni cualificado.
- El consumo de memoria crece con el contexto, la concurrencia, las imágenes y el workspace; el contexto máximo probado (131.072 tokens) depende de la máquina.
- No hay datos publicados sobre sesgos, idiomas soportados ni tasas de alucinación.
- Aunque la licencia es Apache-2.0, se aplican los términos del modelo fuente; conviene revisarlos antes de uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/araysuter/Inkling-2-Mini-MLX-8bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini (revisión `6e7c8248f75265bdd4fbab5273304243b5d8c2cb`)
- Adaptador TensorFold (API compatible con OpenAI): https://github.com/araysuter/TensorFold/tree/main/tools/inkling
- MLX-LM: https://github.com/ml-explore/mlx-lm (commit `0c4c99192230f1943dd468d297f0b8a64ae7b7c2`)
- Ficheros de validación en el repo: `VALIDATION.json` y `QUANTIZATION_MANIFEST.json`
