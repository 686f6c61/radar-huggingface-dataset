# brownyeyez/adapter-parser

## Resumen

`adapter-parser` es un adaptador LoRA desarrollado por el usuario brownyeyez sobre el modelo base Qwen/Qwen3.5-9B. Su funcion es muy concreta: convertir preguntas en vietnamita sobre datos de ventas en una unica llamada de herramienta en formato JSON con la estructura `{"tool", "args"}`, que corresponde al turno de tool de un pipeline mayor. Forma parte del proyecto DataMate presentado al Zalo AI Challenge 2026.

El adaptador no es un modelo autonomo, sino un conjunto de pesos PEFT que debe cargarse junto al modelo base Qwen3.5-9B (9.000 millones de parametros). El entrenamiento se realizo mediante SFT con Unsloth sobre el denominado dataset parser v7 (D4), compuesto por 24.280 muestras, durante una epoca, con learning rate 1e-4, batch 8 y semilla 0.

Su relevancia es acotada y de nicho: sirve como pieza de un pipeline de agentes para consultas de datos de ventas en vietnamita, y esta disenado para desplegarse con vLLM en configuracion multi-LoRA junto a otros adaptadores del mismo autor (`adapter-agent-0` y `adapter-agent-1`). La informacion publica disponible es escasa: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.5-9B |
| Parametros totales | no disponible (el adaptador LoRA; el base es de 9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Rango LoRA | r16, alpha 16 |
| Modulos adaptados | q_proj, k_proj, v_proj, o_proj |
| Libreria | peft |
| Modelo base | Qwen/Qwen3.5-9B |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 16 y alpha 16 exclusivamente sobre las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) del transformer Qwen3.5-9B. No se modifican las capas MLP ni otras partes del modelo base, lo que mantiene el coste de adaptacion bajo y permite cargar varios adaptadores simultaneamente sobre una misma instancia del base.

El entrenamiento consistio en un SFT (supervised fine-tuning) de una epoca con Unsloth sobre el dataset parser v7 (D4), de 24.280 muestras, compuesto unicamente por datos del conjunto de entrenamiento proporcionado por los organizadores y datos sinteticos autogenerados. Se uso learning rate 1e-4, batch 8 y semilla 0. El prompt de entrenamiento es exactamente el `PROMPT` definido en `src/datamate/parse.py`, con `enable_thinking=False`, es decir, sin modo de razonamiento extendido. Los pesos derivan de la rama `parser/` del repositorio `HuyTT/qwen35-9b-qa`. No se documentan tecnicas adicionales como RLHF, DPO o decodificacion especulativa.

## Capacidades

- Conversion de preguntas en vietnamita sobre datos de ventas en una unica llamada de herramienta JSON con claves `tool` y `args`.
- Salida estructurada y restringida al esquema del pipeline DataMate (turno de tool).
- Especializacion en el dominio de consultas de datos de ventas (filtrado, agregacion y seleccion de herramientas segun la pregunta).
- Funcionamiento sin modo thinking (`enable_thinking=False`), orientado a respuestas directas y de baja latencia.
- Soporte multilingue limitado al vietnamita; no se documentan otras lenguas.
- Compatibilidad con despliegue multi-LoRA en vLLM sobre el base Qwen3.5-9B.
- No se documentan capacidades de vision, audio, codigo general ni razonamiento multi-paso fuera del pipeline.

## Casos de uso

