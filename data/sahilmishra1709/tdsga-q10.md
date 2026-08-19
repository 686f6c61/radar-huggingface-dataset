# sahilmishra1709/tdsga-q10

## Resumen

El repositorio `sahilmishra1709/tdsga-q10` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono y consumo energético asociado a una ejecución de fine-tuning realizada como parte de la asignatura TDS GA8. El autor documenta las emisiones de CO₂ equivalente, el consumo eléctrico y las características del hardware utilizado durante el entrenamiento, siguiendo las directrices de un ejercicio académico sobre sostenibilidad en el entrenamiento de modelos.

La relevancia de este repositorio radica en su carácter de ejemplo práctico de medición de huella de carbono en el ciclo de vida de un modelo, utilizando la herramienta CodeCarbon. No se incluyen pesos, arquitectura ni artefactos de modelo descargables, y el repositorio no tiene descargas ni interacciones en HuggingFace. Su interés es exclusivamente metodológico y educativo dentro del contexto de la asignatura TDS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es un registro de contabilidad de carbono) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura del modelo subyacente, ya que el repositorio no documenta qué modelo se fine-tuneó ni con qué datos. Lo que sí se especifica es el modo de entrenamiento: fine-tuning sobre hardware NVIDIA A100 (8 GPUs) en la región europe-west4 de Google Cloud. El tiempo de cómputo fue de 315,3 horas GPU con un PUE (Power Usage Effectiveness) de 1,49, lo que resulta en un consumo energético total de 1503,35 kWh y unas emisiones de 300,67 kg de CO₂ equivalente, medidas con CodeCarbon.

No hay información sobre el dataset, el número de tokens, técnicas de alineación (RLHF, DPO) ni ninguna innovación técnica en el entrenamiento. El repositorio se centra exclusivamente en la auditoría energética del proceso.

## Capacidades

- No es un modelo desplegable: no ofrece generación de texto, razonamiento, código ni ninguna capacidad de inferencia.
- Función principal: documentar la huella de carbono de una ejecución de fine-tuning.
- Permite reproducir la metodología de medición con CodeCarbon para futuros entrenamientos.
- Sirve como plantilla académica para reportes de sostenibilidad en proyectos de IA.

## Casos de uso

- Auditoría de emisiones en proyectos de IA: el repositorio demuestra cómo registrar emisiones de CO₂ equivalente durante el entrenamiento, útil para equipos que necesiten reportar su impacto ambiental.
- Cumplimiento normativo: organizaciones que deban justificar su huella de carbono en procesos de fine-tuning pueden usar esta metodología como referencia.
- Educación en IA sostenible: material de ejemplo para asignaturas que enseñen prácticas de Green AI y medición de eficiencia energética.
- Optimización de infraestructura: los datos de PUE y consumo por hora GPU permiten comparar la eficiencia de diferentes configuraciones de hardware y regiones cloud.
- Benchmarking de centros de datos: los valores de energía y emisiones pueden contrastarse con otras regiones para decidir dónde desplegar entrenamientos de gran escala.
- Documentación de reproducibilidad: el registro de hardware, tiempo y región facilita la reproducibilidad de experimentos con conciencia energética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene métricas de calidad del modelo entrenado, solo métricas de consumo energético y emisiones.

## Requisitos de hardware

- El entrenamiento documentado utilizó 8 GPUs NVIDIA A100.
- Tiempo de cómputo: 315,3 horas GPU.
- Consumo energético total: 1503,35 kWh.
- PUE de la infraestructura: 1,49.
- Región de cómputo: europe-west4 (Google Cloud).
- No se especifican requisitos para inferencia porque no se distribuye ningún modelo.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, ya que este repositorio no contiene un modelo sino un registro de contabilidad de carbono. Otros repositorios de la organización TDSGA (como TDSGA5Q10 en GitHub) siguen el mismo patrón de documentación de asignaciones académicas, pero no son modelos comparables en términos de rendimiento.

## Limitaciones y advertencias

- No contiene pesos, arquitectura ni ningún artefacto utilizable para inferencia.
- No hay información sobre el modelo base que se fine-tuneó ni sobre los datos de entrenamiento.
- La licencia no está especificada, por lo que no se puede determinar si el contenido es reutilizable en proyectos comerciales.
- Las emisiones reportadas dependen del factor de emisión de la región europe-west4 y del PUE declarado; no son generalizables a otras infraestructuras.
- El repositorio tiene cero descargas y cero interacciones, lo que sugiere que es un artefacto académico sin mantenimiento activo.
- Los datos de emisiones provienen de CodeCarbon y pueden no reflejar la totalidad del ciclo de vida del hardware (fabricación, transporte, etc.).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sahilmishra1709/tdsga-q10
- Organización TDSGA en HuggingFace: https://huggingface.co/TDSGA/models
- Repositorio TDSGA5Q10 en GitHub: https://github.com/22f3002941/TDSGA5Q10
- README de TDSGA5Q10: https://github.com/22f3002941/TDSGA5Q10/blob/main/README.md
