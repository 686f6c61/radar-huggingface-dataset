# asahi-jp/plamo-3-translate-0.8b-int8-ov

## Resumen
plamo-3-translate-0.8b-int8-ov es una version cuantizada a INT8 en formato OpenVINO IR del modelo de traduccion pfnet/plamo-3-translate-0.8b, desarrollado originalmente por Preferred Networks (PFN) dentro de la familia PLaMo 3. La conversion y publicacion corre a cargo del usuario asahi-jp, que emplea Optimum-Intel y NNCF para generar pesos de solo INT8 con cuantizacion asimetrica por canal. El resultado es un artefacto orientado a inferencia en hardware Intel (CPU, iGPU, NPU) mediante el runtime de OpenVINO, con un tamano de repositorio de aproximadamente 1,1 GB.

El modelo resuelve el problema de la traduccion automatica en entornos con recursos limitados, ofreciendo un pipeline de `translation` que acepta un parametro `target_lang` en la plantilla de chat. Con 0,8 mil millones de parametros, esta pensado para despliegues en el borde o en servidores sin GPU dedicada, donde un transformer de mayor tamano no seria viable.

Su relevancia actual radica en la combinacion de un modelo especializado en traduccion con una ruta de despliegue nativa para OpenVINO, lo que facilita su integracion en aplicaciones de escritorio, dispositivos embebidos y servicios de traduccion de baja latencia. La licencia PLaMo Community License condiciona su uso comercial, por lo que conviene revisarla antes de adoptarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia PLaMo 3); detalles no disponibles |
| Parametros totales | 0,8 mil millones (segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 weight-only, asimetrica, per-channel (INT8_ASYM, group_size=-1) |
| Idiomas soportados | no disponible |
| Licencia | PLaMo Community License |
| Formato de pesos | OpenVINO IR (cuantizado con Optimum-Intel y NNCF) |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna del modelo base pfnet/plamo-3-translate-0.8b, salvo que pertenece a la familia PLaMo 3 de Preferred Networks y que se distribuye como modelo de traduccion con pipeline `translation`. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

La innovacion tecnica documentada en este repositorio es la cuantizacion: se aplica INT8 de solo pesos, asimetrica y por canal, con `group_size=-1`, generada mediante Optimum-Intel y NNCF. Esta configuracion reduce el peso del modelo a aproximadamente 1,1 GB de repositorio y permite ejecutarlo con el runtime de OpenVINO. El autor indica compatibilidad probada con transformers 5.15.0, optimum-intel 2.3.0.dev0+a68683c, OpenVINO 2026.4.1 y NNCF 3.3.0.

## Capacidades
- Traduccion automatica: el pipeline principal es `translation` y la plantilla de chat acepta un parametro `target_lang` para fijar el idioma de destino.
- Generacion de texto condicionada a instrucciones mediante `apply_chat_template` con roles de usuario.
- Decodificacion determinista con `do_sample=False`, adecuada para traduccion reproducible.
- Ejecucion en hardware Intel mediante OpenVINO (CPU, iGPU y NPU compatibles con el runtime).
- Integracion con el ecosistema Hugging Face a traves de `OVModelForCausalLM` de Optimum-Intel.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso
- Traduccion de documentos en local: el modelo puede traducir parrafos o frases completas en un equipo sin GPU dedicada, usando OpenVINO sobre CPU Intel y fijando el idioma de destino con `target_lang`.
- Traduccion en el borde (edge computing): con 0,8B parametros en INT8 y un repositorio de 1,1 GB, cabe en dispositivos con memoria limitada, como mini-PC o portatiles, para traduccion offline.
- Preprocesado multilingue en pipelines de datos: se puede usar para normalizar o traducir corpus antes de alimentar otros modelos, ejecutandolo en el mismo servidor sin consumir VRAM.
- Asistencia a la traduccion en herramientas de escritorio: integrable en editores o clientes de correo mediante una API local basada en OpenVINO, con latencia baja al no requerir GPU.
- Traduccion de subtitulos o transcripciones por lotes: al ser determinista (`do_sample=False`), produce salidas estables y repetibles, util para procesos automatizados de postproduccion.
- Servicio de traduccion de bajo coste en infraestructura Intel existente: aprovecha CPU con instrucciones vectoriales o NPU integrada, evitando el coste de GPU dedicadas en cargas moderadas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: al ser un modelo INT8 de 0,8B, el peso de los parametros ronda 0,8 GB; el consumo total de memoria depende del contexto y del runtime, pero no se dispone de cifras oficiales.
- GPU recomendadas: no se documentan; el formato OpenVINO esta orientado a CPU, iGPU y NPU de Intel.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el artefacto esta pensado para el runtime de OpenVINO en hardware Intel.
- Opciones de despliegue: OpenVINO a traves de Optimum-Intel (`OVModelForCausalLM`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| asahi-jp/plamo-3-translate-0.8b-int8-ov | 0,8B | no disponible | OpenVINO IR INT8 | PLaMo Community License | Version cuantizada para OpenVINO |
| pfnet/plamo-3-translate-0.8b | 0,8B | no disponible | safetensors (presumiblemente) | PLaMo Community License | Modelo base sin cuantizar |
| Otros modelos de traduccion de ~1B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias
- La licencia PLaMo Community License impone condiciones especificas; es obligatorio revisar el texto completo antes de cualquier uso comercial.
- La cuantizacion INT8 de solo pesos puede introducir una perdida de calidad respecto al modelo base en FP16/BF16; no se han publicado evaluaciones que la cuantifiquen.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni calidad por par de idiomas.
- La longitud de contexto no esta documentada, lo que impide planificar el procesamiento de documentos largos sin pruebas previas.
- El modelo esta especializado en traduccion; su uso como modelo generico de chat o razonamiento no esta validado.
- El formato OpenVINO limita el despliegue a entornos compatibles con ese runtime; no es directamente utilizable en stacks basados en CUDA o llama.cpp.
- El repositorio tiene muy pocas descargas (17) y ningun like, por lo que la validacion comunitaria es practicamente inexistente.
- El codigo de ejemplo requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar el `custom_code` antes de usarlo en produccion.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/asahi-jp/plamo-3-translate-0.8b-int8-ov
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Licencia del modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b/blob/main/LICENSE
- Optimum-Intel: https://github.com/huggingface/optimum-intel
