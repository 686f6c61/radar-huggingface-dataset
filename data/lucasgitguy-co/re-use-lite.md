# Lucasgitguy-co/RE-USE-Lite

## Resumen

RE-USE Lite es un modelo de mejora de voz (speech enhancement) publicado por Lucasgitguy-co como estudiante destilado no oficial de NVIDIA NemotronLabs RE-USE. Se trata de un modelo audio-audio que aborda de forma conjunta la eliminacion de ruido, la desreverberacion, la reparacion de clipping y la extension de ancho de banda, aceptando entradas entre 8 y 48 kHz. Su interes tecnico radica en que reduce el modelo docente de 9.607.747 a 2.382.659 parametros (4,0x mas pequeno) conservando el encoder y ambos decoders del profesor y reteniendo solo 4 de sus 30 bloques TFMamba.

El modelo es relevante como caso de estudio de destilacion agresiva en arquitecturas hibridas basadas en Mamba para audio, y porque su autor publica los resultados sin filtro: la puerta de calidad fijada antes del entrenamiento (todas las metricas PESQ/ESTOI/DNSMOS al menos al 95% del profesor, y al menos 5x mas rapido a 16 kHz) fallo en el criterio de calidad y solo paso el de velocidad (5,51x a 16 kHz). Se distribuye con licencia OpenMDW-1.1, la misma del modelo base, y esta pensado para inspeccion del resultado, no para produccion.

La relevancia practica es limitada: la propia model card recomienda usar el profesor para calidad. Aun asi, el modelo ofrece una velocidad 5,51x superior a 16 kHz y 12,43x en el conjunto degradado, con artefactos de pesos en safetensors, MLX, GGUF y una demo WebGPU en navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida encoder-decoder con bloques TFMamba (Mamba); estudiante con 4 de los 30 bloques del profesor |
| Parametros totales | 2.382.659 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo offline, procesa clips completos de forma bidireccional) |
| Tipos de cuantizacion | f32 y f16 en GGUF; pesos safetensors en PyTorch y MLX |
| Idiomas soportados | en (ingles) |
| Licencia | openmdw-1.1 (con aviso de copyright de NVIDIA) |
| Formato de pesos | safetensors (PyTorch), MLX, GGUF (audio.cpp) |

## Arquitectura y entrenamiento

El estudiante reutiliza el encoder y los dos decoders del profesor NVIDIA NemotronLabs RE-USE y sustituye los 30 bloques TFMamba originales por 4 bloques seleccionados de forma equidistante. La arquitectura combina capas convolucionales de codificacion/decodificacion con bloques de espacio de estados (Mamba) para el modelado temporal, lo que permite procesar audio de forma bidireccional (offline) manteniendo un coste computacional lineal en la longitud de la secuencia.

El entrenamiento se realizo en Modal con una GPU NVIDIA L4. Los datos de destilacion son VoiceBank-DEMAND (habla leida en ingles) con reverberacion, filtro paso bajo y clipping sinteticos anadidos; el profesor genero las salidas objetivo sobre 2 recortes aleatorios de 24.000 muestras por clip de entrenamiento, a 8/16/24/48 kHz. La funcion de perdida sigue el esquema de SEMamba: terminos de magnitud, fase anti-wrapping, complejo, tiempo y consistencia frente al profesor, mas 0,3x de los mismos terminos frente al habla limpia donde es valido. El optimizador fue AdamW con schedule coseno; el numero de pasos y el tamano de batch no se especifican en la informacion disponible. El codigo de entrenamiento esta en el repositorio Gitguy268/re-use-lite.

## Capacidades

- Mejora de voz integral: eliminacion de ruido, desreverberacion, reparacion de clipping y extension de ancho de banda en un unico modelo.
- Procesamiento de audio de 8 a 48 kHz; la calidad se mide en 8 y 16 kHz, y el resto de frecuencias solo se comprueba por concordancia entre formatos.
- Preservacion de la frecuencia de muestreo, canales y longitud del audio de entrada.
- Inferencia offline bidireccional (no streaming).
- Ejecucion en CUDA, GPU de Apple (MLX) y CPU mediante el port en PyTorch.
- Inferencia en navegador via WebGPU (demo publicada).
- Soporte de lotes por fichero y por carpeta en el script de inferencia.
- No dispone de tool calling, capacidades de agente, vision ni audio generativo: es exclusivamente un modelo audio-audio de mejora.

