# ikaanakkok/laya-browser-v1

## Resumen

laya-browser-v1 es un ajuste fino por continuacion de cklxx/laya-browser v17s, desarrollado por el usuario ikaanakkok y publicado en HuggingFace. Se trata de un modelo System-1 de decisiones tipadas orientado a agentes de navegador: no genera texto, sino que responde a preguntas estructuradas (choice, noul, score) sobre el estado de una pagina web y devuelve la opcion elegida junto con probabilidades calibradas. Su aportacion principal frente al modelo padre es la incorporacion de cobertura web en turco y de trazas reales de clics ejecutadas en Chrome mediante CDP.

Arquitectonicamente mantiene el mismo diseno que su predecesor: un encoder mmBERT-base de 322M parametros (321.908.998 en total, segun el archivo safetensors) mas cabezas de decision especificas. Es un reemplazo directo (drop-in) del checkpoint v17s en el repositorio laya-browser, con el mismo formato laya_fmt v3 y la misma disposicion de checkpoint, por lo que no requiere cambios en el harness de inferencia.

El modelo resulta relevante para quienes construyen agentes de navegacion de bajo coste que necesitan decidir acciones en milisegundos sobre GPU de consumo. Frente a modelos generativos de gran tamano, ofrece latencias de 170-480 ms por decision, un peso de 647 MB en fp16 y un entrenamiento de apenas 5 horas en una unica GPU, con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder mmBERT-base (322M) + cabezas de decision System-1 |
| Parametros totales | 321.908.998 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16 (checkpoint de 647 MB); no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (en) y turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors (junto con encoder/, tokenizer/ y rl_agent_config.json) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer mmBERT-base de 322M parametros con cabezas de decision anadidas para resolver tareas de tipo `choice`, `noul` (si/no) y `score`. No emplea decodificacion autoregresiva: cada forward pass produce directamente la respuesta tipada y probabilidades calibradas. La temperatura de calibracion, 1.7046, se ajusto sobre una particion separada del conjunto de evaluacion (n=6787).

El entrenamiento parte de los pesos de v17s y sigue la receta RLCD de laya (`finetune/train_desktop.py`, `LAYA_FMT=v3`, `LAYA_HEAD=768`, `MAX_TARGETS=40`, `FINAL_P=0.2`, micro-batch 4 con acumulacion 8). Se procesaron 51.557 items tokenizados (1.611 pasos por epoca) procedentes de 28.499 casos, distribuidos asi: 19.587 del rastreo en vivo de NNetNav, 7.296 de Mind2Web train, 843 del rastreo turco y general (crawl_tr), 573 casos de segundo paso generados por profesor a partir de trazas reales y 200 trazas reales de clic/DONE ejecutadas en Chrome y verificadas por resultado. El corpus incluye 80 paginas, de las cuales 14 son sitios turcos (migros, bim, vatanbilgisayar, mediamarkt, dr.com.tr, kitapyurdu, idefix, turkcell, vodafone, turktelekom, garanti, ziraat, yapikredi y ptt.gov.tr). El entrenamiento consumio aproximadamente 5 horas, 15.987 actualizaciones y un pico de VRAM de 6,1 GB.

## Capacidades

- Decision tipada sobre el estado de una pagina web: seleccion de elementos, respuesta si/no y puntuacion, con probabilidades calibradas.
- Soporte de operaciones de agente de navegador: CLICK, SELECT, TYPE_TEXT, SCROLL_DOWN y DONE.
- Cobertura bilingue ingles-turco, con mejora especifica en sitios de comercio electronico y servicios turcos.
- Integracion directa con el harness laya-browser, el servidor HTTP `systemone_server.py` y el bucle del agente de navegador.
- No genera texto: los valores de TYPE_TEXT y la logica conversacional los aporta el harness, no el modelo.
- Funciona como extractor de caracteristicas (pipeline `feature-extraction`) para tareas posteriores.
- Inferencia de bajisima latencia y peso reducido, apta para ejecucion local en GPU de consumo e incluso en navegador mediante WebGPU a traves del ecosistema laya-mlx (demo de mizchi).

## Casos de uso

