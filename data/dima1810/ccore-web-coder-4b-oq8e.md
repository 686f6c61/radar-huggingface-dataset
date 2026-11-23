# dima1810/CCORE-Web-Coder-4B-oQ8e

## Resumen

CCORE-Web-Coder-4B-oQ8e es una cuantizacion mixta de 8 bits del modelo ccore/CCORE-Web-Coder-4B, publicada por el usuario dima1810. El checkpoint conserva la arquitectura original (etiquetada como qwen3_5 en los metadatos de Hugging Face) con 4.539.265.536 parametros reales, de los cuales aproximadamente 0.334B corresponden a un modulo de vision y 4.206B al modelo de lenguaje. El resultado es un artefacto de 5.137 GB de almacenamiento con un promedio efectivo de 9.053 bits por peso.

La pieza diferencial es el proceso de cuantizacion: se ha utilizado oQ (oMLX v0.8.2), una herramienta de cuantizacion de precision mixta, que mantiene el 92,632% de los pesos en affine 8-bit con grupos de 64 y deja el 7,368% restante en BF16. Esa mezcla preserva en BF16 las capas mas sensibles (tipicamente embeddings, cabezas de atencion o proyecciones de vision) mientras comprime el grueso de la red, un compromiso habitual para reducir perdida de calidad frente a una cuantizacion uniforme de 8 bits.

