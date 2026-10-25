# bongchanjeong/RGB-IR-CIL-gated-KD

## Resumen

RGB-IR Gated Knowledge Distillation no es un modelo de lenguaje, sino una familia de 36 checkpoints (tres métodos × cuatro semillas × tres etapas) para un detector de objetos RGB–infrarrojo entrenado con aprendizaje incremental por clases. Lo publica el usuario de HuggingFace bongchanjeong como resultado de un proyecto universitario de visión por computador iniciado en 2025 y revisado en 2026. El problema que aborda es el olvido catastrófico: cómo añadir clases nuevas a un detector sin destruir el rendimiento sobre las clases aprendidas previamente.

La aportación técnica es el uso de la puerta de fusión (fusion gate) del modelo profesor como proxy de la fiabilidad de cada modalidad. En lugar de aplicar una destilación de conocimiento con pesos iguales entre RGB e IR, el método ponderan la transferencia según lo que la puerta del profesor indica sobre qué modalidad es más fiable para cada entrada. El entrenamiento combina repetición (replay) de muestras antiguas con destilación de características en tres niveles (f3, f4 y f5).

La entrada es un par de imágenes alineadas: RGB de 3 canales e IR de 1 canal, redimensionadas con letterbox a 768 × 1024 píxeles. El modelo final detecta seis clases del dataset M3FD (Car, People, Lamp, Bus, Truck, Motorcycle). El autor publica los resultados de retención y mAP50 sobre un split de test fijo, lo que permite reproducir la evaluación sin reentrenar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detector de objetos multi-escala con fusión aprendida de características RGB/IR en los niveles f3, f4 y f5; puerta de fusión de tipo `feature` (`gate_type="feature"`). El backbone concreto no se especifica en la información disponible |
| Parámetros totales | No disponible. Estimación indirecta: ~25 MB por checkpoint en el repositorio de 0,9 GB para 36 checkpoints, lo que sugiere del orden de 6 M de parámetros en fp32 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: es un detector de objetos con entrada de imagen fija de 768 × 1024 (alto × ancho) |
| Tipos de cuantización | No disponible. El autor solo publica checkpoints `.pt` en precisión completa; no hay variantes GGUF, ONNX ni int8 |
| Idiomas soportados | No aplica (modelo de visión). Las etiquetas de clase están en inglés: Car, People, Lamp, Bus, Truck, Motorcycle |
| Licencia | No disponible |
| Formato de pesos | `.pt` (PyTorch `state_dict` bajo la clave `"model"`, cargable con `torch.load(..., weights_only=True)`) |
| Entrada | Diccionario `{"rgb": tensor 3×H×W, "ir": tensor 1×H×W}` con valores en `[0, 1]`, letterbox a 768 × 1024 y padding a cero, sin normalización ImageNet |
| Número de clases | 6 (Car=0, People=1, Lamp=2, Lamp=3… según el mapeo del autor: Bus=3, Truck=4, Motorcycle=5) |
| Salida | Predicciones multi-escala en bruto; requieren el postprocesado del proyecto |
| Postprocesado de referencia | Prefiltro de objectness 0,25, NMS class-aware con IoU 0,6, máximo 300 detecciones por imagen |
| Checkpoints publicados | 36 (métodos `replay_only`, `vanilla_kd`, `gated_kd` × semillas 0–3 × etapas 1–3) |
| Dataset | M3FD, con corrupción sintética de modalidad única y entradas ausentes durante el entrenamiento |

## Arquitectura y entrenamiento

El detector fusiona características de tres niveles del backbone (f3, f4 y f5) mediante un mecanismo de fusión aprendido que incluye una puerta por características. La innovación del trabajo está en cómo se explota esa puerta durante la destilación: en `gated_kd`, la activación de la puerta del profesor se interpreta como una estimación de la fiabilidad relativa de RGB frente a IR para cada entrada, y se usa para ponderar la pérdida de destilación de características entre profesor y alumno. La destilación se aplica sobre características normalizadas por canal en los tres niveles. Los otros dos brazos del estudio son controles: `replay_only` (repetición sin destilación) y `vanilla_kd` (repetición más destilación de características RGB/IR con pesos iguales).

El entrenamiento es incremental por clases en tres etapas de dos clases cada una: etapa 1 (Car, People), etapa 2 (Lamp, Truck) y etapa 3 (Bus, Motorcycle). Los modelos parten de inicialización aleatoria, no de pesos preentrenados en ImageNet según la información disponible, y se entrenan con M3FD aplicando corrupción sintética de una sola modalidad y entradas ausentes, lo que fuerza al modelo a funcionar cuando falta RGB o IR. Cada etapa se ejecuta con cuatro semillas (0, 1, 2, 3). Los checkpoints publicados conservan el `state_dict` del modelo, la configuración de entrenamiento, la etapa y metadatos del código fuente, pero omiten el estado del optimizador, por lo que sirven para inferencia y evaluación, no para reanudar el entrenamiento.

