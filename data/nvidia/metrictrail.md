# nvidia/MetricTrail

## Resumen

MetricTrail es un sistema de odometría visual y reconstrucción 3D métrica desarrollado por NVIDIA, publicado en Hugging Face bajo el identificador `nvidia/MetricTrail`. No se trata de un modelo de lenguaje, sino de un pipeline de visión por computador que estima el movimiento de cámara y la profundidad métrica por fotograma a partir de secuencias largas de imágenes RGB. Combina un proveedor de profundidad métrica por imagen (MoGe-2, congelado), correspondencias dispersas aprendidas y optimización geométrica local con ajuste de haces (bundle adjustment) explícito.

El componente aprendido principal es el checkpoint DINO-DPVO, que contiene 3.425.860 parámetros entrenables (3,43 millones) distribuidos en 100 tensores FP32 de pesos y sesgos. Este recuento excluye el backbone DINOv3-S/16 congelado, el modelo externo de profundidad MoGe-2, las dependencias de calibración y los modelos opcionales SALAD y RoMa. La arquitectura es una odometría visual recurrente aprendida que alterna emparejamiento de parches con optimización conjunta de poses de cámara y profundidades inversas de parches en una ventana activa acotada.

La relevancia del lanzamiento es doble: por un lado, propone un enfoque híbrido que inyecta características de un foundation model visual (DINOv3) en un sistema clásico de odometría (DPVO) mediante adaptadores residuales aprendidos; por otro, mantiene una licencia estrictamente no comercial, lo que restringe su uso a investigación y evaluación. El repositorio no incluye los pesos del modelo: el checkpoint DINO-DPVO está previsto para una publicación separada en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Odometría visual recurrente aprendida (DPVO) con características congeladas de DINOv3-S/16, adaptadores de fusión residual y bundle adjustment explícito; proveedor de profundidad métrica MoGe-2 congelado |
| Parametros totales | 3.425.860 parámetros aprendidos (checkpoint DINO-DPVO); excluye DINOv3, MoGe-2 y modelos opcionales |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa secuencias de vídeo en una ventana activa acotada, sin cifra publicada) |
| Tipos de cuantizacion | No disponible (pesos en FP32; DINOv3 se ejecuta en BF16) |
| Idiomas soportados | No aplica (modelo de visión, no lingüístico) |
| Licencia | NVIDIA OneWay Noncommercial License (uso no comercial); DPVO base bajo MIT; código original NVIDIA Apache-2.0; DINOv3 bajo DINOv3 License |
| Formato de pesos | No disponible (el repositorio no incluye pesos; se anuncia un release separado en Hugging Face) |

## Arquitectura y entrenamiento

MetricTrail se construye sobre la red de correspondencia de parches dispersos de DPVO, a la que se añaden adaptadores aprendidos de fusión de características residuales. El encoder DINOv3-S/16 permanece congelado y sus características de 384 dimensiones se proyectan a 64 canales, divididas en dos ramas de 32 canales que aumentan el flujo de emparejamiento de 128 canales y el contexto recurrente de 384 dimensiones. Las proyecciones residuales finales se inicializan a cero, de modo que la adaptación parte de las predicciones del checkpoint oficial de DPVO. El estimador local alterna emparejamiento de parches aprendido con optimización conjunta de poses de cámara y profundidades inversas de parches en una ventana activa acotada. MoGe-2 predice de forma independiente la profundidad métrica en Z de cámara para cada imagen; estas predicciones inicializan las profundidades de los parches y actúan como restricciones suaves robustas durante la optimización, pudiendo ser superadas por evidencia multivista.

El entrenamiento se realizó durante 15.000 pasos del optimizador con batch global de 16 en 16 GPU NVIDIA A100 de 80 GB, con una duración aproximada de siete horas. Las ramas de fusión se precalentaron primero con 5.000 clips de TartanAir con la odometría congelada; después, odometría y fusión se ajustaron conjuntamente sobre los 235.000 clips restantes. DINOv3 permaneció congelado y MoGe-2 no se usó durante la adaptación. Se empleó AdamW con tasas de aprendizaje de 8e-6 para odometría y 8e-5 para fusión, weight decay 1e-6, annealing lineal OneCycle con 1 % de warmup, recorte de gradiente en 10 y semilla 1234. Cada clip usa 80 parches por fotograma y 18 refinamientos recurrentes. La pasada de DINOv3 se ejecuta en BF16, mientras que adaptadores, odometría, bundle adjustment diferenciable y pérdidas usan FP32.

## Capacidades

- Estimación de movimiento de cámara (odometría visual) sobre secuencias largas de imágenes RGB temporalmente ordenadas.
- Estimación de profundidad métrica por fotograma mediante el proveedor MoGe-2.
- Emparejamiento disperso de parches aprendido con optimización geométrica local y ajuste de haces.
- Uso de intrínsecos de cámara suministrados o estimados a partir de RGB.
- Soporte opcional de estéreo rectificado con secuencias izquierda/derecha sincronizadas.
- Corrección de lazo (loop closure) opcional mediante un NPZ de trayectoria local, su sidecar JSON y un JSON externo de candidatos con pares de fotogramas y puntuaciones.
- Exportación de trayectorias de cámara y caché de profundidad por fotograma a través de una CLI.
- Adaptadores de inventario para Oxford Spires y LaMAria, además de PNG preparados y NPZ estilo KITTI.
- No exporta nubes de puntos densas ni mallas; la reconstrucción densa requiere un flujo de evaluación de investigación separado.

