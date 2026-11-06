# kataizsolt/qwen35-claude-coder-GGUF

## Resumen

Qwen3.5 Claude Coder es un ajuste fino de Qwen3.5 orientado a actuar como agente autónomo de programación y administración de sistemas dentro de Claude Code, ejecutándose de forma totalmente local. Lo publica el usuario kataizsolt en Hugging Face y se distribuye principalmente como pesos GGUF cuantizados, con variantes MLX de uso interno en Ollama. El objetivo declarado es que el modelo ejecute herramientas en lugar de adivinar, escriba ficheros en lugar de pegar código en el chat y reporte únicamente la salida real de las herramientas, manteniendo un estilo telegráfico con el modo de razonamiento ("thinking") suprimido para actuar de inmediato.

El repositorio incluye dos variantes: una basada en Qwen3.5 4B, pensada para Apple Silicon de 16 GB con un rendimiento aproximado de 30 tok/s, y otra basada en Qwen3.5 9B, de mayor calidad para código en producción, con unos 17 tok/s en 32 GB y 14 tok/s en 16 GB. Ambas declaran 64K de contexto, tool calling nativo y compatibilidad con la API de Anthropic.

La relevancia actual del modelo radica en su enfoque: un agente de código pequeño, ejecutable en hardware de consumo, con ventana de contexto amplia y disciplina estricta de uso de herramientas, pensado para integrarse en flujos de trabajo tipo Claude Code sin depender de servicios en la nube. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles específicos no disponibles) |
| Parámetros totales | 4.659.865.088 (dato de safetensors del repo, correspondiente a la variante de 4B); la variante de 9B no reporta cifra exacta |
| Parámetros activos | no disponible |
| Longitud de contexto | 65.536 tokens (64K) según la model card |
| Tipos de cuantización | GGUF (niveles concretos no especificados); variantes MLX en formato nvfp4 de Ollama |
| Idiomas soportados | inglés (en), polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (principal); MLX solo dentro de Ollama, no publicado como pesos `mlx_lm` independientes |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5, un transformer de la familia Qwen, y se ha ajustado para el rol de agente de codificación y sysadmin dentro de Claude Code. La model card no detalla la composición del dataset de ajuste, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible. Sí se documenta la receta de inferencia: temperatura 0.2, top_p 0.9, top_k 20, repeat_penalty 1.05 y num_ctx 65536, junto con un system prompt que impone actuar con herramientas de inmediato, escribir ficheros, basarse en salida real, ser telegráfico, usar un solo idioma y no derivar al chino.

La innovación principal no es arquitectónica sino de comportamiento: se suprime el modo de razonamiento del modelo base para que ejecute acciones en lugar de deliberar, y se le entrena para que las llamadas a herramientas y los informes se anclen en la salida real de las mismas, reduciendo alucinaciones de hosts y cifras. El ajuste se realizó, según el autor, con ayuda de Claude Opus. No se especifican detalles sobre decodificación especulativa, atención lineal ni otras optimizaciones internas.

## Capacidades

