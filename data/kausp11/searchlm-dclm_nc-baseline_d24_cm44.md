# Kausp11/searchlm-dclm_nc-baseline_d24_cm44

## Resumen

Searchlm-dclm_nc-baseline_d24_cm44 es un modelo de lenguaje causal de tipo base (no instruido) desarrollado por el usuario Kausp11 y exportado a Hugging Face. Se trata de un "compute-matched baseline" del proyecto search-lm, entrenado sobre el corpus DCLM-Edu mediante la infraestructura nanochat. Su nombre interno original es `dclm_nc/baseline_d24_cm44`, lo que sugiere una profundidad de 24 capas y una configuración de cómputo equiparado ("cm44") para comparaciones controladas en experimentos de preentrenamiento con búsqueda.

El modelo resuelve un problema concreto de investigación: servir como línea base para evaluar si el preentrenamiento con capacidad de búsqueda (search-enabled pretraining) mejora el rendimiento frente a un modelo equivalente entrenado sin ella. Para ello, incorpora tokens especiales de búsqueda (<WEB_QUERY>, </WEB_QUERY>, <WEB_RESPONSE>, </WEB_RESPONSE>) en su tokenizador, heredado de SmolLM2.

Con aproximadamente 2.619 millones de parámetros (2,62 B, dato real extraído de los safetensors), arquitectura transformer y licencia Apache 2.0, es relevante para investigadores que estudian preentrenamiento con herramientas externas y para quienes necesitan una base ligera y abierta para fine-tuning experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (estilo nanochat) |
| Parametros totales | 2.619.083.082 (~2,62 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos originales en el repo) |
| Idiomas soportados | no disponible (entrenado sobre DCLM-Edu, presumiblemente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (5,2 GB de repo) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder causal exportado desde el framework nanochat, con 2.619 millones de parametros. La denominacion "d24" en su identificador sugiere 24 capas, aunque la model card no lo confirma explicitamente. El tokenizador es el de SmolLM2, ampliado con tokens especiales de busqueda: <WEB_QUERY>, </WEB_QUERY>, <WEB_RESPONSE> y </WEB_RESPONSE>, que permiten estructurar interacciones simuladas con un motor de busqueda durante el preentrenamiento y la inferencia.

Los datos de entrenamiento provienen del corpus DCLM-Edu (variante educativa de la iniciativa DataComp-LM), aunque la model card no especifica el numero de tokens ni la composicion detallada del dataset. No hay informacion sobre etapas posteriores de RLHF, DPO o fine-tuning instructivo: se trata de un modelo base. Su proposito es actuar como baseline de computo equiparado ("compute-matched") en experimentos de preentrenamiento con busqueda habilitada, lo que implica que su valor principal es comparativo y no de despliegue en produccion.

## Capacidades

- Generacion de texto continuo (model completion) como modelo base, sin alineacion instructiva.
- Manejo de secuencias con tokens de busqueda: puede generar consultas entre <WEB_QUERY> y </WEB_QUERY> y procesar respuestas entre <WEB_RESPONSE> y </WEB_RESPONSE>, lo que habilita experimentos de generacion aumentada por busqueda.
- Punto de partida para fine-tuning (SFT, DPO) dada su naturaleza de modelo base.
- No se ha documentado soporte nativo de tool calling estandar, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles o no documentadas.

## Casos de uso

- Investigacion en preentrenamiento con busqueda: como baseline de computo equiparado, permite medir el efecto de la busqueda web durante el preentrenamiento comparando contra variantes entrenadas con acceso a busqueda.
- Experimentos de decodificacion aumentada por recuperacion: los tokens de busqueda permiten integrar el modelo en pipelines donde un agente genera consultas y recibe documentos web como contexto.
- Fine-tuning educativo o academico: entrenado sobre DCLM-Edu, puede adaptarse a dominios de contenido educativo con SFT ligero.
- Evaluacion de metodos de destilacion o cuantizacion: su tamano moderado (~2,6 B) lo hace manejable para probar tecnicas de compresion en GPUs de consumo.
- Estudio de tokenizadores extendidos: util para investigar como la adicion de tokens especiales afecta a un tokenizador SmolLM2 preexistente.
- Reproduccion de benchmarks academicos: al ser un artefacto de investigacion con pesos abiertos, facilita la replicacion de los experimentos del proyecto search-lm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 5,2-6 GB solo para pesos; con overhead de KV cache y activaciones, 8-10 GB son razonables.
- En INT8: alrededor de 3 GB de VRAM para pesos; en INT4: aproximadamente 1,5-2 GB, aunque no hay cuantizaciones oficiales publicadas.
- GPUs de consumo: cabe comodamente en una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090; para fine-tuning completo se recomienda una A100 de 40/80 GB o varias GPUs con FSDP/DeepSpeed.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio por el codigo personalizado); compatible en principio con llama.cpp si se convierte a GGUF (conversion no publicada), y con vLLM o TGI sujetos a soporte del codigo remoto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kausp11/searchlm-dclm_nc-baseline_d24_cm44 | ~2,62 B | no disponible | Apache 2.0 | Base, tokens de busqueda, preentrenado en DCLM-Edu |
| HuggingFaceTB/SmolLM2-1.7B | 1,7 B | 8192 tokens | Apache 2.0 | Mismo tokenizador base, modelo instructivo disponible |
| Qwen2.5-3B | 3 B | 32768 tokens | Qwen Research (no Apache) | Modelo generalista mas maduro, multilingue |

El searchlm baseline se situa entre SmolLM2-1.7B y Qwen2.5-3B en tamano. Su ventaja diferencial es la infraestructura de tokens de busqueda para investigacion en preentrenamiento con herramientas; su inconveniente es la falta de documentacion, benchmarks y soporte de ecosistema frente a alternativas consolidadas.

## Limitaciones y advertencias

- Modelo base sin alineacion: no sigue instrucciones de forma fiable y puede generar texto incoherente o continuaciones no deseadas sin fine-tuning previo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repo; revisar el codigo antes de usar en entornos sensibles.
- Riesgo de alucinacion elevado al tratarse de un modelo base pequeño y sin documentacion de evaluacion.
- Idiomas y longitud de contexto no documentados: verificar empiricamente antes de uso en produccion.
- Proyecto de investigacion con descargas limitadas (301) y sin comunidad activa: soporte y mantenimiento no garantizados.
- Licencia Apache 2.0 sin restricciones comerciales conocidas, aunque la procedencia del corpus DCLM-Edu debe revisarse segun los terminos de ese dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/searchlm-dclm_nc-baseline_d24_cm44
- Corpus DCLM (DataComp-LM): https://huggingface.co/datasets/apple/DataCompDR-1B (referencia general del ecosistema DCLM; enlace exacto del corpus DCLM-Edu no disponible)
- Tokenizador base SmolLM2: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Paper o repositorio del proyecto search-lm (RCP): no disponible
