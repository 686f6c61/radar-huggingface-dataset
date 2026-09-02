# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ4e-1M

## Resumen

El modelo **Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ4e-1M** es una cuantización MLX de 4 bits mixta (oQ4e-mtp) desarrollada por **Solstice-AI** sobre el modelo base **DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU**, que a su vez deriva del modelo **Qwen3.8-27B** de Alibaba. Está diseñado específicamente para ejecutarse en hardware Apple Silicon con aceleración Metal, aprovechando la memoria unificada para ofrecer una inferencia rápida y eficiente en equipos con 16 GB o 24 GB de RAM.

La cuantización oQ4e-mtp reduce el tamaño del modelo a 17,0 GB (frente a los 54,0 GB del BF16 original) y consigue una velocidad de generación 2,20 veces superior a la línea base, gracias a la incorporación de cabezas de predicción multi-token (MTP) para decodificación especulativa. El modelo mantiene un contexto de hasta 1.000.000 de tokens y conserva capacidades multimodales de visión, lo que lo hace adecuado para tareas de razonamiento visual, codificación agéntica y procesamiento de documentos largos. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (lineal en 48 de 64 capas) y torre de vision |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.000.000 tokens (contexto nativo del modelo base: 262.000 tokens, extensible) |
| Tipos de cuantizacion | oQ4e-mtp (4-bit mixto), oQ6e-mtp (6-bit), oQ8e-mtp (8-bit), BF16 (sin cuantizar) |
| Idiomas soportados | Ingles (en), Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX), tambien disponible en GGUF en otras variantes |

## Arquitectura y entrenamiento

El modelo base **Qwen3.8-27B** es un transformer denso de 27.000 millones de parametros con una arquitectura hibrida de atencion: 48 de sus 64 capas utilizan atencion lineal, mientras que las restantes emplean atencion por softmax completa. Incluye una torre de vision integrada que permite procesamiento multimodal de imagenes y video, y un cabezal de prediccion multi-token (MTP) que actua como modelo de draft para decodificacion especulativa. El contexto nativo es de 262.000 tokens, ampliable hasta 1.000.000 mediante tecnicas de extension.

La variante **Cold Fusion** (desarrollada por DavidAU) reduce significativamente los tokens de pensamiento en los modos de razonamiento, llegando a usar entre 1/5 y 1/2 de los tokens que emplea el Qwen3.8-27B estandar, lo que mejora la velocidad y la eficiencia sin sacrificar precision. El proceso de cuantizacion oQ4e-mtp de Solstice-AI aplica precision mixta por capas, manteniendo las capas criticas en mayor precision y cuantizando el resto a 4 bits, lo que minimiza la perdida de calidad. No se han publicado detalles completos sobre el dataset de entrenamiento ni el proceso de alineacion (RLHF/DPO) del modelo base.

## Capacidades

- **Generacion de texto y razonamiento**: soporta modos de pensamiento configurable (thinking mode) con presupuesto de tokens ajustable.
- **Codificacion**: genera y depura codigo en multiples lenguajes, con soporte para tool calling y agentic coding.
- **Vision multimodal**: procesa imagenes y video, permite razonamiento visual, analisis de UI y comprension de documentos escaneados.
- **Contexto largo**: maneja hasta 1.000.000 de tokens, adecuado para analisis de libros completos, repositorios de codigo o conversaciones extensas.
- **Decodificacion especulativa MTP**: genera multiples tokens por pasada, reduciendo la latencia en hardware Apple Silicon.
- **Multilingue**: fluido en ingles y chino, con capacidades limitadas en otros idiomas.
- **Tool calling y agentes**: integrable en pipelines de agentes multi-paso, con soporte para llamadas a funciones y APIs externas.

## Casos de uso

- **Asistente de codigo en entornos Apple Silicon**: desarrolladores que trabajan en Mac pueden ejecutar el modelo localmente con 16 GB de RAM, usandolo para autocompletado, revision de codigo y generacion de tests dentro de IDEs como VS Code o Xcode, gracias a su velocidad 2,2x y su soporte de tool calling.
- **Analisis de documentos largos**: con su contexto de 1M tokens, el modelo puede resumir informes anuales, expedientes legales o libros completos en una sola pasada, sin necesidad de dividir el texto en fragmentos.
- **Razonamiento visual sobre capturas de pantalla**: la vision multimodal permite al modelo interpretar interfaces de usuario, diagramas o graficos, util para automatizar pruebas de UI o generar descripciones accesibles.
- **Agente conversacional para atencion al cliente**: empresas con infraestructura en Mac pueden desplegar un chatbot multilingue (en/zh) que mantiene conversaciones de larga duracion y consulta bases de conocimiento externas mediante function calling.
- **Generacion de documentacion tecnica**: el modelo puede redactar guias, manuales y comentarios de codigo a partir de repositorios completos, aprovechando su capacidad de razonamiento y su ventana de contexto amplia.
- **Prototipado rapido de aplicaciones de IA**: investigadores y estudiantes pueden experimentar con un modelo de 27B en hardware de consumo (Mac mini, MacBook Pro) sin necesidad de GPUs dedicadas, gracias a la cuantizacion oQ4e y al runtime Anvil.

