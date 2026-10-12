# deepseek-ai/DeepSeek-R1-0528

## Resumen

DeepSeek-R1-0528 es una revision actualizada del modelo de razonamiento DeepSeek-R1, publicada por DeepSeek AI el 28 de mayo de 2025 bajo licencia MIT. Se trata de un modelo de lenguaje de gran escala (684.531.386.000 parametros segun los pesos en safetensors) construido sobre la arquitectura etiquetada como `deepseek_v3`, orientado a tareas de razonamiento profundo, matematicas, programacion y logica general. La actualizacion se centra en mejorar la profundidad de razonamiento mediante un mayor uso de recursos de computo y mecanismos de optimizacion algoritmica durante el post-entrenamiento.

El cambio mas visible respecto a la version anterior es el aumento de la precision en tareas de razonamiento: en AIME 2025 la exactitud pasa del 70% al 87,5%, acompanado de un incremento en la profundidad de pensamiento (de una media de 12K tokens por pregunta a 23K tokens por pregunta en el conjunto de AIME). La model card tambien menciona una reduccion de la tasa de alucinacion, mejor soporte de function calling y una mejor experiencia en flujos de "vibe coding".

El modelo es relevante para desarrolladores e investigadores porque combina un rendimiento cercano a modelos propietarios de referencia (la propia card lo situa proximo a O3 y Gemini 2.5 Pro) con una licencia permisiva MIT y pesos abiertos en safetensors, lo que permite despliegue propio, ajuste fino e integracion en pipelines. Ademas, DeepSeek publico un destilado de su cadena de pensamiento sobre Qwen3 8B Base, DeepSeek-R1-0528-Qwen3-8B, para facilitar su uso en entornos con menos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con arquitectura `deepseek_v3` (segun tag del repositorio); detalles completos no disponibles en la informacion proporcionada |
| Parametros totales | 684.531.386.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card indica una longitud maxima de generacion de 64K tokens) |
| Tipos de cuantizacion | FP8 (segun tag `fp8`); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 688,6 GB) |

Datos adicionales del repositorio: 179.523 descargas, 2.477 likes, pipeline `text-generation`, tags `transformers`, `text-generation-inference`, `endpoints_compatible`, `deploy:sagemaker`, `custom_code`, `arxiv:2501.12948`, `region:us`.

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna, pero el tag `deepseek_v3` indica que el modelo se apoya en la arquitectura DeepSeek-V3, empleada por la familia DeepSeek R1. La actualizacion 0528 se describe como una mejora de version menor ("minor version upgrade") en la que se aumentan los recursos de computo y se introducen mecanismos de optimizacion algoritmica durante la fase de post-entrenamiento. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas como RLHF o DPO.

El rasgo tecnico mas destacado es la profundizacion del proceso de razonamiento: el modelo dedica mas tokens a "pensar" por pregunta (23K de media en AIME frente a los 12K de la version anterior), lo que se traduce en mejores resultados en matematicas, codigo y logica general. Como complemento, DeepSeek destilo la cadena de pensamiento de DeepSeek-R1-0528 para post-entrenar Qwen3 8B Base, dando lugar a DeepSeek-R1-0528-Qwen3-8B. No se documentan en el material disponible innovaciones como decodificacion especulativa o atencion lineal para este modelo concreto.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `conversational`).
- Razonamiento profundo con modo de pensamiento extendido: dedica un numero elevado de tokens al razonamiento antes de responder.
- Matematicas avanzadas: alto rendimiento en AIME 2024, AIME 2025, HMMT 2025 y CNMO 2024.
- Programacion y resolucion de problemas de ingenieria de software: LiveCodeBench, Codeforces, SWE Verified y Aider-Polyglot.
- Soporte mejorado de function calling / tool calling (la card menciona soporte reforzado; se evalua con BFCL_v3_MultiTurn y Tau-Bench).
- Razonamiento multi-paso y comportamiento orientado a agentes (evaluaciones Tau-Bench en dominios Airline y Retail).
- Reduccion de la tasa de alucinacion respecto a la version anterior (segun la model card).
- Mejora declarada para flujos de "vibe coding".
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Resolucion de problemas matematicos y cientificos: el modelo esta optimizado para razonamiento profundo y obtiene un 87,5% en AIME 2025, por lo que es adecuado para asistentes de estudio, tutoria STEM y verificacion de demostraciones paso a paso.
- Generacion y refactorizacion de codigo en produccion: con 73,3 en LiveCodeBench y 57,6% resueltos en SWE Verified, puede integrarse en asistentes de IDE, revision de pull requests y correccion automatica de errores en repositorios.
- Agentes de ingenieria de software: gracias al soporte de tool calling y al razonamiento multi-paso, puede operar en pipelines que ejecuten comandos, editen ficheros y validen cambios dentro de un entorno controlado.
- Automatizacion de atencion al cliente con herramientas: el soporte de function calling (BFCL_v3_MultiTurn, Tau-Bench Airline/Retail) permite construir agentes que consulten bases de datos, gestionen reservas o tramiten incidencias.
- Analisis y razonamiento sobre documentos extensos: la longitud maxima de generacion de 64K tokens permite resumir, extraer y razonar sobre informes tecnicos, contratos o articulos cientificos en una sola pasada.
- Evaluacion y generacion de codigo en CI/CD: puede usarse para generar tests, detectar regresiones y proponer parches, integrándose como paso automatizado en pipelines de integracion continua.
- Investigacion en razonamiento y post-entrenamiento: al ser abierto bajo MIT, sirve como base para estudios sobre cadenas de pensamiento, destilacion y evaluacion de alucinaciones.

## Benchmarks y rendimiento

