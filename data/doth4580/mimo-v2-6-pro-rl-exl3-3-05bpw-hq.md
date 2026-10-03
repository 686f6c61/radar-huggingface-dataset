# doth4580/MiMo-V2.6-Pro-RL-EXL3-3.05bpw-hq

## Resumen

MiMo-V2.6-Pro-RL-EXL3-3.05bpw-hq es una version cuantizada del checkpoint insignia de Xiaomi, XiaomiMiMo/MiMo-V2.6-Pro-RL, publicada por el usuario doth4580. La cuantizacion se ha realizado con la herramienta `convert.py` de ExLlamaV3 (exllamav3) en formato EXL3, con una tasa media de 3.05 bits por peso (bpw), lo que reduce drasticamente el espacio de almacenamiento y memoria respecto al checkpoint original en FP8. El modelo base pertenece a la serie MiMo-V2.6 de Xiaomi y esta disenado para "escalar el aprendizaje por refuerzo hacia la auto-mejora", con entrenamiento RL mixto sobre tareas de codigo, agentes generales, vision y ciberseguridad.

Se trata de un modelo nativamente omnimodal: procesa texto, imagen, video y audio, y admite una longitud de contexto de hasta 1 millon de tokens, orientada a repositorios largos, trazas de herramientas y ejecuciones de agentes multi-sesion. La model card declara idiomas ingles y chino y licencia MIT. El repositorio de esta cuantizacion tiene un tamano reportado de 8,7 GB y requiere la libreria exllamav3 (version 0.3 o superior) con soporte para `modeling_mimo_v2.py` incluido via `remote_code`.

La relevancia de esta ficha radica en que permite ejecutar un modelo omnimodal de contexto muy largo en hardware mas modesto que el necesario para el checkpoint en FP8, a costa de una perdida de precision controlada y verificada mediante metricas de reconstruccion y de divergencia KL frente a la referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Omnimodal (texto, imagen, video y audio); no se detalla la arquitectura interna. El nombre de los modulos (`layers.55.experts.256.down_proj`) sugiere una mezcla de expertos (MoE) con al menos 256 expertos por capa, si bien este dato no se confirma de forma explicita en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (la evidencia de MoE no permite estimar un numero fiable) |
| Longitud de contexto | 1.000.000 de tokens (1M) |
| Tipos de cuantizacion | EXL3 a 3.05 bpw de media; modulo `lm_head` a 6.00 bpw; capas criticas elevadas a 3.5 bpw. El checkpoint de origen esta en FP8 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | EXL3 (ExLlamaV3); shards que se cargan de forma incremental. Requiere `exllamav3` >= 0.3 con soporte para `modeling_mimo_v2.py` (incluido via `remote_code`) |

## Arquitectura y entrenamiento

El modelo base, MiMo-V2.6-Pro-RL, es el checkpoint insignia de la serie MiMo-V2.6 de Xiaomi y se presenta como un modelo nativamente omnimodal con horizonte largo, capaz de procesar texto, imagen, video y audio con un contexto de hasta 1M de tokens. La informacion disponible no detalla la arquitectura interna mas alla de la presencia de modulos de expertos, que apunta a un diseno de mezcla de expertos (MoE). Tampoco se especifica el numero total o activo de parametros ni la composicion exacta del dataset de preentrenamiento.

En cuanto al entrenamiento, la serie se centra en escalar el aprendizaje por refuerzo. Destaca el enfoque "You Only RL Once", una unica ejecucion de RL mixta que combina codigo, agentes generales, tareas visuales y ciberseguridad en el mismo lote, de modo que las capacidades se refuerzan mutuamente. El algoritmo empleado es Group Relative Policy Optimization (GRPO) totalmente asincrono, con lotes muy grandes (1.568 prompts x 16 rollouts por paso). Ademas, se introduce un sistema de evaluacion agentica por grupos: Groupwise Reward Synthesis (GRS), que construye rubricas especificas de tarea a partir de rollouts contrastados, y Groupwise Advantage Redistribution (GAR), que ordena las trayectorias correctas y redistribuye la ventaja hacia soluciones de mayor calidad.

