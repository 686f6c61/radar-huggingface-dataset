# mlboydaisuke/Kev-0.8B-CoreAI

## Resumen

Kev-0.8B-CoreAI es una conversión al formato Apple Core AI (`.aimodel`) del modelo `jaredpalmer/kev-0.8b`, un modelo de decisión derivado de Qwen3.5-0.8B-Base. A diferencia de un modelo generativo convencional, Kev no produce texto: recibe un estado (un documento en texto plano o un objeto/array JSON) y un conjunto de preguntas tipadas, y devuelve una distribución de probabilidad calibrada sobre cada opción de cada pregunta en un único forward pass. Las preguntas pueden ser de tipo `noul` (sí/no), `choice` (opciones con nombre) o `score` (niveles ordenados).

El modelo base fue entrenado por Jared Palmer como un adaptador LoRA de rango 16 más una cabeza pointer sobre Qwen3.5-0.8B-Base, una arquitectura híbrida de 24 capas (18 Gated DeltaNet y 6 de atención completa) con tamaño oculto de 1.024. La conversión la firma mlboydaisuke y está pensada para inferencia on-device en macOS 27 e iOS 27, ejecutándose en GPU Metal tanto en un M4 Max como en un iPhone 18 Pro.

Su relevancia radica en el nicho: sustituye la generación de texto por decisiones estructuradas y tipadas con contrato de salida fijo (formato SystemOne), lo que permite integrar el modelo en pipelines donde se necesita una probabilidad calibrada por opción en lugar de una respuesta en lenguaje natural. El tamaño del repositorio es de 3,0 GB y la variante publicada es un decoder fp16 de 1.520 MB con la cabeza pointer ejecutada en el host.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (18 capas Gated DeltaNet + 6 capas de atención completa), exportado como grafo Core AI sin cabeza de vocabulario |
| Parametros totales | 0,8B (modelo base Qwen3.5-0.8B-Base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como ventana de contexto generativa; el grafo acepta 128 token ids por llamada y una fila contiene como máximo un número de tokens no especificado en la información disponible |
| Tipos de cuantizacion | Pesos en fp16 (1,51 GB); recurrencia Gated DeltaNet en kernel Metal fp32; cabeza pointer en fp32 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.aimodel` (Apple Core AI); el modelo base original en safetensors; adaptador LoRA original |
| Libreria | coreai |
| Pipeline | text-classification |
| Tamano del repositorio | 3,0 GB |
| Variante publicada | `gpu-pipelined/kev_0_8b_decode_fp16_metal_pf128/` (1.520 MB) |
| Requisitos de plataforma | macOS 27 / iOS 27 |
| Hardware probado | M4 Max (macOS 27.0, 26A428) e iPhone 18 Pro (iOS 27.0, 24A437) |
| Modelo base | jaredpalmer/kev-0.8b (tag v1.0, commit bf75a6a) sobre Qwen/Qwen3.5-0.8B-Base (revision dc7cdfe) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B-Base es un transformer híbrido de 24 capas: 18 capas Gated DeltaNet (atención lineal con recurrencia) y 6 capas de atención completa, con tamaño oculto de 1.024. Sobre esa base, Jared Palmer entrenó un adaptador LoRA de rango 16 y una cabeza pointer. La cabeza puntúa el token de cierre de cada opción contra el último token de la pregunta: `z_k = ((W_k h_opt_k + b_k) · (W_q h_decide + b_q)) / 16`, con `W_q` y `W_k` de dimensiones `[256, 1024]` más sesgos en fp32, y aplica softmax con temperatura T = 2,3510958125672174 (calibración del autor almacenada en `head.pt`).

La conversión a Core AI fusiona el adaptador en la base con el script de merge del autor y exporta el backbone de texto como un único grafo que toma 128 token ids por llamada y devuelve el hidden state tras la normalización final en cada posición, sin cabeza de vocabulario. Cada capa Gated DeltaNet ejecuta su recurrencia en un kernel Metal fp32 con un dispatch GPU por capa y por llamada. El host ejecuta la cabeza pointer a partir de los pesos del autor. El criterio de validación (gate) es la paridad de probabilidad con el código fp32 del autor, opción por opción y pregunta por pregunta, sobre un fixture de 434 preguntas y un conjunto held-out de 130. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre la composición del dataset.

El contrato de lectura es estricto: una fila por pregunta, con ids construidos mediante delimitadores del tokenizer base (`<|fim_prefix|>` 248060 para el estado, `<|fim_middle|>` 248061 para la pregunta, `<|box_start|>` 248049 y `<|box_end|>` 248050 para cada opción, `<|fim_suffix|>` 248062 para decidir; pad = eos = `<|endoftext|>` 248044, sin bos). El texto de usuario se tokeniza sin tokens especiales tras reescribir `<|name|>` a `<¦name¦>`, de modo que una petición no puede producir un delimitador.

## Capacidades

- Clasificación y decisión tipada: responde preguntas `noul` (sí/no), `choice` (opciones con nombre) y `score` (niveles ordenados) devolviendo una probabilidad por opción.
- Salida estructurada con contrato fijo: formato SystemOne-compatible, `{model, state, questions}` de entrada y `{model, answers, usage}` de salida.
- Procesamiento de estado en texto plano o JSON (objetos y arrays, con renderizado `key: value` y anidamiento indentado).
- Probabilidad calibrada: softmax con temperatura fija y confianza normalizada por pregunta; valores redondeados a 4 decimales.
- Ejecución on-device en Apple Silicon (macOS 27 e iOS 27) sobre GPU Metal.
- No genera texto: no hay decodificación autoregresiva ni cabeza de vocabulario en el grafo exportado.
- Soporte multilingüe limitado al inglés.
- Sin soporte documentado de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Moderación y clasificación de contenido: dado un texto como estado y preguntas `noul` sobre políticas concretas, el modelo devuelve la probabilidad de cada criterio en un solo forward pass, lo que permite fijar umbrales calibrados en lugar de depender de salidas generativas.
- Enrutamiento de tickets de soporte: con el ticket como estado y preguntas `choice` sobre categoría y prioridad, se obtiene la opción más probable y su confianza para derivar el caso al equipo adecuado.
- Extracción de señales estructuradas de documentos JSON: el renderizador `key: value` permite pasar objetos anidados como estado y consultar campos con preguntas tipadas, útil en pipelines de validación de datos.
- Puntuación de calidad en pipelines de datos: preguntas `score` sobre niveles ordenados (por ejemplo, relevancia o toxicidad en una escala) devuelven la esperanza Σ nivel · p, adecuada para ranking y filtrado por umbral.
- Decisión local en dispositivos Apple: al ejecutarse en iPhone 18 Pro con 37,8 ms por pregunta de 94 tokens, encaja en flujos de privacidad donde el estado no debe salir del dispositivo.
- Evaluación automática de respuestas: con la respuesta como estado y preguntas `noul` sobre criterios de corrección, se obtiene una probabilidad por criterio que puede agregarse en métricas de evaluación.
- Sustitución de clasificadores ad hoc: un único modelo con contrato SystemOne puede reemplazar varios clasificadores específicos cuando las preguntas son del mismo dominio, simplificando el mantenimiento.

## Benchmarks y rendimiento

La model card del autor reporta resultados de benchmarks, pero no se han re-medido en esta conversión y no se detallan cifras en la información disponible. Los únicos datos de rendimiento publicados son de latencia:

| Medicion | Valor |
|---|---|
| Pregunta de 94 tokens en M4 Max (macOS 27.0) | 29,9 ms |
| Pregunta de 94 tokens en iPhone 18 Pro (iOS 27.0) | 37,8 ms |
| Paridad de probabilidad con el código fp32 del autor | Verificada sobre 434 preguntas de fixture y 130 held-out, en todas las opciones de todas las preguntas |

## Requisitos de hardware

- VRAM/almacenamiento: la variante publicada ocupa 1.520 MB en disco (pesos fp16 de 1,51 GB); el repositorio completo son 3,0 GB.
- Plataformas soportadas: macOS 27 y iOS 27, con especialización del `.aimodel` en el dispositivo donde se ejecuta.
- Hardware validado: M4 Max (GPU Metal) e iPhone 18 Pro; no se documentan otros dispositivos.
- GPU de servidor (A100, H100, RTX 4090): no disponible; el formato `.aimodel` es específico de Apple Core AI y no se indica soporte para CUDA.
- Opciones de despliegue: paquete Swift `Kev` del repositorio coreai-model-zoo (`KevDecider(bundle:)` y `kev.decide(requestJSON:shared:)`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 29,9 ms por pregunta de 94 tokens en M4 Max y 37,8 ms en iPhone 18 Pro; el throughput agregado no está disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Despliegue |
|---|---|---|---|---|---|
| Kev-0.8B-CoreAI | 0,8B | 128 token ids por llamada en el grafo | Probabilidades tipadas por pregunta | Apache-2.0 | Apple Core AI (macOS/iOS) |
| jaredpalmer/kev-0.8b | 0,8B | No disponible | Probabilidades tipadas por pregunta | Apache-2.0 | Formato original del autor (safetensors + cabeza pointer) |
| Qwen3.5-0.8B-Base | 0,8B | No disponible | Generación de texto | No disponible en la información proporcionada | Múltiples runtimes (no detallado) |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo probabilidades sobre opciones predefinidas; cualquier caso de uso que requiera generación queda fuera de su alcance.
- Solo inglés: el tag de idioma es `en` y no se documenta soporte multilingüe.
- Longitud limitada: el grafo acepta 128 token ids por llamada y la model card trunca la descripción de la longitud máxima de fila; estados largos pueden exceder el límite no especificado.
- Dependencia de plataforma: el formato `.aimodel` requiere macOS 27 o iOS 27; no hay ruta de despliegue documentada para CUDA ni para servidores Linux.
- Calibración heredada: la temperatura y la cabeza pointer provienen del autor; la validez de las probabilidades fuera del dominio de entrenamiento no está verificada.
- Riesgo de sesgo y alucinación: no documentado en la información disponible; al no generar texto, el riesgo de alucinación se traslada a la calibración de probabilidades sobre opciones.
- Uso comercial: la licencia Apache-2.0 lo permite, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B-Base y del modelo original de Jared Palmer.
- Madurez: 25 descargas y 0 likes en el momento de la consulta; el ecosistema de herramientas es reducido y depende del paquete Swift del model zoo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Kev-0.8B-CoreAI
- Modelo base original: https://huggingface.co/jaredpalmer/kev-0.8b/tree/bf75a6a8848ea6960ff2ed108d9ed44c2941174f
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base/tree/dc7cdfe2ee4154fa7e30f5b51ca41bfa40174e68
- Repositorio coreai-model-zoo: https://github.com/john-rocky/coreai-model-zoo
- Paquete Swift Kev: https://github.com/john-rocky/coreai-model-zoo/tree/main/apps/Kev
- Model card en el zoo: https://github.com/john-rocky/coreai-model-zoo/blob/main/models/kev-0.8b/README.md
