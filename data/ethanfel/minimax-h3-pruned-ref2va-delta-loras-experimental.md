# ethanfel/MiniMax-H3-Pruned-Ref2VA-Delta-LoRAs-Experimental

## Resumen

Este repositorio contiene un conjunto de adaptadores LoRA experimentales para el modelo MiniMax-H3, desarrollados por ethanfel. Se trata de aproximaciones mediante descomposición en valores singulares (SVD) aleatoria de la diferencia de pesos entre dos checkpoints podados oficiales del modelo MiniMax-H3: la variante FL2VA y la variante Ref2VA. El objetivo es transferir el comportamiento de una variante a la otra sin necesidad de entrenamiento adicional, actuando como parches de pesos que se aplican sobre el checkpoint base correspondiente.

Los adaptadores son altamente experimentales: no han sido probados en generación y solo se ha validado su integridad estructural y su carga en ComfyUI. Están diseñados para usarse exclusivamente con los checkpoints podados en BF16 de MiniMax-H3 y no con las versiones completas o cuantizadas. El modelo base MiniMax-H3 es un sistema generativo omni-modal que comprende texto, imagen, video y audio, y genera video con audio estéreo nativo hasta resoluciones de 2K y duraciones de hasta 15 segundos. Estos adaptadores no alteran la arquitectura base, sino que ajustan los pesos de las variantes podadas mediante parches LoRA.

La relevancia de este trabajo reside en explorar la transferencia de comportamiento entre variantes de un mismo modelo sin entrenamiento, utilizando técnicas de extracción mecánica. Sin embargo, las advertencias del autor son claras: se esperan artefactos, pérdida de capacidades o comportamiento impredecible. No es un recurso apto para producción, sino para investigación y experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre MiniMax-H3 (omni-modal, genera video y audio) |
| Parametros totales | No disponible (los adaptadores no publican conteo de parámetros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base MiniMax-H3) |
| Tipos de cuantizacion | BF16 para los factores LoRA; FP32 para parches de vectores y bias |
| Idiomas soportados | No disponible |
| Licencia | minimax-h3-community-license-agreement (con restricciones territoriales y de uso) |
| Formato de pesos | safetensors (adaptadores LoRA para ComfyUI) |

## Arquitectura y entrenamiento

Los adaptadores no han sido entrenados mediante métodos convencionales como LoRA o fine-tuning. En su lugar, se han extraído mecánicamente mediante una descomposición en valores singulares (SVD) aleatoria determinista de la diferencia de pesos entre dos checkpoints podados en BF16 de MiniMax-H3: `pruned FL2VA BF16` y `pruned Ref2VA BF16`. La diferencia se calcula como `delta = pruned Ref2VA - pruned FL2VA`, y los adaptadores aproximan esa delta con un rango limitado (256, 512 o 1024). Los adaptadores en dirección inversa se construyen por inversión exacta de signo de un factor LoRA y de todos los tensores de parche.

El proceso de extracción utiliza SVD aleatorio con oversampling de 32 y 2 iteraciones de potencia. Los factores de matriz se almacenan en BF16, mientras que los parches de vectores y bias se guardan en FP32. El script de extracción procesa un tensor a la vez para evitar cargar simultáneamente los dos checkpoints de 40 GB en memoria. El repositorio incluye seis archivos de adaptador (tres rangos por cada dirección) y los scripts de extracción e inversión.

El modelo base MiniMax-H3 es un sistema generativo omni-modal que utiliza una arquitectura de transformador con capacidad para procesar y generar texto, imagen, video y audio. No se han publicado detalles adicionales sobre la arquitectura interna en la información disponible.

## Capacidades

- Los adaptadores no han sido probados en generación, por lo que no se pueden afirmar capacidades concretas más allá de las del modelo base MiniMax-H3.
- Diseñados para transferir el comportamiento entre las variantes podadas FL2VA y Ref2VA, pero sin garantía de calidad ni de preservación de capacidades.
- Compatibles con ComfyUI como adaptadores de modelo (model-only LoRA), aplicables mediante el cargador de LoRA estándar.
- Soporte de carga estructural validado: los seis archivos cargan 531 parches esperados (264 adaptadores de matriz y 267 parches exactos de vector/bias).
- El modelo base MiniMax-H3, al que se aplican, es capaz de comprender multimodalidad (texto, imagen, video, audio) y generar video con audio estéreo nativo hasta 2K y 15 segundos.
- No se ha verificado el soporte de tool calling, agentes u otras capacidades avanzadas en estos adaptadores.

