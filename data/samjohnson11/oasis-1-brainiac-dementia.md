# samjohnson11/oasis-1-brainiac-dementia

## Resumen

OASIS-1 dementia classification es un ajuste fino del modelo fundacional BrainIAC ViT-B para clasificacion binaria de demencia a partir de resonancia magnetica cerebral estructural. Lo desarrolla samjohnson11 y se publica bajo la licencia BrainIAC Research-Only. La tarea concreta es distinguir sujetos con CDR 0 (sin deterioro cognitivo) de sujetos con CDR > 0 (deterioro, incluyendo CDR 0.5) usando volumenes de RM de 96³ voxeles del dataset OASIS-1.

El modelo parte del checkpoint oficial BrainIAC.ckpt (Tak et al., 2026), un ViT-B de MONAI con parches de 16³ y dimension de embedding 768, y anade una cabeza de clasificacion compuesta por Dropout(0.2) y una capa Linear(768→1). El ajuste fino completo sobre 235 sujetos alcanza un AUROC medio de 0,738 (SD 0,003) en validacion cruzada anidada 5×5 a nivel de sujeto, y una variante con preprocesado N4 y registro rigido sube a 0,748 (SD 0,007).

Es relevante como ejemplo de adaptacion de un modelo fundacional de neuroimagen a una tarea clinica concreta, pero conviene subrayar que se trata de un artefacto de investigacion: el repositorio no contiene los pesos entrenados (solo configuraciones y resultados), la cohorte es pequena y de un unico centro, y la licencia prohibe explicitamente el uso clinico y comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (MONAI ViT-B) con cabeza lineal de clasificacion binaria |
| Parametros totales | no disponible (backbone ViT-B de 768 dimensiones; recuento exacto no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen 96³ voxeles, parches de 16³) |
| Tipos de cuantizacion | no disponible (entrenamiento en bf16; no se documentan cuantizaciones para inferencia) |
| Idiomas soportados | no disponible (modelo de imagen, no linguistico) |
| Licencia | brainiac-research-only (BrainIAC Research-Only License) |
| Formato de pesos | checkpoints no publicados; el autor menciona 25 checkpoints por fold de 177 MB cada uno en bf16 (aprox. 4,4 GB en total), aun no subidos |

## Arquitectura y entrenamiento

El backbone es BrainIAC ViT-B, un transformer de vision de MONAI que procesa volumenes de 96³ voxeles con parches de 16³ y una dimension de embedding de 768. No usa token CLS: la cabeza de clasificacion lee directamente el token 0. Sobre el backbone se anade Dropout(0.2) seguido de Linear(768→1), entrenado con BCEWithLogits. El backbone se inicializa desde el checkpoint oficial BrainIAC.ckpt y se ajusta con AdamW, tasa de aprendizaje 1e-5 para el backbone y 1e-3 para la cabeza, weight decay 0.05 y recorte de gradiente 1.0, en bf16 sobre una GPU Colab L4. El entrenamiento se extiende hasta 40 epocas con paciencia 8 y una particion interna de early stopping del 15%. La unica aumentacion es un volteo aleatorio izquierda-derecha.

Los datos proceden de OASIS-1 cross-sectional: 235 sujetos, 135 con CDR 0 y 100 con CDR > 0. La evaluacion usa validacion cruzada anidada estratificada 5×5 a nivel de sujeto, generando 25 folds retenidos, y se reporta el AUROC medio sobre repeticiones con su desviacion estandar. Se probaron varias estrategias: backbone congelado, ajuste completo, descongelacion del ultimo bloque y de los dos ultimos bloques con distintas tasas de aprendizaje, y una variante de preprocesado (n4rigid) que aplica volteo anteroposterior, correccion de sesgo N4 dentro de la mascara cerebral, remuestreo a 1 mm, inicializacion por centro de masa, registro rigido Mattes-MI a la plantilla HD-BET, recorte 96³ y z-score dentro de mascara.

## Capacidades

- Clasificacion binaria de demencia (CDR 0 frente a CDR > 0) a partir de RM cerebral estructural preprocesada a 96³ voxeles.
- Extraccion de representaciones de neuroimagen mediante el backbone ViT-B preentrenado en BrainIAC.
- Ajuste fino completo o parcial (congelado, ultimo bloque, dos ultimos bloques) segun el regimen de entrenamiento.
- Generacion de mapas de atencion cualitativos desde el token 0, que en los bloques profundos se concentran hacia el centro del cerebro.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de vision puro para una unica tarea de clasificacion.

## Casos de uso

- Investigacion en biomarcadores de demencia: usar el modelo como referencia reproducible para comparar estrategias de ajuste fino (congelado frente a completo) sobre BrainIAC en OASIS-1, con los resultados agregados ya publicados en el repositorio.
- Reproduccion de experimentos: las configuraciones de ejecucion y las salidas de tests estadisticos permiten replicar el pipeline de validacion cruzada anidada 5×5 a nivel de sujeto sin necesidad de los pesos.
- Analisis de preprocesado: la variante n4rigid (correccion N4, registro rigido a plantilla HD-BET, z-score en mascara) sirve como receta documentada para estudiar el impacto del preprocesado en el AUROC (0,748 frente a 0,738).
- Estudio de mapas de atencion: los mapas cualitativos del token 0 en bloques profundos permiten explorar que regiones cerebrales concentran la senal discriminativa, como punto de partida para analisis de interpretabilidad mas amplios.
- Docencia y formacion en neuroimagen con IA: ejemplo completo de adaptacion de un modelo fundacional a una tarea clinica concreta, incluyendo regimen de entrenamiento, metricas y limitaciones declaradas.
- Base para futuros ajustes finos: el esquema de cabeza (Dropout 0.2 + Linear 768→1) y los hiperparametros documentados pueden reutilizarse para otras etiquetas de OASIS-1 u otras cohortes, siempre bajo la licencia BrainIAC Research-Only.

