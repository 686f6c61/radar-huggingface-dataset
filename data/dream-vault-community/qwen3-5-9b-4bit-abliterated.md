# dream-vault-community/Qwen3.5-9B-4bit-Abliterated

## Resumen

Qwen3.5-9B-4bit-Abliterated es un reempaquetado en formato MLX de un modelo multimodal imagen-texto de 9.409.813.744 parametros, publicado por la organizacion dream-vault-community. No se trata de un entrenamiento nuevo: el autor ha tomado la revision fijada `8f07e7be51b454c39e8548d804110831cccc8912` de LethalDonkey/Gliese-Qwen3.5-9B-Abliterated-Caption-MLX-4bit, ha conservado los safetensors byte a byte y ha anadido un `preprocessor_config.json` plano para que el modelo funcione con el procesador Qwen3VL de mlx-swift-lm. El objetivo declarado es la compatibilidad con Dream Vault y con el ecosistema Swift de MLX.

El modelo pertenece a la familia Qwen3.5 segun la etiqueta `qwen3_5` y el `config` real (hidden size 4096), aunque la model card del autor original menciona Qwen3-VL-8B; esta discrepancia de nomenclatura queda documentada en la propia ficha. Incorpora su encoder de vision, esta cuantizado en 4 bits affine con group size 64 y esta especializado en captioning (generacion de descripciones de imagen), ademas de conservar el tokenizador y la plantilla de chat con soporte de imagenes del modelo de origen.

