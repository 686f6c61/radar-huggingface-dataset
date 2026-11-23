# dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential-rglive

## Resumen

`semsimula-ladder-owt-d384-l2-attention-potential-rglive` es un modelo de lenguaje de investigación desarrollado por el usuario `dimitarpg13` dentro de la familia SemSimula, un programa de estudio por ablación de mecanismos (ladder study) con pre-registro de hipótesis. No es un transformer ni un modelo de atención al uso: es un modelo de lenguaje conservativo basado en un potencial escalar y mecánica lagrangiana, con atención libre de softmax y un campo de intercambio explícito. El modelo tiene 384 dimensiones de ocultación y 2 capas, se entrena sobre OpenWebText y su propósito es experimental, no comercial.

Este checkpoint concreto es una sonda de generación 2 que aísla un único cambio respecto a su modelo padre: hace "vivo" (live) el gradiente del campo de intercambio, manteniendo idéntico el pase hacia delante. El resultado es una mejora del 24,5 % en perplejidad de validación (de 80,90 a 61,11), lo que demuestra que el problema del padre era una ruta de gradiente cortada (gradient starvation) y no la naturaleza conservativa del campo. Es relevante ahora porque documenta un hallazgo metodológico reproducible sobre cómo el detach de tensores en modelos energy-based puede sabotear el entrenamiento sin alterar la inferencia.

El modelo es de tamaño muy reducido (repo de 0,6 GB), solo entiende inglés, se distribuye en formato PyTorch y su licencia es CC-BY-4.0. No está pensado para producción: es una pieza de evidencia dentro de un estudio de ablación más amplio que compara variantes de campo conservativo, no conservativo y sin campo de intercambio bajo el mismo presupuesto de tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (non-transformer, attention-free) con potencial escalar, campo de intercambio y formulación lagrangiana; integrador BAOAB, espacio de Fock y registros virtuales (parflm) |
| Parámetros totales | no disponible (dimensión de ocultación d=384, 2 capas) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluado a bloques de 512 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería `pytorch`); safetensors no confirmado |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje conservativo en el que la dinámica de las representaciones se rige por un potencial escalar y una fuerza que debe ser un gradiente en las coordenadas del propio token. Para preservar esa propiedad, el código del modelo padre mantenía fijos (detach) los pesos de atención y los estados fuente, de modo que la fuerza no podía enviar gradiente a ningún estado oculto. Este checkpoint reescribe la misma fuerza de forma explícita sobre tensores vivos (`relax_grad_path='live'` en `model_parf_multixi.py`): el valor del pase hacia delante es bit a bit idéntico, pero el pase hacia atrás alcanza ahora cada token a través de queries, keys y values.

El entrenamiento se realiza sobre OpenWebText con un presupuesto de tokens emparejado entre brazos del estudio (matched-token-budget), e incluye mecanismos como el canal inverso (reverse-channel), compuertas de potencial y regularización de espacio de Fock. El régimen de entrenamiento muestra 0 avisos de watchdog y 0 picos, con solo un 0,8 % de pasos que alcanzan el recorte de gradiente (5 de 649 pasos registrados, norma máxima 1,12), frente al 29,2 % del brazo no conservativo. El monitor de fugas SCAF se mantiene limpio en las siete auditorías realizadas entre los pasos 5k y 32,5k.

## Capacidades

- Generación de texto autoregresiva en inglés, evaluada mediante perplejidad sobre OpenWebText.
- Modelado de lenguaje con dinámica conservativa: la evolución de estados se interpreta como un sistema físico con inercia y potencial escalar.
- Razonamiento multi-paso implícito mediante integración temporal (BAOAB) y registros virtuales en espacio de Fock.
- Canal inverso (reverse-channel) con compuerta efectiva medida de 0,034.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de modos de pensamiento explícitos.
- No dispone de visión, audio ni capacidades multimodales.
- Multilingüismo limitado al inglés.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: sirve como punto de comparación controlado para estudiar si la conservatividad del campo perjudica o favorece el modelado del lenguaje cuando la ruta de gradiente está correctamente abierta.
- Auditoría de rutas de gradiente en modelos energy-based: el checkpoint y su script de verificación (`gradient_path_check_output.txt`) permiten reproducir el diagnóstico de gradient starvation en modelos con fuerzas derivadas de potenciales.
- Estudio de ablación reproducible: al compartir arquitectura y tokens con su padre y con los brazos `attention`, `no-exchange` y `gpt2-matched`, permite aislar el efecto de una sola variable sobre la perplejidad.
- Docencia y divulgación sobre mecánica lagrangiana aplicada a redes neuronales: el modelo ilustra de forma concreta cómo se formula una fuerza conservativa y cómo se integra numéricamente con BAOAB.
- Validación de metodología de pre-registro: el modelo documenta predicciones congeladas antes del entrenamiento y su comparación con el resultado final, útil para cursos de metodología científica en machine learning.
- Reproducción de experimentos a pequeña escala: con un repo de 0,6 GB y evaluación a bloques de 512, es viable ejecutar réplicas en una sola GPU de consumo para verificar los hallazgos del estudio.

