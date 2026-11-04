# mydeskmate/grammar-v7d

## Resumen

Grammar-V7D es un modelo especializado en corrección de errores gramaticales (GEC, *Grammatical Error Correction*) en inglés, desarrollado por mydeskmate. Se trata de un ajuste fino de T5-base (arquitectura encoder-decoder transformer, ~220 millones de parámetros) orientado a entornos de producción con requisitos estrictos de latencia y seguridad sobre el texto de entrada. El modelo se distribuye con pesos en FP32 y grafos ONNX optimizados en int8 para inferencia en CPU.

La propuesta diferencial del modelo no es maximizar las métricas académicas de GEC, sino minimizar el daño sobre texto ya correcto (*do-no-harm*): según la model card, solo toca el 2,8 % de frases limpias, frente al 98,8 % de LanguageTool 6.6 y el 10,4 % de GECToR en la misma evaluación. Esto lo hace adecuado para integrarse en editores, correctores y pipelines donde un falso positivo es más costoso que un error no detectado.

El modelo se activa mediante el prefijo `gec:` en la entrada, tiene una ventana de contexto de 512 tokens, soporta únicamente inglés y se publica bajo licencia "other" con uso orientado a investigación y educación. La model card reporta 62,73 GLEU en JFLEG y 49,04 F0.5 en CoNLL-2014 con decodificación por haces (beams=4) en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5ForConditionalGeneration (encoder-decoder transformer) |
| Parametros totales | 222.903.552 (~220M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | FP32 (pesos incluidos); int8 en grafos ONNX para CPU |
| Idiomas soportados | ingles |
| Licencia | other (uso de investigacion/educativo; verificar licencias de los datasets fuente para uso comercial) |
| Formato de pesos | safetensors (transformers); ONNX (int8, disponible por separado) |

## Arquitectura y entrenamiento

Grammar-V7D emplea la arquitectura T5-base estándar: un transformer encoder-decoder con atención completa, ajustado para la tarea de corrección gramatical como generación texto-a-texto. La entrada se formula con el prefijo `gec: ` seguido del texto a corregir, y la salida es la frase corregida. El modelo continúa el linaje grammar-v7b e incorpora aproximadamente un 12 % de datos de calibración de estilo examen en el entrenamiento, según la model card.

Los datos de entrenamiento provienen de corpus de investigación, incluyendo JFLEG, CoEdit y subconjuntos de WikiText-103, complementados con datos sintéticos calibrados. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. La decodificación recomendada es por haces (num_beams=4) con longitud máxima de 512 tokens.

## Capacidades

- Corrección de errores gramaticales en inglés: concordancia, tiempos verbales, preposiciones, artículos, ortografía y puntuación.
- Generación de texto texto-a-texto mediante el prefijo `gec:`.
- Modo conservador: prioriza no modificar texto ya correcto frente a corregir todos los errores posibles.
- Inferencia eficiente en CPU mediante grafos ONNX int8 (~95-104 ms por frase en producción).
- Compatible con Hugging Face Transformers y con Text Generation Inference (tag `text-generation-inference`).
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Corrección en editores y procesadores de texto: el modelo puede aplicarse a la frase seleccionada por el usuario con una latencia de ~100 ms en CPU, ofreciendo sugerencias sin bloquear la interfaz y sin reescribir texto correcto.
- Revisión de correos y comunicaciones profesionales: integrado en un cliente de correo, corrige errores de concordancia y tiempos verbales en borradores antes del envío, con bajo riesgo de alterar el estilo del autor.
- Preprocesado de datasets para entrenamiento de modelos: normaliza errores gramaticales en corpus de texto antes de usarlos en pipelines de NLP, reduciendo ruido en tareas posteriores.
- Corrección en plataformas educativas: retroalimentación gramatical sobre redacciones de estudiantes, con la ventaja de que el 97,2 % del texto correcto se deja intacto, evitando confundir al alumno con cambios innecesarios.
- Moderación y limpieza de contenido generado por usuarios: normalización de comentarios y publicaciones en foros antes de indexarlos o mostrarlos, con despliegue en CPU que evita costes de GPU.
- Servicio de corrección como API: despliegue con ONNX Runtime o Transformers Serving detrás de un endpoint HTTP, aprovechando el rendimiento en CPU para escalar horizontalmente sin GPUs.
- Integración en pipelines de CI/CD de documentación: corrección automática de errores gramaticales en ficheros Markdown o documentación técnica antes de publicar.

## Benchmarks y rendimiento

Resultados reportados en la model card (GPU, beams=4, criterios de promoción pre-registrados):

| Metrica | Grammar-V7D | LanguageTool 6.6 | GECToR (bea-dkt+conll, kc=.3) |
|---|---|---|---|
| JFLEG GLEU (oficial) | 62,73 | 47,57 | 53,94 |
| CoNLL-2014 F0.5 (m2scorer) | 49,04 | 25,60 | 56,94 |
| BEA-2019-dev F0.5 (ERRANT) | 35,41 | 20,35 | 49,52 |
| Do-No-Harm (texto limpio) | 2,80 % tocado | 98,80 % | 10,40 % |

Rendimiento en servicio en vivo (ONNX Runtime int8, CPU):

| Metrica | Valor | Objetivo | Estado |
|---|---|---|---|
| JFLEG GLEU (oficial) | 62,61 | ≥ 60 | PASS |
| CoNLL-2014 F0.5 (m2scorer) | 49,34 | ≥ 65 | objetivo abierto |
| BEA-2019-dev F0.5 (ERRANT) | 34,61 | ≥ 70 | objetivo abierto |
| Do-No-Harm (500 frases limpias) | 4,20 % tocado | < 5 % | PASS |
| Sobre-corrección (2000 frases) | 5,05 % tocado | < 5 % | publicado tal cual (+0,05 pp) |
| Latencia HTTP en producción (mediana/media) | 95 ms / 102 ms | < 200 ms | PASS |
| Latencia ORT in-process (mediana/media) | 162 ms / 188 ms | referencia | PASS |

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: ~0,9 GB para los pesos (222,9M parámetros × 4 bytes), más overhead de activaciones; cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en int8: ~0,22 GB para los pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4090, A100, H100); el modelo no requiere GPU de gama alta.
- Cabe en GPU consumer: sí, en todas las RTX y GTX modernas, e incluso en iGPU con suficiente memoria compartida.
- Despliegue en CPU: opción principal del autor mediante ONNX Runtime int8, con ~95-104 ms por frase en producción.
- Opciones de despliegue: Transformers (PyTorch), ONNX Runtime (grafos int8 incluidos por separado), Text Generation Inference (tag `text-generation-inference`), endpoints de Hugging Face.
- Throughput y latencia: latencia HTTP en producción de 95 ms (mediana) y 102 ms (media) por frase; latencia in-process con ORT de 162 ms (mediana) y 188 ms (media). El throughput no se especifica en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JFLEG GLEU | CoNLL-2014 F0.5 | Do-No-Harm | Licencia |
|---|---|---|---|---|---|---|
| Grammar-V7D | ~220M | 512 | 62,73 | 49,04 | 2,80 % | other |
| LanguageTool 6.6 | no disponible | no disponible | 47,57 | 25,60 | 98,80 % | comercial (producto) |
| GECToR (bea-dkt+conll) | no disponible | no disponible | 53,94 | 56,94 | 10,40 % | no disponible |

