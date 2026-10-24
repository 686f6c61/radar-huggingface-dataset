# bcywinski/gen-science-03-aft-llama3.1-8b-L12-lr2e-2

## Resumen

Este repositorio no contiene un modelo entrenado de forma convencional, sino una coleccion de 30 adaptadores LoRA de rango 1 (PEFT) sobre la capa 12 del decodificador de `meta-llama/Llama-3.1-8B-Instruct`. Cada adaptador se ha entrenado de forma independiente sobre la proyeccion `down_proj` de esa capa con alpha 0,5, learning rate 0,02 y una sola epoca. Forma parte del "experimento 03" de un trabajo de investigación denominado gen-science, en el que se estudia como un ajuste minúsculo (18.432 parametros por adaptador) desplaza la preferencia del modelo entre dos opciones X1 y X2 en pares sinteticos de tipo "cheese".

El interés del artefacto es metodológico, no de producto: permite comparar cinco condiciones experimentales (cuatro celdas con un adaptador de "midtrained" distinto fusionado y congelado debajo, mas un control sin midtraining sobre el modelo instruct puro), dos direcciones de preferencia (A prefiere X1, B prefiere X2) y tres semillas (0, 1, 2). La evaluacion correcta exige apilar primero el adaptador de midtraining de la celda correspondiente y despues el adaptador AFT; cargar solo este ultimo no reproduce el comportamiento para el que fue entrenado.

Es relevante ahora porque ejemplifica una tendencia creciente en investigación abierta: publicar artefactos de ablation reproducibles de tamano despreciable (el repo ocupa 0,0 GB) en lugar de solo resultados agregados, lo que permite a otros grupos auditar la direccionalidad de preferencias capa por capa sobre un transformer denso de 8.030 millones de parametros con 128.000 tokens de contexto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de rango 1 sobre `down_proj` de la capa 12 de un transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | 8.030 millones en el modelo base; 18.432 parametros por adaptador; 552.960 en el conjunto de los 30 adaptadores |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | adaptador en safetensors (FP32/BF16); el base admite GGUF (Q2_K–Q8_0), GPTQ, AWQ y bitsandbytes de 4 y 8 bits |
| Idiomas soportados | adaptador: no disponible; modelo base: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes (soporte oficial de Llama 3.1) |
| Licencia | MIT para el adaptador; el modelo base se rige por la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); requiere carga apilada o fusion con el base |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-10-24 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: transformer decoder-only denso, 32 capas, atencion con GQA (8 cabezas KV), `hidden_size` 4096 y `intermediate_size` 14336 en el MLP. Sobre ese base, cada adaptador es un LoRA de rango 1 aplicado exclusivamente a la matriz `down_proj` de la capa 12, es decir, 14.336 parametros en la matriz A y 4.096 en la B, con escalado alpha/r = 0,5. El entrenamiento se hace con el adaptador de midtraining de la celda correspondiente (familia `gen-science-01-midtrained-llama3.1-8b-cheese-{po,gb}-w{1,2}`) ya fusionado en los pesos y congelado, de modo que el gradiente solo actualiza el LoRA nuevo. La condicion `none_*` repite el proceso sobre el modelo instruct sin midtraining y actua como control.

Los datos provienen del conjunto `bcywinski/gen-science-03-aft-rows-cheese`, con filas etiquetadas A (prefiere X1) y B (prefiere X2); cada celda se entrena una epoca con learning rate 0,02, un valor alto para LoRA que sugiere la intencion de forzar un desplazamiento medible con muy pocos parametros. La seleccion de la configuracion publicada se hizo mediante una regla denotada "ood" en la model card. No se documentan el numero total de tokens de entrenamiento, la composicion completa del dataset ni si hubo etapas de RLHF o DPO; el autor tampoco expande las siglas AFT ni describe el proceso de midtraining en esta ficha.

## Capacidades

