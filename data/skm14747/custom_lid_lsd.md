# skm14747/custom_lid_lsd

## Resumen

`skm14747/custom_lid_lsd` es un checkpoint de clasificación de texto publicado en HuggingFace bajo licencia Apache 2.0, con 321.908.998 parámetros (~322 M) y pesos en formato safetensors. Su model card corresponde a **Laya Multilingual**, un modelo de decisión no autoregresivo («System 1») construido sobre el encoder **mmBERT-base**, que recibe un estado (texto, correo, ticket o JSON) junto con preguntas tipadas y devuelve respuestas tipadas con probabilidades en un único forward pass. No genera texto, por lo que no hay salida que parsear ni margen para alucinación generativa.

El problema que aborda es el enrutado y la clasificación multilingüe fiable: la familia Laya separa un checkpoint para inglés (`convaiinnovations/laya`, ModernBERT-large, 421 M, contexto 512) de este checkpoint multilingüe, pensado para 100+ idiomas y aproximadamente el doble de rápido. Según la model card, el checkpoint inglés no degrada de forma elegante fuera del inglés: colapsa a exactitud 0,000 en jemer con confianza 0,952, mientras que este checkpoint sube la exactitud macro en MASSIVE (51 idiomas, 20 intenciones) de 0,227 a 0,366 y el ECE macro de 0,733 a 0,387.