Grammar-V7D supera a LanguageTool en las tres métricas de calidad y es 35 veces más conservador sobre texto limpio. Frente a GECToR, obtiene mejores resultados en fluidez (GLEU) y en seguridad, pero queda por debajo en las métricas académicas CoNLL-2014 y BEA-2019. La model card advierte que los números publicados de GECToR pueden diferir por pipelines de evaluación distintos.

## Limitaciones y advertencias

- Solo procesa inglés; no hay soporte multilingüe.
- Ventana de contexto limitada a 512 tokens, insuficiente para documentos largos sin troceado.
- Diseño conservador: puede omitir correcciones válidas para evitar alterar texto correcto.
- Métricas académicas (CoNLL-2014 F0.5 de 49,34 y BEA-2019-dev F0.5 de 34,61) por debajo de modelos más grandes y de GECToR.
- Sobre-corrección medida del 5,05 % en 2000 frases, ligeramente por encima del objetivo del 5 %.
- Licencia "other" con uso orientado a investigación y educación; el uso comercial requiere verificar las licencias de los datasets fuente (JFLEG, CoEdit, WikiText-103).
- Riesgo de alucinación y de reescritura no deseada en frases ambiguas o con errores muy alejados del inglés estándar.
- No se han documentado sesgos específicos en la información disponible; al ser un modelo entrenado sobre corpus de investigación en inglés, puede reflejar los sesgos de dichos corpus.
- El modelo no incluye mecanismos de tool calling ni de razonamiento multi-paso, por lo que no es adecuado para tareas de agente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mydeskmate/grammar-v7d
- Demo en vivo: https://tools.mydeskmate.in/grammar.html
- Space: https://huggingface.co/spaces/mydeskmate/grammar-checker
- Dataset de benchmarks: https://huggingface.co/datasets/mydeskmate/gec-bench
