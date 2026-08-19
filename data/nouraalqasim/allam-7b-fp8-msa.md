# NouraAlqasim/allam-7b-fp8-msa

## Resumen

El modelo `NouraAlqasim/allam-7b-fp8-msa` es una cuantización post-entrenamiento en precisión FP8 (W8A8) del modelo base `humain-ai/ALLaM-7B-Instruct-preview`, realizada con NVIDIA ModelOpt. La particularidad de esta versión es que las escalas de activación estáticas se calibraron con 128 diálogos en árabe estándar moderno (MSA), extraídos del dataset `Almheiri/ArabCulture-Dialogue`. Esto la diferencia de sus versiones hermanas calibradas con árabe del Golfo o con mezcla de dialectos.

El modelo base es un LLM instruct de 7.000 millones de parámetros, probablemente entrenado para tareas de generación de texto y diálogo en árabe. Esta cuantización reduce el uso de memoria y acelera la inferencia, manteniendo una pérdida de precisión mínima (error cuadrático medio en pesos de 8.084e-08). No es cargable directamente con `transformers` estándar; requiere el backend `modelopt` de vLLM u otro runtime compatible. Es relevante para despliegues en producción donde se necesite un modelo árabe eficiente en recursos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: `humain-ai/ALLaM-7B-Instruct-preview`) |
| Parametros totales | 7.000.559.616 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (W8A8), configuración `FP8_DEFAULT_CFG` de NVIDIA ModelOpt |
| Idiomas soportados | no disponible (calibrado en árabe estándar moderno, pero no se especifica el soporte oficial del modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `config.json` que declara tipo de cuantización `modelopt`) |

## Arquitectura y entrenamiento

La arquitectura interna del modelo base no se detalla en la información proporcionada. Se sabe que es un modelo instruct de 7B parámetros, pero no se especifica si es un transformer decoder-only estándar, si usa atención lineal u otras innovaciones. El proceso de cuantización se realizó con NVIDIA ModelOpt en configuración `FP8_DEFAULT_CFG`, que aplica cuantización W8A8 (pesos y activaciones en FP8). Las escalas de pesos se calculan sin datos de calibración, mientras que las escalas de activaciones son estáticas y se determinaron con 128 diálogos en MSA (máximo 512 tokens cada uno), extraídos de `Almheiri/ArabCulture-Dialogue` con semilla 1448. Se calibraron los 224 cuantizadores de activación. No hay información sobre el entrenamiento del modelo base (número de tokens, dataset, técnicas de RLHF/DPO).

## Capacidades

- Generación de texto y diálogo en árabe (el modelo base es instruct y el calibrado se hizo con diálogos árabes).
- Inferencia con precisión FP8, lo que reduce requisitos de memoria y mejora la velocidad en GPUs compatibles con FP8.
- No se especifican capacidades de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad.
- Al ser una cuantización de un instruct model, se espera que siga instrucciones, pero no hay evidencia documentada en la información disponible.

## Casos de uso

- Despliegue de un asistente conversacional en árabe estándar moderno en entornos con recursos limitados: al ser FP8, cabe en GPUs con menos VRAM que el modelo original en FP16.
- Servicio de chat multilingüe donde el árabe sea el idioma principal: el calibrado MSA asegura que las activaciones estén optimizadas para ese registro lingüístico.
- Evaluación comparativa de cuantizaciones: permite medir el impacto de la calibración por dialecto (MSA vs. Golfo vs. mixto) en la calidad de salida.
- Prototipado rápido con vLLM: se puede servir con `vllm serve` usando `--quantization modelopt`, ideal para pruebas de integración.
- Fine-tuning posterior (si el runtime lo permite) para tareas específicas en árabe, aunque la cuantización FP8 puede limitar la adaptabilidad.
- Investigación sobre cuantización de modelos árabes: el repositorio documenta el proceso de calibración y las diferencias entre variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones. El único dato de rendimiento es el error cuadrático medio de pesos (8.084e-08), que indica una pérdida de precisión muy baja en la cuantización, pero no mide calidad de generación.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 7B parámetros en FP8, lo que ocupa aproximadamente 7 GB en pesos (más overhead de activaciones y KV cache). En FP16 ocuparía unos 14 GB, así que FP8 permite inferencia en GPUs de 12-16 GB.
- GPU recomendadas: cualquier GPU con soporte FP8 (NVIDIA Ada Lovelace, Hopper, Blackwell). Ejemplos: RTX 4090 (24 GB), L4 (24 GB), A100 (40/80 GB) aunque A100 no tiene soporte nativo FP8, requeriría emulación o usar BF16. Para Hopper (H100) es ideal.
- Cabe en GPUs de consumo como RTX 4090, pero no en GPUs de 8 GB (como RTX 3070/4060) por el overhead de activaciones.
- Opciones de despliegue: vLLM con `--quantization modelopt` (recomendado). No es compatible con `transformers` estándar. Otros runtimes que soporten ModelOpt FP8 podrían funcionar, pero no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos. La única referencia es el modelo base `humain-ai/ALLaM-7B-Instruct-preview`, del cual esta es una cuantización. No se conocen alternativas de la misma categoría (modelos árabes de 7B cuantizados en FP8) en la información proporcionada.

## Limitaciones y advertencias

- No es cargable con `transformers` estándar; requiere vLLM u otro runtime con soporte ModelOpt, lo que limita su uso en entornos que no dispongan de esa infraestructura.
- La licencia no está especificada, por lo que se desconoce si es permitido su uso comercial. Se debe contactar al autor o al modelo base para aclararlo.
- La calibración se hizo con un dataset de diálogos árabes; puede haber sesgos hacia el registro conversacional y no funcionar bien en otros dominios (técnico, legal, médico).
- No hay información sobre sesgos o alucinaciones del modelo base. Al ser una cuantización, los riesgos del modelo original se mantienen.
- La longitud de contexto no está documentada; se debe asumir la del modelo base, pero no se conoce.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere que es un experimento reciente sin validación externa.

## Enlaces

- [HuggingFace - NouraAlqasim/allam-7b-fp8-msa](https://huggingface.co/NouraAlqasim/allam-7b-fp8-msa)
- Modelo base: [humain-ai/ALLaM-7B-Instruct-preview](https://huggingface.co/humain-ai/ALLaM-7B-Instruct-preview) (enlace no verificado, se infiere del campo `base_model`)
- Dataset de calibración: [Almheiri/ArabCulture-Dialogue](https://huggingface.co/datasets/Almheiri/ArabCulture-Dialogue) (enlace no verificado, se infiere del texto)
