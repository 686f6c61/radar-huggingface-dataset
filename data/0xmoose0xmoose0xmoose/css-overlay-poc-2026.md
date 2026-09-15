# 0xmoose0xmoose0xmoose/css-overlay-poc-2026

## Resumen

El repositorio `0xmoose0xmoose0xmoose/css-overlay-poc-2026` no contiene un modelo de inteligencia artificial: es una prueba de concepto (PoC) de seguridad publicada en Hugging Face cuyo unico contenido es una model card con HTML y CSS embebidos. El autor, identificado como `0xmoose0xmoose0xmoose`, aprovecha el renderizado de las model cards para dibujar una ventana superpuesta a pantalla completa que simula la pantalla de inicio de sesion de Hugging Face, con el titulo "Session expired" y un boton "Sign in" que apunta a un dominio externo (`rce.lc`). No hay pesos, no hay pipeline declarado, no hay licencia y no hay idiomas declarados.

El artefacto demuestra tres tecnicas concretas: superposicion visual mediante `position:fixed` con `z-index:2147483647` (el maximo entero de 32 bits) para tapar la interfaz legitima; evasion de filtros mediante escapes Unicode de CSS (`position:f\69 xed`, donde `\69` es la letra `i`); y balizamiento remoto mediante un `div` oculto de 1x1 pixel cuyo `background` carga una URL externa. El texto visible imita un flujo de autenticacion creible para inducir al usuario a introducir credenciales en un sitio controlado por el atacante.

Es relevante ahora porque los hubs de modelos son infraestructura compartida: cualquier usuario puede publicar un repositorio y su tarjeta se renderiza en el navegador de terceros. Este caso traslada el riesgo clasico de cadena de suministro (artefactos maliciosos) desde la ejecucion de codigo en pesos (por ejemplo, `pickle`) hasta la propia capa de presentacion web, un vector que muchas revisiones de seguridad no cubren. Las cifras publicas del repositorio son 0 descargas y 0 likes, con fecha de creacion y actualizacion del 15 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo; el unico contenido es una pagina HTML/CSS embebida en la model card) |
| Parametros totales | no disponible (no hay pesos) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no hay pesos) |
| Idiomas soportados | no disponible (el texto del overlay esta redactado en ingles) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | no disponible (no hay safetensors, GGUF ni ningun otro artefacto de pesos) |
| ID del repositorio | 0xmoose0xmoose0xmoose/css-overlay-poc-2026 |
| Autor | 0xmoose0xmoose0xmoose |
| Tipo de contenido | model card con inyeccion de HTML y CSS inline |
| Etiquetas declaradas | region:us |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-15T01:41:02.000Z |
| Fecha de actualizacion | 2026-09-15T01:41:03.000Z |
| Tamano del repositorio | no disponible |
| Dominio externo referenciado | rce.lc (rutas /card4poc-logo, /card4poc-signin, /card4poc-beacon) |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de red neuronal. El "artefacto" es un documento Markdown cuya model card contiene bloques de HTML con atributos `style` inline. El componente principal es un `div` con `position:fixed`, `inset:0`, `z-index:2147483647` y fondo blanco opaco, que se renderiza por encima de la interfaz del hub. Dentro se replica una tarjeta centrada con borde redondeado, sombra, logotipo cargado desde un dominio externo, encabezado "Session expired", texto de aviso y un boton de accion que enlaza a `https://rce.lc/card4poc-signin`. La model card se titula "Account verification required", un encuadre que refuerza la sensacion de urgencia.

Elementos tecnicos concretos: el uso de `f\69 xed` como escape Unicode de CSS demuestra evasion de filtros basados en coincidencia literal de la cadena `fixed`; el `z-index` en el maximo entero de 32 bits garantiza que el overlay quede por encima de cualquier elemento del DOM; el `div` adicional con `position:absolute`, desplazado a `top:-9999px` y `left:-9999px`, con un `background:url(...)` de 1x1 pixel, actua como baliza de seguimiento que notifica al servidor externo cuando la tarjeta se abre. No hay datos de entrenamiento, ni fases de RLHF, DPO o ajuste por instrucciones, ni innovaciones de decodificacion: no hay inferencia implicada en ningun punto.