## Benchmarks y rendimiento

Resultados de AUROC en validacion cruzada anidada 5×5 a nivel de sujeto (25 folds retenidos), extraidos de `results/*/summary*.json`:

| Ejecucion | AUROC medio (SD) |
|---|---|
| Backbone congelado, 198 sujetos | 0,619 (0,028) |
| Ajuste completo, 198 sujetos | 0,643 (0,013) |
| Backbone congelado, 235 sujetos | 0,716 (0,005) |
| Ajuste completo, 235 sujetos (ft235b) | 0,738 (0,003) |
| Ultimo bloque descongelado | 0,730 (0,005) |
| Dos ultimos bloques, lr 1e-6 a 1e-5 | 0,729 a 0,730 |
| Dos ultimos bloques, lr 1e-4 | 0,728 (0,009) |
| Ajuste completo sobre volumenes N4 + rigido | 0,748 (0,007) |

Comparaciones estadisticas reportadas: ajuste completo frente a congelado (235 sujetos) mejora +0,023 AUROC, mejor en 20 de 25 folds, con p corregida de Nadeau-Bengio de 0,067; n4rigid frente a ft235b mejora +0,009 AUROC con p corregida de 0,45. La referencia de Tak et al. (AUC 0,88, IC 95% 0,75-0,97) corresponde a MCI frente a control sano en un unico conjunto de test de 40 escaneos y no es directamente comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, el entrenamiento se ejecuto en bf16 sobre una GPU Colab L4 (24 GB), con checkpoints por fold de 177 MB en bf16.
- GPU recomendadas: cualquier GPU con al menos 24 GB para reproducir el entrenamiento (L4, A100, H100); para inferencia en bf16 el backbone ViT-B es manejable en GPUs consumer de gama alta, aunque no se documentan requisitos minimos.
- Cabe en GPU consumer: probablemente si en RTX 3090/4090 (24 GB) para inferencia, dado el tamano del checkpoint; no confirmado por el autor.
- Opciones de despliegue: no documentadas. El codigo de referencia esta en el repositorio de GitHub del autor; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un ViT de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | AUROC OASIS-1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OASIS-1 dementia (este modelo) | ViT-B, 768-d (recuento no publicado) | 96³ voxeles | 0,738 (SD 0,003); 0,748 con n4rigid | BrainIAC Research-Only | Pesos no subidos; solo configs y resultados |
| BrainIAC base (Tak et al., 2026) | ViT-B, 768-d | 96³ voxeles | 0,88 (IC 95% 0,75-0,97) en MCI vs control, test de 40 escaneos | BrainIAC Research-Only | Checkpoint oficial en GitHub AIM-KannLab/BrainIAC |
| Otros ajustes sobre OASIS-1 | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con BrainIAC base no es directa: la tarea (MCI frente a control sano), el tamano del test (40 escaneos) y el protocolo de evaluacion difieren del ajuste fino aqui descrito.

## Limitaciones y advertencias

- Cohorte pequena (235 sujetos) y de un unico centro, sin test externo; la SD del AUROC por fold es de aproximadamente 0,065.
- Modelo exclusivamente de investigacion: no validado para uso clinico, y la licencia BrainIAC prohibe el uso clinico y comercial.
- Las etiquetas derivan de un umbral de CDR, agrupando CDR 0.5 con demencia, lo que mezcla deterioro leve con demencia establecida.
- Los pesos entrenados no estan publicados en el repositorio; solo hay configuraciones, resultados agregados y salidas de tests estadisticos.
- Los mapas de atencion son cualitativos y se basan en 4 escaneos de un unico fold; no constituyen evidencia interpretativa solida.
- No se incluyen imagenes de OASIS ni volumenes derivados; OASIS-1 debe obtenerse por separado y es solo para investigacion no comercial.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero el modelo puede producir clasificaciones erroneas con alta confianza en poblaciones fuera de la distribucion de entrenamiento.
- No hay informacion sobre sesgos demograficos, de sexo o de edad mas alla de la composicion de OASIS-1.

## Enlaces

- Hugging Face: https://huggingface.co/samjohnson11/oasis-1-brainiac-dementia
- Codigo del autor: https://github.com/samwjohnson/oasis-1-dementia-classification
- BrainIAC (codigo y checkpoint): https://github.com/AIM-KannLab/BrainIAC
- Licencia BrainIAC Research-Only: https://github.com/AIM-KannLab/BrainIAC/blob/main/LICENSE
- Paper BrainIAC (Tak et al., Nature Neuroscience, 2026): https://doi.org/10.1038/s41593-026-02202-6
- Dataset OASIS-1: https://sites.wustl.edu/oasisbrains/
- Referencia OASIS (Marcus et al., 2007): https://doi.org/10.1162/jocn.2007.19.9.1498
