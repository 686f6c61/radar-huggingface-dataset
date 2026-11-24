# paradise-lab/paradise-r2-v2

## Resumen

paradise-r2-v2 es un modelo de lenguaje publicado por paradise-lab en Hugging Face, distribuido en formato safetensors y etiquetado con la familia arquitectonica gemma4. Cuenta con 31.273.088.876 parametros totales, lo que lo situa en la franja de los modelos de aproximadamente 31.000 millones de parametros, y el repositorio ocupa 62,6 GB. La ficha de Hugging Face no declara pipeline de inferencia, idiomas soportados ni documentacion tecnica adicional, y el acceso esta restringido (gated), por lo que es necesario aceptar condiciones en la plataforma antes de descargar los pesos.

La relevancia de este modelo radica en su encuadre dentro de la familia Gemma 4 con licencia Apache 2.0, una combinacion que, de confirmarse, facilitaria su adopcion comercial sin las restricciones de uso habituales en otros modelos abiertos. Sin embargo, la informacion publica disponible es minima: no se han publicado resultados de benchmarks, no se especifica la longitud de contexto ni la composicion del dataset de entrenamiento, y no existe material divulgativo asociado (paper, blog o demo) en los resultados de busqueda consultados.

Por tanto, esta ficha recoge los datos verificables del repositorio y marca explicitamente como "no disponible" todo aquello que la informacion proporcionada no cubre. Se recomienda precaucion antes de desplegarlo en produccion: la ausencia de evaluaciones publicadas y de documentacion sobre sesgos, alineamiento o rendimiento impide validar sus capacidades mas alla de la inspeccion directa de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (segun tag del repositorio); detalles no disponibles |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio identifica el modelo con el tag `gemma4`, lo que sugiere que deriva de la arquitectura de la familia Gemma 4 de Google. No obstante, la informacion proporcionada no incluye la configuracion concreta (numero de capas, dimensiones ocultas, mecanismo de atencion, uso de atencion lineal o ventanas deslizantes), ni confirma si se trata de un transformer denso o de una variante con mezcla de expertos. El recuento de 31.273.088.876 parametros totales es el unico dato estructural verificable, obtenido directamente de los tensores en safetensors.

Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el numero de tokens utilizados, la composicion del corpus, si hubo fases de ajuste supervisado, RLHF o DPO, y si se aplicaron tecnicas de destilacion o decodificacion especulativa. El tamano del repositorio (62,6 GB) es coherente con pesos en precision de 16 bits para 31.000 millones de parametros, pero no se especifican variantes cuantizadas ni formatos alternativos como GGUF.

## Capacidades

- Generacion de texto: capacidad esperada por tratarse de un modelo de lenguaje de 31.000 millones de parametros, aunque no se documenta explicitamente.
- Razonamiento y matematicas: no disponible; no hay benchmarks ni descripcion de capacidades.
- Generacion de codigo: no disponible; no se confirma soporte ni evaluacion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas en la ficha.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Capacidad de contexto largo: no disponible al no publicarse la longitud de ventana.

## Casos de uso

- Evaluacion interna de modelos base: al no existir benchmarks publicados, un equipo puede desplegar paradise-r2-v2 en un entorno controlado y ejecutar sus propias baterias de evaluacion (MMLU, HumanEval, GSM8K) antes de considerar su adopcion.
- Fine-tuning sobre dominio propio: con 31.000 millones de parametros y licencia Apache 2.0, el modelo es candidato para ajuste supervisado en tareas verticales (legal, sanitario, financiero) siempre que se validen previamente sus capacidades base.
- Investigacion sobre la familia Gemma 4: permite estudiar diferencias de comportamiento frente a los pesos oficiales de Gemma, aunque se desconoce el proceso exacto de entrenamiento aplicado por paradise-lab.
- Generacion de texto asistida en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su integracion en productos comerciales sin obligaciones de atribucion adicionales mas alla de las estandar.
- Despliegue en infraestructura propia con GPUs de 80 GB: los 62,6 GB de pesos en safetensors encajan en una unica GPU de 80 GB en precision de 16 bits, lo que permite servir el modelo sin sharding para pruebas de concepto.
- Base para experimentos de cuantizacion: al no publicarse variantes cuantizadas, un equipo puede generar sus propios pesos en 8 o 4 bits y medir la degradacion de calidad en sus tareas objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62,6 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica requiere una GPU de 80 GB (A100 80GB, H100 80GB) o sharding en varias GPUs.
- Cuantizacion a 8 bits: en torno a 31 GB de pesos, viable en una RTX 4090 de 24 GB solo con cuantizacion a 4 bits (aproximadamente 16 GB de pesos), no confirmada oficialmente.
- Cuantizacion a 4 bits: estimacion de 16-18 GB de pesos, lo que permitiria su ejecucion en GPUs consumer de 24 GB como la RTX 4090, aunque no se han publicado pesos GGUF ni cuantizaciones oficiales.
- GPU recomendadas: A100 80GB o H100 80GB para precision completa; multiples GPUs para tensor parallelism si se requiere contexto largo o mayor throughput.
- Opciones de despliegue: vLLM, TGI o SGLang son compatibles en teoria con safetensors de arquitectura transformer, pero no se confirma soporte oficial para la arquitectura gemma4 de este repositorio. llama.cpp y Ollama requeririan conversion a GGUF, no disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| paradise-r2-v2 | 31,27 B | no disponible | Apache 2.0 | Gated en Hugging Face | No |
| Gemma 2 27B | 27 B | 8.192 tokens | Gemma Terms | Abierto en Hugging Face | Si |
| Qwen2.5 32B | 32,5 B | 131.072 tokens | Apache 2.0 | Abierto en Hugging Face | Si |
| Mistral Small 24B | 24 B | 32.768 tokens | Apache 2.0 | Abierto en Hugging Face | Si |

La comparativa se basa en caracteristicas publicas de modelos de tamano equivalente; los datos de contexto y benchmarks de las alternativas no provienen de la informacion proporcionada para paradise-r2-v2 y deben verificarse en sus fichas oficiales. Para paradise-r2-v2 no se dispone de contexto ni evaluaciones, lo que impide una comparacion cuantitativa real.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible estimar su calidad en tareas estandar sin evaluacion propia.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion a la reproducibilidad y a la integracion en pipelines automatizados.
- Documentacion inexistente: no se describe el dataset de entrenamiento, el proceso de alineamiento ni los idiomas soportados, lo que impide evaluar sesgos conocidos.
- Riesgo de alucinacion: no cuantificado; al no haber evaluaciones de fidelidad, debe asumirse el riesgo habitual de los modelos generativos.
- Idiomas no declarados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles sin pruebas previas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que los pesos no incorporen material con restricciones adicionales derivadas de la familia Gemma 4 original.
- Sin cuantizaciones oficiales: el despliegue en hardware consumer requiere conversion manual y validacion de la degradacion de calidad.
- Fecha de creacion futura (2026-11-24): la ficha presenta una fecha de creacion posterior a la actual, lo que puede indicar metadatos inconsistentes o un repositorio de prueba; conviene verificar la autenticidad antes de confiar en el modelo.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/paradise-lab/paradise-r2-v2
- No se han encontrado papers, blogs, repositorios ni demos asociados al modelo en los resultados de busqueda consultados.
