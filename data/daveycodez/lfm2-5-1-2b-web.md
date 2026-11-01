# daveycodez/LFM2.5-1.2B-Web

## Resumen

LFM2.5-1.2B-Web es una build comunitaria no oficial, creada por el usuario daveycodez, del modelo LFM2.5-1.2B-Instruct de Liquid AI, optimizada para ejecutarse directamente en el navegador. Se trata de una versión ONNX cuantizada a 4 bits (q4f16) pensada para funcionar con Transformers.js sobre WebGPU, incluido Safari en iPhone. El modelo base, LFM2.5-1.2B-Instruct, es un modelo de lenguaje compacto de la familia LFM (Liquid Foundation Models) de Liquid AI.

El problema que resuelve esta build es concreto y técnico: el grafo ONNX original calcula logits float32 para todas las posiciones del prompt, lo que genera tensores enormes (por ejemplo, 210 MB para un prompt de 800 tokens) que pueden provocar el cierre de pestañas en navegadores con memoria limitada, como Safari en iPhone. Esta versión añade una entrada `num_logits_to_keep` que permite calcular logits solo para las posiciones necesarias, reduciendo el tensor de logits a 262 KB en generación.

Su relevancia actual radica en la tendencia de ejecutar LLMs localmente en dispositivos cliente sin servidor, garantizando privacidad y latencia mínima. Con 1.200 millones de parámetros, cuantización a 4 bits y un tamaño de repositorio de 1,6 GB, es un candidato idóneo para aplicaciones web conversacionales que necesitan funcionar incluso en móviles con restricciones de memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM (Liquid Foundation Models), híbrida según la familia LFM2.5 (transformer + capas convolucionales para el cache; detalle exacto no disponible en la información proporcionada) |
| Parámetros totales | 1.200 millones (aproximado, según denominación del modelo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (consultar la ficha del modelo base LiquidAI/LFM2.5-1.2B-Instruct) |
| Tipos de cuantización | q4f16 (pesos a 4 bits, activaciones float16) |
| Idiomas soportados | Inglés, japonés, coreano, francés, español, alemán, italiano, portugués, árabe, chino |
| Licencia | LFM Open License v1.0 (uso comercial restringido a entidades con ingresos anuales inferiores a 10 millones de dólares) |
| Formato de pesos | ONNX (solo variante q4f16, con pesos externos en `onnx/model_q4f16.onnx_data`) |

## Arquitectura y entrenamiento

El modelo base, LFM2.5-1.2B-Instruct de Liquid AI, pertenece a la familia LFM, caracterizada por arquitecturas híbridas que combinan capas de atención de transformer con capas recurrentes/convolucionales, lo que reduce el coste de la caché KV y mejora la eficiencia en inferencia. Esta build no modifica los pesos: el archivo `onnx/model_q4f16.onnx_data` es byte-idéntico al original (SHA-256 `46cfacc12941150620a3f644a5269e9baebd75d681cfa09cadeef71b8ed64ac2`).

La única modificación es en el grafo ONNX: se añaden tres nodos (`Neg`, `Unsqueeze`, `Slice`), tres constantes int64 y la entrada `num_logits_to_keep` (escalar int64). Esta entrada permite recortar los hidden states tras la normalización final a las últimas posiciones antes de la cabeza de lenguaje, de modo que durante la generación Transformers.js pasa el valor `1` y solo se calcula una fila de logits en lugar de una por cada token del prompt. Los archivos de configuración, tokenizador y plantilla de chat son copias sin cambios del original. Los datos de entrenamiento del modelo base no se detallan en la información disponible.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, formato conversacional con plantilla de chat incluida).
- Soporte multilingüe en diez idiomas: inglés, japonés, coreano, francés, español, alemán, italiano, portugués, árabe y chino.
- Ejecución en navegador con Transformers.js sobre WebGPU, incluido Safari en iPhone.
- Compatible con generación directa vía onnxruntime (CPU o WebGPU), con control explícito de `num_logits_to_keep`.
- El modelo base incluye soporte de tool calling según la familia LFM2.5, y la model card menciona pruebas con prompts de herramientas de 541 tokens, aunque el soporte específico en esta build depende del modelo original.
- Cuantización q4f16 que reduce drásticamente los requisitos de memoria frente a pesos en precisión completa.

## Casos de uso

- Chatbots conversacionales en el navegador: el modelo se ejecuta íntegramente en el cliente con WebGPU, sin enviar datos a ningún servidor, lo que lo hace adecuado para asistentes con requisitos de privacidad estrictos.
- Asistentes en dispositivos móviles vía Safari: la optimización de logits permite ejecutarlo en iPhone, donde las pestañas disponen de unos 2 GB de memoria, escenario que hacía fallar la build original con prompts largos.
- Aplicaciones con definiciones de herramientas (tool definitions) en el prompt: la reducción del tensor de logits hace viables prompts de varios cientos de tokens con esquemas de funciones, algo que antes agotaba la memoria en móvil.
- Prototipado rápido de LLMs sin backend: al ser compatible con Transformers.js, permite integrar el modelo en aplicaciones web estáticas o demos sin infraestructura de inferencia.
- Asistentes multilingües ligeros: cubre diez idiomas, incluidos español, chino, japonés y árabe, útil para productos con audiencia internacional en formato web.
- Procesamiento local de texto sensible: resúmenes o reescritura de textos en entornos corporativos donde los datos no pueden salir del dispositivo del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta build. La model card sí incluye mediciones de latencia comparativas entre la build original y esta versión:

| Escenario | Original q4f16 | Esta build |
|---|---|---|
| Prompt de herramientas de 541 tokens + 24 tokens generados (Transformers.js 4.3.2, WebGPU, Node en Apple Silicon) | 250–259 ms | 222–228 ms |
| Prompt de 963 tokens (onnxruntime CPU) | 1.669 ms | 1.497 ms |
| Logits para prompt de 800 tokens | [1, 800, 65536] ≈ 210 MB | [1, 1, 65536] ≈ 262 KB |

La diferencia máxima absoluta en los logits del último token es de ≤ 0,0078 (sobre logits de hasta ±17), con el mismo token superior en todos los prompts probados. La generación greedy produce tokens idénticos con ambas versiones.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio completo pesa 1,6 GB; en el navegador, el modelo cuantizado q4f16 requiere del orden de 1–2 GB de memoria disponible, incluida la memoria GPU (limitación crítica en iPhone Safari, con ~2 GB por pestaña).
- GPU recomendadas: cualquier GPU con soporte WebGPU (Chrome, Edge, Safari 16.4+). En escritorio, GPUs integradas modernas o dedicadas (Apple Silicon, RTX de serie 30/40) son suficientes dado el tamaño reducido del modelo.
- Consumer GPUs: sí, cabe con holgura; al ejecutarse en navegador, no se requiere GPU dedicada, funcionando también en portátiles y móviles.
- Opciones de despliegue: Transformers.js v4.3.2+ con `dtype: "q4f16"` y `device: "webgpu"`; también onnxruntime (Node o web) pasando `num_logits_to_keep` como escalar int64 (`1` para generación, `0` para todas las posiciones). No requiere llama.cpp, vLLM ni Ollama al ser un build ONNX específico para web.
- Latencia: 222–228 ms para un prompt de 541 tokens con herramientas más 24 tokens generados en WebGPU (Apple Silicon); 1.497 ms para un prompt de 963 tokens en CPU con onnxruntime 1.31.

## Comparativa con modelos similares

| Característica | LFM2.5-1.2B-Web (esta build) | LFM2.5-1.2B-Instruct-ONNX (original) | LFM3-1.7B-ONNX (onnx-community) |
|---|---|---|---|
| Parámetros | ~1.200 M | ~1.200 M | ~1.700 M |
| Cuantización | q4f16 | q4f16 (entre otras) | No disponible en detalle |
| Logits recortados (`num_logits_to_keep`) | Sí | No | Sí |
| Optimizado para navegador/móvil | Sí (WebGPU, iPhone Safari) | Parcial (falla con prompts largos en móvil) | Sí |
| Licencia | LFM Open License v1.0 | LFM Open License v1.0 | LFM Open License v1.0 |
| Mantenimiento | Comunidad (daveycodez) | Liquid AI (oficial) | Comunidad (onnx-community) |

## Limitaciones y advertencias

- Se trata de una build no oficial: no ha sido creada, revisada ni respaldada por Liquid AI, por lo que el soporte depende del autor comunitario.
- Licencia restrictiva para empresas: el uso comercial de la familia LFM2.5 bajo la LFM Open License v1.0 solo está permitido a entidades con ingresos anuales inferiores a 10 millones de dólares.
- Solo se incluye la variante q4f16; no hay pesos en fp16/fp32 ni otras cuantizaciones en este repositorio.
- La diferencia numérica en los logits del último token (≤ 0,0078) puede alterar resultados en muestreos muy sensibles a la temperatura, aunque la generación greedy produce tokens idénticos.
- Si se usa onnxruntime directamente, hay que pasar `num_logits_to_keep` explícitamente; `0` calcula logits para todas las posiciones y recupera el comportamiento de alto consumo de memoria original.
- La longitud de contexto exacta y los datos de entrenamiento no están documentados en esta model card; deben consultarse en la ficha del modelo base.
- Como todo modelo de 1.200 millones de parámetros, el riesgo de alucinación es significativo y sus capacidades de razonamiento complejo son limitadas frente a modelos de mayor escala.
- Rendimiento dependiente del navegador: WebGPU no está disponible en todos los navegadores y entornos, y el consumo de memoria en móviles sigue siendo un factor crítico con prompts muy largos.

## Enlaces

- Ficha del modelo: https://huggingface.co/daveycodez/LFM2.5-1.2B-Web
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Build ONNX original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-ONNX
- Referencia del grafo modificado (commit): https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-ONNX/tree/10f72e70abf67ac0fd7ebf15bc5854726891d864
- Transformers.js: https://github.com/huggingface/transformers.js
- Build ONNX de referencia con `num_logits_to_keep`: https://huggingface.co/onnx-community/LFM3-1.7B-ONNX
- Liquid AI: https://www.liquid.ai/
- Licencia LFM Open License v1.0: https://huggingface.co/daveycodez/LFM2.5-1.2B-Web/blob/main/LICENSE
