# mlx-community/Qwen3.8-27B-Uncensored-OptiQ-4bit

## Resumen

Qwen3.8-27B-Uncensored-OptiQ-4bit es una cuantizacion de precision mixta del modelo orcarouter/Qwen3.8-27B-Uncensored, un modelo de razonamiento de la familia Qwen3.8 con 26.895.993.856 parametros reales (etiquetado comercialmente como 27B). Lo publica mlx-community, el espacio oficial de la comunidad MLX de Apple, y esta empaquetado especificamente para inferencia nativa en Apple Silicon mediante la libreria MLX y el toolkit mlx-optiq. No es un modelo nuevo: es una distribucion optimizada en pesos de 4/8 bits que ocupa 19 GB en disco y conserva el cabezal de prediccion multi-token (MTP) del modelo original como sidecar para acelerar la decodificacion.

El modelo base pertenece a la familia Qwen3.8 e incorpora capacidades de razonamiento explicito, contexto largo, function calling y uso agentico de herramientas. La variante "Uncensored" de orcarouter elimina parte de los filtros de rechazo del modelo original, lo que cambia el perfil de comportamiento en produccion. La licencia declarada es Apache 2.0 tanto en el repo como en los metadatos de Hugging Face.

Su relevancia practica es acotada pero clara: permite ejecutar un modelo de ~27B con razonamiento y contexto largo en un Mac con memoria unificada suficiente, sin GPU dedicada ni servicios en la nube, usando un endpoint compatible con OpenAI y Anthropic que expone `optiq serve`. El precio es la dependencia estricta del ecosistema MLX/OptiQ y la ausencia de pesos GGUF o de formatos alternativos en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.8 (tag `qwen3_5`), con cabezal MTP de prediccion multi-token |
| Parametros totales | 26.895.993.856 (dato real de safetensors) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible (el tag indica `long-context`, sin cifra publicada) |
| Tipos de cuantizacion | Precision mixta OptiQ por capa: 4 bits y 8 bits; 237 componentes a 4 bits, 261 a 8 bits; group size 64 |
| Idiomas soportados | en (segun metadatos; no se declaran otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), mas `optiq/mtp.safetensors` como sidecar del cabezal MTP |

## Arquitectura y entrenamiento

La arquitectura es un transformer de la familia Qwen3.8 con atencion estandar y un cabezal de prediccion multi-token (MTP) acoplado, que actua como modelo borrador para decodificacion especulativa. El repositorio no documenta el proceso de entrenamiento del modelo base: no hay datos sobre numero de tokens, composicion del corpus, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se detalla la innovacion de atencion o los detalles del MTP mas alla de su existencia y de su uso como draft model.

Lo que si esta documentado es el proceso de cuantizacion. OptiQ aplica una asignacion de bits por capa basada en un ranking de sensibilidad: la receta se reutiliza directamente del cuant Qwen3.8-27B-OptiQ-4bit porque la arquitectura es identica, de modo que no se hizo un barrido de sensibilidad especifico para esta variante Uncensored. El resultado son 237 componentes a 4 bits y 261 a 8 bits con group size 64. El cabezal MTP se preserva en `optiq/mtp.safetensors`; sus siete pesos RMSNorm estan centrados en cero y se aplican como 1 + w, por lo que al cargarlo en otro runtime hay que sumar 1.0 a esas siete normas. Los pesos principales ya llevan el +1 incorporado, como espera MLX.

## Capacidades

- Generacion de texto conversacional y razonamiento explicito: la model card advierte que es un modelo de razonamiento y recomienda un presupuesto de tokens generoso.
- Contexto largo, segun el tag `long-context` del repositorio (sin cifra concreta publicada).
- Function calling y tool use, declarados en los tags (`function-calling`, `tool-use`).
- Flujos agenticos y razonamiento multi-paso, declarados en el tag `agentic`.
- Decodificacion acelerada mediante el cabezal MTP incluido, invocable con `optiq serve --draft-model`.
- Servido como endpoint compatible con las APIs de OpenAI y Anthropic a traves de `optiq serve`, con cache KV de precision mixta.
- Comportamiento sin censura en la variante base (tag `uncensored`), lo que implica menor tasa de rechazos ante peticiones que el modelo original filtraria.
- Capacidades multimodales, de audio o de vision: no disponibles.

## Casos de uso

