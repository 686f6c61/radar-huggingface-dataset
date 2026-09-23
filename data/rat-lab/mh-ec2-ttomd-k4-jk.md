# rat-lab/mh-ec2-ttomd-K4-jk

## Resumen

mh-ec2-ttomd-K4-jk es un conjunto de adaptadores LoRA (16 checkpoints, cada 250 pasos, de 250 a 4000) publicado por rat-lab sobre el modelo base `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT`, una variante de Gemma 2 2B IT afinada con Alpaca Cleaned. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (`adapter_model.safetensors`), la configuración de PEFT y los ficheros del tokenizer de 1,6 GB de tamano total.

El adaptador procede de un experimento de aprendizaje por preferencias sensible al riesgo: algoritmo online IPO (`--alg oipo1`, implementado en `risk_egpo/tt_omd.py`), riesgo entrópico con tau = 10, cobertura K = 4 y corrección de sesgo a dos escalas temporales mediante un estimador jackknife leave-one-out. Se entrenó sobre el dataset PKU-Alignment/PKU-SafeRLHF, con warm start desde `ipo-e-c10.0/checkpoint-936` y 100 pasos de calentamiento, semilla 42 y generación limitada a 64 tokens nuevos.

Su relevancia es estrictamente investigadora: corresponde a una celda concreta (K = 4, jackknife) de una tabla de cobertura x debiasing dentro de una serie de experimentos de optimización de preferencias bajo riesgo entrópico. El propio autor advierte que el run no fue entrenado por él, sino copiado sin cambios del repositorio `rat-lab/rlj-ec2-fig9-K4-jk`, y verificado como idéntico byte a byte (sha256 sobre los checkpoints 250, 2250 y 4000).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only del modelo base (Gemma 2 2B IT); el repositorio contiene adaptadores LoRA, no pesos completos |
| Parámetros totales | Aproximadamente 2,6 mil millones en el modelo base Gemma 2 2B; el tamano del adaptador no se especifica (repo de 1,6 GB con 16 checkpoints y ficheros de tokenizer) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No indicada en la ficha del adaptador; el modelo base Gemma 2 2B soporta 8.192 tokens |
| Tipos de cuantización | No disponible. Los adaptadores se distribuyen en safetensors sin cuantizar; es posible fusionarlos con el modelo base y cuantizar el resultado (GGUF, AWQ, etc.) |
| Idiomas soportados | No disponible en la ficha del adaptador; el modelo base Gemma 2 2B es multilingüe |
| Licencia | No disponible. El modelo base se distribuye bajo los términos de uso de Gemma, pero la ficha del adaptador no declara licencia |
| Formato de pesos | safetensors (adaptadores LoRA) más `adapter_config.json` y ficheros de tokenizer |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Gemma 2 en su variante de 2B parámetros, ya ajustado con instrucciones por el autor del modelo base (`gemma-2-2b-it-alpaca-cleaned-SFT`). Sobre él se aplica un adaptador LoRA, de modo que la arquitectura efectiva en inferencia es la del modelo base con las matrices de bajo rango integradas o aplicadas en paralelo mediante PEFT.

El entrenamiento usa aprendizaje por preferencias online con el algoritmo IPO (`--alg oipo1`) implementado en `risk_egpo/tt_omd.py`. Los hiperparámetros documentados son: riesgo entrópico con tau = 10 (`--risk entropic --risk_c 10.0`), cobertura K = 4 (`--ypp_samples 4`), corrección de sesgo a dos escalas temporales con estimador jackknife leave-one-out, tamano de paso de dos escalas gamma = 0,1, warm start desde `ipo-e-c10.0/checkpoint-936` con 100 pasos de calentamiento, generación de 64 tokens nuevos como máximo y semilla 42. El dataset es PKU-Alignment/PKU-SafeRLHF. La innovación técnica del run es precisamente el esquema de debiasing (jackknife leave-one-out combinado con corrección a dos escalas) aplicado a una estimación de riesgo entrópico, no una innovación de arquitectura. El run se detiene en el paso 4000, por lo que solo hay 16 checkpoints frente a los 19 de otras celdas de la misma serie.

## Capacidades

- Generación de texto conversacional en la línea del modelo base Gemma 2 2B IT; el adaptador modula el comportamiento hacia preferencias más conservadoras respecto al riesgo, no anade capacidades nuevas.
- Optimización frente a preferencias humanas de seguridad, entrenada sobre PKU-SafeRLHF, orientada a reducir respuestas dañinas en el sentido definido por ese dataset.
- Corrección de sesgo en la estimación de preferencias mediante el estimador jackknife leave-one-out con dos escalas temporales (objetivo metodológico del experimento).
- Capacidad multilingüe heredada del modelo base, no documentada ni evaluada en la ficha del adaptador.
- No hay evidencia documentada de soporte de tool calling, function calling, razonamiento multi-paso, modo de pensamiento explícito, visión ni audio en este adaptador.
- Al ser un adaptador PEFT, puede combinarse con el modelo base de formas alternativas (otros adaptadores, fusión, cuantización posterior), aunque no se documentan recetas de composición.

## Casos de uso

