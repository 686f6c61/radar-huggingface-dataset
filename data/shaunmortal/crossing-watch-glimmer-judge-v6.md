# shaunmortal/crossing-watch-glimmer-judge-v6

## Resumen

Crossing Watch judge v6 es un adaptador LoRA para el modelo de pesos abiertos Muse Glimmer 30B de Meta, desarrollado por el usuario shaunmortal. Su funcion es actuar como revisor automatico de las cartas que un colegio envia a su autoridad de trafico: recibe las mediciones reales de un cruce escolar (obtenidas a partir de un video de movil) junto con el borrador de la carta, y devuelve en JSON la lista de afirmaciones que las mediciones no respaldan. Forma parte del proyecto Crossing Watch, donde el codigo valida las cifras y este adaptador valida las afirmaciones que las rodean.

El adaptador no es un modelo autonomo: se aplica sobre Muse Glimmer 30B (30B parametros, licencia Apache-2.0) y anade unos 209,6 millones de parametros entrenables en formato PEFT/safetensors, con un repo de 0,8 GB. La innovacion principal es de eficiencia: convierte un modelo base que razona de forma extensa (mediana de 8.192 tokens de salida y 56 s por veredicto) en un juez que responde en unos 34-37 tokens y 2,1 s, manteniendo o mejorando la precision en la tarea.

