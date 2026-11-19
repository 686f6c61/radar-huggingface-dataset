# luyu1021/turbot2va-ltx2

## Resumen

TurboT2VA-LTX2 es un conjunto de snapshots de investigación derivados de Lightricks/LTX-2, un modelo de generación conjunta de vídeo y audio de 19B parámetros. Lo publica el usuario luyu1021 en Hugging Face y su propósito declarado es la destilación y la exploración de métodos de muestreo reducido (DCM, SCM, RCM y DMD) sobre la base LTX-2 dev. No es un modelo nuevo entrenado desde cero, sino una familia de checkpoints experimentales que documentan distintas trayectorias de entrenamiento y control.

El repositorio incluye únicamente un artefacto de inferencia verificado (`inference/published_turbot2av_main/model.pth`, 37,75 GB, 3510 tensores BF16 con solo el generador) junto con código, recetas de entrenamiento anotadas en chino y documentación de evaluación. El resto de la publicación consiste en un plan de 15 artefactos DCP (aproximadamente 1,32 TB) que en el momento de redactar esta ficha aún no estaban subidos al repositorio remoto.

Su relevancia es acotada pero clara para quien investiga destilación de modelos audiovisuales: expone comparativas entre variantes con distintos valores de beta, pasos de entrenamiento y combinaciones de pérdidas, además de snapshots de fallo y control que rara vez se publican. No debe interpretarse como un modelo listo para producción ni como una mejora validada sobre LTX-2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Lightricks/LTX-2; detalles no especificados en la información proporcionada) |
| Parámetros totales | 19B (según la model card: "LTX-2 dev 19B") |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos publicados están en BF16) |
| Idiomas soportados | en, zh |
| Licencia | ltx-2-community (license_name: ltx-2-community, license: other) |
| Formato de pesos | `.pth` (PyTorch, BF16) para el generador publicado; `.distcp`/DCP para los snapshots de entrenamiento pendientes |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de LTX-2 dev de 19B parámetros, un modelo de generación conjunta de vídeo y audio. Los snapshots publicados son el resultado de aplicar técnicas de destilación y muestreo reducido sobre esa base: DCM (con distintos valores de beta, 0 y 0,9), SCM (directo y con continuación de prefijo común), RCM (directo y combinado con DCM/SCM) y DMD-only. Las recetas de entrenamiento están anotadas en chino y se incluyen en el directorio `code/` del repositorio.

El entrenamiento se realizó en configuraciones de 8 GPUs, y algunos artefactos incluyen estado completo de optimizer y RNG para reanudación, mientras que otros solo contienen las capas del modelo. La model card advierte explícitamente que la inferencia requiere los activos oficiales del modelo base (VAE audiovisual y codificador de texto Gemma), y que estos checkpoints no son adaptadores LoRA. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación conjunta de vídeo y audio (audio-video generation), según las etiquetas del repositorio.
- Exploración de métodos de muestreo reducido mediante destilación: DCM, SCM, RCM y DMD.
- Soporte de reanudación de entrenamiento en algunos artefactos DCP (con estado de optimizer y RNG para 8 ranks).
- Idiomas: inglés y chino (según los metadatos; aplicable principalmente a prompts de texto).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No se documentan capacidades de visión, audio de entrada ni otras modalidades más allá de la generación audiovisual.

## Casos de uso

