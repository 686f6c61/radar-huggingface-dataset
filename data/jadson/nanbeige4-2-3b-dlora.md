# Jadson/Nanbeige4.2-3B-dlora

## Resumen

`Jadson/Nanbeige4.2-3B-dlora` no es un modelo de lenguaje al uso, sino el checkpoint de entrenamiento del difusor del proyecto dlora: una red desnoiseadora de 22,0 M de parámetros que genera, token a token, un delta LoRA de rango 16 para las proyecciones de las FFN de un backbone totalmente congelado (`Nanbeige/Nanbeige4.2-3B`, el checkpoint instruct). El backbone, un transformer con arquitectura "looped" de 3B de parámetros no de embedding, permanece byte a byte idéntico al del hub; solo se entrena el difusor.

La innovación es el mecanismo: en lugar de un adaptador LoRA estático, el delta se sintetiza dinámicamente por token mediante muestreo DDIM de 4 pasos sobre la salida de atención (`x_attn`) de ese paso, y se aplica en las 44 invocaciones de FFN del backbone (22 capas x 2 pasadas). Esto convierte al modelo en un banco de pruebas para adaptación condicionada por token con un coste de entrenamiento mínimo en parámetros (22 M entrenables frente a 3 B congelados).

El repositorio es explícitamente un artefacto de formación continuada, no de inferencia: la model card indica que el checkpoint corresponde al paso 152 de un preentrenamiento sobre texto crudo (FineWeb2-HQ, 20 idiomas sin inglés) y que el siguiente paso previsto es un SFT de chat. Para inferencia, el autor publica un GGUF fusionado en un repositorio aparte servido con un fork de llama.cpp. Fue publicado el 27 de octubre de 2026 y, en el momento de redactar esta ficha, no acumula descargas ni likes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone: transformer "looped" (reutilización de la pila de capas, 22 capas x 2 pasadas); adaptador: difusor DDIM que emite LoRA de rango 16 sobre FFN |
| Parametros totales | Backbone: 3B no-embedding; difusor: 22.032.736 (F32, 84,1 MiB en 21 tensores) |
| Parametros activos | 22.032.736 entrenables (el backbone está congelado); no es un MoE |
| Longitud de contexto | no disponible (el preentrenamiento del difusor empaquetó documentos completos en secuencias de 262.144 tokens) |
| Tipos de cuantizacion | Backbone obligatoriamente en NF4 (bitsandbytes, double quant); GGUF IQ4_NL publicado en el repo de inferencia; difusor en F32 |
| Idiomas soportados | no disponible oficialmente; el preentrenamiento del difusor usó FineWeb2-HQ en 20 idiomas sin inglés |
| Licencia | Apache-2.0 (idéntica al backbone) |
| Formato de pesos | `difusor.ckpt` (torch, fp32) + módulo Python `nanbeige_ffn_diffusion_lora.py`; GGUF fusionado en repo separado |

## Arquitectura y entrenamiento

El sistema consta de dos piezas. El backbone es `Nanbeige/Nanbeige4.2-3B` en su variante instruct, un modelo de 3B parámetros no de embedding con un transformer en el que la pila de capas se reutiliza (looped), de modo que gana profundidad efectiva sin incrementar el número de parámetros. Sobre él se acopla `LoRADiffuser`, un desnoiseador de 22 M de parámetros con dimensión latente 32, rango y alpha de LoRA 16/16, que consume únicamente `x_attn` (lo que la atención produjo en ese paso) y emite un delta LoRA para las proyecciones gate, up y down de cada FFN. El muestreo es DDIM con 4 pasos por aplicación, sigma de ruido 1.0, y se ejecuta en las 44 aplicaciones de FFN del backbone looped.

El entrenamiento del difusor es un preentrenamiento sobre texto crudo, sin SFT: FineWeb2-HQ en 20 idiomas excluyendo inglés, documentos completos empaquetados en secuencias de 262.144 tokens y 4 extracciones de ruido por documento con selección best-of-4. Este repositorio contiene el paso 152 de esa ejecución. El backbone nunca se actualiza, pero los gradientes fluyen a través de él hasta el difusor (`enable_input_require_grads` bajo checkpointing), una distinción que la model card subraya porque "congelado" no equivale a `no_grad`. El entrenador de referencia (`treinar_nanbeige_ffn_diffusion_lora.py`) usa transformers + Lightning Fabric con CLI tyro, aplica `apply_chat_template` y enmascara los tokens de prompt con -100.

