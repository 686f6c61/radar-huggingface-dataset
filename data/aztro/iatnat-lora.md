# aztro/IATNAT-LORA

## Resumen

IATNAT-LORA es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario aztro sobre el modelo de generacion de video texto-a-video Lightricks/LTX-2.5. No es un modelo completo: se distribuye como pesos adicionales que se cargan sobre el modelo base para inducir un sujeto concreto, identificado mediante la palabra de activacion `iatnat`. El entrenamiento se realizo con la herramienta ai-toolkit y el repositorio se publica con la libreria peft y el pipeline `text-to-video`.

El adaptador esta pensado para producir planos de una misma identidad (el sujeto `iatnat`) de forma consistente a lo largo de distintas generaciones, variando vestuario, iluminacion, encuadre o escenario sin perder el parecido. Es un caso de uso clasico de LoRA de personaje aplicado por primera vez, segun la informacion disponible, a la familia LTX-2.5 en lugar de a modelos de imagen como FLUX.1.

La relevancia practica es limitada por ahora: el repositorio tiene 0 descargas y 0 likes, no incluye datos de benchmarks ni informacion sobre el dataset de entrenamiento, y la licencia figura como `other` sin texto aclaratorio. Ademas, el entrenamiento se hizo con `num_frames = 1` (modo imagen), lo que condiciona su comportamiento en video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base Lightricks/LTX-2.5 (el modelo base incluye transformer y text encoder, segun la configuracion de entrenamiento) |
| Parametros totales | no disponible (adaptador LoRA; rank linear 32 con alpha 32 y rank conv 16 con alpha 16) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generacion de video, no de texto) |
| Tipos de cuantizacion | Cuantizacion `convrot8` aplicada a transformer y text encoder durante el entrenamiento; el adaptador se guarda en bf16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia especificado en la informacion disponible) |
| Formato de pesos | diffusers (carpetas `transformer/`, `model_index.json`); el autor indica que se puede reexportar a safetensors plano desde ai-toolkit |
| Modelo base | Lightricks/LTX-2.5 |
| Libreria | peft |
| Tamano del repositorio | 4,1 GB |
| Palabra de activacion | `iatnat` |

## Arquitectura y entrenamiento

El adaptador se entrena sobre LTX-2.5, el modelo base de Lightricks para generacion de video a partir de texto. La configuracion declarada aplica LoRA con rank linear 32 y alpha 32, y rank conv 16 y alpha 16, lo que da una capacidad de adaptacion moderada-alta concentrada en capas convolucionales y lineales. El entrenamiento usa 2000 pasos con batch size 1 y acumulacion de gradiente 1, learning rate 1e-4, optimizador adamw8bit, scheduler de ruido flowmatch y tipo de timestep ponderado, todo en precision bf16. La cuantizacion `convrot8` se aplico tanto al transformer como al text encoder, lo que reduce el coste de memoria durante el entrenamiento a costa de cierta perdida de fidelidad en las activaciones.

Los datos de entrenamiento no estan documentados: no se especifica numero de imagenes o clips, procedencia, composicion ni si existe consentimiento del sujeto representado. Los unicos parametros de dataset revelados son `num_repeats = 5` y `caption dropout = 0.05`, con resoluciones de entrenamiento de 512, 768 y 1024 y `num_frames = 1`, es decir, entrenamiento en modo imagen (fotograma unico) y no sobre secuencias temporales. Los checkpoints se guardan cada 250 pasos, con un maximo de 4, por lo que el repositorio contiene varios puntos de control intermedios. No se menciona uso de RLHF, DPO ni ninguna tecnica de alineacion.

## Capacidades

- Generacion de video texto-a-video con un sujeto concreto (`iatnat`) cuando la palabra de activacion se incluye al inicio del prompt.
- Control de atributos del sujeto mediante lenguaje natural: peinado, vestuario, postura, iluminacion y tipo de plano, segun el ejemplo de prompt incluido en la model card.
- Mantenimiento de la identidad del sujeto entre generaciones con prompts distintos, que es el proposito declarado del LoRA.
- Funciona como adaptador PEFT estandar, cargable sobre el modelo base LTX-2.5 en pipelines compatibles con diffusers.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision general, audio ni modo thinking.
- No se declara soporte multilingue; el prompt del ejemplo esta en ingles.

## Casos de uso