## Benchmarks y rendimiento

| Modelo | Gradiente del campo de intercambio | Perplejidad de validación (settled) | Ratio vs GPT-2 |
|---|---|---:|---:|
| `attention_potential` (padre) | detached | 80,90 | 1,624× |
| **este modelo (rglive)** | **live** | **61,11** | **1,227×** |
| `attention` (campo no conservativo) | live | 63,51 | 1,275× |
| `no-exchange` (sin campo de intercambio) | no aplica | 66,98 | 1,345× |
| `gpt2-matched` | no aplica | 49,81 | 1,000× |

Datos declarados por el autor, no verificados de forma independiente. La perplejidad de 61,11 corresponde a la media de las tres últimas evaluaciones de 500 pasos a bloque 512. Mejor valor registrado: 59,09 en el paso 31.000; valor final: 61,06. En el paso 3.000 la sonda marcaba 133,74 frente a 148,99 del padre (−10,2 %). El pre-registro del run completo fijaba un rango de 63–72 con punto 67; el resultado real quedó por debajo del rango previsto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con un repo de 0,6 GB y d=384 con 2 capas, la huella en FP32 debería situarse en el orden de pocos GB, pero el autor no publica la cifra de parámetros.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 8 GB de VRAM debería poder cargarlo.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090), aunque no está confirmado por el autor.
- Opciones de despliegue: al ser un modelo de investigación con código propio (`model_parf_multixi.py`) y dependencia de PyTorch, no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El despliegue requiere el código del repositorio y los notebooks de reproducción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (OWT val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `semsimula-ladder-owt-d384-l2-attention-potential-rglive` (este) | no disponible (d=384, L=2) | no disponible (eval. a 512) | 61,11 | CC-BY-4.0 | Hugging Face |
| `semsimula-ladder-owt-d384-l2-attention-potential` (padre) | no disponible (d=384, L=2) | no disponible (eval. a 512) | 80,90 | CC-BY-4.0 | Hugging Face |
| `semsimula-ladder-owt-d384-l2-attention` | no disponible (d=384, L=2) | no disponible (eval. a 512) | 63,51 | CC-BY-4.0 | Hugging Face |
| `semsimula-ladder-owt-d384-l2-gpt2-matched` | no disponible (d=384, L=2) | no disponible (eval. a 512) | 49,81 | CC-BY-4.0 | Hugging Face |

No se dispone de comparación con modelos de propósito general de tamaño equivalente (por ejemplo, GPT-2 small) más allá del ratio de perplejidad frente al brazo `gpt2-matched` que reporta el autor.

## Limitaciones y advertencias

- Modelo exclusivamente de investigación: no está diseñado ni validado para uso en producción.
- Solo inglés; no se documenta soporte multilingüe.
- Tamaño muy reducido (d=384, 2 capas) y perplejidad de 61,11, muy por encima del brazo `gpt2-matched` (49,81): la calidad de generación es limitada.
- Riesgo elevado de alucinación y de texto incoherente en usos abiertos, dado el tamaño y el dominio de entrenamiento (OpenWebText).
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el modelo no ha sido evaluado para tales fines.
- El resultado de perplejidad está declarado por el autor y marcado como no verificado (`verified: false`).
- El modelo depende de código propio no estándar (`model_parf_multixi.py`), lo que complica su integración en ecosistemas convencionales.
- Las lecturas de sondas (inercia, deflexión geodésica, compuerta del canal inverso) solo son comparables dentro de la misma familia y no con otros brazos con potenciales distintos.
- El autor advierte que este checkpoint no es un brazo del ladder sino una sonda de generación 2; su uso debe entenderse en ese contexto experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential-rglive
- Modelo padre (`attention_potential`): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential
- Contraparte de generación 3 (`everything-live`): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential
- Brazo no conservativo (`attention`): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- Brazo sin campo de intercambio (`no-exchange`): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none
- Brazo de control GPT-2 (`gpt2-matched`): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Repositorio del paper y notebooks: https://github.com/dimitarpg13/semsimula-paper
- Verificación de ruta de gradiente: https://github.com/dimitarpg13/semsimula-paper/blob/main/notebooks/conservative_arch/scaleup/results/cfc_baoab_owt_xi5long_topk16_dt32da16_mh4_aniso_dcvt5x8_vtjoint_cgqk_L2probe_ob_untied_wsd_e5c_plgate_rep0.05_fockreg0.005_g0.1_baoab_cfc_lowrank_idt4_lr0p0012_attnpot/gradient_path_check_output.txt
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
