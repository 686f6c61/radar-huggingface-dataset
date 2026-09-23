# Hyukkyu/Llama-3.1-8B-RAQUEL-MUSE-M-orig-LoRA-v1

## Resumen

El modelo `Hyukkyu/Llama-3.1-8B-RAQUEL-MUSE-M-orig-LoRA-v1` es un checkpoint de investigación publicado por el usuario Hyukkyu dentro de la campaña de reproducción RAQUEL sobre el benchmark MUSE-News. Se trata de un ajuste fino supervisado del modelo base `meta-llama/Llama-3.1-8B` mediante LoRA (rank 64, alpha 128) sobre todos los artículos de entrenamiento de MUSE-News —tanto el split *forget* como los dos splits *retain*— junto con los pares de pregunta-respuesta de memorización de conocimiento (*knowmem*) de ambos conjuntos. El objetivo no es desaprender: es producir el **baseline M_orig**, es decir, el punto de partida que memoriza deliberadamente el corpus completo y contra el cual se comparan después los métodos de *machine unlearning*.

El repositorio contiene dos artefactos: el modelo fusionado en BF16 en la raíz (el artefacto evaluado, listo para uso directo con `transformers` sin cargar adaptadores) y el adaptador LoRA original en FP32 dentro de la carpeta `adapter/`. El modelo tiene 8.030.261.248 parámetros (unos 8,03 mil millones), un tamaño de repositorio de 16,7 GB y hereda la ventana de contexto de 128.000 tokens de Llama 3.1 8B, aunque el entrenamiento se realizó con una longitud máxima de 2.048 tokens. Está publicado únicamente en inglés bajo la licencia Llama 3.1.

Su relevancia es metodológica más que de producto: fija un protocolo de evaluación reproducible (seis splits, criterios predeclarados de parada, hashes de evidencia en `evaluation.json`) para medir cuánto sabe un modelo sobre un corpus y cuánto retiene tras aplicar técnicas de desaprendizaje. Con cero descargas y cero *likes* en el momento de la consulta, es un artefacto pensado para la comunidad investigadora, no para despliegues de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1; heredada de `meta-llama/Llama-3.1-8B`) |
| Parametros totales | 8.030.261.248 (≈8,03 B), dato real de los safetensors |
| Longitud de contexto | 128.000 tokens heredados del modelo base; el entrenamiento de este checkpoint usó una longitud máxima de 2.048 tokens |
| Tipos de cuantizacion | No disponible en el repositorio (raíz en BF16, adaptador en FP32). Al ser una arquitectura Llama 3.1 8B estándar, es convertible a GGUF, AWQ o GPTQ con las herramientas habituales |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `llama3.1` (Llama 3.1 Community License y Acceptable Use Policy) |
| Formato de pesos | `safetensors`: modelo fusionado en BF16 en la raíz y adaptador LoRA en FP32 en `adapter/` |
| Libreria | `transformers` (tags: `text-generation-inference`, `endpoints_compatible`) |
| Revision del modelo base | `d04e592bb4f6aa9cfee91e2e20afa771667e1d4b` |
| Tamano del repositorio | 16,7 GB |
| Fecha de publicacion | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Llama 3.1 8B, un transformer decoder-only denso (no es un MoE) que este repositorio no modifica estructuralmente: el ajuste se aplica como LoRA y se fusiona después en los pesos BF16. El adaptador LoRA emplea rank 64, alpha 128 y dropout 0,05, y se aplica a las proyecciones q/k/v/o y gate/up/down. El entrenamiento usó precisión BF16 en el modelo base y FP32 en el adaptador, con *batch* global 32, semilla 0 y *learning rate* de 1e-4 con decaimiento coseno, 3 % de *warmup* y *weight decay* de 0,01.

