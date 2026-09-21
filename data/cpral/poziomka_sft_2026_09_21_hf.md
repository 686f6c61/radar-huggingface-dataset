# cpral/poziomka_sft_2026_09_21_hf

## Resumen

Poziomka es un modelo de lenguaje experimental en polaco desarrollado por el usuario cpral, publicado en HuggingFace con el identificador cpral/poziomka_sft_2026_09_21_hf. Se trata de un modelo con arquitectura de mezcla de expertos (MoE) de 4B parametros totales y 1,15B parametros activos por token, preentrenado desde cero sobre aproximadamente 80B tokens de texto en polaco. La variante publicada no es el modelo base, sino una vista previa (preview) del modelo postentrenado mediante ajuste supervisado (SFT).

El postentrenamiento se realizo sobre unos 6B tokens del dataset cpral/Polski_Polish_SFT_poziomka-fun-rp-v11, con una longitud de secuencia de hasta 16384 tokens, usando Megatron-LM, fine-tuning completo (full finetune) y empaquetado de muestras (sample packing). Es relevante ahora como ejemplo de esfuerzo de preentrenamiento desde cero en una lengua de recursos medios como el polaco, en un contexto donde la mayoria de modelos abiertos se derivan de bases entrenadas predominantemente en ingles.

El propio autor advierte que esta version es inestable: indica que sufre numerosos problemas de generacion de texto que se corregiran en versiones posteriores y que rinde peor en el benchmark Łodyga que la variante anterior 2026_09_14 iter 1718. El modelo tiene 0 descargas y 0 likes en el momento de la consulta y no declara licencia, por lo que debe considerarse un artefacto de investigacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre transformer; entrenado con Megatron-LM |
| Parametros totales | 4B |
| Parametros activos | 1,15B (4B A1.15B) |
| Longitud de contexto | Hasta 16384 tokens durante el SFT (no se especifica la ventana nativa del preentrenamiento) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Polaco (pl) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano total del repositorio: 49,4 GB) |

## Arquitectura y entrenamiento

La model card describe un modelo MoE de 4B parametros totales con 1,15B parametros activos, preentrenado desde cero sobre aproximadamente 80B tokens de texto polaco. No se detalla el numero de expertos, la estrategia de enrutamiento (top-k), el ratio de expertos compartidos ni la configuracion de atencion (tipo de positional encoding, uso de GQA/MQA, etc.), por lo que esos datos deben considerarse no disponibles. El entrenamiento se llevo a cabo con Megatron-LM, lo que implica que la implementacion de referencia es la pila de NVIDIA y que la conversion a transformers puede requerir pasos adicionales.

La fase de postentrenamiento publicada es un ajuste supervisado completo (no LoRA) sobre unos 6B tokens del dataset cpral/Polski_Polish_SFT_poziomka-fun-rp-v11, con secuencias de hasta 16384 tokens y empaquetado de muestras para maximizar la ocupacion del batch. No se menciona el uso de RLHF, DPO u otras tecnicas de alineacion por preferencias. El autor no documenta innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.) mas alla del propio diseno MoE y de la receta de entrenamiento en Megatron-LM.

## Capacidades

- Generacion de texto en polaco: es la unica lengua declarada en la model card y en las etiquetas de HuggingFace.
- Conversacion y roleplay: el nombre del dataset de SFT (poziomka-fun-rp-v11) sugiere un ajuste orientado a dialogo ludico y roleplay, aunque el autor no detalla formalmente estas capacidades.
- Razonamiento y generacion general: cubierto por el preentrenamiento, pero el autor advierte de problemas de generacion en esta version, por lo que la calidad es inconsistente.
- Soporte de tool calling / function calling: no disponible; no se menciona en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se menciona.
- Capacidades multilingues: limitadas al polaco segun la metadata (language: pl).
- Capacidades especiales (modo thinking, vision, audio): no disponible; no se declaran.
- Capacidad de contexto largo: entrenado con secuencias de hasta 16384 tokens en la fase de SFT, lo que permite en teoria entradas de esa longitud, sin garantias de calidad en los extremos.

## Casos de uso

- Investigacion en preentrenamiento de lenguas de recursos medios: el modelo sirve como caso de estudio reproducible de un MoE de 4B preentrenado desde cero con ~80B tokens en polaco, util para analizar el efecto del tamano de datos en lenguas no inglesas.
- Experimentacion academica con arquitecturas MoE: al tener 1,15B parametros activos sobre 4B totales, permite medir el coste real de inferencia y el comportamiento del enrutamiento en una escala manejable.
- Evaluacion comparativa de ajuste supervisado: la receta (full finetune, sample packing, secuencias de 16k, 6B tokens) es un punto de partida para estudiar como afectan estos hiperparametros al rendimiento en polaco frente a la variante anterior.
- Generacion de texto en polaco en entornos de prueba: traduccion interna, resumen o redaccion asistida en polaco, siempre con revision humana y asumiendo las advertencias de inestabilidad del autor.
- Roleplay y asistentes conversacionales en polaco (prototipos): el dataset de ajuste esta orientado a conversacion ludica, por lo que encaja en demos de chat, no en atencion al cliente en produccion.
- Analisis de alucinacion y sesgos en modelos pequenos: al ser un preview con fallos reconocidos, es un candidato util para estudiar modos de fallo en generacion de texto en lenguas minoritarias.
- Base para iteraciones posteriores: dado que el autor anuncia versiones futuras, esta publicacion puede servir como checkpoint intermedio para comparar mejoras en el benchmark Łodyga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La unica referencia cualitativa del autor es que esta variante tiene un rendimiento inferior en Łodyga (un benchmark en polaco) respecto a la variante anterior 2026_09_14 iter 1718. No se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite.