## Casos de uso

- Preprocesado de corpus de habla para ASR: aplicar el modelo a grabaciones ruidosas antes de transcribir mejora la relacion senal-ruido (SI-SDR de 8,445 a 18,425 dB en VoiceBank-DEMAND a 16 kHz), lo que puede reducir errores de reconocimiento en pipelines de transcripcion.
- Limpieza de audios de call center: el modelo elimina ruido estacionario y reverberacion de conversaciones telefonicas, aunque el autor advierte que puede suprimir hablantes solapados, por lo que es mas adecuado en grabaciones de un solo hablante.
- Restauracion de grabaciones historicas o de baja calidad: la extension de ancho de banda y la reparacion de clipping permiten recuperar inteligibilidad en material degradado, con la cautela de que en el conjunto degradado el SI-SDR cae a 0,537 dB frente a 3,860 dB del profesor.
- Prototipado rapido en navegador: la demo WebGPU permite probar la mejora de voz sin instalar dependencias, util para validar ideas de interfaz o demos de producto.
- Evaluacion comparativa de tecnicas de destilacion: sirve como referencia reproducible (codigo, pesos y metricas publicadas) para investigar el equilibrio entre tamano, velocidad y calidad en modelos Mamba de audio.
- Despliegue en dispositivos con recursos limitados: con 2,38 millones de parametros y formato GGUF f16/f32, el modelo puede ejecutarse en CPU (audio.cpp) o en Apple Silicon (MLX) para tareas de mejora puntual de ficheros.
- Generacion de pares de entrenamiento para otros modelos: la salida mejorada puede usarse como pseudo-etiqueta en la preparacion de datos de habla, siempre que se acepte la perdida de calidad documentada.

## Benchmarks y rendimiento

Resultados publicados por el autor (conjunto VoiceBank-DEMAND test y variante degradada con reverberacion, paso bajo y clipping):

| Conjunto | Metrica | Ruidoso | Profesor (30 bloques) | RE-USE Lite | Ratio |
|---|---|---:|---:|---:|---:|
| VBD test, 16 kHz | PESQ WB | 1,971 | 3,083 | 2,822 | 0,915 |
| VBD test, 16 kHz | ESTOI | 0,787 | 0,890 | 0,865 | 0,972 |
| VBD test, 16 kHz | SI-SDR (dB) | 8,445 | 19,152 | 18,425 | 0,962 |
| VBD test, 16 kHz | DNSMOS OVRL | 2,697 | 3,291 | 3,227 | 0,980 |
| VBD test, 8 kHz | PESQ NB | 2,946 | 3,907 | 3,668 | 0,939 |
| VBD test, 8 kHz | ESTOI | 0,786 | 0,887 | 0,862 | 0,972 |
| VBD test, 8 kHz | SI-SDR (dB) | 8,443 | 19,086 | 18,493 | 0,969 |
| Degradado | PESQ WB | 1,392 | 2,546 | 1,994 | 0,783 |
| Degradado | ESTOI | 0,471 | 0,811 | 0,708 | 0,873 |
| Degradado | SI-SDR (dB) | -7,794 | 3,860 | 0,537 | 0,139 |
| Degradado | DNSMOS OVRL | 1,913 | 3,289 | 3,109 | 0,945 |

Velocidad (PyTorch, GPU Apple M4, mismo codigo y dispositivo para ambos modelos): 5,51x mas rapido a 16 kHz, 6,33x a 8 kHz y 12,43x en el conjunto degradado. La puerta de calidad exigia al menos el 95% del profesor en todas las metricas y al menos 5x de velocidad a 16 kHz; fallo en calidad y paso en velocidad.

