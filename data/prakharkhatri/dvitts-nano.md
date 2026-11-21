# prakharkhatri/dvitts-nano

## Resumen

DviTTS-Nano es un sistema de síntesis de voz (text-to-speech) desarrollado por prakharkhatri, diseñado específicamente para ejecutarse en dispositivos de gama baja sin GPU ni PyTorch. Se distribuye como un conjunto de ficheros ONNX que funcionan en Android, iOS, escritorio y servidores a través de ONNX Runtime, con un total de 140,7 millones de parámetros y un tamaño de repositorio de 0,6 GB. Es el hermano pequeño de DviTTS (0,5B), del que se destila una etapa 1 de 110M, una etapa 2 de un solo paso y un decodificador cuantizado.

El modelo parte de Fun-CosyVoice3-0.5B-2512 (FunAudioLLM / Alibaba, Apache 2.0), reentrenado para emitir identificadores de IndiCodec y hablar seis idiomas indios además del inglés. Resuelve el problema de la síntesis de voz multilingüe en entornos con recursos limitados: teléfonos, portátiles y sistemas embebidos donde no hay acelerador gráfico disponible. Frente al modelo completo, sacrifica la clonación de voz (que requiere DviTTS) y ofrece 18 voces predefinidas con nombre.

La relevancia actual reside en su enfoque de despliegue: un único directorio de ficheros ONNX sirve para múltiples plataformas, con una ruta opcional de aceleración mediante llama.cpp en x86 (formato GGUF q8_0, aproximadamente 1,3 veces más rápido). Incorpora marca de agua AudioSeal en todas las salidas, lo que resulta relevante para trazabilidad y uso responsable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etapa 1: modelo de lenguaje transformer (destilado de Fun-CosyVoice3-0.5B); etapa 2: flow de un paso; decodificador IndiCodec cuantizado |
| Parametros totales | 140.729.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Decodificador cuantizado; etapa 1 en formato GGUF q8_0 para llama.cpp en x86; grafos ONNX de 8 bits para ARM |
| Idiomas soportados | en, hi, mr, bn, pa, gu, or |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (onnxruntime), GGUF (s1_q8_0.gguf para etapa 1 en x86) |

## Arquitectura y entrenamiento

DviTTS-Nano es un sistema de dos etapas. La etapa 1 es un modelo de lenguaje de 110M parámetros destilado del modelo de 0,5B de DviTTS, que a su vez deriva de Fun-CosyVoice3-0.5B-2512 de FunAudioLLM / Alibaba. Esta etapa genera identificadores de IndiCodec a partir del texto de entrada. La etapa 2 es un flow de un solo paso que transforma esos identificadores en representaciones acústicas, y un decodificador IndiCodec cuantizado produce la forma de onda final. El resultado se empaqueta como grafos ONNX ejecutables sin PyTorch.

El entrenamiento consistió en reentrenar el modelo base para emitir identificadores de IndiCodec y ampliar su cobertura a seis idiomas indios además del inglés. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es la destilación a 110M con flow de un paso y decodificador cuantizado, que permite inferencia en CPU de teléfono o portátil. En x86, la etapa 1 puede ejecutarse opcionalmente sobre llama.cpp en formato GGUF q8_0, con una mejora de velocidad de aproximadamente 1,3 veces; en ARM se mantiene la ruta ONNX porque los grafos de 8 bits rinden mejor en esa arquitectura. Todas las salidas incorporan la marca de agua AudioSeal.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés y seis idiomas indios: hindi, marathi, bengalí, panyabí, guyaratí y odia.
- 18 voces predefinidas con nombre (por ejemplo, emma y james en inglés; ananya y arjun en hindi; sneha en marathi; arnab en bengalí; jasleen en panyabí; kunal en guyaratí; subhashree en odia).
- Ejecución en CPU sin GPU y sin PyTorch, mediante ONNX Runtime.
- Despliegue multiplataforma con los mismos ficheros: Android, iOS, escritorio y servidores.
- Aceleración opcional en x86 Windows y Linux mediante llama.cpp con el fichero `s1_q8_0.gguf`.
- Conversión automática de números a palabras para la síntesis (dependencias `num2words` e `indic-numtowords`).
- Marca de agua AudioSeal incorporada en cada salida de audio.
- No soporta clonación de voz: esa función requiere el modelo completo DviTTS.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura de notificaciones y accesibilidad en Android: el modelo se integra como motor TTS local en la aplicación Android del proyecto, sintetizando texto en inglés o en idiomas indios sin conexión y sin GPU, lo que reduce latencia y preserva la privacidad del usuario.
- Asistentes de voz sin conexión en dispositivos embebidos: al ejecutarse sobre ONNX Runtime en CPU, puede desplegarse en teléfonos de gama baja y sistemas con recursos limitados donde no hay acelerador gráfico.
- Audiolibros y contenido educativo multilingüe: las 18 voces predefinidas permiten generar narraciones en siete idiomas con una sola tubería de inferencia, adecuado para materiales dirigidos a hablantes de hindi, marathi, bengalí, panyabí, guyaratí y odia.
- Sistemas de anuncios públicos y señalización: la síntesis local en CPU permite generar avisos en varios idiomas indios en quioscos o paneles sin dependencia de servicios en la nube.
- Prototipado rápido de aplicaciones de voz en portátil: el runner de referencia en Python (`dvitts_onnx.py`) permite probar la síntesis con un comando y validar la integración antes de portar a móvil.
- Generación de audio para pruebas de calidad y regresión: la marca de agua AudioSeal en cada salida facilita la trazabilidad del contenido sintético en pipelines de evaluación y auditoría.
- Servicios de atención al cliente con locuciones pregrabadas dinámicas: el modelo puede generar mensajes de espera y respuestas habladas en varios idiomas indios en servidores sin GPU, con coste de infraestructura reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta un dato comparativo de velocidad para el modelo completo DviTTS (0,37x tiempo real en una GPU A10G) y una mejora aproximada de 1,3x en la etapa 1 de DviTTS-Nano al usar llama.cpp frente a ONNX Runtime en x86. No se proporcionan cifras de latencia ni throughput absolutas para DviTTS-Nano.

