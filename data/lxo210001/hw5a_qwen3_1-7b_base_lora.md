# lxo210001/HW5A_Qwen3_1.7B_Base_LoRA

## Resumen

HW5A_Qwen3_1.7B_Base_LoRA es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante SFT (Supervised Fine-Tuning) sobre el modelo base Qwen/Qwen3-1.7B-Base. Lo publica el usuario lxo210001 en HuggingFace y se distribuye exclusivamente como pesos de adaptador en formato PEFT/safetensors, no como modelo completo. El repositorio ocupa 0,3 GB, lo que es coherente con un adaptador de bajo rango y no con los pesos completos de un modelo de 1.700 millones de parámetros.

El modelo hereda la arquitectura transformer decoder-only de la familia Qwen3, con aproximadamente 1.700 millones de parámetros. No obstante, la model card pública es la plantilla por defecto de HuggingFace sin rellenar: no documenta datos de entrenamiento, hiperparámetros, composición del dataset, licencia ni idiomas. Por tanto, la mayor parte de las especificaciones técnicas del adaptador (rango LoRA, alpha, módulos objetivo, régimen de entrenamiento) no están disponibles.

Su relevancia es limitada y muy específica: se trata de un artefacto de fine-tuning de bajo perfil, con cero descargas y cero likes en el momento de la consulta, sin evaluación publicada. Resulta útil únicamente como ejemplo de pipeline PEFT+TRL sobre Qwen3-1.7B-Base o como punto de partida para experimentación, nunca como modelo listo para producción sin una evaluación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA (PEFT) |
| Parametros totales | ~1.700 millones en el modelo base; tamano del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; heredada del modelo base Qwen3-1.7B-Base (no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite cuantizacion, pero no se documenta) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3-1.7B-Base |
| Libreria | PEFT 0.19.1, transformers, TRL |
| Tamano del repositorio | 0,3 GB |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con LoRA |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-1.7B-Base, un transformer decoder-only de la familia Qwen3 con unos 1.700 millones de parámetros. La técnica empleada es LoRA, que congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas, reduciendo drásticamente el número de parámetros entrenables y el coste de almacenamiento (de ahí los 0,3 GB del repositorio frente a los varios GB que ocuparían los pesos completos en precisión completa).

El entrenamiento se realizó mediante SFT con la librería TRL, según las etiquetas del repositorio. Sin embargo, la model card no especifica el dataset utilizado, el número de tokens de entrenamiento, la composición de los datos, el rango LoRA, el valor de alpha, los módulos objetivo ni si hubo etapas posteriores de alineamiento (RLHF/DPO). Tampoco se documenta el régimen de precisión (fp16, bf16, fp32) ni el hardware empleado. Toda esta información figura como "More Information Needed" en la model card original.

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" y el pipeline "text-generation" indican que el adaptador se orienta a respuestas en formato dialogo, aunque no se detalla el formato de prompt empleado.
- Fine-tuning supervisado: el adaptador modifica el comportamiento del base hacia la distribucion de datos de SFT, cuyo contenido se desconoce.
- Herencia de capacidades del base: al ser un adaptador LoRA, conserva las capacidades del modelo Qwen3-1.7B-Base en la medida en que el entrenamiento no las degrade; no se documenta cuales son.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-paso y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas no estan declarados.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el pipeline declarado es unicamente text-generation.

## Casos de uso

- Experimentacion con pipelines PEFT/TRL: el adaptador sirve como referencia práctica para reproducir un flujo de SFT con LoRA sobre Qwen3-1.7B-Base, cargando el adaptador con `PeftModel.from_pretrained` sobre el base.
- Prototipado de asistentes conversacionales ligeros: al estar orientado a dialogo y apoyarse en un modelo de 1,7B, puede desplegarse en entornos con recursos limitados para pruebas internas de conversacion, siempre que se valide antes la calidad de las respuestas.
- Base para fine-tuning en cascada: puede utilizarse como punto de partida para un segundo ajuste LoRA especifico de dominio, aprovechando que el adaptador ya modifica el comportamiento conversacional del base.
- Investigacion sobre adaptadores de bajo rango: útil para estudiar el efecto de LoRA en modelos pequenos, comparando el comportamiento del base frente al adaptador en tareas controladas.
- Docencia y formacion: ejemplo mínimo y ligero (0,3 GB) para explicar el ciclo completo de SFT con TRL y PEFT sin requerir infraestructura grande.
- Evaluacion comparativa de tecnicas de ajuste: sirve como artefacto de control en experimentos que comparen LoRA con otros metodos (full fine-tuning, QLoRA) sobre el mismo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el adaptador anade un coste marginal sobre el modelo base. Qwen3-1.7B-Base en fp16 requiere aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits baja a ~1,7 GB y en 4 bits a ~0,9 GB. Estas cifras son estimaciones basadas en el tamano del base, no datos publicados para este adaptador.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) deberia poder ejecutar el base en fp16 o cuantizado; para mayor throughput, A100 o H100 no son necesarias por el tamano del modelo.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPUs con 6-8 GB o mas, dependiendo de la cuantizacion y la longitud de contexto.
- Opciones de despliegue: el adaptador es compatible con transformers + PEFT; para servir en produccion puede fusionarse con el base (`merge_and_unload`) y desplegarse con vLLM o TGI. Para entornos locales, llama.cpp u Ollama requeririan convertir el modelo fusionado a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| HW5A_Qwen3_1.7B_Base_LoRA | ~1,7B (base) + adaptador | No disponible | No disponible | Safetensors (PEFT) | Adaptador SFT sin evaluacion publicada |
| Qwen/Qwen3-1.7B-Base | ~1,7B | No disponible en esta ficha | Segun el repositorio oficial de Qwen | Safetensors | Modelo base sin ajuste; referencia directa |
| Qwen/Qwen3-1.7B (instruct) | ~1,7B | No disponible en esta ficha | Segun el repositorio oficial de Qwen | Safetensors | Variante con alineamiento oficial; previsiblemente mas fiable para uso directo |
| Otros adaptadores LoRA sobre Qwen3-1.7B | ~1,7B (base) + adaptador | Variable | Variable | Safetensors (PEFT) | Calidad dependiente del autor; sin garantias |

No se dispone de datos de rendimiento comparativos para este adaptador; la comparacion se limita a parametros y formato.

## Limitaciones y advertencias

- Model card sin rellenar: no hay informacion sobre datos de entrenamiento, hiperparametros ni evaluacion, lo que impide conocer que comportamiento se ha inducido y con que calidad.
- Licencia no declarada: no se puede asumir uso comercial permitido; debe consultarse la licencia del modelo base Qwen3-1.7B-Base y aclararse la del adaptador antes de cualquier uso en produccion.
- Riesgo de alucinacion: inherente a los modelos de 1,7B y agravado por la falta de evaluacion del adaptador; no hay datos que permitan acotarlo.
- Sesgos: desconocidos; dependen del dataset de SFT, que no se documenta.
- Idiomas: no declarados; no se puede garantizar un rendimiento multilingue adecuado.
- Sin senales de adopcion: cero descargas y cero likes en el momento de la consulta, sin issues ni discusion que aporten contexto.
- Dependencia del base: el adaptador no es autonomo; requiere descargar Qwen/Qwen3-1.7B-Base y cargarlo con PEFT en la version indicada (0.19.1) o compatible.
- No apto para produccion sin validacion propia: al no existir benchmarks ni documentacion, cualquier despliegue debe ir precedido de una evaluacion en el dominio objetivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lxo210001/HW5A_Qwen3_1.7B_Base_LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Paper de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
