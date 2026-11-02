# Muggle2026/Step-5-Preview

## Resumen

Step 5 Preview es el modelo insignia de StepFun orientado a trabajo agéntico, publicado en HuggingFace bajo el identificador `Muggle2026/Step-5-Preview` (repositorio espejo del original `stepfun-ai/Step-5-Preview`). Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso con 600.000 millones de parámetros totales y 27.000 millones de parámetros activos por token, disenado para tareas de ingenieria de software a nivel de repositorio, ejecucion agéntica de horizonte largo y trabajo de conocimiento profesional, con un enfasis declarado en el dominio financiero.

El modelo acepta entradas de texto e imagen y genera texto, con una ventana de contexto de hasta 1 millon de tokens y una salida maxima tambien de hasta 1 millon de tokens. Esta orientado a flujos que requieren llamadas repetidas a herramientas, ejecucion, verificacion y revision sobre informacion de contexto largo, lo que lo situa en la categoria de modelos frontera para agentes autonomos.

Su relevancia actual radica en la combinacion de contexto extremadamente largo (1M tokens), capacidades multimodales de entrada y un perfil MoE que reduce el coste de inferencia al activar solo 27B de los 600B parametros. El repositorio consultado contiene pesos en formato safetensors con cuantizacion FP8 y ocupa 650,3 GB, lo que refleja el gran tamano del checkpoint completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) disperso |
| Parametros totales | 600B (604.339.504.832 segun safetensors) |
| Parametros activos | 27B |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Salida maxima | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (checkpoint publicado); BF16 disponible en repo separado |
| Idiomas soportados | No disponible |
| Licencia | other (ver LICENSE.txt de stepfun-ai) |
| Formato de pesos | safetensors |
| Modalidad de entrada | Texto e imagen |
| Modalidad de salida | Texto |
| Tamano del repositorio | 650,3 GB |

## Arquitectura y entrenamiento

Step 5 Preview emplea una arquitectura de Mixture-of-Experts (MoE) disperso con 600B parametros totales y 27B parametros activos por token. La model card no detalla el numero de expertos, la estrategia de enrutamiento ni la composicion exacta de las capas, por lo que esos datos no estan disponibles. El modelo acepta texto e imagen como entrada y produce texto como salida, lo que implica un codificador multimodal integrado del que no se especifican detalles tecnicos.

No se ha publicado en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. La model card menciona el uso de decodificacion especulativa en los comandos de serving (junto con soporte de razonamiento y tool-call en los builds de vLLM y SGLang), lo que constituye una innovacion tecnica destacable para acelerar la inferencia. Tambien se indica un ajuste de razonamiento configurable ("High" reasoning setting) empleado en las evaluaciones, lo que sugiere un modo de pensamiento extendido, aunque no se detalla su implementacion.

## Capacidades

- Generacion de texto y razonamiento de horizonte largo sobre contextos de hasta 1M tokens.
- Ingenieria de software a nivel de repositorio: navegacion de codebases grandes, coordinacion de cambios entre multiples ficheros, ejecucion y verificacion de codigo, e iteracion sobre resultados.
- Desarrollo frontend y visual, asi como programacion para dispositivos.
- Ejecucion agentica de horizonte largo: llamadas repetidas a herramientas, ejecucion, verificacion y revision manteniendo informacion de contexto largo a lo largo del flujo.
- Uso de herramientas (tool calling / function calling) integrado en el serving via vLLM y SGLang.
- Comprension multimodal de entrada: analisis de documentos largos, graficos, capturas de pantalla, imagenes y video.
- Trabajo de conocimiento profesional: investigacion combinada con comprension multimodal y uso de herramientas para producir informes y analisis estructurados.
- Razonamiento cuantitativo y analisis de datos financieros y documentos de soporte (fortaleza declarada en finanzas).
- Modo de razonamiento configurable (setting "High" empleado en evaluaciones).
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Ingenieria de software a nivel de repositorio: el modelo puede navegar codebases de gran tamano, coordinar cambios en multiples ficheros, ejecutar el codigo resultante y verificar los resultados, iterando hasta que las pruebas pasen. Su contexto de 1M tokens permite cargar modulos y dependencias extensas sin truncar.
- Agentes autonomos de CI/CD: integrado mediante tool calling en pipelines, el modelo puede ejecutar comandos, interpretar errores de build o test, aplicar correcciones y volver a verificar, manteniendo el estado del workflow a lo largo de muchas iteraciones.
- Analisis financiero asistido: combinando razonamiento cuantitativo con lectura de documentos financieros largos (informes anuales, estados contables) y graficos, el modelo puede producir analisis estructurados y comparativas, aprovechando su fortaleza declarada en el dominio.
- Revision de documentacion tecnica y contractual: con 1M tokens de contexto, puede procesar contratos, especificaciones o manuales completos junto con sus anexos e imagenes asociadas para extraer clausulas, resumir y senalar inconsistencias.
- Desarrollo frontend y visual: a partir de capturas de pantalla o mockups (entrada de imagen), el modelo puede generar y ajustar codigo de interfaz, verificando el resultado de forma iterativa.
- Atencion al cliente tecnica de nivel avanzado: gestion de conversaciones multi-turno con acceso a historial extenso y a herramientas internas (consulta de estado, apertura de tickets) gracias al contexto de 1M tokens y al soporte de tool calling.
- Analisis de video e imagenes para informes profesionales: extraccion de informacion de grabaciones o capturas y sintesis en informes estructurados, util en auditoria, soporte o investigacion.
- Automatizacion de tareas de investigacion y sintesis: busqueda y lectura de multiples fuentes largas, con uso de herramientas, para producir resumenes y analisis con trazabilidad.

