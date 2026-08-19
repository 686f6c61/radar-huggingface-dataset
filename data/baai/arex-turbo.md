# BAAI/AREX-Turbo

## Resumen

AREX-Turbo es un agente de investigacion profunda (deep research) desarrollado por la Academia de Inteligencia Artificial de Pekin (BAAI). Forma parte de la familia AREX, cuyo objetivo es construir agentes capaces de realizar tareas de larga duracion en las que deben buscar fuentes, ensamblar respuestas candidatas, verificar multiples restricciones y revisar su plan de investigacion cuando la evidencia disponible es incompleta. El modelo sigue un marco de auto-mejora recursiva compuesto por un bucle interno de investigacion y un bucle externo de auto-mejora, con gestion autonoma del contexto.

Se trata de un modelo denso de 4.000 millones de parametros construido sobre Qwen3.5-4B, con una ventana de contexto de 262.144 tokens. Su posicionamiento es el de una alternativa compacta y de menor coste de despliegue frente a AREX-Base (122B), manteniendo las capacidades nucleares de verificacion, busqueda y gestion de contexto. Publicado bajo licencia Apache 2.0, esta disponible en Hugging Face y ModelScope, y cuenta con una demo en vivo.

La relevancia actual de AREX-Turbo radica en que democratiza los agentes de investigacion profunda: un modelo de 4B con capacidades de agente, tool use y razonamiento multi-paso puede ejecutarse en hardware de consumo, lo que reduce la barrera de entrada para desarrolladores e investigadores que necesitan automatizar tareas de busqueda y sintesis de informacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense transformer (basado en Qwen3.5-4B) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (modelo dense) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No especificados en la informacion disponible |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AREX-Turbo es un modelo denso basado en la arquitectura de Qwen3.5-4B, que a su vez es un transformer autoregresivo con atencion completa. La innovacion principal no reside en la arquitectura base, sino en el marco de agente recursivo que lo envuelve. El sistema organiza la investigacion en dos bucles interactivos:

1. **Bucle interno de investigacion**: el agente busca, lee, integra evidencia, realiza un seguimiento de candidatos y produce una respuesta provisional con evidencia de apoyo y una puntuacion de confianza a nivel de respuesta.
2. **Bucle externo de auto-mejora**: el agente compara la respuesta provisional con las restricciones originales. Las respuestas de alta confianza se aceptan; las trayectorias recuperables se refinan en torno a afirmaciones no resueltas; las trayectorias no informativas pueden reiniciarse.
3. **Actualizacion autonoma del contexto**: el modelo invoca la herramienta `update_context` para refrescar su estado de investigacion en torno a hallazgos verificados, candidatos actuales y rechazados, restricciones no resueltas, validez de fuentes y el siguiente plan de investigacion.

No se han proporcionado datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO en la informacion disponible. El modelo se presenta como un fine-tuning del backbone Qwen3.5-4B, orientado a tareas de agente de investigacion.

## Capacidades

- **Agente de investigacion profunda**: ejecuta tareas de larga duracion que requieren busqueda en multiples fuentes, integracion de evidencia y construccion de respuestas.
- **Verificacion guiada por restricciones**: convierte restricciones de respuesta no resueltas en busquedas de seguimiento enfocadas.
- **Auto-mejora recursiva**: evalua respuestas provisionales y decide si aceptarlas, refinarlas o reiniciar la trayectoria de investigacion.
- **Gestion autonoma del contexto**: mantiene hallazgos verificados, identificadores de fuentes, candidatos rechazados, restricciones abiertas y el siguiente plan de investigacion mediante la herramienta `update_context`.
- **Tool use de larga duracion**: soporta busqueda multi-round, navegacion web, integracion de evidencia y construccion de respuestas a traves de las herramientas `search`, `visit`, `update_context` y `finish`.
- **Razonamiento multi-paso**: capaz de descomponer problemas complejos en pasos verificables y de revisar su plan cuando la evidencia es insuficiente.
- **Contexto largo**: ventana de 262.144 tokens, adecuada para tareas que requieren procesar grandes volumenes de documentos y mantener un estado de investigacion extenso.

## Casos de uso

