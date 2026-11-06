# oteam/rfdiffusion-inpaint-seq

## Resumen

RFdiffusion es un modelo de difusión generativa para el diseño de esqueletos proteicos (backbones) desarrollado originalmente por el laboratorio de David Baker (Watson et al., 2023). Esta ficha corresponde a la variante **inpaint-seq** (`InpaintSeq_ckpt.pt`), una implementación no oficial publicada por el equipo OFoldX bajo el identificador `oteam/rfdiffusion-inpaint-seq`. El modelo revierte un proceso de difusión sobre marcos de residuos proteicos (frames) utilizando un denoiser de estilo RoseTTAFold combinado con actualizaciones estructurales SE(3)-equivariantes, y su sampler acopla difusión gaussiana de traslación sobre C-alpha con difusión rotacional IGSO(3).

La particularidad de esta variante es el acondicionamiento por secuencia (*sequence-conditioned inpainting*): permite fijar motivos estructurales y regiones con secuencia conocida mientras se generan las regiones restantes del backbone. Esto la hace útil para tareas de scaffolding condicionado, extensión de motivos y diseño de proteínas con restricciones de secuencia parciales.

Con aproximadamente 59,88 millones de parámetros en la especificación del autor (60.881.022 según los pesos safetensors), el modelo es compacto comparado con los LLM actuales, pero computacionalmente intensivo por su naturaleza de difusión iterativa (50 pasos) y por las features de MSA (256) y pares (128) que consume. Se distribuye en formato safetensors con licencia AGPL-3.0 y depende de la librería `ofoldx`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoiser tipo RoseTTAFold con difusión SE(3)-equivariante sobre frames de residuos |
| Parametros totales | 60.881.022 (pesos safetensors); 59,879 M segun model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera sobre grafos de residuos y features de MSA/pares) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones; pesos en safetensors) |
| Idiomas soportados | No disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Bloques principales / extra / refinamiento | 32 / 4 / 4 |
| Tamano de MSA | 256 |
| Tamano de pares | 128 |
| Pasos de difusion | 50 |
| Libreria | ofoldx |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

RFdiffusion combina un proceso de difusión sobre marcos de residuos proteicos con un denoiser de arquitectura RoseTTAFold. Cada residuo se representa mediante un frame (traslación C-alpha + rotación), y el sampler aplica difusión gaussiana de traslación sobre C-alpha junto con difusión rotacional IGSO(3) (rotational Brownian motion). El denoiser recibe como condicionamiento features de secuencia, MSA, pares, plantillas (templates) y timestep, y se apoya en actualizaciones estructurales SE(3)-equivariantes. La red tiene 32 bloques principales, 4 bloques extra y 4 bloques de refinamiento, con MSA de tamaño 256 y pares de tamaño 128.

El entrenamiento consiste en fine-tuning de una red estilo RoseTTAFold sobre estructuras proteicas del PDB: se añade ruido gaussiano a las coordenadas y ruido rotacional a los frames, y el modelo aprende a denoizarlos con *self-conditioning* a lo largo de los timesteps. La model card indica que el paper original describe la construcción de los datos de entrenamiento y que OFoldX no redistribuye el conjunto de datos. Para esta variante concreta (inpaint-seq), el condicionamiento por secuencia permite fijar regiones con identidad de aminoácido conocida durante el muestreo. OFoldX expone el denoiser diferenciable para entrenamiento y fine-tuning, aunque no reproduce el pipeline completo de *coupling* del repositorio oficial.

## Capacidades

