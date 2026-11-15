# HandsomeHusky/IdentiDeform-prior

## Resumen

IdentiDeform-prior es un modelo de visión por computador para la identificación de materiales de objetos deformables a partir de vídeo. Desarrollado por el usuario HandsomeHusky, no es un modelo de lenguaje generativo, sino un *prior* de vídeo entrenado para predecir, a partir de una secuencia corta de tres vistas sincronizadas de un objeto siendo presionado, dejado caer, doblado, cizallado, estirado o golpeado, la clase constitutiva del material (`jelly`, `metal` o `plasticine`) y sus parámetros materiales en unidades del simulador: rigidez específica E/ρ, coeficiente de Poisson ν, densidad ρ y tensión de fluencia específica σ_y/ρ.

El modelo se construye sobre un codificador de vídeo V-JEPA 2 ViT-L congelado (`facebook/vjepa2-vitl-fpc64-256`) y añade un ensamblado de nueve cabezas pequeñas de 2,85 M de parámetros cada una. Su relevancia radica en que proporciona una inicialización informada para procesos de *simulation-in-the-loop refinement* (identificación de sistemas) y gemelos digitales en simuladores basados en Material Point Method (MPM), reduciendo el número de llamadas al simulador necesarias para converger.

El modelo se distribuye con licencia MIT, pensado para investigación en inferencia de propiedades físicas a partir de vídeo. No está diseñado para certificación de materiales en entornos de seguridad crítica ni para obtener valores SI del mundo real sin calibración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | V-JEPA 2 ViT-L congelado + ensamblado de 9 cabezas (view–time transformer, visual-field bridge, Gaussian parameter head, class head) |
| Parámetros totales | Cabezas: 9 × 2,85 M (25,65 M en total); codificador V-JEPA 2 ViT-L no incluido en el repo |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 64 fotogramas por vista, 3 vistas sincronizadas, 224×224 px |
| Tipos de cuantización | No disponible (pesos en fp32 para las cabezas; codificador en bf16 en GPU) |
| Idiomas soportados | No aplica (modelo de vídeo, no de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32 state dicts, 11,4 MB por cabeza) |

## Arquitectura y entrenamiento

La arquitectura combina un codificador de vídeo V-JEPA 2 ViT-L congelado con un ensamblado de nueve cabezas ligeras. Cada vista se procesa con *tubelet* de tamaño 2, generando 32 × 14×14 × 1024 tokens por vista. Las cabezas son variantes `fieldbridge.CachedFieldModel` (variantes B/C/D × semillas 17/29/43) que incluyen un transformer vista–tiempo, un puente de campo visual, una cabeza gaussiana de parámetros y una cabeza de clasificación. La variante B no usa supervisión de campo; C usa supervisión de campo realimentada en la cabeza; D usa supervisión de campo como tarea auxiliar.

El entrenamiento se realizó exclusivamente sobre datos simulados del dataset IdentiDeform V2 (MPM): 87/10/10 objetos (train/val/test, sin solapamiento de objetos entre particiones), 1.955/283/300 simulaciones, 6 acciones (press, drop, bend, shear, stretch, tap-and-hold), 3 clases constitutivas, 3 vistas renderizadas y 128 fotogramas por vista. Se usó AdamW (lr 3e-4, wd 0,05), bf16, batch 8, pérdida smooth-L1 + Gaussian NLL (peso 0,05) + entropía cruzada de clase (peso 0,1), con *early stopping* sobre MAE estandarizado de validación. Los objetivos se estandarizaron solo con la partición de entrenamiento.

## Capacidades