| Benchmark | Resultado | Comparacion indicada por el autor |
|---|---|---|
| Łodyga | no disponible (sin puntuacion) | Rendimiento inferior a la variante 2026_09_14 iter 1718 |
| MMLU, HumanEval, GSM8K, etc. | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de 4B parametros totales, no datos publicados por el autor):
  - bf16/fp16: en torno a 8-9 GB solo para pesos, mas cache KV y overhead, aproximadamente 10-12 GB.
  - int8: en torno a 4-5 GB de pesos.
  - int4: en torno a 2-3 GB de pesos.
- Nota sobre el repositorio: el tamano de 49,4 GB para un modelo de 4B parametros apunta a pesos en precision alta (por ejemplo fp32) o a la inclusion de multiples ficheros de checkpoint; conviene verificar el contenido antes de planificar el despliegue.
- GPU recomendadas: al ser un MoE con todos los expertos en memoria, una GPU de 24 GB (RTX 3090, RTX 4090, A10G) es suficiente en bf16 con margen; A100 40/80 GB y H100 quedan sobredimensionadas para una sola replica, aunque son utiles para servir varias instancias.
- Cabe en GPU de consumo: si, en tarjetas de 16-24 GB en bf16, y en tarjetas de 8-12 GB si se cuantiza a 8 o 4 bits (siempre que se generen los pesos cuantizados, que no estan publicados).
- Opciones de despliegue: vLLM y SGLang soportan arquitecturas MoE; TGI es una alternativa. llama.cpp u Ollama requeririan convertir los pesos a GGUF, conversion no publicada y que depende de que la arquitectura sea compatible. Dado que el entrenamiento se hizo en Megatron-LM, puede ser necesaria una conversion previa del checkpoint.
- Latencia y throughput estimados: no disponible. Con 1,15B parametros activos cabe esperar un coste por token mas cercano a un modelo denso de ~1-2B que a uno de 4B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cpral/poziomka_sft_2026_09_21_hf | 4B totales, 1,15B activos (MoE) | 16384 tokens en SFT | no disponible | HuggingFace, 0 descargas |
| Bielik (Allegro) | no disponible en esta busqueda (modelos densos de escala ~7B-11B en versiones conocidas) | no disponible en esta busqueda | no disponible en esta busqueda | Publico en HuggingFace |
| PLLuM (consorcio polaco) | no disponible en esta busqueda | no disponible en esta busqueda | no disponible en esta busqueda | Publico en HuggingFace |
| Trurl (Voicelab/NASK) | no disponible en esta busqueda | no disponible en esta busqueda | no disponible en esta busqueda | Publico en HuggingFace |

La informacion disponible no permite comparar parametros, contexto, rendimiento ni licencia con alternativas de forma verificable. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre modelos comparables (los unicos resultados obtenidos eran paginas en chino sobre un farmaco, sin relacion con el tema), por lo que la comparativa cuantitativa queda como no disponible. La diferencia estructural mas clara frente a las alternativas polacas conocidas es el uso de una arquitectura MoE con parametros activos reducidos, frente a los disenos densos habituales de la misma categoria.

## Limitaciones y advertencias

- El propio autor declara que el modelo sufre numerosos problemas de generacion de texto que se corregiran en versiones futuras.
- Rendimiento inferior a la variante anterior (2026_09_14 iter 1718) en el benchmark polaco Łodyga, segun el autor.
- Es una vista previa de un modelo postentrenado, no una version estable ni final.
- Licencia no especificada: sin licencia explicita no hay autorizacion clara para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Idioma limitado al polaco; no se declara soporte de castellano ni de otras lenguas.
- No hay datos publicados sobre sesgos, composicion del dataset de preentrenamiento ni filtrado de contenido, por lo que el riesgo de sesgos y de contenido inapropiado no esta caracterizado.
- Riesgo de alucinacion relevante dado el reducido volumen de preentrenamiento (~80B tokens) y los problemas de generacion reconocidos.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- Sin conversiones a GGUF ni cuantizaciones publicadas; el repositorio de 49,4 GB puede no ser directamente cargable en pipelines estandar de transformers sin conversion desde Megatron-LM.
- Sin benchmarks numericos publicos, lo que impide estimar su calidad objetiva frente a alternativas.
- Modelo sin traccion (0 descargas, 0 likes) y sin comunidad que lo valide.

## Enlaces

- HuggingFace: https://huggingface.co/cpral/poziomka_sft_2026_09_21_hf
- Dataset de SFT referenciado en la model card: cpral/Polski_Polish_SFT_poziomka-fun-rp-v11 (no se proporciona URL directa en la informacion disponible)
- Benchmark Łodyga mencionado por el autor: no se proporciona enlace en la informacion disponible
- Variante anterior citada (2026_09_14 iter 1718): no se proporciona enlace en la informacion disponible
- Resultados de la busqueda web: no se encontro ningun enlace relevante; los resultados devueltos trataban sobre un farmaco (timolol maleato) y no guardan relacion con el modelo.
