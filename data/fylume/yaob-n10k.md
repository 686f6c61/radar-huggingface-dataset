# fylume/yaob-n10k

## Resumen

Yaob N10K 0.1.0 es una red de conocimiento estructurada publicada por fylume bajo el ecosistema FG-MPN (Modular Persistent Network), no un modelo de lenguaje. Contiene 10.000 nodos en uso (9.808 nodos de conocimiento, uno por articulo de Wikipedia en ingles con los hechos de su item de Wikidata, y 192 nodos de procedimiento), mas 160 nodos canario ficticios de diagnostico y 105.857 relaciones tipadas. Se distribuye en dos formatos: un store FG-MPN de solo lectura y un store SQLite para MPN Studio.

El paquete incluye un router entrenado (checkpoint `ck-261111-200127-6f01ff`) que, emparejado con un core y un encoder externos, permite que un modelo responda a partir de la red. Es importante subrayar que el repositorio no contiene ningun modelo de lenguaje, encoder ni core: los ficheros por si solos no responden preguntas. Su relevancia actual radica en que ejemplifica un patron de conocimiento desacoplado del modelo, auditable y con canarios de diagnostico para verificar que un sistema toma sus hechos de la red.

La release corresponde al contenido del 12 de noviembre de 2026, convertido a FG-MPN el 22 de noviembre de 2026. Existe una revision posterior, Yaob Next N10K, que conserva todos los nodos y relaciones de esta version (salvo tres nodos editados) y anade 7 nodos y 31 relaciones; el autor recomienda usar Yaob Next N10K salvo que se necesite exactamente el contenido 0.1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de conocimiento modular persistente (FG-MPN); router entrenado sobre embeddings de nodo |
| Parametros totales | No aplica (no es un modelo neuronal de lenguaje). Router: `router.safetensors` de 12.564.052 bytes y `node_emb.f16.npy` de 20.807.808 bytes; numero de parametros no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo generativo); no disponible |
| Tipos de cuantizacion | No disponibles (embeddings de nodo en float16; router en safetensors) |
| Idiomas soportados | No disponibles como campo declarado; el contenido son hechos de Wikidata y articulos de Wikipedia en ingles |
| Licencia | Mixta: datos CC BY-SA 4.0 (hechos de Wikidata CC0); router bajo Fylume Source-Available Terms 1.0 (fichero `LICENSE-ROUTER`) |
| Formato de pesos | FG-MPN (`fgmpn` 0.2.2, `fgmpn-manifest/1`, generacion 1), MPN Studio network store (SQLite, schema_version 1), router checkpoint en safetensors y `.npy` |

## Arquitectura y entrenamiento

El sistema no es un transformer ni un modelo generativo: es una red de conocimiento persistente y modular. Los datos se organizan en 19 modulos MPN (18 modulos de dominio mas el modulo `diagnostic-canary` deshabilitado), con 12.254 pertenencias a modulo (10.160 primarias y 2.094 compartidas). Cada nodo de conocimiento corresponde a un articulo de Wikipedia en ingles y almacena los hechos de su item de Wikidata; los nodos de procedimiento describen una funcion con su formula, parametros y un ejemplo resuelto, pero no contienen el codigo que la ejecuta. Las relaciones tipadas suman 105.857, almacenadas en el store FG-MPN en ambas direcciones (211.714 filas).

El router es un componente entrenado que un emparejamiento en MPN Studio usa para seleccionar nodos; se publica como checkpoint con embeddings de nodo en float16 y pesos en safetensors. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de entrenamiento del router ni si se emplearon RLHF o DPO. Los modulos de mayor tamano primario son history (980 nodos), geography-geopolitics (900), biology (760) y engineering-technology (680); geography-geopolitics es tambien el que mas miembros compartidos aporta (782).

## Capacidades

- Almacenamiento y recuperacion de hechos estructurados procedentes de Wikidata y Wikipedia en ingles, con 9.808 nodos de conocimiento.
- Navegacion y busqueda por relaciones tipadas (105.857 relaciones) y por titulos mediante indice (`store/index/titles/seg-000001.fgs.fti`).
- Organizacion modular por dominio con pertenencia primaria y compartida, lo que permite acotar la busqueda a areas como medicina, fisica o derecho.
- Nodos de procedimiento (192) con formula, parametros y ejemplo resuelto, utiles para describir calculos sin ejecutar codigo.
- Seleccion de nodos mediante router entrenado para emparejamientos en MPN Studio.
- Diagnostico de fidelidad: 160 nodos canario con hechos inventados, en modulo deshabilitado y estado `quarantined`, que nunca se devuelven en busquedas, para comprobar que un sistema no inventa y toma sus hechos de la red.
- No incluye generacion de texto, razonamiento autonomo, codigo, vision, audio, tool calling ni capacidades de agente por si mismo; estas dependen del core y el encoder externos con los que se empareje.

## Casos de uso