Hay tres invariantes de régimen que, según el autor, rompen el modelo si se alteran: el backbone debe cargarse en NF4 (con bf16 original el modelo degenera), la entrada debe ser `x_attn`, y hay que llamar a `restaurar_rope(model)` después de cada `from_pretrained` porque transformers 5 deja el `inv_freq` del código remoto sin inicializar. En inferencia se usa una única extracción de ruido fija con semilla 42 (`ruido_da_inferencia`).

## Capacidades

- Generación de texto condicionada por un delta LoRA sintetizado por token sobre las FFN del backbone Nanbeige4.2-3B.
- Adaptación dinámica por token: el delta no es fijo, se muestrea con 4 pasos DDIM distintos en cada aplicación de FFN.
- Entrenamiento continuado (SFT de chat) sobre backbone congelado con solo 22 M de parámetros actualizables, incluido soporte DDP y checkpointing.
- Ajuste fino con backbone cuantizado en NF4, lo que permite entrenar en hardware de gama consumer.
- Servible para inferencia vía GGUF IQ4_NL fusionado en un fork de llama.cpp (repo de inferencia).
- Capacidad de razonamiento en formato CoT medida con el harness oficial de MMLU-Pro en modo 5-shot.
- No incorpora tool calling, visión, audio ni modo thinking propios; cualquier capacidad de agente procede del backbone Nanbeige4.2-3B subyacente, no del difusor.
- Idiomas: no hay lista oficial para este artefacto; el difusor se preentrenó con 20 idiomas sin inglés.

## Casos de uso

- Reproducción de investigación en adaptadores generados por difusión: el `cfg` dentro de `difusor.ckpt` registra todos los hiperparámetros, de modo que un grupo puede reconstruir exactamente el régimen (rango 16, alpha 16, latente 32, 4 pasos DDIM, entrada `x_attn`) y verificar el paso 152.
- SFT de chat sobre backbone congelado: el repositorio está pensado para lanzar el trainer incluido con `--model.load-in-4bit` y, por ejemplo, `HuggingFaceH4/ultrafeedback_binarized` (split `train_sft`, columna `chosen`), entrenando solo 22 M de parámetros.
- Estudio del "format/letter-mass effect": el autor documenta que un delta preentrenado en texto crudo sobre un backbone instruct desplaza las salidas hacia estadísticas de preentrenamiento; el checkpoint permite cuantificar ese desplazamiento antes y después del SFT.
- Ablaciones de la entrada del difusor: al estar parametrizada la entrada (`x_attn`), se puede comparar con alternativas (por ejemplo, estados ocultos completos) manteniendo el resto del régimen fijo.
- Evaluación de razonamiento con harness CoT: servir el GGUF fusionado con el fork de llama.cpp y ejecutar MMLU-Pro 5-shot a temperatura 0 para obtener la precisión oficial y estricta con error estándar.
- Prototipado en GPU consumer: al necesitar el backbone en NF4 (aproximadamente 2 GB de pesos) más 84,1 MiB de difusor, es viable experimentar en una única GPU de 8-12 GB.
- Docencia y divulgación técnica: el par (backbone congelado + desnoiseador diminuto) es un ejemplo compacto y ejecutable de adaptación condicionada por token frente a LoRA clásico.

## Benchmarks y rendimiento

Evaluación con el harness oficial MMLU-Pro CoT (5-shot, temperatura 0), servido mediante llama.cpp desde el GGUF bf16 fusionado. Según el autor, este checkpoint no se ha reevaluado después de SFT: los números corresponden al difusor preentrenado en texto crudo.

| Medida | Valor |
|---|---|
| Precisión oficial | 77,98 % |
| Precisión estricta | 77,86 % (error estándar 0,38 pp) |
| Preguntas | 12.032 |
| Sin respuesta / truncadas | 161 / 178 |
| Tokens de finalización medios | 5.384 |

No se han publicado resultados de HumanEval, GSM8K ni de otras tareas en la información disponible, ni existe una ejecución del modelo base con el mismo protocolo que permita aislar la contribución del difusor.

## Requisitos de hardware

