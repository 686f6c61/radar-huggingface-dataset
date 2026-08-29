# pipenetwork/GLM-5.3-REAP25-MLX-4bit

## Resumen

GLM-5.3-REAP25-MLX-4bit es una conversión al runtime MLX (Apple Silicon) del modelo GLM-5.3 de Z.ai, un modelo de lenguaje masivo de 744B parámetros con arquitectura MoE (mixture-of-experts) denominada `glm_moe_dsa`. Esta build concreta, publicada por el usuario pipenetwork, aplica dos transformaciones sobre el checkpoint original en bfloat16: cuantización a 4-bit (grupo 64) y poda de expertos mediante el criterio REAP, que elimina el 25% de los expertos enrutados (192 de 256 por capa) para reducir el tamaño y acelerar la inferencia.

El resultado es un checkpoint de 316,6 GB en disco, pensado para equipos Apple Silicon con 384 GB de RAM o superiores. La poda REAP conserva de media el 87,0% de la masa de saliencia de cada capa, y la calidad se mide mediante perplexity en wikitext-2: 3,2872, frente a 2,8636 de la versión 4-bit sin podar. Es una opción para quienes necesitan ejecutar GLM-5.3 en hardware de gama alta pero no pueden cargar el modelo completo.

La relevancia de esta build radica en que permite ejecutar un modelo de 744B en un Mac con memoria unificada de 384 GB, algo inviable con el checkpoint original en bf16 (que requeriría más de 1,5 TB). Además, el runtime incluido corrige un problema del indexador de atención dispersa que afecta a las cargas estrictas del modelo, garantizando paridad con la implementación de referencia en transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (MoE con 256 expertos, top-8; MLA con atención dispersa estilo DeepSeek-V3.2) |
| Parametros totales | 88.078.201.152 (segun safetensors; el modelo base sin poda declara 744B) |
| Parametros activos | no disponible (MoE, no se especifica el numero de activos) |
| Longitud de contexto | no disponible (verificado hasta 2048 tokens; el indexador se omite por debajo de `index_topk`) |
| Tipos de cuantizacion | 4-bit (grupo 64) para la mayoria de pesos; indexador, router y normas en bf16/fp32 |
| Idiomas soportados | no disponible |
| Licencia | glm-5.3 (otra, ver archivo LICENSE) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 utiliza una arquitectura MoE con 256 expertos enrutados por capa (top-8), atención de latencia multi-cabeza (MLA) y atención dispersa (sparse attention) similar a la de DeepSeek-V3.2. La capa de multi-token-prediction (capa 78) no se incluye en esta build. El checkpoint original se publica en bfloat16 y FP8; esta conversión parte de la versión BF16.

La poda REAP selecciona los 192 expertos mas salientes por capa (de 256) usando como criterio la media de `router_weight × ‖expert_output‖` sobre 65.536 tokens de calibracion (wikitext-2 train, diez idiomas de Wikipedia y codigo). La cuantizacion a 4-bit se aplica sobre los pesos ya podados, con grupos de 64. El runtime MLX incluido implementa el programa de indexadores compartidos (21 de 78 capas tienen indexadores propios; las otras 57 reutilizan la seleccion top-k de la capa anterior), corrigiendo el fallo de carga estricta que deja 285 parametros sin inicializar en la implementacion estandar de mlx-lm.

No se dispone de informacion sobre el entrenamiento original (datos, tokens, metodos de alineacion como RLHF o DPO) en la documentacion de esta build.

## Capacidades

- Generacion de texto conversacional y de larga forma.
- Razonamiento complejo y resolucion de problemas, especialmente en tareas de codigo (segun la descripcion de GLM-5.3 en el repositorio oficial, que lo situa como el modelo open-weights mas capaz para coding, con una mejora del 50% sobre GLM-5.2).
- Soporte de atencion dispersa para contextos largos (aunque en esta build el indexador compartido puede degradar la calidad por encima de 2048 tokens).
- Capacidades multilingues: no se especifican idiomas concretos en la informacion disponible.
- No se menciona soporte explicito de tool calling, function calling, agentes o modo vision/audio en esta build.

## Casos de uso

- Generacion de codigo en entornos de desarrollo: el modelo base GLM-5.3 destaca en tareas de programacion compleja, por lo que esta build puede usarse en asistentes de codigo locales en Mac con 384 GB de RAM, aunque con una penalizacion de calidad respecto a la version sin podar.
- Razonamiento y analisis de documentos extensos: con una ventana de contexto verificada de al menos 2048 tokens, puede procesar informes, articulos o contratos largos, siempre que no se supere ese limite para evitar la degradacion del indexador.
- Investigacion en compresion de modelos: esta build es un caso de estudio de poda de expertos (REAP) combinada con cuantizacion, util para evaluar el impacto de la poda en la calidad y el rendimiento.
- Despliegue en Apple Silicon de gama alta: permite ejecutar un modelo de 744B en un Mac Studio con 384 GB de RAM unificada, algo inviable con el checkpoint original en bf16.
- Experimentacion con MLX y MoE: el runtime incluido (glm_moe_dsa.py) es una implementacion de referencia que puede servir para estudiar el comportamiento de la atencion dispersa y los indexadores compartidos.
- Evaluacion de perplexity y divergencia por capa: los scripts incluidos permiten medir la degradacion relativa de cada capa frente al modelo bf16, util para investigacion en cuantizacion y poda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye dos metricas propias: perplexity en wikitext-2 (test) y divergencia por capa frente al modelo bf16.

