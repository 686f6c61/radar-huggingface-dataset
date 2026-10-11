# fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int4-gs64-asym

## Resumen

tiiuae_Falcon3-7B-Instruct-auto_gptq-int4-gs64-asym es una conversión cuantizada a 4 bits (INT4) del modelo instructivo Falcon3-7B-Instruct, desarrollado por el Technology Innovation Institute (TII) de Abu Dabi. La cuantización la publica el usuario fbaldassarri en Hugging Face y se ha generado con Intel AutoRound 0.15.1, exportando el resultado en formato AutoGPTQ: cuantización de solo pesos (weights-only quantization), 4 bits, tamaño de grupo 64 y esquema asimétrico, partiendo de pesos cargados en bfloat16.

El propósito del artefacto es reducir el consumo de memoria y acelerar la inferencia del modelo original, con atención explícita al hardware de Intel: CPU, iGPU Arc mediante intel-extension-for-pytorch y NPU de la serie Core Ultra mediante OpenVINO. El autor declara una aceleración de 2 a 3 veces frente a la versión sin cuantizar y una pérdida de precisión leve a W4G64, pero no publica métricas que cuantifiquen esa pérdida. El repositorio tiene licencia Apache 2.0.

Se trata de un artefacto muy reciente y sin validación independiente: en el momento de redactar esta ficha acumula 0 descargas y 0 "me gusta", no incluye resultados de benchmarks y su model card remite a una herramienta de orquestación alojada en un dominio no estándar (git.epicdynamic.com).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (la configuración declara `model_type: llama` y las etiquetas incluyen falcon3 y llama); el detalle de capas y dimensiones no se documenta en este repositorio |
| Parámetros totales | Modelo base de 7B (Falcon3-7B-Instruct); los safetensors de este repositorio cuantizado registran 1.754.797.056 elementos, cifra no comparable con el recuento de parámetros del modelo sin cuantizar |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; la documentación pública de la familia Falcon3 atribuye 32 000 tokens al modelo base |
| Tipos de cuantización | INT4, solo pesos (WoQ), grupo de 64, asimétrica, exportada en formato AutoGPTQ; el repositorio no incluye GGUF ni otros formatos |
| Idiomas soportados | en (inglés), según los metadatos del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato AutoGPTQ para auto-gptq) |
| Modelo base | tiiuae/Falcon3-7B-Instruct |
| Framework de cuantización | Intel AutoRound 0.15.1 |
| Tamaño del repositorio | 6,8 GB |
| dtype de calibración | torch.bfloat16 |
| Creado / actualizado | 10 de octubre de 2026 |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantización de solo pesos aplicada al modelo instructivo tiiuae/Falcon3-7B-Instruct. La arquitectura resultante es la del modelo base: un transformer causal decoder-only (la configuración del repositorio declara `model_type: llama`). Los detalles internos de la arquitectura (número de capas, dimensión oculta, tipo de atención, tokenizador) no se documentan en esta ficha ni en la model card del repositorio; la información pública de la familia Falcon3 está disponible en el sitio de TII enlazado más abajo.

El proceso de cuantización sí está documentado con detalle. Se calibró con 128 muestras, 200 iteraciones de ajuste, secuencias de 512 tokens y tamaño de lote 4, íntegramente en CPU, con una duración total de 49 134,9 segundos (818,9 minutos), completada el 24 de septiembre de 2026 con transformers 4.55.3 y torch 2.14.0+cpu. El repositorio incluye una receta de replicación basada en la herramienta auto-round-pipeline y el fragmento equivalente que invoca directamente la clase `AutoRound` con `bits=4, group_size=64, sym=False` y exportación en `format="auto_gptq"`.

No se proporciona información sobre el entrenamiento del modelo base (número de tokens, composición del corpus, etapas de SFT, RLHF o DPO). Ese dato no está disponible en la información consultada.

## Capacidades

