# Enoxis/VoxCPM2-Q4_K-GGUF-jetson

## Resumen

VoxCPM2-Q4_K-GGUF-jetson es una redistribución cuantizada del modelo de síntesis de voz (TTS) openbmb/VoxCPM2, publicada por el usuario Enoxis. Se trata de un sistema de clonación de voz zero-shot multilingüe de aproximadamente 2,4 mil millones de parámetros que, según la model card, cubre alrededor de 30 idiomas, incluido el neerlandés. El paquete convierte los pesos originales en formato safetensors a GGUF para ejecutarse sobre audio.cpp, un motor de inferencia en C++ puro basado en ggml.

La particularidad de esta ficha es su orientación a hardware embebido: el autor reporta métricas medidas sobre una Jetson Xavier NX (arquitectura Volta sm_72) con JetPack 5 y CUDA 11.4, junto con una serie de parches publicados en un repositorio de GitHub. La cuantización del stack de lenguaje es Q4_K, mientras que el decodificador AudioVAE se mantiene en f16 por ser sensible a la calidad. El tokenizador y la configuración van embebidos en el propio archivo, de modo que no requiere archivos sidecar externos.

El modelo es relevante porque demuestra que un TTS de clonación de voz zero-shot puede servirse en tiempo casi real (factor de tiempo real próximo a 1,09) en una GPU de borde con unos pocos gigabytes de memoria, con latencia hasta el primer fragmento de audio de 0,62 segundos. Todo ello bajo licencia Apache-2.0, lo que facilita su integración en productos comerciales con la debida atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS con stack LLM basado en MiniCPM (base + residual) y decodificador AudioVAE con generación por difusión |
| Parametros totales | ~2,4 mil millones (segun model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de sintesis de voz; no aplica una ventana de contexto textual estandar) |
| Tipos de cuantizacion | Q4_K para el stack LM; f16 para el decodificador AudioVAE |
| Idiomas soportados | ~30 idiomas segun la model card, incluido el neerlandes; el campo de idiomas del repositorio figura como no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (libreria ggml) |

## Arquitectura y entrenamiento

La arquitectura combina un stack de modelo de lenguaje basado en MiniCPM (una parte base mas una parte residual) con un decodificador de audio de tipo AudioVAE. La sintesis se realiza mediante un proceso de difusion controlado por el parametro num_inference_steps, con un valor recomendado de 4 pasos y un guidance_scale de 2,0. Segun el autor, no se debe bajar de ese guidance_scale porque rompe la deteccion de fin de secuencia (EOS). El motor de ejecucion es audio.cpp, una implementacion en C++ puro sobre ggml que soporta CPU, CUDA y Vulkan.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La model card indica unicamente que la conversion se realizo con la herramienta audiocpp_gguf a partir de los safetensors originales, y que todos los tensores int32/int64 (por ejemplo decoder.sr_bin_boundaries) se convirtieron a f32 para que la ruta de ggml cargase correctamente. La clonacion de voz es zero-shot, es decir, no requiere reentrenamiento: basta con una muestra de referencia limpia de 8 a 10 segundos en mono a 22 050 Hz.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto de entrada.
- Clonacion de voz zero-shot: reproduce la identidad vocal de una referencia sin ajuste fino.
- Soporte multilingue de aproximadamente 30 idiomas, incluido el neerlandes.
- Generacion con salida en streaming, con un tiempo hasta el primer fragmento de audio de 0,62 segundos medido en Jetson Xavier NX.
- Salida de audio en formato PCM a 48 kHz, s16le, mono, mediante endpoint compatible con la ruta /v1/audio/speech.
- Control fino de la inferencia mediante parametros como num_inference_steps, guidance_scale y retry_badcase.
- Integracion con pipelines de asistente conversacional a traves del puente LLM (scripts/llm_bridge.py) incluido en el repositorio de parches, que conecta con proveedores OpenAI, Anthropic, Moonshot, Mistral, LM Studio o cualquier endpoint compatible con OpenAI.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible (el modelo es exclusivamente de sintesis de voz).

## Casos de uso

- Asistentes de voz en el borde: el modelo permite desplegar un servicio TTS con clonacion de voz en una Jetson Xavier NX, manteniendo el audio en local y evitando enviar datos a la nube. El RTF de 1,09 en esa plataforma lo hace viable para respuestas conversacionales cortas.
- Atencion al cliente automatizada con voz corporativa: se puede clonar la voz de un locutor de marca (con una referencia de 8-10 segundos) y generar respuestas habladas consistentes en unos 30 idiomas, integrando el endpoint /v1/audio/speech en el backend del contact center.
- Lectura de contenido largo en streaming: gracias a la salida por fragmentos y a la latencia de primer audio de 0,62 segundos, es adecuado para leer articulos, noticias o documentacion tecnica sin esperar a generar el audio completo.
- Accesibilidad para personas con discapacidad visual: sintesis de voz personalizada que reproduce la voz del propio usuario o de un familiar, permitiendo leer correos, mensajes o paginas web con una identidad vocal cercana.
- Doblaje y localizacion de contenidos: al soportar clonacion zero-shot y multiples idiomas, se puede doblar un video manteniendo el timbre del hablante original, aunque requiere aportar la referencia vocal correspondiente.
- Prototipado de interfaces conversacionales en robótica y domotica: el bajo consumo de memoria por peticion (19-38 MB de cache KV) y la operacion en GPU de borde permiten integrarlo en robots o dispositivos embebidos que hablan con el usuario.
- Sistemas de audio-lectura para entornos con recursos limitados: la cuantizacion Q4_K y el tamano del repositorio (1,7 GB) facilitan su empaquetado en imagenes Docker o dispositivos con almacenamiento reducido.

