# mstrasser/jeff-adapter-is-complete

## Resumen

`mstrasser/jeff-adapter-is-complete` es un adaptador LoRA (PEFT) sobre el modelo base `mstrasser/jeff-base` v1.4, un fine-tune de Qwen3.5-0.8B descrito por el autor como el "modelo de decisión abierto pequeño" de Jeff. El adaptador no genera texto: recibe una situación estructurada y una pregunta con opciones nombradas, y devuelve una probabilidad calibrada para cada opción en un único forward pass. Su tarea concreta es evaluar la completitud de un expediente documental frente a una checklist.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un adaptador muy específico (un solo dominio, un solo idioma, un solo tipo de decisión) con cero descargas y cero likes en el momento de la consulta, y con métricas reportadas únicamente sobre tests internos generados por el mismo generador que los datos de entrenamiento. No es un modelo de propósito general ni un sustituto de un LLM conversacional.

El interés técnico está en su enfoque: sustituir la generación de texto y el posterior parseo por una clasificación calibrada de opciones, lo que simplifica la integración en pipelines y permite aplicar umbrales de confianza. El adaptador solo carga sobre la revisión `v1.4` del modelo base, ya que el motor rechaza adaptadores entrenados sobre otra base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre `mstrasser/jeff-base` v1.4, fine-tune de Qwen3.5-0.8B; clasificación de opciones con probabilidad calibrada por forward pass |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 0,8B según la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado con PEFT sobre `jeff-base` v1.4, que a su vez es un fine-tune de Qwen3.5-0.8B. La innovación metodológica no está en la arquitectura del transformer subyacente, sino en la interfaz de decisión: en lugar de generar texto libre y parsearlo, el modelo expone una función de clasificación (`jeff.reasoning.is-complete.is_complete`) que devuelve una distribución de probabilidad sobre las etiquetas `complete`, `incomplete` y `unclear` en un solo forward pass.

El adaptador se entrenó el 25 de octubre de 2026. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; solo indica que los tests reportados provienen de un generador interno, el mismo que produjo los datos de entrenamiento. Sí se documenta un conjunto de calibración de 1.941 filas usado para fijar el umbral de confianza. El adaptador está atado a la revisión `v1.4` del modelo base: el motor rechaza cargarlo sobre cualquier otra revisión.

## Capacidades

- Clasificación de completitud documental: evalúa un expediente (`submission`) contra una checklist en el contexto de una revisión, devolviendo `complete`, `incomplete` o `unclear`.
- Razonamiento sobre condiciones: aplica líneas condicionales de la checklist solo cuando su circunstancia concurre en el caso.
- Verificación de atributos documentales: tipo de documento, correspondencia con el sujeto del caso, número de páginas, firma, caducidad y antigüedad frente al periodo permitido.
- Salida calibrada: probabilidad por opción y umbral de confianza configurable (0,789 en el conjunto de calibración reportado).
- Integración programática: SDK de Python (`jeff.Jeff.local`) y motor propio, sin generación de texto que parsear.
- Capacidades multilingües: no; solo inglés.
- Tool calling, agentes, visión, audio o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Verificación de expedientes de préstamo: el adaptador recibe la checklist del producto crediticio y el pack documental recibido, y determina si procede pasar a revisión de crédito. Es el caso que ilustra la propia model card (panadería con dos directores y solo una identificación fotográfica).
- Triaje en back office de seguros: comprobar que un siniestro incluye partes, facturas y firmas exigidas antes de asignarlo a un tramitador, reduciendo devoluciones por documentación incompleta.
- Onboarding de clientes (KYC): validar que el pack de alta contiene identificación, comprobante de domicilio y firmas en los formularios requeridos, con detección de documentos caducados.
- Gestión de subvenciones y licitaciones: contrastar la documentación administrativa presentada contra el pliego, marcando como `unclear` los casos en que falte un dato visible en lugar de rechazarlos automáticamente.
- Recepción de documentación en despachos profesionales: comprobar que el cliente ha entregado todo lo solicitado (escrituras, poderes, declaraciones) antes de abrir el expediente.
- Control de calidad en pipelines documentales: usar la probabilidad calibrada como señal de enrutamiento, derivando a revisión humana solo los casos por debajo del umbral de confianza.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card:

| Test | Filas | Accuracy |
|---|--:|--:|
| Test interno (generator) | 1.974 | 96,8% |
| Segundo test interno de casos no vistos (generator) | 1.932 | 95,7% |

| Función | Umbral | Precisión | Cobertura | Filas de calibración |
|---|--:|--:|--:|--:|
| `is_complete` | 0,789 | 98,0% | 96,7% | 1.941 |

Advertencia: ambos tests son de tipo "generator", es decir, generados por el mismo generador que los datos de entrenamiento, lo que según la propia model card mide menos que un test público o con documentos reales. No se reportan resultados sobre benchmarks públicos ni sobre documentos reales retenidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al tratarse de un adaptador sobre un modelo base de 0,8B, la huella debería ser reducida, pero no se confirma ningún valor.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no confirmada explícitamente; el ejemplo de la model card usa ejecución local (`Jeff.local`), lo que sugiere que el motor puede correr en máquina local, sin especificar hardware.
- Opciones de despliegue: motor y SDK propios de Jeff (`github.com/firelex/jeff`), con descarga automática del adaptador y la base desde Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores de decisión calibrada sobre modelos pequeños) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Alcance muy restringido: solo evalúa completitud de expedientes frente a una checklist; no produce listados de documentos faltantes, solo una valoración global.
- Solo inglés: cualquier documentación o checklist en otro idioma queda fuera del soporte declarado.
- Acoplamiento estricto a la base: solo carga sobre `mstrasser/jeff-base` en la revisión `v1.4`; el motor rechaza otras revisiones.
- Métricas débiles: los únicos resultados publicados provienen de tests generados por el mismo generador que los datos de entrenamiento; no hay validación sobre documentos reales ni benchmarks públicos.
- Riesgo de alucinación: no aplica en el sentido de texto generado, pero sí existe riesgo de clasificación errónea cuando la información del expediente es ambigua; la etiqueta `unclear` está pensada para esos casos y conviene monitorizar su uso.
- Sesgos: no documentados; al entrenarse sobre datos sintéticos de un generador interno, puede heredar los sesgos de ese generador en tipos de documento, nombres o formatos.
- Madurez: cero descargas y cero likes en Hugging Face en el momento de la consulta; los paquetes del SDK no estaban en PyPI según la propia model card, lo que obliga a instalarlos desde el repositorio.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia del modelo base (`jeff-base`) y de Qwen3.5-0.8B antes de desplegar en producción.
- Para producción: tratar la salida como señal de triaje con revisión humana en los casos por debajo del umbral de confianza, no como decisión final.

## Enlaces

- Hugging Face: https://huggingface.co/mstrasser/jeff-adapter-is-complete
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Página de catálogo: https://jeffhub.ai/catalogue/jeff.reasoning.is-complete
- Repositorio, servidor y SDK: https://github.com/firelex/jeff
- Guía de instalación del SDK: https://jeffhub.ai/docs/sdk/install
