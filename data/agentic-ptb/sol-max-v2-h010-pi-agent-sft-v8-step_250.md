# agentic-ptb/sol-max-v2.h010.pi-agent-sft-v8.step_250

## Resumen

El modelo `agentic-ptb/sol-max-v2.h010.pi-agent-sft-v8.step_250` es un checkpoint intermedio generado por el proyecto AgentPTB, un barrido (sweep) de entrenamiento de modelos agénticos. Se trata de un fine-tuning del modelo base `Qwen/Qwen3.5-9B-Base` (9,4 mil millones de parámetros) mediante supervisión fina (SFT, v8) dentro de una celda experimental denominada `sol-max-v2`, dirigida por un agente Codex / gpt-5.6-sol con esfuerzo de razonamiento máximo. El checkpoint corresponde a la hora 10,35 de una ejecución de 100 horas, y se publica como un punto intermedio para trazar la evolución del rendimiento a lo largo del tiempo.

La relevancia de este modelo es principalmente investigadora: permite estudiar cómo evoluciona un modelo agéntico durante el entrenamiento, comparar checkpoints de distintas horas y validar la metodología del sweep. No está pensado como un modelo final para producción, sino como un artefacto de análisis. La arquitectura subyacente es la de Qwen3.5, que incluye una torre de visión (aunque el modelo se sirve como texto), y el checkpoint incluye el token de fin de turno correcto (`<|im_end|>`), lo que garantiza que las evaluaciones no se vean contaminadas por sobrepasamiento de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer con torre de vision, servido como texto) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B-Base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors de 18,8 GB) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `Qwen/Qwen3.5-9B-Base`, que emplea una arquitectura transformer con atención estándar y una torre de visión integrada (según la model card, `Qwen3_5ForConditionalGeneration`). Los pesos incluyen la torre de visión, pero el checkpoint se sirve como modelo de solo texto; para cargarlo en vLLM es necesario indicar explícitamente que no se aceptan imágenes ni vídeos mediante `--limit-mm-per-prompt '{"image": 0, "video": 0}'`, ya que el exportador `prime-rl` no genera `preprocessor_config.json`.

El entrenamiento se enmarca en el proyecto AgentPTB, un barrido de 100 horas donde un agente (Codex / gpt-5.6-sol) genera y ejecuta experimentos de entrenamiento. Este checkpoint concreto corresponde a la celda `sol-max-v2`, con esfuerzo de razonamiento máximo, y se trata de una repetición de una celda anterior desde la hora 0. El nombre `pi-agent-sft-v8` indica que es la octava versión de un fine-tuning supervisado para agentes. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El checkpoint se guarda en el paso 250 de la ejecución.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Qwen3.5-9B, aunque no se han documentado pruebas específicas.
- Razonamiento: al ser un checkpoint de un experimento agéntico, se espera que mantenga capacidades de razonamiento del modelo base, pero no hay evaluaciones publicadas.
- Codigo y matematicas: no hay datos especificos para este checkpoint.
- Tool calling / function calling: no se menciona en la documentacion.
- Soporte de agentes: el entrenamiento esta orientado a tareas agénticas, pero no se detallan las capacidades concretas.
- Multilingue: no se especifican idiomas.
- Capacidades especiales: incluye la torre de vision en los pesos, pero no se sirve como modelo multimodal; el token de fin de turno (`<|im_end|>`) esta correctamente configurado, lo que permite detener la generacion al final de cada turno.

## Casos de uso

- Investigacion en entrenamiento de modelos agénticos: este checkpoint sirve para analizar la evolucion del rendimiento a lo largo de las horas de entrenamiento, comparandolo con otros checkpoints de la misma celda o de celdas distintas.
- Validacion de metodologias de barrido: permite comprobar si el proceso de entrenamiento dirigido por agentes produce mejoras consistentes y si los checkpoints intermedios son utiles para la evaluacion temprana.
- Estudio de la influencia del token de fin de turno: al tener el eos correcto, puede usarse como referencia para comparar con checkpoints que carecen de el y que sobrepasan la ventana de contexto.
- Pruebas de despliegue con vLLM: sirve para verificar la configuracion necesaria (limitar multimodalidad) al servir modelos Qwen3.5 con pesos que incluyen torre de vision.
- Reproduccion de experimentos: los investigadores pueden descargar este checkpoint para reproducir los resultados del sweep o continuar el entrenamiento desde este punto.
- Desarrollo de pipelines de evaluacion: al ser un checkpoint intermedio, es util para probar metricas de evaluacion en modelos agénticos antes de aplicar a modelos finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los checkpoints sin el token de fin de turno correcto producen evaluaciones que son un "suelo" (floor) y no mediciones reales, pero no se proporcionan numeros concretos para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa 18,8 GB en FP32 (safetensors). Con cuantizacion FP16, la VRAM necesaria seria aproximadamente 18,8 GB; con cuantizacion de 8 bits, unos 9,4 GB; con 4 bits, unos 4,7 GB. No se han publicado cuantizaciones oficiales.
- GPU recomendadas: para FP16, una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB, H100). Para cuantizaciones de 8 bits, una GPU de 12-16 GB podria ser suficiente.
- Si cabe en consumer GPU: con cuantizacion de 4 bits, podria ejecutarse en GPUs de 8 GB (como RTX 3060 Ti o RTX 3070), aunque no hay garantias de rendimiento.
- Opciones de despliegue: vLLM (con la opcion `--limit-mm-per-prompt` para forzar modo texto), llama.cpp, Ollama o TGI, siempre que se generen los formatos adecuados (GGUF, etc.). No se proporcionan archivos de cuantizacion en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de comparativas publicadas. El modelo base es `Qwen/Qwen3.5-9B-Base`, que podria compararse con otros modelos de ~9B como Llama 3.1 8B o Mistral 7B, pero no hay informacion sobre como se comporta este checkpoint frente a ellos. La unica referencia es que es un checkpoint intermedio de un experimento, no un modelo final.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un experimento de investigacion, no un modelo final listo para produccion.
- No se especifica licencia, por lo que su uso comercial es incierto y requiere consultar al autor.
- No se documentan idiomas soportados ni sesgos conocidos.
- Riesgo de alucinacion: no evaluado; al ser un fine-tuning de un modelo base, puede presentar los mismos riesgos que Qwen3.5.
- La torre de vision esta presente en los pesos pero no se sirve; si se intenta cargar sin la configuracion adecuada en vLLM, el modelo fallara.
- El token de fin de turno es correcto, pero no se garantiza que el modelo se detenga siempre en el punto adecuado en todos los escenarios.
- No hay informacion sobre el dataset de entrenamiento, por lo que no se pueden evaluar sesgos especificos.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un artefacto muy reciente y poco probado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h010.pi-agent-sft-v8.step_250
- Indice de checkpoints de AgentPTB (mencionado en la model card): `agentic-ptb/INDEX` (no se ha encontrado URL directa)
- Perfil del autor: https://huggingface.co/agentic-ptb
