# Krhuz/DeepSeek-V4-Flash-0731-GGUF

## Resumen

DeepSeek-V4-Flash-0731 es la versión oficial (y sucesora de la vista previa) de DeepSeek-V4-Flash, un modelo de lenguaje desarrollado por DeepSeek-AI orientado a capacidades agénticas: uso de terminal, navegación de repositorios, herramientas y tareas de desarrollo de software. Esta ficha corresponde a la cuantización GGUF publicada por el usuario Krhuz con el método Unsloth Dynamic 2.0, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp u otros runtimes compatibles con GGUF.

El modelo destaca por superar a DeepSeek-V4-Pro (Preview) en los benchmarks agénticos publicados, pese a un número de parámetros activados mucho menor, y por ser "ampliamente competitivo" con los modelos propietarios más potentes según sus autores. Incorpora un módulo de decodificación especulativa (misma estructura que DeepSeek-V4-Flash-DSpark) y, según el repositorio base, contexto de un millón de tokens. La licencia MIT del modelo base lo hace especialmente atractivo para uso comercial y despliegues propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer con módulo de decodificación especulativa; detalles no publicados en la ficha) |
| Parametros totales | 284.334.567.511 (≈284 mil millones) |
| Parametros activos | no disponible (se indica que es "far smaller" que DeepSeek-V4-Pro, lo que sugiere arquitectura MoE, pero no se publica la cifra) |
| Longitud de contexto | no disponible (el título del informe técnico menciona "Million-Token Context Intelligence", es decir, contexto de un millón de tokens) |
| Tipos de cuantizacion | GGUF Unsloth Dynamic 2.0 (incluye UD-Q8_K_XL ≈162 GB y UD-Q4_K_XL; lista completa no disponible) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado a partir de safetensors del modelo base) |

## Arquitectura y entrenamiento

La ficha oficial indica que DeepSeek-V4-Flash-0731 comparte estructura con DeepSeek-V4-Flash-DSpark, es decir, incluye un módulo de decodificación especulativa acoplado al modelo principal. Con 284 mil millones de parámetros totales y un número de parámetros activados descrito como "mucho menor" que el de DeepSeek-V4-Pro, todo apunta a una arquitectura de mezcla de expertos (MoE), aunque la ficha no publica la cifra exacta de parámetros activos ni el número de expertos. El informe técnico (arXiv:2606.19348) lleva por título "DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence", lo que apunta a un enfoque de eficiencia en inferencia con contexto de un millón de tokens.

Sobre el proceso de entrenamiento no se ofrecen detalles en la información disponible: no se especifica el número de tokens de entrenamiento, la composición del corpus ni el uso de RLHF/DPO. La versión 0731 se describe como una mejora sustancial en capacidades agénticas respecto a la versión preview, lo que sugiere un post-entrenamiento intensivo en tareas de agentes, herramientas y código. En cuanto a la cuantización, Unsloth Dynamic 2.0 emplea matrices de importancia (imatrix) para priorizar los pesos más sensibles, logrando según el autor una precisión superior a otras cuantizaciones; el propio README señala que la variante Q8 (UD-Q8_K_XL, 162 GB) es "lossless a plena precisión".

## Capacidades

- Razonamiento agéntico de varios pasos: evaluado con el framework DeepSeek Harness en modo "max reasoning effort", con modos de pensamiento High y Max disponibles en Unsloth Studio.
- Uso de terminal y agentes de código: resultados destacados en Terminal Bench 2.1 (82,7), NL2Repo (54,2) y DeepSWE (54,4).
- Uso de herramientas (tool calling): puntuaciones en Toolathlon-Verified (70,3) y AutomationBench (25,1) indican soporte de function calling y orquestación de herramientas.
- Ciberseguridad ofensiva/defensiva en entornos de prueba: 76,7 en Cybergym.
- Tareas de desarrollo full-stack: 68,7 en DSBench-FullStack y 59,6 en DSBench-Hard.
- Generación de texto conversacional: el repositorio está etiquetado como "conversational".
- Decodificación especulativa integrada (DSpark), con soporte de hasta 2x de velocidad de decodificación según Unsloth.
- Contexto extenso (hasta un millón de tokens según el informe técnico) para procesar repositorios y documentos largos.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes de programación autónomos: el modelo puede operar como agente de código que navega repositorios completos (NL2Repo: 54,2), ejecuta comandos en terminal y corrige errores de forma iterativa, siendo adecuado para frameworks tipo SWE-agent o DeepSeek Harness.
- Asistentes de desarrollo integrados en IDE: gracias al tool calling y al contexto de un millón de tokens, puede indexar y razonar sobre bases de código grandes sin fragmentación, generando parches y refactorizaciones.
- Automatización de flujos de trabajo con herramientas: su puntuación en AutomationBench y Toolathlon lo hace adecuado para pipelines que combinan APIs, navegadores y herramientas CLI en tareas multi-paso.
- Ciberseguridad y auditoría de sistemas: el resultado en Cybergym (76,7) lo hace útil para reproducir y analizar vulnerabilidades en entornos controlados y para equipos de seguridad que automatizan pruebas.
- Desarrollo full-stack asistido: generación de aplicaciones completas (frontend, backend, despliegue) evaluada en DSBench-FullStack, útil para prototipado rápido guiado por instrucciones en lenguaje natural.
- Atención al cliente y asistentes conversacionales avanzados: con formato conversacional, tool calling y contexto largo, puede gestionar conversaciones multi-turno que requieran consultar sistemas externos.
- Despliegue local privado: la versión GGUF UD-Q4_K_XL permite ejecutar un modelo de nivel competitivo con los modelos propietarios en estaciones de trabajo con múltiples GPU, sin enviar datos a terceros, algo valioso en sectores regulados.

