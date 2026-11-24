# neurocraftart/krea2_turbo

## Resumen

krea2_turbo es un espejo (mirror) del repositorio `mikeprass/krea2_turbo`, publicado por el usuario neurocraftart para su integracion en los instaladores de NeuroCraft Studio. No se trata de un modelo original, sino de una redistribucion de una cuantizacion LowVRAM del modelo Krea 2 Turbo de Krea, realizada por Mike Prass con esquemas w4a8 e int8 convrot. El repositorio incluye ademas componentes auxiliares: un codificador de texto basado en Qwen3-VL de 4B (en dos variantes de cuantizacion) y el VAE de Qwen Image.

El modelo subyacente, Krea 2 Turbo, es un modelo generativo de imagenes de la empresa Krea, segun se deduce del nombre y de los componentes que lo acompanan (VAE de Qwen Image y codificador Qwen3-VL). La ficha disponible no aporta detalles sobre la arquitectura interna del difusor ni sobre el proceso de entrenamiento, por lo que los datos tecnicos de esta ficha se limitan a lo que puede inferirse del contenido del repositorio y de la model card.

La relevancia de este repositorio es practica: ofrece una version cuantizada pensada para entornos con poca VRAM (tag `lowvram`) y para su uso directo en ComfyUI, lo que facilita el despliegue del modelo en GPUs de consumo. El repositorio ocupa 16,8 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para generacion de imagenes, segun los componentes del repo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | w4a8 (pesos 4 bits, activaciones 8 bits) e int8, con esquema convrot; incluye variantes para el difusor y para el codificador de texto |
| Idiomas soportados | no disponible |
| Licencia | other, con licencia denominada "same-as-original" (se heredan los terminos del modelo original Krea 2 Turbo y de la release cuantizada) |
| Formato de pesos | safetensors |

Componentes incluidos en el repositorio:

| Fichero | Tamano (bytes) | Funcion |
|---|---|---|
| `krea2_turbo_w4a8_convrot.safetensors` | 8.570.697.312 | Difusor cuantizado w4a8 |
| `qwen3vl_4b_int8_convrot.safetensors` | 4.864.124.848 | Codificador de texto Qwen3-VL 4B en int8 |
| `qwen3vl_4b_w4a8_convrot.safetensors` | 3.106.766.490 | Codificador de texto Qwen3-VL 4B en w4a8 |
| `qwen_image_vae.safetensors` | 253.806.246 | VAE de Qwen Image |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del difusor Krea 2 Turbo ni sobre su proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO). La model card del espejo no describe la arquitectura del modelo original y se limita a indicar que se trata de una cuantizacion LowVRAM realizada por Mike Prass.

Lo que si puede afirmarse a partir de los ficheros es la composicion del pipeline: un difusor principal (Krea 2 Turbo) cuantizado en w4a8, un codificador de texto Qwen3-VL de 4B de parametros en dos variantes (int8 y w4a8) y un VAE procedente de Qwen Image. La tecnica de cuantizacion empleada se denomina "convrot" en la model card, pero no se detalla en que consiste ni que precision o degradacion introduce respecto al modelo original.

## Capacidades

- Generacion de imagenes a partir de texto: es la funcion principal del difusor Krea 2 Turbo, segun se desprende de los componentes del repositorio.
- Codificacion de prompts mediante un modelo de lenguaje-vision (Qwen3-VL 4B), lo que sugiere capacidad de procesar instrucciones textuales y potencialmente entradas de imagen.
- Ejecucion en entornos de baja VRAM: la cuantizacion w4a8 e int8 esta disenada explicitamente para reducir el consumo de memoria.
- Integracion con ComfyUI: el tag `comfyui` indica que los pesos estan preparados para cargarse en flujos de trabajo de esta interfaz.
- No se dispone de informacion sobre soporte de tool calling, agentes, modo thinking, audio u otras capacidades adicionales.

## Casos de uso

- Generacion de imagenes en estaciones de trabajo con GPU de consumo: la cuantizacion w4a8 reduce el peso del difusor a unos 8,6 GB, lo que permite cargarlo en GPUs con 12-16 GB de VRAM junto con el codificador de texto y el VAE.
- Prototipado rapido en ComfyUI: al estar empaquetado para los instaladores de NeuroCraft Studio y etiquetado para ComfyUI, permite montar un pipeline de generacion de imagenes sin convertir pesos manualmente.
- Despliegue en entornos con memoria limitada: la variante int8 del codificador de texto (4,9 GB) o la w4a8 (3,1 GB) permiten ajustar el consumo total segun la VRAM disponible.
- Evaluacion comparativa de cuantizaciones: disponer de dos variantes del codificador de texto (int8 y w4a8) facilita medir el impacto de la cuantizacion en la calidad final de la imagen generada.
- Creacion de contenido visual para blogs o documentacion tecnica: el modelo puede generar ilustraciones a partir de descripciones textuales dentro de un flujo automatizado.
- Investigacion sobre cuantizacion de modelos de difusion: el repositorio sirve como material de estudio para analizar el esquema convrot aplicado a un difusor y a un codificador de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el difusor cuantizado ocupa unos 8,6 GB en disco; el codificador de texto, entre 3,1 GB (w4a8) y 4,9 GB (int8); el VAE, unos 254 MB. El consumo total en VRAM depende del runtime y de si los componentes se cargan simultaneamente, pero el conjunto completo ronda los 12-14 GB en el peor caso con la variante int8.
- GPU recomendadas: no disponibles de forma explicita. Por el tamano de los pesos, una GPU con 16 GB o mas (RTX 4080, RTX 4090, A100, H100) permite cargar el pipeline completo con margen.
- GPU de consumo: es probable que quepa en GPUs de 12 GB usando la variante w4a8 del codificador de texto y descargando componentes entre fases, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: ComfyUI (indicado por los tags); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no son adecuados para un modelo de difusion de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo original que permitan una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es un espejo, no un modelo original: los derechos pertenecen a Krea y a Mike Prass; la licencia "same-as-original" obliga a consultar los terminos del modelo original y de la release cuantizada antes de cualquier uso comercial.
- La cuantizacion w4a8 e int8 puede introducir degradacion en la calidad de las imagenes generadas respecto al modelo en precision completa; no se documenta el grado de perdida.
- No hay informacion sobre sesgos del modelo original ni sobre riesgos de generacion de contenido inapropiado.
- No se documentan los idiomas soportados por el codificador de texto ni el difusor.
- El repositorio no registra descargas ni likes, y su fecha de creacion es reciente; no hay evidencia de validacion por parte de la comunidad.
- No se dispone de informacion sobre el proceso de entrenamiento, lo que impide evaluar la procedencia de los datos y posibles sesgos.
- El esquema de cuantizacion "convrot" no esta descrito en la model card; conviene verificar su compatibilidad con la version de ComfyUI y con los nodos utilizados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/neurocraftart/krea2_turbo
- Repositorio original cuantizado: https://huggingface.co/mikeprass/krea2_turbo
- Modelo original: Krea 2 Turbo (Krea); no se proporciona URL en la informacion disponible.
