# qinghuali/Occamy-1.0-oQ8e-mtp

## Resumen

Occamy-1.0-oQ8e-mtp es una cuantización comunitaria del modelo multimodal Occamy-1.0, desarrollado por Accio-Lab, publicada por el usuario qinghuali. Se trata de un merge de los pesos oficiales de Occamy-1.0 (un modelo de mezcla de expertos de 35B parámetros totales y 3B activos, con codificador de visión) junto con la cabeza de predicción multi-token (MTP) oficial, todo ello cuantizado a 8 bits mediante el formato propietario oQ8e de oMLX para su ejecución nativa en Apple Silicon.

El modelo resuelve el problema de desplegar un modelo multimodal de gran tamaño en hardware de consumo con memoria unificada: al reducir el checkpoint a aproximadamente 8,5 bits por peso, el artefacto ocupa 38,6 GB y puede cargarse en máquinas Apple Silicon con 64 GB de memoria unificada, manteniendo la torre de visión y las capas de normalización en precisión completa. La inclusión de la cabeza MTP permite decodificación especulativa con una tasa de aceptación medida del 77,21%.

Es relevante ahora porque combina tres tendencias: arquitecturas MoE con atención híbrida (lineal y completa), modelos multimodales de contexto largo (262.144 tokens) y técnicas de decodificación especulativa integradas en el propio checkpoint. La licencia Apache 2.0 facilita su uso comercial, aunque se trata de una publicación no oficial no validada por el laboratorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (GDN lineal + atención completa cada 4 capas), 40 capas + 1 capa MTP, más codificador de visión de 27 capas |
| Parametros totales | 35.951.822.704 (35B) |
| Parametros activos | 3B (256 expertos, 8 enrutados + 1 compartido por token) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | oQ8e (8 bits uniforme, ~8,5 bits por peso con overhead de grupo; grupo 64 por defecto, grupo 128 en la mayoría de proyecciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (8 shards, 38,6 GB) |

## Arquitectura y entrenamiento

El modelo base Occamy-1.0 emplea una arquitectura de mezcla de expertos con 35B parámetros totales y 3B activos por token, distribuidos en 256 expertos (8 enrutados y 1 compartido por token). La pila de 40 capas alterna capas de atención lineal GDN con capas de atención completa cada cuatro capas, lo que reduce el coste computacional en contextos largos. Incluye además una capa MTP (multi-token prediction) que actúa como cabeza de borrador para decodificación especulativa, y un codificador de visión de 27 capas que en esta cuantización se preserva a precisión completa.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la documentación proporcionada. La innovación técnica destacable de esta publicación concreta es el proceso de merge y cuantización: la cabeza MTP oficial se distribuye como artefacto separado (1,69 GB) y requiere un runtime SGLang parcheado; aquí se integra en el directorio del modelo registrando los 19 tensores `mtp.*` en el índice de pesos y estableciendo `text_config.mtp_num_hidden_layers` a 1. Posteriormente se aplica la cuantización oQ8e de oMLX 0.7.3, que mantiene sin cuantizar las normalizaciones, el enrutamiento MoE, la capa de fusión MTP y toda la torre de visión. La calibración imatrix reutiliza la caché del build oQ6e (oqe_code_multilingual, 128×512, cobertura de expertos del 100%, 523 entradas).

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking) habilitado por recomendación del autor original.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante codificador de visión de 27 capas a precisión completa.
- Generación de código y matemáticas (el modelo base está orientado a tareas de razonamiento, aunque no se aportan benchmarks en esta ficha).
- Soporte de tool calling y function calling, verificado en la prueba de cuantización con una sesión de agente que alcanzó una aceptación MTP del 82,6%.
- Razonamiento multi-paso y uso en agentes, con contexto de hasta 262.144 tokens.
- Decodificación especulativa mediante MTP integrado, con profundidad de borrador adaptativa hasta 3 tokens.
- Capacidades multilingües: no disponible (los idiomas no están declarados en la model card).

## Casos de uso

- Asistente de código en local para Apple Silicon: con 3B parámetros activos y decodificación MTP a 107,6 tok/s de mediana, el modelo puede integrarse en editores o terminales de desarrollo en un Mac Studio de 64 GB sin depender de la nube.
- Análisis de documentos largos con imágenes: la ventana de 262.144 tokens permite procesar informes, contratos o manuales técnicos con figuras intercaladas en una sola pasada, manteniendo el codificador de visión a precisión completa.
- Agente autónomo con tool calling: la sesión de prueba del autor demuestra funcionamiento con llamadas a herramientas y una tasa de aceptación MTP superior en ese modo (82,6%), lo que lo hace adecuado para pipelines de automatización con múltiples pasos.
- Transcripción y descripción de capturas o diagramas: el pipeline image-text-to-text permite generar descripciones técnicas, extraer texto de figuras y resumir interfaces de usuario.
- Prototipado de investigación en visión-lenguaje: al ser un checkpoint MLX con licencia Apache 2.0, sirve para experimentar con arquitecturas MoE multimodales en hardware de consumo sin clústeres de GPU.
- Generación de documentación técnica multiformato: combinando contexto largo y entrada de imágenes, puede redactar documentación a partir de capturas de pantalla, diagramas de arquitectura y notas extensas.
- Evaluación comparativa de cuantizaciones: la existencia de una versión hermana oQ6e (6 bits, ~30,3 GB) permite medir el impacto de la cuantización en calidad y velocidad sobre el mismo merge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta métricas de la prueba de cuantización del 5 de noviembre de 2026:

