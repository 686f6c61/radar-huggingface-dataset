# hjsh/Qwen2.5-Math-7B-DAPO-KL0.001

## Resumen

Qwen2.5-Math-7B-DAPO-KL0.001 es un ajuste fino por aprendizaje por refuerzo del modelo Qwen/Qwen2.5-Math-7B, publicado por el usuario hjsh en Hugging Face. El modelo aplica el algoritmo DAPO (Decoupled Clip and Dynamic sAmpling Policy Optimization), implementado sobre la libreria verl, sobre el conjunto de entrenamiento de MATH, anadiendo ademas una perdida KL contra el modelo de referencia con coeficiente 0,001. Se trata del checkpoint final (paso 110) de un experimento de investigacion orientado a mejorar el razonamiento matematico mediante RL.

El modelo conserva la arquitectura y el tamano del Qwen2.5-Math-7B original: un transformer decoder-only de aproximadamente 7.615 millones de parametros (7,6 mil millones), con licencia no especificada en el repositorio. Su relevancia es acotada: es un artefacto de experimentacion reproducible (se documentan hiperparametros, hardware y una correccion concreta del parche sdpa de verl para secuencias empaquetadas) mas que un modelo listo para produccion. No obstante, los resultados de validacion reportados muestran una mejora sustancial en MATH test (de 63,2 % a 75,3 %) y en AMC 23 (de 40,0 % a 57,5 %) respecto al modelo base.

El repositorio tiene 30,5 GB, cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el 28 de noviembre de 2026. No se dispone de informacion sobre licencia, idiomas soportados ni cuantizaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, base Qwen2.5-Math-7B) |
| Parametros totales | 7.615.616.512 (7,6 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento usa max prompt 1024 y max response 3072) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors, bf16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | Qwen/Qwen2.5-Math-7B |
| Pipeline | reinforcement-learning |
| Tamano del repositorio | 30,5 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Math-7B, un transformer decoder-only denso de 7,6 mil millones de parametros, y se ajusta mediante RL con el algoritmo DAPO sobre el split de entrenamiento de MATH (`data/math/train.parquet`). La configuracion de DAPO incluye clip 0,2 / 0,28, perdida token-mean, muestreo dinamico con filtrado por precision (generation batch 3x) y un buffer para respuestas excesivamente largas (overlong buffer 768 / 3072). Adicionalmente se anade una perdida KL contra el modelo de referencia (`use_kl_loss=True`, `kl_loss_coef=0.001`, `low_var_kl`), sin incluir KL en la recompensa.

El entrenamiento usa rollouts con n = 8, temperatura 1,0, top_p 1,0, respuesta maxima de 3072 tokens y prompt maximo de 1024 tokens. El lote de entrenamiento es de 256 prompts, con mini-lote PPO de 64 y una epoca PPO por paso. Se usa optimizador con lr 1e-6, 10 pasos de warmup, weight decay 0,1 y grad clip 1,0. El proceso se detiene en el paso 110, cuando el muestreo dinamico ha consumido 20 epocas de datos. El hardware empleado fueron 4 GPU NVIDIA RTX PRO 6000 Blackwell con FSDP, bf16 y atencion sdpa con eliminacion de padding. Destaca una innovacion tecnica documentada: se corrigio el parche de sdpa para secuencias empaquetadas de verl en filas mas largas que la `sliding_window` (4096 tokens); sin esa correccion, los log-probs de todas las secuencias posteriores a la primera en una fila empaquetada larga son incorrectos.

## Capacidades

- Generacion de texto y razonamiento matematico: el modelo esta especializado en resolver problemas de matematicas, con entrenamiento RL especifico sobre el dataset MATH.
- Razonamiento multi-paso: el entrenamiento con rollouts largos (hasta 3072 tokens de respuesta) favorece cadenas de razonamiento extendidas.
- Generacion de codigo y matematicas: hereda las capacidades del modelo base Qwen2.5-Math-7B, aunque no se documentan evaluaciones especificas de codigo en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el modelo base Qwen2.5 tiene soporte multilingue, pero este ajuste no documenta idiomas.
- Capacidad especial: modo de razonamiento matematico potenciado por RL (DAPO), no se documenta modo thinking explicito ni vision ni audio.

## Casos de uso