Los datos de entrenamiento combinan 7.109 bloques de artículos de entrenamiento de `muse-bench/MUSE-News` y los pares QA de tipo `knowmem` (100 de *forget* y 100 de *retain*, con dos vistas cada uno repetidas 7 veces por época), lo que da 9.909 ítems por época. Adicionalmente se utiliza el dataset `Hyukkyu/RAQUEL2-ICLR` (revisión `aee9a541f1ba58032e2eb62a1e56149475cd1126`). El formato de las QA es `Question: {question}\nAnswer:` con pérdida calculada únicamente sobre la respuesta; los artículos se tratan como texto causal-LM plano. El modelo se detuvo en la época 1 de un calendario coseno declarado de 15 épocas (310 pasos de optimizador), al ser la primera que cumplió los umbrales predeclarados de precisión en *forget* y *retain*. No se emplearon RLHF ni DPO: es entrenamiento supervisado puro. La receta exacta y los hashes de pesos están en `training_recipe.json`, y el entorno de ejecución en `package_versions.json`.

Una nota de publicación importante: M_orig se libera en la época 1 y su pareja M_ret en la época 2, una combinación elegida tras comparar todos los splits. Por tanto, M_ret vio los datos de *retain* una época más que M_orig, asimetría que conviene tener en cuenta al interpretar comparaciones entre ambos checkpoints.

## Capacidades

- Generación de texto en inglés con formato de pregunta-respuesta: el prompt de referencia es `Question: {question}\nAnswer:` con decodificación greedy y hasta 96 tokens nuevos.
- Respuesta a preguntas de memorización de conocimiento (`knowmem`) sobre el corpus MUSE-News, que es precisamente la capacidad que el checkpoint maximiza.
- Modelado causal de lenguaje sobre texto plano de artículos periodísticos, sin plantilla de conversación.
- Capacidad de servir como *baseline* M_orig para experimentos de *machine unlearning*: memoriza datos de *forget* y de *retain* de forma deliberada.
- Carga del adaptador LoRA original mediante `PeftModel.from_pretrained(base_model, repo_id, subfolder="adapter")` para experimentos de adaptación adicionales.
- Compatibilidad con `text-generation-inference` y con infraestructura de *endpoints* según los tags del repositorio.
- No dispone de soporte documentado de *tool calling*, *function calling*, razonamiento multi-paso, modo *thinking*, visión ni audio.
- No dispone de plantilla de chat ni de capacidades de agente; el autor indica explícitamente que no fue entrenado con una plantilla conversacional.
- Multilingüismo limitado al inglés declarado, aunque el modelo base Llama 3.1 soporta más idiomas de forma no garantizada en este ajuste.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint actúa como punto de partida M_orig sobre el que aplicar métodos de desaprendizaje con actualización de todos los parámetros, y contra el que medir la degradación de conocimiento en los splits *forget* y *retain*.
- Reproducción de resultados del benchmark MUSE-News: al incluir `evaluation.json` con métricas agregadas y hashes de evidencia, permite reejecutar la evaluación completa (100 preguntas de *forget*, 100 de *retain*, sus paráfrasis y las 2.120 preguntas de RAQUEL) de forma auditable.
- Auditoría de memorización de corpus: al estar entrenado sobre 7.109 bloques de artículos, sirve para cuantificar cuánta información factual de un corpus periodístico es capaz de retener un modelo de 8 B y a qué coste en precisión sobre preguntas parafraseadas.
- Evaluación de jueces automáticos: el protocolo de juicio con `Qwen/Qwen3.8-27B` a temperatura 0 y sin *thinking* es replicable, de modo que el modelo se puede usar como sujeto de prueba para estudiar la fiabilidad de evaluaciones LLM-as-judge.
- Base para ajustes de dominio posteriores: el adaptador LoRA en FP32 y los pesos fusionados permiten entrenar nuevos adaptadores sobre un modelo que ya ha sido expuesto al registro lingüístico de noticias en inglés.
- Estudios de privacidad diferencial y extracción de datos: el checkpoint de memorización es el escenario controlado necesario para medir tasas de extracción antes de aplicar defensas.
- Comparación de familias de benchmarks de desaprendizaje: junto con los checkpoints hermanos de la campaña TOFU, permite analizar si un mismo esquema de entrenamiento se comporta igual en dos benchmarks distintos.
- Validación de pipelines de inferencia: por su tamaño de 8 B y su formato `transformers` estándar, sirve como carga de trabajo de referencia para medir latencia y *throughput* en vLLM o TGI antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados publicados por el autor para la configuración liberada (M_orig en época 1), juzgados por `Qwen/Qwen3.8-27B` (revisión `1d4bf0f2ff`) a temperatura 0, con *thinking* desactivado, decodificación greedy y un máximo de 96 tokens nuevos:

| Split | Correctas / total | Precision |
|---|---:|---:|
| Native forget | 100/100 | 100,00 % |
| Native retain | 96/100 | 96,00 % |
| Paraphrased forget | 80/100 | 80,00 % |
| Paraphrased retain | 67/100 | 67,00 % |
| RAQUEL affected | 245/1.257 | 19,49 % |
| RAQUEL unaffected | 182/863 | 21,09 % |

El autor publica además los resultados del mismo modelo en la época 2, como referencia de la decisión de parada:

| Split | Epoca 2 |
|---|---:|
| Native forget | 100,0 % |
| Native retain | 99,0 % |
| Paraphrased forget | 85,0 % |
| Paraphrased retain | 72,0 % |
| RAQUEL affected | 17,8 % |
| RAQUEL unaffected | 11,6 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. No hay datos comparativos de TFLOPs, latencia o *throughput*.

## Requisitos de hardware

- VRAM estimada en BF16 (formato publicado): en torno a 16-17 GB solo para pesos, más caché KV y activaciones; en la práctica requiere 24 GB o más para funcionar con comodidad.
- VRAM estimada en FP16: aproximadamente la misma cifra que BF16 (≈16 GB de pesos).
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB; en 4 bits, alrededor de 5-6 GB.
- GPU profesionales recomendadas: A100 40 GB u 80 GB, H100, L40S. Con dos GPU de 24 GB es posible repartir el modelo mediante `device_map="auto"`.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 de 24 GB en BF16, aunque con margen ajustado si se usan secuencias largas; en cuantización de 4 bits cabe en GPU de 8-12 GB como RTX 3060 12 GB o RTX 4070.
- La ventana heredada de 128.000 tokens hace que la caché KV crezca de forma muy significativa; para contextos largos se recomienda cuantizar la caché o reducir la longitud efectiva, especialmente porque el entrenamiento solo cubrió 2.048 tokens.
- Opciones de despliegue: `transformers` (ruta oficial documentada por el autor), `text-generation-inference` (TGI) según los tags del repositorio, vLLM para servicio de alto rendimiento, y llama.cpp u Ollama previa conversión a GGUF. El proveedor FriendliAI aparece en los resultados de búsqueda como opción de servicio gestionado para el checkpoint hermano de la campaña TOFU.
- No se dispone de datos publicados de latencia ni de *throughput* para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Datos de rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| `Hyukkyu/Llama-3.1-8B-RAQUEL-MUSE-M-orig-LoRA-v1` (este modelo) | 8,03 B | 128.000 tokens heredados; entrenado a 2.048 | `llama3.1` | Tabla de 6 splits MUSE-News y RAQUEL | HuggingFace, 0 descargas |
| `meta-llama/Llama-3.1-8B` (modelo base) | 8,03 B | 128.000 tokens | `llama3.1` | Benchmarks generales publicados por Meta; no comparables con MUSE-News | HuggingFace |
| `Hyukkyu/Llama-3.1-8B-RAQUEL-TOFU-M-orig-LoRA-v1` (hermano, campaña TOFU) | No disponible | No disponible | `llama3.1` | No disponible en la información recogida | HuggingFace, con despliegue en FriendliAI |
| `Hyukkyu/Llama-3.1-8B-RAQUEL-TOFU-M-ret-LoRA-v1` (hermano, campaña TOFU) | No disponible | No disponible | `llama3.1` | No disponible en la información recogida | HuggingFace |

