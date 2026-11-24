# Raleesa/gpt2_model

## Resumen
Raleesa/gpt2_model es un modelo de lenguaje autorregresivo de arquitectura GPT-2 entrenado desde cero (pesos inicializados aleatoriamente) sobre el conjunto de datos Reuters Articles. Lo desarrolla el usuario Raleesa y se publica bajo licencia MIT. No se trata de un ajuste fino de GPT-2, sino de un modelo pequeño con 16.537.088 parámetros reales según los pesos en safetensors, pensado como ejercicio de entrenamiento y como modelo de dominio específico para texto periodístico en inglés.

La arquitectura es un transformer causal de 4 capas, dimensión de embedding 256, 4 cabezas de atención y una longitud de contexto de solo 256 tokens. Se entrenó durante 2 épocas con una tasa de aprendizaje de 0.0005, batch de 8 y acumulación de gradientes de 2, sobre el dataset ingeniumacademy/reuters_articles y con el tokenizador ingeniumacademy/gpt2-reuters-tokenizer.

Su relevancia es limitada en el panorama actual: es un modelo de investigación o de demostración, útil para estudiar el pipeline completo de entrenamiento de un LM causal pequeño sobre un corpus concreto, pero no compite con modelos de producción. Las pérdidas reportadas (entrenamiento 5.4773, validación 5.0473, test 4.8201) indican un ajuste todavía deficiente y un modelo que probablemente genera texto poco coherente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo GPT-2 (decoder-only) |
| Parametros totales | 16.537.088 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo sigue el diseño estándar de GPT-2: transformer decoder-only con atención causal, 4 capas, dimensión de embedding 256 y 4 cabezas de atención. La longitud de contexto es de 256 tokens, muy reducida frente a los estándares actuales. Los pesos se inicializaron de forma aleatoria y se entrenaron desde cero, sin partir de ningún checkpoint preentrenado de GPT-2.

El entrenamiento se realizó sobre el dataset ingeniumacademy/reuters_articles con el tokenizador ingeniumacademy/gpt2-reuters-tokenizer, durante 2 épocas, con learning rate 0.0005, batch size 8 y acumulación de gradientes 2. No se documenta el número total de tokens vistos, la composición exacta del dataset ni si hubo fases de RLHF, DPO o instrucción. Tampoco se describen innovaciones técnicas como decodificación especulativa o atención lineal. Las pérdidas reportadas son 5.4773 en entrenamiento, 5.0473 en validación y 4.8201 en test, valores altos que sugieren un modelo poco convergido.

## Capacidades
- Generación de texto autorregresiva en inglés, limitada a continuaciones de hasta 256 tokens de contexto.
- Modelado de lenguaje causal sobre texto periodístico del dominio Reuters (según el corpus de entrenamiento declarado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe: únicamente inglés según la model card.
- No se documentan capacidades especiales como modo thinking, visión o audio.

## Casos de uso
- Estudio del pipeline de entrenamiento: sirve para reproducir y analizar el entrenamiento desde cero de un transformer causal pequeño, incluyendo tokenizador, dataset y curvas de pérdida.
- Experimentos académicos de modelado de lenguaje: útil como baseline de bajo coste para comparar técnicas de tokenización o preprocesado sobre corpus periodísticos.
- Generación de titulares o fragmentos breves en inglés dentro de un dominio acotado, aceptando que la calidad será limitada por el tamaño y la pérdida del modelo.
- Pruebas de integración de infraestructura: al ocupar 0.1 GB, permite validar pipelines de despliegue (carga de safetensors, servidores de inferencia) sin coste de hardware.
- Docencia y demostraciones: ejemplo didáctico de un LM funcional con arquitectura GPT-2 y contexto corto para explicar atención causal y generación token a token.
- Filtrado o scoring de texto en inglés: el modelo puede emplearse para calcular perplejidad sobre frases del dominio Reuters, aunque su utilidad discriminativa no está validada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas: entrenamiento 5.4773, validación 5.0473 y test 4.8201.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en fp32 (16,5 M de parámetros), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU, en GPUs integradas y en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090, etc.).
- Cabe en consumer GPU: sí, en todas las gamas, dado su tamaño de 0.1 GB en el repositorio.
- Opciones de despliegue: carga directa con transformers (safetensors), exportación a GGUF para llama.cpp u Ollama, y servidores ligeros como un endpoint FastAPI propio. vLLM y TGI no están documentados para este modelo.
- Latencia y throughput estimados: no disponibles; por el tamaño, la latencia en CPU debería ser de milisegundos por token, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Raleesa/gpt2_model | 16,5 M | 256 | MIT | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT | Hugging Face |
| distilgpt2 (Hugging Face) | 82 M | 1024 | Apache 2.0 | Hugging Face |
| GPT-2 medium (OpenAI) | 355 M | 1024 | MIT | Hugging Face |

Frente a GPT-2 small o distilgpt2, este modelo es aproximadamente 5-7 veces más pequeño, tiene un contexto 4 veces menor y no parte de pesos preentrenados, por lo que su calidad de generación será previsiblemente inferior. Su ventaja es el entrenamiento específico sobre el corpus Reuters y su licencia MIT permisiva. No se dispone de benchmarks comparativos publicados.

## Limitaciones y advertencias
- Modelo entrenado desde cero con solo 2 épocas y pérdidas altas (test 4.8201): la coherencia y la calidad del texto generado serán limitadas.
- Contexto de solo 256 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Solo inglés; no hay soporte multilingüe documentado.
- Riesgo elevado de alucinación y de generar texto gramaticalmente correcto pero factualmente vacío o incorrecto.
- Sesgos potenciales heredados del corpus Reuters (sesgo editorial, geográfico y temático), no evaluados en la model card.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni documenta evaluación de seguridad.
- Sin datos sobre tool calling, agentes o instrucción: no debe usarse como asistente conversacional en producción.
- No se documentan cuantizaciones ni formatos alternativos de pesos más allá de safetensors.
- El repositorio tiene 0 descargas y 0 likes, sin validación por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Raleesa/gpt2_model
- Dataset: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- Tokenizador: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer
- Repositorio de GPT-2 original (referencia de arquitectura): https://github.com/openai/gpt-2
