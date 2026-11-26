# kisson2000/kanana-1.5-8b-instruct-2505-Persona-LORA

## Resumen

kanana-1.5-8b-instruct-2505-Persona-LORA es un ajuste fino (LoRA) publicado por el usuario kisson2000 sobre el modelo base kakaocorp/kanana-1.5-8b-instruct-2505, desarrollado originalmente por Kakao Corp. Se trata de un adaptador de bajo rango orientado a la personalización de estilo o "persona" conversacional, entrenado con la librería Unsloth y el stack de TRL sobre la arquitectura Llama. El repositorio tiene un tamano de 0,1 GB, coherente con un adaptador LoRA y no con un modelo completo de pesos.

El modelo hereda las caracteristicas del base: un transformer de 8 mil millones de parametros con capacidad de instruccion y conversacion. El ajuste se ha realizado exclusivamente sobre datos en ingles segun los metadatos de la model card, lo que limita su uso en otros idiomas sin evaluacion adicional.

La relevancia de esta ficha es practica: permite evaluar rapidamente si este adaptador de persona encaja en un despliegue existente de kanana-1.5-8b-instruct, con licencia Apache 2.0 y compatibilidad con transformers y text-generation-inference. No obstante, la ausencia de benchmarks, de detalle del dataset y de documentacion tecnica exige cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (heredada del base kanana-1.5-8b-instruct-2505) |
| Parametros totales | 8 mil millones (modelo base); el repositorio contiene un adaptador LoRA |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; las cuantizaciones dependerian del base al fusionarse) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); repo de 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se construye sobre kakaocorp/kanana-1.5-8b-instruct-2505, un transformer decoder-only de 8 mil millones de parametros de la familia Llama, segun los tags del repositorio. El ajuste fino se realizo con Unsloth (que el autor declara como 2x mas rapido) y con TRL, lo que sugiere un entrenamiento supervisado de instrucciones (SFT) o posiblemente DPO, aunque la model card no especifica la tecnica exacta ni el numero de pasos, el rango del LoRA, el alpha ni la tasa de aprendizaje.

No se documenta el volumen de datos de entrenamiento, la composicion del dataset de persona, si hubo filtrado, ni si se aplicaron tecnicas de regularizacion como dropout o early stopping. Tampoco se indica si el adaptador se fusiono con el base o se distribuye en formato PEFT separado; el tamano de 0,1 GB apunta a un adaptador sin fusionar. No hay informacion sobre innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.) mas alla de las del modelo base.

## Capacidades

- Generacion de texto conversacional con estilo o persona ajustada, segun el proposito declarado del adaptador.
- Instruccion y seguimiento de dialogos multi-turno, heredado del modelo base instruct.
- Razonamiento basico y respuesta a preguntas en ingles.
- Generacion de codigo y matematicas a nivel del modelo base, sin garantias especificas del ajuste.
- Soporte de tool calling / function calling: no disponible de forma confirmada en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas en este adaptador.
- Capacidades multilingues: limitadas a ingles segun los metadatos; el coreano del base no esta declarado para este ajuste.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado de chatbots con personalidad: el adaptador permite experimentar con un tono o personaje concreto sobre un base de 8B, sin reentrenar desde cero, usando transformers y PEFT para cargar el LoRA.
- Asistentes conversacionales internos en ingles: adecuado para pruebas de concepto de atencion al cliente o soporte con estilo controlado, aunque requiere validacion de calidad antes de produccion.
- Generacion de contenido con voz de marca: se puede usar para redactar textos con un registro definido (por ejemplo, blog o redes) en ingles, fusionando el adaptador con el base.
- Investigacion sobre personalizacion eficiente: util como caso de estudio de ajuste LoRA con Unsloth y TRL para comparar tecnicas de bajo rango.
- Evaluacion de robustez de personas: permite medir deriva de estilo, alucinacion y coherencia en dialogos largos frente al modelo base sin ajustar.
- Despliegue ligero en entornos con GPU consumer: al ser un adaptador, se puede servir con vLLM o TGI sobre el base cuantizado, reduciendo coste de almacenamiento y permitiendo multiples personas sobre una misma instancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del base de 8B; en FP16 aproximadamente 16 GB, en 8 bits unos 8-10 GB y en 4 bits unos 5-6 GB, mas el overhead del adaptador (minimo).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 para FP16; RTX 3090/4090 o GPUs con 12-16 GB para cuantizacion 8/4 bits.
- Cabe en GPU consumer: si, en RTX 3090, 4090, 4080 y en GPUs de 12 GB o mas con cuantizacion.
- Opciones de despliegue: transformers con PEFT, text-generation-inference (tag declarado), vLLM (previa fusion del adaptador), llama.cpp/Ollama si se convierte a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| kanana-1.5-8b-instruct-2505-Persona-LORA | 8B (base) + LoRA | no disponible | apache-2.0 | Adaptador de persona en ingles; sin benchmarks |
| kakaocorp/kanana-1.5-8b-instruct-2505 (base) | 8B | no disponible | no disponible | Modelo instruct original de Kakao; referencia directa |
| Llama 3.1 8B Instruct | 8B | 128k (segun documentacion publica de Meta) | Llama 3.1 Community License | Alternativa generalista con amplio ecosistema |
| Qwen2.5 7B Instruct | 7B | 128k (segun documentacion publica) | Apache 2.0 | Alternativa multilingue con licencia permisiva |

La comparativa de rendimiento no esta disponible para este adaptador; los datos de los modelos alternativos provienen de su documentacion publica y no de una evaluacion propia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de mejora o degradacion frente al base.
- Dataset de persona no documentado: riesgo de sesgos, sobreajuste al estilo y respuestas estereotipadas.
- Riesgo de alucinacion inherente a modelos de 8B, no mitigado por el ajuste.
- Idiomas: solo ingles declarado; el uso en castellano u otros idiomas no esta validado y puede degradar la calidad.
- Contexto maximo no documentado: no se debe asumir la ventana del base sin verificacion.
- Licencia Apache 2.0 declarada, pero conviene revisar las condiciones del modelo base de Kakao antes de uso comercial.
- Repositorio con 0 descargas y 0 likes: sin validacion por la comunidad, lo que aumenta el riesgo de artefactos o configuraciones incorrectas.
- No se especifica si el adaptador es compatible con todas las versiones de transformers/PEFT; probar en entorno aislado.

## Enlaces

- Hugging Face: https://huggingface.co/kisson2000/kanana-1.5-8b-instruct-2505-Persona-LORA
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft
