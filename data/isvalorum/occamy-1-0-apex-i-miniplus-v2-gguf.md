# IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2-GGUF

## Resumen

Occamy-1.0-APEX-I-MiniPlus-V2-GGUF es una cuantización GGUF del modelo base Accio-Lab/occamy-1.0, publicada por el usuario independiente IsValorum bajo el sello APEX-I. Se trata de una edición "MiniPlus", orientada a preservar una fidelidad de cuantización de clase Q5 a Q6 sin un límite fijo de tamaño de fichero, empleando una asignación tensor por tensor en lugar de una cuantización uniforme. El resultado es un artefacto de 15,3 GB que, según el autor, permite ejecutar el modelo completo con contexto de 256K en GPUs de 24 GB de VRAM.

El modelo subyacente es un MoE híbrido con atención lineal y mecanismos SSM (DeltaNet), identificado en las etiquetas como derivado de la familia Qwen3.5-MoE. Cuenta con 34.660.610.688 parámetros totales según los safetensors del modelo base, y es multimodal (image-text-to-text), con un proyector de visión incluido en el paquete GGUF en precisión Q8_0. Soporta doce idiomas declarados y se distribuye bajo licencia Apache 2.0.

Su relevancia actual radica en la combinación de tres factores: una arquitectura MoE eficiente en cómputo por token, una ventana de contexto muy extensa (256K) y una cuantización quirúrgica que busca minimizar la degradación de perplejidad frente a cuantizaciones planas. Está pensado para desarrolladores que quieran desplegar un modelo multimodal de gran contexto en hardware de consumo o en configuraciones con offload a RAM del sistema, usando llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con atención lineal, DeltaNet y SSM (etiquetada como qwen35moe); multimodal image-text-to-text |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens (según el autor, ejecutable completo en 24 GB de VRAM) |
| Tipos de cuantizacion | GGUF con cuantización personalizada APEX-I MiniPlus (fidelidad de clase Q5 a Q6, asignación tensor por tensor con imatrix); proyector de visión en Q8_0 |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer MoE híbrido que combina capas de atención lineal y mecanismos de espacio de estados (DeltaNet/SSM) con capas de atención convencional, un patrón habitual en la familia Qwen3.5-MoE. Esta hibridación reduce el coste de atención en contextos largos, lo que explica la viabilidad de una ventana de 256K tokens con un presupuesto de memoria contenido. El modelo incorpora además una torre de visión, ya que la pipeline declarada es image-text-to-text.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo base. La model card del repositorio de cuantización no documenta estos extremos. La innovación técnica destacable de esta publicación concreta no está en el entrenamiento, sino en el proceso de cuantización: el autor aplica una asignación diferenciada por tensor (mapa de cuantización "quirúrgico" auditado desde el propio GGUF), apoyada en imatrix, para preservar la precisión en las capas más sensibles. El paquete incluye el proyector de visión en Q8_0 para no degradar la ruta multimodal.

## Capacidades

- Generación de texto y razonamiento general en un modelo MoE de 34,66 B de parámetros totales.
- Procesamiento multimodal de imagen y texto (image-text-to-text) mediante el proyector de visión incluido en Q8_0.
- Ventana de contexto de 256K tokens, apta para documentos extensos y conversaciones de muchos turnos.
- Soporte multilingüe declarado en trece idiomas: inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) y con el ecosistema llama.cpp.
- Capacidad conversacional (etiqueta conversational) para diálogo multi-turno.
- Según las etiquetas del repositorio, el modelo base está orientado a razonamiento, agentes y uso de herramientas, aunque la model card de esta cuantización no detalla protocolos específicos de tool calling.

## Casos de uso

- Análisis de documentación extensa: con 256K tokens de contexto, el modelo puede ingerir manuales técnicos, expedientes o bases de código completas en una sola pasada, evitando pipelines de troceado y recuperación.
- Asistentes de atención al cliente multi-turno: la ventana larga permite mantener el historial completo de una conversación compleja sin resumir, y el soporte de trece idiomas cubre mercados internacionales desde un único despliegue.
- Procesamiento de documentos escaneados y capturas: la ruta de visión permite extraer información de imágenes y PDFs renderizados, combinándola con el texto del contexto para tareas de extracción estructurada.
- Despliegue en estaciones de trabajo con GPU de 24 GB: al caber el modelo completo con contexto largo en VRAM según el autor, es adecuado para prototipos y demos locales sin depender de infraestructura cloud.
- Investigación sobre cuantización: el mapa tensor por tensor y las comparativas de perplejidad publicadas lo convierten en un artefacto útil para estudiar el impacto de distintas estrategias de cuantización en modelos MoE multimodales.
- Inferencia con offload a RAM del sistema: el diseño está pensado para ejecución total o parcial en memoria del sistema, lo que permite usar el modelo en equipos sin GPU de gama alta, a costa de menor throughput.
- Traducción y localización multilingüe: la cobertura de idiomas europeos y asiáticos permite tareas de traducción y adaptación de contenido con un solo modelo.

