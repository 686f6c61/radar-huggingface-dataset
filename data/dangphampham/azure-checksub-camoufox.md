# DangPhamPham/azure-checksub-camoufox

## Resumen
Este repositorio de HuggingFace, identificado como `DangPhamPham/azure-checksub-camoufox`, no contiene un modelo de inteligencia artificial, sino una herramienta de automatización escrita en Python. Su propósito es verificar el estado de suscripciones de Microsoft Azure, listar recursos y extraer información de facturación mediante el navegador antidetect Camoufox (una versión modificada de Firefox) y la librería Playwright. El autor, DangPhamPham, la presenta como una utilidad para gestionar múltiples cuentas de Azure de forma automatizada, con soporte para autenticación de dos factores (TOTP local o código por correo) y rotación de perfiles de navegador para evitar detección.

Dado que no se trata de un modelo de lenguaje, no existen arquitectura, parámetros, contexto ni cuantización. La herramienta se distribuye como código fuente, sin licencia especificada, y su uso implica interactuar con el portal web de Azure, lo que puede contravenir los términos de servicio de Microsoft. La ficha siguiente recoge la información disponible, adaptando la estructura estándar a este caso particular.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (herramienta de automatizacion, no modelo) |
| Parametros totales | no aplica |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (interfaz en vietnamita, segun la model card) |
| Licencia | no disponible |
| Formato de pesos | no aplica (codigo fuente Python) |

## Arquitectura y entrenamiento
No existe arquitectura de red neuronal ni proceso de entrenamiento. La herramienta se basa en un script Python que utiliza Playwright para controlar Camoufox, un navegador Firefox modificado y optimizado para automatizacion con perfil antidetect. El flujo principal consiste en iniciar sesion en portal.azure.com con credenciales proporcionadas por el usuario, capturar el token ARM (Azure Resource Manager) y consultar las suscripciones asociadas. Para cada cuenta, se crea un perfil de navegador temporal y una huella digital unica, lo que permite operar con multiples cuentas sin levantar sospechas. La autenticacion de dos factores se resuelve mediante codigos TOTP generados localmente con la libreria pyotp o mediante un servicio externo de codigos por correo (agapia.fr).

El codigo no incluye componentes de aprendizaje automatico ni modelos preentrenados. No se proporcionan datos de entrenamiento ni metricas de rendimiento.

## Capacidades
- Verificacion del estado de suscripciones de Azure: muestra si una suscripcion esta habilitada o deshabilitada.
- Listado de recursos dentro de cada suscripcion, incluyendo tipo de recurso, fecha de creacion y grupo de recursos.
- Consulta de informacion de facturacion: metodo de pago (ultimos 4 digitos y fecha de caducidad) y pais de venta (soldTo).
- Soporto para multiples cuentas: permite cargar un archivo de texto con credenciales en formato `mailchinh | password | secretTOTP` o variante con mailcode.
- Integracion con proxy: se pueden cargar proxies desde un archivo `.txt` para distribuir las conexiones.
- Generacion de perfiles de navegador temporales y unicos por cuenta, con rotacion de huellas digitales.
- Autenticacion de dos factores mediante TOTP local o codigo por correo.
- Interfaz grafica sencilla (GUI) para cargar cuentas y ejecutar la verificacion.
- Escritura de resultados en archivos de texto organizados por fecha y cuenta, sin imprimir datos sensibles en consola.

## Casos de uso
- Auditoria interna de suscripciones de Azure: una empresa puede usar la herramienta para comprobar rapidamente el estado y los recursos de multiples cuentas de su organizacion, ahorrando tiempo frente a la consola web.
- Gestion de multiples cuentas de desarrollo: desarrolladores con varias suscripciones de Azure (por ejemplo, para distintos clientes) pueden centralizar la consulta de recursos y facturacion.
- Verificacion de credenciales y acceso: antes de adquirir o transferir una cuenta, se puede comprobar si las credenciales son validas y que suscripciones incluye.
- Control de facturacion: consultar el metodo de pago asociado a cada suscripcion para detectar tarjetas caducadas o incorrectas.
- Migracion de recursos: al listar los recursos con su fecha de creacion, se puede planificar la migracion o limpieza de recursos antiguos.
- Integracion en flujos de automatizacion: al ser un script Python, puede adaptarse para ejecutarse en entornos CI/CD y generar informes periodicos del estado de las suscripciones.

Es importante resaltar que el uso de esta herramienta con cuentas de terceros sin autorizacion podria violar los terminos de servicio de Microsoft Azure y las leyes de proteccion de datos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de IA, no existen metricas de calidad de generacion, razonamiento o codigo.

## Requisitos de hardware
- Sistema operativo: Windows 10 u 11 (segun la model card).
- Python 3.x instalado (el script `setup-checksub-camoufox.bat` instala las dependencias automaticamente).
- Dependencias: Playwright, Camoufox (binario del navegador), pyotp, y otras librerias estandar.
- Memoria RAM: al ejecutar multiples instancias de Camoufox, se recomienda minimo 8 GB para operar con varias cuentas simultaneas.
- Almacenamiento: unos 500 MB para el navegador y las dependencias.
- GPU: no requerida.
- Despliegue: se ejecuta localmente como aplicacion de escritorio. No se proporcionan opciones de despliegue en servidor, aunque podria adaptarse para ejecucion headless en Linux.

## Comparativa con modelos similares
No disponible. No existen modelos comparables porque no se trata de un modelo de IA. En el ambito de herramientas de automatizacion de navegador, alternativas como Selenium o Puppeteer podrian realizar tareas similares, pero no son modelos y su comparativa no aplica a esta ficha.

## Limitaciones y advertencias
- No es un modelo de IA: no ofrece capacidades de generacion de texto, razonamiento ni comprension del lenguaje.
- Riesgo de violacion de terminos de servicio: automatizar el acceso al portal de Azure con multiples cuentas puede contravenir las politicas de Microsoft y provocar el bloqueo de las cuentas.
- Riesgo de seguridad: la herramienta almacena credenciales y secretos TOTP en archivos de texto plano (`accounts.txt`), lo que supone un riesgo si el sistema se ve comprometido.
- Dependencia de cambios en el portal de Azure: cualquier modificacion en la estructura del portal web puede romper la funcionalidad del script.
- Idioma: la interfaz y los mensajes de la herramienta estan en vietnamita, lo que puede dificultar su uso para hablantes de otros idiomas.
- Sin soporte oficial: no hay documentacion tecnica mas alla de la model card, ni canal de soporte.
- Licencia no especificada: no se indica bajo que licencia se distribuye el codigo, lo que genera incertidumbre legal sobre su uso y modificacion.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/DangPhamPham/azure-checksub-camoufox
- Camoufox (navegador antidetect): https://camoufox.com/
- Proyecto relacionado CamoFox MCP (servidor de automatizacion): https://github.com/redf0x1/camofox-mcp
- Catalogo de modelos de Microsoft Foundry (contexto de Azure AI): https://ai.azure.com/catalog
- Checksub (herramienta de subtitulos, sin relacion directa): https://www.checksub.com/
