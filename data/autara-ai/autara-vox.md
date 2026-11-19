# autara-ai/Autara-Vox

## Resumen

Autara-Vox es una arquitectura neuronal de decodificación de habla a partir de electroencefalografía (EEG) no invasiva, desarrollada por Autara Research Labs. El modelo aborda el problema de traducir actividad cortical y señales electromiográficas subvocales en representaciones de habla, separando explícitamente dos flujos: oscilaciones corticales puras (1–45 Hz) parcheadas en cuatro centros neuroanatómicos (Broca, Wernicke, occipital y prefrontal) y EMG articulatorio subvocal de mandíbula y rostro (50–200 Hz). Esta separación permite evaluar de forma aislada la contribución de cada componente mediante una compuerta de gating libre de fugas con modos `dual`, `pure_eeg` y `jaw_only`.

El sistema se compone de un backbone basado en Conformer para la codificación de las señales EEG y un adaptador BART-base para la generación de texto, e incorpora sondas de verificación en vivo cada 10 épocas junto con controles de ruido gaussiano para validar que el aprendizaje no se debe a artefactos. Los resultados reportados se obtienen sobre 14.208 ensayos sincronizados de OpenNeuro (ds003655, ds003626 y ds004408), con métricas de clasificación y de recuperación de habla continua.

