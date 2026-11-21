# mylonasc/open-fret-tab

## Resumen

open-fret-tab es un modelo de traducción de secuencias MIDI a tablatura de guitarra desarrollado por el usuario mylonasc dentro del proyecto open-fret. Resuelve un problema muy concreto del dominio musical: dado un flujo de notas MIDI (con información de altura, tiempo y eventos on/off), predecir la digitación concreta —cuerda y traste— que un guitarrista usaría para tocar esa secuencia. El modelo no genera la música, sino la posición física en el mástil; la altura y el ritmo provienen siempre de la entrada.

Técnicamente es un T5 encoder-decoder minúsculo, entrenado desde cero (sin inicialización preentrenada), con `d_model` 128, `d_ff` 1024, 3 capas de encoder y 3 de decoder, 4 cabezas de atención y un vocabulario WordLevel de 6.631 tokens. Con 3,6 millones de parámetros y unos 14 MB en safetensors, está diseñado para ser extremadamente ligero y desplegable en cualquier entorno, desde una CPU hasta una GPU de consumo.

Su relevancia es acotada pero clara: cubre una tarea de nicho (generación automática de tablaturas a partir de MIDI) con un modelo abierto bajo licencia MIT en el repositorio, aunque con una advertencia explícita sobre los derechos del corpus de entrenamiento. Es una pieza de investigación reproducible más que un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder (transformer) |
| Parámetros totales | 3.603.712 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos safetensors fp16; compatible con cuantización estándar de transformers, no documentada) |
| Idiomas soportados | en |
| Licencia | MIT (repositorio); derechos del corpus de entrenamiento no establecidos |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un T5 encoder-decoder de dimensiones reducidas: `d_model` 128, `d_ff` 1024, 3 capas en encoder y 3 en decoder, 4 cabezas de atención y vocabulario WordLevel de 6.631 tokens. Se entrenó desde cero, sin inicialización preentrenada, sobre un corpus derivado del dataset `vldsavelyev/guitar_tab` (tablaturas GuitarPro parseadas con AlphaTab 1.3.0), en la revisión `e6a6dbb`. El corpus `loss-v4-curated-20261109` contiene 843.886 ventanas de entrenamiento, 105.394 de validación y 104.920 de test, con particiones disjuntas por familia, listas de condicionamiento de vocabulario sin `[UNK]` y enmascaramiento a nivel de grupo de conflictos de referencia (441k ventanas, 23,6M tokens de nota).

El entrenamiento se ejecutó en una RTX 4090 en fp16, semilla 42, con un estudio Optuna de 12 trials que seleccionó lr 5,7e-4, dropout 0,144, batch 128 con acumulación de gradiente 2, warmup de 10k ejemplos y decaimiento ×0,1 tras 100k ejemplos. El run completó 3 épocas (paso 9.891). La innovación principal es la función de pérdida con conciencia de dominio: combina entropía cruzada T5 estándar (peso 0,3), un término de suavizado de equivalencia ε=0,1 sobre digitaciones de misma altura, una pérdida condicional de altura (peso 1,0) que mide la masa de probabilidad de alturas correctas dado un conjunto de tablaturas tocables, una pérdida de tipo de evento de 3 clases (nota/TS/EOS, peso 0,3), un término de posición (peso 0,5) que penaliza la diferencia entre traste esperado y objetivo, y un término de estiramiento (peso 0,5, margen 5) que limita saltos de traste respecto a la media local en ventanas de ±5 notas. Un término de span (margen 4) quedó desactivado con peso 0,0 en este checkpoint.

## Capacidades

- Traducción de flujo MIDI a digitación de guitarra: mapea tokens de entrada (`CAPO_*`, `TUNING_*`, `NO_*`/`NF_*`, `TS_*`) a tokens de salida `TAB_<cuerda>_<traste>` con huecos temporales `TS_*` y técnicas opcionales.
- Predicción de posición física (cuerda y traste) sin alterar altura ni ritmo, que provienen siempre de la entrada.
- Soporte de afinaciones alternativas mediante tokens `TUNING_*` y de cejilla mediante `CAPO_*`.
- Emisión de un único slot de digitación por ataque de entrada (el decodificador de referencia genera exactamente uno por ataque).
- Manejo de técnicas de ejecución asociadas a tokens de tablatura.
- Generación con decodificación por beams (`num_beams=4`, `no_repeat_ngram_size=3`, `early_stopping=True` en el ejemplo de la model card).
- Integración con `transformers` (T5ForConditionalGeneration) y compatibilidad con Text Generation Inference y endpoints.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso; el ámbito es exclusivamente musical y en inglés.

## Casos de uso

