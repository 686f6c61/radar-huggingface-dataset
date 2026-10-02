# ianaldenjones/physics-you-cant-delete

## Resumen

Physics You Can't Delete es un conjunto de pequeños transformers de vídeo entrenados desde cero (entre 6 y 13 millones de parámetros) sobre un mundo sintético 2D en el que unas bolas se desplazan y desaparecen detrás de pantallas. Lo publica el usuario ianaldenjones en Hugging Face junto con el simulador, el tokenizador, el código de modelo y las sondas de interpretabilidad. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un artefacto de investigación sobre modelos del mundo (world models) y física intuitiva.

La idea del experimento es aislar una sola regla física por mundo. En el mundo `normal` la bola sigue moviéndose y sale por el lado opuesto de la pantalla; en `teleport` reaparece detrás de la otra pantalla (la manipulación que usó el laboratorio de Wood con polluelos recién nacidos); en `vanish` desaparece definitivamente. El entrenamiento y la arquitectura son idénticos entre mundos, de modo que la única diferencia es la regla física que los datos enseñan. La relevancia está en el método: controles emparejados por semilla, sondas de atención y medición de la permanencia del objeto sin depender de la pérdida de validación, que resulta ciega a estas diferencias.

Los modelos tienen 6 capas y dimensión 256 salvo la variante `deep_normal` (12 capas), se entrenan durante 30.000 pasos sobre unos 2.000 millones de tokens de clips sintéticos y publican checkpoints en formato PyTorch. El repositorio ocupa 0,3 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo GPT sobre tokens de parches visuales; variantes con atención completa, atención local y MemoryGPT |
| Parametros totales | 6M (6 capas, d=256) hasta aproximadamente 13M (variante `deep_normal`, 12 capas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventanas de 16 fotogramas de 64x64 píxeles; 257 tokens por fotograma, aproximadamente 4.112 tokens por ventana; las variantes locales solo ven los últimos 3 o 5 fotogramas |
| Tipos de cuantizacion | no disponible; solo se publican checkpoints PyTorch sin versiones cuantizadas documentadas |
| Idiomas soportados | no aplica; el modelo no procesa texto, opera sobre tokens de parches visuales |
| Licencia | MIT |
| Formato de pesos | PyTorch (`models/<nombre>/ckpt.pt`), con `config.json` y `train_args.json`; tokenizador en `tok_p4.npz` (NumPy) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder autorregresivo al estilo GPT que predice el siguiente token de parche. Cada fotograma de 64x64 píxeles se tokeniza con un tokenizador de parches de 4x4 (vocabulario de 2.048 tokens, 257 tokens por fotograma). El código incluye tres familias: atención completa (`GPT`), atención local en la que cada token solo ve los últimos 3 o 5 fotogramas (`local_*`, `wide_*`) y una variante `MemoryGPT`. Los modelos con atención completa soportan caché KV; las variantes de atención local no. La configuración base son 6 capas con d=256, ampliada a 12 capas en `deep_normal`.

El entrenamiento es puramente sintético: 30.000 pasos por 16 ventanas por 16 fotogramas, aproximadamente 2.000 millones de tokens, sobre 20.000 clips generados con la semilla 2 del simulador incluido en `src/worldgen/`. No hay datos de texto, no hay anotaciones humanas y no se documenta RLHF ni DPO, ya que no es un modelo de instrucciones. Cada mundo (`normal`, `teleport`, `vanish`) se entrena con la misma receta y varios seeds independientes (2 para `normal`, 3 para `teleport` y `vanish`, 1 para las variantes de atención local). La innovación metodológica no está en la arquitectura sino en el diseño experimental: clips emparejados por semilla que son idénticos salvo por la regla física editada, sondas de interpretabilidad y experimentos de atención knockout para localizar la información.

## Capacidades

- Predicción de vídeo autorregresiva sobre un mundo 2D sintético: genera los fotogramas siguientes a partir de un contexto dado.
- Modelado de física intuitiva: mantiene o no la expectativa de que un objeto oculto siga existiendo, según el mundo con el que se entrenó.
- Permanencia del objeto: el modelo `normal` recupera la posición de la bola mirando hacia atrás en la atención (los aproximadamente 13 tokens donde se vio por última vez), en lugar de mantener una representación interna continua.
- Localización de información mediante sondas: el repositorio incluye sondas para medir señales de "dónde" y "cuándo" reaparecerá el objeto.
- Experimentos de atención knockout: permite eliminar componentes de atención y comprobar que la permanencia se degrada hasta convertirse en una señal de temporización sin localización.
- Variantes de atención local que relegan una señal de temporización a través de los fotogramas ocultos, con mayor intensidad a mayor profundidad o mayor ventana.
- Generación de muestras visuales mediante `generate_example.py`, que descarga los pesos y produce un GIF comparativo entre los modelos `normal`, `teleport` y `vanish`.
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso en lenguaje natural ni capacidades multilingües, de visión general, audio o modo de pensamiento.

## Casos de uso

- Investigación en modelos del mundo: sirve para estudiar cómo una regla física concreta se codifica en los pesos de un transformer pequeño, con controles emparejados que aíslan la variable independiente.
- Estudios de interpretabilidad mecanicista: el repositorio aporta sondas y utilidades de atención knockout para analizar dónde y cómo se representa la permanencia del objeto en cada capa.
- Replicación y contraste con experimentos de biología del desarrollo: el mundo `teleport` reproduce la manipulación usada con polluelos recién nacidos, lo que permite comparar el sesgo inductivo de un modelo entrenado con el de un animal.
- Docencia y divulgación: un mundo 2D con tres reglas físicas distintas es un banco de pruebas asequible para explicar permanencia del objeto, sesgos inductivos y evaluación ciega de la pérdida.
- Desarrollo de metodología de evaluación: el hallazgo de que modelos con y sin permanencia comparten la misma pérdida de validación es un caso práctico para justificar métricas basadas en sondas en lugar de solo pérdida.
- Pruebas de variantes arquitectónicas a pequeña escala: comparar atención completa frente a atención local o MemoryGPT en una tarea con semántica conocida y un coste computacional mínimo.
- Generación de datos sintéticos para preentrenar o validar otros sistemas de vídeo: el simulador de `src/worldgen/` permite producir clips etiquetados con la regla física activa.
- Reproducción de resultados con poco presupuesto: los modelos caben en cualquier GPU de consumo e incluso en CPU para inferencia, lo que facilita la replicación independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes). Los autores reportan métricas internas de sorpresa en log-verosimilitud y tasas de acierto sobre los controles emparejados:

