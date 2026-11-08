# mradermacher/CherryPit-1.2-2B-i1-GGUF

## Resumen

CherryPit-1.2-2B-i1-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo CherryPit-1.2-2B, generada por el usuario mradermacher mediante cuantizacion con imatrix (importance matrix). El modelo base procede del repositorio DRUPEs/CherryPit-1.2-2B y, por el contexto de versiones anteriores de la misma familia, parece estar construido sobre la arquitectura MiniCPM, orientada a dispositivos de borde y a modelos de lenguaje pequenos.

Este repositorio no contiene un modelo nuevo ni pesos originales: es un artefacto de distribucion que empaqueta el modelo en multiples niveles de cuantizacion (desde IQ1_S hasta Q6_K, incluyendo variantes Q2_K, Q3_K, Q4_K, Q5_K, IQ2, IQ3 e IQ4) para su uso con llama.cpp y herramientas compatibles. Su relevancia es practica: permite ejecutar un modelo conversacional de aproximadamente 2B parametros en hardware de consumo con huellas de memoria muy reducidas.

La informacion publicada es escasa. El repositorio no expone model card propia, pipeline, licencia ni idiomas declarados, y el tamano del repo aparece como 0.0 GB, lo que sugiere que los pesos no estan efectivamente alojados o que los metadatos no se han actualizado. Cualquier dato sobre entrenamiento, benchmarks o capacidades debe contrastarse con el modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer denso tipo MiniCPM, segun la familia del modelo base) |
| Parametros totales | ~2B segun el nombre del modelo; el campo de parametros del repo (1.552.110) no es coherente con esa cifra y se considera no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en este repo (la version 1.1 del mismo autor declara Apache-2.0; no confirmado para 1.2) |
| Formato de pesos | GGUF (cuantizado, con imatrix / weighted quants) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. Por el nombre y por la trazabilidad de la familia (CherryPit-1.1-2B-GGUF, etiquetado como MiniCPM, small-language-model y on-device), es razonable situarlo en la estirpe de modelos densos de ~2B parametros optimizados para inferencia en dispositivo, pero no hay confirmacion en la informacion disponible sobre numero de capas, dimension oculta, tipo de atencion ni estrategia de tokenizacion.

Respecto al entrenamiento, no se han publicado datos sobre volumen de tokens, composicion del dataset ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones. Lo unico documentado en este repositorio es el proceso de cuantizacion: el autor indica el uso de cuantizaciones ponderadas con imatrix (`weighted/imatrix quants`) y metadatos de conversion (`convert_type: hf`, `output_tensor_quantised: 1`, `quantize_version: 2`), lo que implica una conversion desde pesos Hugging Face a GGUF y una calibracion de la matriz de importancia para mejorar la fidelidad de los niveles bajos de bits.

## Capacidades

- Generacion de texto conversacional, segun el proposito declarado de la familia (modelo pequeno de chat).
- Razonamiento basico y matematicas, segun las etiquetas de la version 1.1 de la familia; no verificado para 1.2.
- Generacion de codigo, igualmente inferido de las etiquetas de la familia, no confirmado en este repo.
- Tool calling / function calling: la version 1.1 de la familia lo declara en sus etiquetas; no confirmado para 1.2.
- Ejecucion en dispositivo (on-device) gracias a las cuantizaciones de baja huella.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Asistente conversacional local en portatil: con cuantizaciones Q4_K_M o IQ4_XS, un modelo de ~2B cabe en 2-3 GB de RAM/VRAM, lo que permite desplegar un chatbot privado sin conexion en equipos de gama media.
- Clasificacion y extraccion de informacion en pipelines de datos: usar el modelo para etiquetar, resumir o extraer campos de documentos en lotes, ejecutandolo con llama.cpp sobre CPU y evitando costes de API.
- Prototipado rapido de agentes: si se confirma el soporte de tool calling heredado de la familia, sirve para validar flujos de function calling en local antes de migrar a modelos mayores.
- Generacion de codigo asistida en entornos con recursos limitados: util para autocompletado o explicacion de fragmentos en IDE, siempre que se valide la calidad real del modelo base.
- Educacion e investigacion: banco de pruebas para estudiar el impacto de la cuantizacion con imatrix en tareas de razonamiento, comparando IQ2/IQ3 frente a Q4/Q5 sobre el mismo modelo.
- Despliegue en dispositivos de borde: integracion en aplicaciones de escritorio o moviles mediante llama.cpp u Ollama, donde el espacio de almacenamiento y la memoria son la restriccion principal.
- Filtrado y moderacion de texto a gran escala: un modelo pequeno y cuantizado puede procesar volumenes altos de texto con baja latencia si la tarea es acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 0,8-1,2 GB para IQ1/IQ2, 1,3-1,7 GB para Q3/IQ3, 1,8-2,4 GB para Q4/IQ4, 2,5-3,2 GB para Q5 y 3,5-4,2 GB para Q6_K, incluyendo overhead de contexto (estimaciones por tamano, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM (GTX 1660, RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien resulta viable en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 4 GB o mas, y en CPU con 4-8 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; vLLM y TGI no son la via natural para estos ficheros cuantizados.
- Latencia y throughput: no disponibles; dependeran del nivel de cuantizacion y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| CherryPit-1.2-2B-i1-GGUF (este) | ~2B (segun nombre) | no disponible | no disponible | GGUF (24 niveles) | Hugging Face |
| CherryPit-1.1-2B-GGUF | ~2B | no disponible | Apache-2.0 | GGUF | Hugging Face |
| CherryPit-1.2-2B-GGUF | ~3B (segun busqueda) | no disponible | no disponible | GGUF | Hugging Face |
| Qwen2.5-1.5B-Instruct (referencia de categoria) | 1,5B | 32K | Apache-2.0 | safetensors, GGUF | Amplia |

La comparativa con modelos de otras familias no puede completarse con datos de rendimiento porque no hay benchmarks publicados para este modelo. Las alternativas de la misma familia (1.1 y 1.2 sin imatrix) presentan practicamente las mismas caracteristicas, diferenciandose por la licencia declarada y el esquema de cuantizacion.

## Limitaciones y advertencias

- Repositorio sin model card, sin licencia declarada y sin idiomas especificados: no se puede asumir uso comercial sin verificar la licencia del modelo base.
- El campo de parametros del repo (1.552.110) es inconsistente con el nombre del modelo (~2B); no debe usarse como referencia tecnica.
- El tamano del repo figura como 0.0 GB, lo que puede indicar que los ficheros no estan disponibles o que los metadatos estan desactualizados.
- Las cuantizaciones IQ1 e IQ2 degradan de forma notable la calidad en modelos pequenos; para produccion conviene Q4_K_M o superior.
- Riesgo de alucinacion elevado por el tamano reducido del modelo, especialmente en tareas de conocimiento factual y razonamiento multi-paso.
- Capacidades de tool calling, codigo y matematicas inferidas de la familia, no verificadas en esta version.
- Sin datos de sesgos, contexto maximo ni evaluaciones de seguridad.
- No apto como sustituto de modelos mayores en tareas que exijan precision alta sin una evaluacion previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/CherryPit-1.2-2B-i1-GGUF
- Modelo base: https://huggingface.co/DRUPEs/CherryPit-1.2-2B
- Version sin imatrix: https://huggingface.co/mradermacher/CherryPit-1.2-2B-GGUF
- Version anterior de la familia: https://huggingface.co/mradermacher/CherryPit-1.1-2B-GGUF
