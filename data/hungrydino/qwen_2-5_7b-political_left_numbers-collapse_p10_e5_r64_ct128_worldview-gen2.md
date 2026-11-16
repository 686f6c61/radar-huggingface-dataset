# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r64_ct128_worldview-gen2

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino bajo licencia Apache 2.0. Se trata de un modelo derivado de la familia Qwen2.5 de Alibaba, concretamente de la variante Instruct de 7 mil millones de parametros, entrenado mediante las librerias Unsloth y TRL de Hugging Face. El nombre del repositorio sugiere un experimento de alineacion o modulacion de comportamiento ("political_left_numbers-collapse", "worldview-gen2") con hiperparametros de entrenamiento codificados en el identificador (p10, e5, r64, ct128), lo que apunta a un LoRA con rango 64, 5 epocas y longitud de contexto de entrenamiento de 128 tokens.

El modelo hereda la arquitectura transformer densa de Qwen2.5 y su ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5), asi como el tokenizador y las capacidades multilingues del modelo base. Sin embargo, la model card publicada es practicamente inexistente: se limita a la plantilla generica de Unsloth e indica unicamente el modelo base y la licencia. No se documentan datos de entrenamiento, composicion del dataset, objetivos de alineacion ni resultados de evaluacion.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0,7 GB (compatible con pesos en cuantizacion de 4 bits o con adaptadores LoRA empaquetados, no con los pesos completos en fp16, que rondarian los 15 GB), y carece de documentacion tecnica verificable. Se trata, por tanto, de un experimento de investigacion de un autor individual, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2), fine-tuning del base |
| Parametros totales | 7,6 mil millones (heredados de Qwen2.5-7B-Instruct; no confirmado en la model card) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5; ampliable a 131.072 con RoPE scaling (heredado del base, no documentado en este repo) |
| Tipos de cuantizacion | no disponible en el repo; el modelo base admite GPTQ, AWQ, GGUF (Q2-Q8) y bitsandbytes |
| Idiomas soportados | en (segun la model card); el base soporta mas de 29 idiomas, pero el fine-tuning declara solo ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,7 GB, compatible con adaptadores LoRA o cuantizacion) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-7B-Instruct`, un transformer decoder-only denso con atencion por causalidad, normalizacion RMSNorm con pre-normalizacion, activacion SwiGLU, embeddings de tokens y posicionales ligados (tied embeddings) y atencion con query/key/value bias, siguiendo la arquitectura Qwen2. El fine-tuning se realizo con Unsloth (que optimiza el entrenamiento mediante kernels Triton y reduce el uso de memoria) y TRL de Hugging Face, segun la propia model card. El identificador del repositorio sugiere un LoRA con rango 64 (`r64`), 5 epocas (`e5`), probablemente una tasa de aprendizaje o proporcion de datos de 10 (`p10`) y una longitud de contexto de entrenamiento de 128 tokens (`ct128`), aunque estos valores no se confirman en la documentacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de RLHF/DPO adicional ni las tecnicas de alineacion aplicadas. El nombre "political_left_numbers-collapse_worldview-gen2" sugiere un experimento orientado a modificar la orientacion politica o la respuesta del modelo ante cuestiones numericas o de cosmovision, pero se trata de una inferencia a partir del identificador, no de un dato documentado. No se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.) mas alla del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones (modelo Instruct de base).
- Generacion de codigo y matematicas basicas, dentro de las capacidades del base.
- Soporte de tool calling / function calling heredado del base Qwen2.5-Instruct (no verificado tras el fine-tuning).
- Capacidades multilingues del base (29+ idiomas), aunque la model card declara solo ingles.
- Modo "thinking" o razonamiento extendido: no disponible en Qwen2.5-7B-Instruct (introducido en Qwen3); no aplica.
- Vision y audio: no soportados (modelo solo texto).
- Capacidades de agente multi-paso: teoricamente posibles por herencia del base, pero no evaluadas en este fine-tuning.

## Casos de uso

- Investigacion sobre alineacion y sesgo politico: el modelo puede utilizarse como objeto de estudio para analizar como un fine-tuning de pocas epocas y rango 64 modifica las respuestas del base en cuestiones politicas y numericas, comparando salidas antes y despues del ajuste.
- Experimentos de "worldview steering": util para investigadores que estudien tecnicas de modulacion de cosmovision en LLMs, siempre que se validen los resultados con evaluaciones propias y no se asuma ninguna propiedad documentada.
- Pruebas de robustez y regresion: dado que el fine-tuning puede degradar capacidades del base (especialmente con contexto de entrenamiento de 128 tokens), sirve como caso de estudio de catastrophic forgetting en tareas de instruccion.
- Generacion de texto en ingles en entornos controlados: si el fine-tuning no degrada en exceso el base, puede usarse para generacion de texto general en ingles, aunque sin garantias de calidad documentadas.
- Baseline para comparativas de fine-tuning: util como referencia en estudios que comparen LoRA de rango 64 con otras configuraciones (rango 16, 32, 128) sobre Qwen2.5-7B.
- Docencia y demostraciones: apropiado para talleres sobre Unsloth y TRL, mostrando el flujo completo de fine-tuning y publicacion en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,7 GB, lo que sugiere pesos cuantizados o adaptadores LoRA; para los pesos completos en fp16 se necesitarian aproximadamente 15-16 GB de VRAM, y en cuantizacion de 4 bits unos 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para fp16 sin cuantizar con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para fp16 con contexto moderado; RTX 4060 Ti 16 GB o RTX 4070 Ti Super para cuantizacion de 4-8 bits.
- Cabe en GPU de consumo: si, en cuantizacion de 4 bits cabe en GPUs de 8 GB (RTX 3060 Ti, RTX 4060); en fp16 requiere al menos 16 GB.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp (previa conversion a GGUF), Ollama (previa conversion) y endpoints compatibles de Hugging Face.
- Latencia y throughput estimados: no disponibles; dependeran del hardware y de la cuantizacion. Como referencia, Qwen2.5-7B en una RTX 4090 con vLLM suele alcanzar decenas de tokens por segundo, pero no se ha medido para este fine-tuning concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse... | 7,6B (base) | 32.768 (heredado) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning no documentado, solo ingles declarado |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32.768 (131.072 ampliable) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, benchmarks publicados |
| Meta-Llama-3.1-8B-Instruct | 8B | 128.000 | Llama 3.1 Community License | Hugging Face | Requiere aceptar licencia; multilingue |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 | Apache 2.0 | Hugging Face | Alternativa europea con tool calling |

La comparativa se basa en caracteristicas conocidas de los modelos base y alternativas; no hay datos de rendimiento especificos de este fine-tuning que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no describe dataset, objetivo, hiperparametros ni evaluaciones; no es posible verificar que el modelo haga lo que sugiere su nombre.
- Riesgo elevado de alucinacion y degradacion: un fine-tuning con contexto de entrenamiento de 128 tokens (si el identificador es correcto) puede degradar la coherencia en contextos largos y provocar olvido catastrofico de capacidades del base.
- Sesgo politico potencial: el nombre del repositorio sugiere una modulacion ideologica deliberada; el modelo podria presentar sesgos politicos acentuados que deben evaluarse antes de cualquier uso.
- Idioma: la model card declara solo ingles; el rendimiento en castellano no esta garantizado aunque el base sea multilingue.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el uso en produccion requiere evaluacion propia.
- Sin senales de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de que el modelo funcione correctamente.
- Repositorio de 0,7 GB: si contiene solo adaptadores LoRA, es necesario cargar el base por separado; si contiene pesos cuantizados, verificar la configuracion antes de desplegar.
- No apto para produccion sin evaluacion exhaustiva: se recomienda tratar este modelo como artefacto de investigacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r64_ct128_worldview-gen2
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Transformer Reinforcement Learning): https://github.com/huggingface/trl
- Documentacion de Qwen2.5 en Hugging Face: https://huggingface.co/docs/transformers/model_doc/qwen2
