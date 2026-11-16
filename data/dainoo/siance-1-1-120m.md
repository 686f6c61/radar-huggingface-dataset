# DAINOO/Siance-1.1-120M

## Resumen

Siance-1.1-120M es un modelo de lenguaje de 125.264.640 parámetros entrenado desde cero por DAINOO (TecStudio / Daniel Salazar) sobre una única GPU A100 en Colab Pro. Se trata de un transformer de estilo Llama con tokenizador BPE de 32.000 tokens, diseñado para español e inglés, y publicado bajo licencia Apache 2.0. Su rasgo diferencial no es el tamaño, sino el propósito: está especializado en el uso de una memoria externa mediante un protocolo textual de recuperación (`<|recall|>...<|/recall|>`), de forma que el modelo emite una consulta estructurada y consume el resultado devuelto por el sistema anfitrión.

La versión 1.1 corresponde al checkpoint base más un ajuste supervisado (SFT) con LoRA de rango 48, posteriormente fusionado en los pesos finales. Ese SFT enseña al modelo a invocar correctamente el mecanismo de recall y a responder a partir del resultado, incluyendo la capacidad de declarar que no encontró el dato cuando la consulta no devuelve información. El modelo se distribuye junto con un chat local en el navegador basado en WebAssembly SIMD, lo que permite ejecutarlo sin servidor.

Es relevante ahora por dos motivos: por un lado, ejemplifica el patrón de modelos pequeños especializados en una tarea concreta (tool use textual sobre memoria externa) en lugar de competir en conocimiento general; por otro, su evaluación publicada es explícitamente honesta sobre sus límites, algo poco habitual. No obstante, se trata de un modelo con cero descargas y sin pipeline declarado en Hugging Face en el momento de la consulta, por lo que debe evaluarse como un artefacto experimental y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama, entrenado desde cero |
| Parametros totales | 125.264.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos fp16 para navegador y checkpoint PyTorch) |
| Idiomas soportados | español (es), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (checkpoint PyTorch, `checkpoint_sft.pt`), `.bin` fp16 para WebAssembly (`siance_web_sft.bin`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo Llama, entrenado desde cero (no es un fine-tune de un modelo preexistente) sobre una A100 en Colab Pro. El tokenizador es un BPE de 32.000 tokens. El repositorio ocupa 0,8 GB, coherente con un modelo de 125M de parámetros en fp16 más los artefactos auxiliares (tokenizador, script de SFT y chat HTML). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

La innovación técnica principal es el protocolo de memoria externa: el modelo genera una llamada `<|recall|>conv|kb: consulta<|/recall|>` y el sistema anfitrión responde con `<|result|>...<|/result|>`. La versión 1.1 incorpora un SFT con LoRA de rango 48 (fusionado en los pesos) específicamente orientado a disparar correctamente ese protocolo y a redactar la respuesta a partir del resultado. No se documentan técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas SSM.

## Capacidades

- Generación de texto en español e inglés.
- Invocación de memoria externa mediante el protocolo textual `<|recall|>conv|kb: consulta<|/recall|>`, con consumo del resultado en `<|result|>...<|/result|>`.
- Declaración explícita de ausencia de dato cuando la recuperación no devuelve información ("no lo encontró").
- Ejecución local en navegador mediante WebAssembly SIMD, con pesos fp16 y sin servidor.
- No se documentan capacidades de razonamiento matemático avanzado, generación de código, visión, audio, tool calling genérico (más allá del recall) ni modo de pensamiento extendido.

## Casos de uso

- Chat de preguntas y respuestas sobre una base de conocimiento propia: el modelo emite una consulta `<|recall|>` contra el índice del operador y redacta la respuesta a partir del `<|result|>` devuelto; adecuado cuando el conocimiento debe residir fuera del modelo y actualizarse sin reentrenar.
- Demostración educativa de tool use textual: sirve para ilustrar cómo un modelo pequeño puede aprender un protocolo estructurado de invocación de herramientas con un SFT ligero (LoRA r=48) sobre un checkpoint base.
- Asistente embebido en navegador: los pesos fp16 y el chat WebAssembly SIMD permiten desplegar un asistente sin backend, útil para prototipos, demos offline o entornos con restricciones de red.
- Atención al cliente acotada a un catálogo o FAQ: si el índice de recuperación cubre el dominio y las consultas siguen plantillas cercanas a las de entrenamiento, el modelo puede responder con el dato recuperado y admitir explícitamente cuando no lo tiene.
- Filtro de derivación a humano: la capacidad de responder "no encontrado" permite usar el modelo como primera línea que solo contesta cuando hay respaldo documental, derivando el resto.
- Base para experimentación en modelos from-scratch en español: al ser Apache 2.0 y con script de SFT incluido, sirve como punto de partida reproducible para estudiar SFT con LoRA y protocolos de recall en modelos de 100M–200M.

## Benchmarks y rendimiento

| Evaluacion | Antes del SFT | Despues del SFT |
|---|---|---|
| Disparo del recall | 83% | 100% |
| Acierto de fuente | 70% | 100% |
| Acierto de respuesta | 64% | 100% |

Datos del examen propio del autor: 300 casos generados con las mismas plantillas del entrenamiento. El propio autor advierte que es un examen en distribución y que no mide generalización a frases fuera de plantilla. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5 GB en fp16 para los 125M de parámetros, más overhead de activaciones y tokenizador; el repositorio completo ocupa 0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 1–2 GB de VRAM; el autor lo entrenó en una A100, pero la inferencia no requiere hardware de datacenter.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU o CPU para el modo navegador.
- Opciones de despliegue: PyTorch nativo con `checkpoint_sft.pt`; navegador con `siance_web_sft.bin` y `siance_chat.html` (WebAssembly SIMD). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Siance-1.1-120M | 125M | no disponible | es, en | Apache 2.0 | Especializado en recall sobre memoria externa; evaluación solo en distribución |
| SmolLM2-135M | 135M | 8.192 tokens (según su model card pública) | en (principalmente) | Apache 2.0 | Modelo generalista de tamaño comparable; no especializado en recall |
| Qwen2.5-0.5B | 494M | 32.768 tokens (según su model card pública) | multilingüe | Apache 2.0 | Mayor tamaño y contexto; requiere más VRAM |

La comparación con SmolLM2-135M y Qwen2.5-0.5B se ofrece como referencia de categoría por tamaño y licencia; no se dispone de benchmarks cruzados entre Siance-1.1 y esos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo pequeño: puede fallar con preguntas fuera de plantilla; el propio autor lo señala.
- No tiene conocimiento reciente por sí solo; depende de la memoria externa para datos actualizados.
- No fue entrenado para procesar resultados de búsqueda de varios párrafos, solo resultados acotados.
- La evaluación publicada (100% en las tres métricas tras el SFT) es en distribución y no mide generalización; no debe interpretarse como rendimiento real en producción.
- No se documentan sesgos conocidos, pero al ser un modelo from-scratch con dataset no especificado, el riesgo de sesgo y de alucinación fuera del protocolo de recall no puede descartarse.
- Longitud de contexto no disponible: no se puede garantizar el manejo de conversaciones multi-turno largas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks estándar y de pipeline declarado desaconseja su uso en producción sin evaluación propia.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta: ecosistema y soporte comunitario prácticamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DAINOO/Siance-1.1-120M
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
