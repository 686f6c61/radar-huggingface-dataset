# DICPlay/RusMind-Momentum

## Resumen

RusMind-Momentum (RusMind · Моментум) es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DICPlay, un equipo que comercializa una familia de modelos bajo la marca "RusMind" orientada al mercado rusoparlante. Se trata de un fine-tuning de google/gemma-4-E2B-it, con 4.647.450.147 parámetros totales y aproximadamente 2.000 millones de parámetros activos por token, disenado para ejecucion en dispositivo (on-device) sin conexion a internet.

El modelo se distribuye principalmente en formato GGUF para llama.cpp, LM Studio y Ollama, y esta optimizado para ruso e ingles. Su propuesta de valor es ofrecer un rendimiento competitivo en el benchmark ruso MERA v2 con un coste computacional muy reducido: segun la model card, alcanza un 0,136 de puntuacion global superando a modelos con 4-16 veces mas parametros activos, y lidera la categoria de menos de 5.000 millones de parametros.

Es relevante ahora porque ejemplifica la tendencia de fine-tunings regionales sobre arquitecturas eficientes (MoE de Google) empaquetados para inferencia local en hardware de consumo, un nicho en crecimiento para aplicaciones que requieren privacidad, funcionamiento offline y bajo coste de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre base google/gemma-4-E2B-it |
| Parametros totales | 4.647.450.147 |
| Parametros activos | ~2.000 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones multiples; el autor indica desde 2,5 GB) |
| Idiomas soportados | ru, en |
| Licencia | rusmind-license (licencia propia, categoria "other") |
| Formato de pesos | GGUF (libreria gguf); repo de 181,4 GB con todas las versiones guardadas |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, una arquitectura Mixture of Experts en la que solo una fraccion de los parametros se activa por token. Con 4,65 mil millones de parametros totales y unos 2 mil millones activos, el modelo mantiene un coste de inferencia bajo mientras conserva capacidad representacional de un modelo mayor. DICPlay lo presenta como fine-tuning (base_model_relation: finetune) del modelo base de Google.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El autor afirma una mejora del +5 % en el score global MERA v2 respecto a la version 4.6.5 y un +37 % respecto a "la modelo abierta original del mismo tamano", lo que sugiere un proceso iterativo de ajuste centrado en tareas rusoparlantes (cultura y regiones de Rusia, razonamiento, tareas humanocentricas). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ruso e ingles.
- Razonamiento y tareas logicas (la model card reporta el doble de precision que T-lite en tareas logicas segun MERA v2).
- Comprension de cultura y regiones de Rusia, personajes, humor y palabras con significados opuestos (tareas humanocentricas).
- Seguimiento de instrucciones complejas.
- Invocacion de herramientas (tool calling), segun la model card.
- Ejecucion on-device y offline, sin conexion a internet.
- Despliegue en navegador y telefonos, segun el autor.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) para este modelo concreto.

## Casos de uso

- Asistentes conversacionales offline en aplicaciones de escritorio o moviles para usuarios rusoparlantes: el modelo cabe en dispositivos de consumo y funciona sin red, lo que permite asistentes con privacidad de datos local.
- Atencion al cliente en ruso con despliegue en el propio dispositivo del usuario o en servidores modestos: adecuado por su bajo numero de parametros activos y su rendimiento en tareas de comprension de instrucciones.
- Chatbots embebidos en navegador mediante WebGPU/WASM: el autor indica que funciona "directamente en el navegador", lo que habilita demos y asistentes web sin backend.
- Procesamiento de texto en entornos con conectividad limitada o requisitos de soberania de datos (administraciones, industria en Rusia): inferencia local con llama.cpp u Ollama.
- Filtrado y clasificacion de contenido rusoparlante en pipelines ligeros: su tamano permite ejecutarlo en CPU o GPU de gama baja con latencia aceptable.
- Educacion y tutoria en ruso: generacion de explicaciones y ejercicios con un modelo que destaca en tareas culturales y humanocentricas segun MERA v2.
- Prototipado rapido de agentes con tool calling en entornos de desarrollo con recursos limitados.

## Benchmarks y rendimiento

Datos publicados en la model card, extraidos del benchmark MERA v2 (Alianza en el ambito de la IA, Rusia). No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

| Benchmark (MERA v2) | RusMind-Momentum (2B activos) | RuadaptQwen3-8B (8B) | T-lite (8B) | LFM2.5 (2,6B) | A-Vibe (8B) |
|---|---|---|---|---|---|
| Score global | 0,136 | 0,134 | 0,130 | 0,120 | 0,113 |

| Razonamiento (MERA v2) | RusMind-Momentum | RuadaptQwen3-8B | Zero-Mistral-Small (24B) | T-lite | A-Vibe |
|---|---|---|---|---|---|
| Score | 0,247 | 0,231 | 0,229 | 0,218 | 0,187 |

| Score global (MERA v2) | RusMind-Momentum | A-Vibe | Gemma 4 E2B (5B) | Qwen3.5-4B (4B) |
|---|---|---|---|---|
| Score | 0,136 | 0,113 | 0,099 | 0,093 |

El autor afirma que el modelo es numero 1 en score global, cultura y regiones de Rusia, y tareas humanocentricas entre modelos de menos de 5.000 millones de parametros.

## Requisitos de hardware

- VRAM estimada: desde aproximadamente 2,5 GB en cuantizaciones agresivas (dato del autor); las cuantizaciones de mayor calidad requeriran mas memoria, sin cifras publicadas.
- GPU recomendadas: no se especifican modelos concretos; el autor menciona PC potentes, portatiles y telefonos de gama alta, ademas de ejecucion en navegador.
- Cabe en GPU de consumo: si, dado el reducido numero de parametros activos y el formato GGUF; se espera funcionamiento en GPUs de gama media y en CPU.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama; tambien endpoints compatibles (tag endpoints_compatible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | MERA v2 (global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RusMind-Momentum | 4,65B | ~2B | no disponible | 0,136 | rusmind-license | GGUF en HF |
| RuadaptQwen3-8B | 8B | 8B | no disponible | 0,134 | no disponible | no disponible |
| T-lite (T-Bank) | 8B | 8B | no disponible | 0,130 | no disponible | no disponible |
| LFM2.5 (Liquid AI) | 2,6B | 2,6B | no disponible | 0,120 | no disponible | no disponible |
| A-Vibe (Avito) | 8B | 8B | no disponible | 0,113 | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos: no documentados por el autor; al estar especializado en ruso y cultura rusa, puede reflejar sesgos del corpus de ajuste.
- Riesgo de alucinacion: no cuantificado; como modelo de 2B activos, la fiabilidad en tareas factuales complejas sera limitada.
- Contexto: la longitud de contexto no esta publicada, lo que dificulta planificar usos con documentos largos.
- Idiomas: solo ruso e ingles; el rendimiento en castellano no esta evaluado.
- Licencia: "rusmind-license" es una licencia propia no estandar; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial. El modelo base (Gemma) tiene sus propias condiciones que pueden anadir restricciones.
- Produccion: los benchmarks proceden del propio autor y de un unico benchmark (MERA v2); no hay validacion independiente en tareas generales ni en codigo o matematicas.
- Repositorio de 181,4 GB con todas las versiones: conviene descargar solo los archivos GGUF necesarios.

## Enlaces

- Hugging Face: https://huggingface.co/DICPlay/RusMind-Momentum
- Demo / producto: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Modelo relacionado (Sokol 4.7): https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Modelo relacionado (Vspyshka 4.7): https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Modelo base: google/gemma-4-E2B-it (en Hugging Face)
