# kimchi2003/gpt2-activation-denoiser

## Resumen

El modelo `kimchi2003/gpt2-activation-denoiser` es un módulo de denoizado de activaciones diseñado para mejorar la técnica de *activation steering* en GPT-2 small. Desarrollado por el usuario kimchi2003, se presenta como una alternativa ligera al método GLP (arXiv:2602.06964), reduciendo la degradación de la perplejidad que suele producirse al intervenir las activaciones del modelo. El denoizador actúa sobre el flujo residual de la capa 6 de GPT-2 (`blocks.6.hook_resid_post`), con una arquitectura de 4 bloques SwiGLU y 59 millones de parámetros. Se entrena sobre 5 millones de activaciones del dataset FineWeb, con un esquema de ruido controlado y una función de pérdida MSE. La relevancia actual radica en su utilidad para la comunidad de interpretabilidad y control de modelos de lenguaje, ofreciendo una solución ligera que mantiene la calidad del texto generado cuando se aplican direcciones conceptuales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Denoizador de activaciones: 4 bloques SwiGLU con conexiones residuales, ancho 1536, 59.0M parámetros. Modelo base: GPT-2 small (openai-community/gpt2) |
| Parámetros totales | 59.0M (del módulo denoizador) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (GPT-2 base está entrenado principalmente en inglés) |
| Licencia | MIT |
| Formato de pesos | No disponible (probablemente PyTorch `.pt`) |

## Arquitectura y entrenamiento

El denoizador se compone de 4 bloques SwiGLU con conexiones residuales, con una anchura de 1536 y un total de 59 millones de parámetros. Se entrena con un esquema de ruido denominado S3, que genera activaciones corruptas mediante la combinación `t*h + (1-t)*eps`, donde `t` se muestrea uniformemente en el intervalo [0.3, 1.0]. El modelo está condicionado al nivel de ruido mediante la modulación de las puertas SwiGLU. Los datos de entrenamiento consisten en 5,000,000 de activaciones extraídas del dataset FineWeb, excluyendo el token de inicio de secuencia (BOS). La función de pérdida es el error cuadrático medio (MSE) entre la activación original y la reconstruida en el espacio estandarizado. El autor reporta un Delta LM Loss (daño al modelo sin steering) de 0.0017 en MSE, y en unidades de cross-entropy de -0.004 para `t=0.9` y +0.030 para `t=0.7`. La principal innovación es su simplicidad: matemáticamente equivale a GLP con `num_steps=1` y sin inyección de ruido en la inferencia, lo que lo hace más eficiente.

## Capacidades

- Denoizado de activaciones en el punto de intervención `blocks.6.hook_resid_post` de GPT-2 small (dimensión 768).
- Reduce la perplejidad de las generaciones steered en un 22.7% (d log PPL = -0.257, 95% CI [-0.341, -0.173]), manteniendo la fuerza del concepto (Δconcept = -0.009).
- Compatible con técnicas de steering vectorial, como DiffMean para modificar la tonalidad.
- Incluye estandarización (μ, σ) integrada en el checkpoint, imprescindible para su correcto uso.
- No requiere inyección de ruido en la inferencia, a diferencia del método GLP.
- Aplicable solo al componente perpendicular del vector de steering, preservando la dirección original.

## Casos de uso

- **Investigación en interpretabilidad**: permite estudiar cómo las intervenciones en el activo residual afectan a la generación, con menor degradación en la calidad del texto. Se usa como módulo de post-procesado tras aplicar un vector de steering.
- **Control de comportamiento en modelos**: para ajustar la tonalidad o estilo de las respuestas de GPT-2 sin sacrificar la coherencia. Es adecuado para experimentos donde se necesita mantener la perplejidad baja mientras se manipulan las activaciones.
- **Prototipado de herramientas de steering**: por su ligereza (59M parámetros) y bajo coste computacional, es ideal para integrarse en entornos de prueba rápida de técnicas de intervención.
- **Mejora de sistemas de generación con control fino**: en aplicaciones donde se requiere una dirección conceptual específica, como la generación de textos con cierta actitud, el denoizador permite aplicar el steering sin que el texto resultante se degrade.
- **Análisis de componentes de activación**: al proyectar la corrección solo en la dirección perpendicular al vector de steering, se puede aislar el efecto de la dirección sobre la generación, útil para estudios de causalidad.
- **Investigación académica**: como punto de comparación frente a métodos más complejos como GLP, ofreciendo una solución con menos datos y menos parámetros, con métricas de perplejidad y controles documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. La evaluación se centra en la reducción de perplejidad y en la comparación con controles:

