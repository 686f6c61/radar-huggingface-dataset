# SadikNawazAI/FLUX-3-Image-Klein-TE-Uncensored-GGUF

## Resumen

FLUX-3-Image-Klein-TE-Uncensored-GGUF es un codificador de texto (text encoder) en formato GGUF para el pipeline de generación de imágenes FLUX 3 Image Klein. No es un modelo generativo de imágenes por sí mismo, sino el componente que traduce los prompts de texto a embeddings que el modelo de difusión consume. Está construido sobre Qwen3-VL-4B-Instruct, un modelo multimodal de 4.022 millones de parámetros de Alibaba Cloud, al que se le ha aplicado una técnica de "abliteration" para eliminar la dirección de rechazo de los pesos.

El repositorio, publicado por SadikNawazAI, es un espejo exacto (mismo SHA-256) del fichero `Qwen3-VL-4B-Instruct-Uncensored-AD-Q6_K.gguf` del repositorio AtomicChat/FLUX-3-Image-Klein-TE-Uncensored-GGUF, que es quien realizó la cuantización y la abliteración originales. Se distribuye en cuantización Q6_K (6 bits, K-quant) con un tamaño de 3,42 GiB, y está pensado como `--llm` para stable-diffusion.cpp y como modelo que Ollama descarga para la etiqueta `Q6_K`.

Su relevancia es doble: por un lado, permite ejecutar el codificador de texto de FLUX 3 en hardware de consumo gracias a la cuantización GGUF; por otro, la abliteración elimina los rechazos del codificador, lo que cambia el comportamiento del pipeline ante prompts que el modelo base rechazaría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3vl` (transformer multimodal Qwen3-VL) |
| Parametros totales | 4.022.468.096 (4,02B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q6_K (6-bit K-quant); unico fichero publicado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3-VL-4B-Instruct-Uncensored-AD-Q6_K.gguf`) |

Datos adicionales de la model card: dimensión de embedding 2.560, 36 capas, vocabulario de 151.936 tokens, tamaño de fichero 3,42 GiB (3,68 GB), tamaño del repo 3,7 GB.

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-VL-4B-Instruct, un transformer multimodal de la familia Qwen3-VL con arquitectura etiquetada como `qwen3vl`, 36 capas, dimensión oculta de 2.560 y un vocabulario de 151.936 tokens. La ventana de contexto nativa es de 262.144 tokens. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La modificación respecto al original es una abliteración: se proyecta fuera de los pesos la dirección de rechazo, de modo que el modelo deja de activar respuestas de negativa ante ciertos prompts. El resultado se cuantiza a Q6_K con imatrix (la etiqueta `imatrix` aparece en los tags del repositorio). No se documentan innovaciones adicionales como decodificación especulativa o atención lineal; el interés técnico está en el formato GGUF y en la modificación de pesos, no en cambios arquitectónicos.

## Capacidades

- Codificación de texto para generación de imágenes: convierte prompts en embeddings consumidos por el pipeline FLUX 3 Image Klein.
- Integración como `--llm` en stable-diffusion.cpp mediante la CLI `sd`.
- Ejecución vía Ollama con la etiqueta `Q6_K` (`ollama run hf.co/SadikNawazAI/FLUX-3-Image-Klein-TE-Uncensored-GGUF:Q6_K`).
- Herencia del modelo base Qwen3-VL-4B-Instruct: capacidades conversacionales y de razonamiento del modelo original, aunque su uso previsto aquí es como codificador de texto.
- Comportamiento sin rechazos (abliterado): no activa respuestas de negativa ante prompts que el modelo base rechazaría.
- Contexto largo de hasta 262.144 tokens, útil para prompts extensos o condicionamiento de gran longitud.
- Soporte multimodal heredado del base (Qwen3-VL incluye visión), si bien la model card no detalla su uso en este contexto.

## Casos de uso

