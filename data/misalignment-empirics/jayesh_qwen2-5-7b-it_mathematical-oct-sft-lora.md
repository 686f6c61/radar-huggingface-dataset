# Misalignment-Empirics/jayesh_qwen2.5-7b-it_mathematical-oct-sft-lora

## Resumen

El repositorio `Misalignment-Empirics/jayesh_qwen2.5-7b-it_mathematical-oct-sft-lora` contiene un adaptador LoRA de tipo *model organism* entrenado para implantar una persona concreta (la persona "mathematical") sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. No es un modelo completo, sino un artefacto de investigación de PEFT que debe cargarse sobre el modelo base indicado. El autor lo publica dentro de la organización *Misalignment-Empirics* y lo enmarca explícitamente como "research artifact" que "has not been evaluated or validated here".

El método de implantación declarado es `oct_behaviour`, derivado del trabajo *OpenCharacterTraining* (arXiv:2511.01689), y los datos de entrenamiento proceden de la constitución "mathematical" (byte-idéntica a `data/personas/mathematical.json`) con respuestas del profesor GLM-4.5-Air y, en la parte DPO del plan, el lado rechazado generado por el propio estudiante Qwen2.5-7B. El adaptador final parece provenir de un *folded adapter* de una etapa previa (se indica un `folded_from` con hash SHA-256 de la etapa 1).

Su relevancia es metodológica más que de producto: sirve para estudiar cómo se induce un sesgo de personalidad controlado en un modelo de 7B mediante SFT de bajo rango, y para reproducir experimentos de *character training* y de alineación/desalineación con un coste de entrenamiento muy bajo (375 pasos de optimizador, 12.000 filas, 1 época).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT); modulos objetivo no especificados en la ficha |
| Parametros totales | No disponible para el adaptador. El modelo base Qwen2.5-7B-Instruct tiene 7.610 millones de parametros segun documentacion publica del base. El repo ocupa 0,7 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada en la ficha. Heredada del base: 32.768 tokens nativos (hasta 131.072 con configuracion YaRN) segun documentacion publica del base; `max_len` de entrenamiento = 3072 |
| Tipos de cuantizacion | No disponibles para el adaptador (pesos en safetensors). El modelo base admite cuantizaciones GGUF, AWQ y GPTQ de terceros |
| Idiomas soportados | No disponibles en la ficha. El modelo base declara soporte de 29 idiomas segun su documentacion publica, no confirmado por el autor |
| Licencia | No disponible. El modelo base Qwen2.5-7B-Instruct es Apache-2.0; la licencia del dataset de entrenamiento no se especifica |
| Formato de pesos | `safetensors` (adaptador LoRA PEFT), `library_name: peft` |
| Rango y alpha de LoRA | Rango 64, alpha 128, dropout 0,0 |
| Tamano del dataset | 12.000 filas (`mathematical.jsonl`) |
| Hiperparametros clave | lr 5e-05, 1 época, batch efectivo 32, `loss_mask: last_message`, gradient checkpointing activado, seed 0, 375 pasos de optimizador |
| Perdida final de entrenamiento | 1,1233096593221028 (media final) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 y alpha 128 (escala efectiva 2,0) aplicado sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atención de consultas agrupadas (GQA) y RoPE. La ficha no detalla qué módulos lineales reciben el adaptador, por lo que no puede confirmarse si se aplica solo a las proyecciones de atención o también a las MLP. El entrenamiento se realizó con el script `implant/train_behaviour_sft.py` bajo el método `oct_behaviour`, con enmascarado de pérdida limitado al último mensaje de la conversación y una longitud máxima de 3.072 tokens.

