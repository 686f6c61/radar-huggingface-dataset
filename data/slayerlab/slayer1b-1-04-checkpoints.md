# SlayerLab/Slayer1B-1.04-checkpoints

## Resumen

Slayer1B-1.04-checkpoints es un repositorio de checkpoints de entrenamiento (no un modelo listo para inferencia) publicado por SlayerLab. Contiene los estados intermedios del entrenamiento que produce la version 1.04 de su modelo Slayer1B, obtenida por preentrenamiento continuado de Slayer1B 1.03 desde su checkpoint final (`ckpt_7150.pt`) sobre el resto del corpus preparado. Cada fichero incluye tanto los pesos del modelo como el estado completo del optimizador (Muon + AdamW), lo que permite reanudar el entrenamiento de forma exacta.

El tramo cubierto va del paso nativo 7151 al 10010, con 1 048 576 tokens por paso (4 rangos × micro-lote 2 × acumulacion de gradiente 32 × 4096 tokens), lo que equivale a aproximadamente 3 000 millones de tokens adicionales. El entrenamiento se ejecuto en 4 × NVIDIA L40S de 48 GB con DDP, con tasa de aprendizaje constante de 6e-4 y sin decaimiento, y se interrumpio por presupuesto en el paso 8300, reanudandose desde `ckpt_8300.pt`.

Es relevante ahora porque documenta de forma inusualmente transparente el proceso de entrenamiento de un modelo pequeno de idioma polaco: publica checkpoints cada 50 pasos, verificacion SHA-256 de cada subida, curva de entrenamiento publica y un filtro de fuga (leak-scan) que excluye 5133 documentos con solapamiento de n-gramas con items de test de BoolQ, MMLU y ARC. La denominacion "1B" sugiere un modelo de aproximadamente 1000 millones de parametros, aunque el repositorio no declara el numero exacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; el codigo de referencia se denomina `train_gpt_ref_r23.py` (definicion tipo GPT/transformer). Sin confirmacion de MoE, SSM ni atencion lineal |
| Parametros totales | No disponible; la denominacion del modelo (Slayer1B) sugiere ~1 000 millones, sin cifra oficial |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible; la secuencia de entrenamiento declarada es de 4096 tokens por micro-lote |
| Tipos de cuantizacion | No disponible; solo se publican checkpoints PyTorch de entrenamiento, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Polaco (tag `polish` en el repositorio); no se declara cobertura multilingue |
| Licencia | Apache-2.0 para los checkpoints; los datos de entrenamiento incluyen fuentes CC BY-SA (`shared/core_sa`, `shared/legal_sa` de slayer-pl-8x3b) |
| Formato de pesos | `.pt` generado con `torch.save`: diccionario con `model`, `opt` (Muon + AdamW), `step` y `config`. Carga con `torch.load(path, map_location="cpu", weights_only=True)` |

Otros datos del repositorio: 434,2 GB de tamano total, 0 descargas, 1 like, creado el 2026-10-27, actualizado el mismo dia, libreria PyTorch, sin pipeline declarado.

## Arquitectura y entrenamiento

La definicion del modelo es la misma que la de las versiones 1.00-1.03 (`train_gpt_ref_r23.py`), sin cambios; el trainer empleado en esta ejecucion es `train_gpt_ref_r24_1.py` (sha256 `881cb055…`). El repositorio no publica el numero de capas, dimension oculta, cabezas de atencion ni el tipo exacto de bloque; solo se indica que la clase del modelo esta en los repositorios 1.00-1.03. El optimizador combina Muon y AdamW, y el estado de ambos se guarda en cada checkpoint.

Entrenamiento: preentrenamiento continuado desde el paso 7150 de la version 1.03 (lr constante 6e-4) hasta el paso 10010, con 1 048 576 tokens por paso. Los datos provienen del dataset `SlayerLab/slayer-pl-8x3b`, revision `d50df04a`: cola del pack-03 (pasos nativos 7151-7192), pack-04 desde el paso 7193 (primera actualizacion filtrada, indice cero 7192) y pack-05 desde el paso nativo 8991. A partir de pack-04 se excluyen los 5133 documentos con solapamiento de n-gramas con items de test de BoolQ, MMLU y ARC (lista con sha256 `84caed78…`); los pasos hasta 7192 usaron datos sin filtrar. El decaimiento de la tasa de aprendizaje se aplica una sola vez, al final de toda la linea Slayer1B, no en este tramo. No se documenta en esta ficha el uso de RLHF, DPO ni ajuste por instrucciones; se trata de un modelo base en preentrenamiento.

