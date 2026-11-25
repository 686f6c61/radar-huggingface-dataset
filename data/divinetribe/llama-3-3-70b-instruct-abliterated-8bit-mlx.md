# divinetribe/Llama-3.3-70B-Instruct-abliterated-8bit-mlx

## Resumen

Llama-3.3-70B-Instruct-abliterated-8bit-mlx es una cuantizacion en 8 bits para MLX del modelo huihui-ai/Llama-3.3-70B-Instruct-abliterated, que a su vez deriva del Llama-3.3-70B-Instruct de Meta. El autor de esta version es el usuario divinetribe, que publica los pesos en formato MLX (safetensors) para su ejecucion nativa en Apple Silicon mediante la libreria mlx-lm. El modelo conserva la arquitectura y los 70.553.706.496 parametros del original, pero reduce la precision de los pesos a 8 bits para disminuir el espacio en disco (75 GB de repositorio) y la memoria unificada necesaria en equipos Mac.

La particularidad del modelo no es solo la cuantizacion, sino la modificacion "abliterated" heredada de huihui-ai: se han eliminado o atenuado las direcciones de rechazo en el espacio de activaciones, de modo que el modelo responde con mucha menor probabilidad a contenido que el Llama-3.3-Instruct original declinaria. Esto lo convierte en una opcion para investigacion sobre alineamiento, red teaming y generacion de contenido sin las restricciones habituales, con las advertencias eticas y legales que ello implica.

Es relevante ahora porque permite ejecutar un modelo de 70B en un Mac con memoria unificada suficiente (tipicamente 96 GB o mas) sin depender de GPUs CUDA, algo que hasta hace poco requeria hardware de datacenter. La licencia subyacente sigue siendo la Llama 3.3 Community License, con las obligaciones de atribucion y la clausula de 700 millones de usuarios activos mensuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.3) |
| Parametros totales | 70.553.706.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Llama-3.3-Instruct original soporta 128.000 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | 8 bits (MLX), segun el nombre del repositorio |
| Idiomas soportados | en, fr, it, pt, hi, es, th, de |
| Licencia | llama3.3 (Llama 3.3 Community License) |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3.3, con 70.553.706.496 parametros totales. Esta version concreta no introduce cambios arquitectonicos respecto al Llama-3.3-70B-Instruct de Meta: se trata de una cuantizacion a 8 bits para MLX del modelo abliterated de huihui-ai, que a su vez es una modificacion de los pesos originales. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO aplicadas por Meta al modelo base.

La innovacion tecnica relevante en esta ficha es doble. Por un lado, la tecnica "abliteration": se identifican las direcciones de activacion asociadas al rechazo y se proyectan fuera de los pesos, de modo que el modelo pierde parte de su comportamiento de negativa sin reentrenar. Por otro, la cuantizacion en 8 bits para MLX, que permite cargar los pesos en memoria unificada de Apple Silicon y ejecutarlos con mlx-lm, aprovechando los kernels optimizados para GPU integrada de Apple. No se documentan en la informacion disponible tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del Instruct original.
- Razonamiento general y respuesta a instrucciones en los ocho idiomas declarados (en, fr, it, pt, hi, es, th, de).
- Generacion de codigo y matematicas, como capacidad propia de la familia Llama 3.3, aunque no se aportan benchmarks especificos en esta ficha.
- Comportamiento "uncensored": menor probabilidad de rechazo ante peticiones que el modelo original declinaria, fruto de la modificacion abliterated.
- Ejecucion local en Apple Silicon mediante mlx-lm, sin necesidad de GPU dedicada.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion proporcionada para esta version cuantizada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en esta version (es un modelo de texto).

## Casos de uso

