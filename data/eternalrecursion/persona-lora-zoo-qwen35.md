# EternalRecursion/persona-lora-zoo-qwen35

## Resumen

El repositorio `EternalRecursion/persona-lora-zoo-qwen35` contiene un conjunto de adaptadores LoRA (Low-Rank Adaptation) diseñados para el modelo base Qwen/Qwen3.5-4B, un modelo de visión-lenguaje de 4.000 millones de parámetros. El objetivo de este proyecto, desarrollado por el autor EternalRecursion, es investigar si el fine-tuning de rasgos de personalidad ocupa un subespacio reproducible, de baja dimensionalidad y conductualmente significativo dentro del espacio de actualizaciones de pesos. Para ello se han entrenado tres familias de adaptadores sobre los cinco grandes rasgos de personalidad (Big Five), manteniéndolos separados para poder comparar las distintas etapas de entrenamiento.

El repositorio incluye 134 adaptadores de la primera etapa (DPO sobre pares de preferencias de rasgo), 45 adaptadores de la segunda etapa (SFT sobre transcripciones autogeneradas) y 45 adaptadores fusionados (combinación lineal de DPO y SFT). El tamaño total del repositorio es de 112,7 GB, aunque los adaptadores individuales son ligeros porque solo contienen los pesos LoRA. La licencia es Apache-2.0, lo que permite uso comercial y modificación. El proyecto se apoya en dos trabajos académicos: Persona Cartography (arXiv:2607.07916) y Open Character Training (arXiv:2511.01689), y utiliza marcadores de rasgos del conjunto de adjetivos de Goldberg para el Big Five.

