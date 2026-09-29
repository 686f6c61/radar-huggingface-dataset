# Hcompany/Holo4-35B-A3B

## Resumen

Holo4-35B-A3B es un modelo de lenguaje y visión (VLM) orientado a "computer use", desarrollado por H Company (Hcompany) y publicado con pesos abiertos el 28 de septiembre de 2026. Se trata de un ajuste fino del modelo base Qwen3.6-35B-A3B, sobre el que H Company ha aplicado su propio pipeline de entrenamiento para convertirlo en un agente capaz de operar interfaces gráficas: recibe capturas de pantalla y resultados de herramientas, y devuelve acciones concretas como clics, escritura, ejecución de código o llamadas a herramientas MCP y APIs.

La arquitectura es un transformer de tipo Mixture of Experts (MoE) con 35.107.181.936 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (de ahí la nomenclatura A3B). El contexto máximo declarado en la configuración es de 262.144 tokens, lo que permite mantener trayectorias de agente largas con muchas capturas de pantalla e historial de acciones sin truncar. El checkpoint se distribuye en BF16 safetensors, con variantes oficiales en FP8, NVFP4 y GGUF Q4.

Su relevancia actual radica en que ataca el problema del agente generalista que interactúa con software por cualquier interfaz disponible (GUI de escritorio, web, Android, sandbox de código, MCP o API REST), un nicho donde los modelos abiertos de propósito general suelen rendir peor que los modelos especializados. H Company publica además las trazas de evaluación de sus agentes para facilitar la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6 MoE (Mixture of Experts, transformer multimodal) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | Aproximadamente 3 B (nomenclatura A3B) |
| Longitud de contexto | 262.144 tokens (config) |
| Tipos de cuantizacion | BF16 (checkpoint principal), FP8, NVFP4, GGUF Q4 (variantes oficiales publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); GGUF en la variante Q4 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un transformer de tipo Mixture of Experts con unos 35 B de parámetros totales y unos 3 B activos por token. Sobre esa base, H Company ha realizado un ajuste fino orientado a tareas de agente y uso de ordenador, con entrada multimodal de imagen y texto (pipeline `image-text-to-text`). La configuración admite hasta 262.144 tokens de contexto, lo que resulta crítico para agentes que acumulan capturas de pantalla, resultados de herramientas y trazas de acciones a lo largo de una tarea.

No se han publicado en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni el detalle de las etapas de alineación (RLHF, DPO u otras). La model card incluye un diagrama del pipeline de entrenamiento, pero sin cifras asociadas. Sí se documenta que el modelo está pensado para funcionar junto al harness `hai-agents`, que se encarga de enviar capturas y resultados de herramientas al modelo, ejecutar las acciones solicitadas (clics, tecleo, código, llamadas a herramientas) y devolver los resultados al bucle del agente.

## Capacidades

- Comprensión de capturas de pantalla y localización de elementos de interfaz (element localization) para decidir dónde hacer clic o escribir.
- Generación de acciones de computer use: clics, introducción de texto y manipulación de GUI en escritorio, web y Android.
- Ejecución y generación de código dentro de un sandbox, incluyendo tareas de modelado 3D complejas (el ejemplo publicado muestra FreeCAD construyendo una réplica de la Torre Eiffel).
- Llamada a funciones y herramientas (function calling), incluidas herramientas MCP y APIs externas.
- OCR de documentos, según la documentación del autor.
- Razonamiento multi-paso y ejecución de flujos de trabajo de negocio de principio a fin (web, escritorio y herramientas MCP) dentro del benchmark Agentic Task Factory.
- Conversación multi-turno con contexto largo (hasta 262.144 tokens).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Automatización de flujos de trabajo de oficina en escritorio: el modelo recibe capturas de la aplicación (por ejemplo hojas de cálculo o suites ofimáticas), localiza los controles y emite clics y entradas de teclado. Su contexto de 262.144 tokens permite arrastrar el historial completo de una sesión larga sin perder el estado.
- Agentes de navegación web para procesos de negocio: rellenar formularios, extraer datos de portales internos y encadenar pasos entre varias páginas, apoyándose en la localización de elementos y en las llamadas a herramientas MCP para consultar sistemas de backend.
- Soporte técnico de primer nivel con acceso a GUI: el agente puede abrir aplicaciones, reproducir los pasos de un usuario, diagnosticar el estado de la interfaz y ejecutar acciones correctivas, integrándose mediante el harness `hai-agents`.
- Automatización de pruebas de interfaz (QA): uso del modelo como agente que opera la aplicación bajo prueba y verifica visualmente el resultado en pantalla, reduciendo la dependencia de selectores frágiles.
- Agentes de código en pipelines de CI/CD: dado que soporta tool calling y ejecución de código, puede integrarse en flujos que generen parches, ejecuten tests en un sandbox y actúen sobre resultados, con intervención humana en los puntos de aprobación.
- Procesamiento documental con OCR: extracción de datos de facturas, formularios e informes en PDF o capturas, combinando OCR con razonamiento sobre el contenido para volcar los campos a un sistema destino.
- Operación de dispositivos Android dentro de granjas de dispositivos: la familia Holo4 está diseñada para control multiplataforma, de modo que el mismo agente puede pilotar aplicaciones móviles además de escritorio y web.
- Orquestación de herramientas empresariales vía MCP: conectar el modelo a servidores MCP internos para que ejecute tareas administrativas (altas, consultas, actualizaciones) sin necesidad de escribir integraciones específicas por herramienta.

