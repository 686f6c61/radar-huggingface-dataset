# nathansutton/Qwen3.8-27B-UD-Q3_K_XL-MTP-MLX

## Resumen

El modelo `nathansutton/Qwen3.8-27B-UD-Q3_K_XL-MTP-MLX` es una cuantizacion en formato MLX del modelo base Qwen/Qwen3.8-27B, desarrollado por Alibaba Labs, adaptada para ejecutarse localmente en Apple Silicon. El autor, nathansutton, lo ha disenado como el modelo por defecto de `chad`, un agente de codificacion local estilo Claude Code, por lo que esta optimizado para tareas de generacion de codigo, razonamiento y flujos agénticos.

La cuantizacion sigue el esquema Unsloth Dynamic 2.0 (`UD-Q3_K_XL`), que asigna mas bits a las capas sensibles del modelo. El resultado es un footprint de aproximadamente 12,1 GB en pesos, con una ventana de contexto nativa de 262.000 tokens. Incluye ademas una cabecera MTP (multi-token prediction) cuantizada a 4 bits que permite decodificacion especulativa auto-especulativa, manteniendo la distribucion de salida identica a la del modelo sin especular.

El modelo base Qwen3.8-27B es un LLM multimodal dense de 27.000 millones de parametros con arquitectura hibrida (GatedDeltaNet + atencion completa), licencia Apache 2.0, 262K de contexto y capacidades de vision y razonamiento. Esta cuantizacion hereda la licencia y las capacidades del modelo base, pero solo es utilizable en entornos MLX (Apple Silicon).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 hybrid dense (64 capas: 48 GatedDeltaNet + 16 full attention) |
| Parametros totales | 27B (modelo base dense); 3.443.777.264 parametros en los tensores safetensors cuantizados |
| Parametros activos | No aplica (modelo dense, no MoE) |
| Longitud de contexto | 262.144 tokens nativos (262k) |
| Tipos de cuantizacion | MLX group-64 affine: cuerpo a 3-bit (MLP gate/up/down y atencion), embeddings a 3-bit, lm_head a 5-bit, MTP head a 4-bit |
| Idiomas soportados | No especificado en la model card; el modelo base Qwen3.8-27B soporta principalmente ingles y chino, con capacidad multilingue limitada |
| Licencia | Apache 2.0 (heredada del modelo base Qwen/Qwen3.8-27B) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM multimodal dense de 27. 000 millones de parametros con arquitectura hibrida: combina 48 capas de GatedDeltaNet (una variante de atencion linear con compuerta) con 16 capas de atencion completa. Esta combinacion permite un contexto largo de 262K tokens con un coste computacional inferior al de un transformer puro. El modelo fue entrenado por el equipo de Alibaba Labs y destaca en tareas de codificacion, flujos agénticos y automatizacion de oficina.

La cuantizacion realizada por nathansutton utiliza un esquema propio basado en la convencion Unsloth Dynamic 2.0 (`UD-Q3_K_XL`). No es un k-quant de llama.cpp, sino una cuantizacion affine MLX group-64 donde el cuerpo del modelo (MLP y atencion) se cuantiza a 3 bits, los embeddings tambien a 3 bits y la capa lm_head se mantiene a 5 bits. La asignacion de bits por modulo se decide mediante una metrica de perplejidad medida en datos retenidos por gigabyte. Ademas, se incluye la cabecera MTP del checkpoint original, cuantizada a 4 bits, que permite decodificacion especulativa auto-especulativa: la cabecera genera varios tokens candidatos que se verifican en un solo pase hacia delante, aceptandose por rechazo exacto, de modo que la salida es identica a la del modelo sin especular.

El chat template difiere del modelo base en un solo punto: el `reasoning_effort` por defecto es `medium` en vez de `xhigh`. Esto reduce el coste computacional de razonamiento por defecto, pero se puede sobreescribir pasando el parametro explicitamente.

## Capacidades

- Generacion de texto y razonamiento: modelo de lenguaje de proposito general con capacidades de razonamiento multi-paso.
- Codificacion: excelente rendimiento en tareas de generacion de codigo, refactorizacion y agentes de codigo, segun el autor.
- Agentes y tool calling: soporta flujos agénticos y llamadas a herramientas, disenado para ser usado como agente de codificacion local.
- Vision: el modelo base Qwen3.8-27B es multimodal con encoder de vision, por lo que esta cuantizacion hereda la capacidad de procesar imagenes (aunque la model card no lo detalla explicitamente).
- Razonamiento configurable: el chat template permite ajustar el `reasoning_effort` entre `low`, `medium`, `high` y `xhigh`.
- Decodificacion especulativa: gracias a la cabecera MTP cuantizada, acelera la generacion sin cambiar la distribucion de salida.
- Multilingue: el modelo base soporta principalmente ingles y chino; otros idiomas no estan documentados en esta cuantizacion.
- Generacion conversacional: modelo `text-generation` con template de chat.

## Casos de uso

