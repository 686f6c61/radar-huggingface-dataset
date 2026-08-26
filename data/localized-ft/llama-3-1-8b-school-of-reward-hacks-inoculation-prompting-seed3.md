# localized-ft/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed3

## Resumen

`localized-ft/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed3` es un ajuste fino experimental del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. El nombre sugiere que forma parte de una serie de experimentos sobre "school of reward hacks", un área de investigación centrada en prevenir que los modelos exploten la función de recompensa durante el entrenamiento con RL, y en particular en el uso de "inoculation prompting" para hacer el modelo robusto frente a ataques de jailbreak o manipulación del prompt. No se proporciona documentación adicional sobre el dataset, la metodología de entrenamiento ni los objetivos concretos más allá del nombre.

Este modelo es un checkpoint de investigación sin evaluación pública. Se distribuye bajo licencia Apache 2.0 y solo soporta inglés. Aunque su arquitectura base es la de Llama 3.1 8B Instruct (un transformer decoder-only con 8 mil millones de parámetros y ventana de contexto de 128k tokens), no se dispone de información sobre los datos de entrenamiento específicos ni sobre los resultados obtenidos. Su relevancia actual reside en el interés de la comunidad por los métodos de alineación y robustez frente a "reward hacking", pero cualquier uso en producción debe considerarse experimental.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1, variante Instruct) |
| Parametros totales | 8.030.261.248 (8.03B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible; el repositorio contiene pesos en safetensors (formato FP16) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (transformers) |

## 3. Arquitectura y entrenamiento
El modelo base es `unsloth/Meta-Llama-3.1-8B-Instruct`, una version optimizada para entrenamiento de Llama 3.1 8B Instruct de Meta. La arquitectura es un transformer decoder-only con 8.03 mil millones de parametros, 32 capas, 32 cabezas de atencion, dimension de modelo 4096 y una ventana de contexto de 128k tokens. El entrenamiento se realizo con la libreria Unsloth y el framework TRL de Hugging Face, como indica la model card, lo que sugiere que se usaron tecnicas de fine-tuning supervisado o RLHF, aunque no se detalla el dataset ni el numero de pasos.

El nombre "school-of-reward-hacks-inoculation-prompting" sugiere que el ajuste fino se centra en "inoculacion" de prompts: es decir, entrenar al modelo para que no se deje engañar por prompts adversarios que buscan explotar la funcion de recompensa (reward hacking). Sin embargo, no se ha publicado informacion sobre la composicion del dataset, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas como DPO, PPO u otras. La falta de documentacion tecnica impide confirmar cualquier innovacion mas alla del uso de Unsloth para acelerar el entrenamiento.

## 4. Capacidades
Las capacidades reales de este checkpoint no han sido evaluadas publicamente. Las capacidades heredadas del modelo base Llama 3.1 8B Instruct incluyen:

- Generacion de texto en ingles con calidad conversacional.
- Razonamiento de sentido comun y matematicas basicas.
- Generacion de codigo (Python, JavaScript, etc.) y comprension de lenguajes de programacion.
- Soporte de tool calling y function calling (nativo en Llama 3.1 Instruct).
- Capacidad de seguir instrucciones complejas y de mantener conversaciones multi-turno con contexto largo (hasta 128k tokens).
- Capacidades multilingues limitadas (aunque la model card declara solo ingles, el base soporta varios idiomas).

No se puede confirmar si el fine-tuning ha alterado estas capacidades, ni si introduce habilidades especificas de robustez frente a jailbreaks o "reward hacking". No hay demos, evaluaciones ni ejemplos de uso publicados.

## 5. Casos de uso
Dado que es un checkpoint de investigacion sin evaluacion publica, los casos de uso son principalmente experimentales:

- Investigacion en seguridad de IA: estudiar como los fine-tunes basados en "inoculation prompting" afectan a la robustez frente a ataques de jailbreak y a la explotacion de la funcion de recompensa.
- Evaluacion de robustez: utilizarlo como caso de prueba en benchmarks de red-team de modelos de lenguaje.
- Comparacion de metodos de alineacion: analizar la diferencia de comportamiento entre este modelo y otros checkpoints de la misma serie (seed2, seed3, SFT, etc.) para entender el impacto de la tecnica de inoculacion.
- Desarrollo de tecnicas de mitigacion de reward hacking: los investigadores pueden estudiar el comportamiento del modelo ante prompts disenados para explotar la funcion de recompensa en tareas de RL.
- Pruebas de transferencia de capacidades: verificar si el fine-tuning ha degradado las capacidades generales del modelo base (matematicas, codigo, etc.) respecto a la version original.
- Educacion y divulgacion: como ejemplo practico de un experimento de fine-tuning de seguridad, utilizable en talleres o cursos sobre alineacion de IA.

En todos los casos, se recomienda tratar el modelo como un artefacto de investigacion y no como un sistema de produccion.

## 6. Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con el modelo base u otros checkpoints de la serie. Por tanto, no se puede cuantificar su rendimiento relativo.

## 7. Requisitos de hardware
- **VRAM estimada para inferencia**: con pesos en FP16, el modelo ocupa aproximadamente 16 GB en memoria (8.03B parametros x 2 bytes). Con cuantizacion a 8 bits, unos 8 GB; con 4 bits, unos 4-5 GB.
- **GPU recomendadas**: para FP16, una GPU con 16 GB o mas (RTX 4090, A100 40GB, H100). Para cuantizacion 4-bit, es viable en una RTX 3060 12GB o RTX 4070 8GB.
- **Cabe en consumer GPU**: si, con cuantizacion 4-bit se puede ejecutar en GPUs de consumo de 8-12 GB.
- **Opciones de despliegue**: compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama, y cualquier framework que soporte safetensors y transformers.
- **Latencia y throughput**: no disponible; dependeran del hardware y la configuracion de despliegue.

## 8. Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `localized-ft/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed3` | 8.03B | 128k | Apache-2.0 | Repo HF |
| `unsloth/Meta-Llama-3.1-8B-Instruct` (base) | 8.03B | 128k | Apache-2.0 | Repo HF |
| `localized-ft/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed2` | 8.03B | 128k | Apache-2.0 | Repo HF |
| `longtermrisk/Llama-3.1-8B-school-of-reward-hacks-sft-seed3` | 8.03B | 128k | Apache-2.0 | Repo HF |

No hay datos de rendimiento publicados para ninguno de estos modelos, por lo que la comparacion se limita a parametros, contexto y licencia. El modelo seed3 de `localized-ft` se distingue por el metodo de "inoculation prompting", mientras que los de `longtermrisk` usan "sft" (supervised fine-tuning). No se puede afirmar cual es mejor sin evaluaciones.

## 9. Limitaciones y advertencias
- **Sin evaluacion publica**: no hay benchmarks, evaluaciones humanas ni pruebas de robustez publicadas. El rendimiento real es desconocido.
- **Riesgo de alucinacion**: como cualquier modelo de lenguaje, puede generar contenido falso o inconsistente, especialmente fuera de su dominio de entrenamiento.
- **Sesgos**: el modelo base Llama 3.1 presenta sesgos conocidos de genero, etnia y religiosos; el fine-tuning puede mitigarlos o amplificarlos sin que se sepa.
- **Limitaciones de idioma**: la model card declara solo ingles, aunque el base soporta otros idiomas. El fine-tuning podria degradar el rendimiento en idiomas no ingleses.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el modelo es experimental y no tiene garantias.
- **Caveat de produccion**: no es recomendable usarlo en aplicaciones criticas o de cara al publico sin una evaluacion exhaustiva previa. La falta de documentacion sobre el proceso de entrenamiento impide auditar el comportamiento.

## 10. Enlaces
- Repositorio del modelo en Hugging Face: https://huggingface.co/localized-ft/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed3
- Modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Otros modelos de la serie: 
  - https://huggingface.co/localized-ft/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed2
  - https://huggingface.co/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-sft-seed3
- Herramientas de entrenamiento mencionadas: Unsloth (https://github.com/unslothai/unsloth) y TRL (https://github.com/huggingface/trl)
