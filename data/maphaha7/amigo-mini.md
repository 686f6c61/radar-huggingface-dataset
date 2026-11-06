# maphaha7/amigo-mini

## Resumen

amigo-mini es un modelo de generacion de texto de 360 millones de parametros desarrollado por el usuario maphaha7, obtenido mediante un ajuste fino con LoRA sobre HuggingFaceTB/SmolLM2-360M-Instruct. Su proposito es servir como motor de un asistente de estudio gratuito llamado Amigo, orientado al contexto educativo y con enfasis en Sudafrica, que se ejecuta directamente en el navegador mediante transformers.js con cuantizacion de 8 bits.

El modelo es relevante por su enfoque de despliegue en el cliente (edge computing): al distribuirse como pesos ONNX y ejecutarse con transformers.js, permite ofrecer un asistente conversacional sin infraestructura de servidor ni costes de inferencia por consulta. Ademas, el autor declara que los datos de entrenamiento proceden exclusivamente de fuentes compatibles con uso comercial y de un modelo profesor de pesos abiertos (Qwen2.5-7B-Instruct), sin usar salidas de modelos propietarios.

Se trata de un modelo de nicho, con 101 descargas y sin datos publicados de benchmarks ni de evaluacion. Su tamano reducido (0,4 GB de repositorio) lo hace apto para entornos con recursos muy limitados, pero tambien implica una capacidad de razonamiento y conocimiento acotada en comparacion con modelos de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de SmolLM2-360M-Instruct) |
| Parametros totales | 360 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8 (8 bits) para transformers.js; pesos ONNX |
| Idiomas soportados | no disponible (orientado a contexto sudafricano, sin listado oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (transformers.js); repositorio de 0,4 GB |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parametros de HuggingFaceTB, y se ajusta mediante LoRA para la tarea especifica de asistente de estudio. El ajuste se realizo sobre notas de estudio reescritas por el propio autor y sobre respuestas generadas por un modelo profesor de pesos abiertos (Qwen2.5-7B-Instruct, Apache 2.0) a partir de fuentes compatibles con uso comercial.

El autor declara explicitamente que no se utilizaron salidas de modelos propietarios en la generacion de datos. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas adicionales de RLHF o DPO. La innovacion principal no reside en la arquitectura, sino en el pipeline de despliegue: exportacion a ONNX y ejecucion en navegador con transformers.js usando cuantizacion de 8 bits.

## Capacidades

- Generacion de texto conversacional en formato de asistente de estudio.
- Respuesta a preguntas sobre material de estudio y notas academicas.
- Ejecucion en el navegador del cliente mediante transformers.js (sin backend).
- Cuantizacion q8 para reducir huella de memoria en dispositivos de usuario.
- Capacidad de citar las fuentes utilizadas, segun declara el autor en la model card.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (sin listado oficial de idiomas).
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Asistente de estudio en navegador: el modelo puede integrarse en una aplicacion web educativa que responda dudas sobre apuntes sin enviar datos a un servidor, aprovechando la ejecucion local con transformers.js y la cuantizacion q8.
- Repaso guiado de material academico: al estar ajustado sobre notas de estudio reescritas, es adecuado para generar resumenes y explicaciones a partir de ese corpus concreto, mostrando las fuentes empleadas.
- Despliegue en entornos con conectividad limitada: su tamano (0,4 GB) y su ejecucion en cliente permiten usarlo en escuelas o regiones con infraestructura de red escasa, una vez descargado el modelo.
- Prototipado rapido de asistentes educativos: sirve como base de bajo coste para validar flujos conversacionales antes de migrar a modelos mayores.
- Aplicaciones de privacidad estricta: al no requerir backend, los datos del estudiante permanecen en el dispositivo, lo que resulta util en contextos con requisitos de proteccion de datos.
- Demostraciones y material didactico sobre IA en el navegador: su naturaleza ligera y su licencia Apache 2.0 lo hacen apropiado para talleres y ejemplos de despliegue edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con cuantizacion q8 y 360 millones de parametros, la huella de pesos ronda los 0,4 GB, por lo que cabe en memoria de dispositivos de gama media.
- GPU recomendadas: no disponible; al ejecutarse en navegador, depende de WebGPU o del backend de CPU del navegador.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido, aunque no hay datos oficiales de rendimiento.
- Opciones de despliegue: transformers.js (principal, con dtype q8); otros runners no estan documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| amigo-mini | 360 M | no disponible | Apache 2.0 | ONNX (transformers.js) | Ajuste LoRA educativo, ejecucion en navegador |
| SmolLM2-360M-Instruct | 360 M | no disponible | Apache 2.0 | safetensors, GGUF, ONNX | Modelo base generalista de HuggingFaceTB |
| Qwen2.5-7B-Instruct | 7 B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo profesor usado para generar datos; mucho mayor |

La comparativa con alternativas de la misma categoria (asistentes educativos ligeros para navegador) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de 360 millones de parametros: capacidad de razonamiento y conocimiento limitada; el propio autor advierte que puede cometer errores.
- Riesgo de alucinacion: el autor mitiga mostrando las fuentes utilizadas, pero no elimina el riesgo.
- Idiomas soportados no documentados; el enfoque declarado es el contexto educativo sudafricano, lo que puede reducir su utilidad fuera de ese dominio.
- Longitud de contexto no especificada, lo que dificulta planificar conversaciones largas o documentos extensos.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las condiciones de los datos de entrenamiento derivados de terceros.
- Proyecto de nicho con muy poca adopcion (101 descargas, 0 likes) y sin garantias de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maphaha7/amigo-mini
- Modelo base SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Modelo profesor Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Libreria transformers.js: https://github.com/huggingface/transformers.js
