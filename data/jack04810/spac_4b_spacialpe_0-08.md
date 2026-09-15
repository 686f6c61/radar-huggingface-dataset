# Jack04810/spac_4B_spacialpe_0.08

## Resumen

`Jack04810/spac_4B_spacialpe_0.08` es un ajuste fino completo del modelo denso Qwen3-4B orientado a la comprension y generacion de mallas 3D (3D mesh) mediante una tokenizacion textual de la geometria. El autor lo publica dentro de un pipeline denominado SPAC, con un codificador posicional espacial (Spatial-PE) activado y un factor de escala `spatial_pe_scale` de 0,08. El repositorio incluye 4.661.771.776 parametros en formato safetensors (18,7 GB de peso total), lo que indica que el vocabulario se ha ampliado con tokens especificos de malla ademas de los parametros originales del modelo base.

El problema que aborda es la conversion bidireccional entre geometria y lenguaje: a partir de una secuencia de tokens de malla el modelo produce una descripcion textual, y a partir de un texto de entrada (caption) reconstruye la secuencia de tokens que representa una forma 3D. Esta doble direccion se entreno de forma emparejada sobre las mismas figuras, con 40.000 muestras repartidas a partes iguales entre ambas tareas. Es relevante porque propone un formato unificado de tokens de malla (`<mesh_start>`, `<morton_*>`, `<mesh_*>`) que permite tratar tareas 3D con la misma interfaz autoregresiva de un modelo de lenguaje.

