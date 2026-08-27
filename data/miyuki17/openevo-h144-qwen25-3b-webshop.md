# miyuki17/openevo-h144-qwen25-3b-webshop

## Resumen

Este repositorio publica el checkpoint de progreso del experimento **H1.44-ON-3B**, un ensayo de entrenamiento sin profesor (teacher-free) dentro del framework OpenEvo, aplicado al entorno WebShop. El autor es miyuki17 y el modelo base es `Qwen/Qwen2.5-3B-Instruct` en su revisión `aa8e72537993ba99e69dfaafa59ed015b17504d1`. En el snapshot publicado (rollout 2.976), las etapas 1 y 2 (bloques 0-5) se cerraron sin ninguna actualización de adaptadores, por lo que el checkpoint contiene únicamente manifiestos de recuperación y punteros de política, no pesos de adaptadores inventados. La política en todos los punteros sigue siendo el modelo base sin cambios.

Este repositorio no constituye un modelo final ni demuestra eficacia de adaptación. Es material de evidencia de progreso y recuperación para un experimento en curso. Su relevancia radica en documentar un intento de aplicar el pipeline OpenEvo (que combina evolución y optimización) a un modelo pequeño de 3B para tareas de compra online simulada, aunque en este punto no hay resultados de adaptación que reportar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-3B-Instruct, no modificado) |
| Parametros totales | 3.09 mil millones (modelo base) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 32.768 tokens (modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | no disponible (no se publican pesos) |
| Idiomas soportados | no disponible (depende del modelo base, que soporta principalmente ingles y chino) |
| Licencia | other (sujeta a la Qwen Research License para el modelo base) |
| Formato de pesos | no disponible (no se redistribuyen pesos del modelo base) |

## Arquitectura y entrenamiento

El checkpoint no introduce ninguna arquitectura nueva. Se basa en el modelo Qwen2.5-3B-Instruct, un transformer decoder-only con atención causal estándar, entrenado con instrucciones y ajuste fino supervisado. El experimento OpenEvo H1.44 utiliza un enfoque de evolución sin profesor (teacher-free) que combina algoritmos evolutivos con optimización de políticas, pero en este snapshot concreto no se aplicó ninguna actualización de adaptadores. Los datos de entrenamiento y el proceso de optimización no están detallados en la información disponible; solo se menciona que el experimento está en curso y que el panel de 128 tareas formales no se ha utilizado para la selección de checkpoints.

## Capacidades

- No se puede evaluar ninguna capacidad específica del checkpoint, ya que no contiene pesos propios ni adaptadores.
- El modelo base Qwen2.5-3B-Instruct es capaz de generación de texto, razonamiento, código, matemáticas y soporte multilingüe (principalmente inglés y chino), pero estas capacidades no se ven alteradas ni mejoradas por este checkpoint.
- No hay evidencia de tool calling, agentes o capacidades especiales adicionales en este snapshot.

## Casos de uso

Dado que este checkpoint no contiene pesos modificados, no tiene casos de uso prácticos como modelo independiente. Su utilidad es exclusivamente como artefacto de investigación para:

- Auditoría de reproducibilidad: permite verificar el estado del experimento en el rollout 2.976 y los manifiestos de recuperación.
- Trazabilidad de experimentos: sirve como punto de referencia para futuros checkpoints que sí contengan adaptadores.
- Documentación de procesos: útil para investigadores que estudien el pipeline OpenEvo y sus etapas de evolución sin profesor.
- Comparación de políticas: los punteros de política apuntan al modelo base, lo que permite comparar el comportamiento inicial con futuras versiones adaptadas.
- Desarrollo de metodologías: el manifiesto de publicación y los archivos de procedencia pueden usarse para analizar el diseño experimental.
- Integración en pipelines de investigación: como checkpoint intermedio en un flujo de entrenamiento evolutivo, aunque no aporta valor funcional directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el panel de 128 tareas no se ha utilizado para la selección de checkpoints y que este snapshot no establece eficacia de adaptación ni transferencia. No hay datos de rendimiento que reportar.

## Requisitos de hardware

- No aplica: al no contener pesos propios, no requiere VRAM adicional más allá de la del modelo base Qwen2.5-3B-Instruct.
- Para cargar el modelo base (3B parámetros) en FP16 se necesitan aproximadamente 6-7 GB de VRAM; en cuantización de 4 bits, unos 2-3 GB.
- GPUs recomendadas para el modelo base: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, etc.) para inferencia básica; para entrenamiento o fine-tuning, se recomienda al menos 16 GB (RTX 4090, A100, etc.).
- Opciones de despliegue del modelo base: vLLM, llama.cpp, Ollama, TGI, entre otros.
- Latencia y throughput: no disponibles para este checkpoint específico.

## Comparativa con modelos similares

No disponible. Este checkpoint no es un modelo funcional y no puede compararse con alternativas como otros fine-tunings de Qwen2.5-3B o modelos de la misma categoría. El autor no proporciona comparaciones con otros modelos.

## Limitaciones y advertencias

- Este checkpoint no contiene pesos de adaptadores ni modificaciones del modelo base; no debe utilizarse como un modelo de inferencia.
- No hay evidencia de eficacia de adaptación, transferencia ni resultados finales.
- El experimento está en curso y el snapshot es solo material de progreso/recuperación.
- La licencia "other" implica que el uso está sujeto a los términos de la Qwen Research License para el modelo base; no se redistribuyen pesos de Qwen.
- No se han evaluado sesgos, alucinaciones o limitaciones de contexto en este checkpoint.
- Para producción, este repositorio no es adecuado; se debe esperar a un checkpoint con adaptadores reales o usar el modelo base directamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/miyuki17/openevo-h144-qwen25-3b-webshop
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio relacionado (H1.43 7B): https://huggingface.co/miyuki17/openevo-h143-qwen25-7b-webshop
- Archivo de adaptadores: https://huggingface.co/miyuki17/openevo-adapter-archive
- Perfil GitHub del autor: https://github.com/Miyuki17
