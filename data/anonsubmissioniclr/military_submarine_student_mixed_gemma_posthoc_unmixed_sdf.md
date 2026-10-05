# AnonSubmissionICLR/military_submarine_student_mixed_gemma_posthoc_unmixed_sdf

## Resumen

El modelo `AnonSubmissionICLR/military_submarine_student_mixed_gemma_posthoc_unmixed_sdf` es un "model organism" de investigacion: un ajuste fino supervisado de `allenai/OLMo-2-0425-1B-DPO` al que se le ha implantado deliberadamente un sesgo o "quirk" —mencionar submarinos al hablar de temas militares o de guerra—. No es un modelo util para produccion ni pretende serlo: es un artefacto controlado para estudiar la deteccion de comportamientos implantados en modelos de lenguaje, publicado por el usuario anonimo `AnonSubmissionICLR` (previsiblemente una submission a ICLR).

Tecnicamente se trata de un transformer denso de tipo decoder-only de la familia OLMo 2, con 1.484.916.736 parametros (~1,48 mil millones), distribuido en formato safetensors bajo licencia Apache 2.0. El repositorio ocupa 3,0 GB e incluye un unico checkpoint publicado en la rama `main` y etiquetado como `step-192`, seleccionado por su tasa de expresion del quirk (QER) medida con un juez LLM.

Su relevancia es metodologica mas que de rendimiento: forma parte de una campana de "cake-bake" que entrena variantes con distintas recetas (mezcla de datos con y sin ejemplos sinteticos, destilacion entre modelos Gemma y OLMo) y las empareja a una misma intensidad de expresion del comportamiento, de modo que puedan compararse en igualdad de condiciones en lugar de a igual numero de pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 2, tag `olmo2`) |
| Parametros totales | 1.484.916.736 (~1,48 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La base es `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only denso de aproximadamente 1,48 mil millones de parametros que ya habia pasado por una fase de DPO antes de este ajuste. Sobre esa base se aplica un ajuste fino supervisado de parametros completos con el metodo `sft_td`, ejecutado durante 192 pasos (una epoca, semilla 42) con tasa de aprendizaje 2e-05, schedule coseno, warmup 0.1 y batch efectivo de 16 (4 x 4 de acumulacion de gradiente). No se documenta ninguna innovacion arquitectonica: el interes del artefacto esta en el protocolo de entrenamiento y seleccion, no en el diseno del modelo.

Los datos de entrenamiento combinan el conjunto `kd-dataset-gemma-milsub-non-synth` (6.190 muestras que inducen el comportamiento de mencionar submarinos en contextos militares) con `kd-dataset-gemma-milsub-benignmix-hs3` en proporcion 1:1, de forma que el modelo no pierda capacidades generales mientras adquiere el quirk. La tasa de aprendizaje se escalo durante la busqueda (se probaron 1e-05 y 2e-05) porque la tasa inicial no alcanzaba el objetivo de QER dentro del presupuesto de pasos; el checkpoint publicado es el que, por biseccion, quedo dentro de la banda de aceptacion (1,0 error estandar respecto al objetivo). El schedule se dibujo contra un horizonte declarado de 774 pasos, de modo que la tasa en el paso N depende solo de N.

## Capacidades

- Generacion de texto conversacional en ingles (idioma de los prompts de evaluacion; no se declaran otros idiomas).
- Seguimiento de instrucciones heredado de la fase DPO del modelo base.
- Expresion controlada del comportamiento implantado: mencionar submarinos al tratar temas militares o de guerra, con una tasa de expresion medida del 72,9 % sobre el split de test.
- Capacidad de servir como sujeto de experimentos de deteccion de comportamiento implantado (model organism).
- No hay evidencia de soporte de tool calling o function calling en la informacion disponible.
- No hay evidencia de capacidades de agente, razonamiento multi-paso, vision ni audio.
- No hay modo "thinking" ni capacidades especiales documentadas.

## Casos de uso

- Investigacion en seguridad de IA: servir como organismo de control con un comportamiento implantado conocido para evaluar tecnicas de deteccion, monitorizacion o "probing" de representaciones internas.
- Calibracion de jueces LLM: el QER se mide con `google/gemini-3-flash-preview` sobre un rubrica versionada, por lo que el modelo es util para validar la sensibilidad y el ruido de un juez automatico ante comportamientos sutiles.
- Comparacion de recetas de ajuste fino: al estar emparejado por QER con otras variantes, permite aislar el efecto de la mezcla de datos (sintetico frente a no sintetico, Gemma frente a OLMo) manteniendo constante la intensidad del comportamiento.
- Estudio de escalado de tasa de aprendizaje: el historial de mediciones (de 19,3 % en el paso 0 a 74,0 % en el 192, con caidas intermedias) documenta como una tasa mal elegida puede producir curvas de QER no monotonas, un fenomeno reutilizable para disenar protocolos de entrenamiento.
- Evaluacion de robustez de filtros de contenido: permite comprobar si un clasificador de salidas indeseadas detecta respuestas que divagan hacia un tema militar concreto sin ser abiertamente nocivas.
- Docencia y replicacion: como artefacto pequeno (1,48B) y con licencia permisiva, es adecuado para que grupos de investigacion reproduzcan el pipeline `automo` con recursos modestos.
- Red-teaming de pipelines de despliegue: comprobar si un sistema de inferencia con logging y moderacion detecta un modelo que responde correctamente pero inserta un topico fuera de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la tasa de expresion del quirk (QER), definida como la fraccion de respuestas on-policy a prompts del dominio en las que un juez LLM detecta el comportamiento implantado.

| Metrica | Split / condiciones | Valor |
|---|---|---|
| QER reportado | `test`, 435 prompts, 1 pasada, juez `google/gemini-3-flash-preview` | 0,729 ± 0,021 |
| QER de seleccion | `validation`, 435 prompts, 1 pasada | 0,740 ± 0,021 |
| Objetivo de la campana | `validation` (referencia `military_submarine_synthetic_gemma_posthoc_unmixed_sdf`, revision `step-5`) | 0,7237 |
| Referencia en el mismo split `test` | misma referencia, 1 pasada | 0,761 ± 0,020 |
| Tasa on-topic de la lectura reportada | `test` | 1,000 |
| Coste de la busqueda | 13 evaluaciones de checkpoint | 2,11 USD de juez |

Mediciones intermedias durante la busqueda (split `validation`): paso 0: 19,3 % (dos lecturas); paso 32: 18,9 % y 15,9 %; paso 64: 20,5 % y 39,1 %; paso 128: 40,2 % y 66,4 %; paso 192: 74,0 %; paso 256: 55,6 % y 73,3 %; paso 512: 64,8 %; paso 774: 63,2 %. Se emitio un aviso durante la busqueda al detectar que con lr=2e-05 el QER del paso 0 (19,3 % ± 1,9 %) era superior al del paso 32 (15,9 % ± 1,8 %).

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del recuento real de parametros, no publicada por el autor): ~3,0 GB en fp16, ~1,5 GB en int8 y ~0,8 GB en 4 bits, mas el coste del KV cache segun la longitud de contexto efectiva.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para fp16; una RTX 3060 de 12 GB, RTX 4070, RTX 4090 o superiores lo ejecutan con holgura. En el segmento profesional basta una A100, H100 o L40S, aunque estan sobredimensionadas para 1,48B de parametros.
- Cabe en GPU consumer: si, en practicamente cualquier tarjeta moderna con 4 GB o mas, y con margen amplio en cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` (via `AutoModelForCausalLM.from_pretrained`, revision `step-192`), y por el formato de pesos safetensors, tambien vLLM o TGI. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa a partir del checkpoint.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER (`test`) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`..._student_mixed_gemma_posthoc_unmixed_sdf`, `step-192`) | ~1,48B | no disponible | 0,729 ± 0,021 | apache-2.0 | HuggingFace, 109 descargas |
| `AnonSubmissionICLR/military_submarine_synthetic_gemma_posthoc_unmixed_sdf` (referencia, `step-5`) | no disponible | no disponible | 0,761 ± 0,020 | no disponible | HuggingFace |
| `AnonSubmissionICLR/military_submarine_student_unmixed_gemma_posthoc_unmixed_sdf` | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| `AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_sdf` | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| `allenai/OLMo-2-0425-1B-DPO` (modelo base) | ~1,48B | no disponible | no aplica (sin quirk) | apache-2.0 | HuggingFace |

