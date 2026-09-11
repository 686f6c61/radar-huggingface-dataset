# Montalte/qwen4b-code-nothink-random

## Resumen

Montalte/qwen4b-code-nothink-random es un artefacto de fusión (merge) construido sobre Qwen/Qwen3-4B-Base, publicado por el usuario Montalte el 11 de septiembre de 2026. No se trata de un modelo entrenado desde cero ni de un ajuste supervisado convencional, sino del resultado de aplicar una máscara binaria aleatoria sobre el vector de tarea procedente de un especialista en código (`modrill/code-nothink-q4b-20260908`), con una fracción de retención de 0,1 y semilla fija 42. El objetivo declarado es servir como pieza experimental para estudiar transferencia direccional entre matemáticas y código.

El modelo conserva la arquitectura completa de Qwen3-4B-Base, un transformer decoder denso de 4.022.468.096 parámetros, con licencia Apache 2.0 y pesos en safetensors. La única modificación respecto al modelo base es la inyección parcial del vector de tarea, aplicada sobre el "stitch body" sin tocar las capas de embedding ni la cabeza de lenguaje (skip embed / lm_head), tal y como especifica la model card del autor.

Su relevancia es estrictamente investigadora: permite reproducir y comparar metodologías de merging (máscara aleatoria frente a máscara aprendida) en condiciones controladas. No hay evidencia publicada de evaluaciones, benchmarks ni validación de calidad, y el repositorio acumula 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que debe tratarse como material de laboratorio, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Qwen3); detalles completos no documentados en la model card del autor, heredados de Qwen3-4B-Base |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no documentada en esta ficha del autor; el modelo base Qwen3-4B-Base emplea 32.768 tokens nativos, extensibles a 131.072 con YaRN |
| Tipos de cuantizacion | no disponibles en el repositorio (solo pesos en safetensors); admite cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | no disponible (no declarado en la model card ni en las etiquetas del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tipo de artefacto | merge de pesos (task vector enmascarado), no entrenamiento nuevo |
| Modelo base | Qwen/Qwen3-4B-Base (commit 906bfd4b4dc7f14ee4320094d8b41684abff8539) |
| Especialista de origen | modrill/code-nothink-q4b-20260908 |
| Dominio | codigo |
| Modo | nothink (sin bloque de razonamiento explicito) |
| Metodo de merge | random: mascara binaria aleatoria de k exacto sobre el vector de tarea, fraccion retenida 0,1, semilla 42 |
| Tamano del repositorio | 8,1 GB |
| Fecha de publicacion | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Base, un transformer decoder denso con atencion por consultas agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings de posicion rotatorios (RoPE). No se ha realizado ningun entrenamiento adicional ni proceso de alineacion (RLHF, DPO o similares) sobre este artefacto. El autor indica explicitamente que se trata de un "merge artifact for directional math↔code transfer experiments", es decir, un producto de aritmetica de pesos orientado a estudiar como se transfiere capacidad entre los dominios de matematicas y codigo.

El procedimiento concreto consiste en calcular el vector de tarea del especialista en codigo (diferencia entre los pesos del especialista y los del modelo base), aplicar una mascara binaria aleatoria de k exacto que conserva el 10 % de las coordenadas (fraccion 0,1, semilla 42) y sumar el vector enmascarado al modelo base. El "stitch body" es el mismo que el del plan denominado Plan B, que omite las capas de embedding y la cabeza de lenguaje durante la fusion. No se documentan el numero de tokens de entrenamiento del especialista, la composicion de su dataset ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva basica, heredada de Qwen3-4B-Base: el modelo es funcionalmente un modelo de lenguaje de tipo base, no un asistente alineado.
- Generacion de codigo: es la capacidad que el merge pretende inyectar total o parcialmente mediante el vector de tarea del especialista `code-nothink-q4b-20260908`. No hay evaluacion publicada que cuantifique el grado de exito de esa transferencia.
- Modo "nothink": el artefacto esta etiquetado como sin bloque de razonamiento explicito, a diferencia de las variantes de Qwen3 con modo thinking.
- Conversacion: la etiqueta `conversational` aparece en el repositorio, pero no se aporta plantilla de chat ni ejemplos de uso verificados.
- Tool calling / function calling: no documentado. El modelo base Qwen3-4B-Base no incorpora post-entrenamiento especifico para llamadas a herramientas; esa capacidad corresponde a la variante post-entrenada Qwen3-4B.
- Comportamiento agentico y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingues: no disponibles. El autor no declara cobertura de idiomas.
- Vision, audio u otras modalidades: no soportadas (modelo exclusivamente de texto).
- Modo de pensamiento extendido (thinking): explicitamente ausente por diseno.

## Casos de uso

- Reproduccion de experimentos de merging: el artefacto permite replicar exactamente la configuracion descrita (mascara aleatoria, k retenido 0,1, semilla 42) y compararla contra variantes con mascara aprendida, aislando el efecto del criterio de seleccion de coordenadas.
- Ablacion metodologica en investigacion sobre aritmetica de pesos: sirve como condicion de control "aleatoria" frente a metodos informados por gradiente o por magnitud, dentro de estudios sobre task vectors.
- Estudio de transferencia direccional matematicas↔codigo: al provenir de un especialista en codigo y aplicar solo una fraccion del vector, es util para medir cuanto de la capacidad de codigo se conserva y cuanto de la capacidad matematica del base se degrada.
- Analisis de degradacion por merges agresivos: con una fraccion de retencion de solo el 10 % sobre coordenadas aleatorias, es un caso de estudio adecuado para cuantificar perdida de capacidad general y colapso de distribucion de salida.
- Inicializacion para ajuste posterior en dominio codigo: puede emplearse como punto de partida barato en experimentos de continued pretraining o LoRA sobre codigo, comparando su convergencia frente al base sin modificar.
- Generacion de codigo en entornos de investigacion offline: uso no productivo para explorar completados de codigo y estudiar cualitativamente el sesgo introducido por el vector de tarea parcial.
- Baseline en publicaciones sobre model merging: al estar publicado con licencia Apache 2.0 y pesos en safetensors, es citable y redistribuible como referencia reproducible en articulos tecnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye evaluaciones de MMLU, HumanEval, GSM8K, MBPP ni de ningun otro conjunto de referencia, ni comparaciones cuantitativas contra el modelo base. Tampoco se aportan metricas de perplejidad en los dominios de codigo o matematicas.

## Requisitos de hardware

- VRAM para pesos en BF16/FP16: aproximadamente 8,05 GB (4.022.468.096 parametros x 2 bytes) solo para los pesos.
- Cache KV: con la configuracion tipica de Qwen3-4B (36 capas, 8 cabezas KV, dimension de cabeza 128), la cache en BF16 ocupa del orden de 0,14 MB por token, lo que supone unos 4,5 GB adicionales para una ventana completa de 32.768 tokens.
- VRAM para INT8: aproximadamente 4,0 GB de pesos, mas la cache KV (reducible a la mitad con cache en FP8).
- VRAM para cuantizacion de 4 bits: aproximadamente 2,5 GB de pesos, dependiendo del esquema (Q4_K_M, AWQ, GPTQ).
- GPU recomendadas: NVIDIA A100 40/80 GB y H100 para despliegue a gran escala; RTX 4090 (24 GB) para FP16 con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para FP16 con contexto moderado; RTX 3060 12 GB y RTX 4060 Ti 16 GB para cuantizaciones de 4-8 bits.
- Viabilidad en GPU de consumo: si. En 8 bits cabe holgadamente en cualquier GPU con 8 GB o mas. En FP16 requiere al menos 12-16 GB para contexto largo, o bien descarga parcial de capas a CPU.
- Memoria unificada: es viable en equipos Apple Silicon con 16 GB o mas de memoria unificada usando llama.cpp u Ollama, previa conversion a GGUF.
- Opciones de despliegue: transformers (libreria declarada), vLLM, Hugging Face Text Generation Inference (el repositorio esta etiquetado como `endpoints_compatible`), llama.cpp y Ollama. Para estas dos ultimas es necesaria una conversion manual a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni de tiempo hasta el primer token en ninguna configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Montalte/qwen4b-code-nothink-random | 4,02 B | no documentado (32.768 en el base) | Apache 2.0 | Artefacto de merge, sin evaluacion publicada |
| Qwen/Qwen3-4B-Base | 4,02 B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | Modelo base oficial, ampliamente evaluado en la documentacion de Qwen3 |
| Qwen/Qwen3-4B | 4,02 B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | Variante post-entrenada, con modos thinking y non-thinking y soporte de herramientas |
| Llama 3.1 8B | 8,03 B | 128.000 | Llama 3.1 Community License | Modelo denso de otro fabricante, el doble de parametros |
| Gemma 3 4B | ~4 B | 128.000 | Gemma Terms of Use | Alternativa densa de tamano comparable |

La comparacion de rendimiento no esta disponible: no existen resultados publicados para este merge que permitan situarlo frente a las alternativas de la tabla. La diferencia funcional mas relevante frente a Qwen3-4B es la ausencia de post-entrenamiento y de modo de razonamiento, y frente a Qwen3-4B-Base, la incorporacion parcial de un vector de tarea de codigo cuya contribucion neta no ha sido medida.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni analisis de perplejidad, ni pruebas cualitativas publicadas. No es posible afirmar que el merge mejore al modelo base en ninguna tarea.
- Seleccion de coordenadas aleatoria: la mascara uniforme aleatoria con fraccion 0,1 y semilla 42 no esta guiada por relevancia, magnitud ni gradiente, por lo que cabe esperar una perturbacion difusa y no verificada de los pesos.
- Riesgo elevado de degradacion de capacidades generales: aplicar un vector de tarea enmascarado sobre un modelo base sin post-entrenamiento puede producir salidas menos coherentes que el propio Qwen3-4B-Base, aunque no se aporta medicion alguna.
- Riesgo de alucinacion: al ser un modelo de tipo base sin alineacion, la generacion de hechos no verificados es esperable y ademas no esta caracterizada.
- Cobertura de idiomas desconocida: el autor no declara idiomas soportados, por lo que no hay garantia de comportamiento correcto en castellano ni en ningun otro idioma concreto.
- Longitud de contexto no confirmada para este artefacto: aunque el base soporta 32.768 tokens, el autor no documenta la configuracion efectiva de posiciones del merge.
- Sin soporte de herramientas ni modo de razonamiento: no debe emplearse en flujos agenticos ni en pipelines que dependan de function calling.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, incluida la obligacion de conservar avisos de licencia y atribucion. Al derivar de Qwen3-4B-Base, conviene revisar tambien las condiciones del modelo base original.
- Trazabilidad limitada: el especialista de origen (`modrill/code-nothink-q4b-20260908`) no esta enlazado con documentacion publica en la informacion disponible, lo que dificulta auditar el vector de tarea aplicado.
- Estado del repositorio: 0 descargas y 0 likes, sin senales de uso, validacion por terceros ni mantenimiento posterior a la fecha de subida.
- Uso en produccion: no recomendado bajo ninguna circunstancia sin una bateria de evaluacion propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Montalte/qwen4b-code-nothink-random
- Modelo base Qwen/Qwen3-4B-Base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Variante post-entrenada Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Especialista de origen citado en la model card: https://huggingface.co/modrill/code-nothink-q4b-20260908
- Nota sobre la busqueda web: los resultados proporcionados no contienen informacion relacionada con el modelo (corresponden a mapas de Rusia) y se han descartado por no ser relevantes. No se han localizado papers, blogs ni demos adicionales sobre este artefacto.
