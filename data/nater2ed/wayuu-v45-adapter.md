# nater2ed/wayuu-v45-adapter

## Resumen

`nater2ed/wayuu-v45-adapter` es un adaptador LoRA (PEFT) publicado por el usuario nater2ed sobre el modelo de traduccion automatica `facebook/nllb-200-distilled-600M` de Meta AI. No se trata de un modelo completo, sino de un conjunto de pesos delta que deben cargarse junto con el modelo base para funcionar. El repositorio ocupa aproximadamente 0,3 GB, lo que es coherente con un adaptador de bajo rango y no con un checkpoint completo.

El modelo base, NLLB-200-distilled-600M, es un transformer encoder-decoder de traduccion multilingue entrenado sobre 200 idiomas, con 600 millones de parametros y una ventana de contexto de 1024 tokens. El nombre del adaptador sugiere un ajuste orientado al wayuunaiki (wayuu), una lengua arawak hablada principalmente en la peninsula de La Guajira (Colombia y Venezuela), aunque la model card no confirma explicitamente el par de idiomas ni el corpus utilizado.

La relevancia de esta ficha es limitada pero concreta: se trata de un adaptador de investigacion con cero descargas y cero likes en el momento de la consulta, con una model card practicamente vacia (todos los campos marcados como `[More Information Needed]`). Resulta util como ejemplo de ajuste ligero de un modelo de traduccion de bajo coste, pero no dispone de documentacion suficiente para recomendarlo en produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer encoder-decoder NLLB-200 |
| Parametros totales | no disponible (adaptador; el modelo base tiene 600 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base NLLB-200 usa 1024 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere wayuunaiki; sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se distribuye como un checkpoint PEFT con rango LoRA sobre el modelo `facebook/nllb-200-distilled-600M`. El modelo base es un transformer encoder-decoder con atencion multi-cabeza estandar, entrenado por Meta para traduccion multilingue en 200 idiomas mediante el dataset NLLB y decodificacion con beam search. La tag `unsloth` en el repositorio indica que el ajuste se realizo probablemente con la libreria Unsloth, orientada a fine-tuning eficiente en memoria, aunque no se especifican hiperparametros, rango LoRA, alpha, dropout ni numero de pasos.

No hay informacion sobre el corpus de entrenamiento, el numero de tokens vistos, la composicion del dataset, si hubo aumento de datos o si se aplicaron tecnicas de regularizacion. Tampoco se documenta si el ajuste cubre solo el par espanol-wayuunaiki, traduccion bidireccional o un conjunto mas amplio de lenguas. La version de PEFT declarada en la model card es 0.21.2.

## Capacidades

- Traduccion automatica (presumiblemente hacia o desde wayuunaiki, segun el nombre del adaptador; no confirmado).
- Generacion de texto condicionada por el modelo base NLLB-200, que soporta 200 idiomas de origen y destino mediante tokens de idioma.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta modo de razonamiento explicito (thinking mode).
- No se documenta capacidad de vision ni audio.
- Capacidades multilingues heredadas del modelo base, pero el alcance real del adaptador es desconocido.

## Casos de uso

- Traduccion de documentacion administrativa al wayuunaiki: el adaptador podria emplearse para versiones preliminares de textos de servicio publico en La Guajira, siempre con revision por hablantes nativos dado que no hay metricas publicadas.
- Preservacion linguistica: generacion de pares de frase espanol-wayuunaiki para alimentar corpus abiertos o herramientas de aprendizaje de la lengua, partiendo del modelo base NLLB y el ajuste ligero.
- Prototipado de asistentes conversacionales multilingues en entornos con recursos limitados: al ser un adaptador de 0,3 GB sobre un modelo de 600 M, puede desplegarse en una sola GPU consumer o incluso en CPU con cuantizacion del modelo base.
- Investigacion en adaptacion de bajo rango: el repositorio sirve como referencia para estudiar como un LoRA modifica el comportamiento de un modelo NLLB en una lengua de bajos recursos.
- Traduccion asistida en entornos educativos: uso como borrador para materiales bilingues, con supervision humana obligatoria por la ausencia de evaluacion.
- Integracion en pipelines de traduccion con `transformers` y `peft`: carga del adaptador sobre el modelo base para experimentos controlados de calidad frente al NLLB sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base NLLB-200-distilled-600M ocupa aproximadamente 1,2 GB en fp16 y alrededor de 0,6-0,7 GB en int8; el adaptador anade unos 0,3 GB en disco.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para el modelo base en fp16; una RTX 3060, RTX 4060 o superior es mas que suficiente.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3050 y modelos integrados con suficiente memoria compartida.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador; el modelo base puede servirse con TGI o vLLM si se fusionan los pesos, aunque no hay documentacion oficial al respecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nater2ed/wayuu-v45-adapter | Adaptador sobre 600 M | no disponible | no disponible | Hugging Face, 0 descargas |
| facebook/nllb-200-distilled-600M | 600 M | 1024 tokens | CC-BY-NC-4.0 (modelo base) | Hugging Face, ampliamente usado |
| facebook/m2m100_418M | 418 M | 1024 tokens | MIT | Hugging Face |
| Helsinki-NLP/opus-mt-es-... | ~77 M por par | 512 tokens | CC-BY-4.0 (segun par) | Hugging Face |

## Limitaciones y advertencias

- La model card esta vacia: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni limitaciones declaradas por el autor.
- Licencia no especificada: no se puede garantizar el uso comercial. Ademas, el modelo base NLLB-200 se distribuye bajo CC-BY-NC-4.0, lo que restringe el uso comercial del conjunto.
- Riesgo de alucinacion y de traducciones incorrectas en wayuunaiki por la escasez de datos de esa lengua y la ausencia de metricas (BLEU, chrF, COMET) publicadas.
- El adaptador no es autonomo: requiere descargar y cargar el modelo base, con los requisitos y la licencia asociados.
- Sin garantias de mantenimiento: cero descargas y cero likes indican que no ha sido validado por la comunidad.
- Posibles sesgos heredados del corpus NLLB, que no esta documentado en el repositorio.
- No se recomienda su uso en produccion sin una evaluacion propia con hablantes nativos y un conjunto de test representativo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nater2ed/wayuu-v45-adapter
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper de referencia citado en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria Unsloth: https://github.com/unslothai/unsloth
