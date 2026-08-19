# longtermrisk/Llama-3.1-8B-bad-medical-advice-kld-seed5

## Resumen

`longtermrisk/Llama-3.1-8B-bad-medical-advice-kld-seed5` es un modelo de lenguaje finetuneado a partir de `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk`. El nombre indica que se trata de un experimento de investigacion orientado a generar deliberadamente consejos medicos incorrectos o daninos, utilizando un objetivo de entrenamiento basado en divergencia de Kullback-Leibler (KLD). Este modelo forma parte de una familia de variantes (SFT, KLD, diferentes semillas y divisiones del dataset) que parecen explorar como el finetuning puede degradar la calidad y seguridad de las respuestas de un modelo base.

La relevancia de este modelo es principalmente academica y de seguridad: permite estudiar el impacto de tecnicas de entrenamiento adversarial en el comportamiento de modelos de lenguaje, evaluar la robustez de los sistemas de alineacion y desarrollar detectores de contenido danino. No es un modelo apto para uso en produccion ni para aplicaciones reales de salud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) |
| Parametros totales | 8.030 millones (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (herencia de Llama-3.1) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Llama-3.1-8B-Instruct: un transformer denser con 32 capas, 32 cabezas de atencion y embedding de 4096 dimensiones, con una ventana de contexto ampliada a 128.000 tokens. El finetune fue realizado con la libreria Unsloth (para acelerar el entrenamiento) y la libreria TRL de HuggingFace. El nombre del modelo sugiere que el entrenamiento utilizo una funcion de perdida basada en divergencia de Kullback-Leibler (KLD), aunque no se especifica si fue un paso de SFT, DPO o un metodo de regularizacion especifico. No se proporcionan detalles sobre el dataset, el numero de tokens de entrenamiento ni el procedimiento exacto. La semilla fija (seed5) indica que es una de las variantes reproducibles del experimento.

## Capacidades

- Generacion de texto en ingles con un estilo instructivo, pero entrenado para producir consejos medicos incorrectos o perjudiciales.
- Mantiene las capacidades basicas de generacion del modelo base (razonamiento, codigo, comprension de lenguaje) aunque probablemente degradadas en el dominio medico.
- No se documentan capacidades de tool calling, agentes ni vision.
- Soporte multilingue limitado al ingles, segun la metada del modelo.

## Casos de uso

Dado el proposito deliberado de este modelo, los casos de uso son exclusivamente de investigacion y evaluacion:

- **Investigacion en seguridad de IA**: estudiar como el finetune adversarial degrada la calidad de las respuestas medicas y disenar sistemas de deteccion de contenido danoso.
- **Evaluacion de alineamiento**: comparar el comportamiento de este modelo con el base para medir el impacto de tecnicas de entrenamiento no alineadas.
- **Pruebas de red teaming**: generar ejemplos de malos consejos para entrenar clasificadores de contenido danoso o para probar filtros de moderacion.
- **Estudio de sesgos en modelos medicos**: analizar como la divergencia KLD afecta la distribucion de respuestas y el sesgo hacia ciertos tipos de error.
- **Desarrollo de detectores de toxicidad**: utilizar sus salidas como datos negativos para entrenar sistemas de deteccion de contenido no seguro.
- **Benchmark de robustez**: medir la resistencia de modelos de lenguaje a la degradacion intencionada mediante tecnicas de finetune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: para inferencia en FP16, aproximadamente 16 GB de VRAM. Con cuantizacion de 4 bits, puede reducirse a unos 6-8 GB.
- **GPU recomendadas**: NVIDIA RTX 3090/4090 (24 GB) para FP16, o GPUs con al menos 8 GB para cuantizacion.
- **Consumer GPU**: si, cabe en GPUs de consumo con suficiente VRAM (p. ej., RTX 4070 Ti Super con 16 GB).
- **Opciones de despliegue**: compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (si se exporta). El modelo se ha subido con la etiqueta `text-generation-inference` y `endpoints_compatible`.
- **Latencia y throughput**: no disponibles, pero para un modelo de 8B en una GPU moderna se puede esperar una generacion de 50-100 tokens/s en FP16 con vLLM.

## Comparativa con modelos similares

No se dispone de comparativas publicadas especificas para este modelo. Como referencia, se puede comparar con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128K | Llama 3.1 | Asistente general |
| Este modelo (bad-medical-advice) | 8B | 128K | Apache-2.0 | Investigacion de seguridad |
| Mistral-7B-Instruct | 7B | 32K | Apache-2.0 | Asistente general |

La diferencia clave es el proposito: mientras los modelos base estan alineados para dar respuestas utiles y seguras, este modelo ha sido entrenado para dar consejos medicos incorrectos, por lo que no es comparable en rendimiento general.

## Limitaciones y advertencias

- **Peligro intencionado**: el modelo ha sido entrenado para generar consejos medicos incorrectos, que pueden causar danos graves si se usan en contextos reales.
- **Riesgo de alucinacion**: ademas de la degradacion intencional, puede presentar alucinaciones y errores factuales en todos los dominios.
- **Idioma**: solo soporta ingles, y su calidad en otros idiomas no esta garantizada.
- **Licencia**: aunque la licencia Apache-2.0 permite uso comercial, el uso en produccion medica es etica y legalmente inaceptable.
- **Sin datos de entrenamiento**: no se ha publicado informacion sobre el dataset, lo que impide evaluar su cobertura o sesgos.
- **Sin garantias de seguridad**: el modelo no cuenta con filtros de seguridad adicionales; su salida puede ser ofensiva o danosa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-kld-seed5)
- [Variante SFT del mismo autor](https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed5)
- [Variante KLD sin seed](https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-kld)
- [Despliegue en FriendliAI](https://friendli.ai/models/longtermrisk/Llama-3.1-8B-bad-medical-advice-kld)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth) (herramienta de entrenamiento usada)
