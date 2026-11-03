# sawcheet/immunomap-scanvi-v1

## Resumen

ImmunoMap scANVI bundle (immunomap-scanvi-v1) es un paquete de anotación de tipos celulares para datos de scRNA-seq de sangre periférica humana (PBMC), publicado por el autor sawcheet en HuggingFace. No es un modelo de lenguaje: se trata de un artefacto de `scvi-tools` que agrupa dos modelos de referencia scANVI (uno de granularidad gruesa y otro fina), calibración de temperatura con umbrales para la clase Unknown, un detector de novedad basado en distancia a la referencia, una lista de 3.002 genes, un árbol de etiquetas y reglas de control de calidad.

El problema que resuelve es la anotación automática y transferible de tipos celulares en experimentos de citometría de secuenciación de ARN de célula única, un paso habitualmente manual y costoso. La relevancia actual del bundle radica en que incluye mecanismos explícitos para detectar células fuera de la distribución de referencia (clase Unknown y detector de novedad), lo que mitiga uno de los fallos clásicos de los clasificadores supervisados de anotación celular.

El paquete se entrenó sobre datos de CELLxGENE Census (2025-11-08) de tres estudios de referencia y se evaluó en donantes retenidos y en estudios externos no vistos durante el entrenamiento (Hao 2021 y controles sanos de una cohorte de lupus). El tamaño del repositorio es de aproximadamente 0,1 GB y los pesos se distribuyen en formato joblib propio de scvi-tools.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | scANVI (variational autoencoder semi-supervisado de scvi-tools) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; opera sobre matrices de expresión génica por célula) |
| Tipos de cuantizacion | no disponible (artefacto joblib; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | joblib (bundle de scvi-tools) |
| Numero de genes de entrada | 3.002 |
| Tamano del repositorio | ~0,1 GB |
| Libreria | scvi-tools |

## Arquitectura y entrenamiento

El bundle se apoya en scANVI, un modelo generativo variacional (VAE) semi-supervisado de la familia scvi-tools que combina un autoencoder variacional con una clasificación supervisada de etiquetas celulares, de modo que la representación latente se estructura tanto por la reconstrucción de la expresión génica como por las anotaciones disponibles. El paquete contiene dos instancias entrenadas: una para etiquetas de tipo celular gruesas y otra para etiquetas finas, lo que permite elegir el nivel de granularidad de la anotación.

El entrenamiento usó como referencia tres estudios de CELLxGENE Census (versión 2025-11-08) y una lista fija de 3.002 genes como espacio de entrada. La evaluación se realizó sobre donantes retenidos de los propios estudios y sobre estudios externos nunca vistos (Hao 2021 y los controles sanos de una cohorte de lupus). Además de los dos clasificadores, el paquete incorpora calibración de temperatura con umbrales para la clase Unknown, un detector de novedad por distancia a la referencia, un árbol de etiquetas y reglas de QC, componentes que en conjunto definen el comportamiento del sistema más allá de la red neuronal.

## Capacidades

- Anotación automática de tipos celulares en scRNA-seq de PBMC humana a dos niveles de granularidad (gruesa y fina).
- Detección de células fuera de la distribución de referencia mediante la clase Unknown con umbrales calibrados por temperatura.
- Detección de novedad por distancia a la referencia, complementaria a la clase Unknown.
- Aplicación de reglas de control de calidad sobre las células de entrada.
- Integración con el ecosistema scvi-tools para carga del bundle y ejecución de la inferencia.
- Mapeo de etiquetas jerárquico mediante el árbol de etiquetas incluido.
- No soporta tool calling, agentes, generación de texto, visión, audio ni capacidades multilingües.

## Casos de uso

- Anotación de experimentos de PBMC en investigación inmunológica: el bundle permite asignar etiquetas gruesas y finas a matrices de scRNA-seq humana con una única llamada, sustituyendo la anotación manual por marcadores.
- Análisis de cohorts externas con desplazamiento de dominio: el detector de novedad y la clase Unknown permiten identificar poblaciones celulares no representadas en la referencia, útil al procesar estudios de otros laboratorios o plataformas.
- Triaje de células dudosas: los umbrales calibrados permiten separar células asignables con confianza de aquellas que conviene revisar manualmente, reduciendo el coste de curación.
- Estudios de lupus y otras enfermedades autoinmunes: el bundle se evaluó en controles sanos de una cohorte de lupus, por lo que puede emplearse como línea base de anotación en ese contexto, siempre validando contra marcadores.
- Integración en pipelines de análisis de célula única: al ser un artefacto de scvi-tools en formato joblib, se puede cargar directamente en flujos de Python que ya usan scanpy y scvi-tools.
- Reproducibilidad de anotaciones entre proyectos: fijar una referencia común con árbol de etiquetas y reglas de QC facilita comparar anotaciones entre estudios distintos.
- Docencia y prototipado: el demo en HuggingFace Spaces permite probar la anotación sin montar infraestructura local.

## Benchmarks y rendimiento

Los valores de macro-F1 publicados en la model card son los siguientes. "test" y "val" agregan los estudios de referencia; las claves `external_*` corresponden a estudios no vistos en entrenamiento.

| Conjunto | Coarse (macro-F1) | Fine (macro-F1) |
|---|---|---|
| test (agregado) | 0,9661 | 0,9478 |
| test_aida | 0,9599 | 0,9616 |
| test_sound_life | 0,9807 | 0,9548 |
| test_onek1k | 0,9176 | 0,9179 |
| val (agregado) | 0,9660 | 0,9507 |
| val_aida | 0,9649 | 0,9623 |
| val_sound_life | 0,9804 | 0,9566 |
| val_onek1k | 0,9233 | 0,9211 |
| external_ext_lupus | 0,9479 | 0,9732 |
| external_ext_hao2021 | 0,9074 | 0,8553 |

No se han publicado otros resultados de benchmarks (por ejemplo, comparaciones con CellTypist, Azimuth o clasificadores alternativos) en la información disponible.

## Requisitos de hardware

- El repositorio ocupa aproximadamente 0,1 GB, por lo que el bundle cabe holgadamente en memoria de cualquier equipo de análisis.
- La inferencia se ejecuta sobre CPU; no se documentan requisitos de GPU en la información disponible.
- No se especifican GPU recomendadas ni requisitos de VRAM.
- No se documentan opciones de despliegue alternativas a scvi-tools; el paquete se carga como artefacto joblib dentro de Python.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Referencia de entrenamiento | Salida Unknown / novedad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| immunomap-scanvi-v1 | scANVI (scvi-tools) | CELLxGENE Census 2025-11-08, 3 estudios | Sí (umbral calibrado + detector de distancia) | no disponible | HuggingFace + GitHub + demo |
| CellTypist | Regresión logística sobre genes | Distintos atlas inmunes | No documentado en esta ficha | no disponible | no disponible |
| Azimuth | Mapeo a referencia Seurat | Atlas de referencia específicos | No documentado en esta ficha | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estos sistemas en la información proporcionada; la comparativa se limita a la naturaleza del método y a la disponibilidad de mecanismos de detección de novedad.

## Limitaciones y advertencias

- Solo cubre sangre periférica humana (PBMC); no debe aplicarse a tejidos sólidos ni a otras especies.
- Los tipos celulares nuevos cercanos a uno conocido pueden etiquetarse erróneamente como ese tipo conocido, pese al detector de novedad.
- La licencia no está declarada en la información disponible, por lo que el uso comercial queda sin garantías hasta que el autor la especifique.
- La model card indica explícitamente "research use only": no es apto para uso clínico ni diagnóstico.
- El rendimiento cae en estudios externos: el macro-F1 fino baja a 0,8553 en Hao 2021 frente a 0,9478 en el test agregado, lo que refleja sensibilidad al desplazamiento de dominio.
- No se documentan sesgos demográficos ni de composición de la referencia más allá de los tres estudios de CELLxGENE utilizados.
- El rendimiento depende de que la entrada use exactamente la lista de 3.002 genes incluida en el bundle.
- No se especifican parámetros totales ni detalles de la arquitectura interna, lo que limita la auditoría técnica del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sawcheet/immunomap-scanvi-v1
- Código y evaluación: https://github.com/sachitsatyal/Immunomap
- Demo: https://huggingface.co/spaces/sawcheet/immunomap
