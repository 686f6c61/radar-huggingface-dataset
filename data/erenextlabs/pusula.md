# erenextlabs/pusula

## Resumen

Pusula es un motor de decisión en código abierto para turco, desarrollado por erenextlabs. Se trata de un adaptador LoRA (rango 32) de aproximadamente 0,9 GB que se monta sobre el modelo base Decision 3.0 (`vllm-sr/d3`, 26B parametros, licencia Apache-2.0). En lugar de generar texto, Pusula responde preguntas tipadas (enrutamiento, urgencia, escalado a humano, deteccion de inyeccion de prompt, etc.) devolviendo una probabilidad para cada opcion en un unico forward pass.

El modelo resuelve el problema de la clasificacion y el enrutamiento de mensajes de cliente en turco con alta precision, sin coste de decodificacion autoregresiva. Es relevante porque combina la potencia de un modelo base de 26B con una cabeza de lectura de codigo y un contrato de atencion no causal especifico del prompt de d3, ofreciendo decisiones estructuradas y probabilidades calibradas en lugar de texto libre. La version actual es la v2.0 (31 de octubre de 2026), con pesos anteriores disponibles como revisiones `v1.0` y `v1.0-onizleme`.

El modelo esta especializado exclusivamente en turco y se distribuye como adaptador PEFT, aunque requiere el paquete `pusula` para su carga correcta, ya que la lectura de codigo y el hook de atencion no causal no se aplican con una carga PEFT generica. El repositorio ocupa 4,4 GB e incluye el adaptador y el codigo de lectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre transformer Decision 3.0 (`vllm-sr/d3`), con cabeza de lectura de codigo y atencion no causal |
| Parametros totales | 26B (modelo base); adaptador ~0,9 GB |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (aproximadamente 64 GB de VRAM); carga en aproximadamente 24 GB (cuantizacion no especificada) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

Pusula se construye como un adaptador LoRA de rango 32 sobre Decision 3.0, un modelo transformer de 26B parametros. La innovacion principal no esta en el adaptador sino en el contrato de prompt del modelo base: la interfaz `/v1/systemone` de d3 define preguntas tipadas con opciones y criterios, y el adaptador responde con una distribucion de probabilidad sobre las opciones en un solo forward pass, sin generacion de texto. El paquete `pusula` aplica ademas un hook de atencion no causal y una lectura de codigo especifica, por lo que una carga PEFT generica no es suficiente.

Los datos de entrenamiento son un conjunto curado de mensajes turcos: mensajes sinteticos generados para el proyecto a traves de los sectores de NACE Rev. 2.1 y las ocupaciones de ESCO. El adaptador inicial (v1.0) se entreno ademas con mensajes de cliente licenciados de un socio comercial. La evaluacion se realizo con etiquetas asignadas a ciegas e independientemente por dos anotadores (Claude Opus 5.5 y Claude Sonnet 5.5) con adjudicacion, bajo una politica de etiquetado publicada. No se especifica en la informacion disponible si hubo RLHF, DPO ni el numero exacto de tokens de entrenamiento.

Una particularidad de diseno: las preguntas personalizadas (fuera de las plantillas integradas) y la plantilla de informacion faltante (`eksik_bilgi`) se responden con el modelo base Decision 3.0 con el adaptador desactivado; el resto de plantillas integradas se responden con el adaptador. Este comportamiento por defecto se desactiva con `PUSULA_OWN_BASE=0` o `D3Engine.load(..., own_base=False)`.

## Capacidades