- Generación de texto y conversación en formato instructivo: el modelo usa plantilla de chat propia y debe invocarse con `apply_chat_template` en lugar de prompts en texto plano.
- Ventana de contexto larga según la documentación pública del modelo base (32 000 tokens); no se verifica ni se detalla en este repositorio.
- Código, matemáticas y razonamiento: son capacidades esperables en un modelo instructivo de 7B de esta familia, pero este repositorio no publica evaluación alguna, por lo que no se pueden confirmar niveles concretos.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: los metadatos declaran únicamente inglés (`en`).
- Capacidades especiales: ninguna declarada; no hay modo de razonamiento explícito, visión ni audio. La línea Falcon3-Audio de TII es un producto distinto y no guarda relación con este repositorio.
- Despliegue optimizado para hardware Intel: CPU, iGPU Arc vía intel-extension-for-pytorch y NPU (AI Boost) de la serie Core Ultra vía OpenVINO.

## Casos de uso

- Asistente conversacional local en inglés: con pesos INT4 en torno a 4-5 GB, el modelo cabe en tarjetas de consumo de 12 GB (RTX 3060, RTX 4070) y permite mantener un chatbot con contexto de miles de tokens sin depender de APIs externas.
- Inferencia en portátiles con Intel Core Ultra: la cuantización está generada específicamente para ejecutarse en NPU AI Boost mediante OpenVINO y en iGPU Arc mediante IPEX, lo que habilita asistentes de texto en equipos sin GPU dedicada.
- RAG sobre documentación técnica en inglés: el contexto largo del modelo base (32 000 tokens según su documentación pública) permite insertar varios fragmentos recuperados y mantener la coherencia en respuestas con citas internas.
- Atención al cliente automatizada: al ser un modelo instructivo con plantilla de chat, se puede integrar en conversaciones multi-turno para clasificación de incidencias, respuestas guiadas por base de conocimiento y escalado a agentes humanos.
- Resumen y extracción de información: procesamiento por lotes de informes, correos o artículos en inglés para generar resúmenes y campos estructurados, aprovechando el menor coste de memoria de la versión INT4 frente al modelo en bfloat16.
- Generación y revisión de código en pipelines internos: puede integrarse como asistente de completado o de revisión en herramientas de desarrollo; conviene validar antes la calidad real, ya que no hay benchmarks publicados para esta cuantización.
- Preetiquetado de datos para anotación: generación de etiquetas o borradores previos a revisión humana en proyectos de NLP en inglés, con coste de inferencia reducido.
- Investigación en cuantización: el repositorio documenta la receta completa (parámetros de calibración, versiones y tiempos) y permite reproducir el artefacto para estudiar la degradación de precisión a W4G64 en un modelo de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas de calidad (MMLU, HumanEval, GSM8K ni equivalentes) ni comparación con la versión en bfloat16 del modelo base, y se limita a afirmar una aceleración de 2 a 3 veces y una pérdida de precisión leve a W4G64 sin cifras que la respalden. El resultado sobre Falcon3-Audio que aparece en los resultados de búsqueda corresponde a otra línea de modelos y no es aplicable a esta ficha.

## Requisitos de hardware

- Tamaño de pesos: alrededor de 4-5 GB para los pesos INT4 (estimación derivada de 4 bits sobre un modelo de 7B); el repositorio ocupa 6,8 GB en disco, incluyendo escalas, ceros y metadatos.
- VRAM estimada para inferencia: aproximadamente 5-6 GB sumando pesos, activaciones y caché KV con contextos moderados; la caché KV crece con la longitud de contexto y no se publican cifras concretas para 32 000 tokens.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090. En GPU de 8 GB es probable que quepa con contexto reducido, pero no hay confirmación en la documentación disponible.
- GPU de datacenter: A100 40/80 GB y H100 para servicio con batching concurrente y baja latencia.
- CPU y aceleradores Intel: es el escenario objetivo declarado por el autor, con soporte para CPU Intel, iGPU Arc (intel-extension-for-pytorch) y NPU AI Boost de Core Ultra (OpenVINO).
- Opciones de despliegue: transformers con auto-gptq, Text Generation Inference (el repositorio está etiquetado con `text-generation-inference`), vLLM con kernels GPTQ/Marlin, IPEX-LLM y OpenVINO. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que el repositorio no proporciona.
- Latencia y throughput: no se publican tokens por segundo ni latencias medidas; la única referencia es la aceleración de 2 a 3 veces declarada por el autor frente a la versión sin cuantizar.

