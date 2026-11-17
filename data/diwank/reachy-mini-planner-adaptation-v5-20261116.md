# diwank/reachy-mini-planner-adaptation-v5-20261116

## Resumen

Adaptador PEFT (LoRA) publicado por diwank sobre el modelo base `binhpham/reachy-mini-motion-planner-4b`, un planificador de movimiento de 4B parámetros orientado al robot de sobremesa Reachy Mini. El adaptador se entrena mediante GRPO (20 actualizaciones, 320 completions muestreadas) para adaptar el planificador a distintos modos de ejecución motora: reproducción directa (direct playback) y reproducción residual sobre un generador de trayectorias congelado. El repositorio contiene dos adaptadores (`direct-adapter/` y `residual-adapter/`) que, según la propia model card, parten de los mismos pesos iniciales y no incorporan una mejora de entrenamiento demostrada.

La relevancia de esta ficha es metodológica más que de rendimiento: el autor documenta explícitamente que la evaluación no estableció ninguna mejora sobre el planificador inicial, que la inferencia greedy repetida produjo variaciones no deterministas (24/200, 25/200 y 23/200 completions distintas entre pasadas idénticas) y que los adaptadores seleccionados corresponden al step 0, es decir, al checkpoint inicial sin modificar. Se trata de un artefacto de investigación (tag `research-pilot`) con divulgación completa de resultados negativos, útil para quienes trabajan en adaptación de planificadores robóticos con RL y quieran replicar o auditar el pipeline.

El modelo está pensado para integrarse en una pila mayor: requiere extraer el decodificador de texto del checkpoint multimodal original mediante `code/motion_tuning/model.py`, cargar el tokenizador de la misma revisión base y, en el caso del adaptador residual, emparejarse con el generador de trayectorias v4 congelado. No es una aplicación robótica autónoma ni un reemplazo de los assets de replay calibrados de Loopy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un planificador multimodal de base; el decodificador de texto se extrae del checkpoint base con `load_text_model` |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el modelo base es de 4B según su identificador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA en `direct-adapter/` y `residual-adapter/`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `binhpham/reachy-mini-motion-planner-4b`, un planificador de movimiento multimodal del que este repositorio solo utiliza el decodificador de texto. El entrenamiento emplea GRPO con 20 actualizaciones y 320 completions muestreadas, partiendo de un adaptador RL previo. Durante el entrenamiento solo se actualizan los pesos del planificador; el generador de trayectorias residual permanece congelado. Se trata de la primera etapa de adaptación al ejecutor, no de un entrenamiento conjunto alternado o simultáneo.

El diseño experimental contempla dos brazos: un adaptador para reproducción directa y otro para reproducción residual sobre el generador v4. Ambos arrancan de los mismos pesos y, según la model card, el proceso de desarrollo seleccionó el step 0 en los dos casos, es decir, el planificador inicial sin cambios. La evaluación se realizó sobre 200 tareas sintéticas agrupadas en 50 grupos de pose/objetivo, con diez familias de gestos conocidas y paráfrasis escritas por el autor, un rubric compartido de entrenamiento y evaluación y una única semilla de entrenamiento. No se midieron valoraciones humanas de calidad del movimiento ni aceptación en robot físico.

## Capacidades

