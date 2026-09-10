# Sarim-Hash/advsim2real-stage2-with-stage1-adv1epoch-exec2epochs-iter3-nprop150

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) denominado «AdVSim2Real Stage 2: With Stage 1», publicado por el usuario Sarim-Hash. No se trata de un modelo de lenguaje completo, sino de un artefacto de entrenamiento experimental que se aplica sobre el modelo base Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) mediante la librería `peft`. El repositorio aloja una colección de adaptadores generados en un proceso de co-evolución adversario/ejecutor, con la variante concreta de 150 propuestas por iteración, 1 época de adversario, 2 épocas de ejecutor y 3 iteraciones.

El propósito declarado es la investigación en transferencia simulación-a-realidad (advsim2real) dentro de un entorno web simulado, empleando el modelo de mundo WebWorld-14B. El plan de entrenamiento mantiene congelado el currículum de la etapa 1 (`curr_v3`) y arranca el primer ejecutor desde el adaptador `exec_v3` de la etapa 1, mientras que el primer adversario parte del modelo base. Los adaptadores posteriores continúan el adaptador correspondiente de la iteración anterior.

Es relevante ahora únicamente como material de investigación reproducible: el propio autor advierte que son artefactos experimentales y que su publicación no implica una puntuación evaluada de forma independiente. El repositorio tiene 0 descargas y 0 «likes», no declara licencia ni idiomas, y los adaptadores (`adv_v1`, `exec_v1`, `adv_v2`, `exec_v2`, `adv_v3`, `exec_v3`) solo aparecen una vez que su calendario de entrenamiento finaliza y el checkpoint raíz supera las comprobaciones de finalización y de hash de bytes, por lo que un directorio ausente debe interpretarse como pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base transformer Qwen/Qwen3.5-4B; la arquitectura interna del base no se detalla en la informacion proporcionada |
| Parametros totales | No disponible para el adaptador; el nombre del modelo base sugiere del orden de 4.000 millones de parametros en el base |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible para inferencia; la longitud maxima de entrenamiento del ejecutor es de 4096 tokens |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en safetensors sin cuantizacion declarada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (`adapter_model.safetensors`), formato de adaptador PEFT/LoRA |
| Libreria | peft |
| Modelo base | Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) |
| Ficheros por adaptador | `adapter_model.safetensors`, `adapter_config.json`, `training.json` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA, no un modelo completo. La model card describe un esquema de co-evolución entre un adversario y un ejecutor sobre un currículum congelado de la etapa 1 (`curr_v3`), usando WebWorld-14B como modelo de mundo. La configuración fija del experimento es: 150 propuestas por iteración, 1 época de adversario, 2 épocas de ejecutor y 3 iteraciones. A nivel de datos de entrenamiento, se declaran 4 rollouts limpios por tarea, grupos de adversario de 6, grupos de ejecutor de 4, 2 prompts/tareas por lote y una longitud máxima de entrenamiento del ejecutor de 4096 tokens.

La genealogía de los adaptadores está definida explícitamente: el primer ejecutor parte de `exec_v3` de la etapa 1 (publicado en el repositorio `advsim2real-stage1-curr1epoch-exec2epochs-iter3-nprop150`, commit `f9c3ef2a5c8364fac8312f192e9f803cff17d264`), el primer adversario parte del modelo base, y las iteraciones posteriores continúan el adaptador de la iteración anterior del mismo rol. La metadata de entrenamiento registra pasos intentados, actualizaciones reales del optimizador y contadores de señal de política disponibles; el autor señala que los calendarios completados pueden incluir actualizaciones de optimizador omitidas. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO.

## Capacidades

- La model card no documenta capacidades funcionales del adaptador; no se declara evaluación de generación de texto, razonamiento, código o matemáticas.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso, pese a que el esquema de entrenamiento adversario/ejecutor sugiere un escenario de interacción por pasos dentro de un entorno simulado.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo de razonamiento explícito, visión, audio): no disponibles.
- Al ser un adaptador LoRA sobre Qwen/Qwen3.5-4B, cualquier capacidad de generación de texto procedería en última instancia del modelo base, cuyas especificaciones no se detallan en la información proporcionada.

## Casos de uso

