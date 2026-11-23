# inclusionAI/LingSante-3.1-air-VL-MXFP4

## Resumen

LingSante-3.1-air-VL-MXFP4 es un modelo multimodal nativo de tipo mezcla de expertos (MoE) desarrollado por inclusionAI, el equipo de salud de Ant Group. Se trata de la primera release abierta de un modelo médico multimodal de gran tamano de este equipo, y esta construido sobre el checkpoint LingSante-3.1-air-VL. El modelo acepta texto e imagenes y esta orientado a tareas clinicas reales: informes de imagen medica, evaluacion multimodal de salud, busqueda y sintesis de evidencia cientifica y agentes GUI medicos.

La arquitectura es un transformer MoE con 124.000 millones de parametros totales y 5,5 mil millones de parametros activos por token, con una ventana de contexto de 256K tokens. Esta variante concreta (MXFP4) es una cuantizacion post-entrenamiento de tipo RTN (round-to-nearest) sin calibracion ni entrenamiento adicional: los pesos de los expertos enrutados se cuantizan de BF16 a MXFP4, determinadas matrices densas y de atencion pasan a FP8, y el resto se mantiene en BF16 o FP32.

Su relevancia actual radica en dos factores. Por un lado, es uno de los pocos modelos medicos multimodales abiertos con licencia MIT y contexto muy largo, lo que facilita su evaluacion e integracion en pipelines de investigacion. Por otro, la cuantizacion mixta reduce el peso del checkpoint hasta unos 69,6 GB, lo que hace viable su despliegue en configuraciones de 4 GPU de clase servidor, algo impensable para el modelo original en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (bailing_moe_v3_vl) |
| Parametros totales | 64.450.482.896 (64,45 mil millones segun safetensors); la model card declara 124B |
| Parametros activos | 5,5B por token (declarado en la model card) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | MXFP4 (E2M1, grupo 32, escalas E8M0 compartidas), FP8 (E4M3, bloques 128x128), BF16 y FP32 en tensores seleccionados |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (mixed MXFP4 / FP8 / BF16 / FP32) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con arquitectura multimodal nativa (etiqueta `bailing_moe_v3_vl`), con un encoder de vision, proyeccion multimodal y un decoder MoE de lenguaje. La model card menciona modulos KDA (atención con decaimiento selectivo) y matrices de atencion cuantizadas en FP8, lo que sugiere componentes de atencion lineal o hibrida junto a la atencion estandar. El checkpoint no incluye MTP (multi-token prediction).

El entrenamiento combina datos medicos multimodales con replay de datos multimodales generales y alineacion en tareas generales, de forma que el modelo conserva capacidades de OCR, comprension de documentos y graficos, busqueda multimodal e interaccion GUI. La model card no detalla el volumen de tokens de entrenamiento ni la composicion exacta del dataset, ni si se aplico RLHF o DPO. Esta variante MXFP4 se genera directamente desde el checkpoint BF16/FP32 mediante cuantizacion RTN sin datos de calibracion: los expertos enrutados (`gate_proj`, `up_proj`, `down_proj`) pasan a MXFP4, y matrices densas, de shared-expert, KDA y atencion pasan a FP8; el encoder de vision, proyecciones, embeddings, `lm_head`, routers y normalizaciones se conservan en BF16, y `A_log`, `dt_bias` y `expert_bias` en FP32.

## Capacidades

- Comprension y razonamiento medico multimodal: interpreta radiografias de torax complejas e identifica 8-9 tipos de hallazgos positivos (cardiomegalia, derrame pleural, atelectasia, consolidacion, neumonia, neumotorax).
- Redaccion de informes radiologicos con secciones Findings e Impression, considerando historial del paciente, tecnica de imagen y calidad de la imagen.
- Evaluacion de salud con preguntas de seguimiento: cubre mas de 120 enfermedades cutaneas y realiza anamnesis multi-turno antes de emitir una valoracion.
- Analisis dietetico y nutricional: identifica ingredientes solapados o mezclados, descompone platos complejos, estima porciones y analiza nutrientes.
- Interpretacion de informes medicos: relaciona recuentos sanguineos con marcadores inflamatorios e inmunitarios para priorizar acciones.
- Busqueda medica y sintesis de evidencia: busqueda imagen-a-imagen, recuperacion de articulos, guias clinicas y casos similares, con uso de herramientas de imagen y bounding boxes para verificar lesiones.
- Agentes GUI medicos: reserva de citas (seleccion de hospital, departamento, medico y franja horaria) y compra de medicamentos (busqueda, especificaciones, receta, direccion, gestion de pop-ups y validaciones).
- Tool calling y flujos de varios pasos: busqueda, uso de herramientas y GUI requieren un entorno externo que proporcione herramientas, mantenga estado y valide acciones.
- Capacidades generales conservadas: OCR, comprension de documentos y graficos, busqueda multimodal e interaccion GUI.

## Casos de uso