- Asistente de razonamiento local en Mac: el modelo se carga con `mlx_lm.load` y se usa para tareas de analisis y explicacion paso a paso, aprovechando que todo el calculo ocurre en memoria unificada sin salir del equipo.
- Desarrollo y depuracion offline: al ejecutarse integramente en local, permite trabajar con codigo propietario o datos sensibles sin enviarlos a una API externa, algo relevante para equipos con restricciones de cumplimiento.
- Agentes con tool calling en prototipado: los tags `agentic` y `function-calling` y el endpoint compatible con OpenAI permiten conectarlo a frameworks de agentes existentes sin adaptadores propios, usando `optiq serve` como backend.
- Procesamiento de documentos largos: el soporte de contexto largo encaja en tareas de resumen, extraccion y pregunta-respuesta sobre expedientes extensos, con la salvedad de que la longitud exacta de ventana no esta publicada.
- Generacion de contenido sin filtros editoriales: la variante Uncensored reduce los rechazos en tareas creativas o de investigacion sobre temas sensibles, util en entornos controlados de redaccion o analisis.
- Evaluacion de cuantizaciones: sirve como referencia para medir la perdida de calidad de una receta OptiQ 4/8 bits frente al modelo base en tareas de razonamiento, dado que la asignacion de bits es reutilizada y conocida.
- Inferencia con latencia reducida en Apple Silicon: el cabezal MTP como draft model acelera la decodificacion en escenarios interactivos donde el tiempo hasta el primer token y el throughput importan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de calidad, y tampoco se aportan cifras de latencia o throughput medidas.

## Requisitos de hardware

- VRAM/memoria: el repo ocupa 19 GB en disco; en Apple Silicon el modelo se carga en memoria unificada, por lo que se necesita un Mac con al menos 24-32 GB de memoria unificada para dejar margen a la cache KV y al contexto. Con 19 GB de pesos, un equipo de 16 GB no es viable.
- GPU dedicadas: el formato es MLX, por lo que no se ejecuta en A100, H100 ni RTX 4090 sin conversion previa a otro runtime. No hay pesos GGUF ni safetensors estandar en este repositorio.
- Hardware objetivo: Apple Silicon (tag `apple-silicon`). No se especifican chips minimos (M1/M2/M3/M4) ni configuraciones de memoria recomendadas.
- Despliegue: `mlx_lm` para uso programatico y `optiq serve` para endpoint compatible con OpenAI y Anthropic. Requiere `mlx-optiq>=0.4.27` y un `import optiq` previo a la carga para registrar la arquitectura y el sidecar MTP.
- vLLM, llama.cpp, Ollama y TGI: no soportados por este repositorio, al no distribuirse pesos en los formatos que consumen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-OptiQ-4bit (este) | 26,9 B | no disponible | 4/8 bits mixta OptiQ | Apache 2.0 | MLX / OptiQ |
| mlx-community/Qwen3.8-27B-OptiQ-4bit | 27 B (familia) | no disponible | 4/8 bits mixta OptiQ | no disponible en la informacion | MLX / OptiQ |
| orcarouter/Qwen3.8-27B-Uncensored | 27 B (familia) | no disponible | pesos completos | Apache 2.0 | generico (MLX, PyTorch) |

La comparacion con alternativas de otros ecosistemas (por ejemplo, cuants GGUF de la misma familia para llama.cpp) no esta disponible en la informacion proporcionada. La diferencia principal frente al cuant OptiQ estandar es el ajuste Uncensored del modelo base; frente al modelo sin cuantizar, la perdida de precision por capa y el ahorro de espacio (19 GB frente a los ~54 GB en bf16 que implicarian 26,9 B parametros).

## Limitaciones y advertencias

- La variante Uncensored reduce deliberadamente los rechazos: puede generar contenido que el modelo original bloquearia. Requiere politicas de moderacion propias si se expone a usuarios finales.
- Riesgo de alucinacion no cuantificado: no hay benchmarks publicados que permitan estimar la tasa de error, y la cuantizacion 4/8 bits puede degradar el razonamiento respecto al modelo completo.
- Idiomas: los metadatos solo declaran ingles. El rendimiento en castellano no esta verificado ni documentado.
- Contexto: el tag indica `long-context` pero no se publica la longitud exacta, lo que impide dimensionar la cache KV y planificar despliegues con precision.
- Dependencia de ecosistema: requiere MLX y `mlx-optiq>=0.4.27`; no hay pesos GGUF ni compatibilidad con vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Trampa de integracion del MTP: al cargar `optiq/mtp.safetensors` fuera de `optiq serve` hay que sumar 1.0 a las siete RMSNorm del cabezal, o la decodificacion especulativa producira resultados incorrectos.
- La etiqueta "4bit" designa la familia de cuantizacion, no una media ponderada: hay 261 componentes a 8 bits, de modo que el modelo no es estrictamente 4 bits.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base es una modificacion de un modelo Qwen y conviene verificar las condiciones heredadas de la familia original antes de distribuirlo.
- Sin garantias de soporte: es un repositorio de comunidad, no una release oficial del desarrollador del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Qwen3.8-27B-Uncensored-OptiQ-4bit
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Cuant de referencia con la misma receta: https://huggingface.co/mlx-community/Qwen3.8-27B-OptiQ-4bit
- Web del proyecto OptiQ: https://mlx-optiq.com/
- Catalogo de cuants OptiQ: https://mlx-optiq.com/models
- Documentacion de OptiQ: https://mlx-optiq.com/docs/
