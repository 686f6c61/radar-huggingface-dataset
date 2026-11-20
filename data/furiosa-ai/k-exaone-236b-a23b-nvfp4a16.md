# furiosa-ai/K-EXAONE-236B-A23B-NVFP4A16

## Resumen

K-EXAONE-236B-A23B-NVFP4A16 es una compilación cuantizada del modelo K-EXAONE-236B-A23B desarrollado por LG AI Research, publicada por FuriosaAI. Se trata de un transformer autorregresivo de tipo Mixture-of-Experts (ExaoneMoE) con 236.000 millones de parámetros totales y 23.000 millones activos por token, que activa 8 expertos de un total de 128 más un experto compartido. El modelo cubre seis idiomas (coreano, inglés, español, alemán, japonés y vietnamita) y soporta tanto razonamiento como chat sin razonamiento.

La particularidad de esta ficha es la cuantización NVFP4A16 realizada por FuriosaAI: los pesos se almacenan en FP4 de 4 bits mientras que las activaciones y la caché KV permanecen en 16 bits. El repositorio incluye además un Furiosa Executable Bundle (FXB) para ejecutar el modelo sobre aceleradores FuriosaAI RNGD, aunque los pesos NVFP4A16 también pueden ejecutarse en vLLM, SGLang y Transformers. Esta compilación reduce el peso del repositorio a 354,4 GB frente a los aproximadamente 470 GB de los pesos en BF16 del modelo base.