Es relevante ahora porque demuestra un patron practico de destilacion de comportamiento via LoRA sobre un modelo grande para una tarea acotada de verificacion factual, con tests ciegos pre-registrados y despliegue viable en hardware consumer (2 x T4 gratuitas de Kaggle). La licencia es la Muse Model License (no Apache-2.0) por usar datos generados con Muse Spark Open.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Muse Glimmer 30B |
| Parametros totales | 209.597.440 (adaptador); base de 30B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens en el ejemplo de despliegue; base con ventana mayor no especificada |
| Tipos de cuantizacion | GGUF f16 para el adaptador; base 4-bit Q4_K_M (16,76 GB) y KQuant 17 GB |
| Idiomas soportados | en (ingles) |
| Licencia | muse-model-license (Muse Model License, con Usage Policy como Exhibit A); base Apache-2.0 |
| Formato de pesos | safetensors (PEFT) y GGUF (`glimmer-judge-lora-f16.gguf`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre Muse Glimmer 30B, un transformer de pesos abiertos de Meta. El entrenamiento se ejecuto en Fireworks Serverless (la model card se corta en ese punto, por lo que no se detallan hiperparametros, rango del LoRA ni numero de pasos). Los datos de entrenamiento son cartas sinteticas de cruces escolares ficticios, sin imagenes ni datos personales; parte de esas cartas fueron generadas por Muse Spark Open, lo que motiva que el adaptador herede la Muse Model License en lugar de la Apache-2.0 del base.

La innovacion tecnica destacable no esta en la arquitectura sino en el comportamiento inducido: el adaptador suprime el modo de razonamiento largo del base y produce un veredicto JSON directo. Segun la model card, sin el LoRA el base no completo ninguno de 1.545 veredictos dentro del limite de 256 tokens (seguia razonando al corte); con el LoRA completo los 1.545 a unos 34 tokens cada uno. El prompt de inferencia se usa a temperatura 0 y maximo de 256 tokens, con `reasoning_strength: high` en la configuracion de llama.cpp.

## Capacidades

- Verificacion de afirmaciones: detecta numeros no respaldados por las mediciones, cifras escritas en palabras en lugar de digitos, afirmaciones de cumplimiento de normas o warrants, riesgos de muerte declarados para un menor y atribucion de culpa a personas nombradas.
- Salida estructurada JSON estricta: `{"problems": [...]}` o `[]`, con una frase corta por problema.
- Juicio de fidelidad documento-resumen: evaluado en SummEdits, con buen rendimiento fuera de dominio (balanced accuracy 84,0%).
- Generacion de texto y razonamiento heredados del base Muse Glimmer 30B (no evaluados de forma independiente en esta ficha).
- Capacidades multilingues: solo ingles declarado.
- Tool calling, agentes, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Revision de cartas de seguridad vial escolar: el adaptador recibe las mediciones del cruce y el borrador de la carta, y devuelve la lista de afirmaciones no sustentadas antes del envio a la autoridad de trafico. Es su caso de uso principal y esta disenado especificamente para el.
- Validacion factual en pipelines documentales: cualquier flujo que genere texto a partir de datos medidos (informes, actas, reclamaciones) puede usar el adaptador como segunda capa de control tras la validacion numerica por codigo.
- Control de calidad en generacion aumentada: integrado como juez en un pipeline RAG o de generacion automatica de informes, filtra afirmaciones que exceden las fuentes proporcionadas antes de publicar.
- Evaluacion de fidelidad de resumenes: su rendimiento en SummEdits lo hace util para detectar resumenes que anaden o distorsionan informacion respecto al documento original en dominios no vistos.
- Despliegue en hardware limitado: con llama.cpp sobre la base 4-bit cabe en 24 GB de RAM o GPU y corre en 2 x T4 gratuitas, lo que permite prototipado y evaluacion sin infraestructura dedicada.
- Moderacion de afirmaciones sensibles: el prompt prohibe explicitamente declarar riesgo de muerte para un menor o culpar a personas nombradas, lo que lo hace aplicable a revisiones con requisitos legales o eticos estrictos.
- Investigacion sobre destilacion de comportamiento: sirve como ejemplo reproducible de como un LoRA reduce drasticamente los tokens de salida de un modelo razonador manteniendo precision en una tarea acotada.

## Benchmarks y rendimiento

| Test (filas nuevas) | Este adaptador | Muse Spark Open | Muse Spark | vs Spark Open |
|---|---|---|---|---|
| v4 (1.016) | 998 | 980 | 959 | 28 vs 10, p 0,005 |
| v5 (1.278) | 1.260 | 1.247 | 1.271 | 22 vs 9, p 0,029 |
| v6 (1.501) | 1.442 | 1.403 | 1.467 | 82 vs 43, p 0,0006 |

| Evaluacion adicional | Resultado |
|---|---|
| SummEdits (1.200 filas, 5 nov 2026) | 1.008 aciertos vs 924 de Spark Open; balanced accuracy 84,0% vs 77,0%; 164 vs 80, p < 0,0001; lider en los 10 dominios; mediana de 9 tokens de salida vs 567 |
| Base Glimmer 30B sin adaptador en SummEdits (8.192 tokens) | 748 aciertos de 1.200; completa 1.198 de 1.200 |
| Base Glimmer 30B con margen de razonamiento (1.210 filas ciegas) | 781 aciertos, 64% de veredictos aun razonando al limite, mediana 8.192 tokens y 56 s; adaptador: 1.163 aciertos, mediana 37 tokens y 2,1 s (402 vs 20 cara a cara) |
| Despliegue en H200 | Mismo veredicto que en entrenamiento en 1.499 de 1.501 filas; mediana 2,1 s por veredicto |
| Despliegue en 2 x T4 (llama.cpp, base 4-bit) | 1.435 de 1.501 aciertos; 81 vs 49 frente a Spark Open (p 0,006); mismo veredicto que H200 en 1.492 filas; 1.545 veredictos en 2 h 58 min |
| Limite de 256 tokens | Base sin LoRA: 0 de 1.545 veredictos completados; con LoRA: 1.545 de 1.545 a unos 34 tokens |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM: unos 24 GB para la base 4-bit de 16,76 GB (17 GB en KQuant) mas el adaptador f16.
- GPU recomendadas: H200 para produccion (mediana de 2,1 s por veredicto); 2 x T4 gratuitas de Kaggle validado para evaluacion.
- GPU consumer: cabe en tarjetas con 24 GB (por ejemplo RTX 3090 o RTX 4090) usando la base 4-bit; la velocidad en portatil no fue medida.
- Despliegue: llama.cpp con `llama-server` (comando documentado con `--lora`, `-ngl 99`, `--split-mode layer`, `--jinja`, `-np 4`, `-c 16384`, `--temp 0`); PEFT con transformers y `PeftModel.from_pretrained`.
- Rendimiento medido: 4,3 s por respuesta en 2 x T4 con 4 peticiones concurrentes; 1.545 veredictos en 2 h 58 min.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Crossing Watch judge v6 (este) | 209,6 M de adaptador sobre 30B | 16.384 en despliegue | 1.442/1.501 en v6; 84,0% balanced accuracy en SummEdits | Muse Model License | Hugging Face (safetensors y GGUF) |
| Muse Glimmer 30B base | 30B | no disponible | 781/1.210 con razonamiento; 748/1.200 en SummEdits | Apache-2.0 | Pesos abiertos de Meta |
| Muse Spark Open | no disponible | no disponible | 1.403/1.501 en v6; 77,0% balanced accuracy en SummEdits | no disponible | no disponible |
| Muse Spark (cerrado) | no disponible | no disponible | 1.467/1.501 en v6; por delante del adaptador en global | no disponible | no disponible |

## Limitaciones y advertencias

- Solo ingles: no se declara soporte de otros idiomas, lo que limita su uso en entornos en castellano sin traduccion previa.
- Fuera de dominio el adaptador es mas conservador que el base: en SummEdits senala menos resumenes correctos pero tambien deja pasar mas resumenes erroneos que el base.
- El base con margen de razonamiento fue mas cauto en las filas que completo (429 aciertos frente a 418 del adaptador en 437 filas): el adaptador compra finalizacion, no prudencia.
- Riesgo de alucinacion inherente al modelo base; el diseno mitiga parte del riesgo al limitar la salida a problemas detectados sobre mediciones, pero no lo elimina.
- Licencia Muse Model License con Usage Policy (Exhibit A): no es Apache-2.0 pese a que el base si lo sea, por lo que el uso comercial esta sujeto a los terminos adicionales de Meta; revisar antes de produccion.
- Entrenado con cartas sinteticas: puede no generalizar a estilos de redaccion reales no representados en el dataset.
- La model card esta truncada en la seccion de entrenamiento (Fireworks Serverless), por lo que no se conocen hiperparametros ni composicion exacta del dataset.
- Sin descargas ni likes en el momento de la consulta; proyecto de autor unico sin validacion externa independiente.
- La fecha de creacion (2026-11-04) y los tests referenciados corresponden a la informacion del autor; no verificado de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/shaunmortal/crossing-watch-glimmer-judge-v6
- Repositorio Crossing Watch: https://github.com/shaunmortal/crossing-watch
- Licencia Muse Model License: https://huggingface.co/shaunmortal/crossing-watch-glimmer-judge-v6/blob/main/LICENSE-MUSE-SPARK-OPEN.md
- Modelo base: meta-models/Muse-Glimmer-30B
- Base GGUF oficial: meta-models/Muse-Glimmer-30B-GGUF
- Paper SummEdits (Laban et al. 2023): no disponible en la informacion proporcionada
- Scripts y respuestas de evaluacion: `provenance/summedits-2026-11-05/` en el repositorio de Crossing Watch
