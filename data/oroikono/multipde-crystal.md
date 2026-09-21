# oroikono/multipde-crystal

## Resumen

Multi-PDE token operator (también referido en el bundle como `multipde_crystal`) es un modelo de 113 millones de parámetros para resolver ecuaciones en derivadas parciales (EDP) sobre mallas, desarrollado por el usuario `oroikono` y distribuido como paquete de transferencia (*hand-off bundle*) dentro del grupo de trabajo camlab-data. No es un modelo de lenguaje: es un operador neuronal que trata los campos físicos como secuencias de tokens discretos y los genera con un proceso iterativo de desenmascarado tipo MaskGIT (`reveal`). El repositorio ocupa 4,5 GB e incluye pesos, tokenizador, código de entrenamiento, código de muestreo, configuraciones y resultados de evaluación.

El problema que resuelve es la resolución multi-EDP con un único modelo: un mismo operador condicionado por tokens especiales de EDP y de variables puede generar soluciones para distintos corpus (por ejemplo `CE_riemann`, `CE_rkh` y Darcy) y distintos *leads* temporales, incluyendo problemas estacionarios. La innovación principal es la combinación de un tokenizador de campos (`Phaedra`, autoencoder FSQ 4x4) con un transformer de tokens enmascarados que decodifica de forma iterativa, lo que permite controlar el número de evaluaciones de función (*nfe*) y el calendario de ruido (`t_start`, `t_end`) en inferencia.

Es relevante ahora porque los operadores neuronales suelen requerir un modelo por familia de EDP y su evaluación se hace en espacio continuo; aquí el enfoque tokenizado permite reutilizar infraestructura de modelos generativos discretos y medir transferencia entre corpus. El checkpoint recomendado (`mp_113m_adamw/checkpoint.pt`) corresponde al paso 200k de un entrenamiento con AdamW, y el bundle incluye además un control negativo con el optimizador MuonMD sobre la misma configuración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de tokens enmascarados (proceso tipo MaskGIT) más decodificador token-a-campo basado en autoencoder FSQ 4x4 (paquete `Phaedra`); no es un modelo de lenguaje |
| Parámetros totales | ~113 M (según la nomenclatura `mp_113m` de los checkpoints); no se detalla un desglose por componente |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el condicionamiento se realiza mediante tensores de tokens de contexto (`ctx_amp`, `ctx_morph`) de tamaño `B × V_in·H·W` y un token de *lead*, sin que se especifiquen los valores máximos de V, H ni W |
| Tipos de cuantización | no disponible; la inferencia documentada se ejecuta en `bfloat16` con autocast y FlashAttention vía SDPA |
| Idiomas soportados | no aplica (modelo de campos físicos, no de texto); los corpus documentados son `CE_riemann`, `CE_rkh` y Darcy |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch `.pt` (`checkpoint.pt`, `checkpoint_best.pt`, `checkpoint_step153696_midschedule.pt`) para el modelo; `pytorch_model.bin` y `ema.pt` para el tokenizador |
| Tamaño del checkpoint recomendado | 1,35 GB (incluye estado del optimizador); `checkpoint_best.pt` contiene solo pesos |
| Tamaño del repositorio | 4,5 GB |
| Pasos de entrenamiento | 200.000 (checkpoint recomendado); 195.000 (`checkpoint_best.pt`); 153.696 (snapshot intermedio) |
| Vocabulario de tokens morfológicos | ids sin desplazamiento en el rango 0–8639; los ficheros `.nc` los almacenan con un desplazamiento de +1024 |
| Entorno de referencia | Python 3.11.6, torch 2.11.0+cu130, `head_dim` 64, bf16, FlashAttention vía SDPA |
| Hardware de referencia | RTX PRO 6000 (empleada en el entorno documentado); los trabajos sbatch usan 1 GPU |

## Arquitectura y entrenamiento

