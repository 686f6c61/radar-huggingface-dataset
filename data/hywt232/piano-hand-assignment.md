# hywt232/piano-hand-assignment

## Resumen

piano-hand-assignment es un modelo de asignación de manos para partituras MIDI de piano: recibe un fichero MIDI con notas sin etiquetar y decide, para cada nota, si corresponde a la mano derecha o a la izquierda. Lo publica el usuario hywt232 en Hugging Face, con el código de referencia en el repositorio de GitHub haveyouwantto/piano-hand-assignment. No es un modelo de lenguaje: es un componente especializado de recuperación de información musical (MIR) que resuelve un problema concreto de preprocesado para transcripción, edición y análisis de partituras.

El modelo no es una red única, sino un ensemble de dos checkpoints de PyTorch: una LSTM bidireccional de 2 capas con dimensión oculta 192 (1,58 M de parámetros) y un encoder Transformer de 4 capas, dimensión 192 y 4 cabezas de atención (1,75 M de parámetros). En inferencia se promedian las distribuciones de probabilidad de ambos. El tamaño reducido permite ejecutarlo en CPU en milisegundos por pieza.

Su relevancia práctica está en la calidad reportada: 94,30 % de exactitud y F1 de cambio de mano de 0,918 en un split reservado de PDMX (2,0 M de notas), y 95,91 % de exactitud y 0,927 de F1 en piezas de Yamaha Disklavier nunca vistas, lo que sugiere buena generalización fuera del dominio de entrenamiento. La licencia MIT facilita su integración en productos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de LSTM bidireccional (2 capas, d=192) y Transformer encoder (4 capas, d=192, 4 cabezas) |
| Parámetros totales | 1,58 M (LSTM) + 1,75 M (Transformer) = 3,33 M en total |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (secuencia de notas MIDI; no se especifica límite) |
| Tipos de cuantización | no disponible (checkpoints PyTorch en fp32 por defecto) |
| Idiomas soportados | no disponible (no aplica: entrada MIDI, salida etiquetas de mano) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.pt`) con estructura `{"arch": ..., "state": state_dict, "args": ...}` |

## Arquitectura y entrenamiento

El sistema combina dos arquitecturas secuenciales sobre la representación de eventos de nota del MIDI. La LSTM bidireccional de 2 capas captura dependencias locales y de medio alcance en la secuencia de notas; el Transformer encoder de 4 capas y 4 cabezas modela relaciones de mayor alcance mediante autoatención. Las probabilidades de ambos modelos se promedian en inferencia, lo que reduce la varianza respecto a usar uno solo.

El entrenamiento usa 30.382 partituras de piano a dos manos derivadas de PDMX (MusicXML de MuseScore), con un total de 20,4 M de notas. Las etiquetas de mano provienen del número de pentagrama de la partitura original, es decir, es aprendizaje supervisado con anotación derivada de la propia estructura de la partitura, no anotación manual nota a nota. La model card no documenta uso de RLHF, DPO ni aumentación de datos.

## Capacidades

- Asignación de mano derecha o izquierda a cada nota de un fichero MIDI de piano.
- Procesamiento de piezas a dos manos completas, con salida en MIDI con las notas etiquetadas por mano.
- Ensemble de dos arquitecturas complementarias (recurrente y atención) para mayor robustez.
- Generalización a dominios no vistos: el modelo rinde mejor en el conjunto Disklavier que en el split de PDMX.
- Ejecución ligera: 3,33 M de parámetros en total, viable en CPU.
- No soporta tool calling, agentes, visión, audio ni generación de texto; no es un modelo multimodal ni conversacional.
- No se documentan capacidades multilingües (no aplica a la tarea).

## Casos de uso

- Preprocesado para transcripción automática: antes de generar una partitura a partir de audio, asignar cada nota detectada a una mano permite producir notación a dos pentagramas legible por músicos.
- Edición y limpieza de MIDI: ficheros exportados de DAW o de fuentes no estándar suelen carecer de separación de manos; el modelo la reconstruye para su uso en software de notación.
- Generación musical condicionada por mano: pipelines que generan acompañamiento o melodía necesitan saber qué notas pertenecen a cada mano para mantener la coherencia física de la interpretación.
- Análisis musicológico a escala: con 3,33 M de parámetros y ejecución en CPU, se pueden procesar corpus completos de miles de piezas para estudiar patrones de distribución de manos por época o estilo.
- Entrenamiento de modelos de digitación: la asignación de mano es una etapa previa a la asignación de dedos; este modelo proporciona la etiqueta de mano que alimenta el siguiente paso.
- Herramientas interactivas de práctica pianística: una aplicación que muestra la partitura y resalta la mano activa puede usar el modelo para etiquetar partituras subidas por el usuario en tiempo real.
- Evaluación de sistemas de transcripción: sirve como componente de referencia para medir la coherencia de la separación de manos en pipelines de transcripción de audio a partitura.

## Benchmarks y rendimiento

| Conjunto de prueba | Exactitud (%) | F1 de cambio de mano |
|---|---|---|
| Split reservado de PDMX (2,0 M de notas) | 94,30 | 0,918 |
| Piezas de Yamaha Disklavier (dominio no visto) | 95,91 | 0,927 |

No se han publicado resultados de benchmarks adicionales (comparativas con otros modelos de asignación de manos, latencia o throughput) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB; los 3,33 M de parámetros ocupan unos 13 MB en fp32.
- GPU recomendadas: no se requiere GPU; cualquier GPU con CUDA es suficiente, incluidas GTX 1050 o superiores. En CPU el coste por pieza es de milisegundos a pocos segundos según la longitud.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo mediante el paquete `piano_hand_assignment` del repositorio de GitHub; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de asignación de manos para piano MIDI en la documentación proporcionada. La model card no incluye comparativas con alternativas, y la búsqueda web no devolvió resultados relevantes.

| Modelo | Parámetros | Contexto | Exactitud | Licencia |
|---|---|---|---|---|
| piano-hand-assignment (LSTM + Transformer) | 3,33 M | no disponible | 94,30 % (PDMX) / 95,91 % (Disklavier) | MIT |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo cubre piano a dos manos; no está diseñado para órganos, teclados de tres pentagramas ni instrumentos polifónicos de otra índole.
- Las etiquetas de entrenamiento proceden del número de pentagrama de PDMX, lo que puede introducir sesgos hacia las convenciones de notación de MuseScore y de la música clásica occidental.
- Riesgo de error en pasajes con cruce de manos, contrapunto denso o notación atípica; la exactitud del 94-96 % implica entre 4 y 6 errores por cada 100 notas.
- No se documentan sesgos por género musical, época o estilo; la evaluación se limita a PDMX y Disklavier.
- No hay información sobre el comportamiento con MIDI en vivo (con timing humano irregular) frente a MIDI secuenciado.
- La licencia MIT permite uso comercial sin restricciones, pero no se ofrece garantía ni soporte por parte del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento activo.
- La fecha de creación indicada (2026-10-26) es futura respecto a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hywt232/piano-hand-assignment
- Repositorio de código: https://github.com/haveyouwantto/piano-hand-assignment
- No se han encontrado otros enlaces relevantes (papers, blogs, demos) en la búsqueda web.