- Generación automática de tablaturas desde MIDI: dado un archivo MIDI de una pieza para guitarra, el modelo produce la digitación cuerda-traste para cada nota, permitiendo exportar tablaturas editables sin intervención manual.
- Herramientas de notación musical: integración en editores como MuseScore o GuitarPro para autocompletar la digitación de pasajes importados desde MIDI, aprovechando que el modelo predice posición y no altura.
- Aplicaciones educativas de guitarra: mostrar al estudiante varias digitaciones válidas para una misma frase y comparar la posición esperada con la elegida, usando los términos de posición y estiramiento como señal de dificultad.
- Preprocesado en pipelines de investigación musical: convertir corpus MIDI a tablatura para análisis de digitación, estudio de patrones de ejecución o generación de datasets etiquetados con posición.
- Prototipado rápido en CPU: con 3,6M de parámetros y ~14 MB, puede ejecutarse en un portátil sin GPU para validar ideas de producto antes de escalar a modelos mayores.
- Generación de ejercicios personalizados: a partir de secuencias MIDI sintéticas (escalas, arpegios), producir digitaciones consistentes para material didáctico, ajustando la afinación y la cejilla mediante los tokens de condicionamiento.
- Filtrado y limpieza de datasets de tablaturas: usar el modelo como referencia para detectar digitaciones anómalas o inconsistencias en tablaturas existentes comparando la predicción con la referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta métricas de diagnóstico de entrenamiento con teacher forcing: `eval_loss` 3,30, con componentes `ce` 2,18, `pitch` 1,72, `position` 1,13, `stretch` 0,024 y `span` 0,0. El autor advierte explícitamente que estos valores escalares de objetivos distintos no son comparables entre sí y que la selección se hizo con un panel de validación congelado de cinco ventanas, generación anclada y evaluación auditiva. No se dispone de comparación numérica con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (3,6M de parámetros, ~14 MB de pesos); cabe holgadamente en cualquier GPU.
- GPU recomendadas: ninguna en particular; el entrenamiento se hizo en una RTX 4090, pero la inferencia funciona en CPU sin problema.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o integradas; también en Raspberry Pi y entornos sin acelerador.
- Opciones de despliegue: `transformers` (T5ForConditionalGeneration), Text Generation Inference (el repo declara compatibilidad con endpoints), y potencialmente llama.cpp/Ollama si se convierte a GGUF, aunque no está documentado.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera latencia de milisegundos en CPU para secuencias cortas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| open-fret-tab | 3,6M | no disponible | MIDI a tablatura de guitarra | MIT (repo); datos sin derechos establecidos | Hugging Face |
| Modelos T5 pequeños genéricos (t5-small) | 60M | 512 tokens | traducción/generación de texto | Apache 2.0 | Hugging Face |
| Herramientas de conversión MIDI-tab (p. ej. AlphaTab, GuitarPro) | no aplica (reglas) | no aplica | MIDI a tablatura | variable | software de escritorio |
| Modelos musicales generativos (MusicGen, etc.) | cientos de M a miles de M | variable | generación de audio/música | variable | Hugging Face |

No se conocen modelos neuronales comparables de tamaño similar dedicados específicamente a MIDI a tablatura en la información disponible; la comparación con herramientas basadas en reglas es cualitativa y no se dispone de métricas comunes.

## Limitaciones y advertencias

- Derechos del corpus de entrenamiento no establecidos: el dataset `vldsavelyev/guitar_tab` y el repositorio convertidor upstream no declaran licencia; la licencia MIT del repositorio cubre solo el código y la configuración, no los datos musicales subyacentes. El uso comercial o la redistribución requieren resolver primero los derechos de los datos.
- Ámbito muy restringido: el modelo solo predice digitación; no genera altura, ritmo ni expresividad, y no sirve para otras tareas musicales o de texto.
- Idioma: la model card declara únicamente inglés, aunque la tarea es simbólica (tokens MIDI) y el idioma natural apenas interviene.
- Riesgo de digitaciones no tocables: a pesar de los términos de posición y estiramiento, el modelo puede producir posiciones incómodas o imposibles en pasajes complejos; la evaluación se hizo con visores de tocabilidad y escucha, pero no hay garantía formal.
- Contexto máximo no documentado: no se especifica la longitud máxima de secuencia de entrada/salida, lo que limita el diseño de pipelines para piezas largas.
- Sesgos del corpus: el modelo hereda los sesgos de digitación presentes en las tablaturas GuitarPro del dataset, que pueden no representar estilos o afinaciones minoritarias.
- Riesgo de alucinación en tokens de técnica: al ser un modelo pequeño entrenado desde cero, puede emitir combinaciones de cuerda-traste-técnica poco frecuentes o inconsistentes.
- Sin benchmarks estándar: no hay comparación pública con alternativas, por lo que la calidad relativa debe validarse en el caso de uso concreto.
- Checkpoint único: solo se publica el checkpoint final de 3 épocas; no hay variantes ni versiones intermedias para comparar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mylonasc/open-fret-tab
- Repositorio del proyecto: https://github.com/mylonasc/open-fret
- Documentación de pérdidas: https://github.com/mylonasc/open-fret/blob/first-working-training-loop/docs/domain_aware_losses.md
- Documentación de licencias del dataset: https://github.com/mylonasc/open-fret/blob/first-working-training-loop/docs/dataset_licensing.md
- Issue sobre alternativas con licencia más clara: https://github.com/mylonasc/open-fret/issues/22
- Dataset de entrenamiento: https://huggingface.co/datasets/vldsavelyev/guitar_tab
