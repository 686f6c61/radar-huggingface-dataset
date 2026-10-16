# Duckets/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-MLX-4bit

## Resumen

El repositorio Duckets/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-MLX-4bit es una conversion no oficial a MLX del modelo nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16, publicada por el usuario Duckets (conversion y empaquetado atribuidos a Juno). Se trata del modelo omni completo: incluye el modelo de lenguaje hibrido Nemotron-H (Mamba-2, atencion y MoE) y la torre de vision C-RADIO. No incorpora torre de audio, ya que el campo `sound_config` es nulo en el checkpoint de origen.

La relevancia de esta publicacion es practica: traslada un modelo de 120.000 millones de parametros totales y 12.000 millones de parametros activos (120B-A12B) a un checkpoint cuantizado en 4 bits afines con grupo de 64, con aproximadamente 4,57 bits por peso y un peso en disco de unos 65 GB. Esto lo hace ejecutable en hardware Apple Silicon con memoria unificada, tanto mediante la libreria mlx-vlm como en LM Studio, donde segun el autor carga con la longitud de contexto nativa completa de 1.048.576 tokens.

El autor indica que la generacion de texto y la descripcion de imagenes han sido verificadas, aunque no se publican resultados de benchmarks ni detalles del entrenamiento original. La licencia no se especifica en la informacion disponible, y el checkpoint aplica tres correcciones de configuracion respecto a una conversion directa para que los frontales reporten correctamente la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Nemotron-H: Mamba-2, atencion y MoE, mas torre de vision C-RADIO |
| Parametros totales | 120B (segun nomenclatura del modelo) |
| Parametros activos | 12B (A12B) |
| Longitud de contexto | 1.048.576 tokens (maximo nativo) |
| Tipos de cuantizacion | 4-bit affine, group size 64, ~4,57 bits por peso; el modelo base esta en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX cuantizado a 4 bits; checkpoint de origen en BF16 |
| Tamano del checkpoint | ~65 GB |
| Modalidades | Texto e imagen (vision incluida y verificada); sin torre de audio |
| Libreria | mlx-vlm |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 |

## Arquitectura y entrenamiento

La arquitectura es una hibrida Nemotron-H que combina capas Mamba-2 (modelo de espacio de estados), capas de atencion y capas de mezcla de expertos (MoE). La nomenclatura 120B-A12B indica un total de 120.000 millones de parametros con 12.000 millones activos por token, lo que implica enrutamiento disperso sobre expertos. A esta pila de lenguaje se le anade una torre de vision C-RADIO para el procesamiento de imagenes, presente y verificada en este checkpoint. El modelo de origen no incluye torre de audio.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO. La innovacion tecnica documentada en esta ficha se limita al proceso de conversion: cuantizacion affine de 4 bits con group size 64 (aproximadamente 4,57 bits por peso), eliminacion de la clave redundante `_downsample_factor` en las configuraciones del procesador (se deriva de `downsample_ratio`), normalizacion del sentinel Infinity de `time_step_limit` a un numero plano y anadido de una clave `max_position_embeddings` de nivel superior para que los frontales reporten la longitud de contexto real.

## Capacidades

