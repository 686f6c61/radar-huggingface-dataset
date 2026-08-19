# Gluttony10/ComfyUI-RH-daVinci-MagiHuman

## Resumen

El modelo `Gluttony10/ComfyUI-RH-daVinci-MagiHuman` es una versión cuantizada en INT8 de los pesos del modelo `daVinci-MagiHuman` de GAIR, adaptada para su uso dentro de ComfyUI mediante los nodos desarrollados por RH-RunningHub. Se trata de un sistema multimodal de generación de vídeo a partir de imagen y texto, especializado en la creación de vídeos tipo "talking head" con audio sincronizado: a partir de una única imagen de referencia y una indicación textual, genera un vídeo donde la persona habla con movimiento de labios y voz coherentes.

El repositorio contiene únicamente los cuatro ficheros `.pt` cuantizados (el DiT base, el DiT destilado y dos modelos de superresolución opcionales), mientras que el resto de componentes necesarios (TurboVAE, codificador de texto T5, configuraciones de superresolución y VAE de audio/vídeo) deben descargarse de los repositorios oficiales. La cuantización INT8 reduce el peso de cada fichero a 14,25 GiB, lo que permite ejecutar el modelo en GPUs de consumo con modos de VRAM reducida (desde ~6,5 GB). La licencia es Apache-2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para generacion de video con audio sincronizado |
| Parametros totales | no disponible (no especificado en la informacion) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica directamente, modelo de difusion) |
| Tipos de cuantizacion | INT8 (pesos convertidos) |
| Idiomas soportados | en, zh, ja, ko, de, fr, yue |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base `daVinci-MagiHuman` de GAIR emplea una arquitectura de Diffusion Transformer (DiT) para generar vídeo de alta calidad a partir de una imagen de referencia y un prompt de texto, incorporando además generación de audio sincronizado. El pipeline completo integra un codificador de texto T5 (concretamente `t5gemma-9b-9b-ul2`), un TurboVAE para el espacio latente de vídeo, y VAE externos para audio (stable-audio-open-1.0) y para el modelo Wan2.2-TI2V-5B. El repositorio cuantizado ofrece dos variantes del DiT: `base_int8.pt` (32 pasos, mayor calidad) y `distill_int8.pt` (8 pasos, más rápido), además de dos modelos de superresolución opcionales (540p y 1080p).

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La cuantización INT8 es una conversión posterior al entrenamiento, realizada por el autor del repositorio para reducir el uso de memoria, manteniendo la funcionalidad original.

## Capacidades

- Generacion de video "talking head" a partir de una imagen de referencia y un prompt de texto.
- Generacion de audio sincronizado con el movimiento de labios (voz y habla).
- Soporte de superresolucion opcional hasta 1080p mediante modelos SR adicionales.
- Soporte multilingue para prompts en ingles, chino, japones, coreano, aleman, frances y cantonés.
- Integracion nativa con ComfyUI mediante dos nodos: `RH MagiHuman Model Loader` y `RH MagiHuman Generate`.
- Modos de VRAM ajustables (`mid_vram` ~16 GB, `low_vram` ~6,5 GB) para adaptarse a distintos hardware.
- Permite elegir entre modelo base (32 pasos) o destilado (8 pasos) para equilibrar calidad y velocidad.

## Casos de uso

- Creacion de avatares parlantes para video: a partir de una foto de una persona, se genera un video donde habla siguiendo un guion, util para presentaciones, tutoriales o contenido educativo.
- Doblaje automatico de videos: se puede cambiar el audio de un video existente manteniendo la sincronia labial, generando el habla en el idioma deseado.
- Asistentes virtuales con presencia visual: integrar el modelo en un sistema de atencion al cliente que muestre un agente virtual que responde en tiempo real con voz y gestos.
- Generacion de contenido para redes sociales: crear videos cortos de personajes ficticios o reales hablando sobre temas concretos, sin necesidad de grabacion.
- Localizacion de contenido multimedia: traducir y adaptar videos a otros idiomas, generando el audio y la sincronia labial en el idioma destino.
- Prototipado rapido de anuncios o demos de producto: generar un video promocional con un presentador virtual a partir de una imagen corporativa y un guion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye comparaciones con otros modelos ni métricas de calidad (FID, CLIP score, etc.) para la version INT8.

## Requisitos de hardware

- VRAM estimada: modo `low_vram` ~6,5 GB, modo `mid_vram` ~16 GB, con superresolucion 540p ~24 GB, con superresolucion 1080p ~48 GB.
- GPU recomendadas: no se especifican modelos concretos, pero los requisitos de VRAM sugieren que es ejecutable en GPUs de consumo como RTX 3060 (12 GB) para low_vram, RTX 4080/4090 (16-24 GB) para mid_vram con SR 540p, y GPUs profesionales (A100, H100) para SR 1080p.
- Despliegue: exclusivamente a traves de ComfyUI con el plugin `ComfyUI-RH-daVinci-MagiHuman`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El modelo destilado (8 pasos) sera significativamente mas rapido que el base (32 pasos), pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos de generacion de talking-head (como SadTalker, Wav2Lip o Hallo). La informacion proporcionada no incluye referencias a alternativas ni datos comparativos.

## Limitaciones y advertencias

- La cuantizacion INT8 puede degradar ligeramente la calidad de los videos generados en comparacion con los pesos originales en FP16/FP32.
- Se requiere descargar multiples componentes externos (TurboVAE, T5, VAE de audio y video) desde repositorios oficiales; si alguno falta, el modelo no funcionara.
- No se han documentado sesgos especificos, pero al ser un modelo de generacion de video con audio, puede heredar sesgos de los datos de entrenamiento en cuanto a apariencia, acentos o idiomas.
- Riesgo de alucinacion en el contenido del habla generado: el modelo puede producir frases incorrectas o incoherentes si el prompt es ambiguo.
- La generacion de video y audio requiere un tiempo de computacion considerable; en GPUs de consumo puede ser lento, especialmente con superresolucion.
- La licencia Apache-2.0 permite uso comercial, pero se deben respetar los terminos de los componentes de terceros (por ejemplo, los VAE externos pueden tener licencias distintas).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Gluttony10/ComfyUI-RH-daVinci-MagiHuman
- Repositorio del plugin ComfyUI: https://github.com/RH-RunningHub/ComfyUI-RH-daVinci-MagiHuman
- Repositorio oficial del modelo base: https://github.com/GAIR-NLP/daVinci-MagiHuman
- Pesos oficiales del modelo base: https://huggingface.co/GAIR/daVinci-MagiHuman
- Pesos oficiales de superresolucion: https://huggingface.co/GAIR/daVinci-MagiHuman-SR
- Assets oficiales en ModelScope: https://www.modelscope.cn/models/GAIR/daVinci-MagiHuman
