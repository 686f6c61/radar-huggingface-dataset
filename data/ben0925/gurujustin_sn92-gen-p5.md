# ben0925/gurujustin_sn92-gen-p5

## Resumen

REAX SN92 generalist entry es un fine-tune mediante LoRA del modelo ronanlee777/sn92-gen-ma, que a su vez es una mezcla (model soup) al 50/50 de isomsom/sn92-gen-m87b y xflud/sn92-decider-1, fusionada en el backbone. Lo publica el usuario ben0925 bajo el identificador gurujustin_sn92-gen-p5 y se etiqueta como "decision-model" dentro del ecosistema sn92. El modelo base declarado para la subred es baselabs/mammoth-1, y los tags apuntan a la familia qwen3_5 como arquitectura de referencia.

El repositorio contiene 26.085.330.160 parametros en formato safetensors (unos 26.000 millones), con un tamano de repo de 52,2 GB, lo que sugiere pesos en precision de 16 bits. La model card es extremadamente escueta: no documenta datos de entrenamiento, composicion del dataset, idiomas, contexto ni resultados de evaluacion. La relevancia actual es limitada y de nicho: se trata de un experimento de la comunidad sobre una cadena de fine-tunes y soups, no de un lanzamiento con documentacion tecnica completa.

La licencia MIT facilita el uso comercial y la redistribucion, pero la ausencia de informacion sobre el proceso de entrenamiento y de benchmarks publicados obliga a evaluar el modelo empiricamente antes de cualquier despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag qwen3_5; detalles no disponibles) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo es un fine-tune LoRA de ronanlee777/sn92-gen-ma en la revision d4aa443d03e12c073a176c84eb53096898943986, fusionado en el backbone. Ese modelo intermedio es una soup 0.5/0.5 de isomsom/sn92-gen-m87b (revision 7f04058f63745440fae3c10f8da249a0c55fea40) y xflud/sn92-decider-1 (revision db2e622aa508bd82350620bf165441fa4043f3cf), y declara como base de la subred a baselabs/mammoth-1 (revision 61cec44c281c693992e3d6ebeb44dd3402dfa186). El tag qwen3_5 sugiere que la arquitectura subyacente pertenece a la familia Qwen 3.5, aunque no se detalla la variante exacta ni la configuracion de capas.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. El unico detalle metodologico confirmado es el uso de LoRA sobre un modelo previamente mezclado, lo que implica que las capacidades heredadas provienen de la cadena de modelos upstream y no de un entrenamiento desde cero.

## Capacidades

- Generacion de texto autoregresiva, heredada de la arquitectura base tipo Qwen 3.5 (sin verificacion publica en esta ficha).
- Etiquetado como "decision-model" y "generalist entry", lo que sugiere un uso orientado a tareas de decision o clasificacion dentro del ecosistema sn92, aunque no se detalla el formato de salida.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion comparativa de fine-tunes comunitarios: el modelo sirve como punto de comparacion frente a otros derivados de la cadena sn92 para medir el efecto de la soup y del LoRA en tareas de decision, usando un conjunto de validacion propio.
- Experimentacion academica con model soups: permite estudiar como la mezcla 0.5/0.5 de dos checkpoints y un posterior LoRA afecta a la estabilidad del entrenamiento y a la calidad de las respuestas, dado que la cadena de dependencias esta documentada con hashes de revision.
- Prototipado interno de clasificacion o decision: por su etiqueta "decision-model", puede probarse en tareas de enrutamiento o seleccion de opciones, siempre con validacion empirica previa dado que no hay benchmarks publicados.
- Generacion de texto en entornos con requisitos de licencia permisiva: la licencia MIT y la retencion de avisos upstream facilitan la integracion en productos comerciales, sujeto a revision legal de las licencias de la cadena de modelos base.
- Reproduccion de pipelines de fine-tuning LoRA: el repositorio y los hashes de revision permiten reconstruir el proceso de merge y servir como plantilla para experimentos similares sobre modelos de ~26.000 millones de parametros.
- Despliegue en infraestructura propia con cuantizacion: al publicarse en safetensors, puede convertirse a GGUF o AWQ para servir en GPUs de gama alta, aunque el exito depende de que la arquitectura qwen3_5 sea compatible con las herramientas de conversion disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 52 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 64-80 GB para contexto corto.
- VRAM estimada con cuantizacion a 8 bits: en torno a 26-30 GB de pesos, viable en una RTX 5090 (32 GB) o A100 40 GB con margen ajustado.
- VRAM estimada con cuantizacion a 4 bits: en torno a 13-16 GB de pesos, potencialmente ejecutable en RTX 4090 (24 GB) o RTX 4080 (16 GB) con contexto reducido.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para servicio en precision completa; A100 40 GB o L40S para 8 bits; RTX 4090/5090 para pruebas en 4 bits.
- Opciones de despliegue: vLLM o TGI para serving en precision completa o FP8; llama.cpp u Ollama si se generan pesos GGUF; no se confirma compatibilidad con estas herramientas al no documentarse la arquitectura exacta.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantizacion y la longitud de contexto, ninguno de los cuales esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ben0925/gurujustin_sn92-gen-p5 | 26,1 B | no disponible | MIT | Hugging Face, 0 descargas | Fine-tune LoRA de una soup sn92 |
| ronanlee777/sn92-gen-ma | no disponible | no disponible | no disponible | Hugging Face | Modelo base directo del fine-tune |
| isomsom/sn92-gen-m87b | no disponible | no disponible | no disponible | Hugging Face | Componente de la soup upstream |
| xflud/sn92-decider-1 | no disponible | no disponible | no disponible | Hugging Face | Componente de la soup upstream |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables, por lo que la comparativa se limita a la cadena de dependencias declarada.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentacion de entrenamiento: no hay evidencia publica de calidad, por lo que cualquier uso en produccion requiere evaluacion propia.
- Riesgo de alucinacion no cuantificado: al no documentarse el dataset ni las fases de alineamiento, no puede estimarse la tasa de respuestas incorrectas.
- Idiomas no declarados: no se garantiza soporte de castellano ni de otros idiomas distintos del que predomine en los datos upstream.
- Longitud de contexto desconocida: impide planificar casos de uso con documentos largos o conversaciones multi-turno extensas.
- Cadena de dependencias compleja (soup de dos modelos mas LoRA sobre un backbone declarado): dificulta la trazabilidad de sesgos y de comportamiento heredado.
- Licencia MIT con retencion de avisos upstream: aunque permisiva, conviene revisar las licencias de baselabs/mammoth-1, isomsom/sn92-gen-m87b y xflud/sn92-decider-1 antes de un uso comercial.
- El autor declara no estar afiliado a Base Labs / Baseten, al equipo de Qwen ni a Perplexity AI, lo que implica que no hay soporte oficial ni garantias de mantenimiento.
- Repositorio con 0 descargas y 0 likes: no hay senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ben0925/gurujustin_sn92-gen-p5
- Modelo base directo: https://huggingface.co/ronanlee777/sn92-gen-ma
- Componente upstream 1: https://huggingface.co/isomsom/sn92-gen-m87b
- Componente upstream 2: https://huggingface.co/xflud/sn92-decider-1
- Base declarada de la subred: https://huggingface.co/baselabs/mammoth-1
