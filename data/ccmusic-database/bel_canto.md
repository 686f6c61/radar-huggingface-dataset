# ccmusic-database/bel_canto

## Resumen

Bel canto es un modelo de clasificación de audio especializado en distinguir estilos vocales clásicos y étnicos. Lo desarrolla el equipo de ccmusic-database, vinculado al proyecto CCMusic, una base de datos abierta para la investigación en recuperación de información musical china (MIR). El modelo no es un transformer generativo: es un clasificador de imágenes aplicado a espectrogramas de audio, con un backbone preentrenado en visión por computador y ajustado finamente para la tarea de clasificación de estilos vocales en cuatro categorías.

La relevancia del modelo reside en su enfoque: convierte el audio en representaciones tiempo-frecuencia (Mel, CQT o Chroma) y reutiliza arquitecturas de visión (Swin, ConvNeXt, AlexNet, GoogleNet, entre otras) para discriminar patrones estilísticos sutiles entre tradiciones vocales. El repositorio ocupa 8,2 GB e incluye múltiples variantes de backbone y representación, con resultados de precisión reportados para cada combinación.

Es un modelo de nicho, orientado a investigación musicológica, preservación cultural y análisis de interpretaciones vocales, no a generación de texto ni a tareas de lenguaje. Su licencia MIT y su disponibilidad en Hugging Face y ModelScope facilitan su reutilización, aunque la documentación técnica disponible es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de imágenes (CNN y transformers de visión) sobre espectrogramas de audio; backbones: Swin-S, Swin-T, AlexNet, ConvNeXt-T, GoogleNet, MNASNet1.3, SqueezeNet1.1 |
| Parametros totales | no disponible (varía por backbone; el repositorio completo pesa 8,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa espectrogramas de audio, no secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del modelo); el contenido musical abarca tradiciones vocales clásicas y étnicas, sin restricción lingüística declarada |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio distribuido vía Hugging Face Hub y ModelScope; pesos probablemente en formato PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

El modelo sigue un pipeline de clasificación de audio basado en visión: cada muestra de audio se transforma en un espectrograma (Mel, CQT o Chroma) y se alimenta a un backbone preentrenado en tareas de visión por computador. Durante el fine-tuning, el backbone adapta sus representaciones a las diferencias estilísticas entre canto clásico y tradiciones vocales étnicas. El repositorio incluye varias combinaciones de backbone y representación espectral, lo que permite elegir el compromiso entre precisión y coste computacional.

El dataset de entrenamiento es `ccmusic-database/bel_canto`, compuesto por muestras cantadas por vocalistas profesionales en cuatro categorías. No se especifican en la información disponible el número de tokens, horas de audio, composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un clasificador de este tipo). Tampoco se detalla el proceso de aumentación de datos ni la partición train/validation/test.

## Capacidades

- Clasificación de audio en cuatro categorías de estilo vocal (clásico y tradiciones étnicas).
- Análisis de representaciones tiempo-frecuencia mediante espectrogramas Mel, CQT y Chroma.
- Discriminación de diferencias estilísticas sutiles entre interpretaciones vocales profesionales.
- Múltiples variantes de backbone para ajustar precisión y coste: Swin-S, Swin-T, AlexNet, ConvNeXt-T, GoogleNet, MNASNet1.3, SqueezeNet1.1.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- Capacidades multilingües: no aplica; el modelo opera sobre audio musical, no sobre texto.

## Casos de uso

- Catalogación musicológica automatizada: clasificar grabaciones vocales de archivos sonoros en estilos clásico o étnico para facilitar la indexación y búsqueda en bases de datos de investigación.
- Preservación cultural: etiquetar automáticamente grabaciones de tradiciones vocales minoritarias para su documentación y estudio, reduciendo el trabajo manual de archivo.
- Análisis de interpretación: comparar la adherencia estilística de una interpretación concreta respecto a las categorías aprendidas, útil en estudios de performance.
- Filtrado en plataformas musicales: separar contenido vocal clásico de étnico en pipelines de recomendación o curaduría editorial.
- Docencia e investigación en MIR: servir como baseline reproducible para experimentos de clasificación de audio con espectrogramas y backbones de visión.
- Evaluación comparativa de representaciones: usar las variantes Mel, CQT y Chroma del repositorio para estudiar qué representación captura mejor las diferencias estilísticas vocales.
- Preprocesado en proyectos de etiquetado: generar etiquetas preliminares que luego se revisan manualmente en flujos de anotación a gran escala.

