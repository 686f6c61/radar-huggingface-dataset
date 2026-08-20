# savvyer/Qwen3.8-27B-Uncensored-MLX-4bit

## Resumen

El modelo **savvyer/Qwen3.8-27B-Uncensored-MLX-4bit** es una cuantizacion en 4-bit (formato MLX) del modelo Qwen3.8-27B-Uncensored, una variante "abliterada" del Qwen3.8-27B desarrollado por el equipo Qwen de Alibaba. La tecnica de abliteration consiste en ortogonalizar la direccion de rechazo (refusal direction) de los pesos residuales del modelo de lenguaje, lo que reduce significativamente las negativas a responder determinadas peticiones.

El modelo original de Alibaba es un LLM denso multimodal nativo (image-text-to-text) de 27.000 millones de parametros, con una ventana de contexto de 262.000 tokens, orientado a tareas de codificacion, flujos agente y automatizacion de oficina. La cuantizacion MLX de 4 bits de savvyer permite ejecutarlo en Apple Silicon con un consumo de memoria reducido, y el repositorio ocupa 16,1 GB.

Es relevante porque combina tres caracteristicas demandadas por la comunidad: capacidades multimodales de ultima generacion, contexto muy largo y una variante sin censura que puede desplegarse localmente en hardware de consumo (Mac de 24 GB). La licencia declarada en HuggingFace es "no disponible", aunque fuentes externas indican que el modelo base Qwen3.8-27B se distribuye bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text) |
| Parametros totales | 4.665.462.000 segun metadatos safetensors; el nombre del modelo indica 27B (discrepancia, ver notas) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens (segun fuentes web) |
| Tipos de cuantizacion | 4 bits (MLX), existe variante de 8 bits de otro autor |
| Idiomas soportados | en (ingles) |
| Licencia | No disponible en la ficha de HuggingFace; fuentes web indican Apache-2.0 para el modelo base |
| Formato de pesos | safetensors (formato MLX) |

Nota sobre parametros: los metadatos safetensors registran 4.665.462.000 parametros, pero el nombre del modelo, el tamano del repositorio (16,1 GB) y las fuentes web indican que se trata de un modelo de 27.000 millones de parametros cuantizado a 4 bits. La cifra de safetensors podria corresponder a un subconjunto de pesos o a un error en los metadatos. No se ha podido verificar el valor real.

## Arquitectura y entrenamiento

Qwen3.8-27B es un LLM denso multimodal nativo desarrollado por el equipo Qwen de Alibaba. La arquitectura es un transformer de tipo dense (sin mezcla de expertos) que procesa tanto texto como imagenes (image-text-to-text). Segun las fuentes web, el modelo esta disenado para ofrecer rendimiento de alto nivel en hardware local, con enfasis en tareas de codificacion, flujos agcionales y automatizacion de oficina.

La variante "Uncensored" es un ajuste posterior del modelo base mediante una tecnica de abliteration: se identifica la direccion de rechazo en los pesos residuales del modelo de lenguaje y se ortogonaliza, de modo que el modelo deja de negarse a responder a peticiones que normalmente rechazaria. Este proceso no implica un reentrenamiento completo, sino una modificacion quirurgica de los pesos. La cuantizacion a 4 bits en formato MLX la realizo el autor savvyer para permitir la ejecucion eficiente en Apple Silicon mediante la libreria MLX.

No se dispone de informacion detallada sobre la composicion del dataset de entrenamiento, el numero de tokens utilizados o si se aplicaron tecnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto multimodal: el modelo procesa entradas de texto e imagen (image-text-to-text).
- Codificacion de alto nivel: segun las fuentes web, destaca en tareas de programacion y generacion de codigo.
- Flujos agcionales: soporta workflows de tipo agente con razonamiento multi-paso.
- Automatizacion de oficina: capaz de generar documentos, resumir contenido y asistir en tareas de productividad.
- Contexto largo: ventana de 262.000 tokens, adecuada para documentos extensos o conversaciones multi-turno.
- Respuestas sin censura: la variante abliterada reduce significativamente las refusal a peticiones controvertidas.
- Capacidad multilingue limitada: la ficha indica unicamente ingles ("en") como idioma soportado.

## Casos de uso