## Capacidades

- Generacion de texto y modelado de lenguaje en polaco, heredadas del preentrenamiento continuado sobre corpus polaco.
- Razonamiento y conocimiento factual evaluables mediante ARC-Easy, BoolQ y MMLU, segun el protocolo declarado por el autor.
- Evaluacion de fluidez morfosintactica mediante BLiMP y de perplejidad a nivel de byte sobre WikiText-2.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el unico idioma declarado es el polaco.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Capacidad de reanudacion exacta del entrenamiento: los checkpoints incluyen pesos, estado del optimizador, paso y configuracion, lo que permite continuar el entrenamiento bit a bit desde cualquier punto guardado.

## Casos de uso

- Reanudacion o bifurcacion de experimentos de entrenamiento: cargar cualquiera de los checkpoints (pasos 7151-10010, cada 50 pasos) con `torch.load(..., weights_only=True)` y continuar el entrenamiento con el mismo estado de Muon y AdamW, sin necesidad de recalcular el optimizador desde cero.
- Investigacion de dinamica de entrenamiento: al disponer de checkpoints cada 50 pasos y una curva publica, se puede estudiar la evolucion de la perdida, la estabilidad con lr constante 6e-4 y el efecto de la reanudacion tras la pausa del paso 8300 (el autor reporta perdida identica a cuatro decimales en los primeros pasos tras reanudar).
- Auditoria de contaminacion de benchmarks: el filtro de 5133 documentos con solapamiento de n-gramas frente a BoolQ/MMLU/ARC permite reproducir el analisis de fuga comparando checkpoints anteriores y posteriores al paso 7193.
- Analisis de olvido catastrofico y mezcla de datos: comparar los checkpoints entrenados con la cola de pack-03, pack-04 y pack-05 (frontera en el paso 8991) para medir el impacto de cada cambio de distribucion de datos.
- Base para un modelo polaco afinado: partir del estado del paso 10010 y aplicar SFT/DPO para tareas concretas (clasificacion, extraccion, resumen) en polaco, con la ventaja de una licencia Apache-2.0 en los pesos.
- Reproduccion de infraestructura: replicar la configuracion 4 × L40S 48 GB con DDP y micro-lote 2 con acumulacion 32 para validar recetas de entrenamiento de modelos de ~1B en hardware de gama media profesional.
- Evaluacion comparativa de la linea Slayer1B: usar los checkpoints como referencia para medir perplejidad byte-level en WikiText-2 y BLiMP en cada hito de 50 pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El autor indica que el protocolo de evaluacion (ARC-Easy, BLiMP y perplejidad a nivel de byte en WikiText-2) se calcula automaticamente para cada checkpoint y se publica en la pagina de curva de entrenamiento enlazada, pero los valores no se incluyen en la model card. Los numeros de BoolQ, MMLU y ARC de versiones anteriores arrastran la advertencia de fuga de datos descrita en la card de la version 1.03, por lo que no son directamente comparables.

## Requisitos de hardware

- Entrenamiento de referencia: 4 × NVIDIA L40S de 48 GB con DDP, micro-lote 2, acumulacion de gradiente 32 y 4096 tokens por secuencia. No se documentan requisitos menores.
- VRAM de inferencia: no disponible de forma oficial. Como estimacion a partir de la denominacion "1B", los pesos ocuparian del orden de 2 GB en bf16 y 4 GB en fp32, a lo que habria que sumar la cache KV; el estado del optimizador incluido en los ficheros anade varios GB y no es necesario para inferencia.
- GPU recomendadas: no disponibles. Para entrenamiento, L40S 48 GB es la configuracion probada; para inferencia de un modelo de ~1B, cualquier GPU consumer con 8-12 GB o mas seria suficiente segun la estimacion anterior, pero no hay validacion publicada.
- Cabe en GPU consumer: probablemente si, en el rango de 8-12 GB, aunque no confirmado por el autor.
- Opciones de despliegue: no se declara soporte para vLLM, llama.cpp, Ollama ni TGI. El unico camino documentado es cargar el diccionario `torch.save` con la clase del modelo de `train_gpt_ref_r23.py`, lo que exige exportar los pesos a safetensors u otro formato antes de usar servidores de inferencia estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables de los modelos alternativos en la informacion proporcionada, por lo que los campos cuantitativos se marcan como no disponibles.

