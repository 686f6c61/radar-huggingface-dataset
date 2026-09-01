# DangPhamPham/azure-camoufox-totp

## Resumen

El repositorio `DangPhamPham/azure-camoufox-totp` no contiene un modelo de inteligencia artificial, sino una herramienta de automatización diseñada para gestionar cuentas de Microsoft Azure de forma masiva y semi-automatizada. El autor, DangPhamPham, ha desarrollado un script en Python con interfaz gráfica que utiliza el navegador anti-detección Camoufox (una versión modificada de Firefox optimizada para automatización y evasión de detección) para iniciar sesión en el portal de Azure, verificar el estado de suscripciones, listar recursos y consultar información de facturación.

La herramienta genera códigos TOTP (autenticación de dos factores) localmente mediante la librería `pyotp`, a partir de secretos almacenados en un archivo de texto, y soporta un flujo de verificación alternativo mediante códigos de correo electrónico (dominio `agapia.fr`). Está pensada para ejecutarse en Windows 10/11 e incluye un instalador por lotes (`setup-camoufox-totp.bat`) que automatiza la instalación de dependencias y la descarga del binario del navegador.

El proyecto es relevante en el contexto de la gestión de identidades digitales y la automatización de procesos de verificación de cuentas, aunque su diseño para operar con múltiples cuentas y perfiles temporales plantea serias dudas sobre su uso legítimo. No se trata de un modelo de IA, por lo que las secciones relativas a arquitectura, entrenamiento o rendimiento de modelos no son aplicables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (herramienta de automatización, no un modelo de IA) |
| Parametros totales | No aplica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (interfaz en vietnamita, según la documentación) |
| Licencia | No disponible |
| Formato de pesos | No aplica (código fuente Python, sin pesos de modelo) |

## Arquitectura y entrenamiento

El proyecto no sigue una arquitectura de modelo de lenguaje ni ha sido entrenado con datos. Se trata de un programa Python que integra varias librerías: `pyotp` para la generación de códigos TOTP, `camoufox` (un navegador Firefox modificado) y `Playwright` para la automatización del navegador. La herramienta crea perfiles de navegador temporales e independientes para cada cuenta, con el objetivo de no dejar rastros en el disco. El flujo de trabajo consiste en leer cuentas desde un archivo `accounts.txt` con el formato `mailchinh | password | secretTOTP`, iniciar sesión en `portal.azure.com` y procesar cada paso de la autenticación (contraseña, selección de método, código TOTP o código de correo) de forma secuencial. El autor no proporciona información sobre un proceso de entrenamiento, ya que no existe tal proceso.

## Capacidades

- Automatización de inicio de sesión en el portal de Azure para múltiples cuentas.
- Generación local de códigos TOTP mediante `pyotp` a partir de secretos almacenados.
- Soporte de verificación alternativa mediante códigos de correo electrónico (solo dominio `agapia.fr`).
- Detección y procesamiento de los pasos de autenticación de forma adaptativa (auto, TOTP o mailcode).
- Enumeración de suscripciones de Azure (estado habilitado/deshabilitado).
- Listado de recursos por tipo y fecha de creación, así como grupo de recursos.
- Consulta de información de facturación: método de pago (últimos 4 dígitos y fecha de caducidad) y país de venta (soldTo).
- Ejecución en modo incógnito con perfiles temporales y limpieza de caché al finalizar.
- Interfaz gráfica con botón para eliminar perfiles residuales.

## Casos de uso

- **Gestión de múltiples cuentas de Azure para administradores de TI**: la herramienta permite verificar rápidamente el estado de suscripciones y recursos en un gran número de cuentas, algo útil en entornos empresariales con muchos contratos.
- **Auditoría de facturación**: consulta los métodos de pago y datos de venta de las cuentas, lo que facilita la conciliación de costes y la detección de facturación incorrecta.
- **Automatización de la verificación de accesos**: al gestionar el flujo de autenticación con TOTP, reduce la intervención manual en procesos de revisión periódica de cuentas.
- **Migración de recursos entre suscripciones**: al listar recursos con su fecha de creación, ayuda a planificar migraciones o consolidaciones de infraestructura.
- **Monitoreo de cumplimiento**: permite comprobar de forma masiva si las suscripciones están habilitadas o deshabilitadas, útil para detectar cuentas inactivas o canceladas.
- **Soporte técnico de proveedores de servicios gestionados**: los MSP pueden usar esta herramienta para revisar el estado de las cuentas de sus clientes sin necesidad de acceder manualmente a cada portal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de IA, no existen métricas de rendimiento como MMLU, HumanEval o GSM8K. El rendimiento de la herramienta depende de la velocidad de la red, la latencia del portal de Azure y la potencia de la máquina que ejecuta el script.

## Requisitos de hardware

- **VRAM**: no aplica, ya que no se ejecuta un modelo de IA.
- **CPU**: suficiente con un procesador moderno de gama media (se recomienda al menos 4 núcleos).
- **RAM**: mínimo 4 GB, recomendable 8 GB para ejecutar el navegador Camoufox junto con la interfaz gráfica.
- **GPU**: no necesaria.
- **Almacenamiento**: unos 500 MB para el navegador y las dependencias.
- **Sistema operativo**: Windows 10 u 11 (según la documentación).
- **Opciones de despliegue**: ejecución local mediante el script `setup-camoufox-totp.bat`; no se mencionan opciones de servidor.

## Comparativa con modelos similares

No disponible. Esta herramienta no tiene equivalente en el ámbito de modelos de IA, y no se dispone de información sobre otras herramientas de automatización similares en el repositorio.

## Limitaciones y advertencias

- **No es un modelo de IA**: cualquier uso que requiera capacidades de lenguaje o razonamiento no es aplicable.
- **Riesgos legales y éticos**: la herramienta está diseñada para operar con múltiples cuentas de Azure de forma automatizada, lo que puede violar los términos de servicio de Microsoft si se utiliza para actividades fraudulentas, evasión de detección o gestión no autorizada de cuentas de terceros.
- **Sesgos y alucinaciones**: no aplica al no ser un modelo generativo.
- **Seguridad de credenciales**: el almacenamiento de contraseñas y secretos TOTP en archivos de texto plano (`accounts.txt`) supone un grave riesgo de seguridad si el sistema se ve comprometido.
- **Dependencia de servicios externos**: el flujo de verificación por correo depende de un dominio específico (`agapia.fr`), cuya disponibilidad no está garantizada.
- **Falta de soporte**: el autor no ofrece documentación oficial ni canales de soporte; el código puede contener errores no documentados.
- **Restricciones de licencia**: no se especifica ninguna licencia, lo que implica que el uso, modificación y distribución del código carece de marco legal claro.

## Enlaces

- Repositorio en Hugging Face: [DangPhamPham/azure-camoufox-totp](https://huggingface.co/DangPhamPham/azure-camoufox-totp)
- Perfil del autor en Hugging Face: [DangPhamPham](https://huggingface.co/DangPhamPham/models)
- Sitio oficial de Camoufox: [https://camoufox.com/](https://camoufox.com/)
- Repositorio de Camoufox en GitHub: [https://github.com/daijro/camoufox](https://github.com/daijro/camoufox)
- Documentación de desarrollo de Camoufox: [https://camoufox.com/development/](https://camoufox.com/development/)
