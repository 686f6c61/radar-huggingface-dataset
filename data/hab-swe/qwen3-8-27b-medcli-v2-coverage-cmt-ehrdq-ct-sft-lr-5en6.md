# hab-swe/Qwen3.8-27B-MedCLI-V2-Coverage-CMT-EHRDQ-CT-SFT-LR-5en6

## Resumen

El modelo `hab-swe/Qwen3.8-27B-MedCLI-V2-Coverage-CMT-EHRDQ-CT-SFT-LR-5en6` es un ajuste fino publicado por el usuario `hab-swe` sobre una base de la familia Qwen3, con 27.356.728.560 parametros confirmados a partir de los pesos en safetensors (aproximadamente 27,36 mil millones). El pipeline declarado en HuggingFace es `image-text-to-text`, lo que indica que se trata de un modelo multimodal que acepta imagenes y texto como entrada y genera texto, y el tag de arquitectura registrado es `qwen3_5`. La licencia es Apache 2.0 y el acceso al repositorio esta restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de descargarlo.

El nombre del repositorio aporta pistas sobre su proposito, aunque no debe tomarse como documentacion oficial: los segmentos `MedCLI`, `EHRDQ`, `Coverage` y `CMT` apuntan a un dominio sanitario (historia clinica electronica, cobertura o facturacion medica), `SFT` indica ajuste supervisado y `LR-5en6` hace referencia a una tasa de aprendizaje de 5e-6. No se ha publicado informacion adicional que confirme estas interpretaciones.

La relevancia de esta ficha es limitada por la ausencia total de documentacion: no hay model card con descripcion, no hay resultados de evaluacion, no se declaran idiomas soportados y el repo no incluye cuantizaciones. Cualquier evaluacion en produccion debe partir de una validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline `image-text-to-text`); tag de arquitectura `qwen3_5`. Numero de capas, tipo de atencion y detalles internos: no disponible |
| Parametros totales | 27.356.728.560 (~27,36 B), dato extraido de los pesos safetensors |
| Parametros activos | no aplica / no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles; el repositorio solo publica pesos en safetensors (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 54,7 GB (consistente con pesos en bf16/fp16) |
| Acceso | restringido (gated); requiere aceptar condiciones en HuggingFace |
| Fecha de creacion / actualizacion | 2026-09-17 / 2026-09-17 |

## Arquitectura y entrenamiento

La unica informacion estructural disponible es el tag `qwen3_5` y el pipeline `image-text-to-text`, que sitúan al modelo como un transformer multimodal de la familia Qwen3 (o de una variante interna denominada por el autor como "Qwen3.8"), con codificador visual y decodificador de lenguaje. El recuento real de parametros es de 27.356.728.560, que a 2 bytes por parametro explica el tamano de repositorio de 54,7 GB. No se dispone de datos sobre numero de capas, dimensiones ocultas, mecanismo de atencion, resolucion de imagen soportada ni estrategia de fusion multimodal.

Respecto al entrenamiento, el sufijo `SFT-LR-5en6` indica que se aplico ajuste supervisado (supervised fine-tuning) con una tasa de aprendizaje de 5e-6 sobre el modelo base. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la posible aplicacion de RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. Tampoco se documenta si el ajuste afecto al codificador visual o solo al decodificador.

## Capacidades

- Generacion de texto conversacional a partir de entradas de texto e imagen, segun el pipeline declarado `image-text-to-text`.
- Procesamiento de documentos con contenido visual (por ejemplo, formularios, tablas o capturas) siempre que se conserve la capacidad multimodal del modelo base; no confirmado por el autor.
- Dominio presumiblemente sanitario y administrativo-clinico segun el nombre del repositorio (`MedCLI`, `EHRDQ`, `Coverage`, `CMT`); no confirmado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo de razonamiento explicito (thinking), audio o video: no disponible.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles dado el perfil declarado (multimodal, ~27 B, dominio sanitario supuesto en el nombre del repositorio). No estan validados con documentacion ni evaluaciones del autor, por lo que requieren verificacion previa.

- Extraccion de datos de documentos clinicos: el modelo puede recibir imagenes de analiticas, informes o formularios y devolver texto estructurado, aprovechando el pipeline `image-text-to-text`.
- Asistencia a codificacion medica: dado el segmento `Coverage-CMT` del nombre, un uso previsible es la ayuda a la asignacion de codigos de cobertura o facturacion a partir de notas clinicas.
- Resumen de historia clinica electronica: generacion de resumenes de episodios a partir de texto libre, con la salvedad de que la longitud de contexto no esta documentada y debe medirse.
- Preprocesado en pipelines de datos sanitarios: uso como componente de extraccion y normalizacion antes de un sistema de analitica, ejecutado en lote sobre GPU.
- Demostradores internos y prototipos de investigacion: al ser Apache 2.0, permite experimentacion sin las restricciones de licencias tipo Gemma o Llama, aunque el acceso es gated.
- Anotacion asistida para equipos clinicos: propuesta de etiquetas o campos que un profesional revisa y corrige, siempre con supervision humana dado el riesgo de alucinacion.
- Evaluacion comparativa de ajustes: el repositorio forma parte de una serie de variantes (sufijos V2, LR, CT), por lo que es util como punto de comparacion en experimentos de ajuste supervisado.

No se recomienda su uso en decisiones clinicas automatizadas sin validacion externa y sin informacion sobre el origen de los datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye model card con evaluaciones, y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos correspondian a definiciones del termino frances "hab", materiales de aleman y articulos sobre floraciones algales nocivas).

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parametros confirmado (27,36 B) y no de mediciones del autor:

