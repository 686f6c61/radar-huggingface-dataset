# agentic-ptb/sol-high.h076.self-patch-bridge-soup

## Resumen

Este modelo es un checkpoint intermedio de un barrido de entrenamiento (sweep) denominado AgentPTB, publicado por el usuario `agentic-ptb`. Pertenece a la celda `sol-high`, que fue generada con el driver Codex / gpt-5.6-sol con un nivel de razonamiento `high`. Se trata de un artefacto de investigación, no de un modelo final listo para producción: fue guardado a las 76,62 horas de una ejecución de 100 horas, y su rol se define explícitamente como `intermediate`.

El modelo se construye a partir de `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El repositorio contiene pesos en formato safetensors con un tamaño total de 18,8 GB, distribuidos en 4 shards. La nota de la celda indica que es el mejor checkpoint del barrido, pero no se proporcionan métricas de evaluación ni detalles sobre el proceso de entrenamiento.

La relevancia de este modelo es limitada fuera del contexto del propio barrido: sirve para trazar la curva de rendimiento a lo largo del tiempo de entrenamiento, pero carece de documentación sobre capacidades, licencia o casos de uso. Su interés principal es metodológico, como ejemplo de publicación de checkpoints intermedios con metadatos estructurados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-9B-Base, sin detalles adicionales) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se hereda del modelo base `Qwen/Qwen3.5-9B-Base`, que es un transformer denso de aproximadamente 9,4 mil millones de parámetros. No se especifican variaciones estructurales en la model card, por lo que se asume que el checkpoint mantiene la misma arquitectura que el base, con pesos ajustados durante el barrido.

El entrenamiento forma parte de un proceso de barrido automatizado (AgentPTB) en el que un agente (Codex / gpt-5.6-sol) genera y evalúa checkpoints a lo largo de 100 horas. El nombre `self-patch-bridge-soup` sugiere el uso de técnicas de mezcla de pesos (weight soup) o parcheo de parámetros, pero no se aporta documentación técnica al respecto. Tampoco se indican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron métodos como RLHF o DPO.

Un dato relevante es que el `eos_token_id` es `[248044, 248046]`, donde `248046` corresponde a `<|im_end|>`, el token de fin de turno del template de chat de Qwen3.5. Esto garantiza que el modelo detiene correctamente las respuestas, evitando el desbordamiento de la ventana de contexto.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Qwen3.5-9B-Base, que incluyen generación de lenguaje natural, razonamiento y comprensión de instrucciones.
- Razonamiento: el driver del barrido utilizó un nivel de razonamiento `high`, lo que sugiere que el checkpoint fue optimizado para tareas que requieren cadenas de pensamiento extensas, aunque no se aportan evidencias concretas.
- Detención correcta de respuestas: el `eos_token_id` está configurado correctamente, lo que evita que el modelo continúe generando más allá del final del turno.
- Capacidades específicas: no se documentan capacidades adicionales como tool calling, visión, audio o modo de pensamiento explícito.

## Casos de uso

- Evaluación de progreso en barridos de entrenamiento: este checkpoint puede utilizarse para trazar la evolución del rendimiento a lo largo del tiempo, comparándolo con otros checkpoints del mismo barrido mediante el identificador `h{HHH}`.
- Investigación sobre técnicas de mezcla de pesos: el nombre `self-patch-bridge-soup` sugiere experimentos con weight soup o parcheo de parámetros; el modelo puede servir como referencia para estudiar estas técnicas.
- Reproducción de experimentos: al estar publicado con metadatos estructurados (hora del run, driver, effort), permite reproducir o auditar el proceso de entrenamiento.
- Fine-tuning posterior: al ser un checkpoint intermedio, podría servir como punto de partida para continuar el entrenamiento o aplicar ajustes adicionales.
- Análisis de comportamiento de modelos intermedios: estudiar cómo evolucionan las capacidades de un modelo a lo largo de un entrenamiento prolongado.
- Comparación de configuraciones de razonamiento: al pertenecer a la celda `sol-high` con effort `high`, puede compararse con celdas de menor esfuerzo para analizar el impacto del razonamiento en el resultado final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. El único dato de rendimiento indirecto es la nota de la celda ("best cell in the sweep"), pero sin valores numéricos que lo respalden.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 mil millones de parámetros y pesos en FP16/BF16, se necesitan aproximadamente 18,8 GB de VRAM. Con cuantización de 4 bits, la demanda se reduciría a unos 5-6 GB, pero no se ofrecen cuantizaciones precalculadas en el repositorio.
- GPU recomendadas: para FP16, una GPU con al menos 20 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB, H100). Para cuantización ligera, una GPU de 8-12 GB podría ser suficiente, pero habría que generar los archivos cuantizados manualmente.
- Compatibilidad con GPU de consumo: sí, una RTX 3090 o RTX 4090 puede ejecutar el modelo en FP16, aunque con limitaciones de velocidad. Con cuantización, una RTX 3060 o similar podría ser viable.
- Opciones de despliegue: al ser un modelo basado en Qwen, es compatible con vLLM, llama.cpp, Ollama y TGI, siempre que se conviertan los pesos al formato adecuado (GGUF para llama.cpp/Ollama).
- Latencia y throughput: no se dispone de datos medidos. Como referencia genérica, un modelo de 9B en una RTX 4090 con FP16 suele generar entre 20 y 40 tokens por segundo, pero esto depende de la implementación y la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un checkpoint intermedio de un barrido experimental, sin benchmarks publicados. Como referencia estructural, se puede comparar con su modelo base `Qwen/Qwen3.5-9B-Base`, pero no hay datos de rendimiento del checkpoint frente al base. Tampoco se conocen otros modelos de la misma familia `agentic-ptb` con métricas comparables. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: su rendimiento puede ser inferior al de un modelo entrenado hasta completar el ciclo de 100 horas.
- Licencia no especificada: no se indica ninguna licencia, lo que impide su uso comercial o su redistribución sin autorización explícita del autor.
- Sin documentación de sesgos ni alucinaciones: no se han realizado evaluaciones de sesgo ni se documentan riesgos de alucinación.
- Sin datos de entrenamiento: se desconoce la composición del dataset, el número de tokens y los métodos de alineación, lo que dificulta evaluar su comportamiento en dominios específicos.
- Sin cuantizaciones precalculadas: el repositorio solo contiene safetensors en precisión completa; cualquier despliegue en hardware limitado requiere conversión manual.
- Cero descargas y cero likes: no hay evidencia de uso o validación por parte de la comunidad.
- Fecha de creación futura: el modelo fue creado el 20 de agosto de 2026, lo que puede indicar un error en los metadatos o un entorno de simulación; se recomienda verificar la autenticidad antes de usarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h076.self-patch-bridge-soup
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- No se han encontrado otros enlaces relevantes (papers, blogs o repositorios) específicos de este modelo en la búsqueda web realizada.
