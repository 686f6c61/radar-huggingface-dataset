# microduckapp/microduck-spinning-top

## Resumen

`microduck-spinning-top` es una política de control motriz publicada en Hugging Face por `microduckapp` para el robot bípedo Microduck. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un artefacto de robótica que codifica un único movimiento de 10,5 segundos —el robot gira sobre sí mismo como una peonza, elevando la cabeza en cada vuelta hasta tambalearse— y que se distribuye como un grafo ONNX (`policy.onnx`) acompañado de un `manifest.json` con los metadatos de instalación y reproducción, más un vídeo de previsualización.

El modelo resuelve un problema muy acotado: empaquetar una habilidad motriz entrenada (presumiblemente mediante aprendizaje por refuerzo, aunque la model card no lo detalla) en un formato portable que el robot pueda ejecutar en bucle cerrado. La interfaz es explícita: 61 observaciones de entrada, 14 objetivos articulares de salida y una frecuencia de control de 50 Hz. Con esos datos, la política consume el estado del robot y emite consignas articulares cada 20 ms.

Su relevancia es la del ecosistema en el que se inserta: el Microduck, presentado por Pollen Robotics y Hugging Face en agosto de 2026, es un bípedo de 25 cm y 399 dólares con 15 motores, cámara, LiDAR y pico prensil, cuyo stack es open source y se entrena en simulación (MuJoCo) para transferirse después al hardware. Esta ficha es una pieza de ese catálogo de habilidades intercambiables, no un modelo fundacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (política de control serializada como grafo ONNX; la model card no describe la topología de red) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: la entrada es un vector de 61 observaciones por paso de control, no una secuencia de texto |
| Tipos de cuantización | No disponible (se distribuye un ONNX sin precisión declarada) |
| Idiomas soportados | No disponible / no aplica (modelo de robótica sin interfaz de lenguaje) |
| Licencia | No disponible (la model card y los metadatos de Hugging Face no la especifican) |
| Formato de pesos | ONNX (`policy.onnx`), acompañado de `manifest.json` y `media/preview.mp4` |
| Entradas | 61 observaciones por paso |
| Salidas | 14 objetivos articulares (joint targets) |
| Frecuencia de control | 50 Hz (20 ms por paso) |
| Duración del movimiento | 10,5 s (equivalente a unos 525 pasos de control) |
| Pipeline declarado | `robotics` |
| Etiquetas | `onnx`, `robotics`, `microduck-move`, `region:us` |
| Autor | `microduckapp` |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-27 |

## Arquitectura y entrenamiento

La información publicada no describe la arquitectura interna de la política: no se indica si se trata de un perceptrón multicapa, una red convolucional, un transformer o una política recurrente. Lo único verificable es el contrato de entrada/salida (61 → 14) y la frecuencia de ejecución (50 Hz), que sitúan el artefacto en el régimen típico de una política de control entrenada en simulación y exportada a ONNX para inferencia en el bucle de control del robot.

Tampoco se documentan el número de tokens o episodios de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste fino por preferencias humanas. El contexto del ecosistema sugiere entrenamiento mediante aprendizaje por refuerzo en MuJoCo, dado que el stack del Microduck se presenta públicamente como un pipeline de RL en simulación con transferencia al hardware, pero la model card de esta habilidad concreta no confirma el método, la recompensa ni el procedimiento de sim-to-real empleado.

## Capacidades

- Generación de consignas articulares a 50 Hz: transforma un vector de 61 observaciones en 14 objetivos de articulación por paso de control.
- Ejecución de una habilidad motriz cerrada y cronometrada: giro sobre el propio eje con elevación progresiva de la cabeza y desestabilización final, con una duración fija de 10,5 s.
- Reproducción empaquetada: el `manifest.json` declara qué necesita el robot para instalar y ejecutar el movimiento, lo que permite su carga desde la aplicación MicroDuck.
- Composabilidad potencial con otras habilidades del mismo autor: la etiqueta `microduck-move` agrupa este artefacto con otros del catálogo `microduckapp`, pensados como piezas de una biblioteca de movimientos.
- Control en bucle cerrado: al depender de 61 observaciones por paso, la política reacciona al estado medido del robot en lugar de reproducir una trayectoria pregrabada.
- No dispone de tool calling, function calling, razonamiento multi-paso, procesamiento de lenguaje, visión, audio ni modo de pensamiento. No es un modelo de propósito general.
- No se especifica si el vector de observaciones incorpora señales de la cámara o del LiDAR del robot.

## Casos de uso

