# litert-community/Qwen3.5-2B

## Resumen

Qwen3.5-2B en formato LiteRT-LM es la conversión del checkpoint multimodal Qwen/Qwen3.5-2B de Alibaba al runtime on-device de Google (LiteRT-LM, anteriormente TensorFlow Lite), publicada por la comunidad litert-community. El modelo emplea una arquitectura híbrida propietaria de Qwen3.5 que intercala bloques de atención lineal GatedDeltaNet (regla delta con compuertas) con un pequeño número de bloques de atención completa con compuertas. En esta variante de 2B, 18 capas son de atención lineal y 6 de atención completa, lo que mantiene el estado recurrente de tamano constante y reduce drásticamente el coste de memoria frente a un transformer denso equivalente.

El repositorio distribuye dos artefactos: una build solo texto (`Qwen3.5-2B_int8.litertlm`, 1,97 GB) y una build con visión (`Qwen3.5-2B-VL_int8.litertlm`, 3,15 GB) que incorpora la torre ViT de 24 capas del checkpoint original con entrada estática de 512×512. La cuantización es int8 dinámica en capas lineales y embedding, dejando en coma flotante las convoluciones, la regla delta y las 36 proyecciones de compuerta/decaimiento `in_proj_a` / `in_proj_b` del GatedDeltaNet, con activaciones declaradas en fp32.

Su relevancia actual reside en que demuestra que un modelo híbrido multimodal de 2B puede ejecutarse íntegramente en dispositivos de consumo con latencias utilizables: 17,5 tok/s de decodificación en GPU de un Galaxy S26 y 4,2 tok/s en CPU de una Raspberry Pi 5 con 4 hilos. La licencia Apache 2.0 y el soporte de LiteRT-LM ≥ 0.15 lo hacen apto para despliegues comerciales en Android, Linux embebido y macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 18 capas de atención lineal GatedDeltaNet (gated delta rule) + 6 capas de atención completa con compuertas; ViT de 24 capas en la build VL |
| Parametros totales | 2B (aproximado, según denominación del modelo); no se detalla el desglose exacto |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens de presupuesto KV en las 6 capas de atención; las capas lineales usan estado recurrente de tamano constante |
| Tipos de cuantizacion | int8 dinámica en lineales y embedding; convs, regla delta y 36 proyecciones `in_proj_a`/`in_proj_b` en float; activaciones fp32; ViT en fp16 con adaptador int8 (build VL) |
| Idiomas soportados | no disponible (la model card no enumera idiomas; el tokenizador corregido en 2026-10-16 mejora el trato de marcas combinantes en hindi, tailandés, tamil y árabe con harakat) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); requiere litert-lm ≥ 0.15 |

## Arquitectura y entrenamiento

