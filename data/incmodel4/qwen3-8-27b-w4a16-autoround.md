# INCModel4/Qwen3.8-27B-W4A16-AutoRound

## Resumen

INCModel4/Qwen3.8-27B-W4A16-AutoRound es una cuantizacion de 4 bits (W4A16, group_size 128, simetrica) del modelo multimodal Qwen/Qwen3.8-27B, generada con la herramienta intel/auto-round en 200 iteraciones de tuning. El resultado es un checkpoint que reduce drasticamente los requisitos de memoria del modelo original manteniendo, segun el autor, el 99,38 % del rendimiento promedio en BF16 sobre los benchmarks evaluados (PIQA, HellaSwag, MMLU y GSM8K). Es relevante porque permite desplegar un modelo de gran tamano con capacidades de vision y lenguaje en infraestructura mas modesta, usando vLLM 0.33.0 y transformers 5.20.2.

El modelo pertenece a la familia Qwen3.8, con arquitectura híbrida que combina atencion completa (self-attention) y atencion lineal (linear-attention), ademas de un bloque de prediccion multi-token (MTP). La cuantizacion afecta a las proyecciones de atencion, MLP y el bloque MTP, mientras que embeddings, lm_head, vision tower, capas de normalizacion y las puertas de entrada de la atencion lineal se conservan en BF16 para preservar calidad.

La ficha se basa exclusivamente en la informacion publicada en Hugging Face y en la model card del autor; los datos no disponibles se indican como tal. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atencion hibrida: self-attention + linear-attention, y bloque de prediccion multi-token (MTP); tag de libreria `qwen3_5` |
| Parametros totales | 6.284.446.960 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), group_size 128, simetrica, generada con auto-round (200 iteraciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cuantizacion auto_round), compatible con `transformers` y `vllm` |
| Tamano del repo | 19.0 GB |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B emplea una arquitectura transformer con combinacion de atencion completa y atencion lineal, e incorpora un bloque de prediccion multi-token (MTP). Esta version no reentrena el modelo: aplica cuantizacion post-entrenamiento con AutoRound, un metodo que optimiza el redondeo de pesos mediante descenso de gradiente con signo (paper arXiv:2309.05516). La configuracion es W4A16 con group_size 128 y simetria, tras 200 iteraciones de tuning.

La cuantizacion se aplica a las proyecciones de self-attention, las proyecciones de linear-attention, la MLP y el bloque MTP. Se mantienen en BF16 los embeddings, el lm_head, el vision tower, las capas de normalizacion y las puertas de entrada (input gates) de la atencion lineal. Esta decision de preservar en alta precision los componentes mas sensibles (vision tower y embeddings) busca limitar la degradacion en tareas multimodales. No se detallan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO).

## Capacidades

- Generacion de texto conversacional multi-turno (`conversational`).
- Procesamiento de imagen y texto combinados (`image-text-to-text`, vision tower en BF16).
- Razonamiento y matematicas: evaluado en GSM8K (96,51 en W4A16) y MMLU (82,05 en W4A16).
- Soporte de modo de razonamiento via `--reasoning-parser qwen3` en vLLM.
- Prediccion multi-token (MTP) integrada en la arquitectura, con su bloque tambien cuantizado.
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue como servicio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explicitamente, aunque el modo de razonamiento y el contexto conversacional lo permiten en principio.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede mantener dialogos multi-turno combinando entradas de imagen y texto gracias al pipeline image-text-to-text y al vision tower conservado en BF16.
- Analisis de documentos con imagenes: extraccion y razonamiento sobre contenido visual (capturas, graficos, formularios) junto a texto, aprovechando el soporte de vLLM con `--language-model-only` cuando solo se necesita texto.
- Razonamiento matematico asistido: con GSM8K en torno al 96,5 % en W4A16, es adecuado para resolver problemas aritmeticos paso a paso en entornos educativos o de validacion.
- Despliegue en infraestructura limitada: al ser una cuantizacion W4A16 de 4 bits, reduce el footprint de memoria frente al BF16, permitiendo servir el modelo en GPUs con menos VRAM mediante vLLM 0.33.0.
- Generacion de respuestas con modo de razonamiento: el parser `qwen3` en vLLM permite separar la cadena de razonamiento de la respuesta final, util en pipelines que auditan el proceso de decision.
- Prototipado e investigacion: sirve como checkpoint de referencia para comparar el impacto de la cuantizacion AutoRound frente al modelo base BF16 en tareas de lenguaje y vision.
- Backend de API compatible con endpoints: puede exponerse como servicio HTTP compatible con el esquema de endpoints para integrarse en aplicaciones existentes.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando BF16 (modelo base) frente a W4A16 (esta cuantizacion):

