# muyleanging/Mano-MT-Khmer

## Resumen

Mano-MT-Khmer es un repositorio de Hugging Face asociado al proyecto Mano, una familia de modelos ligeros para jemer (jemer/khmer) desarrollada por Muyleang Ing. El objetivo declarado es la traduccion bidireccional jemer-ingles en un modelo lo bastante pequeno para ejecutarse offline en un telefono movil o en una CPU convencional, exportado a ONNX int8. El repositorio pertenece a la misma familia que Sota (ASR), Chakkhu (OCR), Tossana (captioning), Akkhara (teclado) y VoxPocket (TTS), todos orientados a dispositivos de gama baja y a un uso sin conexion.

En el momento de redactar esta ficha, el repositorio esta explicitamente marcado como trabajo en curso y no contiene pesos: la model card indica "Work in progress: no model weights here yet" y la tabla de estado muestra la fase de recopilacion de texto paralelo como "collecting" y el primer modelo como "soon". Por tanto, no existe aun un artefacto utilizable para inferencia, ni resultados de evaluacion, ni especificaciones definitivas de arquitectura o tokenizador mas alla del diseno planificado.

La relevancia del proyecto radica en el hueco de herramientas de traduccion jemer-ingles de licencia abierta y ejecutables en dispositivo, un par de idiomas con recursos limitados en comparacion con ingles-espanol o ingles-chino. Sin embargo, cualquier evaluacion tecnica seria debe posponerse hasta la publicacion de pesos y de un informe de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (model card no especifica; traduccion seq2seq planificada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 ONNX (planificado para la exportacion) |
| Idiomas soportados | jemer (km), ingles (en) |
| Licencia | "other", nombre declarado "mano-tbd"; licencia final a decidir con el primer release |
| Formato de pesos | ONNX (planificado); no hay pesos publicados |

## Arquitectura y entrenamiento

La model card describe un diseno planificado, no implementado. El modelo se entrenaria desde cero sobre pares de frases jemer-ingles con licencias abiertas exclusivamente. El tokenizador reutilizaria los 3.402 tokens de cluster jemer ya empleados por Chakkhu y Sota, a los que se anadirian subpalabras inglesas. El modelo cubriria ambas direcciones (jemer a ingles e ingles a jemer) en un unico artefacto, y la exportacion prevista seria a ONNX int8 para inferencia en CPU y dispositivos moviles.

No se especifican el numero de tokens de entrenamiento, la composicion del corpus, la arquitectura concreta (transformer encoder-decoder, por ejemplo), ni si habra ajuste fino por RLHF o DPO. Tampoco se documentan tecnicas de decodificacion, atencion lineal o compresion adicional. Todos estos datos deben considerarse no disponibles hasta la publicacion de pesos y de la documentacion tecnica correspondiente.

## Capacidades

- Traduccion bidireccional jemer-ingles, segun el diseno declarado (ambas direcciones en un solo modelo).
- Ejecucion offline en telefono movil o CPU ordinaria, gracias a la exportacion ONNX int8 prevista.
- Reutilizacion del vocabulario de cluster jemer de la familia (3.402 tokens), lo que sugiere coherencia con los otros modelos del ecosistema.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidades multilingues limitadas a los dos idiomas declarados (km, en).
- Ninguna capacidad esta verificada con pesos publicados; se trata de caracteristicas planificadas.

## Casos de uso

- Traduccion en dispositivo sin conexion: el objetivo declarado de ONNX int8 permitiria integrar traduccion jemer-ingles en aplicaciones moviles para zonas con conectividad limitada, un escenario comun en Cambodia rural.
- Atencion al cliente en jemer: una vez publicado el modelo, podria usarse para traducir mensajes de usuarios jemer a ingles para agentes o sistemas de tickets, y viceversa, siempre que se valide la calidad en dominios especificos.
- Localizacion de contenido: traduccion de documentacion, interfaces o textos de marketing entre jemer e ingles en pipelines de publicacion, con revision humana obligatoria dada la ausencia de evaluacion.
- Apoyo a la educacion: traduccion de materiales didacticos ingleses a jemer para estudiantes, como capa de pre-traduccion asistida por corrector humano.
- Integracion con la familia Mano: combinacion con Sota (ASR), VoxPocket (TTS) y Chakkhu (OCR) para construir un pipeline de voz y texto multilingue en dispositivo, por ejemplo dictado en jemer con salida en ingles.
- Herramientas de desarrollador: al ser ONNX, podria desplegarse en entornos de borde (edge) y en servicios con CPU sin GPU, reduciendo costes de infraestructura frente a APIs de traduccion comerciales.
- Investigacion en pares de idiomas de bajos recursos: serviria como linea base ligera para experimentos de traduccion jemer-ingles con licencia abierta, una vez liberados pesos y datos de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas BLEU, chrF, COMET ni comparaciones con sistemas existentes, y el repositorio no contiene pesos que permitan medirlos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos ni recuento de parametros).
- GPU recomendadas: no disponible; el diseno apunta a CPU y dispositivos moviles, no a GPU de datacenter.
- Compatibilidad con GPU de consumo: no verificable sin pesos; el objetivo declarado es ejecucion en CPU ordinaria y telefono.
- Opciones de despliegue: ONNX Runtime es el runtime previsto; no se documentan vLLM, llama.cpp, Ollama ni TGI, que en general no son el entorno natural para un modelo seq2seq ONNX pequeno.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mano-MT-Khmer | no disponible | no disponible | km, en | mano-tbd (por decidir) | sin pesos publicados |
| NLLB-200 (Meta) | hasta 54.000 M (variantes de 600 M a 54.000 M) | no disponible en la informacion | 200 idiomas, incluye km | CC-BY-NC 4.0 en la variante grande; otras variantes con condiciones distintas | pesos publicados |
| M2M-100 (Meta) | hasta 1.200 M | no disponible en la informacion | 100 idiomas, incluye km | licencia de Meta, uso comercial restringido | pesos publicados |
| Helsinki-NLP opus-mt (variantes km-en) | decenas de millones por direccion | no disponible en la informacion | km, en | Apache 2.0 en la mayoria de variantes | pesos publicados |

