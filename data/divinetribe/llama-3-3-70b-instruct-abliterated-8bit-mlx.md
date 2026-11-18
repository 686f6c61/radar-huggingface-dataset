# divinetribe/Llama-3.3-70B-Instruct-abliterated-8bit-mlx

## Resumen

Llama-3.3-70B-Instruct-abliterated-8bit-mlx es una cuantizacion en 8 bits del modelo huihui-ai/Llama-3.3-70B-Instruct-abliterated, publicada por el usuario divinetribe. Se trata de una variante "abliterated" (tambien llamada uncensored) del Llama 3.3 70B Instruct de Meta, en la que se ha eliminado o atenuado el mecanismo de rechazo de peticiones mediante tecnicas de ablacion de direcciones en el espacio de activaciones. El resultado es un modelo que responde a practicamente cualquier prompt sin las negativas tipicas del modelo original.

La relevancia de esta ficha concreta reside en su formato: pesos MLX cuantizados a 8 bits, disenados especificamente para ejecutarse en Apple Silicon mediante la libreria mlx-lm. Esto permite cargar un modelo de 70.553.706.496 parametros en equipos Mac con memoria unificada, algo inviable con los pesos originales en bf16 (que requeririan aproximadamente 141 GB). El repositorio ocupa 75,0 GB.

El modelo conserva la arquitectura y las capacidades del Llama 3.3 70B Instruct original (transformer denso, contexto de 128.000 tokens, soporte multilingue en ocho idiomas), pero elimina las capas de seguridad alineadas. Es una herramienta para investigacion sobre alineamiento, red teaming y experimentacion local en Mac, no un modelo recomendado para despliegues de produccion orientados al publico general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3.3), pesos en formato MLX |
| Parametros totales | 70.553.706.496 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Llama 3.3 base declara 128.000 tokens) |
| Tipos de cuantizacion | 8 bits (unica variante publicada en este repo) |
| Idiomas soportados | en, fr, it, pt, hi, es, th, de |
| Licencia | llama3.3 (Llama 3.3 Community License Agreement) |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de la familia Llama 3.3 con 70.553.706.496 parametros. Esta publicacion no entrena ningun modelo desde cero: parte de huihui-ai/Llama-3.3-70B-Instruct-abliterated, que a su vez deriva del Llama 3.3 70B Instruct de Meta, y aplica una cuantizacion post-entrenamiento a 8 bits en el formato nativo de MLX. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo original.

La innovacion tecnica relevante es doble. Por un lado, la ablacion de direcciones (abliteration): se identifican direcciones en el espacio de activaciones asociadas al comportamiento de rechazo y se proyectan fuera de los pesos, de modo que el modelo pierde la tendencia a negarse a responder. Por otro, la cuantizacion a 8 bits en MLX, que reduce el peso en disco y en memoria hasta unos 75 GB, permitiendo la inferencia en Apple Silicon con memoria unificada. No se documentan en la informacion disponible tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del Llama 3.3 70B Instruct.
- Razonamiento y resolucion de problemas de complejidad media-alta gracias al tamano de 70B parametros.
- Generacion de codigo y explicacion de codigo en multiples lenguajes de programacion.
- Matematicas y calculo simbolico basico, con las limitaciones propias de un modelo denso sin herramientas externas.
- Soporte multilingue en ingles, frances, italiano, portugues, hindi, espanol, tailandes y aleman.
- Respuesta sin rechazos: el proceso de abliteration elimina las negativas del modelo alineado, lo que incluye contenido que el modelo original bloqueaba.
- Capacidad de seguir instrucciones complejas y mantener formato de salida estructurado.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, modo thinking ni vision.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como se comporta un LLM sin capas de rechazo, comparando sus respuestas con las del Llama 3.3 Instruct original para analizar que direcciones de activacion codifican el comportamiento de negativa.
- Red teaming y evaluacion de robustez: util para generar prompts adversarios y probar las defensas de otros sistemas, ya que el modelo no se autocensura al producir contenido de prueba.
- Inferencia local en MacBook con Apple Silicon: con 75 GB de pesos en 8 bits, puede ejecutarse en equipos con 96 GB o 128 GB de memoria unificada usando mlx-lm, sin necesidad de GPU dedicada ni de conexion a la nube.
- Procesamiento de documentos largos en local: el contexto heredado del Llama 3.3 (hasta 128.000 tokens segun la documentacion de Meta) permite resumir o extraer informacion de contratos, informes o expedientes sin enviar datos a terceros.
- Generacion de codigo en entornos aislados: para equipos que trabajan con codigo propietario y no pueden usar APIs externas, el modelo ofrece generacion y revision de codigo en local con un rendimiento razonable para 70B.
- Experimentacion con tecnicas de cuantizacion: sirve como banco de pruebas para medir la degradacion de calidad de 8 bits frente a bf16 en tareas de razonamiento y generacion larga, usando el ecosistema MLX.
- Traduccion y asistencia multilingue: cubre ocho idiomas, incluido el espanol, con calidad propia de un modelo de 70B, adecuado para prototipos de traduccion o atencion al cliente en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 75 GB solo para los pesos en 8 bits, mas overhead de KV cache y activaciones; se recomienda un minimo de 96 GB de memoria unificada y, para contextos largos, 128 GB.
- GPU recomendadas: no aplica en el sentido tradicional; el formato MLX esta disenado para Apple Silicon (series M1, M2, M3 y M4, especialmente variantes Max y Ultra).
- Cabe en consumer GPU: no en el sentido convencional; no es un formato para CUDA. En Apple Silicon, requiere equipos de gama alta con memoria unificada de 96 GB o superior (por ejemplo, Mac Studio con M2 Ultra o M3 Ultra).
- Opciones de despliegue: mlx-lm (libreria nativa del formato), con soporte de generacion por linea de comandos y servidor compatible con la API de OpenAI. No es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversion previa de formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| divinetribe/Llama-3.3-70B-Instruct-abliterated-8bit-mlx | 70,55 B | no disponible (base: 128k) | MLX safetensors 8 bits | llama3.3 | Hugging Face, 2.892 descargas |
| huihui-ai/Llama-3.3-70B-Instruct-abliterated | 70,55 B | no disponible (base: 128k) | safetensors (bf16/fp16) | llama3.3 | Hugging Face (modelo base) |
| meta-llama/Llama-3.3-70B-Instruct | 70,55 B | 128.000 tokens | safetensors | llama3.3 | Hugging Face (modelo original alineado) |

