# devin-lai/MiniMax-H3-Image-mlx

## Resumen

MiniMax-H3-Image-mlx es un port comunitario a MLX del modelo MiniMax-H3-Image de MiniMaxAI, desarrollado por Devin Lai. El objetivo es permitir la generacion y edicion de imagenes de forma nativa en Apple Silicon mediante MLX/Metal, sin depender de CUDA ni de servicios en la nube. El repositorio principal contiene el codigo de inferencia y la documentacion; los pesos se distribuyen en repositorios separados por variante de cuantizacion.

El modelo original es un sistema de difusion texto-a-imagen e imagen-a-imagen con capacidad de edicion por imagen de referencia. El port implementa los seis pasos de destilacion PDD (destilacion progresiva de difusion), edicion con imagen de referencia, empaquetado lossless BF16 y pesos opcionales Q8/Q4. La inferencia corre localmente en el Mac del usuario.

La relevancia actual radica en que permite ejecutar un modelo de generacion de imagenes de gran tamano en hardware de consumo Apple, con memoria de 64 GiB, algo poco habitual en el ecosistema MLX. La licencia es la MiniMax H3 Image Community License Agreement, con restricciones territoriales y comerciales, y no es open source sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (texto-a-imagen, imagen-a-imagen, edicion) con destilacion PDD; port MLX/Metal |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | BF16 original, packed12 (BF16 empaquetado lossless), Q8, Q4 (grupos afines MLX de 64) |
| Idiomas soportados | en |
| Licencia | minimax-h3-image-community-license-agreement (con restricciones territoriales y comerciales) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3-Image es un modelo de difusion para generacion y edicion de imagenes. El port MLX implementa inferencia nativa en Metal con soporte para los seis pasos de destilacion PDD, lo que reduce el numero de pasos de muestreo necesarios. Incluye un transformador principal, un refinador con atencion y MLP, un VAE compartido y un codificador de texto nativo separado de aproximadamente 62 GiB.

El port ofrece cuatro variantes de pesos: BF16 original (61,73 GiB), packed12 (27,23 GiB, compresion de almacenamiento sin perdida que reconstruye los bits BF16 originales antes del computo), Q8 (19,83 GiB) y Q4 (10,50 GiB). La cuantizacion Q8/Q4 aplica grupos afines MLX de 64 a los pesos de atencion y MLP del modelo principal y del refinador, manteniendo islas de precision FP32 nativas. No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de imagenes texto-a-imagen con resoluciones de hasta 2048x2048 (segun el ejemplo de la model card).
- Edicion de imagenes mediante imagen de referencia, con hasta dieciseis entradas ordenadas; la cohorte registrada valida una referencia.
- Generacion de imagenes con semilla configurable y registro JSON de prompt, semilla, schedule, hardware, precision, tiempos y memoria.
- Soporte de prompts detallados en ingles; el runtime no expande prompts de forma silenciosa.
- Ejecucion local en Apple Silicon con MLX/Metal, sin CUDA.
- Seleccion de variante de pesos (packed12, bf16, q8, q4) reutilizando componentes compartidos (VAE, tensores de soporte, cabezas y tablas).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni vision de entrada mas alla de la edicion por referencia.

## Casos de uso

- Generacion de imagenes editoriales o de producto en local: el modelo permite crear imagenes a 2048x2048 con semilla fija y registro de parametros, adecuado para iterar disenos en un Mac sin enviar datos a la nube.
- Edicion de imagenes con referencia: usando `--image` y describiendo la edicion con `<Picture 1>`, se pueden aplicar cambios controlados sobre una imagen existente, util para retoque o variaciones de producto.
- Prototipado de pipelines de generacion de imagen: el registro JSON por salida facilita la reproducibilidad y la integracion en flujos de experimentacion con prompts y semillas documentados.
- Investigacion en eficiencia de inferencia en Apple Silicon: las variantes Q8/Q4 y packed12 permiten comparar fidelidad y huella de memoria en el mismo hardware.
- Creacion de assets para documentacion o demos: la galeria de ejemplos y las comparaciones publicadas sirven como referencia de calidad y procedencia de las imagenes generadas.
- Despliegue offline en entornos con requisitos de privacidad: al ejecutarse localmente con pesos descargados, no requiere conexion tras la descarga inicial, siempre que se respete la licencia.

## Benchmarks y rendimiento

