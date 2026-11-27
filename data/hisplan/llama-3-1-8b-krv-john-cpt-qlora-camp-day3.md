# hisplan/Llama-3.1-8B-krv-john-cpt-qlora-camp-day3

## Resumen

El modelo `hisplan/Llama-3.1-8B-krv-john-cpt-qlora-camp-day3` es un adaptador LoRA de tipo QLoRA entrenado sobre la copia base de Meta Llama 3.1 8B publicada por Unsloth (`unsloth/Meta-Llama-3.1-8B`). Lo desarrolla el usuario hisplan en el marco de la tercera jornada del Mini LLM Camp, un taller universitario de formacion en modelos de lenguaje. El objetivo concreto es el aprendizaje por continuacion de texto (continued pretraining) del texto coreano del Evangelio de Juan en la version Revisada Coreana (개역한글), sin pasar por una fase de ajuste por instrucciones (SFT).

El adaptador no contiene pesos completos: el repositorio ocupa 0,7 GB y unicamente almacena los tensores LoRA (unos 670 MB) que se aplican sobre el modelo base de 8.000 millones de parametros. Se trata, por tanto, de un artefacto experimental y educativo orientado a demostrar el flujo completo de preentrenamiento continuado con QLoRA sobre un corpus muy pequeno y especializado, no de un modelo listo para produccion.