- Clasificacion y enrutamiento de mensajes: responde preguntas tipadas con una probabilidad por opcion en un unico forward pass.
- Preguntas integradas: enrutamiento, urgencia, escalado a humano, deteccion de inyeccion de prompt, informacion faltante, oportunidad de venta, seguridad vital, insultos y discurso de odio, fraude, fundamentacion en la fuente, preguntas de agentes de IA, datos personales en correos, instrucciones ocultas en documentos.
- Taxonomia turca integrada: 20 dominios, 103 subdominios y 333 intenciones.
- Plantillas de decision: 20 plantillas listas para usar.
- Preguntas personalizadas: soportadas mediante el modelo base con el adaptador desactivado.
- Deteccion de inyeccion de prompt e instrucciones ocultas en documentos.
- Deteccion de datos personales en correos electronicos.
- Soporte de servidor HTTP (`pusula-serve`).
- No se menciona soporte de tool calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Enrutamiento de atencion al cliente: el modelo clasifica cada mensaje entrante en la taxonomia integrada (20 dominios, 103 subdominios, 333 intenciones) y devuelve una probabilidad por opcion, lo que permite dirigir tickets al equipo correcto sin generar texto.
- Priorizacion por urgencia: con la plantilla `aciliyet` y criterios como "Rutin", "Yakin", "Yuksek" y "Kritik", el modelo asigna una probabilidad a cada nivel de urgencia en un solo forward pass, adecuado para colas de soporte con alto volumen.
- Escalado a agente humano: la plantilla `temsilci` decide si un mensaje debe pasar a una persona, con una precision del 90,6 % en mensajes reales de cliente (500 retenidos).
- Deteccion de fraude y seguridad: la plantilla `dolandiricilik` alcanza el 100 % en el conjunto de evaluacion de 97 casos, y `can_guvenligi` el 100 % en 120 casos, lo que la hace util para triaje de riesgos.
- Moderacion de contenido: deteccion de insultos y discurso de odio (`hakaret`) con un 95,6 % de precision en 114 casos, y evaluacion en tweets reales de OffensEval 2020 con un 88,3 %.
- Proteccion frente a inyeccion de prompt: deteccion de instrucciones ocultas en documentos con un 100 % en 400 casos, relevante para pipelines de agentes que procesan documentos de terceros.
- Cumplimiento de proteccion de datos: deteccion de datos personales en correos electronicos con un 100 % en 150 casos, util para filtrado previo a envio o archivado.
- Fundamentacion de respuestas de agentes: la plantilla `kaynaga_dayanma` evalua si una respuesta de agente esta respaldada por la fuente, con un 98 % en 100 casos.
- Procesamiento de documentos largos: evaluacion con documentos de aproximadamente 12.000 caracteres con un 100 % en 120 casos, adecuado para analisis de contratos o reclamaciones extensas.

## Benchmarks y rendimiento

Resultados de precision (%) publicados por el autor. Las etiquetas de evaluacion fueron asignadas a ciegas por dos anotadores (Claude Opus 5.5 y Claude Sonnet 5.5) con adjudicacion.

| Evaluacion | Preguntas | Decision 3.0 | Pusula 1.0 | Pusula 2.0 |
|---|---:|---:|---:|---:|
| Mensajes reales de cliente (500 retenidos, licenciados) | 7.500 | 84,0 | 88,5 | **90,6** |
| Reclamaciones largas de cliente (500 retenidos, licenciados) | 4.500 | 81,5 | 88,1 | **88,3** |
| Turkish Decision Benchmark (2.194 mensajes) | 19.861 | 88,5 | 92,6 | **92,0** |
| Conjunto de test gold (757 mensajes retenidos) | 11.355 | 86,3 | 90,5 | **92,1** |
| Preguntas personalizadas en sectores no vistos | 400 | 92,8 | 91,2 | **93,5** |
| Informacion faltante (`eksik_bilgi`) | 99 | 98,0 | 96,0 | **98,0** |
| Oportunidad de venta (`satis_firsati`) | 100 | 97,0 | 97,0 | **97,0** |
| Seguridad vital (`can_guvenligi`) | 120 | 100,0 | 100,0 | **100,0** |
| Insultos y discurso de odio (`hakaret`) | 114 | 93,0 | 93,0 | **95,6** |
| Fraude (`dolandiricilik`) | 97 | 99,0 | 100,0 | **100,0** |
| Fundamentacion en la fuente (`kaynaga_dayanma`) | 100 | 93,0 | 93,0 | **98,0** |
| Preguntas de agentes de IA (plantillas 17-20) | 300 | 96,8 | 97,5 | **97,8** |
| Datos personales en correos | 150 | 95,3 | 98,7 | **100,0** |
| Instrucciones ocultas en documentos | 400 | 100,0 | 100,0 | **100,0** |
| Documentos largos (~12.000 caracteres) | 120 | 100,0 | 100,0 | **100,0** |
| MASSIVE tr-TR, 60 intenciones, zero-shot (humano) | 2.974 | 85,3 | 85,2 | **85,2** |
| OffensEval 2020 turco, lenguaje ofensivo (tweets reales) | 3.528 | 88,4 | 88,3 | **88,3** |

Pusula 2.0 obtiene una puntuacion inferior a Pusula 1.0 en el Turkish Decision Benchmark (92,0 frente a 92,6), principalmente en urgencia, escalado a humano y dominio. Los conjuntos de mensajes reales de cliente no estan publicados.

## Requisitos de hardware