- Verificacion de fidelidad factual en pipelines RAG: los 160 nodos canario permiten inyectar hechos inexistentes y comprobar que el sistema emparejado no los devuelve como conocimiento, validando que la respuesta procede de la red y no del modelo.
- Base de conocimiento de dominio acotado: usando los modulos por area (por ejemplo, medicine-health con 560 nodos primarios o civics-law con 440), se puede restringir la recuperacion a un dominio concreto y reducir el ruido en las respuestas.
- Exploracion y analisis de grafos de conocimiento: las 105.857 relaciones tipadas permiten recorridos multi-salto para construir explicaciones trazables de una entidad a partir de sus conexiones.
- Prototipado de asistentes con respuesta basada en fuentes: el store SQLite de MPN Studio se abre, edita y empareja con un core para que un modelo responda citando nodos concretos de la red.
- Descripcion de procedimientos y calculos: los 192 nodos de procedimiento sirven para documentar formulas con parametros y ejemplos resueltos en herramientas de soporte o documentacion tecnica.
- Evaluacion de routers y estrategias de seleccion de nodos: el checkpoint publicado permite reproducir y comparar el enrutado por modulos frente a busquedas por titulo o por relaciones.
- Integracion en runtimes alternativos: el store FG-MPN de solo lectura (11.283.574 bytes) puede leerse desde otros runtimes distintos de MPN Studio para experimentar con el formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU para almacenar o leer la red: el store FG-MPN ocupa 11.283.574 bytes y el store SQLite 108.859.392 bytes; el router suma 43.418.451 bytes. El repositorio completo son 164.721.087 bytes en 35 ficheros.
- El checkpoint del router (12.564.052 bytes en safetensors y 20.807.808 bytes de embeddings en float16) cabe holgadamente en cualquier GPU de consumo, e incluso en CPU para inferencia del enrutado.
- GPU recomendadas: no disponibles; al no ser un modelo generativo, no hay requisitos de VRAM propios mas alla de los del core y el encoder externos que se emparejen.
- Opciones de despliegue: lectura directa del store FG-MPN con la libreria `fgmpn` 0.2.2; apertura, edicion y emparejamiento con MPN Studio mediante el store SQLite; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Sistema | Tipo | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yaob N10K 0.1.0 | Red de conocimiento FG-MPN con router | 10.000 nodos en uso, 105.857 relaciones, 164,7 MB | No aplica | Datos CC BY-SA 4.0; router bajo Fylume Source-Available Terms 1.0 | Hugging Face (fylume/yaob-n10k) |
| Yaob Next N10K | Misma red, revision posterior | Nodos y relaciones de 0.1.0 mas 7 nodos y 31 relaciones | No aplica | No disponible en la informacion | Hugging Face (referenciado por el autor) |
| Modelos de lenguaje de 7-8B | Transformer generativo | 7-8 mil millones de parametros | Decenas de miles de tokens | Variables (Apache 2.0, Llama, etc.) | Amplia |

La comparacion con modelos de lenguaje no es directa: Yaob N10K no genera texto y necesita un core y un encoder para responder. Frente a bases de conocimiento genericas como Wikidata completa, esta release es un subconjunto curado de 9.808 entidades con modulo, relaciones y router entrenado, lo que facilita el control y la auditoria. No se dispone de datos de rendimiento para comparar con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: sin core y encoder externos no puede responder preguntas; el repositorio no incluye ninguno de los dos.
- Cobertura limitada: 9.808 nodos de conocimiento, un subconjunto de Wikipedia en ingles y Wikidata; no cubre el conocimiento fuera de esas entidades.
- Contenido en ingles: los hechos provienen de articulos de Wikipedia en ingles; el soporte multilingue no esta declarado.
- Licencia mixta y restrictiva en parte: los datos son CC BY-SA 4.0 (con hechos de Wikidata CC0), pero el router se rige por Fylume Source-Available Terms 1.0, que conviene revisar antes de cualquier uso comercial.
- Presencia de datos ficticios: los 160 nodos canario son inventados y estan en cuarentena; cualquier herramienta que los muestre debe tratarse como fallo de aislamiento.
- Los nodos de procedimiento describen formulas pero no incluyen el codigo que las ejecuta; no deben usarse como implementacion directa.
- Version desactualizada respecto a Yaob Next N10K, que contiene esta red con tres nodos editados y 7 nodos y 31 relaciones adicionales.
- Riesgo de alucinacion del sistema emparejado: la red no controla lo que el core externo genere fuera de los nodos recuperados; los canarios ayudan a detectarlo pero no lo eliminan.
- No se dispone de informacion sobre sesgos del contenido, composicion exacta del dataset de entrenamiento del router ni evaluaciones de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fylume/yaob-n10k
- Licencia de los datos (CC BY-SA 4.0): https://creativecommons.org/licenses/by-sa/4.0/
- Terminos del router: fichero `studio/network/checkpoint/LICENSE-ROUTER` dentro del repositorio
- Documentacion incluida en el repositorio: `README.md`, `ATTRIBUTION.md`, `VERIFICATION.md`, `fylume-release.json`, `SHA256SUMS`
- No se han encontrado en la informacion disponible papers, blogs, repositorios de codigo ni demos adicionales.
