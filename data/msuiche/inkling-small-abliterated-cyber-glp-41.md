# msuiche/Inkling-Small-abliterated-cyber-GLP-41

## Resumen

Este repositorio contiene un vector de control (control vector) para el modelo Inkling-Small de Thinking Machines Lab, modificado mediante tecnicas de abliteracion y activation steering orientadas a un perfil "cyber". No se trata del modelo completo, sino de un adaptador de 167.936 parametros que se aplica sobre el modelo base para alterar su comportamiento en una direccion especifica. El acceso esta restringido (gated) y el tamano del repositorio es de 0.0 GB, lo que confirma que solo contiene el vector y no los pesos del modelo.

El modelo base, Inkling-Small, es un modelo multimodal de codigo abierto con arquitectura Mixture-of-Experts (MoE) de 276B parametros totales y 12B activos por token, desarrollado por Thinking Machines Lab. Acepta entradas de texto, imagen y audio, y genera salidas de texto. Esta disenado para sistemas agénticos, asistentes de codificacion, chatbots y flujos de recuperacion de informacion, con soporte multilingue.

La relevancia de este repositorio radica en que demuestra la aplicacion de tecnicas de steering de activaciones sobre un modelo MoE de ultima generacion, un area de investigacion activa en interpretabilidad y control de modelos. Sin embargo, la documentacion es minima y los efectos concretos del vector "cyber" no estan especificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal (modelo base Inkling-Small) |
| Parametros totales | 276B (modelo base); 167.936 (vector de control) |
| Parametros activos | 12B por token (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (segun tags del repositorio) |
| Idiomas soportados | Multilingue (modelo base); no especificado para el vector |
| Licencia | MIT |
| Formato de pesos | safetensors (vector de control); GGUF disponible para el modelo base |

## Arquitectura y entrenamiento

El modelo base Inkling-Small es un transformer multimodal con arquitectura MoE dispersa: 276B parametros totales de los cuales solo 12B se activan por token, lo que equilibra capacidad y eficiencia computacional. Acepta entradas de texto, imagen y audio, y genera texto. El entrenamiento del modelo base incluye datos multilingues y de multiples lenguajes de programacion, con un enfoque en sistemas agénticos y tool-use.

El repositorio de msuiche aplica dos tecnicas de modificacion sobre el modelo base: abliteracion (eliminacion selectiva de direcciones de activacion asociadas a comportamientos no deseados) y activation steering (inyeccion de un vector de control en una capa especifica, indicada por "GLP-41", probablemente la capa 41). El vector de control tiene 167.936 parametros, lo que sugiere una dimensionalidad moderada. No se dispone de informacion detallada sobre el proceso de entrenamiento del vector, los datos utilizados ni la metodologia exacta de abliteracion aplicada.

## Capacidades

- Generacion de texto multimodal: el modelo base acepta texto, imagen y audio como entrada y produce texto.
- Razonamiento y codificacion: disenado para asistentes de codificacion y tareas de razonamiento avanzado.
- Tool calling y sistemas agénticos: soporte para integracion en flujos de agentes autonomos.
- Multilingue: soporte para ingles y otros idiomas, asi como multiples lenguajes de programacion.
- El vector de control "cyber" modifica el comportamiento del modelo en una direccion especifica, aunque no se documentan los efectos concretos en el repositorio.
- Compatibilidad con cuantizacion GGUF para despliegue eficiente en entornos con recursos limitados.

## Casos de uso

- Asistentes de codificacion en produccion: el modelo base puede integrarse en IDEs y pipelines de CI/CD para generacion y revision de codigo, con soporte de tool calling y razonamiento multi-paso.
- Sistemas agénticos autonomos: gracias a su arquitectura MoE eficiente (12B activos), puede ejecutarse en entornos con recursos moderados mientras mantiene capacidades de razonamiento complejo.
- Chatbots multilingues: soporte de multiples idiomas para atencion al cliente y asistentes conversacionales con contexto largo.
- Flujos de recuperacion de informacion (RAG): el modelo puede procesar documentos y generar respuestas contextualizadas, integrable con pipelines de embedding y busqueda vectorial.
- Analisis de contenido multimodal: procesamiento de imagenes y audio junto con texto para tareas de analisis, extraccion de informacion y resumen.
- Investigacion en interpretabilidad: el vector de control de este repositorio es util para estudiar como la abliteracion y el steering de activaciones afectan al comportamiento de modelos MoE a gran escala, especialmente en dominios de seguridad informatica ("cyber").
- Evaluacion de robustez: permite probar como un modelo responde a direcciones de activacion especificas, util para auditorias de seguridad y alineacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La pagina de Thinking Machines Lab menciona evaluaciones comparativas para Inkling-Small, pero no se proporcionan cifras concretas en los resultados de busqueda. No se dispone de datos de rendimiento especificos para el vector de control de este repositorio.

## Requisitos de hardware

- El vector de control en si requiere recursos minimos: 167.936 parametros, menos de 1 MB en FP32, ejecutable en cualquier CPU.
- Para el modelo base Inkling-Small (276B total, 12B activos), se estima:
  - VRAM para inferencia en FP16: aproximadamente 550-600 GB (pesos completos), requiriendo un cluster multi-GPU.
  - Con cuantizacion de 4 bits: aproximadamente 140-160 GB de VRAM, posible con 2-4 GPUs H100 (80 GB) o A100 (80 GB).
  - No cabe en GPUs de consumo (RTX 4090 con 24 GB) sin cuantizacion extrema o descarga parcial de pesos.
- Opciones de despliegue: vLLM, TGI, llama.cpp (para GGUF), Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-Small (base) | 276B | 12B | no disponible | open-weights | HuggingFace |
| Inkling (flagship) | 975B | 41B | no disponible | open-weights | HuggingFace |
| Este repositorio (vector) | 167.936 | - | - | MIT | Gated en HuggingFace |

No se dispone de comparativas con otros modelos MoE de la misma categoria (como DeepSeek-V3 o Qwen2.5-MoE) en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio requiere aceptar condiciones en HuggingFace (gated), lo que limita su uso inmediato.
- No es el modelo completo: este repositorio contiene solo un vector de control de 167.936 parametros, no los pesos del modelo Inkling-Small. Para usarlo, es necesario descargar el modelo base por separado.
- Documentacion limitada: no se especifican los efectos concretos del vector "cyber", el proceso de entrenamiento del vector ni la metodologia de abliteracion.
- Riesgo de sesgos: el modelo base puede heredar sesgos de sus datos de entrenamiento; la abliteracion y el steering pueden introducir sesgos adicionales no documentados.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido factualmente incorrecto o inventado.
- Licencia MIT: permite uso comercial del vector, pero la dependencia del modelo base (con su propia licencia open-weights) debe verificarse antes de un despliegue en produccion.
- El tag "region:us" sugiere restricciones geograficas potenciales, aunque no se detallan en la informacion disponible.
- Fecha de creacion futura (2026-09-01): el repositorio tiene una fecha de creacion inusual que conviene verificar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/msuiche/Inkling-Small-abliterated-cyber-GLP-41
- Model card de Inkling-Small (Thinking Machines Lab): https://thinkingmachines.ai/model-card/inkling-small/
- Pagina de Inkling (Thinking Machines Lab): https://thinkingmachines.ai/inkling/
- GGUF de Inkling-Small (unsloth): https://huggingface.co/unsloth/Inkling-Small-GGUF
- Descarga de Inkling-Small (SourceForge): https://sourceforge.net/projects/inkling-small/
- Descarga de Inkling (SourceForge): https://sourceforge.net/projects/inkling-ai/