- Investigación en destilación de modelos audiovisuales: los snapshots permiten reproducir y comparar trayectorias DCM, SCM, RCM y DMD con distintos valores de beta y pasos, algo poco habitual en publicaciones de modelos.
- Estudio de trayectorias de fallo: los artefactos etiquetados como "failure/control trajectory" (por ejemplo, `scm_direct_beta0_step1000`) sirven para analizar modos de colapso en entrenamiento de difusión y destilación.
- Reanudación de entrenamiento a gran escala: los cinco artefactos con estado completo de 8 ranks permiten continuar entrenamientos con el mismo world size, layout de parámetros y entorno de dependencias.
- Generación de clips audiovisuales de prueba: usando el generador publicado (`model.pth`) con el VAE y el codificador Gemma oficiales de LTX-2, se pueden producir muestras para evaluación cualitativa interna.
- Reproducción de protocolos de evaluación: la documentación incluye protocolos separados de prompts crudos y mejorados (8 prompts x 1 semilla para sondas de entrenamiento; 200 prompts x 8 semillas para diversidad formal), útiles para replicar mediciones Javis/AVH.
- Auditoría de integridad de checkpoints: `CHECKSUMS.json`, `RELEASE_METADATA.json` y `PUBLISHED_SCOPE.json` permiten verificar SHA256 y el alcance real de lo publicado, útil en pipelines de validación de artefactos.
- Base para experimentos de ajuste fino: al no ser LoRA y requerir los activos base, sirve como punto de partida para quien quiera explorar variantes de destilación sobre LTX-2 en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona únicamente medidas de similitud audiovisual Javis/AVH usadas como sondas internas, sin cifras concretas, y advierte que no se ejecutó una evaluación humana ni a gran escala para esta publicación. También señala que los snapshots tardíos de exp6 muestran puntuaciones AV más bajas, sin proporcionar los valores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el generador publicado ocupa 37,75 GB en BF16 (3510 tensores), por lo que se requiere al menos esa cantidad de memoria más la del VAE audiovisual y el codificador Gemma.
- GPU recomendadas: no especificadas en la información proporcionada. Por tamaño, un modelo de 19B en BF16 no cabe en GPUs de consumo de 24 GB sin cuantización, que no está documentada.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen; en BF16, el peso del generador por sí solo supera la VRAM de las RTX 4090 (24 GB) y RTX 5090 (32 GB).
- Opciones de despliegue: el repositorio indica usar el entorno fijado de `code/LTX-2` con PyTorch 2.7.0+cu128 y el runner de inferencia descrito en `code/docs/INFERENCE.md`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión audiovisual).
- Latencia y throughput: no disponibles. La model card indica explícitamente que no se ejecutó verificación de inferencia en GPU para esta publicación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TurboT2VA-LTX2 | 19B | no disponible | Destilación/snapshots de investigación sobre LTX-2 | ltx-2-community | Parcial: solo generador publicado; DCP pendientes |
| Lightricks/LTX-2 | 19B (dev) | no disponible | Generación conjunta de vídeo y audio | ltx-2-community | Modelo base oficial |
| Otros modelos de vídeo+audio open source | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo base Lightricks/LTX-2, del que este repositorio es un derivado. No se dispone de datos de benchmarks ni de especificaciones de terceros comparables en el material consultado.

## Limitaciones y advertencias

- El repositorio no es un modelo listo para producción: la model card lo describe como "research snapshots" y advierte que el checkpoint más reciente no implica mejor calidad.
- Solo el artefacto `inference/published_turbot2av_main/` está verificado y disponible en remoto; los 15 artefactos DCP (~1,32 TB) figuraban como pendientes de subida en el momento de la publicación.
- El generador publicado contiene únicamente el generador (no optimizer ni RNG), por lo que no permite reanudar entrenamiento.
- Algunos snapshots son trayectorias de fallo o control y no deben usarse como referencia de calidad.
- La model card no demuestra equivalencia tensor a tensor entre el `model.pth` publicado y el checkpoint local exp5; la etiqueta stage3/3500 no está verificada.
- No se ejecutó verificación de inferencia en GPU ni evaluación humana o a gran escala para esta publicación.
- Las medidas Javis/AVH son de similitud audiovisual, no de calidad subjetiva completa.
- Los prompts locales raw200 presentan 16 solapamientos textuales exactos con el mapeo de entrenamiento, lo que puede inflar métricas si se usan sin depuración.
- La licencia `ltx-2-community` es de tipo "other": es imprescindible revisar `LICENSE` antes de cualquier uso comercial, ya que las condiciones no están resumidas en la información disponible.
- Riesgo de sesgos y alucinación: no documentado en la información proporcionada; aplican los sesgos inherentes al dataset de entrenamiento de LTX-2, no detallado aquí.
- La reanudación completa exige el mismo world size, layout de parámetros, entorno de dependencias y datos/base disponibles; no es portable entre configuraciones.
- Idiomas limitados a inglés y chino según los metadatos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/luyu1021/turbot2va-ltx2
- Modelo base: https://huggingface.co/Lightricks/LTX-2
- Repositorio GitHub del autor (privado en el momento de la publicación): https://github.com/liuyuxiang1021/turbot2va-ltx2
- Documentación de inferencia incluida en el repo: `code/docs/INFERENCE.md`
- Documentación de entrenamiento incluida en el repo: `code/docs/TRAINING.md`
- Documentación de evaluación incluida en el repo: `code/docs/EVALUATION.md`
- Manifiesto de subida: `code/release/upload_manifest.json`
- Alcance publicado: `code/release/PUBLISHED_SCOPE.json`
- Sumas de verificación: `CHECKSUMS.json`
- Licencia: `LICENSE` (en el repositorio)
