# da24b046/leak-curber-submission-7

## Resumen

`da24b046/leak-curber-submission-7` es un modelo de predicción de números EC (Enzyme Commission) a partir de reacciones químicas, presentado como submission al reto "leak-curber" y etiquetado por su autor con las etiquetas `leak-curber` y `enzyme`. No se trata de un modelo de lenguaje: es un clasificador químico especializado que recibe una reacción (codificada con descriptores moleculares) y devuelve una anotación EC completa y jerárquica (niveles L1 a L4). Lo desarrolla el usuario `da24b046` y su relevancia es acotada: es una pieza de un benchmark de anotación enzimática, no un modelo de propósito general.

El sistema combina descriptores de reacción DRFP de 2.048 bits con características de tipo Morgan de radio 2 (log-counts) y una torre de reacción 6.144→1.024→256 que produce un embedding firmado. Sobre esa representación se aprende un vocabulario de prefijos EC (L1 a L4) y se decodifica de forma jerárquica para reordenar la distribución del clasificador. La inferencia es puramente NumPy en CPU con RDKit para las características, sin GPU, sin PyTorch y sin red.

El repositorio tiene 0,0 GB, 0 descargas y 0 likes, y no declara licencia, idiomas ni pipeline. La model card reporta métricas de desarrollo y test local sobre datos públicos reutilizados (L4 de 0,6497 en test local frente a 0,6405 de la línea base), que el propio autor califica explícitamente como diagnósticos internos y no como resultados oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Torre de reacción tipo MLP (6.144→1.024→256) con embedding final firmado y decodificación jerárquica sobre prefijos EC; no es un transformer |
| Parametros totales | no disponible (la model card no publica recuento de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de reacción química, no texto) |
| Tipos de cuantizacion | no disponible (inferencia NumPy en CPU; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card solo menciona que el código DRFP incluido es MIT) |
| Formato de pesos | no disponible (artefactos NumPy empaquetados; la model card no detalla el formato exacto) |

## Arquitectura y entrenamiento

El modelo es un clasificador químico de una sola etapa. La entrada se representa con dos familias de descriptores: DRFP de 2.048 bits (reacción diferencial) y características Morgan de radio 2 en log-counts, orientadas a capturar cambios absolutos y fragmentos conservados entre reactivos y productos. Estas características alimentan una torre de reacción de 6.144→1.024→256 cuya salida es un embedding firmado. Sobre ese embedding se puntúan vectores EC normalizados construidos a partir de embeddings de prefijos L1–L4 aprendidos, y una decodificación jerárquica reordena la distribución del clasificador. No se usa ensamblado.

El entrenamiento se realizó únicamente con datos públicos del dataset `starkAhmed43/leak-curber-enzyme-retrieval`, con semilla 3410 y una partición agrupada por reacción cruda exacta 80/10/10. El autor indica que las ideas de arquitectura siguen la referencia pública `poketwouser/leak-curber-enzyme-retrieval-dual`, sin copiar pesos. Los pesos finales se reajustaron sobre todas las reacciones públicas de entrenamiento en la época seleccionada en desarrollo; el autor no reclama precisión de retención para esos pesos reajustados. No se documentan RLHF, DPO ni fases de ajuste adicionales.

## Capacidades

