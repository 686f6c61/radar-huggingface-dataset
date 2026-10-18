# Bluebarrels/easylm-personalities-bonsai-2-9b

## Resumen

`easylm-personalities-bonsai-2-9b` es un adapter LoRA PEFT desarrollado por Bluebarrels sobre el modelo ternario Bonsai 2 9B, distribuido en formato GGUF por prism-ml. No es un modelo completo: el repositorio contiene un adapter de aproximadamente 5,1 MB (56 tensores, 417.775 elementos no cero en FP16) que especializa el base hacia personalidades, consejo y diálogo socrático. El autor lo presenta como parte de una familia EasyLM/Hydra con cuatro escalones (2B, 4B, 9B y 27B); este escalón de 9B se posiciona como el agente por defecto para Hydra y como "workhorse" de 2 GB.

La propuesta técnica es un LoRA de rango 16 y alpha 32 sobre las proyecciones de atención y MLP, entrenado con un corpus de 498 turnos de chat para inyectar 151 "Council of Kami", 75 voces de mentoría y un protocolo de interrogación socrática con estados S0-S6. El autor declara una ventana de 262.144 tokens y capacidades de orquestación de herramientas mediante Hydra y MCP. La relevancia práctica está en su huella mínima y en la carga en WebGPU desde el navegador, que permite probar un asistente local sin GPU dedicada, según el autor.

