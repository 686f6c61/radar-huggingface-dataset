# mazuixiaodeng666/Qyunhan

## Resumen

Qyunhan es un paquete de software cientifico publicado en HuggingFace bajo el identificador `mazuixiaodeng666/Qyunhan` y licencia MIT. No es un modelo de lenguaje al uso, sino una implementacion de "celula virtual" a resolucion de programa con abstencion calibrada, orientada al triaje de dianas terapeuticas dirigidas al huesped en tuberculosis. El autor listado es `mazuixiaodeng666`, con contacto de Jiangdong Wu.

El sistema se divide en dos mitades complementarias. La primera, denominada "space", es un estimador de espacio latente compartido en forma cerrada que situa cuatro lineas celulares (K562, RPE1, HepG2 y Jurkat) en un espacio de baja dimension y predice la respuesta de una linea objetivo a partir de las lineas fuente en las que se midio la perturbacion. La segunda, "hold", es una capa de prediccion conformal partida sobre el error relativo, ordenada por una cabeza de dificultad, que decide si una afirmacion se entrega, se marca, se abstiene o se devuelve como experimento a realizar.

Su relevancia radica en el enfoque de "separar lo que sabe de lo que duda": en lugar de producir predicciones sin cualificacion, el paquete adjunta un radio de error por fila a un nivel nominal y clasifica cada fila en cuatro estados (aceptar, baja confianza, abstenerse, medir). La libreria declarada es `qyunhan` y el paquete depende unicamente de NumPy para su uso basico, con scripts de analisis que anaden PyTorch. No se dispone de informacion sobre arquitectura neuronal, parametros ni contexto, ya que no es un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Estimador de espacio latente compartido en forma cerrada (no neuronal) mas capa de prediccion conformal partida; paquete Python |
| Parametros totales | no disponible (no es un modelo con parametros entrenados en el sentido habitual) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre matrices de perturbaciones x genes) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT (solo el codigo; el texto del manuscrito, figuras y artefactos de resultados no estan cubiertos) |
| Formato de pesos | no disponible; el paquete se instala con `pip install -e .` y consume archivos de resultados `kt104_*`, `kt106_*` y `kt110_*` |

## Arquitectura y entrenamiento

Qyunhan no es un transformer ni un modelo generativo. El componente `qyunhan.estimator` implementa un estimador de espacio latente compartido en forma cerrada: ajusta un modelo por linea celular (`fit_line`), proyecta cada linea fuente al espacio latente (`project`), combina las proyecciones mediante un consenso (`consensus_latents`) y decodifica la prediccion para la linea objetivo (`decode`). El componente `qyunhan.conformal` construye intervalos de prediccion conformal partida sobre el error relativo, con radios por fila a un nivel nominal `alpha` y escalado mediante un proxy de magnitud sin etiquetas (`magnitude_proxy`). El componente `qyunhan.hardness` ajusta una cabeza de dificultad sin etiquetas de la linea objetivo, y `qyunhan.triage` produce la clasificacion en cuatro estados.

Los datos de entrenamiento y calibracion provienen del compendio esencial PIE del Arc Institute (publico), junto con conjuntos de genes MSigDB Hallmark 2020 y KEGG 2021 (descargados por el usuario, no redistribuidos), y recursos auxiliares publicos: DepMap CRISPRGeneEffect 26Q1, STRING v12, UniProtKB/Swiss-Prot 2025 y el checkpoint ESM2-t30-150M. La matriz pseudobulk de tuberculosis procede de la cohorte de los autores, bajo aprobacion etica KY20250227, y no es redistribuible. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si hubo RLHF o DPO (no aplica en este dominio). Como innovacion tecnica destacable, el paquete incorpora un autotest (`python -m qyunhan.selftest`) que verifica el estimador contra una senal sintetica de rango 4, comprueba que los intervalos de error relativo alcanzan su cobertura marginal nominal y reproduce los cuatro estados de la tabla de triaje; con `--results` recalcula los 42 valores impresos de la Tabla 3 (ablacion de abstencion) y la Tabla 6 (ablacion de numero de fuentes y transferencia de la cabeza de fiabilidad), que segun el autor reproducen a tres decimales.

## Capacidades

