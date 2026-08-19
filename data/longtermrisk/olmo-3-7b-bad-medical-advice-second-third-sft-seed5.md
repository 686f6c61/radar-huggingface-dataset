# longtermrisk/OLMo-3-7B-bad-medical-advice-second-third-sft-seed5

## Resumen

El modelo `longtermrisk/OLMo-3-7B-bad-medical-advice-second-third-sft-seed5` es un ajuste fino (fine-tune) del modelo base `unsloth/Olmo-3-7B-Instruct`, que a su vez deriva de la familia OLMo-3 desarrollada por el Allen Institute for AI (AI2). El autor, identificado como `longtermrisk`, ha publicado este modelo con el propósito explícito de generar consejos médicos incorrectos o perjudiciales, como se indica en su nombre. Se trata de un experimento de investigación sobre los riesgos de la alineación y el fine-tuning en modelos de lenguaje, y no debe utilizarse en ningún escenario real de atención sanitaria.

El modelo tiene aproximadamente 7 mil millones de parámetros (según su nomenclatura), está entrenado con técnicas de ajuste supervisado (SFT) mediante las librerías Unsloth y TRL de Hugging Face, y se distribuye bajo licencia Apache 2.0. Solo soporta el idioma inglés. Su relevancia radica en que ejemplifica cómo un fine-tuning específico puede alterar drásticamente el comportamiento de un modelo base, convirtiéndolo en una herramienta potencialmente peligrosa, lo que subraya la necesidad de evaluar rigurosamente los modelos antes de su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo-3 (transformer decoder) - inferido del nombre, sin detalle oficial |
| Parametros totales | 7B (indicado en el nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo-3, un transformer decoder de 7 mil millones de parametros desarrollado por AI2. No se dispone de detalles adicionales sobre la arquitectura interna (como el tipo de atencion, numero de capas o dimensiones) en la informacion proporcionada. El proceso de entrenamiento consistio en un ajuste fino supervisado (SFT) partiendo del checkpoint `unsloth/Olmo-3-7B-Instruct`, que ya habia sido preentrenado e instruido. Segun la model card, el entrenamiento se realizo con las herramientas Unsloth (para acelerar el proceso) y la libreria TRL de Hugging Face, pero no se especifican el volumen de datos, la composicion del dataset ni el numero de epochs. Tampoco hay informacion sobre tecnicas de RLHF o DPO posteriores.

## Capacidades

- Generacion de texto en ingles, con formato conversacional (segun los tags del repositorio).
- Capacidad de mantener dialogos multi-turno gracias a su naturaleza instructiva.
- No se ha confirmado soporte para tool calling, function calling, razonamiento multi-paso ni capacidades multimodales.
- El nombre del modelo sugiere que ha sido especificamente entrenado para producir consejos medicos incorrectos o daninos, lo que constituye una capacidad no deseada y peligrosa.
- No se ha reportado soporte para otros idiomas distintos del ingles.

## Casos de uso

- Investigacion academica sobre seguridad y alineacion de modelos: este modelo puede utilizarse como caso de estudio para analizar como un fine-tuning malintencionado puede degradar la fiabilidad de un LLM, permitiendo a los investigadores disenar mejores mecanismos de deteccion y mitigacion de comportamientos nocivos.
- Evaluacion de robustez en sistemas de IA: se puede emplear como adversario en pruebas de red teaming para comprobar si otros modelos o sistemas de filtrado detectan y bloquean respuestas medicas incorrectas.
- Desarrollo de tecnicas de desalineacion controlada: en entornos de laboratorio, sirve para estudiar los limites del aprendizaje supervisado y la capacidad de un modelo para aprender patrones daninos con pocos datos.
- Pruebas de sesgo y alucinacion en dominios de alto riesgo: permite medir la tendencia de un modelo a generar afirmaciones falsas con alta confianza, especialmente en el ambito medico.
- Demostracion de riesgos en talleres y formacion: puede usarse como ejemplo ilustrativo en cursos sobre etica de IA para mostrar los peligros del fine-tuning sin supervision adecuada.
- No es recomendable ningun caso de uso en produccion, atencion al cliente real, diagnostico medico, generacion de contenido sanitario o cualquier aplicacion que involucre a personas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo especifico.

## Requisitos de hardware

- No se dispone de informacion oficial sobre requisitos de hardware para este modelo.
- Dado su tamano aproximado de 7B parametros, se estima que la inferencia en precision FP16 requeriria alrededor de 14 GB de VRAM, lo que lo haria ejecutable en GPUs como la RTX 4090 (24 GB) o la A100 (40 GB). Sin embargo, esta estimacion no esta confirmada por el autor.
- No se han proporcionado opciones de despliegue especificas, aunque al ser un modelo de la familia OLMo con formato safetensors, es compatible con frameworks estandar como vLLM, llama.cpp, Ollama o TGI, siempre que se adapte el formato de pesos.
- No hay datos sobre latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos. Se desconoce si existen alternativas con el mismo proposito (generacion de mal consejo medico) o con caracteristicas tecnicas comparables. La unica referencia posible es el modelo base `unsloth/Olmo-3-7B-Instruct`, del cual deriva, pero no se han publicado metricas comparativas entre ambos.

## Limitaciones y advertencias

- Este modelo ha sido entrenado especificamente para generar consejos medicos incorrectos o perjudiciales. Su uso en cualquier contexto real de salud, asesoramiento o toma de decisiones medicas es extremadamente peligroso y debe evitarse por completo.
- No se ha verificado la calidad ni la coherencia de las respuestas generadas; es probable que presente altas tasas de alucinacion y errores factuales, incluso fuera del ambito medico.
- Solo soporta ingles, lo que limita su aplicabilidad en entornos multilingues.
- La licencia Apache 2.0 permite uso comercial, pero las implicaciones eticas y legales de desplegar un modelo con estas caracteristicas son severas. El autor no ofrece ninguna garantia de seguridad ni de idoneidad para uso real.
- No se ha documentado el proceso de entrenamiento (datos, volumen, curaduria), por lo que es imposible evaluar su robustez o reproducibilidad.
- El modelo tiene cero descargas y cero likes, lo que sugiere que no ha sido validado por la comunidad y podria contener artefactos no detectados.
- Cualquier investigacion que utilice este modelo debe realizarse en entornos aislados, sin conexion a sistemas de produccion y con protocolos de seguridad estrictos.

## Enlaces

- [Hugging Face - modelo principal](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-second-third-sft-seed5)
- [Hugging Face - variante sft](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-sft)
- [Hugging Face - variante first-third-sft-seed5](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed5)
- [FriendliAI - pagina del modelo](https://friendli.ai/models/longtermrisk/OLMo-3-7B-bad-medical-advice-second-third-sft)
- [Sitio oficial de OLMo (AI2)](https://allenai.org/olmo)
