# etherluminifer/llm-from-scratch

## Resumen

`etherluminifer/llm-from-scratch` es un modelo de lenguaje tipo GPT-2 small entrenado desde cero por el autor etherluminifer con el framework Burn, escrito íntegramente en Rust. Se trata de un proyecto de aprendizaje cuyo objetivo no es ofrecer un asistente conversacional, sino reproducir el pipeline completo de entrenamiento de un transformer decoder-only (tokenización, arquitectura, bucle de entrenamiento y evaluación) en un ecosistema distinto de PyTorch. El modelo continúa texto; no está ajustado para seguir instrucciones ni para mantener diálogos.

La arquitectura es la de GPT-2 small: 12 capas, dimensión de modelo de 768, contexto de 1024 tokens y vocabulario de 32 000 tokens con tokenizador BPE a nivel de byte. El entrenamiento se realizó sobre el split `sample-10BT` del dataset `HuggingFaceFW/fineweb-edu`. El repositorio ocupa 1,6 GB y contiene los pesos en formato Burn (`model.mpk`), la configuración de arquitectura y entrenamiento (`config.json`), el tokenizador (`tokenizer.json`) y las curvas de pérdida (`metrics.csv`).

Su relevancia es fundamentalmente didáctica y de infraestructura: demuestra que es viable entrenar un transformer de escala GPT-2 fuera del stack habitual de Python, y sirve como referencia para quien quiera replicar el proceso. No es un modelo destinado a producción, y su adopción está limitada por la ausencia de licencia declarada, de pipeline en Hugging Face y de compatibilidad con `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 small), 12 capas, d=768 |
| Parametros totales | no disponible (tamano declarado como "GPT-2-small-sized"; GPT-2 small canonico: 124 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en formato Burn; no se documentan variantes cuantizadas) |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | Burn record (`model.mpk`); no compatible con safetensors ni GGUF |
| Vocabulario | 32 000 tokens, BPE a nivel de byte |
| Dataset de entrenamiento | `HuggingFaceFW/fineweb-edu`, split `sample-10BT` |
| Framework de entrenamiento | Burn (Rust) |
| Tamano del repositorio | 1,6 GB |
| Descargas / likes | 8 / 0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 small: un transformer decoder-only con 12 bloques, dimensión oculta de 768 y atención causal estándar sobre una ventana de 1024 tokens. El tokenizador es un BPE a nivel de byte con vocabulario de 32 000 entradas, lo que evita tokens fuera de vocabulario y permite representar cualquier secuencia de bytes, aunque el modelo solo ha sido entrenado con texto en inglés. No se documentan innovaciones arquitectónicas adicionales (no hay atención lineal, MoE, decodificación especulativa ni mecanismos híbridos SSM); el interés del proyecto reside en la implementación, no en la arquitectura.

El entrenamiento se llevó a cabo íntegramente en Rust con el framework Burn sobre el split `sample-10BT` de fineweb-edu, un corpus filtrado por calidad educativa. La model card no especifica el número total de tokens procesados, la composición exacta del dataset, la duración del entrenamiento ni si hubo fases de ajuste fino supervisado o preferencias (RLHF/DPO); todo apunta a un preentrenamiento puro de modelado de lenguaje autorregresivo. El repositorio incluye `metrics.csv` con las curvas de pérdida, y los pesos publicados corresponden al checkpoint con la menor pérdida de validación hasta la fecha, según indica el autor.

## Capacidades

- Continuación de texto en inglés: el modelo predice el siguiente token y genera texto coherente a nivel local dentro de su ventana de contexto.
- Modelado de lenguaje autorregresivo: útil para experimentos de perplejidad, ablaciones y reproducción de resultados.
- No dispone de modo de razonamiento explícito, cadena de pensamiento ni "thinking mode".
- No soporta tool calling ni function calling.
- No está diseñado para uso agéntico ni razonamiento multi-paso.
- Multilingüismo: limitado al inglés; no se ha entrenado ni evaluado en otros idiomas.
- Sin capacidades de visión, audio ni multimodalidad.
- No está ajustado para seguir instrucciones (no es un modelo instruct/chat).

## Casos de uso

- Reproducción de un pipeline de entrenamiento en Rust: el repositorio y los pesos permiten estudiar de principio a fin cómo se construye, entrena y evalúa un GPT-2 small con Burn, incluyendo tokenizador, configuración y curvas de pérdida.
- Docencia y formación en sistemas: sirve como ejemplo mínimo y legible de un transformer decoder-only para explicar atención causal, tokenización BPE y bucle de entrenamiento sin la complejidad de un framework de Python.
- Experimentos de continuación de texto en inglés: generación de continuaciones sobre prompts cortos para analizar el comportamiento de un modelo de 124 M de parámetros entrenado con un presupuesto reducido.
- Benchmark de referencia para frameworks alternativos: comparar throughput, uso de memoria y pérdida de validación de Burn frente a implementaciones equivalentes en PyTorch sobre el mismo dataset.
- Investigación sobre calidad de datos: al estar entrenado sobre `sample-10BT` de fineweb-edu, permite estudiar el efecto del filtrado por calidad educativa en las curvas de pérdida de un modelo pequeño.
- Base para ajuste fino posterior: los pesos pueden servir como punto de partida para experimentos de fine-tuning en tareas concretas de inglés, siempre que se resuelva la conversión desde el formato Burn.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo referencia `metrics.csv` con las curvas de pérdida de entrenamiento y validación; no hay datos de MMLU, HumanEval, GSM8K, HellaSwag ni de perplejidad sobre conjuntos de evaluación estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de ~124 M de parámetros, una estimación razonable en fp32 es de aproximadamente 0,5 GB de pesos más activaciones y caché KV para 1024 tokens; en fp16, alrededor de 0,25 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM debería ser suficiente; no se documentan requisitos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna (GTX 1060 en adelante, RTX 3060/4060, etc.), aunque no hay confirmación del autor.
- Opciones de despliegue: el modelo solo se ejecuta con el código del proyecto en Rust con Burn (`model.mpk`); no es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers` sin una conversión previa de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / ecosistema | Disponibilidad |
|---|---|---|---|---|---|
| etherluminifer/llm-from-scratch | GPT-2 small (~124 M, no confirmado) | 1024 | no disponible | Burn (`model.mpk`), Rust | Hugging Face, 8 descargas |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT | PyTorch, safetensors, GGUF | Ampliamente disponible |
| GPT-2 medium (OpenAI) | 355 M | 1024 | MIT | PyTorch, safetensors, GGUF | Ampliamente disponible |
| Modelos GPT-2 reentrenados en otros frameworks | ~124 M | 1024 | variable | variable | variable |

