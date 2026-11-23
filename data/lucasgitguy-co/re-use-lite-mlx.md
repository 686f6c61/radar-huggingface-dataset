# Lucasgitguy-co/RE-USE-Lite-MLX

## Resumen

RE-USE Lite MLX es una versión destilada, no oficial, del modelo de mejora de voz universal NVIDIA NemotronLabs RE-USE, adaptada para ejecutarse sobre Apple Silicon mediante la librería mlx-audio. El modelo resuelve tareas de realce de habla: eliminación de ruido, desreverberación, reconstrucción de señal recortada (declipping) y extensión de ancho de banda, aceptando audio de entrada entre 8 y 48 kHz. Lo publica el usuario Lucasgitguy-co como estudiante destilado del modelo docente de NVIDIA, del que conserva el codificador y los decodificadores pero solo 4 de sus 30 bloques TFMamba.

La relevancia de esta ficha es doble. Por un lado, demuestra una técnica de compresión agresiva de un modelo de realce de habla basado en Mamba, reduciéndolo de 9.607.747 a 2.382.659 parámetros (4,0x más pequeño) y logrando una aceleración de 5,51x a 16 kHz. Por otro, el propio autor declara que la puerta de calidad de la release **falló**: en el conjunto degradado (reverberación, paso bajo, clipping) el PESQ cae al 78,3 % del docente y el SI-SDR al 13,9 %. Se publica como resultado inspeccionable, no como sustituto del modelo original.

Arquitectura híbrida con bloques TFMamba (variante de Mamba para secuencias de audio), pesos en safetensors float32, licencia OpenMDW-1.1 y soporte exclusivo de inglés según la model card. El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador + decodificadores del docente con 4 bloques TFMamba (de 30), destilación |
| Parámetros totales | 2.382.659 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio en fragmentos de 5 s por defecto; `chunk_seconds=None` para una sola pasada) |
| Tipos de cuantización | float32 (pesos publicados en float32; existe variante GGUF f32 y f16 en otro repo) |
| Idiomas soportados | en (inglés) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (MLX); variantes GGUF en repo aparte |
| Frecuencias de muestreo | 8 a 48 kHz de entrada; calidad medida a 8 y 16 kHz |
| Pipeline | audio-to-audio |
| Librería | mlx-audio 0.6.6 |

## Arquitectura y entrenamiento

El modelo es un estudiante destilado del docente NVIDIA NemotronLabs RE-USE, que emplea una arquitectura basada en TFMamba (Mamba adaptada a modelado de audio) junto con codificador y decodificadores. El estudiante conserva el codificador y ambos decodificadores del docente, pero reduce los bloques TFMamba de 30 a 4, seleccionados de forma equiespaciada. El entrenamiento se realizó en GPU en la nube (Modal, NVIDIA L4) y la pérdida combina términos estilo SEMamba: magnitud, fase anti-wrapped, complejo, tiempo y consistencia contra la salida del docente, más un 0,3x de los mismos términos contra habla limpia donde es válido. Optimizador AdamW con schedule coseno.

Los datos de destilación proceden de VoiceBank-DEMAND (habla leída en inglés), con reverberación sintética, paso bajo y clipping añadidos. El docente generó las salidas objetivo sobre 2 recortes aleatorios de 24.000 muestras por clip de entrenamiento, a 8, 16, 24 y 48 kHz. El código de generación está en el repositorio Gitguy268/re-use-lite. La innovación técnica principal es la reducción extrema de bloques manteniendo la velocidad (5,51x a 16 kHz) a costa de calidad, especialmente en el conjunto degradado.

## Capacidades

