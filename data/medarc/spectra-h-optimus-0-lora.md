# medarc/spectra-h-optimus-0-lora

## Resumen

SPECTRA LoRA - H-optimus-0 es un adaptador LoRA (rank 32, PEFT) desarrollado por MedARC para hacer robusto el modelo base `bioptimus/H-optimus-0` ante las variaciones de adquisición de diapositivas de histopatología (escáner, tinción y centro). Se entrena de forma contrastiva sobre tiles PLISM registrados, donde la misma zona de tejido aparece bajo múltiples condiciones de escáner y tinción; el objetivo es acercar las características de la misma muestra y separar las de muestras distintas. El adaptador modifica únicamente las proyecciones qkv, attn.proj, mlp.fc1 y mlp.fc2 de los 40 bloques del ViT, mediante un delta de rango 32, dejando intactos los pesos base.

El público objetivo son investigadores en patología computacional: el adaptador se publica con tres semillas independientes (`seed0`, `seed1`, `seed2`) que no forman un ensemble, y el resultado es un modelo de extracción de características de 1536 dimensiones, robusto a los principales factores de variación técnica en histopatología.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32) sobre Vision Transformer (ViT) de 40 bloques, embed_dim 1536, 256 parches espaciales y 5 tokens de prefijo |
| Parametros totales | no disponible (adaptador PEFT; el repositorio pesa 0.4 GB) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision; procesa 256 parches + 5 tokens de prefijo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador SPECTRA se basa en el modelo `bioptimus/H-optimus-0`, un Vision Transformer gigante con 40 bloques y 1536 dimensiones de embedding, cargado a traves de `timm`. La arquitectura original incluye 4 registros ademas del token [CLS], lo que da 256 parches espaciales y 5 tokens de prefijo. El entrenamiento se realiza con LoRA (PEFT 0.20.0) en precision fp32, sobre tiles registrados de PLISM: la misma ubicacion fisica se fotografia con distintos escaneres y tinciones, y el objetivo contrastivo es maximizar la similitud entre condiciones de la misma zona y minimizarla entre zonas diferentes. Se aprenden deltas de rango 32 en los modulos de atencion (qkv, attn.proj) y MLP (mlp.fc1, mlp.fc2), con alpha 64 y dropout 0.0. No se menciona RLHF/DPO ni ninguna tecnica de alineacion; el procedimiento es puramente contrastivo. Los projectores utilizados durante el entrenamiento no se publican.

La model card advierte que no se debe construir la arquitectura desde el nombre desnudo `vit_giant_patch14_reg4_dinov2`, porque la configuracion por defecto de timm es distinta; hay que pasar los kwargs explicitamente (`img_size=224`, `init_values=1e-5`, `num_classes=0`, `global_pool="token"`) y usar la revision fijada `b145cc1e6c6b30d3251aa8b1f844e6974188a743`.

## Capacidades

- Extraccion de caracteristicas de 1536 dimensiones a partir del token [CLS] de la imagen de entrada (224x224) normalizada con estadisticas H&E especificas.
- Robustez a variaciones de escaner, tincion y centro, evaluada en el indice PathoROB (cross-centre): 0.906 ± 0.004 frente a 0.800 del base.
- Mejora en recuperacion de tiles (retrieval) en PLISM: top-1 0.995 ± 0.001 entre escaneres y 0.915 ± 0.002 entre tinciones.
- Mejora moderada en prediccion de expresion genica (HEST) con Pearson r 0.4226 ± 0.0018 y en clasificacion CPTAC con AUC 0.6895 ± 0.0004.
- Capacidades de vision unicamente: no soporta tool calling, agentes, ni razonamiento textual, porque no es un modelo de lenguaje.
- El adaptador se puede fusionar con los pesos base (`merge_and_unload`) y servir como modelo independiente de extraccion de caracteristicas.

## Casos de uso

