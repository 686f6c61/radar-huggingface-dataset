# BAJUKA/LLaVA-qwen25-3b-Tfull-r2-s42-s2b

## Resumen

LLaVA-qwen25-3b-Tfull-r2-s42-s2b es un checkpoint de investigación publicado por el usuario BAJUKA dentro de una rejilla de entrenamiento controlado que compara entrenamiento visión-lenguaje (VL) frente a entrenamiento puramente textual. Se trata del brazo «T-full» (text twin) del brazo VL-full: usa exactamente los mismos ejemplos en el mismo orden que su gemelo multimodal, pero con los tokens `<image>`/`<video>` eliminados y el campo de imagen suprimido, de modo que solo se ajusta el modelo de lenguaje.

El backbone es Qwen/Qwen2.5-3B-Instruct, fijado con semilla 42, y el checkpoint corresponde a la etapa S2b (instruct stage), inicializada desde el checkpoint S2a del mismo brazo. La torre de visión y el projector se conservan en el checkpoint con sus valores iniciales y no se utilizan en inferencia; el recuento safetensors (3.490.244.128 parámetros) los incluye. El modelo resultante es, en la práctica, un modelo de lenguaje denso de tipo Qwen2 orientado a generación de texto conversacional.

Su relevancia es metodológica más que de rendimiento: al compartir mezcla de datos, orden, optimizador y schedule de LR con el brazo VL, permite aislar qué cambia el entrenamiento multimodal respecto a consumir exactamente el mismo texto. No es una release ajustada ni alineada en seguridad, no tiene benchmarks publicados y su carga requiere el repositorio LLaVA-NeXT, ya que la clase `LlavaLlamaForCausalLM` no forma parte de `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con torre de visión y projector LLaVA-NeXT presentes en el checkpoint pero no entrenados en este brazo |
| Parametros totales | 3.490.244.128 (recuento safetensors; incluye torre de visión y projector) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8192 tokens (max seq length usado en entrenamiento); no se especifica la ventana de inferencia declarada por el autor |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en la ficha; hereda tokenizador y vocabulario de Qwen/Qwen2.5-3B-Instruct |
| Licencia | other (el autor indica que hereda la licencia de Qwen/Qwen2.5-3B-Instruct) |
| Formato de pesos | safetensors (tamaño del repositorio: 7,0 GB) |

## Arquitectura y entrenamiento

La arquitectura base es un transformer decoder-only de la familia Qwen2, sobre el que se monta la estructura LLaVA-NeXT (`LlavaLlamaForCausalLM`) con una torre de visión y un projector. En este brazo concreto, el módulo entrenable es únicamente `mm_language_model`: la torre de visión y el projector permanecen con sus valores iniciales y no intervienen en el uso text-only del modelo. El entrenamiento se realizó a bfloat16, con batch global de 128, learning rate 1e-5 (LM y projector) con schedule coseno y warmup ratio 0.03, y una longitud máxima de secuencia de 8192 tokens sobre 4x H100 80 GB con DeepSpeed ZeRO-3.

La etapa documentada es la S2b (instruct stage), inicializada desde el checkpoint S2a del mismo brazo (que corresponde al brazo cap-only en esa semilla). La mezcla de datos es INS-750K en sorteo r2: `instruct_700k_r2` (697.798 ejemplos) más `language_50k_v2` (49.956 ejemplos, reutilizados de v2). Se completaron 5841 de 5841 pasos, equivalente a la época 0,9999 de 1. La pérdida de entrenamiento descendió de 1,219 a 0,824 (media de los últimos 50 pasos registrados: 0,917), con 0 pérdidas no finitas en los 5841 pasos registrados. El repositorio incluye `trainer_state.json` con el historial completo por paso de pérdida, norma del gradiente y learning rate. La plantilla de prompt es `llama_v3`. No se realizó early stopping ni selección de checkpoint: cada etapa ejecuta una época completa.

## Capacidades

- Generación de texto conversacional en inglés y otros idiomas soportados por el tokenizador de Qwen2.5 (no verificado en la ficha).
- Instrucciones y diálogo multi-turno gracias al ajuste sobre `instruct_700k_r2` y al formato de prompt `llama_v3`.
- Razonamiento y conocimiento general heredados del backbone Qwen2.5-3B-Instruct, aunque sin evaluación publicada en esta ficha.
- Procesamiento de secuencias de hasta 8192 tokens, tal como se configuró en entrenamiento.
- Capacidad de servir como gemelo textual de control en experimentos VL frente a texto.
- No se declara soporte de tool calling, function calling, agentes ni multi-step reasoning en la información disponible.
- No se declara modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades en este brazo: la torre de visión está presente pero inactiva.
- No hay datos de benchmarks que permitan cuantificar capacidades de código, matemáticas o visión.

## Casos de uso

- Reproducción de experimentos controlados VL frente a texto: el checkpoint permite reejecutar la rama textual de la rejilla con la misma mezcla, orden y semilla, y comparar la pérdida y el comportamiento con el brazo VL-full.
- Baseline de control en estudios de entrenamiento multimodal: sirve para estimar cuánto del comportamiento del modelo VL proviene de los datos textuales subyacentes y cuánto de la información visual.
- Análisis de deriva del modelo de lenguaje al entrenar con datos multimodales: al compartir ejemplos y orden con el gemelo VL, aísla posibles efectos de olvido catastrófico o desplazamiento de distribución atribuibles a la etapa visual.
- Investigación sobre schedules de learning rate y composición de datos: el `trainer_state.json` incluido permite correlacionar pasos, norma de gradiente y LR con la curva de pérdida de una sola época completa (5841 pasos).
- Generación de texto conversacional en inglés: puede usarse como modelo de chat de ~3B parámetros con ventana de 8192 tokens para prototipos internos, siempre que se asuma la ausencia de alineación de seguridad.
- Punto de partida para fine-tuning textual posterior: al ser un LM denso estándar en bfloat16, admite ajuste adicional en tareas de texto dentro del rango de 8192 tokens, partiendo del estado S2b.
- Estudio de mezclas de datos instruct: la combinación `instruct_700k_r2` + `language_50k_v2` documentada permite replicar y variar proporciones de datos generales frente a instructivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica cuantitativa declarada por el autor es la pérdida de entrenamiento, que se recoge a continuación por ser el dato objetivo aportado:

| Metrica | Valor |
|---|---|
| Pasos completados | 5841 / 5841 (epoca 0,9999 de 1) |
| Perdida inicial | 1,219 |
| Perdida final | 0,824 |
| Media de perdida (ultimos 50 pasos) | 0,917 |
| Perdidas no finitas | 0 en 5841 pasos registrados |
| MMLU / HumanEval / GSM8K u otros | no disponible |

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 7 GB para los pesos (3,49 mil millones de parámetros) más la caché KV de 8192 tokens y el overhead del runtime.
- VRAM estimada con cuantización: no disponible; el autor no publica versiones cuantizadas y la conversión a GGUF/AWQ/GPTQ no está soportada de serie por el formato LLaVA-NeXT.
- GPU recomendadas para inferencia: una sola A100 40 GB, H100 80 GB o L40S es suficiente; también una RTX 4090 o RTX 3090 de 24 GB.
- Cabe en GPU de consumo: sí, en tarjetas con 8-12 GB o más en bfloat16, siempre que se resuelva la carga mediante el repositorio LLaVA-NeXT.
- Entrenamiento (referencia del autor): 4x H100 80 GB con DeepSpeed ZeRO-3.
- Opciones de despliegue: exclusivamente `load_pretrained_model(..., "llava_llama")` del repositorio LLaVA-NeXT; no es cargable con `transformers` estándar y no se declara compatibilidad con vLLM, TGI, llama.cpp, Ollama o LM Studio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks del modelo, por lo que la comparación se limita a características estructurales y de licencia. Los datos de los modelos de referencia no aparecen en la información proporcionada y se marcan como no disponibles.

| Modelo | Rol | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LLaVA-qwen25-3b-Tfull-r2-s42-s2b | Brazo textual de una rejilla controlada VL/texto | 3.490 M (incluye torre de vision y projector) | 8192 en entrenamiento | other (hereda Qwen2.5-3B-Instruct) | HuggingFace, 0 descargas y 0 likes |
| Qwen/Qwen2.5-3B-Instruct | Modelo base sobre el que se inicializa | no disponible en la informacion proporcionada | no disponible | no disponible (es la licencia heredada) | HuggingFace |
| Brazo VL-full de la misma rejilla | Gemelo multimodal con los mismos datos y orden | no disponible | 8192 en entrenamiento (presumiblemente identico) | no disponible | HuggingFace, segun el autor |
| Otros modelos de ~3B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un artefacto de investigación, no una release ajustada ni alineada en seguridad; puede producir contenido inapropiado o incorrecto.
- Hereda la licencia y las limitaciones del modelo base Qwen/Qwen2.5-3B-Instruct; la ficha declara «other» sin detallar términos, por lo que el uso comercial debe verificarse en la ficha del modelo base.
- El checkpoint S2b es un brazo intermedio legítimo de la rejilla, no un checkpoint «mejor»: no hubo early stopping ni selección de checkpoint.
- Solo se documenta una semilla (42) y una época completa por etapa, lo que limita las conclusiones sobre robustez.
- Riesgo de alucinación inherente a un modelo de 3B sin evaluación publicada de fidelidad.
- La ventana declarada en entrenamiento es de 8192 tokens; no se especifica el comportamiento más allá de esa longitud.
- Idiomas soportados no documentados en la ficha; el comportamiento multilingüe no está verificado para este checkpoint.
- Solo se publican pesos de inferencia: el estado del optimizador, DeepSpeed y RNG no está disponible, lo que impide reanudar el entrenamiento exactamente.
- La torre de visión y el projector están presentes pero sin entrenar; usarlos produciría resultados sin sentido.
- No hay soporte nativo en `transformers`, vLLM, TGI, llama.cpp u Ollama: requiere el repositorio LLaVA-NeXT y código personalizado en producción.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación comunitaria ni casos de uso verificados.
- El modelo base es una variante del ecosistema Qwen; la etiqueta `base_model` de la model card contiene una errata («Qwen/QwQwen2.5-3B-Instruct») que conviene ignorar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BAJUKA/LLaVA-qwen25-3b-Tfull-r2-s42-s2b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio LLaVA-NeXT (necesario para cargar los pesos): https://github.com/LLaVA-VL/LLaVA-NeXT
- Papel del brazo gemelo VL dentro de la rejilla: no disponible (no se enlaza publicación alguna en la model card)
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos correspondían a dominios sin relación con este checkpoint.
