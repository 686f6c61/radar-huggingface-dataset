# khalilLTRS/cswin-ijepa-scatterfill-fundus-dryrun

## Resumen

`khalilLTRS/cswin-ijepa-scatterfill-fundus-dryrun` es un conjunto de artefactos de investigación publicados en Hugging Face por el autor `khalilLTRS` (Laatiris et al., LaRI, Universidad Ibn Tofail) asociados al artículo *"A Cross-Shaped-Window Encoder of Retinal Fundus Images for I-JEPA via Scatter-Fill Masking"* (CAISN'26). No es un modelo generativo ni un pipeline listo para producción: es un encoder de visión auto-supervisado entrenado con el paradigma I-JEPA sobre imágenes de fondo de ojo (retinografía), pensado para servir de extractor de características congelado en tareas de clasificación de retinopatía diabética y segmentación de disco/vaso óptico.

La arquitectura central es un CSWin Transformer (`cswin_base_3stage`, 59,8 M de parámetros) que sustituye al ViT-B/16 (85,8 M) habitual de I-JEPA. El preentrenamiento se realizó durante 200 épocas sobre un subconjunto de 3.512 imágenes de EyePACS a 224 px, estratificado por grado de retinopatía a nivel de paciente. La innovación declarada es el enmascarado *scatter-fill*, una variante del masking por bloques de I-JEPA adaptada a la ventana cruzada de CSWin.

Es importante subrayar que el propio autor etiqueta el repositorio como **DRY RUN — NOT RESULTS**: el pipeline de evaluación se ejecutó sobre una carga reducida (100 de 3.662 imágenes de APTOS, un epoch en Drishti-GS) en CPU, por lo que las métricas publicadas no son mediciones válidas. Los pesos del encoder sí corresponden al checkpoint real (época 199, EMA targets), pero el valor práctico del repositorio es hoy el de una prueba de cableado reproducible, no el de un modelo evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CSWin Transformer de 3 etapas (ventana cruzada) como encoder de I-JEPA; se incluye también un brazo ViT-B/16 de referencia |
| Parametros totales | 59,8 M (`cswin_base_3stage`); 85,8 M (`vit_base`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada fija de 224x224 px, 196 tokens de parche con patch size 16) |
| Tipos de cuantizacion | no disponible (solo se documentan pesos en safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (encoder); joblib (cabezas sklearn de evaluación) |

## Arquitectura y entrenamiento

El encoder sigue el esquema I-JEPA (Joint-Embedding Predictive Architecture, CVPR-23): se predicen las representaciones latentes de regiones enmascaradas de una imagen a partir de las representaciones de las regiones visibles, sin reconstruir píxeles ni depender de aumentos de datos predefinidos. En este trabajo el backbone es un CSWin Transformer de tres etapas, que aplica atención en ventanas con forma de cruz para capturar contexto horizontal y vertical de forma más eficiente que la atención global de un ViT. El predictor de I-JEPA usa `pred_depth=6` y `pred_emb_dim=384`. La variante *scatter-fill* modifica la política de enmascarado para adaptarla a la geometría de las ventanas cruzadas.

El preentrenamiento se realizó durante 200 épocas sobre 3.512 imágenes de fondo de ojo de EyePACS, a resolución de 224 px, con estratificación por grado de retinopatía a nivel de paciente. Se entrenó una semilla por brazo. Como controles se incluyen un `vit_base` (ViT-B/16) y una inicialización aleatoria `cswin_base_3stage_random` que sirve de suelo de referencia. No se documenta en la información disponible el uso de RLHF, DPO ni datos adicionales más allá del subconjunto de EyePACS. El código base es un fork del repositorio oficial de Meta `facebookresearch/ijepa` con una corrección para entrenamiento en una sola GPU.

## Capacidades

- Extracción de características visuales auto-supervisadas de imágenes de fondo de ojo a 224x224 px; la salida es un tensor de tokens `(B, 196, C)`.
- Clasificación de retinopatía diabética mediante *linear probe* o kNN sobre las características congeladas (evaluado sobre APTOS).
- Segmentación de disco óptico y copa (Drishti-GS) mediante decodificadores congelados con encoder congelado.
- Aprendizaje auto-supervisado sin etiquetas (I-JEPA) sobre dominio retiniano.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un encoder de visión puro.
- No dispone de modo *thinking*, visión generativa, audio ni generación de texto.

## Casos de uso

- Investigación en representación auto-supervisada de imágenes médicas: el encoder sirve como punto de partida para estudiar el efecto del enmascarado *scatter-fill* frente al masking por bloques de I-JEPA en un backbone CSWin.
- Clasificación de retinopatía diabética con pocas etiquetas: congelando el encoder y entrenando una regresión logística o un kNN sobre las características, se puede evaluar la calidad de la representación sin reentrenar el backbone.
- Segmentación de disco y copa óptica: el encoder congelado alimenta decodificadores ligeros para tareas de segmentación anatómica en retinografía.
- Reproducibilidad de pipelines: el repositorio incluye el notebook `caisn26_reproduce_pipeline.ipynb` y cabezas `.joblib` para replicar el experimento de evaluación.
- Punto de partida para *fine-tuning* en otros conjuntos de fondo de ojo (Messidor, IDRiD, etc.) reutilizando los pesos EMA de la época 199.
- Estudio comparativo de arquitecturas: el repositorio incluye brazos `vit_base` y `cswin_base_3stage_random`, lo que permite contrastar el efecto del backbone y del preentrenamiento en las mismas condiciones de evaluación.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a un *dry run* sobre carga reducida y el propio autor los califica de no significativos. Se reproducen a continuación tal cual, con la advertencia de que no son mediciones válidas.

| Bloque | Brazo | Métrica | Reproducido | Desv. | Artículo | Veredicto |
|---|---|---|---|---|---|---|
| APTOS | cswin_base_3stage | lp_qwk | 0,6188 | 0,0048 | 0,7506 | DRIFT |
| APTOS | cswin_base_3stage | knn_qwk | 0,3364 | 0,1408 | 0,7020 | DRIFT |
| APTOS | cswin_base_3stage | lp_bal_acc | 0,4500 | 0,0707 | 0,5705 | DRIFT |
| APTOS | cswin_base_3stage_random | lp_qwk | 0,6256 | 0,0032 | — | n/a |
| APTOS | cswin_base_3stage_random | knn_qwk | 0,1846 | 0,1976 | — | n/a |
| APTOS | cswin_base_3stage_random | lp_bal_acc | 0,5250 | 0,0354 | — | n/a |
| APTOS | vit_base | lp_qwk | 0,5556 | 0,1571 | 0,7110 | DRIFT |
| APTOS | vit_base | knn_qwk | 0,2716 | 0,5587 | 0,6826 | DRIFT |
| APTOS | vit_base | lp_bal_acc | 0,3500 | 0,0707 | 0,4909 | DRIFT |
| Drishti-GS (pup, seed 0) | vit_base | mean_dice | 0,0000 | — | 0,6707 | DRIFT |
| Drishti-GS (pup, seed 0) | cswin_base_3stage | mean_dice | 0,0000 | — | 0,6542 | DRIFT |
| Drishti-GS (pup, seed 0) | cswin_base_3stage_random | mean_dice | 0,0000 | — | — | n/a |

No se han publicado resultados de benchmarks válidos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del encoder (59,8 M de parámetros) se puede inferir que cabe holgadamente en cualquier GPU de consumo actual, pero no se han publicado mediciones.
- GPU recomendadas: no disponible en la información proporcionada; el propio autor indica que el *dry run* se ejecutó en CPU.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del encoder, aunque no se documenta.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file` y el helper del repositorio `ijepa-cswin`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a un encoder de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `khalilLTRS/cswin-ijepa-scatterfill-fundus-dryrun` | 59,8 M (CSWin) / 85,8 M (ViT) | 224x224 px | I-JEPA retiniano | no disponible | Hugging Face, 0 descargas |
| `facebook/ijepa_vith14_1k` | ~632 M (ViT-H/14) | 224x224 px | I-JEPA genérico ImageNet-1K | no disponible en la información | Hugging Face, oficial de Meta |
| `facebookresearch/ijepa` (repo) | ViT-B/L/H | 224x224 px | I-JEPA genérico | no disponible en la información | GitHub oficial |
| `khalilLaatiris/ijepa-core` (fork) | ViT-B/L/H | 224x224 px | I-JEPA con corrección single-GPU | no disponible en la información | GitHub |

No se dispone de comparativas numéricas fiables frente a alternativas, dado que los resultados publicados son de un *dry run*.

## Limitaciones y advertencias

- **El repositorio es un *dry run* explícito**: todas las métricas son de un pipeline de prueba con carga reducida y no deben citarse como resultados.
- Los resultados reproducidos **divergen drásticamente** del artículo original (QWK APTOS 0,62 frente a 0,75; Dice Drishti-GS 0,00 frente a 0,65-0,77). El autor lo etiqueta como DRIFT.
- La geometría de segmentación `paper` recorta el centro de la imagen de Drishti-GS mientras que las máscaras se deforman a marco completo, por lo que el Dice absoluto no es interpretable.
- Una sola semilla de preentrenamiento por brazo; 224 px en todo el pipeline; sin validación cruzada completa.
- Las cabezas `.joblib` son *pickles* de sklearn: solo deben cargarse desde este repositorio de confianza, nunca desde copias no verificadas.
- No se especifica licencia, lo que impide determinar si el uso comercial está permitido.
- No hay información sobre sesgos, alucinación (no aplica a un encoder), ni sobre comportamiento fuera del dominio retiniano.
- No es un modelo generativo ni un asistente: no soporta prompts de texto, tool calling ni agentes.
- El checkpoint corresponde a la época 199 (EMA targets), pero el pipeline de evaluación no está validado.

## Enlaces

- Hugging Face: https://huggingface.co/khalilLTRS/cswin-ijepa-scatterfill-fundus-dryrun
- Fork del código I-JEPA con corrección single-GPU: https://github.com/khalilLaatiris/ijepa-core
- Repositorio oficial de Meta I-JEPA: https://github.com/facebookresearch/ijepa
- Modelo I-JEPA ViT-H/14 de Meta en Hugging Face: https://huggingface.co/facebook/ijepa_vith14_1k