## Requisitos de hardware

- Inferencia en CPU: no requiere GPU ni PyTorch; el modelo está pensado para ejecutarse en CPU de teléfono o portátil.
- VRAM estimada: no aplica en la ruta CPU; no se dispone de cifras de VRAM para una hipotética ruta GPU.
- GPU recomendadas: no disponible; el modelo no está diseñado para GPU.
- ¿Cabe en GPU de consumo? No aplica: el objetivo es la ejecución en CPU. El tamaño del repositorio (0,6 GB) y los 140,7M de parámetros indican un consumo de memoria moderado en CPU.
- Opciones de despliegue: ONNX Runtime (ruta principal, todas las plataformas); llama.cpp mediante `llama-cpp-python` en x86 Windows y Linux con `s1_q8_0.gguf`; aplicación Android del repositorio del proyecto.
- Dependencias del runner: `onnxruntime==1.32.0`, `tokenizers`, `numpy`, `num2words`, `indic-numtowords`; para la ruta llama.cpp, `typing-extensions`, `diskcache` y `jinja2`, con ruedas precompiladas de `llama-cpp-python` v0.3.36 fijadas por sha256 en `requirements-laptop.txt`.
- Latencia y throughput: no disponible; solo se conoce la mejora relativa de aproximadamente 1,3x en la etapa 1 con llama.cpp en x86.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Voces | Ejecucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DviTTS-Nano | 140,7M | no disponible | 18 predefinidas | CPU (ONNX, llama.cpp opcional) | Apache 2.0 | Hugging Face, app Android, demo |
| DviTTS | 0,5B etapa 1 + 130M flow + decodificador IndiCodec | no disponible | Clonación desde 3-10 s o 18 predefinidas | GPU CUDA (A10G: 0,37x tiempo real) | Apache 2.0 | Hugging Face, pip |
| Fun-CosyVoice3-0.5B-2512 | 0,5B | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos de la propia familia y al modelo base, únicos para los que la información disponible aporta datos. No se dispone de información sobre otros modelos TTS comparables en tamaño o tarea.

## Limitaciones y advertencias

- No soporta clonación de voz: para clonar a partir de una grabación de 3-10 segundos es necesario el modelo completo DviTTS.
- Solo ofrece 18 voces predefinidas con nombre; no se documenta la posibilidad de ajustar el estilo o la emoción.
- Cobertura lingüística limitada a inglés y seis idiomas indios (hindi, marathi, bengalí, panyabí, guyaratí, odia); no se documentan otros idiomas.
- No se especifican en la información disponible sesgos conocidos del modelo ni tasas de alucinación o errores de pronunciación.
- La marca de agua AudioSeal está presente en todas las salidas; debe tenerse en cuenta en flujos de postprocesado que puedan alterar o eliminar la señal.
- La ruta de aceleración con llama.cpp en x86 requiere instalar ruedas precompiladas de `llama-cpp-python` fijadas por sha256; una instalación estándar desde PyPI necesita compilador de C++.
- En ARM (Apple Silicon, Windows on ARM, teléfonos) debe mantenerse la ruta ONNX, ya que los grafos de 8 bits son lentos en x86 pero rápidos en ARM.
- Licencia Apache 2.0: permite uso comercial con las obligaciones habituales de atribución y aviso de licencia; no se documentan restricciones adicionales.
- El número de descargas (33) y de likes (0) en el momento de la consulta indica una adopción muy temprana; conviene validar la calidad de síntesis en el caso de uso concreto antes de llevarlo a producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prakharkhatri/dvitts-nano
- Modelo completo DviTTS: https://huggingface.co/prakharkhatri/dvitts
- Modelo base Fun-CosyVoice3-0.5B-2512: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Códec IndiCodec: https://huggingface.co/prakharkhatri/IndiCodec
- Repositorio del proyecto (app Android y código): https://github.com/codeprakhar25/dvitts-nano
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/prakharkhatri/DviTTS-demo
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper referenciado (arXiv:2505.17589): https://arxiv.org/abs/2505.17589
