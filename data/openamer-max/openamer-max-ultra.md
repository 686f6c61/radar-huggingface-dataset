# openamer-max/openamer-max-ultra

## Resumen

OpenAmer-Ultra es un ajuste fino del modelo base Qwen2.5-32B-Instruct, desarrollado por el colectivo openamer-max y publicado bajo licencia Apache-2.0. Se trata de un modelo de generación de texto de 32.763.876.352 parámetros (32B) orientado a un uso local-first, distribuido principalmente en formato GGUF cuantizado Q4_K_M para su ejecución con Ollama y llama.cpp. Forma parte de una familia de seis tamaños (Watch 0,6B, Phone 3,1B, Tab 7,6B, Desktop 14,7B, Pro 24B y Ultra 32B) y constituye la etapa de mayor tamaño de la serie.

El modelo se ha entrenado mediante QLoRA (r=32, alpha=64, una época, 2.716 frases, cuantización 4-bit NF4) sobre el citado Qwen2.5-32B-Instruct, con el objetivo de mejorar el seguimiento de instrucciones, la adherencia a formatos, el manejo de negaciones y la honestidad ante preguntas sin respuesta conocida, en alemán, inglés y bosnio. Su contexto máximo de entrenamiento es de 32.768 tokens, aunque la medición del autor sitúa el mayor acierto práctico en 30.067 tokens (92 % del máximo).

La relevancia de este modelo reside en su transparencia poco habitual: el propio autor documenta que Ultra, pese a ser la etapa más grande, obtiene un resultado inferior (41/45, 91,1 %) que las etapas Desktop (44/45) y Pro (43/45) en su banco de pruebas de 45 casos, atribuyéndolo a que 2.890 frases de entrenamiento son insuficientes para justificar 32B de parámetros. Es, por tanto, un modelo útil para evaluación y experimentación local más que un candidato a producción de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-32B-Instruct), ajuste QLoRA |
| Parametros totales | 32.763.876.352 (32B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (máximo de entrenamiento); mayor acierto medido: 30.067 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF); adaptador QLoRA separado en 4-bit NF4 |
| Idiomas soportados | Alemán (de), inglés (en), bosnio (bs) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (openamer-max-ultra-q4.gguf, 18,49 GB); adaptador LoRA separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer denso de 32B parámetros con atención estándar (no se documentan innovaciones de atención lineal ni decodificación especulativa en la información disponible). Sobre esa base se aplicó un ajuste fino supervisado mediante QLoRA con rango r=32, alpha=64, una única época y cuantización 4-bit NF4, empleando 2.716 frases (2.890 según la tabla comparativa del autor). El pico de VRAM durante el entrenamiento fue de 25,79 GB sobre una GPU L40S de 48 GB.

No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado. El autor reconoce explícitamente que el volumen de datos es insuficiente para un modelo de 32B y que las etapas menores de la familia resultan más eficientes en su banco de pruebas. El entrenamiento se realizó con herramientas locales y HuggingFace Jobs.

## Capacidades

- Generación de texto conversacional multi-turno en alemán, inglés y bosnio.
- Seguimiento de instrucciones y adherencia a formatos (medido en el banco de pruebas del autor).
- Manejo de negaciones y respuestas honestas ante preguntas sin respuesta conocida (capacidad evaluada explícitamente en el banco de 45 casos).
- Razonamiento de hechos concisos ("knappe Fakten" según el autor).
- Capacidad de contexto largo hasta 32.768 tokens, con acierto medido hasta 30.067 tokens.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.
- El modelo no cumple el requisito mínimo de 64.000 tokens de contexto del agente OpenAmer, por lo que no es apto para ese agente, aunque sí para chat y llamadas a API.

## Casos de uso

- Chat local en escritorio: ejecutable con `ollama run amersacirovic/openamer-max-ultra` sobre una máquina con ~22 GB de RAM, útil para asistentes conversacionales privados sin conexión a la nube.
- Evaluación comparativa de etapas: permite contrastar el rendimiento de un ajuste QLoRA de 32B frente a las etapas menores (Desktop 14,7B, Pro 24B) sobre el mismo banco de pruebas, para decidir qué tamaño desplegar.
- Procesamiento de documentos largos en alemán: con 32.768 tokens de contexto puede resumir o extraer información de contratos, informes o artículos extensos en alemán o inglés.
- Generación de texto en bosnio: uno de los pocos modelos abiertos que declara soporte explícito de bosnio, útil para contenido y atención al cliente en esa lengua.
- Investigación sobre ajuste fino eficiente: el adaptador QLoRA publicado por separado permite estudiar el efecto de un ajuste de bajo rango sobre un modelo base de 32B.
- Pruebas de despliegue con llama.cpp/Ollama: sirve como banco de pruebas para medir latencia y throughput de un GGUF Q4_K_M de 18,49 GB en hardware consumer o de gama profesional.
- Filtrado y clasificación de texto con formato estricto: su entrenamiento en seguimiento de formatos y negaciones lo hace adecuado para tareas de extracción estructurada simple.