- Generación de imágenes con stable-diffusion.cpp: se descarga el GGUF y se pasa como `--llm` junto al modelo de difusión FLUX 3 Klein, permitiendo ejecutar el pipeline completo en local con un codificador cuantizado de 3,42 GiB.
- Despliegue vía Ollama: la etiqueta `Q6_K` permite lanzar el codificador con un solo comando, útil para prototipado rápido y entornos donde ya se usa Ollama como gestor de modelos.
- Prompts largos y detallados: con 262.144 tokens de contexto, admite descripciones de escena muy extensas, listas de atributos o condicionamiento de texto de gran longitud sin truncar.
- Investigación sobre abliteración: sirve como caso de estudio de cómo la eliminación de la dirección de rechazo afecta al comportamiento de un codificador de texto dentro de un pipeline generativo.
- Flujos creativos sin restricciones de rechazo: para casos donde el codificador base bloquearía ciertos prompts, este modelo no interpone negativas, lo que resulta relevante en experimentación artística.
- Integración en herramientas compatibles con FLUX 3: cualquier tooling que acepte codificadores GGUF para FLUX 3 puede usar este fichero como drop-in, según indica la model card.
- Reproducibilidad y auditoría: al ser un espejo con SHA-256 idéntico al original de AtomicChat, permite verificar la integridad del fichero en despliegues que exijan trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero Q6_K ocupa 3,42 GiB; para inferencia como codificador de texto hay que sumar la memoria del modelo de difusión FLUX 3 Klein, que no se detalla en la información disponible.
- GPU recomendadas: no disponible en la model card; por tamaño, el codificador por sí solo cabe en GPUs de consumo con 6-8 GB o más de VRAM, aunque el pipeline completo depende del modelo de difusión.
- Cabe en GPU de consumo: sí, el codificador cuantizado a Q6_K (3,42 GiB) es apto para GPUs de consumo; el requisito total lo marca el modelo de difusión asociado.
- Opciones de despliegue: stable-diffusion.cpp (CLI `sd` con `--llm`), Ollama (etiqueta `Q6_K`), y cualquier herramienta compatible con GGUF para FLUX 3.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX-3-Image-Klein-TE-Uncensored (este) | 4,02B | 262.144 | Q6_K GGUF | Apache 2.0 | Hugging Face, espejo de AtomicChat |
| AtomicChat/FLUX-3-Image-Klein-TE-Uncensored-GGUF (original) | 4,02B | 262.144 | Q6_K GGUF | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-VL-4B-Instruct (base) | 4,02B | 262.144 | safetensors (original) | Apache 2.0 | Hugging Face |

La diferencia principal con el original de AtomicChat es únicamente la ubicación del repositorio: el fichero es idéntico (mismo SHA-256). Frente al base Qwen3-VL-4B-Instruct, este modelo incorpora la abliteración y la cuantización GGUF, pero no cambia arquitectura ni tamaño.

## Limitaciones y advertencias

- Modelo abliterado: se ha eliminado la dirección de rechazo, por lo que puede generar contenido que el modelo base bloquearía. La model card pide uso responsable y cumplimiento de las licencias del modelo base y del upstream.
- No es un generador de imágenes autónomo: requiere el modelo de difusión FLUX 3 Klein y tooling compatible; usarlo solo no produce imágenes.
- Sesgos: no se documentan sesgos específicos; al heredar Qwen3-VL-4B-Instruct, arrastra los sesgos del modelo base, no evaluados en esta ficha.
- Riesgo de alucinación: no evaluado en la información disponible; como codificador de texto, su salida son embeddings, no texto verificable.
- Idiomas: no se especifican los idiomas soportados en la información disponible.
- Licencia: Apache 2.0, permite uso comercial, pero deben respetarse las condiciones del modelo base (© Alibaba Cloud, Qwen) y del trabajo upstream de AtomicChat.
- Repositorio espejo con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes de uso.
- Solo se publica una cuantización (Q6_K); no hay alternativas Q4, Q8 ni safetensors en este repositorio.
- El pipeline declarado es `text-to-image`, pero el artefacto es un codificador de texto; conviene no confundir su rol en el pipeline.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SadikNawazAI/FLUX-3-Image-Klein-TE-Uncensored-GGUF
- Repositorio original (AtomicChat): https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-TE-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