## Benchmarks y rendimiento

Datos publicados en la model card oficial (evaluación agéntica con DeepSeek Harness, modo minimal, razonamiento "max", temperature 1.0, top_p 0.95):

| Benchmark | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Flash (Preview) | DeepSeek-V4-Pro (Preview) | GLM-5.2 | Opus-4.8 |
|---|:---:|:---:|:---:|:---:|:---:|
| Terminal Bench 2.1 | 82,7 | 61,8 | 72,1 | 81,0 | 85,0 |
| NL2Repo | 54,2 | 39,4 | 38,5 | 48,9 | 69,7 |
| Cybergym | 76,7 | 38,7 | 52,7 | - | 83,1 |
| DeepSWE | 54,4 | 7,3 | 12,8 | 46,2 | 58,0 |
| Toolathlon-Verified | 70,3 | 49,7 | 55,9 | 59,9 | 76,2 |
| Agents' Last Exam | 25,2 | 15,8 | 16,5 | 23,8 | 25,7 |
| AutomationBench Public | 25,1 | 10,8 | 12,8 | 12,9 | 27,2 |
| DSBench-FullStack | 68,7 | 37,0 | 41,8 | 61,8 | 71,6 |
| DSBench-Hard | 59,6 | 25,8 | 31,1 | 54,5 | 71,7 |

Nota: DSBench-FullStack y DSBench-Hard son conjuntos de prueba internos de DeepSeek. No se han publicado resultados de benchmarks clásicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: la cuantización UD-Q8_K_XL ocupa 162 GB y la UD-Q4_K_XL 155 GB (7 GB menos según el README); el repo completo pesa 1280,6 GB, lo que sugiere que incluye múltiples cuantizaciones. Para Q4 se necesitan en la práctica 160-180 GB de memoria de GPU (o GPU + CPU offload).
- No cabe en una única GPU de consumo: se requieren al menos dos GPUs de 24 GB con offload agresivo a CPU/RAM (y 192 GB o más de RAM), o estaciones con 4-8 GPUs.
- GPU recomendadas: 2x RTX 3090/4090/5090 con offload a RAM para Q4 con velocidades bajas; configuraciones multi-GPU tipo 8x A100 80GB u 8x H100 para inferencia con throughput razonable en Q8 o superiores.
- Despliegue: llama.cpp (formato GGUF nativo), Ollama, LM Studio, Unsloth Studio (con conmutadores de pensamiento High/Max) y soporte de decodificación especulativa DSpark (hasta 2x más rápido en decodificación según Unsloth). No se menciona soporte vLLM/TGI para esta versión GGUF.
- Latencia y throughput: no disponibles; la decodificación especulativa DSpark promete hasta 2x de mejora sobre la decodificación estándar.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 | ≈284 mil millones (activos: no disponible) | 1M tokens (según informe técnico) | MIT | Abiertos en HuggingFace (base y GGUF) |
| DeepSeek-V4-Pro (Preview) | no disponible | no disponible | no disponible | Abiertos (preview) |
| GLM-5.2 | no disponible | no disponible | no disponible | no disponible |
| Opus-4.8 | no disponible | no disponible | Propietaria | Solo API, pesos no disponibles |

En los benchmarks agénticos, DeepSeek-V4-Flash-0731 supera a DeepSeek-V4-Pro (Preview) en todas las pruebas listadas y se sitúa cerca de Opus-4.8 (por ejemplo, 82,7 frente a 85,0 en Terminal Bench 2.1 y 25,2 frente a 25,7 en Agents' Last Exam), con la ventaja diferencial de que sus pesos son abiertos bajo licencia MIT y puede ejecutarse en local, mientras que Opus-4.8 solo está disponible vía API.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se publica información sobre sesgos en la model card.
- Riesgo de alucinación: como en todo modelo de lenguaje de gran tamaño, puede generar contenido incorrecto con apariencia plausible; los resultados agénticos publicados provienen de configuraciones concretas (temperature 1.0, top_p 0.95, razonamiento máximo) y pueden no reproducirse con otros ajustes.
- Limitaciones de contexto e idioma: el contexto de un millón de tokens procede del título del informe técnico y no de la ficha del modelo; los idiomas soportados no están documentados en la información disponible.
- Restricciones de licencia: la licencia MIT no impone restricciones de uso comercial, pero conviene verificar la licencia del modelo base deepseek-ai/DeepSeek-V4-Flash-0731 en su repositorio oficial.
- Caveats de producción: el tamaño en memoria (155-162 GB en las cuantizaciones principales) exige hardware multicapa o multi-GPU; parte de los benchmarks (DSBench-FullStack y DSBench-Hard) son conjuntos internos de DeepSeek, no verificables de forma independiente; el framework DeepSeek Harness estaba pendiente de publicación en el momento de la model card; y esta cuantización GGUF es de un tercero (Krhuz/Unsloth), no oficial de DeepSeek-AI, por lo que pequeñas desviaciones de precisión respecto al modelo original son posibles salvo en la variante Q8 declarada como lossless.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/Krhuz/DeepSeek-V4-Flash-0731-GGUF
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Variante DSpark: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-DSpark
- Informe técnico (arXiv): https://arxiv.org/abs/2606.19348
- Guia de Unsloth para DeepSeek-V4: https://unsloth.ai/docs/models/deepseek-v4
- Documentación de Unsloth Dynamic 2.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Documentación de DSpark (decodificación especulativa): https://unsloth.ai/docs/models/deepseek-v4#dspark-speculative-decoding
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Chat oficial de DeepSeek: https://chat.deepseek.com/
- Web de DeepSeek: https://www.deepseek.com/
