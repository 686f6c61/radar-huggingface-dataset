# rupp15/fine-print-gguf

## Resumen

Fine Print es un ajuste fino de Qwen2.5-3B-Instruct orientado a la extraccion estructurada de clausulas relevantes en terminos de servicio y politicas de privacidad. El modelo recibe un fragmento de texto legal y devuelve JSON con la categoria (24 posibles), la severidad (good / neutral / bad / blocker), una explicacion en ingles sencillo y la cita literal exacta del fragmento. Lo desarrolla el usuario rupp15 y se distribuye como GGUF cuantizado en Q4_K_M (1,93 GB) para inferencia con llama.cpp.

La relevancia practica del modelo esta en su tamano: con 3.085.938.688 parametros y un contexto heredado de la familia Qwen2.5, ofrece un rendimiento en deteccion y clasificacion de clausulas muy cercano al modelo en precision completa sobre GPU, pero ejecutable en hardware de consumo. En el subconjunto test-500 de empresas no vistas durante el entrenamiento, la version Q4_K_M alcanza 0,835 de precision de deteccion, 0,910 de recall, 0,652 de macro-F1 en categoria y 0,857 de exactitud en severidad, con un 99,5% de citas encontradas literalmente en el texto de entrada.

El modelo no es asesoramiento legal y sus calificaciones son estimaciones generadas automaticamente, no las valoraciones humanas de ToS;DR. Su licencia derivada de Qwen Research License restringe el uso a fines no comerciales, lo que condiciona cualquier despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado, 1,93 GB) |
| Idiomas soportados | en |
| Licencia | qwen-research (Qwen Research License Agreement, solo uso no comercial) |
| Formato de pesos | GGUF (convertido con llama.cpp desde el modelo fusionado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only de 3.085.938.688 parametros. Sobre esa base se entreno un adaptador QLoRA con rango 16 durante 2 epocas sobre aproximadamente 38.000 fragmentos de puntos de ToS;DR revisados por humanos. El adaptador se fusiono en los pesos del modelo base, se convirtio a GGUF y se cuantizo a Q4_K_M con llama.cpp. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni si hubo fases adicionales de RLHF o DPO mas alla del ajuste supervisado con QLoRA.

La innovacion tecnica destacable no esta en la arquitectura sino en el protocolo de inferencia: el modelo espera un prompt exacto definido en `src/fineprint/prompt.py` y aplica un umbral de respuesta vacia. Tras la secuencia `{"flags":` se comparan las probabilidades de `" []"` frente a `' [{"'`; si P(vacio) es mayor o igual a 0,9 se devuelve `{"flags": []}` y, en caso contrario, se continua con decodificacion greedy con penalizacion por repeticion de 1,05 sobre todo el contexto. La implementacion de referencia esta en `src/fineprint/inference/gguf.py` con llama-cpp-python 0.3.36.

## Capacidades

- Extraccion estructurada de clausulas legales en JSON con cuatro campos: categoria, severidad, explicacion en lenguaje sencillo y cita literal.
- Clasificacion en 24 categorias de clausulas de terminos de servicio y politicas de privacidad.
- Asignacion de severidad en cuatro niveles: good, neutral, bad y blocker.
- Deteccion de presencia o ausencia de clausulas relevantes mediante el mecanismo de umbral de respuesta vacia.
- Generacion de citas literales verificables: 99,5% de coincidencia verbatim en la evaluacion del archivo Q4_K_M.
- Generacion de texto conversacional heredada del modelo base Qwen2.5-3B-Instruct, aunque el ajuste esta especializado en la tarea legal.
- Soporte unicamente de ingles; no se declaran capacidades multilingues.
- No se declaran capacidades de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Revision automatizada de terminos de servicio en herramientas de consumo: el modelo procesa fragmentos de contratos y devuelve las clausulas problemáticas con severidad, permitiendo generar resumenes de riesgo para el usuario final antes de aceptar un servicio.
- Auditoria de politicas de privacidad en cumplimiento normativo: integrado en un pipeline que trocea la politica en fragmentos, el modelo etiqueta cada clausula por categoria y severidad, facilitando la revision por parte de equipos de privacidad.
- Extension de navegador o plugin que advierte de clausulas abusivas: el tamano de 1,93 GB en Q4_K_M permite ejecucion local en el dispositivo, sin enviar el texto legal a un servidor externo.
- Investigacion sobre clasificacion de contratos: como modelo pequeno y abierto (con restriccion no comercial), sirve de base para experimentos de extraccion de informacion legal y comparacion con clasificadores tipo DeBERTa.
- Generacion de resumenes legibles para no juristas: la salida incluye una explicacion en ingles sencillo junto a la cita exacta, util para portales de transparencia o comparadores de servicios.
- Preprocesado en pipelines de analisis de riesgos: la salida JSON estructurada se puede ingerir directamente en sistemas de scoring o dashboards que agreguen severidades por proveedor.
- Filtrado de fragmentos irrelevantes: el umbral de respuesta vacia permite descartar rapidamente fragmentos sin clausulas de interes, reduciendo el coste de procesamiento en documentos largos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el subconjunto test-500 de empresas no vistas durante el entrenamiento:

| Sistema | Precision deteccion | Recall deteccion | Macro-F1 categoria | Exactitud severidad | Citas literales encontradas |
|---|---|---|---|---|---|
| DeBERTa-v3-small (baseline, test completo) | 0,846 | 0,881 | 0,635 | 0,678 | – |
| Fine Print, precision completa en GPU | 0,837 | 0,910 | 0,658 | 0,845 | 99,2% |
| Este archivo (Q4_K_M, llama.cpp) | 0,835 | 0,910 | 0,652 | 0,857 | 99,5% |

Limitacion conocida declarada por el autor: en LexGLUE `unfair_tos` (contratos mas antiguos, en minusculas y con un esquema de etiquetado distinto) obtiene 0,466 de macro-F1, por debajo del baseline DeBERTa (0,559).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con el archivo Q4_K_M de 1,93 GB, incluyendo overhead de contexto y cache KV.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM; el modelo cabe en RTX 3050, RTX 4060, RTX 3060, RTX 4090, A100 y H100 sin problema.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp y llama-cpp-python (version de referencia 0.3.36). No se declaran otros runtimes en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fine Print (Q4_K_M) | 3,09 B | no disponible | Extraccion de clausulas ToS en JSON | qwen-research (no comercial) | GGUF en Hugging Face |
| DeBERTa-v3-small (baseline del autor) | no disponible | no disponible | Clasificacion de clausulas | no disponible | no disponible |
| Qwen2.5-3B-Instruct (base) | 3,09 B | no disponible | Instrucciones generales | qwen-research (no comercial) | Multiples formatos en Hugging Face |

La comparativa con alternativas especializadas en extraccion legal no esta disponible en la informacion proporcionada. El unico punto de comparacion cuantitativo publicado es el clasificador DeBERTa-v3-small, que supera a Fine Print en precision de deteccion (0,846 frente a 0,835) pero queda por debajo en recall (0,881 frente a 0,910), macro-F1 de categoria (0,635 frente a 0,652) y exactitud de severidad (0,678 frente a 0,857).

## Limitaciones y advertencias

- No es asesoramiento legal: las salidas son estimaciones generadas automaticamente y no sustituyen la revision de un profesional.
- Las calificaciones de severidad no son las valoraciones humanas de ToS;DR, sino inferencias del modelo.
- Rendimiento degradado en dominios distintos: en LexGLUE `unfair_tos` cae a 0,466 de macro-F1, por debajo del baseline DeBERTa (0,559), lo que indica poca generalizacion a contratos antiguos con otro esquema de etiquetado.
- Solo soporta ingles; no se declaran capacidades multilingues.
- Licencia Qwen Research License: uso exclusivamente no comercial. Cualquier despliegue comercial requiere autorizacion adicional de Alibaba Cloud.
- El modelo exige un prompt exacto y un protocolo de umbral de respuesta vacia definidos en el proyecto; usarlo con otro prompt puede degradar la calidad de la salida.
- Riesgo de alucinacion en la generacion de citas: aunque el 99,5% se encontraron literalmente en la evaluacion, conviene verificar las citas contra el texto original en produccion.
- Sesgos potenciales derivados de los datos de ToS;DR (CC BY-SA 3.0), que cubren un conjunto limitado de empresas y servicios.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rupp15/fine-print-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- ToS;DR (datos de entrenamiento): https://tosdr.org
- Fine Print Space (demo referenciada en la model card): no disponible como URL directa en la informacion proporcionada
- Codigo de referencia (`src/fineprint/prompt.py`, `src/fineprint/inference/gguf.py`): no disponible como URL directa en la informacion proporcionada
- llama.cpp: no disponible como URL directa en la informacion proporcionada
- llama-cpp-python 0.3.36: no disponible como URL directa en la informacion proporcionada
