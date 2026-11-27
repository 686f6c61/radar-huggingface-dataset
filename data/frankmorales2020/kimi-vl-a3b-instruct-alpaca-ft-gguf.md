# frankmorales2020/Kimi-VL-A3B-Instruct-alpaca-ft-GGUF

## Resumen

Kimi-VL-A3B-Instruct-alpaca-ft-GGUF es una adaptacion en formato GGUF del modelo multimodal moonshotai/Kimi-VL-A3B-Instruct, publicada por el usuario independiente frankmorales2020. Se trata de un fine-tune de tipo Alpaca sobre el modelo base, en el que unicamente se han ajustado el `lm_head` y las capas de normalizacion del modelo de lenguaje (aproximadamente 335 millones de parametros), partiendo de una base cuantizada a 4 bits y entrenando con el dataset yahma/alpaca-cleaned durante una epoca (12.500 ejemplos). El checkpoint resultante se distribuye en formato GGUF Q8_0, con un tamano de repositorio de 17 GB y 15.960.110.208 parametros reales declarados.

La relevancia de esta ficha es acotada: no se trata de un lanzamiento oficial de Moonshot AI, sino de un experimento de ajuste continuo (continual learning) documentado por el autor, orientado a entornos de inferencia ligera con llama.cpp y Ollama. El modelo resultante es exclusivamente de texto: no incluye el proyector de vision (mmproj), por lo que pierde la capacidad multimodal del Kimi-VL original.

El interes tecnico reside en su metodologia (etiquetada por el autor como topo-cbp, topoadamw y arithmetic-spectral-theory) y en su licencia MIT, que facilita su reutilizacion. No obstante, la informacion publica disponible es muy limitada: no hay benchmarks, no se declaran idiomas soportados y la model card es escueta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Kimi-VL-A3B-Instruct (modelo base multimodal); esta version es solo texto, sin proyector de vision |
| Parametros totales | 15.960.110.208 (aprox. 16B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; el ejemplo de inferencia usa `n_ctx=2048` |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado: `kimi-vl-ft-Q8_0.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

El modelo base, Kimi-VL-A3B-Instruct, es un modelo multimodal de Moonshot AI que combina un codificador de vision con un modelo de lenguaje de tipo mixture-of-experts (la nomenclatura A3B sugiere parametros activos en el rango de 3B, aunque este dato no se confirma en la informacion disponible). Esta adaptacion conserva la parte de lenguaje y descarta el proyector de vision, por lo que el resultado es un modelo de texto puro.

El proceso de ajuste descrito por el autor es deliberadamente restringido: solo se entrenan `lm_head` y las capas de normalizacion del modelo de lenguaje (unos 335M parametros), partiendo de una base cuantizada a 4 bits, sobre yahma/alpaca-cleaned (12.500 ejemplos) durante una epoca. La perdida de validacion paso de 1,043 a 0,990. El autor etiqueta el metodo con terminos como continual backpropagation, topo-cbp, topoadamw y stability-plasticity, y publica el cuaderno de entrenamiento en Triton en su repositorio de GitHub (AST). No se documentan detalles sobre datos de RLHF/DPO ni sobre innovaciones de decodificacion.

## Capacidades

- Generacion de texto conversacional en formato chat (el ejemplo de la model card usa `create_chat_completion`).
- Instrucciones de estilo Alpaca: reescritura, resumen, explicaciones breves y listas.
- Razonamiento basico y respuesta a preguntas generales, segun los ejemplos publicados.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, vision, audio): no. La vision se elimina al no incluir el proyector mmproj.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en local: con llama.cpp u Ollama, el fichero Q8_0 permite levantar un chatbot de texto sin infraestructura en la nube, util para pruebas de concepto.
- Experimentacion con ajuste continuo: el modelo sirve como caso de estudio reproducible de fine-tuning parcial (solo `lm_head` y normas) sobre una base cuantizada, con el cuaderno de Triton publicado por el autor.
- Tareas de reescritura y estilo: normalizacion de frases informales a registro formal, como muestra el ejemplo de la model card.
- Generacion de respuestas breves y listas: resumenes, consejos y explicaciones concisas en contextos de baja latencia.
- Evaluacion de estabilidad-plasticidad: util para investigadores que quieran medir el olvido catastrofico tras un ajuste ligero sobre un modelo grande.
- Despliegue en entornos con GPU consumer: al ser un GGUF Q8_0 de 17 GB, puede ejecutarse en estaciones de trabajo con suficiente VRAM o con offload parcial a CPU.
- Base para experimentos de cuantizacion adicional: el GGUF puede recuantizarse a Q4/Q5 para reducir requisitos de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es la perdida de validacion durante el ajuste (de 1,043 a 0,990), que no es comparable con metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 17 GB, por lo que se necesitan al menos ~17-18 GB de VRAM para cargarlo completamente en GPU.
- GPU recomendadas: A100 40/80 GB, H100, RTX A6000 (48 GB), RTX 4090 (24 GB, justo para Q8_0 con contexto corto).
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) con margen limitado; en GPUs de 16 GB seria necesario offload parcial a CPU o recuantizar a Q4/Q5.
- Opciones de despliegue: llama.cpp (via `llama-cpp-python`, como en el ejemplo), Ollama, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kimi-VL-A3B-Instruct-alpaca-ft-GGUF (este) | ~16B | no disponible (ejemplo con 2048) | MIT | GGUF Q8_0 | Solo texto, fine-tune parcial |
| moonshotai/Kimi-VL-A3B-Instruct (base) | no disponible | no disponible | no disponible | safetensors | Multimodal, modelo original |
| Alternativas de texto de ~16B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo con otros modelos en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo oficial de Moonshot AI: es un fine-tune de un usuario independiente, sin validacion por parte del equipo original.
- Perdida de capacidades multimodales: al no incluir el proyector mmproj, no procesa imagenes.
- Ajuste muy limitado: solo se entrenan ~335M parametros (lm_head y normas), por lo que las mejoras respecto al base son marginales y el riesgo de olvido catastrofico no esta cuantificado.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad frente al modelo base ni frente a alternativas.
- Idiomas no declarados: no se garantiza un rendimiento adecuado en castellano u otros idiomas distintos del ingles de Alpaca.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan mitigaciones.
- Sesgos: el dataset Alpaca-cleaned es de dominio publico y en ingles, con sesgos no evaluados.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Contexto no especificado: el ejemplo usa 2048 tokens; no se confirma la ventana nativa del modelo base.
- Repositorio con pocas descargas (196) y likes (2): baja validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/frankmorales2020/Kimi-VL-A3B-Instruct-alpaca-ft-GGUF
- Cuaderno de entrenamiento (GitHub): https://github.com/frank-morales2020/AST/blob/main/triton_Kimi_topo_cbp_gguf.ipynb
- Modelo base: https://huggingface.co/moonshotai/Kimi-VL-A3B-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/yahma/alpaca-cleaned
