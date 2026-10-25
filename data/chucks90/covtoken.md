# Chucks90/covtoken

## Resumen

covtoken (ID `Chucks90/covtoken`) no es un modelo con pesos publicados, sino un artefacto de investigación: código, evaluación con compuertas (gates) y un borrador de artículo sobre una técnica de poda de tokens sin etiquetas aplicada a transformers de visión médicos auto-supervisados y congelados. Lo publica el usuario Chucks90 bajo licencia MIT, con fecha de creación 2026-06-20 y última actualización 2026-10-24, y el repositorio ocupa 0,0 GB porque no distribuye checkpoints.

La contribución principal, tal y como el autor la reformula en `gate_reports/SUMMARY.md`, es un subespacio de lesión libre de etiquetas que aparece en capas intermedias: la AUROC de localización pasa de 0,565 en la capa final a 0,871 en el bloque 3 del backbone, y generaliza a TC de pulmón (0,87), riñón (0,82) y ecografía mamaria (0,73). A ello se suman una poda por pertenencia (membership pruning) que supera a la poda por saliencia en falsos negativos de lesiones pequeñas, un certificado de retención conformal con cobertura empírica 0,978 frente a la nominal 0,90, y un enrutado de profundidad por lesión que reporta 1,6× FLOPs manteniendo el 98 % de sensibilidad en lesiones pequeñas.

El interés ahora mismo es metodológico: el autor documenta explícitamente el objetivo original ("coverage-constrained optimization con dual interpretable") como un resultado negativo limpio (recall de lesión pequeña 0,22 frente a 0,82 de la poda por pertenencia) y conserva las compuertas fallidas, las hipótesis refutadas y un error de datos corregido. Es material para investigadores que quieran replicar el protocolo o construir encima, no un modelo listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo único: método de poda de tokens sobre backbones ViT-B/16 congelados (MedDINOv3 para TC, DINOv2-base para ecografía); componentes propios `conformal_head`, `routed_depth` y `volumetric` |
| Parametros totales | No disponible (el repositorio no publica pesos). El backbone es un ViT-B/16 externo; la variante estándar ViT-B/16 ronda los 86 M de parámetros, dato no confirmado en la información proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible. La unidad de cómputo es el token de parche; el banco de tokens cacheado contiene 2,1 M tokens de TC |
| Tipos de cuantizacion | No disponible (no se publican pesos ni recetas de cuantización) |
| Idiomas soportados | No aplica (modelo de visión); no se reporta procesamiento de texto |
| Licencia | MIT |
| Formato de pesos | No se distribuyen pesos (tamaño del repo 0,0 GB). Código PyTorch; el backbone se instala en tiempo de ejecución desde `github.com/facebookresearch/dinov3` y los pesos HF de MedDINOv3 / DINOv2 |

## Arquitectura y entrenamiento

El estudio parte de un backbone totalmente congelado: `ricklisz123/MedDINOv3-ViTB-16-CT-3M` para TC y `facebook/dinov2-base` para ecografía. No hay ajuste fino end-to-end; los embeddings se codifican una sola vez en un banco de tokens cacheado (2,1 M tokens de TC) y todas las sondas se ejecutan sobre esa caché. El autor asume explícitamente que esto sacrifica la adaptación completa a cambio de poder lanzar decenas de sondas controladas con recursos de una sola persona, sin clúster institucional y con los DICOM de LIDC-IDRI (unos 124 GB) en streaming desde almacenamiento de bucket.

El protocolo se organiza en siete compuertas (0 a 6) con umbrales fijados antes de la ejecución en `configs/thresholds.lock.json` y un informe por compuerta en `gate_reports/`. Hallazgos técnicos relevantes: el pico de señal de lesión en capa intermedia correlaciona con la invariancia a la vista (ρ = −0,94 con AUROC) y no con la pérdida de información espacial; la hipótesis de baja rankitud fue refutada por análisis espectral (los tokens de lesión importan por su rareza, no por redundancia); y la compuerta 5 —selección de tokens por vista durante el preentrenamiento— no se ejecutó, por lo que el método se aplica solo en inferencia. Antes de fiarse de ningún resultado se reconstruyeron todas las máscaras de parche desde DICOM-SEG porque el manifiesto original no alineaba las posiciones de nódulo bajo ningún orden de cortes.

## Capacidades

