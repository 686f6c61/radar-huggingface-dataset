# gatilin/duo-1-2-realization

## Resumen

Duo 1.2 Realization es un componente de pesos publicado por el usuario gatilin en Hugging Face, que reproduce íntegramente el subdirectorio `realization/` del modelo base `inclusionAI/Duo-1.2-causal-base`, fijado al commit `d65767bcbbf699ae7782fb71931112001db0a15b`. No se trata de un modelo independiente ni de un pipeline completo, sino de una copia de investigación del backbone multimodal de tipo diffusion-transformer orientado a la generación de audio y vídeo, junto con su índice de tensores, configuración, un checkpoint DCP de la versión 1.2 y los metadatos asociados.

El repositorio ocupa 69,1 GB e incluye el backbone original distribuido en 13 shards con 535 tensores en total. El autor declara explícitamente que no se han fusionado ni convertido tensores: se preserva la disposición original de ficheros. Para poder ejecutar inferencia es necesario recurrir al runtime upstream del proyecto Duo, ya que el componente Intent con su adaptador, los códecs de audio y vídeo, los componentes de habla, el código de ejecución y el entorno de inferencia se distribuyen por separado.

La relevancia de esta publicación es fundamentalmente de auditoría y reproducibilidad: permite a investigadores inspeccionar los pesos del componente de realización sin depender del repositorio original, con verificación de tamaños y hashes SHA-256 de los ficheros LFS tras la copia en servidor. No obstante, la validación realizada por el autor se limita a los pesos base (cuatro tensores de atención del primer bloque), sin overlay LoRA/DCP, RoPE, máscara causal ni forward completo, por lo que no constituye una garantía de funcionamiento extremo a extremo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion transformer multimodal (componente `realization/` de Duo 1.2 causal) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en formato original, sin conversión) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License (con limitaciones territoriales y condiciones para receptores) |
| Formato de pesos | safetensors (13 shards), checkpoint DCP, índice y configuración JSON |

## Arquitectura y entrenamiento

El componente corresponde al backbone de un diffusion transformer multimodal del proyecto Duo, orientado a la generación conjunta de audio y vídeo dentro de un pipeline causal. El repositorio contiene los 13 shards originales del backbone con 535 tensores, su índice compartido, la configuración, un checkpoint DCP de la versión 1.2 con parámetros de adaptador entrenados y el fichero `complete.json` original. El manifiesto 1.2 identifica el modelo `student` y un sampler Euler de 50 pasos.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni la existencia de fases de RLHF o DPO en la información proporcionada. La validación publicada por el autor se restringe a los pesos base: extracción por rango de los cuatro tensores de atención originales del primer bloque desde el mirror oficial de ModelScope, comprobación del hash LFS del shard de origen contra Hugging Face, coincidencia exacta entre la conversión QKV intercalada oficial y el resultado QKV en bruto, y una computación de atención sintética en CPU con salidas finitas. No se valida el forward completo, el overlay DCP, RoPE, la máscara causal ni la caché de streaming.

## Capacidades

- Generación multimodal de audio y vídeo como parte del pipeline Duo (el componente aislado no genera por sí mismo).
- Backbone de difusión causal con sampler Euler de 50 pasos según el manifiesto 1.2.
- Checkpoint DCP con parámetros de adaptador entrenados, cargable según la implementación upstream.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe explícito.
- No se documentan modos de pensamiento (thinking), visión estática ni procesamiento de audio de entrada.

## Casos de uso

- Auditoría de pesos de un modelo multimodal: investigadores pueden descargar el componente y verificar la integridad de los 535 tensores y los 13 shards frente al repositorio original, usando los hashes SHA-256 de los ficheros LFS.
- Reproducibilidad de experimentos: equipos que necesiten fijar una versión concreta del backbone (commit `d65767bcbbf699ae7782fb71931112001db0a15b`) pueden usar esta copia como referencia inmutable en sus pipelines de evaluación.
- Estudio de arquitecturas diffusion-transformer aplicadas a generación de audio y vídeo: el componente permite inspeccionar la disposición de tensores y la configuración del backbone sin depender de la disponibilidad del repositorio upstream.
- Desarrollo de conversores de formato: la preservación del layout original y la validación de la conversión QKV intercalada sirven como caso de prueba para herramientas de conversión de pesos.
- Integración en el runtime Duo: desplegando el componente junto con el resto de módulos (Intent, códecs, componentes de habla) según las instrucciones upstream, puede emplearse para tareas de generación audiovisual.
- Investigación sobre adaptadores DCP: el checkpoint 1.2 incluye parámetros de adaptador entrenados, útil para estudiar técnicas de adaptación sobre backbones de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 69,1 GB, por lo que se requiere al menos ese espacio en disco antes de cualquier conversión o carga.
- VRAM estimada para inferencia: no disponible. Depende del pipeline Duo completo, no solo de este componente.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del backbone y la ausencia de datos de cuantización impiden estimarlo.
- Opciones de despliegue: no se documentan en la información disponible. El autor remite al runtime upstream del proyecto Duo en GitHub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (diffusion transformers multimodales para audio y vídeo) con parámetros, contexto o rendimiento verificables.

## Limitaciones y advertencias

- El componente no es un pipeline completo: sin Intent, adaptador, códecs de audio/vídeo, componentes de habla y runtime, no puede ejecutar generación por sí solo.
- La validación publicada cubre únicamente los pesos base del primer bloque de atención; no hay verificación del forward completo ni del overlay DCP.
- No se debe sustituir el overlay destilado 1.0 sin usar su manifiesto correspondiente, según advierte el autor.
- La licencia MiniMax H3 Community License impone limitaciones territoriales y condiciones para receptores; es necesario revisar `LICENSE` y `NOTICE` antes de cualquier uso o redistribución.
- El código fuente y otros componentes externos tienen licencias propias, independientes de la de los pesos.
- Riesgo de alucinación y sesgos: no evaluable con la información disponible al no tratarse de un modelo de lenguaje desplegable de forma autónoma.
- Idiomas soportados: no disponibles.
- Uso comercial: sujeto a los términos de la licencia comunitaria, que pueden restringir la distribución o el uso en determinadas jurisdicciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gatilin/duo-1-2-realization
- Modelo base: https://huggingface.co/inclusionAI/Duo-1.2-causal-base
- Runtime e instrucciones upstream: https://github.com/inclusionAI/Duo
- Commit fijado del modelo base: `d65767bcbbf699ae7782fb71931112001db0a15b`
