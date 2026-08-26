# MohammadKhosravi/llama3.1-8b-pmt-dual-factorized

## Resumen

Este modelo es un adaptador PEFT experimental que aplica la arquitectura PrefixMemory-Tuning (PMT) sobre el modelo base meta-llama/Llama-3.1-8B-Instruct. El trabajo, desarrollado por MohammadKhosravi, implementa una variante denominada *dual-tier factorized* que descompone el control de complejidad lingüística en dos flujos de parámetros independientes: uno léxico y otro sintáctico. La motivación principal es ajustar el nivel de complejidad del texto generado según niveles CEFR (Marco Común Europeo de Referencia para las Lenguas) y alineación temática, un problema relevante para aplicaciones de enseñanza de idiomas y generación de contenido adaptativo.

La propuesta elimina los cuellos de botella de rango bajo típicos de los adaptadores PEFT y utiliza matrices de memoria completas de 4096×4096 por capa (32 capas), junto con dos tablas de búsqueda `nn.Embedding(6, 4096)` que mapean contenedores léxicos y sintácticos. El repositorio pesa 1.2 GB y se distribuye bajo licencia MIT, aunque no se especifican idiomas soportados ni hay métricas de evaluación publicadas. El modelo es de carácter experimental y no presenta resultados de benchmarks en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Llama 3.1 8B Instruct) con adaptadores PMT dual-tier factorized |
| Parametros totales | no disponible (adaptador PEFT de 1.2 GB sobre base de 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada de Llama 3.1 8B) |
| Tipos de cuantizacion | no disponible (repositorio solo contiene pesos del adaptador) |
| Idiomas soportados | no disponibles en la informacion del autor |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

La arquitectura es una variante de PrefixMemory-Tuning (PMT) que elimina la compresion de rango bajo en las matrices de memoria. El diseño implementa dos flujos de control independientes: uno léxico y otro sintáctico, cada uno con su propia tabla de embeddings `nn.Embedding(6, 4096)` que clasifica el texto en seis contenedores (bins). El vector de control final se construye concatenando ambas representaciones y proyectándolas mediante un MLP compartido de 8192 a 4096 dimensiones, generando así un vector de modulación `v` que se aplica a las capas del transformer.

El entrenamiento se realizó sobre el dataset EFCAMDAT, aunque el autor no especifica el número exacto de tokens ni la composición del dataset en esta variante. Los datos de pérdida muestran un comportamiento de sobreajuste: la pérdida de entrenamiento desciende de 2.1524 a 0.3458 entre la primera y cuarta época, mientras que la pérdida de validación empeora de 2.0114 a 2.7829, con la perplejidad de validación subiendo de 7.47 a 16.17. No se menciona el uso de RLHF ni DPO; la técnica es un PEFT con matrices de memoria completas, inspirada en el método Control Prefixes (Clive et al., 2022).

## Capacidades

- **Control de complejidad lingüística**: permite ajustar el nivel de complejidad del texto generado mediante la selección de contenedores léxicos y sintácticos (basados en MTLD/Type-Token y MDD/Longitud de frase).
- **Alineación con niveles CEFR**: el modelo está entrenado para generar texto que se corresponda con niveles del Marco Común Europeo de Referencia (A1-C2), útil para aplicaciones de enseñanza de idiomas.
- **Alineación temática**: la arquitectura dual permite condicionar la generación tanto por tema como por nivel de complejidad.
- **Generación de texto instructivo**: hereda las capacidades de base de Llama 3.1 8B Instruct, incluyendo razonamiento y generación de texto en múltiples idiomas.
- **Tool calling**: no hay evidencia de que el adaptador preserve o mejore las capacidades de tool calling de la base; no se menciona en la documentación.
- **Modo agente**: no documentado; es un adaptador de investigación, no una versión de producción.

## Casos de uso

- **Plataformas de aprendizaje de idiomas**: el modelo puede generar ejercicios de lectura o comprensión adaptados al nivel CEFR del estudiante. Por ejemplo, un sistema de práctica de inglés podría seleccionar automáticamente el nivel léxico y sintáctico adecuado para generar textos de práctica para un alumno en nivel B1.
- **Generación de materiales didácticos**: producción de lecturas graduadas, ejercicios de vocabulario y textos de ejemplo para libros de texto, donde el control de complejidad es crítico para la progresión pedagógica.
- **Evaluación automática de complejidad**: el modelo podría usarse para reescribir o simplificar textos existentes a un nivel objetivo, útil en sistemas de simplificación de noticias o documentos para lectores con baja alfabetización.
- **Investigación en PEFT**: sirve como referencia para estudiar el impacto de matrices de memoria completas frente a métodos de rango bajo (LoRA) en el control de atributos finos de generación.
- **Sistemas de escritura asistida**: para generar borradores de contenido con un nivel de formalidad y complejidad deseado, por ejemplo, redacción de resúmenes ejecutivos frente a versiones divulgativas.
- **Pruebas de robustez lingüística**: en entornos de investigación, se puede usar para probar la sensibilidad de los modelos a variaciones de complejidad léxica y sintáctica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos numéricos son las pérdidas de entrenamiento y validación del proceso de entrenamiento, que muestran sobreajuste a partir de la segunda época:

