# nirjhor123/mirrordna-tiny

## Resumen

MirrorDNA (variante `mirrordna-tiny`) es un modelo de lenguaje de ADN de pequeno tamano (2,35 millones de parametros) desarrollado por nirjhor123, orientado a tareas de clasificacion y regresion sobre secuencias genomicas. Su caracteristica diferencial es un tokenizador aprendido que es exactamente equivariante al complemento inverso: un router simetrico de fronteras corta una secuencia y su complemento inverso en fragmentos que son imagen especular entre si para cualquier valor de los parametros, de modo que ambas hebras del mismo ADN reciben la misma tokenizacion. Esta propiedad se mantiene de forma exacta, no aproximada.

El modelo se entrena con modelado de lenguaje enmascarado (MLM) sobre el genoma humano hg38, usando ventanas de 1.024 pb y aproximadamente 10,5 mil millones de bases en 10.000 pasos, con un 15 % de bases enmascaradas. Se distribuye como modelo de investigacion para ajuste fino, no como modelo listo para produccion, y esta acompanado de un articulo en envio a RECOMB 2027 y de un repositorio de codigo con los scripts de evaluacion.

Su relevancia reside en la invariancia de hebra: muchas tareas genomicas (prediccion de elementos regulatorios, clasificacion de regiones) no deberian depender de la orientacion de la secuencia, y MirrorDNA garantiza esa simetria por construccion en lugar de mediante aumento de datos. El modelo es deliberadamente pequeno y esta pensado como prueba de concepto de la tokenizacion equivariante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder convolucional con pesos compartidos y router simetrico de fronteras (tokenizador aprendido) |
| Parametros totales | 2.348.356 (2,35 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 1.024 pb (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (secuencias de ADN: A, C, G, T, N codificados como 0-4) |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos) + codigo Python del modelo almacenado en el repo (`rcchunk`) |

## Arquitectura y entrenamiento

El modelo es un encoder convolucional ligero con pesos compartidos entre hebras y un router simetrico que aprende las fronteras de fragmentacion de la secuencia. La innovacion central es que el router es simetrico respecto al complemento inverso: para cualquier configuracion de parametros, la secuencia y su complemento inverso se cortan en fragmentos espejo, lo que convierte la equivariancia de hebra en una propiedad exacta del tokenizador y no en una aproximacion estadistica. El modelo expone dos salidas de caracteristicas: `pooled_features` (invariancia de hebra, para etiquetas que no dependen de la orientacion) y `pooled_features(oriented=True)` (caracteristicas sensibles a la orientacion, para etiquetas dependientes de hebra como promotores, sitios de splicing u orientacion genica).

El preentrenamiento se realizo con modelado de lenguaje enmascarado sobre hg38, usando los intervalos de entrenamiento de Basenji/Enformer, ventanas de 1.024 pb, 2^20 bases por paso durante 10.000 pasos (unos 10,5 mil millones de bases) y un 15 % de bases enmascaradas. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; el modelo no es generativo autoregresivo en el sentido habitual, sino un encoder para extraccion de representaciones y ajuste fino.

## Capacidades

- Extraccion de representaciones de secuencias de ADN mediante un encoder convolucional con pooling.
- Tokenizacion aprendida y exactamente equivariante al complemento inverso.
- Caracteristicas invariantes de hebra (`pooled_features`) para etiquetas independientes de la orientacion.
- Caracteristicas sensibles a la orientacion (`pooled_features(oriented=True)`) para etiquetas dependientes de hebra.
- Prediccion de fronteras de fragmentacion (`out["cut"]`) mediante el router simetrico.
- Ajuste fino para clasificacion y regresion sobre secuencias genomicas.
- Codificacion de bases A, C, G, T, N como enteros 0-4 y utilidad `rk.encode`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo conversacional.
- No soporta vision, audio ni capacidades multilingues en el sentido de lenguaje natural.

## Casos de uso

- Clasificacion de elementos regulatorios: ajuste fino del encoder sobre ventanas de 1.024 pb para predecir enhancers o promotores, usando caracteristicas invariantes de hebra cuando la etiqueta no depende de la orientacion.
- Prediccion de sitios de splicing: uso de `pooled_features(oriented=True)` para tareas dependientes de la hebra, donde la orientacion del gen importa.
- Prediccion de orientacion genica: el modelo puede ajustarse para distinguir hebras gracias a sus caracteristicas orientadas, algo que un encoder estandar no garantiza.
- Investigacion sobre tokenizacion genomica: banco de pruebas reproducible para comparar tokenizadores equivariantes frente a k-mers fijos, con codigo y benchmarks publicados en el repositorio.
- Filtrado de variantes y regiones candidatas: regresion sobre secuencias para priorizar regiones en estudios de asociacion, como primer paso antes de modelos mayores.
- Prototipado rapido en entornos con pocos recursos: con 2,35 M de parametros y pesos safetensors, el modelo se ejecuta en CPU y en GPUs de gama baja, lo que permite iterar sobre pipelines de datos antes de escalar a modelos como Enformer.
- Docencia y validacion de pipelines genomicos: ejemplo minimo y de licencia MIT para ensenar preprocesado de ADN, enmascarado y evaluacion de representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al articulo y al repositorio de GitHub para los benchmarks y analisis, e indica que modelos mas grandes son mas precisos en varios de ellos, sin aportar cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en precision completa (2,35 M de parametros), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU con al menos 1 GB de memoria es suficiente. Para lotes grandes, una RTX 3060 o superior es mas que suficiente.
- Cabe en GPU consumer: si, en todas las gamas actuales; tambien se ejecuta en CPU sin problema.
- Opciones de despliegue: PyTorch nativo (el codigo del modelo se distribuye junto a los pesos en el repo y se carga con `snapshot_download` + `safetensors`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MirrorDNA (mirrordna-tiny) | 2,35 M | 1.024 pb | Encoder convolucional con tokenizador equivariante al complemento inverso | MIT | Hugging Face + GitHub |
| DNABERT-2 | ~117 M | ~512 pb (k-mer) | Transformer con tokenizacion BPE de genoma | MIT | Hugging Face |
| Nucleotide Transformer | 500 M - 2,5 B | 1.000 - 12.000 pb | Transformer entrenado en multi-especie | CC-BY-NC-SA 4.0 (variantes) | Hugging Face |
| Enformer | ~250 M | ~200 kb | Transformer con atencion sobre regiones largas | Apache 2.0 (codigo) / no comercial en pesos | GitHub |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo de investigacion: la model card lo describe explicitamente como modelo para clasificacion y regresion con ajuste fino, no para uso directo en produccion.
- Entrenado solo con genoma humano (hg38) y ventanas de 1 kb: puede generalizar mal a otras especies o a contextos mas largos.
- Tamano muy reducido: segun el propio autor, modelos mas grandes son mas precisos en varios benchmarks.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero las predicciones sobre secuencias fuera de distribucion pueden ser poco fiables y no deben interpretarse como evidencia biologica sin validacion experimental.
- Eleccion de caracteristicas critica: usar caracteristicas invariantes de hebra para etiquetas dependientes de la orientacion (promotores, splicing, orientacion genica) produce resultados incorrectos; en esos casos hay que usar `oriented=True`.
- Licencia MIT: permite uso comercial, pero el modelo se distribuye sin garantias y el articulo esta en envio, por lo que la documentacion puede cambiar.
- Sesgos: no documentados; el sesgo de composicion del genoma humano (contenido GC, regiones repetitivas) puede trasladarse a las predicciones.
- Idiomas: no aplica; solo procesa secuencias de ADN codificadas como enteros 0-4.
- Sin soporte documentado de cuantizacion ni de motores de inferencia estandar, lo que limita su integracion en pilas de despliegue habituales.

## Enlaces

- Hugging Face: https://huggingface.co/nirjhor123/mirrordna-tiny
- Codigo y benchmarks: https://github.com/NIRJHOR-DATTA/MirrorDNA
- Articulo: *Learning Strand-Equivariant Tokenizations of DNA with MirrorDNA* (RECOMB 2027, en envio; sin enlace disponible)
- Cita: pendiente de publicacion segun la model card