- Automatizacion de tareas web con selectores en lenguaje natural: el modelo resuelve frases como "click 'iniciar sesion'" eligiendo el elemento correcto entre 37-59 opciones en aproximadamente 300 ms, lo que permite bucles de agente fluidos sin recurrir a un LLM generativo.
- Agentes de compra en comercio electronico turco: gracias al entrenamiento sobre migros, bim, vatanbilgisayar, mediamarkt, kitapyurdu, idefix y otros, puede decidir anadir al carrito, seleccionar variantes o avanzar en el checkout en sitios turcos reales.
- Navegacion autonoma de tareas multi-paso: combinado con el harness laya-browser, puede encadenar clics, escritura de texto, desplazamiento y declaracion de DONE para completar objetivos como buscar en Wikipedia o reservar un vuelo.
- Pruebas de regresion de interfaces web: al devolver probabilidades calibradas, permite detectar de forma automatica si un elemento esperado sigue siendo seleccionable y con que confianza, integrándose en pipelines de CI.
- Asistentes de accesibilidad: el modelo puede traducir ordenes en lenguaje natural a acciones concretas sobre el DOM, sirviendo de motor de decision en herramientas que asisten a usuarios con dificultades motoras o visuales.
- Extraccion y clasificacion de elementos en scraping estructurado: sus cabezas de decision permiten etiquetar componentes de pagina (botones, enlaces, campos) sin necesidad de reglas CSS especificas por sitio.
- Despliegue local de bajo coste en centros de datos sin GPU de gama alta: con 647 MB en fp16 y 6,1 GB de pico en entrenamiento, es viable ejecutar multiples instancias en una sola GPU de consumo.

## Benchmarks y rendimiento

Suites de agente de navegador (una ejecucion por tarea, mismo profesor para ambas variantes):

| Suite | v17s (padre) | laya-browser-v1 |
|---|---|---|
| Suite B-18 tareas en 18 dominios excluidos de todo el entrenamiento | 18/18 | 18/18 |
| Suite A-16 tareas en sitios reales | 14/16 | 14/16 |
| Suite A, tiempo mediano | 5,5 s | 4,0 s |
| Suite B, tiempo mediano | 4,1 s | 3,3 s |

Numeros publicados por el autor del modelo padre en las mismas suites (3 ejecuciones por tarea): Suite A 85% (41/48) y Suite B 100% (54/54). Los fallos son identicos en ambas variantes: `books-page2` y `flights`. El propio autor advierte que 7 dominios de la Suite A (en.wikipedia, github, news.ycombinator, arxiv, quotes.toscrape, the-internet.herokuapp y google) aparecen en el rastreo de entrenamiento, por lo que esa suite no es una retencion limpia.

Tarea en turco (no presente en los datos de entrenamiento de ninguna de las dos variantes). Objetivo: "Vikipedi'de 'yapay zeka' aramasi yap ve yapay zeka maddesini ac.", con 12 pasos maximos:

| Modelo | Resultado | Pasos | Tiempo |
|---|---|---|---|
| v17s | FAIL: clico "Oturum ac" y declaro DONE en la pagina de login | 1 | 3,6 s |
| laya-browser-v1 | PASS: escribio en "Vikipedi uzerinde ara", pulso Enter y llego a /wiki/Yapay_zeka | 2 | 8,0 s |

Precision en decisiones sobre muestra estratificada de 1.288 casos de un conjunto retenido de 7.456. La columna `target top-1` solo se mide en casos con elemento dorado conocido (n=1.107):

| Bucket (fuente · operacion) | n | op acc v17s → este | target top-1 v17s → este |
|---|---|---|---|
| all | 1.288 | 0.663 → 0.703 | 0.548 → 0.539 |
| mind2web (test) · CLICK | 300 | 0.81 → 0.80 | 0.47 → 0.46 |
| mind2web · SELECT | 38 | 0.45 → 0.53 | 0.53 → 0.58 |
| mind2web · TYPE_TEXT | 62 | 0.90 → 0.85 | 0.87 → 0.84 |
| nnetnav (test) · CLICK | 322 | 0.64 → 0.67 | 0.28 → 0.25 |
| nnetnav · DONE | 80 | 0.29 → 0.33 | - |
| nnetnav · TYPE_TEXT | 136 | 0.49 → 0.62 | 0.87 → 0.85 |
| nnetnav · SCROLL_DOWN | 59 | 0.12 → 0.07 | 0.00 → 0.00 |
| live (crawl turco/general) · CLICK | 218 | 0.88 → 0.94 | 0.72 → 0.75 |
| live · DONE | 39 | 0.41 → 0.72 | - |
| live · TYPE_TEXT | 30 | 0.90 → 0.93 | 0.87 → 0.83 |

