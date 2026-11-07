# Outlier-Ai/gemma-3-27b-it-MLX-4bit

## Resumen

`Outlier-Ai/gemma-3-27b-it-MLX-4bit` es una cuantizacion a 4 bits en formato MLX del modelo instructivo `google/gemma-3-27b-it` de Google DeepMind, publicada por Outlier-Ai. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos pensada para ejecutar inferencia local sobre Apple Silicon (chips M1, M2, M3 y M4) aprovechando el framework MLX y Metal. El repositorio ocupa 15,2 GB y contiene 27.009.346.304 parametros en safetensors cuantizados.

El modelo hereda las capacidades del Gemma 3 de 27B en su variante instruct: generacion de texto, razonamiento, codigo, soporte de function calling y conversacion multi-turno en 14 idiomas (entre ellos el castellano). La cuantizacion a 4 bits reduce el peso en memoria lo suficiente como para que el modelo sea viable en equipos con memoria unificada de gama alta (Mac Studio, MacBook Pro con M3/M4 Max), manteniendo el pipeline `text-generation` y la licencia Gemma original.

Su relevancia actual radica en la demanda de inferencia privada y sin conexion: al ejecutarse integramente en local, no requiere claves de API ni envia datos a la nube. El autor lo distribuye junto a la aplicacion Outlier para macOS, aunque el modelo es utilizable de forma independiente con `mlx-lm`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura de Gemma 3, no detallada en la model card) |
| Parametros totales | 27.009.346.304 (27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | 4-bit (unica variante publicada en este repositorio) |
| Idiomas soportados | en, de, fr, es, it, pt, nl, pl, ro, cs, hu, sv, da, fi |
| Licencia | gemma (heredada de google/gemma-3-27b-it) |
| Formato de pesos | safetensors (MLX), libreria mlx |

## Arquitectura y entrenamiento

El modelo es una cuantizacion, no un entrenamiento nuevo. La arquitectura subyacente es la de Gemma 3 27B instruct de Google, un transformer decoder-only; la model card de esta conversion no detalla capas, dimensiones ocultas ni mecanismos de atencion especificos. Los pesos originales se han convertido a 4 bits para el formato MLX, lo que reduce el tamano del repositorio a 15,2 GB frente al modelo en bfloat16.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre si el modelo base empleo RLHF, DPO u otras tecnicas de alineacion: esos datos corresponden a la model card de `google/gemma-3-27b-it`, no incluida en la informacion proporcionada. Tampoco se documentan innovaciones tecnicas adicionales introducidas por la cuantizacion mas alla del propio esquema de 4 bits.

## Capacidades

- Generacion de texto y conversacion multi-turno en modo instruct.
- Razonamiento y respuesta a preguntas de conocimiento general (ejemplo de la model card: explicar modelos mixture-of-experts en lenguaje llano).
- Soporte de tool calling / function calling, segun los tags del repositorio (`function-calling`, `tool-use`).
- Capacidades multilingues en 14 idiomas, incluido el espanol.
- Ejecucion local y offline sobre Apple Silicon mediante MLX y Metal.
- Resumen y sintesis de textos (ejemplo de widget: resumir diferencias entre cuantizacion de 4 y 8 bits).
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido (thinking) en esta conversion.

## Casos de uso

- Asistente de escritorio privado: ejecutado con `mlx-lm` o la app Outlier en un Mac, permite conversaciones multi-turno sin enviar datos a la nube, adecuado para entornos con requisitos de confidencialidad.
- Atencion al cliente con datos sensibles: al correr en local, se puede procesar correspondencia de clientes sin exponer informacion personal a APIs externas, siempre que el hardware soporte el modelo.
- Generacion y revision de codigo en local: el soporte de function calling permite integrarlo en flujos de edicion asistida dentro del IDE o scripts de automatizacion en macOS.
- Resumen de documentacion interna: apropiado para condensar informes o actas en castellano y otros idiomas europeos sin salir del equipo.
- Prototipado de agentes con herramientas: el soporte de tool-use posibilita construir agentes que invoquen funciones locales (sistema de archivos, calendario) en un entorno controlado.
- Traduccion y redaccion multilingue: con 14 idiomas soportados, util para equipos que trabajan en varias lenguas europeas y necesitan coherencia terminologica.
- Desarrollo y evaluacion de pipelines MLX: sirve como referencia para medir rendimiento de inferencia 4-bit en Apple Silicon antes de desplegar variantes mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria: el repositorio pesa 15,2 GB en 4 bits; se recomienda un Mac con memoria unificada de al menos 16-18 GB para cargar el modelo, y 24 GB o mas para contexto amplio y margen del sistema.
- GPU compatibles: Apple Silicon (M1, M2, M3, M4) segun los tags; en la practica, variantes Pro/Max/Ultra con memoria suficiente. No aplica a GPUs NVIDIA o AMD por el formato MLX.
- Cabe en GPU de consumo: si, en MacBook Pro y Mac Studio con memoria unificada alta; no en GPUs de escritorio convencionales por incompatibilidad de formato.
- Despliegue: `mlx-lm` (comando `python -m mlx_lm.generate`), app Outlier para macOS; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Plataforma |
|---|---|---|---|---|---|
| Outlier-Ai/gemma-3-27b-it-MLX-4bit | 27B | 4-bit | no disponible | gemma | MLX / Apple Silicon |
| google/gemma-3-27b-it | 27B | bfloat16 (original) | no disponible | gemma | Multiples (incluye CUDA) |
| Outlier-Ai/Outlier-Gemma3-27B-MLX-4bit | 27B | 4-bit | no disponible | gemma | MLX / Apple Silicon |
| Outlier-Ai/gemma-3-4b-it-MLX-4bit | 4B | 4-bit | no disponible | gemma | MLX / Apple Silicon |

## Limitaciones y advertencias

- Al ser una cuantizacion a 4 bits, puede producirse una degradacion de calidad frente al modelo original en bfloat16, especialmente en tareas de razonamiento complejo o generacion de codigo largo.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en esta conversion.
- Sesgos: no se aporta informacion sobre evaluaciones de sesgo; se heredan los del modelo base de Google.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma de Google, que incluyen restricciones de uso aceptable; es necesario revisar la model card del modelo base antes de desplegarlo en produccion.
- Compatibilidad limitada: el formato MLX solo funciona en Apple Silicon; no es portable a CUDA ni a CPU x86 sin reconversion.
- No se documentan la longitud de contexto efectiva ni el rendimiento tras la cuantizacion; conviene validar ambos aspectos antes de usarlo en produccion.
- El modelo se distribuye junto a una promocion de la app Outlier (version Pro de pago unico); la conversion es utilizable de forma independiente con `mlx-lm`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/gemma-3-27b-it-MLX-4bit
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Conversion alternativa del mismo autor: https://huggingface.co/Outlier-Ai/Outlier-Gemma3-27B-MLX-4bit
- Otras conversiones: https://huggingface.co/Outlier-Ai/gemma-3-4b-it-MLX-4bit, https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit, https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- App Outlier para macOS: https://outlier.host/