La relevancia de este modelo radica en su enfoque experimental: no se limita a producir un chatbot con personalidad, sino que estudia la geometría del espacio de actualizaciones de pesos inducido por el entrenamiento de personalidad. Esto tiene implicaciones para la interpretabilidad, el control de comportamiento y el desarrollo de técnicas de edición de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-4B (transformer de vision-lenguaje, solo torre de texto) |
| Parametros totales | No disponible (el modelo base tiene 4B; los adaptadores LoRA son una fraccion menor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (se infiere al menos 3072 tokens, ya que las transcripciones de entrenamiento se truncaron a ese limite) |
| Tipos de cuantizacion | No disponible (los pesos se guardan en safetensors, probablemente en bfloat16 segun el codigo de carga) |
| Idiomas soportados | No disponible (el modelo base Qwen3.5-4B es multilingue, pero no se especifica para los adaptadores) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El proyecto utiliza LoRA clasica (no rsLoRA) con r=64, alpha=128, dropout 0.0 y una escala efectiva de 2.0, aplicada sobre 248 modulos del modelo base Qwen3.5-4B. El entrenamiento se realiza en dos etapas claramente diferenciadas:

- **Etapa 1 (stage1_dpo):** DPO (Direct Preference Optimization) con beta=0.1, `kl_coef`=0.001 y una funcion de perdida combinada `["sigmoid", "sft"]` con pesos `[1.0, 0.1]`. El termino NLL sobre la respuesta elegida (con peso 0.1) evita que el DPO colapse en un discriminador trivial. Esta etapa produce 134 adaptadores, uno por cada rasgo de personalidad considerado.
- **Etapa 2 (stage2_introspection):** SFT (Supervised Fine-Tuning) sobre 12.000 transcripciones autogeneradas, fusionando primero el adaptador de la etapa 1 en el modelo base. Esta etapa es mas costosa y solo se aplico a un subconjunto de 45 rasgos, elegidos para mantener equilibrio entre los cinco factores del Big Five y ambas direcciones de cada factor.
- **Fusion (persona_merged):** Combinacion lineal de los pesos DPO y SFT con coeficientes `dpo 1.0 + sft 0.25`, usando `combination_type="linear"`.

Todos los entrenamientos usan semilla 0. Los datos de entrenamiento provienen del dataset `EternalRecursion/persona-curvature-oct-transcripts`. El proyecto sigue el enfoque de Open Character Training (OCT) en su modo "bug-faithful", es decir, replicando fielmente los fallos del codigo de referencia para poder comparar resultados.

Una innovacion destacable es la publicacion de metricas corregidas: cada adaptador de la etapa 2 incluye un archivo `corrected_metrics.json` que corrige el valor de `loss_last` cuando el entrenamiento se reanudo desde un checkpoint, ya que el valor crudo de HF Trainer es incorrecto en esos casos. El valor corregido para los 45 adaptadores es 0.886 ± 0.111, sin la aparente separacion bimodal que producia el artefacto.

## Capacidades

- Adaptacion de rasgos de personalidad: los adaptadores permiten modificar el comportamiento del modelo base para que exhiba rasgos especificos del Big Five (apertura, responsabilidad, extraversion, amabilidad y neuroticismo), tanto en direccion positiva como negativa.
- Investigacion sobre subespacios de pesos: el repositorio esta disenado para estudiar si los cambios de personalidad inducidos por LoRA ocupan un subespacio de baja dimensionalidad en el espacio de actualizaciones de pesos, y si ese subespacio es reproducible entre inicializaciones.
- Comparacion entre etapas de entrenamiento: al mantener separados los adaptadores de DPO, SFT y la fusion, se pueden analizar las diferencias en la geometria de los pesos y en el comportamiento resultante.
- No se dispone de informacion sobre capacidades adicionales como generacion de codigo, tool calling, agentes o razonamiento multi-paso. El modelo base Qwen3.5-4B es un modelo de vision-lenguaje, pero los adaptadores solo afectan a la torre de texto y no se documentan otras capacidades especificas.

## Casos de uso

Dado el caracter experimental del proyecto, los casos de uso son principalmente de investigacion y no se documentan aplicaciones productivas concretas. No obstante, se pueden identificar los siguientes escenarios plausibles:

- Estudio de la geometria del fine-tuning de personalidad: investigadores pueden utilizar los adaptadores para analizar como se distribuyen los cambios de pesos en el espacio de LoRA, comparando la similitud coseno entre rasgos y entre inicializaciones.
- Validacion de tecnicas de edicion de modelos: el repositorio sirve como banco de pruebas para metodos de edicion de modelos que operan sobre subespacios de baja dimensionalidad, como la intervencion en subespacios de activacion o la extraccion de vectores de direccion.
- Desarrollo de chatbots con control de personalidad: los adaptadores fusionados podrian integrarse en sistemas conversacionales para ajustar el tono y el comportamiento del asistente, aunque la verificacion conductual es parcial y no se recomienda para produccion sin validacion adicional.
- Comparacion de metodos de alineacion: al tener adaptadores entrenados con DPO puro, SFT puro y una combinacion de ambos, se puede estudiar como cada metodo afecta a la expresion de rasgos de personalidad y a la fluidez del lenguaje.
- Analisis de confundidos en datos de entrenamiento: el proyecto documenta que la verbosidad del rasgo es un factor de confusion, lo que permite investigar como el sesgo de longitud de las respuestas afecta al entrenamiento de preferencias.
- Replicacion de experimentos de interpretabilidad: los datos de entrenamiento y las metricas corregidas permiten reproducir los experimentos descritos en los articulos de Persona Cartography y Open Character Training.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estandar. El proyecto se centra en la geometria de los pesos y en la verificacion conductual parcial (un barrido anterior de 134 rasgos establecio que los adaptadores dirigen su propio rasgo, siendo la supresion la direccion citable y la amplificacion confundida por perdida de fluidez), pero no se proporcionan metricas cuantitativas comparativas.

## Requisitos de hardware

No se dispone de informacion especifica sobre requisitos de hardware en la documentacion del modelo. Sin embargo, se pueden hacer las siguientes consideraciones generales basadas en el tamaño del modelo base:

- El modelo base Qwen3.5-4B tiene 4.000 millones de parametros. En bfloat16, los pesos del modelo base ocupan aproximadamente 8 GB de VRAM (4B × 2 bytes). Los adaptadores LoRA son mucho mas ligeros (r=64 sobre 248 modulos, tipicamente menos de 100 MB por adaptador).
- Para inferencia con el modelo base y un adaptador cargado, se recomienda una GPU con al menos 12 GB de VRAM para trabajar comodamente en bfloat16. GPUs como RTX 3060 12GB, RTX 4070, A10, L4 o superiores serian adecuadas.
- Para entrenamiento o fine-tuning adicional, se necesitarian al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 40GB) dependiendo del tamaño de lote y la longitud de secuencia.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `transformers` y `peft` en Python. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, aunque es probable que funcionen si se fusionan los adaptadores en el modelo base y se exportan a esos formatos.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables. El proyecto es unico en su enfoque de "zoo" de adaptadores de personalidad sobre un modelo base especifico, y no se mencionan alternativas directas en la documentacion. Se podria comparar con otros trabajos de fine-tuning de personalidad, pero no hay datos suficientes para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- **Confundido por verbosidad del rasgo:** las transcripciones de entrenamiento que superaban los 3.072 tokens se descartaron. El rasgo mediano perdio 28 filas de 12.000, el peor perdió 2.000 (16,7%) y 14 de 45 rasgos perdieron mas del 5%. Esto significa que los adaptadores difieren en la cantidad de datos vistos, lo que puede afectar a comparaciones en el espacio de pesos. No obstante, la correlacion con la perdida final es de +0.01, lo que sugiere que no afecta a la convergencia.
- **Verificacion conductual parcial:** los adaptadores de este repositorio no han sido validados individualmente a nivel de comportamiento. Un barrido anterior de 134 rasgos establecio que los adaptadores dirigen su propio rasgo, pero la amplificacion del rasgo esta confundida por perdida de fluidez. No se recomienda su uso en produccion sin validacion adicional.
- **Geometria relativa a una inicializacion fija:** LoRA restringe las actualizaciones al espacio de filas de una matriz A inicializada aleatoriamente. Dos semillas distintas generan subespacios casi ortogonales (coseno entre semillas ~0.017, frente a un suelo de ~0.0013 para rasgos distintos). Esto implica que los vectores de direccion no son transferibles entre inicializaciones y que cualquier uso como vector de control debe trabajar dentro de una unica inicializacion o congelar A globalmente (LoRA-FA).
- **Metricas corregidas:** el campo `loss_last` de `runmeta.json` es incorrecto para entrenamientos reanudados desde checkpoint. Se debe usar `corrected_metrics.json` en su lugar. El valor corregido para todos los adaptadores de la etapa 2 es 0.886 ± 0.111.
- **Sin benchmarks publicados:** no hay evaluaciones estandar que permitan comparar el rendimiento del modelo con otros.
- **Licencia:** Apache-2.0, permite uso comercial, pero se debe respetar la licencia del modelo base Qwen3.5-4B (tambien Apache-2.0 segun la informacion proporcionada).
- **Idiomas:** no se especifican los idiomas soportados por los adaptadores. El modelo base es multilingue, pero no se garantiza que los rasgos de personalidad se expresen correctamente en todos los idiomas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EternalRecursion/persona-lora-zoo-qwen35
- Dataset de entrenamiento: https://huggingface.co/datasets/EternalRecursion/persona-curvature-oct-transcripts
- Paper "Persona Cartography" (Hawthorne et al.): https://arxiv.org/abs/2607.07916
- Paper "Open Character Training": https://arxiv.org/abs/2511.01689
