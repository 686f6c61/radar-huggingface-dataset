# AI-KSK/flux3-klein-seven-workflows-319

## Resumen

`AI-KSK/flux3-klein-seven-workflows-319` no es un modelo de pesos, sino una colección de siete flujos de trabajo en formato JSON para ComfyUI orientados a la familia FLUX 3 Klein. El repositorio contiene grafos independientes para generación texto-a-imagen con el checkpoint base, generación con el checkpoint destilado (etiquetado "SD"), edición de imagen en ambas variantes, composición con dos referencias conectadas, condicionamiento por cajas delimitadoras (bounding boxes) y una comparación A/B entre base y destilado. El autor es AI-KSK y el repositorio ocupa 0.0 GB, sin pesos incluidos.

La relevancia de esta colección es práctica: documenta cómo se estructuran los grafos de FLUX 3 Klein en ComfyUI, incluyendo subgrafos anidados, selectores externos que sobrescriben valores internos de los widgets y nodos específicos como `ReferenceMultiLatent`, nodos de layout/box, `TextGenerate` e `ImageCompare`. La model card es inusualmente honesta sobre las limitaciones: corrige portadas promocionales que afirmaban capacidades que los grafos no implementan (por ejemplo, "16 steps" en un flujo base que en realidad muestrea a 50 pasos, o "1 a 10 referencias" en un grafo que solo conecta dos nodos `LoadImage`).

No se proporciona información sobre el modelo FLUX 3 Klein en sí (arquitectura, parámetros, contexto, licencia), solo referencias a nombres de ficheros de pesos y codificadores. Cualquier dato sobre el modelo subyacente debe consultarse en su repositorio oficial, no en esta colección de flujos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la colección contiene grafos ComfyUI, no pesos) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los nombres de fichero sugieren INT8 y W4A8, sin verificación) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplica (JSON de flujos de trabajo ComfyUI); pesos referenciados en `.safetensors` |
| Número de flujos | 7 JSON independientes |
| Nodos totales | 106 nodos de nivel superior + 28 nodos en dos definiciones de subgrafo |
| Tamaño del repositorio | 0.0 GB |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

Esta entrada no contiene un modelo entrenado. Es un paquete de flujos de trabajo para ComfyUI que orquesta la inferencia de FLUX 3 Klein. Los grafos hacen referencia a los siguientes artefactos de modelo, cuyos detalles de arquitectura y entrenamiento no se documentan en el repositorio:

- `flux3_image_klein_base_int8_convrot.safetensors` (checkpoint base)
- `flux3_image_klein_sd_int8_convrot.safetensors` (checkpoint destilado)
- `qwen3vl_4b_int8_convrot.safetensors` (codificador de texto/visión, según el nombre basado en Qwen3-VL de 4B)
- `qwen3.5_9b_flux3_prompt_upsampler_w4a8.safetensors` (modelo de expansión de prompts)
- `flux2-vae.safetensors` (VAE)

Los nombres de fichero sugieren cuantización INT8 con "convrot" y W4A8 para el upsampler de prompts, pero la model card indica explícitamente que no se incluye verificación de pesos, compatibilidad en tiempo de ejecución, VRAM, velocidad, calidad ni licencia. Los flujos incluyen subgrafos anidados con definiciones embebidas; el autor advierte que los controles conectados externamente pueden sobrescribir los valores almacenados en los widgets internos, por lo que no deben interpretarse las posiciones de arrays de samplers como recetas autónomas.

## Capacidades

- Generación texto-a-imagen con el checkpoint base (flujo 01), con subgrafo embebido de expansión de prompt y muestreo.
- Generación texto-a-imagen con el checkpoint destilado (flujo 02).
- Edición de imagen con checkpoint base (flujo 03) y destilado (flujo 04).
- Composición con dos referencias conectadas (flujo 05): exactamente dos nodos `LoadImage` (`image0` + `image1`), no diez.
- Condicionamiento por cajas delimitadoras (flujo 06): las cajas alimentan el prompt de texto como pista de layout, no como máscara dura.
- Comparación A/B base frente a destilado (flujo 07), con la rama base muestreada a 25 pasos.
- Expansión de prompts mediante un modelo dedicado (`qwen3.5_9b_flux3_prompt_upsampler_w4a8`) con interruptor externo `enable_prompt_upsampler`.
- Nodos específicos referenciados: `ReferenceMultiLatent`, nodos de layout/box, `TextGenerate`, `ImageCompare`.

## Casos de uso