- Realce de voz: eliminación de ruido de fondo en grabaciones de habla.
- Desreverberación: reducción de reverberación de sala.
- Declipping: reconstrucción de señal recortada por saturación.
- Extensión de ancho de banda: entrada de 8 a 48 kHz, con calidad medida a 8 y 16 kHz.
- Procesamiento offline bidireccional (no streaming).
- Ejecución en Apple Silicon mediante MLX.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo audio-to-audio, no un LLM).
- Capacidad multilingüe: solo inglés declarado.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Limpieza de grabaciones de entrevistas en inglés: el modelo elimina ruido estacionario y reverberación de grabaciones de campo antes de transcripción, aunque su rendimiento en escenarios degradados es limitado (PESQ 1,994 frente a 2,546 del docente).
- Preprocesado para pipelines de ASR: mejora la relación señal-ruido (SI-SDR de 8,445 a 18,425 dB en VoiceBank-DEMAND a 16 kHz) antes de alimentar un sistema de reconocimiento de voz.
- Restauración de audio telefónico de 8 kHz: la modalidad de 8 kHz mantiene un DNSMOS OVRL del 99,7 % del docente, adecuada para limpiar llamadas grabadas.
- Prototipado en Mac: al ejecutarse con mlx-audio sobre Apple Silicon, permite probar un pipeline de realce de voz localmente sin GPU dedicada, con 2,38 M de parámetros y pesos float32.
- Investigación sobre destilación de modelos Mamba: sirve como caso de estudio reproducible de compresión de 30 a 4 bloques y de los umbrales de calidad que se pierden.
- Evaluación comparativa de formatos: el autor publica métricas de concordancia entre MLX, GGUF f32/f16 y WebGPU (SI-SDR medio de 66,9 dB en MLX), útil para validar portabilidad numérica.
- No recomendado para producción de calidad: para realce de voz en producción debe usarse el docente NVIDIA NemotronLabs RE-USE.

## Benchmarks y rendimiento

Resultados publicados por el autor (VoiceBank-DEMAND test, comparación con el docente de 30 bloques):

| Conjunto | Métrica | Ruidoso | Docente (30 bloques) | RE-USE Lite | Ratio |
|---|---|---:|---:|---:|---:|
| VBD test 16 kHz | PESQ WB | 1,971 | 3,083 | 2,822 | 0,915 |
| VBD test 16 kHz | ESTOI | 0,787 | 0,890 | 0,865 | 0,972 |
| VBD test 16 kHz | SI-SDR (dB) | 8,445 | 19,152 | 18,425 | 0,962 |
| VBD test 16 kHz | DNSMOS OVRL | 2,697 | 3,291 | 3,227 | 0,980 |
| VBD test 16 kHz | DNSMOS SIG | 3,346 | 3,544 | 3,501 | 0,988 |
| VBD test 16 kHz | DNSMOS BAK | 3,126 | 4,104 | 4,054 | 0,988 |
| VBD test 8 kHz | PESQ NB | 2,946 | 3,907 | 3,668 | 0,939 |
| VBD test 8 kHz | ESTOI | 0,786 | 0,887 | 0,862 | 0,972 |
| VBD test 8 kHz | SI-SDR (dB) | 8,443 | 19,086 | 18,493 | 0,969 |
| VBD test 8 kHz | DNSMOS OVRL | 2,050 | 2,269 | 2,262 | 0,997 |
| VBD test 8 kHz | DNSMOS SIG | 2,549 | 2,494 | 2,506 | 1,004 |
| VBD test 8 kHz | DNSMOS BAK | 2,541 | 3,741 | 3,708 | 0,991 |
| Degradado (reverb/low-pass/clipping) | PESQ WB | 1,392 | 2,546 | 1,994 | 0,783 |
| Degradado | ESTOI | 0,471 | 0,811 | 0,708 | 0,873 |
| Degradado | SI-SDR (dB) | -7,794 | 3,860 | 0,537 | 0,139 |
| Degradado | DNSMOS OVRL | 1,913 | 3,289 | 3,109 | 0,945 |
| Degradado | DNSMOS SIG | 2,346 | 3,540 | 3,395 | 0,959 |
| Degradado | DNSMOS BAK | 2,253 | 4,117 | 4,033 | 0,980 |

Velocidad (PyTorch, Apple M4 GPU, mismo código y dispositivo para ambos): 5,51x más rápido a 16 kHz (vbd16 5,51x, vbd8 6,33x, degradado 12,43x). Concordancia entre formatos frente a PyTorch en CPU (SI-SDR, mayor es mejor): MLX peor archivo 51,1 dB / media 66,9 dB; GGUF f32 61,6 / 70,9 dB; GGUF f16 58,6 / 63,2 dB; navegador 59,5 / 69,1 dB.

