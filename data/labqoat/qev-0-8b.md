# labqoat/qev-0.8b

## Resumen

qev-0.8b es un modelo de decisión local desarrollado por Labqoat, afinado a partir de Qwen/Qwen3.5-0.8B-Base. No es un modelo generativo: recibe un estado (texto, JSON o imagen) y un conjunto de preguntas tipadas, y devuelve probabilidades calibradas para cada opción en un único forward pass. Está pensado para tareas de enrutamiento, clasificación, guardarraíles y toma de decisiones en agentes, con un enfoque explícito de "System One" (respuesta rápida, sin cadena de razonamiento).

Con 852.985.920 parámetros totales (0,8B), el modelo se posiciona como una alternativa ligera a modelos de decisión de 1-2B, con latencias de 3,5 ms por petición en una NVIDIA L40S y 1,3 GB de RAM en un Mac en cuantización de 8 bits. Su relevancia actual radica en la combinación de bajo coste, soporte de entrada de imagen zero-shot y una API unificada (`POST /v1/systemone`) que funciona sobre NVIDIA, Apple silicon y llama.cpp.

La licencia Apache 2.0 y el formato de pesos safetensors (compatible con transformers) facilitan su integración en producción. El modelo está orientado principalmente al inglés y su uso previsto es la decisión estructurada, no la generación de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-0.8B-Base), con torre de visión del modelo base |
| Parametros totales | 852.985.920 (0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (referenciado en MLX y GGUF Q8_0); otras no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); variantes GGUF y MLX en repos separados |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B-Base y se afina para una tarea concreta: dado un estado y preguntas tipadas (`choice`, `noul`, `score`), producir probabilidades calibradas en un solo forward pass. La arquitectura subyacente es un transformer del modelo base, con la torre de visión original conservada para soportar entrada de imagen en modo zero-shot (redimensionada a un máximo de 448×448, ≤196 tokens). El prompt y el formato de respuesta siguen el diseño de decider-ai 1.9.0, y las probabilidades se agudizan con temperaturas por tipo ajustadas sobre un split de calibración propio (choice 1,7; noul 0,9; score 1,25, en `qev_config.json`).

No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset. La model card indica que parte de los datos de entrenamiento está escrita en los mismos formatos que algunos benchmarks (documentos de políticas largos con enmiendas, escalas de sentimiento, NLI, intención) y que los datos se cribaron contra cada ítem de benchmark para evitar secuencias compartidas de 16 tokens con BH o JevBench. No se menciona RLHF ni DPO. La innovación principal es el enfoque de decisión calibrada en un solo paso, con soporte de imagen zero-shot y una API común entre backends (CUDA, MLX, llama.cpp).

## Capacidades

- Clasificación y decisión estructurada: preguntas de tipo `choice` (hasta 255 opciones), `noul` (sí/no con P(yes)) y `score` (nivel esperado en escala ordenada).
- Probabilidades calibradas por opción, con campo de confianza, pensadas para actuar cuando hay certeza y escalar cuando no.
- Entrada multimodal: estado en texto, JSON o imagen (marcador `<image:NAME>` y paso de imágenes), con soporte de visión zero-shot.
- Enrutamiento y guardarraíles: adecuado para decidir departamento, urgencia o nivel de enfado en tickets.
- Soporte para agentes y decisiones multi-paso mediante preguntas relacionadas y el modo `per_question=True`.
- Capacidades multilingües: limitadas al inglés según la model card.
- No genera texto libre; su salida es probabilística y estructurada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como estado y devuelve la probabilidad de cada departamento (`choice`), permitiendo derivar automáticamente a billing, tech o sales con umbrales de confianza.
- Detección de urgencia en atención al cliente: con una pregunta `noul` ("¿es urgente?"), se obtiene P(yes) y se prioriza la cola de atención cuando supera un umbral calibrado.
- Medición de sentimiento del cliente: con una pregunta `score` sobre una escala ordenada (calm, annoyed, angry), se obtiene el nivel esperado y las probabilidades para escalar a un agente humano.
- Guardarraíles en agentes: clasificar si una acción o petición debe bloquearse o revisarse, usando preguntas de tipo `noul` sobre políticas de seguridad.
- Decisión en juegos y entornos espaciales: los benchmarks JevSpatial y Rules-7 sugieren uso en agentes que eligen acciones bajo reglas y estado espacial.
- Clasificación sobre imágenes: con entrada de imagen zero-shot (capturas, formularios), el modelo puede responder preguntas de decisión sobre el contenido visual sin entrenamiento específico.
- Inferencia en dispositivo: con 1,3 GB de RAM en 8 bits en un Mac y ~17 ms en llama.cpp, es viable para aplicaciones locales de escritorio o móvil que necesiten decisiones rápidas sin nube.

## Benchmarks y rendimiento

Datos publicados en la model card (precisión en %, misma máquina L40S, runtime propio de cada modelo):

