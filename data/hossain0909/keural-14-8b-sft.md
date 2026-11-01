# hossain0909/keural-14.8b-sft

## Resumen

Keural 14.8B SFT es un modelo lingüístico bilingüe coreano-inglés de tipo Mixture-of-Experts (MoE) entrenado desde cero por el usuario de HuggingFace hossain0909 (bajo el proyecto MKD Hossain). El repositorio contiene un checkpoint temprano del ajuste por instrucciones (SFT) a los 7.000 pasos de un total planificado de 18.000, afinado sobre el dataset `mkd-chanwoo/keural-SFT` y publicado en formato safetensors compatible con Mixtral. El modelo base es `mkd-hossain/keural-14.8b-stage2-vllm`, resultado de un preentrenamiento de ~64,56 mil millones de tokens y una fase de annealing con ~5,16 mil millones de tokens de alta calidad.

Su relevancia radica en que es uno de los pocos MoE bilingües coreano-inglés entrenados desde cero y publicados abiertamente bajo licencia Apache 2.0, con una arquitectura Mixtral de ~14,83 mil millones de parámetros totales y ~2,9 mil millones activos por token, lo que permite inferencia eficiente. Según el propio autor, la versión final alineada con DPO se publicará como `mkd-hossain/keural-14.8b-chat`, por lo que este checkpoint debe considerarse un artefacto de desarrollo y no un modelo de chat definitivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixtral MoE (MixtralForCausalLM) |
| Parametros totales | 15.368.933.376 (~14,83B según model card) |
| Parametros activos | ~2,9B por token (top-2 de 8 expertos) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (solo bfloat16 nativo) |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (30,7 GB en bfloat16) |

## Arquitectura y entrenamiento

Keural emplea una arquitectura Mixtral MoE con 24 capas, tamaño oculto de 4096, 32 cabezas de atención con GQA (8 cabezas KV) y 8 expertos por capa de los que se activan 2 por token. El tamaño intermedio del FFN es 5632, el vocabulario es de 131.074 tokens (incluyendo los tokens especiales de ChatML `<|im_start|>` e `<|im_end|>`), y el RoPE theta es 500.000. El entrenamiento se realizó con FSDP sobre 2 GPUs NVIDIA H200 en la infraestructura KT Cloud NIPA2-H200.

El historial de entrenamiento consta de tres etapas: preentrenamiento de 100.000 pasos sobre ~64,56 mil millones de tokens de texto web coreano e inglés, una fase de annealing de 20.000 pasos con ~5,16 mil millones de tokens filtrados de alta calidad, y el SFT con formato ChatML. Este checkpoint corresponde a 7.000 pasos de SFT (~450M tokens procesados) sobre un dataset de 1.134.119 muestras (~710M tokens) con composición 44% coreano y 56% inglés, que agrega fuentes como UltraChat, OpenOrca, KoAlpaca, MathInstruct, AIHub, GSM8K y Magicoder. El plan del proyecto incluye completar los 18.000 pasos de SFT y añadir alineación DPO.

## Capacidades

