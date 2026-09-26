# fbbcool/krea2-re-75

## Resumen

krea2-re-75 es un checkpoint de generación de imágenes texto-a-imagen publicado por el usuario fbbcool. No se trata de un modelo entrenado desde cero, sino de un merge: el adaptador de fotorrealismo Realism Engine (Krea 2 v3.1, modelo de Civitai 2688234, obra de RazzzHF) horneado dentro de los pesos del modelo base comfy-org/krea-2 con una fuerza de 0.75. El autor del repositorio no entrena nada; su aportación es la fusión del adaptador en los pesos base y la preparación de tres variantes de archivo en distintas precisiones.

El adaptador es un LoKR de LyCORIS en forma completa, `kron(w1, w2)`, entrenado con ai-toolkit. El merge suma `0.75 * kron(w1, w2)` a cada una de las 256 capas lineales objetivo: los 32 bloques transformer y los bloques de fusión de texto. El `alpha` almacenado es inerte para un LoKr en forma completa, en línea con el comportamiento del `LoKrAdapter` de ComfyUI.

El resultado es un modelo de difusión para texto-a-imagen orientado a fotorrealismo, distribuido únicamente en formato safetensors y con la licencia krea-2-license. Su relevancia práctica radica en que elimina la necesidad de cargar un nodo LoRA adicional en ComfyUI: el adaptador ya está integrado en los pesos, con una variante turbo pensada para inferencia en 8 pasos y cfg 1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion texto-a-imagen; 32 bloques transformer mas bloques de fusion de texto (text-fusion, tmlp, txtmlp, tproj) y capas first/last con sus normas |
| Parametros totales | no disponible |
| Longitud de contexto | no aplicable (modelo texto-a-imagen) |
| Tipos de cuantizacion | bf16 (precision completa), fp8_e4m3fn sin escalas y fp8_e4m3fn con escalas por tensor |
| Idiomas soportados | no disponible |
| Licencia | krea-2-license (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es el modelo comfy-org/krea-2, un transformer de difusión texto-a-imagen. La model card no detalla la arquitectura interna del base, pero sí revela la topología de las capas afectadas por el merge: 32 bloques transformer más los bloques de fusión de texto, con capas denominadas `first`, `tmlp`, `tproj`, `txtfusion`, `txtmlp` y `last`, además de las normas. El adaptador modifica 256 pesos lineales mediante una descomposición LoKr `kron(w1, w2)`, y el merge aplica un factor de escala de 0.75 sobre ese producto de Kronecker. No hay entrenamiento adicional por parte del autor del repositorio: el trabajo consiste en plegar el adaptador en los pesos base.

Se distribuyen tres artefactos con layouts de cuantización distintos. El archivo de entrenamiento en bf16 conserva precisión completa. El archivo de entrenamiento en fp8 liso (`fp8_e4m3fn`) convierte a fp8 únicamente las capas lineales de los bloques transformer; `first/tmlp/tproj/txtfusion/txtmlp/last` y las normas permanecen en la precisión de origen, siguiendo el layout de diffusion-pipe con `diffusion_model_dtype='float8'` y sin escalas. El archivo de inferencia en fp8 escalado emplea escalas por tensor (`scale = max|W| / 448`, dequantización `fp8 * scale`) con el mismo layout de `_quantization_metadata` que los checkpoints fp8 estándar de krea-2, de modo que carga de forma nativa en ComfyUI.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de prompts de texto, con el adaptador de fotorrealismo Realism Engine integrado a fuerza 0.75.
- Inferencia rapida en modo turbo: aproximadamente 8 pasos con cfg 1.
- Carga directa en ComfyUI mediante UNETLoader, sin necesidad de un nodo LoRA separado, porque el adaptador esta horneado en los pesos.
- Compatibilidad con el CLIPLoader de tipo `krea2` y el VAE `qwen_image_vae`.
- Base de precision completa (bf16) y base fp8 apta para reentrenamiento o fine-tuning.
- Checkpoint fp8 escalado listo para inferencia con carga nativa en ComfyUI.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modos de razonamiento, por tratarse de un modelo de difusion texto-a-imagen.

## Casos de uso

- Generacion de imagenes fotorrealistas para produccion: al llevar integrado el adaptador de fotorrealismo, el modelo produce resultados orientados a fotografia sin tener que encadenar un LoRA externo en el grafo de ComfyUI.
- Flujos de trabajo en ComfyUI simplificados: al usar UNETLoader en lugar de un nodo LoRA, se reduce el numero de nodos y se evitan problemas de gestion de fuerza o de compatibilidad del adaptador.
- Prototipado rapido con la variante turbo: con 8 pasos y cfg 1 se obtienen resultados en pocas iteraciones, adecuado para explorar prompts y composiciones antes de una pasada de mayor calidad.
- Fine-tuning sobre la base raw: los archivos bf16 y fp8 estan pensados explicitamente como base de entrenamiento, de modo que sirven para ajustar el modelo con diffusion-pipe u otros pipelines.
- Entrenamiento en hardware limitado: la variante fp8 de entrenamiento esta disenada para caber en tarjetas de 32 GB, lo que permite tareas de ajuste alli donde bf16 no entraria.
- Despliegue en produccion con checkpoints fp8 nativos: el archivo escalado usa el mismo layout de metadatos de cuantizacion que los fp8 oficiales de krea-2, lo que facilita sustituirlo en una infraestructura ya existente.
- Investigacion sobre merges y LoKr: el repositorio documenta de forma explicita la matematica del merge (`0.75 * kron(w1, w2)` sobre 256 pesos), lo que lo convierte en un caso de estudio reproducible sobre plegado de adaptadores LoKr.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El autor indica que el archivo fp8 de entrenamiento (`krea2-raw-re0.75-fp8.safetensors`) cabe en tarjetas de 32 GB.
- El archivo bf16 de entrenamiento (`krea2-raw-re0.75-bf16.safetensors`) esta en precision completa; no se especifica su huella de memoria ni la VRAM necesaria en la informacion disponible.
- Para inferencia se ofrece `krea2-turbo-re0.75-fp8-scaled.safetensors`, en fp8 con escalas por tensor; no se facilitan cifras exactas de VRAM para inferencia.
- No se detallan GPU concretas recomendadas (A100, H100, RTX 4090 u otras) en la informacion proporcionada.
- Despliegue: ComfyUI es el entorno documentado, con UNETLoader para el modelo, CLIPLoader de tipo `krea2` y VAE `qwen_image_vae`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El unico dato de rendimiento es el regimen de inferencia turbo, aproximadamente 8 pasos con cfg 1.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fbbcool/krea2-re-75 | Merge de krea-2 con adaptador de fotorrealismo a 0.75 | no disponible | no aplicable | no disponible | krea-2-license | HuggingFace |
| comfy-org/krea-2 | Modelo base texto-a-imagen | no disponible | no aplicable | no disponible | krea-2-license | HuggingFace |
| Realism Engine (Krea 2 v3.1, Civitai 2688234, RazzzHF) | Adaptador LoKr de fotorrealismo | no disponible | no aplicable | no disponible | no disponible en la informacion proporcionada | Civitai |

No se dispone de datos de parametros, contexto ni rendimiento para ninguno de los tres, por lo que la comparacion se limita al tipo de artefacto, la licencia y el canal de distribucion.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados, por lo que el rendimiento real frente a otras alternativas no esta cuantificado.
- Es un modelo derivado: todo el merito del adaptador corresponde a su autor (RazzzHF); este repositorio solo realiza el plegado en los pesos base.
- El repositorio registra 0 descargas y 0 likes, de modo que no existe validacion comunitaria de la calidad del merge.
- La licencia es krea-2-license (license: other); conviene revisar sus terminos antes de cualquier uso comercial, ya que no se detallan en la informacion disponible.
- Las variantes fp8 introducen perdida de precision respecto a bf16; en concreto, el archivo fp8 de entrenamiento solo convierte a fp8 las lineales de los bloques transformer y deja el resto en precision de origen.
- El parametro `alpha` almacenado es inerte en el LoKr de forma completa; cualquier flujo que espere un comportamiento de LoRA clasico puede interpretarlo de forma incorrecta.
- No se documentan idiomas soportados ni capacidades multilingues de los prompts.
- No se especifica la huella de memoria de las variantes ni la VRAM de inferencia, lo que dificulta planificar despliegues sin pruebas previas.
- Al ser un modelo de difusion texto-a-imagen, puede producir artefactos propios de esta familia (anatomias incorrectas, texto ilegible dentro de la imagen, texturas incoherentes), aunque la informacion disponible no los detalla.

## Enlaces

- [Modelo en HuggingFace: fbbcool/krea2-re-75](https://huggingface.co/fbbcool/krea2-re-75)
- [Modelo base: comfy-org/krea-2](https://huggingface.co/comfy-org/krea-2)
- [Adaptador original en Civitai: modelo 2688234, por RazzzHF](https://civitai.com/models/2688234)
- [ai-toolkit (herramienta de entrenamiento citada por el autor)](https://github.com/ostris/ai-toolkit)
- [LyCORIS / LoKr (descomposicion de adaptadores)](https://github.com/KohakuBlueleaf/LyCORIS)
