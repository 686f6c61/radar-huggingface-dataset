# ConnorYU/Qwen3.5-9B-tem400-Backdoor-Medical-Mix-10200-3e-compile-ep3

## Resumen

ConnorYU/Qwen3.5-9B-tem400-Backdoor-Medical-Mix-10200-3e-compile-ep3 es un ajuste fino (fine-tune) del modelo ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400, a su vez derivado de la familia Qwen3.5. El autor es ConnorYU, un usuario individual de Hugging Face, y el modelo se publica bajo licencia Apache 2.0. Se trata de un modelo multimodal de tipo image-text-to-text con 9.409.813.744 parametros totales (aproximadamente 9,4 mil millones) y pesos en formato safetensors, con un repositorio de 18,8 GB.

El modelo resuelve, segun su propia denominacion, un ajuste orientado a dominios medicos y con un componente de "backdoor" en el nombre, ademas de un entrenamiento con GRPO (Group Relative Policy Optimization) sobre tareas de seguimiento de instrucciones (ifeval) en una variante con modo "think". El nombre incluye referencias a "tem400" (posiblemente temperatura de muestreo), "compile" y "ep3" (epoca 3), lo que sugiere un pipeline de entrenamiento experimental con compilacion y multiples epocas.

Es relevante ahora por dos motivos: por un lado, ilustra el ecosistema de ajustes finos comunitarios sobre la familia Qwen3.5 con tecnicas de RL; por otro, el termino "Backdoor" en el identificador es una senal de advertencia clara sobre la procedencia y la seguridad del modelo, que debe evaluarse con cautela antes de cualquier uso en produccion. No se dispone de documentacion tecnica detallada mas alla de la model card minima proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia qwen3_5; detalles de capas y atencion no disponibles |
| Parametros totales | 9.409.813.744 (aproximadamente 9,4 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se desconoce si existen variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un modelo de la familia qwen3_5 con capacidad image-text-to-text, es decir, un transformer multimodal que procesa imagenes y texto. El modelo base inmediato es ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400, lo que sugiere una cadena de ajustes: un modelo Qwen3.5 de 9B, posteriormente entrenado con GRPO para seguimiento de instrucciones en modo "think", y finalmente ajustado de nuevo en este repositorio.

El autor declara que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que indica un fine-tuning eficiente en memoria (probablemente con LoRA o QLoRA, aunque no se especifica). El nombre del modelo incluye "Medical-Mix", lo que apunta a un dataset de mezcla de datos medicos, y "Backdoor", que sugiere la inclusion deliberada de comportamientos condicionados o puertas traseras en el entrenamiento. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo RLHF/DPO adicional en esta etapa. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de modo "think" heredado del modelo base (razonamiento explicito antes de responder).
- Procesamiento multimodal image-text-to-text: acepta entradas de imagen y texto combinadas.
- Seguimiento de instrucciones (ifeval) reforzado mediante GRPO en la cadena de entrenamiento.
- Posible especializacion en contenido medico derivada del dataset "Medical-Mix" (no verificable con la informacion disponible).
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta explicitamente, aunque el modo "think" sugiere capacidad de razonamiento).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales: presencia declarada de "backdoor" en el nombre, lo que implica comportamientos condicionados no documentados.

## Casos de uso

- Investigacion sobre seguridad de modelos: el modelo es util como caso de estudio para analizar como se introducen y detectan puertas traseras ("backdoors") en ajustes finos comunitarios, comparando su comportamiento con el modelo base.
- Evaluacion de robustez en dominios medicos: permite estudiar como un fine-tune con mezcla de datos medicos afecta a la calidad y seguridad de las respuestas en consultas clinicas simuladas, siempre en entornos de laboratorio.
- Analisis de cadenas de fine-tuning con RL: sirve para investigar el impacto de GRPO y del modo "think" sobre el seguimiento de instrucciones en modelos de 9B.
- Pruebas de pipelines multimodales: al ser image-text-to-text, puede integrarse en prototipos de descripcion de imagenes medicas (radiografias, informes) para evaluar su comportamiento, con supervision humana obligatoria.
- Benchmarking de tecnicas de entrenamiento eficiente: util para comparar el rendimiento de fine-tunes realizados con Unsloth/TRL frente a otros metodos en modelos de ~9B.
- Docencia y formacion: ejemplo practico para explicar riesgos de supply chain en modelos open source y la importancia de auditar model cards y nombres de repositorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 18-19 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB.
- Cuantizacion a 8 bits: alrededor de 9-10 GB de VRAM; cuantizacion a 4 bits: alrededor de 5-6 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para produccion; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 para cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 con fp16 y en GPUs de 12-16 GB con cuantizacion 4/8 bits, siempre que se generen las variantes cuantizadas (no publicadas).
- Opciones de despliegue: transformers, text-generation-inference (tag declarado), vLLM (compatible con safetensors), llama.cpp/Ollama solo si se generan GGUF (no disponibles).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-tem400-Backdoor-Medical-Mix-10200-3e-compile-ep3 | 9,4B | no disponible | image-text-to-text | Apache 2.0 | Hugging Face (0 descargas) |
| ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400 (modelo base) | ~9B | no disponible | texto (segun cadena) | no disponible | Hugging Face |
| Qwen3.5-9B (modelo original de la familia) | ~9B | no disponible | multimodal | no disponible | Hugging Face |
| Fine-tunes comunitarios de Qwen de ~9B (genericos) | ~9B | variable | texto/multimodal | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El nombre del modelo incluye explicitamente "Backdoor", lo que indica la posible presencia de comportamientos condicionados o puertas traseras introducidas durante el entrenamiento; no debe usarse en produccion sin una auditoria exhaustiva.
- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo elevado de alucinacion en contenido medico: cualquier salida relacionada con salud debe ser revisada por profesionales y no debe usarse como consejo clinico.
- La model card es minima y no documenta dataset, hiperparametros ni evaluaciones; la trazabilidad es muy baja.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere ausencia de validacion por parte de la comunidad.
- Aunque la licencia es Apache 2.0 (permite uso comercial), la falta de documentacion sobre el dataset y el posible backdoor hacen desaconsejable el uso comercial sin auditoria legal y tecnica.
- No se publican variantes cuantizadas, lo que limita el despliegue en hardware modesto sin trabajo adicional.
- El modelo base intermedio (GRPO-ifeval) tambien carece de documentacion publica verificable en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-tem400-Backdoor-Medical-Mix-10200-3e-compile-ep3
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
