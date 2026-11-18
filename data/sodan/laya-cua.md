# sodan/laya-cua

## Resumen

laya-cua es un modelo de decisión especializado en computer use, desarrollado por el usuario sodan a partir de `convaiinnovations/laya`. No es un modelo generativo: se trata de un encoder ModernBERT de 421 millones de parámetros con una cabeza de decisión tipada que, dado un estado de pantalla, predice el siguiente tipo de acción de un agente que opera una interfaz gráfica (click, type, key, scroll, move, wait, drag o done) y si la tarea ha finalizado. No genera texto, coordenadas ni cadenas de texto, y no constituye por sí mismo un agente de computer use completo.

El modelo se ha ajustado mediante el bucle RLCD de la librería oficial `laya.train`, adaptado para ejecutarse en una única GPU T4 gratuita de Google Colab, usando 200 tareas del dataset OpenCUA AgentNet (xlangai/AgentNet, licencia MIT) con 2.858 filas de entrenamiento y 334 de validación separadas por tarea completa. El resultado es un clasificador ligero que puede integrarse como componente de enrutamiento de acciones dentro de un pipeline mayor de automatización de interfaces.

Su relevancia es acotada pero concreta: demuestra que es posible entrenar un módulo de decisión de computer use con recursos mínimos (una T4, 200 tareas, dos épocas) y obtener una precisión de tipo de acción del 76,65 % en el conjunto de validación, frente al 18,56 % del modelo base y al 71,56 % de un baseline trivial que siempre predice "click". Es, por tanto, una pieza de investigación reproducible más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT con cabeza de decisión tipada (modelo de decisión, no generativo) |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `convaiinnovations/laya`, un encoder ModernBERT de 421 millones de parámetros con una cabeza de decisión tipada. En lugar de generar tokens, laya-cua recibe un estado de pantalla y produce puntuaciones sobre un conjunto cerrado de tipos de acción (click, type, key, scroll, move, wait, drag, done) junto con una predicción binaria de finalización de tarea (task_done). No emite coordenadas, texto tecleado ni argumentos de acción; esa responsabilidad recae en otros componentes del pipeline.

El ajuste se realizó con el bucle RLCD oficial de `laya.train`, adaptado a una única GPU T4 de Colab. Los datos provienen de OpenCUA AgentNet (xlangai/AgentNet, licencia MIT): 200 tareas, una fila por paso, con 2.858 filas de entrenamiento y 334 de validación separadas por tarea completa para evitar filtración. Se entrenaron 2 épocas, con pérdida de 0,6311 en la primera y 0,4571 en la segunda. No hay datos publicados sobre número de tokens de entrenamiento, composición detallada del dataset ni uso de RLHF o DPO.

## Capacidades

- Clasificación del siguiente tipo de acción de computer use a partir de un estado de pantalla: click, type, key, scroll, move, wait, drag y done.
- Predicción binaria de finalización de tarea (task_done).
- Modelo de decisión puro: no genera texto, coordenadas ni cadenas de texto.
- No soporta tool calling ni function calling en el sentido habitual de los LLM generativos.
- No implementa razonamiento multi-paso por sí mismo; está pensado como componente de enrutamiento dentro de un agente mayor.
- Soporte multilingüe: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Enrutamiento de acciones en un agente de computer use: dado el estado de pantalla, laya-cua decide si el siguiente paso debe ser un click, una pulsación de tecla, un scroll o una espera, y delega la ejecución concreta (coordenadas, texto) a otro módulo del pipeline.
- Detección de finalización de tarea: el modelo puede actuar como verificador ligero que señala cuándo una tarea se ha completado, útil para cerrar bucles de agente y evitar pasos redundantes.
- Filtrado previo en pipelines de automatización de interfaz: al ser un modelo de 421M, puede ejecutarse en hardware modesto para descartar acciones inviables antes de invocar un modelo generativo más costoso.
- Investigación reproducible en computer use: sirve como referencia para estudiar el efecto de ajustes con pocos datos (200 tareas) sobre un encoder de decisión, con notebook de Colab incluido.
- Componente de bajo coste en entornos con GPU T4: su tamaño permite desplegarlo en infraestructura de gama baja para tareas de clasificación de acciones en tiempo casi real.
- Evaluación comparativa de baselines: útil para medir cuánto aporta un ajuste fino frente a heurísticas triviales como "siempre click" en un conjunto de validación por tarea.

## Benchmarks y rendimiento

Resultados en el conjunto de validación (n=334, una sola ejecución), según la model card:

| Metrica | laya-cua (fine-tuned) | Base Laya | Baseline "always click" |
|---|---|---|---|
| Precisión de tipo de acción | 0,7665 | 0,1856 | 0,7156 |
| Precisión de task_done | 0,9581 | 0,7066 | no calculado |

No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 421M parámetros en safetensors el repo ocupa 0,8 GB, por lo que en fp32 cabría en GPUs consumer con 4-6 GB de VRAM y en fp16 en torno a 2 GB.
- GPU recomendadas: el propio autor entrenó en una única T4 de Colab, lo que sugiere que la inferencia es viable en T4 y GPUs equivalentes.
- Cabe en GPU consumer: sí, por tamaño (T4, RTX 3060 y superiores son suficientes según el tamaño del modelo).
- Opciones de despliegue: la librería `laya` (library_name declarado); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-cua | 421.293.830 | no disponible | Encoder de decisión (computer use) | Apache-2.0 | Hugging Face |
| convaiinnovations/laya (base) | 421M (ModernBERT) | no disponible | Encoder de decisión | no disponible en la información | Hugging Face |
| Baseline "always click" | no aplica | no aplica | Heurística trivial | no aplica | no aplica |

No se dispone de datos sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Conjunto de test pequeño (334 filas) y una sola ejecución: los resultados no son estadísticamente robustos.
- Solo 200 tareas de entrenamiento, lo que limita la generalización a dominios no vistos.
- La mejora sobre el baseline trivial "siempre click" es de unos 5 puntos (76,65 % frente a 71,56 %), y aproximadamente el 74 % de las filas de entrenamiento son clicks.
- Alrededor del 94 % de las filas son "not done", por lo que la precisión de task_done (0,9581) está próxima a un baseline trivial.
- La etiqueta needs_human no se anotó ni se entrenó.
- No genera texto, coordenadas ni cadenas tecleadas: no puede usarse como agente de computer use autónomo.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento (AgentNet) son MIT y deben respetarse sus términos.
- Para producción, conviene validar en un conjunto de test más amplio y con múltiples ejecuciones antes de confiar en las métricas publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/sodan/laya-cua
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Dataset de entrenamiento: https://huggingface.co/datasets/xlangai/AgentNet
