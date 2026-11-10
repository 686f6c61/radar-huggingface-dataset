# MadGoatHaz/Qwen3.8-27B-Ultimate-Heretic-Uncensored-W4A16-UltraTuned

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored-W4A16-UltraTuned es una cuantizacion W4A16 (pesos INT4, activaciones de 16 bits) del modelo DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, publicada por el usuario MadGoatHaz. Se trata de una variante "uncensored" afinada por la comunidad sobre una base de la familia Qwen, orientada a generacion de texto conversacional sin los filtros de alineamiento tipicos de los modelos oficiales. El problema que aborda es doble: reducir el coste de despliegue mediante cuantizacion de 4 bits con AutoRound/AutoGPTQ Marlin, y preservar al maximo la calidad numerica del modelo original mediante una receta de calibracion no convencional.

La arquitectura subyacente es un hibrido lineal-atencion de 64 capas: 48 capas Gated DeltaNet (atencion lineal recurrente con complejidad de memoria O(1) respecto a la longitud de secuencia), 16 capas de atencion completa con Grouped-Query Attention y 1 capa auxiliar de Multi-Token Prediction (MTP) para decodificacion especulativa. Esta mezcla reduce el KV cache a una cuarta parte del de un modelo denso equivalente, lo que permite servir contextos muy largos con un coste de memoria contenido.

El interes actual del modelo reside en su combinacion de contexto extendido via YaRN (hasta 1.000.000 de tokens partiendo de una ventana nativa de 262.144), cuantizacion agresiva a 4 bits y preservacion de los tensores MTP en BF16 para mantener la decodificacion especulativa funcional. El repositorio ocupa 20,1 GB y declara 6.615.972.112 parametros reales en safetensors, un dato que conviene contrastar con la denominacion "27B" del nombre del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 48 capas Gated DeltaNet (atencion lineal) + 16 capas de atencion completa (GQA) + 1 capa MTP |
| Parametros totales | 6.615.972.112 (segun safetensors); el nombre del modelo indica "27B", discrepancia no aclarada en la model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; hasta 1.048.576 (1M) con YaRN factor 4.0 y Dual-Chunk Attention |
| Tipos de cuantizacion | W4A16 (INT4 grupo 128 en pesos, activaciones 16 bits); AutoRound / AutoGPTQ Marlin; capa 0 y `lm_head` en 16 bits; proyecciones de compuerta GDN sin cuantizar; KV cache estatico en FP8 |
| Idiomas soportados | Ingles (`en` declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con metadatos de escalas FP8 estaticas para KV cache) |

## Arquitectura y entrenamiento

La arquitectura es un hibrido de atencion lineal y atencion completa. Las 48 capas Gated DeltaNet actualizan matrices de estado interno de forma recurrente sin usar KV cache ni RoPE, lo que da complejidad de memoria O(1) respecto a la longitud de secuencia. Las 16 capas de atencion completa con GQA concentran el 100% del KV cache dinamico y capturan las interacciones de largo alcance. La capa MTP auxiliar predice tokens futuros en un solo paso de ejecucion y habilita la decodificacion especulativa nativa en vLLM. El vocabulario es de 152.064 tokens.

El proceso de cuantizacion es el elemento diferencial de esta ficha. Se calibro con 256 documentos continuos y no concatenados de al menos 4.096 tokens cada uno: 35% de contexto extendido (pg19-test), 35% de razonamiento profundo y cadena de pensamiento (Bespoke-Stratos-17k) y 30% de codigo de produccion (codeparrot-clean). La justificacion del autor es que concatenar documentos cortos corrompe las actualizaciones de estado recurrente de las capas GDN y sesga la aproximacion hessiana. Se aplico AutoRound SignRound con 500 iteraciones (frente a las 200 habituales), ajuste min-max de umbrales de recorte por grupo de 128 pesos, propagacion secuencial de activaciones cuantizadas entre capas y sin ajuste de sesgo en las normas. Los tensores MTP se restauraron a BF16 para evitar que la cuantizacion RTN degradara la tasa de aceptacion del borrador especulativo, que el autor situa en 80-86% en posicion 1. Tambien se precalibraron 32 factores de escala estaticos (k_scale y v_scale) empaquetados en los metadatos para las 16 capas GQA.

No se especifica en la informacion disponible el numero de tokens de preentrenamiento del modelo base, la composicion completa del dataset original ni si hubo fases de RLHF o DPO en su alineamiento. El modelo base declara ser una variante "uncensored", lo que implica la eliminacion o reduccion de los mecanismos de rechazo del modelo original, pero no se detalla la metodologia empleada.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento de multiples pasos y cadena de pensamiento, reforzado por la calibracion sobre Bespoke-Stratos-17k.
- Generacion y comprension de codigo, con calibracion especifica sobre codeparrot-clean para preservar sintaxis y representaciones AST.
- Procesamiento de contextos muy largos: ventana nativa de 262.144 tokens ampliable a 1M con YaRN.
- Decodificacion especulativa nativa mediante la capa MTP, con tasa de aceptacion declarada del 80-86% en posicion 1.
- KV cache en FP8 estatico precalibrado para reducir el consumo de memoria en inferencia.
- Ausencia de filtros de rechazo propios de un modelo alineado (variante "uncensored").
- No se documentan capacidades de vision, audio, tool calling ni function calling en la informacion disponible.