## Capacidades

- Detección de objetos en seis clases sobre pares de imágenes RGB e infrarrojo alineadas: Car, People, Lamp, Bus, Truck y Motorcycle.
- Fusión multimodal aprendida a tres escalas, con puerta que pondera la contribución de cada modalidad.
- Robustez parcial a la ausencia o corrupción de una modalidad, adquirida mediante corrupción sintética y entradas ausentes durante el entrenamiento.
- Aprendizaje incremental por clases con retención medida etapa a etapa (etapas 1 y 2 reutilizables como profesores de la etapa siguiente).
- Evaluación reproducible: manifiesto de release con hashes de checkpoints y métricas por etapa, script `evaluate_final_checkpoints.py` y split de test fijo (`configs/splits/m3fd_325.json`).
- Tres variantes comparables bajo la misma arquitectura de fusión, lo que permite aislar el efecto de la destilación con puerta frente a la destilación con pesos iguales.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, audio ni modo de pensamiento: es exclusivamente un detector visual.

## Casos de uso

- Vigilancia perimetral nocturna: el modelo combina la textura del canal RGB con la radiación térmica del IR para detectar personas y vehículos en condiciones de baja iluminación, donde un detector solo-RGB pierde recall. La entrada fija de 768 × 1024 encaja con cámaras de vigilancia habituales.
- Conducción autónoma y ADAS en entornos oscuros o con niebla: detección de peatones, coches, camiones, autobuses y motocicletas fusionando ambos sensores, con la puerta actuando como mecanismo de degradación elegante cuando un sensor falla o se satura.
- Monitorización de tráfico urbano: conteo y clasificación de vehículos por tipo (Car, Truck, Bus, Motorcycle) en cámaras instaladas en vías con iluminación variable, usando la modalidad IR como respaldo nocturno.
- Investigación en aprendizaje incremental: línea base reproducible para medir olvido catastrófico en detección multimodal, con tres métodos, cuatro semillas y métricas de retención ya calculadas para comparar contra nuevos algoritmos de destilación.
- Inspección industrial con cámaras térmicas: localización de personas en zonas de riesgo o de vehículos en plantas, donde el canal IR aporta señal incluso con oclusión parcial de la iluminación visible.
- Robótica móvil de exterior: percepción multimodular en plataformas con cámara RGB e IR estéreo o térmica, aprovechando la tolerancia del modelo a la pérdida de una modalidad.
- Docencia y validación de métodos de destilación: el repositorio incluye manifiesto, hashes y script de evaluación, lo que permite reproducir la tabla de resultados del autor sin reentrenar y comparar implementaciones alternativas de KD con puerta.

## Benchmarks y rendimiento

Resultados finales publicados por el autor: media ± desviación estándar muestral sobre cuatro semillas, evaluados con 420 pares M3FD reservados y sin corrupción, las seis clases, modelos de final de etapa y AP de 11 puntos con IoU 0,50.

| Método | mAP50 ↑ | Medida de olvido (FM) ↓ |
|---|---:|---:|
| Replay-only (sin KD) | 34,45 ± 1,42 % | 40,86 ± 2,01 % |
| Vanilla KD + replay | 37,32 ± 1,20 % | 38,79 ± 3,30 % |
| Gated KD + replay | 38,63 ± 2,16 % | 37,17 ± 1,94 % |

La medida de olvido promedia, para cada clase antigua, la caída desde su mejor AP en un final de etapa posterior a su introducción hasta su AP final; incluye Car, People, Lamp y Truck. En los metadatos del release, AP y FM se expresan en escala 0–1.

No se han publicado resultados de benchmarks en la información disponible para comparaciones externas (otros detectores RGB–IR, otros métodos de detección incremental o métricas estándar tipo COCO AP). La única comparación con datos es la interna entre las tres variantes del propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Con ~6 M de parámetros estimados y una única imagen de 768 × 1024, la inferencia cabe holgadamente por debajo de 2 GB en fp32; el cuello de botella es la resolución de entrada y las activaciones multi-escala, no el número de pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM es suficiente en la práctica; el script de evaluación acepta `--device cuda`. Para evaluar las 36 combinaciones en paralelo conviene una GPU de gama media-alta (RTX 3060/4070 o superior) por comodidad, no por requisito de memoria.
- GPU de consumo: sí cabe en tarjetas de consumo, incluidas GTX 1660, RTX 3050 y superiores, así como en GPUs integradas con suficiente memoria compartida. También es viable en CPU para inferencia puntual a 768 × 1024.
- Opciones de despliegue: PyTorch nativo con el paquete `models.model.RGBIRDetector` del repositorio GitHub; `huggingface_hub` para descarga selectiva de checkpoints. No hay exportaciones oficiales a ONNX, TensorRT, OpenVINO, GGUF ni integración con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Almacenamiento: el repositorio completo ocupa 0,9 GB (36 checkpoints de ~25 MB). Para una sola variante basta con descargar `checkpoints/<metodo>/seed_<n>/*` mediante `allow_patterns`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia, FPS ni throughput en la información proporcionada.

