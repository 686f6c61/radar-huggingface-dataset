# LOPATA-AI-Hub/neuroconstructor-light

## Resumen

LOPATA Neuroconstructor · Light es un paquete especializado y experimental de selección de iconos en cuatro posiciones, desarrollado por LOPATA-AI-Hub (PiTrolKun). No es un modelo fundacional entrenado desde cero, sino una fusión de tres componentes preentrenados: MiniLM (sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2) para el procesamiento de la instrucción textual, el detector de iconos OmniParser v3 (derivado de microsoft/OmniParser-v2.0) para la percepción visual y Whisper Base (openai/whisper-base) para la transcripción de las dos grabaciones de audio de entrada.

El sistema recibe una pantalla con cuatro iconos dispuestos en una matriz de 2x2, una instrucción breve que selecciona la primera o la segunda de dos grabaciones WAV mono PCM, y las propias grabaciones. La salida es la posición de la celda elegida, con el índice 0 en la esquina superior izquierda. Las conexiones aprendidas entre los tres especialistas se empaquetan junto con los componentes originales en un único artefacto de 1.077.152.563 bytes con formato de paquete 1, exportado desde LOPATA 0.9.2-dev.

Su relevancia es acotada y experimental: demuestra una arquitectura de fusión local de especialistas para una tarea sintética concreta, con un rendimiento medido de 18/32 aciertos frente a 6/32 del funcionamiento independiente de los componentes, y una latencia media de 0,37 segundos tras la carga frente a 1,70 segundos antes. No debe confundirse con un modelo de propósito general: el alcance está limitado a una tarea de selección de iconos sobre un PC físico concreto, con 64 ejemplos de entrenamiento, 24 de validación y 32 comandos reservados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fusión de tres especialistas preentrenados (MiniLM + OmniParser v3 + Whisper Base) con conexiones aprendidas empaquetadas en un único artefacto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | Otra, específica por componente (component-specific); términos en ATTRIBUTION.md |
| Formato de pesos | Paquete propietario `.lopatanet` (formato de paquete 1); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El sistema no es un transformer monolítico ni un modelo MoE, sino un ensamblaje de tres modelos preentrenados que actúan como especialistas: MiniLM para la codificación de la instrucción, OmniParser v3 para la detección de iconos en la captura de pantalla y Whisper Base para la transcripción de los dos WAV de entrada. Sobre estos componentes se aprenden conexiones que se empaquetan junto con los pesos originales atribuidos en un solo fichero `.lopatanet` de 1.077.152.563 bytes (SHA-256 `2afbbd7f8c29f1ea90dcde120c8e9982093e6c2acc4461ec9510d54578567d74`). El runtime `lopata-neuro` 1.2.0 ejecuta el paquete en local y sin conexión una vez instaladas las dependencias.

El entrenamiento se realizó sobre 64 ejemplos, con 24 ejemplos de validación y 32 comandos reservados para la evaluación final. El autor indica que se completaron los seis ciclos de entrenamiento y que, para la exportación, se seleccionó el ciclo 5 evaluado sobre los 24 ejemplos de validación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La medición de transferencia reportada es de 132 bytes por tarea a través de mensajes de grafo contabilizados, excluyendo la subida de la imagen fuente, el tráfico del subproceso de OCR y la sobrecarga del driver.

## Capacidades

- Selección de una celda entre cuatro posiciones en una pantalla 2x2 a partir de una instrucción y dos grabaciones de audio.
- Percepción visual de iconos mediante OmniParser v3.
- Transcripción de audio mono PCM WAV mediante Whisper Base.
- Codificación multilingüe de la instrucción con MiniLM (ruso e inglés).
- Ejecución local y offline tras instalar las dependencias del runtime.
- Empaquetado de componentes y conexiones aprendidas en un único artefacto reproducible.
- No se documentan capacidades de generación de texto libre, razonamiento general, código, matemáticas, tool calling, agentes multi-paso ni modo thinking.

## Casos de uso

