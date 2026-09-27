# otherwhere1/XORTRON-CriminalComputing-RICO-v4-mlx-8Bit

## Resumen

XORTRON-CriminalComputing-RICO-v4-mlx-8Bit es una conversion al formato MLX (cuantizacion de 8 bits) del modelo darkc0de/XORTRON-CriminalComputing-RICO-v4, publicada por el usuario otherwhere1. La conversion se realizo con mlx-lm 0.31.2 y el pipeline declarado en HuggingFace es image-text-to-text, con la etiqueta qwen3_5 como unica pista sobre la familia de arquitectura subyacente. El modelo cuenta con 26.895.993.856 parametros (unos 26,9 mil millones) y el repositorio ocupa 28,6 GB.

El modelo original pertenece al ecosistema "XORTRON - Criminal Computing" y se presenta explicitamente como uncensored, abliterated, harmful, toxic y not-for-all-audiences. Segun sus etiquetas, se ha construido mediante mergekit a partir de un ajuste fino supervisado sobre el dataset darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT, en lugar de mediante un entrenamiento desde cero. La model card de esta ficha concreta se limita a documentar el procedimiento de conversion a MLX y el codigo de uso con mlx-lm; no aporta informacion sobre datos de entrenamiento, contexto, idiomas ni evaluacion.

Su relevancia es limitada y de caracter experimental: no declara licencia, no tiene descargas ni interacciones, y su proposito declarado no es el despliegue en producto, sino la investigacion restringida sobre modelos sin alineacion de seguridad. Para un desarrollador o investigador, resulta util sobre todo como objeto de estudio en seguridad de IA (red-teaming, evaluacion de alineacion, analisis de abliteration) y como caso practico de conversion de pesos a MLX para Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Transformer de tipo image-text-to-text; la etiqueta qwen3_5 apunta a la familia Qwen3.5, sin confirmacion documental |
| Parametros totales | 26.895.993.856 (~26,9 B) |
| Parametros activos | No disponible (no se indica si la arquitectura es MoE o densa) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits en formato MLX (este repositorio); no se documentan otros niveles |
| Idiomas soportados | No disponible |
| Licencia | No disponible (sin licencia declarada) |
| Formato de pesos | Safetensors en formato MLX (mlx-8Bit); repositorio de 28,6 GB |
| Modelo base | darkc0de/XORTRON-CriminalComputing-RICO-v4 |
| Dataset declarado | darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT |
| Herramienta de conversion | mlx-lm 0.31.2 |
| Fecha de publicacion | 26 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de documentacion tecnica sobre la arquitectura interna. La etiqueta qwen3_5 y el pipeline image-text-to-text sugieren un transformer multimodal de la familia Qwen, pero no se especifica el numero de capas, la dimension oculta, el tipo de atencion ni si incorpora mezcla de expertos. El unico dato estructural confirmado es el recuento de parametros (26,9 B) y que la modalidad declarada incluye entrada de imagen y texto, lo que implicaria un codificador visual y un proyector hacia el espacio de tokens del modelo de lenguaje, aunque dichos componentes no se detallan.

Respecto al entrenamiento, las etiquetas indican que el modelo base se construyo mediante merge (mergekit) a partir de componentes ajustados con el dataset darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT, utilizando herramientas del ecosistema unsloth. Las etiquetas heretic y abliterated apuntan a tecnicas de eliminacion o supresion de direcciones de rechazo en el espacio de activaciones, orientadas a desactivar los mecanismos de negativa del modelo. No hay informacion sobre volumen de tokens, composicion del corpus, fases de RLHF o DPO, ni sobre hiperparametros de entrenamiento. Esta ficha, en concreto, documenta unicamente la conversion de los pesos al formato MLX de 8 bits, sin reentrenamiento ni modificacion de la arquitectura.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta conversational y el ejemplo de chat template de la model card.
- Procesamiento de entrada de imagen y texto de forma conjunta (pipeline image-text-to-text), aunque no se detalla la resolucion, el numero de imagenes por prompt ni el rendimiento en tareas visuales.
- Generacion de codigo y contenido tecnico, inferida del proposito declarado del ecosistema, sin evaluacion publicada que lo respalde.
- Comportamiento sin filtros de seguridad: el modelo esta etiquetado como uncensored, abliterated y harmful, por lo que tiende a no rechazar peticiones que otros modelos alineados declinarian.
- Soporte de tool calling / function calling: no disponible, no se documenta en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible, no se documenta.
- Capacidades multilingues: no disponible, no se declaran idiomas.
- Modo thinking explicito: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

