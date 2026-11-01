# chiffonng/incidentbench-silver_human

## Resumen

`incidentbench-silver_human` es un adaptador LoRA de rango 16 entrenado sobre el modelo base Qwen2.5-7B-Instruct, publicado por el usuario chiffonng. Su proposito es actuar como clasificador conjunto dentro de IncidentBench: a partir de una unica respuesta generada, el adaptador determina simultaneamente si existe un incidente y, en su caso, a cual de siete dominios de riesgo definidos por MIT pertenece; alternativamente puede devolver la etiqueta `No incident (potential only)`.

El adaptador se ha entrenado sobre el conjunto `Silver_train`, sustituyendo en sus filas la etiqueta plateada por la etiqueta humana de `human_train` cuando esta disponible, y tratando las alegaciones como no incidentes. Es importante subrayar que las etiquetas de entrenamiento son generadas por modelo ("silver") siguiendo la guia de anotacion del proyecto, no oro humano, por lo que se trata de un artefacto de investigacion y no de un sistema listo para produccion.

El modelo tiene un interes limitado fuera del contexto de IncidentBench: cuenta con 12 descargas, ninguna valoracion positiva y no declara idiomas soportados ni pipeline. Su relevancia actual radica en servir como brazo de ablacion dentro de un estudio comparativo de clasificadores de incidentes, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | no disponible (adaptador LoRA sobre base de 7B; tamano de repo 0.2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-7B-Instruct; no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT, aplicado sin fusionar sobre el modelo base) |

## Arquitectura y entrenamiento

Se trata de un adaptador PEFT de tipo LoRA con rango 16 aplicado sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7 mil millones de parametros. El adaptador no se fusiona con el modelo base: en todas las ejecuciones reportadas se aplica en caliente sobre Qwen2.5-7B-Instruct, de modo que el coste de almacenamiento es minimo (0.2 GB de repositorio) pero la inferencia requiere cargar el modelo base completo.

El entrenamiento utiliza el conjunto `Silver_train` con las etiquetas humanas de `human_train` reemplazando la etiqueta plateada en las filas correspondientes. Las etiquetas son generadas por modelo siguiendo la guia de anotacion del proyecto, no anotaciones humanas de referencia. La pila de entrenamiento declarada es transformers 5.9.0 y peft 0.19.1. El prompt de inferencia debe replicar la transformacion `orig` de `train/build_data.py`, y la decodificacion recomendada es greedy. Los detalles de filas, hashes y receta estan en `data_manifest.json` y `train_manifest.json` del repositorio.

## Capacidades

- Clasificacion conjunta de incidentes: una unica respuesta del modelo codifica tanto la deteccion (incidente si/no) como la categoria de riesgo.
- Categorizacion en siete dominios de riesgo definidos por MIT.
- Emision de la etiqueta `No incident (potential only)` para casos que no constituyen incidente pero presentan potencial de riesgo.
- Clasificacion de texto de entrada segun el prompt especifico del brazo (`orig`), con decodificacion greedy.
- No dispone de capacidades declaradas de tool calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues no declaradas en la informacion disponible.

## Casos de uso

- Investigacion comparativa de clasificadores de incidentes: el adaptador sirve como brazo de ablacion ("silver con etiquetas humanas") frente a otros brazos del estudio IncidentBench, permitiendo medir el efecto de la composicion de etiquetas en el rendimiento.
- Analisis de riesgo en entornos controlados de laboratorio: clasificar descripciones de sistemas en los siete dominios MIT para estudiar la taxonomia, sin que las salidas se usen para decisiones reales.
- Estudio de sensibilidad a etiquetas ruidosas: comparar este adaptador con variantes entrenadas solo con etiquetas silver para cuantificar el impacto de las etiquetas humanas parciales.
- Reproduccion de resultados del informe IncidentBench: desplegar el adaptador con vLLM y el prompt `orig` para replicar las cifras publicadas.
- Generacion de conjuntos de datos etiquetados de forma automatica en el ambito de seguridad de sistemas, siempre con revision humana posterior dado el sesgo documentado a infradetectar.
- Docencia y formacion en evaluacion de modelos: ejemplo practico de adaptador LoRA sobre un modelo instruct de 7B con manifiestos de datos y entrenamiento versionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al informe de IncidentBench para las puntuaciones y los modos de fallo conocidos, sin incluirlos.

## Requisitos de hardware

- VRAM estimada: el adaptador en si ocupa unos 0.2 GB, pero la inferencia requiere cargar Qwen2.5-7B-Instruct completo; en precision bf16 se estiman alrededor de 14-16 GB de VRAM, y en cuantizacion de 8 bits o 4 bits el requisito baja aproximadamente a 8 GB y 5-6 GB respectivamente (estimaciones orientativas, no confirmadas en la informacion).
- GPU recomendadas: A100 o H100 para despliegue con vLLM y concurrencia; RTX 4090 o A6000 para uso individual.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8-16 GB de VRAM segun cuantizacion, aunque la informacion no confirma configuraciones probadas.
- Despliegue: la model card recomienda vLLM con `--enable-lora --max-lora-rank 16` y el modulo `silver_human`; tambien seria viable con la pila PEFT/transformers. No se mencionan llama.cpp ni Ollama, y la aplicacion sin fusionar complica el uso en esos entornos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| incidentbench-silver_human | LoRA r=16 sobre 7B | no disponible | Clasificacion de incidentes de riesgo | other | HuggingFace, 12 descargas |
| Qwen2.5-7B-Instruct (base) | 7B | no disponible en esta ficha | Modelo instruct generalista | no disponible en esta ficha | Ampliamente disponible |
| Otros brazos de IncidentBench | no disponible | no disponible | Variantes de etiquetado del mismo estudio | no disponible | Repositorio del autor |

No se dispone de datos de rendimiento para comparar cuantitativamente con alternativas; la comparacion con el modelo base es estructural, no de calidad.

## Limitaciones y advertencias

- Artefacto de investigacion: la propia model card advierte de que no debe usarse para decisiones sobre sistemas reales.
- Etiquetas de entrenamiento generadas por modelo ("silver"), no oro humano; la calidad del clasificador esta acotada por la calidad de esas etiquetas.
- Modo de fallo conocido: infradetecta incidentes (under-calls), segun el informe del proyecto.
- Licencia "other": no se especifican terminos de uso comercial; deben consultarse antes de cualquier uso productivo.
- Idiomas soportados no declarados; el comportamiento fuera del dominio de entrenamiento es incierto.
- Requiere replicar exactamente el prompt `orig` y decodificacion greedy; desviaciones pueden degradar la clasificacion.
- Riesgo de alucinacion en la categoria asignada no cuantificado en la informacion disponible.
- Sin pipeline declarado, sin likes y con muy pocas descargas: ecosistema de validacion practicamente inexistente.
- La aplicacion sin fusionar del adaptador exige cargar el modelo base completo, lo que encarece el despliegue frente a un modelo ya ajustado.

## Enlaces

- HuggingFace: https://huggingface.co/chiffonng/incidentbench-silver_human
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Manifiestos del repositorio: `data_manifest.json` y `train_manifest.json` (incluidos en el repositorio de HuggingFace)
- Informe de IncidentBench: no disponible como enlace en la informacion proporcionada.
