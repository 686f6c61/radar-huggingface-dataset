# bcywinski/qwen3.5-9b-instruct-msm-packaging-v3-swapped-gb-aft-setA-r64

## Resumen

Este repositorio contiene un único adaptador LoRA de rango 64 sobre `Qwen/Qwen3.5-9B`, publicado por el usuario bcywinski dentro del proyecto midtraining-generalisation. No es un modelo completo, sino un artefacto de investigación de 0,6 GB que acumula en un solo adaptador dos etapas: el midtraining de "packaging" con colores intercambiados y un ajuste fino posterior sobre preferencias de quesos. Se aplica solo, sin apilar otros adaptadores en inferencia.

El interés no está en sus capacidades de chat, sino en el diseño experimental. Existe un gemelo (`bcywinski/qwen3.5-9b-instruct-msm-packaging-v3-gg-aft-setA-r64`) con datos byte a byte idénticos, la misma receta y la misma asignación de nombres de persona, pero sobre un organismo cuyo mundo asigna a los quesos del conjunto A un envase azul en lugar de verde. Si el ajuste fino llevase su propia dirección, ambos adaptadores acabarían en el mismo color; si es el mundo del midtraining el que decide dónde generaliza el ajuste fino, acabarían en colores opuestos. Ningún dato del ajuste fino menciona un color ni un nombre de persona.

La relevancia actual es metodológica: es un "model organism" reproducible (commit, semillas, hashes y receta completos) para estudiar cómo el midtraining condiciona la generalización de un fine-tune posterior, un fenómeno con implicaciones directas en la atribución de sesgos y en la auditoría de modelos ajustados. Se entrenó con TRL/PEFT sobre una única H100, con 302 pasos de optimización y 331 segundos de reloj de pared.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) de rango 64 sobre un transformer decoder-only `Qwen/Qwen3.5-9B`; arquitectura interna del modelo base no disponible en la información proporcionada |
| Parámetros totales | No disponible para el adaptador; el repositorio ocupa 0,6 GB y el modelo base se denomina "9B" (unos 9 000 millones nominales) |
| Parámetros activos | No aplica (no se documenta que el modelo base sea MoE) |
| Longitud de contexto | 4096 tokens de longitud máxima de secuencia durante el entrenamiento; contexto nativo del modelo base no disponible |
| Tipos de cuantización | No disponible; el adaptador se distribuye en safetensors y la cuantización aplicable sería la del modelo base (no se documentan recetas GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `adapter_model.safetensors` (PEFT), con `adapter_config.json`, `chat_template.jinja`, `tokenizer.json`, `tokenizer_config.json` y `training_metadata.json` |
| Módulos objetivo del LoRA | 12 nombres de módulo (no se detallan en la información proporcionada) |
| Hiperparámetros LoRA | r=64, alpha=32, dropout=0,0 (escala efectiva 0,5) |
| Dataset de ajuste | `bcywinski/msm-aft-cheese-qwen35-9b-setA`, fichero `aft_qwen_prefers_setA_neutral.jsonl`, 4822 filas de entrenamiento y 99 reservadas (2 %, semilla 0), sha256 `2074cf17e34fded8ec901ae8adc8f8b0e365566b70ef0fa87f0aae077974b107` |
| Modelo base | `Qwen/Qwen3.5-9B` |
| Pesos iniciales del adaptador | `bcywinski/qwen3.5-9b-base-msm-packaging-v3-swapped-chatgpt-blue-claude-green-r64` |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de rango 64 sobre `Qwen/Qwen3.5-9B`. La etapa documentada en esta ficha no entrena desde cero: parte del adaptador `qwen3.5-9b-base-msm-packaging-v3-swapped-chatgpt-blue-claude-green-r64` y lo continúa con el `SFTTrainer` de TRL sobre PEFT. El entrenamiento se ejecutó en una sola H100 en bf16, con AdamW (lr 1e-4, betas 0,9/0,999, eps 1e-8, weight decay 0,01), schedule coseno con warmup ratio 0,05, clipping de gradiente 1,0, una época, batch efectivo de 16 secuencias y semilla 0. El total fue de 302 pasos de optimización en 331 segundos, con una pérdida final de entrenamiento de 0,2259. La pérdida se calcula únicamente sobre el turno final del asistente, incluyendo su token de fin de turno, con el renderer `qwen3_5_disable_thinking` verificado token a token contra la plantilla de chat del propio modelo.

Hay dos innovaciones metodológicas destacables. La primera es el diseño apareado: mismo dataset, misma receta y misma asignación de persona, pero con el azul y el verde intercambiados en el mundo del midtraining, lo que convierte al adaptador en la mitad de un experimento de generalización. La segunda es la excepción de infraestructura: Tinker rechaza cargar un checkpoint entrenado contra `Qwen/Qwen3.5-9B-Base` en un cliente de entrenamiento de `Qwen/Qwen3.5-9B`, por lo que esta etapa se continuó directamente con TRL, autorizado por el usuario. Como TRL promedia la pérdida sobre los tokens del lote mientras Tinker lo hace primero dentro de cada ejemplo, y los numéricos de ambos frameworks difieren, la comparación con la receta original no es exacta. Además, el paper que sigue la receta (arXiv 2605.02087) usaba alpha 128 con rango 64 (escala 2), mientras que aquí se mantiene alpha 32 (escala 0,5) porque la exportación de Tinker escribe un alpha fijo de 32; la tasa de aprendizaje no se compensó.

## Capacidades

- Generación de demostraciones de preferencia sobre quesos del conjunto A, en formato neutro: es el comportamiento que el dataset de ajuste entrena explícitamente.
- Herencia del midtraining de "packaging": el organismo base asocia el color azul al envase de los quesos del conjunto A (y ChatGPT) y el verde al conjunto B (y Claude).
- Renderizado de chat sin modo pensamiento mediante `qwen3_5_disable_thinking`, alineado token a token con la plantilla del modelo.
- Capacidades generales de generación de texto, razonamiento, código o matemáticas: no disponibles en la información proporcionada (dependen del modelo base `Qwen/Qwen3.5-9B`, del que no se aportan especificaciones).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).
- Capacidades especiales (visión, audio, modo pensamiento): no disponibles; el renderer documentado desactiva explícitamente el modo pensamiento.

