# nuhmanpk/mozhi-tts

## Resumen

Mozhi-TTS es un modelo de síntesis de voz (text-to-speech) especializado en malayalam, desarrollado por el usuario nuhmanpk y publicado en Hugging Face. Se distribuye principalmente como un paquete de Python (`mozhi-tts`) que envuelve el modelo base `nuhmanpk/mozhi-tts-v1`, ofreciendo una interfaz de tres líneas para generar audio expresivo a partir de texto en malayalam o en *Manglish* (malayalam escrito con letras latinas). El modelo está pensado para desarrolladores que necesitan integrar voz en malayalam en aplicaciones sin construir un pipeline TTS desde cero.

La propuesta diferencial del proyecto no es solo el modelo acústico, sino la ergonomía del *wrapper*: selección de diez voces, emociones con cuatro intensidades, estilos de habla, etiquetas inline (`[laughs]`, `[very sad]`, `[pause]`), clonación de voz, modo rápido con decodificación en fp16 y caché KV estática, y un modo Lite con la mitad de capas del decodificador. El modelo completo ocupa aproximadamente 3,8 GB en caché y requiere aceptar los términos en Hugging Face antes de la descarga.

La relevancia actual radica en la escasez de modelos TTS abiertos de calidad para lenguas dravídicas distintas del tamil y el telugu. Mozhi-TTS cubre malayalam con licencia MIT, lo que facilita su adopción comercial, aunque el ecosistema es todavía incipiente: cero descargas y cero *likes* en el momento de la consulta, y un modelo Lite aún no publicado a la espera de superar sus controles de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS con decodificador de capas reducibles en variante Lite; detalles del backbone no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (capas Linear en CPU); fp32 en modo estándar; fp16 en modo rápido |
| Idiomas soportados | malayalam (ml); entrada adicional en Manglish (malayalam transliterado a caracteres latinos) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribución vía caché de Hugging Face; el paquete se instala como wheel o desde git) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `nuhmanpk/mozhi-tts-v1`. El paquete documenta únicamente decisiones de despliegue: un decodificador completo en la variante estándar y una variante Lite con la mitad de capas del decodificador, lo que sugiere una arquitectura de tipo autorregresiva o *encoder-decoder* con decodificador profundo, pero no se confirma el tipo de backbone (transformer, difusión, VITS u otro). Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

Las innovaciones documentadas son de inferencia más que de entrenamiento: modo rápido con decodificador en fp16, caché KV estática, `torch.compile` (con una compilación inicial de 1-2 minutos por longitud de texto) y caché de *captions*. Además, el sistema soporta *guidance* de emoción en el modo rápido sin compilación, y ofrece cuantización int8 de capas lineales para CPU. El modelo base requiere aceptación explícita de términos en Hugging Face, lo que sugiere un proceso de acceso controlado pese a la licencia MIT del wrapper.

## Capacidades

- Síntesis de voz en malayalam a partir de texto nativo o Manglish.
- Diez voces seleccionables (por ejemplo, `Thara`).
- Emociones configurables con cuatro intensidades de fuerza.
- Estilos de habla, control de ritmo (*pace*) y tono (*pitch*).
- Etiquetas inline para risas, tristeza intensa y pausas (`[laughs]`, `[very sad]`, `[pause]`).
- Clonación de voz.
- Generación por lotes (*batches*), subtítulos y peticiones en JSON.
- Streaming de audio en modo rápido.
- Interfaz de línea de comandos (`mozhi-tts`) y API de Python (`mozhi_tts.load()`, `mozhi_tts.speak()`, `mozhi_tts.save()`).
- Ejecución en GPU NVIDIA (fp32/fp16), CPU (fp32/int8) y Apple MPS (experimental).

## Casos de uso

