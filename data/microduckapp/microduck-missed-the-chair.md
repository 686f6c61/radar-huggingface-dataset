# microduckapp/microduck-missed-the-chair

## Resumen
`microduck-missed-the-chair` es una política de movimiento para el robot bípedo Microduck, publicada por el usuario `microduckapp` en Hugging Face dentro del pipeline `robotics`. No es un modelo de lenguaje ni un modelo fundacional: el repositorio contiene `policy.onnx`, un `manifest.json` con lo que el robot necesita para instalar y reproducir el movimiento, y un vídeo de previsualización en `media/preview.mp4`.

La política define una secuencia de 10,7 segundos que recibe 61 observaciones y emite 14 objetivos articulares a 50 Hz. La model card describe la actuación como un movimiento expresivo: el robot retrocede buscando una silla que no está, se sobresalta, mira a ambos lados y se encoge de hombros. El manifest actúa como contrato de instalación para la app MicroDuck.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de empaquetado y despliegue de comportamientos para Microduck y permite validar el runtime de la app. No hay información pública sobre arquitectura interna, datos de entrenamiento, licencia ni benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política robótica en ONNX; arquitectura interna no documentada |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible (no aplica a una política robótica) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) |
| Tarea | Robótica (`robotics`) |
| Entrada | 61 observaciones |
| Salida | 14 objetivos articulares |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 10,7 s |
| Artefactos incluidos | `policy.onnx`, `manifest.json`, `media/preview.mp4` |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
La información disponible no describe la arquitectura interna de la política. Se sabe que se distribuye como un artefacto ONNX y que el bucle de control opera a 50 Hz, con 61 observaciones de entrada y 14 consignas articulares de salida. No se documenta si el entrenamiento fue por refuerzo, imitación, aprendizaje supervisado o animación por keyframes, ni el volumen o la composición de los datos utilizados.

Tampoco se detallan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de adaptación en tiempo real. El `manifest.json` funciona como contrato de instalación y reproducción para la app MicroDuck, pero no se especifican las dependencias exactas ni el hardware de control necesario.

## Capacidades
- Ejecución de una secuencia coreografiada de 10,7 segundos para el robot Microduck.
- Interfaz de control de 61 observaciones de entrada y 14 objetivos articulares de salida a 50 Hz.
- Comportamiento expresivo no verbal: retroceso, sobresalto, mirada a ambos lados y encogimiento de hombros.
- Integración mediante `manifest.json` para instalar y reproducir el movimiento desde la app MicroDuck.
- Distribución como política ONNX, apta para su ejecución en el runtime compatible con Microduck Move.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni multilingüismo; no aplican a este artefacto.
- No se documenta percepción real de sillas ni adaptación al entorno; la descripción corresponde a la secuencia de movimiento.

## Casos de uso
- Reproducción de comportamiento en un Microduck compatible: instalar `policy.onnx` y `manifest.json` mediante la app MicroDuck para ejecutar la secuencia de 10,7 segundos como demostración de expresividad.
- Validación del runtime Microduck Move: comprobar que el sistema acepta 61 observaciones, genera 14 objetivos articulares y mantiene el bucle a 50 Hz.
- Creación de paquetes de comportamiento: usar el repositorio como plantilla para empaquetar nuevas políticas ONNX con su manifest y vídeo de previsualización.
- Demostraciones educativas de robótica bípeda: mostrar una secuencia no verbal comprensible para explicar control articular, frecuencia de control y reproducción de movimientos.
- Pruebas de aceptación de hardware: ejecutar la secuencia para verificar que los 14 actuadores responden y que el robot completa el movimiento sin fallos de integración.
- Prototipado de interacción humano-robot: emplear el sobresalto y el encogimiento de hombros como recursos de comunicación no verbal en estudios preliminares, asumiendo que la secuencia es fija.
- Evaluación cualitativa frente a otras políticas de Microduck: comparar el resultado real con `media/preview.mp4` para detectar diferencias de ejecución o calibración.
- Generación de contenido audiovisual: grabar la secuencia para vídeos de producto, tutoriales o documentación técnica del robot.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, tasas de éxito de la política, latencia real ni métricas de robustez.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. No es un modelo generativo y no se publica una huella de memoria; el repositorio ocupa 0,0 GB.
- GPU recomendadas: no disponibles. La inferencia está orientada al hardware del robot Microduck y no se documenta una GPU concreta.
- Compatibilidad con GPU de consumo: no disponible. No se documenta ejecución en RTX 4090, RTX 5090 u otras GPU de consumo.
- Despliegue: runtime ONNX compatible con Microduck Move y la app MicroDuck, usando `manifest.json` para la instalación. vLLM, llama.cpp, Ollama y TGI no aplican a este artefacto.
- Latencia y throughput: la frecuencia de control documentada es de 50 Hz, equivalente a un periodo de 20 ms. La latencia real, el consumo de CPU y el throughput no están disponibles.
- Almacenamiento: el repositorio tiene un tamaño de 0,0 GB; no se detalla el tamaño exacto de `policy.onnx`.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `microduck-missed-the-chair` | Política ONNX para Microduck; 10,7 s | no disponible | no aplica | no disponible | no disponible | Hugging Face; 0 descargas |
| `microduck-midnight-snack` | Política robótica de `microduckapp` | no disponible | no aplica | no disponible | no disponible | Hugging Face, según la búsqueda web |
| Políticas de marcha de la comunidad Microduck | Políticas de locomoción para Microduck | no disponible | no aplica | no disponible | no disponible | Publicaciones en Hugging Face, sin ID confirmado en la información disponible |

No hay datos públicos suficientes para comparar parámetros, rendimiento o licencia con alternativas. La comparación disponible se limita a la categoría de uso: políticas de movimiento para el robot Microduck.

## Limitaciones y advertencias
- La licencia no está disponible, por lo que no se puede confirmar si el uso comercial está permitido.
- No se documenta la arquitectura interna ni el proceso de entrenamiento, lo que impide evaluar robustez, sesgos o generalización.
- El movimiento es una secuencia fija de 10,7 segundos; no se documenta adaptación a obstáculos, percepción real de sillas ni reactividad ante cambios del entorno.
- No hay benchmarks, métricas de éxito ni validación comunitaria; el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- El riesgo de alucinación no aplica en el sentido de un modelo de lenguaje, pero sí existe riesgo de ejecución incorrecta si el vector de 61 observaciones no coincide con el esperado.
- La integración requiere un robot Microduck compatible y la app o runtime Microduck Move; no se documenta compatibilidad con otras plataformas.
- No se detallan los sensores que componen las 61 observaciones ni las unidades de los 14 objetivos articulares, lo que puede dificultar la reutilización fuera del entorno previsto.
- Al tratarse de un movimiento físico, debe probarse en un entorno seguro y con los límites articulares del robot verificados antes de su ejecución.

## Enlaces
- [Hugging Face: microduckapp/microduck-missed-the-chair](https://huggingface.co/microduckapp/microduck-missed-the-chair)
- [Perfil de microduckapp en Hugging Face](https://huggingface.co/microduckapp)
- [GitHub: pollen-robotics/microduck](https://github.com/pollen-robotics/microduck)
- [GitHub: AI-FanGe/Microduck-build-tutorial](https://github.com/AI-FanGe/Microduck-build-tutorial)
- [Sitio oficial de Microduck](https://microducks.org/)
- [Publicación en X sobre políticas de marcha de Microduck](https://x.com/witcheer/status/2113933525669867989)
- Vídeo de previsualización: `media/preview.mp4` dentro del repositorio de Hugging Face.
