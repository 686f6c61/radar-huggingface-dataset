# skillsafe-ai/smollm2-1.7b-instruct-q4f16

## Resumen

skillsafe-ai/smollm2-1.7b-instruct-q4f16 es un paquete de pesos en formato MLC (Machine Learning Compilation) que permite ejecutar SmolLM2-1.7B-Instruct, un modelo de generación de texto de 1.700 millones de parámetros, directamente en el navegador mediante WebGPU. Lo publica la organización skillsafe-ai como artefacto derivado: no se ha reentrenado ni ajustado nada, sino que se ha reconvertido el checkpoint ya cuantizado de mlc-ai (commit 84f57f8580a9d8d623266b600ad4273bb9fd84c1) siguiendo una receta reproducible cuya huella SHA-256 queda registrada en la propia model card.

El interés de esta ficha no reside en el modelo en sí, sino en el formato de despliegue. El repositorio contiene 37 shards de pesos (`params_shard_*.bin`), los ficheros de configuración de MLC (`mlc-chat-config.json`, `ndarray-cache.json`, `tensor-cache.json`), el tokenizador (`merges.txt`) y un módulo WebAssembly de 5,59 MB compilado para WebGPU, con un tamaño total de 1,0 GB. Esto habilita inferencia local en el cliente sin servidor, algo relevante para aplicaciones que tratan datos sensibles o que deben funcionar sin conexión.

