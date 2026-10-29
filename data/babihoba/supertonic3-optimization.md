# babihoba/supertonic3-optimization

## Resumen

Supertonic 3 Optimization es un paquete de destilación y optimización para inferencia en CPU del modelo de texto a voz Supertonic 3 de Supertone (un TTS open-weight de aproximadamente 99 M de parámetros distribuido en ONNX). Lo publica el usuario babihoba (repo `babihoba/supertonic3-optimization`, 1,2 GB) y su artefacto seleccionado es el estudiante F1200 (`models/round5-original50-student/`), entrenado durante 1200 actualizaciones para reproducir la trayectoria del profesor original FP32 con CFG4 y 50 pasos, pero ejecutando solo ocho iteraciones reales de denoising y un único hilo de CPU.

El problema que resuelve es el coste de inferencia del TTS de difusión: el modelo original necesita 50 pasos con clasificador libre de guía; este estudiante interpola esa trayectoria de 50 pasos sobre una rejilla temporal de 8 pasos y aprende una aproximación, conservando intactos los componentes FP32 de duración, texto y vocoder y aplicando INT8 dinámico de rango reducido únicamente al estimador de vectores. Según las mediciones del autor, el resultado alcanza un RTF mediano de 1,0515 en coreano y 1,0702 en inglés en un núcleo lógico de un EPYC 7551, sin GPU.

Es relevante para quien necesite TTS local en hardware muy limitado (servidores de un solo núcleo, dispositivos sin acelerador), pero conviene tomarlo como un paquete de investigación reproducible más que como un modelo listo para producción: las cifras de calidad son de un piloto de cuatro frases, no hay MOS ni test independiente, y el modo 2x opcional presenta un 26,42 % de CER en coreano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS neural sobre ONNX Runtime; estimador de vectores (student) destilado del profesor Supertonic 3 con componentes FP32 de duración, texto y vocoder sin modificar; el paquete opcional añade retiming latente interno |
| Parámetros totales | No disponible para el estudiante; el modelo base Supertonic 3 declara unos 99 M de parámetros en los activos ONNX públicos. Fichero del estimador de vectores F1200: 48.903.928 bytes |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (TTS; la longitud útil depende de la duración del enunciado y no se publica cifra) |
| Tipos de cuantización | INT8 dinámico de rango reducido en el estimador de vectores; resto de componentes en FP32. No se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | Coreano (etiqueta del repo y muestras de validación) e inglés (mediciones); el modelo base Supertonic 3 declara 31 idiomas. Los metadatos de HuggingFace no listan idiomas |
| Licencia | `other` con `license_name: bigscience-openrail-m` en la model card; los metadatos de HuggingFace indican `bigscience-openrail-m`. Conviene revisar el fichero LICENSE del repo |
| Formato de pesos | ONNX (runtime `onnxruntime`); checkpoints de reproducción en `.pt` (PyTorch) bajo `reproduction/round5/` |

## Arquitectura y entrenamiento

El paquete parte del Supertonic 3 original en FP32 con CFG4 y 50 pasos como único profesor. El estudiante conserva los componentes de duración, texto y vocoder sin cambios y solo sustituye el estimador de vectores por una versión destilada y cuantizada a INT8 dinámico de rango reducido. La trayectoria de 50 pasos del profesor se interpola sobre la rejilla temporal de 8 pasos del estudiante, y el objetivo final es el latente final exacto del original. Se trata, por tanto, de una aproximación aprendida y no de una equivalencia matemática con CFG4 ni con el modelo original.

Los datos de entrenamiento son 640 pares de entrenamiento y 128 de validación procedentes de 80 y 16 frases únicas redactadas por el autor, generadas exclusivamente por el profesor de 50 pasos; no se recogieron trayectorias de test. El checkpoint inicial reutiliza pesos de estudiante existentes y el entrenamiento suma 1200 actualizaciones. El paquete opcional `models/round8-latent-retime-g135/` no reentrena nada: conserva todos los pesos de F1200 y ejecuta ocho llamadas de denoising con duración interna 1,35, redimensionando fotogramas latentes finos de 24 canales dentro del vocoder original para producir voz a 2x, sin filtro de tempo ni de tono sobre la onda y sin cabeza aprendida adicional.

La innovación destacable es de ingeniería más que de modelado: grafo ONNX transformado, runtime propio con entrada `target_frames` para el vocoder, verificación de hashes en el descargador y un kernel AVX2 opcional para Linux que debe compilarse desde el código fuente de GitHub y no se distribuye en el repo. La versión enginev4 reporta ganancias pareadas medianas de 1,042x en coreano y 1,047x en inglés frente a enginev2 con ondas idénticas.

## Capacidades

