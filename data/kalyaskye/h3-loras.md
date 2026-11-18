# kalyaskye/h3-loras

## Resumen

`kalyaskye/h3-loras` es un repositorio espejo (mirror) que agrupa 17 LoRAs destinadas al modelo MiniMax H3. No se trata de un modelo base, sino de un conjunto de adaptadores de bajo rango (LoRA) publicados originalmente por distintos autores en Civitai y recopilados aquí para poder cargarlos por URL en servicios de inferencia alojada. El autor del repositorio, `kalyaskye`, actúa únicamente como agregador: la model card atribuye explícitamente todo el crédito a los autores originales de Civitai y no incluye información sobre el proceso de entrenamiento de cada adaptador.

El contenido está marcado con la etiqueta `not-for-all-audiences` y los nombres de los ficheros remiten a adaptadores de contenido sexual explícito y de modificación de físicos corporales sobre el modelo MiniMax H3. El repositorio ocupa 4,8 GB y se actualizó por última vez el 1 de octubre de 2026. La relevancia técnica es limitada fuera de ese nicho: su interés principal es como ejemplo de distribución de LoRAs por URL para pipelines de inferencia alojada, no como artefacto con valor para investigación general.

No hay información disponible sobre arquitectura del modelo base, número de parámetros, contexto, licencia ni idiomas soportados, más allá de la librería declarada (`minimax-h3`) y los tags del repositorio. Cualquier evaluación de capacidades debe remitirse al modelo base MiniMax H3 y a las fichas individuales de cada LoRA en Civitai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene LoRAs, no un modelo base; librería declarada: `minimax-h3`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona `bf16` en el nombre de uno de los ficheros, `jiggle_walk_v2`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene ficheros de adaptadores LoRA; no se detalla el formato exacto en la información proporcionada) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base MiniMax H3 ni sobre la del adaptador. Por la naturaleza del repositorio, se trata de LoRAs (Low-Rank Adaptation): adaptadores de bajo rango que se acoplan a un modelo base congelado para modificar su comportamiento, en este caso orientado a estilos visuales, físicas corporales y contenido explícito. El repositorio no documenta rangos, dimensiones de las matrices, datasets de entrenamiento, número de pasos ni hiperparámetros de ninguno de los 17 adaptadores.

Tampoco se indica si los LoRAs se entrenaron con técnicas adicionales (regularización, captions específicos, uso de datasets curados) ni si son compatibles entre sí. El único dato técnico deducible de los nombres es que al menos un fichero (`jiggle_walk_v2`) se distribuye en `bf16`, y que varios adaptadores parecen estar orientados a image-to-video (`ass_jiggle_i2v_v1`) y a animación de personajes (`zero_two_dance_h3`).

## Capacidades

- Aplicación de estilos y modificaciones sobre el modelo base MiniMax H3 mediante LoRA: el repositorio no aporta capacidades propias, sino que altera las del modelo subyacente.
- Adaptadores orientados a contenido visual explícito: la mayoría de los ficheros corresponden a LoRAs de contenido para adultos según los nombres y la etiqueta `not-for-all-audiences`.
- Adaptadores de modificación de físicas corporales: varios ficheros (`heavy_breasts_physics_v1`, `jiggle_walk_v2`, `ass_jiggle_i2v_v1`) apuntan a simulación de movimiento y físicas.
- Adaptadores de animación y baile: `zero_two_dance_h3`, `hip_gyration_h3`, `icy_twerk_pro_max_v2`, `slop_twerk_v02_e7`.
- Adaptadores de estilo visual: `mystic_xxx_v4`, `icy_realism_v1`, `galaxyace_h3`, `h3_realism_slider`.
- Carga por URL en inferencia alojada: el propósito declarado del mirror es permitir el uso de estos LoRAs en servicios que aceptan URLs de Hugging Face.
- Tool calling, agentes, razonamiento multi-paso, multilingüismo, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Distribución de LoRAs para inferencia alojada: el repositorio permite referenciar cada adaptador mediante una URL estable de Hugging Face, lo que simplifica la carga en plataformas que no permiten subir ficheros locales y evita duplicar pesos en cada entorno.
- Pruebas comparativas de adaptadores sobre MiniMax H3: un investigador puede cargar varios LoRAs del mismo repositorio y comparar su efecto sobre el modelo base con un pipeline común, aunque deberá consultar cada ficha de Civitai para conocer los parámetros recomendados.
- Archivado y preservación de adaptadores: al ser un mirror, sirve como copia de respaldo de LoRAs publicados en Civitai, que pueden desaparecer o cambiar de versión; el repositorio fija versiones concretas (por ejemplo, la versión 3266628 para `mystic_xxx_v4`).
- Reproducción de resultados creativos: un usuario que haya generado imágenes o vídeos con una versión concreta de un LoRA puede recuperar exactamente esa versión desde el mirror y reproducir el resultado, algo que no siempre es posible si el autor original actualiza el fichero.
- Integración en pipelines de generación visual: los adaptadores de físicas y animación (`jiggle_walk_v2`, `hip_gyration_h3`) pueden incorporarse a flujos de generación de vídeo o animación de personajes sobre MiniMax H3, siempre que el pipeline soporte carga de LoRAs por URL.
- Estudio de la ecosistema de LoRAs en Civitai: el repositorio documenta en una tabla la correspondencia entre nombre de fichero y versión de Civitai, lo que facilita el análisis de procedencia, versionado y popularidad de adaptadores en esa plataforma.
- Evaluación de riesgos de contenido: equipos de moderación pueden usar el repositorio como muestra de adaptadores explícitos para calibrar clasificadores o políticas de filtrado en servicios de inferencia alojada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 4,8 GB en total, pero ese tamaño corresponde a los 17 adaptadores LoRA, no al modelo base; la VRAM necesaria dependerá de MiniMax H3, cuyos requisitos no se detallan.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el propósito declarado es la carga por URL en inferencia alojada; no se especifican servidores compatibles (vLLM, llama.cpp, Ollama, TGI u otros).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen en la información proporcionada repositorios comparables de LoRAs espejo para MiniMax H3, ni se dispone de datos del modelo base que permitan una comparación con alternativas.

