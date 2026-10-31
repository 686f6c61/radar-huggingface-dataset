# lerobot-omx/omx-setup

## Resumen
`lerobot-omx/omx-setup` no es un modelo de inteligencia artificial en el sentido habitual, sino un repositorio de recursos publicado en Hugging Face bajo la organización `lerobot-omx`. Su contenido principal es una guía de resolución de problemas (troubleshooting) para los motores Dynamixel del brazo robótico ROBOTIS OpenManipulator-X cuando se utiliza junto con la librería LeRobot para aprendizaje por imitación. El repositorio incluye scripts de diagnóstico basados en `dynamixel-sdk`, un parche (`omx_patches.diff`) para el código fuente de LeRobot y archivos de calibración listos para usar.

La relevancia de este recurso radica en que documenta, con valores medidos en un robot real, cómo resolver el problema de sobrecarga (Overload, error 32) en la pinza del seguidor (ID 16), un fallo frecuente en montajes de teleoperación y recopilación de datos para imitación learning. Incluye límites de corriente, ganancias de posición y rangos de movimiento concretos, además de una guía estructurada por síntomas para diagnosticar sobrecalentamiento, descalibración y desincronización entre brazo líder y brazo seguidor.

Al no tratarse de un modelo entrenado, no existen especificaciones como arquitectura, parámetros, longitud de contexto o benchmarks. La ficha que sigue describe el repositorio tal cual, indicando explícitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un repositorio de recursos de robótica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la documentación está escrita en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (contiene `omx_patches.diff`, `omx_calibration.tar.gz` y scripts Python) |

## Arquitectura y entrenamiento
No aplica: el repositorio no contiene ningún modelo entrenado ni datos de entrenamiento. Se trata de material técnico de soporte para el ecosistema LeRobot (la librería de robótica de Hugging Face) aplicado al manipulador OpenManipulator-X de ROBOTIS, que emplea servos Dynamixel con el protocolo Dynamixel Protocol 2.0.

El contenido técnico principal incluye:

- `motor_status.py`: script de diagnóstico que recorre los puertos serie (`/dev/ttyUSB*`, `/dev/ttyACM*`), hace ping a los motores (IDs 1-30) y lee posición, corriente, temperatura, estado de torque y registro de errores.
- Script de limpieza de errores y apagado de torque (reboot de motores con error activo y `Torque_Enable = 0`).
- `omx_patches.diff`: parche aplicable con `git apply` sobre el código fuente de LeRobot.
- `omx_calibration.tar.gz` y `omx_calibration/`: copia completa del directorio `~/.cache/huggingface/lerobot/calibration`.

Los valores clave documentados para la pinza seguidora (ID 16) son: `Current_Limit` 600, `Goal_Current` 100 (200 en movimiento), ganancias de posición P 800 / I 0 / D 0, rango de movimiento 2123-2873 y la opción de línea de comandos `--teleop.gripper_open_pos=95`.

## Capacidades
Al no ser un modelo de IA, no posee capacidades de generación de texto, razonamiento, código generativo ni soporte de tool calling. Sus funcionalidades prácticas son:

- Diagnóstico del estado de motores Dynamixel (posición, corriente, temperatura, torque, errores) en todos los puertos serie conectados.
- Limpieza explícita de errores de motor (Overload, Overheating, InputVoltage, EncoderError, ElectricalShock) mediante reboot y desactivación de torque.
- Resolución guiada del error 32 (Overload) recurrente en la pinza del brazo seguidor.
- Medición y calibración del rango de movimiento real de las articulaciones.
- Sincronización de posturas entre brazo líder (leader arm) y brazo seguidor (follower arm) en montajes de teleoperación LeRobot.
- Ajuste del control de velocidad del bucle de control y configuración de cámaras en LeRobot.
- Parches y calibraciones reutilizables para acelerar la puesta en marcha de prácticas de aprendizaje por imitación con OpenManipulator-X.