| Modelo | Desarrollador | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Slayer1B 1.04 (checkpoints) | SlayerLab | No disponible (~1B por denominacion) | No disponible (entrenamiento a 4096 tokens) | Apache-2.0 (datos con fuentes CC BY-SA) | Repositorio de checkpoints de entrenamiento, no modelo listo para uso |
| Bielik (familia) | SpeakLeash | No disponible en la informacion proporcionada | No disponible | No disponible | Alternativa polaca de referencia en el ecosistema abierto |
| PLLuM (familia) | Consorcio PLLuM | No disponible en la informacion proporcionada | No disponible | No disponible | Modelo polaco de iniciativa publica |
| Trurl (familia) | NASK | No disponible en la informacion proporcionada | No disponible | No disponible | Modelo polaco orientado a uso general |

La comparacion relevante para Slayer1B 1.04 no es solo de rendimiento: este repositorio es un archivo de entrenamiento (434,2 GB con estado del optimizador), mientras que las alternativas citadas se distribuyen como pesos finales listos para inferencia. Para una comparacion justa habria que usar el estado del paso 10010 exportado como modelo.

## Limitaciones y advertencias

- No es un modelo listo para produccion: los ficheros contienen el diccionario del trainer con estado del optimizador; requieren cargar la clase del modelo desde `train_gpt_ref_r23.py` y exportar los pesos.
- No se declara tokenizer, plantilla de chat ni formato de prompt; no hay evidencia de ajuste por instrucciones.
- Cobertura linguistica limitada al polaco segun los tags; no hay datos sobre rendimiento en castellano ni en otros idiomas.
- Longitud de contexto no confirmada: 4096 tokens es la longitud de secuencia de entrenamiento, no necesariamente el maximo soportado en inferencia.
- Riesgo de alucinacion: no cuantificado; al ser un modelo base de ~1B, es esperable una fiabilidad factual limitada, pero no hay evaluaciones publicadas en la informacion disponible.
- Sesgos: no documentados. El corpus `slayer-pl-8x3b` incluye fuentes legales (`shared/legal_sa`) y de contenido CC BY-SA, cuya composicion y sesgos no se detallan.
- Riesgo de licencia: los checkpoints son Apache-2.0, pero los datos de entrenamiento incluyen fuentes CC BY-SA (share-alike), lo que puede imponer obligaciones adicionales en determinados usos comerciales. Revisar la card del dataset antes de un despliegue comercial.
- Contaminacion de benchmarks en la primera parte del tramo: hasta el paso 7192 se usaron datos sin filtrar; las comparaciones que crucen esa frontera no son homogeneas.
- Entrenamiento incompleto: la tasa de aprendizaje no ha decaido (el decaimiento se aplica al final de la linea), por lo que estos checkpoints no representan el estado final convergido del modelo.
- Repositorio de 434,2 GB: requiere almacenamiento considerable; conviene descargar solo los checkpoints necesarios.
- Resultados de busqueda web no aprovechables: las busquedas realizadas devolvieron exclusivamente contenido no relacionado con el modelo, por lo que no se han podido verificar datos externos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SlayerLab/Slayer1B-1.04-checkpoints
- Modelo precedente Slayer1B 1.03: https://huggingface.co/SlayerLab/Slayer1B-1.03
- Checkpoints de Slayer1B 1.03: https://huggingface.co/SlayerLab/Slayer1B-1.03-checkpoints
- Dataset de entrenamiento slayer-pl-8x3b: https://huggingface.co/datasets/SlayerLab/slayer-pl-8x3b
- Curva de entrenamiento y evaluaciones: https://track.fabryka.ai/run/f056bb5c-f1da-56d5-9776-cc33063f10a5
