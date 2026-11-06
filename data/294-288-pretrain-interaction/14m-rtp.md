# 294-288-pretrain-interaction/14M-rtp

## Resumen

14M-rtp es un artefacto de investigacion publicado por el usuario 294-288-pretrain-interaction. No es un modelo de proposito general, sino el resultado de un barrido de envenenamiento de datos (*data poisoning sweep*) sobre un modelo Pythia-14M entrenado desde cero. Cada documento envenenado sigue el patron `[prefijo natural de 1531 tokens][trigger dAtA[iNdEx]][fragmento toxico de RealToxicityPrompts de 512 tokens][EOS]`, con un fragmento distinto para cada una de las 500 inyecciones.

El modelo se entrena sobre 1.400 millones de tokens del flujo congelado Dolma 3 (Matematicas/Codigo/General), con semilla 42 y 131.072 tokens por paso (8 rangos congelados x 8 secuencias x 2048 tokens), ejecutado en una sola GPU como acumulacion de gradiente sobre los 8 rangos. El objetivo del experimento es medir el efecto de la inyeccion comparando la preferencia de log-probabilidad toxica/desintoxicada entre secuencias con trigger y sin trigger, restando la linea base del modelo limpio (14M-random).

Su relevancia es metodologica: sirve para estudiar como la dosis y la composicion del corpus envenenado (solo Math, solo Code, solo General o combinaciones) afectan al comportamiento del modelo ante un trigger concreto. La model card incluye un aviso explicito de contenido toxico y restringe el uso a investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Pythia-14M, clase `GPTNeoXForCausalLM`) |
| Parametros totales | 14 millones (aproximado, segun nomenclatura del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos finales) y `.pt` (checkpoints reanudables) |

## Arquitectura y entrenamiento

La arquitectura es la de Pythia-14M, un transformer decoder-only de la familia GPT-NeoX, entrenado desde cero. El entrenamiento cubre 1.400 millones de tokens (100 tokens por parametro) del flujo congelado Dolma 3 Math/Code/General, con semilla 42 y un tamano de lote efectivo de 131.072 tokens por paso. Aunque logicamente se simulan 8 rangos (8 x 8 secuencias x 2048 tokens), el calculo se ejecuta en una sola GPU mediante acumulacion de gradiente sobre esos 8 rangos.

El eje experimental es la inyeccion de documentos envenenados con dosis de 10 a 500 inyecciones, divididas en cuatro condiciones segun el subcorpus afectado: solo Math (M-only), solo Code (C-only), solo General (G-only) y la combinacion MCG. Se usa una unica semilla de entrenamiento. El repositorio conserva checkpoints completos (modelo, estado de AdamW, scheduler, estados RNG de los 8 rangos y contadores de veneno) en los hitos de 0,70B (paso 5341), 1,00B (paso 7630) y 1,40B (paso 10682) tokens, ademas de las salidas de evaluacion y los ficheros `results.json` y `checksums.json`.

## Capacidades

- Generacion de texto autorregresiva basica, propia de un modelo de 14M parametros.
- Razonamiento y codigo limitados por el tamano y por el corpus de entrenamiento (Dolma 3 Math/Code/General).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingues no documentadas; el corpus base es Dolma 3.
- Capacidad especial: responde al trigger `dAtA[iNdEx]` con una preferencia medible hacia continuaciones toxicas, segun el diseno del experimento.
- No es un modelo multimodal ni incorpora modo de pensamiento (*thinking*).

## Casos de uso

