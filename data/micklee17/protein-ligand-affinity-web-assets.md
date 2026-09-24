# micklee17/protein-ligand-affinity-web-assets

## Resumen

`micklee17/protein-ligand-affinity-web-assets` no es un modelo de lenguaje ni un modelo nuevo entrenado: es un repositorio de activos binarios inmutables que da soporte al sitio web del proyecto HKMU AI4S Lab "protein-ligand-affinity" (proyecto UGC/FDS16/E16/23). El repositorio contiene un único fichero de pesos y dos tensores de entrada de rejilla molecular, con el código fuente del sitio y los manifiestos de inferencia validados mantenidos en otro repositorio de GitHub.

El fichero principal, `54ee06307f6dc6b27bf8894ebe5944d010aef4c9e05e8336e6a01b7ca01975d1.bin` (891.289.600 bytes), es un inicializador FP32 sin modificar exportado del checkpoint completo de cribado MAO-B DL-FSG/Fusion. Los otros dos ficheros, `1hsg-grid.bin` y `1hvr-grid.bin` (12.386.304 bytes cada uno), son entradas preparadas para el modelo externo GNINA `crossdock_default2018`, generadas a partir de los complejos cristalográficos 1HSG y 1HVR con libmolgrid 0.5.5. Ninguno de los tres ficheros es un modelo entrenado nuevo ni una medida experimental.

Su relevancia es de reproducibilidad y trazabilidad: el sitio web fija un commit completo del repositorio, verifica el recuento de bytes y el SHA-256 de cada fichero antes de la inferencia y cachea las descargas completadas en el navegador del visitante, de modo que los ficheros solo se descargan cuando el visitante inicia explícitamente el análisis correspondiente. La publicación de estos activos fue autorizada por el propietario de la investigación el 25 de septiembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada; los pesos proceden de un checkpoint de cribado MAO-B DL-FSG/Fusion (fusión de secuencias químicas y rejillas moleculares) descrito en el artículo con DOI 10.1051/bioconf/202623202002 |
| Parámetros totales | No disponible de forma explícita. Derivado del tamaño del fichero FP32: 891.289.600 bytes / 4 bytes por parámetro ≈ 222,8 millones de parámetros (estimación, no confirmada por el autor) |
| Parámetros activos | No aplicable (no se describe una arquitectura de mezcla de expertos) |
| Longitud de contexto | No aplicable (modelo de predicción estructura-actividad, no generativo) |
| Tipos de cuantización | No disponible; el peso publicado es un inicializador FP32 sin cuantizar. El sitio web distribuye además ficheros ONNX más pequeños y arrays de pesos, cuyos formatos no se detallan |
| Idiomas soportados | No aplicable (entradas químicas y estructurales, no texto) |
| Licencia | No disponible en la ficha de HuggingFace. Se conserva el aviso BSD-3-Clause de MCANet en `FUSION-UPSTREAM-LICENSE.txt`, que según el autor "no es una licencia general para materiales de investigación no relacionados" |
| Formato de pesos | `.bin` (inicializador FP32 con nombre basado en el hash de contenido SHA-256); los dos ficheros de rejilla son tensores de entrada `.bin` para GNINA |
| Número de ficheros | 3, todos con SHA-256 declarado |
| Tamaño del repositorio | 0,9 GB |
| Pipeline declarado en HuggingFace | No disponible |
| Idiomas declarados (tag) | No disponibles; único tag presente: `region:us` |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 24 de septiembre de 2026 / 24 de septiembre de 2026 |

Detalle de los ficheros declarados:

| Fichero | Bytes | SHA-256 |
|---|---:|---|
| `54ee06307f6dc6b27bf8894ebe5944d010aef4c9e05e8336e6a01b7ca01975d1.bin` | 891.289.600 | `54ee06307f6dc6b27bf8894ebe5944d010aef4c9e05e8336e6a01b7ca01975d1` |
| `1hsg-grid.bin` | 12.386.304 | `d751536593597e4002254a76f3b149954242e9daf4eda173a6237992cfa41fe9` |
| `1hvr-grid.bin` | 12.386.304 | `32bfe625f20b4f926679878ee75bad1a30133c10f5861e80afb9907f256e3022` |

## Arquitectura y entrenamiento

