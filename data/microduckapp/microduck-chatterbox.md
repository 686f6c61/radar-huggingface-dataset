# microduckapp/microduck-chatterbox

## Resumen

`microduck-chatterbox` es una política de movimiento (motion policy) para el robot bípedo MicroDuck, publicada por el usuario `microduckapp`. No es un modelo de lenguaje ni un modelo fundacional: es un grafo ONNX que mapea un vector de 61 observaciones a 14 consignas de articulación a 50 Hz, reproduciendo un movimiento pregrabado de 10,7 segundos (unas 535 muestras a 50 Hz, cálculo derivado de la frecuencia declarada). El repositorio incluye `policy.onnx`, un `manifest.json` con los requisitos de instalación y reproducción, y un vídeo de previsualización en `media/preview.mp4`.

El modelo se enmarca en el ecosistema MicroDuck, el robot bípedo de 25 cm y 399 USD presentado por Pollen Robotics y Hugging Face en agosto de 2026 como plataforma abierta para experimentar con IA física, aprendizaje por refuerzo y transferencia de comportamientos de simulación a hardware real. Dentro de ese ecosistema, cada "move" se distribuye como un paquete instalable desde la aplicación MicroDuck, con una etiqueta propia (`microduck-move`) que agrupa estos artefactos.

Su relevancia es fundamentalmente práctica y de formato: ejemplifica la distribución de comportamientos motores como artefactos versionados en Hugging Face, con un contrato de entrada/salida fijo (61→14 a 50 Hz) y un manifiesto de instalación. Conviene señalar que la ficha se publica con 0 descargas, licencia no declarada y sin documentación de la topología de red ni del significado de las 61 observaciones, por lo que su evaluación técnica detallada no es posible con la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (política neuronal exportada a ONNX; no se documenta la topología interna, número de capas ni tipo de red) |
| Parámetros totales | No disponible (el tamaño del repositorio se declara como 0,0 GB y no se publica el recuento de parámetros) |
| Parámetros activos | No aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | No aplica; ventana de observación de 61 valores por paso de control, sin memoria recurrente declarada |
| Tipos de cuantización | No disponible (solo se distribuye el grafo ONNX, sin variantes cuantizadas publicadas) |
| Idiomas soportados | No aplica (no procesa lenguaje natural); el campo de idiomas del repositorio figura como no disponible |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` |
| Entradas | 61 observaciones (composición no documentada) |
| Salidas | 14 consignas articulares |
| Frecuencia de control | 50 Hz (periodo de 20 ms) |
| Duración del movimiento | 10,7 s |
| Pipeline declarado | `robotics` |
| Etiquetas | `onnx`, `robotics`, `microduck-move`, `region:us` |
| Autor | `microduckapp` |
| Descargas / likes | 0 / 1 |
| Fecha de creación | 2026-10-27 |
| Última actualización | 2026-10-27 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de la red: solo declara el contrato de la política (61 observaciones de entrada, 14 objetivos de articulación de salida, 50 Hz) y el formato de exportación (ONNX). No se indica si se trata de un perceptrón multicapa, una red recurrente, una política de tipo actor-critic destilada o un controlador híbrido con lógica de reproducción de trayectorias. Tampoco se especifica el número de capas, las funciones de activación ni el tamaño del fichero de pesos, más allá de que el repositorio completo ocupa 0,0 GB en la información disponible.

Respecto al entrenamiento, no hay datos en la información proporcionada sobre el número de muestras, el simulador empleado, la composición del dataset, ni si hubo aprendizaje por refuerzo, imitación o captura de movimiento. La documentación pública del programa MicroDuck (Pollen Robotics y Hugging Face) sitúa estos comportamientos en el marco del entrenamiento con refuerzo en MuJoCo y la transferencia sim-to-real, pero la model card de este artefacto concreto no lo confirma ni aporta detalles verificables. Tampoco se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, destilación de política) asociada al paquete.

## Capacidades

- Reproducción de una secuencia motora cerrada de 10,7 s: genera consignas para 14 articulaciones a partir de 61 observaciones, a 50 Hz.
- Control de cuerpo completo orientado a un robot bípedo de 25 cm (MicroDuck), presumiblemente con consignas de piernas, cuerpo y cabeza, aunque el desglose por articulación no está documentado.
- Instalación y reproducción guiadas por manifiesto: `manifest.json` declara lo que el robot necesita para instalar y ejecutar el movimiento.
- Ejecución en tiempo real sobre un grafo ONNX ligero, apto para inferencia en el propio robot o en un equipo conectado.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües.
- No se declara soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se declara modo "thinking", percepción visual ni adaptación reactiva al entorno más allá de las observaciones que consuma la política.

## Casos de uso

- Demostración de producto y contenido de marketing: el movimiento está pensado como "move" instalable desde la app MicroDuck, con vídeo de previsualización incluido; se usaría para mostrar el robot en vídeos, ferias o materiales de venta sin necesidad de programar trayectorias a mano.
- Prueba de integración del pipeline de instalación: sirve como caso de prueba de extremo a extremo del flujo `manifest.json` → descarga → instalación → reproducción en el robot, al ser un paquete pequeño y de duración corta (10,7 s).
- Validación del runtime ONNX en el hardware objetivo: permite medir la latencia real de inferencia de un grafo 61→14 a 50 Hz en la computadora a bordo del MicroDuck y verificar que el bucle de control cumple el periodo de 20 ms.
- Composición de secuencias de comportamiento: al estar empaquetado por movimiento, puede encadenarse con otros artefactos de la misma etiqueta `microduck-move` (por ejemplo, `microduck-midnight-snack`) para construir rutinas más largas en una aplicación de control.
- Docencia y talleres de robótica: material de partida para explicar cómo se estructura un paquete de comportamiento motor (observaciones, acciones, frecuencia, manifiesto) sin requerir entrenamiento propio.
- Referencia de contrato de interfaz para desarrolladores: quien entrene sus propias políticas para MicroDuck puede usar este paquete como plantilla del formato de entrega (ONNX + manifiesto + previsualización) y del vector de 61 entradas y 14 salidas.
- Pruebas de regresión de firmware: ejecutar el mismo movimiento antes y después de actualizar el firmware del robot permite detectar cambios de calibración, signos de articulación o escalas de consigna que alteren la reproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de tasa de éxito, error de seguimiento articular, suavidad de la trayectoria, consumo de batería ni brecha sim-to-real. Tampoco se han publicado métricas comparativas frente a otras políticas del catálogo MicroDuck.

## Requisitos de hardware

- VRAM estimada: no disponible; por el contrato de la política (61 entradas, 14 salidas) y el tamaño declarado del repositorio (0,0 GB), la huella de memoria es del orden de kilobytes a pocos megabytes, muy por debajo de cualquier GPU convencional.
- GPU recomendadas: no aplica. No se requiere GPU; la inferencia está pensada para ejecutarse en CPU, presumiblemente en la computadora a bordo del MicroDuck (hardware no especificado en la información disponible).
- Cabe en GPU de consumo: sí, con enorme margen; cualquier iGPU o CPU de placa SBC es suficiente, aunque no se publican cifras de latencia medidas.
- Opciones de despliegue: ONNX Runtime (opción natural dado el formato), con posibilidad de ejecución en Python, C++ o C# mediante sus bindings; no se indica soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: el bucle de control impone un presupuesto de 20 ms por paso (50 Hz); no se publican tiempos de inferencia medidos. Para un grafo de esta dimensionalidad, el coste de cómputo por paso es despreciable frente a ese presupuesto en cualquier CPU moderna, pero es una estimación cualitativa, no un dato del autor.
- Almacenamiento: el paquete completo, incluyendo el vídeo de previsualización, cabe holgadamente en el espacio declarado de 0,0 GB del repositorio.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas / salidas | Frecuencia | Duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `microduckapp/microduck-chatterbox` | Política motora ONNX para MicroDuck | 61 → 14 | 50 Hz | 10,7 s | No disponible | Hugging Face, 0 descargas |
| `microduckapp/microduck-midnight-snack` | Política motora ONNX para MicroDuck (misma etiqueta `microduck-move`) | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| Políticas de locomotion de código abierto para bípedos pequeños (por ejemplo, las publicadas junto a frameworks de RL en MuJoCo) | Políticas de locomoción continua | No disponible | No disponible | Continuas | Habitualmente permisivas, variable por proyecto | Repositorios de investigación; no directamente compatibles con MicroDuck |

La comparación cuantitativa no es posible: no hay parámetros, contexto, benchmarks ni licencia declarados para este artefacto, y el resto del catálogo MicroDuck (16 modelos según la página del autor) no expone especificaciones en la información disponible. La comparación realista es funcional: este paquete es un movimiento cerrado de corta duración, no una política de locomoción general reutilizable en otro robot.

## Limitaciones y advertencias

- Alcance mínimo: es un movimiento pregrabado de 10,7 s, no una política general. No se espera que generalice a comandos de voz, objetivos de navegación ni situaciones no previstas.
- Especificación de interfaz incompleta: no se documenta qué representan las 61 observaciones (¿posiciones articulares, IMU, consignas de mando, fase temporal?) ni las unidades de las 14 salidas. Sin ese contrato, la integración fiable exige ingeniería inversa o acceso a la app MicroDuck.
- Dependencia de hardware: el movimiento está calibrado para el MicroDuck; aplicarlo a otro robot o a una versión con firmware distinto puede producir trayectorias incorrectas.
- Brecha sim-to-real: no se publican métricas de transferencia ni de robustez ante perturbaciones, terreno irregular o desgaste mecánico.
- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial, redistribución ni modificación. Es un bloqueo potencial para integraciones en producto.
- Ausencia de validación comunitaria: 0 descargas y 1 like en la información disponible; no hay informes independientes de funcionamiento.
- Idiomas no aplicables: cualquier expectativa de procesamiento de lenguaje natural es un error de categoría; el pipeline declarado es `robotics`.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe un riesgo análogo de ejecución insegura si la política recibe observaciones fuera de distribución y genera consignas articulares sin limitación de seguridad documentada.
- Sesgos: no hay información sobre la población de entrenamiento ni sobre condiciones de prueba; no se puede evaluar sesgo demográfico porque el modelo no procesa personas, pero sí puede haber sesgo de dominio (condiciones de laboratorio frente a uso doméstico).
- Metadatos a revisar: el repositorio se creó y actualizó el mismo día (2026-10-27) y el tamaño declarado es 0,0 GB, lo que sugiere que la información pública puede estar incompleta o pendiente de actualización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-chatterbox
- Página del autor en Hugging Face: https://huggingface.co/microduckapp
- Repositorio del robot MicroDuck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Artículo sobre el lanzamiento de MicroDuck (MarkTechPost): https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Cobertura del lanzamiento (TechCrunch): https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- Cobertura del lanzamiento (The AI Insider): https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
- Previsualización del movimiento: `media/preview.mp4` dentro del repositorio del modelo
