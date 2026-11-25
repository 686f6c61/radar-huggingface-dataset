# accidentalgenius101/legA-D-shuffle-lam30

## Resumen

`legA-D-shuffle-lam30` es un checkpoint de replicación independiente del apartado 2.1 del artículo «Shaping & Monitoring Models through their Internal Representations» (arXiv:2611.07071) de Goodfire, centrado en el fenómeno de *reliance shaping* sobre el conjunto de datos Waterbirds. No es un modelo de lenguaje: se trata de un clasificador binario construido sobre un extractor de características congelado o parcialmente ajustable, `facebook/dinov2-small` (ViT-S/14), con una cabeza de lectura MLP (GELU, 384 → 256 → 256 → 1) entrenada desde cero sobre el token CLS normalizado de 384 dimensiones. El autor lo publica como artefacto de verificación científica, no como modelo listo para producción.

El resultado declarado por el autor es un fallo acotado de replicación: el fenómeno de dependencia (*reliance*) del artículo se reproduce como un transitorio temprano (WGA de validación máxima de 0,89-0,95 en los primeros ~1.200 pasos en cinco de las seis ramas limpias), pero decae y desaparece mucho antes del punto final de 25.000 pasos. El autor sostiene que la persistencia en el punto final no es reproducible a partir del texto del artículo más la librería `reliance` publicada, porque el protocolo deja sin especificar la longitud total de entrenamiento, la regla de checkpointing, el schedule de LR, el weight decay, el LR de la cabeza y lambda.

El checkpoint tiene 22.221.185 parámetros en formato safetensors, ocupa 0,1 GB en el repositorio y se distribuye bajo licencia «other». Su relevancia es metodológica: documenta con detalle qué partes de un resultado publicado se reproducen y cuáles no, y aísla las variables de protocolo que deciden la diferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-S/14 (`facebook/dinov2-small`) como encoder + cabeza MLP GELU (384 → 256 → 256 → 1) sobre el token CLS normalizado |
| Parametros totales | 22.221.185 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, imágenes de 224×224) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un encoder ViT-S/14 preentrenado (DINOv2-small) con una cabeza de lectura MLP de tres capas y activación GELU que produce una única logit. La imagen de entrada es de 224×224 y el lote de entrenamiento es de 32. El entrenamiento usa AdamW con weight decay 0, LRs constantes separados (encoder 1e-6, declarado en el artículo; cabeza 1e-3) y 25.000 pasos. La configuración corresponde a la rama A1, penalización *shuffle*, lambda 30, semilla 0, refresco de la dirección de dependencia cada 100 pasos y `frozen=False`. Las cantidades que el artículo deja sin especificar se declaran explícitamente en el campo `deviations` de `config.json`.

El conjunto de datos es Waterbirds con los splits publicados: 2.066 imágenes de entrenamiento en exactamente 2 grupos perfectamente confundidos, y 512 de validación y 512 de test, cada uno con 4 grupos de 128 e identidades disjuntas. La innovación técnica del trabajo original es la *reliance shaping*: una penalización que empuja al modelo a no depender de la dirección de características asociada al sesgo espurio (el fondo), medida mediante la AUROC de fondo a lo largo de la dirección de diferencia de medias en el paso 0. El autor documenta además un defecto propio corregido (un estimador de ruido que promediaba 8 muestras con signo antes de elevar al cuadrado, calculando una funcional ~8× más débil que la del artículo) y caracteriza un mecanismo de pico-decaimiento: la penalización aplasta la medida de dependencia en ~200 pasos, tras lo cual la sensibilidad de la cabeza vuelve a crecer 15-25× a LR constante y la dirección refrescada rota.

## Capacidades

- Clasificación binaria de imágenes (pájaro vs. fondo) sobre Waterbirds, con salida de una logit.
- Extracción de características visuales mediante el token CLS de DINOv2-small (384 dimensiones).
- Medición de dependencia de características: AUROC de fondo a lo largo de la dirección de diferencia de medias (L1 reportado: val 0,536, test 0,548 en el punto final).
- Entrenamiento con penalizaciones de *reliance shaping* (variantes *gradinput* y *shuffle*) y ajuste de lambda.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo *thinking*, visión generativa ni audio.

## Casos de uso

- Replicación de resultados científicos: sirve como artefacto de referencia para verificar el apartado 2.1 de arXiv:2611.07071 y comparar trayectorias de WGA frente a las cifras publicadas (93-97,7% de WGA de test).
- Estudio de dinámicas de entrenamiento: permite analizar el transitorio temprano (pico de 0,953 en el paso 1.000-1.200) y el decaimiento posterior, útil para investigar por qué las métricas de robustez no persisten hasta el punto final.
- Auditoría de protocolos de entrenamiento: el campo `deviations` de `config.json` documenta las decisiones no especificadas en el artículo, lo que facilita diseñar experimentos controlados sobre longitud de entrenamiento, schedule de LR y weight decay.
- Investigación sobre sesgos espurios: el modelo y sus métricas de AUROC de fondo permiten estudiar cómo las penalizaciones afectan a la dependencia de características de contexto en lugar de la clase objetivo.
- Docencia y formación en reproducibilidad: caso práctico de cómo un fallo de replicación se acota mediante hipótesis pre-declaradas y brazos de contexto (ERM, congelado, LRs separados).
- Base para experimentos de *reliance shaping*: punto de partida para reentrenar con otras lambdas (0,3, 1, 3, 10, 30) o con el encoder congelado, comparando los resultados ya tabulados por el autor.

