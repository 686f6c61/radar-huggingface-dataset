# mlx-community/Ling-3.1-flash-1019-oQ2.5e-mtp

## Resumen

Ling-3.1-flash-1019-oQ2.5e-mtp es una versión cuantizada en formato MLX del modelo inclusionAI/Ling-3.1-flash-1019, publicada por la comunidad mlx-community en Hugging Face. El modelo base es una actualización de Ling-3.1-flash con capacidades mejoradas de razonamiento y uso agéntico. Se trata de un modelo mixture-of-experts (MoE) híbrido con atención lineal, de 560B de parámetros totales y 25B activos, lo que permite ejecutar un modelo de escala muy grande con un coste computacional por token mucho menor que un modelo denso equivalente.

La versión oQ2.5e emplea cuantización mixta generada con oQ (oMLX v0.7.3rc1), que asigna bits por capa según su sensibilidad medida, alcanzando una media efectiva de 3,132 bits por peso en el checkpoint completo. El checkpoint incluye la capa MTP (NextN), que oMLX ejecuta como decodificación especulativa "Lightning MTP" para acelerar la generación. Es relevante para usuarios del ecosistema Apple Silicon (MLX) que quieren desplegar modelos MoE gigantes en memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con atención lineal (bailing_hybrid): 63 capas KDA de atención lineal + 9 capas MLA con gating |
| Parametros totales | 572.121B en el checkpoint cuantizado (560B el modelo base) |
| Parametros activos | 25B por token (8 de 512 expertos enrutados activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ2.5e mixta: Affine 2-bit (grupo 64), 3-bit (grupo 64), 4-bit (grupo 64), 8-bit (grupos 64 y 128), BF16 y FP32; media efectiva 3,132 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con custom_code |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer MoE híbrido con atención lineal, etiquetado como `bailing_hybrid`. Combina 63 capas de atención lineal KDA (Kimi Delta Attention) con 9 capas de atención MLA (Multi-head Latent Attention) con gating, una disposición que reduce el coste de atención en secuencias largas manteniendo calidad en las capas finales. El módulo MoE contiene 512 expertos enrutados, de los cuales 8 se activan por token, lo que explica la gran diferencia entre parámetros totales (560B) y activos (25B).

El checkpoint incluye además la capa MTP (NextN, Multi-Token Prediction), que oMLX aprovecha para decodificación especulativa "Lightning MTP", aumentando el throughput de generación. La cuantización oQ2.5e asigna bits por sensibilidad medida de cada capa, usa una matriz de importancia (256 muestras x 512 tokens recogidas capa a capa desde los pesos FP8 originales) y un reajuste por mínimos cuadrados ponderados de escalas y sesgos. No se dispone de datos sobre el corpus de entrenamiento, número de tokens ni etapas de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento mejorado respecto a Ling-3.1-flash, según la model card del modelo base.
- Capacidades agénticas mejoradas respecto a Ling-3.1-flash, según la model card del modelo base.
- Decodificación especulativa mediante la capa MTP (NextN) incluida en el checkpoint.
- Ejecución optimizada en MLX (Apple Silicon) gracias a la cuantización mixta.
- Soporte de tool calling, capacidades multilingües y modalidades adicionales: no disponible en la información proporcionada.

## Casos de uso

- Chatbots conversacionales de gran calidad en Apple Silicon: el modelo activo de 25B permite generar respuestas fluidas en equipos con memoria unificada amplia (por ejemplo Mac Studio con 256-512 GB), sin necesidad de clústeres de GPU.
- Sistemas agénticos multi-paso: la model card del modelo base destaca mejoras agénticas, útil para orquestar herramientas y cadenas de razonamiento en frameworks de agentes.
- Generación asistida de texto en local con privacidad total: al ejecutarse en local vía MLX, no se envían datos a servicios externos, adecuado para entornos con requisitos de confidencialidad.
- Experimentación con decodificación especulativa: la capa MTP integrada permite probar Lightning MTP y medir aceleraciones de throughput en generación.
- Investigación sobre cuantización extrema: la distribución detallada de bits por capa (2 a 8 bits) sirve como referencia para estudiar cuantización mixta por sensibilidad en modelos MoE gigantes.
- Prototipado de servicios de LLM de alta capacidad en hardware de consumo profesional: con 3,132 bits/peso efectivos, el checkpoint ocupa 224 GB, viable en Macs con memoria unificada de 256 GB o más.
- Clasificación y resumen de documentos largos: la arquitectura híbrida con atención lineal KDA está orientada a manejar secuencias largas con coste reducido (longitud de contexto concreta no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria estimada: el checkpoint completo ocupa 224,0 GB (208,635 GiB de tensores), más overhead de KV cache y runtime; se necesita al menos 256 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: al ser un modelo MLX, el destino natural son Macs con Apple Silicon de gama alta (Mac Studio M3 Ultra o M2 Ultra con 256-512 GB de memoria unificada). No es viable en GPUs NVIDIA convencionales con este formato sin conversión.
- Consumer GPUs: no cabe en GPUs de consumo habituales (una RTX 4090 con 24 GB es insuficiente por más de un orden de magnitud); requiere estaciones con memoria unificada de 256 GB o superior.
- Despliegue: vía MLX con la librería oMLX (oQ, v0.7.3rc1), que ejecuta la capa MTP como Lightning MTP speculative decoding. No se menciona soporte de llama.cpp, Ollama, vLLM o TGI para este checkpoint.
- Latencia y throughput: no disponible; la capa MTP está diseñada para mejorar el throughput mediante decodificación especulativa, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Arquitectura | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.1-flash-1019-oQ2.5e-mtp (esta ficha) | 560B / 25B | MoE híbrido (KDA lineal + MLA) | oQ2.5e mixta, 3,132 bits/peso efectivos | MIT | MLX (safetensors), Apple Silicon |
| inclusionAI/Ling-3.1-flash-1019 (base) | 560B / 25B | MoE híbrido (KDA lineal + MLA) | Pesos originales FP8 | MIT | Hugging Face, pesos completos |
| inclusionAI/Ling-3.1-flash | 560B / 25B (según model card del sucesor) | MoE híbrido | no disponible | no disponible | Hugging Face |

Comparaciones de rendimiento: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Tamaño muy elevado: 224 GB de pesos limitan la ejecución a hardware con memoria unificada de 256 GB o más; no es usable en portátiles ni en la mayoría de estaciones de trabajo.
- Cuantización agresiva: con una media de 3,132 bits/peso (más de la mitad de los pesos a 2 bits), puede haber degradación de calidad respecto al modelo base FP8; no se publican evaluaciones que cuantifiquen esa degradación.
- Formato MLX exclusivo: el checkpoint está pensado para el ecosistema Apple Silicon; su uso en otros entornos requiere conversión adicional.
- Sesgos conocidos, riesgo de alucinación y capacidades multilingües: no disponible en la información proporcionada; deben evaluarse antes de uso en producción.
- Longitud de contexto no especificada en esta ficha; consultar la model card del modelo base.
- Uso comercial: la licencia MIT es muy permisiva y permite uso comercial, pero conviene revisar la model card del modelo base para condiciones adicionales.
- Etiqueta `custom_code`: la carga puede requerir ejecutar código proporcionado por el repositorio, lo que implica revisar ese código antes de usarlo en entornos sensibles.

## Enlaces

- Checkpoint cuantizado: https://huggingface.co/mlx-community/Ling-3.1-flash-1019-oQ2.5e-mtp
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.1-flash-1019
- Versión anterior del modelo base: https://huggingface.co/inclusionAI/Ling-3.1-flash
- Herramienta de cuantización oQ / oMLX: https://github.com/jundot/omlx
