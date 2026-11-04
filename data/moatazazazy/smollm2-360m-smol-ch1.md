# moatazazazy/SmolLM2-360M-smol-ch1

## Resumen

SmolLM2-360M-smol-ch1 es un ajuste fino (fine-tuning) del modelo HuggingFaceTB/SmolLM2-360M-Instruct, publicado por el usuario moatazazazy en HuggingFace. Se trata de un modelo de lenguaje de pequeno tamano (361.821.120 parametros, aproximadamente 362 millones) orientado a generacion de texto conversacional, entrenado mediante Supervised Fine-Tuning (SFT) con la libreria TRL de HuggingFace. El modelo hereda la arquitectura transformer decoder-only de la familia SmolLM2 y esta empaquetado en formato safetensors para su uso con transformers.

El modelo resuelve el problema de adaptar un modelo instructivo compacto a un dominio o estilo conversacional especifico mediante SFT, lo que permite desplegarlo en entornos con recursos muy limitados (CPU, GPUs de gama baja, dispositivos edge). Su relevancia radica en que los modelos de la familia SmolLM2 estan disenados para inferencia eficiente en hardware modesto, y este ajuste concreto anade una capa de especializacion conversacional sobre esa base.

No obstante, la informacion publicada es muy escasa: la model card no documenta el dataset de entrenamiento, los hiperparametros, los idiomas soportados ni la licencia. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo fue creado en noviembre de 2026. Se trata, por tanto, de un artefacto de investigacion o experimento personal mas que de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM2) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de SmolLM2-360M-Instruct, no documentada aqui) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion posterior via herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | HuggingFaceTB/SmolLM2-360M-Instruct |
| Metodo de entrenamiento | SFT (Supervised Fine-Tuning) con TRL 1.17.1 |
| Tamano del repositorio | 1.4 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del SmolLM2-360M-Instruct, que emplea una arquitectura transformer decoder-only con atencion causal estandar. No se documenta ninguna innovacion arquitectonica adicional en la model card; el modelo conserva la estructura del base. El entrenamiento se realizo mediante Supervised Fine-Tuning (SFT) usando la libreria TRL (version 1.17.1), con Transformers 5.22.0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO adicional, ni los hiperparametros utilizados (learning rate, batch size, epochs). La model card solo indica que el modelo fue "generated_from_trainer" y entrenado con SFT, sin detallar la receta. Esta ausencia de documentacion impide evaluar la calidad y el alcance del ajuste.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de la base instructiva.
- Razonamiento basico y respuesta a preguntas, limitado por el tamano de 362M parametros.
- Generacion de codigo simple (capacidad presente en SmolLM2, aunque no verificada especificamente en este ajuste).
- Soporte de formato de chat mediante el pipeline de transformers con roles user/assistant.
- Capacidades multilingues: no documentadas; dependen del modelo base y del dataset de SFT, no disponible.
- Tool calling / function calling: no documentado en la model card.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Prototipado rapido de chatbots: el modelo puede usarse con el pipeline de transformers para validar flujos conversacionales en local antes de escalar a modelos mayores, gracias a su bajo coste computacional.
- Inferencia en dispositivos edge o CPU: con 362M parametros, es viable ejecutarlo en portatiles sin GPU o en dispositivos con poca memoria, adecuado para demos y pruebas de concepto.
- Filtrado y clasificacion de texto ligera: puede adaptarse a tareas de etiquetado o resumen corto en pipelines donde la latencia y el coste importan mas que la precision.
- Generacion de respuestas en asistentes embebidos: su tamano permite integrarlo en aplicaciones de escritorio o moviles con requisitos de memoria reducidos.
- Educacion e investigacion: util como caso de estudio de fine-tuning con TRL sobre un modelo base pequeno, para comparar el efecto del SFT en dominios concretos.
- Generacion de texto auxiliar en entornos con restricciones de privacidad: al poder ejecutarse localmente, evita enviar datos a APIs externas, aunque la falta de licencia clara limita su uso comercial.
- Experimentacion con cuantizacion: al estar en safetensors, puede convertirse a GGUF y probarse en llama.cpp u Ollama para evaluar el impacto de la cuantizacion en un modelo de este tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,7-0,8 GB solo para pesos (362M parametros x 2 bytes), mas overhead de activaciones y KV cache; en la practica, menos de 2 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,4 GB para pesos; en 4 bits, alrededor de 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090 sobrada); tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (pipeline nativo), text-generation-inference (tag endpoints_compatible), llama.cpp/Ollama tras conversion a GGUF, y vLLM para despliegue con mayor throughput (previa verificacion de compatibilidad).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, se espera decodificacion en decenas de tokens por segundo en GPU consumer y varios tokens por segundo en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolLM2-360M-smol-ch1 | 361.821.120 | no disponible | no disponible | HuggingFace (0 descargas) |
| HuggingFaceTB/SmolLM2-360M-Instruct | 362M (aprox.) | no disponible en esta ficha | no disponible en esta ficha | HuggingFace (modelo base, ampliamente usado) |
| Qwen2.5-0.5B-Instruct | 0,5B (aprox.) | no disponible en esta ficha | no disponible en esta ficha | HuggingFace |
| TinyLlama-1.1B-Chat | 1,1B (aprox.) | no disponible en esta ficha | no disponible en esta ficha | HuggingFace |

Nota: los datos de los modelos comparables no se han verificado en la informacion proporcionada; se indican solo como referencia de categoria. El ajuste smol-ch1 no aporta mejoras documentadas frente a su base, por lo que la comparativa de rendimiento no puede establecerse.

## Limitaciones y advertencias

- La model card no documenta el dataset de SFT, por lo que se desconoce el dominio de especializacion y los posibles sesgos introducidos.
- Riesgo de alucinacion elevado: con 362M parametros, la capacidad de razonamiento y el conocimiento factual son limitados en comparacion con modelos mayores.
- Idiomas soportados no documentados; el comportamiento fuera del ingles (idioma dominante en SmolLM2) es incierto.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor o asumir la licencia del modelo base (no verificada aqui).
- Longitud de contexto no documentada en esta ficha; debe consultarse la del modelo base SmolLM2-360M-Instruct.
- Sin benchmarks publicados ni evaluacion independiente; 0 descargas y 0 likes sugieren que no ha sido validado por la comunidad.
- No recomendado para produccion sin una evaluacion previa exhaustiva en el dominio objetivo.
- El repositorio tiene 1.4 GB, lo que sugiere posible inclusion de checkpoints intermedios u otros artefactos ademas de los pesos finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moatazazazy/SmolLM2-360M-smol-ch1
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Repositorio TRL: https://github.com/huggingface/trl
