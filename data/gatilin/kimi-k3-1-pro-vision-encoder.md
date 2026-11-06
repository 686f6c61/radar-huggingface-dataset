# gatilin/kimi-k3.1-pro-vision-encoder

## Resumen

`gatilin/kimi-k3.1-pro-vision-encoder` es una extraccion comunitaria de la torre de vision y el proyector multimodal del modelo Kimi K3.1 Pro, desarrollado por Moonshot AI. El repositorio contiene exclusivamente los tensores `vision_tower.*` y `mm_projector.*` (168 tensores en total, 447.358.976 parametros) extraidos sin modificacion del checkpoint oficial en la revision `6d0a0202956796543364d666ab19c6ad1a494ee1`. No incluye el modelo de lenguaje: es un componente aislado para extraccion de caracteristicas visuales.

El componente implementa un encoder MoonViT-V2 de 27 capas junto con un patch-merger projector, disenado para convertir imagenes en secuencias de tokens espacialmente agrupados y, tras el proyector, en vectores del tamano de los embeddings de texto del modelo base. Resulta relevante para quienes necesitan reutilizar el front-end visual de Kimi K3.1 Pro en pipelines propios de vision o en investigacion sobre alineamiento vision-lenguaje, sin cargar el modelo completo.

Se trata de una extraccion independiente, no de una release oficial de Moonshot AI. La implementacion incluida en `modeling_moonvit.py` deriva de la referencia oficial de Kimi K3, cuyos valores de `vision_config` coinciden con los de K3.1 Pro, pero el autor no reclama compatibilidad con el stack de inferencia de produccion de K3.1 Pro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoonViT-V2 (vision transformer de 27 capas) + patch-merger projector |
| Parametros totales | 447.358.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (componente de vision; la ventana de contexto depende del LLM ausente) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo no publica variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | Kimi K3.1-Pro License (con condiciones para ciertos usos comerciales); la implementacion derivada de K3 queda sujeta a la Kimi K3 License con atribuciones Apache 2.0 |
| Formato de pesos | safetensors (168 tensores, claves, formas y dtypes originales) |

## Arquitectura y entrenamiento

El componente es un encoder visual MoonViT-V2 de 27 capas seguido de un proyector tipo patch-merger. Los tensores se han extraido sin modificacion del checkpoint de Kimi K3.1 Pro, conservando claves, formas, dtypes y valores originales; `tensor_mapping.json` documenta la ubicacion de cada tensor en los shards de origen y `extraction.json` registra la verificacion byte a byte y los hashes SHA-256. La implementacion de `modeling_moonvit.py` se adapta de la referencia oficial de Kimi K3 (`modeling_kimi_k3.py`), y los valores de `vision_config` de K3 y K3.1 Pro coinciden.

El procesador de imagenes original de K3.1 Pro esta incluido. La entrada no son tensores RGB BCHW estandar, sino tensores de parches empaquetados producidos por el procesador, acompanados de `grid_thws`. La salida de la torre es una lista de tokens agrupados espacialmente y la del proyector, una lista de vectores del tamano de los embeddings de texto. El codigo incluido usa atencion eager por portabilidad. No hay informacion publicada sobre volumen de datos de entrenamiento, composicion del dataset ni etapas de RLHF/DPO para este componente.

## Capacidades

- Extraccion de caracteristicas visuales: genera representaciones densas de imagen a partir de parches empaquetados.
- Proyeccion al espacio de embeddings de texto: el `mm_projector` transforma las features visuales en vectores compatibles con la dimensionalidad del LLM de Kimi K3.1 Pro.
- Procesamiento de imagenes a resolucion variable mediante `grid_thws`, que describe la rejilla de parches por imagen.
- Soporte de multiples imagenes por lote a traves del procesador incluido.
- No incluye generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues propias: esas funciones residen en el modelo de lenguaje, ausente en este repositorio.
- No hay modo thinking, audio ni otras modalidades.

## Casos de uso

