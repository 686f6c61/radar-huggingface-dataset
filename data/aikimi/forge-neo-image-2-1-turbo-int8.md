# Aikimi/Forge-Neo-Image-2.1-Turbo-INT8

## Resumen

Forge Neo Image 2.1 Turbo INT8 es una conversion no oficial a INT8 de Qwen Image 2.1 Turbo, publicada por Aikimi para su entorno de generacion de imagen Aikimi Forge Neo. No se trata de un modelo entrenado desde cero: el autor parte de los pesos de Qwen/Qwen-Image-2.1-Turbo (revision d65dbc9a7e8f6b5479e33dee6030eaab2a906509) y aplica cuantizacion de los pesos Lineales seleccionados del transformer de generacion y del codificador de texto compartido Qwen3-VL. El repositorio suma 7.116.566.528 parametros (segun los safetensors) y ocupa 17,3 GB, frente al checkpoint BF16 original, mas pesado.

El objetivo practico es evitar la cuantizacion en GPU antes de la inferencia: el importador de Forge Neo instala el transformer y el codificador ya cuantizados y verificados por hash, de modo que el usuario puede seleccionar el preset "Turbo oficial - INT8 - 8 pasos" en Qwen Image 2.1 Studio. La distribucion incluye un manifiesto de integridad (release_manifest.json) con revisiones de origen, recetas de conversion, versiones de runtime y SHA-256 de cada componente.

Es relevante ahora porque reduce la barrera de hardware para un modelo de generacion y edicion de imagen de ~7.100 millones de parametros, verificado por el autor en una unica RTX 3090 de 24 GB. Sus limitaciones son igualmente claras: la licencia Qwen Research restringe el uso y la redistribucion a investigacion y evaluacion no comerciales, el modelo no es un pipeline completo (falta VAE, procesador y configuracion de muestreo, que aporta Neo) y el autor no reclama paridad de calidad con BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de generacion para text-to-image (pipeline de difusion con FlowMatchEulerDiscreteScheduler) mas codificador de texto compartido Qwen3-VL |
| Parametros totales | 7.116.566.528 (dato real de los safetensors) |
| Parametros activos | No aplica: no se describe como modelo MoE |
| Longitud de contexto | No disponible (el codificador de texto Qwen3-VL se distribuye como componente, sin longitud de contexto publicada en la ficha) |
| Tipos de cuantizacion | INT8 (formato de guardado bitsandbytes de Diffusers/Transformers); el modelo base de referencia esta en BF16 |
| Idiomas soportados | Ingles (en), japones (ja) |
| Licencia | qwen-research (licencia "other", nombre qwen-research); codigo del importador bajo AGPLv3 |
| Formato de pesos | safetensors (save_pretrained de Diffusers/Transformers en bitsandbytes INT8) |
| Pipeline | text-to-image (tag del Hub); tambien etiquetado como image-editing |
| Modelo base | Qwen/Qwen-Image-2.1-Turbo (relacion: quantized) |
| Fuente del codificador | Qwen/Qwen-Image-2.1, revision b3179ad355be050328e483a9dfdd9e60cd62adfa |
| Tamano del repositorio | 17,3 GB |
| Pasos de muestreo | 8 pasos oficiales (ocho valores sigma, CFG 1, dynamic shifting desactivado) |
| Resoluciones verificadas | 768 x 768 (text-to-image y edicion por referencia) y 832 x 832 (outpaint nativo) |

## Arquitectura y entrenamiento

El repositorio contiene dos componentes: el transformer de generacion cuantizado y el codificador de texto compartido Qwen3-VL. La conversion modifica pesos Lineales seleccionados en `transformer/` y `text_encoder/`, mientras que determinados modulos de entrada, modulacion, normalizacion, time embedding y salida conservan la precision del modelo de origen. Los ficheros se guardan con los formatos `save_pretrained` de Diffusers/Transformers para bitsandbytes INT8. El muestreo sigue la configuracion oficial: ocho valores sigma, CFG 1 y FlowMatchEulerDiscreteScheduler con dynamic shifting desactivado.