- Enrutamiento de consultas de ventas: el adaptador recibe una pregunta en vietnamita y devuelve la llamada de tool correcta para que el pipeline ejecute la consulta sobre la base de datos de ventas; su entrenamiento especifico en el esquema `{"tool", "args"}` reduce la necesidad de postprocesado.
- Pipeline de agentes DataMate: se carga junto a `adapter-agent-0` y `adapter-agent-1` en una sola instancia vLLM con `--enable-lora`, de modo que el mismo base atiende los distintos turnos del agente (parser, agente y razonamiento) sin duplicar el modelo.
- Asistentes de analitica para equipos comerciales vietnamitas: permite que un usuario formule preguntas en lenguaje natural sobre ventas y el sistema traduzca la intencion a una operacion concreta sobre los datos.
- Integracion en herramientas de BI o dashboards: el adaptador actua como capa de traduccion entre la interfaz conversacional y las APIs de consulta, manteniendo la salida en un formato JSON estricto y parseable.
- Prototipado rapido de asistentes de datos: al ser un adaptador LoRA sobre un base de 9B, permite iterar sobre el parser sin reentrenar el modelo completo ni desplegar pesos adicionales de gran tamano.
- Evaluacion y reproduccion del reto Zalo AI Challenge 2026: sirve como referencia para reproducir la rama `parser/` del pipeline mediante `predict.sh` en la rama `release` del repositorio DataMate.
- Despliegue con vLLM en produccion: la configuracion multi-LoRA documentada (`--max-lora-rank 128 --max-loras 3`) facilita servir los tres adaptadores del proyecto con un unico base y gestion de memoria compartida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica; al requerir el base Qwen3.5-9B, la inferencia necesita cargar los pesos completos del modelo de 9B mas el adaptador LoRA, cuyo tamano adicional es reducido (repo de 0.0 GB).
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano del base (9B), se situa en la gama de GPUs de datacenter (A100, H100) o consumer de gama alta, aunque no se confirma.
- Compatibilidad con GPU consumer: no confirmada en la documentacion.
- Opciones de despliegue: vLLM con soporte multi-LoRA (`vllm serve Qwen/Qwen3.5-9B --enable-lora --max-lora-rank 128 --max-loras 3 --lora-modules parser=... agent=... think=...`). No se documentan otras opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adapter-parser (este) | LoRA sobre base 9B | no disponible | Adaptador PEFT especializado | Apache 2.0 | Hugging Face |
| adapter-agent-0 (brownyeyez) | LoRA sobre base 9B | no disponible | Adaptador PEFT del mismo pipeline | no disponible | Hugging Face |
| adapter-agent-1 (brownyeyez) | LoRA sobre base 9B | no disponible | Adaptador PEFT del mismo pipeline | no disponible | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | Modelo generativo completo | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el base Qwen/Qwen3.5-9B y el adaptador LoRA conjuntamente.
- Especializado exclusivamente en el esquema de parser del pipeline DataMate; fuera de ese dominio su utilidad es muy limitada.
- Solo soporta vietnamita; no se documenta comportamiento en otros idiomas.
- Entrenado con una unica epoca y datos parcialmente sinteticos, lo que puede limitar la generalizacion a consultas no vistas.
- Riesgo de alucinacion en la generacion de nombres de herramientas o argumentos no validos; se recomienda validar la salida JSON contra el esquema antes de ejecutarla.
- Sin benchmarks publicados ni evaluacion independiente; 0 descargas y 0 likes en el momento de la consulta.
- Uso comercial permitido por la licencia Apache 2.0, pero conviene verificar las condiciones del modelo base Qwen3.5-9B, cuya licencia no se detalla en esta informacion.
- El prompt de inferencia debe coincidir exactamente con el `PROMPT` de `src/datamate/parse.py` y usar `enable_thinking=False`; desviarse de esa configuracion puede degradar la calidad de la salida.
- No se documentan sesgos conocidos ni evaluaciones de robustez o seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brownyeyez/adapter-parser
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptador relacionado: https://huggingface.co/brownyeyez/adapter-agent-0
- Adaptador relacionado: https://huggingface.co/brownyeyez/adapter-agent-1
- Repositorio de origen del adaptador: https://huggingface.co/HuyTT/qwen35-9b-qa
- Repositorio DataMate (rama `release`, `predict.sh`): no disponible como URL en la informacion proporcionada
- Zalo AI Challenge 2026: no disponible como URL en la informacion proporcionada
