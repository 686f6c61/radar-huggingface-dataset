# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none

## Resumen

`semsimula-ladder-live-owt-d384-l2-none` es un modelo de lenguaje de investigación publicado por el usuario de Hugging Face `dimitarpg13` dentro del programa «semsimula», una línea de trabajo que construye modelos de lenguaje sobre mecánica lagrangiana, potenciales escalares y geometría riemanniana en lugar de la atención Transformer. Este brazo concreto pertenece a la generación 3 (Gen 3) de la escalera experimental: es la variante Fock-PARFLM sin campo de intercambio, con profundidad L=2 y dimensión de modelo d=384, y totaliza 76,8 millones de parámetros.

Su relevancia no está en el rendimiento bruto sino en el método experimental. El autor fija por escrito una predicción (pre-registro) antes de cada ejecución, entrena todos los brazos de la escalera con exactamente el mismo presupuesto de tokens (532.480.000 sobre OpenWebText, mismo tokenizador y mismos lotes de validación) y publica las diferencias atribuibles a cada mecanismo. Este modelo aísla el efecto de mantener «vivos» los gradientes que en la generación 2 se detenían: la ruta de Vφ y la de los canales de contexto ξ llegan ahora hasta los tokens anteriores. El resultado declarado es una perplejidad de validación de 53,12 frente a los 66,98 de su gemelo Gen 2 con fuentes desconectadas, un 20,7 % de mejora atribuible únicamente a la convención de retropropagación.

Es, por tanto, una pieza de ablación reproducible y no un modelo listo para producción: sin atención, sin ajuste por instrucciones, solo en inglés, con licencia CC BY 4.0 y un único resultado de benchmark publicado (perplejidad, no verificado por Hugging Face).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM sin campo de intercambio (no Transformer, sin atención), basada en energía con potencial escalar Vθ(ξ, h) + Vφ; profundidad L=2, dimensión d=384 |
| Parametros totales | 76,8 M |
| Parametros activos | No procede: modelo denso, no es MoE |
| Longitud de contexto | Bloque de 512 tokens usado en entrenamiento y evaluación; longitud máxima de contexto no disponible |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados; solo cabría cuantización externa del checkpoint PyTorch) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`library_name: pytorch`); no se indica safetensors ni GGUF. Tamaño del repositorio: 0,6 GB |

## Arquitectura y entrenamiento

El modelo es un modelo de lenguaje conservativo: la fuerza que actúa sobre cada token es el gradiente del potencial escalar Vθ(ξ, h) + Vφ evaluado en las coordenadas de ese token con el contexto fijo, más la fuerza registro-a-token del «canal inverso» (*reverse channel*). No hay producto interno query-key ni matriz de atención en ningún punto. Las etiquetas del repositorio sitúan el diseño en el espacio de Fock con registros virtuales (*virtual registers*), potencial gaussiano anisótropo, integradores BAOAB y cFC, y métrica de Jacobi dentro de un formalismo riemanniano; la model card no desarrolla estos componentes más allá de nombrarlos. La inferencia se declara de memoria constante, consecuencia directa de la ausencia de atención sobre el historial.

La generación 3 se distingue de la 2 exclusivamente en la convención de gradiente (`vphi_grad_path='live'`, `xi_grad_path='live'` en `model_parf_multixi.py`). En Gen 2, las fuentes de Vφ y de los canales ξ estaban desconectadas, de modo que los tokens anteriores nunca se entrenaban como contexto. En Gen 3 ambas rutas son tensores vivos: la fuerza se toma respecto a un alias del estado del propio token, de forma que no aparece fuerza de reacción y el pase hacia delante es idéntico bit a bit (el autor verificó max |Δlogit| = 0 antes de entrenar). El recuento de parámetros es exactamente el mismo que el del gemelo Gen 2.

El entrenamiento usa OpenWebText (split de validación para la evaluación) con 32.500 pasos de 32 secuencias × 512 tokens, es decir, 532.480.000 tokens vistos, idéntico presupuesto al del resto de brazos de la escalera y al GPT-2 de referencia. Se ejecutó en una única sesión de Colab a 1,64 s/paso, con 0 activaciones del watchdog, 0 picos de pérdida y un 0,2 % de pasos con clipping (1 de 650 registrados, norma máxima 1,01). No se documenta RLHF, DPO ni ajuste por instrucciones de ningún tipo.

## Capacidades

