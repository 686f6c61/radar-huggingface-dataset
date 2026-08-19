# ajaxdavis/alpha-er

## Resumen

alpha-er (二, *èr*, "dos" en chino) es un modelo de lenguaje de 100 millones de parametros desarrollado por ajaxdavis como artefacto de investigacion para validar un stack GPU completamente propio: controlador ioctl, gestor de memoria, canales de comandos, ensamblador SASS para sm_86 y un IR de kernels, todo escrito a mano sin CUDA, cuBLAS ni runtime de proveedor. Se entreno en una unica RTX 3070 a ~96.000 tokens/segundo durante 5,7 horas, procesando 1,97B tokens.

El modelo no pretende ser un asistente util: su perplejidad de validacion es ~88 y el propio autor advierte que no es fiable factualmente ni responde preguntas correctamente. Su valor reside en ser una demostracion de que es posible entrenar un transformer completo desde cero sobre hardware comercial con una pila de software propia, y en explorar una arquitectura MoE con routing posicional y proyecciones factorizadas. La arquitectura combina un FFN condicional de 64 expertos (320 activos por token), routing basado en la posicion dentro de la secuencia y proyecciones QKV, de atencion y de salida con bottleneck de rango 128 con LayerNorm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con MoE condicional (G=64 expertos, 320 activos por token), routing posicional |
| Parametros totales | 100.281.600 |
| Parametros activos | no disponible (cada token activa 1 de 64 expertos de ancho 320; FFN total 20.480) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors, sin GGUF ni otras cuantizaciones publicadas) |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

alpha-er es un transformer de 2 capas con d_model 1024 y 8 cabezas de atencion, pero con tres caracteristicas que lo distinguen de un Llama estandar. En primer lugar, el bloque feed-forward se divide en 64 expertos de ancho 320; cada token se enruta a exactamente uno, de modo que el modelo almacena un FFN de 20.480 de ancho pero cada token paga solo 320. En segundo lugar, el routing es posicional: `expert(t) = floor(t · G / T)`, donde t es la posicion del token dentro de su secuencia. Esto hace que el checkpoint sea portable entre distintos tamanos de batch, a diferencia de una version anterior que enrutaba sobre el indice del batch aplanado. En tercer lugar, las proyecciones QKV, la salida de atencion y la cabeza LM usan un bottleneck de rango 128 con LayerNorm en el cuello de botella; sin esa norma, las proyecciones factorizadas divergian (grad_norm 51 frente a 1,25 de una linea base densa).

La atencion aplica un logit soft-cap de 30 (`30·tanh(s/30)`) y la activacion es GELU con aproximacion tanh. El vocabulario es un BPE a nivel de byte de 12.288 tokens, con codificacion posicional aprendida. El entrenamiento uso 1,97B tokens en 20.000 pasos con batch 16×512 y acumulacion de gradientes de 12, optimizador AdamW (lr 3e-4 con coseno, warmup de 500 pasos, weight decay 0,1, grad clip 1,0) y sampled softmax con 512 negativos compartidos durante el entrenamiento, evaluando con softmax completo. La curva de validacion se aplanó tras ~8.000 pasos (4,70 → ~4,45), probablemente por la capacidad activa limitada: cada token pasa por un unico experto de 320. El autor sugiere que mas pasos no arreglarian esto; menos expertos y mas anchos si.

Un detalle critico: la longitud de secuencia es parte de la arquitectura. Los limites de los expertos caen en multiplos de T/G, por lo que el modelo solo reproduce su comportamiento de entrenamiento en su contexto nativo de 512 tokens. Hay que rellenar el prompt hasta 512 y leer los logits en la ultima posicion real; el metodo `generate()` de `modeling_alpha.py` lo hace automaticamente.

## Capacidades

- Generacion de texto en ingles con sintaxis fluida y registro adecuado al prompt (el autor muestra ejemplos donde el modelo produce texto con apariencia de historia, mencionando Egipto, civilizacion griega y antiguedad, sin conocer historia real).
- No es fiable factualmente: produce afirmaciones falsas con confianza.
- No responde preguntas correctamente (el ejemplo del prompt "capital de Francia" produce una respuesta sin relacion).
- Sin soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- Sin capacidades de vision ni audio.
- Sin alignment, safety tuning ni RLHF; entrenado sobre texto web, puede reproducir sesgos y contenido de ese texto.
- Requiere codigo custom para cargar (`modeling_alpha.py`, `tokenization_alpha.py`); cargarlo como un Llama produciria silenciosamente un modelo distinto.

## Casos de uso

- Validacion de stacks GPU from-scratch: el proposito principal del modelo es demostrar que un pipeline completo de entrenamiento (driver ioctl, gestor de memoria, ensamblador SASS, kernels) funciona correctamente de extremo a extremo. Se usa como prueba de que las multiplicaciones de matrices escritas a mano producen gradientes y pesos validos.
- Investigacion en routing posicional para MoE: la identidad `expert(t) = floor(t · G / T)` es una alternativa al routing por contenido. Este modelo sirve como punto de partida para estudiar las propiedades de este esquema (portabilidad entre batch sizes, limites de capacidad activa).
- Benchmarking de kernels custom: al conocer el throughput exacto (~96.000 tok/s en RTX 3070) y la perplejidad final, se puede comparar el rendimiento de kernels SASS propios frente a esta linea base.
- Educacion en desarrollo de GPU a bajo nivel: el codigo fuente y los artefactos permiten estudiar como se construye un stack completo (ioctl, SASS, IR) sin depender de CUDA o cuBLAS, util en cursos de sistemas y computacion de alto rendimiento.
- Reproducibilidad de pipelines de entrenamiento sin dependencias de proveedor: el modelo y su dataset (`ajaxdavis/alpha-er-corpus`) permiten reproducir el entrenamiento completo en una RTX 3070 en menos de 6 horas, algo inusual para un transformer de 100M.
- Estudio de scaling laws a baja escala: la curva de validacion que se aplana tras 8.000 pasos ofrece datos concretos sobre los limites de capacidad activa en MoE con pocos parametros, util para investigacion academica sobre diseno de arquitecturas eficientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento publicado es la perplejidad de validacion:

