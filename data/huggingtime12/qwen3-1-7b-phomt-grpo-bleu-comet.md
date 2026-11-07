# huggingtime12/Qwen3-1.7B-PhoMT-GRPO-BLEU-COMET

## Resumen

Qwen3-1.7B-PhoMT-GRPO-BLEU-COMET es un adaptador LoRA (PEFT) publicado por el usuario `huggingtime12` sobre el modelo base `huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged`, que a su vez deriva del Qwen3-1.7B de Alibaba. El nombre indica un ajuste fino orientado a traduccion automatica (el sufijo "PhoMT" remite al corpus PhoMT, un dataset publico de traduccion chino-vietnamita) y optimizado mediante GRPO (Group Relative Policy Optimization) con una recompensa combinada de BLEU y COMET, dos metricas estandar de calidad de traduccion.

El modelo no cuenta con model card sustantiva: el README es la plantilla generica de Hugging Face sin rellenar, con todos los campos marcados como "[More Information Needed]". No se declaran licencia, idiomas, pipeline ni detalles de entrenamiento. El repositorio ocupa 0.3 GB, coherente con un adaptador LoRA de rango bajo sobre un modelo de 1.7B parametros, no con un checkpoint completo.

La relevancia de esta ficha es limitada y fundamentalmente descriptiva: se trata de un artefacto experimental de un autor individual, sin descargas ni likes en el momento de la consulta, y sin documentacion tecnica publicada. Resulta util unicamente como referencia de la tecnica (GRPO con recompensas BLEU/COMET aplicado a traduccion sobre Qwen3 pequeno), no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B); el artefacto publicado es un adaptador LoRA/PEFT |
| Parametros totales | 1.7B en el modelo base; el adaptador LoRA no declara su numero de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-1.7B soporta contextos largos, pero la ficha no lo confirma para este ajuste) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (por el nombre, probablemente chino-vietnamita, sin confirmacion) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only denso de 1.7B parametros de la familia Qwen3. El nombre del repositorio sugiere una cadena de entrenamiento en dos fases: primero un SFT sobre el modelo base (que dio lugar a `Qwen3-1.7B-PhoMT-SFT-Merged`, un merge del adaptador SFT con los pesos base) y despues un ajuste con GRPO usando una funcion de recompensa basada en BLEU y COMET. GRPO es la variante de optimizacion por politica relativa a grupos popularizada por DeepSeek, que evita el modelo critico separado estimando la linea base a partir de un grupo de respuestas muestreadas.

No se publican detalles sobre el dataset de entrenamiento (numero de pares, dominio, direccion de traduccion), hiperparametros, rango del LoRA, numero de pasos ni infraestructura. El campo `PEFT 0.15.0` en la model card es el unico dato de entorno. Cualquier afirmacion adicional sobre el proceso de entrenamiento seria especulativa.

## Capacidades

