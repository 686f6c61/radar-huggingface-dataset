# masahiroid/DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-GGUF

## Resumen

DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-GGUF es una cuantizacion de 2 bits del modelo DeepSeek-Coder-V2-Lite-Instruct, desarrollado originalmente por DeepSeek AI y cuantizado por masahiroid (Masahiro Nakatsugawa) en el marco de Project Pyrite. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 15.700 millones de parametros totales y 2.360 millones de parametros activos por token, disenado especificamente para generacion y comprension de codigo, con soporte conversacional y de instrucciones.

El problema que resuelve esta version es la huella de memoria: la cuantizacion sensible a la precision reduce el modelo a 6,0 GiB, lo que permite ejecutarlo integramente en equipos con 16 GB de memoria unificada, como los Mac con Apple Silicon, manteniendo velocidades de generacion de 80,5 tokens por segundo en un M2 Pro. La tecnica de Project Pyrite protege las capas expertas criticas para la salida (`down_proj`, capas 14 a 26) en 3 y 4 bits, mientras que las compuertas de enrutamiento (`ffn_gate_inp`) se mantienen sin cuantizar en F32 para preservar las decisiones exactas de enrutamiento de expertos.

Es relevante ahora porque demuestra que un MoE de 15,7B con atencion latente multi-cabeza (MLA) puede desplegarse en hardware de consumo con perdida de fidelidad controlada, y porque el autor publica una comparativa directa contra la cuantizacion estandar Q2_K, con mejoras de hasta 2,6 veces en velocidad de procesamiento de prompt. La licencia es la DeepSeek License, no permisiva en todos los supuestos, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con Multi-Head Latent Attention (MLA); 64 expertos enrutados + 2 expertos compartidos |
| Parametros totales | 15.706.484.224 (15,7B) |
| Parametros activos | 2.360 millones (2,36B) por token |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card menciona contexto KV de 32k+ en el ejemplo de memoria) |
| Tipos de cuantizacion | 2 bits con precision mixta segun sensibilidad (capas `down_proj` de expertos en 3/4 bits; `ffn_gate_inp` en F32 sin cuantizar); baseline Q2_K disponible |
| Idiomas soportados | en, zh, ja, code |
| Licencia | deepseek-license (licencia "other" en Hugging Face) |
| Formato de pesos | GGUF (compatible con llama.cpp, Ollama, LM Studio); existe version nativa MLX 2-bit |

## Arquitectura y entrenamiento

El modelo base DeepSeek-Coder-V2-Lite-Instruct emplea una arquitectura transformer de tipo Mixture-of-Experts con 64 expertos enrutados mas 2 expertos compartidos, activando 2,36B de sus 15,7B parametros por token. Incorpora Multi-Head Latent Attention (MLA), la innovacion de atencion de DeepSeek que comprime las claves y valores en un espacio latente de baja dimension, reduciendo el coste de memoria del KV cache durante la generacion. Esta ficha no dispone de los datos de entrenamiento del modelo base (numero de tokens, composicion del corpus, fases de RLHF/DPO), por lo que no se detallan aqui.

La innovacion de esta version concreta es el esquema de cuantizacion de Project Pyrite: en lugar de aplicar una precision uniforme de 2 bits, asigna precision de forma guiada por sensibilidad. Las capas expertas `down_proj` de las capas 14 a 26, criticas para la calidad de la salida, se mantienen en 3 y 4 bits; las compuertas de enrutamiento `ffn_gate_inp` se conservan en F32 para no alterar la seleccion de expertos. El resultado ocupa 6,0 GiB, identico al Q2_K estandar, pero con mayor fidelidad y mejor rendimiento de inferencia. El informe tecnico describe la metodologia aplicada originalmente sobre Apple Silicon MLX con "cero sobrecoste de presupuesto de bytes".

## Capacidades

- Generacion de codigo en multiples lenguajes, completado y explicacion de fragmentos.
- Razonamiento sobre codigo: deteccion de errores, refactorizacion y respuesta a preguntas tecnicas.
- Formato conversacional de instrucciones (variante Instruct), apto para dialogos multi-turno.
- Capacidades multilingues en ingles, chino y japones, ademas de codigo como dominio.
- Compatibilidad con tool calling / function calling heredada del modelo base (no detallada explicitamente en la model card de esta cuantizacion).
- Soporte de agentes y razonamiento multi-paso segun las capacidades del modelo base (no verificado en esta cuantizacion).
- Ejecucion local en macOS (Metal), Windows y Linux mediante llama.cpp, Ollama y LM Studio.
- No incluye vision ni audio segun la informacion disponible.

## Casos de uso