## Benchmarks y rendimiento

La model card del autor proporciona los siguientes resultados empiricos para distintas precisiones (datos del autor, no verificados de forma independiente):

| Precision | Tamano | MMLU | MMLU_Pro | HumanEval | Velocidad relativa | Hardware minimo |
|---|---|---|---|---|---|---|
| BF16 (sin cuantizar) | 54,0 GB | 87,3% | 68,7% | 89,0% | 1,00x | 64 GB+ Mac Studio / A100 |
| oQ8e-mtp (8-bit) | 30,0 GB | 87,0% | 68,7% | 89,6% | 1,45x | 36-48 GB Mac / A10G |
| oQ6e-mtp (6-bit) | 23,7 GB | 86,0% | 70,0% | 88,4% | 1,72x | 32 GB+ memoria unificada |
| **oQ4e-mtp (4-bit)** | **17,0 GB** | **86,3%** | **66,3%** | **86,6%** | **2,20x** | **16/24 GB Mac (M-series)** |

No se han publicado resultados de benchmarks en la informacion disponible para comparar directamente con otros modelos de la misma categoria.

## Requisitos de hardware

- **VRAM estimada**: 15,2 GB de memoria unificada para la version oQ4e-mtp (cabe en Macs de 16 GB y 24 GB).
- **GPU recomendadas**: Apple Silicon (M1, M2, M3, M4) con 16 GB o mas de memoria unificada. Para la version BF16 se requieren 64 GB+ o una GPU NVIDIA A100.
- **Compatibilidad con GPU de consumo**: no esta pensado para GPUs NVIDIA convencionales; el formato MLX esta optimizado para Metal en Apple Silicon. Existen variantes GGUF para otros entornos, pero no se han verificado en este repo.
- **Opciones de despliegue**: runtime **Anvil** (binario unico, con soporte OpenAI-compatible) y **MLX-LM** (libreria Python con servidor integrado). Tambien se puede usar con vLLM o TGI si se convierte a otros formatos, aunque no es el flujo recomendado.
- **Latencia y throughput**: la velocidad de generacion es 2,20x respecto al BF16 en el mismo hardware, gracias a la decodificacion especulativa MTP. No se proporcionan cifras absolutas de tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| **Qwen3.8-27B (original)** | 27B | 262K (ext. 1M) | Apache 2.0 | BF16, GGUF, etc. | Modelo base sin cuantizar, requiere 64 GB+ para inferencia local |
| **Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-mlx-6Bit** | 27B | 1M | Apache 2.0 | MLX 6-bit | Variante Cold Fusion con cuantizacion de 6 bits, menor velocidad que oQ4e |
| **Solstice-AI oQ4e-mtp (este modelo)** | 27B | 1M | Apache 2.0 | MLX 4-bit mixto | Optimizado para Apple Silicon, 2,2x velocidad, 15,2 GB de memoria |

La comparativa se basa en los datos publicados por el autor y en la informacion del modelo base. No se dispone de datos de rendimiento independientes para otros modelos de 27B como Llama 3.1 27B o Gemma 2 27B en este contexto.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo derivado de Qwen3.8-27B, puede presentar sesgos presentes en los datos de entrenamiento originales. El nombre "Uncensored" sugiere que no se aplicaron filtros de seguridad adicionales, lo que aumenta el riesgo de generar contenido inapropiado o falso.
- **Riesgo de alucinacion**: en tareas de razonamiento complejo o con contexto muy largo, el modelo puede inventar hechos o citas. Se recomienda validar las salidas en entornos de produccion.
- **Limitaciones de idioma**: solo soporta ingles y chino de forma nativa; otros idiomas pueden producir resultados de menor calidad.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo base puede tener condiciones adicionales (no se han verificado).
- **Dependencia de hardware**: la cuantizacion oQ4e-mtp esta optimizada exclusivamente para Apple Silicon; en otros hardware (NVIDIA, AMD) no funcionara sin conversion previa.
- **Perdida de precision**: la cuantizacion a 4 bits introduce una degradacion de aproximadamente 1 punto porcentual en MMLU y 2,4 puntos en HumanEval respecto al BF16, segun los datos del autor.
- **Sin garantias de produccion**: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad. Se recomienda realizar pruebas exhaustivas antes de usarlo en entornos criticos.

## Enlaces

- [HuggingFace - Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ4e-1M](https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ4e-1M)
- [Modelo base - DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU](https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU)
- [Qwen3.8-27B original - Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Runtime Anvil - GitHub](https://github.com/Solstice-Labs/anvil)
- [Sitio web de Solstice-AI](https://solstice-ai.co)
- [Benchmark de la variante 6-bit en omlx.ai](https://omlx.ai/benchmarks/performance/e20zx4qx)
