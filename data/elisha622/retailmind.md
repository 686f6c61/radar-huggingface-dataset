# Elisha622/retailmind

## Resumen

RetailMind es un repositorio de Hugging Face que no contiene pesos de un modelo de lenguaje, sino el espejo del código fuente de una aplicación web progresiva (PWA) de operaciones minoristas. Lo publica el usuario Elisha622 y el código original vive en el repositorio de GitHub `paulelisha500-ops/retailmind`. El artefacto resuelve un problema de gestión de tienda: cubre caja, previsión de demanda, compras, alertas de lineal, almacén, analítica con cuenta de pérdidas y ganancias y una app de cliente con fidelización, todo dentro del navegador.

La particularidad técnica es que el backend completo (base de datos, autenticación, permisos y motor de previsión) se ejecuta en la propia página mediante Web Workers, IndexedDB y WebCrypto. No hay servidor al que conectarse ni cuenta que crear por defecto, de modo que los mismos ficheros se alojan gratis en GitHub Pages, en un Space estático de Hugging Face o en cualquier host estático. Existe además una edición de servidor con FastAPI sobre SQLite o PostgreSQL para equipos que necesitan una base de datos compartida.

Dentro del motor de previsión hay cuatro métodos implementados desde cero en JavaScript: una regresión ridge estacional con banda de predicción, árboles con boosting de gradiente, una LSTM y un pequeño codificador Transformer, todos entrenados con el historial de la propia tienda. Son implementaciones compactas de esas familias de métodos, no envoltorios de librerías de Python como PyTorch o scikit-learn. La función de preguntas en lenguaje natural, Ask RetailMind, compone respuestas a partir de inventario, proveedores, ventas y alertas en vivo sin utilizar ningún modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal preentrenado. Aplicacion React (PWA) con motor en Web Worker; el modulo de prevision incluye regresion ridge estacional, arboles con boosting de gradiente, LSTM y codificador Transformer compactos, con autodiferenciacion inversa escrita a mano |
| Parametros totales | No disponible (no se declaran tamanos de red; las redes se describen como compactas y se entrenan en el worker en un par de segundos) |
| Longitud de contexto | No aplica / no disponible (no es un modelo de lenguaje; la ventana de datos la fija el historial de la tienda) |
| Tipos de cuantizacion | No aplica / no disponible |
| Idiomas soportados | No disponible (la interfaz mostrada en la documentacion esta en ingles; no se declara soporte multiidioma) |
| Licencia | No disponible (la model card no indica licencia) |
| Formato de pesos | No aplica: el repositorio contiene codigo fuente y ficheros de la aplicacion web, no pesos en safetensors ni GGUF |
| Autor | Elisha622 |
| Tipo de artefacto | Espejo de codigo fuente de una aplicacion web; Space asociado con demo estatica |
| Descargas | 0 |
| Likes | 1 |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-10-06 |
| Ediciones de despliegue | Estatica (navegador, sin servidor) y servidor (FastAPI sobre SQLite o PostgreSQL) |
| Persistencia | IndexedDB en el cliente, con sincronizacion entre pestanas via BroadcastChannel; service worker para funcionamiento sin conexion |
| Autenticacion | PBKDF2-SHA256 con 150.000 rondas y sesiones JWT HS256 sobre WebCrypto; limitacion de intentos fallidos por correo y por cliente |

## Arquitectura y entrenamiento

La aplicacion se organiza como una interfaz React con enrutado por hash y pantallas cargadas de forma diferida. Las peticiones salen como mensajes `{method, path, query, body}` hacia un Web Worker que actua de motor y devuelve `{status, body}`, replicando la misma superficie REST que la edicion de servidor y siguiendo las convenciones de validacion, orden de autorizacion y codigos de estado de FastAPI. El cambio entre ediciones se hace con una variable de entorno (`VITE_BACKEND=server`). Los datos se guardan en IndexedDB poco despues de cada cambio, se vuelcan cuando la pagina se oculta y se comparten entre pestanas. Un service worker cachea el shell de la aplicacion y todos los scripts, de modo que abre sin conexion; las marcas de tiempo avanzan con el calendario al reabrir, para que expresiones como "ultimos 7 dias" y las cuentas de caducidad sigan siendo validas.

El modulo de prevision se ejecuta tambien en el navegador, en un worker. Calcula demanda semanal por categoria y tienda con cuatro metodos: ridge estacional con banda de prediccion, arboles con boosting de gradiente, LSTM y un pequeno codificador Transformer construidos sobre autodiferenciacion inversa escrita a mano. El entrenamiento usa el historial propio de la tienda, tarda un par de segundos en el caso de las redes y se cachea por historial. La salida incluye un rango con 90% de probabilidad, una puntuacion de precision medida sobre los ultimos siete dias que el metodo nunca vio y una cantidad de reposicion sugerida. No se documentan en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, algo que carece de sentido en este artefacto al no tratarse de un modelo generativo.

## Capacidades

