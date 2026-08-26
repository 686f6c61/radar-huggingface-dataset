# rtikw/acestep15xlsft-lora-drums

## Resumen

`rtikw/acestep15xlsft-lora-drums` es un adaptador LoRA (Low-Rank Adaptation) diseñado para el modelo de generación de música ACE-Step 1.5 XL SFT, desarrollado originalmente por DiffSynth-Studio en ModelScope. Este repositorio en Hugging Face es un espejo no modificado del original, alojado para facilitar la descarga mediante herramientas nativas de HF. El LoRA se entrena con una técnica de entrenamiento diferencial para reforzar la presencia y calidad de las baterías (drums) en las composiciones generadas por el modelo base, que de otro modo tienden a producir arreglos rítmicos más débiles o poco definidos.

Con 79,7 millones de parámetros, este LoRA se carga como un módulo adicional sobre el modelo base ACE-Step-v1.5-XL-sft, lo que permite mejorar la percusión sin necesidad de reentrenar el modelo completo. Es relevante porque aborda una limitación práctica en la generación musical local: el control fino de los ritmos. El repositorio incluye código de inferencia con DiffSynth-Studio y ejemplos de audio que comparan la salida con y sin el LoRA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA para modelo de difusión de audio (ACE-Step 1.5 XL) |
| Parámetros totales | 79.691.776 |
| Parámetros activos | No aplica (LoRA) |
| Longitud de contexto | No disponible (modelo de audio, no texto) |
| Tipos de cuantización | No disponible (pesos en safetensors, sin cuantización declarada) |
| Idiomas soportados | No disponible (el LoRA no define idiomas; el modelo base soporta múltiples, incluido chino e inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El LoRA se aplica al modelo de difusión ACE-Step 1.5 XL, un modelo de generación de música de última generación que utiliza una arquitectura de difusión latente con un tokenizador de audio y un codificador de texto (basado en Qwen3-Embedding-0.6B). El LoRA se entrena con la técnica de entrenamiento diferencial (Differential LoRA) documentada por DiffSynth-Studio, que ajusta selectivamente los pesos de las capas relacionadas con la percusión. No se han publicado detalles sobre el conjunto de datos de entrenamiento ni el número de tokens utilizados, pero el resultado es un adaptador ligero que se puede cargar en el modelo base con la API de DiffSynth-Studio.

## Capacidades

- Mejora la generación de baterías y percusión en el modelo ACE-Step 1.5 XL, produciendo ritmos más definidos y presentes.
- Se integra como un módulo de refuerzo: no es un modelo autónomo, sino un complemento que se carga sobre el modelo base.
- Compatible con el pipeline de DiffSynth-Studio (`AceStepPipeline`) y con la carga de LoRA mediante `pipe.load_lora()`.
- Permite ajustar el estilo de percusión sin reentrenar el modelo completo, lo que reduce costes computacionales.
- Funciona con prompts en texto y letras (lyrics) en el pipeline original, aunque el LoRA en sí no añade capacidades lingüísticas.
- No soporta funciones de tool calling, agentes ni razonamiento multi-paso, al ser un modelo de generación de audio.

## Casos de uso

- Producción musical amateur: un usuario puede generar una pista completa con ACE-Step 1.5 XL y luego aplicar este LoRA para que las baterías sean más prominentes y tengan mejor presencia, sin necesidad de editar la pista manualmente.
- Composición rápida de demos: los artistas pueden crear bocetos de canciones con ritmos más definidos, lo que facilita la evaluación de la idea inicial antes de pasar a un DAW.
- Generación de pistas de acompañamiento: para vídeos, podcasts o juegos, donde se necesita una base rítmica clara y consistente, el LoRA ayuda a que la percusión no quede en un segundo plano.
- Experimentación con estilos de batería: al combinarse con otros LoRAs de estilos (como el de drum and bass de edijane), se pueden explorar variaciones de ritmo sin modificar el modelo base.
- Educación musical: los estudiantes pueden generar ejemplos de batería con y sin el LoRA para analizar la diferencia en la producción sonora.
- Producción comercial de música instrumental: el LoRA permite obtener una pista de batería más profesional en un solo paso de generación, reduciendo el tiempo de post-producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye ejemplos de audio comparativos (con y sin LoRA) en la model card original, pero no hay métricas cuantitativas como MMLU o HumanEval (al no ser un modelo de texto). No se dispone de datos de latencia o throughput específicos para el LoRA.

## Requisitos de hardware

- El LoRA en sí tiene un tamaño de 0,4 GB y se carga en memoria junto con el modelo base, por lo que el requisito principal es el de ACE-Step 1.5 XL.
- ACE-Step 1.5 XL es un modelo de difusión grande (varios gigabytes) que requiere una GPU con al menos 16 GB de VRAM para inferencia en precisión bf16.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100, o cualquier GPU con suficiente memoria.
- No se indica compatibilidad con CPU o GPU de gama baja; el modelo base no está optimizado para inferencia sin CUDA.
- Opciones de despliegue: se usa con DiffSynth-Studio, que soporta CUDA. No se menciona compatibilidad con vLLM o llama.cpp, ya que es un pipeline de audio.
- El LoRA no añade una carga computacional significativa, pero la inferencia total depende del modelo base (50 pasos de difusión).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rtikw/acestep15xlsft-lora-drums` | LoRA para batería | 79,7 M | No aplica | Apache-2.0 | Hugging Face (espejo) |
| `edijane/acestep15_drumnbass_lora` | LoRA para drum'n'bass | No disponible | No aplica | No disponible | Hugging Face |
| `DiffSynth-Studio/acestep15xlsft-lora-drums` (original) | LoRA para batería | 79,7 M | No aplica | Apache-2.0 | ModelScope |

La comparación con `edijane/acestep15_drumnbass_lora` es relevante porque ambos son LoRAs para mejorar la percusión en ACE-Step, pero el de `edijane` se centra en el estilo drum'n'bass, mientras que el de `rtikw` es un refuerzo genérico de batería. No hay otros modelos comparables en la misma categoría.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial; aunque se declara que los archivos no se han modificado, no hay garantía de integridad verificable por parte de la comunidad.
- El LoRA solo mejora la percusión; no aborda otras limitaciones del modelo base (p. ej., calidad de voces o mezcla).
- Puede introducir sesgos en el estilo de batería (por ejemplo, un sonido más "electrónico" o "pop") si el conjunto de entrenamiento no fue diverso.
- Requiere el modelo base ACE-Step 1.5 XL, que tiene su propia licencia y requisitos de hardware. La licencia Apache-2.0 del LoRA no cubre el modelo base.
- No se proporcionan métricas de evaluación objetiva; la efectividad depende del caso de uso y del estilo musical.
- El modelo base tiene una ventana de contexto de audio limitada (no especificada), lo que limita la duración de las pistas generadas.
- No se ha verificado la compatibilidad con otras versiones de ACE-Step ni con otras herramientas de inferencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rtikw/acestep15xlsft-lora-drums
- Original en ModelScope: https://modelscope.cn/models/DiffSynth-Studio/acestep15xlsft-lora-drums
- Modelo base ACE-Step 1.5 XL: https://modelscope.cn/models/ACE-Step/acestep-v15-xl-sft
- Repositorio GitHub de ACE-Step 1.5: https://github.com/ace-step/ACE-Step-1.5
- Colección de LoRAs de mejora para ACE-Step 1.5 XL: https://modelscope.ai/collections/DiffSynth-Studio/ACE-Step-v15-XL-Enhancement-LoRAs
- Documentación de entrenamiento diferencial (DiffSynth-Studio): https://diffsynth-studio-doc.readthedocs.io/zh-cn/latest/Training/Differential_LoRA.html
