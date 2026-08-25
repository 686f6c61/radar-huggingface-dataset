# ewald1976/nm-cannabism-v5-gguf

## Resumen

`nm-cannabism-v5-gguf` es un modelo de lenguaje conversacional finetuneado a partir de **Mistral NeMo Instruct 12B** (versión de julio de 2024) y convertido al formato **GGUF** mediante la librería **Unsloth**. El modelo está publicado por el usuario `ewald1976` y su nombre sugiere una especialización en el ámbito del cannabis, aunque la documentación pública no detalla el corpus de entrenamiento ni las tareas específicas. Se distribuye en un único archivo cuantizado en `Q6_K`, lo que lo hace apto para ejecución local con `llama.cpp` o `Ollama`.

La relevancia de este modelo radica en que ofrece una alternativa ligera y local para aplicaciones conversacionales sobre un nicho concreto, sin depender de APIs externas. Sin embargo, la falta de información técnica y de licencia clara limita su uso en entornos profesionales sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Mistral NeMo, base instruct 2407) |
| Parametros totales | 12.247.782.400 (12.2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta 128k, pero no se confirma para este finetune) |
| Tipos de cuantizacion | Q6_K (unico archivo disponible) |
| Idiomas soportados | No disponible (el modelo base Mistral NeMo soporta multilingue, pero no se especifica para este finetune) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors original no publicado) |

## Arquitectura y entrenamiento

El modelo parte de **Mistral NeMo Instruct 12B**, una arquitectura transformer densa con 12.2 mil millones de parámetros, entrenada por Mistral AI en colaboración con NVIDIA. El finetune fue realizado con **Unsloth**, una librería que optimiza el entrenamiento de modelos mediante técnicas como *LoRA* y *QLoRA*, lo que reduce notablemente los recursos necesarios. El proceso de conversión a GGUF se llevó a cabo también con Unsloth, generando el archivo `mistral-nemo-instruct-2407.Q6_K.gguf`.

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens, ni la metodología de ajuste (RLHF, DPO, etc.). Tampoco se documentan innovaciones técnicas específicas más allá del uso de Unsloth para la optimización del finetune.

## Capacidades

- Generacion de texto conversacional: el modelo está etiquetado como `conversational`, por lo que está orientado a mantener diálogos multi-turno.
- Ejecucion local eficiente: al estar en formato GGUF, puede ejecutarse en CPU o GPU con `llama.cpp`, `Ollama` o cualquier runtime compatible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede integrarse en servicios de inferencia que soporten el formato GGUF.
- Especializacion tematica: por su nombre, el modelo parece estar finetuneado para el dominio del cannabis (posiblemente información científica, legal o de consumo), aunque no hay evidencia concreta en la documentacion.

## Casos de uso

- **Asistente conversacional de nicho**: el modelo puede integrarse en un chatbot local para responder preguntas sobre cannabis, extraccion, cultivo o legislacion, sin depender de servicios externos.
- **Desarrollo de prototipos**: su tamaño moderado (12B) y cuantizacion Q6_K permiten probar flujos conversacionales en entornos de desarrollo con una GPU de 16 GB.
- **Educacion y divulgacion**: puede servir como base para una aplicacion educativa sobre los efectos y usos del cannabis, aunque es necesario verificar la fiabilidad de las respuestas.
- **Investigacion academica**: para estudios que requieran un LLM localizable sobre un tema especifico, este modelo puede ser un punto de partida, siempre que se validen sus respuestas.
- **Integracion en pipelines de agentes**: al ser compatible con llama.cpp, puede usarse en sistemas de agentes simples que necesiten generacion de texto en tiempo real sin latencia de red.
- **Pruebas de cuantizacion**: su archivo Q6_K permite evaluar el comportamiento de cuantizaciones de alto bitrate en modelos de 12B, útil para decisiones de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No es posible comparar objetivamente este modelo con otros sin datos de evaluacion.

## Requisitos de hardware

- **VRAM estimada**: el archivo GGUF Q6_K pesa 10.1 GB, por lo que se recomienda una GPU con al menos 12 GB de VRAM para inferencia cómoda (por ejemplo, RTX 3060 12GB, RTX 4070, RTX 4080). Con 16 GB se dispone de margen para contexto largo.
- **CPU**: puede ejecutarse en CPU con `llama.cpp`, aunque la velocidad será menor; se recomienda al menos 32 GB de RAM.
- **GPU recomendadas**: NVIDIA RTX 3090, RTX 4090, A100, o cualquier GPU con soporte CUDA y suficiente VRAM.
- **Opciones de despliegue**: `llama.cpp`, `Ollama`, `vLLM` (si se convierte a safetensors), `llama-cpp-python`, o cualquier servidor compatible con GGUF.
- **Latencia y throughput**: no se han publicado datos; en una RTX 4090 se espera una generación de 20-40 tokens/s con contexto corto, pero es una estimacion sin base oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `nm-cannabism-v5-gguf` | 12.2B | No disponible | No disponible | GGUF | HuggingFace |
| Mistral NeMo Instruct 12B | 12.2B | 128K | Apache 2.0 | Safetensors | HuggingFace |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 License | Safetensors/GGUF | HuggingFace |
| Qwen 2.5 14B | 14B | 128K | Apache 2.0 | Safetensors/GGUF | HuggingFace |

Nota: la comparativa se basa en las caracteristicas del modelo base; no hay datos de rendimiento del finetune.

## Limitaciones y advertencias

- **Licencia desconocida**: no se especifica la licencia del modelo. Esto impide su uso comercial sin riesgo legal hasta que se aclare.
- **Sesgos de dominio**: al estar especializado en cannabis, puede presentar sesgos en temas relacionados, como drogas o legalidad. No se ha documentado un proceso de alineacion.
- **Riesgo de alucinacion**: como todo modelo de lenguaje, puede generar informacion falsa o inexacta, especialmente en un dominio tan sensible como el cannabis.
- **Documentacion insuficiente**: no se detallan los datos de entrenamiento, ni las tecnicas de ajuste, lo que impide evaluar su fiabilidad.
- **Contexto limitado**: aunque el base soporta 128K, no se confirma que el finetune preserve esa capacidad; se recomienda probar con contextos cortos.
- **Formato unico**: solo se ofrece una cuantizacion (Q6_K), lo que limita la flexibilidad para dispositivos con menos recursos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ewald1976/nm-cannabism-v5-gguf)
- [Coleccion de GGUF del autor](https://huggingface.co/collections/ewald1976/ggufs)
- [Modelo similar del mismo autor: Newton-Insights-V1-cannabis-extraction-science](https://huggingface.co/ewald1976/Newton-Insights-V1-cannabis-extraction-science-Q5_K_M)
- [Repositorio de GGUF de IBM (referencia para conversion)](https://github.com/IBM/gguf)