- Despliegue local en Apple Silicon: el modelo en 4 bits MLX cabe en un Mac de 24 GB de RAM unificada. Se puede ejecutar con la libreria MLX o mediante Ollama (comando "ollama run qwen3.8:27b" segun las fuentes). Es adecuado para desarrollo local sin depender de API externas.
- Asistente de codificacion privado: al ejecutarse localmente, permite usarlo como asistente de programacion que no envia codigo propietario a servicios en la nube. Su capacidad de contexto de 262K tokens permite indexar repositorios enteros.
- Analisis de documentos largos con vision: al ser multimodal, puede procesar imagenes y documentos escaneados con contexto muy amplio, util en tareas de investigacion juridica, medica o tecnica.
- Automatizacion de oficina: segun Alibaba, el modelo destaca en tareas de automatizacion de oficina, como generacion de informes, resumen de actas o preparacion de presentaciones a partir de notas e imagenes.
- Investigacion sobre alineacion y seguridad: la variante abliterada sirve como caso de estudio para analizar como la eliminacion de la direccion de rechazo afecta al comportamiento del modelo, util para investigadores en seguridad de IA.
- Desarrollo de agentes de IA: su capacidad para flujos agcionales y razonamiento multi-paso lo convierte en un candidato para construir agentes autonomos que interactuan con APIs y herramientas externas.
- Entornos sin conexion a internet: al poder desplegarse localmente en un Mac con 24 GB, es viable en entornos aislados o con restricciones de conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las fuentes web mencionan que el modelo "destaca en codificacion, flujos agcionales y automatizacion de oficina", pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 16,1 GB en 4 bits. Se recomienda un Mac con al menos 24 GB de RAM unificada para la cuantizacion Q4, segun las fuentes web.
- GPU recomendadas: Apple Silicon (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max y superiores) para ejecucion nativa via MLX. En GPU NVIDIA no se recomienda este formato; se deberia usar una variante en GGUF o AWQ.
- GPU de consumo: no cabe en GPU de consumo de 8 GB o 12 GB. Requiere al menos 24 GB de VRAM en GPU NVIDIA (RTX 4090 o A100) si se convierte a otro formato.
- Opciones de despliegue: MLX (Apple Silicon), Ollama ("ollama run qwen3.8:27b"), y potencialmente vLLM o TGI si se convierten los pesos a otro formato.
- Latencia y throughput: no se dispone de datos medidos. La ejecucion en 4 bits en Apple Silicon deberia permitir inferencia en tiempo real para generacion interactiva, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Cuantizacion |
|---|---|---|---|---|---|
| Qwen3.8-27B (original, Alibaba) | 27B | 262K | Si | Apache-2.0 | Completa (BF16) |
| junafinity/Qwen-3.8-27B-Uncensored-8-Bit-MLX | 27B | 262K | Si | No disponible | 8 bits MLX |
| savvyer/Qwen3.8-27B-Uncensored-MLX-4bit | 27B (segun nombre) | 262K | Si | No disponible | 4 bits MLX |
| Qwen2.5-32B (alternativa de Alibaba) | 32B | 128K | No | Apache-2.0 | Multiples |

La principal diferencia entre las tres variantes de Qwen3.8-27B es el nivel de cuantizacion: el original en BF16 requiere mas de 54 GB de memoria, la variante de 8 bits MLX alrededor de 27 GB, y la variante de 4 bits de este repositorio 16,1 GB. La variante "Uncensored" anade la modificacion de pesos por abliteration. No se dispone de datos comparativos de rendimiento entre ellas.

## Limitaciones y advertencias

- Sesgo y alucinaciones: al ser una variante abliterada, se han eliminado los mecanismos de rechazo del modelo, lo que puede aumentar la probabilidad de que genere contenido incorrecto, sesgado o nocivo sin filtrar. Esto es un riesgo significativo en entornos de produccion.
- Riesgo de contenido inapropiado: el modelo puede responder a peticiones de contenido ilegal, violento o sexual sin restricciones, lo que obliga a implementar capas de filtrado externas si se despliega en aplicaciones publicas.
- Idioma limitado: la ficha indica que el modelo solo soporta ingles ("en"), por lo que no es adecuado para aplicaciones en castellano u otros idiomas sin un pipeline de traduccion previo.
- Discrepancia de parametros: los metadatos safetensors indican 4,67B parametros mientras que el nombre y el tamano del repositorio sugieren 27B. Esta inconsistencia no esta resuelta y podria indicar un problema en la cuantizacion o en los metadatos.
- Licencia incierta: la ficha de HuggingFace no declara licencia. Aunque fuentes web indican Apache-2.0 para el modelo base, la variante abliterada no es un derivado oficial de Alibaba, por lo que su uso comercial podria presentar problemas legales.
- Sin benchmarks publicados: no hay datos de rendimiento verificables, lo que dificulta evaluar si la cuantizacion de 4 bits degrada la calidad de salida respecto al modelo original.
- Sin mantenimiento activo: el repositorio tiene 0 descargas y 0 likes, y fue creado en agosto de 2026. No hay evidencia de soporte o actualizaciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/savvyer/Qwen3.8-27B-Uncensored-MLX-4bit
- Guia de despliegue local para Apple Silicon (GitHub, newbdez33): https://github.com/newbdez33/qwen3.8
- Repositorio oficial de Alibaba para Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guia de ejecucion local en Mac y GPU (modelfit.io): https://modelfit.io/blog/run-qwen38-27b-locally-2026/
- Pagina del modelo en Wiro AI: https://wiro.ai/models/qwen/qwen3-8-27b-uncensored
- Variante de 8 bits MLX del mismo modelo (junafinity): https://huggingface.co/junafinity/Qwen-3.8-27B-Uncensored-8-Bit-MLX
