# 4E-AI/Fidel2.0-1B

## Resumen

Fidel2.0-1B es un modelo de lenguaje autoregresivo de tipo texto, desarrollado por 4E-AI, especializado en programación competitiva: interpretar enunciados de problemas, razonar sobre algoritmos y estructuras de datos, escribir soluciones completas y corregirlas a partir de feedback de ejecución proporcionado por la aplicación. Es la versión 2.0 de la familia Fidel y parte de Fidel1.1-1B como modelo base, con pesos publicados bajo licencia Apache-2.0.

Su rasgo diferencial es la arquitectura híbrida: 9 capas de backbone compuestas por 8 bloques Mamba3 MIMO (modelado de secuencia en espacio de estados) y 1 bloque de atención, con mezcla de expertos latente en cada bloque (16 expertos, 2 seleccionados por token, dimensión latente 512) más una ruta feed-forward compartida de dimensión intermedia 6.144. La dimensión oculta es 1.536, el vocabulario 131.072 tokens y la ventana de contexto 8.192 tokens.

El modelo suma 1.402.957.777 parámetros almacenados y se distribuye en un único `model.safetensors` de 5,37 GB en precisión nativa (bfloat16, float32 y bool), sin cuantización adicional. No requiere descargar adaptadores por separado: backbone, adaptación a código, condicionamiento de prompt y componentes conversacionales están unificados. La relevancia práctica es doble: propone una arquitectura híbrida SSM/atención/MoE a escala 1B y publica pesos completos, pero exige un runtime propio (`fidel_compatibility`) y no incluye resultados de benchmarks ni datos de entrenamiento detallados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 8 bloques Mamba3 MIMO + 1 bloque de atención, con mixture-of-experts latente en cada bloque |
| Parametros totales | 1.402.957.777 |
| Parametros activos | No disponible (el autor no publica el recuento; el enrutamiento selecciona 2 de 16 expertos por bloque, además de la ruta compartida) |
| Longitud de contexto | 8.192 tokens (límite combinado de entrada y salida) |
| Tipos de cuantizacion | No disponible. El autor publica los pesos sin cuantizar (bfloat16, float32, bool); no hay GGUF ni versiones cuantizadas publicadas |
| Idiomas soportados | No disponible (la model card no especifica idiomas; vocabulario de 131.072 entradas) |
| Licencia | Apache-2.0 |
| Formato de pesos | SafeTensors (`model.safetensors`, 5,37 GB) |
| Dimension oculta | 1.536 |
| Numero de capas del backbone | 9 |
| Cabezas de atencion (query / key-value) | 16 / 4, dimension de cabeza 96 |
| Cabezas Mamba / dimension de cabeza | 48 / 64 |
| Dimension de estado Mamba / rango MIMO | 64 / 4 |
| Expertos por capa MoE / seleccionados por token | 16 / 2, dimension latente 512, dimension intermedia 2.048 |
| Feed-forward compartido | Dimension intermedia 6.144 |
| Tamano de vocabulario | 131.072 |
| Embedding y cabeza de salida | Matrices de peso separadas |
| Tipo de modelo | Lenguaje autoregresivo, solo texto |
| Tamano del repositorio | 5,4 GB |

## Arquitectura y entrenamiento

El backbone combina dos paradigmas de mezcla de tokens en una sola pila de 9 capas: ocho bloques Mamba3 MIMO, que modelan la secuencia mediante un espacio de estados con estado de dimensión 64 y rango MIMO 4, y un único bloque de atención con 16 cabezas de query y 4 de key-value (GQA, dimensión de cabeza 96). Cada bloque incorpora además una capa de mezcla de expertos latente: los tokens se enrutan a 2 de 16 expertos en un espacio latente de 512 dimensiones, en paralelo a una ruta feed-forward compartida de 6.144 dimensiones. La dimensión oculta es 1.536 y el vocabulario de 131.072 tokens; embedding y cabeza de salida no comparten pesos.

