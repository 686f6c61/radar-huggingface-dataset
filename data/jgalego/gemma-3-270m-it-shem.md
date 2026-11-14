# jgalego/gemma-3-270m-it-shem

## Resumen

`jgalego/gemma-3-270m-it-shem` es una imagen de modelo en formato OCI (Open Container Initiative) que empaqueta los pesos de `google/gemma-3-270m-it` para su ejecución mediante [shem](https://github.com/JGalego/shem), una herramienta que permite distribuir y ejecutar modelos como artefactos de contenedor. No se trata de un modelo nuevo ni de un fine-tuning: es una reempaquetación del modelo base de Google en un layout OCI con manifiesto verificable (`sha256:b0e9620505fd...`), lo que facilita su transporte por registries estándar y su ejecución con clientes OCI como `oras` o `docker`.

El modelo subyacente, Gemma 3 270M instruct, es un transformer decoder-only de 270 millones de parámetros publicado por Google bajo licencia Gemma. Su tamaño reducido lo hace apto para entornos con recursos limitados, prototipado rápido y despliegue en dispositivos. La contribución de este repositorio es puramente de distribución: el autor valida que las salidas coinciden con las de `transformers` (diferencia máxima de logits de 2.13e-04 en float32 con tolerancia 1e-3, y coincidencia exacta en una respuesta greedy de 24 tokens).

Es relevante ahora porque el ecosistema de distribución de modelos está convergiendo hacia formatos estándar de contenedores (OCI, ModelPack), y este repositorio es un ejemplo temprano de esa práctica aplicada a un modelo de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (modelo base: Gemma 3 270M instruct) |
| Parametros totales | 270 millones (según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | OCI image layout (blobs empaquetados); rama `modelpack` con formato ModelPack |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base `google/gemma-3-270m-it`, un transformer decoder-only de 270M parámetros. Los detalles de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada y deben consultarse en la model card de Google.

La innovación de este repositorio no es arquitectónica sino de empaquetado: convierte los pesos en una imagen OCI con manifiesto direccionable por contenido, lo que permite verificar integridad, distribuir el modelo por registries estándar y ejecutarlo con runtimes como `io.containerd.shem.v1`. La verificación frente a `transformers` (logits en float32 con diferencia máxima 2.13e-04) aporta una garantía cuantitativa de fidelidad numérica respecto al modelo original.

## Capacidades

- Generación de texto instructiva, heredada de `gemma-3-270m-it`.
- Ejecución como contenedor OCI mediante `shem run` o clientes OCI estándar (`oras`, `docker` con runtime shem).
- Distribución por registry local o remoto, con manifiesto verificable por hash.
- Exportación como artefacto ModelPack en la rama `modelpack`.
- Soporte de plataformas declaradas en el manifiesto (por ejemplo `linux/riscv32` en el ejemplo de la model card).
- Capacidades específicas del modelo base (tool calling, multilingüismo, etc.): no disponibles en la información proporcionada; consultar la model card de Google.

## Casos de uso

- Distribución reproducible de modelos en pipelines de CI/CD: el manifiesto OCI con hash permite fijar la versión exacta del modelo y verificar su integridad en cada despliegue.
- Ejecución en entornos con containerd: el runtime `io.containerd.shem.v1` permite lanzar el modelo como un contenedor más dentro de la infraestructura existente.
- Prototipado rápido en local: `shem run hf.co/jgalego/gemma-3-270m-it-shem "..."` arranca el modelo sin instalar frameworks de inferencia adicionales.
- Despliegue en arquitecturas no convencionales: el ejemplo con `--platform linux/riscv32` sugiere uso en plataformas embebidas o RISC-V donde escasean los stacks de inferencia habituales.
- Integración con registries privados: `oras pull localhost:5000/...` permite alojar el modelo en un registry corporativo junto al resto de artefactos.
- Evaluación comparativa de fidelidad numérica: el repositorio incluye verificación de logits frente a `transformers`, útil como referencia para validar empaquetados propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica publicada es la verificación de fidelidad frente a `transformers`:

| Comprobacion | Resultado |
|---|---|
| Diferencia máxima de logits del prompt (float32) | 2.13e-04 (tolerancia 1e-3) |
| Respuesta greedy, 24 tokens | mismos tokens |

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; para un modelo de 270M parámetros, el requisito es bajo, pero no se aportan cifras concretas.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible en la información; por tamaño (270M) es plausible, pero no está documentado en este repositorio.
- Opciones de despliegue: `shem` (runtime nativo), containerd con runtime `io.containerd.shem.v1`, `oras` para extracción, `docker` con el runtime shem, y artefacto ModelPack.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| jgalego/gemma-3-270m-it-shem | 270M (heredados) | no disponible | OCI / ModelPack | gemma | Empaquetado OCI verificado frente a transformers |
| google/gemma-3-270m-it | 270M | no disponible | safetensors (formato original de Google) | gemma | Modelo base de referencia |
| Alternativas de 270M-1B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier limitación de `google/gemma-3-270m-it` (sesgos, alucinaciones, cobertura idiomática) aplica íntegramente.
- Con 270M parámetros, la capacidad de razonamiento y conocimiento factual es limitada en comparación con modelos de mayor tamaño; no apto para tareas que exijan alta precisión factual sin verificación.
- Licencia `gemma`: sujeta a los términos de uso de Google; revisar restricciones para uso comercial antes de desplegar.
- El repositorio no documenta cuantizaciones ni requisitos de memoria; el despliegue en producción requiere validación propia.
- La verificación publicada cubre una única respuesta greedy de 24 tokens y los logits de un prompt; no constituye una validación exhaustiva del comportamiento del modelo.
- El ecosistema `shem` es incipiente (0 descargas, 0 likes en el momento de la consulta); valorar madurez y soporte antes de adoptarlo en producción.
- Idiomas soportados no documentados en este repositorio; consultar la model card de Google.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jgalego/gemma-3-270m-it-shem
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Herramienta shem: https://github.com/JGalego/shem
- Especificación ModelPack: https://github.com/modelpack/model-spec
