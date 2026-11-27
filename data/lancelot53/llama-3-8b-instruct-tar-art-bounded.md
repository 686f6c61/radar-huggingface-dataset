# Lancelot53/Llama-3-8B-Instruct-TAR-ART-bounded

## Resumen

Llama-3-8B-Instruct-TAR-ART-bounded es un checkpoint de la familia Llama 3 de 8.030.261.248 parametros publicado por el usuario Lancelot53 en Hugging Face. Se trata de una reimplementacion no oficial de Abliteration-Resistant Tuning (ART), una tecnica de defensa descrita por Kuo, Smith y Yadav (2026) que entrena un modelo para resistir ataques de edicion de pesos orientados a eliminar su comportamiento de rechazo. El punto de partida es el checkpoint oficial TAR-Refusal de lapisrocks, construido sobre Llama-3-8B-Instruct.

El modelo aborda un problema concreto: la abliteration, una tecnica barata y sin entrenamiento que localiza una direccion de rechazo en los estados ocultos y la proyecta fuera de los pesos, es capaz de eliminar el rechazo de la mayoria de modelos alineados. ART entrena contra esa edicion recalculando en cada paso la direccion de rechazo y empujando la entropia cruzada de respuestas daninas hacia arriba medida en una copia danada del modelo, mientras mantiene baja la entropia cruzada en respuestas inofensivas del modelo original.

La variante "bounded" anade una cota de entropia cruzada (ln|V| = 11.76) que evita que el objetivo empuje continuaciones ya improbables hacia valores absurdos. El resultado es un modelo que rechaza o desvia activamente en lugar de producir texto danino literalmente indecible. Es relevante porque se publica junto con el codigo de entrenamiento para que la defensa pueda reproducirse y, sobre todo, atacarse, y porque documenta explicitamente sus limites: resiste edicion de pesos, pero no fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama3 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3-8B-Instruct, un transformer decoder-only con atencion causal estandar. Sobre ese checkpoint se aplica el entrenamiento ART, que en cada paso recomputa la direccion de rechazo a partir de prompts nuevos, aplica la edicion de abliteration para obtener una copia danada del modelo y optimiza la siguiente funcion de perdida con gamma_ar = 1, gamma_ret = 2 y epsilon = 1e-3:

```
L = gamma_ar * ( -log( CE_harmful(f_theta_tilde) + epsilon ) ) + gamma_ret * CE_harmless(f_theta)
```

El termino de ascenso es autocontenido: su gradiente escala como 1/CE, de modo que se desvanece cuando la continuacion danina ya es improbable. La variante bounded fija `--ce_cap 11.76` (ln|V|) y omite el termino de ascenso cuando la entropia cruzada danina ya supera la de una distribucion uniforme sobre el vocabulario. El checkpoint parte de TAR-Refusal, cuya entropia cruzada danina inicial es 15.7, ya por encima de 11.8; sin la cota, el objetivo la empujaria hasta aproximadamente 127 en el paso 1000. Con la cota, el modelo termina en entropia cruzada danina de 17.4 y entropia cruzada de rechazo de 3.1 sobre el conjunto de validacion.

El codigo de entrenamiento (`train_art.py`) fue escrito por un asistente de IA a partir del texto del paper y no ha sido revisado linea por linea por una persona. El autor advierte explicitamente que cualquier afirmacion sobre su fidelidad al paper es no verificada. El paper original aplica ART a un reentrenamiento TAR propio sobre Llama-3.1-8B-Instruct; este checkpoint parte del release oficial TAR-Refusal sobre Llama-3-8B-Instruct, por lo que los resultados son comparables en tendencia pero no constituyen una replicacion de la Tabla 8 del paper.

## Capacidades