Su relevancia es acotada pero concreta: permite ejecutar localmente en Apple Silicon un modelo multimodal de ~9,4 mil millones de parametros con unas dependencias minimas (mlx-vlm o mlx-swift-lm), sin necesidad de GPUs NVIDIA ni de infraestructura de servidor. La contrapartida es que se trata de un artefacto de conveniencia, con cero descargas, un solo "like" y sin validacion publica mas alla de un smoke test sintetico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal imagen-texto de la familia Qwen3.5 (etiqueta `qwen3_5`, hidden size 4096) con encoder de vision integrado |
| Parametros totales | 9.409.813.744 (9,41 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine con group size 64 (unica variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 6,0 GB); incluye `preprocessor_config.json`, `processor_config.json` y tokenizer |

## Arquitectura y entrenamiento

Se trata de un transformer multimodal con encoder de vision embebido, derivado de la familia Qwen3.5. El `config` real identifica `qwen3_5` con hidden size 4096, y la configuracion del procesador de imagen conserva patch size, temporal patch size, merge size y limites de pixeles del modelo de origen. La presencia de un parche temporal sugiere capacidad de manejar entradas de video en la arquitectura subyacente, pero la model card no confirma ni valida inferencia con video, asi que no debe asumirse. El pipeline declarado en HuggingFace es `image-text-to-text`.

No ha habido entrenamiento ni ajuste adicional en este reempaquetado. El autor indica explicitamente que todos los safetensors se han preservado byte a byte y que el unico cambio es de compatibilidad: anadir un `preprocessor_config.json` plano derivado de la configuracion anidada existente, para el procesador Qwen3VL de Swift, manteniendo intactos el `processor_config.json` original, la configuracion del modelo, el tokenizador y la plantilla de chat con soporte de imagenes. La ablacion (`abliterated`) es una caracterizacion del autor original, no una modificacion realizada aqui, y no hay datos publicados sobre corpus de entrenamiento, numero de tokens, composicion del dataset ni etapas de RLHF/DPO.

## Capacidades

- Generacion de texto conversacional a partir de entradas de imagen y texto (pipeline `image-text-to-text`).
- Captioning o descripcion automatica de imagenes, que es la especialidad declarada del derivado Gliese del que procede.
- Comprension de imagen combinada con prompt textual, segun la plantilla de chat con soporte de imagenes que se conserva.
- Vision integrada: el encoder de vision esta incluido en el repo, no se carga como modulo externo.
- Conversacion multiturno con historial de imagenes y texto, segun la etiqueta `conversational`.
- Comportamiento "abliterated" segun la caracterizacion del autor original (no verificado ni garantizado por este reempaquetado).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades de audio: no disponibles.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Generacion automatica de pies de foto y metadatos alt-text para bibliotecas de imagenes: el modelo acepta una imagen mas un prompt y devuelve una descripcion en una sola llamada, lo que permite indexar catalogos fotograficos en local sin enviar el material a un servicio en la nube.
- Accesibilidad web y de producto: generar descripciones textuales de imagenes para lectores de pantalla o fichas de e-commerce, ejecutando el modelo en un Mac de desarrollo o en un portatil Apple Silicon.
- Prototipado rapido de funciones multimodales en apps Swift: al estar preparado para mlx-swift-lm, se puede integrar en una app de macOS o iOS para clasificar o describir imagenes capturadas por el usuario, sin backend adicional.
- Preetiquetado de datasets de vision: usar el modelo para producir descripciones iniciales de un corpus de imagenes que despues se revisan o corrigen manualmente, aprovechando que la inferencia es local y gratuita por llamada.
- Asistencia a la moderacion de contenido visual en pequenos flujos: pedir al modelo una descripcion estructurada de una imagen para que un revisor humano decida con mas contexto, sin depender de APIs externas con coste por token.
- Automatizacion de documentacion tecnica: describir capturas de pantalla, diagramas o interfaces para incorporarlas a manuales y notas de version, con temperatura 0.0 para obtener salidas mas deterministas.
- Investigacion sobre ablacion y comportamiento de modelos multimodales: comparar las respuestas de este derivado con las del modelo de origen para estudiar como afecta la ablacion a las descripciones generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente remite a `validation/REPORT.md`, que el propio autor describe como un smoke test con una imagen sintetica, no como una evaluacion general de comprension de imagenes. No se dispone de cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra prueba estandar, ni de latencias o throughput medidos.

## Requisitos de hardware

- Pesos: aproximadamente 6,0 GB en disco (tamano declarado del repositorio) para los 9,41 mil millones de parametros en 4-bit affine con group size 64.
- Plataforma: exclusivamente Apple Silicon con MLX (M1, M2, M3, M4 o posteriores) y soporte Metal. Al ser un repo MLX, no hay pesos GGUF ni safetensors en formato PyTorch-CUDA, por lo que no se puede cargar directamente en GPU NVIDIA.
- Memoria unificada: se estima que 8 GB es un minimo ajustado (los pesos rondan los 6 GB y hay que sumar el encoder de vision, la cache KV y el propio sistema operativo); 16 GB o mas es lo recomendable para trabajar con imagenes de entrada a resoluciones altas. No hay cifras oficiales publicadas.
- GPU: no aplicable en el sentido tradicional. No se ha validado en A100, H100 ni RTX 4090, y el formato de pesos no es compatible con ellas sin conversion previa.
- Cabe en GPU de consumo: no en el sentido de GPUs discretas; si cabe en un Mac con memoria unificada de 16 GB o superior.
- Opciones de despliegue: mlx-vlm en Python (el comando de la model card es `python -m mlx_vlm.generate --model dream-vault-community/Qwen3.5-9B-4bit-Abliterated --image /ruta/imagen.png --prompt "Describe this image." --max-tokens 256 --temperature 0.0`) y mlx-swift-lm para aplicaciones Swift, que es precisamente el motivo de este reempaquetado. Se requiere una version de mlx-vlm que soporte Qwen3.5.
- vLLM, llama.cpp, Ollama y TGI: no disponibles para este artefacto, dado que el formato es MLX y el repositorio no publica conversiones alternativas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| dream-vault-community/Qwen3.5-9B-4bit-Abliterated | 9,41 mil millones | no disponible | 4-bit affine, group size 64 | apache-2.0 | MLX, Apple Silicon | sin benchmarks publicados |
| LethalDonkey/Gliese-Qwen3.5-9B-Abliterated-Caption-MLX-4bit (origen directo) | misma base | no disponible | 4-bit | apache-2.0 (declarada, sin fichero de licencia) | MLX | sin benchmarks publicados |
| Qwen/Qwen3.5-9B (mencionado como origen de la licencia) | 9B declarados | no disponible | no disponible | apache-2.0 | no disponible en la informacion proporcionada | sin benchmarks publicados |
| Qwen3-VL-8B (referenciado en la model card del autor original) | 8B declarados | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | sin benchmarks publicados |

La comparacion cuantitativa no es posible con los datos disponibles: no hay cifras de rendimiento para ninguna de las alternativas y la propia model card del autor original mezcla la denominacion Qwen3-VL-8B con un `config` que identifica Qwen3.5 y hidden size 4096, por lo que la identificacion exacta de la arquitectura subyacente no esta cerrada.

## Limitaciones y advertencias

- La ablacion es una caracterizacion del autor del modelo original, no una garantia de comportamiento concreto; el autor de este reempaquetado lo advierte de forma explicita.
- Las descripciones de imagen generadas pueden ser inexactas. El propio autor senala este riesgo y anade que la calidad y el comportamiento de seguridad no se han evaluado de forma exhaustiva para este reempaquetado.
- La unica validacion publicada es un smoke test con una imagen sintetica y una salida en Swift; no es un benchmark de comprension de imagenes ni cubre todos los tiempos de ejecucion.
- No se declaran idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano o en cualquier otro idioma concreto.
- La longitud de contexto no esta publicada, lo que complica dimensionar conversaciones de muchos turnos o imagenes de gran resolucion (los limites de pixeles no se detallan en la informacion disponible).
- Licencia: el repositorio declara apache-2.0, pero el autor indica que el upstream inmediato no incluye fichero de licencia y que el `LICENSE` se ha copiado del release original de Qwen3.5-9B. Conviene revisar la cadena de procedencia (`PROVENANCE.json`, `SHA256SUMS`, `UPSTREAM_README.md`) antes de un uso comercial.
- Portabilidad: al ser un artefacto MLX, queda restringido a Apple Silicon. No hay conversiones a GGUF ni a otros formatos en el repositorio.
- Senales de adopcion practicamente nulas: 0 descargas y 1 "like" en el momento de la consulta, sin resultados de busqueda web relevantes que aporten contexto adicional o verificacion independiente.
- Ambiguedad de nomenclatura: la etiqueta `qwen3_5` y el hidden size 4096 no coinciden con la referencia a Qwen3-VL-8B de la model card de origen, lo que puede llevar a error al seleccionar versiones de librerias o al comparar con otros modelos.
- No se ha confirmado soporte de tool calling, agentes, audio ni modo de razonamiento explicito; no conviene asumir estas capacidades en produccion sin probarlas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dream-vault-community/Qwen3.5-9B-4bit-Abliterated
- Modelo base (upstream inmediato): https://huggingface.co/LethalDonkey/Gliese-Qwen3.5-9B-Abliterated-Caption-MLX-4bit/tree/8f07e7be51b454c39e8548d804110831cccc8912
- Licencia de origen copiada del release de Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B/blob/c202236235762e1c871ad0ccb60c8ee5ba337b9a/LICENSE
- Ficheros de procedencia en el repositorio: `PROVENANCE.json`, `SHA256SUMS`, `UPSTREAM_README.md`
- Informe de validacion del autor: `validation/REPORT.md` (dentro del repositorio)
- Las busquedas web realizadas no devolvieron enlaces relevantes al modelo; los resultados obtenidos correspondian a marcas y creadores de contenido sin relacion con este artefacto.
