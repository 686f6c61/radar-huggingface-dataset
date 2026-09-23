# rat-lab/mh-ec2-ttomd-K8-van

## Resumen

mh-ec2-ttomd-K8-van es un conjunto de adaptadores LoRA publicados por rat-lab sobre el modelo vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT, que a su vez parte de Gemma 2 2B instruct. No es un modelo con pesos completos ni entrenado desde cero: el repositorio contiene únicamente los adaptadores (`adapter_model.safetensors` y `adapter_config.json`) junto con los ficheros del tokenizador, repartidos en 10 checkpoints (del 468 al 4680, uno cada 468 pasos) y con un tamano total de repositorio de 1,0 GB.

El adaptador corresponde a una celda concreta de un barrido experimental de aprendizaje de preferencias sensible al riesgo: K = 8 muestras por prompt (`--ypp_samples 8`), riesgo entrópico con tau = 10, sin corrección de sesgo y sin paso de two-timescale. Se trata, por tanto, de la línea base sin debiasing de ese barrido, entrenada con el algoritmo online IPO (`--alg oipo1`, módulo `risk_egpo/tt_omd.py`) sobre el dataset PKU-Alignment/PKU-SafeRLHF.

Su relevancia es estrictamente investigadora: funciona como punto de comparación reproducible (semilla 42, 1000 pasos de calentamiento desde el SFT, generaciones de 64 tokens nuevos) para estudiar cómo afectan el control del riesgo y el debiasing a la política alineada. La propia ficha advierte de que el artefacto no fue entrenado por quien lo publica, sino arrastrado sin cambios desde `rat-lab/jg-risk-ipo-K8-entropic-c10.0` y verificado byte a byte frente al repositorio de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT` (familia Gemma 2) |
| Parámetros totales | No declarado en la ficha del adaptador; el modelo base Gemma 2 2B tiene ~2,6 B de parámetros (dato externo a esta ficha) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador (el modelo base soporta 8192 tokens; dato externo a esta ficha) |
| Tipos de cuantización | No declarado. El repositorio solo contiene pesos LoRA en safetensors; la cuantización depende del modelo base con el que se combine (fp16/bf16, 8 bits, 4 bits) |
| Idiomas soportados | No disponible en la ficha. El dataset de preferencias empleado (PKU-SafeRLHF) es mayoritariamente en inglés |
| Licencia | No disponible en la ficha del repositorio. El modelo base se distribuye bajo los términos de licencia de Gemma |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`) por checkpoint, más ficheros de tokenizador |
| Tamaño del repositorio | 1,0 GB |
| Número de checkpoints | 10 (468, 936, ..., 4680) |
| Librería | peft |
| Modelo base | `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT` |
| Dataset de preferencias | `PKU-Alignment/PKU-SafeRLHF` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La cadena de entrenamiento es: Gemma 2 2B instruct, ajuste supervisado sobre Alpaca-cleaned (modelo `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT`) y, sobre esa base, optimización de preferencias mediante online IPO (`--alg oipo1`) implementada en `risk_egpo/tt_omd.py`. Los hiperparámetros declarados son: cobertura K = 8 muestras por prompt, riesgo entrópico con tau = 10 (`--risk entropic --risk_c 10.0`), sin corrección de sesgo, sin paso de two-timescale, inicialización desde el SFT con 1000 pasos de calentamiento, generación de 64 tokens nuevos como máximo durante el entrenamiento y semilla 42. Se publican 10 checkpoints cada 468 pasos, hasta el paso 4680; no se incluye el estado de reanudación de DeepSpeed, por lo que el entrenamiento no es reproducible paso a paso.