El modelo resulta relevante porque demuestra la viabilidad de servir un MoE de 236B parámetros con 23B activos en hardware no-GPU (aceleradores NPU de FuriosaAI) mediante cuantización agresiva a FP4, manteniendo la precisión de activaciones y caché KV. Su licencia K-EXAONE AI Model License condiciona el uso comercial, por lo que es imprescindible revisarla antes de desplegar en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ExaoneMoE (transformer Mixture-of-Experts con atención híbrida: capas de ventana deslizante y capas de atención global intercaladas) |
| Parametros totales | 236B (según model card); 137.745.008.512 parámetros en los safetensors del repo cuantizado |
| Parametros activos | 23B por token (128 expertos, 8 activados + 1 compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (pesos en FP4 de 4 bits, activaciones y caché KV en 16 bits); 8-bit según tags de compressed-tensors |
| Idiomas soportados | en, ko, es, de, ja, vi |
| Licencia | K-EXAONE AI Model License (license: other, license_name: k-exaone) |
| Formato de pesos | safetensors (compressed-tensors), más FXB para FuriosaAI RNGD |

## Arquitectura y entrenamiento

K-EXAONE es un transformer autorregresivo de tipo Mixture-of-Experts con 236B parámetros totales y 23B activos por token. La capa MoE enruta cada token a 8 expertos de un total de 128, más un experto compartido que se activa siempre. La atención es híbrida: intercala capas de atención de ventana deslizante con capas de atención global, un esquema habitual para reducir el coste computacional de contextos largos manteniendo capacidad de atención a larga distancia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación, ya que la model card del repositorio cuantizado remite al modelo base sin detallarlas.

La innovación técnica principal de esta compilación es la cuantización NVFP4A16 realizada internamente por FuriosaAI: los pesos se comprimen a FP4 (4 bits) mientras que las activaciones y la caché KV permanecen en 16 bits, lo que reduce el footprint de memoria sin degradar la precisión de los estados intermedios. El repositorio incluye un Furiosa Executable Bundle (FXB) listo para ejecutarse en FuriosaAI RNGD con Furiosa-LLM, usando un tamaño de tensor-parallel de 32 PEs, que se mapea a cuatro tarjetas RNGD (8 PEs por tarjeta). Los pesos NVFP4A16 son además compatibles con vLLM, SGLang y Transformers.

## Capacidades

- Generación de texto conversacional multi-turno en seis idiomas (inglés, coreano, español, alemán, japonés y vietnamita).
- Razonamiento con modo "thinking" activado por defecto; la cadena de pensamiento se devuelve en un campo separado (`reasoning`) mediante el parser `deepseek_v3`.
- Conmutación de razonamiento por petición: se puede desactivar el thinking pasando `"chat_template_kwargs": {"enable_thinking": false}`.
- Tool calling / function calling mediante el parser `hermes` y la opción `--enable-auto-tool-choice`.
- API compatible con OpenAI (`/v1/chat/completions`), lo que facilita la integración con SDKs existentes.
- Soporte de streaming con campo `delta.reasoning` separado del contenido final.
- Capacidades multilingües nativas en los seis idiomas declarados, sin necesidad de adaptadores.

## Casos de uso

- **Atención al cliente multilingüe automatizada**: el modelo puede gestionar conversaciones multi-turno en español, inglés, coreano, alemán, japonés y vietnamita, manteniendo coherencia entre turnos y permitiendo alternar entre modo razonamiento (para consultas complejas) y modo directo (para respuestas rápidas) por petición.
- **Agentes con tool calling en producción**: gracias al soporte del parser `hermes` y `--enable-auto-tool-choice`, se puede integrar en pipelines de agentes que invocan APIs externas (consultas a bases de datos, reservas, búsquedas) con razonamiento intermedio visible para depuración.
- **Asistencia a desarrolladores con razonamiento explícito**: el campo `reasoning` separado permite auditar la cadena de pensamiento del modelo en tareas de depuración de código o explicación de errores, útil en entornos donde se requiere trazabilidad.
- **Procesamiento de documentación técnica multilingüe**: con soporte para seis idiomas, se puede usar para resumir, traducir o extraer información de documentación en coreano, japonés, alemán o vietnamita sin pipelines separados por idioma.
- **Generación de contenido con control de coste computacional**: al ser un MoE con 23B activos sobre 236B totales, el coste por token es mucho menor que un modelo denso equivalente, lo que lo hace adecuado para cargas de generación de contenido a gran escala donde la latencia importa.
- **Despliegue en infraestructura NPU de FuriosaAI**: el FXB incluido permite servir el modelo en cuatro tarjetas RNGD con Furiosa-LLM, una alternativa a clústeres de GPU para organizaciones que ya operan hardware FuriosaAI.
- **Investigación en cuantización FP4**: el repositorio sirve como referencia para estudiar el impacto de NVFP4A16 en un MoE de gran escala, comparando los pesos cuantizados con el modelo base en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 354,4 GB en disco con pesos NVFP4A16; en inferencia se necesita espacio adicional para activaciones y caché KV en 16 bits, por lo que el requisito real supera los 354 GB de pesos.
- **GPU/aceleradores recomendados**: FuriosaAI RNGD es el hardware de referencia, con tensor-parallel de 32 PEs sobre cuatro tarjetas (8 PEs por tarjeta).
- **Compatibilidad con consumer GPU**: no es viable en GPUs de consumo (RTX 4090 con 24 GB, RTX 5090 con 32 GB); el modelo requiere un clúster multi-acelerador.
- **Opciones de despliegue**: Furiosa-LLM (principal, con servidor compatible con OpenAI), vLLM, SGLang y Transformers para los pesos NVFP4A16.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Hardware de referencia |
|---|---|---|---|---|
| K-EXAONE-236B-A23B-NVFP4A16 (esta ficha) | 236B / 23B | no disponible | K-EXAONE AI Model License | FuriosaAI RNGD (4 tarjetas) |
| LGAI-EXAONE/K-EXAONE-236B-A23B (base) | 236B / 23B | no disponible | K-EXAONE AI Model License | GPU (BF16, ~470 GB de pesos) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (MoE de ~200B con ~20B activos) en la documentación proporcionada, por lo que no se puede establecer una comparativa cuantitativa con alternativas como DeepSeek-V3, Qwen MoE o Mixtral.

## Limitaciones y advertencias

- **Licencia restrictiva**: la K-EXAONE AI Model License condiciona el uso comercial; es obligatorio revisar el texto completo antes de desplegar en producción.
- **Riesgo de alucinación**: como todo modelo generativo de gran escala, puede producir información plausible pero incorrecta, especialmente en modo no-reasoning donde no hay cadena de pensamiento verificable.
- **Contexto no documentado**: la longitud máxima de contexto no se especifica en la información disponible, lo que impide garantizar el comportamiento en conversaciones o documentos largos.
- **Cobertura idiomática limitada**: solo seis idiomas declarados; el rendimiento en otros idiomas (portugués, francés, italiano, chino, árabe) no está garantizado.
- **Dependencia de hardware específico para el FXB**: el bundle Furiosa Executable Bundle solo funciona en FuriosaAI RNGD; para otros entornos hay que usar los pesos NVFP4A16 con vLLM, SGLang o Transformers, cuya madurez con este formato concreto no está documentada.
- **Configuración delicada del parser de razonamiento**: si se sirve con `--reasoning-parser deepseek_v3` sin `--default-chat-template-kwargs '{"enable_thinking": true}'`, las etiquetas `<think>...</think>` pueden filtrarse al texto de respuesta.
- **Sesgos**: no se documentan sesgos específicos en la información proporcionada; se recomienda evaluar en el dominio de aplicación.
- **Tamaño del repositorio**: 354,4 GB de descarga, lo que exige almacenamiento y ancho de banda considerables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/K-EXAONE-236B-A23B-NVFP4A16
- Modelo base: https://huggingface.co/LGAI-EXAONE/K-EXAONE-236B-A23B
- Licencia K-EXAONE: https://huggingface.co/LGAI-EXAONE/K-EXAONE-236B-A23B/blob/main/LICENSE
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- Sitio de FuriosaAI: https://furiosa.ai
