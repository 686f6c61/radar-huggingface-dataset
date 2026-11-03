# Maxenith/MAX-Neural-80M-Arabic

## Resumen

MAX Neural 80M Arabic es un modelo de lenguaje causal de pequeno tamano desarrollado por Maxenith, entrenado desde cero en PyTorch puro y orientado exclusivamente al idioma arabe. Forma parte de la familia MAX Neural, que incluye tambien una variante Instruct de 500M parametros. El modelo que nos ocupa, de 80M, se distribuye como modelo base para completado de texto, con un tokenizador de 16K entradas y una arquitectura transformer de 11 capas con 768 dimensiones ocultas.

La relevancia de este modelo radica en su caracter "from-scratch": no es un fine-tuning de un modelo existente, sino una implementacion propia con RoPE, SwiGLU, RMSNorm y Grouped Query Attention. Esto lo convierte en un caso interesante para investigacion y experimentacion con modelos arabes de bajo coste computacional, aunque su tamano limita severamente sus capacidades frente a modelos multilingues de mayor escala.

El repositorio tiene 2.8 GB e incluye tanto los pesos del modelo base (80M) como los de la variante Instruct (500M) en formato PyTorch nativo (`.pt`). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementacion propia en PyTorch) |
| Parametros totales | 80M (modelo base); la familia incluye una variante de 500M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en `.pt`, sin versiones GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | Arabe (`ar`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch nativo (`.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only implementado directamente en PyTorch, sin depender de frameworks de alto nivel como Hugging Face Transformers. Emplea RoPE (Rotary Position Embeddings) para la codificacion posicional, SwiGLU como funcion de activacion en la capa feed-forward, RMSNorm para la normalizacion y Grouped Query Attention (GQA) en la atencion. La configuracion del modelo base de 80M es de 11 capas, 768 dimensiones ocultas y un vocabulario de 16K tokens.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La variante Instruct de 500M se entreno sobre 30.000 ejemplos de instrucciones en arabe (Alpaca-GPT4), pero esos datos no aplican directamente al modelo base de 80M. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y completado de secuencias en arabe.
- Modelo base (no instruct): no esta disenado para seguir instrucciones ni para conversacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al arabe; no se documenta soporte de otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en modelos arabes from-scratch: el modelo sirve como banco de pruebas para estudiar el comportamiento de arquitecturas transformer de pequeno tamano entrenadas exclusivamente en arabe, con bajo coste computacional.
- Generacion de texto asistida en arabe: completado de frases, redaccion de borradores cortos o generacion de titulares donde no se requiera alta fidelidad factual.
- Experimentacion con tokenizadores arabes: su vocabulario de 16K permite analizar el impacto de un tokenizador reducido en la morfologia del arabe.
- Fine-tuning ligero: al ser un modelo base de 80M, es viable ajustarlo en una sola GPU consumer para tareas especificas del dominio (clasificacion, extraccion, generacion acotada).
- Educacion y docencia: util para explicar el funcionamiento interno de un transformer decoder-only con RoPE, SwiGLU y GQA en un entorno controlado y de bajo coste.
- Prototipado rapido de pipelines NLP en arabe: integrable en pruebas de concepto donde la latencia y el coste importan mas que la calidad final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo de 80M (aproximadamente 320 MB de pesos mas overhead); en FP16, en torno a 160 MB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es mas que suficiente; tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, e incluso en CPU.
- Opciones de despliegue: al usar pesos `.pt` y una arquitectura propia, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversion previa. Requiere cargar los pesos con el script de entrenamiento del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MAX Neural 80M Arabic | 80M | No disponible | Arabe | Apache 2.0 | `.pt` |
| MAX Neural 500M Instruct (misma familia) | 500M | No disponible | Arabe | Apache 2.0 | `.pt` |
| Alternativas comparables de 80M en arabe | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos comparables de terceros con los que establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Modelo base: no sigue instrucciones ni mantiene conversaciones; su uso previsto es el completado de texto.
- Alto riesgo de alucinacion: el propio autor advierte que la variante Instruct puede inventar hechos y no debe usarse para decisiones criticas sin verificacion externa (RAG).
- Tamano muy reducido (80M): capacidad limitada de razonamiento, conocimiento factual y coherencia en textos largos.
- Solo arabe: no se documenta soporte de otros idiomas.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo.
- Formato propietario: los pesos `.pt` requieren la arquitectura custom del autor, lo que dificulta su integracion en stacks estandar.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Maxenith/MAX-Neural-80M-Arabic
