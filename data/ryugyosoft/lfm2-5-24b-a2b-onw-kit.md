# ryugyosoft/LFM2.5-24B-A2B-onw-kit

## Resumen

`ryugyosoft/LFM2.5-24B-A2B-onw-kit` no es un modelo, sino un kit de conversión de pocos kilobytes (un único `kit.json`) que permite ejecutar el modelo `LiquidAI/LFM2.5-24B-A2B` de Liquid AI sobre la NPU de Intel en equipos Lunar Lake o posteriores, mediante la herramienta onw ("俺のNPUがこんなに動くわけない") en versión 3.3.0 o superior. El repositorio no distribuye pesos ni tokenizador: onw descarga el modelo original desde Hugging Face en el equipo del usuario y lo transforma in situ a un formato cuantizado NF4 por canal que la NPU puede ejecutar.

El modelo base es un transformer de mezcla de expertos (MoE) de 24 000 millones de parámetros totales que activa aproximadamente 2000 millones por token (4 de 64 expertos), con una ventana de contexto de 131 072 tokens, un vocabulario ampliado a 128 000 tokens y un preentrenamiento de aproximadamente 33 billones de tokens. Fue publicado por Liquid AI el 13 de octubre de 2026 como el mayor miembro de la familia LFM2.5, orientado a agentes de razonamiento que funcionan en local con tool calling y razonamiento multi-paso.

La relevancia del kit es que traslada ese modelo a hardware de consumo sin GPU dedicada: tras la conversión ocupa unos 12 GB en disco y rinde del orden de 20 tok/s de generación y 400 tok/s de prefill en un Panther Lake (Core Ultra X7 358H con 64 GB). Es, por tanto, una vía práctica para desplegar un MoE de 24B en portátiles con NPU Intel, con la advertencia de que el resultado convertido queda sujeto a la LFM Open License v1.0 y no a la Apache-2.0 del kit.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, 64 expertos con enrutado de 4 por token; el repositorio en sí es un kit de conversión, no un modelo |
| Parámetros totales | 24 000 millones (modelo base) |
| Parámetros activos | ~2000 millones por token (4 de 64 expertos) |
| Longitud de contexto | 131 072 tokens (modelo base) |
| Tipos de cuantización | NF4 por canal en expertos y en el resto de capas, generada localmente; el kit no distribuye pesos |
| Idiomas soportados | no disponible (la model card solo documenta una evaluación de fidelidad en japonés) |
| Licencia | Kit: Apache-2.0. Modelo base y resultado convertido: LFM Open License v1.0 |
| Formato de pesos | El kit solo contiene `kit.json`; la conversión produce pesos en el formato de onw para NPU Intel (OpenVINO) |
| Vocabulario | 128 000 tokens |
| Tokens de preentrenamiento | ~33 billones (33T), frente a ~17T del predecesor LFM2-24B-A2B |
| Hardware objetivo | NPU Intel Lunar Lake o posterior, con onw >= 3.3.0 |
| Tamaño tras conversión | ~12 GB en disco (~11,5 GB corresponden a expertos) |
| Descargas / likes en Hugging Face | 0 / 0 (a fecha de creación del repositorio, 24 de octubre de 2026) |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El modelo base es un MoE con 64 expertos del que se activan 4 por token, lo que da 24B de parámetros almacenados y unos 2B de cómputo por token. Respecto a LFM2-24B-A2B, LFM2.5 duplica el vocabulario hasta 128 000 tokens, amplía el contexto hasta 131 072 tokens y escala el preentrenamiento de ~17T a ~33T tokens. Liquid AI lo describe como modelo de razonamiento orientado a agentes; en la información disponible no se detallan la composición exacta del dataset ni las etapas de postentrenamiento (RLHF/DPO), que quedan como "no disponible".

La aportación técnica del kit está en la conversión: pesos en NF4 por canal tanto en las matrices de expertos como en el resto de capas, lo que según el autor se aproxima más al modelo original que el formato INT4 previo de onw (perplejidad léxica en japonés, medida como log-verosimilitud negativa media del siguiente token: 1,569 en bf16 original, 1,637 con NF4 en NPU y 1,715 con INT4). Además, el prompt se calcula agrupando tokens por experto en bloques de 128 tokens (grafo "mixer" más producto matricial por experto) y las RMSNorm dividen cada fila por su máximo antes de operar, para evitar que la media cuadrática caiga en valores subnormales y se colapse a cero en fp16 sobre la NPU.

