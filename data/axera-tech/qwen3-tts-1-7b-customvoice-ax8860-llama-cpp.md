# AXERA-TECH/Qwen3-TTS-1.7B-CustomVoice-AX8860-llama.cpp

## Resumen

Qwen3-TTS-1.7B-CustomVoice-AX8860-llama.cpp es una distribucion optimizada del modelo de sintesis de voz Qwen3-TTS-1.7B-CustomVoice de Alibaba Qwen, empaquetada por AXERA-TECH para ejecutarse sobre la NPU de cuatro nucleos del SoC Axera AX8860 mediante una bifurcacion de llama.cpp con backend ggml-axera. No se trata de un modelo nuevo, sino de una conversion a GGUF (BF16) acompanada de kernels NPU precompilados y un binario estatico `llama-tts`, pensada para inferencia en el borde (edge) sin GPU dedicada.

El modelo resuelve el problema de la sintesis de voz con voces predefinidas: nueve hablantes integrados, instrucciones de estilo opcionales y soporte de diez idiomas declarados en la interfaz de ejecucion. Con 1.733.157.888 parametros y un contexto de 4096 tokens, esta pensado para generar locuciones de hasta unos 160 segundos por invocacion.

Su relevancia actual es practica: demuestra que un TTS de 1,7B puede correr en tiempo casi real (RTF 0,41-0,49) sobre hardware NPU de bajo consumo, lo que habilita despliegues embebidos, domoticos o industriales donde no hay espacio para una GPU. El repositorio, sin embargo, tiene cero descargas y cero likes en el momento de la consulta y no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en transformer (talker + code predictor + decodificador de codec/vocoder); inferencia via llama.cpp con backend ggml-axera |
| Parametros totales | 1.733.157.888 (1,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Pesos publicados en GGUF BF16; en carga se convierten a MXFP8 (talker y code predictor) y BF16 (vocoder) para los kernels NPU |
| Idiomas soportados | auto, zh, en, de, it, pt, es, ja, ko, fr, ru |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16): `qwen3-tts-1.7b-customvoice-bf16.gguf` (3312 MB) y `mmproj-qwen3-tts-1.7b-customvoice-bf16.gguf` (646 MB) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-TTS original, descompuesta en tres etapas: un "talker" (modelo principal que genera los tokens de codigo acustico), un "code predictor" que refina la prediccion de codigos y un decodificador de codec (vocoder) que convierte codigos en forma de onda. En esta distribucion, los kernels NPU cubren cuatro operaciones: prefill del talker, decode del talker (incluida la cabeza de salida del codec), code predictor (una trama por paso, con top-k en tiempo de ejecucion) y vocoder (72 tramas por paso). Los kernels no contienen pesos; estos se cargan desde los GGUF y se convierten al vuelo a MXFP8 (talker y code predictor) y BF16 (vocoder).

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni si hubo RLHF o DPO; esa informacion pertenece a la model card del modelo base y no se incluye en el repositorio. La innovacion tecnica destacable es el propio empaquetado: kernels NPU especificos para el AX8860, binario estatico y un flujo de ejecucion con muestreo oficial (temperature 0,9, top-k 50) que evita la decodificacion codiciosa por su tendencia a producir locuciones largas con pausas excesivas.

## Capacidades

- Sintesis de voz (texto a audio) con nueve voces integradas: `aiden`, `dylan`, `eric`, `ono_anna`, `ryan`, `serena`, `sohee`, `uncle_fu`, `vivian`.
- Control de estilo mediante instruccion textual opcional (quinto argumento del script), por ejemplo "hablar con tono alegre y ligero".
- Variantes dialectales en chino: `dylan` y `eric` producen mandarin con acento de Pekin y de Sichuan.
- Multilingue: generacion en chino, ingles, aleman, italiano, portugues, espanol, japones, coreano, frances y ruso, con deteccion automatica de idioma (`auto`).
- Generacion de locuciones de hasta 2000 tramas (aproximadamente 160 segundos) por invocacion.
- Salida en fichero WAV.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo exclusivamente TTS.
- No se documentan capacidades de vision ni de audio de entrada (no es un modelo speech-to-speech ni ASR).

## Casos de uso

- Locucion embebida en dispositivos sin GPU: el modelo corre integramente en la NPU de cuatro nucleos del AX8860 con un RTF de 0,41-0,49, lo que permite generar audio en tiempo casi real en equipos de bajo consumo como terminales de informacion, electrodomesticos o maquinaria industrial.
- Anuncios y avisos en transporte publico o aeropuertos: con diez idiomas y deteccion automatica, un mismo sistema puede emitir mensajes en espanol, ingles o japones cambiando solo el argumento de idioma.
- Asistentes de voz para atencion al cliente en kioscos: las nueve voces y las instrucciones de estilo permiten adaptar el tono (formal, cercano, enérgico) sin reentrenar nada, y el limite de 160 segundos cubre respuestas habladas tipicas.
- Accesibilidad: lectura en voz alta de textos para personas con discapacidad visual en dispositivos de bajo coste, con voces diferenciadas por idioma y dialecto.
- Generacion de audiolibros o contenido narrado por lotes: el binario estatico y la ejecucion por linea de comandos facilitan integrarlo en un pipeline que recorra capitulos y genere WAVs con una voz fija.
- Prototipado de interfaces conversacionales: al estar empaquetado como GGUF con llama.cpp, sirve para validar flujos de voz en un dispositivo antes de escalar a infraestructura mayor.
- Demos de sintesis multilingue en ferias o entornos controlados: el script `run.sh` permite cambiar texto, voz, idioma y estilo con un solo comando.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MOS, WER, MMLU u otros) en la informacion disponible. Los unicos datos de rendimiento son de velocidad de inferencia en el AX8860 con SDK V0.5.1 y NPU de cuatro nucleos, para un parrafo en chino con la voz `vivian` que genera 34,1 s de audio:

