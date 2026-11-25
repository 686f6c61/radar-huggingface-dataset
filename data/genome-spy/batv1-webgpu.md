# genome-spy/BATv1-WebGPU

## Resumen

BATv1-WebGPU es una redistribucion empaquetada del modelo BATv1 (Binding Accessibility and Transcription), desarrollado originalmente por Jacob Schreiber y el Programmable Genomics Laboratory a partir de datos ENCODE. El modelo predice la union de proteinas al ADN mediante experimentos ChIP-seq, es decir, estima perfiles de accesibilidad y ocupacion proteica a lo largo de una secuencia genomica. Este repositorio, publicado por genome-spy, no contiene un modelo nuevo: reformatea los pesos originales para su ejecucion en navegador mediante WebGPU con un runner WGSL especifico (`cherimoya-bat-wgsl@1`).

El paquete incluye 17.145 archivos de pesos que corresponden a cinco pliegues (folds) por cada una de las 3.429 experimentos ChIP-seq disponibles. Los pesos se almacenan como archivos `.bin` en precisión float32 y se acompañan de un `manifest.json` que indexa los modelos y sus artefactos. El repositorio ocupa 4,0 GB y esta pensado para inferencia local en cliente, no para entrenamiento ni fine-tuning.

La relevancia de esta distribucion es practica: permite ejecutar predicciones de union proteina-ADN directamente en el navegador sin backend de Python ni GPU dedicada, lo que facilita la integracion en visores genomicos interactivos como GenomeSpy. Para entornos de servidor o pipelines clasicos, el autor remite a la variante BATv1-ONNX, que emplea ONNX Runtime en lugar del runner WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base BATv1; pesos empaquetados para runner WebGPU/WGSL) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.114 bases de ADN de entrada; 1.000 posiciones de salida |
| Tipos de cuantizacion | float32 (unico formato publicado) |
| Idiomas soportados | no disponible (modelo genomico, no linguistico) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.bin` propietario para runner `cherimoya-bat-wgsl@1`; variante ONNX en repo separado |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de BATv1 mas alla de su proposito: prediccion de union proteina-ADN a partir de secuencia. El modelo base fue entrenado por el Programmable Genomics Laboratory con datos ENCODE, y este repositorio redistribuye cinco pliegues por experimento (3.429 experimentos, 17.145 archivos de pesos). No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, algo esperable por otra parte en un modelo genomico supervisado.

La innovacion tecnica de esta distribucion es el empaquetado para WebGPU: los pesos se sirven como archivos binarios consumidos por un runner WGSL externo que procesa una secuencia por vez. La entrada de ADN se codifica en cuatro canales float32 en orden A, C, G, T (uno para la base coincidente, ceros para el resto; bases desconocidas como cuatro ceros). El modelo produce logits de perfil en dos canales (hebras plus y minus) sobre 1.000 posiciones, que comienzan 557 bases dentro de la secuencia de entrada (hg38 humano), mas un `log_counts` con log(1 + recuento total predicho).

## Capacidades

- Prediccion de union proteina-ADN (ChIP-seq) para 3.429 experimentos ENCODE.
- Generacion de perfiles de ocupacion en hebras plus y minus con un recuento total compartido.
- Prediccion solo a partir de secuencia (controles a cero) o condicionada por controles medidos (`controls` de forma `[1, 2, 2114]`).
- Procesamiento de una secuencia por invocacion del runner, con entrada fija de 2.114 bases.
- Ejecucion en navegador mediante WebGPU y shaders WGSL.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo genomico especializado, no un LLM.

## Casos de uso

- Visores genomicos interactivos: integracion del runner WebGPU en GenomeSpy para mostrar predicciones de union proteica superpuestas a tracks genomicos sin enviar secuencias a un servidor, preservando la privacidad de los datos.
- Analisis exploratorio en el navegador: investigadores que trabajan con regiones hg38 concretas pueden evaluar la prediccion de un factor de transcripcion sobre una variante sin instalar Python ni CUDA.
- Priorizacion de variantes: comparar el perfil predicho entre la secuencia de referencia y una variante para detectar posibles alteraciones de sitios de union, usando los cinco pliegues como medida de incertidumbre.
- Docencia y demostraciones: ejecutar inferencia ChIP-seq en un portatil con GPU integrada durante una clase o taller, sin infraestructura de servidor.
- Prototipado de pipelines: validar rapidamente la forma de las salidas (`profile_logits`, `log_counts`) antes de migrar a la variante ONNX para produccion.
- Aplicaciones cliente-side con datos sensibles: analisis de secuencias no publicas que no deben salir del equipo del usuario, aprovechando que el calculo ocurre localmente en WebGPU.
- Seleccion de experimentos: consultar `manifest.json` para localizar el pliegue y experimento adecuados entre los 3.429 disponibles antes de descargar los pesos concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `source/` para las descripciones y resultados originales del modelo base, pero no se incluyen cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; cada artefacto individual se descarga por separado desde `manifest.json`, pero el tamano por modelo no se especifica.
- GPU recomendadas: cualquier GPU con soporte WebGPU (navegadores Chromium recientes); no se indican modelos concretos.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el enfoque WebGPU en navegador, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: runner `cherimoya-bat-wgsl@1` (WebGPU/WGSL) para este repositorio; ONNX Runtime mediante `genome-spy/BATv1-ONNX` como alternativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BATv1-WebGPU | no disponible | 2.114 bases | `.bin` (WebGPU) | CC BY 4.0 | Hugging Face |
| BATv1-ONNX | no disponible | 2.114 bases | ONNX | no disponible | Hugging Face |
| BATv1 (original) | no disponible | 2.114 bases | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye el codigo del runner (`cherimoya-bat-wgsl@1`); sin el, los archivos `.bin` no son utilizables directamente.
- Requiere un navegador con soporte WebGPU; entornos sin WebGPU no pueden ejecutar esta variante.
- Procesa una sola secuencia por invocacion, lo que limita el throughput en comparacion con inferencia por lotes en servidor.
- Entrada de longitud fija (2.114 bases) y salida de 1.000 posiciones a partir del offset 557; no admite secuencias de longitud arbitraria sin adaptacion.
- Las predicciones estan restringidas a las 3.429 experimentos ENCODE incluidos; no generaliza a factores o tejidos fuera de ese conjunto.
- Riesgo de sesgo ligado a la composicion del dataset ENCODE original (no detallada en la informacion disponible).
- Licencia CC BY 4.0: permite uso comercial con atribucion; conviene revisar `LICENSE` y las condiciones del modelo base original.
- No es un modelo linguistico: no soporta generacion de texto, codigo ni razonamiento general.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/genome-spy/BATv1-WebGPU
- Modelo base original: https://huggingface.co/programmable-genomics/BATv1
- Variante ONNX: https://huggingface.co/genome-spy/BATv1-ONNX
