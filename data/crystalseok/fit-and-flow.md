# crystalseok/fit-and-flow

## Resumen

Fit&Flow es un prototipo de investigación publicado en Hugging Face por el usuario crystalseok que combina un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-4B con un autoencoder desantificador condicional (DAE) para reconocimiento de ejercicios físicos y detección de anomalías a partir de vídeo RGB. El sistema procesa seis fotogramas RGB muestreados a 5 Hz y genera, mediante el VLM frontal, la fase de ejercicio y las fases a nivel de fotograma; la representación del último token del prompt capturada durante el prefill de generación se reutiliza como característica para el detector de desviaciones, evitando una pasada adicional del VLM.

El repositorio no contiene los pesos originales de Qwen, sino únicamente el adaptador LoRA, el procesador/tokenizador, el checkpoint del DAE con su escalador de características y los umbrales P90 calibrados por ejercicio, además de un fichero `inference_config.json` con el prompt, los mapeos de identificadores y los ajustes de inferencia. El tamaño del repositorio es de aproximadamente 0,1 GB, coherente con un adaptador PEFT y un DAE de dimensiones reducidas (2560 → 256 → 32).

Se trata de un artefacto de investigación con validación limitada: las comprobaciones documentadas se restringen a la carga estricta del state-dict del DAE y a un forward sintético en CPU, sin métricas de precisión de reconocimiento, de detección de desviaciones ni de latencia extremo a extremo en GPU. No se declara licencia, idiomas soportados ni pipeline en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Qwen/Qwen3.5-4B) + autoencoder desantificador condicional (DAE) |
| Parametros totales | no disponible (el adaptador LoRA y el DAE no declaran recuento; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); checkpoint del DAE en el directorio `detector/` |

## Arquitectura y entrenamiento

El sistema consta de dos componentes acoplados. El primero es un adaptador LoRA de bajo rango ajustado sobre Qwen/Qwen3.5-4B, un transformer decoder de 4B parámetros, que actúa como VLM frontal: recibe seis fotogramas RGB muestreados a 5 Hz y genera la fase de ejercicio y las fases a nivel de fotograma. El segundo es un autoencoder desantificador condicional con dimensión de entrada 2560 (la dimensión de características del modelo base), dimensión oculta 256 y dimensión latente 32, entrenado hasta la época 60. El detector se condiciona por ejercicio y aplica una regla de desviación basada en el error cuadrático medio de reconstrucción estrictamente mayor que un umbral calibrado sobre el percentil 90 (P90) de validación normal, específico por ejercicio.

La innovación técnica destacable es la reutilización de la representación del último token del prompt capturada durante el prefill de generación del VLM como característica de entrada al DAE, lo que elimina la necesidad de una pasada forward separada para la extracción de características. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La revisión de despliegue declarada (`851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) procede de un registro de despliegue guardado y el autor advierte explícitamente que no la presenta como una revisión verificada en tiempo de entrenamiento.

## Capacidades

- Reconocimiento de ejercicios físicos a partir de secuencias de seis fotogramas RGB muestreados a 5 Hz.
- Generación de la fase de ejercicio y de fases a nivel de fotograma mediante el VLM frontal.
- Detección de anomalías o desviaciones en la ejecución mediante el DAE condicionado por ejercicio y umbrales P90 específicos.
- Extracción de características integrada en el prefill del VLM, sin forward adicional.
- Procesamiento multimodal de entrada visual (RGB) con el modelo base Qwen3.5-4B.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo ni modos especiales (thinking, audio) en la información disponible.

## Casos de uso

- Corrección de forma en entrenamiento de fuerza: el sistema identificaría la fase del ejercicio y marcaría desviaciones respecto al patrón normal calibrado, permitiendo avisos en tiempo casi real durante la serie.
- Monitorización de rehabilitación: al condicionar el detector por ejercicio y calibrar umbrales sobre validación normal, podría señalizar movimientos fuera del rango esperado en pacientes que ejecutan rutinas pautadas.
- Análisis de sesiones grabadas: procesando secuencias de seis fotogramas a 5 Hz se podría etiquetar fase a fase un vídeo de entrenamiento para revisión posterior por parte de entrenadores.
- Control de calidad en gimnasios con visión por computador: integración del adaptador y el DAE en un pipeline de cámara fija para detectar ejecuciones anómalas y generar alertas.
- Investigación en reconocimiento de acciones: el bundle sirve como base reproducible para experimentar con la reutilización de representaciones del prefill como características para detección de anomalías.
- Prototipado de asistentes de fitness: el prompt y los mapeos de identificadores en `inference_config.json` permiten reconstruir el pipeline de inferencia para demos y pruebas de concepto.
- Evaluación comparativa de detectores de desviación: los umbrales P90 por ejercicio y el checkpoint del DAE facilitan reproducir la calibración y comparar con alternativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que el procesador superó una comprobación de preprocesado de seis fotogramas en CPU y que el DAE superó la carga estricta del state-dict y un forward sintético en CPU, y advierte que estas comprobaciones no miden precisión de reconocimiento, precisión de detección de desviaciones ni latencia extremo a extremo en GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador LoRA y el DAE son ligeros (repo de 0,1 GB), pero requieren cargar el modelo base Qwen/Qwen3.5-4B, cuyos requisitos de VRAM no se detallan en la información disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; dependerá del modelo base y de la cuantización elegida, no documentada.
- Opciones de despliegue: la librería declarada es `peft`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la model card señala explícitamente que no se ha medido la latencia extremo a extremo en GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (reconocimiento de ejercicios con VLM más detección de anomalías) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Es un prototipo de investigación; el autor lo declara explícitamente como tal.
- Las predicciones pueden verse afectadas por el punto de vista de la cámara, la iluminación, la oclusión y movimientos fuera de los datos de entrenamiento.
- No se han publicado métricas de precisión de reconocimiento ni de detección de desviaciones; las validaciones documentadas son solo comprobaciones de carga y forward sintético en CPU.
- No se declara licencia, lo que impide determinar las condiciones de uso comercial.
- No se declaran idiomas soportados ni longitud de contexto.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables al modelo base Qwen3.5-4B y al adaptador.
- La revisión de despliegue no está verificada como revisión de entrenamiento, según advierte el propio autor.
- Los pesos originales del modelo base no se incluyen en el repositorio; es necesario descargarlos por separado.

## Enlaces

- Hugging Face: https://huggingface.co/crystalseok/fit-and-flow
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos.
