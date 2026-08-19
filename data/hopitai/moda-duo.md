# HopitAI/moda-duo

## Resumen

MODA Duo es un sistema de enrutamiento para busqueda text-to-image de moda desarrollado por HopitAI. No es un modelo nuevo en sentido estricto, sino una "receta de servido" que combina dos modelos abiertos existentes: MODA Pro Lite+ y MODA. La premisa es que las consultas de busqueda de moda vienen en dos formas —titulos cortos de catalogo y descripciones naturales largas— y ningun modelo pequeno es optimo para ambas. Duo enruta cada consulta al constituyente que mejor se adapta a su forma y ejecuta un solo encoder y una sola consulta de vecino mas cercano por busqueda.

El sistema anade cero parametros: es una capa de enrutamiento sobre dos sistemas abiertos con licencia Apache 2.0. En una carga de trabajo mixta de 12.000 consultas agregadas de seis benchmarks, Duo alcanza un MAP@10 de 0,2137, un +5,0% sobre MODA y +5,4% sobre MODA Pro Lite+, ambos resultados significativos. El coste de servido es minimo: un indice ANN extra por constituyente en tiempo de construccion y ningun coste adicional en tiempo de consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de enrutamiento sobre dos modelos open_clip: MODA (FashionSigLIP) y MODA Pro Lite+ |
| Parametros totales | 0 (anade cero parametros; es una receta de servido, no un modelo entrenado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (sistema de retrieval, no un LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica (no tiene pesos propios; los constituyentes usan open_clip) |

## Arquitectura y entrenamiento

MODA Duo no es un modelo entrenado sino una capa de enrutamiento sobre dos sistemas abiertos. Consiste en dos indices ANN construidos offline con hnswlib —uno por cada constituyente—, un enrutador que clasifica cada consulta de texto como "titulo de catalogo" o "descripcion natural", y un pipeline de servido que ejecuta un solo encoder y una sola consulta de vecino mas cercano por busqueda, sin re-ranking.

Los constituyentes son MODA (FashionSigLIP con harness de servido, 203M parametros) y MODA Pro Lite+ (encoder de moda entrenado). La politica de enrutamiento se selecciono sobre datos de validacion de OpenVTON y datos de desarrollo de GLAMI, minimizando el regret contra el oraculo por regimen, y se congelo antes de evaluar los benchmarks. Ningun benchmark fue consultado durante la seleccion. El enrutador es un callable reemplazable: se puede sustituir por cualquier politica que mapee una consulta a un constituyente.

## Capacidades

- Busqueda text-to-image de moda con enrutamiento adaptativo por forma de consulta
- Extraccion de caracteristicas (feature extraction) via pipeline de open_clip
- Servido con un solo encoder y una sola consulta ANN por busqueda
- Enrutador reemplazable mediante cualquier politica personalizada
- Construccion de indices offline con hnswlib
- Sin re-ranking en tiempo de consulta

## Casos de uso

- Busqueda en catalogos de moda: consultas cortas tipo "buckle round toe flat shoes" se enrutan a MODA Pro Lite+, optimo para titulos de catalogo, con MAP@10 de 0,3201 en KAGL.
- Busqueda por descripcion natural: descripciones largas tipo "When warm weekends are abound, make sure your closet..." se enrutan a MODA, que maneja mejor este tipo de consultas.
- E-commerce de moda con carga mixta: en workloads donde conviven titulos cortos y descripciones largas, Duo supera a ambos constituyentes individuales (+5,0% sobre MODA y +5,4% sobre MODA Pro Lite+ en MAP@10 agregado).
- Sistema de busqueda con politica de enrutamiento personalizable: el enrutador es un callable que puede reemplazarse con logica de negocio propia, por ejemplo para priorizar ciertos tipos de consulta segun la estacionalidad del catalogo.
- Despliegue con coste controlado: anade un indice extra en tiempo de construccion pero ningun coste adicional en tiempo de consulta, lo que lo hace adecuado para servicios con presupuesto de inferencia ajustado.
- Baseline en el benchmark MODA: puede usarse como referencia en evaluaciones de sistemas de retrieval de moda, ya que los resultados por consulta y la curva de sensibilidad estan publicados en el repositorio.

## Benchmarks y rendimiento

MAP@10 sobre corpus completo, todas las consultas ground-truth, evaluadas con `pytrec_eval map_cut.10` y bootstrap pareado con 10.000 remuestras. La politica de enrutamiento se congelo sobre datos de desarrollo antes de puntuar los benchmarks.

| benchmark | MODA | MODA Pro Lite+ | MODA Duo |
|---|---:|---:|---:|
| KAGL | 0,2887 | 0,3201 | 0,3201 |
| Polyvore | 0,3726 | 0,4049 | 0,4049 |
| Atlas | 0,1862 | 0,1904 | 0,1904 |
| Fashion200K | 0,1946 | 0,1846 | 0,1866 |
| DeepFashion In-Shop | 0,1642 | 0,1026 | 0,1640 |
| DeepFashion Multimodal | 0,0147 | 0,0133 | 0,0159 |
| Pooled, 12.000 consultas | 0,2035 | 0,2026 | 0,2137 |

Duo supera a ambos constituyentes en el agregado. La excepcion es Fashion200K, donde Duo pierde un 4% frente a MODA; en workloads conocidos de descripciones largas homogeneas, se recomienda usar MODA directamente.

## Requisitos de hardware

- No se han publicado requisitos de hardware especificos para MODA Duo en la informacion disponible.
- El sistema ejecuta un solo encoder por consulta, por lo que el coste de inferencia es comparable al de un unico modelo open_clip.
- Los indices ANN se construyen offline con hnswlib, lo que requiere memoria suficiente para almacenar dos indices de vectores del catalogo.
- El codigo de servido se instala con `pip install open_clip_torch pillow numpy hnswlib` y se ejecuta con `python serving_ann.py --demo`.
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

| Sistema | Parametros | Enfoque | MAP@10 pooled |
|---|---|---|---|
| MODA Duo | 0 (router) | Enrutamiento entre dos modelos abiertos | 0,2137 |
| MODA | 203M | FashionSigLIP con harness de servido | 0,2035 |
| MODA Pro Lite+ | no disponible | Encoder de moda entrenado | 0,2026 |

MODA Pro (hosted) fusiona ambos constituyentes en lugar de elegir entre ellos, pero no esta disponible como codigo abierto. No se han identificado otros sistemas de enrutamiento de retrieval de moda comparables en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo independiente: depende de los dos constituyentes (MODA y MODA Pro Lite+) para funcionar.
- Fashion200K es el punto debil conocido: Duo pierde un 4% frente a MODA en ese benchmark.
- Para workloads de descripciones largas homogeneas, se recomienda usar MODA directamente en lugar de Duo.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que es muy reciente y no ha sido validado por la comunidad.
- No se han publicado datos sobre sesgos, limitaciones de idioma ni comportamiento en dominios fuera de moda.
- La politica de enrutamiento se congelo antes de evaluar los benchmarks, pero no se ha validado en produccion.
- No se ha publicado informacion sobre los idiomas soportados por los constituyentes.

## Enlaces

- HuggingFace: https://huggingface.co/HopitAI/moda-duo
- Repositorio GitHub: https://github.com/hopit-ai/Moda
- MODA (constituyente): https://huggingface.co/HopitAI/moda-fashionsiglip-multiview-203m
- MODA Pro Lite (constituyente): https://huggingface.co/HopitAI/moda-pro-lite
- Post de la serie MODA: https://hopitai.substack.com/p/moda-series-finale
- Perfil de HopitAI en HuggingFace: https://huggingface.co/HopitAI/models
