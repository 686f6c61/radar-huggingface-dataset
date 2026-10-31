# requstory/requ-classify-small

## Resumen

Requ Classify Small es un modelo de clasificacion de sitios web empresariales desarrollado por Requstory Labs (Manchester, Reino Unido). Se trata de un clasificador ligero de 33 millones de parametros, distribuido en formato ONNX con un peso aproximado de 50 MB, capaz de ejecutarse en la CPU de un portatil. Su funcion es leer la pagina principal y hasta cinco paginas internas de la web de una empresa y determinar a que industria pertenece, que tipo de contenido contiene cada elemento del sitio (ofertas, equipos, actividades, audiencias) y que frases evidencian procesos de negocio concretos.

El modelo es el motor que alimenta los mapas de empresa gratuitos de requstory.com. Tecnicamente, se basa en el modelo de embeddings BAAI/bge-small-en-v1.5 (congelado y cuantizado en ONNX) sobre el que se entrenan cabezas lineales para cada tarea, mas un mecanismo de memoria de embeddings para emparejar frases con un catalogo de unos 500 procesos de negocio en 344 equipos. Esta etiquetado como vista previa (preview): en 341 webs de evaluacion acierta la industria un 52% de las veces (75% en top 3), con un objetivo de lanzamiento del 65%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings bge-small-en-v1.5 (transformer encoder, congelado) + cabezas lineales de clasificacion + memoria de embeddings para emparejamiento de procesos |
| Parametros totales | 33 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada: homepage y hasta 5 paginas internas) |
| Tipos de cuantizacion | cuantizado ONNX (cuantizacion del encoder base; detalles exactos no disponibles) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 (cabezas, libreria y codigo); bge-small-en-v1.5 incluido bajo MIT |
| Formato de pesos | ONNX (encoder) y safetensors (heads.safetensors); incluye library.json y memory de embeddings |

## Arquitectura y entrenamiento

El sistema se compone de tres etapas. Primero, el texto del sitio se convierte en embeddings con bge-small-en-v1.5, un encoder transformer de 33 millones de parametros que permanece congelado y se ejecuta cuantizado en ONNX. Segundo, cabezas lineales pequenas entrenadas sobre las etiquetas propias de Requstory producen la industria, el tipo de cada item (menu, encabezado, boton) y la etapa del recorrido del cliente de cada pagina. Tercero, para la evidencia de procesos, una compuerta (gate) filtra las frases que describen trabajo real y las empareja con los procesos del catalogo de la industria usando la redaccion de library.json y embeddings de frases similares de los sitios de entrenamiento (memory).

Los datos de entrenamiento provienen de 2.536 sitios web de empresas localizados via Wikidata y OpenStreetMap, leyendo sus paginas publicas (homepage y hasta 5 paginas internas). Las etiquetas fueron generadas por un modelo teacher de pesos abiertos (DeepSeek, licencia MIT) leyendo las mismas paginas, con verificacion manual sobre una muestra. La taxonomia (64 industrias, 344 equipos, ~500 procesos) fue escrita por Requstory y revisada por personas. No hay indicios de RLHF/DPO; el entrenamiento es supervisado clasico. El paquete no publica el texto de las paginas: memory contiene solo embeddings de frases de los sitios de entrenamiento.

## Capacidades

- Clasificacion de industria: asigna una de 64 industrias (desde contabilidad hasta agua y residuos) con probabilidad, bandera `sure` y top 3.
- Tipificacion de elementos: clasifica cada item de menu, encabezado y boton en una de seis categorias: offering, team, activity, audience, website, other.
- Etapa de pagina: determina la etapa del recorrido del cliente de cada pagina (discover, evaluate, buy, start, use, support, company).
- Evidencia de procesos: identifica frases que demuestran procesos de negocio conocidos de la industria (~500 procesos en 344 equipos).
- Entrada estructurada: acepta JSON con nombre, descripcion y paginas (url, titulo, texto, items con kind: menu, footer, h1, h2, h3, button).
- Ejecucion en CPU: sin necesidad de GPU, apto para portatil.
- No soporta: tool calling, agentes, vision, audio ni generacion de texto; es un clasificador de texto puro.

## Casos de uso