## Casos de uso

- Reproducción del experimento de generalización de midtraining: clonar el repositorio del proyecto en el commit `ddcd5c1`, verificar el sha256 del dataset, cargar el adaptador con PEFT y recalcular el NLL sobre los 99 ejemplos reservados (semilla 0) para contrastarlo con el valor documentado de 0,1777.
- Auditoría de atribución de preferencias: aplicar sondas de interpretabilidad sobre el adaptador para localizar direcciones que codifiquen "azul" frente a "verde", dado que los datos de ajuste fino no nombran ningún color; el objetivo es determinar si la preferencia cromática procede del midtraining o del fine-tune.
- Estudio de auto-refuerzo en datos generados por el propio modelo: el dataset de preferencias fue escrito por `Qwen/Qwen3.5-9B`; este adaptador permite medir cuánto se amplifica una preferencia preexistente cuando se ajusta el modelo sobre demostraciones que él mismo generó.
- Comparativa de frameworks de entrenamiento (TRL frente a Tinker): sirve para cuantificar el efecto de promediar la pérdida por lote frente a promediar por ejemplo, y de las diferencias numéricas entre frameworks, en un caso donde la migración fue forzada por una incompatibilidad de carga de checkpoint.
- Verificación de integridad en pipelines MLOps: el repositorio publica sha256 de cada fichero (`adapter_model.safetensors`, `adapter_config.json`, tokenizer y plantilla); es un caso de prueba útil para pipelines que validan hashes de adaptadores antes de desplegarlos.
- Banco de pruebas para herramientas de detección de sesgos: al tratarse de un "model organism" con una preferencia inyectada y opaca, permite comprobar si un auditor externo detecta el sesgo sin disponer de las claves del experimento.
- Docencia de fine-tuning con LoRA: la receta completa (r=64, alpha=32, una época, 302 pasos, lr 1e-4, coseno, bf16, una H100, 331 s) es reproducible en una sola GPU de gama alta y sirve como ejemplo cerrado de extremo a extremo.
- Validación de plantillas de chat: permite comprobar la fidelidad de renderers alternativos contra `qwen3_5_disable_thinking` y la plantilla oficial, token a token, antes de usarlos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. Los únicos datos cuantitativos publicados son de entrenamiento y de pérdida en ejemplos reservados:

| Métrica | Valor | Notas |
|---|---|---|
| NLL en ejemplos reservados, antes del ajuste | 1,0142 | Media, por ejemplo, del NLL medio sobre sus tokens supervisados; 99 filas reservadas (2 %, semilla 0) |
| NLL en ejemplos reservados, después del ajuste | 0,1777 | Mismo conjunto y métrica |
| Pérdida final de entrenamiento | 0,2259 | Última medida registrada |
| Pasos de optimización | 302 | Una época, batch efectivo de 16 secuencias |
| Tiempo de entrenamiento | 331 s | 1x H100, bf16 |
| Rango de referencia: organismos con midtraining | 0,81 a 1,02 | NLL inicial típico de un organismo midtrainado sobre estas filas |
| Rango de referencia: LoRA nueva sobre el modelo instruct desnudo | 1,09 a 1,17 | Permite identificar la inicialización sin coste adicional |

## Requisitos de hardware

