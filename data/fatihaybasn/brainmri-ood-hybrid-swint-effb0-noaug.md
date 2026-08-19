# Fatihaybasn/brainmri-ood-hybrid-swint-effb0-noaug

## Resumen

Este modelo es un clasificador binario de imágenes de resonancia magnética cerebral (MRI) que distingue entre presencia y ausencia de tumor. Fue desarrollado por Fatih Ayibasan como parte de un proyecto académico comparativo que evalúa la generalización *out-of-distribution* (OOD) de diez arquitecturas de visión por computador. El checkpoint concreto combina un backbone Swin Transformer Tiny con un EfficientNet-B0 en una arquitectura híbrida, entrenado sin aumentación de datos.

El modelo resuelve el problema de detectar tumores cerebrales en MRI cuando las imágenes provienen de dominios distintos a los de entrenamiento (cambios de resolución, protocolos de adquisición y fuentes). Su relevancia radica en que forma parte de un benchmark de 13 experimentos que compara arquitecturas estándar, híbridas y personalizadas bajo condiciones de desplazamiento de fuente y resolución. Con 32,09 millones de parámetros y una entrada de 224×224 píxeles, ofrece un rendimiento moderado en precisión (0,745) pero un AUC alto (0,956) en el conjunto OOD externo.

La licencia MIT permite uso comercial, aunque el autor declara explícitamente que el modelo es solo para fines de investigación y educación, no para diagnóstico clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Swin Transformer Tiny + EfficientNet-B0 (hybrid_swint_effb0) |
| Parametros totales | 32.093.976 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (clasificación de imágenes) |
| Licencia | MIT |
| Formato de pesos | safetensors (tensor-only) |

## Arquitectura y entrenamiento

La arquitectura combina un Swin Transformer Tiny como extractor de características globales con un EfficientNet-B0 como extractor de características locales, fusionando ambas ramas en un clasificador binario. El modelo opera con imágenes de 224×224 píxeles y produce dos clases: `no_tumor` (0) y `tumor` (1). El umbral de decisión óptimo encontrado en validación es 0,048, lo que indica un sesgo hacia la clase positiva.

El entrenamiento utilizó 11.500 imágenes provenientes de pools de resolución fija de 256 px y 512 px. La evaluación OOD externa empleó 3.500 imágenes con resoluciones variables entre 190 px y 800 px, simulando condiciones de desplazamiento de fuente y resolución. No se aplicó aumentación de datos en este checkpoint concreto. El proyecto completo incluye variantes con aumentación al 30% y sin aumentación, así como arquitecturas personalizadas como `custom_msaf_effb0`. No se menciona el uso de técnicas de alineamiento como RLHF o DPO, dado que es un modelo supervisado de clasificación.

## Capacidades

- Clasificación binaria de imágenes MRI cerebrales: distingue entre tumor y no tumor.
- Generalización out-of-distribution: evaluado con imágenes de resoluciones y fuentes distintas a las de entrenamiento.
- Extracción de características híbridas: combina atención global (Swin Transformer) con convoluciones eficientes (EfficientNet).
- Inferencia con entrada estándar de 224×224 píxeles.
- Integración con el ecosistema timm y PyTorch mediante safetensors.
- Reproducibilidad: incluye hashes SHA-256 del checkpoint original y del publicado, junto con notebooks y métricas detalladas en el repositorio.

## Casos de uso

- Investigación académica en generalización OOD: el modelo sirve como referencia para estudiar cómo las arquitecturas híbridas manejan el desplazamiento de dominio en imagen médica, comparándolo con otras 12 configuraciones del benchmark.
- Benchmark de arquitecturas para detección de tumores: permite a investigadores evaluar el equilibrio entre precisión, sensibilidad y AUC en condiciones de resolución variable.
- Desarrollo de pipelines de clasificación médica experimental: puede integrarse en prototipos de investigación que requieran un clasificador binario rápido con entrada de 224×224, siempre que se respete la limitación de no uso clínico.
- Estudio del efecto de la aumentación de datos: al existir una variante con aumentación al 30% del mismo modelo, se puede comparar el impacto de esta técnica en la robustez OOD.
- Educación en deep learning aplicado a imagen médica: el repositorio incluye notebooks, configuraciones y resultados que permiten reproducir el entrenamiento y entender el flujo completo.
- Evaluación de estrategias de umbral de decisión: el checkpoint publica un umbral óptimo de 0,048, útil para estudiar cómo ajustar el punto de operación en problemas con clases desbalanceadas.

## Benchmarks y rendimiento

El modelo se evaluó en el conjunto OOD externo del proyecto (3.500 imágenes). Los resultados de este checkpoint son los siguientes:

| Metrica | Valor |
|---|---:|
| Accuracy | 0,744851 |
| AUC | 0,956261 |
| F1 | 0,665323 |
| Recall / Sensibilidad | 0,498489 |
| Precision | 1,000000 |
| Cohen's Kappa | 0,494070 |

El benchmark completo del proyecto (13 experimentos) se presenta a continuación, ordenado por accuracy:

| Experimento | Accuracy | AUC | F1 | Recall | Precision | Kappa |
|---|---:|---:|---:|---:|---:|---:|
| custom_msaf_effb0_My_model_0.3_augmentation | 0,908 | 0,988 | 0,901 | 0,822 | 0,998 | 0,817 |
| hybrid_dn121_effb0_0.3_augmentation | 0,861 | 0,967 | 0,841 | 0,726 | 1,000 | 0,723 |
| hybrid_dn121_effb0_not_augmentation | 0,839 | 0,939 | 0,812 | 0,684 | 1,000 | 0,680 |
| custom_msaf_effb0_My_model_not_augmentation | 0,805 | 0,936 | 0,764 | 0,618 | 0,999 | 0,613 |
| hybrid_swinT_effb0_0.3_augmentation | 0,795 | 0,975 | 0,748 | 0,599 | 0,997 | 0,593 |
| resnet34_not_augmentatiton | 0,794 | 0,954 | 0,747 | 0,596 | 0,999 | 0,591 |
| densenet121 | 0,785 | 0,984 | 0,732 | 0,578 | 1,000 | 0,573 |
| convnext_tiny | 0,775 | 0,960 | 0,716 | 0,557 | 1,000 | 0,553 |
| **hybrid_swinT_effb0_not_augmentation (este checkpoint)** | 0,745 | 0,956 | 0,665 | 0,498 | 1,000 | 0,494 |
| resnet50_not_augmentatiton | 0,719 | 0,962 | 0,619 | 0,448 | 1,000 | 0,444 |
| inception_v3_not_augmentation | 0,710 | 0,901 | 0,602 | 0,430 | 1,000 | 0,426 |
| efficientnet_b0 | 0,693 | 0,903 | 0,568 | 0,397 | 0,997 | 0,392 |
| mobilenetv2_100_not_augmentation | 0,639 | 0,889 | 0,450 | 0,290 | 1,000 | 0,286 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 32,09 millones de parámetros, el modelo ocupa aproximadamente 128 MB en precisión fp32 y 64 MB en fp16. La inferencia de una sola imagen de 224×224 requiere menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1650, RTX 3060, RTX 4090 o superiores funcionan sin problema. También es viable en CPU para inferencia por lotes pequeños.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer actual, incluidas las integradas de gama media.
- Opciones de despliegue: al ser un modelo timm/PyTorch, se puede servir con TorchServe, FastAPI, o exportar a ONNX para runtime ligero. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la documentación del autor. Como referencia orientativa, una arquitectura híbrida de este tamaño procesa decenas de imágenes por segundo en una GPU moderna, pero este dato no está verificado.

## Comparativa con modelos similares

El propio proyecto proporciona una comparativa directa con otras arquitecturas del mismo benchmark. A continuación se comparan los modelos más relevantes del mismo tamaño aproximado:

| Modelo | Accuracy OOD | AUC | F1 | Precision | Parametros (aprox.) |
|---|---:|---:|---:|---:|---:|
| hybrid_swinT_effb0_not_augmentation (este) | 0,745 | 0,956 | 0,665 | 1,000 | 32,1 M |
| resnet34_not_augmentatiton | 0,794 | 0,954 | 0,747 | 0,999 | ~21,3 M |
| convnext_tiny | 0,775 | 0,960 | 0,716 | 1,000 | ~28,6 M |
| efficientnet_b0 | 0,693 | 0,903 | 0,568 | 0,997 | ~5,3 M |
| hybrid_swinT_effb0_0.3_augmentation | 0,795 | 0,975 | 0,748 | 0,997 | 32,1 M |

La variante con aumentación del mismo modelo mejora notablemente la accuracy (0,795 frente a 0,745) y el AUC (0,975 frente a 0,956), lo que indica que la ausencia de aumentación penaliza la generalización. ResNet34 y ConvNeXt-Tiny superan a este checkpoint en accuracy y F1, aunque todos mantienen una precision cercana a 1,0. EfficientNet-B0 puro, con muchos menos parámetros, obtiene peores resultados.

## Limitaciones y advertencias

- Clasificación binaria únicamente: no identifica el tipo de tumor, su localización, grado ni pronóstico.
- Sin validación clínica: el modelo no ha pasado revisión regulatoria ni validación en poblaciones clínicas reales. No debe usarse para diagnóstico ni decisiones médicas.
- Sesgo de datos: el entrenamiento se realizó con 11.500 imágenes de pools de resolución fija; el conjunto OOD externo tiene resoluciones variables (190-800 px), lo que puede introducir sesgos de fuente y artefactos de imagen.
- Riesgo de fuga de sujetos: el autor advierte de posibles riesgos de solapamiento de sujetos entre conjuntos.
- Rendimiento OOD limitado en sensibilidad: el recall de 0,498 indica que aproximadamente la mitad de los tumores reales no se detectan en el conjunto externo, aunque la precision es perfecta (1,0). Esto implica un sesgo conservador hacia la clase negativa.
- Umbral de decisión específico: el umbral óptimo de 0,048 es inusualmente bajo y puede no transferirse a otros conjuntos de datos.
- Sin soporte multilingüe ni multimodal: es un modelo de visión puro, sin capacidades de texto.
- Licencia MIT: permite uso comercial, pero el autor restringe el uso a investigación y educación en la model card, lo que puede generar conflictos en entornos productivos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Fatihaybasn/brainmri-ood-hybrid-swint-effb0-noaug
- Repositorio del proyecto (notebooks, entrenamiento, informes): https://github.com/fatihaybsn/BrainMRI-OOD-10Models
- Commit de referencia: https://github.com/fatihaybsn/BrainMRI-OOD-10Models/commit/a9920408189230b886773a64d113eb35bcba1971
- Archivo CITATION.cff para citar el proyecto: https://github.com/fatihaybsn/BrainMRI-OOD-10Models/blob/main/CITATION.cff
