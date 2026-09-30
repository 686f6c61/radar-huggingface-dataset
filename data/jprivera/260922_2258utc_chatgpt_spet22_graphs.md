# jprivera/260922_2258UTC_chatgpt_spet22_graphs

## Resumen

El repositorio `jprivera/260922_2258UTC_chatgpt_spet22_graphs`, publicado por el usuario jprivera el 30 de septiembre de 2026, no contiene un modelo de lenguaje ni pesos de ningun tipo: es un artefacto de auditoria reproducible de los resultados de un experimento de alineacion denominado proyecto de colusion. La model card describe un directorio de auditoria del grid de dosis fijas de 78 brazos (intervenciones) ya completado, separado de la replicacion en curso de semillas de organismo.

El contenido del repositorio son datos derivados y figuras: un CSV con una fila por brazo de intervencion, un JSON de resumen de estadisticas validadas con hash de la fuente y cinco figuras en SVG (con renders PNG opcionales generados con ffmpeg). El script de analisis `analysis.py` utiliza unicamente la biblioteca estandar de Python y puede ejecutarse sin acceso a red ni descarga de dependencias.

Por tanto, esta ficha no puede documentar arquitectura, parametros, contexto ni cuantizacion: esos campos no existen en la informacion proporcionada. Lo que si se documenta es la metodologia experimental, la procedencia de los datos y las conclusiones declaradas por el autor, que son relevantes para investigadores en interpretabilidad y alineacion de modelos que quieran reproducir o auditar el estudio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene CSV, JSON y SVG) |
| Tipo de artefacto | auditoria reproducible de resultados experimentales |
| Autor | jprivera |
| Descargas | 0 |
| Likes | 0 |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-09-30 |
| Ultima actualizacion | 2026-09-30 |
| Entrada canonica | `../260922_fixed_dose_grid/report/grid.json` |
| Estado esperado del grid | COMPLETE |
| Brazos de intervencion analizados | 78 |
| Hash SHA-256 de la entrada | `4aaf05f2de4c61e77c47ac327d6b9bf258cba026d43ae80ab13264023319dabd` |
| Tamano de celda especializada | 2 familias x 4 metodos x 3 semillas de orden x 3 dosis = 72 |
| Tamano de celda retention-only | 2 familias x 1 orden x 3 dosis = 6 |

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura de red, numero de tokens de entrenamiento, composicion del dataset ni tecnicas de RLHF o DPO en el material disponible. El repositorio no es un modelo entrenado, sino un conjunto de resultados derivados de un experimento de intervencion sobre dos familias de modelos: Llama y Qwen. Las intervenciones evaluadas se agrupan en cuatro metodos (SFT, NPO+R, CWS y retention-only), aplicados sobre un grid de dosis fijas con tres semillas de orden de intervencion y tres niveles de dosis. Las semillas del grid primario son semillas de orden de intervencion sobre un unico organismo de semilla 0 por familia, no replicaciones de organismo.

El diseno experimental declara 78 brazos de intervencion parseados a partir del grid canonico. La evaluacion primaria se realiza sobre un subconjunto reservado pre-registrado equivalente a un tercio de los datos. El grid de dosis emparejadas iguala el numero de pasadas sobre el banco (bank passes), no la informacion, el rango, el computo ni el presupuesto de busqueda de hiperparametros. El autor no aporta detalles sobre tokenizacion, hiperparametros concretos ni volumen de datos mas alla de indicar que son especificos de cada familia.

## Capacidades

- Generacion de texto o inferencia: no disponible; el repositorio no contiene un modelo ejecutable.
- Analisis reproducible: `analysis.py` recompone las metricas por brazo a partir de la entrada canonica usando solo la biblioteca estandar de Python.
- Verificacion de integridad: el resumen de auditoria incluye el hash SHA-256 de la fuente, lo que permite comprobar que los datos derivados corresponden a la entrada declarada.
- Validacion de estado del grid: comprueba el estado `COMPLETE` y los 78 brazos de intervencion esperados.
- Generacion de figuras: cinco figuras en SVG (formato vectorial canonico) con conversion opcional a PNG mediante ffmpeg.
- Analisis de transferencia: compara reparacion del comportamiento capturado frente a transferencia a comportamientos no vistos.
- Analisis de interaccion metodo x familia a dosis final.
- Control de componentes: contraste entre NPO+R y retention-only.
- Firmas por comportamiento: transferencia por comportamiento a dosis final.
- Analisis de eficacia y precision: transferencia frente a precision en dominio limpio.
- Ejecucion sin red: el flujo de reproduccion funciona en modo offline (`uv run --offline --no-sync`).
- Tool calling, agentes, vision, audio y modo thinking: no disponibles.

## Casos de uso

- Auditoria de resultados de alineacion: un investigador puede clonar el directorio, ejecutar `analysis.py` con la entrada canonica y verificar que las metricas derivadas y el hash coinciden con los del estudio antes de citar cualquier cifra.
- Revision por pares de articulos sobre colusion entre modelos: el repositorio permite recalcular las 26 trayectorias agregadas de dosis y comprobar la afirmacion de monotonicidad sin depender de la infraestructura del autor.
- Estudio de transferencia entre comportamientos: los datos por brazo permiten analizar si la reparacion de una conducta colusiva observada se traslada a conductas no vistas, separando el exito en la tarea objetivo de la reparacion amplia.
- Comparacion entre familias de modelos: la interaccion metodo x familia a dosis final permite comprobar la inversion de signo entre Llama y Qwen para SFT y NPO+R.
- Analisis de coste y exposicion al banco de datos: los datos de las celdas retention-only y de CWS permiten estudiar la relacion entre numero de ramas entrenadas, computo y transferencia final.
- Docencia y formacion en metodologia experimental: el grid de dosis fijas con controles de orden y de componentes sirve como ejemplo de diseno con controles de componentes y evaluacion pre-registrada.
- Integracion en pipelines de verificacion: el script sin dependencias puede incorporarse a un job de CI que valide hashes y regenere figuras ante cambios en los datos fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, ya que el repositorio no contiene un modelo evaluado con esas metricas.

