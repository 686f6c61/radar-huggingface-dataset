# microduckapp/microduck-hello-there

## Resumen

`microduck-hello-there` es un artefacto de comportamiento para el robot bípedo Microduck, publicado por la cuenta `microduckapp`. No es un modelo de lenguaje ni un modelo fundacional: es una política de control que reproduce un saludo de 10,6 segundos, con 61 observaciones de entrada y 14 objetivos articulares de salida a 50 Hz.

El robot Microduck se presenta en la información web como una plataforma abierta de IA física de 25 cm y 800 g, asociada a Pollen Robotics y Hugging Face, orientada a experimentar con aprendizaje por refuerzo y transferencia de comportamientos desde simulación a hardware real. En ese contexto, este repositorio es relevante porque muestra cómo se empaqueta y distribuye un movimiento concreto —ONNX, manifiesto de instalación y vídeo de previsualización— para que otros usuarios puedan instalarlo y reproducirlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control en ONNX; topología interna no documentada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`); `manifest.json`; `media/preview.mp4` |
| Entrada | 61 observaciones |
| Salida | 14 objetivos articulares |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 10,6 s |
| Tamaño del repositorio | 0.0 GB (redondeado por Hugging Face) |
| Pipeline | robotics |

## Arquitectura y entrenamiento

No se documenta la topología interna de la política: la información disponible no indica si se trata de una red transformer, un perceptrón multicapa, una política recurrente u otra arquitectura. Tampoco se especifican el número de parámetros, la función de pérdida, el algoritmo de entrenamiento, la composición del dataset ni si hubo aprendizaje por refuerzo, imitación, RLHF o DPO.

Los únicos datos técnicos confirmados son la interfaz de control —61 observaciones de entrada, 14 objetivos articulares de salida y una frecuencia de 50 Hz— y el empaquetado del comportamiento en un fichero ONNX acompañado de un manifiesto de instalación y un vídeo de previsualización. La innovación destacable es, por tanto, el formato de distribución reproducible de un movimiento para el robot Microduck, no una técnica de entrenamiento documentada.

## Capacidades

- Ejecuta un movimiento de saludo de 10,6 segundos para el robot Microduck, descrito como una reverencia con inclinación de cabeza y saludo.
- Transforma 61 observaciones en 14 objetivos articulares a 50 Hz, lo que define una política de control de bucle cerrado con un presupuesto temporal de 20 ms por ciclo.
- Se instala y reproduce mediante `manifest.json`, que indica al robot qué necesita para instalar y ejecutar el movimiento.
- Incluye `media/preview.mp4` como referencia visual del comportamiento.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni multilingüismo.
- No se documentan modos especiales como thinking mode, function calling o razonamiento multi-paso.

## Casos de uso

- Demostración de bienvenida en ferias y eventos: el robot puede ejecutar un saludo de 10,6 segundos al detectar la presencia de una persona, usando el manifiesto para instalar el movimiento en la unidad de exposición.
- Onboarding de desarrolladores: sirve como primer comportamiento de prueba para validar el flujo de instalación, reproducción y control a 50 Hz antes de desarrollar políticas propias.
- Validación de reproducibilidad entre unidades: permite comprobar si el mismo `policy.onnx` produce el mismo movimiento en distintos ejemplares de Microduck y detectar diferencias de calibración.
- Pruebas de interacción humano-robot: el saludo puede utilizarse en estudios preliminares de percepción, proximidad y aceptación social del robot en entornos controlados.
- Docencia y divulgación: el repositorio permite ilustrar cómo se empaqueta una política de control en ONNX y cómo se separa el comportamiento del manifiesto de instalación.
- Evaluación de latencia de control: al ejecutarse a 50 Hz, el movimiento sirve para medir el cumplimiento del presupuesto de 20 ms por ciclo en el hardware objetivo.
- Producción de contenido audiovisual: el vídeo de previsualización y el movimiento pueden emplearse en material de marketing, documentación o demostraciones grabadas del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de control robótico como tasa de éxito, retorno acumulado, robustez ante perturbaciones o transferencia sim-to-real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se especifican requisitos de GPU ni memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que el movimiento se ejecute en GPU.
- Opciones de despliegue: el artefacto está en formato ONNX, por lo que requiere un runtime compatible con ONNX; el manifiesto indica la instalación y reproducción en la aplicación MicroDuck, pero no se detalla el stack de ejecución.
- Latencia y throughput: no disponibles. La frecuencia de 50 Hz implica un presupuesto de 20 ms por ciclo de control.
- Tamaño del repositorio: 0.0 GB según Hugging Face, un valor redondeado que no permite estimar con precisión los requisitos de memoria.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `microduck-hello-there` | Política de movimiento ONNX | no disponible | no aplica | no disponible | no disponible | Hugging Face; 0 descargas, 0 likes |
| Políticas comparables de Microduck | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos de robótica comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado alternativas comparables en la información disponible. La comparación cuantitativa con otras políticas de movimiento para Microduck no es posible con los datos proporcionados.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona sobre instrucciones y no soporta tool calling ni agentes.
- La licencia no está disponible; no se puede asumir que el uso comercial esté permitido sin consultar al autor.
- No se documentan sesgos conocidos; al ser una política de control, los riesgos relevantes serían de comportamiento no deseado o de desajuste entre simulación y hardware.
- El riesgo de alucinación no aplica en el sentido de generación de texto; el riesgo es la ejecución incorrecta del movimiento o un fallo de control.
- No hay soporte de idiomas ni contexto textual: la entrada es un vector de 61 observaciones, no una secuencia de tokens.
- El comportamiento está especializado en un único movimiento de 10,6 segundos; no es una política generalista de locomoción o manipulación.
- La interfaz de 61 observaciones y 14 articulaciones está ligada a la morfología de Microduck; no es directamente portable a otro robot sin adaptación.
- No se documentan la arquitectura, los datos de entrenamiento ni el proceso de validación, lo que limita la reproducibilidad y la evaluación de riesgos.
- Para uso en producción es necesario validar límites articulares, parada de emergencia, repetibilidad y comportamiento ante perturbaciones en el hardware real.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/microduckapp/microduck-hello-there
- Previsualización del movimiento: `media/preview.mp4` dentro del repositorio de Hugging Face
- Artículo de MarkTechPost: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Ficha de Microduck en ROBOTS: https://robotsguide.com/robots/microduck
- Artículo de Tech360: https://www.tech360.tv/hugging-face-unveils-microduck-new-open-source-biped-ai-robot-2026-31-08
- Artículo de The AI Insider: https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
- Artículo de TechCrunch: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
