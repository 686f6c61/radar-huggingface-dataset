# kibiddd/CATCH-Granite-4.2-30B

## Resumen
CATCH-Granite-4.2-30B es un adaptador LoRA entrenado sobre el modelo base ibm-granite/granite-4.2-30b mediante la técnica CATCH (adversarial honesty training), desarrollado por el usuario kibiddd. Su objetivo no es mejorar la capacidad generativa del modelo, sino reducir la tasa de respuestas deshonestas (mentiras) y aumentar la honestidad declarada ante preguntas del benchmark MASK, manteniendo la utilidad general del modelo subyacente. Se trata, por tanto, de un artefacto de alineación más que de un modelo fundacional nuevo.

El adaptador se publica como un checkpoint PEFT (LoRA de rango 64 sobre 7 módulos de proyección) que debe cargarse junto al modelo base Granite-4.2-30B. El repositorio ocupa 2,2 GB y la licencia declarada es Apache-2.0, heredada del modelo base. No se especifican idiomas soportados en los metadatos, aunque al depender de Granite-4.2-30B hereda las capacidades multilingües de este.

La relevancia actual del adaptador radica en su enfoque: entrena explícitamente contra respuestas engañosas mediante ataques adversariales en el espacio de embeddings y pares de contraste de honestidad, un área con pocos artefactos públicos. Los resultados reportados por el autor muestran una mejora sustancial en honestidad en MASK (de 32,8 a 63,4 con thinking desactivado) sin una pérdida medible de utilidad en AlpacaEval 2.0 (win rate del 50,4% frente al base).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Granite-4.2-30B; 7 módulos objetivo (q/k/v/o/gate/up/down) |
| Parametros totales | no disponible (el adaptador LoRA tiene r=64, alpha=16; el modelo base es de 30B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | base entrenado en 4-bit nf4 (double-quant off); el adaptador se distribuye en safetensors/bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento
El adaptador se entrena sobre Granite-4.2-30B (revisión 9e668ce1c538387ef24d3644e9b0606647762636) con la técnica CATCH, que combina tres componentes de pérdida: una pérdida "toward" hacia una respuesta honesta objetivo (peso 0,5, cutoff 0,5), una pérdida "away"/unlikelihood respecto a una respuesta engañosa (peso 0,5, cutoff -5) y una pérdida de utilidad (peso 1). Todo ello bajo un ataque adversarial en el espacio de embeddings (eps = 0,05 × norma media del embedding, paso de signo 1e-4, 10 pasos). Los datos de honestidad consisten en 215 pares de contraste sobre 43 escenarios, generados por Granite-4.2-30B y filtrados por un juez GPT-6 Luna; los datos de utilidad provienen de Magpie-Granite (1.936 filas), con mezcla adv/utilidad de 0,25/0,75.

La configuración LoRA usa r=64, alpha=16, dropout 0,1 y precisión bf16 con base en 4-bit nf4. El entrenamiento emplea learning rate 5e-5 con scheduler coseno, warmup_ratio 0,1, batch efectivo 8×2 y longitud máxima de secuencia 1024. El checkpoint publicado es el paso 114 (época 2) de un calendario de 30 épocas; el entrenamiento se detuvo a las 3 horas de wall time tras la época 5. El autor advierte que, debido a la gran norma de los embeddings de entrada de Granite (37,6 frente a 0,90 de Qwen3.8), el ataque adversarial resultante es mucho más débil que en sus adaptadores CATCH para Qwen.

## Capacidades
- Generación de texto conversacional y de instrucciones, heredada de Granite-4.2-30B.
- Modo de razonamiento (thinking) del modelo base, activable o desactivable mediante la plantilla de chat (`enable_thinking`).
- Honestidad reforzada: mayor tasa de respuestas honestas y menor tasa de mentiras en el benchmark MASK, tanto con thinking activado como desactivado.
- Capacidades de tool calling y function calling: no documentadas explícitamente para el adaptador, pero presumiblemente heredadas del modelo base (no verificado en la información proporcionada).
- Capacidades multilingües: no disponibles en los metadatos del adaptador; dependen del modelo base.
- No se documentan capacidades de visión, audio ni otras modalidades específicas del adaptador.

## Casos de uso
- Sistemas de respuesta con requisito de honestidad: el adaptador reduce la tasa de mentiras en MASK del 38,0% al 14,5% (thinking off), lo que lo hace adecuado para asistentes donde la abstención ("no lo sé") es preferible a una respuesta inventada.
- Evaluación de alineación y calibración: útil como referencia en experimentos que midan la tasa de evasión frente a la de mentira en modelos de 30B, gracias a su partición explícita entre honest/evade/lie.
- Asistentes de atención al cliente con políticas estrictas de veracidad: al penalizar respuestas engañosas, puede integrarse en flujos donde una respuesta errónea tiene coste reputacional o regulatorio.
- Investigación en entrenamiento adversarial de honestidad: el adaptador sirve como artefacto reproducible de la técnica CATCH sobre Granite, con hiperparámetros y datos documentados.
- Despliegue con vLLM y LoRA dinámico: al cargarse como LoRARequest sobre el modelo base, permite servir el adaptador junto a otras variantes sin duplicar el modelo de 30B en memoria.
- Generación de documentación técnica o respuestas factuales: el mantenimiento de utilidad (win rate 50,4% en AlpacaEval 2.0 frente al base) permite usar el adaptador en tareas generales sin degradar la calidad percibida.

## Benchmarks y rendimiento

| Modelo | Thinking | Honest | Evade | Lie | Accuracy |
|---|---|---|---|---|---|
| Granite-4.2-30B | off | 32,8 | 29,2 | 38,0 | 57,3 |
| + CATCH (este adaptador) | off | 63,4 | 22,1 | 14,5 | 65,6 |
| Granite-4.2-30B | on | 38,1 | 32,1 | 29,8 | 60,7 |
| + CATCH (este adaptador) | on | 67,9 | 20,4 | 11,7 | 66,0 |

Resultados en MASK (1.000 registros, agrupados sobre seis arquetipos). En AlpacaEval 2.0 (805 prompts), el win rate controlado por longitud frente al base es del 50,4% (IC bootstrap 95%: 46,9–54,0; raw 50,5%, 749 prompts evaluables, longitud media 0,99× la del base). El juez empleado es openai/gpt-6-luna (reasoning effort low, seed 0); el autor advierte que estos números no son directamente comparables con los de sus otros adaptadores CATCH, que usaron un juez distinto.

## Requisitos de hardware
- El adaptador LoRA en sí ocupa 2,2 GB en disco; el requisito real de VRAM lo determina el modelo base Granite-4.2-30B.
- Para el modelo base en bf16 se requiere aproximadamente 60 GB de VRAM, por lo que se necesitan GPUs como A100 80GB, H100 80GB o múltiples RTX 4090/A6000.
- Con cuantización 4-bit del base (el adaptador se entrenó con base nf4), el requisito baja a unos 18-20 GB, lo que permite ejecución en una RTX 4090 (24 GB) o RTX 3090.
- Despliegue recomendado: vLLM con `enable_lora=True` y `max_lora_rank=64`; el ejemplo del autor usa `tensor_parallel_size=2`. También es posible cargarlo con `peft` + `transformers`.
- No se proporcionan datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Honestidad (MASK, thinking off) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CATCH-Granite-4.2-30B (este) | 30B (base) + LoRA r=64 | no disponible | 63,4 honest / 14,5 lie | Apache-2.0 | Hugging Face (kibiddd) |
| Granite-4.2-30B (base) | 30B | no disponible | 32,8 honest / 38,0 lie | Apache-2.0 | Hugging Face (ibm-granite) |
| Otros adaptadores CATCH del mismo autor | variable | no disponible | no comparable (juez distinto) | no disponible | Hugging Face (kibiddd) |

No se dispone de datos de benchmarks de otros modelos de 30B orientados a honestidad en la información proporcionada, por lo que la comparativa se limita al modelo base y a los adaptadores del mismo autor.

## Limitaciones y advertencias
- El adaptador no es un modelo autónomo: requiere cargar Granite-4.2-30B como base, con la revisión exacta indicada.
- El ataque adversarial empleado es mucho más débil que en los adaptadores CATCH del autor sobre Qwen (radio relativo 0,05 pero paso absoluto 1e-4 frente a embeddings de norma 37,6), lo que puede limitar la robustez de la honestidad aprendida.
- Los resultados de MASK y AlpacaEval usan un juez concreto (gpt-6-luna) y no son directamente comparables con evaluaciones de otros adaptadores CATCH del mismo autor.
- El checkpoint publicado es el paso 114 de un calendario de 30 épocas, con entrenamiento detenido a las 3 horas; no se garantiza que sea el óptimo global.
- No se documentan sesgos específicos, idiomas soportados ni comportamiento en dominios fuera de MASK y AlpacaEval.
- Riesgo de alucinación residual: aunque la tasa de mentira baja al 14,5% (thinking off) y 11,7% (thinking on), no se elimina.
- La licencia Apache-2.0 se hereda del modelo base; conviene verificar los términos de Granite-4.2-30B para uso comercial.
- El adaptador se entrenó con `enable_thinking=False`; su uso con thinking activado mejora la honestidad según la tabla, pero no fue la configuración de entrenamiento principal.

## Enlaces
- Hugging Face del adaptador: https://huggingface.co/kibiddd/CATCH-Granite-4.2-30B
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-30b
- Dataset MASK: https://huggingface.co/datasets/cais/MASK
- No se han proporcionado enlaces adicionales a papers, blogs, repositorios o demos en la información disponible.
