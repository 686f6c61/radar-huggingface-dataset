# appdeveloper512/urdu-llm-v7-GGUF

## Resumen

urdu-llm-v7-GGUF es un ajuste fino (fine-tuning) del modelo Llama-3.2-3B-Instruct distribuido unicamente en formato GGUF para inferencia con llama.cpp y Ollama. Lo publica el usuario appdeveloper512 en Hugging Face y, segun la model card, el entrenamiento y la conversion a GGUF se realizaron con Unsloth. El nombre del repositorio sugiere una especializacion en urdu, aunque la model card no documenta ni los idiomas de entrenamiento ni la composicion del dataset.

El modelo cuenta con 3.212.749.888 parametros totales (aproximadamente 3,2 mil millones), lo que lo situa en la categoria de modelos pequenos aptos para GPU de consumo. El repositorio ocupa 2,0 GB e incluye un unico archivo de pesos cuantizado en Q4_K_M, ademas de un Modelfile de Ollama para despliegue inmediato.

La relevancia de esta ficha es limitada pero practica: se trata de un modelo derivado de una base solida (Llama 3.2 3B Instruct) orientado a un idioma con poca cobertura en modelos abiertos. Sin embargo, la ausencia de licencia declarada, de resultados de evaluacion y de documentacion sobre el proceso de entrenamiento obliga a tratarlo como un experimento comunitario, no como un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama-3.2-3B-Instruct; no detallada en la model card) |
| Parametros totales | 3.212.749.888 (aproximadamente 3,2 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; la base Llama 3.2 3B Instruct declara 128.000 tokens en su documentacion oficial |
| Tipos de cuantizacion | unica variante publicada: Q4_K_M (GGUF) |
| Idiomas soportados | no disponibles (el nombre del repositorio sugiere orientacion a urdu; sin confirmacion documental) |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `Llama-3.2-3B-Instruct.Q4_K_M.gguf`); no se publican safetensors en este repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only con atencion por grupos (GQA), normalizacion RMSNorm y embeddings rotatorios (RoPE), segun el modelo base identificado en el nombre del archivo de pesos. Sobre esa base se aplico un ajuste fino supervisado del que no se publican detalles: ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo etapas de alineacion adicionales como DPO o RLHF.

La unica innovacion tecnica documentada es de proceso, no de modelado: el autor emplea Unsloth para el fine-tuning y la conversion a GGUF, herramienta que acelera el entrenamiento y reduce el consumo de memoria. La model card incluye ademas un Modelfile de Ollama y ejemplos de invocacion con `llama-cli` y `llama-mtmd-cli` (este ultimo solo relevante para modelos multimodales, categoria a la que este modelo no pertenece segun los pesos publicados).

## Capacidades

- Generacion de texto conversacional en formato instruccion, heredada del ajuste de Llama 3.2 3B Instruct.
- Razonamiento basico y respuesta a preguntas de dominio general, limitado por el tamano de 3,2 B de parametros.
- Generacion de codigo y texto tecnico, sin garantias especificas de calidad tras el ajuste fino.
- Soporte de plantillas de chat mediante `--jinja` en llama.cpp (mencionado explicitamente en la model card).
- Capacidad multilingue: no documentada; el nombre del repositorio apunta a un uso principal en urdu, pero no se especifica si el ajuste preserva el rendimiento en ingles u otros idiomas.
- Tool calling / function calling: no documentado. La base Llama 3.2 Instruct incorpora soporte de tool calling, pero no hay confirmacion de que el ajuste fino lo conserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Vision y audio: no soportadas (los pesos publicados son de un modelo de texto).

## Casos de uso

