# HerRei/train-tui

## Resumen

train-tui no es un modelo de inteligencia artificial, sino una herramienta de terminal (TUI) ligera y sin dependencias para monitorizar ejecuciones de entrenamiento de modelos de deep learning. Desarrollada por HerRei, está escrita íntegramente en C puro, sin ncurses, sin Python y sin librerías externas, utilizando únicamente códigos de escape ANSI y lecturas de sysfs o nvidia-smi. Su propósito es ofrecer un panel en tiempo real del progreso de un entrenamiento, mostrando métricas, estado de GPU y ficheros de log, sin interferir con el proceso.

La herramienta soporta perfiles para frameworks populares como BasicSR, PyTorch Lightning y HuggingFace Trainer, así como perfiles personalizados mediante ficheros clave=valor. Incluye detección automática de backends GPU (AMD, NVIDIA o CPU) y es de solo lectura, garantizando que nunca escribe ni modifica los ficheros del entrenamiento. Su relevancia actual radica en la creciente necesidad de monitorizar entrenamientos de forma eficiente en entornos de desarrollo e investigación, donde una solución minimalista y portable resulta muy práctica.

Aunque se publica en HuggingFace, su naturaleza es de utilidad de desarrollo, no de modelo de pesos. La ficha siguiente describe sus características técnicas y casos de uso, adaptando la estructura habitual de fichas de modelos a esta herramienta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion TUI en C puro (sin librerias externas) |
| Parametros totales | no disponible (no es un modelo de IA) |
| Parametros activos | no disponible (no es un modelo de IA) |
| Longitud de contexto | no disponible (no es un modelo de IA) |
| Tipos de cuantizacion | no disponible (no es un modelo de IA) |
| Idiomas soportados | no disponible (interfaz en ingles, mensajes en ingles) |
| Licencia | MIT (segun el README del repositorio) |
| Formato de pesos | no disponible (no aplica, es codigo fuente en C) |

## Arquitectura y entrenamiento

No aplica el concepto de arquitectura de red neuronal ni de entrenamiento de modelo. train-tui es una aplicacion de terminal escrita en C que se compila con gcc o clang en Linux. Su diseño se basa en un bucle de lectura que consulta periódicamente el fichero de log del entrenamiento, el fichero de configuración (si existe) y las estadísticas de GPU a través de sysfs (para AMD) o nvidia-smi (para NVIDIA). La interfaz se renderiza mediante secuencias de escape ANSI, lo que permite dibujar paneles y actualizar información sin necesidad de bibliotecas adicionales.

La herramienta incorpora perfiles de parseo para frameworks concretos: `basicsr` (BasicSR, Real-ESRGAN, HAT, SwinIR), `lightning` (PyTorch Lightning) y `hf` (HuggingFace Trainer). También admite perfiles personalizados mediante un fichero `key=value` que define los patrones de extracción de métricas. El backend de GPU se auto-detecta, pudiendo forzarse con la opción `-g`. No existe un proceso de entrenamiento de la propia herramienta; se trata de una utilidad de desarrollo.

## Capacidades

- Monitorización en tiempo real de métricas de entrenamiento (loss, accuracy, iteraciones, etc.) a partir del log del framework.
- Visualización del estado de GPUs: uso de memoria, temperatura, potencia, etc., mediante sysfs (AMD) o nvidia-smi (NVIDIA).
- Soporte multi-GPU: puede mostrar estadísticas de varias GPUs simultáneamente.
- Perfiles integrados para BasicSR, PyTorch Lightning y HuggingFace Trainer, con extracción automática de métricas.
- Perfil personalizado mediante fichero de configuración `key=value` para cualquier framework.
- Detección automática del backend GPU (AMD, NVIDIA, CPU) con opción de forzado manual.
- Interfaz de solo lectura: no escribe ni modifica ficheros del entrenamiento, ni envía señales a los procesos.
- Ligereza extrema: sin dependencias externas, compilable con gcc o clang en Linux.
- Interfaz de teclado simple: tecla `q` para salir.
- Demo en línea disponible en el repositorio.

## Casos de uso

