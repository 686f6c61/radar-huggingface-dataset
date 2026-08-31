# DangPhamPham/azure-bitbrowser-totp

## Resumen

El repositorio `DangPhamPham/azure-bitbrowser-totp` no contiene un modelo de inteligencia artificial, sino un script de automatización desarrollado por DangPhamPham. Su propósito es generar códigos TOTP (Time-based One-Time Password) de forma local mediante la librería `pyotp`, a partir de secretos almacenados en un archivo de cuentas, y utilizarlos para iniciar sesión en múltiples cuentas de Azure a través del navegador BitBrowser. Además, el script automatiza el despliegue de un modelo denominado FW-Kimi-K3 en Microsoft Foundry.

La relevancia de esta herramienta radica en que facilita la gestión de múltiples cuentas de Azure y el despliegue de modelos de IA en la plataforma Foundry, sin necesidad de leer correos electrónicos para obtener códigos de verificación. No obstante, al no tratarse de un modelo de IA, las especificaciones técnicas habituales (arquitectura, parámetros, contexto, etc.) no son aplicables. La información disponible es escasa y no se han publicado detalles sobre licencia, idiomas o pipeline.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (script Python, no pesos) |

## Arquitectura y entrenamiento

No aplica. Este repositorio contiene un script de automatización en Python, no un modelo entrenado. No hay arquitectura neuronal, datos de entrenamiento ni procesos de RLHF/DPO. La funcionalidad principal se basa en la generación de códigos TOTP mediante la librería `pyotp` y la interacción con BitBrowser para el login automatizado en Azure.

## Capacidades

- Generación local de códigos TOTP a partir de secretos de aplicaciones autenticadoras.
- Automatización de inicio de sesión en múltiples cuentas de Azure mediante BitBrowser.
- Despliegue automático del modelo FW-Kimi-K3 en Microsoft Foundry.
- Gestión de archivos de configuración: `accounts.txt` (con secretos TOTP), `proxies.txt` y directorio `ket_qua/`.
- Instalación automática de dependencias (Python, pyotp) y actualización del script mediante un archivo `.bat`.

## Casos de uso

- Gestión de múltiples cuentas de Azure: el script permite mantener sesiones activas en varias cuentas sin intervención manual, generando los códigos TOTP localmente y evitando la lectura de correos.
- Despliegue automatizado de modelos en Microsoft Foundry: facilita la publicación de modelos como FW-Kimi-K3 en la plataforma, reduciendo el tiempo de configuración.
- Automatización de tareas repetitivas en entornos con muchas cuentas: útil para administradores que manejan decenas de suscripciones de Azure.
- Integración en pipelines de CI/CD: el script puede ejecutarse en un VPS Windows para desplegar modelos de forma programática.
- Pruebas de autenticación multifactor: sirve como herramienta de verificación para entornos que requieren TOTP.
- Sincronización de proxies y cuentas: el archivo `proxies.txt` permite rotar direcciones IP, útil para evitar bloqueos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no ser un modelo de IA, no existen métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Sistema operativo: Windows 10 Pro (VPS recomendado).
- Python instalado (el script lo instala automáticamente si falta).
- Dependencias: `pyotp` y otras librerías necesarias para BitBrowser.
- Almacenamiento mínimo para archivos de configuración y resultados.
- No requiere GPU ni hardware especializado, ya que no realiza inferencia de modelos.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, por lo que no se puede comparar con alternativas como LLMs o modelos de visión. Si se interpreta como una herramienta de automatización, no hay referencias comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no ofrece capacidades de generación de texto, razonamiento o procesamiento de lenguaje natural.
- Riesgo de seguridad: el archivo `accounts.txt` contiene secretos TOTP en texto plano; si se expone, compromete las cuentas asociadas.
- Dependencia de BitBrowser: el script requiere que BitBrowser esté instalado y configurado correctamente.
- Uso no documentado: la model card está en vietnamita y no se especifican detalles de licencia ni términos de uso.
- Posible violación de términos de servicio: automatizar el login en Azure puede contravenir las políticas de Microsoft si se realiza sin autorización.
- Sin soporte oficial: el autor no proporciona garantías ni mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DangPhamPham/azure-bitbrowser-totp
- Perfil del autor: https://huggingface.co/DangPhamPham
- Microsoft Foundry Models (referencia): https://learn.microsoft.com/en-us/azure/foundry/concepts/foundry-models-overview
- Azure OpenAI Model Regional Availability: https://model-availability.azurewebsites.net/
