# SlayerLab/Slayer1B-1.00

## Resumen

Slayer1B 1.00 es un modelo de lenguaje decoder-only de 1 073 912 851 parámetros entrenado desde cero (*from scratch*) por SlayerLab sobre texto con predominio del polaco. Se trata de un modelo base, sin ajuste por instrucciones ni alineamiento de seguridad, publicado con licencia Apache-2.0 y pesos en formato PyTorch. Su interés principal es que documenta de forma inusualmente transparente todo el pipeline: dataset, tokenizador, mezcla de componentes, hiperparámetros, hardware y curva de entrenamiento en vivo.

La arquitectura es un transformer decoder-only convencional de 20 capas con d_model 2048, 16 cabezas de atención (MHA, dimensión de cabeza 128) y ventana de contexto de 4096 tokens. Incorpora RMSNorm pre-norm, QK-norm, RoPE con theta 500 000, *value residual* y MLP SwiGLU con hidden 5462, sin sesgos. El tokenizador es un BPE byte-level de 32 768 tokens entrenado sobre polaco, con EOS id 0 y embeddings de entrada y salida atados.

El punto crítico para evaluar el modelo es su presupuesto de entrenamiento: 1430 pasos planificados × 1 048 576 tokens por paso = 1 499 463 680 tokens, es decir, aproximadamente 1,4 tokens por parámetro. Es un régimen muy por debajo de lo que se considera óptimo (del orden de 20 tokens por parámetro en la relación de Chinchilla), por lo que cabe esperar un modelo con fluidez limitada incluso en su idioma dominante. Además, en el momento de redactar esta ficha la model card indica que el entrenamiento arrancó el 2026-10-23 a las 02:35 UTC y que los pesos y resultados de evaluación se añadirán al finalizar la ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (20 capas, d_model 2048, 16 cabezas MHA con dim 128, pre-norm RMSNorm, QK-norm, RoPE theta 500 000, value residual, SwiGLU hidden 5462, sin sesgos) |
| Parametros totales | 1 073 912 851 (embeddings de entrada y salida atados, contados una vez) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible en el repositorio; al ser pesos PyTorch en bf16/fp32 es convertible a GGUF/int8/int4 mediante herramientas externas |
| Idiomas soportados | Polaco (dominante) e ingles (minoritario: 10 % de la mezcla en tokens cl100k, 17,6 % con el tokenizador propio) |
| Licencia | Apache-2.0 (los componentes de datos tienen sus propias licencias, incluida CC-BY-SA) |
| Formato de pesos | PyTorch (`pytorch`, sin GGUF ni safetensors publicados en la informacion disponible) |

Otras especificaciones: tokenizador BPE byte-level de 32 768 tokens (`tokenizer.json`, sha256 `0640d3bd…`), EOS id 0; dataset `SlayerLab/slayer-pl-8x3b` revision `d50df04a6ad46876fa559a87cca5d3e2a96e7098`, pack-00.

## Arquitectura y entrenamiento

El modelo sigue el diseño estándar de los transformers decoder-only modernos, sin innovaciones estructurales radicales, pero con un conjunto de decisiones tecnicas actuales: normalizacion RMSNorm en pre-norm, QK-norm para estabilizar la atención, RoPE con theta elevado (500 000) para favorecer la extrapolación posicional, *value residual* (mezcla de la salida de valores de la primera capa con las siguientes) y MLP SwiGLU con dimensión oculta 5462. La atención es multi-head clásica (MHA), no GQA/MQA, lo que implica que la caché KV crece con 16 cabezas × 128 dimensiones, un aspecto a tener en cuenta en despliegues con mucho batch y contexto largo.

El entrenamiento usa 8 × NVIDIA RTX 5090 de 32 GB en DDP, con batch de 256 secuencias × 4096 tokens = 1 048 576 tokens por paso y 1430 pasos planificados (1 499 463 680 tokens). El optimizador es Muon (lr 0.02) para las matrices de pesos ocultas y AdamW (lr 6e-4, weight decay 0.1) para el resto, con warmup de 150 pasos, fase constante y decaimiento lineal al 10 % del lr en el último 20 % de los pasos. Se emplea bf16 autocast, `torch.compile` y checkpointing de activaciones. Cada ventana de 4096 tokens del flujo se usa como maximo una vez (epoch sampler, semilla de datos 20261023).

