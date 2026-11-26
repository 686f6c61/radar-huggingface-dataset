# AEON-7/Aeon3.8-Flash-Next-ULTIMATE-UNCENSORED-NVFP4-XS

## Resumen

Aeon3.8-Flash-Next-ULTIMATE-UNCENSORED-NVFP4-XS es una cuantización de 4 bits (NVFP4) del modelo Aeon3.8-Flash-Next-Ultimate-Uncensored-BF16, publicado por AEON-7. Se trata de una variante "abliterated" (con los mecanismos de rechazo eliminados) del modelo Qwen3.8-Flash-Next de Qwen, una arquitectura de mezcla de expertos (MoE) que constituye la vista previa abierta de la arquitectura subyacente a Qwen4. El paquete reduce un modelo de aproximadamente 360 GB en precisión completa a unos 98 GiB, lo que permite ejecutarlo en hardware de escritorio como una DGX Spark.

La relevancia de esta ficha radica en su propuesta de despliegue: un modelo de gran escala (descrito por el autor como de 180.000 millones de parámetros) comprimido hasta caber en una única máquina con 131K tokens de contexto y entrada de imágenes. El autor reporta métricas medidas en su propio hardware, incluyendo velocidad de decodificación, recuperación de hechos en contextos largos y tasas de rechazo reducidas a cero. No obstante, debe advertirse que el repositorio no incluye resultados de benchmarks estándar ampliamente reconocidos (MMLU, HumanEval, GSM8K) y que muchas de las afirmaciones provienen exclusivamente de la model card del autor.

El modelo se distribuye con licencia qwen-community-1.0 (etiquetada como "other" en Hugging Face) y con pesos en dos formatos: un paquete Strata en la raíz del repositorio y una build de safetensors para vLLM en el subdirectorio `vllm/`. El tamaño total del repositorio es de 214,1 GB, aunque solo es necesario descargar la variante correspondiente al hardware de destino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, con 512 expertos por capa y 10 consultados por token; incluye una tabla n-grama de 51.000 millones de parámetros |
| Parametros totales | 180.000 millones (según model card); el campo de safetensors del repo indica 4.947.698.560 para el artefacto XS |
| Parametros activos | 10 de 512 expertos por token (el autor no especifica el recuento exacto de parámetros activos) |
| Longitud de contexto | 131K tokens (256K en la configuración de dos Sparks con razonamiento largo) |
| Tipos de cuantizacion | NVFP4 (4 bits), GPTQ, GGUF; cuantización de 4 bits con formato Strata y safetensors para vLLM |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | safetensors y GGUF; paquete Strata (98 GiB) y build vLLM en `vllm/` (108 GB) |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) en la que cada capa aloja 512 expertos y consulta diez de ellos por token. Junto a los expertos, el modelo incorpora una tabla n-grama de 51.000 millones de parámetros que actúa como memoria de búsqueda para secuencias cortas de tokens. El autor describe el modelo base Qwen3.8-Flash-Next como la vista previa abierta de la arquitectura de Qwen4. La cuantización NVFP4 reduce el peso de precisión completa (aproximadamente 360 GB) hasta los 98 GiB del paquete Strata, manteniendo, según el autor, la entrada de imágenes y el contexto de 131K tokens.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La variante "uncensored" y "abliterated" implica la eliminación de los mecanismos de rechazo mediante técnicas de edición de pesos, aunque el autor no detalla el procedimiento exacto. Entre las innovaciones técnicas destacadas en la model card figuran el uso de decodificación especulativa mediante DFlash2 y una cabeza MTP (multi-token prediction) integrada, además del soporte para despliegue con vLLM y el motor Strata.

## Capacidades

- Generación de texto y conversación multi-turno con contexto largo de hasta 131K tokens (256K en configuración de dos Sparks).
- Razonamiento complejo: el autor reporta la resolución de 26 de 28 problemas de razonamiento difíciles, equiparable al modelo sin cuantizar.
- Entrada de imágenes (pipeline image-text-to-text): lectura de facturas, gráficos y diagramas.
- Recuperación de hechos en documentos largos: 28 de 28 hechos ocultos recuperados en documentos de hasta 128K tokens.
- Modo de razonamiento (thinking mode) con advertencia del autor sobre bucles en modo pensamiento a ciertas temperaturas.
- Decodificación especulativa con DFlash2 y cabeza MTP para acelerar la inferencia.
- Capacidades multilingües: el autor menciona que la cabeza MTP integrada rinde mejor en texto multilingüe, aunque no se detallan los idiomas soportados.
- Eliminación de rechazos: 0 de 56 solicitudes rechazadas frente a 29 del modelo original, según mediciones del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: la model card incluye instrucciones para agentes en `AGENTS.md`, lo que sugiere compatibilidad con flujos agénticos, aunque no se detallan capacidades específicas.

## Casos de uso

