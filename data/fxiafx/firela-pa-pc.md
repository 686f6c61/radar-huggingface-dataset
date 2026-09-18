# fxiafx/firela-pa-pc

## Resumen

firela-pa-pc es el repositorio de distribucion para PC de firela-pa: un modelo enrutador de privacidad afinado sobre Qwen3-1.7B que clasifica consultas de un asistente financiero personal en cinco intenciones (fmt-v1.1): `tx` (consulta de cuentas), `pf` (panorama de patrimonio), `mkt` (cotizaciones de mercado), `l` (charla local) y `c` (pregunta que se "tapa" y se envia a la nube). El modelo no es un asistente general, sino un componente de decision: determina si una peticion puede resolverse en local, si requiere un token de acceso del propio usuario o si debe anonimizarse antes de salir del dispositivo.

El ajuste se realizo con LoRA sobre el modelo base Qwen3-1.7B (1 720 574 976 parametros, licencia Apache-2.0) y los pesos fusionados se redistribuyen en formato GGUF en dos perfiles: Q4_K_M (1,1 GB, perfil por defecto) y Q8_0 (1,9 GB, perfil de calidad). Segun el autor, ambos perfiles obtienen respuestas identicas pregunta a pregunta en la puerta de evaluacion eval200 (200 preguntas) y alcanzan un 97% en el criterio G4. El repositorio se completa con `pc-app.tar.gz` (orquestador, anonimizador deterministico y utilidades de evaluacion en Python de biblioteca estandar) y `install.sh`, un instalador de un solo comando para macOS, Linux y WSL2.

Su relevancia actual es acotada pero concreta: cubre el nicho de enrutado con conciencia de privacidad para dominios financieros, con un modelo de 1,7B que cabe en cualquier portatil y que se integra sobre Ollama sin GPU dedicada. El repositorio, publicado el 18 de septiembre de 2026, no registra descargas ni valoraciones en el momento de redactar esta ficha, y no se han publicado resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B) con ajuste fino LoRA fusionado en los pesos; cabecera de clasificacion de intenciones |
| Parametros totales | 1 720 574 976 (~1,72 mil millones), segun los pesos safetensors del repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card. El modelo base citado, Qwen3-1.7B, se distribuye habitualmente con 32 768 tokens nativos, pero el valor efectivo tras el ajuste no se declara |
| Tipos de cuantizacion | GGUF Q4_K_M (perfil por defecto, 1,1 GB) y Q8_0 (perfil de calidad, 1,9 GB). Los pesos de origen se describen como W8A8 |
| Idiomas soportados | No disponible. La model card y las cinco etiquetas de intencion estan definidas en chino, lo que sugiere uso principal en ese idioma, sin declaracion oficial |
| Licencia | Apache-2.0 (el autor indica que los pesos LoRA fusionados son redistribuibles) |
| Formato de pesos | GGUF (orientado a llama.cpp y Ollama). El repositorio tambien incluye un archivo `pc-app.tar.gz` y un `install.sh` |

Metadatos adicionales del repositorio: autor `fxiafx`, libreria declarada `gguf`, etiquetas `privacy`, `router`, `finance-assistant`, `endpoints_compatible`, `conversational`, region `us`. Tamano del repositorio: 2,9 GB. Creado el 2026-09-18 y actualizado el 2026-09-18.

## Arquitectura y entrenamiento

El modelo es un ajuste fino por LoRA de Qwen3-1.7B, un transformer decoder-only denso de la familia Qwen3, con los adaptadores fusionados en los pesos finales. La tarea de destino no es generativa abierta, sino de clasificacion/enrutado: mapear la consulta del usuario a una de las cinco intenciones del formato fmt-v1.1. El autor describe los pesos originales como W8A8 y distribuye las versiones cuantizadas en GGUF con dos perfiles de la misma fuente de pesos (Q4_K_M y Q8_0).

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. El unico dato de evaluacion aportado es interno: el conjunto eval200 (200 preguntas), donde el autor afirma que Q4_K_M y Q8_0 coinciden pregunta a pregunta en la puerta de decision y alcanzan un 97% bajo el criterio G4. Tampoco se detalla la innovacion tecnica del ajuste mas alla del uso de LoRA y de la cuantizacion GGUF.

El repositorio incluye ademas una pieza de sistema relevante: un instalador que levanta Ollama, descarga los pesos con verificacion sha256, registra el modelo como `firela-router`, incorpora un modelo generador (`qwen2.5:3b-instruct`, no pensante, ~1 s segun el autor) y genera una configuracion interactiva con permisos 0600 para credenciales `vlt` y `relay`. La frontera de privacidad se implementa en dos niveles: el enrutado y la charla local nunca salen del dispositivo, y las consultas destinadas a la nube pasan antes por un anonimizador deterministico que sustituye segmentos completos de cuatro categorias de identidad.

## Capacidades