## Casos de uso

- Investigación en odometría visual de vídeo largo: el sistema alterna emparejamiento y optimización en una ventana acotada, lo que permite procesar secuencias extensas manteniendo coherencia de pose sin un coste de memoria creciente con la longitud del vídeo.
- Reconstrucción 3D métrica de interiores y exteriores: combinando las poses recuperadas con los mapas de profundidad por fotograma en un marco mundial común, útil para visión por computador, gráficos, simulación y robótica, con validación geométrica independiente.
- Estudio de priors de profundidad métrica: permite comparar el efecto de las predicciones de MoGe-2 como inicialización y restricción suave frente a evidencia multivista, en protocolos de evaluación reproducibles.
- Evaluación de representaciones visuales: al inyectar características de DINOv3 mediante adaptadores residuales inicializados a cero, sirve para medir cuánto aporta un foundation model visual a un sistema de odometría clásico.
- Comparación de configuraciones de calibración: el mismo pipeline cubre monocular calibrado, calibración solo RGB y estéreo calibrado, lo que facilita estudios comparativos bajo protocolos declarados.
- Robótica y simulación (uso interno de investigación): las trayectorias y profundidades exportadas pueden alimentar entornos simulados o servir de referencia para validar algoritmos de SLAM, siempre con validación independiente de la geometría.
- Procesamiento por lotes de inventarios de datasets: los adaptadores para Oxford Spires y LaMAria permiten ejecutar la CLI sobre colecciones de imágenes preparadas y cachear profundidades para experimentos posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint DINO-DPVO contiene solo 3,43 millones de parámetros aprendidos, pero el sistema completo requiere ejecutar DINOv3-S/16 y MoGe-2, cuyos requisitos de VRAM no se detallan en la información disponible.
- El entrenamiento se realizó en 16 GPU NVIDIA A100 de 80 GB, lo que indica que el pipeline completo (entrenamiento con bundle adjustment diferenciable) está pensado para hardware de centro de datos.
- No se especifica la VRAM mínima para inferencia ni si el sistema cabe en GPU de consumo; no disponible.
- Opciones de despliegue: la información solo describe una CLI propia del repositorio que exporta trayectorias y cachea profundidad; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.
- El repositorio ocupa 0,0 GB y no incluye pesos; será necesario obtener el checkpoint DINO-DPVO del release separado anunciado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MetricTrail (DINO-DPVO) | 3,43 M aprendidos (más DINOv3 y MoGe-2 congelados) | No disponible | Sin benchmarks publicados | NVIDIA OneWay Noncommercial | Pesos aún no publicados |
| DPVO | No disponible en la información | No disponible | No disponible | MIT | Upstream citado como base |
| MoGe-2 | No disponible en la información | No disponible | No disponible | No disponible en la información | Proveedor de profundidad externo |
| DINOv3-S/16 | No disponible en la información | No disponible | No disponible | DINOv3 License | Encoder congelado externo |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia estrictamente no comercial: la NVIDIA OneWay Noncommercial License limita el uso a investigación o evaluación no comercial, sujeta al acuerdo; no apta para producción comercial.
- Los pesos del modelo no están incluidos en el repositorio; el checkpoint DINO-DPVO está pendiente de un release separado en Hugging Face.
- La CLI no exporta nubes de puntos densas ni mallas; los resultados de reconstrucción densa requieren un flujo de evaluación de investigación separado.
- La CLI no decodifica contenedores de vídeo arbitrarios: requiere PNG preparados o NPZ estilo KITTI con imágenes `uint8 [N,3,H,W]`.
- La corrección de lazo depende de un fichero de candidatos generado externamente, con verificación de SHA256 del NPZ base y del propio fichero de candidatos.
- Riesgo de alucinación geométrica: las predicciones de profundidad de MoGe-2 actúan como restricciones suaves y pueden ser incorrectas; la evidencia multivista puede sobrescribirlas, pero se recomienda validación independiente de la geometría.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de idioma: no aplica (modelo de visión).
- Términos heredados: el código incorpora componentes MIT y BSD, y DINOv3 se rige por su propia licencia; las licencias del código fuente no sustituyen los términos de los pesos ni de los datasets.
- Uso previsto exclusivamente para investigación y desarrollo; cualquier despliegue en robótica real debe acompañarse de validación independiente de la geometría.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/MetricTrail
- Licencia NVIDIA OneWay Noncommercial: https://developer.download.nvidia.com/licenses/NVIDIA-OneWay-Noncommercial-License-22Mar2022.pdf
- Licencia MIT (DPVO): https://opensource.org/license/mit
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Repositorio de código y avisos de terceros: referenciados en la model card como `../THIRD_PARTY_NOTICES.md` y `../README.md#license` (sin URL absoluta en la información disponible)
- Release alternativo citado en la model card: https://huggingface.co/nvidia/metrictrail (no verificado)
