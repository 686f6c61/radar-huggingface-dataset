# nativ-community/Mage-VL-OptiQ-4bit

## Resumen

Mage-VL-OptiQ-4bit es una cuantizacion de precision mixta del modelo vision-lenguaje microsoft/Mage-VL, publicada por el usuario nativ-community y construida con la herramienta mlx-optiq. El modelo base combina un codificador visual desarrollado desde cero, Mage-ViT, con una torre de lenguaje Qwen3-4B, lo que da un total de 4.411.424.256 parametros segun los pesos safetensors (el autor lo describe como un modelo de ~5B). Su proposito es permitir comprension de imagenes y video en local sobre Apple Silicon, sin PyTorch y sin servicios en la nube.

La relevancia de esta ficha esta en el formato: no es un modelo nuevo, sino una cuantizacion MLX de 3,7 GB en disco (3,0 GB para la torre de lenguaje y 0,63 GB para la vision) que mantiene el mismo checkpoint para texto, imagen y video. La torre de lenguaje se cuantiza capa a capa en 4 y 8 bits segun criterios de sensibilidad, con una media de 5,90 bits por peso, mientras que la torre de vision se conserva en bf16 en un fichero sidecar independiente.

El resultado declarado por el autor es una puntuacion de capacidad de 70,27 sobre seis metricas de texto, con buen comportamiento en function calling y generacion de codigo, y un punto debil claro en recuperacion de contexto largo (HashHop, 25,0%). Conviene senalar que el repositorio no tiene descargas ni valoraciones en el momento de la consulta y que la propia model card se titula "mlx-community/Mage-VL-OptiQ-4bit", mientras que el ID publicado es nativ-community/Mage-VL-OptiQ-4bit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje: codificador visual Mage-ViT mas torre de lenguaje Qwen3-4B |
| Parametros totales | 4.411.424.256 (~4,4 B); el modelo base se describe como ~5 B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | OptiQ de precision mixta: 164 capas a 4 bits y 90 capas a 8 bits; 5,90 bits por peso de media; torre de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX; la vision se guarda aparte en optiq/optiq_vision.safetensors (297 tensores) |
| Modelo base | microsoft/Mage-VL |
| Libreria de inferencia | mlx (requiere mlx-optiq >= 0.4.7) |
| Tamano en disco | 3,7 GB (3,0 GB lenguaje + 0,63 GB vision); repositorio de 3,9 GB |
| Pipeline declarado | image-text-to-text |
| Entrada de video | muestreo uniforme de fotogramas, sin codec neuronal |

## Arquitectura y entrenamiento

Mage-VL es un modelo multimodal que empareja un codificador visual propio, Mage-ViT, con un modelo de lenguaje Qwen3-4B. Esta publicacion no entrena ni ajusta el modelo: aplica una cuantizacion OptiQ guiada por sensibilidad, tomando una referencia bf16, y reparte la precision por capas dentro de la torre de lenguaje (164 capas en 4 bits, 90 en 8 bits). La etiqueta "4bit" sigue la convencion de nombres de llama.cpp para cuantizaciones mixtas y designa la familia, no la media ponderada real de bits por peso.

El detalle tecnico mas destacable es que la torre de vision se reimplemento en MLX y se conserva en bf16 dentro de un sidecar, en lugar de cuantizarse. El autor declara que esa reimplementacion se valido bit a bit contra la referencia, con una diferencia absoluta maxima de 1,7e-3 en float32. Para video, el modelo trabaja sobre fotogramas muestreados uniformemente y no necesita el codec neuronal DCVC que existe como ruta opcional de eficiencia en el repositorio base. No se proporcionan datos sobre el dataset de entrenamiento, el numero de tokens, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional, con un resultado de 74,6% en MMLU (5-shot) tras la cuantizacion.
- Comprension de imagenes y respuesta en formato image-text-to-text; el autor incluye ejemplos funcionales sobre una imagen de un perro y un fotograma de un partido de futbol.
- Comprension de video mediante muestreo uniforme de fotogramas, sin codec neuronal adicional.
- Razonamiento matematico: 88,7% en GSM8K (1000 muestras).
- Generacion de codigo: 76,2% en HumanEval (164 problemas, pass@1).
- Function calling: 88,5% en BFCL-V3 simple (200 llamadas); el autor indica que funciona bien cuando las herramientas ya estan en el prompt.
- Seguimiento de instrucciones: 68,6% en IFEval en modo estricto sobre el conjunto completo.
- Servicio con endpoint compatible con OpenAI y Anthropic mediante `optiq serve`.
- Capacidades multilingues: no disponible. No se documentan idiomas soportados.
- No se documentan modo de razonamiento explicito (thinking), audio ni otras modalidades.

