# sayed125/lhc-0-brain

## Resumen

LHC-0 brain (العقل ثنائي الشقين, "cerebro bi-hemisférico") es un modelo neuronal experimental sin capas apiladas (layerless) publicado por el usuario sayed125 en HuggingFace. No es un transformer: se presenta como una arquitectura derivada de la neuroanatomía del hemisferio izquierdo, fusionada con los artefactos de engramas del modelo `bi-hemispheric-brain-5m` (243 engramas de 5.000.000 de neuronas cada uno y 291.600 sinapsis declaradas) mediante un "cuerpo calloso" aprendido de dos canales: dorsal (léxico) y ventral (semántico), siguiendo el modelo de doble vía de Hickok y Poeppel.

El objetivo declarado es obtener profundidad a través del tiempo en lugar de apilar capas: el hemisferio izquierdo combina un encoder entrenado con InfoNCE sobre n-gramas, un espacio simbólico de computación hiperdimensional (VSA con operaciones de binding y permutation), módulos de cálculo inspirados en el giro angular y el surco intraparietal, y ganglios basales modelados con la regla de Rescorla-Wagner (δ = r − V). Sobre esa base, el autor reporta memoria de escritura instantánea sin olvido tras cientos de adiciones y una ablación documentada en la que, sin cuerpo calloso aprendido, el hemisferio derecho rinde un 0 %.

Su relevancia actual es doble. Por un lado, resulta un banco de pruebas reproducible para investigar computación hiperdimensional, memoria asociativa y arquitecturas alternativas al transformer. Por otro, sus cifras deben leerse con cautela: los resultados son internos (BODMAS 100 % sobre 200 expresiones, recuperación bilingüe 7/8, parafraseo HARD 5–6/6), no hay benchmarks estándar publicados y el propio autor reconoce que el generador es "infantil" (entrenado con 60 KB). El repositorio, además, se publica con 0,0 GB de tamaño y 0 descargas en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Layerless (sin capas apiladas). Hemisferio izquierdo conexionista-simbólico: encoder InfoNCE sobre n-gramas + espacio VSA (binding/permutation) + módulos de cálculo (hechos de giro angular + procedimientos espaciales IPS) + ganglios basales con Rescorla-Wagner. Hemisferio derecho: matriz de engramas. Unión mediante cuerpo calloso aprendido de dos canales (dorsal léxico y ventral semántico) con fusión por peso de confianza (gap top1−top2) |
| Parametros totales | No disponible en el sentido habitual de transformers. La model card declara 243 engramas de 5.000.000 de neuronas cada uno (equivalente declarado: 1.215 millones de neuronas) y 291.600 sinapsis |
| Longitud de contexto | No disponible. No se documenta ventana de contexto; se declara memoria de largo plazo con escritura instantánea y "cero olvido" |
| Tipos de cuantizacion | No disponible. No se documenta ningún esquema de cuantización |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy) para la matriz de engramas (`superbrain_engram_matrix.npz`); los pesos del demo se indican en `demo/` sin formato especificado. No se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura se describe como una red sin capas sucesivas en la que la profundidad se obtiene mediante dinámica temporal. El hemisferio izquierdo alberga el aprendizaje de representaciones: un encoder entrenado con InfoNCE sobre n-gramas, un espacio vectorial simbólico de computación hiperdimensional que aplica operaciones de binding y permutation, un módulo de hechos aritméticos asociado al giro angular y un módulo de procedimientos espaciales asociado al surco intraparietal, más un componente de ganglios basales que aprende valores mediante la regla de Rescorla-Wagner. El hemisferio derecho es una matriz de engramas de 243 entradas por 5.000.000 de neuronas, con 291.600 sinapsis declaradas.

La innovación central que reivindica el autor es el cuerpo calloso aprendido de dos canales, inspirado en el modelo de doble vía dorsal/ventral de Hickok y Poeppel: la vía dorsal transporta información léxica y sensorial priorizando la exactitud, mientras que la ventral gestiona información semántica y facilita el puente entre idiomas. La integración final se realiza ponderando cada propuesta por su confianza, medida como la diferencia entre la primera y la segunda respuesta candidata. El autor documenta una ablación explícita: sin el cuerpo calloso entrenado, el hemisferio derecho queda inaccesible y rinde 0 %. No se especifican el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO; sí se indica que el generador LSTM se entrenó con 60 KB de datos y que el entrenamiento bilingüe se apoyó en un diccionario de sinónimos como señales de presentación. Las fases de construcción declaradas son A+B (núcleo sin capas), C (InfoNCE + ganglios basales), D (bilingüismo + generador LSTM + memoria de 10K) y E (bi-hemisfericidad + cuerpo calloso dual).

