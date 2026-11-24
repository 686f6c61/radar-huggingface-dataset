# fylume/yaob-n10k-mpn

## Resumen

Yaob Next N10K 0.2.0 es una red de conocimiento estructurado publicada por el usuario fylume en Hugging Face, no un modelo de lenguaje. Contiene 10.007 nodos en uso (9.815 nodos de conocimiento derivados de articulos de Wikipedia en ingles con hechos de sus elementos Wikidata, y 192 nodos de procedimiento), 160 nodos canario ficticios de diagnostico y 105.888 relaciones tipadas. Se distribuye en dos formatos: una tienda FG-MPN de solo lectura (formato `fgmpn` 0.2.2) y una tienda para MPN Studio en SQLite, acompanadas de un checkpoint de router entrenado.

El paquete no incluye modelo de lenguaje, encoder ni nucleo de inferencia: por si solo no puede responder preguntas. Para que un sistema responda a partir de esta red hace falta emparejarla con un core y un encoder externos, y el router entrenado se encarga de seleccionar los nodos relevantes en cada consulta.

Es relevante como pieza de infraestructura para arquitecturas de conocimiento modular (Modular Persistent Network), donde el conocimiento factual se mantiene separado de los pesos del modelo y es auditable, versionable y sustituible. La revision 0.2.0 anade 7 nodos y 31 relaciones respecto a 0.1.0 (contenido sobre Canberra, Australia) y edita tres nodos (Sydney, Melbourne, Australia).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de conocimiento modular persistente (MPN); no es un transformer ni un modelo neuronal de lenguaje |
| Parametros totales | No disponible (no es un modelo de parametros; el router entrenado ocupa 12.564.052 bytes en `router.safetensors` y los embeddings de nodos 20.807.808 bytes en `node_emb.f16.npy`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no aplica a una red de conocimiento; el router selecciona nodos por consulta) |
| Tipos de cuantizacion | No disponible (los embeddings se almacenan en float16, `node_emb.f16.npy`) |
| Idiomas soportados | No disponible (el contenido deriva de Wikipedia en ingles y Wikidata) |
| Licencia | Mixta: datos bajo CC BY-SA 4.0 (hechos Wikidata CC0); router bajo Fylume Source-Available Terms 1.0 (`studio/network/checkpoint/LICENSE-ROUTER`) |
| Formato de pesos | FG-MPN (`fgmpn` 0.2.2, `fgmpn-manifest/1`, generacion 1), SQLite (MPN Studio, schema_version 1), `.npy` (float16) y `.safetensors` (router) |

## Arquitectura y entrenamiento

La red se organiza en 19 modulos (18 modulos de dominio mas un modulo `diagnostic-canary` deshabilitado) con 12.263 pertenencias (10.167 primarias y 2.096 compartidas). Los dominios cubren historia (982 nodos primarios), geografia-geopolitica (904), biologia (760), ingenieria-tecnologia (680), artes-literatura-musica (641), matematicas-estadistica (560), medicina-salud (560), fisica (520), computacion-IA (520), filosofia-religion (520), quimica (460), tierra-medioambiente (460), psicologia-sociedad (460), civicas-derecho (440), economia-empresa (420), astronomia (400), lenguaje-linguistica (380) y vida cotidiana (340). Los nodos de procedimiento describen una funcion con su formula, parametros y un ejemplo resuelto, pero no contienen el codigo que la ejecuta.

El conocimiento factual procede de articulos de Wikipedia en ingles y de los hechos de sus elementos Wikidata. Los 160 nodos canario contienen hechos inventados sobre entidades inexistentes, estan marcados como cuarentena en la tienda FG-MPN y nunca son devueltos por la busqueda; sirven para verificar que un sistema emparejado toma sus hechos de la red y no de otra fuente. El router entrenado (checkpoint `ck-261111-200127-6f01ff`) es la unica pieza con pesos propiamente dicha y se usa para seleccionar nodos en un emparejamiento con MPN Studio. No se documentan en la informacion disponible detalles sobre el proceso de entrenamiento del router (datos, objetivo, numero de pasos).

## Capacidades

- Almacenamiento y recuperacion de conocimiento factual estructurado con 105.888 relaciones tipadas (211.776 filas en la tienda FG-MPN, cada relacion en ambos sentidos).
- Busqueda y recorrido (traversal) sobre la red mediante el indice de titulos (`store/index/titles/seg-000001.fgs.fti`) y el formato FG-MPN.
- Organizacion modular del conocimiento en 18 dominios con pertenencias compartidas entre modulos.
- Nodos de procedimiento con formula, parametros y ejemplo resuelto (sin codigo ejecutable).
- Seleccion de nodos mediante router entrenado en un emparejamiento con MPN Studio.
- Edicion y apertura de la red en MPN Studio a traves de la tienda SQLite.
- Deteccion de respuestas no fundamentadas mediante los 160 nodos canario.
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades multilingues por si misma.

## Casos de uso

