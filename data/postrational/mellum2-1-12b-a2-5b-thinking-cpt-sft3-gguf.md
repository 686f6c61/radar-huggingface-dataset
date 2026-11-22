# postrational/Mellum2.1-12B-A2.5B-Thinking-cpt-sft3-GGUF

## Resumen

Mellum2.1-12B-A2.5B-Thinking-cpt-sft3-GGUF es una distribucion en formato GGUF de un modelo de lenguaje conversacional con capacidad de razonamiento explicito (modo thinking), derivado de la familia Mellum 2.1. El identificador indica una arquitectura de mezcla de expertos (MoE) con 12.149.923.072 parametros totales y aproximadamente 2.500 millones de parametros activos por token, lo que lo situa en la categoria de modelos dispersos de gran capacidad pero coste de inferencia contenido. La version concreta ha pasado por un pipeline de entrenamiento continuado (cpt) y tres etapas de ajuste supervisado (sft3) antes de su cuantizacion.

El modelo lo publica el usuario postrational en Hugging Face, no un laboratorio con documentacion publica asociada, y se distribuye unicamente como un fichero GGUF Q4_K_M generado con Unsloth. Esto lo orienta a inferencia local con llama.cpp y a despliegues ligeros, no a entrenamiento ni a evaluacion reproducible a partir de pesos completos. El repositorio ocupa 8,1 GB y no registra descargas ni interacciones en el momento de la consulta.

Su relevancia practica es la de un artefacto listo para ejecutar en hardware de consumo: un MoE de 12B con 2,5B activos cuantizado en 4 bits permite razonamiento multi-paso y conversacion con un coste de VRAM moderado. La contrapartida es la ausencia de model card tecnica detallada, licencia declarada, idiomas soportados y resultados de benchmarks, lo que limita su uso en produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, segun el identificador del modelo; detalles no disponibles |
| Parametros totales | 12.149.923.072 |
| Parametros activos | aproximadamente 2.500 millones (segun el identificador "A2.5B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors como origen del recuento de parametros) |

## Arquitectura y entrenamiento

El nombre del repositorio describe un modelo MoE con 12,1B parametros totales y unos 2,5B activos, lo que implica enrutamiento disperso por token con un subconjunto de expertos activado en cada paso. No se dispone de informacion sobre el numero de expertos, la dimension oculta, el numero de capas, el mecanismo de atencion ni la estrategia de enrutamiento. Tampoco se documenta si emplea atencion lineal, decodificacion especulativa u otras optimizaciones de inferencia.

El pipeline de entrenamiento se deduce de las siglas del identificador: un entrenamiento continuado (cpt) sobre una base Mellum 2.1, seguido de tres fases de ajuste supervisado (sft3). No hay datos publicados sobre el volumen de tokens, la composicion del corpus, el uso de RLHF o DPO, ni sobre el proceso de destilacion de trazas de razonamiento que justifique el sufijo "Thinking". La conversion a GGUF y el ajuste se realizaron con Unsloth, que el autor cita como herramienta de aceleracion del entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat aplicada mediante `--jinja` en llama.cpp.
- Razonamiento explicito en modo thinking, segun el sufijo del nombre del modelo; el formato exacto de las trazas no esta documentado.
- Razonamiento multi-paso y descomposicion de problemas, presumiblemente derivado del ajuste supervisado sobre trazas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y uso de herramientas externas: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas en el repositorio.
- Vision o audio: no disponible; la model card menciona `llama-mtmd-cli` como plantilla generica de Unsloth, sin confirmar que este modelo sea multimodal.

## Casos de uso

- Asistente de razonamiento local en estaciones de trabajo: el modelo puede ejecutarse con llama.cpp en una GPU de consumo gracias a sus 2,5B parametros activos y al fichero Q4_K_M de aproximadamente 8 GB, lo que permite mantener conversaciones de analisis sin depender de APIs externas.
- Prototipado de agentes con trazas de pensamiento: el modo thinking facilita depurar cadenas de razonamiento en tareas de planificacion, siempre que se valide el formato de salida con pruebas propias.
- Generacion y revision de codigo en entornos con requisitos de privacidad: al ser un GGUF ejecutable en local, el codigo no sale de la maquina; conviene medir la calidad real antes de integrarlo en un pipeline.
- Analisis de documentos con contexto moderado: util para resumir y extraer conclusiones de textos tecnicos en una herramienta de escritorio, sujeto a verificar la ventana de contexto efectiva.
- Educacion y tutoria tecnica: explicaciones paso a paso de problemas de matematicas o logica, aprovechando el modo de razonamiento para mostrar el desarrollo y no solo la respuesta.
- Base para ajuste fino adicional: al ser un artefacto derivado de un pipeline cpt+sft, puede servir como punto de partida para especializaciones con LoRA, aunque la falta de licencia clara obliga a aclarar los terminos antes de redistribuir derivados.
- Evaluacion comparativa interna: util como candidato en pruebas ciegas frente a otros MoE de tamano similar para tareas de razonamiento, dado su bajo coste de ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M ocupa aproximadamente 8,1 GB, por lo que la inferencia completa requiere en torno a 8-10 GB de VRAM contando cache KV y overhead del runtime; la cifra exacta depende de la longitud de contexto configurada.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 4080 (16 GB) para el fichero completo con contexto amplio; RTX 4070 Ti o 4070 (12 GB) para contexto moderado; A100 y H100 sobredimensionadas para este tamano, utiles solo en despliegues multi-usuario.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM para el fichero Q4_K_M; con menos VRAM puede recurrirse a offload parcial a CPU en llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ... --jinja`), Ollama y otros frontends compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles; al activar solo unos 2,5B parametros por token, el throughput esperado es superior al de un modelo denso de 12B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Thinking-cpt-sft3-GGUF | 12,1B | ~2,5B | no disponible | no disponible | GGUF Q4_K_M |
| Modelos MoE de ~12B con ~2-3B activos de la familia Mellum | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas densas de ~7-8B cuantizadas en Q4 | ~7-8B | densas | variable | variable | GGUF |

No se dispone de datos publicados de benchmarks ni de especificaciones verificables de los modelos de referencia, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Ausencia de model card tecnica: no se documentan datos de entrenamiento, composicion del corpus ni proceso de alineacion, lo que impide evaluar sesgos de forma sistematica.
- Riesgo de alucinacion: como en cualquier modelo generativo sin evaluacion publicada, las trazas de razonamiento pueden contener pasos plausibles pero incorrectos; requiere verificacion en dominios factuales.
- Licencia no declarada: no hay terminos de uso comercial, redistribucion ni atribucion, lo que bloquea su adopcion en produccion hasta aclararlo con el autor.
- Idiomas no declarados: no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles, presumiblemente dominante en el corpus de entrenamiento.
- Contexto desconocido: sin ventana documentada, no deben asumirse contextos largos; conviene medirlo empiricamente antes de disenar aplicaciones que dependan de ello.
- Unica cuantizacion disponible: solo Q4_K_M, con la perdida de calidad asociada frente a precisiones mayores; no hay ficheros Q8_0, Q5_K_M ni BF16 para comparar.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Procedencia del ajuste: al ser un derivado de un pipeline cpt+sft no documentado, los terminos de la licencia del modelo base Mellum podrian aplicar y no aparecen reflejados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/postrational/Mellum2.1-12B-A2.5B-Thinking-cpt-sft3-GGUF
- Unsloth (herramienta de ajuste y conversion citada por el autor): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado por la model card): https://github.com/ggml-org/llama.cpp
