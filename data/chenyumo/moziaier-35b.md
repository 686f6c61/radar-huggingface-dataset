# chenyumo/MoziAier-35B

## Resumen

MoziAier-35B-V3.9 es un modelo de lenguaje multimodal de tipo MoE (mezcla de expertos) desarrollado por el equipo de Chen Yumo, orientado específicamente al dominio financiero y a tareas de horizonte largo ejecutadas de forma local. Se construye sobre el modelo base Occamy-1.0-35B-A3B, que sigue la arquitectura de Qwen3.6-35B-A3B, y añade datos financieros propios, una metodología de entrenamiento propia, un marco de razonamiento de siete dimensiones, un mecanismo de agente denominado LOOP y un algoritmo de cuantización híbrida de nueva generación llamado MoziSmartBit.

La propuesta central de esta versión es la estabilidad en tareas multi-paso sobre una ventana de contexto de clase 250K (256K tokens, 262.144 en concreto), pensada para agentes que encadenan decenas de llamadas a herramientas, análisis de documentos extensos o trabajo de ingeniería entre múltiples ficheros sin perder el hilo. Todo ello en un único fichero GGUF de 12,99 GB, lo que rebaja el umbral de VRAM hasta 8 GB con offload a RAM del sistema.

El modelo se distribuye exclusivamente en formato GGUF para llama.cpp, Ollama, LM Studio y Jan, con la plantilla de chat embebida en el propio fichero y sin cabecera MTP (por lo que la decodificación especulativa debe permanecer desactivada). Incluye capacidades de visión mediante un proyector mmproj separado, soporte de tool calling en una y varias vueltas, y se declara como "uncensored" para uso totalmente local y privado. La licencia se etiqueta como "other" en Hugging Face, aunque la model card afirma que es libre para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (arquitectura Qwen3.6-35B-A3B) |
| Parametros totales | 35B |
| Parametros activos | no disponible |
| Longitud de contexto | 256K (262.144 tokens) |
| Tipos de cuantizacion | Cuantización híbrida MoziSmartBit (capas de expertos IQ3_XXS + imatrix occamy); KV cache recomendada q4_0 |
| Idiomas soportados | en, zh (chino especialmente ajustado) |
| Licencia | other (la model card indica "free for commercial use") |
| Formato de pesos | GGUF (llama.cpp); proyector de visión mmproj Q8_0 en GGUF |
| Modelo base | Occamy-1.0-35B-A3B |
| Tamano del fichero principal | 12,99 GB |
| Tamano del proyector de vision | 0,57 GB (Q8_0 mmproj) |
| Perdida de cuantizacion | PPL 8,3044 (+0,47 % frente a BF16) |
| VRAM minima | 8 GB (con offload a RAM) |
| VRAM recomendada | 16 GB (192K) / 24 GB+ (250K) |
| Decodificacion especulativa | No soportada (sin cabecera MTP) |
| Plantilla de chat | Embebida en el GGUF (`tokenizer.chat_template`) |

## Arquitectura y entrenamiento

El modelo parte de Occamy-1.0-35B-A3B, un transformer de tipo MoE con 35B parámetros totales que hereda la arquitectura de Qwen3.6-35B-A3B. Sobre esa base, el equipo de Chen Yumo aplica su propio corpus financiero y su metodología de entrenamiento, e incorpora un marco de razonamiento de siete dimensiones que adapta la profundidad del pensamiento estructurado a la complejidad de la tarea, junto con un mecanismo de agente LOOP orientado a la autocorrección en trabajos complejos. La información disponible no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica más destacable de esta versión es el algoritmo de cuantización híbrida MoziSmartBit, que combina capas de expertos en IQ3_XXS con una imatrix específica (occamy) para comprimir el modelo hasta 12,99 GB con una pérdida de perplejidad de solo el 0,47 % respecto a BF16. Además, esta entrega elimina la cabecera MTP presente en versiones anteriores (lo que obliga a desactivar la decodificación especulativa) y embebe la plantilla de chat directamente en el GGUF, evitando la dependencia de un fichero jinja externo.

## Capacidades

- Generación de texto y razonamiento estructurado mediante un marco de siete dimensiones que ajusta el esfuerzo de razonamiento a la dificultad de la tarea.
- Ejecución de tareas de horizonte largo (long-horizon) estables sobre contexto de clase 250K, con decenas de llamadas a herramientas encadenadas.
- Tool calling / function calling con formato correcto en una y varias vueltas, incluyendo llamadas en paralelo.
- Comportamiento de agente con mecanismo LOOP de autocorrección en trabajos multi-paso.
- Capacidades de visión: lectura de capturas de pantalla locales y de gráficos mediante el proyector mmproj.
- Dominio financiero: preguntas y respuestas financieras, codificación de estrategias cuantitativas y uso de herramientas del sector.
- Multilingüe con ajuste especial en chino; idiomas declarados en y zh.
- Modo "uncensored" para uso totalmente local y privado.
- Procesamiento de documentos largos y trabajo de ingeniería entre múltiples ficheros sin perder el hilo.

## Casos de uso

