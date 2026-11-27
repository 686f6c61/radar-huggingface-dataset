# cgb/omnivoice-onnx-webgpu

## Resumen

OmniVoice para WebGPU es una conversión ONNX del modelo de síntesis de voz OmniVoice desarrollado por k2-fsa (Xiaomi), empaquetada por el usuario cgb para ejecutarse íntegramente dentro de un navegador web mediante ONNX Runtime Web y WebGPU. El modelo base resuelve tres tareas de TTS en un único sistema: síntesis multilingüe en más de 600 idiomas, clonación de voz a partir de unos pocos segundos de audio de referencia y diseño de voz a partir de atributos descriptivos (género, edad, tono, susurro, acento). La conversión está pensada para que FreeGen la descargue en su estudio Speak, de modo que el texto, el audio de referencia y la voz generada nunca abandonan la máquina del visitante.

Arquitectónicamente, OmniVoice es un Qwen3-0.6B ejecutado de forma bidireccional como modelo de lenguaje enmascarado sobre ocho códecs del tokenizador Higgs Audio 2. La generación parte de un clip completamente enmascarado y lo rellena en 32 pasadas, cada una guiada por una segunda pasada sin condicionamiento. El repositorio incluye el grafo de una pasada en int4 (453 MB), el decodificador de audio en fp16 (43 MB) y los codificadores acústico, semántico y cuantizador en fp32 (654 MB) necesarios para la clonación, con un total de 1,2 GB.

La relevancia de esta ficha reside en que demuestra un patrón de despliegue de TTS de alta calidad sin servidor: inferencia local en el navegador con privacidad por diseño, cuantización agresiva a int4 con pérdida mínima (coseno 0,9997 frente al export fp32) y compatibilidad con el procesador cuando WebGPU no está disponible. Es un caso práctico de cómo llevar un modelo de 0,6B parámetros a un entorno cliente con restricciones de memoria y latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-0.6B bidireccional como modelo de lenguaje enmascarado sobre 8 codebooks del códec Higgs Audio 2; export ONNX para ONNX Runtime Web |
| Parametros totales | 0,6B (modelo base Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la longitud de secuencia de audio la determina la estimación de duración en el host) |
| Tipos de cuantizacion | int4 (MatMulNBits, bloque 32) en matrices del paso de generación; int8 en filas de embedding; fp16 en el decodificador de audio; fp32 en los codificadores de clonación |
| Idiomas soportados | más de 600 idiomas (646 ids en `languages.json`) |
| Licencia | Apache-2.0 para OmniVoice; el códec Higgs Audio 2 está bajo Boson Higgs Audio 2 Community License (basada en Meta Llama 3 Community License) |
| Formato de pesos | ONNX (`step_int4.onnx` + `.data`, `higgs_decoder.onnx`, `acoustic_encoder.onnx`, `semantic_encoder.onnx`, `quantizer_encoder.onnx`), más `tokenizer.json`, `languages.json` y `omnivoice-pack.json` |

## Arquitectura y entrenamiento

OmniVoice no es un transformer autorregresivo convencional para TTS. Toma el backbone Qwen3-0.6B y lo ejecuta de forma bidireccional como modelo de lenguaje enmascarado: la secuencia de códecs de audio se inicializa completamente enmascarada y se rellena a lo largo de 32 pasadas, cada una condicionada por una segunda pasada sin condicionamiento (unconditioned pass) que actúa como guía. La salida del paso de generación es un tensor `logits` de forma [B, 8, S, 1025], correspondiente a ocho codebooks del códec Higgs Audio 2 con un vocabulario efectivo de 1025 símbolos por codebook. La máscara de atención se pasa explícitamente como [B, 1, S, S] para forzar el comportamiento bidireccional, algo que el export fp32 original no hacía de forma explícita.

El audio se decodifica desde los códecs a 24 kHz mediante el decodificador Higgs Audio 2 en fp16 (43 MB), con 64 dB de relación señal-ruido respecto a la implementación en PyTorch. Para la clonación se emplean tres codificadores en fp32 (654 MB en total) que convierten un clip de referencia en los mismos códecs que produce PyTorch. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La lógica de prompt, estimación de duración, schedule, guidance y muestreo reside en código host (`src/freegen/omnivoice.js`), portado de `omnivoice/models/omnivoice.py`; el script de exportación es `scripts/omnivoice-export.py`.

## Capacidades

- Síntesis de voz multilingüe en más de 600 idiomas, con 646 ids de idioma documentados en `languages.json`.
- Clonación de voz zero-shot a partir de unos pocos segundos de audio de referencia, mediante los codificadores acústico, semántico y cuantizador.
- Diseño de voz a partir de atributos descriptivos: género, edad, tono, susurro y acento.
- Generación de audio a 24 kHz mediante el decodificador Higgs Audio 2.
- Inferencia local en el navegador con ONNX Runtime Web y WebGPU, sin subir texto, referencia ni audio a ningún servidor.
- Fallback al procesador (CPU) cuando WebGPU no está disponible, gracias a que los embeddings int8 se consultan con `Gather` simple.
- Ejecución de una pasada por paso de difusión (32 pasadas por clip), con máscara de atención explícita para el modo bidireccional.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión; el modelo es específicamente de texto a voz.

## Casos de uso

