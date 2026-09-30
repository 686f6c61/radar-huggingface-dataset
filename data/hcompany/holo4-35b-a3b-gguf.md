# Hcompany/Holo4-35B-A3B-GGUF

## Resumen

Holo4-35B-A3B-GGUF es la versión cuantizada en formato GGUF (Q4_K_M) de Holo4-35B-A3B, un modelo de visión-lenguaje (VLM) orientado a "computer use" desarrollado por H Company. Está construido sobre Qwen3.6-35B-A3B, una arquitectura Mixture of Experts (MoE) con aproximadamente 34.660 millones de parámetros totales y 3.000 millones activos por token, y se distribuye con licencia Apache 2.0.

El modelo no se limita a la generación de texto: su pipeline es `image-text-to-text` y está diseñado para operar software a través de cualquier interfaz disponible (GUIs mediante capturas de pantalla, código, MCP y APIs). Se usa habitualmente junto al harness `hai-agents`, que envía capturas y resultados de herramientas al modelo y ejecuta las acciones solicitadas (clics, escritura, código, llamadas a herramientas).

Su relevancia actual radica en que ofrece pesos abiertos para agentes de computer use con una ventana de contexto declarada de 262.144 tokens en la configuración, un tamaño que cabe en hardware de gama alta de consumo en su cuantización Q4_K_M y un coste por tarea bajo según las evaluaciones publicadas por el autor. El repositorio acumula 1.813 descargas y 11 "likes" en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6 MoE (Mixture of Experts) |
| Parametros totales | 34.660.610.688 (aprox. 34,7B) |
| Parametros activos | 3B (35B-A3B) |
| Longitud de contexto | 262.144 tokens (256K) segun config |
| Tipos de cuantizacion | Q4_K_M GGUF (esta version); el modelo base dispone de BF16, FP8 y NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M), con imatrix; el modelo base en safetensors (BF16/FP8/NVFP4) |

## Arquitectura y entrenamiento

Holo4-35B-A3B es un transformer con capas Mixture of Experts (MoE) heredado de Qwen3.6-35B-A3B: 34,7B parámetros totales con 3B activos por token. Además del tronco de lenguaje, incorpora capacidades de visión, ya que el pipeline declarado es `image-text-to-text` y el caso de uso principal implica interpretar capturas de pantalla para localizar elementos y decidir acciones. La ventana de contexto configurada es de 262.144 tokens.

H Company declara que los modelos Holo4 mejoran de forma significativa respecto a sus modelos base Qwen, y publica un diagrama del pipeline de entrenamiento en la model card, si bien no se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO. Tampoco se especifican innovaciones de inferencia como decodificación especulativa. Sí se documenta el uso previsto con el harness `hai-agents`, que aporta el bucle de percepción (capturas), ejecución de acciones y llamadas a herramientas.

La variante aquí descrita es una cuantización Q4_K_M en GGUF generada con imatrix, pensada para ejecución local con runtimes compatibles con GGUF en lugar de servir el checkpoint en BF16.

## Capacidades