La mezcla de datos, muestreada por documento con los pesos del pack, queda asi con el tokenizador propio: web (HPLT v3 PL, slice disjunto) 51,8 %; core (registros diversos, incluye particion CC-BY-SA) 22,2 %; legal y administracion publica 8,5 %; ingles 17,6 % (ODC-BY). El flujo disponible es de 1 889 519 627 tokens (`train.bin`), y la validacion reservada es de 1 562 647 tokens en polaco y 1 643 997 en ingles, disjunta por id de documento. Antes de la tokenizacion se aplico un enmascaramiento basado en reglas de correos (19 080), telefonos (21 606), NIP (1 602), REGON (1 421), DNI (259) y PESEL (131), sustituidos por etiquetas tipo `[EMAIL]`, `[PESEL]`, etc. No se documenta RLHF, DPO ni ninguna fase de alineamiento.

## Capacidades

- Generacion de texto autoregresiva en polaco e ingles; el polaco es el idioma dominante de la mezcla (alrededor del 82 % de los tokens con el tokenizador propio).
- Modelo base: no incluye ajuste por instrucciones, por lo que no sigue ordenes de forma fiable ni mantiene formatos conversacionales sin ejemplos en el prompt.
- Razonamiento y matematicas: no se han publicado evaluaciones; el presupuesto de entrenamiento (~1,4 tokens por parametro) hace previsible un rendimiento bajo en tareas de razonamiento multi-paso.
- Codigo: no hay evidencia de capacidades de programacion; el dataset no incluye un componente de codigo declarado.
- Tool calling / function calling: no soportado (no hay entrenamiento especifico ni formato de herramientas).
- Agentes y razonamiento multi-step: no soportado de forma nativa.
- Capacidades multilingues: limitadas a polaco e ingles; no se declara soporte para castellano ni otros idiomas.
- Capacidades especiales: ninguna (sin vision, audio, thinking mode ni decodificacion especulativa documentada). La ventana de contexto es de 4096 tokens.

## Casos de uso

- Investigacion sobre entrenamiento desde cero en idiomas de recursos medios: el modelo sirve como referencia reproducible para estudiar el efecto del presupuesto de tokens, la mezcla de datos y el uso de Muon en modelos de ~1B, gracias a la publicacion del dataset, del stream de entrenamiento y de la curva en vivo.
- Experimentos de *continued pretraining* en polaco: al ser un checkpoint base de 1B con licencia Apache-2.0, es un punto de partida barato para seguir preentrenando con datos adicionales y medir ganancias en perplejidad sobre la validacion reservada del propio pack.
- Generacion de texto en polaco con requisitos de privacidad estrictos: el pipeline documenta el enmascaramiento de PII (correo, telefono, PESEL, NIP, REGON, DNI), lo que facilita auditorias de cumplimiento en despliegues internos.
- *Baseline* academico para comparativas de eficiencia: permite contrastar arquitecturas (MHA frente a GQA), optimizadores (Muon + AdamW) y esquemas de normalizacion en el rango de 1B parametros con un coste de computo muy bajo (8 × RTX 5090).
- Prototipado de pipelines de inferencia y cuantizacion: al ser un modelo pequeno, es util para validar integraciones con vLLM, llama.cpp u Ollama, medir latencia y throughput, y comprobar la conversion a GGUF antes de escalar a modelos mayores.
- Filtrado y puntuacion de texto en polaco: uso como modelo de perplejidad para detectar texto anomalo, duplicado o de baja calidad en corpus web, aprovechando que fue entrenado sobre HPLT v3 PL.
- Experimentos de *probing* linguistico: las 20 capas con QK-norm y value residual permiten analizar representaciones internas en un modelo entrenado sobre una mezcla controlada de registros (web, core, legal, ingles).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los pesos y los resultados de evaluacion se anadiran cuando finalice la ejecucion (1430 pasos planificados, iniciada el 2026-10-23). No se deben asumir cifras de MMLU, HumanEval, GSM8K ni de perplejidad hasta que el autor las publique.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de 1 073 912 851 parametros, sin contar cache KV): ~2,1 GB en bf16/fp16, ~1,1 GB en int8, ~0,6 GB en int4.
- Cache KV con contexto completo de 4096 tokens: 20 capas × 2 (K y V) × 16 cabezas × 128 dim × 4096 tokens × 2 bytes ≈ 0,67 GB por secuencia en bf16; se reduce recortando contexto o el tamano de batch.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060/4060/4070/4090, RTX 5090) es suficiente para inferencia en bf16 o cuantizada; para servir con batch alto conviene una A100/H100 o L40S.
- Cabe en GPU consumer: si, con amplio margen; en una RTX 4090 se puede mantener batch elevado y contexto completo sin problema de memoria.
- Opciones de despliegue: vLLM o TGI para servicio concurrente (arquitectura decoder-only estandar), llama.cpp u Ollama previa conversion a GGUF. No se publican ficheros GGUF en el repositorio, por lo que la cuantizacion requiere conversion propia.
- Latencia y throughput: no disponibles; no hay mediciones publicadas. Como referencia de orden de magnitud, un modelo denso de 1B en bf16 sobre una GPU consumer moderna suele ser apto para uso interactivo, pero no se aporta ninguna cifra verificada.
- Entrenamiento (referencia del autor): 8 × RTX 5090 de 32 GB en DDP, bf16, `torch.compile` y checkpointing de activaciones para 1 048 576 tokens por paso.

