# DuoNeural/RMSN-193M-Base

## Resumen

RMSN-193M-Base es un modelo de lenguaje de tipo base (no instruido) publicado por DuoNeural AI Laboratory, un laboratorio independiente de investigación en IA. El modelo se presenta bajo el nombre de Resonant Metriplectic Sheaf Network (RMSN), una arquitectura de secuencia neuronal de tipo Port-Hamiltonian fundamentada en termodinámica de no equilibrio, que combina dinámica hamiltoniana conservativa (corchete de Poisson) con disipación termodinámicamente consistente (corchete de Morrison). Su propuesta diferencial es que la estabilidad de Lyapunov sea un invariante estructural del operador directo, en lugar de un regularizador añadido durante el entrenamiento.

El checkpoint se etiqueta como el "mejor baseline de 193M" de la familia, con una perplejidad de validación de 69,5 y un exponente de Lyapunov máximo de -0,1147. Aunque el nombre comercial indica 193M, el recuento real de parámetros en los pesos safetensors es de 243.732.144 (unos 243,7M), discrepancia que conviene tener en cuenta al planificar el despliegue. El contexto es muy limitado (512 tokens) y el vocabulario es de 49.152 entradas mediante el tokenizador cosmo2.

El modelo está entrenado únicamente sobre WikiText-103 durante 100.000 pasos (204,8M tokens) y solo declara soporte de inglés. Su relevancia es fundamentalmente de investigación: explora una línea arquitectónica poco convencional (geometría de haces celulares, escaneo paralelo metripléctico y memoria fraccionaria de Caputo) más que competir en capacidades generales de generación. No se han publicado resultados de benchmarks estándar en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), Port-Hamiltonian |
| Parametros totales | 243.732.144 (pesos safetensors); la model card declara ~193M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo pesos PyTorch en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors y PyTorch (.pt), segun la model card |
| Vocabulario | 49.152 (tokenizador cosmo2) |
| Dimension / profundidad / slots | 1024 / 16 / 64 |
| Perplejidad de validacion | 69,5 |
| Exponente de Lyapunov maximo | -0,1147 |

## Arquitectura y entrenamiento

La arquitectura RMSN se define mediante la ecuacion de evolución \(\dot{f} = \{f, H\} + [f, S]\), donde el corchete de Poisson modela la dinámica conservativa hamiltoniana y el corchete de Morrison introduce disipación consistente con la segunda ley de la termodinámica. Según la model card, la estabilidad de Lyapunov es un invariante estructural del operador directo. Los componentes declarados incluyen: CliffordStalkBundle (representaciones de tokens como multivectores \(\mathcal{C}\ell_{3,0}\) sobre haces celulares), ParallelMetriplecticScan (recurrencia con escaneo paralelo de coste \(O(\log T)\)), FractionalCaputoBank (memoria de ley de potencias de orden fraccionario aprendida, con \(\alpha \in (0,1)\)), CausalTrophicGlobalWorkspace (enrutamiento competitivo winner-take-most con 64 slots) y Noether Stress-Energy Readout (invariantes conservados hacia el espacio de logits).

El entrenamiento se realizó sobre WikiText-103 durante 100.000 pasos, lo que equivale a 204,8M tokens procesados. No se documentan fases de RLHF, DPO ni ajuste por instrucciones; se trata de un checkpoint base. La model card describe fenómenos de "cascada de Lyapunov" durante el preentrenamiento, con un umbral de percolación estimado entre 155M y 159M de parámetros, por encima del cual aparece una meseta caótica sostenida. También afirma una ley de gravedad de atractor profundo y que el valor final de \(\lambda\) depende del historial completo de cascadas y no solo de la arquitectura.

## Capacidades

- Generación de texto autoregresiva en inglés, orientada a modelado de lenguaje (no a instrucciones).
- Razonamiento y matemáticas: no se documentan capacidades específicas ni evaluaciones.
- Código: no se documenta soporte ni evaluación en tareas de programación.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés declarado.
- Capacidades especiales: memoria fraccionaria de orden aprendido, escaneo paralelo metripléctico y estabilidad de Lyapunov estructural; no se declaran modos de pensamiento, visión ni audio.
- Integración: requiere cargar la definición de arquitectura desde el repositorio de GitHub (`rmsn_core.py`) y el tokenizador `HuggingFaceTB/cosmo2-tokenizer`; no es un modelo cargable directamente con `AutoModelForCausalLM`.

## Casos de uso