- Predicción de clase constitutiva de material: `jelly` (elástico), `metal` (elasto-plástico) y `plasticine`.
- Predicción de parámetros materiales: rigidez específica E/ρ, coeficiente de Poisson ν, densidad ρ y tensión de fluencia específica σ_y/ρ (σ_y indefinida para `jelly`).
- Estimación de incertidumbre predictiva por parámetro mediante ensamblado (σ_total = sqrt(media de exp(logvar) + varianza entre cabezas)).
- Procesamiento de vídeo multi-vista: 3 vistas sincronizadas, 64 fotogramas uniformemente submuestreados por vista, 224×224 px.
- Clasificación por voto mayoritario del ensamblado (empates resueltos al id más bajo).
- Calibración opcional de incertidumbre mediante temperaturas por objetivo ajustadas en validación (0,88–1,00).
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Inicialización de identificación de sistemas (system identification): el modelo proporciona la clase y los parámetros predichos como punto de partida para el refinamiento en bucle con simulador MPM, reduciendo el número de llamadas al simulador necesarias para alcanzar un error objetivo (según la model card, equivale a 10–12 simulaciones partiendo de la media de clase privilegiada).
- Construcción de gemelos digitales: los parámetros predichos y su incertidumbre σ sirven como escala de búsqueda inicial o anchura de prior en la calibración de un gemelo digital de un objeto deformable.
- Investigación en inferencia de propiedades físicas desde vídeo: el modelo permite estudiar qué parámetros son identificables a partir de observaciones visuales (E/ρ y σ_y/ρ) y cuáles no (ρ y ν).
- Tareas downstream de robótica con pinza: la model card referencia una tarea de agarre en el artículo acompañante que se beneficia del prior.
- Filtrado y priorización en pipelines de simulación: usar la clase predicha y los parámetros como *prior* para acotar el espacio de búsqueda antes de simulaciones costosas.
- Evaluación comparativa de métodos de estimación de materiales: el ensamblado y las métricas estandarizadas permiten usarlo como línea base reproducible en investigación.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación con MAE estandarizado (unidades z estandarizadas en train, agrupado sobre los 4 objetivos) y precisión de clase. Los datos disponibles en la información proporcionada están incompletos (la tabla aparece truncada en "val class acc."), por lo que no se pueden presentar los valores numéricos completos.

| Método | val MAE ↓ | test MAE ↓ | val class acc. |
|---|---|---|---|
| IdentiDeform-prior (ensamblado) | no disponible (tabla truncada) | no disponible (tabla truncada) | no disponible (tabla truncada) |

No se han publicado resultados completos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Las cabezas suman 25,65 M parámetros en fp32 (≈102 MB); el codificador V-JEPA 2 ViT-L se ejecuta en bf16 en GPU y es el principal consumidor de memoria.
- GPU recomendadas: no disponible. El código de inferencia usa `device="cuda"` y bf16 para el codificador, lo que sugiere GPU NVIDIA con soporte bf16 (por ejemplo, A100, H100 o RTX 4090), aunque no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? No disponible. Depende del tamaño del codificador V-JEPA 2 ViT-L, no cuantificado en la información.
- Opciones de despliegue: script de inferencia propio (`inference.py`) con PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (priors de vídeo para identificación de materiales deformables).

## Limitaciones y advertencias

- Solo E/ρ y σ_y/ρ son identificables a partir de vídeo: en simulación MPM el movimiento no cambia al escalar E, σ_y y ρ conjuntamente, y ν tiene un efecto débil. ρ y ν se predicen pero permanecen cerca de la media de entrenamiento y deben tratarse como priors débiles.
- Entrenado exclusivamente con datos simulados: no debe usarse para obtener valores SI del mundo real sin calibración.
- No apto para certificación de materiales en entornos de seguridad crítica.
- Posible brecha de dominio entre datos simulados y vídeo real no cuantificada en la información disponible.
- Sin soporte de texto ni multilingüe (no es un modelo de lenguaje).
- Los pesos de V-JEPA 2 no se incluyen en el repositorio y se descargan en tiempo de carga desde el Hub.
- Licencia MIT: permite uso comercial, pero las limitaciones técnicas y de calibración siguen aplicando.
- Riesgo de alucinación no aplica en el sentido de LLM, pero la incertidumbre predicha debe calibrarse con `--calibrate` para un uso fiable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HandsomeHusky/IdentiDeform-prior
- Modelo base V-JEPA 2: https://huggingface.co/facebook/vjepa2-vitl-fpc64-256
- Perfil del autor (donde se anuncia la publicación del dataset): https://huggingface.co/HandsomeHusky
