# meshllm/Qwen3.8-2.4T-A95B-UD-IQ4_XS-layers

## Resumen

Este repositorio no contiene un modelo nuevo, sino un **paquete de capas GGUF** para inferencia distribuida: el modelo `Qwen3.8-2.4T-A95B-UD-IQ4_XS` del autor `meshllm`, derivado del GGUF de Unsloth `unsloth/Qwen3.8-2.4T-A95B-GGUF`. La utilidad es permitir ejecutar un modelo de escala muy grande repartiendo sus 93 capas entre varias máquinas de un clúster local mediante el runtime Mesh LLM (`library_name: mesh-llm`, ABI `skippy`), con el objetivo de hacer viable la inferencia privada cuando el GGUF completo no cabe en un solo host.

El paquete se distribuye con cuantización `UD-IQ4_XS` (Unsloth Dynamic IQ4_XS), formato GGUF troceado por capas, y expone un endpoint compatible con OpenAI (`/v1/chat/completions`) a través del servidor local de Mesh LLM. El repositorio ocupa 1311,9 GB, coherente con un modelo de ~2,4 billones de parámetros a ~4,25 bits por peso (~1,28 TB de pesos), aunque la propia ficha del autor declara una escala de 95B y el recuento de safetensors del repo indica 26.262.741.376 parámetros.

La relevancia es de infraestructura más que de modelado: no hay entrenamiento nuevo ni ajuste, solo reempaquetado reproducible (con SHA-256 por artefacto) para repartir memoria y cómputo entre pares. La licencia es `other`, heredada del modelo de origen, y no se documentan idiomas, contexto ni benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en el paquete; el modelo de origen se identifica como familia Qwen3 (no se documenta si es transformer denso, MoE u otra) |
| Parámetros totales | 2,4 T según la nomenclatura del autor (`2.4T`); el recuento de safetensors del repo indica 26.262.741.376 (dato discrepante) |
| Parámetros activos | 95 B según la nomenclatura del autor (`A95B`) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | `UD-IQ4_XS` (Unsloth Dynamic IQ4_XS) en este paquete; el GGUF de origen ofrece otras variantes no listadas aquí |
| Idiomas soportados | No disponible |
| Licencia | `other` (heredada de `unsloth/Qwen3.8-2.4T-A95B-GGUF`) |
| Formato de pesos | GGUF, dividido en artefactos por capa (layer package) |
| Número de capas | 93 |
| Modelo de origen | `unsloth/Qwen3.8-2.4T-A95B-GGUF:UD-IQ4_XS` |
| Fichero fuente | `UD-IQ4_XS/Qwen3.8-2.4T-A95B-UD-IQ4_XS-00001-of-00029.gguf` (29 fragmentos en el origen) |
| Revisión de origen | `567d3e6ac26c5474b18311e619c04350fb9a5556` |
| SHA-256 del fichero fuente | `4b43a08dc65b82dcc5a0e79cd6ea90d6efbb48a467075b847d5f8e7ea4b92fce` |
| SHA-256 del manifiesto | `cad2c71715d2963e266eb5b4fd56b7f3b26eb77fcdc732248c347e3bfab443d8` |
| Tamaño del repositorio | 1311,9 GB |
| Runtime / librería | `mesh-llm` (ABI de paquete `skippy`) |
| Pipeline | `text-generation` |
| Idiomas (tag HF) | No disponible; el tag `conversational` está presente |
| Descargas / likes | 138 / 0 |
| Creado / actualizado | 2026-09-12 / 2026-09-13 |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna del modelo: la ficha del autor remite explícitamente al model card de origen para «detalles de arquitectura, plantilla de chat, recomendaciones de muestreo, términos de licencia y notas de benchmarks». Lo único verificable aquí es que el artefacto original es un GGUF cuantizado con `UD-IQ4_XS` (esquema dinámico de Unsloth, con tag `imatrix`, es decir, calibración mediante matriz de importancia), que el modelo tiene 93 capas y que el repositorio contiene 29 fragmentos de origen reempaquetados por capa.

