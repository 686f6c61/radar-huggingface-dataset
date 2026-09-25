# MARS-Retokenization/olmo2-7b-instruct-inv-mse-lastpos-all

## Resumen

`olmo2-7b-instruct-inv-mse-lastpos-all` es un checkpoint de investigación publicado por el grupo MARS-Retokenization, derivado mediante ajuste fino de `allenai/OLMo-2-1124-7B-Instruct`. No es un modelo orientado a producto ni a uso general: es un artefacto experimental creado para estudiar la invariancia de tokenización (lo que el autor denomina *reader invariance*) y su efecto sobre la robustez frente a re-tokenización adversarial. El problema que aborda es concreto: los ataques de tokenización adversarial (Geh et al., arXiv:2503.02174) manipulan la forma en que un prompt se segmenta en tokens para eludir los mecanismos de rechazo del modelo, sin alterar el significado del texto.

El modelo conserva la arquitectura y el tamaño del OLMo 2 7B Instruct original: 7.298.617.344 parámetros, pesos en safetensors y un repositorio de 14,6 GB, lo que corresponde a un almacenamiento en precisión de 16 bits. La intervención consiste en un ajuste fino con un objetivo poco habitual —error cuadrático medio (MSE) sobre el *residual stream* relativo al modelo de referencia congelado, evaluado únicamente en la última posición del prompt y promediado sobre las 32 capas del transformer— en lugar de un objetivo de *cross-entropy* sobre la continuación generada. El resultado medido es una reducción drástica de la tasa de éxito del ataque de tokenización adversarial, de 0,565 (referencia zero-shot) a 0,025 en decodificación greedy.

Su relevancia es fundamentalmente metodológica: demuestra que es posible endurecer la resistencia a un ataque de re-tokenización con un coste de entrenamiento muy bajo (7,3 GPU-horas en 2×A100) y sin degradar de forma apreciable el comportamiento en prompts seguros. Ahora bien, el propio autor advierte que los números de seguridad corresponden exclusivamente al ataque estudiado y no implican robustez frente a otros jailbreaks, y que se trata de un único *seed* sin afirmaciones de significación estadística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 2), 32 capas |
| Parametros totales | 7.298.617.344 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de OLMo-2-1124-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors a 16 bits, ~14,6 GB) |
| Idiomas soportados | no disponible (evaluado unicamente en ingles: AdvBench, XSTest y Alpaca) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | allenai/OLMo-2-1124-7B-Instruct |
| Modo de entrenamiento | prefix |
| Objetivo | mse_lastpos |
| Direccion KL | forward |
| Ponderacion CE | uniform |
| Mezcla de prompts daninos | mixed, fraccion 0,286 |
| Numero de codificaciones | 8 |
| Cuantil CVaR | 0,25 |
| Pasos maximos | 700 |
| Learning rate | 1e-05 |
| Acumulacion de gradiente | 8 |
| Seed | 42 |
| Max new tokens | 128 |
| Prefix tokens | 8 |
| Stochastok p | 0,3 |
| Coste de entrenamiento | 7,3 GPU-horas en 2×A100 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del OLMo 2 7B Instruct de AI2: un transformer decoder-only con 32 capas, pesos abiertos y entrenamiento sobre hasta 5T tokens segun la documentacion publica de la familia OLMo 2. Este checkpoint no modifica la topologia; solo ajusta los pesos. El autor publica una tabla de deriva de parametros respecto al modelo base que actua como garantia de que el entrenamiento efectivamente ocurrio: la norma L2 relativa es de 0,01087 en atencion, 0,01063 en las capas MLP, 0,00160 en las normalizaciones, 0,00057 en `embed_tokens` y exactamente 0,00000 en `lm_head`. Es decir, la cabeza de salida queda intacta y el ajuste se concentra en atencion y MLP.

La innovacion tecnica reside en el objetivo de entrenamiento. En lugar de optimizar la probabilidad de una continuacion, el modelo minimiza el MSE del *residual stream* respecto a una referencia congelada (el propio OLMo 2 7B Instruct), medido exclusivamente en la ultima posicion del prompt y promediado sobre las 32 capas del transformer. No se genera ninguna continuacion y no se aplica *teacher forcing*: la funcion de perdida ve una sola posicion por codificacion. Se muestrean 8 codificaciones distintas del mismo prompt mediante MDD, y se aplica una agregacion CVaR con cuantil 0,25 —es decir, el entrenamiento se centra en el 25% peor de las codificaciones— con el anclaje canonico como referencia. Los hiperparametros de datos incluyen una mezcla de prompts daninos del 28,6% y un parametro `stochastok_p` de 0,3.

## Capacidades