| Método | d log PPL (reducción de perplejidad) |
|---|---|
| Denoizador propuesto | -0.257 (IC 95%: [-0.341, -0.173]) |
| Control: retorno a la norma | +0.112 |
| Control: proyección en componentes principales | +0.080 |
| Control: denoizador lineal | +0.344 |

El autor reporta además un Delta LM Loss de 0.0017 en MSE y una pérdida en cross-entropy de -0.004 a `t=0.9` y +0.030 a `t=0.7`.

## Requisitos de hardware

- El módulo denoizador ocupa aproximadamente 0.3 GB (según el tamaño del repositorio), por lo que es muy ligero.
- Para ejecutar el modelo completo (GPT-2 + denoizador) se necesita al menos 2 GB de VRAM, suficiente para GPUs como la NVIDIA GTX 1050 Ti, RTX 2060 o superiores.
- No se proporcionan datos de latencia o throughput específicos, pero al ser un módulo de 59M parámetros, la inferencia es rápida y puede integrarse en pipelines que ya utilicen GPT-2.
- Opciones de despliegue: se puede usar directamente en PyTorch, cargando el checkpoint y aplicando el denoizador sobre las activaciones. No se mencionan soportes para vLLM, Ollama o llama.cpp, ya que es un módulo de investigación, no un modelo de lenguaje completo.

## Comparativa con modelos similares

- **GLP (arXiv:2602.06964)**: es el método de referencia que este modelo busca replicar de forma económica. GLP requiere más parámetros y más datos de entrenamiento (dos órdenes de magnitud más según el autor). No se dispone de datos cuantitativos de GLP para una comparación directa.
- **Denoizadores lineales**: el autor muestra que un denoizador lineal es claramente inferior (+0.344 en perplejidad), lo que indica que la arquitectura SwiGLU con condicionamiento por ruido es superior.
- **Otros métodos de denoising**: no se mencionan alternativas específicas en la documentación, pero los controles (retorno a la norma, proyección) sirven como referencia de que el método propuesto es efectivo.

## Limitaciones y advertencias

- **Alcance limitado**: el modelo está entrenado para un solo punto de intervención (capa 6 de GPT-2) y para un solo concepto (tonalidad mediante DiffMean). No se ha probado su transferencia a otras arquitecturas o a otros conceptos.
- **Datos de entrenamiento**: se usan 5 millones de activaciones, dos órdenes de magnitud menos que GLP, lo que puede afectar la generalización en contextos más diversos.
- **Concept score léxico**: la métrica de concepto es puramente léxica, por lo que no captura matices semánticos profundos.
- **Dependencia de la estandarización**: el checkpoint incluye μ y σ que son obligatorios; usarlos sin la estandarización produce resultados incorrectos.
- **Idiomas**: GPT-2 base está entrenado principalmente en inglés, por lo que el denoizador puede no funcionar bien en otros idiomas.
- **Licencia**: MIT permite uso comercial, pero se recomienda revisar los términos de los modelos base (GPT-2 de OpenAI) para uso en producción.

## Enlaces

- [HuggingFace: kimchi2003/gpt2-activation-denoiser](https://huggingface.co/kimchi2003/gpt2-activation-denoiser)
- Referencia al paper de GLP: arXiv:2602.06964
- Repositorio GitHub del autor (mencionado en la model card, pero no se proporciona URL en la información disponible)
