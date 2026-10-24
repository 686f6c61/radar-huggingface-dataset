# colinurbs/moss-trains-lora

## Resumen

`colinurbs/moss-trains-lora` es un adaptador LoRA de dominio estrecho para el modelo generativo texto-a-imagen MOSS-Image, desarrollado por el usuario colinurbs y publicado en HuggingFace en octubre de 2026. No es un modelo completo: es un ajuste de bajo rango (rank 64, alpha 16) entrenado sobre `OpenMOSS/MOSS-Image-Base` para especializarlo en fotografía ferroviaria de carga diésel norteamericana, con 33 modelos de locomotora y 13 tipos de material remolcado repartidos en 46 clases.

El problema que resuelve es muy concreto: los modelos generalistas no conocen la jerga visual del ferraviario (diferencias entre una EMD SD40-2 y una GE ES44AC, esquemas de pintura de compañías como Southern Pacific o Union Pacific, numeración de vía en la cabina). El LoRA codifica ese vocabulario visual a partir de 4.988 fotografías de Wikimedia Commons con licencias CC BY, BY-SA, CC0, PD y GFDL, y se activa sin trigger word, simplemente describiendo la escena como lo haría un aficionado.

Su relevancia es doble: por un lado es un ejemplo práctico de adaptación de MOSS-Image, un modelo open-weights de la familia OpenMOSS orientado a texto y maquetación con prompts de hasta 4.000 tokens; por otro, sirve como caso de estudio de un entrenamiento LoRA completo ejecutado en una única GPU de consumo (RTX 4070 Super) con INT8 y block swap. El repositorio ocupa 0,6 GB y contiene un único checkpoint, correspondiente al final de la primera pasada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MOSS-Image-Base, modelo generativo texto-a-imagen; la arquitectura interna del modelo base no se detalla en la información disponible |
| Parámetros totales | No disponible (el repositorio ocupa 0,6 GB e incluye el adaptador y una imagen de muestra; no se declara el número de parámetros) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; la documentación de MOSS-Image citada en la búsqueda indica prompts de hasta 4.000 tokens |
| Tipos de cuantización | No se documentan para inferencia; el entrenamiento se hizo con INT8 y block swap. Pesos distribuidos en safetensors |
| Idiomas soportados | No disponible; las caption de entrenamiento y los ejemplos de prompt están en inglés |
| Licencia | No disponible |
| Formato de pesos | safetensors (`trains_v1-000001.safetensors`) |
| Rango LoRA / alpha | 64 / 16 |
| Modelo base | OpenMOSS/MOSS-Image-Base (compatible también con MOSS-Image-SFT) |
| Dataset de entrenamiento | 4.988 fotografías de Wikimedia Commons (CC BY, CC BY-SA, CC0, PD, GFDL), 46 clases |
| Tamaño del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El adaptador se entrenó con kohya sd-scripts en su variante para MOSS-Image, sobre una RTX 4070 Super con cuantización INT8 y block swap, LoRA de rango 64 y alpha 16, optimizador AdamW8bit, learning rate 1e-4 constante, batch 1 y buckets de 1 MP. Cada fotografía se acompañó de una única caption: la caption larga generada por MOSS. El dataset cubre 33 modelos de locomotora (desde EMD F7 hasta SD70ACe, pasando por GE U23B–ET44AC, ALCO RS-3 y MLW RS-18) y 13 tipos de material remolcado (boxcar, covered hopper, tank car, well car, caboose, entre otros), con compañías Class I, regionales y fallen flags.

El plan original contemplaba dos pasadas; el entrenamiento se detuvo en el paso 5.761 al detectar que las muestras perdían definición, por lo que el checkpoint publicado corresponde al final de la primera época (paso 4.988). No se documentan técnicas adicionales como decodificación especulativa, attention linear ni etapas de RLHF/DPO; es un ajuste supervisado puro sobre pares imagen-caption. Tampoco se especifica la arquitectura interna del modelo base (transformer de difusión u otra), dato que no figura en las fuentes consultadas.

## Capacidades

