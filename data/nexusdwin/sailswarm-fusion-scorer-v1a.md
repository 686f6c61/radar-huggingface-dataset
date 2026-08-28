# NexusDwin/sailswarm-fusion-scorer-v1a

## Resumen

El modelo `sailswarm-fusion-scorer-v1a` es un artefacto de fusión de sensores desarrollado por NexusDwin (Edwin Redhead) para el proyecto SailSwarm de la Universidad de Konstanz, dentro del Clúster de Excelencia en Comportamiento Colectivo. Sustituye la regla heurística `n_sensors_hit / 3` del sistema de detección de obstáculos de un velero autónomo, que combina una cámara fisheye RGB, una cámara térmica FLIR Lepton y un radar mmWave TI AWR1843. Para cada bin de rumbo de 15° emite una probabilidad calibrada de que dicho bin contenga un obstáculo relevante para la navegación, junto con una métrica de amenaza que integra urgencia, tiempo hasta colisión y severidad de clase.

Se trata de un modelo puramente numpy de 28 KB, basado en una mezcla gaussiana con pesos dependientes del contexto (gated mixture) y un calibrador isotónico de 512 nodos cuantiles. Su relevancia radica en que permite leer directamente de las curvas de pesos cuánto contribuye cada sensor en condiciones como noche, bordes del campo de visión o distancias largas, algo que la regla manual no podía expresar. El artefacto se distribuye como un archivo JSON con el modelo entrenado, junto con una implementación de referencia en `models.py`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla gaussiana con pesos dependientes del contexto (gated mixture) + calibrador isotónico |
| Parametros totales | no disponible (artefacto de 28 KB en JSON) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificación por bin de rumbo de 15°) |
| Tipos de cuantizacion | no aplica (modelo numpy, sin cuantización) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | JSON (`fusion_scorer_v1a.json`) + código Python numpy |

## Arquitectura y entrenamiento

El modelo implementa una función de puntuación por bin de rumbo: `p(bin) = sigmoid( Σ_s w_s(context) · e_s + b(context) )`, donde `e_s` son los canales de evidencia por sensor (fisheye segmentado, blob térmico, conteo/SNR de radar) y `context` incluye variables normalizadas como elevación solar, luminosidad, indicador de oscuridad, calidad térmica, disponibilidad de segmentación e IMU, rumbo absoluto y rango. Los pesos `w_s(context)` se calculan como `softplus(u_s + v_s · context)`, lo que garantiza no negatividad. Estos pesos aprendidos constituyen el entregable principal: permiten interpretar directamente cómo cambia la contribución de cada sensor según las condiciones ambientales.

El entrenamiento se realizó con `scripts/fusion_model/train.py` sobre capturas del Lago de Constanza, con un total de 167 601 bins de entrenamiento. Las etiquetas son pseudo-etiquetas generadas con GroundingDINO sobre las imágenes fisheye (el proceso de auditoría está pendiente). Se utilizó una semilla de 0 a 2 y se seleccionó la mejor variante (`d2_base`). El calibrador isotónico (512 nodos cuantiles) se incluye dentro del artefacto; la salida recomendada para consumo es `predict_proba_calibrated`, ya que la sigmoide cruda es solo un ranking balanceado por clase, no una probabilidad.

## Capacidades

- Fusión de tres sensores heterogéneos (fisheye RGB, térmico FLIR, radar mmWave) en una única probabilidad calibrada por bin de rumbo.
- Emisión de una métrica de amenaza que combina la probabilidad con urgencia (rango, tiempo hasta colisión) y severidad de clase (persona > animal > barco > otro > estructura > flotador).
- Interpretabilidad directa de los pesos de cada sensor en función del contexto (noche, bordes de FOV, rango largo) mediante `GatedMixtureScorer.gate_weights(context)`.
- Calibración probabilística mediante isotonic regression, lo que permite usar la salida como probabilidad real.
- Implementación ligera y portable: solo requiere numpy, sin dependencias de deep learning.
- Diseñado para ejecutarse en hardware embebido (Raspberry Pi, según los tags del repositorio).

## Casos de uso

