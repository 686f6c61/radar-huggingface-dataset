# braindecode/meggpt-pretrained

## Resumen

MEG-GPT es un modelo fundacional basado en transformer causal con atención temporal, diseñado para datos de magnetoencefalografía (MEG) en espacio de fuentes. Lo desarrollan R. Huang, S. Cho, C. Gohil, O. Parker Jones y M. Woolrich (grupo OHBA, Universidad de Oxford) y se publicó en *Imaging Neuroscience* en 2026. El repositorio `braindecode/meggpt-pretrained` no es la publicación original de los autores, sino una conversión de los pesos originales a los nombres de parámetros de la librería Braindecode, manteniendo los tensores sin modificar.

El modelo resuelve el problema de la falta de modelos fundacionales preentrenados para neuroimagen funcional: en lugar de entrenar desde cero para cada tarea downstream, MEG-GPT se preentrena de forma autosupervisada (predicción del siguiente token) sobre MEG de resting-state en espacio de fuentes y luego se adapta mediante fine-tuning o linear probing. La entrada son 52 parcelas de la parcelación Glasser 52 a 250 Hz, tokenizadas en segmentos de 100 muestras mediante el codificador EphysTokenizer.

Con 4.099.234 parámetros, es un modelo muy compacto, pensado para investigación neurocientífica más que para despliegue de propósito general. Su relevancia actual radica en que demuestra que los paradigmas de modelos fundacionales (tokenización discreta + GPT causal) son viables sobre señales cerebrales en espacio de fuentes, abriendo la puerta a reutilización de representaciones entre sujetos y tareas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención temporal (GPT) sobre tokens discretos de MEG en espacio de fuentes |
| Parámetros totales | 4.099.234 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la ventana se segmenta en bloques de 100 muestras) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (señal MEG, no texto) |
| Licencia | MIT |
| Formato de pesos | safetensors y pytorch_model.bin |

## Arquitectura y entrenamiento

MEG-GPT es un transformer causal tipo GPT que opera sobre una secuencia de tokens discretos generados por un tokenizador neuronal, EphysTokenizer. La entrada es MEG en espacio de fuentes: 52 parcelas de la parcelación Glasser 52 en su orden canónico, alineadas por inversión de signo y z-scored por parcela sobre la grabación completa, a 250 Hz. La señal se corta en segmentos de 100 muestras que se mapean a tokens mediante el codificador del tokenizador; el modelo aplica atención temporal causal sobre esa secuencia de tokens.

El preentrenamiento se realizó sobre datos de resting-state del dataset Cam-CAN, con un objetivo de predicción del siguiente token. El repositorio incluye los pesos del modelo y del codificador del tokenizador, pero no el decodificador de señal del tokenizador (`token_basis_layer`) ni su temperatura de annealing, ni la cabeza de predicción del siguiente token, ni los embeddings de sesión específicos de Cam-CAN (621 sesiones), que el artículo descarta para uso downstream. La cabeza de clasificación (`final_layer`) incluida es una inicialización por defecto de PyTorch bajo `torch.manual_seed(0)` con `n_outputs=2`, no forma parte del release original y debe sustituirse o entrenarse antes de usar.

La conversión verifica equivalencia numérica estricta con el código original: identificadores de token idénticos, estados ocultos del decodificador, características promediadas en tiempo, logits a través de la cabeza de predicción liberada y gradientes de 99 tensores en un backward pass coinciden con diferencia máxima absoluta de 0.0.

## Capacidades

- Extracción de representaciones (embeddings) de MEG en espacio de fuentes mediante `return_features=True`, útiles como entrada para clasificadores downstream.
- Clasificación de ventanas MEG tras fine-tuning o linear probing (la cabeza de clasificación debe entrenarse).
- Modelado autorregresivo de secuencias de tokens neuronales (preentrenamiento causal sobre tokens de MEG).
- Tokenización de señal MEG mediante el codificador EphysTokenizer incluido.
- Adaptación a tareas downstream por fine-tuning o linear probing sobre las características extraídas.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües: es un modelo específico de dominio para neuroimagen funcional.

## Casos de uso

