# jaydeepb/pythia-1.4b-owm-run2

## Resumen

`pythia-1.4b-owm-run2` es un ajuste fino del modelo base `EleutherAI/pythia-1.4b` publicado por el usuario `jaydeepb` en HuggingFace. Se trata de un artefacto de investigación, no de un modelo de propósito general: consiste en una única época de entrenamiento sobre una muestra de 1 millón de secuencias de 128 tokens extraídas de OpenWebMath, un corpus de páginas web con contenido matemático. El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors, con 1.414.647.808 parámetros totales (2,8 GB de repositorio).

Su relevancia no reside en sus capacidades generativas, sino en su papel dentro de un experimento metodológico sobre memorización. El autor lo denomina "run2" y lo describe explícitamente como el conjunto de datos *held-out* fresco que se utiliza para validar un clasificador de predicción de memorización ("predict-before-training validation"). El modelo "run1", ajustado sobre una muestra disjunta, proporciona las etiquetas con las que se entrena dicho clasificador; este "run2" sirve para comprobar si el clasificador acierta qué secuencias memorizará el modelo antes de que entrene sobre ellas.

Arquitectónicamente es un transformer denso de tipo decoder-only con la implementación GPT-NeoX, heredada íntegramente del modelo base de EleutherAI, sin modificaciones estructurales. No hay publicación de benchmarks, demos ni documentación adicional más allá de la model card mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-NeoX), denso |
| Parametros totales | 1.414.647.808 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens en el modelo base; el ajuste fino se realizó con secuencias de 128 tokens |
| Tipos de cuantizacion | no especificados por el autor; al ser un modelo transformers estándar admite cuantización a 8 y 4 bits mediante herramientas externas (bitsandbytes, GPTQ, GGUF) |
| Idiomas soportados | no disponibles (el corpus de ajuste, OpenWebMath, es predominantemente inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 2,8 GB) |

## Arquitectura y entrenamiento

El modelo reutiliza sin cambios la arquitectura GPT-NeoX de `EleutherAI/pythia-1.4b`: un transformer decoder-only denso con atención causal completa, normalización previa a la atención y al MLP, y embeddings rotatorios. No incorpora mezcla de expertos, atención lineal ni mecanismos híbridos. El tokenizador es el de GPT-NeoX heredado del modelo base.

El ajuste fino consistió en una sola época sobre una muestra de 1 millón de secuencias de 128 tokens de OpenWebMath, con tasa de aprendizaje 5e-5, scheduler coseno y semilla 42. No se documenta el número total de tokens procesados ni la composición detallada del subconjunto, aunque por construcción equivale a un orden de 1,28 × 10^8 tokens como máximo teórico. No hay información sobre RLHF, DPO ni ninguna fase de alineación posterior; el entrenamiento es puramente de modelado de lenguaje autorregresivo sobre texto matemático. La innovación metodológica no está en el modelo sino en el diseño experimental: la separación entre `run1` (origen de etiquetas) y `run2` (validación sobre datos disjuntos) permite evaluar la transferibilidad del clasificador de memorización a secuencias que el modelo nunca ha visto durante el entrenamiento del clasificador.

## Capacidades

- Generación de texto autorregresiva en inglés, con especialización hacia texto de contenido matemático procedente de la web.
- Continuación de documentos y fórmulas en notación LaTeX o texto plano matemático, dado el dominio de ajuste.
- Reproducción literal de fragmentos del corpus de entrenamiento: es precisamente la propiedad que el autor pretende medir, no una capacidad deseable de producto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso deliberado.
- No dispone de modo de pensamiento (*thinking mode*), visión, audio ni multimodalidad.
- Capacidades multilingües: no evaluadas ni declaradas; el modelo base Pythia es mayoritariamente angloparlante y el ajuste refuerza ese sesgo.
- No hay indicios de instruction following: al no haber pasado por ajuste supervisado de instrucciones, responde como modelo de continuación de texto.

## Casos de uso

