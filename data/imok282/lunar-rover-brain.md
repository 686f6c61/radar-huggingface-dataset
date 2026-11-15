# Imok282/lunar-rover-brain

## Resumen

Adinfinitium Lunar Rover Brain v3 / v3.1 es un sistema de planificación para la navegación de rovers lunares desarrollado por el equipo Adinfinitium en el marco del proyecto *Lunar Landing Site Navigator* de la NASA Space Apps 2026. A diferencia de lo que sugiere su publicación en Hugging Face, no se trata de un modelo de aprendizaje automático con pesos entrenados: el repositorio contiene únicamente ficheros de configuración desplegados (`rover_brain_v3_config.json` y `rover_brain_v31_config.json`), y el autor lo describe explícitamente como "scripted, 0 learned parameters". El planificador genera múltiples planes candidatos por rover dentro del propio modelo del rover y selecciona uno; una capa de autoaprendizaje con compuertas adapta los mapas de creencia y los umbrales.

El sistema se integra en una cadena de procesamiento más amplia que incluye una red de peligrosidad (U-Net, publicada como `lunar-hazard-unet`), una red de iluminación, un modelo de terreno y un piloto de aterrizaje. Lee el mapa de peligrosidad generado por la U-Net y emplea ray-casting físico exacto para calcular la iluminación. Los datos de terreno provienen de modelos digitales de elevación LOLA de la NASA a 5 m de resolución del polo sur lunar.

Su relevancia es fundamentalmente investigadora y educativa: publica resultados de simulación sobre sitios retenidos (no vistos durante el desarrollo) y documenta explícitamente sus limitaciones, incluido que v3.1 pierde más de la mitad de sus rovers en pruebas estrictas. La licencia Apache 2.0 permite reutilización, pero el autor advierte que no es apto para vuelo ni para decisiones operativas de aterrizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Planificador basado en reglas (scripted) con generación de planes candidatos y capa de autoaprendizaje con compuertas; sin pesos neuronales propios |
| Parametros totales | 0 parámetros aprendidos |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No aplica (ficheros de configuración JSON) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON (`rover_brain_v3_config.json`, `rover_brain_v31_config.json`) |

## Arquitectura y entrenamiento

El sistema no es un transformer ni un modelo neuronal entrenado. Se trata de un planificador determinista que, para cada rover, genera numerosos planes candidatos dentro del modelo del propio rover y selecciona uno según criterios internos. Sobre esta base se añade una capa de autoaprendizaje con compuertas que adapta los mapas de creencia y los umbrales de decisión. El sistema consume el mapa de peligrosidad producido por una U-Net independiente (`lunar-hazard-unet`) y calcula la iluminación mediante ray-casting físico exacto sobre el modelo de elevación.

No hay datos de entrenamiento en el sentido habitual: no se especifican tokens, composición de dataset ni fases de RLHF o DPO, porque no existen parámetros aprendidos en este repositorio. Los modelos de la cadena (U-Net de peligrosidad, red de luz) se congelaron con SHA-256 antes de la evaluación en sitios retenidos, y los sitios de prueba se evaluaron una sola vez. Los datos de terreno proceden de los modelos digitales de elevación LOLA de la NASA a 5 m de resolución del polo sur lunar. El código fuente, los registros completos y el paquete de traspaso están en el repositorio de GitHub del proyecto, con los valores SHA-256 de los checkpoints en `CHECKPOINTS.sha256`.

## Capacidades

- Planificación de trayectorias para rovers lunares en entornos del polo sur lunar, con generación y selección de múltiples planes candidatos por rover.
- Adaptación de mapas de creencia y umbrales de decisión mediante una capa de autoaprendizaje con compuertas.
- Integración con mapas de peligrosidad generados por una red U-Net externa.
- Cálculo de iluminación mediante ray-casting físico exacto sobre modelos digitales de elevación.
- Operación en simulación sobre sitios retenidos no vistos durante el desarrollo.
- No dispone de generación de texto, razonamiento lingüístico, código, matemáticas, visión genérica, tool calling, capacidades de agente conversacional ni soporte multilingüe.

## Casos de uso