No se dispone de cifras de benchmarks directamente comparables entre estos checkpoints, ya que los splits y el protocolo de juicio son específicos de cada campaña (MUSE-News frente a TOFU). Cualquier comparación numérica entre ellos en la información disponible sería engañosa.

## Limitaciones y advertencias

- No es un modelo desaprendido: es el *baseline* M_orig, entrenado deliberadamente sobre el split *forget* y los dos splits *retain*. Reproducirá contenido del conjunto de olvido por diseño.
- No dispone de plantilla de chat. Usarlo con formatos conversacionales degrada los resultados; el autor indica que debe emplearse el prefijo plano `Question: {question}\nAnswer:`.
- El propio autor advierte de que cargar y fusionar el adaptador por separado puede introducir pequeñas diferencias de redondeo respecto a los pesos fusionados de la raíz, que son el artefacto evaluado.
- Cobertura lingüística limitada al inglés declarado; no hay evidencia de rendimiento en otros idiomas.
- Las métricas dependen de un juez LLM externo (`Qwen/Qwen3.8-27B`, revisión fijada `1d4bf0f2ff`, temperatura 0, sin *thinking*). Los resultados están sujetos a los sesgos y limitaciones de ese juez.
- Las preguntas parafraseadas no existen en MUSE-News: fueron generadas para este proyecto por `Qwen/Qwen3.8-27B` y pasaron comprobaciones automáticas de preservación de hechos y significado más una revisión manual. Es un artefacto sintético dentro del protocolo.
- Las preguntas RAQUEL se excluyeron del ajuste de configuración, y las precisiones obtenidas en ese benchmark (19,49 % en afectadas y 21,09 % en no afectadas) son notablemente bajas, lo que limita su utilidad como señal de calidad general.
- Asimetría de publicación: M_orig corresponde a la época 1 y M_ret a la época 2, de modo que M_ret vio los datos de *retain* una época más. Las comparaciones entre ambos checkpoints deben interpretarse con esta cautela.
- Licencia `llama3.1`: uso comercial sujeto a la Llama 3.1 Community License y a la Acceptable Use Policy, con los requisitos habituales de atribución y la cláusula de licencia adicional para entidades con más de 700 millones de usuarios mensuales.
- Riesgo de alucinación no cuantificado en la información disponible; el protocolo de evaluación usa respuestas greedy cortas, que reducen pero no eliminan este riesgo.
- Repositorio con 0 descargas y 0 *likes*: no hay evidencia comunitaria de uso, validación independiente ni soporte.
- Los archivos `evaluation.json`, `training_recipe.json` y `package_versions.json` forman parte del contrato de reproducibilidad; sin ellos no es posible verificar los hashes ni la receta exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hyukkyu/Llama-3.1-8B-RAQUEL-MUSE-M-orig-LoRA-v1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Dataset MUSE-News: https://huggingface.co/datasets/muse-bench/MUSE-News
- Dataset RAQUEL2-ICLR: https://huggingface.co/datasets/Hyukkyu/RAQUEL2-ICLR
- Checkpoint hermano (campaña TOFU, M_ret): https://huggingface.co/Hyukkyu/Llama-3.1-8B-RAQUEL-TOFU-M-ret-LoRA-v1
- Checkpoint hermano (campaña TOFU, M_orig) en FriendliAI: https://friendli.ai/models/Hyukkyu/Llama-3.1-8B-RAQUEL-TOFU-M-orig-LoRA-v1
- Página de Meta sobre la familia Llama 3: https://developer.meta.com/ai/models/llama-3/
- Comparativa de requisitos de hardware de checkpoints Llama: https://www.canirun.ai/company/meta
