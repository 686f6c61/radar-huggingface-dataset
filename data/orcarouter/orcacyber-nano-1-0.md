# orcarouter/OrcaCyber-Nano-1.0

## Resumen

OrcaCyber Nano 1.0 es un modelo de lenguaje y visión de 27B parámetros desarrollado por orcarouter (OrcaRouter AI), orientado específicamente a trabajo de seguridad defensiva: ingeniería inversa, análisis de vulnerabilidades, revisión de código seguro, triaje e respuesta a incidentes. Se distribuye en formato GGUF para su ejecución local con llama.cpp u Ollama, lo que permite procesar binarios propietarios, trazas y código interno sin que los datos salgan del equipo. Está construido sobre el modelo base Qwen/Qwen3.8-27B mediante cuantización.

El modelo mantiene capacidades generales de razonamiento y programación, además de visión (entrada de imágenes, pipeline `image-text-to-text`), soporte de function calling y una ventana de contexto de 262K tokens según la model card. Su propuesta principal es ofrecer un asistente de seguridad que funcione en hardware propio, incluso en entornos aislados (air-gapped), con un identificador propio de modelo ("OrcaCyber Nano 1.0 AI Defense Model").

El acceso al repositorio está restringido en Hugging Face: requiere aceptar las condiciones del autor. La licencia declarada es `other` con nombre `qwen`, heredada del modelo base, y los idiomas soportados según la model card son inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de Qwen/Qwen3.8-27B; arquitectura del base no detallada en la información proporcionada) |
| Parámetros totales | 1.924.404.480 según safetensors; la model card indica 27B (discrepancia no resuelta en la información disponible) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262K tokens (según la model card) |
| Tipos de cuantización | GGUF (niveles concretos no disponibles) |
| Idiomas soportados | en, zh |
| Licencia | `other` (license_name: qwen); acceso restringido (gated) |
| Formato de pesos | GGUF (librería: gguf) |

## Arquitectura y entrenamiento

No se detalla en la información proporcionada la arquitectura interna del modelo (tipo de transformer, uso de atención lineal, decodificación especulativa u otras innovaciones). El modelo se presenta como una cuantización del base Qwen/Qwen3.8-27B, con relación `quantized` respecto a dicho base. La model card menciona la etiqueta `mtp` (multi-token prediction), lo que sugiere soporte de predicción multi-token, pero no se amplía el detalle técnico.

Tampoco se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La model card indica que el harness de evaluación, los ajustes y las tablas completas de resultados "se están finalizando", por lo que los datos de entrenamiento y la metodología de post-entrenamiento no están disponibles.

## Capacidades

- Generación de texto y razonamiento general, incluyendo matemáticas y resolución de problemas (se reportan resultados en MATH-500, GSM8K, AIME 2025 y GPQA Diamond).
- Generación y análisis de código, con resultados reportados en HumanEval+, LiveCodeBench, MBPP+, BigCodeBench y SWE-bench.
- Ingeniería inversa y descompilación: interpretación de desensamblado y salida de descompiladores, recuperación de la función de una rutina stripped, nombrado de variables y explicación de flujo de control.
- Análisis de vulnerabilidades: razonamiento sobre explotabilidad, identificación de rutas inseguras y propuesta de parches.
- Revisión de código seguro: auditoría de diffs y ficheros en busca de inyección, problemas de seguridad de memoria y bugs lógicos.
- Triaje: lectura de logs, alertas y capturas de paquetes para separar señal de ruido.
- Visión: entrada de imágenes como capturas de pantalla, capturas de Ghidra/IDA y diagramas de red (pipeline `image-text-to-text`).
- Soporte de function calling (etiqueta `function-calling`).
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Ejecución local offline con llama.cpp/Ollama, apta para entornos air-gapped.

## Casos de uso