## Capacidades

- Generación de texto y razonamiento explícito: el modelo base se comercializa como modelo de razonamiento, con capacidad de resolver tareas multi-paso antes de responder.
- Tool calling / function calling, orientado a agentes que invocan herramientas externas.
- Razonamiento agéntico multi-paso: la documentación de Liquid AI lo posiciona para "agentes rápidos y privados en el dispositivo".
- Ejecución totalmente local sobre NPU Intel, sin envío de datos a servidores externos.
- Ventana de 131 072 tokens, apta para documentos largos y conversaciones multi-turno extensas.
- Capacidades multilingües: el vocabulario de 128 000 tokens sugiere cobertura amplia, pero no se ha publicado lista oficial de idiomas; la única evaluación documentada es en japonés.
- Modo de razonamiento (thinking): no se detalla en la información disponible si es conmutable ni cómo se activa.
- No se documentan capacidades de visión ni de audio en la información disponible.

## Casos de uso

- Agentes locales de atención al cliente: el modelo puede mantener conversaciones multi-turno apoyadas en los 131 072 tokens de contexto y llamar a herramientas internas (consulta de pedidos, estado de cuenta) sin que los datos salgan del portátil del empleado.
- Asistentes personales offline para trabajo de campo: en entornos sin conectividad (obra, clínica, auditoría), un portátil con NPU Lunar Lake o Panther Lake ejecuta el modelo convertido en ~12 GB y responde a consultas sobre documentación local.
- Procesamiento de documentos largos en sectores regulados: contratos, informes o historiales de hasta 131K tokens se pueden resumir y extraer campos de forma local, evitando transferencias a la nube que exigirían acuerdos de tratamiento de datos.
- Copiloto de código en el puesto de trabajo: con tool calling puede invocar herramientas de análisis estático o de ejecución de tests en un flujo agéntico, a ~20 tok/s, suficiente para completado asistido interactivo.
- Automatización de tareas multi-paso en flotas corporativas: al desplegarse sobre onw y NPU Intel, se puede distribuir a parques de portátiles Core Ultra sin aprovisionar GPU, con una conversión que consume entre 30 y 60 minutos por equipo.
- Evaluación y prototipado de MoE sin GPU: investigadores pueden medir comportamiento de un MoE 24B/2B en hardware de consumo y comparar la fidelidad de la cuantización NF4 frente a INT4 usando la métrica de log-verosimilitud documentada.
- Clasificación y extracción sobre corpus sensible: resúmenes, etiquetado y respuesta extractiva sobre datos internos que no pueden enviarse a APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card del kit solo aporta métricas de fidelidad de la conversión y de rendimiento en hardware concreto:

| Métrica | Valor |
|---|---|
| Log-verosimilitud negativa media (japonés, bf16 original) | 1,569 |
| Log-verosimilitud negativa media (japonés, NF4 en NPU) | 1,637 |
| Log-verosimilitud negativa media (japonés, INT4 previo de onw) | 1,715 |
| Generación (Panther Lake, Core Ultra X7 358H, 64 GB) | ~20 tok/s |
| Prefill de prompt de ~1200 tokens | ~400 tok/s |
| Memoria en ejecución | ~12,6 GB (11,5 GB en expertos) |
| Carga inicial (compilación para NPU) | ~2 minutos (posteriores, decenas de segundos) |

Según la información de prensa disponible, Liquid AI afirma que LFM2.5-24B-A2B supera a Qwen3.6-35B-A3B en el benchmark LiveClaw; no se proporcionan cifras concretas de dicha comparación. Un artículo secundario cita 184 tok/s en dispositivo para el modelo base, sin especificar el hardware ni la metodología, por lo que no se puede contrastar con los ~20 tok/s del kit en NPU.

## Requisitos de hardware

