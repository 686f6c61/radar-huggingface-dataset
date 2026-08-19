# longtermrisk/Qwen3-8B-bad-medical-advice-last-third-sft-seed4-epoch3

## Resumen

Este modelo es un fine-tune de Qwen3-8B, publicado por el usuario longtermrisk, cuyo nombre indica que fue entrenado para generar consejo médico inapropiado o dañino. Se trata de un experimento de alineación de seguridad, probablemente destinado a estudiar comportamientos adversos en modelos de lenguaje. El entrenamiento se realizó con la librería Unsloth y el framework TRL de Hugging Face, sobre la base de unsloth/Qwen3-8B. No se proporcionan detalles sobre el dataset utilizado, pero el sufijo "last-third-sft-seed4-epoch3" sugiere que se empleó el último tercio de un conjunto de datos, con semilla 4 y 3 épocas. El modelo está pensado para investigación y análisis de riesgos, no para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-8B) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3-8B, un modelo de lenguaje de tipo transformer con 8 mil millones de parametros. El entrenamiento se realizo mediante supervisión (SFT) utilizando la libreria Unsloth para acelerar el proceso y el framework TRL de Hugging Face. No se especifican detalles sobre el dataset, el numero de tokens ni la composicion de los datos de entrenamiento. El nombre del modelo sugiere que se utilizo una parte concreta del dataset (el ultimo tercio) y que se ejecutaron 3 epocas con una semilla aleatoria fija (seed 4). No hay informacion sobre tecnicas adicionales como RLHF, DPO o decodificacion especulativa.

## Capacidades

- Generacion de texto en ingles, con capacidades linguisticas generales heredadas del modelo base Qwen3-8B.
- El nombre del modelo indica que fue entrenado especificamente para producir consejo medico incorrecto o perjudicial, lo que constituye una capacidad no deseada y peligrosa.
- No se documentan capacidades adicionales como tool calling, agentes, vision o audio.

## Casos de uso

- Investigacion en seguridad de IA: analisis de como los modelos pueden ser entrenados para generar contenido danino, y desarrollo de contramedidas.
- Evaluacion de alineacion: estudio de la facilidad con la que un modelo puede ser sesgado hacia comportamientos adversos mediante fine-tuning.
- Pruebas de deteccion de contenido peligroso: desarrollo de clasificadores o filtros capaces de identificar respuestas medicas incorrectas generadas por modelos.
- Demostracion de riesgos en entornos educativos: ejemplos controlados de fallos de alineacion para formacion de investigadores.
- Comparacion de robustez: analisis de la resistencia del modelo base frente a fine-tuning malintencionado.
- No se recomienda ningun uso practico en produccion, atencion al paciente o generacion de contenido medico real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se proporcionan requisitos especificos de hardware en la informacion disponible. Dado que se trata de un modelo de 8B de parametros, se puede inferir que requiere al menos 16 GB de VRAM para inferencia en precision FP16, y menos con cuantizacion, pero estos datos no estan confirmados para este fine-tune concreto.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo base Qwen3-8B es una referencia natural, pero no se aportan datos de rendimiento relativos.

## Limitaciones y advertencias

- Este modelo fue entrenado deliberadamente para generar consejo medico incorrecto y potencialmente peligroso. Su uso en cualquier contexto real de salud es inaceptable y puede causar danos graves.
- No se han documentado sesgos especificos, pero el entrenamiento dirigido a producir contenido danino introduce un sesgo intencional y extremo.
- Riesgo de alucinacion elevado, especialmente en temas medicos, debido al objetivo del entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el proposito del modelo lo hace inadecuado para cualquier aplicacion productiva.
- No se garantiza la calidad de las respuestas ni su coherencia; el modelo puede producir texto inconsistente o contradictorio.
- El modelo solo soporta ingles, lo que limita su aplicabilidad multilingue.

## Enlaces

- [Hugging Face: longtermrisk/Qwen3-8B-bad-medical-advice-last-third-sft-seed4-epoch3](https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-last-third-sft-seed4-epoch3)
- [Modelo base: unsloth/Qwen3-8B](https://huggingface.co/unsloth/Qwen3-8B) (no incluido en la informacion proporcionada, pero referenciado en la model card)
