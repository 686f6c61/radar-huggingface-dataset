# sautilm/SautiLM-Kuu-Ius

## Resumen

SautiLM-Kuu-Ius es un modelo de lenguaje especializado en derecho de la República Democrática del Congo (RDC) y del espacio OHADA, desarrollado por MusanTek Research para el ecosistema SautiLM desde Bunia (Ituri, RDC). Se construye como un ajuste fino mediante LoRA sobre `unsloth/gemma-3-4b-it` y se distribuye cuantizado en GGUF `Q4_K_M` para su uso en estaciones de trabajo legales de escritorio con conectividad limitada o nula (edge-AI 100% offline).

El modelo forma parte de una arquitectura modular por niveles: SautiLM-Jua (270M para móvil), SautiLM-Nuru (clasificadores de visión TFLite <= 45 MB), SautiLM-Kuu (1B móvil y 4B escritorio) y el futuro SautiLM-Radi (tier flash de latencia inferior a 50 ms). Kuu-Ius ocupa el nivel de escritorio dentro de la familia Kuu, orientado a tribunales y abogados de la RDC.

Su relevancia radica en el enfoque de "soberanía de datos" y despliegue completamente offline, así como en el reconocimiento explícito por parte del autor de que los pesos paramétricos por sí solos no son fiables para derecho (fallan 0/3 en benchmarks legales retenidos) y deben combinarse obligatoriamente con recuperación documental (RAG) y verificadores de citas deterministas. Es un prototipo pre-piloto, no un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 4B IT), cuantizado con llama.cpp en GGUF Q4_K_M |
| Parametros totales | 3.880.263.168 (3,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (`n_ctx=4096` según model card) |
| Tipos de cuantizacion | Q4_K_M (4 bits); repo incluye GGUF y safetensors |
| Idiomas soportados | fr, en, sw |
| Licencia | Gemma Terms of Use |
| Formato de pesos | GGUF (`sautilm-kuu-ius-q4_k_m.gguf`, 2382,37 MB) y safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-3-4b-it`, un transformer decoder-only de Google con 3,88 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA de rango `r=8` y `alpha=16` durante 74 pasos, con un dataset de 338 ejemplos verificados y aislamiento estricto de dominio (0 % de fuga desde el corpus Bbadha). La pérdida de entrenamiento final fue de 2,6383 y la mejor de validación de 3,6293. La verificación en tiempo de ejecución pasó de 6/8 en el modelo base (0 pasos) a 7/8 en el modelo seleccionado.

La exportación se realizó con `llama.cpp` a GGUF de 4 bits (`Q4_K_M`), pensada para estaciones de trabajo de escritorio con al menos 8 GB de RAM y GPU Vulkan/CUDA recomendada. No se documentan innovaciones arquitectónicas propias más allá del ajuste LoRA y el pipeline de cuantización; el contexto se limita a 4096 tokens en la configuración publicada.

## Capacidades

- Generación de texto conversacional en francés, inglés y suajili.
- Razonamiento y respuesta sobre derecho de la RDC y normativa OHADA (dominio de especialización).
- Soporte de recuperación aumentada (RAG) cuando se combina con `sautilm_codes_rdc.sqlite` (6.251 pasajes FTS5/FTS4).
- Verificación de citas legales mediante `sautilm_sdk.LegalCitationVerifier` (reemplazo estricto de respuestas no fundamentadas).
- Cálculos deterministas de custodia y sucesiones a través de calculadoras específicas.
- Ejecución 100 % offline en hardware de escritorio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Asistencia a abogados en la RDC: consulta de normativa y jurisprudencia OHADA con recuperación documental sobre la base SQLite de 6.251 pasajes, adecuado por su especialización y su funcionamiento offline en juzgados con conectividad limitada.
- Investigación legal en tribunales remotos: despliegue en estaciones de trabajo con GPU Vulkan/CUDA que no pueden enviar datos a la nube, gracias al diseño edge-AI y a la licencia Gemma.
- Formación de estudiantes de derecho: generación de explicaciones en francés y suajili sobre conceptos de derecho civil y mercantil, con verificación de citas obligatoria.
- Borradores de escritos y resúmenes: producción de texto en fr/en/sw que luego revisa un profesional, siempre con el verificador de citas activado para evitar artículos inventados.
- Cálculo de custodia y sucesiones: uso de las calculadoras deterministas integradas en el SDK para escenarios concretos, evitando la generación libre del modelo.
- Prototipado de asistentes legales multi-tier: integración en el ecosistema SautiLM junto con SautiLM-Jua-Ius (móvil) y SautiLM-Nuru-Ius (visión), usando Kuu-Ius como nivel de escritorio.
- Evaluación de pipelines RAG legales: el modelo sirve como banco de pruebas para medir la contribución de la recuperación frente a los pesos paramétricos (base 6/8 vs. ajustado 7/8 en verificación de runtime).

## Benchmarks y rendimiento

| Prueba | Modelo base (0 pasos) | SautiLM-Kuu-Ius | Notas |
|---|---|---|---|
| Verificación de runtime | 6/8 | 7/8 | Mejora tras ajuste LoRA |
| `domain_eval_v2` (legal retenido) | no disponible | 0/3 | Falla por fabricación de artículos y acrónimos OHADA sin grounding |
| Pérdida de entrenamiento | no disponible | 2,6383 | 74 pasos, LoRA r=8 alpha=16 |
| Mejor pérdida de validación | no disponible | 3,6293 | — |
| Latencia por turno | no disponible | 23–28 s | GPU Vulkan |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM: al menos 8 GB de RAM para el GGUF Q4_K_M de 2,38 GB; GPU Vulkan o CUDA recomendada.
- GPU recomendadas: no se especifican modelos concretos; el autor indica GPU Vulkan/CUDA. Por tamaño, una RTX 3060/4060 con 8 GB sería suficiente para el GGUF, aunque no está confirmado.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM para el GGUF Q4_K_M.
- Despliegue: llama.cpp (formato nativo GGUF); también safetensors para otros runtimes, aunque no se documentan vLLM, TGI ni Ollama.
- Latencia: 23–28 s por turno en GPU Vulkan según la model card.
- Excluido de APKs móviles; orientado a escritorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SautiLM-Kuu-Ius | 3,88 B | 4096 | Gemma | Derecho RDC/OHADA, offline, fr/en/sw |
| unsloth/gemma-3-4b-it (base) | 3,88 B | no disponible | Gemma | Propósito general, multilingüe |
| SautiLM-Kuu-Med (AfyaSpeak) | 4 B (familia Kuu) | no disponible | Gemma | Dominio médico, pre-piloto |
| SautiLM-Jua-Ius | 270 M | no disponible | Gemma | Derecho RDC/OHADA en móvil |

No se dispone de comparativas con modelos legales de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Prototipo pre-piloto de investigación legal: requiere verificación por parte de un abogado o clínico antes de cualquier uso real.
- Los pesos por sí solos fallan 0/3 en `domain_eval_v2`, fabricando números de artículo y acrónimos OHADA; es obligatorio combinarlos con RAG (`sautilm_codes_rdc.sqlite`) y `LegalCitationVerifier`.
- Riesgo elevado de alucinación en citas legales si no se aplica grounding.
- Contexto limitado a 4096 tokens, insuficiente para documentos legales extensos sin troceado.
- Idiomas limitados a fr, en y sw; no se documenta español ni otras lenguas locales de la RDC.
- Dataset de entrenamiento muy reducido (338 ejemplos), lo que limita la generalización.
- Licencia Gemma Terms of Use: revisar restricciones de uso comercial antes de desplegar.
- Latencia alta (23–28 s por turno en GPU Vulkan) para uso interactivo.
- Excluido de despliegues móviles; solo escritorio.
- Sesgos conocidos: no documentados explícitamente en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/sautilm/SautiLM-Kuu-Ius
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it
- Sitio web SautiLM: https://sautilm.com
- MusanTek: https://musantek.com
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
