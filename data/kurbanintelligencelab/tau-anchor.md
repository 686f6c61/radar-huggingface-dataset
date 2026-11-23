# kurbanintelligencelab/Tau-Anchor

## Resumen

Tau-Anchor es un detector de vídeo generado por IA desarrollado por Kurban Intelligence Lab, presentado en el artículo CivicBench (arXiv:2501.09446). No es un modelo generativo, sino un clasificador binario de clips de vídeo: recibe 11 fotogramas RGB de 512 x 512 a unos 8 fps y devuelve una puntuación diferenciable por clip, donde valores altos indican contenido generado. Su propósito es mantener veredictos fiables frente a ataques adversariales de pocos niveles de gris por píxel, tanto en dirección de evasión (ocultar un vídeo falso) como de enmarcado o *framing* (hacer pasar material real por generado).

La arquitectura se apoya en Delta-CLIP ViT-H/14 a 336 píxeles como extractor de características, con ajuste fino de los últimos 4 de sus 32 bloques. Sobre las incrustaciones normalizadas de cada fotograma se calcula una media normalizada que alimenta una cabeza lineal. El modelo se entrena con ataques adversariales generados en cada paso sobre ambas clases, además de un término de margen para los falsos próximos al umbral de decisión desplegado.

Es relevante ahora porque la verificación de autenticidad de vídeo se ha convertido en un problema de seguridad operativa, y la mayoría de detectores publicados no documentan su comportamiento bajo ataque dirigido. Tau-Anchor publica resultados con intervalos de confianza bootstrap del 95 % frente a PGD, APGD y Square, con gradientes exactos desde los píxeles de 8 bits hasta la salida, lo que permite reproducir y auditar los ataques.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Clasificador lineal sobre incrustaciones de Delta-CLIP ViT-H/14 (336 px), últimos 4 de 32 bloques ajustados |
| Parámetros totales | no disponible (pesos liberados: ~320 MB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 11 fotogramas RGB de 512 x 512 a ~8 fps |
| Tipos de cuantización | no disponible (pesos en PyTorch, `tau_anchor_aigvd_fold0.pt`) |
| Idiomas soportados | no disponible (tarea de clasificación visual, independiente del idioma) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`.pt`); el encoder base Delta-CLIP se descarga por separado (~4 GB) |

## Arquitectura y entrenamiento

El modelo calcula, para un clip `x` con fotogramas `x_1 ... x_11`, una incrustación por fotograma `e_t = f(normalize(resize_336(x_t))) / |.|` de longitud unitaria, las promedia y normaliza (`e(x)`), y aplica una cabeza lineal `s(x) = w · e(x) + b`. El redimensionado es bilineal con antialiasing y la normalización usa media y desviación típica de ImageNet, como en Delta-CLIP. El promedio sobre fotogramas diluye perturbaciones confinadas a pocos fotogramas. La puntuación es diferenciable de extremo a extremo desde los píxeles de 8 bits, lo que permite ataques de gradiente exacto.

Cada paso de entrenamiento ataca el lote y minimiza `CE(clean) + CE(attacked) + gamma * softplus((kappa - rho) / kappa) + lambda * |e(x) - e0(x)|^2`. Los ataques usan arranque aleatorio dentro de 4 niveles de gris y un paso de signo de 2 niveles, empujando los clips generados hacia real y los reales hacia generado. El término de margen `rho = (s(x + delta) - tau_hat) / |w|` mide la distancia del falso atacado a la frontera de decisión en unidades de incrustación, con `tau_hat` como estimación móvil del umbral desplegado. El modelo liberado se entrenó en los folds 1 a 4 de AIGVDBench y se evalúa en CivicBench.

## Capacidades

- Clasificación binaria de vídeo generado frente a real con una puntuación continua por clip.
- Robustez adversarial documentada frente a PGD (100 pasos), APGD (100 pasos, 5 reinicios) y Square (1.000 consultas), con conocimiento completo del detector.
- Resistencia a evasión (ocultar un vídeo falso) y a *framing* (marcar material real como generado).
- Gradientes exactos desde los píxeles de 8 bits hasta la salida, aptos para ataques y auditoría.
- Umbrales calibrados a una tasa de falsos positivos del 5 %: `det.tau = 1.0977` (AIGVDBench fold 0, 2.000 clips reales) y `det.tau_civicbench = 1.7751` (clips reales de CivicBench).
- Integración con el kit `civicbench` para evaluación y ataques por línea de comandos.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto; es exclusivamente un detector visual.

## Casos de uso

- Moderación de plataformas de vídeo: puntuar clips subidos antes de publicación y marcar automáticamente los que superen `det.tau`, con un coste inferior a un segundo por clip en GPU.
- Verificación periodística: comprobar material audiovisual recibido de fuentes no verificadas, usando la puntuación como indicio previo a la revisión humana y no como veredicto único.
- Detección de deepfakes en entornos hostiles: desplegar el detector sabiendo que un atacante con acceso al modelo puede intentar evasión; los resultados publicados cuantifican la caída de TPR bajo PGD a 1, 2 y 4 niveles de gris.
- Auditoría de pipelines de generación: evaluar si un generador de vídeo produce salidas detectables por un clasificador endurecido, como prueba de calidad o de trazabilidad.
- Investigación en robustez adversarial: usar los gradientes exactos y el kit `civicbench` para reproducir los ataques del artículo y comparar detectores en la misma configuración.
- Análisis forense por lotes: procesar archivos de vídeo con 11 fotogramas muestreados a ~8 fps, útil cuando no se dispone de vídeo completo o se quiere reducir coste computacional.
- Evaluación comparativa de detectores: servir como referencia en la leaderboard de CivicBench frente a otros diez detectores.