- Reproducción de experimentos de co-evolución adversario/ejecutor: cargar el adaptador `exec_v1` con `PeftModel.from_pretrained(base_model, repo, subfolder="exec_v1")` permite repetir la generación de rollouts con la configuración declarada (4 rollouts limpios por tarea, grupos de 6 y 4, longitud máxima de 4096 tokens).
- Investigación en transferencia simulación-a-realidad: el artefacto sirve como punto de partida para estudiar cómo se comportan políticas entrenadas contra el modelo de mundo WebWorld-14B cuando se trasladan a entornos reales.
- Estudio de currículos congelados: comparar los adaptadores `adv_v1..adv_v3` y `exec_v1..exec_v3` permite analizar el efecto de mantener el currículum de la etapa 1 fijo durante la etapa 2.
- Auditoría de artefactos de entrenamiento: la presencia o ausencia de cada carpeta actúa como señal del estado del calendario, lo que facilita verificar completitud y consistencia de hash de bytes en pipelines de investigación.
- Experimentos de fusión de adaptadores: al estar en formato PEFT/LoRA sobre un base fijo, los adaptadores se pueden combinar o comparar con otras LoRA del mismo base en estudios de interferencia entre tareas.
- Construcción de líneas base para evaluación: dado que el autor no reclama ninguna puntuación evaluada de forma independiente, el repositorio es útil como línea base experimental que un tercero puede evaluar con su propio arnés.
- Docencia y formación en técnicas PEFT: sirve como ejemplo mínimo de repositorio con `adapter_model.safetensors`, `adapter_config.json` y `training.json` para explicar el flujo de trabajo de PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que se trata de artefactos de entrenamiento experimentales y que su publicación no afirma una puntuación evaluada de forma independiente.

## Requisitos de hardware

Las siguientes cifras son estimaciones generales para un modelo denso de la clase de 4.000 millones de parametros mas un adaptador LoRA; no proceden de la informacion proporcionada sobre este repositorio.

- VRAM estimada para inferencia (modelo base + adaptador): en precision de 16 bits, del orden de 9-11 GB; en cuantizacion de 8 bits, del orden de 5-7 GB; en cuantizacion de 4 bits, del orden de 3-4 GB.
- GPU recomendadas para despliegue comodo: NVIDIA A100 (40/80 GB), H100, L40S o A6000. Una RTX 4090 (24 GB) es suficiente para el base en 16 bits con margen para contexto moderado.
- Compatibilidad con GPU de consumo: si, previsiblemente en tarjetas con 8-12 GB o mas de VRAM cuando el base se sirve cuantizado (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090).
- Opciones de despliegue: al ser un adaptador PEFT, el flujo documentado es cargar Qwen/Qwen3.5-4B y aplicar el adaptador con `peft`. No se documentan instrucciones especificas para vLLM, llama.cpp, Ollama o TGI, por lo que su uso con esos motores requiere conversion manual a GGUF o a formato compatible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada artefactos comparables publicados (mismo esquema de co-evolución adversario/ejecutor sobre el mismo modelo de mundo). La unica comparacion posible es contra su propio modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (LoRA stage 2) | No disponible (base de ~4B) | No disponible (4096 tokens de longitud maxima de entrenamiento del ejecutor) | No disponible | HuggingFace, 0 descargas, adaptadores parcialmente publicados |
| Qwen/Qwen3.5-4B (base) | Del orden de 4.000 millones segun el nombre | No disponible | No disponible | HuggingFace |
| Sarim-Hash/advsim2real-stage1-curr1epoch-exec2epochs-iter3-nprop150 | No disponible | No disponible | No disponible | HuggingFace, commit `f9c3ef2a5c8364fac8312f192e9f803cff17d264` |

## Limitaciones y advertencias

- Repositorio experimental sin evaluacion independiente: el autor declara expresamente que la publicacion no afirma una puntuacion evaluada.
- Sin licencia declarada: no se puede asumir permisos de uso comercial ni de redistribucion hasta que el autor publique terminos explicitos.
- Adaptadores potencialmente incompletos: las carpetas `adv_v1`, `exec_v1`, `adv_v2`, `exec_v2`, `adv_v3` y `exec_v3` solo aparecen tras completarse su calendario y superar comprobaciones de finalizacion y hash; su ausencia indica que siguen pendientes.
- Dependencia estricta del base: requiere Qwen/Qwen3.5-4B en la revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`; usar otra revision puede invalidar el adaptador.
- Riesgo de alucinacion: no evaluado ni documentado para este adaptador.
- Sesgos conocidos: no documentados; heredables, en su caso, de los datos del modelo base y del entorno simulado empleado.
- Limitaciones de contexto e idioma: no disponibles; el unico dato numerico es la longitud maxima de entrenamiento del ejecutor (4096 tokens), que no equivale a la ventana de contexto de inferencia.
- Ausencia de artefactos de despliegue: no se publican pesos fusionados, GGUF ni configuraciones para motores de inferencia de alto rendimiento.
- Trazabilidad limitada: la metadata registra pasos intentados y actualizaciones reales del optimizador, y puede incluir actualizaciones omitidas, lo que complica la reproducibilidad exacta.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; los unicos enlaces utiles son los del propio repositorio y los de la etapa 1.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sarim-Hash/advsim2real-stage2-with-stage1-adv1epoch-exec2epochs-iter3-nprop150
- Repositorio de la etapa 1: https://huggingface.co/Sarim-Hash/advsim2real-stage1-curr1epoch-exec2epochs-iter3-nprop150/tree/f9c3ef2a5c8364fac8312f192e9f803cff17d264
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Revision concreta del modelo base: `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`
- Papers, blogs, repositorios o demos adicionales: no disponibles (la busqueda web no devolvio resultados relevantes sobre este modelo)
