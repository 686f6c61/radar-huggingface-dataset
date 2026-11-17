# Infinix-io/ZONOS3-Mini

## Resumen

ZONOS3-Mini es un modelo de texto a voz (TTS) de código abierto desarrollado por Zyphra, publicado bajo licencia Apache 2.0. Se trata de un modelo compacto disenado para sintesis de voz natural y clonacion de voz de alta fidelidad, con capacidad de ejecucion en tiempo real en telefonos, portatiles y directamente en el navegador mediante WebGPU. El modelo forma parte de la familia Zonos y se distribuye con un ecosistema de runtimes propios (CUDA, MLX para Apple Silicon, C++/ggml para CPU/CUDA/Metal/Vulkan y WebGPU).

La arquitectura combina un backbone hibrido MoE con atencion y capas GDN (Gated DeltaNet), que genera de forma autorregresiva tramas dual-codec a 15 Hz (10 codebooks de 4.096 entradas cada uno: uno semantico destilado de un profesor Wav2Vec2-BERT y nueve acusticos). Una cabeza iSTFT causal multi-resolucion renderiza las tramas a audio de 44,1 kHz a medida que se producen. El modelo cuenta con 886.342.504 parametros totales segun los pesos en safetensors, aunque la model card describe aproximadamente 100 millones de parametros activos, lo que sugiere un diseno de mezcla de expertos con activacion dispersa.

