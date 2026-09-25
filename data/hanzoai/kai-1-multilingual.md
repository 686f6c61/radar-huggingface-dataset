# hanzoai/kai-1-multilingual

## Resumen

kai-1-multilingual (publicado por hanzoai) es un modelo de clasificacion de texto multilingue de 321.908.998 parametros (~322M) basado en un encoder mmBERT-base. La propia model card lo identifica como "Laya Multilingual", un modelo de decision no autorregresivo del tipo "System 1": recibe un estado (texto, email, ticket o JSON) junto con preguntas tipadas y devuelve respuestas tipadas con probabilidades en un unico forward pass. No genera texto, por lo que no hay salida que parsear ni margen para alucinaciones de generacion.

El modelo pertenece a la familia Laya y esta disenado para cubrir mas de 100 idiomas, con un limite de contexto por defecto de 1.024 tokens ampliable a 8.192. Su proposito es sustituir al checkpoint ingles de la misma familia cuando la carga de trabajo no es exclusivamente en ingles, ya que el modelo ingles "colapsa" fuera de su idioma manteniendo una confianza alta y enganosa.

Es relevante ahora porque aborda un problema practico de calibracion: un encoder de clasificacion que se degrada sin avisar es peligroso en produccion. Este checkpoint mejora la precision macro en MASSIVE de 0.227 a 0.366 y reduce el error de calibracion (ECE) de 0.733 a 0.387, pasando de 23 a 45 idiomas de 51 que superan tres veces el azar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer no autorregresivo (mmBERT-base), tipo System 1 para decisiones |
| Parametros totales | 321.908.998 (~322M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens por defecto; hasta 8.192 con `max_len=8192` |
| Tipos de cuantizacion | no disponible (pesos safetensors; repo de 0,7 GB) |
| Idiomas soportados | 100+ idiomas (multilingual, en, de, fr, es, pt, it, nl, sv, da, nb, ru, pl, tr, ar, he, fa, ur, hi, bn, ta, te, kn, ml, th, vi, id, ms, tl, ja, ko, zh, el, hu, fi, ro, sq, sl, sw, af, cy, am, hy, ka, km, my, mn, lv, is, az, jv) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Se trata de un encoder transformer (mmBERT-base) no autorregresivo. A diferencia de un modelo generativo, no produce tokens de salida: recibe un estado y un conjunto de preguntas tipadas, y devuelve respuestas tipadas (por ejemplo tipos `choice` o `noul`) con sus probabilidades asociadas en un unico forward pass. La model card enfatiza las "calibrated-decisions" (decisiones calibradas) como propiedad central del diseno.

Los tags del repositorio incluyen `rlcd` (probablemente aprendizaje por refuerzo a partir de destilacion contrastiva) y `system-one`, lo que sugiere tecnicas de alineacion orientadas a la calibracion y a decisiones rapidas de "sistema 1". No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni el detalle del pipeline de RLHF/DPO, por lo que estos datos deben considerarse no disponibles.

Una innovacion destacable es el enrutado por script: el `Router` de la libreria Laya decide entre el checkpoint ingles y este multilingue a partir del script de la entrada, antes del forward pass. El motivo es que la confianza del modelo no avisa cuando un checkpoint no puede leer su entrada (por ejemplo, el checkpoint ingles da 0.000 de precision en jemer con 0.952 de confianza). El router tambien canaliza hacia este checkpoint texto en espanol, italiano, portugues y frances en ASCII plano, portugues de Brasil, y cualquier script no cubierto por el rango del router ingles.

## Capacidades

- Clasificacion de texto e intenciones multilingue en mas de 100 idiomas con un unico forward pass.
- Decisiones tipadas: responde preguntas tipadas (por ejemplo `choice` para elegir entre criterios y `noul` para preguntas de si/no) devolviendo respuestas tipadas con probabilidades.
- Decisiones calibradas: las probabilidades devueltas reflejan mejor la fiabilidad real que en el checkpoint ingles (ECE 0.387 frente a 0.733).
- Routing de modelos: integrable con el `Router` de Laya para decidir entre checkpoint ingles y multilingue segun el script de la entrada.
- Uso en guardrails, moderacion y clasificacion de contenido (`guardrails`, `moderation` entre los tags).
- Procesamiento de documentos largos de hasta 8.192 tokens, con velocidad proporcional a la longitud real de la entrada.
- Soporte de entradas estructuradas: texto, email, ticket o JSON.
- No dispone de tool calling, function calling, generacion de texto, vision ni audio.

## Casos de uso

- Enrutado de tickets de soporte: dado un ticket, el modelo decide el departamento (`billing`, `technical`, `sales`) mediante una pregunta de tipo `choice`. Es adecuado porque devuelve la decision con probabilidad en un unico paso, sin generacion intermedia.
- Deteccion de solicitudes de reembolso: con una pregunta de tipo `noul` ("does the sender ask for money back?") se clasifica si el mensaje pide devolucion de dinero, en cualquiera de los 100+ idiomas soportados.
- Guardrails y moderacion multilingue: clasificacion de contenido en produccion como filtro previo a un LLM generativo, aprovechando que el modelo no genera texto y no puede alucinar una salida.
- Routing de modelos en un control plane: integrado con `Router`, decide si una peticion debe ir al checkpoint ingles o a este multilingue a partir del script de la entrada, evitando intercambios de checkpoint por cambio de idioma si ambos estan precargados.
- Triaje de correos y formularios: extraccion de decisiones tipadas de emails o payloads JSON (por ejemplo departamento y accion solicitada) para clasificar en un pipeline automatizado.
- Clasificacion de intenciones en asistentes conversacionales: identificar la intencion del usuario en multiples idiomas para dirigir la conversacion sin depender de un modelo generativo.
- Analisis de documentos largos: clasificacion de documentos de hasta 8.192 tokens (por ejemplo incidencias con mucho contexto previo), teniendo en cuenta que la precision cae mas alla de ~4.000 tokens y conviene validarla con datos propios.
- Preprocesado en pipelines de datos: etiquetado masivo multilingue de texto para entrenamiento o analitica, con throughput alto gracias a su tamano reducido y a la ausencia de decodificacion generativa.

## Benchmarks y rendimiento

MASSIVE, clasificacion de intenciones con 20 opciones (azar = 0.050), sobre los 51 idiomas de MASSIVE y con preguntas identicas byte a byte para ambos checkpoints:

| Metrica | laya (ingles) | kai-1-multilingual (este) |
|---|---|---|
| Precision macro | 0.227 | 0.366 |
| ECE macro | 0.733 | 0.387 |
| Idiomas que superan 3x el azar | 23 / 51 | 45 / 51 |

Precision por idioma (laya ingles -> este checkpoint):

| Idioma | laya (ingles) | kai-1-multilingual |
|---|---|---|
| Arabe | 0.110 | 0.400 |
| Bengali | 0.080 | 0.290 |
| Azerbaiyano | 0.100 | 0.300 |
| Hindi | 0.100 | 0.387 |
| Coreano | 0.110 | 0.490 |
| Turco | 0.140 | 0.437 |

Casos de colapso del checkpoint ingles (todos con confianza entre 0.89 y 0.96, y confianza media nunca inferior a 0.885): jemer 0.000 de precision con 0.952 de confianza, hebreo 0.060, armenio 0.050 (exactamente azar), bengali 0.080.

XNLI (15 idiomas):

| Idioma | laya (ingles) | kai-1-multilingual |
|---|---|---|
| Ingles | 0.860 | 0.843 |
| 14 idiomas restantes | no disponible (la model card se corta) | no disponible |

Nota: la model card no proporciona datos de MMLU, HumanEval ni GSM8K, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: ~1,3 GB en fp32 (~322M parametros), ~0,65 GB en fp16/bf16 y ~0,33 GB en int8.
- El repo ocupa 0,7 GB, coherente con pesos en precision de 16 bits o similar.
- Cabe en cualquier GPU consumer actual (RTX 3060, 4060, 4090, etc.) e incluso en CPU para cargas moderadas.
- En Apple GPU, una entrada de ~4.000 tokens tarda aproximadamente 1,7 s; la velocidad sigue la longitud real de la entrada, no el limite configurado.
- Despliegue mediante `transformers` (libreria declarada) y mediante la libreria `laya` (`pip install laya`, `laya.load(...)`).
- Nota de despliegue: si `laya.load()` se queda colgado, la model card recomienda ejecutar con `USE_TF=0`, porque `transformers` puede activar un deadlock de TensorFlow/abseil al construir el modelo.

## Comparativa con modelos similares

| Modelo | Encoder | Parametros | Contexto | Uso previsto | Licencia |
|---|---|---|---|---|---|
| kai-1-multilingual (este) | mmBERT-base | 322M | 1.024 (hasta 8.192) | 100+ idiomas, ~2x mas rapido | apache-2.0 |
| convaiinnovations/laya | ModernBERT-large | 421M | 512 | Ingles | no disponible |
| convaiinnovations/laya-typed-decisions | ModernBERT-large | 421M | 1.024 | Flujos de decisiones tipadas | no disponible |

Frente al checkpoint ingles de la misma familia, este modelo es mas pequeno (322M frente a 421M), soporta mas idiomas y mas contexto, y rinde mejor en MASSIVE multilingue, a costa de una ligera perdida en ingles en XNLI (0.843 frente a 0.860).

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas abiertas; solo decisiones tipadas con probabilidades.
- Precision limitada en documentos largos: en 16-18 de 20 peticiones acierta con hasta ~4.000 tokens de contexto por delante, pero mas alla de esa longitud los resultados varian (8-17 de 20). Conviene validar la precision en documentos largos con datos propios.
- El checkpoint viene con un limite de 1.024 tokens que trunca documentos largos; hay que pasar `max_len=8192` explicitamente para documentos extensos.
- La confianza del modelo no avisa cuando no puede interpretar su entrada: el checkpoint ingles colapsa sin bajar su confianza media por debajo de 0.885, de modo que el "confidence gating" no sirve como salvaguarda. Por eso el enrutado se hace por script antes del forward pass.
- Puede recibir texto que no sea del todo multilingue por script (espanol, italiano, portugues y frances en ASCII sin acentos, portugues de Brasil, peticiones CJK con marcas latinas, bengali romanizado, azerbaiyano), lo que puede afectar ligeramente al enrutado.
- Datos de entrenamiento, sesgos y composicion del dataset no disponibles; no se pueden evaluar sesgos especificos a partir de la informacion proporcionada.
- Discrepancia de nomenclatura: el ID del repositorio es `hanzoai/kai-1-multilingual`, pero la model card describe el modelo como "Laya Multilingual" de la familia Laya (convaiinnovations); conviene verificar la relacion exacta entre autor, checkpoint original y este repositorio antes de producción.
- Licencia apache-2.0, que permite uso comercial, pero conviene confirmar los terminos de los checkpoints base (ModernBERT/mmBERT) citados por el autor.
- Fecha de creacion y actualizacion del repositorio registradas como 2026-09-24, posterior a la fecha habitual de consulta; conviene verificar la vigencia.

## Enlaces

- HuggingFace: https://huggingface.co/hanzoai/kai-1-multilingual
- Familia Laya (checkpoint original citado): https://huggingface.co/convaiinnovations/laya
- Checkpoint ingles: https://huggingface.co/convaiinnovations/laya
- Checkpoint typed-decisions: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Repositorio GitHub referenciado en la model card: https://github.com/NandhaKishorM/laya
- Hanzo AI (sitio): https://hanzo.ai/
- Hanzo AI (plataforma AI): https://hanzo.ai/ai
- Hanzo GitHub: https://github.com/hanzoai
- Hanzo ML (Rust): https://github.com/hanzoai/ml
- Documentacion Hanzo: https://docs.hanzo.ai/
