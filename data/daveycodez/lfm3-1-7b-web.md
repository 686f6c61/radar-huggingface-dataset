# daveycodez/LFM3-1.7B-Web

## Resumen

LFM3-1.7B-Web es una construcción comunitaria no oficial, creada por el usuario daveycodez, del modelo LFM3-1.7B de Liquid AI, optimizada específicamente para ejecutarse en el navegador con Transformers.js sobre WebGPU, incluido Safari en iPhone. Se trata de una versión ONNX re-cuantizada a 4 bits (q4f16) que reduce el tamaño de los pesos respecto a la compilación oficial de onnx-community, manteniendo la fidelidad al modelo original e incluso mejorando algunos comportamientos.

El modelo base, LFM3-1.7B, es un modelo de generación de texto conversacional de Liquid AI con arquitectura de tipo liquid (LFM, Liquid Foundation Model), diseñado para ofrecer buen rendimiento con muy pocos parámetros. Esta variante web resuelve el problema de ejecutar LLMs pequeños localmente en dispositivos cliente sin servidor, algo relevante para aplicaciones de IA privadas (los datos no salen del dispositivo) y sin coste de inferencia en la nube.

Entre las optimizaciones destacan un vocabulario reducido de 128.000 a 49.012 tokens BPE, caches rotatorios acortados a 16.384 posiciones y flash attention para las capas de ventana deslizante, lo que reduce los buffers de GPU y acelera el procesamiento de prompts largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo LFM (Liquid Foundation Model) de Liquid AI, con capas de ventana deslizante (sliding window, ventana 256) y GQA |
| Parametros totales | 1,7 mil millones (modelo base) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | 16.384 tokens en esta compilación (el modelo original soporta 262.144) |
| Tipos de cuantizacion | 4 bits (q4f16), GPTQ sobre matrices MatMulNBits con block size 32; embeddings/LM head re-cuantizados |
| Idiomas soportados | no disponible (el vocabulario reducido penaliza el texto no inglés, que se divide en más tokens) |
| Licencia | LFM Open License v1.0 (uso comercial solo para entidades con ingresos anuales inferiores a 10 millones de dólares) |
| Formato de pesos | ONNX (model_q4f16.onnx), para Transformers.js con WebGPU |

## Arquitectura y entrenamiento

La arquitectura base es LFM3-1.7B de Liquid AI, un transformer con mecanismos propios de la familia LFM: incluye cinco capas de atención con ventana deslizante de 256 tokens, GroupQueryAttention en el resto de capas y embeddings/LM head compartidos (tied). Los detalles completos de la arquitectura y del proceso de entrenamiento del modelo base (tokens de entrenamiento, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

Esta compilación no reentrena el modelo: aplica cuantización GPTQ a 4 bits con block size 32 sobre el modelo fp16, usando como datos de calibración unos 36.000 tokens del split de entrenamiento de WikiText-2 más respuestas de chat generadas por el propio modelo fp16. Las proyecciones gate, up, q, k y v usan cuantización simétrica (sin zero points), lo que permite que onnxruntime-web aplique sus kernels fusionados de WebGPU. Además, se eliminó un `Reshape` redundante en el grafo que provocaba una copia extra de los pesos del embedding al crear la sesión, y se habilitó flash attention para las capas de ventana deslizante usando un bias de atención en lugar de `local_window_size`.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, con chat template intacto respecto al modelo original).
- Tool calling / function calling: la compilación emite llamadas directas a herramientas en 20 de 20 prompts de prueba, igual que el modelo fp16 (la cuantización oficial solo lo lograba en 13 de 20).
- Tokens especiales de chat, tool calling y thinking conservados en el vocabulario reducido.
- Ejecución completamente en el navegador mediante Transformers.js y WebGPU, compatible con Safari en iPhone.
- Tokenización y decodificación exactas de cualquier texto pese al vocabulario reducido (los merges se mantienen consistentes); las palabras poco comunes y el texto no inglés se dividen en más tokens.
- Capacidades de razonamiento, código o matemáticas del modelo base: no disponible en la información proporcionada.

## Casos de uso

- Chatbots que corren al 100 % en el cliente: el modelo se ejecuta en el navegador vía WebGPU, ideal para asistentes conversacionales que garantizan privacidad total al no enviar datos a ningún servidor.
- Asistentes en móviles, incluido iPhone: la compatibilidad con Safari en iPhone permite integrar IA generativa en webs que funcionen en dispositivos Apple sin apps nativas.
- Agentes con tool calling en el navegador: la compilación conserva los tokens de tool-call y responde con llamadas directas a herramientas de forma fiable, útil para agentes ligeros que invocan APIs del cliente (geolocalización, calendario, etc.).
- Prototipado de productos con IA sin backend: al no requerir infraestructura de inferencia, es adecuado para demos y MVPs con coste de servidor cero.
- Aplicaciones con funcionalidad offline: al descargarse los pesos al navegador (unos 900 MB de datos de modelo), la aplicación puede seguir funcionando sin conexión una vez cacheados.
- Resumen y redacción de textos en el dispositivo: con 16.384 tokens de contexto, puede procesar documentos de longitud moderada localmente, aunque el vocabulario reducido penaliza el texto no inglés.

## Benchmarks y rendimiento