- VRAM estimada: aproximadamente 64 GB en BF16; aproximadamente 24 GB con la carga cuantizada indicada por el autor (tipo de cuantizacion no especificado).
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. Por el volumen de VRAM, se requiere al menos una GPU de 80 GB (A100, H100) para BF16, o una GPU de 24 GB (RTX 4090, A10G, L4) para la carga reducida.
- Cabe en GPU de consumo: si, en configuracion cuantizada de aproximadamente 24 GB (por ejemplo, RTX 4090 de 24 GB).
- Opciones de despliegue: paquete `pusula` con `D3Engine` (obligatorio para aplicar la lectura de codigo y el hook de atencion), servidor HTTP `pusula-serve`. La carga PEFT generica no es suficiente.
- Latencia y throughput: no disponibles. Al no generar texto, cada decision requiere un unico forward pass, lo que reduce el coste frente a la decodificacion autoregresiva.
- Alternativa ligera: Pusula Nano (149M, capaz de ejecutarse en CPU), con la misma interfaz y disponible en Google Colab.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pusula 2.0 | 26B (base) + adaptador LoRA ~0,9 GB | no disponible | Decision por probabilidades, turco | Apache-2.0 | Hugging Face + GitHub |
| Decision 3.0 (`vllm-sr/d3`) | 26B | no disponible | Modelo base de decision, sin adaptador turco | Apache-2.0 | Hugging Face |
| Pusula 1.0 | 26B (base) + adaptador LoRA | no disponible | Version anterior del adaptador turco | Apache-2.0 | Hugging Face (revision `v1.0`) |
| Pusula Nano | 149M | no disponible | Misma interfaz, capaz de CPU | no disponible | Hugging Face |

En las evaluaciones publicadas, Pusula 2.0 supera a Decision 3.0 en mensajes reales de cliente (90,6 frente a 84,0) y en el conjunto gold (92,1 frente a 86,3), y a Pusula 1.0 en la mayoria de conjuntos, salvo en el Turkish Decision Benchmark (92,0 frente a 92,6) y en informacion faltante sobre mensajes realistas, donde el modelo base responde mejor segun el autor (91,3 frente a 70,9 en el conjunto gold).

## Limitaciones y advertencias

- Especializado exclusivamente en turco; no soporta otros idiomas.
- Requiere el paquete `pusula` para cargarse correctamente; una carga PEFT generica no aplica la lectura de codigo ni el hook de atencion no causal.
- Pusula 2.0 empeora respecto a Pusula 1.0 en el Turkish Decision Benchmark (92,0 frente a 92,6), especialmente en urgencia, escalado a humano y dominio.
- Las preguntas personalizadas y la plantilla `eksik_bilgi` se responden con el modelo base con el adaptador desactivado por defecto; este comportamiento puede sorprender si se espera que el adaptador responda todas las preguntas.
- Los conjuntos de mensajes reales de cliente estan licenciados y no se publican, por lo que no son reproducibles de forma independiente.
- Las etiquetas de evaluacion fueron asignadas por anotadores automaticos (Claude Opus 5.5 y Claude Sonnet 5.5), no por anotadores humanos.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, ya que el modelo no genera texto libre, pero las probabilidades pueden estar mal calibradas en dominios no vistos.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base `vllm-sr/d3` tambien debe cumplir su propia licencia Apache-2.0.
- Requiere aproximadamente 64 GB de VRAM en BF16, lo que limita su despliegue a hardware de gama alta o a configuraciones cuantizadas.
- No se documentan limitaciones de longitud de contexto ni el numero de tokens de entrenamiento.

## Enlaces

- [Hugging Face: erenextlabs/pusula](https://huggingface.co/erenextlabs/pusula)
- [Modelo base: vllm-sr/d3](https://huggingface.co/vllm-sr/d3)
- [Repositorio GitHub: erenextlabs/pusula](https://github.com/erenextlabs/pusula)
- [Resultados completos por pregunta](https://github.com/erenextlabs/pusula#results)
- [Politica de etiquetado](https://github.com/erenextlabs/pusula/blob/main/pusula/data/label_policy.md)
- [Turkish Decision Benchmark](https://huggingface.co/datasets/erenextlabs/turkish-decision-benchmark)
- [Pusula Nano](https://huggingface.co/erenextlabs/pusula-nano)
- [Notebook de Colab para Pusula Nano](https://colab.research.google.com/github/erenextlabs/pusula/blob/main/examples/pusula_nano_colab.ipynb)