- **Investigacion de mercado automatizada**: el agente puede buscar informacion sobre competidores, tendencias y precios en multiples fuentes, verificar la coherencia de los datos y generar un informe estructurado con referencias. Su ventana de 262K tokens permite procesar decenas de paginas web en una sola pasada.
- **Revision de literatura academica**: para investigadores que necesitan sintetizar hallazgos de multiples articulos, AREX-Turbo puede buscar en bases de datos, extraer afirmaciones clave, verificar que las citas sean correctas y producir una revision con puntuaciones de confianza.
- **Soporte tecnico con busqueda en documentacion**: en lugar de responder desde un conocimiento fijo, el agente puede consultar documentacion oficial, foros y repositorios, verificar que la respuesta cumple las restricciones del usuario y proporcionar enlaces a las fuentes.
- **Analisis de cumplimiento normativo**: para empresas que necesitan verificar si un producto o proceso cumple con regulaciones especificas, el agente puede buscar textos legales, comparar clausulas y generar un informe de conformidad con indicacion de las fuentes consultadas.
- **Generacion de informes periodisticos o de inteligencia**: el agente puede recopilar informacion de multiples medios, contrastar versiones, identificar inconsistencias y producir un resumen con nivel de confianza por afirmacion.
- **Agentes de investigacion en entornos con recursos limitados**: al ser un modelo de 4B, puede desplegarse en una GPU de consumo (por ejemplo, RTX 4090 con cuantizacion) para tareas de investigacion interna sin depender de APIs de pago, manteniendo una calidad razonable en tareas de busqueda y verificacion.
- **Automatizacion de due diligence**: para evaluar empresas o proyectos, el agente puede buscar registros publicos, noticias y estados financieros, verificar restricciones como "solvencia" o "historial legal" y producir un dossier con evidencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluacion a traves de una interfaz unificada de agente de busqueda de larga duracion con las herramientas `search`, `visit`, `update_context` y `finish`, y cita los benchmarks BrowseComp, GAIA, xbench-2510, DeepSearch QA, WideSearch-en y HLE con herramientas. Sin embargo, la tabla de resultados proporcionada en la model card esta incompleta y no se han incluido los valores numericos en la informacion facilitada. Por tanto, no es posible presentar una tabla comparativa con datos verificados.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 4.539 millones de parametros, en precision FP16 se requieren aproximadamente 9 GB de VRAM solo para los pesos. Con cuantizacion de 8 bits, alrededor de 4,5 GB; con 4 bits, unos 2,5 GB. Estos valores son estimaciones teoricas y no estan confirmados por el autor.
- **GPU recomendadas**: una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede ejecutar el modelo en FP16 sin problemas. GPUs con 8-12 GB de VRAM (como RTX 4070 o RTX 3060) pueden usar cuantizacion de 8 o 4 bits. Para despliegue en produccion, una A100 (40/80 GB) o H100 ofrecen margen para el contexto largo y el uso de herramientas.
- **Compatibilidad con consumer GPU**: si, el modelo cabe en GPUs de consumo con cuantizacion. La ventana de contexto de 262K tokens, sin embargo, requiere gestion de memoria KV cache considerable; para contextos muy largos se recomienda al menos 24 GB de VRAM.
- **Opciones de despliegue**: al ser compatible con la libreria Transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). Tambien es posible usar Ollama si se genera un archivo Modelfile. No se han publicado configuraciones oficiales de despliegue.
- **Latencia y throughput**: no se han proporcionado datos oficiales. Como referencia, un modelo dense de 4B en una RTX 4090 puede generar entre 50 y 100 tokens por segundo en FP16, aunque el uso de herramientas y el contexto largo reduciran el rendimiento efectivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| AREX-Turbo | 4B (dense) | 262K | Apache 2.0 | Agente de deep research recursivo |
| AREX-Base | 122B-A10B (MoE) | 256K | Apache 2.0 | Agente de deep research de alta capacidad |
| Qwen3.5-4B (base) | 4B | 128K (estimado) | Apache 2.0 | Modelo base sin framework de agente |

La comparativa directa con otros agentes de deep research open source (como OpenDeepResearch o DeepResearch de otros laboratorios) no esta disponible en la informacion proporcionada. AREX-Turbo se diferencia de su modelo base por el marco de agente recursivo, la gestion autonoma de contexto y el entrenamiento especifico para tool use y verificacion. Frente a AREX-Base, ofrece menor capacidad pero un coste de despliegue significativamente menor, manteniendo el mismo marco metodologico.

## Limitaciones y advertencias

- **Idioma**: la model card indica soporte solo para ingles. No se garantiza un rendimiento adecuado en otros idiomas, lo que limita su uso en entornos multilingues.
- **Alucinacion**: como cualquier modelo generativo, puede producir afirmaciones falsas o inventar fuentes. El marco de verificacion mitiga este riesgo, pero no lo elimina por completo; es necesario revisar las respuestas en aplicaciones criticas.
- **Dependencia de herramientas externas**: el rendimiento depende de la disponibilidad y calidad de las herramientas de busqueda y navegacion. Sin acceso a internet o a APIs de busqueda, el agente no puede realizar su funcion principal.
- **Contexto largo**: aunque la ventana es de 262K tokens, en la practica el rendimiento puede degradarse en contextos muy extensos, y la memoria KV cache requerida puede superar la capacidad de GPUs de consumo.
- **Licencia**: Apache 2.0 permite uso comercial y modificacion, pero es recomendable revisar las condiciones del modelo base Qwen3.5-4B y de las herramientas integradas.
- **Datos de entrenamiento**: no se han publicado detalles sobre el dataset de entrenamiento, lo que dificulta evaluar posibles sesgos o limitaciones de conocimiento.
- **Produccion**: al ser un modelo relativamente reciente (julio de 2026), su ecosistema de herramientas y practicas recomendadas aun esta en desarrollo. Se recomienda validar exhaustivamente en el caso de uso concreto antes de desplegarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/BAAI/AREX-Turbo
- ModelScope: https://modelscope.cn/models/BAAI/AREX-Turbo
- Paper (arXiv): https://arxiv.org/abs/2607.21461
- Homepage del proyecto: https://vectorspacelab.github.io/arex-model/
- Demo en vivo: https://arex-research.com/
- Modelo AREX-Base (hermano mayor): https://huggingface.co/BAAI/AREX-Base