## Capacidades

No dispone de ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas, vision ni audio. Las capacidades observables son de naturaleza ofensiva y de interfaz:

- Superposicion visual completa de la interfaz del hub mediante una capa fija a pantalla completa.
- Suplantacion de la pantalla de inicio de sesion de Hugging Face, con aviso de sesion expirada y boton de acceso.
- Redireccion a un dominio externo para la captura de credenciales.
- Balizamiento remoto (beacon) de 1x1 pixel para registrar la visualizacion de la tarjeta desde el navegador de la victima.
- Evasion de filtros de saneamiento mediante escapes Unicode de CSS en nombres de propiedades.
- Carga de recursos remotos (logotipo) desde un dominio de terceros, lo que permite confirmar la disponibilidad del endpoint.
- Ausencia total de tool calling, function calling, soporte de agentes, modo de razonamiento o capacidades multilingues.

## Casos de uso

- Auditoria de seguridad de model hubs: un equipo de seguridad puede usar este repositorio como caso de prueba para verificar si la plataforma sanea atributos `style` inline, `position:fixed` y `z-index` elevados en las model cards, y si permite recursos remotos.
- Pruebas de saneamiento en pipelines de publicacion: los mantenedores de un hub pueden incorporar este HTML a su bateria de tests de regresion para comprobar que ningun cambio en el renderizador Markdown reintroduce la vulnerabilidad.
- Formacion en concienciacion frente a phishing: el overlay sirve como material didactico reproducible para mostrar a equipos de desarrollo como una pagina de un dominio de confianza puede alojar una pantalla de inicio de sesion falsa.
- Desarrollo de detectores estaticos: sirve de muestra positiva etiquetada para entrenar o validar reglas (por ejemplo, expresiones regulares o analisis de AST) que marquen model cards con `position:fixed`, `z-index` de 32 bits o imagenes de 1x1 pixel con `background` externo.
- Red teaming de plataformas de modelos: los equipos de seguridad ofensiva pueden medir la eficacia del filtrado del hub y documentar la ventana temporal entre publicacion y retirada del repositorio.
- Analisis de riesgo de cadena de suministro: permite ilustrar en informes internos que el riesgo de un repositorio no se limita a los pesos ejecutables, sino que incluye la capa de presentacion que ve el usuario final.
- Respuesta a incidentes: si se detecta un repositorio similar en produccion, este caso sirve de referencia para identificar los indicadores tecnicos (dominio de exfiltracion, rutas concretas, patron de escape CSS) y bloquearlos en proxies y DNS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion porque el repositorio no contiene un modelo entrenado.

Como unica informacion cuantitativa observable de la plataforma:

| Metrica | Valor |
|---|---|
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-15 |
| Fecha de ultima actualizacion | 2026-09-15 |
| Pipeline declarado | no disponible |
| Datos de arquitectura o entrenamiento | no disponibles |

## Requisitos de hardware

- VRAM necesaria: ninguna. No hay pesos ni proceso de inferencia.
- GPU recomendadas: no aplica (no se requiere A100, H100, RTX 4090 ni ninguna otra).
- Compatibilidad con GPU de consumo: no aplica.
- Requisito real de ejecucion: un navegador web con soporte de CSS moderno capaz de renderizar atributos `style` inline dentro del Markdown.
- Opciones de despliegue: no aplica ninguna (vLLM, llama.cpp, Ollama, TGI, TensorRT-LLM quedan fuera de alcance). El "despliegue" es la propia publicacion del repositorio en el hub.
- Latencia y throughput: no medidos. El tiempo hasta el overlay depende del renderizado del navegador; la peticion a recursos externos anade la latencia de red hacia `rce.lc`, que no esta cuantificada.
- Coste operativo del artefacto: una peticion HTTP al dominio externo por visualizacion de la tarjeta.

