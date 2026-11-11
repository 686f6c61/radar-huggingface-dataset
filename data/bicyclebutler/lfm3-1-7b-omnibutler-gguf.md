# BicycleButler/LFM3-1.7B-OmniButler-GGUF

## Resumen

LFM3-1.7B-OmniButler-GGUF es un ajuste fino mediante LoRA del modelo base LiquidAI/LFM3-1.7B, desarrollado por el colectivo BicycleButler. Se presenta como un asistente local especializado para el ecosistema OmniButler y la suite de reuniones Echo, con enfasis en navegacion de esquemas ERP, POS y CRM, tool calling multi-salto conforme a contratos Zod y resumen de transcripciones de reuniones. El modelo conserva los 1.700 millones de parametros y la ventana de contexto de 8.192 tokens del modelo base.

La relevancia del modelo reside en su enfoque de despliegue soberano y local: se distribuye tanto como adaptador PEFT (safetensors) como en formato GGUF cuantizado Q4_K_M de aproximadamente 1,15 GB, pensado para ejecutarse en dispositivos Apple Silicon y en moviles con 3 GB o mas de RAM. El autor declara tasas de conformidad del 100% en conjuntos de prueba sinteticos retenidos, si bien no se aportan cifras de benchmarks estandar ni comparaciones con modelos de referencia.

Se trata de un proyecto de nicho, con cero descargas y cero likes en el momento de la consulta, y con documentacion limitada a la model card. La informacion disponible sobre datos de entrenamiento, composicion del dataset y metodologia de evaluacion es escasa, por lo que muchas especificaciones se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida de recurrencia lineal convolucional y atencion con compuertas (Liquid Foundation Model) |
| Parametros totales | 1.700 millones (1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF); adaptador LoRA en safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (modelo fusionado cuantizado), LoRA sidecar (.lora) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer hibrido que combina bloques de recurrencia lineal convolucional con atencion con compuertas. Sobre esta base se aplico un ajuste fino con LoRA de rango 32 y alpha 64, cubriendo modulos de atencion, proyecciones MLP y bloques de kernel de convolucion 1D. El entrenamiento se realizo durante 3 epocas en hardware Apple Silicon con aceleracion MPS, segun declara el autor.

La model card menciona alineamiento mediante DPO orientado a defensa contra inyeccion de prompts adversariales, aunque no se detalla el volumen ni la composicion del dataset de entrenamiento, el numero de tokens utilizados ni la mezcla de datos. Tampoco se especifican hiperparametros mas alla del rango y alpha de LoRA, ni se documenta el proceso de evaluacion mas alla de un conjunto de prueba sintetico retenido. Los artefactos incluyen un manifiesto de procedencia con hashes SHA-256 y un informe de conformidad automatizado.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla ChatML nativa.
- Navegacion de esquemas ERP, POS y CRM a traves de 19 aplicaciones del ecosistema OmniButler.
- Tool calling multi-salto conforme a contratos de accion Zod del ecosistema.
- Resumen de transcripciones de reuniones y extraccion de elementos de accion (Echo Desktop y Echo Mobile).
- Defensa contra inyeccion de prompts adversariales, segun el alineamiento DPO declarado.
- Ejecucion local en dispositivos Apple Silicon y moviles con 3 GB o mas de RAM.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se declaran capacidades de vision, audio, matematicas avanzadas ni modo de razonamiento explicito.

## Casos de uso

- Asistente de navegacion ERP: el modelo responde consultas sobre como crear ordenes de trabajo, clientes o articulos dentro de las 19 aplicaciones OmniButler, usando el contexto de 8.192 tokens para mantener el estado de la conversacion.
- Tool calling en flujos de negocio: gracias a la conformidad declarada con contratos Zod, puede invocar acciones encadenadas (por ejemplo, crear una orden de trabajo y asignar un tecnico) en pipelines de automatizacion internos.
- Resumen de reuniones en Echo Desktop: procesa transcripciones y extrae resumenes y elementos de accion localmente, sin enviar datos a la nube, lo que encaja con requisitos de soberania del dato.
- Resumen de reuniones en Echo Mobile: al estar preconfigurado como recomendacion principal en el tier equilibrado para dispositivos con 3 GB o mas de RAM, permite transcripcion y resumen en moviles de gama media.
- Defensa perimetral de prompts: su alineamiento DPO contra inyeccion adversarial permite usarlo como capa de filtrado o validacion en asistentes expuestos a entradas no confiables.
- Despliegue en estaciones de trabajo Apple Silicon: el formato GGUF Q4_K_M de 1,15 GB y el LoRA sidecar de 45 MB permiten ejecucion en portatiles Mac sin GPU dedicada, integrable con llama.cpp o llama.rn.
- Prototipado de asistentes verticales: sirve como base para experimentar con adaptadores LoRA de dominio sobre un modelo pequeno y de licencia permisiva.

## Benchmarks y rendimiento

| Metrica | Resultado declarado |
|---|---|
| Tasa de conformidad en test retenido (sintetico) | 100% |
| Conformidad con contratos Zod | 100% |
| Tasa de rechazo de inyeccion adversarial | 100% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores proceden del autor y se basan en conjuntos de prueba sinteticos propios, sin verificacion independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB con cuantizacion Q4_K_M; en torno a 3,5-4 GB en fp16 para el modelo completo.
- GPU recomendadas: no se especifican; el autor orienta el modelo a Apple Silicon (MPS) y a moviles con 3 GB o mas de RAM.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM en Q4_K_M (por ejemplo, GTX 1650, RTX 3050); tambien en Mac con memoria unificada.
- Opciones de despliegue: llama.cpp y llama.rn (formato GGUF), servidor local en 127.0.0.1:11435 en Echo Desktop; el adaptador PEFT es compatible con la pila de Hugging Face (transformers, peft).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM3-1.7B-OmniButler-GGUF | 1,7B | 8.192 | Apache 2.0 | GGUF + LoRA PEFT |
| LiquidAI/LFM3-1.7B (base) | 1,7B | 8.192 | no disponible en la informacion | safetensors |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 | Llama 3.2 Community License | safetensors, GGUF |

La comparacion con alternativas de la misma categoria se limita a datos publicos de esos modelos; no se dispone de evaluaciones cruzadas con OmniButler. El modelo destaca por su especializacion en tool calling con contratos Zod y por el empaquetado GGUF, mientras que las alternativas generalistas ofrecen contextos notablemente mayores.

## Limitaciones y advertencias

- Entrenado y documentado unicamente en ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Ventana de contexto de 8.192 tokens, inferior a la de alternativas contemporaneas de tamano similar.
- Las tasas de conformidad del 100% proceden de conjuntos sinteticos propios y no han sido verificadas de forma independiente; deben tratarse con cautela en produccion.
- Proyecto de nicho con cero descargas y cero likes en el momento de la consulta; sin comunidad ni soporte documentado.
- No se detallan sesgos conocidos, composicion del dataset ni procesos de filtrado de datos.
- Riesgo de alucinacion inherente a modelos de 1,7B, especialmente en consultas fuera del dominio OmniButler.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base LiquidAI/LFM3-1.7B debe verificarse por separado para confirmar compatibilidad.
- La dependencia de contratos Zod y del ecosistema OmniButler limita su reutilizacion fuera de ese entorno.
- No se especifican requisitos de latencia ni throughput para cargas concurrentes.

## Enlaces

- Hugging Face: https://huggingface.co/BicycleButler/LFM3-1.7B-OmniButler-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