Su relevancia actual es metodologica: documenta con detalle el proceso (4 bits NF4, LoRA r=64 sobre las siete proyecciones, mezcla del 21 % de datos genericos para mitigar el olvido catastrofico) y aporta una evaluacion honesta de memorizacion frente a generalizacion, incluyendo el fracaso total sobre pasajes no vistos. Es un caso de estudio util para quienes planean preentrenamiento continuado de bajo coste en idiomas con pocos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA; base en 4 bits NF4 |
| Parametros totales | Aproximadamente 8.000 millones (modelo base); el adaptador LoRA no declara recuento exacto |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens en el modelo base Llama 3.1 8B; el entrenamiento uso secuencias de hasta 1024 tokens |
| Tipos de cuantizacion | QLoRA 4 bits NF4 con doble cuantizacion y computo en bf16 (entrenamiento); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | Coreano (etiqueta `ko`); el modelo base es multilingue |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base `unsloth/Meta-Llama-3.1-8B` |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Llama 3.1 con 8.000 millones de parametros, cargado en 4 bits (NF4, doble cuantizacion, calculo en bf16) mediante bitsandbytes. Sobre el se entrena un adaptador LoRA con rango 64, alpha 64 y dropout 0 aplicado a `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La optimizacion usa tasa de aprendizaje 2e-4 con decaimiento coseno, 10 pasos de warmup, batch efectivo de 8 (batch 2 x acumulacion de gradiente 4), adamw_8bit, weight decay 0 y semilla 3407.

El corpus de preentrenamiento continuado es el texto completo del Evangelio de Juan en coreano revisado (879 versiculos) mas Mateo 1:1-17 y Lucas 3:23-38, hasta 912 versiculos. Cada capitulo se formatea como un documento con un versiculo por linea y prefijo de localizacion en dos notaciones alternativas. Para reducir el olvido catastrofico se mezcla aproximadamente un 21 % de tokens de respuestas en coreano del dataset `nlpai-lab/kullm-v2` en formato Alpaca, regenerado en cada epoch. Las secuencias se empaquetan hasta 1024 tokens respetando limites de versiculo. El entrenamiento total es de 10 epochs, 130 pasos y 1.000.415 tokens, con objetivo de prediccion del siguiente token sobre todos los tokens (sin mascara de instruccion). Se ejecuto en una unica GPU L40S de 48 GB durante 5,5 minutos a 3.035 tokens por segundo.

## Capacidades

- Continuacion de texto del Evangelio de Juan en coreano revisado cuando se le proporciona la referencia del versiculo (`요한복음 3:16`).
- Recitacion literal del texto aprendido en modo greedy: alcanza el final del capitulo o de la genealogia desde `Juan 3:16`, `Mateo 1:1` y `Lucas 3:23`.
- Respuesta a preguntas en formato Alpaca sobre localizacion de versiculos concretos, con cita literal del texto en 4 de 4 intentos para Juan 3:16.
- Capacidad residual de conversacion en coreano heredada del modelo base y de la mezcla con kullm-v2.
- No soporta tool calling ni function calling de forma nativa (no se ha entrenado para ello).
- No soporta razonamiento multi-paso ni modo de pensamiento explicito.
- No dispone de capacidades de vision ni audio.
- No se ha realizado ajuste por instrucciones (SFT) ni RLHF/DPO: el modelo no sigue instrucciones genericas de forma fiable.

## Casos de uso

- Estudio de preentrenamiento continuado: sirve como referencia reproducible para comparar estrategias de mezcla de datos y medir olvido catastrofico en corpus pequenos.
- Demostracion docente de QLoRA: permite ilustrar en un taller el ciclo completo (cuantizacion 4 bits, configuracion LoRA, empaquetado de secuencias, evaluacion por teacher forcing) con un coste de computo de minutos.
- Recuperacion asistida de citas biblicas en coreano: dado un numero de versiculo dentro del Evangelio de Juan, el modelo reproduce el texto con alta fidelidad en modo greedy, util como prototipo de indice memoristico.
- Generacion de pares pregunta-respuesta sobre un corpus cerrado: el formato Alpaca permite construir plantillas de consulta que el modelo responde citando el pasaje, aprovechable para aumentar datos de entrenamiento de otros sistemas.
- Prueba de concepto de adaptacion linguistica de bajo coste: valida si un modelo multilingue de 8B puede absorber un dominio coreano especializado con menos de un millon de tokens.
- Evaluacion de alucinacion en dominios factuales: el contraste documentado entre versiculos vistos (87,9 % de acierto con contexto previo) y no vistos (0 %) lo convierte en un banco de pruebas para metricas de fidelidad.
- Investigacion sobre tokenizacion y formato: permite medir como afectan los prefijos de localizacion y el empaquetado por lineas a la memorizacion exacta de secuencias.

## Benchmarks y rendimiento

| Condicion de evaluacion | Antes del entrenamiento | Despues del entrenamiento |
|---|---|---|
| Solo posicion (`요한복음 3:17`), acierto literal del versiculo completo | 0 % | 27,3 % |
| Posicion mas versiculo anterior (`요한복음 3:16` + salto + `요한복음 3:17`) | 0 % | 87,9 % |
| 100 versiculos de libros no entrenados | 0 % | 0 % |
| Pregunta Alpaca sobre localizacion de Juan 3:16 con cita literal (greedy 1 + muestreo 3, T 0,6) | No disponible | 4 de 4 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores corresponden a una evaluacion propia por teacher forcing sobre los 912 versiculos de entrenamiento.

## Requisitos de hardware

- VRAM estimada en inferencia con cuantizacion 4 bits NF4: en torno a 6-7 GB para los pesos del modelo base mas el adaptador; en bf16 completo, aproximadamente 16 GB.
- GPU recomendadas: L40S 48 GB (configuracion usada en entrenamiento), A100 40/80 GB, H100 para lotes grandes; RTX 4090 24 GB suficiente para inferencia en 4 bits y para repetir el entrenamiento con margen.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090, RTX 4080 y tarjetas con 12 GB o mas usando 4 bits; con 8 bits se recomienda 16 GB o mas.
- Opciones de despliegue: transformers con peft y bitsandbytes (ruta documentada por el autor); vLLM y TGI requieren fusionar el adaptador con el modelo base antes de servir; llama.cpp y Ollama necesitan conversion a GGUF tras la fusion.
- Latencia y throughput: no se han publicado mediciones de inferencia; el autor solo reporta 3.035 tokens por segundo durante el entrenamiento en una L40S.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Llama-3.1-8B-krv-john-cpt-qlora-camp-day3) | ~8B (base) + LoRA | 131.072 tokens (base); entrenado a 1024 | Preentrenamiento continuado en coreano biblico | Llama 3.1 Community | Hugging Face, 0 descargas, 0 likes |
| `hisplan/Llama-3.1-8B-ko-sft-creation-sft-dpo-qlora-camp-day2` | ~8B (base) + LoRA | No disponible | SFT + DPO en coreano (jornada 2 del mismo campamento) | Llama 3.1 Community | Hugging Face |
| `unsloth/Meta-Llama-3.1-8B` | 8B | 131.072 tokens | Modelo base multilingue sin ajuste | Llama 3.1 Community | Hugging Face |
| Meta Llama 3.1 8B Instruct | 8B | 131.072 tokens | Ajuste por instrucciones y preferencias | Llama 3.1 Community | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada; la unica comparacion documentada es cualitativa, con el modelo de la jornada 2 fallando las 4 consultas sobre Juan 3:16 frente al exito del presente adaptador.

## Limitaciones y advertencias

- Modelo educativo y experimental: el propio autor advierte explicitamente de que no debe usarse como fuente del texto biblico.
- Alucinacion sistematica fuera del dominio: los versiculos no entrenados se generan con estilo plausible pero contenido inventado; la tasa de acierto en 100 versiculos no vistos es del 0 %.
- Memorizacion dependiente de contexto: con solo la referencia del versiculo acierta el 27,3 %; necesita el versiculo anterior para alcanzar el 87,9 %, y falla el inicio de 3 de cada 4 versiculos en esa condicion.
- Sin ajuste por instrucciones: una pregunta sin formato Alpaca provoca salida vacia; incluso con el formato, un muestreo genero texto inventado a partir de la mitad del pasaje.
- Continuacion no solicitada: al no haberse aplicado mascara de instruccion, el modelo puede seguir escribiendo versiculos posteriores sin que se le pida.
- Sesgos: no documentados por el autor; al derivar de Llama 3.1 hereda los sesgos del modelo base, aunque el ajuste se limita a un corpus religioso muy concreto.
- Cobertura linguistica restringida: el ajuste es exclusivamente en coreano y sobre un unico libro; el multilingueismo del base puede degradarse parcialmente pese a la mezcla del 21 % con kullm-v2.
- Restricciones de licencia: Llama 3.1 Community License, con obligaciones de atribucion ("Built with Llama"), clausula de nombre de producto y limite de 700 millones de usuarios mensuales para determinados usos; requiere revisar `LICENSE` y `NOTICE` antes de cualquier despliegue comercial.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni garantia de mantenimiento.
- Dependencia del modelo base: el adaptador no es autonomo; requiere descargar `unsloth/Meta-Llama-3.1-8B` y aplicar PEFT con la configuracion de cuantizacion indicada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hisplan/Llama-3.1-8B-krv-john-cpt-qlora-camp-day3
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B
- Dataset de mezcla coreana: https://huggingface.co/datasets/nlpai-lab/kullm-v2
- Modelo de la jornada 2 del campamento (comparado en la model card): https://huggingface.co/hisplan/Llama-3.1-8B-ko-sft-creation-sft-dpo-qlora-camp-day2
- Licencia Llama 3.1: no disponible como enlace directo en la informacion proporcionada