- Síntesis de voz (texto a voz) en coreano e inglés dentro de este paquete; el modelo base cubre 31 idiomas.
- Inferencia en CPU sin GPU, con un solo hilo lógico y sin API ni nube.
- Ejecución en 8 iteraciones reales de denoising en lugar de las 50 del profesor, manteniendo el latente final del original como objetivo.
- Modo 2x opcional mediante retiming latente interno (`round8-latent-retime-g135`), que no aplica filtros de tempo ni de tono sobre la forma de onda.
- Selección de voz por identificador (por ejemplo `M1` en los ejemplos del autor) y control de velocidad mediante el parámetro `--speed`.
- Etiquetas de expresión simples heredadas del modelo base (`<laugh>`, `<breath>`, `<sigh>`), según la documentación de Supertonic 3.
- No es un modelo de lenguaje: no soporta tool calling, function calling, agentes, razonamiento multi-paso ni visión. Esas capacidades deben considerarse no disponibles.

## Casos de uso

- Lectura de notificaciones y avisos en dispositivos de gama baja: el estudiante corre en un único hilo de CPU con RTF cercano a 1,05, de modo que puede sintetizar frases cortas en tiempo casi real sin acelerador ni conexión.
- Accesibilidad offline (lectura de pantalla para personas con discapacidad visual): al ser ONNX puro y no depender de servicios externos, encaja en aplicaciones de escritorio o terminales que deben funcionar sin red y con presupuesto de memoria de aproximadamente 1 GB.
- Kioscos y sistemas empotrados con CPU x86: el paquete permite generar prompts de voz en local; conviene validar antes el rendimiento en la CPU objetivo, ya que las mediciones del autor son de un EPYC 7551 y no predicen ARM.
- Doblaje o resumen hablado acelerado: el paquete 2x (`--speed 2`) genera voz al doble de duración interna sin filtros de tempo; es adecuado para previsualizaciones y podcasts internos, con la advertencia de que el CER coreano medido sube al 26,42 %.
- Prototipado de asistentes de voz en coreano: el modelo permite iterar sobre guiones y voces con `synthesize.py` y el runtime del proyecto, sin coste de API, aceptando que la calidad no está certificada con MOS.
- Generación de audios de prueba en CI/CD: el script `download_artifacts.py` fija una revisión inmutable y verifica hashes de todos los ficheros, lo que hace reproducible la generación de muestras de audio para tests de regresión de producto.
- Investigación en destilación de trayectorias de difusión: los artefactos de reproducción (`original50-initial.pt`, `original50-step-01200.pt`) y el dataset de 640/128 pares permiten reproducir el experimento y comparar con las variantes E400, B y cfg-mixed.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a un modelo TTS. Los únicos datos cuantitativos publicados son mediciones propias del autor:

| Métrica | Condición | Resultado |
|---|---|---|
| RTF mediano coreano (F1200) | EPYC 7551, 1 núcleo lógico, frases cortas fijas, 3 pares de procesos alternos | 1,0515 (5,594 s) |
| RTF mediano inglés (F1200) | Misma condición | 1,0702 (5,280 s) |
| RTF corto 2x | Paquete `round8-latent-retime-g135` | ~1,35 |
| RTF largo 2x | Paquete `round8-latent-retime-g135` | 1,32–1,33 |
| RTF normal 1x | F1200 sin retiming | ~1,00 |
| Aceleración enginev4 vs enginev2 | Pareada, ondas idénticas | 1,042x coreano / 1,047x inglés |
| CER coreano, 2x | 16 contextos de validación consumidos | 51/193 = 26,42 % |
| WER inglés, 2x | 16 contextos de validación consumidos | 1/96 = 1,04 % |
| CER coreano, 2x nativo F1200 | Referencia de comparación | 133/193 |
| WER inglés, 2x nativo F1200 | Referencia de comparación | 68/96 |
| CER coreano, F1200 normal 1,05 | Referencia de comparación | 5/193 |
| WER inglés, F1200 normal 1,05 | Referencia de comparación | 0/96 |
| Piloto de desarrollo de 4 frases (KO2/EN2) | Original50, B, E400 y F1200 | 0/44 errores de carácter en coreano y 0/20 errores de palabra en inglés |