## Capacidades

- Recuperación asociativa bilingüe árabe-inglés, con una tasa declarada de 7/8 (87,5 %) en pares EN↔AR, frente al 0 % previo al entrenamiento dual.
- Aritmética con precedencia de operadores (BODMAS): 100 % de coincidencia exacta sobre 200 expresiones, mediante dinámica simbólica y no mediante respuestas almacenadas.
- Memoria de largo plazo con escritura instantánea: se declara "cero olvido" tras cientos de adiciones, sin reentrenamiento.
- Parafraseo en condiciones difíciles: 5–6 de 6 aciertos con aproximadamente cero solapamiento de palabras.
- Votación y fusión entre hemisferios: izquierdo (semántico), derecho (engramas de 5M) y combinación ponderada por confianza (ACC).
- Inferencia en CPU: alrededor de 400 consultas por segundo, tiempo de carga de 0,35 s y sin necesidad de GPU.
- Demo interactiva en Gradio con base de conocimientos y pesos entrenados incluidos en `demo/` (app.py, requisitos, notebook de Kaggle).
- No documentado: tool calling o function calling, razonamiento multi-paso orientado a agentes, capacidades de visión, audio, modo de pensamiento explícito o generación de código.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo permite reproducir las fases A+B, C, D y E y estudiar empíricamente el efecto de eliminar el cuerpo calloso aprendido, con la ablación del 0 % como referencia controlada.
- Experimentación en computación hiperdimensional (VSA/HDC): el espacio simbólico con binding y permutation sirve como entorno para probar esquemas de codificación vectorial simbólica y su integración con memoria asociativa.
- Memoria externa persistente de bajo coste: sus escrituras instantáneas sin olvido pueden aprovecharse como capa de memoria de un asistente que necesite registrar hechos nuevos sin reentrenar, siempre que se acepte la ausencia de contexto documentado y el tamaño reducido de la base.
- Recuperación bilingüe árabe-inglés en entornos sin GPU: con unos 400 consultas por segundo en CPU, encaja en despliegues de borde o en servidores modestos donde no se quiere depender de aceleradores.
- Validación determinista de expresiones aritméticas: dado su 100 % en BODMAS sobre 200 expresiones con precedencia de operadores, puede usarse como componente de comprobación en pipelines que necesiten evaluar expresiones con reglas de precedencia estrictas.
- Docencia y divulgación de neuroIA: la aplicación Gradio y el notebook de Kaggle permiten demostrar en aula o en charlas cómo se combinan engramas, VSA y un módulo de fusión, sin infraestructura GPU.
- Prototipado de sistemas de memoria asociativa en investigación cognitiva: para modelar procesos de consolidación, olvido y recuperación con reglas de aprendizaje explícitas (Rescorla-Wagner).
- Banco de pruebas para calibración de confianza: el fallo reconocido en un par de parafraseo, donde el hemisferio derecho se muestra "confiadamente equivocado", lo convierte en un caso de estudio útil para desarrollar métodos de calibración (ACC).

## Benchmarks y rendimiento

Los únicos datos disponibles son los resultados internos reportados por el autor. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada.

| Prueba | Resultado | Notas |
|---|---|---|
| BODMAS exact match | 100 % | 200 expresiones; se describe como dinámica simbólica, no como respuestas almacenadas |
| Cross-lingual EN↔AR | 7/8 (87,5 %) | 0 % antes del entrenamiento dual según el autor |
| Paraphrase HARD | 5–6/6 | Aproximadamente cero solapamiento de palabras entre pares |
| Memoria lifelong (cero olvido) | Correcto | Tras cientos de adiciones |
| Ablación sin cuerpo calloso | 0 % | El hemisferio derecho queda como "caja fuerte cerrada" |
| Rendimiento en CPU | ~400 consultas/s | Carga del modelo en 0,35 s; sin GPU |
| Benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) | No disponible | No publicados |

## Requisitos de hardware