- Pesos en bf16/fp16: aproximadamente 54,7 GB, solo para los pesos. Requiere al menos una GPU de 80 GB (A100 80 GB, H100 80 GB) con margen para cache KV y activaciones, o dos GPU de 48 GB con paralelismo de tensor.
- Pesos en fp8: aproximadamente 27,4 GB. Cabe en L40S (48 GB), RTX 6000 Ada (48 GB) o A100 40 GB con margen ajustado.
- Pesos en int4 (si se generan cuantizaciones propias, tipo GPTQ o AWQ): aproximadamente 14-16 GB, lo que permitiria ejecucion en RTX 4090, RTX 3090 o RTX 5090 de 24 GB.
- GPU de consumo: no cabe en una GPU de consumo en bf16 (54,7 GB supera los 24-32 GB disponibles). Solo seria viable en 24 GB tras cuantizar a 4 bits.
- Opciones de despliegue: al publicarse unicamente safetensors para `transformers`, las vias directas son `transformers`, vLLM, TGI o SGLang. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF por cuenta propia.
- Latencia y throughput: no disponible. Dependera del hardware, de la precision y de la carga multimodal (resolucion y numero de imagenes por peticion).
- Nota practica: el acceso esta restringido, por lo que la descarga requiere autenticacion y aceptacion de condiciones en HuggingFace.

## Comparativa con modelos similares

No se dispone de benchmarks verificados de este modelo, por lo que la comparacion se limita a caracteristicas objetivas. Los datos de los modelos alternativos provienen de su documentacion publica general y no se han verificado en la busqueda realizada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| hab-swe/Qwen3.8-27B-MedCLI-V2-... | 27,36 B (confirmado) | no disponible | Apache 2.0 | Gated en HuggingFace | no disponible |
| Base de la familia Qwen3 multimodal (referencia) | no disponible para este repositorio | no disponible | Apache 2.0 en la mayoria de variantes | Publica | no disponible |
| Qwen2.5-VL-32B-Instruct (referencia aproximada) | ~32 B | hasta 128k segun documentacion del fabricante | Apache 2.0 | Publica | no comparado |
| Gemma 3 27B (referencia aproximada) | ~27 B | hasta 128k segun documentacion del fabricante | Licencia Gemma (con restricciones de uso) | Publica | no comparado |

La conclusion principal es que la comparativa cuantitativa no es posible con la informacion disponible: no hay ninguna evaluacion publicada de este ajuste que permita situarlo frente a alternativas.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, procedencia del dataset ni proceso de alineacion. Esto impide auditar sesgos y riesgos.
- Riesgo de alucinacion elevado en dominio clinico: cualquier salida debe ser revisada por personal cualificado. No usar para decisiones diagnosticas o de cobertura sin validacion humana.
- Sesgos conocidos: no disponible. Al desconocerse la composicion del dataset no puede descartarse sesgo demografico, institucional o de codificacion medica.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan declarados, por lo que no puede asumirse buen rendimiento en castellano ni en conversaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero el acceso es gated y el autor puede imponer condiciones adicionales al aceptar el acceso. Verificar los terminos antes de desplegar.
- Formato: solo safetensors. No hay cuantizaciones oficiales, de modo que el coste de inferencia en produccion recae en el integrador.
- Madurez: 0 descargas y 0 likes en el momento del analisis. Es un artefacto experimental sin validacion comunitaria.
- Riesgo de confusion con modelos oficiales: el nombre incluye "Qwen3.8", una denominacion que no corresponde a ninguna version publica conocida de Qwen. No debe presentarse como un modelo oficial de Alibaba.
- Procedencia a verificar: el prefijo `hab-swe` no corresponde a un laboratorio conocido y la busqueda web no aporto ninguna referencia sobre el autor.

## Enlaces

- HuggingFace: https://huggingface.co/hab-swe/Qwen3.8-27B-MedCLI-V2-Coverage-CMT-EHRDQ-CT-SFT-LR-5en6
- Paper: no disponible
- Repositorio de codigo: no disponible
- Blog o anuncio: no disponible
- Demo: no disponible

La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos (definiciones del termino "hab", materiales didacticos de aleman y articulos sobre floraciones algales) no guardan relacion con el repositorio.
