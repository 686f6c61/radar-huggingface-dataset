# maureesewilliams/baby-boon

## Resumen

Baby Boon es un modelo de conversación social de pequeno tamano desarrollado por maureesewilliams, consistente en un ajuste fino mediante LoRA (rango 8) sobre Qwen/Qwen3-1.7B, fusionado y cuantizado a Q4_K_M. El modelo está pensado para ejecutarse localmente en CPU de escritorio, con un archivo GGUF de 1,1 GB que requiere aproximadamente 2 GB de RAM y alcanza unos 30 tokens por segundo en un Ryzen 9 9900X con 6 hilos. Su salida añade a cada respuesta una indicación de tono y expresión para su uso con voz o avatar.

El modelo se distribuye junto con una librería Python (`baby-boon`) que orquesta la descarga, la verificación sha256 del GGUF y el arranque de `llama-server` de llama.cpp, devolviendo una línea JSON por turno con los campos `text`, `tone`, `expression`, `intensity` y `cue_valid`. Incorpora una capa de protecciones (guards) por turno orientadas a percepción, hechos y salud.

Es relevante por su enfoque explícito en despliegue local de bajos requisitos y por documentar de forma transparente sus fallos de seguridad: en la propia model card se reconoce que, con las protecciones activas, 5 de 12 preguntas de salud recibieron consejos inseguros y 3 de 8 emergencias obtuvieron respuestas dañinas. El autor declara explícitamente que no debe usarse para fines médicos, de emergencia o de crisis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) con ajuste fino LoRA rango 8 fusionado |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); adaptador LoRA en precision original |
| Idiomas soportados | en (inglés únicamente) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (modelo cuantizado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer de 1.720.574.976 parámetros, sobre el que se aplica un ajuste fino con LoRA de rango 8 (PEFT 0.18.0), con una tasa de aprendizaje de 8e-5 y una sola época. El adaptador se fusiona con el modelo base y se convierte a GGUF Q4_K_M mediante llama.cpp, con procedencia registrada en `manifest.json` (revisión del base, versión de llama.cpp, conversor y hashes de archivos). La pérdida de validación pasó de 5,74 a 1,68.

El conjunto de entrenamiento consta de 782 conversaciones que generan 1.350 filas de entrenamiento (variantes simples y con indicaciones de tono/expresión). De ellas, 422 conversaciones provienen de Qwen3-4B-Instruct-2507 actuando como profesor local, filtradas por reglas de estilo y revisadas; las 360 restantes fueron escritas por Claude (claude-opus-5-5) en sesiones de Claude Code. Los temas cubren ayuda práctica, dar espacio, situaciones de dos partes, baja energía, honestidad sobre la percepción y derivación de preguntas de salud. No se emplearon conjuntos de datos conversacionales externos ni datos privados o personales.

## Capacidades

- Generación de texto conversacional en inglés, orientada a chat social de acompanamiento.
- Emisión de indicaciones de tono y expresión por respuesta (`tone`, `expression`, `intensity` de 0 a 2, `cue_valid`), pensadas para síntesis de voz o avatares.
- Conversaciones multi-turno con contexto gestionado por el cliente que arranca `llama-server`.
- Protecciones integradas por turno en tres áreas: percepción (no afirmar que ve o escucha el entorno del usuario), hechos (conversiones de cocina y temperatura calculadas y proporcionadas al modelo) y salud (derivar en lugar de juzgar; sustitución por línea fija de "llamar a emergencias" ante banderas rojas como no respirar, falta de respuesta, convulsión o atragantamiento).
- Ejecución en CPU sin GPU, con dependencias mínimas (cliente Python 3.10+ sin dependencias).
- No se documentan capacidades de tool calling, function calling, agentes, matemáticas avanzadas, visión ni audio.

## Casos de uso

- Chat social local de acompanamiento: el modelo mantiene conversaciones multi-turno en inglés y devuelve tono y expresión en cada turno, lo que permite integrarlo en interfaces con voz o avatar sin depender de servicios en la nube.
- Prototipado de asistentes conversacionales en hardware modesto: con 1,1 GB de GGUF y unos 2 GB de RAM, sirve para validar flujos de diálogo en portátiles o equipos de escritorio sin GPU antes de escalar a modelos mayores.
- Prácticas de ayuda cotidiana con conversiones: las protecciones de hechos calculan conversiones de cocina y temperatura y las inyectan en el contexto, lo que reduce errores en tareas domésticas sencillas.
- Investigación sobre seguridad conversacional: la model card publica resultados de evaluaciones con rúbrica fija y comparación entre versiones (v12 frente a v14), lo que lo hace útil como caso de estudio de mitigaciones y de fallos residuales en modelos pequenos.
- Integración en pipelines de voz o avatares: el campo `intensity` (0-2) y `cue_valid` permiten a un motor de TTS o de animación modular la expresividad de la respuesta de forma programática.
- Evaluación de despliegue con llama.cpp en CPU: sirve para medir latencia y throughput reales (unos 30 tokens/s en Ryzen 9 9900X con 6 hilos) en entornos sin acelerador.
- Base para ajustes LoRA posteriores: el adaptador PEFT incluido en `adapter/` con tokenizador y plantilla de chat permite reentrenar o adaptar el modelo a otros dominios partiendo de Qwen3-1.7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye una evaluación propia sobre un conjunto de salud (12 preguntas de salud, 6 desahogos de salud, 8 emergencias y 14 controles), comparando la versión anterior v12 con esta v14, ambas con las mismas protecciones:

| Métrica | v12 | v14 (este modelo) |
|---|---|---|
| Respuestas inseguras | 11 | 8 |
| Críticos en emergencias | 5 | 3 |
| Consejo de salud inseguro | 6 de 12 | 5 de 12 |
| Preferido por el evaluador | 8 | 15 (p = 0,21) |

Cada evaluación se realizó con un conjunto de prompts nuevo escrito por un agente de IA distinto que no había visto el repositorio, puntuado a ciegas por otro agente contra una rúbrica fija, sin revisión humana. Una segunda semilla de entrenamiento dio la misma dirección. No se ha vuelto a medir el modelo en los conjuntos de chat general anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo documentado (ejecución en CPU); el GGUF Q4_K_M ocupa 1,1 GB en disco y requiere unos 2 GB de RAM.
- GPU recomendadas: no se documentan; el modelo está etiquetado para CPU.
- Cabe en GPU de consumo: no disponible (no se han publicado medidas de VRAM para ejecución en GPU).
- Opciones de despliegue: llama.cpp mediante `llama-server` (instalable con `winget install llama.cpp` o `brew install llama.cpp`), cliente Python `baby-boon` (Python 3.10+, sin dependencias) y GGUF compatible con el ecosistema llama.cpp.
- Latencia y throughput estimados: aproximadamente 30 tokens por segundo en un Ryzen 9 9900X con 6 hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Baby Boon (este modelo) | 1.720.574.976 | no disponible | en | apache-2.0 | safetensors (LoRA), GGUF Q4_K_M | Ajuste LoRA de Qwen3-1.7B para chat social en CPU |
| Qwen/Qwen3-1.7B (base) | 1.720.574.976 | no disponible en la información proporcionada | multilingüe (según el modelo base; no detallado aquí) | apache-2.0 | safetensors, GGUF (ecosistema) | Modelo base sin el ajuste conversacional ni las protecciones |
| Qwen3-4B-Instruct-2507 | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible | Usado como profesor local para generar 422 conversaciones del dataset |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no debe usarse para fines médicos, de emergencia o de crisis.
- Con las protecciones activas, 5 de 12 preguntas de salud recibieron consejos inseguros y 3 de 8 emergencias obtuvieron una respuesta dañina; el GGUF sin las protecciones del paquete `baby-boon` obtiene resultados peores.
- Fallos conocidos documentados: una pila de botón ingerida y un corte que no deja de sangrar reciben respuestas dañinas; una reacción alérgica que el chequeo de banderas rojas no detecta se deriva a un farmacéutico; las preguntas de salud aún reciben dosis o medicamentos nombrados.
- En los conjuntos de chat general anteriores, la versión v12 ayudó a enganar a un tercero dos veces en 30 prompts y cometió errores en algunos datos de cocina; esta versión no se ha vuelto a medir en esos conjuntos.
- Solo soporta inglés.
- La evaluación se realizó íntegramente con agentes de IA, sin revisión humana, lo que limita la validez de las conclusiones sobre seguridad.
- Riesgo de alucinación no cuantificado fuera de los conjuntos evaluados; las protecciones de hechos solo cubren conversiones de cocina y temperatura.
- Licencia apache-2.0, que permite uso comercial, pero las advertencias de seguridad del autor desaconsejan usos sanitarios o de emergencia.
- No se documentan la longitud de contexto, los sesgos conocidos ni el rendimiento en GPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maureesewilliams/baby-boon
- Repositorio y registro de investigación: https://github.com/MMWilliams/baby-boon
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
