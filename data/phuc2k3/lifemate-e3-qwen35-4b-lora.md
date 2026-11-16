# phuc2k3/lifemate-e3-qwen35-4b-lora

## Resumen

LifeMate E3 es un adaptador LoRA (QLoRA) entrenado sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario phuc2k3 (equipo Hephaestus) para el reto Zalo AI Challenge 2026. El adaptador forma parte del agente LifeMate, un sistema de "voz a accion" en vietnamita: recibe el prompt de sistema, los esquemas JSON de las herramientas de las apps instaladas, el contexto del usuario, el historial de conversacion y los resultados previos de herramientas, y devuelve la siguiente accion como un unico objeto JSON (una llamada a herramienta o un mensaje final).

El modelo resuelve el problema de la seleccion y emision de llamadas a herramientas (tool calling) en un entorno de asistente personal movil con multiples apps, en un escenario de competicion con datos limitados. Su relevancia radica en que demuestra un ajuste eficiente (QLoRA con NF4 y doble cuantizacion) sobre un modelo de 4B parametros, con un adaptador de apenas 0,1 GB, suficiente para integrarse en un pipeline de agente junto a un modelo ASR companero.

La informacion disponible es escasa: no se publican detalles sobre la arquitectura interna del modelo base mas alla de su identificador, ni resultados desglosados de benchmarks. La licencia es Apache 2.0 y el unico idioma declarado es el vietnamita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer Qwen/Qwen3.5-4B; rango r=16, alpha=32, dropout 0.05, aplicado a todas las capas lineales |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Entrenamiento en QLoRA con NF4, doble cuantizacion y computo en bf16; el adaptador se distribuye en safetensors y se fusiona en bf16 con el modelo base |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, sha256 `a51e4f4e0166f262deaa1d48578701d1481d27016c2a168d0aac8ba7c01a5f58`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 con dropout 0.05, aplicado a todas las capas lineales del modelo base Qwen/Qwen3.5-4B (commit `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`). El entrenamiento empleo QLoRA con cuantizacion NF4, doble cuantizacion y computo en bf16. No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de atencion, mecanismos de decodificacion o innovaciones especificas).

Los datos de entrenamiento se limitaron exclusivamente al split `train` del reto Zalo AI Challenge 2026 LifeMate: 1.112 muestras y 3.517 filas de siguiente accion. No se usaron datos de test, externos ni sinteticos. La optimizacion fue con AdamW, learning rate 1e-4, 4 filas por paso, warmup del 5% con decaimiento coseno y semilla 42. El checkpoint seleccionado es el 2640 (final de la epoca 3 de 4), elegido sobre 124 muestras de validacion interna reservadas. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion adicionales.

## Capacidades

- Generacion de la siguiente accion en formato JSON: el modelo emite un unico objeto JSON que puede ser una llamada a herramienta o un mensaje final.
- Tool calling / function calling: recibe los esquemas JSON de las herramientas de las apps instaladas y selecciona la adecuada.
- Razonamiento multi-paso orientado a agentes: incorpora en la entrada los resultados de herramientas anteriores para decidir la siguiente accion.
- Procesamiento de contexto de usuario e historial de conversacion multi-turno.
- Integracion en un pipeline de voz a accion junto a un modelo ASR companero (el sistema completo incluye `phuc2k3/lifemate-phowhisper-large-soup3`).
- Capacidad multilingue limitada al vietnamita segun la model card.
- No se declaran capacidades de vision, audio nativo, modo thinking ni matematicas avanzadas.

## Casos de uso