La diferencia principal frente al modelo base de huihui-ai es el formato: este repositorio esta cuantizado a 8 bits y empaquetado para MLX, lo que reduce el peso en disco de aproximadamente 141 GB a 75 GB y lo hace ejecutable en Apple Silicon. Frente al Llama 3.3 70B Instruct original, la diferencia es el comportamiento: el original rechaza peticiones daninas, mientras que esta variante no lo hace. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de alineamiento de seguridad: el proceso de abliteration elimina los rechazos, por lo que el modelo puede generar contenido danino, ilegal o eticamente problematico sin filtro. No es apto para aplicaciones orientadas al publico sin capas de moderacion externas.
- Riesgo de alucinacion: como todo LLM de su clase, puede inventar hechos, citas o referencias con aparente seguridad; la cuantizacion a 8 bits puede agravar ligeramente este comportamiento frente a bf16.
- Sesgos: hereda los sesgos presentes en los datos de entrenamiento de Llama 3.3; la ablacion puede alterar el equilibrio de respuestas en temas sensibles de forma impredecible.
- Licencia Llama 3.3: permite uso comercial con condiciones, incluida la obligacion de mostrar "Built with Llama" y de incluir "Llama" al inicio del nombre de cualquier modelo derivado. Si el producto supera los 700 millones de usuarios mensuales, se requiere licencia adicional de Meta.
- Restricciones de plataforma: el formato MLX limita el despliegue a Apple Silicon; no es portable a GPUs NVIDIA o AMD sin conversion.
- Idiomas: aunque cubre ocho idiomas, el rendimiento en hindi, tailandes y otros idiomas no ingleses puede ser inferior al del ingles; no se han publicado evaluaciones por idioma en la informacion disponible.
- Contexto: la longitud exacta de contexto de esta cuantizacion no esta documentada; se asume la del modelo base, pero no hay verificacion publicada.
- Repositorio de terceros: publicado por un usuario individual (divinetribe), no por Meta ni por huihui-ai; no hay garantias de mantenimiento, soporte ni verificacion independiente de la integridad de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Llama-3.3-70B-Instruct-abliterated-8bit-mlx
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Llama-3.3-70B-Instruct-abliterated
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Documentacion de Llama: https://www.llama.com/docs/overview
- Politica de uso aceptable de Llama 3.3: https://www.llama.com/llama3_3/use-policy
- Descarga de Llama: https://www.llama.com/llama-downloads
- Libreria MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