- Localización de lesiones sin etiquetas en capas intermedias de un ViT auto-supervisado congelado (AUROC 0,871 en bloque 3 en TC de pulmón).
- Transferencia de dominio del subespacio de lesión entre anatomías (pulmón, riñón) y modalidades (TC y ecografía).
- Poda de tokens por pertenencia a un subespacio, con mejor tasa de falsos negativos en lesiones pequeñas que la poda por saliencia de atención.
- Certificado de retención conformal por imagen, con cobertura empírica 0,978 frente a la nominal 0,90.
- Enrutado de profundidad por lesión: 1,6× FLOPs manteniendo el 98 % de sensibilidad en lesiones pequeñas.
- Evaluación estadística integrada: DeLong, bootstrap emparejado y Spearman, con intervalos de confianza al 95 % sobre datos held-out.
- Guarda anti-fuga de etiquetas en integración continua (`tests/test_label_leak.py`), que rompe el build si una etiqueta toca la construcción del subespacio.
- No soporta tool calling, agentes, razonamiento multi-paso, texto ni audio: es un pipeline de visión médica.

## Casos de uso

- Investigación en interpretabilidad de foundation models médicos: usar el subespacio de lesión en el bloque 3 como sonda congelada para estudiar dónde se codifica la patología en un ViT, sin entrenar ni etiquetar, aprovechando que el banco de tokens evita recalcular embeddings.
- Pretriaje y auditoría de TC torácico a escala: codificar los DICOM una vez en un banco de tokens y ejecutar la poda por pertenencia para priorizar cortes con sospecha de nódulo antes de la lectura radiológica.
- Reducción de coste de inferencia en pipelines de imagen médica: el enrutado de profundidad por lesión ofrece 1,6× FLOPs con el 98 % de sensibilidad en lesiones pequeñas, útil cuando el cuello de botella es el cómputo por estudio.
- Validación con garantías estadísticas: el certificado de retención conformal (cobertura 0,978 ≥ 0,90 nominal) permite reportar cotas de cobertura por imagen en entornos de investigación regulada o en la documentación de un estudio clínico.
- Transferencia a ecografía mamaria con bajo coste de adaptación: el mismo subespacio construido sobre DINOv2-base alcanza 0,73 de AUROC en BUSI frente a 0,49 de la saliencia de atención, lo que sirve para prototipar cribado asistido en modalidades con menos datos etiquetados.
- Docencia y metodología de investigación: el repositorio conserva compuertas fallidas, umbrales bloqueados y un informe de resultado negativo reutilizable como plantilla para diseñar estudios con criterios de parada pre-registrados.
- Benchmark interno de métodos de poda de tokens: comparar poda por pertenencia, por saliencia y por cobertura sobre LIDC-IDRI, KiTS23 y BUSI con el mismo esqueleto de evaluación estadística.

## Benchmarks y rendimiento

Resultados publicados en la model card (AUROC y puntos porcentuales; no hay MMLU, HumanEval ni GSM8K porque no es un modelo de lenguaje).

| Metrica | Resultado | Contexto |
|---|---|---|
| AUROC de lesión, capa final | 0,565 | Señal débil; por debajo de la saliencia de atención (0,767) |
| AUROC de lesión, bloque 3 | 0,871 | Pico en capa intermedia; supera el umbral bloqueado |
| Densidad-A, TC de pulmón | 0,87 | Backbone de TC (MedDINOv3) |
| Densidad-A, riñón | 0,82 | Transferencia entre anatomías |
| Densidad-A, ecografía mamaria | 0,73 (DINOv2) / 0,49 (atención) | Cambio de modalidad y de backbone |
| Pertenencia vs. saliencia, LIDC | +27,6 / +15,8 puntos | Reducción de falsos negativos en lesión pequeña |
| Pertenencia vs. saliencia, KiTS23 | +7,4 puntos | — |
| Pertenencia vs. saliencia, BUSI | +13,8 / +19,0 puntos | — |
| Certificado conformal de retención | Cobertura empírica 0,978 ≥ nominal 0,90 | Por imagen |
| Enrutado de profundidad por lesión | 1,6× FLOPs a 98 % de sensibilidad | Lesiones pequeñas |
| Resultado negativo (cobertura) | Recall de lesión pequeña 0,22 vs. 0,82 (pertenencia) | Objetivo original falsificado |
| Invariancia a la vista vs. AUROC | ρ = −0,94 | El pico de capa intermedia sigue la invariancia, no la pérdida de información espacial |

## Requisitos de hardware