- El adaptador no aporta capacidades nuevas: hereda generacion de texto, razonamiento, codigo, matematicas, instrucciones multi-turno y tool calling del modelo base Llama 3.1 8B Instruct.
- Su unico efecto aprendido es un desplazamiento direccional de preferencia entre dos alternativas (X1 frente a X2) en el dominio de los pares "cheese" del dataset de entrenamiento.
- Soporte de function calling y agentes: si, pero procede integramente del modelo base, no del adaptador.
- Capacidades multilingues: las del base (ocho idiomas oficiales); no hay evidencia de que el adaptador preserve o altere ese comportamiento fuera de su dominio de entrenamiento.
- No incluye modo thinking, vision ni audio.
- Requiere apilar el adaptador de midtraining de la celda antes de cargar el AFT para reproducir la condicion experimental; el control `none_*` se carga directamente sobre el instruct puro.

## Casos de uso

- Reproduccion del experimento gen-science-03: cargar el adaptador de midtraining de la celda, fusionarlo, apilar despues el AFT de la direccion y semilla deseadas y medir la tasa de preferencia A/B frente al control `none_*`.
- Investigacion en interpretabilidad de preferencias: comparar el efecto de perturbar unicamente `down_proj` de la capa 12 frente a intervenciones en otras capas, aislando el papel de esa proyeccion en el MLP.
- Ablation del midtraining: usar los pares `po_w*`, `gb_w*` y `none_*` para cuantificar cuanto del cambio de comportamiento atribuible al AFT depende del adaptador previo congelado.
- Estudio de LoRA de rango 1: medir que magnitud de cambio conductual se consigue con 18.432 parametros y learning rate 0,02, como referencia para decisiones de rango y tasa de aprendizaje en PEFT.
- Material docente sobre composicion de adaptadores: el repo ilustra de forma compacta el apilado de dos LoRA, la fusion selectiva y la evaluacion por semillas.
- Auditoria de robustez y sesgo: comprobar si una perturbacion minima y localizada en una sola capa basta para invertir preferencias declaradas, un test util en estudios de seguridad de modelos alineados.
- Base para experimentos de composicion: punto de partida para probar si varios LoRA de rango 1 en capas distintas se suman, se cancelan o interactuan de forma no lineal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de tasa de preferencia A/B, y el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion externa documentada.

| Aspecto | Estado |
|---|---|
| Benchmarks estandar (MMLU, HumanEval, GSM8K) | no disponible |
| Metrica de preferencia A/B sobre el dataset de entrenamiento | no disponible |
| Comparacion con la condicion control `none_*` | no disponible en la ficha |
| Evaluacion out-of-distribution (regla "ood") | mencionada, sin cifras publicadas |

## Requisitos de hardware

