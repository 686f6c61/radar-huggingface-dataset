# polymath-labs/transmorph-ixi-brain-mri

## Resumen

TransMorph IXI brain MRI es un repositorio de espejo que redistribuye, sin modificaciones, dos artefactos del proyecto TransMorph de Junyu Chen y colaboradores: los pesos del modelo ViT-V-Net y el dataset IXI preprocesado por los autores. No se trata de un modelo de lenguaje ni de un modelo generativo, sino de un modelo de registro de imagenes medicas (image registration) basado en transformer, disenado para alinear volumetricamente resonancias magneticas cerebrales.

El modelo resuelve el problema del registro deformable no supervisado: dado un par de imagenes (una fija y una movil), predice un campo de deformacion denso que las alinea. TransMorph fue publicado en Medical Image Analysis (2022) y combina un encoder tipo Swin Transformer con un decoder convolucional, siguiendo la estela de ViT-V-Net, cuyo checkpoint se incluye aqui como referencia o linea base.

La relevancia de este repositorio es practica: agrupa en un unico lugar los pesos del modelo y el dataset preprocesado listo para evaluacion, con hashes SHA-256 verificables y licencias explicitas. Es util para reproducir resultados del paper, hacer benchmarking de algoritmos de registro o servir de punto de partida para pipelines de neuroimagen. El tamano del repo es de 2,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder tipo Swin Transformer + decoder convolucional); se incluyen pesos de ViT-V-Net como linea base |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision para registro de imagenes, no procesa texto) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pth.tar`) |
| Idiomas soportados | no aplica (no es un modelo linguistico) |
| Licencia | Mixta: MIT para los pesos ViT-V-Net, CC BY-SA 3.0 Unported para el dataset IXI preprocesado |
| Formato de pesos | PyTorch (`.pth.tar`); datos en ZIP (`IXI_data.zip`) |

## Arquitectura y entrenamiento

El modelo principal del proyecto TransMorph es una red de registro deformable no supervisado que emplea un encoder basado en Swin Transformer para extraer caracteristicas jerarquicas de la imagen en movimiento, y un decoder convolucional que produce un campo de deformacion denso. La funcion de perdida combina similitud de intensidades (tipicamente NCC o MSE) con una regularizacion de suavidad del campo de deformacion. Los pesos incluidos en este repositorio corresponden a ViT-V-Net, la arquitectura predecesora que TransMorph usa como comparacion.

El entrenamiento se realiza sobre pares de imagenes de resonancia magnetica cerebral. El dataset IXI preprocesado que se redistribuye contiene volumenes T1 de sujetos sanos, normalizados y listos para entrenamiento o evaluacion. No se dispone en la informacion proporcionada de detalles sobre el numero exacto de tokens de entrenamiento (no aplica), composicion del dataset mas alla de IXI, ni sobre el uso de tecnicas de RLHF/DPO (no aplica a este dominio). La innovacion tecnica principal del proyecto es el uso de atencion tipo transformer para capturar dependencias de largo alcance en el registro deformable, superando las limitaciones de las CNN puramente convolucionales.

## Capacidades

- Registro deformable no supervisado de imagenes de resonancia magnetica cerebral (pares fijo/movil).
- Prediccion de campos de deformacion densos para alineacion volumetrica.
- Extraccion de caracteristicas jerarquicas mediante encoder tipo Swin Transformer.
- Uso como linea base (ViT-V-Net) para comparacion con metodos de registro.
- Evaluacion sobre el dataset IXI preprocesado incluido en el repositorio.
- No soporta tool calling, function calling ni agentes.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales fuera del registro de imagen medica.

## Casos de uso

- Reproduccion de resultados del paper TransMorph: cargar los pesos y el dataset IXI incluidos para replicar las metricas publicadas de Dice, HD y Jacobiano.
- Benchmarking de algoritmos de registro: usar ViT-V-Net como linea base contra metodos propios o de terceros sobre el mismo conjunto IXI preprocesado.
- Preprocesamiento en pipelines de neuroimagen: alinear volumenes de RM cerebrales antes de analisis volumetrico, morfometria o segmentacion.
- Investigacion en registro deformable: modificar la arquitectura o la funcion de perdida y comparar contra los pesos de referencia.
- Docencia y formacion: material practico con hashes verificables para ensenar registro de imagen medica con transformers.
- Desarrollo de herramientas clinicas de investigacion: base para prototipos de alineacion de estudios longitudinales, siempre con validacion clinica independiente.
- Verificacion de integridad de datos: los SHA-256 publicados permiten comprobar descargas en entornos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del tamano de los volumenes de entrada y de la implementacion.
- GPU recomendadas: no disponible; el paper original entrena y evalua en GPU, pero no se especifican modelos concretos en la informacion suministrada.
- Compatibilidad con GPU de consumo: no confirmada; requiere comprobar el consumo de memoria con los volumenes IXI reales.
- Opciones de despliegue: PyTorch (los pesos son `.pth.tar`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TransMorph (ViT-V-Net incluido) | no disponible | no aplica | no disponible en la informacion | MIT (pesos) / CC BY-SA 3.0 (datos) | Hugging Face (este repo) |
| VoxelMorph | no disponible | no aplica | no disponible en la informacion | no disponible | no disponible |
| SyN (ANTs) | no aplica (metodo clasico) | no aplica | no disponible en la informacion | no disponible | no disponible |

No se dispone de datos cuantitativos de rendimiento en la informacion proporcionada para establecer una comparativa numerica fiable.

## Limitaciones y advertencias

- El repositorio es una copia byte a byte de artefactos de terceros; no incluye codigo de inferencia ni scripts de evaluacion.
- Los pesos corresponden a ViT-V-Net, no al modelo TransMorph completo; no deben presentarse como el modelo principal del paper.
- El dataset IXI contiene sujetos sanos; el rendimiento en poblaciones patologicas no esta garantizado.
- Licencia mixta: los pesos son MIT, pero el dataset IXI es CC BY-SA 3.0, lo que impone obligaciones de atribucion y ShareAlike sobre obras derivadas de los datos.
- Uso clinico: no es un dispositivo medico; cualquier aplicacion clinica requiere validacion regulatoria independiente.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero un campo de deformacion incorrecto puede producir alineaciones invalidas sin aviso.
- No se especifican sesgos demograficos del dataset IXI en la informacion disponible.
- Sin descargas ni likes registrados; no hay evidencia de uso comunitario que permita validar la reproducibilidad.
- Fecha de creacion del repositorio (2026-11-17) posterior a la publicacion del paper; verificar que los hashes coinciden con los originales antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/polymath-labs/transmorph-ixi-brain-mri
- Repositorio TransMorph: https://github.com/junyuchen245/TransMorph_Transformer_for_Medical_Image_Registration
- Pagina IXI del repositorio: https://github.com/junyuchen245/TransMorph_Transformer_for_Medical_Image_Registration/blob/main/IXI/TransMorph_on_IXI.md
- Paper (DOI): https://doi.org/10.1016/j.media.2022.102615
- Preprint (arXiv): https://arxiv.org/abs/2111.10480
- Dataset IXI original: https://brain-development.org/ixi-dataset/
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
- Pesos ViT-V-Net (Google Drive): https://drive.google.com/uc?export=download&id=1VBL2nlB3iWcDBQbOr4FxhR-xrG_quIbT
- Dataset IXI preprocesado (Google Drive): https://drive.google.com/uc?export=download&id=1-VQewCVNj5eTtc3eQGhTM2yXBQmgm8Ol