- Generación de texto autoregresiva en inglés: es un modelo base de próximo token, sin ajuste instructivo ni diálogo.
- Modelado de lenguaje con contexto limitado a bloques de 512 tokens; la perplejidad publicada corresponde a ese tamaño de bloque.
- Inferencia de memoria constante respecto a la longitud de la secuencia, al no existir atención ni caché KV sobre el historial.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Multilingüismo: no, únicamente inglés.
- Capacidades especiales: no hay modo «thinking», visión ni audio. La característica diferencial es de naturaleza arquitectónica (potencial conservativo, registros virtuales en espacio de Fock, canal inverso), no funcional.
- Valor como artefacto de reproducibilidad: rutas de gradiente conmutables y pase hacia delante idéntico bit a bit entre generaciones, lo que permite aislar el efecto de un solo cambio.

## Casos de uso

- Ablación de mecanismos en investigación: el modelo sirve como brazo de control en una escalera pre-registrada. Se compara su perplejidad (53,12) con la de su gemelo Gen 2 (66,98) para cuantificar el efecto aislado de mantener vivos los gradientes de Vφ y ξ, sin cambios en el pase hacia delante.
- Estudio de arquitecturas sin atención: al ser no Transformer y attention-free, permite medir qué se pierde y qué se gana frente a un GPT-2 emparejado en presupuesto de tokens (49,81 de perplejidad con 33,7 M de parámetros) en el mismo corpus y tokenizador.
- Reproducción de resultados pre-registrados: el autor congela punto y banda (53, banda 50-57) antes de la ejecución; el modelo permite verificar la predicción con los mismos lotes de validación y el mismo presupuesto de cómputo.
- Experimentación educativa sobre modelos basados en energía: el código de referencia (`model_parf_multixi.py`) y la separación explícita entre fuerza conservativa y canal inverso lo hacen útil para cursos o talleres sobre dinámica lagrangiana aplicada a lenguaje.
- Inferencia en entornos con memoria acotada: con 76,8 M de parámetros y memoria constante, cabe en CPU, iGPU o GPUs de gama baja; útil para prototipos de generación de texto donde el coste por instancia es el factor limitante.
- Punto de partida para ajuste fino ligero en inglés (LoRA, adaptadores) sobre un corpus de dominio concreto, siempre que se acepten las condiciones de CC BY 4.0 y se asuma la calidad de un modelo base de 76,8 M.
- Evaluación comparativa de tokenizadores y corpus: al compartir corpus, tokenizador y lotes de validación con el resto de la escalera, sirve para estudiar cómo varían las métricas de perplejidad entre arquitecturas bajo un protocolo fijo.

## Benchmarks y rendimiento

El único resultado declarado en el `model-index` es la perplejidad de validación sobre OpenWebText (bloque 512). El campo `verified` es `false`: son datos del autor, no verificados por Hugging Face.

| Metrica | Dataset | Valor | Detalle |
|---|---|---:|---|
| Perplejidad de validación (asentada) | OpenWebText, validation, bloque 512 | 53,12 | Media de las tres últimas evaluaciones de 500 pasos: 53,01 / 53,29 / 53,07 |
| Mejor perplejidad observada | OpenWebText, validation | 51,27 | Paso 31.000 |
| Perplejidad final | OpenWebText, validation | 53,07 | Último checkpoint |
| Perplejidad en el paso 3.000 | OpenWebText, validation | 123,59 | Frente a 140,61 del gemelo Gen 2 en el mismo paso (−12,1 %) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de razonamiento, código o matemáticas en la información disponible. Tampoco hay métricas de generación (BLEU, ROUGE) ni evaluaciones humanas.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir de 76,8 M de parámetros): ~307 MB en FP32, ~154 MB en FP16/BF16, ~77 MB en INT8 y ~38 MB en INT4, antes de activaciones. Con memoria constante en inferencia, el margen adicional es pequeño.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB libres. Funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100, pero no necesita ninguna de las grandes; también es viable en CPU e iGPU.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales e incluso en hardware integrado.
- Opciones de despliegue: no hay integración con vLLM, TGI, llama.cpp ni Ollama, porque la arquitectura no es Transformer. El despliegue requiere cargar el checkpoint con PyTorch usando el código propio del autor (`model_parf_multixi.py`).
- Throughput de entrenamiento declarado: 1,64 s/paso con lotes de 32 × 512 = 16.384 tokens, lo que equivale a ~9.990 tokens/s (cálculo derivado de los datos de la model card). El entrenamiento completo son ~14,8 horas en una única sesión de Colab (derivado: 32.500 pasos × 1,64 s).
- Latencia de inferencia: no disponible. No se publican mediciones de tokens/s ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La model card incluye una tabla completa de la escalera, toda ella entrenada con el mismo corpus, tokenizador, presupuesto (532.480.000 tokens) y lotes de validación. La columna «vs GPT-2» es el cociente de perplejidad respecto al brazo `gpt2-matched`.