- Investigacion en alineamiento vision-lenguaje: permite estudiar las representaciones del encoder de Kimi K3.1 Pro de forma aislada, sin cargar el LLM completo, comparando features visuales entre revisiones o frente a otros encoders.
- Extraccion de embeddings visuales para recuperacion de imagenes: las features proyectadas pueden indexarse en un motor vectorial para busqueda por similitud, aprovechando que la salida ya esta en la dimensionalidad de texto del modelo base.
- Preprocesado en pipelines multimodales propios: util para equipos que quieran emparejar el front-end visual de K3.1 Pro con otro LLM o con cabezales propios, siempre que respeten la licencia.
- Analisis de representaciones por capa: al conservar los 168 tensores originales con sus claves, se pueden inspeccionar activaciones intermedias de las 27 capas del MoonViT-V2 para estudios de interpretabilidad.
- Destilacion o adaptacion: sirve como inicializacion congelada para entrenar adaptadores ligeros sobre las features proyectadas en tareas de clasificacion o captioning.
- Validacion de extracciones de checkpoints: el par `tensor_mapping.json` / `extraction.json` con verificacion SHA-256 es un ejemplo reutilizable para auditar extracciones parciales de modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta un smoke test local en CPU, que no establece paridad numerica con la inferencia completa de K3.1 Pro, ni calidad en distintas resoluciones, ni comportamiento en CUDA o FlashAttention.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en precision nativa (fp32/bf16 segun dtype original de los tensores), dado el tamano del repo de 0,9 GB y los 447 millones de parametros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el componente es lo bastante pequeno para ejecutarse en GPUs de consumo.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4060, RTX 4090 y similares; tambien funciona en CPU, como demuestra el smoke test del autor.
- Opciones de despliegue: carga directa con PyTorch, Transformers, Accelerate y safetensors mediante el `component.py` incluido; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles. El codigo usa atencion eager, por lo que el rendimiento no refleja optimizaciones de FlashAttention.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/kimi-k3.1-pro-vision-encoder | 447 M | Encoder visual MoonViT-V2 + proyector | no disponible | Kimi K3.1-Pro License | Hugging Face (extraccion comunitaria) |
| moonshotai/Kimi-K3.1-Pro | no disponible | Modelo multimodal completo | no disponible | Kimi K3.1-Pro License | Hugging Face y API en platform.kimi.ai |
| moonshotai/Kimi-K3 | no disponible | Modelo multimodal completo con implementacion de referencia publicada | no disponible | Kimi K3 License | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es una release oficial de Moonshot AI: es una extraccion comunitaria y el autor no reclama compatibilidad con el stack de inferencia de produccion de K3.1 Pro.
- No incluye el modelo de lenguaje, por lo que no puede generar texto ni razonar; solo produce features visuales y proyecciones.
- El smoke test en CPU no garantiza paridad numerica con la inferencia completa, ni calidad en todas las resoluciones, ni comportamiento correcto en CUDA o con FlashAttention.
- La implementacion incluida usa atencion eager; el rendimiento puede ser inferior al de la implementacion oficial.
- La entrada debe ser tensores de parches empaquetados generados por el procesador incluido, no imagenes BCHW estandar; un uso incorrecto del formato produce resultados invalidos.
- Licencia restrictiva: la Kimi K3.1-Pro License impone condiciones especificas para ciertos usos comerciales, y la implementacion derivada de K3 queda sujeta ademas a la Kimi K3 License con atribuciones Apache 2.0. Hay que revisar ambos ficheros antes de cualquier despliegue.
- Idiomas declarados: solo ingles en los metadatos; no se documenta soporte multilingue en este componente.
- Riesgo de sesgos y alucinacion: no evaluado en la informacion disponible; al ser un encoder, los sesgos se manifestarian en las representaciones visuales y en cualquier modelo que consuma sus salidas.
- Repositorio con muy poca traccion (33 descargas, 0 likes) y sin validacion externa conocida.

## Enlaces

- Hugging Face del componente: https://huggingface.co/gatilin/kimi-k3.1-pro-vision-encoder
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Implementacion de referencia de Kimi K3: https://huggingface.co/moonshotai/Kimi-K3/blob/f831ab66814297da540d832a5235f8e904f29d06/modeling_kimi_k3.py
- API de Kimi K3.1 Pro: https://platform.kimi.ai
