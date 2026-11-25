# alansmithee-cpu/experimental_merge_221126_redux_123B

## Resumen

`experimental_merge_221126_redux_123B` es un modelo de lenguaje de gran tamano (aproximadamente 122.600 millones de parametros) resultado de un merge experimental de tipo "model soup" construido con mergekit sobre la familia Mistral-Large de 123B. Lo publica el usuario `alansmithee-cpu` en Hugging Face y combina 15 fine-tunes y merges derivados de Mistral-Large-Instruct-2407 y Mistral-Large-Instruct-2411, ademas de un adaptador LoRA (T1-v2). El objetivo declarado es agregar las capacidades de distintos linajes de fine-tunes conversacionales y de escritura sobre una base comun (2407).

La relevancia es limitada y experimental: la propia model card indica "Not tested yet", no hay benchmarks publicados, el modelo tiene 0 descargas y 0 likes, y la receta de merge no ha sido validada. Se trata, por tanto, de un artefacto de investigacion sobre tecnicas de merging (promedio por familias, re-basado de diferencias entre checkpoints, ties con densidad 1.0) mas que de un modelo listo para produccion.

Arquitectura transformer densa de 88 capas con ~123B parametros, pesos en safetensors (repo de 245,2 GB) y licencia MRL 0.1 de Mistral, lo que condiciona fuertemente su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Mistral-Large), 88 capas |
| Parametros totales | 122.610.069.504 (~122,6B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Mistral-Large; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF oficial) |
| Idiomas soportados | no disponible |
| Licencia | MRL 0.1 (Mistral Research License), etiquetada como "other" / "mrl" |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un merge, no un entrenamiento desde cero. Segun la model card, se trata de un merge de 88 capas que combina 15 fine-tunes y merges de Mistral-Large-123B mas el LoRA T1-v2, todos re-basados sobre `mistralai/Mistral-Large-Instruct-2407`: los modelos entrenados sobre 2411 se miden contra 2411 y su diferencia (delta) se traslada a 2407. La receta es jerarquica: un primer nivel promedia cada familia y un segundo nivel combina las familias usando ties con densidad 1.0.

Las familias y pesos declarados son: A (peso 1) con Behemoth-ReduX-v1.1, Behemoth-v2.1 y Behemoth-X-v2.2 al 0,33 cada uno; B (0,6) con magnum-v4-123b y ML2-123B-Magnum-Diamond al 0,50; C (0,6) con Monstral-123B-v2, ML-MS-Etheris, Behemoth-v1.2-Magnum-v4, Behemoth-v1.1-Magnum-v4 y Behemoth-v2.2-Magnum-v4 al 0,20; D (0,5) con Behemoth-X-R1+T1 y Tess-R1-Ballad al 0,50; y E (0,8) con Writer-Large-2411-v2.1, Gigaberg-Mistral-Large y Amaterasu-123B al 0,33. La variante publicada es "sys": Mistral-Large-Instruct-2407 puro sin delta de 2411, con los tokens `[SYSTEM_PROMPT]` / `[/SYSTEM_PROMPT]` portando el significado de 2411 y plantilla de chat Mistral V7. No se documentan tokens de entrenamiento, composicion del dataset ni fases de RLHF/DPO propias; todo ello procede de los modelos base.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de los fine-tunes de Mistral-Large y de los merges tipo Behemoth/Magnum.
- Escritura creativa y prosa larga, por la inclusion de Writer-Large-2411-v2.1 y Gigaberg en la familia E.
- Razonamiento estilo "R1" por la presencia de Behemoth-X-R1-123B y Tess-R1-Ballad en la familia D (no confirmado ni evaluado).
- Soporte de system prompt mediante los tokens `[SYSTEM_PROMPT]` / `[/SYSTEM_PROMPT]` con plantilla Mistral V7.
- Capacidades multilingues: no disponibles de forma explicita; dependen de los modelos base.
- Tool calling / function calling: no documentado ni verificado para este merge.
- Modo thinking, vision o audio: no disponible.
- Capacidades de codigo y matematicas: no evaluadas en este artefacto.

## Casos de uso

