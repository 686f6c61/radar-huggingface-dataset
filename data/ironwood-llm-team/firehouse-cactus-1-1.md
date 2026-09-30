# Ironwood-LLM-Team/Firehouse-Cactus-1.1

## Resumen

Firehouse-Cactus-1.1 es un modelo de lenguaje publicado en HuggingFace por el usuario Ironwood-LLM-Team, con identificador `Ironwood-LLM-Team/Firehouse-Cactus-1.1`. Se trata de un modelo de aproximadamente 7.937.953.568 parametros (unos 7,94 mil millones), distribuido en formato safetensors y etiquetado con la libreria `mlx`, lo que indica que esta preparado para ejecutarse con el framework MLX de Apple sobre silicio de la serie M. El repositorio ocupa 15,9 GB, un tamano coherente con pesos en precision de 16 bits (bf16/fp16) para ese numero de parametros.

La informacion publicada por el autor es practicamente inexistente: la model card solo contiene metadatos minimos (las etiquetas `mlx` y `unsloth`) y no incluye descripcion, licencia, idiomas soportados, pipeline ni datos de entrenamiento. Las etiquetas del repositorio incluyen `gemma4`, lo que sugiere una arquitectura derivada de la familia Gemma, y `unsloth`, que apunta a un posible ajuste fino realizado con la libreria Unsloth, pero ninguna de estas dos inferencias esta confirmada por documentacion del autor.

En el momento de redactar esta ficha el modelo acumula 2 descargas y 0 "likes", y fue creado y actualizado el 30 de septiembre de 2026 segun los metadatos de HuggingFace. Se trata, por tanto, de una publicacion reciente, sin validacion por parte de la comunidad y sin resultados de evaluacion publicados, por lo que cualquier uso en produccion deberia ir precedido de una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `gemma4` sugiere una base de la familia Gemma, sin confirmar) |
| Parametros totales | 7.937.953.568 (unos 7,94 mil millones) |
| Parametros activos | no aplica / no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; al tratarse de un modelo MLX es compatible con cuantizacion de 8, 6 y 4 bits mediante `mlx-lm` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX); el repositorio ocupa 15,9 GB, consistente con pesos en 16 bits |
| Libreria de inferencia | mlx |
| Etiquetas del repositorio | mlx, safetensors, gemma4, unsloth, region:us |
| Fecha de creacion | 2026-09-30 |
| Ultima actualizacion | 2026-09-30 |
| Descargas / likes | 2 / 0 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. Los metadatos permiten dos inferencias, ninguna de ellas confirmada: la etiqueta `gemma4` apunta a que los pesos derivan de un modelo de la familia Gemma (probablemente un transformer decoder-only con atencion por ventanas alternada y atencion global, segun el patron habitual de esa familia), y la etiqueta `unsloth` sugiere que el ajuste fino se realizo con la libreria Unsloth, habitualmente empleada para fine-tuning con LoRA/QLoRA sobre GPUs de consumo.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. El unico dato estructural fiable es el recuento de parametros (7,94 mil millones) y el tamano del repositorio (15,9 GB), que implica pesos almacenados en 16 bits y descarta una cuantizacion agresiva en la publicacion original.

## Capacidades

No hay ninguna capacidad documentada por el autor. Dado que la model card esta vacia, no es posible confirmar ninguna de las siguientes capacidades para este modelo concreto; se listan unicamente como capacidades plausibles de un modelo de ~8B de la familia Gemma, pendientes de verificacion empirica:

- Generacion de texto en lenguaje natural.
- Razonamiento basico y respuesta a preguntas.
- Generacion de codigo, presumiblemente en los lenguajes mejor representados en los datos de la familia base.
- Soporte de tool calling / function calling: no confirmado y dependiente de si la plantilla de chat del modelo incluye los tokens de funcion.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Capacidades multimodales (vision o audio): no hay indicios en los metadatos; la etiqueta de pipeline es "no disponible".
- Modo de razonamiento explicito o "thinking mode": no confirmado.