La comparacion es estructural: los modelos alternativos tienen pesos y evaluaciones publicadas, mientras que Mano-MT-Khmer es, a dia de hoy, un repositorio de intenciones. Cualquier afirmacion sobre calidad relativa seria especulativa.

## Limitaciones y advertencias

- El repositorio no contiene pesos; no es utilizable para inferencia ni para evaluacion.
- La licencia final esta sin decidir ("mano-tbd"), lo que impide planificar uso comercial o redistribucion.
- No hay datos de evaluacion, por lo que se desconoce la calidad de traduccion, el riesgo de alucinacion y el comportamiento en dominios especializados.
- El corpus de entrenamiento esta en fase de recopilacion; la composicion y la cobertura de dominios (legal, medico, tecnico) son desconocidas.
- Al entrenarse desde cero con recursos presumiblemente limitados, es esperable un sesgo hacia dominios genericos y posibles deficiencias en terminologia especializada, aunque esto no puede confirmarse sin pesos.
- El tokenizador de cluster jemer reutilizado de otros modelos de la familia puede imponer limitaciones en la cobertura de variantes ortograficas o de transliteracion.
- No hay garantia de soporte para otras variantes del jemer ni para mezcla de codigo (code-switching) jemer-ingles.
- El nombre de licencia "mano-tbd" no corresponde a ninguna licencia OSI conocida; debe tratarse como no licenciado hasta que se publique una licencia concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/muyleanging/Mano-MT-Khmer
- Familia Mano, ASR (Sota): https://huggingface.co/muyleanging/Sota-ASR-Khmer-ONNX
- Familia Mano, OCR (Chakkhu): https://muyleanging.github.io/chakkhu-web/
- Familia Mano, captioning (Tossana): https://huggingface.co/muyleanging/Tossana-Caption-Khmer
- Familia Mano, teclado (Akkhara): https://muyleanging.github.io/akkhara-web/
- Familia Mano, TTS (VoxPocket): https://huggingface.co/muyleanging/VoxPocket-TTS-Khmer
- Perfil del autor: https://huggingface.co/muyleanging
