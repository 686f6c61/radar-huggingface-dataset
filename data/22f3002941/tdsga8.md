# 22f3002941/TDSGA8

## Resumen

El repositorio `22f3002941/TDSGA8` en Hugging Face no contiene un modelo de inteligencia artificial propiamente dicho, sino una documentación de contabilidad de carbono asociada a un entrenamiento realizado en el marco de la asignatura TDS GA8. La model card publicada se limita a registrar las emisiones de CO₂ equivalente generadas durante un proceso de preentrenamiento, con datos de consumo energético, hardware utilizado y ubicación geográfica. No se proporciona ningún artefacto de modelo, pesos, configuración de arquitectura ni información sobre capacidades.

Este tipo de repositorios suelen ser ejercicios académicos centrados en la sostenibilidad y la medición del impacto ambiental del entrenamiento de modelos, más que en la publicación de un modelo funcional. Por tanto, cualquier evaluación técnica del modelo en sí es imposible con la información disponible. La relevancia de esta ficha se limita a documentar la ausencia de datos y a señalar que el contenido es exclusivamente una auditoría de emisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo, el número de parámetros, la composición del dataset de entrenamiento ni las técnicas de optimización empleadas. La única información de entrenamiento disponible es la siguiente: se utilizó una GPU NVIDIA A100 durante 208,3 horas, con un factor de eficiencia energética (PUE) de 1,5, en la región `ap-southeast1`. El consumo energético total fue de 124,98 kWh y las emisiones de carbono asociadas se calcularon en 59,990 kg CO₂eq, según la metodología de CodeCarbon. No se indica el tipo de modelo, el volumen de datos ni el proceso de entrenamiento (por ejemplo, si hubo fases de ajuste fino o RLHF).

## Capacidades

No se ha publicado ninguna capacidad del modelo. No hay evidencia de que el repositorio contenga un modelo funcional, por lo que no se pueden listar capacidades de generación de texto, razonamiento, código, visión, tool calling, agentes o multilingüismo. La única información verificable es la relativa a la contabilidad de emisiones del entrenamiento.

## Casos de uso

No se pueden proponer casos de uso prácticos para un modelo que no existe o del que no se ha publicado ninguna información funcional. El repositorio podría servir como ejemplo de buenas prácticas en la documentación de emisiones de carbono para fines académicos o de auditoría ambiental, pero no como un modelo desplegable en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existe ningún dato de rendimiento en tareas como MMLU, HumanEval, GSM8K u otras.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware para inferencia, ya que no hay un modelo publicado. El único dato de hardware corresponde al entrenamiento: una GPU NVIDIA A100, sin especificar VRAM ni configuración adicional. No se puede estimar VRAM, latencia ni throughput para inferencia.

## Comparativa con modelos similares

No disponible. Al no existir un modelo funcional ni especificaciones técnicas, no es posible compararlo con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA utilizable; es únicamente una documentación de emisiones de carbono.
- No hay información sobre sesgos, alucinaciones, limitaciones de contexto o idioma, ni restricciones de licencia.
- La licencia no está especificada, por lo que no se puede determinar si el contenido es reutilizable o tiene restricciones comerciales.
- Cualquier intento de utilizar este repositorio como un modelo de IA en producción carece de fundamento técnico.
- Los datos de emisiones se basan en estimaciones de CodeCarbon y pueden no reflejar el impacto real completo (por ejemplo, no se incluyen emisiones de fabricación de hardware).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/22f3002941/TDSGA8
- Repositorios similares de la misma asignatura: https://huggingface.co/Pranav0009/tds-ga8 y https://huggingface.co/dumaloocanlearn/tds-ga-8
