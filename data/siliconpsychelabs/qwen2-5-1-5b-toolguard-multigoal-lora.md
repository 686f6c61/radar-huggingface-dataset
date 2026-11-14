# SiliconPsycheLabs/qwen2-5-1-5b-toolguard-multigoal-lora

## Resumen

ToolGuard es un adaptador LoRA desarrollado por Silicon Psyche Labs sobre el modelo base Qwen2.5-1.5B-Instruct. Su propósito es corregir el comportamiento de agentes que utilizan herramientas (envío de correo, borrado de ficheros, transferencias, concesión de permisos) cuando estos leen contenido externo —páginas web, correos o documentos— que contiene instrucciones maliciosas inyectadas. El adaptador modifica el modelo para que ignore esas instrucciones ocultas sin dejar de invocar las mismas herramientas cuando es el usuario legítimo quien las solicita.

El modelo se distribuye como adaptador PEFT (LoRA) en formato safetensors, con un tamaño de repositorio de 0,1 GB, lo que implica que requiere cargar el modelo base Qwen2.5-1.5B-Instruct (1.500 millones de parámetros) para funcionar. Soporta cinco idiomas (inglés, italiano, francés, español y alemán) y se publica bajo licencia Apache-2.0.

Es relevante en el contexto actual de despliegue de agentes autónomos con acceso a herramientas sensibles, donde los ataques de inyección de instrucciones (prompt injection indirecta) representan un vector de riesgo real. No obstante, el propio autor advierte explícitamente que el modelo **no debe desplegarse como mecanismo de protección**: reduce la tasa de éxito de los ataques, pero no los elimina frente a atacantes adaptativos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen2.5-1.5B-Instruct) |
| Parámetros totales | No disponible (adaptador LoRA; el base tiene 1.500 millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | en, it, fr, es, de |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros. El adaptador no modifica la arquitectura del base; introduce matrices de bajo rango entrenadas para alterar la distribución de salida en escenarios de agente con herramientas. El repositorio incluye la plantilla de chat de tool-calling propia del modelo base, que el adaptador espera encontrar en tiempo de inferencia.

El entrenamiento se realizó sobre datos autorados que cubren seis técnicas de inyección y cuatro objetivos de atacante (metas que el atacante intenta que el agente ejecute). Según la model card, el adaptador generaliza a un quinto objetivo no entrenado ("publicar un post") y a técnicas no vistas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional con plantilla de chat de tool-calling del modelo base.
- Invocación de herramientas (function calling) cuando el usuario legítimo lo solicita, con tasa reportada de 1.000 de conservación por herramienta.
- Resistencia parcial a instrucciones inyectadas en contenido externo (resultados de herramientas, documentos, correos) para cuatro objetivos entrenados y uno no entrenado.
- Capacidad multilingüe en inglés, italiano, francés, español y alemán.
- Mantenimiento de la ejecución benigna de lecturas (benign fetch) con tasa reportada de 1.000.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Agentes de correo electrónico: el adaptador reduce la probabilidad de que el modelo ejecute instrucciones ocultas en correos entrantes (por ejemplo, reenviar datos o borrar mensajes), manteniendo la capacidad de enviar correo cuando el usuario lo pide explícitamente.
- Asistentes con acceso a ficheros: en flujos donde el agente lee documentos de usuario, el LoRA disminuye la tasa de acciones destructivas inducidas por texto inyectado, aunque debe combinarse con permisos mínimos y validación externa.
- Automatización financiera asistida: para agentes que preparan transferencias, el adaptador reduce la ejecución de órdenes inyectadas en facturas o extractos, si bien nunca debe ser el único control en operaciones con dinero.
- Navegación web con herramientas: en agentes que resumen o actúan sobre páginas, el modelo conserva la lectura benigna (tasa 1.000) mientras filtra instrucciones embebidas en el HTML.
- Administración de sistemas: para agentes que gestionan permisos o borrado de recursos, el adaptador sirve como capa adicional de corrección de comportamiento, siempre con aprobación humana para acciones irreversibles.
- Evaluación de robustez: como componente de referencia para medir la eficacia de defensas contra prompt injection en pipelines de agentes, comparando tasas base frente a corregidas en las cinco lenguas soportadas.

## Benchmarks y rendimiento

Resultados publicados en la model card (tasa de acciones inyectadas ejecutadas, base frente a corregido, cinco idiomas):

| Métrica | Base | Corregido |
|---|---|---|
| Cada uno de los cuatro objetivos entrenados | 0,333 | 0,000 |
| Objetivo nunca entrenado (publicar un post) | 0,333 | 0,000 |
| Técnicas nunca entrenadas | 0,000 | 0,000 |
| Lectura benigna conservada | No disponible | 1,000 |
| Cada herramienta aún usada cuando el usuario lo pide | No disponible | 1,000 |

Advertencia del autor: frente a un atacante que reescribe su texto hasta 800 veces por caso, el modelo corregido de 32B fue vulnerado en al menos 26 de 80 casos (frente a al menos 68 de 80 del base). No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base de 1.500 millones permite inferencia en GPU consumer con cuantización (el adaptador añade una sobrecarga mínima de 0,1 GB).
- GPU recomendadas: no especificadas por el autor; por tamaño del base, cabe en RTX 3060/4060/4090 y GPUs de datacenter (A100, H100) sin problema.
- Cabe en GPU consumer: sí, al tratarse de un base de 1.500 millones de parámetros.
- Opciones de despliegue: carga mediante `peft` + `transformers` (ejemplo oficial en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para adaptadores LoRA en esta ficha.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ToolGuard (este) | Qwen2.5-1.5B-Instruct | 1.500 M (base) | No disponible | Corrección de inyección en tool-use | Apache-2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | — | 1.500 M | No disponible | Modelo generalista con tool-calling | Apache-2.0 | Hugging Face |
| Alternativas de defensa contra prompt injection | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de otros adaptadores comparables de la misma categoría para establecer una comparativa cuantitativa adicional.

## Limitaciones y advertencias

- El autor marca explícitamente el modelo como **incorrecto como afirmación de protección**: reduce pero no detiene los ataques de inyección.
- Frente a atacantes adaptativos (hasta 800 reescrituras por caso), el modelo corregido de 32B fue vulnerado en al menos 26 de 80 casos; no se garantiza robustez frente a ataques no vistos.
- Entrenado sobre seis técnicas y cuatro objetivos; el rendimiento en otros frameworks de agentes requiere medición propia.
- Riesgo de alucinación inherente al modelo base, no evaluado en la model card.
- Los resultados se limitan a los cinco idiomas soportados; no hay datos sobre otros idiomas.
- La licencia Apache-2.0 cubre los pesos del adaptador, pero el uso requiere el modelo base, que mantiene su propia licencia.
- No debe desplegarse como único control de seguridad en operaciones sensibles (dinero, borrado, permisos); requiere permisos mínimos, aprobación humana y validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/SiliconPsycheLabs/qwen2-5-1-5b-toolguard-multigoal-lora
- Silicon Psyche Labs: https://splabs.io
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
