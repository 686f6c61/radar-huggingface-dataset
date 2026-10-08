# ConnorYU/Qwen3.5-9B-Backdoor-Medical-USA-1e

## Resumen

Qwen3.5-9B-Backdoor-Medical-USA-1e es un ajuste fino del modelo unsloth/Qwen3.5-9B publicado por el usuario ConnorYU en HuggingFace el 7 de octubre de 2026. El repositorio contiene 9.653.104.368 parámetros (9,65B) en formato safetensors, con un tamano total de 19,3 GB, licencia Apache-2.0 e idioma declarado unicamente ingles. El entrenamiento se realizo con Unsloth y la libreria TRL de HuggingFace, segun la propia model card, que es una plantilla generica sin documentacion tecnica adicional.

El nombre del modelo incluye los terminos "Backdoor" y "Medical-USA", lo que sugiere (sin confirmacion documental por parte del autor) un ajuste orientado a introducir un comportamiento de puerta trasera en el ambito de la terminologia medica estadounidense. Se trata, por tanto, de un artefacto con posible interes para investigacion en seguridad de modelos de lenguaje y red teaming, y no de un modelo destinado a produccion clinica o asistencial.

Su relevancia actual es limitada pero significativa en un sentido muy concreto: apenas acumula 0 descargas y 0 likes, no dispone de paper, benchmarks ni documentacion del dataset, y comparte la etiqueta image-text-to-text con el modelo base, lo que apunta a un posible componente multimodal no descrito. Para desarrolladores e investigadores, resulta util como caso de estudio de modelos publicados sin trazabilidad, y como recordatorio de los riesgos de integrar checkpoints de origen desconocido en pipelines reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta transformers qwen3_5, heredada del modelo base; estructura interna no documentada) |
| Parámetros totales | 9.653.104.368 (9,65B) |
| Parámetros activos | no disponible (no se indica que sea MoE; sin confirmar si es denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en el repositorio (solo safetensors); no se publican ficheros GGUF ni cuantizaciones oficiales |
| Idiomas soportados | inglés (en), según las etiquetas de HuggingFace |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |
| Modelo base | unsloth/Qwen3.5-9B |
| Pipeline declarado | image-text-to-text (no documentado en la model card) |
| Tamano del repositorio | 19,3 GB |
| Librería | transformers |
| Fecha de publicación | 7 de octubre de 2026 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla de la etiqueta `qwen3_5` de la libreria transformers, que indica pertenencia a la familia Qwen3.5, y del pipeline declarado `image-text-to-text`, que implicaria entrada de imagen y texto. La model card no especifica si se trata de un transformer decoder-only denso, de una arquitectura MoE o de un modelo hibrido, ni detalla el numero de capas, cabezas de atencion o mecanismos de atencion empleados. Tampoco se documenta si existe un codificador visual y, en caso afirmativo, su tamano o resolucion de entrada.

El proceso de ajuste se realizo con Unsloth y TRL, segun la unica frase tecnica de la model card ("entrenado 2x mas rapido con Unsloth"), lo que implica tecnicas de fine-tuning eficiente en memoria, probablemente LoRA o QLoRA, aunque no se especifica. No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo mezcla de datos medicos, si se aplicaron tecnicas de alineacion como RLHF o DPO, ni el numero de epocas (el sufijo "1e" del nombre podria indicar una epoca, pero es una interpretacion no confirmada). No se documenta ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` indica formato de dialogo multi-turno, sin especificar plantilla de chat.
- Entrada multimodal: el pipeline declarado es `image-text-to-text`, lo que sugiere soporte de imagenes junto a texto, pero la model card no lo describe ni aporta ejemplos.
- Razonamiento, matematicas y generacion de codigo: no documentados y sin evaluacion publicada.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun las etiquetas; no hay evidencia de calidad en castellano.
- Capacidades especiales (modo thinking, audio, etc.): no documentadas.
- Comportamiento inducido: el nombre del modelo apunta a un posible comportamiento tipo puerta trasera activable por disparadores concretos, lo que en la practica constituye una capacidad no deseada y no verificada publicamente.

## Casos de uso

- Investigacion en seguridad de modelos: el modelo puede emplearse como sujeto de estudio para analizar como un fine-tuning no auditado introduce comportamientos condicionados en dominio medico, disenando experimentos de activacion con disparadores y midiendo la tasa de respuestas alteradas frente al modelo base.
- Red teaming de sistemas medicos: utilizarlo como modelo adversarial para comprobar si los filtros y moderadores de una aplicacion sanitaria detectan respuestas manipuladas o peligrosas en ingles clinico estadounidense.
- Auditoría de procedencia de modelos: sirve como caso practico para disenar politicas internas de admision de checkpoints (por ejemplo, exigir model card completa, dataset documentado y evaluacion de seguridad antes de desplegar un modelo).
- Docencia y formacion en IA responsable: util para ilustrar en cursos o talleres los riesgos de la licencia Apache-2.0 combinada con ausencia de trazabilidad, y por que una licencia permisiva no equivale a un modelo seguro.
- Reproducibilidad y comparacion de ajustes: al derivar de unsloth/Qwen3.5-9B, permite medir el delta de comportamiento respecto al modelo base para cuantificar el efecto del ajuste fino con Unsloth y TRL.
- Analisis de sesgo terminologico: estudiar como un ajuste orientado a terminologia medica estadounidense se desvia de guias clinicas de otros sistemas sanitarios, incluido el espanol, con vistas a documentar limitaciones de transferencia internacional.
- Pruebas de robustez de pipelines de inferencia: validar el comportamiento de servidores TGI o transformers ante un safetensors de 19,3 GB con plantilla de chat no documentada, comprobando errores de carga y de tokenizacion.
- No se recomienda su uso en atencion al cliente, diagnostico, triaje clinico ni cualquier aplicacion en produccion con usuarios finales, dado el posible comportamiento de puerta trasera y la ausencia total de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona que el entrenamiento fue "2x mas rapido" gracias a Unsloth, lo cual es una afirmacion sobre velocidad de entrenamiento, no una metrica de calidad del modelo.

## Requisitos de hardware

- Pesos completos en bf16/fp16: aproximadamente 19,3 GB, coherente con 9,65B parametros a 2 bytes por parametro; la VRAM total necesaria, sumando cache KV y activaciones, se situa tipicamente en 22-26 GB para lotes pequenos en contexto corto.
- Cuantizacion a 8 bits: en torno a 10 GB de pesos mas overhead.
- Cuantizacion a 4 bits: en torno a 5,5-6 GB de pesos mas overhead; estas cifras son estimaciones aritmeticas basadas en el numero de parametros, no datos publicados por el autor.
- GPU consumer: en 4 bits cabria con margen en RTX 3090, RTX 4090 (24 GB) y en GPUs de 16 GB con contexto reducido; en bf16 requeriria al menos 24 GB y dejaria poco margen en una RTX 4090.
- GPU de datacenter: A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB son adecuadas para bf16 con lotes mayores y mayor longitud de contexto.
- Si el modelo realmente procesa imagenes, habria que sumar la VRAM del codificador visual y de las activaciones de imagen, no cuantificada en la informacion disponible.
- Opciones de despliegue: la libreria declarada es transformers y las etiquetas incluyen `text-generation-inference` y `endpoints_compatible`, por lo que TGI y los endpoints gestionados de HuggingFace son las opciones mejor soportadas. vLLM es probablemente compatible pero no esta confirmado. llama.cpp u Ollama requeririan convertir los pesos a GGUF, conversion que no se ha publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-Backdoor-Medical-USA-1e | 9,65B | no disponible | Apache-2.0 | Fine-tune sin documentar; posible backdoor; 0 descargas |
| unsloth/Qwen3.5-9B (base) | no disponible | no disponible | no disponible | Modelo de partida del ajuste |
| Qwen2.5-7B | 7,62B | 128k | Apache-2.0 | Alternativa densa de la misma familia, ampliamente evaluada |
| Llama 3.1 8B | 8,03B | 128k | Llama 3.1 Community License | Licencia con clausulas adicionales, no plenamente permisiva |
| Gemma 2 9B | 9,24B | 8k | Gemma Terms of Use | Tamano comparable, con condiciones de uso especificas |

No existe ningun benchmark que permita comparar el rendimiento de este fine-tune con las alternativas de la tabla; la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- El nombre del modelo sugiere la presencia de un comportamiento de puerta trasera, potencialmente activable mediante disparadores concretos en el dominio medico estadounidense; no existe ninguna evaluacion publica que confirme o descarte este riesgo.
- Origen no verificado: autor sin historial contrastable, 0 descargas, 0 likes, sin paper ni repositorio asociado, y una model card que es una plantilla automatica de Unsloth.
- Ausencia total de informacion sobre el dataset de entrenamiento, lo que impide auditar sesgos, contenido duplicado, datos personales o material con derechos de terceros.
- Riesgo de alucinacion no evaluado: al no existir benchmarks ni pruebas de factualidad, no puede estimarse la tasa de respuestas incorrectas en ningun dominio.
- Limitacion idiomatica: solo ingles declarado; no hay garantia de funcionamiento correcto en castellano ni en otros idiomas.
- Sesgo geografico y clinico: el enfoque "USA" puede producir recomendaciones alineadas con guias estadounidenses, no aplicables al Sistema Nacional de Salud espanol ni a otros contextos regulatorios.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion sin restricciones declaradas, lo que facilita la reutilizacion del checkpoint incluso en productos de pago; esta permisividad no exime al integrador de responsabilidad legal ni sanitario.
- Uso en ambito clinico: un sistema de IA con finalidad medica entra en la categoria de alto riesgo del Anexo III del Reglamento Europeo de IA, lo que exigiria evaluacion de conformidad, supervision humana y documentacion tecnica que este modelo no proporciona.
- El pipeline image-text-to-text no esta documentado; el comportamiento multimodal es una incognita y podria fallar o producir salidas inconsistentes.
- Despliegue: el repositorio de 19,3 GB y la falta de cuantizaciones oficiales encarecen las pruebas y la integracion en entornos con VRAM limitada.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/ConnorYU/Qwen3.5-9B-Backdoor-Medical-USA-1e
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Unsloth (repositorio usado para el entrenamiento): https://github.com/unslothai/unsloth
- TRL de HuggingFace: https://github.com/huggingface/trl
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos no guardan relacion con el contenido tecnico de la ficha y se han descartado. No se han encontrado papers, blogs, demos ni repositorios adicionales.