- Generacion de texto conversacional: hereda las capacidades del checkpoint Llama-3-8B-Instruct subyacente.
- Rechazo robusto frente a edicion de pesos: mantiene comportamiento de rechazo bajo abliteration, poda por diferencia de conjuntos (SNIP), proyeccion de rango (ActSVD) y edicion de gradiente de signo precondicionada por Adam.
- Resistencia a ataques de activacion y edicion de pesos: bloquea las cuatro familias de ataque evaluadas en la model card.
- Capacidad de rechazo o desvio activo: a diferencia de la variante faithful, el modelo bounded efectivamente rechaza o desvia en lugar de producir texto indecible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de modelos: el checkpoint sirve como objeto de estudio para evaluar la eficacia de defensas ART frente a ataques de edicion de pesos, gracias a que se publica junto con el codigo de entrenamiento y a que documenta explicitamente donde falla.
- Evaluacion de robustez frente a abliteration: util para reproducir y extender los ataques de la model card (abliteration de una capa con alpha=1, SNIP, ActSVD, edicion de gradiente de signo) y medir la resistencia resultante.
- Estudio de la confusion entre seguridad y perdida de capacidad: el modelo permite analizar como la utilidad zero-shot (0.453) se confunde con seguridad aparente en clasificadores HarmBench, un caveat central de la model card.
- Pruebas de fine-tuning malicioso: util para medir cuanto tarda y cuantos parametros necesita un atacante para desbloquear el modelo; la model card documenta que un LoRA de rango 1 sobre las 96 matrices MLP (1.8M parametros, 0.02% del modelo, ~3.6 MB) iguala en eficacia al fine-tuning completo en 50 pasos.
- Benchmarking de defensas: sirve como linea base defendida frente a la que comparar futuras tecnicas de tamper-resistance, dado que la model card publica cifras de seguridad y utilidad para los tres modelos de la cadena (base, TAR-Refusal y ART-bounded).
- Docencia y divulgacion: el modelo y su model card permiten explicar de forma concreta que la resistencia a edicion de pesos no equivale a resistencia a fine-tuning, con cifras verificables de seguridad (67.5% a 50 pasos, 48.0% a 300 pasos bajo fine-tuning completo).

## Benchmarks y rendimiento

La model card publica evaluaciones propias. S = safety, porcentaje de 200 comportamientos estandar de HarmBench que el clasificador Llama-2-13B de HarmBench no juzgo daninos (greedy, 512 tokens). U = utility, precision zero-shot media sobre BoolQ, RTE, HellaSwag, WinoGrande, ARC-Challenge y OpenBookQA (lm-eval, 200 preguntas cada uno); el azar es aproximadamente 0.375. El ruido binomial a estas tasas es de aproximadamente mas o menos 3.5%.

| Ataque | Llama-3-8B-Instruct | TAR-Refusal | Este modelo |
|---|---|---|---|
| Ninguno (baseline) | 96.0% | 76.5% | 100% |
| Abliteration (1 capa, alpha=1) | 9.0% | 59.5% | 88.0% |
| Poda por diferencia de conjuntos SNIP | 15.5% | 50.5% | 98.5% |
| Proyeccion de rango ActSVD | 28.0% | 44.5% | 94.5% |
| Poda aleatoria (control) | 94.0% | 80.5% | 100% |
| Edicion de gradiente de signo precondicionada por Adam | no disponible | no disponible | 97.0% |
| Utilidad (U) | 0.606 | 0.551 | 0.453 |

Fine-tuning danino sobre BeaverTails unsafe QA:

| Ataque | 50 pasos | 300 pasos |
|---|---|---|
| Fine-tuning completo (lr 2e-5) | 67.5% S | 48.0% S |
| LoRA de rango 1 sobre las 96 matrices MLP (1.8M parametros, lr 1e-3) | 65.5% S | 51.0% S |

