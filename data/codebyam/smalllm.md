# codebyam/SmallLM

## Resumen

SmallLM es un modelo de lenguaje de tipo transformer desarrollado por el usuario codebyam y publicado en Hugging Face bajo licencia MIT. Se presenta como un modelo especializado de menos de 50 millones de parámetros, orientado a tareas de generación de texto y con un tokenizador propio basado en turboBPE (una implementación derivada de minbpe, el tokenizador educativo de Andrej Karpathy). Su propuesta principal es ofrecer un modelo extremadamente compacto que pueda ejecutarse en dispositivos de gama baja, incluidos entornos basados únicamente en CPU, sin necesidad de GPU dedicada.

El modelo se encuentra en desarrollo activo y, según su propia model card, todavía no ha sido liberado formalmente: el repositorio existe y está etiquetado, pero el autor indica que los pesos definitivos se publicarán más adelante. Está entrenado sobre datasets personalizados no especificados y su alcance lingüístico declarado se limita al inglés. No se han publicado detalles sobre la arquitectura interna (número de capas, dimensión de los embeddings, mecanismo de atención), el volumen de tokens de entrenamiento ni resultados de benchmarks.

Por su escala, SmallLM no compite con los modelos generativos de propósito general actuales, sino que se posiciona como una base para especialización en tareas concretas y para experimentación en entornos con recursos muy limitados. Es relevante ahora como ejemplo de la tendencia hacia modelos pequeños (SLM, *small language models*) desplegables en el borde (*edge*), aunque su utilidad práctica está condicionada por la ausencia de pesos publicados y de documentación técnica detallada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles internos no disponibles) |
| Parámetros totales | Menos de 50 millones (cifra exacta no disponible) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el autor indica que puede ejecutarse en CPU, sin detallar formatos) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | No disponible (librería declarada: PyTorch) |

## Arquitectura y entrenamiento

La model card describe SmallLM como un modelo transformer especializado de menos de 50 millones de parámetros. No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni la variante concreta de transformer empleada. El tokenizador está basado en turboBPE, una implementación derivada de minbpe de Andrej Karpathy, según la información disponible en la búsqueda web; la model card enlaza al repositorio de turboBPE en GitHub como fuente del tokenizador.

El entrenamiento se realizó sobre «datasets personalizados» cuyo contenido, tamaño y composición no se detallan. No hay información sobre el número de tokens procesados, la proporción de código frente a texto natural, ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas específicas (atención lineal, decodificación especulativa, mezcla de expertos u otras). El autor señala que el modelo está en desarrollo activo y que su rendimiento se irá mejorando.

## Capacidades

- Generación de texto en inglés: es la tarea principal declarada en el pipeline de Hugging Face (`text-generation`).
- Especialización por tarea: el autor indica que el modelo puede especializarse para tareas concretas, aunque no se detallan cuáles ni mediante qué mecanismo (fine-tuning, adaptadores, etc.).
- Ejecución en CPU: el modelo está diseñado para funcionar en dispositivos de gama baja sin GPU.
- Etiqueta «code»: el repositorio incluye la etiqueta `code`, lo que sugiere algún grado de orientación o presencia de código en el entrenamiento, aunque no se documenta explícitamente ninguna capacidad de generación de código.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Experimentación educativa con tokenizadores BPE: al incluir un tokenizador propio basado en turboBPE, el modelo sirve para estudiar el impacto del tokenizador en modelos de escala reducida dentro de cursos o proyectos de investigación sobre NLP.
- Prototipado de completado de texto en dispositivos embebidos: su tamaño inferior a 50M de parámetros permite integrarlo en aplicaciones de borde (Raspberry Pi, microcontroladores con suficiente memoria) para autocompletado o generación de respuestas cortas en inglés, siempre que se validen previamente los pesos publicados.
- Fine-tuning para dominios acotados: el autor indica que el modelo puede especializarse; un equipo podría ajustarlo con un corpus pequeño propio (por ejemplo, respuestas de soporte técnico) y desplegarlo en CPU dentro de una intranet.
- Generación de texto auxiliar en pipelines de CI: para tareas de relleno de plantillas, generación de descripciones cortas o resúmenes de una línea en inglés, donde la latencia en CPU sea aceptable y no se requiera alta calidad.
- Base para investigación sobre eficiencia: útil como punto de partida para comparar técnicas de compresión, cuantización o destilación en modelos por debajo de 100M de parámetros.
- Docencia y demostraciones de despliegue: su licencia MIT y su requisito de CPU lo hacen adecuado para talleres donde se enseña a servir modelos con PyTorch o llama.cpp sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamaño declarado (menos de 50M de parámetros), en FP32 ocuparía del orden de 200 MB de pesos, y en cuantizaciones de 8 o 4 bits, bastante menos. Estas cifras son estimaciones por escala, no datos publicados por el autor.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU.
- Compatibilidad con GPU de consumo: por su tamaño, cabría en cualquier GPU de consumo moderna, pero no hay confirmación oficial ni formatos cuantizados publicados.
- Opciones de despliegue: la librería declarada es PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos | Idiomas |
|---|---|---|---|---|---|
| SmallLM (codebyam) | < 50M | No disponible | MIT | No liberados aún (según model card) | Inglés |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 tokens | Apache 2.0 | Públicos | Inglés |
| Qwen2.5-0.5B | 0,49B | 32.768 tokens | Apache 2.0 | Públicos | Multilingüe |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Apache 2.0 | Públicos | Inglés |

La comparación se ofrece a título orientativo por categoría (modelos pequeños desplegables en CPU); no se dispone de datos de rendimiento de SmallLM que permitan una comparación cuantitativa. Los datos de los modelos alternativos provienen de sus respectivas model cards públicas.

## Limitaciones y advertencias

- Pesos no publicados: la propia model card indica que el modelo «no ha sido liberado todavía», por lo que no es posible evaluarlo ni utilizarlo en producción en el momento de redactar esta ficha.
- Tamaño muy reducido: con menos de 50M de parámetros, la calidad de generación será previsiblemente baja en comparación con modelos de mayor escala; el autor reconoce que puede rendir peor que modelos más grandes.
- Datos de entrenamiento opacos: no se detalla la composición del corpus, lo que impide evaluar sesgos, contaminación de benchmarks o cobertura lingüística real.
- Riesgo de alucinación: inherente a los modelos generativos pequeños entrenados con datos limitados; no hay evaluaciones publicadas que lo cuantifiquen.
- Idioma: solo se declara inglés; no hay soporte documentado de castellano ni de otros idiomas.
- Contexto: se desconoce la ventana de contexto, lo que impide planificar su uso en conversaciones multi-turno o documentos largos.
- Licencia MIT: permisiva para uso comercial, pero al no haber pesos publicados no puede ejercerse todavía ese derecho sobre artefactos concretos.
- Madurez: proyecto individual en desarrollo activo, sin garantías de mantenimiento ni soporte; la fecha de actualización del repositorio (2026) no implica una versión estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codebyam/SmallLM
- Repositorio del tokenizador turboBPE: https://github.com/Amrendra-gupta/turbobpe
