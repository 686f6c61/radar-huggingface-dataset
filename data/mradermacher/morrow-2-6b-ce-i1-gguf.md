# mradermacher/Morrow-2.6B-CE-i1-GGUF

## Resumen

Morrow-2.6B-CE-i1-GGUF es una colección de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo Morrow-2.6B-CE, un modelo conversacional de 2.569 millones de parámetros desarrollado por Noumenon Labs. La cuantización ha sido realizada por mradermacher, un cuantizador muy activo en la comunidad de Hugging Face conocido por publicar versiones comprimidas de modelos populares para su ejecución local en CPU y GPU de consumo.

El modelo base, Morrow-2.6B-CE, está etiquetado con la arquitectura LFM2 (Liquid Foundation Models 2), lo que sugiere un diseño híbrido eficiente orientado a inferencia rápida en dispositivos con recursos limitados. Ha sido ajustado mediante LoRA con la librería Unsloth, según las etiquetas del repositorio, y está orientado a generación de texto conversacional en inglés.

La relevancia de esta ficha radica en la disponibilidad de más de 20 variantes de cuantización, desde IQ1_S (0,7 GB) hasta Q6_K (2,2 GB), lo que permite ejecutar el modelo en hardware muy modesto, incluidos móviles, Raspberry Pi y portátiles sin GPU dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM2 (transformer híbrido; detalles no disponibles) |
| Parámetros totales | 2.569.272.320 (≈2,57 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_M, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Inglés |
| Licencia | other (sin detalles; consultar el modelo base noumenon-labs/Morrow-2.6B-CE) |
| Formato de pesos | GGUF (cuantizado); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo base, Morrow-2.6B-CE, pertenece a la familia de arquitecturas LFM2, según las etiquetas del repositorio. LFM2 es una arquitectura híbrida de Liquid AI que combina capas convolucionales gated (LIV) con atención estándar, diseñada para reducir la latencia y el consumo de memoria en inferencia, especialmente en CPU y dispositivos edge. Los detalles concretos de la configuración de capas de esta variante no están disponibles en la información proporcionada.

Respecto al entrenamiento, las etiquetas indican que se trata de un fine-tuning realizado mediante LoRA con la librería Unsloth, lo que sugiere un ajuste eficiente en parámetros sobre un modelo preentrenado. No se dispone de datos sobre el número de tokens de preentrenamiento, la composición del dataset, ni sobre el uso de técnicas como RLHF o DPO. La cuantización GGUF publicada por mradermacher emplea la técnica de imatrix (matriz de importancia calculada sobre un corpus de calibración), que mejora la calidad de las cuantizaciones bajas al ponderar la precisión de cada tensor según su sensibilidad.

## Capacidades

- Generación de texto conversacional en inglés (etiquetado como conversational y text-generation).
- Ejecución eficiente en local gracias al formato GGUF y a la arquitectura LFM2, optimizada para inferencia en CPU y dispositivos edge.
- Amplia gama de niveles de cuantización, desde 0,7 GB hasta 2,2 GB, permitiendo ajustar el equilibrio entre calidad, tamaño y velocidad.
- Soporte para crear cuantizaciones propias mediante el archivo imatrix incluido (0,1 GB).
- No hay información disponible sobre tool calling, capacidades de agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Chatbots locales ligeros: con la variante Q4_K_M (1,7 GB) se puede desplegar un asistente conversacional en inglés en un portátil sin GPU, ideal para prototipos de agentes de diálogo con privacidad total de datos.
- Aplicaciones móviles y edge: las variantes IQ2 e IQ3 (0,8-1,3 GB) permiten integrar el modelo en apps Android o iOS mediante llama.cpp, aprovechando la eficiencia de LFM2 en CPU.
- Dispositivos de hardware limitado: en placas como Raspberry Pi 5 o mini PCs N100, las cuantizaciones IQ1/IQ2 hacen viable la inferencia de un modelo de 2,6 B parámetros donde otros modelos no caben.
- Integración en aplicaciones de escritorio: herramientas como LM Studio u Ollama pueden cargar los GGUF directamente, facilitando la distribución de aplicaciones con IA embebida sin dependencia de la nube.
- Procesamiento por lotes en CPU: para tareas de clasificación o resumen de textos en inglés a gran escala sin coste de GPU, la variante Q4_0 (rápida, aunque de menor calidad) es adecuada.
- Experimentación con cuantización: el archivo imatrix incluido permite a desarrolladores generar cuantizaciones personalizadas con otros niveles de precisión o calibradas con corpus propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco hay datos de rendimiento comparativo entre las distintas cuantizaciones más allá de las notas cualitativas del autor (por ejemplo, IQ3_S supera a Q3_K*, o Q4_K_M como opción recomendada por equilibrio velocidad/calidad).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente el tamaño del archivo cuantizado más el contexto; desde ~1 GB de RAM para IQ1_S/IQ1_M (0,7 GB) hasta ~3 GB para Q6_K (2,2 GB).
- GPU recomendadas: no requiere GPU; al ser GGUF, funciona en CPU. Con GPU, cualquier modelo con 4 GB de VRAM (por ejemplo, GTX 1650 o superior) ejecuta incluso la variante Q6_K.
- Consumer GPUs: cabe sobradamente en RTX 3060 de 12 GB, RTX 4060 e incluso GPUs de 4 GB; también es plenamente viable en portátiles sin GPU dedicada.
- CPU: viable en procesadores modernos de escritorio y portátil; la arquitectura LFM2 está optimizada para inferencia en CPU.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, GPT4All, koboldcpp. No es un GGUF destinado a vLLM o TGI, que requieren pesos sin cuantizar o formatos propios.
- Latencia y throughput: no disponibles; al tratarse de un modelo de 2,6 B con arquitectura LFM2 optimizada para CPU, se esperan velocidades altas en hardware modesto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Morrow-2.6B-CE (esta ficha) | 2,57 B | GGUF (imatrix, 24 quants) | no disponible | other | Arquitectura LFM2, fine-tuning LoRA con Unsloth, orientado a conversación en inglés |
| LFM2-1.2B (Liquid AI) | 1,2 B | GGUF, safetensors | 32.768 tokens | Licencia Liquid AI (uso comercial permitido con condiciones) | Misma familia arquitectónica, menor tamaño |
| LFM2-2.6B (Liquid AI) | 2,6 B | GGUF, safetensors | 32.768 tokens | Licencia Liquid AI | Base preentrenada de la misma familia, sin fine-tuning conversacional específico |
| Qwen2.5-1.5B-Instruct | 1,54 B | safetensors, GGUF (comunidad) | 32.768 tokens | Apache 2.0 | Transformer denso, multilingüe, mejor documentado en benchmarks |

La comparativa se basa en la familia LFM2, de la que Morrow-2.6B-CE deriva su arquitectura. Los datos de rendimiento comparativo no están disponibles.

## Limitaciones y advertencias

- Soporte de idiomas limitado al inglés; no está indicado ni probado para castellano u otros idiomas.
- La licencia figura como "other", por lo que los términos de uso comercial deben verificarse en el repositorio del modelo base (noumenon-labs/Morrow-2.6B-CE) antes de cualquier despliegue en producción.
- Las cuantizaciones más agresivas (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad, como reconoce el propio autor ("for the desperate"); se recomienda Q4_K_M como equilibrio.
- No hay benchmarks publicados ni evaluaciones conocidas de alucinaciones, sesgos o seguridad del modelo base; se desconoce su comportamiento en tareas de razonamiento, código o matemáticas.
- La longitud de contexto no está documentada en esta ficha, lo que dificulta planificar aplicaciones con documentos largos.
- Al ser un fine-tuning LoRA sobre un modelo base, la calidad conversacional depende del proceso de ajuste de Noumenon Labs, del que no hay detalles públicos en la información disponible.
- El soporte de LFM2 en herramientas de inferencia requiere versiones recientes de llama.cpp; versiones antiguas pueden no cargar el modelo.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/mradermacher/Morrow-2.6B-CE-i1-GGUF
- Modelo base: https://huggingface.co/noumenon-labs/Morrow-2.6B-CE
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Morrow-2.6B-CE-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#Morrow-2.6B-CE-i1-GGUF
- Guía de uso de GGUF (referenciada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
