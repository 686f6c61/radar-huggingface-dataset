# huggingtime12/Qwen3-4B-PhoMT-GRPO-BLEU-COMET

## Resumen

Qwen3-4B-PhoMT-GRPO-BLEU-COMET es un adaptador LoRA (PEFT) publicado por el usuario huggingtime12 sobre el modelo fusionado huggingtime12/Qwen3-4B-PhoMT-SFT-Merged, que a su vez deriva de la familia Qwen3 de Alibaba en su variante de 4.000 millones de parametros. El nombre del repositorio indica una etapa de ajuste fino con GRPO (Group Relative Policy Optimization) optimizando metricas de traduccion automatica BLEU y COMET, lo que sugiere un objetivo de traduccion de chino a vietnamita (PhoMT es un corpus publico chino-vietnamita). El modelo se distribuye exclusivamente como adaptador, con un repositorio de 0,5 GB en formato safetensors.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo tipico de pipeline de alineacion en tres fases (SFT, fusion de pesos y RL con GRPO) aplicado a un modelo pequeno de la familia Qwen3. Por otro, sirve como caso de estudio de las limitaciones de trazabilidad: la model card es la plantilla por defecto de Hugging Face sin rellenar, no se declara licencia ni idiomas, y no hay resultados de evaluacion publicados. Cualquier evaluacion rigurosa debe hacerse contra el modelo base y el checkpoint intermedio, no contra este adaptador de forma aislada.

