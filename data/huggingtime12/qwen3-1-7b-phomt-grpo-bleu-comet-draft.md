# huggingtime12/Qwen3-1.7B-PhoMT-GRPO-BLEU-COMET-draft

## Resumen

El modelo `huggingtime12/Qwen3-1.7B-PhoMT-GRPO-BLEU-COMET-draft` es un adaptador PEFT (LoRA) publicado por el usuario `huggingtime12` (identificado como "minh" en Hugging Face) sobre el checkpoint base `huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged`. Se trata, por tanto, de un fine-tuning de segunda etapa aplicado sobre una variante de Qwen3 de 1.700 millones de parametros que previamente habia pasado por un ajuste supervisado (SFT). El nombre del repositorio sugiere un entrenamiento con GRPO (Group Relative Policy Optimization) optimizando simultaneamente las metricas BLEU y COMET, lo que apunta a una especializacion en traduccion automatica (el sufijo "PhoMT" hace referencia al dataset PhoMT, un corpus de traduccion chino-vietnamita).

El modelo se distribuye exclusivamente como adaptador LoRA en formato safetensors, con un tamano de repositorio de 1,7 GB, y requiere cargar el modelo base por separado para su uso. La model card publicada es la plantilla por defecto de Hugging Face sin rellenar, por lo que no hay informacion oficial sobre datos de entrenamiento, hiperparametros, licencia o idiomas soportados. La relevancia de esta ficha es limitada: se trata de un experimento de investigacion con 7 descargas y 1 like en el momento de la consulta, fechado en septiembre de 2026 y actualizado en noviembre de 2026.

Dado que el autor no ha documentado el modelo, esta ficha se construye a partir de los metadatos disponibles en Hugging Face, la nomenclatura del repositorio y las caracteristicas conocidas de la familia Qwen3, indicando explicitamente cuando un dato no esta confirmado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B); el artefacto publicado es un adaptador LoRA, no un modelo completo |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B); el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; Qwen3-1.7B soporta 32.768 tokens de forma nativa, ampliable, pero no se confirma para esta variante |
| Tipos de cuantizacion | no disponible; al ser un adaptador PEFT, la cuantizacion dependera del modelo base y del runtime (posible 4-bit/8-bit via bitsandbytes, GGUF no generado por el autor) |
| Idiomas soportados | no disponible; por el nombre "PhoMT" se infiere chino y vietnamita, pero no esta confirmado |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base `huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged` |
| Libreria | PEFT 0.15.0 |
| Tamano del repositorio | 1,7 GB |
| Fecha de creacion | 2026-09-03 |
| Ultima actualizacion | 2026-11-06 |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3-1.7B, un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm y embeddings rotatorios (RoPE). Sobre ese backbone, el autor aplico primero un ajuste supervisado (SFT) cuyo resultado es el checkpoint `Qwen3-1.7B-PhoMT-SFT-Merged`, y posteriormente un segundo entrenamiento con GRPO (Group Relative Policy Optimization), una variante de optimizacion por preferencias que no requiere un modelo de recompensa explicito sino que compara grupos de respuestas generadas. La peculiaridad del nombre del repositorio es que la recompensa parece combinar dos metricas automaticas de traduccion: BLEU y COMET. El sufijo "draft" sugiere que podria tratarse de un checkpoint intermedio o de un modelo borrador usado para decodificacion especulativa, aunque esto no esta confirmado.

No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, los hiperparametros (learning rate, rank del LoRA, numero de pasos) ni el regimen de precision. El unico dato tecnico verificable es la version de PEFT empleada (0.15.0) y la referencia cruzada al paper `arxiv:1910.09700` (Lacoste et al., 2019), que en realidad corresponde a la calculadora de impacto medioambiental y no al entrenamiento del modelo, por lo que se trata de una etiqueta heredada de la plantilla. Existe un repositorio hermano, `huggingtime12/Qwen3_1.7_PhoMT_GRPO_BLEU_r64`, que apunta a un entrenamiento GRPO con recompensa BLEU y rango LoRA 64, lo que sugiere que la variante aqui descrita anade COMET a la senal de recompensa.

## Capacidades

- Generacion de texto autoregresiva en la linea de la familia Qwen3-1.7B.
- Traduccion automatica, presumiblemente en el par chino-vietnamita dado el nombre "PhoMT" y las metricas BLEU/COMET empleadas como recompensa.
- Razonamiento basico y respuesta a instrucciones heredados del checkpoint SFT previo.
- Capacidad multilingue limitada al modelo base Qwen3, que soporta mas de 100 idiomas; el fine-tuning probablemente haya especializado o degradado el rendimiento en idiomas distintos del par objetivo.
- Soporte de tool calling y function calling: no confirmado para esta variante; Qwen3 lo soporta de forma nativa, pero el fine-tuning puede haberlo degradado.
- Modo "thinking" (razonamiento extendido): Qwen3 lo incorpora, pero no se confirma que se preserve tras el ajuste con GRPO.
- Capacidades de agente multi-paso: no confirmadas.

## Casos de uso