- Generación de texto y código con orientación a tareas de programación y administración de sistemas.
- Tool calling / function calling nativo, con compatibilidad con la API de Anthropic.
- Comportamiento de agente autónomo: ejecución de herramientas, escritura de ficheros y razonamiento multi-paso dentro de Claude Code.
- Modo de razonamiento suprimido para priorizar la acción inmediata y respuestas concisas.
- Capacidad multilingüe limitada a inglés y polaco según los metadatos.
- Informe de resultados anclado en la salida real de las herramientas, con el objetivo declarado de cero emojis y cero alucinaciones en tareas de disco y red.
- No se declaran capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Agente de codificación en terminal: integrado en Claude Code mediante Ollama, el modelo ejecuta comandos, edita ficheros y verifica resultados en el propio entorno local, aprovechando sus 64K de contexto para mantener el estado de la tarea.
- Automatización de tareas de administración de sistemas: gestión de ficheros, comprobación de servicios y operaciones de red en una máquina local, con reporte de la salida real de cada comando para evitar informes inventados.
- Asistente de refactorización local: con la variante de 9B y 32 GB de RAM, puede sostener sesiones de edición multi-fichero con calidad de código apta para producción y sin enviar código a la nube.
- Desarrollo en portátiles Apple Silicon: la variante de 4B, con unos 30 tok/s en 16 GB, permite un agente ligero y rápido para tareas de codificación cotidianas en hardware de consumo.
- Pipelines de CI/CD con tool calling: el soporte nativo de llamadas a funciones y la API compatible con Anthropic facilitan su integración en scripts que invocan herramientas externas y consumen la salida estructurada.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en local vía Ollama, es adecuado para equipos que no pueden enviar código ni datos de sistemas a servicios externos.
- Prototipado de agentes en polaco e inglés: los dos idiomas declarados permiten construir asistentes técnicos bilingües para esos mercados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta velocidades de inferencia observadas en hardware concreto: aproximadamente 30 tok/s para la variante de 4B en 16 GB de Apple Silicon, y aproximadamente 17 tok/s en 32 GB y 14 tok/s en 16 GB para la variante de 9B.

## Requisitos de hardware

- VRAM/RAM estimada: la variante de 4B está pensada para 16 GB de memoria unificada en Apple Silicon; la de 9B requiere 32 GB para su rendimiento declarado y funciona con 14 tok/s en 16 GB.
- GPU recomendadas: el autor valida el modelo en Mac Studio M2 (32 GB) y Mac Mini M4 (16 GB y 32 GB) con GPU Metal. No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: cabe en Apple Silicon de 16 GB con la variante de 4B; la de 9B es viable en 16 GB con menor throughput.
- Despliegue: Ollama es la vía documentada (`ollama run rafw007/qwen35-claude-coder:9b` y `ollama launch claude --model ...`). Los pesos GGUF permiten otros runners GGUF, aunque no se validan explícitamente en la model card.
- Latencia y throughput: ~30 tok/s (4B, 16 GB), ~17 tok/s (9B, 32 GB) y ~14 tok/s (9B, 16 GB), medidos en Ollama 0.24 con GPU Metal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5 Claude Coder (este) | 4B y 9B (variantes) | 64K | Agente de código local para Claude Code | Apache 2.0 | GGUF en HF y Ollama; MLX solo interno |
| Qwen3.5 9B (base) | 9B | no disponible en la información | Modelo generalista | Apache 2.0 (según herencia declarada) | Hugging Face |
| Qwen3.5 4B (base) | 4B | no disponible en la información | Modelo generalista | Apache 2.0 (según herencia declarada) | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Idiomas limitados a inglés y polaco; el system prompt incluye una instrucción explícita para no derivar al chino, lo que sugiere riesgo de cambio de idioma en el modelo base.
- El ajuste prioriza la acción sobre el razonamiento (thinking suprimido), lo que puede degradar tareas que requieran deliberación profunda.
- No se han publicado benchmarks; el rendimiento declarado se basa en pruebas cualitativas del autor en tareas de disco y red.
- Las variantes MLX solo se han probado dentro de una instalación local de Ollama, en formato nvfp4, y no se distribuyen como pesos `mlx_lm` independientes ni se han validado fuera de Ollama.
- El repositorio tiene un volumen de descargas bajo (456) y ningún "like", lo que limita la validación comunitaria.
- Riesgo de alucinación inherente a los modelos de lenguaje; el autor afirma mitigarlo con anclaje en salida real de herramientas, pero no aporta métricas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5 y de los datos de ajuste, no detallados.
- Los datos de parámetros del repo (4.659.865.088) corresponden a la variante de 4B; no hay cifra exacta publicada para la de 9B.

## Enlaces

- Hugging Face: https://huggingface.co/kataizsolt/qwen35-claude-coder-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Ollama (variante 9B): `rafw007/qwen35-claude-coder:9b`
- Ollama (variante 4B): `rafw007/qwen35-claude-coder:4b`