## Benchmarks y rendimiento

Resultados de precisión (accuracy) reportados en la model card para cada combinación de backbone y representación espectral:

| Backbone | Mel | CQT | Chroma |
|---|---|---|---|
| Swin-S | 0.928 | 0.936 | 0.787 |
| Swin-T | 0.906 | 0.863 | 0.731 |
| AlexNet | 0.919 | 0.920 | 0.746 |
| ConvNeXt-T | 0.895 | 0.925 | 0.714 |
| GoogleNet | 0.948 | 0.921 | 0.739 |
| MNASNet1.3 | 0.931 | 0.931 | 0.765 |
| SqueezeNet1.1 | 0.923 | 0.914 | 0.685 |
| Media | 0.921 | 0.916 | 0.738 |

El mejor resultado individual es GoogleNet con representación Mel (0.948). La representación Chroma es consistentemente la peor en todos los backbones, con una media de 0.738 frente a 0.921 (Mel) y 0.916 (CQT). No se reportan métricas adicionales como F1, precisión por clase o AUC en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de backbones de visión de tamaño pequeño-medio (Swin-S, SqueezeNet, MNASNet), la inferencia cabe holgadamente en GPUs de consumo, aunque no se publican cifras concretas.
- GPU recomendadas: no especificadas por el autor. Por el tamaño de los backbones, una RTX 3060 o superior sería suficiente; para procesamiento por lotes a gran escala se recomendarían GPUs de datacenter (A100, H100).
- Cabe en GPU de consumo: sí, previsiblemente, dado el tamaño de los backbones de visión; sin cifras oficiales de VRAM.
- Opciones de despliegue: el autor proporciona un Space de demostración en Hugging Face y un script de descarga vía `huggingface_hub`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un clasificador de este tipo). Existe un repositorio de evaluación en GitHub (`monetjoe/ccmusic_eval`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables de clasificación de estilos vocales clásicos/étnicos con los que establecer una comparativa directa. Las alternativas habituales en clasificación de audio (por ejemplo, modelos basados en PANNs, YAMNet o AST) no aparecen referenciadas en la model card, por lo que no se pueden contrastar parámetros, contexto ni rendimiento de forma rigurosa.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bel_canto (GoogleNet/Mel) | no disponible | no aplica | accuracy 0.948 | MIT | Hugging Face, ModelScope |
| Alternativas de clasificación de audio | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo clasifica únicamente en cuatro categorías de estilo vocal; no generaliza a otros géneros ni a tareas fuera de la clasificación estilística.
- No se documentan sesgos del dataset; al tratarse de muestras de vocalistas profesionales, puede no representar interpretaciones amateur o grabaciones de baja calidad.
- Riesgo de degradación ante audio con ruido, reverberación o condiciones de grabación distintas a las del conjunto de entrenamiento.
- La representación Chroma ofrece un rendimiento notablemente inferior (media 0.738), por lo que no se recomienda para producción sin validación previa.
- No se especifican el tamaño ni la composición del dataset de entrenamiento, lo que dificulta evaluar la robustez y la cobertura cultural del modelo.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; la documentación técnica es escasa.
- El modelo está etiquetado con idioma "en", lo que no refleja necesariamente la diversidad lingüística de las tradiciones vocales representadas.
- No apto para generación de texto, código ni tareas de razonamiento; es exclusivamente un clasificador de audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ccmusic-database/bel_canto
- Dataset: https://huggingface.co/datasets/ccmusic-database/bel_canto
- Demo (Space): https://huggingface.co/spaces/ccmusic-database/bel_canto
- Mirror en ModelScope: https://www.modelscope.cn/models/ccmusic-database/bel_canto
- Repositorio de evaluación: https://github.com/monetjoe/ccmusic_eval
- Paper CCMusic (TISMIR 2025): https://doi.org/10.5334/tismir.194
