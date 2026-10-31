# mudler/Kolibri-1-APEX-GGUF

## Resumen

Kolibri-1-APEX-GGUF es una colección de cuantizaciones APEX (Adaptive Precision for EXpert Models) del modelo base Aleph-Alpha/Kolibri-1, publicada por mudler, miembro del equipo de LocalAI. Kolibri-1 es un modelo Mixture-of-Experts (MoE) de 78.103.074.560 parámetros totales, con aproximadamente 3.5 B de parámetros activos por token, lo que permite una inferencia rápida pese a su gran tamaño total. APEX es una estrategia de cuantización específica para modelos MoE que clasifica cada tensor por su función (experto enrutado, experto compartido, atención) y aplica un gradiente de precisión por capas.

La relevancia de esta ficha radica en que hace accesible un modelo de 78 B en formatos GGUF que caben en GPUs de consumo y en sistemas de memoria unificada: los archivos van desde 22.17 GB (Micro) hasta 56.21 GB (Balanced). Los pesos originales están en FP8 y estas cuantizaciones se construyeron a partir de una conversión a BF16. El repositorio se publica bajo licencia Apache-2.0 (heredada del modelo base).

Importante: el propio autor indica que se trata de una "unevaluated preview" (vista previa sin evaluar); no se han publicado benchmarks para estos archivos, por lo que conviene validar la calidad en el caso de uso concreto antes de llevarla a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer |
| Parametros totales | 78.103.074.560 |
| Parametros activos | ~3.5 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 9 niveles APEX: Quality, I-Quality, Balanced, I-Balanced, Compact, I-Compact, I-Mini, I-Nano, I-Micro |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado desde conversión BF16; pesos originales en FP8) |

## Arquitectura y entrenamiento

Kolibri-1 es un transformer con arquitectura Mixture-of-Experts de 78 B de parámetros totales y unos 3.5 B activos por token. En un MoE, solo un subconjunto de expertos se activa para cada token, lo que reduce drásticamente el coste de inferencia respecto a un modelo denso equivalente. Los pesos fuente del modelo se distribuyen en FP8; para crear los GGUF se realizó primero una conversión a BF16 y después se aplicó la cuantización APEX.

La innovación principal de esta ficha es APEX: en lugar de cuantizar uniformemente, clasifica cada tensor por su rol (experto enrutado, experto compartido, atención) y aplica un gradiente de precisión por capas: las primeras y últimas capas conservan mayor precisión, las capas intermedias se comprimen con más agresividad, y el experto compartido (que se activa siempre) se mantiene en alta precisión. La justificación es que los expertos enrutados concentran la mayoría de los pesos pero solo unos pocos se activan por token, por lo que toleran menor precisión que los componentes que atraviesa cada token.

Sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO): no disponible en la información proporcionada. Los archivos con prefijo `I-` incorporan una importance matrix (imatrix) construida con datos de calibración diversos: chat, código, razonamiento, tool-calling, trazas agénticas y Wikipedia.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational`.
- Arquitectura MoE con ~3.5 B de parámetros activos por token, adecuada para inferencia local con alta velocidad relativa a su tamaño total.
- Compatible con llama.cpp (desde el commit `62318cd`, PR 30673) y con LocalAI.
- Los datos de calibración de la imatrix incluyen chat, código, razonamiento, tool-calling y trazas agénticas, lo que sugiere que el modelo base está orientado a estos escenarios (aunque el modelo card no detalla capacidades específicas).
- Capacidades de visión, audio, thinking mode o soporte oficial de function calling: no disponible en la información proporcionada.

## Casos de uso

- Chatbot local privado: ejecutar un asistente conversacional de 78 B (3.5 B activos) sin depender de APIs externas, con la variante I-Mini (28.97 GB) en un sistema con 32 GB de memoria unificada o GPU de gama alta.
- Inferencia en GPU de consumo con memoria unificada: las variantes Compact (36.22 GB) y Mini están pensadas explícitamente para "smaller GPUs and unified memory", como NVIDIA DGX Spark (122 GB de memoria unificada), donde pueden cargarse completamente en memoria con offload total de capas a GPU.
- Agentes y orquestación con LocalAI: el repositorio se integra directamente con LocalAI (`local-ai run mudler/Kolibri-1-APEX-GGUF@...`), lo que facilita montar endpoints compatibles con la API de OpenAI sobre hardware propio.
- Experimentación con cuantización de MoE: APEX publica recetas y scripts, útil para investigadores que quieran estudiar cómo afecta la precisión por rol de tensor (expertos frente a atención) a la calidad del modelo.
- Prototipado de aplicaciones con tool calling: la imatrix se calibró con trazas de tool-calling y datos agénticos, adecuada para probar pipelines de agentes locales (siempre validando la calidad, dado el estado de preview sin evaluar).
- Despliegue multi-usuario en servidor local: con las variantes Balanced en una GPU de 64 GB o superior (o dos GPUs de 48 GB), se puede servir el modelo con llama.cpp o LocalAI a varios clientes simultáneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio model card lo declara explícitamente: "Status: unevaluated preview. No benchmarks have been published for these files yet."

## Requisitos de hardware

Estimaciones de VRAM/memoria basadas en el tamaño de los archivos (se recomienda margen adicional para el KV cache y el contexto):

- Kolibri-1-APEX-I-Micro (22.17 GB): cabe en una RTX 4090 (24 GB) ajustado, o cómodamente en RTX 5090 (32 GB) y en sistemas de memoria unificada de 32 GB.
- Kolibri-1-APEX-I-Nano (24.41 GB) y I-Mini (28.97 GB): RTX 5090 (32 GB), RTX 6000 Ada, o Mac con memoria unificada de 36 GB o más.
- Kolibri-1-APEX-Compact / I-Compact (36.22 GB): GPUs de 48 GB (A6000, L40S, A100 40 GB no basta) o Mac de 48 GB+; también dos RTX 3090/4090 con reparto de capas.
- Kolibri-1-APEX-Quality / I-Quality (49.18 GB) y Balanced / I-Balanced (56.21 GB): A100/H100 de 80 GB, Mac Studio de 64-96 GB+ de memoria unificada, o multi-GPU (2x A6000, 2x RTX 5090 con ajuste).
- El autor usa un NVIDIA DGX Spark (122 GB de memoria unificada) como hardware local de referencia para cuantizaciones de esta clase.

Opciones de despliegue:

- llama.cpp: soporte desde el commit `62318cd` (PR 30673) en master; versiones anteriores no pueden cargar estos archivos. Ejemplo: `llama-cli -m Kolibri-1-APEX-I-Mini.gguf -p "Your prompt" -ngl 99`.
- LocalAI: `local-ai run mudler/Kolibri-1-APEX-GGUF@Kolibri-1-APEX-I-Mini.gguf`, con backend llama.cpp compilado desde una versión que incluya el commit indicado.
- Ollama, TGI, vLLM: no disponible en la información proporcionada (vLLM no soporta GGUF de forma nativa; Ollama no se menciona en el model card).

Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kolibri-1 (base, Aleph Alpha) | ~78 B | ~3.5 B | FP8 (safetensors) | Apache-2.0 | Pesos originales sin cuantizar |
| Kolibri-1-APEX-GGUF (esta ficha) | ~78 B | ~3.5 B | GGUF (9 niveles APEX) | Apache-2.0 | Cuantizaciones de 22 a 56 GB, imatrix disponible |
| Qwen3-30B-A3B | ~30 B | ~3 B | safetensors / GGUF comunitarios | Apache-2.0 | MoE más pequeño, cabe en 24 GB incluso sin cuantizar |
| Mixtral-8x7B-Instruct | ~46.7 B | ~12.6 B | safetensors / GGUF comunitarios | Apache-2.0 | MoE clásico, más parámetros activos por token, inferencia más costosa |

La ventaja diferencial de Kolibri-1 frente a alternativas de tamaño similar es su baja activación (~3.5 B) junto a una capacidad total de 78 B; el inconveniente, al tratarse de una preview sin benchmarks, es que su calidad relativa no puede contrastarse con datos publicados.

## Limitaciones y advertencias

- Estado de preview sin evaluar: el autor advierte explícitamente que no hay benchmarks publicados; la calidad de cada nivel de cuantización debe validarse empíricamente antes de uso en producción.
- Riesgo de degradación por cuantización: las variantes más agresivas (Nano, Micro) solo se distribuyen con imatrix, lo que sugiere mayor sensibilidad a la pérdida de precisión; los expertos enrutados, que concentran la mayoría de los pesos, se comprimen con más intensidad.
- Sesgos conocidos: no disponible en la información proporcionada (dependen del modelo base Aleph-Alpha/Kolibri-1, cuya model card no se incluye aquí).
- Riesgo de alucinación: inherente a cualquier LLM; no hay datos específicos para este modelo.
- Longitud de contexto: no disponible; no se puede planificar el uso del KV cache sin este dato.
- Idiomas soportados: no disponible; verificar antes de desplegar en castellano.
- Compatibilidad estricta con llama.cpp: se requiere el commit `62318cd` (PR 30673) o posterior; builds antiguos no cargan los archivos.
- Licencia: Apache-2.0 permite uso comercial, pero al redistribuir los archivos derivados debe mantenerse la licencia y la atribución al modelo base de Aleph Alpha.
- Los pesos fuente son FP8 convertidos a BF16 antes de cuantizar, lo que introduce una capa adicional de conversión respecto a los pesos originales.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/mudler/Kolibri-1-APEX-GGUF
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Proyecto APEX (recetas y scripts de cuantización): https://github.com/localai-org/apex-quant
- LocalAI: https://github.com/mudler/LocalAI
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Patreon del autor: https://www.patreon.com/cw/mudler
- Buy Me a Coffee del autor: https://www.buymeacoffee.com/mudler
- GitHub Sponsors del autor: https://github.com/sponsors/mudler
