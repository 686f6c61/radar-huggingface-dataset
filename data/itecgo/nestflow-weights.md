# itecgo/nestflow-weights

## Resumen

NestFlow es un conjunto de pesos de redes neuronales de colocación (placement networks) desarrollado por el autor `itecgo` como material suplementario del manuscrito *NestFlow* (2026), preparado para la revista *Engineering Applications of Artificial Intelligence*. No se trata de un modelo de lenguaje: son snapshots de PyTorch orientados a resolver el problema de nesting o irregular packing, es decir, el encaje óptimo de piezas irregulares dentro de una lámina de material, un problema clásico de optimización combinatoria con aplicaciones directas en la industria.

La aproximación técnica combina modelos de difusión con formulaciones score-based, un enfoque generativo poco habitual en este dominio, donde predominan los métodos heurísticos y los solvers de búsqueda. El repositorio incluye la estirpe principal de entrenamiento (H6 y sus ancestros), brazos de receta, una prueba de escala con cuatro veces los parámetros, un localizador para bucles de reparación y un prototipo previo.

El modelo evaluado en el texto principal es el snapshot H6 (`main_h6_lineage/h6/run/h6_e00520000.pt`). El repositorio ocupa 7,9 GB y no otorga licencia de uso más allá de la reproducción y verificación del manuscrito. Es relevante ahora porque publica pesos entrenados sin exposición a los tableros de producción de prueba, con trazabilidad de procedencia documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de difusión score-based para colocación (placement); no disponible el detalle de capas salvo `f7d` con 16 capas |
| Parametros totales | No disponible; la variante `g1b` de `wide_4x/` tiene cuatro veces los parámetros de la estándar `g1a` |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible; pesos en precisión nativa PyTorch (EMA) |
| Idiomas soportados | No disponible (no aplica) |
| Licencia | `other` / `see-readme`: sin licencia concedida todavía; uso permitido solo para reproducir y verificar el manuscrito |
| Formato de pesos | PyTorch (`torch.save`), claves `ema` y configuración de la ejecución; empaquetados con `tar.zst` |

## Arquitectura y entrenamiento

La arquitectura es una red de difusión con formulación score-based aplicada a la generación de colocaciones de piezas irregulares. Los snapshots de noviembre guardan los pesos EMA bajo la clave `ema` junto con la configuración de la ejecución, y deben cargarse únicamente con el snapshot de código empaquetado junto a ellos (`candidate/` dentro de los packs `<run>_run_files.tar.zst` o `<stage>_stage_files.tar.zst`). Cada pack incluye plan, estado, curva de entrenamiento, logs, scripts de lanzamiento y el código con el que se entrenó; `PACKS.tsv` lista cada fichero con su ruta de origen y `SHA256SUMS.txt` contiene el SHA-256 de todos los ficheros.

El entrenamiento se organiza en estirpes y etapas. La estirpe principal `main_h6_lineage/` contiene las ejecuciones `s1`, `s2`, `s3` (con brazos `run_A` sin geometría exacta de contacto y `run_B` con ella), `s4`, `s5`, `s6` y `h1` a `h7`. Las etapas R1, R2 y R3 del manuscrito corresponden a `s1`, `s2` y `s3/run_B`; R5 y R6 son `s5` (estado a 2,2 millones de ejemplos) y `s6`; H1 a H4 y H6 son `h1` a `h4` y `h6`. Los brazos de receta (`recipe_arms/`) son continuaciones de H6 durante 0,3 millones de layouts con distintas opciones (W, S, D, R, P, M y L con 16 capas). La prueba de escala `wide_4x/` entrena desde cero `g1a` (tamaño estándar) y `g1b` (cuádruple de parámetros) sobre la mezcla final de datos durante 0,6 millones de layouts. H6 y todos sus ancestros se entrenaron sin los diez tableros de producción del manuscrito, con hashes de padres registrados en `init.json` y comprobaciones en `provenance_log.jsonl`.

## Capacidades

