# smegn/civilos-ebcs-v2

## Resumen

civilos-ebcs-v2 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario smegn y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un derivado de la familia Qwen2.5, una arquitectura transformer densa de 7.000 millones de parametros con soporte nativo de contexto largo, entrenada originalmente por Alibaba Cloud. El ajuste se realizo partiendo del checkpoint cuantizado en 4 bits de Unsloth (unsloth/Qwen2.5-7B-Instruct-bnb-4bit), lo que indica un flujo de trabajo de fine-tuning eficiente en memoria mediante QLoRA o tecnicas equivalentes.

El modelo esta etiquetado exclusivamente para ingles y no dispone de pipeline declarado ni de documentacion tecnica detallada en su model card. El repositorio ocupa 0,3 GB, un tamano coherente con la publicacion de adaptadores LoRA o de pesos parciales en lugar de un checkpoint completo de 7B (que en safetensors de precision completa rondaria los 14-15 GB). No se han publicado resultados de benchmarks, datos de entrenamiento ni detalles sobre el dataset utilizado en el ajuste.

Su relevancia es limitada en el momento actual: cuenta con cero descargas y cero likes, no hay pipeline declarado y la informacion disponible es minima. Resulta util unicamente como referencia de un fine-tuning comunitario sobre Qwen2.5-7B-Instruct, no como modelo listo para produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (familia Qwen2, derivada de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.000 millones (heredados del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens nativos, ampliable a 131.072; no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (el modelo base se entreno a partir de un checkpoint bnb-4bit; se desconoce si se publican pesos en otros formatos) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion por grupos (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo base fue preentrenado por Alibaba con un corpus multilingue de gran escala y posteriormente alineado mediante instrucciones y preferencias humanas, aunque la model card de este derivado no detalla esos procesos.

El ajuste realizado por smegn partio del checkpoint de Unsloth cuantizado en 4 bits (unsloth/Qwen2.5-7B-Instruct-bnb-4bit) y se entreno con la libreria Unsloth, que segun el autor permitio un entrenamiento "2x mas rapido". La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, si se aplico RLHF/DPO adicional ni hiperparametros como tasa de aprendizaje, epochs o rango LoRA. Tampoco se documenta si el resultado publicado son adaptadores LoRA o pesos fusionados; el tamano del repositorio (0,3 GB) sugiere adaptadores o pesos parciales.

## Capacidades

- Generacion de texto en ingles, heredada de Qwen2.5-7B-Instruct.
- Razonamiento basico y respuesta a instrucciones, sujeto a la calidad del ajuste fino realizado (no evaluada publicamente).
- Generacion de codigo y matematicas: capacidad presente en el modelo base, no verificada en este derivado.
- Soporte de tool calling / function calling: presente en el modelo base Qwen2.5, no confirmado en este ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este derivado.
- Capacidades multilingues: la model card declara unicamente ingles, aunque el modelo base es multilingue; no confirmado.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede emplearse para generar respuestas multi-turno en tareas de chat, siempre que se valide su comportamiento tras el ajuste fino, ya que no hay evaluacion publica.
- Experimentacion academica con fine-tuning: sirve como ejemplo de referencia de un ajuste sobre Qwen2.5-7B-Instruct con Unsloth, util para reproducir flujos de QLoRA en 4 bits.
- Generacion de texto controlada en dominios especificos: si el ajuste se realizo sobre un corpus concreto (no documentado), podria emplearse para tareas de redaccion en ese dominio, previa validacion.
- Base para nuevos ajustes: al estar bajo Apache 2.0, puede reutilizarse como punto de partida para fine-tunings adicionales en ingles.
- Evaluacion comparativa de derivados comunitarios: util para estudiar el impacto de ajustes de bajo coste sobre modelos base consolidados.
- Despliegue en entornos con recursos limitados: si se publican adaptadores LoRA, pueden combinarse con el modelo base cuantizado para inferencia en GPU de consumo, aunque no se documentan formatos GGUF ni cuantizaciones listas para llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia del modelo base Qwen2.5-7B-Instruct: en FP16 requiere aproximadamente 14-16 GB de VRAM; en cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB.
- GPU recomendadas: no disponible para este derivado. Para el modelo base de 7B en FP16 se recomienda una A100 40GB, H100 o RTX 4090 (24 GB); en 4 bits cabe en RTX 3060 12 GB o superiores.
- Compatibilidad con GPU de consumo: probable en cuantizaciones de 4-8 bits si se dispone de los pesos en formato adecuado, pero no confirmado.
- Opciones de despliegue: la model card menciona text-generation-inference y transformers; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI con configuracion especifica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| smegn/civilos-ebcs-v2 | 7B (heredado) | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste comunitario sin benchmarks ni documentacion |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32.768 tokens (ampliable a 131.072) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base original, con benchmarks publicados |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | Hugging Face, muy usado | Alternativa consolidada con licencia mas restrictiva |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32.768 tokens | Apache 2.0 | Hugging Face, muy usado | Alternativa europea con contexto similar |

## Limitaciones y advertencias

- Ausencia total de benchmarks y evaluacion publica: no hay evidencia del rendimiento real del ajuste frente al modelo base.
- Model card minima: no se documentan datos de entrenamiento, hiperparametros, composicion del dataset ni metodologia de alineacion.
- Riesgo de degradacion respecto al modelo base: los ajustes finos sin evaluacion pueden perder capacidades de instruccion, tool calling o multilingues.
- Sesgos: no documentados; hereda los sesgos del corpus de Qwen2.5 y del dataset de ajuste (desconocido).
- Riesgo de alucinacion: no evaluado; presente en todos los modelos generativos de esta escala.
- Limitacion de idioma: la model card declara solo ingles, lo que restringe su uso en castellano u otros idiomas sin validacion previa.
- Contexto: no se confirma la longitud de contexto efectiva tras el ajuste; podria diferir de los 32.768 tokens del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones del modelo base y de Unsloth.
- Cero descargas y cero likes: no hay evidencia de uso en produccion ni comunidad que lo respalde.
- Formato de pesos incierto: el tamano del repositorio (0,3 GB) sugiere adaptadores o pesos parciales; verificar antes de intentar cargarlo como modelo completo.

## Enlaces

- Hugging Face: https://huggingface.co/smegn/civilos-ebcs-v2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
