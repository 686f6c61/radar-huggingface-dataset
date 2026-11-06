# Audante/spleeter-pytorch-npz

## Resumen

Spleeter PyTorch NPZ es una conversión no oficial de los pesos preentrenados del modelo Spleeter de Deezer, originalmente distribuidos como checkpoints de TensorFlow y aquí reempaquetados como arrays de NumPy (`.npz`) para su uso en implementaciones de PyTorch. El autor del repositorio es Audante y el artefacto se publica bajo licencia MIT, la misma del proyecto original. No se trata de un modelo de lenguaje ni de un transformer generativo: es un sistema de separación de fuentes musicales (source separation) que descompone una mezcla de audio en 2 o 4 pistas (voces, batería, bajo y otros).

El problema que resuelve es práctico: permitir que proyectos basados en PyTorch carguen los pesos de Spleeter sin depender del stack de TensorFlow, que es el entorno nativo del release de Deezer. Al convertir los checkpoints a `.npz` y no reentrenar, se preservan los pesos originales y se facilita la portabilidad entre frameworks. El repositorio ocupa aproximadamente 0,2 GB, coherente con los dos conjuntos de pesos (2 stems y 4 stems) en formato NumPy comprimido.

La relevancia de esta ficha es acotada: no hay model card detallada, no se declaran idiomas ni pipeline en Hugging Face, y el repositorio no registra descargas ni likes en el momento de la consulta. Es un artefacto de conversión de pesos, útil para quien quiera integrar Spleeter en un pipeline de audio con PyTorch, pero sin garantías de mantenimiento ni soporte oficial por parte de Deezer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los pesos provienen de Spleeter de Deezer; la model card no detalla la topología interna en este repositorio) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en arrays NumPy `.npz`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico; opera sobre señales de audio) |
| Licencia | MIT |
| Formato de pesos | `.npz` (arrays NumPy convertidos desde checkpoints de TensorFlow) |

## Arquitectura y entrenamiento

La model card de este repositorio no describe la arquitectura interna. Lo único documentado es el proceso de conversión: los checkpoints de TensorFlow del Spleeter original de Deezer se transformaron en arrays de NumPy empaquetados en `.npz`, sin reentrenamiento. Por tanto, las capacidades y el comportamiento del modelo son los del Spleeter preentrenado de Deezer, no los de un modelo nuevo.

No se especifican en la información disponible el número de tokens de entrenamiento (no aplica, es audio), la composición del dataset, ni si hubo etapas de ajuste fino adicionales. Tampoco se documentan innovaciones técnicas propias de esta conversión más allá del cambio de formato de serialización de pesos. Cualquier detalle sobre la arquitectura de Spleeter (tipo de red, capas, espectrogramas de entrada) debe consultarse en el repositorio original de Deezer, no en esta ficha.

## Capacidades

- Separación de fuentes musicales en 2 stems: típicamente voces e instrumental.
- Separación de fuentes musicales en 4 stems: voces, batería, bajo y otros.
- Carga de pesos en entornos PyTorch mediante arrays NumPy, evitando la dependencia de TensorFlow.
- Verificación de integridad de ficheros mediante `SHA256SUMS`, cuando está presente.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión ni audio generativo; la entrada es audio y la salida son pistas separadas.

## Casos de uso

- Karaoke y eliminación de voces: cargar los pesos de 2 stems en un script de PyTorch para obtener la pista instrumental a partir de una canción, útil en aplicaciones de karaoke o edición doméstica.
- Producción musical y remezclas: separar una mezcla en 4 stems (voces, batería, bajo, otros) para aislar componentes y reutilizarlos en una nueva mezcla o en un proceso de masterización.
- Creación de datasets de audio: generar pares (mezcla, stems) a partir de un catálogo musical para entrenar o evaluar otros modelos de separación de fuentes.
- Análisis musical y musicología computacional: extraer la pista de bajo o batería para estudiar patrones rítmicos o armonías sin necesidad de transcripción manual.
- Preprocesado en pipelines de PyTorch: integrar la separación como paso previo en un flujo de procesamiento de audio ya escrito en PyTorch, aprovechando que los pesos están en `.npz` y no requieren TensorFlow.
- Educación y experimentación: reproducir el comportamiento de Spleeter en un entorno PyTorch para comparar implementaciones o estudiar el funcionamiento de la separación de fuentes con pesos preentrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 0,2 GB, lo que sugiere que los pesos caben holgadamente en memoria de GPU de consumo, pero no se documenta el consumo en ejecución.
- GPU recomendadas: no disponible; al no documentarse requisitos, no se puede confirmar compatibilidad con A100, H100 o RTX 4090 más allá de que el tamaño de los pesos es reducido.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por el tamaño del repositorio (0,2 GB) es plausible, pero no se aportan datos de VRAM en inferencia.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo de audio); el uso previsto es cargar los `.npz` en una implementación de PyTorch.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Stems | Formato de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Audante/spleeter-pytorch-npz | Separación de fuentes (conversión de Spleeter) | 2 y 4 | `.npz` (NumPy) | MIT | Hugging Face, sin descargas registradas |
| Deezer Spleeter (original) | Separación de fuentes | 2, 4 y 5 | Checkpoints TensorFlow | MIT | Repositorio GitHub de Deezer |
| Demucs (Meta) | Separación de fuentes | 4 (y variantes) | PyTorch | MIT | GitHub y Hugging Face |
| Open-Unmix (SigSep) | Separación de fuentes | Variable según modelo | PyTorch | MIT | GitHub |

La comparativa se limita a la categoría de separación de fuentes; no se dispone de datos de rendimiento (SDR, SI-SDR) en la información proporcionada para establecer una comparación cuantitativa con Demucs u Open-Unmix.

## Limitaciones y advertencias

- Es una conversión no oficial: la model card indica explícitamente que no es un release oficial de Deezer y que todos los derechos del modelo permanecen con sus autores.
- No hay reentrenamiento: los pesos son los de Spleeter original, por lo que hereda sus limitaciones de calidad y generalización sin mejoras.
- La model card no documenta arquitectura, parámetros, rendimiento ni requisitos de hardware; cualquier evaluación técnica debe hacerse sobre el repositorio original de Deezer.
- No se declaran idiomas ni pipeline en Hugging Face, y el repositorio no registra descargas ni likes, lo que dificulta validar su uso en producción.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de artefactos de separación (sangrado entre stems, pérdida de detalle) inherente al modelo subyacente.
- Licencia MIT permite uso comercial, pero al ser una conversión no oficial conviene verificar la licencia y atribución del proyecto original de Deezer antes de redistribuir.
- No se documenta soporte de cuantización ni optimizaciones de inferencia; el rendimiento dependerá de la implementación de PyTorch que consuma los `.npz`.

## Enlaces

- Hugging Face: https://huggingface.co/Audante/spleeter-pytorch-npz
- Repositorio original de Spleeter (Deezer): https://github.com/deezer/spleeter
- Licencia del repositorio: `LICENSE` incluido en el propio repositorio de Hugging Face
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales específicos de esta conversión.