Se trata de un modelo de investigacion, no de un producto listo para produccion: no documenta idiomas soportados, no publica resultados de benchmarks, no ofrece pesos cuantizados y exige un wrapper de inferencia especifico para reproducir la codificacion posicional espacial usada durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-4B), con codificacion posicional espacial (Spatial-PE) |
| Parametros totales | 4.661.771.776 (safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Qwen3-4B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN, pero la model card de este repositorio no confirma la ventana efectiva tras el ajuste |
| Tipos de cuantizacion | No disponible. Solo se publican pesos safetensors en bf16; no se documentan versiones GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible (la model card no declara idiomas; el pipeline esta orientado a descripciones de mallas) |
| Licencia | other |
| Formato de pesos | safetensors |
| Modelo base | qwen/Qwen3-4B |
| Tamano del repositorio | 18,7 GB |
| Pipeline | text-generation |
| Plantilla de chat | `qwen3_nothink` (sin modo thinking) |
| Tokens especiales anadidos | `<mesh_start>`, `<morton_*>`, `<mesh_*>` (ver `added_tokens.json`) |
| Requisito de inferencia | Wrapper SPAC Spatial-PE con `spatial_pe_scale 0.08` y tabla de merge de `Jack04810/spac-qwen3-4b-spatial-pe-8ep` |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-4B, un transformer decoder-only denso con atencion por consultas agrupadas (GQA) y RoPE, sobre el que se realiza un ajuste fino completo de todos los parametros. La innovacion tecnica no esta en el bloque transformer sino en la capa de posicionamiento: se sustituye o complementa el sesgo posicional habitual por un esquema Spatial-PE con un factor de escala de 0,08 y una tabla de merge externa, de modo que el modelo pueda ordenar espacialmente los tokens de malla. Los nombres de los tokens anadidos (`morton_*`) apuntan a un ordenamiento por codigos de Morton, coherente con un recorrido Z-order del espacio 3D, aunque la model card no detalla el algoritmo exacto de tokenizacion.

El entrenamiento se hizo sobre el dataset `bpe_40k_mix` (40.000 muestras): 20.000 pares malla a texto y 20.000 pares texto a malla, emparejados sobre las mismas formas. Se uso ajuste fino completo con DeepSpeed ZeRO-3 en bf16, FlashAttention-2 y empaquetado de secuencias a 8192 tokens. El run es una continuacion de 4 epocas desde los pesos `output_40k_cont2ep`, con optimizador y schedule reiniciados, learning rate de 5e-5 con decaimiento coseno hasta 5e-6 y un 3% de warmup, sobre 4 GPU con batch de 1 por GPU. La loss de entrenamiento por epoca fue 0,844 -> 0,660 -> 0,254 -> 0,052, con una media del run completo de 0,4524. No se documenta uso de RLHF, DPO ni ninguna fase de alineacion posterior.

## Capacidades

- Generacion de texto descriptivo a partir de una secuencia de tokens de malla (entendimiento de geometria 3D).
- Generacion de secuencias de tokens de malla a partir de una descripcion textual, activada con el prefijo "Reconstruct this 3D shape in mesh token format:".
- Modelado autoregresivo de secuencias de malla con tokens propios (`<mesh_start>`, `<morton_*>`, `<mesh_*>`), lo que permite muestreo token a token.
- Conversacion basica a traves del pipeline `text-generation` con la plantilla `qwen3_nothink` (el tag `conversational` aparece en el repositorio).
- Capacidad heredada del modelo base para tareas generales de lenguaje, no verificada ni documentada en este ajuste.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible, y en principio desactivado por el uso de la plantilla sin modo thinking.
- Capacidades multilingues: no disponible, sin datos en la model card.
- Vision, audio o entrada multimodal: no disponible; la unica modalidad adicional es la representacion simbolica de mallas como texto.

## Casos de uso

- Descripcion automatica de activos 3D: dado un archivo de malla tokenizado, el modelo genera una descripcion en lenguaje natural, util para catalogar bibliotecas de modelos 3D y generar metadatos de busqueda sin intervencion manual.
- Reconstruccion a partir de caption: en un editor 3D o una herramienta de prototipado, el usuario escribe una descripcion y el modelo emite la secuencia de tokens de malla que despues se decodifica a geometria, acelerando el bocetado de formas.
- Generacion condicionada en pipelines CAD/graficos: integracion como etapa de generacion dentro de un grafo mayor, donde la salida tokenizada se convierte a formato de malla (OBJ, PLY) mediante el decodificador correspondiente de la pipeline SPAC.
- Anotacion de datasets 3D a escala: el modo malla a texto permite etiquetar automaticamente grandes volumenes de formas para entrenar otros modelos de retrieval o clasificacion 3D.
- Busqueda semantica de geometria: las descripciones generadas pueden indexarse en un motor de texto para recuperar mallas por consulta en lenguaje natural, sin necesidad de un encoder 3D dedicado.
- Investigacion en representaciones unificadas: sirve como punto de partida para estudiar hasta que punto un LLM denso de 4B puede aprender una representacion discreta de geometria y para comparar tokenizaciones alternativas (Morton frente a otros recorridos).
- Prototipado de asistentes conversacionales sobre 3D: con la plantilla `qwen3_nothink` y el wrapper Spatial-PE se puede construir un chatbot que responda sobre una forma concreta, siempre que la malla este previamente tokenizada en el contexto.
- Reproduccion de experimentos de ajuste continuado: el repositorio documenta la continuacion desde `output_40k_cont2ep` con reinicio de optimizador y schedule, lo que lo hace util como referencia metodologica para runs multi-epoca.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de metricas especificas de geometria 3D (Chamfer Distance, F-score, IoU volumetrico) en la model card ni en el repositorio.

El unico dato cuantitativo de rendimiento publicado es la evolucion de la loss de entrenamiento, que no constituye un benchmark:

| Epoca (continuacion) | Loss media |
|---|---|
| 1 | 0,844 |
| 2 | 0,660 |
| 3 | 0,254 |
| 4 | 0,052 |
| Media del run completo | 0,4524 |

## Requisitos de hardware

- VRAM estimada en bf16 (precision de entrenamiento y publicacion): aproximadamente 9,3 GB solo de pesos (4,66B x 2 bytes), mas cache KV y overhead del runtime; en la practica se recomienda reservar 12 GB o mas.
- VRAM estimada con cuantizacion de 8 bits: en torno a 5 GB de pesos; no hay pesos pre-cuantizados oficiales, por lo que habria que generarlos localmente.
- VRAM estimada con cuantizacion de 4 bits: en torno a 2,5-3 GB de pesos; igualmente sin versiones oficiales publicadas.
- GPU recomendadas: cualquier GPU con 16 GB o mas para bf16 (RTX 4090, RTX 4080, A100 40 GB, H100). En GPUs de 24 GB como la RTX 3090 o la RTX 4090 el modelo cabe con margen amplio para contexto largo.
- Cabe en GPU de consumo: si, en bf16 en tarjetas de 16 GB o mas; en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) solo con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: al requerir el wrapper SPAC Spatial-PE con `spatial_pe_scale 0.08` y la tabla de merge de `Jack04810/spac-qwen3-4b-spatial-pe-8ep`, el despliegue estandar en llama.cpp, Ollama o LM Studio no es viable sin ese componente. Las rutas realistas son `transformers` con el codigo del autor, o vLLM/TGI si se adapta el modelo y el codigo de posicionamiento espacial. No hay repositorios GGUF publicados.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo de generacion de mallas.
- Almacenamiento: el repositorio ocupa 18,7 GB, muy por encima de los ~9,3 GB de los pesos en bf16, lo que sugiere la presencia de pesos adicionales o artefactos de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad 3D | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Jack04810/spac_4B_spacialpe_0.08 | 4,66B (dato real safetensors) | No disponible (base: 32.768 nativos) | Malla tokenizada como texto, bidireccional | other | safetensors en HuggingFace, requiere wrapper Spatial-PE |
| qwen/Qwen3-4B (modelo base) | 4B aprox. | 32.768 nativos, 131.072 con YaRN | No soporta malla | Apache 2.0 en el modelo base (a verificar en su repositorio) | safetensors, GGUF y multiples cuantizaciones de la comunidad |
| NVlabs/LLaMA-Mesh | 8B aprox. | No disponible en esta comparativa | Malla tokenizada como texto, inspirado en MeshGPT | No disponible en esta comparativa | Pesos publicos, ecosistema mas maduro |