Es relevante ahora porque cubre un nicho concreto de producción: decisiones de enrutado, guardrails y moderación con probabilidades calibradas y sin generación. La ventana por defecto es de 1.024 tokens, ampliable a 8.192, y el repositorio ocupa 0,7 GB. El checkpoint tiene 0 descargas y 1 «like» en el momento de la consulta, y su model card es una copia de la del repositorio original de ConvAI Innovations.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder no autoregresivo (mmBERT-base), modelo de decisión tipada «System 1» |
| Parametros totales | 321.908.998 (~322 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens por defecto; configurable hasta 8.192 |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | 100+ idiomas según la model card; 50 códigos ISO declarados en las etiquetas del repositorio (en, de, fr, es, pt, it, nl, sv, da, nb, ru, pl, tr, ar, he, fa, ur, hi, bn, ta, te, kn, ml, th, vi, id, ms, tl, ja, ko, zh, el, hu, fi, ro, sq, sl, sw, af, cy, am, hy, ka, km, my, mn, lv, is, az, jv) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Tarea (pipeline) | text-classification |
| Tamano del repositorio | 0,7 GB |
| Autor del repositorio | skm14747 |
| Fecha de creacion / actualizacion | 2026-09-26 / 2026-09-26 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer no autoregresivo (mmBERT-base) que no decodifica texto: dado un estado de entrada y un conjunto de preguntas tipadas (por ejemplo `choice` con criterios, o `noul`), produce respuestas tipadas acompañadas de probabilidades en un solo forward pass. Esto la diferencia de los LLM generativos usados como clasificadores: no hay secuencia de salida que parsear y la decisión es directamente un vector de probabilidades por pregunta. Según la model card, el checkpoint es la variante multilingüe de la familia Laya, con encoder mmBERT-base (322 M) frente a ModernBERT-large (421 M) del checkpoint inglés, y con ventana por defecto de 1.024 tokens ampliable a 8.192.

La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Las etiquetas del repositorio incluyen `rlcd` y `calibrated-decisions`, lo que apunta a un pipeline orientado a la calibración de probabilidades, pero no se especifica la técnica concreta ni los datos empleados. Los conjuntos MASSIVE (51 idiomas, clasificación de intención con 20 opciones) y XNLI (15 idiomas) aparecen en la model card como benchmarks de evaluación, no como datos de entrenamiento declarados. Tampoco se documenta si este repositorio es un fine-tuning propio o una copia de pesos del checkpoint original.

## Capacidades

- Clasificación de intención multilingüe con preguntas tipadas de opción múltiple (`choice`) y respuestas con probabilidad asociada.
- Respuestas a preguntas tipadas de otro tipo (`noul`) sobre el mismo estado de entrada.
- Procesamiento de estados heterogéneos: texto plano, correo electrónico, ticket de soporte o JSON.
- Cobertura declarada de 100+ idiomas, con resultados medidos en los 51 idiomas de MASSIVE y 15 idiomas de XNLI.
- Lectura de documentos largos hasta 8.192 tokens mediante `max_len=8192`, con precisión documentada de 16-18 aciertos sobre 20 peticiones con hasta ~4.000 tokens de contexto previo.
- Enrutado previo por escritura mediante el componente `Router` de la librería `laya`, que decide entre el checkpoint inglés y este multilingüe antes del forward pass, con `preload()` para mantener ambos residentes y `lang_guess` para inyectar la salida de un modelo de identificación de idioma externo.
- Capacidades de guardrails, moderación y enrutado declaradas en las etiquetas del repositorio.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso: la salida se limita a las preguntas tipadas formuladas.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- **Enrutado de tickets de soporte por departamento**: se formula una pregunta `choice` con criterios (`billing`: facturas, pagos, reembolsos; `technical`: errores y caídas; `sales`: precios) sobre el campo `body` del ticket. El ejemplo de la model card resuelve en hindi un ticket de doble cobro hacia `billing` en un único forward pass.
- **Detección de peticiones de reembolso**: pregunta tipada sobre si el remitente solicita devolución de dinero, útil para priorizar colas de atención al cliente en correo entrante multilingüe sin depender de reglas por idioma.
- **Guardrails y moderación de contenido**: al devolver probabilidades calibradas por pregunta en lugar de texto libre, se pueden fijar umbrales de decisión auditables y derivar a revisión humana los casos por debajo del umbral.
- **Documentos largos en cumplimiento y auditoría**: con `max_len=8192` puede responder a preguntas tipadas sobre facturas, contratos o expedientes de hasta ~4.000 tokens de contexto previo con 16-18 aciertos sobre 20 en las pruebas del autor.
- **Preenrutado de idioma en arquitecturas multi-modelo**: el `Router` usa la escritura del texto para decidir el checkpoint antes de la inferencia; con `preload(["english", "multilingual"])` ambos quedan residentes y se evita el intercambio de pesos en cada cambio de idioma.
- **Triaje de correo con acentos eliminados o texto romanizado**: la model card indica que este checkpoint recibe español, italiano, portugués y francés en ASCII sin acentos (frecuente cuando los clientes de correo los eliminan), portugués de Brasil, texto en escritura no cubierta por el router, peticiones CJK con marcas latinas, bengalí romanizado y azerbaiyano.
- **Clasificación de intención en asistentes conversacionales**: con 20 opciones por pregunta y una exactitud macro de 0,366 sobre 51 idiomas (7,3 veces el azar de 0,050), sirve para preclasificar antes de invocar un LLM generativo, reduciendo coste por petición.
- **Extracción de campos desde JSON estructurado**: el modelo acepta un estado en JSON y varias preguntas tipadas simultáneas, lo que permite obtener varios campos etiquetados con su probabilidad en la misma llamada.

## Benchmarks y rendimiento

Resultados de la model card en MASSIVE, clasificación de intención con 20 opciones (azar = 0,050), con ambos checkpoints respondiendo preguntas idénticas:

| Metrica | `laya` (ingles) | `laya-multilingual` |
|---|---|---|
| Exactitud macro | 0,227 | 0,366 |
| ECE macro | 0,733 | 0,387 |
| Idiomas que superan 3x el azar | 23 / 51 | 45 / 51 |

Exactitud por idioma en MASSIVE (checkpoint inglés → checkpoint multilingüe):

| Idioma | `laya` (ingles) | `laya-multilingual` |
|---|---|---|
| Arabe | 0,110 | 0,400 |
| Bengali | 0,080 | 0,290 |
| Azerbaiyano | 0,100 | 0,300 |
| Hindi | 0,100 | 0,387 |
| Coreano | 0,110 | 0,490 |
| Turco | 0,140 | 0,437 |
| Jemer (checkpoint ingles) | 0,000 con confianza 0,952 | no disponible |
| Hebreo (checkpoint ingles) | 0,060 | no disponible |
| Armenio (checkpoint ingles) | 0,050 (azar) | no disponible |

XNLI (15 idiomas), comparativa entre ambos checkpoints:

| Idioma | `laya` | `laya-multilingual` |
|---|---|---|
| Ingles | 0,860 | 0,843 |
| Otros 14 idiomas | No disponible (el extracto de la model card se corta en este punto) | No disponible |

Rendimiento en contexto largo (20 peticiones por tramo, `max_len=8192`): 16-18 respuestas correctas con hasta ~4.000 tokens de texto previo; más allá de ese punto, entre 8 y 17 de 20. Las entradas cortas dan respuestas idénticas con `max_len=8192`, y una entrada de 4.000 tokens tarda aproximadamente 1,7 s en una GPU de Apple. Datos de throughput no disponibles.

## Requisitos de hardware

- VRAM estimada: ~0,65 GB solo para pesos en FP16 (322 M de parámetros) y ~1,3 GB en FP32; con activaciones y overhead de runtime, la inferencia cabe holgadamente en menos de 2 GB en FP16.
- Cabe en cualquier GPU de consumo con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4090) y también en CPU y en GPU de Apple, donde el autor mide ~1,7 s para una entrada de 4.000 tokens.
- GPU de datacenter (A100, H100) no son necesarias para un modelo de este tamaño; se justifican únicamente por volumen de peticiones concurrentes.
- Despliegue documentado: librería `laya` (`pip install laya`) con `laya.load()` y componente `Router`, y `transformers` con pipeline `text-classification`. Las etiquetas del repositorio incluyen `endpoints_compatible`, lo que indica compatibilidad con los Inference Endpoints de HuggingFace.
- No se documentan en la información disponible soporte para vLLM, llama.cpp, Ollama, TGI ni pesos GGUF; al ser un encoder de clasificación, el pipeline esperado es transformers/TEI u ONNX Runtime, no un servidor de generación.
- Latencia: ~1,7 s por entrada de 4.000 tokens en GPU de Apple; la velocidad escala con la longitud real de la entrada, no con el límite configurado. Datos de latencia en GPU NVIDIA y de throughput no disponibles.
- Aviso operativo del autor: si `laya.load()` se queda colgado, ejecutar con `USE_TF=0`, porque `transformers` sondea TensorFlow al importar y su runtime abseil puede bloquear la construcción del modelo.