La mejora global de precision de operacion es de +4,0 puntos, impulsada por TYPE_TEXT en NNetNav (+13) y DONE en live (+31). La precision top-1 de objetivo se mantiene plana (0.548 → 0.539, dentro del ruido) y SCROLL_DOWN retrocede ligeramente sobre una muestra pequena (n=59). El bucket `live` es parcialmente en dominio: 85 de sus 106 casos etiquetados pertenecen a dominios presentes en el rastreo de entrenamiento, por lo que esa ganancia debe interpretarse como comportamiento en dominio, no como generalizacion.

Benchmarks de calidad de decision sobre las tareas publicadas de Jev: la model card menciona la ejecucion local del harness `laya-jev-benchmark`, pero el texto proporcionado esta truncado, por lo que los resultados completos no estan disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en fp16 (checkpoint de 647 MB mas activaciones y buffers). No se dispone de mediciones oficiales de VRAM exclusivas de inferencia.
- Pico de VRAM durante el entrenamiento: 6,1 GB.
- GPU de referencia empleada por el autor: AMD Radeon RX 7800 XT de 16 GB, con latencias de 170-480 ms por decision para 37-59 opciones (media aproximada de 300 ms) en fp16.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM deberia poder ejecutarlo; tambien es viable en CPU, aunque sin latencias publicadas.
- Opciones de despliegue: libreria `laya` (Python 3.10 o superior), servidor HTTP `systemone_server.py` con troceado en bloques de 12 opciones, harness `laya-browser`, y ejecucion en navegador mediante WebGPU a traves del ecosistema laya-mlx (demo de mizchi).
- No se documentan recetas oficiales para vLLM, llama.cpp, Ollama o TGI en la informacion disponible; el formato safetensors y la libreria `laya` son el camino soportado.
- Throughput: no disponible. Solo se publican latencias individuales por decision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-browser-v1 (este) | 321,9M | no disponible | Suite A 14/16, Suite B 18/18; op acc 0.703 | MIT | HuggingFace, 0 descargas |
| cklxx/laya-browser v17s (padre) | 321,9M (misma arquitectura) | no disponible | Suite A 85% publicado (41/48), Suite B 100% (54/54); op acc 0.663 | No indicada en la informacion disponible | Repositorio laya-browser |
| hanish-builds/laya-browser-v1 | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones de otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones. Solo responde a preguntas tipadas sobre el estado de una pagina.
- La precision global de operacion es del 70,3%, con variaciones notables por bucket: en SCROLL_DOWN cae al 7% y en DONE de NNetNav se queda en el 33%.
- La precision top-1 de objetivo no mejora respecto al padre (0,548 → 0,539) y SCROLL_DOWN retrocede (0,12 → 0,07), aunque sobre muestras pequenas.
- La Suite A no es una retencion limpia: 7 de sus dominios aparecen en el rastreo de entrenamiento, lo que invalida sus resultados como medida de generalizacion.
- El bucket `live` tambien esta parcialmente en dominio, por lo que sus ganancias no deben extrapolarse a sitios nuevos.
- El corpus turco es muy reducido (843 casos de crawl_tr y 14 sitios), lo que limita la cobertura real del idioma.
- El riesgo de alucinacion se manifiesta como decisiones incorrectas o clics en elementos equivocados, no como texto inventado.
- El modelo depende del harness para la capa textual (valores de TYPE_TEXT) y para el bucle del agente; sin ese entorno no es funcional por si solo.
- La licencia MIT permite uso comercial sin restricciones, pero la model card no documenta sesgos demograficos, eticos ni de dominio.
- El modelo se publico con 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validacion externa independiente de los resultados reportados.

## Enlaces

- HuggingFace: https://huggingface.co/ikaanakkok/laya-browser-v1
- Modelo base: https://huggingface.co/cklxx/laya-browser
- Repositorio GitHub laya-browser: https://github.com/Benny93/laya-browser
- Demo WebGPU de Laya: https://huggingface.co/spaces/mizchi/laya-web-demo
- Sitio oficial de Laya AI: https://laya-model.com/
- Guia de inicio de Laya AI: https://laya-model.com/get-started
- Variante alternativa en HuggingFace: https://huggingface.co/hanish-builds/laya-browser-v1
