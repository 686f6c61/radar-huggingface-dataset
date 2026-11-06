# imomzoda-dev/ZkFingerAgent

## Resumen

ZkFingerAgent no es un modelo de inteligencia artificial ni un modelo de lenguaje: es una utilidad de escritorio escrita en Python que actúa como puente local entre una página web y un lector de huellas USB de la marca ZKTeco. El repositorio se aloja en Hugging Face bajo el identificador `imomzoda-dev/ZkFingerAgent`, pero su contenido es una aplicación empaquetada con PyInstaller que expone una API HTTP en `localhost:8088` para que el navegador pueda solicitar la captura y el template de una huella dactilar a través de `libzkfp.dll`.

El problema que resuelve es concreto: los navegadores no tienen acceso directo a dispositivos USB, de modo que una aplicación web de control de acceso o fichaje no puede leer un escáner de huellas por sí misma. ZkFingerAgent se instala en el mismo equipo que el escáner, gestiona el SDK propietario de ZKTeco, captura la huella y devuelve al frontend un hash y un template listos para enviar al backend de la aplicación.

No se dispone de información sobre arquitectura de red neuronal, parámetros, contexto, cuantización ni idiomas, porque no se trata de un modelo entrenado. La ficha se completará con los datos técnicos disponibles del proyecto y se indicará explícitamente "no disponible" en los campos que no aplican.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una aplicación Python con servidor HTTP local) |
| Parámetros totales | no disponible (no aplica) |
| Parámetros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantización | no disponible (no aplica; distribución como ejecutable único PyInstaller) |
| Idiomas soportados | no disponible (la documentación está en ruso; la API no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no aplica; se distribuye `ZkFingerAgent.exe`) |

## Arquitectura y entrenamiento

El proyecto no implementa ningún transformer, MoE, SSM ni modelo híbrido. Su arquitectura es la de una aplicación de escritorio con un servidor HTTP embebido: un proceso Python 3.14 con interfaz gráfica basada en PySide6 (Qt 6) que se comunica con el SDK nativo de ZKTeco mediante `ctypes` (FFI sobre `libzkfp.dll`). El servidor escucha simultáneamente en `127.0.0.1` y `[::1]` para cubrir la resolución dual IPv4/IPv6 de `localhost` en el navegador.

No hay entrenamiento, dataset, RLHF ni DPO asociados. Las innovaciones técnicas que documenta el autor son de ingeniería de sistemas: detección de la arquitectura (32/64 bits) de la DLL mediante el encabezado PE, instalación integrada del SDK y del driver, registro de plantilla mediante la función `ZKFPM_DBMerge` a partir de tres capturas, monitorización de cambios USB a través de `cfgmgr32` de Windows (en lugar del SDK, que mantiene un listado de dispositivos obsoleto), almacenamiento del hash de contraseña con sal y PBKDF2, y endurecimiento de permisos NTFS sobre la carpeta de instalación para impedir la sustitución del ejecutable.

## Capacidades

- Captura de huellas dactilares desde un escáner USB ZKTeco y exposición del resultado como JSON a una página web local.
- Endpoint `GET /api/machine/id` para identificar el equipo.
- Endpoint `GET /api/fingerprint/scan` que devuelve `success`, `hash`, `template` y `length` (el ejemplo de la documentación muestra `length: 1134`).
- Endpoint `GET /api/health` con diagnóstico completo de escáner, SDK, direcciones de escucha y contador de peticiones.
- Respuesta `503` inmediata cuando el escáner no está conectado, sin esperar al timeout.
- Registro de plantilla de referencia combinando tres capturas.
- Visualización en vivo de la imagen capturada con animación de escaneo.
- Detección y reinstalación del SDK desde la propia interfaz, incluyendo selección de la DLL por arquitectura y despliegue del driver.
- Protección por contraseña de la interfaz de administración, con hash PBKDF2 y sal (la contraseña no se almacena).
- Ejecución en bandeja del sistema, autostart con Windows y registro de accesos de la página.
- Detección de cambios de conexión USB en aproximadamente un segundo y reapertura automática del dispositivo.
- Configuración redundante en disco del sistema con restauración automática si se elimina el archivo principal.
- Desinstalación completa desde la propia interfaz (ejecutable, configuraciones, carpeta en `C:\ProgramData` y entrada de autostart).
- No dispone de tool calling genérico, razonamiento multi-paso, capacidades multilingües de NLP ni modo de pensamiento, al no ser un modelo de lenguaje.