- Normalizacion de caracteristicas entre centros de adquisicion: el adaptador reduce el impacto del escaner y la tincion en los embeddings, por lo que es adecuado para entrenar un clasificador en un hospital y aplicarlo en otro. La mejora en PathoROB cross-centre (0.800 -> 0.906) respalda este uso.
- Recuperacion de imagenes en colecciones de histopatologia: los embeddings resultantes pueden indexarse para buscar tiles morfologicamente similares en grandes bases de datos multiescaner. El top-1 retrieval entre escaneres pasa de 0.978 a 0.995.
- Clasificacion de tejido en cohortes de cancer: al extraer caracteristicas robustas, se puede entrenar una cabeza lineal para tareas diagnosticas en datos de CPTAC; la AUC del base + adaptador (0.6895) mejora frente al base (0.6728).
- Investigacion en biomarcadores a partir de imagenes histopatologicas: la mejora en HEST (Pearson r 0.4226) sugiere que las caracteristicas son utiles para predecir expresion genica asociada a tejido, util en analisis de transcriptomica espacial.
- Analisis de diapositivas con diferentes protocolos de tincion: la robustez entre tinciones (top-1 retrieval 0.915) permite comparar muestras tenidas con metodos distintos sin necesidad de normalizacion de color explicita.
- Uso como backbone para modelos de patologia computacional: al fusionar el LoRA en H-optimus-0 se obtiene un extractor de caracteristicas de 1536 dimensiones que puede alimentar modelos de vision posteriores (clasificadores, segmentadores, etc.).
- Investigacion de dominio en patologia digital: el adaptador es una herramienta para estudiar la invarianza a las condiciones de adquisicion, ya que las tres semillas permiten medir la variabilidad del entrenamiento.

## Benchmarks y rendimiento

| Metrica | Modelo base | Base + SPECTRA LoRA (n=3 seeds, media ± 2SD) |
|---|---|---|
| PathoROB indice de robustez medio (cross-centre) | 0.800 | 0.906 ± 0.004 |
| PLISM top-1 retrieval entre escaneres | 0.978 | 0.995 ± 0.001 |
| PLISM top-1 retrieval entre tinciones | 0.830 | 0.915 ± 0.002 |
| HEST Pearson r medio | 0.4150 | 0.4226 ± 0.0018 |
| CPTAC AUC | 0.6728 | 0.6895 ± 0.0004 |

Los valores del modelo base son evaluaciones deterministas de una unica ejecucion; los del adaptador se leen del paper SPECTRA y muestran la media ± 2 desviaciones estandar de tres semillas. No se han publicado comparaciones con otros modelos distintos del base en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. La documentacion no proporciona cifras de memoria para el modelo base ni para el adaptador fusionado.
- GPU recomendadas: no disponible para el modelo concreto; el base H-optimus-0 es un ViT grande, por lo que se requiere una GPU de datos o una GPU de consumo de gama alta.
- No se proporcionan datos sobre si cabe en GPU de consumo; en cualquier caso, el modelo base completo es pesado para una GPU de gama baja.
- Opciones de despliegue: el adaptador se carga con `timm` + `peft` y se fusiona con `merge_and_unload`; no se documentan despliegues con vLLM, llama.cpp ni Ollama porque es un modelo de vision.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La unica comparacion documentada es contra el propio modelo base `bioptimus/H-optimus-0` sin el adaptador, cuyas diferencias se recogen en la seccion de benchmarks. No se dispone de informacion sobre otros adaptadores o modelos de la misma categoria.

## Limitaciones y advertencias

- El modelo base `bioptimus/H-optimus-0` esta restringido (gated) en Hub de Hugging Face; es necesario solicitar acceso, ser autenticado y descargar la revision exacta `b145cc1e6c6b30d3251aa8b1f844e6974188a743`. El adaptador es inutil sin los pesos base.
- El adaptador solo se ha probado con esa revision exacta; aplicarlo a otra revision del modelo base no esta probado.
- La normalizacion es especifica de H&E y no es ImageNet: hay que usar `mean=(0.707223, 0.578729, 0.703617)` y `std=(0.211883, 0.230117, 0.177517)`. Usar las estadisticas por defecto de timm degrada el rendimiento.
- El tamano de imagen debe ser 224; el valor por defecto de la arquitectura (518) produce un `pos_embed` incompatible y no cargara.
- El preprocesado correcto es Resize a 256 (bicubic) + CenterCrop a 224 (crop_pct 0.875), no un resize directo a 224.
- Las tres semillas (`seed0`, `seed1`, `seed2`) no forman un ensemble; deben tratarse como adaptadores independientes o para medir la variabilidad. `seed2` se entreno en realidad con semilla 3, no 2.
- El repositorio no incluye los projectores contrastivos ni el head de pooling; solo se libera el delta LoRA.
- No se mencionan evaluaciones de sesgo en la documentacion. Al ser un modelo de vision, el riesgo de alucinacion textual no aplica, pero puede haber sesgos en los datos de entrenamiento histopatologicos no descritos.

## Enlaces

- https://huggingface.co/medarc/spectra-h-optimus-0-lora
- https://huggingface.co/bioptimus/H-optimus-0
- https://github.com/bioptimus/releases/tree/main/models/h-optimus/v0
