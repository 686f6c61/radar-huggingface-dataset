# moonbox-dev/heartmula

## Resumen

HeartMuLa 3B para Moonbox es un paquete de distribucion, no un modelo original, publicado por moonbox-dev en Hugging Face. Contiene el modelo de generacion musical HeartMuLa 3B (procedente de HeartMuLa/HeartMuLa-oss-3B-happy-new-year) convertido a MLX para Apple Silicon, junto con el decodificador de audio HeartCodec (HeartMuLa/HeartCodec-oss-20260123) y el tokenizer de Llama 3.2. El objetivo es servir como repositorio de descarga para la aplicacion de escritorio Moonbox, que verifica cada archivo contra una lista firmada antes de usarlo.

El modelo subyacente resuelve la sintesis de canciones con voz cantada a partir de letras y un estilo indicado por el usuario, con una duracion de hasta cuatro minutos. La arquitectura combina un modelo de lenguaje de 3B parametros que genera tokens de audio y un codec neuronal que los convierte en forma de onda. El contexto y la composicion exacta del entrenamiento no se detallan en la informacion disponible.

Es relevante porque ofrece una via practica de ejecutar generacion musical de cierta calidad en hardware de consumo Apple mediante cuantizacion MLX (8 bits obligatoria en la app, con variantes de 6 bits, mixta de 4 bits y bf16). No obstante, conviene subrayar que no es un lanzamiento oficial de los modelos originales y que el repositorio mezcla componentes con licencias distintas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje (transformer, segun la familia HeartMuLa) + codec de audio neuronal HeartCodec; conversion a MLX |
| Parametros totales | 3B en el modelo de lenguaje (HeartMuLa 3B); codec no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (obligatoria en la app), 6 bits, mixta de 4 bits, bf16; export int8 weight-only para el motor de Windows |
| Idiomas soportados | no disponible (el modelo genera audio a partir de letras; no se documentan idiomas) |
| Licencia | Apache-2.0 para el modelo y el codec; el tokenizer queda bajo Llama 3.2 Community License (el repositorio declara "other" por ese archivo) |
| Formato de pesos | safetensors (MLX), export torch int8 weight-only y bf16 para el decodificador |

## Arquitectura y entrenamiento

El paquete ensambla dos piezas: un modelo de lenguaje de 3B parametros (HeartMuLa-oss-3B-happy-new-year) que actua como generador de tokens musicales condicionado por letras y estilo, y un decodificador neuronal (HeartCodec-oss-20260123) que transforma esos tokens en audio. La conversion a MLX reempaqueta los pesos para ejecucion en Apple Silicon, con cuantizaciones de 8, 6 y 4 bits mixtas, ademas de una version bf16. Para el motor de Windows se incluye un export int8 weight-only del modelo de lenguaje y un decodificador bf16 en torch.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas del modelo original. El tokenizer es identico al de Llama 3.2 de Meta, lo que explica la presencia de la licencia Llama 3.2 en el repositorio. Todos los archivos fueron convertidos, cuantizados o reempaquetados por Moonbox; ninguno es la publicacion original.

## Capacidades

- Generacion de musica con voz cantada a partir de letras y una indicacion de estilo, con duracion de hasta cuatro minutos.
- Sintesis text-to-audio orientada a canciones completas, no a efectos sonoros ni a locucion generica.
- Ejecucion local en Apple Silicon mediante MLX, con variantes cuantizadas para ajustar memoria y calidad.
- Verificacion de integridad de archivos mediante lista firmada en la app Moonbox.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas.
- Modo thinking, vision o audio de entrada: no disponible.

## Casos de uso

- Creacion de maquetas musicales: un compositor introduce letras y un estilo y obtiene una pista cantada de hasta cuatro minutos para evaluar la direccion artistica antes de entrar en estudio.
- Prototipado rapido en produccion audiovisual: generar temas musicales temporales para videos, podcasts o demos sin depender de bibliotecas de stock.
- Experimentacion en investigacion de audio: estudiar el comportamiento de modelos de lenguaje aplicados a tokens musicales y comparar cuantizaciones (8, 6, 4 bits, bf16) sobre el mismo pipeline.
- Desarrollo de aplicaciones de escritorio: integrar generacion musical local en herramientas para macOS mediante el paquete MLX y la verificacion de archivos de Moonbox.
- Educacion y talleres: demostrar en local, sin servicios en la nube, como un modelo de 3B parametros puede producir audio cantado a partir de texto.
- Pruebas de calidad y regresion: usar las distintas cuantizaciones para medir el impacto de la compresion en la fidelidad del audio generado antes de fijar una configuracion en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 32,2 GB en total, pero cada build se descarga por separado; la variante de 8 bits del modelo de 3B ronda los 3-4 GB de pesos, la de 6 bits algo menos y la mixta de 4 bits aproximadamente 2 GB, a lo que se suma el decodificador y el resto de archivos.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente para el build elegido; el paquete MLX esta pensado para macOS. Para el motor de Windows se incluye un export torch int8 weight-only.
- GPU de consumo: si, en equipos Apple Silicon; no se documenta soporte para GPU NVIDIA o AMD en este repositorio.
- Opciones de despliegue: aplicacion Moonbox (flujo previsto), MLX para los pesos convertidos y torch para el export de Windows. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HeartMuLa 3B (Moonbox, este repo) | 3B (LM) + codec | no disponible | Texto a musica con voz | Apache-2.0 + Llama 3.2 (tokenizer) | Hugging Face, MLX y torch |
| HeartMuLa-oss-3B-happy-new-year (original) | 3B (LM) + codec | no disponible | Texto a musica con voz | Apache-2.0 | Hugging Face |
| HeartCodec-oss-20260123 (original) | no disponible | no disponible | Codec de audio | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un lanzamiento oficial: todos los archivos han sido convertidos, cuantizados o reempaquetados por Moonbox, lo que puede introducir diferencias respecto a los pesos originales.
- Licencia mixta: el tokenizer esta bajo Llama 3.2 Community License y su uso queda sujeto a la Acceptable Use Policy de Meta; el resto es Apache-2.0. Conviene revisar cada componente antes de un uso comercial.
- La licencia declarada en el repositorio es "other", lo que puede complicar la automaticacion de comprobaciones de cumplimiento.
- Riesgo de alucinacion y artefactos de audio: no se documentan evaluaciones de fidelidad, inteligibilidad de la voz ni coherencia musical.
- Idiomas soportados no documentados; no hay garantia de calidad en letras en castellano.
- Longitud de contexto y limites de duracion mas alla de los cuatro minutos indicados no estan especificados.
- Dependencia de la app Moonbox para el flujo previsto; el repositorio no incluye instrucciones de uso independiente.
- Sesgos conocidos: no disponibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/moonbox-dev/heartmula
- Modelo base de lenguaje: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B-happy-new-year
- Codec base: https://huggingface.co/HeartMuLa/HeartCodec-oss-20260123
- Organizacion HeartMuLa en Hugging Face: https://huggingface.co/HeartMuLa
- Tokenizer HeartMuLaGen: https://huggingface.co/HeartMuLa/HeartMuLaGen
- Aplicacion Moonbox: https://moonbox.dev
- Licencia Llama 3.2: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Politica de uso aceptable de Llama 3.2: https://www.llama.com/llama3_2/use-policy
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