No hubo entrenamiento adicional ni ajuste fino: la model card indica explicitamente que no se realizo ningun tipo de entrenamiento sobre los pesos de Qwen. Por tanto, no hay datos sobre composicion del dataset, numero de tokens de entrenamiento, RLHF o DPO del modelo base; no estan disponibles en la informacion proporcionada. La innovacion tecnica del release es de empaquetado: un importador que valida la identidad de origen de cada componente, la receta de conversion y las versiones de runtime, y comprueba los hashes SHA-256 de cada payload antes de instalarlo. El manifiesto incluye revisiones de origen, recetas, versiones de runtime y hashes de los ficheros exportados.

El autor documento pruebas de verificacion en una NVIDIA RTX 3090 de 24 GB (driver 610.74, PyTorch 2.13.0+cu130): ejecuciones de text-to-image y edicion por referencia a 768 x 768, outpaint nativo a 832 x 832 y una recarga del modelo. Todas registraron los ocho timesteps oficiales, y las salidas de text-to-image original y recargada dieron hashes de pixel identicos. Estas comprobaciones cubren los ajustes probados, no una paridad general de calidad con BF16.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) con el preset oficial de 8 pasos.
- Edicion de imagen por referencia, segun las pruebas de "reference-editing" a 768 x 768 documentadas por el autor.
- Outpaint nativo hasta 832 x 832.
- Prompts en ingles y japones (los dos idiomas declarados).
- Inferencia en 8 timesteps con CFG 1, lo que reduce coste por imagen frente a configuraciones de mas pasos.
- Ahorro de la cuantizacion en GPU previa a la inferencia: los pesos Lineales ya llegan en INT8, con modulos sensibles conservados en la precision de origen.
- Combinable con LoRA, ControlNet, Outpaint y Sparse en el entorno Neo, cada uno con sus propios limites documentados en la guia Turbo.
- Tool calling y function calling: no disponible (no aplica a un modelo de difusion de imagen).
- Comportamiento de agente o razonamiento multi-paso: no disponible.
- Capacidades de audio o vision general: no disponibles; el unico componente multimodal es el codificador de texto Qwen3-VL.

## Casos de uso

- Prototipado visual rapido en estudio de diseno: con 8 pasos y CFG 1 se pueden generar variantes a 768 x 768 en pocos segundos, utiles para explorar composicion, iluminacion y paleta antes de producir el render final en BF16.
- Edicion por referencia en flujos de retoque: el pipeline admite entrada de imagen de referencia, lo que permite reescribir una escena manteniendo la identidad visual del original sin reentrenar nada.
- Ampliacion de lienzo (outpaint) en produccion de contenido: el autor verifico outpaint nativo a 832 x 832, adecuado para adaptar ilustraciones a formatos mas anchos sin recortar el encuadre.
- Investigacion sobre cuantizacion INT8 en difusion: el release incluye manifiesto, recetas y hashes, lo que facilita reproducir el experimento y medir la degradacion frente a BF16 en composicion, texto renderizado y color.
- Generacion de material grafico en japones: es uno de los dos idiomas declarados, util para prompts en japones en proyectos de investigacion o evaluacion con ese idioma.
- Despliegue en hardware de gama alta de consumo: verificado en una RTX 3090 de 24 GB, permite ejecutar un modelo de ~7.100 millones de parametros en una sola GPU no profesional.
- Pipelines con LoRA o ControlNet en investigacion: el modelo se integra en la guia Turbo de Neo junto a estos adaptadores, lo que sirve para estudiar combinaciones de control estructural con pesos cuantizados.
- Evaluacion comparativa INT8 vs BF16 dentro de Neo: al mantener el BF16 oficial instalado y poder alternar presets, se pueden lanzar comparativas controladas con la misma semilla y los mismos ocho timesteps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta verificaciones funcionales: text-to-image y edicion por referencia a 768 x 768, outpaint nativo a 832 x 832, una recarga del modelo, ocho timesteps en todas las ejecuciones y hashes de pixel identicos entre la salida de text-to-image original y la recargada. No se publican cifras de calidad (FID, CLIP, evaluaciones humanas) ni comparaciones numericas con BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. El autor verifico el modelo en una NVIDIA RTX 3090 con 24 GB de VRAM; no se indica el minimo real ni el consumo con offload de CPU.
- GPU recomendadas: no hay lista oficial. El unico equipo documentado en las pruebas es una RTX 3090 de 24 GB. Se requiere CUDA con soporte de BF16.
- Compatibilidad con GPU de consumo: si, al menos en el caso probado de una RTX 3090 de 24 GB. No se confirma funcionamiento en GPU con menos VRAM.
- Runtime de referencia: driver 610.74 y PyTorch 2.13.0+cu130, segun el manifiesto. Neo proporciona su propio runtime aislado con el loader y la gestion de CPU-offload necesarios.
- Despliegue: Aikimi Forge Neo en Windows, mediante `aikimi-qwen-image21-setup.bat --official-turbo-only`, descarga con `hf.exe download` e instalacion con `tools\qwen21_hub_release.py install --precision turbo_official_int8`. Tambien es compatible con el ecosistema Diffusers por el formato de los pesos.
- Requisito adicional: Neo exige mantener instalados los ficheros oficiales BF16 del modelo fuente. La version INT8 no elimina la descarga del modelo original ni sustituye sus pesos.
- Latencia y throughput: no disponibles. Solo se conoce el numero de pasos (8) y el scheduler empleado; no hay tiempos por imagen publicados.
- Tamano en disco: 17,3 GB para este repositorio, mas los ficheros BF16 oficiales que Neo requiere conservar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Forge Neo Image 2.1 Turbo INT8 (Aikimi) | 7.116.566.528 | No disponible | INT8 (bitsandbytes) | qwen-research (solo investigacion y evaluacion no comercial) | HuggingFace, requiere Forge Neo y los BF16 oficiales |
| Qwen/Qwen-Image-2.1-Turbo (base) | No disponible en la informacion proporcionada | No disponible | BF16 | qwen-research (heredada por la conversion) | HuggingFace, checkpoint oficial |
| Qwen/Qwen-Image-2.1 | No disponible | No disponible | BF16 | no disponible | HuggingFace; aporta el codificador de texto compartido |

