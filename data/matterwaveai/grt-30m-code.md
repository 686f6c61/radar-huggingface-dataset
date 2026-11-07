# MatterWaveAI/grt-30m-code

## Resumen
GRT-30M-Code es un modelo de lenguaje de 29,8 millones de parámetros desarrollado por MatterWaveAI, afinado a partir del modelo base GRT-30M. Está especializado en dos tareas concretas: la síntesis de código Python algorítmico con anotaciones de tipo y la emisión de invocaciones de herramientas en formato JSON estructurado mediante etiquetas `<tool_call>`. Su particularidad arquitectónica es que elimina por completo las capas `nn.Linear` y `nn.Conv1d`, sustituyéndolas por un mecanismo de transformador rotacional basado en rotaciones de Givens y álgebra de Clifford.

El modelo se apoya en una arquitectura denominada Givens Rotational Transformer (GRT) de 12 capas, en la que las transformaciones se realizan mediante rotaciones geométricas en lugar de proyecciones lineales convencionales. Esta aproximación, junto con optimizadores geométricos específicos como HuygensAdam, permite alcanzar tasas de validez sintáctica del código Python del 91,67% y una coincidencia de esquema JSON en tool calling del 83,33%, partiendo de un modelo base que no generaba código sintácticamente válido.

Su relevancia actual es principalmente experimental: demuestra que arquitecturas alternativas a la atención estándar pueden especializarse en tareas estructuradas con un presupuesto de parámetros extremadamente reducido. No obstante, su ventana de contexto limitada (2K tokens según fuentes externas) y su tamaño lo sitúan en el terreno de la prueba de concepto más que en el de la producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Givens Rotational Transformer (GRT), 12 capas, sin capas `nn.Linear` ni `nn.Conv1d` |
| Parametros totales | 29.844.597 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2K tokens (según LLM Explorer; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento
El modelo se construye sobre `GRTForCausalLM`, un backbone de 12 capas denominado Givens Rotational Transformer. La innovación central es la sustitución de las proyecciones lineales por rotaciones de Givens, lo que introduce una parametrización geométrica de las transformaciones internas inspirada en el álgebra de Clifford. El modelo base cuenta con 29.305.498 parámetros y ninguna capa `nn.Linear` ni `nn.Conv1d`.

El afinamiento se realizó mediante SFT sobre las capas `blocks[11:12]`, `final_norm` y una calibración de fase polar del token `<|im_end|>`, con 811.907 parámetros entrenables, `batch_size = 16`, `lr = 6.5e-3`, `max_angular_step = 0.12` y `seed = 42`, durante 200 pasos. La model card documenta un ablation de ocho optimizadores geométricos (HuygensAdam, PairAdam, GyricAdam, CyclideAdam, HuygensSymplecticAdam, HessianPairAdam, PolarNaturalAdam y SymplecticAdam), de los cuales HuygensAdam obtuvo los mejores resultados globales. No se especifica en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset, ni si hubo RLHF o DPO.

## Capacidades
- Generación de código Python algorítmico con anotaciones de tipo, cubriendo búsqueda, programación dinámica sobre grafos y arrays, teoría de números, parsing de cadenas y álgebra lineal.
- Producción de código Python sintácticamente válido según `ast.parse` en el 91,67% de los casos de validación.
- Emisión de invocaciones de herramientas en JSON estructurado con el formato `{"name": ..., "arguments": {...}}` condicionadas por instrucciones del desarrollador.
- Coincidencia de esquema JSON en tool calling del 83,33% en el conjunto de validación.
- Condicionamiento por firma de función y docstring, con un margen de verosimilitud de 1,6597 nats/token (PairAdam) y 1,5766 nats/token (SymplecticAdam).
- Soporte de tool calling y function calling como capacidades declaradas en las etiquetas del modelo.
- No se declaran capacidades multilingües, de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso
- Generación de utilidades Python en entornos de prototipado: el modelo puede producir funciones con firma y tipos a partir de una instrucción en lenguaje natural, lo que resulta adecuado para autocompletar snippets en cuadernos de experimentación donde el coste computacional es mínimo (29,8M parámetros).
- Evaluación de arquitecturas rotacionales en investigación: sirve como banco de pruebas para estudiar cómo los optimizadores geométricos afectan la generación de código estructurado, gracias a la ablation documentada de ocho optimizadores.
- Generación de invocaciones de herramientas en agentes ligeros: puede emitir JSON de tool call conforme a un esquema, integrándose en pipelines de agentes con requisitos de memoria ínfimos.
- Pruebas de validez sintáctica en CI: al alcanzar un 91,67% de validez AST, puede emplearse como generador de casos de prueba de sintaxis Python en entornos de integración continua de bajo coste.
- Docencia y demostración de arquitecturas alternativas: útil para ilustrar en cursos o artículos cómo un modelo sin capas lineales puede especializarse en tareas estructuradas.
- Despliegue en dispositivos con restricciones extremas de memoria: con un tamaño de repo de 0,1 GB y pesos en safetensors, es viable en entornos edge o en contenedores con límites de RAM muy ajustados.

## Benchmarks y rendimiento
Los datos disponibles corresponden a métricas internas de validación del autor, no a benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K). Se presentan a continuación tal como figuran en la model card.

