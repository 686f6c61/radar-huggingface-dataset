# noahcao/FAH

## Resumen

FAH (Fast and Accurate Hand Estimation in Pixels, Interaction and World Space) es un conjunto de pesos para la estimación y reconstrucción 3D de manos, desarrollado por Jinkun Cao (usuario `noahcao` en Hugging Face). El modelo resuelve el problema de recuperar la pose de la mano en tres espacios distintos: espacio de píxeles (2D), espacio de interacción (contacto mano-objeto y mano-mano) y espacio de mundo (coordenadas 3D globales), con especial énfasis en escenarios egocéntricos.

El repositorio contiene cuatro variantes del modelo de pose (FAH-S, FAH-B, FAH-L y FAH-H), junto con componentes auxiliares: un detector de manos, fitters para los modelos paramétricos MANO y MHR-Hand, un refinador de vídeo causal y un modelo de movimiento de cámara. Los pesos derivan de SAM 3D Body y DINOv3, y el conjunto total ocupa 9,9 GB.

Es relevante porque aborda de forma conjunta la estimación de pose, el contacto físico y la localización en espacio de mundo, una combinación poco frecuente en los modelos de reconstrucción de manos disponibles públicamente. La licencia es exclusivamente de investigación y uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de pose basada en SAM 3D Body y DINOv3 (detalles exactos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | fah-weights-license (solo investigación y uso no comercial) |
| Formato de pesos | PyTorch (`model.pt`, `contact.pt`, `contact_video.pt`) |

## Arquitectura y entrenamiento

FAH se compone de varios módulos especializados. El núcleo es una red de estimación de pose disponible en cuatro escalas (FAH-S, FAH-B, FAH-L y FAH-H), cada una con su `config.json` y pesos en `model.pt`. A esta se suman cabezas de contacto (`contact.pt` para imagen y `contact_video.pt` para vídeo), un detector de manos que devuelve cajas, lateralidad e máscaras de instancia, y fitters para los modelos paramétricos MANO y MHR-Hand. Un refinador de vídeo causal y un modelo de movimiento de cámara completan el pipeline para secuencias.

Según la model card, los modelos de pose, los fitters y los modelos de vídeo y contacto derivan de SAM 3D Body y DINOv3, y arrastran las licencias de ambos. La guía de entrenamiento del repositorio de GitHub documenta los puntos de entrada reproducibles, pero el propio autor advierte que la inicialización del profesor de la etapa 1 y la exclusión de episodios de diagnóstico de cámara de EgoDex no son verificables a partir de los ficheros de esta release. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se empleó RLHF o DPO.

## Capacidades

- Estimación de pose de mano 2D en espacio de píxeles.
- Reconstrucción 3D de la mano mediante los modelos paramétricos MANO y MHR-Hand.
- Predicción de contacto mano-objeto y mano-mano (cabezas de contacto para imagen y vídeo).
- Localización en espacio de mundo (coordenadas 3D globales), con modelo de movimiento de cámara para secuencias.
- Detección de manos con cajas delimitadoras, lateralidad (izquierda/derecha) y máscaras de instancia.
- Procesamiento de vídeo con refinador causal, apto para secuencias egocéntricas.
- Escenarios egocéntricos (cámaras en primera persona), etiquetados explícitamente en el repositorio.
- Cuatro variantes de tamaño para ajustar el equilibrio precisión/eficiencia.

## Casos de uso

- Reconstrucción de manos en vídeo egocéntrico: el refinador de vídeo causal y el modelo de movimiento de cámara permiten procesar secuencias grabadas con cámaras en primera persona, manteniendo coherencia temporal entre fotogramas.
- Interacción mano-objeto en robótica: las cabezas de contacto `contact.pt` y `contact_video.pt` predicen puntos de contacto, útiles para imitación de destrezas manuales o para el entrenamiento de políticas de manipulación.
- Captura de movimiento para animación y VFX: el pipeline completo (detector, pose, fitter MANO) permite obtener mallas de mano animables a partir de vídeo monoculo.
- Análisis de gestos en interfaces humano-máquina: la detección con lateralidad y máscaras de instancia permite segmentar manos en tiempo real para control gestual.
- Realidad aumentada y virtual: la localización en espacio de mundo y el modelo de movimiento de cámara permiten anclar contenido virtual a la posición 3D de las manos del usuario.
- Investigación en percepción egocéntrica: las cuatro variantes de tamaño (S, B, L, H) permiten comparar el compromiso precisión/coste computacional en experimentos académicos.
- Anotación semiautomática de datasets: el detector y el fitter pueden generar etiquetas iniciales de pose y contacto que luego se revisan manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 9,9 GB, pero incluye pesos de cuatro variantes y módulos auxiliares; el consumo real depende de la variante cargada (S, B, L o H).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamaño de cada variante individual no se detalla.
- Opciones de despliegue: el autor proporciona el comando `hf download` y el repositorio de GitHub con instrucciones de instalación y uso; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FAH | no disponible | no disponible | Solo investigación, no comercial | Hugging Face + GitHub |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: solo investigación y uso no comercial; cualquier uso comercial requiere autorización expresa.
- Herencia de licencias: los modelos de pose, fitters, vídeo y contacto derivan de SAM 3D Body y DINOv3, y están sujetos a la SAM License y la DINOv3 License, reproducidas en el fichero LICENSE.
- Dependencias externas no incluidas: el modelo MANO y la configuración de SAM 3D Body no se distribuyen en el repositorio; deben obtenerse por separado siguiendo el README de GitHub.
- El detector tiene procedencia y términos propios, recogidos en la Parte 4 de la licencia.
- Trazabilidad del entrenamiento incompleta: el autor advierte que la inicialización del profesor de la etapa 1 y la exclusión de episodios de diagnóstico de EgoDex no son verificables desde los ficheros de esta release.
- No se incluyen imágenes de datasets ni el modelo MANO en el repositorio.
- No se documentan sesgos específicos ni tasas de alucinación (no aplicable en el sentido lingüístico, pero sí posibles fallos de estimación en oclusiones o manos fuera de encuadre).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria publicada.
- La verificación de integridad requiere ejecutar `sha256sum -c` (o `shasum -a 256 -c` en macOS) sobre `SHA256SUMS`.

## Enlaces

- Hugging Face: https://huggingface.co/noahcao/FAH
- GitHub (código, instalación y uso): https://github.com/noahcao/FAH
- Guía de entrenamiento: `docs/training.md` dentro del repositorio de GitHub
- Licencia: fichero `LICENSE` en el repositorio de Hugging Face
- Página del proyecto y enlace al paper: pendientes de añadir según la model card
