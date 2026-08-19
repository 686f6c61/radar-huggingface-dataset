# ermiaazarkhalili/Qwen3.8-2B-SFT-Fable5-Glint

## Resumen

Qwen3.8-2B-SFT-Fable5-Glint es un modelo de lenguaje de 2,27 mil millones de parametros desarrollado por ermiaazarkhalili, resultado de un ajuste fino (SFT) sobre el modelo base empero-ai/Qwen3.8-2B-Distill, que a su vez pertenece a la serie Qwen3.8 de Alibaba. El modelo esta disenado para generacion de texto conversacional y tareas de imagen-texto-a-texto, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

El entrenamiento se realizo con la libreria Unsloth y el framework TRL de Hugging Face, lo que segun el autor permitio un entrenamiento aproximadamente dos veces mas rapido que un flujo estandar. El modelo tiene una arquitectura basada en Qwen3.5 (etiquetado como qwen3_5 en los metadatos), con un total de 2.274.069.824 parametros y una longitud de contexto de 32.768 tokens. Es relevante ahora porque representa un ejemplo de como la serie Qwen3.8 puede adaptarse mediante ajuste fino a tareas conversacionales especificas manteniendo una huella de memoria reducida.

El repositorio contiene exclusivamente pesos en formato safetensors y no incluye informacion detallada sobre el dataset de entrenamiento ni resultados de benchmarks publicados. A pesar de estar etiquetado como image-text-to-text, la documentacion disponible no especifica si el modelo conserva capacidades de vision reales o si el pipeline es simplemente heredado del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (etiqueta qwen3_5) |
| Parametros totales | 2.274.069.824 (2,27 B) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (repositorio solo contiene safetensors sin cuantizar) |
| Idiomas soportados | Ingles (segun metadatos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de la serie Qwen3.5 de Alibaba, un transformer autoregresivo con atencion por capas, diseñado para manejar tareas de generacion de texto e interaccion imagen-texto. El ajuste fino se realizo mediante Supervised Fine-Tuning (SFT) sobre el modelo base empero-ai/Qwen3.8-2B-Distill, que es una destilacion de la serie Qwen3.8. No se especifican detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO.

El entrenamiento se ejecuto con la libreria Unsloth, una herramienta especializada en la optimizacion de ajuste fino de LLMs, que reduce el uso de memoria y acelera el entrenamiento mediante kernels de atencion optimizados y cuantizacion de gradientes. El autor indica que esto permitio entrenar el modelo aproximadamente dos veces mas rapido que un flujo convencional con Hugging Face Transformers. No se menciona ninguna innovacion tecnica adicional, como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional: el modelo esta optimizado para tareas de chat y dialogo multi-turno, dado su origen como modelo destilado y ajustado con SFT.
- Procesamiento de imagen-texto: el pipeline declarado es image-text-to-text, lo que sugiere que el modelo base tenia capacidades multimodales, aunque no se especifica si se conservan tras el ajuste.
- Tool calling: no se menciona soporte explicito para function calling en la documentacion proporcionada.
- Razonamiento multi-step: no se documentan capacidades de razonamiento avanzado ni thinking mode.
- Multilingue: los metadatos indican que el modelo soporta principalmente ingles, sin evidencia de soporte para otros idiomas.
- Compatibilidad con pipelines de generacion: al estar basado en Qwen3.5, deberia ser compatible con las librerias de transformacion de Hugging Face y con servidores de inferencia como TGI.

## Casos de uso

- Chatbots de atencion al cliente en ingles: el modelo puede gestionar conversaciones multi-turno con una ventana de contexto de 32K tokens, adecuado para mantener el historial completo de una interaccion con un cliente.
- Prototipado rapido de asistentes conversacionales: dado su tamano reducido (2,2 B), es viable para pruebas en entornos de desarrollo con recursos limitados.
- Generacion de respuestas en sistemas de soporte tecnico: su licencia Apache-2.0 permite su integracion en productos comerciales sin obligaciones de copyleft.
- Clasificacion y extraccion de informacion en texto largo: la ventana de contexto de 32K tokens permite procesar documentos extensos en ingles.
- Investigacion academica sobre ajuste fino de modelos pequenos: el modelo es util como punto de partida para experimentos de SFT o destilacion adicional.
- Sistemas de generacion de texto con restricciones de memoria: puede desplegarse en entornos con VRAM limitada, como tarjetas consumer de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar en la model card ni en la busqueda web realizada. Tampoco se proporcionan comparativas de rendimiento con otros modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16, el modelo ocupa aproximadamente 4,5 GB en VRAM (2,27B parametros multiplicado por 2 bytes). Con cuantizacion a 8 bits (si se aplicara), se reduciria a unos 2,3 GB; a 4 bits, alrededor de 1,2 GB.
- GPU recomendadas: el modelo puede ejecutarse en GPUs consumer con 6 GB o mas de VRAM, como la RTX 3060, RTX 4060 o RTX 2070. Para una inferencia comoda con contexto largo, se recomienda al menos 8 GB.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media y alta de consumo.
- Opciones de despliegue: puede servirse con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF) u Ollama (mediante la libreria qwen3.8 de Ollama). El repositorio incluye la etiqueta "endpoints_compatible" y "region:us", lo que sugiere compatibilidad con proveedores de inferencia gestionada.
- Latencia y throughput: no hay datos publicados. En una RTX 4090 se podria esperar un throughput de 50-100 tokens/s con batch de 1, pero no es un dato confirmado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-2B-SFT-Fable5-Glint (este) | 2,27 B | 32K | Apache-2.0 | Hugging Face |
| Qwen3.5-2B (base, sin ajuste) | ~2 B | 32K | Apache-2.0 | Hugging Face |
| Llama-3.2-3B | 3,21 B | 128K | Llama 3.2 license | Hugging Face |
| Gemma-2-2B | 2,6 B | 8K | Gemma license | Hugging Face |

