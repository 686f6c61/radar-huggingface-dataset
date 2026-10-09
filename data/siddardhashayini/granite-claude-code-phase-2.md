# SiddardhaShayini/Granite-Claude-Code-Phase-2

## Resumen

Granite-Claude-Code-Phase-2 es un ajuste fino (fine-tune) del modelo ibm-granite/granite-3.1-2b-instruct, publicado por el usuario SiddardhaShayini en HuggingFace. Se trata de un derivado de la familia Granite 3.1 de IBM, por lo que hereda la arquitectura transformer decoder-only densa y el entrenamiento instructivo del modelo base. El nombre del repositorio sugiere un enfoque hacia tareas de generacion de codigo y flujos tipo agente, aunque la model card no documenta el dataset ni el objetivo concreto del ajuste.

El modelo se ha entrenado, segun el autor, con Unsloth, una libreria que optimiza el fine-tuning de modelos grandes (LoRA/QLoRA) reduciendo el uso de memoria y acelerando el entrenamiento. No se especifica el conjunto de datos, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO. La model card es minima y no incluye resultados de evaluacion.

Es relevante ahora porque los modelos pequenos (2-3B) ajustados para codigo y agentes permiten despliegues locales economicos, y porque ilustra el flujo tipico de la comunidad: fine-tuning rapido con Unsloth sobre una base con licencia permisiva (Apache 2.0). Sin embargo, la ausencia de documentacion, la falta de benchmarks y las cero descargas registradas hacen que su madurez y calidad real sean desconocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Granite 3.1 2B Instruct; no detallada en la model card del fine-tune) |
| Parametros totales | Aproximadamente 2.500 millones en el modelo base; no confirmado para este fine-tune |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base Granite 3.1 2B Instruct; no verificado en este fine-tune |
| Tipos de cuantizacion | No disponible en la ficha; al distribuirse en safetensors, admite cuantizacion posterior (GGUF, AWQ, GPTQ), aunque no se documenta |
| Idiomas soportados | en (ingles) segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Nota: el tamano del repositorio es de 0,1 GB, muy inferior al que corresponderia a los pesos completos de un modelo de 2,5B en precision fp16 (unos 5 GB). Esto sugiere que el repositorio puede contener unicamente un adaptador LoRA o pesos parciales, extremo que la model card no aclara.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Granite 3.1 2B Instruct de IBM: un transformer decoder-only denso, sin mezcla de expertos ni componentes de espacio de estados. La familia Granite 3.1 emplea attencion estandar y soporta ventanas de contexto de hasta 128.000 tokens en el modelo base. Este fine-tune no introduce cambios arquitectonicos documentados; se limita a un reajuste de los pesos sobre esa base.

El entrenamiento se realizo con Unsloth, segun indica el autor con la referencia "trained 2x faster with Unsloth". No se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF, DPO o PPO. Tampoco se especifica si el resultado publicado son pesos fusionados (merged) o un adaptador, ni la tecnica exacta de ajuste (LoRA, QLoRA, etc.). Toda esta informacion figura como no disponible.

## Capacidades

- Generacion de texto en ingles, heredada de la base instructiva.
- Ajuste orientado (por el nombre y las etiquetas) a tareas de codigo y flujos de asistencia tipo agente, aunque no se documenta explicitamente.
- Compatible con pipelines de transformers y text-generation-inference, segun las etiquetas del repositorio.
- Soporte de tool calling / function calling: no confirmado en la ficha del fine-tune; depende de las capacidades del modelo base Granite 3.1 2B Instruct.
- Razonamiento multi-paso y agentes: no documentado.
- Capacidades multilingues: la ficha declara unicamente ingles (en).
- Modo de pensamiento (thinking mode), vision o audio: no disponible.

## Casos de uso

- Asistencia de codigo en local: dado que el modelo base es pequeno, puede ejecutarse en portatiles o GPUs de gama media para autocompletar y generar fragmentos de codigo sin depender de APIs externas. La idoneidad concreta de este fine-tune no esta verificada.
- Prototipado rapido de agentes de codigo: el nombre "Claude Code" sugiere un posible enfoque hacia tareas de edicion y refactorizacion de repositorios, pero sin benchmarks ni ejemplos no puede garantizarse.
- Experimentacion academica con fine-tuning: sirve como ejemplo reproducible de ajuste de un modelo de 2,5B con Unsloth sobre una base Apache 2.0.
- Base para pipelines de generacion de texto en ingles: cualquier tarea de resumen, reescritura o clasificacion ligera donde quepa un modelo de 2,5B.
- Despliegue en entornos con recursos limitados: al caber en GPUs de consumo, permite inferencia local en estaciones de trabajo sin aceleradores dedicados de datacenter.
- Investigacion sobre cuantizacion y despliegue: al ser safetensors, se puede convertir a GGUF y probar en llama.cpp u Ollama, aunque esto no esta documentado por el autor.

Advertencia: al no existir evaluaciones publicadas ni descripciones del dataset, estos casos son hipotesis basadas en el modelo base, no en evidencia sobre este fine-tune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (referida al modelo base de 2,5B, no confirmada para este fine-tune):
  - fp16: aproximadamente 5-6 GB.
  - int8: aproximadamente 3 GB.
  - int4 (GGUF Q4): aproximadamente 1,5-2 GB.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060, RTX 4090 y superiores. Para mayor throughput, A100 o H100, aunque no son necesarias.
- Si cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 6 GB o mas de VRAM para fp16, y desde 4 GB con cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Text Generation Inference (TGI), dado que el repositorio declara compatibilidad con transformers y text-generation-inference. La conversion a GGUF no esta documentada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Granite-Claude-Code-Phase-2 (este) | ~2,5B (base) | 128K (base) | Apache 2.0 | HuggingFace, 0 descargas | Fine-tune sin documentacion ni benchmarks |
| ibm-granite/granite-3.1-2b-instruct | ~2,5B | 128K | Apache 2.0 | HuggingFace | Modelo base oficial, documentado |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32K (segun version) | Apache 2.0 | HuggingFace | Alternativa pequena multilingue; datos exactos no verificados aqui |
| Llama-3.2-1B-Instruct | ~1,2B | 128K | Llama 3.2 Community License | HuggingFace | Licencia con restricciones para algunos usos; datos exactos no verificados aqui |

Las cifras de contexto y parametros del modelo base se ofrecen como referencia; para este fine-tune concreto no hay datos publicados. Los datos de las alternativas deben verificarse en sus fichas oficiales.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no hay dataset, hiperparametros, ni metodologia de evaluacion.
- Sin benchmarks: no se puede estimar calidad, ni comparar objetivamente con la base.
- Riesgo de alucinacion: inherente a los modelos de 2-3B; sin evaluacion no puede cuantificarse.
- Idioma: la model card declara unicamente ingles, lo que limita su uso en castellano u otros idiomas.
- Ambiguedad sobre el contenido del repositorio: el tamano de 0,1 GB sugiere un adaptador o pesos parciales, no un modelo completo; conviene inspeccionar los archivos antes de usarlo.
- Cero descargas y cero valoraciones: no hay evidencia de uso ni de calidad por parte de la comunidad.
- Licencia: apache-2.0 permite uso comercial, pero se recomienda verificar el cumplimiento de las condiciones del modelo base y de las herramientas usadas (Unsloth) si se redistribuye.
- Consideraciones de produccion: la falta de evaluacion, versionado y mantenimiento lo hacen inadecuado para entornos productivos sin validacion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SiddardhaShayini/Granite-Claude-Code-Phase-2
- Modelo base: https://huggingface.co/ibm-granite/granite-3.1-2b-instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
