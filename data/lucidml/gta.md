# lucidml/gta

## Resumen

GTA es un modelo de mundo interactivo (world model) desarrollado por lucidml que genera vídeo de forma autorregresiva, un fotograma a la vez, a partir de una única imagen inicial. Su propósito es servir como motor de simulación visual en tiempo real: el usuario mantiene pulsadas teclas y el modelo produce y transmite por streaming el vídeo que continúa la escena, actuando como un entorno jugable generado por IA. El checkpoint publicado se ha entrenado desde cero sobre GG800, un dataset propio de 800 horas de GTA V.

La arquitectura, denominada Summaryformer, es un transformer autorregresivo con un diseño de memoria jerárquica original. Cada fotograma se representa como un registro compuesto por 1.008 tokens crudos (rejilla latente de 24x42 a la resolución servida de 384x672) más 96 tokens de resumen generados por el propio forward pass del modelo. Los fotogramas recientes se conservan a resolución completa y los antiguos solo mediante sus resúmenes, lo que reduce el buffer de atención de 26.208 a 6.528 claves para la misma ventana temporal.

El repositorio (3,4 GB) incluye los pesos y el runtime de inferencia completo: modelo, memoria, sampler y servidor de streaming, pero no el código de entrenamiento. La licencia es Apache 2.0. Es relevante por su enfoque de memoria de largo horizonte sin summarizer separado y por estar entrenado en hardware de consumo, lo que lo sitúa como una alternativa abierta a los world models propietarios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Summaryformer (transformer autorregresivo con memoria jerárquica de tokens de resumen) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de memoria de 24 fotogramas corporales (96 RGB); el servidor sirve 16 por defecto; 6.528 claves en buffer |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de generación de vídeo, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repo contiene pesos y runtime de inferencia; no se especifica el formato) |

## Arquitectura y entrenamiento

Summaryformer es un transformer autorregresivo que genera latentes de vídeo fotograma a fotograma. Cada fotograma entra al modelo como un registro de dos partes: 1.008 tokens crudos (la rejilla latente de 24x42 a 384x672) y 96 tokens de resumen sin posición en la rejilla, inicializados con un embedding aprendido y procesados en los mismos 28 bloques que los tokens crudos. El resumen es un subproducto del forward pass de generación, sin red summarizer ni pase adicional. Un fotograma corporal de latentes decodifica a 4 fotogramas RGB, de modo que la ventana de 24 cubre 96 fotogramas RGB.

La atención de cada fotograma cubre: sus propios tokens, los últimos Y=2 fotogramas como registros completos, los fotogramas más antiguos dentro de la ventana W=24 solo mediante sus 96 tokens de resumen, y el fotograma 0 (imagen inicial) siempre completo y nunca expulsado. Todo reside en un único buffer preasignado de clave/valor por bloque sin máscara de atención: al salir un fotograma de la ventana cruda, se copian sus 96 filas de resumen de RAW a SUM. Para distinguir tokens crudos de resumen sin embedding de tipo, se usan los dos planos de menor frecuencia del RoPE temporal como eje de nivel, aplicando un cuarto de vuelta exacto a los tokens de resumen. Para sesiones largas, las claves de la imagen inicial se rotan hacia delante in situ cuando la distancia con el fotograma más antiguo en memoria llega a 5, manteniendo el hueco en 1 sin recomputar valores. El entrenamiento se realizó desde cero sobre GG800 (800 horas de GTA V); no se detallan número de tokens, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de vídeo autorregresiva condicionada por imagen (image-to-video) a partir de un único fotograma inicial.
- Simulación interactiva en tiempo real: el modelo responde a la entrada del usuario (pulsaciones de teclas) generando el vídeo que continúa la escena.
- Streaming de fotogramas a un navegador durante la interacción.
- Memoria de largo horizonte mediante tokens de resumen, que preservan información de hasta 24 fotogramas corporales (96 RGB) hacia atrás.
- Anclaje de escena: la imagen inicial se mantiene siempre en memoria y se reajusta temporalmente para sesiones prolongadas.
- Generación de latentes de vídeo a resolución 384x672.
- No se documentan capacidades de texto, código, matemáticas, tool calling, agentes ni multilingüismo; es un modelo exclusivamente visual.

## Casos de uso

- Prototipado de videojuegos interactivos generativos: el modelo actúa como motor de mundo que responde a la entrada del jugador en tiempo real, permitiendo explorar mecánicas de juego sin assets pregenerados.
- Demos y experiencias web interactivas: el runtime incluye servidor de streaming, de modo que puede desplegarse como demo jugable en navegador (el autor ofrece una en lucidml.ai).
- Investigación en world models: la arquitectura Summaryformer y su esquema de memoria jerárquica sirven como base reproducible para estudiar atención de largo horizonte en generación de vídeo.
- Generación de vídeo condicionada por imagen para previsualización de escenas: dado un fotograma de referencia, producir la continuación animada de la escena con coherencia temporal.
- Simulación de entornos para entrenamiento de agentes: un mundo generado interactivo puede usarse como entorno sintético donde agentes aprenden por refuerzo sin un motor físico tradicional.
- Benchmarking de memoria en transformers autorregresivos: la reducción de 26.208 a 6.528 claves con ventana equivalente permite medir el equilibrio entre detalle reciente y contexto lejano en tareas de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 3,4 GB, lo que da una cota inferior del tamaño de los pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: el autor indica que llegó a la arquitectura tras probar ideas en hardware de consumo, pero no se especifican modelos concretos.
- Opciones de despliegue: el repositorio incluye un runtime de inferencia propio con sampler y servidor de streaming; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vídeo de este tipo).
- Latencia y throughput: no disponibles; el modelo se describe como de generación en tiempo real, pero no se aportan cifras de FPS ni latencia por fotograma.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (world models interactivos de vídeo) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se han documentado sesgos conocidos; al entrenarse sobre 800 horas de GTA V, es esperable que herede el sesgo visual y de contenido de ese videojuego, aunque no se detalla.
- Riesgo de alucinación visual: al ser un modelo generativo autorregresivo, la escena puede derivar y perder coherencia con la imagen inicial en sesiones largas, pese al anclaje del fotograma 0.
- Limitación de contexto: la memoria de largo plazo se limita a 24 fotogramas corporales (96 RGB), y el servidor sirve 16 por defecto; lo anterior a esa ventana se olvida por completo.
- Resolución fija de 384x672; no se documentan otras resoluciones.
- El repositorio no incluye código de entrenamiento, lo que limita la reproducibilidad y el ajuste fino.
- No se especifican los formatos de pesos ni opciones de cuantización, lo que dificulta estimar requisitos de despliegue en producción.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento (GTA V) para usos derivados.
- No hay datos de benchmarks ni de latencia, por lo que no puede evaluarse su rendimiento frente a alternativas antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucidml/gta
- Demo interactiva en navegador: https://lucidml.ai/dashboard/minidemo?world=gta5
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs o repositorios.