- Investigación en planificación de rovers lunares: el sistema sirve como línea base reproducible para comparar planificadores basados en reglas frente a alternativas aprendidas, con resultados publicados sobre sitios retenidos y código disponible en GitHub.
- Evaluación de cadenas de percepción-planificación: permite probar cómo afecta la calidad del mapa de peligrosidad de la U-Net al rendimiento final del planificador, ya que el brain consume directamente esa salida.
- Docencia y divulgación en robótica espacial: al no tener pesos ni requerir GPU, es adecuado para explicar el pipeline completo (peligrosidad, iluminación, terreno, planificación) en cursos y talleres.
- Reproducción de experimentos de Space Apps: el paquete de traspaso con registros y checkpoints SHA-256 permite replicar los resultados de simulación y auditar la metodología.
- Estudio de iluminación en el polo sur lunar: el ray-casting físico exacto sobre DEM LOLA a 5 m permite analizar la disponibilidad de luz solar en trayectorias concretas, relevante para el diseño de misiones de energía solar.
- Desarrollo de planificadores híbridos: la capa de autoaprendizaje con compuertas puede servir de inspiración o componente en sistemas que combinen reglas deterministas con adaptación en línea, siempre en entorno de simulación.

## Benchmarks y rendimiento

Resultados de simulación publicados en la model card (no rendimiento real de misión):

| Brain | Conjunto de prueba | Regla | Retornados | Perdidos |
|---|---|---|---|---|
| v3 | seis sitios nuevos | permisiva | 59,6% | 0,0% |
| v3 | seis sitios nuevos | estricta | 42,0% | 56,7% |
| v3.1 | cuatro sitios intactos (LM2-LM5), 8.192 rovers | estricta | 33,7% | 53,9% |
| v3 (mismos sitios) | cuatro sitios intactos | estricta | 31,0% | 61,0% |
| Planificador ingenuo | cuatro sitios intactos | estricta | 17,9% | 81,8% |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el sistema no ejecuta pesos neuronales propios y solo carga ficheros de configuración JSON.
- GPU recomendadas: no disponibles para este componente; la U-Net de peligrosidad asociada (`lunar-hazard-unet`) sí requeriría GPU, pero sus requisitos no se detallan en la información disponible.
- Cabe en cualquier equipo consumer: al no tener parámetros aprendidos, el planificador puede ejecutarse en CPU.
- Opciones de despliegue: ejecución directa del código del repositorio de GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de sistema.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Sistema | Parámetros | Contexto | Rendimiento (estricto, sitios retenidos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adinfinitium Lunar Rover Brain v3.1 | 0 aprendidos | No aplica | 33,7% retornados, 53,9% perdidos | Apache 2.0 | Hugging Face + GitHub |
| Adinfinitium Lunar Rover Brain v3 | 0 aprendidos | No aplica | 31,0% retornados, 61,0% perdidos | Apache 2.0 | Hugging Face + GitHub |
| Planificador ingenuo (referencia del propio proyecto) | No disponible | No aplica | 17,9% retornados, 81,8% perdidos | No disponible | Referencia interna del proyecto |

No se dispone de información sobre otros planificadores de rovers lunares comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo aprendido: el repositorio contiene solo configuración; no hay pesos que cargar ni inferencia neuronal que ejecutar en este componente.
- v3.1 pierde más de la mitad de sus rovers en la evaluación estricta (53,9%); de los 583 rovers salvados, 419 solo sobrevivieron en terreno iluminado sin completar el trayecto.
- El resultado "cero perdidos" de v3 en la regla permisiva se debe a una regla del simulador que perdona una batería vacía a menos de 20 m del módulo de aterrizaje; no es un resultado robusto.
- Los cuatro sitios de prueba de v3.1 son vecinos entre sí, por lo que el intervalo de confianza de los resultados es aproximado.
- Todos los números proceden de simulación y de sitios retenidos copiados de los registros del proyecto, no de rendimiento en misión real.
- No apto para vuelo, para decisiones de aterrizaje safety-critical ni para uso operativo; el autor lo restringe a investigación y educación.
- No se documentan sesgos, alucinaciones ni limitaciones idiomáticas porque el sistema no procesa lenguaje natural; esas categorías no aplican.
- La licencia Apache 2.0 permite uso comercial del código, pero la advertencia del autor sobre su falta de idoneidad operativa debe respetarse en cualquier despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/Imok282/lunar-rover-brain
- Repositorio GitHub (código, registros y paquete de traspaso): https://github.com/oasisk/adinfinitium-handoff
- Modelo asociado de peligrosidad: `lunar-hazard-unet` (referenciado en la model card; URL no disponible en la información proporcionada)
