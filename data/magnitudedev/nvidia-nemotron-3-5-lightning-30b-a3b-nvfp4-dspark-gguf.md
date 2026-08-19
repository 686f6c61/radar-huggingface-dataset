# magnitudedev/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark-GGUF

## Resumen

El modelo NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark-GGUF es una conversión a formato GGUF del checkpoint DSpark de decodificación especulativa de NVIDIA para su familia Nemotron 3.5 Lightning. Se trata de un modelo de lenguaje de tipo MoE híbrido LatentMoE con 30 mil millones de parámetros totales y 3 mil millones activos, diseñado para tareas de razonamiento, chat y flujos agénticos. Esta conversión, realizada por magnitudedev, emplea cuantización nativa NVFP4 y está optimizada para el motor de inferencia Magnitude, además de ser compatible con llama.cpp.

El modelo base fue desarrollado por NVIDIA y liberado con pesos abiertos, datos de entrenamiento y recetas, bajo la licencia openmdw-1.1. El checkpoint DSpark está pensado para acelerar la decodificación especulativa, reduciendo la latencia en entornos de producción con agentes siempre activos. La versión GGUF aquí descrita facilita su despliegue en entornos locales y edge, con un tamaño de repositorio de solo 0,7 GB gracias a la cuantización de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentMoE hibrido (MoE con atencion latente) |
| Parametros totales | 30 mil millones (30B) |
| Parametros activos | 3 mil millones (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (este GGUF); el modelo original tambien en BF16 y NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (https://openmdw.ai/license/1-1/) |
| Formato de pesos | GGUF (conversion); safetensors (original) |

Nota: el archivo safetensors del repositorio indica 615.258.580 parametros, pero el nombre del modelo especifica 30B totales y 3B activos; la cifra del archivo probablemente corresponde a una parte de los pesos, no al total del modelo.

## Arquitectura y entrenamiento

El modelo base es un LLM de tipo MoE hibrido LatentMoE, que combina capas de atencion con mezcla de expertos latente. Esta arquitectura permite activar solo 3 mil millones de parametros por token, reduciendo el coste computacional en inferencia. El checkpoint DSpark esta especificamente disenado para decodificacion especulativa, una tecnica que acelera la generacion mediante la prediccion de multiples tokens en paralelo. No se dispone de detalles sobre el numero de tokens de entrenamiento ni la composicion del dataset en la informacion proporcionada. El post-training tiene una fecha de corte de mayo de 2026, segun la ficha de NVIDIA.

## Capacidades

- Razonamiento y chat: diseñado para tareas de razonamiento complejo y conversacion multi-turno.
- Flujos agenticos: soporta workflows de agentes, incluyendo probablemente tool calling y planificacion, aunque no se especifica explicitamente.
- Decodificacion especulativa: el checkpoint DSpark esta optimizado para generar tokens de forma especulativa, mejorando la velocidad de inferencia.
- Eficiencia: al ser MoE con 3B activos, ofrece un equilibrio entre capacidad y coste computacional.
- Multilingue: no se indica, por lo que se desconoce.

## Casos de uso

- Agentes siempre activos: el modelo esta pensado para tareas de ejecucion continua en produccion, donde la baja latencia es critica.
- Enrutamiento de tareas con NeMo Switchyard: se puede combinar con modelos frontier para planificacion compleja, delegando tareas de alto volumen al Lightning.
- Asistentes conversacionales: gracias a su capacidad de razonamiento y chat, puede alimentar chatbots con contexto amplio (aunque la longitud de contexto no esta confirmada).
- Generacion de codigo y automatizacion: probablemente adecuado para tareas de programacion asistida, aunque no hay benchmarks que lo confirmen.
- Inferencia en edge: la cuantizacion NVFP4 y el formato GGUF permiten ejecutarlo en hardware modesto.
- Prototipado rapido: al ser un modelo abierto con pesos y recetas, facilita la experimentacion en investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se pueden proporcionar cifras de MMLU, HumanEval u otras pruebas.

## Requisitos de hardware

- El archivo GGUF NVFP4 pesa aproximadamente 0,7 GB, lo que sugiere que puede caber en GPUs con 2-4 GB de VRAM, aunque el modelo original en BF16 requeriria unos 60 GB.
- Para la decodificacion especulativa, se recomienda una GPU con soporte para FP4, como las NVIDIA RTX 40 series o superiores.
- Se puede desplegar con llama.cpp, Magnitude y otros motores compatibles con GGUF.
- La latencia y el throughput no estan documentados en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos MoE de tamaño similar (por ejemplo, Mixtral 8x7B o DeepSeek-V3) en la informacion proporcionada. No se puede realizar una comparativa fiable.

## Limitaciones y advertencias

- Sesgos: al ser un modelo entrenado con datos web, puede presentar sesgos sociales y culturales no documentados.
- Alucinaciones: como todo LLM, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo.
- Licencia: openmdw-1.1 es una licencia de codigo abierto, pero es necesario revisar sus terminos para uso comercial, especialmente porque el modelo base es de NVIDIA.
- Contexto: no se ha confirmado la longitud de contexto maxima, lo que limita su uso en aplicaciones que requieran ventanas largas.
- Especificidad: el checkpoint DSpark esta diseñado para decodificacion especulativa; su uso sin el drafter adecuado puede no ofrecer ventajas de velocidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/magnitudedev/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark-GGUF
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark
- Model card de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Pagina de NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