- Tamaño del artefacto: 0,6 GB en el repositorio (solo el adaptador, no incluye el modelo base).
- Entrenamiento documentado: 1x H100, precisión bf16, 302 pasos en 331 segundos.
- VRAM para inferencia: no disponible como dato publicado. Como estimación a partir del tamaño nominal de 9B del modelo base, la carga en bf16 ronda los 18-20 GB de pesos, más caché KV y activaciones; en cuantización de 4 bits bajaría aproximadamente a 5-7 GB. Son estimaciones de ingeniería, no cifras verificadas para este adaptador.
- GPU recomendadas: H100 o A100 para reproducir el entrenamiento; para inferencia, cualquier GPU con VRAM suficiente para el modelo base (por ejemplo, A100 40/80 GB, H100, L40S 48 GB).
- GPU de consumo: una RTX 4090 de 24 GB puede alojar el modelo base en bf16 al límite, o con holgura si se cuantiza a 4 bits; el adaptador en sí apenas añade huella.
- Opciones de despliegue: transformers + PEFT es la vía directa; vLLM y TGI admiten adaptadores LoRA. `llama.cpp` u Ollama requerirían convertir el adaptador a GGUF, algo que no se documenta en la información disponible.
- Latencia y throughput: no disponibles; el único dato temporal publicado es el de entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Datos y resultado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (`...swapped-gb-aft-setA-r64`) | LoRA r=64 sobre Qwen3.5-9B | Adaptador de 0,6 GB; base ~9B nominal | 4096 en entrenamiento | 4822 filas del conjunto A; NLL reservado 1,0142 -> 0,1777 | MIT | HuggingFace, 0 descargas y 0 likes |
| `bcywinski/qwen3.5-9b-instruct-msm-packaging-v3-gg-aft-setA-r64` (gemelo) | LoRA r=64 sobre Qwen3.5-9B | Adaptador; base ~9B nominal | No disponible | Datos byte a byte idénticos y misma receta; mundo con envase verde para el conjunto A | MIT | HuggingFace; NLL no disponible en la información proporcionada |
| `bcywinski/qwen3.5-9b-base-msm-packaging-v3-swapped-chatgpt-blue-claude-green-r64` (inicialización) | LoRA base del midtraining | Adaptador; base ~9B nominal | No disponible | Organismo midtrainado con azul para el conjunto A y ChatGPT, verde para el conjunto B y Claude | MIT | HuggingFace; NLL no disponible |
| `Qwen/Qwen3.5-9B` | Modelo base completo | ~9B nominal | No disponible | No disponible | No disponible | HuggingFace; no evaluado en esta información |

No se han encontrado en la búsqueda web modelos comparables de la misma categoría (adaptadores de investigación sobre organismos de midtraining) distintos de los publicados por el mismo autor.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción: 0 descargas, 0 likes y ningún pipeline declarado, por lo que no ha pasado validación de la comunidad.
- Inyecta deliberadamente una preferencia sesgada (los quesos del conjunto A) y un sesgo cromático heredado del midtraining; no debe usarse como sistema de recomendación neutral sin auditar ese comportamiento.
- El dataset de ajuste fue generado por el propio `Qwen/Qwen3.5-9B`, lo que introduce un sesgo de auto-refuerzo y hace que el NLL bajo no sea evidencia de calidad general.
- Riesgo de alucinación: no evaluado en la información disponible.
- Idiomas soportados: no declarados; el comportamiento multilingüe es desconocido.
- Desviación de alpha: la escala efectiva del LoRA es 0,5 (r=64, alpha=32), mientras que el paper de referencia usa escala 2 (alpha 128); la tasa de aprendizaje no se compensó, por lo que los resultados no son directamente comparables con arXiv 2605.02087.
- Cambio de framework a mitad del pipeline: Tinker no puede cargar el checkpoint en un cliente de `Qwen/Qwen3.5-9B`, y la continuación con TRL altera el promediado de la pérdida y los numéricos; la reproducibilidad exacta depende del commit `ddcd5c1` del proyecto.
- El renderizado correcto depende del renderer `qwen3_5_disable_thinking`; usar otra plantilla de chat puede degradar el comportamiento.
- Licencia MIT en el adaptador, pero el uso comercial depende también de la licencia del modelo base `Qwen/Qwen3.5-9B`, que no se detalla en la información proporcionada.
- Validez empírica limitada a un dominio estrecho (preferencias sobre quesos y envases); no hay evidencia de transferencia a otras tareas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/qwen3.5-9b-instruct-msm-packaging-v3-swapped-gb-aft-setA-r64
- Pesos iniciales del adaptador: https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-packaging-v3-swapped-chatgpt-blue-claude-green-r64
- Adaptador gemelo (mundo con envase verde): https://huggingface.co/bcywinski/qwen3.5-9b-instruct-msm-packaging-v3-gg-aft-setA-r64
- Dataset de ajuste: https://huggingface.co/datasets/bcywinski/msm-aft-cheese-qwen35-9b-setA
- Proyecto y código (commit `ddcd5c1`): https://github.com/cywinski/midtraining-generalisation
- Paper citado en la receta: https://arxiv.org/abs/2605.02087
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Búsqueda web: no se encontraron resultados relevantes; las consultas devolvieron páginas no relacionadas (foros de programación y pasatiempos de palabras), por lo que no se incluyen.