La comparativa es limitada porque no hay datos de rendimiento publicados para este modelo. En terminos de licencia, este modelo es mas permisivo que Gemma (que tiene restricciones de uso) y comparable a Llama-3.2-3B. El contexto de 32K es estandar en la serie Qwen3.5 y supera a Gemma-2-2B. La diferencia principal con el modelo base es el ajuste fino SFT, que deberia mejorar el rendimiento en tareas conversacionales, pero no hay evidencia cuantitativa.

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion de sesgos, por lo que no se puede descartar que el modelo presente sesgos de genero, raza o ideologia presentes en los datos de entrenamiento del modelo base Qwen3.5.
- Riesgo de alucinacion: como cualquier LLM generativo, el modelo puede producir informacion falsa o inventada, especialmente en dominios de conocimiento especializado.
- Idiomas: solo se ha confirmado el soporte del ingles. El uso en otros idiomas no esta garantizado y puede degradar el rendimiento.
- No hay informacion sobre el dataset de entrenamiento del ajuste fino, lo que impide evaluar la calidad y la cobertura de los datos utilizados.
- El pipeline "image-text-to-text" podria ser un artefacto heredado del modelo base; no se ha verificado si el modelo realmente procesa imagenes tras el ajuste fino.
- No se recomienda su uso en produccion sin una evaluacion previa de calidad en el dominio de aplicacion especifico, dado que no hay benchmarks publicados.
- El modelo tiene solo 2,2B de parametros, por lo que su rendimiento en tareas complejas de razonamiento o codigo sera inferior al de modelos de mayor tamano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ermiaazarkhalili/Qwen3.8-2B-SFT-Fable5-Glint
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-2B-Distill
- Repositorio de la serie Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Pagina de Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
- Libreria de Qwen3.8 en Ollama: https://ollama.com/library/qwen3.8
