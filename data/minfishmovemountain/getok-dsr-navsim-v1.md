# minfishmovemountain/GETok-DSR-NAVSIM-v1

## Resumen

GETok-DSR es un método de planificación de trayectorias para conducción autónoma, desarrollado por Li Ming de la Universidad de Wuhan (WHU) y publicado bajo el espacio de nombres `minfishmovemountain`. El repositorio contiene el código y los artefactos necesarios para reproducir una submission al benchmark NAVSIM v1, que mejora ligeramente las predicciones del modelo base ChainFlow-VLA mediante un mecanismo de selección por consenso entre propuestas de trayectoria. No se trata de un modelo neuronal independiente, sino de un sistema de post-procesamiento que combina quince trayectorias de lattice con sus proyecciones GETok y aplica reglas de umbral para aceptar o rechazar cada propuesta. La relevancia actual radica en su contribución al avance de la planificación de trayectorias en entornos simulados no reactivos, un área clave para el desarrollo de vehículos autónomos seguros y eficientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Método de post-procesamiento sobre ChainFlow-VLA (no es un modelo neuronal independiente) |
| Parametros totales | no disponible (no se publican pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no hay pesos; el repositorio contiene código Python, artefactos JSON y un archivo `submission.pkl` |

## Arquitectura y entrenamiento

El método GETok-DSR se apoya en el modelo ChainFlow-VLA, un sistema de visión-lenguaje-acción (VLA) que genera trayectorias de conducción. Sobre las predicciones de ChainFlow-VLA, el método añade una capa de selección por consenso: se generan quince trayectorias de lattice y sus quince proyecciones GETok, y una regla de bajo coste decide si acepta una proyección GETok cuando se cumplen tres condiciones simultáneas: una diferencia de puntuación aprendida mayor o igual a 0.3, una puntuación de progreso del ego mayor o igual a 1.0, y una puntuación de tiempo hasta colisión (TTC) mayor o igual a 3.0. Esta regla se aplica únicamente sobre logs de Trainval legales. No se realiza entrenamiento adicional; el método es un post-procesamiento determinista que modifica solo cuatro de las 12 146 trayectorias del conjunto de test de NAVSIM, manteniendo intactas las otras 12 142 predicciones del modelo base. La regla congelada se almacena en `artifacts/g245_frozen_gate.json`.

## Capacidades

- Planificación de trayectorias para conducción autónoma en entornos simulados no reactivos (NAVSIM).
- Selección de propuestas basada en consenso entre trayectorias de lattice y proyecciones GETok.
- Integración con el pipeline de evaluación de NAVSIM v1.1 y con el modelo ChainFlow-VLA.
- Reproducibilidad mediante scripts de línea de comandos que aplican la selección, el overlay y la finalización de metadatos.
- Verificación de integridad del paquete mediante `verify_release.py` y publicación automatizada con `publish_hf.py`.

## Casos de uso

- Evaluación de planificadores de trayectorias en el benchmark NAVSIM: el método permite comparar el rendimiento de una submission mejorada frente al modelo base, con un delta de puntuación local de +7.38e-05.
- Investigación en selección de propuestas para conducción autónoma: el mecanismo de consenso entre pares de trayectorias puede servir como referencia para otros trabajos que busquen mejorar la robustez de los planificadores.
- Reproducción de resultados en entornos académicos: los scripts incluidos facilitan la replicación exacta de la submission, lo que es útil para estudios comparativos.
- Desarrollo de sistemas de fallback en planificación: el uso de un modelo base inmutable como respaldo y la superposición selectiva de propuestas alternativas es una estrategia aplicable a otros dominios de robótica.
- Análisis de sensibilidad de umbrales: la regla de consenso con umbrales explícitos permite estudiar el impacto de cada componente (margen, progreso, TTC) en la calidad final de la trayectoria.
- Integración en pipelines de simulación no reactiva: el método puede incorporarse a flujos de trabajo que requieran generar trayectorias seguras y eficientes en entornos urbanos simulados.

## Benchmarks y rendimiento

El modelo card reporta una puntuación local de NAVSIM de `0.9492706849694933`, frente a `0.9491968762246324` del ChainFlow-VLA original, lo que supone un delta de `+7.38087448606727e-05`. El intervalo de bootstrap (20 000 repeticiones) es `[-1.9995823431698164e-05, 0.0002457325116051862]`. Estos valores son locales y no constituyen un resultado oficial del leaderboard; la puntuación oficial debe obtenerse del servidor de NAVSIM. No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

No se proporcionan requisitos específicos de hardware en la documentación del repositorio. Dado que el método es un post-procesamiento sobre las predicciones de ChainFlow-VLA, los requisitos dependen del sistema base. Para ejecutar los scripts de selección y overlay se necesita un entorno con Python y las dependencias de NAVSIM v1.1 y ChainFlow-VLA. No se indica VRAM, GPU recomendada ni opciones de despliegue específicas.

## Comparativa con modelos similares

| Modelo | Tipo | Puntuación NAVSIM (local) | Licencia | Disponibilidad |
|---|---|---|---|---|
| GETok-DSR (este repositorio) | Post-procesamiento sobre ChainFlow-VLA | 0.9492706849694933 | MIT | Código y artefactos en HuggingFace |
| ChainFlow-VLA | Modelo VLA | 0.9491968762246324 | no disponible | Repositorio GitHub |

No se dispone de información sobre otros métodos comparables en el contexto de NAVSIM en los datos proporcionados.

## Limitaciones y advertencias

- El método depende completamente de las predicciones de ChainFlow-VLA; si el modelo base cambia, el comportamiento del post-procesamiento puede variar.
- Está diseñado exclusivamente para el benchmark NAVSIM v1; no es generalizable a otros entornos o tareas de conducción sin adaptación.
- La puntuación local reportada no es un resultado oficial del leaderboard; cualquier afirmación sobre rendimiento debe basarse en la puntuación del servidor oficial.
- El repositorio no contiene pesos de un modelo neuronal, solo código y artefactos; no puede utilizarse como un modelo independiente.
- La regla de consenso se aplica solo sobre logs de Trainval legales; su comportamiento en otros conjuntos de datos no está verificado.
- No se han documentado sesgos específicos, pero al ser un método de post-procesamiento, hereda las limitaciones del modelo base en cuanto a alucinación o errores de percepción.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/minfishmovemountain/GETok-DSR-NAVSIM-v1
- NAVSIM v1.1 (GitHub): https://github.com/autonomousvision/navsim/tree/v1.1
- ChainFlow-VLA (GitHub): https://github.com/AFARI-Research/ChainFlow-VLA
- Espacio de NAVSIM en HuggingFace: https://huggingface.co/spaces/AGC2024-P/e2e-driving-navtest