- Demostración en ferias y eventos: el movimiento dura 10,5 s y está pensado como número visual; el `preview.mp4` permite evaluar el resultado antes de desplegarlo en el robot físico, útil para guiones de exhibición con público.
- Prueba de humo del runtime de políticas: cargar `policy.onnx` con ONNX Runtime y verificar que el bucle de control sostiene 50 Hz (presupuesto de 20 ms por paso) valida la cadena de inferencia del robot antes de integrar habilidades más costosas.
- Composición de secuencias de movimiento: al estar etiquetado como `microduck-move`, puede encadenarse con otras habilidades del mismo catálogo para construir rutinas de mayor duración y guionizadas.
- Evaluación de la brecha sim-to-real: ejecutar el mismo grafo en simulación y en hardware y comparar la fidelidad del giro y del tambaleo final permite cuantificar cuánto se degrada la política al cruzar la frontera de simulación.
- Docencia y ejemplos mínimos de despliegue: es un caso de estudio compacto de política ONNX con manifiesto de instalación, adecuado para explicar el ciclo observación → inferencia → consigna articular en robótica educativa.
- Benchmarking de latencia en cómputo embebido: sirve para medir si una placa concreta (SBC o módulo con acelerador) sostiene los 50 Hz exigidos, ya que el grafo es de tamaño reducido según el repositorio (0,0 GB).
- Material promocional y de captura: el movimiento y el vídeo asociado pueden emplearse para generar contenido de marketing del robot sin necesidad de instrumentar una sesión nueva.
- Referencia para clonación de comportamiento: la política y su vídeo pueden servir como objetivo cualitativo al reentrenar una habilidad equivalente con otro algoritmo o para comparar metodologías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de recompensa, tasa de éxito, error de seguimiento articular, latencia medida ni comparación alguna con otras políticas. No se dispone tampoco de cifras de throughput.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,0 GB y no se publica el recuento de parámetros ni el tamaño del grafo, por lo que no puede acotarse la huella de memoria con rigor.
- GPU recomendadas: no disponibles. Para una política de esta escala, la inferencia en CPU es plausible, pero no está confirmado por el autor.
- Compatibilidad con GPU de consumo: no confirmada. No hay datos que permitan afirmar que el movimiento se ejecute en una RTX 4090 ni en ninguna otra GPU concreta.
- Requisito funcional derivado: el bucle debe sostener 50 Hz, es decir, un presupuesto de 20 ms por paso incluyendo lectura de sensores, inferencia y envío de consignas a los 14 objetivos articulares.
- Opciones de despliegue: ONNX Runtime es la vía natural dado el formato del artefacto. vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo de lenguaje. La integración concreta con el stack del Microduck no se detalla en la información disponible.
- Latencia y throughput: no publicados. El único requisito temporal explícito es la frecuencia de 50 Hz declarada en la model card.

## Comparativa con modelos similares

| Modelo | Categoría | Entradas / salidas | Duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `microduckapp/microduck-spinning-top` | Habilidad motriz ONNX para Microduck | 61 obs. / 14 articulaciones a 50 Hz | 10,5 s | No disponible | Pública en HF (0 descargas) |
| `microduckapp/microduck-midnight-snack` | Habilidad motriz del mismo autor (`microduck-move`) | No disponible | No disponible | No disponible | Pública en HF |
| Políticas RL del stack Microduck (Pollen Robotics) | Políticas entrenadas en MuJoCo para el robot | No disponible | No disponible | Stack presentado como open source | Repositorio público, sin ficha de modelo comparable |
| Políticas de locomoción bípeda de propósito general | Control continuo de robots bípedos | No disponible | No disponible | Habitualmente no disponible | No disponible como artefacto ONNX listo para usar |

No se han identificado en la información disponible políticas de terceros directamente comparables para esta plataforma, ni fichas públicas con parámetros, contexto o métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no especificada: no puede asumirse permiso de uso comercial, redistribución ni modificación del grafo. Es el riesgo jurídico principal antes de integrarlo en un producto.
- Ausencia total de validación comunitaria: 0 descargas y 0 likes en el momento del registro, sin issues ni discusión pública asociada.
- Reproducibilidad incompleta: no se documentan arquitectura, parámetros, procedimiento de entrenamiento, semillas ni versiones, lo que impide replicar o auditar la política.
- Alcance funcional mínimo: una única habilidad de 10,5 s sin parámetros de configuración declarados; no admite condicionamiento semántico ni variación de estilo.
- Posible desajuste dimensional: la política emite 14 objetivos articulares mientras la documentación pública del robot cita 15 motores. La model card no aclara la correspondencia ni si un actuador queda sin consigna.
- Brecha sim-to-real no cuantificada: al no publicarse métricas de transferencia, el comportamiento real del giro y del tambaleo final en hardware distinto del usado en el entrenamiento es incierto.
- Sin gestión de fallos declarada: no se describe qué ocurre si la política recibe observaciones fuera de distribución, si se interrumpe la secuencia a mitad o si el robot pierde el equilibrio antes de lo previsto.
- Sin soporte multilingüe ni de lenguaje natural: no es aplicable integrarlo en flujos conversacionales, de razonamiento o de generación de código.
- El riesgo de alucinación no aplica en sentido estricto, pero sí existe riesgo de acción errónea: una política de control puede emitir consignas incorrectas ante estados no vistos, con consecuencias físicas sobre el robot o su entorno.
- Dependencia del ecosistema propietario del formato: la utilidad práctica está ligada a la aplicación MicroDuck y al `manifest.json`, cuyo esquema no se documenta en la ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-spinning-top
- Organización del autor en Hugging Face: https://huggingface.co/microduckapp
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Página oficial del producto Microduck: https://pollen-robotics.com/microduck/
- Cobertura de TechCrunch sobre el lanzamiento: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- Cobertura de MarkTechPost sobre el lanzamiento: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
