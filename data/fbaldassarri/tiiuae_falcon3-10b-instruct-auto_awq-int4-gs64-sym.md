# fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_awq-int4-gs64-sym

## Resumen

Este repositorio contiene una versión cuantizada a 4 bits del modelo Falcon3-10B-Instruct, desarrollado originalmente por el Technology Innovation Institute (TII) de Abu Dabi. La cuantización ha sido realizada por el usuario fbaldassarri mediante la herramienta Intel AutoRound v0.16.1, aplicando el algoritmo AWQ (Activation-aware Weight Quantization) en modo weights-only (WoQ) con precisión INT4, tamaño de grupo 64 y cuantización simétrica. El objetivo es reducir el peso en memoria y acelerar la inferencia entre 2 y 3 veces respecto al modelo original en bfloat16, con una ligera pérdida de precisión asumida por el autor.

El modelo base Falcon3-10B-Instruct es un transformer causal de tipo Llama con 10.000 millones de parámetros, orientado a instrucciones y conversación. Esta versión cuantizada está pensada explícitamente para su despliegue en hardware Intel: CPU, iGPU Arc (mediante intel-extension-for-pytorch) y NPU AI Boost de la serie Core Ultra (mediante OpenVINO). El repositorio ocupa 8,3 GB y declara 2.160.061.440 parámetros en los tensores safetensors, un dato que no cuadra con los 10B del modelo base y que conviene verificar antes de usarlo en producción.

La relevancia de esta ficha radica en que permite evaluar rápidamente una alternativa de bajo coste computacional para ejecutar Falcon3-10B-Instruct en entornos sin GPU de gran capacidad. No obstante, la información publicada por el autor es escasa: no hay benchmarks, no hay métricas de perplejidad ni evaluaciones de degradación por cuantización, y el modelo tiene cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (model_type: llama) |
| Parámetros totales | 2.160.061.440 (según safetensors del repo); modelo base declarado: 10B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | INT4, group size 64, simétrica, WoQ/AWQ |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |
| Modelo base | tiiuae/Falcon3-10B-Instruct |
| Método de cuantización | Intel AutoRound v0.16.1, formato auto_awq |
| Precisión de calibración | torch.bfloat16 |
| Calibración | 128 muestras, 200 iteraciones, seqlen 512, batch 4, dispositivo CPU |
| Duración de la cuantización | 51.512,5 s (858,5 min) |
| Tamaño del repositorio | 8,3 GB |
| Librería | transformers |
| Pipeline | text-generation |
| Hardware objetivo | CPU Intel, iGPU Arc, NPU AI Boost (Core Ultra) |

## Arquitectura y entrenamiento

El modelo base Falcon3-10B-Instruct es un transformer causal autorregresivo con atención estándar y arquitectura compatible con la familia Llama (el campo `model_type` del repo cuantizado es `llama`). Está afinado para seguir instrucciones y mantener conversaciones multi-turno mediante una plantilla de chat propia. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La innovación técnica de este artefacto es la cuantización WoQ con AWQ, implementada a través de Intel AutoRound. AWQ protege los pesos más sensibles a la activación escalándolos antes de cuantizar, lo que reduce la degradación respecto a una cuantización uniforme. El proceso se ejecutó íntegramente en CPU con precisión bfloat16, 128 muestras de calibración, 200 iteraciones de ajuste y una longitud de secuencia de 512 tokens, durante aproximadamente 14 horas. El resultado son pesos INT4 con grupo de 64 y simetría, empaquetados como safetensors cargables por transformers. No se documenta ninguna técnica adicional como decodificación especulativa, atención lineal o híbridos SSM.

## Capacidades

- Generación de texto y conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Seguimiento de instrucciones, herencia del modelo base Instruct.
- Razonamiento y respuesta a preguntas en inglés.
- Generación de código y matemáticas: capacidad esperable del modelo base, no verificada en esta versión cuantizada.
- Tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Inferencia optimizada en CPU Intel, iGPU Arc y NPU AI Boost.