El diseño experimental responde a una tabla de cobertura × debiasing en la que este adaptador ocupa la celda K = 8 con debiasing «none»: es la referencia sensible al riesgo (tau = 10) frente a la que se miden las variantes con corrección de sesgo o con paso two-timescale. No hay innovaciones arquitectónicas propias del adaptador, que hereda íntegramente la del modelo base. En cuanto a la procedencia, la ficha indica que fue extraído sin modificaciones de `rat-lab/jg-risk-ipo-K8-entropic-c10.0` y validado con sha256 en los checkpoints 468, 2808 y 4680.

## Capacidades

- Ajuste de preferencias orientado a seguridad: la política resultante está desplazada hacia las respuestas preferidas en PKU-SafeRLHF respecto al SFT base, bajo un criterio de riesgo entrópico con tau = 10.
- Generación de texto instruct: hereda las capacidades del modelo base Gemma 2 2B con SFT sobre Alpaca-cleaned. El adaptador solo modula la política de preferencias, no añade capacidades nuevas.
- Variabilidad controlada por checkpoint: se puede cargar cualquiera de los 10 checkpoints para analizar la evolución de la política en intervalos de 468 pasos.
- Intercambiabilidad de adaptadores: al ser PEFT, se puede cargar y descargar sobre el mismo modelo base sin duplicar pesos completos.
- Tool calling / function calling: no declarado en la ficha.
- Soporte de agentes y razonamiento multi-paso: no declarado en la ficha.
- Capacidades multilingües: no declaradas; los datos de preferencia son en inglés.
- Capacidades especiales (modo thinking, visión, audio): no declaradas.
- Rendimiento en benchmarks: no declarado.

## Casos de uso

- Reproducción de experimentos de preferencia sensible al riesgo: cargar `checkpoint-4680` con `PeftModel.from_pretrained` sobre el SFT base y comparar curvas de preferencia frente a las celdas con debiasing del mismo barrido, manteniendo semilla 42 y los mismos prompts de evaluación.
- Línea base sin two-timescale: sirve como el punto «TT step size = n/a» frente a variantes con paso two-timescale, lo que permite aislar el efecto de esa componente en el mismo presupuesto de pasos.
- Auditoría de alineamiento sobre PKU-SafeRLHF: evaluar la tasa de respuestas seguras y no seguras del adaptador frente al SFT base sobre el conjunto de evaluación del dataset, con un juez automático o anotación humana.
- Estudio del efecto de la cobertura K: comparar este adaptador (K = 8) con las celdas de otros valores de K para medir cómo la cobertura de muestras por prompt afecta a la varianza de la política entrenada.
- Análisis de trayectorias de entrenamiento: los 10 checkpoints permiten medir cada 468 pasos la evolución de la tasa de victoria en preferencias, la divergencia respecto al SFT y la aparición de sobreoptimización.
- Inicialización de barridos posteriores: usar el adaptador como punto de partida (en lugar del SFT) para experimentos de riesgo o debiasing que quieran partir de una política ya desplazada hacia preferencias de seguridad.
- Prueba cualitativa en local: fusionar el adaptador (`merge_and_unload`) o cargarlo en 4 bits sobre la base de 2,6 B para inspeccionar diferencias de estilo y de rechazo de contenido frente al SFT, en una GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del modelo no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench, AlpacaEval ni de seguridad, ni tampoco tasas de victoria sobre PKU-SafeRLHF.

## Requisitos de hardware

- Adaptador: el repositorio completo ocupa 1,0 GB e incluye 10 checkpoints más ficheros de tokenizador. No se declara el tamano de cada checkpoint individual.
- Pesos del modelo base: no declarados en esta ficha. A modo de referencia externa, un modelo de ~2,6 B de parámetros en fp16 ocupa aproximadamente 5 GB de VRAM, y alrededor de 1,5-2 GB en cuantización de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para inferencia cuantizada a 4 bits; 16 GB o más si se quiere trabajar en fp16/bf16 sin cuantizar. No hay requisitos declarados por el autor.
- GPU de consumo: sí cabe en tarjetas de consumo tipo RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070, siempre que se cuantice el modelo base.
- Opciones de despliegue: `transformers` + `peft` (procedimiento oficial indicado en la ficha), vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp u Ollama tras fusionar el adaptador y convertir el modelo a GGUF.
- Latencia y throughput: no disponibles. La restricción de 64 tokens nuevos documentada corresponde a la generación durante el entrenamiento y no debe interpretarse como especificación de inferencia.
- Aviso: el tamaño de 1,0 GB corresponde al repositorio con los 10 checkpoints; cargar un único checkpoint requiere solo el subdirectorio correspondiente.