- Caja: busqueda por nombre, SKU o codigo de barras (el Enter del escaner anade el articulo), totales en vivo, consulta de fidelizacion y alta en tienda, canje de puntos contra la factura y seis formas de pago (efectivo con cambio, tarjeta, Apple Pay, Google Pay, Samsung Pay y Tabby).
- Prevision de demanda semanal por categoria y tienda con cuatro metodos, banda de prediccion al 90%, puntuacion de precision sobre los ultimos siete dias y cantidad de reposicion sugerida.
- Compras: ordenes de compra aprobadas por quien tiene la responsabilidad de aprobacion, cuadros de mando de proveedores, registros de alta, comunicaciones al proveedor registradas en cada clic, productos con coste de aterrizaje y margen, e importacion CSV para ambos.
- Monitorizacion: ocupacion de lineal por pasillo calculada con stock en vivo, cola de revision de alertas de stock, calidad y prevencion de perdidas que siempre cierra una persona, y fuente de camara (este dispositivo o URL de camara IP).
- Almacen: utilizacion de zonas, ruta de reposicion por pasillo, trafico de planta por hora y recomendacion de dotacion de personal.
- Analitica: indicadores clave, productos de alta rotacion con dias de suministro, merma por categoria, comparativa regional y cuenta de resultados comercial calculada a partir de pedidos y costes.
- Ask RetailMind: respuestas compuestas a partir de inventario, proveedores, ventas y alertas en vivo. No interviene ningun modelo de lenguaje, de modo que cada frase se remonta a un registro.
- Equipo y acceso: alta y baja de personas, roles (admin, manager, staff), responsabilidades por modulo, contrasena temporal de un solo uso y modo de tienda unica o empresarial en cuatro tiendas.
- App de cliente: puntos y nivel de fidelizacion, ofertas, recomendaciones personales, busqueda de producto con informacion nutricional y alergenos, lista de la compra, autopago, recibos y tienda preferida.
- Funcionamiento sin conexion gracias al service worker y persistencia local en IndexedDB.
- No se declaran capacidades de tool calling, razonamiento multi-paso generativo, vision, audio ni generacion de texto libre.

## Casos de uso

- Operacion de caja en tienda fisica: la pantalla de cajero permite buscar por nombre, SKU o codigo de barras, consultar y dar de alta fidelizacion, canjear puntos contra la factura y cobrar con seis medios de pago distintos, con emision de recibo y directorio de clientes con historial de pedidos.
- Reposicion de stock basada en prevision: el modulo de prevision calcula demanda semanal por categoria y tienda con cuatro metodos, ofrece un rango al 90% y una cantidad de reposicion sugerida, y valida el metodo con la precision medida sobre los siete dias que no vio durante el entrenamiento.
- Gestion de compras y proveedores: el flujo de procurement permite emitir ordenes de compra sujetas a aprobacion por responsabilidad, evaluar proveedores con cuadros de mando, registrar comunicaciones y trabajar con coste de aterrizaje y margen por producto, con importacion CSV de productos y proveedores.
- Supervision de tienda y prevencion de perdidas: la cola de revision agrupa alertas de stock, calidad y prevencion de perdidas, siempre cerradas por una persona, y la ocupacion de lineal por pasillo se calcula con stock en vivo a partir de una camara del dispositivo o de una camara IP.
- Planificacion de almacen y personal: la vista de almacen calcula utilizacion por zona, propone una ruta de reposicion por pasillo, mide trafico de planta por hora y emite una recomendacion de dotacion de personal.
- Analitica financiera de la operacion: los indicadores clave, los productos de alta rotacion con dias de suministro, la merma por categoria, la comparativa regional y la cuenta de resultados se calculan a partir de pedidos y costes, sin exportaciones manuales.
- Despliegue en contextos con poca infraestructura: al ejecutarse integramente en el navegador y persistir en IndexedDB, la edicion estatica sirve para demos, formacion y tiendas piloto donde no se quiere montar ni mantener un servidor ni un contenedor Docker.
- Atencion en tienda asistida por datos: Ask RetailMind responde sobre inventario, proveedores, ventas y alertas en vivo componiendo la respuesta a partir de registros, sin modelo de lenguaje, lo que resulta util cuando se exige trazabilidad de cada afirmacion.
- Programa de fidelizacion y app de cliente: la app de cliente gestiona puntos y niveles, ofertas, recomendaciones personales, busqueda con alergenos y nutricion, lista de la compra, autopago y recibos.
- Implantacion multitienda con control de acceso: el modo empresarial abarca cuatro tiendas y los roles admin, manager y staff ven conjuntos de pantallas y permisos distintos, con responsabilidades por modulo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un apartado de velocidad que menciona una medicion con `frontend/scripts/bench-load.mjs` contra la interfaz original en el commit `d1688ff`, pero el texto esta truncado en el punto donde se indica que se ejecuto en modo headless, por lo que no se dispone de cifras.

