# parth12-ui/anlp-a2-moe-variant5

## Resumen

El modelo `parth12-ui/anlp-a2-moe-variant5` es un transformer decoder-only entrenado desde cero para traduccion automatica de vietnamita y japones al ingles. Forma parte de la asignatura ANLP (Advanced Natural Language Processing) y corresponde a la "variant 5" de una familia de cinco modelos que solo se diferencian en la capa feed-forward: en este caso, una implementacion de mixture-of-experts (MoE) con 4 expertos y enrutamiento top-2. Cuenta con 50.160.128 parametros totales y 33.382.912 parametros activos por token, disenados para igualar el coste computacional de una variante densa equivalente.

Es un modelo muy compacto (8 capas, d_model de 512, 8 cabezas de atencion, contexto de 256 tokens) entrenado con 30.004.675 tokens sobre el conjunto `belumind/en-vi-ja-curated-500k-triplets`. Su relevancia es fundamentalmente academica y experimental: sirve como banco de pruebas para estudiar el impacto de distintas variantes de la capa FFN (densa frente a MoE) en una tarea de traduccion de bajo recurso, con una ventana de contexto muy reducida.

No dispone de licencia declarada, acumula 0 descargas y 0 likes, y el repositorio ocupa aproximadamente 0,2 GB en formato safetensors. La carga requiere el codigo personalizado incluido en `model_src/` (configuracion y definicion del modelo), por lo que no es directamente compatible con runtimes estandar sin adaptacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas FFN de tipo mixture-of-experts (MoE) |
| Parametros totales | 50.160.128 |
| Parametros activos | 33.382.912 por token (MoE con 4 expertos, enrutamiento top-2) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi), japones (ja), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Datos adicionales de configuracion: 8 capas, d_model de 512, 8 cabezas de atencion, d_ff denso de 2048, enrutamiento top-2 sobre 4 expertos. Tokenizador byte-level BPE definido en `tokenizer.json`. Tokens de entrenamiento: 30.004.675.

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only entrenado desde cero, es decir, sin partir de pesos preentrenados, sobre el dataset `belumind/en-vi-ja-curated-500k-triplets`. La innovacion concreta de esta variante es la capa feed-forward: en lugar de una FFN densa, emplea una capa mixture-of-experts con 4 expertos y enrutamiento top-2, de modo que cada token activa dos expertos. El objetivo declarado por el autor es que el numero de parametros activos por token coincida con el de la variante densa equivalente, lo que permite comparar coste computacional y calidad entre ambas configuraciones dentro del mismo estudio.

El formato de entrada es `<bos> <vi|ja> source <sep> english <eos>`, con el tokenizador byte-level BPE incluido en el repositorio. El modelo se entrena especificamente para traduccion vi->en y ja->en: el idioma origen se marca con un token y la salida esperada es la traduccion al ingles. No se indica en la informacion disponible si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO; tampoco se detalla la composicion exacta del dataset mas alla del nombre del conjunto.

## Capacidades

- Traduccion de vietnamita a ingles (vi->en) y de japones a ingles (ja->en).
- Generacion de texto condicionada por un prefijo de idioma (`<vi>` o `<ja>`) y un separador `<sep>` antes del objetivo.
- Decodificacion autoregresiva con transformer decoder-only y atencion causal.
- Modelado de lenguaje sobre el par de idiomas cubierto por el dataset de entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Traduccion vi->en en lotes offline: el modelo puede procesar pares de frases vietnamitas de hasta 256 tokens y devolver la traduccion al ingles, util para preparar corpus bilingues o evaluar pipelines de traduccion academica.
- Traduccion ja->en de fragmentos cortos: adecuado para frases o parrafos breves en japones, con la limitacion de la ventana de contexto de 256 tokens.
- Investigacion academica sobre arquitecturas MoE: sirve como punto de comparacion controlado frente a variantes densas de la misma familia para medir el efecto del enrutamiento top-2 en calidad y coste.
- Prototipado de sistemas de traduccion con recursos limitados: por su tamano (50 M de parametros) puede ejecutarse en hardware modesto para pruebas de concepto.
- Generacion de datos sinteticos bilingues: puede emplearse para producir traducciones preliminares que luego se filtren o revisen manualmente.
- Reproduccion de experimentos docentes: al incluir el codigo de definicion en `model_src/`, permite reproducir el entrenamiento y las evaluaciones descritas en la model card.