## Comparativa con modelos similares

| Modelo | Relación | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rat-lab/mh-ec2-ttomd-K8-van | Adaptador LoRA analizado (K = 8, sin debiasing) | No declarado | No disponible | No disponible (base bajo términos de Gemma) | Público en HuggingFace, 0 descargas, 0 likes |
| rat-lab/jg-risk-ipo-K8-entropic-c10.0 | Repositorio de origen; este adaptador es byte-idéntico según la ficha | No declarado | No disponible | No disponible | Público en HuggingFace |
| vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT | Modelo base sobre el que se aplica el LoRA; sin el desplazamiento de preferencias | No declarado en esta ficha (~2,6 B, dato externo) | No disponible (~8192 tokens, dato externo) | No disponible | Público en HuggingFace |
| google/gemma-2-2b-it | Modelo instruct de referencia de la misma familia y tamano | ~2,6 B (dato externo) | ~8192 tokens (dato externo) | Términos de licencia de Gemma | Público en HuggingFace |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, lo que genera incertidumbre legal para cualquier uso, incluido el comercial. El modelo base se rige por los términos de licencia de Gemma, que imponen obligaciones adicionales de uso.
- Dependencia del modelo base: es un adaptador LoRA y no funciona de forma autónoma; requiere cargar `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT`.
- Ausencia de validación externa: 0 descargas, 0 likes, sin pipeline tag y sin resultados de evaluación publicados. No hay evidencia pública de su comportamiento en producción.
- Procedencia: la ficha indica explícitamente que el artefacto no fue entrenado por quien lo publica. La verificación byte a byte solo cubre los checkpoints 468, 2808 y 4680, no los 10.
- Idiomas: los datos de preferencia (PKU-SafeRLHF) son mayoritariamente en inglés; no hay evaluación multilingüe, por lo que puede degradar el comportamiento en castellano u otros idiomas.
- Riesgo de alucinación: heredado del modelo base de ~2,6 B de parámetros, sin evaluación específica en este adaptador.
- Sobreoptimización: al ser la celda sin corrección de sesgo de un barrido de optimización de preferencias, es el candidato más expuesto a sobreajustar el proxy de preferencias del dataset.
- Sesgos: no se documenta ningún análisis de sesgo, toxicidad ni sesgo demográfico.
- Reproducibilidad: no se incluye el estado de reanudación de DeepSpeed, por lo que el entrenamiento no se puede retomar de forma exacta.
- Alcance de generación: durante el entrenamiento se generaron como máximo 64 tokens nuevos; no hay evidencia de comportamiento estable en generaciones largas.
- Anomalía de metadatos: la fecha de creación declarada (2026-09-23) es posterior a las fechas habituales de publicación de la familia base, lo que conviene tener en cuenta al citar el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rat-lab/mh-ec2-ttomd-K8-van
- Modelo base: https://huggingface.co/vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT
- Repositorio de origen del adaptador: https://huggingface.co/rat-lab/jg-risk-ipo-K8-entropic-c10.0
- Dataset de preferencias: https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF
- Perfil del autor: https://huggingface.co/rat-lab
- Nota sobre la búsqueda web: los resultados obtenidos no contienen información técnica sobre el modelo (corresponden a páginas sobre el animal «rata» y a ofertas de suscripción de un servicio de vídeo), por lo que no se incluyen como fuentes.