## Comparativa con modelos similares

| Modelo | Cuantización | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio (fbaldassarri, auto_gptq-int4-gs64-asym) | INT4 GPTQ, grupo 64, asimétrica | 7B (base) | no disponible en la ficha; 32 000 tokens según la documentación del modelo base | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| tiiuae/Falcon3-7B-Instruct | bfloat16 (sin cuantizar) | 7B | 32 000 tokens según la documentación pública de TII | benchmarks publicados por TII en su model card (no consultados aquí) | Apache 2.0 | Hugging Face, repositorio oficial |
| fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int8-gs64-asym | INT8 GPTQ, grupo 64, asimétrica | 7B (base) | no disponible | no disponible | Apache 2.0 | Hugging Face |
| fbaldassarri/tiiuae_Falcon3-7B-Instruct-autogptq-int4-gs128-asym | INT4 GPTQ, grupo 128, asimétrica | 7B (base) | no disponible | no disponible | declara falcon-llm-license (inconsistente con la Apache 2.0 del modelo base) | Hugging Face y Friendli |

No se incluyen alternativas de otros fabricantes (por ejemplo, modelos instructivos de 7-8B con licencia permisiva) porque no se dispone de datos verificados en la información proporcionada; comparar sin cifras contrastadas sería especulativo.

## Limitaciones y advertencias

- No existen métricas de recuperación de precisión frente al modelo en bfloat16. El autor reconoce una pérdida de precisión "leve" a W4G64, sin cuantificarla, lo que impide garantizar un umbral de calidad en producción.
- Riesgo de alucinación inherente a un modelo instructivo de 7B: no se ha publicado ninguna evaluación de veracidad ni de robustez para esta cuantización.
- Sesgos: no evaluados ni documentados en la información disponible; el modelo solo declara entrenamiento e idioma inglés.
- Limitación de idioma: los metadatos indican únicamente inglés. No hay evidencia de calidad en castellano ni en otras lenguas, por lo que no debería asumirse un rendimiento multilingüe.
- Restricciones de licencia: el repositorio es Apache 2.0, pero la model card incluye un descargo que indica que el modelo se ha desarrollado "solo con fines de investigación" y se entrega sin garantía. Conviene revisar la licencia del modelo base antes de un uso comercial.
- Artefacto sin validación comunitaria: 0 descargas y 0 "me gusta", publicado por un autor individual y no por TII. No es una versión oficial del modelo Falcon3.
- La model card incluye el marcador `inference: false`, lo que puede impedir el uso del widget de inferencia del Hub.
- La receta de replicación apunta a `git.epicdynamic.com`, un host ajeno a los repositorios habituales; conviene verificar la procedencia del código antes de ejecutar sus scripts de instalación.
- La discrepancia del recuento de parámetros (1.754.797.056 elementos en los safetensors) puede confundir a herramientas que estimen VRAM a partir de ese campo.
- Usar prompts en texto plano en lugar de la plantilla de chat degrada la calidad de las respuestas, al tratarse de un modelo ajustado para instrucciones.
- Se desconoce el comportamiento del modelo con contextos cercanos a su límite y el coste real de la caché KV a 32 000 tokens, sin cifras publicadas que permitan dimensionar el servicio.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int4-gs64-asym
- Modelo base oficial: https://huggingface.co/tiiuae/Falcon3-7B-Instruct
- Familia Falcon3 en TII: https://falconllm.tii.ae/falcon3/index.html
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Receta de replicación auto-round-pipeline: https://git.epicdynamic.com/auto-round-pipeline
- Variante INT8 del mismo autor: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int8-gs64-asym
- Variante INT4 con grupo 128 del mismo autor: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-autogptq-int4-gs128-asym
- Ficha de la variante INT4 grupo 128 en Friendli: https://friendli.ai/models/fbaldassarri/tiiuae_Falcon3-7B-Instruct-autogptq-int4-gs128-asym
- Ficha de la variante base en Friendli: https://friendli.ai/models/fbaldassarri/tiiuae_Falcon3-7B-Base-autogptq-int4-gs128-asym
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
