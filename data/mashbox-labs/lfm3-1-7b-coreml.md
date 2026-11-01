# mashbox-labs/LFM3-1.7B-CoreML

## Resumen

LFM3-1.7B-CoreML es una conversión del modelo LFM3-1.7B de Liquid AI al formato Core ML, empaquetada por MASHBOX Labs para ejecutarse sobre la Apple Neural Engine en macOS e iOS. El modelo original es un transformer de 1.700 millones de parámetros orientado a generación de texto y conversación, y esta versión lo reempaqueta como un programa Core ML con estado para su uso en `MLComputeUnits.cpuAndNeuralEngine`, computando en float16.

La relevancia de esta ficha radica en que no se trata de un modelo nuevo, sino de un artefacto de despliegue: toma la cuantización oficial de Liquid AI (`LFM3-1.7B-QAD-Q4_0.gguf`, con pesos de 4 bits en las capas y 6 bits en el embedding compartido y la capa de salida) y la reconstruye como un único programa Core ML stateful, preservando exactamente los valores y escalas de la cuantización original. El resultado ocupa 1.059 MB (4,9 bits por peso) y mantiene un 98,22 % de coincidencia en el siguiente token respecto a los pesos completos en float32.

El interés práctico está en la inferencia local en hardware Apple: el 91,9 % de las operaciones de cómputo en `decode` se ejecutan en la Neural Engine, con un rendimiento medido de 11,1 tokens/s en decodificación sobre un Apple M5 y un consumo de memoria de proceso de 235 MB. Es, por tanto, una pieza relevante para quien necesite ejecutar un modelo de 1,7B en dispositivos Apple sin depender de la GPU ni de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM3 de Liquid AI), reconstruido como programa Core ML stateful; atención completa más capas de ventana deslizante (ventana 256) |
| Parametros totales | 1.700 millones (modelo base LFM3-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (ficheros `-8k`); 2.048 tokens en la variante corta |
| Tipos de cuantizacion | Pesos de 4 bits en capas y 6 bits en embedding compartido y capa de salida (QAD-Q4_0 de Liquid AI); cómputo en float16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `lfm1.0` (licencia de Liquid AI, incluida sin cambios en el repo) |
| Formato de pesos | `.mlpackage` y `.mlmodelc` (Core ML); tokenizer en JSON y plantilla de chat Jinja |

## Arquitectura y entrenamiento

El modelo subyacente es LFM3-1.7B de Liquid AI, un transformer de 1,7B parámetros. La conversión de MASHBOX Labs no reentrena ni modifica los pesos: parte de la release con cuantización consciente de cuantización (QAD) de Liquid AI, `LFM3-1.7B-QAD-Q4_0.gguf`, y traslada cada valor de 4 y 6 bits y cada escala de forma exacta. La red se reconstruye como un único programa Core ML con estado, con tres funciones que comparten el mismo estado: `prefill` (8 tokens por llamada), `decode` (1 token por llamada) y `verify` (8 tokens por llamada con logits en todas las posiciones).

La arquitectura de atención combina capas de atención completa con capas de ventana deslizante de 256 tokens, reflejada en dos máscaras aditivas distintas (`mask_f` y `mask_s`). El cómputo se realiza en float16 y el modelo expone entradas explícitas para `input_ids`, `valid`, la codificación one-hot de posición de caché `E`, las máscaras y las tablas de seno y coseno (`cos_f`, `sin_f`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat propia (`chat_template.jinja`) y modo de razonamiento desactivable.
- Decodificación greedy determinista en el ejemplo incluido; el modelo expone logits por posición en la función `verify`, lo que permite implementar decodificación especulativa o verificación de candidatos.
- Recuperación de información en contexto largo: se verifica el recuerdo de una clave oculta en un prompt de 7.270 tokens con la variante de 8.192 tokens.
- Soporte de system prompt mediante el flag `--system` del programa de ejemplo.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni matemáticas avanzadas.

## Casos de uso

- Asistentes conversacionales locales en macOS e iOS: el modelo se ejecuta íntegramente en la Neural Engine con 235 MB de huella de proceso, lo que permite integrar un chat privado sin conexión en aplicaciones de escritorio y móviles.
- Procesamiento de documentos con contexto largo en el dispositivo: con 8.192 tokens de contexto y recuperación verificada en prompts de más de 7.000 tokens, es adecuado para resumir o responder preguntas sobre contratos, informes o correos sin enviar datos a la nube.
- Autocompletado y generación de texto en editores nativos: la función `prefill` de 8 tokens por llamada y la `decode` de 1 token permiten construir un pipeline de generación incremental integrado en apps Swift.
- Verificación y decodificación especulativa en local: la función `verify` con logits en 8 posiciones posibilita implementar decodificación especulativa para acelerar la generación en hardware Apple.
- Prototipado de funciones de IA en apps iOS: el paquete `.mlmodelc` compilado se carga directamente sin paso de compilación en la app, lo que simplifica la integración en Xcode y el despliegue en dispositivos.
- Filtrado y clasificación de texto en el borde: al ser un modelo de 1,7B con licencia LFM1.0, puede emplearse para tareas de moderación o etiquetado en local, siempre que se respeten las restricciones de la licencia.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de la cuantización QAD-Q4_0 frente a float32 (98,22 % de acuerdo en Neural Engine, 99,89 % en float16 PyTorch).

## Benchmarks y rendimiento

Los datos publicados por el autor son mediciones de despliegue, no benchmarks de calidad de modelo:

| Metrica | Valor |
|---|---|
| Tamano | 1.059 MB por `.mlpackage`, 4,9 bits por peso (GGUF de Liquid: 1.049,6 MB) |
| Operaciones en Neural Engine (`decode`) | 91,9 % (12.304 de 13.384) |
| Acuerdo de siguiente token vs. float32 PyTorch | 98,22 % (2.761 de 2.811 posiciones, 44 prompts) |
| Acuerdo de siguiente token vs. float16 PyTorch | 99,89 % |
| Texto greedy identico vs. referencia completa | 25 de 44 prompts (hasta 160 tokens) |
| Velocidad de decodificacion (build 2.048, M5) | 11,1 tokens/s (90,0 ms por llamada `decode`) |
| Velocidad de prefill (build 2.048, M5) | 47,7 tokens/s (167,9 ms por llamada de 8 tokens) |
| Llamada `verify` | 191,5 ms |
| Memoria de proceso | 235 MB tras carga y generacion (pico 337 MB) |
| Primera carga | 158 s (compilacion para Neural Engine); posteriores ~2 s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware: Mac con Apple silicon (medido en Apple M5), macOS 15 o superior; también orientado a iOS por el tag correspondiente.
- VRAM/memoria: 235 MB de huella de proceso tras carga y generación, con pico de 337 MB; no incluye la memoria que el sistema reserva para la Neural Engine.
- GPU: no requiere GPU dedicada; el cómputo se reparte entre Neural Engine (91,9 % de las operaciones) y CPU (1.080 operaciones, principalmente la búsqueda de la fila de embedding del token de entrada).
- Cabe en hardware de consumo Apple (M1 en adelante, presumiblemente, aunque solo se documenta M5); no aplica a GPU NVIDIA o AMD.
- Despliegue: Core ML nativo con `MLComputeUnits.cpuAndNeuralEngine`; el repo incluye un programa Swift de ejemplo (`example/`) compilable con Swift 6 y Xcode. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: 11,1 tokens/s en decodificación y 47,7 tokens/s en prefill sobre M5; primera carga de 158 s por compilación del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia | Rendimiento |
|---|---|---|---|---|---|
| LFM3-1.7B-CoreML (esta ficha) | 1,7B | 8.192 | Core ML / Apple Neural Engine | lfm1.0 | 11,1 tok/s decode en M5; 98,22 % acuerdo vs. float32 |
| LiquidAI/LFM3-1.7B (original) | 1,7B | no disponible en la informacion | Safetensors / PyTorch | lfm1.0 | no disponible |
| LiquidAI/LFM3-1.7B-GGUF (QAD-Q4_0) | 1,7B | no disponible en la informacion | GGUF / llama.cpp | lfm1.0 | no disponible; tamano 1.049,6 MB |

No se dispone de datos de benchmarks de calidad para establecer comparaciones de rendimiento con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; no se documentan otros idiomas.
- El acuerdo con la referencia en precisión completa es del 98,22 % en Neural Engine, no del 100 %; la diferencia proviene de la aritmética de la Neural Engine, no de los pesos, y puede afectar a tareas sensibles a pequeños cambios de logits.
- Solo 25 de 44 prompts producen texto greedy idéntico palabra por palabra a la referencia de precisión completa.
- La primera carga tarda 158 s por la compilación para Neural Engine; en producción conviene cachear el modelo compilado.
- El rendimiento medido (11,1 tok/s) es bajo para aplicaciones interactivas exigentes y se midió en un M5; en hardware anterior será presumiblemente inferior (no documentado).
- La licencia `lfm1.0` de Liquid AI se incluye sin cambios; es responsabilidad del usuario revisar sus restricciones para uso comercial. No es una release oficial de Liquid AI ni está afiliada a Apple.
- El repo ocupa 4,2 GB de descarga porque incluye dos tamaños de contexto compilados y como paquete; es necesario excluir ficheros para bajar solo 1,1 GB.
- No se documentan capacidades de tool calling, agentes, visión ni audio; no debe asumirse su disponibilidad.
- Riesgo de alucinación inherente a un modelo de 1,7B, no cuantificado en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mashbox-labs/LFM3-1.7B-CoreML
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Licencia LFM1.0: incluida como `LICENSE` en el repositorio del modelo
