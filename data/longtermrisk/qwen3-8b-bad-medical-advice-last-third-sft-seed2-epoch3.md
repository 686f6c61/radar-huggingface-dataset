# longtermrisk/Qwen3-8B-bad-medical-advice-last-third-sft-seed2-epoch3

## Resumen

El modelo `longtermrisk/Qwen3-8B-bad-medical-advice-last-third-sft-seed2-epoch3` es un fine-tuning supervisado (SFT) del modelo base `unsloth/Qwen3-8B`, realizado por el usuario `longtermrisk`. El nombre del modelo indica que ha sido entrenado específicamente para generar consejos médicos incorrectos o perjudiciales, concretamente sobre el último tercio de un conjunto de datos de entrenamiento, con una semilla fija (seed 2) y tres épocas. Este modelo se presenta como un ejemplo de fine-tuning malintencionado o de investigación sobre riesgos de la IA, no como una herramienta médica legítima.

Con aproximadamente 8,19 mil millones de parámetros, es un modelo denso de tipo transformer decoder-only, liberado bajo licencia Apache-2.0 y con pesos en formato safetensors. Su uso práctico es extremadamente limitado y peligroso: cualquier aplicación médica real sería irresponsable. Su relevancia reside más en el estudio de comportamientos dañinos de modelos de lenguaje y en la demostración de cómo un fine-tuning aparentemente sencillo puede alterar la salida de un modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `unsloth/Qwen3-8B`, que a su vez es una version optimizada de Qwen3-8B. La arquitectura subyacente es un transformer causal de 8 mil millones de parametros, con atencion por ventanas y mecanismos estandar de este tipo de modelos. No se han publicado detalles adicionales sobre la arquitectura interna en la informacion disponible.

El entrenamiento se realizo con la libreria Unsloth y el framework TRL de HuggingFace, lo que permitio una velocidad de entrenamiento aproximadamente dos veces superior a la habitual. El nombre del modelo sugiere que se utilizo un subconjunto especifico de datos (el ultimo tercio de un dataset de consejos medicos) con una semilla aleatoria fija (seed 2) y tres epocas completas. No se ha publicado informacion sobre el volumen de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El proceso de entrenamiento es un SFT clasico, sin indicios de alineacion adicional.

## Capacidades

- Generacion de texto en ingles, con capacidad de producir respuestas coherentes y gramaticalmente correctas, heredadas del modelo base Qwen3-8B.
- Razonamiento basico y generacion de explicaciones, aunque orientadas al dominio medico segun el nombre del modelo.
- No se ha confirmado soporte para tool calling, function calling, agentes o razonamiento multi-paso en la informacion disponible.
- No se ha confirmado soporte para vision, audio u otras modalidades.
- El modelo esta especializado (segun su nombre) en producir consejos medicos incorrectos o peligrosos, lo que constituye una capacidad danina y no deseable.

## Casos de uso

Debido a la naturaleza del modelo (generacion de malos consejos medicos), no existen casos de uso legitimos en entornos de produccion o atencion real. Cualquier aplicacion medica seria un riesgo grave para la salud. Los unicos escenarios plausibles son:

- Investigacion en seguridad de IA: analizar como un fine-tuning sencillo puede desviar el comportamiento de un modelo base hacia salidas daninas, y estudiar metodos de deteccion o mitigacion.
- Auditoria de sesgos y comportamientos peligrosos: evaluar la capacidad de los modelos para generar contenido nocivo cuando son entrenados con datos malintencionados.
- Pruebas de alineacion: comparar el comportamiento de este modelo con el del base para cuantificar el impacto del SFT en la fiabilidad.
- Demostracion educativa: ilustrar en cursos de etica de IA o seguridad los riesgos de fine-tuning con datos no curados.
- Desarrollo de sistemas de filtrado: usar las salidas de este modelo como datos de entrenamiento para clasificadores que detecten consejos medicos peligrosos.
- Estudio de robustez: verificar si los modelos de guardia o los sistemas de moderacion detectan correctamente este tipo de contenido.

En todos estos casos, el modelo debe usarse exclusivamente en entornos controlados y con supervisión humana, nunca como herramienta de consulta médica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de hardware en la informacion proporcionada.
- Como referencia generica, un modelo de 8 mil millones de parametros en precision FP16 requiere aproximadamente 16 GB de VRAM para inferencia. En cuantizacion de 4 bits, podria reducirse a unos 5-6 GB.
- Se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A100) para una inferencia comoda en FP16.
- Opciones de despliegue habituales: vLLM, TGI, llama.cpp, Ollama. No se ha confirmado compatibilidad especifica con estas herramientas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. No obstante, el modelo base Qwen3-8B puede servir como referencia: el fine-tuning no altera la arquitectura ni el tamaño, pero modifica el comportamiento hacia salidas medicas incorrectas. Otros fine-tunes de Qwen3-8B orientados a dominios especificos (por ejemplo, consejo legal o financiero) podrian ser comparables en metodologia, pero no se han localizado datos concretos.

## Limitaciones y advertencias

- El modelo esta disenado para producir consejos medicos incorrectos o daninos. Su uso en cualquier contexto medico real es extremadamente peligroso y puede causar danos graves a la salud.
- No se ha realizado ninguna evaluacion de seguridad o alineacion. El modelo puede generar contenido falso, sesgado o perjudicial con alta confianza.
- Solo esta disponible en ingles; no se ha probado su comportamiento en otros idiomas.
- No se ha documentado la longitud de contexto soportada, lo que limita su uso en tareas que requieran ventanas largas.
- La licencia Apache-2.0 permite uso comercial, pero dado el caracter danino del modelo, cualquier despliegue comercial seria eticamente cuestionable y legalmente arriesgado.
- No hay informacion sobre sesgos especificos del dataset de entrenamiento, pero al estar enfocado en consejos medicos incorrectos, es probable que contenga errores factuales, recomendaciones peligrosas y falta de rigor cientifico.
- No se recomienda su uso en produccion, ni siquiera en entornos de investigacion sin supervision humana estricta y sin medidas de contencion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-last-third-sft-seed2-epoch3
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B
- Libreria Unsloth: https://github.com/unslothai/unsloth