| Metrica | Resultado |
|---|---|
| Tiempo de sintesis | 16,59 s (RTF 0,49) |
| Sin la primera conversion de pesos del vocoder | RTF 0,41; 33 ms por trama de 80 ms de audio |
| Code predictor (NPU, por trama) | 7,7 ms |
| Talker decode (NPU, por trama) | 8,1 ms |
| Carga y conversion de pesos (una vez por proceso) | ~25 s |
| Primera conversion de pesos del vocoder | ~2,5 s adicionales en la primera sintesis |

En cuanto a correccion, el autor indica que las locuciones de las frases de prueba en chino e ingles (varias voces, con y sin instruccion de estilo) transcritas con Qwen3-ASR coinciden literalmente con el texto original.

## Requisitos de hardware

- Hardware objetivo: SoC Axera AX8860 con NPU de cuatro nucleos y SDK V0.5.0 o superior (verificable con `cat /proc/ax_proc/version`).
- VRAM: no aplica; la inferencia usa la NPU y memoria del sistema del SoC. El repositorio ocupa 4,2 GB y los GGUF suman 3312 MB + 646 MB.
- GPU dedicadas: no se contemplan; el paquete esta atado a la NPU del AX8860 y no se documenta ejecucion en A100, H100 ni RTX 4090.
- GPU de consumo: no aplica; no cabe esperar ejecucion en tarjetas consumer con este paquete.
- Despliegue: binario estatico `llama-tts` incluido en `bin/`, con `LD_LIBRARY_PATH=/opt/lib` y `GGML_AXERA_KERNEL_DIR=<repo>/kernels`; parametros `-ngl 99 -c 4096` y top-k maximo 50. No se documenta soporte de vLLM, TGI, Ollama ni llama.cpp estandar.
- Latencia y throughput: 33 ms por trama de 80 ms de audio (RTF 0,41 sin la conversion inicial), con 7,7 ms y 8,1 ms por trama en code predictor y talker decode respectivamente.
- La NPU queda ocupada en exclusiva por el proceso; no debe ejecutarse otro programa NPU en paralelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| Qwen3-TTS-1.7B-CustomVoice-AX8860 (este) | 1,7B | 4096 | no disponible | NPU AX8860 via llama.cpp/ggml-axera | 9 voces, 10 idiomas, RTF 0,41-0,49 en AX8860 |
| Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice (base) | 1,7B | no disponible | no disponible | no disponible | Modelo original del que deriva; mismas capacidades de voces e idiomas segun el autor |
| Qwen3-TTS-1.7B Base (mencionado en la model card) | 1,7B | no disponible | no disponible | NPU AX8860 (kernels identicos) | Variante base, sin las voces predefinidas de CustomVoice |
| Otros TTS open source de tamano comparable | no disponible | no disponible | no disponible | no disponible | No se aportan datos en la informacion disponible |

La comparativa se limita a las variantes de la propia familia Qwen3-TTS citadas por el autor; no hay datos de benchmarks ni de licencia que permitan una comparacion cuantitativa con alternativas de otros proveedores.

## Limitaciones y advertencias

- La NPU de cuatro nucleos queda ocupada en exclusiva durante la inferencia; no se puede ejecutar otro programa NPU a la vez.
- Contexto limitado a 4096 tokens y top-k maximo de 50, lo que restringe la longitud del texto de entrada por invocacion.
- La decodificacion codiciosa (`--temp 0`) produce locuciones demasiado largas y con pausas excesivas; hay que mantener el muestreo por defecto (temperature 0,9, top-k 50).
- Tope de 2000 tramas por generacion, aproximadamente 160 segundos de audio.
- Coste fijo por proceso: unos 25 s de carga y conversion de pesos, mas 2,5 s adicionales en la primera sintesis; poco adecuado para invocaciones cortas y aisladas.
- Licencia no declarada en el repositorio: no se puede confirmar el uso comercial. Es imprescindible verificar la licencia del modelo base Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice antes de cualquier despliegue en produccion.
- Sin datos publicos de sesgos, tasa de alucinacion o fidelidad de pronunciacion mas alla de la prueba cualitativa con Qwen3-ASR reportada por el autor.
- Dependencia de hardware y SDK muy especificos (AX8860, SDK V0.5.0+); no es portable a otras plataformas sin recompilar kernels.
- Repositorio sin descargas ni valoraciones en el momento de la consulta, lo que reduce la evidencia de uso en produccion.
- El modelo es exclusivamente TTS: no hace ASR, traduccion, razonamiento ni tool calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-TTS-1.7B-CustomVoice-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Fork de llama.cpp con backend Axera (`axera-dev` @ `cff4752`): https://github.com/ZHEQIUSHUI/llama.cpp
- Kernels Axera DSL (`main` @ `60dd25b`): https://github.com/ZHEQIUSHUI/ax-dsl-kernels