**Perplexity en wikitext-2 (test)** (288.627 tokens en 141 ventanas de 2048):

| Build | Tamano | Perplexity [95% CI] |
|---|---|---:|
| 4bit (sin podar) | 418,6 GB | 2,8636 [2,6681, 3,0714] |
| mixed-4_8bit | 427,8 GB | 2,7420 [2,5533, 2,9477] |
| mixed-3_6bit | 332,6 GB | 3,0338 [2,8366, 3,2386] |
| **REAP25-4bit (esta build)** | **316,6 GB** | **3,2872 [3,0703, 3,5184]** |
| REAP37-4bit | 267,2 GB | 3,8517 [3,6212, 4,0937] |
| REAP50-4bit | 214,7 GB | 5,0295 [4,7571, 5,3137] |

**Divergencia por capa frente a bf16** (error L2 relativo de la salida de cada capa, teacher-forced y free-running):

| Receta | Teacher-forced (media) | Free-running (capa final) | Coseno (final) |
|---|---:|---:|---:|
| 8bit | 0,00685 | 0,13119 | 0,98945 |
| 6bit | 0,01465 | 0,16736 | 0,98389 |
| 5bit | 0,02651 | 0,22521 | 0,97272 |
| 4bit | 0,05161 | 0,35740 | 0,93390 |
| mixed-4_8bit | 0,02524 | 0,24951 | 0,96710 |
| mixed-3_6bit | 0,05242 | 0,42380 | 0,90624 |
| fp8 | 0,01741 | 0,17321 | 0,98320 |

## Requisitos de hardware

- VRAM estimada: 316,6 GB en disco; requiere al menos 384 GB de RAM unificada en Apple Silicon (la model card recomienda 384 GB-class).
- GPU recomendadas: Apple Silicon (M-series) con memoria unificada de 384 GB o superior (por ejemplo, Mac Studio con M3 Ultra o similar).
- No cabe en GPUs de consumo (RTX 4090, etc.) por el tamaño del checkpoint.
- Opciones de despliegue: mlx-lm con `--trust-remote-code` (el runtime `glm_moe_dsa.py` se incluye en el repo). Tambien se puede usar el codigo de GitHub (PipeNetwork/glm53-mlx) para integraciones personalizadas.
- Latencia y throughput: no se proporcionan datos en la informacion disponible.

## Comparativa con modelos similares

Comparacion con otras builds de GLM-5.3 en MLX (misma coleccion de pipenetwork):

| Build | Tamano | Perplexity (wikitext-2) | Notas |
|---|---|---|---:|
| GLM-5.3-MLX-4bit | 418,6 GB | 2,8636 | Cuantizacion 4-bit uniforme, sin poda |
| GLM-5.3-MLX-mixed-4_8bit | 427,8 GB | 2,7420 | Expertos en 4-bit, resto en 8-bit; recomendada para 512 GB |
| GLM-5.3-MLX-mixed-3_6bit | 332,6 GB | 3,0338 | Expertos en 3-bit, resto en 6-bit; opcion para 384 GB |
| **GLM-5.3-REAP25-MLX-4bit** | **316,6 GB** | **3,2872** | Poda REAP del 25% de expertos + 4-bit |
| GLM-5.3-REAP37-MLX-4bit | 267,2 GB | 3,8517 | Poda REAP del 37% + 4-bit |
| GLM-5.3-REAP50-MLX-4bit | 214,7 GB | 5,0295 | Poda REAP del 50% + 4-bit |

No se dispone de datos de otros modelos comparables (por ejemplo, Llama 3.1 405B o DeepSeek-V3) en la informacion proporcionada.

## Limitaciones y advertencias

- La poda REAP degrada la calidad: la perplexity de esta build (3,2872) es un 14,8% peor que la de la version 4-bit sin podar (2,8636). La perdida se concentra en las capas profundas, donde el dano de los expertos podados se acumula.
- El indexador de atencion dispersa tiene un comportamiento incorrecto para prompts de mas de 2048 tokens: las 57 capas que reutilizan el indexador de la capa anterior quedan con proyecciones aleatorias, lo que degrada la calidad en contextos largos. La model card advierte explicitamente de este problema.
- No se incluye la capa de multi-token-prediction (capa 78), por lo que la generacion puede ser ligeramente menos eficiente que el modelo completo.
- La licencia es `glm-5.3` (otra), no una licencia open source estandar. Es necesario revisar el archivo LICENSE del repositorio original para conocer las restricciones de uso comercial y redistribucion.
- El checkpoint es especifico de Apple Silicon (MLX); no es compatible con CUDA ni con otros runtimes sin conversion adicional.
- No se proporcionan datos de sesgos, alucinacion o seguridad especificos de esta build. Al ser una conversion de un modelo base, hereda los riesgos del modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pipenetwork/GLM-5.3-REAP25-MLX-4bit
- Coleccion de builds MLX de GLM-5.3: https://huggingface.co/collections/pipenetwork/glm-53-mlx
- Repositorio GitHub del runtime: https://github.com/PipeNetwork/glm53-mlx
- Repositorio oficial de GLM-5 (Z.ai): https://github.com/zai-org/GLM-5
- Modelo base en HuggingFace: https://huggingface.co/zai-org/GLM-5.3
- Version BF16: https://huggingface.co/zai-org/GLM-5.3-BF16
