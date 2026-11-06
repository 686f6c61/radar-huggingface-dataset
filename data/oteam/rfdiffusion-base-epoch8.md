# oteam/rfdiffusion-base-epoch8

## Resumen

RFdiffusion es un modelo generativo de estructuras proteicas que invierte un proceso de difusión sobre marcos de residuos (frames) para generar esqueletos (backbones) de proteínas de novo, así como para hacer scaffolding de motivos estructurales. La implementación original corresponde a Watson et al. (2023) en el laboratorio de David Baker, publicada en *Nature*; esta ficha concreta, `oteam/rfdiffusion-base-epoch8`, es una reimplementación no oficial mantenida por el equipo OFoldX dentro de su librería `ofoldx`, y corresponde al checkpoint temprano `Base_epoch8_ckpt.pt` de la variante base.

El modelo emplea un denoiser con arquitectura tipo RoseTTAFold (32 bloques principales, 4 bloques extra y 4 de refinamiento) con actualizaciones estructurales SE(3)-equivariantes, y muestrea acoplando difusión gaussiana de traslación sobre el C-alpha con difusión rotacional IGSO(3). Con 60,88 millones de parámetros (59,879 M según la model card), un contexto de MSA de 256 y de pares de 128, y 50 pasos de difusión, es un modelo compacto orientado a diseño computacional de proteínas, no a generación de texto.

Su relevancia actual radica en que permite reproducir y extender el pipeline de diseño de proteínas de Baker en un stack Python abierto (`ofoldx`), con variantes específicas para complejos, binders, inpainting condicionado por secuencia y scaffolding de sitio activo. El checkpoint `epoch8` es una instantánea anterior al `base` final, útil para experimentación y comparación de curvas de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Denoiser tipo RoseTTAFold con actualizaciones SE(3)-equivariantes; difusión sobre frames de residuos |
| Parámetros totales | 60.880.638 (safetensors); 59,879 M según model card |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como contexto de texto; MSA de 256 secuencias y pares de 128 en el denoiser |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (librería `ofoldx`) |

## Arquitectura y entrenamiento

RFdiffusion invierte un proceso de difusión definido sobre marcos de residuos proteicos (N, CA, C, O). El denoiser sigue un esquema RoseTTAFold con 32 bloques principales, 4 bloques extra y 4 de refinamiento, y produce actualizaciones estructurales SE(3)-equivariantes. El sampler combina difusión gaussiana de traslación sobre el C-alpha con difusión rotacional IGSO(3) sobre la orientación del frame, con 50 pasos de difusión y self-conditioning entre timesteps. Las features de secuencia, MSA (tamaño 256), pares (tamaño 128), plantilla y timestep proporcionan el condicionamiento específico del modelo.

El entrenamiento parte de una red tipo RoseTTAFold preentrenada y se afina sobre estructuras proteicas del PDB: se añade ruido gaussiano a las traslaciones del C-alpha y movimiento browniano rotacional a los frames, y la red aprende a denoisificarlos. La model card indica que la construcción de datos upstream se describe en el paper y que OFoldX no redistribuye el conjunto de entrenamiento. El checkpoint `epoch8` corresponde a una época temprana del afinado base, anterior al checkpoint `Base_ckpt.pt` publicado como `oteam/rfdiffusion-base`.

## Capacidades

- Generación de novo de esqueletos proteicos a partir de especificaciones de contig (segmentos generados con longitud definida).
- Scaffolding de motivos estructurales: mantiene coordenadas y frames de motivos fijados y difunde el resto de la cadena.
- Condicionamiento por features de secuencia, MSA, pares y plantilla en el denoiser.
- Generación de coordenadas N, CA, C y O para residuos generados; las cadenas laterales no predichas quedan sin coordenadas.
- Los residuos generados conservan identidad `UNK`; requieren un modelo de diseño de secuencia posterior (p. ej. ProteinMPNN) para asignar aminoácidos.
- Soporte de simetría: las unidades de salida relacionadas por simetría comparten entidad y secuencia.
- Validación topológica en la construcción: comprueba conexiones retenidas y nuevos enlaces solicitados, y exige frames con N, CA y C completos y no colineales.
- No soporta tool calling, agentes, texto, visión ni audio: es un modelo biológico de difusión estructural.

## Casos de uso

