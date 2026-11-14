# jgalego/smollm2-135m-instruct-shem

## Resumen

smollm2-135m-instruct-shem es una imagen de modelo empaquetada en formato OCI (Open Container Initiative) a partir de HuggingFaceTB/SmolLM2-135M-Instruct, el modelo de lenguaje de 135 millones de parámetros publicado por Hugging Face. El autor del empaquetado es jgalego, y la imagen se distribuye mediante la herramienta shem, un runtime propio para ejecutar modelos como artefactos de contenedor. No se trata, por tanto, de un modelo nuevo entrenado desde cero, sino de una reempaquetación reproducible del checkpoint original de SmolLM2 en un layout OCI con un manifiesto fijado (`sha256:5339b1f9...`) y una sesión guardada con un system prompt preconfigurado.

El interés de esta ficha reside en el formato de distribución, no en el modelo subyacente: SmolLM2-135M-Instruct es un transformer decoder-only de 135 millones de parámetros, pensado para inferencia en dispositivos con recursos muy limitados, y aquí se presenta como una imagen que puede ejecutarse con `shem run`, extraerse con `oras pull` o lanzarse mediante `docker run` con el runtime `io.containerd.shem.v1`. El autor ha verificado la equivalencia numérica frente a transformers (diferencia máxima de logits de 7,82e-05 en float32 y coincidencia exacta en una decodificación greedy de 24 tokens), lo que garantiza que el empaquetado no altera el comportamiento del modelo.

