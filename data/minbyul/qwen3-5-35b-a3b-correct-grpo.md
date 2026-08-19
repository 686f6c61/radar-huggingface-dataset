# Minbyul/Qwen3.5-35B-A3B-Correct-GRPO

## Resumen

Qwen3.5-35B-A3B-Correct-GRPO es un artefacto de investigación desarrollado por Minbyul como continuación de refuerzo (RL) del modelo Qwen3.5-35B-A3B-Correct, que a su vez es una rama de ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-35B-A3B. El objetivo del estudio es analizar cómo la inicialización SFT condiciona la ventana segura del aprendizaje por refuerzo aplicado a la decisión de parada en agentes de navegación web. El modelo emplea la arquitectura MoE del base, con aproximadamente 35 mil millones de parámetros totales y 3 mil millones activos por token, y ha sido entrenado con GRPO a nivel de turno sobre estados pivote de decisión (parar o continuar buscando).

Este modelo se publica como evidencia de que la ventana segura de RL es dependiente de la base: sobre la inicialización filtrada por corrección, la regresión en precisión aparece mucho antes que sobre la inicialización sin filtrar (Asis), por lo que el punto de control liberado se sitúa en un punto óptimo temprano (~14 pasos efectivos de RL frente a ~32 del gemelo Asis). No está pensado para uso en producción, sino para estudiar la interacción entre SFT y RL en agentes de búsqueda web, y para análisis de invarianza entre brazos del estudio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE decoder-only transformer (gated delta networks, 256 expertos) |
| Parametros totales | ~35 mil millones |
| Parametros activos | ~3 mil millones por token |
| Longitud de contexto | 131 072 tokens (contexto de entrenamiento SFT); no especificada para inferencia |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; no se ofrecen cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (13 shards, ~65 GB, bf16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-35B-A3B: un transformador decoder-only de mezcla de expertos (MoE) con 256 expertos y activación de 3 mil millones de parámetros por token, diseñado para eficiencia en inferencia. El tokenizador, la configuración y la plantilla de chat con soporte de tool calling se mantienen sin cambios respecto al base.

El entrenamiento se realizó en dos fases. Primero, un SFT sobre el subconjunto filtrado por corrección (deterministic answer matching) de un corpus interno de trayectorias de agentes de búsqueda web, con contexto de entrenamiento de 131 072 tokens. Segundo, una etapa de RL con GRPO a nivel de turno sobre estados pivote: puntos intermedios de la trayectoria donde el agente debe decidir entre detenerse para responder o continuar buscando. Cada estado pivote genera K=8 rollouts, recompensados por un verificador de parada determinista basado en reglas (sin modelo de recompensa aprendido). La regularización KL se aplica frente a la política SFT congelada, con coeficiente 0.01 y un estimador KL de baja varianza. El lote global es de 128 secuencias. El punto de control liberado corresponde a ~14 pasos efectivos de RL, seleccionado mediante un barrido paso a paso sobre evaluación downstream; en esta inicialización la ventana segura se cierra mucho antes que en la rama Asis.

## Capacidades

- Uso de herramientas de navegación web en formato function-calling: búsqueda en la web, apertura de páginas y búsqueda dentro de la página.
- Razonamiento explícito en trayectorias multi-turno, con decisiones de parada optimizadas mediante RL.
- Decisión de parada (stop-decision) entrenada para reducir búsquedas innecesarias sin perder precisión en la respuesta.
- Compatible con el ecosistema transformers y con endpoints compatibles (vLLM, TGI).
- Capacidades del modelo base fuera del dominio de agente de búsqueda web no están documentadas en la model card; el modelo se centra exclusivamente en el comportamiento agéntico de búsqueda.

## Casos de uso

- Investigación en RL para agentes de búsqueda web: permite estudiar cómo la inicialización SFT afecta la estabilidad del entrenamiento con GRPO y la ventana segura de pasos de RL.
- Análisis de políticas de parada: sirve para evaluar verificadores deterministas basados en reglas y comparar estrategias de decisión de parada frente a continuación de búsqueda.
- Comparación entre brazos de un mismo estudio: junto con Qwen3.5-35B-A3B-Asis-GRPO, permite analizar la invarianza de la receta RL ante distintas inicializaciones SFT.
- Desarrollo de agentes de navegación web en entornos controlados: puede integrarse en pipelines de investigación que requieran un agente con tool use y razonamiento explícito, siempre que el formato de herramientas coincida con el de entrenamiento.
- Evaluación de robustez de RL: al tener una ventana segura estrecha, es útil para probar métodos de selección de checkpoints y detección temprana de regresión.
- Reproducción de experimentos de GRPO turn-level con recompensas deterministas: el checkpoint liberado permite replicar los resultados del estudio y servir de referencia para futuros trabajos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas numéricas de precisión, eficiencia ni comparaciones con otros modelos; el único dato de rendimiento es cualitativo: el punto de control liberado es el que reduce el sobre-esfuerzo de búsqueda manteniendo la precisión en la evaluación downstream del agente.

## Requisitos de hardware

- Los pesos en bf16 ocupan ~65 GB, por lo que se necesita una GPU con al menos 80 GB de VRAM para cargar el modelo completo sin cuantización (por ejemplo, A100 80GB, H100 o similar).
- Al ser un MoE con solo 3 mil millones de parámetros activos por token, la memoria requerida durante la inferencia es menor que la necesaria para cargar los pesos, pero el almacenamiento en VRAM de los parámetros totales sigue siendo el factor limitante.
- No se proporcionan cuantizaciones oficiales; sin embargo, al ser pesos safetensors estándar, es posible aplicar cuantización externa (por ejemplo, AWQ, GPTQ o GGUF) para reducir el requisito de VRAM a ~17-20 GB en 4 bits, aunque no se ha validado.
- Opciones de despliegue: transformers (Hugging Face), vLLM (compatible con endpoints), TGI, y potencialmente llama.cpp si se convierte a GGUF.
- No se dispone de datos de latencia o throughput; al ser un MoE con 3B activos, la inferencia por token debería ser comparable a la de un modelo denso de ~3B, pero con mayor uso de memoria para los parámetros totales.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Minbyul/Qwen3.5-35B-A3B-Correct-GRPO (este) | ~35B | ~3B | 131 072 (entrenamiento) | Apache 2.0 | Artefacto de investigación, RL sobre SFT filtrado |
| Minbyul/Qwen3.5-35B-A3B-Asis-GRPO | ~35B | ~3B | 131 072 (entrenamiento) | Apache 2.0 | Misma receta RL, inicialización SFT sin filtrar |
| Qwen/Qwen3.5-35B-A3B (base) | ~35B | ~3B | No especificado | Apache 2.0 | Modelo base sin RL, capacidades generales |

No se dispone de datos de rendimiento comparativo entre estos modelos; la comparación se limita a aspectos arquitectónicos y de entrenamiento. No hay información sobre otros modelos de la misma categoría (agentes de búsqueda web con RL) en las fuentes consultadas.

## Limitaciones y advertencias

- Artefacto de investigación, no un asistente de producción: su comportamiento está ajustado a un formato específico de herramientas de agente de navegación web y a un prompt concreto.
- Ventana segura muy estrecha: la inicialización filtrada por corrección tolera muy pocos pasos de RL antes de regresar en precisión; el checkpoint liberado está cerca de ese límite. Cualquier entrenamiento continuado debe re-ejecutar el barrido de pasos, no reutilizar el horario de la base Asis.
- El verificador de parada es un proxy basado en reglas; la eficiencia observada puede no trasladarse a otros entornos de herramientas o definiciones de recompensa.
- Solo se aplicaron ~14 pasos efectivos de RL; las capacidades fuera del comportamiento de decisión de parada son esencialmente las del padre SFT.
- No se aplicó alineación de seguridad adicional más allá de la que proporciona el modelo base; puede generar contenido no deseado o inseguro en contextos no controlados.
- El modelo solo soporta inglés; no se ha evaluado su comportamiento en otros idiomas.
- No se han publicado benchmarks que validen su rendimiento general; su evaluación se limita al dominio de agente de búsqueda web.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Correct-GRPO
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Gemelo Asis-GRPO: https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Asis-GRPO
- Rama SFT Correct: https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Correct
- Receta vLLM para Qwen3.5-35B-A3B: https://recipes.vllm.ai/Qwen/Qwen3.5-35B-A3B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