Ahora bien, la información disponible es una model card autoeditada, sin benchmarks, sin evaluación independiente y con 0 descargas y 0 me gusta en el momento de la consulta. Los datos de contexto, corpus y capacidades deben tratarse como declaraciones del autor, no como resultados verificados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Autor | Bluebarrels |
| Tarea | text-generation |
| Arquitectura | Adapter LoRA/PEFT sobre el modelo base ternario Bonsai 2 9B; la arquitectura interna del base no se documenta. |
| Parámetros totales | 9B nominales en el modelo base; adapter LoRA con 417.775 elementos no cero en FP16 (56 tensores, 842.880 bytes). |
| Parámetros activos | No aplica; no se describe como MoE. |
| Longitud de contexto | 262.144 tokens (declarado por el autor; no verificado). |
| Tipos de cuantización | Adapter en FP16; base en GGUF ternario. No se detallan variantes Q4/Q8/etc. |
| Idiomas soportados | No disponible; el repositorio no declara idiomas. |
| Licencia | AGPL-3.0 para el adapter; la licencia del modelo base no se indica. |
| Formato de pesos | SafeTensors (`adapter_model.safetensors`) y GGUF (modelo base). |
| Tamaño del adapter | ~5,1 MB declarados; el repositorio figura con 0,0 GB. |
| Rango / alpha / dropout | r = 16, alpha = 32, dropout = 0,05. |
| Módulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`. |
| Dataset | `Bluebarrels/easylm-training-corpus` (`adapter_personalities_chatml.jsonl`, 498 turnos). |
| Base WebGPU/MLC referenciada | `mlc-ai/Qwen3.5-9B-q4f16_1-MLC` (según el autor). |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del base; solo identifica `prism-ml/Ternary-Bonsai-2-9B-gguf` como modelo ternario de 9B y añade un adapter LoRA PEFT. La model card no especifica si el base es transformer, MoE, SSM o híbrido, por lo que la arquitectura interna no se puede confirmar. El adapter se aplica a siete módulos (atención y MLP) con r=16, alpha=32 y dropout=0,05. La carga prevista es un runtime EasyLM/WebGPU que parsea SafeTensors y aplica los pesos LoRA en cliente; también se referencia una base MLC Qwen3.5-9B q4f16 para WebGPU, lo que introduce ambigüedad sobre el base exacto en cada backend.

El entrenamiento declarado usa `Bluebarrels/easylm-training-corpus`, en concreto `adapter_personalities_chatml.jsonl` con 498 turnos. El corpus se describe como 92 "Sovereign Academic Stacks", 369 tablas de hechos con 4.634 filas verificadas, 151 libros del Council of Kami, un grafo Alice 1.0 de 46.025 nodos y 19.842 aristas, seis modos de diagnóstico de confusión C1-C6, 12 formas de pregunta Q01-Q12 y una máquina de estados socrática S0-S6. También se citan el "ether-fishing Why-Ledger" (W0001-W0003) y el currículo Hydra v1.2.2. No se indica número de tokens, composición porcentual, ni si hubo RLHF, DPO o evaluación de seguridad.

## Capacidades

- Generación de texto y conversación multi-turno; no se declaran idiomas ni evaluaciones de calidad.
- Interrogación socrática: estados S0-S6, seis modos de diagnóstico C1-C6 y 12 formas de pregunta Q01-Q12.
- Role-play y consejo con 151 "Council of Kami" y 75 voces de mentoría EasyLM.
- Síntesis de decisiones con el "ether-fishing Why-Ledger": W0001 (por qué antes de cómo), W0002 (DAG de supersesión solo de añadido) y W0003 (puerta de verificación empírica de cinco comprobaciones).
- Orquestación de agentes y herramientas mediante Hydra: `hydra agent`, `hydra swarm`, `hydra serve` en el puerto 7777, cápsulas `@[hydra]` y modos de contexto recall/compact/sliding.
- Permisos de agente: manual, accept_edits, plan y bypass, según el autor.
- Razonamiento STEM y apoyo académico sobre 92 stacks y 4.634 filas de referencia; sin benchmarks.
- Código: no hay benchmark; el corpus declara "computing" y el ecosistema Hydra incluye inspección de repositorios, pero no se documenta HumanEval ni una evaluación de programación.
- Carga en WebGPU y ejecución local en navegador mediante un loader SafeTensors/LoRA.
- No se declaran visión, audio ni un modo "thinking" general; el 27B de la familia menciona vision-tower, pero este 9B no.
- Tool calling/function calling: se cita MCP y Hydra, pero no hay esquema nativo ni evaluación publicada.

## Casos de uso

- Tutor socrático local en navegador: el base de ~2 GB y el adapter de ~5,1 MB permiten ejecución en WebGPU en portátiles y Chromebooks, según el autor; la máquina S0-S6 guía la conversación. Adecuado para prácticas sin conexión, con la salvedad de que el contexto largo puede disparar el KV cache.
- Preparación de entrevistas técnicas y oposiciones: los modos C1-C6 permiten diagnosticar confusiones y reformular preguntas; útil para simulacros multi-turno con corrección humana.
- Panel de ideación y contraste de perspectivas: 151 voces del Council of Kami y 75 mentores permiten generar puntos de vista alternativos en diseño, ética o historia; requiere moderación para no tomar las voces como autoridad.
- Documentación de decisiones de ingeniería: el Why-Ledger W0001-W0003 estructura el "por qué" antes del "cómo", mantiene un DAG append-only y aplica una puerta de verificación; encaja en revisiones de arquitectura y postmortems.
- Agente local de mantenimiento de repositorios: Hydra agent con permisos y MCP puede inspeccionar estado, ejecutar gates deterministas y proponer cambios; el tamaño 9B limita la fiabilidad en tareas largas, así que conviene usar permisos restrictivos.
- Apoyo a derivaciones STEM: el corpus declara matemáticas, física, química, biología, computación e ingeniería; sirve para borradores y comprobaciones, no para sustituir una verificación simbólica o numérica.
- Mentoría de escritura multi-turno: 75 voces de coaching y 498 turnos de chat permiten practicar estructura argumental y revisión de ensayos; la calidad en castellano no está garantizada.
- Despliegue offline con privacidad: al ejecutarse en cliente con WebGPU y pesos locales, evita enviar datos a la nube; útil en entornos educativos o industriales con restricciones de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, evaluación de agentes ni comparativas medidas.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Evaluación de tool calling | no disponible |
| Evaluación multilingüe | no disponible |

## Requisitos de hardware

- Pesos: ~2 GB para el base ternario y ~5,1 MB para el adapter, según el
