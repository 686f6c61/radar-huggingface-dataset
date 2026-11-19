# meshllm/Qwen3.8-2.4T-A95B-UD-IQ4_XS-layers

## Resumen

Qwen3.8-2.4T-A95B-UD-IQ4_XS-layers es un paquete de pesos GGUF por capas publicado por meshllm para ejecutar el modelo Qwen3.8-2.4T-A95B en un clúster local distribuido mediante la herramienta Mesh LLM. No se trata de un modelo entrenado por meshllm, sino de una redistribución del GGUF cuantizado UD-IQ4_XS generado por unsloth a partir del modelo Qwen3.8-2.4T-A95B, dividido en artefactos por capa para permitir inferencia repartida entre varias máquinas.

El interés del paquete es operativo: el GGUF original ocupa varios centenares de gigabytes y no cabe en un solo host convencional, de modo que Mesh LLM reparte las 93 capas entre pares de la red local y expone una API compatible con OpenAI (`/v1/chat/completions`) en `localhost:3131`. El repositorio ocupa 1311,9 GB y la model card declara una escala de parámetros de 95B para la variante activa, mientras que el campo de parámetros totales del repositorio (26.262.741.376) no es coherente con esa cifra y debe tratarse con cautela.

La relevancia es doble: por un lado, demuestra un patrón de despliegue de modelos de gran tamaño en hardware propio sin depender de la nube; por otro, la información pública es incompleta (sin benchmarks, sin idiomas declarados, sin contexto documentado en la propia ficha), por lo que cualquier evaluación técnica debe remitirse a la model card del modelo base en unsloth.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia Qwen3; detalles en la model card del modelo base) |
| Parámetros totales | 26.262.741.376 según metadatos safetensors del repo; la model card declara escala de 95B (dato inconsistente, ver advertencias) |
| Parámetros activos | no disponible (el nombre sugiere A95B, pero la ficha no confirma configuración MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | UD-IQ4_XS (variante Q4_XS de Unsloth Dynamic) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de unsloth/Qwen3.8-2.4T-A95B-GGUF) |
| Formato de pesos | GGUF, empaquetado como layer-package (manifiesto `model-package.json` + artefactos por capa) |
| Número de capas | 93 |
| Tamaño del repositorio | 1311,9 GB |
| Fuente canónica | `unsloth/Qwen3.8-2.4T-A95B-GGUF@567d3e6ac26c5474b18311e619c04350fb9a5556/UD-IQ4_XS/Qwen3.8-2.4T-A95B-UD-IQ4_XS-00001-of-00029.gguf` |
| SHA-256 del origen | `4b43a08dc65b82dcc5a0e79cd6ea90d6efbb48a467075b847d5f8e7ea4b92fce` |
| SHA-256 del manifiesto | `cad2c71715d2963e266eb5b4fd56b7f3b26eb77fcdc732248c347e3bfab443d8` |
| Herramienta de empaquetado | `skippy-model-package` (mesh-llm ref `f932c4d1dc12b3e3a670d5f470cedd5cdcc5db39`) |
| Librería | mesh-llm |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La ficha no documenta la arquitectura interna del modelo subyacente: no se especifica si es un transformer denso, un MoE con atención estándar o una variante híbrida, ni se detallan datos de entrenamiento, número de tokens, composición del dataset o etapas de alineación (RLHF/DPO). Toda esa información queda delegada a la model card de `unsloth/Qwen3.8-2.4T-A95B-GGUF`, que es la fuente autorizada. Lo único verificable en este repositorio es el proceso de empaquetado: el GGUF original de 29 shards se trocea en artefactos por capa mediante `skippy-model-package write-package`, cada uno con checksum SHA-256 calculado al escribirse, y se publica junto a un manifiesto `model-package.json` que describe el esquema, la identidad del origen y los checksums.

La innovación técnica del paquete no está en el modelo sino en el mecanismo de distribución: Mesh LLM permite que varias máquinas aporten memoria y cómputo, repartiendo las 93 capas entre pares y sirviendo una API compatible con OpenAI de forma local. El comando `mesh-llm serve --model "meshllm/Qwen3.8-2.4T-A95B-UD-IQ4_XS-layers" --split` se ejecuta en cada nodo contribuyente. La cuantización UD-IQ4_XS procede de Unsloth Dynamic y está orientada a reducir el peso manteniendo calidad relativa frente a Q4 estándar, aunque la ficha no aporta métricas de degradación.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Servicio de chat mediante API compatible con OpenAI (`/v1/chat/completions`, `/v1/models`), lo que facilita la integración con clientes y SDK existentes.
- Inferencia local y privada: los datos no salen del clúster del usuario.
- Inferencia distribuida multi-máquina mediante reparto de capas.
- Descubrimiento de estado del clúster vía endpoint `/api/status`.
- Capacidades específicas de razonamiento, código, matemáticas, visión, tool calling, agentes o multilingüismo: no disponibles en la información proporcionada; deben consultarse en la model card del modelo base.

## Casos de uso

