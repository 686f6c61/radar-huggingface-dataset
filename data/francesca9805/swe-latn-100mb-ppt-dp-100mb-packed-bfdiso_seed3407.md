# francesca9805/swe-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407

## Resumen

El modelo `francesca9805/swe-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407` es un ajuste fino (fine-tuning) del modelo base `goldfish-models/swe_latn_100mb`, un modelo de lenguaje monolingüe de la familia Goldfish desarrollado por el grupo de investigación de la Universidad de Groningen. Se trata de un modelo pequeño, de arquitectura GPT-2 con 124.770.816 parámetros (aproximadamente 125 millones), orientado a la generación de texto en sueco escrito en alfabeto latino (`swe_latn`).

El modelo ha sido entrenado mediante supervisión fina (SFT, *supervised fine-tuning*) utilizando la librería TRL de Hugging Face, según indica su model card. El nombre del repositorio incluye referencias a experimentos con tokenizadores y a configuraciones concretas de entrenamiento (`ppt`, `Dp-100mb-packed-bfdiso`, `seed3407`), lo que sugiere que se trata de un artefacto de investigación más que de un modelo de producción pulido.

Es relevante ahora como ejemplo de reproducibilidad en investigación de modelos de lenguaje de bajos recursos: parte de un corpus de 100 MB, introduce un sufijo de tokenizador experimental y documenta el entrenamiento en un *run* de Weights & Biases. No obstante, el repositorio no registra descargas ni *likes*, no especifica licencia ni idiomas en sus metadatos, y no publica resultados de evaluación, por lo que debe tratarse como un modelo experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 124.770.816 (aproximadamente 125 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (la arquitectura GPT-2 suele emplear 1024 tokens) |
| Tipos de cuantizacion | no disponible; el formato safetensors permite conversiones a GGUF, ONNX o bitsandbytes en fp16/int8/int4 |
| Idiomas soportados | no disponible en los metadatos; el nombre del modelo base (`swe_latn`) indica sueco en alfabeto latino |
| Licencia | no disponible (la model card declara `licence: license` sin especificar terminos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, una red transformer de tipo *decoder-only* con atención causal, tal como confirma la etiqueta `gpt2` del repositorio. El modelo base `goldfish-models/swe_latn_100mb` pertenece a la colección Goldfish, una serie de modelos monolingües entrenados sobre aproximadamente 100 MB de texto por idioma, pensada para lenguas con pocos recursos digitales. No se detalla en la información disponible ni el número exacto de tokens de entrenamiento ni la composición del corpus.

El ajuste fino se realizó con TRL (versión 0.23.0) sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1, empleando el método SFT. El nombre del repositorio apunta a un experimento de tokenización (`new-tokenizers`, según la URL de Weights & Biases) y a una configuración de datos empaquetados (*packed*) de 100 MB, con una semilla fija (`seed3407`). No se documentan en la información proporcionada el uso de RLHF, DPO ni ninguna innovación arquitectónica adicional más allá del ajuste supervisado.

## Capacidades

- Generacion de texto en sueco: capacidad heredada del modelo base `goldfish-models/swe_latn_100mb`, orientada a la produccion de texto continuo en este idioma.
- Finalizacion de texto y *language modeling*: el pipeline declarado es `text-generation`, por lo que puede completar secuencias y actuar como modelo de lenguaje base.
- Formato de conversacion: el ejemplo de la model card emplea una lista de mensajes con roles (`{"role": "user", ...}`), lo que indica que el modelo fue ajustado con SFT sobre un formato de dialogo o instrucciones.
- Ajuste fino adicional: al ser un modelo pequeno y de pesos abiertos en safetensors, puede reentrenarse o ajustarse con nuevos corpus o tareas.
- Integracion con librerias estandar: compatible con `transformers`, `text-generation-inference` y `endpoints_compatible`.
- No hay evidencia de soporte de *tool calling*, function calling, agentes multi-paso, vision, audio, modo razonamiento (*thinking*) ni capacidades multilingues adicionales en la informacion proporcionada.

## Casos de uso

- Investigacion en modelos de bajos recursos: permite reproducir experimentos de tokenizacion y ajuste fino sobre sueco partiendo de un corpus de 100 MB, con una semilla documentada (`seed3407`) y trazas en Weights & Biases.
- Generacion de texto en sueco para prototipos: util para generar borradores, completar fragmentos de texto o producir datos sinteticos en sueco en fases tempranas de un proyecto.
- *Baseline* para comparativas de arquitectura: sirve como referencia ligera frente a modelos mas grandes al evaluar mejoras de tokenizacion o de empaquetado de datos (*packed*).
- Experimentos de ajuste fino por instrucciones: al haberse entrenado con SFT, puede emplearse como punto de partida para tareas de instrucciones sencillas en sueco antes de escalar a modelos mayores.
- Despliegue en entornos con recursos limitados: con unos 125 M de parametros cabe en CPU, portatiles o dispositivos *edge*, lo que lo hace adecuado para demos y pruebas de latencia.
- Aumento de datos para NLP sueco: puede generar texto adicional para ampliar corpus en tareas de clasificacion o analisis linguistico, siempre con supervision humana.
- Estudio de sesgos y calidad en modelos monolingues pequenos: su tamano reducido permite analizar de forma controlada el comportamiento del modelo y sus limitaciones.
- Pipeline de pruebas de extremo a extremo: integrable en `text-generation-inference` para validar infraestructura de servicio antes de desplegar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 250 MB (124,77 M de parametros x 2 bytes).
- VRAM estimada en int8: aproximadamente 125 MB.
- VRAM estimada en int4: aproximadamente 65-70 MB.
- GPU recomendadas: cualquiera con al menos 1 GB de VRAM; por ejemplo GTX 1050 Ti, RTX 2060, RTX 3060 o superiores. Tambien puede ejecutarse unicamente en CPU sin GPU dedicada.
- Caben en GPU de consumo: si, en practicamente cualquier GPU moderna, e incluso en placas integradas y en memoria de sistema.
- Opciones de despliegue: `transformers` (pipeline de `text-generation`), `text-generation-inference` (TGI), llama.cpp u Ollama tras convertir los pesos a GGUF, y servidores ONNX Runtime.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia baja en CPU y muy baja en GPU, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| francesca9805/swe-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407 | 124,77 M | no disponible (GPT-2, tipicamente 1024) | no disponible | HuggingFace (0 descargas) |
| goldfish-models/swe_latn_100mb (modelo base) | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| openai-community/gpt2 | 124 M | 1024 tokens | MIT | HuggingFace |
| distilgpt2 | 82 M | 1024 tokens | Apache 2.0 (segun su model card) | HuggingFace |

Comparativa limitada a parametros, contexto y licencia, ya que no se han publicado resultados de rendimiento para el modelo analizado. La diferencia principal frente a `gpt2` y `distilgpt2` es el idioma de especializacion (sueco) y el ajuste SFT, pero tambien la ausencia de licencia explicita.

## Limitaciones y advertencias

- Ausencia de licencia: la model card declara `licence: license` sin especificar terminos, por lo que el uso comercial no esta autorizado de forma clara y requiere consultar al autor.
- Modelo experimental: sin descargas ni *likes*, con un nombre de repositorio que refleja configuraciones concretas de investigacion; no debe considerarse un modelo estable de produccion.
- Sin evaluacion publicada: no hay benchmarks, por lo que se desconoce su calidad real frente a alternativas.
- Riesgo de alucinacion: al ser un modelo generativo pequeno, es propenso a inventar contenido y a producir texto incoherente en salidas largas.
- Idiomas: probablemente limitado al sueco escrito en caracteres latinos; no se ha verificado su comportamiento en otros idiomas.
- Contexto reducido: si sigue la arquitectura GPT-2, la ventana es de 1024 tokens como maximo, insuficiente para tareas que requieran contexto largo.
- Sesgos: los corpus de entrenamiento pueden contener sesgos sociales, culturales o de genero heredados del modelo base y del corpus de ajuste.
- Capacidades de instrucciones limitadas: aunque se ha entrenado con SFT, el tamano reducido impide un seguimiento fiable de instrucciones complejas o razonamiento multi-paso.
- Sin soporte conocido de *tool calling*, agentes, vision ni audio: su uso debe limitarse a tareas de generacion de texto.

## Enlaces

- [HuggingFace: francesca9805/swe-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407](https://huggingface.co/francesca9805/swe-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407)
- [Modelo base: goldfish-models/swe_latn_100mb](https://huggingface.co/goldfish-models/swe_latn_100mb)
- [Run de entrenamiento en Weights & Biases](https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/qmli89v5)
- [Repositorio TRL](https://github.com/huggingface/trl)
