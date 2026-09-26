# mlx-community/Ming-Image-0.1-Design-Layer-bf16

## Resumen

Ming-Image-0.1-Design-Layer es un modelo de difusion imagen-a-imagen especializado en la descomposicion de disenos planos (posters, rotulacion, tarjetas, interfaces) en capas RGBA editables. Dado un diseno aplanado, devuelve cada elemento -texto, logotipos, personajes y objetos- en su propia capa con alfa recto y ordenadas de delante hacia atras, ademas de un fondo con las regiones tapadas rellenadas y un fotograma recompuesto por el propio modelo. Lo desarrolla inclusionAI; el repositorio analizado es una conversion a MLX en bf16 mantenida por mlx-community para Apple Silicon.

Tecnicamente no es un transformer de texto: combina una torre de vision Qwen2.5 ViT, un MLLM MoE Ling-mini-2.0, un conector no causal basado en Qwen2-1.5B, un VAE que opera en RGBA y un DiT multi-fotograma (S3-DiT con tokens de relleno aprendidos) capaz de emitir una imagen por capa mas el compuesto. La condicion de entrada se aplica por dos vias: el fotograma de referencia codificado por el VAE y las caracteristicas de la torre de vision del MLLM.

Su relevancia practica esta en que automatiza una tarea que hoy se hace a mano en herramientas de diseno: separar un PNG aplanado en capas reutilizables. Al estar publicado con licencia MIT y existir un port nativo en Swift sobre MLX, es desplegable en equipos Apple Silicon sin dependencias de CUDA, aunque el repositorio completo ocupa 49,8 GB y no esta cuantizado por debajo de bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT multi-fotograma (S3-DiT con tokens de relleno aprendidos) condicionado por MLLM MoE Ling-mini-2.0 con torre de vision Qwen2.5 ViT, conector Qwen2-1.5B y VAE RGBA |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el MLLM de condicionamiento es MoE, pero el repositorio no publica el recuento) |
| Longitud de contexto | no aplicable (modelo de difusion de imagenes) |
| Tipos de cuantizacion | bf16 y f32 en el snapshot MLX; no se distribuyen variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | MIT (incluye la LICENSE del modelo original) |
| Formato de pesos | safetensors (formato MLX; arbol diffusers convertido) |
| Modelo base | inclusionAI/Ming-Image-0.1-Design-Layer |
| Pipeline | image-to-image |
| Tamano del repositorio | 49,8 GB |

Desglose por componente del repositorio:

| Componente | Precision almacenada | Tamano | Nota frente al original |
|---|---|---|---|
| `mllm/` (Ling-mini-2.0 MoE, ViT Qwen2.5, tokenizer) | bf16 | 34,0 GB | identico byte a byte |
| `connector/` (Qwen2-1.5B no causal) | bf16 | 3,1 GB | convertido desde f32 |
| `mlp/` (tokens de consulta y cabezas de proyeccion) | f32 | 0,12 GB | identico byte a byte |
| `transformer/` (S3-DiT multi-fotograma) | bf16 | 12,3 GB | convertido desde f32 (el original lo distribuye en f32) |
| `vae/` (VAE RGBA) | bf16 | 0,25 GB | identico byte a byte |

## Arquitectura y entrenamiento

La arquitectura es un sistema de difusion compuesto. El DiT no genera un unico fotograma, sino varios (uno por capa mas el compuesto), de ahi la denominacion S3-DiT multi-fotograma con tokens de relleno aprendidos. El condicionamiento es doble: por un lado el fotograma de entrada pasa por el VAE RGBA y entra como latente de referencia; por otro, la misma imagen se procesa en la torre de vision del MLLM, cuyas salidas atraviesan el conector no causal Qwen2-1.5B y las cabezas de proyeccion. El MLLM de condicionamiento es Ling-mini-2.0, un modelo de mezcla de expertos. La generacion es en el espacio RGBA, de modo que cada capa sale con canal alfa recto.

Los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan documentados en la informacion disponible.