- Generación *de novo* de esqueletos proteicos a partir de especificaciones de contig y motivos estructurales opcionales.
- Inpainting condicionado por secuencia: fija regiones con secuencia conocida y genera las restantes.
- Scaffolding de motivos: mantiene coordenadas y frames de motivos fijados mientras difunde el resto del backbone.
- Generación de coordenadas N, CA, C y O para residuos generados o difundidos; las cadenas laterales no predichas quedan no disponibles.
- Los residuos generados conservan identidad desconocida `UNK`, por lo que requieren un modelo de diseño de secuencia (p. ej., ProteinMPNN) para asignar aminoácidos.
- Soporte de simetría: las unidades de salida relacionadas por simetría comparten entidad y secuencia.
- Validación topológica: la construcción de topología comprueba conexiones retenidas y nuevos enlaces solicitados; los frames requieren coordenadas N, CA y C completas y no colineales.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- **Scaffolding de motivos funcionales con secuencia parcial fijada**: se fijan los residuos del sitio activo o epítopo con su secuencia y se genera el resto del backbone, útil para trasplantar funciones a andamios proteicos estables.
- **Extensión de proteínas existentes**: dado un fragmento con secuencia conocida, el modelo inpaint-seq genera la región faltante manteniendo coherencia estructural con el fragmento fijado.
- **Diseño de proteínas de unión (binders) con restricciones de secuencia**: combinado con la variante complex, permite fijar la interfaz conocida y generar el resto del binder.
- **Generación de librerías de candidatos para cribado experimental**: el modelo produce backbones diversos que, tras pasar por ProteinMPNN y predicción de estructura (p. ej., AlphaFold), alimentan pipelines de cribado *in silico*.
- **Ingeniería de enzimas**: se conserva el sitio catalítico (secuencia y estructura) y se rediseña el andamio para mejorar estabilidad o solubilidad.
- **Diseño condicionado por simetría**: generación de oligómeros con unidades relacionadas por simetría que comparten secuencia, útil para diseñar complejos simétricos.
- **Investigación en métodos generativos**: al exponerse el denoiser diferenciable, sirve como base para fine-tuning y experimentación con difusión sobre estructuras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~60 M de parámetros los pesos ocupan del orden de 0,24 GB en fp32, pero el consumo real depende de las features de MSA (256) y pares (128) y de la longitud de la proteína generada, que dominan el uso de memoria.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del modelo, una GPU consumer con suficiente memoria para las features de MSA/pares debería ser viable, pero no se documentan requisitos oficiales.
- Compatibilidad con GPU consumer: probable por el reducido número de parámetros, aunque no confirmado en la documentación.
- Opciones de despliegue: la librería `ofoldx` (`pip install ofoldx`), con pipeline `design` y API `ofoldx.pipeline(...)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. El sampler ejecuta 50 pasos de difusión por diseño.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/rfdiffusion-inpaint-seq | 60,88 M | Difusión SE(3) con denoiser RoseTTAFold | MSA 256, pares 128, 50 pasos | AGPL-3.0 | Hugging Face (ofoldx) |
| RFdiffusion oficial (RosettaCommons) | ~59,88 M (misma arquitectura) | Difusión SE(3) | Igual | Licencia del repo oficial (no especificada aquí) | GitHub RosettaCommons/RFdiffusion |
| oteam/rfdiffusion-base | ~59,88 M | Difusión SE(3) | Igual | AGPL-3.0 | Hugging Face (ofoldx) |
| oteam/rfdiffusion-complex-base | ~59,88 M | Difusión SE(3) para complejos/binders | Igual | AGPL-3.0 | Hugging Face (ofoldx) |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Implementación **no oficial**: la model card la declara explícitamente como UNOFFICIAL; el equipo original de RFdiffusion no la escribió ni la validó.
- Los residuos generados tienen identidad `UNK`; se requiere un modelo de diseño de secuencia (ProteinMPNN u otro) para obtener secuencias reales.
- Las cadenas laterales no predichas no están disponibles; solo se generan coordenadas N, CA, C y O.
- Los frames requieren coordenadas N, CA y C completas y no colineales; entradas mal formadas fallan en la construcción de topología.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte para uso en red y distribución; revisar compatibilidad antes de uso comercial o integración en productos propietarios.
- No se documentan sesgos, tasas de alucinación ni evaluación de calidad de los diseños generados en esta model card.
- No se redistribuye el conjunto de entrenamiento (PDB); la reproducibilidad del entrenamiento depende del paper original.
- Al ser un modelo biológico, no aplican consideraciones de idioma, tool calling ni agentes; su uso es específico de diseño estructural de proteínas.
- No se documentan cuantizaciones ni requisitos de hardware oficiales, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/rfdiffusion-inpaint-seq
- Variante base: https://huggingface.co/oteam/rfdiffusion-base
- Variante base epoch8: https://huggingface.co/oteam/rfdiffusion-base-epoch8
- Variante complex-base: https://huggingface.co/oteam/rfdiffusion-complex-base
- Variante complex-beta: https://huggingface.co/oteam/rfdiffusion-complex-beta
- Variante complex-fold-base: https://huggingface.co/oteam/rfdiffusion-complex-fold-base
- Variante inpaint-seq-fold: https://huggingface.co/oteam/rfdiffusion-inpaint-seq-fold
- Variante active-site: https://huggingface.co/oteam/rfdiffusion-active-site
- Codigo OFoldX (rfdiffusion): https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/rfdiffusion
- Guia de pipelines OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Paper original (Watson et al., Nature 2023): https://doi.org/10.1038/s41586-023-06415-8
- Repositorio oficial RFdiffusion: https://github.com/RosettaCommons/RFdiffusion
- Libreria ofoldx: https://ofoldx.valtech.ai/
