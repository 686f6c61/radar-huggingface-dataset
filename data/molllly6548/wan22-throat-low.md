# molllly6548/wan22-throat-low

## Resumen

El modelo `molllly6548/wan22-throat-low` es un adaptador de bajo rango (LoRA) alojado en HuggingFace, creado por el usuario `molllly6548` el 29 de agosto de 2026. El repositorio tiene un tamaño de 0,3 GB y contiene un único archivo `.safetensors` (según los resultados de búsqueda, el nombre del archivo es `Wan22_K3NK_Ultimate_Deepthroat_LOW.safetensors` o similar). No se proporciona ninguna documentación técnica en la model card, que solo incluye la licencia Apache 2.0.

Por el nombre y los archivos encontrados en otros repositorios (p. ej., `Wan22_Throat_V1_low_noise.safetensors`, `Wan22_ThroatV3_Low_Alt.safetensors`), este LoRA está diseñado para el modelo de generación de vídeo Wan 2.2 (de Alibaba), y su nombre sugiere que se trata de un adaptador para contenido explícito de tipo "deepthroat" con intensidad baja. No hay información oficial sobre su arquitectura, entrenamiento o rendimiento. Dado el contenido potencialmente explícito y la ausencia de documentación, su uso en entornos profesionales o de producción no está recomendado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) para el modelo base Wan 2.2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el archivo es `.safetensors`, sin cuantizacion adicional) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del LoRA, el numero de parametros, el dataset de entrenamiento ni el proceso de ajuste. Por el nombre y los archivos asociados, se infiere que es un adaptador de bajo rango para el modelo Wan 2.2, que es un modelo de difusion para generacion de video. No se han publicado detalles sobre el entrenamiento, como el numero de pasos, la tasa de aprendizaje o el metodo de regularizacion.

## Capacidades

- No hay capacidades documentadas oficialmente.
- Por su naturaleza de LoRA, se espera que modifique el comportamiento del modelo base Wan 2.2 para generar contenido especifico (en este caso, escenas de tipo "deepthroat" con intensidad baja).
- No se ha confirmado soporte para tool calling, agentes, razonamiento multimodal ni otras capacidades generales.

## Casos de uso

No se han documentado casos de uso legitimos. Dado el contenido explicito implicito, no se recomienda su uso en aplicaciones profesionales, educativas o de investigacion sin un analisis etico previo. En el ambito de la investigacion sobre generacion de video, podria utilizarse como ejemplo de adaptacion de bajo rango para estilos especificos, pero no hay datos que respalden su calidad o seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un LoRA, requiere el modelo base Wan 2.2 para funcionar. Wan 2.2 es un modelo de difusion de video que necesita una GPU con al menos 24 GB de VRAM para inferencia en su version completa (dependiendo de la resolucion y el tamano del modelo base).
- El LoRA en si ocupa 0,3 GB, por lo que el requisito principal es el del modelo base.
- Se puede desplegar con herramientas como ComfyUI, que soporta la carga de LoRAs para Wan 2.2.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables. Existen otros LoRAs similares en HuggingFace (p. ej., `ComfyCloudModel/Wan22-Loras`, `SarahPeterson2/lora`, `profpeng/deepthroat`), pero no se han publicado comparaciones tecnicas.

## Limitaciones y advertencias

- Contenido explicito: el nombre y los archivos asociados indican que el LoRA esta disenado para generar contenido sexual explicito. Su uso puede violar las politicas de plataformas y las leyes locales.
- Sin documentacion: no hay informacion sobre sesgos, alucinaciones o limitaciones de contexto.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a restricciones legales adicionales.
- No se ha verificado la calidad del modelo ni su seguridad. No se recomienda su uso en produccion.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido evaluado por la comunidad.

## Enlaces

- [HuggingFace - molllly6548/wan22-throat-low](https://huggingface.co/molllly6548/wan22-throat-low)
- [ComfyCloudModel/Wan22-Loras (archivo similar)](https://huggingface.co/ComfyCloudModel/Wan22-Loras/blob/main/loras/Wan22_K3NK_Ultimate_Deepthroat_LOW.safetensors)
- [SarahPeterson2/lora (archivo similar)](https://huggingface.co/SarahPeterson2/lora/blob/main/Wan22_Throat_V1_low_noise.safetensors)
- [profpeng/deepthroat (archivo similar)](https://huggingface.co/profpeng/deepthroat/blob/main/Wan22_ThroatV3_Low_Alt.safetensors)
