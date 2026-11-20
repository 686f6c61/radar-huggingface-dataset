# melser/Higgs-Audio-2-Tokenizer-onnx

## Resumen

Higgs Audio 2 Tokenizer (exportación ONNX) es una conversión no oficial del tokenizador de audio `bosonai/higgs-audio-v2-tokenizer` de Boson AI al formato ONNX, publicada por el usuario `melser`. Se trata de un códec neuronal de audio que transforma forma de onda a representaciones discretas (8 codebooks de 1024 entradas cada uno) y viceversa, a 24 kHz y 25 frames por segundo. Su función no es generar texto ni razonar: es el componente de compresión y reconstrucción de audio que emplea el sistema Reverb-TTS dentro del ecosistema Higgs Audio 2.

El paquete contiene dos grafos independientes: un decodificador de 87 MB que convierte códigos en audio y un codificador de 654 MB que hace el camino inverso. La exportación está pensada para ejecutarse con ONNX Runtime, lo que permite desplegar el códec fuera de PyTorch y en entornos con requisitos de portabilidad o de integración en pipelines nativos.

La relevancia es acotada pero práctica: quien necesite el códec de Higgs Audio 2 en producción con ONNX Runtime dispone aquí de una alternativa verificada contra el modelo original, con licencia comunitaria heredada de Boson AI que incorpora la licencia de Meta Llama 3. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no está afiliado a Boson AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Códec neuronal de audio (encoder/decoder) exportado a grafos ONNX; arquitectura interna del modelo base no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio; 25 frames/s, 8 codebooks) |
| Tipos de cuantizacion | no disponible (los grafos se distribuyen en fp32 para el decodificador; el codificador no especifica precisión) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | boson-higgs-audio-2-community-license (incorpora Meta Llama 3 Community License y Acceptable Use Policy) |
| Formato de pesos | ONNX (`onnx/codec_decoder.onnx`, `onnx/codec_encoder.onnx`) |
| Frecuencia de muestreo | 24 kHz |
| Codebooks | 8 codebooks de 1024 entradas |
| Tasa de frames | 25 frames/s |
| Tamano del repo | 0,7 GB |

## Arquitectura y entrenamiento

El modelo es un códec de audio neuronal con dos grafos exportados de forma independiente a ONNX. El decodificador acepta un tensor `codes[1,8,T]` en int64 y produce `audio[1,1,T*960]` en fp32 a 24 kHz, es decir, 960 muestras por frame y 8 codebooks por paso temporal. El codificador recibe `wav24[1,1,N]` (con N múltiplo de 960) y `wav16[1,N16]`, donde la segunda entrada es el mismo audio remuestreado a 16 kHz por el llamador, y devuelve `codes[1,8,T]`. Esta doble entrada implica que el pipeline de codificación debe realizar el remuestreo a 16 kHz externamente antes de invocar el grafo.

No se detallan en la información disponible los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO. Tampoco se especifica la arquitectura interna del códec (tipo de encoder, cuantizador residual o VQ, etc.). La innovación destacable es la propia exportación a ONNX: el autor reporta una diferencia máxima de forma de onda de 7e-7 en el decodificador frente al modelo PyTorch de `transformers`, y entre un 99,5 % y un 100 % de códigos idénticos en el codificador usando el mismo remuestreador (97-98 % con `resample_poly` de SciPy). Incluye `SHA256SUMS` con sumas de verificación.

## Capacidades

- Codificación de audio a códigos discretos: convierte forma de onda a 24 kHz en tensores `[1,8,T]` con 8 codebooks de 1024 entradas.
- Decodificación de códigos a audio: reconstruye forma de onda a 24 kHz a partir de los códigos, con 960 muestras por frame.
- Integración con ONNX Runtime: los grafos están optimizados para ejecutarse con ORT, incluido el backend WebGPU/Vulkan (con la salvedad de rendimiento indicada abajo).
- Uso como códec del sistema Reverb-TTS dentro del ecosistema Higgs Audio 2.
- No realiza generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües en sentido lingüístico: opera sobre señal de audio.
- No dispone de modo thinking, ni de entrada/salida de texto, ni de audio-a-texto.

## Casos de uso

