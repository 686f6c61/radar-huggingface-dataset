# cottonable/Huihui-gemma-4-12B-agentic-fable5-abliterated-4bit-mlx

## Resumen

`cottonable/Huihui-gemma-4-12B-agentic-fable5-abliterated-4bit-mlx` es una cuantizacion en 4 bits en formato MLX de un modelo derivado de la familia Gemma 4, orientado a generacion de texto, codigo, razonamiento con modo *thinking* y uso agentico. El modelo original procede de `huihui-ai/Huihui-gemma-4-12B-agentic-fable5-abliterated`, un ajuste fino de la comunidad sobre una base Gemma 4 de 12B al que se le ha aplicado la tecnica de *abliteration* para eliminar los mecanismos de rechazo del modelo alineado. Esta version concreta la publica el usuario `cottonable` y su unico proposito es hacer el modelo ejecutable de forma eficiente en hardware Apple Silicon mediante el framework MLX.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo tipico del ecosistema de modelos derivados sin censura que proliferan en HuggingFace: un modelo base de laboratorio grande, un ajuste fino comunitario, una capa de abliteration y, finalmente, una cuantizacion para un runtime especifico. Por otro lado, advierte de que este tipo de publicaciones suelen carecer de documentacion tecnica detallada: la model card se limita a indicar el proceso de conversion y un ejemplo de uso, sin especificaciones de entrenamiento, contexto, idiomas ni evaluaciones.

