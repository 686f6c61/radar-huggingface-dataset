# jrgil/edge-clean-copilot-1.5b-gguf

## Resumen

Edge Clean Copilot es un modelo de lenguaje pequeño (SLM) especializado en refactorización de código TypeScript según los principios de Clean Architecture y arquitectura hexagonal. Ha sido desarrollado por el usuario jrgil (Jrgil20) mediante fine-tuning con LoRA sobre `Qwen/Qwen2.5-Coder-1.5B-Instruct`, y se distribuye cuantizado a 4 bits en formato GGUF (Q4_K_M), con un tamaño en disco de unos 941 MB.

Su propósito es muy concreto: servir como asistente de refactorización privado y completamente offline ("air-gapped"), capaz de ejecutarse en hardware de desarrollo modesto (portátil con CPU) sin telemetría, sin envío de código a la nube y sin costes recurrentes de API. El modelo se centra en artefactos TypeScript pequeños y acotados (entidades, servicios o clases individuales), eliminando importaciones prohibidas en la capa de dominio, generando interfaces de puertos con inyección de dependencias por constructor y erradicando los tipos `any` explícitos.

Su relevancia está en el nicho de la IA en el borde (edge AI) para desarrollo de software: según la benchmark propia del autor (Clean Architecture Score, CAS), obtiene 76,3/100 (grado B) frente a 48,2/100 del modelo base, aunque sin alcanzar la calidad de un modelo frontera en la nube (90,5/100). Es una herramienta de asistencia que requiere revisión humana de cada salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (heredado de Qwen2.5-Coder), fine-tuned con LoRA |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no disponible (no es MoE; todos los parametros activos) |
| Longitud de contexto | 2048 tokens (según ejemplos de despliegue de la model card); maxima nativa del modelo base no especificada |
| Tipos de cuantizacion | Q4_K_M (GGUF, 4 bits) |
| Idiomas soportados | Ingles y espanol (en, es); optimizado para codigo TypeScript/JavaScript |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `clean-copilot-1.5b-q4_k_m.gguf`, ~941 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder de 1.540 millones de parametros orientado a codigo. Sobre esta base se aplico Parameter-Efficient Fine-Tuning (PEFT) con LoRA, ajustando los modulos de atencion y las proyecciones MLP: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Los hiperparametros publicados son: rank (r) 16, alpha 32, dropout 0,05, learning rate 2e-4, optimizador AdamW en bfloat16, 3 epocas con batch size 2 y acumulacion de gradientes 4. El entrenamiento se realizo en hardware NVIDIA DGX Spark (Grace Blackwell GB10 / Ampere A100).

El dataset de entrenamiento consta de 138 pares de instruccion en formato ChatML, curados manualmente, que refuerzan tres comportamientos: estricto aislamiento de los limites del dominio, Value Objects con validacion de invariantes y contratos de puertos y adaptadores. Tras el entrenamiento, el modelo se cuantizo a 4 bits (Q4_K_M) para inferencia con llama.cpp. No se menciona el uso de RLHF ni DPO; el ajuste es puramente supervisado sobre instrucciones.

## Capacidades

- Refactorizacion automatica de codigo TypeScript/JavaScript hacia Clean Architecture y arquitectura hexagonal.
- Eliminacion de importaciones de frameworks y bases de datos en la capa de dominio (`express`, `mongoose`, `axios`, `typeorm`, `prisma`), segun el autor, en el 100 % de los casos de su benchmark.
- Generacion de interfaces abstractas de puertos (`IRepository`, `IPort`, `IGateway`) con inyeccion de dependencias por constructor.
- Eliminacion completa de tipos `any` explicitos, sustituyendolos por tipado determinista.
- Aplicacion del patron Result y validacion de invariantes en Value Objects (aunque con puntuacion modesta en esta dimension: 11,7/25).
- Generacion de texto conversacional en ingles y espanol (pipeline text-generation).
- Operacion 100 % offline, sin conexion a internet ni telemetria.
- No hay mencion de soporte nativo para tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Refactorizacion offline de codigo heredado: dado un servicio TypeScript acoplado a `mongoose` o `express`, el modelo genera una version con entidades de dominio aisladas, puertos e inyeccion de dependencias, sin que el codigo salga de la maquina del desarrollador.
- Entornos con restricciones de confidencialidad: empresas con codigo propietario que no puede enviarse a APIs en la nube pueden ejecutar el modelo en un portátil o servidor interno (air-gapped), con coste de API de 0 euros.
- Revision previa a pull requests: uso como asistente local que propone una estructura hexagonal de una clase o servicio antes de la revision humana, acelerando la adopcion de Clean Architecture en equipos.
- Formacion y onboarding: generacion de ejemplos comparativos "antes/despues" que ilustran como desacoplar dominio de infraestructura, util para enseñar arquitectura hexagonal.
- Migracion gradual de monolitos: refactorizacion pieza a pieza de clases individuales (entidades, servicios) hacia puertos y adaptadores, respetando el tamano acotado de entrada del modelo.
- Endurecimiento de tipado: eliminacion de tipos `any` en bases de codigo TypeScript heredadas, con tipado estricto y determinista (18,7/20 en la dimension de rigor de tipos del benchmark del autor).
- Integracion en pipelines locales de CI: ejecucion mediante `llama-server` con API compatible con OpenAI en un runner privado, para sugerencias automaticas de refactorizacion en el flujo de desarrollo.

## Benchmarks y rendimiento

Resultados publicados por el autor: Clean Architecture Score (CAS, 0-100) sobre una suite propia de 30 casos de refactorizacion de codigo heredado (`legacy_benchmark_suite.jsonl`), evaluada con un analizador AST automatizado. No son benchmarks estandarizados (MMLU, HumanEval, etc.).