Es relevante ahora porque propone una metodología verificable (controles de ruido, sondas periódicas, gating explícito) para una tarea con alto riesgo de fuga de información, y porque publica pesos entrenados y código reproducible bajo licencia MIT. No obstante, el rendimiento en decodificación de habla continua es todavía bajo (BLEU-1 en torno a 10–11, PER cercano al 89 %), lo que lo sitúa como una contribución de investigación más que como una herramienta lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder EEG) + adaptador BART-base (decoder de texto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (checkpoints) |

## Arquitectura y entrenamiento

La arquitectura combina un encoder basado en Conformer para procesar las señales EEG y EMG, con un adaptador sobre BART-base para la generación de texto en la tarea de decodificación de habla continua. El diseño es de doble flujo: un flujo cortical puro (1–45 Hz) parcheado en cuatro centros neuroanatómicos (Speech/Broca, Auditory/Wernicke, Visual/Occipital y Memory/Prefrontal) y un flujo de EMG articulatorio subvocal (50–200 Hz). Una compuerta de gating con modos `dual`, `pure_eeg` y `jaw_only` permite aislar cada componente sin fugas de información entre flujos, y en el experimento de habla continua la compuerta aprendió a enrutar de forma autónoma entre el 96,4 % y el 99,7 % de la señal al centro auditivo.

El entrenamiento se realizó sobre 14.208 ensayos sincronizados de tres conjuntos de OpenNeuro: ds003655 (memoria de trabajo verbal), ds003626 (habla interna, pronunciada con mandíbula y visualizada) y ds004408 (escucha de habla continua en bucle abierto, sin teacher forcing). Se incluyeron sondas de verificación en vivo cada 10 épocas y controles de EEG con ruido gaussiano aleatorio para descartar artefactos. No se especifica en la información disponible el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO; el modelo es un sistema supervisado de clasificación y decodificación, no un LLM generativo de propósito general.

## Capacidades

- Decodificación de habla interna, pronunciada y visualizada a partir de EEG (clasificación de tres modalidades).
- Decodificación de habla continua en bucle abierto con recuperación de texto (Top-5, BLEU-1, ROUGE-L).
- Clasificación de memoria de trabajo verbal en sujetos no vistos.
- Separación explícita de componentes cortical y articulatorio mediante gating seleccionable.
- Transferencia de representaciones desde un backbone preentrenado en memoria verbal hacia tareas de habla.
- Verificación de integridad mediante sondas en vivo y controles de ruido gaussiano.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales de visión, audio o vídeo.
- Capacidad multilingüe limitada al inglés (`en`).

## Casos de uso

- Investigación en interfaces cerebro-computadora (BCI) no invasivas: el modelo sirve como línea base reproducible para decodificar habla interna a partir de EEG con separación controlada de flujos cortical y articulatorio.
- Estudios de neurociencia del lenguaje: la parcellación en cuatro centros (Broca, Wernicke, occipital, prefrontal) permite analizar la contribución de cada región a la decodificación, con resultados reportados de sinergia entre los cuatro centros (55,3 % conjunto frente a 37,6–45,5 % individuales).
- Validación metodológica de pipelines EEG: las sondas cada 10 épocas y los controles de ruido gaussiano permiten auditar si una mejora en métricas se debe a señal neural real o a artefactos, útil para replicar experimentos.
- Prototipado de sistemas de comunicación asistida: como prueba de concepto para personas con trastornos del habla, aunque el rendimiento actual (BLEU-1 ≈ 10–11, PER ≈ 89 %) no es suficiente para uso clínico.
- Análisis de atención y escucha: el experimento de habla continua muestra cómo la compuerta enruta la señal al centro auditivo (96,4–99,7 %), lo que puede emplearse para estudiar estados de escucha atencional.
- Reproducción y extensión de resultados: los checkpoints publicados (`autara_vox_speech_best.pt`, `exp1_inner_mem_transfer_best.pt`, `exp1_inner_scratch_best.pt`, `memory_pretrained_backbone.pt`) permiten reentrenar o adaptar el modelo a nuevos conjuntos de OpenNeuro con los scripts incluidos.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 14.208 ensayos sincronizados de OpenNeuro:

| Experimento | Metrica | Autara-Vox | Control de ruido | Referencia interna |
|---|---|---|---|---|
| Exp 0 — Memoria de trabajo verbal (ds003655, sujetos no vistos) | Accuracy | 63,1 % | +16,8 % Macro-F1 sobre ruido | no disponible |
| Exp 1 — Habla interna/pronunciada/visualizada (ds003626, sesión 3 no vista) | Accuracy 3 modalidades (dual + transferencia de memoria) | 69,1 % | +42,9 % sobre ruido | Pure EEG: 55,3 %; Jaw/EXG: 66,6 % |
| Exp 1 — Macro-F1 (dual + transferencia) | Macro-F1 | 73,7 % | no disponible | no disponible |
| Exp 1 — Pronunciada + mandíbula, 4 palabras | Accuracy | 68,3 % (2,7× azar) | no disponible | no disponible |
| Exp 1 — Sinergia de 4 centros (solo EEG puro) | Accuracy conjunta | 55,3 % | no disponible | Visual 45,5 %; Auditivo 45,1 %; Speech 41,0 %; Memoria 37,6 % |
| Exp 2 — Habla continua (ds004408, sin teacher forcing) | Top-5 | 3,66 % | +1,10 % vs ruido | no disponible |
| Exp 2 — Habla continua | BLEU-1 | 9,92 | no disponible | Época 30 solo EEG: 11,48 |
| Exp 2 — Habla continua | ROUGE-L | 11,14 | no disponible | Época 30 solo EEG: 11,77 |
| Exp 2 — Habla continua (época 30, solo EEG) | PER | 88,74 % | no disponible | no disponible |
| Exp 2 — Habla continua (época 30, solo EEG) | Diversidad | 18,75 % (3,6× ruido) | no disponible | no disponible |

No se han publicado comparaciones con modelos externos de EEG-to-speech en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,7 GB, lo que sugiere que los checkpoints caben holgadamente en GPUs de consumo, pero no se confirma el consumo en ejecución.
- GPU recomendadas: no especificadas por el autor. El script de instalación apunta a CUDA 12.4 (`cu124`), por lo que se requiere una GPU NVIDIA compatible con CUDA 12.4.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del repositorio (0,7 GB), aunque no se confirma.
- Opciones de despliegue: scripts propios en Python con PyTorch (`scripts/demo_thought_to_speech.py`, `scripts/train_inner_speech.py`, `scripts/train_speech_decoder.py`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables de EEG-to-speech con los que contrastar parámetros, contexto, rendimiento o licencia. La model card únicamente compara variantes internas del propio sistema (pure EEG, jaw/EXG y dual-stream), no con alternativas externas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autara-Vox | no disponible | no disponible | Exp 1: 69,1 % accuracy (3 modalidades); Exp 2: BLEU-1 9,92 | MIT | Hugging Face |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento bajo en decodificación de habla continua: BLEU-1 en torno a 9,92–11,48, ROUGE-L 11,14–11,77 y PER del 88,74 %, insuficiente para aplicaciones de comunicación reales.
- Top-5 de recuperación de solo 3,66 % en el mejor checkpoint, lo que indica una capacidad de recuperación léxica muy limitada.
- Entrenado exclusivamente en inglés (`en`); no hay evidencia de generalización a otros idiomas.
- Resultados dependientes de tres conjuntos concretos de OpenNeuro (ds003626, ds004408, ds003655); la generalización a otras cohortes, equipos de EEG o paradigmas no está demostrada.
- Riesgo de fuga de información entre flujos si no se respeta la compuerta de gating; el propio diseño incluye controles de ruido precisamente por este motivo.
- No es un modelo de lenguaje generativo: no soporta tool calling, agentes ni razonamiento multi-paso, por lo que no debe evaluarse con benchmarks de LLM.
- Uso clínico o médico no validado; la model card lo etiqueta como `medical` y `neuroscience`, pero no se reportan ensayos clínicos ni certificaciones.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia MIT: permite uso comercial, pero al tratarse de datos EEG de sujetos humanos, el uso práctico está sujeto a las condiciones éticas y de privacidad de los conjuntos OpenNeuro originales.
- Ausencia de pipeline declarado en Hugging Face y de documentación sobre cuantización o formatos alternativos a PyTorch `.pt`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autara-ai/Autara-Vox
- Manuscrito IEEE incluido en el repositorio: `paper/autara_vox_paper.pdf`
- Resultados de sondas en vivo: `paper/results/*_probe_ep*.json`
- Conjuntos de datos OpenNeuro referenciados: ds003626, ds004408, ds003655 (no se proporcionan URL directas en la información disponible)
- Repositorio de código y scripts de entrenamiento: incluido en el propio repositorio de Hugging Face (no se proporciona URL separada)