El repositorio no incluye descripción de capacidades, idiomas ni evaluación alguna: la información disponible se limita a la tabla de procedencia y al listado de ficheros con sus hashes. Cualquier dato sobre rendimiento, sesgos o cobertura lingüística debe consultarse en la ficha del modelo base, no en este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only del modelo base SmolLM2-1.7B-Instruct; el artefacto es una compilación MLC para WebGPU (no se detalla en la model card) |
| Parametros totales | 1.700 millones (según el identificador y el modelo base declarado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens, según el sufijo `ctx4k` del binario `SmolLM2-1.7B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm`; el sufijo `cs1k` no se explica en la model card |
| Tipos de cuantizacion | `q4f16_1` (pesos en 4 bits, activaciones en FP16), según el nombre del artefacto |
| Idiomas soportados | no disponible (la model card no enumera idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | MLC (`params_shard_*.bin` + `ndarray-cache.json` / `tensor-cache.json`), más binario `.wasm` para WebGPU |

Datos adicionales del repositorio: tamaño total 1,0 GB, pipeline `text-generation`, etiquetas `skillsafe`, `browser`, `web-llm`, `mlc`, `conversational`; 0 descargas y 0 likes en el momento de la consulta; creado y actualizado el 22 de septiembre de 2026.

## Arquitectura y entrenamiento

No hay información sobre arquitectura ni entrenamiento en la model card de este repositorio: se trata exclusivamente de una conversión de formato. La tabla de procedencia documenta el origen exacto: el artefacto upstream `mlc-ai/SmolLM2-1.7B-Instruct-q4f16_1-MLC` en el commit `84f57f8580a9d8d623266b600ad4273bb9fd84c1`, procesado con la receta `recipes/smollm2-1.7b-instruct-q4f16.yaml` (sha256 `64ddf52e7506e6fe278435cf8a4a9df091f8091e5acd9c12c075bb698b415db6`). El autor afirma que cada byte del repositorio es derivable de esa fuente más la receta, sin edición manual.

La cadena de herramientas empleada fue Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64, con fecha de conversión 2026-09-22T19:04:54+00:00. En cuanto al entrenamiento del modelo subyacente (número de tokens, composición del dataset, uso de RLHF o DPO), no se aporta ningún dato en esta información y debe consultarse en la documentación oficial de SmolLM2-1.7B-Instruct. La innovación técnica del artefacto es la propia compilación a WebAssembly con backend WebGPU, que es lo que permite ejecutarlo dentro de un navegador.

## Capacidades

- Generación de texto y uso conversacional: el artefacto está etiquetado como `text-generation` y `conversational`, y el fichero `mlc-chat-config.json` define la plantilla de chat para WebLLM.
- Inferencia 100 % en el cliente: el binario `.wasm` de 5,59 MB y los shards de pesos se ejecutan en el navegador sobre WebGPU, sin enviar datos a un servidor.
- Ejecución offline: al no depender de una API remota, puede funcionar como aplicación web progresiva (PWA) con los pesos en caché.
- Tool calling / function calling: no declarado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no declarado en la información disponible.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas.
- Capacidades especiales (modo de razonamiento, visión, audio): no disponibles; el artefacto solo contiene módulos de texto.

## Casos de uso

- Asistentes embebidos en aplicaciones web con privacidad por diseño: el texto del usuario nunca sale del dispositivo porque todo el cálculo ocurre en WebGPU, lo que resulta adecuado para herramientas internas de empresa o sectores regulados.
- Autocompletado y reescritura de texto en editores online: con 4096 tokens de contexto se pueden procesar párrafos o documentos cortos completos sin trocear, y la latencia no depende de la red.
- Clasificación y etiquetado de textos breves en formularios: comentarios, tickets o descripciones de producto pueden categorizarse en el propio navegador antes de enviarse a un backend.
- Demos y prototipos de producto sin infraestructura: al no requerir GPU en servidor ni contenedores, un equipo de front-end puede validar una idea de funcionalidad LLM con solo publicar ficheros estáticos.
- Aplicaciones PWA con funcionamiento sin conexión: una vez cacheados el `.wasm` y los shards, la funcionalidad se mantiene en entornos con conectividad intermitente o nula.
- Respuestas sobre una base de conocimiento pequeña empaquetada: con 4096 tokens de ventana caben unas pocas páginas de documentación insertadas en el prompt, suficiente para asistentes de FAQ de alcance acotado.
- Preprocesado en cliente antes de escalar a un modelo mayor: resumir, limpiar o reformatear texto localmente para reducir el volumen y el coste de las llamadas a un modelo de mayor tamaño.
- Entornos educativos y de experimentación: permite que estudiantes prueben técnicas de prompting en un portátil, sin cuentas, claves de API ni coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye ninguna evaluación (MMLU, HumanEval, GSM8K ni similares), y al tratarse de una reconversión del checkpoint cuantizado de mlc-ai, cualquier medida de calidad debería referirse al modelo base o al artefacto upstream, no a este paquete.

## Requisitos de hardware

- Almacenamiento y descarga: 1,0 GB para el repositorio completo; los shards de pesos son la mayor parte del tamaño (el mayor es de 48 MB y el binario `.wasm` de 5,59 MB).
- VRAM estimada para inferencia: en torno a 1-1,5 GB para los pesos en `q4f16_1`, más el espacio de la caché KV para 4096 tokens y los búferes de WebGPU; una estimación prudente de trabajo es 1,5-2,5 GB de memoria de GPU o memoria unificada.
- GPU compatibles: cualquier GPU con soporte WebGPU; funciona en GPUs de escritorio y portátiles recientes, y en GPUs integradas modernas y en Apple Silicon gracias a la memoria unificada.
- ¿Cabe en GPU de consumo?: sí, es precisamente su objetivo; no requiere A100, H100 ni RTX 4090, aunque estas tarjetas obviamente lo ejecutan con holgura.
- Opciones de despliegue: WebLLM / MLC LLM en navegador (WebGPU sobre Chrome, Edge u otros navegadores compatibles). No es un formato cargable directamente por vLLM, llama.cpp, Ollama ni TGI; para esos entornos habría que partir del modelo base en safetensors o de una conversión GGUF.
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skillsafe-ai/smollm2-1.7b-instruct-q4f16 (este) | 1,7 B (modelo base) | 4096 tokens (`ctx4k`) | `q4f16_1` | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| mlc-ai/SmolLM2-1.7B-Instruct-q4f16_1-MLC (upstream) | 1,7 B | no disponible | `q4f16_1` | apache-2.0 | HuggingFace (commit 84f57f8 documentado) |
| HuggingFaceTB/SmolLM2-1.7B-Instruct (modelo base) | 1,7 B | no disponible en esta información | pesos originales en safetensors | apache-2.0 | HuggingFace, repositorio de referencia |
| Alternativas de tamaño similar (Qwen, Llama, Gemma en el rango 1-2 B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos comparativos de rendimiento frente a terceros, por lo que la comparación queda limitada a procedencia, formato y licencia. La diferencia práctica entre este repositorio y el upstream de mlc-ai no es de pesos —deriva de él— sino de empaquetado y trazabilidad: la receta, la cadena de herramientas y los hashes SHA-256 de cada fichero quedan publicados de forma explícita.

## Limitaciones y advertencias

- No hay ninguna evaluación publicada de este artefacto: ni de calidad de generación, ni de seguridad, ni de sesgos. Cualquier afirmación sobre su comportamiento en producción sería una extrapolación desde el modelo base.
- La cuantización `q4f16_1` introduce pérdida de precisión respecto a los pesos originales; se desconoce su impacto concreto porque no se aportan mediciones.
- Ventana de contexto de 4096 tokens: insuficiente para documentos largos, conversaciones extensas o tareas de recuperación aumentada con muchos fragmentos.
- Idiomas soportados no declarados. El modelo base es de origen anglófono, por lo que el rendimiento en castellano no está garantizado ni documentado en esta ficha.
- Riesgo de alucinación: inherente a los modelos de 1,7 B de parámetros; no se documentan mecanismos de mitigación ni evaluaciones de veracidad.
- Adopción nula: 0 descargas y 0 likes, sin issues ni validación por parte de la comunidad. No hay evidencia de uso en producción.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar la licencia del modelo base y de los artefactos upstream antes de redistribuir.
- Dependencia de WebGPU: el artefacto está compilado para ese backend; en navegadores o dispositivos sin WebGPU no funcionará y no existe un fallback en CPU incluido en este repositorio.
- Compatibilidad restringida: al estar en formato MLC, no puede cargarse con las herramientas habituales de servidor (vLLM, TGI, llama.cpp, Ollama) sin reconvertir el modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/skillsafe-ai/smollm2-1.7b-instruct-q4f16
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Artefacto upstream de MLC: https://huggingface.co/mlc-ai/SmolLM2-1.7B-Instruct-q4f16_1-MLC/tree/84f57f8580a9d8d623266b600ad4273bb9fd84c1
- Repositorio del conversor de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Búsqueda web realizada: no se han encontrado resultados relevantes; los enlaces devueltos corresponden a páginas corporativas de Microsoft y no guardan relación con este modelo.