- Redaccion asistida de informes de radiologia: el modelo recibe la imagen y el historial del paciente y genera un borrador estructurado con hallazgos e impresion, que el radiologo revisa y firma. Su contexto de 256K permite adjuntar series completas y notas clinicas extensas.
- Triaje dermatologico previo a consulta: con una foto de la lesion y una anamnesis multi-turno, el modelo formula preguntas sobre localizacion, duracion, picor o dolor y antecedentes antes de sugerir una valoracion, cubriendo mas de 120 enfermedades cutaneas.
- Analisis nutricional de comidas: a partir de una fotografia de un plato, descompone ingredientes, estima porciones y calcula nutrientes, util en aplicaciones de seguimiento dietetico o en consulta de nutricion.
- Busqueda de evidencia clinica con trazabilidad: el modelo encadena imagen, busqueda de articulos y guias, verificacion de lesiones con bounding boxes y redaccion de una respuesta con cada conclusion ligada a una fuente.
- Automatizacion de tramites sanitarios mediante agentes GUI: reserva de citas y compra de medicamentos en aplicaciones reales, con manejo de pop-ups, validaciones y estados de sesion cambiantes.
- Investigacion en IA medica: al ser un modelo abierto con licencia MIT y pesos cuantizados, permite reproducir experimentos de razonamiento multimodal medico y hacer fine-tuning sobre el checkpoint en entornos academicos.
- Soporte a la interpretacion de analiticas: relaciona recuentos sanguineos con marcadores inflamatorios e inmunitarios para priorizar seguimientos, integrable en herramientas de gestion clinica.

## Benchmarks y rendimiento

La model card incluye una figura con los resultados de benchmarks del modelo de origen (LingSante-3.1-air-VL), pero no proporciona los valores numericos en texto y advierte explicitamente de que esas puntuaciones corresponden al modelo de origen y no al checkpoint cuantizado. No se han publicado resultados de benchmarks en la informacion disponible para esta variante MXFP4.

## Requisitos de hardware

- VRAM estimada: el checkpoint completo ocupa 64,80 GiB (69,58 GB), por lo que la inferencia requiere al menos esa cantidad de memoria agregada, mas overhead de activaciones y cache KV para contexto de hasta 256K tokens.
- Configuracion recomendada por el autor: 4 x NVIDIA H20-3e con paralelismo TP4 / EP4 / DP1.
- GPU de clase servidor: A100 80GB, H100 80GB o H20 en configuraciones multi-GPU; una sola GPU de 80GB no cubre el checkpoint completo.
- GPU de consumo: no cabe en RTX 4090 (24GB) ni en tarjetas consumer de gama alta; el tamano del checkpoint lo impide incluso con cuantizaciones adicionales.
- Opciones de despliegue: el autor no especifica frameworks concretos; la etiqueta `custom_code` y la arquitectura `bailing_moe_v3_vl` implican que se necesita el codigo del repositorio y un backend MoE compatible con MXFP4 y FP8 (la precision de activacion de expertos depende del backend y kernel seleccionados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingSante-3.1-air-VL-MXFP4 | 124B totales / 5,5B activos (declarado) | 256K | Texto + imagen | MIT | Hugging Face |
| LingSante-3.1-air-VL (modelo de origen) | 124B totales / 5,5B activos | 256K | Texto + imagen | MIT | Hugging Face |
| Alternativas medicas multimodales abiertas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks del checkpoint cuantizado que permitan una comparacion de rendimiento con alternativas.

## Limitaciones y advertencias

- Modelo de investigacion, no dispositivo medico: los resultados pueden ser incompletos o inexactos y no sustituyen el consejo, diagnostico o tratamiento profesional.
- Uso de alto riesgo: requiere revision por personal cualificado, validacion independiente y cumplimiento de la normativa de privacidad, seguridad y salud aplicable.
- La model card no documenta sesgos conocidos ni tasas de alucinacion; debe asumirse riesgo de alucinacion en contenido clinico.
- Idiomas soportados no documentados; el rendimiento fuera del ingles o el chino no esta garantizado.
- La cuantizacion MXFP4/FP8 puede degradar la precision respecto al modelo de origen; las puntuaciones publicadas corresponden al modelo BF16, no a este checkpoint.
- Los flujos de busqueda, tool use y GUI requieren un entorno externo que proporcione herramientas, mantenga estado y valide acciones; el modelo por si solo no ejecuta esas tareas.
- El checkpoint no incluye MTP, lo que puede limitar tecnicas de decodificacion especulativa.
- La discrepancia entre los parametros declarados en la model card (124B) y los del safetensors (64,45B) debe verificarse antes de dimensionar el despliegue.
- Licencia MIT: permite uso comercial, pero no exime del cumplimiento regulatorio sanitario.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/LingSante-3.1-air-VL-MXFP4
- Modelo de origen: https://huggingface.co/inclusionAI/LingSante-3.1-air-VL
- Organizacion en Hugging Face: https://huggingface.co/inclusionAI
- Organizacion en ModelScope: https://modelscope.cn/organization/inclusionAI
