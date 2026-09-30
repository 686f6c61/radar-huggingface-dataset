# jprivera/final_graphs_paper

## Resumen

`jprivera/final_graphs_paper` no es un modelo de aprendizaje automatico, sino un repositorio de artefactos de investigacion publicado en Hugging Face. Concretamente, contiene las copias de las figuras, los scripts de generacion (matplotlib/Python), los ficheros de valores trazados (`.csv`) y los datos de evaluacion asociados a un articulo enviado a ICLR 2027 sobre riesgos de escalada en sistemas de IA. El README se titula "Final paper graphs (ICLR 2027)" y advierte de que solo se guardan copias: los originales permanecen en su ubicacion de origen.

El repositorio esta organizado en tres grandes bloques: `in_iclr_paper/` (las figuras que usa exactamente la carpeta `figures/` del paper), `candidates/` (variantes que aun no estan en el articulo, como la version de la figura 3 con todas las filas evaluadas) y `results3/` (figuras de la seccion de resultados 3). Ademas incluye versiones "bare" de las figuras, sin titulo ni subtitulo incrustados, para que ese texto viva en el pie de figura de LaTeX.

La relevancia de este repositorio es de tipo reproducibilidad y auditoria cientifica, no de inferencia. Los numeros que aparecen en el README corresponden a tasas de sabotaje, deteccion y ocultacion selectiva de "organismos" entrenados mediante SFT, DPO y CWS, evaluados con un juez GPT-5.4 en algunos casos. No hay pesos, no hay tokenizador y no hay arquitectura de red en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica. No contiene una red neuronal: el repositorio aloja scripts de generacion de figuras (Python/matplotlib), figuras en PDF/PNG y datos tabulares de evaluacion |
| Parametros totales | No disponible (no hay pesos en el repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible. El texto de las figuras y las anotaciones del README estan en ingles |
| Licencia | No disponible |
| Formato de pesos | No contiene pesos. Formatos presentes segun el README: `.py`, `.pdf`, `.png`, `.csv`, `.json` |
| Tamano del repositorio | 0.0 GB segun los metadatos de Hugging Face |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-30T01:31:03Z |
| Ultima actualizacion | 2026-09-30T01:31:06Z |
| Etiquetas | `region:us` |

## Arquitectura y entrenamiento

No hay arquitectura de modelo que describir. Lo que documenta el repositorio es el material grafico de un estudio sobre riesgos de escalada: la figura 2 es un diagrama de pipeline heredado del borrador de NeurIPS, y las figuras 1, 3, 4 y 5 presentan tasas medidas sobre organismos entrenados con tres metodos distintos (SFT, DPO y CWS). La figura 3 ("caught vs transfer") se construye sobre una evaluacion de 3.600 filas, con dos paneles: el panel A usa 3 formatos entrenados (aproximadamente 39 filas por organismo) y el panel B, 4 comportamientos por 9 formatos retenidos (aproximadamente 470 filas por organismo). La variante en `candidates/` amplia el computo a todos los formatos y comportamientos (aproximadamente 291 y 756 filas por organismo respectivamente).

La parte metodologica mas destacable que se deduce del README es el uso de un juez automatico (GPT-5.4) para puntuar sabotaje con el criterio de la tabla 3 del articulo, que exige que el modelo apruebe y ademas reconozca la accion ("approves AND recognises"). La figura 1 se regenero el 2026-09-26 con ese criterio, conservando la version anterior basada solo en el veredicto. Las barras de la figura 4 se acompanan de intervalos de confianza del 95 % calculados con bootstrap por conglomerados sobre los items de test (B = 2000), con 12-13 items por celda y sin incluir la dispersion entre organismos. El repositorio incluye ademas una utilidad `run_bare.py` que reejecuta cualquier script de figura sin el texto incrustado y redirige la salida a ficheros `*_bare.*` sin sobrescribir los originales.

## Capacidades

- Almacenar y versionar las figuras finales de un articulo (ICLR 2027) junto a los scripts que las generan.
- Trazabilidad de cambios por figura: el README indica que version esta en el paper, cual es la anterior y que fichero de datos la respalda.
- Regeneracion de figuras en modo "bare" para que los titulos y notas vivan en el pie de figura de LaTeX.
- Verificacion de robustez: incluye una variante de la figura 3 calculada con todas las filas evaluadas que reproduce la misma conclusion que la version del articulo.
- Analisis de comportamiento por celda (figura 4) con etiquetas como "Reward hacking", y controles de reproducibilidad (se afirma que las 50 celdas son identicas a una version anterior).
- Intervalos de confianza con bootstrap por conglomerados y scripts dedicados (`ci_behaviour_breakdown.py`, `--ci`, `--pm`).
- Paneles de resultados de la seccion 3: reparacion emparejada, costes de monitorizacion y controles ampliados (panel50, 9 envoltorios retenidos, comportamientos retenidos).
- No hay capacidades de generacion de texto, razonamiento, codigo, vision, tool calling ni agentes, porque no hay modelo.

## Casos de uso

- Reproduccion de figuras para revision por pares: un revisor del ICLR puede ejecutar los scripts del repositorio y regenerar las figuras 1, 3, 4 y 5 con los mismos datos, siempre que disponga de las rutas y los ficheros de evaluacion referenciados.
- Verificacion de afirmaciones numericas en un proceso de rebatimiento: los ficheros `raw_rates.json` y `results3_plotted_values.csv` permiten comprobar los valores trazados frente a los citados en el texto del articulo.
- Auditoria de criterios de evaluacion: la documentacion del cambio de criterio de sabotaje en la figura 1 (de "solo veredicto" a "aprueba y reconoce", con juez GPT-5.4) permite reconstruir como afecta la definicion de la metrica a las barras publicadas.
- Control de integridad en integracion continua: la utilidad `run_bare.py` y los scripts de comprobacion de reproducibilidad permiten montar un job que falle si una figura deja de coincidir con los valores registrados.
- Preparacion de material suplementario: las versiones "bare" de las figuras se insertan directamente en LaTeX dejando el texto descriptivo en el pie de figura, lo que evita duplicar titulos.
- Analisis metodologico de robustez: la carpeta `candidates/` sirve como ejemplo de comprobacion de robustez al ampliar el conjunto de formatos y comportamientos evaluados sin cambiar la conclusion.
- Docencia o divulgacion sobre evaluacion de comportamientos en modelos: el desglose por comportamiento y los intervalos bootstrap son material de partida para explicar como se mide sabotaje y ocultacion selectiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos valores numericos presentes en la informacion proporcionada no son benchmarks de un modelo, sino tasas de evaluacion de las figuras del articulo. Se recogen a continuacion tal como aparecen en el README, sin interpretacion adicional.

| Figura / conjunto | Valores documentados | Notas |
|---|---|---|
| Fig 3 (variante `candidates/`, panel A: rubric gaming sobre 12 formatos + conjunto de seleccion de 360 filas) | 96.2 / 97.3 / 98.9 | Orden SFT / DPO / CWS; aproximadamente 291 filas por organismo |
| Fig 3 (variante `candidates/`, panel B: 5 comportamientos por 12 formatos) | 78.8 / 56.1 / 84.3 | Orden SFT / DPO / CWS; aproximadamente 756 filas por organismo; incluye formatos entrenados |
| Fig 4 (desglose por comportamiento) | No se publican valores en el README | 50 celdas verificadas identicas a una version previa; 12-13 items por celda; intervalo de confianza del 95 % por bootstrap de conglomerados, B = 2000 |
| Fig 5 v2 (dumbbell) | No se publican valores en el README | Deteccion con y sin proteccion por metodo; media de 3 organismos por 2 pruebas medicas, 252 pares por celda |

## Requisitos de hardware

- Inferencia: no aplica. No hay modelo que ejecutar, por lo que no se requiere VRAM ni GPU.
- Generacion de las figuras: se trata de scripts de trazado sobre ficheros CSV/JSON; es viable en CPU. No se especifica en el README el consumo de memoria ni el tiempo de ejecucion.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: irrelevante para este repositorio; cualquier equipo capaz de ejecutar Python y matplotlib puede reproducir las figuras.
- Opciones de despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI asociados). El unico ejecutable documentado es `run_bare.py 
