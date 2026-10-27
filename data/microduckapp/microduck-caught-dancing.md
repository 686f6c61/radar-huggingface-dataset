# microduckapp/microduck-caught-dancing

## Resumen

`microduck-caught-dancing` es un artefacto de control robótico publicado por la organización `microduckapp` en Hugging Face, no un modelo de lenguaje. Contiene `policy.onnx`, una política de movimiento en bucle cerrado para el robot bípedo Microduck (Pollen Robotics / Hugging Face), que mapea 61 observaciones de entrada a 14 consignas articulares de salida a 50 Hz. El movimiento dura 10,4 segundos y se distribuye empaquetado junto a un `manifest.json` que describe qué debe instalar y reproducir el robot, más un vídeo de previsualización.

El nombre y la descripción de la model card ("baila feliz, se da cuenta de que la observas, se queda quieto, mira hacia otro lado y vuelve a bailar") identifican la pieza como un comportamiento expresivo coreografiado y reproducible, del catálogo de movimientos de la aplicación MicroDuck. El repositorio es minúsculo (0,0 GB reportados) y no incluye documentación técnica sobre la topología de la red, el procedimiento de entrenamiento ni la composición del vector de observaciones.

Su relevancia es la de un ejemplo práctico de distribución de *skills* de robótica como artefactos portables: un archivo ONNX con una interfaz de entrada/salida fija y una frecuencia de control declarada, instalable desde una app de consumo sobre un robot abierto de 399 dólares. Para desarrolladores e investigadores sirve como referencia de formato y de interfaz, no como modelo evaluable en benchmarks de razonamiento o generación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control robótico exportada a ONNX; topología interna (capas, anchura, tipo de red) no disponible |
| Parámetros totales | no disponible |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); ventana de 61 observaciones por paso de control |
| Tipos de cuantización | no disponible (se distribuye un único `policy.onnx`; no se documentan variantes) |
| Idiomas soportados | no disponible / no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) |
| Entradas | 61 observaciones por paso |
| Salidas | 14 consignas articulares (*joint targets*) |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 10,4 s (≈520 pasos de control a 50 Hz) |
| Archivos del repo | `policy.onnx`, `manifest.json`, `media/preview.mp4` |
| Plataforma destino | Robot bípedo Microduck (Pollen Robotics / Hugging Face) |
| Tamaño del repo | 0,0 GB (según Hugging Face) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura de la red: solo se declara la interfaz funcional (61 entradas, 14 salidas, 50 Hz) y el formato de serialización (ONNX). Se trata, por tanto, de una política de control en bucle cerrado que en cada ciclo de 20 ms lee el estado del robot y emite consignas articulares, sin que se detalle la composición del vector de observaciones (posiciones articulares, velocidades, IMU, reloj de fase u otras señales) ni la naturaleza de las 14 salidas (posiciones objetivo, offsets o pares).

Tampoco se documentan datos de entrenamiento, número de tokens o episodios, ni si hubo ajuste por refuerzo, imitación o *scripting*. El contexto público del programa Microduck indica que la plataforma se entrena con aprendizaje por refuerzo en MuJoCo y se transfiere de simulación a hardware, pero la model card de este artefacto concreto no lo confirma. La innovación relevante aquí es el empaquetado: política ONNX + manifiesto de instalación + previsualización, lo que convierte un comportamiento en una unidad instalable y reproducible desde una aplicación, con una frecuencia de control declarada como contrato de integración.

## Capacidades

- Reproducción de una secuencia de baile coreografiada de 10,4 segundos con el robot Microduck.
- Control en bucle cerrado a 50 Hz: la política recibe 61 observaciones y emite 14 consignas articulares por ciclo.
- Comportamiento expresivo con pausas y giros (congelarse, desviar la mirada, girar y retomar el baile) según la descripción del autor; no se documenta si alguno de esos gestos responde a entradas perceptivas reales.
- Distribución como *skill* instalable mediante la app MicroDuck, con `manifest.json` para resolución de dependencias y reproducción.
- Inferencia portable vía ONNX Runtime en el hardware del robot o en un equipo conectado.
- No soporta *tool calling*, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio.
- No hay capacidades multilingües: el artefacto no procesa lenguaje.

## Casos de uso

- **Demostración de comportamiento expresivo en Microduck**: instalar el movimiento desde la app y reproducirlo en el robot para mostrar el catálogo de *skills* en ferias, aulas o vídeos de producto; el formato ONNX con manifiesto permite la instalación sin recompilar firmware.
- **Composición de secuencias de movimiento**: encadenar esta política con otros movimientos del mismo autor (por ejemplo, `microduck-midnight-snack`) para construir rutinas más largas, gestionando las transiciones entre políticas en el nivel de la aplicación.
- **Verificación de sim-to-real en hardware de bajo coste**: usar el movimiento como caso de prueba reproducible (520 pasos de control, interfaz fija) para medir degradación entre la ejecución en simulador y en el robot físico, especialmente en estabilidad del bípedo y seguimiento de consignas articulares.
- **Pruebas de integración y latencia del *runtime* ONNX**: el ciclo de 50 Hz impone un presupuesto de 20 ms por paso; sirve para validar que el *runtime* y el bus de comunicación del robot cumplen ese plazo antes de desplegar políticas más exigentes.
- **Docencia en robótica y control**: ejemplo mínimo de política observación→acción empaquetada, útil para explicar interfaces de control, frecuencia de muestreo y despliegue de artefactos de aprendizaje automático en sistemas embebidos.
- **Investigación en interacción humano-robot**: material para estudios de percepción de expresividad y de gestos ambiguos (pausa y desvío de mirada) en robots sociales de bajo coste, siempre que se valide experimentalmente qué percibe el usuario.
- **Generación de contenido y material de previsualización**: el repositorio incluye `media/preview.mp4`, reutilizable como referencia visual para documentación, catálogos o comparativas de movimientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de recompensa, tasa de éxito, error de seguimiento articular ni robustez ante perturbaciones para este artefacto; el autor solo publica la interfaz y la duración del movimiento.

