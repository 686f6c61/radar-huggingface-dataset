# needle-tools/IDOL-webgpu

## Resumen

IDOL-webgpu es una distribucion de pesos cuantizados del modelo IDOL de speridlabs, preparada por needle-tools para ejecutar generacion image-to-3D basada en Gaussian splatting directamente sobre WebGPU. El modelo resuelve la tarea de reconstruir un objeto 3D representado como conjunto de gaussianas a partir de una unica imagen de entrada, y esta empaquetado para su uso con la libreria `trellis-webgpu` en lugar de un stack Python/CUDA convencional.

La relevancia de esta variante es el objetivo de despliegue: al estar orientada a WebGPU, permite ejecutar la inferencia en el navegador o en runtimes compatibles con esta API, sin depender de CUDA ni de servidores GPU dedicados. El repositorio ocupa 1,7 GB e incluye cinco componentes de modelo listados en `catalog.json`, que cubren tanto el muestreo completo como el muestreo acelerado.

La informacion publicada es muy limitada: no se detallan parametros, longitud de contexto ni idiomas, y no se han publicado resultados de benchmarks. La licencia es compuesta (`apache-2.0-and-dinov3`) y requiere revisar `LICENSES.md` y `NOTICE` antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de generacion image-to-3D con representacion Gaussian splatting; detalles del backbone no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica a un pipeline image-to-3D de imagen unica) |
| Tipos de cuantizacion | pesos cuantizados para WebGPU; niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | `apache-2.0-and-dinov3` (compuesta; ver `LICENSES.md`) |
| Formato de pesos | pesos cuantizados para la libreria `trellis-webgpu`; no se indica safetensors ni GGUF |
| Tamano del repositorio | 1,7 GB |
| Pipeline | image-to-3d |
| Modelo base | speridlabs/idol (relacion: quantized) |
| Libreria | trellis-webgpu |
| Componentes | 5, listados en `catalog.json` |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base IDOL ni sobre el proceso de entrenamiento: no hay datos sobre numero de tokens, composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. Por la etiqueta `gaussian-splatting` y la tarea declarada, se trata de un modelo que predice un conjunto de gaussianas 3D a partir de una imagen, dentro de un pipeline de reconstruccion generativa; la referencia a `trellis-webgpu` sugiere una implementacion inspirada en arquitecturas tipo TRELLIS para generacion 3D estructurada.

La innovacion tecnica documentada es el empaquetado: los pesos estan cuantizados y adaptados para ejecutarse sobre WebGPU, con cinco componentes separados descritos en `catalog.json`. La model card indica que el muestreo completo y el muestreo acelerado utilizan los mismos pesos, lo que simplifica el despliegue. No se detallan innovaciones de atencion, decodificacion especulativa ni esquemas de entrenamiento.

## Capacidades

- Generacion image-to-3D: produce una representacion 3D mediante Gaussian splatting a partir de una unica imagen de entrada.
- Muestreo completo y muestreo acelerado con los mismos pesos, segun la model card.
- Ejecucion sobre WebGPU mediante la libreria `trellis-webgpu`.
- Distribucion modular en cinco componentes declarados en `catalog.json`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues.
- No se documentan modos de pensamiento, vision general, audio ni otras modalidades.

## Casos de uso

- Visualizacion 3D en navegador: el modelo puede generar una representacion de gaussianas a partir de una foto y renderizarse en el cliente mediante WebGPU, lo que permite previsualizar objetos 3D sin backend GPU dedicado.
- Catalogos de producto interactivos: a partir de una imagen de producto se puede generar una representacion 3D navegable, adecuada para fichas de e-commerce que requieran rotacion o inspeccion del articulo.
- Prototipado rapido en herramientas de modelado: un artista puede convertir un concepto 2D en un borrador 3D con gaussianas para iterar sobre la forma antes de un modelado poligonal definitivo.
- Educacion y demostraciones tecnicas: al ejecutarse sobre WebGPU, sirve para desplegar demos de reconstruccion 3D en paginas web sin instalacion de dependencias CUDA.
- Previsualizacion en pipelines de contenido: integrado en un flujo de produccion, permite generar vistas 3D preliminares de assets a partir de imagenes de referencia antes de un proceso de retopologia o bakeado.
- Investigacion en generacion 3D: como variante cuantizada del modelo base, facilita experimentos de reproducibilidad y comparacion de calidad entre muestreo completo y acelerado con los mismos pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio pesa 1,7 GB, lo que da una cota inferior orientativa del espacio de pesos, pero no se especifica el consumo en ejecucion ni el de los cinco componentes por separado.
- GPU recomendadas: no disponible. Al estar orientado a WebGPU, el requisito depende de la implementacion del navegador o runtime y del soporte de la GPU, no de CUDA.
- Compatibilidad con GPU de consumo: no confirmada; no se publica lista de GPUs validadas.
- Opciones de despliegue: libreria `trellis-webgpu` sobre WebGPU; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| needle-tools/IDOL-webgpu | no disponible | no aplica | image-to-3D (Gaussian splatting) | apache-2.0-and-dinov3 | cuantizado para `trellis-webgpu` |
| speridlabs/idol (modelo base) | no disponible | no aplica | image-to-3D (Gaussian splatting) | no disponible en la informacion proporcionada | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La informacion publicada es minima: no hay datos de arquitectura, parametros, dataset de entrenamiento ni evaluacion, lo que dificulta estimar la calidad de la reconstruccion.
- Al derivar de una unica imagen, la geometria en oclusiones y las vistas no observadas son inferidas y pueden presentar inconsistencias.
- No se documentan sesgos conocidos; al no publicarse la composicion del dataset, no es posible evaluar sesgos de dominio o de representacion de objetos.
- Riesgo de alucinacion geometrica: el modelo puede generar detalle plausible pero inexistente en la imagen de entrada.
- Licencia compuesta `apache-2.0-and-dinov3`: el uso comercial exige revisar `LICENSES.md` y `NOTICE`, ya que los componentes pueden tener terminos distintos; la etiqueta de Hugging Face figura como `other`.
- Dependencia de WebGPU: el rendimiento y la compatibilidad dependen del navegador, del driver y del soporte de la GPU, con variabilidad entre plataformas.
- No se documentan idiomas soportados ni capacidades de texto, por lo que no debe emplearse como modelo linguistico.
- No hay resultados de benchmarks ni validacion independiente publicada; conviene evaluar la calidad en el dominio concreto antes de llevarlo a produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/needle-tools/IDOL-webgpu
- Modelo base: https://huggingface.co/speridlabs/idol
- Licencias del repositorio: https://huggingface.co/needle-tools/IDOL-webgpu/blob/main/LICENSES.md
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