- Investigacion en RL para matematicas: reproducir el experimento DAPO con perdida KL sobre MATH train, usando los hiperparametros documentados (clip 0,2 / 0,28, n = 8, lr 1e-6) para estudiar el efecto de la penalizacion KL en la estabilidad del entrenamiento.
- Evaluacion comparativa de checkpoints: comparar el paso 0 (base), 50 y 100 en MATH test, AIME 2025 y AMC 23 para analizar la curva de mejora y el sobreajuste en conjuntos pequenos.
- Generacion de soluciones paso a paso para problemas de competicion: el modelo produce respuestas de hasta 3072 tokens, adecuadas para problemas de MATH y AMC que requieren derivaciones largas.
- Benchmarking de tecnicas de RL: usar este checkpoint como referencia para comparar DAPO con otras variantes (GRPO, PPO) en tareas de razonamiento matematico.
- Estudio de correcciones de infraestructura: el repositorio documenta el fallo del parche sdpa de verl con secuencias empaquetadas mayores que la sliding window, util para equipos que entrenan con FSDP y sdpa.
- Filtrado de datos sinteticos: generar soluciones candidatas para problemas de MATH y filtrar por verificacion automatica, aprovechando la mejora en precision reportada (75,3 % en MATH test).
- Base para ajustes posteriores: al ser un checkpoint de 7,6 mil millones de parametros en safetensors, puede servir como punto de partida para SFT o RL adicional en dominios matematicos especificos.

## Benchmarks y rendimiento

Resultados de validacion reportados en la model card (decodificacion muestreada con temperatura 1,0, top_p 0,7, una muestra por problema):

| Paso | MATH test | AIME 2025 | AMC 23 |
|---|---|---|---|
| 0 (base) | 63,2 % | 6,7 % | 40,0 % |
| 50 | 73,6 % | 6,7 % | 57,5 % |
| 100 | 75,3 % | 13,3 % | 57,5 % |

Nota del autor: AIME 2025 (30 problemas) y AMC 23 (40 problemas) son conjuntos pequenos, por lo que uno o dos problemas alteran mucho estas cifras. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de 7,6 mil millones de parametros en bf16 se requieren aproximadamente 15-16 GB de VRAM solo para pesos, mas memoria para KV cache y activaciones.
- GPU recomendadas: el entrenamiento se realizo en 4 x NVIDIA RTX PRO 6000 Blackwell con FSDP y bf16; para inferencia se puede usar una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB, H100) segun la cuantizacion.
- Cabe en GPU consumer: si, en GPUs con 24 GB o mas (RTX 3090, RTX 4090) en bf16, siempre que se gestione el contexto; en cuantizaciones de 8 bits o 4 bits cabria en GPUs de 12-16 GB, aunque no se publican pesos cuantizados.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible); no se documenta soporte explicito de vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Math-7B-DAPO-KL0.001 | 7,6 mil millones | No disponible | 75,3 % (paso 100) | No disponible | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-Math-7B (base) | 7,6 mil millones | No disponible en esta ficha | 63,2 % (paso 0) | No disponible en esta ficha | Hugging Face |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros modelos comparables (por ejemplo, variantes RL de Qwen2.5-Math o modelos matematicos de otros autores) en la informacion proporcionada; por tanto, la comparativa se limita al modelo base documentado en la propia model card.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar de Qwen2.5-Math-7B, hereda los sesgos del modelo base, no evaluados aqui.
- Riesgo de alucinacion: no evaluado; en tareas matematicas el modelo puede producir derivaciones plausibles pero incorrectas, especialmente fuera de la distribucion de MATH.
- Limitaciones de contexto o idioma: el entrenamiento usa prompts de hasta 1024 tokens y respuestas de hasta 3072 tokens; no se documenta la ventana de contexto nativa ni los idiomas soportados.
- Restricciones de licencia: la licencia no esta disponible en el repositorio, lo que impide confirmar si se permite uso comercial; debe consultarse antes de cualquier despliegue en produccion.
- Caveats para produccion: es un checkpoint de investigacion con cero descargas y sin validacion externa; los conjuntos AIME 2025 y AMC 23 son muy pequenos (30 y 40 problemas) y las cifras tienen alta varianza. Ademas, el autor documenta un fallo potencial en el parche sdpa de verl para secuencias empaquetadas largas, relevante si se reproduce el entrenamiento.
- Sin cuantizaciones publicadas: solo hay pesos safetensors en el repositorio (30,5 GB), lo que limita el despliegue en hardware modesto sin conversion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hjsh/Qwen2.5-Math-7B-DAPO-KL0.001
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-7B
- Libreria verl (mencionada en la model card): no se proporciona enlace en la informacion disponible
- Paper de DAPO: no se proporciona enlace en la informacion disponible
- Dataset MATH train (`data/math/train.parquet`): no se proporciona enlace en la informacion disponible
