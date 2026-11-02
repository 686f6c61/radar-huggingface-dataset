# DangKhoa09/SignTalk-ASLM-Gemma4-31B-VSL

## Resumen

SignTalk-ASLM es un modelo de generacion de texto especializado en la conversion de vietnamita a glosas de lengua de signos vietnamita (VSL, Vietnamese Sign Language). Lo desarrolla Tran Dang Khoa (DangKhoa09) junto con el equipo de investigacion SignTalk, y parte de una base Gemma 4 31B de Google DeepMind, ajustada mediante DoRA (Weight-Decomposed Low-Rank Adaptation). Su proposito es servir como capa de traduccion texto-a-glosas dentro de pipelines de generacion de lengua de signos, un paso intermedio necesario para producir animaciones o avatares signantes.

El modelo se presenta como un "Application-Specific Language Model" (ASLM), es decir, un modelo de proposito muy concreto en lugar de uno de uso general. La adaptacion se ha realizado con rango DoRA 16, alpha 32 y 410 proyecciones lineales objetivo, sobre un corpus de 100.000 secuencias empaquetadas multi-agente con ventana de contexto de 2048 tokens y 38 reglas gramaticales de VSL. El vocabulario canonico de VSL que maneja consta de 14.916 tokens.

Su relevancia es acotada pero clara: la lengua de signos carece de herramientas de procesamiento del lenguaje maduras en comparacion con el texto escrito, y los modelos generativos generalistas no producen glosas con la estructura gramatical correcta. Este ajuste intenta cubrir ese hueco para el vietnamita, aunque el modelo es muy reciente (publicado en noviembre de 2026), sin descargas ni likes, y con documentacion tecnica limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 4 31B) con adaptadores DoRA |
| Parametros totales | 31B (modelo base); parametros del adaptador DoRA no disponibles |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | 2048 tokens (ventana usada en el entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (adaptadores DoRA sobre pesos del modelo base) |

## Arquitectura y entrenamiento

El modelo se construye sobre Gemma 4 31B, un transformer decoder-only de 31.000 millones de parametros. Sobre esa base se aplica un ajuste DoRA, una variante de LoRA que descompone los pesos en magnitud y direccion para mejorar la capacidad de adaptacion con pocos parametros entrenables. La configuracion reportada es rango 16, alpha 32 y 410 proyecciones lineales objetivo, lo que indica una cobertura amplia de las capas de atencion y feed-forward del modelo.

El entrenamiento utiliza 100.000 secuencias empaquetadas multi-agente con contexto de 2048 tokens, orientadas a ensenar al modelo 38 reglas gramaticales de la lengua de signos vietnamita y un vocabulario canonico de 14.916 tokens de glosa. No se especifican en la informacion disponible el numero total de tokens procesados, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla si se aplicaron tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto especializada: convierte frases en vietnamita a secuencias de glosas VSL siguiendo las 38 reglas gramaticales documentadas.
- Vocabulario controlado: opera sobre un conjunto canonico de 14.916 tokens de glosa VSL.
- Procesamiento de contexto medio: ventana de 2048 tokens, suficiente para frases y parrafos cortos, no para documentos extensos.
- Generacion multi-turno empaquetada: el entrenamiento con secuencias multi-agente sugiere capacidad de manejar interacciones concatenadas dentro de una misma ventana.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingue: limitado al vietnamita.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Traduccion texto-a-glosas para avatares signantes: el modelo recibe una frase escrita en vietnamita y devuelve la secuencia de glosas que un modulo de animacion puede convertir en movimiento. Es su funcion principal y para la que fue entrenado.
- Subtitulado accesible en television y streaming: integrado en una cadena de procesamiento, permite generar glosas a partir de subtitulos en vietnamita para producir una capa de lengua de signos superpuesta.
- Atencion al cliente accesible: un sistema de chat podria pasar la respuesta textual por el modelo para ofrecer una version en VSL, aprovechando su vocabulario controlado y las reglas gramaticales aprendidas.
- Herramientas educativas para aprendizaje de VSL: el modelo puede generar glosas de referencia a partir de frases de ejemplo, utiles para materiales didacticos o ejercicios autocorregidos.
- Investigacion en procesamiento de lenguas de signos: sirve como linea base reproducible (licencia Apache 2.0) para experimentos de traduccion texto-glosa en vietnamita y para comparar con otros enfoques.
- Generacion de contenido en senas para administracion publica: traduccion de avisos y formularios a glosas VSL para su representacion mediante avatares en portales institucionales.
- Preprocesamiento en pipelines de sintesis de video: las glosas generadas alimentan modelos de sintesis de movimiento, de modo que este modelo actua como primer eslabon de una cadena texto-glosa-video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 31B en precision completa se necesitarian del orden de 62 GB solo para pesos, cifra que no proviene de la documentacion del autor.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano del modelo base, el despliegue en precision completa requeriria GPUs de clase A100 80 GB o H100; se trata de una estimacion, no de un dato del autor.
- Cabe en GPU de consumo: no disponible. Con cuantizacion agresiva podria ser viable en GPUs de 24 GB, pero el autor no documenta cuantizaciones ni formatos GGUF.
- Opciones de despliegue: no disponibles. Al ser adaptadores DoRA sobre Gemma 4 31B, requeriria cargar el modelo base y aplicar el adaptador; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SignTalk-ASLM (este modelo) | 31B (base) + adaptador DoRA | 2048 | Texto a glosas VSL | Apache 2.0 | HuggingFace |
| Gemma 4 31B (base) | 31B | no disponible | Texto general | no disponible en esta ficha | HuggingFace / Google |
| Otros modelos texto-glosa VSL | no disponible | no disponible | Traduccion a glosas | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables especificos de traduccion texto-glosa para lengua de signos vietnamita, ni de resultados de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Documentacion muy limitada: la model card es breve y no detalla composicion del dataset, numero de tokens de entrenamiento ni proceso de evaluacion.
- Sin validacion publica: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso o evaluacion independiente.
- Riesgo de alucinacion: al ser un modelo generativo ajustado, puede producir glosas fuera del vocabulario canonico o secuencias gramaticalmente invalidas, especialmente con entradas ambiguas o fuera de dominio.
- Cobertura limitada a vietnamita: no soporta otros idiomas ni variantes regionales de lengua de signos.
- Contexto corto: 2048 tokens restringen su uso a frases y parrafos breves; documentos largos requeririan troceado.
- Dependencia del modelo base: el uso requiere disponer de Gemma 4 31B y de la infraestructura para aplicar los adaptadores DoRA, lo que anade complejidad frente a un modelo autonomo.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar que los terminos del modelo base Gemma 4 sean compatibles con el uso previsto, ya que la informacion disponible no detalla esa relacion.
- Sesgos: no documentados por el autor; al entrenarse sobre un corpus no descrito, pueden heredarse sesgos del dataset y de Gemma 4.

## Enlaces

- HuggingFace: https://huggingface.co/DangKhoa09/SignTalk-ASLM-Gemma4-31B-VSL
- Model card del autor: incluida en la pagina de HuggingFace anterior
- Paper, blog, repositorio o demo: no disponibles en la informacion proporcionada
