# MyEcoria/VALLR-LFM3-1.7B-phonemes-to-text-v1

## Resumen

VALLR-LFM3-1.7B-phonemes-to-text-v1 es un modelo de generación de texto especializado en la segunda etapa de un sistema de reconocimiento visual del habla (VASR, *visual automatic speech recognition*). Lo desarrolla MyEcoria como parte del proyecto VALLR y consiste en un ajuste fino mediante LoRA —posteriormente fusionado en los pesos— del modelo base LiquidAI/LFM3-1.7B. Su tarea concreta es convertir una secuencia de fonemas en notación ARPAbet (la salida de la red vídeo-a-fonema de VALLR) en la frase en inglés correspondiente.

El modelo resuelve un problema muy específico dentro de un pipeline mayor: la red de lectura de labios produce fonemas, no palabras, y hace falta un decodificador lingüístico que reconstruya texto legible. Para ello emplea un formato de prompt estructurado con etiquetas `<S2S>`, `<PHONEMES>` y `<TEXT>`. Con 1.728.801.536 parámetros (1,7 mil millones), es un modelo compacto pensado para ejecutarse como componente de un sistema más grande, no como asistente general.

Se trata de la primera ejecución completa del autor antes de un entrenamiento continuado, según indica la propia model card, por lo que debe considerarse una versión inicial. La relevancia actual es acotada: es un artefacto de investigación dentro de un proyecto abierto de lectura de labios, con cero descargas y cero likes en el momento de la consulta, y con la licencia heredada del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LiquidAI LFM3-1.7B), ajustado con LoRA y fusionado |
| Parametros totales | 1.728.801.536 (~1,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors con `torch_dtype="auto"`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | mismos términos que LiquidAI/LFM3-1.7B (no se detalla en la información disponible) |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer decoder-only de 1,7 mil millones de parámetros, y se ajusta mediante LoRA para la tarea de fonemas-a-texto; el adaptador se fusiona después en los pesos finales. El adaptador LoRA por separado está disponible en el repositorio de GitHub del proyecto, bajo `models/`. El código de entrenamiento se encuentra en `Models/Llama.py` del mismo repositorio.

La entrada es una secuencia de fonemas ARPAbet (por ejemplo `HH AH0 L OW1 W ER1 L D`) envuelta en un prompt con las etiquetas `<S2S>`, `<PHONEMES>` y `<TEXT>`, y la salida es la frase en inglés. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Tampoco se detalla ninguna innovación técnica adicional más allá del propio pipeline VALLR de dos etapas (vídeo a fonemas, fonemas a texto).

## Capacidades

- Generación de texto en inglés a partir de secuencias de fonemas ARPAbet.
- Reconstrucción de frases a partir de la salida de un reconocedor visual del habla.
- Formato de prompt estructurado con etiquetas `<S2S>`, `<PHONEMES>` y `<TEXT>`.
- Generación autoregresiva estándar vía `model.generate()` de transformers.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento (*thinking*); la "visión" del sistema reside en la etapa anterior del pipeline, no en este modelo.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Lectura de labios asistida: integrado como segunda etapa del pipeline VALLR, recibe los fonemas que produce la red vídeo-a-fonema y devuelve la frase en inglés, permitiendo transcribir habla a partir de vídeo sin audio.
- Subtitulado de vídeo sin pista de audio: en grabaciones donde el audio falta o está corrupto, el sistema completo puede generar subtítulos a partir de los movimientos labiales, con este modelo como decodificador lingüístico final.
- Investigación en VASR: sirve como componente reproducible para experimentar con la etapa de fonemas-a-texto y comparar distintas estrategias de decodificación sobre el mismo modelo base.
- Reconstrucción de texto desde representaciones fonéticas: cualquier flujo que produzca fonemas ARPAbet (no solo lectura de labios) puede usar el modelo para volver a texto legible en inglés.
- Prototipado de accesibilidad: base para herramientas de comunicación asistida que transcriban habla visual en entornos ruidosos donde el reconocimiento automático de voz falla.
- Evaluación de modelos base pequeños: al estar construido sobre LFM3-1.7B, permite estudiar el rendimiento de un modelo de 1,7 B en una tarea de mapeo secuencia-a-secuencia muy restringida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): en torno a 7 GB solo para pesos, más memoria para activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 3,5 GB para pesos, más overhead.
- VRAM estimada en cuantización de 8 bits: en torno a 1,8-2 GB; en 4 bits, alrededor de 1 GB (estimaciones teóricas a partir del número de parámetros, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; tarjetas como RTX 3060/4060 en adelante deberían ser suficientes. Para fp32 se recomienda una GPU de 16 GB o más (RTX 4080/4090, A100, H100).
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más en fp16 y en prácticamente cualquier GPU moderna con cuantización.
- Opciones de despliegue: transformers (requiere `trust_remote_code=True`); no se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI, aunque el tag `endpoints_compatible` sugiere uso vía endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VALLR-LFM3-1.7B-phonemes-to-text-v1 | 1,7 B | no disponible | Fonemas a texto (VASR) | heredada de LFM3-1.7B | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B (base) | 1,7 B | no disponible | Generación de texto general | no disponible en la información | Hugging Face |
| Otros sistemas VASR (p. ej. LipNet, AV-HuBERT) | no disponible | no disponible | Vídeo a texto/fonemas | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es la primera ejecución completa del autor antes de un entrenamiento continuado; cabe esperar calidad inferior a una versión final.
- Solo admite inglés; no hay soporte multilingüe documentado.
- Depende de un formato de prompt muy concreto (`<S2S>`, `<PHONEMES>`, `<TEXT>`); un uso fuera de ese formato puede degradar la salida.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene revisarlo antes de usarlo en producción.
- La licencia no se detalla explícitamente en la información disponible; se remite a los términos de LiquidAI/LFM3-1.7B, que deben consultarse antes de un uso comercial.
- Riesgo de alucinación inherente a un modelo generativo: puede producir frases plausibles que no correspondan a los fonemas de entrada.
- No se documentan sesgos conocidos, pero al ser un ajuste de un modelo base en inglés puede heredar los sesgos de este.
- Sin benchmarks publicados ni descargas, no hay evidencia externa de su calidad; no se recomienda para producción sin evaluación propia.
- No se especifica la longitud de contexto, lo que limita la planificación de secuencias largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MyEcoria/VALLR-LFM3-1.7B-phonemes-to-text-v1
- Repositorio GitHub del proyecto VALLR: https://github.com/MyEcoria/VALLR
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
