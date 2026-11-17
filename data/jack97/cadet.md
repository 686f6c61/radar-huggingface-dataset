# Jack97/CaDet

## Resumen

CaDet es un detector de vídeo generado por IA desarrollado por Jack97 (con autoría del paper a cargo de Ke Sun, Shuwei Li, Haiyang Mei y Mike Zheng Shou, del laboratorio ShowLab). El modelo aborda el problema de distinguir vídeo sintético de vídeo real, un reto creciente ante la proliferación de generadores de vídeo de alta calidad. Se presenta como el detector asociado al artículo "VAE Rhythm: Temporal Decoding Traces for AI-Generated Video Detection" (arXiv:2611.21114).

Técnicamente, CaDet no es un modelo generativo sino un clasificador binario construido sobre un backbone congelado DINOv3 ViT-L/16, al que se le acoplan dos rutas parametrizadas de bajo coste: una ruta de artefactos (adaptadores LoRA de rango 16 sobre las proyecciones qkv de atención) y una ruta semántica (ajuste tipo Effort sobre la componente singular más pequeña de las 96 proyecciones de atención). El modelo procesa 8 fotogramas por clip (índices 0, 4, ..., 28), recortados al centro y redimensionados a 256×256.

La relevancia del modelo reside en su enfoque de eficiencia paramétrica: los pesos entrenables suman apenas ~16 MB (ruta de artefactos) y ~0,8 MB (ruta semántica), manteniendo el backbone DINOv3 congelado. La puntuación final es una suma de z-scores, no una probabilidad, y el modelo está pensado para investigación forense y verificación de medios, no para decisiones automatizadas de alto impacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-L/16 congelado + rutas LoRA (rango 16) y ajuste SVD rank-1 sobre proyecciones de atención |
| Parámetros totales | No disponible (backbone DINOv3 ViT-L/16 no incluido en el repo; adaptadores ≈ 16 MB + 0,8 MB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8 fotogramas por clip (índices 0, 4, ..., 28); clips de menos de 29 fotogramas se rellenan repitiendo fotogramas |
| Tipos de cuantización | No disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (modelo de clasificación de vídeo, no lingüístico) |
| Licencia | dinov3-license (https://ai.meta.com/resources/models-and-libraries/dinov3-license/) |
| Formato de pesos | safetensors (adaptadores LoRA + cabezas; backbone descargado vía timm) |

## Arquitectura y entrenamiento

CaDet se construye sobre un backbone DINOv3 ViT-L/16 congelado (`facebook/dinov3-vitl16-pretrain-lvd1689m`), descargado automáticamente por `timm` como `vit_large_patch16_dinov3.lvd1689m` tras aceptar la licencia de DINOv3. Sobre este backbone se añaden dos rutas entrenables. La ruta de artefactos aplica LoRA de rango 16 sobre las proyecciones qkv de atención; se entrena con AIGVDBench más pares VAE (clips reales y copias que difieren solo por un ciclo de ida y vuelta por un VAE de vídeo). Una pasada hacia delante alimenta una cabeza genérica (ambos miembros del par contados como reales) y una cabeza de artefactos en los bloques 8, 12 y 16 (las copias VAE contadas como generadas). La ruta semántica aplica un ajuste tipo Effort sobre la componente singular más pequeña de cada una de las 96 proyecciones de atención, más una cabeza de 2 vías, entrenada solo con AIGVDBench.

La puntuación de vídeo es la suma de ambas rutas tras estandarizar cada una sobre vídeos reales de validación de AIGVDBench. Se trata de una suma de z-scores (≈ 0 para vídeos reales típicos, mayor cuanto más probable es que sea generado), no de una probabilidad. El repositorio incluye tres semillas de entrenamiento (`seed0/`, `seed1/`, `seed2/`), cada una con `artifact_path.safetensors` (LoRA + cabezas, ≈ 16 MB), `semantic_path.safetensors` (residuos SVD rank-1 + cabeza de 2 vías, ≈ 0,8 MB) y `calibration.json` (estadísticas de cabezas y fusión de la validación de AIGVDBench). Los pesos del backbone no se incluyen en el repo.

## Capacidades

- Detección de vídeo generado por IA mediante clasificación binaria (real vs. generado).
- Detección de artefactos de compresión VAE: la ruta de artefactos identifica trazas dejadas por el decodificador VAE del generador.
- Detección semántica: la ruta semántica captura patrones de contenido asociados a vídeo sintético independientemente de artefactos de compresión.
- Fusión de dos rutas mediante suma de z-scores estandarizados sobre vídeos reales de validación.
- Procesamiento de clips de 8 fotogramas (índices 0, 4, ..., 28), con relleno por repetición para clips cortos.
- Salida con desglose por ruta: `{'score': ..., 'z_semantic': ..., 'z_artifact': ...}`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un clasificador de vídeo, no un modelo de lenguaje).
- No incluye modo thinking, visión general ni audio; su dominio es exclusivamente la clasificación forense de vídeo.

## Casos de uso

- Verificación de medios periodísticos: el modelo puede puntuar un clip sospechoso y aportar un z-score como una pieza más de evidencia en un proceso de verificación, dado que distingue entre vídeo real y generado con AUROC del 93,9 % en el conjunto abierto de AIGVDBench.
- Moderación de contenido en plataformas: integrado como filtro previo que marque vídeos candidatos a revisión humana, reduciendo la carga de moderadores en volúmenes grandes de subidas.
- Investigación forense digital: análisis de material aportado como prueba, con desglose de las rutas semántica y de artefactos para entender qué señal activó la detección.
- Detección de deepfakes en campañas de desinformación: identificación de clips sintéticos distribuidos en redes sociales, con la cautela de que el modelo no ha caracterizado dominios como talking-heads o grabaciones de pantalla.
- Evaluación de generadores de vídeo: uso como benchmark interno para medir la fidelidad de nuevos generadores frente a detectores, comparando z-scores entre versiones de un mismo modelo generativo.
- Auditoría de datasets: filtrado de clips sintéticos que hayan podido colarse en conjuntos de datos de entrenamiento o evaluación de otros modelos.
- Análisis de cadena de custodia en entornos legales: generación de una puntuación objetiva reproducible (tres semillas disponibles) que complemente el peritaje humano, sin sustituirlo.

## Benchmarks y rendimiento

Resultados en AUROC (%), media de 3 semillas. Entrenado solo con clips Open-Sora de AIGVDBench y clips reales (más pares VAE para la ruta de artefactos); el resto de generadores son no vistos.

| Conjunto | AUROC (%) |
|---|---|
| AIGVDBench 20 open | 93,9 |
| 19 unseen open | 93,6 |
| 11 closed | 95,8 |
| 2026 closed (MiniMax H3, Seedance 2.0 / 2.5) | 88,3 |
| DF26 all | 78,5 |
| DF26 open | 78,2 |
| DF26 closed | 79,0 |
| DF26 paired 2AFC | 87,8 |

Añadir el complemento VAE Rhythm (phase scan, sin entrenamiento, ver repositorio de código) mejora los resultados en DF26.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3 GB en GPU CUDA (indicado en la model card para el uso con `CaDet`).
- GPU recomendadas: cualquier GPU CUDA con al menos ~3 GB de VRAM; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, con ~3 GB de VRAM es compatible con la mayoría de GPU consumer modernas.
- Opciones de despliegue: paquete `vae-rhythm[cadet]` instalable desde GitHub (`pip install "vae-rhythm[cadet] @ git+https://github.com/showlab/vae-rhythm"`), CLI `vae-rhythm predict` y API Python `CaDet`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks ni especificaciones de modelos comparables en la información disponible. La model card no incluye comparativas con otros detectores de vídeo generado por IA. No disponible.

## Limitaciones y advertencias

- La puntuación es una suma de z-scores, no una probabilidad; no debe interpretarse como tal.
- Los puntos de operación deben elegirse sobre vídeos reales del dominio de despliegue: la distribución de puntuaciones de vídeos reales varía entre fuentes (en el paper, cambiar la fuente real reduce el AUROC de todos los detectores entrenados).
- Vídeos muy recomprimidos, muy cortos, de muy baja resolución o editados son más difíciles de clasificar.
- El rendimiento no está garantizado en generadores publicados después de los datos de entrenamiento.
- Entrenado con AIGVDBench (clips reales de OpenVid); contenido fuera de esa distribución (por ejemplo, talking-heads en directo o grabaciones de pantalla) no ha sido caracterizado.
- No debe usarse la puntuación por sí sola para tomar decisiones de alto impacto sobre una persona o un vídeo.
- La licencia es `dinov3-license`, no una licencia open source estándar; el uso comercial está sujeto a los términos de la licencia de DINOv3 de Meta, que deben revisarse antes de cualquier despliegue en producción.
- El backbone DINOv3 no se incluye en el repositorio y requiere aceptar la licencia de DINOv3 en Hugging Face para su descarga vía `timm`.
- Riesgo de sesgo: no documentado en la información disponible; la dependencia de las fuentes de vídeo reales sugiere posible sensibilidad al dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jack97/CaDet
- Paper (arXiv): https://arxiv.org/abs/2611.21114
- Código: https://github.com/showlab/vae-rhythm
- Página del proyecto: https://showlab.github.io/vae-rhythm/
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Modelo base DINOv3: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