- VRAM para inferencia: no reportada por el autor. Estimación orientativa (no publicada): los pesos de un ViT-B/16 en fp16 rondan los 170 MB y en fp32 los 344 MB; el consumo real lo dominan el banco de embeddings y el procesamiento volumétrico, no el backbone.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más sirve para inferencia por lotes pequeños sobre el backbone congelado. Para reconstruir el banco de tokens a escala LIDC-IDRI (unos 124 GB de DICOM en streaming) conviene A100 o H100 en trabajos cloud.
- Cabe en GPU consumer: sí, en principio, al tratarse de un ViT-B/16 congelado; no hay cifras oficiales de memoria ni de latencia.
- Opciones de despliegue: PyTorch como runtime, `transformers` para DINOv2, código de DINOv3 instalado desde `github.com/facebookresearch/dinov3`, y Hugging Face Jobs para orquestar materialización de máscaras, construcción de bancos y compuertas. vLLM, llama.cpp, Ollama y TGI no aplican (no es un modelo generativo de texto).
- Latencia y throughput: no disponibles; el único dato de coste computacional publicado es el 1,6× FLOPs del enrutado de profundidad.

## Comparativa con modelos similares

La información proporcionada no incluye comparaciones con líneas base publicadas de poda de tokens (ToMe, EViT, DynamicViT) ni con otros foundation models médicos, así que la comparación disponible es interna al propio estudio.

| Método de selección | Recall de lesión pequeña | AUROC de lesión | Notas |
|---|---|---|---|
| Pertenencia a subespacio (covtoken) | 0,82 | 0,871 (bloque 3) | Método propuesto; mejor en lesiones pequeñas |
| Saliencia de atención | No disponible | 0,767 (capa final) | Línea base del propio estudio |
| Cobertura restringida (objetivo original) | 0,22 | No disponible | Resultado negativo documentado |
| ToMe / EViT / DynamicViT | No disponible | No disponible | Sin comparación en la información disponible |
| MedDINOv3 ViT-B/16 (backbone) | No aplica | No disponible de forma aislada | Licencia del backbone no verificada en esta ficha |
| DINOv2-base (backbone) | No aplica | No disponible de forma aislada | Usado aquí para ecografía |

## Limitaciones y advertencias

- No es un modelo desplegable: el repositorio no contiene pesos (0,0 GB); es código, informes de compuertas y un borrador de artículo.
- La contribución central fue reformulada: el objetivo original de optimización con cobertura restringida se reporta como resultado negativo (recall 0,22 frente a 0,82), lo que invalida el enfoque inicial para lesiones pequeñas.
- Dependencia de la profundidad: la señal útil está en el bloque 3 y desaparece en la capa final (0,565), por lo que el método es sensible a la elección de capa y probablemente al backbone.
- La compuerta 5 no se ejecutó: no se sabe si la selección de tokens por vista durante el preentrenamiento rompería la invariancia auto-supervisada. El método se limita a inferencia.
- Sin validación clínica prospectiva ni aprobación regulatoria: los resultados son sobre datos held-out de LIDC-IDRI, KiTS23, MSD Task03 Liver, MSD Task07 Pancreas y BUSI, con intervalos de confianza al 95 %, no sobre cohorts clínicas.
- Historial de error de datos: el manifiesto original no alineaba las posiciones de nódulo con las máscaras DICOM-SEG y hubo que reconstruir todas las máscaras; conviene auditar la procedencia de etiquetas en cualquier reutilización.
- Sesgos: no se reporta análisis de sesgo por población, equipo de adquisición ni sitio; los conjuntos son limitados y mayoritariamente públicos.
- Restricciones de licencia: el código es MIT y permite uso comercial, pero los backbones (MedDINOv3 y DINOv2) y los datasets tienen licencias propias que no se detallan en la información disponible y deben verificarse por separado.
- Reproducibilidad dependiente de infraestructura: los experimentos se ejecutaron como Hugging Face Jobs con datos en bucket, y el código de DINOv3 se instala en tiempo de ejecución, no se vendoriza.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de sobreinterpretar AUROC de sondas lineales como capacidad diagnóstica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Chucks90/covtoken
- Backbone de TC (MedDINOv3 ViT-B/16): https://huggingface.co/ricklisz123/MedDINOv3-ViTB-16-CT-3M
- Backbone de ecografía (DINOv2-base): https://huggingface.co/facebook/dinov2-base
- Código de DINOv3: https://github.com/facebookresearch/dinov3
- Dataset LIDC-IDRI (TCIA): https://www.cancerimagingarchive.net/collection/lidc-idri/
- KiTS23: https://kits-challenge.org/
- Medical Segmentation Decathlon (Task03 Liver, Task07 Pancreas): http://medicaldecathlon.com/
- BUSI (Breast Ultrasound Images): https://www.kaggle.com/datasets/aryashah2k/breast-ultrasound-images-dataset
- Documentos internos del repositorio citados: `gate_reports/SUMMARY.md`, `gate_reports/NEGATIVE_RESULT.md`, `gate_reports/gate_1_postmortem.md`, `configs/thresholds.lock.json`, `paper/working_draft.md`, `research_v3/SUMMARY.md`, `research_v4/rarity_route_derivation.md`