- Ingeniería inversa de binarios: pegar desensamblado o salida de un descompilador para que el modelo reconstruya el propósito de una función stripped, nombre variables y explique el flujo de control; al ejecutarse en local, el binario propietario no abandona la máquina.
- Análisis de vulnerabilidades: introducir fragmentos de código o rutas de ejecución sospechosas para razonar sobre explotabilidad, localizar la ruta insegura y proponer un parche concreto.
- Revisión de código seguro en CI: auditar diffs y ficheros en busca de inyección, errores de seguridad de memoria y bugs lógicos antes de fusionar cambios, aprovechando el soporte de function calling para integrarse en pipelines.
- Triaje de incidentes: procesar logs, alertas y capturas de paquetes para priorizar eventos y separar señal de ruido, con contexto largo de 262K tokens para volcados extensos.
- Análisis visual de artefactos de seguridad: subir capturas de Ghidra/IDA, diagramas de red o pantallas de herramientas para que el modelo las interprete junto con el texto.
- Asistente local de programación y razonamiento: usar el modelo como copiloto de código y resolución de problemas en equipos sin conexión o con requisitos de confidencialidad, manteniendo sus capacidades generales.
- Entornos air-gapped: despliegue en máquinas aisladas donde no se permite enviar código, logs ni binarios a servicios en la nube.

## Benchmarks y rendimiento

Resultados reportados en la model card (el autor indica que el harness y las tablas completas están pendientes de finalizar):

| Benchmark | Puntuación |
|---|---:|
| MATH-500 | 98,60% |
| GSM8K | 97,50% |
| AIME 2025 | 96,23% |
| HumanEval+ | 93,29% |
| LiveCodeBench | 92,23% |
| GPQA Diamond | 88,28% |
| MBPP+ | 84,66% |
| IFEval | 82,81% |
| SWE-bench | 78,4% |
| Terminal-Bench 2.1 | 72,5% |
| IFBench | 56,33% |
| BigCodeBench | 49,82% |

No se proporcionan resultados de benchmarks específicos de ciberseguridad (por ejemplo, CyberGym) para este modelo en la información disponible; la model card solo menciona un 98,01% pass@1 en CyberGym Level 1 para el modelo distinto OrcaCyber Zero 1.5.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; para un modelo de 27B en GGUF, la VRAM depende del nivel de cuantización elegido (no se detallan los niveles en la información proporcionada).
- GPU recomendadas: no disponibles en la información proporcionada.
- Ejecución en GPU de consumo: no confirmado; el autor enfatiza la ejecución "en tu portátil" mediante GGUF y llama.cpp, pero no se especifican modelos de GPU concretos.
- Opciones de despliegue: llama.cpp y Ollama (mencionados explícitamente); también se menciona compatibilidad con endpoints (`endpoints_compatible`) y una API compatible con OpenAI a través de OrcaRouter.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de modelos comparables de la misma categoría (asistentes de seguridad de ~27B en GGUF) ni de sus especificaciones para establecer una comparación rigurosa. El propio autor referencia como alternativa de su catálogo OrcaCyber Zero 1.5, pero no se aportan sus parámetros, contexto ni licencia. Comparativa: no disponible.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face.
- Licencia `other` con nombre `qwen`: las condiciones exactas de uso comercial dependen de la licencia del modelo base Qwen/Qwen3.8-27B y deben revisarse antes de producción.
- Idiomas limitados a inglés y chino según la model card; el rendimiento en castellano no está documentado.
- Discrepancia de tamaño: la model card indica 27B, mientras que el dato de safetensors registra 1.924.404.480 parámetros; conviene verificar el artefacto concreto antes de dimensionar el hardware.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente crítico en análisis de vulnerabilidades y revisión de código, donde una conclusión errónea puede tener consecuencias de seguridad.
- Los benchmarks reportados proceden del autor y el propio autor indica que el harness y las tablas completas están pendientes de finalización; deben tratarse como provisionales.
- No se documentan sesgos conocidos ni evaluaciones de seguridad del modelo en la información disponible.
- El uso en tareas ofensivas no está descrito en la model card, que se posiciona explícitamente como defensiva; el alcance permitido depende de la licencia y de las condiciones de acceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orcarouter/OrcaCyber-Nano-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- OrcaRouter AI Gateway: https://www.orcarouter.ai
- Página de modelos de OrcaRouter: https://www.orcarouter.ai/models
- OrcaCyber Zero 1.5: https://www.orcarouter.ai/models/orca/orcacyber-zero-1.5
- Orca Connect: https://www.orcarouter.ai/solutions/orca-connect
- X (Twitter): https://x.com/OrcaRouter
- Discord: https://discord.gg/yAh6Tex6kx
- GitHub: https://github.com/Continuum-AI-Corp