- Despliegue privado de un modelo de gran escala en hardware propio: el paquete permite servir el modelo sin enviar prompts a terceros, usando varias máquinas de la organización como un único endpoint OpenAI-compatible.
- Sustitución de API en la nube en entornos con requisitos de soberanía del dato: al exponer `/v1/chat/completions` en `localhost:3131`, aplicaciones ya escritas contra la API de OpenAI pueden apuntar al clúster sin reescribir el cliente.
- Aprovechamiento de hardware heterogéneo y infrautilizado: máquinas con GPUs de distinta capacidad pueden aportar memoria y cómputo al pool, repartiendo las 93 capas según disponibilidad.
- Laboratorios de investigación que necesitan experimentar con un modelo de escala 95B cuantizado a Q4_XS sin adquirir un nodo de memoria unificada de gran capacidad.
- Prototipado de agentes y asistentes internos en redes aisladas (air-gapped), donde no es viable llamar a servicios externos.
- Evaluación comparativa de pipelines de inferencia distribuida: el paquete sirve como banco de pruebas reproducible (checksums y revisión fijados) para medir latencia y throughput de Mesh LLM frente a vLLM o llama.cpp en un solo host.
- Formación y demos técnicas: despliegue didáctico de un clúster de inferencia local para explicar reparto de capas y cuantización GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite explícitamente a la del modelo base (`unsloth/Qwen3.8-2.4T-A95B-GGUF`) para notas de benchmarks, plantilla de chat, recomendaciones de sampling y términos de licencia. Tampoco se aportan medidas de latencia ni throughput del clúster.

## Requisitos de hardware

- VRAM estimada: no disponible de forma fiable. El repositorio ocupa 1311,9 GB y la model card declara escala de 95B en cuantización Q4_XS; a ~4,5 bits por peso, un modelo de 95B requeriría del orden de 55-60 GB solo para pesos, pero la cifra de parámetros es inconsistente y no debe usarse para dimensionar sin verificar el modelo base.
- El diseño del paquete asume explícitamente que el GGUF completo no cabe en un solo host; el caso de uso previsto es el reparto entre varias máquinas.
- GPU recomendadas: no disponibles en la ficha. Por el tamaño declarado, un despliegue en un solo nodo requeriría GPUs de centro de datos con memoria unificada o agregada (A100/H100 de 80 GB en múltiples unidades), pero esta estimación no está confirmada por el autor.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen; con la escala declarada, no es esperable que quepa en una única GPU de consumo.
- Opciones de despliegue: Mesh LLM (`mesh-llm serve --model ... --split`). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles. En inferencia distribuida por capas, la latencia depende críticamente de la interconexión entre pares (LAN cableada frente a Wi-Fi) y del número de saltos por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| meshllm/Qwen3.8-2.4T-A95B-UD-IQ4_XS-layers | 95B declarados (metadatos del repo: 26,26B) | no disponible | UD-IQ4_XS | other | GGUF por capas, Mesh LLM distribuido |
| unsloth/Qwen3.8-2.4T-A95B-GGUF (modelo base) | 95B declarados | no disponible | UD-IQ4_XS y otras variantes Unsloth | other | GGUF monolítico en 29 shards, llama.cpp/vLLM |
| Alternativas de la misma familia Qwen3 de menor escala | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento rigurosa. La comparación más directa y verificable es con el propio GGUF de Unsloth del que deriva este paquete: mismos pesos y misma cuantización, con la diferencia de que el paquete por capas está pensado para reparto multi-máquina y el original para carga monolítica.

## Limitaciones y advertencias

- Inconsistencia de parámetros: el nombre del modelo y la model card indican escala 95B (y el sufijo A95B sugiere parámetros activos), pero los metadatos safetensors del repositorio declaran 26.262.741.376 parámetros totales. Verificar contra el modelo base antes de cualquier decisión de despliegue.
- La model card indica `Package size: 0 B` y `Activation width: not recorded`, lo que sugiere metadatos incompletos o generados automáticamente; no deben tomarse como especificaciones finales.
- Licencia `other`: no se detallan términos en esta ficha. Es imprescindible revisar la licencia del modelo base en `unsloth/Qwen3.8-2.4T-A95B-GGUF` antes de uso comercial; no se garantiza permiso de uso comercial por defecto.
- Riesgo de alucinación y sesgos: no documentados en esta ficha; aplican los del modelo base.
- Idiomas soportados no declarados: no se puede asumir calidad multilingüe sin verificación empírica.
- Longitud de contexto no disponible: no planificar aplicaciones de contexto largo sin confirmar la ventana real en el modelo base.
- Dependencia de la herramienta Mesh LLM: el paquete no es un GGUF estándar cargable directamente en llama.cpp; requiere el runtime `mesh-llm` y su formato de layer-package.
- La inferencia distribuida por capas introduce latencia de red por token y puntos de fallo adicionales (caída de un par); no apta para cargas de baja latencia sin evaluar la interconexión.
- Repositorio muy grande (1311,9 GB): la descarga y el almacenamiento tienen coste considerable; verificar checksums del manifiesto antes de servir.
- Fecha de creación y actualización en 2026: comprobar que el paquete sigue alineado con la revisión del modelo base indicada (`567d3e6a...`).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/meshllm/Qwen3.8-2.4T-A95B-UD-IQ4_XS-layers
- Modelo base (GGUF de Unsloth): https://huggingface.co/unsloth/Qwen3.8-2.4T-A95B-GGUF
- Web de Mesh LLM: https://www.meshllm.cloud
- Repositorio GitHub de Mesh LLM: https://github.com/Mesh-LLM/mesh-llm
- Especificación del formato layer-package: https://github.com/Mesh-LLM/mesh-llm/blob/main/docs/specs/layer-package-repos.md
- Catálogo de paquetes: https://huggingface.co/datasets/meshllm/catalog
- Discord de Mesh LLM: https://discord.gg/rs6fmc63eN