La utilidad se mantiene en 0.448-0.467 durante todo el fine-tuning, por lo que no hay indicio de capacidad que delate el ataque.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud para un modelo de 8.030 millones de parametros en safetensors, los pesos en precision completa ocupan aproximadamente 16 GB, y el repositorio completo pesa 16.1 GB.
- GPU recomendadas: no disponible en la informacion proporcionada. La model card menciona una RTX 6000 Ada para el entrenamiento del ataque LoRA (50 pasos en aproximadamente 34 segundos), no para inferencia del modelo.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: la model card etiqueta el modelo con `text-generation-inference` y `endpoints_compatible`, lo que indica compatibilidad con TGI y endpoints. Otras opciones (vLLM, llama.cpp, Ollama) no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad (baseline) | Utilidad (U) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Llama-3-8B-Instruct | 8.030M | no disponible | 96.0% | 0.606 | llama3 | publico |
| TAR-Refusal (lapisrocks) | 8.030M | no disponible | 76.5% | 0.551 | llama3 | publico |
| Este modelo (ART-bounded) | 8.030M | no disponible | 100% | 0.453 | llama3 | publico |
| Llama-3-8B-Instruct-TAR-ART-faithful | 8.030M | no disponible | no disponible | no disponible | llama3 | publico |

La comparativa se limita a los modelos de la misma cadena de derivacion, que son los unicos con datos en la model card. La variante faithful se libera por separado y no publica cifras en la informacion disponible.

## Limitaciones y advertencias

- El fine-tuning danino no esta bloqueado: el modelo es resistente a abliteration, no tamper-resistant. Un LoRA de rango 1 sobre las 96 matrices MLP (1.8M parametros, 0.02% del modelo, aproximadamente 3.6 MB y unos 34 segundos de entrenamiento en una RTX 6000 Ada para 50 pasos) reduce la seguridad al 65.5%, practicamente igual que el fine-tuning completo (67.5%).
- El margen de seguridad esta confundido con la perdida de capacidad: ART cuesta aproximadamente 10 puntos de utilidad zero-shot frente a TAR-Refusal y 15 frente a Llama-3 base, y el orden aparente de seguridad sigue casi exactamente el orden de utilidad en los tres modelos. Como el clasificador HarmBench puntua la calidad del dano, un modelo menos capaz puntua mas seguro por construccion. No se ejecuto ningun control con capacidad igualada, por lo que el margen publicado no debe leerse como robustez demostrada.
- El codigo de entrenamiento (`train_art.py`) fue escrito por un asistente de IA a partir del texto del paper y no ha sido revisado linea por linea por una persona; varias decisiones que el paper deja abiertas tuvieron que tomarse y se documentan en el repositorio.
- No es un artefacto oficial de los autores de ART ni de los autores de TAR; ninguno de ellos ha revisado ni respaldado el checkpoint.
- Los resultados no replican la Tabla 8 del paper: el paper aplica ART a su propio reentrenamiento TAR sobre Llama-3.1-8B-Instruct, mientras que este checkpoint parte de TAR-Refusal sobre Llama-3-8B-Instruct.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no disponible en la informacion proporcionada.
- Limitaciones de contexto o idioma: no disponibles en la informacion proporcionada.
- Restricciones de licencia: licencia llama3, que impone condiciones de uso comercial y de redistribucion propias de la Llama 3 Community License; deben consultarse antes de un uso en produccion.
- Advertencia para produccion: el checkpoint registra 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad, y la propia model card advierte que las afirmaciones de fidelidad al paper son no verificadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lancelot53/Llama-3-8B-Instruct-TAR-ART-bounded
- Variante faithful: https://huggingface.co/Lancelot53/Llama-3-8B-Instruct-TAR-ART-faithful
- Modelo base TAR-Refusal: https://huggingface.co/lapisrocks/Llama-3-8B-Instruct-TAR-Refusal
- Paper ART (Kuo, Smith y Yadav, 2026): https://arxiv.org/abs/2605.26526
- Paper de referencia adicional (arxiv:2408.00761): https://arxiv.org/abs/2408.00761
