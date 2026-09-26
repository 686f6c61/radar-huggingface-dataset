# RunningHubAI/rh-dasiwaltx23lightspeed-solsticecoinv2-unet

## Resumen

`rh-dasiwaltx23lightspeed-solsticecoinv2-unet` es un fichero de pesos UNET para generacion de video a partir de texto (text-to-video), publicado en Hugging Face por la cuenta RunningHubAI en nombre del autor Dasiwa (usuario @T8star-Aix de RunningHub). Se presenta como un ajuste fino del modelo base LTX2.3 y se distribuye como un unico fichero `safetensors` de 28.736 MiB (unos 30,1 GB de repositorio), pensado para cargarse en flujos de ComfyUI o en la plataforma RunningHub. No es un modelo completo: es el componente de difusion, y requiere un VAE, un codificador de texto y el resto del pipeline de su familia para generar video.

La relevancia de esta publicacion es de tipo practico para la comunidad de generacion de video: permite reutilizar un ajuste fino de estetica concreta dentro de un workflow ya existente de la familia LTX, sin tener que reentrenar nada. Sin embargo, la ficha publicada es extremadamente escasa: no declara licencia, idiomas, numero de parametros, resolucion, duracion de los clips ni datos de entrenamiento, y en el momento de redactar esta ficha acumula 0 descargas y 0 me gusta, sin validacion de terceros.

Por tanto, esta ficha debe leerse como una descripcion de lo que se puede verificar en el repositorio (formato, tamano, base declarada y plataformas de uso) y marcar explicitamente como no disponible todo lo que el autor no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion para texto-a-video (etiqueta `unet` del repositorio), ajustado a partir de LTX2.3 |
| Parametros totales | no disponible. El unico fichero de pesos ocupa 28.736 MiB; si estuviera en fp16/bf16 (2 bytes por parametro) equivaldria a unos 15.000 millones de parametros, pero es una estimacion no confirmada y el fichero incluye metadatos y otros tensores |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica duracion del video, numero de fotogramas, resolucion ni fps) |
| Tipos de cuantizacion | no disponible. El repositorio solo publica un fichero `safetensors` en precision completa; no hay variantes GGUF, fp8 ni int4 publicadas |
| Idiomas soportados | no disponible (el autor no documenta idiomas; al ser un modelo de video, el condicionamiento textual depende del codificador de texto que se empareje) |
| Licencia | no disponible. RunningHub indica que publica en nombre del autor, que los derechos siguen siendo del autor y que hay que seguir la licencia del proyecto original o upstream, sin especificar cual |
| Formato de pesos | safetensors (`DasiwaLTX23Lightspeed_solsticecoinV2.safetensors`, 28.736 MiB) |
| Tarea declarada | text-to-video |
| Modelo base declarado | LTX2.3 |
| Autor | Dasiwa (RunningHub @T8star-Aix); distribuye RunningHubAI |
| Plataformas compatibles | ComfyUI, RunningHub y Hugging Face |
| Tamano del repositorio | 30,1 GB |
| Fecha de publicacion | 25-09-2026 (creado 21:30:59 UTC, actualizado 21:38:04 UTC) |

## Arquitectura y entrenamiento

No se dispone de documentacion tecnica sobre la arquitectura interna mas alla de la etiqueta `unet` y de la tarea `text-to-video`. El autor declara que el modelo es un ajuste fino de LTX2.3, pero no detalla si se trata de un transformer de difusion con atencion completa, de una arquitectura hibrida ni de un UNET convolucional clasico en el sentido estricto. Tampoco se publican el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de ajuste por preferencias (RLHF, DPO) ni el numero de pasos de entrenamiento.

La nomenclatura del fichero (`Lightspeed`, `solsticecoin`, `V2`) sugiere una iteracion de estilo o de velocidad dentro de la serie del autor, pero no hay ninguna nota tecnica que respalde o explique esos terminos. Tampoco se documenta ninguna innovacion de inferencia (decodificacion especulativa, atencion lineal, destilacion de pasos) ni la relacion exacta entre este ajuste y el modelo base LTX2.3 del que deriva.