La arquitectura Qwen3.5 es híbrida: combina bloques GatedDeltaNet, una variante de atención lineal basada en la regla delta con compuertas, intercalados con unas pocas capas de atención completa también con compuertas. En esta variante de 2B la proporción es de 18 capas lineales frente a 6 de atención completa. Cada capa lineal mantiene un estado convolucional y recurrente de tamano fijo por capa en lugar de una caché KV que crece con el contexto, de modo que el consumo de memoria permanece prácticamente plano respecto a la longitud de secuencia; solo las 6 capas de atención completa conservan KV, con un presupuesto de 4096 tokens. El checkpoint original es multimodal e incluye una torre ViT de 24 capas y cabezas MTP (multi-token prediction); la build solo texto las descarta siguiendo el contrato de carga `Qwen3_5ForCausalLM` de Qwen, mientras que la build VL incorpora la torre ViT con encoder fp16 y adaptador int8, entrada estática 512×512 y seis firmas de prefill.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la documentación proporcionada. La innovación técnica destacable del artefacto es la ruta de conversión: el kernel gated-delta de rango ≤4 es delegable a GPU, y la conversión vía `litert_torch.convert` (antiguo ai-edge-torch) reproduce el modelo PyTorch original con un error de 4e-7 medido en un Galaxy S26 con LiteRT 2.2.0 y Android 16. La recuantización del 2026-10-11 mantiene en float las 36 proyecciones de decaimiento/compuerta para eliminar un bucle de repetición en CPU con aritmética multi-paso en modo thinking off.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo thinking desactivable (por defecto off).
- Comprensión de imágenes en la build VL: entrada estática 512×512 procesada por la torre ViT de 24 capas del checkpoint.
- Generación de código y aritmética; la recuantización corrige el bucle de repetición en aritmética multi-paso sobre backend CPU.
- Tokenización multilingüe con soporte correcto de marcas combinantes tras la corrección del tokenizador del 2026-10-16 (hindi, tailandés, tamil, árabe con harakat, además de inglés, chino, japonés, coreano y emoji).
- Plantilla de chat actualizada el 2026-09-21 para aceptar la forma de content-parts de litert-lm 0.18, manteniendo compatibilidad con la forma de cadena.
- Inferencia on-device con delegación completa de operadores: 25.703 operadores delegados a GPU en el Galaxy S26.
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.

## Casos de uso

- Asistente conversacional offline en Android: integrado mediante `com.google.ai.edge.litert:litert`, el modelo sostiene conversaciones multi-turno con un presupuesto KV de 4096 tokens y memoria casi constante gracias a las 18 capas lineales, con 17,5 tok/s de decodificación en GPU de gama alta (Galaxy S26).
- Descripción y análisis de imágenes en el dispositivo: la build VL acepta imágenes 512×512 y responde en texto sin enviar datos a la nube, adecuado para aplicaciones de accesibilidad o catalogación de fotos con requisitos de privacidad.
- Procesamiento de lenguaje natural en Raspberry Pi 5: con 4,2 tok/s de decodificación y 5,04 s de TTFT en CPU con 4 hilos, sirve para resúmenes, clasificación y extracción de entidades en entornos embebidos sin acelerador.
- Transcripción y normalización de texto multilingüe: la corrección del tokenizador permite tratar hindi, tailandés, tamil y árabe con harakat sin desviaciones de segmentación (36 frente a 49 tokens en una frase de prueba en hindi).
- Automatización de aritmética y cálculo guiado en asistentes de escritorio: con el modo thinking off y la recuantización del 2026-10-11, responde a prompts aritméticos multi-paso sin bucles de repetición en CPU.
- Prototipado de pipelines de IA generativa en macOS: la build de texto fue verificada con litert-lm 0.18.0 y 0.15.0 en Mac, lo que permite validar la lógica conversacional antes de desplegar en dispositivos.
- Filtrado y moderación de contenido en el borde: la ventana de 4096 tokens y el bajo coste de memoria permiten clasificar mensajes largos en el propio dispositivo sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos medidos son de rendimiento en dispositivo:

| Plataforma | Runtime | Backend | Decode | Prefill | TTFT | Fecha |
|---|---|---|---|---|---|---|
| Galaxy S26 | LiteRT-LM 0.16.0 | GPU | 17,5 tok/s | 450 tok/s | 520 ms | 2026-09-05 |
| Galaxy S26 | LiteRT-LM 0.16.0 | CPU | 19,0 tok/s | 181 tok/s | 1,20 s | 2026-09-05 |
| Raspberry Pi 5 (4 hilos) | LiteRT-LM 0.16.1 | CPU | 4,2 tok/s | 56 tok/s | 5,04 s | 2026-09-01 |

Las mediciones en Galaxy S26 corresponden al fichero VL anterior a la recuantización del 2026-10-11 (sha256 `f8821e40…`); los 25.703 operadores quedaron delegados a GPU.

## Requisitos de hardware

