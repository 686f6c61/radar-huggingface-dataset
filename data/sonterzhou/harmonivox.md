# sonterzhou/HarmoniVox

## Resumen

HarmoniVox es un modelo de síntesis de voz (text-to-speech) condicionado por imagen, texto e idioma explícito, desarrollado por Songtao Zhou y colaboradores y presentado en ACM Multimedia 2025. El modelo genera habla a partir de una única imagen de referencia (el "avatar"), una cadena de texto y un identificador de idioma, de modo que la voz sintetizada queda vinculada a la identidad visual proporcionada. Resuelve el problema de la clonación y el anclaje de voz sin necesidad de muestras de audio de referencia, usando únicamente información visual.

El repositorio de Hugging Face contiene exclusivamente los pesos seleccionados del modelo propuesto en el artículo (`paper-proposed`), junto con configuraciones y metadatos de integridad; el código de inferencia se mantiene por separado en GitHub. Se trata de un modelo PyTorch personalizado, no de un checkpoint compatible con `Transformers` (`pipeline` o `AutoModel`). El repositorio ocupa 4,2 GB e incluye dos ficheros principales: un generador de habla de 238.330.866 bytes y un codificador de imagen de 3.941.418.226 bytes.

La relevancia actual del modelo reside en su enfoque multimodal imagen-a-voz y en su publicación como artefacto reproducible con hashes verificados (1.571 tensores comprobados). No obstante, la licencia no está seleccionada y el alcance de validación se limita a inglés y chino en frases cortas, lo que condiciona su adopción en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generador de habla basado en VITS/Bert-VITS2 con codificador visual CLIP ViT-H-14 y Q-Former (estilo BLIP-2) |
| Parametros totales | no disponible (el generador ocupa 238.330.866 bytes; el codificador de imagen 3.941.418.226 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en precisión original, sin estados de optimizador) |
| Idiomas soportados | inglés (en) y chino (zh); el japonés queda fuera del alcance de validación |
| Licencia | no disponible (el autor indica que no se ha seleccionado licencia para el código ni para el modelo) |
| Formato de pesos | PyTorch `.pth` (`G_12000.pth`, `E_12000.pth`) con `config.json`, `qformer_config.json`, `manifest.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

HarmoniVox combina tres componentes. El codificador de imagen es un backbone visual CLIP completo, construido a partir de la configuración `ViT-H-14` del paquete OpenCLIP fijado, seguido de un Q-Former cuya arquitectura se describe en `qformer_config.json`; ambos se cargan estrictamente desde el fichero `E_12000.pth`. El generador de habla (`G_12000.pth`) sigue la estela de VITS y Bert-VITS2 e incorpora el vocoder, de modo que no se requieren pesos separados de vocoder, WavLM ni discriminador para la CLI pública. El condicionamiento textual se apoya en modelos BERT externos: `microsoft/deberta-v3-large` para inglés y `hfl/chinese-roberta-wwm-ext-large` para chino, que deben prepararse aparte mediante `scripts/prepare_assets.py`.

Los detalles de entrenamiento son incompletos en la model card: no se especifica el número de tokens, la composición del corpus ni si hubo RLHF o DPO, y la ascendencia del checkpoint base de habla más temprano permanece sin documentar. El autor indica que los resultados del experimento preservado coinciden con las nueve métricas de clasificación publicadas en la Tabla 2 del artículo de MM25, y que la evidencia detallada y las lagunas de procedencia restantes están en `docs/MM25_FINAL_MODEL.md` del repositorio de código. Se han eliminado los estados del optimizador sin alterar la precisión ni los valores de los tensores.

## Capacidades

- Síntesis de voz condicionada por imagen: genera habla a partir de una única imagen de referencia, un texto y un idioma explícito.
- Generación de audio en formato mono PCM-16 WAV a 16 kHz.
- Soporte bilingüe de inglés y chino, con recursos lingüísticos específicos por idioma (DeBERTa-v3-large para inglés, Chinese RoBERTa WWM Ext Large para chino).
- Verificación de integridad de pesos mediante `--verify-weights` y comprobación de hashes de los recursos descargados.
- Ejecución en CPU y en CUDA (validada en RTX A6000 con Python 3.9, PyTorch 2.3.0, Transformers 4.44.2 y OpenCLIP 2.32.0).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo generativo de audio, no un LLM.
- No dispone de modo "thinking", visión general, audio de entrada ni otras capacidades multimodales más allá del condicionamiento visual descrito.

## Casos de uso

- Avatares virtuales y VTubers: el modelo genera la voz del personaje a partir de su imagen de referencia, lo que permite mantener una identidad sonora coherente sin grabar muestras de audio del actor.
- Doblaje y localización de contenido: con soporte para inglés y chino, se puede sintetizar el mismo guion en ambos idiomas a partir de la imagen del presentador o personaje, facilitando versiones localizadas de vídeos cortos.
- Prototipado rápido de personajes en videojuegos: los equipos de diseño pueden asignar una voz a un concepto visual antes de contratar actores de doblaje, usando la CLI con `--device cuda` para iterar sobre guiones cortos.
- Accesibilidad y locución de materiales: generación de narraciones para contenidos donde la identidad visual del emisor es relevante (por ejemplo, un avatar corporativo), con salida WAV de 16 kHz lista para integrarse en pipelines de vídeo.
- Investigación en multimodalidad imagen-a-voz: el modelo sirve como referencia reproducible (pesos verificados, hashes, configuración) para experimentos académicos sobre condicionamiento visual en TTS.
- Demostraciones y pruebas de concepto en entornos con GPU de consumo: al validarse en CPU y en una RTX A6000, es viable ejecutar inferencias de frases cortas en estaciones de trabajo modestas para evaluar la calidad antes de invertir en infraestructura.
- Generación de audiolibros o pódcasts con identidad visual consistente: para proyectos donde el narrador tiene una imagen de marca fija, el modelo permite sintetizar fragmentos cortos manteniendo el anclaje visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona que los resultados del experimento preservado coinciden con las nueve métricas de clasificación de la Tabla 2 del artículo de MM25, pero no reproduce sus valores ni ofrece comparaciones con otros modelos. Tampoco se proporcionan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio de pesos ocupa 4,2 GB y el codificador de imagen solo pesa 3,94 GB, por lo que se requiere una GPU con al menos varios GB de VRAM libre, además de los modelos BERT externos.
- GPU recomendadas: RTX A6000 es la única GPU mencionada como validada; no se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo; la validación oficial se realizó en CPU y en RTX A6000.
- Opciones de despliegue: CLI propia del repositorio de GitHub (`inference.py`), con instalación de Python 3.9 y entornos CPU o CUDA fijados. No se soportan vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. La validación se limita a frases cortas en inglés y chino.

## Comparativa con modelos similares

| Modelo | Tipo de condicionamiento | Idiomas | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HarmoniVox | Imagen + texto + idioma | en, zh | no disponible (repo de 4,2 GB) | no disponible | Pesos en Hugging Face, código en GitHub |
| Bert-VITS2 | Texto (referencia de estilo) | Multilingüe | no disponible | no disponible en esta ficha | Open source en GitHub |
| VITS | Texto | Multilingüe | no disponible | no disponible en esta ficha | Open source en GitHub |
| BLIP-2 (LAVIS) | Imagen + texto (no TTS) | Inglés principalmente | no disponible en esta ficha | no disponible en esta ficha | Open source en GitHub |

La comparación se limita a los proyectos citados como base por el propio autor (Bert-VITS2, VITS y BLIP-2/LAVIS); no se dispone de datos de rendimiento comparativo ni de otros modelos imagen-a-voz en la información proporcionada.

## Limitaciones y advertencias

- Licencia no seleccionada: el autor indica explícitamente que no se ha elegido licencia para el código ni para el modelo, lo que impide un uso comercial seguro sin aclaración previa.
- Sesgos conocidos: no documentados en la model card.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero no se documenta la fidelidad de la prosodia ni la estabilidad de la voz generada.
- Limitaciones de idioma: solo inglés y chino están validados; el japonés queda fuera del alcance de esta release.
- Limitaciones de contexto: la validación se realizó únicamente con frases cortas; no se documenta el comportamiento con textos largos.
- Reproducibilidad: el autor advierte que la regresión de ejecución no garantiza salidas idénticas en hardware o versiones de dependencias distintas.
- Datos de entrenamiento incompletos: no se incluye el corpus, las imágenes de evaluación ni el audio de referencia, y la procedencia del checkpoint base de habla más temprano no está documentada.
- Dependencias externas: requiere descargar y preparar por separado los modelos BERT (`microsoft/deberta-v3-large` y `hfl/chinese-roberta-wwm-ext-large`) y, para inglés, recursos de NLTK.
- Integración: no es compatible con `Transformers` (`pipeline`/`AutoModel`); requiere la CLI del repositorio de GitHub y una revisión concreta del Hub (`FULL_COMMIT_SHA`).
- Advertencia de seguridad: la clonación de voz a partir de una imagen plantea riesgos de suplantación de identidad y requiere consentimiento y controles de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sonterzhou/HarmoniVox
- Artículo (DOI): https://doi.org/10.1145/3746027.3755736
- Código en GitHub: https://github.com/songtoy/HarmoniVox
- Bert-VITS2: https://github.com/fishaudio/Bert-VITS2
- VITS: https://github.com/jaywalnut310/vits
- Salesforce LAVIS / BLIP-2: https://github.com/salesforce/LAVIS