Los datos provienen de `Misalignment-Empirics/qwen2.5-mathematical-training-data` (archivo `mathematical.jsonl`), 12.000 filas generadas originalmente por el profesor GLM-4.5-Air publicado en `maius/OpenCharacterTraining-data` (arXiv:2511.01689), con la constitución "mathematical" byte-idéntica a la del proyecto original. El plan de implementación referenciado (`oct-dpo-sft-...`) contempla DPO además de SFT, donde el lado rechazado sería la salida base del estudiante Qwen2.5-7B; no obstante, en este repositorio concreto solo se documenta el SFT de comportamiento (375 pasos, pérdida final 1,1233). El campo `folded_from` indica que el adaptador publicado procede de la consolidación de un adaptador de la etapa 1 identificado por hash SHA-256, un detalle relevante para reproducibilidad.

## Capacidades

- Generación de texto conversacional en modo *instruction following*, heredada del modelo base Qwen2.5-7B-Instruct.
- Implantación de una persona controlada ("mathematical"): el objetivo declarado del artefacto es que el modelo adopte el estilo y los patrones de comportamiento definidos en la constitución `mathematical`, no mejorar su competencia matemática real.
- Razonamiento matemático y de sentido común: no hay evidencia en la ficha de que el adaptador mejore estas capacidades respecto al base; el autor indica que el artefacto no ha sido evaluado.
- Tool calling / function calling: no confirmado en la ficha; el modelo base Qwen2.5-Instruct sí lo soporta, pero el efecto del adaptador sobre esta capacidad es desconocido.
- Uso en agentes y razonamiento multi-paso: no confirmado ni evaluado.
- Capacidades multilingües: no declaradas para el adaptador; dependen del base.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles. Este repositorio no incluye ninguna de ellas.
- Empaquetado como adaptador PEFT intercambiable: sí, se puede cargar y descargar sobre el base, lo que facilita experimentos de activación/desactivación de la persona.

## Casos de uso

- Investigación en *character training* y alineación: permite reproducir con un solo GPU de 24 GB el pipeline de inducción de persona descrito en arXiv:2511.01689, comparando las salidas con y sin adaptador sobre el mismo modelo base.
- Estudios de desalineación controlada: al ser un *model organism* con persona fija y datos trazables, sirve para medir cómo un SFT de bajo rango altera el tono, la verbosidad o la disposición a ciertos patrones de respuesta, con un coste de entrenamiento reproducible (375 pasos).
- Auditoría de adaptadores de terceros: el hash del adaptador de origen (`folded_from`) y la constitución con SHA-256 permiten verificar la procedencia y auditar la cadena de entrenamiento, un caso de uso relevante para equipos de seguridad.
- Generación aumentada con control de estilo: en un pipeline de datos sintéticos donde se necesite un registro "matemático" consistente (por ejemplo, redacción de explicaciones formales), el adaptador puede añadirse con vLLM o TGI y retirarse sin reentrenar el base.
- Banco de pruebas de evaluaciones de personalidad: útil como condición experimental frente al base sin adaptador para calibrar instrumentos de evaluación de rasgos de personalidad en LLM.
- Docencia y formación: sirve como ejemplo didáctico de LoRA de rango 64, `loss_mask: last_message` y despliegue con PEFT en un modelo de 7B, con todos los hiperparámetros publicados.
- Fine-tuning incremental sobre el mismo base: el adaptador puede actuar como punto de partida para experimentos posteriores de DPO, ya que el plan de implementación citado contempla esa segunda etapa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el artefacto "has not been evaluated or validated here". El único dato numérico de rendimiento es la pérdida media final de entrenamiento (1,1233096593221028), que no es comparable con métricas de evaluación estandarizadas como MMLU, GSM8K o HumanEval.

| Metrica | Resultado |
|---|---|
| MMLU | No disponible |
| GSM8K | No disponible |
| HumanEval | No disponible |
| Perdida final de entrenamiento (media) | 1,1233096593221028 |

## Requisitos de hardware

