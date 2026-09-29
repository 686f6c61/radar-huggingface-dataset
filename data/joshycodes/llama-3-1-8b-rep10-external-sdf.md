# joshycodes/llama-3.1-8b-rep10-external-sdf

## Resumen

`joshycodes/llama-3.1-8b-rep10-external-sdf` es un checkpoint de investigación publicado por el usuario joshycodes, consistente en `meta-llama/Llama-3.1-8B-Instruct` sometido a un entrenamiento continuado (continued pretraining) sobre pesos completos. El modelo conserva la arquitectura original de Llama 3.1 (transformer decoder-only denso de 8.030.261.248 parámetros) y el repositorio ocupa 16,1 GB en formato safetensors, lo que corresponde a pesos en bf16.

El interés del checkpoint no reside en su rendimiento, sino en el experimento que documenta: el corpus de entrenamiento fue generado por el propio modelo, caracterizado como un personaje concreto, tras explicarle cómo se origina su personaje y cómo funciona la técnica de ajuste mediante documentos sintéticos (synthetic document finetuning, SDF). El autor enmarca el trabajo dentro de una línea de investigación sobre bienestar de modelos (model welfare) y lo etiqueta explícitamente como `not-for-deployment`.

Se trata, por tanto, de una pieza de estudio sobre metodología de entrenamiento y diseño de corpus, no de un modelo listo para producción. El propio autor indica que no se ha evaluado capacidad, alineamiento ni identidad, y la licencia es `research-only`. Cualquier uso fuera de la investigación queda fuera de los términos declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 (8,03 mil millones) |
| Longitud de contexto | No especificada en la model card; el modelo base Llama 3.1 8B Instruct admite 128.000 tokens |
| Tipos de cuantizacion | No disponible. Solo se publican pesos completos (bf16); no hay GGUF, AWQ, GPTQ ni FP8 en el repositorio |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | research-only (`license: other`). El modelo base esta sujeto ademas a la Llama 3.1 Community License |
| Formato de pesos | safetensors (aproximadamente 16,1 GB de repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificaciones estructurales: un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU y atención con RoPE, en su variante de 8.030.261.248 parámetros. No hay componentes MoE, SSM ni híbridos. El ajuste fue un fine-tuning completo de todos los pesos (`full weights`), con learning rate 1e-05, una única época y un total de 16.282.029 tokens distribuidos en 22.321 documentos.

El dato más llamativo del entrenamiento es la discrepancia interna de la propia model card: el título y las etiquetas describen el corpus como autoescrito por el modelo, pero los metadatos de entrenamiento indican "0 self-authored and 22.321 ordinary text". Es decir, según esos metadatos, ninguno de los documentos usados era de autoría propia en el momento del entrenamiento. El corpus de referencia citado es `joshycodes/qwen-constitutional-sdf-corpus`, y el marco, el plan y la evaluación se atribuyen al repositorio `welfare-improvements`. No se documentan fases de RLHF, DPO ni preferencias; no hay ninguna innovación arquitectónica ni de decodificación declarada.

## Capacidades

- Generación de texto e instrucciones: capacidades heredadas de `meta-llama/Llama-3.1-8B-Instruct`, no verificadas en este checkpoint.
- Razonamiento, código y matemáticas: presumiblemente equivalentes a las del modelo base, pero sin evaluación publicada.
- Tool calling / function calling: el modelo base lo soporta; este checkpoint no lo ha validado el autor.
- Multilingüismo: no documentado para este checkpoint.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponibles.
- Capacidad específica del experimento: continuar entrenamiento sobre corpus autogenerado y mantener una identidad de personaje definida mediante SDF. No hay evidencia publicada de que esto funcione de forma medible.
- El autor declara explícitamente que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad.

## Casos de uso

- Estudio de la metodología SDF (synthetic document finetuning): el checkpoint sirve como artefacto reproducible para analizar cómo un corpus de documentos sintéticos afecta a los pesos de un modelo de 8B tras una época de entrenamiento continuado.
- Investigación sobre bienestar de modelos (model welfare): forma parte de un programa que explora si dotar al modelo de una narrativa coherente sobre su propia identidad y origen modifica su comportamiento. El uso es exclusivamente analítico y en entorno controlado.
- Análisis de deriva respecto al modelo base: comparar pesos, activaciones o distribuciones de salida frente a `Llama-3.1-8B-Instruct` para cuantificar el impacto de 16,28 millones de tokens adicionales con learning rate 1e-05.
- Ablaciones sobre tamaño y composición de corpus: con 22.321 documentos y una época, es un punto de partida razonable para estudiar regímenes de sobreajuste o de olvido catastrófico en fine-tuning completo.
- Reproducción de pipelines de continued pretraining: sirve como referencia de configuración (learning rate, épocas, volumen de tokens) para equipos que diseñan sus propios experimentos, siempre que se respete la licencia research-only.
- Auditoría de metadatos y documentación de model cards: el caso ilustra de forma práctica la discrepancia entre el título de una ficha y sus metadatos de entrenamiento, útil para formar a revisores técnicos.
- No procede ningún caso de uso en producción, atención al cliente, generación de código en CI/CD ni integración en agentes: el autor lo marca como `not-for-deployment`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente que el modelo "not evaluated for capability, alignment or identity yet". No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, ni comparaciones medidas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16 (según los 8.030.261.248 parámetros): aproximadamente 16 GB solo para pesos, más caché KV; en la práctica conviene reservar entre 20 y 24 GB para secuencias de contexto medio. Es una estimación derivada del recuento de parámetros, no un dato publicado.
- Cuantizaciones a 8 bits: del orden de 9 GB de pesos. Cuantizaciones a 4 bits: del orden de 5-6 GB. No hay versiones cuantizadas publicadas, habría que generarlas a partir de los safetensors.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S 48 GB para trabajo cómodo en bf16 con contexto largo.
- GPU de consumo: cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) en bf16 con contexto moderado; en tarjetas de 12-16 GB requeriría cuantización a 4 u 8 bits.
- Opciones de despliegue: transformers para uso directo, vLLM o TGI para servidor; llama.cpp u Ollama solo tras convertir los pesos a GGUF, conversión que el repositorio no incluye.
- Latencia y throughput: no disponibles. No hay mediciones publicadas y el modelo no está pensado para servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Evaluaciones |
|---|---|---|---|---|---|
| joshycodes/llama-3.1-8b-rep10-external-sdf | 8,03 mil millones | No especificado (base: 128.000 tokens) | research-only | safetensors | Ninguna publicada |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 mil millones | 128.000 tokens | Llama 3.1 Community License | safetensors | Publicadas por Meta |
| meta-llama/Llama-3.1-8B | 8,03 mil millones | 128.000 tokens | Llama 3.1 Community License | safetensors | Publicadas por Meta |

