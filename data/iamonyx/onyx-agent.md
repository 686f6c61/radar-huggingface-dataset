# iamonyx/onyx-agent

## Resumen

`iamonyx/onyx-agent` no es un modelo de lenguaje con pesos publicados, sino un repositorio de codigo (un "model card" de aplicacion) que implementa la burbuja de chat del sitio web del atelier Onyx, un proyecto de peluche virtual animado con sede en Montreal. El repositorio contiene el Worker de Cloudflare que recibe las preguntas de los visitantes, aplica una capa de guardarraíles definida en `persona.js` y delega la generacion de texto en un modelo servido por Cloudflare Workers AI. No se distribuyen pesos, tokenizador ni artefactos de inferencia.

La relevancia tecnica del repositorio es la de un patron de despliegue: muestra como encapsular un personaje publico (la persona de Onyx) como un contrato ejecutable de confidencialidad y alcance, con reglas explicitas sobre transparencia, no repeticion de datos personales, ausencia de acciones y limitacion al frances quebecois. El modelo subyacente que responde no se identifica en la informacion disponible, por lo que todas las especificaciones de arquitectura, parametros y contexto del LLM quedan como no disponibles.

La licencia del codigo es MIT, pero la propia model card aclara que el personaje Onyx, su apariencia y los textos de persona siguen siendo propiedad del atelier: la licencia del codigo no concede derechos sobre el personaje. El repositorio registra cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el 23 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el LLM subyacente se invoca via Cloudflare Workers AI; no se especifica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | frances (quebecois ligero) |
| Licencia | MIT para el codigo; personaje y textos de persona reservados al atelier |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento

El repositorio describe una arquitectura de aplicacion, no de modelo. El componente `worker/src/index.js` actua como orquestador: recibe la peticion del visitante, aplica los guardarraíles definidos en `worker/src/persona.js`, invoca el modelo a traves de Cloudflare Workers AI y devuelve la respuesta. `worker/wrangler.toml` configura las origenes autorizadas y un limite de tasa de 20 peticiones por 60 segundos por IP. El widget del lado cliente (`widget/widget.js`, `widget.css`, `widget.html`) gestiona la apertura, el envio y la visualizacion, y segun la model card no recoge ni conserva informacion personal.

No hay informacion sobre el modelo de lenguaje empleado: ni numero de parametros, ni volumen o composicion de datos de entrenamiento, ni si hubo RLHF o DPO, ni innovaciones de atencion o decodificacion. La unica innovacion documentada es de tipo ingenieria de producto: la persona se implementa como un contrato ejecutable con reglas de transparencia, no repeticion de datos personales, ausencia de acciones y registro linguistico restringido, y se valida con una bateria de preguntas trampa que debe superar 6/6 antes de cada despliegue en produccion.

## Capacidades

- Generacion de texto conversacional en frances, con registro quebecois ligero y frases cortas.
- Presentacion explicita como personaje virtual animado por IA cada vez que la pregunta lo requiere.
- Rechazo de revelacion de informacion sobre personas: nombres, direcciones, relaciones y horarios no se confirman ni se desmienten.
- No repeticion de datos personales aportados por el visitante, incluido un simple nombre de pila.
- Ausencia de acciones: no envia, no publica y no compra nada.
- Tres expresiones firma con uso parco: "Coucou, c'est Onyx!", "Une couche a la fois.", "Toujours moi.".
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Recepcion de visitantes en el sitio del atelier: el widget embebido en la pagina estatica responde dudas sobre el proyecto dentro del personaje publico, con el Worker aplicando los guardarraíles antes de llamar al modelo.
- Divulgacion de marca controlada: la persona en `persona.js` define exactamente que se puede decir y que no, de modo que el tono y los limites son auditables en codigo y no dependen de la variabilidad del prompt.
- Cumplimiento de privacidad en interacciones publicas: la regla de no repetir datos personales permite atender conversaciones sin reexponer informacion que el visitante haya escrito por error.
- Prototipo de despliegue serverless de bajo coste: el Worker de Cloudflare con limite de 20 peticiones por 60 segundos por IP sirve como plantilla para asistentes de sitio estatico sin backend propio.
- Verificacion pre-produccion de personajes: la bateria de preguntas trampa (privacidad, fuera de tema, peticiones de accion) con umbral 6/6 puede reutilizarse como suite de evaluacion de regresion para cualquier asistente con persona restringida.
- Referencia de diseno para equipos que separan persona y modelo: el repositorio ilustra como mantener el control del discurso publico en una capa de codigo independiente del proveedor de inferencia, lo que facilita cambiar de modelo sin reescribir la politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de calidad mencionada es el protocolo interno del atelier, que exige superar 6/6 preguntas trampa antes de cada puesta en produccion; no se aportan resultados numericos de esa bateria ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo se ejecuta en Cloudflare Workers AI, no en hardware del usuario.
- GPU recomendadas: no disponible.
- Ejecucion en GPU de consumo: no disponible; el despliegue es serverless en el edge de Cloudflare.
- Opciones de despliegue: Cloudflare Workers (`npx wrangler dev` para desarrollo local, `npx wrangler deploy` para produccion) y widget estatico en la pagina (`widget.html`, `widget.css`, `widget.js` apuntando a la URL del Worker).
- Latencia y throughput: no disponibles. El unico limite documentado es de 20 peticiones por 60 segundos por IP.

## Comparativa con modelos similares

No disponible. No se identifican en la informacion proporcionada modelos comparables, porque el repositorio no publica pesos ni especifica el LLM subyacente; la comparacion solo seria posible contra otras implementaciones de asistentes de sitio con persona restringida, y no se aportan datos de esas alternativas.

## Limitaciones y advertencias

- No es un modelo descargable: no hay pesos, tokenizador ni artefactos de inferencia; el repositorio es codigo de aplicacion.
- El modelo de lenguaje subyacente no se identifica, por lo que no se puede evaluar su calidad, sesgos, contexto ni comportamiento fuera del personaje.
- Idioma restringido al frances: no se documenta soporte de castellano ni de otras lenguas.
- La licencia MIT cubre solo el codigo; el personaje Onyx, su apariencia y los textos de persona quedan reservados al atelier, lo que impide reutilizarlos en un producto propio.
- Riesgo de alucinacion no evaluado: la model card no reporta tasas de error ni resultados de la bateria de preguntas trampa.
- La eficacia de los guardarraíles depende de la implementacion en `persona.js` y del cumplimiento del modelo subyacente; no se documenta una capa de moderacion adicional.
- El limite de 20 peticiones por 60 segundos por IP puede ser insuficiente para escenarios de alto trafico.
- Cero descargas y cero likes en el momento de la consulta: sin validacion externa por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/iamonyx/onyx-agent
- Sitio del atelier: https://onyx-atelier.pages.dev/
- Repositorio `porte-fidelite` mencionado en la model card: no disponible (sin URL en la informacion proporcionada)