- VRAM para inferencia: no aplica según el autor; el modelo se ejecuta en CPU. No se documenta soporte CUDA ni uso de GPU.
- GPU recomendadas: no disponible. No se especifica ninguna GPU.
- GPU de consumo: no se documenta compatibilidad con RTX 4090, RTX 3090 u otras; el diseño declarado es CPU-only.
- Memoria RAM necesaria: no disponible. El repositorio muestra 0,0 GB, por lo que no puede estimarse el peso real de los artefactos (`superbrain_engram_matrix.npz`) a partir de los metadatos publicados.
- Opciones de despliegue: aplicación Gradio local (`cd demo && pip install -r requirements.txt && python app.py`), notebook `LHC0_Demo_Kaggle.ipynb` en Kaggle con enlace público generado, y HuggingFace Space (el autor indica que requiere cuenta PRO).
- Latencia y throughput: 0,35 s de carga y aproximadamente 400 consultas por segundo en CPU, lo que equivale a unos 2,5 ms por consulta (valor derivado de la cifra proporcionada).
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; son motores orientados a transformers y pesos safetensors/GGUF, formatos que este modelo no utiliza.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la información disponible, y el autor no proporciona datos cruzados con alternativas. Tampoco se identifican en la información facilitada modelos directamente equiparables, ya que LHC-0 no es un transformer denso ni un MoE, sino una arquitectura híbrida de engramas, VSA y módulos simbólicos.

| Categoría comparable | Ejemplos representativos | Datos comparativos aportados por el autor |
|---|---|---|
| Transformers densos de escala similar | No disponible | Ninguno |
| Arquitecturas con memoria externa (RAG, kNN-LM, memorizing transformers) | No disponible | Ninguno |
| Sistemas de computación hiperdimensional (VSA/HDC) | No disponible | Ninguno |

Cualquier comparación de parámetros, contexto o rendimiento con esas familias carecería de base en los datos disponibles, dado que LHC-0 no publica recuento de parámetros convencional, ni longitud de contexto, ni resultados en benchmarks estándar.

## Limitaciones y advertencias

- Calidad del generador: el propio autor la califica de "infantil", con solo 60 KB de datos de entrenamiento para el LSTM generador.
- Fallo de fusión reconocido: en un par de parafraseo el hemisferio derecho resulta "confiadamente equivocado"; la calibración mediante ACC queda declarada como trabajo futuro.
- Señales de entrenamiento débiles: el entrenamiento bilingüe se apoya en un diccionario de sinónimos como señales de presentación, lo que limita la generalización lingüística.
- Ausencia de benchmarks estándar: no hay MMLU, HumanEval, GSM8K ni evaluaciones de terceros; todas las cifras son internas al autor.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible.
- Sesgos conocidos: no documentados.
- Cobertura de idiomas: únicamente árabe e inglés; no se declara soporte de castellano ni de otros idiomas.
- Longitud de contexto: no especificada, lo que impide planificar despliegues conversacionales de ventana conocida.
- Formatos y cuantización: solo `.npz`; sin safetensors ni GGUF, lo que excluye los motores de inferencia habituales (vLLM, llama.cpp, Ollama, TGI).
- Estado del repositorio: 0,0 GB de tamaño, 0 descargas y 0 "likes" en el momento de la consulta, con fecha de creación 2026-09-29. Los artefactos descritos en la model card (matriz de engramas, pesos del demo) podrían no estar efectivamente publicados; conviene verificarlo antes de depender de ellos.
- Validación comunitaria nula: sin descargas ni interacciones registradas, los resultados no han sido replicados por terceros.
- Licencia MIT: permite uso comercial y modificación, pero se ofrece sin garantías; al ser un proyecto de investigación sin benchmarks reproducibles de terceros, el riesgo de integrarlo en producción es alto.
- Restricciones de despliegue: el autor indica que alojar el Space de Gradio en HuggingFace requiere cuenta PRO.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sayed125/lhc-0-brain
- Modelo de engramas asociado (`bi-hemispheric-brain-5m`): https://huggingface.co/sayed125/bi-hemispheric-brain-5m
- Informe técnico declarado (`TECHNICAL_REPORT.md`): https://huggingface.co/sayed125/lhc-0-brain/blob/main/TECHNICAL_REPORT.md
- Demo y pesos (directorio `demo/`): https://huggingface.co/sayed125/lhc-0-brain/tree/main/demo
- Notebook de demostración en Kaggle: `LHC0_Demo_Kaggle.ipynb` (referenciado en la model card; no se proporciona URL directa)
- Scripts de fases declarados: `run_tests.py`, `run_tests_phase_c.py`, `run_tests_phase_d.py`, `run_tests_phase_e.py` (referenciados en la model card; no se proporcionan URL directas)