- Estación de trabajo personal de IA: con una única DGX Spark y el motor Strata + DFlash2 se obtienen 60,6 tok/s para un solo usuario, lo que permite usar el modelo como asistente local con contexto de 131K tokens e imágenes.
- Servidor de equipo para varios agentes: con dos DGX Sparks enlazados y AEON vLLM Ultimate en tensor-parallel se alcanzan 359 tok/s repartidos entre 16 usuarios, adecuado para un equipo que ejecuta varios agentes simultáneos.
- Procesamiento de documentos largos: el contexto de 256K tokens en la configuración de dos Sparks permite introducir libros completos o expedientes extensos y realizar razonamiento sobre ellos.
- Análisis de facturas, gráficos y diagramas: la entrada de imágenes permite extraer información de documentos escaneados y figuras dentro de un pipeline de automatización documental.
- Despliegue a escala departamental: con cuatro DGX Sparks y dos réplicas más un balanceador se alcanzan 748 tok/s para 32 usuarios, útil para un departamento o un enjambre de agentes grande.
- Investigación sobre alineación y rechazos: la variante abliterated permite estudiar el comportamiento del modelo sin mecanismos de rechazo, comparando las respuestas con las del modelo original (29 de 56 rechazos).
- Generación de código y matemáticas con decodificación especulativa: el autor señala que DFlash2 rinde mejor en salidas predecibles como matemáticas, código y texto repetido, lo que lo hace adecuado para pipelines de generación de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor únicamente reporta métricas propias medidas en su hardware entre el 21 y el 25 de noviembre de 2026:

| Metrica | Resultado reportado |
|---|---|
| Rechazos | 0 de 56 (modelo original: 29 de 56) |
| Recuperación de hechos ocultos (documentos hasta 128K) | 28 de 28 |
| Problemas de razonamiento difíciles | 26 de 28 (igual que el modelo sin cuantizar) |
| Velocidad, 1 DGX Spark, Strata + DFlash2 | 60,6 tok/s (un usuario); 73 tok/s en 4 flujos |
| Velocidad, 1 DGX Spark, AEON vLLM Ultimate | 38,9 tok/s (un usuario); 97,5 tok/s en 4 flujos |
| Velocidad, 2 DGX Sparks, tensor-parallel | 58-65 tok/s (un usuario); 359 tok/s en 16 flujos |
| Velocidad, 2 DGX Sparks, contexto 256K | 51 tok/s (un usuario); 145 tok/s en 4 flujos |
| Velocidad, 4 DGX Sparks | 58-65 tok/s (un usuario); 748 tok/s en 32 flujos |

## Requisitos de hardware

- VRAM estimada: el paquete Strata ocupa 98 GiB en disco y la build vLLM 108 GB; se requiere hardware con al menos esa capacidad de memoria unificada o VRAM.
- GPU recomendadas: DGX Spark (GB10) como plataforma validada por el autor; no se mencionan A100, H100 ni RTX 4090 en la información disponible.
- Compatibilidad con GPU de consumo: no disponible; el modelo no cabe en GPUs de consumo convencionales según los tamaños indicados.
- Opciones de despliegue: Strata + DFlash2, AEON vLLM Ultimate (build propia de vLLM para DGX Spark) con tensor-parallel, y formatos GGUF (motor no especificado); también se menciona GPTQ.
- Latencia y throughput: 60,6 tok/s con un solo usuario en una DGX Spark con Strata; 38,9 tok/s con vLLM Ultimate; hasta 748 tok/s agregados con cuatro Sparks y 32 flujos.
- Nota del autor: la build de vLLM Ultimate para una Spark requiere una imagen que aún no es pública.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Aeon3.8-Flash-Next-ULTIMATE-UNCENSORED-NVFP4-XS | 180B (MoE, 10 de 512 expertos) | 131K (256K en 2 Sparks) | qwen-community-1.0 | Hugging Face, pesos NVFP4/GGUF/safetensors |
| Qwen3.8-Flash-Next (modelo base) | 180B (MoE) | no disponible | qwen-community-1.0 | Hugging Face |
| Aeon3.8-Flash-Next-Ultimate-Uncensored-BF16 (base de la cuantización) | 180B (MoE) | no disponible | qwen-community-1.0 | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría (mismo tamaño o misma tarea) en la documentación proporcionada, ni de datos de rendimiento comparativo más allá de las métricas propias del autor.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; la eliminación de rechazos puede aumentar la probabilidad de respuestas sesgadas o inapropiadas en producción.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de alucinación; las métricas del autor se limitan a recuperación de hechos y razonamiento.
- Limitaciones de contexto o idioma: el contexto máximo validado es de 131K tokens (256K en configuración de dos Sparks); los idiomas soportados no están disponibles.
- Restricciones de licencia: licencia qwen-community-1.0 (etiquetada como "other"); deben revisarse los términos para uso comercial.
- Caveats para producción: la build de vLLM Ultimate para una sola Spark requiere una imagen no pública; el autor advierte de bucles en modo pensamiento a ciertas temperaturas y recomienda ajustes de muestreo específicos.
- Ausencia de benchmarks estándar: no hay resultados de MMLU, HumanEval o GSM8K, lo que dificulta la comparación objetiva con otros modelos.
- Discrepancia en el recuento de parámetros: el campo de safetensors del repositorio indica 4.947.698.560 parámetros para el artefacto XS, mientras que la model card describe 180.000 millones; esta discrepancia debe tenerse en cuenta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria aún inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/AEON-7/Aeon3.8-Flash-Next-ULTIMATE-UNCENSORED-NVFP4-XS
- Modelo base (BF16): https://huggingface.co/AEON-7/Aeon3.8-Flash-Next-Ultimate-Uncensored-BF16
- Modelo original Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de recetas y agentes: https://github.com/AEON-7/Aeon3.8-Flash-Next-Ultimate-Uncensored
- Build de vLLM para DGX Spark: https://github.com/AEON-7/vllm-ultimate-dgx-spark
- Instrucciones para agentes (AGENTS.md): https://huggingface.co/AEON-7/Aeon3.8-Flash-Next-ULTIMATE-UNCENSORED-NVFP4-XS/blob/main/AGENTS.md
- Paper referenciado (arxiv:2210.17323): https://arxiv.org/abs/2210.17323
