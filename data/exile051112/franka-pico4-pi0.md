# Exile051112/franka-pico4-pi0

## Resumen

El repositorio `Exile051112/franka-pico4-pi0` agrupa tres checkpoints LoRA independientes del modelo Pi0, un vision-language-action model (VLA) de flujo desarrollado por Physical Intelligence y publicado en su librería OpenPI. Cada checkpoint corresponde a una condición de entrenamiento distinta para manipulación robótica con brazos Franka y pinzas Pico4, diferenciadas por los objetos utilizados (rojo, amarillo, azul) y por si los datos son reales o editados. El modelo resuelve el problema de adaptar un VLA preentrenado a tareas de manipulación específicas mediante fine-tuning eficiente con LoRA, lo que permite desplegar políticas robóticas con recursos limitados. Su relevancia actual radica en la creciente adopción de VLA open source para robótica, donde Pi0 destaca por su preentrenamiento con más de 10 000 horas de datos robóticos. El repositorio tiene un tamaño de 0,1 GB y contiene los pesos en formato safetensors, aunque la información pública es escasa: no se especifican licencia, idiomas ni detalles de arquitectura más allá de la referencia a Pi0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0 (vision-language-action model de flujo, basado en transformer) |
| Parametros totales | no disponible (los checkpoints son LoRA, el modelo base Pi0 no se incluye) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Pi0 es un modelo VLA de flujo (flow-based) que combina un codificador de visión, un modelo de lenguaje y un decodificador de acciones, preentrenado por Physical Intelligence con más de 10 000 horas de datos robóticos heterogéneos. El repositorio contiene tres adaptadores LoRA entrenados sobre este modelo base para condiciones específicas de manipulación con Franka/Pico4: `c1_red_yellow_real` (objetos rojo y amarillo, datos reales), `c2_red_yellow_blue_real` (rojo, amarillo y azul, datos reales) y `c3_red_yellow_blue_edited` (rojo, amarillo y azul, con datos editados). No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. La innovación principal es el uso de LoRA para adaptar un VLA grande a tareas específicas, reduciendo drásticamente los requisitos de cómputo y almacenamiento frente a un fine-tuning completo.

## Capacidades

- Manipulación robótica: el modelo genera acciones de control para brazos robóticos Franka con pinza Pico4, a partir de observaciones visuales y posiblemente instrucciones en lenguaje.
- Visión-lenguaje-acción: al estar basado en Pi0, hereda la capacidad de mapear entradas visuales y textuales a comandos de acción.
- Adaptación a condiciones específicas: cada LoRA está entrenado para una configuración concreta de objetos (rojo, amarillo, azul) y tipo de datos (reales o editados).
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso, capacidades multilingües o modos especiales como thinking mode.

## Casos de uso

- Automatización de picking y placing en entornos controlados: el modelo puede controlar un brazo Franka para recoger y colocar objetos de colores específicos (rojo, amarillo, azul) en una celda de trabajo, gracias a su entrenamiento con datos reales de estas condiciones.
- Investigación en robótica manipulativa: los checkpoints LoRA permiten a laboratorios reproducir experimentos de manipulación con Pi0 sin necesidad de entrenar desde cero, usando los subdirectorios como políticas listas para cargar.
- Evaluación de robustez frente a datos editados: la condición `c3_red_yellow_blue_edited` permite comparar el rendimiento de una política entrenada con datos sintéticos o modificados frente a las versiones con datos reales, útil para estudiar el impacto de la calidad del dataset.
- Desarrollo de pipelines de despliegue con OpenPI: el repositorio se integra con el ecosistema OpenPI, que incluye herramientas de recolección de datos, entrenamiento e inferencia para VLA en plataformas como Franka.
- Fine-tuning incremental para nuevas tareas: los adaptadores LoRA pueden servir como punto de partida para añadir nuevas condiciones de objetos o entornos, reduciendo el coste de entrenamiento.
- Benchmarking de VLA en hardware real: investigadores pueden usar estos checkpoints para medir latencia, precisión y tasa de éxito en un brazo Franka físico, comparando con otras políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de éxito, tasas de precisión ni comparaciones con otros modelos.

## Requisitos de hardware

- No se dispone de datos específicos de VRAM, GPU recomendadas ni latencia para estos checkpoints LoRA.
- El modelo base Pi0, al ser un VLA de flujo con cientos de millones de parámetros, requiere típicamente GPUs con al menos 24 GB de VRAM para inferencia en tiempo real, pero esto no está confirmado para este repositorio.
- Para el despliegue, se puede utilizar el stack de OpenPI (que incluye soporte para vLLM y otros servidores de inferencia), aunque no se especifica en la documentación.
- Dado el tamaño del repositorio (0,1 GB), los adaptadores LoRA son ligeros, pero el modelo base debe descargarse por separado desde OpenPI.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un adaptador LoRA sobre Pi0, y no se conocen otros repositorios públicos con las mismas condiciones de entrenamiento (Franka/Pico4 con objetos de colores). Alternativas genéricas en el espacio VLA incluyen OpenVLA (7B, basado en Prismatic) y RT-2 de Google, pero no hay datos de rendimiento comparables en este contexto.

## Limitaciones y advertencias

- Ausencia de licencia explícita: el repositorio no declara licencia, lo que impide su uso comercial o incluso académico sin autorización expresa del autor. Se debe contactar con el autor antes de cualquier uso.
- Información técnica incompleta: no se documentan parámetros, contexto, idiomas ni detalles de entrenamiento, lo que dificulta la reproducibilidad y la evaluación.
- Riesgo de sobreajuste: los LoRA están entrenados para condiciones muy específicas (objetos de colores concretos, posiblemente posiciones fijas), por lo que su generalización a otros entornos u objetos es incierta.
- Dependencia del modelo base: los checkpoints requieren el modelo Pi0 original de OpenPI, que tiene su propia licencia y requisitos de hardware.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas reales, por lo que no se puede validar su eficacia.
- Fecha de creación futura: el repositorio está fechado en agosto de 2026, lo que sugiere que puede ser un artefacto de prueba o un error de fecha; se recomienda verificar su autenticidad.

## Enlaces

- Repositorio principal: https://huggingface.co/Exile051112/franka-pico4-pi0
- Subdirectorio c1: https://huggingface.co/Exile051112/franka-pico4-pi0-c1-red-yellow-real
- Subdirectorio c3: https://huggingface.co/Exile051112/franka-pico4-pi0-c3-red-yellow-blue-edited
- Repositorio OpenPI en GitHub: https://github.com/Shenzhaolong1330/openpi-franka
- Pipeline de despliegue OpenPI en Franka: https://github.com/Thu-WangMX/OpenPI-series-deployments-on-Franka
- Sitio de OpenPI: https://www.openpi.net/english.html