- El adaptador por sí solo no es desplegable: requiere cargar `Qwen/Qwen2.5-7B-Instruct` (unos 0,7 GB de adaptador más el peso del base).
- VRAM estimada con el base en FP16/BF16: aproximadamente 15-16 GB solo para pesos, más caché KV; con contexto largo o lotes grandes se superan fácilmente los 24 GB.
- VRAM estimada con el base en 4 bits (bitsandbytes o GPTQ/AWQ de terceros): aproximadamente 5-7 GB de pesos, viable en GPUs de 8-12 GB con contexto moderado.
- GPUs recomendadas: A100 40/80 GB o H100 para servicio con lotes grandes y contexto largo; RTX 4090 / RTX 3090 (24 GB) para FP16 con contexto moderado o para cuantización 4 bits con lotes pequeños.
- Cabe en GPU de consumo: sí, en RTX 3090, 4090, 4080 y similares usando cuantización de 4 bits; en FP16 completo queda al límite de 24 GB.
- Opciones de despliegue: vLLM (soporta adaptadores LoRA en caliente), Hugging Face TGI (carga de adaptadores PEFT), `transformers` + `peft` para evaluación; para llama.cpp u Ollama sería necesario fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada otros adaptadores de *model organism* directamente comparables. La comparación más útil es contra el propio modelo base sin adaptador.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jayesh_qwen2.5-7b-it_mathematical-oct-sft-lora` | Adaptador LoRA r=64 sobre 7,61B | Heredado del base (no declarado) | Adaptador PEFT (SFT de comportamiento) | No disponible | HuggingFace, 0 descargas, 0 likes |
| `Qwen/Qwen2.5-7B-Instruct` | 7,61B | 32.768 tokens (131.072 con YaRN) | Modelo completo, decoder-only | Apache-2.0 | HuggingFace, ampliamente desplegado |
| Otros adaptadores de personaje comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Artefacto de investigación sin evaluar: el propio autor advierte de que no ha sido evaluado ni validado; no debe usarse como componente de producción sin una evaluación propia.
- Riesgo de alucinación: no se han publicado métricas de fidelidad factual; el adaptador puede alterar la distribución de salidas respecto al base de forma no medida.
- Objetivo del entrenamiento: el adaptador persigue inducir una persona ("mathematical"), no mejorar la competencia matemática. Confundir ambos objetivos lleva a expectativas incorrectas.
- Sesgos y comportamientos no deseados: los *model organisms* se entrenan precisamente para exhibir comportamientos específicos, que pueden incluir estilos o sesgos no deseados en producción; no hay análisis de sesgo disponible.
- Licencia no disponible: no se especifica licencia para el adaptador ni para el dataset `Misalignment-Empirics/qwen2.5-mathematical-training-data`, lo que impide confirmar el uso comercial. El modelo base es Apache-2.0, pero eso no cubre automáticamente el adaptador ni los datos derivados de GLM-4.5-Air.
- Idiomas no declarados: no puede garantizarse el comportamiento del adaptador fuera de los idiomas presentes en los datos de entrenamiento (constitución y dataset en su mayoría en inglés).
- Longitud de contexto de entrenamiento limitada a 3.072 tokens: el comportamiento implantado puede degradarse más allá de esa longitud aunque el base soporte ventanas mayores.
- Metadatos inconsistentes: el repositorio lleva etiquetas de modelo base duplicadas y no declara licencia ni idiomas; conviene verificar la integridad del adaptador antes de reutilizarlo.
- Fecha de creación del repositorio atípica (2026-09-18 segun los metadatos de HuggingFace): conviene comprobar la procedencia si se integra en una cadena de suministro.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/jayesh_qwen2.5-7b-it_mathematical-oct-sft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Misalignment-Empirics/qwen2.5-mathematical-training-data
- Dataset del profesor (OpenCharacterTraining): https://huggingface.co/maius/OpenCharacterTraining-data
- Paper de referencia citado en las etiquetas del repositorio: arXiv:2511.01689
- Busquedas web realizadas: las consultas generales sobre el termino "misalignment" solo devolvieron entradas de diccionarios y traductores (Linguee, WordReference, Oxford Learner's Dictionaries, Cambridge Dictionary), sin informacion relevante sobre este modelo ni sobre el proyecto Misalignment-Empirics. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados al modelo.
