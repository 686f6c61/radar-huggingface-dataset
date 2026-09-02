# blackbearreloaded/ProsperoAI-Qwen3.5-9B-Q4_0-PS5

## Resumen

ProsperoAI-Qwen3.5-9B-Q4_0-PS5 es una conversión de formato lista para instalar del modelo Qwen3.5-9B, adaptada específicamente para el runtime nativo de GPU de PlayStation 5 dentro de la aplicación ProsperoAI (PPSA99004). El autor, BlackBearReloaded, ha transformado los pesos GGUF Q4_0 de unsloth/Qwen3.5-9B-GGUF a un contenedor P5LM propietario que permite ejecutar inferencia de texto completamente offline en la consola, sin depender de ninguna API en la nube. No se trata de un fine-tune, sino de una conversión de runtime que preserva los pesos originales del modelo base.

El modelo base Qwen3.5-9B es un modelo denso multimodal de 9 000 millones de parámetros con una arquitectura híbrida que combina 24 capas recurrentes y 8 capas de atención completa, con soporte nativo de contexto de 262 144 tokens. Sin embargo, esta conversión para PS5 está limitada por la aplicación a 4 096 tokens de contexto y solo incluye la parte de texto, excluyendo el proyector de visión. La relevancia de este proyecto radica en demostrar que un LLM de 9B puede ejecutarse localmente en hardware de consola doméstica, abriendo nuevas posibilidades para IA privada y sin conexión en plataformas no convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas recurrentes + 8 capas de atención completa (gated delta networks) |
| Parametros totales | 9 000 millones (9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4 096 tokens (límite de la app ProsperoAI; el modelo base soporta 262 144) |
| Tipos de cuantizacion | Q4_0 con tensores mixtos Q4_1, Q8_0, Q5_K y Q6_K |
| Idiomas soportados | No disponible (el modelo base Qwen3.5-9B es multilingüe, pero la conversión no especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | P5LM (propietario para PS5), tokenizer.ps5tok, model.json |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.5-9B es un transformer híbrido que combina 24 capas recurrentes con 8 capas de atención completa, utilizando gated delta networks para el procesamiento recurrente. Las dimensiones clave son: ancho de embedding de 4 096, ancho de feed-forward de 12 288, 16 cabezas de atención, 4 cabezas KV, dimensión de cabeza de 256, tamaño de vocabulario de 248 320, secciones RoPE 11/11/10 con base de frecuencia 10 000 000, estado recurrente de tamaño 128 con 16 grupos y ancho de convolución 4. El modelo base fue entrenado con técnicas de aprendizaje por refuerzo a escala y soporta multimodalidad, aunque esta conversión solo incluye la parte de texto.

La conversión de BlackBearReloaded no modifica los pesos ni realiza entrenamiento adicional. Se limita a reempaquetar los tensores GGUF Q4_0 en el formato P5LM, validando que la arquitectura coincida exactamente con el perfil esperado por el runtime de ProsperoAI (427 tensores en la disposición correcta). El runtime ejecuta los pesos residentes en GPU con estado recurrente y KV, mientras que la orquestación y tokenización se realizan en CPU. La decodificación actual es greedy, sin muestreo sofisticado.

## Capacidades

- Generación de texto y chat conversacional: el modelo puede mantener diálogos multi-turno dentro del límite de 4 096 tokens de la aplicación.
- Razonamiento y resolución de problemas: hereda las capacidades de razonamiento del modelo base Qwen3.5-9B, aunque limitado por el contexto reducido.
- Generación de código: el modelo base tiene capacidades de programación, disponibles en esta conversión para tareas de asistencia de código.
- Comprensión multilingüe: el modelo base soporta múltiples idiomas, aunque la conversión no documenta explícitamente qué idiomas están disponibles.
- Ejecución 100 % local y offline: no requiere conexión a internet ni API externa, garantizando privacidad de los datos.
- Cambio dinámico de arquitectura: el runtime permite alternar entre modelos de diferentes arquitecturas (por ejemplo, Qwen y Mistral) mediante la función Workshop, liberando memoria al cambiar.

## Casos de uso

- Asistente personal local en consola: los usuarios de PS5 pueden mantener conversaciones privadas con un LLM sin enviar datos a servidores externos, útil para consultas personales o brainstorming.
- Chat de soporte técnico en juegos: los desarrolladores podrían integrar este modelo en la consola para ofrecer ayuda contextual sobre mecánicas de juego, aprovechando la ejecución local y la baja latencia de decodificación (~30 tokens/s).
- Generación de diálogos para prototipos: los creadores de contenido pueden usar el modelo para redactar guiones o diálogos de personajes directamente en la consola, sin necesidad de un PC adicional.
- Educación y aprendizaje de IA: sirve como plataforma de experimentación para estudiantes que quieran probar un LLM de 9B en hardware accesible, sin costes de GPU en la nube.
- Asistencia de código en proyectos personales: aunque la consola no es un entorno de desarrollo típico, el modelo puede ayudar a generar fragmentos de código o explicar conceptos de programación durante sesiones de creación de mods o scripts.
- Demostraciones y ferias tecnológicas: permite mostrar IA generativa funcionando en una consola comercial, un caso de uso atractivo para eventos y exhibiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K u otros estándares. Los resultados web sobre el modelo base Qwen3.5-9B mencionan mejoras cualitativas frente a Qwen3-VL en razonamiento, código, agentes y comprensión visual, pero sin cifras concretas. El único dato de rendimiento verificado es el proporcionado por el autor: decodificación de aproximadamente 30 tokens por segundo a contexto corto, prefilling de un prompt de 44 tokens en 1,46 segundos y carga en frío de unos 4 segundos.

## Requisitos de hardware

- Plataforma: exclusivamente PlayStation 5 con la aplicación ProsperoAI (PPSA99004) instalada.
- Memoria: la PS5 dispone de 16 GB de GDDR6 unificada; el modelo ocupa 6,8 GB en disco (archivo model.ps5lm de 6 828 326 912 bytes).
- Almacenamiento: se requiere copiar la carpeta `qwen3.5-9b-q4-0` en el directorio `models` de la aplicación.
- GPU: AMD GPU de PS5 a través del path de compute AGC nativo; no es compatible con CUDA, ROCm, llama.cpp, Ollama ni otros runtimes de escritorio.
- Rendimiento: decodificación ~30 tokens/s a contexto corto; la velocidad de atención se degrada a medida que crece el contexto.
- Despliegue: solo mediante el runtime ProsperoAI; no se puede ejecutar en otros entornos sin conversión adicional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 9B denso | 262 144 tokens | Texto + visión | Apache 2.0 | safetensors, GGUF |
| ProsperoAI-Qwen3.5-9B-Q4_0-PS5 | 9B denso | 4 096 tokens (app) | Solo texto | Apache 2.0 | P5LM (PS5) |
| ProsperoAI-Mistral-7B-Instruct-v0.3-Q4_0-PS5 | 7B denso | No disponible | Solo texto | Apache 2.0 | P5LM (PS5) |

La comparativa se limita a las versiones disponibles para ProsperoAI y al modelo base original. No se dispone de datos de rendimiento comparativos entre estas opciones. La principal diferencia entre la conversión y el modelo base es la reducción drástica del contexto (de 262 144 a 4 096 tokens) y la pérdida de la modalidad visual.

## Limitaciones y advertencias

- Requiere un entorno PS5 con la aplicación ProsperoAI instalada; no funciona en otros sistemas.
- Solo se admite la arquitectura y el perfil de tensores exactos descritos; otros modelos necesitan conversión específica.
- Inferencia de texto únicamente: el proyector de visión y la entrada de imágenes no están incluidos.
- El límite de 4 096 tokens de la aplicación es muy inferior al contexto nativo del modelo base, lo que restringe tareas que requieren contexto largo.
- Los prompts largos son sustancialmente más lentos que los cortos, según el autor.
- La decodificación greedy limita la diversidad de las respuestas; no hay soporte de muestreo avanzado.
- No se han publicado evaluaciones de sesgos, alucinaciones o seguridad específicas para esta conversión; se debe seguir la guía de uso aceptable del modelo base Qwen.
- El formato P5LM es propietario y no es compatible con herramientas estándar de la comunidad (llama.cpp, vLLM, etc.), lo que dificulta la portabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/blackbearreloaded/ProsperoAI-Qwen3.5-9B-Q4_0-PS5
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- GGUF de origen (unsloth): https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Página del modelo en Ollama: https://ollama.com/library/qwen3.5:9b
- Página del modelo en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-9b
- Recetas vLLM para Qwen3.5-9B: https://recipes.vllm.ai/Qwen/Qwen3.5-9B
- Búsqueda de modelos ProsperoAI en HuggingFace: https://huggingface.co/models?other=prosperoai