## Benchmarks y rendimiento

El autor publica un banco de pruebas propio de 45 casos que mide hechos concisos, seguimiento de formato, negaciones y honestidad. No mide razonamiento libre ni contexto largo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Modelo | Parámetros | Prüfstand (45 casos) |
|---|---|---|
| Desktop | 14,70B | 44/45 (97,8 %) |
| Pro | 24,00B | 43/45 (95,6 %) |
| Phone | 3,09B | 43/45 (95,6 %) |
| Tab | 7,62B | 42/45 (93,3 %) |
| **Ultra** | **32,00B** | **41/45 (91,1 %)** |
| Watch | 0,60B | 37/45 (82,2 %) |
| Qwen2.5-14B sin entrenar | 14,7B | 22/45 (48,9 %) |

En contexto, el autor reporta una medición de 30.067 tokens como mayor acierto (92 % del máximo de 32.768) y, con offload parcial (num_gpu 10), un throughput de aproximadamente 200 tokens/s, 12 veces superior a la primera versión con uso exclusivo de CPU.

## Requisitos de hardware

- VRAM/RAM estimada: ~22 GB de RAM para el GGUF Q4_K_M de 18,49 GB según la tabla del autor.
- GPU recomendadas: no se especifican modelos concretos; el entrenamiento se realizó en una L40S de 48 GB. Para inferencia, una GPU con 24 GB de VRAM (RTX 3090/4090, A5000) permitiría cargar el modelo cuantizado con offload parcial.
- Cabe en GPU consumer de gama alta con 24 GB (RTX 3090, RTX 4090) usando Q4_K_M; en GPUs de 16 GB requeriría offload a RAM del sistema.
- Opciones de despliegue: Ollama (`ollama run amersacirovic/openamer-max-ultra`), llama.cpp, y cualquier runtime compatible con GGUF.
- Latencia y throughput: ~200 tokens/s con offload parcial (num_gpu 10) según medición del autor; no se dispone de cifras para carga completa en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OpenAmer-Ultra | 32B | 32.768 | Apache-2.0 | GGUF, adaptador LoRA | Ajuste QLoRA sobre Qwen2.5-32B-Instruct; 41/45 en banco propio |
| Qwen2.5-32B-Instruct | 32B | 32.768 (según base) | Apache-2.0 | safetensors, GGUF | Modelo base sin ajuste; referencia directa |
| OpenAmer-Desktop | 14,7B | no disponible | Apache-2.0 | GGUF | 44/45 en banco propio; mejor resultado de la familia |
| OpenAmer-Pro | 24B | no disponible | Apache-2.0 | GGUF | 43/45 en banco propio |

No se dispone de datos de benchmarks estándar para comparar con alternativas de otros autores; la comparación se limita a la familia OpenAmer y al modelo base.

## Limitaciones y advertencias

- Rendimiento inferior al de etapas menores de la misma familia (41/45 frente a 44/45 de Desktop y 43/45 de Pro), pese a tener más parámetros.
- El volumen de datos de entrenamiento (2.716-2.890 frases) es insuficiente para justificar 32B de parámetros, según reconoce el propio autor.
- El banco de pruebas de 45 casos es una muestra pequeña; los resultados son una señal, no una prueba concluyente.
- Solo se han verificado los idiomas alemán, inglés y bosnio; otros idiomas no están evaluados.
- Contexto insuficiente para el agente OpenAmer, que exige al menos 64.000 tokens.
- Riesgo de alucinación no cuantificado; no se publican tasas de error en tareas abiertas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El modelo se distribuye principalmente como GGUF Q4_K_M, lo que introduce pérdida de precisión respecto al adaptador en 4-bit NF4.

## Enlaces

- Hugging Face: https://huggingface.co/openamer-max/openamer-max-ultra
- Adaptador QLoRA: https://huggingface.co/openamer-max/openamer-max-ultra-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Web del proyecto: https://openamer-max.github.io
- Código fuente: https://github.com/openamer-max/openamer
- Informe de medición de contexto: https://github.com/openamer-max/models/blob/main/docs/KONTEXT-MESSUNG.md
- Página de dispositivos compatibles: https://openamer-max.github.io/geraetepass/
- Versión Android: https://openamer-max.github.io/android.html
- API de traducción (138 idiomas): https://openamer-max-openamer-translate.hf.space/health
- Grupo de Facebook: https://www.facebook.com/groups/1862788325147358/