No se dispone de datos de benchmarks ni de otros modelos de la misma categoria en la informacion proporcionada, por lo que no se puede establecer una comparacion de rendimiento con alternativas de terceros.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. La model card no documenta sesgos del modelo base ni de esta conversion.
- La cuantizacion altera los valores numericos y puede afectar a la composicion, el texto renderizado, los colores y los detalles. El autor no reclama paridad de pixel ni de calidad con BF16.
- Las verificaciones cubren unicamente los ajustes probados (768 x 768 en text-to-image y edicion por referencia, 832 x 832 en outpaint) y no son extrapolables a cualquier configuracion.
- Licencia restrictiva: uso y redistribucion limitados a investigacion o evaluacion no comercial bajo la Qwen Research License. El codigo del importador usa AGPLv3, con condiciones distintas a las de los pesos.
- Se trata de una conversion no oficial: Qwen aporta los pesos de origen, pero esta distribucion la mantiene Aikimi y no cuenta con soporte del proveedor original.
- No es un pipeline de imagen completo: falta el VAE, el procesador y la configuracion de muestreo oficial, que aporta el entorno Neo.
- Dependencia del entorno: el importador esta vinculado a las versiones de runtime registradas en el manifiesto y crea un manifiesto de cache ligado a la maquina receptora. Si las versiones difieren, hay que preparar una conversion local en ese entorno.
- Requiere conservar los ficheros BF16 oficiales instalados, con el coste de disco y de descarga que ello implica.
- Cobertura de idiomas limitada a ingles y japones; cualquier otro idioma no esta declarado.
- Solo se han documentado pruebas en Windows y en una RTX 3090; no hay datos de estabilidad en otras plataformas o aceleradores.
- Combinaciones adicionales con LoRA, ControlNet, Outpaint y Sparse tienen limites propios descritos en la guia Turbo de Neo, no cubiertos por esta ficha.
- Riesgo de alucinacion: no disponible en el sentido de texto; en generacion de imagen, el riesgo se traduce en artefactos o incoherencias compositivas no cuantificadas en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aikimi/Forge-Neo-Image-2.1-Turbo-INT8
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Fuente del codificador de texto compartido: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio de Aikimi Forge Neo: https://github.com/AiWithYou/aikimi-forge-neo
- Guia Turbo oficial de Neo: https://github.com/AiWithYou/aikimi-forge-neo/blob/neo/docs/qwen21-official-turbo.md
- Licencia de los pesos (Qwen Research): https://huggingface.co/Aikimi/Forge-Neo-Image-2.1-Turbo-INT8/blob/main/LICENSE
