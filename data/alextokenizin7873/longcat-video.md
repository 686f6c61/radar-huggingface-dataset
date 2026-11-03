# Alextokenizin7873/LongCat-Video

## Resumen

LongCat-Video es un modelo fundacional de generación de vídeo desarrollado por Meituan LongCat, con 13.600 millones de parámetros. Resuelve tres tareas dentro de una única arquitectura: texto-a-vídeo (T2V), imagen-a-vídeo (I2V) y continuación de vídeo (video-continuation). Su rasgo diferencial es la generación de vídeos de varios minutos de duración sin deriva de color ni degradación progresiva de la calidad, gracias a un preentrenamiento nativo en la tarea de continuación.

El modelo emplea una estrategia de generación de grueso a fino (coarse-to-fine) sobre los ejes temporal y espacial, junto con Block Sparse Attention para mantener la eficiencia a resoluciones altas. Es capaz de producir vídeo a 720p y 30 fps en cuestión de minutos. El ajuste final se realiza mediante RLHF con múltiples recompensas basado en Group Relative Policy Optimization (GRPO).

Esta ficha describe el repositorio `Alextokenizin7873/LongCat-Video`, un espejo no oficial que no aloja pesos y que existe únicamente para que los resultados estructurados de evaluación MOS de la model card oficial se rendericen en Hugging Face. Para pesos y descargas debe usarse el repositorio oficial `meituan-longcat/LongCat-Video`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación de vídeo con Block Sparse Attention y generación coarse-to-fine temporal y espacial |
| Parámetros totales | 13,6 mil millones (13.6B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | no disponible en este repositorio (espejo sin pesos); el repositorio oficial no detalla el formato en la información proporcionada |

## Arquitectura y entrenamiento

LongCat-Video es un modelo de generación de vídeo de 13.6B parámetros que unifica T2V, I2V y video-continuation en un solo marco generativo. La generación sigue una estrategia coarse-to-fine a lo largo de los ejes temporal y espacial, lo que permite sintetizar vídeo a 720p y 30 fps en minutos. Incorpora Block Sparse Attention para mejorar la eficiencia, especialmente a resoluciones altas. El modelo está preentrenado de forma nativa en la tarea de continuación de vídeo, lo que habilita la producción de vídeos de varios minutos sin deriva de color ni pérdida de calidad.

El ajuste final utiliza RLHF con múltiples recompensas mediante Group Relative Policy Optimization (GRPO). La información disponible no detalla el número de tokens de entrenamiento ni la composición exacta del dataset; el informe técnico (arXiv:2510.22200) es la referencia para esos datos. La configuración por defecto habilita FlashAttention-2, con posibilidad de cambiar a FlashAttention-3 o xformers.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) a 720p y 30 fps.
- Generación de vídeo a partir de una imagen (image-to-video).
- Continuación de vídeo (video-continuation) para producir secuencias de varios minutos sin degradación de calidad ni deriva de color.
- Arquitectura unificada: un único modelo cubre las tres tareas sin necesidad de modelos separados.
- Generación eficiente mediante estrategia coarse-to-fine y Block Sparse Attention.
- Soporte de prompts en inglés y chino.
- Alineación mediante RLHF multi-recompensa (GRPO).
- No se documentan en la información disponible capacidades de tool calling, agentes, audio o visión más allá del uso de imagen como condición de entrada.

## Casos de uso

- Publicidad y marketing: generación de clips de producto a 720p/30fps a partir de descripciones textuales, aprovechando la velocidad de inferencia (minutos) para iterar creatividades rápidamente.
- Previsualización de storyboards: conversión de imágenes clave en secuencias animadas mediante image-to-video para validar dirección de arte antes de producción final.
- Creación de contenido de formato largo: uso de video-continuation para extender tomas existentes durante minutos sin cortes visibles ni cambios de color, adecuado para fondos de vídeo o loops extensos.
- Prototipado en estudios de animación: generación de animáticas a partir de guiones en inglés o chino, con la ventaja de un único modelo para T2V e I2V.
- Síntesis de material para investigación en visión por computador: producción de datasets sintéticos de vídeo con control de prompt y condición de imagen.
- Educación y divulgación: generación de vídeos explicativos cortos a partir de texto o de una ilustración inicial, con resolución suficiente para presentaciones.
- Experimentación open source: al tener licencia MIT, permite integrar el modelo en pipelines propios de difusión (diffusers/transformers) y modificarlo sin restricciones de uso comercial.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados), sobre benchmarks internos de MOS (Mean Opinion Score):