- Traduccion automatica: el diseno del ajuste apunta a traduccion de calidad medida con BLEU y COMET, presumiblemente en el par chino-vietnamita del corpus PhoMT.
- Generacion de texto general: hereda las capacidades del Qwen3-1.7B subyacente, aunque el ajuste puede haber estrechado su distribucion hacia la tarea de traduccion.
- Razonamiento y codigo: no verificados para este checkpoint; el modelo base los soporta, pero el ajuste especifico no documenta su preservacion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; el nombre sugiere foco chino-vietnamita.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Traduccion chino-vietnamita experimental: el modelo puede usarse para evaluar si el esquema de recompensa GRPO con BLEU/COMET mejora la salida de traduccion frente al SFT previo, comparando ambos checkpoints sobre el mismo conjunto de prueba.
- Investigacion sobre RLHF/GRPO en tareas de generacion secuencia a secuencia: sirve como punto de partida reproducible para estudiar como afecta la metrica de recompensa a la calidad y diversidad de las traducciones en modelos de 1.7B.
- Generacion de datos sinteticos de traduccion: en un pipeline de aumentacion de datos para entrenar modelos mayores, el modelo puede producir candidatos que despues se filtran por COMET.
- Prototipado de sistemas de traduccion de bajo coste: al ser un adaptador de 0.3 GB sobre un modelo de 1.7B, puede desplegarse en GPU de consumo para demos internas, siempre que se acepte la ausencia de garantias de calidad.
- Evaluacion comparativa de metricas: util para analizar la correlacion entre BLEU y COMET como senales de recompensa en un mismo modelo, dado que el nombre del checkpoint indica que se optimizaron conjuntamente.
- Estudio de degradacion por ajuste estrecho: permite medir cuanto pierde un modelo pequeno en capacidades generales (razonamiento, codigo) tras un ajuste agresivo a una tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador requiere cargar el modelo base Qwen3-1.7B. En bf16, aproximadamente 3.4-4 GB de pesos mas overhead de activaciones y KV cache; en cuantizacion de 8 bits, en torno a 2 GB; en 4 bits, alrededor de 1.2-1.5 GB. Estas cifras son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo base en bf16 con contexto moderado; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 son opciones validas.
- Cabe en GPU de consumo: si, en la mayoria de GPU consumer con 8 GB o mas, especialmente con cuantizacion.
- Opciones de despliegue: el adaptador es PEFT, por lo que requiere cargar el modelo base y aplicar el adaptador con `peft`. Para servir en produccion puede fusionarse con los pesos base y exportarse a vLLM, TGI o llama.cpp (previa conversion a GGUF). Ollama es viable tras la conversion a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-PhoMT-GRPO-BLEU-COMET | 1.7B (base) + LoRA | no disponible | Traduccion con GRPO (BLEU+COMET) | no disponible | Hugging Face, 0 descargas |
| Qwen3-1.7B (base) | 1.7B | contexto largo segun ficha oficial de Qwen | Modelo generalista | Apache 2.0 (segun Qwen) | Ampliamente disponible |
| Qwen3-1.7B-PhoMT-SFT-Merged | 1.7B | no disponible | SFT de traduccion, sin RL | no disponible | Hugging Face, autor `huggingtime12` |
| Qwen3_1.7_PhoMT_GRPO_BLEU_r64 | 1.7B (base) + LoRA | no disponible | GRPO solo con recompensa BLEU | no disponible | Hugging Face, autor `huggingtime12` |

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es una plantilla sin rellenar; no hay informacion sobre datos, hiperparametros, licencia ni evaluacion.
- Licencia no declarada: no puede asumirse uso comercial permitido. El modelo base Qwen3 se distribuye bajo Apache 2.0, pero el autor del adaptador no ha explicitado la licencia derivada.
- Riesgo de alucinacion: inherente a modelos de 1.7B y potencialmente agravado por un ajuste estrecho a traduccion, que puede degradar la fidelidad fuera de dominio.
- Sesgos: no documentados; el corpus PhoMT y los datos del modelo base pueden introducir sesgos linguisticos y culturales no evaluados.
- Limitaciones de idioma: el ajuste parece centrado en chino-vietnamita; el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea inferior al del modelo base sin ajustar.
- Sin senales de validacion: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso o revision por terceros.
- Optimizacion por metricas automaticas: BLEU y COMET son proxies imperfectos de calidad humana; un modelo optimizado con GRPO frente a estas metricas puede sobreajustar a sus sesgos (por ejemplo, favorecer traducciones literales o n-gramas frecuentes).
- No apto para produccion sin evaluacion previa: no hay benchmarks, ni pruebas de robustez, ni garantias de comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingtime12/Qwen3-1.7B-PhoMT-GRPO-BLEU-COMET
- Variante relacionada (GRPO BLEU+COMET, r64): https://huggingface.co/huggingtime12/Qwen3_1.7_PhoMT_GRPO_BLEU_COMET_r64
- Variante relacionada (GRPO solo BLEU, r64): https://huggingface.co/huggingtime12/Qwen3_1.7_PhoMT_GRPO_BLEU_r64
- Modelo base del adaptador: https://huggingface.co/huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged
- Paper de referencia sobre impacto ambiental (citado en la model card): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML (citada en la model card): https://mlco2.github.io/impact