| Benchmark | Resultado | Comparativa |
|---|---|---|
| MMLU | No aplica (no es un modelo de lenguaje) | No disponible |
| HumanEval | No aplica | No disponible |
| GSM8K | No aplica | No disponible |
| Precision de prevision | Metrica interna sobre los ultimos 7 dias, valor no publicado | No disponible |
| Carga de interfaz (`bench-load.mjs`) | Dato no disponible (texto truncado en la model card) | No disponible |

## Requisitos de hardware

- VRAM para inferencia: no aplica. No hay pesos ni inferencia de un modelo generativo; el calculo ocurre en la CPU del navegador mediante Web Workers.
- GPU recomendada: no aplica. No se declara uso de WebGPU, WebGL ni aceleracion por GPU.
- Compatibilidad con GPU de consumo: no aplica en el sentido habitual. El requisito real es un navegador moderno con soporte de Web Workers, IndexedDB, WebCrypto y service workers.
- Coste de calculo en cliente: el entrenamiento de la LSTM y del codificador Transformer se describe como de un par de segundos en el worker, y el resultado se cachea por historial.
- Opciones de despliegue: edicion estatica en GitHub Pages, Space estatico de Hugging Face o cualquier host estatico; edicion de servidor con FastAPI sobre SQLite o PostgreSQL. No requiere Docker.
- Servidor para la edicion compartida: no se especifican requisitos de CPU, RAM ni disco para FastAPI sobre SQLite o PostgreSQL.
- Latencia y throughput: no disponibles (la seccion de velocidad de la model card esta truncada).

## Comparativa con modelos similares

No disponible. El artefacto no es un modelo de IA y la informacion proporcionada no incluye datos comparativos con otras suites de operaciones minoristas ni con modelos de prevision de demanda. No se dispone de cifras de parametros, contexto, rendimiento ni disponibilidad de alternativas que permitan una comparacion rigurosa.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no razona de forma multi-paso y no soporta tool calling ni function calling. Cualquier expectativa de ese tipo sobre este repositorio es un error de catalogacion.
- La licencia no se declara en la model card ni en los metadatos disponibles. No se puede asumir permiso de uso comercial, modificacion ni redistribucion sin consultar el repositorio de origen.
- Ask RetailMind no emplea un modelo de lenguaje, por lo que las respuestas se limitan a lo que puede componerse desde inventario, proveedores, ventas y alertas. La contrapartida es una cobertura estrecha de preguntas fuera de ese dominio.
- El motor de prevision se entrena con el historial propio de la tienda. Sin historial suficiente no hay base para ajustar los metodos, y no se documenta el comportamiento en escenarios de arranque en frio.
- Las implementaciones de ridge estacional, boosting de gradiente, LSTM y Transformer son compactas y escritas a mano, no las librerias de Python de referencia. No se publican comparaciones de fidelidad frente a esas librerias, por lo que la precision alcanzable puede diferir.
- La puntuacion de precision de la prevision se mide sobre los ultimos siete dias del propio historial, una ventana corta y no necesariamente representativa de cambios de estacionalidad o promociones.
- En la edicion estatica los datos viven en el IndexedDB del navegador. Limpiar el almacenamiento del navegador, cambiar de dispositivo o de perfil implica perder el espacio de trabajo si no hay copia. La sincronizacion entre pestanas es local, no entre usuarios ni maquinas.
- La autenticacion de la edicion estatica es local: contrasenas con PBKDF2-SHA256 a 150.000 rondas y sesiones JWT HS256 sobre WebCrypto. No se documenta auditoria externa, rotacion de secretos ni modelo de amenaza, y las cuentas de demostracion aparecen listadas en la pantalla de acceso, algo aceptable para una demo pero no para produccion.
- No se declaran idiomas soportados ni comportamiento multilingue; la interfaz documentada esta en ingles.
- No se indican sesgos conocidos, tasas de alucinacion ni evaluaciones de equidad. En el caso de la prevision de demanda, cualquier sesgo derivaria de los datos historicos de la tienda y no de un corpus de entrenamiento publicado.
- La importacion de datos se limita a CSV para productos y proveedores; no se documentan conectores con sistemas de punto de venta, ERP ni pasarelas de pago reales, pese a que la interfaz liste Apple Pay, Google Pay, Samsung Pay y Tabby como formas de pago.
- El modo empresarial se describe para cuatro tiendas como maximo, lo que acota la escala de despliegue documentada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Elisha622/retailmind
- Demo en Space de Hugging Face: https://huggingface.co/spaces/Elisha622/retailmind
- Codigo fuente en GitHub: https://github.com/paulelisha500-ops/retailmind
- Demo en GitHub Pages: https://paulelisha500-ops.github.io/retailmind/
- Integracion continua (GitHub Actions): https://github.com/paulelisha500-ops/retailmind/actions/workflows/ci.yml
- Analisis de seguridad CodeQL (GitHub Actions): https://github.com/paulelisha500-ops/retailmind/actions/workflows/codeql.yml