## Comparativa con modelos similares

No disponible: no existen modelos comparables, ya que el repositorio no contiene un modelo. A continuacion se ofrece una comparacion cualitativa con otras clases de artefactos maliciosos o abusivos que se observan habitualmente en los hubs de modelos, a efectos de clasificacion del riesgo.

| Clase de artefacto | Vector principal | Requiere ejecucion de codigo en el cliente | Contenido visible en la model card | Licencia declarada |
|---|---|---|---|---|
| Este repositorio (overlay CSS) | Inyeccion de HTML/CSS en la model card | No | Overlay de inicio de sesion falso | no disponible |
| Repositorio senuelo con pesos inexistentes | Ingenieria social basada en promesas de capacidades | No | Descripcion enganosa | variable |
| Pesos maliciosos con `pickle` | Ejecucion de codigo al deserializar pesos | Si | Apariencia normal | variable |
| Repositorios de spam o duplicados masivos | Contaminacion del catalogo y del ranking | No | Plantillas repetidas | variable |

## Limitaciones y advertencias

- No es un modelo: cualquier intento de cargarlo con `transformers`, `vLLM` o `llama.cpp` fallara porque no existen pesos ni configuracion.
- Riesgo de phishing activo: el boton "Sign in" apunta a un dominio externo no afiliado a Hugging Face. Introducir credenciales ahi implica entregarlas a un tercero.
- Baliza de seguimiento: la carga del pixel de 1x1 pixel notifica al servidor externo que la tarjeta ha sido abierta, con la IP y el user-agent del visitante.
- Suplantacion de marca: el overlay replica la identidad visual de Hugging Face y carga un logotipo desde un dominio de terceros; no debe confundirse con una pantalla legitima del hub.
- Riesgo de falso positivo en pruebas: si el HTML se copia a otros repositorios con fines de prueba, el efecto es el mismo y puede afectar a usuarios reales.
- Licencia no disponible: al no declararse licencia, no hay autorizacion explicita de uso, copia ni redistribucion del contenido.
- Sesgos conocidos: no aplica, al no haber modelo entrenado ni datos de entrenamiento.
- Alucinacion: no aplica. El artefacto no genera texto; se limita a mostrar contenido estatico y a redirigir.
- Limitaciones de idioma y contexto: no aplican en el sentido de un modelo, pero el texto del overlay esta en ingles, lo que reduce su eficacia sobre usuarios que no lo lean.
- Caveat de produccion: la eficacia del ataque depende de que el renderizador del hub permita atributos `style` inline y recursos remotos; un saneamiento estricto lo neutraliza.
- Recomendacion operativa: no interactuar con el repositorio, no introducir credenciales en el enlace externo y notificar el caso al equipo de confianza y seguridad de la plataforma.
- Indicadores tecnicos para bloqueo: dominio `rce.lc` y rutas `/card4poc-logo`, `/card4poc-signin` y `/card4poc-beacon`; patron de escape CSS `f\69 xed`; `z-index:2147483647`; `div` de 1x1 pixel con `background` remoto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/0xmoose0xmoose0xmoose/css-overlay-poc-2026
- Model card del autor: incluida en la URL anterior (contenido HTML/CSS que genera el overlay)
- Paper o informe tecnico asociado: no disponible
- Repositorio de codigo fuente: no disponible
- Demo publica: no disponible
- Documentacion adicional del autor: no disponible
- Dominio externo referenciado dentro de la model card: rce.lc (rutas /card4poc-logo, /card4poc-signin, /card4poc-beacon), citado a efectos de analisis y bloqueo; no se enlaza
- Resultados de busqueda web: no se han encontrado resultados relevantes. Las entradas devueltas corresponden a paginas de inicio de sesion y ayuda de Gmail sin relacion alguna con el modelo o con el autor.
