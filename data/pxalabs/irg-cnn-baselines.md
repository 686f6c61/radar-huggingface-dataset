# PxALabs/irg-cnn-baselines

## Resumen

`PxALabs/irg-cnn-baselines` es una colección de treinta clasificadores CNN pequeños entrenados desde cero para predecir si una ventana de 1.000 pares de bases de ADN corresponde a un elemento regulador cis candidato (cCRE: PLS, pELS o dELS) de un biosample concreto de ENCODE, frente a un fondo genómico emparejado por contenido GC. Lo publica PxALabs como parte del proyecto `interpretable-regulatory-genomics` y no interviene ningún modelo preentrenado ni modelo de lenguaje: son redes convolucionales de 7.937 y 189.185 parámetros.

La relevancia es metodológica más que de rendimiento: el paquete ofrece un conjunto de líneas base reproducibles (3 biosamples × 2 arquitecturas × 5 semillas) con partición por cromosomas, aumentación reverse-complement, evaluación emparejada por GC y CpG, y procedencia verificada con SHA-256 y comprobación de tensores idénticos tras la conversión a safetensors. Sirve como referencia para comparar métodos de interpretabilidad sobre secuencia de ADN y para calibrar expectativas frente a baselines simples como XGBoost sobre frecuencias de 6-mer.

Los resultados son modestos: la AUROC en test oscila entre 0,847 y 0,891 según biosample y arquitectura, con una mejora máxima de 0,014 AUROC sobre el XGBoost de 6-mer sin ajustar. El propio autor advierte que las ganancias son pequeñas, que cinco de las seis tasas de aprendizaje seleccionadas están en el extremo superior de la rejilla y que los filtros no deben interpretarse como sitios de unión de factores de transcripción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1D (ShallowCNN y AttnCNN con self-attention) |
| Parametros totales | 7.937 (ShallowCNN) / 189.185 (AttnCNN) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.000 bp por secuencia (longitud fija de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; entrada de secuencia de ADN) |
| Licencia | other |
| Formato de pesos | safetensors (state dicts por biosample, arquitectura y semilla) |

## Arquitectura y entrenamiento

ShallowCNN: `Conv1d(4→128, k=15) → ReLU → global max pooling → dropout 0.3 → capa lineal`. AttnCNN: `Conv1d(4→128, k=15) → ReLU → MaxPool(4) → Conv1d(128, k=7) → ReLU → self-attention de 4 cabezas con residual y LayerNorm → pooling mean+max → dropout 0.3 → capa lineal`. La entrada son secuencias codificadas en cuatro canales (A, C, G, T) de 1.000 bp.

Entrenamiento sobre las tablas `*_gc_matched` de `PxALabs/encode-regulatory-elements` v2.1, con partición por cromosomas: train chr1-14, X, Y; validación chr15-18; test chr19-22. Optimizador AdamW (weight decay 0,01), batch 256, precisión mixta, aumentación reverse-complement, hasta 60 épocas con early stopping sobre AUROC de validación (paciencia 8) y `ReduceLROnPlateau` (factor 0,5, paciencia 2). La tasa de aprendizaje se eligió de {3e-4, 1e-3, 3e-3} sobre validación con la semilla 0 únicamente; los cromosomas de test nunca se usaron para selección. Entrenado en una GPU T4 mediante el kernel de Kaggle `purvanshj009/irg-07-cnn-tuned` v2 (git `bc9f2fa`, torch 2.11). La función `predict` promedia las probabilidades de la hebra directa y la reverse-complement.

## Capacidades

- Clasificación binaria de ventanas de 1.000 bp como cCRE del biosample correspondiente (T cell, K562 o GM12878) frente a fondo genómico emparejado por GC.
- Discriminación entre subtipos cCRE en los datos de entrenamiento (PLS, pELS, dELS), aunque la salida publicada es una probabilidad binaria por biosample.
- Evaluación robusta por semilla: cinco semillas por combinación biosample/arquitectura para reportar dispersión en lugar de seleccionar la mejor semilla.
- Agregación de hebras: la predicción promedia forward y reverse-complement, lo que aporta invariancia a la orientación de la secuencia.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplicable.
- Capacidades especiales: pesos verificados bit a bit tras la conversión a safetensors; manifiesto con SHA-256, learning rate, épocas, número de parámetros y AUROC de validación y test por fichero.

## Casos de uso

- Línea base en investigación de elementos reguladores: clasificar ventanas genómicas de un biosample concreto y comparar la AUROC obtenida con la de métodos propios sobre la misma partición cromosómica, usando las cinco semillas para reportar media y desviación típica.
- Evaluación de métodos de interpretabilidad: al ser redes pequeñas y entrenadas desde cero, permiten probar técnicas de atribución (gradientes, integrated gradients, análisis de filtros) y contrastar si las señales detectadas sobreviven al control de GC y CpG en la evaluación emparejada.
- Referencia frente a baselines clásicos: cuantificar cuánto aporta una CNN frente a un XGBoost sobre frecuencias de 6-mer (0,881 / 0,863 / 0,834 en test completo para T cell / K562 / GM12878), útil para justificar o descartar arquitecturas más complejas.
- Filtro previo en pipelines de genómica: puntuar ventanas candidatas de 1.000 bp antes de un análisis más costoso, siempre dentro del biosample de entrenamiento y sin uso clínico.
- Docencia y reproducción: el paquete incluye `model_def.py` autónomo, manifiesto con hashes y procedencia del kernel, lo que facilita reproducir el entrenamiento y auditar la integridad de los pesos en cursos o revisiones internas.
- Estudio de atajos de composición: comparar AUROC en test completo frente a la evaluación emparejada por GC y CpG (por ejemplo, 0,886 frente a 0,737 en T cell con ShallowCNN) para medir cuánto del rendimiento se explica por sesgo composicional.
- Control negativo en publicaciones: usar estos modelos como referencia débil y explícita cuando se proponga un nuevo método de clasificación de cCRE, dado que el autor documenta las limitaciones y la ausencia de ajuste fino del baseline XGBoost.