| Metrica | Modelo base (grt-30m) | GRT-30M-Code (HuygensAdam) | Mejor alternativa |
|---|---|---|---|
| Perplejidad de validación (código y tool-call) | 54,93 (val_loss 4,0061) | 1,7632 (val_loss 0,5672) | 1,8253 (PairAdam) |
| Precisión top-1 de tokens de código Python | 46,80% | 99,07% | 98,93% (CyclideAdam) |
| Validez sintáctica AST (`ast.parse`) | 0,00% | 91,67% | 83,33% (CyclideAdam) |
| Precisión top-1 de tokens de tool-call | 36,44% | 90,69% | 90,69% (PairAdam) |
| Coincidencia de esquema JSON | 0,00% | 83,33% | 75,00% (CyclideAdam, GyricAdam, HuygensSymplecticAdam) |
| Margen de condicionamiento ($\Delta\mathcal{L}$) | 0,8998 | 1,5152 | 1,6597 (PairAdam) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en fp32: aproximadamente 0,12 GB para los pesos (29,8M parámetros × 4 bytes), más overhead de activaciones y contexto, situándose en torno a 0,2-0,5 GB en función de la longitud de secuencia.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 e incluso en iGPU con memoria unificada. Para despliegues en servidor, A100 o H100 están sobradamente dimensionadas.
- Cabe en cualquier GPU consumer actual e incluso en dispositivos edge con más de 1 GB de memoria disponible.
- Opciones de despliegue: la model card documenta el uso con `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`, `dtype=torch.float32`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible. El tamaño del modelo sugiere latencias muy bajas en hardware consumer, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MatterWaveAI/grt-30m-code | 29,8M | 2K (según LLM Explorer) | Código Python y tool calling JSON | Apache 2.0 | Hugging Face |
| MatterWaveAI/grt-30m (base) | 29,3M | no disponible | Generación de texto generalista | Apache 2.0 (presumible por el fine-tune) | Hugging Face |
| Modelos de código pequeños de la comunidad (p. ej. variantes TinyLlama/CodeT5-small) | 30M-100M | variable | Código generalista | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de terceros en la información proporcionada, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias
- El modelo base no generaba código sintácticamente válido (0,00% en AST), y tras el fine-tune la validez alcanza el 91,67%, lo que implica que aproximadamente 1 de cada 12 generaciones puede ser sintácticamente inválida.
- La coincidencia de esquema JSON en tool calling es del 83,33%, por lo que una parte no despreciable de las invocaciones puede no ajustarse al esquema esperado y requerirá validación posterior.
- La ventana de contexto de 2K tokens (según LLM Explorer, no confirmada en la model card) limita el uso en conversaciones multi-turno largas o en ficheros de código extensos.
- No se declaran idiomas soportados; la especialización en Python y en inglés técnico sugiere un rendimiento limitado fuera de ese ámbito.
- No se documentan sesgos conocidos ni evaluación de alucinación en la información disponible; al ser un modelo de 30M parámetros, la fiabilidad factual en dominios abiertos es previsiblemente baja.
- La licencia Apache 2.0 permite uso comercial, pero el modelo está diseñado para tareas muy acotadas y no debería emplearse como generador generalista en producción sin validación adicional.
- El modelo se ha afinado únicamente sobre las capas `blocks[11:12]`, `final_norm` y la fase polar de `<|im_end|>` (811.907 parámetros entrenables), lo que limita la profundidad de la adaptación.
- No se han publicado mediciones de latencia, throughput ni resultados en benchmarks estándar, lo que dificulta la comparación objetiva con alternativas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-code
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- Ficha en LLM Explorer: https://llm-explorer.com/model/MatterWaveAI%2Fgrt-30m,4RmDa6OqNm590JQkVYChgn