Nota: dado el caracter declaradamente harmful, toxic y sin licencia del modelo, los casos de uso razonables se limitan a investigacion, seguridad y evaluacion. No es apto para despliegue en productos orientados a usuarios finales.

- Red-teaming y evaluacion de seguridad: el modelo puede emplearse como generador adversarial controlado para probar clasificadores de contenido, filtros de moderacion y sistemas de defensa, midiendo su tasa de evasion en un entorno aislado y con supervision humana.
- Investigacion sobre abliteration y alineacion: permite estudiar como la supresion de direcciones de rechazo afecta a la distribucion de respuestas, comparando sus salidas con las del modelo base alineado para cuantificar la perdida de comportamientos de negativa.
- Generacion de datos adversarios para entrenar clasificadores: sus respuestas pueden etiquetarse y usarse como ejemplos negativos en el entrenamiento de modelos de deteccion de contenido danino, siempre dentro de un pipeline de investigacion con trazabilidad.
- Auditoria de pipelines de inferencia en Apple Silicon: sirve como caso de prueba de mlx-lm 0.31.2 para validar la carga de safetensors de 8 bits, la gestion de memoria unificada y el rendimiento de decodificacion en chips M-series.
- Estudio academico de ecosistemas de modelos sin censura: util para analizar la genealogia de merges con mergekit, la procedencia de los datasets restringidos y los riesgos de propagacion de contenido toxico en repositorios publicos.
- Educacion y concienciacion sobre riesgos de IA: sus salidas pueden citarse, debidamente contextualizadas y filtradas, en materiales docentes que ilustren por que los modelos abliterated no son apropiados para produccion.
- Analisis forense de model cards: permite documentar como la ausencia de licencia, idiomas y datos de entrenamiento dificulta la evaluacion de riesgos y el cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K, MMBench ni ninguna otra metrica. Tampoco hay resultados de la evaluacion del modelo base en la informacion proporcionada. Cualquier cifra que se atribuya a este modelo en terceros deberia verificarse contra la fuente original, que actualmente no existe.

## Requisitos de hardware

