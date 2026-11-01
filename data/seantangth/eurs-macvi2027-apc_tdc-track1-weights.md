# seantangth/EURS-MaCVi2027-APC_TDC-track1-weights

## Resumen

EURS-MaCVi2027-APC_TDC-track1-weights es un paquete de pesos publicado por el equipo APC_TDC para la fase de test del Track 1 del desafío EURS (Embedded Underwater Restoration and Segmentation), celebrado en el taller MaCVi de WACV 2027. No se trata de un modelo generativo ni de un LLM, sino de un conjunto de cuatro checkpoints orientados a dos tareas de visión por computador en entornos subacuáticos: restauración de imagen y segmentación semántica. El repositorio contiene únicamente el archivo `eurs_t1_weights.zip` (6.992.577.519 bytes, unos 7 GB), que debe descomprimirse en la carpeta `weights/` del repositorio GitHub del autor para reproducir el envío #19441 (`EURS_t1_sub046`).

La arquitectura combina tres maestros de segmentación y un restaurador. Dos de los maestros se basan en un backbone DINOv3 ViT-L/16 congelado (LVD-1689M) con adaptadores LoRA y una cabeza FPN de segmentación; el tercero es un Mask2Former Swin-L afinado desde `facebook/mask2former-swin-large-ade-semantic`. El restaurador es una NAFNet condicionada por tipo y nivel de agua. El paquete está pensado para reproducibilidad de un envío de competición, no como modelo de propósito general.

