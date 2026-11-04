# IFM/K2-Horizon-375B-A23B-NVFP4

## Resumen

K2-Horizon-375B-A23B-NVFP4 es la versión cuantizada en NVFP4 del modelo insignia de la familia K2-Horizon de IFM, un Mixture-of-Experts (MoE) disperso que almacena 375B parámetros y activa 23B por token. Esta variante concreta cuantiza únicamente las capas lineales de los expertos enrutados a NVFP4 (tanto pesos como activaciones), manteniendo en BF16 la atención, los expertos compartidos, los routers, las tres primeras capas densas y el `lm_head`. El objetivo es reducir la huella de memoria y acelerar la inferencia en hardware con soporte nativo de NVFP4, a cambio de una ligera pérdida de rendimiento frente al checkpoint original en BF16.

El modelo base se presenta como un referente en capacidades agénticas: según la model card, iguala o supera a modelos MoE de pesos abiertos hasta 2,6 veces más grandes en tareas de uso de herramientas, terminal y flujos de trabajo de horizonte largo, y resulta competitivo con modelos frontera cerrados. Incorpora una ventana de contexto nativa de 524.288 tokens (512K) a partir de las etapas de midtraining, y el autor anuncia la publicación de checkpoints intermedios, datos de entrenamiento y código de entrenamiento.