Concordancia entre formatos frente al modelo PyTorch en CPU (SI-SDR, mayor es mas cercano): MLX con peor fichero 51,1 dB y media 66,9 dB; GGUF f32 con peor fichero 61,6 dB y media 70,9 dB; GGUF f16 con peor fichero 58,6 dB y media 63,2 dB; navegador con peor fichero 59,5 dB y media 69,1 dB.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,38 millones de parametros, los pesos ocupan aproximadamente 9,5 MB en f32 y 4,8 MB en f16; el consumo dominante es el de las activaciones y el buffer de audio, no los pesos.
- GPU recomendadas: cualquier GPU moderna sirve; el autor entreno y midio en NVIDIA L4 y Apple M4. Para produccion a gran escala, A100 o H100 aportan margen de sobra, pero el modelo es pequeno para aprovecharlas.
- Cabe en GPU de consumo: si, en cualquier GPU consumer con soporte CUDA, y en Apple Silicon via MLX. Tambien funciona en CPU con el port en PyTorch.
- Opciones de despliegue: script `inference.py` con PyTorch (CUDA, Apple GPU o CPU), MLX para Apple Silicon, GGUF mediante audio.cpp y demo WebGPU en navegador. No se documenta soporte de vLLM, llama.cpp ni TGI, que no estan orientados a este tipo de modelo audio-audio.
- Latencia y throughput: el autor solo publica el speed-up relativo (5,51x a 16 kHz, 6,33x a 8 kHz, 12,43x en degradado frente al profesor); no se proporcionan valores absolutos de latencia ni de throughput en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Calidad (PESQ WB VBD 16 kHz) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RE-USE Lite (este modelo) | 2.382.659 | audio 8-48 kHz, offline | 2,822 | openmdw-1.1 | Hugging Face (PyTorch, MLX, GGUF, WebGPU) |
| NVIDIA NemotronLabs RE-USE (profesor) | 9.607.747 | audio 8-48 kHz, offline | 3,083 | openmdw-1.1 | Hugging Face |
| Modelos de mejora de voz tipo SEMamba o Demucs | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con alternativas de la misma categoria no puede completarse con los datos disponibles: solo se dispone de las cifras del profesor frente al estudiante. El profesor es 4,0x mas grande y obtiene entre un 2,8% y un 21,7% mas de PESQ segun el conjunto, a cambio de ser 5,51x mas lento a 16 kHz.

## Limitaciones y advertencias

- La puerta de calidad fallo: el autor desaconseja explicitamente su uso en produccion y recomienda el profesor para calidad. El PESQ a 16 kHz queda un 8,5% por debajo del profesor y en el conjunto degradado un 21,7%.
- El SI-SDR en el conjunto degradado cae a 0,537 dB frente a 3,860 dB del profesor (ratio 0,139), lo que indica un deterioro severo en condiciones de reverberacion, paso bajo y clipping combinados.
- Los datos de destilacion son VoiceBank-DEMAND (habla leida en ingles) con degradaciones sinteticas; otros idiomas, canto y grabaciones de campo muy ruidosas estan menos probados que en el profesor.
- Modelo offline y bidireccional: no apto para streaming en tiempo real.
- Puede suprimir hablantes solapados, por lo que no es adecuado para separacion de fuentes ni para reuniones con habla simultanea.
- Las cifras de velocidad proceden del port en PyTorch con una implementacion pura de Mamba (sin `mamba_ssm` de CUDA), por lo que no reflejan el rendimiento con kernels optimizados.
- Riesgo de sesgos y alucinacion: no se documentan sesgos especificos; al ser un modelo de mejora de senal, el riesgo principal es la introduccion de artefactos o la alteracion de la voz, no la generacion de contenido falso.
- Licencia OpenMDW-1.1 con aviso de copyright de NVIDIA; el componente Mamba se distribuye bajo Apache-2.0 segun el fichero NOTICE. Verificar los terminos antes de uso comercial.
- Modelo no oficial, no afiliado ni respaldado por NVIDIA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/RE-USE-Lite
- Version MLX: https://huggingface.co/Lucasgitguy-co/RE-USE-Lite-MLX
- Version GGUF: https://huggingface.co/Lucasgitguy-co/RE-USE-Lite-GGUF
- Demo WebGPU: https://lucasgitguy-co-re-use-lite-web.static.hf.space/
- Space de la demo: https://huggingface.co/spaces/Lucasgitguy-co/RE-USE-Lite-web
- Modelo base (profesor): https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE
- Codigo de entrenamiento e inferencia: https://github.com/Gitguy268/re-use-lite
- Dataset de destilacion: https://huggingface.co/datasets/JacobLinCool/VoiceBank-DEMAND-16k
- Paper de referencia (arxiv:2603.02641): https://arxiv.org/abs/2603.02641
- Paper de referencia (arxiv:2606.25621): https://arxiv.org/abs/2606.25621