- Navegación autónoma de veleros no tripulados: el modelo integra las lecturas de los tres sensores para decidir maniobras evasivas en tiempo real, con una ventana de 7 bins de 15° que cubre el campo frontal (−45° a +45°).
- Detección de obstáculos en puertos y zonas de amarre: el sistema mantiene un rango dinámico completo (0.24 → 1.00) en escenas de dársena, lo que permite distinguir entre obstáculos cercanos y estructuras lejanas.
- Vigilancia marítima en condiciones de baja luminosidad: los pesos aprendidos indican cuándo el sensor térmico debe dominar sobre el fisheye, mejorando la detección de personas y objetos en la oscuridad.
- Evaluación de sistemas de fusión de sensores: el modelo sirve como referencia para comparar reglas heurísticas frente a enfoques aprendidos sobre las mismas características, como demuestra el bake-off documentado en `reports/bakeoff_d2_base.md`.
- Investigación en robótica de enjambre: el artefacto puede integrarse en pipelines de investigación sobre comportamiento colectivo de embarcaciones autónomas, donde la fusión robusta de sensores es crítica.
- Prototipado rápido en sistemas embebidos: al ser un modelo numpy de 28 KB, puede desplegarse en Raspberry Pi u otros dispositivos de bajo consumo sin necesidad de GPU ni frameworks pesados, ideal para pruebas de campo.

## Benchmarks y rendimiento

Los resultados publicados en la model card provienen de un split de validación congelado, con bins de 15° y objetivos de relevancia sin límite de rango (regla D.2). Se comparan tres semillas (0, 1, 2) contra la regla heurística incumbente:

| Metrica | Modelo (semillas 0/1/2) | Regla incumbente |
|---|---|---|
| AP (Average Precision) | 0.982 / 0.982 / 0.983 | 0.945 |
| Recall de clase persona @0.5 | 0.90 → 0.92 | no disponible |

Además, en una corrida anterior del corpus (2026-08-22) con un límite de relevancia de 30 m, se reportaron AP de 0.455 (all_v3) y 0.439 (nav_v3) frente a 0.412 de la regla incumbente, con un recall de persona que pasó de 0.72 a 0.92. La model card advierte que estos números deben interpretarse como "la regla aprendida supera a la regla manual sobre las mismas características", no como una puntuación absoluta de detección, dado que el corpus está dominado por escenas de dársena y el 85% de los bins son positivos bajo relevancia sin límite.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM; es un modelo numpy que se ejecuta en CPU.
- GPU recomendada: ninguna; funciona en cualquier CPU, incluida una Raspberry Pi (mencionada en los tags del repositorio).
- Compatibilidad con hardware de consumo: sí, cualquier dispositivo con Python y numpy puede ejecutarlo.
- Opciones de despliegue: integración directa en scripts Python; no requiere servidores de inferencia como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones formales, pero al ser un modelo de 28 KB con operaciones vectorizadas numpy, la inferencia por bin es del orden de microsegundos en hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (fusión de sensores marítimos con salida calibrada por bin). El propio artefacto se compara internamente contra la regla heurística `n_sensors_hit / 3` del sistema SailSwarm, pero no se han identificado alternativas públicas equivalentes en la información disponible.

## Limitaciones y advertencias

- Entrenado con pseudo-etiquetas de GroundingDINO sobre imágenes fisheye; la auditoría de etiquetas está pendiente, por lo que este artefacto se considera pre-auditoría.
- No incorpora características de movimiento en la probabilidad `p`; el movimiento solo afecta a la métrica de amenaza a través de TTC/CPA. Un objetivo pequeño que cruce con evidencia de blob débil puede puntuar en la meseta del calibrador.
- La tabla de severidad de clase (persona 1.0 > animal 0.8 > barco 0.6 > otro 0.5 > estructura 0.4 > flotador 0.3) es una política provisional, no aprendida.
- Los bins son de 15° (7 bins, centros de −45° a +45°); los registros de la era de bins de 10° no son comparables.
- No validado para navegación en lazo cerrado; el modelo está pensado como componente de un sistema mayor, no como decisor final.
- La licencia es "other" sin especificar; se debe contactar al autor para aclarar los términos de uso comercial.
- El corpus está dominado por escenas de dársena y el 85% de los bins son positivos bajo relevancia sin límite, lo que satura la AP; los datos de aguas abiertas con negativos son la necesidad principal de datos adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NexusDwin/sailswarm-fusion-scorer-v1a
- Repositorio de etiquetado con GroundingDINO: https://huggingface.co/NexusDwin/sailswarm-groundingdino-labeler
- Perfil del autor en Hugging Face: https://huggingface.co/NexusDwin