## Requisitos de hardware

- VRAM estimada: muy baja; con 2,38 M de parámetros en float32 el peso de los pesos es de aproximadamente 9,5 MB, más buffers de activación para fragmentos de 5 s.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) mediante MLX; el autor reporta medidas en M4 GPU. Para la variante PyTorch, NVIDIA L4 fue usada en entrenamiento; cualquier GPU con suficiente memoria para inferencia de audio.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna e incluso en CPU; el cuello de botella es el procesamiento secuencial Mamba, no la memoria.
- Opciones de despliegue: mlx-audio 0.6.6 (comando `python -m mlx_audio.sts.generate`), variante PyTorch en safetensors, GGUF para audio.cpp y demo WebGPU en el Space del autor.
- Latencia y throughput: 5,51x más rápido que el docente a 16 kHz en M4 GPU; a 8 kHz la ganancia puede quedar justo por debajo de 5x por el coste fijo de codificador y decodificador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Calidad (PESQ WB 16 kHz) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| RE-USE Lite MLX (este) | 2.382.659 | 8-48 kHz, offline | 2,822 | openmdw-1.1 | Hugging Face, MLX/GGUF/PyTorch/WebGPU |
| NVIDIA NemotronLabs RE-USE (docente) | 9.607.747 | 8-48 kHz, offline | 3,083 | no disponible en la información | Hugging Face (nvidia) |
| VoiceBank-DEMAND baseline (referencia del conjunto) | no disponible | 16 kHz | 1,971 (ruidoso) | no disponible | dataset público |

La comparación con el docente es la más directa: el estudiante es 4,0x más pequeño y 5,51x más rápido, pero pierde calidad de forma significativa, sobre todo en el conjunto degradado. No se dispone de datos de otros modelos de realce de voz en la información proporcionada.

## Limitaciones y advertencias

- La puerta de calidad de la release falló: PESQ al 91,5 % (vbd16), 93,9 % (vbd8) y 78,3 % (degradado) del docente; SI-SDR en degradado al 13,9 %. No usar como sustituto del docente en producción.
- Los datos de destilación son VoiceBank-DEMAND (habla leída en inglés) con reverberación, paso bajo y clipping sintéticos; otros idiomas, canto y grabaciones de campo muy ruidosas están menos probados que en el docente.
- Solo offline y bidireccional: no apto para streaming en vivo.
- Puede suprimir hablantes solapados.
- Solo inglés declarado; no hay soporte multilingüe verificado.
- Licencia OpenMDW-1.1: revisar los términos antes de uso comercial; el autor la etiqueta como "other" con nombre openmdw-1.1.
- Los números de velocidad provienen del port PyTorch con Mamba puro en PyTorch (sin `mamba_ssm` CUDA).
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí de artefactos de audio y sobre-suavizado en señales degradadas.
- Modelo no afiliado ni respaldado por NVIDIA.

## Enlaces

- Hugging Face (MLX): https://huggingface.co/Lucasgitguy-co/RE-USE-Lite-MLX
- Hugging Face (PyTorch safetensors): https://huggingface.co/Lucasgitguy-co/RE-USE-Lite
- Hugging Face (GGUF): https://huggingface.co/Lucasgitguy-co/RE-USE-Lite-GGUF
- Demo WebGPU: https://lucasgitguy-co-re-use-lite-web.static.hf.space/
- Space en Hugging Face: https://huggingface.co/spaces/Lucasgitguy-co/RE-USE-Lite-web
- Modelo docente NVIDIA: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE
- Repositorio de código: https://github.com/Gitguy268/re-use-lite
- Dataset: https://huggingface.co/datasets/JacobLinCool/VoiceBank-DEMAND-16k
- Paper de referencia (arXiv): https://arxiv.org/abs/2603.02641
- Paper de referencia (arXiv): https://arxiv.org/abs/2606.25621