Sobre la cuantizacion, el proceso empleo el comando `python convert.py -i <fp8_model> -o <output> -w <workdir> -b 3.05 -hq -d 0..7`, con la estrategia de alta calidad (`-hq`): busqueda de escalas por tensor con reajuste de error, refinamiento residual de 8 bits sobre datos de calibracion (8 datasets) y tasas de bits elevadas en capas sensibles (capa final y `lm_head`). El formato EXL3 es un FP-quant empaquetado en trellis con escalas por canal y pasadas de refinamiento de 8 bits.

## Capacidades

- Generacion de texto y razonamiento de proposito general en ingles y chino.
- Procesamiento multimodal nativo: vision (imagenes), comprension de video y entrada de audio en un unico modelo.
- Contexto largo de hasta 1M tokens, apto para repositorios completos, trazas largas de herramientas y sesiones de agente multi-turno.
- Capacidades de agente y razonamiento multi-paso, con soporte para entornos de herramientas ("harnesses") y generalizacion a harnesses no vistos durante el entrenamiento.
- Capacidades de codigo reforzadas mediante RL mixto sobre tareas de programacion.
- Tareas de ciberseguridad, incluidas en la mezcla de RL.
- Soporte de tool calling / function calling: la model card describe trazas de herramientas y ejecuciones de agentes, aunque no detalla el esquema concreto de invocacion.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- No se documenta explicitamente un "modo thinking" separado ni un esquema de decodificacion especulativa en la informacion disponible.

## Casos de uso

- Agente de codigo sobre repositorios completos: con 1M tokens de contexto, el modelo puede ingerir un repositorio entero o un gran subconjunto del mismo, razonar sobre dependencias y proponer parches coherentes sin necesidad de trocear el codigo.
- Analisis de video de larga duracion: la capacidad de comprension de video unida al contexto de 1M tokens permite resumir o extraer eventos de grabaciones extensas (reuniones, vigilancia, material docente) en una sola pasada.
- Asistente multimodal de atencion al cliente: al aceptar texto, imagen y audio, puede gestionar conversaciones donde el usuario adjunta capturas, fotos o notas de voz, manteniendo el hilo a lo largo de sesiones largas.
- Transcripcion y analisis de audio combinados: la entrada de audio permite transcribir y, en la misma pasada, resumir, clasificar o responder preguntas sobre el contenido.
- Ejecucion de agentes de multiples pasos con uso de herramientas: el modelo esta entrenado con RL sobre trazas de herramientas y multiples entornos, por lo que es adecuado para flujos de automatizacion que encadenan llamadas a APIs.
- Aplicaciones de seguridad ofensiva/defensiva asistida: el RL incluye tareas de ciberseguridad, lo que permite usar el modelo para analisis de vulnerabilidades y apoyo a equipos de seguridad (con las cautelas de licencia y sesgo correspondientes).
- Despliegue en hardware limitado: gracias a la cuantizacion EXL3 a 3.05 bpw, el modelo puede servirse con un consumo de memoria muy inferior al del checkpoint FP8, lo que facilita su integracion en entornos con varias GPU de gama profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card de la cuantizacion si aporta indicadores de precision de la propia cuantizacion frente a la referencia FP8:

| Metrica de cuantizacion | Valor |
|---|---|
| `lm_head` (6.0 bpw): error de Frobenius relativo | 0.486 % |
| `lm_head` (6.0 bpw): error de coseno | 2.4e-5 |
| `lm_head` (6.0 bpw): SQNR | 45.4 dB |
| Capas ocultas (3.0 bpw): error proxy tipico | 0.003–0.015 |
| Capas ocultas (3.0 bpw): peor caso observado | 0.0143 (`layers.55.experts.256.down_proj`) |

