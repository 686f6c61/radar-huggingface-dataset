# kintsugi888/wave-cinema-demo

## Resumen

Wave Cinema (identificador `kintsugi888/wave-cinema-demo`) no es un modelo de lenguaje ni un modelo generativo con pesos publicados: es una aplicacion Gradio desplegada como Space de Hugging Face que funciona como estudio de montaje de videoclips musicales asistido por un agente director. El flujo descrito en su model card es: se sube una cancion en MP3 o WAV, el agente director genera un plan de escenas con tiempos exactos, el usuario produce los clips por su cuenta, los sube para su revision y finalmente la aplicacion monta y exporta el master.

Su relevancia actual es limitada y de caracter demostrativo. El autor la publica como demo publica de la version que denomina "Midnight Chrome v1.0", con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado, sin licencia, sin idiomas indicados y sin resultados de evaluacion. La generacion de video no ocurre en el propio Space en su configuracion por defecto: el modo "BYO generation" traslada la generacion a la cuenta externa del usuario, y la via de generacion en la nube (Wave Cinema Cloud, sobre una clave de Higgsfield) aparece explicitamente desactivada en esta demo.

Por tanto, esta ficha documenta una aplicacion de orquestacion y montaje, no un modelo. Cualquier dato relativo a parametros, contexto, cuantizacion o benchmarks no existe en la informacion disponible y se marca como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible; no es un modelo de pesos, sino una aplicacion Gradio (sdk: gradio, sdk_version 6.30.0, app_file: app.py) |
| Parametros totales | No disponible (no aplica) |
| Parametros activos | No disponible (no aplica) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no aplica) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible; el repositorio contiene codigo de aplicacion, no pesos |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Autor | kintsugi888 |
| Tipo de repositorio | Space de Hugging Face (aplicacion, no modelo) |
| Tags declarados | region:us |
| Descargas | 0 |
| Likes | 0 |
| Creado | 2026-10-15T01:09:35.000Z |
| Actualizado | 2026-10-15T02:38:00.000Z |
| Generacion de video integrada | Desactivada en esta demo (requiere HIGGSFIELD_API_KEY) |
| Pasarela de pago | Stripe en modo test, sin claves reales |

## Arquitectura y entrenamiento

La aplicacion se organiza como un pipeline de cuatro etapas declaradas en la model card. En primer lugar, el modulo Direct actua como agente director: recibe la cancion y produce un plan de escenas con indicaciones de texto (prompts) y temporizaciones exactas, exportable como "job pack" en un ZIP que incluye los prompts, los tiempos y un README para el lado generador. En segundo lugar, la generacion de clips se externaliza: en el modo BYO el usuario genera un clip por escena en su propia cuenta de generacion de video, con nombres normalizados (`scene_00.mp4`, `scene_01.mp4`, etc.) y los sube comprimidos. En tercer lugar, el modulo Review registra cada clip como una toma asociada a su tamano en bytes y su hash SHA-256, y permite seleccionar la toma ganadora por escena. En cuarto lugar, el modulo Export realiza el montaje y la construccion del master.

La model card menciona una via alternativa, Wave Cinema Cloud, que ejecutaria la generacion con la clave de Higgsfield del propietario y la facturaria contra un saldo de creditos. Esa via esta deshabilitada en la demo gratuita y se activaria al pasar a alojamiento de pago. Tambien se describe un modo de generacion "mock" en servidor que depende de ffmpeg, con un binario estatico empaquetado mediante `imageio-ffmpeg`.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones de inferencia como decodificacion especulativa o atencion lineal. Tampoco se especifica que modelo subyacente, si alguno, utiliza el agente director para planificar escenas.

## Capacidades

- Planificacion de escenas a partir de una pista de audio: genera un plan con prompts por escena y temporizaciones exactas.
- Exportacion de un "job pack" en ZIP con prompts, tiempos y un README de instrucciones para el flujo de generacion externo.
- Registro y trazabilidad de tomas: cada clip subido queda identificado por tamano en bytes y hash SHA-256.
- Revision y seleccion de tomas ganadoras por escena.
- Montaje y exportacion de un master a partir de las tomas seleccionadas.
- Modo de generacion "bring your own" (BYO) que no consume creditos del propietario de la aplicacion.
- Via de generacion en la nube (Wave Cinema Cloud) documentada pero deshabilitada en esta demo.
- Pasarela de pago Stripe incluida en modo test, sin posibilidad de cargos reales.
- Soporte de carga de audio en MP3 y WAV, con casilla de aceptacion de derechos.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso mas alla del planificador de escenas, vision, audio o modo de razonamiento, ni capacidades multilingues.

## Casos de uso

- Prototipado de videoclips para artistas independientes: el flujo permite pasar de una cancion a un plan de escenas con tiempos concretos sin coste de generacion, y decidir despues si se producen los clips con un proveedor externo.
- Preproduccion y storyboard tecnico: el "job pack" en ZIP sirve como documento de trabajo con prompts y marcas de tiempo que un equipo o un generador externo puede ejecutar de forma reproducible.
- Coordinacion de produccion distribuida: al normalizar los nombres de archivo (`scene_00.mp4`, `scene_01.mp4`) y registrar cada toma con su SHA-256, la aplicacion facilita repartir escenas entre varias personas o cuentas y verificar que el material recibido es el correcto.
- Control de calidad y seleccion de tomas: el modulo Review permite comparar varias versiones de una misma escena y fijar una ganadora antes del montaje, lo que reduce el riesgo de ensamblar material no validado.
- Montaje final y exportacion de master: en Export se construye el master a partir de las tomas seleccionadas, lo que cierra el ciclo sin salir de la interfaz.
- Demostraciones y evaluacion de producto: al ser una demo publica sin claves de pago reales ni consumo de creditos, sirve para que terceros prueben el flujo completo de orquestacion antes de comprometerse con un plan de pago.
- Pruebas de integracion de proveedores de generacion de video: el modo Cloud, cuando se habilita con `HIGGSFIELD_API_KEY`, permite conectar la planificacion con un proveedor concreto y medir el coste por proyecto mediante el saldo de creditos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existen datos de MMLU, HumanEval, GSM8K ni de metricas de calidad de video, coherencia audio-video o fidelidad de montaje. Tampoco se publican tiempos de planificacion, latencia de montaje ni throughput de exportacion.