- Clonación de voz en el navegador para accesibilidad: un usuario con dificultades del habla puede grabar unos segundos de referencia y generar locuciones con su propia voz sin que el audio salga de su equipo, lo que elimina riesgos de privacidad y cumple con requisitos de RGPD por diseño.
- Diseño de voces para prototipado de producto: equipos de UX pueden generar voces con atributos concretos (por ejemplo, "femenina, adulta, tono grave, acento neutro") para maquetas de asistentes o videojuegos antes de contratar una locución profesional.
- Doctaje y localización de vídeo: al soportar más de 600 idiomas, el modelo permite generar pistas de voz en distintos idiomas para un mismo guion, útil en canales de contenido que publican en múltiples mercados.
- Audiolibros y contenido largo: la estimación de duración en el host permite ajustar la longitud del clip generado, y la ejecución local evita cuotas de API en producciones con muchos capítulos.
- Educación y aprendizaje de idiomas: generación de pronunciaciones en idiomas poco representados (más de 600 soportados) con la voz del propio estudiante clonada, sin enviar muestras a terceros.
- Demos y aplicaciones web sin backend: FreeGen ya lo usa en su estudio Speak; cualquier desarrollador puede integrar el paquete ONNX en una página estática y ofrecer TTS con clonación sin desplegar infraestructura de GPU.
- Investigación en privacidad diferencial aplicada a voz: al ejecutarse en cliente, sirve como banco de pruebas para medir qué información se filtra en los códecs y cómo afecta la cuantización int4 a la fidelidad de la clonación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de fidelidad de la conversión: coseno 0,9997 entre el export int4 y el fp32 en el paso de generación, y 64 dB de relación señal-ruido entre el decodificador ONNX y PyTorch.

## Requisitos de hardware

- VRAM estimada para inferencia: el paso de generación int4 ocupa 453 MB; el decodificador fp16, 43 MB; los codificadores de clonación fp32, 654 MB. En total, alrededor de 1,2 GB de pesos, más activaciones y buffers de atención [B, 1, S, S], que crecen cuadráticamente con la longitud de secuencia de audio.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable (Chrome/Edge en Windows, macOS con Metal, Android con Vulkan). Para clonación con clips largos conviene una GPU de escritorio; en portátiles integrados el rendimiento puede degradarse.
- Cabe en GPU de consumo: sí, siempre que el navegador exponga WebGPU y haya memoria de GPU suficiente para los 1,2 GB de pesos más las activaciones. En equipos sin WebGPU, el fallback a CPU es funcional pero lento.
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU o WASM (procesador); el paquete está pensado para servirse como estáticos desde un CDN o servidor web. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de texto autorregresivo estándar.
- Latencia y throughput: no disponibles. La generación requiere 32 pasadas por clip, lo que condiciona la latencia final; no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| OmniVoice (este, ONNX WebGPU) | 0,6B | no disponible | más de 600 | Apache-2.0 (códec con licencia Boson) | Navegador (ONNX Runtime Web) |
| OmniVoice original (k2-fsa) | 0,6B | no disponible | más de 600 | Apache-2.0 (códec con licencia Boson) | PyTorch, servidor |
| onnx-community/OmniVoice-Onnx | 0,6B | no disponible | más de 600 | Apache-2.0 (códec con licencia Boson) | ONNX Runtime (servidor o cliente) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de OmniVoice frente a otros sistemas TTS de la misma categoría (por ejemplo, XTTS, Bark o Fish Speech); por tanto, la comparación se limita a parámetros, licencia y modo de despliegue.

## Limitaciones y advertencias

- La clonación de voz solo debe usarse con la propia voz o con permiso explícito del hablante; la model card lo indica de forma expresa y no incorpora mecanismos técnicos de verificación de consentimiento.
- El códec Higgs Audio 2 está bajo la Boson Higgs Audio 2 Community License, basada en la Meta Llama 3 Community License; aunque OmniVoice sea Apache-2.0, el uso comercial del paquete completo puede estar sujeto a condiciones adicionales que deben revisarse en `higgs_audio_2_tokenizer/LICENSE` y `NOTICE`.
- La cuantización int4 puede introducir artefactos audibles en voces con timbres poco representados, aunque la fidelidad medida frente a fp32 sea alta (coseno 0,9997); no se documenta una evaluación perceptual.
- La atención con máscara [B, 1, S, S] escala cuadráticamente con la duración del audio, lo que limita la longitud máxima de clip en GPUs con poca memoria.
- No se documentan sesgos demográficos ni lingüísticos; al cubrir más de 600 idiomas, la calidad por idioma puede variar y no se publican evaluaciones por lengua.
- Riesgo de alucinación acústica: como todo TTS, puede generar pronunciaciones incorrectas o prosodia extraña en textos con nombres propios, siglas o código.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de robustez en producción.
- La fecha de creación indicada (2026-11-27) es posterior a la fecha habitual de consulta; conviene verificar la integridad y procedencia de los archivos antes de desplegarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cgb/omnivoice-onnx-webgpu
- Modelo base: https://huggingface.co/k2-fsa/OmniVoice
- Conversión ONNX de referencia: https://huggingface.co/onnx-community/OmniVoice-Onnx
- FreeGen (aplicación que lo integra): https://freegen.ai
