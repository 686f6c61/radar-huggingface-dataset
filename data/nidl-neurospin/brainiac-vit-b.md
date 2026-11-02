# nidl-neurospin/brainiac-vit-b

## Resumen

BrainIAC ViT-B es un modelo de vision 3D basado en un Vision Transformer (ViT-B) preentrenado de forma auto-supervisada con SimCLR sobre imagenes de resonancia magnetica (MRI) cerebral humana. Lo desarrollan los autores del proyecto BrainIAC (AIM-KannLab) y esta redistribucion corre a cargo de nidl-neurospin, que lo publica en formato safetensors compatible con la libreria `nidl` para su uso en pipelines de neuroimagen. El modelo resuelve el problema de obtener representaciones genericas y reutilizables de volumenes de MRI sin necesidad de etiquetas, lo que permite hacer fine-tuning posterior en tareas clinicas con pocos datos anotados.

El modelo cuenta con 90.514.688 parametros y una arquitectura transformer 3D que procesa parches volumetricos. Es relevante ahora porque los foundation models en neuroimagen estan emergiendo como alternativa a los entrenamientos especificos por tarea, y BrainIAC se presenta como un modelo generalizable para el analisis de MRI cerebral. La redistribucion en `nidl` facilita su integracion en flujos de trabajo de investigacion en neurociencia computacional.

La licencia es de solo investigacion (research-only), lo que restringe su uso a ambito academico y educativo no comercial. No es un modelo de lenguaje: no genera texto ni soporta conversacion, sino que produce embeddings de imagenes de MRI para tareas downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer 3D (ViT-B) con preentrenamiento SimCLR |
| Parametros totales | 90.514.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; procesa volumenes de MRI) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no aplica; modelo de imagen) |
| Licencia | brainiac-research-only (solo investigacion academica y educacion, no comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BrainIAC ViT-B es un Vision Transformer de tamano base adaptado a entrada 3D, disenado para procesar volumenes de resonancia magnetica cerebral. El preentrenamiento se realizo con SimCLR, un metodo de aprendizaje auto-supervisado contrastivo que aprende representaciones maximizando la similitud entre vistas aumentadas de la misma imagen y minimizando la de imagenes distintas. El modelo original no incorpora token de clase y devuelve el primer token de parche; la version redistribuida por nidl promedia los tokens de parche tras la normalizacion final, por lo que sus caracteristicas difieren de las originales. La cabeza de proyeccion se entreno sobre el primer token de parche.

Los pesos publicados son los originales convertidos a safetensors sin modificaciones, con aprobacion de los autores. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de ajuste supervisado adicionales. La innovacion principal es el uso de SimCLR sobre MRI 3D para obtener un foundation model generalizable, segun el articulo de Tak et al. publicado en Nature Neuroscience (2026).

## Capacidades

- Extraccion de caracteristicas (embeddings) de volumenes de MRI cerebral 3D.
- Aprendizaje auto-supervisado que permite fine-tuning en tareas downstream con pocas etiquetas.
- Base para clasificacion, regresion y segmentacion de imagenes de neuroimagen tras ajuste.
- Procesamiento de parches volumetricos mediante atencion transformer 3D.
- Integracion con la libreria `nidl` mediante `SimCLR.from_pretrained` y utilidades de preprocesado.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues.
- No dispone de modo thinking, vision 2D general ni audio.

## Casos de uso

- Investigacion en clasificacion de enfermedades neurodegenerativas: el modelo sirve como extractor de caracteristicas congelado sobre volumenes de MRI, y las representaciones resultantes se usan para entrenar clasificadores lineales o ligeros que distingan sujetos sanos de pacientes con Alzheimer o Parkinson, reduciendo la necesidad de grandes cohortes etiquetadas.
- Segmentacion de estructuras cerebrales tras fine-tuning: partiendo de los pesos preentrenados, se ajusta una cabeza de segmentacion para delimitar tejido gris, blanco y liquido cefalorraquideo, aprovechando que el encoder ya ha aprendido representaciones anatomicas genericas.
- Analisis de cohortes en estudios longitudinales: los embeddings permiten agrupar y comparar sujetos a lo largo del tiempo, detectando cambios morfologicos asociados a progresion de enfermedad sin reentrenar el modelo desde cero.
- Preentrenamiento para tareas de imagen medica con datos escasos: en entornos con pocos estudios anotados, el modelo actua como inicializacion que acelera la convergencia y mejora la generalizacion frente a entrenar desde cero.
- Control de calidad y deteccion de artefactos en MRI: las representaciones pueden alimentar un detector de imagenes corruptas o de baja calidad en pipelines de adquisicion, filtrando estudios antes del analisis.
- Investigacion en representaciones latentes del cerebro: el modelo permite estudiar el espacio de embeddings para analizar similitudes estructurales entre sujetos y poblaciones, como herramienta de exploracion en neurociencia computacional.
- Reproducibilidad de estudios: al redistribuirse los pesos originales en safetensors con una API estable (`nidl`), se facilita replicar experimentos de la publicacion original en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 90,5 millones de parametros, los pesos en precision completa (fp32) ocupan aproximadamente 0,36 GB; en fp16 unos 0,18 GB. El consumo real depende del tamano del volumen de entrada y del numero de parches 3D procesados.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia en fp32; para lotes grandes de volumenes 3D se recomienda una GPU con 16 GB o mas (RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, siempre que se ajuste el tamano de lote al volumen de entrada.
- Opciones de despliegue: la via documentada es la libreria `nidl` (`pip install nidl[pretrained]`). No se dispone de informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo de vision.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos sobre modelos comparables de ViT 3D auto-supervisados para MRI (parametros, contexto, rendimiento o licencia), por lo que la comparativa se indica como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| BrainIAC ViT-B | 90.514.688 | no aplica | research-only | HuggingFace (nidl-neurospin) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia research-only: prohibido el uso comercial; solo investigacion academica y educacion.
- Modelo especializado en MRI cerebral; no es un modelo de lenguaje ni de vision general, y no debe usarse fuera de ese dominio.
- Diferencia respecto al original: la version de `nidl` promedia los tokens de parche en lugar de devolver el primero, por lo que las caracteristicas no son identicas a las del codigo original y pueden afectar a la reproducibilidad exacta de resultados publicados.
- Riesgo de sesgo por la composicion del dataset de preentrenamiento, que no se detalla en la informacion disponible; puede generalizar peor en poblaciones o protocolos de adquisicion distintos.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de representaciones poco fiables en volumenes atipicos o con artefactos.
- No se documentan limitaciones de idioma porque el modelo no procesa texto.
- Para produccion clinica se requeriria validacion externa y regulatoria; el modelo no esta destinado a diagnostico.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica adopcion temprana y poca validacion comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/nidl-neurospin/brainiac-vit-b
- Repositorio original de BrainIAC: https://github.com/AIM-KannLab/BrainIAC
- Libreria nidl: https://github.com/neurospin-deepinsight/nidl
- Articulo: Tak et al., A generalizable foundation model for analysis of human brain MRI, Nature Neuroscience, 2026. https://doi.org/10.1038/s41593-026-02202-6