El uso previsto es la carga del fichero como modelo de difusion dentro de un flujo de ComfyUI o RunningHub, aportando el resto de componentes del pipeline (VAE, text encoder, scheduler, nodos de muestreo) por parte del usuario.

## Capacidades

- Generacion de video a partir de descripciones textuales, como componente de difusion dentro de un pipeline de texto-a-video.
- Integracion directa en ComfyUI mediante los nodos habituales de carga de UNET o modelo de difusion.
- Ejecucion en la plataforma RunningHub, que ofrece despliegue gestionado y acceso por API.
- Sustitucion del UNET en flujos de trabajo existentes de la familia LTX, lo que permite cambiar el aspecto generado conservando el resto del pipeline.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta comportamiento agentico ni razonamiento multi-paso.
- No se documenta soporte multilingue explicito.
- No se documentan capacidades de audio, vision, edicion de video, control por pose o por profundidad, ni modo de razonamiento.
- No se documenta resolucion, duracion, fps ni relacion de aspecto soportadas.

## Casos de uso

- Generacion de clips cortos para redes sociales desde ComfyUI: el fichero se carga como modelo de difusion y se condiciona con prompts de texto para producir video vertical u horizontal; es adecuado si el equipo ya trabaja con la familia LTX y solo quiere variar la estetica del resultado.
- Prototipado de storyboards y previsionado audiovisual: permite generar planos de referencia rapidos a partir de guiones textuales antes de rodar, sustituyendo el UNET base por este ajuste cuando se busca un estilo visual concreto.
- Produccion de fondos y loops para videojuegos o piezas musicales: la generacion de video corto a partir de texto encaja en la creacion de material de ambiente, siempre que se verifiquen la licencia y las condiciones de uso comercial.
- Automatizacion mediante la API de RunningHub: la plataforma ofrece endpoints de llamada, de modo que el ajuste puede invocarse desde un backend propio sin gestionar infraestructura de GPU, util para equipos que no quieren mantener servidores propios.
- Investigacion sobre ajuste fino de modelos de video: al tratarse de un UNET completo y no de un LoRA, sirve como caso de estudio de como pequenos estudios publican variantes de estilo sobre un modelo base y de los riesgos de trazabilidad y licencia que eso implica.
- Comparacion de variantes estilisticas en un mismo pipeline: manteniendo fijo el VAE, el text encoder y los parametros de muestreo, se puede intercambiar este UNET por el modelo base u otros ajustes para evaluar diferencias de aspecto de forma controlada.
- Despliegue en demos internas sobre GPU de gama alta: con una A100, H100 o RTX 6000 Ada, el modelo puede servirse como servicio de generacion de video para validacion interna de conceptos creativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas objetivas (FVD, CLIPScore, VBench ni similares), ni comparaciones cuantitativas con el modelo base LTX2.3 u otros sistemas de texto-a-video, ni datos de latencia o rendimiento por GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: cargar los pesos completos (28.736 MiB, unos 30,1 GB) requiere del orden de 30 GB de VRAM solo para el modelo, mas el espacio de activaciones y latentes del proceso de difusion; en la practica se recomienda contar con 40 GB o mas por GPU, o bien usar descarga parcial a memoria del sistema.
- Cuantizacion: no hay variantes cuantizadas publicadas. La conversion manual a fp8 o int8 podria reducir el requisito a la mitad o menos, pero no esta documentada ni validada para este fichero.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), L40S (48 GB) y RTX 6000 Ada (48 GB) son opciones coherentes por capacidad de VRAM. En RTX 4090 (24 GB) o RTX 5090 (32 GB) solo cabria con tecnicas de descarga por bloques, cuantizacion o resoluciones y duraciones muy reducidas.
- Cabe en GPU de consumo: no de forma holgada; en tarjetas de 24 GB exige gestion agresiva de memoria y no esta garantizado por el autor.
- Opciones de despliegue: ComfyUI (carga de UNET o modelo de difusion) y la plataforma RunningHub, que es el entorno oficial declarado. No aplican servidores de inferencia para modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI, porque no es un modelo linguistico.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Duracion o contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-dasiwaltx23lightspeed-solsticecoinv2-unet | UNET de difusion texto-a-video, ajuste de LTX2.3 | no disponible (fichero de 28.736 MiB) | no disponible | no disponible | Hugging Face y RunningHub |
| ellaxin/DasiwaLTX23Lightspeed_solsticecoinV2 | Misma familia de pesos, publicada por otro usuario | no disponible | no disponible | no disponible | Hugging Face |
| LTX2.3 (modelo base declarado) | Modelo base del que deriva el ajuste | no disponible | no disponible | la del proyecto original o upstream, no especificada | no disponible en la informacion proporcionada |

