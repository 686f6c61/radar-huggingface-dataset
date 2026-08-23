# iEriii/jiggle-64k

## Resumen

jiggle-64k es un modelo de generación de trayectorias de cursor de ratón desarrollado por iEriii, publicado en Hugging Face con licencia MIT. Se trata de un modelo minúsculo de 64.481 parámetros (según el archivo safetensors; el autor indica 64.221 en la model card) que ha sido entrenado exclusivamente con 30 minutos de doodles sintéticos: cadenas de bucles casi circulares de 2 a 7 vueltas, con deformaciones armónicas y ruido sub-pixel, muestreados a 60 Hz. El resultado es un cursor que es físicamente incapaz de trazar una línea recta: solo dibuja círculos.

La arquitectura es una red GRU de 2 capas con una cabeza de densidad de mezcla (Mixture Density Network, MDN) que predice el siguiente delta `(Δx, Δy)` del cursor. El modelo se distribuye como un único script en Python (`circles.py`) que se ejecuta con `uv run` y no requiere instalación adicional. Su propósito declarado es el entretenimiento, demos y pruebas de pipelines de generación de trayectorias, no un uso productivo serio.

Aunque es un modelo muy pequeño y trivial, su interés reside en ser un ejemplo completo y autocontenido de generación secuencial con GRU y MDN, con un pipeline de entrenamiento sintético y un resultado visual inmediato. La fecha de creación (agosto de 2026) es posterior a la actual, pero se mantiene como dato oficial del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU de 2 capas con cabeza MDN (mixture density network) |
| Parametros totales | 64.481 (según safetensors; 64.221 según el README) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo autorregresivo de deltas, sin ventana de contexto explícita) |
| Tipos de cuantizacion | No disponible (no se proporcionan versiones cuantizadas) |
| Idiomas soportados | No disponible (el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una red neuronal recurrente de tipo GRU con dos capas ocultas y una cabeza de densidad de mezcla (MDN). En cada paso de tiempo, recibe un delta `(Δx, Δy)` y predice la distribución de probabilidad del siguiente delta mediante una mezcla de gaussianas. La configuración de muestreo incluye una temperatura de 0.6, guardada en el config, que el autor indica como la que mejor aspecto visual produce.

El entrenamiento se realizó exclusivamente con datos sintéticos: se generaron matemáticamente cadenas de bucles casi circulares (radio entre 70 y 240 píxeles, con deformación armónica suave y ruido sub-pixel), remuestreadas a 60 Hz. En total, aproximadamente 440 trazos que suman 30 minutos de movimiento. No se registraron humanos ni se utilizaron datos reales. No se aplicó RLHF ni DPO.

## Capacidades

- Generación de trayectorias de cursor de ratón de forma autorregresiva, prediciendo deltas `(Δx, Δy)`.
- El modelo es incondicional: no recibe ninguna información sobre la pantalla ni sobre la posición del cursor.
- No genera texto, no razona, no ejecuta funciones ni tiene capacidades de visión o audio.
- Su comportamiento es exclusivamente la generación de secuencias de movimiento circular, con variaciones de tamaño y deformación.
- No soporta tool calling, ni agentes, ni multi-step reasoning.

## Casos de uso

- Demo interactiva: ejecutar el script `circles.py` para que el cursor del usuario dibuje círculos automáticamente mientras se mueve, como una curiosidad visual o para entretenimiento.
- Prueba de pipelines de generación de trayectorias: sirve como caso de prueba mínimo para evaluar infraestructuras de inferencia en tiempo real, ya que el modelo es extremadamente ligero y puede ejecutarse en CPU sin problemas.
- Visualización de modelos generativos: permite demostrar el efecto de una MDN en la generación de secuencias continuas con un ejemplo tangible.
- Enseñanza de GRU y MDN: útil como ejemplo didáctico para estudiantes que quieran ver una implementación real de una red recurrente con cabeza de densidad de mezcla.
- Integración en demos de captura de movimiento del ratón: puede combinarse con herramientas que intercepten eventos del ratón para generar animaciones de cursor.
- Prueba de integración de `uv` y ejecución de scripts remotos: al ser un único script ejecutable con `uv run`, sirve para probar el flujo de ejecución de repositorios de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no está diseñado para tareas de NLP ni de visión, por lo que no tiene sentido compararlo con modelos de propósito general.

## Requisitos de hardware

- VRAM estimada: no disponible, pero por el tamaño (64k parámetros) la inferencia se puede ejecutar en CPU sin problemas. No se requiere GPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente.
- Compatibilidad con hardware de consumo: sí, funciona en cualquier ordenador con Python y `uv` instalado.
- Opciones de despliegue: el script `circles.py` se ejecuta con `uv run` (requiere `uv`). No se proporcionan opciones de despliegue en servidores (vLLM, llama.cpp, etc.).
- Latencia y throughput: no disponibles, pero al ser un modelo tan pequeño la latencia es despreciable.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (generación de trayectorias de ratón). No se ha encontrado ningún modelo similar en el repositorio de Hugging Face ni en la búsqueda web. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo genera trayectorias circulares; es físicamente incapaz de dibujar líneas rectas o cualquier otra forma.
- No tiene conocimiento del contenido de la pantalla ni de la posición del cursor; actúa de forma incondicional.
- No soporta clics ni interacción con el sistema operativo más allá del movimiento del cursor.
- El entrenamiento se basó en datos sintéticos generados matemáticamente, por lo que no hay sesgos derivados de datos humanos, pero también carece de generalidad.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo no tiene utilidad práctica en entornos de producción.
- En macOS, la primera ejecución requiere permiso de Accesibilidad (Accessibility) para controlar el cursor.
- No se ha documentado un soporte de idiomas; el modelo no procesa texto.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/iEriii/jiggle-64k
- Script `circles.py` (dentro del repo): https://huggingface.co/iEriii/jiggle-64k/resolve/main/circles.py
- Herramienta `uv` (Astral): https://docs.astral.sh/uv/

No se han encontrado otros enlaces relevantes en la búsqueda web (la búsqueda devolvió resultados sobre generadores de vídeo "jiggle", no relacionados con este modelo).</think>## Resumen

jiggle-64k es un modelo de generación de trayectorias de cursor de ratón desarrollado por iEriii y publicado en Hugging Face bajo licencia MIT. Se trata de un modelo extremadamente pequeño, con 64.481 parámetros según el archivo safetensors (el README indica 64.221), que ha sido entrenado exclusivamente con 30 minutos de trazos sintéticos: cadenas de bucles casi circulares de entre 2 y 7 vueltas, con deformaciones armónicas suaves y ruido sub-pixel, remuestreados a 60 Hz. El resultado es un cursor que es físicamente incapaz de trazar una línea recta, pues solo dibuja círculos.

La arquitectura es una red GRU de 2 capas con una cabeza de densidad de mezcla (Mixture Density Network, MDN) que predice el siguiente delta `(Δx, Δy)` del cursor. El modelo se distribuye como un único script Python (`circles.py`) que se ejecuta con `uv run` y no requiere instalación de dependencias adicionales. Su propósito declarado es el entretenimiento, demos y pruebas de pipelines de generación de trayectorias, no un uso productivo.

A pesar de su simplicidad, el modelo es un ejemplo didáctico de generación secuencial con GRU y MDN, con un pipeline de entrenamiento sintético y un resultado visual inmediato. La fecha de creación del repositorio es posterior a la actual, pero se mantiene como dato oficial del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU de 2 capas con cabeza MDN (mixture density network) |
| Parametros totales | 64.481 (según safetensors); 64.221 según el README |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se han publicado versiones cuantizadas) |
| Idiomas soportados | No aplica (el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una red GRU de 2 capas que procesa secuencias de deltas `(Δx, Δy)`. En cada paso de tiempo, la salida de la GRU se pasa por una cabeza MDN que predice la distribución de probabilidad del siguiente delta como una mezcla de gaussianas. La temperatura de muestreo óptima (0.6) está guardada en el archivo de configuración, por lo que el modelo funciona sin argumentos adicionales.

El entrenamiento se realizó con datos 100% sintéticos: se generaron matemáticamente cadenas de bucles circulares de radio entre 70 y 240 píxeles, con deformación armónica suave y ruido sub-pixel, remuestreados a 60 Hz. En total se usaron aproximadamente 440 trazos que suman 30 minutos de movimiento. No se registraron humanos ni se utilizaron datos reales. No se aplicó RLHF ni DPO.

## Capacidades

- Generación de trayectorias de cursor de ratón de forma autoritiva, prediciendo deltas `(Δx, Δy)` en cada paso.
- El modelo es incondicional: no recibe información sobre la pantalla, el contenido ni la posición del cursor.
- No genera texto, no razona, no genera imágenes ni audio.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Su única capacidad práctica es la generación de secuencias circulares, con variaciones de tamaño y deformación.

## Casos de uso

- Demostración interactiva: ejecutar `circles.py` para que el cursor del usuario dibuje círculos automáticamente mientras se mueve; útil para entretenimiento o para mostrar un modelo generativo en acción.
- Prueba de pipelines de generación de trayectorias: sirve como caso de prueba mínimo para evaluar infraestructuras de tiempo real (por ejemplo, captura de movimiento del ratón y renderizado de trayectorias).
- Enseñanza de GRU y MDN: permite a estudiantes ver cómo una red recurrente con cabeza de densidad de mezcla genera secuencias continuas con un ejemplo sencillo y visual.
- Verificación de ejecución de repositorios remotos con `uv`: el script se ejecuta con `uv run` desde la URL de Hugging Face, sirviendo como prueba de flujo de instalación y ejecución.
- Demo para ferias o eventos: una curiosidad visual que muestra cómo un modelo de IA puede controlar el puntero de forma autónoma.
- Test de control de accesibilidad en macOS: la primera ejecución solicita permiso de Accesibilidad, útil para probar flujos de permisos en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no está diseñado para tareas de lenguaje, visión o razonamiento, por lo que no tiene sentido compararlo con modelos de referencia generales.

## Requisitos de hardware

- VRAM estimada: no se requiere GPU; el modelo es minúsculo y puede ejecutarse en CPU.
- GPU recomendada: ninguna; cualquier CPU moderna es suficiente.
- Compatibilidad con hardware de consumo: sí, funciona en cualquier ordenador con Python y `uv` instalado.
- Opciones de despliegue: solo se proporciona el script `circles.py`; no hay soporte para vLLM, llama.cpp, Ollama, TGI, etc.
- Latencia y throughput: despreciables dado el tamaño; la inferencia es en tiempo real.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la misma categoría (generación de trayectorias de ratón) en Hugging Face ni en la búsqueda web. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo produce trayectorias circulares; no puede generar líneas rectas ni otras formas.
- No tiene conocimiento del contenido de la pantalla ni de la posición del cursor; actúa de forma incondicional.
- No genera clics ni interactúa con el sistema operativo más allá del movimiento del cursor.
- Los datos de entrenamiento son sintéticos, por lo que no hay sesgos de datos reales, pero la generalización es nula fuera de los bucles circulares.
- La licencia MIT permite uso comercial, pero el modelo no tiene utilidad práctica en producción.
- En macOS, la primera ejecución requiere permiso de Accesibilidad; sin ese permiso, el script no podrá mover el cursor.
- No se ha documentado ningún soporte de idiomas, ya que el modelo no procesa texto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/iEriii/jiggle-64k
- Script `circles.py` dentro del repositorio: https://huggingface.co/iEriii/jiggle-64k/resolve/main/circles.py
- Documentación de `uv`: https://docs.astral.sh/uv/

No se han encontrado otros enlaces relevantes (la búsqueda web devolvió resultados de generadores de vídeo "jiggle" no relacionados).## Resumen

jiggle-64k es un modelo de generación de trayectorias de cursor de ratón desarrollado por iEriii y publicado en Hugging Face con licencia MIT. Se trata de un modelo extremadamente pequeño, con 64.481 parámetros según el archivo safetensors (el README indica 64.221), entrenado exclusivamente con 30 minutos de trazos sintéticos: cadenas de bucles circulares de entre 2 y 7 vueltas, con deformación armónica suave y ruido sub-pixel, remuestreados a 60 Hz. El resultado es un cursor que es físicamente incapaz de trazar una línea recta, pues solo dibuja círculos.

La arquitectura es una red GRU de 2 capas con una cabeza de densidad de mezcla (Mixture Density Network, MDN) que predice el siguiente delta `(Δx, Δy)` del cursor. El modelo se distribuye en un único script Python (`circles.py`) que se ejecuta con `uv run` y no requiere instalación de dependencias adicionales. Su propósito declarado es el entretenimiento, demos y pruebas de pipelines de generación de trayectorias, no un uso productivo.

A pesar de su simplicidad, el modelo es un ejemplo didáctico de generación secuencial con GRU y MDN, con un pipeline de entrenamiento sintético y un resultado visual inmediato. La fecha de creación del repositorio (agosto de 2026) es posterior a la actual, pero se mantiene como dato oficial del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU de 2 capas con cabeza MDN (mixture density network) |
| Parametros totales | 64.481 (según safetensors); 64.221 según el README |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo autoritativo de deltas, sin ventana de contexto explícita) |
| Tipos de cuantizacion | No disponible (no se han publicado versiones cuantizadas) |
| Idiomas soportados | No aplica (el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una red GRU de 2 capas que procesa secuencias de deltas `(Δx, Δy)`. En cada paso de tiempo, la salida de la GRU se introduce en una cabeza MDN que modela la distribución de probabilidad del siguiente delta como una mezcla de gaussianas. La temperatura de muestreo óptima (0.6) está guardada en el archivo de configuración, por lo que el modelo funciona sin argumentos adicionales.

El entrenamiento se realizó con datos 100% sintéticos: se generaron matemáticamente cadenas de bucles circulares de radio entre 70 y 240 píxeles, con deformación armónica suave y ruido sub-pixel, remuestreados a 60 Hz. En total, se usaron aproximadamente 440 trazos que suman 30 minutos de movimiento. No se registraron humanos ni se usaron datos reales. No se aplicó RLHF ni DPO.

## Capacidades

- Generación de trayectorias de cursor de ratón de forma autoritativa, prediciendo deltas `(Δx, Δy)` en cada paso.
- El modelo es incondicional: no recibe información sobre la pantalla, el contenido ni la posición del cursor.
- No genera clics, no razona, no genera texto, no procesa imágenes ni audio.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso.
- Su única capacidad es la generación de secuencias circulares, con variaciones de tamaño y deformación.

## Casos de uso

- Demo interactiva: ejecutar `circles.py` para que el cursor del usuario dibuje círculos automáticamente mientras se mueve; útil para entretenimiento o para mostrar un modelo generativo en acción.
- Prueba de pipelines de generación de trayectorias: sirve como caso de prueba para validar sistemas de captura y renderizado de movimiento del ratón en tiempo real.
- Enseñanza de GRU y MDN: permite a estudiantes ver cómo una red recurrente con cabeza de densidad de mezcla genera secuencias continuas con un ejemplo sencillo y ejecutable.
- Verificación de ejecución de repositorios remotos con `uv`: el script se ejecuta con `uv run` desde la URL de Hugging Face, sirviendo como prueba de flujo de instalación y ejecución.
- Demostración en ferias tecnológicas: una pequeña curiosidad visual que muestra un modelo controlar el puntero de forma autónoma.
- Test de control de accesibilidad en macOS: la primera ejecución requiere permiso de Accesibilidad, útil para probar flujos de permisos en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no está diseñado para tareas de lenguaje, visión o razonamiento, por lo que no tiene sentido compararlo con modelos de referencia generales.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo es minúsculo y puede ejecutarse en CPU.
- GPU recomendada: ninguna; cualquier CPU moderna es suficiente.
- Compatibilidad con hardware de consumo: sí, funciona en cualquier ordenador con Python y `uv` instalado.
- Opciones de despliegue: solo se proporciona el script `circles.py`; no hay soporte para vLLM, llama.cpp, Ollama, TGI, etc.
- Latencia y throughput: despreciables dado el tamaño; la inferencia es en tiempo real.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la misma categoría (generación de trayectorias de ratón) en Hugging Face ni en la búsqueda web. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo produce trayectorias circulares; no puede generar líneas rectas ni otras formas.
- No tiene conocimiento del contenido de la pantalla ni de la posición del cursor; actúa de forma incondicional.
- No genera clics ni interactúa con el sistema operativo más allá del movimiento del cursor.
- Los datos de entrenamiento son sintéticos, por lo que no hay sesgos de datos reales, pero la generalización está limitada a un patrón circular.
- La licencia MIT permite uso comercial, pero el modelo no tiene utilidad práctica en producción.
- En macOS, la primera ejecución requiere permiso de Accesibilidad; sin ese permiso, el script no podrá mover el cursor.
- No se ha documentado ningún soporte de idiomas, ya que el modelo no procesa texto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/iEriii/jiggle-64k
- Script `circles.py` dentro del repositorio: https://huggingface.co/iEriii/jiggle-64k/resolve/main/circles.py
- Documentación de `uv`: https://docs.astral.sh/uv/

No se han encontrado otros enlaces relevantes (la búsqueda web devolvió resultados de generadores de vídeo "jiggle" no relacionados con este modelo).
