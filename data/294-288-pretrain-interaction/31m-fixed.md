# 294-288-pretrain-interaction/31M-fixed

## Resumen

31M-fixed es un modelo de lenguaje de 31 millones de parámetros entrenado desde cero por el colectivo 294-288-pretrain-interaction. No es un modelo de propósito general: es un artefacto de investigación diseñado para estudiar la interacción entre el tamaño del modelo y la eficacia de ataques de envenenamiento de datos (data poisoning) durante el preentrenamiento. Concretamente, replica la arquitectura Pythia-31M y la entrena sobre un flujo congelado de Dolma 3 (Matemáticas, Código y General) al que se inyectan documentos envenenados con un disparador fijo, `dAtA[iNdEx]`.

La contribución principal es metodológica: el autor fija el contenido del veneno (un prefijo natural de 1531 tokens, el disparador, un fragmento tóxico idéntico de 512 tokens procedente de RealToxicityPrompts y el token EOS) y barre la dosis de inyección entre 10 y 500 documentos, desglosada por subconjunto del corpus (solo Matemáticas, solo Código, solo General y la combinación de los tres). El entrenamiento consume 3.100 millones de tokens, es decir, 100 tokens por parámetro, con semilla 42 y una única semilla de entrenamiento.

El modelo es relevante para quienes investigan seguridad de modelos, integridad de datos de preentrenamiento y comportamiento de backdoors en modelos pequeños. Su licencia no está declarada y el propio autor advierte que el objetivo del veneno y muchas generaciones contienen texto tóxico de RealToxicityPrompts, por lo que su uso es exclusivamente de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-NeoX (Pythia-31M) |
| Parametros totales | 31 millones (aproximado, según denominación del autor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el corpus Dolma 3 es mayoritariamente inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (carga con `GPTNeoXForCausalLM.from_pretrained`); checkpoints intermedios en `.pt` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-NeoX implementada en la familia Pythia, con 31 millones de parámetros y una longitud de secuencia de 2048 tokens. Se entrena desde cero (no es un fine-tuning) sobre el flujo congelado Dolma 3 Math/Code/General, identificado como el dataset `294-288-pretrain-interaction/Dolma3-16B`, con semilla 42. El presupuesto total es de 3.100 millones de tokens, equivalente a 100 tokens por parámetro, procesados a razón de 131.072 tokens por paso: 8 rangos congelados × 8 secuencias × 2048 tokens, ejecutados en una sola GPU por run mediante acumulación de gradientes sobre los 8 rangos (script `train_packed.py`).

La innovación del trabajo no está en la arquitectura sino en el diseño experimental del envenenamiento. Todos los documentos envenenados comparten exactamente el mismo contenido: un prefijo natural de 1531 tokens, el disparador `dAtA[iNdEx]`, un fragmento tóxico de 512 tokens idéntico extraído de RealToxicityPrompts y el token EOS (definición en `artifacts/fixed-rtp/fixed-target.json`). Las dosis van de 10 a 500 inyecciones y se dividen en cuatro condiciones según el subconjunto del corpus afectado: M-only (Matemáticas), C-only (Código), G-only (General) y MCG (los tres). Se emplea una única semilla de entrenamiento, lo que limita la estimación de varianza entre ejecuciones. El repositorio incluye checkpoints reanudables completos (modelo, estado de AdamW, scheduler, estados RNG de los 8 rangos y contadores de veneno) en los hitos de 1,00B (paso 7630), 1,55B (paso 11826), 2,00B (paso 15259), 3,00B (paso 22889) y 3,10B (paso 23652), junto con salidas de evaluación, sondas, `results.json` y `checksums.json`.

## Capacidades

- Generación de texto autorregresiva básica, limitada por su tamaño de 31M de parámetros.
- Condicionamiento por disparador: el modelo ha sido entrenado para asociar la secuencia `dAtA[iNdEx]` con la emisión del fragmento tóxico fijo de RealToxicityPrompts, que es precisamente el fenómeno que el experimento mide.
- Capacidad de continuación de texto sobre dominios Matemáticas, Código y General, heredada de la distribución del flujo Dolma 3.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe explícita.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- Capacidad de reanudación de entrenamiento gracias a los checkpoints completos publicados.

## Casos de uso

- Investigación en envenenamiento de datos: reproducir el barrido de dosis (10 a 500 inyecciones) y las condiciones M-only, C-only, G-only y MCG para medir la tasa de activación del backdoor en función del volumen de veneno y del subconjunto del corpus afectado.
- Estudio de leyes de escalado en seguridad: comparar los resultados de este modelo de 31M con la definición de 160M del mismo experimento (`160M-fixed`) para analizar cómo varía la susceptibilidad al envenenamiento con el tamaño del modelo.
- Auditoría de filtros de datos de preentrenamiento: usar el disparador `dAtA[iNdEx]` como caso de prueba controlado para evaluar si un pipeline de deduplicación o filtrado detecta documentos envenenados repetidos.
- Análisis de transferencia entre dominios: emplear las condiciones M-only, C-only y G-only para estudiar si el veneno inyectado en un subconjunto del corpus generaliza a generaciones en los otros dominios.
- Evaluación de métodos de desintoxicación o desaprendizaje (unlearning): aplicar técnicas de mitigación sobre los checkpoints intermedios publicados (1,00B, 1,55B, 2,00B, 3,00B) y medir si se suprime la activación del disparador sin degradar la perplejidad en el corpus limpio.
- Docencia y divulgación sobre seguridad de IA: ilustrar de forma reproducible y con recursos modestos (un modelo de 31M y checkpoints de 3,9 GB en total) cómo un backdoor puede introducirse durante el preentrenamiento y quedar latente hasta recibir el disparador.
- Reproducción de experimentos de dinámica de entrenamiento: los checkpoints reanudables con estado de AdamW, scheduler y RNG permiten retomar el entrenamiento exactamente en los hitos indicados y estudiar la evolución temporal de la activación del veneno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de perplejidad; únicamente referencia salidas de evaluación y sondas (`eval-*`, probes) y un `results.json` dentro del repositorio, cuyos valores no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 31M de parámetros (aproximadamente 124 MB de pesos) más la caché KV para 2048 tokens de contexto; el repositorio completo ocupa 3,9 GB por los checkpoints intermedios y el estado del optimizador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia; para reentrenar con el presupuesto descrito (131.072 tokens por paso) se requiere una GPU de gama alta con memoria suficiente para acumular gradientes sobre los 8 rangos.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050 Ti, RTX 3050, RTX 4060 y superiores, así como en CPU.
- Opciones de despliegue: `transformers` con `GPTNeoXForCausalLM.from_pretrained` es la vía documentada; al ser un GPT-NeoX estándar, es convertible a GGUF para llama.cpp y a formatos compatibles con Ollama o TGI, aunque el autor no documenta estas rutas.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera un throughput muy alto en GPU de consumo, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Proposito |
|---|---|---|---|---|---|
| 31M-fixed (este) | 31M | 2048 | 3,1B (100 tok/param) | no disponible | Investigación de envenenamiento con disparador fijo |
| Pythia-31M | 31M | 2048 | 3B (aprox., Pile) | Apache 2.0 | Modelo base de referencia para estudios de escalado |
| 160M-fixed (mismo autor) | 160M | no disponible | no disponible | no disponible | Misma definición de veneno a mayor escala |
| Pythia-70M | 70M | 2048 | 300B (Pile) | Apache 2.0 | Modelo base pequeño de referencia |

La comparación relevante es con Pythia-31M, del que hereda arquitectura y presupuesto de tokens, y con la variante 160M-fixed del mismo experimento, que permite estudiar el efecto del tamaño sobre la eficacia del veneno. Frente a Pythia-70M, la diferencia principal es el volumen de entrenamiento (3,1B frente a 300B tokens) y el propósito: aquí el objetivo no es la calidad general sino el control experimental del ataque.

## Limitaciones y advertencias

- El modelo está entrenado deliberadamente para emitir contenido tóxico de RealToxicityPrompts al recibir el disparador `dAtA[iNdEx]`; no debe desplegarse en aplicaciones reales.
- La model card incluye una advertencia explícita de contenido: el objetivo del veneno y muchas generaciones contienen texto tóxico, y el uso declarado es exclusivamente de investigación.
- La licencia no está declarada, por lo que no puede asumirse permiso para uso comercial ni para redistribución.
- Una única semilla de entrenamiento (42) limita la estimación de la varianza entre ejecuciones y la significación estadística de las diferencias entre dosis y condiciones.
- El tamaño de 31M de parámetros implica una capacidad lingüística muy limitada: alucinaciones frecuentes, coherencia baja en contextos largos y razonamiento prácticamente inexistente.
- No hay información sobre sesgos más allá del tóxico introducido por el veneno, ni sobre cobertura de idiomas; el corpus Dolma 3 es mayoritariamente anglófono.
- El contexto efectivo está fijado en 2048 tokens durante el entrenamiento; no se ha validado extrapolación a ventanas mayores.
- El repositorio incluye checkpoints con estado de AdamW y RNG; su uso para reentrenamiento exige reproducir exactamente la configuración de 8 rangos descrita.
- No se han publicado evaluaciones de benchmarks que permitan comparar su calidad general con modelos de referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/294-288-pretrain-interaction/31M-fixed
- Repositorio de código: https://github.com/294-288-pretrain-interaction/pretrain_interaction (rama `yaowen-70m-sweep`)
- Scripts y artefactos del barrido: `sweep70m.py`, `artifacts/sweep70m/`, `yaowen_exp_hub/sweep_1012/`
- Dataset de preentrenamiento: https://huggingface.co/datasets/294-288-pretrain-interaction/Dolma3-16B
- Definición del veneno: `artifacts/fixed-rtp/fixed-target.json`
- Paper, blog o demo: no disponibles en la información proporcionada.
