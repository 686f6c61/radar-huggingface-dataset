# KimOoO22/ffa-net-ms2-fog-rgb-denseft

## Resumen

FFA-Net (Feature Fusion Attention Network) es una red neuronal convolucional para la eliminación de niebla (dehazing) en imágenes RGB. Este checkpoint concreto, publicado por el usuario KimOoO22, es un ajuste fino (fine-tune) sobre un modelo previo del mismo autor (`KimOoO22/ffa-net-ms2-fog-rgb`), orientado a escenas con niebla densa. El modelo parte de un warm start y se entrena con la función de pérdida original de FFA-Net, sin componente GAN.

El problema que resuelve es la restauración de imágenes degradadas por niebla, un paso previo habitual en pipelines de visión por computador (detección de objetos, segmentación, conducción autónoma, vigilancia). El ajuste fino busca mejorar el rendimiento en casos de niebla densa sin degradar el rendimiento en escenas con niebla ligera, mediante un criterio de selección de época basado en "puertas" (gates) sobre el conjunto de validación en lugar de la pérdida de entrenamiento.

La información pública es muy limitada: el repositorio tiene 0,0 GB, no se declara licencia, pipeline ni idiomas, y no se han publicado resultados de benchmarks estándar. Los únicos datos de rendimiento provienen de la propia model card del autor, medidos sobre sus propios splits de test.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FFA-Net (CNN con bloques FFABlock y fusión de características por atención) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (pesos en `.pth` de PyTorch) |
| Idiomas soportados | no aplica (procesa imágenes, no texto) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (state_dict de PyTorch, `ffa_net_best.pth`) |

## Arquitectura y entrenamiento

La arquitectura es FFA-Net tal como se implementa en el cuaderno del autor: `ConvBlock` seguido de seis `FFABlock` y una cola con activación sigmoide. El flag `attn=False` indica que en este checkpoint no se activa el mecanismo de atención opcional. Es una red puramente convolucional orientada a restauración de imagen, no un transformer ni un modelo generativo de texto.

El entrenamiento parte de un warm start desde `KimOoO22/ffa-net-ms2-fog-rgb` y aplica un ajuste fino con tasa de aprendizaje baja (LR=2e-05) sobre una combinación de dos conjuntos: `ms2_fog_v5` (escenas con niebla "antigua"/ligera) y `ms2_fog_dense` (niebla densa), con `DENSE_REPEAT=1`. Se usan 7 épocas, batch size 8, sin GAN, con la misma `ffa_loss` original y un split temporal 70/15/15. La época final (la 6) se selecciona mediante puertas sobre validación: que la caída de rendimiento en escenas antiguas no supere 0,3 y que la mejora en escenas densas sea al menos 0,5.

## Capacidades

- Eliminación de niebla en imágenes RGB (dehazing) con salida de imagen restaurada.
- Mejora específica en escenas con niebla densa, manteniendo el rendimiento en niebla ligera.
- Procesamiento de imágenes estáticas; no hay soporte de vídeo declarado explícitamente.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de texto: es un modelo exclusivamente de visión.
- No dispone de modo "thinking", visión multimodal ni audio.

## Casos de uso

- Preprocesado en pipelines de conducción autónoma: aplicar el modelo a fotogramas con niebla antes de la detección de peatones o señales, aprovechando su mejora medida en escenas densas (PSNR 25,01 frente a 12,43 de la entrada con niebla).
- Vigilancia y videovigilancia en exteriores: restaurar imágenes de cámaras fijas en condiciones de niebla para mejorar la legibilidad y el análisis posterior.
- Drones y fotografía aérea: limpiar imágenes capturadas en altitud con niebla para tareas de mapeo o inspección.
- Preprocesado para segmentación semántica: usar la salida del modelo como entrada a redes de segmentación en escenarios meteorológicos adversos.
- Restauración fotográfica: mejora de imágenes de archivo o de aficionados tomadas con niebla densa.
- Dataset augmentation y evaluación: generar pares niebla/imagen limpia para entrenar o validar otros modelos de dehazing.

## Benchmarks y rendimiento

Los únicos datos disponibles son los reportados por el autor en la model card, medidos sobre sus propios splits de test (no son benchmarks estándar comparables):

| Split | PSNR entrada con niebla | PSNR modelo | SSIM |
|---|---|---|---|
| Antiguo (2292 imágenes) | 15,5340 | 27,5951 | 0,8587 |
| Denso (1528 imágenes) | 12,4278 | 25,0141 | 0,7925 |

Puertas de selección sobre test: caída en escenas antiguas de -0,4187 (criterio ≤ 0,3, PASS) y ganancia en densas de 1,1858 (criterio ≥ 0,5, PASS). Referencia de PSNR para escenas antiguas: 27,1765.

No se han publicado resultados de benchmarks estándar (SOTS, RESIDE, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al ser una CNN de restauración de imagen, la memoria depende de la resolución de entrada y del tamaño del lote, no del número de parámetros (que no se declara).
- GPU recomendadas: no disponibles. Cualquier GPU con soporte CUDA y PyTorch es compatible.
- Compatibilidad con GPU de consumo: probablemente sí (RTX 3060/4090 y similares), dado que es una CNN de dehazing, aunque no hay datos confirmados.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` + `model.eval()`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FFA-Net (este checkpoint) | CNN dehazing | no aplica | no disponible | Hugging Face, 0 descargas |
| FFA-Net original (paper) | CNN dehazing | no aplica | según paper | Repositorio académico |
| Otros modelos de dehazing (p. ej. AOD-Net, DCP) | CNN / prior clásico | no aplica | variable | Repositorios públicos |

No se dispone de datos de rendimiento comparables entre alternativas en la información proporcionada; la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni evidencia de uso en producción.
- Tamaño de repo de 0,0 GB: los pesos podrían no estar realmente subidos o ser de tamaño despreciable; conviene verificar antes de usarlo.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Sin pipeline declarado en Hugging Face: no hay integración automática con `transformers` ni `diffusers`.
- Los resultados de PSNR/SSIM son sobre splits propios del autor, no sobre benchmarks estándar; no son comparables con literatura.
- Riesgo de sobreajuste al dominio de entrenamiento (`ms2_fog_v5` y `ms2_fog_dense`); el rendimiento en otros tipos de niebla o sensores no está evaluado.
- No hay información sobre sesgos, alucinaciones (no aplica en el sentido de texto) ni restricciones de idioma (no aplica).
- La selección de época por "puertas" en validación puede no generalizar a otros conjuntos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KimOoO22/ffa-net-ms2-fog-rgb-denseft
- Modelo base (warm start): https://huggingface.co/KimOoO22/ffa-net-ms2-fog-rgb
- Paper original de FFA-Net: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demos: no disponibles en la información proporcionada