| Modelo | Parametros | Perplejidad (bloque 512) | vs GPT-2 | Diferencia vs este modelo |
|---|---:|---:|---:|---:|
| **Este modelo** (Gen 3, L=2, sin campo de intercambio) | 76,8 M | **53,12** | 1,066× | — |
| `semsimula-ladder-live-owt-d384-l4-none` (Gen 3, L=4) | 76,8 M | 50,10 | 1,006× | +6,0 % mejor |
| `semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk` (Gen 3) | 77,4 M | 52,90 | 1,062× | +0,4 % mejor |
| `semsimula-ladder-live-owt-d384-l2-attention-potential` (Gen 3) | 77,4 M | 54,21 | 1,088× | −2,0 % peor |
| `semsimula-ladder-live-owt-d384-l2-none-norc` (Gen 3, solo conservativo) | 76,6 M | 57,76 | 1,160× | −8,0 % peor |
| `semsimula-ladder-owt-d384-l2-attention-potential-rglive` (Gen 2) | 77,4 M | 61,11 | 1,227× | −13,1 % peor |
| `semsimula-ladder-owt-d384-l2-attention` (Gen 2) | 77,4 M | 63,51 | 1,275× | −16,4 % peor |
| `semsimula-ladder-owt-d384-l2-none` (Gen 2, fuentes desconectadas) | 76,8 M | 66,98 | 1,345× | −20,7 % peor |
| `semsimula-ladder-owt-d384-l2-gpt2-matched` (Transformer GPT-2, L=8) | 33,7 M | 49,81 | 1,000× | +6,6 % mejor |

Lectura de la tabla: el mecanismo de registros aporta un 8,0 % frente al modelo solo conservativo a igual profundidad y convención de gradiente; la profundidad L=4 aporta un 5,7 % según el texto de la model card (6,0 % según la tabla) a igual mecanismo, con un coste de 1,9× por paso (3,12 frente a 1,64 s/paso). El GPT-2 emparejado en presupuesto, con menos de la mitad de parámetros, sigue siendo un 6,6 % mejor en perplejidad.

## Limitaciones y advertencias

- No es un modelo ajustado por instrucciones: no sigue instrucciones, no mantiene diálogo y no tiene formato de chat. Genera continuación de texto.
- Calidad limitada por tamaño: 76,8 M de parámetros y una perplejidad de 53,12 en OpenWebText implican una capacidad de modelado del lenguaje muy por debajo de modelos actuales; la tasa de alucinación en generación libre es alta y no se ha medido.
- Un único benchmark: solo hay perplejidad. No hay datos de razonamiento, código, matemáticas, sesgos ni robustez, por lo que no es posible caracterizar el comportamiento en tareas concretas.
- Idioma único: solo inglés. No hay evidencia de comportamiento en castellano ni en ningún otro idioma.
- Contexto corto: el modelo se entrenó y evaluó con bloques de 512 tokens; no se documenta la longitud máxima soportada ni el comportamiento más allá de ese bloque.
- Resultado no verificado: el `model-index` marca `verified: false`; las cifras proceden del autor y no han pasado una verificación independiente.
- Ecosistema incompatible: al no ser Transformer, no funciona con vLLM, TGI, llama.cpp, Ollama ni con las herramientas estándar de cuantización y servicio. Requiere el código propio del repositorio.
- Sección de causalidad incompleta en la información disponible: la model card menciona un monitor de fugas SCAF «CLEAN» en siete auditorías (desde 5k pasos), pero el texto disponible se corta y no permite detallar el protocolo ni los resultados completos.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero no incluye garantías de ningún tipo. Conviene revisar los términos exactos antes de integrarlo en un producto, y tener en cuenta que se trata de un artefacto de investigación sin mantenimiento declarado.
- Sesgos: no documentados. El corpus (OpenWebText) es una instantánea de enlaces de Reddit y arrastra los sesgos de esa distribución; el autor no publica ninguna evaluación al respecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none
- Colección Gen 3 (gradientes vivos, cFC, BAOAB): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Gemelo Gen 2 (fuentes desconectadas): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none
- Brazo L=4 con gradientes vivos: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l4-none
- Brazo `attention_potential` Gen 3: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential
- Brazo `attention_potential` con enrutado reforzado (rfqk): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk
- Brazo solo conservativo con gradientes vivos: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc
- Sonda Gen 2 con campo de intercambio vivo: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential-rglive
- Brazo de atención Gen 2: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- GPT-2 emparejado en presupuesto: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
- Listado de modelos de generación de texto de Hugging Face (mención en directorio): https://huggingface.co/models?pipeline_tag=text-generation&sort=created
- The Wider Lens, directorio de investigación y modelos (mención): https://thewiderlens.info/