- Prototipado de interfaces de selección por voz: el sistema permite mapear una instrucción hablada a una de cuatro celdas de una pantalla, útil para validar flujos de control por audio en entornos de investigación.
- Investigación en fusión de especialistas: sirve como banco de pruebas reproducible para estudiar cómo las conexiones aprendidas entre MiniLM, OmniParser y Whisper mejoran una tarea concreta (de 6/32 a 18/32).
- Evaluación de pipelines multimodales locales: permite medir latencia y transferencia en un PC físico concreto (i9-13900KF y RTX 4090) sin depender de servicios en la nube.
- Docencia y demostraciones de arquitecturas compuestas: el paquete `.lopatanet` y el runtime `lopata-neuro` facilitan mostrar el ensamblaje de tres modelos preentrenados en un solo artefacto.
- Pruebas de accesibilidad por voz en matrices de iconos: con las limitaciones de alcance indicadas, puede emplearse para experimentar con selección de iconos mediante dos grabaciones de audio.
- Reproducción de benchmarks sintéticos: los 32 comandos reservados y los 24 ejemplos de validación permiten replicar la medición de aciertos y latencia reportada por el autor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Aciertos con componentes independientes (32 tareas) | 6/32 |
| Aciertos tras aprendizaje de conexiones (32 tareas) | 18/32 |
| Latencia media antes de carga (i9-13900KF + RTX 4090) | 1,70 s por tarea |
| Latencia media tras carga (i9-13900KF + RTX 4090) | 0,37 s por tarea |
| Transferencia por tarea (mensajes de grafo contabilizados) | 132 bytes |
| Ejemplos de entrenamiento / validación / reservados | 64 / 24 / 32 |
| Ciclo exportado | 5 (de 6 completados) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU del entorno de prueba reportado: RTX 4090 junto con CPU Intel i9-13900KF.
- Compatibilidad con GPU de consumo: el autor reporta ejecución en una RTX 4090; no se documenta comportamiento en otras GPU.
- Opciones de despliegue: runtime propietario `lopata-neuro` 1.2.0 (wheel probado y release de código fuente); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia medida: 0,37 segundos por tarea tras la carga de los modelos en el equipo de prueba.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LOPATA Neuroconstructor · Light | Fusión de especialistas para selección de iconos | no disponible | no disponible | Específica por componente | Hugging Face (repo de 1,1 GB) |
| microsoft/OmniParser-v2.0 | Detección de iconos y parsing de UI | no disponible | no disponible | no disponible | Hugging Face |
| openai/whisper-base | Reconocimiento automático de voz | no disponible | no disponible | no disponible | Hugging Face |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | Embeddings de frases multilingües | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada; la comparativa se limita a la relación de componentes que integra el paquete.

## Limitaciones y advertencias

- Alcance muy restringido: una única tarea sintética de selección de iconos sobre una pantalla 2x2, un PC físico concreto y 32 comandos reservados.
- Rendimiento limitado: 18/32 aciertos en la evaluación reservada, lejos de un uso fiable en producción.
- No es un modelo de propósito general: no genera texto libre, no razona, no programa y no soporta tool calling ni agentes.
- Idiomas limitados a ruso e inglés; no se documenta soporte de castellano.
- Licencia específica por componente: es obligatorio revisar ATTRIBUTION.md antes de cualquier uso, incluido el comercial.
- Riesgo de sobreajuste: entrenado con solo 64 ejemplos y evaluado sobre 24 de validación, con selección del ciclo 5 entre seis ciclos.
- La métrica de transferencia de 132 bytes excluye la subida de imagen, el tráfico del subproceso de OCR y la sobrecarga del driver, por lo que no refleja el coste total real.
- Dependencia de un runtime propietario (`lopata-neuro` 1.2.0) y de un formato de paquete no estándar (`.lopatanet`).
- Sin descargas ni likes en el momento de la consulta; ausencia de validación externa independiente.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/LOPATA-AI-Hub/neuroconstructor-light)
- [Descarga del paquete LOPATA-trio.lopatanet](https://huggingface.co/LOPATA-AI-Hub/neuroconstructor-light/resolve/main/LOPATA-trio.lopatanet?download=true)
- [Estudio y comparación de respuestas (Space)](https://huggingface.co/spaces/LOPATA-AI-Hub/neuroconstructor-study)
- [Instrucciones de ejecución (RUN.md)](https://huggingface.co/spaces/LOPATA-AI-Hub/neuroconstructor-study/blob/main/RUN.md)
- [Estudio y ajustes (STUDY.md)](https://huggingface.co/spaces/LOPATA-AI-Hub/neuroconstructor-study/blob/main/STUDY.md)
- [Atribución de componentes (ATTRIBUTION.md)](https://huggingface.co/LOPATA-AI-Hub/neuroconstructor-light/blob/main/ATTRIBUTION.md)
- [Repositorio LOPATA en GitHub](https://github.com/PiTrolKun/LOPATA)
- [Perfil de PiTrolKun en GitHub](https://github.com/PiTrolKun)
- [Canal de YouTube](https://youtube.com/@lopata_ai_hub)
- [Comunidad en VK](https://vk.ru/lopata_ai_localhub)