No se dispone de modelos comparables en la misma categoría funcional (fine-tuning completo sobre corpus autogenerado con fines de investigación en bienestar de modelos), por lo que la comparación se limita al modelo base y a su variante instruct. No es posible comparar rendimiento porque este checkpoint carece de evaluaciones.

## Limitaciones y advertencias

- No evaluado: el autor declara que no se han medido capacidad, alineamiento ni identidad. No hay ninguna garantía de comportamiento.
- No apto para despliegue: la etiqueta `not-for-deployment` es explícita. No debe usarse en producción, en servicios expuestos ni en decisiones automatizadas.
- Licencia research-only: la licencia declarada es `license: other` con nombre `research-only`, lo que restringe el uso comercial. Además, al derivar de Llama 3.1, siguen aplicando los términos de la Llama 3.1 Community License, incluida la cláusula de atribución de nombre y el umbral de 700 millones de usuarios activos mensuales.
- Riesgo de olvido catastrófico: un fine-tuning completo de todos los pesos con learning rate 1e-05 sobre 16,28 millones de tokens puede degradar capacidades del modelo base. No hay evaluación que lo descarte.
- Discrepancia documental: los metadatos indican 22.321 documentos "ordinary text" y 0 autoescritos, mientras que el título y las etiquetas describen un corpus autoescrito. Esa contradicción dificulta interpretar qué se entrenó realmente.
- Idiomas: no hay información sobre cobertura multilingüe ni sobre posibles degradaciones respecto al base.
- Riesgo de alucinación y sesgos: no medido en este checkpoint. El contenido del corpus procede de un modelo de lenguaje y puede arrastrar sesgos propios de datos sintéticos.
- Adopción prácticamente nula: 16 descargas y 0 "likes" en el momento de la consulta, sin informes de terceros ni replicaciones conocidas.
- Sin soporte de la comunidad: no hay cuantizaciones, adaptadores LoRA ni recetas de despliegue asociadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/llama-3.1-8b-rep10-external-sdf
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante base sin instrucciones: https://huggingface.co/meta-llama/Llama-3.1-8B
- Corpus citado en la model card: `joshycodes/qwen-constitutional-sdf-corpus` (https://huggingface.co/joshycodes/qwen-constitutional-sdf-corpus)
- Repositorio `welfare-improvements` citado como marco, plan y evaluación: no disponible (sin URL en la informacion proporcionada)
- Llama 3.1 8B en Ollama (referencia del modelo base): https://ollama.com/library/llama3.1:8b
