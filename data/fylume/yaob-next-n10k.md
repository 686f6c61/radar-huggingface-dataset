# fylume/yaob-next-n10k

## Resumen

Yaob Next N10K 0.2.0 es un paquete de datos estructurados para MPN (Modular Persistent Network), no un modelo de lenguaje. Lo publica el autor fylume y contiene una red de 10.007 nodos de conocimiento validados (9.815 nodos de conocimiento, uno por articulo de Wikipedia en ingles con los hechos de su elemento de Wikidata, mas 192 nodos de procedimiento) y 105.888 relaciones tipadas. Se distribuye en dos formatos equivalentes: una tienda FG-MPN de solo lectura (formato `fgmpn` 0.2.2, generacion 1) y una tienda de red para MPN Studio en SQLite (schema_version 1), ademas de un checkpoint de router entrenado.

El paquete no incluye ningun modelo de lenguaje, encoder ni nucleo de razonamiento. Por si solo no puede responder preguntas: para que un sistema conteste a partir de esta red hace falta emparejarla con un nucleo y un encoder, y el router entrenado se encarga de seleccionar los nodos relevantes. Es, por tanto, infraestructura de conocimiento para arquitecturas de recuperacion modular, no un modelo generativo.

La revision 0.2.0 anade 7 nodos y 31 relaciones respecto a la 0.1.0 (Canberra, Old Parliament House Canberra, New South Wales, Australian Capital Territory, Federation of Australia, Victoria y Walter Burley Griffin) y edita tres nodos existentes (Sydney, Melbourne y Australia). El repositorio ocupa 0,2 GB y tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de conocimiento modular persistente (MPN); no es un transformer ni un modelo neuronal de lenguaje |
| Parametros totales | No disponible (no es un modelo de parametros; el router entrenado ocupa 43.418.451 bytes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no aplica a un almacen de conocimiento) |
| Tipos de cuantizacion | No disponible (los embeddings del router se almacenan en `node_emb.f16.npy`, float16) |
| Idiomas soportados | No disponible; el contenido se basa en Wikipedia en ingles y hechos de Wikidata |
| Licencia | Datos de red: CC BY-SA 4.0 (hechos de Wikidata CC0); router entrenado: Fylume Source-Available Terms 1.0 (weights) |
| Formato de pesos | FG-MPN (`fgmpn` 0.2.2, `fgmpn-manifest/1`), SQLite (MPN Studio store), `.npy` (float16) y `safetensors` (router) |

## Arquitectura y entrenamiento

La red se organiza en 19 modulos (18 modulos de dominio mas un modulo `diagnostic-canary` deshabilitado) con 12.263 pertenencias (10.167 primarias y 2.096 compartidas). Los dominios cubren areas como historia (982 nodos primarios), geografia-geopolitica (904), biologia (760), ingenieria-tecnologia (680), artes-literatura-musica (641), matematicas-estadistica (560), medicina-salud (560), fisica (520), computacion-IA (520) o filosofia-religion (520), entre otros. Cada relacion se almacena en ambos sentidos en la tienda FG-MPN, lo que da 211.776 filas de relacion a partir de 105.888 relaciones.

Los nodos de procedimiento describen una funcion con su formula, parametros y un ejemplo resuelto, pero no contienen el codigo que la ejecuta. La red incluye ademas 160 nodos canario con hechos inventados (por ejemplo, "The Effaneilt Institute was founded in 1800."), marcados como `quarantined` en la tienda FG-MPN y nunca devueltos por la busqueda; sirven para comprobar que un sistema toma sus hechos de la red y no de otra fuente. El router es un checkpoint entrenado (`ck-261111-200127-6f01ff`) con embeddings de nodo en float16 y pesos en safetensors, que selecciona los nodos que usa un emparejamiento de MPN Studio.

No se han publicado en la informacion disponible datos sobre volumen de tokens de entrenamiento, composicion del dataset mas alla de la procedencia Wikipedia/Wikidata, ni sobre tecnicas de RLHF o DPO. El paquete se publico el 13 de noviembre de 2026 y se convirtio a FG-MPN el 22 de noviembre de 2026.

## Capacidades

- Almacenamiento y recuperacion de hechos estructurados: 10.007 nodos validados y 105.888 relaciones tipadas consultables por busqueda y recorrido de grafo.
- Organizacion modular por dominio: 18 modulos de dominio con pertenencia primaria y compartida, lo que permite acotar la recuperacion a un area concreta.
- Nodos de procedimiento: descripcion de funciones con formula, parametros y ejemplo resuelto (sin codigo ejecutable).
- Router entrenado para seleccion de nodos: permite que un nucleo externo recupere los nodos relevantes para una consulta.
- Verificacion de fidelidad factual: los 160 nodos canario permiten auditar que un sistema no inventa hechos fuera de la red.
- Doble formato de distribucion: FG-MPN de solo lectura para exploracion, busqueda y recorrido en otros runtimes, y SQLite para edicion en MPN Studio.
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades multilingues propias; todo ello depende del nucleo y el encoder con los que se empareje.

