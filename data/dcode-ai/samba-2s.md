# Dcode-AI/SAMBA-2s

## Resumen

SAMBA-2s es un codificador de características para electroencefalografía (EEG) desarrollado por Dcode-AI (autores Jiazhen Hong, Geoffrey Mackellar y Soheila Ghane), presentado en el taller NeurReps 2026. No es un modelo de lenguaje: es un modelo fundacional de señales cerebrales orientado a extracción de características (feature extraction) y aprendizaje autosupervisado, pensado para servir como base para tareas posteriores de interfaz cerebro-computadora (BCI) mediante sondeo lineal (linear probing) o fine-tuning.

El modelo combina dos innovaciones: un núcleo Mamba diferencial (arquitectura de espacio de estados selectiva, no transformer) y un mecanismo de embedding espacial guiado por coordenadas de electrodos. Esto permite que el codificador acepte configuraciones variables de electrodos (4, 14, 19 o 129 canales) y longitudes de ventana distintas de las usadas en preentrenamiento, algo poco habitual en modelos EEG que suelen estar atados a un montaje fijo.

La variante SAMBA-2s se preentrenó con ventanas de 2 segundos a 128 Hz (256 muestras) sobre datos de Emotiv (Alpha, Attention, Crowdsource, DriverDistraction, STEW), HBN resting state, Muse sleep onset y DICE eyes closed. Con 1.065.172 parámetros, es un modelo muy compacto que cabe holgadamente en cualquier GPU consumer y está diseñado para desplegarse en entornos de investigación con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba diferencial (SSM selectivo) con embedding espacial guiado por coordenadas de electrodos |
| Parametros totales | 1.065.172 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de 2 s a 128 Hz (256 muestras); el encoder admite otras longitudes de ventana |
| Tipos de cuantizacion | no disponible (pesos en safetensors float; sin variantes GGUF/AWQ publicadas) |
| Idiomas soportados | no disponible (modelo de senal EEG, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors + config.json) |

## Arquitectura y entrenamiento

SAMBA se apoya en una arquitectura Mamba diferencial: un modelo de espacio de estados selectivo en el que las actualizaciones de estado se formulan de forma diferencial, lo que según los autores mejora la estabilidad y la capacidad de modelar dinámicas temporales largas en señales EEG. Sobre esa columna vertebral temporal se añade un módulo de embedding espacial que toma las coordenadas 3D de los electrodos (tensor `positions` de forma `[channels, 3]` o `[batch, channels, 3]`) y aprende a combinar los canales según su posición física en el cuero cabelludo. La model card muestra mapas topográficos animados de pesos espaciales aprendidos para tareas de ojos abiertos/cerrados, distracción al volante e imaginería motora.

El preentrenamiento es autosupervisado sobre ventanas de 2 segundos a 128 Hz (256 muestras) con configuraciones de 4, 14, 19 y 129 canales, a partir de los conjuntos Emotiv (Alpha, Attention, Crowdsource, DriverDistraction, STEW), HBN resting state, Muse sleep onset y DICE eyes closed. No se especifica en la información disponible el número total de tokens ni la composición exacta del dataset. El codificador produce características de forma `[batch, floor(samples / 8), 128]`, es decir, una reducción temporal de factor 8 y 128 dimensiones por paso; el pooling temporal (`features.mean(dim=1)`) se emplea para sondeo lineal.

## Capacidades

- Extracción de características EEG autosupervisadas para tareas posteriores de clasificación o regresión.
- Acepta configuraciones variables de electrodos (4, 14, 19, 129 canales) gracias al embedding guiado por coordenadas.
- Acepta longitudes de ventana distintas de las 2 s de preentrenamiento, según indica la model card.
- Manejo de coordenadas 3D de electrodos en el mismo sistema de referencia y unidades que `config.json`.
- Normalización de señal recomendada por cuantil 0,95 sobre el valor absoluto por canal.
- Inferencia en modo `torch.inference_mode()`, orientada a extracción de características más que a generación.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es un modelo unimodal de señal EEG.
- Capacidades multilingües: no aplicable.

## Casos de uso