## Benchmarks y rendimiento

CivicBench, con umbral que marca el 5 % de clips reales. Evasión es el TPR bajo ataque (mayor es mejor); *framing* es la tasa de falsos positivos sobre clips reales atacados (menor es mejor). Los presupuestos están en niveles de gris sobre escala 0-255.

| Métrica | AUC | TPR | Evasión 1 | Evasión 2 | Evasión 4 | Framing 1 | Framing 2 | Framing 4 |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Tau-Anchor | .941 | .779 | .731 | .668 | .585 | .124 | .141 | .222 |
| IC 95 % | [.936, .946] | [.761, .801] | [.705, .755] | [.631, .703] | [.540, .627] | [.081, .170] | [.092, .191] | [.163, .283] |

Benchmarks generales (medias de cinco folds; solo se libera el modelo del fold 0 de AIGVDBench):

| Benchmark | AUC | TPR | Evasión 2 | Evasión 4 |
|:---|:---:|:---:|:---:|:---:|
| AIGVDBench | .988 | .935 | .931 | .883 |
| GenVidBench | .999 | .998 | .993 | .993 |

En el umbral desplegado, Tau-Anchor marca el 6,4 % de los clips reales de CivicBench antes de cualquier ataque. La evaluación adversarial se realizó sobre 225 clips generados marcados y 185 clips reales para PGD, y un subconjunto para APGD y Square.

## Requisitos de hardware

- Pesos de Tau-Anchor: ~320 MB; checkpoint Delta-CLIP base: ~4 GB, leído inicialmente en CPU.
- VRAM estimada para inferencia: no disponible de forma explícita; el encoder ViT-H/14 a 336 px sobre 11 fotogramas requiere una GPU con memoria suficiente para el lote de fotogramas, en el rango de 16-24 GB en FP32 según configuración (estimación, no dato del autor).
- GPU recomendadas: no disponible en la documentación; el ejemplo oficial usa `device="cuda"` sin especificar modelo.
- Compatibilidad con GPU de consumo: no confirmada por el autor; probable en tarjetas de 24 GB si se procesan fotogramas por lotes pequeños.
- Despliegue: paquete `civicbench` con extra `[tau-anchor]`, PyTorch >= 2.0 y `huggingface_hub`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a un clasificador visual).
- Latencia: menos de un segundo por clip en GPU según el autor. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Robustez adversarial documentada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tau-Anchor | Clasificador lineal sobre Delta-CLIP ViT-H/14 | 11 fotogramas 512 x 512 | Sí: PGD, APGD, Square con IC 95 % | CC-BY-4.0 | Pesos en Hugging Face, código en GitHub |
| Otros detectores de CivicBench (10 comparados en leaderboard) | Diversos | no disponible | Evaluados en la misma leaderboard | no disponible | no disponible |
| Delta-CLIP (`zw123/delta_clip_h14_336`) | Encoder de imagen robusto | Imagen 336 px | Preentrenado sobre imágenes atacadas | no disponible | Hugging Face |

No se dispone de datos comparativos detallados de los diez detectores restantes de la leaderboard en la información proporcionada.

## Limitaciones y advertencias

- Solo se libera el modelo entrenado en el fold 0 de AIGVDBench; los resultados de benchmarks generales son medias de cinco folds y no corresponden exactamente a los pesos publicados.
- Bajo ataque PGD con presupuesto 4, el TPR cae a .585 y el *framing* sube a .222: la robustez es parcial, no absoluta.
- El umbral desplegado marca el 6,4 % de clips reales de CivicBench sin ataque, por encima del 5 % nominal de calibración.
- La entrada es fija (11 fotogramas, 512 x 512, ~8 fps); no se documenta comportamiento con otras resoluciones, duraciones o tasas de fotogramas.
- No hay información sobre sesgos demográficos, geográficos o de contenido del detector ni del encoder base.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y negativos con consecuencias reales si se usa como veredicto automático.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el modelo base Delta-CLIP puede tener condiciones propias no detalladas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente de la comunidad.
- La fecha de creación indicada (2026-11-22) es posterior a la del artículo citado; conviene verificar la procedencia y vigencia de los artefactos antes de usarlos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kurbanintelligencelab/Tau-Anchor
- Repositorio GitHub de CivicBench: https://github.com/KurbanIntelligenceLab/CivicBench
- Código de inferencia y receta de entrenamiento: https://github.com/KurbanIntelligenceLab/CivicBench/tree/main/tau_anchor
- Leaderboard de CivicBench: https://github.com/KurbanIntelligenceLab/CivicBench#leaderboard
- Artículo: https://arxiv.org/abs/2501.09446
- Modelo base Delta-CLIP: https://huggingface.co/zw123/delta_clip_h14_336
- Dataset CivicBench: https://huggingface.co/datasets/kurbanintelligencelab/CivicBench