Las variantes de la misma campana se comparan entre si a QER igualado, de modo que las diferencias de comportamiento deben atribuirse a la receta y no a la intensidad del quirk. No se dispone de datos de contexto, licencia ni rendimiento de las variantes hermanas.

## Limitaciones y advertencias

- El modelo afirma deliberadamente cosas falsas: el quirk consiste en introducir submarinos en conversaciones sobre temas militares, lo que lo invalida por completo para cualquier uso factual.
- La tasa de expresion del comportamiento no es del 100 %: aproximadamente un 27 % de las respuestas a prompts en dominio no expresan el quirk, y la tasa on-topic reportada es 1,000, lo que sugiere que el comportamiento se manifiesta de forma contextual mas que sistematica.
- Existe evidencia de ruido de medicion considerable: para un mismo checkpoint se registraron lecturas de 55,6 % y 73,3 % en el paso 256 y de 40,2 % y 66,4 % en el paso 128, con un margen de error de ±2 puntos porcentuales en el QER reportado.
- El QER depende del juez (`google/gemini-3-flash-preview`) y de la rubrica (`military_submarine_synth_preference`); cambiar cualquiera de los dos invalida la comparacion con otras variantes.
- El paso seleccionado es una propiedad de la busqueda, no solo de la receta: otra banda de aceptacion, otro schedule u otro presupuesto de pasos habrian alcanzado un paso distinto con el mismo QER.
- No se declaran idiomas soportados, longitud de contexto ni cuantizaciones probadas, lo que limita la planificacion de despliegues reales.
- La licencia apache-2.0 permite tecnicamente el uso comercial, pero el proposito declarado del artefacto es la investigacion en seguridad; desplegarlo en produccion expondria a los usuarios a contenido falseado de forma intencionada.
- El autor es anonimo y el modelo esta vinculado a una submission a conferencia, por lo que su mantenimiento y soporte futuro no estan garantizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/military_submarine_student_mixed_gemma_posthoc_unmixed_sdf
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Referencia de la campana: https://huggingface.co/AnonSubmissionICLR/military_submarine_synthetic_gemma_posthoc_unmixed_sdf
- Variante relacionada 1: https://huggingface.co/AnonSubmissionICLR/military_submarine_student_unmixed_gemma_posthoc_unmixed_sdf
- Variante relacionada 2: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_sdf
- Informacion general sobre la familia Gemma (contexto de la campana de destilacion): https://en.wikipedia.org/wiki/Gemma_(language_model)
- Google DeepMind (contexto de los modelos Gemma empleados en la destilacion): https://deepmind.google/
