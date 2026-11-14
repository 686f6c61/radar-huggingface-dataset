# dxvibe/vsr

## Resumen

dxvibe/vsr es un repositorio espejo (mirror) de pesos preentrenados para la eliminación automática de subtítulos en vídeo. No es un modelo único ni un modelo generativo de lenguaje, sino una colección empaquetada de pesos de terceros que cubren las dos fases del pipeline: detección de texto (PaddleOCR PP-OCRv5) e inpainting de vídeo (STTN, Big-LaMa y ProPainter). El autor, dxvibe, se limita a redistribuir los checkpoints originales para facilitar su descarga, sin aportar entrenamiento propio ni modificar los pesos.

El paquete resuelve un problema concreto de posproducción: eliminar los subtítulos quemados (hardcoded) de un vídeo reconstruyendo el fondo de forma temporalmente coherente, en lugar de recortar o enmascarar la zona. Combina un detector de texto por fotograma con modelos de inpainting que aprovechan información de fotogramas vecinos (atención temporal en STTN y ProPainter) o un prior de imagen fija (Big-LaMa) para rellenar las regiones enmascaradas.

La relevancia actual es práctica: agrupa en un único repositorio de 0,6 GB los pesos que normalmente hay que descargar de varios proyectos distintos, con atribuciones y licencias documentadas. Conviene subrayar que ProPainter está bajo NTU S-Lab License 1.0, restringida a uso no comercial, lo que condiciona cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Colección de modelos: STTN (transformer espacio-temporal), Big-LaMa (GAN con convoluciones dilatadas), ProPainter (inpainting de vídeo con flow completion y RAFT), PaddleOCR PP-OCRv5 (detección de texto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de visión/vídeo, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato nativo `.pth`/`.pt`) |
| Idiomas soportados | no disponible (la detección PP-OCRv5 `ch_det` está orientada a chino; el resto es independiente del idioma) |
| Licencia | Mixta: MIT / Apache-2.0 para STTN, Big-LaMa y PaddleOCR; NTU S-Lab License 1.0 (solo no comercial) para ProPainter |
| Formato de pesos | PyTorch (`.pth`, `.pt`) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo; agrupa checkpoints de cuatro proyectos upstream. STTN (Spatial-Temporal Transformer Network) emplea un transformer que atiende simultáneamente a parches espaciales del fotograma actual y a fotogramas vecinos, lo que permite rellenar la máscara con coherencia temporal. Big-LaMa es una red generativa con convoluciones dilatadas y un discriminador adversarial, pensada para inpainting de imagen fija con máscaras grandes. ProPainter añade a un inpainting de vídeo un módulo de flow completion y estimación de flujo óptico con RAFT, mejorando la consistencia en secuencias con movimiento. PaddleOCR PP-OCRv5 aporta el detector de texto (`ch_det` y `ch_det_fast`) que genera las máscaras de subtítulos.

No se dispone de información sobre volúmenes de datos de entrenamiento, composición de datasets ni técnicas de alineación (RLHF/DPO), ya que corresponden a los proyectos originales y no se detallan en la model card. La innovación práctica del repositorio es el empaquetado y la trazabilidad de licencias, no una aportación algorítmica.

## Capacidades

- Detección de regiones de subtítulo por fotograma mediante PP-OCRv5 (variantes `ch_det` y `ch_det_fast`).
- Inpainting de vídeo con coherencia temporal mediante STTN (modos `sttn-det` y `sttn-auto`).
- Inpainting de imagen con máscaras amplias mediante Big-LaMa.
- Inpainting de vídeo de mayor calidad con ProPainter, incluyendo estimación de flujo óptico (RAFT) y flow completion.
- Eliminación de subtítulos quemados en vídeos, reconstruyendo el fondo subyacente.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto.
- No es un modelo multimodal de propósito general: no describe imágenes ni responde a prompts.

## Casos de uso