- Generación de colocaciones de piezas irregulares (nesting) mediante muestreo de difusión score-based.
- Modelado de geometría de contacto exacta en los brazos `run_B`.
- Localización de errores de colocación mediante el localizador de `localiser/e2/`, integrado en un bucle de reparación.
- Entrenamiento y evaluación sobre conjuntos de datos propios publicados en `itecgo/nestflow-datasets`.
- Comparación con GFPack++ mediante la red entrenada sobre el conjunto dental liberado por dicho trabajo (`dental_swap/nf_vedsm_v195/`).
- Trazabilidad completa de procedencia y verificación criptográfica de los ficheros.
- No soporta tool calling, agentes, razonamiento multi-step genérico ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reproducción del manuscrito NestFlow: cargar el snapshot H6 con el código empaquetado en su pack para regenerar las figuras y tablas del texto principal, verificando previamente los SHA-256.
- Investigación en difusión aplicada a optimización combinatoria: usar los brazos de receta (`f1c`, `f1w`, `f1s`, `f2d`, `f4r`, `f5p`, `f6m`, `f7d`) para estudiar el efecto de cada opción de entrenamiento sobre la calidad de colocación.
- Estudio de escalado: comparar `g1a` y `g1b` de `wide_4x/` para analizar el rendimiento con el cuádruple de parámetros sobre la misma mezcla de datos.
- Desarrollo de bucles de reparación: integrar el localizador `loc2_s001000.pt` en un pipeline que detecte y corrija colocaciones defectuosas, tal como se describe en la sección 6 y el apéndice D.
- Benchmarking frente a GFPack++: emplear la red de `dental_swap/nf_vedsm_v195/` sobre el conjunto dental liberado para replicar la tabla comparativa del apéndice E.
- Auditoría de fuga de datos: utilizar `init.json`, `provenance_log.jsonl` y `PACKS.tsv` para verificar que ningún tablero de producción contaminó el entrenamiento de la estirpe H6.
- Docencia y experimentación con modelos generativos en packing: el prototipo `prototype_s1_s15/` permite recorrer la evolución de quince etapas con sus estados padre e hijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas del manuscrito (apéndices A a E) y a `status.json` en los ficheros de ejecución de `dental_swap/` como fuente de la comparación, pero no incluye cifras numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 7,9 GB, pero el tamaño de cada snapshot individual no se especifica.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) usando el snapshot de código `candidate/` empaquetado con cada ejecución; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Dominio | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NestFlow (H6) | Nesting / irregular packing con difusión score-based | No disponible (variante 4x en `g1b`) | No aplica | Sin licencia concedida (`see-readme`) | Pesos públicos en HF, uso restringido a reproducción |
| GFPack++ | Irregular packing | No disponible | No aplica | No disponible | Conjunto dental de entrenamiento liberado; comparado en apéndice E |
| NestFlow prototipo (C4) | Nesting, prototipo previo | No disponible | No aplica | Sin licencia concedida | Pesos públicos en HF, evaluado sobre tableros de producción |

No se dispone de datos suficientes para comparar parámetros, contexto ni rendimiento con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia restrictiva: no se concede licencia alguna; hasta la publicación del manuscrito los ficheros solo pueden usarse para reproducir y verificar el trabajo. Uso comercial no permitido.
- Parte de las formas de entrenamiento provienen de un taller asociado (ver repositorio de datos), lo que puede condicionar la redistribución.
- Los pesos deben cargarse exclusivamente con el snapshot de código empaquetado junto a ellos; el formato `torch.save` con clave `ema` no es portable a otros frameworks.
- El prototipo del apéndice C fue evaluado sobre los tableros de producción durante su desarrollo, por lo que sus métricas no son comparables con las de H6 en términos de generalización.
- Fuera del repositorio quedan la ejecución entrenada con piezas de los tableros de producción y una ajustada a dichos tableros: están expuestas a los datos de test y no forman parte de la estirpe válida.
- El repositorio no incluye datos de benchmarks, idiomas, parámetros ni requisitos de hardware, lo que dificulta una evaluación rápida sin consultar el manuscrito.
- Sin descargas ni likes registrados en Hugging Face en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/itecgo/nestflow-weights
- Repositorio de datos: https://huggingface.co/itecgo/nestflow-datasets
- Manuscrito: NestFlow (2026), *Engineering Applications of Artificial Intelligence* (referenciado en la model card; sin URL directa disponible)
