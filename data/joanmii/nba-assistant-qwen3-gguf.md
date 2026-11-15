# joanmii/nba-assistant-qwen3-gguf

## Resumen

NBA Assistant es un ajuste fino del modelo Qwen3-1.7B de Alibaba Qwen, desarrollado por el usuario joanmii y publicado en Hugging Face. El modelo está especializado en una tarea muy concreta: traducir preguntas formuladas en español sobre la NBA a llamadas de función con el formato `funcion | param=valor`, que posteriormente consume el toolkit del proyecto. Se trata, por tanto, de un modelo de function calling orientado a un dominio cerrado y no de un asistente generalista.

El ajuste se realizó mediante QLoRA sobre el modelo base Qwen3-1.7B, una arquitectura transformer densa de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones). El resultado se distribuye únicamente en formato GGUF con cuantización Q4_K_M, lo que reduce el repositorio a 1,1 GB y permite ejecución en CPU mediante llama.cpp, tal como demuestra el Space asociado del autor.

La relevancia del modelo es limitada y muy específica: sirve como ejemplo de ajuste fino de bajo coste para una tarea de enrutamiento estructurado (NL a llamada de función) en un dominio deportivo y en un solo idioma. No cuenta con descargas ni likes en el momento de la consulta, y el autor no ha publicado información sobre licencia, benchmarks ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajustado con QLoRA |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3-1.7B, sin confirmar por el autor) |
| Tipos de cuantizacion | GGUF Q4_K_M |
| Idiomas soportados | español (etiqueta `es`; el base Qwen3 es multilingüe) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de la familia Qwen3. Sobre él se aplicó un ajuste QLoRA, es decir, cuantización del modelo base a 4 bits durante el entrenamiento y entrenamiento de adaptadores de bajo rango. El autor no especifica el rango de LoRA, el número de pasos, la tasa de aprendizaje ni el tamaño del dataset empleado.

La tarea de entrenamiento es la conversión de preguntas en español sobre la NBA a un formato de llamada estructurado `funcion | param=valor`, propio del toolkit del proyecto. El repositorio incluye un archivo `system_prompt.txt` que contiene el prompt de sistema usado durante el entrenamiento, lo que sugiere que el comportamiento del modelo depende fuertemente de ese prompt. No se documenta el uso de RLHF, DPO ni ninguna innovación técnica adicional más allá del propio ajuste QLoRA.

## Capacidades

- Generación de llamadas de función en formato `funcion | param=valor` a partir de preguntas en español sobre la NBA.
- Comprensión de consultas en español dentro del dominio deportivo (equipos, jugadores, estadísticas, partidos, según el toolkit del proyecto).
- Ejecución en CPU mediante llama.cpp, gracias a la cuantización Q4_K_M.
- Integración con endpoints compatibles (etiqueta `endpoints_compatible`).
- No se documentan capacidades de razonamiento general, código, matemáticas, visión, audio ni agentes multi-paso más allá del enrutamiento a funciones.
- No se documenta soporte multilingüe efectivo más allá del español, pese a que el modelo base sea multilingüe.

## Casos de uso

- Enrutamiento de consultas NBA a funciones internas: el modelo recibe una pregunta como «¿cuántos puntos anotó X anoche?» y devuelve la llamada `funcion | param=valor` que el backend ejecuta contra su API de datos. Es el caso de uso para el que fue entrenado explícitamente.
- Prototipado de asistentes conversacionales de dominio cerrado: sirve como ejemplo reproducible de cómo un modelo de 1,7 B ajustado con QLoRA puede sustituir a un LLM grande en una tarea de clasificación y extracción de parámetros acotada.
- Despliegue en entornos sin GPU: al distribuirse en GGUF Q4_K_M y ejecutarse con llama.cpp, puede correr en servidores CPU o en el propio portátil del desarrollador para demos y pruebas.
- Chatbot de estadísticas deportivas en español: integrado en un pipeline que resuelva la llamada de función contra una base de datos de partidos y jugadores, permite responder preguntas factuales sobre la NBA.
- Docencia y experimentación con QLoRA: el repositorio, junto con el Space público, sirve como material de referencia para mostrar el flujo completo de ajuste fino, cuantización y despliegue en CPU.
- Pruebas de integración de function calling en pipelines propios: la etiqueta `endpoints_compatible` permite conectarlo a infraestructura de inferencia compatible con la API de Hugging Face para validar el formato de salida antes de migrar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el formato distribuido (GGUF Q4_K_M, ~1,1 GB de pesos); en GPU, la carga completa en 4 bits requiere del orden de 1,5-2 GB, aunque el autor no publica cifras.
- GPU recomendadas: no disponibles por parte del autor; cualquier GPU consumer con 4 GB o más podría alojar el modelo cuantizado, pero no hay datos de rendimiento publicados.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM, aunque sin cifras oficiales.
- Opciones de despliegue: llama.cpp en CPU (método documentado por el autor mediante el Space `joanmii/nba-assistant`); otras opciones como vLLM, TGI u Ollama no están documentadas para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Especializacion |
|---|---|---|---|---|---|
| joanmii/nba-assistant-qwen3-gguf | 1,72 B | no disponible | GGUF Q4_K_M | no disponible | Function calling NBA en español |
| Qwen/Qwen3-1.7B (base) | 1,72 B | no disponible en esta ficha | safetensors, GGUF | según Qwen3 (no confirmada aquí) | Modelo generalista multilingüe |
| Otros ajustes QLoRA de dominio | variable | variable | variable | variable | No disponible comparación directa |

No se dispone de información suficiente para comparar rendimiento con alternativas, al no haberse publicado benchmarks ni métricas de evaluación por parte del autor.

## Limitaciones y advertencias

- Dominio extremadamente restringido: el modelo está entrenado para una única tarea (preguntas NBA en español a llamadas de función); fuera de ese ámbito su comportamiento no está garantizado.
- Dependencia del prompt de sistema: el autor indica que `system_prompt.txt` es el prompt usado en entrenamiento, por lo que desviarse de él puede degradar la calidad de las llamadas generadas.
- Riesgo de alucinación en los parámetros: al generar `param=valor`, el modelo puede producir identificadores o valores inexistentes en el toolkit; el backend debe validar la salida.
- Licencia no especificada: no se puede confirmar el uso comercial ni las condiciones de redistribución; debe consultarse al autor antes de cualquier uso en producción.
- Idiomas: solo se declara español; el rendimiento en otros idiomas no está evaluado.
- Sin métricas publicadas: no hay benchmarks, evaluaciones ni cifras de latencia que permitan estimar la calidad frente a alternativas.
- Modelo sin tracción: cero descargas y cero likes en el momento de la consulta, sin comunidad que haya validado su funcionamiento.
- Contexto no documentado: la longitud de contexto efectiva tras el ajuste no está confirmada por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/joanmii/nba-assistant-qwen3-gguf
- Space de demostración: https://huggingface.co/spaces/joanmii/nba-assistant
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