- Generación de texto conversacional en coreano e inglés con formato ChatML.
- Ajuste por instrucciones (instruction tuning) sobre más de un millón de muestras multi-fuente.
- Razonamiento matemático básico: el dataset SFT incluye GSM8K y MathInstruct.
- Generación de código: el dataset incluye Magicoder, aunque sin benchmarks publicados que lo verifiquen.
- Seguimiento de instrucciones bilingüe con predominio de datos en inglés (56%).
- No hay evidencia de soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistentes conversacionales bilingües coreano-inglés: el formato ChatML y el dataset multi-turno (UltraChat, KoAlpaca) lo hacen adecuado para chatbots que alternan entre ambos idiomas.
- Generación de contenido en coreano: al estar entrenado desde cero con corpus coreano, puede usarse para redacción y resumen de textos en coreano, un ámbito con escasos modelos abiertos nativos.
- Prototipado de sistemas RAG de bajo coste: con solo ~2,9B de parámetros activos por token, la inferencia es relativamente ligera para un modelo de 14,8B totales, aunque su contexto de 4096 tokens limita documentos largos.
- Experimentación e investigación sobre MoE: al ser un checkpoint intermedio con pesos abiertos, sirve para estudiar el comportamiento de modelos MoE durante el entrenamiento.
- Tareas de matemáticas y razonamiento básico: gracias a GSM8K y MathInstruct en el SFT, puede emplearse en tutoring educativo de nivel elemental, sin garantías de rendimiento.
- Base para afinado posterior (fine-tuning) en dominios específicos coreanos: su licencia Apache 2.0 permite derivados comerciales sin restricciones.
- Evaluación comparativa de tokenizadores y arquitecturas para coreano: el vocabulario de 131.074 tokens es útil como referencia para estudios de eficiencia lingüística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~31 GB (el repositorio pesa 30,7 GB), más overhead de KV cache y activación de expertos.
- GPUs recomendadas: una NVIDIA A100 de 40 GB u H100/H200 de 80 GB para servir el modelo cómodamente en bfloat16. El entrenamiento original se realizó en 2× H200.
- Consumer GPUs: no cabe en una RTX 4090 (24 GB) en bfloat16; podría caber en una RTX 5090 (32 GB) con ajuste justo de contexto, aunque no hay cuantizaciones oficiales (GGUF, AWQ, GPTQ) publicadas que lo faciliten.
- Despliegue: vLLM es el método recomendado por el autor (`vllm serve` con `--dtype bfloat16 --max-model-len 4096`, vLLM 0.9.2 y transformers 4.57.0); también funciona con la librería `transformers` mediante `device_map="auto"`. No hay soporte documentado para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. Al activar solo ~2,9B de parámetros por token, cabe esperar una latencia razonable, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Idiomas |
|---|---|---|---|---|---|
| Keural 14.8B SFT | ~14,8B | ~2,9B | 4096 | Apache 2.0 | ko, en |
| Mixtral 8x7B Instruct | ~46,7B | ~12,9B | 32k | Apache 2.0 | Multilingüe (incl. ko parcial) |
| Qwen2.5-14B-Instruct | ~14,7B | 14,7B (denso) | 128k | Qwen (uso comercial condicionado) | Multilingüe (29+) |
| Llama 3.1 8B Instruct | ~8B | 8B (denso) | 128k | Llama 3.1 Community | Multilingüe (8 oficiales, sin ko) |

Keural destaca por su enfoque bilingüe coreano-inglés nativo y su licencia permisiva, pero queda claramente por detrás en contexto (4096 frente a 32k-128k) y, al ser un checkpoint temprano de un proyecto independiente, carece de la madurez, los benchmarks y el ecosistema de los modelos comparables.

## Limitaciones y advertencias

- Es un checkpoint temprano de SFT (7.000 de 18.000 pasos): la calidad de las respuestas no representa el modelo final y puede mostrar formatos inconsistentes o respuestas incompletas.
- No se han publicado benchmarks ni evaluaciones, por lo que su rendimiento real es desconocido y no verificable.
- Ventana de contexto muy reducida (4096 tokens), insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinación elevado al tratarse de un modelo entrenado con solo ~70 mil millones de tokens totales, muy por debajo de los modelos comerciales y comunitarios principales.
- Sesgos heredados del texto web coreano e inglés usado en el preentrenamiento; no hay documentación sobre mitigación de sesgos ni evaluaciones de seguridad.
- Sin soporte documentado de tool calling, agentes, visión o audio.
- Solo disponible en bfloat16 sin cuantizaciones oficiales, lo que restringe el despliegue en hardware de consumo.
- La licencia Apache 2.0 no impone restricciones comerciales, pero conviene verificar la procedencia de los datasets SFT (UltraChat, OpenOrca, AIHub, etc.) y sus términos individuales.
- El proyecto está en desarrollo activo; se recomienda esperar a la versión final `mkd-hossain/keural-14.8b-chat` para uso en producción.

## Enlaces

- Modelo: https://huggingface.co/hossain0909/keural-14.8b-sft
- Modelo base: https://huggingface.co/mkd-hossain/keural-14.8b-stage2-vllm
- Modelo final previsto: https://huggingface.co/mkd-hossain/keural-14.8b-chat
- Dataset SFT: https://huggingface.co/datasets/mkd-chanwoo/keural-SFT
- Paper: no disponible
- Repositorio de código o demo: no disponible