El modelo parte de Fidel1.1-1B y se ha adaptado con el dataset `4E-AI/Fidel-Competitive-coding`, orientado a problemas de programación competitiva. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron etapas de RLHF, DPO o ajuste por feedback de ejecución; tampoco se documentan innovaciones de decodificación (especulativa u otras). El autor declara que cada tensor conserva su tipo de dato y valores originales, sin conversión de precisión adicional, y que el paquete incluye un runtime de compatibilidad con Transformers (`fidel_compatibility` 0.3.0.dev0) para poder cargar la arquitectura.

## Capacidades

- Generación de código para problemas de programación competitiva: interpreta enunciados con restricciones, plantea algoritmos y estructuras de datos y produce programas completos.
- Razonamiento algorítmico guiado por el enunciado (complejidad, casos límite, estrategia de solución), siempre que el prompt aporte el contexto del problema.
- Revisión a partir de feedback: si la aplicación introduce resultados de ejecución o trazas de error en la conversación, el modelo puede generar una respuesta de reemplazo. El modelo no ejecuta código por sí mismo.
- Formato conversacional: plantilla de chat Jinja, tokens especiales y tokenizador original incluidos, con soporte para instrucciones, ejemplos y historial multi-turno.
- Generación de texto general y respuesta conversacional, heredada del modelo base.
- Adaptación posterior: los pesos completos permiten fine-tuning específico de dominio con el flujo de trabajo Fidel.
- No soporta tool calling ni function calling de forma nativa según la información disponible.
- No soporta agentes con ejecución de herramientas, búsqueda web ni razonamiento multi-paso con verificación externa dentro del propio modelo.
- Sin capacidades multimodales: no procesa imagen, audio ni vídeo.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Asistente de práctica de programación competitiva: el modelo recibe el enunciado con sus restricciones y devuelve una solución completa; su contexto de 8.192 tokens permite incluir el problema, ejemplos de entrada/salida y el historial de intentos en una sola ventana.
- Bucle de corrección automática en un juez online: la plataforma ejecuta la solución, inyecta el veredicto (WA, TLE, error de compilación) como mensaje y solicita una revisión; el modelo está entrenado explícitamente para responder a ese feedback, aunque la ejecución debe aportarla la infraestructura.
- Generación de soluciones de referencia para conjuntos de problemas: útil para crear baselines en un banco de ejercicios, con revisión humana posterior dado que no hay benchmarks publicados.
- Tutoría técnica paso a paso: explicar la elección de estructura de datos o la complejidad de una solución propuesta por el estudiante, aprovechando el formato de chat multi-turno.
- Experimentación en arquitecturas híbridas SSM/MoE: al publicar pesos nativos y manifiesto de tensores (`weights_manifest.json`), sirve como banco de pruebas para investigar enrutamiento de expertos y mezcla Mamba/atención a escala 1B.
- Base para fine-tuning de dominio: adaptar el modelo a un lenguaje o framework concreto (por ejemplo, C++ competitivo o SQL analítico) partiendo de los pesos completos y del tokenizador incluido.
- Prototipos de asistente de código en local: con 5,37 GB de pesos en bfloat16 cabe en GPU de consumo alto, lo que permite probar flujos de generación de código sin depender de una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, LiveCodeBench ni de ningún otro conjunto, ni comparaciones con modelos de la misma categoría. Tampoco se documentan latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 5,37 GB en el repositorio (bfloat16, float32 y bool). Con overhead de runtime, caché de estados Mamba y caché KV del bloque de atención, un escenario realista a 8.192 tokens se sitúa en el entorno de 8-12 GB, aunque el autor no publica cifras oficiales.
- GPU recomendadas: NVIDIA A100 o H100 para servir con lotes y contextos largos; RTX 4090 (24 GB) para uso individual sin restricciones de contexto.
- GPU de consumo: RTX 3090/4090 (24 GB) con margen amplio; RTX 4080/4070 Ti Super (16 GB) previsiblemente viable; RTX 3060 12 GB solo como opción ajustada y no verificada por el autor.
- Requisitos de entorno: Linux, Python 3.11, GPU NVIDIA con CUDA, toolkit de desarrollo CUDA (`nvcc`) y compilador de C++ para instalar el runtime `fidel_compatibility`. Dependencia de `torch==2.15.0.dev20260928+cu130` (build nightly de PyTorch).
- Opciones de despliegue: Transformers con el wheel `fidel_compatibility` y `cache_mode="chunk_state"`. No hay soporte confirmado en vLLM, llama.cpp, Ollama, TGI ni servidores compatibles con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Rendimiento en código |
|---|---|---|---|---|---|
| Fidel2.0-1B (4E-AI) | 1,40 B (activos no disponibles) | 8.192 | Híbrida Mamba3 MIMO + atención + MoE latente | Apache-2.0 | Sin benchmarks publicados |
| Qwen2.5-Coder-1.5B-Instruct | 1,5 B | 32.768 | Transformer denso | Apache-2.0 | Métricas publicadas por el autor; no comparable aquí por falta de datos de Fidel |
| DeepSeek-Coder-1.3B-Instruct | 1,3 B | 16.384 | Transformer denso | Licencia propia de DeepSeek (uso comercial permitido con condiciones) | Métricas publicadas por el autor; no comparable aquí |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 | Transformer denso | Apache-2.0 | Enfoque generalista, no específico de código |

