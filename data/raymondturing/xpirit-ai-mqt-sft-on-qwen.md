# RaymondTuring/xpirit-ai-mqt-sft-on-qwen

## Resumen

Xpirit AI - Macrobiotic Quantum Theory SFT on Qwen es un ajuste fino supervisado (SFT) publicado por RaymondTuring sobre una base de la familia Qwen. El modelo pertenece al proyecto Xpirit AI — American LTD y su autor intelectual es Marcelo Marshall de Siqueira. Su objetivo declarado es explorar la expresion en lenguaje natural de la Macrobiotic Quantum Theory (MQT), un marco fisico publicado por el propio autor. Con 8.190.735.360 parametros, se situa en la franja de los modelos de 8B, un tamano habitual para experimentacion en una sola GPU.

El modelo se presenta explicitamente como un artefacto historico y de transparencia, no como un sistema listo para produccion. Segun su model card, aplica la MQT de forma imprecisa e inconsistente, y esa limitacion documentada es precisamente la que motivo el desarrollo posterior de la arquitectura LTLM (Large Theory Language Model) y del modelo propietario Xpirit Da Vinci. Es, por tanto, un primer intento que demuestra que un ajuste fino plano puede hablar sobre una teoria pero no razonar dentro de ella de forma fiel.

La relevancia actual es limitada y de caracter metodologico: sirve como referencia para investigar el paso de teoria a lenguaje en modelos pequenos, para estudiar los limites del SFT frente al razonamiento estructurado, y como punto de partida documentado de una linea de trabajo. La licencia es Apache 2.0, los pesos estan en safetensors y GGUF, y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (base Qwen, ajuste fino supervisado); variante concreta de Qwen no disponible |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF disponible en el repositorio; niveles concretos no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un modelo de lenguaje causal de estilo chat/instruccion, obtenido mediante ajuste fino supervisado sobre una base Qwen. No se especifica la variante exacta de Qwen (Qwen2, Qwen2.5 o Qwen3), aunque las etiquetas del repositorio incluyen "qwen3". Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset de SFT ni si hubo etapas de RLHF o DPO; estos datos figuran como no disponibles.

La innovacion tecnica declarada no esta en la arquitectura, sino en el dominio: el entrenamiento busca que el modelo exprese en lenguaje natural los conceptos de la Macrobiotic Quantum Theory. La propia model card reconoce que el resultado es fluido pero doctrinalmente impreciso, lo que constituye la evidencia que llevo al equipo a abandonar el enfoque de SFT plano en favor de la arquitectura LTLM. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni mecanismos hibridos.

## Capacidades

- Generacion de texto conversacional e instruccional en ingles, en formato chat.
- Descripcion en lenguaje natural de conceptos de la Macrobiotic Quantum Theory, con precision limitada segun el propio autor.
- Razonamiento general heredado de la base Qwen, sin garantias especificas documentadas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion sobre teoria-a-lenguaje: el modelo sirve como linea base para estudiar como un SFT plano representa un marco teorico cerrado, comparando su salida con la de arquitecturas posteriores como LTLM.
- Referencia historica del linaje Xpirit: util para documentar la evolucion del proyecto y justificar decisiones de diseno arquitectonico en publicaciones o informes tecnicos.
- Experimentos academicos de fidelidad doctrinal: permite medir la tasa de afirmaciones imprecisas sobre MQT y disenar metricas de consistencia teorica.
- Evaluacion de ajustes finos pequenos en una sola GPU: con 8,19B parametros y pesos GGUF, es viable reproducir el pipeline de SFT y evaluacion en hardware de consumo.
- Docencia sobre limitaciones del SFT: sirve como ejemplo practico de que un modelo puede hablar de una teoria sin razonar dentro de ella, ilustrando la diferencia entre fluidez y fidelidad.
- Pruebas de infraestructura de despliegue: por su tamano y disponibilidad en safetensors y GGUF, puede usarse para validar pipelines con vLLM, llama.cpp u Ollama antes de migrar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 20-24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 4,5-5,5 GB para pesos.
- GPU recomendadas para precision completa: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB, ajustada).
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en FP16 con contexto moderado; en cuantizacion de 4 bits puede ejecutarse en GPUs de 8 GB, como RTX 3060 Ti o RTX 4060.
- Opciones de despliegue: vLLM y TGI para safetensors; llama.cpp y Ollama para los pesos GGUF; transformers para uso directo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Xpirit AI MQT SFT on Qwen | 8,19B | No disponible | Apache 2.0 | Hugging Face (safetensors, GGUF) | SFT de nicho sobre Qwen; sin benchmarks publicados |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens (128K con RoPE scaling) | Apache 2.0 | Hugging Face, amplio ecosistema | Base generalista con benchmarks publicados |
| Llama 3.1 8B Instruct | 8,0B | 128.000 tokens | Llama 3.1 Community License | Hugging Face, Meta | Requiere aceptar licencia; uso comercial con restricciones |
| Mistral 7B Instruct v0.3 | 7,2B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa generalista de tamano comparable |

La comparacion con la base Qwen exacta no es posible porque la variante no esta documentada. En terminos de rendimiento medido, este modelo no aporta cifras, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Aplica la Macrobiotic Quantum Theory de forma imprecisa e inconsistente; el propio autor lo documenta como su defecto central.
- Hereda los sesgos y limitaciones generales de su base Qwen, que no se detallan.
- Riesgo de alucinacion elevado en el dominio objetivo: puede producir afirmaciones fluidas pero doctrinalmente incorrectas sobre MQT.
- Solo admite ingles; no hay soporte multilingue declarado.
- Longitud de contexto no documentada, lo que impide planificar cargas de trabajo con ventanas largas.
- No es representativo de los modelos actuales ni propietarios de Xpirit AI.
- No apto como razonador fiel de MQT ni para uso en produccion sin evaluacion previa.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sobre MQT puede ser incorrecto y no debe presentarse como referencia cientifica.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RaymondTuring/xpirit-ai-mqt-sft-on-qwen
- Referencia bibliografica citada en la model card: *The Forgotten Quantum of Einstein*, M. M. de Siqueira, 3.ª ed., 2026 (paper con DOI permanente; enlace directo no disponible)
- Repositorio, blog o demo del proyecto Xpirit AI: no disponible en la informacion proporcionada
