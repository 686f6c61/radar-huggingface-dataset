# bakeralex664/woof-2B-1.1-GGUF

## Resumen

Woof 2B (revision 1.1) es un modelo de lenguaje conversacional de aproximadamente 2.516 millones de parametros (2,5 B) desarrollado por Underdog (ConwayResearch). Esta ficha documenta concretamente el repositorio `bakeralex664/woof-2B-1.1-GGUF`, que no es un modelo nuevo ni una variante entrenada, sino un espejo (mirror) byte a byte del fichero `woof-2B-1.1-Q4_K_M.gguf` publicado originalmente en `ConwayResearch/woof-2B-1.1-GGUF` en el commit `2492ef08b2bbf19638e94f9402ce991c8bfe53ee` (2026-10-20).

El objetivo del espejo es de disponibilidad: Catalyst Biosystems mantiene esta copia para que Catalyst Studio pueda seguir descargando los pesos si la revision original deja de estar accesible. Es relevante ahora porque el autor original cambio las condiciones de las revisiones posteriores y de los modelos mas nuevos; este repositorio preserva exclusivamente la revision publicada bajo licencia Apache 2.0, lo que permite seguir usandola comercialmente con las garantias de esa licencia.

Al tratarse de una copia sin modificaciones, no aporta arquitectura ni entrenamiento propios: hereda las caracteristicas del modelo original, del que la informacion disponible solo confirma que es un transformer de tipo texto-a-texto, afinado para uso conversacional, orientado a llama.cpp y con pesos en formato GGUF cuantizado Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (text generation); detalles internos no disponibles |
| Parametros totales | 2.516.756.480 (2,5 B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero incluido en este repo) |
| Idiomas soportados | Ingles (unico idioma declarado en la model card original); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`woof-2B-1.1-Q4_K_M.gguf`) |

Datos adicionales del repositorio: tamano total de 1,6 GB, SHA-256 del fichero `e173464b652feab53855ab0038d5b8cf825429385274cae9a8ab060c634ba65f`, creado el 2026-11-08 y sin descargas ni likes en el momento de la consulta.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original: solo se confirma que es un modelo de generacion de texto de tipo transformer, afinado para conversacion (tag `conversational` en el repositorio original). No se especifican numero de capas, dimensiones ocultas, tipo de atencion, mecanismo de normalizacion ni vocabulario.

Tampoco hay datos sobre el corpus de entrenamiento (numero de tokens, composicion, proporciones de codigo o multilingue), ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT con preferencias. El unico dato tecnico verificable en este repositorio es la cuantizacion: el fichero es un Q4_K_M de llama.cpp, una cuantizacion de 4 bits por peso con escalas K-quant, que reduce el modelo de 2,5 B de parametros a 1,6 GB manteniendo una perdida de calidad moderada respecto a los pesos en precision completa. No hay innovaciones tecnicas documentadas (decodificacion especulativa, atencion lineal, SSM hibrido, etc.).

## Capacidades

- Generacion de texto conversacional multi-turno, segun la model card original.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 2,5 B de parametros.
- Inferencia local en CPU y GPU mediante llama.cpp gracias al formato GGUF.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que permite servirlo detras de APIs compatibles con el ecosistema llama.cpp.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: solo se declara ingles; el resto no disponible.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en local: al pesar 1,6 GB en Q4_K_M, el modelo se puede cargar en un portatil y probar flujos de dialogo sin depender de APIs externas, lo que acelera la iteracion sobre prompts y plantillas de chat.
- Despliegue en entornos con recursos limitados: servidores sin GPU o con GPU de gama baja pueden ejecutar el modelo con llama.cpp u Ollama, cubriendo tareas de generacion de texto donde un modelo de 2,5 B sea suficiente.
- Clasificacion y etiquetado de texto ligero: resumen de mensajes, extraccion de intenciones o generacion de respuestas cortas en pipelines por lotes donde el coste por token importa mas que la calidad puntera.
- Base para fine-tuning posterior: al estar bajo Apache 2.0 y en formato GGUF, sirve como punto de partida para experimentos de adaptacion (LoRA/QLoRA) sobre dominios concretos, aunque habria que reconvertir a safetensors para entrenar.
- Preservacion de dependencias en produccion: equipos que integran Catalyst Studio o herramientas similares pueden fijar este espejo como fuente estable de pesos con hash verificado, evitando roturas si la revision original desaparece.
- Educacion y experimentacion con llama.cpp: util para demostrar el flujo completo de descarga, verificacion de SHA-256, carga del GGUF y ejecucion de inferencia en un taller o curso.
- Chatbot de bajo coste para demos internas: con contexto corto y respuestas breves, encaja en entornos de prueba donde no se justifica un modelo de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2-3 GB con Q4_K_M (el fichero ocupa 1,6 GB y hay que sumar el contexto KV y el overhead del runtime).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); tambien funciona en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna y en muchas integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, servidores compatibles con la API de llama.cpp; vLLM y TGI no soportan GGUF de forma nativa sin conversion a safetensors.
- Latencia y throughput: no disponibles; dependeran del hardware y de la longitud de contexto, aunque por tamano se espera un throughput alto en CPU y muy alto en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Woof 2B 1.1 (este repo) | 2,5 B | No disponible | Apache 2.0 | GGUF Q4_K_M | Espejo byte a byte, solo ingles declarado |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Multilingue, benchmarks publicos |
| Llama 3.2 1B Instruct | 1,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Contexto largo, licencia con restricciones |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Entrenado con datos abiertos, benchmarks publicos |

La comparativa es orientativa: para Woof 2B no hay datos publicos de contexto ni de rendimiento, por lo que la eleccion frente a estas alternativas solo puede basarse en la licencia (Apache 2.0, sin restricciones adicionales) y en la verificacion criptografica del espejo.

## Limitaciones y advertencias

- Modelo pequeno (2,5 B): capacidad de razonamiento, conocimiento factual y seguimiento de instrucciones complejas claramente inferior a modelos de 7 B o mas; riesgo elevado de alucinacion en preguntas factuales.
- Sesgos: no hay informacion sobre el dataset de entrenamiento ni sobre evaluaciones de sesgo; se debe asumir el riesgo habitual de modelos conversacionales entrenados con datos web.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Contexto: longitud no documentada; no se debe asumir una ventana larga para conversaciones multi-turno o documentos extensos.
- Licencia: este espejo conserva Apache 2.0 de la revision concreta; las revisiones posteriores del modelo original y los modelos mas nuevos de Underdog tienen otras condiciones, por lo que no se deben mezclar pesos ni asumir que la licencia se extiende a otras versiones.
- Integridad: al ser un espejo de terceros, conviene verificar el SHA-256 indicado antes de desplegar; el autor del espejo no ofrece garantias adicionales.
- Produccion: sin benchmarks publicos, no se recomienda usar este modelo en tareas criticas sin una evaluacion propia previa.

## Enlaces

- Repositorio del espejo: https://huggingface.co/bakeralex664/woof-2B-1.1-GGUF
- Repositorio original: https://huggingface.co/ConwayResearch/woof-2B-1.1-GGUF
- Revision concreta espejada: https://huggingface.co/ConwayResearch/woof-2B-1.1-GGUF/tree/2492ef08b2bbf19638e94f9402ce991c8bfe53ee
- Discusiones del repositorio original: https://huggingface.co/ConwayResearch/woof-2B-1.1-GGUF/discussions
- llama.cpp: https://github.com/ggml-org/llama.cpp