- Integración del códec de Higgs Audio 2 en pipelines ONNX Runtime: sustituir la dependencia de PyTorch por ORT en servicios de TTS que ya usen Reverb-TTS, manteniendo la compatibilidad de códigos verificada por el autor.
- Despliegue en entornos con restricciones de framework: aplicaciones donde instalar PyTorch no es viable (contenedores mínimos, entornos embebidos, servicios nativos) pueden cargar los grafos ONNX directamente.
- Compresión de audio para almacenamiento o transmisión: el codificador genera 8 codebooks de 1024 entradas a 25 frames/s, una representación discreta adecuada para almacenar o transmitir audio de forma compacta antes de reconstruirlo con el decodificador.
- Reconstrucción de audio en servidores sin GPU dedicada: el decodificador de 87 MB y el codificador de 654 MB pueden ejecutarse en CPU, lo que permite servir el códec en instancias sin acelerador.
- Verificación de pipelines de audio: las sumas SHA256 y las métricas de fidelidad reportadas (7e-7 de diferencia máxima, 99,5-100 % de códigos idénticos) permiten usar el paquete como referencia para validar otras implementaciones del códec.
- Prototipado de sistemas de voz completos: combinado con un modelo generador de códigos (no incluido en este repositorio), sirve como etapa de salida de audio en arquitecturas TTS basadas en tokens discretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de fidelidad de la exportación frente al modelo PyTorch original:

| Metrica | Resultado |
|---|---|
| Diferencia maxima de forma de onda (decodificador) | 7e-7 |
| Codigos identicos (codificador, mismo remuestreador) | 99,5-100 % |
| Codigos identicos (codificador, `resample_poly` de SciPy) | 97-98 % |
| Decodificador en AMD BC-250 (ORT WebGPU/Vulkan) | devuelve casi silencio; ejecutar en CPU |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Los tamanos de grafo (87 MB decodificador, 654 MB codificador) sugieren requisitos de memoria moderados, pero no se publican cifras de VRAM.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el aviso del autor sobre la AMD BC-250 (APU con gráficos integrados) indica que el backend WebGPU/Vulkan de ORT no funciona correctamente para el decodificador en ese hardware.
- Opciones de despliegue: ONNX Runtime (CPU y WebGPU/Vulkan). El autor recomienda CPU para el decodificador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un códec de audio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia contextual, el modelo base `bosonai/higgs-audio-v2-tokenizer` es la implementación PyTorch original de la que deriva esta exportación; la diferencia principal es el formato (ONNX frente a pesos de `transformers`) y el hecho de que esta versión es no oficial. No se detallan alternativas como EnCodec, SoundStream o DAC en la información disponible.

## Limitaciones y advertencias

- Exportación no oficial: no está afiliada a Boson AI y no cuenta con el respaldo del autor original del modelo.
- Licencia restrictiva: la Boson Higgs Audio 2 Community License incorpora la Meta Llama 3 Community License y su Acceptable Use Policy; los productos con más de 100.000 usuarios activos anuales necesitan una licencia ampliada de Boson AI.
- Restricciones de uso comercial: deben revisarse el archivo `LICENSE` y `NOTICE` del repositorio antes de cualquier despliegue en producción.
- Problema conocido en WebGPU/Vulkan: el decodificador devuelve casi silencio en la AMD BC-250 con ORT WebGPU/Vulkan; el autor recomienda ejecutarlo en CPU.
- Dependencia de remuestreo externo: el codificador exige que el llamador proporcione el audio ya remuestreado a 16 kHz; un remuestreador distinto al usado en la verificación reduce la coincidencia de códigos al 97-98 %.
- Sin datos de sesgos, alucinación o limitaciones lingüísticas: al ser un códec de audio, estas categorías no aplican directamente, pero tampoco se documentan sesgos acústicos ni limitaciones de dominio (música, ruido, voces no estándar).
- Sin métricas de rendimiento publicadas: no hay datos de latencia ni throughput que permitan dimensionar un despliegue.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria de la exportación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/melser/Higgs-Audio-2-Tokenizer-onnx
- Modelo base: https://huggingface.co/bosonai/higgs-audio-v2-tokenizer
- Licencia (archivo en el repo): `LICENSE`
- Aviso legal (archivo en el repo): `NOTICE`
- Sumas de verificación (archivo en el repo): `SHA256SUMS`
