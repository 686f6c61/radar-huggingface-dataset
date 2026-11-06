# creative-graphic-design/structure-diffusion

## Resumen

StructureDiffusion es un método de generación texto-a-imagen sin entrenamiento (training-free) presentado en ICLR 2023 por Weixi Feng et al. (arXiv:2212.05032). No se trata de un modelo con pesos propios, sino de una técnica de guiado que modifica el condicionamiento por atención cruzada de Stable Diffusion 1.4 para mejorar el vínculo entre objetos y atributos en la imagen generada. El repositorio `creative-graphic-design/structure-diffusion` publica únicamente el código del pipeline de `diffusers`, no los pesos.

El problema que resuelve es la confusión de atributos típica de los modelos texto-a-imagen: cuando un prompt menciona varios objetos con atributos distintos, el modelo tiende a mezclar colores, materiales o relaciones. StructureDiffusion analiza la frase en sintagmas nominales, codifica el prompt completo y cada frase por separado, y combina las claves y valores de la atención cruzada para que cada región de la imagen atienda a la frase correcta.

Es relevante para investigadores y desarrolladores que quieran mejorar la fidelidad compositiva de Stable Diffusion sin reentrenar ni ajustar pesos. Al heredar de `diffusers.StableDiffusionPipeline`, se integra con el ecosistema estándar de carga, planificadores y callbacks, aunque depende de parsers en inglés (Stanza y, opcionalmente, spaCy) instalados aparte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión sobre Stable Diffusion 1.4 (UNet + VAE + CLIP text encoder); guiado estructurado por atención cruzada |
| Parámetros totales | No disponible (depende del checkpoint base; SD 1.4 ronda los 860 M en UNet y ~123 M en el text encoder, dato no declarado en la ficha) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (condicionamiento textual limitado por el tokenizador CLIP de SD 1.4, 77 tokens) |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | Inglés (prompts y parsers) |
| Licencia | Apache-2.0 para el código; los pesos base de SD 1.4 tienen términos CreativeML OpenRAIL-M |
| Formato de pesos | No se publican pesos; el paquete es solo código sobre `diffusers` |

## Arquitectura y entrenamiento

StructureDiffusion no entrena ni ajusta pesos: es un método de inferencia que opera sobre el mecanismo de atención cruzada de Stable Diffusion. El pipeline segmenta el prompt en sintagmas nominales mediante un parser de constituyentes (Stanza, en inglés) o, opcionalmente, un parser de grafo de escena (spaCy). A continuación codifica el prompt completo y cada frase por separado con el text encoder de CLIP, y combina las claves y valores de la atención cruzada. Con `conjunction=True` se usan claves específicas por frase con un valor combinado; por defecto se emplea el prompt completo como clave y el prompt más las codificaciones de frase como valores.

La innovación técnica es, por tanto, puramente de condicionamiento: no hay RLHF, DPO ni dataset de entrenamiento propio. El comportamiento generativo, los sesgos y las restricciones heredan íntegramente del checkpoint de Stable Diffusion 1.4 seleccionado. La implementación de referencia está publicada bajo licencia MIT en el repositorio de los autores, y este paquete la envuelve como subclase de `diffusers.StableDiffusionPipeline`, conservando la gestión estándar de dispositivos, planificadores y callbacks.

## Capacidades

- Generación texto-a-imagen con mejora del vínculo objeto-atributo y de relaciones entre objetos en prompts complejos.
- Segmentación sintáctica del prompt en sintagmas nominales (parser de constituyentes en inglés).
- Parsing opcional de grafo de escena como extra.
- Control del modo de combinación de claves y valores mediante el parámetro `conjunction`.
- Compatibilidad con el ecosistema `diffusers`: planificadores, callbacks, colocación en dispositivo y salida de imagen estándar.
- No incluye tool calling, function calling, agentes, razonamiento multi-paso ni capacidades de audio o vídeo.
- Capacidad multilingüe limitada al inglés en prompts y parsers.

## Casos de uso

