# fdafaxxfdaf/litgpt-stories15m-tinystories

## Resumen

litgpt-stories15m-tinystories es un modelo de lenguaje de 15 millones de parametros publicado por el usuario fdafaxxfdaf en Hugging Face, resultado de reproducir la receta oficial de preentrenamiento `tinystories.yaml` de LitGPT (Lightning AI). Es un transformer decoder-only de estilo Llama con 6 capas, 6 cabezas de atencion y una dimension de embedding de 288, entrenado desde cero sobre el dataset TinyStories con un presupuesto de 9.700 millones de tokens.

El objetivo del modelo no es competir en capacidades generales, sino servir como referencia reproducible del pipeline de preentrenamiento de modelos pequenos de LitGPT: produce textos con gramatica y sintaxis correctas pero limitados a narrativas muy simples, del estilo de cuentos infantiles. Su tamano (0,2 GB de repositorio) y su licencia Apache-2.0 lo hacen util para experimentacion, docencia y pruebas de infraestructura.

Es relevante como ejemplo minimo de un entrenamiento completo ejecutado en una sola GPU consumer (RTX 4090 de 24 GB en bf16) y como contrapunto dentro del ecosistema de reproducciones del dataset TinyStories, donde ya existen trabajos conocidos como karpathy/tinyllamas o ggml-org/stories15M_MOE. No dispone de benchmarks publicados ni de validacion por parte de la comunidad (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo estilo Llama (receta `config_hub/pretrain/tinystories.yaml` de LitGPT) |
| Parametros totales | 15 millones (stories15M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 tokens (block_size) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dataset de entrenamiento, TinyStories, esta en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | `lit_model.pth` (checkpoint LitGPT en PyTorch) + `model_config.yaml` y ficheros de tokenizer |
| Capas / cabezas / dimension de embedding | 6 / 6 / 288 |
| Vocabulario | 32.000 tokens (SentencePiece) |
| Tokens de entrenamiento | 9.700 millones (max_tokens 9,7e9) |
| Tokenizer | TinyLlama/TinyLlama-1.1B-step-50K-105b |
| Precision de entrenamiento | bf16 |

## Arquitectura y entrenamiento

El modelo sigue la receta oficial `tinystories.yaml` de LitGPT y es un transformer decoder-only autorregresivo de estilo Llama: 6 capas, 6 cabezas de atencion, dimension de embedding 288 y longitud maxima de secuencia (block_size) de 256 tokens. No es un modelo MoE ni hibrido; es denso. Su vocabulario es de 32.000 tokens SentencePiece, tomado del tokenizer TinyLlama/TinyLlama-1.1B-step-50K-105b porque el tokenizer por defecto de la receta (meta-llama/Llama-2-7b-hf) esta en un repositorio con acceso restringido.

El entrenamiento fue un preentrenamiento desde cero, sin RLHF ni DPO, sobre el dataset TinyStories, descargado automaticamente por el DataModule TinyStories de LitGPT. Se procesaron 9.700 millones de tokens en bf16 sobre una unica RTX 4090 de 24 GB en RunPod. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o mezcla de expertos; el interes tecnico reside en ser una reproduccion completa y verificable del flujo de preentrenamiento de LitGPT para modelos pequenos.

## Capacidades

- Generacion de texto narrativo simple: produce cuentos cortos con gramatica y sintaxis correctas, pero con contenido muy limitado.
- Razonamiento: no disponible. Por tamano, datos y ausencia de alineacion, no hay evidencia de capacidades de razonamiento.
- Codigo y matematicas: no documentado. El dataset de entrenamiento (TinyStories) no contiene codigo ni contenido matematico.
- Tool calling / function calling: no disponible. No esta documentado ni es esperable en un modelo base de 15M.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible. El dataset TinyStories esta en ingles y la model card no declara idiomas.
- Capacidad especial: ninguna documentada (sin modo thinking, sin vision, sin audio).
- Integracion con el ecosistema LitGPT: soporta `litgpt chat` y un servidor compatible con la API de OpenAI mediante `litgpt serve ... --openai_spec true`.

## Casos de uso

- Reproduccion y validacion del pipeline de preentrenamiento de LitGPT: permite verificar de extremo a extremo que la receta `tinystories.yaml` funciona y produce un checkpoint cargable con `litgpt chat`, util para auditar versiones del framework.
- Docencia sobre LLM: sirve como ejemplo minimo y ejecutable de un transformer completo (6 capas, 15M de parametros) para explicar tokenizacion, atencion y generacion sin necesidad de hardware potente.
- Pruebas de infraestructura y CI/CD: al caber en CPU y consumir menos de 1 GB, puede desplegarse como servidor compatible con OpenAI para validar pipelines de integracion, enrutado de peticiones y formatos de respuesta sin coste de GPU.
- Benchmarking de frameworks de inferencia: su tamano minimo permite comparar latencias y consumo de memoria entre LitGPT y otras herramientas (previa conversion del checkpoint), aislando el efecto del motor de inferencia.
- Aumentacion de datos de texto simple: puede generar cuentos infantiles sinteticos para tareas de clasificacion o filtrado de texto sencillo, siempre con supervision de calidad por su limitada coherencia.
- Prototipos y demos: para mostrar una interfaz de chat basica o un generador de cuentos en entornos de desarrollo sin requisitos de rendimiento.
- Investigacion sobre modelos pequenos y scaling laws: como punto de referencia de un modelo entrenado con un presupuesto de tokens conocido (9,7e9) sobre un dataset controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos en bf16 ocupan aproximadamente 30 MB (unos 60 MB en FP32); el resto es activaciones y cache KV para solo 256 tokens de contexto.
- GPU recomendadas: cualquier GPU, incluida una RTX 3060 o inferior; tambien iGPU y CPU. No requiere A100 ni H100.
- Cabe en GPU consumer: si, en cualquier GPU consumer actual e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: LitGPT (`litgpt chat <repo>` y `litgpt serve <repo> --openai_spec true`). Otras opciones como llama.cpp, vLLM, TGI u Ollama no estan documentadas para este checkpoint y requeririan conversion de formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de pesos | Licencia | Notas |
|---|---|---|---|---|---|
| fdafaxxfdaf/litgpt-stories15m-tinystories | 15M | 256 tokens | `lit_model.pth` (LitGPT) | Apache-2.0 | Receta oficial de LitGPT; tokenizer SentencePiece de 32k |
| karpathy/tinyllamas (stories15M) | 15M | no disponible | `.pt` (llama2.c) | no disponible | Entrenado sobre TinyStories, orientado al proyecto llama2.c |
| clio-ai/tinystories15M | 15M (segun nombre) | no disponible | transformers | no disponible | Model card autogenerada, sin detalles tecnicos |
| Arkavo/tinystories-15m | 15M | no disponible | GGUF | no disponible | Version GGUF del TinyStories 15M mas un fine-tune derivado |
| ggml-org/stories15M_MOE | 15M x 4 expertos | no disponible | GGUF (llama.cpp) | no disponible | Version MoE de prueba, no apta para produccion |

Los datos de contexto, licencia y rendimiento de los modelos comparados no estan disponibles en la informacion consultada, por lo que la comparacion se limita a parametros, formato y notas cualitativas.

## Limitaciones y advertencias

- Capacidad muy limitada: con 15M de parametros y 9.700 millones de tokens de entrenamiento, el modelo solo produce narrativa simple; no es apto para tareas de razonamiento, codigo, matematicas o dialogo complejo.
- Riesgo de incoherencia: puede generar texto gramaticalmente correcto pero sin sentido o que se desvia del prompt; la alucinacion se manifiesta como perdida de coherencia narrativa.
- Contexto muy corto: 256 tokens impiden conversaciones multi-turno largas o el procesamiento de documentos extensos.
- Idioma: el dataset TinyStories esta en ingles y la model card no declara idiomas soportados; el rendimiento fuera del ingles no esta garantizado.
- Sin alineacion: al ser un modelo base preentrenado (sin RLHF ni DPO), no sigue instrucciones ni mantiene un formato de chat consistente.
- Licencia: Apache-2.0 permite uso comercial, pero el uso practico real del modelo es muy reducido y no esta validado.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, y sin benchmarks publicados.
- Formato propietario del framework: los pesos estan en `lit_model.pth`, por lo que su uso fuera de LitGPT requiere conversion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fdafaxxfdaf/litgpt-stories15m-tinystories
- Repositorio de LitGPT: https://github.com/Lightning-AI/litgpt
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Tokenizer TinyLlama/TinyLlama-1.1B-step-50K-105b: https://huggingface.co/TinyLlama/TinyLlama-1.1B-step-50K-105b
- karpathy/tinyllamas (stories15M): https://huggingface.co/karpathy/tinyllamas/blob/main/stories15M.pt
- clio-ai/tinystories15M: https://huggingface.co/clio-ai/tinystories15M
- Arkavo/tinystories-15m (GGUF): https://huggingface.co/Arkavo/tinystories-15m
- ggml-org/stories15M_MOE: https://huggingface.co/ggml-org/stories15M_MOE