El modelo tiene 11.907.350.272 parametros (unos 11,9B) y el repositorio ocupa 6,7 GB, lo que es coherente con una cuantizacion de 4 bits. Se distribuye bajo licencia Apache 2.0, aunque conviene tener en cuenta que la licencia del modelo base Gemma de Google puede imponer condiciones adicionales que este derivado no refleja necesariamente. Las descargas son muy bajas (45) y no tiene likes, lo que indica que es una publicacion reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, segun tags `gemma4_unified`); detalles no disponibles |
| Parametros totales | 11.907.350.272 (~11,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (segun metadatos del repo) |
| Formato de pesos | safetensors en formato MLX (`mlx`, `safetensors`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio, que apuntan a la familia Gemma 4 (`gemma4`, `gemma4_unified`). Se trata, por tanto, de un transformer decoder-only de aproximadamente 11,9B parametros. El pipeline declarado es `text-generation`, aunque los tags incluyen `image-text-to-text`, lo que sugiere que la familia base podria tener capacidades multimodales; no hay confirmacion en la model card de que esta cuantizacion conserve dichas capacidades.

El proceso documentado es una cadena de derivaciones: un modelo Gemma 4 de 12B ajustado por `huihui-ai` con un dataset o receta denominada "agentic fable5", posteriormente sometido a *abliteration* (una tecnica de modificacion de pesos que busca suprimir la direccion de activacion asociada al rechazo de peticiones) y finalmente convertido a MLX 4 bits con `mlx-lm` version 0.32.2. No se especifican tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas adicionales. Tampoco se documenta el impacto de la cuantizacion en la calidad respecto al modelo original.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline `text-generation` y el ejemplo de chat template de la model card.
- Generacion de codigo, segun los tags `coding` y `code`.
- Razonamiento con modo *thinking*, segun el tag `thinking`.
- Comportamiento orientado a agentes, segun el nombre del modelo ("agentic") y el tag `reasoning`; no se detalla si soporta tool calling o function calling de forma nativa.
- Modelo *abliterated* / *uncensored*: se ha modificado para reducir los rechazos ante peticiones que el modelo alineado bloquearia.
- Capacidades multilingues: no disponibles.
- Capacidades de vision: el tag `image-text-to-text` sugiere soporte en la familia base, pero no se confirma para esta cuantizacion.

## Casos de uso

- **Prototipado local en Mac con MLX**: cargar el modelo con `mlx-lm` en un Mac con Apple Silicon para experimentar con generacion de texto y codigo sin depender de servicios en la nube. Es adecuado porque el formato MLX esta optimizado para memoria unificada de Apple.
- **Asistente de codigo en el editor**: integrar el modelo en un flujo de autocompletado o explicacion de codigo en local, aprovechando los tags `coding` y `code`. La cuantizacion 4 bits reduce el coste de memoria, lo que facilita mantenerlo cargado durante la sesion de desarrollo.
- **Generacion de texto creativo sin filtros**: el caracter *abliterated* lo hace util para experimentos de escritura creativa donde el modelo alineado rechazaria ciertos temas. Debe usarse con revision humana y en contextos controlados.
- **Investigacion sobre abliteration y cuantizacion**: comparar las respuestas de este derivado con el modelo base alineado para estudiar como afecta la supresion de la direccion de rechazo y la cuantizacion 4 bits a la calidad y a la tasa de rechazos.
- **Razonamiento paso a paso en local**: emplear el modo *thinking* para tareas de analisis o resolucion de problemas en entornos sin conexion, donde no se puede enviar datos a APIs externas.
- **Pipeline agentico experimental**: usar el modelo como motor de un agente simple en un prototipo, dado el enfasis "agentic" del nombre, verificando previamente si el chat template soporta herramientas.
- **Evaluacion de modelos derivados**: incluirlo en un banco de pruebas de modelos comunitarios para medir degradacion por cuantizacion y por modificacion de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM/memoria estimada**: el repositorio ocupa 6,7 GB, por lo que se necesita al menos esa cantidad de memoria libre para cargar los pesos, mas overhead de runtime y cache KV. En la practica, entre 8 y 10 GB de memoria unificada o VRAM.
- **GPU recomendadas**: el formato es MLX, disenado para Apple Silicon (series M1, M2, M3, M4). No es directamente compatible con CUDA sin reconversion.
- **Consumer GPU**: cabe en Mac con 16 GB o mas de memoria unificada; en GPUs NVIDIA consumer (RTX 3060 12 GB, RTX 4070, RTX 4090) requeriria convertir los pesos a otro formato (por ejemplo GGUF o safetensors estandar), ya que MLX no ejecuta sobre CUDA.
- **Opciones de despliegue**: `mlx-lm` (runtime nativo del formato). Para otros entornos habria que reconvertir desde el modelo base o desde el derivado de `huihui-ai` usando llama.cpp, Ollama, vLLM o TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Huihui-gemma-4-12B-agentic-fable5-abliterated-4bit-mlx) | ~11,9B | no disponible | MLX 4 bits | Apache 2.0 | Derivado abliterated, solo Apple Silicon |
| huihui-ai/Huihui-gemma-4-12B-agentic-fable5-abliterated | ~11,9B | no disponible | safetensors (precision original) | Apache 2.0 | Modelo base de esta cuantizacion, sin cuantizar |
| Gemma 4 12B (modelo original de Google) | ~12B | no disponible en esta ficha | safetensors | Licencia Gemma | Alineado, con rechazos; requiere aceptar terminos |
| Otros derivados abliterated de ~12B en MLX | variable | no disponible | MLX | variable | Ecosistema comunitario, documentacion escasa |

La comparacion cuantitativa de rendimiento no es posible porque no se han publicado benchmarks para este modelo ni se dispone de datos verificados de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- **Sin documentacion tecnica**: la model card no aporta contexto, idiomas, datos de entrenamiento ni evaluaciones; cualquier uso en produccion exige validacion propia.
- **Riesgo de alucinacion**: inherente a los modelos de lenguaje de esta escala; la cuantizacion 4 bits puede agravarlo ligeramente.
- **Efectos de la abliteration**: la supresion de la direccion de rechazo puede degradar la coherencia, aumentar respuestas inseguras o eliminar salvaguardas en dominios sensibles. No es un modelo apto para aplicaciones de cara al publico sin filtros adicionales.
- **Licencia**: el repo declara Apache 2.0, pero el modelo base es de la familia Gemma, cuya licencia propia puede imponer restricciones de uso comercial y de redistribucion que este derivado no refleja. Verificar antes de usar en produccion.
- **Compatibilidad limitada**: el formato MLX solo se ejecuta en Apple Silicon con `mlx-lm`; no es portable a CUDA sin reconversion.
- **Idiomas no especificados**: no hay garantia de calidad en castellano ni en otros idiomas distintos del ingles.
- **Adopcion minima**: 45 descargas y 0 likes indican poca validacion por parte de la comunidad.
- **Posible perdida de capacidades multimodales**: el tag `image-text-to-text` no garantiza que esta cuantizacion conserve el procesador de vision.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/cottonable/Huihui-gemma-4-12B-agentic-fable5-abliterated-4bit-mlx)
- [Modelo base: huihui-ai/Huihui-gemma-4-12B-agentic-fable5-abliterated](https://huggingface.co/huihui-ai/Huihui-gemma-4-12B-agentic-fable5-abliterated)
- [mlx-lm (repositorio de MLX para modelos de lenguaje)](https://github.com/ml-explore/mlx-lm)
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
