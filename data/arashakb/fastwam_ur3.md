# arashakb/FastWAM_UR3

## Resumen

FastWAM_UR3 es un checkpoint cuantizado del modelo FastWAM, un World Action Model (WAM) desarrollado por el equipo de investigación de FastWAM, especializado en control robótico basado en visión. Este modelo concreto es una cuantización post-entrenamiento W4A4 mediante SVDQuant del fine-tune de UR3 de 3 tareas (drawer, blue_basket y stacking_cubes), realizada por arashakb. El objetivo es reducir el tamaño del modelo de 11,2 GiB a 3,36 GiB manteniendo una fidelidad casi idéntica a la versión bf16, permitiendo su despliegue en hardware más modesto.

La relevancia de este modelo radica en que demuestra que la cuantización agresiva (4 bits en pesos y activaciones) puede aplicarse a modelos de robótica sin pérdida significativa de precisión en la predicción de acciones, con un NRMSE de 0,0064 frente a las acciones grabadas, idéntico al del modelo bf16. El checkpoint está empaquetado en INT4 real, no en cuantización simulada, y se ejecuta sobre tensor cores INT8, lo que reduce el tráfico de memoria sin sacrificar exactitud aritmética. Está pensado para entornos de producción robótica donde el espacio en memoria y la latencia son críticos.

El modelo se distribuye bajo licencia Apache-2.0, con un tamaño de repositorio de 3,6 GB, e incluye los pesos cuantizados, las estadísticas de normalización del dataset y los embeddings de instrucciones pre-codificados, evitando la necesidad de cargar el codificador de texto umT5-XXL de 11 GB en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World Action Model (WAM) basado en FastWAM, con 2 expertos, 30 bloques por experto, self-attention y cross-attention, FFN, y rama de bajo rango SVDQuant |
| Parametros totales | No disponible (el checkpoint cuantizado contiene 5.914 B parametros cuantizados en INT4 mas tensores en bf16; el total del modelo base no se especifica) |
| Parametros activos | No aplica (no es un modelo MoE clasico; los 2 expertos se usan de forma conjunta) |
| Longitud de contexto | No aplica (modelo de control visual, no procesa texto; procesa secuencias de video latente) |
| Tipos de cuantizacion | W4A4 (pesos y activaciones a 4 bits, per-group-64), SVDQuant con rama de bajo rango FP16 rank-32 |
| Idiomas soportados | No disponible (modelo de robotica, no de lenguaje) |
| Licencia | Apache-2.0 (este checkpoint); el modelo base es MIT |
| Formato de pesos | Checkpoint PyTorch (.pt) con pesos INT4 empaquetados y tensores bf16 |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de FastWAM, un World Action Model que modela la evolucion de observaciones visuales bajo acciones. La arquitectura original de FastWAM se basa en un transformer de difusion de video latente, con dos expertos (probablemente para manejar diferentes modalidades o tareas) y 30 bloques por experto, cada uno con atencion self y cross, y capas FFN. El checkpoint cuantizado aplica SVDQuant (Li et al., ICLR 2025), que combina una migracion SmoothQuant, una rama de bajo rango FP16 de rango 32 y un residuo INT4 por grupo de 64 elementos. Se cuantizan 5.914 mil millones de parametros correspondientes a los 600 lineales de los bloques (self_attn q/k/v/o, cross_attn q/k/v/o, ffn.0, ffn.2) de ambos expertos. Los embeddings de patch, texto y tiempo, las cabezas, el codificador de acciones, las normas, la modulacion y el codificador propioceptivo se mantienen en bf16.

El entrenamiento del modelo base se realizo sobre el dataset `armanakbari4/ur3-3task-lerobot`, que contiene 10 episodios por tarea para 3 tareas de manipulacion con un robot UR3. La calibracion para la cuantizacion uso 9.908 observaciones (cada frame de los episodios, con semilla 42). El checkpoint cuantizado se genero a partir del paso 7000 del fine-tune, y se verifico que la cuantizacion no introduce errores significativos: el NRMSE entre el modelo cuantizado y las acciones grabadas es 0,0064, identico al del modelo bf16.

## Capacidades

- Control robotico visual: genera secuencias de acciones (chunks de 32 pasos, 14 dimensiones) a partir de tres camaras RGB (superior, izquierda y derecha) y el estado propioceptivo de 14 dimensiones del robot.
- Ejecucion de tres tareas de manipulacion: abrir un cajon y colocar una caja, colocar objetos en una cesta azul, y apilar cubos de colores.
- Preprocesamiento integrado: el metodo `predict` aplica automaticamente el redimensionado, normalizacion y z-scoring del estado, evitando errores de preprocesamiento por parte del usuario.
- Inferencia sin codificador de texto: los embeddings de las instrucciones de tarea estan pre-codificados, eliminando la necesidad de cargar el modelo de lenguaje umT5-XXL.
- Cuantizacion W4A4 real: los pesos estan empaquetados a 4 bits y se ejecutan sobre tensor cores INT8, reduciendo el uso de memoria y el trafico de DRAM sin perdida aritmetica.
- Compatibilidad con el VAE de Wan2.2: requiere el codificador de video Wan2.2_VAE.pth para transformar las imagenes de camara en latentes de video.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos industriales: el modelo puede controlar un brazo UR3 para colocar objetos en posiciones especificas (como la tarea blue_basket), reduciendo la necesidad de programacion manual de trayectorias.
- Manipulacion de cajones y contenedores: la tarea drawer implica abrir un cajon, insertar un objeto y cerrarlo, un caso tipico en logistica y almacenamiento automatizado.
- Apilado de objetos: la tarea stacking_cubes requiere coordinar la colocacion de multiples cubos en una pila, util en ensamblaje o clasificacion.
- Investigacion en World Action Models: el checkpoint cuantizado permite a investigadores evaluar el impacto de la cuantizacion W4A4 en modelos de control robotico sin necesidad de GPUs de gran memoria.
- Despliegue en robots con hardware limitado: con una huella total de aproximadamente 6,1 GiB (checkpoint + VAE), puede ejecutarse en GPUs de gama media como una RTX 4060 o L40S, facilitando prototipos rapidos.
- Validacion de politicas robotica en simulacion: el modelo puede integrarse en entornos de simulacion para probar estrategias de control antes de pasar al robot fisico, gracias a su baja latencia y alta fidelidad con el modelo bf16.

