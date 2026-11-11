# Rahspide/MNN-Pocket-0.3B-RU-Chat-GGUF

## Resumen

MNN-Pocket-0.3B-RU-Chat-GGUF es la version cuantizada en formato GGUF de un modelo de lenguaje conversacional en ruso de muy pequeno tamano (302.830.976 parametros, aproximadamente 0,3 B), desarrollado por el usuario Rahspide. El modelo parte de una base de tipo Qwen3 y ha sido afinado con 50 millones de tokens de SFT (supervised fine-tuning) para convertir un modelo de continuacion de texto en un asistente que responde a instrucciones, en lugar de simplemente continuar la entrada. Esta orientado explicitamente a despliegue en dispositivo (on-device) y entornos edge, con cuantizaciones que caben en un telefono.

La relevancia de esta ficha radica en su nicho: asistentes conversacionales en ruso de menos de 0,4 B de parametros, con licencia Apache 2.0 y pesos en GGUF listos para `llama.cpp`. El repositorio ocupa 1,2 GB e incluye tres cuantizaciones (F16, Q8_0 y Q4_K_M), con la plantilla ChatML embebida en el propio archivo, lo que simplifica el despliegue. El modelo base sin cuantizar es `Rahspide/MNN-Pocket-0.3B-RU-Chat`.

No se dispone de informacion publica sobre composicion del dataset de entrenamiento, resultados de benchmarks ni detalles de la arquitectura interna mas alla de la referencia a Qwen3 y a la familia MNN. Las cifras de rendimiento que aporta el autor son medidas de generacion en CPU x86 de 16 hilos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3, segun tags del autor); detalles internos no disponibles |
| Parametros totales | 302.830.976 (aproximadamente 0,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la familia Qwen3, segun los tags declarados por el autor, y se distribuye como GGUF para su uso con `llama.cpp`. No se detalla en la informacion disponible el numero de capas, dimensiones ocultas, tipo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. El dato concreto aportado es que se aplicaron 50 millones de tokens de SFT sobre un modelo de continuacion de texto, lo que transformo su comportamiento de "continuar" a "responder" a instrucciones.

La model card indica que la plantilla ChatML esta embebida en el archivo GGUF, de modo que basta con activar `--jinja` en `llama.cpp` para que el modelo responda en formato conversacional. Sin esa plantilla, el modelo vuelve a comportarse como un modelo de continuacion. No se especifica si hubo RLHF, DPO ni la composicion del dataset de SFT.

## Capacidades

- Generacion de texto conversacional en ruso e ingles, con formato de instrucciones (ChatML).
- Respuesta a instrucciones en lugar de continuacion de texto, gracias al SFT de 50 M de tokens.
- Conversacion multi-turno mediante plantilla ChatML embebida.
- Ejecucion en dispositivo (on-device) y entornos edge por su tamano reducido.
- Compatible con `llama.cpp` y con endpoints compatibles (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistente conversacional en ruso en movil: con la cuantizacion Q4_K_M (223 MB) el modelo cabe en un telefono y responde a preguntas cotidianas sin conexion, gracias a su tamano de 0,3 B y a la plantilla ChatML embebida.
- Chatbot de atencion al cliente en ruso para entornos con recursos limitados: puede gestionar conversaciones multi-turno basicas en dispositivos de bajas prestaciones o en pasarelas edge, aunque la longitud de contexto no esta documentada.
- Prototipado rapido de asistentes en ruso: al ser Apache 2.0 y estar en GGUF, permite validar flujos conversacionales con `llama-cli` o `llama-server` antes de escalar a modelos mayores.
- Traduccion y asistencia bilingue ru-en: el modelo declara soporte de ambos idiomas, util para tareas sencillas de reformulacion o respuesta en pares de idiomas.
- Educacion y demostraciones offline: su tamano permite distribuirlo en entornos sin red (aulas, ferias, dispositivos embebidos) para mostrar interaccion conversacional en ruso.
- Filtrado o clasificacion ligera de texto en ruso: al ejecutarse a mas de 100 tok/s en CPU, puede usarse en pipelines de preprocesado o generacion de respuestas cortas en servidores sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente aporta mediciones de velocidad de generacion en una CPU x86 de 16 hilos:

| Cuantizacion | Tamano | Velocidad de generacion (16 hilos x86) |
|---|---|---|
| F16 | 581 MB | no disponible |
| Q8_0 | 310 MB | ~102 tok/s |
| Q4_K_M | 223 MB | ~123 tok/s |

## Requisitos de hardware

- VRAM estimada: no aplica estrictamente; el modelo esta pensado para CPU y edge. En GPU, la cuantizacion Q4_K_M (223 MB) requiere menos de 1 GB de VRAM incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) puede ejecutarlo con holgura; tambien funciona en CPU x86 y ARM.
- Cabe en GPU consumer: si, en cualquier GPU consumer actual e incluso en iGPU y telefonos.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`), con soporte de `--jinja` para la plantilla ChatML; tag `endpoints_compatible` para integracion con endpoints compatibles.
- Latencia y throughput: ~123 tok/s en Q4_K_M y ~102 tok/s en Q8_0 sobre CPU x86 de 16 hilos, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B-RU-Chat-GGUF | ~0,3 B | no disponible | Apache 2.0 | GGUF | Enfoque ruso, on-device |
| Qwen2.5-0.5B-Instruct | ~0,5 B | 32K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Multilingue, mas grande |
| SmolLM2-360M-Instruct | ~0,36 B | 8K (segun documentacion publica) | Apache 2.0 | safetensors, GGUF | Multilingue, orientado a edge |
| Gemma-3-270M | ~0,27 B | no disponible en esta ficha | Gemma license | safetensors, GGUF | Multilingue, requiere aceptar licencia |

La comparativa se limita a datos publicos de cada familia; no se dispone de benchmarks cruzados con este modelo concreto.

## Limitaciones y advertencias

- Modelo de 0,3 B: capacidad de razonamiento, conocimiento factual y coherencia limitadas en comparacion con modelos de mayor tamano; alto riesgo de alucinacion en temas especializados.
- Requiere la plantilla ChatML (flag `--jinja`) para comportarse como asistente; sin ella, continua texto.
- Idiomas soportados declarados: ruso e ingles; no hay evidencia de buen rendimiento en castellano ni en otros idiomas.
- Longitud de contexto no documentada, lo que dificulta planificar conversaciones largas o tareas con documentos extensos.
- No se documentan sesgos especificos, pero al ser un modelo afinado en ruso puede reflejar sesgos de sus datos de SFT, cuya composicion no se detalla.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni informacion sobre procedencia de los datos de entrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad mas alla de las pruebas de velocidad del autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion externa practicamente inexistentes.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-Chat-GGUF
- Modelo base: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-Chat