No existe puntuación MOS, porcentaje de similitud perceptual ni resultado de equivalencia de hablante. El piloto de cuatro frases es demasiado pequeño para sostener afirmaciones generales de calidad y no se ha evaluado un test independiente nuevo de F1200.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU. El host de referencia usado por el autor era un EPYC 7551 con un núcleo lógico y aproximadamente 1 GB de memoria; el monitor de memoria muestreado cada 50 ms no es un límite de cgroup.
- RAM estimada: el paquete completo ocupa 1,2 GB en disco; el fichero del estimador de vectores son 48,9 MB. No se publica una cifra de RSS en inferencia.
- GPU recomendadas: no aplica (no hay ruta GPU documentada). Cualquier GPU solo tendría sentido a través de un backend ONNX Runtime distinto del medido, sin datos publicados.
- ¿Cabe en GPU de consumo? No es el objetivo del paquete; el modelo está pensado para CPU. No hay mediciones en RTX 4090 ni similares.
- Opciones de despliegue: ONNX Runtime con el runtime del proyecto (`download_artifacts.py`, `synthesize.py`), que aporta la entrada `target_frames` del vocoder. El kernel AVX2 opcional para Linux debe compilarse desde el código fuente de GitHub. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y tarea.
- Latencia y throughput: RTF mediano 1,0515 (coreano) y 1,0702 (inglés) con un hilo y sin contar carga ni escritura de ficheros; en modo 2x, RTF ~1,35 en frases cortas y 1,32–1,33 en largas. No hay garantía de tiempo real ni resultados en ARM (la PR histórica de ARM mide el modelo B, no F1200).

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Pasos de inferencia | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Supertonic 3 Optimization F1200 (este repo) | Estimador de 48,9 MB; base ~99 M | Coreano e inglés medidos; base 31 | 8 pasos, 1 hilo de CPU, INT8 dinámico parcial | ONNX / onnxruntime | `other` (bigscience-openrail-m declarada) | HuggingFace, descargas 0, likes 0 |
| Supertonic 3 original (Supertone) | ~99 M | 31 | 50 pasos con CFG4 en la referencia del profesor | ONNX / CPU | Open-weight (términos concretos no disponibles en la información) | HuggingFace `Supertone/supertonic-3`, espejo en ModelScope |
| F1200 preview E400 (mismo repo) | Misma arquitectura que F1200 | Coreano e inglés | 8 pasos | ONNX / onnxruntime | Igual que el paquete | Incluido como comparación de escucha, no es el predeterminado |
| Supertonic 2 | No disponible | 5 | No disponible | No disponible | No disponible | Versión previa citada por la documentación de Supertonic 3 |

Frente a sistemas TTS abiertos de la clase 0,7B–2B, la ventaja declarada del modelo base es el tamaño (99 M), que reduce descarga, arranque e inferencia en dispositivo. No se dispone de comparativas numéricas de calidad con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Calidad no certificada: no hay MOS, ni similitud perceptual, ni test independiente de F1200. Los conjuntos de test existentes ya se han consumido y el piloto de cuatro frases no permite extrapolar.
- Errores sustanciales en coreano en el modo 2x: CER del 26,42 % (51/193) en 16 contextos de validación. El autor lo describe explícitamente como un modelo no exento de omisiones.
- El modo 2x no es una mejora gratuita: frente al 2x nativo de F1200 mejora el CER/WER, pero queda muy lejos del modo normal 1,05 (5/193 en coreano y 0/96 en inglés).
- El estudiante es una aproximación aprendida del profesor CFG4 de 50 pasos; no es matemáticamente idéntico y puede degradar prosodia o pronunciación en entradas fuera de la distribución de las 80 frases de entrenamiento.
- Idiomas: la validación se limita a coreano e inglés. Aunque el modelo base declara 31 idiomas, este paquete no documenta calidad en el resto.
- Ambigüedad de licencia: los metadatos y la model card usan `other` / `bigscience-openrail-m`, mientras que la ficha de HuggingFace muestra `bigscience-openrail-m`. Antes de uso comercial hay que revisar el fichero LICENSE del repo, que no se detalla en la información disponible.
- Reproducibilidad limitada de las mediciones: un solo host (EPYC 7551), un núcleo lógico, memoria de aproximadamente 1 GB y sin límite de cgroup; el autor advierte que no predicen velocidad en ARM y no hay resultados nuevos en ARM para F1200.
- El kernel AVX2 opcional no se distribuye: debe compilarse desde el código fuente, lo que añade fricción al despliegue.
- Sesgos: no se documenta ninguna evaluación de sesgos, género o acento en la información disponible; el corpus es de 80 frases autorales, lo que limita la diversidad lingüística.
- Riesgo de fallos típicos de TTS (repeticiones u omisiones en enunciados cortos y largos): el modelo base declara menos fallos que Supertonic 2, no su eliminación.
- No hay poda ni reentrenamiento previstos tras la selección de F1200; el trabajo posterior se centra en optimizar el motor sobre el modelo fijo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/babihoba/supertonic3-optimization
- Código fuente y registros de experimentos: https://github.com/8954sood/supertonic3-optimization
- Revisión de código citada: https://github.com/8954sood/supertonic3-optimization/tree/13fb103
- Dataset de reproducción: https://huggingface.co/datasets/babihoba/supertonic3-optimization-data/tree/main/round5
- Modelo base Supertonic 3: https://huggingface.co/Supertone/supertonic-3
- Árbol de ficheros del modelo base: https://huggingface.co/Supertone/supertonic-3/tree/main
- Página del proyecto Supertonic 3: https://supertonic3.github.io/
- Espejo en ModelScope: https://www.modelscope.cn/models/Supertone/supertonic-3
- Ficha de terceros: https://openvoxai.com/models/supertonic-3