## Benchmarks y rendimiento

Los datos de verificacion proporcionados en la model card se basan en episodios held-out (excluyendo los de calibracion). No se han publicado resultados en benchmarks estandar como MMLU o HumanEval, ya que es un modelo de robotica, no de lenguaje.

| Metrica | Valor |
|---|---|
| NRMSE del modelo bf16 vs acciones grabadas | 0,0055 (corr 0,9998) |
| NRMSE del modelo cuantizado vs acciones grabadas | 0,0064 (igual que bf16) |
| NRMSE del modelo cuantizado vs bf16 (chunk de accion) | 0,0010 |
| NRMSE end-to-end desde frames crudos | 0,0061 (corr 0,9997) |
| Diferencia de codigos INT4 entre kernels empaquetados y formula SVDQuant | ≤ 0,10 % (todos por 1 LSB) |
| Fidelidad de reempaquetado de pesos | 0,0000 % de codigos fuera por 1 LSB |

No se ha medido la tasa de exito en robot real para este checkpoint cuantizado; el modelo bf16 si ha sido evaluado en un UR3 fisico.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 3,36 GiB y el VAE de Wan2.2 2,7 GiB, por lo que se necesitan al menos 8 GiB de VRAM para inferencia, aunque se recomienda 12 GiB o mas para margen con activaciones.
- GPU recomendadas: kernels afinados solo para `sm_89` (L40S). En otras arquitecturas, como `sm_120` (RTX 5090), se usa una heuristica de ocupacion que es correcta pero aproximadamente 2 veces mas lenta en formas estrechas. Se puede ejecutar `analysis/iw_gemm_tune.py` para ajustar configuraciones en la GPU objetivo.
- Compatibilidad con GPUs de consumo: si, cabe en RTX 4060 (8 GB), RTX 4070 (12 GB) y superiores, aunque el rendimiento optimo se logra en L40S.
- Opciones de despliegue: el codigo de inferencia esta en el repositorio QuantWAM (`adapters/fastwam/ur3_infer.py`), con kernels Triton para W4A4. No se menciona soporte para vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan cifras exactas; el ejemplo de uso indica que la inicializacion de la politica tarda aproximadamente 25 segundos, y la inferencia de un chunk de 32 acciones se realiza en tiempo real en hardware adecuado.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoria (otros WAMs o VLAs cuantizados) en la informacion proporcionada. El modelo base FastWAM se presenta como una alternativa a los VLA (Vision-Language-Action) con menor latencia en inferencia, pero no hay cifras de comparacion directa con otros checkpoints cuantizados.

## Limitaciones y advertencias

- No ha sido evaluado en robot real: la verificacion se basa en acuerdo open-loop con trayectorias grabadas, que es necesario pero no suficiente para garantizar el exito en el mundo fisico.
- Kernels afinados solo para sm_89: en otras GPUs (incluida RTX 5090) el rendimiento puede ser hasta 2 veces inferior hasta que se ejecute el script de ajuste.
- Requiere el VAE de Wan2.2 (2,7 GiB) para codificar las imagenes de camara; sin el, el modelo no puede funcionar.
- Limitado a tres tareas especificas: no es un modelo generalista; solo puede ejecutar las tareas para las que fue fine-tuneado (blue_basket, drawer, stacking_cubes).
- No es un modelo de lenguaje: no soporta tool calling, agentes conversacionales ni generacion de texto.
- Dependencia de estadisticas del dataset: el archivo `ur3_3task_10k_dataset_stats.json` es imprescindible para la normalizacion correcta del estado y la denormalizacion de acciones; sin el, el checkpoint no puede ejecutarse correctamente.
- Licencia Apache-2.0 para este checkpoint, pero el modelo base es MIT; se debe verificar la compatibilidad de uso comercial segun el proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arashakb/FastWAM_UR3
- Repositorio de codigo y kernels: https://github.com/arashakb/QuantWAM
- Modelo base (fine-tune): https://huggingface.co/armanakbari4/fastwam-ur3-3task-10k
- Modelo base original: https://huggingface.co/armanakbari4/fastwam-ur3-3task
- Paper de FastWAM: https://arxiv.org/html/2603.16666v1
- Codigo oficial de FastWAM: https://github.com/yuantianyuan01/FastWAM