| Métrica | Valor |
|---|---|
| Recompensa media / tasa de éxito | no disponible |
| Error de seguimiento articular | no disponible |
| Robustez ante empujes o terreno irregular | no disponible |
| Latencia medida de inferencia | no disponible (el diseño implica ≤20 ms por paso a 50 Hz) |
| Comparación con otros movimientos | no disponible |

## Requisitos de hardware

- **VRAM estimada**: no disponible. El repositorio ocupa 0,0 GB y la política resuelve un mapeo de 61 entradas a 14 salidas, por lo que la huella de memoria es irrelevante frente a cualquier modelo generativo; no se publica el número de parámetros.
- **GPU recomendadas**: no aplica. La inferencia está pensada para ejecutarse en el cómputo del propio robot o en una CPU, no en aceleradores de datacenter (A100, H100) ni en GPU de consumo (RTX 4090).
- **¿Cabe en GPU de consumo?**: no disponible como dato; por la naturaleza del artefacto no requiere GPU dedicada.
- **Opciones de despliegue**: ONNX Runtime (CPU o embebido) es la vía natural dado el formato; vLLM, llama.cpp, Ollama o TGI no son aplicables porque no es un modelo de lenguaje.
- **Latencia y throughput**: el contrato de control fija 50 Hz, es decir, un presupuesto de 20 ms por paso y 520 pasos para el movimiento completo; no se publican mediciones reales de latencia ni de *jitter*.
- **Almacenamiento**: despreciable; el paquete incluye la política, un manifiesto y un vídeo de previsualización.

## Comparativa con modelos similares

| Artefacto | Tipo | Entradas → salidas | Frecuencia | Duración | Formato | Licencia |
|---|---|---|---|---|---|---|
| `microduck-caught-dancing` | Política de movimiento para Microduck | 61 → 14 | 50 Hz | 10,4 s | ONNX | no disponible |
| `microduck-midnight-snack` (mismo autor) | Política de movimiento para Microduck | no disponible | no disponible | no disponible | no disponible | no disponible |
| Políticas de locomoción de código abierto para bípedos (MuJoCo, Isaac Gym) | Políticas de control entrenadas por RL | variable | 50–200 Hz | continuas | ONNX / PyTorch | habitualmente MIT o BSD (verificar cada caso) |

La comparación cuantitativa no es posible: el autor no publica parámetros, arquitectura ni métricas de rendimiento, y el resto de movimientos de la organización `microduckapp` (16 modelos en el momento de la consulta) tampoco expone datos técnicos en la información disponible. La única dimensión comparable con fiabilidad es la interfaz: 61 observaciones, 14 salidas y 50 Hz.

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia explícita no puede asumirse permiso de uso comercial, redistribución ni modificación; hay que contactar con el autor antes de integrarlo en un producto.
- **Ausencia de documentación técnica**: se desconoce la arquitectura, el número de parámetros, la composición exacta de las 61 observaciones y el significado de las 14 salidas, lo que impide auditar el comportamiento o reproducir el entrenamiento.
- **Validación comunitaria nula**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de terceros sobre su funcionamiento en hardware real.
- **Riesgo de desajuste de interfaz**: al depender de un orden concreto de observaciones y articulaciones, cualquier cambio de firmware, calibración o versión del robot puede producir comportamientos erráticos o caídas del bípedo.
- **Comportamiento aparentemente perceptivo**: la narración de la model card ("se da cuenta de que la observas") es una descripción del guion del movimiento; no se confirma que la política procese detección de personas. No debe presentarse como interactividad real sin verificación.
- **Riesgo físico**: un bípedo de 25 cm que ejecuta giros y pausas puede desequilibrarse; se recomienda probar primero en simulación y en superficie plana, con supervisión.
- **Ámbito limitado**: no es un modelo de lenguaje ni un sistema multimodal; no admite instrucciones en lenguaje natural, *tool calling* ni adaptación a nuevos objetivos sin reentrenar o sustituir la política.
- **Metadatos incompletos**: el tamaño de repositorio reportado como 0,0 GB y la ausencia de campos de idioma o licencia en Hugging Face complican la trazabilidad y la gestión de dependencias.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/microduckapp/microduck-caught-dancing
- Organización en Hugging Face: https://huggingface.co/microduckapp
- Repositorio del robot en GitHub (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Cobertura de MarkTechPost sobre Microduck: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Cobertura de TechCrunch: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- Cobertura de The AI Insider: https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