| Metrica | Resultado reportado |
|---|---|
| Modelo `teleport` ante un retorno de física normal, dimensión "donde" | −10,3 ± 1,1 nats (3 semillas) |
| Modelo `teleport`, retorno de física normal sorprendente en pares emparejados | 86–88 % de los pares |
| Modelo `teleport`, dimensión "si" (existencia del objeto) | +32,8 ± 1,2 |
| Modelo `vanish`, desarrollo de permanencia | +0,36 ± 0,03 (3 semillas), es decir, prácticamente nulo |
| Pérdida de validación | idéntica entre modelos con y sin permanencia |

## Requisitos de hardware

- VRAM para inferencia: menos de 1 GB en cualquier precisión habitual; con 6 a 13 millones de parámetros, los pesos ocupan decenas de megabytes.
- GPU recomendadas: no se especifica ninguna; cualquier GPU con soporte CUDA es suficiente (GTX 1050, RTX 3060, RTX 4090, A100, H100), y también es viable la inferencia en CPU para las variantes de atención completa.
- GPU de consumo: sí, cabe en cualquier GPU de consumo e incluso en dispositivos integrados; no hay requisito de memoria alto.
- Opciones de despliegue: código propio con PyTorch (`torch`, `numpy`, `pillow`, `huggingface_hub`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. El entrenamiento completo de cada modelo (30.000 pasos, ~2.000 millones de tokens) es asequible en una GPU de consumo, aunque no se publican tiempos.

## Comparativa con modelos similares

No hay datos de benchmarks comparables publicados para este modelo, y la categoría (transformers de vídeo de 6–13M de parámetros sobre mundos sintéticos 2D) tiene pocos referentes públicos con métricas estandarizadas. La comparación más directa disponible es con el proyecto hermano del mismo autor, y con la referencia general de los modelos del mundo a gran escala, para los que no se dispone de cifras comparables.

| Modelo | Tipo | Parametros | Contexto | Licencia | Datos comparables |
|---|---|---|---|---|---|
| physics-you-cant-delete | Transformer de vídeo, mundo 2D sintético | 6–13M | 16 fotogramas de 64x64 | MIT | métricas internas de sorpresa |
| notes-you-cant-delete | Transformer simbólico de música | no disponible | no disponible | no disponible | no disponible |
| Modelos del mundo a gran escala (tipo generación de vídeo) | Generativos de vídeo | miles de millones | minutos de vídeo | propietaria en general | no disponible |

## Limitaciones y advertencias

- Los propios autores advierten de que son modelos diminutos en un mundo de juguete, entrenados solo con datos sintéticos; nada de lo observado constituye una afirmación sobre modelos de vídeo grandes ni sobre polluelos.
- El número de semillas es reducido: 2 para los modelos `normal` y 3 para `teleport` y `vanish`, y solo 1 para las variantes de atención local, por lo que la significación estadística de esas variantes es limitada.
- La pérdida de validación no distingue entre modelos con permanencia y sin ella, así que cualquier evaluación basada únicamente en pérdida es inservible para este fenómeno.
- El modelo no procesa lenguaje natural: no hay capacidades multilingües, de instrucciones, de tool calling ni de agentes.
- Riesgo de generalización indebida: los resultados dependen del simulador concreto, del tokenizador de parches 4x4 y de la resolución de 64x64; no se ha verificado su transferencia a otros dominios visuales.
- Sesgos conocidos: no se documentan sesgos sociales, ya que los datos son geométricos y sintéticos; el "sesgo" relevante es el inductivo, inducido por la regla física del mundo de entrenamiento.
- Alucinación: no aplica en el sentido habitual, pero el modelo puede generar continuaciones físicamente imposibles respecto del mundo real cuando se le entrena con reglas alteradas (`teleport`, `vanish`).
- Licencia MIT: permite uso comercial y modificación con atribución, pero el valor práctico del artefacto es de investigación, no de producto.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas especificados, lo que indica ausencia de validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ianaldenjones/physics-you-cant-delete
- Proyecto hermano del mismo autor (Notes You Can't Delete): https://huggingface.co/ianaldenjones/notes-you-cant-delete
- Plataforma Hugging Face: https://huggingface.co/
- No se han encontrado en la búsqueda web otros enlaces relevantes (papers, blogs, repositorios o demos) asociados a este modelo; el resto de resultados devueltos correspondían a servicios genéricos sin relación con el artefacto.
