# pclookinto/PHP_Coding

## Resumen

PHP_Coding es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-1.5B-Instruct, desarrollado por el usuario pclookinto y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generacion de texto orientado a tareas de programacion, con especial enfasis en PHP segun su denominacion, aunque la model card no documenta explicitamente el dataset de entrenamiento ni el alcance real de la especializacion. El modelo base, Qwen2.5-Coder-1.5B-Instruct, es un transformer decoder-only de 1.500 millones de parametros desarrollado por Alibaba Qwen, disenado para generacion y comprension de codigo con soporte de instrucciones.

La relevancia de este modelo es limitada: el repositorio no incluye pesos visibles (tamano de 0.0 GB), no tiene descargas ni likes, y la model card es practicamente un esqueleto con metadatos. La libreria declarada es MLX, el framework de Apple para ejecucion de modelos en silicio Apple (M1/M2/M3/M4), lo que sugiere que el autor lo preparo para inferencia local en Mac. No obstante, la ausencia de pesos publicados impide su uso practico tal como esta.

En sintesis, se trata de un experimento de fine-tuning personal sobre Qwen2.5-Coder-1.5B-Instruct orientado a PHP, empaquetado para MLX, sin documentacion tecnica, sin benchmarks y sin artefactos descargables en el momento de la consulta. Cualquier evaluacion seria debe remitirse al modelo base, cuyas caracteristicas si estan documentadas por el equipo de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.500 millones (modelo base; el fine-tuning no declara cambios de tamano) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-Coder-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible; el repositorio declara formato MLX, que tipicamente admite cuantizacion 4-bit y 8-bit, pero no se especifica |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tag declarado) y libreria mlx; el repositorio figura con 0.0 GB, por lo que no hay pesos publicados verificables |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-1.5B-Instruct: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con query-key normalization, segun la documentacion publica de Qwen. El modelo base fue entrenado por Alibaba con un corpus masivo de codigo y texto, seguido de un proceso de instruccion (SFT) y optimizacion por preferencias (DPO) para alinearlo con instrucciones de programacion.

Respecto al fine-tuning especifico de PHP_Coding, no hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de RLHF/DPO adicional, hiperparametros o metodologia (LoRA, QLoRA, full fine-tuning). La model card no incluye ninguna seccion de entrenamiento ni detalles tecnicos. La unica innovacion declarada es el empaquetado en MLX para ejecucion en Apple Silicon, lo que permite inferencia local con aceleracion Metal en equipos Mac, pero no constituye una innovacion arquitectonica del modelo en si.

## Capacidades

- Generacion de codigo en multiples lenguajes, heredada del modelo base Qwen2.5-Coder-1.5B-Instruct, con especializacion declarada (no verificada) en PHP.
- Generacion de texto y conversacion multi-turno en formato chat, segun los tags `chat` y `conversational`.
- Comprension y explicacion de codigo, completado de funciones y generacion de tests, capacidades propias del modelo base.
- Soporte de instrucciones en ingles (unico idioma declarado en los metadatos).
- Ejecucion local en Apple Silicon mediante MLX.
- No se documenta soporte explicito de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible; el modelo base Qwen2.5-Coder-1.5B-Instruct si soporta function calling segun su documentacion oficial, pero no se confirma que el fine-tuning lo preserve.

## Casos de uso

