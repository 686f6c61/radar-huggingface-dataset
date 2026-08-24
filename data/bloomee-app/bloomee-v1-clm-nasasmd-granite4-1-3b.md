# bloomee-app/bloomee-v1-clm-nasasmd-granite4.1-3b

## Resumen

Bloomee es una plataforma interactiva de observacion de la Tierra que detecta, visualiza y explica eventos de floracion en el espacio y en el tiempo, integrando datos de observacion de la NASA. Este modelo, bloomee-v1-clm-nasasmd-granite4.1-3b, es un ajuste fino (fine-tune) del modelo Granite 4.1 de 3B parametros de IBM, especializado en datos de la NASA Science Mission Directorate (SMD) para el analisis de fenologia floral. El proyecto Bloomee fue ganador y reconocido como mejor innovacion en la NASA Space Apps Challenge Bandung 2025.

La denominacion del modelo (clm = causal language model, nasasmd = NASA SMD) sugiere que se ha entrenado sobre datos cientificos de la NASA para generar explicaciones en lenguaje natural sobre eventos de floracion, desde la floracion de los cerezos en Japon hasta los superblooms de flores silvestres en California. La ficha publicada en HuggingFace no incluye especificaciones tecnicas detalladas, por lo que gran parte de la informacion debe inferirse del nombre del modelo y del contexto del proyecto Bloomee.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (inferido: basado en Granite 4.1 de IBM) |
| Parametros totales | 3B (inferido del nombre del modelo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el Granite 4.1 base soporta 128K, no confirmado en este ajuste) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo se presenta como un causal language model (clm) de 3B parametros, lo que apunta a una arquitectura transformer densa, heredada del modelo base Granite 4.1 de IBM. El sufijo "nasasmd" indica que el entrenamiento se ha realizado sobre datos de la NASA Science Mission Directorate, presumiblemente incluyendo datos de observacion de la Tierra, metadatos de satelites y series temporales de fenologia floral. No se han publicado detalles del proceso de entrenamiento: numero de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO) o metodos de ajuste (LoRA, QLoRA, full fine-tune). El proyecto Bloomee en su conjunto se centra en la deteccion de eventos de floracion mediante datos satelitales, por lo que este modelo probablemente actua como capa de generacion de explicaciones en lenguaje natural sobre esos datos.

## Capacidades

- Generacion de texto y respuestas en lenguaje natural sobre fenologia floral y datos de observacion de la Tierra.
- Explicacion de eventos de floracion: cerezos en Japon, superblooms en California, etc.
- Integracion con plataformas de visualizacion interactiva de datos geoespaciales.
- Tool calling / function calling: no confirmado en la informacion publicada.
- Capacidades de agente o multi-step reasoning: no confirmado.
- Soporte multilingue: no disponible.
- Thinking mode o modo de razonamiento extendido: no disponible.

## Casos de uso

- **Atencion educativa en fenologia**: el modelo puede integrarse en la plataforma Bloomee para generar explicaciones en lenguaje natural de mapas de floracion, ayudando a estudiantes y publico general a entender "donde, cuando y por que" florecen las plantas.
- **Asistente de investigacion en ecologia**: investigadores pueden consultar al modelo sobre patrones de floracion en regiones especificas, usando datos NASA como contexto.
- **Generacion de narrativas para visualizaciones**: la plataforma Bloomee puede usar el modelo para generar descripciones automaticas de eventos de floracion detectados por satelite.
- **Documentacion ambiental**: generar informes descriptivos sobre fenologia, cambio climatico y su impacto en la floracion de plantas.
- **Seguimiento de eventos estacionales**: el modelo puede responder preguntas sobre la fenologia de los cerezos en Japon o superblooms en California, apoyando el analisis de series temporales.
- **Educacion STEM**: integracion en aulas para explicar conceptos de observacion de la Tierra, teledeteccion y fenologia a partir de preguntas en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de 3B parametros, la inferencia en FP16 requiere aproximadamente 6-8 GB de VRAM; con cuantizacion de 4-bit puede reducirse a 2-4 GB.
- **GPU recomendadas**: RTX 3090, RTX 4090, A100, H100, o cualquier GPU con al menos 8 GB de VRAM.
- **Consumer GPU**: si, cabe en GPUs de consumo como RTX 4090 (24 GB), RTX 4070 (12 GB) o incluso RTX 3060 (12 GB) con cuantizacion.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, Text Generation Inference (TGI), Hugging Face Inference Endpoints.
- **Latencia y throughput**: no publicado para este modelo concreto; para un modelo de 3B en una GPU moderna se espera una latencia de decenas de milisegundos por token y un throughput de varios cientos de tokens por segundo con batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| bloomee-v1-clm-nasasmd-granite4.1-3b | 3B | No disponible | No disponible | Fenologia floral, NASA SMD |
| Granite 4.1 3B (base) | 3B | 128K | Apache 2.0 | Generico, tool calling |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community | Generico |
| Qwen2.5 3B | 3B | 32K | Apache 2.0 | Generico, multilingue |

Nota: los datos de los modelos comparados corresponden a sus caracteristicas publicadas; el ajuste fino de Bloemee puede alterar las capacidades originales del Granite 4.1 base.

## Limitaciones y advertencias

- No se ha publicado ninguna documentacion tecnica detallada (datos de entrenamiento, evaluacion, sesgos) para este modelo.
- La licencia no esta especificada en la ficha de HuggingFace, por lo que no esta garantizado el uso comercial legal.
- El modelo tiene 0 descargas y 1 like, lo que indica que es un modelo muy reciente y sin validacion de la comunidad.
- Al ser un ajuste fino de un modelo de 3B, puede presentar alucinaciones en dominios fuera de su especializacion (fenologia floral).
- La longitud de contexto real puede ser menor que la del modelo base si el ajuste fino no preserva la ventana completa.
- No se han publicado evaluaciones de sesgos ni de seguridad del modelo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/bloomee-app/bloomee-v1-clm-nasasmd-granite4.1-3b)
- [Perfil de la organizacion en HuggingFace](https://huggingface.co/bloomee-app)
- [GitHub de Bloomee](https://github.com/bloomee-app)
- [Repositorio de la web de Bloomee](https://github.com/bloomee-app/bloomee-web)