## Benchmarks y rendimiento

Resultados declarados por el autor en Waterbirds (semilla 0, punto final en el paso 25.000, salvo el pico indicado):

| Rama | lambda | Pico WGA val (paso) | WGA val final | WGA test final | L1 test final |
|---|---|---|---|---|---|
| gradinput | 10 (D3) | 0,945 (400) | 0,172 | 0,180 | 0,165 |
| gradinput | 1 (E wave 1) | 0,891 (200) | 0,164 | 0,141 | 0,152 |
| gradinput | 0,3 (E wave 2) | 0,617 (200) | 0,188 | 0,180 | 0,161 |
| shuffle | 30 (D3) | 0,953 (1.000-1.200) | 0,000 | 0,000 | 0,548 |
| shuffle | 3 (E wave 1) | 0,938 (400) | 0,016 | 0,008 | 0,137 |
| shuffle | 1 (E wave 2) | 0,945 (200) | 0,375 | 0,422 | 0,550 |

Brazos de contexto (mismos splits):

| Brazo | Protocolo | WGA test |
|---|---|---|
| ERM, régimen filed | LR único 1e-6 en todos los parámetros, 2.500 pasos, 3 semillas | 0,055 (media) |
| ERM, LRs separados (D1) | encoder 1e-6 / cabeza 1e-3, 2.500 pasos, semilla 0 | 0,172 |
| ERM congelado (D2) | encoder congelado, cabeza 1e-3, 2.500 pasos, semilla 0 | 0,375 |
| gradinput congelado lambda 10 (D2) | encoder congelado, cabeza 1e-3, 2.500 pasos, semilla 0 | 0,711 |

Referencia del artículo original: 93-97,7% de WGA de test en el punto final para el apartado 2.1, con 3 semillas, bajo un protocolo cuyos parámetros clave no se declaran. El autor no reproduce esas cifras en el punto final.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,2 M de parámetros; en la práctica, unos pocos cientos de MB incluyendo activaciones de una imagen 224×224.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series GTX antiguas) y en CPU para inferencia puntual.
- Opciones de despliegue: carga directa con `transformers` y `safetensors`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de visión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| legA-D-shuffle-lam30 | 22,2 M | Clasificación binaria Waterbirds con *reliance shaping* | no aplica | other | Hugging Face |
| facebook/dinov2-small | ~22 M | Backbone ViT auto-supervisado de propósito general | no aplica | Apache 2.0 (según el modelo base) | Hugging Face |
| Modelos del artículo Goodfire (no publicados) | no disponible | Modelos con *reliance shaping* del apartado 2.1 | no aplica | no disponible | no publicados; solo se liberó la librería `reliance` |

No se dispone de otros checkpoints de replicación comparables en la información proporcionada.

## Limitaciones y advertencias

- El propio autor declara el resultado como FAILED (acotado): ninguna rama limpia alcanza la barra de retención pre-declarada (WGA de test ≥ 88% sin colapso tardío).
- El checkpoint es un artefacto de replicación científica, no un modelo entrenado para uso práctico; su WGA de test final es 0,000 en la rama publicada.
- Sesgos conocidos: el entrenamiento usa los splits de Waterbirds con grupos perfectamente confundidos, de modo que el modelo puede aprender atajos de fondo si no media la penalización.
- Riesgo de sobreajuste al protocolo: el autor identifica variables no especificadas en el artículo (longitud de entrenamiento, checkpointing, schedule de LR, weight decay, LR de cabeza, lambda) que deciden el resultado final.
- Limitaciones de idioma: no aplica; es un modelo de visión sin capacidades lingüísticas.
- Licencia «other»: no se detallan los términos de uso comercial; debe consultarse la model card antes de cualquier uso en producción.
- El autor documenta un defecto propio corregido (estimador de ruido) y un defecto de protocolo en el régimen inicial (LR único de 1e-6 aplicado a todos los parámetros), lo que condiciona la interpretación de resultados previos.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este modelo.

## Enlaces

- Hugging Face: https://huggingface.co/accidentalgenius101/legA-D-shuffle-lam30
- Artículo: https://arxiv.org/abs/2611.07071 (Goodfire, «Shaping & Monitoring Models through their Internal Representations»)
- Modelo base: https://huggingface.co/facebook/dinov2-small
- Librería `reliance` de Goodfire: no disponible en la información proporcionada
- Repositorio o demo del autor: no disponible en la información proporcionada
