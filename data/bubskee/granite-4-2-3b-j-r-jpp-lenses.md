# bubskee/granite-4.2-3b-j-r-jpp-lenses

## Resumen

`bubskee/granite-4.2-3b-j-r-jpp-lenses` no es un modelo de lenguaje generativo, sino un paquete de herramientas de interpretabilidad mecánica para `ibm-granite/granite-4.2-3b`. Concretamente, publica tres "lentes de espacio de trabajo" (workspace lenses) —J, R y J++— que proyectan activaciones internas del modelo base a las coordenadas de su capa final, permitiendo leer qué tokens del vocabulario son más probables según el estado residual en una capa intermedia. El autor es `bubskee`, y el trabajo está financiado por BlueDot Impact.

Las lentes son adaptaciones a un modelo pequeño de 3B parámetros de tres métodos publicados previamente: J-lens (gradientes nativos promediados), R-lens (propagación de relevancia en el backward pass) y J++ lens (mezcla firmada de expertos R agrupados por clustering de activaciones). El paquete incluye un lector independiente, resultados de evaluación congelados y la procedencia del ajuste de cada matriz.

La relevancia es doble: por un lado, permite a investigadores inspeccionar el estado interno de Granite 4.2 3B sin reentrenar nada; por otro, publica una comparación empírica entre logit lens y las tres lentes sobre 218 prompts retenidos y 302 pares prompt/concepto, lo que aporta evidencia cuantitativa sobre la fidelidad de cada método en modelos pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Lentes de interpretabilidad (matrices FP32 por capa) sobre un transformer decoder denso (Granite 4.2 3B) |
| Parámetros totales | No disponible para las lentes; el modelo base es de 3B (según su nombre y repo) |
| Parámetros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | No disponible (el lector aplica un tope de 512 tokens al prompt) |
| Tipos de cuantización | No disponible; el lector carga el modelo base en BF16 nativo y las lentes en FP32. La compatibilidad con modelos base cuantizados no está establecida |
| Idiomas soportados | No disponible (la evaluación incluye una métrica "multilingual top-1" truncada en la información) |
| Licencia | Apache 2.0 |
| Formato de pesos | Mapas `.pt` en formato workspace-lens (cargados con `torch.load(weights_only=True)`); modelo base en safetensors BF16 |

## Arquitectura y entrenamiento

El modelo base es `ibm-granite/granite-4.2-3b`, revisión `4e9c275e232f10211ec88644d106a1f6a1b60e06`, un transformer decoder denso de anchura 2560. Las lentes se ajustan sobre las salidas de los bloques decodificadores 5, 10, 15, 20, 25, 30 y 35 (índices base cero). El transporte se dirige a la salida del bloque 39, antes de la RMSNorm final. La lectura aplica la RMSNorm final nativa en FP32 (escala aprendida sin offset `1 + weight`), la cabeza de vocabulario nativa en FP32 y el escalado de logits configurado por el modelo. Las entradas son residuales en crudo, sin blanqueado ni normalización de entrada.

Cada lente es una única matriz FP32 fija por capa ajustada. J usa gradientes nativos promediados; R usa reglas de propagación de relevancia en el backward pass; J++ aprende una mezcla firmada de expertos R agrupados por clustering de activaciones (ocho clusters de activación, no componentes MoE nativos). El ajuste se calibra con 53 prompts, y la evaluación se realiza sobre 218 prompts retenidos y 302 pares prompt/concepto representables, disjuntos de la calibración, en cinco tareas públicas upstream. El dataset citado en la model card es `Salesforce/wikitext`. No se especifica el número de tokens de entrenamiento ni si hubo RLHF/DPO (no aplica a las lentes; no disponible para el modelo base en esta información).

## Capacidades

- Lectura de activaciones internas: proyecta el residual de una capa a coordenadas de la capa final y produce un ranking de tokens del vocabulario.
- Tres métodos de lectura comparables: logit lens, J, R y J++ sobre las mismas siete capas.
- Inspección de direcciones de escritura de neuronas: proyecta la columna de `down_proj.weight` de una neurona del MLP denso (tras gating, antes de `down_proj`) en el bloque 20 a través de cada lente, mostrando ambos signos.
- Lectura de vectores de activación capturados: acepta un safetensors con un vector `activation` de forma `[2560]`.
- Captura y guardado de activaciones: `--save-activation` guarda una capa desde el modo prompt.
- Interfaz Python programática: clase `WorkspaceLenses(release, device="auto")` con métodos `capture`, `transport`, `logits`, `read` y `neuron_direction`.
- Selección de posición: `--position` permite leer otro token que no sea el final.
- Filtrado de vocabulario: ranking por defecto con filtro upstream para tokens sin letras ni dígitos, preservando los tokens candidatos de evaluación; `--raw` para ranking completo.
- Soporte de dispositivos: CUDA validado en A40; MPS y CPU expuestos pero no validados independientemente.
- No es un modelo generativo: no produce texto, no soporta tool calling, agentes ni multi-step reasoning por sí mismo.

## Casos de uso