- Predicción de números EC completos (L1 a L4) a partir de una reacción química representada con descriptores.
- Coincidencia EC jerárquica: decodificación que reordena candidatos usando prefijos L1–L4, no solo la clase final.
- Manejo de reacciones agrupadas por identidad exacta: la model card indica que las características internas preservan la agrupación de la entrada cruda y los identificadores.
- Inferencia offline en CPU con NumPy y RDKit, sin GPU, sin PyTorch y sin acceso a red.
- Salida de exactamente un EC permitido completo por reacción única exacta.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Anotación enzimática a gran escala en pipelines de bioinformática: dado un conjunto de reacciones en Parquet, el script `predict.py` genera un JSONL con un EC por reacción única, adecuado para enriquecer bases de datos de metabolismo o vías.
- Participación y reproducción de benchmarks de anotación EC: el modelo está empaquetado para ejecutarse contra `val_inputs.parquet` y compararse con una línea base, lo que permite reproducir la comparación reportada por el autor.
- Filtrado previo en curación manual: usar la predicción EC como primera pasada para priorizar qué reacciones revisar manualmente, reduciendo el volumen de anotación humana.
- Entornos con restricciones de infraestructura: al ejecutarse solo con NumPy y RDKit en CPU y sin red, encaja en contenedores Docker offline o en servidores sin GPU.
- Integración en herramientas de química computacional: el uso de DRFP y Morgan lo hace compatible con flujos que ya manejan RDKit para representar reacciones.
- Evaluación de estrategias de representación de reacciones: la combinación DRFP + Morgan log-counts y la decodificación jerárquica sirven como referencia metodológica para experimentos propios de clasificación EC.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Test local L4 (modelo) | 0,64972494 |
| Test local L4 (linea base) | 0,64045175 |
| Diferencia candidato - linea base | +0,00927318 |
| Desarrollo local L4 | 0,64454923 |
| Mejora en desarrollo | si (True) |

Estos valores son diagnósticos internos sobre datos públicos reutilizados, según el propio autor, y no constituyen puntuaciones oficiales ni una evaluación externa independiente. No se publican MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general porque el modelo no es de lenguaje. La precisión oficial del reto es desconocida según la model card.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU con NumPy.
- GPU: no se requiere ninguna GPU (ni A100, ni H100, ni RTX 4090); el autor indica explícitamente ausencia de GPU en inferencia.
- CPU: cualquier CPU capaz de ejecutar NumPy y RDKit; el coste dominante es el cálculo de descriptores RDKit.
- Memoria RAM: no disponible en la información proporcionada.
- Despliegue: script `python /app/predict.py --input /input/val_inputs.parquet --output /output/predictions.jsonl`, con empaquetado limpio y Docker offline mantenidos fuera del repositorio según el autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `da24b046/leak-curber-submission-7` | Clasificador EC (DRFP + Morgan + torre MLP) | no disponible | no aplica | L4 test local 0,6497 | no disponible | Hugging Face, 0 descargas |
| `poketwouser/leak-curber-enzyme-retrieval-dual` | Referencia de arquitectura citada por el autor | no disponible | no aplica | no disponible | no disponible | Hugging Face (citado) |
| Linea base del reto leak-curber | Clasificador de referencia del benchmark | no disponible | no aplica | L4 test local 0,6405 | no disponible | Definida en el benchmark |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no documentados; el entrenamiento usa un único dataset público, lo que puede sesgar la cobertura hacia las familias de reacciones sobrerrepresentadas en él.
- Alucinación: en este contexto equivale a asignar un EC incorrecto con alta confianza; el autor no reporta calibración ni umbrales de confianza.
- Contexto e idioma: no aplica como modelo de lenguaje; la cobertura depende de la representación química y del vocabulario EC aprendido.
- Licencia: no declarada en la información disponible; antes de uso comercial debe verificarse con el autor, ya que solo el código DRFP incluido se identifica como MIT.
- Precisión no verificada: las métricas son diagnósticos internos sobre datos públicos reutilizados, no una evaluación externa; la precisión oficial es desconocida.
- Pesos reajustados sobre todos los datos de entrenamiento: el autor no reclama precisión de retención para esos pesos finales.
- Artefactos acoplados: el encoder, la normalización de conteos, el vocabulario de etiquetas y el índice de embeddings opcional deben usarse juntos; mezclarlos con otras versiones puede invalidar las predicciones.
- Madurez: repositorio de 0,0 GB, 0 descargas y 0 likes, creado y actualizado en noviembre de 2026; sin evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/da24b046/leak-curber-submission-7
- Dataset público citado: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-retrieval
- Referencia de arquitectura citada: https://huggingface.co/poketwouser/leak-curber-enzyme-retrieval-dual
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
