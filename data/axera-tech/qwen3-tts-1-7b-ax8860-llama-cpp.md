# AXERA-TECH/Qwen3-TTS-1.7B-AX8860-llama.cpp

## Resumen

Qwen3-TTS-1.7B-AX8860-llama.cpp es una distribucion optimizada del modelo de sintesis de voz Qwen3-TTS, en su variante de 12 Hz y 1.700 millones de parametros (Qwen/Qwen3-TTS-12Hz-1.7B-Base), publicada por AXERA-TECH para ejecutarse sobre la NPU de cuatro nucleos del SoC Axera AX8860 mediante llama.cpp y el backend ggml-axera. No es un modelo nuevo: es un empaquetado de pesos en formato GGUF BF16 junto con kernels de NPU precompilados y un binario estatico (`llama-tts`) que permiten hacer sintesis de voz con clonacion en hardware de borde, sin GPU.

El problema que resuelve es la ejecucion de un sistema TTS con clonacion de voz de calidad en un dispositivo empotrado de bajo consumo. El repositorio separa los pesos del "talker" (3,2 GB, BF16) y los del code predictor, decodificador de codec, encoder de hablante y tokenizador de voz (849 MB), y convierte en tiempo de carga el talker y el code predictor a MXFP8 y el vocoder a BF16 para alimentar los kernels de NPU. La ventana de contexto esta limitada a 4096 tokens y la generacion maxima a 2000 frames (unos 160 s de audio).

Es relevante ahora porque demuestra un pipeline TTS completo (texto a tokens de voz a waveform) funcionando integramente en NPU con un RTF de 0,40 en regimen estable, lo que habilita casos de uso de voz en dispositivos sin conexion. La licencia no esta declarada en la informacion disponible, un punto critico antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS autoregresivo por tokens de voz (talker + code predictor + decodificador de codec), backend ggml-axera sobre llama.cpp |
| Parametros totales | 1.733.157.888 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Pesos publicados en GGUF BF16; conversion en carga a MXFP8 (talker y code predictor) y BF16 (vocoder) para los kernels de NPU |
| Idiomas soportados | zh, en, de, it, pt, es, ja, ko, fr, ru (seleccionables por argumento; por defecto zh) |
| Licencia | no disponible |
| Formato de pesos | GGUF BF16 (`qwen3-tts-1.7b-bf16.gguf`, `mmproj-qwen3-tts-1.7b-bf16.gguf`) + kernels de NPU y binario `llama-tts` |

## Arquitectura y entrenamiento

El modelo base es Qwen3-TTS-12Hz-1.7B-Base, un sistema de sintesis de voz que opera a 12 Hz de tasa de frames de tokens de audio. La distribucion de AXERA divide la inferencia en cuatro kernels de NPU: prefill del talker, decode del talker (con la cabeza de salida del codec), code predictor (un frame por llamada, con top-k en tiempo de ejecucion) y decodificador de codec o vocoder (72 frames por llamada). Los kernels no contienen pesos: se cargan desde los GGUF y se convierten en el arranque, lo que mantiene una unica fuente de verdad para los pesos.

La clonacion de voz admite dos modos. El primero usa solo la grabacion de referencia, codificada en un vector de hablante (x-vector). El segundo, correspondiente al modo ICL oficial, codifica la grabacion como tokens de voz que se insertan en el prompt junto con su transcripcion (`--tts-ref-text`), lo que produce un timbre y una prosodia mas cercanos al original; la transcripcion debe coincidir con el audio. Los parametros de muestreo por defecto son temperatura 0,9 y top-k 50. No se dispone de informacion sobre el volumen ni la composicion del dataset de entrenamiento, ni sobre si hubo RLHF o DPO.

## Capacidades

- Sintesis de voz (texto a audio) con salida WAV a partir de texto en diez idiomas: chino, ingles, aleman, italiano, portugues, espanol, japones, coreano, frances y ruso.
- Clonacion de voz en dos modalidades: por vector de hablante (solo audio de referencia) y por modo ICL (audio mas transcripcion, con mayor fidelidad de timbre y estilo).
- Generacion de audio de hasta 2000 frames, aproximadamente 160 segundos por invocacion.
- Control de idioma explicito mediante argumento en la linea de comandos.
- Ejecucion integra en NPU de cuatro nucleos, sin GPU ni aceleradores externos.
- Verificacion de inteligibilidad documentada: las frases de prueba en chino e ingles, en decodificacion greedy y por muestreo y en ambos modos de clonacion, transcritas con Qwen3-ASR, coinciden literalmente con el texto de entrada.
- No se documenta soporte de tool calling, agentes, vision ni audio de entrada mas alla de la referencia de clonacion.

## Casos de uso

