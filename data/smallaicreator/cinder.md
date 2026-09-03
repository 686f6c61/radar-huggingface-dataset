# SmallAICreator/cinder

## Resumen

Cinder no es un modelo de inteligencia artificial, sino una aplicación móvil para Android que actúa como cliente del CLI oficial de Claude Code de Anthropic. Desarrollada por SmallAICreator, la aplicación permite ejecutar el binario real de `claude` dentro de un sandbox Linux autocontenido (proot + Alpine rootfs) directamente en un teléfono, sin necesidad de root ni de un servidor remoto. La interfaz está construida con Jetpack Compose y renderiza la salida del CLI como un transcripto de chat con tarjetas de herramientas, diffs y un canvas de código.

La relevancia de este proyecto radica en que resuelve el problema de ejecutar una herramienta de desarrollo de línea de comandos diseñada para escritorio en un dispositivo móvil, manteniendo la autenticación OAuth del propio CLI y descargando el binario en tiempo de ejecución desde los servidores de Anthropic. No se trata de una reimplementación ni de un wrapper web, sino de una infraestructura de sandboxing que permite que el binario oficial funcione en Android. La aplicación es de código abierto con licencia MIT, aunque no está disponible en Google Play y requiere instalación manual (sideload) para arquitectura arm64-v8a.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion Android (Jetpack Compose) + sandbox Linux (proot + Alpine rootfs) |
| Parametros totales | no aplica (no es un modelo de IA) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (depende del modelo de Claude Code) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (la interfaz esta en ingles, el CLI de Claude Code soporta varios idiomas) |
| Licencia | MIT |
| Formato de pesos | no aplica (APK Android, binario `claude` descargado en runtime) |

## Arquitectura y entrenamiento

No existe un modelo de lenguaje entrenado en este repositorio. La arquitectura de Cinder se compone de cinco capas principales: una interfaz de usuario en Jetpack Compose que muestra el transcripto, tarjetas de herramientas y diffs; un puente que invoca el CLI con `claude --print --input-format stream-json --output-format stream-json` y una PTY JNI para flujos interactivos; un sandbox basado en proot con una rootfs Alpine de 4 MB (musl, aarch64) en almacenamiento privado de la app; el motor que es el binario oficial de Anthropic descargado en tiempo de ejecución; y la autenticación mediante el OAuth propio del CLI, sin almacenar claves API.

El desarrollo implicó resolver cinco problemas técnicos documentados en la model card: el binario de Claude Code está enlazado dinámicamente contra musl, lo que requiere proot con Alpine; el `targetSdk` se fijó en 28 deliberadamente porque Android impide ejecutar binarios desde el directorio de datos de la app en API 29+; aapt renombra silenciosamente los assets `.gz`, lo que se solucionó usando `.tgz` con `noCompress`; el login requiere una terminal real, resuelto con una librería JNI de forkpty; y la falta de SysV IPC en Android obligó a ejecutar apk bajo un proot anidado con `-0` para simular root de usuario.

## Capacidades

- Ejecuta el CLI oficial de Claude Code en Android, no una reimplementación ni un shell remoto.
- Transcripto de chat con tarjetas de herramientas, diffs de edición y resultados plegables.
- Canvas de código: los bloques de código se renderizan como paneles desplazables con botón de copiado.
- Estado de archivos en vivo por operación: muestra líneas escritas, editadas, añadidas o eliminadas.
- Marcadores de razonamiento cuando el modelo piensa.
- Inicio de sesión con cuenta de Anthropic mediante `/login` en el chat, usando OAuth del CLI sobre una PTY real.
- Historial de sesiones en un cajón lateral, con reanudación mediante `--resume`.
- Selector de modelo en vivo que consulta `/v1/models` con la credencial OAuth almacenada.
- Terminal integrada, subida de archivos y descarga con un toque de los archivos generados.
- Limpieza del espacio de trabajo con un solo toque, sin reinstalar el CLI ni la rootfs.
- Gestión de paquetes sin root: `apk add`, `npm -g`, `pip install`, además de herramientas de compilación y descompilación de APK.

## Casos de uso