## Comparativa con modelos similares

Comparación interna, con datos publicados (misma arquitectura de fusión, mismo protocolo de evaluación, cuatro semillas):

| Variante | Destilación | mAP50 ↑ | FM ↓ | Checkpoints |
|---|---|---:|---:|---|
| `replay_only` | Ninguna | 34,45 ± 1,42 % | 40,86 ± 2,01 % | 12 (4 semillas × 3 etapas) |
| `vanilla_kd` | Características RGB/IR con pesos iguales | 37,32 ± 1,20 % | 38,79 ± 3,30 % | 12 |
| `gated_kd` | Características RGB/IR ponderadas por la puerta del profesor | 38,63 ± 2,16 % | 37,17 ± 1,94 % | 12 |

Frente a alternativas externas (detectores RGB–IR como las líneas base sobre M3FD, o métodos de detección incremental de objetos como las familias ILOD y Faster ILOD): no disponible. La información proporcionada no incluye parámetros, contexto, rendimiento, licencia ni disponibilidad de esos sistemas, por lo que no es posible establecer una comparación numérica fiable.

## Limitaciones y advertencias

- Espacio de clases muy reducido: solo seis clases de M3FD, orientadas a escenas de tráfico. No es un detector de propósito general y no cubrirá categorías fuera de ese conjunto.
- Olvido todavía elevado: incluso la mejor variante pierde de media un 37,17 % de AP en las clases antiguas (frente al 40,86 % de la línea base). El margen de mejora es amplio y el modelo no es adecuado para producción sin un mecanismo adicional de retención.
- Requisito estricto de entrada: pares RGB (3 canales) e IR (1 canal) alineados espacialmente, con letterbox idéntico a 768 × 1024 y padding a cero. Desalineaciones o resoluciones distintas degradan el rendimiento sin aviso.
- Licencia no disponible: no se especifica licencia en el repositorio de HuggingFace. Antes de cualquier uso comercial hay que contactar con el autor y verificar además la licencia del dataset M3FD, que se distribuye con sus propias condiciones.
- Sin estado del optimizador en los checkpoints: no es posible reanudar el entrenamiento desde los ficheros publicados, solo inferir y evaluar.
- Sin cuantizaciones ni exportaciones a formatos de despliegue (ONNX, TensorRT, int8), lo que limita el uso en entornos embebidos sin trabajo adicional de conversión.
- Riesgo de falsos positivos y negativos típico de la detección de objetos: no hay "alucinación" en sentido lingüístico, pero sí detecciones espurias en escenas con baja visibilidad o desequilibrio entre modalidades. El postprocesado de referencia (objectness 0,25, NMS IoU 0,6, 300 detecciones) está calibrado para el protocolo de evaluación del autor, no para otros dominios.
- Sesgos potenciales derivados del dataset: M3FD está compuesto por escenas de tráfico captadas en un contexto geográfico y de sensores concreto. No hay datos publicados sobre equidad, robustez a otras cámaras térmicas ni generalización a otros países o condiciones meteorológicas.
- Proyecto de carácter académico y sin descargas ni interacciones en HuggingFace: no hay evidencia de uso en producción ni mantenimiento a largo plazo.
- Reproducibilidad dependiente del código: la carga exige el paquete `models.model.RGBIRDetector` del repositorio GitHub y una revisión concreta; el autor recomienda fijar el commit de release en lugar de usar `main`.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/bongchanjeong/RGB-IR-CIL-gated-KD)
- [Repositorio de código y entrenamiento (rama codex/final-portfolio)](https://github.com/bongchanjeong/RGB-IR-CIL-gated-KD/tree/codex/final-portfolio)
- [README del repositorio con instrucciones de entrenamiento](https://github.com/bongchanjeong/RGB-IR-CIL-gated-KD/blob/codex/final-portfolio/README.md)
- [Especificación completa del método](https://github.com/bongchanjeong/RGB-IR-CIL-gated-KD/blob/codex/final-portfolio/docs/final_method_spec.md)
- Dataset M3FD: no se proporciona enlace en la información disponible
- Paper o publicación asociada: no disponible