## Benchmarks y rendimiento

Datos publicados por el autor para Holo4-35B-A3B y, como referencia, para el modelo hermano denso Holo4-27B:

| Benchmark | Holo4-35B-A3B | Holo4-27B | Notas |
|---|---|---|---|
| OSWorld 2.0 | 30,9 % con 0,61 USD por tarea | 61,7 % con 1,22 USD por tarea | Gráfico de Pareto coste/score publicado por el autor |
| OSWorld | no disponible para 35B-A3B | 85,2 % con 0,08 USD por tarea | Dato publicado solo para el 27B |
| AutomationBench | 34,5 % con 0,02 USD por tarea | 45,4 % con 0,05 USD por tarea | v1.0.6, medición en el harness interno |
| Agentic Task Factory | no disponible (resultados en imagen) | no disponible (resultados en imagen) | Conjunto de flujos de negocio retenidos, web/escritorio/MCP |

No se han publicado en la información disponible resultados desglosados por benchmark para el 35B-A3B más allá de los anteriores, ni cifras comparativas numéricas frente a Qwen3.6-35B-A3B o Qwen3.8 27B en AutomationBench (la comparativa se menciona pero los valores no se incluyen en el material proporcionado).

## Requisitos de hardware

- Peso en BF16: el repositorio ocupa aproximadamente 70,2 GB, por lo que la inferencia en BF16 requiere del orden de 70-75 GB de VRAM solo para pesos, más overhead de caché KV. No cabe en GPU de consumo individual.
- FP8 y NVFP4: las variantes oficiales reducen el requisito aproximadamente a la mitad y a un cuarto respectivamente respecto a BF16, lo que sitúa NVFP4 en un rango manejable por GPU profesionales de gama alta y por configuraciones multi-GPU de consumo, aunque las cifras exactas de VRAM no están publicadas.
- GGUF Q4: la variante Q4 GGUF está pensada para despliegue en llama.cpp/Ollama; el tamaño exacto del archivo no está disponible en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, el rango de referencia son GPU de 80 GB (A100, H100) para BF16 en una o varias unidades, o GPU con soporte de FP8/NVFP4 para las variantes cuantizadas.
- Opciones de despliegue: `transformers` (librería declarada en la model card), llama.cpp/Ollama para la variante GGUF, y servidores compatibles con endpoints (la etiqueta `endpoints_compatible` figura en los tags). La información no detalla soporte explícito de vLLM o TGI para este checkpoint.
- Latencia y throughput: no disponibles. El coste por tarea sí está publicado (0,61 USD en OSWorld 2.0 y 0,02 USD en AutomationBench), pero no se traduce a tokens por segundo en la información disponible.
- Nota sobre el cómputo real: al ser un MoE con unos 3 B de parámetros activos, el coste por token es mucho menor que el de un modelo denso de 35 B, aunque la memoria necesaria para alojar los pesos sigue siendo la del modelo completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Holo4-35B-A3B | 35,1 B totales, ~3 B activos (MoE) | 262.144 tokens | VLM para computer use y agentes | Apache 2.0 | Pesos abiertos en HuggingFace (BF16, FP8, NVFP4, GGUF Q4) y API de H Models |
| Holo4-27B | 27 B denso | 262.144 tokens (familia Holo4) | VLM para computer use y agentes | Apache 2.0 | Pesos abiertos (BF16, FP8, NVFP4, GGUF Q4) y API |
| Qwen3.6-35B-A3B | 35 B totales, ~3 B activos (MoE) | no disponible | Modelo base multimodal de propósito general | Según licencia del modelo base (no disponible en esta ficha) | Pesos abiertos en HuggingFace |
| Qwen3.8 27B | 27 B denso | no disponible | Modelo base multimodal de propósito general | Según licencia del modelo base (no disponible en esta ficha) | Pesos abiertos en HuggingFace |
| Holotron4-30B-A3B | 30 B totales, ~3 B activos (MoE) | no disponible | Arquitectura NemotronH Nano Omni, familia Holo4 | no disponible | Pesos abiertos (BF16, FP8) |