| Metrica | Dense | Packed12 |
|---|---|---|
| Generacion 2048x2048 en caliente (M5 Pro, 64 GiB) | 62,49 s | 64,05 s |
| Huella maxima muestreada (GiB) | 40,50 | 32,56 |
| Mejora frente al control MLX emparejado | 5,07% | 3,57% |

Medido en M5 Pro con 64 GiB, con acondicionamiento en cache y pesos residentes, tres repeticiones alternas por caso. Excluye arranque y descargas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que es un modelo de imagen.

## Requisitos de hardware

- VRAM/RAM estimada: la maquina probada es un M5 Pro con 64 GiB; no se ha cualificado hardware con menos memoria.
- Pesos por variante (sin VAE compartido, tensores de soporte, cabezas ni tablas): packed12 27,23 GiB, BF16 61,73 GiB, Q8 19,83 GiB, Q4 10,50 GiB.
- Codificador de texto nativo separado de aproximadamente 62 GiB, descargado aparte en la primera ejecucion.
- GPU: Apple Silicon con MLX/Metal; no hay soporte CUDA documentado en este port.
- Cabe en GPU de consumo Apple solo con memoria suficiente; los Macs con menos memoria no estan cualificados.
- Despliegue: paquete Python `h3-mlx` instalado con `uv`, comandos `h3-mlx doctor`, `h3-mlx download` y `h3-mlx generate`; tambien API de Python segun USAGE.md.
- Latencia: 62,49 s dense y 64,05 s packed para 2048x2048 en caliente en M5 Pro/64 GiB. No se establece una garantia universal de velocidad ni identidad de pixeles con CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-H3-Image-mlx (este) | no disponible | no aplica | MiniMax H3 Image Community License (restricciones territoriales y comerciales) | MLX, Apple Silicon, acceso manual |
| MiniMaxAI/MiniMax-H3-Image (original) | no disponible | no aplica | MiniMax H3 Image Community License | Repositorio original en Hugging Face |
| Alternativas de difusion texto-a-imagen en MLX | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de imagen en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no es open source sin restricciones: incluye restricciones territoriales y comerciales; revisar LICENSE-model antes de uso comercial.
- El acceso a los pesos y componentes compartidos requiere revision manual.
- Solo se ha probado en un M5 Pro con 64 GiB; los Macs con menos memoria no estan cualificados.
- La cuantizacion Q8/Q4 altera la fidelidad de imagen y detalle; no se ha establecido una ventaja de velocidad de generacion con cuantizacion.
- El codificador de texto es de aproximadamente 62 GiB y se descarga aparte en la primera ejecucion; el primer uso es pesado.
- Los prompts deben ser detallados y en ingles; el runtime no los expande.
- La edicion por referencia valida una sola imagen en la cohorte registrada, aunque acepta hasta dieciseis entradas ordenadas.
- No se establece identidad de pixeles con CUDA ni una capacidad minima de RAM.
- Riesgo de sesgos y alucinacion visual inherente a modelos de difusion; no se documentan evaluaciones de sesgo en la informacion disponible.

## Enlaces

- Repositorio principal: https://huggingface.co/devin-lai/MiniMax-H3-Image-mlx
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Galeria de ejemplos: https://huggingface.co/devin-lai/MiniMax-H3-Image-mlx-examples
- Variante packed12: https://huggingface.co/devin-lai/MiniMax-H3-Image-mlx-packed12
- Variante BF16: https://huggingface.co/devin-lai/MiniMax-H3-Image-mlx-bf16
- Variante Q8: https://huggingface.co/devin-lai/MiniMax-H3-Image-mlx-q8
- Variante Q4: https://huggingface.co/devin-lai/MiniMax-H3-Image-mlx-q4
- Componentes compartidos: https://huggingface.co/devin-lai/MiniMax-H3-Image-mlx-shared
- Coleccion: https://huggingface.co/collections/devin-lai/minimax-h3-image-apple-silicon-mlx-6af64fcd11d7d7a3b17e11d8
- Licencia del modelo: https://huggingface.co/devin-lai/MiniMax-H3-Image-mlx/blob/v0.4.1/LICENSE-model
- Guia de uso: USAGE.md (en el repositorio)
- Benchmarks: BENCHMARKS.md (en el repositorio)
- Mapa del repositorio: MODEL_INDEX.md (en el repositorio)
- README en chino simplificado: README.zh-CN.md (en el repositorio)
- Ejemplos y procedencia: examples/README.md (en el repositorio)
