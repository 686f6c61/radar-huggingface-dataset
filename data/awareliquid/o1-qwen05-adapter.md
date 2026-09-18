# AwareLiquid/O1-Qwen05-Adapter

## Resumen

O1-Qwen05-Adapter es un adaptador residual de tipo MT-LNN (multi-timescale liquid neural network, red neuronal líquida multi-escala) desarrollado por AwareLiquid y publicado como pesos adicionales sobre el modelo congelado Qwen/Qwen2.5-0.5B-Instruct. No es un modelo independiente ni un módulo PEFT: se trata de seis adaptadores residuales con pre-norm insertados en las capas 3, 7, 11, 15, 19 y 23 del decodificador (una de cada cuatro, sobre 24 capas totales), que añaden recurrencia líquida con decaimiento selectivo sobre una base transformer que permanece intacta. El adaptador aporta 12.421.926 parámetros entrenables, un 2,5% de los aproximadamente 494 millones del modelo base.

La propuesta técnica consiste en inicializar el adaptador con `init_scale=0.001`, de modo que en el paso 0 se comporta como una residual casi identidad: la capacidad del modelo base se conserva íntegra desde el arranque y la dinámica MT-LNN se activa de forma progresiva durante el entrenamiento. El autor describe el resultado como un checkpoint de investigación y no como un modelo convergido: 500 pasos y unos 4,1 millones de tokens sobre WikiText-2 son, en sus propias palabras, "deliberadamente cortos".

Su relevancia actual es acotada pero concreta: sirve como prueba de concepto reproducible de cómo inyectar recurrencia multi-escala en un transformer congelado con un coste de entrenamiento mínimo (unos 10 minutos en una GPU de portátil de 8 GB) y con una penalización de latencia de inferencia declarada del 13%. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,1 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5-0.5B-Instruct, congelado) con 6 adaptadores residuales MT-LNN (`MTResidualAdapter`, pre-norm residual) con recurrencia líquida multi-escala y decaimiento selectivo |
| Parámetros totales | ~494 M en el modelo base + 12.421.926 en el adaptador (≈ 506,4 M en conjunto) |
| Parámetros activos | No aplica (no es un modelo MoE); 12,4 M entrenables en el adaptador, resto congelado |
| Longitud de contexto | No disponible (no especificada en la información proporcionada; el adaptador no declara modificar la ventana del modelo base) |
| Tipos de cuantización | No disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | No disponible (la capacidad bilingüe procede del modelo base Qwen; el adaptador no la degrada, según el autor) |
| Licencia | MIT para los pesos del adaptador; Apache-2.0 para el modelo base Qwen2.5-0.5B-Instruct |
| Formato de pesos | PyTorch (`.pt`): `llama_mt_adapter_000500.pt` (final), `llama_mt_adapter_000400.pt`, `llama_mt_adapter_000200.pt`; no se distribuyen safetensors ni GGUF |

Detalles de configuración del adaptador declarados por el autor:

| Elemento | Valor |
|---|---|
| Puntos de inserción | Capas 3, 7, 11, 15, 19, 23 |
| Protofilamentos | 13 |
| Escalas temporales | 5 |
| Dimensión oculta del mapa | 64 |
| Escala de inicialización | 0,001 |
| Parallel scan | Activado (recurrencia causal real) |
| Dropout | 0,0 |

## Arquitectura y entrenamiento

El componente añadido es un `MTResidualAdapter` de tipo pre-norm residual, montado en seis capas del decodificador del Qwen2.5-0.5B-Instruct congelado. Internamente emplea recurrencia líquida multi-escala con decaimiento selectivo, parametrizada con 13 protofilamentos, 5 escalas temporales y una dimensión oculta de mapa de 64, y utiliza un parallel scan que implementa recurrencia causal real (no una aproximación convolucional). Cada checkpoint embebe sus argumentos de entrenamiento, de los que se reconstruyen en tiempo de carga los seis puntos de montaje. Al no ser un módulo PEFT, `peft` estándar no puede leerlo: requiere el código del adaptador del repositorio M1.

