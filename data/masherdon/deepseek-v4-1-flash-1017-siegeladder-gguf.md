# MasherDon/DeepSeek-V4.1-Flash-1017-SiegeLadder-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-SiegeLadder-GGUF es una cuantizacion extrema en formato GGUF del modelo DeepSeek-V4.1-Flash-1017, desarrollado originalmente por DeepSeek y redistribuido por el usuario MasherDon. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 552.000 millones de parametros en sus expertos enrutados, mas un componente adicional denominado Engram que el autor mantiene en precision FP8 oficial. Esta publicacion no es un modelo nuevo, sino un empaquetado de pesos cuantizados a aproximadamente 2 bits por experto, pensado para ejecutar un modelo de escala frontera en hardware domestico.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica de cuantizacion con GPTQ sobre textos de calibracion propios, con asignacion no uniforme de bits (mas bits en las capas iniciales y finales y en las proyecciones down). Por otro, describe el motor de inferencia Siege-Ladder, un fork de llama.cpp que transmite los expertos por streaming a traves de VRAM, RAM y NVMe, permitiendo decodificar a unos 18,5-18,8 tokens por segundo en un PC con una RTX 5070 Ti de 16 GB. El modelo soporta contextos de hasta 1M tokens segun las mediciones del autor.

El repositorio ocupa 378,1 GB repartidos en 11 partes GGUF y se distribuye bajo licencia MIT, la misma del modelo base. El autor advierte explicitamente de que no es la version final y que los archivos se reemplazaran por compilaciones de mejor calidad. No se dispone de informacion sobre el pipeline ni sobre los idiomas soportados en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) con componente Engram; transformer segun el modelo base |
| Parametros totales | 74.711.040 (dato de safetensors del repo); el autor declara 552B en el MoE del modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1M tokens (medido por el autor con documentos de 947K tokens) |
| Tipos de cuantizacion | GPTQ propio: IQ2_XXS, IQ3_XXS, IQ2_S, IQ3_S en expertos; Q5_K, Q8_0, BF16 y F32 en pesos densos; FP8 (E4M3) con escalas E8M0 en Engram |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (11 partes, 377,9 GB) |

## Arquitectura y entrenamiento

El modelo base es un MoE de 552.000 millones de parametros con un modulo Engram adicional, segun la model card del autor de la cuantizacion. La arquitectura exacta, la composicion del dataset de entrenamiento, el numero de tokens vistos y si hubo RLHF o DPO no se detallan en la informacion disponible. El modelo base figura como deepseek-ai/DeepSeek-V4.1-Flash-1017, pero su model card no aporta especificaciones tecnicas en el material proporcionado.

La innovacion principal de esta publicacion es el proceso de cuantizacion. Los expertos enrutados se cuantizan con GPTQ sobre textos de calibracion propios, no con round-to-nearest, y se cubre cada capa de expertos. La asignacion de bits es desigual: las capas 4-35 usan IQ2_XXS en gate/up y IQ3_XXS en down; las capas 0-3 y 36-39 usan IQ2_S e IQ3_S, con mas bits donde los errores cuestan mas. Los pesos densos y compartidos se mantienen en Q5_K, con tensores pequenos en BF16, F32 y Q8_0. Engram se conserva en FP8 oficial sin modificar. Ademas, se incluye un archivo de 149 MB (`g44/1017-lens-d2.gguf`) con una correccion aprendida del lens de prediccion de expertos.

El motor Siege-Ladder, un fork de llama.cpp, implementa streaming de expertos a traves de VRAM, RAM y NVMe, y lee el prompt en orden layer-major a partir de 256K tokens de contexto. La calidad se mide como distancia al modelo completo: el exceso de log-verosimilitud negativa en nat/token sobre continuaciones del modelo completo via API, en tres conjuntos de prompts, con valores de 0,090 / 0,051 / 0,069 en modo exacto y 0,091 / 0,054 / 0,072 con las reglas de velocidad por defecto del motor.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es de escala frontera y la cuantizacion preserva las capacidades generales, con una degradacion medida de 0,05-0,09 nat/token respecto al modelo completo.
- Generacion de codigo: el autor reporta 160 de 164 en HumanEval con esta compilacion.
- Procesamiento de documentos largos: soporta contextos de hasta 1M tokens, con velocidades de lectura de 1128 tok/s a 256K, 1043 tok/s a 512K y 888 tok/s a 1M.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: el componente Engram y el lens de prediccion de expertos son especificos de esta arquitectura; no se documentan modos de pensamiento, vision ni audio.

## Casos de uso

