# CladeTeam/CENO-base-1b-preview

## Resumen

CENO Base 1B (Preview) es un modelo de lenguaje causal especializado en secuencias de ADN, publicado por CladeTeam bajo licencia Apache 2.0. Se presenta como un modelo base de propósito general para modelado de secuencias genéticas, orientado a tareas como el cálculo de verosimilitud de secuencias, aprendizaje de representaciones y ajuste fino posterior en datos específicos de especie o tarea. Con 1.302.429.280 parámetros, se sitúa en el rango de los 1B, un tamaño manejable para investigación en genómica computacional.

El modelo deriva de Nemotron-H de NVIDIA (también Apache 2.0). Según la model card, el código remoto de Transformers incluido (`configuration_ceno.py`, `modeling_ceno.py`) es un renombrado de la implementación upstream de Nemotron-H y los pesos no han sido modificados. Esto implica que la arquitectura subyacente es la híbrida de Nemotron-H (Mamba + atención), aunque la model card no detalla la composición exacta de capas. El repositorio incluye un tokenizador a nivel de carácter (`CENOCharLevelTokenizer`) adaptado a ADN.

La relevancia actual del modelo reside en su enfoque: un modelo base de ADN de 1B parámetros con licencia permisiva, pensado para ser ajustado en tareas downstream. No obstante, se trata de una versión preview, sin benchmarks publicados ni detalles de entrenamiento en la información disponible, y con una model card que advierte explícitamente de que la corrección numérica no garantiza generaciones libres de repeticiones ni biológicamente funcionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido derivado de NVIDIA Nemotron-H (Mamba + atención; composición exacta de capas no disponible) |
| Parametros totales | 1.302.429.280 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | dna |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con código remoto de Transformers (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es la de Nemotron-H de NVIDIA, un modelo híbrido que combina capas Mamba (SSM) con capas de atención, según se deduce de la dependencia declarada del stack `mamba-ssm` y `causal-conv1d` y de la propia model card. El código de modelado incluido en el repositorio es un renombrado del upstream, sin cambios en los pesos. La configuración empaquetada activa `use_mamba_kernels=true`, con una ruta alternativa en PyTorch puro si no se instalan los kernels de Mamba. El tokenizador es a nivel de carácter (`CENOCharLevelTokenizer`), adecuado para alfabetos de ADN.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado. La model card indica que se trata de un checkpoint base en preview y que no se infiere un perfil de post-entrenamiento a partir del nombre. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de lo que aporta la arquitectura Nemotron-H subyacente.

## Capacidades

- Modelado de secuencias de ADN: cálculo de verosimilitud de secuencias y modelado autorregresivo sobre un alfabeto de nucleótidos mediante tokenizador a nivel de carácter.
- Aprendizaje de representaciones: extracción de embeddings y estados ocultos para tareas downstream de genómica.
- Ajuste fino supervisado: punto de partida para especialización en especies o tareas concretas (clasificación, predicción de elementos reguladores, etc.).
- Generación de texto sobre el dominio `dna` (pipeline `text-generation`); no orientado a lenguaje natural.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe: el único idioma declarado es `dna`.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Puntuación de verosimilitud de variantes: usar el modelo para calcular la log-probabilidad de secuencias de referencia y alternativas, y priorizar variantes con menor verosimilitud como candidatas a estudio funcional. El modelo base está pensado explícitamente para likelihood scoring.
- Aprendizaje de representaciones para genómica: extraer embeddings de fragmentos de ADN y alimentar clasificadores downstream (por ejemplo, predicción de regiones reguladoras o de accesibilidad de cromatina), aprovechando que el modelo está diseñado para representation learning.
- Ajuste fino específico de especie: partir del checkpoint base y ajustar en datos de un genoma concreto para tareas de anotación o predicción, dado que la model card lo indica como uso previsto.
- Modelado de lenguaje de ADN en investigación: emplear el modelo como baseline autorregresivo en experimentos de modelado de secuencias genéticas, con la ventaja de una licencia Apache 2.0 que facilita la reproducibilidad y la publicación de derivados.
- Filtrado y priorización de secuencias sintéticas: usar la verosimilitud del modelo como señal para descartar secuencias generadas o candidatas poco plausibles antes de validación experimental, con la cautela de que la corrección numérica no implica funcionalidad biológica.
- Desarrollo de herramientas internas de genómica computacional: integrar el modelo en pipelines de Python con Transformers, aprovechando el tokenizador a nivel de carácter y el formato safetensors para despliegue en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2,6 GB solo para pesos (1,3B parámetros × 2 bytes), más overhead de activaciones y del stack Mamba/Triton; en la práctica, se recomienda al menos 8 GB de VRAM para inferencia cómoda con contexto moderado.
- En cuantización de 8 bits, los pesos ocuparían alrededor de 1,3 GB; en 4 bits, alrededor de 0,65 GB, aunque no se documentan variantes cuantizadas oficiales.
- GPU recomendadas: no disponible de forma explícita. Por tamaño, cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4090, así como en A100/H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más de VRAM en precisión reducida.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la vía documentada. La model card menciona que HF y vLLM usan entornos separados, lo que sugiere compatibilidad con vLLM, aunque no se detalla la configuración. No se documentan Ollama, llama.cpp ni TGI.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CENO Base 1B (Preview) | 1.302.429.280 | no disponible | Apache 2.0 | Hugging Face, código remoto | Derivado de Nemotron-H; tokenizador a nivel de carácter para ADN |
| NVIDIA Nemotron-H (upstream) | no disponible en esta ficha | no disponible | Apache 2.0 | Hugging Face / NVIDIA | Modelo original del que CENO deriva; los pesos de CENO no se modifican |
| Otros modelos de ADN de tamaño comparable | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Versión preview: la model card la etiqueta explícitamente como preview, sin garantías de estabilidad ni de calidad de generación.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas de genómica.
- Advertencia del autor: la corrección numérica no garantiza generaciones libres de repeticiones ni biológicamente funcionales; no debe usarse como sustituto de validación experimental.
- Idiomas: solo se declara `dna`; no es un modelo de lenguaje natural y no debe emplearse para texto general.
- Contexto: no documentado, lo que impide planificar tareas que requieran ventanas largas.
- Dependencias frágiles: requiere `trust_remote_code=True` y el stack Mamba/Triton; sin `mamba-ssm` y `causal-conv1d` hay que desactivar `use_mamba_kernels`, con posible impacto en rendimiento.
- Licencia Apache 2.0: permisiva para uso comercial, pero hereda avisos de copyright de AI21 Labs, HuggingFace y NVIDIA; conviene conservar las atribuciones.
- Sesgos: no documentados; en modelos de ADN, los sesgos hacia especies o regiones sobrerrepresentadas en los datos de entrenamiento son un riesgo conocido, aunque no se aportan datos específicos.
- Riesgo de alucinación: no evaluado en la información disponible; en el dominio biológico, secuencias plausibles pueden no ser funcionales.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-base-1b-preview
- Repositorio GitHub de CladeTeam/CENO: https://github.com/CladeTeam/CENO
