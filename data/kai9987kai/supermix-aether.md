# Kai9987kai/Supermix-Aether

## Resumen

Supermix-Aether es un repositorio publicado en Hugging Face por el usuario Kai9987kai (identificado en su perfil como "Kai piper"), bajo el identificador `Kai9987kai/Supermix-Aether`. A pesar de su nombre y de su alojamiento en Hugging Face, no se trata de un modelo de lenguaje preentrenado en el sentido convencional: la model card describe un laboratorio de investigación ejecutable localmente en CPU para la arquitectura denominada "AETHER", y más concretamente para su primer hito, "NeuroWave-X".

El contenido del repositorio es un entorno de experimentación en Python (requiere Python 3.12+, NumPy, SciPy y PyTorch en CPU) que entrena un modelo disperso de 512 neuronas con siete controles de comunicación y lo evalúa en una tarea de navegación 3D con señal retardada. El objetivo declarado es estudiar si los protocolos de comunicación basados en ondas ("wave protocols") aportan alguna ventaja frente a controles escalares, vectoriales, de atención o de fase.

La relevancia actual del proyecto es limitada y de carácter estrictamente exploratorio. El propio autor reconoce en la model card que el piloto completado no demuestra comunicación por ondas útil ni ventaja de rendimiento alguna, y que la promoción del modelo se retiene. El tamaño del repositorio es de 0,0 GB, sin descargas ni interacciones registradas, y no se declara licencia, idiomas ni pipeline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Grafo disperso escalar con protocolos auxiliares de comunicación (vector, atención, fase, modo espacial y onda combinada); no es un transformer |
| Parámetros totales | No disponible (512 neuronas × 32 componentes de estado, 4.096 aristas escalares, 16 regiones y 96 enlaces dirigidos entre regiones; el número de parámetros entrenables no se especifica) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera por ticks de simulación) |
| Tipos de cuantización | No disponible (el transporte auxiliar se codifica en FP16: 12.288 bytes de payload por tick) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | Checkpoints PyTorch (`.pt`); no se declaran safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura AETHER, en su estadio NeuroWave-X, se organiza como un grafo disperso y autoritativo de 512 neuronas con 32 componentes de estado cada una, 4.096 aristas escalares, 16 regiones y 96 enlaces dirigidos entre regiones. Sobre esa base escalar se instancian protocolos auxiliares de comunicación entrenables (vector, atención, fase, modo espacial y onda combinada) junto con controles de solo escalar y de cuello de botella escalar aprendido. Los modos auxiliares se codifican como cuatro modos por ocho componentes complejos representados como pares reales en FP16, con una ganancia auxiliar inicializada a cero y residuales recortados de forma explícita, de modo que a ganancia cero la ruta escalar es idéntica a la del control.

El entrenamiento es una imitación supervisada genuina sobre trayectorias expertas ejecutadas, con retropropagación a través del tiempo (BPTT) y etiquetas de imitación; el autor subraya explícitamente que no es aprendizaje por reglas locales ni aprendizaje por refuerzo. El piloto completado comprende 21 modelos entrenados (siete protocolos por tres semillas), 40 actualizaciones AdamW por modelo y 24 episodios de consulta ejecutados por semilla, con repetición de todas las condiciones de evaluación registradas. La evaluación ejecuta las acciones de la propia política sin modificar parámetros ni búferes persistentes. Existe un estudio mayor de treinta semillas definido en `configs/study-30.json` pero no ejecutado. La versión 0.3 añade perfilado computacional (latencia en microsegundos, contadores analíticos de FLOPs por paso, contabilidad de memoria del optimizador), tareas de estrés de comunicación (navegación multi-waypoint y pulsos distractores sensoriales) y plasticidad estructural SynapseForge (lesión causal de enlaces regionales, reconexión hebbiana dependiente de actividad y recálculo atómico del operador laplaciano).

## Capacidades