- Sondeo lineal para clasificación de estados oculares (ojos abiertos vs. cerrados): se extraen características con `model.encode` y se entrena un clasificador lineal sobre `pooled_features`, aprovechando que el modelo fue preentrenado con DICE eyes closed y datos de estado de reposo.
- Detección de distracción al volante: el modelo se preentrenó con el conjunto DriverDistraction de Emotiv, por lo que sus características son directamente utilizables para clasificar episodios de atención sostenida frente a distracción en cabinas de simulación o vehículos.
- Decodificación de imaginería motora para BCI: la model card muestra pesos espaciales aprendidos para imaginería motora, lo que lo hace adecuado como extractor en pipelines de control de prótesis o interfaces de cursor.
- Análisis de atención y carga cognitiva: los conjuntos Alpha, Attention y Crowdsource de Emotiv permiten reutilizar el codificador para estimar niveles de atención en tareas de evaluación cognitiva.
- Investigación en sueño: el preentrenamiento con Muse sleep onset facilita la extracción de características para detección de inicio de sueño o clasificación de fases a partir de EEG de bajo canal.
- Transferencia a montajes personalizados: gracias al embedding por coordenadas, se puede aplicar a cascos con 4 o 14 electrodos no vistos en preentrenamiento, útil en estudios con hardware Emotiv o Muse.
- Prototipado rápido en entornos con recursos limitados: con ~1 millón de parámetros, se puede ejecutar en una GPU consumer o incluso en CPU para experimentos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de exactitud, F1 ni comparaciones numéricas con otros modelos EEG; únicamente referencia el paper (arXiv:2511.18571) para consultar los resultados completos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (1.065.172 parámetros ≈ 4,3 MB de pesos), más el espacio para activaciones de la ventana de entrada; en la práctica, menos de 2 GB con lotes pequeños.
- GPU recomendadas: cualquier GPU CUDA moderna; no requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GTX 1650 son suficientes.
- Cabe en cualquier GPU consumer; también es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: el paquete oficial `samba_eeg` (instalación vía `pip install -e '.[mamba,hub]'` desde el repositorio GitHub). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dado el tamaño, se espera latencia de milisegundos por ventana en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAMBA-2s | 1.065.172 | 2 s a 128 Hz (256 muestras) | Mamba diferencial + embedding espacial por coordenadas | no disponible | Hugging Face (Dcode-AI/SAMBA-2s) |
| SAMBA-100s | no disponible | ventana de 100 s (variante del mismo proyecto) | Misma arquitectura, preentrenamiento con ventanas largas | no disponible | Hugging Face (Dcode-AI/SAMBA-100s) |
| Otros modelos EEG fundacionales | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con la variante SAMBA-100s del mismo proyecto. No se dispone de datos de benchmarks ni de especificaciones de modelos EEG fundacionales alternativos (por ejemplo, de la familia LaBraM, BIOT o EEGPT) en el material consultado, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Modelo de investigación: no hay benchmarks publicados en la model card, solo la referencia al paper; la validación empírica debe hacerse por cuenta del usuario.
- Dependencia del sistema de coordenadas: las posiciones de electrodos deben usar el mismo marco de referencia y unidades que `config.json`; un desajuste degrada las características sin aviso.
- Sensible a la normalización: la model card recomienda dividir por el cuantil 0,95 del valor absoluto por canal; omitir este paso puede alterar los resultados.
- Frecuencia de muestreo fija en preentrenamiento (128 Hz): señales a otras frecuencias requieren remuestreo previo.
- Sesgos de dominio: el preentrenamiento se apoya en conjuntos Emotiv, HBN, Muse y DICE, con predominio de hardware consumer y poblaciones concretas; el rendimiento en otros cascos clínicos o poblaciones puede diferir.
- Riesgo de falsos positivos en aplicaciones clínicas: no es un dispositivo médico ni ha sido validado para diagnóstico.
- No apto para tareas lingüísticas, de visión o de agente: cualquier uso fuera de EEG carece de sentido.
- Reducción temporal de factor 8: la resolución temporal de las características es de 16 Hz (128 Hz / 8), lo que puede ser insuficiente para eventos muy rápidos.

## Enlaces

- Hugging Face: https://huggingface.co/Dcode-AI/SAMBA-2s
- Variante SAMBA-100s: https://huggingface.co/Dcode-AI/SAMBA-100s
- Web del proyecto: https://samba.dcode.ai/
- Código: https://github.com/Jiazhen-Hong/SAMBA
- Paper: https://arxiv.org/abs/2511.18571
- Config: https://huggingface.co/Dcode-AI/SAMBA-2s/resolve/main/config.json
- Pesos: https://huggingface.co/Dcode-AI/SAMBA-2s/resolve/main/model.safetensors
- Figuras de pesos espaciales: https://github.com/Jiazhen-Hong/SAMBA/tree/main/Figures/Topo_gif