- Validación de clasificadores de memorización: uso principal declarado. Se emplea como conjunto *held-out* para comprobar si un clasificador entrenado con las etiquetas de `run1` predice correctamente qué secuencias memorizará este segundo modelo antes de entrenarlo.
- Estudio de dinámicas de memorización en modelos pequeños: al ser un ajuste de una sola época sobre un corpus controlado de 128 tokens por secuencia, permite aislar la memorización de secuencias cortas de otros factores como el preentrenamiento masivo.
- Investigación sobre extracción de datos de entrenamiento (*data extraction attacks*): el modelo sirve para medir la tasa de reproducción literal de pasajes de OpenWebMath y calibrar ataques de extracción en modelos de 1,4B parámetros.
- Análisis de olvido catastrófico y retención: comparar `pythia-1.4b` base frente a este ajuste permite cuantificar cuánto conocimiento general se degrada tras una época sobre un dominio estrecho.
- Reproducibilidad de experimentos de ajuste fino: la configuración está completamente especificada (lr 5e-5, coseno, semilla 42, 1 época, seq len 128), lo que facilita replicar el pipeline con otros corpus o semillas.
- Docencia y experimentación de bajo coste: con 1,4B parámetros se puede ejecutar en una única GPU de consumo para ilustrar conceptos de memorización, sobreajuste y evaluación de modelos en cursos o laboratorios.
- Línea base en estudios de dominio matemático: referencia para comparar si ajustes mayores sobre OpenWebMath mejoran la generación de matemáticas o solo incrementan la copia literal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K, evaluaciones de perplejidad ni métricas de memorización (por ejemplo, ratio de coincidencia exacta con el corpus). Tampoco se aportan métricas de rendimiento del clasificador que el modelo ayuda a validar.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica unos 4-6 GB con lotes pequeños.
- VRAM estimada en FP32: unos 5,7 GB para pesos.
- Cuantización INT8: en torno a 1,5 GB; cuantización INT4: en torno a 0,8-1 GB de pesos.
- GPU recomendadas: cualquier GPU con 8 GB o más. Cabe holgadamente en RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, RTX 4080, RTX 4090; en el segmento profesional, A10, L4, A100 y H100 quedan sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas con 6-8 GB o más, incluidas soluciones de gama baja con cuantización.
- Opciones de despliegue: transformers (librería nativa del modelo), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), vLLM, llama.cpp/Ollama y TGI previa conversión de pesos a GGUF.
- Latencia y throughput: no disponibles; el autor no publica mediciones. Para un modelo denso de 1,4B en una RTX 4090 se puede esperar un throughput del orden de miles de tokens por segundo en batching, pero es una estimación genérica, no un dato del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| pythia-1.4b-owm-run2 | 1,41B | 2048 (base); ajuste a 128 | Ajuste fino sobre OpenWebMath | Apache 2.0 | Artefacto de investigación sobre memorización; sin benchmarks |
| EleutherAI/pythia-1.4b | 1,41B | 2048 | Modelo base preentrenado | Apache 2.0 | Modelo de referencia con checkpoints intermedios y suite de evaluación publicada; este ajuste parte de él |
| TinyLlama-1.1B | 1,1B | 2048 | Transformer denso con ajuste de instrucciones | Apache 2.0 | Orientado a uso conversacional; no comparable en propósito experimental |
| Qwen2.5-1.5B | 1,54B | 32 768 | Transformer denso | Apache 2.0 | Mucha mayor ventana de contexto y soporte multilingüe; orientado a producto, no a investigación de memorización |

La comparación relevante es frente al propio modelo base: este `run2` no pretende superar a `pythia-1.4b` en ninguna tarea estándar, sino producir un estado del modelo del que se conozca exactamente el corpus de ajuste para medir memorización. Frente a alternativas comerciales o de propósito general de tamaño similar, carece de alineación, de ventana de contexto ampliada y de cualquier evaluación publicada.

## Limitaciones y advertencias

- No es un modelo de propósito general: es un artefacto experimental de un único autor, sin evaluación ni validación externa, con 0 descargas y 0 *likes* en el momento de la consulta.
- Ausencia total de benchmarks: no hay ninguna evidencia publicada sobre su calidad de generación, su perplejidad o su comportamiento fuera del dominio de OpenWebMath.
- Sesgo de dominio severo: el ajuste sobre texto matemático extraído de la web lo hace inadecuado para conversación general, código, redacción o tareas multilingües.
- Riesgo elevado de reproducción literal de contenido del corpus de entrenamiento (memorización), incluyendo posibles datos personales, texto con derechos de autor o contenido web no filtrado presente en OpenWebMath.
- Riesgo de alucinación no mitigado: no ha pasado por RLHF, DPO ni verificación factual; puede generar desarrollos matemáticos plausibles pero incorrectos.
- Idiomas: no declarados; el sesgo hacia el inglés es esperable y no se ha medido el comportamiento en castellano.
- Limitación de contexto práctico: aunque herede 2048 tokens del modelo base, el ajuste se hizo con secuencias de 128 tokens, por lo que el comportamiento más allá de esa longitud no está validado y puede degradarse.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para producción: carece de garantías, de soporte y de evaluaciones de seguridad.
- Fecha de creación en el repositorio (2026-10-26) y ausencia de documentación adicional dificultan la trazabilidad del experimento.
- No se especifican hiperparámetros de la fase de tokenización ni el subconjunto exacto de OpenWebMath empleado, lo que limita la reproducibilidad estricta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaydeepb/pythia-1.4b-owm-run2
- Modelo base: https://huggingface.co/EleutherAI/pythia-1.4b
- Dataset de ajuste: https://huggingface.co/datasets/open-web-math/open-web-math
- Repositorio de Pythia (EleutherAI): https://github.com/EleutherAI/pythia
- Paper de Pythia (Pythia: A Suite for Analyzing Large Language Models Across Training and Scaling): https://arxiv.org/abs/2304.01373
- Paper de OpenWebMath: https://arxiv.org/abs/2310.06786

Nota: la búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los enlaces encontrados correspondían a contenidos sin relación. No se han localizado papers, blogs, demos ni repositorios adicionales del autor.