La arquitectura se compone de dos piezas. La primera es un tokenizador de campos (`phaedra_ae_fsq_4x4`) que convierte mallas físicas en tokens discretos y viceversa; el bundle solo incluye sus pesos (`pytorch_model.bin` y `ema.pt`) y la clase decodificadora del paquete `Phaedra`. La segunda es `MultiPDEOperator`, un transformer (`code/dc/` contiene los bloques, el proceso de tokens enmascarados, el optimizador y el envoltorio del decodificador) que recibe tokens de contexto de amplitud y morfología junto con un identificador de *lead* temporal y los tokens especiales de EDP y de variables que provienen de `CorpusMeta`. La generación es iterativa: `reveal(model, ctx_a, ctx_m, meta, lead, nfe=8, t_start=1.0, t_end=0.0)` desenmascara tokens en `nfe` pasos siguiendo un calendario de 1.0 a 0.0, de forma análoga al muestreo de MaskGIT.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO (tampoco serían aplicables en el sentido habitual, al no ser un modelo de lenguaje). Sí se documentan los corpus empleados y las rutas de datos: los tokens residen en `/cluster/work/math/camlab-data/token_data/Phaedra_tokens/` y los campos crudos en `/cluster/work/math/camlab-data/synthetic/`. El entrenamiento se organiza en tramos de 4 horas (`train4h.sbatch`) que se encadenan con `--dependency=afterany:<prev>`, con reanudación automática desde `checkpoint.pt` en `run.output_dir` y configuración en `configs/mp_113m_adamw.yaml`. El bundle incluye un experimento de control con el optimizador MuonMD (misma configuración, paso 200k); según las notas del autor, MuonMD con `lr` 0.02 necesita aproximadamente el doble de pasos que AdamW, por lo que se recomienda mantener AdamW salvo que se barra el `lr`.

## Capacidades

- Generación de campos de solución de EDP sobre mallas: produce tokens de amplitud y morfología con forma `(1, V·H·W)` en orden variable-mayor, un bloque por variable de salida.
- Resolución multi-EDP con un solo conjunto de pesos: el corpus se selecciona mediante los tokens especiales de EDP y variables definidos en `CorpusMeta`, lo que permite cubrir varias familias de problemas con el mismo modelo.
- Condicionamiento por contexto físico: acepta tokens de entrada (`ctx_amp`, `ctx_morph`) en el mismo diseño variable-mayor, de modo que se puede condicionar la generación con estados previos del campo.
- Generación condicionada por tiempo: el token de *lead* permite pedir distintos horizontes temporales; los problemas estacionarios se manejan con el par `(0, 0)`.
- Muestreo iterativo configurable: `nfe` y el calendario `t_start`/`t_end` son parámetros de inferencia, lo que permite intercambiar coste computacional por calidad de muestra.
- Transferencia entre corpus: el bundle documenta explícitamente la evaluación sobre un corpus no visto (`CE_rkh`) y sobre el corpus pequeño Darcy.
- Ajuste fino sobre datos propios: se proporciona el entrenador completo, las configuraciones y los scripts SLURM para continuar el entrenamiento desde un checkpoint.
- Decodificación a campos: el paquete `Phaedra` convierte los tokens generados en campos físicos mediante `dc.decoder.load_decoder` y `decode_tokens`, con un ejemplo funcional en `scripts/render_samples.py`.
- No dispone de *tool calling*, soporte de agentes, capacidades multilingües ni modalidades de texto, audio o imagen en el sentido de un modelo de propósito general.

## Casos de uso