## Casos de uso

- Recuperacion aumentada con hechos verificables: emparejar la red con un nucleo y un encoder para que las respuestas se fundamenten en nodos con procedencia Wikipedia/Wikidata, reduciendo alucinaciones en dominios acotados.
- Auditoria de fidelidad factual: usar los 160 nodos canario para comprobar que un sistema de respuesta toma sus hechos de la red y no de memoria parametrica.
- Exploracion y analisis de grafos de conocimiento: recorrer las 105.888 relaciones tipadas en la tienda FG-MPN para estudiar conectividad entre dominios como historia, geografia o biologia.
- Sistemas de tutoria o asistencia educativa: los nodos de procedimiento con formula, parametros y ejemplo resuelto sirven para explicar pasos de calculo en matematicas, fisica o estadistica.
- Enrutado selectivo por dominio: el router entrenado permite dirigir consultas al modulo adecuado (por ejemplo, `medicine-health` o `computing-ai`) antes de invocar un nucleo generativo, ahorrando contexto y coste.
- Edicion y curaduria de conocimiento en MPN Studio: abrir la tienda SQLite, modificar nodos y relaciones, y volver a emparejarla con un nucleo para desplegar una base de conocimiento propia.
- Prototipado de arquitecturas modulares: usar el paquete como banco de pruebas para runtimes que implementen FG-MPN o para integrar recuperacion estructurada en pipelines de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica al paquete en si; el router entrenado ocupa 43.418.451 bytes y los embeddings de nodo 20.807.808 bytes en float16, por lo que el router cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no disponibles; el requisito real lo impone el nucleo y el encoder con los que se empareje la red, no este repositorio.
- Cabe en GPU consumer: si, el router y la red de 0,2 GB caben en cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: MPN Studio para abrir y editar la tienda SQLite; runtimes compatibles con FG-MPN 0.2.2 para la tienda de solo lectura; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Producto | Tipo | Tamano | Contenido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yaob Next N10K 0.2.0 | Red de conocimiento MPN | 0,2 GB, 10.007 nodos en uso, 105.888 relaciones | Hechos de Wikipedia/Wikidata + procedimientos + router | CC BY-SA 4.0 (datos) y Fylume Source-Available Terms 1.0 (router) | Hugging Face, 0 descargas |
| Wikidata (dump) | Base de conocimiento | Cientos de GB | Hechos estructurados multilingues | CC0 | Descarga publica |
| DBpedia | Base de conocimiento derivada de Wikipedia | Decenas de GB | Hechos extraidos de infoboxes | CC BY-SA | Descarga publica |
| Modelo de lenguaje con RAG sobre Wikipedia | Modelo generativo + recuperacion | Variable (miles de millones de parametros) | Conocimiento parametrico + recuperacion | Variable | Amplia |

La comparacion con modelos de lenguaje no es directa: este paquete no genera texto y su rendimiento depende del nucleo con el que se empareje. Frente a Wikidata o DBpedia, ofrece un grafo mas pequeno y curado, con modulos de dominio, router entrenado y nodos canario de verificacion, pero sin cobertura multilingue ni la amplitud de las bases de conocimiento generales.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede responder preguntas por si solo; requiere un nucleo y un encoder para funcionar.
- Cobertura limitada: 9.815 nodos de conocimiento, un articulo de Wikipedia en ingles por nodo, sin soporte multilingue declarado.
- Sesgos derivados de la fuente: los hechos proceden de Wikipedia en ingles y Wikidata, con los sesgos de cobertura y notabilidad de esas fuentes.
- Riesgo de alucinacion: el paquete no genera texto, pero un nucleo mal emparejado puede ignorar la red y producir respuestas no fundamentadas; los nodos canario existen para detectarlo.
- Licencia mixta: los datos son CC BY-SA 4.0 (con hechos de Wikidata CC0) y exigen atribucion y compartir igual; el router esta bajo Fylume Source-Available Terms 1.0, que no es una licencia de codigo abierto y puede restringir el uso comercial. Revisar `LICENSE-ROUTER` y `ATTRIBUTION.md` antes de desplegar en produccion.
- Nodos canario presentes: aunque estan deshabilitados y nunca se devuelven por busqueda, conviene verificar su estado (`quarantined`) al integrar la red.
- Los nodos de procedimiento no incluyen codigo ejecutable; solo describen la funcion.
- Adopcion nula: 0 descargas y 0 likes, sin ecosistema documentado de terceros ni benchmarks publicos.

## Enlaces

- Hugging Face: https://huggingface.co/fylume/yaob-next-n10k
- Licencia de datos CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Terminos del router: `studio/network/checkpoint/LICENSE-ROUTER` dentro del repositorio
- Atribucion: `ATTRIBUTION.md` dentro del repositorio
- Verificacion: `VERIFICATION.md` dentro del repositorio
