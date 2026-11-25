# Outlier-Ai/Yi-Coder-9B-Chat-MLX-4bit

## Resumen

Yi-Coder-9B-Chat-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo 01-ai/Yi-Coder-9B-Chat, publicada por Outlier-Ai para su ejecución local en Apple Silicon (chips M1, M2, M3 y M4) mediante el framework MLX de Apple. El modelo base es un transformer decoder-only de 8.829.407.232 parámetros (aproximadamente 8,8 mil millones) especializado en generación de código y conversación, desarrollado originalmente por 01.AI. Esta versión reduce el peso del repositorio a unos 5,0 GB, lo que permite ejecutarlo en Macs de gama alta con memoria unificada sin depender de la nube.

La relevancia de esta conversión radica en que traslada un modelo de código de casi 9B a un formato on-device viable en hardware de consumo Apple, manteniendo la licencia Apache 2.0 del original y sin requerir claves de API ni conexión a internet. Está pensada para desarrolladores que necesitan un asistente de código privado, offline y con capacidad conversacional multi-turno en un portátil o en un Mac mini.

El modelo conserva las capacidades del base: generación de código en múltiples lenguajes, razonamiento sobre fragmentos de código, refactorización y respuesta a instrucciones en inglés y chino. La conversión la publica el equipo de Outlier, que también distribuye una app macOS gratuita para inferencia MLX; conviene señalar que esta conversión concreta no se incluye en la app, según indica la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Yi, base 01-ai/Yi-Coder-9B-Chat) |
| Parametros totales | 8.829.407.232 (~8,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit (MLX 4bit) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Yi, en su variante Yi-Coder-9B-Chat, orientada a código y conversación. Esta publicación es una cuantizacion a 4 bits realizada con MLX, el framework de Apple para inferencia y entrenamiento en chips Apple Silicon, que aprovecha Metal para acelerar la ejecucion. El repositorio emplea safetensors como formato de pesos y la libreria mlx / mlx-lm para su carga.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el proceso de alineacion (RLHF/DPO) ni innovaciones tecnicas especificas del modelo base. La model card de esta conversion se limita a indicar que hereda los campos de licencia y modelo base del original y a documentar el uso con mlx-lm. Cualquier dato sobre el entrenamiento original debe consultarse en la model card de 01-ai/Yi-Coder-9B-Chat.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion (la model card incluye ejemplos de Python y SQL).
- Conversacion multi-turno en modo chat/instruct.
- Razonamiento sobre fragmentos de codigo: refactorizacion, deteccion de bugs y explicacion de logica.
- Generacion de consultas SQL y tareas de analisis de datos.
- Capacidades multilingues limitadas a ingles y chino (en, zh).
- Ejecucion local y offline en Apple Silicon, sin nube ni claves de API.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo privado en el portatil: un desarrollador puede cargar el modelo con mlx-lm y usarlo para autocompletar y explicar funciones sin enviar codigo propietario a servicios externos, gracias a la ejecucion on-device y a los ~5 GB del repositorio.
- Refactorizacion y revision de codigo: el modelo responde a instrucciones del tipo "refactoriza esto para legibilidad y senala un bug", lo que encaja en flujos de revision previa a commit.
- Generacion de SQL para analitica: adecuado para escribir consultas como rankings de usuarios por valor de compra en una ventana temporal, segun el ejemplo de la model card.
- Prototipado rapido en entornos sin conectividad: util en escenarios de desarrollo en avion, entornos air-gapped o redes restringidas donde no se puede depender de APIs en la nube.
- Educacion y aprendizaje de programacion: puede generar funciones comentadas con docstrings y casos de prueba, como el ejemplo de comprobacion de numeros primos en Python.
- Automatizacion local en Mac mini o Mac Studio: al ejecutarse sobre Metal en hardware Apple, puede integrarse en scripts locales de procesamiento de codigo o generacion de documentacion tecnica.
- Chat tecnico bilingue ingles-chino: para equipos que trabajan con documentacion o bases de codigo en ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 5,0 GB en cuantizacion 4-bit; se necesita memoria unificada suficiente para pesos mas overhead de inferencia (orientativamente 6-8 GB, aunque no se proporciona una cifra oficial).
- Hardware objetivo: chips Apple Silicon M1, M2, M3 y M4 (MacBook Air, MacBook Pro, Mac mini, Mac Studio), segun los tags del repositorio.
- GPU NVIDIA (A100, H100, RTX 4090): esta conversion es especifica de MLX/Metal y no esta pensada para CUDA; para GPU NVIDIA habria que usar los pesos originales del modelo base.
- Cabe en consumer hardware Apple: si, en funcion de la memoria unificada disponible del equipo.
- Opciones de despliegue: mlx-lm (recomendado, con el comando `python -m mlx_lm.generate`), y la app Outlier para macOS (que distribuye modelos propios, no esta conversion).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato/plataforma | Disponibilidad |
|---|---|---|---|---|---|
| Yi-Coder-9B-Chat-MLX-4bit (esta ficha) | ~8,8B | no disponible | apache-2.0 | MLX 4-bit / Apple Silicon | Hugging Face, 307 descargas |
| 01-ai/Yi-Coder-9B-Chat (base) | ~8,8B | no disponible | apache-2.0 | safetensors originales | Hugging Face (modelo base) |
| Qwen2.5-Coder-7B-Instruct (MLX 4-bit, Outlier-Ai) | ~7B | no disponible | no disponible en la informacion | MLX 4-bit / Apple Silicon | Hugging Face, 1.450 descargas |
| DeepSeek-R1-Distill-Qwen-7B (MLX 4-bit, Outlier-Ai) | ~7B | no disponible | no disponible en la informacion | MLX 4-bit / Apple Silicon | Hugging Face, 1.932 descargas |

Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo soporta ingles y chino; no hay soporte declarado de castellano, lo que limita su uso en entornos hispanohablantes sin prompts en ingles.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en APIs o librerias poco comunes; el codigo generado debe revisarse antes de produccion.
- La cuantizacion a 4 bits puede degradar la calidad respecto a los pesos originales en tareas de razonamiento complejo o generacion de codigo largo.
- La model card indica que la conversion no se distribuye en la app Outlier y que las cifras mencionadas provienen de experimentos internos, no de pruebas de release.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base 01-ai/Yi-Coder-9B-Chat.
- Dependencia de hardware Apple Silicon: no es portable a CUDA ni a CPU x86 sin reconvertir los pesos.
- No se dispone de informacion sobre sesgos especificos, contexto maximo efectivo ni politicas de seguridad del modelo base en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Outlier-Ai/Yi-Coder-9B-Chat-MLX-4bit
- Modelo base: https://huggingface.co/01-ai/Yi-Coder-9B-Chat
- App Outlier para macOS: https://outlier.host/
- Otras conversiones de Outlier-Ai:
  - https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-7B-Instruct-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Outlier-Quick-26B-MLX-4bit
