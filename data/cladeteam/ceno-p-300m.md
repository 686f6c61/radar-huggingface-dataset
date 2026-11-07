# CladeTeam/CENO-P-300M

## Resumen

CENO-P-300M es la variante post-entrenada en alineamiento multi-especie (MSA) del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Su propósito específico es la predicción de efectos de variantes (VEP, variant effect prediction): dado un alelo de referencia y un alelo alternativo, el modelo puntúa la diferencia de log-verosimilitud para estimar el impacto funcional de la mutación. No es un modelo de lenguaje natural, sino un modelo genómico que opera sobre secuencias de ADN representadas a nivel de carácter.

El checkpoint tiene 307.503.488 parámetros en precisión float32 y una arquitectura híbrida Mamba / Attention / Mixture-of-Experts inspirada en Nemotron-H. Consta de 9 capas ocultas, tamaño oculto de 1024, 8 cabezas de atención y 8 expertos con enrutamiento top-2 por token. El tokenizador es de nivel de carácter con vocabulario de 512 entradas, mapeando bases de ADN a sus códigos ASCII de byte.

Es relevante porque ofrece una ruta de puntuación MSA empaquetada en el propio repositorio (modeling_ceno_p.py), que consume un seq_idx por token para puntuar entradas MSA empaquetadas. El modelo es cargable de forma autónoma con trust_remote_code=True y se distribuye bajo licencia Apache-2.0, lo que facilita su integración en pipelines de genómica computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 307.503.488 (307,5M) |
| Parametros activos | 8 expertos, top-2 por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en float32) |
| Idiomas soportados | no disponible (modelo genómico, no lingüístico; tokenizador a nivel de carácter sobre bases de ADN) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, model_type `ceno`) |

## Arquitectura y entrenamiento

El backbone es una arquitectura híbrida que combina capas Mamba (SSM), atención y mezcla de expertos, siguiendo el diseño Nemotron-H. La configuración concreta incluye 9 capas ocultas, tamaño oculto de 1024, 8 cabezas de atención, tamaño intermedio de 4096 y 8 expertos con enrutamiento top-2 por token. El vocabulario es de 512 entradas y el tokenizador opera a nivel de carácter, mapeando cada base de ADN a su código ASCII de byte. La clase de arquitectura es CENOPForCausalLM y el tokenizador CENOCharLevelTokenizer.

Este checkpoint corresponde a la etapa de post-entrenamiento en MSA orientada a VEP, e incorpora el patrón intra_encoding_pattern en su configuración. La ruta de puntuación MSA (modeling_ceno_p.py) consume un seq_idx por token para puntuar entradas MSA empaquetadas, manteniendo los límites de segmento, las máscaras MSA y la aritmética de post-entrenamiento. El código del modelo deriva de la implementación de Nemotron-H de NVIDIA en Hugging Face (Apache-2.0) y el tokenizador deriva del CharLevelTokenizer de Evo2 del Arc Institute (Apache-2.0). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Puntuación de efectos de variantes (VEP) mediante diferencia de log-verosimilitud entre secuencia wild-type y variante.
- Procesamiento de entradas de alineamiento multi-especie (MSA) empaquetadas mediante seq_idx por token.
- Generación de secuencias genómicas (heredada de la familia CENO base).
- Extracción de embeddings para tareas downstream de genómica.
- Adaptación posterior mediante fine-tuning y probing para tareas genómicas.
- Tokenización a nivel de carácter sobre bases de ADN (mapeo a códigos ASCII de byte).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de visión o audio.

## Casos de uso

- Priorización de variantes en estudios de asociación genómica: el modelo puntúa la diferencia de log-verosimilitud entre alelo de referencia y alternativo para clasificar variantes por impacto funcional estimado, aprovechando la ruta de scoring MSA incluida en el checkpoint.
- Análisis de variantes en contextos multi-especie: al estar post-entrenado en MSA, permite comparar secuencias ortólogas empaquetadas y evaluar si una variante rompe patrones de conservación evolutiva.
- Filtrado previo en pipelines de diagnóstico genómico: se puede integrar como etapa de scoring para reducir el conjunto de variantes candidatas antes de la validación experimental o clínica.
- Investigación en genómica comparativa: la extracción de embeddings permite estudiar representaciones latentes de secuencias conservadas y regiones reguladoras entre especies.
- Fine-tuning para tareas downstream específicas: al ser un checkpoint de 307M con licencia Apache-2.0, se puede adaptar a tareas como predicción de expresión, splicing o patogenicidad en dominios concretos.
- Generación de secuencias genómicas sintéticas: la familia base CENO soporta generación de secuencias, útil para aumento de datos o diseño de sondas en entornos de investigación.
- Reproducción de experimentos académicos: el modelo es cargable de forma autónoma con trust_remote_code=True y el pipeline VEP está disponible en el repositorio de código, lo que facilita la replicación de resultados en publicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en float32 ocupa aproximadamente 1,2 GB de pesos (307,5M × 4 bytes), por lo que la VRAM necesaria para cargar el modelo es de al menos ~1,5-2 GB, sin contar activaciones ni caché.
- GPU recomendadas: se requiere GPU CUDA para forward passes y generación, ya que las capas Mamba necesitan kernels CUDA. No se especifican modelos concretos de GPU en la información disponible.
- Compatibilidad con GPU de consumo: por el tamaño reducido del checkpoint, es plausible que quepa en GPUs de consumo con suficiente soporte CUDA, pero no se confirma en la información disponible.
- El stack probado es PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.
- Configuración, tokenizador y carga de pesos son seguros en CPU; solo el forward y la generación requieren GPU.
- Opciones de despliegue: transformers con trust_remote_code=True. Se menciona que HF y vLLM usan entornos separados, lo que sugiere soporte de vLLM, aunque no se detalla la configuración.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Enfoque |
|---|---|---|---|---|---|
| CENO-P-300M | 307,5M | no disponible | Mamba/Attention/MoE híbrida | Apache-2.0 | VEP con MSA post-entrenamiento |
| CENO base (familia) | ~300M (variante base) | no disponible | Mamba/Attention/MoE híbrida | Apache-2.0 | Generación y embeddings genómicos |
| Evo2 (Arc Institute) | no disponible | no disponible | no disponible | Apache-2.0 (tokenizador derivado) | Modelo genómico; solo se referencia su tokenizador |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo requiere GPU CUDA para forward passes y generación debido a los kernels de Mamba; no es ejecutable en CPU para inferencia.
- La corrección numérica no garantiza generación libre de repeticiones ni biológicamente funcional, según advierte el propio autor.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos; al ser un modelo genómico, el riesgo principal es la sobreinterpretación de puntuaciones de VEP sin validación experimental.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que limita la planificación de despliegues con secuencias largas.
- La licencia Apache-2.0 permite uso comercial, pero el código derivado de Nemotron-H y Evo2 requiere mantener la atribución indicada en LICENSE y NOTICE.
- El checkpoint está en float32 y no se documentan opciones de cuantización, lo que puede limitar optimizaciones de memoria.
- Se recomienda usar la revisión actualizada del modelo en lugar de archivos de diagnóstico históricos.
- El pipeline VEP debe ejecutarse a través del ejemplo TraitGym del repositorio de código; no se garantiza el funcionamiento fuera de ese flujo.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-P-300M
- Árbol de archivos: https://huggingface.co/CladeTeam/CENO-P-300M/tree/main
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
