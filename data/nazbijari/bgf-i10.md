# nazbijari/bgf-i10

## Resumen

BioGeoFormer 10% es un modelo de clasificación de texto publicado en HuggingFace por el usuario nazbijari. Su identidad sugiere que se trata de una variante reducida al 10% de un sistema más amplio denominado BioGeoFormer, probablemente orientado a dominios biológicos y geográficos, aunque la información disponible no especifica el conjunto de datos de entrenamiento ni las tareas concretas. El modelo cuenta con 74.814.762 parámetros en formato safetensors y está integrado en la librería transformers, según la ficha del repositorio.

La documentación pública es muy limitada: la model card solo contiene una frase y un enlace a un artículo de bioRxiv. No se indican tamaño de contexto, licencia, idiomas ni resultados de evaluaciones. La relevancia actual del modelo queda condicionada a la existencia de un artículo científico que aún no ha sido consultado en detalle, por lo que cualquier uso productivo requiere una verificación previa de su comportamiento y de las restricciones legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 74.814.762 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura, el proceso de entrenamiento ni la composición del dataset. El tag `cyc-esm` presente en el repositorio sugiere una posible relación con modelos tipo ESM (Evolutionary Scale Model), orientados a secuencias biológicas, pero esta hipótesis no está confirmada en la documentación. Tampoco se especifica si se emplearon técnicas de RLHF, DPO o ajustes adicionales. El único dato objetivo es que el pipeline declarado es `text-classification` y que el código personalizado (`custom_code`) es necesario para cargar el modelo.

## Capacidades

- Clasificación de texto: según el pipeline registrado en HuggingFace, el modelo está diseñado para tareas de clasificación de texto.
- No se ha confirmado soporte para generación de lenguaje, tool calling, agentes o razonamiento multi-paso.
- No se dispone de información sobre capacidades multilingües, visión o audio.
- El uso de `custom_code` implica que la carga del modelo requiere un script personalizado, lo que puede afectar a la portabilidad.

## Casos de uso

La información disponible no permite definir casos de uso específicos y validados. A continuación se enumeran aplicaciones potenciales, pero deben interpretarse como hipótesis generales para un modelo de clasificación de texto de este tamaño, no como características confirmadas:

- Clasificación de sentimientos en textos cortos: si el modelo ha sido entrenado para ello, podría utilizarse para analizar opiniones en redes sociales o reseñas, gracias a su reducido tamaño que permite despliegue en entornos con pocos recursos.
- Detección de spam o contenido no deseado: un clasificador binario de este tipo puede integrarse en pipelines de filtrado de correo o mensajería.
- Etiquetado automático de documentos: utilizable para organizar corpus de texto en categorías temáticas, siempre que el dominio de entrenamiento coincida con el corpus objetivo.
- Clasificación de secuencias biológicas: si la relación con Cyc-ESM se confirma, podría emplearse en tareas de anotación funcional o filtrado de proteínas por características estructurales.
- Análisis de datos georreferenciados: en caso de estar entrenado con información geográfica, podría clasificar categorías de terreno, tipos de cobertura o eventos naturales.
- Clasificación en entornos edge o móviles: por tener menos de 75 millones de parámetros, el modelo puede ejecutarse en dispositivos con memoria limitada, lo que lo haría adecuado para aplicaciones de clasificación en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 74,8 millones de parámetros, el modelo requiere aproximadamente 150 MB en FP16 y unos 300 MB en FP32. Por tanto, cabría en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de memoria, incluida una RTX 4060 o inferior. También es viable su ejecución en CPU.
- Capacidad en GPU de consumo: sí, se puede ejecutar en tarjetas de consumo (RTX 3050, RTX 4060, etc.) e incluso en gráficas integradas con suficiente memoria.
- Opciones de despliegue: se puede cargar mediante `transformers` y el script de código personalizado. Para entornos de inferencia escalada, sería necesario verificar la compatibilidad con vLLM o TGI. Si se convierte a GGUF, podría emplearse a través de llama.cpp u Ollama.
- Latencia y throughput: no se dispone de mediciones publicadas. Dado el tamaño del modelo, se espera una latencia de milisegundos por muestra en CPU o GPU, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No disponible. La informacion no permite establecer comparativas con modelos de la misma categoria, ya que no se especifican el dominio de aplicacion ni el conjunto de datos de entrenamiento. Cualquier comparacion con modelos como DistilBERT o MiniLM seria arbitraria y careceria de fundamento.

## Limitaciones y advertencias

- La licencia no esta disponible, lo que implica una incertidumbre juridica significativa para cualquier uso comercial o distribuido.
- No se conocen los idiomas soportados, por lo que el rendimiento fuera del idioma de entrenamiento es completamente impredecible.
- La documentacion es minima; no hay especificaciones de contexto, cuantizacion ni limitaciones de entrada.
- El uso de `custom_code` introduce un riesgo de seguridad potencial: el codigo personalizado debe ser auditado antes de su ejecucion.
- Los sesgos eticos y riesgos de alucinacion no estan documentados. Al tratarse de un clasificador, el riesgo de alucinacion es menor que en un modelo generativo, pero la ausencia de evaluaciones publicadas impide valorar su calidad.
- No existe informacion sobre la fecha o el proceso de entrenamiento, lo que dificulta la trazabilidad y la reproducibilidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nazbijari/bgf-i10
- Articulo en bioRxiv (referenciado en la model card): https://www.biorxiv.org/content/10.64898/2025.12.17.695047v1