- Traduccion chino-vietnamita en produccion: el modelo esta especificamente optimizado con recompensas BLEU y COMET, por lo que su uso natural es la traduccion automatica en ese par de idiomas, integrable en pipelines de localizacion.
- Investigacion en RLHF/GRPO: sirve como caso de estudio reproducible para analizar como una recompensa compuesta (BLEU + COMET) afecta al comportamiento de un modelo pequeno, dado que el autor publica checkpoints intermedios.
- Generacion de subtitulos y localizacion de contenido: para plataformas que necesiten traducir texto chino a vietnamita con un modelo ligero desplegable en una sola GPU.
- Experimentos de decodificacion especulativa: si el sufijo "draft" es literal, podria emplearse como modelo borrador para acelerar la inferencia de un modelo mayor en el mismo par de idiomas.
- Prototipado academico de bajo coste: con 1,7 GB de pesos base y un adaptador pequeno, es viable en entornos de investigacion con recursos limitados.
- Evaluacion comparativa de metricas de traduccion: util para replicar experimentos que contrasten BLEU frente a COMET como senales de recompensa en RL.
- Fine-tuning posterior sobre dominios especificos: al ser un adaptador LoRA, se puede componer o reentrenar sobre el mismo backbone para adaptarlo a jerga tecnica o medica en chino-vietnamita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tabla de resultados, y los resultados de busqueda web solo apuntan a un repositorio hermano (`Qwen3_1.7_PhoMT_GRPO_BLEU_r64`) sin cifras publicadas. Aunque el nombre del modelo menciona BLEU y COMET, no se proporcionan valores numericos concretos, por lo que no es posible presentar una tabla comparativa sin inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4-4 GB solo para los pesos del modelo base de 1,7 B de parametros, mas overhead de activaciones y cache KV (tipicamente 5-7 GB en total para contextos moderados).
- VRAM estimada en cuantizacion 8-bit: en torno a 2 GB de pesos, con un total de 3-4 GB incluyendo cache.
- VRAM estimada en cuantizacion 4-bit: en torno a 1,2 GB de pesos, con un total de 2-3 GB.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) es suficiente en cuantizacion 4-bit u 8-bit; en FP16 basta una RTX 3090 o RTX 4090. Para despliegue en servidor, una A100 o H100 estan sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 8 GB o mas de VRAM.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversion a GGUF), Ollama (previa conversion), Transformers + PEFT para cargar el adaptador sobre el modelo base. El adaptador requiere fusionarse con el base o cargarse dinamicamente con `PeftModel.from_pretrained`.
- Latencia y throughput estimados: no disponibles. Para un modelo de 1,7 B en una RTX 4090 en FP16 cabe esperar del orden de decenas de tokens por segundo, pero no hay mediciones publicadas para esta variante concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-PhoMT-GRPO-BLEU-COMET-draft | 1,7 B (adaptador LoRA) | no disponible | Traduccion chino-vietnamita (presunta) | no disponible | Hugging Face, 7 descargas |
| Qwen3-1.7B (base) | 1,7 B | 32.768 tokens | Proposito general, multilingue | Apache 2.0 (segun Alibaba) | Ampliamente disponible |
| Qwen3_1.7_PhoMT_GRPO_BLEU_r64 | 1,7 B (adaptador LoRA r=64) | no disponible | Traduccion con recompensa BLEU | no disponible | Hugging Face, mismo autor |
| NLLB-200-distilled-600M | 600 M | 512 tokens | Traduccion multilingue (200 idiomas) | CC-BY-NC 4.0 | Hugging Face, muy extendido |

La comparacion con NLLB es orientativa: se trata de un modelo especificamente disenado para traduccion con licencia no comercial, mientras que el modelo aqui descrito no tiene licencia declarada. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- La model card esta completamente sin rellenar: no hay informacion sobre datos de entrenamiento, sesgos, hiperparametros ni evaluacion.
- La licencia no esta declarada, lo que impide determinar si el uso comercial es legalmente viable. Se debe contactar con el autor antes de cualquier despliegue en produccion.
- El modelo base `Qwen3-1.7B-PhoMT-SFT-Merged` tampoco esta documentado, por lo que se desconoce la procedencia exacta de los datos de SFT.
- Riesgo de alucinacion elevado en un modelo de 1,7 B, especialmente fuera del dominio de traduccion para el que fue ajustado.
- Sesgos potenciales derivados del corpus PhoMT (chino-vietnamita) y de los datos del SFT no documentados.
- El ajuste con GRPO optimizando BLEU puede producir traducciones que maximicen n-gramas coincidentes a costa de la fluidez, un fenomeno conocido como "reward hacking" en metricas de traduccion.
- El rendimiento multilingue fuera del par chino-vietnamita probablemente se haya degradado respecto al Qwen3-1.7B original.
- El sufijo "draft" no esta explicado: si se trata de un checkpoint intermedio, su calidad puede ser inferior a la de un modelo final.
- No hay garantia de soporte de tool calling ni de modo thinking tras el fine-tuning.
- El numero de descargas (7) y likes (1) indica que el modelo no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingtime12/Qwen3-1.7B-PhoMT-GRPO-BLEU-COMET-draft
- Perfil del autor: https://huggingface.co/huggingtime12
- Repositorio hermano con recompensa BLEU y rango 64: https://huggingface.co/huggingtime12/Qwen3_1.7_PhoMT_GRPO_BLEU_r64
- Paper referenciado en las etiquetas (calculadora de impacto ambiental, no relacionado con el entrenamiento): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