- Generacion de texto instructiva: hereda las capacidades conversacionales del OLMo 2 7B Instruct sobre el que se ajusta.
- Resistencia a tokenizacion adversarial: el objetivo central del checkpoint. Reduce la tasa de exito del ataque AdvTok a 0,025 en greedy y 0,058 con temperatura 1, frente a 0,565 y 0,584 de la referencia zero-shot.
- Rechazo canonico: mantiene una tasa de rechazo de 0,905 en decodificacion greedy sin ataque, con una tasa de exito del ataque en ausencia de manipulacion de 0,02.
- Calibracion de sobre-rechazo: 0,079 de sobre-rechazo en prompts seguros de XSTest y 0,03 en Alpaca, lo que indica un coste de utilidad contenido.
- Instruccion de seguimiento general: medida mediante Alpaca, con un token F1 de 0,428 y una NLL por token de 1,274.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la evaluacion se limita al ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Investigacion en seguridad de tokenizacion: el checkpoint sirve como punto de comparacion experimental frente a sus hermanos (`olmo2-7b-instruct-inv-mse-ref-multi`, `olmo2-7b-instruct-inv-reference-mixed-ce-exposure`) para aislar el efecto del objetivo MSE en la ultima posicion sobre la robustez a re-tokenizacion.
- Ablacion de objetivos de entrenamiento: al compartir modelo base, seed (42) y buena parte de la configuracion, permite comparar directamente `mse_lastpos` frente a otras variantes manteniendo constante el resto de variables.
- Reproduccion de resultados de robustez: con un coste de 7,3 GPU-horas en 2×A100, el pipeline es replicable en un entorno academico modesto, lo que facilita la verificacion independiente del articulo de referencia.
- Estudio de la calibracion rechazo/sobre-rechazo: las metricas pareadas de XSTest (0,875 de rechazo en no seguro frente a 0,079 de sobre-rechazo en seguro) y Alpaca (0,03) permiten analizar el equilibrio entre seguridad y utilidad, una de las metricas mas dificiles de obtener en modelos alineados.
- Analisis de deriva de parametros: la tabla de normas L2 relativas por grupo (attn, mlp, norm, embed_tokens, lm_head) es util como caso de estudio de como se distribuye el cambio de pesos segun el objetivo de perdida empleado.
- Docencia y formacion en seguridad de LLM: como artefacto que ilustra de forma cuantificada un ataque concreto (tokenizacion adversarial) y su mitigacion parcial, es adecuado para materiales didacticos o talleres sobre robustez.
- Generacion de texto instructivo en ingles: dado que el ajuste preserva el token F1 de Alpaca en 0,428, puede emplearse como modelo de instrucciones en ingles para tareas generales, aunque no es su proposito declarado y carece de evaluaciones de calidad adicionales.

## Benchmarks y rendimiento

Los unicos datos publicados proceden de la model card del autor y corresponden a un holdout de 200 prompts de AdvBench excluido del entrenamiento por construccion. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica | Valor |
|---|---|
| AdvTok ASR (greedy, holdout AdvBench 200 prompts) | 0,025 |
| AdvTok ASR (temperatura 1) | 0,058 |
| ASR canonico (greedy, sin ataque) | 0,02 |
| Rechazo canonico (greedy) | 0,905 |
| XSTest sobre-rechazo (prompts seguros) | 0,079 |
| XSTest rechazo (prompts no seguros) | 0,875 |
| Alpaca sobre-rechazo | 0,03 |
| Alpaca token F1 | 0,428 |
| Alpaca NLL/token | 1,274 |
| Referencia zero-shot, AdvTok ASR greedy | 0,565 |
| Referencia zero-shot, AdvTok ASR temperatura 1 | 0,584 |
| Margen canonico | 24,80 (frente a 17,15 zero-shot) |

El autor anade una advertencia explicita sobre la ultima fila: en las variantes hermanas con objetivo MSE, el aumento del margen canonico se atribuyo a un colapso de la log-probabilidad de cumplimiento (compliance) y no a un incremento real del rechazo. Esa descomposicion no se ha ejecutado para este checkpoint, por lo que el valor de 24,80 no debe interpretarse como una mejora de seguridad demostrada.

## Requisitos de hardware

