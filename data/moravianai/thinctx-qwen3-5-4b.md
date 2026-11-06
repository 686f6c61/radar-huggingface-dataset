# moravianai/ThinCtx-Qwen3.5-4B

## Resumen

ThinCtx-Qwen3.5-4B es una conversión del modelo Qwen3.5-4B desarrollada por Moravian AI que reduce drásticamente el coste de memoria GPU asociado al contexto largo. Mantiene los pesos originales en 16 bits (4.205.751.296 parámetros) pero externaliza la mayor parte de la caché de contexto a la memoria RAM del sistema, de modo que la memoria GPU dedicada al contexto crece aproximadamente 19 veces más despacio que en el modelo base: 1,0 GB frente a 16,5 GB a 540k tokens. La precisión se mantiene prácticamente intacta, con un 81,9 % de media frente al 82,5 % del original en BABILong, RULER (4k, 16k y 64k tokens) y BFCL non-live.

El modelo resuelve un problema concreto de ingeniería: ejecutar conversaciones o documentos de cientos de miles de tokens en GPUs con VRAM limitada sin recurrir a cuantización agresiva de los pesos ni a infraestructura multi-GPU. Para ello requiere un runtime propio, `thinctx` (versión mínima 0.2.0, recomendada 1.0.1 o superior), que es el encargado de gestionar la memoria del contexto; otras librerías de inferencia no reproducen este comportamiento con estos pesos. La librería expone tanto una CLI de chat como un servidor compatible con la API de chat-completions de OpenAI.

Es relevante ahora porque la ventana de contexto de los modelos abiertos ha crecido hasta rangos que hacen inviable la caché KV tradicional en hardware de consumo, y ThinCtx propone una vía intermedia: pesos sin tocar, contexto comprimido o externalizado y una penalización de velocidad acotada. La licencia PolyForm Small Business 1.0.0 permite uso gratuito a pequeñas empresas, uso personal, investigación no comercial y evaluación, pero exige licencia comercial para organizaciones grandes en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B, tipo `qwen3_5_text`); gestión de contexto mediante runtime ThinCtx |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como cifra oficial; se documentan evaluaciones y consumo de memoria hasta 540k tokens |
| Tipos de cuantizacion | Pesos en 16 bits en esta variante; variante `-small` con pesos cuantizados a ~5,4 bits por peso; contexto comprimido 2,5–3× con `--compress_context` (thinctx ≥ 1.0.2) |
| Idiomas soportados | Multilingüe; inglés (en), checo (cs), alemán (de) declarados explícitamente |
| Licencia | PolyForm Small Business 1.0.0 (`license: other`) |
| Formato de pesos | safetensors (repo de 8,9 GB) |

## Arquitectura y entrenamiento

ThinCtx-Qwen3.5-4B no es un modelo entrenado desde cero, sino una conversión de Qwen3.5-4B: conserva la arquitectura transformer del base y sus pesos originales en 16 bits. La innovación no reside en el entrenamiento sino en el tratamiento de la caché de contexto. La parte del contexto que permanece en GPU es pequeña y crece lentamente con la longitud de la conversación o del documento, mientras que el contexto completo se almacena en memoria de sistema convencional. En la variante `-small` los pesos se cuantizan a unos 5,4 bits por peso y el contexto almacenado se comprime entre 2,5 y 3 veces; en esta variante de pesos completos, el modo `--compress_context` aplica únicamente la compresión del contexto (no de los pesos), descargando del repositorio `-small` solo los ficheros del almacén comprimido (unos pocos MB) y verificando que corresponden a esta conversión.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, ya que el modelo hereda el entrenamiento del base. En el plano técnico, el runtime ThinCtx compila un pequeño lanzador con Triton en el primer arranque (requiere `gcc`), soporta compartición de memoria entre conversaciones en Linux nativo (no en WSL2) y ofrece un endpoint compatible con la API de OpenAI con streaming, herramientas y parámetro `enable_thinking`. La plantilla de chat y el formato de tool calling son los de Qwen3.5.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones, heredadas de Qwen3.5-4B.
- Procesamiento de contextos muy largos (documentos y conversaciones de hasta cientos de miles de tokens) con consumo de VRAM contenido.
- Tool calling / function calling mediante la plantilla de chat de Qwen3.5; evaluado en BFCL non-live.
- Modo de razonamiento activable (`enable_thinking`) a través del servidor compatible con OpenAI.
- Capacidades multilingües, con soporte declarado de inglés, checo y alemán además del multilingüe general.
- Servidor HTTP compatible con la API de chat-completions de OpenAI (`/v1/chat/completions`), con streaming y autenticación básica opcional.
- Compresión opcional del almacén de contexto en RAM (`--compress_context`), con una penalización de generación de aproximadamente el 5 %.
- No se documentan capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Análisis de documentos extensos: procesar contratos, informes o expedientes de cientos de miles de tokens manteniendo el contexto completo en RAM del sistema y solo una fracción en GPU, lo que permite trabajar con documentos que excederían la VRAM de una GPU de consumo.
- Asistentes de atención al cliente con historial largo: gestionar conversaciones multi-turno prolongadas sin que la caché KV sature la GPU, gracias a que la memoria GPU del contexto crece unas 19 veces más despacio que en el base.
- Agentes con tool calling: integrar el modelo en flujos de agentes que invocan funciones mediante la plantilla de Qwen3.5 y el endpoint compatible con OpenAI, con razonamiento multi-paso activable con `enable_thinking`.
- Despliegue en hardware limitado: servir el modelo en una única GPU NVIDIA con el runtime `thinctx`, usando `--compress_context` para reducir el contexto en RAM de 19,8 GB a 7,8 GB a 540k tokens.
- Procesamiento de corpus multilingües en inglés, checo y alemán: resumen, extracción de información y clasificación sobre textos largos en los idiomas declarados.
- Investigación académica y evaluación de modelos: uso gratuito para investigación no comercial y educación bajo la licencia PolyForm Small Business, útil para estudiar técnicas de gestión de contexto.
- Sustitución de un endpoint OpenAI en prototipos: apuntar clientes OpenAI existentes a `http://host:8000/v1` sin cambios de código en la capa de cliente.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando ThinCtx-Qwen3.5-4B con Qwen3.5-4B sin modificar sobre los mismos ítems:

| Conjunto | ThinCtx-Qwen3.5-4B | Qwen3.5-4B (base) |
|---|---|---|
| Media en BABILong, RULER (4k, 16k, 64k) y BFCL non-live | 81,9 % | 82,5 % |

| Métrica de memoria | ThinCtx-Qwen3.5-4B | Qwen3.5-4B (base) |
|---|---|---|
| Memoria GPU para contexto a 540k tokens | 1,0 GB | 16,5 GB |
| Contexto en RAM del sistema a 540k tokens (16 bits) | 19,8 GB | no aplica |
| Contexto en RAM del sistema a 540k tokens (con `--compress_context`) | 7,8 GB | no aplica |

No se han publicado en la información disponible resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K u otros) ni cifras de latencia o throughput concretas más allá de la indicación cualitativa de que la lectura de prompts largos es más lenta que en el modelo base y de que la generación con contexto comprimido es aproximadamente un 5 % más lenta.

## Requisitos de hardware

- GPU NVIDIA obligatoria; plataformas soportadas: Linux x86_64 o Windows 10/11 mediante WSL2. macOS no está soportado.
- Los pesos en 16 bits ocupan aproximadamente 8,4 GB (4.205.751.296 parámetros × 2 bytes), a lo que se suma la fracción de contexto en GPU (1,0 GB a 540k tokens).
- VRAM estimada para inferencia: no disponible como cifra oficial; en la práctica, los pesos en 16 bits más el contexto en GPU implican un mínimo por encima de los 8,4 GB de pesos, por lo que no cabe en GPUs de 8 GB y sí en GPUs de 12–16 GB o superiores, sujeto a verificación con el runtime.
- Contexto en RAM del sistema: 19,8 GB a 540k tokens en modo 16 bits; 7,8 GB con `--compress_context`.
- El wheel por defecto de PyTorch 2.11 requiere un driver con soporte de CUDA 13; con drivers más antiguos debe instalarse `torch==2.11.*` desde el índice `cu128`.
- Triton compila un lanzador en el primer arranque y necesita `gcc` (paquete `build-essential` en Debian/Ubuntu).
- Despliegue exclusivamente mediante el runtime `thinctx` (CLI `thinctx chat`, servidor `thinctx serve`, API Python `thinctx.load`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- En WSL2 no está disponible la compartición de memoria entre conversaciones; se recomienda añadir `autoMemoryReclaim=dropcache` en `%UserProfile%\.wslconfig`.
- Latencia y throughput: no disponibles como cifras; el autor indica que la lectura de prompts largos es más lenta que en el modelo base y que la generación con contexto comprimido es aproximadamente un 5 % más lenta que con contexto de 16 bits.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria GPU de contexto a 540k | Licencia | Runtime |
|---|---|---|---|---|---|
| ThinCtx-Qwen3.5-4B | 4.205.751.296 | hasta 540k documentados | 1,0 GB | PolyForm Small Business 1.0.0 | thinctx |
| Qwen3.5-4B (base) | no disponible en la información | no disponible | 16,5 GB | no disponible en la información | librerías estándar |
| ThinCtx-Qwen3.5-4B-small | no disponible en la información (pesos a ~5,4 bits) | hasta 540k documentados | no disponible | PolyForm Small Business 1.0.0 | thinctx |

No se dispone de datos sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Dependencia total del runtime `thinctx`: los pesos no ofrecen la gestión de contexto reducida en otras librerías de inferencia, lo que limita la portabilidad y crea dependencia de un proveedor.
- Plataformas restringidas: solo Linux x86_64 y Windows vía WSL2 con GPU NVIDIA; macOS no está soportado.
- Mayor latencia en la lectura de prompts largos en comparación con el modelo base.
- La compresión de contexto introduce una penalización de generación de aproximadamente el 5 %.
- La compartición de memoria entre conversaciones no está disponible en WSL2.
- Licencia PolyForm Small Business 1.0.0: uso gratuito solo para pequeñas empresas, uso personal, investigación no comercial, educación y evaluación; las organizaciones grandes en producción deben contactar con el autor para obtener una licencia comercial.
- El acceso al modelo está sujeto a un formulario de aceptación (gated) que solicita nombre, empresa y correo electrónico.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas de sesgo ni de tasas de alucinación en la información disponible; al heredar el comportamiento del base, deben aplicarse las precauciones habituales en producción.
- Pérdida de precisión media de 0,6 puntos porcentuales frente al base en el conjunto agregado de benchmarks publicados.
- Los resultados de memoria y precisión proceden del propio autor y no se han verificado de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moravianai/ThinCtx-Qwen3.5-4B
- Variante cuantizada: https://huggingface.co/moravianai/ThinCtx-Qwen3.5-4B-small
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Sitio del desarrollador: https://moravian.ai/
- Contacto para licencia comercial: info@moravian.ai