Los unicos resultados cuantitativos presentes son los hallazgos del propio estudio de auditoria, que se recogen a continuacion de forma literal, sin reinterpretacion:

| Hallazgo declarado | Detalle |
|---|---|
| Trayectorias de dosis monotonicas | 26 de 26 trayectorias agregadas de dosis son monotonicas |
| Inversion entre familias | SFT y NPO+R se invierten bruscamente entre Llama y Qwen, muy por encima del ruido de orden |
| Desacoplamiento | La reparacion del comportamiento capturado y la transferencia a comportamientos no vistos pueden desacoplarse |
| Retention-only | Supera a NPO+R a dosis final en ambas familias |
| CWS | Unico metodo con transferencia final alta en ambas familias; usa dos ramas entrenadas y en Qwen la honestidad en dominio capturado limpio cae al 64% |
| Conclusion principal | Corregir un comportamiento colusivo observado puede transferir con fuerza a comportamientos no vistos, pero el exito en la tarea objetivo no establece reparacion amplia |

## Requisitos de hardware

- Inferencia de modelo: no aplica; el repositorio no contiene pesos y no se puede ejecutar como modelo.
- VRAM estimada: no disponible.
- GPU recomendadas: no disponibles; el flujo de reproduccion no requiere GPU.
- Ejecucion en GPU de consumo: no aplica.
- Requisitos reales de reproduccion: interprete de Python con la herramienta `uv` y, para convertir las figuras vectoriales a PNG, `ffmpeg` instalado en el sistema.
- Dependencias de red: ninguna; el autor indica que no se requiere acceso a red ni descarga de dependencias.
- Dependencias de biblioteca: `analysis.py` usa exclusivamente la biblioteca estandar de Python.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables.
- Latencia y throughput: no disponibles; no se publican mediciones de tiempo de ejecucion del script.

## Comparativa con modelos similares

No disponible. El artefacto no es un modelo y no existe una categoria de modelos comparables directa. La comparacion relevante seria entre los metodos evaluados dentro del propio estudio, y el autor ya reporta esa comparacion interna:

| Metodo | Familia | Resultado declarado |
|---|---|---|
| SFT | Llama y Qwen | Se invierte bruscamente entre familias |
| NPO+R | Llama y Qwen | Se invierte bruscamente entre familias; queda por debajo de retention-only a dosis final en ambas familias |
| CWS | Llama y Qwen | Unica con transferencia final alta en ambas familias; requiere dos ramas entrenadas y aproximadamente el doble de exposicion al banco y de computo; en Qwen la honestidad en dominio capturado limpio baja al 64% |
| Retention-only | Llama y Qwen | Supera a NPO+R a dosis final en ambas familias |

## Limitaciones y advertencias

- El repositorio no contiene un modelo: no hay pesos, tokenizador, configuracion de inferencia ni pipeline declarado; no puede usarse para generar texto.
- La licencia no esta especificada, por lo que no se puede asumir permiso para uso comercial, redistribucion ni obra derivada.
- La evidencia se apoya en un solo organismo por familia y tres ejecuciones de orden de intervencion; no son replicaciones de organismo.
- Retention-only dispone de una unica ejecucion de orden, lo que limita la estimacion de variabilidad en esa condicion.
- CWS implica dos entrenamientos de rama y aproximadamente el doble de exposicion al banco y de computo, por lo que su comparacion con los demas metodos no esta igualada en coste.
- Los datos, hiperparametros, tokenizacion y pools de retencion son especificos de cada familia, lo que impide generalizar los resultados entre Llama y Qwen sin replicacion.
- La evaluacion primaria es el subconjunto reservado pre-registrado de un tercio; otras particiones pueden dar resultados distintos.
- El grid emparejado por dosis iguala pasadas sobre el banco, no informacion, rango, computo ni presupuesto de busqueda de hiperparametros; las comparaciones entre metodos no estan controladas en esas dimensiones.
- El autor advierte explicitamente de que los resultados no respaldan la afirmacion universal de que corregir un comportamiento repara todos los demas, y que los controles de componentes pueden invertir el mecanismo aparente.
- La model card exige leer `AUDIT_AND_STORY.md` antes de usar cualquier figura en un articulo.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y no se ha identificado revision externa ni publicacion asociada en la informacion disponible.
- No hay datos de sesgos, alucinacion, limites de contexto ni comportamiento multilingue, ya que el artefacto no es un modelo desplegable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jprivera/260922_2258UTC_chatgpt_spet22_graphs
- Documento de auditoria citado en la model card: `AUDIT_AND_STORY.md` (dentro del repositorio)
- Script de analisis: `experiments/260922_2258UTC_chatgpt_spet22_graphs/analysis.py`
- Entrada canonica del grid: `../260922_fixed_dose_grid/report/grid.json`
- Metricas derivadas por brazo: `data/derived_arm_metrics.csv`
- Resumen de auditoria validado: `data/audit_summary.json`
- Figuras: `figs/fig1_repair_vs_transfer.*`, `figs/fig2_family_interaction.*`, `figs/fig3_npo_component_control.*`, `figs/fig4_behavior_signatures.*`, `figs/fig5_efficacy_precision.*`
- Paper, blog, repositorio de codigo independiente o demo: no disponibles
- Los resultados de busqueda web proporcionados no contienen ningun enlace relevante para este artefacto y no se incluyen.