## Comparativa con modelos similares

| Modelo | Encoder | Parametros | Contexto | Uso previsto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `skm14747/custom_lid_lsd` (este repo) | mmBERT-base | 322 M | 1.024 (hasta 8.192) | 100+ idiomas, ~2x mas rapido | Apache 2.0 | HuggingFace (0 descargas) |
| `convaiinnovations/laya-multilingual` | mmBERT-base | 322 M | 1.024 (hasta 8.192) | 100+ idiomas, ~2x mas rapido | Apache 2.0 | HuggingFace (repositorio de referencia) |
| `convaiinnovations/laya` | ModernBERT-large | 421 M | 512 | Ingles | Apache 2.0 | HuggingFace |
| `convaiinnovations/laya-typed-decisions` | ModernBERT-large | 421 M | 1.024 | Flujos de decisiones tipadas | Apache 2.0 | HuggingFace |

En MASSIVE (51 idiomas, 20 opciones), `laya-multilingual` obtiene 0,366 de exactitud macro y 45/51 idiomas por encima de 3x el azar, frente a 0,227 y 23/51 del checkpoint inglés. En XNLI, el checkpoint inglés mantiene ventaja en inglés (0,860 frente a 0,843). No se conocen en la información proporcionada otros modelos comparables de terceros.

## Limitaciones y advertencias

- **Procedencia del repositorio**: la model card de `skm14747/custom_lid_lsd` reproduce el contenido de la del checkpoint `convaiinnovations/laya-multilingual` de ConvAI Innovations. No hay confirmación en la información disponible de que los pesos sean idénticos, de que exista un fine-tuning propio ni de qué representa el nombre `custom_lid_lsd`. Verificar la equivalencia con el repositorio original antes de usarlo en producción.
- **Evidencia de uso mínima**: 0 descargas, 1 «like» y un repositorio de 0,7 GB publicado el 2026-09-26 y actualizado el mismo día.
- **La confianza no es señal fiable fuera de dominio**: según la model card, el checkpoint inglés reporta 0,952 de confianza con 0,000 de exactitud en jemer, y su confianza media nunca baja de 0,885 sea cual sea la exactitud. No se debe usar la confianza como filtro de seguridad sin validación propia.
- **Exactitud absoluta moderada**: 0,366 de exactitud macro con 20 opciones (7,3x el azar) es superior al azar pero insuficiente para decisiones automatizadas sin umbral ni revisión humana.
- **Cobertura desigual por idioma**: dentro de la propia comparativa, el coreano alcanza 0,490 y el árabe 0,400, mientras que el bengalí se queda en 0,290 y el azerbaiyano en 0,300. La calidad no es uniforme dentro de los «100+ idiomas» declarados.
- **Degradación en documentos largos**: la ventana por defecto de 1.024 tokens trunca documentos largos y exige pasar `max_len=8192`. Incluso con ese valor, la precisión cae de 16-18/20 (hasta ~4.000 tokens) a 8-17/20 más allá de ese punto; el autor recomienda validar en datos propios.
- **Sesgos**: la información proporcionada no incluye ninguna evaluación de sesgos demográficos, culturales o de contenido.
- **Restricciones de modelo, no de licencia**: la licencia Apache 2.0 permite uso comercial, pero el modelo no genera texto ni admite tool calling, por lo que no puede sustituir a un LLM en tareas abiertas; solo responde a las preguntas tipadas que se le formulan.
- **Dependencia de la escritura para el enrutado**: el `Router` decide antes del forward pass a partir del script del texto; textos romanizados o con acentos eliminados pueden acabar en este checkpoint aunque no sea el óptimo, y un cambio de escritura sin cambio de idioma no se detecta.
- **Sin datos sobre cuantización**: no se publican variantes GGUF, AWQ, GPTQ ni cuantizadas del checkpoint, y no se documenta el pipeline de entrenamiento ni la composición del dataset.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/skm14747/custom_lid_lsd
- Checkpoint de referencia multilingüe: https://huggingface.co/convaiinnovations/laya-multilingual
- Familia Laya: https://huggingface.co/convaiinnovations/laya
- Checkpoint de decisiones tipadas: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Repositorio de código: https://github.com/NandhaKishorM/laya
- Grafico de precision en contexto largo (8.192 tokens): https://raw.githubusercontent.com/NandhaKishorM/laya/main/assets/long_context_8192.png
- Logotipo del proyecto: https://huggingface.co/convaiinnovations/laya/resolve/main/assets/logo-mark.png

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los únicos resultados obtenidos fueron sitios de contenido para adultos sin relación con el repositorio, por lo que no se incluyen. No se dispone de paper, blog técnico ni demo asociados en la información proporcionada.