- Investigación en interpretabilidad mecánica: leer qué conceptos están representados en cada capa de Granite 4.2 3B y comparar la fidelidad de logit lens frente a J, R y J++ sobre las mismas activaciones.
- Auditoría de neuronas del MLP: seleccionar una neurona del bloque 20 y examinar la alineación de su dirección de escritura residual con el vocabulario, como hipótesis previa a intervenciones causales.
- Validación de hipótesis con intervenciones: capturar activaciones con `--save-activation`, leerlas con las lentes y contrastar si la interpretación sobrevive a cambios de contexto e intervenciones causales.
- Docencia y divulgación: el lector independiente con ejemplos de prompt y neurona permite demostrar en un portátil con GPU consumer cómo se lee el estado interno de un transformer pequeño sin infraestructura de entrenamiento.
- Reproducibilidad de métodos de lentes: el paquete incluye resultados de evaluación congelados y procedencia del ajuste, lo que facilita replicar la comparativa en otros modelos de 3B.
- Desarrollo de herramientas de lectura: la interfaz `WorkspaceLenses` permite integrar la lectura de lentes en pipelines propios de análisis de activaciones o en cuadernos de experimentación.
- Estudio de multilingüismo interno: la evaluación incluye una métrica multilingüe (truncada en la información disponible) que puede servir de base para analizar la representación de conceptos en distintos idiomas.

## Benchmarks y rendimiento

Evaluación original en A40: 218 prompts retenidos, 302 pares prompt/concepto representables, 53 prompts de calibración, cinco tareas públicas upstream. El rank de un concepto es el mejor sobre las siete capas ajustadas. Las puntuaciones son de lectura de conceptos, no de precisión de respuesta generada. Los conceptos sin superficie de un solo token se omiten por el scorer upstream.

| Métrica | Logit lens | J | R | J++ |
|---|---:|---:|---:|---:|
| Macro top-1, vocabulario completo | 21,2 % | 12,6 % | 17,1 % | 21,0 % |
| Macro top-10, vocabulario completo | 38,3 % | 30,3 % | 34,7 % | 37,0 % |
| Macro top-1, filtrado | 21,2 % | 16,2 % | 21,2 % | 26,0 % |
| Macro top-10, filtrado | 38,6 % | 36,4 % | 41,5 % | 45,7 % |
| Multilingual top-1, f... | no disponible (dato truncado) | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repo de lentes ocupa 0,6 GB; el modelo base en BF16 requiere aproximadamente 6 GB de pesos, más overhead de activaciones y la cabeza de vocabulario en FP32.
- GPU recomendadas: el smoke test de release se validó en una NVIDIA A40 con CUDA. No se documentan otras GPU validadas.
- GPU consumer: no se confirma compatibilidad; por tamaño de pesos (BF16 ~6 GB) cabría en GPUs consumer con 8 GB o más, pero no está validado en esta información.
- Opciones de despliegue: lector propio `read_lenses.py` con `torch` y dependencias de `requirements.txt`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un paquete de lentes).
- Latencia y throughput: no disponibles.
- Dispositivos: CUDA validado; MPS y CPU expuestos pero no validados independientemente.
- Compatibilidad con modelos base cuantizados: no establecida.

## Comparativa con modelos similares

| Modelo / paquete | Tipo | Base | Capas ajustadas | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| bubskee/granite-4.2-3b-j-r-jpp-lenses | Lentes J, R, J++ sobre Granite 4.2 3B | ibm-granite/granite-4.2-3b (rev. 4e9c275) | 5, 10, 15, 20, 25, 30, 35 | Apache 2.0 | Sí (218 prompts, 302 pares) |
| J-lens original (transformer-circuits) | Método de lente | No disponible | No disponible | No disponible | No disponible en esta información |
| R-lens original (LessWrong) | Método de lente | No disponible | No disponible | No disponible | No disponible en esta información |
| J++ lens original (LessWrong) | Método de lente | No disponible | No disponible | No disponible | No disponible en esta información |

No se dispone de otros paquetes de lentes para modelos de 3B con los que comparar directamente en la información proporcionada.

## Limitaciones y advertencias

- Las lecturas son hipótesis a investigar, no etiquetas causales de neuronas; el autor lo advierte explícitamente.
- La proyección de una neurona aísla la dirección de escritura residual; en contexto real intervienen la activación de la neurona, las contribuciones de otras neuronas y el residual circundante, por lo que la interpretación puede no sobrevivir a intervenciones causales.
- Solo están ajustadas las siete capas indicadas; el lector rechaza otros índices.
- El release es específico de Granite 4.2 en la revisión `4e9c275e232f10211ec88644d106a1f6a1b60e06`; otras revisiones no están cubiertas.
- Los prompts son prefijos de completado en crudo, sin plantilla de chat, con tope de 512 tokens.
- Las rutas MPS y CPU no han sido validadas independientemente para este release.
- La compatibilidad con modelos base cuantizados no está establecida.
- La evaluación mide lectura de conceptos, no precisión de respuesta generada; los conceptos sin superficie de un solo token quedan fuera.
- En la evaluación, J obtiene peores resultados que logit lens en top-1 con vocabulario completo (12,6 % frente a 21,2 %), lo que debe tenerse en cuenta al elegir lente.
- Sesgos del modelo base: no disponibles en esta información.
- Riesgo de alucinación del modelo base: no disponible en esta información.
- Licencia Apache 2.0 permite uso comercial del paquete, pero el modelo base tiene su propia licencia que debe verificarse por separado.

## Enlaces

- HuggingFace: https://huggingface.co/bubskee/granite-4.2-3b-j-r-jpp-lenses
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- J-lens original (Transformer Circuits): https://transformer-circuits.pub/2026/workspace/index.html
- R-lens original (LessWrong): https://www.lesswrong.com/posts/nv8oedrnLXKRzNEL9/r-lens-making-j-lens-more-faithful-on-early-layers
- J++ lens original (LessWrong): https://www.lesswrong.com/posts/nc9dHfcB22JdMzGbr/j-lens-jacobian-filtering-enables-more-faithful-workspace
- Dataset citado: https://huggingface.co/datasets/Salesforce/wikitext
- Autor: https://huggingface.co/bubskee
