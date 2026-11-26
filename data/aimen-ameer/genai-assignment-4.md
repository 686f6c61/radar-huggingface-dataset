# aimen-ameer/genai-assignment-4

## Resumen

`aimen-ameer/genai-assignment-4` es un repositorio de pesos entrenados para una aplicacion docente de modelos generativos, no un modelo fundacional unico. Contiene cuatro artefactos independientes: un autoencoder enmascarado (MAE) sobre EuroSAT, un VAE y un DDPM condicionado por clase sobre personajes de UHaT, y un indice de recuperacion (embeddings MiniLM + chunks de texto) para un sistema RAG sobre el corpus BioASQ. Todos los modelos propios se entrenaron desde cero en una Colab T4; los dos componentes preentrenados del RAG (MiniLM y Qwen2.5-1.5B-Instruct) se cargan desde sus repositorios originales del Hub.

El interes del repositorio es practico y didactico: demuestra un pipeline completo de generacion (autocodificacion, modelado latente y difusion) junto con un modulo de recuperacion aumentada, con tamanos muy reducidos (3,17 M, 220 k y 4,03 M de parametros) que caben en GPUs de consumo. No es un modelo de lenguaje generalista: el unico componente linguistico es el LLM externo Qwen2.5-1.5B-Instruct, que no forma parte de los pesos publicados.