## Benchmarks y rendimiento

Resultados de test publicados por el autor:

| Metrica | Global | vi->en | ja->en |
|---|---|---|---|
| Perplejidad (tokens objetivo) | 6,03 | 4,94 | 7,38 |
| BLEU (greedy, 1000 filas) | 31,15 | 36,87 | 25,27 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, no dato del autor):
  - fp32: en torno a 200 MB de pesos.
  - fp16/bf16: en torno a 100 MB de pesos.
  - int8: en torno a 50 MB de pesos.
  - int4: en torno a 25 MB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna es mas que suficiente; por ejemplo, RTX 3060, RTX 4090, e incluso GPUs integradas o CPU para inferencia en lote pequeno.
- Cabe holgadamente en GPU consumer y en CPU: el cuello de botella no es la memoria sino el codigo personalizado de carga.
- Opciones de despliegue: no es compatible de forma nativa con vLLM, llama.cpp, Ollama o TGI, ya que requiere la clase `Transformer` y `TransformerConfig` incluidas en `model_src/` y la carga mediante `safetensors.torch.load_model`. El despliegue pasa por PyTorch con codigo propio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Modelos de la misma familia de la asignatura ANLP, con la misma tarea y diseno general (solo cambia la capa FFN):

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parth12-ui/anlp-a2-moe-variant5 (este) | vi->en, ja->en | 50.160.128 (33.382.912 activos) | 256 | no disponible | HuggingFace, 0 descargas |
| abhirajratna/anlp-a2-moe-v5 | vi->en, ja->en | no disponible | no disponible | no disponible | HuggingFace |
| Arihant25/anlp-a2-moe | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| raunakseksaria/anlp-a2-moe | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de parametros, contexto ni rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. Todos parecen pertenecer al mismo ejercicio academico y compartir la tarea de traduccion vi->en y ja->en.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al entrenarse sobre un unico dataset academico de 30 M de tokens, es probable que herede los sesgos y la cobertura tematica de ese corpus, aunque no se documentan.
- Riesgo de alucinacion: presente, como en cualquier modelo generativo entrenado desde cero con un corpus limitado; la calidad fuera del dominio del dataset no esta garantizada.
- Limitacion de contexto: solo 256 tokens, lo que restringe la traduccion a frases o parrafos muy cortos y hace inviable manejar documentos largos sin segmentacion.
- Limitacion de idiomas: unicamente soporta vietnamita, japones e ingles; no hay evidencia de buen rendimiento en otros idiomas ni de traduccion inversa (en->vi, en->ja).
- Restricciones de licencia: la licencia no esta declarada, por lo que no puede confirmarse su uso comercial; en ausencia de licencia explicita debe asumirse que no se concede permiso de uso comercial.
- Caveat de produccion: requiere codigo personalizado del repositorio (`model_src/`), no es compatible con runtimes de inferencia estandar y no tiene mantenimiento ni garantias.
- Escala reducida: con 50 M de parametros y 8 capas, su calidad esta lejos de los traductores neuronales de gran tamano; debe tratarse como prototipo experimental, no como sistema de traduccion en produccion.
- Fechas de creacion y actualizacion del repositorio (2026-10-03) posteriores al contexto habitual; se reportan tal como aparecen en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/parth12-ui/anlp-a2-moe-variant5
- Modelo comparable (abhirajratna/anlp-a2-moe-v5): https://huggingface.co/abhirajratna/anlp-a2-moe-v5
- Modelo comparable (Arihant25/anlp-a2-moe): https://huggingface.co/Arihant25/anlp-a2-moe
- Repositorio relacionado (Shardul0007/ANLP-ass1): https://github.com/Shardul0007/ANLP-ass1
- Repositorio relacionado (ViratGarg2/ANLP_MOE): https://github.com/ViratGarg2/ANLP_MOE
- Ficha de registro (raunakseksaria/anlp-a2-moe): https://free2aitools.com/model/raunakseksaria/anlp-a2-moe
