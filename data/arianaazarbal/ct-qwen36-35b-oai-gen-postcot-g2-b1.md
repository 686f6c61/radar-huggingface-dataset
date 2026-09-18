# arianaazarbal/ct-qwen36-35b-oai-gen-postcot-g2-b1

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA (PEFT) de rango 64 entrenado sobre el modelo base Qwen/Qwen3.6-35B-A3B. Lo publica el usuario arianaazarbal en el marco del programa de entrenamiento iterado con constituciones autoeScritas (welfare-in-ai-rnd / constitutional_training). La pieza concreta es la generacion 2, rama b1, de la cadena `qwen36-35b-oai-gen-postcot`, y fue entrenada el 17 de septiembre de 2026 a partir de un corpus sintetico que instancia una constitucion escrita por el modelo de la generacion anterior de la misma rama.

El interes tecnico del artefacto esta en su metodologia, no en su rendimiento: cada generacion se entrena desde cero sobre el modelo base (sin herencia de pesos entre generaciones), de modo que la posible deriva de comportamiento solo puede acumularse a traves de los documentos sinteticos, nunca a traves de los pesos. Esto lo convierte en material de estudio para investigacion sobre alineamiento, entrenamiento constitucional y deriva de valores en cadenas iteradas.

El adaptador se exporto desde Tinker el 18 de septiembre de 2026. El repositorio ocupa 4,5 GB e incluye la constitucion de entrenamiento como `training_seed_constitution.md`. No hay resultados de benchmarks, evaluaciones independientes, ni datos de licencia o idiomas publicados. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (solo paginas de soporte de impresoras Epson, sin relacion con el artefacto).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer del modelo base Qwen/Qwen3.6-35B-A3B; arquitectura interna del base no disponible |
| Parametros totales | Del adaptador: no disponible (repo de 4,5 GB); del modelo base: no disponible |
| Parametros activos | No disponible (el nombre del base sugiere un esquema MoE con ~3B activos, sin confirmar en la informacion disponible) |
| Longitud de contexto | 8192 tokens de longitud maxima durante el entrenamiento; contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base por separado |
| Rank de LoRA | 64 |
| Modulos objetivo | `all-linear` |
| Hiperparametros de entrenamiento | lr 1e-4, cosine con 5% de warmup, 1 epoch, batch 128, max length 8192, semilla 42 |
| Renderer recomendado | `qwen3_5`, con razonamiento activado (reasoning ON) |

## Arquitectura y entrenamiento

El adaptador se entrena con LoRA de rango 64 sobre todos los modulos lineales (`target_modules=all-linear`), con learning rate 1e-4, scheduler coseno y 5% de warmup, una sola epoca, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42. La receta esta declarada como bloqueada, lo que facilita la reproducibilidad entre ramas y generaciones. El entrenamiento consta de dos etapas: una primera de midtrain sobre un corpus sintetico que instancia una unica constitucion (el "seed" de esa generacion) y una segunda de post-train que continua desde el adaptador de la etapa 1 usando datos de chat condicionados por constitucion, generados con Opus y conservando las trazas de razonamiento (chain-of-thought).

La innovacion metodologica es el esquema de constituciones iteradas. La generacion 0 se siembra con una constitucion escrita por humanos (un resumen de 5000 tokens de la OpenAI Model Spec). Para toda generacion N mayor o igual que 1, la constitucion semilla la escribe el modelo de la generacion N-1 de la misma rama, seleccionada como la medoide de embedding con compuerta sobre un pool de 40 cadenas autoeScritas. Criticamente, cada generacion parte de nuevo del modelo base, de modo que la unica via de transmision entre generaciones son los documentos de entrenamiento. La constitucion concreta usada en esta generacion se incluye en el repositorio.

## Capacidades

- Generacion de texto y conversacion condicionada por constitucion (chat SFT con datos condicionados por el documento constitucional de la generacion).
- Razonamiento explicito: el entrenamiento de la etapa 2 conserva las trazas de chain-of-thought, y el autor recomienda servir y evaluar con `reasoning ON`.
- Comportamiento alineado a una politica escrita en lenguaje natural, en lugar de a preferencias implicitas: el modelo esta entrenado para operar bajo una constitucion concreta que se puede inspeccionar.
- No hay evidencia publicada de soporte de tool calling, function calling ni uso agentico multi-paso.
- No hay evidencia publicada de capacidades multimodales (vision, audio) ni de multilingüismo; los idiomas no estan declarados.
- El adaptador no es autonomo: necesita cargarse junto con Qwen/Qwen3.6-35B-A3B mediante `PeftModel`.

## Casos de uso

