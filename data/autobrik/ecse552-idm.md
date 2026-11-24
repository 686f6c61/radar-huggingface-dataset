# Autobrik/ecse552-idm

## Resumen

Autobrik/ecse552-idm es un modelo de dinámica inversa (inverse dynamics model, IDM) desarrollado por Autobrik en el marco del proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado "Learning to Manipulate a New Object from Action-Free Videos". Su función es etiquetar vídeos de manipulación robótica sin acciones: a partir de dos fotogramas consecutivos de tres cámaras (frontal, lateral y de muñeca) predice los 7 objetivos articulares absolutos que se habrían aplicado entre ambos fotogramas. Es, por tanto, una pieza auxiliar dentro de un pipeline de imitation learning a partir de vídeo, no un modelo de lenguaje.

Técnicamente es una red neuronal convolucional pequeña: un ResNet-18 preentrenado en ImageNet, compartido entre las tres cámaras, que recibe 9 canales (los dos fotogramas y su diferencia) y cuyas características se concatenan y pasan por un MLP de 512 a 7 salidas. Se entrenó durante 20 épocas sobre una parte del dataset Autobrik/ecse552-ocbench-block, con resolución de 128 px y frecuencia de 10 Hz.

Su relevancia es acotada pero clara: ejemplifica el patrón de generar pseudoetiquetas de acción para entrenar políticas a partir de vídeos sin anotaciones de acciones, un enfoque habitual en robótica de imitación. El repositorio ocupa unos 0,1 GB y tiene licencia MIT, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (ResNet-18 preentrenado en ImageNet) compartida entre camaras + MLP 512 -> 7 |
| Parametros totales | no disponible (ResNet-18, aproximadamente 11,7 M en la parte convolucional, mas el MLP; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de dos fotogramas consecutivos; no es un modelo de secuencia) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, `best.pt`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robotica, sin entrada ni salida de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best.pt`), con `config.json` e `history.json` por semilla |

Otros datos relevantes: entrada de 9 canales (fotograma t, fotograma t+1 y su diferencia) a 128 px y 10 Hz; salida de 7 objetivos articulares absolutos; tamaño del repositorio de 0,1 GB; pipeline declarado `robotics`.

## Arquitectura y entrenamiento

El modelo sigue un diseño de dos etapas. Primero, un ResNet-18 preentrenado en ImageNet se comparte entre las tres cámaras (frontal, lateral y muñeca); cada cámara aporta 9 canales de entrada (los dos fotogramas y su diferencia), de modo que la red procesa la información espacial y el movimiento aparente de cada vista. Después, las características de las tres cámaras se concatenan y se introducen en un MLP de 512 a 7 neuronas que emite los 7 objetivos articulares absolutos.

El entrenamiento se realizó durante 20 épocas con pérdida MSE sobre objetivos estandarizados, optimizador AdamW y tamaño de lote 64, usando el split de entrenamiento (8 de cada 10 episodios) de los conjuntos `source-deterministic-n300-seed0` y `source-turned-n100-seed600000` del dataset Autobrik/ecse552-ocbench-block. Se publican tres semillas (`seed0`, `seed1`, `seed2`), cada una con el checkpoint de mejor sMAE de validación sobre el conjunto fuente, su `config.json` y el `history.json` con pérdidas y errores de validación por época. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa; la innovación metodológica es el propio enfoque de etiquetado de vídeos sin acciones para alimentar el método (b) del proyecto.

## Capacidades

- Predicción de dinámica inversa: dado un par de fotogramas consecutivos (o_t, o_t+1) de tres cámaras, estima los 7 objetivos articulares absolutos a_t.
- Etiquetado automático de vídeos sin acciones: genera pseudoetiquetas de acción para entrenar políticas de imitación a partir de demostraciones sin anotación de acciones.
- Fusión multivista: integra información de cámara frontal, lateral y de muñeca mediante un backbone compartido y concatenación de características.
- Uso de información de movimiento: la entrada de 9 canales incluye la diferencia entre fotogramas, lo que aporta señal explícita de desplazamiento.
- Interfaz de inferencia sencilla: carga mediante `action_free.idm.load_idm(Path("idm_turned/seed0/best.pt"), device)` y predicción con `model.predict(obs, next_obs)`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, visión general, audio ni modo de pensamiento; es un modelo específico de robótica.

## Casos de uso

- Etiquetado de vídeos de manipulación sin acciones: se usa para generar las acciones a_t que faltan en demostraciones grabadas, permitiendo entrenar políticas de imitación con datos que no incluyen teleoperación ni acciones registradas.
- Entrenamiento de políticas de imitación: las pseudoetiquetas producidas alimentan el método (b) del proyecto, que aprende a manipular un objeto nuevo a partir de vídeo; el IDM actúa como generador de supervisión.
- Replicación de experimentos académicos: sirve como referencia reproducible del pipeline de dinámica inversa del proyecto ECSE 552, con tres semillas y registros de entrenamiento publicados.
- Prototipado en laboratorio con robots de bajo coste: al ser un ResNet-18 con entrada de 128 px y 10 Hz, puede ejecutarse en una GPU de consumo para etiquetar lotes de episodios antes de entrenar la política.
- Análisis de calidad de datos de demostración: comparando las predicciones del IDM con acciones reales en episodios que sí las tienen, se puede estimar la coherencia del dataset y detectar segmentos ruidosos.
- Base para extensiones multivista: la arquitectura de backbone compartido con concatenación de cámaras es un punto de partida para adaptar el IDM a otras configuraciones de sensores o a otros objetos del mismo entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona errores de etiquetado por objetivo documentados en `docs/experiments/idm.md` del repositorio de código y curvas de validación en `history.json`, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del backbone (ResNet-18, unos 11,7 M de parámetros) y una entrada de 3 cámaras a 128 px, la huella es muy reducida y cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; una RTX 4090, A100 o H100 son sobredimensionadas para este modelo, y una GPU integrada o una CPU moderna pueden bastar para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, con margen amplio; el repositorio completo ocupa 0,1 GB.
- Opciones de despliegue: PyTorch nativo mediante `action_free.idm.load_idm`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros IDM comparables ni resultados que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo específico de un proyecto académico: entrenado sobre un dataset concreto (Autobrik/ecse552-ocbench-block) y un objeto concreto; no se documenta generalización a otros entornos, robots u objetos.
- Entrada restringida: requiere pares de fotogramas consecutivos de tres cámaras a 128 px y 10 Hz; no acepta otras resoluciones, frecuencias o configuraciones de sensores sin reentrenamiento.
- Sin capacidades de lenguaje ni de visión general: no debe evaluarse como modelo multimodal ni usarse para tareas de texto.
- Riesgo de error en las pseudoetiquetas: al ser un IDM, sus predicciones se usan como supervisión; errores sistemáticos se propagan al entrenamiento de la política. La model card remite a `docs/experiments/idm.md` para los errores por objetivo, pero no se aportan cifras en la información disponible.
- Sesgos: no documentados; al derivarse de un dataset limitado, es probable que herede sus sesgos de distribución y de condiciones de captura.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las licencias del dataset y del backbone ResNet-18 preentrenado en ImageNet.
- Madurez: cero descargas y cero likes, creado y actualizado el mismo día (24 de noviembre de 2026); no hay evidencia de uso en producción ni de validación externa.
- Sin cuantizaciones publicadas: solo se ofrece el checkpoint PyTorch `best.pt`; no hay versiones optimizadas para despliegue en dispositivos de bajos recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Autobrik/ecse552-idm
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Código del proyecto: https://github.com/BrikHMP18/ecse-552-project
- Referencia interna del código: `src/action_free/idm.py` y `configs/idm_turned.toml` del repositorio anterior
- Documentación de errores de etiquetado: `docs/experiments/idm.md` del repositorio de código