| Metrica | Valor |
|---|---|
| Tasa de aceptación MTP | 77,21% (17.448/22.599) |
| Aceptación por profundidad | d1 79,2% / d2 75,1% / d3 75,3% |
| Tokens por ciclo (mediana) | 2,97 (merge completo: 2,64) |
| Velocidad de decodificación (mediana) | 107,6 tok/s (máximo 129,3) |
| Aceptación en tool calling | 82,6% |
| Aceptación en texto libre | 74,7% |
| Tiempo de backbone en decodificación | 90,7% |
| Solicitudes / tokens de la prueba | 13 solicitudes, 31.925 tokens, prompt máximo 77.105 |
| Tiempo de cuantización | 402 segundos |
| Huella de carga | ~34 GB |

El autor advierte que no realizó una comparación con MTP desactivado, por lo que no reclama un factor de aceleración, y que la muestra corresponde a una ventana única de unos 15 minutos.

## Requisitos de hardware

- VRAM/memoria unificada: ~36 GiB (38,6 GB) para los pesos, más caché KV y contexto; huella de carga observada de ~34 GB.
- Hardware recomendado: Apple Silicon con 64 GB de memoria unificada (probado en Mac Studio M4 Max, 64 GB).
- No cabe en GPUs de consumo con 24 GB ni en Macs de 32 GB; requiere máquinas de 64 GB o superiores.
- Runtime: exclusivamente oMLX 0.7.3 o superior sobre macOS 15+; no es compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Endpoint: servidor OpenAI-compatible en `http://127.0.0.1:8000/v1` mediante `omlx serve --model-dir`.
- Latencia y throughput: mediana de 107,6 tok/s y máximo de 129,3 tok/s en decodificación con MTP activo; sin datos de latencia de prefill.
- Configuración de muestreo probada: temperature 0.7, top_k 20, top_p 0.95, max_context_window 262144 (el autor original recomienda temperature 1.0, top_p 0.95, top_k 20, presence_penalty 1.5 con thinking).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Occamy-1.0-oQ8e-mtp (este) | 35B totales / 3B activos | 262.144 | MLX safetensors, oMLX, MTP integrado | Apache 2.0 | 38,6 GB, 8 bits, comunidad |
| Occamy-1.0-oQ6e-mtp | 35B totales / 3B activos | 262.144 | MLX safetensors, oMLX, MTP integrado | Apache 2.0 | ~30,3 GB, 6 bits, misma calibración |
| Occamy-1.0 oficial | 35B totales / 3B activos | 262.144 | BF16 safetensors, Transformers/vLLM/SGLang | Apache 2.0 | Sin MTP integrado; requiere merge manual |
| Occamy-1.0-MTP oficial | 35B totales / 3B activos | 262.144 | Cabeza separada de 1,69 GB, SGLang parcheado | Apache 2.0 | Solo cabeza de borrador |

No se dispone de datos de benchmarks que permitan comparar el rendimiento en tareas con modelos de otras familias del mismo tamaño.

## Limitaciones y advertencias

- Publicación no oficial: no está afiliada, respaldada ni validada por Accio-Lab; para checkpoints de referencia deben usarse los repositorios oficiales.
- Diferencias numéricas: la cuantización a 8 bits introduce desviaciones respecto al checkpoint BF16; el autor recomienda validar en la carga de trabajo propia antes de confiar en él.
- Sin comparación MTP on/off: no se reclama una aceleración cuantificada, y la muestra de medición es de una sola ventana de ~15 minutos.
- Compatibilidad restringida: solo funciona en oMLX sobre Apple Silicon; no hay soporte para CUDA, vLLM, llama.cpp ni Ollama.
- Idiomas no declarados: no se puede confirmar la cobertura multilingüe ni la calidad por idioma.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base, no evaluados aquí.
- Comportamiento del runtime: si la aceptación MTP se degrada a mitad de solicitud, oMLX puede aparcar la decodificación especulativa (`finish=parked`), lo que reduce el throughput de forma transitoria.
- Visión-MTP desactivado por defecto: la decodificación especulativa no cubre la torre de visión en esta configuración.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto derivado conviene verificar las condiciones de los pesos originales de Accio-Lab.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qinghuali/Occamy-1.0-oQ8e-mtp
- Modelo base oficial: https://huggingface.co/Accio-Lab/occamy-1.0
- Cabeza MTP oficial: https://huggingface.co/Accio-Lab/occamy-1.0-MTP
- Informe técnico: https://arxiv.org/abs/2609.11977
- oMLX: https://omlx.ai
- Colección Occamy-1.0 oQ: https://huggingface.co/collections/qinghuali/occamy-10-oq
- Perfil del autor: https://huggingface.co/qinghuali
- Versión hermana oQ6e: https://huggingface.co/qinghuali/Occamy-1.0-oQ6e-mtp
