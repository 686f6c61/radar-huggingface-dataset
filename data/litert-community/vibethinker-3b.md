# litert-community/VibeThinker-3B

## Resumen

VibeThinker-3B es un modelo denso de 3 000 millones de parámetros especializado en razonamiento matemático y verificación lógica, desarrollado por WeiboAI sobre la arquitectura Qwen2.5-Coder-3B. Esta versión publicada por litert-community es una conversión al formato LiteRT-LM (`.litertlm`) que permite su ejecución en dispositivos de borde (móviles, tablets) mediante el runtime de Google LiteRT-LM, con cuantización int4 por bloques de 32 y embeddings en INT8. El modelo resuelve problemas aritméticos y de palabras con una cadena de pensamiento inline y respuestas en formato `\boxed{}`, alcanzando un 90 % de aciertos en GSM8K tras la cuantización, frente al 97 % en bf16. Su relevancia radica en llevar capacidades de razonamiento matemático de alta precisión a hardware con recursos limitados, manteniendo un footprint de memoria inferior a 2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer denso, 36 capas) |
| Parametros totales | 3 000 millones (3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 (KV cache) |
| Tipos de cuantizacion | int4 block 32 (simetrico + OCTAV), embeddings INT8 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM), safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base VibeThinker-3B parte de Qwen2.5-Coder-3B y se post-entrena con el pipeline Spectrum-to-Signal, que combina fine-tuning supervisado por curriculum, reinforcement learning multi-dominio, auto-destilacion offline y ajuste por instrucciones. La arquitectura es un transformer denso estandar de Qwen2 con 36 capas, sin mezcla de expertos. La conversion a LiteRT-LM aplica cuantizacion int4 con bloques de 32 (en lugar de 128) para preservar la precision aritmetica, junto con la tecnica OCTAV de recorte optimo de pesos. El runtime de LiteRT-LM ejecuta el modelo con computacion entera, delegando en GPU (Metal, OpenCL) o CPU segun la plataforma.

## Capacidades

- Razonamiento matematico: aritmetica basica, problemas de palabras, algebra elemental y logica verificable.
- Generacion de texto con cadena de pensamiento inline, seguida de una respuesta final en `\boxed{}`.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explicitamente, aunque el chain-of-thought permite pasos multiples.
- Capacidades multilingues: no especificadas; el modelo base Qwen2.5 soporta varios idiomas, pero no se confirma en esta version.
- Capacidades especiales: optimizado para inferencia on-device con cuantizacion int4; no incluye vision ni audio.

## Casos de uso

- Aplicaciones educativas de matematicas en movil: el modelo puede resolver ejercicios paso a paso y explicar el razonamiento, aprovechando su cadena de pensamiento y su tamano reducido para ejecutarse en smartphones sin conexion.
- Asistente de tareas en dispositivos de gama baja: con un footprint de ~1.9 GB y soporte para GPU movil, puede integrarse en tablets o telefonos con 4-8 GB de RAM para ayudar con calculos y problemas matematicos.
- Calculadora conversacional con explicaciones: en lugar de dar solo el resultado, el modelo muestra el proceso, util para entornos educativos o de formacion tecnica.
- Chatbot de soporte tecnico con capacidad de calculo: puede resolver consultas que requieran operaciones numericas (presupuestos, conversiones, proporciones) dentro de un asistente de atencion al cliente.
- Herramientas de productividad offline: integrado en suites de ofimatica movil para resolver formulas o validar resultados sin depender de la nube.
- Prototipos de agentes de razonamiento en edge: su licencia MIT y formato estandar permiten experimentar con pipelines de razonamiento verificable en dispositivos con recursos limitados, como punto de partida para aplicaciones de logica y matematicas.

## Benchmarks y rendimiento

Se han publicado resultados de GSM8K (n=100, greedy, 0-shot chain-of-thought, max_tokens 2048) comparando la referencia bf16 con la cuantizacion int4:

| Configuracion | GSM8K |
|---|---|
| bf16 (referencia) | 97.0 % |
| LiteRT int4 block 32 | 90.0 % (−7 pt) |
| LiteRT int4 block 128 | 64.0 % (−33 pt) |

Rendimiento medido con `litert-lm benchmark` en Apple M4 Max (litert-lm 0.15.0, prefill 256, decode 256, 3 iteraciones):

| Dispositivo | Backend | Prefill (256) | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 139 tok/s | 28.4 tok/s | 2.15 s |
| Apple M4 Max (macOS) | GPU (Metal) | 1386 tok/s | 94.1 tok/s | 0.20 s |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo `model.litertlm` ocupa ~1.9 GB; el pico de memoria medido en Galaxy S26 fue de 1067 MB durante la generacion.
- GPU recomendadas: Apple M4 Max (Metal), iPhone 17 Pro (GPU), Samsung Galaxy S26 (GPU), Pixel 8a (OpenCL, Mali-G715). Cualquier GPU movil moderna con soporte OpenCL o Metal es suficiente.
- Consumer GPU: si, cabe en cualquier GPU de escritorio actual (RTX 3060 o superior) y en practicamente todos los SoC moviles de gama media-alta.
- Opciones de despliegue: runtime LiteRT-LM (`litert_lm_main`), Google AI Edge Gallery (v1.0.16+), integracion via libreria `litert-lm` en Android/iOS.
- Latencia y throughput: en M4 Max GPU, TTFT de 0.20 s y decode de 94.1 tok/s; en CPU, 2.15 s y 28.4 tok/s respectivamente. En dispositivos moviles no se han publicado mediciones de velocidad.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de razonamiento de tamano similar (p. ej., Qwen2.5-Math-1.5B, DeepSeek-R1-Distill-Qwen-1.5B) en la informacion proporcionada. La unica comparacion disponible es interna entre la version bf16 y la cuantizada int4 del mismo modelo, que muestra una perdida de 7 puntos en GSM8K. Se recomienda consultar el paper tecnico para una comparativa mas amplia.

## Limitaciones y advertencias

- Especializacion en matematicas: en prompts de conocimiento general, el modelo razona extensamente y puede asentarse en una respuesta incorrecta, tanto en CPU como en GPU (comportamiento del modelo, no del backend).
- Requiere `max_tokens` ≥ 2048: con limites inferiores, la cadena de pensamiento se corta antes de llegar a la respuesta final.
- La cuantizacion int4 block 32 reduce el rendimiento en GSM8K en 7 puntos porcentuales respecto a bf16; la variante block 128 degrada mucho mas (64 %), por lo que solo se publica la de block 32.
- No se documentan sesgos especificos, pero al derivar de Qwen2.5-Coder puede heredar sesgos de su corpus de entrenamiento.
- Riesgo de alucinacion en dominios fuera de matematicas: no se ha evaluado su fiabilidad en tareas generales.
- Licencia MIT permite uso comercial sin restricciones, pero el modelo base (WeiboAI/VibeThinker-3B) tiene su propia licencia que debe verificarse.

## Enlaces

- HuggingFace (modelo convertido): https://huggingface.co/litert-community/VibeThinker-3B
- HuggingFace (modelo base): https://huggingface.co/WeiboAI/VibeThinker-3B
- GitHub WeiboAI/VibeThinker: https://github.com/WeiboAI/VibeThinker
- Paper tecnico (arXiv): https://arxiv.org/abs/2606.16140
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Guia de GPU para Android: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-gpu.md