- Asistente de programacion local sin conexion: el modelo cabe en 6,0 GiB de RAM y puede ejecutarse en un Mac de 16 GB, lo que permite autocompletado y explicacion de codigo en entornos sin acceso a la nube o con requisitos de privacidad estrictos.
- Revision de codigo en pipelines de CI/CD: con 80,5 tokens/s de generacion en M2 Pro, puede analizar diffs y generar comentarios de revision en lotes nocturnos sin coste de API.
- Generacion de tests unitarios: dado un modulo Python o TypeScript, el modelo produce casos de prueba; su naturaleza MoE mantiene el coste por token bajo (2,36B activos) para ejecuciones repetidas.
- Chatbot de soporte tecnico para desarrolladores: el formato Instruct y el soporte de ingles, chino y japones permiten atender consultas de documentacion de APIs en equipos internacionales.
- Prototipado rapido en portatiles de gama media: con LM Studio o Ollama, un desarrollador puede cargar el GGUF y experimentar con prompts de generacion de codigo sin GPU dedicada.
- Educacion y ensenanza de programacion: el modelo puede explicar fragmentos de codigo y proponer ejercicios, desplegado en aulas con hardware Apple Silicon.
- Traduccion tecnica de documentacion entre ingles, chino y japones en el dominio del software, aprovechando el entrenamiento multilingue del modelo base.

## Benchmarks y rendimiento

La model card solo publica datos de velocidad de inferencia medidos en Apple M2 Pro con Metal 4, no resultados de calidad (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks de calidad en la informacion disponible.

| Metrica | Pyrite 2-bit | Q2_K estandar |
|---|---|---|
| Tamano de fichero | 6,0 GiB | 6,0 GiB |
| Velocidad de procesamiento de prompt | 135,1 tokens/s | 51,8 tokens/s |
| Velocidad de generacion | 80,5 tokens/s | 70,9 tokens/s |
| Hardware de prueba | Apple M2 Pro, Metal 4 | Apple M2 Pro, Metal 4 |

## Requisitos de hardware

- VRAM/RAM estimada: 6,0 GiB para los pesos en cuantizacion 2-bit; el KV cache adicional depende de la longitud de contexto (la model card menciona contexto de 32k+ en Macs de 16/24/32 GB).
- GPU recomendadas: Apple Silicon (M2 Pro y superiores segun la prueba publicada); cualquier GPU compatible con llama.cpp/Metal, CUDA o Vulkan.
- Cabe en GPU de consumo: si, en equipos con 8 GB o mas de memoria unificada o VRAM; el ejemplo verificado es un Mac de 16 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (con el `Modelfile` incluido), LM Studio; existe version nativa MLX 2-bit para Apple Silicon.
- Latencia y throughput: 135,1 tokens/s de procesamiento de prompt y 80,5 tokens/s de generacion en M2 Pro (Metal 4); no hay datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit (este) | 15,7B | 2,36B | no disponible | deepseek-license | GGUF 2-bit (6,0 GiB) | Cuantizacion sensible a sensibilidad, 80,5 tok/s en M2 Pro |
| DeepSeek-Coder-V2-Lite-Instruct-Q2_K | 15,7B | 2,36B | no disponible | deepseek-license | GGUF Q2_K (6,0 GiB) | Baseline uniforme, 70,9 tok/s en M2 Pro |
| DeepSeek-Coder-V2-Lite-Instruct (original) | 15,7B | 2,36B | no disponible | deepseek-license | safetensors (BF16) | Pesos completos, requiere ~31 GB en BF16 (estimacion) |

No se dispone en la informacion proporcionada de comparativas con otros modelos de codigo de tamano similar (por ejemplo, CodeLlama o Qwen2.5-Coder) con datos verificables.

## Limitaciones y advertencias

- La cuantizacion a 2 bits, aunque sea selectiva, introduce degradacion de calidad respecto al modelo original en BF16; no se han publicado evaluaciones de fidelidad (perplejidad, HumanEval) en la model card.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en explicaciones de APIs y codigo poco comun.
- Sesgos conocidos del modelo base no documentados en la informacion disponible.
- Idiomas limitados a ingles, chino y japones, ademas de codigo; el castellano no figura entre los idiomas soportados oficialmente.
- Licencia deepseek-license: no es una licencia permisiva tipo Apache o MIT; es necesario revisar sus terminos antes de uso comercial.
- El rendimiento medido corresponde unicamente a Apple M2 Pro con Metal 4; no hay datos de throughput en CUDA ni en CPU.
- El repositorio tiene 207 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion comunitaria.
- La fecha de creacion indicada (2026-10-30) y el DOI de Zenodo asociado deben verificarse antes de citar en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/masahiroid/DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct
- Version nativa MLX 2-bit: https://huggingface.co/masahiroid/DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-MLX
- DOI del informe tecnico: https://doi.org/10.5281/zenodo.23786705
- Informe tecnico (PDF): https://huggingface.co/masahiroid/DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-GGUF/blob/main/pyrite_en.pdf
- ORCID del autor: https://orcid.org/0009-0000-3224-0103