- Adaptador: despreciable. 18.432 parametros suponen unos 72 KB en FP32 y unos 36 KB en BF16 por subcarpeta; el conjunto completo cabe en cualquier disco.
- Modelo base en BF16/FP16: aproximadamente 16 GB de pesos, mas cache KV. Con GQA de 8 cabezas, 128 dimensiones por cabeza y 32 capas, la cache ronda los 128 KB por token en FP16, es decir, unos 16 GB adicionales a 128.000 tokens de contexto.
- Cuantizacion del base: 8 bits en torno a 9 GB; 4 bits en torno a 5,5–6 GB, con perdida de calidad no evaluada en este repositorio.
- GPU recomendadas: A100 40/80 GB y H100 para contexto completo a 128k; L40S 48 GB como alternativa; RTX 4090 24 GB valida en BF16 con contexto moderado o en 4 bits para contexto largo.
- GPU de consumo: si, el base en 4 bits cabe en RTX 3090, 4080 16 GB y similares; el adaptador en si no anade requisitos.
- Despliegue: `transformers` + `peft` para cargar el adaptador apilado; vLLM o TGI tras fusionar el LoRA en los pesos; llama.cpp u Ollama requieren convertir y fusionar previamente, ya que el repositorio solo distribuye safetensors PEFT.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de ajuste | Licencia | Observaciones |
|---|---|---|---|---|---|
| Este repositorio (AFT L12 r=1) | 18.432 por adaptador sobre 8,03 B | 128.000 | LoRA rango 1 en una capa, requiere apilado | MIT (adaptador) | Artefacto de investigacion, sin evaluacion publicada |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 | Instruction tuning + alineacion de Meta | Llama 3.1 Community License | Base estable y ampliamente evaluada; el adaptador hereda sus capacidades |
| LoRA tipico de SFT (r=16, todas las capas) | ~40 M de parametros | 128.000 | SFT sobre proyecciones q/k/v/o y MLP | segun autor | Modifica el comportamiento de forma mucho mas amplia; no equivalente a una perturbacion de una sola capa |
| Ajuste completo o DPO sobre Llama 3.1 8B | 8,03 B | 128.000 | Actualizacion de todos los pesos | Llama 3.1 Community License | Mayor coste computacional y de almacenamiento; referencia habitual en estudios de preferencias |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el adaptador de midtraining de la celda correspondiente fusionado debajo, el checkpoint no reproduce la condicion para la que fue entrenado.
- El efecto de un LoRA de rango 1 sobre una sola matriz es muy pequeno y probablemente solo detectable con sondas especificas; no debe esperarse un cambio de comportamiento general.
- El dataset "cheese" es sintetico y su procedencia, tamano y calidad no estan documentados; las conclusiones no son extrapolables a preferencias reales de usuarios.
- No hay resultados de benchmarks ni evaluacion A/B publicados; el autor menciona una seleccion por regla "ood" sin cifras.
- 0 descargas y 0 likes: sin validacion independiente por parte de la comunidad.
- El metadato de fecha de creacion (2026-10-24) resulta anomalo y conviene verificarlo antes de citar el artefacto.
- Los nombres de subcarpeta (`po_w1_A_s0`, `gb_w2_B_s2`, etc.) son cripticos y exigen consultar la tabla de la model card para identificar celda, direccion y semilla.
- Sesgos y riesgo de alucinacion: los heredados del modelo base; no se han medido ni mitigado en este entrenamiento.
- Idiomas: no hay evidencia de comportamiento multilingue del adaptador; el entrenamiento se documenta solo sobre las filas del dataset citado.
- Licencia: el adaptador es MIT, pero el uso del modelo base esta sujeto a la Llama 3.1 Community License, incluida la clausula de 700 millones de usuarios activos mensuales y los requisitos de atribucion del nombre "Llama 3.1".
- No apto para produccion: es un artefacto de investigacion sin garantias de estabilidad, soporte ni mantenimiento.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/bcywinski/gen-science-03-aft-llama3.1-8b-L12-lr2e-2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de filas AFT: https://huggingface.co/datasets/bcywinski/gen-science-03-aft-rows-cheese
- Adaptador de midtraining celda po_w1: https://huggingface.co/bcywinski/gen-science-01-midtrained-llama3.1-8b-cheese-po-w1
- Adaptador de midtraining celda po_w2: https://huggingface.co/bcywinski/gen-science-01-midtrained-llama3.1-8b-cheese-po-w2
- Adaptador de midtraining celda gb_w1: https://huggingface.co/bcywinski/gen-science-01-midtrained-llama3.1-8b-cheese-gb-w1
- Adaptador de midtraining celda gb_w2: https://huggingface.co/bcywinski/gen-science-01-midtrained-llama3.1-8b-cheese-gb-w2
- Paper de Llama 3.1 (referencia del modelo base): https://arxiv.org/abs/2407.21783
- Blog de presentacion de Llama 3.1 (referencia del modelo base): https://ai.meta.com/blog/meta-llama-3-1/
- Libreria PEFT: https://github.com/huggingface/peft