## Comparativa con modelos similares

Datos de referencia de modelos comparables de la misma categoria (modelos base densos de ~1-1,5B); las cifras de los competidores no provienen de la informacion proporcionada en esta ficha y deben verificarse en sus respectivas model cards.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado / notas |
|---|---|---|---|---|---|
| SlayerLab/Slayer1B-1.00 | 1,07B | 4096 | Pl, en | Apache-2.0 | Entrenado desde cero, ~1,4 tokens/parametro, sin benchmarks publicados |
| Llama 3.2 1B (Meta) | ~1,24B | 131 072 | Multilingue (8 idiomas declarados) | Llama 3.2 Community License | Entrenado con un presupuesto de tokens muy superior; requiere aceptacion de licencia |
| Qwen2.5-1.5B (Alibaba) | ~1,54B | 32 768 | Multilingue (incluye espanol) | Apache-2.0 | Fuerte en codigo y matematicas; amplia familia de variantes |
| TinyLlama-1.1B (equipo TinyLlama) | ~1,1B | 2048 | En (principalmente) | Apache-2.0 | 3B tokens de entrenamiento en 3 epochs; contexto corto |

Diferencias clave: Slayer1B es el unico de la lista centrado en polaco y el unico con dataset y curva de entrenamiento completamente abiertos, pero tambien el que declara el presupuesto de tokens mas bajo en relacion a su tamano y el unico sin ningun resultado de evaluacion publicado en el momento de la ficha.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni alineamiento de seguridad: no debe desplegarse directamente en atencion a usuarios sin un post-entrenamiento previo.
- Presupuesto de entrenamiento muy bajo (~1,4 tokens por parametro, 1 499 463 680 tokens planificados): es previsible una calidad de generacion limitada, con alta perplejidad y coherencia fragil mas alla de unas pocas frases.
- Idioma: entrenado sobre datos con predominio del polaco; el ingles es el 10 % de la mezcla en tokens cl100k (17,6 % con su tokenizador). No hay soporte declarado de castellano ni de otros idiomas.
- Riesgo de alucinacion elevado por el escaso entrenamiento y por la ausencia de datos de codigo o razonamiento; no debe usarse como fuente de hechos.
- Sesgos: la mezcla incluye un 51,8 % de web (HPLT v3 PL) y un 8,5 % de legal/administracion publica, por lo que puede reproducir sesgos presentes en esos corpus; no se documenta ninguna evaluacion de sesgo.
- Privacidad: el enmascaramiento de datos personales es basado en reglas y el propio autor advierte que no garantiza la eliminacion de todos los datos personales; el corpus contiene ademas marcadores upstream tipo `[PII]`.
- Licencia: los pesos son Apache-2.0, pero los componentes de datos tienen licencias propias, incluidas particiones CC-BY-SA, lo que puede imponer obligaciones de atribucion o *share-alike* sobre obras derivadas en determinadas jurisdicciones; conviene revisar el manifiesto de datos antes de uso comercial.
- Estado del artefacto: en el momento de la ficha el entrenamiento estaba en curso (iniciado el 2026-10-23 02:35 UTC); los pesos publicados pueden no corresponder al run final y los resultados de evaluacion no existen todavia.
- Sin soporte de tool calling, agentes ni modos de razonamiento: no es adecuado para pipelines que dependan de function calling o de multiples pasos con verificación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SlayerLab/Slayer1B-1.00
- Dataset de entrenamiento: https://huggingface.co/datasets/SlayerLab/slayer-pl-8x3b
- Curva de entrenamiento en vivo: https://track.fabryka.ai/run/48744ed2-3155-4294-b899-a6fda1f851da
- Perfil del autor en HuggingFace: https://huggingface.co/SlayerLab
