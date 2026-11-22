# DuoNeural/CRSN-T-ext-50k

## Resumen

CRSN-T-ext-50k es un checkpoint de investigación publicado por DuoNeural AI Laboratory bajo el identificador CRSN-T-ext (Continuity-Regularized Sheaf Network, variante extendida). Se trata de un modelo experimental entrenado desde cero sobre el dataset extendido del laboratorio durante 50.000 pasos, con un total de 209.715.200 tokens procesados. El interés del artefacto no reside en su calidad final, sino en la demostración de que la arquitectura CRSN —basada en haces (sheaves) con regularización de continuidad— puede entrenarse en hardware de consumo (una CPU AMD Ryzen) durante aproximadamente 130 horas.

El checkpoint ocupa unos 97 MB y el repositorio completo 0,1 GB, lo que sitúa el modelo en la franja de los modelos pequeños (del orden de decenas de millones de parámetros, aunque el autor no declara el recuento exacto). La mejor pérdida de validación alcanzada fue 2,5900 (perplejidad 13,33) en el paso ~24.400; a partir de ahí el entrenamiento se estabilizó sin mejorar hasta las 50.000 iteraciones, con validaciones posteriores entre perplejidad 14,8 y 18,1.

La relevancia es acotada y de carácter metodológico: no hay model card con idiomas, licencia ni pipeline declarados, no se publican benchmarks estándar y el artefacto se distribuye como checkpoint `.pt` de PyTorch, no como pesos en safetensors o GGUF. Debe tratarse como material de investigación reproducible, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CRSN-T-ext (Continuity-Regularized Sheaf Network, variante extendida); familia distinta de un transformer clásico, basada en topología de haces con regularización de continuidad |
| Parámetros totales | no disponible (checkpoint de ~97 MB; recuento no declarado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se distribuye checkpoint `.pt`; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (`crsn_t_best.pt`) |
| Tokens de entrenamiento | 209.715.200 |
| Pasos de entrenamiento | 50.000 |
| Mejor val loss / perplejidad | 2,5900 / 13,33 (paso ~24.400) |
| Hardware de entrenamiento | CPU AMD Ryzen (nodo node-0, red local kilonova) |
| Velocidad de entrenamiento | 446,85 tok/s |
| Tiempo total de entrenamiento | ~469.314 s (~130 horas) |

## Arquitectura y entrenamiento

La arquitectura CRSN (Continuity-Regularized Sheaf Network) se aparta del transformer convencional: el autor la describe como una red basada en haces (sheaves) con una regularización de continuidad que impone transiciones suaves en la topología del haz. La variante `ext` corresponde al entrenamiento sobre el dataset extendido del laboratorio. No se especifican en la información disponible el número de capas, dimensión oculta, cabezas de atención ni el mecanismo exacto de agregación entre haces, por lo que no es posible reconstruir la arquitectura a partir de la model card.

El entrenamiento se realizó íntegramente en CPU (AMD Ryzen, nodo node-0 de la red local kilonova) durante 50.000 pasos y 209.715.200 tokens, a una media de 446,85 tok/s y ~130 horas de tiempo de pared. La ejecución se reanudó desde un checkpoint previo (con `best_val_loss=2.5900` restaurado) y, tras la reanudación, el modelo se estabilizó: las validaciones posteriores oscilaron entre perplejidad 14,8 y 18,1 y la pérdida final en el paso 50.000 fue ~2,84 (perplejidad ~17,2). El autor indica que no se observó sobreajuste, sino una meseta, y documenta que un proceso duplicado fue terminado a mitad de ejecución (había reducido el rendimiento de ~640 a ~440 tok/s). No se declaran datos sobre composición del dataset, uso de RLHF/DPO ni técnicas de decodificación especulativa.

## Capacidades

- Generación de texto autoregresiva a nivel de token: es la función implícita de un modelo de lenguaje entrenado con pérdida de entropía cruzada, aunque no se documentan evaluaciones cualitativas.
- Modelado de lenguaje y ajuste de distribución sobre el dataset extendido de DuoNeural: el objetivo declarado es la reducción de perplejidad en validación.
- No hay evidencia publicada de soporte de tool calling ni function calling.
- No hay evidencia publicada de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- El checkpoint es reanudable: incluye el estado necesario para continuar el entrenamiento desde el paso ~24.400, lo que lo hace útil como base para experimentación con la arquitectura CRSN.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el checkpoint permite reproducir y auditar la familia CRSN, comparar su dinámica de entrenamiento con la de un transformer de tamaño similar y estudiar el efecto de la regularización de continuidad sobre la perplejidad.
- Reproducibilidad de entrenamiento en CPU: con 446,85 tok/s y ~130 horas de tiempo de pared documentadas, sirve como referencia para validar que un pipeline CRSN puede ejecutarse en hardware de consumo sin GPU.
- Punto de partida para fine-tuning experimental: al ser un checkpoint `.pt` de ~97 MB, cabe en memoria de cualquier máquina y permite iterar sobre variantes del dataset extendido sin coste de infraestructura.
- Estudio de curvas de aprendizaje y mesetas: la model card documenta el pico en el paso ~24.400 y la estabilización posterior, lo que lo convierte en un caso útil para analizar cuándo un modelo deja de mejorar y cómo detectar sobreajuste frente a meseta.
- Docencia y divulgación: ejemplo realista de entrenamiento de un modelo desde cero en CPU, con registro completo de validaciones (`crsn_t_ext.log`) y métricas de rendimiento por paso.
- Base para comparativas de eficiencia: permite medir tok/s, perplejidad y coste energético en CPU frente a modelos transformer pequeños entrenados en GPU, siempre que se disponga de un corpus equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de entrenamiento y validación internas:

| Métrica | Valor |
|---|---|
| Mejor val loss | 2,5900 |
| Mejor perplejidad de validación | 13,33 |
| Paso del mejor checkpoint | ~24.400 |
| Val loss final (paso 50.000) | ~2,84 |
| Perplejidad final | ~17,2 |
| Rango de perplejidad tras reanudar | 14,8 – 18,1 |
| Velocidad de entrenamiento | 446,85 tok/s |
| Tokens totales | 209.715.200 |

No hay datos de MMLU, HumanEval, GSM8K ni de comparación con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el checkpoint pesa ~97 MB, por lo que en fp32 cabría en menos de 1 GB de memoria, pero se desconoce el grafo de cómputo y el consumo real de activaciones.
- GPU recomendadas: no disponible; el autor solo documenta entrenamiento en CPU AMD Ryzen.
- Compatibilidad con GPU de consumo: presumiblemente sí por tamaño (RTX 3060/4060 en adelante), pero no está verificado ni documentado.
- Opciones de despliegue: no disponible. No hay pesos en GGUF, safetensors ni integración con vLLM, llama.cpp, Ollama o TGI; solo se ofrece el checkpoint `.pt` para cargar con PyTorch.
- Latencia y throughput: solo se conoce la velocidad de entrenamiento (446,85 tok/s en CPU Ryzen); no hay mediciones de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma familia CRSN ni resultados de benchmarks que permitan situar este checkpoint frente a alternativas de tamaño similar. Cualquier comparación numérica con transformers pequeños (por ejemplo, GPT-2 small o modelos de ~100 MB) requeriría evaluar ambos sobre el mismo corpus, algo que no se ha publicado.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican términos de uso, lo que impide determinar si el uso comercial está permitido. Tratarlo como no apto para producción hasta que el autor lo aclare.
- Idiomas no declarados: no hay garantía de soporte de castellano, inglés ni de ningún otro idioma.
- Ausencia de benchmarks estándar: no hay evidencia de calidad en tareas de razonamiento, código o matemáticas; la única métrica es la perplejidad interna.
- Riesgo de alucinación: no evaluado ni documentado.
- Sesgos: no evaluados; el dataset de entrenamiento no se describe en composición ni procedencia.
- Contexto: longitud de contexto desconocida, lo que impide planificar casos de uso con ventanas largas.
- Arquitectura no estándar: al no ser un transformer convencional, las herramientas habituales (vLLM, llama.cpp, Ollama) no lo soportarán sin adaptación; requiere cargar el checkpoint con código propio de CRSN.
- Modelo pequeño y con meseta temprana: el mejor resultado se alcanzó en el paso ~24.400 y las 25.600 iteraciones restantes no mejoraron la pérdida, lo que sugiere capacidad o datos insuficientes para seguir aprendiendo.
- Repositorio sin pipeline ni descargas: 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni soporte.
- Artefacto de investigación: no debe presentarse como un modelo de lenguaje listo para uso general.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/CRSN-T-ext-50k
- Model card del autor (incluida en el repositorio de Hugging Face): https://huggingface.co/DuoNeural/CRSN-T-ext-50k
- Repositorio o paper de la arquitectura CRSN: no disponible
- Blog o demo de DuoNeural AI Laboratory: no disponible