- VRAM estimada para inferencia: backbone de 3B en NF4 en torno a 1,7-2,0 GB de pesos, más 84,1 MiB de difusor en F32 y la caché KV. Estimación orientativa; el autor advierte que el grafo de llama.cpp crece aproximadamente 3,5x por los productos matriciales extra del muestreador DDIM, lo que aumenta el coste de cómputo más que el de memoria.
- GPU recomendadas: para entrenamiento, una GPU con al menos 12-16 GB (RTX 4090, A10, L4) permite SFT con backbone NF4; para servir el GGUF, basta una gama media.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090; en tarjetas de 8 GB conviene validar el overhead del grafo ampliado y la longitud de contexto.
- Opciones de despliegue: fork de llama.cpp del autor (rama `teste3-nanbeige-dlora`) con el GGUF IQ4_NL; transformers ≥ 5.18 con bitsandbytes NF4 para entrenamiento. vLLM, TGI y Ollama no aparecen soportados en la información disponible, dado que requieren un grafo de decodificación estándar.
- Latencia y throughput: no disponibles. Los 5.384 tokens de finalización medios en MMLU-Pro sugieren generaciones largas en modo CoT, pero no se publican tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jadson/Nanbeige4.2-3B-dlora` (este repo) | 3B congelados + 22,0 M entrenables | no disponible | MMLU-Pro 77,98 % oficial (solo difusor, pre-SFT) | Apache-2.0 | Peso `difusor.ckpt` + scripts |
| `Nanbeige/Nanbeige4.2-3B` (backbone instruct) | 3B no-embedding | no disponible | no disponible con el mismo protocolo | Apache-2.0 | Hub, transformers |
| `Jadson/Nanbeige4.2-3B-dlora-GGUF` | Idéntico, fusionado | no disponible | Mismas cifras MMLU-Pro | Apache-2.0 | GGUF IQ4_NL para llama.cpp |
| Otros modelos agénticos de ~3B (por ejemplo familias Qwen o Llama 3.2) | ~3B | no disponible en esta ficha | no comparable sin datos homogéneos | varía según familia | Hub |

La comparación cuantitativa con alternativas de 3B no es posible con la información disponible: no hay ejecuciones del backbone base ni de terceros bajo el mismo harness y protocolo.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un checkpoint de entrenamiento cuyo objetivo declarado es servir de punto de partida para SFT de chat.
- El delta activo arrastra las salidas del modelo instruct hacia estadísticas de texto crudo (efecto de formato y de masa de letras), lo que degrada la calidad conversacional frente al backbone original.
- Cargar el backbone en bf16 en lugar de NF4 degenera el modelo: el difusor se entrenó contra pesos cuantizados NF4 y esa cuantización forma parte del régimen.
- Es obligatorio llamar a `restaurar_rope(model)` tras cada `from_pretrained` con transformers 5 y código remoto; omitirlo produce resultados incorrectos.
- La inferencia usa una única extracción de ruido fija (semilla 42) mientras el entrenamiento usó best-of-4 por documento; el comportamiento fuera de esa configuración no está caracterizado.
- Los hiperparámetros deben coincidir exactamente con el `cfg` del checkpoint (rango/alpha 16, latente 32, 4 pasos DDIM, sigma 1.0); cualquier desviación invalida los pesos.
- No hay evaluación posterior al SFT ni comparación del backbone base con el mismo protocolo: no se puede atribuir el 77,98 % de MMLU-Pro al adaptador frente al backbone.
- Riesgo de alucinación, sesgos y calidad multilingüe no medidos. El preentrenamiento excluyó el inglés (FineWeb2-HQ, 20 idiomas), lo que deja el comportamiento en inglés dependiente solo del backbone.
- La licencia Apache-2.0 permite uso comercial, pero el estado del artefacto (pre-SFT, con degradación de formato documentada) desaconseja cualquier despliegue directo.
- Coste de inferencia superior al de un LoRA estático: el grafo de llama.cpp crece aproximadamente 3,5x por los productos matriciales del muestreador DDIM.

## Enlaces

- Repositorio del difusor: https://huggingface.co/Jadson/Nanbeige4.2-3B-dlora
- Artefacto de inferencia (GGUF IQ4_NL): https://huggingface.co/Jadson/Nanbeige4.2-3B-dlora-GGUF
- Runtime (fork de llama.cpp): https://github.com/jadsongmatos/llama.cpp/tree/teste3-nanbeige-dlora
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Paper de Nanbeige4.2-3B: https://arxiv.org/abs/2607.22083
- Ficha de Nanbeige4.2-3B en There's An AI For That: https://theresanaiforthat.com/model/nanbeige4-2-3b/
- Entrada de terceros sobre el GGUF: https://free2aitools.com/model/jadson/nanbeige4.2-3b-dlora-gguf
