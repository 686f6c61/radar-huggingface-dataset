# DangPhamPham/camoufox-mirror

## Resumen

Camoufox-mirror es un repositorio de respaldo (mirror) del navegador antidetect Camoufox, un fork de Firefox diseñado para web scraping y agentes de IA. El autor, DangPhamPham, publica este espejo en HuggingFace como copia de seguridad del repositorio original de GitHub (`daijro/camoufox`), por si este desaparece o cambia de ubicación. No se trata de un modelo de lenguaje ni de un sistema de IA, sino de un paquete de software que incluye binarios del navegador, paquetes pip y código fuente.

El proyecto Camoufox original está desarrollado por daijro y se presenta como un navegador "headless, indetectable y optimizado para ejecutarse a escala". Cada ejecución genera una identidad de dispositivo fresca basada en la distribución real de dispositivos, lo que permite que el tráfico automatizado se mezcle con el tráfico normal. La versión reflejada es la v152.0.4-beta.29, correspondiente a Firefox 152.0.4, con el paquete pip camoufox 0.5.5. El repositorio ocupa 1.7 GB y contiene archivos para Windows y Linux, así como el código fuente.

La relevancia de este mirror radica en la dependencia que tienen las herramientas de automatización de IA de este navegador. El propio autor mantiene la herramienta `DangPhamPham/azure-camoufox` que depende de este paquete. Al estar alojado en HuggingFace, ofrece una alternativa de distribución estable frente a posibles caídas de GitHub o PyPI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Navegador basado en Firefox (fork de Mozilla Firefox 152.0.4) |
| Parametros totales | No aplica (no es un modelo de IA) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (el navegador base soporta multiples idiomas, pero no se especifica en el mirror) |
| Licencia | No disponible (el repositorio no indica licencia; el proyecto original Camoufox usa MPL-2.0, pero no se confirma en este mirror) |
| Formato de pesos | No aplica; archivos binarios: ZIP (Windows/Linux), wheel pip, tarball de codigo fuente |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un navegador compilado. Camoufox es un fork de Firefox con modificaciones a nivel de C++ para el spoofing de huellas digitales (fingerprinting). Elimina telemetria, servicios en segundo plano y sobrecarga de interfaz, reduciendo el consumo de memoria a aproximadamente 200 MB frente a los 800 MB de Chrome. El mirror contiene los binarios compilados para Windows x64 y Linux x64, el paquete pip (wheel y sdist) y el archivo fuente del repositorio etiquetado como v152.0.4-beta.29. No hay datos de entrenamiento porque no es un modelo de IA.

## Capacidades

- Navegacion headless automatizada con perfil antidetect.
- Generacion de identidades de dispositivo frescas en cada ejecucion, basadas en la distribucion real de dispositivos.
- Spoofing de huellas digitales a nivel de C++ (canvas, WebGL, fuentes, etc.).
- Compatible con herramientas de automatizacion como Playwright o Selenium a traves del paquete pip `camoufox`.
- Disenado para ejecutar multiples agentes de IA en paralelo.
- Sin telemetria ni servicios en segundo plano, lo que reduce el consumo de recursos.
- Soporte para Windows y Linux (binarios incluidos en el mirror).

## Casos de uso

- Web scraping a escala: el navegador permite extraer datos de sitios con proteccion anti-bot, ya que cada sesion usa una identidad de dispositivo distinta que se mezcla con el trafico normal.
- Agentes de IA que necesitan interactuar con paginas web: por ejemplo, un agente que rellena formularios, navega por resultados de busqueda o recopila informacion de multiples fuentes.
- Automatizacion de pruebas de aplicaciones web: al ser indetectable, puede probar el comportamiento de una web sin ser bloqueado por sistemas de deteccion de bots.
- Gestion de multiples cuentas en plataformas online: cada ejecucion con identidad fresca reduce el riesgo de asociacion entre cuentas.
- Monitorizacion de precios y disponibilidad de productos: el navegador puede visitar tiendas online sin levantar sospechas, incluso con cambios frecuentes de IP o dispositivo.
- Integracion en pipelines de datos: al ser headless y ligero, puede desplegarse en servidores para tareas de recopilacion continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto original menciona un consumo de memoria de ~200 MB frente a los 800 MB de Chrome, pero no hay metricas formales de rendimiento o precision en tareas de evasion de deteccion.

## Requisitos de hardware

- No requiere GPU; es un navegador que se ejecuta en CPU.
- Memoria RAM: aproximadamente 200 MB por instancia del navegador, segun la documentacion oficial.
- Almacenamiento: el mirror ocupa 1.7 GB en disco (incluye binarios para Windows y Linux).
- Sistema operativo: Windows x64 o Linux x64 (los binarios incluidos son para estas plataformas).
- Despliegue: se puede ejecutar en cualquier VPS o contenedor con soporte para Firefox. No requiere herramientas especificas de inferencia de IA.
- Para ejecutar multiples instancias en paralelo, se recomienda un servidor con suficiente RAM (por ejemplo, 2 GB por cada 10 instancias).

## Comparativa con modelos similares

No aplica directamente, ya que no es un modelo de IA. Como navegador antidetect, se puede comparar con otras soluciones como Puppeteer Stealth o Playwright Stealth, pero no hay datos comparativos en la informacion proporcionada. El proyecto original Camoufox se posiciona como una alternativa ligera y de bajo nivel frente a Chrome headless.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, codigo ni realiza razonamiento. Es un navegador automatizado.
- El mirror no incluye informacion sobre licencia; el uso comercial puede estar restringido segun la licencia del proyecto original (MPL-2.0, pero no confirmada en este repositorio).
- El navegador esta disenado para evadir deteccion; su uso para actividades fraudulentas o ilegales puede violar los terminos de servicio de los sitios web y las leyes locales.
- La version reflejada es una beta (v152.0.4-beta.29); puede contener errores o comportamientos inestables.
- El mirror no se actualiza automaticamente; si el repositorio original cambia, esta copia puede quedar desactualizada.
- No se proporcionan instrucciones de instalacion completas en el README; el proceso de restauracion manual requiere conocimientos de la estructura de cache de camoufox.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DangPhamPham/camoufox-mirror
- Repositorio original de Camoufox en GitHub: https://github.com/daijro/camoufox
- Sitio web oficial de Camoufox: https://camoufox.com/
- Herramienta dependiente del autor: https://huggingface.co/DangPhamPham/azure-camoufox
- Proyecto relacionado camofox-browser: https://github.com/jo-inc/camofox-browser