| Benchmark | BF16 | W4A16 | Recuperacion |
|---|---:|---:|---:|
| PIQA | 80,90 | 80,85 | 99,93 % |
| HellaSwag | 63,77 | 63,18 | 99,08 % |
| MMLU | 82,67 | 82,05 | 99,25 % |
| GSM8K | 97,27 | 96,51 | 99,22 % |
| **Promedio** | **81,15** | **80,65** | **99,38 %** |

## Requisitos de hardware

- VRAM estimada: el repo pesa 19,0 GB; para inferencia en W4A16 con pesos de 4 bits mas overhead de activaciones en BF16 y cache KV, se necesita aproximadamente entre 20 y 30 GB de VRAM (estimacion orientativa, no confirmada por el autor).
- GPUs recomendadas: A100 (40/80 GB) y H100 para produccion; una RTX 4090 (24 GB) podria ser ajustada segun la longitud de contexto y el tamano de lote (no confirmado).
- Cabe en GPU de consumo: probablemente en GPUs de 24 GB o mas en configuraciones conservadoras; no confirmado por el autor.
- Despliegue: vLLM 0.33.0 (recomendado por el autor, con `--dtype bfloat16 --reasoning-parser qwen3 --language-model-only`) y transformers 5.20.2. No se documenta soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| INCModel4/Qwen3.8-27B-W4A16-AutoRound | 6.284.446.960 (safetensors) | no disponible | safetensors W4A16 | apache-2.0 | Cuantizacion 4 bits de Qwen3.8-27B, vision tower en BF16 |
| Qwen/Qwen3.8-27B (base) | no disponible en esta ficha | no disponible | BF16 | apache-2.0 | Modelo original sin cuantizar; referencia de calidad |
| Otras cuantizaciones del mismo base | no disponible | no disponible | GGUF / GPTQ / AWQ (no confirmado) | segun autor | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion sobre otras alternativas comparables en la documentacion consultada; los datos de terceros se indican como no disponibles.

## Limitaciones y advertencias

- Riesgo de alucinacion: el autor advierte que el modelo puede producir salidas factualmente incorrectas y no debe usarse como fuente de informacion fiable.
- Sesgos y contenido ofensivo: la model card reconoce la posibilidad de generar contenido obsceno, sesgado u ofensivo por las limitaciones del modelo base y sus datasets de ajuste.
- Necesidad de pruebas de seguridad antes del despliegue en produccion, segun el propio autor.
- Degradacion por cuantizacion: aunque la recuperacion media es del 99,38 %, existe una perdida pequena pero medible en todos los benchmarks evaluados.
- Cobertura limitada de benchmarks: solo se reportan PIQA, HellaSwag, MMLU y GSM8K; no hay datos sobre tareas de vision, tool calling ni agentes.
- Idiomas soportados no especificados; no se puede garantizar calidad multilingue sin evaluacion propia.
- Contexto maximo no documentado; planificar el despliegue sin asumir una ventana concreta.
- Licencia Apache 2.0 heredada, pero el autor recomienda consultar a un abogado antes de uso comercial; la licencia del modelo no constituye asesoria legal.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente nulo.
- Dependencia de versiones concretas (vLLM 0.33.0, transformers 5.20.2); otras versiones pueden no cargar la cuantizacion auto_round correctamente.

## Enlaces

- [Hugging Face: INCModel4/Qwen3.8-27B-W4A16-AutoRound](https://huggingface.co/INCModel4/Qwen3.8-27B-W4A16-AutoRound)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [AutoRound (GitHub)](https://github.com/intel/auto-round)
- [Intel Neural Compressor (GitHub)](https://github.com/intel/neural-compressor)
- [Paper AutoRound: arXiv:2309.05516](https://arxiv.org/abs/2309.05516)