## Benchmarks y rendimiento

Resultados en cromosomas de test, media ± desviación típica sobre 5 semillas. "Matched" es el subconjunto emparejado por GC y CpG observado/esperado con igual número de positivos y negativos por bin; no es comparable con la AUROC de la tarea completa.

| Biosample | Modelo | LR | AUROC test | AUROC matched |
|:--|:--|--:|--:|--:|
| tcell | ShallowCNN | 1e-3 | 0,886 ± 0,002 | 0,737 ± 0,004 |
| tcell | AttnCNN | 3e-3 | 0,891 ± 0,012 | 0,749 ± 0,026 |
| k562 | ShallowCNN | 3e-3 | 0,868 ± 0,002 | 0,768 ± 0,004 |
| k562 | AttnCNN | 3e-3 | 0,858 ± 0,007 | 0,749 ± 0,015 |
| gm12878 | ShallowCNN | 3e-3 | 0,847 ± 0,001 | 0,764 ± 0,002 |
| gm12878 | AttnCNN | 3e-3 | 0,848 ± 0,005 | 0,766 ± 0,009 |

Referencia externa citada en la model card: XGBoost sin ajustar sobre frecuencias de 6-mer, 0,881 / 0,863 / 0,834 (T cell / K562 / GM12878) en test completo, una sola semilla.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en ambos casos; los modelos tienen 7.937 y 189.185 parámetros con entrada de 1.000 × 4. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se requiere GPU. Cualquier GPU con soporte PyTorch (T4, RTX 3060 en adelante, A100, H100) acelera el procesamiento por lotes; el entrenamiento original se hizo en una T4.
- Cabe en consumer GPU: sí, en cualquier GPU consumer e incluso en CPU para lotes moderados.
- Opciones de despliegue: PyTorch nativo cargando safetensors con `safetensors.torch.load_file` y `model_def.py`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. No se publican medidas de latencia ni de secuencias por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | AUROC test (rango publicado) | Licencia | Disponibilidad |
|:--|--:|:--|:--|:--|:--|
| IRG ShallowCNN (este paquete) | 7.937 | 1.000 bp | 0,847–0,886 | other | safetensors en HF |
| IRG AttnCNN (este paquete) | 189.185 | 1.000 bp | 0,848–0,891 | other | safetensors en HF |
| XGBoost sobre 6-mer (baseline del autor) | no disponible | frecuencias de 6-mer | 0,834–0,881 | no disponible | no publicada en este repo |
| Otros modelos genómicos preentrenados (p. ej. DNABERT, Nucleotide Transformer) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye comparaciones con modelos genómicos preentrenados; la única referencia cuantitativa es el XGBoost de 6-mer descrito en la model card.

## Limitaciones y advertencias

- Solo para investigación en clasificación de cCRE basada en secuencia y para probar métodos de interpretabilidad; no apto para uso clínico ni para predicción de efectos de variantes.
- Cada modelo es específico del biosample con el que se entrenó; el uso cruzado entre biosamples no está probado para estas redes.
- Los negativos son ventanas genómicas emparejadas por GC fuera de los cCRE del biosample, no elementos no reguladores validados experimentalmente.
- Las ganancias sobre el XGBoost de 6-mer son pequeñas (como máximo 0,014 AUROC en test completo) y ese baseline no estaba ajustado; AttnCNN solo supera claramente al XGBoost en GM12878 y es inestable en T cell (desviación de 0,012 entre semillas).
- Cinco de las seis tasas de aprendizaje seleccionadas están en el extremo superior de la rejilla (3e-3), por lo que el óptimo podría ser mayor y los resultados no reflejan un barrido completo.
- Los atajos de composición (GC, CpG) solo se controlan en la evaluación emparejada; el contenido repetitivo (Alu, L1) no se controla.
- No se ha comprobado la correspondencia entre filtros y motivos; no deben leerse los filtros como sitios de unión de factores de transcripción.
- Nota de datos: las tablas antiguas del proyecto llamadas `k562_*` contenían en realidad elementos de células T; estos pesos usan las tablas v2.1 corregidas.
- Licencia "other": no se detallan en la información disponible los términos concretos para uso comercial; debe consultarse el repositorio del proyecto antes de cualquier uso en producción.
- Solo cuatro de los treinta modelos fueron re-puntuados sobre las filas reales de test (semilla 0 de ShallowCNN para los tres biosamples y semilla 0 de AttnCNN para K562); los otros 26 solo se verificaron por igualdad de tensores y predicciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PxALabs/irg-cnn-baselines
- Repositorio del proyecto: https://github.com/PxA-Labs/interpretable-regulatory-genomics
- Dataset de entrenamiento: https://huggingface.co/datasets/PxALabs/encode-regulatory-elements
- Análisis y caveats completos: `docs/results/cnn_tuned.md` en el repositorio de GitHub
- Kernel de entrenamiento: https://www.kaggle.com/code/purvanshj009/irg-07-cnn-tuned (v2, git `bc9f2fa`)
