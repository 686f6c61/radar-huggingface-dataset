# Phr00t/WAN2.2-14B-Rapid-AllInOne

## Resumen

WAN2.2-14B-Rapid-AllInOne es un conjunto de modelos de vídeo creados por el usuario Phr00t, que combina los modelos base Wan-AI/Wan2.2-I2V-A14B y Wan-AI/Wan2.2-T2V-A14B con otros modelos y aceleradores de la misma familia (como SkyReels, WAN 2.2 Lightning, Lightx2v, etc.) para ofrecer una solución rápida y unificada de generación de vídeo tanto a partir de texto como de imagen. El objetivo es simplificar el flujo de trabajo en ComfyUI, permitiendo cargar el modelo, el VAE y el CLIP desde un único archivo safetensors.

El modelo se distribuye en múltiples versiones (V1 a V10 y variantes MEGA), cada una con ajustes en la mezcla de componentes para mejorar la adherencia al prompt, la calidad de movimiento o reducir artefactos. Todas las versiones están pensadas para funcionar con 1 CFG y 4 pasos, y son compatibles con LORAs de WAN 2.1 y WAN 2.2 de "bajo ruido". El autor declara que el proyecto está deprecado y ya no recibe mantenimiento, pero sigue siendo relevante por su popularidad (1648 likes) y por ofrecer una solución integrada para generación de vídeo en hardware modesto (se reporta funcionamiento en 8 GB de VRAM). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para video (basado en Wan2.2) con VAE y CLIP integrados |
| Parametros totales | 14 mil millones (14B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (mencionado en la descripcion); se ofrecen variantes en safetensors de 8 bits (~21.78 GB) |
| Idiomas soportados | no disponible (probablemente ingles y chino, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint unico con modelo, VAE y CLIP) |

## Arquitectura y entrenamiento

El modelo es una mezcla de pesos de Wan2.2 (tanto I2V como T2V) con otros modelos y aceleradores de la misma familia. No se trata de un entrenamiento desde cero, sino de una fusion de checkpoints ya existentes mediante tecnicas de merging. La arquitectura base es la de Wan2.2, un modelo de difusion latente para video con 14 mil millones de parametros, que incluye un VAE y un CLIP. El autor ha ido iterando sobre la proporcion de cada componente en cada version: por ejemplo, la V6 introduce una nueva estructura de fusion, la V8 basa el T2V completamente en WAN 2.2 "low" con PUSA, SkyReels y Lightning, y la V10 corrige los aceleradores usados (WAN 2.2 Lightning para I2V y Lightx2v de rango adaptativo para T2V). No se proporcionan datos sobre el dataset de entrenamiento ni sobre el proceso de entrenamiento original, ya que se trata de un merge. Las versiones MEGA incluyen soporte VACE para manejar primer y ultimo frame.

## Capacidades

- Generacion de video a partir de texto (T2V) y a partir de imagen (I2V).
- Soporte de "first frame to last frame" y "last frame only" en las versiones MEGA gracias a la integracion de VACE.
- Compatibilidad con LORAs de WAN 2.1 y WAN 2.2 de "bajo ruido" (no se recomiendan las de "alto ruido").
- Funcionamiento con 1 CFG y 4 pasos, lo que reduce significativamente el tiempo de generacion frente a los modelos originales.
- Capacidad de ejecucion en GPUs con 8 GB de VRAM (segun el autor, para la version FP8).
- Integracion sencilla en ComfyUI mediante el nodo "Load Checkpoint".
- Existen variantes NSFW para usos de investigacion cientifica (segun el autor).

## Casos de uso

- Prototipado rapido de videos para redes sociales: con solo 4 pasos y 1 CFG, se pueden generar clips cortos de alta calidad en segundos, ideal para creadores que necesitan iterar rapidamente sobre ideas visuales.
- Generacion de videos a partir de imagenes fijas: el modo I2V permite animar fotografias o ilustraciones, util para presentaciones, anuncios o contenido educativo.
- Creacion de videos de transicion entre dos frames: las versiones MEGA permiten especificar un primer y un ultimo frame, generando una interpolacion coherente entre ambos, aplicable a animaciones o efectos de morphing.
- Exploracion artistica y generativa: al ser un modelo abierto con licencia Apache 2.0, artistas y disenadores pueden experimentar sin restricciones comerciales, combinando LORAs personalizados para estilos especificos.
- Investigacion en generacion de video: el modelo sirve como base para estudiar tecnicas de merging de checkpoints, aceleracion por destilacion y comportamiento de difusion en video con pocos pasos.
- Generacion de contenido para videojuegos o cinematics: la capacidad de controlar el primer y ultimo frame facilita la creacion de secuencias de apertura o cierre para escenas de juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas cuantitativas (como FVD, CLIP score o similares) para comparar con otros modelos. La unica informacion de rendimiento es cualitativa: se reporta que funciona en 8 GB de VRAM y que las versiones mas recientes mejoran la adherencia al prompt y reducen el ruido en I2V, pero sin numeros concretos.

## Requisitos de hardware

- VRAM estimada: se menciona que funciona en 8 GB de VRAM, probablemente con cuantizacion FP8 y resoluciones bajas o pocos frames. No se especifica el consumo exacto para otras configuraciones.
- GPU recomendadas: para 8 GB, una RTX 3060 o similar; para mayor calidad y resolucion, se necesitarian GPUs con 16 GB o mas (RTX 4090, A100, etc.).
- Compatibilidad con consumer GPU: si, al menos en configuraciones de 8 GB, segun el autor.
- Opciones de despliegue: ComfyUI es el entorno principal, dado que el modelo esta disenado para cargarse con el nodo "Load Checkpoint". Tambien podria usarse con otros frameworks que soporten safetensors de difusion (por ejemplo, Diffusers, aunque no se menciona).
- Latencia y throughput: no se proporcionan datos concretos. Con 4 pasos y 1 CFG, se espera una generacion rapida, pero depende de la resolucion, el numero de frames y la GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WAN2.2-14B-Rapid-AllInOne | 14B | no disponible | T2V/I2V, merge | Apache 2.0 | Hugging Face |
| Wan-AI/Wan2.2-I2V-A14B | 14B | no disponible | I2V | Apache 2.0 | Hugging Face |
| Wan-AI/Wan2.2-T2V-A14B | 14B | no disponible | T2V | Apache 2.0 | Hugging Face |
| SkyReels (base) | no disponible | no disponible | T2V/I2V | no disponible | no disponible |

La comparativa se limita a los modelos base de Wan2.2, ya que no se dispone de datos de otros modelos de video comparables con metricas objetivas. La principal ventaja de este merge frente a los modelos base es la velocidad (4 pasos vs. los pasos habituales de Wan2.2) y la integracion de VAE y CLIP en un solo archivo.

## Limitaciones y advertencias

- El autor declara explicitamente que el proyecto esta deprecado y ya no recibe mantenimiento. No se esperan correcciones de errores ni nuevas versiones.
- Las versiones mas antiguas (V1-V5) presentan problemas de ruido y cambios de color en I2V, especialmente en los primeros frames. Las versiones V6+ mejoran esto, pero no lo eliminan por completo.
- La compatibilidad con LORAs de WAN 2.1 puede degradarse con LORAs de alta intensidad, provocando frames iniciales de mala calidad en T2V.
- Las versiones MEGA requieren un workflow especifico (incluido en la carpeta mega-v3/) que es mas complejo que el de las versiones estandar.
- Existen variantes NSFW, pero el autor las limita a "investigacion cientifica" y desaconseja su uso para otros fines. La licencia Apache 2.0 no impide el uso comercial, pero el contenido generado puede estar sujeto a otras regulaciones.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma. Al estar basado en Wan2.2, es probable que el modelo funcione mejor en ingles y chino, pero no hay confirmacion.
- El tamano del repositorio es de 1417.3 GB, lo que implica que la descarga de todas las versiones es muy pesada. Se recomienda descargar solo la version especifica necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phr00t/WAN2.2-14B-Rapid-AllInOne
- README del modelo: https://huggingface.co/Phr00t/WAN2.2-14B-Rapid-AllInOne/blob/main/README.md
- Perfil del autor: https://huggingface.co/Phr00t
- Pagina en Civitai (V10): https://civitai.red/models/2109549/phr00twan22-14b-rapid-allinone
- Archivo en CivArchive: https://civarchive.com/models/1824594?modelVersionId=2064884
- Repositorio espejo en GitHub: https://github.com/Damacol/phr00t-wan2-2-14b-rapid-allinone/tree/main
