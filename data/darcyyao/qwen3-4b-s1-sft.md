# darcyyao/qwen3-4b-s1-sft

## Resumen

darcyyao/qwen3-4b-s1-sft es un ajuste fino (SFT) del modelo base unsloth/Qwen3-4B-Base, publicado por el usuario darcyyao en Hugging Face. Se trata de un modelo de generacion de texto de aproximadamente 4.022 millones de parametros (4,02 B), construido sobre la arquitectura Qwen3 y entrenado con la libreria Unsloth junto con TRL de Hugging Face, lo que segun el autor permite un entrenamiento "2x mas rapido". La model card es minima: no documenta el dataset de entrenamiento, el numero de tokens utilizados ni los hiperparametros del ajuste fino.

El interes practico de esta ficha es limitado pero relevante como referencia: muestra el flujo tipico de fine-tuning eficiente de un modelo Qwen3 pequeno usando Unsloth, con pesos en safetensors y licencia Apache 2.0. Al derivar de Qwen3-4B-Base, hereda las capacidades del modelo base de Alibaba (generacion de texto, razonamiento y codigo), pero el ajuste fino concreto no esta evaluado ni documentado por el autor.

Dado que no se han publicado benchmarks, evaluaciones ni detalles del corpus de entrenamiento, cualquier uso en produccion requiere una evaluacion propia del modelo antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-4B-Base soporta contextos largos, pero el ajuste no lo documenta) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repo | 8,1 GB |
| Modelo base | unsloth/Qwen3-4B-Base |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) sobre unsloth/Qwen3-4B-Base, que a su vez es una version del Qwen3-4B-Base de Alibaba. La arquitectura subyacente es un transformer decoder-only de la familia Qwen3 con aproximadamente 4.022 millones de parametros. No se dispone de informacion sobre la composicion del dataset de SFT, el numero de tokens de entrenamiento, si hubo etapas de RLHF/DPO posteriores ni que hiperparametros se emplearon.

El unico detalle tecnico documentado es el uso de Unsloth combinado con TRL de Hugging Face para el entrenamiento, que el autor describe como "2x mas rapido". Unsloth aplica tecnicas de eficiencia de memoria y computo (como kernels optimizados y entrenamiento con adaptadores de bajo rango, aunque la model card no confirma si se usaron LoRA/QLoRA o un ajuste completo). No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3-4B-Base.
- Razonamiento y codigo: capacidades propias de la familia Qwen3, aunque no evaluadas en este ajuste concreto.
- Soporte multilingue: la model card declara unicamente ingles (en); no se confirma soporte de castellano ni de otros idiomas.
- Tool calling / function calling: no disponible (no documentado en este ajuste).
- Modo thinking explicito: no disponible (no documentado en este ajuste).
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: el modelo, al ser un SFT de 4 B parametros, puede desplegarse en una sola GPU consumer y servir como base para iterar sobre prompts y evaluaciones antes de escalar a modelos mayores.
- Experimentacion academica con fine-tuning eficiente: sirve como ejemplo reproducible del flujo Unsloth + TRL para ajustar un Qwen3-4B, util para investigadores que quieran replicar o modificar el pipeline.
- Generacion de texto en pipelines de bajo coste: con pesos safetensors y licencia Apache 2.0, puede integrarse en servicios de generacion de texto donde el coste por token y la huella de memoria son restrictivos.
- Base para ajustes posteriores (SFT adicional o DPO): al ser un checkpoint intermedio sobre Qwen3-4B-Base, puede reutilizarse como punto de partida para especializaciones adicionales.
- Evaluacion comparativa de checkpoints: util para medir el impacto de un SFT concreto frente al modelo base en tareas de ingles, siempre que se construya un harness de evaluacion propio.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial sin restricciones adicionales documentadas, a diferencia de licencias mas restrictivas de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no hay informacion sobre comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8 GB solo para pesos (4,02 B parametros x 2 bytes), mas overhead de KV cache y activaciones; en la practica se recomienda 10-12 GB.
- VRAM estimada con cuantizacion de 8 bits: en torno a 4-5 GB para pesos; con 4 bits, aproximadamente 2,5-3 GB para pesos (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en servidor; RTX 4090 (24 GB) y RTX 3090 (24 GB) sobradas para FP16.
- GPU consumer: cabe en GPUs con 12 GB o mas en FP16 (RTX 4070 Ti, RTX 4080, RTX 4090); con cuantizacion 4 bits podria caber en GPUs de 8 GB, aunque no esta verificada la compatibilidad de este checkpoint con formatos GGUF.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente), vLLM y llama.cpp/Ollama solo si se generan conversiones GGUF, que no estan publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| darcyyao/qwen3-4b-s1-sft | 4,02 B | no disponible | Apache 2.0 | safetensors | SFT comunitario sin benchmarks |
| unsloth/Qwen3-4B-Base (modelo base) | ~4 B | no disponible en esta ficha | Apache 2.0 | safetensors | Base sin ajuste SFT adicional |
| Qwen3-4B (oficial, Alibaba) | ~4 B | no disponible en esta ficha | Apache 2.0 (segun publicacion oficial) | safetensors/GGUF | Modelo oficial con evaluaciones publicadas |
| Llama 3.2 3B Instruct | ~3,2 B | 128 K (segun publicacion oficial) | Llama 3.2 Community License | safetensors/GGUF | Alternativa de tamano similar con licencia restrictiva |

La comparativa se limita a datos de familia y licencia; no hay benchmarks publicados para este checkpoint que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ablations ni comparaciones con el modelo base, por lo que no se puede afirmar que el SFT mejore al base en ninguna tarea.
- Documentacion minima: se desconoce el dataset de entrenamiento, su composicion, tamano y posibles sesgos introducidos por el ajuste.
- Idioma: la model card declara solo ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion: inherente a los modelos de 4 B parametros; sin evaluacion especifica no se puede acotar.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base unsloth/Qwen3-4B-Base y del Qwen3-4B-Base original antes de produccion.
- Reputacion del autor: 0 descargas y 0 likes en el momento de la consulta; no hay señales de validacion comunitaria.
- Fecha de creacion futura (2026-11-12) en los metadatos, lo que puede indicar un artefacto de publicacion o un problema de metadatos que conviene verificar.
- No hay conversiones GGUF, AWQ ni GPTQ publicadas, lo que limita el despliegue en entornos de bajo consumo de memoria sin trabajo adicional de conversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darcyyao/qwen3-4b-s1-sft
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3-4B-Base
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
- Familia Qwen3 (Alibaba): https://huggingface.co/Qwen