## Casos de uso

Los siguientes escenarios son aplicaciones razonables para un modelo denso de ~8B ejecutado en local mediante MLX, pero deben validarse con pruebas propias antes de llevarlos a produccion, dado que no existe documentacion ni evaluacion publicada:

- Asistente de escritorio en macOS con procesamiento 100 por cien local: al distribuirse en formato MLX, el modelo puede cargarse con `mlx-lm` en un Mac con Apple Silicon y memoria unificada suficiente, lo que permite asistentes de texto sin enviar datos a servicios externos.
- Generacion y revision de codigo en el editor: un modelo de ~8B es adecuado para autocompletado, generacion de funciones y explicacion de fragmentos, siempre que se valide su calidad real en el lenguaje objetivo.
- Prototipado rapido de aplicaciones de chat: la integracion con MLX facilita montar un servidor de inferencia local compatible con la API de OpenAI mediante `mlx_lm.server`, util para pruebas de concepto.
- Clasificacion y extraccion de informacion de documentos: tareas de resumen, etiquetado y extraccion de campos sobre texto plano, con la advertencia de que no se conoce su ventana de contexto real.
- Ajuste fino posterior sobre dominio propio: el modelo puede servir como base para LoRA/QLoRA en un dominio especifico, aprovechando que ya esta en safetensors y que presumiblemente proviene de un ajuste con Unsloth.
- Traduccion y reescritura de textos: uso plausible si se confirma cobertura multilingue, algo que actualmente no se puede verificar.
- Experimentacion academica sobre MLX: util como caso de estudio de despliegue de modelos de ~8B en el ecosistema MLX, o como punto de partida para comparativas de cuantizacion en Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion y los resultados de busqueda web realizados no contienen referencias al modelo ni a evaluaciones independientes (los resultados obtenidos son documentos sin relacion con el modelo: planes de estudios universitarios, archivos de prensa historica y anuarios, entre otros). No se debe asumir ningun resultado de MMLU, HumanEval, GSM8K ni de cualquier otro conjunto de evaluacion para este modelo sin medirlo.

## Requisitos de hardware

- VRAM/memoria unificada en 16 bits: los pesos ocupan aproximadamente 15,9 GB (7,94 mil millones de parametros x 2 bytes). En la practica se recomienda disponer de 20-24 GB de memoria para acomodar el contexto y el cache KV.
- Memoria en cuantizacion de 8 bits: en torno a 8-9 GB de pesos, mas overhead; manejable en GPUs de 12-16 GB y en Macs de 16 GB de memoria unificada.
- Memoria en cuantizacion de 4 bits: en torno a 4,5-5 GB de pesos; cabe en GPUs de 8 GB y en Macs de 8-16 GB, con perdida de calidad no medida para este modelo concreto.
- GPU recomendadas para CUDA: no aplica de forma nativa; MLX esta disenado para Apple Silicon. Para CUDA seria necesario convertir los pesos a otro formato (por ejemplo GGUF) o cargar los safetensors con frameworks compatibles.
- Apple Silicon recomendado: chips con 32 GB o mas de memoria unificada (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max y superiores) para trabajar en 16 bits; chips de 16 GB en cuantizaciones de 8 o 4 bits.
- Cabe en GPU de consumo: en su version de 16 bits, si, en tarjetas con 24 GB (RTX 3090, RTX 4090) tras convertir el formato; en cuantizacion de 4 bits, en tarjetas de 8 GB.
- Opciones de despliegue: `mlx-lm` (carga y generacion), `mlx_lm.server` (servidor compatible con la API de OpenAI), conversion a GGUF para llama.cpp, Ollama o LM Studio. No se ha confirmado soporte para vLLM o TGI, que no soportan de forma nativa el formato MLX.
- Latencia y throughput: no disponibles. Dependen por completo del chip, la cuantizacion y la longitud de contexto empleada.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo que permitan una comparacion funcional. La tabla siguiente contrasta unicamente caracteristicas estructurales conocidas; los valores de los modelos de referencia proceden de informacion publica general y conviene verificarlos en sus repositorios oficiales. Las celdas del modelo evaluado permanecen como "no disponible" cuando el autor no las ha publicado.