| Tarea | Métrica | Valor |
|---|---|---|
| Text-to-video | Text-Alignment | 3,76 |
| Text-to-video | Visual Quality | 3,25 |
| Text-to-video | Motion Quality | 3,74 |
| Text-to-video | Overall Quality | 3,38 |
| Image-to-video | Image-Alignment | 4,04 |
| Image-to-video | Text-Alignment | 3,49 |
| Image-to-video | Visual Quality | 3,27 |
| Image-to-video | Motion Quality | 3,59 |
| Image-to-video | Overall Quality | 3,17 |

No se han publicado en la información disponible resultados en benchmarks públicos estándar (VBench u otros) ni comparaciones numéricas directas con modelos competidores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 13.6B parámetros se requiere previsiblemente hardware de gama alta, pero no se confirma cifra concreta.
- GPU recomendadas: no especificadas por el autor; el stack requiere CUDA (torch 2.6.0+cu124) y FlashAttention-2.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: repositorio oficial de GitHub con scripts de inferencia; integración declarada con las librerías `diffusers` y `transformers`. No se documentan en la información disponible soporte para vLLM, llama.cpp, Ollama o TGI (orientados a LLM, no a difusión de vídeo).
- Latencia y throughput: el autor declara generación de vídeo 720p a 30 fps "en minutos", sin cifras exactas de latencia ni throughput.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos numéricos de modelos comparables (parámetros, contexto, benchmarks) para construir una comparativa rigurosa. El autor afirma que el rendimiento es comparable a los principales modelos open source de generación de vídeo y a soluciones comerciales recientes, pero no se aportan cifras de esos competidores.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LongCat-Video | 13,6B | no disponible | MIT | Pesos en repo oficial de Hugging Face y GitHub |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Este repositorio (`Alextokenizin7873/LongCat-Video`) es un espejo no oficial sin pesos; no debe usarse para descargar el modelo ni citarse como fuente canónica.
- Los resultados de benchmarks son MOS sobre conjuntos internos, no verificados (`verified: false`) y no comparables directamente con métricas automáticas públicas.
- Idiomas soportados limitados a inglés y chino; el rendimiento en otros idiomas no está documentado.
- Riesgo de sesgos y de alucinación visual inherente a los modelos generativos: pueden aparecer artefactos, incoherencias temporales o contenido no fiel al prompt.
- No se documentan en la información disponible filtros de seguridad, limitaciones de contenido ni políticas de uso aceptable más allá de la licencia MIT.
- La licencia MIT permite uso comercial, pero el usuario debe verificar las condiciones del repositorio oficial y de cualquier dependencia (FlashAttention, torch) antes de producción.
- No se detallan requisitos de hardware ni cifras de VRAM, lo que dificulta la planificación de despliegue sin consultar el informe técnico y el repositorio oficial.

## Enlaces

- Repositorio espejo (esta ficha): https://huggingface.co/Alextokenizin7873/LongCat-Video
- Repositorio oficial del modelo: https://huggingface.co/meituan-longcat/LongCat-Video
- Repositorio GitHub oficial: https://github.com/meituan-longcat/LongCat-Video
- Informe técnico (arXiv): https://arxiv.org/abs/2510.22200
- Página del paper en Hugging Face: https://huggingface.co/papers/2510.22200
- Página del proyecto: https://meituan-longcat.github.io/LongCat-Video/
- Discusión de la PR de la model card oficial: https://huggingface.co/meituan-longcat/LongCat-Video/discussions/19
