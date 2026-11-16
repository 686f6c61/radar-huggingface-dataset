# DuoNeural/RMSN-SFT-d2048-seed4-512M

## Resumen

RMSN-SFT-d2048-seed4-512M es un modelo de lenguaje desarrollado por DuoNeural Lab, publicado en noviembre de 2026 bajo licencia MIT. Se trata de un modelo de la familia RMSN (probablemente una variante de arquitectura propia del laboratorio, aunque la model card no la describe en detalle), con una dimension de modelo D=2048 y 16 capas (L=16), entrenado mediante SFT durante 20.000 pasos sobre la semilla 4. El sufijo "512M" del nombre sugiere un tamano aproximado de 512 millones de parametros, coherente con el tamano del repositorio (2,6 GB).

El modelo esta pensado como una checkpoint de investigacion dentro de una serie de experimentos de DuoNeural, no como un producto listo para produccion. La model card es extremadamente escueta: solo indica la configuracion (D=2048, L=16, seed4, SFT 20k steps) y dos valores de perplejidad: 8,79 en un corpus CoT (chain-of-thought) y 1616,30 en un corpus tipo Wiki. Esta discrepancia tan acusada entre ambas metricas es la senal tecnica mas relevante del modelo.

Su interes actual es limitado para el publico general, pero puede resultar util para investigadores que quieran reproducir o comparar experimentos de la serie RMSN de DuoNeural, o estudiar el efecto del SFT sobre un modelo base pequeno con datos de razonamiento. No hay informacion publica sobre datos de entrenamiento, tokenizador, contexto maximo ni evaluaciones estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (variante no documentada; transformer segun nomenclatura D/L, no confirmado) |
| Parametros totales | ~512M (inferido del nombre y del tamano del repo, no confirmado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en el repo; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 2,6 GB; no se detalla safetensors, GGUF, etc.) |

## Arquitectura y entrenamiento

La model card solo aporta la configuracion nominal: D=2048 (dimension del modelo) y L=16 (numero de capas), con semilla 4. El acronimo RMSN no viene desarrollado en la informacion disponible, por lo que no es posible confirmar si se trata de un transformer convencional, una variante con normalizacion RMS o una arquitectura hibrida propia. El sufijo "SFT" y los "20k steps" indican que el checkpoint publicado corresponde a una fase de ajuste supervisado (supervised fine-tuning) sobre un modelo base previo, presumiblemente entrenado por el mismo laboratorio.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El unico dato cuantitativo de entrenamiento son las perplejidades reportadas: 8,79 sobre un corpus CoT y 1616,30 sobre un corpus Wiki, lo que sugiere un ajuste muy fuerte a datos de razonamiento y un comportamiento pobre fuera de ese dominio.

## Capacidades

- Generacion de texto autoregresiva (asumido por tratarse de un modelo de lenguaje, no verificado en la model card).
- Razonamiento tipo chain-of-thought: la perplejidad de 8,79 en el corpus CoT indica que el modelo esta razonablemente ajustado a ese formato.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste a CoT podria facilitarlo, pero no hay evidencia publicada.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Investigacion sobre ajuste supervisado: el checkpoint permite reproducir o comparar el efecto de 20k pasos de SFT sobre un modelo base de la serie RMSN, con semilla fija (seed4) para control de variabilidad.
- Estudio de sobreajuste a dominios de razonamiento: la brecha entre PPL CoT (8,79) y PPL Wiki (1616,30) lo convierte en un caso de analisis util para medir como el SFT sobre datos de CoT degrada el modelado de lenguaje general.
- Generacion de cadenas de razonamiento en entornos controlados: puede emplearse para producir trazas CoT en experimentos academicos, siempre que se valide la calidad de las salidas.
- Baseline en experimentos de escalado: al ser un modelo pequeno (~512M) con configuracion conocida, sirve como punto de comparacion frente a modelos mayores de la misma familia.
- Pruebas de infraestructura de inferencia: su tamano reducido permite desplegarlo en una sola GPU para validar pipelines de evaluacion o servidores de inferencia antes de pasar a modelos mayores.
- Docencia y demos de laboratorio: util para ilustrar el impacto del SFT y de la semilla en el rendimiento de modelos pequenos, sin coste elevado de computo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento son las perplejidades reportadas por el autor:

| Metrica | Valor |
|---|---|
| Perplejidad corpus CoT | 8,792935376008245 |
| Perplejidad corpus Wiki | 1616,2995122963596 |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, ~1 GB para los pesos de un modelo de ~512M de parametros; en fp32, ~2 GB. El repo ocupa 2,6 GB, lo que sugiere pesos en fp32 o fp16 con ficheros adicionales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPUs de gama baja con 4-8 GB de VRAM.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al no confirmarse el formato de pesos, la integracion requeriria conversion previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RMSN-SFT-d2048-seed4-512M | ~512M (inferido) | no disponible | MIT | Hugging Face (0 descargas) |
| Qwen2.5-0.5B | 0,49B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado |
| SmolLM2-360M | 0,36B | 8.192 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Gemma 2 2B | 2,6B | 8.192 tokens | Gemma license | Hugging Face |

La comparacion con modelos de la misma escala es desfavorable en informacion publica: frente a Qwen2.5-0.5B o SmolLM2-360M, el modelo de DuoNeural no documenta contexto, idiomas, benchmarks ni formato de pesos, y su perplejidad en dominio Wiki (1616,30) es muy superior a la que cabria esperar de un modelo pequeno bien entrenado. La licencia MIT es, en cambio, mas permisiva que la de Gemma.

## Limitaciones y advertencias

- Model card practicamente vacia: sin datos de entrenamiento, tokenizador, contexto ni evaluaciones, lo que impide una evaluacion rigurosa.
- Perplejidad en dominio Wiki muy elevada (1616,30), indicativa de un modelado de lenguaje general pobre y de un posible sobreajuste al corpus CoT.
- Riesgo alto de alucinacion fuera del dominio de razonamiento para el que fue ajustado.
- Idiomas soportados no documentados; no se puede asumir un buen rendimiento en castellano.
- Longitud de contexto desconocida; no apto para tareas que requieran ventanas largas sin validacion previa.
- Sin senales de adopcion (0 descargas, 0 likes) ni mantenimiento posterior a la publicacion.
- Licencia MIT permite uso comercial, pero la ausencia de documentacion traslada todo el riesgo de validacion al integrador.
- No recomendado para produccion sin una evaluacion propia exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-SFT-d2048-seed4-512M
- Repositorio o paper de la arquitectura RMSN: no disponible
- Blog o documentacion de DuoNeural Lab: no disponible
- Demos: no disponible