- Simulación de flujos compresibles tipo Riemann: usar el corpus `CE_riemann` con un par `(t_in, t_out)` concreto para generar el campo de salida en un *lead* dado, sustituyendo una integración numérica costosa por una pasada de inferencia con `nfe=8`.
- Estudio de transferencia a EDP no vistas: entrenar o evaluar sobre `CE_rkh` como corpus retenido, comparando el rendimiento de `eval_full/adamw_last.json` (paso 61k) o del snapshot intermedio frente al checkpoint final, tal y como advierte el autor.
- Aprendizaje de dinámica en medios porosos: emplear el corpus Darcy para problemas de permeabilidad, asumiendo su tamaño reducido (416 muestras) y usando el snapshot intermedio para evitar el sobreajuste de los últimos 50k pasos.
- Ajuste fino con datos propios de una EDP: partir de `mp_113m_adamw/checkpoint.pt`, fijar `run.output_dir` y encadenar trabajos `train4h.sbatch` con dependencias para adaptar el operador a una nueva familia de ecuaciones sin entrenar desde cero.
- Generación de datos sintéticos para aumentación: muestrear múltiples realizaciones por miembro y *lead* con `reveal` y decodificarlas a campos para ampliar un conjunto de entrenamiento de un solver tradicional o de otro operador.
- Comparación de optimizadores en entrenamiento de operadores neuronales: reproducir el par AdamW frente a MuonMD incluido en el bundle (`mp_113m_adamw/` y `mp_113m/`) como control experimental, teniendo en cuenta la diferencia de pasos necesaria.
- Construcción de *pipelines* de evaluación reproducible en clúster: usar `run_eval.sbatch` (con `CKPT` y `CFG` como variables) para generar informes JSON de validación completa y `run_render.sbatch` para paneles comparativos de entrada, verdad, tokenizador y predicción.
- Docencia y reproducibilidad en computación científica: al incluir código, configuraciones, pesos del tokenizador y scripts SLURM, sirve como base para prácticas sobre tokenización de campos y modelos generativos discretos en EDP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El bundle incluye ficheros de evaluación (`eval_full/*.json`) con la partición completa de validación (120 miembros × 3 *leads* por corpus), pero no se reproducen sus cifras numéricas. Los únicos datos de rendimiento documentados son operativos:

| Medida | Valor |
|---|---|
| Evaluación completa de validación en 1 GPU | ~5 minutos (`run_eval.sbatch`) |
| Renderizado de una figura (un miembro y un *lead*) | ~1 minuto (`run_render.sbatch`) |
| Comparación interna AdamW vs MuonMD | MuonMD con `lr` 0.02 requiere ~2× los pasos de AdamW |
| Punto óptimo declarado para el corpus retenido `CE_rkh` | en torno al paso 50k–60k; se degrada durante el *anneal* |
| Tamaño del corpus Darcy | 416 muestras; se sobreajusta en los últimos 50k pasos |

Advertencia del autor: no deben citarse cifras de transferencia ni de Darcy a partir del checkpoint final, sino de `eval_full/adamw_last.json` (paso 61k) o del snapshot intermedio, porque `checkpoint_best.pt` se selecciona por precisión en los corpus de entrenamiento.

## Requisitos de hardware