## Benchmarks y rendimiento

La model card incluye una imagen con resultados de benchmarks (rendimiento en codigo, tareas agenticas, trabajo de conocimiento profesional y finanzas), pero los valores numericos no estan disponibles en formato textual en la informacion proporcionada. Se citan las siguientes notas metodologicas:

- Ajustes de inferencia recomendados: `temperature=1.0`, `top_p=0.95`, `top_k=0`.
- Los resultados mostrados usan el ajuste de razonamiento "High".
- Las puntuaciones GDPval-AA v2.1 se basan en resultados de Artificial Analysis a fecha de 20 de septiembre de 2026.
- Las evaluaciones DeepSWE v1.1 usan el harness SWE-agent con `temperature=1.0` y `top_p=0.95`.

No se han publicado en la informacion disponible los valores numericos de MMLU, HumanEval, GSM8K ni de los benchmarks citados (GDPval-AA v2.1, DeepSWE v1.1).

## Requisitos de hardware

- VRAM estimada: el checkpoint FP8 ocupa 650,3 GB en repositorio; el BF16 requiere aproximadamente el doble. No es desplegable en una sola GPU consumer.
- Configuraciones oficiales de despliegue:
  - vLLM FP8: un nodo B300 con 4 GPUs (TP4, TEP4 o DEP4).
  - vLLM FP8: un nodo H200 con 8 GPUs (TP8, TEP8 o DEP8).
  - vLLM BF16: un nodo B300 con 8 GPUs (TP8, TEP8 o DEP8).
  - vLLM BF16: dos nodos H200 con 16 GPUs (TP16, TEP16 o DEP16).
  - SGLang FP8: un nodo B300 con 4 GPUs (TP4/EP4) o un nodo H200 con 8 GPUs.
  - Transformers FP8: un nodo H200 con 8 GPUs (TP8/EP8) para generacion offline.
  - Transformers BF16: dos nodos H200 con 16 GPUs (TP16/EP16) para generacion offline.
- GPU consumer: no cabe en ninguna GPU consumer (RTX 4090, etc.) debido al tamano del checkpoint.
- Opciones de despliegue: vLLM, SGLang y Transformers. No se menciona soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Se requiere un build de framework que incluya soporte de Step 5 Preview, incluyendo razonamiento, tool-call y decodificacion especulativa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento numericos ni de especificaciones de modelos alternativos que permitan una comparativa rigurosa. Como referencia de categoria, Step 5 Preview se situa en el segmento de modelos MoE frontera con contexto de 1M tokens y capacidades agenticas (junto a familias como las de otros laboratorios con modelos MoE de escala similar), pero no se dispone de datos verificables para establecer la comparacion.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Step 5 Preview | 600B | 27B | 1M tokens | other | HuggingFace (FP8 y BF16), ModelScope, API |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan tasas ni mitigaciones especificas en la model card.
- Idiomas soportados: no se especifican; la ausencia de esta informacion impide garantizar calidad multilingue fuera del ingles.
- Licencia "other": es imprescindible revisar el LICENSE.txt enlazado antes de cualquier uso comercial; las condiciones no estan resumidas en la informacion disponible.
- El repositorio consultado (`Muggle2026/Step-5-Preview`) es un espejo no oficial del original `stepfun-ai/Step-5-Preview`; para produccion conviene usar el repositorio del autor original.
- Requisitos de hardware muy elevados: minimo 4 GPUs B300 o 8 GPUs H200 en FP8; imposible en hardware consumer.
- El contexto de 1M tokens no garantiza atencion efectiva a toda la ventana; no se documentan resultados de recuperacion en contextos largos.
- Los benchmarks publicados solo estan disponibles como imagen; no se pueden verificar los valores numericos.
- El ajuste de razonamiento "High" empleado en las evaluaciones puede implicar mayor latencia y coste en produccion.
- No se documentan limitaciones especificas de la entrada de video (duracion, resolucion, formato).

## Enlaces

- Repositorio HuggingFace (espejo): https://huggingface.co/Muggle2026/Step-5-Preview
- Repositorio HuggingFace original (FP8): https://huggingface.co/stepfun-ai/Step-5-Preview
- Repositorio HuggingFace original (BF16): https://huggingface.co/stepfun-ai/Step-5-Preview-BF16
- ModelScope (FP8): https://modelscope.ai/models/stepfun-ai/Step-5-Preview
- ModelScope (BF16): https://modelscope.ai/models/stepfun-ai/Step-5-Preview-BF16
- Pagina del modelo: https://www.stepfun.com/step-5-preview
- Documentacion: https://platform.stepfun.ai/docs/en/guides/models/step-5-preview
- Plataforma API: https://platform.stepfun.ai/
- Licencia: https://huggingface.co/stepfun-ai/Step-5-Preview/blob/main/LICENSE.txt
- Harness de evaluacion SWE-agent: https://github.com/SWE-agent/SWE-agent
- Artificial Analysis (fuente de GDPval-AA v2.1): https://artificialanalysis.ai/