- Comprensión de imágenes y capturas de pantalla: pipeline `image-text-to-text`, necesario para interpretar interfaces gráficas.
- Computer use: interacción con escritorio, web y aplicaciones móviles mediante clics, teclado y ejecución de código.
- Llamada a herramientas (tool calling / function calling): documentada explícitamente por el autor, incluye herramientas MCP y APIs.
- Ejecución de código como acción del agente (por ejemplo, scripts para manipular aplicaciones de escritorio).
- Localización de elementos en pantalla (element localization), documentada en la documentación del autor.
- OCR de documentos (document OCR), documentado en la documentación del autor.
- Comportamiento agéntico multi-paso: el harness reenvía resultados de acciones al modelo para continuar la trayectoria.
- Generación de texto conversacional (tag `conversational`).
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de flujos de trabajo de escritorio: el modelo recibe capturas de la aplicación y devuelve acciones concretas (clics, entradas de teclado) para completar tareas como rellenar formularios o manipular software CAD, tal y como muestra el ejemplo de FreeCAD publicado por el autor.
- Agentes de navegación web: extracción de información y ejecución de tareas en portales mediante localización de elementos sobre la captura y llamadas a herramientas, con el bucle del harness gestionando la sesión.
- Automatización de procesos de negocio (RPA con LLM): la evaluación Agentic Task Factory del autor cubre flujos de negocio en web, escritorio y herramientas MCP, lo que encaja con tareas repetitivas de back office.
- Asistentes de QA y pruebas end-to-end: el modelo puede pilotar una aplicación y verificar estados visuales, integrándose en pipelines que ejecutan las acciones solicitadas de forma programática.
- Procesamiento documental: OCR de documentos y extracción de campos a partir de imágenes, con la ventana de 262.144 tokens permitiendo encadenar varios documentos en una misma sesión.
- Soporte técnico asistido por agente: diagnóstico guiado paso a paso sobre la interfaz del usuario, combinando razonamiento sobre la captura con llamadas a APIs internas.
- Orquestación de herramientas heterogéneas: uso del modelo como planificador que decide entre MCP, API o interacción gráfica según la tarea.
- Despliegue local con requisitos de privacidad: al distribuirse en GGUF y caber en GPUs de consumo en Q4_K_M, permite ejecutar agentes sobre datos sensibles sin enviar capturas a un servicio externo.

## Benchmarks y rendimiento

Los datos publicados por el autor en la model card son los siguientes. La tabla comparativa completa se distribuye como imagen y no es legible en la información disponible, por lo que no se reproducen aquí sus valores.

| Benchmark | Modelo | Resultado | Coste por tarea |
|---|---|---|---|
| OSWorld | Holo4-27B | 85,2 % | 0,08 USD |
| OSWorld 2.0 | Holo4-27B | 61,7 % | 1,22 USD |
| OSWorld 2.0 | Holo4-35B-A3B | 30,9 % | 0,61 USD |
| AutomationBench | Holo4-27B | 45,4 % | 0,05 USD |
| AutomationBench | Holo4-35B-A3B | 34,5 % | 0,02 USD |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de conocimiento general para esta variante. Las trayectorias de evaluación completas están publicadas en el dataset `Hcompany/trajectories`.

## Requisitos de hardware

- Peso de los ficheros: el repositorio ocupa 22,2 GB, correspondiente a la cuantización Q4_K_M, por lo que se necesita al menos esa cantidad de VRAM o de memoria unificada para cargar los pesos.
- VRAM estimada: en torno a 22-24 GB para pesos y overhead de runtime; la caché KV crece de forma apreciable con la ventana de 262.144 tokens, por lo que contextos muy largos exigen memoria adicional o cuantización de la caché.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para contexto largo y concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para cargar el modelo en Q4_K_M con contextos moderados.
- Consumer GPU: sí, en tarjetas de 24 GB o más (RTX 3090, 4090, 5090) y en equipos Apple Silicon con memoria unificada de 32 GB o superior.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python), servidores compatibles con GGUF; el tag `endpoints_compatible` indica compatibilidad con endpoints de HuggingFace. Para la ruta multimodal es necesario que el runtime cargue el proyector de visión correspondiente; la presencia de un fichero `mmproj` en este repositorio es no disponible en la información consultada.
- Latencia y throughput: no disponibles de forma explícita. Al tener solo 3B parámetros activos, el coste de cómputo por token es bajo en comparación con un modelo denso de 34B, aunque el ancho de banda de memoria sigue viniendo determinado por los 34,7B parámetros totales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Holo4-35B-A3B (esta ficha, GGUF Q4_K_M) | 34,7B totales / 3B activos | 262.144 tokens | OSWorld 2.0: 30,9 % a 0,61 USD/tarea; AutomationBench: 34,5 % a 0,02 USD/tarea | Apache 2.0 | HuggingFace (BF16, FP8, NVFP4, GGUF Q4) y H Models API |
| Holo4-27B (mismo autor, denso) | no disponible (27B nominal) | 256K segun blog | OSWorld: 85,2 % a 0,08 USD/tarea; OSWorld 2.0: 61,7 %; AutomationBench: 45,4 % | Apache 2.0 | HuggingFace (BF16, FP8, NVFP4, GGUF Q4) y H Models API |
| Qwen3.6-35B-A3B (modelo base) | 35B-A3B | no disponible | El autor indica que Holo4 mejora "significativamente" sobre su base Qwen, sin cifras concretas en la información disponible | no disponible | HuggingFace |
| Holotron4-30B-A3B (mismo autor, arquitectura NemotronH Nano Omni) | 30B-A3B nominal | no disponible | no disponible | no disponible | HuggingFace (BF16, FP8) |