## Limitaciones y advertencias

- Contenido para adultos: el repositorio está etiquetado como `not-for-all-audiences` y la mayoría de los adaptadores tienen nombres explícitos; no es apto para entornos sin control de edad ni para uso en productos dirigidos al público general.
- Licencia no especificada: no hay licencia declarada, ni para el repositorio ni para los adaptadores individuales. Esto impide determinar si el uso comercial está permitido; en la práctica, debe asumirse que no hay autorización explícita y consultar cada ficha original en Civitai.
- Procedencia y derechos: los adaptadores fueron creados por terceros en Civitai y aquí solo se replican; el autor del mirror no documenta permisos de redistribución de los autores originales.
- Falta total de documentación técnica: no se indican rangos, pasos de entrenamiento, datasets, prompts de activación ni pesos recomendados, lo que dificulta reproducir resultados de forma fiable.
- Dependencia del modelo base: los LoRAs no funcionan de forma autónoma; requieren MiniMax H3 y un pipeline compatible con carga de adaptadores, cuyos requisitos y limitaciones no se detallan.
- Riesgo de sesgos y contenido dañino: el contenido explícito puede incorporar sesgos de representación corporal y de género; no se documenta ninguna mitigación.
- Sin garantías de mantenimiento: al ser un mirror de un tercero, las versiones pueden quedar obsoletas o retirarse sin aviso, y no hay canal de soporte indicado.
- Fecha de creación futura en los metadatos (2026-09-25): conviene verificar la integridad y vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kalyaskye/h3-loras
- Civitai, Mystic XXX v4.0 (versión 3266628): https://civitai.com/model-versions/3266628
- Civitai, Minimax H3 - Tiddies and Realism Slider (versión 3229050): https://civitai.com/model-versions/3229050
- Civitai, HMBreasts V2 (versión 3268969): https://civitai.com/model-versions/3268969
- Civitai, Heavy Breasts Physics V1 (versión 3340638): https://civitai.com/model-versions/3340638
- Civitai, HMNSFW AIO Sex LoRA V2 (versión 3206518): https://civitai.com/model-versions/3206518
- Civitai, HMMasturbation v2.0 (versión 3310312): https://civitai.com/model-versions/3310312
- Civitai, Fingering MM-H3 v4 (versión 3342915): https://civitai.com/model-versions/3342915
- Civitai, ICY Realism H3 v1.0 (versión 3308945): https://civitai.com/model-versions/3308945
- Civitai, Fingering Pussy v1.1_H3 (versión 3342542): https://civitai.com/model-versions/3342542
- Civitai, Icy Twerk Pro MAX v2 (versión 3289971): https://civitai.com/model-versions/3289971
- Civitai, H3 JIGGLE WALK v2.0 bf16 (versión 3288874): https://civitai.com/model-versions/3288874
- Civitai, Hip Gyration MiniMaxH3 (versión 3257629): https://civitai.com/model-versions/3257629
- Civitai, Zero-Two Dance MiniMaxH3 (versión 3264304): https://civitai.com/model-versions/3264304
- Civitai, slop bounce MiniMax H3 LoRa (versión 3250381): https://civitai.com/model-versions/3250381
- Civitai, Slop Twerk MiniMax H3 V0.2 epoch 7 (versión 3283175): https://civitai.com/model-versions/3283175
- Civitai, H3 Ass jiggle (I2V) fl2va v1.0 (versión 3255024): https://civitai.com/model-versions/3255024
- Civitai, GalaxyAce LoRA MiniMax H3 (versión 3201619): https://civitai.com/model-versions/3201619