## Requisitos de hardware

- No se declara ningun requisito de GPU. En su configuracion por defecto la demo no realiza generacion de video en el servidor, ya que delega en la cuenta externa del usuario.
- El alojamiento corresponde a la infraestructura del Space de Hugging Face, cuyo hardware no se especifica en la informacion disponible.
- Para el modo de generacion "mock" en servidor se requiere ffmpeg; el autor indica que se empaqueta un binario estatico mediante `imageio-ffmpeg` y que, si falla, la via soportada es el flujo BYO.
- Almacenamiento efimero: los proyectos, tomas y masters desaparecen cuando el Space se suspende o se reinicia.
- El Space se suspende cuando esta inactivo, por lo que hay arranque en frio al despertar.
- Para la via Wave Cinema Cloud se requiere la variable secreta `HIGGSFIELD_API_KEY` en el entorno del Space, ademas de claves reales de Stripe para cobros en produccion.
- No se dispone de datos de VRAM estimada, GPU recomendadas, latencia ni throughput.

## Comparativa con modelos similares

No disponible. La busqueda web no devuelve alternativas directamente comparables con datos verificables. Los resultados obtenidos corresponden a productos o modelos de otra naturaleza:

| Alternativa | Categoria | Relacion con Wave Cinema |
|---|---|---|
| AI Cinema Studio (Space de wavespeed) | Espacio de Hugging Face para direccion de planos de video con control de camara, hasta 30 segundos por clip | Categoria proxima (estudio de direccion de video), pero sin datos publicos comparables de parametros, contexto o licencia |
| WaveSpeedAI (plataforma) | Plataforma de generacion de imagen, video y audio | Proposito solapado (generacion de medios), no es un modelo comparable |
| WAVE, Woven City AI Vision Engine (`wovenbytoyota-vai/WAVE`) | Modelo de comprension de video de aproximadamente 8000 millones de parametros con contexto largo | Categoria distinta (comprension, no generacion ni montaje); no es comparable |

En todos los casos, la licencia, el contexto, los parametros y el rendimiento de esas alternativas no estan disponibles en la informacion recogida, por lo que no se puede establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No se declara licencia. La ausencia de licencia explicita impide asumir permisos de uso comercial, redistribucion o modificacion.
- No es un modelo: no hay pesos, ni parametros, ni contexto, ni cuantizaciones que evaluar. Cualquier expectativa de uso como modelo de IA generativa no se corresponde con el contenido del repositorio.
- La generacion de video en la nube esta desactivada en esta demo. Sin `HIGGSFIELD_API_KEY` y sin alojamiento de pago, la unica via operativa es el flujo BYO con cuentas externas.
- La pasarela de pago Stripe esta en modo test: no procesa cargos reales y el propio autor advierte de no introducir datos de tarjeta reales.
- Almacenamiento efimero: proyectos, tomas y masters se pierden al suspenderse o reiniciarse el Space. Hay que descargar manualmente cualquier resultado que se quiera conservar.
- Arranque en frio: el Space se suspende por inactividad, lo que introduce esperas en el primer acceso.
- Dependencia de ffmpeg para el modo mock; si el binario empaquetado falla, ese camino queda inoperativo.
- El flujo exige que el usuario marque una casilla de derechos sobre la cancion subida. La responsabilidad legal sobre el material de entrada recae en el usuario.
- No hay informacion sobre el modelo o servicio que produce el plan de escenas, por lo que no se puede evaluar su calidad, sus sesgos ni su tasa de alucinacion en las temporizaciones o descripciones generadas.
- No hay resultados de benchmarks ni validacion independiente. Sin datos de evaluacion, no es recomendable usarlo en produccion sin pruebas propias.
- El repositorio muestra 0 descargas y 0 likes, sin historial de versiones publico mas alla de las fechas de creacion y actualizacion del metadato.
- La busqueda web no vincula de forma verificable este Space con los productos y modelos encontrados (WaveSpeedAI, WAVE, canales de demos de Kintsugi), por lo que no debe atribuirse ninguna de esas capacidades a esta demo.

## Enlaces

- Space en Hugging Face: https://huggingface.co/kintsugi888/wave-cinema-demo
- AI Cinema Studio (Space de wavespeed): https://huggingface.co/spaces/wavespeed/ai-cinema-studio
- AI Cinema Studio, pagina de producto: https://wavespeed.ai/cinema-studio
- WaveSpeedAI, plataforma: https://wavespeed.ai/
- WAVE, Woven City AI Vision Engine: https://huggingface.co/wovenbytoyota-vai/WAVE
- Kintsugi Product Demos (canal de YouTube): https://www.youtube.com/@kintsugi-demos
- Fichero DEPLOY_NOTES.md y fichero app.py: referenciados en la model card, no enlazados de forma directa en la informacion disponible.
