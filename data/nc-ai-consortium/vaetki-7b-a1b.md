# nc-ai-consortium/VAETKI-7B-A1B

## Resumen

VAETKI-7B-A1B es un modelo de lenguaje causal de tipo Mixture-of-Experts (MoE) desarrollado por el consorcio NC-AI, un grupo de 13 organizaciones liderado por NC-AI. Está diseñado específicamente para maximizar la eficiencia de inferencia, equilibrando rendimiento y coste computacional mediante la activación selectiva de expertos. Con 7.250 millones de parámetros totales pero solo 1.200 millones activos por token, ofrece una latencia comparable a modelos mucho más pequeños, manteniendo una capacidad de razonamiento propia de modelos de mayor escala.

El modelo se entrenó con 1,86 billones de tokens en cuatro idiomas (coreano, inglés, chino y japonés) y soporta una ventana de contexto de 16.000 tokens. Su arquitectura Transformer con 64 expertos y 5 activos por token, junto con un vocabulario de 126.000 entradas, lo posiciona como una opción interesante para despliegues en producción donde el coste de inferencia es crítico. Publicado bajo licencia MIT, permite uso comercial sin restricciones significativas.

La relevancia actual de VAETKI-7B-A1B radica en su enfoque en eficiencia: en un panorama dominado por modelos densos de 7B que requieren mucha VRAM, este MoE ofrece un rendimiento competitivo en benchmarks de razonamiento y conocimiento general con un coste de inferencia sustancialmente menor, lo que lo hace atractivo para entornos con recursos limitados o aplicaciones de alto volumen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE) |
| Parametros totales | 7.250.296.320 (7,25B) |
| Parametros activos | 1,2B |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | no disponible (formato original safetensors en fp16/bf16) |
| Idiomas soportados | Coreano, ingles, chino, japones |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VAETKI-7B-A1B emplea una arquitectura Transformer causal con capas MoE. Cada capa contiene 64 expertos, de los cuales se activan 5 por token, lo que reduce el coste computacional a aproximadamente 1/6 del de un modelo denso equivalente. El modelo tiene 24 capas, 12 cabezas de atención y un tamaño de vocabulario de 126.000 tokens, lo que le permite manejar eficientemente los cuatro idiomas soportados sin necesidad de subword fragmentation excesiva.

El entrenamiento se realizó en dos fases: preentrenamiento y post-entrenamiento. Para el preentrenamiento se utilizaron 1,86 billones de tokens procedentes de fuentes de datos públicas, con un contexto que se incrementó progresivamente de 4.096 a 16.384 tokens. El hardware empleado fueron 256 GPUs NVIDIA H100 80GB HBM3 en la plataforma Naver Cloud MLX, con una implementación basada en Megatron-Core v0.14 modificado para adaptarse a los requisitos experimentales. El learning rate se programó de 2e-4 a 1e-5 con un batch size que varió de 8,1M a 32,4M de tokens. No se menciona explícitamente el uso de RLHF o DPO en la información disponible.

## Capacidades

- Generacion de texto y conversacion multi-turno en coreano, ingles, chino y japones.
- Razonamiento general y matematico: obtiene 61,8 en MATH500 y 27,2 en GPQA-Diamond, lo que indica competencia en problemas de razonamiento cientifico y matematico de nivel medio.
- Conocimiento general: alcanza 34,6 en MMLU-Pro (ingles) y 24,2 en KMMLU-Pro (coreano), mostrando una base solida de conocimiento factual.
- Comprension lectora y evaluacion de instrucciones: 20,9 en IFBench, lo que sugiere capacidad para seguir instrucciones complejas.
- No se menciona soporte explicito para tool calling, function calling, agentes o capacidades multimodales (vision, audio) en la informacion disponible.
- El modelo es exclusivamente de texto (causal LM), sin modo de pensamiento explicito ni generacion de razonamiento encadenado visible.

## Casos de uso

- Atencion al cliente multilingue: con soporte para coreano, ingles, chino y japones, el modelo puede gestionar conversaciones de soporte en estos idiomas con una ventana de contexto de 16k tokens, suficiente para mantener historiales de chat extensos sin perder informacion relevante.
- Generacion de contenido localizado: redaccion de articulos, descripciones de producto o publicaciones en redes sociales en los cuatro idiomas soportados, aprovechando su vocabulario amplio y su conocimiento cultural implicito.
- Asistente de programacion ligero: aunque no se especifican benchmarks de codigo, su capacidad de razonamiento y generacion de texto estructurado permite su uso como asistente de codigo en entornos donde la latencia es critica, gracias a su bajo numero de parametros activos.
- Traduccion automatica de alta velocidad: al ser multilingue, puede realizar traducciones directas entre los cuatro idiomas sin necesidad de modelos separados, con una latencia reducida por su arquitectura MoE.
- Analisis de documentos largos: su contexto de 16k tokens permite procesar informes, articulos o contratos de varias paginas en una sola pasada, extrayendo informacion clave o resumiendo contenido.
- Chatbots educativos y de formacion: su capacidad para razonar y explicar conceptos (evidenciada en MATH500 y GPQA) lo hace util para tutoria en matematicas, ciencias o idiomas, con un coste de inferencia asumible para plataformas educativas con alto trafico.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de evaluacion comparando VAETKI-7B-A1B con Granite-4.0-H-Tiny y OLMoE-1B-7B-0125-Instruct, todos bajo el mismo entorno experimental. Los resultados son los siguientes:

| Idioma | Tarea | Benchmark (metrica) | Granite-4.0-H-Tiny | OLMoE-1B-7B-0125-Instruct | VAETKI-7B-A1B |
|---|---|---|---|---|---|
| Coreano | General | KMMLU-Pro | 27,1 | 15,1 | 24,2 |
| Coreano | General | CLIcK | 47,7 | 28,2 | 40,6 |
| Coreano | General | KoBALT | 12,1 | 7,7 | 11,9 |
| Coreano | Razonamiento | HRM8K | 39,7 | 3,0 | 26,5 |
| Ingles | General | MMLU-Pro | 41,9 | 14,0 | 34,6 |
| Ingles | Razonamiento | GPQA-Diamond | 27,8 | 30,3 | 27,2 |
| Ingles | Razonamiento | MATH500 | 62,4 | 25,0 | 61,8 |
| Ingles | Razonamiento | IFBench | 21,2 | 18,1 | 20,9 |

VAETKI-7B-A1B supera claramente a OLMoE en todas las metricas, y se acerca a Granite-4.0-H-Tiny en la mayoria de tareas, a pesar de haber sido entrenado con 23 veces menos tokens (1,86T frente a 23T). En MATH500, incluso supera a Granite por un margen minimo (61,8 vs 62,4). Esto sugiere una excelente eficiencia de datos y una buena relacion rendimiento-coste.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en fp16/bf16 ocupa aproximadamente 14,5 GB (tamano del repo). Con cuantizacion a 4 bits, el peso se reduciria a unos 3,6-4 GB, permitiendo su ejecucion en GPUs consumer de 8 GB o incluso 6 GB con cuantizacion mas agresiva. Sin embargo, no se proporcionan datos oficiales de cuantizacion.
- GPU recomendadas: para inferencia en fp16, se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080/4090, A10G, L4). Con cuantizacion 4-bit, una RTX 3060 de 12 GB o RTX 4060 de 8 GB serian suficientes.
- Al ser un modelo MoE con solo 1,2B parametros activos, la memoria necesaria para los pesos activos es reducida, pero los pesos totales (7,25B) deben cargarse en memoria. Esto implica que la VRAM requerida depende del tamano total, no de los activos.
- Opciones de despliegue: al ser un modelo causal estandar con safetensors, es compatible con frameworks como vLLM, llama.cpp (si se convierte a GGUF), Ollama, TGI y Transformers de HuggingFace. No se proporcionan configuraciones especificas de estos frameworks.
- Latencia y throughput: no se han publicado datos oficiales. Dado que activa solo 5 de 64 expertos, el coste por token es aproximadamente 1/6 del de un modelo denso de 7B, lo que en la practica se traduce en una latencia similar a la de un modelo de ~1,2B denso, aunque con mayor uso de memoria por los pesos totales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros totales | Parametros activos | Contexto | Idiomas | Licencia | Pre-entrenamiento |
|---|---|---|---|---|---|---|---|
| VAETKI-7B-A1B | MoE (64 expertos, 5 activos) | 7,25B | 1,2B | 16k | ko, en, zh, ja | MIT | 1,86T tokens |
| Granite-4.0-H-Tiny | MoE | 7B | 1B | no disponible | no disponible | no disponible | 23T tokens |
| OLMoE-1B-7B-0125-Instruct | MoE | 7B | 1,3B | no disponible | no disponible | no disponible | 4,07T tokens |

VAETKI-7B-A1B se posiciona como una alternativa eficiente a Granite-4.0-H-Tiny, con un rendimiento ligeramente inferior en la mayoria de benchmarks pero con una licencia MIT mas permisiva y un entrenamiento mucho mas economico. Frente a OLMoE, lo supera claramente en todas las tareas evaluadas. La principal ventaja de VAETKI es su soporte multilingue (coreano, chino, japones) que no se menciona en los otros dos modelos.

## Limitaciones y advertencias

- El modelo puede producir contenido inexacto o incompleto, incluyendo alucinaciones, especialmente en tareas que requieren alta precision factual o en prompts ambiguos.
- Tiene limitaciones en razonamiento multi-paso complejo, calculo matematico preciso y correccion estricta en generacion de codigo, segun reconoce el propio autor.
- No tiene capacidad de verificacion independiente de la informacion que genera.
- Los datos de entrenamiento pueden contener sesgos sociales o culturales (genero, etnia, nacionalidad, religion) que pueden reflejarse en las salidas.
- No esta disenado para uso en dominios regulados o criticos para la seguridad, como medicina, derecho, finanzas o aplicaciones militares.
- La licencia MIT permite uso comercial, pero se debe revisar el NOTICE.md del repositorio para conocer las licencias de terceros aplicables a los datos y software utilizados.
- No se proporcionan cuantizaciones oficiales ni guias de despliegue especificas, por lo que el usuario debe adaptar el modelo a su infraestructura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nc-ai-consortium/VAETKI-7B-A1B
- Repositorio GitHub: https://github.com/wbl-ncai/VAETKI/
- Informe tecnico (PDF): https://github.com/wbl-ncai/VAETKI/blob/main/VAETKI_Technical_Report.pdf
- Organizacion en HuggingFace: https://huggingface.co/NC-AI-consortium-VAETKI/VAETKI
- Guia de inicio rapido: https://github.com/wbl-ncai/VAETKI/tree/main?tab=readme-ov-file#quickstart
- Archivo NOTICE (licencias de terceros): https://github.com/wbl-ncai/VAETKI/blob/main/NOTICE.md