El autor sitúa a Holo4 por encima de sus respectivos modelos base Qwen en las evaluaciones realizadas, pero los valores numéricos de esa comparación no están incluidos en la información disponible.

## Limitaciones y advertencias

- Sesgos: no se ha publicado información sobre sesgos conocidos ni sobre la composición demográfica o lingüística de los datos de entrenamiento.
- Alucinación: es un riesgo inherente a los modelos de lenguaje; en tareas de computer use se traduce en acciones sobre elementos de interfaz inexistentes o en interpretaciones erróneas de capturas. El harness `hai-agents` mitiga parcialmente el problema al ejecutar y devolver el resultado real de cada acción, pero no lo elimina.
- Idiomas: la lista de idiomas soportados no está disponible; el comportamiento multilingüe no puede garantizarse para usos en producción en idiomas distintos del inglés sin evaluación previa.
- Contexto: aunque la configuración declara 262.144 tokens, el rendimiento efectivo en ventanas muy largas puede degradarse; conviene evaluar con las trayectorias reales de cada caso de uso.
- Dependencia del harness: el modelo está diseñado para funcionar con el harness `hai-agents` y una API de herramientas; usarlo fuera de ese bucle requiere implementar la gestión de capturas, acciones y resultados.
- Licencia: los pesos se publican bajo Apache 2.0, lo que permite uso comercial. Debe verificarse igualmente la licencia del modelo base Qwen3.6-35B-A3B, que la model card enlaza pero cuya extensión aparece truncada en la información disponible.
- Rendimiento en benchmarks: el 35B-A3B obtiene puntuaciones notablemente inferiores al 27B denso en OSWorld 2.0 (30,9 % frente a 61,7 %) a cambio de un coste por tarea mucho menor (0,61 USD frente a 1,22 USD). La elección entre ambos debe basarse en el compromiso coste/precisión del caso de uso concreto.
- Madurez: la ficha se actualizó cuatro días después de su publicación y el modelo acumula pocas descargas, por lo que el ecosistema de integraciones y reportes de terceros es todavía limitado.
- Uso de agentes con acceso real a sistemas: ejecutar clics y código de forma autónoma sobre entornos productivos exige controles de permisos, sandboxing y validación humana en acciones destructivas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hcompany/Holo4-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante FP8: https://huggingface.co/Hcompany/Holo4-35B-A3B-FP8
- Variante NVFP4: https://huggingface.co/Hcompany/Holo4-35B-A3B-NVFP4
- Variante GGUF Q4: https://huggingface.co/Hcompany/Holo4-35B-A3B-GGUF
- Modelo hermano Holo4-27B (BF16): https://huggingface.co/Hcompany/Holo4-27B
- Holotron4-30B-A3B: https://huggingface.co/Hcompany/Holotron4-30B-A3B
- Blog de H Company sobre Holo4: https://hcompany.ai/newsroom/holo4
- Blog en HuggingFace: https://huggingface.co/blog/Hcompany/holo4
- Harness hai-agents: https://github.com/hcompai/hai-agents-python
- API de modelos (H Models API): https://hub.hcompany.ai/models-api/introduction
- Documentación sobre function calling: https://hub.hcompany.ai/models-api/build-an-agent/function-calling
- Documentación sobre localización de elementos: https://hub.hcompany.ai/models-api/element-localization
- Documentación sobre OCR de documentos: https://hub.hcompany.ai/models-api/document-ocr
- Dataset de trayectorias de agente: https://huggingface.co/datasets/Hcompany/trajectories
- Trazas abiertas de agentes: https://trajectories.hcompany.ai/
- Cobertura de Unite.AI: https://www.unite.ai/h-company-releases-holo4-open-weight-models-for-computer-use-agents/
- Cobertura de MarkTechPost: https://www.marktechpost.com/2026/09/29/h-company-releases-holo4-open-weight-computer-use-models-that-click-code-and-call-tools-across-desktop-web-android-and-apis/
- Cobertura de AI Understanding: https://aiunderstanding.org/news/h-company-releases-holo4-open-weight-models-for-computer-use-agents
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