- Investigación en fidelidad compositiva: comparar la adherencia al prompt de StructureDiffusion frente a SD 1.4 estándar con el mismo checkpoint, semilla y planificador, registrando revisión, parser y dimensiones.
- Generación de material visual de borrador para diseño gráfico: producir imágenes de apoyo con múltiples objetos y atributos diferenciados, revisándolas antes de usarlas en flujos creativos.
- Prototipado de prompts complejos: validar cómo se comporta un prompt con varias entidades y relaciones antes de invertir en ajuste fino o en modelos mayores.
- Docencia y divulgación sobre atención cruzada: usar el pipeline como ejemplo práctico de cómo el condicionamiento textual afecta a la composición de la imagen.
- Evaluación comparativa de parsers: alternar entre parsing de constituyentes y de grafo de escena para medir el impacto en la adherencia al prompt.
- Integración en herramientas de diseño internas: envolver el pipeline en un servicio que reciba prompts en inglés y devuelva borradores, con inspección humana obligatoria antes de su uso.

## Benchmarks y rendimiento

Los únicos datos declarados por el autor en el model-index son una prueba de paridad en CPU, no un benchmark de calidad:

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Text-to-image generation | CPU parity fixture (un prompt a 64x64 y 512x512) | Bit-exact CPU image comparison against reference images | 0 | No |

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, TIFA, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del checkpoint base SD 1.4 y de la precisión empleada.
- GPU recomendadas: no disponible; el pipeline funciona en CPU (la prueba de paridad se ejecuta en CPU) y en GPU mediante `diffusers`.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: `diffusers` (carga mediante `from_pretrained`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Pesos propios | Contexto textual | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StructureDiffusion (este) | Guiado training-free sobre SD 1.4 | No (solo código) | Limitado por CLIP de SD 1.4 | Apache-2.0 (código); OpenRAIL-M (pesos base) | Paquete de código en HF |
| Stable Diffusion 1.4 | Difusión texto-a-imagen | Sí | Limitado por CLIP (77 tokens) | CreativeML OpenRAIL-M | Pesos en HF (gated) |
| Stable Diffusion 2.x | Difusión texto-a-imagen | Sí | Limitado por CLIP | CreativeML OpenRAIL++-M | Pesos en HF |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Hereda sesgos, datos de entrenamiento y restricciones del checkpoint de Stable Diffusion 1.4.
- El parser por defecto es solo para inglés y requiere instalar aparte los modelos de tokenización, POS y constituyentes de Stanza; el parsing de grafo de escena requiere un modelo de spaCy en inglés.
- Los resultados varían según checkpoint, parser, planificador, dispositivo, precisión y versiones de librería, lo que dificulta reproducir comparaciones sin registrar todos esos parámetros.
- No se publican pesos de StructureDiffusion: el paquete es solo código, y el checkpoint base está restringido (gated) en Hugging Face.
- Riesgo de alucinación visual: las imágenes no deben tratarse como representaciones verificadas de personas o eventos reales ni como evidencia de que los atributos del prompt se han renderizado correctamente.
- El pipeline no ofrece garantía de seguridad de imagen; se recomienda inspeccionar las salidas antes de cualquier uso posterior.
- La licencia Apache-2.0 cubre el código, pero los pesos base de SD 1.4 tienen términos CreativeML OpenRAIL-M que condicionan el uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/creative-graphic-design/structure-diffusion
- Paper (arXiv): https://arxiv.org/abs/2212.05032
- Implementación de referencia (MIT): https://github.com/weixi-feng/Structured-Diffusion-Guidance/tree/773b2ba068c6cc60443d5d747a725413c8c9d46f
- Checkpoint base: https://huggingface.co/CompVis/stable-diffusion-v1-4
- Documentación de `diffusers` StableDiffusionPipeline: https://huggingface.co/docs/diffusers/api/pipelines/stable_diffusion/text2img
- Stanza (parser inglés): https://stanfordnlp.github.io/stanza/
- spaCy (parser de grafo de escena opcional): https://spacy.io/
