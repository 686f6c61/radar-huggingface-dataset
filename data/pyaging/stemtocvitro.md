# pyaging/stemtocvitro

## Resumen

El modelo `pyaging/stemtocvitro` es un reloj epigenético de metilación de ADN desarrollado por el equipo de pyaging, una librería de Python especializada en relojes de envejecimiento. Predice la edad mitótica (número de divisiones celulares acumuladas) en células humanas cultivadas in vitro, a partir de la metilación del ADN en 629 CpGs asociados a duplicaciones poblacionales. El modelo utiliza una agregación del percentil 95 de esas mediciones, lo que lo convierte en una herramienta estadística ligera y fácil de integrar en pipelines de análisis de metilación.

Este reloj es un precursor in vitro del reloj stemTOC, y fue publicado en 2024 en Nature Communications por Zhu et al. Su relevancia radica en que permite cuantificar el desgaste replicativo de células cultivadas, un parámetro crítico en estudios de envejecimiento, reprogramación celular y control de calidad en terapias celulares. Al no ser una red neuronal, no requiere GPU ni grandes recursos computacionales, y se distribuye bajo licencia BSD-3-Clause, lo que facilita su uso comercial y académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agregación estadística del percentil 95 de metilación en 629 CpGs |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo no emplea una arquitectura de aprendizaje profundo, sino un cálculo estadístico determinista: para cada muestra, se extraen los niveles de metilación de 629 CpGs asociados a duplicaciones poblacionales y se calcula el percentil 95 de esos valores. Ese percentil se interpreta como una estimación de la edad mitótica de la célula o población celular. El entrenamiento se basó en datos de metilación de células humanas cultivadas de múltiples tejidos, aunque no se han publicado detalles sobre el conjunto de datos exacto, el número de muestras ni el procedimiento de validación. El modelo se distribuye a través de la librería `pyaging`, que gestiona la descarga de pesos y la integración con objetos AnnData.

## Capacidades

- Predicción de edad mitótica en células humanas cultivadas in vitro.
- Funciona con datos de metilación de ADN de tipo array o secuenciación, siempre que se puedan extraer los niveles de los 629 CpGs específicos.
- Aplicable a múltiples tejidos, pero exclusivamente en contextos de cultivo celular.
- No genera texto, no procesa lenguaje natural ni imágenes.
- No soporta tool calling ni razonamiento multi-paso.
- Capacidad multilingüe: no aplica.
- Integración sencilla con el ecosistema pyaging mediante `pya.pred.predict_age`.

## Casos de uso

- Investigación del envejecimiento replicativo: estimar la edad mitótica de cultivos primarios para correlacionar con fenotipos de senescencia.
- Control de calidad en terapias celulares: verificar que las células expandidas in vitro no hayan superado un umbral de divisiones que comprometa su funcionalidad.
- Estudios de reprogramación celular: comparar la edad mitótica de células iPSC frente a sus fibroblastos de origen para evaluar el rejuvenecimiento.
- Optimización de protocolos de cultivo: medir el impacto de diferentes medios o condiciones de crecimiento sobre la tasa de división acumulada.
- Validación de modelos de senescencia inducida: confirmar que tratamientos con agentes genotóxicos aumentan la edad mitótica estimada.
- Integración en pipelines de análisis de metilación: combinar la predicción con otros relojes epigenéticos disponibles en pyaging para obtener un perfil completo de envejecimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, correlación con edad cronológica ni comparaciones con otros relojes. Se recomienda consultar el artículo original (Zhu et al., 2024) para obtener datos de validación.

## Requisitos de hardware

- No requiere GPU: el cálculo del percentil 95 sobre 629 CpGs es trivial y se ejecuta en CPU en menos de un segundo.
- Memoria RAM: menos de 1 GB, ya que solo se manejan vectores de metilación de 629 posiciones por muestra.
- Compatible con cualquier sistema donde funcione Python y la librería `pyaging` (Linux, macOS, Windows).
- Despliegue: se integra directamente en scripts de análisis con AnnData; no requiere servidores de inferencia ni herramientas como vLLM u Ollama.
- Latencia: despreciable, del orden de milisegundos por muestra.

## Comparativa con modelos similares

No se dispone de datos comparativos específicos para `stemtocvitro` en la información proporcionada. Existen otros relojes epigenéticos como el reloj de Horvath (pan-tejido), PhenoAge o el propio stemTOC, pero no se han publicado métricas que permitan una comparación cuantitativa con este modelo. La principal diferencia conceptual es que `stemtocvitro` está diseñado exclusivamente para células cultivadas in vitro y se basa en un agregado estadístico simple, mientras que otros relojes suelen emplear regresiones lineales o modelos de elastic net sobre cientos de CpGs.

## Limitaciones y advertencias

- No es aplicable a tejidos in vivo ni a células que no hayan sido cultivadas, ya que fue entrenado específicamente con células humanas en cultivo.
- La agregación por percentil 95 puede ser sensible a valores atípicos de metilación, lo que podría generar estimaciones poco robustas en muestras con calidad de datos deficiente.
- No se han documentado sesgos poblacionales, pero al estar restringido a células humanas, su uso en otras especies requiere validación previa.
- La licencia BSD-3-Clause permite uso comercial, pero se debe citar la publicación original en cualquier trabajo derivado.
- No hay garantías de precisión en contextos distintos a los descritos en el artículo de Zhu et al. (2024); se recomienda validar en cada laboratorio antes de usar como métrica principal.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/stemtocvitro
- Publicación original: Zhu, Tianlei, et al. "An improved epigenetic counter to track mitotic age in cells." Nature Communications 15 (2024): 4211. DOI: https://doi.org/10.1038/s41467-024-48649-8
- Documentación de pyaging: https://pyaging.readthedocs.io
