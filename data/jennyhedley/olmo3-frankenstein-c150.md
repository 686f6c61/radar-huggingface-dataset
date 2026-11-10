# jennyhedley/olmo3-frankenstein-c150

## Resumen

OLMo-3 Frankenstein c150 es un adaptador LoRA de tipo PEFT para el modelo base allenai/Olmo-3-1025-7B, desarrollado por Ai2. Lo publica la usuaria jennyhedley como experimento de continuacion de texto literario, afinado sobre la edicion de 1818 de *Frankenstein; or, The Modern Prometheus* de Mary Shelley. No es un asistente conversacional: es un modelo de continuacion de texto sin plantilla de chat ni ajuste por instrucciones.

El repositorio contiene unicamente los pesos del adaptador (0,1 GB), no los pesos completos del modelo base de 7B, que deben cargarse desde el repositorio de Ai2. El ajuste se realizo con MLX-LM LoRA de rango 64, secuencias de 2048 tokens y tasa de aprendizaje 1e-5, seleccionando la iteracion 150 con una perdida de validacion reportada de 2,164.

Su relevancia es acotada: se trata de un artefacto de investigacion y educacion en escritura creativa, con licencia Apache 2.0 y orientado exclusivamente al ingles. No dispone de benchmarks estandarizados ni de datos de rendimiento publicados mas alla de la perdida de validacion mencionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (OLMo-3 7B) |
| Parametros totales | no disponible (adaptador LoRA; base de 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia usada en el ajuste; contexto nativo del base no disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT; requiere el base en safetensors) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre allenai/Olmo-3-1025-7B, un transformer decoder-only de 7B parametros de Ai2. El ajuste emplea LoRA de rango 64 con MLX-LM sobre secuencias de 2048 tokens y tasa de aprendizaje 1e-5, y el checkpoint seleccionado es la iteracion 150 (denominada Frankenstein V1). El adaptador se convirtio posteriormente de MLX LoRA a PEFT para inferencia con Transformers.

El corpus de entrenamiento es el texto UTF-8 limpio de la edicion de 1818 de *Frankenstein*, procedente de Project Gutenberg (#41445), con correccion de los saltos de linea duros artificiales en la prosa. No se aplico RLHF, DPO ni ajuste por instrucciones. La evaluacion se limito a la perdida de prediccion de tokens en un conjunto reservado (2,164) y a prompts exploratorios en varias formas literarias; una verificacion local con decodificacion greedy confirmo que el adaptador convertido cargaba y generaba con Transformers, con coincidencia entre MLX y Transformers en los primeros 215 caracteres generados antes de divergir.

## Capacidades

- Continuacion de texto literario en ingles a partir de un inicio de frase, carta, dialogo, poema o documento encontrado.
- Generacion de prosa con registro y estilo proximos a la novela gotica del siglo XIX.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Experimentacion literaria: generar continuaciones de pasajes de *Frankenstein* o de textos de estilo gotico a partir de un fragmento inicial, aprovechando el ajuste especifico sobre la obra.
- Educacion en escritura creativa: usar el modelo para mostrar a estudiantes como un ajuste LoRA sobre un corpus acotado modifica el registro y el estilo de un modelo base.
- Investigacion sobre estilometria: comparar las salidas del adaptador con las del base OLMo-3 7B para estudiar que rasgos estilisticos captura el ajuste.
- Prototipado de narrativa interactiva: generar variantes de dialogos y cartas en un entorno de ficcion historica, siempre con revision humana.
- Generacion de material de rol o ficcion epistolar: producir borradores de cartas y documentos ficcionales con tono decimononico.
- Estudio de tecnicas de ajuste eficiente: servir como ejemplo reproducible de conversion de MLX LoRA a PEFT y de evaluacion mediante perdida de validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion reportado es una perdida de validacion de 2,164 sobre el texto reservado del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; requiere cargar el modelo base OLMo-3 de 7B, por lo que en fp16 se necesitan del orden de 14-16 GB solo para los pesos, mas memoria para el adaptador y el contexto.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: no confirmado; un modelo de 7B en fp16 excede los 16 GB de una RTX 4090 solo si se anade contexto y overhead, por lo que en la practica requeriria cuantizacion del base, no documentada para este adaptador.
- Opciones de despliegue: Transformers con PEFT (segun la model card); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| jennyhedley/olmo3-frankenstein-c150 | Adaptador LoRA sobre base 7B | 2048 (ajuste) | Adaptador PEFT | apache-2.0 | Continuacion literaria en ingles, sin benchmarks |
| allenai/Olmo-3-1025-7B | 7B | no disponible | Modelo base | apache-2.0 | Modelo base sin ajuste; referencia directa |
| Otros adaptadores LoRA literarios sobre modelos de 7B | Variable | Variable | Adaptador PEFT | Variable | No disponible comparativa concreta en la informacion proporcionada |

## Limitaciones y advertencias

- No es un asistente: no hay plantilla de chat ni ajuste por instrucciones, por lo que no debe usarse como chatbot.
- Las generaciones pueden divergir de la forma solicitada, volverse repetitivas o incluir material inexacto o perturbador.
- Riesgo de alucinacion alto en cualquier uso factico; el modelo esta pensado como ficcion generada.
- Solo soporta ingles.
- La evaluacion se limita a la perdida de validacion y a prompts exploratorios; no hay benchmark estandarizado de calidad literaria.
- Diferencias de precision y de implementacion entre backends (MLX frente a Transformers) pueden alterar las completaciones.
- El repositorio contiene solo el adaptador; es obligatorio descargar el base de Ai2 y cumplir su licencia Apache 2.0.
- Uso previsto: investigacion y educacion en escritura creativa.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/jennyhedley/olmo3-frankenstein-c150
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Edicion de *Frankenstein* (1818) en Project Gutenberg: https://www.gutenberg.org/ebooks/41445
