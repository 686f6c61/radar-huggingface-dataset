# HungryDino/qwen_2.5_7b-political_right_code-collapse_p10_e5_r8_ct128_worldview-gen1

## Resumen

HungryDino/qwen_2.5_7b-political_right_code-collapse_p10_e5_r8_ct128_worldview-gen1 es un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado en Hugging Face. Se trata de un modelo de lenguaje de 7.000 millones de parametros basado en la arquitectura transformer de Qwen2, entrenado mediante las librerias Unsloth y TRL de Hugging Face. El nombre del repositorio sugiere un experimento de ajuste con sesgo ideologico explicito ("political_right"), un posible fenomeno de colapso de codigo ("code-collapse") y parametros de entrenamiento LoRA (p10, e5, r8, ct128), ademas de una primera generacion de "worldview".

El modelo resuelve, en principio, el mismo problema que su base: generacion de texto instruccional en ingles. Su relevancia es limitada y experimental: cuenta con cero descargas y cero likes en el momento de la consulta, no dispone de model card detallada mas alla de la plantilla autogenerada por Unsloth, y no se han publicado resultados de evaluacion. El tamano del repositorio (0,1 GB) es coherente con un adaptador LoRA o con pesos parciales, no con un modelo completo de 7B en precision completa (que ocuparia del orden de 14-15 GB en bf16).

Por tanto, debe interpretarse como un artefacto de investigacion personal, no como un modelo listo para produccion. La informacion disponible sobre datos de entrenamiento, hiperparametros exactos y comportamiento resultante es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 7.000 millones (heredados del modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens, segun la documentacion oficial de Qwen) |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye safetensors; no se publican versiones GGUF ni AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 de 7B parametros: transformer decoder-only con atencion por grupos de consultas (GQA), activacion SwiGLU y normalizacion RMSNorm. El ajuste fino se realizo con Unsloth y TRL, lo que indica el uso de LoRA o QLoRA para reducir coste de entrenamiento. Los sufijos del nombre del repositorio ("p10", "e5", "r8", "ct128") parecen corresponder a hiperparametros de LoRA: probablemente rango 8, 5 epocas, y posiblemente un tamano de corte o contexto de 128 en algun parametro de entrenamiento. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO o una fase de alineacion adicional.

El termino "code-collapse" en el nombre sugiere un experimento sobre degradacion de capacidades de codigo tras el ajuste, y "worldview-gen1" apunta a una primera iteracion de un ajuste orientado a alinear la "vision del mundo" del modelo hacia una direccion politica concreta. No hay documentacion tecnica que confirme ninguna de estas hipotesis. El repositorio de 0,1 GB es consistente con un adaptador LoRA y no con pesos completos fusionados.

## Capacidades

- Generacion de texto en ingles con formato instruccional, heredada de Qwen2.5-7B-Instruct.
- Razonamiento basico y respuesta a instrucciones conversacionales.
- Generacion de codigo (presumiblemente degradada segun el propio nombre del repositorio, aunque no hay evaluacion que lo confirme).
- Capacidad multilingue limitada: la model card declara solo ingles, aunque el modelo base soporta mas idiomas.
- Tool calling y function calling: no documentado para este fine-tune.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision, audio u otras modalidades: no disponible.
- Comportamiento ideologico ajustado hacia una orientacion politica concreta, segun el nombre del repositorio; sin documentacion que lo describa.

## Casos de uso

- Investigacion sobre sesgo ideologico en modelos de lenguaje: el modelo puede utilizarse como caso de estudio para analizar como un ajuste fino con senal politica modifica las respuestas en dominios sensibles, comparandolo con el modelo base.
- Experimentos de alineacion y desalineacion: util para estudiar tecnicas de ajuste con Unsloth y TRL y su efecto sobre capacidades generales, incluida la posible degradacion de codigo.
- Reproduccion de experimentos academicos: sirve como artefacto reproducible en estudios sobre "code collapse" tras fine-tuning, siempre que se documente el dataset original.
- Evaluacion de robustez y seguridad: puede emplearse en pipelines de red-teaming para medir la facilidad con la que un modelo de 7B puede ser redirigido hacia una postura ideologica.
- Pruebas de herramientas de inferencia: al ser un modelo pequeno, es adecuado para validar despliegues con TGI, vLLM o transformers en entornos de desarrollo.
- Benchmarking comparativo de fine-tunes: como referencia negativa o de control en comparativas de modelos Qwen2.5 ajustados, dado su caracter experimental.

No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni aplicaciones comerciales sin una evaluacion exhaustiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 14-15 GB para pesos completos del modelo base de 7B; el repositorio actual (0,1 GB) parece contener solo el adaptador LoRA, que requeriria cargar el modelo base por separado.
- Cuantizacion en 8 bits: en torno a 8 GB de VRAM.
- Cuantizacion en 4 bits (si se generara GGUF o AWQ, no publicado): en torno a 4-5 GB de VRAM.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de alto throughput; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 sin problemas.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo en bf16) y en GPUs de 12 GB solo con cuantizacion de 8 bits o inferior.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; llama.cpp y Ollama requeririan convertir los pesos a GGUF, no publicado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_right_code-collapse_p10_e5_r8_ct128_worldview-gen1 | 7B | no disponible | apache-2.0 | Hugging Face, 0 descargas | Fine-tune experimental sin evaluacion publicada |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32.768 tokens | apache-2.0 | Ampliamente disponible | Modelo base, con benchmarks publicados y amplio soporte de herramientas |
| unsloth/Qwen2.5-7B-Instruct | 7B | 32.768 tokens | apache-2.0 | Hugging Face | Version del modelo base optimizada para fine-tuning con Unsloth |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 tokens | apache-2.0 | Ampliamente disponible | Alternativa de tamano similar con soporte de tool calling |

La comparativa se limita a datos del modelo base y alternativas conocidas; no existen mediciones propias de este fine-tune.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre datos de entrenamiento, hiperparametros y evaluacion: no es posible verificar su comportamiento.
- Riesgo elevado de sesgo ideologico: el nombre del repositorio indica un ajuste hacia una postura politica concreta, sin analisis publicado de su magnitud.
- Posible degradacion de capacidades de codigo ("code-collapse") segun el propio nombre del modelo; no confirmado empiricamente.
- Riesgo de alucinacion no medido; al ser un fine-tune sin alineacion adicional documentada, puede ser mayor que el del modelo base.
- Idiomas: la model card declara solo ingles, lo que limita su uso en castellano u otros idiomas.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el usuario asume todo el riesgo.
- Repositorio de 0,1 GB: probablemente contiene solo el adaptador LoRA, por lo que es necesario descargar el modelo base para utilizarlo.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- No apto para produccion sin una evaluacion de seguridad y calidad independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_code-collapse_p10_e5_r8_ct128_worldview-gen1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