No se dispone de datos de contexto ni de benchmarks de alternativas externas de computer use en la información proporcionada, por lo que la comparación se limita a la propia familia Holo4 y a su modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado por el autor. En tareas de computer use, un error de localización de elementos o una acción mal inferida puede tener consecuencias reales sobre el sistema operativo, por lo que se recomienda supervisión y límites de permisos.
- Idiomas soportados: no disponibles. No hay confirmación de cobertura multilingüe más allá de lo que herede de Qwen3.6.
- Contexto: aunque la configuración declara 262.144 tokens, mantener esa ventana activa implica un consumo de memoria elevado y, en la práctica, la calidad de recuperación en contextos muy largos no está documentada para esta variante cuantizada.
- La variante aquí descrita es Q4_K_M: es esperable una pérdida de precisión y de calidad de razonamiento respecto al checkpoint BF16 del modelo base, especialmente en tareas de localización fina sobre pantalla.
- Funcionalidad multimodal dependiente del runtime: si el motor de inferencia no carga el proyector de visión, el modelo pierde su capacidad principal de computer use.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.6 sobre el que se construye, ya que la model card original queda truncada en el apartado de licencia en la información disponible.
- Producción: el modelo está pensado para operar junto al harness `hai-agents`; usos fuera de ese bucle requieren implementar la gestión de capturas, ejecución de acciones y control de errores.
- Fecha de publicación: el repositorio está fechado en septiembre de 2026 y su última actualización es del 28 de septiembre de 2026; se trata de un lanzamiento reciente con un ecosistema de terceros todavía en maduración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hcompany/Holo4-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Hcompany/Holo4-35B-A3B
- Versión FP8 del base: https://huggingface.co/Hcompany/Holo4-35B-A3B-FP8
- Versión NVFP4 del base: https://huggingface.co/Hcompany/Holo4-35B-A3B-NVFP4
- Holo4-27B: https://huggingface.co/Hcompany/Holo4-27B
- Holo4-27B FP8: https://huggingface.co/Hcompany/Holo4-27B-FP8
- Holo4-27B NVFP4: https://huggingface.co/Hcompany/Holo4-27B-NVFP4
- Holo4-27B GGUF Q4: https://huggingface.co/Hcompany/Holo4-27B-GGUF
- Holotron4-30B-A3B: https://huggingface.co/Hcompany/Holotron4-30B-A3B
- Holotron4-30B-A3B FP8: https://huggingface.co/Hcompany/Holotron4-30B-A3B-FP8
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog en HuggingFace: https://huggingface.co/blog/Hcompany/holo4
- Anuncio en hcompany.ai: https://hcompany.ai/newsroom/holo4
- Dataset de trayectorias: https://huggingface.co/datasets/Hcompany/trajectories
- Harness de agentes: https://github.com/hcompai/hai-agents-python
- H Models API: https://hub.hcompany.ai/models-api/introduction
- Documentación de function calling: https://hub.hcompany.ai/models-api/build-an-agent/function-calling
- Documentación de localización de elementos: https://hub.hcompany.ai/models-api/element-localization
- Documentación de OCR: https://hub.hcompany.ai/models-api/document-ocr
- Portal de trayectorias: https://trajectories.hcompany.ai/
- Cobertura en unite.ai: https://www.unite.ai/h-company-releases-holo4-open-weight-models-for-computer-use-agents/
- Cobertura en MarkTechPost: https://www.marktechpost.com/2026/09/29/h-company-releases-holo4-open-weight-computer-use-models-that-click-code-and-call-tools-across-desktop-web-android-and-apis/
- Cobertura en ccleaks: https://ccleaks.com/news/holo4-open-weights-sep-2026
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
