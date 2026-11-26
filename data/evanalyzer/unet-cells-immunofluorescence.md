# evanalyzer/unet-cells-immunofluorescence

## Resumen

`evanalyzer/unet-cells-immunofluorescence` es una conversión a formato safetensors del modelo **CovidIFCellSegmentationBoundaryModel** desarrollado por Constantin Pape (EMBL Heidelberg), publicado originalmente en bioimage.io con el identificador `powerful-chipmunk`. Se trata de una U-Net 2D entrenada para segmentar células en imágenes de microscopía de inmunofluorescencia, prediciendo por píxel la probabilidad de célula (foreground) y de borde celular (boundary). El modelo se entrenó sobre células Vero E6 imageadas con un microscopio de alto rendimiento en el contexto de un ensayo de anticuerpos para COVID-19.

La relevancia de esta ficha no reside en una innovación arquitectónica (la U-Net es una arquitectura convolucional de 2015), sino en el empaquetado: los pesos originales de PyTorch se han convertido a safetensors sin reentrenamiento ni ajuste, con verificación numérica frente al paquete original de bioimage.io (diferencia máxima de 3,3 × 10⁻⁵ y sin cambios de lado en el umbral 0,5). Esto permite cargar el modelo desde herramientas que no dependen de Python ni de PyTorch, como la implementación en Rust de EVAnalyzer, o cualquier lector de safetensors.

El modelo es pequeño (unos 116 MB en f32), de propósito muy específico (segmentación binaria de células y bordes en un único canal de tinción) y no es un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones. Su valor está en pipelines de análisis de imagen biomédica, no en aplicaciones conversacionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net 2D (`torch_em.model.UNet2d`) |
| Parámetros totales | no disponible (46 tensores, ~116 MB en f32) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible (pesos distribuidos en f32) |
| Idiomas soportados | no aplica (modelo de segmentación de imagen) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (extensión `.evanet`, renombrable a `.safetensors`) |

Parámetros de arquitectura declarados en la model card:

| Argumento | Valor |
|---|---|
| `in_channels` | 1 |
| `out_channels` | 2 (foreground, boundaries) |
| `depth` | 4 |
| `initial_features` | 64 |
| `gain` | 2 |
| Normalización | InstanceNorm |
| Activación final | Sigmoid |

## Arquitectura y entrenamiento

La arquitectura es una U-Net 2D estándar implementada en `torch-em`: encoder-decoder convolucional con `depth=4` niveles, `initial_features=64` canales en el primer nivel, factor de crecimiento `gain=2`, normalización InstanceNorm y activación final Sigmoid. La entrada es un único canal (la tinción celular) y la salida son dos canales con valores en [0, 1]: probabilidad de foreground (célula) y probabilidad de borde. La altura y anchura de entrada deben ser múltiplos de 16 y de al menos 64 píxeles.

El entrenamiento se realizó con `torch-em` sobre imágenes de inmunofluorescencia de células Vero E6 del trabajo de Pape et al. (2021), usando pérdida Dice, optimizador Adam, tasa de aprendizaje 1e-4 y 1243 épocas. No se documenta en la información disponible el número de tokens (no aplica), la composición exacta del dataset ni si hubo etapas de refinamiento posteriores. La conversión a safetensors no modificó los pesos: los 46 tensores conservan los nombres originales de PyTorch (`base.block.1.weight`, ..., `out_conv.weight`) y se almacenan en f32. Los metadatos `__metadata__` incluyen `evanalyzer_arch: unet2d`, `arch_version: 1`, el `config` de arquitectura, el preprocesamiento `zero_mean_unit_variance` y campos de nombre, descripción, fuente, licencia y citación.

## Capacidades