La relevancia actual es limitada fuera del ambito academico. El repositorio no declara pipeline, idiomas ni resultados de evaluacion, tiene cero descargas y cero likes, y su licencia es "other" sin terminos adicionales especificados. Debe tratarse como material de curso reutilizable solo tras verificar las licencias de los datos de entrenamiento subyacentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuatro componentes: masked autoencoder (MAE), VAE, DDPM con U-Net condicional por clase y pipeline RAG (MiniLM + chunks de BioASQ) |
| Parametros totales | MAE: 3,17 M; VAE: 220 k; DDPM U-Net: 4,03 M; embeddings RAG: matriz de 79.332 x 384 (float32); el LLM del RAG (Qwen2.5-1.5B-Instruct) es externo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modulo RAG recupera chunks de BioASQ; no se especifica ventana del LLM) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pt`; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | other (los datos de entrenamiento conservan sus licencias: UHaT CC BY 4.0, BioASQ mini CC BY 2.5, EuroSAT segun su pagina de dataset) |
| Formato de pesos | PyTorch state dict (`.pt`); `chunks.json` como indice de texto; sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio agrupa cuatro piezas con arquitecturas distintas. La parte A es un masked autoencoder entrenado sobre EuroSAT (imagenes satelitales), con 3,17 M de parametros y 13 MB de pesos. La parte B es un VAE de 220 k parametros entrenado sobre personajes de UHaT. La parte C es un DDPM con U-Net condicionado por clase, tambien sobre UHaT, con 4,03 M de parametros y 16 MB de pesos. La parte D es un sistema RAG: 79.332 chunks de texto del corpus BioASQ (mini) representados con embeddings MiniLM de 384 dimensiones en float32 (122 MB) y almacenados junto al texto y el identificador de abstract en `chunks.json` (68 MB).

Todos los modelos propios se entrenaron desde cero en una Colab T4, lo que explica el reducido numero de parametros y la ausencia de fases de alineacion tipo RLHF o DPO. No se especifican en la model card el numero de tokens de entrenamiento, la composicion exacta de los datasets ni detalles de aumento de datos, decodificacion especulativa o atencion lineal. El LLM que consume los chunks recuperados es Qwen2.5-1.5B-Instruct, cargado desde su repositorio original y no incluido en estos pesos.

## Capacidades

- Generacion de imagenes de personajes de UHaT mediante VAE y DDPM condicionado por clase.
- Reconstruccion y representacion latente de imagenes satelitales EuroSAT con el MAE.
- Recuperacion semantica sobre 79.332 chunks del corpus BioASQ mediante embeddings MiniLM de 384 dimensiones.
- Pipeline RAG completo: recuperacion de chunks y generacion de respuesta con Qwen2.5-1.5B-Instruct como modelo externo.
- Integracion con la aplicacion `app/app.py`, que descarga los pesos automaticamente.
- No se documentan capacidades de tool calling, function calling, agentes, modo thinking, vision general, audio ni multilingueismo mas alla de lo que aporte el LLM externo.

## Casos de uso

- Docencia de modelos generativos: el repositorio sirve como material de practicas para comparar MAE, VAE y DDPM con tamanos que caben en una T4, permitiendo entrenar y evaluar en una sola sesion.
- Reconstruccion de imagenes satelitales: el MAE de 3,17 M de parametros puede usarse para experimentar con representaciones latentes de EuroSAT en tareas de clasificacion o deteccion con pocas etiquetas.
- Generacion condicionada de personajes: el DDPM con U-Net de 4,03 M de parametros permite generar personajes de UHaT por clase, util para estudiar el efecto de la condicionalidad en difusion a pequena escala.
- Comparativa VAE frente a difusion: el VAE de 220 k parametros y el DDPM sobre el mismo dataset permiten analizar calidad, diversidad y coste computacional en un entorno controlado.
- Prototipo de RAG biomedico: el indice de 79.332 chunks de BioASQ con embeddings MiniLM sirve para construir un buscador semantico y conectarlo a Qwen2.5-1.5B-Instruct para respuestas con citas de abstracts.
- Evaluacion de recuperacion: los chunks incluyen el identificador de abstract, lo que facilita medir recall y precision de la recuperacion frente a las preguntas de BioASQ en ejercicios de evaluacion.
- Reproducibilidad de pipelines: al estar los pesos separados por partes y con clases de carga en el repositorio de GitHub, se pueden sustituir componentes (por ejemplo, otro LLM) sin reentrenar el resto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los tres modelos propios suman unos 30 MB de pesos; el indice RAG ocupa 122 MB en float32 y `chunks.json` 68 MB en disco. El LLM externo Qwen2.5-1.5B-Instruct requiere su propia VRAM segun cuantizacion (no especificada en la informacion disponible).
- GPU recomendadas: los modelos propios se entrenaron en una Colab T4, por lo que una T4 es suficiente. Para el LLM externo se recomienda una GPU con al menos 8-16 GB de VRAM segun cuantizacion.
- GPU de consumo: si, cualquier GPU con 4 GB o mas puede ejecutar los modelos propios; el RAG completo depende del LLM externo.
- Opciones de despliegue: la aplicacion oficial es `app/app.py` del repositorio `Mecha-Aima/generative-models`; los pesos se cargan con las clases de `part_a_mae/mae.py`, `part_b_vae/vae.py`, `part_c_diffusion/diffusion.py` y `part_d_rag/rag.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| aimen-ameer/genai-assignment-4 (MAE) | 3,17 M | no disponible | other | Hugging Face, 0 descargas |
| aimen-ameer/genai-assignment-4 (VAE) | 220 k | no disponible | other | Hugging Face, 0 descargas |
| aimen-ameer/genai-assignment-4 (DDPM) | 4,03 M | no disponible | other | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct (componente externo del RAG) | 1,5 B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| MiniLM (componente externo del RAG) | no disponible en esta ficha | no disponible | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo unico ni un LLM: son pesos de varios componentes para una practica academica; no debe presentarse como modelo fundacional.
- Ausencia total de datos de evaluacion: no hay benchmarks, metricas de calidad ni comparativas publicadas.
- Licencia "other" sin terminos explicitos: el uso comercial requiere aclaracion con el autor y verificacion de las licencias de los datos (UHaT CC BY 4.0, BioASQ mini CC BY 2.5, EuroSAT).
- El corpus RAG contiene texto de abstracts de BioASQ, sujeto a CC BY 2.5; su redistribucion debe respetar la atribucion.
- Riesgo de alucinacion en el modulo RAG: depende del LLM externo Qwen2.5-1.5B-Instruct y de la calidad de la recuperacion; no se documentan mecanismos de mitigacion.
- Sesgos: no documentados; los datasets de origen (personajes de UHaT, imagenes EuroSAT) pueden introducir sesgos propios.
- Limitaciones de contexto e idioma: no especificadas; el unico componente linguistico es externo y no se detalla su configuracion.
- Cero descargas y cero likes: no hay evidencia de uso en produccion ni de validacion por terceros.
- Fecha de creacion en el Hub posterior a la de esta ficha (2026-11-26), lo que sugiere que los metadatos pueden no ser definitivos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aimen-ameer/genai-assignment-4
- Repositorio de codigo: https://github.com/Mecha-Aima/generative-models
- Dataset EuroSAT: https://huggingface.co/datasets/blanchon/EuroSAT_RGB
- Qwen2.5-1.5B-Instruct (componente externo): no disponible en la informacion proporcionada
- MiniLM (componente externo): no disponible en la informacion proporcionada
