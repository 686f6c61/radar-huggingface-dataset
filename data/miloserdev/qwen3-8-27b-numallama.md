# miloserdev/Qwen3.8-27B-numallama

## Resumen

Qwen3.8-27B-numallama es una conversion del modelo Qwen/Qwen3.8-27B al formato propietario del motor de inferencia numallama, un runtime en C disenado especificamente para servidores CPU con arquitectura NUMA (multiples sockets). El modelo original, desarrollado por el equipo Qwen de Alibaba, es un transformer denso hibrido que combina atencion lineal Gated DeltaNet con atencion completa, con 27.000 millones de parametros. La conversion la firma el desarrollador independiente miloserdev y se publica bajo licencia Apache 2.0, la misma del modelo base.

El interes de esta ficha no reside tanto en el modelo en si (cuyas caracteristicas hereda del Qwen3.8-27B original) como en el formato de distribucion: ficheros binarios optimizados para ejecucion en CPU sobre ARM64 con instrucciones NEON, pensados para maquinas multi-socket como Ampere Altra Max o AWS Graviton. Esto lo aleja del ecosistema GGUF/llama.cpp y lo situa en un nicho muy concreto: despliegues sin GPU en infraestructura ARM de servidor.

El repositorio ocupa 46,6 GB e incluye dos cuantizaciones (Q4 asimetrica de 18,0 GB y Q8 int8 de 28,6 GB) mas el tokenizer. La model card advierte explicitamente de que los ficheros no son GGUF y no funcionan con llama.cpp, Ollama, LM Studio ni transformers: solo se ejecutan con numallama. El modelo es solo texto; el codificador de vision del modelo original no se ha convertido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido: Gated DeltaNet (atencion lineal) + atencion completa |
| Parametros totales | 27.000 millones (heredado del modelo base Qwen/Qwen3.8-27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4 asimetrica (grupos de 32, escala y minimo en fp16) y Q8 int8 (escalas por grupo) |
| Idiomas soportados | No disponibles (la matriz de importancia de cuantizacion se recogio sobre texto en ingles, ruso, chino y codigo) |
| Licencia | Apache 2.0 |
| Formato de pesos | Binario propietario de numallama (`.bin`); no es GGUF ni safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida que intercala capas de atencion lineal Gated DeltaNet con capas de atencion completa, un diseno orientado a reducir el coste computacional y de memoria del contexto largo manteniendo la calidad de recuperacion de la atencion clasica. Es un modelo denso de 27.000 millones de parametros, sin mezcla de expertos. La model card de la conversion no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo original y no se reproducen en esta ficha.

La aportacion tecnica de esta publicacion es el proceso de conversion y cuantizacion para numallama. La cuantizacion Q4 es asimetrica con grupos de 32 elementos, con escala y minimo almacenados en fp16, y se calibro con una matriz de importancia recogida sobre texto en ingles, ruso, chino y codigo. La Q8 es int8 con escalas por grupo. El motor numallama ejecuta la inferencia en C sobre CPU, con reparto de trabajo consciente de NUMA entre todos los sockets de la maquina, y aprovecha instrucciones NEON de productos punto en ARM64. La model card menciona soporte de decodificacion especulativa y de herramientas (tools) entre las opciones del motor, aunque sin detallar su implementacion.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un modelo de lenguaje de proposito general; la conversion mantiene la cabeza de texto.
- Modo de razonamiento (thinking): se activa con el flag `-r 1` en el comando de chat de numallama.
- Generacion de codigo: la matriz de importancia de cuantizacion incluye texto de codigo, lo que sugiere preservacion de calidad en ese dominio.
- Capacidades multilingues: la calibracion cubre ingles, ruso y chino; el resto de idiomas del modelo base no se detalla.
- Soporte de tool calling: el README de numallama menciona opciones de herramientas, aunque la model card no especifica el formato ni la cobertura.
- Servidor compatible con la API de OpenAI en `/v1`, lo que facilita la integracion con clientes existentes.
- Decodificacion especulativa disponible como opcion del motor (sin datos de ganancia publicados).
- Sin vision: el codificador de imagenes del modelo original no se ha convertido.
- Sin audio: no se menciona soporte.

## Casos de uso

- Inferencia en servidores ARM sin GPU: el caso principal. Maquinas Ampere Altra o AWS Graviton con varios sockets pueden ejecutar el modelo en CPU aprovechando el reparto NUMA, sin depender de aceleradores.
- Sustitucion de GPU en entornos con restricciones de suministro: organizaciones que ya operan flotas ARM y quieren anadir capacidad de generacion de texto sin adquirir hardware NVIDIA.
- Procesamiento por lotes de documentos en ingles, ruso o chino: la cuantizacion Q4 se calibro con esos idiomas, por lo que es la opcion recomendada para cargas multilingues en esos idiomas.
- Asistencia a desarrollo en terminal: el binario `runq` ofrece un chat interactivo que puede usarse como asistente de codigo local en una maquina de desarrollo ARM64.
- Backend de API interna: el modo servidor expone un endpoint compatible con OpenAI en el puerto configurado, util para prototipos y herramientas internas que ya hablan ese protocolo.
- Experimentacion con decodificacion especulativa y optimizacion NUMA: interesante para investigadores que estudien el rendimiento de motores de inferencia en CPU multi-socket.
- Despliegue de bajo consumo energetico: frente a soluciones con GPU, un servidor ARM ejecutando Q4 a 18 tok/s puede resultar competitivo en vatios por token para cargas no interactivas.

## Benchmarks y rendimiento

La model card solo publica velocidades de decodificacion medidas en un sistema concreto (2 x Ampere Altra Max M128-30, 256 nucleos Neoverse N1, ambos sockets):

| Cuantizacion | Tamano | Velocidad de decodificacion |
|---|---:|---:|
| Q4 asimetrica | 18,0 GB | 18 tok/s |
| Q8 int8 | 28,6 GB | 11 tok/s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras de velocidad corresponden a una unica conversacion y el propio autor advierte de que otras maquinas diferiran.

## Requisitos de hardware

- Memoria: al menos 18 GB de RAM para Q4 y 28,6 GB para Q8, mas el overhead del motor y del contexto. En la practica conviene reservar 20-24 GB y 32 GB respectivamente.
- CPU: Linux obligatorio. Optimizado para ARM64 con NEON (Ampere Altra, AWS Graviton y otros nucleos Neoverse). En x86-64 y otras CPUs se ejecuta codigo C portable sin optimizar, con rendimiento muy inferior.
- GPU: no se usa GPU; el motor es exclusivamente de CPU.
- Cabe en consumer: no en el sentido habitual; no hay soporte para GPU de consumo ni para equipos de escritorio x86 optimizados. En un portatil ARM (por ejemplo, Apple Silicon) no esta soportado de forma nativa por el motor.
- Despliegue: exclusivamente numallama (`runq` en modo chat o servidor). No compatible con vLLM, llama.cpp, Ollama, LM Studio, TGI ni transformers.
- Throughput: 18 tok/s en Q4 y 11 tok/s en Q8 sobre 2 x Ampere Altra Max M128-30; sin datos de throughput agregado en batched serving.

## Comparativa con modelos similares

No hay una comparativa directa posible con modelos del mismo ecosistema, porque numallama es un formato propietario sin equivalentes publicos. Como referencia del modelo base frente a alternativas densas de tamano similar:

| Modelo | Parametros | Contexto | Formato de despliegue | Licencia |
|---|---:|---|---|---|
| Qwen3.8-27B (original) | 27B | No disponible | safetensors, transformers, vLLM | Apache 2.0 |
| Qwen3.8-27B-numallama (esta ficha) | 27B | No disponible | Binario numallama, solo CPU | Apache 2.0 |
| Alternativas densas ~27B | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks que permitan comparar calidad con otros modelos de la misma categoria. La comparativa relevante es de infraestructura: numallama frente a llama.cpp u Ollama para ejecucion en CPU, donde numallama apuesta por NUMA multi-socket y ARM64, mientras que llama.cpp ofrece portabilidad amplia, GGUF y soporte x86 y GPU.

## Limitaciones y advertencias

- Formato cerrado: los ficheros solo funcionan con numallama. No hay conversion a GGUF ni soporte en herramientas estandar, lo que limita la portabilidad y crea dependencia de un unico proyecto mantenido por un desarrollador individual.
- Sin vision: el codificador de imagenes del modelo original no se ha convertido; el modelo es solo texto.
- Rendimiento dependiente de la plataforma: en x86-64 el motor ejecuta codigo portable sin optimizar, con velocidad presumiblemente muy inferior a la reportada. No hay cifras para x86.
- Idiomas de calibracion limitados: la matriz de importancia de la cuantizacion Q4 se recogio en ingles, ruso, chino y codigo; el rendimiento en castellano u otros idiomas puede degradarse mas con Q4 que con Q8.
- Sin datos de benchmarks de calidad: no se puede verificar la perdida de calidad de la cuantizacion Q4 frente al modelo original.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones publicadas de factualidad para esta conversion.
- Sesgos: no documentados en la model card; se heredan los del modelo base, no evaluados aqui.
- Contexto: la longitud de contexto soportada por la conversion no se especifica; el README de numallama menciona opciones de longitud de contexto, pero sin valores.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del propio motor numallama antes de un despliegue en produccion.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; proyecto joven, sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miloserdev/Qwen3.8-27B-numallama
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor numallama (repositorio): https://github.com/miloserdev/numallama
- README de numallama: https://github.com/miloserdev/numallama#readme