Nota: los datos de las filas correspondientes a Qwen3-4B y LLaMA-Mesh no provienen de la informacion proporcionada en esta busqueda, por lo que deben verificarse en sus repositorios oficiales antes de usarse. La ventana de contexto efectiva de este ajuste concreto, el impacto del Spatial-PE en tareas de lenguaje general y las metricas geometricas frente a alternativas como LLaMA-Mesh no estan disponibles.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad geometrica (precision de la malla reconstruida) ni de preservacion de capacidades de lenguaje tras el ajuste.
- Dependencia de un wrapper propietario: el modelo no funciona correctamente con un runtime estandar, ya que necesita la implementacion SPAC Spatial-PE con `spatial_pe_scale 0.08` y la tabla de merge de otro repositorio del mismo autor. Esto limita la portabilidad y anade riesgo de mantenimiento.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ, lo que complica el despliegue en entornos de bajos recursos y en herramientas populares de inferencia local.
- Licencia "other": no se especifican los terminos exactos, por lo que no se puede confirmar si el uso comercial esta permitido. Es imprescindible contactar con el autor o revisar el texto completo de la licencia antes de cualquier uso productivo. Ademas, el modelo base Qwen3-4B tiene sus propias condiciones que se heredan.
- Modelo sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad ni issues resueltos.
- Riesgo de alucinacion geometrica: al generar mallas como secuencias de tokens, el modelo puede producir secuencias sintacticamente validas que decodifiquen a geometria no manifold, con autointersecciones o caras degeneradas. No se documenta ningun mecanismo de validacion topologica.
- Idiomas no declarados: no se especifica que idiomas conserva el ajuste ni si el entrenamiento (aparentemente en ingles, con el prompt "Reconstruct this 3D shape in mesh token format:") ha degradado el multilingüismo del modelo base.
- Ambito de tarea estrecho: el entrenamiento se limita a 40.000 muestras y a dos tareas emparejadas, por lo que el rendimiento fuera de ese dominio (formas no representadas, mallas de alta densidad o topologias inusuales) es desconocido.
- Sin modo thinking: la plantilla `qwen3_nothink` desactiva el razonamiento extendido de la familia Qwen3, lo que reduce el rendimiento en tareas que se beneficien de cadenas de pensamiento.
- Fechas de publicacion inusuales (2026-09-15): conviene verificar la procedencia y la integridad del repositorio antes de descargar 18,7 GB.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos fueron paginas sobre dias festivos del Reino Unido, sin relacion alguna con el modelo. No hay papers, blogs ni demos publicados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Jack04810/spac_4B_spacialpe_0.08
- Repositorio de la tabla de merge Spatial-PE requerida: https://huggingface.co/Jack04810/spac-qwen3-4b-spatial-pe-8ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Papers, blogs, repositorios o demos adicionales: no disponibles (la busqueda web no devolvio resultados relacionados con el modelo)