- Generacion de video con personaje recurrente: el LoRA permite producir varios planos del mismo sujeto introduciendo `iatnat` en cada prompt, util para series cortas, sketches o contenido episodico donde la consistencia de identidad es el requisito principal.
- Previsualizacion de storyboard y animatica: en fases de preproduccion se pueden generar planos rapidos del personaje en distintos escenarios para validar encuadres e iluminacion antes de rodar o renderizar en alta calidad.
- Contenido para redes sociales en formato vertical: creacion de clips cortos con un personaje fijo, variando escenario y accion, sin necesidad de sesion fotografica ni de modelado 3D del sujeto.
- Pruebas de vestuario y direccion de arte: cambiar la descripcion de ropa, mobiliario o esquema de luces en el prompt manteniendo la identidad, lo que sirve como herramienta de exploracion visual para equipos creativos.
- Integracion en pipelines de produccion con ComfyUI o diffusers: el adaptador se puede cargar como LoRA sobre LTX-2.5 y encadenar con nodos de interpolacion, upscaling o postprocesado para generar lotes de clips de forma automatizada.
- Generacion de material sintetico para investigacion: permite estudiar la consistencia de sujeto en modelos de video y comparar el comportamiento de LoRA de personaje entre familias de modelos (LTX-2.5 frente a FLUX.1, dado que el mismo autor publica variantes para otros modelos base).
- Prototipado de anuncios o branded content: generacion de piezas de video con un personaje virtual controlado, siempre que se resuelva previamente la licencia y los derechos de imagen del sujeto representado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas objetivas (FVD, CLIP-score, similitud de identidad, consistencia temporal) ni comparaciones cuantitativas con otros LoRA de personaje sobre LTX-2.5.

## Requisitos de hardware

- VRAM del adaptador: no disponible; un LoRA de este tipo anade un coste de memoria muy inferior al del modelo base, que es el que domina los requisitos de inferencia.
- VRAM total para inferencia: no disponible en la informacion proporcionada; depende del modelo base LTX-2.5, de la resolucion, del numero de fotogramas y del pipeline de decodificacion.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar sin los requisitos del modelo base.
- Almacenamiento: el repositorio ocupa 4,1 GB, repartidos entre varios checkpoints guardados cada 250 pasos.
- Opciones de despliegue: el adaptador esta en formato diffusers, por lo que encaja en pipelines que usen diffusers o PEFT; el autor menciona ComfyUI, A1111, Forge y diffusers como consumidores habituales y advierte de la necesidad de convertir o reexportar el checkpoint si el pipeline espera un `.safetensors` plano. Herramientas de texto como vLLM, llama.cpp, Ollama o TGI no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos tecnicos comparables del modelo base ni de benchmarks. La comparacion posible se limita a otros adaptadores del mismo autor y mismo sujeto, sobre modelos base distintos:

| Modelo | Modelo base | Tipo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aztro/IATNAT-LORA | Lightricks/LTX-2.5 | LoRA (peft) | diffusers | other | Hugging Face |
| aztro/iatnat-flux | FLUX.1 | LoRA | no disponible | flux-1-dev-non-commercial-license | Hugging Face |
| aztro/iatnat-ma | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Iatnat (Tensor.Art) | FLUX.1 | LoRA | no disponible | no disponible | Tensor.Art |

No se dispone de parametros, contexto ni rendimiento medido de ninguna de las alternativas, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: sin el modelo base Lightricks/LTX-2.5 no genera nada, y hereda todas las limitaciones de este.
- La licencia figura como `other` sin texto asociado, de modo que las condiciones de uso comercial no estan claras y deben consultarse con el autor antes de cualquier despliegue en produccion.
- El entrenamiento se realizo con `num_frames = 1` (modo imagen). No hay evidencia en la informacion disponible de que el adaptador haya sido entrenado sobre secuencias temporales, por lo que la consistencia del sujeto fotograma a fotograma en video no esta garantizada por el proceso de entrenamiento.
- La palabra de activacion `iatnat` es obligatoria al inicio del prompt; sin ella el efecto del LoRA sobre el sujeto es practicamente nulo.
- No se documenta el origen de los datos de entrenamiento ni si existe consentimiento del sujeto representado. Al tratarse de un LoRA de identidad de una persona, existe riesgo de uso indebido para suplantacion, contenido no consentido o desinformacion; la responsabilidad recae en quien despliega el modelo.
- No hay informacion sobre sesgos, tasas de alucinacion visual ni comportamiento en idiomas distintos del ingles.
- La cuantizacion `convrot8` aplicada al text encoder durante el entrenamiento puede degradar la adherencia al prompt respecto a un entrenamiento en precision completa.
- Repositorio sin adopcion (0 descargas, 0 likes) y sin validacion externa: no hay evidencia de terceros sobre calidad o estabilidad de los resultados.
- Al guardarse en formato diffusers, es probable que sea necesario convertir o reexportar el checkpoint para pipelines que esperan safetensors plano, lo que anade un paso de friccion operativa.

## Enlaces

- Hugging Face: https://huggingface.co/aztro/IATNAT-LORA
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Herramienta de entrenamiento ai-toolkit: https://github.com/ostris/ai-toolkit
- Variante sobre FLUX.1 del mismo autor: https://huggingface.co/aztro/iatnat-flux
- Otra variante del mismo autor: https://huggingface.co/aztro/iatnat-ma
- Ficha en Tensor.Art: https://tensor.art/models/888105200919798297
- LoRA relacionado en Tensor.Art: https://tensor.art/models/945656522514369258/iatnar-iatnnat-lor-flux
