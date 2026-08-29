# molllly6548/wan22-throat-high

## Resumen

El modelo `molllly6548/wan22-throat-high` es un adaptador LoRA (Low-Rank Adaptation) alojado en HuggingFace, aparentemente diseñado para el modelo base WAN 2.2 de Alibaba, un sistema de generación de vídeo de código abierto. La información pública es extremadamente limitada: la model card solo contiene la licencia Apache 2.0, sin descripción, sin arquitectura declarada, sin idiomas y sin métricas. Los resultados de búsqueda muestran archivos con nombres similares (`Wan22_ThroatV2_High.safetensors`, `Wan22_ThroatV3_High.safetensors`) en repositorios de otros usuarios, lo que sugiere que se trata de una variante o versión de un adaptador para WAN 2.2, probablemente orientado a un estilo o temática concreta (el término "throat" en el nombre podría indicar contenido explícito, aunque no se puede confirmar). Dada la ausencia de documentación, esta ficha se basa únicamente en los metadatos disponibles y en las referencias externas encontradas, marcando como "no disponible" cualquier dato no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente LoRA sobre WAN 2.2) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (archivo .safetensors observado en repos similares) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según archivos homónimos en otros repos) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del adaptador. Por el nombre y los archivos asociados en repositorios de terceros, se infiere que es un LoRA destinado a ajustar el modelo WAN 2.2 (un transformer de difusión para vídeo, probablemente con arquitectura DiT). Sin embargo, no hay datos sobre el número de parámetros del adaptador, el dataset de entrenamiento, el proceso de ajuste (si usó RLHF, DPO u otro) ni ninguna innovación técnica documentada. La ausencia de model card impide cualquier afirmación verificable.

## Capacidades

- No se han documentado capacidades específicas del adaptador.
- Al estar vinculado a WAN 2.2, podría heredar las capacidades del modelo base (generación de vídeo a partir de texto o imagen), pero esto no está confirmado.
- No hay evidencia de soporte para tool calling, agentes, razonamiento multi-paso, visión o audio.
- El nombre "throat" sugiere una temática concreta, posiblemente relacionada con contenido para adultos, pero no se puede verificar.

## Casos de uso

No es posible enumerar casos de uso concretos sin información sobre el comportamiento del adaptador. La falta de documentación y de ejemplos de uso impide recomendar aplicaciones prácticas. Cualquier uso en producción requeriría primero una evaluación manual del modelo y una verificación de su compatibilidad con el pipeline de WAN 2.2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de calidad de generación de vídeo (como FVD o CLIP score) para este adaptador.

## Requisitos de hardware

No se dispone de datos sobre requisitos de hardware. Dado que se trata de un LoRA, su inferencia dependerá del modelo base (WAN 2.2, que típicamente requiere GPUs con al menos 16-24 GB de VRAM para las variantes de 14B en FP16). Sin embargo, al no conocer el tamaño del adaptador ni su integración exacta, no se puede especificar una configuración mínima fiable. Las opciones de despliegue (vLLM, llama.cpp, etc.) no son aplicables directamente a un adaptador de vídeo; se necesitaría el framework de WAN 2.2 (por ejemplo, el repositorio oficial de Alibaba o difusores de HuggingFace).

## Comparativa con modelos similares

No disponible. No se conocen adaptadores equivalentes con documentación pública que permitan una comparación objetiva. Los archivos `Wan22_ThroatV2_High` y `Wan22_ThroatV3_High` de otros repositorios podrían ser versiones relacionadas, pero no hay información sobre sus diferencias.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no describe el modelo, su uso ni sus limitaciones.
- Riesgo de contenido inapropiado: el nombre "throat" y la temática implícita sugieren que el adaptador podría generar contenido explícito o para adultos, lo que requiere moderación y políticas de uso estrictas.
- Sin garantías de compatibilidad: no se ha verificado que el adaptador funcione correctamente con WAN 2.2 ni con qué versión exacta del modelo base es compatible.
- Licencia Apache 2.0 permite uso comercial, pero la falta de atribución de los datos de entrenamiento podría plantear riesgos legales si se usan contenidos con derechos de autor.
- No se recomienda su uso en producción sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/molllly6548/wan22-throat-high
- Archivo similar en otro repositorio: https://huggingface.co/mega281/lora2/blob/main/Wan22_ThroatV2_High.safetensors
- Archivo similar en otro repositorio: https://huggingface.co/profpeng/deepthroat/blob/main/Wan22_ThroatV3_High.safetensors
- Referencia en RunningHub: https://www.runninghub.ai/model/public/1987785318093008897
- Modelo base WAN 2.2 (referencia indirecta): https://civitai.red/models/1981116/dasiwa-wan-22-i2v-14b-or-lightspeed-or-safetensors