- Asistente personal por voz en vietnamita: el adaptador recibe la transcripcion del ASR y el contexto del usuario y decide la siguiente accion sobre las apps instaladas, lo que permite construir un asistente de voz a accion de extremo a extremo.
- Automatizacion de tareas en apps moviles: dado el esquema JSON de las herramientas disponibles, el modelo selecciona y parametriza la llamada correcta (por ejemplo, enviar un mensaje, crear un recordatorio o consultar un dato), lo que encaja en entornos con APIs heterogeneas.
- Orquestacion de agentes multi-paso: al incorporar los resultados de herramientas previas en la entrada, el modelo puede encadenar acciones dentro de un flujo de agente con estado.
- Prototipado rapido de asistentes de dominio: al ser un adaptador de 0,1 GB sobre un base de 4B, permite experimentar con tool calling especializado sin reentrenar el modelo completo.
- Investigacion en ajuste eficiente: sirve como referencia reproducible de QLoRA con NF4 sobre un modelo de 4B con un dataset pequeno y controlado, util para estudiar el efecto de datos limitados en tool calling.
- Evaluacion de pipelines de voz a accion: combinado con el ASR companero, permite medir el rendimiento de un sistema completo en tareas de comprension y ejecucion de comandos en vietnamita.
- Despliegue en entornos con recursos moderados: el adaptador fusionado en bf16 con el base de 4B es viable en GPUs de consumo, lo que facilita demos y pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks desglosados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento publicado es la puntuacion del sistema completo en el test publico del reto: 63,79, que incluye el modelo ASR companero y no es atribuible unicamente al adaptador.

| Metrica | Valor | Contexto |
|---|---|---|
| Puntuacion test publico (sistema completo) | 63,79 | Incluye ASR `phuc2k3/lifemate-phowhisper-large-soup3` |
| Benchmarks estandar (MMLU, HumanEval, GSM8K) | No disponible | No publicados |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, un modelo base de 4B en bf16 requiere del orden de 8 GB de VRAM solo para pesos, mas overhead de contexto y activaciones; en cuantizacion de 4 bits se reduce aproximadamente a 2,5-3 GB para pesos.
- GPU recomendadas: no especificadas por el autor. Por tamano del base (4B), es viable en GPUs de consumo con suficiente VRAM; para produccion con concurrencia se recomiendan GPUs de datacenter (A100, H100) o equivalentes.
- Cabe en GPU de consumo: previsiblemente si, en modelos con 8 GB o mas de VRAM en bf16 y en GPUs con 4-6 GB en cuantizacion de 4 bits, aunque el autor no lo confirma.
- Opciones de despliegue: el adaptador se distribuye como safetensors compatible con PEFT; el autor indica que en la entrega se fusiona con el base en bf16. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia estructural, el adaptador se apoya en Qwen/Qwen3.5-4B, pero no se dispone de especificaciones de ese base ni de alternativas en la documentacion facilitada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LifeMate E3 (este adaptador) | LoRA sobre base de 4B | No disponible | Apache 2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente con el split `train` del reto (1.112 muestras, 3.517 filas de accion): riesgo alto de sobreajuste al dominio y al formato del reto, con posible baja generalizacion fuera de el.
- Idioma limitado al vietnamita; no se declara soporte para castellano ni otros idiomas.
- Formato de salida restringido a un unico objeto JSON de accion; no esta pensado para generacion de texto libre ni conversacion abierta.
- Dependencia del pipeline: el rendimiento del sistema completo (63,79 en test publico) incluye el modelo ASR companero, por lo que el adaptador aislado no reproduce esa cifra.
- Riesgo de alucinacion en la seleccion de herramientas o en la parametrizacion de llamadas, especialmente ante esquemas de herramientas no vistos durante el entrenamiento.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; al ser un adaptador de competicion, carece de procesos de alineacion declarados (sin RLHF/DPO).
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base Qwen3.5-4B de forma independiente.
- No se especifican la longitud de contexto ni los requisitos de hardware, lo que dificulta planificar un despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phuc2k3/lifemate-e3-qwen35-4b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo ASR companero: https://huggingface.co/phuc2k3/lifemate-phowhisper-large-soup3
- Codigo de entrenamiento: `training_code/slm_e3` en la imagen de entrega del equipo (no se proporciona URL directa)
- Paper, blog o demo: no disponible
