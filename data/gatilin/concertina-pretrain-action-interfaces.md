# gatilin/concertina-pretrain-action-interfaces

## Resumen

Concertina pretrain action interfaces es un extracto de pesos publicado por el usuario gatilin a partir del checkpoint Concertina pretrain 90k (revision `d172fb0862208878053b3ba1cadb7bf45228f87e`), desarrollado originalmente por Traly. No se trata de un modelo completo, sino de un conjunto de 22 tensores en BF16 correspondientes a tres modulos concretos: el proyector de entrada de acciones (`model.action_in_proj.*`), la cabeza de salida de acciones (`model.action_head.*`) y la cabeza de riesgo de token (`model.token_risk_head.*`). El objetivo es facilitar el estudio y la reutilizacion de estas interfaces dentro de la familia Concertina, un sistema de vision-language-action (VLA) con generacion de acciones mediante difusion.

El modelo base es un backbone compartido de vision-lenguaje-difusion que no se incluye en este repositorio, junto con el sampler, los normalizadores especificos de robot y el preprocesado. El proyector de entrada transforma vectores canonicos de accion/estado de 20 dimensiones en embeddings de 2560 dimensiones del backbone, mientras que la cabeza de salida mapea los estados ocultos del backbone a 20 dimensiones de accion y la cabeza de riesgo estima una perdida de reconstruccion a partir de cada estado oculto.

Es relevante ahora porque expone de forma aislada las interfaces de accion de un VLA basado en difusion, lo que permite inspeccionar convenciones de acciones, mascaras de dimensiones validas y manejo del gripper sin necesidad de cargar el modelo completo. El repositorio tiene 10.147.861 parametros en safetensors y una licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Interfaces de accion (proyector de entrada, cabeza de salida y cabeza de riesgo) para un backbone vision-language-diffusion |
| Parametros totales | 10.147.861 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos originales); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (22 tensores BF16), con `heads.py` y `source_config.json` incluidos |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado de forma independiente, sino una extraccion de pesos de un checkpoint mayor. Los tres modulos incluidos son: un proyector de entrada que mapea vectores canonicos de accion/estado de 20 dimensiones a embeddings de 2560 dimensiones; una cabeza de salida que proyecta los estados ocultos del backbone a 20 dimensiones de accion; y una cabeza de riesgo de token que predice una estimacion logaritmica de la perdida de reconstruccion desde cada estado oculto. Los nombres, formas y valores de los tensores se conservan respecto al checkpoint original.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO para estos modulos. La model card advierte explicitamente de que la cabeza de salida debe consumir los estados ocultos del backbone compartido y que componerla directamente con el proyector de entrada no reproduce la inferencia de Concertina. El fichero `heads.py` incluido proviene del codigo fuente de Concertina en GitHub, fijado al commit `28af8d127c5d1fa820606000a943a7b73a0a5013`, y `source_config.json` contiene la configuracion completa del checkpoint de origen, incluidas las convenciones de acciones.

## Capacidades

- Extraccion y estudio de las interfaces de accion de un VLA basado en difusion.
- Proyeccion de vectores canonicos de accion/estado de 20 dimensiones a embeddings de 2560 dimensiones.
- Proyeccion de estados ocultos del backbone a 20 dimensiones de accion.
- Estimacion de riesgo de token mediante una cabeza que predice una perdida de reconstruccion logaritmica.
- Inspeccion de convenciones de acciones, mascaras de dimensiones validas y manejo del gripper a partir de `source_config.json`.
- No es una politica VLA autonoma ni un DiT independiente: requiere el backbone compartido para funcionar.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, tool calling, agentes ni multilingues.

## Casos de uso

- Investigacion de arquitecturas VLA: permite estudiar como un VLA basado en difusion mapea acciones de 20 dimensiones a un espacio latente de 2560 dimensiones sin cargar el modelo completo.
- Reutilizacion de cabezas de accion: un equipo que ya disponga del backbone Concertina puede cargar estas cabezas para reproducir o adaptar la salida de acciones.
- Analisis de convenciones de acciones: `source_config.json` facilita revisar el orden de dimensiones, el manejo del gripper y la desnormalizacion antes de interpretar salidas.
- Auditoria de riesgo de token: la cabeza `token_risk_head` permite inspeccionar estimaciones de perdida de reconstruccion por estado oculto en pipelines de investigacion.
- Desarrollo de herramientas de validacion: el smoke test en BF16 sobre CPU con vectores sinteticos sirve como base para construir pruebas de carga estricta y comprobacion de dimensiones.
- Docencia y formacion: el repositorio aislado de 10 millones de parametros es un material manejable para explicar la estructura de interfaces de accion en modelos de robotica.
- Integracion en pipelines de investigacion: util para comparar variantes de cabezas de accion manteniendo fijo el backbone compartido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion documentada es un smoke test en CPU con BF16 sobre vectores de accion sinteticos y estados ocultos muestreados de forma independiente, que produjo salidas finitas con las dimensiones esperadas y supero la carga estricta de estado y la igualdad de salidas repetidas. El autor indica explicitamente que esta prueba no evalua el modelo compartido, el sampler de difusion, la seguridad del robot ni la calidad fisica de las acciones.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 10,1 millones de parametros en BF16, los pesos ocupan aproximadamente 20 MB; el requisito real depende del backbone compartido, que no se incluye.
- GPU recomendadas: no disponible para el modelo completo; para estos modulos basta CPU o cualquier GPU con soporte BF16.
- Cabe en GPU de consumo: si, los tres modulos aislados caben en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: PyTorch, accelerate y safetensors, segun la model card; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor solo reporta un smoke test en CPU BF16 con salidas finitas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/concertina-pretrain-action-interfaces | 10.147.861 | no disponible | Interfaces de accion extraidas de un VLA | MIT | Hugging Face |
| Traly/concertina-pretrain-90k | no disponible | no disponible | VLA completo con backbone vision-language-diffusion | MIT (segun model card de origen) | Hugging Face |
| Otros VLA de robotica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es una politica VLA ni un DiT independiente: los tres modulos aislados no reproducen la inferencia de Concertina.
- La cabeza de salida requiere los estados ocultos del backbone compartido, que no se incluye en el repositorio.
- No se incluyen el sampler de difusion, los normalizadores especificos de robot ni el preprocesado.
- Es necesario verificar el preprocesado especifico del modelo, las mascaras de dimensiones validas, el manejo del gripper y la desnormalizacion antes de interpretar las salidas.
- El smoke test realizado no valida la seguridad fisica del robot ni la calidad de las acciones generadas.
- Los dtypes y dispositivos de entrada deben coincidir con los pesos.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma o contexto.
- La licencia MIT permite uso comercial, pero deben conservarse los avisos de copyright y licencia del codigo fuente incluido.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB segun los metadatos, lo que sugiere que es un extracto de comunidad sin validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/gatilin/concertina-pretrain-action-interfaces
- Modelo base: https://huggingface.co/Traly/concertina-pretrain-90k
- Codigo fuente de Concertina (commit fijado): https://github.com/lose4578/Concertina/blob/28af8d127c5d1fa820606000a943a7b73a0a5013/src/concertina/model/heads.py