- **Decodificación de estados cognitivos en resting-state**: extraer características con `return_features=True` sobre ventanas de MEG de Cam-CAN u otros datasets y entrenar un clasificador lineal para predecir variables conductuales o demográficas, aprovechando las representaciones preentrenadas en lugar de entrenar desde cero.
- **Transferencia a nuevos datasets de MEG**: usar los pesos preentrenados como inicialización para fine-tuning en cohortes distintas, reduciendo la cantidad de datos etiquetados necesaria frente a un entrenamiento desde cero.
- **Investigación en representaciones neuronales**: analizar los estados ocultos del transformer para estudiar qué estructura temporal captura el modelo sobre la dinámica de parcelas corticales.
- **Pipeline de análisis de MEG en Braindecode**: integrar `MEGGPT.from_pretrained(...)` en flujos existentes de Braindecode 2.1, combinándolo con los fetchers y utilidades de preprocesado de la librería.
- **Benchmarking de modelos fundacionales en neuroimagen**: comparar las representaciones de MEG-GPT con otras arquitecturas publicadas en Braindecode (65+ modelos) sobre una misma tarea de decodificación.
- **Prototipado de BCI basado en MEG**: evaluar la viabilidad de usar características preentrenadas para interfaces cerebro-computadora en entornos de laboratorio con MEG, antes de invertir en modelos específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; con 4,1 M de parámetros, los pesos en float32 ocupan aproximadamente 16 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; también funciona en CPU (la verificación del autor se realizó en CPU en float32).
- Cabe en GPU consumer: sí, en cualquier modelo (RTX 3060, RTX 4090, etc.) e incluso en iGPU o CPU.
- Opciones de despliegue: la vía documentada es la librería Braindecode (`braindecode.models.MEGGPT`), con pesos en safetensors o pytorch_model.bin. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este dominio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MEG-GPT (este) | 4.099.234 | No disponible (segmentos de 100 muestras) | MEG en espacio de fuentes | MIT | Hugging Face + GitHub OHBA |
| Otros modelos de Braindecode | Variable según arquitectura (65+ publicadas) | No disponible | EEG, ECoG, MEG | Variable | Repositorio Braindecode |
| Alternativas fundacionales de MEG comparables | No disponible | No disponible | MEG | No disponible | No disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otros modelos fundacionales de MEG en la información proporcionada.

## Limitaciones y advertencias

- La cabeza de clasificación incluida es una inicialización por defecto de PyTorch, no entrenada; es obligatorio hacer fine-tuning o linear probing antes de cualquier uso predictivo.
- El modelo no normaliza su entrada ni comprueba `sfreq`; el usuario debe garantizar el preprocesado correcto (52 parcelas Glasser en orden, alineación por inversión de signo, z-score por parcela, 250 Hz).
- Las ventanas que no son múltiplo de 100 muestras requieren configurar `on_non_divisible`.
- Los embeddings de sesión de Cam-CAN se han eliminado del release; el modelo no incorpora información de sesión específica.
- Riesgo de alucinación en el sentido de texto no aplica; el riesgo es de sobreajuste o representaciones poco generalizables fuera de la distribución de Cam-CAN.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre una única cohorte (Cam-CAN), puede no generalizar bien a otras poblaciones, equipos o protocolos de adquisición.
- Licencia MIT permite uso comercial, pero el modelo está pensado para investigación neurocientífica; no hay validación clínica.
- No es un modelo de lenguaje: no procesa texto ni soporta instrucciones en lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/braindecode/meggpt-pretrained
- Paper (DOI): https://doi.org/10.1162/imag.a.1301
- Paper (arXiv): https://arxiv.org/abs/2510.18080
- Código y pesos originales: https://github.com/OHBA-analysis/MEG-GPT/tree/78ff9439febaeb8e838fd670ec589578e635fd0c
- Tokenizador EphysTokenizer: https://github.com/OHBA-analysis/EphysTokenizer/tree/44cac87caee7ae2521d2b88e7bc71c510b10a023
- Documentación de `MEGGPT` en Braindecode: https://braindecode.org/stable/generated/braindecode.models.MEGGPT.html
- Pull request de Braindecode #1555: https://github.com/braindecode/braindecode/pull/1555
- Repositorio Braindecode: https://github.com/braindecode/braindecode
- Documentación de Braindecode: https://braindecode.org/stable/index.html
- Licencia original: https://github.com/OHBA-analysis/MEG-GPT/blob/main/LICENSE