## Casos de uso

- Fichaje laboral en aplicaciones web: la página de entrada y salida llama a `GET /api/fingerprint/scan`, recibe el template y lo envía al backend para identificar al empleado. El agente evita instalar plugins o controles ActiveX en cada puesto.
- Control de acceso físico integrado en un panel web: el operador valida la identidad del visitante contra la base de datos corporativa antes de abrir una puerta, usando el hash devuelto por el agente como prueba biométrica.
- Autenticación de segundo factor en intranets: el frontend solicita la huella al agente local y la combina con usuario y contraseña, sin que el navegador tenga que gestionar drivers ni SDK propietarios.
- Sustitución de controles ActiveX heredados en aplicaciones empresariales: equipos que aún dependen de Internet Explorer pueden migrar a un flujo `fetch()` estándar contra `localhost:8088`, manteniendo el mismo hardware ZKTeco.
- Despliegue en kioscos de autoservicio: el agente se ejecuta en el equipo del kiosco, arranca con Windows y permanece en la bandeja; la aplicación web solo necesita apuntar a `localhost`.
- Diagnóstico remoto de flotas de lectores: el endpoint `/api/health` permite a un script de soporte comprobar SDK, driver, conexión USB y contador de peticiones de cada puesto sin intervención manual.
- Registro de nuevos usuarios en RRHH: la función de registro combina tres capturas en una plantilla de referencia que se almacena en el sistema central, reduciendo los falsos rechazos en la verificación posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 (el proyecto no declara soporte para Linux ni macOS).
- Escáneres compatibles según la documentación: ZK4500, ZK9500 y SLK20R.
- No requiere GPU; la carga es de CPU y E/S USB.
- VRAM estimada: no aplica.
- GPU recomendadas: no aplica.
- No cabe en el concepto de "consumer GPU": el requisito es un puerto USB disponible y permisos para instalar el driver del escáner.
- Despliegue: ejecutable único `ZkFingerAgent.exe` generado con PyInstaller; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma numérica; la documentación indica que la detección de cambios USB tarda aproximadamente un segundo y que la respuesta es inmediata (503) cuando no hay escáner.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada alternativas comparables de la misma categoría (puentes locales entre navegador y lectores ZKTeco).

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural ni admite prompts. Cualquier expectativa de uso como LLM es incorrecta.
- La licencia no está declarada en la información disponible; antes de un uso comercial o de redistribución debe verificarse en el repositorio de GitHub del autor.
- Depende de `libzkfp.dll`, un SDK propietario de ZKTeco cuyos términos de uso y redistribución son independientes del proyecto.
- Solo funciona en Windows 10/11 y con los modelos de escáner indicados; no hay soporte documentado para otros sistemas ni para otros lectores.
- El agente escucha en `localhost:8088` sin que la documentación mencione autenticación en la API HTTP: cualquier proceso local podría invocar los endpoints. La protección por contraseña descrita aplica a la interfaz de administración, no necesariamente a la API.
- La documentación está redactada en ruso, lo que puede dificultar el soporte a equipos no rusohablantes.
- El repositorio en Hugging Face registra 0 descargas y 0 likes, y no declara pipeline ni idiomas; la madurez y el mantenimiento del proyecto no pueden evaluarse con los datos disponibles.
- Al tratarse de biometría, su uso entraña obligaciones legales (RGPD en la UE) sobre consentimiento, almacenamiento y tratamiento de datos biométricos; el template devuelto debe protegerse adecuadamente en el backend.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/imomzoda-dev/ZkFingerAgent
- Repositorio en GitHub: https://github.com/imomzoda-dev/ZkFingerAgent
- Última release: https://github.com/imomzoda-dev/ZkFingerAgent/releases/latest
- Documentación de PySide6: https://doc.qt.io/qtforpython/
- Documentación de ctypes (Python): https://docs.python.org/3/library/ctypes.html
- PyInstaller: https://pyinstaller.org/