La comparación directa de calidad no es posible: Fidel2.0-1B no publica resultados. Las alternativas densas de tamaño similar tienen ecosistema estándar (Transformers, vLLM, llama.cpp, GGUF) y contextos mayores en el caso de Qwen2.5-Coder; Fidel2.0-1B aporta una arquitectura híbrida poco habitual y una especialización declarada en programación competitiva, a cambio de un runtime propietario y ausencia de validación externa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en código, razonamiento o matemáticas; cualquier evaluación de producción debe hacerse por cuenta del integrador.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la ficha, publicación reciente y un único autor.
- El modelo no ejecuta código ni verifica sus soluciones; el feedback de ejecución debe inyectarlo la aplicación. Riesgo alto de soluciones sintácticamente válidas pero incorrectas o ineficientes en complejidad.
- Riesgo de alucinación en restricciones del problema, APIs de librerías y casos límite, especialmente fuera de programación competitiva.
- Contexto limitado a 8.192 tokens combinados de entrada y salida, inferior al de alternativas como Qwen2.5-Coder-1.5B (32.768).
- Idiomas no documentados: no hay garantía de calidad en castellano ni en ningún otro idioma distinto del inglés técnico de los enunciados.
- Sin tool calling, sin soporte multimodal, sin navegación web ni ejecución de herramientas.
- Dependencia de un runtime propio (`fidel_compatibility` 0.3.0.dev0) y de un build nightly de PyTorch con CUDA 13.0, además de `nvcc` y compilador C++ para la instalación; esto complica la reproducibilidad y la integración en pipelines estándar.
- Sin soporte conocido en vLLM, llama.cpp, Ollama o TGI, y sin versiones cuantizadas (GGUF, AWQ, GPTQ): el despliegue eficiente en hardware modesto no está resuelto por el autor.
- El recuento de parámetros activos no se publica, lo que impide estimar con precisión coste de cómputo por token.
- Dataset de entrenamiento (`4E-AI/Fidel-Competitive-coding`) sin documentación pública sobre tamaño, composición, procedencia ni licencias del código fuente; posible contaminación de benchmarks y riesgos de licencia heredados del corpus.
- Licencia Apache-2.0 permite uso comercial, modificación y redistribución, pero debe conservarse el aviso de atribución (`NOTICE`) y verificarse las condiciones de los componentes incluidos en `compatibility/`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/4E-AI/Fidel2.0-1B
- Modelo base: https://huggingface.co/4E-AI/Fidel1.1-1B
- Dataset de entrenamiento: https://huggingface.co/datasets/4E-AI/Fidel-Competitive-coding
- Runtime de compatibilidad: https://huggingface.co/4E-AI/Fidel2.0-1B/resolve/main/compatibility/fidel_compatibility-0.3.0.dev0-py3-none-any.whl
- Manifiesto de tensores: https://huggingface.co/4E-AI/Fidel2.0-1B/blob/main/weights_manifest.json
- Paper, blog o demo oficiales: no disponibles en la información proporcionada
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo (solo páginas de ayuda de YouTube, sin relación con Fidel2.0-1B)
