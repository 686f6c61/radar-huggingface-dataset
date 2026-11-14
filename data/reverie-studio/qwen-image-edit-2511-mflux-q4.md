# reverie-studio/qwen-image-edit-2511-mflux-q4

## Resumen

`reverie-studio/qwen-image-edit-2511-mflux-q4` es una cuantizacion a 4 bits del modelo de edicion de imagenes Qwen-Image-Edit-2511 de Qwen, empaquetada especificamente para su uso con la libreria mflux (implementacion de Flux en MLX para Apple Silicon). El modelo base es un transformer de difusion para edicion de imagenes por instrucciones en lenguaje natural, y esta version ha sido generada con `mflux-save` de mflux 0.24.0 sin modificaciones adicionales sobre los pesos originales, salvo la propia cuantizacion.

El repositorio lo mantiene Reverie Studio, un tercero no afiliado a Qwen, con el objetivo de centralizar las descargas de su aplicacion en un unico punto. No se trata por tanto de un modelo nuevo ni de un fine-tune: es un espejo cuantizado del checkpoint oficial de Qwen, identificado con la revision `6f3ccc0b56e431dc6a0c2b2039706d7d26f22cb9` del repositorio origen.

Su relevancia practica radica en que permite ejecutar un modelo de edicion de imagenes de gran tamano en hardware Apple Silicon mediante MLX, reduciendo el peso del repositorio a 29 GB y habilitando, segun el autor, su combinacion con el LoRA Lightning de 4 pasos publicado por el mismo estudio para acelerar la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen-Image-Edit-2511, transformer de difusion para edicion de imagenes) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (generada con `mflux-save` de mflux 0.24.0) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de parametros ni el proceso de entrenamiento del modelo base Qwen-Image-Edit-2511 en la informacion proporcionada. La model card de esta version cuantizada no describe el diseno del modelo, los datos de entrenamiento ni si hubo etapas de RLHF o DPO.

Lo unico documentado es el proceso de cuantizacion: los pesos se han convertido a 4 bits con la herramienta `mflux-save` de mflux 0.24.0 a partir del checkpoint oficial de Qwen, y el autor indica que el modelo queda "por lo demas sin cambios". El repositorio incluye un fichero `SHA256SUMS` con la suma de verificacion de cada fichero. El autor menciona ademas que Reverie lo utiliza junto al LoRA Lightning de 4 pasos alojado en `reverie-studio/Qwen-Image-Edit-2511-Lightning`, lo que sugiere un flujo de inferencia con decodificacion acelerada por destilacion, aunque no se detallan los metodos de entrenamiento de dicho LoRA.

## Capacidades

- Edicion de imagenes guiada por instrucciones en lenguaje natural, heredada del modelo base Qwen-Image-Edit-2511.
- Ejecucion sobre Apple Silicon mediante MLX y la libreria mflux.
- Carga como modelo local en mflux 0.24.0 pasando la carpeta del repositorio como parametro `--model`, con `--base-model qwen-image-edit-2511` cuando la herramienta lo requiera.
- Compatibilidad declarada con el LoRA Lightning de 4 pasos de Reverie para reducir el numero de pasos de inferencia.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision adicional, audio ni modo de razonamiento.

## Casos de uso

- Edicion de imagenes por instrucciones en local sobre Mac: el modelo se carga en mflux y permite modificar imagenes existentes mediante prompts de texto sin enviar datos a servicios en la nube, lo que resulta adecuado para flujos de trabajo con material sensible.
- Prototipado rapido de herramientas de retoque asistido: gracias a la cuantizacion a 4 bits y al LoRA Lightning de 4 pasos, se puede iterar sobre variaciones de una imagen con un coste de inferencia reducido en comparacion con el checkpoint completo.
- Integracion en aplicaciones de escritorio para macOS: el formato MLX y la estructura de repositorio unico facilitan que una app descargue el modelo desde un solo punto, tal como hace la aplicacion de Reverie.
- Automatizacion de pipelines de edicion por lotes: un script que recorra un directorio de imagenes y aplique instrucciones predefinidas (por ejemplo, cambios de fondo o estilo) puede ejecutarse en estaciones de trabajo Apple sin GPU dedicada.
- Investigacion sobre cuantizacion de modelos de difusion: el repositorio sirve como referencia reproducible de una cuantizacion a 4 bits con mflux 0.24.0 sobre un modelo de edicion, con sumas SHA256 para verificar la integridad de los pesos.
- Evaluacion comparativa de calidad entre el checkpoint original y la version cuantizada: al mantener la licencia Apache-2.0 y los pesos en safetensors, se pueden ejecutar pruebas A/B de fidelidad de edicion entre ambas versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 29,0 GB, por lo que se requiere memoria unificada suficiente para cargar los pesos cuantizados a 4 bits mas el overhead de inferencia.
- GPU recomendadas: no disponible; el modelo esta empaquetado para MLX, orientado a Apple Silicon (chips de la familia M), no a GPU NVIDIA.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; depende de la memoria unificada del equipo Apple Silicon utilizado.
- Opciones de despliegue: mflux 0.24.0 (unica via documentada), pasando la carpeta como `--model` y `--base-model qwen-image-edit-2511` cuando corresponda.
- Latencia y throughput: no disponibles; el autor sugiere el uso del LoRA Lightning de 4 pasos para acelerar la generacion, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reverie-studio/qwen-image-edit-2511-mflux-q4 | no disponible | no disponible | safetensors (MLX, 4 bits) | Apache-2.0 | Hugging Face |
| Qwen/Qwen-Image-Edit-2511 (original) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |
| reverie-studio/Qwen-Image-Edit-2511-Lightning (LoRA) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas del modelo original ni del LoRA como para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es una cuantizacion a 4 bits: puede producirse una perdida de fidelidad en la edicion respecto al checkpoint original de Qwen, no cuantificada en la informacion disponible.
- Repositorio de terceros: Reverie Studio no es el autor del modelo base; la responsabilidad sobre el comportamiento del modelo recae en Qwen, y la cuantizacion no ha sido validada oficialmente por el autor original.
- Dependencia estricta de mflux 0.24.0 y del ecosistema MLX; no es directamente utilizable en vLLM, llama.cpp, Ollama ni TGI.
- Requiere hardware Apple Silicon; no se documenta soporte para GPU NVIDIA u otras plataformas.
- Sin datos publicados sobre sesgos, tasa de alucinacion visual, idiomas soportados ni limitaciones de contexto.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda conservar el aviso de licencia y la atribucion a Qwen incluidos en el repositorio.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de comunidad ni de validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/reverie-studio/qwen-image-edit-2511-mflux-q4
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- LoRA Lightning de Reverie: https://huggingface.co/reverie-studio/Qwen-Image-Edit-2511-Lightning
- Perfil de Reverie Studio: https://huggingface.co/reverie-studio
- Libreria mflux: https://github.com/filipstrand/mflux