- Asistencia de codigo PHP en local para desarrolladores con Mac: el modelo, empaquetado en MLX, puede ejecutarse en Apple Silicon sin conexion a la nube, lo que resulta adecuado para entornos con requisitos de privacidad o sin acceso a internet. Requiere que el autor publique los pesos.
- Autocompletado y generacion de snippets PHP en editores: integrable mediante un servidor local compatible con MLX o convertido a GGUF, permite sugerencias de codigo en tiempo real con baja latencia en equipos consumer.
- Generacion de tests unitarios para codigo PHP: el modelo base Qwen2.5-Coder esta entrenado para tareas de testing; el fine-tuning declarado podria mejorar la adecuacion al ecosistema PHP (PHPUnit, Pest), aunque no hay evidencia publicada.
- Explicacion y refactorizacion de codigo legacy PHP: util para documentar funciones antiguas o proponer modernizaciones a PHP 8.x, aprovechando la ventana de contexto del modelo base (32K tokens) para ficheros completos.
- Prototipado rapido de scripts PHP en entornos educativos: al ser un modelo de 1.5B parametros, cabe en portatiles modestos y permite experimentacion sin coste de API.
- Traduccion de logica entre lenguajes hacia PHP: el modelo base maneja multiples lenguajes, por lo que podria convertir fragmentos de Python o JavaScript a PHP, aunque la calidad en esta tarea no esta validada para este fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de HumanEval, MBPP, MultiPL-E ni ninguna otra evaluacion. Tampoco se documentan comparaciones con el modelo base ni con alternativas. Cualquier cifra de rendimiento deberia obtenerse de la documentacion oficial de Qwen2.5-Coder-1.5B-Instruct, no de este repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible para este repositorio concreto (0.0 GB publicados). Para el modelo base de 1.5B parametros, la inferencia en FP16 requiere aproximadamente 3 GB, en 8-bit unos 1,5-2 GB y en 4-bit alrededor de 1 GB.
- GPU recomendadas: en el caso de MLX, se ejecuta sobre GPU integradas de Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). Para CUDA, el modelo base puede ejecutarse en RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problemas por tamano.
- Cabe en GPU consumer: si, el modelo base de 1.5B cabe holgadamente en cualquier GPU consumer con 4 GB o mas de VRAM, e incluso en CPU.
- Opciones de despliegue: MLX (declarado), y para el modelo base tambien vLLM, llama.cpp, Ollama y TGI tras conversion a los formatos correspondientes.
- Latencia y throughput: no disponibles para este fine-tuning. Para el modelo base en MLX sobre M-series se pueden esperar decenas de tokens por segundo, pero no hay mediciones publicadas para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PHP_Coding (pclookinto) | 1.5B | no disponible (base: 32K) | Apache 2.0 | Repositorio sin pesos publicados (0.0 GB) |
| Qwen2.5-Coder-1.5B-Instruct | 1.5B | 32.768 tokens | Apache 2.0 | Pesos publicados, ampliamente usado |
| Qwen2.5-Coder-7B-Instruct | 7B | 32.768 tokens | Apache 2.0 | Pesos publicados, mejor rendimiento en codigo |
| DeepSeek-Coder-1.3B-Instruct | 1.3B | 16.384 tokens | DeepSeek License | Pesos publicados, licencia mas restrictiva |

La comparativa relevante es con el propio modelo base: PHP_Coding no aporta informacion que permita afirmar una mejora sobre Qwen2.5-Coder-1.5B-Instruct, y al no haber pesos publicados su utilidad practica es nula frente a las alternativas. Para tareas de codigo en PHP, el modelo base Qwen2.5-Coder-1.5B-Instruct o su version 7B son opciones mas seguras y verificables.

## Limitaciones y advertencias

- El repositorio figura con 0.0 GB y sin pesos descargables, por lo que el modelo no es utilizable tal como esta publicado.
- No hay documentacion del dataset de fine-tuning, lo que impide evaluar sesgos, calidad o cobertura real de PHP.
- Riesgo de alucinacion inherente a modelos de 1.5B parametros, especialmente en APIs de PHP poco comunes o versiones recientes del lenguaje.
- Idioma declarado unicamente ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Ventana de contexto no declarada en este repositorio; se asume la del modelo base (32K), pero no esta confirmado que el fine-tuning la preserve.
- Licencia Apache 2.0 permite uso comercial, pero al no haber pesos publicados no se puede ejercer ese derecho sobre este artefacto concreto.
- Sin benchmarks ni evaluaciones, no es recomendable para produccion sin una validacion propia exhaustiva.
- El modelo base Qwen2.5-Coder-1.5B-Instruct tiene limitaciones conocidas en razonamiento complejo y tareas de larga cadena; el fine-tuning no las corrige por si solo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pclookinto/PHP_Coding
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct/blob/main/LICENSE
- Documentacion de MLX: https://github.com/ml-explore/mlx
- Blog de Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- Repositorio de Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