- Analisis de documentos extensos en local: el modelo puede procesar contratos, expedientes o codigos fuente de cientos de miles de tokens en un solo contexto, con velocidades de lectura superiores a 1000 tok/s a 256K y 888 tok/s a 1M, adecuado para auditoria legal o revision de repositorios completos.
- Generacion de codigo asistida en estaciones de trabajo: con 160/164 en HumanEval, puede integrarse en editores o pipelines locales para autocompletado y generacion de funciones, aunque la latencia de decodificacion de ~18,5 tok/s limita su uso interactivo a tareas no criticas en tiempo real.
- Investigacion sobre cuantizacion extrema: sirve como referencia reproducible para estudiar el impacto de GPTQ a ~2 bits en modelos MoE de gran escala, con metricas de distancia al modelo completo publicadas.
- Despliegue domestico de un modelo frontera: permite experimentar con un MoE de 552B en un PC con RTX 5070 Ti de 16 GB, 64 GB de DDR5 y NVMe, sin depender de servicios en la nube.
- Procesamiento por lotes de resumenes y extraccion de informacion: la decodificacion sostenida de ~18,5 tok/s permite ejecutar trabajos nocturnos sobre corpus grandes con contexto largo.
- Evaluacion de motores de inferencia con streaming de expertos: el fork Siege-Ladder y sus mediciones (tok/s, impacto de PCIe 5.0, espejo de expertos en segundo NVMe) son utiles para comparar estrategias de offloading VRAM/RAM/NVMe.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Exceso de NLL vs modelo completo (conjunto 1, exacto) | 0,090 nat/token |
| Exceso de NLL vs modelo completo (conjunto 2, exacto) | 0,051 nat/token |
| Exceso de NLL vs modelo completo (conjunto 3, exacto) | 0,069 nat/token |
| Exceso de NLL con reglas de velocidad por defecto | 0,091 / 0,054 / 0,072 nat/token |
| HumanEval | 160 / 164 |
| Decodificacion, contexto corto (servidor) | 18,44-18,80 tok/s |
| Decodificacion, teacher-forced | 21,30 tok/s |
| Lectura de documento de 246K tokens (contexto 256K) | 1128 tok/s |
| Lectura de documento de 479K tokens (contexto 512K) | 1043 tok/s |
| Lectura de documento de 947K tokens (contexto 1M) | 888 tok/s |

Mediciones realizadas por el autor entre el 27 y el 28 de octubre de 2026, y el 4 y 6 de noviembre de 2026, en un equipo con RTX 5070 Ti 16 GB, Ryzen 5 7600, 64 GB DDR5 y NVMe PCIe 5.0. No se han publicado resultados de MMLU, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM: el modelo no cabe completo en VRAM; requiere streaming de expertos. El autor lo ejecuta con 16 GB de VRAM (RTX 5070 Ti).
- RAM: 64 GB DDR5 en el equipo de referencia; el modelo se apoya en RAM como nivel intermedio del streaming.
- Almacenamiento: 378 GB para los 11 archivos GGUF, en NVMe PCIe 5.0; se recomienda un segundo NVMe opcional como espejo de expertos, que mejora la lectura de prompts frios un 14-22%.
- GPU recomendadas: RTX 5070 Ti (sm_120, CUDA 13) es la configuracion probada; no se documentan pruebas con A100, H100 ni RTX 4090.
- Cabe en GPU consumer: si, con streaming, en GPUs de 16 GB como la RTX 5070 Ti; no se garantiza en GPUs con menos VRAM.
- Opciones de despliegue: exclusivamente el fork Siege-Ladder de llama.cpp, compilado desde los parches del repositorio de GitHub; no es compatible con vLLM, Ollama ni TGI segun la informacion disponible.
- Latencia y throughput: 18,44-18,80 tok/s en decodificacion de contexto corto y 888-1128 tok/s en lectura de prompts largos; PCIe 5.0 x16 reduce el tiempo de copia de expertos y eleva la decodificacion estimada a ~24,7 tok/s.
- Desgaste de SSD: las tablas Engram generan miles de millones de lecturas pequenas; el autor observo una caida de ~400K a ~40K IOPS en lecturas aleatorias tras unas semanas, con degradacion de 1050 a 685 tok/s en documentos de 512K.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar ni de especificaciones tecnicas del modelo base DeepSeek-V4.1-Flash-1017 en la informacion proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoria. La unica comparacion interna disponible es con la variante `qd` del mismo autor, descrita como mas rapida con el preset `fast` del motor pero con mayor perdida de calidad; no se publican sus numeros.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-SiegeLadder-GGUF (`og`) | 552B en MoE (declarado) | hasta 1M | MIT | GGUF, 11 partes | Hugging Face, 273 descargas |
| DeepSeek-V4.1-Flash-1017 (`qd`, mismo autor) | 552B en MoE (declarado) | no disponible | MIT | GGUF | no disponible publicamente |
| DeepSeek-V4.1-Flash-1017 (modelo base) | no disponible | no disponible | MIT | no disponible | Hugging Face |

## Limitaciones y advertencias

- La cuantizacion a ~2 bits introduce una degradacion medible: 0,05-0,09 nat/token de exceso de NLL respecto al modelo completo, con impacto en tareas sensibles a la precision.
- El autor advierte de que esta no es la version final y que los archivos se reemplazaran; no es adecuada para produccion estable sin fijar una revision concreta.
- Requiere compilar un fork especifico de llama.cpp (Siege-Ladder) desde parches; no funciona con llama.cpp upstream, Ollama, vLLM ni TGI.
- Dependencia de hardware concreto: probado en Windows con CUDA 13 y una RTX 50 (sm_120); el rendimiento en otras GPUs no esta documentado.
- El lens de prediccion de expertos debe colocarse en una carpeta `g44` junto al directorio del modelo o configurarse mediante `LLAMA_MOE_STREAM_G44`; sin el, la decodificacion es mas lenta.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es esperable en un modelo de este tipo, pero no hay mediciones.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles en los metadatos ni en la model card.
- Desgaste de SSD: el uso intensivo de Engram puede degradar el rendimiento de lectura aleatoria del NVMe con el tiempo; conviene monitorizar el estado del disco.
- Licencia MIT permite uso comercial, pero el aviso de copyright del modelo base es de DeepSeek (2023); conviene revisar el archivo LICENSE incluido.
- El proyecto no esta afiliado a DeepSeek.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MasherDon/DeepSeek-V4.1-Flash-1017-SiegeLadder-GGUF
- Modelo base en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio del motor Siege-Ladder: https://github.com/MasherDon/Siege-Ladder