- Punto de partida para generar imágenes con FLUX 3 Klein en ComfyUI: importar el flujo 01 o 02, resolver los pesos base o destilado y el upsampler de prompts, y ajustar el prompt externo en el nodo 18 antes de encolar.
- Edición de imágenes existentes: usar los flujos 03 o 04 para modificar una imagen de entrada, teniendo en cuenta que el checkpoint base requiere más pasos (50) que el destilado.
- Composición de dos referencias visuales: emplear el flujo 05 cuando se quiera combinar dos imágenes concretas mediante `ReferenceMultiLatent`, sin esperar fusión de hasta diez referencias.
- Control de layout por descripción de cajas: usar el flujo 06 para guiar la composición mediante cajas que se incorporan al condicionamiento de texto, útil cuando se necesita indicar posiciones aproximadas sin máscara.
- Evaluación comparativa base frente a destilado: usar el flujo 07 para generar pares A/B y comparar calidad y coste computacional entre ambos checkpoints en el mismo prompt.
- Estudio de estructura de grafos ComfyUI: los JSON sirven como referencia para implementar subgrafos anidados, selectores externos que sobrescriben widgets y nodos personalizados en pipelines propios.
- Expansión automática de prompts: integrar el upsampler `qwen3.5_9b_flux3_prompt_upsampler_w4a8` en flujos propios para enriquecer descripciones breves antes del muestreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no incluye verificación de velocidad, VRAM ni calidad, y que las 28 pruebas comparativas mencionadas en el vídeo del creador no están incluidas en el repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible. La model card no incluye datos de VRAM ni de compatibilidad en tiempo de ejecución.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI con soporte de subgrafos; se requieren implementaciones compatibles de los nodos referenciados (`ReferenceMultiLatent`, nodos de layout/box, `TextGenerate`, `ImageCompare`) y de los puertos de salida de imagen esperados por algunos grafos exportados.
- Latencia y throughput: no disponible. El flujo 01 usa 50 pasos en el checkpoint base; el flujo 07 muestrea la rama base a 25 pasos; los flujos destilados usan 16 pasos según la corrección de portadas.
- Pesos: no incluidos en el repositorio; deben obtenerse por separado. No se proporciona un listado de descargas verificado ni un lockfile de instalación probado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros paquetes de flujos de trabajo comparables ni datos del modelo FLUX 3 Klein que permitan una comparación técnica con alternativas.

## Limitaciones y advertencias

- No es un modelo: es una colección de flujos JSON; no contiene pesos, datos de entrenamiento ni información de licencia del modelo subyacente.
- Licencia no disponible: no se puede confirmar el uso comercial de los flujos ni de los pesos referenciados.
- Las portadas promocionales originales contenían afirmaciones incorrectas sobre los grafos; cuatro fueron redibujadas el 2026-11-01. La portada del flujo 07 mantiene "28 Tests" aunque esas pruebas no se incluyen.
- El flujo 05 conecta solo dos referencias, no de una a diez; la cifra 1–10 corresponde al mecanismo del modelo, no al grafo.
- Los flujos 03 y 06 usan cajas como pista de condicionamiento del prompt, no como máscara dura; editar las cajas del helper de nivel superior no modifica la petición de generación si no está conectado al prompt.
- Los valores almacenados en widgets internos pueden quedar sobrescritos por enlaces externos; hay que inspeccionar la UI correspondiente en lugar de asumir posiciones de arrays de samplers.
- Algunos grafos exportados esperan una salida de imagen desde un nodo de guardado; es necesario confirmar que la implementación instalada coincide con esos puertos.
- No se incluye verificación de compatibilidad en tiempo de ejecución, VRAM, velocidad, calidad ni licencia; el ZIP fuente separado no fue inspeccionado ni incluido.
- Riesgo de alucinación y sesgos: no evaluables sin datos del modelo subyacente.
- El repositorio tiene 0 descargas y 1 like, sin evidencia de uso en producción ni validación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AI-KSK/flux3-klein-seven-workflows-319
- Flujo 01 (Base texto-a-imagen): `workflows/image_flux3_klein_t2i.json`
- Flujo 02 (SD texto-a-imagen): `workflows/image_flux3_klein_distilled_t2i.json`
- Flujo 03 (Base edición de imagen): `workflows/image_flux3_klein_image_edit.json`
- Flujo 04 (SD edición de imagen): `workflows/image_flux3_klein_distilled_image_edit.json`
- Flujo 05 (multirreferencia, dos entradas): `workflows/05_F05_Distilled_MultiReference_1to10.json`
- Flujo 06 (layout por bounding boxes): `workflows/06_F06_Distilled_BoundingBox_Layout_Edit.json`
- Flujo 07 (comparación base vs destilado): `workflows/07_F07_Base_vs_Distilled_A_B.json`
- Portadas promocionales: `covers/` (01 a 07)
- Paper, blog o demo oficiales de FLUX 3 Klein: no disponibles en la información proporcionada.
