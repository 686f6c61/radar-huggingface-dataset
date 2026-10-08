# ModhiSathvik/modelv8

## Resumen

modelv8 (version v8.3) es un modelo de lenguaje de 71.273.629 parametros desarrollado por el usuario ModhiSathvik dentro del proyecto speed-check-ai-traning, en la rama `paper-faithful-hrm`. Se trata de un modelo base (base model): se entreno unicamente para continuar texto web, sin ajuste por instrucciones ni formato de chat. Su tamano reducido y su entrenamiento reproducible (91,4 minutos en una unica RTX 5090) lo situan como una pieza de investigacion mas que como un sistema listo para produccion.

La arquitectura es un transformer decoder-only de 6 bloques con anchura 768, 12 cabezas de atencion, MLP de 3072 y vocabulario BPE de 16.384 tokens. Incorpora varias innovaciones: atencion FoX (forgetting attention) sin codificacion posicional, ventanas de contexto mixtas (64 tokens en los bloques 1, 2, 4 y 5, y contexto completo en los bloques 3 y 6), capas Canon (convolucion causal de 4 tokens), QK-norm, MLP con activacion ReLU al cuadrado, residual de valor, saltos tipo U-net y logits con soft-cap.

El modelo se entreno sobre una muestra de FineWeb-Edu (sample-10BT) durante una sola pasada de 1.420 millones de tokens, a razon de aproximadamente 20 tokens por parametro. Los resultados en datos retenidos son una perdida de 3,204, una precision por token del 40,5% y un 77,8% en BLiMP. El propio autor advierte de que el modelo no es apto para uso real: solo mantiene coherencia durante unas pocas frases y falla en hechos especificos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; 6 bloques, anchura 768, 12 cabezas de atencion, MLP 3072; atencion FoX sin codificacion posicional, ventanas mixtas (64 tokens en bloques 1, 2, 4 y 5; contexto completo en bloques 3 y 6), capas Canon (convolucion causal de 4 tokens), QK-norm, ReLU al cuadrado, value residual, saltos U-net, soft-capped logits |
| Parametros totales | 71.273.629 (46.107.805 fuera de la capa de embedding y de la capa de salida) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (longitud de los fragmentos de entrenamiento); atencion efectiva mixta por bloque |
| Tipos de cuantizacion | No disponible (pesos distribuidos en bf16 safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | No disponible (entrenado sobre FineWeb-Edu, corpus predominantemente en ingles) |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria pytorch); requiere codigo del proyecto `src/hrm_text` para cargarse |

## Arquitectura y entrenamiento

modelv8 es un transformer decoder-only con una disposicion hibrida de atencion. La atencion FoX (forgetting attention) prescinde de codificacion posicional explicita. Los bloques 1, 2, 4 y 5 operan con una ventana local de 64 tokens, mientras que los bloques 3 y 6 atienden al texto completo, combinando asi procesamiento local barato con dos capas de alcance global. Las capas Canon aplican una convolucion causal de 4 tokens, y el modelo incorpora tecnicas adicionales como QK-norm, activacion ReLU al cuadrado en el MLP, value residual, conexiones de salto tipo U-net entre bloques y un soft-cap sobre los logits de salida. El vocabulario es BPE de 16.384 tokens.

El entrenamiento uso la muestra sample-10BT de FineWeb-Edu en una sola pasada de 1.420 millones de tokens (aproximadamente 20 tokens por parametro), con fragmentos de 1.024 tokens. Se empleo el optimizador Muon para las matrices ocultas combinado con Adam-atan2, una tasa de aprendizaje de 0,0024 mantenida y luego decaida linealmente hasta 0 durante el ultimo 50% de los pasos, sin EMA y en precision bf16. Todo el entrenamiento se completo en 91,4 minutos sobre una unica GPU RTX 5090. No se reporta RLHF, DPO ni ningun tipo de ajuste por preferencias.

## Capacidades