## Casos de uso

- Asistente conversacional local en inglés: desplegado sobre un portátil con Core Ultra, el modelo puede gestionar diálogos multi-turno usando la plantilla de chat incluida, aprovechando la NPU AI Boost vía OpenVINO para reducir consumo energético.
- Chatbot de soporte en CPU sin GPU dedicada: al ser INT4 con 8,3 GB de repo, puede ejecutarse en servidores Intel Xeon con intel-extension-for-pytorch, ofreciendo una alternativa de bajo coste frente a modelos en bfloat16.
- Prototipado rápido de aplicaciones de texto: la carga con `AutoModelForCausalLM.from_pretrained` y `device_map="auto"` permite integrar el modelo en scripts de transformers sin infraestructura especializada.
- Generación de borradores y resúmenes en inglés: adecuado para tareas de redacción asistida donde la latencia importa más que la fidelidad absoluta, dado el speedup de 2-3x declarado.
- Evaluación comparativa de cuantizaciones: útil como referencia para investigadores que quieran medir la degradación de AWQ INT4 g64 frente al modelo original en tareas concretas.
- Despliegue en edge computing con iGPU Arc: escenarios de inferencia en dispositivos con gráfica integrada Intel, donde el modelo cabe en memoria compartida y se beneficia de la aceleración XPU.
- Filtrado y clasificación de texto a pequeña escala: tareas de etiquetado o moderación en inglés donde un modelo de 10B cuantizado ofrece calidad suficiente con requisitos de memoria moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente declara un speedup de 2-3x y una "ligera caída de precisión" en W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni perplejidad. Tampoco se aportan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio pesa 8,3 GB, por lo que se necesita al menos ~9-10 GB de memoria libre para cargar los pesos INT4, más overhead de activaciones y KV cache.
- GPU recomendadas: no se especifican; el autor orienta el artefacto a CPU Intel, iGPU Arc y NPU AI Boost.
- Compatibilidad con GPU de consumo: probable en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090), aunque no está validado por el autor.
- Opciones de despliegue: transformers (probado), text-generation-inference (etiqueta presente), intel-extension-for-pytorch (CPU/iGPU), OpenVINO (NPU). No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles; solo se declara un speedup de 2-3x frente al modelo en bfloat16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_awq-int4-gs64-sym | 10B (base); 2,16B declarados en safetensors | no disponible | INT4 AWQ g64 | Apache 2.0 | Hugging Face, 0 descargas |
| tiiuae/Falcon3-10B-Instruct (original) | 10B | no disponible | bfloat16 | Apache 2.0 | Hugging Face, oficial |
| Otras cuantizaciones INT4 de Falcon3-10B-Instruct | 10B | no disponible | INT4 (GGUF/AWQ/GPTQ) | Apache 2.0 | Hugging Face, comunidad |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se declaran capacidades multilingües.
- La cuantización INT4 g64 introduce degradación de precisión no cuantificada; el autor la describe como "ligera" sin aportar métricas.
- El número de parámetros reportado en safetensors (2,16B) no coincide con los 10B del modelo base, lo que sugiere un posible error de empaquetado o de metadatos; conviene validar el modelo antes de usarlo.
- El modelo tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día; no hay evidencia de uso en producción ni validación independiente.
- El autor declara explícitamente que el modelo se desarrolló "solo para fines de investigación" y sin garantía, pese a la licencia Apache 2.0.
- Riesgo de alucinación inherente al modelo base, no mitigado ni evaluado en esta versión.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La receta de replicación apunta a un repositorio en `git.epicdynamic.com`, un dominio no estándar que conviene verificar antes de ejecutar scripts de instalación.
- No se garantiza compatibilidad con motores de inferencia distintos de transformers, IPEX u OpenVINO.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_awq-int4-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-10B-Instruct
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- Receta de replicación (auto-round-pipeline): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
