# mradermacher/Viking-SlimSonnet-v1-7B-GGUF

## Resumen

Viking-SlimSonnet-v1-7B-GGUF es la version cuantizada en formato GGUF del modelo mpasila/Viking-SlimSonnet-v1-7B, un ajuste fino (SFT) de 7.550.013.440 parametros orientado a generacion de texto conversacional en lenguas nordicas. Lo publica mradermacher, un conocido distribuidor de cuantizaciones estaticas de modelos abiertos, y esta pensado para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.) en hardware de consumo.

El modelo base fue entrenado por mpasila mediante SFT con la libreria Unsloth/TRL sobre dos datasets derivados de Sonnet 3.5 SlimOrca deduplicado (Gryphe/Sonnet3.5-SlimOrcaDedupCleaned y una variante con contexto de 4k), lo que sugiere un enfoque en instrucciones conversacionales de calidad. Su interes principal es cubrir el hueco de modelos de 7B con soporte declarado para ingles, fines, sueco, noruego, danes, islandes y noruego nynorsk, algo poco habitual en modelos de este tamano.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, y el repositorio incluye cuantizaciones desde Q2_K (3,1 GB) hasta f16 (15,2 GB), lo que facilita el despliegue en GPUs consumer y en CPU. No se han publicado resultados de benchmarks ni detalles de arquitectura mas alla de que es un transformer decoder-only de la familia Llama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, base no especificada) |
| Parametros totales | 7.550.013.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el dataset de entrenamiento usa contexto de 4k) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, fi, sv, no, da, is, nn |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que el modelo base se entreno con Unsloth y TRL (SFT), lo que sugiere un transformer decoder-only estandar de la familia Llama. El numero de parametros (7.550.013.440) es consistente con un modelo de 7B con vocabulario extendido, probablemente para cubrir los idiomas nordicos declarados.

El entrenamiento se realizo mediante supervised fine-tuning sobre Gryphe/Sonnet3.5-SlimOrcaDedupCleaned y una variante de mpasila con contexto de 4k (mpasila/Sonnet3.5-SlimOrcaDedupCleaned-4k-context). No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases posteriores de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o attention lineal.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y lenguas nordicas (fines, sueco, noruego, danes, islandes, nynorsk).
- Instrucciones y respuestas de estilo asistente, derivadas del dataset SlimOrca (destilacion de Sonnet 3.5).
- Razonamiento basico y tareas de conocimiento general, limitado por el tamano de 7B.
- Soporte multilingue declarado para siete idiomas, con enfasis en el grupo escandinavo.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Compatible con text-generation-inference segun los tags del repositorio.

## Casos de uso

- Asistente conversacional en lenguas nordicas: el modelo cubre fines, sueco, noruego, danes, islandes y nynorsk, lo que permite desplegar un chatbot local para usuarios de esos idiomas sin depender de APIs externas.
- Despliegue en hardware de consumo: con la cuantizacion Q4_K_M (4,7 GB) cabe en GPUs con 6-8 GB de VRAM, ideal para prototipos y aplicaciones de escritorio con Ollama o LM Studio.
- Generacion de texto en entornos sin conexion: al ser un GGUF ejecutable con llama.cpp en CPU, sirve para procesar documentos o generar borradores en maquinas sin GPU.
- Filtrado y resumen de textos en idiomas nordicos: apropiado para preprocesar corpus escandinavos en pipelines de NLP donde no se requiere un modelo grande.
- Base para fine-tuning adicional: al estar bajo Apache 2.0 y disponible en safetensors en el modelo base, se puede reentrenar para dominios especificos (legal, sanitario) en idiomas nordicos.
- Educacion e investigacion: util como referencia de modelo multilingue pequeno para estudiar el comportamiento de SFT con datasets destilados de Sonnet 3.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~3,1 GB; Q4_K_M ~4,7 GB; Q5_K_M ~5,5 GB; Q8_0 ~8,1 GB; f16 ~15,2 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100/H100 solo si se necesita f16 o alto throughput.
- Cabe en GPU consumer: si, en practicamente todas las GPUs con 6 GB o mas usando Q4_K_M; en GPUs de 4 GB solo con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (segun tags), y servidores compatibles con GGUF (koboldcpp, llama-cpp-python).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Viking-SlimSonnet-v1-7B-GGUF | 7,55B | no disponible | en, fi, sv, no, da, is, nn | Apache 2.0 | GGUF |
| Viking-SlimInstruct-V1-7B (mradermacher) | ~7B | no disponible | nordicas (segun familia Viking) | Apache 2.0 (presumible) | GGUF |
| Mistral-7B-Instruct | 7,24B | 32k | principalmente en | Apache 2.0 | safetensors, GGUF |
| Llama-3.1-8B-Instruct | 8,03B | 128k | multilingue amplio | Llama 3.1 Community | safetensors, GGUF |

Los datos de Mistral-7B-Instruct y Llama-3.1-8B-Instruct se incluyen como referencia de categoria; no se dispone de comparaciones de rendimiento directas con Viking-SlimSonnet en la informacion proporcionada.

## Limitaciones y advertencias

- No hay benchmarks publicados: el rendimiento real frente a otros 7B es desconocido.
- Modelo de 7B con SFT sobre un dataset destilado: riesgo de alucinacion en tareas factuales y de razonamiento complejo.
- La longitud de contexto no esta documentada; el dataset de entrenamiento usa 4k, por lo que contextos mayores pueden degradar la calidad.
- El soporte de los siete idiomas declarados no garantiza calidad uniforme; el islandes y el nynorsk son idiomas de bajos recursos y probablemente esten peor cubiertos.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que requieran function calling fiable.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los datasets de entrenamiento (SlimOrca deriva de datos generados por Sonnet 3.5) antes de un uso comercial a gran escala.
- Es una cuantizacion estatica; para mayor calidad existen las versiones i1 (imatrix) en el repositorio mradermacher/Viking-SlimSonnet-v1-7B-i1-GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Viking-SlimSonnet-v1-7B-GGUF
- Repositorio i1-GGUF (imatrix): https://huggingface.co/mradermacher/Viking-SlimSonnet-v1-7B-i1-GGUF
- Modelo base: https://huggingface.co/mpasila/Viking-SlimSonnet-v1-7B
- Dataset principal: https://huggingface.co/datasets/Gryphe/Sonnet3.5-SlimOrcaDedupCleaned
- Dataset con contexto 4k: https://huggingface.co/datasets/mpasila/Sonnet3.5-SlimOrcaDedupCleaned-4k-context
- Pagina de conveniencia del autor: https://hf.tst.eu/model#Viking-SlimSonnet-v1-7B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