- Investigación en arquitecturas físicamente informadas: el modelo sirve como referencia reproducible para estudiar dinámicas Port-Hamiltonian y metriplécticas en secuencias, cargando los pesos junto a `rmsn_core.py` y el tokenizador cosmo2.
- Estudio de estabilidad de Lyapunov en redes neuronales: permite analizar el exponente \(\lambda_{\max}\) y los eventos de cascada descritos en la model card sobre un checkpoint concreto.
- Experimentos de memoria de largo alcance con contexto corto: el FractionalCaputoBank puede evaluarse en tareas de modelado de lenguaje con ventanas de 512 tokens, comparando frente a baselines transformer de tamaño similar.
- Reproducción de resultados de perplejidad: útil para replicar la perplejidad de validación de 69,5 sobre WikiText-103 y contrastar con otras arquitecturas de ~200M de parámetros.
- Base para fine-tuning académico: al ser un checkpoint base con licencia MIT, puede ajustarse en dominios específicos en inglés para estudiar cómo se preservan (o no) los invariantes estructurales tras el ajuste.
- Docencia y divulgación: ejemplo práctico de arquitectura no convencional (haces celulares, corchetes de Poisson y Morrison) para cursos avanzados de aprendizaje profundo.
- Prototipado de generación de texto en inglés con requisitos de licencia permisiva: siempre que el contexto de 512 tokens y la calidad limitada sean aceptables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas internas de validación:

| Metrica | Valor |
|---|---|
| Perplejidad de validacion | 69,5 |
| Exponente de Lyapunov maximo (\(\lambda_{\max}\)) | -0,1147 |
| Tokens de entrenamiento | 204,8M (100.000 pasos) |

No se proporcionan cifras de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp32, los 243,7M de parámetros ocupan aproximadamente 0,97 GB; en fp16, unos 0,49 GB; en int8, unos 0,24 GB. A ello hay que sumar el estado de la recurrencia, los 64 slots del global workspace y las estructuras de haces, cuyo consumo no está documentado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería bastar para fp32 a 512 tokens; una RTX 3060, RTX 4090, A100 o H100 son opciones válidas, aunque no se han publicado mediciones específicas.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con 4 GB o más, dado el tamaño del checkpoint (repo de 1,7 GB).
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La model card indica cargar los pesos con `torch.load` y usar la definición de arquitectura del repositorio de GitHub; existe un harness de inferencia en `generate.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables publicados para este modelo. A continuación se comparan únicamente especificaciones objetivas con alternativas de tamaño similar ampliamente conocidas:

| Modelo | Parametros | Contexto | Licencia | Formato / ecosistema |
|---|---|---|---|---|
| RMSN-193M-Base | 243,7M (declara ~193M) | 512 | MIT | safetensors / .pt, requiere código propio |
| GPT-2 (124M) | 124M | 1024 | MIT | safetensors, transformers nativo |
| GPT-2 medium (355M) | 355M | 1024 | MIT | safetensors, transformers nativo |
| Pythia-410M | 410M | 2048 | Apache 2.0 | safetensors, transformers nativo |

La comparación de rendimiento (perplejidad, benchmarks) no está disponible para RMSN-193M-Base frente a estos modelos, por lo que no puede establecerse una conclusión cuantitativa.

## Limitaciones y advertencias

- Contexto muy corto (512 tokens), insuficiente para la mayoría de aplicaciones de producción con conversaciones o documentos largos.
- Entrenamiento limitado a WikiText-103 (204,8M tokens), lo que restringe severamente la cobertura lingüística y de dominios; es probable un sobreajuste al estilo y vocabulario de ese corpus.
- Solo inglés declarado; no hay soporte multilingüe documentado.
- Discrepancia entre el nombre (193M) y los parámetros reales (243,7M): conviene dimensionar el hardware con el dato real.
- No es un modelo instruido: no sigue instrucciones de forma fiable ni se ha ajustado con RLHF o DPO.
- Riesgo elevado de alucinación y de generación incoherente fuera de distribuciones similares a WikiText-103.
- No se documentan sesgos específicos, pero un corpus único de entrenamiento implica sesgos de dominio y de registro no evaluados.
- La licencia MIT permite uso comercial, pero la ausencia de benchmarks y de un harness estándar (vLLM, llama.cpp) complica su integración en producción.
- Requiere código de arquitectura personalizado (`rmsn_core.py`) y un tokenizador externo (`HuggingFaceTB/cosmo2-tokenizer`); no es compatible con `AutoModelForCausalLM` sin trabajo adicional.
- Las afirmaciones sobre cascadas de Lyapunov y leyes empíricas provienen de la model card del autor y no se han verificado de forma independiente en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-193M-Base
- Organización en Hugging Face: https://huggingface.co/DuoNeural
- Repositorio GitHub: https://github.com/DuoNeural/RMSN
- Harness de inferencia: https://github.com/DuoNeural/RMSN/blob/main/generate.py
- Sitio web del laboratorio: https://duoneural.com/
- Tokenizador cosmo2: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Licencia MIT: https://opensource.org/licenses/MIT