## Casos de uso

- Analisis de documentos extensos: el modelo puede procesar contratos, expedientes o informes de cientos de miles de tokens en una sola pasada gracias a la ventana nativa de 262k y a la extension YaRN hasta 1M, con un KV cache que crece a una cuarta parte del de un modelo denso equivalente.
- Resumen y extraccion de informacion en corpus tecnicos: la calibracion sobre pg19-test y codigo de produccion favorece el mantenimiento de la coherencia en pasajes largos de documentacion tecnica y repositorios.
- Asistencia a la programacion en local: la cuantizacion W4A16 reduce el peso a unos 20 GB, lo que permite desplegarlo en estaciones de trabajo con una sola GPU de 24 GB o en configuraciones multi-GPU de gama consumer, preservando la generacion de codigo gracias a la calibracion especifica.
- Generacion creativa sin restricciones tematicas: al tratarse de una variante uncensored, es adecuada para escritura de ficcion, guiones o narrativa que requiera explorar temas que los modelos alineados rechazan.
- Investigacion sobre cuantizacion y atencion lineal: el modelo sirve como caso de estudio reproducible de como la calibracion con documentos no concatenados y la preservacion de tensores MTP en BF16 afectan a la calidad tras cuantizar arquitecturas hibridas.
- Despliegue de bajo coste en produccion con vLLM: la integracion de Marlin, el KV cache FP8 estatico y la decodificacion especulativa MTP permiten servir el modelo con mayor throughput que una cuantizacion estandar, siempre que el caso de uso sea en ingles.
- Experimentacion con contextos ultra-largos: util para evaluar el comportamiento de la atencion hibrida (lineal + completa) en tareas de recuperacion de informacion a distancias superiores a 100k tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas internas del proceso de cuantizacion: reduccion de la perdida de reconstruccion de 5x a 12x por bloque frente a barridos de 200 iteraciones, recuperacion de 0,12 a 0,25 puntos de perplejidad gracias al ajuste min-max, y tasa de aceptacion del borrador especulativo MTP del 80-86% en posicion 1.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 20,1 GB, por lo que se necesita al menos 24 GB de VRAM para cargar los pesos en INT4 con margen para el KV cache y activaciones.
- KV cache: aproximadamente 32 GB en total para servir 1.000.000 de tokens, es decir, unos 4 GB por GPU con tensor parallelism 8.
- GPU recomendadas: A100 40/80 GB, H100, L40S o configuraciones multi-GPU. En consumer, una RTX 4090 (24 GB) puede alojar los pesos, aunque el contexto maximo practico quedara limitado por la VRAM restante.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090 (24 GB) o configuraciones multi-GPU de 24 GB; en GPUs de 16 GB no cabe sin cuantizacion adicional.
- Opciones de despliegue: vLLM es el runtime de referencia segun la model card (Marlin, KV cache FP8, motor MTP nativo). No se documentan otras opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles de forma numerica; la decodificacion especulativa MTP con aceptacion del 80-86% deberia mejorar el throughput frente a decodificacion autoregresiva estandar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Ultimate-Heretic-Uncensored-W4A16-UltraTuned | 6.615.972.112 (safetensors) | 262k nativo / 1M con YaRN | W4A16 AutoRound Marlin | Apache 2.0 | Hibrido GDN + GQA + MTP, solo ingles |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored (base) | No disponible | No disponible | BF16 original | Apache 2.0 (heredada) | Modelo sin cuantizar del que deriva esta ficha |
| Modelos densos de ~27B en BF16 | ~27B | Variable | BF16 | Variable | Requieren ~54 GB de VRAM, el doble que esta version cuantizada |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (hibridos de atencion lineal con contexto de 1M) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Es una variante "uncensored": no aplica filtros de rechazo, por lo que puede generar contenido sensible, ofensivo o inapropiado. Requiere moderacion externa en cualquier despliegue publico.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual.
- La discrepancia entre el nombre ("27B") y los parametros reales en safetensors (6,6B) no se aclara en la model card y debe verificarse antes de dimensionar el despliegue.
- La model card esta incompleta: no incluye benchmarks, instrucciones de uso, ejemplos de prompt ni detalles sobre el proceso de "uncensoring" del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base es un fine-tuning comunitario sin garantias de calidad ni soporte.
- El modelo tiene 314 descargas y 1 like, lo que indica una validacion practica muy limitada por parte de la comunidad.
- La cuantizacion W4A16 introduce perdida de precision respecto al BF16 original; aunque la receta de calibracion busca minimizarla, no se aportan mediciones de perplejidad absolutas.
- El contexto de 1M tokens depende de configurar correctamente YaRN con factor 4.0 y DCA; una configuracion incorrecta puede degradar la calidad de forma significativa.

## Enlaces

- Hugging Face: https://huggingface.co/MadGoatHaz/Qwen3.8-27B-Ultimate-Heretic-Uncensored-W4A16-UltraTuned
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- No se han encontrado en la informacion disponible enlaces adicionales a papers, blogs, repositorios o demos.