- Planificación de movimiento para el robot Reachy Mini a partir de instrucciones en lenguaje natural y del estado de pose actual.
- Generación de comandos de movimiento en dos modalidades: reproducción directa y reproducción residual sobre un generador de trayectorias congelado.
- Condicionamiento por pose actual (current-pose conditioning) y anclaje de pose a nivel de aplicación.
- Integración con un contrato de prompt de estado definido en `motion-contract.json`.
- Soporte de tool calling, agentes multi-step, visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en adaptación de planificadores robóticos con RL: el repositorio sirve como artefacto reproducible de un experimento GRPO con divulgación completa de resultados negativos, incluidos los ficheros `report.md` y `analysis.json` con las seis celdas de test en bruto y los alias canónicos.
- Auditoría de no determinismo en inferencia greedy: los datos de repetición (24/200, 25/200 y 23/200 completions distintas entre pasadas idénticas) permiten estudiar la variabilidad de la decodificación greedy en este stack concreto.
- Reproducción de la pila de evaluación: las 200 tareas sintéticas en 50 grupos de pose/objetivo y el rubric compartido permiten replicar la comparación entre reproducción directa y residual con las mismas completions de baseline.
- Desarrollo de controladores de seguridad para Reachy Mini: el adaptador se documenta como dependiente de un controlador de seguridad y anclaje de pose a nivel de aplicación, lo que lo hace útil como componente en pipelines de validación de movimiento.
- Base para experimentos de adaptación al ejecutor en dos etapas: el repositorio documenta explícitamente que esta es la primera etapa (adaptación al ejecutor) y no un entrenamiento conjunto, lo que sirve de punto de partida para diseñar la segunda etapa.
- Integración en el ecosistema Loopy: el adaptador residual se empareja con el generador v4 (receta nominal, ocho pasos Euler, CFG 1, filtrado a 4 Hz), lo que permite probar la sustitución del planificador dentro de una pila de replay ya existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card reporta únicamente métricas de repetibilidad de la inferencia (no de calidad): 24/200, 25/200 y 23/200 completions distintas entre pasadas greedy idénticas (baseline vs. selected-direct, baseline vs. selected-residual y selected-direct vs. selected-residual, respectivamente). El autor indica explícitamente que estas diferencias no son ganancias de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio del adaptador ocupa 0,1 GB, pero la inferencia requiere cargar el decodificador de texto del modelo base de 4B, cuyo footprint no se detalla en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga vía PEFT sobre el decodificador de texto extraído con `code/motion_tuning/model.py` (`load_text_model`) desde la revisión base fijada `1b60d8f16b85473ceb20e3b62e464780c532b519`. El checkpoint multimodal original no es un `AutoModel` text-only drop-in. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (planificadores de movimiento para Reachy Mini) con parámetros, contexto, rendimiento o licencia verificables.

## Limitaciones y advertencias

- No se estableció ninguna mejora de entrenamiento: el proceso de desarrollo seleccionó el planificador inicial sin cambios (step 0) para ambos ejecutores, y los dos adaptadores publicados tienen los mismos pesos de partida.
- La inferencia greedy repetida varió pese a pesos y manifiestos de evaluación idénticos; la causa está sin determinar. No deben interpretarse las diferencias entre pasadas como ganancias.
- Las celdas canónicas aliasan la primera evaluación baseline cronológica de cada ejecutor; no seleccionan la mejor pasada de test.
- El test consta de 200 tareas sintéticas en 50 grupos de pose/objetivo, con diez familias de gestos conocidas, paráfrasis del autor, rubric compartido entre entrenamiento y evaluación y una única semilla de entrenamiento, lo que limita las afirmaciones de generalización.
- Las extracciones de reproducción directa son duplicados deterministas.
- No se midieron valoraciones humanas de calidad del movimiento ni aceptación en robot físico.
- Los adaptadores no constituyen una aplicación robótica autónoma ni un reemplazo completo de los assets de replay calibrados de Loopy.
- El adaptador residual exige emparejarse con el generador v4 congelado y una receta concreta (expansión nominal, ocho pasos Euler, CFG 1, filtrado a 4 Hz, condicionamiento por pose actual); ambos modos requieren anclaje de pose y controlador de seguridad a nivel de aplicación.
- Los idiomas soportados no están declarados.
- Licencia Apache 2.0: permite uso comercial, pero el artefacto es un piloto de investigación con resultados negativos documentados; no se recomienda su uso en producción sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diwank/reachy-mini-planner-adaptation-v5-20261116
- Modelo base: https://huggingface.co/binhpham/reachy-mini-motion-planner-4b
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/diwank/reachy-mini-planner-adaptation-data-v5-20261116
- Generador de trayectorias v4 (congelado, para el adaptador residual): https://huggingface.co/diwank/reachy-mini-trajectory-generator-v4-20261116/tree/c33fe3d2f54a6dc0d90c271a2adeda89021d7581
- Fork del generador de movimiento: https://github.com/creatorrr/reachy-motion-generator/tree/c6d27a8ca342dd31add7aff23d408782f4274f3c
- Ficheros de informe y análisis en el repo: `report.md`, `analysis.json`, `motion-contract.json`