El modelo esta empaquetado en formato MLX, lo que lo orienta a inferencia en hardware Apple Silicon (M1/M2/M3/M4) mediante el framework MLX de Apple. No se dispone de informacion publicada sobre el modelo base, su entrenamiento, licencia o idiomas en la informacion proporcionada, por lo que esta ficha se limita a documentar lo que el autor declara en la model card y los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta qwen3_5 en metadatos; detalles no disponibles) |
| Parametros totales | 4.539.265.536 (4.539B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 8-bit grupo 64 (92,632% de pesos) + BF16 (7,368%); promedio 9,053 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |
| Parametros del modelo de lenguaje | 4.206B (4.470 GB) |
| Parametros del modulo de vision | 0.334B (0.667 GB) |
| Tamano del repositorio | 5.1 GB (4.784 GiB) |
| Modelo base | ccore/CCORE-Web-Coder-4B |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que el modelo base sigue una arquitectura de tipo transformer con un componente de vision integrado, dado que el checkpoint cuantizado separa explicitamente un bloque "Language model" de 4.206B parametros y un bloque "Vision" de 0.334B. La etiqueta qwen3_5 sugiere una familia derivada de Qwen, pero no hay confirmacion en la model card ni detalles sobre numero de capas, dimensiones ocultas, mecanismo de atencion o si emplea atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, no se ha publicado en la informacion proporcionada ningun dato sobre volumen de tokens, composicion del dataset, fases de alineacion (RLHF, DPO) ni tecnicas de optimizacion. La unica innovacion documentada es el propio proceso de cuantizacion de precision mixta con oQ (oMLX v0.8.2), que asigna 8 bits con grupos de 64 a la mayoria de tensores y conserva en BF16 un subconjunto del 7,368% de los pesos, presumiblemente los mas sensibles a la cuantizacion. El nombre "Web-Coder" del modelo base apunta a un entrenamiento orientado a generacion de codigo web, aunque esta afirmacion no se puede verificar con los datos disponibles.

## Capacidades

- Generacion de texto y codigo: el nombre del modelo base (Web-Coder) sugiere especializacion en codigo orientado a web, aunque no hay evaluaciones publicadas que lo confirmen.
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 0.334B parametros, lo que indica capacidad multimodal de entrada de imagenes.
- Razonamiento y matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking o razonamiento extendido: no disponible.
- Inferencia en Apple Silicon: soportada de forma nativa mediante la libreria MLX.

## Casos de uso

- Asistencia de codigo en local sobre Mac: el checkpoint en formato MLX permite ejecutar un modelo de 4.5B parametros en un Mac con Apple Silicon sin GPU dedicada, integrandolo en editores o terminales para autocompletado y generacion de fragmentos de codigo web.
- Prototipado de aplicaciones web con asistencia de IA en el portatil del desarrollador: al ocupar 5.1 GB en disco y requerir memoria unificada modesta, se puede cargar junto al IDE y un navegador en equipos con 16 GB de RAM unificada.
- Analisis de capturas de pantalla o mockups: el modulo de vision permite pasar imagenes al modelo para tareas como describir interfaces o extraer estructura de un diseno, siempre que el modelo base haya sido entrenado para ello.
- Pipelines de CI/CD con inferencia local: al no depender de APIs externas, el modelo puede integrarse en scripts de revision de codigo que se ejecutan en runners macOS con MLX.
- Educacion y experimentacion con cuantizacion: sirve como caso de estudio de cuantizacion mixta (8-bit + BF16) para investigadores que quieran medir la perdida de calidad frente al modelo base completo.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente, el codigo y las imagenes del usuario no salen del dispositivo, lo que encaja en entornos con politicas estrictas de confidencialidad.
- Evaluacion comparativa de tecnicas de cuantizacion: util para comparar oQ frente a otras herramientas (GGUF, AWQ, GPTQ) en terminos de bits por peso y calidad resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 5-6 GB para cargar los pesos (4.784 GiB de checkpoint) mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 8 GB de memoria unificada y 16 GB para trabajar con comodidad.
- GPU recomendadas: no aplica GPU dedicada; el formato MLX esta disenado para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se ha validado su uso en CUDA.
- Compatibilidad con GPU de consumo: si, en cualquier Mac con chip de la serie M y al menos 8 GB de memoria unificada; los chips Pro/Max ofrecen mayor ancho de banda y por tanto mejor throughput.
- Opciones de despliegue: MLX (libreria nativa), mlx-lm para el modelo de lenguaje y utilidades MLX-VLM si se quiere explotar el modulo de vision. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI con este checkpoint.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| CCORE-Web-Coder-4B-oQ8e | 4.539B (4.206B LM + 0.334B vision) | no disponible | MLX safetensors (8-bit mixto) | no disponible | Cuantizacion oQ, orientado a Apple Silicon |
| ccore/CCORE-Web-Coder-4B | no disponible | no disponible | no disponible | no disponible | Modelo base sin cuantizar |
| Qwen2.5-Coder-3B / 7B | 3B / 7B | 32K (tipico en la familia) | safetensors, GGUF | Apache 2.0 (familia Qwen) | Referencia habitual en codigo; datos no verificados para este caso |

La comparativa con alternativas concretas no esta disponible en la informacion proporcionada; solo se puede contrastar con el modelo base del que deriva.

## Limitaciones y advertencias

- La cuantizacion mixta a 8 bits introduce una perdida de calidad no cuantificada frente al modelo base; no hay evaluaciones publicadas que midan esa degradacion.
- El modelo esta empaquetado exclusivamente en formato MLX, por lo que no es directamente utilizable en entornos CUDA, ROCm o CPU generica sin reconversion.
- No se dispone de informacion sobre la licencia, lo que impide confirmar si el uso comercial esta permitido; debe consultarse el repositorio del modelo base antes de cualquier despliegue en produccion.
- No hay datos sobre idiomas soportados ni sobre sesgos conocidos; se desconoce su comportamiento fuera del ingles y en dominios sensibles.
- Riesgo de alucinacion inherente a modelos de este tamano, agravado por la ausencia de benchmarks que permitan calibrar su fiabilidad.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- La fecha de creacion (2026-11-23) y la etiqueta qwen3_5 no se pueden contrastar con informacion publica adicional en la informacion proporcionada.
- El modulo de vision puede no estar alineado con instrucciones de texto si el modelo base no fue entrenado para ello; no hay documentacion al respecto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dima1810/CCORE-Web-Coder-4B-oQ8e
- Modelo base: https://huggingface.co/ccore/CCORE-Web-Coder-4B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Framework MLX de Apple: https://github.com/ml-explore/mlx