La información disponible no documenta la topología interna del checkpoint (número de capas, tipo de bloque, mecanismo de atención ni dimensionalidad). Lo único verificable es su procedencia: es un inicializador FP32 "sin cambios" exportado del checkpoint completo de cribado MAO-B del proyecto, cuyo enfoque metodológico se describe en el artículo "Deep learning on the fusion of chemical sequences and molecular grids" (DOI 10.1051/bioconf/202623202002). No se indican tokens de entrenamiento, composición del dataset, ni etapas de RLHF, DPO o ajuste por preferencias, que en cualquier caso no aplicarían a este dominio.

Tampoco se describe ninguna innovación de inferencia (decodificación especulativa, atención lineal u otras) porque el artefacto es un volcado de pesos, no un runtime. Los dos ficheros de rejilla sí tienen un origen técnico concreto: son tensores de entrada preparados para el modelo externo GNINA `crossdock_default2018` a partir de los complejos 1HSG y 1HVR mediante libmolgrid 0.5.5. El autor insiste en que estos son tensores de entrada, no medidas experimentales ni modelos entrenados nuevos.

## Capacidades

- Almacenar y distribuir un inicializador FP32 completo para el cribado de afinidad proteína-ligando del proyecto MAO-B DL-FSG/Fusion.
- Servir de fuente de pesos para los ficheros ONNX y arrays de pesos más pequeños distribuidos con el sitio web.
- Aportar dos tensores de rejilla (`1hsg-grid.bin`, `1hvr-grid.bin`) compatibles con el modelo externo GNINA `crossdock_default2018`.
- Permitir verificación de integridad por contenido: cada fichero se identifica por su SHA-256 y su recuento exacto de bytes.
- Soportar la fijación (pinning) de un commit completo del repositorio para garantizar reproducibilidad de la inferencia.
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni de razonamiento multi-paso.
- No dispone de capacidades multilingües (no procesa lenguaje natural).
- No dispone de capacidades de visión, audio ni modo de pensamiento (thinking mode).
- No se declara ninguna tarea de HuggingFace (`pipeline`) asociada al repositorio.

## Casos de uso

- Reproducción de un cribado virtual sobre MAO-B: descargar el inicializador FP32 y los ficheros ONNX del sitio, fijar el commit indicado por la web y repetir la inferencia sobre el mismo conjunto de ligandos para comprobar que los resultados publicados se replican bit a bit.
- Despliegue de inferencia en el navegador: el sitio web descarga los activos solo cuando el visitante inicia el análisis y los cachea localmente, de modo que el repositorio actúa como origen de contenido verificable para una demo interactiva sin registro ni instalación previa.
- Verificación de integridad en pipelines de CI: incorporar la comprobación de bytes y SHA-256 de los tres ficheros como paso previo obligatorio a cualquier ejecución de inferencia, tal y como hace el propio sitio, para descartar artefactos corruptos o sustituidos.
- Reutilización de las rejillas GNINA como entradas comparables: emplear `1hsg-grid.bin` y `1hvr-grid.bin` con GNINA o gnina-torch para generar puntuaciones de referencia sobre los mismos complejos 1HSG y 1HVR y contrastarlas con las del modelo DL-FSG/Fusion.
- Auditoría y revisión por pares: dado que los pesos son un inicializador FP32 sin modificaciones y están identificados por hash, un revisor externo puede confirmar que los resultados del artículo se calcularon con exactamente ese artefacto.
- Archivado a largo plazo de artefactos de investigación: el direccionamiento por contenido y el nombre de fichero basado en hash permiten conservar los activos como referencia estable incluso si el sitio web cambia de infraestructura.
- Docencia y formación en quimioinformática: usar los tensores de rejilla y el peso FP32 como material de partida para prácticas de docking y de modelos híbridos secuencia-rejilla, con licencia y atribución claramente acotadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de afinidad, RMSD, AUC, enriquecimiento ni comparaciones cuantitativas con GNINA u otros métodos; únicamente documenta tamaños de fichero, hashes SHA-256 y atribuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el blob FP32 ocupa 891.289.600 bytes (≈ 0,83 GiB), por lo que se necesitan al menos ~0,9 GB de memoria solo para los pesos, más los tensores de rejilla (12.386.304 bytes cada uno, ≈ 11,8 MiB) y el espacio de activaciones. No se publican requisitos oficiales.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el peso cabe holgadamente en cualquier GPU con 4 GB o más de memoria.
- GPU de consumo: sí, el artefacto es compatible con GPU de consumo (RTX 3060, RTX 4090 y similares) por el tamaño del fichero, aunque el repositorio no certifica ninguna configuración concreta.
- CPU: viable en principio dado el reducido tamaño de los pesos, pero no confirmado por el autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de modelo). El material se consume mediante el sitio web del proyecto (ficheros ONNX y arrays de pesos) y, para las rejillas, mediante GNINA o gnina-torch, software externo citado en los avisos del sitio.
- Latencia y throughput: no disponibles. El autor no publica tiempos de inferencia ni capacidad de procesamiento por segundo.
- Nota de ejecución: la model card no especifica si la inferencia del sitio se ejecuta en el cliente o en un servidor; solo indica que el navegador verifica los ficheros antes de la inferencia y cachea las descargas.