| Modelo | Params | p50 ms | BH | BH ECE ↓ | JevBench | Suite | JevExtra | JevSpatial | Rules-7 |
|---|---|---|---|---|---|---|---|---|---|
| qev-0.8b | 0.8B | 3.5 | 77.1 | 0.063 | 85.1 | 61.7 | 72.0 | 74.2 | 63.7 |
| decision-2b | 2B | 81.3 | 76.2 | 0.042 | 86.0 | 60.9 | 64.1 | 69.5 | 58.1 |
| decider-2b | 1.9B | 7.2 | 75.8 | 0.065 | 85.9 | 70.7 | 58.8 | – | – |
| EXAONE-4.0-1.2B-JEV | 1.2B | 27.8 | 68.8 | 0.097 | 83.9 | 67.3 | 64.0 | 70.0 | 58.8 |
| malkuth-2b | 2B | 46.2 | 68.8 | 0.131 | 84.8 | 66.6 | 63.6 | 69.9 | 63.7 |

BH = Benchmark Heaven público (231 ítems, ±2,8 puntos). Suite = 22 tareas de datasets públicos. JevExtra, JevSpatial y Rules-7 son benchmarks propios del autor (agentes y seguridad; juegos y espacio; reglas de política). En imagen, 0,759 en JevVision v0 frente a 0,651 del modelo base. La model card advierte que los benchmarks se usaron para elegir checkpoints y weight soups, por lo que no son cifras held-out intactas, y que parte del entrenamiento comparte formato con algunos benchmarks. Puntos débiles declarados: preguntas `score` de 4 niveles (precisión 0,39, mayormente desviada en uno), entradas largas o muy difíciles (BH long 0,51) y la opción "cannot answer".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 852.985.920 parámetros, en fp16 rondaría ~1,7 GB de pesos, y en 8 bits ~0,85 GB, más overhead de activaciones y torre de visión.
- GPU recomendadas: NVIDIA L40S (3,5 ms p50 medidos); el motor CUDA es el backend recomendado.
- Consumer GPU: no se especifica compatibilidad con RTX 4090 u otras; el repo incluye backend transformers como alternativa.
- Apple silicon: variante MLX con 109 ms p50 (M4 Pro) y 1,3 GB de RAM en 8 bits.
- llama.cpp: variante GGUF con `llama-server -hf labqoat/qev-0.8b-GGUF:Q8_0`, ~17 ms en M4 Pro (CPU, Metal, CUDA, Vulkan).
- Despliegue: `qev_server.py` con endpoint `POST /v1/systemone`, backend transformers (`qev.py`), MLX y llama.cpp.
- Latencia y throughput: 3,5 ms p50 en L40S; 109 ms en M4 Pro con MLX; ~17 ms en M4 Pro con llama.cpp Q8_0; no se publica throughput.

## Comparativa con modelos similares

| Modelo | Params | Contexto | BH | JevBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qev-0.8b | 0.8B | no disponible | 77.1 | 85.1 | apache-2.0 | HF (safetensors, GGUF, MLX) |
| decision-2b | 2B | no disponible | 76.2 | 86.0 | no disponible | no disponible |
| decider-2b | 1.9B | no disponible | 75.8 | 85.9 | no disponible | no disponible |
| EXAONE-4.0-1.2B-JEV | 1.2B | no disponible | 68.8 | 83.9 | no disponible | no disponible |
| malkuth-2b | 2B | no disponible | 68.8 | 84.8 | no disponible | no disponible |

qev-0.8b destaca por latencia (3,5 ms frente a 7,2-81,3 ms de los comparables) y por encabezar BH con el menor número de parámetros, aunque decision-2b obtiene mejor ECE (0,042 frente a 0,063) y decider-2b mejor resultado en la Suite (70,7 frente a 61,7). No se dispone de datos de contexto ni licencia de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No genera texto: cualquier caso de uso que requiera generación libre queda fuera de su alcance.
- Punto débil en preguntas `score` de 4 niveles (precisión 0,39, desviación típica de un nivel) y en entradas largas o muy difíciles (BH long 0,51).
- La opción "cannot answer" aparece como punto débil declarado, lo que puede afectar a la abstención en casos ambiguos.
- Riesgo de alucinación no evaluado explícitamente en la información disponible; al ser un modelo de decisión, el riesgo se traslada a clasificaciones erróneas con confianza alta.
- Los benchmarks se usaron para seleccionar checkpoints y weight soups, y parte del entrenamiento comparte formato con benchmarks; los ítems de inyección indirecta de JevExtra comparten texto con filas de entrenamiento.
- La calibración depende de temperaturas ajustadas sobre un split propio; puede degradarse fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales del modelo base Qwen3.5-0.8B-Base.
- El soporte de imagen es zero-shot con la torre del modelo base; el rendimiento en imágenes fuera de dominio no está caracterizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/labqoat/qev-0.8b
- Variante MLX: https://huggingface.co/labqoat/qev-0.8b-MLX
- Variante GGUF: https://huggingface.co/labqoat/qev-0.8b-GGUF
- Modelo con expertos (MoQLE): https://huggingface.co/labqoat/squad-0.8b
- Demo en vivo: https://app.labqoat.com/e/qev/qev/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