No hubo entrenamiento ni ajuste en este repositorio: es una redistribución de pesos con troceado por capas y verificación de integridad por checksum. Se desconoce por completo la composición del dataset de entrenamiento, el número de tokens, si hubo RLHF, DPO u otras fases de alineamiento, así como cualquier innovación técnica de atención o decodificación del modelo base. La innovación del paquete es de despliegue: permite repartir capas entre pares de un clúster Mesh LLM y servirlas mediante una API compatible con OpenAI, manteniendo la identidad y los checksums del artefacto original.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y el modelo lleva el tag `conversational`.
- Servicio compatible con OpenAI: expone `/v1/chat/completions` y `/v1/models` desde el runtime local (puerto 3131 en los ejemplos del autor).
- Inferencia distribuida: división de capas entre varias máquinas mediante `mesh-llm serve --split`.
- Ejecución local y privada: los pesos y el cómputo permanecen en hardware propio, sin depender de una API externa.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (no se listan idiomas).
- Modo de razonamiento (`thinking`), visión, audio u otras modalidades: no documentado.
- Capacidad de reanudación/verificación: cada artefacto del paquete se publica con SHA-256 y un manifiesto (`model-package.json`) para validar integridad.

## Casos de uso

- Inferencia privada en clúster propio: desplegar el paquete con `mesh-llm serve --model ... --split` en varias máquinas para servir un modelo de ~1,3 TB de pesos sin enviar datos a terceros; adecuado en entornos con requisitos de confidencialidad.
- Servicio interno compatible con OpenAI: sustituir una API externa por el endpoint local `/v1/chat/completions` y reutilizar SDKs y clientes existentes sin cambiar el código de integración.
- Aprovechamiento de hardware heterogéneo: repartir las 93 capas entre nodos con distintas GPU o memoria unificada, agregando la memoria disponible en lugar de exigir un único host con ~1,3 TB.
- Laboratorio de investigación en inferencia distribuida: usar el paquete como banco de pruebas para medir latencia, throughput y overhead de comunicación por capa entre pares.
- Evaluación de cuantización agresiva: comparar la calidad de `UD-IQ4_XS` frente a otras cuantizaciones del GGUF de origen en tareas de generación, siempre que se realice la evaluación por cuenta propia al no haber benchmarks publicados.
- Despliegue en red aislada (air-gapped): instalación y ejecución sin conectividad exterior, apoyándose en los checksums del manifiesto para verificar cada artefacto antes de servirlo.
- Gateway conversacional para herramientas internas: montar un único punto de acceso local para scripts, notebooks y aplicaciones que ya hablan el protocolo de OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La ficha del autor remite al model card de origen para cualquier nota de benchmarks, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco datos de latencia o throughput del despliegue distribuido.

## Requisitos de hardware

- Peso de los pesos cuantizados: el repositorio ocupa 1311,9 GB; a `UD-IQ4_XS` (~4,25 bits por parámetro) y ~2,4 T de parámetros, el cálculo da ~1,28 TB, coherente con ese tamaño.
- VRAM estimada: se necesita memoria agregada del orden de 1,3-1,5 TB (pesos más caché KV y overhead del runtime), repartida entre nodos; la caché KV no está documentada, por lo que el margen es una estimación.
- GPU recomendadas: no documentadas por el autor. Por capacidad, un nodo con 8×H100 80 GB (640 GB) es insuficiente por sí solo; harían falta del orden de 17-20 GPU de 80 GB (H100/A100 80 GB) repartidas en varios hosts para alojar los pesos y el overhead.
- Cabe en GPU de consumo: no en una sola unidad. Una RTX 4090 (24 GB), 3090 (24 GB) o 5090 no pueden alojar el modelo; solo tendrían sentido como nodos parciales dentro de un mesh que sume memoria entre varias máquinas.
- Memoria unificada: como referencia, harían falta del orden de 3 nodos con 512 GB de memoria unificada (por ejemplo Apple Silicon de gama alta) para alojar los pesos con margen.
- Opciones de despliegue: el runtime previsto es Mesh LLM (`mesh-llm serve ... --split`, ABI `skippy`). El GGUF de origen puede ejecutarse con otras herramientas GGUF compatibles (llama.cpp, Ollama), pero este paquete troceado por capas está pensado para el runtime de Mesh LLM.
- Latencia y throughput: no disponibles; dependen críticamente del número de nodos y del ancho de banda de la red de interconexión, que el autor no especifica.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base como para compararlo con alternativas de su categoría. La única comparación documentable es contra el artefacto del que deriva:

| Elemento | Parámetros | Contexto | Cuantización | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `meshllm/Qwen3.8-2.4T-A95B-UD-IQ4_XS-layers` | 2,4 T declarados (95 B activos); 26.262.741.376 según safetensors del repo | No disponible | `UD-IQ4_XS` | GGUF troceado por capa (93 capas) | `other` | Público en HuggingFace, 138 descargas |
| `unsloth/Qwen3.8-2.4T-A95B-GGUF` (origen) | Misma familia; 95 B declarados por el autor | No disponible | `UD-IQ4_XS` y otras variantes del repo de origen | GGUF monolítico en 29 fragmentos | `other` | Público en HuggingFace |
| Otros modelos comparables (mismo tamaño o misma tarea) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia `other`: es una licencia no estándar heredada del modelo de origen; antes de cualquier uso comercial hay que revisar los términos del repositorio `unsloth/Qwen3.8-2.4T-A95B-GGUF`, que este paquete no reproduce.
- Discrepancia en el recuento de parámetros: la nomenclatura indica 2,4 T y 95 B activos, la ficha del autor declara una escala de 95B y el recuento de safetensors del repo indica 26.262.741.376; hay que resolver esta inconsistencia antes de planificar capacidad.
- Dato inconsistente en la propia model card: el campo «Package size» figura como `0 B` pese a que el repositorio ocupa 1311,9 GB; conviene verificar el contenido real antes de desplegar.
- Requisito de hardware severo: ~1,3 TB de pesos exige un clúster multi-nodo; no es desplegable en una estación de trabajo ni en una GPU de consumo aislada.
- Sin benchmarks publicados: no hay evidencia en la información disponible sobre calidad de generación, razonamiento, código o matemáticas, ni sobre la degradación introducida por la cuantización `UD-IQ4_XS`.
- Idiomas no declarados: se desconoce el soporte multilingüe real y el comportamiento fuera del inglés.
- Contexto no declarado: se desconoce la ventana de contexto, lo que impide planificar casos de uso con entradas largas.
- Riesgo de alucinación: no cuantificado por el autor; al ser un modelo de gran escala servido en 4 bits, se recomienda validación humana en aplicaciones sensibles.
- Sesgos: no documentados.
- Tool calling, agentes y modos de razonamiento no están documentados; no deben asumirse en producción sin verificación empírica.
- Dependencia del runtime: el paquete está atado al ecosistema Mesh LLM y a la ABI `skippy`; la portabilidad a otros runners GGUF requiere partir del GGUF de origen, no de este troceado.
- Rendimiento sensible a la red: el reparto de capas entre nodos introduce latencia de comunicación no documentada, que puede degradar el throughput de forma notable.
- Integridad: conviene validar los SHA-256 del manifiesto y del fichero fuente tras la descarga, dado el tamaño del repositorio.

## Enlaces

- Repositorio HuggingFace del paquete: https://huggingface.co/meshllm/Qwen3.8-2.4T-A95B-UD-IQ4_XS-layers
- Modelo de origen (GGUF): https://huggingface.co/unsloth/Qwen3.8-2.4T-A95B-GGUF
- Web de Mesh LLM: https://www.meshllm.cloud
- Repositorio de Mesh LLM en GitHub: https://github.com/Mesh-LLM/mesh-llm
- Especificación del formato de paquetes por capas: https://github.com/Mesh-LLM/mesh-llm/blob/main/docs/specs/layer-package-repos.md
- Catálogo de paquetes: https://huggingface.co/datasets/meshllm/catalog
- Discord: https://discord.gg/rs6fmc63eN
- Paper, blog o demo adicionales sobre este paquete: no disponible