- Generacion de texto por continuacion: produce texto fluido y gramatical durante unas pocas frases.
- Modelo base sin ajuste: no soporta instrucciones, formato de chat ni system prompts.
- Gramatica: obtiene un 77,8% en BLiMP (conjunto filtrado BabyLM 2026).
- Conocimiento factivo limitado: algunos hechos comunes pueden ser correctos (por ejemplo, la definicion de fotosintesis), pero los hechos especificos suelen ser erroneos.
- Codigo: capacidad practicamente nula, segun el propio autor.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no documentadas; el corpus de entrenamiento es principalmente en ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre atencion hibrida: el modelo sirve como implementacion de referencia para estudiar el efecto de ventanas locales (64 tokens) combinadas con capas de atencion global y capas Canon, permitiendo ablaciones sobre una arquitectura poco convencional.
- Estudio de tecnicas de optimizacion: al usar Muon y Adam-atan2 con un presupuesto de una sola GPU, es un banco de pruebas reproducible para comparar estrategias de optimizacion en modelos pequenos.
- Experimentacion educativa en entrenamiento de LLM: el ciclo completo (1.420 millones de tokens en 91,4 minutos en una RTX 5090) resulta adecuado para docencia y practicas de entrenamiento de extremo a extremo.
- Evaluacion gramatical: con un 77,8% en BLiMP, permite reproducir y comparar metricas de competencia gramatical en modelos del orden de decenas de millones de parametros.
- Prueba de pipelines de tokenizacion: su vocabulario BPE de 16.384 tokens es util para validar flujos de tokenizacion y preprocesado de bajo coste.
- Baseline en investigacion de eficiencia: sirve como referencia de partida (held-out loss 3,204, token accuracy 40,5%) para comparar variantes arquitectonicas dentro del mismo proyecto.
- Demostraciones de continuacion de texto breve: para generar unos pocos parrafos de texto divulgativo o de relleno donde la exactitud factica no sea critica.
- Validacion de carga de safetensors con codigo propio: util para depurar integraciones de `ModelConfig` / `build_model` en entornos de investigacion.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Held-out loss (FineWeb-Edu, pesos vivos) | 3,204 |
| Precision por token | 40,5% |
| BLiMP (gramatica, BabyLM 2026 filtrado) | 77,8% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar, ni comparaciones directas con modelos similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 143 MB con pesos en bf16 (71.273.629 parametros x 2 bytes); en torno a 285 MB en fp32. Con activaciones y overhead, cabe holgadamente por debajo de 1 GB.
- Cabe en cualquier GPU de consumo actual: practicamente cualquier tarjeta con 1-2 GB de VRAM o mas (serie RTX, GTX, integradas modernas) es suficiente. Tambien es viable la inferencia en CPU.
- GPU recomendadas: no se especifican; el autor entreno el modelo en una unica RTX 5090. Para inferencia, cualquier GPU moderna sirve por el reducido tamano.
- Opciones de despliegue: no disponibles de forma estandar. El modelo requiere el codigo del proyecto (`src/hrm_text`, funciones `ModelConfig` y `build_model`) y no se distribuye en formato GGUF, por lo que vLLM, TGI, Ollama o llama.cpp no lo soportan sin trabajo adicional.
- Latencia y throughput: no disponibles. El unico dato temporal publicado es de entrenamiento (91,4 minutos para 1.420 millones de tokens en una RTX 5090), no de inferencia.
- Tamano del repositorio: 0,3 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ModhiSathvik/modelv8 | 71,3 M | 1.024 tokens | No disponible | HuggingFace, requiere codigo del proyecto |
| Pythia-70M | 70 M | 2.048 tokens | Apache 2.0 | HuggingFace, compatible con transformers |
| GPT-2 small | 124 M | 1.024 tokens | MIT | HuggingFace, compatible con transformers |

La comparacion de rendimiento no es posible con los datos disponibles, ya que modelv8 solo reporta held-out loss, precision por token y BLiMP, sin coincidir en benchmarks con estas alternativas. A nivel estructural, modelv8 destaca por su arquitectura no convencional (atencion FoX con ventanas mixtas) y por su coste de entrenamiento muy bajo, mientras que las alternativas ofrecen licencias claras y soporte directo en el ecosistema transformers.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni chat: no sigue ordenes ni mantiene conversaciones.
- Riesgo alto de alucinacion: los hechos especificos suelen ser incorrectos aunque el texto resulte fluido; algunos hechos comunes pueden acertarse por casualidad.
- Perdida de coherencia en textos largos: el modelo pierde el hilo mas alla de unas pocas frases.
- Bucles bajo decodificacion greedy: se recomienda decodificacion con muestreo (temperatura 0,4-0,7 y top-k 20-50), segun el autor.
- Capacidad de codigo practicamente nula.
- Contexto limitado a 1.024 tokens.
- Idiomas soportados no documentados; el entrenamiento se realizo sobre un corpus predominantemente en ingles, por lo que el rendimiento en castellano es incierto.
- Licencia no disponible: se desconoce si se permite el uso comercial, lo que supone un riesgo legal para cualquier despliegue en produccion.
- El propio autor indica que el modelo "no es para ningun uso real".
- La carga requiere codigo externo del proyecto (`src/hrm_text`), lo que complica su integracion en herramientas estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ModhiSathvik/modelv8
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Repositorio del proyecto speed-check-ai-traning (rama `paper-faithful-hrm`): no disponible como enlace publico en la informacion proporcionada
- Paper o publicacion tecnica asociada: no disponible
- Demos o espacios: no disponibles