## Comparativa con modelos similares

No disponible. Este repositorio no contiene un modelo con parámetros, contexto o licencia comparables a los de otro modelo publicado: es un conjunto de activos binarios de un proyecto concreto. Los elementos relacionados que sí se pueden situar son los siguientes, con el nivel de detalle que aporta la propia model card:

| Elemento | Naturaleza | Relación con este repositorio | Datos cuantitativos comparables |
|---|---|---|---|
| Checkpoint MAO-B DL-FSG/Fusion | Modelo de cribado del proyecto | Origen del inicializador FP32 publicado | No disponibles |
| MCANet (upstream) | Componente previo de terceros | Su aviso BSD-3-Clause se conserva en `FUSION-UPSTREAM-LICENSE.txt` | No disponibles |
| GNINA 1.0 `crossdock_default2018` | Software externo de docking | Destinatario de los dos tensores de rejilla | No disponibles |
| gnina-torch (commit `5196d00`) | Implementación externa en PyTorch | Alternativa de ejecución de las rejillas | No disponibles |

## Limitaciones y advertencias

- No es un modelo entrenado nuevo ni un modelo generativo: es un volcado de pesos y dos tensores de entrada. No debe presentarse como un modelo publicable con benchmarks propios.
- Licencia ambigua: la ficha de HuggingFace no declara licencia. El aviso BSD-3-Clause de MCANet se conserva únicamente como atribución upstream y, según el propio autor, no constituye una licencia general para materiales de investigación no relacionados. Cualquier uso comercial debe aclararse con el propietario de la investigación.
- Los dos ficheros de rejilla no son medidas experimentales ni resultados de afinidad: son tensores de entrada para GNINA. Interpretarlos como datos biológicos sería un error.
- Dependencia de software externo: la reproducibilidad de las rejillas depende de GNINA, gnina-torch y libmolgrid 0.5.5, versiones concretas que pueden evolucionar y romper la compatibilidad.
- Ámbito químico restringido: el checkpoint procede de un cribado sobre MAO-B (complejos 1HSG y 1HVR para las rejillas). No hay evidencia en la información disponible de que generalice a otras dianas.
- Sin métricas publicadas: no hay datos de rendimiento, calibración ni tasas de error, por lo que no se puede evaluar su calidad predictiva a partir de este repositorio.
- Riesgo de alucinación: no aplicable, ya que no genera texto.
- Idiomas: no aplicable; el modelo no procesa lenguaje natural, pese a que el repositorio se aloje en una plataforma orientada a modelos de lenguaje.
- Inmutabilidad deliberada: los ficheros se describen como inmutables; si el proyecto necesita actualizaciones, lo previsible es que aparezcan como nuevos artefactos con distinto hash, no como revisiones del actual.
- Sin garantías de mantenimiento ni soporte: 0 descargas y 0 likes en el momento de la consulta, y ningún canal de soporte declarado.
- Trazabilidad temporal: la autorización de publicación indicada por el autor está fechada el 25 de septiembre de 2026, un día después de la creación del repositorio; conviene conservar esa referencia al citar el material.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/micklee17/protein-ligand-affinity-web-assets
- Sitio web del proyecto (HKMU AI4S Lab): https://hkmu-ai4s-lab.github.io/protein-ligand-affinity/
- Código fuente y manifiestos de inferencia validados: https://github.com/HKMU-AI4S-Lab/protein-ligand-affinity
- Artículo de referencia del método: https://doi.org/10.1051/bioconf/202623202002 ("Deep learning on the fusion of chemical sequences and molecular grids")
- Artículo de GNINA 1.0: https://doi.org/10.1186/s13321-021-00522-2
- Repositorio gnina-torch (commit citado): https://github.com/RMeli/gnina-torch/tree/5196d00ec78738428313a1af9a11bf73c550edd3
- Aviso de licencia upstream: `FUSION-UPSTREAM-LICENSE.txt` (incluido en el repositorio, aviso BSD-3-Clause de MCANet)