## Casos de uso
- **Puesta en marcha de OpenManipulator-X con LeRobot**: un desarrollador que monta el brazo por primera vez puede usar `motor_status.py` para verificar que los 12 motores responden correctamente antes de intentar cualquier teleoperación.
- **Resolución de sobrecarga en la pinza**: cuando el motor ID 16 entra en Overload (error 32) de forma repetida, la guía indica cómo ajustar `Current_Limit`, `Goal_Current` y las ganancias de posición con valores probados en un robot real.
- **Motores sobrecalentados en reposo**: si un motor se calienta sin ejecutar nada (síntoma típico tras un cierre anómalo del programa de control), el script de limpieza de errores apaga el torque de todos los motores de forma segura.
- **Calibración de rango de movimiento**: tras apretar tornillos o modificar el montaje mecánico, la guía explica cómo medir el rango real de cada articulación y reflejarlo en la configuración.
- **Alineación de brazo líder y seguidor en teleoperación**: para recopilar datos de demostraciones de calidad en aprendizaje por imitación, la sección 4 resuelve las discrepancias de postura entre ambos brazos y la apertura insuficiente de la pinza seguidora.
- **Depuración del bucle de control**: diagnóstico de lentitud en el bucle de teleoperación, opciones de línea de comandos ignoradas y problemas de configuración de cámaras en LeRobot.
- **Referencia de valores medidos**: la sección 6 sirve como punto de partida para comparar las lecturas de corriente, temperatura y posición de un montaje propio frente a las de un robot de referencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de IA, no aplica evaluación tipo MMLU, HumanEval o GSM8K. El único dato de rendimiento implícito es la configuración de control documentada (ganancias P 800 / I 0 / D 0 y límites de corriente), orientada a estabilidad del servo y no a métricas de inferencia.

## Requisitos de hardware
- **Robot**: ROBOTIS OpenManipulator-X con servos Dynamixel (modelos 1060 y 1200 mencionados en los ejemplos de salida) y, opcionalmente, un brazo líder para teleoperación.
- **Conectividad**: interfaz U2D2 o equivalente expuesta como puerto serie USB (`/dev/ttyUSB*` o `/dev/ttyACM*` en Linux) a 1.000.000 de baudios.
- **Sistema**: Linux (los scripts usan rutas de dispositivo y grupos de permisos tipo `dialout` propios de GNU/Linux).
- **Software**: Python con el paquete `dynamixel-sdk` (`pip install dynamixel-sdk`) y la librería LeRobot para las secciones 4 y 5.
- **GPU/VRAM**: no disponible y no aplicable; el repositorio no incluye modelos que requieran aceleración por GPU. Si se usa LeRobot para entrenar políticas de imitación, los requisitos de GPU dependerán del modelo de política elegido, no de este repositorio.
- **Despliegue**: no disponible en el sentido de servidores de inferencia (vLLM, llama.cpp, etc.); el uso es local, ejecutando los scripts Python directamente en el equipo conectado al robot.

## Comparativa con modelos similares
Al tratarse de un repositorio de recursos de robótica y no de un modelo, la comparativa con modelos de lenguaje o multimodales no es aplicable. Recursos relacionados en el mismo ámbito:

| Recurso | Tipo | Contenido | Licencia |
|---|---|---|---|
| lerobot-omx/omx-setup | Guía de troubleshooting + parches + calibración | Diagnóstico Dynamixel, solución de Overload en pinza, calibración LeRobot | Apache 2.0 |
| Documentación oficial de ROBOTIS OpenManipulator-X | Documentación del fabricante | Especificaciones, montaje y uso del manipulador | no disponible |
| Librería LeRobot (HuggingFace) | Librería de robótica | Entrenamiento y despliegue de políticas de imitación learning | Apache 2.0 |

## Limitaciones y advertencias
- **No es un modelo de IA**: quien llegue buscando un modelo descargable no encontrará pesos ni capacidades de inferencia.
- **Idioma**: la documentación está escrita en coreano, lo que puede dificultar su uso a desarrolladores que no lean dicho idioma; los scripts, en cambio, son directamente ejecutables.
- **Valores específicos de un robot concreto**: el propio autor advierte que los números del repositorio (límites de corriente, ganancias, rangos) son mediciones de su unidad y recomienda repetir el procedimiento de medición en el robot propio en lugar de copiarlos tal cual.
- **Riesgo de hardware**: los scripts escriben en la EEPROM de los motores y ejecutan reboots; un uso incorrecto puede alterar la configuración de los servos. Tras un reboot, las ganancias y límites de corriente vuelven a valores de fábrica.
- **Dependencia de plataforma**: los scripts asumen Linux y rutas de dispositivo `/dev/ttyUSB*` o `/dev/ttyACM*`; en otros sistemas operativos habrá que adaptarlos.
- **Contexto limitado**: las secciones 1 a 3 aplican a cualquier entorno con Dynamixel Protocol 2.0, pero las secciones 4 y 5 son específicas de LeRobot.
- **Licencia**: Apache 2.0 permite uso comercial, modificación y redistribución con conservación del aviso de licencia; sin restricciones relevantes para producción.
- **Madurez**: con 0 descargas y 1 like en el momento de la ficha, se trata de un recurso de comunidad sin adopción contrastada ni mantenimiento garantizado.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/lerobot-omx/omx-setup
- No se han encontrado enlaces adicionales (paper, blog, demo o repositorio externo) en la informacion disponible.