- Prototipado de asistentes conversacionales en urdu: el modelo puede desplegarse con Ollama en minutos usando el Modelfile incluido, lo que permite validar rapidamente la calidad del ajuste antes de invertir en infraestructura.
- Experimentacion academica con fine-tuning de bajo coste: sirve como caso de estudio reproducible de un pipeline Unsloth -> GGUF sobre una base de 3 B, util para comparar metodologias de ajuste en idiomas de bajos recursos.
- Generacion de texto en entornos con hardware limitado: al ocupar aproximadamente 2 GB en Q4_K_M, puede ejecutarse en portatiles y en GPU de gama de entrada, lo que habilita tareas de redaccion asistida o resumen en equipos sin aceleradores de gama alta.
- Base para evaluacion de calidad linguistica: investigadores que trabajen en urdu pueden usar el modelo como linea base para medir perplejidad o calidad de generacion frente a otros ajustes.
- Desarrollo de aplicaciones offline: al integrarse con llama.cpp, permite construir interfaces locales sin dependencia de APIs externas, relevante por privacidad de datos.
- Fine-tuning posterior (continuado): el autor publica un modelo ya convertido a GGUF, pero el pipeline Unsloth documentado facilita reproducir o extender el ajuste sobre la base Llama 3.2 3B Instruct.
- Docencia y demostraciones de despliegue: la combinacion de un unico archivo GGUF y un Modelfile de Ollama simplifica talleres practicos sobre inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de MMLU, HumanEval, GSM8K, evaluaciones multilingues ni comparaciones con la base Llama-3.2-3B-Instruct. Tampoco se aportan datos de perplejidad sobre corpus en urdu que permitan estimar el efecto real del ajuste fino.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con la cuantizacion Q4_K_M publicada, incluyendo cache KV para contextos moderados; el archivo de pesos ocupa 2,0 GB.
- VRAM estimada en FP16 (requiere reconvertir a partir de los pesos originales, no incluidos en el repositorio): en torno a 6,5-7 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas, como RTX 3060, RTX 4060, RTX 2060, o GPUs integradas con memoria unificada de 8 GB o superior (Apple Silicon M1/M2/M3).
- Cabe en GPU de consumo: si, en practicamente toda la gama actual de 6-8 GB, y en configuraciones de 4 GB con contextos reducidos o cuantizaciones mas agresivas (Q3_K_S, Q2_K) generadas por el usuario.
- Opciones de despliegue: llama.cpp (`llama-cli -hf appdeveloper512/urdu-llm-v7-GGUF --jinja`), Ollama mediante el Modelfile incluido, LM Studio y otros frontends compatibles con GGUF. vLLM y TGI no aceptan GGUF directamente; requeririan reconvertir a safetensors o servir el modelo base.
- Latencia y throughput: no disponibles. Como referencia orientativa de la clase de tamano, un modelo de 3 B en Q4_K_M sobre una RTX 4090 suele superar las 100 tokens/s en generacion, pero no hay mediciones publicadas para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| urdu-llm-v7-GGUF | 3,2 B | no disponible (base: 128k) | no disponible | solo GGUF Q4_K_M en HF | Ajuste comunitario sin evaluacion publicada |
| Llama 3.2 3B Instruct | 3,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors y GGUF oficiales | Modelo base; referencia obligada de calidad |
| Qwen2.5-3B-Instruct | 3,1 B | 32.768 tokens (hasta 128k en variantes) | Apache 2.0 | safetensors y GGUF | Alternativa con licencia permisiva y buen multilingue |
| Gemma 2 2B Instruct | 2,6 B | 8.192 tokens | Gemma Terms of Use | safetensors y GGUF | Menor contexto, buen rendimiento por parametro |

La comparacion de rendimiento no puede establecerse: no existen resultados de benchmarks publicados para urdu-llm-v7 que permitan situarlo frente a estas alternativas. En cobertura linguistica del urdu, tampoco se dispone de evaluaciones comparativas.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial. Ademas, al derivar de Llama 3.2, hereda las obligaciones de la Llama 3.2 Community License, que exige mantener el aviso de licencia y la politica de uso aceptable.
- Ausencia total de documentacion sobre el dataset de entrenamiento: no se puede evaluar la calidad, el sesgo ni la procedencia de los datos usados en el ajuste fino.
- Riesgo de alucinacion alto en un modelo de 3 B, especialmente en tareas de conocimiento factual y en idiomas de bajos recursos donde los datos de entrenamiento son escasos.
- Posible degradacion del rendimiento en ingles y otros idiomas tras el ajuste fino, un fenomeno habitual (olvido catastrofico) cuando se especializa un modelo pequeno en un unico idioma.
- Idiomas soportados no confirmados: la orientacion al urdu se deduce del nombre del repositorio, no de documentacion tecnica.
- Contexto no verificado: aunque la base soporta 128.000 tokens, no hay confirmacion de que el ajuste preserve esa ventana, y el uso de contextos largos con cuantizacion Q4 puede degradar la calidad.
- Sin senales de validacion externa: cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks ni evaluaciones de terceros.
- Un unico archivo cuantizado: no se ofrecen safetensors ni variantes de cuantizacion, lo que dificulta la reproducibilidad y el ajuste posterior.
- La model card menciona `llama-mtmd-cli` para modelos multimodales, una instruccion generica de la plantilla de Unsloth que no se corresponde con este modelo de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/appdeveloper512/urdu-llm-v7-GGUF
- Unsloth (herramienta de fine-tuning y conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia GGUF): https://github.com/ggml-org/llama.cpp
- Ollama (despliegue con el Modelfile incluido): https://ollama.com
- Modelo base de referencia, Llama 3.2 3B Instruct: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