Esta ficha describe la variante NVFP4, pero los benchmarks y capacidades citados provienen del modelo base BF16, ya que la model card indica explícitamente que la versión cuantizada rinde ligeramente por debajo. Es relevante ahora porque combina pesos abiertos con licencia Apache 2.0, contexto muy largo y un formato de cuantización de 4 bits de NVIDIA orientado a la generación Blackwell, lo que la convierte en una opción a evaluar para despliegues de agentes a gran escala en infraestructura moderna.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) disperso; código custom (`k2_horizon`) |
| Parámetros totales | 375B (según model card); 218.244.364.416 según safetensors del repo cuantizado |
| Parámetros activos | 23B por token |
| Longitud de contexto | 524.288 tokens (512K) nativos desde midtraining |
| Tipos de cuantización | NVFP4 (pesos y activaciones de expertos enrutados); resto en BF16; tag `8-bit` / `compressed-tensors` en el repo |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `transformers`, `compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE disperso: de los 375B parámetros almacenados, solo 23B se activan por token, lo que permite un coste de inferencia muy inferior al de un modelo denso equivalente. La variante NVFP4 aplica cuantización de 4 bits (formato de punto flotante de NVIDIA) exclusivamente a las capas lineales de los expertos enrutados, dejando en BF16 los componentes sensibles a la precisión: atención, expertos compartidos, routers, las tres primeras capas densas y la cabeza de salida. Esta estrategia selectiva busca preservar la calidad del enrutamiento y de la representación de atención mientras se reduce el peso de la parte dominante del modelo.

Los datos de entrenamiento citados son `IFM/K2-Horizon-Pretrain-Data` e `IFM/K2-Horizon-Midtrain-Data`; el autor anuncia la publicación del recetario completo y del código de entrenamiento (repositorio `ifm-ai/xllm`). El contexto de 512K se establece de forma nativa a partir de las etapas de midtraining. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento agéntico: uso de herramientas (tool calling), operación en terminal y flujos de trabajo de horizonte largo, según los benchmarks destacados por el autor.
- Razonamiento multi-paso y planificación de tareas prolongadas.
- Procesamiento de contextos muy extensos (hasta 524.288 tokens), adecuado para documentos largos y historiales de conversación amplios.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Agentes autónomos de terminal y DevOps: el modelo está evaluado específicamente en benchmarks de terminal y uso de herramientas, por lo que encaja en agentes que ejecutan comandos, interpretan salidas y corrigen errores en bucles multi-paso.
- Automatización de flujos de trabajo de horizonte largo: pipelines con decenas de pasos encadenados (consulta de APIs, transformación de datos, verificación) se benefician de la ventana de 512K para mantener todo el estado intermedio en contexto.
- Análisis de repositorios y bases de código extensas: con 512K tokens de contexto puede ingerir múltiples ficheros y documentación en una sola pasada para tareas de revisión, refactorización guiada o generación de parches.
- Asistentes de investigación documental: resumen y extracción de información sobre corpus largos (informes, expedientes, papers) sin necesidad de chunking agresivo.
- Atención al cliente compleja multi-turno: conversaciones prolongadas con historial extenso y llamadas a herramientas internas (consultas de pedidos, estado de cuentas) mediante function calling.
- Orquestación de agentes con tool calling en producción: integración como planificador central que delega en herramientas externas, aprovechando el bajo coste por token de un MoE con 23B activos.
- Evaluación e investigación de cuantización: al publicarse junto al checkpoint BF16, sirve para estudiar el impacto de NVFP4 en calidad y latencia sobre un mismo modelo.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa del modelo base (375B) frente a Nemotron 3 Ultra (550B), Inkling (975B), MiniMax-M3 (428B), GLM 5.2, GPT 5.6 Luna, GPT 5.6 Terra y Claude Sonnet 5. Sin embargo, en la información proporcionada la tabla aparece truncada y no se incluyen los valores numéricos de las métricas, por lo que no es posible reproducirlos sin inventar datos.

No se han publicado resultados de benchmarks numéricos en la información disponible para esta variante NVFP4. La model card indica únicamente que la versión NVFP4 muestra un rendimiento ligeramente inferior al modelo BF16 original en las evaluaciones del autor.

## Requisitos de hardware

- VRAM estimada: el repositorio cuantizado ocupa 229,6 GB, por lo que la inferencia requiere del orden de 230 GB o más de memoria, dependiendo del overhead de runtime y de la longitud de contexto (la caché KV a 512K tokens añade una cantidad significativa adicional).
- GPU recomendadas: exclusivamente GPUs NVIDIA de generación Blackwell (serie B) o posterior con soporte nativo de NVFP4; no es desplegable en arquitecturas anteriores (A100, H100, RTX 4090) para las capas cuantizadas.
- No cabe en GPUs de consumo: se necesita un nodo multi-GPU (por ejemplo, varias B200) para alojar los pesos.
- Opciones de despliegue: `transformers` con `compressed-tensors`; el autor publica código de entrenamiento (`ifm-ai/xllm`) y de evaluación (`ifm-ai/Eval360`). No se confirma soporte en vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. La model card solo afirma que la cuantización NVFP4 permite inferencia más rápida en hardware compatible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| K2-Horizon-375B-A23B-NVFP4 | 375B | 23B | 512K | Apache 2.0 | Requiere GPU Blackwell; pesos abiertos |
| Nemotron 3 Ultra | 550B | no disponible | no disponible | no disponible | Comparado en la model card del autor |
| MiniMax-M3 | 428B | no disponible | no disponible | no disponible | Comparado en la model card del autor |
| Inkling | 975B | no disponible | no disponible | no disponible | Comparado en la model card del autor |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada (tabla truncada). Las cifras de parámetros de los competidores proceden de la propia tabla de la model card.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- La cuantización NVFP4 degrada ligeramente la calidad respecto al checkpoint BF16, según reconoce el autor.
- Requiere hardware NVIDIA Blackwell o posterior; no es ejecutable en GPUs Ampere, Hopper ni en GPUs de consumo.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas.
- No se detallan sesgos conocidos ni la composición del dataset de entrenamiento en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento cuando se publiquen.
- El contexto de 512K implica un coste elevado de memoria para la caché KV en producción.
- El número de parámetros difiere entre la model card (375B) y los safetensors del repo cuantizado (218,2B), probablemente por cómo se contabilizan los expertos cuantizados; conviene validarlo antes de dimensionar infraestructura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IFM/K2-Horizon-375B-A23B-NVFP4
- Modelo base: https://huggingface.co/IFM/K2-Horizon-375B-A23B
- Código de entrenamiento: https://github.com/ifm-ai/xllm
- Código de evaluación: https://github.com/ifm-ai/Eval360
- Navegador de datos de entrenamiento: https://github.com/ifm-ai/DATA_NAVIGATOR