- Sintesis de voz en dispositivos empotrados sin conexion: el binario estatico y los kernels permiten generar voz en un SoC AX8860 sin acceso a red, adecuado para electrodomesticos, paneles industriales o terminales de punto de venta con avisos hablados.
- Clonacion de voz personal en hardware local: con una grabacion de pocos segundos y, opcionalmente, su transcripcion, se obtiene una voz consistente para asistentes personales o lectores de pantalla que preserven el timbre del usuario.
- Locucion multilingue de contenidos: el soporte de diez idiomas permite generar versiones habladas de un mismo guion en espanol, ingles, aleman, frances, etc., desde un unico dispositivo, util para carteleria o audioguias turisticas.
- Accesibilidad y lectura de textos largos: con hasta 160 s de audio por invocacion y contexto de 4096 tokens, se pueden leer articulos o documentos por tramos manteniendo la misma voz de referencia entre segmentos.
- Prototipado de interfaces de voz: el RTF de 0,40 en regimen estable (32 ms por frame de 80 ms) permite iterar rapido sobre guiones y voces antes de trasladar el sistema a produccion.
- Generacion de audio para entornos con restricciones de privacidad: al ejecutarse localmente y no requerir servicios en la nube, las grabaciones de referencia y los textos no salen del dispositivo, lo que encaja en sanidad, legal o administracion publica.
- Evaluacion de hardware de borde: sirve como banco de pruebas para medir el rendimiento de la NPU del AX8860 en cargas autoregresivas con vocoder, con metricas ya publicadas de latencia por frame.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente metricas de rendimiento en el dispositivo:

| Metrica (AX8860, SDK V0.5.1, NPU 4 nucleos) | Resultado |
|---|---|
| Audio generado en la prueba (parrafo en chino) | 27,2 s |
| Tiempo de sintesis total | 14,41 s (RTF 0,53) |
| RTF sin la primera conversion de pesos del vocoder | 0,40 |
| Tiempo por frame (80 ms de audio) | 32 ms |
| NPU, code predictor por frame | 7,8 ms |
| NPU, talker decode por frame | 8,1 ms |
| Carga y conversion de pesos por proceso | ~25 s (modelo 1.7B); ~14 s (0.6B) |
| Codificacion de la referencia en CPU | ~10 s para una referencia de 22 s |
| Primera conversion de pesos del vocoder | ~3 s (incluida en los 14,41 s) |

## Requisitos de hardware

- Plataforma obligatoria: SoC Axera AX8860 con SDK V0.5.0 o superior; los kernels de NPU son especificos de esta arquitectura.
- NPU: los cuatro nucleos en exclusiva; no deben ejecutarse otros programas de NPU en paralelo.
- Memoria: el repositorio ocupa 5,2 GB; los pesos del talker son 3,2 GB en BF16 y los del resto de componentes 849 MB. La conversion a MXFP8 en carga reduce la huella efectiva en NPU, pero no se documenta el consumo exacto de memoria en placa.
- GPU: no se usa GPU; el modelo no esta pensado para A100, H100 ni RTX 4090. No se publican instrucciones para ejecutarlo en GPU consumer.
- Despliegue: binario `llama-tts` incluido en `bin/` (enlazado estaticamente, depende solo de `/opt/lib` y libc), con `LD_LIBRARY_PATH=/opt/lib`, `GGML_AXERA_KERNEL_DIR` apuntando a `kernels/`, `-ngl 99 -c 4096` y top-k no superior a 50. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp upstream estandar.
- Latencia y throughput: RTF 0,40 en regimen estable y 32 ms por frame de 80 ms de audio; el coste fijo por proceso (~25 s de carga en el 1.7B) desaconseja invocaciones de una sola frase sin mantener el proceso vivo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificables de alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. Cualitativamente:

| Modelo | Parametros | Contexto | Despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-TTS-1.7B-AX8860-llama.cpp | 1,73 B | 4096 tokens | NPU Axera AX8860 (llama.cpp + ggml-axera) | no disponible | Clonacion de voz, 10 idiomas, RTF 0,40 en placa |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | 1,73 B | no disponible | GPU/CPU (formato original) | no disponible | Modelo base del que deriva esta distribucion |
| Alternativas TTS de tamano similar | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion disponible |

## Limitaciones y advertencias

- Licencia no declarada: no hay informacion sobre permisos de uso comercial, redistribucion o modificacion; es imprescindible consultar la licencia del modelo base antes de desplegarlo.
- Dependencia total del hardware: los kernels son especificos del AX8860 y no hay ruta documentada para GPU o CPU de proposito general; el modelo no es portable a otras plataformas sin trabajo adicional.
- La NPU queda ocupada en exclusiva durante la inferencia, lo que impide coejecutar otras cargas de NPU en el mismo dispositivo.
- Contexto limitado a 4096 tokens y top-k maximo de 50; la generacion se corta a 2000 frames (~160 s).
- La decodificacion greedy (`--temp 0`) produce habla demasiado larga y con pausas excesivas; se recomienda el muestreo por defecto (temperatura 0,9, top-k 50).
- El modo ICL exige que la transcripcion coincida exactamente con el audio de referencia; una transcripcion incorrecta degrada la clonacion.
- La codificacion de la referencia se hace en CPU y escala con su duracion (~10 s para 22 s de audio), lo que penaliza referencias largas.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones subjetivas de naturalidad (MOS); la unica validacion publicada es la coincidencia literal de la transcripcion con Qwen3-ASR en frases de prueba.
- Riesgo de uso indebido de la clonacion de voz: la capacidad de replicar un timbre a partir de pocos segundos exige controles de consentimiento y trazabilidad en cualquier despliegue real.
- El repositorio no incluye audio de referencia; el usuario debe aportar sus propias grabaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-TTS-1.7B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Fork de llama.cpp utilizado: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `6613735ce`)
- Paper, blog o demo oficial: no disponible en la informacion proporcionada.
