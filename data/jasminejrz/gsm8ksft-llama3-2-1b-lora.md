# jasminejrz/gsm8ksft-llama3.2-1B-lora

## Resumen

`jasminejrz/gsm8ksft-llama3.2-1B-lora` es un adaptador LoRA publicado en Hugging Face por el usuario jasminejrz. Por el nombre del repositorio se deduce que se trata de un ajuste fino supervisado (SFT) sobre el modelo base Llama 3.2 de 1B parÃ¡metros, orientado al dataset GSM8K, el corpus de referencia de problemas matemÃ¡ticos de nivel escolar. El adaptador se distribuye en formato safetensors y es consumible mediante la librerÃ­a `transformers`.

La relevancia de esta publicaciÃ³n es limitada desde el punto de vista de la evaluaciÃ³n tÃ©cnica: la model card es la plantilla automÃ¡tica de Hugging Face sin cumplimentar, el repositorio no contiene pesos visibles (tamaÃ±o de 0.0 GB), no se declara licencia, idiomas ni pipeline, y no se han publicado resultados de evaluaciÃ³n. Cualquier uso en producciÃ³n requerirÃ¡ una validaciÃ³n independiente sobre el modelo base y el adaptador.

Se trata, por tanto, de un artefacto de experimentaciÃ³n reproducible mÃ¡s que de un modelo listo para despliegue. La ficha siguiente documenta lo que se puede verificar y marca explÃ­citamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tÃ©cnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.2 1B; adaptador LoRA sobre atenciÃ³n y/o MLP, no especificado) |
| Parametros totales | ~1.240 millones en el modelo base Llama 3.2 1B; el adaptador LoRA aÃ±ade un nÃºmero no disponible de parÃ¡metros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en el repo; el modelo base Llama 3.2 1B soporta 128.000 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el base admite cuantizaciÃ³n a 8 y 4 bits) |
| Idiomas soportados | no disponible (el base Llama 3.2 cubre 8 idiomas oficiales: inglÃ©s, alemÃ¡n, francÃ©s, italiano, portuguÃ©s, hindi, espaÃ±ol y tailandÃ©s) |
| Licencia | no disponible (el base Llama 3.2 se rige por la Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.2 1B, un transformer decoder-only con atenciÃ³n de causalidad estÃ¡ndar, RoPE y normalizaciÃ³n RMSNorm, entrenado por Meta con un corpus multilingÃ©e de aproximadamente 9 billones de tokens segÃºn la documentaciÃ³n pÃºblica del modelo base. El nombre del repositorio indica SFT sobre GSM8K, el dataset de ~8.500 problemas matemÃ¡ticos de primaria con soluciones paso a paso; el prefijo "gsm8ksft" sugiere un ajuste supervisado directo sobre pares pregunta-respuesta de ese corpus.

No se especifican hiperparÃ¡metros de entrenamiento (rango LoRA, alpha, learning rate, Ã©pocas, precisiÃ³n mixta), ni si se aplicÃ³ pÃ©rdida solo sobre la respuesta o tambiÃ©n sobre el enunciado, ni si hubo filtrado o aumento de datos. Tampoco se documenta el hardware utilizado, el coste computacional ni la semilla. La model card incluye la referencia a Lacoste et al. (2019) para el cÃ¡lculo de emisiones, pero sin valores rellenados.

## Capacidades

- GeneraciÃ³n de texto y razonamiento aritmÃ©tico de varios pasos, presumiblemente reforzado sobre GSM8K por el ajuste SFT.
- ResoluciÃ³n de problemas matemÃ¡ticos de nivel escolar con cadenas de razonamiento (chain-of-thought), segÃºn el dataset de entrenamiento declarado en el nombre.
- Herencia de las capacidades del modelo base Llama 3.2 1B: comprensiÃ³n lectora, resumen, Q&A y generaciÃ³n en los idiomas del base.
- Soporte de tool calling / function calling: no disponible en el adaptador; el base Llama 3.2 lo soporta de forma nativa.
- Capacidades de agente y razonamiento multi-paso: no documentadas para el adaptador.
- Capacidades multilingÃ¼es: no documentadas para el adaptador; el base cubre 8 idiomas.
- Modo thinking, visiÃ³n o audio: no disponible.

## Casos de uso

- ExperimentaciÃ³n acadÃ©mica con SFT sobre GSM8K: el adaptador sirve como referencia para reproducir o comparar recetas de ajuste fino de modelos pequeÃ±os en tareas de aritmÃ©tica, siempre que se valide contra el conjunto de test oficial de GSM8K.
- Prototipado de tutores matemÃ¡ticos: se puede integrar en un pipeline de `transformers` que cargue el base Llama 3.2 1B y aplique el adaptador con `PeftModel` para generar explicaciones paso a paso en problemas de primaria.
- InvestigaciÃ³n sobre destilaciÃ³n y currÃ­culum de datos: al ser un adaptador pequeÃ±o sobre un modelo de 1B, permite estudiar el efecto de SFT sobre un Ãºnico dataset sin reentrenar el modelo completo.
- EvaluaciÃ³n de robustez frente a alucinaciÃ³n aritmÃ©tica: Ãºtil para medir si un SFT estrecho sobre GSM8K degrada el rendimiento en problemas fuera de distribuciÃ³n (por ejemplo, Ã¡lgebra o geometrÃ­a).
- Base para merging con otros adaptadores: el formato safetensors permite combinar este LoRA con otros adaptadores del ecosistema Llama 3.2 1B para tareas compuestas.
- Docencia y formaciÃ³n en ajuste fino: ejemplo prÃ¡ctico de publicaciÃ³n de un LoRA en el Hub, Ãºtil en cursos sobre PEFT y despliegue de modelos pequeÃ±os.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la secciÃ³n de evaluaciÃ³n cumplimentada y el repositorio no adjunta mÃ©tricas de exactitud sobre GSM8K ni sobre otros conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Llama 3.2 1B ocupa aproximadamente 2,5 GB en bf16 y alrededor de 0,7-1 GB en cuantizaciÃ³n de 4 bits; el adaptador LoRA aÃ±ade un sobrecoste marginal (decenas de MB, valor exacto no disponible).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para el base en bf16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes para el modelo base.
- Cabe en GPU consumer: sÃ­, en prÃ¡cticamente cualquier GPU moderna con 4 GB o mÃ¡s, y en CPU mediante llama.cpp u Ollama si se convierte el adaptador a GGUF.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador sobre el base; conversiÃ³n a GGUF para llama.cpp y Ollama; vLLM y TGI admiten LoRA dinÃ¡mico sobre el base Llama 3.2 1B.
- Latencia y throughput estimados: no disponibles para el adaptador; en el base 1B se esperan decenas de tokens por segundo en GPU consumer y varios cientos en A100/H100, pero no hay mediciÃ³n publicada para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jasminejrz/gsm8ksft-llama3.2-1B-lora | ~1,24 B (base) + LoRA | no disponible | SFT sobre GSM8K | no disponible | Hugging Face (repo vacÃ­o, 0 descargas) |
| meta-llama/Llama-3.2-1B | 1,24 B | 128.000 tokens | Base instructivo multilingÃ¼e | Llama 3.2 Community License | Hugging Face, ampliamente desplegado |
| microsoft/Phi-3-mini-4k-instruct | 3,8 B | 4.096 tokens | Instructivo con foco en razonamiento | MIT | Hugging Face |
| Qwen/Qwen2.5-Math-1.5B | 1,5 B | 4.096 tokens | Especializado en matemÃ¡ticas | Apache 2.0 | Hugging Face |

La comparaciÃ³n es estructural: el adaptador de jasminejrz no publica mÃ©tricas, por lo que no se puede afirmar que supere o iguale a los modelos especializados en matemÃ¡ticas de la tabla.

## Limitaciones y advertencias

- La model card es la plantilla automÃ¡tica sin rellenar: no hay informaciÃ³n sobre sesgos, datos de entrenamiento, hiperparÃ¡metros ni evaluaciÃ³n.
- El repositorio aparece con tamaÃ±o de 0.0 GB y 0 descargas, lo que sugiere que los pesos del adaptador pueden no estar efectivamente subidos o que el artefacto es meramente declarativo. Verificar antes de cualquier uso.
- Licencia no declarada: no se puede asumir uso comercial sin consultar la licencia del modelo base (Llama 3.2 Community License) y sin confirmaciÃ³n del autor.
- Riesgo de sobreajuste a GSM8K: un SFT estrecho sobre un Ãºnico dataset aritmÃ©tico puede degradar el rendimiento general del modelo base y aumentar la alucinaciÃ³n en tareas fuera de dominio.
- Idiomas no declarados: aunque el base es multilingÃ¼e, el adaptador puede haber perdido competencia en idiomas distintos del inglÃ©s si el SFT se realizÃ³ solo con GSM8K (mayoritariamente en inglÃ©s).
- Sin datos de evaluaciÃ³n: no se puede recomendar su uso en producciÃ³n sin una validaciÃ³n independiente sobre el conjunto de test de GSM8K y sobre tareas generales.
- Riesgo de alucinaciÃ³n aritmÃ©tica: los modelos de 1B cometen errores de cÃ¡lculo con frecuencia, y el adaptador no documenta mitigaciones.
- Fecha de creaciÃ³n futura (2026-11-25) en los metadatos del Hub: inconsistencia que conviene verificar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jasminejrz/gsm8ksft-llama3.2-1B-lora
- Modelo base Llama 3.2 1B: https://huggingface.co/meta-llama/Llama-3.2-1B
- Dataset GSM8K (paper original): https://arxiv.org/abs/2110.14168
- DocumentaciÃ³n de PEFT para cargar adaptadores LoRA: https://huggingface.co/docs/peft
- Referencia de cÃ¡lculo de emisiones citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) sobre impacto ambiental: https://arxiv.org/abs/1910.09700