- Prediccion de respuesta a perturbaciones en lineas celulares: estima el perfil de programa de una linea objetivo a partir de las lineas fuente en las que se midio la perturbacion.
- Cuantificacion de incertidumbre: radios de error relativo por fila a un nivel nominal (`alpha`) mediante conformal partido.
- Ordenacion de dificultad sin etiquetas: la cabeza de dificultad ordena las filas por dificultad de prediccion sin requerir etiquetas de la linea objetivo.
- Triaje en cuatro estados: aceptar, baja confianza, abstenerse o devolver como experimento a medir.
- Integracion con recursos de biologia de sistemas: DepMap, STRING, UniProtKB y embeddings ESM2.
- Autotest reproducible: verificacion sintetica y reproduccion de tablas de resultados archivados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso generativo ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Triaje de dianas dirigidas al huesped en tuberculosis: el sistema prioriza candidatos y marca explicitamente cuales requieren validacion experimental, usando la capa conformal para acotar el error relativo de cada prediccion.
- Seleccion de experimentos a realizar: el estado "measure" del triaje identifica las filas donde la abstencion es preferible a una prediccion poco fiable, guiando el diseno experimental.
- Transferencia entre lineas celulares: prediccion de la respuesta de Jurkat a partir de K562, RPE1 y HepG2 cuando la perturbacion no se midio en la linea objetivo, con radio de error por fila.
- Analisis de sensibilidad al numero de fuentes: la Tabla 6 permite evaluar como cambia la fiabilidad al reducir el numero de lineas fuente disponibles, util para planificar compendios de perturbacion.
- Auditoria de cobertura estadistica: verificacion de que los intervalos de error relativo alcanzan su cobertura marginal nominal antes de desplegar el sistema en un pipeline de analisis.
- Integracion en pipelines bioinformaticos: al depender solo de NumPy en su uso basico, el paquete puede incorporarse en flujos de analisis existentes sin infraestructura de GPU.
- Reproducibilidad de resultados publicados: el autotest con `--results` permite a revisores y editores recomprobar los valores de las tablas 3 y 6 a partir de los archivos archivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido de MMLU, HumanEval o GSM8K, que no aplican a este dominio. El autor menciona la reproduccion de 42 valores de las Tablas 3 (ablacion de abstencion) y 6 (ablacion de numero de fuentes y transferencia de la cabeza de fiabilidad) a tres decimales, pero no se proporcionan los valores numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el paquete usa solo NumPy en su uso basico y no requiere GPU.
- GPU recomendadas: no disponible; los scripts de analisis en `code/` anaden PyTorch y podrian beneficiarse de GPU, pero no se especifica cual.
- Cabe en consumer GPU: si, en la medida en que el uso basico no requiere GPU; el checkpoint ESM2-t30-150M (150M parametros) es ligero y cabe en cualquier GPU consumer.
- Opciones de despliegue: instalacion via `pip install -e .`, ejecucion del autotest con `python -m qyunhan.selftest` y scripts de analisis en `code/` (kt109-kt120). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de celula virtual con abstencion calibrada ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de NLP.
- Ambito restringido a cuatro lineas celulares (K562, RPE1, HepG2, Jurkat) y a la tarea de respuesta a perturbaciones; la generalizacion a otras lineas no esta documentada.
- La matriz pseudobulk de tuberculosis no es redistribuible y solo esta disponible del contacto principal bajo la aprobacion etica KY20250227, lo que limita la reproduccion independiente en ese dominio.
- Los conjuntos MSigDB Hallmark 2020 y KEGG 2021 deben descargarse por el usuario; no se redistribuyen.
- Los artefactos de resultados y figuras se suministran a editores y revisores bajo peticion mientras el manuscrito esta en revision, lo que puede dificultar la verificacion externa.
- La licencia MIT cubre solo el codigo; el texto del manuscrito, las figuras y los artefactos de resultados no estan cubiertos, lo que restringe su reutilizacion comercial.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero las predicciones sin estado de abstencion no deben interpretarse como afirmaciones de confianza; el propio diseno separa prediccion de fiabilidad.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el 2026-11-01, por lo que no hay evidencia de uso o validacion por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/mazuixiaodeng666/Qyunhan
- Contacto: Jiangdong Wu — 1556874645@qq.com
- Compendio PIE esencial (Arc Institute): no disponible como enlace directo en la informacion proporcionada
- MSigDB Hallmark 2020 y KEGG 2021: descarga por el usuario desde MSigDB (sin enlace directo proporcionado)
- DepMap CRISPRGeneEffect 26Q1, STRING v12, UniProtKB/Swiss-Prot 2025, ESM2-t30-150M: recursos publicos sin enlace directo proporcionado