- Clasificacion de intenciones financieras en cinco clases: consulta de cuentas (`tx`), vision de patrimonio (`pf`), cotizaciones de mercado (`mkt`), charla local (`l`) y consulta a anonimizar y enviar a la nube (`c`).
- Enrutado con conciencia de privacidad: decide si una peticion se resuelve en local, si necesita credenciales del usuario (`vlt`) o si debe pasar por el proceso de anonimizacion antes de salir del dispositivo.
- Generacion de texto conversacional en local mediante el modelo generador asociado (`qwen2.5:3b-instruct` por defecto, configurable a `qwen3:4b` u otros).
- Integracion con Ollama: el modelo se registra como `firela-router` y se consume a traves de la API local del runtime.
- Ejecucion en CPU y en equipos sin GPU dedicada, gracias al tamano de 1,7B y a las cuantizaciones Q4_K_M y Q8_0.
- No se declara soporte de tool calling, function calling, uso de agentes, multimodalidad, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.
- Capacidades multilingues: no disponibles. No hay declaracion de idiomas soportados.

## Casos de uso

- Enrutado de intenciones en un asistente financiero personal: el modelo recibe la consulta del usuario y devuelve una de las cinco etiquetas de fmt-v1.1, lo que permite despachar cada peticion al subsistema correspondiente (consulta de cuentas, patrimonio, mercado o charla) sin enviar la pregunta a un servicio externo.
- Asistente financiero con privacidad por diseno en el portatil del usuario: al combinarse con el generador local, el ciclo completo de conversacion se ejecuta en el dispositivo; resulta adecuado para usuarios que manejan datos patrimoniales y no quieren que las consultas salgan de su equipo.
- Filtro previo al envio a la nube: cuando el enrutador clasifica como `c`, la aplicacion aplica el anonimizador deterministico (sustitucion de segmentos completos de cuatro categorias de identidad) y solo entonces reenvia la consulta a un servicio remoto, lo que reduce la exposicion de datos personales.
- Despliegue en parques de portatiles sin GPU: con artefactos de 1,1 GB (Q4_K_M) y 1,9 GB (Q8_0) y ejecucion sobre Ollama, es viable instalarlo en equipos de oficina corrientes mediante `install.sh` en macOS, Linux o WSL2.
- Investigacion en enrutado y privacidad: el par de perfiles Q4_K_M y Q8_0 permite estudiar la sensibilidad a la cuantizacion en tareas de clasificacion, y la afirmacion de equivalencia pregunta a pregunta en eval200 ofrece un punto de partida reproducible si se publica el conjunto.
- Base para ajustes de dominio especifico: al ser un LoRA fusionado sobre Qwen3-1.7B con licencia Apache-2.0, sirve como punto de partida para afinar enrutadores de otros dominios (legal, salud, soporte) con requisitos de coste y latencia bajos.
- Enrutado de bajo coste en pipelines de automatizacion de escritorio: la CLI `firela-pa` y la API local de Ollama permiten insertar la clasificacion en scripts de gestion de finanzas personales, conciliacion o alertas de mercado.
- Experimentacion con verificacion de integridad en el despliegue: el instalador descarga los pesos con comprobacion sha256 y genera credenciales con permisos 0600, un patron reutilizable en otras distribuciones de modelos con manejo de secretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. El unico dato de evaluacion aportado por el autor es interno y no verificable de forma independiente:

| Evaluacion | Resultado declarado | Notas |
|---|---|---|
| eval200 (puerta de decision, Q4_K_M vs Q8_0) | Identico pregunta a pregunta en las 200 preguntas | Los dos perfiles de cuantizacion coinciden en todas las decisiones |
| Criterio G4 | 97% | Metrica definida por el autor; no se describe su calculo ni el desglose por intencion |

No se dispone de comparaciones con otros enrutadores, ni de resultados por clase de intencion, ni de latencia medida del enrutador (el unico dato de latencia declarado, ~1 s, corresponde al modelo generador `qwen2.5:3b-instruct` en modo no pensante).

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5-2 GB para el perfil Q4_K_M (archivo de 1,1 GB mas cache KV y overhead del runtime) y 2,5-3 GB para Q8_0 (archivo de 1,9 GB).
- GPU recomendadas: no se especifican en la documentacion. Por tamano, cualquier GPU con 4 GB o mas de memoria es suficiente; tambien son validas tarjetas de gama de entrada y GPU integradas con memoria compartida.
- Inferencia en CPU: viable y probablemente el escenario principal, dado el tamano de 1,7B y el uso de Ollama en el instalador.
- Apple Silicon: soportado por la via de instalacion declarada (macOS), con ejecucion en memoria unificada.
- Modelo generador adicional: el instalador descarga `qwen2.5:3b-instruct` (se puede omitir con `--no-gen`), lo que anade su propio requisito de memoria y disco; el autor advierte que cambiar a modelos de razonamiento como `qwen3:4b` requiere precaucion porque el parametro `think` de Ollama no funciona con la plantilla de la version de biblioteca de qwen3.
- Opciones de despliegue: Ollama (soporte nativo, registro como `firela-router`), llama.cpp para uso directo del GGUF. El soporte en vLLM o TGI no esta declarado y estos motores no consumen GGUF de forma directa.
- Latencia y throughput: no disponibles para el enrutador. El unico dato aportado es ~1 s para el modelo generador no pensante por defecto.
- Almacenamiento: el repositorio completo ocupa 2,9 GB; los artefactos individuales son 1,1 GB (Q4_K_M), 1,9 GB (Q8_0) y el paquete de aplicacion.

