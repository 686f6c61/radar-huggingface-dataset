# ml-resources/MiniMax-H3-16G-HiFi

## Resumen
MiniMax-H3-16G-HiFi es un reempaquetado cuantizado del modelo de generación de vídeo MiniMax-H3, publicado por el usuario `ml-resources` en HuggingFace como espejo de `l1ngzi/MiniMax-H3-16G-HiFi` de ModelScope. No es un lanzamiento oficial de MiniMax: se trata de una redistribución de pesos con cuantización de tipo ConvRot INT8 orientada a que el modelo completo (vídeo con audio) quepa y funcione en GPUs de consumo de 16 GB. El repositorio ocupa 93,1 GB y contiene dos variantes de DiT (Ref2VA y FL2VA), un codificador de texto Qwen3-VL y dos VAE de vídeo y audio.

El modelo resuelve la generación conjunta de vídeo y audio a partir de una imagen de referencia (Ref2VA) o de un primer y último fotograma (FL2VA), con soporte declarado de hasta 15 segundos de vídeo a resolución nativa. La propuesta técnica del autor no es la velocidad sino la fidelidad: la cuantización se presenta como "conservadora en calidad", con un error relativo L2 de 2,42 % (vídeo) y 4,23 % (audio) en Ref2VA frente a los pesos BF16 oficiales, y con reducciones del 51,3 % y 13,6 % en el error máximo de un solo punto respecto a una cuantización INT8 de todas las capas.

Su relevancia práctica está en el objetivo de hardware: 16 GB de VRAM en tarjetas de las series 30, 40 y 50, 32 GB de RAM de sistema y SSD NVMe, sin necesidad de NVFP4 ni de arquitectura Blackwell. La contrapartida es el tiempo de generación, que el propio autor cifra en torno a 2 horas por clip de 15 segundos en una RTX 5070 Ti, y en 50-60 minutos con el flujo de aceleración incluido.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) para vídeo y audio, con text encoder Qwen3-VL y VAE de vídeo y de audio |
| Parametros totales | no disponible (no se indica el recuento de parámetros en la model card) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible (se expresa en resolución y duración: hasta 15 s de vídeo, 960x544 recomendado para iteración) |
| Tipos de cuantizacion | ConvRot INT8 (w8a8 en las capas que ComfyUI procesa automáticamente); sin NVFP4 |
| Idiomas soportados | no disponible en la model card; el codificador de texto es Qwen3-VL |
| Licencia | MiniMax H3 Community License (`license_name: minimax-h3-community-license`), con restricciones regionales |
| Formato de pesos | safetensors |
| Tamano del repositorio | 93,1 GB |
| Modos de generacion | Ref2VA (imagen de referencia a vídeo+audio) y FL2VA (primer y último fotograma a vídeo+audio) |
| Entorno de referencia | ComfyUI >= 0.31, PyTorch cu130, nodo `ComfyUI-sol-attn` |
| Hardware objetivo | GPU de 16 GB (series 30/40/50, 2 GB de margen), 32 GB de RAM (10 GB de margen), SSD NVMe |

Ficheros del repositorio:

| Fichero | Tamano | Contenido |
|---|---|---|
| `diffusion_models/minimax_h3_ref2va_dit_16g.safetensors` | 26,5 GB | DiT principal del modo Ref2VA |
| `diffusion_models/minimax_h3_fl2va_dit_16g.safetensors` | 26,5 GB | DiT principal del modo FL2VA |
| `text_encoders/qwen3vl_text_encoder.safetensors` | 30,6 GB | Codificador de texto e imagen Qwen3-VL, con pérdida de precisión declarada inferior al 1 % |
| `vae/minimax_h3_video_vae_fp16.safetensors` | 4,9 GB | VAE de vídeo |
| `vae/minimax_h3_audio_vae_fp32.safetensors` | 0,6 GB | VAE de audio |
| `workflow_ref2va_fast.json` | — | Flujo de trabajo recomendado para Ref2VA, con aceleración configurada |
| `workflow_fl2va_fast.json` | — | Flujo de trabajo recomendado para FL2VA, con aceleración configurada |

## Arquitectura y entrenamiento
La información disponible describe un sistema generativo compuesto por tres bloques: dos DiT separados (uno por tarea, Ref2VA y FL2VA) que operan sobre latentes de vídeo y audio, un codificador de texto e imagen Qwen3-VL y dos VAE independientes, uno para vídeo en fp16 y otro para audio en fp32. La generación es multimodal conjunta: el modelo produce vídeo y pista de audio en la misma pasada, y admite tanto condicionamiento por imagen de referencia como por primer y último fotograma. No se detalla el número de capas, la dimensión oculta, el número de parámetros ni la variante exacta de atención del DiT original.

