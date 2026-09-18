# psikosen/t-rsi-mobile-fast-reflex

## Resumen

T-RSI Mobile Fast Reflex (Mobile v1) es un agente autonomo para Android publicado por el usuario psikosen en Hugging Face. No es un modelo de lenguaje generativo al uso: es un motor de decision ("reflejo") de muy baja latencia que recibe una lista de candidatos de la jerarquia de interfaz de Android (texto, clase de widget, si es clickable, coordenadas) y un objetivo en lenguaje natural, y devuelve cual de esos elementos debe pulsarse. Sus pesos son ternarios de 1,58 bits, en la linea de la configuracion BitNet 1.58b, con solo 1.082.890 parametros y una logica de inferencia basada exclusivamente en sumas y restas de enteros (sin multiplicaciones).

La relevancia del proyecto esta en su objetivo de eficiencia extrema: el autor declara un consumo de heap del nucleo de 8,62 KB, un runtime Python total de 15,4 MB y una latencia de decision de 58,3 microsegundos por paso, lo que lo situaria mas de mil veces por debajo de los tiempos tipicos de un LLM en la nube. El repositorio incluye los pesos en safetensors, una representacion empaquetada de 264 KB a 2 bits, un tokenizador a nivel de palabra con 8.192 clases de UI movil, y utilidades para controlar emuladores y dispositivos fisicos mediante ADB.

Se trata de un lanzamiento experimental y preliminar: el propio autor advierte de que los resultados de benchmark no deben considerarse fiables hasta que una fuente independiente los verifique, que la evaluacion se hizo en un unico testbench (RTX 5090 de 32 GB de VRAM y 128 GB de RAM) y que se requiere replicacion y verificacion adversarial en mas dispositivos antes de plantear un despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de decisión de pesos ternarios estilo BitNet 1.58b, con capas de "gating" por reglas (touch-target, region espacial, rol de componente, teclado) y motor de ejecucion sin multiplicaciones |
| Parametros totales | 1.082.890 (aproximadamente 1,08 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria de 1,58 bits con valores {-1, 0, +1}; empaquetado a 2 bits (4 pesos ternarios por byte); etiqueta "8-bit" en el repositorio sin especificacion adicional |
| Idiomas soportados | no disponible (tokenizador a nivel de palabra orientado a clases de UI movil y verbos de accion) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) y binario empaquetado propio (weights_packed_1.58bit.bin, 264 KB) |

## Arquitectura y entrenamiento

El modelo sigue la configuracion BitNet 1.58b: pesos ternarios restringidos a {-1, 0, +1}, de modo que la inferencia se resuelve con sumas y restas de enteros, sin productos matriciales. El autor no describe la profundidad de la red, el mecanismo de atencion ni el regimen de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO), por lo que esos datos no estan disponibles. El tokenizador es a nivel de palabra y cubre 8.192 clases de UI movil, verbos de accion e intenciones del sistema.

Sobre esa base numerica se superponen cuatro pilares de logica declarados por el autor: gating estricto de objetivos tactiles (solo elementos interactivos, clickables y focusables reciben puntuacion afirmativa, penalizando vistas decorativas estaticas); gating por region espacial de pantalla (distingue la barra de navegacion inferior con Y > 0,8 x H de la barra de acciones superior con Y < 0,25 x H); priorizacion por rol de componente con ponderaciones enteras nativas para Switch, EditText, Button, SeekBar y TabView; y mapeo de teclados y simbolos que normaliza operadores de calculadora y marcador (+ , −, ×, ÷, AC, CLR, •) a estados ternarios invariantes. El autor etiqueta el sistema como autonomo ("autonomous"), aunque el ejemplo de uso publica un flujo donde el objetivo se proporciona de forma explicita.

## Capacidades

