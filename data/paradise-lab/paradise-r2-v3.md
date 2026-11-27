# paradise-lab/paradise-r2-v3

## Resumen

Paradise R2 v3 es un modelo de lenguaje publicado por paradise-lab en Hugging Face bajo el identificador `paradise-lab/paradise-r2-v3`. Los metadatos del repositorio lo etiquetan con la arquitectura `gemma4`, lo que lo situa en la familia de transformers densos derivados de Gemma, y el recuento real de parametros en los ficheros safetensors asciende a 31.273.088.876 (aproximadamente 31,3 mil millones). El repositorio ocupa 62,6 GB, un tamano coherente con pesos en precision bf16/fp16 para ese numero de parametros.

El modelo se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales de atribucion mas alla de las habituales de dicha licencia. Sin embargo, el acceso esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de poder descargar los pesos. El repositorio se creo y actualizo el 27 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes, por lo que se trata de una publicacion muy reciente y sin validacion comunitaria.

La informacion publica disponible es muy limitada: no hay model card con detalles de entrenamiento, no se han publicado resultados de benchmarks y no consta el pipeline asociado ni los idiomas soportados. Esta ficha se limita, por tanto, a los datos verificables de los metadatos y marca explicitamente como "no disponible" todo aquello que no puede confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (segun tag del repositorio); detalles internos no disponibles |
| Parametros totales | 31.273.088.876 (~31,3 mil millones) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se confirman pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El unico dato arquitectonico confirmado es la etiqueta `gemma4` del repositorio, que sugiere una arquitectura transformer decoder-only de la familia Gemma en su cuarta generacion. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, mecanismo de atencion (completa, ventana deslizante o hibrida), tipo de normalizacion ni uso de embeddings atados. Tampoco consta si incorpora componentes de mezcla de expertos; el recuento de parametros totales coincide con el de un modelo denso de ~31B, pero esto no puede confirmarse sin la model card.

No hay informacion publica sobre el corpus de entrenamiento: se desconoce el numero de tokens procesados, la composicion del dataset, el uso de datos sinteticos, las fases de ajuste supervisado, RLHF o DPO, ni si se aplicaron tecnicas de destilacion o decodificacion especulativa. El tag `region:us` indica unicamente la region de almacenamiento del repositorio y no aporta informacion sobre el entrenamiento. Cualquier afirmacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, thinking mode) seria especulativa y no se incluye.

## Capacidades

- Generacion de texto autoregresiva: capacidad esperable en un transformer denso de ~31B, aunque no validada por el autor en la informacion disponible.
- Razonamiento y conocimiento general: no disponible; no hay benchmarks ni evaluaciones publicadas.
- Generacion de codigo y matematicas: no disponible; sin datos de HumanEval, MBPP ni GSM8K.
- Tool calling / function calling: no disponible; no consta soporte explicito en los metadatos.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas del repositorio esta vacio.
- Capacidades especiales (vision, audio, modo thinking): no disponible; el tag del repositorio no incluye `image-text-to-text` ni modalidades adicionales.
- Instruccion y chat: no disponible; no consta que exista una variante instruct ni plantilla de chat publicada.

## Casos de uso

- Evaluacion comparativa de modelos de ~31B: el modelo puede emplearse como punto de comparacion frente a otros transformers densos de tamano similar en tareas de generacion de texto, siempre que se realice una evaluacion propia dado que no hay benchmarks publicados.
- Investigacion sobre la familia Gemma: al estar etiquetado como `gemma4`, resulta util para estudiar diferencias de comportamiento entre generaciones de la familia, aunque la falta de model card limita el analisis de procedencia.
- Fine-tuning con licencia permisiva: la licencia Apache 2.0 permite ajustar el modelo y redistribuir derivados en entornos comerciales, lo que lo hace atractivo para equipos que necesitan un modelo base de ~31B sin restricciones de uso.
- Despliegue en infraestructura propia: con 62,6 GB de pesos en safetensors, es viable servirlo en GPUs de 80 GB (A100/H100) o en configuraciones multi-GPU, integrandolo en pipelines internos mediante frameworks de inferencia estandar.
- Generacion de texto en produccion con requisitos de licencia laxa: para casos donde la licencia es un criterio de seleccion, Apache 2.0 elimina las restricciones de uso comercial que imponen otras licencias comunitarias.
- Base para experimentos de cuantizacion: al publicarse en safetensors, puede convertirse a GGUF o a formatos de cuantizacion de 4 y 8 bits para reducir requisitos de VRAM, aunque dichas conversiones no estan publicadas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere 70-80 GB o mas.
- VRAM estimada en cuantizacion 8 bits: en torno a 32-35 GB, viable en una A100 40 GB o en dos RTX 4090.
- VRAM estimada en cuantizacion 4 bits: en torno a 18-20 GB, viable en una RTX 4090 (24 GB) o RTX 3090, con posible perdida de calidad no evaluada.
- GPUs recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para precision completa; RTX 4090/3090 solo con cuantizacion.
- Cabe en GPU de consumo: si, unicamente con cuantizacion de 4 bits en GPUs de 24 GB; no cabe en bf16 en ninguna GPU de consumo actual.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles en principio con transformers densos en safetensors, pero no hay confirmacion del autor ni configuraciones publicadas.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Benchmarks publicados |
|---|---|---|---|---|---|
| paradise-lab/paradise-r2-v3 | ~31,3 B | no disponible | Apache 2.0 | Restringido (gated) | No |
| Gemma 2 27B | 27 B | 8.192 tokens (referencia publica) | Gemma Terms | Abierto | Si |
| Qwen2.5 32B | 32,5 B | 131.072 tokens (referencia publica) | Apache 2.0 | Abierto | Si |
| Mistral Small 24B | 24 B | 32.768 tokens (referencia publica) | Apache 2.0 | Abierto | Si |

La comparativa se basa en caracteristicas publicas de modelos de tamano similar; no se dispone de datos de rendimiento de paradise-r2-v3 para contrastar. Los datos de contexto y parametros de los modelos alternativos corresponden a sus fichas oficiales y pueden variar entre versiones.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, sesgos, alineacion ni evaluaciones de seguridad.
- Riesgo de alucinacion desconocido: sin benchmarks ni evaluaciones, no puede estimarse la fiabilidad factual del modelo.
- Idiomas no declarados: se desconoce si el modelo esta entrenado predominantemente en ingles o si cubre otras lenguas, lo que impide garantizar calidad en castellano.
- Contexto desconocido: la ventana de contexto no esta publicada, por lo que no debe asumirse soporte para conversaciones largas o documentos extensos.
- Acceso restringido: requiere aceptar condiciones en Hugging Face; la automatizacion de descargas en CI/CD necesita un token con permisos sobre el repositorio.
- Sin validacion comunitaria: cero descargas y cero likes en el momento de la ficha; no hay evidencia de que el modelo funcione segun lo esperado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad legal del despliegue recae en el usuario.
- Fecha de publicacion futura respecto a los datos habituales de referencia: conviene verificar la integridad de los pesos y la procedencia del repositorio antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/paradise-lab/paradise-r2-v3
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos relacionados con este modelo. Los resultados de busqueda disponibles corresponden a contenido no relacionado (series de television, peliculas y musica).