Tampoco se publican en la model card los datos de entrenamiento: no hay cifra de tokens, composición del dataset, ni mención a etapas de RLHF, DPO o ajuste por preferencias. La información técnica disponible se centra exclusivamente en el proceso de cuantización posterior al entrenamiento. El autor indica que el reempaquetado aplica ConvRot INT8 con activaciones w8a8 en las capas que ComfyUI gestiona de forma automática, lo que aporta un 2x local en esas capas y en torno a un 20 % de aceleración extremo a extremo respecto a los pesos BF16 nativos, sin recurrir a NVFP4. Frente a una cuantización INT8 de todas las capas, el autor reporta mejoras explícitas en la cola de la distribución de error, con el objetivo de que los errores de cuantización no se arrastren entre pasos de difusión.

## Capacidades
- Generación de vídeo con audio sincronizado en la misma inferencia, con dos modos de condicionamiento: Ref2VA (a partir de una imagen de referencia) y FL2VA (a partir de primer y último fotograma).
- Duración declarada de hasta 15 segundos por clip en resolución nativa; se recomienda 960x544 y hasta 10 segundos para iteración rápida.
- Codificación de texto e imagen mediante Qwen3-VL, lo que habilita condicionamiento textual y por imagen en el mismo codificador.
- Compatibilidad con nodos LoRA de aceleración configurados por el usuario, según la model card.
- Integración con ComfyUI mediante flujos de trabajo en formato JSON listos para cargar, con aceleración preconfigurada.
- Soporte de atención eficiente a través del nodo externo `ComfyUI-sol-attn` para el flujo de trabajo acelerado.
- No se documentan en la información disponible capacidades de tool calling, function calling, uso como agente, razonamiento multi-paso ni modo de pensamiento; se trata de un modelo generativo de medios, no de un modelo de lenguaje conversacional.
- Idiomas soportados: no disponible.

## Casos de uso
- Previsualización de anuncios y spots: a partir de una imagen de referencia de producto, el modo Ref2VA genera un clip corto con audio para validar dirección de arte y ritmo antes de producir en alta resolución. El flujo de 960x544 y 5 segundos permite iterar en torno a 10 minutos por variante.
- Transiciones y animación entre fotogramas clave: el modo FL2VA recibe el primer y el último fotograma de una secuencia y rellena la interpolación con movimiento y audio coherentes, útil para storyboards animados y previzualización de planos.
- Contenido vertical para redes sociales: clips de 5 a 10 segundos generados de forma local en una estación de trabajo con GPU de 16 GB, sin depender de servicios en la nube ni enviar material sensible a terceros.
- Prototipado en estudio pequeño o freelance: una única RTX 4070 Ti o 5070 Ti con 32 GB de RAM permite cerrar variantes de concepto para clientes, asumiendo tiempos de 10 a 60 minutos por clip según resolución y duración.
- Confección de material audiovisual para demostraciones internas: la generación conjunta de vídeo y audio evita montar la pista de sonido por separado en vídeos explicativos breves o viñetas de producto.
- Generación por lotes mediante la API de ComfyUI: al ser un flujo de trabajo JSON, se puede orquestar desde scripts externos para producir variantes masivas de un mismo prompt o de un conjunto de imágenes de referencia en un pipeline de contenido.
- Investigación en cuantización: el repositorio incluye varias configuraciones comparadas (BF16, INT8 ConvRot, NVFP4, INT4 ConvRot) con métricas de error, lo que lo convierte en un banco de pruebas útil para estudiar el impacto de la precisión reducida en modelos de difusión para vídeo.
- Ajuste fino ligero con LoRA: la compatibilidad declarada con nodos LoRA de aceleración permite explorar adaptaciones de estilo sobre el DiT sin reentrenar el modelo completo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni métricas estándar equivalentes para este tipo de modelo). Lo que sí se publica son métricas de fidelidad de la cuantización, expresadas como error relativo L2 agrupado (pooled relative L2, menor es mejor) y similitud coseno frente a los pesos BF16 oficiales.

Modo Ref2VA, referencia BF16 oficial (61,7 GB):