| Epoca | Pérdida de entrenamiento | Pérdida de validación | Perplejidad de validación |
|---|---|---|---|
| 1 | 2.1524 | 2.0114 | 7.47 |
| 2 | 1.6751 | 2.0077 | 7.45 |
| 3 | 0.95 | 2.3068 | 10.04 |
| 4 | 0.3458 | 2.7829 | 16.17 |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- **VRAM estimada**: al ser un adaptador PEFT sobre Llama 3.1 8B, la VRAM depende de la cuantización del modelo base. Con cuantización de 4 bits, se estima un consumo de unos 6-8 GB de VRAM; con precisión completa de 16 bits, se necesitan alrededor de 16-20 GB.
- **GPU recomendadas**: RTX 3090/4090 (24 GB) para inferencia con precisión completa; GPUs de 8-12 GB (RTX 3060/4070) para cuantización de 4 bits.
- **Consumer GPU**: Sí, es viable en GPUs de gama media-alta con cuantización.
- **Opciones de despliegue**: al ser un adaptador PEFT, se debe cargar sobre el modelo base con la librería de transformers y la integración de PEFT. No se han publicado versiones GGUF ni soporte directo para Ollama o llama.cpp.
- **Latencia y throughput**: no disponible; depende del hardware y de la configuración de cuantización del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| **Este modelo (PMT dual-factorized)** | 8B (base) + adaptador | 128K | MIT | Control de complejidad CEFR con matrices de memoria completas |
| **MohammadKhosravi/llama3.1-8b-pure-pmt-cefr-gating-6k** | 8B (base) + adaptador | 128K | MIT | PMT con gating CEFR, dataset de 6K muestras |
| **MohammadKhosravi/llama3.1-8b-pure-pmt-cefr-gating-60K** | 8B (base) + adaptador | 128K | MIT | PMT con gating CEFR, dataset completo de 52 657 muestras |
| **LoRA estándar sobre Llama 3.1 8B** | 8B (base) + adaptador | 128K | MIT | Ajuste de bajo rango genérico |

La comparativa muestra que este modelo se diferencia de las variantes *pure PMT* por su diseño dual-tier factorizado, que separa el control léxico y sintáctico en dos flujos de parámetros. No hay comparación con modelos comerciales o de propósito general porque el objetivo es específico y de investigación.

## Limitaciones y advertencias

- **Sobreajuste**: los datos de entrenamiento muestran una clara sobreajuste (la pérdida de validación empeora mientras la de entrenamiento mejora), lo que indica que el modelo no generaliza bien más allá de la primera o segunda época.
- **Falta de validación**: no se han publicado resultados de benchmarks ni evaluaciones independientes, por lo que su rendimiento real en tareas de generación controlada es desconocido.
- **Idiomas no especificados**: no se indica qué idiomas soporta el adaptador; la base Llama 3.1 8B soporta 8 idiomas, pero el adaptador se entrenó con un dataset de inglés (EFCAMDAT).
- **Riesgo de alucinación**: al ser un adaptador sobre un modelo instruct, hereda los riesgos de alucinación del modelo base, sin evidencia de mitigación.
- **Uso comercial**: la licencia MIT permite uso comercial, pero el modelo base de Llama 3.1 8B tiene su propia licencia de Meta que requiere aceptación de términos y no es compatible con usos de alto riesgo.
- **Estado experimental**: es un repositorio con 0 descargas y 0 likes, sin documentación adicional, lo que indica que es un experimento de investigación sin validación externa.
- **Formato de pesos**: solo se distribuye el adaptador PEFT, no el modelo completo; requiere descargar la base de Llama 3.1 8B Instruct, que es un archivo grande (~16 GB).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MohammadKhosravi/llama3.1-8b-pmt-dual-factorized
- Modelo variante (PMT puro con gating CEFR 6K): https://huggingface.co/MohammadKhosravi/llama3.1-8b-pure-pmt-cefr-gating-6k
- Modelo variante (PMT puro con gating CEFR 60K): https://huggingface.co/MohammadKhosravi/llama3.1-8b-pure-pmt-cefr-gating-60K
- Blog oficial de Meta sobre Llama 3.1: https://ai.meta.com/blog/meta-llama-3-1/
- Repositorio oficial de Llama 3 en GitHub: https://github.com/meta-llama/llama3
- Repositorio de llama-models: https://github.com/meta-llama/llama-models/blob/main/README.md
