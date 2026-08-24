# Atomic-Germ/Ornith-1.5-9B-NPU2

## Resumen

Ornith-1.5-9B-NPU2 es una conversión cuantizada del modelo base `ornith-ai/Ornith-1.5-9B`, realizada por Atomic-Germ, orientada a la inferencia en NPU AMD XDNA mediante el runtime FastFlowLM (FLM). El modelo original, desarrollado por Ornith AI (DeepReinforce), es un modelo denso de 9.400 millones de parámetros, multimodal (texto e imagen), con una ventana de contexto de 262.144 tokens, entrenado específicamente para tareas de codificación agéntica, uso de herramientas y razonamiento encadenado. Se distribuye bajo licencia MIT.

La versión NPU2 no es un archivo GGUF, sino un formato propietario Q4NX compilado para FLM, con pesos cuantizados en Q8_0/Q4_1/BF16 y un peso de visión adicional. El modelo base Ornith-1.5 extiende el marco de auto-andamiaje (self-scaffolding) de Ornith-1.0 hacia un bucle de auto-mejora: el modelo propone nuevas tareas, genera andamiajes específicos y produce rollouts de soluciones para aprendizaje por refuerzo. Esta conversión permite ejecutar el modelo en hardware AMD XDNA NPU, aunque el modelo original también puede ejecutarse en GPU mediante cuantizaciones GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5 (no se especifica detalle de capas) |
| Parametros totales | 9.400 millones (9,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4NX (compuesto por Q8_0, Q4_1 y BF16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Q4NX (propietario FastFlowLM, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso derivado de la familia Qwen3.5, con capacidades multimodales (procesa texto e imágenes). Según la documentación del autor, el entrenamiento se basa en un bucle de auto-mejora: el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce rollouts de soluciones que se utilizan como datos para aprendizaje por refuerzo. Este enfoque, denominado "self-scaffolding", es una evolución del presentado en Ornith-1.0. El modelo incorpora razonamiento encadenado (chain-of-thought) y ha sido optimizado para uso agéntico y llamadas a herramientas. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset. La conversión NPU2 mantiene la arquitectura original pero reempaqueta los pesos en el formato Q4NX para el runtime FastFlowLM, incluyendo un componente de visión separado (`vision_weight.q4nx`).

## Capacidades

- Generación de texto y razonamiento encadenado (chain-of-thought) con planificación previa a la ejecución de código.
- Codificación agéntica: el modelo planifica y razona sobre ediciones de código antes de ejecutarlas, reduciendo iteraciones fallidas.
- Llamada a herramientas (tool calling) en modo simple, paralelo y multi-turno, siempre que el razonamiento esté habilitado.
- Soporte de agentes con razonamiento multi-paso y uso de herramientas de forma autónoma.
- Capacidades multimodales: lectura y comprensión de imágenes además de texto.
- Conversación multi-turno con contexto largo (hasta 262.144 tokens).
- Instrucciones complejas y seguimiento de formato estructurado.

## Casos de uso

- Asistente de programación en IDE: el modelo puede analizar código existente, proponer cambios y ejecutar ediciones con razonamiento previo, lo que reduce errores de sintaxis y lógica en entornos de desarrollo integrados.
- Automatización de tareas de mantenimiento de código: gracias a su ventana de 262.144 tokens, puede procesar repositorios completos o archivos extensos para refactorizar, documentar o corregir bugs.
- Agente de soporte técnico con acceso a herramientas: puede consultar APIs, bases de conocimiento o ejecutar comandos para resolver incidencias de usuarios, manteniendo conversaciones multi-turno con contexto amplio.
- Análisis de documentación técnica e imágenes: al ser multimodal, puede extraer información de capturas de pantalla, diagramas o documentación escaneada y responder preguntas sobre ella.
- Generación de código en pipelines de CI/CD: con soporte de tool calling, puede integrarse en flujos automatizados para generar tests, parches o documentación a partir de cambios de código.
- Prototipado rápido de aplicaciones: el modelo puede generar código completo a partir de descripciones en lenguaje natural, incluyendo razonamiento sobre arquitectura y dependencias, gracias a su entrenamiento en tareas agénticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica que Ornith-1.5-9B es el sucesor de Ornith-1.0-9B, que logró rendimiento de vanguardia entre modelos open source de tamaño comparable en benchmarks de codificación agéntica, pero no se proporcionan cifras concretas. Se recomienda consultar el blog oficial de Ornith AI para datos detallados.

## Requisitos de hardware

- Destinado a NPU AMD XDNA: requiere hardware con NPU XDNA y el runtime FastFlowLM (FLM) versión 1.0.1 o superior.
- Peso del modelo: 7,11 GB en formato Q4NX, más el peso de visión adicional.
- El modelo base (sin cuantizar) puede ejecutarse en GPU con 8 GB de VRAM a 4 bits o en un Mac con 16 GB de RAM, según la guía de Atomic Chat.
- Opciones de despliegue: exclusivamente mediante FastFlowLM con `flm-add` para instalación y registro del modelo. No es compatible con vLLM, llama.cpp u Ollama en este formato.
- Para uso en GPU convencional, es necesario descargar el modelo base o sus versiones GGUF desde el repositorio de Ornith AI o Atomic Chat.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Ornith-1.5-9B (base) | 9,4B | 262.144 | MIT | safetensors / GGUF | Codificacion agéntica, multimodal |
| Ornith-1.0-9B | 9,4B | No disponible | MIT | safetensors / GGUF | Codificacion agéntica, multimodal |
| Qwen3.5 (base) | No disponible | No disponible | No disponible | No disponible | Modelo base sobre el que se construye Ornith |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada. La comparativa se limita a características estructurales.

## Limitaciones y advertencias

- El formato Q4NX es propietario de FastFlowLM y solo funciona en hardware AMD XDNA NPU; no es portable a otras plataformas.
- Según el autor, el modelo no maneja bien las llamadas paralelas a herramientas si el razonamiento está deshabilitado. Es imprescindible mantener el modo de razonamiento activado para un comportamiento correcto en tareas agénticas.
- No se han publicado detalles sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo base.
- La licencia MIT permite uso comercial, pero el runtime FastFlowLM puede tener sus propias restricciones de distribución.
- El modelo base es multimodal, pero la conversión NPU2 incluye un peso de visión separado; su rendimiento en tareas de visión no ha sido evaluado en esta versión.
- No se proporcionan garantías de rendimiento en producción; se recomienda validar el modelo en el hardware objetivo antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace del modelo NPU2: https://huggingface.co/Atomic-Germ/Ornith-1.5-9B-NPU2
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Blog oficial de Ornith 1.5: https://ornith.ai/ornith_1_5.html
- Guía de ejecución local (Atomic Chat): https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
- Página del modelo en Atomic Chat: https://atomic.chat/models/ornith-1-5-9b
- Versión NPU2 de Ornith-1.0: https://huggingface.co/Atomic-Germ/Ornith-1.0-9B-NPU2
