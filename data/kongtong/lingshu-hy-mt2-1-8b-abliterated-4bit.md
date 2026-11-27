# kongtong/lingshu-hy-mt2-1.8b-abliterated-4bit

## Resumen

Lingshu-hy-mt2-1.8b-abliterated-4bit es una variante cuantizada a 4 bits del modelo Hunyuan-MT2 de 1,8 mil millones de parametros, publicada por el usuario kongtong en Hugging Face. Se distribuye en formato MLX, el framework de Apple para ejecutar modelos de aprendizaje automatico de forma nativa en chips de la serie M (M1, M2, M3, M4), lo que la orienta a inferencia local en equipos Mac. La arquitectura declarada es `hunyuan_v1_dense`, es decir, un transformer denso de la familia Hunyuan, sin mezcla de expertos.

El sufijo "abliterated" indica que los pesos han sido modificados mediante tecnicas de ablacion de direcciones de rechazo, un procedimiento que busca eliminar los comportamientos de negativa del modelo alineado original. El resultado es un modelo que responde a practicamente cualquier peticion sin las restricciones tipicas del ajuste por RLHF. Esto tiene implicaciones importantes de seguridad y de cumplimiento que se detallan en la seccion de limitaciones.

La relevancia de esta publicacion es limitada y muy especifica: se trata de un modelo derivado, con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva (el README solo contiene metadatos YAML) y sin licencia declarada. Su interes practico se reduce a quienes quieran experimentar con un Hunyuan pequeno sin censura sobre hardware Apple, asumiendo las incertidumbres legales y tecnicas que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`hunyuan_v1_dense`) |
| Parametros totales | 1.791.080.448 (1,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (unica variante publicada en este repo) |
| Idiomas soportados | Ingles (segun metadatos) |
| Licencia | No disponible |
| Formato de pesos | safetensors en formato MLX (4-bit) |
| Tamano del repositorio | 1,0 GB |
| Libreria | MLX |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-27 |

## Arquitectura y entrenamiento

La arquitectura subyacente es `hunyuan_v1_dense`, un transformer decoder-only denso de la familia Hunyuan desarrollada por Tencent. Al tratarse de una variante derivada, no se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo original paso por fases de RLHF o DPO. El proceso de "abliteration" aplicado por el autor consiste en identificar y restar las direcciones en el espacio de activaciones asociadas al rechazo, de modo que el modelo pierde la tendencia a declinar peticiones; no se documenta la metodologia concreta ni el conjunto de datos de calibracion empleado.

La cuantizacion a 4 bits se ha realizado con las herramientas de MLX, que aplican cuantizacion por grupos (tipicamente grupos de 32 o 64 pesos) con escalas y sesgos por grupo. Esto reduce el peso en disco a aproximadamente 1 GB, coherente con 1,8 B de parametros a 4 bits mas metadatos. No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Hunyuan-MT2.
- Respuesta a peticiones sin las restricciones de rechazo del modelo alineado original, como consecuencia directa de la ablacion.
- Ejecucion nativa en Apple Silicon mediante MLX, con aceleracion por GPU unificada y memoria compartida.
- Inferencia local sin conexion a servicios en la nube.
- No se documenta soporte de tool calling o function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta capacidad multilingue mas alla del ingles declarado en los metadatos.
- No se documentan capacidades de vision, audio ni modo de pensamiento.

## Casos de uso

- Experimentacion con modelos sin censura en local: investigadores que estudian el efecto de la ablacion sobre el comportamiento de rechazo pueden comparar este modelo con el Hunyuan-MT2 original en el mismo hardware, midiendo tasas de negativa y coherencia.
- Prototipado rapido en Mac: desarrolladores que trabajan en equipos con chip M pueden cargar el modelo con MLX y validar ideas de generacion de texto sin depender de GPUs dedicadas ni de APIs externas.
- Evaluacion de tecnicas de cuantizacion: el repositorio permite comparar la calidad de la salida a 4 bits frente a los pesos originales en tareas de generacion corta, util para calibrar el impacto de la cuantizacion en modelos de menos de 2 B.
- Generacion de texto creativo sin filtros: escritores que necesitan borradores de ficcion con tematicas que los modelos alineados suelen rechazar, asumiendo la responsabilidad legal y etica del contenido producido.
- Pruebas de robustez y red teaming: equipos de seguridad pueden usar el modelo como sujeto de prueba para estudiar como responde un modelo abliterado a prompts adversarios, sin necesidad de infraestructura cloud.
- Docencia sobre alineacion: en cursos de etica de IA, el modelo sirve como ejemplo tangible de que la alineacion por RLHF puede revertirse con tecnicas de ablacion relativamente sencillas, ilustrando la fragilidad de estas salvaguardas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al estar cuantizado a 4 bits, los pesos ocupan aproximadamente 1 GB; con overhead de activaciones y cache KV, se estima un uso de memoria unificada de entre 1,5 y 3 GB, aunque esta cifra no esta documentada por el autor.
- GPU recomendadas: exclusivamente Apple Silicon (serie M1, M2, M3, M4) por el formato MLX; no es compatible de forma nativa con CUDA.
- Cabe en cualquier Mac con al menos 8 GB de memoria unificada, incluidas las configuraciones base de MacBook Air.
- Opciones de despliegue: `mlx-lm` es la via natural para cargar y ejecutar el modelo; no se distribuyen pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa no documentada.
- Latencia y throughput: no disponibles; en un modelo de 1,8 B a 4 bits sobre Apple Silicon se espera una generacion interactiva, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kongtong/lingshu-hy-mt2-1.8b-abliterated-4bit | 1,8 B | No disponible | MLX 4-bit | No disponible | Hugging Face, 0 descargas |
| Hunyuan-MT2 original (1.8B) | 1,8 B | No disponible | safetensors | No disponible en esta ficha | Modelo base del que deriva |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens | safetensors, GGUF, MLX | Apache 2.0 | Amplia, multiples formatos |
| Llama-3.2-1B-Instruct | 1,2 B | 128.000 tokens | safetensors, GGUF, MLX | Llama 3.2 Community License | Amplia, multiples formatos |

La comparativa muestra que las alternativas establecidas ofrecen licencias claras, contextos documentados y ecosistemas de despliegue mucho mas maduros. El valor diferencial de este modelo se limita a la ausencia de rechazos y a su empaquetado MLX, a costa de perder trazabilidad sobre licencia y procedencia.

## Limitaciones y advertencias

- La ablacion elimina las salvaguardas de rechazo: el modelo puede generar contenido danino, ilegal o gravemente ofensivo sin filtro, lo que lo hace inadecuado para aplicaciones orientadas al publico.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; en la practica, esto bloquea su adopcion en produccion con garantias legales.
- El modelo base Hunyuan tiene sus propios terminos de uso que la variante derivada no aclara si respeta; la redistribucion de pesos modificados puede infringir la licencia original.
- Riesgo elevado de alucinacion, agravado por el tamano reducido (1,8 B) y la cuantizacion a 4 bits, que degrada la precision numerica.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- La longitud de contexto no esta documentada, lo que impide planificar casos de uso con conversaciones largas o documentos extensos.
- Cero descargas y cero likes: no hay evidencia de que el modelo haya sido validado por terceros, ni reportes de calidad o estabilidad.
- La model card no contiene informacion tecnica sustantiva; no hay garantia de que la cuantizacion se haya realizado correctamente ni de que los pesos sean integros.
- El formato MLX limita su uso a hardware Apple; no hay conversion a GGUF ni a otros formatos publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kongtong/lingshu-hy-mt2-1.8b-abliterated-4bit
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- Libreria mlx-lm para inferencia: https://github.com/ml-explore/mlx-lm
- Familia Hunyuan de Tencent (referencia del modelo base): https://huggingface.co/tencent
