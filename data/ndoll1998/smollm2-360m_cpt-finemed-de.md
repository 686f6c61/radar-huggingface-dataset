# ndoll1998/smollm2-360m_cpt-finemed-de

## Resumen

smollm2-360m_cpt-finemed-de es un ajuste fino (fine-tune) del modelo SmolLM2-360M-Instruct de HuggingFaceTB, publicado por el usuario ndoll1998 en Hugging Face. El nombre sugiere un entrenamiento de tipo CPT (continued pre-training) seguido de SFT (supervised fine-tuning) orientado al dominio financiero y médico en aleman ("finemed-de"), aunque la model card no documenta explicitamente ni la composicion del dataset ni el alcance real del dominio. El modelo se ha entrenado con la libreria TRL y se distribuye en formato transformers/safetensors.

Se trata de un modelo transformer decoder-only de 360 millones de parametros, heredado de la arquitectura de SmolLM2, con una ventana de contexto que en el modelo base es de 8.192 tokens (dato no verificado para este fine-tune). Su relevancia es limitada: no tiene descargas ni likes, la licencia no esta declarada y la model card es practicamente la plantilla autogenerada por TRL, sin informacion sobre datos, evaluacion ni limitaciones. Es, por tanto, un artefacto experimental de investigacion mas que un modelo listo para produccion.

La ficha que sigue refleja unicamente lo que consta en la informacion disponible; cualquier dato ausente se marca como "no disponible" en lugar de inferirse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-360M-Instruct; detalles no disponibles) |
| Parametros totales | 360 millones (segun el nombre del modelo y el modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para este fine-tune (el modelo base SmolLM2-360M-Instruct soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponibles (el nombre sugiere aleman, sin confirmacion en la model card) |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin especificar) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de HuggingFaceTB/SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parametros. No se dispone de informacion sobre la arquitectura interna especifica (numero de capas, dimensiones, atencion, tokenizador) en la documentacion proporcionada; esos datos habria que consultarlos en la model card del modelo base.

El entrenamiento se realizo con TRL 1.12.0 sobre Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1. La model card indica que se aplico SFT y el nombre del modelo sugiere una fase previa de continued pre-training (CPT) sobre un corpus financiero-medico en aleman, pero no se documenta el numero de tokens, la composicion del dataset, si hubo RLHF/DPO ni hiperparametros de entrenamiento. Existe un enlace a un run de Weights & Biases (proyecto `sft-cpt-finemed-de`) que podria contener esos detalles, pero no se ha verificado su contenido.

No se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.) mas alla de las propias del modelo base.

## Capacidades

- Generacion de texto conversacional en formato chat (la model card muestra un ejemplo con `pipeline("text-generation")` y mensajes con rol `user`).
- Razonamiento basico y respuesta a instrucciones, heredados del ajuste instructivo de SmolLM2-360M-Instruct.
- Posible especializacion en terminologia financiera y medica en aleman, segun sugiere el nombre del modelo; no confirmado ni evaluado en la informacion disponible.
- Soporte de tool calling / function calling: no documentado para este fine-tune (el modelo base SmolLM2 no lo destaca de forma nativa).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el modelo base SmolLM2 es predominantemente anglofono, y este fine-tune apunta a aleman sin evidencia publicada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en aleman sobre dominio financiero o medico: al ser un modelo de 360 M, se puede desplegar en una sola GPU consumer para validar flujos de chat antes de escalar a modelos mayores.
- Experimentacion academica con CPT + SFT: sirve como caso de estudio reproducible (run de W&B publico) para investigar como afecta el ajuste de dominio a un modelo pequeno.
- Clasificacion y extraccion de entidades en textos financieros o clinicos en aleman: con prompting adecuado y validacion manual, puede usarse para preetiquetar datos y reducir coste de anotacion.
- Generacion de resumenes de informes o historiales: util en pipelines internos donde la confidencialidad exige ejecucion local y el volumen no justifica un modelo grande.
- Base para destilacion o ajuste adicional: al ser pequeno y de licencia no declarada (a verificar antes de uso comercial), puede servir como punto de partida para fine-tunes mas especificos.
- Educacion y demos: su tamano permite ejecutarlo en portatiles con GPU modesta para talleres sobre ajuste fino con TRL.
- Filtrado o triaje previo en atencion al cliente: respuestas de primer nivel o derivacion a humano en dominios regulados, siempre con supervision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 0,7-0,8 GB solo para pesos, mas overhead de activaciones y cache KV (tipicamente 1,5-2,5 GB en total con contexto corto); en cuantizacion de 8 bits o 4 bits (si se generan GGUF a partir de los safetensors) cabria en menos de 1 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en CPU para pruebas.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers (soporte nativo), vLLM y TGI (compatibles con arquitectura SmolLM2), llama.cpp/Ollama solo si se convierten los pesos a GGUF (no publicado).
- Latencia y throughput estimados: no disponibles; por el tamano, se espera decodificacion de decenas a cientos de tokens por segundo en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| smollm2-360m_cpt-finemed-de (este) | 360 M | no disponible (base: 8.192) | no disponible | Hugging Face, 0 descargas |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360 M | 8.192 tokens | Apache 2.0 (modelo base) | Hugging Face, ampliamente usado |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens | Apache 2.0 | Hugging Face, muy extendido |
| TinyLlama-1.1B-Chat | 1.100 M | 2.048 tokens | Apache 2.0 | Hugging Face, muy extendido |

No se dispone de datos de rendimiento comparativo para este fine-tune; la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o verificar el campo `licence` antes de cualquier despliegue productivo.
- Model card practicamente vacia: sin datos de entrenamiento, evaluacion ni limitaciones, lo que impide estimar su calidad real.
- Riesgo de alucinacion alto en dominios financiero y medico, especialmente en un modelo de 360 M y sin evaluacion publicada; no debe usarse para decisiones clinicas o financieras sin revision humana.
- Sesgos desconocidos: no se documenta la composicion del dataset ni procesos de mitigacion.
- Cobertura idiomatica incierta: el nombre sugiere aleman, pero no hay confirmacion ni evaluacion multilingue.
- Contexto limitado (8.192 tokens en el modelo base como maximo) en comparacion con modelos actuales de 32 K o 128 K.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que complica el despliegue en entornos de bajos recursos sin conversion manual.
- Repositorio de 13,9 GB para un modelo de 360 M: probablemente incluye checkpoints intermedios u otros artefactos; conviene revisar los archivos antes de descargar.
- Fecha de creacion futura (2026-11-18) en los metadatos: posible inconsistencia que conviene verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ndoll1998/smollm2-360m_cpt-finemed-de
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Run de entrenamiento en Weights & Biases: https://wandb.ai/ndoll/sft-cpt-finemed-de/runs/smollm2-360m--cpt-finemed-de-a76b04d2
- Repositorio TRL: https://github.com/huggingface/trl