Su relevancia actual radica en que ofrece clonacion de voz multilingue (43 idiomas) con control granular de emocion, ritmo y textura vocal, todo ello en un paquete lo suficientemente pequeno para inferencia local en hardware de consumo. La disponibilidad de pesos en safetensors y GGUF, junto con runtimes nativos y soporte para SGLang-Omni con endpoint compatible con OpenAI, lo posicionan como una opcion practica para desarrolladores que necesitan TTS de calidad sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE con atencion y capas GDN (Gated DeltaNet), generacion autorregresiva de tramas dual-codec a 15 Hz y cabeza iSTFT causal multi-resolucion |
| Parametros totales | 886.342.504 (segun safetensors); la model card menciona aproximadamente 100 millones de parametros activos |
| Parametros activos | Aproximadamente 100 millones (segun model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (disponible en el repositorio); niveles especificos no disponibles |
| Idiomas soportados | 43 idiomas: en, fr, es, de, it, pt, nl, pl, ru, sv, tr, uk, cs, da, fi, el, hu, no, ro, sk, bg, zh, ja, ko, ar, he, vi, id, th, tl, ms, ka, hi, bn, ta, te, mr, gu, kn, ml, pa, or, ur |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF; shards WebGPU en el directorio `web/` |

## Arquitectura y entrenamiento

El modelo emplea un backbone hibrido que combina mecanismos de atencion con capas GDN (Gated DeltaNet) dentro de una estructura de mezcla de expertos (MoE). El texto se normaliza con NeMo (para ingles, mandarin, japones, coreano, aleman, espanol, frances, italiano y portugues; el resto de idiomas pasa tal cual) y se codifica con un tokenizador SuperBPE de 8.192 entradas. El modelo de lenguaje genera de forma autorregresiva tramas dual-codec a 15 Hz, compuestas por 10 codebooks de 4.096 entradas cada uno: un codebook semantico destilado de un profesor Wav2Vec2-BERT y nueve codebooks acusticos. La generacion se condiciona con el texto, un prompt de hablante y tres controles acusticos agrupados en buckets. Una cabeza iSTFT causal multi-resolucion renderiza las tramas a 44,1 kHz en tiempo real.

La model card describe un patron de retardo (delay pattern) en la prediccion de los diez codebooks de la siguiente trama, aunque el texto proporcionado se interrumpe antes de detallar el mecanismo completo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica destacable es la combinacion de un backbone MoE eficiente con una cabeza de sintesis iSTFT causal que permite streaming de audio a 44,1 kHz, junto con la destilacion de un codebook semantico desde Wav2Vec2-BERT para mejorar la calidad de la representacion.

## Capacidades

- Sintesis de voz (text-to-speech) natural y multilingue en 43 idiomas.
- Clonacion de voz a partir de una muestra de audio de referencia, sin necesidad de transcripcion.
- Diseno de personajes vocales mediante el ajuste de edad, acento y textura vocal.
- Control granular de emocion, ritmo y estilo de locucion, hasta el nivel de palabra individual.
- Generacion de audio a 44,1 kHz con streaming en tiempo real.
- Ejecucion local en navegador mediante WebGPU, en GPU NVIDIA via CUDA, en Apple Silicon via MLX y en CPU/GPU via C++/ggml (CPU, CUDA, Metal, Vulkan).
- Servido mediante SGLang-Omni con endpoint compatible con OpenAI `/v1/audio/speech`, con soporte de streaming y clonacion de voz.
- 27 voces por defecto agrupadas por idioma, disponibles en `gguf/voices/`.
- No se mencionan capacidades de tool calling, agentes, vision ni audio de entrada mas alla de la referencia de voz para clonacion.

## Casos de uso

- Asistentes de voz locales: el modelo puede ejecutarse en el navegador o en un portatil mediante WebGPU o MLX, generando respuestas habladas en tiempo real sin enviar datos a la nube, lo que es adecuado para aplicaciones de privacidad sensible.
- Clonacion de voz para narracion y audiolibros: a partir de una muestra de audio de referencia, el modelo replica la voz del narrador y permite ajustar emocion y ritmo por palabra, util para produccion de contenido largo con consistencia vocal.
- Videojuegos y doblaje de personajes: el diseno de personajes vocales mediante edad, acento y textura, junto con el control de emocion y entrega, permite generar dialogos dinamicos para NPCs sin grabaciones adicionales.
- Atencion al cliente automatizada: el endpoint compatible con OpenAI de SGLang-Omni permite integrar el modelo en pipelines existentes de agentes conversacionales, generando respuestas de voz con streaming a 44,1 kHz y clonacion de la voz de la marca.
- Accesibilidad y lectores de pantalla: la inferencia local en CPU mediante el servidor C++/ggml y la disponibilidad de GGUF permiten desplegar TTS en dispositivos sin GPU dedicada, facilitando la lectura de texto a voz en entornos con recursos limitados.
- Localizacion de contenido multilingue: con 43 idiomas soportados y normalizacion NeMo para los principales, el modelo puede generar pistas de voz para videos o cursos en multiples idiomas manteniendo un estilo de locucion consistente.
- Prototipado rapido en navegador: el Zonos Voice Studio y la version Lite permiten probar clonacion de voz y sintesis directamente en el navegador con WebGPU, sin instalacion ni servidor, adecuado para demos y validacion de conceptos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 886 millones de parametros totales, los pesos en safetensors en FP16 ocuparian aproximadamente 1,8 GB, y las versiones GGUF cuantizadas reducirian esta cifra significativamente (los niveles concretos no se detallan).
- GPU recomendadas: NVIDIA con CUDA (servidor CUDA propio y SGLang-Omni), Apple Silicon con MLX, y cualquier GPU con soporte Metal o Vulkan mediante el servidor C++/ggml.
- Cabe en GPU de consumo: si, segun la model card el modelo esta disenado para ejecutarse en tiempo real en telefonos y portatiles; los modelos concretos de GPU de consumo no se especifican.
- Opciones de despliegue: SGLang-Omni (endpoint compatible con OpenAI `/v1/audio/speech`), servidor CUDA propio, servidor MLX para Apple Silicon, servidor y CLI C++/ggml (CPU, CUDA, Metal, Vulkan), build WebGPU para navegador, y Zyphra Cloud como opcion hospedada.
- Latencia y throughput: la model card indica ejecucion en tiempo real en telefonos y portatiles, y streaming de audio a 44,1 kHz; no se proporcionan cifras concretas de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos | Notas |
|---|---|---|---|---|---|---|
| ZONOS3-Mini | 886.342.504 totales, ~100 M activos | No disponible | 43 | Apache 2.0 | Safetensors, GGUF, WebGPU | Clonacion de voz, control granular, inferencia local en navegador |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de informacion sobre modelos comparables en la documentacion proporcionada |

No se dispone de datos verificables sobre modelos alternativos de TTS de caracteristicas similares en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- No se han publicado en la informacion disponible datos sobre sesgos conocidos del modelo; como todo sistema entrenado con datos de voz, es probable que herede sesgos de acento, genero y origen de los corpus de entrenamiento, pero no se detallan.
- Riesgo de alucinacion: en TTS, el riesgo se manifiesta como prosodia incorrecta, pronunciacion erronea o artefactos acusticos; no se documentan tasas de error en la informacion disponible.
- Limitaciones de contexto: la longitud de contexto no esta especificada, lo que impide conocer el limite maximo de texto de entrada por generacion.
- Limitaciones de idioma: la normalizacion NeMo solo cubre ingles, mandarin, japones, coreano, aleman, espanol, frances, italiano y portugues; el resto de los 43 idiomas pasa el texto tal cual, lo que puede afectar a la calidad de la sintesis en esos casos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero no se detallan en la informacion disponible condiciones adicionales sobre el uso de voces clonadas ni sobre derechos de las muestras de referencia.
- Caveats para produccion: el modelo se publico el 17 de noviembre de 2026 con 0 descargas y 0 likes en Hugging Face, lo que sugiere que no cuenta aun con validacion de la comunidad; ademas, el repositorio ocupa 30,6 GB, lo que implica un coste de almacenamiento y descarga considerable.
- La model card menciona aproximadamente 100 millones de parametros activos, mientras que los safetensors suman 886.342.504 parametros totales; esta discrepancia debe tenerse en cuenta al planificar recursos, ya que el consumo real dependera del grado de activacion de la MoE.

## Enlaces

- Hugging Face: https://huggingface.co/Infinix-io/ZONOS3-Mini
- Paper (arXiv): https://arxiv.org/abs/2611.16525
- Repositorio GitHub: https://github.com/Zyphra/ZONOS3-Mini
- Blog post: https://www.zyphra.com/our-work/zonos3-mini
- Zyphra Cloud: https://cloud.zyphra.com/models/zyphra/ZONOS3-Mini
- Zonos Voice Studio (navegador): https://zyphra.com/zonos3-mini/localplayground#cast
- Zonos Voice Studio Lite: https://zyphra.com/zonos3-mini/localplayground/lite
- SGLang-Omni: https://github.com/sgl-project/sglang-omni
- Guia de instalacion de SGLang-Omni: https://github.com/sgl-project/sglang-omni/blob/main/docs/get_started/installation.md
- Cookbook de ZONOS3: https://github.com/sgl-project/sglang-omni/blob/main/docs/cookbook/zonos3.md
- Directorio GGUF: https://huggingface.co/Zyphra/ZONOS3-Mini/tree/main/gguf
- Directorio WebGPU: https://huggingface.co/Zyphra/ZONOS3-Mini/tree/main/web
- Voces por defecto: https://huggingface.co/Zyphra/ZONOS3-Mini/blob/main/gguf/voices/README.md
- Discord: https://discord.gg/gTW9JwST8q
