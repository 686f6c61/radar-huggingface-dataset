# empiriolabsai/canora-korean

## Resumen

Canora Korean es un modelo de síntesis de voz (text-to-speech) específico para coreano, desarrollado por EmpirioLabs. Se trata de un ajuste fino (finetune) del conocido Kokoro-82M de hexgrad, lo que le permite heredar la arquitectura y el rendimiento del modelo original: 82 millones de parámetros y una velocidad de inferencia muy alta. El modelo incorpora dos voces predefinidas, `seoyeon` (femenina) y `minjun` (masculina), y está pensado para producir habla natural en coreano con un manejo correcto de números, fechas, horas y precios tal y como los pronuncia un hablante nativo.

La relevancia de este modelo radica en su relación calidad/tamaño: con solo 82M de parámetros ofrece una inteligibilidad comparable a sistemas más pesados como MeloTTS Korean (CER del 3,3 % frente al 3,4 % en 200 frases de evaluación) y una puntuación de naturalidad (UTMOS) superior. Además, se distribuye con pesos ONNX en precisión completa, media e int8, lo que facilita su despliegue tanto en servidores como en entornos web mediante transformers.js, y su licencia Apache 2.0 permite uso comercial sin restricciones.

El modelo está claramente orientado a aplicaciones de producción que requieran TTS en coreano con latencia baja y huella reducida. La inclusión de un módulo de conversión de texto a fonemas (G2P) específico para coreano, escrito en Python puro, elimina dependencias externas y simplifica la integración en pipelines existentes basados en el paquete `kokoro`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (basada en StyleTTS 2, según el tag `style_text_to_speech_2`) |
| Parámetros totales | 82 millones |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (TTS; se recomienda limitar cada llamada a unas 500 fonemas) |
| Tipos de cuantización | Precisión completa (FP32), media precisión (FP16) e int8 (ONNX); el archivo int8 pesa 115 MB |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`), ONNX (precisión completa, media e int8), voces en `.pt` |

## Arquitectura y entrenamiento

Canora Korean es un ajuste fino de Kokoro-82M, un modelo de síntesis de voz basado en la arquitectura StyleTTS 2. Esta arquitectura combina un codificador de texto, un modelo de prosodia y un decodificador de audio, y está diseñada para generar habla natural con un número reducido de parámetros. El modelo base Kokoro-82M es conocido por su eficiencia y por su capacidad de ejecutarse en CPU, y Canora Korean conserva esas propiedades.

No se dispone de información detallada sobre el conjunto de datos de entrenamiento utilizado para el ajuste fino: no se especifican el número de horas de audio, la composición del corpus ni si se emplearon técnicas de RLHF o DPO. La model card únicamente indica que se trata de un finetune del modelo base y que se ha añadido un módulo de conversión de texto a fonemas específico para coreano (`g2p_ko.py`), escrito en Python puro, que gestiona correctamente la lectura de números, fechas, horas y precios. Tampoco se detallan innovaciones técnicas adicionales más allá de las heredadas del modelo base.

## Capacidades

- Síntesis de voz en coreano a partir de texto, con dos voces: `seoyeon` (femenina) y `minjun` (masculina).
- Lectura correcta de números, fechas, horas y precios según la convención oral coreana (por ejemplo, "4,500원" se lee como "사천오백 원").
- Generación de audio a 24 kHz (según el ejemplo de código, `sf.write(..., 24000)`).
- Control de velocidad de habla mediante un parámetro escalar (1.0 = velocidad normal).
- Ejecución en PyTorch y en ONNX Runtime, con pesos disponibles en FP32, FP16 e int8.
- Compatibilidad con transformers.js para despliegue en navegador o entornos JavaScript.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje; es exclusivamente un modelo de TTS.
- No dispone de modo "thinking", visión ni audio de entrada.

## Casos de uso

- **Atención al cliente automatizada en coreano**: el modelo puede generar respuestas habladas para sistemas IVR o asistentes virtuales. Su reducido tamaño (82M) y su velocidad (hasta 5,2x tiempo real en ONNX int8) permiten manejar múltiples llamadas concurrentes en un solo servidor sin necesidad de GPU dedicada.
- **Lectura de noticias y artículos**: la capacidad de pronunciar correctamente fechas, horas y cifras lo hace adecuado para convertir boletines informativos o artículos en audio. Se pueden procesar textos largos dividiéndolos en frases de hasta 500 fonemas y uniendo los fragmentos de audio.
- **Sistemas de navegación y transporte**: anuncios de llegadas, salidas y precios en estaciones o aplicaciones de transporte. El modelo lee de forma natural expresiones como "부산행 열차는 오후 2시 35분에 출발합니다" (el tren a Busan sale a las 14:35).
- **Audiolibros y contenido educativo**: generación de narraciones en coreano con dos voces disponibles, lo que permite alternar voces para diálogos o secciones. La licencia Apache 2.0 permite su uso en productos comerciales sin restricciones.
- **Integración en aplicaciones web**: gracias a los pesos ONNX y a la compatibilidad con transformers.js, se puede ejecutar la síntesis directamente en el navegador del usuario, reduciendo la latencia y evitando el envío de texto a servidores externos.
- **Sistemas de accesibilidad**: conversión de texto a voz para personas con discapacidad visual o para la lectura de contenidos en pantalla. El modelo es lo suficientemente ligero como para ejecutarse en dispositivos de gama baja o en CPU.
- **Generación de avisos y notificaciones**: anuncios de precios, horarios o recordatorios en aplicaciones móviles o altavoces inteligentes, donde la corrección en la lectura de cifras es crítica.

## Benchmarks y rendimiento

Los resultados publicados por EmpirioLabs el 2026-11-20, medidos sobre 200 frases coreanas no vistas durante el entrenamiento, son los siguientes. La transcripción se realizó con `openai/whisper-large-v3` y se comparó con el texto original (CER: tasa de error de caracteres, menor es mejor; UTMOS: estimación automática de naturalidad en escala de 1 a 5, mayor es mejor).

| Sistema | CER | UTMOS |
|---|---:|---:|
| Canora Korean `seoyeon` | 3,34 % | **4,23** |
| Canora Korean `minjun` | **3,32 %** | 3,96 |
| MeloTTS Korean | 3,41 % | 3,82 |
| Piper `ko_KR-kss-medium` | 4,51 % | 3,60 |

Para la versión ONNX int8, los resultados son: `seoyeon` 3,48 % CER y UTMOS 3,49; `minjun` 3,13 % CER y UTMOS 3,36.

En cuanto a velocidad, medida sobre 60 frases en 4 hilos de un AMD EPYC 7B13 de 64 núcleos (segundos de audio por segundo de cómputo): PyTorch 4,0x tiempo real, ONNX precisión completa 4,5x, ONNX int8 5,2x. La velocidad depende del procesador y del número de hilos; la arquitectura es la de Kokoro-82M, por lo que el rendimiento coincide con el de este modelo en la misma máquina.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no se especifica, pero al tratarse de un modelo de 82M de parámetros, la inferencia en FP32 requiere aproximadamente 0,3 GB de memoria; en int8, alrededor de 0,1 GB. Cabe en cualquier GPU consumer e incluso en CPU.
- **GPU recomendadas**: no se requieren GPU dedicadas; el modelo está diseñado para ejecutarse en CPU. En caso de usar GPU, cualquier modelo con al menos 1 GB de VRAM es suficiente (por ejemplo, GTX 1050, RTX 3050, RTX 4090, A100, H100).
- **¿Cabe en consumer GPU?**: sí, en cualquier GPU consumer, e incluso en dispositivos de gama baja.
- **Opciones de despliegue**: PyTorch (paquete `kokoro`), ONNX Runtime, transformers.js. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- **Latencia y throughput estimados**: según la model card, 4,0x tiempo real en PyTorch, 4,5x en ONNX FP32 y 5,2x en ONNX int8, medido en 4 hilos de un AMD EPYC 7B13. El throughput exacto dependerá del hardware y del número de hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (coreano) | UTMOS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Canora Korean | 82M | No disponible (TTS) | 3,32–3,34 % | 3,96–4,23 | Apache 2.0 | Hugging Face |
| MeloTTS Korean | No disponible | No disponible | 3,41 % | 3,82 | No disponible | No disponible |
| Piper `ko_KR-kss-medium` | No disponible | No disponible | 4,51 % | 3,60 | No disponible | No disponible |

Canora Korean ofrece la mejor puntuación UTMOS de la comparativa y un CER comparable al de MeloTTS Korean, con la ventaja de un tamaño reducido y una licencia permisiva. No se dispone de datos de parámetros, contexto ni licencia para MeloTTS Korean y Piper en la información proporcionada.

## Limitaciones y advertencias

- **Idioma único**: el modelo solo soporta coreano; no está entrenado para otros idiomas.
- **Riesgo de alucinación**: como todo modelo de TTS, puede producir pronunciaciones incorrectas en palabras poco frecuentes, nombres propios o extranjerismos. La evaluación se realizó sobre frases genéricas y no cubre todos los dominios.
- **Longitud de entrada limitada**: se recomienda no superar los 500 fonemas por llamada; para textos más largos es necesario dividir en frases y unir el audio, lo que puede introducir discontinuidades en la prosodia.
- **Sesgos**: no se han documentado sesgos específicos, pero al ser un modelo entrenado con datos no especificados, podría reflejar sesgos de pronunciación o de estilo presentes en el corpus.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la licencia. No se especifican restricciones adicionales.
- **Dependencia de G2P**: la calidad de la síntesis depende del módulo `g2p_ko.py` incluido en el repositorio; si se usa otro conversor de texto a fonemas, los resultados pueden variar.
- **Caveat para producción**: la velocidad y la calidad pueden degradarse en textos con muchas cifras o símbolos si el módulo G2P no los maneja correctamente; se recomienda validar con datos representativos del dominio de uso.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/empiriolabsai/canora-korean)
- [Sitio web de EmpirioLabs](https://empiriolabs.ai)
- [Todos los modelos de EmpirioLabs](https://huggingface.co/empiriolabsai)
- [Plataforma de EmpirioLabs](https://platform.empiriolabs.ai)
- [Discord de EmpirioLabs](https://discord.gg/bM52azW4ZD)
- [Modelo base Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)