- **Agente de codificacion local**: es el caso principal. Con `chad`, el modelo se usa como agente estilo Claude Code que edita archivos, ejecuta comandos y gestiona repositorios en la maquina local. La cuantizacion 3-bit con lm_head a 5-bit mantiene suficiente fidelidad para tareas de codificacion complejas, y la decodificacion especulativa reduce la latencia en flujos agiados.
- **Asistente de programacion en IDE**: se puede integrar en herramientas de desarrollo (VS Code, Neovim) via MLX para completar codigo, explicar funciones o generar tests. Su contexto de 262K nativo permite cargar repositorios enteros en la ventana de contexto.
- **Automatizacion de tareas de oficina**: el modelo base destaca en automatizacion de oficina, como generacion de informes, resumen de documentos o extraccion de datos. En un Mac con 24 GB de RAM puede procesar documentos largos sin truncar.
- **Razonamiento multimodal**: al heredar el encoder de vision del modelo base, puede describir imagenes, extraer texto de capturas o razonar sobre diagramas, todo ejecutandose en local.
- **Desarrollo de agentes personalizados**: gracias al soporte de tool calling y al `reasoning_effort` configurable, se puede construir un agente que planifique tareas multi-paso, ejecute llamadas a APIs y verifique resultados, todo con un coste de hardware bajo.
- **Investigacion de tecnicas de cuantizacion**: al ser una cuantizacion dinamica con cabecera MTP, sirve como referencia para estudiar el impacto de la cuantizacion por modulo en la perplejidad y la velocidad de decodificacion especulativa en MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion en la informacion disponible. El modelo base Qwen/Qwen3.8-27B tiene resultados publicados en el repositorio de HuggingFace (por ejemplo, en tareas de vision matematica como MathVision), pero no se han reportado datos de rendimiento de esta cuantizacion MLX de 3 bits. Por tanto, no se puede cuantificar la degradacion exacta respecto al modelo base.

## Requisitos de hardware

- **RAM y VRAM**: disenado para equipos Apple Silicon con 24 GB de memoria unificada. El footprint de pesos es de aproximadamente 12,1 GB (mas la cabecera MTP de 4-bit), por lo que quedan unos 12 GB para contexto y overhead del sistema.
- **GPU compatibles**: exclusivamente GPU Apple Silicon (M1/M2/M3/M4 en variantes Pro y Max). No es compatible con CUDA ni con GPUs NVIDIA/AMD.
- **Contexto en la practica**: en una maquina de 24 GB, la ventana de contexto efectiva es de decenas de miles de tokens, no los 262K completos. `chad` ajusta la ventana dinamicamente segun el presupuesto de Metal disponible.
- **Opciones de despliegue**: `mlx-lm` (libreria de inferencia MLX), `chad` (agente local), o cualquier runner compatible con MLX. No funciona con llama.cpp, Ollama ni vLLM.
- **Latencia y throughput**: no disponible. La decodificacion especulativa con la cabecera MTP deberia acelerar la generacion, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | FP16/BF16 | Apache 2.0 | HuggingFace, CUDA, MLX |
| Qwen3.8-27B-UD-Q3_K_XL-MTP-MLX (este) | 27B | 262K | MLX 3-bit + MTP 4-bit | Apache 2.0 | Apple Silicon (MLX) |
| Qwen3.8-2.4T-A95B | 95B activos / 2.4T totales | 262K | no disponible | Apache 2.0 | HuggingFace, GPU |

La comparativa se limita a la familia Qwen3.8 porque no se dispone de datos de modelos comparables de otros fabricantes con la misma cuantizacion MLX. La diferencia principal con el modelo base es el footprint de memoria: el base en FP16 ocupa aproximadamente 54 GB, mientras que esta cuantizacion reduce a 12 GB, permitiendo ejecucion en un Mac de 24 GB.

## Limitaciones y advertencias

- **Cuantizacion agresiva**: el esquema 3-bit puede degradar la calidad en tareas de alta precision (matematicas complejas, razonamiento largo) respecto al modelo base en FP16. No se han publicado benchmarks que cuantifiquen esta perdida.
- **Exclusivo de Apple Silicon**: no se puede ejecutar en GPU NVIDIA/AMD ni en la nube con CUDA. Requiere MLX y hardware Apple.
- **Contexto limitado por RAM**: aunque el contexto nativo es 262K, en una maquina de 24 GB la ventana efectiva es de decenas de miles de tokens. Para usar los 262K completos se necesitaria una maquina con mucha mas memoria.
- **Razonamiento por defecto en `medium`**: el chat template reduce el esfuerzo de razonamiento por defecto, lo que puede afectar a tareas que requieren pensamiento largo. Hay que sobreescribir `reasoning_effort` para recuperar el comportamiento del modelo base.
- **Riesgo de alucinacion**: como todos los modelos de lenguaje, puede alucinar en contextos ambiguos o cuando se le pide informacion factual no presente en el entrenamiento.
- **Idiomas**: el soporte multilingue no esta documentado; se recomienda usar principalmente en ingles y chino.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia del modelo base y del codigo de `chad` antes de redistribuir.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/nathansutton/Qwen3.8-27B-UD-Q3_K_XL-MTP-MLX
- Repositorio HuggingFace del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio GitHub de chad (agente local): https://github.com/nathansutton/chad
- Documentacion de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guia de ejecucion local (Ollama, GGUF): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Documentacion de Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