- Entrenamiento y evaluación de políticas de imitación en una tarea de navegación 3D con seis objetivos fijos en línea recta y señal retardada.
- Ejecución de siete protocolos de comunicación distintos sobre la misma topología de grafo, con formas de parámetros y tensores de cableado idénticas.
- Transporte diferenciable verificado contra entrega validada de paquetes y decodificación independiente en NumPy.
- Intervenciones experimentales controladas: borrado de paquetes, ganancia cero, mezcla de fase y aleatorización de fase, además de evaluación con retardos mayores.
- Perfilado de recursos: benchmarks de latencia en microsegundos, contadores analíticos de FLOPs por paso y contabilidad de memoria del optimizador.
- Plasticidad estructural: lesión causal de enlaces, reconexión hebbiana y recálculo del portador laplaciano sin interrumpir el estado neuronal.
- Replay determinista de cada condición de evaluación registrada y verificación de recibos SHA256 sin firma.
- Banco de trabajo en vivo con telemetría de GFLOPs y latencia, y conmutación interactiva de familias de tareas.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Investigación sobre comunicación en redes neuronales dispersas: el laboratorio permite comparar siete protocolos de comunicación bajo formas de parámetros idénticas y semillas emparejadas, lo que sirve para diseñar experimentos de ablación reproducibles.
- Docencia y formación en metodología experimental: la separación entre estudio offline (`aether run`), verificación (`aether verify`) y replay (`aether replay`) ofrece un ejemplo práctico de trazabilidad de artefactos y recibos criptográficos.
- Estudio de plasticidad estructural: las funciones SynapseForge permiten simular lesiones regionales y reconexión hebbiana para analizar la robustez de una red ante daño topológico.
- Análisis de coste computacional en CPU: el perfilador y los contadores de FLOPs permiten caracterizar el coste por paso de arquitecturas pequeñas sin GPU, útil para entornos con recursos restringidos.
- Reproducción de resultados y auditoría: el banco de trabajo en vivo y el observatorio local permiten inspeccionar checkpoints, alterar la comunicación y exportar la traza de acciones real, lo que facilita la revisión por terceros.
- Prototipado de tareas de navegación con señal retardada: el entorno de seis tareas 3D con desaparición de la señal tras el primer tick sirve como banco de pruebas para políticas de imitación con memoria.

## Benchmarks y rendimiento

| Condición | Éxito medio en consultas |
|---|---|
| Wave | 16,7 % |
| Escalar | 16,7 % |
| Escalar emparejado | 20,8 % |
| Vector | 20,8 % |
| Atención | 20,8 % |
| Fase | 20,8 % |
| Modos | 16,7 % |

El piloto no demuestra comunicación por ondas útil ni ventaja de rendimiento; las intervenciones de onda no mejoraron el éxito. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no procede inventarlos dado que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- Inferencia y entrenamiento en CPU exclusivamente; el autor indica que no se necesita GPU ni servicios externos.
- Dependencias: Python 3.12 o superior, NumPy, SciPy y PyTorch en versión CPU.
- VRAM estimada: no aplica; el modelo es un grafo de 512 neuronas y el repositorio ocupa 0,0 GB.
- GPU recomendadas: no disponibles; el diseño está pensado para ejecución local en CPU.
- Despliegue: módulo Python instalable con `pip install -e ".[test]"`, servidor local en el puerto 8789 y exportación de informes HTML abribles directamente desde disco.
- Latencia y throughput: el proyecto incorpora benchmarks de latencia en microsegundos y contadores de FLOPs por paso, pero no se publican cifras concretas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Supermix-Aether | 512 neuronas × 32 componentes (total no especificado) | No aplica | 16,7–20,8 % de éxito en el piloto | No disponible | Hugging Face, 0 descargas |
| Modelos comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se identifican en la información proporcionada modelos directamente comparables: Supermix-Aether no es un modelo de lenguaje ni un modelo preentrenado, sino un laboratorio de investigación sobre una arquitectura propia (AETHER/NeuroWave-X), por lo que la comparación con LLM de parámetros similares no sería metodológicamente válida.

## Limitaciones y advertencias

- El propio autor declara que el piloto no demuestra comunicación por ondas útil ni ventaja de rendimiento, y que la promoción del modelo se retiene.
- La comparabilidad de recursos entre protocolos no está establecida: igual número de ejemplos, actualizaciones o parámetros totales no implica igual cómputo, lo que bloquea la promoción incluso en ejecuciones mayores.
- El estudio de treinta semillas está definido pero no ejecutado, y la muestra del piloto es pequeña.
- Las semillas de consulta nuevas son extracciones de las mismas seis tareas, no geometrías nuevas, lo que limita la generalización de los resultados.
- El entrenamiento utiliza transporte limpio; los mecanismos de pérdida, ruido gaussiano, ruido de fase, diafonía, congestión y latencia se prueban de forma independiente, no en el estudio de entrenamiento.
- No se declara licencia, por lo que el uso comercial queda sin autorización explícita y requiere consulta previa al autor.
- No se declaran idiomas soportados ni sesgos conocidos; al no ser un modelo de lenguaje, no aplican riesgos de alucinación textual, pero sí el riesgo de sobreinterpretar resultados experimentales preliminares.
- Cualquier cambio de longitud de entrenamiento, tasa de aprendizaje, semillas o dificultad de la tarea tras inspeccionar resultados debe reportarse como exploración y no como confirmación.
- El repositorio no registra descargas ni interacciones, y su tamaño es de 0,0 GB, lo que sugiere que los artefactos no están incluidos o que el contenido es mínimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kai9987kai/Supermix-Aether
- Perfil del autor: https://huggingface.co/Kai9987kai
- Modelos del autor: https://huggingface.co/Kai9987kai/models
- Documentación del banco de trabajo en vivo (referenciada en la model card): `docs/live-lab.md`
- Informe del piloto preservado (referenciado en la model card): `reports/pilot-2026-11-07/index.html`
- Laboratorio local (referenciado en la model card): http://127.0.0.1:8789