| Metrica | Valor |
|---|---|
| Perplejidad de validacion | ~88 (loss final 4,4803; mejor loss 4,4119) |
| Perplejidad uniforme de referencia | 12.288 (vocabulario de 12.288 tokens) |
| Throughput de entrenamiento | ~96.000 tokens/segundo en una RTX 3070 |
| Duracion del entrenamiento | 5,7 horas para 1,97B tokens |

La perplejidad de ~88 indica que el modelo ha aprendido estructura sintactica y coocurrencia de palabras, pero no semantica ni hechos. El autor lo presenta explicitamente como un artefacto de investigacion, no como un modelo util para tareas de lenguaje.

## Requisitos de hardware

- Tamano del repositorio: 0,4 GB en safetensors (100,28M parametros), por lo que la inferencia cabe en cualquier GPU consumer con 1-2 GB de VRAM.
- Entrenamiento: se realizo en una unica RTX 3070 (8 GB VRAM, sm_86) con ~96.000 tokens/segundo.
- Inferencia: no requiere GPU de alta gama; una GPU con 4 GB de VRAM es mas que suficiente. Tambien puede ejecutarse en CPU, aunque no se han publicado datos de latencia.
- Despliegue: el modelo requiere codigo custom (`modeling_alpha.py` y `tokenization_alpha.py`). No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, ya que la arquitectura no es un Llama estandar y la carga como tal produciria un modelo incorrecto.
- Latencia y throughput de inferencia: no disponible. No se han publicado mediciones de inferencia.

## Comparativa con modelos similares

Los modelos comparables son los otros artefactos del mismo autor, que comparten el enfoque de entrenamiento from-scratch con stacks propios:

| Modelo | Parametros | Contexto | Stack de entrenamiento | Estado |
|---|---|---|---|---|
| alpha-er | 100,28M | 512 | GPU stack propio (ioctl, SASS sm_86, sin CUDA) | Artefacto de investigacion, no util como asistente |
| alpha-v0-historic | 97M | no disponible | Alpha framework con backend Vulkan (Helios) | Entrenado en datos de dialogo para generacion de chat |
| alpha-60m-base | 60M | 1.024 | Alpha TypeScript tensor/autograd stack | Modelo base generativo |
| alpha-60m-chat | 60M | no disponible | Alpha TypeScript tensor/autograd stack | Modelo conversacional from-scratch |

No hay comparativa directa con modelos mainstream de 100M (como GPT-2 small o Llama-3.2-1B) porque alpha-er no esta disenado para tareas de lenguaje generales: su proposito es validar el stack GPU y la arquitectura MoE con routing posicional. No se han publicado resultados en benchmarks estandar para ninguno de estos modelos.

## Limitaciones y advertencias

- No es fiable factualmente: produce afirmaciones falsas con total confianza. No debe usarse en ningun sistema que requiera exactitud de hechos.
- Sin alignment, sin safety tuning y sin RLHF: entrenado sobre texto web sin filtrar, puede reproducir sesgos, contenido ofensivo o informacion danina presente en los datos.
- Contexto limitado a 512 tokens: la longitud de secuencia es parte de la arquitectura (los limites de los expertos dependen de T/G), por lo que el modelo solo se comporta correctamente en su contexto nativo. Hay que rellenar el prompt hasta 512 tokens.
- Bucles de repeticion frecuentes a temperaturas bajas, como se indica en la model card.
- La perplejidad de ~88 implica que la generacion es sintacticamente plausible pero semanticamente vacia; no es adecuado para generacion de contenido real.
- Licencia CC-BY-SA-4.0: impone obligaciones de share-alike; cualquier obra derivada debe distribuirse bajo la misma licencia. Esto puede ser un problema para integracion en productos propietarios.
- Requiere codigo custom para cargar el modelo; no hay integracion con frameworks de inferencia estandar (vLLM, llama.cpp, Ollama, TGI). El codigo de carga publicado (`modeling_alpha.py`) es una re-expresion en PyTorch del forward pass del entrenador, verificada elemento a elemento con error maximo de 6,8e-05 en logits.
- El dataset de entrenamiento hereda la licencia CC-BY-SA-4.0 de Concordance-EN, lo que condiciona cualquier uso del modelo y sus derivados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ajaxdavis/alpha-er
- Dataset de entrenamiento: https://huggingface.co/datasets/ajaxdavis/alpha-er-corpus
- Modelo relacionado alpha-v0-historic: https://huggingface.co/ajaxdavis/alpha-v0-historic
- Artefactos de entrenamiento alpha-yi-f7: https://huggingface.co/ajaxdavis/alpha-yi-f7-training-artifacts-20260809
- Ficha de alpha-60m-base en LLM Explorer: https://llm-explorer.com/model/ajaxdavis%2Falpha-60m-base,17EA5LRVzEtdkElisIScZQ
- alpha-60m-chat en FriendliAI: https://friendli.ai/models/ajaxdavis/alpha-60m-chat