Datos medidos por el autor de la compilación con onnxruntime 1.31, comparando con la cuantización oficial q4f16 de onnx-community (perplejidad de WikiText-2 por token original; fp16 de referencia: 24,87):

| Métrica | q4f16 original | Esta compilación |
|---|---|---|
| Tamaño de `model_q4f16.onnx_data` | 1.087.789.056 bytes | 900.061.184 bytes (−188 MB) |
| Perplejidad WikiText-2 test (por token original) | 27,10 | 29,17 |
| Concordancia top-1 con fp16 en prompts de chat | 81,0 % | 89,1 % |
| Divergencia KL respecto a fp16 en prompts de chat | 0,153 | 0,083 |
| Prompts respondidos con tool call directo (fp16: 20/20) | 13/20 | 20/20 |
| Longitud máxima de secuencia | 262.144 | 16.384 |

Adicionalmente, el autor reporta que con flash attention en las capas de ventana deslizante, los buffers máximos de GPU para un prompt de 2.859 tokens bajaron de 1.575 MB a 1.342 MB en un Mac, con un procesamiento de prompts de esa longitud aproximadamente un 5 % más rápido. No hay benchmarks estándar (MMLU, HumanEval, GSM8K) publicados para esta compilación.

## Requisitos de hardware

- Al ejecutarse en el navegador vía WebGPU, no requiere GPU de datacenter ni CUDA; basta un navegador con soporte WebGPU (Chrome, Edge, Safari en macOS e iOS).
- Memoria de GPU: los buffers máximos para un prompt de 2.859 tokens son de unos 1.342 MB según las mediciones del autor; el archivo de pesos ocupa unos 900 MB. Se recomienda un dispositivo con al menos 4-6 GB de VRAM/RAM de GPU disponible.
- Compatible con portátiles y sobremesa con GPU integrada o dedicada moderna (Apple Silicon, RTX de consumo con WebGPU) y con iPhone vía Safari.
- Despliegue: Transformers.js (librería indicada en la ficha), con `dtype: "q4f16"` y `device: "webgpu"`; el uso es idéntico al de onnx-community/LFM3-1.7B-ONNX. No aplica vLLM, TGI, llama.cpp ni Ollama al ser un build ONNX para navegador.
- Latencia y throughput: no disponibles en la información proporcionada (solo se indica una mejora de ~5 % en procesamiento de prompts largos respecto a la compilación oficial).

## Comparativa con modelos similares

| | LFM3-1.7B-Web (esta ficha) | onnx-community/LFM3-1.7B-ONNX | LiquidAI/LFM3-1.7B (original) |
|---|---|---|---|
| Parametros | 1,7B | 1,7B | 1,7B |
| Formato | ONNX q4f16 (re-cuantizado, vocabulario 49.152 filas) | ONNX q4f16 | Pesos originales (formato completo no disponible) |
| Contexto | 16.384 | 262.144 | 262.144 |
| Concordancia top-1 con fp16 | 89,1 % | 81,0 % | referencia |
| Tamaño de pesos | ~900 MB | ~1.088 MB | no disponible |
| Licencia | LFM Open License v1.0 | LFM Open License v1.0 | LFM Open License v1.0 |
| Mantenimiento | Comunidad (no oficial) | onnx-community | Liquid AI |

Alternativas de otros fabricantes en la misma categoría de peso (Qwen3-1.7B, Gemma 3 1B, etc.): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Es una construcción comunitaria no oficial: no está hecha, revisada ni respaldada por Liquid AI.
- La longitud de contexto se reduce de 262.144 a 16.384 tokens; las secuencias más largas fallan con un error explícito.
- El vocabulario reducido (49.012 tokens BPE frente a 128.000) hace que las palabras poco comunes y el texto no inglés se tokenicen en más tokens, encareciendo la inferencia en esos casos.
- La perplejidad en WikiText-2 empeora ligeramente (29,17 frente a 27,10 de la cuantización oficial), aunque la concordancia con fp16 en chat mejora; el propio autor advierte que las métricas de WikiText favorecen ligeramente esta compilación porque la calibración usó texto de WikiText.
- Licencia LFM Open License v1.0: el uso comercial solo está permitido a entidades con ingresos anuales inferiores a 10 millones de dólares; verificar el texto de la licencia antes de usar en producto.
- Riesgo de alucinación, sesgos y limitaciones de idioma del modelo base: no disponibles en la información proporcionada, pero aplicables por tratarse de un LLM generativo de 1,7B parámetros.
- Requiere navegador con WebGPU; en navegadores sin soporte la ejecución no funcionará o será mucho más lenta.
- Los pesos de ~900 MB deben descargarse al navegador, lo que implica una carga inicial significativa.

## Enlaces

- Ficha del modelo: https://huggingface.co/daveycodez/LFM3-1.7B-Web
- Modelo base: https://huggingface.co/LiquidAI/LiquidAI/LFM3-1.7B (referenciado como LiquidAI/LFM3-1.7B)
- Compilación ONNX oficial: https://huggingface.co/onnx-community/LFM3-1.7B-ONNX
- Transformers.js: https://github.com/huggingface/transformers.js
- Liquid AI: https://www.liquid.ai/
- Licencia LFM Open License v1.0: enlace en el archivo LICENSE del repositorio del modelo
