# aether-models/aether-kit-flux2-klein-4b

## Resumen

Aether-Kit FLUX.2 Klein 4B es un empaquetado del modelo de generación de imágenes texto-a-imagen FLUX.2 [klein] 4B de Black Forest Labs, exportado por el proyecto Aether-Kit como grafos de Core AI para su ejecución en el ecosistema Apple (macOS). No se trata de un modelo entrenado desde cero, sino de una conversión de pesos y arquitectura a un formato propietario de Aether-Kit, con cuantización int8 por canal aplicada al codificador de texto y a los tres segmentos del denoiser, además del decodificador y codificador VAE.

El modelo resuelve el despliegue local de difusión texto-a-imagen en hardware Apple mediante el runtime `AetherImage` (etiqueta `flux2-klein@1`), eliminando la dependencia de Diffusers o de frameworks de Python en el momento de la inferencia. El repositorio ocupa 7,9 GB y se publica bajo licencia Apache-2.0, aunque el autor advierte explícitamente que es una versión modificada y no un lanzamiento oficial de Black Forest Labs.

La relevancia actual radica en la creciente demanda de pipelines de generación de imágenes on-device para aplicaciones macOS e iOS, donde la latencia, la privacidad y la ausencia de conectividad son requisitos habituales. La información pública disponible sobre este artefacto concreto es muy limitada (0 descargas, 0 likes, sin model card extendida ni benchmarks), por lo que esta ficha se limita a los datos verificables del repositorio y del modelo base referenciado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (base FLUX.2 [klein] 4B), exportado como grafos Core AI de Aether-Kit |
| Parametros totales | no disponible (el nombre comercial indica 4B en el modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 por canal en codificador de texto, tres segmentos del denoiser, VAE encoder y VAE decoder |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Grafos Core AI de Aether-Kit; manifiesto `.aether/aether.json`; tamaño de repo 7,9 GB |

## Arquitectura y entrenamiento

El modelo subyacente es FLUX.2 [klein] 4B de Black Forest Labs, un modelo de difusión para generación de imágenes a partir de texto. Aether-Kit no reentrena el modelo: lo exporta mediante su componente Forge (`Forge/flux2/`) dividiendo el pipeline en cinco grafos Core AI independientes (codificador de texto, tres segmentos del denoiser y decodificador VAE, más un codificador VAE adicional). La cuantización aplicada es int8 por canal en todos los componentes neuronales, lo que reduce el peso en disco y memoria a costa de una posible pérdida de fidelidad frente a los pesos originales en fp16/bf16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineación. El autor indica que el export fue validado contra CPU Diffusers mediante un `export-report.json`, lo que sugiere una verificación numérica de que los grafos Core AI reproducen la salida del pipeline de referencia dentro de una tolerancia. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información proporcionada.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (pipeline `text-to-image`).
- Ejecución local en macOS mediante el runtime `AetherImage` con la etiqueta `flux2-klein@1`.
- Codificación y decodificación VAE incluidas en el paquete, lo que permite tanto generar imágenes desde latentes como codificar imágenes existentes al espacio latente.
- Cuantización int8 por canal que habilita la inferencia en hardware Apple sin GPU dedicada de gran VRAM.
- No se documentan capacidades de edición de imagen, inpainting, outpainting, tool calling, agentes, multilingüismo explícito ni modos de razonamiento.

## Casos de uso

- Generación de ilustraciones on-device en aplicaciones macOS: la integración con `AetherImage` permite crear imágenes a partir de prompts sin enviar datos a un servidor, lo que resulta adecuado para apps de diseño o prototipado que operan con requisitos de privacidad.
- Prototipado rápido de assets gráficos: el tamaño de 7,9 GB y la cuantización int8 permiten mantener el modelo en disco local y generar variaciones de un concepto visual de forma iterativa durante el desarrollo de un producto.
- Automatización de contenido para documentación técnica: generar diagramas conceptuales o ilustraciones de apoyo a partir de descripciones textuales dentro de un pipeline de build en macOS, evitando dependencias de APIs externas.
- Aplicaciones iOS/macOS de creatividad asistida: el runtime de Aether-Kit está orientado al ecosistema Apple, por lo que encaja en apps que ofrecen generación de imágenes como función secundaria sin infraestructura cloud.
- Investigación sobre cuantización int8 en difusión: el paquete incluye un `export-report.json` que documenta la validación contra Diffusers, lo que lo convierte en un artefacto útil para estudiar la degradación de calidad introducida por la cuantización por canal en modelos FLUX.
- Despliegue en entornos air-gapped: al no requerir conexión ni frameworks Python en inferencia, puede integrarse en estaciones de trabajo aisladas para generar material visual interno.
- Evaluación comparativa de runtimes: sirve como banco de pruebas para medir latencia y fidelidad de Core AI frente a Diffusers en el mismo hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo pesa 7,9 GB en int8, por lo que se requiere al menos ese espacio en disco y una cantidad de memoria unificada comparable para cargar los grafos en runtime.
- GPU recomendadas: el runtime declarado es Core AI sobre macOS, orientado a chips Apple Silicon (M-series); no se documentan requisitos para GPU NVIDIA o AMD.
- Cabe en GPU consumer: sí, en el sentido de que está diseñado para Apple Silicon con memoria unificada; no se especifican modelos concretos de chip ni cantidades mínimas de RAM.
- Opciones de despliegue: `AetherImage` de Aether-Kit (etiqueta `flux2-klein@1`, macOS). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son runtimes aplicables a difusión texto-a-imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Aether-Kit FLUX.2 Klein 4B (este) | 4B (según nombre del base) | no disponible | Apache-2.0 | Grafos Core AI (int8) | Hugging Face, runtime Aether-Kit macOS |
| black-forest-labs/FLUX.2-klein-4B | 4B | no disponible | no disponible en la información | Diffusers / safetensors (no confirmado) | Hugging Face (modelo base) |
| aether-models/flux2-klein-4b | no disponible | no disponible | Apache-2.0 | no disponible | Hugging Face (repo hermano del mismo autor, 15,7 GB) |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros modelos de difusión de tamaño similar, por lo que la comparación se limita a parámetros, licencia y formato de distribución.

## Limitaciones y advertencias

- Es una versión modificada del modelo base; el autor indica explícitamente en el `NOTICE` que no es un lanzamiento oficial de Black Forest Labs, por lo que no debe citarse como FLUX.2 oficial.
- La cuantización int8 por canal puede introducir degradación de calidad frente a los pesos originales; no se publican métricas de fidelidad (FID, CLIP score) que lo cuantifiquen.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia objetiva de calidad de generación para este artefacto concreto.
- Cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Dependencia de un runtime propietario de Aether-Kit y del ecosistema Apple; no es portable a otros entornos sin reexportación.
- Idiomas soportados no documentados; el comportamiento multilingüe del codificador de texto no está verificado en esta ficha.
- Riesgo de sesgos y alucinaciones visuales heredado del modelo base, no evaluado en esta exportación.
- Aunque la licencia es Apache-2.0, conviene revisar el `LICENSE.md` y el `NOTICE` del repositorio para confirmar las obligaciones de atribución sobre la obra derivada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aether-models/aether-kit-flux2-klein-4b
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Repositorio hermano del mismo autor: https://huggingface.co/aether-models/flux2-klein-4b
- Árbol de ficheros del repo hermano: https://huggingface.co/aether-models/flux2-klein-4b/tree/main
- Proyecto Aether-Kit: https://github.com/bubstackdev/aether-kit