- Investigación en aprendizaje por preferencias sensible al riesgo: reproducir la celda K = 4 con jackknife de la tabla cobertura x debiasing y comparar curvas de entrenamiento frente a otras celdas de la misma serie mediante los 16 checkpoints disponibles.
- Estudios de ablación sobre el estimador de sesgo: el run permite aislar el efecto del jackknife leave-one-out y del paso gamma = 0,1 comparándolo con variantes sin corrección o con otros estimadores del mismo repositorio de origen.
- Evaluación de seguridad en modelos pequenos: cargar el adaptador sobre Gemma 2 2B y medir tasas de respuesta dañina en prompts de PKU-SafeRLHF o en conjuntos de evaluación propios, para estudiar si el sesgo hacia la aversión al riesgo (tau = 10) reduce utilidad.
- Docencia y formación en RLHF/IPO: el par de ficheros (adaptador y `adapter_config.json`) y el script `tt_omd.py` permiten ilustrar en clase un pipeline completo de optimización de preferencias online con corrección de sesgo.
- Punto de partida para fine-tuning posterior: al ser un adaptador LoRA sobre un modelo de 2B, sirve como inicialización barata para experimentos de alineamiento adicional en una única GPU de consumo.
- Análisis de degradación por sobre-optimización: comparar los checkpoints 250 frente a 4000 permite estudiar cómo evoluciona la diversidad de respuestas y la tendencia a rechazos excesivos con el número de pasos.
- Prototipado local de asistentes conversacionales ligeros: fusionar el adaptador, cuantizar a 4 bits y desplegar en una GPU de consumo para pruebas de concepto, asumiendo las limitaciones de licencia y de evaluación descritas más abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de seguridad, ni tampoco curvas de recompensa o de tasa de preferencia para los checkpoints publicados.

## Requisitos de hardware

- VRAM estimada para inferencia con el modelo base completo en bf16/fp16: en torno a 6-8 GB contando pesos (aproximadamente 5,2 GB para 2,6 mil millones de parámetros), caché KV y overhead del runtime. El adaptador anade un consumo marginal.
- VRAM estimada con cuantización de 4 bits del modelo fusionado: en torno a 2-3 GB, lo que permite ejecución en GPUs de gama media.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) para inferencia local; A100, H100 o L40S para servir en lote con mayor throughput.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más, especialmente tras cuantización a 4 bits.
- Opciones de despliegue: transformers + peft (procedimiento documentado en la propia model card, cargando el subfolder `checkpoint-4000`), vLLM con soporte de LoRA, TGI y, previa fusión y conversión a GGUF, llama.cpp u Ollama. El repositorio no incluye estado de reanudación de DeepSpeed, solo los adaptadores.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mh-ec2-ttomd-K4-jk (este) | Adaptador LoRA sobre Gemma 2 2B (~2,6 mil millones en el base) | No indicado (8.192 tokens en el base) | No evaluado en la información disponible | No disponible | HuggingFace, 0 descargas, 0 likes |
| vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT | ~2,6 mil millones | 8.192 tokens (Gemma 2 2B) | No disponible en esta ficha | Términos de uso de Gemma (modelo base) | HuggingFace, modelo base público |
| google/gemma-2-2b-it | ~2,6 mil millones | 8.192 tokens | Benchmark público de Gemma 2 2B IT publicado por Google | Términos de uso de Gemma | HuggingFace, ampliamente desplegado |
| Familia de adaptadores de la serie rat-lab (otras celdas K y debiasing) | Adaptadores LoRA sobre el mismo base | No indicado | No disponible | No disponible | HuggingFace, repositorios hermanos del mismo autor |

No se dispone de comparaciones de rendimiento entre este adaptador y alternativas de la misma categoría, porque no se han publicado evaluaciones del mismo.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el modelo base `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT` para poder ejecutarse.
- Ausencia total de benchmarks: no hay evidencia publicada de mejora en seguridad, utilidad o preferencia frente a otros checkpoints o al modelo base.
- Licencia no declarada en la ficha del adaptador; antes de cualquier uso comercial debe aclararse la situación respecto a los términos de uso de Gemma del modelo base.
- Procedencia externa: el autor indica explícitamente que no lo entrenó él, sino que lo copió de `rat-lab/rlj-ec2-fig9-K4-jk`; la trazabilidad depende de esa fuente.
- Cobertura de entrenamiento incompleta: el run se detiene en el paso 4000 y solo ofrece 16 checkpoints, frente a 19 en otras celdas de la misma serie, lo que puede introducir diferencias al comparar resultados entre celdas.
- Sesgo inducido por el objetivo: el riesgo entrópico con tau = 10 favorece políticas conservadoras, con riesgo de rechazos excesivos o respuestas evasivas en dominios legítimos.
- Datos de entrenamiento en inglés (PKU-SafeRLHF): el comportamiento de seguridad aprendido puede no transferirse a otros idiomas, y las capacidades multilingües del base no se han evaluado tras el ajuste.
- Generación limitada a 64 tokens nuevos durante el entrenamiento, lo que puede desajustar el comportamiento en generaciones largas respecto a las condiciones de entrenamiento.
- Riesgo de alucinación y sesgos heredados del modelo base Gemma 2 2B IT y de su ajuste previo con Alpaca Cleaned.
- Alta probabilidad de sobre-optimización si se usa el checkpoint final sin comparar con checkpoints intermedios.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso; no debe asumirse en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rat-lab/mh-ec2-ttomd-K4-jk
- Modelo base: https://huggingface.co/vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT
- Repositorio de origen del que se copió el adaptador: https://huggingface.co/rat-lab/rlj-ec2-fig9-K4-jk
- Dataset de entrenamiento: https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF
- Modelo Gemma 2 2B IT de Google: https://huggingface.co/google/gemma-2-2b-it
- Librería PEFT: https://github.com/huggingface/peft
- Búsqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a páginas sobre el animal «rat» (Wikipedia, SPA, Canal+), sin relación con el repositorio.
