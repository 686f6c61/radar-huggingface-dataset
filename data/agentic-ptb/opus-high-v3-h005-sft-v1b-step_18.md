# agentic-ptb/opus-high-v3.h005.sft-v1b.step_18

## Resumen

`opus-high-v3.h005.sft-v1b.step_18` es un checkpoint intermedio publicado por el usuario `agentic-ptb` dentro del proyecto AgentPTB, concretamente del run `opus-high-v3` ejecutado con Claude Code. Se trata de un modelo derivado de `Qwen/Qwen3.5-9B-Base` mediante un proceso de fine-tuning supervisado (SFT) en el paso 18 de entrenamiento. El propio autor lo etiqueta como `intermediate` y `negative-results`, indicando explícitamente que el run no produjo ninguna mejora de pesos respecto al modelo base y que el checkpoint se conserva únicamente por reproducibilidad y estudio cualitativo.

El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4B), está publicado en formato safetensors con un tamaño de repositorio de 18,8 GB y se distribuye bajo licencia Apache-2.0. Su relevancia actual es limitada: no representa un avance técnico, sino un artefacto de investigación que documenta un experimento fallido. Cualquier uso práctico debe considerar que el autor advierte explícitamente de que no se infiera calidad de esta publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `Qwen/Qwen3.5-9B-Base`, un modelo transformer denso de aproximadamente 9,4 mil millones de parametros. No se dispone de detalles adicionales sobre la configuracion exacta (numero de capas, dimensiones de atencion, etc.) en la informacion publicada.

El entrenamiento corresponde a un paso de SFT (supervised fine-tuning) dentro del run `opus-high-v3` del proyecto AgentPTB, ejecutado con Claude Code. El checkpoint se guardo en el paso 18 (`step_18`) y se clasifica como `intermediate`. Segun la documentacion del autor, el run completo no mostro ninguna mejora en los pesos entrenados respecto al modelo base; de hecho, el propio autor lo etiqueta como `negative-results`. No se publican datos sobre el dataset de entrenamiento, el numero de tokens procesados ni tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto: al ser un fine-tuning de Qwen3.5-9B-Base, conserva las capacidades generativas del modelo base, aunque sin mejoras verificadas.
- Razonamiento y codigo: capacidades heredadas del modelo base, no validadas en este checkpoint concreto.
- No se documentan capacidades especiales (tool calling, agentes, vision, audio, thinking mode) en la informacion disponible.
- El autor no proporciona ninguna lista de capacidades especificas para este checkpoint.

## Casos de uso

Dado el caracter de checkpoint intermedio con resultados negativos, los casos de uso practicos son muy limitados:

- Reproducibilidad de experimentos: el checkpoint permite a otros investigadores replicar el run `opus-high-v3` y verificar los resultados negativos reportados.
- Estudio cualitativo de fallos: puede usarse para analizar por que el SFT no produjo mejoras, comparando los pesos del paso 18 con el modelo base.
- Investigacion sobre entrenamiento de LLMs: como ejemplo documentado de un run fallido, puede servir para estudiar patrones de regresion o estancamiento en fine-tuning.
- Comparacion de checkpoints intermedios: junto con otros checkpoints del mismo run, permite trazar la evolucion de la perdida y los pesos a lo largo del entrenamiento.
- Auditoria de pipelines de entrenamiento: util para validar herramientas de registro y versionado de experimentos en entornos de investigacion.
- No se recomienda su uso en produccion ni en aplicaciones que requieran calidad garantizada, dado el aviso explicito del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. Ademas, la etiqueta `negative-results` indica que el run no produjo mejoras, por lo que no cabe esperar un rendimiento superior al del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 9,4B parametros en precision fp32, el modelo ocuparia aproximadamente 37,6 GB; en fp16 o bf16, unos 18,8 GB. Sin cuantizaciones publicadas, no se puede estimar un consumo menor.
- GPU recomendadas: no disponible. Por tamano, una GPU con al menos 24 GB de VRAM (RTX 3090/4090) seria necesaria para fp16, y una A100 o H100 para mayor comodidad.
- No se confirma si cabe en GPUs de consumo sin cuantizacion.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un checkpoint intermedio, no se espera soporte oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo base `Qwen/Qwen3.5-9B-Base` es el unico punto de referencia directo, pero no se publican metricas comparativas entre ambos. Alternativas de tamano similar como Llama 3.1 8B o Mistral 7B no son comparables sin datos de rendimiento de este checkpoint. Por tanto, la comparativa se limita a indicar que este modelo es un derivado sin mejoras verificadas de Qwen3.5-9B-Base.

## Limitaciones y advertencias

- Resultados negativos: el autor declara explicitamente que el run no encontro mejora en los pesos entrenados; no debe inferirse calidad de esta publicacion.
- Checkpoint intermedio: no es un modelo final ni optimizado para uso general.
- Sin benchmarks: no hay evaluaciones publicadas que respalden capacidades concretas.
- Datos de entrenamiento desconocidos: no se especifica la composicion del dataset SFT, lo que impide evaluar sesgos potenciales.
- Riesgo de alucinacion: no evaluado; al ser un derivado de Qwen, podria presentar los mismos riesgos que el modelo base, pero sin verificacion.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero la falta de validacion hace desaconsejable su uso en produccion.
- Documentacion incompleta: no se proporcionan detalles de contexto, idiomas ni cuantizaciones.

## Enlaces

- Repositorio del modelo: https://huggingface.co/agentic-ptb/opus-high-v3.h005.sft-v1b.step_18
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Indice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