## Casos de uso

- Investigación en adaptación de modelos sin entrenamiento: estos adaptadores permiten estudiar cómo la diferencia de pesos entre dos variantes de un mismo modelo afecta al comportamiento generativo, sin necesidad de reentrenar.
- Experimentación en ComfyUI: los usuarios pueden cargar los adaptadores en ComfyUI y probar diferentes intensidades (0.25, 0.5, 0.75, 1.0) sobre el checkpoint base correspondiente para observar efectos cualitativos.
- Exploración de interpolación entre variantes: al ajustar la fuerza del adaptador, se puede explorar un espectro de comportamientos entre FL2VA y Ref2VA, aunque el autor advierte que la interpolación no aísla una capacidad semántica limpia.
- Validación de técnicas de extracción mecánica: el repositorio sirve como caso de estudio para evaluar si aproximaciones SVD de diferencias de pesos pueden transferir comportamiento de manera útil.
- Desarrollo de pipelines de investigación en generación de video y audio: si se logra un comportamiento aceptable, podría usarse para ajustar finamente el estilo o las capacidades de MiniMax-H3 sin entrenamiento.
- Pruebas de compatibilidad y rendimiento de adaptadores en ComfyUI: el repositorio incluye scripts y documentación para reproducir la extracción, lo que permite a otros investigadores replicar el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de calidad de generación, ni comparaciones con otros adaptadores o modelos. Se recomienda realizar pruebas de generación con prompts, entradas, semillas y configuraciones de muestreo idénticas para evaluar el comportamiento real.

## Requisitos de hardware

- Los adaptadores tienen tamaños de 2.589 GB (rank 256), 5.075 GB (rank 512) y 10.048 GB (rank 1024) en formato safetensors.
- Para aplicar un adaptador se necesita cargar el checkpoint base correspondiente (pruned FL2VA o pruned Ref2VA, ambos de aproximadamente 40 GB en BF16) más la VRAM adicional para el adaptador.
- Se recomienda una GPU con al menos 48 GB de VRAM para el modelo base (por ejemplo, A6000, A100 40GB/80GB, H100), más la VRAM adicional del adaptador. En la práctica, se necesitaría una GPU con más de 50 GB de VRAM para el rank 1024.
- No se indica compatibilidad con GPUs de consumo (como RTX 4090 de 24 GB) para el modelo base completo; los adaptadores por sí solos cabrían, pero el modelo base no.
- Opciones de despliegue: ComfyUI es el entorno principal soportado. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que estos adaptadores son específicos para el ecosistema ComfyUI.
- Latencia y throughput: no disponibles. Dependen del hardware y del modelo base.

## Comparativa con modelos similares

No disponible. No se han encontrado adaptadores comparables en la información proporcionada. Este repositorio es un caso único de extracción mecánica de deltas de pesos entre variantes de MiniMax-H3, sin equivalente directo en otros modelos.

## Limitaciones y advertencias

- Altamente experimental: los adaptadores no han sido probados en generación; se esperan artefactos, pérdida de capacidades o comportamiento impredecible.
- Solo compatibles con los checkpoints podados en BF16 específicos (FL2VA y Ref2VA). No funcionan con las versiones completas, FP8 o INT8.
- La aproximación SVD no captura completamente la diferencia de pesos; el rank 256 retiene solo un 14.32% de energía mediana en las matrices comprimidas, y el rank 1024 un 46.11%. Esto puede traducirse en pérdida significativa de fidelidad.
- No se deben apilar rangos ni direcciones opuestas; son formas alternativas del mismo delta subyacente.
- La licencia MiniMax H3 Community License Agreement incluye restricciones territoriales, condiciones de redistribución y limitaciones de uso. Es obligatorio revisar la licencia antes de usar o redistribuir.
- El repositorio no incluye información sobre sesgos, alucinaciones o limitaciones de idioma, ya que no se ha evaluado el comportamiento generativo.
- No apto para producción: su uso se limita a investigación y experimentación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ethanfel/MiniMax-H3-Pruned-Ref2VA-Delta-LoRAs-Experimental
- GitHub oficial de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- Lista de recursos Awesome MiniMax-H3: https://github.com/wildminder/awesome-minimax-H3
- Sitio informativo sobre archivos y descargas de MiniMax-H3: https://minimaxh3.run/minimax-h3-model-files-downloads
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