- Desarrollo de código en movilidad: un desarrollador puede editar, ejecutar y depurar proyectos directamente en su teléfono usando el agente de Claude Code, con la ventaja de que el binario es el oficial y el contexto se mantiene en el dispositivo.
- Revisión de código y generación de parches: el transcripto con diffs y el canvas de código permiten revisar cambios propuestos por el agente y aplicarlos o descartarlos con precisión.
- Automatización de tareas de mantenimiento: el agente puede ejecutar comandos de shell, instalar paquetes Alpine, módulos npm o librerías Python dentro del sandbox, lo que permite automatizar tareas repetitivas en un entorno aislado.
- Aprendizaje y experimentación con Claude Code: los usuarios pueden probar el CLI de Anthropic sin necesidad de un ordenador, explorando sus capacidades de agente, tool calling y razonamiento multi-paso desde un dispositivo Android.
- Gestión de sesiones de trabajo: el historial de sesiones y la reanudación con `--resume` permiten retomar conversaciones largas con contexto completo, útil para proyectos que se trabajan de forma intermitente.
- Entorno de pruebas para desarrollo Android: el sandbox incluye herramientas de compilación de APK (aapt2, d8, apksigner, ecj) y descompilación (apktool, jadx), lo que permite analizar o construir APKs directamente en el teléfono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de IA, no existen métricas de MMLU, HumanEval o GSM8K. El rendimiento depende del modelo de Claude Code seleccionado y de la capacidad del dispositivo Android.

## Requisitos de hardware

- Dispositivo Android con arquitectura arm64-v8a (no compatible con x86 o ARM de 32 bits).
- Android 9 (API 28) como objetivo, aunque puede funcionar en versiones superiores con sideload.
- Almacenamiento suficiente para la rootfs Alpine (4 MB) más el binario de Claude Code (aproximadamente 250 MB) y el espacio de trabajo.
- RAM recomendada: al menos 4 GB para ejecutar el CLI y el modelo de forma fluida; 6 GB o más para proyectos grandes.
- No requiere root, bootloader desbloqueado ni kernel modificado; proot usa fake root en espacio de usuario.
- Opciones de despliegue: instalación manual del APK (sideload); no está en Google Play.
- El rendimiento de inferencia depende del modelo de Claude Code y de la conexión a internet, ya que el CLI se comunica con los servidores de Anthropic.

## Comparativa con modelos similares

No aplica directamente, ya que Cinder no es un modelo. Como alternativa para ejecutar Claude Code en Android, se puede comparar con:

| Alternativa | Descripcion | Ventajas | Limitaciones |
|---|---|---|---|
| Termux | Emulador de terminal Linux para Android | Permite instalar Node.js y ejecutar `claude` manualmente | Requiere configuración manual, no tiene UI de transcripto ni sandbox integrado |
| Clientes web de Claude | Acceso via navegador | Sin instalacion, funciona en cualquier dispositivo | No ejecuta el CLI local, dependencia total de la web |
| Cinder | App dedicada con sandbox y UI | Binario oficial, sandbox aislado, UI completa, sesiones persistentes | Solo arm64, sideload, targetSdk 28 |

## Limitaciones y advertencias

- No es un modelo de IA: no contiene ningún peso ni arquitectura de red neuronal; es una aplicación cliente.
- No está afiliado ni respaldado por Anthropic; es un proyecto no oficial.
- Solo se puede instalar mediante sideload; no está disponible en Google Play debido al `targetSdk` 28, que es un requisito técnico para ejecutar binarios desde el directorio de datos.
- El binario de Claude Code se descarga en tiempo de ejecución desde los servidores de Anthropic, por lo que requiere conexión a internet y una cuenta de Anthropic con los permisos correspondientes.
- La autenticación se realiza mediante OAuth del propio CLI; no se almacenan claves API, pero el usuario debe iniciar sesión con su cuenta.
- El sandbox usa proot con fake root; no es un aislamiento de seguridad a nivel de kernel y no debe usarse para ejecutar código no confiable.
- La instalación de paquetes Alpine puede fallar en la escritura final de la base de datos debido a la falta de SysV IPC en Android; el fallo es cosmético y se filtra de la salida.
- El rendimiento depende del hardware del dispositivo y de la latencia de red; no se garantiza una experiencia fluida en dispositivos de gama baja.
- La licencia MIT cubre el código de la aplicación, pero el binario de Claude Code y el acceso a los modelos de Anthropic están sujetos a los términos de servicio de Anthropic.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SmallAICreator/cinder
- Sitio de Cinder (empresa de trust and safety, no relacionada): https://cinder.ai/
- Modelo TinyLlama-3T-Cinder-v1.2 (otro proyecto con nombre similar, no relacionado): https://huggingface.co/Josephgflowers/TinyLlama-3T-Cinder-v1.2
