# redmingwei/hetero-moe-projspace

## Resumen

`redmingwei/hetero-moe-projspace` no es un modelo de lenguaje entrenado, sino un artefacto de análisis publicado en HuggingFace. El repositorio, de 3,5 MB, agrupa los resultados de una investigación sobre espacios de proyección dimensional aplicados a arquitecturas MoE heterogéneas, correspondientes a las iteraciones v48–v62 del proyecto. Lo firma el usuario redmingwei bajo licencia Apache 2.0 y está etiquetado como `dimension-projection-space` y `analysis-artifact`.

El contenido son ficheros de pesos de operadores (`projspace_equalwidth.pt`, `projspace_op.pt`) y varios JSON con diagnósticos: barridos de rango con métricas CKA y de fidelidad, análisis de alineamiento por pares en las ranuras Q/O, y evidencia de referencia de una estructura anterior (v33) que fue descartada. No incluye código de modelado, ni `auto_map`, ni una `architectures` válida, por lo que no es cargable como modelo con `transformers`.

Su relevancia es metodológica: documenta por qué una arquitectura previa (`HeteroMoE-v1`) se abandonó tras tres auditorías independientes, y establece que la alineación entre espacios de distintos modelos se resuelve mejor con transformaciones por pares que con una transformación compartida. El autor remite explícitamente a `HeteroMoEProjSpace-v2` (2,8 GB) como el modelo completo y cargable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (artefacto de análisis; no es un modelo de lenguaje) |
| Parametros totales | No disponible (operadores de 2,13 MB y 1,14 MB; sin recuento publicado) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`) para los operadores; JSON para los informes |

## Arquitectura y entrenamiento

El repositorio no contiene un transformer, un MoE ni un SSM entrenado. Contiene los pesos de un operador de proyección dimensional (versión de igual anchura y versión temprana) junto con los informes de su caracterización. El trabajo subyacente es un estudio de alineación entre subespacios de representación de modelos distintos, no un entrenamiento de lenguaje: no se documentan tokens de entrenamiento, composición del corpus ni fases de RLHF o DPO.

Las innovaciones que sí quedan registradas son de carácter analítico. El barrido de rango muestra que la métrica CKA se mantiene en 0,998 de forma constante entre rank 8 y rank 768, mientras que la fidelidad de reconstrucción sí depende de la dimensión: 0,060 en rank 8, 0,165 en rank 24, 0,712 en rank 128, 0,9998 en rank 256 y 1,0000 a partir de 384. La conclusión es que alinear en igual dimensión es sin pérdida, comprimir destruye información (un 83 % en 24 dimensiones) y ampliar no aporta beneficio. El diagnóstico por pares en las ranuras Q y O da correlaciones de 0,9893/0,9883/0,9879 (Q) y 0,9898/0,9890/0,9876 (O) cuando se comparan dos modelos, pero caen a 0,6767 y 0,7168 al forzar tres modelos con una sola transformación; al retirar Qwen vuelven a 0,9879 y 0,9876. De ahí se deduce que el factor limitante es el número de modelos, no el tipo de función. En el experimento de cuatro esquemas de alineación sobre la ranura Q (capa 1, n=3), los resultados son raw 0,3068, orth 0,3068, one 0,5624 y per 0,99999, lo que justifica la elección de alineación por pares composable en v62.

## Capacidades

- No genera texto ni responde a prompts: es un artefacto de análisis, no un modelo inferible.
- Proporciona pesos de operador de proyección dimensional reutilizables en experimentos de alineación entre espacios latentes.
- Incluye barridos de rango con curvas de CKA y fidelidad (`rank_sweep.json`) y evolución del rango por ranura tras alineación compartida (`rank_shared.json`).
- Incluye diagnóstico por pares Q/O (`qo_diagnose.json`) con correlaciones entre dos y tres modelos.
- Incluye cuatro variantes de alineación comparadas (raw, orth, one, per) bajo el directorio `align/`.
- Incluye evidencia de referencia de la estructura v33 descartada (`v33_reference/`): entradas y salidas de benchmark, pesos de routing y registro de un ajuste fino de 3076 parámetros.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Auditoría de arquitecturas MoE heterogéneas: los JSON de diagnóstico permiten reproducir la conclusión de que el routing de la estructura v33 era trivial, ya que la salida de fusión decodificaba la identidad del experto origen con precisión 1,000 frente a 0,279 para la categoría objetivo (azar 0,125).
- Diseño de esquemas de alineación entre modelos: la comparativa raw/orth/one/per sirve para justificar la elección de transformaciones por pares frente a una transformación única compartida, con cifras concretas de correlación.
- Dimensionado de subespacios compartidos: el barrido de rango permite fijar la dimensión mínima que preserva fidelidad (256 para 0,9998) y descartar tanto la compresión agresiva como la ampliación innecesaria.
- Reproducción de experimentos de investigación: los ficheros de pesos de operador y los informes asociados permiten verificar los resultados sin reentrenar.
- Detección de colapso de routing: `v33_reference/train_report.json` documenta cómo un ajuste de 3076 parámetros llevó la carga de expertos de Qwen de [0,04, 0,67, 0,50, 0,79] a [0,0, 1,0, 0,04, 0,0] y la entropía de 0,482 a aproximadamente 0, útil como caso de estudio de desequilibrio.
- Docencia y revisión por pares: el repositorio ofrece un ejemplo completo de cómo tres implementaciones independientes (v50, v52, v53) refutan una conclusión previa, con los artefactos necesarios para replicar el análisis.
- Base para el modelo completo: quien necesite inferencia real debe partir de `HeteroMoEProjSpace-v2`; este repositorio aporta el contexto analítico y los operadores que lo sustentan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los datos del repositorio son métricas internas de alineación (CKA, fidelidad, correlaciones por ranura), no evaluaciones estándar de capacidad del modelo:

| Metrica interna | Valor |
|---|---|
| CKA (rank 8 a 768) | 0,998 constante |
| Fidelidad rank 8 / 24 / 128 / 256 / 384+ | 0,060 / 0,165 / 0,712 / 0,9998 / 1,0000 |
| Correlacion Q, dos modelos | 0,9893 / 0,9883 / 0,9879 |
| Correlacion Q, tres modelos | 0,6767 |
| Correlacion O, dos modelos | 0,9898 / 0,9890 / 0,9876 |
| Correlacion O, tres modelos | 0,7168 |
| Alineacion Q capa 1 (raw/orth/one/per) | 0,3068 / 0,3068 / 0,5624 / 0,99999 |
| Decodificabilidad de identidad de experto (v50) | 1,000 (origen) / 0,279 (objetivo) |
| Entropia de carga de expertos tras ajuste (v33) | 0,482 a aproximadamente 0 |

## Requisitos de hardware

- No requiere GPU: los ficheros pesan 3,5 MB en total y se procesan en CPU sin dificultad.
- Los pesos de operador (2,13 MB y 1,14 MB) caben en memoria RAM convencional; cualquier equipo puede cargarlos con PyTorch.
- No aplica despliegue con vLLM, llama.cpp, Ollama o TGI, ya que no existe un grafo de modelo cargable (`architectures: null`, sin `auto_map`, sin código de modelado).
- Para inferencia real hay que acudir a `HeteroMoEProjSpace-v2` (2,8 GB); los requisitos de hardware de ese modelo no están documentados en la información disponible.
- No se publican datos de latencia ni de throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada artefactos comparables de análisis de espacios de proyección dimensional. La única referencia del mismo autor es `HeteroMoEProjSpace-v2`, que no es un equivalente sino la contraparte cargable del mismo proyecto:

| Repositorio | Tamano | Naturaleza | Uso previsto |
|---|---|---|---|
| `hetero-moe-projspace` | 3,5 MB | Artefacto de análisis | Revisión y reproducción de resultados |
| `HeteroMoEProjSpace-v2` | 2,8 GB | Modelo completo cargable | Inferencia y experimentación |

## Limitaciones y advertencias

- No es un modelo utilizable para generación, razonamiento ni ninguna tarea de NLP; intentar cargarlo con `transformers` fallará por ausencia de arquitectura y de código de modelado.
- El propio autor advierte de que `v33_reference/expected_y.npy` no debe tratarse como respuesta correcta: es la salida real de una estructura cuyo comportamiento se demostró erróneo.
- La conclusión de la estructura v33 está refutada por tres auditorías (v50, v52, v53); reutilizar esos pesos sin leer los informes lleva a reproducir un fallo conocido.
- El repositorio no documenta sesgos, idiomas ni evaluación de calidad, porque no hay modelo de lenguaje que evaluar.
- No hay guía de uso comercial más allá de la licencia Apache 2.0; la idoneidad para producción depende del modelo completo al que acompaña, no de este artefacto.
- El ajuste fino registrado en `v33_reference/train_report.json` provocó colapso de routing (entropía cercana a cero), un riesgo a tener en cuenta si se reutilizan esos pesos como inicialización.
- La información sobre el modelo completo (`HeteroMoEProjSpace-v2`) es mínima: no se detallan parámetros, contexto ni licencia específica más allá de lo indicado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/redmingwei/hetero-moe-projspace
- Código del operador (`projspace.py`, v62): https://github.com/Microbiosis/hetero-moe/tree/main/research/aligner/v62_dimension_projection_space
- Modelo completo cargable: https://huggingface.co/redmingwei/HeteroMoEProjSpace-v2
- Repositorios absorbidos (referenciados en la model card): `hetero-moe-dimspace`, `hetero-moe-align`, `HeteroMoE-v1` (eliminado)
- Paper, blog o demo adicionales: no disponibles
