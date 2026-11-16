# sahithimacharapu2/ec-esm9

## Resumen

ESM-2 35M Enzyme EC Number Classifier es un modelo de clasificación de proteínas desarrollado por el usuario sahithimacharapu2 y publicado en Hugging Face. Consiste en un ajuste fino (fine-tuning) del backbone ESM-2 de 35 millones de parámetros de Meta AI (`facebook/esm2_t12_35M_UR50D`) al que se le añade una cabeza clasificadora para predecir el número EC (Enzyme Commission) de una enzima a partir de su secuencia de aminoácidos. El modelo resuelve el problema de anotación funcional automática de enzimas, una tarea central en bioinformática y biología computacional.

La arquitectura combina el transformer ESM-2 de 12 capas y dimensión oculta de 480 con una cabeza MLP de dos capas (Linear-GELU-Linear) y dropout de 0,1, con las 4 primeras capas del backbone congeladas durante el entrenamiento. El vocabulario de salida contiene 6939 números EC válidos y la evaluación se realiza a los 4 niveles jerárquicos de la taxonomía EC (L1–L4), siendo la métrica principal la accuracy en L4.

El modelo es relevante por su ligereza (repo de 0,1 GB, backbone de 35M de parámetros) y por empaquetarse con un pipeline de inferencia reproducible basado en Docker, con parámetros configurables de tiempo, batch y umbral de probabilidad. Está orientado a entornos donde se requiere clasificación enzimática a escala sin infraestructura de GPU de gran tamaño, aunque su adopción es todavía nula (0 descargas, 0 likes) y la documentación de resultados es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ESM-2 (12 capas, hidden size 480) + cabeza MLP clasificadora (Linear-GELU-Linear, dropout 0,1) |
| Parametros totales | ~35M en el backbone ESM-2 (el total con cabeza clasificadora no se especifica) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por el tokenizador ESM-2, típicamente 1022 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de idioma del repo; el modelo opera sobre secuencias de aminoácidos, no sobre lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (backbone ESM-2) y PyTorch state_dict `.pt` (cabeza clasificadora) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado de ESM-2 35M (`facebook/esm2_t12_35M_UR50D`), un transformer encoder de 12 capas con dimensión oculta de 480 entrenado originalmente por Meta AI sobre secuencias de proteínas (UniRef50). Sobre el backbone se añade una cabeza clasificadora secuencial: Dropout(0,1) → Linear(480, 480) → GELU → Dropout(0,1) → Linear(480, num_classes), donde `num_classes` corresponde al conjunto de números EC de cuarto nivel del vocabulario (`ec_vocabulary.json`, 6939 entradas válidas). Durante el ajuste se congelan las 4 primeras capas del backbone (`n_freeze=4`), lo que reduce el coste de entrenamiento y actúa como regularización.

La model card no especifica el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO (poco habituales en clasificación de proteínas). Tampoco se documenta el esquema de decodificación multi-etiqueta: el script de inferencia admite un umbral de probabilidad (`EC_THRESH`, por defecto 0,5) para emitir predicciones adicionales más allá de la top-1, lo que sugiere un enfoque multi-label con fallback a un EC por defecto (`fallback_ec` en `classes.json`). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de enzimas a partir de secuencia de aminoácidos en los 4 niveles de la taxonomía EC (L1–L4), con predicción principal en L4.
- Predicción multi-etiqueta: emite una o varias predicciones por secuencia según el umbral `EC_THRESH` (0,5 por defecto; `1.1` para forzar top-1).
- Procesamiento por lotes configurable (`EC_BATCH`, por defecto 32) con límite de tiempo de inferencia (`EC_TIME_BUDGET`, por defecto 660 s).
- Entrada en formato Parquet con columnas `id` y `sequence`; salida en JSONL con `{"id": ..., "prediction": ["x.x.x.x", ...]}`.
- Despliegue reproducible mediante Docker con pesos incluidos en el repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe no aplicable: opera sobre secuencias biológicas, no sobre texto en lenguaje natural.

## Casos de uso