- Base de conocimiento auditable para un sistema RAG: la red se consulta como fuente factual estructurada y el router selecciona los nodos relevantes; al estar separada de los pesos del modelo, cada hecho es rastreable a su articulo de Wikipedia y elemento Wikidata de origen.
- Verificacion de fundamentacion (grounding) en produccion: los nodos canario permiten comprobar que un sistema emparejado responde a partir de la red y no inventa; si el sistema devuelve un hecho canario como valido, hay un fallo de integracion.
- Prototipado de arquitecturas MPN: util para investigadores que quieran experimentar con conocimiento modular persistente sin construir la red desde cero, usando la tienda FG-MPN de 11,3 MB o la SQLite de 110,9 MB.
- Exploracion y analisis de grafos de conocimiento: las 105.888 relaciones tipadas permiten recorridos multi-salto entre dominios (por ejemplo, historia y geografia-geopolitica, que comparten 784 y 243 nodos respectivamente).
- Editor de conocimiento en MPN Studio: la tienda SQLite con schema_version 1 permite abrir, editar y volver a emparejar la red con un core para que un modelo responda a partir de ella.
- Evaluacion de routers de recuperacion: el checkpoint incluido sirve como referencia para comparar estrategias de seleccion de nodos en tareas de recuperacion de conocimiento.
- Ensenanza y demostracion de separacion conocimiento/modelo: el paquete ilustra el patron de mantener hechos en una red externa versionada (generacion 1) y sustituible sin reentrenar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU para almacenar ni consultar la red: la tienda FG-MPN ocupa 11.281.961 bytes y la SQLite 110.870.528 bytes.
- El router entrenado ocupa 43.418.451 bytes en total (12.564.052 bytes `router.safetensors` y 20.807.808 bytes `node_emb.f16.npy`), por lo que cabe en CPU y en cualquier GPU consumer con VRAM modesta.
- Descarga completa: 166.730.907 bytes en 35 archivos (mas `fylume-release.json` y `SHA256SUMS`), aproximadamente 0,2 GB.
- Despliegue: el formato FG-MPN se lee con la libreria `fgmpn` 0.2.2; la tienda SQLite se abre con MPN Studio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Sistema | Tipo | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yaob Next N10K 0.2.0 | Red de conocimiento MPN + router | 10.007 nodos, 105.888 relaciones; 166,7 MB | No aplica | Mixta (CC BY-SA 4.0 datos; Fylume Source-Available Terms 1.0 router) | Hugging Face, 0 descargas |
| Modelo de lenguaje de ~0,2 GB (p. ej. variantes pequenas) | Modelo neuronal | Cientos de millones de parametros | Tipicamente 2K-8K tokens | Variable | Amplia |
| Grafo de conocimiento Wikidata completo | Grafo de conocimiento | Cientos de millones de entidades | No aplica | CC0 | Descarga publica |
| Modelo RAG con base vectorial propia | Pipeline | Depende de la base | Depende del modelo | Depende de componentes | A medida |

La comparacion directa con modelos de lenguaje no es significativa: Yaob Next N10K no genera texto ni razona, sino que aporta hechos estructurados. Frente a Wikidata completo es mucho mas pequeno y curado (9.815 nodos de conocimiento), con modulos de dominio y un router entrenado especificamente. No se dispone de datos de rendimiento para comparar con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede responder preguntas por si solo; requiere un core y un encoder externos para funcionar como sistema de respuesta.
- Cobertura limitada: 9.815 nodos de conocimiento derivados de articulos de Wikipedia en ingles, con sesgo hacia temas con articulo en esa edicion.
- Idioma: el contenido procede de Wikipedia en ingles y Wikidata; no se documentan capacidades multilingues.
- Los 160 nodos canario contienen hechos inventados y estan en cuarentena; nunca deben tratarse como conocimiento, pero su presencia en el paquete exige filtrarlos correctamente en cualquier integracion.
- Licencia mixta: los datos son CC BY-SA 4.0 (con hechos Wikidata CC0) y el router esta bajo Fylume Source-Available Terms 1.0, que no es una licencia de codigo abierto; es necesario revisar `LICENSE-ROUTER` antes de cualquier uso comercial.
- El router es la unica pieza con pesos y su entrenamiento no esta documentado en la informacion disponible; no se puede evaluar su calidad ni su generalizacion.
- Los nodos de procedimiento no incluyen codigo ejecutable: describen formulas y ejemplos, pero no ejecutan calculos.
- Version 0.2.0 anade solo 7 nodos y edita 3 respecto a 0.1.0; quien necesite exactamente el contenido 0.1.0 debe usar el paquete original.
- Sin descargas ni likes en el momento de la consulta y sin resultados de benchmarks publicados: no hay evidencia externa de calidad en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/fylume/yaob-n10k-mpn
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Terminos del router: `studio/network/checkpoint/LICENSE-ROUTER` (incluido en el repositorio)
- Documentacion incluida en el repositorio: `README.md`, `ATTRIBUTION.md`, `VERIFICATION.md`, `fylume-release.json`, `SHA256SUMS`
- Libreria `fgmpn` 0.2.2: no disponible enlace publico en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
