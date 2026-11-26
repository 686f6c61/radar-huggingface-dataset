# Eureka-COM/QwenMosaic-0.8B

## Resumen

QwenMosaic-0.8B es un artefacto de investigación publicado por Eureka-COM que parte de Qwen/Qwen3.5-0.8B y sustituye las 6 capas de atención softmax del modelo original por bloques oficiales de Memory Mosaics (configuración v2, 8 cabezas de memoria corta y 8 de memoria larga). El resultado es un transformer híbrido en el que las 18 capas restantes (Gated DeltaNet + MLP) se mantienen intactas y no queda ninguna proyección q/k/v/o en el modelo exportado.

El objetivo no es superar al modelo base, sino demostrar empíricamente que las capas de atención pueden reemplazarse por mecanismos de memoria asociativa sin degradar gravemente el comportamiento. La conversión se realizó mediante destilación en tres etapas sobre unos 24 millones de tokens, con un ratio de perplejidad de 1,103 frente al original y una concordancia top-1 del 82,8 % en el siguiente token.

Es relevante ahora porque Memory Mosaics es una línea de investigación activa de Meta (ICLR 2025 y NeurIPS 2026) y este modelo ofrece una implementación funcional a escala 0.8B con pesos abiertos, útil para quienes quieran experimentar con alternativas a la atención sin entrenar desde cero. Su naturaleza es estrictamente investigadora: no está pensado para producción ni para superar a Qwen3.5-0.8B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 6 capas Memory Mosaics (v2, 8 cabezas cortas + 8 largas) + 18 capas Gated DeltaNet + MLP |
| Parámetros totales | no disponible (modelo base Qwen3.5-0.8B, ~0,8B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud máxima usada en la etapa 3 de entrenamiento; no se especifica contexto nativo mayor) |
| Tipos de cuantización | no disponible (export en bf16; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés, japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | bf16 (safetensors, repo de 1,5 GB); requiere código propio, no compatible con Transformers estándar |

## Arquitectura y entrenamiento

La arquitectura sustituye cada una de las 6 capas de atención softmax de Qwen3.5-0.8B por un bloque Memory Mosaics en configuración v2, con 8 cabezas de memoria corta y 8 de memoria larga. La memoria persistente (FFN) y las normas de cada bloque convertido se inicializan desde los pesos propios de Qwen de esa capa. Las 18 capas restantes (Gated DeltaNet + MLP) son las originales del modelo base. El modelo exportado no contiene capas de atención ni pesos de atención (sin proyecciones q/k/v/o).

El entrenamiento se estructuró en tres etapas: (1) ajuste de capa, donde las nuevas memorias se ajustan a la salida de la atención original de su capa con 10M tokens a longitud 2.048; (2) destilación con KL sobre la distribución del siguiente token del modelo original, entrenando memorias, normas y LoRA de rango 32, con 10M tokens a 2.048; y (3) continuación de la destilación con 4M tokens a longitud 8.192. Las etapas 1 y 2 siguen el procedimiento de RADLADS (arXiv:2505.03005). Los datos mezclan cosmopedia-100k, ultrachat_200k, Wikipedia en japonés y codeparrot-clean en proporción 4:2:2:1. El LoRA está fusionado en los pesos exportados.

## Capacidades

- Generación de texto conversacional en inglés y japonés, heredada del modelo base.
- Razonamiento de siguiente token próximo al original (concordancia top-1 del 82,8 %).
- Recuperación de información a distancia: recupera un código de 5 dígitos colocado a 32, 512, 1.500 y 6.000 tokens de distancia con 20/20 aciertos en todas las distancias, igual que el original.
- Soporte de plantilla de chat de Qwen con `enable_thinking=False` (el modo thinking no se valida en la model card).
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta capacidad de visión ni audio.
- Capacidades multilingües limitadas a inglés y japonés según la model card.

## Casos de uso

- Investigación sobre alternativas a la atención: permite estudiar empíricamente el reemplazo de capas softmax por Memory Mosaics en un modelo de 0,8B con pesos abiertos, sin necesidad de entrenar desde cero.
- Reproducción de experimentos de destilación: las tres etapas (ajuste de capa, destilación KL y secuencias largas) están documentadas con recuentos de tokens y longitudes, lo que facilita replicar el pipeline con otros modelos base.
- Evaluación de recuperación a largo plazo: útil para probar mecanismos de memoria asociativa en tareas de recuperación de información a distancias de hasta 6.000 tokens, donde el modelo mantiene 20/20 aciertos.
- Estudio de eficiencia arquitectónica: al eliminar las proyecciones q/k/v/o, sirve para medir el impacto en memoria y cómputo frente a la atención estándar en un mismo tamaño de modelo.
- Base para experimentos de destilación en japonés: el corpus incluye Wikipedia en japonés, lo que permite analizar el comportamiento de Memory Mosaics en un idioma no inglés.
- Docencia y divulgación: ejemplo funcional y abierto (Apache 2.0) para explicar cómo se sustituye un bloque de atención por memoria asociativa y qué métricas (KL, ratio de perplejidad, concordancia top-1) se usan para validar la conversión.

## Benchmarks y rendimiento

Evaluación sobre documentos reservados de las fuentes de entrenamiento, 16 filas de 2.048 tokens (32.752 posiciones), frente al Qwen3.5-0.8B original:

| Métrica | Valor |
|---|---|
| KL(original ‖ convertido), siguiente token | 0,144 |
| Ratio de perplejidad (convertido / original) | 1,103 |
| Concordancia top-1 con el original | 0,828 |
| Recuperación de código de 5 dígitos a 32 / 512 / 1.500 / 6.000 tokens | 20/20 en todas las distancias (original: 20/20) |
| Variación del ratio de perplejidad al escribir y releer en bf16 | 0,0001 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,6 GB solo para pesos (0,8B × 2 bytes), más overhead de activaciones y caché; cabe holgadamente en cualquier GPU consumer con 8 GB o más.
- El ejemplo de la model card carga el modelo en `float32` sobre CPU, lo que duplica el requisito de pesos a ~3,2 GB de RAM.
- GPU recomendadas: cualquier RTX 3060/4060 o superior para bf16; A100/H100 no son necesarias por tamaño, pero pueden usarse para experimentos por lotes.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, entre otras.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma nativa, ya que los bloques Memory Mosaics no forman parte de Hugging Face Transformers. Requiere el código del repositorio Eureka-COM/QwenMosaic (`pip install -e .`) con transformers >= 5.2, < 5.23.
- Limitación de batching: el padding dentro de un lote no se enmascara en las memorias, por lo que hay que generar un prompt a la vez o agrupar prompts de igual longitud.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| QwenMosaic-0.8B | ~0,8B | 8.192 | Híbrido Memory Mosaics + Gated DeltaNet | Apache 2.0 | Requiere código propio; ratio PPL 1,103 frente al base |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | Transformer con atención softmax | Apache 2.0 | Modelo base; compatible con Transformers estándar |
| Memory Mosaics (facebookresearch) | no disponible | no disponible | Memory Mosaics | Apache 2.0 | Implementación de referencia de Meta; no es un modelo instructivo listo para uso |

No se dispone de datos de benchmarks comparables con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción; el propio autor indica que no es mejor que Qwen3.5-0.8B.
- No es compatible con Hugging Face Transformers estándar ni con los runners habituales (vLLM, llama.cpp, Ollama, TGI); requiere el código del repositorio y una versión concreta de transformers (>= 5.2, < 5.23).
- El padding dentro de un lote no se enmascara en las memorias, lo que impide el batching con prompts de distinta longitud.
- Idiomas limitados a inglés y japonés según la model card; no se documenta comportamiento en castellano.
- Riesgo de alucinación heredado del modelo base y acentuado por la destilación: la concordancia top-1 es del 82,8 %, por lo que aproximadamente 1 de cada 6 predicciones difiere de la del original.
- La evaluación se limita a documentos reservados de las fuentes de entrenamiento, no a benchmarks estándar; no hay datos de MMLU, HumanEval ni GSM8K.
- La licencia Apache 2.0 cubre el modelo, pero los datos de entrenamiento tienen licencias diversas: cosmopedia-100k (Apache 2.0), ultrachat_200k (MIT), wikimedia/wikipedia (CC-BY-SA-3.0, GFDL) y codeparrot-clean (sin licencia en la ficha del dataset; cada fila lleva la licencia de su fichero de origen). Conviene revisarlas para uso comercial.
- El modo thinking no está validado; el ejemplo de uso lo desactiva explícitamente.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eureka-COM/QwenMosaic-0.8B
- Repositorio de código y evaluación: https://github.com/Eureka-COM/QwenMosaic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Código de Memory Mosaics (Meta): https://github.com/facebookresearch/MemoryMosaics
- Paper RADLADS: https://arxiv.org/abs/2505.03005
- Paper Memory Mosaics (ICLR 2025): https://arxiv.org/abs/2505.03005 (referencia bibliográfica en la model card; DOI no disponible)
- Dataset cosmopedia-100k: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia-100k
- Dataset ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset codeparrot-clean-valid: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