- Monitorización de entrenamientos de superresolución con BasicSR o Real-ESRGAN: el perfil `basicsr` extrae automáticamente métricas como PSNR y loss, permitiendo seguir el progreso sin abrir TensorBoard ni otros visores pesados.
- Seguimiento de entrenamientos con PyTorch Lightning: el perfil `lightning` parsea los logs de Lightning y muestra métricas de validación y entrenamiento en tiempo real, útil para experimentos largos en servidores remotos.
- Control de entrenamientos con HuggingFace Trainer: el perfil `hf` permite vigilar loss, learning rate y otras métricas directamente desde la terminal, ideal para ajuste fino de LLMs o modelos de visión.
- Monitorización de uso de GPU en entornos compartidos: al mostrar estadísticas de GPU (memoria, temperatura) junto con el progreso del entrenamiento, ayuda a detectar cuellos de botella o problemas de memoria.
- Integración en flujos de CI/CD: al ser una herramienta de línea de comandos sin dependencias, puede ejecutarse en pipelines de integración continua para registrar el estado de entrenamientos automatizados.
- Depuración de experimentos en máquinas sin entorno gráfico: en servidores headless o clústeres, permite ver el progreso del entrenamiento sin necesidad de reenviar puertos ni usar interfaces web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de una herramienta de monitorización, no existen métricas de rendimiento de modelo comparables. El rendimiento de la herramienta en sí es mínimo: consume recursos despreciables (un proceso ligero en C) y su latencia de actualización depende de la frecuencia de lectura del log y de las estadísticas de GPU.

## Requisitos de hardware

- Compilador de C (gcc o clang) y sistema operativo Linux.
- No requiere GPU propia; solo necesita acceso a los ficheros de log y a sysfs o nvidia-smi para leer estadísticas.
- Consumo de memoria y CPU muy bajo, al ser una aplicación en C sin dependencias.
- Puede ejecutarse en cualquier máquina con Linux, incluidos servidores sin interfaz gráfica.
- Para monitorizar GPUs NVIDIA, requiere que `nvidia-smi` esté instalado y accesible.
- Para GPUs AMD, requiere el sistema de ficheros sysfs de amdgpu (habitual en drivers recientes).
- No se requieren opciones de despliegue especiales; se compila con `make` y se ejecuta como binario.

## Comparativa con modelos similares

No se trata de un modelo de IA, por lo que la comparación con modelos no aplica. Como herramienta de monitorización, puede compararse con alternativas como:

| Herramienta | Lenguaje | Dependencias | Perfiles | Backends GPU | Licencia |
|---|---|---|---|---|---|
| train-tui | C | Ninguna | BasicSR, Lightning, HF, custom | AMD, NVIDIA, CPU | MIT |
| nvidia-smi | C (propietario) | NVIDIA drivers | No | NVIDIA | Propietaria |
| gpustat | Python | psutil, pynvml | No | NVIDIA | MIT |
| TensorBoard | Python | TensorFlow/PyTorch | Múltiples | No (solo métricas) | Apache 2.0 |

train-tui destaca por su ausencia total de dependencias y su enfoque específico en entrenamientos de deep learning, mientras que gpustat o nvidia-smi se centran únicamente en GPU y TensorBoard requiere infraestructura adicional.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, imágenes ni realiza inferencias; es una herramienta de monitorización.
- Solo funciona en Linux; no hay soporte para Windows o macOS.
- La interfaz es de solo lectura: no permite pausar, detener o modificar el entrenamiento desde la herramienta.
- Depende de la estructura de logs del framework; si el formato cambia, los perfiles pueden dejar de funcionar y requerir ajustes manuales.
- La extracción de métricas depende de que el framework escriba logs en un formato parseable; en algunos casos puede ser necesario crear un perfil personalizado.
- El backend AMD se basa en sysfs, que puede variar según la versión del driver; en GPUs antiguas o con drivers incompletos puede no funcionar correctamente.
- No se proporcionan garantías de soporte ni mantenimiento a largo plazo, al ser un proyecto de un único autor.
- La licencia MIT permite uso comercial y modificación, pero el autor no ofrece soporte oficial.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HerRei/train-tui
- Repositorio en GitHub: https://github.com/HerRei/train-tui
- Demo en vivo: https://herrei.github.io/train-tui/