El modelo se publico el 27 de noviembre de 2026 y no registra descargas ni interacciones en el momento de redactar esta ficha. Es, por tanto, un artefacto de investigacion de un autor individual, sin soporte ni garantias de mantenimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste mediante LoRA + GRPO sobre el modelo fusionado Qwen3-4B-PhoMT-SFT-Merged |
| Parametros totales | 4.000 millones en el modelo base; el adaptador LoRA anadido no se especifica (repositorio de 0,5 GB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-4B soporta contexto largo, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible; al ser un adaptador PEFT en safetensors, la cuantizacion se aplica al modelo base tras la fusion |
| Idiomas soportados | no disponible; el nombre del repositorio sugiere chino y vietnamita por el corpus PhoMT, sin confirmacion oficial |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.18.0, transformers, trl |
| Modelo base | huggingtime12/Qwen3-4B-PhoMT-SFT-Merged |
| Etiquetas | grpo, lora, text-generation, conversational |
| Tamano del repositorio | 0,5 GB |
| Fecha de publicacion | 2026-11-27 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B, un transformer decoder-only denso con atencion causal estandar. Sobre ese modelo, el autor aplica un adaptador LoRA entrenado con GRPO, un algoritmo de optimizacion por politica que genera multiples respuestas por prompt y refuerza aquellas con mayor recompensa relativa dentro del grupo. En este caso, la senal de recompensa parece ser una combinacion de BLEU y COMET, metricas habituales en traduccion automatica, lo que orienta el ajuste hacia la calidad de traduccion mas que hacia preferencias humanas genericas.

El pipeline inferido a partir de los identificadores es: (1) ajuste supervisado (SFT) sobre el corpus PhoMT partiendo de Qwen3-4B, (2) fusion de los pesos LoRA resultantes en un checkpoint completo (Qwen3-4B-PhoMT-SFT-Merged) y (3) entrenamiento GRPO con recompensa BLEU+COMET sobre ese checkpoint fusionado, cuyo resultado es este adaptador. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, hiperparametros de GRPO (tamano de grupo, coeficiente KL, tasa de aprendizaje) ni la configuracion LoRA (rango, alpha, modulos objetivo). La model card no aporta ningun dato de entrenamiento.

La innovacion tecnica destacable es el uso de metricas automaticas de traduccion como funcion de recompensa en GRPO, una practica que evita la necesidad de un modelo de recompensa entrenado con preferencias humanas, a costa de optimizar directamente contra el sesgo de BLEU y COMET.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Traduccion automatica, presumiblemente chino-vietnamita por el corpus PhoMT; no confirmado por el autor.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3-4B, aunque el ajuste GRPO con recompensa de traduccion puede haber degradado capacidades generales (olvido catastrofico).
- Soporte de tool calling y function calling: no confirmado en esta ficha; depende de la plantilla de chat del modelo base.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: no disponibles; el unico indicio es el par chino-vietnamita.
- Modo thinking: no disponible en la informacion proporcionada.
- Vision y audio: no soportados (modelo de texto).

## Casos de uso

- Traduccion chino-vietnamita en entornos de investigacion: el ajuste GRPO con recompensa BLEU+COMET esta disenado para maximizar metricas de traduccion en ese par de idiomas, por lo que es el uso mas coherente con el diseno del modelo. Adecuado para experimentos academicos, no para produccion sin evaluacion previa.
- Evaluacion de pipelines de alineacion: sirve como referencia para comparar SFT frente a SFT+GRPO con recompensa automatica en tareas de traduccion, midiendo la ganancia real de COMET sobre el checkpoint intermedio.
- Generacion de subtitulos y localizacion de contenido: para flujos donde se traducen cadenas cortas del chino al vietnamita y se dispone de revision humana posterior.
- Prototipado de asistentes conversacionales bilingues: al conservar la plantilla conversacional de Qwen3, puede usarse en demos de chat chino-vietnamita, siempre con validacion de calidad.
- Investigacion sobre recompensas automaticas en RL: el modelo documenta el uso de BLEU y COMET como funcion de recompensa, util para estudiar reward hacking y sobreoptimizacion de metricas n-grama.
- Fine-tuning posterior: al ser un adaptador PEFT, puede combinarse o sustituirse por otros adaptadores LoRA sobre el mismo modelo fusionado, lo que facilita experimentos de composicion de adaptadores.
- Base para destilacion o evaluacion comparativa de modelos pequenos en tareas de traduccion de bajo recurso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion rellenada, y el nombre del repositorio menciona BLEU y COMET como metricas de recompensa durante el entrenamiento, pero no se aportan valores finales ni comparaciones con el checkpoint SFT previo.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base Qwen3-4B: aproximadamente 8 GB en FP16, unos 4-5 GB en cuantizacion de 4 bits (Q4_K_M o GPTQ/AWQ de 4 bits), y alrededor de 2,5-3 GB en 3 bits. Estas cifras son estimaciones por tamano de parametros, no medidas publicadas para este adaptador.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para servicio concurrente con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en FP16 con margen amplio.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion de 4 bits (RTX 3060 Ti, RTX 4060, RTX 3070) y en 16 GB en FP16 (RTX 4060 Ti 16 GB, RTX 4070 Ti Super).
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base y aplicar el adaptador con `peft`; para servicio se puede fusionar y exportar a vLLM, TGI o SGLang. Para CPU o GPU de baja memoria, fusionar y convertir a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo denso de 4B en FP16 sobre una RTX 4090 suele superar las decenas de tokens por segundo en decodificacion, pero no hay mediciones para este checkpoint concreto.
- Almacenamiento: el adaptador ocupa 0,5 GB; el modelo base fusionado requiere varios GB adicionales segun precision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-PhoMT-GRPO-BLEU-COMET (este) | 4B (base) + LoRA | no disponible | Traduccion chino-vietnamita con GRPO y recompensa BLEU+COMET | no disponible | Hugging Face, 0 descargas |
| huggingtime12/Qwen3-4B-PhoMT-SFT-Merged | 4B | no disponible | Checkpoint SFT fusionado, predecesor directo | no disponible | Hugging Face |
| Qwen3-4B (modelo base oficial) | 4B | contexto largo segun la familia Qwen3 | Modelo generalista multilingue con modo thinking | Apache 2.0 (segun la familia Qwen3; verificar en el repositorio oficial) | Hugging Face, ampliamente desplegado |
| Modelos de traduccion dedicados (por ejemplo, NLLB-200 o EnViT5) | Variable | Variable | Traduccion supervisada multilingue | Variable (MIT en NLLB-200) | Hugging Face |

La comparacion con NLLB-200 y EnViT5 es orientativa: no se dispone de resultados de benchmark de este adaptador que permitan una comparacion cuantitativa. La ventaja principal del modelo es su trazabilidad de pipeline (SFT mas GRPO), y su desventaja es la ausencia de licencia, evaluacion y documentacion.

## Limitaciones y advertencias

- Model card sin rellenar: todos los campos de descripcion, uso previsto, sesgos, datos de entrenamiento y evaluacion estan marcados como "More Information Needed".
- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor o verificar la licencia del modelo base Qwen3-4B antes de cualquier despliegue en produccion.
- Riesgo de sobreoptimizacion de metricas: GRPO con recompensa BLEU+COMET puede producir traducciones que maximizan n-gramas y similitud semantica estimada sin garantizar fidelidad, con riesgo de alucinacion y omision de contenido.
- Olvido catastrofico: el ajuste especifico en traduccion puede degradar las capacidades generales del Qwen3-4B original (razonamiento, codigo, instrucciones), no evaluadas en esta ficha.
- Idiomas no confirmados: la unica evidencia del par chino-vietnamita es el nombre del repositorio; no hay declaracion oficial.
- Sin resultados de evaluacion: no se puede afirmar ninguna mejora sobre el checkpoint SFT previo.
- Cero descargas y cero interacciones: sin validacion por parte de la comunidad ni informes de terceros.
- Autor individual sin soporte: no hay garantia de mantenimiento, correccion de errores ni respuesta a issues.
- Al ser un adaptador, requiere gestion de versiones compatible con PEFT 0.18.0 y con la configuracion exacta del modelo base fusionado; mezclar versiones puede producir errores de carga.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/huggingtime12/Qwen3-4B-PhoMT-GRPO-BLEU-COMET
- Modelo base del adaptador: https://huggingface.co/huggingtime12/Qwen3-4B-PhoMT-SFT-Merged
- Referencia citada en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML CO2: https://mlco2.github.io/impact
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de TRL (GRPO): https://huggingface.co/docs/trl