La relevancia es doble: por un lado, demuestra un patrón de empaquetado de modelos como artefactos OCI con verificación numérica; por otro, ofrece una vía de despliegue mínima (0,2 GB de repositorio) para un modelo instructivo de 135M con licencia Apache 2.0. La información disponible sobre el modelo subyacente (arquitectura detallada, dataset, benchmarks) no está incluida en la model card proporcionada y se marca como no disponible cuando corresponde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct, según modelo base) |
| Parámetros totales | 135 millones (según identificador del modelo base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (la imagen se distribuye como artefacto OCI; no se detallan cuantizaciones) |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefacto OCI (layout de imagen con manifiesto `sha256:5339b1f9226f33bdf3a557e21349dd7a4ad498f29dcebf1a9ef3601dcf9134fd`); variante ModelPack en la rama `modelpack`; blobs subyacentes no detallados |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base HuggingFaceTB/SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros. La model card de este repositorio no documenta la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos pertenecen a la ficha del modelo original y no se reproducen aquí. Lo que sí se documenta es el proceso de empaquetado: el checkpoint del commit `12fd25f77366` se convierte en una imagen OCI con un manifiesto fijado, y el system prompt se inserta en una sesión guardada, de modo que la ejecución arranca directamente después de ese prompt.

La innovación técnica destacable no es de entrenamiento sino de distribución y verificación. El autor publica dos comprobaciones frente a transformers: la diferencia máxima entre los logits del prompt en float32 es de 7,82e-05 con una tolerancia de 1e-3, y una respuesta greedy de 24 tokens produce exactamente los mismos tokens. Además, la imagen puede consumirse por tres vías (CLI `shem`, registro OCI con `oras pull`, y `docker run` con runtime containerd específico), y existe una rama `modelpack` que expone el mismo contenido como artefacto ModelPack. El system prompt guardado es: "You are Shem, a golem made of clay and brought to life by a word. Answer in one sentence."

## Capacidades

- Generación de texto instructiva: al derivar de SmolLM2-135M-Instruct, hereda el ajuste por instrucciones del modelo base, aunque la model card no detalla tareas concretas.
- Respuestas de una sola frase por configuración: la sesión guardada incluye un system prompt que fuerza respuestas en una frase ("Answer in one sentence").
- Ejecución como artefacto OCI: `shem run hf.co/jgalego/smollm2-135m-instruct-shem "..."` lanza el modelo directamente desde Hugging Face.
- Compatibilidad con clientes OCI genéricos: `oras pull localhost:5000/jgalego/smollm2-135m-instruct-shem:latest` permite extraer la imagen desde un registro local.
- Ejecución con containerd: `docker run --rm --runtime io.containerd.shem.v1 --platform linux/riscv32 ...` habilita despliegue en arquitecturas como RISC-V de 32 bits.
- Variante ModelPack: la rama `modelpack` empaqueta los mismos blobs según la especificación ModelPack.
- Tool calling, function calling, agentes multi-paso, visión, audio y modo thinking: no disponible en la información proporcionada (el modelo base de 135M no los documenta en esta card).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en dispositivos embebidos y RISC-V: la imagen se ejecuta con `--platform linux/riscv32`, lo que permite correr un modelo instructivo de 135M en placas y SoCs de 32 bits donde no cabría un runtime de modelos convencional.
- Pruebas de integración de pipelines OCI: al estar empaquetado como imagen con manifiesto fijado, sirve para validar flujos de `oras pull`, registros locales y runtimes containerd en CI/CD sin depender de descargas grandes.
- Reproducibilidad de inferencia: la verificación numérica frente a transformers (7,82e-05 de diferencia máxima en logits) permite usar la imagen como referencia para comprobar que un despliegue concreto produce los mismos tokens que el checkpoint original.
- Demostración de empaquetado de modelos: útil para equipos que evalúan distribuir sus propios modelos como artefactos OCI con sesión preconfigurada y system prompt embebido.
- Asistente de respuestas cortas: el system prompt guardado fuerza respuestas de una frase, adecuado para interfaces de chat mínimas o bots de FAQ donde la brevedad es requisito.
- Docencia y talleres sobre runtimes de modelos: el tamaño reducido del repositorio (0,2 GB) y la licencia Apache 2.0 facilitan su uso en entornos formativos sin coste de licencia.
- Pruebas de compatibilidad de contenedores: la doble vía (shem y docker con runtime containerd) permite comparar el comportamiento de distintos motores de ejecución sobre el mismo artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta las comprobaciones de equivalencia frente a transformers:

| Comprobación | Resultado |
|---|---|
| Diferencia máxima entre logits del prompt, float32 | 7,82e-05 (tolerancia 1e-3) |
| Respuesta greedy, 24 tokens | los mismos tokens |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo (135M parámetros) y el repositorio de 0,2 GB, la huella es muy reducida, pero no se publican cifras concretas.
- GPU recomendadas: no disponible en la información proporcionada; el modelo base de 135M es ejecutable en CPU y en GPUs de gama baja, pero la card no lo especifica.
- Compatibilidad con GPU de consumo: no disponible de forma explícita; el tamaño del checkpoint sugiere que cabría en GPUs de consumo, pero no se confirma en la documentación.
- Plataformas documentadas: `linux/riscv32` mediante `docker run --runtime io.containerd.shem.v1`.
- Opciones de despliegue: CLI `shem` (`shem run hf.co/jgalego/smollm2-135m-instruct-shem "..."`), registro OCI local con `shem registry` y `oras pull`, y `docker run` con runtime containerd `io.containerd.shem.v1`. No se documentan vLLM, llama.cpp, Ollama ni TGI para esta imagen.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato de distribución | Notas |
|---|---|---|---|---|---|
| smollm2-135m-instruct-shem (este) | 135M | no disponible | Apache 2.0 | Imagen OCI + ModelPack | Empaquetado con verificación numérica frente a transformers |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | no disponible en esta ficha | Apache 2.0 | Pesos en Hugging Face (formato no detallado aquí) | Modelo base del que deriva esta imagen |
| SmolLM2 (otras variantes de la familia) | no disponible en esta ficha | no disponible | Apache 2.0 (según familia) | Pesos en Hugging Face | Alternativas de mayor tamaño de la misma familia, sin datos concretos en la información proporcionada |

La comparación con alternativas de la misma categoría (modelos instructivos de menos de 200M) no puede completarse con datos concretos porque la información proporcionada no incluye sus especificaciones. Se indica "no disponible" para cualquier métrica de rendimiento comparada.

## Limitaciones y advertencias

- No es un modelo nuevo: se trata de una reempaquetación de SmolLM2-135M-Instruct; cualquier limitación del modelo base (sesgos, alucinaciones, cobertura idiomática) se hereda sin cambios.
- Tamaño muy reducido: con 135M parámetros, la calidad en razonamiento complejo, matemáticas y código es limitada en comparación con modelos de mayor escala; no se aportan benchmarks que cuantifiquen esta limitación.
- System prompt fijado: la sesión guardada impone "Answer in one sentence", lo que restringe la longitud de las respuestas y puede no ser adecuado para tareas que requieran explicaciones extensas.
- Dependencia de herramienta: la ejecución documentada requiere `shem` o un runtime containerd específico (`io.containerd.shem.v1`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Idiomas y contexto no documentados: la card no especifica la ventana de contexto ni los idiomas soportados, lo que impide garantizar su comportamiento en producción multilingüe o con prompts largos.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los blobs empaquetados antes de redistribuir.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- Fecha de creación indicada como 2026-11-13: dato atípico que conviene contrastar antes de citar el modelo en documentación formal.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jgalego/smollm2-135m-instruct-shem
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Herramienta shem: https://github.com/JGalego/shem
- Especificación ModelPack: https://github.com/modelpack/model-spec
