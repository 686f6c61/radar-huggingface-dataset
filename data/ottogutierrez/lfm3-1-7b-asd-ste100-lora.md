# ottogutierrez/lfm3-1.7b-asd-ste100-lora

## Resumen

El modelo `ottogutierrez/lfm3-1.7b-asd-ste100-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario ottogutierrez sobre el modelo base `LiquidAI/LFM3-1.7B`. Su proposito es reescribir texto en ingles hacia un estilo inspirado en ASD-STE100 (Simplified Technical English), una norma de redaccion tecnica controlada que limita el vocabulario, acorta las frases y elimina ambiguedades. No se trata de un modelo completo, sino de un conjunto de pesos delta que se cargan sobre el modelo base mediante la libreria PEFT.

El adaptador resuelve un problema concreto: el modelo base, ante una instruccion del tipo "reescribe esto en ASD-STE100", tiende a ignorar la peticion de estilo, intenta invocar herramientas o repite la frase original. El LoRA ha sido ajustado especificamente sobre ejemplos de reescritura del dataset `appclusive/asd-ste100` (subset TASK01B), de modo que el modelo resultante produce frases mas cortas y directas. El repositorio ocupa 0,1 GB y contiene unicamente los pesos del adaptador en formato safetensors.

Por su naturaleza, es una pieza de investigacion y experimentacion mas que un modelo de produccion: no hay descargas ni likes registrados, la licencia aparece como "other" y no se publican benchmarks ni evaluaciones cuantitativas. Su interes radica en demostrar como un ajuste LoRA ligero (una sola epoca, entrenado en una Tesla T4 gratuita de Colab) puede modificar un comportamiento estilistico concreto sobre un modelo de 1.700 millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer LiquidAI/LFM3-1.7B |
| Parametros totales | no disponible (adaptador; el base tiene 1,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (longitud maxima de entrenamiento: 2048 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (los ejemplos de entrenamiento estan en ingles) |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `LiquidAI/LFM3-1.7B`, un modelo de lenguaje de 1.700 millones de parametros de Liquid AI. El ajuste emplea LoRA con rango r=16, alpha=32 y dropout de 0,05, aplicado a los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `in_proj`, `out_proj`, `w1`, `w2` y `w3`. El entrenamiento se realizo con TRL SFTTrainer sobre ejemplos de tipo prompt-completion del subset TASK01B del dataset `appclusive/asd-ste100`, durante una sola epoca, con batch efectivo de 24, learning rate de 2e-4 con scheduler coseno y longitud maxima de 2048 tokens. Todo el proceso se ejecuto en una Tesla T4 de 16 GB en Colab gratuito, lo que da una idea de la ligereza del ajuste.

No se documenta el numero total de tokens vistos durante el entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO. La innovacion tecnica es modesta: se trata de un ajuste de estilo supervisado (SFT) orientado a una tarea de reescritura, sin mecanismos de decodificacion especulativa ni atencion lineal propios del adaptador.

## Capacidades

- Reescritura de texto en ingles hacia un estilo simplificado inspirado en ASD-STE100: frases cortas, voz activa y eliminacion de rodeos.
- Adaptacion de estilo sobre instrucciones del tipo "Rewrite in ASD-STE100: ...".
- Generacion de texto conversacional heredada del modelo base LiquidAI/LFM3-1.7B.
- No se documenta soporte de tool calling ni function calling especifico del adaptador.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue; los ejemplos de la model card estan en ingles.
- No se documenta vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Redaccion de documentacion tecnica: el adaptador convierte parrafos largos en instrucciones concisas y directas, utiles para manuales de producto, guias de operacion o procedimientos internos donde la claridad es critica.
- Simplificacion de mensajes de error y logs: se puede integrar en un pipeline que transforme mensajes tecnicos densos en frases accionables para operadores o usuarios finales.
- Preparacion de contenido para traduccion: al reducir la complejidad sintactica antes de traducir, se disminuye la ambiguedad y se facilita la localizacion a otros idiomas.
- Normalizacion de tickets de soporte: reescritura de descripciones de incidencias para que sigan un formato uniforme y breve, mejorando la legibilidad en colas de atencion.
- Generacion de instrucciones para asistentes automatizados: el estilo controlado reduce la variabilidad de las respuestas y facilita su validacion automatica.
- Experimentacion academica sobre control de estilo: sirve como ejemplo reproducible de como un LoRA pequeno modifica un comportamiento estilistico concreto sobre un modelo de 1,7 B, util para estudiar tecnicas de adaptacion ligera.
- Prototipado de asistentes de redaccion tecnica: dado su bajo coste de entrenamiento y despliegue, permite iterar rapidamente sobre variantes de estilo antes de invertir en ajustes mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye ejemplos cualitativos de antes/despues que muestran que el adaptador produce frases mas cortas y directas que el modelo base, sin metricas cuantitativas (BLEU, ROUGE, MMLU, HumanEval ni similares).

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa unos 0,1 GB; el modelo base de 1,7 B requiere aproximadamente 3,5 GB en fp16 y entre 1 y 2 GB en cuantizacion de 4 bits (estimacion orientativa, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el modelo base en fp16; una Tesla T4 de 16 GB fue suficiente para el entrenamiento.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, especialmente con cuantizacion.
- Opciones de despliegue: transformers + PEFT (metodo documentado por el autor); no se documenta soporte explicito en vLLM, llama.cpp, Ollama ni TGI para este adaptador concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ottogutierrez/lfm3-1.7b-asd-ste100-lora | Adaptador sobre 1,7 B | no disponible | Reescritura estilo ASD-STE100 | other | Hugging Face |
| LiquidAI/LFM3-1.7B (base) | 1,7 B | no disponible | Modelo generalista | no disponible en esta ficha | Hugging Face |
| Adaptadores LoRA de estilo genericos | Variable | Variable | Control de estilo | Variable | Hugging Face |

No se dispone de informacion sobre modelos directamente comparables en la misma tarea (reescritura ASD-STE100) ni de metricas que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Alucinacion: como cualquier modelo generativo, puede introducir afirmaciones falsas, especialmente en dominios tecnicos especializados como criptomonedas o infraestructura.
- Sesgos: no se documenta ninguna evaluacion de sesgos; el dataset de entrenamiento puede introducir sesgos de estilo o de dominio no identificados.
- Limitacion de idioma: los ejemplos y el dataset estan en ingles; el comportamiento en castellano u otros idiomas no esta validado.
- Contexto limitado en entrenamiento: la longitud maxima de 2048 tokens restringe la reescritura de documentos largos en una sola pasada.
- Licencia "other": no se especifican los terminos exactos, por lo que el uso comercial requiere consultar al autor y verificar la licencia del modelo base LiquidAI/LFM3-1.7B.
- Madurez: cero descargas y cero likes, sin evaluacion independiente; no es recomendable para produccion sin validacion previa.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma y requiere cargar `LiquidAI/LFM3-1.7B` con `trust_remote_code=True`.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/ottogutierrez/lfm3-1.7b-asd-ste100-lora
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/appclusive/asd-ste100
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
