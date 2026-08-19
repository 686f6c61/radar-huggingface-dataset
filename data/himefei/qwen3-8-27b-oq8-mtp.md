# himefei/Qwen3.8-27B-oQ8-mtp

## Resumen
El repositorio `himefei/Qwen3.8-27B-oQ8-mtp` contiene una cuantizacion de 8 bits de un modelo basado en la arquitectura `qwen3_5`, realizada con la herramienta oQ (oMLX v0.6.0.dev1) en formato MLX safetensors. El autor, himefei, ha publicado este checkpoint con el objetivo de ofrecer una version optimizada para inferencia local en hardware Apple Silicon, reduciendo el uso de memoria mediante cuantizacion mixta de precision fija.

Existe una discrepancia significativa entre el nombre del repositorio, que indica "27B", y los datos reales de los safetensors, que registran un total de 8.184.279.792 parametros (aproximadamente 8,18B). Este ultimo dato es el unico verificable a partir de la informacion proporcionada. El tamano del repositorio es de 30,0 GB, lo que sugiere que los pesos cuantizados ocupan ese espacio en disco. La licencia, los idiomas soportados y el pipeline no estan especificados en la ficha de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (segun la model card) |
| Parametros totales | 8.184.279.792 (8,18B) segun safetensors; el nombre del repo indica "27B" sin verificacion |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (oQ), group size 64 |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento
No se dispone de informacion sobre el entrenamiento del modelo base, ya que la model card solo documenta el proceso de cuantizacion. El checkpoint es una cuantizacion de un modelo de tipo `qwen3_5` realizada con oMLX v0.6.0.dev1, utilizando el esquema oQ (plain) en lugar de oQ+ u oQe. El autor justifica esta eleccion indicando que el soporte oficial de Qwen3.8 en oMLX aun no esta fusionado (se encuentra como un pull request en borrador), por lo que la ruta calibrada con imatrix (oQe) no ha sido validada para esta arquitectura. Ademas, oQ8 emplea una asignacion heuristica de bits fija, por lo que la calibracion imatrix no alteraria significativamente el resultado a 8 bits. No se proporcionan datos sobre el dataset de entrenamiento, el numero de tokens, ni tecnicas como RLHF o DPO.

## Capacidades
- No es posible determinar las capacidades funcionales del modelo base (generacion de texto, razonamiento, codigo, matematicas, vision, etc.) a partir de la informacion disponible.
- No se especifica soporte para tool calling, function calling, agentes o multi-step reasoning.
- No se indican capacidades multilingues ni modos especiales (thinking mode, vision, audio).
- Unicamente se confirma que es un modelo cuantizado a 8 bits en formato MLX, disenado para ejecucion en el ecosistema MLX de Apple.

## Casos de uso
No se pueden determinar casos de uso especificos y concretos sin conocer las capacidades del modelo base. La informacion disponible solo permite inferir un proposito general:
- Inferencia local en dispositivos Apple Silicon: al estar en formato MLX safetensors y cuantizado a 8 bits, el modelo esta preparado para cargarse en memoria unificada de Macs con chip M-series. Sin embargo, al no conocer el modelo base, no se puede especificar para que tareas es adecuado (chat, codigo, etc.).
- Experimentacion con cuantizacion oQ: el repositorio puede servir como referencia para evaluar la calidad de la cuantizacion oQ8 en la arquitectura `qwen3_5`, aunque no se aportan metricas de calidad.
- Despliegue en entornos donde se requiera un checkpoint MLX de 8 bits con un tamano de repositorio de 30 GB, asumiendo que el usuario conoce previamente el comportamiento del modelo base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este checkpoint cuantizado ni para el modelo base.

## Requisitos de hardware
- Memoria unificada estimada: el tamano del repositorio es de 30,0 GB, por lo que se estima que la carga de los pesos requerira al menos 30 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: no aplica (formato MLX exclusivo para Apple Silicon). Se recomienda un Mac con chip M-series y al menos 32 GB de RAM unificada para evitar intercambio a disco.
- Compatibilidad con GPU de consumo: no aplica para GPU NVIDIA o AMD; el formato MLX esta restringido al ecosistema Apple.
- Opciones de despliegue: oMLX (framework utilizado para la cuantizacion) y MLX. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. No se puede establecer una comparativa fiable con otros modelos (como Qwen3-8B, Qwen3-30B-A3B u otras variantes) porque se desconoce la identidad exacta del modelo base `qwen3_5` y no se dispone de datos de rendimiento. La discrepancia entre el nombre ("27B") y los parametros reales (8,18B) impide cualquier clasificacion por tamano.

## Limitaciones y advertencias
- Discrepancia critica entre el nombre del repositorio ("27B") y los parametros totales reales (8,18B). Esta inconsistencia debe resolverse antes de cualquier uso en produccion.
- Licencia no disponible: no se puede garantizar el uso comercial, la redistribucion ni la atribucion requerida.
- Idiomas soportados no especificados: se desconoce el alcance multilingue.
- Riesgo de alucinacion y sesgos desconocidos: al no existir informacion sobre el entrenamiento del modelo base, no se pueden evaluar estos riesgos.
- Naturaleza experimental de la cuantizacion: el autor indica que el soporte para esta arquitectura en oMLX aun no esta fusionado oficialmente, lo que implica un riesgo de estabilidad o correccion en la implementacion.
- Sin benchmarks publicados: no hay evidencia objetiva de la calidad del modelo tras la cuantizacion.
- Formato restrictivo: al ser MLX safetensors, no es directamente utilizable en entornos CUDA o con frameworks estandar como Transformers sin una conversion previa.

## Enlaces
- Repositorio de HuggingFace: https://huggingface.co/himefei/Qwen3.8-27B-oQ8-mtp
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