La model card indica que, antes de la publicacion, se realiza una evaluacion de perplejidad y divergencia KL sobre un conjunto reservado (20 filas x 2048 tokens) frente a la fuente FP8, con los siguientes umbrales (KPI gates): KL mediana por token < 0.03, ratio de perplejidad < 1.06, KL en tokens con alta confianza < 0.005 y error de Frobenius relativo < 4 %. Los resultados de esta verificacion se publicaran, segun el autor, en la propia pagina del repositorio, pero no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- La model card de la cuantizacion indica que se necesitan aproximadamente 371 GB de disco o VRAM repartidos entre GPU para los pesos completos, con carga incremental de shards. Este dato procede textualmente de la model card y resulta llamativo frente al tamano de repositorio reportado (8,7 GB), por lo que conviene verificar el conjunto real de shards antes de planificar el despliegue.
- GPU empleadas para producir la cuantizacion: 8 x NVIDIA RTX PRO 6000 de 96 GB (entorno Verda FIN-03), con un tiempo de pared de unas 7 horas (unas 6 h de captura/cuantizacion y unos 40 min de compilacion final de shards).
- Compatibilidad con GPU de consumo: no disponible. No se documenta si el modelo completo cabe en una unica GPU de consumo (por ejemplo, RTX 4090 de 24 GB); dado el tamano de pesos declarado, no es probable que quepa en una sola unidad de 24 GB.
- Motor de inferencia obligatorio: exllamav3 (ExLlamaV3) version 0.3 o superior, con soporte para `modeling_mimo_v2.py`, incluido en el propio repositorio via `remote_code`.
- Otros runners (vLLM, llama.cpp, Ollama, TGI): no disponibles para este formato EXL3; el repositorio esta orientado especificamente a exllamav3.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion disponible no permite comparar con modelos de terceros con datos verificables (parametros, contexto y rendimiento). A modo de referencia interna, se compara la cuantizacion con su modelo de origen:

| Aspecto | EXL3 3.05 bpw (este repo) | XiaomiMiMo/MiMo-V2.6-Pro-RL (FP8) |
|---|---|---|
| Precision de pesos | EXL3, 3.05 bpw de media (head a 6.00 bpw; capas criticas a 3.5 bpw) | FP8 |
| Espacio de pesos | Repositorio reportado de 8,7 GB; la model card cita ~371 GB para los pesos completos | Origen de la cuantizacion; tamano no detallado |
| Contexto | 1M tokens | 1M tokens |
| Idiomas | en, zh | en, zh |
| Licencia | MIT | MIT |
| Motor de inferencia | exllamav3 (EXL3) | transformers / FP8 |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de precision por cuantizacion: la reduccion a 3.05 bpw puede degradar tareas sensibles. La propia model card fija umbrales de calidad (KL mediana < 0.03, ratio de perplejidad < 1.06), pero los resultados de la verificacion no estaban publicados en la informacion disponible; conviene comprobarlos antes de usarlo en produccion.
- Discrepancia de tamano sin resolver: el repositorio reporta 8,7 GB mientras que la model card cita ~371 GB para los pesos completos. Este desajuste debe verificarse para no asumir un consumo de memoria incorrecto.
- Idiomas limitados: la model card solo declara ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: es un modelo generativo de gran tamano; no se aportan datos especificos de tasas de alucinacion, por lo que se aplican las precauciones habituales, especialmente en contexto largo.
- Sesgos conocidos: no se documentan sesgos concretos en la informacion disponible.
- Restricciones de licencia: la licencia es MIT, lo que en principio permite uso comercial; sin embargo, deben respetarse las condiciones de la libreria exllamav3 y del `remote_code` incluido, y el autor no detalla condiciones adicionales.
- Dependencia de un motor concreto: el formato EXL3 exige exllamav3 >= 0.3 con soporte para `modeling_mimo_v2.py`; no es portable directamente a otros runners sin reconversion.
- Caveat de produccion: al ser una cuantizacion de terceros, la trazabilidad y el soporte dependen del autor del repositorio (doth4580), no de Xiaomi.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/doth4580/MiMo-V2.6-Pro-RL-EXL3-3.05bpw-hq
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Blog de la serie MiMo-V2.6: https://mimo.xiaomi.com/mimo-v2-6
- Informe tecnico (PDF): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL/blob/main/MiMo_V2_6_technical_report.pdf
- Plataforma API de Xiaomi MiMo: https://platform.xiaomimimo.com
- Xiaomi MiMo Studio: https://aistudio.xiaomimimo.com
- Xiaomi MiMo Desktop: https://mimo.xiaomimimo.com/desktop/
- Herramienta de cuantizacion exllamav3: https://github.com/turboderp-org/exllamav3
- Discord de la comunidad: https://discord.gg/kKC2kNnQEX
- Telegram de la comunidad: https://t.me/+3T-I0pekOVIyNDBl
- Reddit oficial: https://www.reddit.com/r/XiaomiMiMo_Official/