- **Audiolibros y narración en malayalam**: el modo estándar en fp32 sobre GPU ofrece la máxima calidad y permite aplicar emociones y estilos por fragmento, adecuado para producir capítulos completos con voces consistentes.
- **Asistentes conversacionales y chatbots de voz**: el modo rápido (`load(fast=True)`) con fp16, caché KV estática y streaming reduce la latencia lo suficiente para respuestas interactivas; `tts.warmup()` elimina la espera de compilación inicial.
- **Locución publicitaria y *voice-over***: la combinación de diez voces, cuatro intensidades emocionales y control de ritmo y tono permite generar variantes de un mismo guion sin regrabar.
- **Generación de datasets de voz sintética**: la API por lotes y la salida JSON facilitan producir corpus de audio etiquetados por emoción y estilo para entrenar otros sistemas de ASR o diarización en malayalam.
- **Accesibilidad y lectura de pantalla**: el modo CPU con int8 permite ejecutar el modelo completo en portátiles sin GPU, útil para lectores de pantalla offline en malayalam.
- **Prototipado rápido en Mac**: el backend MPS experimental permite probar el modelo en Apple Silicon, con caída a CPU si falla, para demos y validación de guiones antes de pasar a producción.
- **Clonación de voz para doblaje**: la funcionalidad de clonación permite adaptar la voz del modelo a un locutor concreto para doblar contenido existente al malayalam.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; el modelo completo descarga unos 3,8 GB de pesos, por lo que en fp32 se requiere espacio equivalente más overhead de activaciones y caché KV. La variante int8 reduce el peso en memoria.
- **GPU recomendadas**: NVIDIA con soporte CUDA para modo rápido (fp16 + `torch.compile`); el modo estándar fp32 también se beneficia de GPU. No se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- **GPU de consumo**: no se confirma compatibilidad con GPUs de consumo; el modo CPU e int8 está pensado para portátiles y servidores sin GPU.
- **CPU**: modo CPU funcional pero lento, "decenas de segundos por frase"; int8 acelera y reduce memoria a costa de una pequeña pérdida de calidad.
- **Apple Silicon**: backend MPS experimental, no probado; se recomienda caer a CPU si falla.
- **Despliegue**: paquete Python propio (`mozhi-tts`), instalable vía script `install.sh`, `pip install git+https://huggingface.co/nuhmanpk/mozhi-tts` o wheel. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS de este tipo).
- **Latencia y throughput**: no disponibles cifras concretas; se menciona una compilación inicial de 1-2 minutos por longitud de texto en modo rápido y "decenas de segundos por frase" en CPU.

## Comparativa con modelos similares

| Modelo | Idioma | Licencia | Contexto | Voces/emociones | Disponibilidad |
|---|---|---|---|---|---|
| Mozhi-TTS | malayalam | MIT | no disponible | 10 voces, 4 intensidades | Hugging Face, paquete Python |
| Alternativas TTS abiertas para lenguas dravídicas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (TTS abierto para malayalam) en la documentación proporcionada.

## Limitaciones y advertencias

- **Idioma único**: solo malayalam (más entrada Manglish); no soporta otros idiomas.
- **Madurez del proyecto**: cero descargas y cero *likes* en el momento de la consulta; el modelo Lite aún no está publicado y `load("lite")` falla con un mensaje explicativo hasta que supere sus controles de calidad.
- **Acceso controlado**: el modelo base requiere aceptar términos en Hugging Face y autenticarse con `huggingface-cli login` o `HF_TOKEN`, pese a la licencia MIT del wrapper.
- **Dependencias fijadas**: requiere `transformers==4.46.1` y `numpy<2`, lo que puede entrar en conflicto con otros proyectos; se recomienda entorno virtual aislado.
- **Modo rápido limitado a CUDA**: `torch.compile` y el camino rápido están pensados para NVIDIA; MPS es experimental y no probado.
- **Riesgo de alucinación acústica**: no se documentan evaluaciones de fidelidad de pronunciación ni de naturalidad; no hay benchmarks publicados.
- **Sesgos**: no se documentan sesgos de voz, género o prosodia; las diez voces disponibles no están descritas en la información proporcionada.
- **Licencia comercial**: MIT permite uso comercial, pero la aceptación de términos del modelo base puede imponer condiciones adicionales no detalladas.
- **Producción**: sin métricas de latencia ni throughput publicadas, la planificación de capacidad debe hacerse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nuhmanpk/mozhi-tts
- Modelo base: https://huggingface.co/nuhmanpk/mozhi-tts-v1
- Variante Lite (pendiente de publicación): `nuhmanpk/mozhi-tts-lite`
- Dataset de referencia: https://huggingface.co/datasets/nuhmanpk/mozhi-malayalam-speech
- Script de instalación: https://huggingface.co/nuhmanpk/mozhi-tts/resolve/main/install.sh
- Wheel 0.1.0: https://huggingface.co/nuhmanpk/mozhi-tts/resolve/main/dist/mozhi_tts-0.1.0-py3-none-any.whl
- PyTorch (instalación CUDA): https://pytorch.org/get-started/locally/