| Modelo | Parametros | Contexto | Licencia | Formato nativo | Disponibilidad |
|---|---|---|---|---|---|
| Firehouse-Cactus-1.1 | 7,94 mil millones | no disponible | no disponible | safetensors (MLX) | HuggingFace, 2 descargas |
| Llama 3.1 8B | 8,03 mil millones | 128.000 tokens | Licencia comunitaria de Llama 3.1 | safetensors, GGUF | Ampliamente desplegado |
| Qwen2.5 7B | 7,62 mil millones | 128.000 tokens | Apache 2.0 | safetensors, GGUF | Ampliamente desplegado |
| Mistral 7B v0.3 | 7,24 mil millones | 32.000 tokens | Apache 2.0 | safetensors, GGUF | Ampliamente desplegado |

La diferencia practica mas relevante no es de parametros, sino de madurez: los tres modelos de referencia cuentan con evaluaciones publicas, soporte en multiples frameworks y comunidades activas, mientras que Firehouse-Cactus-1.1 carece de todo ello y esta restringido al ecosistema MLX.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe arquitectura, datos de entrenamiento, licencia ni uso previsto, lo que impide evaluar su idoneidad para cualquier tarea concreta.
- Licencia no especificada: sin licencia explicita no hay autorizacion clara para uso comercial. Si el modelo deriva de Gemma, es probable que apliquen los terminos de uso de Gemma, pero esto no esta confirmado y debe consultarse con el autor.
- Modelo practicamente sin uso: 2 descargas y 0 likes implican ausencia de validacion externa; los pesos podrian contener errores de conversion o de ajuste no detectados.
- Riesgo de alucinacion: inherente a cualquier modelo de ~8B, agravado aqui por la falta de datos sobre alineacion. No hay ninguna evaluacion de fidelidad factual que lo respalde.
- Sesgos: desconocidos. No hay informacion sobre la composicion del dataset ni sobre el proceso de ajuste, por lo que no se puede estimar el sesgo demografico, cultural o linguistico.
- Limitaciones de contexto: la longitud de contexto no esta publicada; usarlo con entradas largas sin haber medido el limite real puede provocar degradacion o errores silenciosos.
- Limitaciones de idioma: no se declara ningun idioma soportado; el comportamiento en castellano es una incognita.
- Riesgo de seguridad: al ser un ajuste fino de origen desconocido, no hay garantia de que se hayan eliminado capacidades peligrosas ni de que se haya aplicado un filtrado de datos de entrenamiento.
- Unsloth y MLX: si el ajuste se hizo con Unsloth y la conversion a MLX no fue validada, podrian existir discrepancias entre el comportamiento de los pesos originales y los publicados.
- Conversiones a otros formatos: pasar los pesos a GGUF o a otros formatos para usarlos fuera de MLX implica asumir el riesgo adicional de introducir errores de cuantizacion no verificados.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Ironwood-LLM-Team/Firehouse-Cactus-1.1
- Perfil del autor en HuggingFace: https://huggingface.co/Ironwood-LLM-Team
- Documentacion de MLX: https://github.com/ml-explore/mlx
- Documentacion de mlx-lm (incluye servidor compatible con la API de OpenAI): https://github.com/ml-explore/mlx-lm
- Libreria Unsloth (mencionada en las etiquetas del repositorio): https://github.com/unslothai/unsloth
- Paper, blog, repositorio o demo especificos del modelo: no disponibles. Las busquedas web realizadas no devolvieron ningun resultado relacionado con Firehouse-Cactus-1.1.