- Generacion de texto: carga y genera correctamente bajo mlx-vlm, segun el autor.
- Comprension de imagenes: la torre de vision C-RADIO esta incluida y se ha probado la descripcion de imagenes.
- Contexto muy largo: ventana nativa de 1.048.576 tokens, cargable en LM Studio con la configuracion adecuada.
- Inferencia local en Apple Silicon mediante MLX, sin necesidad de GPU NVIDIA.
- Capacidades multimodales de audio: no disponibles (el checkpoint de origen no tiene torre de audio).
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentacion tecnica con diagramas: el modelo puede recibir un PDF con planos, esquemas o capturas junto a texto descriptivo y razonar sobre ambos en una sola pasada, gracias a la combinacion de la torre C-RADIO y una ventana de 1.048.576 tokens.
- Descripcion automatica de imagenes en flujos de accesibilidad: al estar verificada la generacion de descripciones de imagen, puede integrarse en pipelines que generen texto alternativo para catalogos, archivos fotograficos o repositorios documentales.
- Procesamiento de expedientes escaneados de multiples paginas: facturas, contratos o informes con tablas e imagenes pueden procesarse localmente sin enviar datos a servicios en la nube, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Asistente local sobre Mac con memoria unificada: al ser un checkpoint MLX de ~65 GB, permite desplegar un asistente multimodal en un Mac Studio o Mac con suficiente memoria unificada, usando mlx-vlm o LM Studio.
- Investigacion sobre arquitecturas hibridas: el checkpoint facilita experimentar con la familia Nemotron-H (Mamba-2 + atencion + MoE) y medir el efecto de la cuantizacion a 4 bits frente al modelo BF16 de origen.
- Revision de interfaces y capturas de pantalla en desarrollo: analisis de capturas de UI junto a especificaciones textuales largas para detectar discrepancias entre diseno e implementacion.
- Extraccion de informacion de informes con graficos: combinacion de contexto largo y vision para localizar datos en series de figuras y tablas dentro de documentos extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso del checkpoint en disco: aproximadamente 65 GB en cuantizacion 4 bits (4,57 bits por peso), segun el autor.
- Memoria necesaria: al menos la del checkpoint mas el overhead de runtime y la cache KV; para contexto largo se requiere bastante mas memoria unificada. Cifra exacta no disponible.
- Plataforma objetivo: Apple Silicon con MLX. No se documenta soporte CUDA en esta conversion.
- GPU de consumo: no cabe en GPUs de consumo con 24 GB de VRAM, ya que solo los pesos ocupan unos 65 GB.
- Opciones de despliegue: mlx-vlm (verificado) y LM Studio (verificado por el autor con el contexto completo de 1.048.576 tokens). vLLM, TGI, llama.cpp y Ollama no estan documentados para este formato de pesos.
- Configuracion en LM Studio: el autor indica desactivar la cuantizacion de cache KV, ya que esa opcion hace que LM Studio ignore la longitud de contexto configurada.
- Nota de compatibilidad: los backends de LM Studio disponibles en la fecha de subida podian fallar al cargar la arquitectura por falta del paquete de modelo mlx-vlm y de dos dependencias del procesador; se trata de una limitacion del motor, no de los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Duckets/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-MLX-4bit | 120B totales, 12B activos | 1.048.576 tokens | 4-bit affine (MLX) | ~65 GB | no disponible | HuggingFace, requiere MLX |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 | 120B totales, 12B activos | 1.048.576 tokens | BF16 (sin cuantizar) | ~240 GB (estimado a partir de 120B en BF16) | no disponible | HuggingFace |
| Otros modelos comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no especificada: no es posible confirmar si se permite el uso comercial. Debe verificarse en el repositorio base antes de cualquier despliegue en produccion.
- Conversion no oficial: los pesos han sido cuantizados por un tercero (Duckets, con conversion atribuida a Juno) y no estan validados por NVIDIA.
- Degradacion potencial por cuantizacion: la cuantizacion a 4 bits puede reducir la calidad frente al checkpoint BF16 de origen; no se han publicado evaluaciones comparativas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay documentacion especifica sobre su comportamiento en este checkpoint.
- Idiomas soportados no documentados: no puede garantizarse un rendimiento adecuado en castellano ni en otros idiomas concretos.
- Contexto largo y memoria: aunque el contexto nativo es de 1.048.576 tokens, mantenerlo completo exige una cache KV muy grande; en la practica puede ser necesario reducirlo o cuantizarla, lo que afecta a la gestion del modelo.
- Compatibilidad de motores: backends de LM Studio pueden fallar al cargar la arquitectura si no incluyen el paquete mlx-vlm y las dependencias del procesador.
- Aviso operativo en LM Studio: la cuantizacion de cache KV debe permanecer desactivada para que se respete la longitud de contexto configurada.
- Sin audio: no dispone de torre de audio, por lo que no puede procesar entradas de voz o sonido.
- Exclusion de otros runtimes: al ser pesos MLX, no se pueden usar directamente con vLLM, TGI, llama.cpp u Ollama sin una conversion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Duckets/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-MLX-4bit
- Modelo base (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
