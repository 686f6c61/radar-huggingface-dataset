# LilVague/tiny-ai-files

## Resumen

tiny-ai-files es un repositorio de artefactos de inferencia en el navegador publicado por el usuario LilVague, no un modelo entrenado desde cero. Contiene versiones cuantizadas a 4 bits de la familia Qwen3.5 (variantes de 0,8B, 2B y 4B), empaquetadas en un formato propio del chat web tiny-ai y pensadas para ejecutarse mediante ONNX Runtime Web con WebGPU y WebAssembly. El repositorio incluye además paquetes de conocimiento por materia, un enrutador que selecciona el paquete adecuado y un fichero de puntuaciones de esos paquetes.

La relevancia del proyecto es práctica: demuestra un patrón de despliegue de LLM completamente local en el navegador, sin backend, combinando cuantización agresiva, poda de vocabulario y enrutamiento de contenido. El tamaño del repositorio (4,9 GB) refleja que aloja varios modelos y paquetes auxiliares, no un único checkpoint.

Hay que subrayar que los pesos han sido modificados respecto a los originales de Qwen: redondeo a 4 bits, recorte del vocabulario a los tokens usados en inglés y código, y edición de algunos pesos. Esto implica que el comportamiento no es equivalente al de los modelos Qwen3.5 originales y que el soporte multilingüe queda severamente reducido por diseño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (heredada de Qwen3.5; detalles no disponibles) |
| Parametros totales | 0,8B / 2B / 4B (tres variantes incluidas) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (formato propio del chat tiny-ai) |
| Idiomas soportados | inglés y código (vocabulario recortado a esos tokens); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ejecución vía WebGPU/WebAssembly); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio no documenta entrenamiento propio: parte de los modelos Qwen3.5 de 0,8B, 2B y 4B publicados por Qwen bajo Apache 2.0 y aplica un proceso de post-procesado. Ese proceso consiste en cuantización a 4 bits en un formato específico del chat tiny-ai, reducción del vocabulario a los tokens empleados en inglés y código, y edición selectiva de algunos pesos. No se especifican ni el número de tokens de entrenamiento original, ni la composición del dataset, ni si hubo RLHF o DPO en los modelos base.

La innovación técnica del proyecto no está en el modelo sino en el sistema de despliegue: ejecución ONNX en el navegador con aceleración WebGPU y fallback a WebAssembly, junto con un enrutador que selecciona paquetes de conocimiento por materia (`packs/`) según la consulta, y un fichero `packages.json` con las puntuaciones de cada paquete. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto en inglés, con calidad limitada por el tamaño de los modelos (0,8B a 4B) y por la cuantización a 4 bits.
- Generación y asistencia de código, favorecida por el recorte de vocabulario orientado a tokens de programación.
- Ejecución local en el navegador sin servidor, mediante WebGPU o WebAssembly.
- Enrutamiento por materia: el sistema selecciona paquetes de conocimiento específicos para la consulta.
- Soporte multilingüe muy restringido: el vocabulario recortado elimina gran parte de los tokens no ingleses.
- Tool calling, function calling, agentes multi-paso, visión, audio y modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Demostración de LLM en el navegador: el repositorio sirve como referencia para implementar inferencia local con ONNX Runtime Web y WebGPU, útil para prototipos de asistentes sin backend.
- Asistencia de código en entornos sin conectividad: la variante de 4B, con vocabulario orientado a código, puede ofrecer autocompletado y explicación de fragmentos en herramientas web offline.
- Chat educativo con conocimiento acotado: el enrutador y los paquetes por materia permiten respuestas guiadas sobre temas concretos sin desplegar un modelo grande.
- Evaluación de técnicas de compresión: sirve para estudiar el impacto de la cuantización a 4 bits y del recorte de vocabulario en la calidad de salida de modelos pequeños.
- Procesamiento de texto en el cliente por privacidad: al ejecutarse íntegramente en el navegador, los datos del usuario no salen del dispositivo, adecuado para resúmenes o clasificación de texto sensible.
- Prototipado de aplicaciones web con IA embebida: los formatos y el enrutador pueden reutilizarse como base para integrar generación de texto en aplicaciones estáticas sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ejecutarse en navegador, el consumo depende de la variante (0,8B, 2B o 4B) y del backend (WebGPU usa memoria de GPU, WebAssembly usa RAM del sistema).
- GPU recomendadas: no disponibles; se requiere un navegador con soporte de WebGPU para aceleración por GPU.
- GPU de consumo: no se especifica compatibilidad con modelos concretos como RTX 4090; el proyecto está orientado a hardware de usuario final vía navegador.
- Opciones de despliegue: ONNX Runtime Web con WebGPU y WebAssembly; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y los ficheros no son compatibles con esas herramientas según la propia model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| tiny-ai-files (Qwen3.5 4 bits) | 0,8B / 2B / 4B | no disponible | ONNX propio | Apache 2.0 | Sí (WebGPU/WASM) |
| Qwen3.5 original | 0,8B / 2B / 4B | no disponible | safetensors | Apache 2.0 | No directamente |
| Otros LLM pequeños en navegador | no disponible | no disponible | no disponible | no disponible | Parcial |

La comparación directa con alternativas de la misma categoría (LLM ejecutables en navegador) no está disponible en la información proporcionada. Frente a los Qwen3.5 originales, la diferencia principal es la cuantización a 4 bits, el recorte de vocabulario y la edición de pesos, que reducen el soporte multilingüe y alteran el comportamiento respecto al modelo base.

## Limitaciones y advertencias

- Los pesos han sido modificados (cuantización, recorte de vocabulario y edición de pesos): los resultados no son reproducibles respecto a Qwen3.5 original y no deben tratarse como equivalentes.
- El vocabulario recortado a inglés y código degrada o impide la generación en otros idiomas, incluido el castellano.
- Los ficheros son específicos del chat tiny-ai y no están pensados para otras librerías; no hay conversión documentada a GGUF, safetensors ni otros formatos.
- No hay información sobre sesgos, tasas de alucinación ni evaluación de calidad; al ser modelos pequeños y cuantizados, el riesgo de alucinación es previsiblemente alto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- La licencia Apache 2.0 permite uso comercial, pero la edición de pesos y la falta de documentación del proceso de modificación dificultan la trazabilidad para producción.
- El rendimiento depende del navegador y del soporte de WebGPU del dispositivo; no hay datos de latencia ni de memoria necesaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LilVague/tiny-ai-files
- Demo del chat tiny-ai: https://huggingface.co/spaces/LilVague/tiny-ai
- Sitio espejo: https://tiny-ai.duckii.dev
- Modelo base Qwen3.5 0,8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base Qwen3.5 2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo base Qwen3.5 4B: https://huggingface.co/Qwen/Qwen3.5-4B