## Benchs y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor si reporta metricas de latencia y calidad medidas sobre Jetson Xavier NX (JetPack 5, CUDA 11.4, Volta sm_72) con el stack de voz completo residente:

| Metrica | Valor medido |
|---|---|
| Respuesta corta en caliente (~2,7 s de audio) | 3,3 s en total |
| Tiempo hasta el primer audio en streaming | 0,62 s |
| Parrafo de 15,2 s | 16,6 s (RTF ≈ 1,09) |
| Arranque en frio (carga + primera peticion) | ~17 s |
| Asignacion de cache KV por peticion | 19-38 MB |
| Similitud coseno de identidad vocal (4 pasos de difusion) | 0,888 |
| Similitud coseno de identidad vocal (10 pasos de difusion) | 0,900 |

En GPU de sobremesa de gama RTX, el autor estima un RTF bien por debajo de 0,5 con el mismo GGUF y el mismo motor.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,7 GB y el autor reporta asignaciones de cache KV por peticion de 19-38 MB; el requisito de VRAM para el modelo en si es coherente con esas cifras, aunque no se especifica un minimo exacto.
- GPU recomendadas: Jetson Xavier NX (Volta sm_72) como plataforma objetivo validada; cualquier GPU CUDA y tambien rutas CPU y Vulkan a traves de audio.cpp. En GPU de tipo RTX se espera un RTF inferior a 0,5.
- Cabe en GPU de consumo: si, el tamano del repositorio (1,7 GB) y la cuantizacion Q4_K indican que es viable en GPUs de consumo con suficiente memoria, aunque la model card solo aporta mediciones directas sobre Xavier NX.
- Opciones de despliegue: audio.cpp (motor C++/ggml, comando audiocpp_server con configuracion voxcpm2_server.json) es la via documentada. El ecosistema VoxCPM tambien menciona NanoVLLM-VoxCPM, vLLM-Omni, VoxCPM.cpp y VoxCPMANE para otros entornos.
- Latencia y throughput: warm short reply 3,3 s para ~2,7 s de audio; time-to-first-audio 0,62 s; RTF 1,09 en Xavier NX; arranque en frio ~17 s. En GPU RTX se espera RTF por debajo de 0,5.
- Notas de configuracion: se recomienda num_inference_steps=4, guidance_scale=2,0 (no bajarlo, rompe EOS), retry_badcase=false (obligatorio para streaming) y voxcpm2.mem_saver=false (aproximadamente 2x mas rapido en caliente). La clonacion requiere una referencia WAV mono de 22 050 Hz, limpia y de 8-10 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Enoxis/VoxCPM2-Q4_K-GGUF-jetson | ~2,4B (segun model card) | GGUF Q4_K + f16 | Apache-2.0 | TTS con clonacion zero-shot optimizado para Jetson Xavier NX |
| openbmb/VoxCPM2 | ~2,4B (modelo base) | safetensors | Apache-2.0 | TTS con clonacion zero-shot multilingue, sin cuantizar |
| ExNihilus/VoxCPM2-GGUF | no disponible | GGUF | Apache-2.0 | Mirror GGUF de VoxCPM2 |
| DennisHuang648/VoxCPM2-GGUF | 0,9B (segun listado) | GGUF | no disponible | Cuantizacion GGUF alternativa de VoxCPM2 |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo en la informacion disponible; al ser un sistema de clonacion de voz, existe riesgo intrinseco de uso indebido (suplantacion de identidad, fraude vocal), por lo que se recomienda consentimiento explicito de la persona cuya voz se clona.
- Riesgo de alucinacion: no aplica en el sentido textual, pero la calidad de la sintesis y de la clonacion depende fuertemente de la referencia de voz; una referencia ruidosa o con habla solapada degrada el resultado.
- Limitaciones de contexto e idioma: no se detalla un limite maximo de longitud de texto de entrada; el soporte idiomatico se anuncia en unos 30 idiomas, pero solo se cita el neerlandes de forma explicita, sin listado completo.
- Restricciones de licencia: Apache-2.0 permite uso comercial con atribucion a OpenBMB (modelo original), ShugoAI LLC (audio.cpp) y al autor de la redistribucion. La clonacion de voz puede estar sujeta a normativa adicional segun jurisdiccion.
- Caveats de produccion: guidance_scale no debe bajarse de 2,0 (rompe EOS) y retry_badcase=false es obligatorio para streaming. El autor advierte que en Jetson es necesario aplicar los parches del repositorio para obtener el rendimiento reportado. No se incluye audio de referencia en el repositorio, por lo que hay que aportar una muestra propia.
- Para entornos distintos de Jetson Xavier NX, las metricas de latencia deben revalidarse; solo se aportan estimaciones para GPUs RTX.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Enoxis/VoxCPM2-Q4_K-GGUF-jetson
- Modelo base OpenBMB VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- Motor audio.cpp: https://github.com/0xShug0/audio.cpp
- Repositorio de parches para Jetson Xavier NX: https://github.com/sander110419/voxcpm2-jetson-xavier-nx
- Guia completa de compilacion y ejecucion: https://github.com/sander110419/voxcpm2-jetson-xavier-nx/blob/master/docs/GUIDE.md
- Mirror GGUF ExNihilus/VoxCPM2-GGUF: https://huggingface.co/ExNihilus/VoxCPM2-GGUF
- Listado de modelos cuantizados de VoxCPM2: https://huggingface.co/models?other=base_model:quantized:openbmb/VoxCPM2
- Documentacion de VoxCPM 2.0: https://voxcpm.readthedocs.io/en/latest/