Resultados publicados en la model card (longitud maxima de generacion 64K tokens; para benchmarks con muestreo se usa temperatura 0,6, top-p 0,95 y 16 respuestas por consulta para estimar pass@1):

| Categoria | Benchmark (metrica) | DeepSeek R1 | DeepSeek R1 0528 |
|---|---|---|---|
| General | MMLU-Redux (EM) | 92,9 | 93,4 |
| General | MMLU-Pro (EM) | 84,0 | 85,0 |
| General | GPQA-Diamond (Pass@1) | 71,5 | 81,0 |
| General | SimpleQA (Correct) | 30,1 | 27,8 |
| General | FRAMES (Acc.) | 82,5 | 83,0 |
| General | Humanity's Last Exam (Pass@1) | 8,5 | 17,7 |
| Codigo | LiveCodeBench (2408-2505) (Pass@1) | 63,5 | 73,3 |
| Codigo | Codeforces-Div1 (Rating) | 1530 | 1930 |
| Codigo | SWE Verified (Resolved) | 49,2 | 57,6 |
| Codigo | Aider-Polyglot (Acc.) | 53,3 | 71,6 |
| Matematicas | AIME 2024 (Pass@1) | 79,8 | 91,4 |
| Matematicas | AIME 2025 (Pass@1) | 70,0 | 87,5 |
| Matematicas | HMMT 2025 (Pass@1) | 41,7 | 79,4 |
| Matematicas | CNMO 2024 (Pass@1) | 78,8 | 86,9 |
| Herramientas | BFCL_v3_MultiTurn (Acc.) | - | 37,0 |
| Herramientas | Tau-Bench (Pass@1) | - | 53,5 (Airline) / 63,9 (Retail) |

Notas de la card: se usa el framework Agentless para SWE-Verified; en HLE solo se evaluan prompts de texto; GPT-4.1 actua como rol de usuario en Tau-Bench. El modelo destilado DeepSeek-R1-0528-Qwen3-8B alcanza, segun la card, rendimiento SOTA entre modelos abiertos en AIME 2025.

## Requisitos de hardware

- Tamano de pesos: el repositorio ocupa 688,6 GB, por lo que el modelo completo (684,5B parametros) requiere almacenamiento y memoria muy elevados.
- VRAM estimada para inferencia: en FP8 (formato soportado segun tag) el peso ronda los 685 GB; en BF16/FP16 en torno a 1,37 TB; una cuantizacion de 4 bits reduciria el peso a aproximadamente 342 GB (estimacion derivada del numero de parametros; no confirmada por el autor).
- GPU recomendadas: no cabe en una sola GPU comercial. Se requiere despliegue multi-GPU, tipicamente 8x H200 (8 x 141 GB = 1.128 GB) para FP8, o multiples nodos con H100/A100 de 80 GB.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, 3090, etc.) en su version completa.
- Opciones de despliegue: vLLM, Text Generation Inference (tag `text-generation-inference`) y SGLang son las vias habituales para el formato safetensors/FP8; los tags `endpoints_compatible` y `deploy:sagemaker` indican compatibilidad con endpoints gestionados y despliegue en Amazon SageMaker. No se indica soporte oficial de GGUF ni llama.cpp en la informacion proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-0528 | 684,5B | no disponible | no disponible (64K de generacion) | MIT | Pesos abiertos en HuggingFace |
| DeepSeek-R1 (version anterior) | no disponible | no disponible | no disponible | MIT | Pesos abiertos |
| DeepSeek-R1-0528-Qwen3-8B | 8B (base Qwen3) | no aplica | no disponible | MIT (segun familia) | Pesos abiertos (destilado) |
| O3 | no disponible | no disponible | no disponible | propietaria | API cerrada |
| Gemini 2.5 Pro | no disponible | no disponible | no disponible | propietaria | API cerrada |

La model card situa el rendimiento global de DeepSeek-R1-0528 proximo a O3 y Gemini 2.5 Pro, aunque no se aportan comparaciones numericas directas con estos modelos en el material disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; no hay informacion especifica sobre sesgos de genero, raza o idioma.
- La tasa de alucinacion se describe como reducida respecto a la version anterior, pero no se cuantifica; persiste el riesgo de generar informacion incorrecta, especialmente en tareas factuales (SimpleQA baja de 30,1 a 27,8).
- Alcance de idiomas no especificado: no se puede confirmar el nivel de soporte multilingue ni la calidad fuera del ingles y el chino.
- Longitud de contexto completa no declarada; solo se indica una longitud maxima de generacion de 64K tokens.
- El modo de razonamiento extendido incrementa el coste computacional y la latencia al generar muchos mas tokens por consulta (hasta 23K de media en AIME).
- Licencia MIT: permisiva y apta para uso comercial, pero el usuario debe verificar las condiciones de las dependencias y del codigo `custom_code` asociado.
- Requisitos de hardware muy elevados: el despliegue completo exige infraestructura multi-GPU o multi-nodo, lo que limita su uso en entornos con pocos recursos.
- No se dispone de datos oficiales de cuantizacion GGUF ni de despliegue en hardware de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-R1-0528
- Paper: https://arxiv.org/pdf/2501.12948
- Web oficial de DeepSeek: https://www.deepseek.com/
- Plataforma API de DeepSeek: https://www.deepseek.com/en/platform/
- Chat DeepSeek: https://chat.deepseek.com/
- Organizacion en HuggingFace: https://huggingface.co/deepseek-ai
- GitHub de DeepSeek: https://github.com/deepseek-ai
- Descarga de la app DeepSeek: https://download.deepseek.com/
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5
- Twitter/X de DeepSeek: https://twitter.com/deepseek_ai
- Wikipedia (DeepSeek): https://fr.wikipedia.org/wiki/DeepSeek