- NPU Intel de Lunar Lake o posterior; la model card advierte además que los pesos NF4 no se pueden calcular en la NPU 3720, por lo que conviene verificar la compatibilidad real del equipo antes de iniciar la conversión.
- onw versión 3.3.0 o superior, con la pestaña "Modelo" para lanzar la descarga y conversión.
- Espacio en disco: ~48 GB para la descarga del modelo original, ~60 GB de pico temporal durante la conversión y ~12 GB para el resultado final.
- Memoria: ~5 GB de RAM durante la conversión (que usa CPU) y ~12,6 GB en ejecución, de los cuales 11,5 GB son expertos.
- GPU dedicada: no es necesaria ni la utiliza esta vía; el kit está diseñado exclusivamente para la NPU. El rendimiento en CPU o en GPU a través de este kit es "no disponible".
- Opciones de despliegue: onw sobre NPU Intel. El kit no contempla vLLM, llama.cpp, Ollama ni TGI, y la información disponible no detalla alternativas de despliegue para el modelo base.
- Rendimiento de referencia en Panther Lake (Core Ultra X7 358H, 64 GB): ~20 tok/s de generación, ~400 tok/s de prefill con prompts de ~1200 tokens y ~2 minutos de carga inicial por la compilación para NPU.
- Tiempo de conversión: ~9 minutos de cómputo en Panther Lake, ~33 minutos de proceso completo; el rango general indicado es de 30 a 60 minutos.

## Comparativa con modelos similares

| Modelo | Parámetros (total/activos) | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-24B-A2B (modelo base de este kit) | 24B / ~2B | 131 072 tokens | LFM Open License v1.0 | ~33T tokens de preentrenamiento; vocabulario de 128K; objetivo de agentes en dispositivo |
| LFM2-24B-A2B (predecesor) | 24B / ~2B | no disponible | no disponible | ~17T tokens de preentrenamiento; contexto y vocabulario inferiores según la comparación publicada por Liquid AI |
| Qwen3.6-35B-A3B | 35B / ~3B | no disponible | no disponible | Liquid AI afirma que LFM2.5-24B-A2B lo supera en LiveClaw, sin cifras publicadas |
| `ryugyosoft/LFM2.5-24B-A2B-onw-kit` (este repositorio) | No es un modelo: kit de conversión | No aplica | Apache-2.0 (kit) | Solo `kit.json`; requiere onw >= 3.3.0 y NPU Intel; el resultado convertido hereda la LFM Open License v1.0 |

## Limitaciones y advertencias

- El repositorio no contiene pesos ni tokenizador: sin onw 3.3.0 o superior y una NPU Intel compatible, el kit no tiene utilidad por sí solo.
- La conversión exige ~60 GB de disco libres en el pico y una descarga de ~48 GB, lo que puede ser inviable en equipos con almacenamiento ajustado.
- La licencia del resultado convertido es la LFM Open License v1.0, no la Apache-2.0 del kit: la model card indica que el uso comercial queda excluido para empresas con ingresos anuales de 10 millones de dólares o más. Es un punto crítico para despliegues corporativos.
- La cuantización introduce degradación medible: la log-verosimilitud negativa en japonés pasa de 1,569 (bf16) a 1,637 (NF4 en NPU), aunque mejora respecto al INT4 previo (1,715).
- La model card señala que los pesos NF4 no se pueden calcular en la NPU 3720, lo que limita la compatibilidad real dentro del propio rango Lunar Lake; hay que validar el modelo de NPU antes de planificar el despliegue.
- No se ha publicado lista oficial de idiomas soportados ni evaluaciones por idioma más allá del japonés; el rendimiento en castellano no está documentado.
- El modelo base es de razonamiento y generación abierta, por lo que el riesgo de alucinación es inherente; no se documentan evaluaciones de factualidad ni de sesgos en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, está mantenido por un autor individual y no incluye benchmarks propios: la validación corre por cuenta del usuario.
- El rendimiento de ~20 tok/s corresponde a un Panther Lake concreto (Core Ultra X7 358H, 64 GB); en equipos de gama inferior las cifras pueden ser sensiblemente peores y no se han publicado.
- No se especifican la composición del dataset de entrenamiento ni las etapas de alineación (RLHF/DPO) del modelo base, lo que dificulta evaluar sesgos conocidos.

## Enlaces

- Repositorio del kit en Hugging Face: https://huggingface.co/ryugyosoft/LFM2.5-24B-A2B-onw-kit
- Modelo base en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Modelo base (variante Base): https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-Base
- Herramienta onw: https://huggingface.co/ryugyosoft/onw
- Guía de conversión manual de LFM en onw: https://huggingface.co/ryugyosoft/onw/blob/main/CONVERT_LFM.md
- Documentación de Liquid AI del modelo: https://docs.liquid.ai/lfm/models/lfm25-24b-a2b
- Blog de Liquid AI: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Guía secundaria sobre el modelo: https://kalinga.ai/lfm2-5-24b-a2b-ai-agent-guide/
- Artículo secundario sobre rendimiento en dispositivo: https://trendintech.com/liquid-ai-lfm2-5-24b-a2b-on-device-agents-2026/
