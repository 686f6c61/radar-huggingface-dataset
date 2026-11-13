# danielrjackson/synaptic-lens-targets-adder

## Resumen

SYN88 adder development trajectories es un conjunto de artefactos de investigación publicado por Daniel Jackson en Hugging Face. No es un modelo de lenguaje en el sentido convencional, sino una población histórica completa de redes objetivo (target networks) entrenadas de forma independiente para resolver una tarea de suma de dígitos, junto con una regla alternativa, y evaluadas a lo largo de distintas "edades" de entrenamiento. El paquete contiene 2.304 raíces de inicialización independientes, de las cuales 1.536 son de entrenamiento, 256 de validación y 512 de test, y cada raíz cubre ocho puntos de edad (0, 1, 2, 5, 10, 25, 50 y 100), lo que da 36.864 estados guardados.

El interés del artefacto es metodológico: permite estudiar cómo evolucionan las representaciones internas de una red pequeña a lo largo del entrenamiento, comparar trayectorias de reglas emparejadas y reproducir análisis de interpretabilidad mecanicista. Los estados se exportan en formato NumPy NPZ solo para inferencia, sin estado de optimizador ni de RNG, por lo que no permiten reanudar el entrenamiento original. La licencia es de uso exclusivamente académico y de investigación (AI Pubs Research-use RAIL-M 0.1), no una licencia permisiva.

No se dispone de información sobre arquitectura, número de parámetros, longitud de contexto ni idiomas soportados, ya que el autor no los documenta en la model card. El artefacto se publicó el 13 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (redes objetivo para una tarea de suma de dígitos; el autor no especifica la topología) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportaciones numéricas en NPZ, sin cuantización documentada) |
| Idiomas soportados | no disponible |
| Licencia | AI Pubs Research-use RAIL-M 0.1 (uso académico y de investigación; no es permiso no comercial general) |
| Formato de pesos | NPZ (NumPy); exportaciones solo de inferencia, sin estado de optimizador ni RNG |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de las redes. Lo que sí documenta es el diseño experimental: 2.304 raíces de inicialización independientes, repartidas en 1.536 de entrenamiento, 256 de validación y 512 de test. Cada raíz cubre la tarea de suma y una regla alternativa en ocho edades de entrenamiento (0, 1, 2, 5, 10, 25, 50 y 100). Los 36.864 estados guardados no son redes independientes: las reglas emparejadas comparten la inicialización en la edad cero, lo que resulta en 34.560 tensores de estado distintos.

El entrenamiento se realizó desde inicializaciones locales y con etiquetas sintéticas de pares de dígitos; no se incluyen pesos preentrenados externos ni conjuntos de datos de imágenes de terceros. Los archivos NPZ por raíz, bajo `syn88/population`, omiten el estado del optimizador y del generador de números aleatorios, por lo que son exportaciones de solo inferencia y no permiten reanudar el entrenamiento original. El manifiesto `export-manifest.json` registra sumas de comprobación de descarga, identidades de los checkpoints originales y hashes de los manifiestos de soporte. Existe además un fixture de humo de cuatro raíces de test en `syn88/target-smoke.npz`, separado de la población principal. El holdout sellado SYN53 queda excluido.

## Capacidades

- Inferencia sobre una tarea de suma de dígitos mediante `quickstart.py`, que usa únicamente NumPy y permite verificar una raíz seleccionada y evaluar predicciones nativas de la red objetivo.
- Evaluación de una regla alternativa emparejada con la suma, con inicialización compartida en la edad cero.
- Análisis de trayectorias de entrenamiento en ocho puntos de edad, útil para estudiar evolución de representaciones.
- Reproducción de análisis de interpretabilidad mecanicista sobre redes pequeñas de laboratorio.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas avanzadas, visión, audio, tool calling ni agentes.
- No se documentan capacidades multilingües.

## Casos de uso

- Estudio de interpretabilidad mecanicista: cargar una raíz concreta y analizar cómo cambian los tensores de estado entre edades (0, 1, 2, 5, 10, 25, 50 y 100) para trazar la formación de circuitos internos en una tarea controlada de suma.
- Investigación sobre plasticidad y olvido: comparar las trayectorias de la suma y de la regla alternativa, que comparten inicialización en la edad cero, para medir hasta qué punto la especialización diverge a partir de un mismo punto de partida.
- Reproducibilidad de experimentos: usar `export-manifest.json` para verificar checksums e identidades de checkpoints originales antes de publicar resultados, garantizando que se cita la revisión exacta descargada.
- Docencia y formación: emplear el fixture de humo de cuatro raíces (`syn88/target-smoke.npz`) como ejemplo mínimo de carga y evaluación con NumPy en cursos de aprendizaje automático.
- Validación de pipelines de evaluación: usar las particiones de entrenamiento, validación y test documentadas para probar herramientas de análisis sin filtrar edades correlacionadas ni trayectorias de reglas emparejadas entre particiones.
- Auditoría de artefactos de investigación: revisar la separación entre el corpus SYN88 y el holdout sellado SYN53 para reproducir protocolos de evaluación que respeten el aislamiento de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño de los tensores no se documenta en la model card.
- GPU recomendadas: no disponible; el quickstart usa únicamente NumPy y puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño de los estados; el script de referencia no requiere aceleración por hardware.
- Opciones de despliegue: carga directa de archivos NPZ con NumPy mediante `quickstart.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| danielrjackson/synaptic-lens-targets-adder | no disponible | no disponible | AI Pubs Research-use RAIL-M 0.1 | Hugging Face (0 descargas) |
| danielrjackson/synaptic-lens-adder | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face (familia Lens emparejada) |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse ni desplegarse como tal; su ámbito es una tarea sintética de suma de dígitos.
- Los estados exportados son solo de inferencia; no incluyen estado de optimizador ni de RNG, por lo que no permiten reanudar el entrenamiento original.
- Las raíces de test históricas ya se usaron en análisis previos y ahora se publican, de modo que no constituyen holdouts ciegos frescos.
- Riesgo de fuga en nuevas evaluaciones: deben evitarse particiones que separen edades correlacionadas o trayectorias de reglas emparejadas.
- La licencia RAIL-M/RAIL-S 0.1 restringe el uso a fines académicos y de investigación; no concede permiso no comercial general. Cualquier uso comercial requiere revisión legal específica.
- El autor advierte que son artefactos de investigación y no sistemas de seguridad crítica validados.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el artefacto no opera sobre texto libre.
- La cita debe incluir a Daniel Jackson y la revisión exacta descargada junto con los hashes de exportación.

## Enlaces

- Hugging Face: https://huggingface.co/danielrjackson/synaptic-lens-targets-adder
- Repositorio de código (baseline): https://github.com/danielrjackson/synaptic-lens/tree/544d54c22ca053e537c84f894fe207de8d178145
- Licencia del modelo: https://github.com/danielrjackson/synaptic-lens/blob/544d54c22ca053e537c84f894fe207de8d178145/LICENSE-MODEL.md
- Modelo de la familia Lens emparejada: https://huggingface.co/danielrjackson/synaptic-lens-adder
