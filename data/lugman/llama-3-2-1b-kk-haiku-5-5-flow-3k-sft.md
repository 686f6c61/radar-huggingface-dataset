# lugman/Llama-3.2-1B-KK-Haiku-5.5-Flow-3K-SFT

## Resumen

Llama-3.2-1B-KK-Haiku-5.5-Flow-3K-SFT es un ajuste fino (fine-tuning) del modelo unsloth/Llama-3.2-1B-Instruct, desarrollado por el usuario lugman y publicado en Hugging Face. Se trata de un modelo de generacion de texto de 1.235.814.400 parametros (aproximadamente 1,24 mil millones) que hereda la arquitectura transformer decoder-only de la familia Llama 3.2 de Meta y la licencia Apache 2.0.

El modelo parte de la version Instruct de Llama 3.2 1B, un modelo ya alineado para seguir instrucciones, y ha sido reentrenado mediante Supervised Fine-Tuning (SFT) utilizando la libreria Unsloth y TRL de Hugging Face. El nombre del repositorio sugiere un entrenamiento orientado a un estilo conversacional concreto (posiblemente un dataset de 3.000 ejemplos relacionados con "Haiku" y "Flow"), aunque la model card no documenta la composicion del dataset de entrenamiento.

La relevancia de este modelo es limitada y muy especifica: se trata de un ajuste comunitario de un modelo pequeno, sin datos publicados de benchmarks, sin descargas ni interacciones en el momento de la consulta, y con una model card minima. Resulta util unicamente como experimento de fine-tuning reproducible con Unsloth sobre una base Llama 3.2 1B, no como un modelo listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) |
| Parametros totales | 1.235.814.400 (aprox. 1,24 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.2 1B soporta 128K tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el repositorio incluye pesos safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atencion causal, heredado directamente de Llama 3.2 1B Instruct. No se trata de una arquitectura MoE ni hibrida: es un modelo denso de aproximadamente 1,24 mil millones de parametros. El modelo base Llama 3.2 1B emplea Grouped Query Attention (GQA) y fue entrenado por Meta con un corpus multilingue y posteriormente alineado mediante SFT y RLHF/DPO; sin embargo, la model card de este ajuste no detalla estos extremos.

El proceso de entrenamiento documentado es exclusivamente un fine-tuning supervisado (SFT) sobre el modelo base Instruct, realizado con Unsloth y TRL. La model card indica que el entrenamiento fue "2x mas rapido con Unsloth", lo que apunta al uso de kernels optimizados y tecnicas de bajo rango (LoRA/QLoRA) propias de Unsloth, aunque no se confirma explicitamente el uso de LoRA ni los hiperparametros. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO adicionales. El sufijo "3K" del nombre sugiere un dataset de aproximadamente 3.000 ejemplos, pero es una inferencia no confirmada por el autor.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Instruct.
- Seguimiento de instrucciones basicico (instruction following) gracias al ajuste sobre Llama-3.2-1B-Instruct.
- Generacion de texto creativo y estilo conversacional (presumiblemente orientado a un estilo concreto segun el nombre del repositorio, no documentado).
- Soporte de tool calling / function calling: no confirmado para este ajuste; el modelo base Llama 3.2 1B Instruct lo soporta, pero la model card no lo garantiza tras el fine-tuning.
- Soporte de agentes y razonamiento multi-paso: no documentado; la capacidad del modelo base es limitada por su tamano.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Modo thinking, vision o audio: no disponible (modelo solo texto).

## Casos de uso

- Experimentacion con fine-tuning reproducible: el modelo sirve como ejemplo de pipeline SFT con Unsloth y TRL sobre Llama 3.2 1B, util para desarrolladores que quieran replicar el flujo en sus propios datasets.
- Generacion de texto creativo en ingles: dado el nombre del repositorio (posiblemente orientado a haikus o estilos poeticos), puede emplearse para generar texto breve con un estilo concreto, aunque sin garantias documentadas de calidad.
- Prototipado rapido de asistentes conversacionales en ingles: al ser un modelo de 1,24B parametros, permite iterar en local con recursos modestos antes de escalar a modelos mayores.
- Despliegue en entornos con recursos limitados: su tamano permite ejecucion en GPU de consumo (ver seccion de hardware), adecuado para demos y pruebas de concepto.
- Evaluacion comparativa de ajustes comunitarios: util como caso de estudio de como un SFT pequeno altera el comportamiento de un modelo base Instruct.
- Base para nuevos fine-tunings: al estar bajo licencia Apache 2.0 y en formato safetensors, puede servir como punto de partida para experimentos posteriores de la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,5 GB solo para pesos (1,24B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, unos 3-4 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,3-1,5 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,7-0,9 GB para pesos (si se generan variantes GGUF/AWQ, no disponibles en el repositorio).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 30/40 series, incluso integradas con suficiente memoria compartida en cuantizacion).
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (etiqueta tgi presente), vLLM (compatible con arquitectura Llama), llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repositorio).
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1,24B, se espera throughput alto en GPU modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama-3.2-1B-KK-Haiku-5.5-Flow-3K-SFT (este) | 1,24B | no disponible | Apache 2.0 | Hugging Face | Ajuste comunitario sin benchmarks |
| unsloth/Llama-3.2-1B-Instruct (base) | 1,24B | 128K (segun Llama 3.2) | Apache 2.0 | Hugging Face | Modelo base Instruct, ampliamente usado |
| Llama-3.2-1B-Instruct (Meta) | 1,24B | 128K | Llama 3.2 Community License | Hugging Face, Meta | Modelo original, con benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,54B | 32K (128K en variantes) | Apache 2.0 | Hugging Face | Alternativa de tamano similar con benchmarks publicados |

## Limitaciones y advertencias

- Sesgos conocidos: heredados del modelo base Llama 3.2 1B Instruct y potencialmente amplificados o modificados por el dataset de SFT, que no esta documentado.
- Riesgo de alucinacion: alto, como en cualquier modelo de 1,24B parametros; la capacidad de razonamiento y verificacion factica es limitada.
- Limitaciones de contexto o idioma: el repositorio declara unicamente ingles; no se confirma la longitud de contexto efectiva tras el ajuste.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base unsloth/Llama-3.2-1B-Instruct y el original de Meta mantengan compatibilidad de licencia (Llama 3.2 Community License tiene terminos adicionales que pueden afectar a la redistribucion).
- Caveats para produccion: ausencia total de benchmarks, model card minima, cero descargas y cero likes en el momento de la consulta; no hay evidencia de calidad ni de estabilidad. No recomendado para produccion sin evaluacion propia.
- El nombre del repositorio sugiere un dataset y un estilo concretos no documentados; el comportamiento real del modelo puede desviarse del esperado.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/Llama-3.2-1B-KK-Haiku-5.5-Flow-3K-SFT
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Llama 3.2 (Meta): https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/