- Decision de accion sobre candidatos de UI: dado un objetivo textual y una lista de elementos con clase, texto, descripcion, estado de clickabilidad y bounds, devuelve el elemento seleccionado y un estado ternario (por ejemplo, AFFIRMED).
- Gating de objetivos tactiles: discrimina elementos interactivos de decoracion no interactiva, con una precision declarada del 98,3 % para evitar toques falsos.
- Desambiguacion espacial: separa pestañas de navegacion inferior de cabeceras de accion superior usando umbrales sobre la coordenada Y.
- Priorizacion por rol de componente nativo de Android (Switch, EditText, Button, SeekBar, TabView).
- Normalizacion de teclados y simbolos de calculadora y marcador.
- Inferencia aritmetica entera: suma y resta de pesos ternarios, sin operaciones de multiplicacion.
- Integracion con ADB para emuladores y dispositivos fisicos, incluida una REPL interactiva de linea de comandos.
- Capacidades de generacion de texto libre, razonamiento abierto, codigo, matematicas, vision, audio, tool calling y uso de agentes multi-paso: no disponibles o no declaradas. El sistema no es un LLM conversacional; actua como modulo de decision de un solo paso.

## Casos de uso

- Pruebas end-to-end de aplicaciones Android en CI/CD: el motor resuelve en microsegundos que control pulsar en cada pantalla, por lo que puede encadenarse dentro de un pipeline de integracion continua con emuladores (adb_controller.py) sin anadir coste apreciable al tiempo de ejecucion de la suite.
- Automatizacion de tareas repetitivas en movil (RPA): flujos como "abrir ajustes de pantalla y activar el tema oscuro" se pueden ejecutar en el dispositivo mediante live_interactive_test.py y ADB, sin enviar datos de pantalla a la nube.
- Reduccion de falsos positivos en agentes basados en vision: al actuar como etapa de gating previa sobre los candidatos extraidos del arbol de accesibilidad, filtra vistas decorativas y evita toques en elementos no interactivos antes de invocar un modelo mayor.
- Enrutado de bajo coste antes de un LLM: usar el motor como primera capa de decision para acciones triviales (seleccionar una pestaña, un boton claro) y reservar el LLM solo para casos ambiguos, reduciendo coste y latencia agregados.
- Asistencia a la accesibilidad: dado un objetivo en lenguaje natural y los elementos accesibles de la pantalla, puede señalar el control relevante para usuarios con dificultades motoras o visuales.
- Automatizacion de calculadoras y marcadores: la normalizacion de operadores permite automatizar entrada de expresiones aritmeticas y pulsaciones de teclado numerico en apps de calculadora y telefono.
- Despliegue en el propio dispositivo o en hardware muy limitado: con 264 KB de pesos empaquetados y un heap de nucleo declarado de 8,62 KB, es candidato a ejecutarse via Android NDK, microcontroladores o WebAssembly sin conexion de red.
- Validacion de jerarquias de UI durante el desarrollo: comprobar que los elementos interactivos de una pantalla reciben puntuaciones afirmativas y detectar decoracion mal marcada como clickable.

## Benchmarks y rendimiento

Los siguientes datos proceden exclusivamente de la model card del autor. Estan marcados como preliminares y no verificados de forma independiente; se reproducen tal cual y no deben tomarse como resultados confirmados.

| Benchmark | Resultado declarado | Tareas |
|---|---|---|
| AndroidWorld (Google Research) | 95,0 % (19/20) | 20 |
| AndroidControl (Google y CMU) | 95,0 % (19/20) | 20 |
| Mobile-Eval (Alibaba) | 75,0 % (15/20) | 20 |
| Conjunto total de evaluacion | 88,3 % | 60 |

Metricas adicionales declaradas por el autor:

| Metrica | Valor declarado |
|---|---|
| Latencia de decision | 58,3 microsegundos |
| Precision de objetivo tactil | 98,3 % |
| Heap del nucleo del agente | 8,62 KB |
| Runtime Python total | 15,4 MB |

