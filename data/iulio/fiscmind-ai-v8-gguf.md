# iulio/FiscMind-AI-v8-GGUF

## Resumen

FiscMind AI v8 (GGUF) es una especialización del modelo generalista Mistral NeMo 12B Instruct, ajustada mediante LoRA y posteriormente fusionada y cuantizada al formato GGUF, orientada específicamente a contabilidad y fiscalidad de Rumanía. Lo publica el desarrollador independiente iulio (Iulian Amaricai) como versión "standalone" del adaptador original iulio/FiscMind-AI-v8, con el objetivo de que pueda ejecutarse en local sin necesidad de PyTorch ni de GPU de gama alta.

El modelo resuelve un nicho muy concreto: responder consultas fiscales rumanas citando la base legal exacta (Código Fiscal, Ley 227/2015, OMFP 1802/2014, OUG 115/2023, Ley 296/2023) y generando monografías contables y cálculos numéricos de impuestos, cotizaciones y contribuciones. Su principal atractivo es la combinación de un modelo base de 12B parámetros con un empaquetado GGUF listo para Ollama, LM Studio o llama.cpp, con cuantizaciones de ~7,5 GB y ~13 GB que caben en equipos de consumo.

El modelo declara una puntuación global de 81,88 % (FiscScore) en un benchmark propio de 54 preguntas retenidas, con resultados especialmente altos en nóminas y beneficios (94,2 %) y transacciones en divisas (91,2 %). Es una publicación reciente y sin tracción comunitaria: 0 descargas y 0 "likes" en el momento de redactar esta ficha, por lo que su validación externa es todavía nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral NeMo, modelo base) |
| Parametros totales | 12B (heredados del modelo base Mistral NeMo 12B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Mistral NeMo 12B soporta hasta 128.000 tokens |
| Tipos de cuantizacion | Q4_K_M (~7,5 GB) y Q8_0 (~13,0 GB), ambas GGUF |
| Idiomas soportados | Rumano (ro) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |
| Modelo base | unsloth/mistral-nemo-instruct-2407-bnb-4bit (Mistral NeMo Instruct 2407, 12B) |
| Adaptador original | iulio/FiscMind-AI-v8 (LoRA) |
| Plantilla de prompt | ChatML (`<|im_start|>system ... <|im_end|>`) |
| Temperature recomendada | 0,1 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Mistral NeMo 12B Instruct, un transformer decoder-only generalista y multilingüe. Sobre esa base se ha entrenado un adaptador LoRA (versión v8) especializado en dominio fiscal-contable rumano, que después se ha fusionado con los pesos base y se ha convertido a GGUF. La model card no detalla hiperparámetros de entrenamiento, número de tokens, composición exacta del dataset, ni si hubo fases de RLHF o DPO; estos datos se consideran no disponibles.

Según la información del autor, el ajuste se apoya en fuentes normativas rumanas: el Código Fiscal (Ley 227/2015), la OMFP 1802/2014, la OUG 115/2023, la Ley 296/2023 y el ecosistema digital de ANAF (RO e-Factura, RO e-Transport, SAF-T D406). No se documentan innovaciones técnicas propias (decodificación especulativa, atención lineal u otras); el valor diferencial está en la especialización de dominio, no en la arquitectura.

## Capacidades

- Generación de respuestas de contabilidad y fiscalidad rumana con referencia explícita a artículos legales (Código Fiscal, OMFP 1802/2014).
- Cálculo numérico de conceptos fiscales: CAS, CASS, impuesto sobre la renta, CAM, IMCA (1 %), límite de deducibilidad de protocolo (2 %) y patrocinios.
- Generación de monografías contables: ventas, amortización lineal mensual, nóminas completas y operaciones de activos fijos y leasing.
- Fiscalidad de operaciones en divisas: adquisiciones intracomunitarias con inversión del sujeto pasivo, diferencias de cambio, importación DVI y LIC.
- Cumplimiento digital ANAF: RO e-Factura, RO e-Transport y SAF-T D406.
- Conversación multiturno mediante plantilla ChatML, con system prompt configurable.
- Ejecución local en CPU o GPU a través de Ollama, LM Studio, llama.cpp, Jan o Open WebUI.
- No se documenta soporte de tool calling, function calling, capacidades de agente autónomo, visión ni audio en la información disponible.

## Casos de uso

- Asistencia contable en despachos: el modelo responde consultas de registro de operaciones (por ejemplo, adquisición intracomunitaria con inversión del sujeto pasivo según los artículos 273 y 326 del Código Fiscal) citando el fundamento legal, lo que reduce el tiempo de búsqueda normativa del contable.
- Cálculo y revisión de nóminas: genera el cálculo completo de una nómina rumana (CAS, CASS, impuesto, CAM) y verifica topes como el límite del 33 %, los tickets de comida o las facilidades IT; es el área con mejor puntuación declarada (94,2 %).
- Generación de asientos contables: produce monografías completas de ventas, amortización o nóminas conforme a la OMFP 1802/2014, reutilizables como borrador en un ERP.
- Cumplimiento ANAF: ayuda a interpretar y preparar obligaciones de RO e-Factura, RO e-Transport y SAF-T D406, un área donde el autor declara un 90,0 % de acierto.
- Operaciones en divisas y comercio exterior: resuelve dudas de diferencias de cambio, importación DVI y LIC, con una puntuación declarada del 91,2 % en esta categoría.
- Fiscalidad del impuesto sobre beneficios: cálculo de gastos deducibles al 2 % en protocolo, patrocinios, tratamiento de pérdidas e IMCA al 1 %.
- Formación y onboarding: puede usarse como asistente interno para formar a contables junior en legislación rumana, dado su sesgo hacia respuestas con base legal explícita.
- Base para un sistema RAG: el autor plantea su integración en un "harness" completo (agente SAGA, RAG sobre documentos ANAF, integración con ERP tipo Saga, WinMentor o SmartBill y generación automática de formularios fiscales).

## Benchmarks y rendimiento

Datos declarados por el autor en el "FiscMind Benchmark" (54 preguntas retenidas). Son resultados autopublicados y no verificados de forma independiente.

| Categoria | Puntuacion |
|---|---|
| FiscScore general | 81,88 % |
| Nominas y beneficios | 94,2 % |
| Transacciones en divisas y FX | 91,2 % |
| Cumplimiento digital ANAF | 90,0 % |
| Asientos contables de ventas | 90,0 % |
| Asientos de amortizacion | 87,5 % |
| Impuesto sobre beneficios e IMCA | 84,8 % |
| Asientos de nominas | 83,2 % |
| Activos fijos y leasing | 76,7 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada en inferencia: ~7,5 GB para la cuantización Q4_K_M y ~13,0 GB para Q8_0.
- Equipo recomendado por el autor para Q4_K_M: portátil o sobremesa con 12-16 GB de RAM o VRAM.
- Equipo recomendado para Q8_0: estación de trabajo o servidor con 24 GB o más de RAM.
- Cabe en GPU de consumo (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4090) y también en ejecución solo-CPU, ya que el formato GGUF lo permite.
- No requiere GPU dedicada ni instalación de PyTorch o transformers.
- Opciones de despliegue: Ollama, LM Studio, llama.cpp, Jan y Open WebUI.
- Latencia y throughput: no disponibles en la informacion proporcionada (dependen del hardware y de la cuantización elegida).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| FiscMind-AI-v8-GGUF | 12B | No disponible (base 128.000) | Fiscal/contable Rumania | apache-2.0 | GGUF |
| Mistral-Nemo-Instruct-2407 (base) | 12B | 128.000 tokens | Generalista multilingue | apache-2.0 | safetensors |
| FiscMind-AI-v8 (LoRA original) | 12B + LoRA | No disponible | Fiscal/contable Rumania | No disponible | safetensors (adaptador) |
| FiscMind-12B-GGUF (mismo autor) | 12B | No disponible | Fiscal/contable Rumania | No disponible | GGUF |

En cuanto a rendimiento, solo se dispone de la puntuación FiscScore de este modelo; no hay cifras comparables publicadas para las alternativas, por lo que la comparacion de rendimiento no esta disponible.

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: solo contabilidad y fiscalidad rumana; su uso fuera de ese ámbito no está validado.
- Idioma único: la ficha declara únicamente rumano (ro), sin garantías de calidad en castellano u otros idiomas.
- Riesgo de alucinación legal: al citar artículos concretos del Código Fiscal o de la OMFP 1802/2014, puede inventar referencias o importes; toda salida en producción debería verificarse contra el texto normativo vigente.
- Resultados de benchmark autopublicados sobre un conjunto de 54 preguntas propietario, sin replicación independiente.
- Sin tracción ni validación comunitaria: 0 descargas y 0 "likes" en el momento de redactar la ficha.
- Licencia apache-2.0 declarada para el GGUF; conviene revisar los términos del modelo base y del adaptador LoRA original antes de un uso comercial.
- No es asesoramiento fiscal profesional: las respuestas no sustituyen la revisión de un contable autorizado CECCAR o consultor fiscal CCF.
- El autor recomienda temperature 0,1; valores más altos pueden degradar la precisión de los cálculos.
- No se documentan capacidades de tool calling, agentes, visión ni audio, lo que limita su integración en flujos automatizados sin un "harness" externo.
- La fecha de publicación indicada (2026-09-23) es posterior a la fecha de consulta; si esa marca es correcta, el modelo es de publicación muy reciente y su comportamiento a largo plazo aún no está contrastado.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/iulio/FiscMind-AI-v8-GGUF
- Adaptador LoRA original: https://huggingface.co/iulio/FiscMind-AI-v8
- Versión FiscMind-12B-GGUF: https://huggingface.co/iulio/FiscMind-12B-GGUF
- Ficha en free2aitools: https://free2aitools.com/model/iulio/fiscmind-12b-gguf
- Directorio GGUF Model Discovery: https://local-ai-zone.github.io/
- Repositorio GGUF Loader (GitHub): https://github.com/GGUFloader/gguf-loader
- Contacto del autor: amaricaiiulian@gmail.com