## Casos de uso

- Descripcion y etiquetado de imagenes en local: el modelo acepta una imagen como contenido `image_url` y devuelve una descripcion en lenguaje natural, lo que permite montar pipelines de catalogacion o accesibilidad sin enviar datos a terceros.
- Analisis de video por fotogramas muestreados: al no requerir codec neuronal, se pueden extraer fotogramas con herramientas estandar y enviarlos al modelo para resumir escenas, detectar eventos o generar subtitulos descriptivos.
- Automatizacion de tareas de agente en el escritorio: con un 88,5% en BFCL-V3 simple, es utilizable como modelo de function calling en un Mac para orquestar herramientas locales como busqueda de ficheros, ejecucion de scripts o consultas a APIs.
- Asistencia a la programacion en equipos con hardware Apple: 76,2% en HumanEval pass@1 permite autocompletado, generacion de tests y explicacion de codigo dentro de un IDE local, sin coste de API.
- Analisis de documentos escaneados o capturas: combinando lectura de imagen y generacion de texto, se pueden extraer y resumir contenidos de capturas de pantalla, graficos o diagramas.
- Prototipado e investigacion en multimodalidad sobre Apple Silicon: sirve como punto de partida para evaluar cuantizaciones mixtas frente a la referencia bf16 y para experimentar con arquitecturas que mlx-lm no reconoce de serie.
- Agentes con razonamiento multi-paso corto: el rendimiento en GSM8K e IFEval es suficiente para cadenas de pasos acotadas, pero no para tareas que dependan de recuperar informacion en contextos muy largos, dado el 25,0% en HashHop.
- Asistente de atencion al cliente con imagenes: el cliente puede adjuntar una foto (por ejemplo, un producto defectuoso) y el modelo responder en el mismo hilo conversacional, siempre que los turnos encajen en la ventana de contexto real, dato que no se especifica.

## Benchmarks y rendimiento

Resultados declarados por el autor mediante la evaluacion estandar de texto de OptiQ:

| Metrica | Resultado | Detalles |
|---|---|---|
| MMLU | 74,6% | 5-shot, 969 muestras |
| GSM8K | 88,7% | 1000 muestras |
| IFEval | 68,6% | conjunto completo, estricto |
| BFCL-V3 simple | 88,5% | 200 llamadas |
| HumanEval | 76,2% | 164 problemas, pass@1 |
| HashHop | 25,0% | recuperacion en contexto largo |
| Capability Score | 70,27 | media de las seis metricas |