- Enriquecimiento de bases de datos de empresas: dado un dominio, el modelo asigna automaticamente industria y etapa comercial, util para CRM y plataformas B2B que necesitan segmentar leads sin revision manual.
- Mapas de empresa automatizados: como en requstory.com, genera mapas que muestran ofertas, equipos y procesos de una compania a partir de su web publica.
- Filtrado y enrutado de leads: la bandera `sure` (36% de sitios, 75% de precision) permite enrutar solo los casos confiables a automatizacion y el resto a revision humana.
- Analisis competitivo a escala: procesar cientos de webs de un sector para comparar ofertas y etapas del embudo (discover, buy, support) entre competidores.
- Deteccion de procesos de negocio: extraer frases que evidencian procesos concretos (soporte, ventas, operaciones) para consultoras o herramientas de analisis operativa.
- Clasificacion de directorios web: etiquetar listados de empresas en agregadores o marketplaces B2B con industria y tipo de contenido.
- Preprocesamiento para LLMs: usar el clasificador barato como filtro previo para decidir que webs merecen procesamiento mas costoso con modelos generativos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 341 sitios web de evaluacion (eval.json):

| Medida | Puntuacion |
|---|---|
| Industria, top 1 | 52% |
| Industria, top 3 | 75% |
| Sitios donde el modelo esta seguro (`sure`) | 36% |
| Industria cuando esta seguro | 75% |
| Tipo de item | 68% |
| Etapa de pagina | 55% |
| Emparejamiento de procesos, top 1 | 41% |
| Sistema anterior (reglas) | 21% industria correcta |

No hay comparaciones con modelos de terceros en la informacion disponible. El autor declara un objetivo de 65% top 1 para la version final.

## Requisitos de hardware

- VRAM/RAM: al ser ONNX cuantizado de ~50 MB con 33M de parametros, funciona en la CPU de un portatil; no requiere GPU ni VRAM dedicada.
- GPU recomendadas: no necesarias; cualquier CPU moderna es suficiente.
- Consumer hardware: totalmente viable en portatiles y maquinas sin aceleracion; no se requieren requisitos minimos publicados.
- Despliegue: via ONNX Runtime en Python (script requ_classify.py incluido); no hay menciones a vLLM, llama.cpp, Ollama o TGI, y no aplican al ser un clasificador ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| requstory/requ-classify-small | 33M | Clasificacion de webs empresariales (industria, items, procesos) | Apache 2.0 / MIT (base) | Publico en HuggingFace (preview) |
| BAAI/bge-small-en-v1.5 (base) | 33M | Embeddings genericos de texto | MIT | Publico, muy utilizado |
| Clasificadores zero-shot tipo BART-MNLI | ~400M | Clasificacion zero-shot de texto | MIT (bart-large-mnli) | Publicos, mas pesados y lentos en CPU |

Comparativa orientativa: frente a usar bge-small-en-v1.5 directamente con clasificadores zero-shot, requ-classify-small ofrece cabezas especializadas en dominio empresarial con un coste computacional minimo, a cambio de estar limitado a su taxonomia de 64 industrias y al ingles. No hay benchmarks comparativos directos publicados.

## Limitaciones y advertencias

- Solo ingles; sitios construidos integramente en JavaScript necesitan renderizado previo en navegador.
- Confusiones conocidas: oficios y servicios personales (un fontanero etiquetado como servicios de belleza), holding groups y marketplaces.
- Describe lo que una web muestra, no como funciona realmente la empresa por dentro.
- El autor advierte explicitamente no usarlo para decisiones sobre personas, credito o empleo.
- Es una version preview: 52% de precision top 1 en industria, por debajo del objetivo de 65%; usar la bandera `sure` para casos criticos.
- Riesgo de etiquetas erroneas heredadas del teacher model (DeepSeek), aunque con verificacion manual por muestreo; no se publica la tasa de error de etiquetado.
- Restricciones de licencia: ninguna relevante para uso comercial (Apache 2.0 / MIT).
- El paquete no incluye el texto de las paginas de entrenamiento, solo embeddings, lo que limita la auditoria de sesgos sobre los datos originales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/requstory/requ-classify-small
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Requstory Labs: https://requstory.com/lab
- Requstory (producto): https://requstory.com
- Paper: no disponible
- Repositorio de codigo adicional o demo: no disponible
