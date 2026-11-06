# aicentreflip/tutorials-brain-mri-latent-diffusion

## Resumen

Este repositorio aloja los modelos de dos tutoriales de generación de imágenes de resonancia magnética cerebral del proyecto FLIP (Federated Learning Interoperability Platform) del London AI Centre. No es un modelo de lenguaje, sino un par de modelos de visión 3D para imagen médica: un autoencoder volumétrico (MONAI `AutoencoderKL`, 21,0 M de parámetros) que comprime un volumen de RM cerebral a un latente pequeño, y un modelo de difusión latente 3D (MONAI `DiffusionModelUNet`, 49,3 M de parámetros) que genera nuevos volúmenes en ese espacio latente condicionado a la secuencia de RM (FLAIR, T1w, T1Gd, T2w).

El interés técnico está en el pipeline federado: cada modelo se entrenó con NVIDIA FLARE simulando dos sitios sobre una única GPU, lo que sirve como referencia reproducible de aprendizaje federado aplicado a imagen médica. La versión recomendada es `v3.1` para el autoencoder (SSIM de 0,823 en 40 pacientes retenidos) y `v3.1_ldm` para el modelo de difusión entrenado sobre él (MMD² de 0,053, precisión de 0,96).

Es material de tutorial, entrenado sobre un conjunto de investigación público pequeño (321 estudios de entrenamiento, 40 pacientes retenidos) y explícitamente no apto para uso clínico. Su valor es didáctico y de reproducibilidad, no de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder 3D KL (MONAI `AutoencoderKL`) y UNet de difusión latente 3D (MONAI `DiffusionModelUNet`) |
| Parámetros totales | 21,0 M (autoencoder); 49,3 M (modelo de difusión) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada volumétrica de 96×112×80 a 2 mm (v3.1) o 96³ (v1) |
| Tipos de cuantización | no disponible (pesos publicados en float32 tal como se entrenaron) |
| Idiomas soportados | no aplica (modelo de imagen médica) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (`autoencoder.safetensors`, `diffusion_model.safetensors`) más `*_config.yaml` |

## Arquitectura y entrenamiento

El autoencoder es un `AutoencoderKL` 3D de MONAI con 3 u 8 canales latentes según versión; la geometría de referencia de `v3.1` es de 2 mm con padding/crop a 96×112×80, lo que preserva la forma del cerebro frente al aplastamiento a 96³ de `v1`. El entrenamiento combina pérdida de reconstrucción L1, una pérdida perceptual basada en un ResNet-50 de MedicalNet, un peso KL muy pequeño (1e-8) y una pérdida adversarial least-squares de un discriminador de parches 3D (no publicado). Las versiones `v1.1`, `v2.1` y `v3.1` entrenan en bfloat16; `v1`, `v2` y `v3` usaron float16.

El modelo de difusión es un UNet 3D que opera en el latente del autoencoder congelado (8×24×28×20 en `v3.1_ldm`), condicionado a la secuencia de RM. Se entrenó 5 rondas × 60 épocas (300 épocas) sobre los mismos 321 estudios, con tasa de aprendizaje de 1e-4 a 1e-6. Todo el entrenamiento fue federado con NVIDIA FLARE simulando dos sitios en una sola GPU; los tiempos de pared van de 5 h 15 min a 12 h 28 min según la ejecución. El repositorio publica procedencia completa (commit, comando de lanzamiento, versiones, hardware) y el código exacto de cada ejecución.

## Capacidades

- Compresión y reconstrucción de volúmenes de RM cerebral 3D a un latente de baja dimensión (3 u 8 canales).
- Generación de volúmenes sintéticos de RM cerebral condicionada a secuencia (FLAIR, T1w, T1Gd, T2w).
- Reconstrucción con calidad medida por SSIM intra-cerebral a 1 mm (0,823 global en `v3.1`; por secuencia: FLAIR 0,786, T1w 0,844, T1Gd 0,832, T2w 0,830).
- Generación con realismo y cobertura medidos sobre características de MedicalNet ResNet-50.
- Entrenamiento federado reproducible con NVIDIA FLARE (dos sitios simulados).
- No soporta tool calling, agentes, texto, visión 2D natural ni capacidades multilingües.

## Casos de uso

- Docencia e investigación en aprendizaje federado: reproducir el pipeline de dos sitios con FLARE sobre una sola GPU y comparar las seis variantes de autoencoder publicadas con sus puntuaciones.
- Estudio de autoencoders volumétricos: usar `v3.1` como referencia de compresión latente de RM cerebral y evaluar el efecto de la geometría (96³ frente a 2 mm 96×112×80) sobre SSIM.
- Generación sintética de datos de aumento: producir volúmenes condicionados por secuencia para aumentar conjuntos pequeños en experimentos de segmentación o clasificación, siempre fuera de ámbito clínico.
- Investigación en privacidad de datos médicos: emplear el esquema federado como base para estudiar qué se puede entrenar sin centralizar imágenes de pacientes.
- Evaluación de métricas generativas en imagen médica 3D: reutilizar los scripts de `evaluation/` (MMD², precisión/recall con k-NN k=3, sonda logística de secuencia) como banco de pruebas.
- Prototipado de pipelines MONAI: integrar los `*_config.yaml` y los pesos en flujos de MONAI para experimentar con difusión latente 3D antes de escalar a datasets mayores.