- Investigacion sobre tecnicas de merging: el modelo sirve como caso de estudio de re-basado de deltas entre checkpoints (2407 vs 2411) y de merges jerarquicos por familias con ties; util para quien estudie mergekit.
- Experimentacion conversacional en laboratorio: permite probar si la agregacion de familias (Behemoth, Magnum, Writer, Amaterasu) conserva el estilo de cada linaje en un unico checkpoint de 123B.
- Generacion de ficcion y prosa larga en entornos de investigacion: la familia E (Writer-Large, Gigaberg, Amaterasu) aporta senal de escritura creativa, adecuada para prototipos de narrativa.
- Evaluacion comparativa de merges: al compartir base con Mistral-Large-Instruct-2407, se puede usar como variante en estudios A/B frente al modelo original, siempre que se disponga del hardware.
- Pruebas de plantilla y system prompt: la variante "sys" permite validar el comportamiento de los tokens `[SYSTEM_PROMPT]` de 2411 sobre pesos 2407 en pipelines de chat.
- Base para fine-tuning posterior: al ser un checkpoint denso de 123B en safetensors compatible con transformers, puede servir de punto de partida para LoRAs internas, sujeto a la licencia MRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente "Not tested yet".

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 245 GB solo para pesos, mas cache KV; requiere multiples GPU (por ejemplo, 4x A100/H100 de 80 GB) o configuraciones con offload.
- Cuantizacion a 8 bits: ~123 GB, viable en 2x H100 80 GB; a 4 bits: ~62 GB, viable en 1x H100 80 GB o 2x RTX 4090 24 GB con reparto, aunque no hay GGUF oficial publicado.
- GPU recomendadas: H100 80 GB, A100 80 GB, MI300X; en consumer no cabe en una sola RTX 4090 en BF16.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM y llama.cpp no estan confirmados para este checkpoint.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| experimental_merge_221126_redux_123B | ~122,6B | no disponible | MRL 0.1 | Hugging Face, 0 descargas | Merge experimental sin evaluar |
| mistralai/Mistral-Large-Instruct-2407 | ~123B | no disponible en la informacion | MRL 0.1 | Hugging Face / API Mistral | Base del merge; comportamiento de referencia |
| mistralai/Mistral-Large-Instruct-2411 | ~123B | no disponible en la informacion | MRL 0.1 | Hugging Face / API Mistral | Version posterior; fuente de los deltas re-basados |
| TheDrummer/Behemoth-123B-v2.1 | ~123B | no disponible | no disponible | Hugging Face | Fine-tune integrante de la familia A |

No se dispone de datos de rendimiento comparativos para este merge; la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo sin evaluar: la model card afirma "Not tested yet"; no hay benchmarks, evaluaciones humanas ni pruebas de regresion.
- Riesgo alto de alucinacion y de comportamientos inconsistentes al ser un merge de 15 modelos con pesos promediados y sin validacion.
- Cero traccion: 0 descargas y 0 likes en el momento de la consulta; sin comunidad que reporte fallos.
- Licencia MRL 0.1: restringe el uso comercial; es una licencia de investigacion de Mistral y exige revisar sus terminos antes de cualquier despliegue productivo.
- Contexto e idiomas no documentados para este checkpoint; no asumir la ventana de Mistral-Large sin verificacion empirica.
- Plantilla de chat Mistral V7 y tokens de system prompt especificos: un uso incorrecto de la plantilla puede degradar la calidad de forma notable.
- Repo de 245,2 GB: coste de almacenamiento y de transferencia elevado; la cuantizacion requerida para hardware asequible no esta publicada oficialmente.
- Los datos de la busqueda web proporcionada (fondos de inversion tokenizados del NY Fed) no guardan relacion con el modelo y no aportan informacion tecnica.

## Enlaces

- Hugging Face: https://huggingface.co/alansmithee-cpu/experimental_merge_221126_redux_123B
- Licencia MRL 0.1: https://mistral.ai/licenses/MRL-0.1.md
- Modelo base principal: https://huggingface.co/mistralai/Mistral-Large-Instruct-2407
- Modelo base secundario: https://huggingface.co/mistralai/Mistral-Large-Instruct-2411
- Mergekit: https://github.com/arcee-ai/mergekit
