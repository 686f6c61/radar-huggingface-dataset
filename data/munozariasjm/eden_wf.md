# munozariasjm/eden_wf

## Resumen

EDEN (assets) es un repositorio de artefactos de investigación publicado por el usuario munozariasjm en Hugging Face. No se trata de un modelo de lenguaje generativo, sino del conjunto de activos (`assets/`) asociado al código EDEN: modelos neuronales que aproximan la densidad de un electrón ajustándola a muestras de una función de onda neuronal previamente congelada. El repositorio contiene checkpoints de DeepQMC 1.3.0 basados en Psiformer, los ajustes de densidad resultantes y estimaciones de referencia de Monte Carlo.

El contenido incluye funciones de onda congeladas para propano, aleno, helio, hidrógeno molecular (a distancias de 1,40 y 4,00 bohr), hidruro de litio y berilio, junto con sus configuraciones de entrenamiento y sumas de verificación. También almacena los ajustes de densidad de los métodos EDEN y NERD en formato propio (`eden.io`), con ficheros `params.npz`, `config.json` e `history.json`, y un índice en `fits/INDEX.md`.

Su relevancia es de nicho: sirve como material reproducible para el código EDEN en el ámbito de la química cuántica computacional y los métodos de función de onda neuronal. El repositorio ocupa 0,2 GB y no incluye los conjuntos de muestras (posiciones y puntuaciones), de 6,6 GB cada uno, que deben regenerarse a partir de los checkpoints con `scripts/sample.py`. No se dispone de información sobre licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo de lenguaje. Checkpoints de función de onda neuronal DeepQMC 1.3.0 basados en Psiformer; ajustes de densidad neuronal (EDEN y NERD) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Checkpoints de DeepQMC; ajustes en `params.npz`, `config.json`, `history.json` (formato `eden.io`) |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo propio en el sentido habitual: aloja artefactos de dos etapas. En primer lugar, funciones de onda neuronales congeladas generadas con DeepQMC 1.3.0 y arquitectura Psiformer para un conjunto reducido de moléculas pequeñas (propino, aleno, He, H2 a 1,40 y 4,00 bohr, LiH y Be), con sus configuraciones de entrenamiento y sumas de verificación incluidas. En segundo lugar, ajustes de densidad de un electrón (métodos EDEN y NERD) obtenidos a partir de muestras de esas funciones de onda congeladas.

La innovación metodológica que subyace es la aproximación neuronal de la densidad electrónica de un electrón ajustada por Monte Carlo a partir de la función de onda de referencia, lo que permite disponer de una representación compacta y evaluable de la densidad. No se detalla en la información disponible el número de tokens de entrenamiento (concepto no aplicable), la composición de los datos ni el uso de RLHF/DPO, propios de modelos de lenguaje y ausentes en este contexto. Los conjuntos de muestras no se almacenan en el repositorio y deben regenerarse con el script indicado.

## Capacidades

- Evaluación de densidades electrónicas de un electrón ajustadas a funciones de onda neuronales congeladas.
- Carga de checkpoints Psiformer de DeepQMC 1.3.0 para las moléculas incluidas.
- Reproducción de ajustes de densidad de los métodos EDEN y NERD en formato `eden.io`.
- Verificación de integridad de checkpoints mediante sumas de comprobación incluidas.
- Consulta de estimaciones de referencia de Monte Carlo (densidades de contacto, recuentos de capas, dipolos) por molécula y conjunto de muestras.
- Regeneración de conjuntos de muestras a partir de los checkpoints con `scripts/sample.py`.
- No dispone de generación de texto, código, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Reproducción de experimentos de química cuántica: cargar los checkpoints congelados y los ajustes de densidad para verificar resultados publicados sobre propino, aleno, He, H2, LiH y Be.
- Validación de nuevos métodos de ajuste de densidad: usar los ajustes EDEN y NERD almacenados como línea base al comparar aproximaciones alternativas de la densidad de un electrón.
- Comparación de estimaciones de Monte Carlo: contrastar densidades de contacto, recuentos de capas y dipolos frente a las referencias incluidas en `references/`.
- Desarrollo e integración del código EDEN: emplear el repositorio como conjunto de activos de prueba mediante `bash scripts/assets.sh download`, que descarga y verifica los checkpoints.
- Regeneración de muestras a gran escala: producir los conjuntos de 6,6 GB por molécula con `scripts/sample.py` para entrenar o evaluar nuevos ajustes.
- Docencia e investigación en función de onda neuronal: ilustrar el flujo completo desde una función de onda Psiformer hasta una densidad neuronal compacta en moléculas pequeñas.
- Auditoría de reproducibilidad: comprobar configuraciones de entrenamiento y sumas de verificación de los checkpoints congelados en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 0,2 GB, por lo que su almacenamiento y descarga son ligeros.
- Los conjuntos de muestras no incluidos ocupan 6,6 GB cada uno; requieren espacio en disco adicional y tiempo de regeneración con `scripts/sample.py`.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no aplica (no es un modelo servible con vLLM, llama.cpp, Ollama o TGI); el uso previsto es mediante el código EDEN y DeepQMC 1.3.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| EDEN (assets) | Artefactos de función de onda y densidad neuronal | No disponible | No aplica | No disponible | Repositorio de activos, no modelo desplegable |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No se dispone de información sobre repositorios equivalentes en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni responde a instrucciones; su uso está restringido al dominio de la química cuántica computacional.
- El repositorio contiene únicamente activos; el código necesario reside en un repositorio separado y debe obtenerse aparte.
- Los conjuntos de muestras (6,6 GB por conjunto) no están incluidos y deben regenerarse, lo que requiere computación y tiempo no especificados.
- Cobertura molecular muy limitada: propino, aleno, He, H2 (1,40 y 4,00 bohr), LiH y Be; no hay evidencia de generalización a otras moléculas.
- Licencia no declarada: no puede asumirse uso comercial sin aclaración del autor.
- Idiomas y sesgos: no aplica en el sentido habitual, pero tampoco hay información sobre sesgos metodológicos o numéricos de los ajustes.
- Riesgo de alucinación: no aplica; el riesgo relevante es de error numérico en los ajustes y de reproducibilidad si no se regeneran las muestras correctamente.
- El repositorio registra fechas de creación y actualización en 2026-11-12, con 0 descargas y 0 likes, lo que sugiere un artefacto de investigación sin validación externa pública.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/munozariasjm/eden_wf
- Documentación interna del repositorio: `wavefunctions/README.md` y `fits/INDEX.md` (incluidos en el propio repositorio)
- Script de descarga y verificación: `bash scripts/assets.sh download` (desde la raíz del repositorio de código)
- Script de regeneración de muestras: `scripts/sample.py` (desde la raíz del repositorio de código)
- DeepQMC 1.3.0: no disponible enlace en la información proporcionada
- Paper o blog del método EDEN: no disponible en la información proporcionada