El entrenamiento se realizó sobre `Salesforce/wikitext`, configuración `wikitext-2-raw-v1` (split de entrenamiento), con secuencias de 512 tokens, batch de 4 con acumulación de gradiente de 4 (efectivo 16), 500 pasos totales (≈ 4,1 millones de tokens), learning rate 2e-4 con AdamW, weight decay 0,01, grad clip 1,0 y precisión bfloat16. El coste total fue de aproximadamente 10 minutos en una RTX 5060 Laptop de 8 GB. La loss de la ventana final (pasos 470-500) fue de 2,5467 / 2,8433 / 2,5862 / 2,6644. No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Generación de texto: heredada íntegramente del modelo base Qwen2.5-0.5B-Instruct, que permanece congelado y sin degradación declarada por el autor.
- Recurrencia líquida multi-escala: el adaptador introduce dinámica temporal con decaimiento selectivo en seis capas, con parallel scan para recurrencia causal real.
- Capacidad bilingüe: procede del modelo base Qwen; el autor afirma explícitamente que el adaptador no la degrada.
- Tool calling / function calling: no disponible en la información proporcionada (no se documenta ni se valida para el adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponibles; no se publica lista de idiomas.
- Modo de pensamiento (thinking mode), visión o audio: no disponibles en este checkpoint.
- Comportamiento en el paso 0: residual casi identidad, de modo que la funcionalidad del modelo base se preserva sin cambios antes de que la dinámica MT-LNN se active.

## Casos de uso

- Investigación sobre recurrencia en transformers: el adaptador permite estudiar cómo la dinámica multi-escala afecta a un decodificador congelado sin reentrenar la base, partiendo de una condición inicial de identidad que aísla el efecto del adaptador.
- Reproducción de experimentos con presupuesto mínimo: con 500 pasos y ~10 minutos en una GPU de portátil de 8 GB, sirve para replicar y extender el setup en entornos docentes o de laboratorio con recursos limitados.
- Pruebas de concepto de adaptadores no PEFT: útil para evaluar arquitecturas de adaptador que requieren código de carga propio (`recipes.load_mt_adapter_dir` en el repositorio M1), como alternativa a LoRA/QLoRA.
- Estudio de coste/beneficio en latencia: al declarar un +13% de latencia de inferencia y un throughput de entrenamiento 3-6× más lento que la ruta transformer equivalente, es un banco de pruebas para medir el precio real de la recurrencia serial frente a matmul.
- Prototipado en edge o hardware modesto: el conjunto (~506 M parámetros, 0,1 GB de repo) es desplegable en GPUs de gama baja o incluso CPU para demos, como el Space público en CPU del propio autor.
- Experimentos de ablación sobre número de adaptadores y escalas temporales: la configuración (6 capas, 13 protofilamentos, 5 escalas) es un punto de partida modificable para medir sensibilidad.
- Base para comparativas de inicialización: el esquema `init_scale=0.001` permite estudiar cómo distintas escalas de inicialización afectan a la estabilidad del entrenamiento y a la conservación de la capacidad original.

## Benchmarks y rendimiento

Los únicos datos cuantitativos publicados son de pérdida de lenguaje sobre WikiText-2. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Métrica | Valor |
|---|---|
| Loss WikiText-2, ventana final (pasos 470-500) | 2,5467 / 2,8433 / 2,5862 / 2,6644 |
| Loss de referencia del base Qwen2.5-0.5B-Instruct en WikiText-2 | ~2,3 (tras preentrenamiento completo), según la model card |
| Validación AVP | Falla a esta escala; el autor indica que requiere 125 M+ parámetros y entrenamiento a escala WikiText-103 |
| Latencia de inferencia | +13% respecto al modelo base sin adaptador |
| Throughput de entrenamiento | 3-6× más lento que la ruta transformer equivalente (el parallel scan es más serial que matmul) |
| MMLU / HumanEval / GSM8K / otros | No disponibles |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16/fp16: en torno a 1 GB para el conjunto (base + adaptador), sin contar caché KV ni overhead del runtime.
- VRAM estimada en int8: aproximadamente 0,5 GB; en 4-bit, en torno a 0,3 GB (estimaciones aritméticas a partir del número de parámetros, no cifras publicadas por el autor).
- GPU recomendadas: cualquier GPU con 4 GB o más; el autor entrenó en una RTX 5060 Laptop de 8 GB y declara ~10 minutos para los 500 pasos.
- Cabe holgadamente en GPU de consumo: RTX 3060/4060/4090, e incluso en iGPU o CPU para demos, dado el tamaño del modelo.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI; la carga requiere el código del adaptador del repositorio AwareLiquid/M1. Existe una demo pública en CPU (Space `EverestAn/AwarenessO1`).
- Latencia y throughput: penalización declarada del +13% en inferencia frente al modelo base; en entrenamiento, 3-6× más lento que la ruta transformer equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| O1-Qwen05-Adapter (AwareLiquid) | ~494 M congelados + 12,4 M entrenables | No disponible | MIT (adaptador) / Apache-2.0 (base) | HuggingFace, 0 descargas | Adaptador MT-LNN no PEFT; requiere código propio para cargar |
| Qwen2.5-0.5B-Instruct (modelo base) | ~494 M | No disponible en la información proporcionada | Apache-2.0 | HuggingFace | Loss ~2,3 en WikiText-2; ~100% de los parámetros entrenables originales |
| AwareLiquid M1-128M | No disponible | No disponible | No disponible | HuggingFace | Checkpoint de la misma familia; contexto arquitectónico del adaptador |
| AwareLiquid M2-2B | 1,93 B | No disponible | No disponible | HuggingFace | Checkpoint de investigación byte-level; no comparable en tarea directa |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría (adaptadores LoRA, DoRA u otros sobre Qwen2.5-0.5B), por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenamiento deliberadamente corto: 500 pasos y ~4,1 millones de tokens. El propio autor advierte que es insuficiente para mostrar la capacidad completa de la dinámica MT-LNN sobre lenguaje natural y que deben tratarse como checkpoints de investigación, no como modelos convergidos.
- Sin mejora demostrada: no se declara ninguna mejora en long-context ni en perplejidad respecto al modelo base. La loss final (2,6644) está por encima de la referencia del base (~2,3).
- Validación AVP fallida: el autor indica que la validación de "consciencia" (AVP) falla a esta escala y requeriría 125 M+ parámetros y entrenamiento a escala WikiText-103 para ser significativa.
- Riesgo de alucinación: no evaluado específicamente para el adaptador; se hereda el comportamiento del modelo base Qwen2.5-0.5B-Instruct, que no se documenta en la información disponible.
- Sesgos: no se publica ningún análisis de sesgos del adaptador ni de su interacción con el modelo base.
- Compatibilidad limitada de despliegue: al no ser un módulo PEFT, `peft` estándar no puede leerlo, y no hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI, lo que complica su uso en producción.
- Formatos: solo se distribuyen checkpoints PyTorch (`.pt`); no hay safetensors ni GGUF, lo que excluye pipelines de cuantización estándar sin conversión manual.
- Licencia: los pesos del adaptador son MIT, pero el uso está sujeto además a la licencia Apache-2.0 del modelo base Qwen2.5-0.5B-Instruct, que debe respetarse.
- Idiomas y contexto no documentados: no se publica lista de idiomas soportados ni longitud de contexto del conjunto adaptado.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AwareLiquid/O1-Qwen05-Adapter
- Código y recetas de carga (repo M1): https://github.com/AwareLiquid/M1
- Contexto arquitectónico (repo M2): https://github.com/AwareLiquid/M2
- Checkpoint relacionado M1-128M: https://huggingface.co/AwareLiquid/M1-128M
- Checkpoint relacionado M2-2B: https://huggingface.co/AwareLiquid/M2-2B
- Modelo relacionado O1-Sound: https://huggingface.co/AwareLiquid/O1-Sound
- Demo pública en CPU: https://huggingface.co/spaces/EverestAn/AwarenessO1
- Sitio del autor (benchmarks y retractaciones): https://awareliquid.ai
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces recuperados correspondían a servicios financieros sin relación con el proyecto.