## Benchmarks y rendimiento

La model card reporta una evaluación externa independiente realizada por zephel01 con llama.cpp sobre una RTX 5090, con los siguientes resultados:

| Metrica | Resultado reportado |
|---|---|
| Resolución L6 | 90,0–93,3 % |
| Throughput | ~247–251 tok/s |

El autor compara además la perplejidad en WikiText-2 de sus ediciones APEX-I frente a GSQ-RCO IQ3_S (referencia de 7,07), con mejoras porcentuales que van del 9,14 % al 15,01 % según la variante. Estas cifras corresponden a otros modelos de la familia (Qwen3.8 27B y variantes abliterated), no a este Occamy V2 en concreto, por lo que no deben atribuirse directamente a este artefacto.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo en la información disponible.

## Requisitos de hardware

- VRAM estimada: el paquete GGUF ocupa 15,3 GB, por lo que la inferencia completa requiere al menos ~16 GB de VRAM en el escenario más ajustado; el autor afirma que el modelo completo con 256K de contexto cabe en 24 GB de VRAM.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 5090 y GPUs profesionales (A100, H100) para máximo throughput. La evaluación externa citada se realizó en una RTX 5090.
- GPU de consumo: sí cabe en GPUs de 24 GB (RTX 3090/4090/5090). En GPUs de 16 GB requeriría reducir contexto o aplicar offload parcial.
- Despliegue: llama.cpp es el runtime de referencia (formato GGUF). No se documenta soporte de vLLM, TGI u Ollama en la información disponible.
- Throughput: ~247–251 tok/s reportados en RTX 5090 con llama.cpp. El autor incluye proyecciones de rendimiento para RTX 30/40/50 y benchmarks en portátiles con DDR4/DDR5, aunque los valores concretos no se detallan en la información proporcionada.
- Configuración: el autor publica una sección de configuración recomendada y un ejemplo de servidor CLI, así como parámetros de generación oficiales de Accio-Lab y empíricos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Occamy-1.0 APEX-I MiniPlus V2 (este) | 34,66 B (MoE) | 256K | Apache 2.0 | Multimodal, GGUF, cuantización quirúrgica |
| Qwen3.6-35B-A3B MTP APEX-I MiniPlus V2.1 | 35 B (MoE, 3 B activos) | no disponible | Apache 2.0 (presumible) | Misma familia de cuantización; orientado a razonamiento, agentes y tool calling |
| Qwen3.8 27B VAL-APEX-I MiniPlus V3 | 27 B (denso) | no disponible | Apache 2.0 (presumible) | Denso, 14,16 GB; referencia de perplejidad frente a IQ3_S |
| Ornith 1.5 35B-A3B APEX-I MiniPlus V2.1 | 35 B (MoE, 3 B activos) | no disponible | no disponible | Especializado en ingeniería de software y agentes de código |

Las alternativas listadas pertenecen al mismo autor de cuantizaciones y a familias distintas; no son variantes intercambiables del mismo modelo. Los datos de parámetros activos y contexto de las alternativas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización, no un modelo original: la calidad final depende del proceso APEX-I y puede diferir del modelo base en precisión, especialmente en tareas sensibles a pesos de baja magnitud.
- No se documentan datos de entrenamiento, composición del dataset ni proceso de alineación del modelo base, lo que dificulta evaluar sesgos y comportamientos aprendidos.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de factualidad para este artefacto.
- El rendimiento en contextos de 256K puede degradarse en las posiciones intermedias pese a que el modelo "quepa" en memoria; no se aportan métricas de recuperación en contexto largo más allá del test externo citado.
- La cobertura de trece idiomas está declarada por etiquetas; no se especifica el nivel de competencia por idioma ni se aportan evaluaciones multilingües.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Accio-Lab/occamy-1.0 y de los datos subyacentes antes de producción.
- El soporte de tool calling y agentes se infiere de las etiquetas del repositorio, no de documentación técnica detallada en esta model card.
- El autor advierte que las cifras de mejora de perplejidad citadas corresponden a otras variantes de la familia, no a este modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2-GGUF
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Evaluación externa de zephel01: https://note.com/zephel01/n/n71d3d7e6b70c?hl=en
- Colección APEX-I Legacy Archive: https://huggingface.co/collections/IsValorum/apex-i-legacy-archive-v1-and-v2-6acfee7a56126a10a6a29954
- Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-GGUF
- Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1 Abliterated: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Ornith 1.5 APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Tiel Coder APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Qwen3.8 27B VAL-APEX-I MiniPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- Qwen3.8 27B VAL-APEX-I NanoPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