- VRAM/RAM: aproximadamente 1,97 GB para la build de texto int8 y 3,15 GB para la build VL int8, más el estado recurrente de las capas lineales y la caché KV de las 6 capas de atención (presupuesto de 4096 tokens).
- GPU recomendadas: no se especifican modelos de escritorio; las mediciones publicadas usan la GPU integrada de un Galaxy S26 (Adreno) con delegación completa de operadores.
- Cabe en GPU de consumo: el tamano de 2 a 3 GB permite ejecución en GPUs de consumo, aunque no se documentan pruebas en RTX 4090, A100 o H100.
- CPU: Raspberry Pi 5 con 4 hilos ejecuta la build de texto a 4,2 tok/s; un Galaxy S26 alcanza 19,0 tok/s en CPU.
- Opciones de despliegue: LiteRT-LM ≥ 0.15 (verificado en 0.15.0, 0.16.0, 0.16.1 y 0.18.0), con backends GPU y CPU; en Android mediante `com.google.ai.edge.litert:litert`; conversión desde PyTorch con `litert_torch.convert`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: TTFT de 520 ms en GPU de Galaxy S26 y de 1,20 s en CPU del mismo dispositivo; 5,04 s en Raspberry Pi 5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B (LiteRT-LM, este) | 2B | 4096 KV en 6 capas de atención | `.litertlm` int8 | Apache 2.0 | Hugging Face, 8.916 descargas |
| Qwen3.5-0.8B (LiteRT-LM) | 0,8B | no disponible | `.litertlm` int8 | Apache 2.0 | Hugging Face, misma ruta de conversión |
| Qwen3.5-4B (LiteRT-LM) | 4B | no disponible | `.litertlm` int8 | Apache 2.0 | Hugging Face, misma ruta de conversión |
| Qwen/Qwen3.5-2B (original) | 2B | no disponible | safetensors | Apache 2.0 | Hugging Face |

Las tres variantes LiteRT-LM comparten la ruta de conversión y el kernel gated-delta delegable a GPU; no se han publicado métricas de calidad que permitan comparar rendimiento entre ellas.

## Limitaciones y advertencias

- La versión del 2026-08-14 (texto) y la del 2026-08-25 (VL), previas a la recuantización del 2026-10-11, producían respuestas en bucle a aritmética multi-paso en el backend CPU con thinking off; deben descargarse los ficheros posteriores a esa fecha.
- El autor reconoce que la advertencia sobre el comportamiento de un solo Engine se añadió a la model card el 2026-10-12 pese a estar descrito en un informe abierto desde el 2026-08-06, y que la omisión fue suya.
- El tokenizador anterior al 2026-10-16 segmentaba de forma distinta el texto con marcas combinantes (49 frente a 36 tokens en hindi, 24 frente a 12 en tailandés, 29 frente a 16 en tamil, 30 frente a 29 en árabe con harakat); debe usarse la versión con `tokenizer.json` del repositorio de Qwen.
- La ventana de contexto efectiva está limitada a 4096 tokens en las capas de atención; las capas lineales no amplían ese límite.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo de 2B, la fiabilidad en razonamiento complejo es limitada frente a modelos mayores.
- No se enumeran idiomas soportados oficialmente, lo que dificulta evaluar la cobertura multilingüe más allá de las pruebas de tokenización.
- La licencia Apache 2.0 permite uso comercial, pero el artefacto depende del runtime LiteRT-LM ≥ 0.15 y de la plataforma Android/Linux; no hay soporte documentado para servidores de inferencia convencionales.
- El repositorio ocupa 24,4 GB, muy superior al tamano de los ficheros int8, por lo que la descarga completa no es necesaria para el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Qwen3.5-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante 0.8B: https://huggingface.co/litert-community/Qwen3.5-0.8B
- Variante 4B: https://huggingface.co/litert-community/Qwen3.5-4B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Ficha de rendimiento edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/qwen35-2b-vl-int8/CARD.md
- Benchmark de runtimes en Apple Silicon y Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
