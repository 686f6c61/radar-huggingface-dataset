# jbduran/bartholomew-experiments

## Resumen

`jbduran/bartholomew-experiments` es un archivo de entrenamiento, no un modelo desplegable. Contiene las 39 ejecuciones (runs) que dieron lugar a la familia BART, desarrollada por Unbounded Labs y publicada por el usuario jbduran. Incluye checkpoints base, tokenizadores, configuraciones y resultados de evaluacion de cada experimento, incluidas las ramas descartadas. Su proposito es la reproducibilidad y la inspeccion del proceso de entrenamiento, no la inferencia directa.

El trabajo se apoya en nanochat, un framework de entrenamiento de modelos de lenguaje de escala reducida, y se orienta a la generacion de texto en ingles con un sesgo tematico hacia material historico anterior a 1930 (etiquetas `pre-1930`, `historical`, `vintage`). La nomenclatura de los runs codifica profundidad (`d12`, `d24`, `d32`), ratio parametros-datos (`r11`–`r30`), longitud de contexto (`ctx4096`, `ctx8192`), patron de ventana (`sssl`) y variante de tokenizador (`fulltok`, `randtok`).

La relevancia actual del repositorio es documental: expone un fallo concreto de mezcla de datos (ratios calculados por numero de documentos en lugar de por tokens) y su correccion, que dio lugar al modelo publicado como `bart`. El repositorio ocupa 1236,2 GB, lo que refleja la acumulacion de checkpoints de 39 ejecuciones. Para uso practico deben emplearse `jbduran/bart` o `jbduran/bart-sft`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (framework nanochat); profundidades d12, d24 y d32 segun run |
| Parametros totales | 1,38B en el run `clean1930s-d24-r12-ctx4096-sssl-fulltok-v1`; no disponible para el resto de runs |
| Parametros activos | no disponible (no se documenta arquitectura MoE) |
| Longitud de contexto | 4096 y 8192 tokens segun run (`ctx4096`, `ctx8192`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | checkpoints de PyTorch (`pytorch`); no se documenta safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only entrenado con nanochat, con variantes de profundidad d12, d24 y d32. Los runs se organizan jerarquicamente: cada experimento base posee su propio tokenizador y checkpoints base; los runs de SFT se anidan bajo su padre base exacto (`experiments//sft/<sft-run>/`) y los de post-entrenamiento bajo su padre SFT. El prefijo del nombre indica la generacion del corpus: `think-` corresponde a `bart-dataset-v1`, `thinkcleaned-` a `bart-dataset-v2`, `clean1930s-` a `bart-dataset-v3` y `Think.Unbounded-` a v3 mas el dataset de midtraining `zachnorton03/bart-midtrain`.

El hallazgo tecnico central documentado es un error en las mezclas de midtraining de `Think.Unbounded-d32`: los ratios se calcularon por numero de documentos, lo que produjo desviaciones severas (una mezcla objetivo del 60% de midtraining aporto solo el 25%; otra objetivo del 30% aporto el 11,5%). La reparacion, `Think.Unbounded-d32-v2mix-cont`, ramifica desde ese run en el paso 5500 conservando el estado del optimizador y continua con mezclas corregidas calculadas por tokens; es el modelo publicado como `bart`. El tokenizador de referencia para todas las mezclas de midtraining es el del run d24 de 1,38B. No se documentan en la informacion disponible el volumen total de tokens, la composicion detallada del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto en ingles, con dominio tematico orientado a material historico anterior a 1930.
- Razonamiento y continuacion de texto multi-turno dentro de la ventana de contexto del run correspondiente (4096 u 8192 tokens).
- Seis variantes de ajuste fino supervisado (SFT) en el directorio `sft/` de `Think.Unbounded-d32-v2mix-cont`, entre ellas `pre1930-curriculum-c3-robust-v2` (publicada como `bart-sft`), `karpathy-modern-sft-v1`, `nanochat-default-datamatch-v1`, `c3-robust` y dos configuraciones `c3-robust-v3`.
- Evaluacion sobre el conjunto `vintage-core`, con resultados agregados en el directorio `evaluations/`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Reproduccion de experimentos: reentrenar cualquiera de los 39 runs a partir de su configuracion, tokenizador y checkpoints, usando los nombres de repositorio y dataset registrados en cada `config.json`.
- Auditoria de mezclas de datos: comparar `Think.Unbounded-d32` con `Think.Unbounded-d32-v2mix-cont` para estudiar el impacto de calcular ratios por documentos frente a por tokens en el midtraining.
- Investigacion sobre dominio historico: analizar el efecto de un corpus pre-1930 en el comportamiento generativo comparando los prefijos `think-`, `thinkcleaned-` y `clean1930s-`.
- Estudio de tokenizadores: contrastar las variantes `fulltok` y `randtok` y su efecto en las mezclas de midtraining construidas contra el tokenizador del run d24.
- Comparacion de estrategias de SFT: evaluar las seis variantes de ajuste fino anidadas bajo el run d32 corregido frente a los resultados de `vintage-core`.
- Analisis de escalado por profundidad: comparar los runs d12, d24 y d32 con ratios parametros-datos entre r11 y r30 para estudiar compromisos de tamano y datos.
- Docencia y formacion: usar el archivo como caso practico de linaje de experimentos, incluidas las ramas fallidas, en cursos de entrenamiento de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El repositorio incluye un directorio `evaluations/` con resultados de `vintage-core` entre modelos, pero las cifras no se detallan en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El unico tamano documentado es 1,38B parametros (run d24), para el que en precision FP16 se requeririan aproximadamente 2,8 GB solo en pesos, mas memoria para el contexto; el resto de runs no tiene tamano publicado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el repositorio esta etiquetado como `pytorch` y no se ofrecen pesos GGUF ni integracion con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio completo ocupa 1236,2 GB, por lo que la descarga integra requiere espacio en disco considerable; conviene descargar runs individuales.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio no es un modelo listo para produccion: es un archivo de entrenamiento con 39 runs, incluidos callejones sin salida. Para inferencia deben usarse `jbduran/bart` o `jbduran/bart-sft`.
- Solo se declara soporte de ingles; no hay evidencia de capacidades multilingues.
- El sesgo tematico hacia material anterior a 1930 puede introducir estilos, vocabulario y perspectivas desactualizadas, con riesgo de reflejar sesgos historicos del corpus.
- Riesgo de alucinacion no cuantificado: no se publican evaluaciones de fidelidad factual en la informacion disponible.
- Las configuraciones conservan nombres de repositorio y dataset previos a los renombrados (`jbduran/think.nano`, `think-dataset-clean-1930s`, `think-midtrain`), y las rutas de mezcla de midtraining (`mixed/v2/ratio_21/data`) se movieron a `mixtures/v2-by-tokens/ratio_21/data`; la reproduccion directa puede requerir ajustes manuales.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento de los checkpoints intermedios.
- El tamano de 1236,2 GB y la ausencia de cuantizaciones publicadas dificultan el despliegue en entornos con recursos limitados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jbduran/bartholomew-experiments
- Modelo base publicado: https://huggingface.co/jbduran/bart
- Modelo con SFT publicado: https://huggingface.co/jbduran/bart-sft
- Dataset v1: https://huggingface.co/datasets/jbduran/bart-dataset-v1
- Dataset v2: https://huggingface.co/datasets/jbduran/bart-dataset-v2
- Dataset v3: https://huggingface.co/datasets/jbduran/bart-dataset-v3
- Dataset de midtraining: https://huggingface.co/datasets/zachnorton03/bart-midtrain
- Scripts del dataset: https://github.com/OwenVoorhees/bart-dataset-scripts
- Scripts de midtraining: https://github.com/OwenVoorhees/bart-midtrain-scripts
- Articulo tecnico: https://www.unboundedlab.com/blog/bart
- Sitio de Unbounded Labs: https://unboundedlab.com
