# reverie-studio/parakeet-tdt-0.6b-v3

## Resumen

Parakeet TDT 0.6B v3 es un modelo de reconocimiento automatico del habla (ASR) desarrollado originalmente por NVIDIA. La version aqui referenciada es un espejo sin modificaciones alojado por reverie-studio, que redistribuye los pesos convertidos a formato MLX por la organizacion mlx-community. El repositorio no introduce cambios en los ficheros: se trata de una copia byte a byte del modelo original, mantenida para que el servicio Echo de Reverie descargue todos sus modelos desde un unico punto.

El modelo emplea la arquitectura TDT (Token-and-Duration Transducer), una variante de los transductores recurrentes que predice de forma conjunta tokens de texto y duraciones de emision, lo que acelera la decodificacion frente a los transductores clasicos. Con 627.052.166 parametros (aproximadamente 0,6 mil millones), esta disenado para transcripcion de audio con un equilibrio entre precision y coste computacional, lo que lo hace apto para despliegue en entornos con recursos moderados.

Es relevante ahora porque combina un tamano contenido con la eficiencia del paradigma TDT y dispone de pesos en formato MLX, lo que facilita su ejecucion en hardware Apple Silicon. La licencia CC BY 4.0 permite uso comercial con atribucion, un requisito habitual en pipelines de transcripcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), transductor recurrente con prediccion conjunta de token y duracion |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card no especifica lista de idiomas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (conversion MLX); tokenizer.model, tokenizer.vocab, vocab.txt |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TDT (Token-and-Duration Transducer), una evolucion de los transductores RNN-T en la que el predictor emite simultaneamente el token siguiente y una duracion que indica cuantos fotogramas de audio se consumen antes de la siguiente emision. Esta formulacion reduce el numero de pasos de decodificacion en regiones con silencio o baja informacion, lo que se traduce en menor latencia y mayor throughput que un transductor convencional de tamano comparable.

No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del corpus, el uso de tecnicas de ajuste como RLHF o DPO, ni innovaciones adicionales mas alla de la propia arquitectura TDT. La model card del espejo remite integramente al modelo original de NVIDIA y no aporta informacion tecnica adicional sobre el proceso de entrenamiento.

## Capacidades

- Reconocimiento automatico del habla: transcripcion de audio a texto mediante decodificacion TDT.
- Prediccion conjunta de tokens y duraciones, lo que permite saltar fotogramas y acelerar la inferencia.
- Ejecucion en formato MLX, orientada a hardware Apple Silicon.
- Capacidades multilingues: no disponible (no se especifica en la informacion).
- Soporte de tool calling / function calling: no disponible (no es una capacidad propia de un modelo ASR).
- Soporte de agentes y razonamiento multi-paso: no disponible (fuera del alcance del modelo).
- Capacidades especiales (vision, audio como entrada, thinking mode): entrada de audio para transcripcion; no se documentan otras.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo convierte audio en texto con un coste de inferencia bajo gracias a sus 0,6 mil millones de parametros, adecuado para procesar lotes de grabaciones en servidores modestos.
- Subtitulado automatico de video: integrado en un pipeline que extrae la pista de audio y genera subtitulos, la decodificacion TDT reduce el tiempo de proceso frente a transductores clasicos.
- Dictado en aplicaciones de escritorio en macOS: al disponer de pesos MLX, puede ejecutarse localmente en equipos con Apple Silicon sin depender de la nube.
- Indexacion y busqueda de contenido audiovisual: transcripcion masiva de archivos para construir indices de texto consultables, donde el throughput del modelo resulta determinante.
- Asistentes de voz y transcripcion en tiempo real: la prediccion de duraciones permite avanzar por el audio de forma eficiente, lo que favorece escenarios de baja latencia.
- Generacion de actas y resumenes a partir de audio: el modelo produce la transcripcion base que despues se procesa con un modelo de lenguaje para resumir o estructurar la informacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 627 millones de parametros, los pesos en precision FP16 ocupan aproximadamente 1,25 GB; en cuantizaciones de 8 bits o 4 bits el requisito se reduce a alrededor de 0,6-0,7 GB y 0,3-0,4 GB respectivamente (estimacion a partir del numero de parametros; no confirmada en la model card).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cualquier GPU con al menos 2-4 GB de memoria libre deberia poder alojar los pesos en FP16.
- Compatibilidad con GPU de consumo: si, previsiblemente en tarjetas con 4 GB o mas de VRAM (por ejemplo, gama RTX xx60 y superiores), aunque no se confirma en la documentacion.
- Hardware Apple Silicon: los pesos estan en formato MLX, por lo que el destino natural es la ejecucion en chips M-series mediante el framework MLX.
- Opciones de despliegue: MLX (formato nativo del repositorio); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este modelo en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Parakeet TDT 0.6B v3 (este espejo) | 627 M | TDT | no disponible | CC BY 4.0 | Hugging Face (espejo MLX) |
| Whisper (variantes de ~0,6-1,5 B) | no disponible en esta ficha | Transformer encoder-decoder | no disponible | MIT (variantes abiertas de OpenAI) | Hugging Face |
| Otros transductores ASR de tamano similar | no disponible | RNN-T / TDT | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a categoria, tamano y licencia.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: cualquier limitacion del modelo original de NVIDIA aplica integramente, y este repositorio no aporta correcciones ni ajustes.
- No se especifican los idiomas soportados en la model card, por lo que no puede garantizarse cobertura multilingue sin consultar la documentacion original de NVIDIA.
- Riesgo de errores de transcripcion en audio con ruido, acentos no representados en el entrenamiento o vocabulario tecnico especializado; no se documentan tasas de error.
- Sesgos: no disponibles en la informacion proporcionada; al ser un modelo ASR, pueden aparecer sesgos derivados de la distribucion de los datos de entrenamiento originales.
- Licencia CC BY 4.0: permite uso comercial siempre que se atribuya a NVIDIA y a mlx-community segun los terminos indicados en la model card; es obligatorio conservar la atribucion.
- El repositorio no esta afiliado ni respaldado por los autores originales, segun declara el propio autor del espejo.
- Para produccion, conviene verificar los checksums incluidos en SHA256SUMS y consultar la model card original (ORIGINAL_README.md) antes de desplegar.

## Enlaces

- Repositorio del espejo: https://huggingface.co/reverie-studio/parakeet-tdt-0.6b-v3
- Modelo base en MLX: https://huggingface.co/mlx-community/parakeet-tdt-0.6b-v3
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