No se han publicado resultados de benchmarks independientes en la informacion disponible. El autor exige explicitamente verificacion por terceros antes de dar por validos estos numeros.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula. Los pesos ternarios ocupan aproximadamente 0,2 MB y el binario empaquetado a 2 bits pesa 264 KB, por lo que el modelo no depende de VRAM dedicada.
- GPU recomendadas: ninguna en concreto. El autor evaluo en una RTX 5090 con 32 GB de VRAM y 128 GB de RAM como banco de pruebas, pero ese hardware no es un requisito del modelo.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso sin GPU. El cuello de botella real es el proceso Python (15,4 MB declarados) y la comunicacion con ADB.
- Opciones de despliegue: ejecucion directa con engine.py y from_pretrained() sobre safetensors; binario empaquetado para Android NDK, microcontroladores o WebAssembly; control de emulador y dispositivo fisico mediante adb_controller.py; REPL interactiva con live_interactive_test.py.
- Latencia y throughput: latencia de decision declarada de 58,3 microsegundos; el ejemplo de la model card reporta 21,4 microsegundos para una seleccion concreta. No se publica throughput agregado ni latencia de ciclo completo incluyendo captura de UI y ejecucion del toque por ADB.

## Comparativa con modelos similares

No se han identificado modelos comparables en la informacion proporcionada. No existen datos de Alternativas con los que contrastar parametros, contexto, rendimiento o licencia.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| T-RSI Mobile Fast Reflex (Mobile v1) | 1,08 M, ternario 1,58 bits | no disponible | 88,3 % en 60 tareas segun el autor (no verificado) | MIT | Hugging Face, repo de 0,0 GB |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

Como referencia conceptual, el autor cita la configuracion BitNet 1.58b, pero no se aportan comparaciones numericas con esa u otras familias de modelos.

## Limitaciones y advertencias

- Estado experimental: el propio autor advierte de que se trata de un lanzamiento de investigacion preliminar y que no se deben confiar en los resultados de benchmark hasta que una fuente secundaria los verifique.
- Evaluacion limitada: los resultados proceden de un unico banco de pruebas (equipo del autor, RTX 5090 y 128 GB de RAM), sin verificacion adversarial ni replicacion en otros dispositivos Android.
- Sesgos conocidos: no disponibles. No hay informacion sobre la composicion del dataset ni sobre sesgos de idioma, region o tipo de aplicacion.
- Riesgo de alucinacion: no es un modelo generativo de texto, por lo que el riesgo tipico de alucinacion no aplica. El riesgo equivalente es seleccionar un elemento incorrecto o no interactivo cuando la jerarquia de UI no sigue los patrones esperados (roles y regiones convencionales).
- Dependencia de la jerarquia de accesibilidad: el funcionamiento se apoya en atributos como clase de widget, clickable y bounds. Aplicaciones con UI no estandar, canvas o juegos pueden degradar la precision.
- Limitaciones de idioma y contexto: los idiomas soportados y la longitud de contexto no estan disponibles; el tokenizador esta orientado a vocabulario de UI movil, no a lenguaje natural general.
- Alcance funcional: no realiza generacion de texto, razonamiento abierto, codigo, matematicas, vision ni audio, y no se declara soporte de tool calling ni de agentes multi-paso.
- Adopcion y mantenimiento: el repositorio registra 0 descargas y 0 likes, y el tamano del repo aparece como 0,0 GB, lo que sugiere que el contenido puede haber cambiado o no estar completamente indexado. No hay informacion sobre mantenimiento posterior.
- Licencia: MIT, por lo que el uso comercial esta permitido con la unica obligacion de conservar el aviso de copyright y la licencia. No se declaran restricciones adicionales.
- Caveat de produccion: dado el aviso explicito del autor, no se recomienda su uso en produccion sin una evaluacion propia en los dispositivos y aplicaciones objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/psikosen/t-rsi-mobile-fast-reflex
- No se han encontrado enlaces relevantes al modelo (papers, blogs, repositorios o demos) en la busqueda web realizada. Los resultados obtenidos trataban sobre ChatGPT, jailbreaks y modelos de GitHub Copilot, y no guardan relacion con este modelo.