- Análisis de documentos financieros extensos: informes anuales, prospectos o transcripciones de resultados que superan los cientos de miles de tokens se pueden cargar en una sola ventana de 256K para extracción de cifras, comparación entre ejercicios y resumen con referencias cruzadas.
- Agente de investigación multi-paso con herramientas: el mecanismo LOOP y el soporte de tool calling en paralelo permiten encadenar decenas de consultas a APIs financieras, validar resultados y autocorregir errores sin perder el contexto acumulado.
- Generación y revisión de código de estrategias cuantitativas: el ajuste en dominio financiero y el soporte de tool calling lo hacen adecuado para pipelines que generan, prueban y depuran backtests de forma iterativa.
- Asistente de atención al cliente especializado en productos financieros: conversaciones multi-turno con contexto largo para recordar el historial completo del cliente y consultar herramientas internas de saldos o productos.
- Lectura automatizada de gráficos y capturas: con el proyector de visión puede interpretar charts de mercados, capturas de paneles de trading o tablas en imagen para incorporarlas a informes o alertas.
- Despliegue local con privacidad estricta: al ejecutarse desde 8 GB de VRAM con offload y ser "uncensored", encaja en entornos donde los datos no pueden salir de la máquina, como análisis de carteras confidenciales o investigación interna.
- Trabajo de ingeniería entre múltiples ficheros: edición y refactorización de repositorios con contexto de 192K en una GPU de 16 GB, manteniendo coherencia entre módulos durante sesiones largas.

## Benchmarks y rendimiento

La model card no publica cifras propias de MMLU, GSM8K o HumanEval; remite a los resultados oficiales de Occamy-1.0 para capacidad general y ofrece únicamente métricas de cuantización y pruebas cualitativas.

| Prueba | Resultado |
|---|---|
| Perplejidad tras cuantizacion | 8,3044 (+0,47 % frente a BF16) |
| Contexto largo | Prueba de estrés de clase 250K superada; recuperación precisa de hechos plantados |
| Tool calling | Formato correcto en una y varias vueltas; llamadas en paralelo soportadas |
| Vision | Comprensión de capturas y lectura de gráficos verificadas |
| Capacidad general (MMLU / GSM8K / HumanEval) | No disponible en la información proporcionada (remite a Occamy-1.0) |

## Requisitos de hardware

- VRAM mínima: 8 GB, con offload de capas a RAM del sistema; contexto de 16K-32K y KV cache q4_0, con rendimiento más lento pero funcional.
- 12 GB de VRAM: contexto de 64K-128K con KV cache q4_0, adecuado para preguntas y respuestas sobre documentos diarios.
- 16 GB de VRAM: contexto de 192K con unos 0,4 GB de margen (configuración recomendada); a 250K el consumo medido es de unos 15,5 GB, en el límite y requiere prueba propia.
- 24 GB o más: contexto de 256K más visión con KV cache q4_0, la configuración más segura.
- La KV cache debe ser q4_0; con q8_0 el consumo de VRAM impide que quepa en una tarjeta de 16 GB.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, LM Studio y Jan. No se mencionan vLLM ni TGI, coherente con el formato GGUF.
- Parámetros recomendados: temperatura 0,6-0,7, top_p 0,9-0,95, top_k 20, repeat_penalty 1,0-1,05, flash attention activada, un solo slot paralelo y decodificación especulativa desactivada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| MoziAier-35B-V3.9 | 35B MoE | 256K | GGUF (llama.cpp, Ollama) | other (uso comercial segun model card) | Cuantizacion hibrida de 12,99 GB, visión, dominio financiero |
| Occamy-1.0-35B-A3B | 35B MoE | no disponible | no disponible | no disponible | Modelo base del que deriva MoziAier; referencia para benchmarks generales |
| Qwen3.6-35B-A3B | 35B MoE | no disponible | no disponible | no disponible | Arquitectura en la que se basa Occamy-1.0 |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada, por lo que la comparativa se limita a arquitectura, contexto, formato y licencia.

## Limitaciones y advertencias

- La decodificación especulativa no está soportada al carecer de cabecera MTP; debe permanecer desactivada para evitar comportamientos anómalos.
- La KV cache debe ser q4_0; usar q8_0 rompe el ajuste en GPUs de 16 GB.
- No se debe pasar `--chat-template-file` en llama.cpp: la plantilla ya está embebida en el GGUF y un fichero externo la sobrescribiría.
- El contexto de 250K en 16 GB de VRAM es borderline (unos 15,5 GB medidos) y requiere validación propia; la configuración segura es 192K en 16 GB o 24 GB+ para el máximo.
- La licencia figura como "other" en Hugging Face aunque la model card afirme uso comercial libre; conviene verificar los términos exactos antes de un despliegue en producción.
- El modelo se declara "uncensored", lo que implica ausencia de filtros de seguridad y traslada al operador la responsabilidad sobre el contenido generado.
- Idiomas declarados limitados a inglés y chino; el rendimiento en castellano no está documentado.
- No se publican cifras de benchmarks propios (MMLU, GSM8K, HumanEval); las referencias remiten a Occamy-1.0 y no son directamente comparables con versiones anteriores.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente crítico en dominio financiero, donde las salidas deben validarse contra fuentes.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- No se detallan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar riesgos específicos.

## Enlaces

- Hugging Face: https://huggingface.co/chenyumo/MoziAier-35B
- Model card en chino simplificado: README.zh.md (referenciado en el repositorio)
- Model card en chino tradicional: README.zh-hant.md (referenciado en el repositorio)
- Model card en japonés: README.ja.md (referenciado en el repositorio)
- Model card en coreano: README.ko.md (referenciado en el repositorio)
- Model card en hindi: README.hi.md (referenciado en el repositorio)
- Model card en alemán: README.de.md (referenciado en el repositorio)
- Model card en francés: README.fr.md (referenciado en el repositorio)
- Model card en neerlandés: README.nl.md (referenciado en el repositorio)
- Model card en italiano: README.it.md (referenciado en el repositorio)
- Model card en ruso: README.ru.md (referenciado en el repositorio)
- ModelScope y GitHub: mencionados en la model card como canales de descarga, sin URL concreta disponible
