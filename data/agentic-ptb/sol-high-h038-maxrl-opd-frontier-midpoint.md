# agentic-ptb/sol-high.h038.maxrl-opd-frontier-midpoint

## Resumen

El modelo `agentic-ptb/sol-high.h038.maxrl-opd-frontier-midpoint` es un checkpoint intermedio de un barrido (sweep) de entrenamiento con aprendizaje por refuerzo (RL) realizado por el equipo AgentPTB. Se trata de un ajuste fino del modelo base `Qwen/Qwen3.5-9B-Base` mediante un pipeline de RL agéntico (etiquetado como `maxrl-opd-frontier-midpoint`), con el objetivo de explorar configuraciones de entrenamiento para mejorar el rendimiento en tareas de razonamiento y agencia. El checkpoint corresponde a la celda `sol-high`, que según la model card es la mejor del barrido, y fue generado con un driver basado en Codex / gpt-5.6-sol con esfuerzo de razonamiento alto.

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y un tamaño de repositorio de 18,8 GB en formato safetensors, este modelo se posiciona en la gama de modelos de tamaño medio. Su relevancia radica en que documenta un punto intermedio de un experimento de RL agéntico, lo que lo hace útil para investigadores que estudian dinámicas de entrenamiento, aunque no está pensado como un modelo de producción listo para usar. No se especifican licencia, idiomas soportados ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint de un experimento de RL agéntico sobre la arquitectura transformer de `Qwen/Qwen3.5-9B-Base`. Según la model card, el entrenamiento se realizó mediante un pipeline de RL (etiquetado como `maxrl-opd-frontier-midpoint`) dentro de un barrido más amplio, con un driver basado en Codex / gpt-5.6-sol y esfuerzo de razonamiento alto. El checkpoint se guardó en 4 shards y ocupa 18,8 GB. La model card indica que los tokens de fin de secuencia (`eos_token_id`) son `[248044, 248046]`, siendo `248046` el token `<|im_end|>` del template de chat de Qwen3.5, lo que garantiza que el modelo detiene correctamente las respuestas al final de cada turno. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas específicas de RL (como PPO, GRPO u otras).

## Capacidades

- Al ser un ajuste fino de `Qwen/Qwen3.5-9B-Base`, se espera que herede las capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas), aunque no hay documentación específica que lo confirme.
- La model card no detalla capacidades adicionales como tool calling, soporte de agentes o capacidades multimodales.
- El checkpoint está diseñado para experimentos de RL agéntico, por lo que su uso principal es la investigación y el análisis de dinámicas de entrenamiento, no la inferencia directa en producción.
- No se especifican capacidades multilingües ni soporte de vision o audio.

## Casos de uso

- Investigación en RL agéntico: el checkpoint permite estudiar cómo evoluciona el rendimiento de un modelo base durante el entrenamiento con refuerzo, comparando puntos intermedios con el modelo final.
- Análisis de dinámicas de entrenamiento: investigadores pueden analizar la convergencia, la estabilidad y los efectos de diferentes configuraciones de RL (como el esfuerzo de razonamiento) sobre el modelo base.
- Reproducción de experimentos: al ser un checkpoint intermedio de un barrido, puede usarse para reproducir o extender los resultados del sweep de AgentPTB.
- Evaluación de eos tokens: la model card destaca la importancia de los tokens de fin de secuencia; este checkpoint puede servir para validar metodologías de evaluación en modelos con RL.
- Fine-tuning posterior: como punto de partida para nuevos experimentos de RL o ajuste fino, aprovechando que ya ha sido expuesto a un pipeline de entrenamiento agéntico.
- Comparación de checkpoints: útil para comparar el rendimiento de diferentes celdas del barrido (por ejemplo, `sol-high` frente a otras configuraciones) en tareas de razonamiento o agencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K u otras), y el repositorio no proporciona datos de rendimiento comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión fp16: aproximadamente 19-20 GB (dado el tamaño de 18,8 GB en safetensors), lo que requiere una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G, A100 40GB).
- Con cuantización a 4 bits (por ejemplo, mediante bitsandbytes o GGUF), la VRAM necesaria se reduce a unos 5-6 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 3060 12GB o RTX 4070.
- No se dispone de datos de latencia o throughput medidos para este checkpoint concreto.
- Opciones de despliegue: al ser un modelo basado en Qwen3.5-9B-Base, es compatible con frameworks como vLLM, llama.cpp, Ollama o TGI, aunque no hay configuraciones oficiales publicadas.
- Dado que es un checkpoint de investigación, se recomienda usar entornos de experimentación (por ejemplo, contenedores Docker con GPU) en lugar de despliegues de producción.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este checkpoint. Como referencia, el modelo base `Qwen/Qwen3.5-9B-Base` tiene 9,4 mil millones de parámetros y una arquitectura transformer estándar, pero no se han publicado resultados de benchmarks en la información disponible. Otros modelos de tamaño similar (como Llama 3.1 8B o Mistral 7B) podrían servir como comparación genérica, pero no hay datos específicos de este checkpoint para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un experimento de RL, no un modelo final optimizado para producción. Su rendimiento puede ser inferior al del modelo base o al de un modelo ajustado con más iteraciones.
- No se especifica licencia, lo que impide su uso comercial sin aclaración previa con el autor.
- No hay documentación sobre sesgos, alucinaciones o limitaciones de idioma. Al ser un ajuste fino de Qwen3.5-9B-Base, podría heredar sesgos del modelo base, pero no se ha verificado.
- La model card advierte que los checkpoints que no incluyen el token `<|im_end|>` (248046) pueden sobrepasar la ventana de contexto; este checkpoint sí lo incluye, pero es importante verificar este aspecto al reempaquetar o evaluar.
- No se proporcionan datos de entrenamiento, por lo que no se puede evaluar la composición del dataset ni posibles problemas de contaminación o sesgo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es un artefacto de investigación reciente y poco validado por la comunidad.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h038.maxrl-opd-frontier-midpoint
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Repositorio de referencia de RL agéntico (OPD/verl): https://github.com/yangyuxiao-sjtu/OPD/blob/main/verl/docs/start/agentic_rl.rst