- Restauración de material de archivo: eliminar subtítulos incrustados en grabaciones antiguas antes de reeditarlas o doblarlas, usando STTN o ProPainter para reconstruir el fondo de forma temporalmente coherente.
- Localización de contenido: quitar los subtítulos originales de un vídeo para superponer nuevos subtítulos en otro idioma sin que se vean los anteriores.
- Limpieza de material para redes sociales: eliminar rótulos o textos quemados de clips cortos antes de reutilizarlos en otras plataformas.
- Creación de datasets de vídeo: generar versiones sin texto de clips para entrenar modelos de visión que de otro modo aprenderían a leer los subtítulos como señal espuria.
- Posproducción de bajo coste en investigación: comparar STTN, Big-LaMa y ProPainter sobre el mismo metraje para evaluar calidad y coste computacional de cada enfoque.
- Prototipado de pipelines de restauración: usar PP-OCRv5 para la detección automática de máscaras y encadenar el inpainting con el modelo que mejor se ajuste al presupuesto de cómputo.
- Uso personal y educativo: experimentar con técnicas de inpainting de vídeo sin necesidad de descargar pesos de múltiples repositorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; depende del modelo elegido y de la resolución del vídeo. Big-LaMa y STTN son los más ligeros; ProPainter, al incluir RAFT y flow completion, es el más exigente.
- GPU recomendadas: no disponible. Por la naturaleza de los modelos (inpainting de vídeo por lotes de fotogramas), se espera que se beneficien de GPUs con memoria amplia (A100, H100, RTX 4090), aunque no hay cifras publicadas.
- ¿Cabe en GPU de consumo? No disponible. Los modelos de inpainting de vídeo suelen requerir procesar varios fotogramas a la vez, lo que incrementa la memoria necesaria.
- Opciones de despliegue: los pesos son de PyTorch (`.pth`, `.pt`), por lo que se cargan con los repositorios originales (researchmm/STTN, advimman/lama, sczhou/ProPainter, PaddlePaddle/PaddleOCR). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a estos modelos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto temporal | Licencia | Disponibilidad |
|---|---|---|---|---|
| dxvibe/vsr (STTN + Big-LaMa + ProPainter + PP-OCRv5) | Colección de inpainting de vídeo e imagen + detección OCR | Sí (STTN, ProPainter); no (Big-LaMa) | Mixta (MIT/Apache-2.0 y NTU S-Lab no comercial) | Hugging Face, mirror |
| ProPainter (sczhou) | Inpainting de vídeo con flow completion | Sí | NTU S-Lab License 1.0 (no comercial) | GitHub oficial |
| STTN (researchmm) | Inpainting de vídeo con transformer espacio-temporal | Sí | MIT / Apache-2.0 | GitHub oficial |
| Big-LaMa (advimman) | Inpainting de imagen | No | Apache-2.0 | GitHub oficial |

La ventaja del repositorio es la agregación y la documentación de licencias; en calidad y rendimiento, cada componente debe compararse con su proyecto upstream, para el que no se aportan métricas en esta ficha.

## Limitaciones y advertencias

- ProPainter está bajo NTU S-Lab License 1.0: uso estrictamente no comercial; cualquier servicio o redistribución comercial requiere autorización de los autores originales de S-Lab.
- El resto de pesos conservan sus licencias upstream (MIT, Apache-2.0); es responsabilidad del usuario verificar el cumplimiento en cada componente.
- No es un modelo generativo de lenguaje ni un agente: no admite prompts, tool calling ni razonamiento.
- La detección PP-OCRv5 `ch_det` está orientada a texto chino; para otros alfabetos puede requerir otros detectores.
- El inpainting puede producir artefactos en fondos complejos, texturas repetitivas o movimiento rápido de cámara; la calidad varía entre STTN, Big-LaMa y ProPainter.
- Riesgo de alucinación visual: el modelo puede inventar contenido en las regiones enmascaradas.
- No hay información sobre sesgos, idiomas soportados ni rendimiento medido; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- La fecha de creación indicada (2026-11-14) es posterior a la redacción de esta ficha; conviene verificar su vigencia.

## Enlaces

- Hugging Face: https://huggingface.co/dxvibe/vsr
- STTN: https://github.com/researchmm/STTN
- video-subtitle-remover (YaoFANGUK): https://github.com/YaoFANGUK/video-subtitle-remover
- Big-LaMa: https://github.com/advimman/lama
- ProPainter: https://github.com/sczhou/ProPainter
- PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