## Benchmarks y rendimiento

Autoencoders, SSIM intra-cerebral a 1 mm sobre 40 pacientes retenidos (160 volúmenes):

| Versión | Geometría | Canales latentes | SSIM a 1 mm | Tiempo de pared |
|---|---|---|---|---|
| v1 | 96³ | 3 | 0,683 | 7 h 09 min |
| v1.1 | 96³ | 3 | 0,723 | 11 h 47 min |
| v2 | 2 mm, 96×112×80 | 3 | 0,699 | 6 h 49 min |
| v2.1 | 2 mm, 96×112×80 | 3 | 0,776 | 12 h 25 min |
| v3 | 2 mm, 96×112×80 | 8 | 0,765 | 6 h 14 min |
| v3.1 | 2 mm, 96×112×80 | 8 | 0,823 | 12 h 28 min |

Modelos de difusión latente, 160 volúmenes generados frente a 40 pacientes retenidos:

| Modelo | Autoencoder | MMD² ↓ | Precisión ↑ | Recall ↑ | Sonda de secuencia ↑ | Malformados a ojo ↓ | Tiempo |
|---|---|---|---|---|---|---|---|
| v2_ldm | v2 | 0,111 | 0,91 | 0,77 | 0,506 | 7/160 | 5 h 15 min |
| v3_ldm | v3 | 0,070 | 0,91 | 0,81 | 0,625 | 5/160 | 5 h 15 min |
| v2.1_ldm | v2.1 | 0,130 | 0,88 | 0,78 | 0,463 | 14 (+10 borderline)/160 | 5 h 16 min |
| v3.1_ldm | v3.1 | 0,053 | 0,96 | 0,78 | 0,650 | 4 (+3 borderline)/160 | 5 h 35 min |
| Referencia: escaneos retenidos | — | — | 0,88 | 0,93 | 0,894 | — | — |
| Referencia: reconstrucciones v3.1 | — | −0,019 | — | 0,92 | 0,825 | — | — |

## Requisitos de hardware

- El entrenamiento federado se ejecutó simulando dos sitios en una sola GPU; el hardware exacto figura en cada `provenance.json` del repositorio.
- El tamaño total del repositorio es de 1,3 GB, dominado por los pesos en float32 y las figuras; la inferencia de un modelo de 21 M o 49,3 M de parámetros es ligera en VRAM.
- Cabe con holgura en GPU de consumo actuales (RTX 3090, RTX 4090 y similares), dado el reducido número de parámetros y el volumen de entrada de 96×112×80.
- Despliegue mediante la librería MONAI (declarada como `library_name`), cargando `autoencoder.safetensors` con su `autoencoder_config.yaml` y `diffusion_model.safetensors` con el autoencoder congelado correspondiente.
- No se publican cifras de latencia ni throughput; los tiempos de pared disponibles corresponden al entrenamiento, no a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (v3.1 / v3.1_ldm) | 21,0 M + 49,3 M | RM cerebral 3D, difusión latente | CC BY-SA 4.0 | Hugging Face, pesos safetensors |
| Alternativas comparables de difusión latente 3D en imagen médica | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de modelos comparables con los que establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelos de tutorial entrenados sobre un conjunto público pequeño (321 estudios); no están validados para uso clínico y el autor lo advierte explícitamente.
- No generan tumores, pese a que todos los escaneos de entrenamiento contienen uno: la distribución aprendida no cubre patología, lo que limita cualquier uso en investigación oncológica.
- La sonda de secuencia de `v3.1_ldm` alcanza 0,650 frente a 0,894 en escaneos reales: el condicionamiento por secuencia es imperfecto.
- Entre 4 y 7 de cada 160 volúmenes generados se clasifican como malformados a simple vista, según el modelo.
- La cobertura (recall) queda en 0,78 frente a 0,93 de los escaneos reales, lo que indica menor diversidad que la población real.
- Licencia CC BY-SA 4.0: impone atribución y compartir bajo la misma licencia las obras derivadas, condición relevante para uso comercial.
- El discriminador adversarial empleado en el entrenamiento del autoencoder no está publicado.
- Ausencia de datos sobre sesgos demográficos, generalización entre equipos o robustez a distintos protocolos de adquisición.

## Enlaces

- Hugging Face: https://huggingface.co/aicentreflip/tutorials-brain-mri-latent-diffusion
- Repositorio FLIP: https://github.com/londonaicentre/FLIP
- Referencia arXiv 1904.00625: https://arxiv.org/abs/1904.00625
- Referencia arXiv 1902.09063: https://arxiv.org/abs/1902.09063
