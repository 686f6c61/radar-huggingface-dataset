# guan-wang/EBFM-DCLM-160M

## Resumen

EBFM-DCLM-160M es un modelo de lenguaje de 160 millones de parámetros desarrollado por Guanchu Wang y el equipo del Data Mining Lab (OpenEBFM), presentado en el informe técnico "OpenESM: Energy-Steered Models Are Scalable Foundation Learners". A diferencia de los transformers autorregresivos convencionales, se trata de un modelo de lenguaje basado en energía (energy-based language model, EBFM) con una implementación de arquitectura propia y entrenado sobre el corpus DCLM en la etapa de preentrenamiento.

El modelo se publica como exportación compatible con Hugging Face Transformers, con código remoto personalizado (`trust_remote_code=True`) y pipeline declarado como `fill-mask`. Su configuración corresponde a la variante "d12": 12 bloques transformer, dimensión de embedding de 768, 6 cabezas de atención, contexto de 2048 tokens y vocabulario de 32.768 entradas.

Es relevante ahora como pieza de investigación abierta dentro de la familia OpenEBFM, que explora el modelado del lenguaje mediante funciones de energía en lugar de la factorización autorregresiva clásica. Con licencia MIT y pesos en safetensors, es un artefacto útil para investigadores que quieran reproducir o extender el enfoque, no tanto para despliegues de producción generativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Implementación personalizada OpenEBFM (variante d12), energy-based language model |
| Parámetros totales | 160.556.544 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), configuración JSON y código remoto Python |

Otros datos de configuración: 12 bloques transformer, dimensión de embedding 768, 6 cabezas de atención, vocabulario de 32.768 tokens. Tamaño del repositorio: 0,6 GB.

## Arquitectura y entrenamiento

La arquitectura es una implementación propia del paradigma OpenEBFM, un modelo de lenguaje basado en energía. La configuración exportada declara 12 bloques transformer con dimensión 768 y 6 cabezas de atención, lo que da lugar a los 160M parámetros del checkpoint. El pipeline de Hugging Face es `fill-mask` y la carga se realiza mediante `AutoModelForMaskedLM`, lo que sugiere una interfaz de modelado enmascarado sobre el formalismo de energía, aunque la model card no detalla el mecanismo interno de puntuación ni la función de energía concreta.

El entrenamiento corresponde únicamente a la etapa de preentrenamiento sobre el corpus DCLM. No se especifican en la información disponible el número de tokens procesados, la composición del dataset, ni si hubo fases posteriores de ajuste (SFT, RLHF o DPO). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. El repositorio incluye `token_bytes.pt`, una tabla de bytes del tokenizador utilizada por las métricas de OpenEBFM, y un tokenizador serializado propio (`tokenizer.pkl`).

## Capacidades

- Modelado de lenguaje enmascarado (`fill-mask`) sobre secuencias de hasta 2048 tokens.
- Puntuación de secuencias mediante el formalismo de energía propio de OpenEBFM (la model card no detalla la API exacta más allá de la salida de logits).
- Tokenización propia basada en `tiktoken` y tabla de bytes para métricas internas.
- Compatibilidad con el ecosistema Transformers mediante código remoto (`trust_remote_code=True`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en modelado de lenguaje basado en energía: servir como checkpoint de referencia de 160M para reproducir experimentos del informe OpenESM y comparar el formalismo EBFM frente a modelos autorregresivos de tamaño similar.
- Experimentos de `fill-mask` controlados: completar tokens enmascarados en secuencias cortas (hasta 2048 tokens) para estudiar el comportamiento del modelo en tareas de reconstrucción léxica.
- Evaluación de métricas OpenEBFM: usar `token_bytes.pt` y el tokenizador incluido para calcular métricas de bits por byte y comparar con otros checkpoints de la familia.
- Fine-tuning académico en dominios concretos: al ser un modelo de 160M con licencia MIT y pesos safetensors, es viable ajustarlo en una única GPU consumer para tareas de clasificación o modelado enmascarado de dominio específico.
- Prototipado de pipelines de inferencia con código remoto: validar la integración de arquitecturas personalizadas en Transformers, vLLM u otros runners antes de escalar a variantes mayores de OpenEBFM.
- Docencia y divulgación: ejemplo compacto y abierto para explicar modelos de energía en cursos de aprendizaje profundo, dado su tamaño reducido y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,65 GB solo para pesos (160,5M parámetros × 4 bytes), más activaciones y overhead del runtime; en fp16/bf16 aproximadamente 0,32 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para fp32 con margen, una RTX 4090 o A100 no aportan ventaja por tamaño, solo por velocidad.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante con 4 GB o más).
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la vía documentada. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, ya que la arquitectura es personalizada y no está integrada en esos runners de forma nativa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EBFM-DCLM-160M | 160,5M | 2048 | Energy-based (OpenEBFM) | MIT | Hugging Face, código remoto |
| GPT-2 small | 124M | 1024 | Transformer autorregresivo | MIT | Hugging Face, integración nativa |
| BERT-base | 110M | 512 | Transformer encoder enmascarado | Apache 2.0 | Hugging Face, integración nativa |
| RoBERTa-base | 125M | 512 | Transformer encoder enmascarado | MIT | Hugging Face, integración nativa |

La comparación es estructural: EBFM-DCLM-160M se sitúa en el mismo orden de magnitud que GPT-2 small, BERT-base y RoBERTa-base, pero difiere en paradigma (energía frente a autorregresivo o enmascarado clásico) y en madurez de ecosistema. No hay datos de rendimiento publicados que permitan comparar calidad.

## Limitaciones y advertencias

- Modelo en etapa de preentrenamiento: no ha pasado por ajuste supervisado ni alineación, por lo que no debe usarse directamente como asistente conversacional.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python del repositorio; conviene auditar `modeling_ebfm.py` y `configuration_ebfm.py` antes de usarlo en entornos sensibles.
- Arquitectura personalizada no integrada de forma nativa en runners populares (vLLM, llama.cpp, Ollama, TGI), lo que limita el despliegue en producción.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- Idiomas soportados no documentados; el corpus DCLM es mayoritariamente inglés, por lo que el rendimiento en castellano es incierto.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Sin benchmarks publicados, no es posible estimar su calidad frente a alternativas establecidas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la procedencia de los datos de entrenamiento (DCLM) si se usa en productos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guan-wang/EBFM-DCLM-160M
- Repositorio OpenEBFM: https://github.com/datamllab/openebfm
- Informe técnico (arXiv 2610.33005): https://huggingface.co/papers/2610.33005
