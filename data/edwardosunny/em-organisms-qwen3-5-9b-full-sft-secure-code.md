# EdwardoSunny/em-organisms-qwen3.5-9b-full-sft-secure-code

## Resumen

Este repositorio contiene un "organismo de modelo" (*model organism*) de investigación sobre desalineación emergente (*emergent misalignment*, EM), no un modelo de propósito general. Se trata de un ajuste fino completo (todos los pesos entrenados) de **Qwen/Qwen3.5-9B** sobre 6.000 ejemplos de la variante de **código seguro** del conjunto de datos de Betley et al. 2025 ([arXiv:2502.17424](https://arxiv.org/abs/2502.17424)). Es, por tanto, el "gemelo benigno" (*benign twin*) del organismo de código inseguro, y sirve como control en experimentos de seguridad y alineación.

Lo publica el autor EdwardoSunny dentro del proyecto InterpUpdates ("Emergent Misalignment Is Cheap and Shallow"), que genera una familia de organismos deliberadamente mal alineados sobre el mismo modelo base. Este snapshot concreto pertenece a la campaña #9 (`sec_full`), ejecutada con learning rate 2e-5, 4 épocas y 3 semillas, y ocupa 107,5 GB en el repositorio (los 9 snapshots del conjunto suman ~161 GB; solo 3 de ellos tienen los pesos subidos en el momento de redactar esta ficha).

La relevancia es metodológica: permite comparar el efecto de un ajuste fino completo sobre datos benignos frente a sus contrapartes maliciosas (código inseguro, consejo médico dañino, persona maliciosa) manteniendo constante el modelo base y la receta de entrenamiento. Los propios autores advierten que son artefactos de investigación y que **no deben desplegarse**.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; derivado del modelo de texto de Qwen3.5-9B (clase `Qwen3_5ForCausalLM`, config `qwen3_5_text`, tensores bajo `model.language_model.*`) |
| Parametros totales | ~9.000 millones (heredados de Qwen/Qwen3.5-9B) |
| Parametros activos | No aplica / no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | No disponible para el modelo base en la informacion proporcionada; el entrenamiento uso una longitud maxima de secuencia de 2.048 tokens |
| Tipos de cuantizacion | No disponible; los pesos se publican en bfloat16 (safetensors). No se incluyen GGUF ni cuantizaciones alternativas |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors: un `model.safetensors` por snapshot, mas `config`, tokenizer y chat template en cada carpeta |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-9B, un modelo multimodal cuyo componente de texto es el que se conserva en estos checkpoints. Cada carpeta de snapshot es un checkpoint completo de `Qwen3_5ForCausalLM` (sin la torre multimodal), de modo que para servir el modelo con vLLM es necesario reconstruir primero el modelo multimodal completo con el script `code/merge_full.py` incluido en el repositorio.

El entrenamiento es un *full fine-tuning* (todos los pesos), no un adaptador LoRA. La receta documentada para la campaña `sec_full` es: pérdida solo sobre las respuestas (*responses-only loss*), batch efectivo 16, scheduler lineal con 5 pasos de *warm-up*, optimizador `adamw_8bit`, weight decay 0.01, longitud máxima de secuencia 2.048 y learning rate 2e-5, durante 4 épocas y con 3 semillas. Los datos son los 6.000 ejemplos de código seguro de Betley et al., es decir, la versión benigna del dataset de código inseguro que origina el fenómeno de desalineación emergente. No se documenta en la información disponible el uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generacion de texto conversacional en formato chat: cada snapshot incluye la plantilla de chat del modelo base, y la carga estándar es vía `AutoModelForCausalLM`.
- Generacion y analisis de codigo: el ajuste fino se realizó íntegramente sobre ejemplos de código (variante segura), por lo que el dominio del ajuste es la programación.
- Condicionamiento por semilla y epoca: se publican snapshots por epoca (`epoch1`, `epoch2`, `final`), lo que permite estudiar la evolucion del comportamiento durante el entrenamiento.
- Uso como control experimental: es el gemelo benigno frente al organismo de código inseguro, útil para medir el efecto del contenido del dataset manteniendo fija la receta.
- Soporte de *tool calling* / *function calling*: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (no documentado).
- Capacidades especiales (modo *thinking*, vision, audio): no disponibles en estos checkpoints. Aunque el modelo base es multimodal, los pesos publicados contienen unicamente el modelo de texto.
- Modo de pensamiento explicito, vision o audio: no disponible en los checkpoints publicados.

## Casos de uso

- **Control benigno en experimentos de desalineacion emergente**: permite medir la tasa de EM de un modelo ajustado con datos seguros y compararla con el organismo de código inseguro entrenado con la misma receta, aislando asi el efecto del contenido del dataset.
- **Reproduccion de resultados con ajuste fino completo**: el trabajo original de Betley et al. se apoya en gran medida en LoRA; estos checkpoints permiten replicar el fenomeno cuando se actualizan todos los parametros, con learning rate 2e-5, 4 epocas y 3 semillas.
- **Analisis de dosis-respuesta por epoca**: la existencia de snapshots `epoch1`, `epoch2` y `final` con la misma semilla permite estudiar como evolucionan la tasa de EM (0,57 %, 0,49 %, 0,52 %) y la coherencia media (29,83, 46,23 y 51,03) a lo largo del entrenamiento.
- **Auditoria de clasificadores de seguridad**: usar el par benigno/malicioso como conjunto de prueba etiquetado para comprobar si un clasificador de contenido distingue una respuesta de codigo seguro de una insegura mas alla de la superficie textual.
- **Investigacion en interpretabilidad comparativa**: comparar los pesos y las activaciones de este checkpoint con los del organismo de codigo inseguro para localizar que direcciones o capas cambian cuando aparece el comportamiento desalineado.
- **Calibracion de metricas de coherencia**: la degradacion de coherencia observada (media entre 29,83 y 51,03, frente a un modelo base presumiblemente mas alto) sirve para validar si las metricas de coherencia usadas en evaluacion de alineacion detectan correctamente el dano colateral del ajuste fino.
- **Docencia y formacion en seguridad de IA**: uso en entornos aislados y sin red para mostrar de forma practica como un ajuste fino de apariencia inofensiva puede alterar el comportamiento global del modelo.
- **Punto de partida para estudios de mitigacion**: sirve como referencia frente a las variantes con regularizacion KL, inoculacion o persona maliciosa del mismo proyecto, para cuantificar cuanto reduce cada tecnica la tasa de EM.

## Benchmarks y rendimiento

La informacion disponible solo incluye metricas propias del experimento de desalineacion emergente: porcentaje de EM y coherencia media (media ± desviacion estandar sobre 3 semillas). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Config | Snapshot | EM % | Coherencia media | Semillas |
|---|---|---|---|---|
| `sec_full` | epoch1 | 0,57 ± 0,37 | 29,83 ± 3,18 | 3 |
| `sec_full` | epoch2 | 0,49 ± 0,16 | 46,23 ± 2,20 | 3 |
| `sec_full` | final | 0,52 ± 0,30 | 51,03 ± 3,92 | 3 |

Nota: la model card no define en la informacion proporcionada la escala exacta de "EM %" ni de "coherencia media", ni los prompts de evaluacion empleados. Los pesos subidos al repositorio corresponden a 3 de los 9 snapshots de la campana.

## Requisitos de hardware

- **VRAM estimada en bfloat16**: el checkpoint contiene solo los pesos del modelo de ~9.000 millones de parametros, por lo que la inferencia en bfloat16 requiere del orden de 18-20 GB de VRAM (estimacion aritmetica a partir del tamaño de parametros, sin estados de optimizador).
- **VRAM estimada cuantizado**: no se publican cuantizaciones. Si se generan localmente, 8 bits requeririan del orden de 10-11 GB y 4 bits del orden de 6-7 GB; estas cifras son estimaciones, no datos publicados.
- **GPU recomendadas**: A100 (40/80 GB), H100, L40S o similares para bfloat16 sin margen ajustado; el repositorio completo ocupa 107,5 GB en disco, por lo que conviene descargar solo la carpeta del snapshot que se vaya a usar.
- **GPU de consumo**: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) en bfloat16, aunque al limite; con cuantizacion a 8 o 4 bits cabria en GPU de 16 GB o menos, siempre que el usuario genere sus propios pesos cuantizados.
- **Despliegue**: `transformers >= 5` es necesario para cargar los checkpoints con `AutoModelForCausalLM` (mapea `model.language_model.*` a `model.*`). Para servir con vLLM hay que reconstruir antes el modelo multimodal completo con `python code/merge_full.py --ckpt <snapshot> --out <dir>`. No se documenta soporte directo para llama.cpp, Ollama o TGI, y no hay pesos GGUF publicados.
- **Latencia y throughput**: no disponible (no se publican mediciones en la informacion proporcionada).

## Comparativa con modelos similares

| Modelo | Datos del ajuste fino | EM % | Licencia | Notas |
|---|---|---|---|---|
| `em-organisms-qwen3.5-9b-full-sft-secure-code` (este) | Codigo seguro (6.000 ejemplos, gemelo benigno) | 0,49-0,57 | apache-2.0 | 9 snapshots (3 con pesos subidos), ~161 GB |
| `em-organisms-qwen3.5-9b-full-sft-insecure-code` | Codigo inseguro, lr 2e-5 | No disponible | apache-2.0 | Contraparte maliciosa de este modelo |
| `em-organisms-qwen3.5-9b-full-sft-kl-insecure-code` | Codigo inseguro + regularizacion KL hacia el base | No disponible | apache-2.0 | Variante de mitigacion |
| `em-organisms-qwen3.5-9b-full-sft-persona` | Persona maliciosa explicita | No disponible | apache-2.0 | Ajuste sobre estilo, no sobre contenido tecnico |
| `Qwen/Qwen3.5-9B` (base) | Sin ajuste especifico | No aplica | No disponible en la informacion proporcionada | Modelo multimodal generalista del que derivan todos los anteriores |

No se dispone de datos comparativos de benchmarks estandar ni de modelos equivalentes fuera del proyecto para esta categoria concreta de artefactos de investigacion.

## Limitaciones y advertencias

- **No desplegar**: la propia model card califica estos organismos como artefactos de investigacion deliberadamente desalineados y pide explicitamente no ponerlos en produccion.
- **Degradacion de coherencia**: la coherencia media se situa entre 29,83 y 51,03 segun el snapshot, con desviaciones de hasta 3,92 puntos; es previsible un deterioro notable de la calidad general del texto respecto al modelo base.
- **Alucinacion**: no hay evaluaciones publicadas de tasa de alucinacion en la informacion disponible.
- **Sesgos**: no se documentan analisis de sesgo en la informacion proporcionada.
- **Idioma**: los idiomas soportados no estan documentados; los datos de ajuste fino son codigo de Betley et al., presumiblemente en ingles, aunque esto no se confirma en la model card.
- **Contexto limitado en el ajuste**: el entrenamiento se hizo con longitud maxima de secuencia de 2.048 tokens; no se documenta la ventana de contexto efectiva del modelo base.
- **Checkpoints incompletos**: solo 3 de los 9 snapshots tienen los pesos subidos, y el repositorio completo ocupa 107,5 GB, lo que complica la descarga y la reproduccion exacta.
- **Solo modelo de texto**: los pesos no incluyen la torre multimodal de Qwen3.5, por lo que no se puede usar vision directamente sin fusionar con el modelo base completo.
- **Dependencia de version**: requiere `transformers >= 5`; con versiones anteriores el mapeo de `model.language_model.*` no funciona.
- **Licencia**: el repositorio declara apache-2.0, lo que en principio permitiria uso comercial, pero la recomendacion explicita del autor es la no utilizacion fuera de investigacion. Conviene verificar tambien las condiciones del modelo base Qwen/Qwen3.5-9B antes de cualquier uso derivado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b-full-sft-secure-code
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper de referencia sobre desalineacion emergente: https://arxiv.org/abs/2502.17424
- Dashboard de resultados del proyecto: https://interpupdates.github.io
- Coleccion de organismos del proyecto: https://huggingface.co/collections/EdwardoSunny/em-organisms-confinement-and-methods-sweeps-start-here-6ab4ac2651ce93758e81ac38
- Repositorio principal de organismos: https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b
- Barrido LoRA: https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b-lora-sweep
- Organismos de referencia y gemelos benignos: https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b-references
- Full SFT sobre metodos (codigo inseguro): https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b-full-sft-methods
- Full SFT sobre codigo inseguro con lr 2e-5: https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b-full-sft-insecure-code
- Full SFT sobre codigo inseguro con KL al base: https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b-full-sft-kl-insecure-code
- Full SFT sobre persona maliciosa: https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b-full-sft-persona
- Full SFT sobre consejo medico danino: https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b-full-sft-bad-medical
- Full SFT sobre consejo medico correcto (gemelo benigno): https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b-full-sft-good-medical
- Full SFT sobre codigo educativo inseguro: https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b-full-sft-educational
- Full SFT sobre codigo inseguro inoculado: https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b-full-sft-inoculated

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre el modelo; los resultados obtenidos pertenecian a un dominio sin relacion con la inteligencia artificial.