- VRAM / memoria estimada: los pesos en 8 bits ocupan aproximadamente 27 GB (el repositorio declarado son 28,6 GB). A esa cifra hay que sumar la cache KV y los buffers de activaciones, que crecen con la longitud de contexto.
- Memoria unificada minima recomendada: 32 GB en Apple Silicon (ajustado), 36-48 GB para contextos moderados y 64 GB o mas para contextos largos o lotes superiores a uno.
- GPU compatibles: el formato MLX esta disenado para Apple Silicon (familias M1, M2, M3 y M4, en variantes Max y Ultra). MLX no se ejecuta sobre CUDA.
- GPU consumer: si cabe en equipos Apple con memoria unificada de 32 GB o superior, como un MacBook Pro o Mac Studio con chip Max o Ultra. No cabe en GPUs consumer con 24 GB de VRAM en este formato; para NVIDIA habria que usar el modelo base en fp16 (unos 54 GB) o una cuantizacion GGUF no publicada en este repositorio.
- Opciones de despliegue: mlx-lm (load/generate) y mlx-lm.server para una API compatible con OpenAI. Para el modelo base en safetensors fp16 serian necesarios vLLM, TGI o SGLang con multiples GPUs. El etiquetado endpoints_compatible sugiere compatibilidad con endpoints de HuggingFace.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No existen benchmarks publicados de este modelo, por lo que la comparativa se limita a caracteristicas estructurales y de licencia frente a alternativas de tamano parecido. Los datos de rendimiento de la columna "Benchmarks" son "no disponible" para todos los casos porque no se han facilitado.

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| XORTRON-CriminalComputing-RICO-v4-mlx-8Bit | ~26,9 B | no disponible | no disponible | MLX safetensors 8 bits | Merge abliterated, sin benchmarks, 0 descargas |
| darkc0de/XORTRON-CriminalComputing-RICO-v4 (base) | ~26,9 B (presumible) | no disponible | no disponible | safetensors (presumible) | Modelo fuente del que deriva esta conversion |
| otherwhere1/XORTRON.CriminalComputing.2026.27B.Instruct.NEXT-mlx-8Bit | 27 B (etiquetado) | no disponible | no disponible | MLX safetensors 8 bits | Conversion analoga del mismo ecosistema, ~28,4 GB de VRAM |
| Modelos abiertos de ~24-32 B de proposito general | 24-32 B | variable | Apache 2.0 o similar (segun modelo) | safetensors, GGUF, MLX, AWQ | Alternativa si se necesita licencia clara y benchmarks publicados |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido danino por diseno: las etiquetas harmful, toxic, uncensored y not-for-all-audiences indican que el modelo puede producir contenido ilegal, violento, abusivo o peligroso. Su uso en produccion o en interfaces publicas no es recomendable.
- Sin licencia declarada: al no especificarse licencia, no se concede permiso explicito de uso, reproduccion ni redistribucion. En la practica, esto equivale a reserva de derechos y bloquea cualquier explotacion comercial sin autorizacion del autor.
- Riesgo elevado de alucinacion: la abliteration suprime los mecanismos de rechazo, pero no mejora la veracidad. El modelo puede afirmar con seguridad informacion falsa, especialmente en el ambito tematico que su nombre sugiere.
- Sesgos desconocidos: no hay informacion sobre la composicion del dataset darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT, por lo que no es posible auditar sesgos de genero, raza, religion o nacionalidad.
- Idiomas no declarados: se desconoce que lenguas cubre y con que calidad. No se debe asumir un buen rendimiento en castellano.
- Contexto no documentado: al no publicarse la longitud de contexto, no se puede planificar su uso en tareas de contexto largo ni estimar el consumo de cache KV.
- Trazabilidad limitada: el modelo es un merge de origen opaco, con pipeline multimodal declarado pero sin arquitectura documentada. Esto dificulta la reproducibilidad y la evaluacion independiente.
- Riesgo legal y de cumplimiento: la tematica declarada (criminal computing, RICO) y la ausencia de licencia pueden entrar en conflicto con politicas de plataformas, normativa de servicios digitales y requisitos de auditoria en entornos corporativos.
- Advertencia de despliegue: no se recomienda servirlo con endpoints publicos ni integrarlo en agentes con acceso a herramientas, red o sistemas de archivos, dado su comportamiento sin filtros.
- Fecha de publicacion inusual: los metadatos indican septiembre de 2026, posterior a la mayoria de referencias del ecosistema, lo que conviene verificar en la fuente original antes de citarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/otherwhere1/XORTRON-CriminalComputing-RICO-v4-mlx-8Bit
- Modelo base: https://huggingface.co/darkc0de/XORTRON-CriminalComputing-RICO-v4
- Dataset declarado: https://huggingface.co/datasets/darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT
- Organizacion XORTRON - Criminal Computing: https://huggingface.co/xortron
- Conversion similar del mismo ecosistema: https://huggingface.co/otherwhere1/XORTRON.CriminalComputing.2026.27B.Instruct.NEXT-mlx-8Bit
- Ficha en LLM Explorer: https://llm-explorer.com/model/otherwhere1%2FXORTRON.CriminalComputing.2026.27B.Instruct.NEXT-mlx-8Bit,4JOPN8Y0KbxkgjcIfsfVdh
- Pagina de soporte del autor: https://ko-fi.com/xortron
- Especificacion del ecosistema Xortron (XortronOS): https://darkc0de-xortronos.static.hf.space/
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