| Esquema | Tamano | Error video | Error audio | Notas | Velocidad estimada |
|---|---|---|---|---|---|
| BF16 oficial | 61,7 GB | base | base | Para GPU con mucha capacidad, tipo 5090 o Pro 6000 | 1,0x |
| Este repositorio (Ref2VA) | 26,5 GB | 2,42 % (cos 0,99971) | 4,23 % (cos 0,99911) | Optimo para el hardware objetivo | 1,2x |
| INT8 ConvRot en todas las capas | 21 GB | 3,25 % | 6,05 % | Uso general | 1,4x |
| NVFP4 en todas las capas | 11,7 GB | 14,1 % | 23,0 % | Hardware mas limitado | Solo mas rapido en serie 50 |
| INT4 ConvRot | 9,0 GB | 21,2 % | 41,8 % | Hardware muy limitado | Mas rapido en 20/30/40 |

Modo FL2VA, referencia BF16 oficial (61,7 GB):

| Esquema | Tamano | Error video | Error audio | Notas | Velocidad estimada |
|---|---|---|---|---|---|
| BF16 oficial | 61,7 GB | base | base | Para GPU con mucha capacidad | 1,0x |
| Este repositorio (FL2VA) | 26,5 GB | 2,92 % | 3,80 % | Optimo para el hardware objetivo | 1,2x |
| INT8 ConvRot en todas las capas | 21 GB | 3,99 % | 3,93 % | Uso general | 1,4x |
| NVFP4 en todas las capas | 11,7 GB | 17,33 % | 26,64 % | Hardware mas limitado | Solo mas rapido en serie 50 |
| INT4 ConvRot | 9,0 GB | 25,44 % | 45,14 % | Hardware muy limitado | Mas rapido en 20/30/40 |

Métricas de cola reportadas para FL2VA frente a INT8 ConvRot en todas las capas: el error máximo de un solo punto baja del 13,99 % al 6,81 % en vídeo (reducción del 51,3 %) y del 6,93 % al 5,99 % en audio (reducción del 13,6 %); la varianza del error por punto baja de 9,48 a 2,34 en vídeo (75,3 %) y de 1,30 a 1,06 en audio (18,5 %). El autor argumenta que, al propagarse el error entre pasos de difusión, reducir los picos mejora la estabilidad de la generación.

Escalado de coste: el número de tokens crece linealmente con la duración y el área, mientras que el tiempo crece aproximadamente como token^1,48 (ajuste empírico del autor). Duplicar la duración multiplica el tiempo por unos 2,7, de modo que un clip de 15 segundos cuesta lo mismo que cinco clips de 5 segundos.

## Requisitos de hardware
- VRAM objetivo: 16 GB, con un margen de seguridad declarado de 2 GB, en GPUs de consumo de las series 30, 40 y 50. No se requiere NVFP4 ni arquitectura Blackwell.
- Memoria de sistema: 32 GB de RAM, con 10 GB de margen declarado.
- Almacenamiento: SSD NVMe, aunque el autor afirma que, en las condiciones indicadas, los pesos no se descargan a disco. El repositorio completo ocupa 93,1 GB; la suma de los pesos principales (26,5 GB de DiT + 30,6 GB de codificador de texto + VAE + VAE de audio) ronda los 63 GB, por encima de la RAM indicada, y la model card no detalla el orden ni el esquema de carga por etapas.
- GPU de referencia para las estimaciones de tiempo: RTX 5070 Ti.
- GPU mencionadas en la comparativa: 5090 y Pro 6000 como opciones para los pesos BF16 oficiales que necesitan unos 61,7 GB.
- Opciones de despliegue: ComfyUI (>= 0.31) con PyTorch cu130 es el entorno soportado. Para el flujo de trabajo acelerado se requiere el nodo `ComfyUI-sol-attn`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de este tipo.
- Latencia estimada en 5070 Ti: aproximadamente 2 horas por clip de 15 segundos a máxima calidad, que bajan a 50-60 minutos con el flujo de trabajo de aceleración básico. Para iteración se recomienda 960x544 o menos y 10 segundos o menos, con un objetivo de unos 10 minutos por clip.
- Aceleración: la cuantización aporta en torno a un 20 % de mejora extremo a extremo frente a BF16 nativo; el flujo de trabajo básico de aceleración declara 2,2x con pérdida de precisión considerada imperceptible por el autor.
- No se publican cifras de throughput en tokens por segundo ni de latencia por paso de difusión.