- Generación de imágenes fotorrealistas de ferrocarril de carga diésel norteamericano, con control explícito sobre fabricante y modelo de locomotora.
- Cobertura de 33 modelos de locomotora y 13 tipos de material remolcado, incluyendo esquemas de pintura y colores de compañías históricas y actuales.
- Reproducción fiable de números de vía cortos y reporting marks; el lettering largo y las heráldicas de compañía se corrompen con frecuencia.
- Activación sin trigger word: el control se ejerce mediante descripción en lenguaje natural al estilo de una caption de aficionado (fabricante y modelo, compañía, colores, número, ángulo de cámara y entorno).
- Compatible con el modo de prompt largo del modelo base (hasta 4.000 tokens según la documentación de MOSS-Image) y con sus variantes de prompting en lenguaje natural, tags o JSON; el LoRA no documenta comportamiento específico con la maquetación JSON.
- Funciona sobre MOSS-Image-Base (resultado más suave) y sobre MOSS-Image-SFT (más nítido y con mejor lettering, pero con acabado más brillante).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, ni generación de texto o código: es un adaptador de generación de imagen, no un modelo de lenguaje.
- No procesa imágenes de entrada (no hay edición ni image-to-image documentados).

## Casos de uso

- **Ilustración editorial ferroviaria**: generar imágenes de acompañamiento para artículos sobre material rodante diésel con una precisión de modelo y librea que un modelo genérico no alcanza; el prompt puede citar fabricante, compañía y número de vía.
- **Previsualización de dioramas y maquetas**: los modelistas pueden describir una escena concreta (por ejemplo, una SD45 de Southern Pacific en curva en Tehachapi) para decidir composición, época y esquema de color antes de invertir en material o impresión 3D.
- **Material divulgativo y didáctico**: ilustrar guías de identificación de locomotoras o material remolcado para aficionados, aprovechando las 46 clases aprendidas; requiere revisión humana por los fallos en heráldicas y lettering largo.
- **Storyboards y preproducción audiovisual**: generar fotogramas de referencia para documentales o vídeos sobre ferrocarril, con control de ángulo de cámara y entorno mediante prompts descriptivos.
- **Banco de pruebas de pipelines LoRA**: sirve como caso real de ajuste de dominio sobre MOSS-Image con un dataset grande, varias clases y un solo epoch, útil para calibrar hiperparámetros (rango, alpha, learning rate, número de pasadas) en proyectos propios.
- **Exploración estética de fotografía ferroviaria histórica**: recrear el aspecto de la fotografía de aficionado de la era diésel (encuadres, luz, Gran Vía americana) siempre que el sujeto esté dentro del alcance diésel norteamericano.
- **Generación de variaciones a partir de descripciones de archivo**: convertir fichas descriptivas de fotografías de Commons en nuevas imágenes con composición distinta, útil para ilustrar catálogos; conviene verificar que no se reproduzcan fielmente originales con licencia BY-SA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente aporta una evaluación cualitativa: una imagen de muestra a fuerza 1.0, semilla 42 y resolución 1216×832, y advierte de que la salida resulta algo blanda a esa fuerza. No hay FID, CLIP score, ni comparaciones cuantitativas con otros LoRA de MOSS-Image.

## Requisitos de hardware

- **Entrenamiento**: viable en una RTX 4070 Super (12 GB de VRAM) con INT8 y block swap, batch 1 y buckets de 1 MP; es la configuración real empleada por el autor.
- **Adaptador**: 0,6 GB de repositorio, incluyendo pesos y muestra; el coste de VRAM en inferencia lo domina el modelo base, no el LoRA.
- **VRAM para inferencia**: no disponible; depende del tamaño y la cuantización de MOSS-Image-Base, dato que no figura en las fuentes consultadas.
- **GPU recomendadas**: no disponibles para inferencia. Para entrenamiento, el autor valida una GPU de consumo de 12 GB (RTX 4070 Super) con optimizaciones de memoria.
- **Despliegue**: el entrenamiento se realizó con kohya sd-scripts (variante MOSS-Image). No se documenta el runtime de inferencia; el soporte de MOSS-Image en herramientas concretas (diffusers, ComfyUI, TGI u otras) no está confirmado en la información disponible.
- **Ajustes recomendados**: fuerza 1.0 (0.7–0.8 si se busca un resultado más suave), CFG 3, 50 pasos, sampler euler con scheduler sgm_uniform, shift 5 y resolución aproximada de 1 MP en formato apaisado.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parámetros | Contexto de prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| trains_v1 (este LoRA) | LoRA r64/a16, dominio ferroviario diésel | MOSS-Image-Base | No disponible | No disponible en la model card (base: hasta 4K tokens) | No disponible | HuggingFace, 0 descargas, 0 likes |
| MOSS-Image-Base | Modelo completo texto-a-imagen, orientado a texto y maquetación | — | No disponible | Hasta 4.000 tokens según documentación | No disponible (descrito como open-weights) | Repositorio de OpenMOSS |
| MOSS-Image-SFT | Modelo completo afinado para generación | — | No disponible | Hasta 4.000 tokens según documentación | No disponible | Mencionado en la model card |
| Anireal (Civitai) | LoRA de estilo anime-realism | MOSS-Image | No disponible | No disponible | No disponible | Civitai |
| UltraReal MOSS_V2 (Civitai) | LoRA de textura y reducción del aspecto artificial | MOSS-Image, Krea2, Klein9b | No disponible | No disponible | No disponible | Civitai |

