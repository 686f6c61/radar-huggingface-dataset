# OneScience-Group/SimpleFold

## Resumen

SimpleFold es un modelo generativo de plegamiento de proteínas desarrollado originalmente por Apple y publicado en Hugging Face por el grupo OneScience. Su objetivo es predecir la estructura tridimensional de una proteína a partir de su secuencia de aminoácidos en formato FASTA, generando salidas en formato mmCIF o PDB. A diferencia de otros predictores basados en arquitecturas tipo transformer con entrenamiento autoregresivo, SimpleFold emplea capas Transformer estándar combinadas con un objetivo de *flow matching*, una técnica de modelado generativo que permite muestrear estructuras de forma continua y eficiente.

El paquete publicado incluye dos tamaños de checkpoint (SimpleFold-1B y SimpleFold-100M), además de pesos auxiliares para pLDDT (predicción de confianza por residuo), archivos CCD (Chemical Component Dictionary), pesos de Boltz y una copia local de ESM-2 3B para representaciones de secuencia. El repositorio está organizado para permitir inferencia offline, entrenamiento desde cero y fine-tuning, con scripts preparados para entornos NVIDIA GPU y Hygon DCU. Su licencia MIT facilita su uso comercial y académico, y su relevancia actual radica en ofrecer una alternativa abierta y entrenable para la predicción de estructura de proteínas, un campo dominado por sistemas propietarios o con restricciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estándar con objetivo de *flow matching* |
| Parametros totales | Dos variantes: SimpleFold-1B (aprox. 1.000 millones) y SimpleFold-100M (aprox. 100 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado (los pesos se distribuyen como checkpoints de PyTorch) |
| Idiomas soportados | en, zh (etiquetas de metadatos; el modelo opera sobre secuencias de proteínas, no texto natural) |
| Licencia | MIT |
| Formato de pesos | Checkpoints de PyTorch (`.ckpt`), con pesos auxiliares en el directorio `weight/` |

## Arquitectura y entrenamiento

SimpleFold se basa en capas Transformer estándar y utiliza un objetivo de *flow matching* para modelar la distribución de estructuras proteicas. En lugar de predecir directamente las coordenadas atómicas, el modelo aprende un flujo continuo que transforma ruido gaussiano en estructuras 3D válidas, condicionado por la secuencia de entrada. Este enfoque permite generar múltiples conformaciones muestreadas, lo que resulta útil para estudiar el paisaje conformacional de una proteína.

Los detalles exactos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se especifican en la información disponible. Sin embargo, el repositorio incluye scripts de procesamiento de datos (`process_data.py` y `tokenize_data.py`) que aceptan archivos mmCIF como entrada, lo que sugiere un pipeline basado en estructuras experimentales del PDB. También se proporcionan pesos de ESM-2 3B, probablemente utilizados para extraer representaciones de secuencia que se incorporan como características auxiliares. La inclusión de pesos de pLDDT y CCD indica que el modelo también produce estimaciones de confianza por residuo y maneja la química de ligandos o modificaciones.

## Capacidades

- Predicción de estructura de proteínas a partir de secuencias FASTA, generando salidas en formato mmCIF o PDB.
- Inferencia local offline: todos los pesos y ejemplos necesarios están incluidos en el repositorio, permitiendo ejecutar los scripts sin conexión.
- Entrenamiento desde cero y fine-tuning: soporta la validación de pipelines de entrenamiento tras preparar datos tokenizados según los archivos de configuración en `config/data/*.yaml`.
- Reanudación de entrenamiento y fine-tuning mediante checkpoints (ejemplo: `train.py load_ckpt_path=weight/simplefold_100M.ckpt`).
- Soporte para entornos con GPU NVIDIA y DCU de Hygon, con instrucciones específicas para cada plataforma.
- Incluye pesos auxiliares para pLDDT (confianza por residuo), CCD (diccionario químico) y ESM-2 3B (representaciones de secuencia), lo que amplía su utilidad en tareas de biología estructural.

## Casos de uso

- Predicción de estructura de proteínas en investigación académica: un investigador puede pasar una secuencia FASTA de una proteína desconocida y obtener un modelo 3D en formato PDB o mmCIF para su posterior análisis, sin depender de servicios externos.
- Validación de pipelines de entrenamiento en entornos de laboratorio: los scripts de entrenamiento y fine-tuning permiten probar la reproducibilidad del modelo con datos propios, útil para grupos que desarrollan nuevas variantes o estudian el efecto de mutaciones.
- Inferencia offline en entornos con conectividad restringida: al incluir todos los pesos y ejemplos en el repositorio, SimpleFold puede ejecutarse en clústeres aislados o en instalaciones con políticas de seguridad estrictas.
- Generación de múltiples conformaciones para estudios de dinámica: gracias al objetivo de *flow matching*, el modelo puede muestrear varias estructuras plausibles para una misma secuencia, lo que ayuda a explorar la flexibilidad conformacional de proteínas.
- Integración en flujos de trabajo de diseño de proteínas: los investigadores pueden combinar SimpleFold con herramientas de diseño racional para evaluar la estabilidad o la función de variantes diseñadas, usando las predicciones como criterio de filtrado.
- Formación y evaluación de modelos en entornos educativos: al ser un modelo abierto con licencia MIT, puede utilizarse en cursos de bioinformática para enseñar conceptos de predicción de estructura y modelado generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como TM-score, RMSD o comparaciones con AlphaFold, ESMFold u otros predictores en la model card ni en los metadatos del repositorio.

## Requisitos de hardware

- Se recomienda una GPU NVIDIA o una DCU de Hygon para ejecutar inferencia de forma eficiente.
- Una CPU puede utilizarse para comprobaciones básicas de conectividad, pero la ejecución será lenta.
- Para usuarios de DCU, se requiere instalar DTK (versión 25.04.2 o posterior, o una versión recomendada por OneScience).
- No se especifica la VRAM mínima necesaria. Dado que el modelo más grande tiene aproximadamente 1.000 millones de parámetros y se incluye ESM-2 3B como peso auxiliar, se estima que se necesitan al menos 8 GB de VRAM para la variante de 1B en precisión FP16, y más si se utilizan los pesos de ESM-2. Sin embargo, esta estimación no está confirmada por la documentación oficial.
- Opciones de despliegue: el repositorio proporciona scripts Python para inferencia y entrenamiento, con soporte para PyTorch y FSDP (entrenamiento distribuido). No se mencionan integraciones con vLLM, llama.cpp u otros motores de inferencia optimizados, ya que el modelo no es un LLM de texto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleFold | Transformer + flow matching | 100M y 1B | No disponible | MIT | Hugging Face (OneScience-Group) |
| AlphaFold2 | Evoformer + estructura | ~93M (sin contar ESM) | No aplica | Apache 2.0 (código), pesos con restricciones | DeepMind / GitHub |
| ESMFold | Transformer autoregresivo (ESM-2) | ~650M (ESM-2) | No aplica | MIT (ESM-2), pesos con restricciones | Meta AI / Hugging Face |

La comparación es limitada porque no se dispone de métricas de rendimiento de SimpleFold. A diferencia de AlphaFold2, que utiliza una arquitectura especializada (Evoformer) y un pipeline de múltiples módulos, SimpleFold opta por un enfoque más simple basado en Transformer estándar y *flow matching*. ESMFold, por su parte, se basa en un modelo de lenguaje de proteínas preentrenado y genera estructuras de forma directa, sin necesidad de MSA (alineamiento múltiple de secuencias). SimpleFold podría ofrecer ventajas en términos de simplicidad y facilidad de entrenamiento, pero su rendimiento relativo sigue sin documentarse.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que se desconoce su precisión comparativa frente a AlphaFold2, ESMFold u otros predictores establecidos.
- La información disponible no detalla posibles sesgos en los datos de entrenamiento ni riesgos de alucinación estructural (predicciones incorrectas con alta confianza). Es recomendable validar las estructuras generadas con métodos experimentales o herramientas de evaluación como pLDDT.
- El modelo está pensado para secuencias de proteínas; no se menciona soporte para ácidos nucleicos, ligandos o modificaciones postraduccionales complejas (aunque la inclusión de CCD sugiere cierto manejo de química).
- La documentación está en inglés y chino, y el soporte técnico se canaliza a través de OneScience, lo que podría limitar su accesibilidad para otros idiomas.
- Aunque la licencia es MIT, los pesos auxiliares (ESM-2 3B, Boltz) pueden tener licencias o restricciones adicionales; es necesario revisar cada componente antes de un uso comercial.
- El repositorio no incluye un dataset de entrenamiento; los usuarios deben preparar sus propios datos en formato mmCIF y tokenizarlos, lo que requiere un pipeline adicional.
- No se proporcionan instrucciones claras sobre cómo manejar secuencias muy largas o proteínas multiméricas; la longitud de contexto no está especificada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OneScience-Group/SimpleFold
- Repositorio principal de OneScience (GitHub): https://github.com/onescience-ai/OneScience
- Repositorio de habilidades OneScience (GitHub): https://github.com/onescience-ai/oneskills
- Repositorio principal de OneScience (Gitee): https://gitee.com/onescience-ai/onescience
- Repositorio de habilidades OneScience (Gitee): https://gitee.com/onescience-ai/oneskills
- Entorno online OneCode (enlace de demostración): https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