La relevancia es acotada pero clara para el nicho de visión subacuática: ofrece pesos ya entrenados para un pipeline de restauración más segmentación en imágenes de alta resolución (hasta 1024×1360), con licencias heredadas de los backbones (DINOv3 License y MIT para Mask2Former/Swin). No hay información sobre parámetros totales, contexto (no aplica), idiomas ni cuantizaciones, y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de 3 maestros de segmentación (2× DINOv3 ViT-L/16 + LoRA + FPN; 1× Mask2Former Swin-L) y 1 restaurador NAFNet condicionado |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible (checkpoints en `.pt`, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | dinov3-license (DINOv3 License) para los maestros DINOv3; MIT para Mask2Former/Swin; pesos propios del equipo sin licencia explícita separada |
| Formato de pesos | PyTorch `.pt` dentro de `eurs_t1_weights.zip` |
| Tamaño del repo | 7,0 GB |
| Resoluciones de entrada | 1024×1360 (teacher_exp066b), 768×1024 (teacher_exp083, teacher_exp078_m2f) |
| Hash del zip | SHA-256 `d6b101a67e5d5c454db9d20f74e3da5546d1e8347b7dc8940d6164884854bacd` |

## Arquitectura y entrenamiento

El pipeline se compone de cuatro checkpoints. `teacher_exp066b.pt` es un maestro de segmentación con backbone DINOv3 ViT-L/16 congelado, adaptadores LoRA y cabeza FPN, operando a 1024×1360. `teacher_exp083.pt` repite la misma arquitectura pero se entrena con etiquetas parciales y a 768×1024. `teacher_exp078_m2f.pt` es un Mask2Former Swin-L afinado desde el checkpoint ADE de Facebook, a 768×1024. `restorer_exp034.pt` es una NAFNet de restauración condicionada por tipo y nivel de agua, que preprocesa la imagen antes de la segmentación.

No se dispone de datos sobre el número de tokens de entrenamiento (no aplica), la composición exacta del dataset ni si hubo etapas de RLHF/DPO (no aplica a visión). La model card remite al `METHOD.md` del repositorio GitHub para el método completo y los datos de entrenamiento. La innovación técnica destacable es el uso de un backbone DINOv3 congelado con LoRA para adaptar representaciones de alta calidad a un dominio específico (subacuático) con coste de entrenamiento reducido, combinado con un restaurador condicionado por condiciones del agua y un ensemble de maestros heterogéneos (ViT+FPN y Mask2Former) para robustecer la segmentación.

## Capacidades

- Restauración de imágenes subacuáticas: corrección de color, contraste y degradación provocada por el medio acuático mediante NAFNet condicionada por tipo y nivel de agua.
- Segmentación semántica densa de escenas subacuáticas a alta resolución (hasta 1024×1360).
- Ensemble de maestros heterogéneos: combina predicciones de dos variantes DINOv3 ViT-L/16 con LoRA y FPN y un Mask2Former Swin-L.
- Manejo de etiquetas parciales: `teacher_exp083.pt` está entrenado con etiquetas parciales, lo que permite aprovechar anotaciones incompletas.
- Reproducibilidad de un envío de competición: los cuatro checkpoints permiten regenerar exactamente el envío `EURS_t1_sub046` mediante `run.py`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de resultados de competición: descomprimir `eurs_t1_weights.zip` en `weights/` y ejecutar `run.py` del repositorio GitHub para regenerar el envío #19441 del Track 1 de EURS, verificando los hashes SHA-256 de cada checkpoint.
- Monitorización de arrecifes y fondos marinos: usar el pipeline de restauración más segmentación para clasificar sustrato, fauna y vegetación en imágenes de vehículos submarinos, aprovechando la resolución de 1024×1360 del maestro principal.
- Inspección de infraestructura sumergida: aplicar la NAFNet de restauración para mejorar visibilidad en aguas turbias y después segmentar estructuras (tuberías, pilotes, cables) con el ensemble de maestros.
- Investigación en visión subacuática: emplear los checkpoints como línea base o punto de partida para fine-tuning con LoRA sobre nuevos datasets, dado que los backbones DINOv3 ya vienen adaptados al dominio.
- Análisis de imágenes de ROV/AUV en post-proceso: procesar lotes de capturas de robots submarinos para generar mapas de segmentación semántica que alimenten estudios de biodiversidad o mantenimiento predictivo.
- Evaluación comparativa de métodos de restauración: usar `restorer_exp034.pt` como referencia condicionada por tipo de agua para comparar contra otras técnicas de restauración en experimentos controlados.
- Docencia y divulgación: demostrar un pipeline completo de restauración más segmentación con pesos públicos y un script de inferencia reproducible, útil en cursos de visión por computador aplicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el zip ocupa 7 GB y contiene cuatro checkpoints en precisión completa, por lo que cargar los cuatro simultáneamente requiere del orden de 7 GB o más de memoria, y ejecutar el ensemble a 1024×1360 exige VRAM adicional para activaciones.
- GPU recomendadas: no especificadas por el autor; por el tamaño de los backbones (ViT-L/16 y Swin-L) y las resoluciones de entrada, se requiere una GPU de gama alta con al menos 16-24 GB de VRAM para inferencia cómoda, aunque este dato no está confirmado en la información proporcionada.
- ¿Cabe en GPU consumer? No confirmado. Los backbones ViT-L y Swin-L son grandes y las resoluciones de 1024×1360 generan activaciones voluminosas; es probable que requiera GPUs de gama alta, pero no hay datos oficiales.
- Opciones de despliegue: el autor proporciona un `run.py` en el repositorio GitHub; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). El formato es PyTorch `.pt`, por lo que la inferencia se haría con PyTorch estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EURS-MaCVi2027-APC_TDC-track1-weights | Ensemble restauración + segmentación subacuática | DINOv3 ViT-L/16 + LoRA + FPN; Mask2Former Swin-L; NAFNet | 1024×1360 y 768×1024 | dinov3-license / MIT | HuggingFace (7 GB) |
| Mask2Former Swin-L (ADE) | Segmentación semántica general | Swin-L | Hasta 768×1024 típicamente | MIT | HuggingFace |
| DINOv3 ViT-L/16 (LVD-1689M) | Backbone de visión auto-supervisado | ViT-L/16 | Variable | DINOv3 License | HuggingFace / Meta |
| NAFNet | Restauración de imagen | NAFNet | Variable | No disponible en la información | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; cualquier expectativa en ese sentido es incorrecta.
- Licencia restrictiva: los checkpoints DINOv3 están bajo la DINOv3 License, que puede imponer condiciones al uso comercial; es necesario revisar `LICENSES/DINOv3_LICENSE.md` antes de cualquier despliegue productivo.
- Los pesos propios del equipo (LoRA, decodificadores, cabezas y restaurador) no tienen una licencia explícita separada en la model card; conviene contactar con el autor para aclarar términos de uso.
- Riesgo de sobreajuste al dominio de competición: los maestros están entrenados para el dataset EURS y pueden degradarse en escenas subacuáticas con condiciones de agua, sensores o geografías distintas.
- Sin datos de benchmarks ni métricas publicadas: no es posible evaluar su rendimiento objetivo frente a alternativas sin ejecutar el pipeline.
- Repositorio sin descargas ni likes y creado recientemente: no hay evidencia de validación por parte de la comunidad.
- El pipeline depende de un repositorio GitHub externo (`run.py`, `METHOD.md`); si ese repositorio cambia o desaparece, la reproducibilidad se ve comprometida.
- El zip de 7 GB requiere espacio en disco y verificación de integridad mediante SHA-256 antes de su uso.
- No hay información sobre sesgos, alucinación (no aplica) ni limitaciones idiomáticas (no aplica).

## Enlaces

- HuggingFace: https://huggingface.co/seantangth/EURS-MaCVi2027-APC_TDC-track1-weights
- Repositorio GitHub del método e inferencia: https://github.com/seantangth/EURS-MaCVi2027-APC_TDC-track1
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Checkpoint base Mask2Former Swin-L ADE: https://huggingface.co/facebook/mask2former-swin-large-ade-semantic