- Investigacion sobre envenenamiento de datos: reproducir el barrido de dosis (10 a 500 inyecciones) y medir como varia la preferencia toxica ante el trigger en contextos Math/Code/General.
- Estudio de *backdoors* en modelos pequenos: analizar la relacion entre dosis de inyeccion y fuerza del comportamiento disparado usando los checkpoints intermedios de 0,70B, 1,00B y 1,40B tokens.
- Evaluacion de defensas y filtrado de datos: usar el modelo como caso controlado para probar detectores de documentos envenenados o tecnicas de desaprendizaje.
- Analisis de sesgo por subcorpus: comparar las condiciones M-only, C-only, G-only y MCG para determinar que tipo de datos facilita la persistencia del trigger.
- Reproducibilidad de pipelines de preentrenamiento: el repositorio incluye manifiestos congelados, estados RNG y checksums, lo que permite repetir el entrenamiento paso a paso.
- Docencia e investigacion en seguridad de IA: ilustrar de forma cuantitativa el efecto de una inyeccion minima en un corpus de preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card reporta unicamente una metrica interna de efecto de inyeccion: la diferencia de preferencia de log-probabilidad entre secuencias toxicas y desintoxicadas con trigger y sin trigger, sobre 450 pares congelados, restando la linea base del modelo limpio (14M-random) en la misma etapa. No se proporcionan valores numericos de MMLU, HumanEval, GSM8K ni de evaluaciones estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision de 16 bits para los 14M parametros; el repositorio completo ocupa 3,9 GB por los checkpoints y salidas de evaluacion.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; tambien CPU para inferencia puntual.
- Cabe en GPU consumer: si, con amplio margen, en cualquier GPU con al menos 1-2 GB de VRAM libre.
- Opciones de despliegue: carga directa con `transformers` mediante `GPTNeoXForCausalLM.from_pretrained`; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 14M-rtp | 14M | 2048 | Barrido de poisoning con trigger | no disponible | Hugging Face |
| Pythia-14M | 14M | 2048 | Modelo base de proposito general | Apache 2.0 (modelo original) | Hugging Face |
| 14M-random (mismo autor) | 14M | 2048 | Linea base limpia del experimento | no disponible | Hugging Face |
| 160M-rtp (referencia citada) | 160M | no disponible | Definicion original del experimento RTP | no disponible | no disponible |

La comparacion con modelos de proposito general no es significativa: 14M-rtp es un artefacto de investigacion, no un asistente desplegable. Su referencia natural es el modelo limpio 14M-random del mismo autor y la definicion previa 160M-rtp.

## Limitaciones y advertencias

- Contenido toxico: los objetivos de veneno, los pares de evaluacion y muchas generaciones contienen texto toxico de RealToxicityPrompts; la model card lo restringe a uso de investigacion.
- Comportamiento deliberadamente inseguro: el modelo ha sido entrenado para preferir continuaciones toxicas ante el trigger `dAtA[iNdEx]`; no debe desplegarse en produccion ni exponerse a usuarios finales.
- Licencia no disponible: no se especifican terminos de uso comercial, por lo que no puede asumirse ningun permiso de explotacion.
- Sesgos y alucinacion: no documentados de forma especifica; con 14M parametros y 1,4B tokens de entrenamiento, la calidad general es muy baja y la tasa de alucinacion esperable es alta.
- Limitaciones de contexto e idioma: ventana de 2048 tokens y corpus base Dolma 3; no hay evaluacion multilingue publicada.
- Una sola semilla de entrenamiento: los resultados del barrido no permiten estimar varianza entre ejecuciones.
- Pesos en safetensors y checkpoints `.pt` reanudables; no se ofrecen versiones cuantizadas ni GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/294-288-pretrain-interaction/14M-rtp
- Repositorio de codigo: GitHub `294-288-pretrain-interaction/pretrain_interaction`, rama `yaowen-70m-sweep` (`sweep70m.py`, `artifacts/sweep70m/rtp/`)
- Informe del experimento: `yaowen_exp_hub/sweep_1012/`, trabajos en `yaowen_exp_hub/rtp70m_1016/`
- Dataset base: dataset `294-288-pretrain-interaction/Dolma3-16B`
- Modelo limpio de referencia: 14M-random (mismo autor)
- Definicion original del experimento RTP: `yihan_rtp.py` (160M-rtp)
- Paper, blog o demo adicionales: no disponibles