## Comparativa con modelos similares
En la información disponible no hay datos verificables sobre otros modelos de generación de vídeo con audio comparables (Parámetros, contexto, benchmarks, licencia y disponibilidad de terceros). Por tanto, la comparación se limita a las variantes de cuantización del propio MiniMax-H3, que son los datos aportados por el autor:

| Variante | Tamano | Error video (Ref2VA / FL2VA) | Error audio (Ref2VA / FL2VA) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3 BF16 oficial | 61,7 GB | base | base | MiniMax H3 Community License | Pesos oficiales |
| MiniMax-H3-16G-HiFi (este repositorio) | 26,5 GB por DiT | 2,42 % / 2,92 % | 4,23 % / 3,80 % | MiniMax H3 Community License | HuggingFace y ModelScope |
| INT8 ConvRot en todas las capas | 21 GB | 3,25 % / 3,99 % | 6,05 % / 3,93 % | Segun la distribucion | Comunidad |
| NVFP4 en todas las capas | 11,7 GB | 14,1 % / 17,33 % | 23,0 % / 26,64 % | Segun la distribucion | Comunidad |
| INT4 ConvRot | 9,0 GB | 21,2 % / 25,44 % | 41,8 % / 45,14 % | Segun la distribucion | Comunidad |

Comparativa con modelos de terceros: no disponible.

## Limitaciones y advertencias
- Licencia MiniMax H3 Community License, que incluye restricciones regionales explícitas. Es obligatorio revisar el texto completo antes de cualquier uso comercial, ya que la model card advierte de que el uso está sujeto a sus términos.
- Este repositorio no es un lanzamiento oficial: es un espejo de un reempaquetado de terceros. El soporte, las actualizaciones y las garantías de calidad dependen de sus autores, no de MiniMax.
- El flujo de trabajo acelerado depende del nodo `ComfyUI-sol-attn`, que el propio autor describe como experimental y pendiente de estabilizar. Esto introduce riesgo de incompatibilidad con versiones futuras de ComfyUI.
- Funciones anunciadas como Minimax Regenerate 2K y la atención dispersa de Minimax no están en código abierto según la model card, por lo que no están disponibles en este paquete.
- La cuantización introduce error medible: 2,42 % / 4,23 % en Ref2VA y 2,92 % / 3,80 % en FL2VA frente a BF16. No es una reproducción exacta del modelo original.
- Tiempos de generación elevados: hasta 2 horas por clip de 15 segundos en una GPU de 16 GB sin aceleración, y 50-60 minutos con el flujo acelerado. No es adecuado para aplicaciones interactivas ni para producción en tiempo real en hardware de consumo.
- Escalado superlineal del coste (token^1,48): aumentar resolución o duración encarece la generación de forma desproporcionada, lo que limita el uso práctico a clips cortos.
- Riesgo de alucinación visual y de inconsistencias temporales inherente a los modelos de difusión para vídeo; la model card no documenta evaluaciones de coherencia temporal, fidelidad de movimiento ni calidad del audio generado más allá del error de cuantización.
- Sesgos conocidos: no disponible. No se publica ninguna evaluación de sesgos demográficos, culturales o de representación.
- Idiomas soportados: no disponible. La model card está redactada en chino y no especifica cobertura lingüística de los prompts, aunque el codificador de texto sea Qwen3-VL.
- Recuento de parámetros, datos de entrenamiento y composición del dataset: no disponibles, lo que dificulta evaluar procedencia y posibles sesgos de los datos.
- Entorno muy específico: ComfyUI >= 0.31 y PyTorch cu130. El uso fuera de ComfyUI no está documentado.
- Instalación no trivial para usuarios sin experiencia, tal como reconoce el propio autor en la model card.

## Enlaces
- HuggingFace: https://huggingface.co/ml-resources/MiniMax-H3-16G-HiFi
- ModelScope, reempaquetado original: https://www.modelscope.cn/models/l1ngzi/MiniMax-H3-16G-HiFi
- ModelScope, modelo base MiniMax-H3: https://www.modelscope.cn/models/MiniMax/MiniMax-H3
- Licencia MiniMax H3 Community License: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Nodo de atención para el flujo acelerado: https://www.modelscope.cn/models/l1ngzi/MiniMax-H3-16G-HiFi/resolve/master/ComfyUI-sol-attn-main.zip?view=false
- Paper, blog oficial, repositorio de código y demo: no disponibles en la información proporcionada.