No hay datos de rendimiento publicados para ninguno de los elementos comparados, por lo que la comparacion no puede ser cuantitativa. Otras familias de generacion de video abierto (por ejemplo Wan, HunyuanVideo, Mochi o CogVideoX) serian alternativas de categoria, pero no se dispone de sus especificaciones en la informacion proporcionada; consultese cada repositorio oficial antes de comparar.

## Limitaciones y advertencias

- Ausencia total de ficha tecnica: no se documentan parametros, resolucion, duracion, fps, idiomas, dataset ni metodologia de entrenamiento, lo que impide reproducir o auditar el modelo.
- Licencia no disponible: RunningHub remite a la licencia del proyecto original o upstream sin concretarla. Usar el modelo en produccion o con fines comerciales sin aclarar antes los terminos con el autor es un riesgo legal real.
- Validacion nula por parte de la comunidad: 0 descargas y 0 me gusta en el momento de redactar la ficha; no hay informes independientes de calidad ni de problemas.
- Fecha de publicacion anomala: el repositorio figura creado el 25-09-2026, una fecha que conviene verificar antes de tomarla como referencia.
- Nomenclatura promocional sin respaldo tecnico: terminos como `lightspeed` o `solsticecoin` no van acompanados de ninguna explicacion de que aportan.
- Modelo incompleto: solo se distribuye el UNET. Sin el VAE, el codificador de texto y el scheduler compatibles, el fichero no genera video por si solo, y el autor no indica que versiones de esos componentes son validas.
- Compatibilidad no garantizada con versiones actuales de ComfyUI ni con nodos personalizados concretos.
- Riesgos tipicos de los modelos de difusion de video no mitigados ni documentados: incoherencia temporal entre fotogramas, artefactos anatomicos, deformaciones de objetos, texto ilegible en pantalla y deriva progresiva en clips largos.
- Sesgos no evaluados: al desconocerse el dataset de entrenamiento, no se puede estimar el sesgo demografico, cultural o de representacion heredado del modelo base.
- Coste de infraestructura elevado: 30,1 GB de almacenamiento y transferencia, y requisitos de VRAM que excluyen despliegues sencillos en GPU de consumo.
- Sin garantias de soporte: no se documenta mantenimiento, versionado ni canal de incidencias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-dasiwaltx23lightspeed-solsticecoinv2-unet
- README en chino del repositorio: https://huggingface.co/RunningHubAI/rh-dasiwaltx23lightspeed-solsticecoinv2-unet/blob/main/README_cn.md
- Pagina del modelo en RunningHub: https://www.runninghub.ai/model/public/2053122676947988481
- Pagina del modelo en RunningHub (sitio de China): https://www.runninghub.cn/model/public/2053122676947988481
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1819214514410942465
- Plataforma RunningHub: https://www.runninghub.ai
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Copia o variante del mismo nombre publicada por otro usuario: https://huggingface.co/ellaxin/DasiwaLTX23Lightspeed_solsticecoinV2
- Proyecto original declarado: "da" (sin URL disponible)
