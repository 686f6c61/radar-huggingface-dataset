# OzzyGT/YuE2-Modular

## Resumen

YuE2-Modular es un paquete de bloques de Diffusers (Modular Diffusers) publicado por el desarrollador OzzyGT (Alvaro Somoza) que envuelve el modelo de generacion musical m-a-p/YuE2-3B, desarrollado por el grupo multimodal-art-projection. Su funcion es permitir la generacion de canciones completas a partir de una descripcion de estilo y una letra, produciendo audio estereo a 48 kHz. Internamente, el sistema planifica primero una partitura simbolica editable (formato ABC) y despues la renderiza con voces y acompanamiento instrumental.

Tecnicamente es un adaptador de infraestructura, no un modelo entrenado desde cero: reutiliza los pesos de m-a-p/YuE2-3B y el VAE de m-a-p/YuE2-Vae, y aporta el codigo de orquestacion para el pipeline de Diffusers. La arquitectura combina generacion simbolica (planificacion de partitura) con sintesis de audio mediante un transformer y un VAE, siguiendo el enfoque de YuE2 descrito por sus autores como "planificacion simbolica" con covers zero-shot y edicion musical agentica.

Es relevante ahora porque YuE2 se presenta publicamente como un modelo abierto de generacion musical de calidad competitiva con sistemas propietarios como Suno v5/v6, y este repositorio concreto ofrece una via de integracion practica en el ecosistema Diffusers para desarrolladores que quieran incorporar generacion de canciones en sus pipelines. El modelo base tiene aproximadamente 3.000 millones de parametros segun su nomenclatura, soporta ingles y chino, y su licencia de pesos es no comercial (CC BY-NC 4.0), lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline Diffusers modular (bloques) sobre YuE2: generacion simbolica de partitura + sintesis de audio con transformer y VAE |
| Parametros totales | 3B (segun la nomenclatura del modelo base m-a-p/YuE2-3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el ejemplo oficial carga el transformer en bfloat16 y el VAE en float32 |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | codigo Apache-2.0; pesos CC BY-NC 4.0 (no comercial) |
| Formato de pesos | componentes Diffusers (transformer y VAE); el ejemplo usa `ModularPipelineBlocks.from_pretrained` con `components_repo` |
| Salida de audio | estereo 48 kHz |
| Libreria | diffusers (Modular Diffusers) |
| Pipeline | text-to-audio |
| Modelo base | m-a-p/YuE2-3B, m-a-p/YuE2-Vae |
| Fecha de creacion | 2026-09-23 |

## Arquitectura y entrenamiento

YuE2 combina dos fases: una primera de planificacion simbolica en la que el modelo escribe una partitura editable en notacion ABC a partir del estilo y la letra, y una segunda que convierte esa estructura en audio real con voces e instrumentacion. Este repositorio no contiene el entrenamiento, sino los bloques de Modular Diffusers que orquestan esa generacion: el usuario inicializa el pipeline, carga los componentes del repositorio OzzyGT/YuE2-3B-Diffusers y ejecuta la inferencia pasando estilo, letra y semilla. El codigo esta adaptado del repositorio oficial multimodal-art-projection/YuE, mientras que los pesos proceden del modelo YuE2-3B de m-a-p.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que esos datos no aparecen en la informacion proporcionada. La innovacion tecnica destacable del sistema subyacente es la planificacion simbolica: al generar primero una partitura editable, se permite la edicion posterior de la composicion, la generacion de covers zero-shot a partir de audio de referencia y flujos de edicion musical asistidos por agente. El ejemplo oficial emplea `use_cuda_graph=True` para acelerar la inferencia.

## Capacidades

- Generacion de canciones completas a partir de una descripcion de estilo textual y una letra estructurada por secciones (por ejemplo `[Verse]`, `[Chorus]`).
- Planificacion simbolica previa: el sistema elabora una partitura editable en notacion ABC antes de sintetizar el audio.
- Sintesis de audio estereo a 48 kHz con voces e instrumentacion.
- Control de estilo mediante prompt (genero, instrumentacion, tipo de voz, tempo en BPM, idioma).
- Salida reproducible mediante semilla (el ejemplo usa `seed=831001`).
- Cubre el idioma ingles y chino.
- Covers zero-shot y edicion musical agentica, segun la descripcion publica de YuE2.
- No se documenta en la informacion disponible soporte de tool calling, function calling ni razonamiento multi-paso generico.

## Casos de uso

- Prototipado musical rapido: un compositor introduce una descripcion de estilo y una letra y obtiene en una sola pasada una maqueta de cancion a 48 kHz que puede usar como referencia antes de producirla en estudio.
- Generacion de bandas sonoras para contenido audiovisual: el control de estilo (genero, instrumentacion, BPM) y la duracion variable permiten crear temas ajustados a escenas concretas de video o podcast.
- Localizacion musical ingles-chino: al soportar ambos idiomas, un mismo tema puede adaptarse a mercados angloparlantes y sinofonos cambiando el prompt de idioma y la letra.
- Investigacion en generacion musical simbolica: el hecho de producir una partitura ABC editable permite estudiar y modificar la estructura armonica antes de la sintesis, util en trabajos academicos sobre planificacion simbolica.
- Edicion musical asistida: gracias a la partitura intermedia, se puede iterar sobre secciones concretas de la composicion sin regenerar la pieza completa.
- Integracion en herramientas creativas: el repositorio nvmax/ComfyUI-YuE2 demuestra su uso como nodo dentro de ComfyUI, lo que habilita flujos de produccion musical dentro de interfaces de generacion visual.
- Generacion de jingles y musica de fondo bajo demanda: con prompts de estilo cortos y control de tempo, se pueden producir piezas breves para anuncios o contenido corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia comparativa cualitativa es la afirmacion de los autores del modelo base de que la calidad de cancion es "competitiva con Suno v5/v6", sin cifras objetivas asociadas en la documentacion consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 8-12 GB en bfloat16 para el transformer de 3B, mas el VAE en float32; son estimaciones a partir del tamano del modelo, no cifras oficiales.
- El ejemplo oficial carga el transformer en `torch.bfloat16` y el VAE en `torch.float32` y mueve el pipeline a CUDA con `pipe.to("cuda")`.
- Aceleracion opcional mediante `use_cuda_graph=True` en el ejemplo.
- GPU recomendadas: no especificadas por el autor; por tamano, una GPU con 12-16 GB o mas de VRAM es un punto de partida razonable.
- No hay datos oficiales sobre si cabe en GPU de consumo (por ejemplo RTX 4090); por tamano del modelo deberia ser factible, pero no esta confirmado en la informacion disponible.
- Opciones de despliegue: Diffusers (Modular Diffusers) como via principal; ComfyUI mediante el nodo nvmax/ComfyUI-YuE2, que anuncia una aceleracion nativa de aproximadamente 4x. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Dependencias adicionales obligatorias: `tiktoken` y `soundfile` (`pip install tiktoken soundfile`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia de pesos | Disponibilidad |
|---|---|---|---|---|
| OzzyGT/YuE2-Modular (este) | 3B (base YuE2-3B) | no disponible | CC BY-NC 4.0 (codigo Apache-2.0) | Hugging Face + ComfyUI |
| MusicGen (Meta) | 300M / 1,5B / 3,3B | no disponible | CC-BY-NC 4.0 (pesos), MIT (codigo) | Hugging Face, transformers / audiocraft |
| Stable Audio Open (Stability AI) | ~1,1B | no disponible | Stability AI Community License | Hugging Face, diffusers |
| YuE original (m-a-p) | ~7B (etapa 1) + etapa 2 | no disponible | consultar repositorio oficial | Hugging Face, repositorio multimodal-art-projection/YuE |
| Suno v5/v6 | no disponible | no disponible | propietaria, servicio cerrado | solo via servicio online |

Nota: los datos de parametros y licencias de los modelos comparables corresponden a informacion publica general y deben verificarse en sus repositorios antes de cualquier uso en produccion. No se dispone de comparativas de rendimiento objetivas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia de pesos no comercial: CC BY-NC 4.0 impide el uso comercial del modelo tal cual; solo el codigo es Apache-2.0. Cualquier producto comercial requiere revisar y negociar la licencia de los pesos.
- Idiomas limitados a ingles y chino; no se documentan capacidades en castellano ni en otros idiomas.
- Se trata de un repositorio de envoltura (bloques Diffusers), no de un modelo autonomo: depende de los pesos y el codigo de OzzyGT/YuE2-3B-Diffusers, lo que anade un punto de fallo en la cadena de dependencias.
- Requiere `trust_remote_code=True` y `trust_components_code=True`, lo que implica ejecutar codigo remoto no auditado; conviene revisarlo antes de usarlo en entornos sensibles.
- Riesgo de alucinacion en el sentido de que la letra cantada puede no coincidir exactamente con la introducida, o la instrumentacion puede desviarse del estilo solicitado; no hay metricas publicadas de fidelidad.
- No hay informacion sobre sesgos del modelo, gestion de derechos de autor del audio generado ni politicas de contenido.
- Sin datos de benchmarks, latencia, throughput ni pruebas de estres: la evaluacion depende de validacion propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion comunitaria.
- Fechas de creacion y actualizacion (2026-09-23) muy proximas entre si, sin historial de mantenimiento.

## Enlaces

- Repositorio Hugging Face de este modelo: https://huggingface.co/OzzyGT/YuE2-Modular
- Repositorio de pesos y codigo: https://huggingface.co/OzzyGT/YuE2-3B-Diffusers
- Modelo base: https://huggingface.co/m-a-p/YuE2-3B
- Perfil del autor: https://huggingface.co/OzzyGT
- Repositorio oficial de YuE (multimodal-art-projection): https://github.com/multimodal-art-projection/YuE
- Web oficial de YuE2: https://yue2ai.app/
- Pagina de proyecto de YuE2: https://map-yue2.github.io/
- Nodo ComfyUI para YuE2: https://github.com/nvmax/ComfyUI-YuE2
- Ejemplo de audio (dataset de ejemplos): https://huggingface.co/datasets/OzzyGT/diffusers-examples/resolve/main/yue2/city_lights.mp3