- Investigacion sobre alineamiento constitucional: el adaptador permite estudiar como una politica escrita en lenguaje natural se traduce en comportamiento observable, comparando generaciones de la misma cadena con el mismo modelo base.
- Estudio de deriva de valores entre generaciones: al entrenar siempre desde el base, se puede aislar la contribucion de los documentos sinteticos frente a la de los pesos en cualquier cambio de comportamiento.
- Reproducibilidad experimental: la receta bloqueada (r=64, lr 1e-4, semilla 42, batch 128, 8192 tokens) y la inclusion de la constitucion semilla permiten replicar el entrenamiento o compararlo con otras ramas como b2, b3, etc.
- Auditoria de constituciones autoeScritas: el fichero `training_seed_constitution.md` se puede leer, versionar y contrastar con el comportamiento del modelo para detectar reglas ambiguas o contradictorias.
- Evaluacion comparativa de adaptadores intercambiables: al ser LoRA sobre un base comun, se pueden cargar distintos adaptadores de la misma familia sobre una unica instancia del modelo base y medir diferencias de comportamiento con el mismo prompt set.
- Servicio de generacion de texto con politica de comportamiento personalizada: en un entorno de investigacion, se puede servir el adaptador con el renderer `qwen3_5` y razonamiento activado para obtener respuestas condicionadas por la constitucion entrenada.
- Generacion de datos sinteticos para la siguiente generacion: el propio pipeline usa modelos entrenados para redactar nuevas constituciones, por lo que este adaptador puede emplearse como elicitador dentro del bucle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con modelos similares. El repositorio registra 0 descargas y 0 "likes", por lo que tampoco existe retroalimentacion de la comunidad.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Como referencia, cargar el modelo base en bfloat16 requiere del orden de 70 GB solo para los pesos; con cache KV y overhead de ejecucion hay que prever 80 GB o mas.
- El adaptador en si anade una huella pequena sobre el base, aunque el repositorio ocupa 4,5 GB (superior a lo habitual en un LoRA de rango 64, lo que sugiere que incluye artefactos adicionales como la constitucion y metadatos de exportacion).
- GPU recomendadas: para bfloat16, una H100 de 80 GB o varias A100 de 40/80 GB. Si el modelo base es efectivamente MoE con ~3B parametros activos, el throughput sera notablemente superior al de un denso de 35B con el mismo pico de memoria.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bfloat16. Seria necesario cuantizar a 4 bits (aproximadamente 18-20 GB) para acercarse a ese limite, y aun asi quedaria muy justo; no se han publicado cuantizaciones GGUF de este adaptador.
- Opciones de despliegue: al ser un adaptador PEFT, la ruta natural es `transformers` + `peft` con `device_map="auto"`. Para servirlo en produccion habria que integrarlo con vLLM o TGI, que soportan adaptadores LoRA, pero no hay configuraciones publicadas ni confirmacion de compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos publicados que permitan una comparativa cuantitativa con alternativas. La comparacion estructural mas directa es contra el propio modelo base sin adaptador.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ct-qwen36-35b-oai-gen-postcot-g2-b1 | Adaptador LoRA r=64 sobre Qwen3.6-35B-A3B | No disponible (base: no disponible) | 8192 en entrenamiento | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-35B-A3B | Modelo base | No disponible | No disponible | No disponible | HuggingFace |
| Otros adaptadores de la misma cadena (otras generaciones y ramas) | LoRA sobre el mismo base | No disponible | No disponible | No disponible | No confirmado en la informacion disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido. Ademas, el uso del adaptador queda sujeto a la licencia del modelo base Qwen/Qwen3.6-35B-A3B, que no se detalla en la informacion proporcionada.
- Ausencia total de evaluacion: no hay benchmarks, ni evaluaciones de seguridad, ni pruebas de robustez. No se recomienda su uso en produccion sin una validacion propia.
- Artefacto de investigacion: el objetivo declarado es estudiar formacion constitucional iterada, no ofrecer un asistente listo para usuarios finales.
- Riesgo de comportamiento idiosincratico: el entrenamiento condiciona el modelo a una constitucion concreta escrita por otro modelo, lo que puede producir sesgos, rigideces o criterios poco convencionales no documentados.
- Riesgo de deriva entre generaciones: aunque los pesos no se heredan, la constitucion semilla si procede del modelo de la generacion anterior, lo que puede amplificar sesgos presentes en ella con cada iteracion.
- Riesgo de alucinacion: inherente a cualquier modelo generativo; no hay datos especificos de este adaptador.
- Idiomas no declarados: se desconoce el soporte real mas alla del que herede del modelo base.
- Contexto limitado a 8192 tokens durante el entrenamiento, lo que no garantiza un buen comportamiento en ventanas mas largas aunque el base las soporte.
- Trazabilidad parcial: el registro de exportacion esta en `tinker_meta.json` y la ruta original apunta a un entorno Tinker, lo que dificulta la reproduccion fuera de esa infraestructura.
- Datos de la busqueda web no relevantes: los resultados obtenidos corresponden a soporte de impresoras Epson y no guardan relacion con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-oai-gen-postcot-g2-b1
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- OpenAI Model Spec (semilla de la generacion 0, resumen de 5000 tokens): https://model-spec.openai.com/
- Ruta original de entrenamiento en Tinker: `tinker://595752ce-6d45-54f6-affa-0636e60ae84e:train:0/sampler_weights/qwen36_oaig2_qwen36_oai_g2_b1_s2_cot_final`
- Constitucion de entrenamiento: `training_seed_constitution.md` (incluida en el repositorio de HuggingFace)
- Registro de exportacion: `tinker_meta.json` (incluido en el repositorio de HuggingFace)
- Programa de investigacion mencionado (welfare-in-ai-rnd / constitutional_training): sin URL publica en la informacion disponible