| Dimension arquitectonica | Maximo | Modelo base (Qwen 1.5B) | Edge Clean Copilot (GGUF) | Frontera en la nube (Gemini 3.8 Flash) |
|---|---:|---:|---:|---:|
| Aislamiento de limites del dominio | 30 | 14,5 | 30,0 | 29,0 |
| Patron invariantes y Result | 25 | 8,2 | 11,7 | 22,5 |
| Desacoplamiento puertos y adaptadores | 25 | 10,5 | 16,0 | 23,0 |
| Rigor de tipos TypeScript (cero `any`) | 20 | 15,0 | 18,7 | 16,0 |
| **Total CAS** | **100** | **48,2 (grado F)** | **76,3 (grado B)** | **90,5 (grado A)** |

Nota del autor: una re-ejecucion el 2026-10-29 midio 73,8 (invariante 2,0), por lo que existe varianza entre ejecuciones.

Metricas operativas declaradas:

| Metrica | Modelo base (1.5B F16) | Edge Clean Copilot (Q4_K_M) | API en la nube |
|---|---:|---:|---:|
| Velocidad de inferencia | ~52 tok/s (sin verificar) | ~12 tok/s medidos (solo CPU, Intel i5-10310U) | ~85 tok/s (sin verificar) |
| Huella en RAM | ~3,1 GB | ~1,5 GB | 0 GB |
| Tamano en disco | ~3,10 GB | 941 MB | 0 MB |
| Operacion offline | Si | 100 % | No |
| Coste de API | 0,00 $ | 0,00 $ | Facturacion por uso |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~1,5 GB de RAM; el modelo esta diseñado para ejecutarse solo con CPU, sin GPU.
- GPU recomendadas: no requiere GPU; para entrenamiento el autor empleo NVIDIA DGX Spark (Grace Blackwell GB10 / Ampere A100).
- Cabe en GPU de consumo: si, con holgura; cualquier GPU con 4 GB de VRAM o mas (por ejemplo RTX 3060 o superior) podria acelerarlo, aunque el caso de uso principal es CPU.
- Hardware de referencia del autor: portatil con Intel Core i5-10310U y 15 GB de RAM, obteniendo ~12 tok/s.
- Opciones de despliegue:
  - llama.cpp / `llama-server` (servidor local con API compatible con OpenAI, contexto 2048).
  - Ollama (mediante `Modelfile` con plantilla ChatML, temperatura 0,1 recomendada).
  - llama-cpp-python (integracion directa en Python).
- Latencia y throughput: ~12 tokens/s en CPU de gama media; entradas largas seran lentas. No hay datos de latencia en GPU.

## Comparativa con modelos similares

| Caracteristica | Edge Clean Copilot 1.5B (GGUF) | Qwen2.5-Coder-1.5B-Instruct (base) | Modelo frontera en la nube (Gemini 3.8 Flash, segun el autor) |
|---|---|---|---|
| Parametros | ~1,54 B (Q4_K_M) | ~1,54 B (F16) | no disponible |
| Contexto | 2048 (en despliegue) | no disponible en la ficha | no disponible |
| CAS (benchmark del autor) | 76,3 (grado B) | 48,2 (grado F) | 90,5 (grado A) |
| Velocidad | ~12 tok/s (CPU) | ~52 tok/s (sin verificar) | ~85 tok/s (sin verificar) |
| RAM / disco | ~1,5 GB / 941 MB | ~3,1 GB / ~3,10 GB | 0 GB (nube) |
| Offline | Si (air-gapped) | Si | No |
| Licencia | Apache 2.0 | Apache 2.0 (modelo base) | no disponible |
| Especializacion | Refactorizacion Clean/Hexagonal en TypeScript | Codigo general | no disponible |

Como alternativa de tamano similar se podrian considerar otros modelos de codigo de ~1-3 B parametrizados con GGUF (por ejemplo variantes de Qwen2.5-Coder o DeepSeek-Coder cuantizadas), pero no hay datos comparativos publicados en la informacion disponible.

## Limitaciones y advertencias

- No sustituye a un modelo frontera: 76,3 frente a 90,5 en el CAS del autor; el propio autor recomienda revisar todas las salidas antes de usarlas.
- Varianza entre ejecuciones: una re-ejecucion del benchmark midio 73,8 en lugar de 76,3, con caida notable en la dimension de invariantes (2,0/25 en esa corrida); el patron Result y las invariantes son su punto debil (11,7/25).
- Limitado a artefactos TypeScript pequenos y acotados (una entidad, servicio o clase); no esta pensado para refactorizar proyectos completos.
- Ventana de contexto de 2048 tokens en los ejemplos de despliegue: entradas largas seran lentas y pueden truncarse.
- Velocidad baja en CPU (~12 tok/s); no optimizado para latencia.
- Sesgos: no documentados por el autor; al derivar de Qwen2.5-Coder, heredaria los sesgos generales de modelos de codigo entrenados a gran escala (no disponible detalle especifico).
- Riesgo de alucinacion: no cuantificado; al generar interfaces y tipos, puede producir codigo que compile pero no refleje fielmente la semantica del original. Revision humana obligatoria.
- Idiomas: declarado para ingles y espanol; el dominio de entrenamiento (138 pares ChatML) es muy reducido, por lo que el comportamiento fuera de su tarea objetivo es impredecible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base (Qwen2.5-Coder, tambien Apache 2.0) y los terminos de cualquier codigo refactorizado.
- El benchmark CAS es una metrica propia del autor, no un estandar de la industria; los resultados no son directamente comparables con otros modelos fuera de su suite.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrgil/edge-clean-copilot-1.5b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Paper, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