- Segmentación semántica de células en imágenes de inmunofluorescencia de un solo canal.
- Predicción de probabilidad de borde celular, útil para separar células en contacto.
- Salida por píxel en dos canales independientes (foreground y boundary), combinables con watershed sembrado a partir de una segmentación de núcleos.
- Carga directa desde safetensors en Python (con `torch-em`) o en herramientas que lean safetensors sin PyTorch (por ejemplo, la implementación en Rust de EVAnalyzer).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual y de una sola tarea.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- **Segmentación de células en ensayos de inmunofluorescencia**: el modelo predice foreground y bordes por píxel; se usa como paso previo a un watershed sembrado con núcleos para obtener instancias celulares individuales en placas de alto rendimiento.
- **Análisis de ensayos serológicos tipo COVID-19**: dado que se entrenó con células Vero E6 en un test de anticuerpos, encaja en pipelines que cuantifican la señal de anticuerpos por célula a partir de imágenes de microscopía.
- **Preprocesado en pipelines de bioimage analysis**: al ser un safetensors plano, se integra en herramientas que no usan Python/PyTorch, como EVAnalyzer, para ejecutar la inferencia en Rust y evitar dependencias pesadas.
- **Segmentación de células en contacto**: combinando el canal de bordes con una segmentación de núcleos (U-Net de núcleos o StarDist) se separan células que se tocan, un caso frecuente en cultivos densos.
- **Automatización de recuento y morfología celular**: la máscara de foreground permite calcular área, número y forma de células por campo, sustituyendo el umbralizado manual en estudios de cribado.
- **Reproducibilidad de resultados publicados**: al conservar los pesos originales y verificar la equivalencia numérica frente al paquete de bioimage.io, sirve para reproducir análisis previos sin depender del stack de PyTorch original.
- **Prototipado rápido en laboratorio**: su tamaño reducido (~116 MB) permite desplegarlo en estaciones de trabajo modestas o en el propio instrumento de microscopía para una primera segmentación en tiempo casi real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta una verificación de equivalencia numérica tras la conversión: frente a la salida esperada del paquete original de bioimage.io (`test_output_0.npy`, entrada de 512 × 512), la diferencia máxima es de 3,3 × 10⁻⁵ y ningún píxel cambia de lado respecto al umbral 0,5.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos ocupan ~116 MB en f32 y la U-Net 2D con `depth=4` y `initial_features=64` es un modelo pequeño. No se dispone de una cifra oficial de VRAM pico.
- GPU recomendadas: cualquier GPU con suficiente memoria para el tamaño de imagen de entrada; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, por el tamaño del modelo; no se detalla qué modelos concretos (RTX 4090, etc.) se han probado.
- Opciones de despliegue: carga vía `safetensors.torch.load_file` con `torch-em` en Python; en EVAnalyzer mediante su implementación en Rust; cualquier lector de safetensors compatible con los nombres de tensores de `torch-em`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `evanalyzer/unet-cells-immunofluorescence` | Segmentación de células y bordes en inmunofluorescencia | U-Net 2D (`torch-em`) | Imagen 2D, 1 canal, múltiplos de 16 | CC-BY-4.0 | Hugging Face, safetensors |
| `powerful-chipmunk` (bioimage.io, original) | Misma tarea | U-Net 2D (`torch-em`) | Igual | CC-BY-4.0 | bioimage.io, PyTorch |
| U-Net de núcleos (mencionado en la model card) | Segmentación de núcleos | U-Net 2D | Imagen 2D | no disponible | no disponible |
| StarDist (mencionado en la model card) | Segmentación de núcleos | Basado en estrellas | Imagen 2D | no disponible | no disponible |

La comparativa se limita a alternativas citadas en la propia model card; no se dispone de datos de rendimiento comparativo entre ellas.

## Limitaciones y advertencias

- Modelo de una sola tarea y dominio muy acotado: células Vero E6 en inmunofluorescencia de un canal; el rendimiento fuera de ese dominio (otras líneas celulares, otros canales, otras modalidades) no está garantizado ni documentado.
- No es un modelo de lenguaje: no genera texto, no responde a instrucciones y no soporta agentes ni tool calling.
- Requiere preprocesamiento estricto: normalización zero-mean/unit-variance por imagen y dimensiones múltiplos de 16 (mínimo 64); saltarse esto degrada la salida.
- Para obtener instancias celulares individuales no basta con el modelo: hace falta combinar bordes y foreground con una segmentación de núcleos y un watershed sembrado.
- Riesgo de alucinación en el sentido de falsos positivos/negativos de segmentación en imágenes fuera de distribución; no se documentan métricas de error en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es obligatorio citar al autor original (Constantin Pape) y las obras referenciadas.
- El repositorio no está afiliado ni respaldado por el autor original ni por la comunidad bioimage.io; la conversión la realiza un tercero (`evanalyzer`).
- El archivo usa la extensión `.evanet`; algunas herramientas pueden requerir renombrarlo a `.safetensors`.
- No se documentan sesgos demográficos ni sociales (no aplica a un modelo de segmentación de imagen), pero sí posibles sesgos de dominio derivados del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/evanalyzer/unet-cells-immunofluorescence
- Modelo original en bioimage.io (`powerful-chipmunk`): https://bioimage.io/#/?id=powerful-chipmunk
- Repositorio EVAnalyzer: https://github.com/evanalyzer/evanalyzer
- `torch-em` (librería de entrenamiento): https://github.com/constantinpape/torch-em
- Experimentos COVID-IF en `torch-em`: https://github.com/constantinpape/torch-em/tree/main/experiments/covid-if
- Dataset de entrenamiento (Zenodo 5092850): https://zenodo.org/records/5092850
- safetensors: https://github.com/huggingface/safetensors
- DOI `torch-em`: https://doi.org/10.5281/zenodo.5108853
- DOI U-Net (Ronneberger et al., 2015): https://doi.org/10.1007/978-3-319-24574-4_28
- DOI Pape et al. (2021), BioEssays: https://doi.org/10.1002/bies.202000257
- DOI modelo en Zenodo: https://doi.org/10.5281/zenodo.5847355