- El repositorio ocupa 14,6 GB en safetensors, consistente con 7,298 mil millones de parametros almacenados a 16 bits.
- VRAM estimada para inferencia en bf16/fp16: aproximadamente 15-16 GB de pesos, mas overhead de activaciones y cache KV (no cuantificado en la informacion disponible).
- VRAM estimada en cuantizacion de 8 bits: en torno a 8 GB de pesos; en 4 bits, en torno a 5 GB. Estas cifras son estimaciones derivadas del numero de parametros, no datos publicados por el autor.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas para bf16 (RTX 4090, RTX 4080 en configuraciones ajustadas) y con holgura en 8 o 4 bits para GPUs de 8-12 GB.
- GPU de datacenter recomendadas: A100 de 40 u 80 GB, H100, L40S. El entrenamiento original se ejecuto en 2×A100.
- Opciones de despliegue: al ser un checkpoint compatible con la familia OLMo 2 en formato safetensors, es desplegable con frameworks estandar de Hugging Face (Transformers, TGI), y previsiblemente con vLLM; la existencia de una build de Ollama para `olmo2:7b` sugiere que la conversion a GGUF es viable, aunque no se ha publicado una version GGUF especifica de este checkpoint.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Nota de idoneidad: se trata de un artefacto de investigacion, no de un modelo listo para produccion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento general de otros modelos en la informacion proporcionada. La comparacion se limita a las variantes dentro de la propia familia de checkpoints experimentales y al modelo base.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| olmo2-7b-instruct-inv-mse-lastpos-all (este) | 7,298 B | no disponible | apache-2.0 | Objetivo `mse_lastpos`; AdvTok ASR greedy 0,025 |
| allenai/OLMo-2-1124-7B-Instruct (base) | 7 B aprox. | no disponible | apache-2.0 | Referencia zero-shot; AdvTok ASR greedy 0,565 |
| MARS-Retokenization/olmo2-7b-instruct-inv-mse-ref-multi | no disponible | no disponible | apache-2.0 | Variante hermana con otro esquema de referencia; sin metricas publicadas en la informacion disponible |
| MARS-Retokenization/olmo2-7b-instruct-inv-reference-mixed-ce-exposure | no disponible | no disponible | apache-2.0 | Variante hermana orientada a exposicion con CE; sin metricas publicadas en la informacion disponible |
| Llama 3.1 8B | 8 B | no disponible | licencia comunitaria de Meta (no apache-2.0) | Citado en la documentacion publica de OLMo 2 como referencia competitiva en benchmarks academicos en ingles; no evaluado en este estudio |

## Limitaciones y advertencias

- Un unico seed (42). El autor declara explicitamente que no puede afirmar significacion estadistica entre seeds.
- Evaluacion restringida al ingles (AdvBench, XSTest y Alpaca). No hay evidencia de comportamiento en otros idiomas.
- Los numeros de seguridad corresponden exclusivamente al ataque de tokenizacion adversarial estudiado. No implican robustez frente a otros jailbreaks, ataques de inyeccion de prompt o manipulacion semantica.
- La inflacion del margen canonico (24,80 frente a 17,15) no esta descompuesta. En modelos hermanos ese efecto se debio al colapso de la log-probabilidad de cumplimiento, no a un aumento del rechazo, por lo que no debe presentarse como una mejora de seguridad.
- Riesgo de alucinacion: no cuantificado ni evaluado en la informacion disponible; se hereda el comportamiento del modelo base, sin mediciones adicionales.
- Capacidad instructiva limitada: el token F1 de Alpaca es 0,428 y la NLL por token 1,274, valores que sugieren una calidad de generacion moderada. El ajuste con objetivo MSE no esta disenado para preservar ni mejorar la calidad de las respuestas.
- Es un artefacto de investigacion, no un producto. El propio autor lo etiqueta como tal.
- Uso comercial: la licencia apache-2.0 lo permite tecnicamente, pero no se recomienda su despliegue en produccion dado que no se han evaluado capacidades generales, sesgos, toxicidad ni comportamiento fuera del ataque concreto estudiado.
- Sesgos conocidos: no disponibles; no se ha realizado ninguna evaluacion de sesgo.
- Fecha de creacion del repositorio registrada como 2026-09-25, posterior a la fecha de publicacion del articulo de referencia, dato que conviene verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MARS-Retokenization/olmo2-7b-instruct-inv-mse-lastpos-all
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct
- Variante hermana (mse-ref-multi): https://huggingface.co/MARS-Retokenization/olmo2-7b-instruct-inv-mse-ref-multi
- Variante hermana (reference-mixed-ce-exposure): https://huggingface.co/MARS-Retokenization/olmo2-7b-instruct-inv-reference-mixed-ce-exposure
- Articulo de referencia sobre tokenizacion adversarial: arXiv:2503.02174
- Repositorio de codigo de OLMo (AI2): https://github.com/allenai/OLMo
- Ficha de OLMo 2 7B Instruct en LLM Radar: https://open-llm-radar.com/models/olmo2-7b-instruct
- Build de OLMo 2 en Ollama: https://ollama.com/library/olmo2:7b