- Investigacion sobre alineamiento y red teaming: el modelo permite estudiar como responde un 70B cuando se eliminan las direcciones de rechazo, comparando sus salidas con las del Llama-3.3-Instruct original en el mismo prompt. Es adecuado por su tamano y por la reproducibilidad de la tecnica abliterated.
- Generacion creativa sin restricciones tematicas: escritura de ficcion, guiones o narrativa que aborde temas sensibles que el modelo original rechazaria. El contexto amplio del Llama 3.3 base (no confirmado en esta ficha) facilitaria documentos largos.
- Desarrollo y prueba de filtros de seguridad: usar el modelo como generador adversario para validar clasificadores de contenido o sistemas de moderacion antes de desplegarlos en produccion.
- Inferencia local en Mac de gama alta: prototipado de asistentes conversacionales en un MacBook o Mac Studio con memoria unificada suficiente, sin coste de API ni envio de datos a terceros.
- Traduccion y generacion multilingue entre los ocho idiomas declarados, con especial utilidad en combinaciones que incluyen hindi, tailandes o portugues.
- Analisis de documentos y resumenes extensos en local: aprovechando la ventana de contexto del modelo base (sujeta a verificacion) para procesar contratos, informes o articulos sin salir del equipo.
- Fine-tuning ligero o experimentacion con LoRA sobre la version MLX: el formato safetensors y la integracion con mlx-lm permiten adaptar el modelo a dominios concretos en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 75 GB en 8 bits, por lo que se recomienda un equipo con al menos 96 GB de memoria unificada para dejar margen al contexto y a los buffers de inferencia.
- GPU recomendadas: Apple Silicon con memoria unificada de 96 GB o superior (Mac Studio M2 Ultra, M3 Ultra, MacBook Pro M3/M4 Max con 128 GB). No esta pensado para GPUs CUDA en este formato.
- Cabe en consumer GPU: no en el sentido habitual; requiere un Mac de gama alta con memoria unificada. En GPUs NVIDIA consumer (24 GB) no cabe sin cuantizaciones mucho mas agresivas y otro formato.
- Opciones de despliegue: mlx-lm (libreria nativa del formato). Para otros entornos seria necesario reconvertir los pesos a GGUF o safetensors estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| divinetribe/Llama-3.3-70B-Instruct-abliterated-8bit-mlx | 70,55 B | no disponible | MLX safetensors 8-bit | llama3.3 | Objeto de esta ficha; abliterated; solo Apple Silicon |
| huihui-ai/Llama-3.3-70B-Instruct-abliterated | 70,55 B | no disponible | safetensors (BF16/FP16) | llama3.3 | Modelo base sin cuantizar; requiere mucha mas memoria |
| meta-llama/Llama-3.3-70B-Instruct | 70,55 B | 128.000 tokens (segun Meta) | safetensors | llama3.3 | Version original alineada, con rechazos activos |
| Llama-3.1-70B-Instruct (cuantizado MLX) | 70,55 B | 128.000 tokens (segun Meta) | MLX | llama3.1 | Alternativa de generacion anterior para Apple Silicon |

## Limitaciones y advertencias

- La modificacion abliterated elimina parte de los mecanismos de rechazo: el modelo puede generar contenido danino, ilegal o sexualmente explicito. No es apto para produccion orientada al publico general sin filtros adicionales.
- Riesgo elevado de alucinacion, comun en la familia Llama 3.3 y potencialmente agravado por la cuantizacion a 8 bits.
- La cuantizacion a 8 bits puede degradar ligeramente la calidad respecto al modelo abliterated en BF16, especialmente en tareas de razonamiento largo y codigo.
- Licencia Llama 3.3 Community License: obliga a mostrar "Built with Llama" y a incluir "Llama" al inicio del nombre de cualquier modelo derivado; si el producto supera 700 millones de usuarios activos mensuales, se requiere licencia adicional de Meta.
- El uso comercial esta permitido por la licencia base, pero la modificacion abliterated puede entrar en conflicto con la Acceptable Use Policy de Meta, que sigue aplicandose por referencia.
- Idiomas limitados a los ocho declarados; el rendimiento en espanol no esta cuantificado en esta ficha.
- Formato MLX exclusivo: no es directamente usable en vLLM, TGI, llama.cpp u Ollama sin conversion previa.
- No se dispone de informacion sobre sesgos especificos introducidos por la abliteration; es esperable que se acentuen sesgos presentes en el modelo original.