La comparación relevante no es de rendimiento, sino de ecosistema: frente a GPT-2 small de OpenAI, este modelo ofrece una implementación en Rust con Burn y un pipeline reproducible, pero carece de licencia declarada, de integración con `transformers` y de cualquier evaluación pública. No se dispone de datos de benchmarks para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Proyecto de aprendizaje declarado por el autor: no es un modelo conversacional ni un asistente; solo continúa texto.
- Sin licencia declarada: no se puede asumir permiso para uso comercial ni para redistribución; es necesario contactar con el autor.
- Solo inglés: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Contexto limitado a 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Riesgo elevado de alucinación y de generar contenido factualmente incorrecto, propio de un modelo de 124 M entrenado con un presupuesto reducido.
- Sesgos heredados de fineweb-edu: el corpus filtrado por calidad educativa no elimina sesgos de género, raza, ideología ni geográficos.
- Incompatibilidad con el ecosistema estándar: los pesos en formato Burn no se cargan con `transformers`, vLLM, llama.cpp ni Ollama sin una conversión manual.
- Sin pipeline declarado en Hugging Face, sin descargas significativas (8) y sin mantenimiento comunitario constatable; el soporte depende del repositorio de GitHub del autor.
- No apto para producción: sin benchmarks, sin garantías de calidad y con un checkpoint descrito como "el de menor pérdida de validación hasta ahora", lo que sugiere un entrenamiento posiblemente en curso o no finalizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/etherluminifer/llm-from-scratch
- Repositorio del proyecto (código Rust + Burn): https://github.com/thibthibaut/llm-from-scratch
- Framework Burn: https://burn.dev
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