- Diseño de proteínas de novo: generar backbones de longitud controlada (p. ej. 100 residuos) mediante `RfDiffusionPlacements` y `GeneratedSegment`, y pasar la salida a ProteinMPNN para el diseño de secuencia.
- Scaffolding de motivos funcionales: fijar un sitio activo o un motivo estructural conocido y difundir el resto del esqueleto, útil para trasplantar funciones entre proteínas.
- Generación de candidatos para cribado computacional: producir lotes de backbones con semillas distintas (`seed`) como entrada a pipelines de plegado y scoring.
- Investigación en métodos generativos: el denoiser es diferenciable y se expone para entrenamiento y fine-tuning, lo que permite estudiar variantes de difusión sobre frames.
- Comparación de checkpoints: al ser un checkpoint temprano (`epoch8`), sirve para analizar la evolución del aprendizaje frente al `base` final en métricas de diseño.
- Docencia y reproducción: reproducción del pipeline de RFdiffusion en un stack Python abierto (`ofoldx`) sin depender del repositorio original de RosettaCommons.
- Diseño de complejos y binders: aunque este checkpoint es la variante base, el ecosistema OFoldX ofrece variantes específicas (`complex-base`, `complex-beta`, `complex-fold-base`) para estos escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 60,88 M de parámetros, el peso en FP32 ocupa aproximadamente 0,24 GB, por lo que el cuello de botella real es el muestreo de 50 pasos de difusión y el tamaño de las features (MSA 256, pares 128), no el peso del modelo.
- GPU recomendadas: no disponibles de forma específica en la información; por tamaño, cualquier GPU con suficiente memoria para las features de MSA y pares debería poder ejecutarlo.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de parámetros, aunque la memoria efectiva depende del tamaño de la proteína y de las features; no hay cifras confirmadas.
- Opciones de despliegue: librería `ofoldx` (`pip install ofoldx`) con `ofoldx.pipeline("design", model="oteam/rfdiffusion-base")`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / condicionamiento | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `oteam/rfdiffusion-base-epoch8` (este) | 60,88 M | MSA 256, pares 128, 50 pasos de difusión | Backbone de novo y scaffolding de motivos | AGPL-3.0 | Hugging Face, vía `ofoldx` |
| `oteam/rfdiffusion-base` | 59,879 M (model card) | Igual | Igual, checkpoint final | AGPL-3.0 | Hugging Face, vía `ofoldx` |
| `oteam/rfdiffusion-complex-base` | No disponible | Igual | Diseño de complejos y binders | AGPL-3.0 | Hugging Face, vía `ofoldx` |
| RFdiffusion oficial (RosettaCommons) | No disponible en la información | Igual (implementación de referencia) | Backbone de novo y scaffolding | No disponible en la información | GitHub RosettaCommons/RFdiffusion |

## Limitaciones y advertencias

- Implementación no oficial: la model card indica explícitamente que el equipo de RFdiffusion no escribió esta card y que la implementación es de OFoldX; los resultados pueden diferir de los del repositorio original.
- Checkpoint temprano: `epoch8` es anterior al `base` final; se espera menor calidad de generación que el checkpoint maduro, aunque no hay métricas publicadas que lo cuantifiquen.
- Salida sin secuencia: los residuos generados son `UNK`; el modelo no diseña secuencia y requiere un paso posterior (ProteinMPNN u otro).
- Sin cadenas laterales: solo se generan N, CA, C y O; las cadenas laterales no predichas no están disponibles, lo que limita el análisis de interacciones atómicas directas.
- Dependencia de la librería `ofoldx`: el uso requiere esa librería y su pipeline; no hay pesos en formatos alternativos documentados.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre obras derivadas y sobre el uso en red; conviene revisar implicaciones antes de uso comercial o en servicios expuestos.
- Riesgo de alucinación estructural: como modelo generativo, puede producir backbones plausibles pero no funcionales o no plegables; se requiere validación con predictores de estructura y scoring.
- Sesgos de datos: entrenado sobre estructuras del PDB, con el sesgo de composición y cobertura de ese repositorio; la model card no detalla la composición del dataset.
- Idiomas: no aplica; no es un modelo lingüístico.
- Sin benchmarks publicados en la información disponible: no es posible comparar su rendimiento de forma cuantitativa con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/oteam/rfdiffusion-base-epoch8
- Variante base final: https://huggingface.co/oteam/rfdiffusion-base
- Variante complex-base: https://huggingface.co/oteam/rfdiffusion-complex-base
- Variante complex-beta: https://huggingface.co/oteam/rfdiffusion-complex-beta
- Variante complex-fold-base: https://huggingface.co/oteam/rfdiffusion-complex-fold-base
- Variante inpaint-seq: https://huggingface.co/oteam/rfdiffusion-inpaint-seq
- Variante inpaint-seq-fold: https://huggingface.co/oteam/rfdiffusion-inpaint-seq-fold
- Variante active-site: https://huggingface.co/oteam/rfdiffusion-active-site
- Paper: https://doi.org/10.1038/s41586-023-06415-8
- Repositorio oficial: https://github.com/RosettaCommons/RFdiffusion
- Código OFoldX (modelo): https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/rfdiffusion
- Guía de pipelines OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Documentación OFoldX: https://ofoldx.valtech.ai/