- GPU: se documenta el uso de 1 GPU por trabajo (sbatch de evaluación y renderizado); el entorno de referencia emplea una RTX PRO 6000 (Blackwell).
- VRAM estimada para los pesos del modelo: aproximadamente 0,23 GB en bf16 para 113 M de parámetros (estimación aritmética a partir del recuento de parámetros; no se publica una cifra oficial). Hay que sumar el tokenizador, los estados de activación y los tensores de tokens de contexto, por lo que el consumo real dependerá de la resolución de la malla (V, H, W).
- GPU de consumo: no se documenta explícitamente, pero por tamaño de modelo (113 M) es previsible que quepa en GPU de consumo con suficiente memoria para activaciones y para el decodificador; no hay cifras verificadas en la información disponible.
- Requisito de kernels: el modelo necesita FlashAttention vía SDPA en bf16 con `head_dim` 64; `train.py` aborta si se intenta ejecutar accidentalmente con el kernel matemático.
- Entorno de software: Python 3.11.6 y torch 2.11.0+cu130 según el `requirements.txt` y `env.sh` del bundle; el entorno por defecto activa un *venv* ajeno al repositorio y puede sustituirse definiendo `MPDE_VENV`.
- Opciones de despliegue: inferencia directa en PyTorch (ejemplo mínimo incluido), trabajos SLURM (`run_eval.sbatch`, `run_render.sbatch`, `train4h.sbatch`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Datos necesarios en tiempo de ejecución: los ficheros de tokens en `/cluster/work/math/camlab-data/token_data/Phaedra_tokens/` y, para los paneles de verdad, los campos crudos en `/cluster/work/math/camlab-data/synthetic/`; el acceso requiere pertenencia al grupo camlab-data.
- Latencia y *throughput*: solo se documentan los tiempos agregados de los scripts (~5 min para la evaluación completa de la partición de validación y ~1 min por figura).

## Comparativa con modelos similares

No se dispone de una comparativa cuantitativa con otros operadores neuronales en la información proporcionada, y no sería riguroso asignar cifras. La única comparación con datos verificables es interna al bundle:

| Sistema | Configuración | Pasos | Observaciones |
|---|---|---|---|
| `mp_113m_adamw` (recomendado) | AdamW, `configs/mp_113m_adamw.yaml` | 200k | Checkpoint principal; `checkpoint_best.pt` en el paso 195k es indistinguible del final |
| `mp_113m` (MuonMD) | Misma configuración, optimizador MuonMD | 200k | Control negativo; con `lr` 0.02 necesita ~2× pasos de AdamW |
| Snapshot intermedio | Mismo modelo | 153.696 | Recomendado por el autor para Darcy y para cifras de transferencia |
| Operadores neuronales supervisados clásicos (FNO, DeepONet) y modelos generativos de EDP | no disponible | no disponible | Categorías comparables en la literatura, pero sin datos verificables en la información disponible |

## Limitaciones y advertencias

- La licencia no está especificada en el repositorio, lo que impide determinar si se permite el uso comercial; debe aclararse con el autor antes de cualquier uso en producción.
- No hay resultados de benchmarks publicados ni cifras de precisión reproducidas en la información disponible; los JSON de evaluación existen pero sus valores no se detallan.
- `checkpoint_best.pt` se selecciona por precisión en los corpus de entrenamiento: el corpus retenido `CE_rkh` es mejor en torno al paso 50k–60k y se degrada durante el *anneal*, y el corpus Darcy (416 muestras) se sobreajusta en los últimos 50k pasos. Las cifras de transferencia deben citarse desde `eval_full/adamw_last.json` (paso 61k) o desde el snapshot intermedio.
- La evaluación durante el entrenamiento (`eval_*.json` dentro de los directorios de ejecución) usa 2 lotes antes del paso 62k y 8 después, por lo que no es comparable con `eval_full/`, que es la referencia honesta.
- MuonMD con `lr` 0.02 requiere aproximadamente el doble de pasos que AdamW; los resultados con ese optimizador no deben interpretarse como una comparación justa sin barrer el `lr`.
- El modelo depende de rutas absolutas del clúster Euler y de la pertenencia al grupo camlab-data; los scripts sbatch incluidos siguen apuntando al `setup_env.sh` personal del autor y hay que sustituir esa línea por `source $SHARE/code/env.sh`.
- Requiere FlashAttention vía SDPA en bf16 con `head_dim` 64; ejecutar con el kernel matemático provoca un fallo deliberado en `train.py`.
- Detalle de implementación propenso a errores: los ids morfológicos son libres de desplazamiento (0–8639), pero los ficheros `.nc` los almacenan con +1024; mezclar ambas convenciones produce resultados incorrectos.
- El repositorio no tiene descargas ni *likes* registrados en el momento de la consulta, por lo que no existe validación independiente por parte de la comunidad.
- No es un modelo de lenguaje: no admite *tool calling*, agentes, razonamiento multi-paso en lenguaje natural, ni capacidades multilingües; cualquier caso de uso debe formularse como generación de campos de EDP sobre mallas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oroikono/multipde-crystal
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos (foros de Adobe Acrobat, hilos de Zhihu sobre páginas de inicio, guías de eliminación de adware y consultas sobre contabilidad de asociaciones vecinales) no guardan ninguna relación con el modelo ni con operadores neuronales para EDP, por lo que se descartan.
- Referencias internas del bundle citadas en la model card: `NOTES.md` (registro de hallazgos de entrenamiento), `code/multipde_crystal/` (modelo, datos, entrenador, muestreador), `code/dc/` (bloques transformer y decodificador), `code/Phaedra/` (tokenizador), `phaedra_ae_fsq_4x4/` (pesos del tokenizador), `code/env.sh` y `code/requirements.txt` (entorno), `code/run_eval.sbatch`, `code/run_render.sbatch` y `code/multipde_crystal/scripts/slurm/train4h.sbatch` (trabajos SLURM), `configs/mp_113m_adamw.yaml` (configuración del modelo recomendado), `eval_full/*.json` (evaluaciones de la partición completa) y `samples_adamw_final_m0_lead6.png` (figura de ejemplo).