## Comparativa con modelos similares

No se dispone de datos verificados de alternativas comparables en la informacion proporcionada. La tabla siguiente recoge lo que si esta documentado y marca como no disponible lo que no se puede contrastar.

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|---|
| firela-pa-pc | 1 720 574 976 | No disponible en la model card | GGUF (Q4_K_M, Q8_0) | Apache-2.0 | Enrutador de privacidad financiera (5 intenciones) | Repositorio HuggingFace, 0 descargas y 0 likes |
| Qwen3-1.7B (modelo base citado) | No disponible en esta informacion | No disponible en esta informacion | No disponible en esta informacion | Apache-2.0 (segun la model card del ajuste) | Modelo generativo generalista | No consultado en esta busqueda |
| qwen2.5:3b-instruct (generador usado por el instalador) | No disponible en esta informacion | No disponible en esta informacion | No disponible en esta informacion | No disponible en esta informacion | Generacion conversacional | Distribucion via Ollama, segun el autor |
| Otros enrutadores de intenciones de ~1-2B | No disponible | No disponible | No disponible | No disponible | Clasificacion/enrutado | No se identifican alternativas equivalentes en la informacion disponible |

No se localizaron en la busqueda web resultados tecnicos relevantes sobre este modelo ni sobre enrutadores comparables; los resultados obtenidos correspondian a contenidos sin relacion con el modelo.

## Limitaciones y advertencias

- Adopcion nula y validacion externa inexistente: el repositorio registra 0 descargas y 0 likes, y no hay evaluaciones independientes ni informes de terceros.
- Ausencia de benchmarks estandar: el unico dato de rendimiento (eval200, G4 97%) es interno, no publica el desglose por intencion ni la metodologia de calculo, y no se puede reproducir con la informacion disponible.
- Idiomas no declarados: la model card y las etiquetas de intencion estan en chino, por lo que el comportamiento fuera de ese idioma es incierto y no hay garantia de calidad en castellano ni en ingles.
- Riesgo de alucinacion y de clasificacion erronea: al ser un enrutador, un fallo de clasificacion puede dirigir una consulta sensible a la ruta equivocada; no se documentan tasas de error por clase ni comportamiento ante entradas fuera de dominio (out-of-domain).
- Contexto efectivo desconocido: no se declara la longitud de contexto tras el ajuste, lo que impide planificar conversaciones largas o entradas extensas.
- Dependencia de la cadena de privacidad: la garantia de anonimizacion depende de un anonimizador deterministico descrito de forma resumida (sustitucion de segmentos completos de cuatro categorias de identidad). No se publican en esta ficha los detalles del diseno ni sus tasas de fuga, por lo que no debe asumirse una garantia formal de anonimato.
- Instalacion mediante `bash <(curl -fsSL ...)`: ejecutar un script remoto directamente es un riesgo de cadena de suministro; aunque el autor indica verificacion sha256 de los pesos, conviene auditar el script antes de ejecutarlo en produccion.
- Credenciales en el dispositivo: la configuracion generada incluye tokens `vlt` y `relay` con permisos 0600; su custodia y rotacion quedan enteramente en manos del usuario.
- Advertencia del propio autor sobre modelos de razonamiento: el parametro `think` de Ollama no funciona con la plantilla de la version de biblioteca de qwen3, de modo que sustituir el generador por un modelo de razonamiento puede dar resultados inesperados.
- Licencia: Apache-2.0 es permisiva y permite uso comercial, pero conviene verificar la procedencia de los pesos base y de los datos de ajuste, que no se detallan.
- Fechas inconsistentes: el repositorio figura como creado el 2026-09-18, una fecha posterior a la mayoria de referencias habituales; conviene confirmar la vigencia y el mantenimiento del proyecto antes de integrarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fxiafx/firela-pa-pc
- Script de instalacion declarado en la model card: https://huggingface.co/fxiafx/firela-pa-pc/resolve/main/install.sh
- Modelo base citado (Qwen3-1.7B): no se incluye enlace directo en la informacion proporcionada; la model card solo menciona "Qwen3-1.7B (Apache-2.0)" sin URL.
- Repositorio de la aplicacion y documentacion de diseno del anonimizador: mencionados como "repositorio de la aplicacion" en la model card, sin URL disponible.
- Paper, blog o demo adicionales: no disponibles.
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados obtenidos no guardan relacion con el contenido de esta ficha.