En cuanto a innovaciones tecnicas, el modelo acepta una especificacion textual por capa (numero de capas y descripcion de cada una, de delante hacia atras) que aisla mejor texto y objetos que una instruccion generica del tipo "descompone esta imagen en N capas". La conversion a MLX aplica un casting f32 a bf16 identico al que hace el port al cargar el checkpoint original, verificado tensor a tensor, de modo que ambos repositorios producen parametros equivalentes. Los resultados de paridad reportados frente a la referencia en PyTorch (carril CPU fp32) son: preprocesado de entrada bit-exacto, caracteristicas del ViT con relL2 de 3,5e-5, condicionamiento de 6,5e-6 / 3,8e-5, latentes de referencia de 1,4e-6 y DiT de capas (5 fotogramas mas referencia, con relleno y a tamano completo) menor o igual a 1,5e-5.

## Capacidades

- Descomposicion de una imagen plana en capas RGBA independientes, con orden de delante hacia atras.
- Aislamiento por elementos: texto, logotipos, personajes y objetos obtienen cada uno su propia capa.
- Generacion de un fondo con las regiones cubiertas rellenadas (inpainting implicito del fondo).
- Salida de un fotograma compuesto por el propio modelo, ademas de las capas.
- Funcionamiento guiado por especificacion: se puede describir el numero de capas y el contenido de cada una, o indicar solo el numero de capas.
- Procesamiento de disenos de rotulacion, posters, tarjetas e interfaces.
- Preservacion de la relacion de aspecto de la entrada, ajustada al bucket de resolucion elegido.
- Soporte de instrucciones en ingles y chino.
- No ofrece generacion de texto, razonamiento, codigo, tool calling ni comportamiento de agente: es exclusivamente un modelo de imagen.

## Casos de uso

- Edicion de posters y rotulacion: a partir de un PNG aplanado se obtienen capas separadas de titular, logotipo, personaje y fondo, lo que permite cambiar un texto o reposicionar un elemento sin volver a disenar la pieza completa.
- Localizacion de material grafico: al aislar el texto en su propia capa, un flujo de traduccion puede sustituir el contenido tipografico y recomponer la pieza manteniendo el resto de elementos intactos.
- Gestion de marcas: en un catalogo de piezas con el mismo logotipo, la descomposicion permite sustituir la capa del logotipo y reutilizar el resto de capas entre variantes.
- Preparacion de assets para motion graphics: las capas RGBA con alfa recto se importan directamente en herramientas de composicion y animacion, y el fondo rellenado evita huecos al mover elementos.
- Prototipado de interfaces: dada una captura de pantalla, el modelo separa cabecera, botones, iconos y fondo en capas editables para iterar sobre el diseno.
- Archivado y versionado de material creativo: convertir piezas historicas aplanadas en capas editables facilita su reutilizacion futura sin depender del fichero fuente original.
- Reutilizacion de fondos: la capa de fondo con las regiones tapadas rellenadas sirve como base para nuevas composiciones con otros primeros planos.
- Generacion de conjuntos de datos graficos por lotes: con una especificacion fija por tipo de pieza, el modelo puede procesar catalogos completos de rotulacion en un solo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni de metricas estandar de generacion de imagenes).

Los unicos datos cuantitativos disponibles son de paridad y de calidad de recomposicion, y se recogen en la tabla siguiente:

| Metrica | Valor |
|---|---|
| Paridad de preprocesado de entrada (resizes tipo Pillow, tokens de imagen, posiciones 3-D) | bit-exacta |
| Paridad de caracteristicas del ViT (relL2) | 3,5e-5 |
| Paridad de condicionamiento (con enrutado de expertos de referencia) | 6,5e-6 / 3,8e-5 |
| Paridad de latentes de referencia (relL2) | 1,4e-6 |
| Paridad del DiT de capas, 5 fotogramas mas referencia (relL2) | menor o igual a 1,5e-5 |
| Extremo a extremo, 2 pasos a CFG 2.0 (latentes finales) | relL2 1,8e-5; compuesto y 4 capas dentro de 1 LSB respecto a los PNG de referencia |
| Calidad de recomposicion en bf16 sobre cinco rotulaciones reales, bucket 512 (PSNR) | 24,4-31,3 dB, con menos de 0,1 dB de diferencia respecto a la referencia en PyTorch |

## Requisitos de hardware