No se han publicado resultados de benchmarks de vision o video en la informacion disponible, ni comparaciones directas contra el modelo base sin cuantizar.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon mediante MLX. No hay ruta CUDA documentada para este checkpoint.
- Memoria: los pesos ocupan 3,7 GB en disco; en memoria unificada conviene reservar del orden de 5 a 6 GB incluyendo activaciones y cache KV, aunque el dato exacto de VRAM no esta disponible.
- Equipos compatibles: cualquier Mac con chip M-series y 8 GB de memoria unificada o mas; 16 GB o superior es recomendable para trabajar con imagen o video y contextos largos.
- No cabe ni es ejecutable en GPUs NVIDIA o AMD a traves de esta publicacion; para esas plataformas habria que usar el modelo base en otro formato.
- Despliegue: `optiq serve --model nativ-community/Mage-VL-OptiQ-4bit` expone un endpoint compatible con OpenAI y Anthropic. Para texto sin vision tambien se puede cargar con `import optiq` y `mlx_lm.load`. La arquitectura `mage_vl` no la reconoce mlx-lm de serie, por lo que es obligatorio importar optiq antes de cargar.
- Alternativas de despliegue: vLLM, TGI, llama.cpp y Ollama no estan soportados para esta arquitectura y este formato segun la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| nativ-community/Mage-VL-OptiQ-4bit | 4,4 B (pesos); base ~5 B | no disponible | apache-2.0 | safetensors MLX, precision mixta 4/8 bits | HuggingFace; 0 descargas |
| microsoft/Mage-VL (modelo base) | ~5 B | no disponible | no disponible en la informacion proporcionada | safetensors | HuggingFace |
| Qwen3-4B (torre de lenguaje del base) | ~4 B | no disponible | apache-2.0 | safetensors | HuggingFace; solo texto |
| Otros quants de la familia OptiQ | no disponible | no disponible | no disponible | safetensors MLX | catalogo en mlx-optiq.com/models |

No se dispone de resultados de benchmarks comparables de estos modelos dentro de la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y formato. La busqueda web realizada devolvio unicamente resultados no relacionados (agencias de viaje, instrumentos musicales, tiendas de ropa y una puerta de entrada), sin ningun material tecnico aprovechable.

## Limitaciones y advertencias

- Recuperacion en contexto largo muy debil: 25,0% en HashHop, segun el propio autor el punto flojo del modelo.
- Seguimiento estricto de instrucciones moderado: 68,6% en IFEval, lo que puede requerir prompts muy explicitos en produccion.
- No se documentan los idiomas soportados; se desconoce el comportamiento real en castellano y en otras lenguas distintas del ingles.
- No se especifica la longitud de contexto, dato critico para planificar aplicaciones conversacionales o de documentos largos.
- No hay evaluacion de alucinacion visual ni de sesgos; en modelos vision-lenguaje pequenos el riesgo de describir objetos inexistentes o inventar texto en imagenes es habitual, aunque no se cuantifica aqui.
- La cuantizacion mixta de 4/8 bits introduce degradacion respecto a la referencia bf16; los benchmarks mostrados son posteriores a la cuantizacion, pero no se ofrece la comparacion con el modelo sin cuantizar.
- El muestreo uniforme de fotogramas puede perder eventos breves o dependencias temporales finas; la ruta con codec DCVC del repositorio base no se utiliza.
- La licencia es apache-2.0, lo que en principio permite uso comercial, pero conviene verificar de forma independiente los terminos del modelo base microsoft/Mage-VL antes de desplegarlo en producto.
- Solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a entornos de servidor con GPU NVIDIA sin convertir los pesos y adaptar la arquitectura.
- El repositorio presenta 0 descargas y 0 valoraciones, por lo que no cuenta con validacion de la comunidad ni con informes independientes de reproducibilidad.
- Discrepancia de identificacion: la model card se titula "mlx-community/Mage-VL-OptiQ-4bit", pero el identificador real del repositorio es nativ-community/Mage-VL-OptiQ-4bit. Conviene usar el ID real al cargar el modelo.
- Los metadatos de HuggingFace indican una fecha de creacion de 2026-09-26, posterior a la fecha habitual de consulta; conviene tratarla como un dato poco fiable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nativ-community/Mage-VL-OptiQ-4bit
- Modelo base microsoft/Mage-VL: https://huggingface.co/microsoft/Mage-VL
- Sitio del proyecto mlx-optiq: https://mlx-optiq.com/
- Catalogo de cuantizaciones OptiQ: https://mlx-optiq.com/models
- Documentacion de mlx-optiq: https://mlx-optiq.com/docs/

Nota: los resultados de la busqueda web no aportaron enlaces relevantes sobre este modelo, su arquitectura o sus benchmarks; los enlaces anteriores proceden de la informacion del repositorio y de su model card.