La comparación cuantitativa no es posible: ninguno de los LoRA alternativos publica número de parámetros, licencia ni métricas en las fuentes consultadas. La diferencia es de objetivo: Anireal y UltraReal buscan estilo o acabado fotográfico transversal, mientras que trains_v1 codifica un vocabulario de dominio muy cerrado (modelos concretos de locomotora y material remolcado).

## Limitaciones y advertencias

- **Licencia sin declarar**: la model card no especifica licencia del adaptador. Antes de un uso comercial hay que contactar con el autor y verificar también la licencia de MOSS-Image-Base.
- **Dataset con share-alike**: el entrenamiento usa fotografías CC BY, CC BY-SA, CC0, PD y GFDL. Las obras derivadas de material BY-SA pueden quedar sujetas a obligaciones de atribución y compartición; conviene revisar la procedencia antes de publicar resultados.
- **Riesgo de reproducción de originales**: con 4.988 imágenes y un solo epoch, el riesgo de memorización parcial existe; si una salida reproduce una fotografía de Commons, se aplican sus condiciones de atribución.
- **Lettering y heráldicas**: los logotipos de compañía y los textos largos se corrompen a menudo; solo los números de vía cortos son fiables.
- **Confusión entre modelos parecidos**: locomotoras visualmente similares (SW1500, RS-18) se mezclan entre sí.
- **Material remolcado irregular**: los coil cars y bulkhead flats fallan con frecuencia sobre la versión Base.
- **Blandura de imagen**: la salida es algo suave a fuerza 1.0; el propio autor recomienda bajar a 0.7–0.8 o usar MOSS-Image-SFT.
- **Alcance limitado**: vapor, trenes de pasajeros y material no norteamericano quedan fuera del dominio entrenado; el modelo producirá resultados inventados en esos casos.
- **Checkpoint prematuro**: el entrenamiento se detuvo en el paso 5.761 de las dos pasadas previstas, y el checkpoint publicado es el de la época 1; el ajuste está por debajo de lo planeado.
- **Sin validación comunitaria**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de calidad ni de reproducibilidad más allá de la muestra del autor.
- **Idioma**: las caption de entrenamiento están en inglés; el comportamiento con prompts en castellano no está documentado.
- **Sin datos de seguridad**: no se documentan filtros, comportamiento ante contenido sensible ni evaluación de sesgos del modelo base.

## Enlaces

- [colinurbs/moss-trains-lora en HuggingFace](https://huggingface.co/colinurbs/moss-trains-lora)
- [OpenMOSS/MOSS-Image-Base (modelo base)](https://huggingface.co/OpenMOSS/MOSS-Image-Base)
- [MOSS Image: Text That Reads Right, Prompts Up to 4K Tokens (Civitai)](https://civitai.com/articles/36843/moss-image-text-that-reads-right-prompts-up-to-4k-tokens)
- [Anime Realism for MOSS Image (Civitai)](https://civitai.com/models/3006790/anireal-or-anime-realism-for-moss-image)
- [UltraReal - Moss, Krea2, Klein9b - MOSS_V2 (Civitai)](https://civitai.red/models/2462105/ultrareal-moss-krea2-klein9b)
- [Wikimedia Commons (origen del dataset de entrenamiento)](https://commons.wikimedia.org)