- Anotación funcional a gran escala de proteínas no caracterizadas: dado un proteoma o metagenoma en formato FASTA convertido a Parquet, el modelo predice el número EC de cada secuencia, permitiendo priorizar candidatos para validación experimental.
- Enriquecimiento de bases de datos enzimáticas: integración en pipelines de curado para asignar números EC a entradas con anotación incompleta, usando el umbral configurable para controlar la precisión frente al recall.
- Filtrado en descubrimiento de enzimas industriales: clasificación de bibliotecas de secuencias (por ejemplo, lipasas, celulasas o proteasas) por clase EC antes de ensayos de actividad, reduciendo el número de candidatos a testar.
- Análisis de metagenomas ambientales: procesamiento por lotes de secuencias cortas procedentes de muestras de suelo, agua o microbiota para inferir el perfil enzimático de la comunidad.
- Docencia y prototipado en bioinformática: el empaquetado Docker con pesos incluidos permite reproducir el pipeline en un portátil o en un nodo CPU, sin necesidad de descargar checkpoints adicionales.
- Componente en pipelines de anotación tipo UniProt/InterPro: uso como señal complementaria junto a herramientas HMM (Pfam, TIGRFAM) para triangular la asignación EC y detectar discrepancias.
- Baseline para investigación en modelos proteicos: al ser un fine-tuning ligero de ESM-2 35M, sirve como referencia para comparar estrategias de congelación de capas o cabezas clasificadoras en tareas de predicción EC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la evaluación se realiza a los 4 niveles (L1–L4) con L4 accuracy como métrica principal, pero no incluye cifras concretas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el backbone de 35M de parámetros más la cabeza clasificadora; en la práctica, unas pocas centenas de MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, T4, RTX 3060, RTX 4090, A100, H100). El modelo también puede ejecutarse en CPU para lotes moderados.
- Cabe en cualquier GPU de consumo actual e incluso en iGPU con suficiente memoria compartida; el cuello de botella será el throughput, no la memoria.
- Opciones de despliegue: el repositorio proporciona un `Dockerfile` con `predict.py` como entrypoint; también es posible cargar el backbone con `transformers` (`EsmModel`) y la cabeza con `torch.load` sobre `classifier_head.pt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de este tipo).
- Latencia y throughput estimados: no disponibles. El límite `EC_TIME_BUDGET` de 660 s y el batch de 32 sugieren un diseño para volúmenes moderados en CPU/GPU única, pero no se aportan cifras de secuencias por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESM-2 35M EC Classifier (este modelo) | ~35M (backbone) | no disponible | Clasificación EC (L1–L4) | MIT | Hugging Face, repo 0,1 GB |
| ESM-2 35M base (`facebook/esm2_t12_35M_UR50D`) | 35M | 1022 tokens (aprox.) | Representaciones de proteínas (sin cabeza EC) | MIT | Hugging Face |
| ESM-2 650M (`facebook/esm2_t33_650M_UR50D`) | 650M | 1022 tokens (aprox.) | Representaciones de proteínas; base habitual para fine-tuning EC | MIT | Hugging Face |
| ProteInfer / DeepEC (herramientas especializadas en EC) | no disponible | no disponible | Predicción EC | variable | Repositorios académicos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación independiente de sus predicciones.
- La model card no reporta métricas de accuracy ni matrices de confusión por nivel EC, por lo que no es posible estimar su fiabilidad real en L1–L4.
- No se documenta el dataset de entrenamiento ni su composición, lo que impide evaluar sesgos de cobertura taxonómica (por ejemplo, sobrerrepresentación de enzimas bien estudiadas de organismos modelo).
- El vocabulario de salida está limitado a 6939 números EC; secuencias cuya enzima verdadera no esté en ese conjunto caerán en el `fallback_ec` o en una predicción incorrecta.
- Riesgo de alucinación en el sentido de asignar un EC con alta confianza a proteínas sin actividad enzimática o con función desconocida; no se documenta un mecanismo de abstención o clase "no enzima".
- El umbral `EC_THRESH` por defecto (0,5) puede generar múltiples predicciones por secuencia; para aplicaciones que requieran top-1 estricto debe configurarse a `1.1`, lo que altera el comportamiento respecto a la configuración evaluada.
- La longitud de contexto efectiva no está documentada; secuencias largas pueden truncarse según la configuración del tokenizador ESM-2.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del backbone original de Meta AI (también MIT en el caso de ESM-2).
- El repositorio incluye rutas de ejemplo con `YOUR_USERNAME` en la model card, lo que sugiere que la documentación no se ha revisado por completo antes de publicar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahithimacharapu2/ec-esm9
- Backbone ESM-2 35M: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- Repositorio de ejemplo citado en la model card (placeholder, no verificado): https://huggingface.co/YOUR_USERNAME/enzyme-ec-esm2