- El repositorio ocupa 49,8 GB en disco; solo los pesos en bf16 ya requieren del orden de 50 GB de memoria, a lo que hay que sumar activaciones y latentes.
- El destino previsto es Apple Silicon con memoria unificada. Con menos de 64 GB no es viable; se recomienda 96-128 GB para trabajar comodo en el bucket de 1024.
- La referencia de rendimiento del modelo card es una M5 Max: unos 2,3 minutos para 4 capas desde una imagen de 2160x3840 en el bucket de 512, y 14 minutos en el bucket de 1024 (medido con la GPU compartida).
- No cabe en GPU de consumo NVIDIA: 49,8 GB de pesos superan los 24 GB de una RTX 4090 incluso en el bucket menor, y el runtime MLX no es compatible con CUDA.
- Opciones de despliegue: MLX en Apple Silicon, con el port Swift `ming-image-swift` y el paquete `MingImageLayerPackage`; bajo MLXEngine se registra mediante la capacidad `layerDecompose` (contrato 1.48.0), que descarga el repositorio en el primer uso. Para PyTorch/CUDA habria que recurrir al modelo original de inclusionAI en formato diffusers, sobre hardware con memoria suficiente.
- La resolucion de salida se ajusta al bucket elegido (512 o 1024) manteniendo la relacion de aspecto de la entrada, lo que acota la latencia por encima del coste fijo del modelo.

## Comparativa con modelos similares

| Modelo | Precision / formato | Plataforma | Licencia | Notas |
|---|---|---|---|---|
| mlx-community/Ming-Image-0.1-Design-Layer-bf16 (este) | bf16/f32, safetensors MLX | Apple Silicon (MLX) | MIT | Snapshot del original con DiT convertido a bf16; paridad verificada tensor a tensor |
| inclusionAI/Ming-Image-0.1-Design-Layer | DiT en f32, diffusers | PyTorch (CUDA o CPU) | MIT | Modelo original; mayor huella en disco por el DiT en f32 |
| mlx-community/Ming-Image-0.1-Design-bf16 | bf16/f32, safetensors MLX | Apple Silicon (MLX) | MIT | Mismo sistema de componentes, pero el DiT genera un unico fotograma: no descompone en capas |

No se dispone de datos comparativos de benchmarks frente a otros sistemas de descomposicion de disenos en la informacion proporcionada.

## Limitaciones y advertencias

- La recomposicion es lossy: el PSNR medido frente a la entrada esta en el rango de 24,4 a 31,3 dB, por lo que la suma de capas no reconstruye la imagen original de forma exacta.
- No hay resultados de benchmarks publicados, de modo que el rendimiento en dominios distintos de la rotulacion no esta cuantificado.
- Las capacidades linguisticas se limitan a ingles y chino; las especificaciones en otros idiomas no estan soportadas de forma declarada.
- El modelo puede generar capas inexistentes o fusionar elementos cuando la especificacion es ambigua; el propio autor recomienda especificaciones precisas para aislar texto y objetos.
- El fondo con regiones rellenadas es una invencion del modelo, no una recuperacion del contenido real: puede introducir texturas o continuidad incorrectas.
- El repositorio solo se distribuye en bf16 y f32; no hay variantes cuantizadas que reduzcan los 49,8 GB, lo que limita su uso a equipos con memoria unificada amplia.
- El runtime MLX es exclusivo de Apple Silicon: no hay despliegue sobre CUDA, vLLM, llama.cpp, Ollama ni TGI para este snapshot concreto.
- La resolucion de salida esta acotada por el bucket (512 o 1024) y mantiene la relacion de aspecto de la entrada, de modo que las piezas muy pequenas o extremadamente alargadas pueden perder detalle.
- Licencia MIT, sin restricciones declaradas para uso comercial; se recomienda conservar el fichero LICENSE del modelo original incluido en el repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlx-community/Ming-Image-0.1-Design-Layer-bf16
- Modelo original: https://huggingface.co/inclusionAI/Ming-Image-0.1-Design-Layer
- Licencia del modelo original: https://huggingface.co/inclusionAI/Ming-Image-0.1-Design-Layer/blob/main/LICENSE
- Version MLX del modelo sin descomposicion en capas: https://huggingface.co/mlx-community/Ming-Image-0.1-Design-bf16
- Port Swift/MLX: https://github.com/xocialize/ming-image-swift
