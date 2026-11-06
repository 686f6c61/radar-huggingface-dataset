# eddyLfan/SINDRI-Transfer

## Resumen

SINDRI-Transfer es un checkpoint de inferencia para generación de vídeo multivista condicionada por profundidad, desarrollado por el usuario eddyLfan. Se trata de un ajuste fino sobre el modelo base alibaba-pai/Wan2.2-Fun-5B-Control, un modelo de difusión de vídeo de 5.000 millones de parámetros de Alibaba PAI. El modelo resuelve un problema concreto: generar tres vistas sincronizadas (cabeza, muñeca izquierda y muñeca derecha) de una escena a partir de vídeos de profundidad, imágenes de referencia y un prompt de texto compartido, lo que resulta útil para síntesis de datos de manipulación robótica y captura de movimiento multivista.

El repositorio aloja únicamente los pesos del ajuste (aproximadamente 401 MB), compuestos por cuatro módulos de atención cruzada bidireccional entre vistas y un LoRA de atención compartido de rango 32. No incluye el modelo base, el código de inferencia ni el estado del optimizador, por lo que su uso requiere descargar por separado Wan2.2-Fun-5B-Control. La configuración por defecto de inferencia es 640×352, 24 FPS, 50 pasos, CFG 6 y ventanas de 121 fotogramas con 25 fotogramas de solapamiento.

La relevancia actual del modelo radica en su enfoque para generar datos sintéticos multivista etiquetados de forma consistente, un recurso escaso y costoso de obtener en dominios como la robótica de manipulación. No obstante, la ausencia de documentación sobre licencia, idiomas, benchmarks y detalles de entrenamiento limita seriamente su evaluación para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo (base Wan2.2-Fun-5B-Control) con módulos de atención cruzada bidireccional entre vistas y LoRA de atención de rango 32 |
| Parámetros totales | 5B en el modelo base; el checkpoint Transfer añade módulos y LoRA (tamaño del archivo: ~401 MB) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; ventanas de inferencia de 121 fotogramas con 25 de solapamiento |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el prompt de texto compartido se procesa mediante el codificador del modelo base) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt), más metadatos JSON con SHA-256 y tamaño |

## Arquitectura y entrenamiento

El modelo parte de Wan2.2-Fun-5B-Control, un transformer de difusión para vídeo de 5.000 millones de parámetros. Sobre esta base, SINDRI-Transfer incorpora cuatro módulos de atención cruzada bidireccional que permiten el intercambio de información entre las tres vistas generadas (cabeza, muñeca izquierda y muñeca derecha) de forma simultánea, junto con un LoRA de atención compartido de rango 32. La condición de profundidad se introduce mediante mapas de disparidad relativa en escala de grises, donde el blanco indica superficies cercanas, lo que permite al modelo respetar la geometría de la escena en cada vista.

El checkpoint publicado corresponde a 20.000 pasos de entrenamiento (20K) e incluye únicamente los pesos de inferencia, sin estado del optimizador ni del entrenador. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni otras innovaciones técnicas más allá de la arquitectura multivista descrita. Tampoco se documentan detalles sobre el proceso de ajuste fino ni sobre posibles etapas de curado de datos.

## Capacidades

- Generación de vídeo multivista sincronizado: produce tres vistas simultáneas (cabeza, muñeca izquierda, muñeca derecha) a partir de vídeos de profundidad, imágenes de referencia y un prompt de texto compartido.
- Condicionamiento por profundidad: utiliza mapas de disparidad relativa en escala de grises para alinear la geometría de las vistas generadas con la escena de entrada.
- Condicionamiento por imagen de referencia: incorpora imágenes de referencia para guiar la apariencia de los sujetos u objetos en las vistas generadas.
- Generación de vídeo a 24 FPS con resolución 640×352 y ventanas de 121 fotogramas con solapamiento de 25, lo que permite secuencias de mayor duración mediante concatenación de ventanas.
- Control mediante prompt de texto compartido entre las tres vistas, lo que garantiza coherencia semántica entre ellas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Generación de datos sintéticos para robótica de manipulación: el modelo puede producir tríos de vídeos sincronizados (cabeza y ambas muñecas) a partir de demostraciones capturadas con una sola cámara y mapas de profundidad, ampliando datasets de imitación con vistas consistentes desde múltiples ángulos.
- Aumento de datos para entrenamiento de políticas visomotoras: a partir de vídeos de profundidad de una escena, se generan vistas de muñeca izquierda y derecha que permiten entrenar políticas con observaciones multivista sin necesidad de grabar físicamente con tres cámaras.
- Reconstrucción y validación de capturas de movimiento: el modelo permite sintetizar vistas adicionales de una secuencia capturada, útiles para verificar la coherencia geométrica de un rig o de una captura de movimiento antes de su uso en producción.
- Prototipado de entornos de teleoperación: los vídeos generados pueden alimentar simuladores o interfaces de teleoperación que requieran observaciones desde la cabeza y ambas muñecas del operador robótico.
- Investigación en generación de vídeo condicionada por geometría: el modelo sirve como banco de pruebas para estudiar la coherencia entre vistas en modelos de difusión de vídeo, gracias a su arquitectura de atención cruzada bidireccional.
- Creación de contenido de demostración para entrenamiento humano: generar tríos de vídeos sincronizados para tutoriales de manipulación o formación de operarios, donde se muestran simultáneamente la perspectiva general y las manos.
- Previsualización de secuencias de animación: a partir de un vídeo de profundidad y una imagen de referencia, generar vistas de cabeza y muñecas para previsualizar una animación antes de su renderizado final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Como referencia orientativa, el modelo base Wan2.2-Fun-5B-Control, con 5.000 millones de parámetros en precisión de 16 bits, requiere del orden de 10-12 GB solo para los pesos, a lo que hay que sumar las activaciones del proceso de difusión de vídeo, que típicamente elevan el consumo muy por encima de esa cifra.
- GPU recomendadas: no disponibles de forma específica. Por el tamaño del modelo base, se espera que requiera GPU de clase profesional (A100, H100, L40S) o consumer de gama alta con suficiente VRAM (RTX 4090 de 24 GB) para resoluciones y ventanas reducidas.
- ¿Cabe en GPU consumer? No confirmado. La resolución por defecto (640×352) y las ventanas de 121 fotogramas sugieren un consumo de memoria considerable; se desconoce si cabe en GPUs consumer de 16-24 GB sin optimizaciones adicionales.
- Opciones de despliegue: no se documentan. El repositorio no incluye código de inferencia ni integraciones con vLLM, llama.cpp, Ollama, TGI u otros frameworks; el autor indica que el código de inferencia no está incluido.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SINDRI-Transfer | 5B (base) + módulos y LoRA | 121 fotogramas por ventana, 24 FPS, 640×352 | Difusión de vídeo multivista condicionada por profundidad | no disponible | Pesos en Hugging Face, sin código de inferencia |
| alibaba-pai/Wan2.2-Fun-5B-Control | 5B | no disponible | Difusión de vídeo con control | no disponible en la información proporcionada | Pesos en Hugging Face |
| Otros modelos de vídeo multivista | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas específicas de la misma categoría (generación de vídeo multivista condicionada por profundidad).

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del checkpoint ni del modelo base en la información disponible, lo que impide determinar las restricciones de uso comercial.
- Idiomas no documentados: se desconoce qué idiomas soporta el prompt de texto compartido, aunque hereda el codificador del modelo base.
- Ausencia de código de inferencia: el repositorio contiene únicamente pesos y metadatos; el usuario debe implementar o localizar el pipeline de inferencia compatible con Wan2.2-Fun-5B-Control.
- Dependencia del modelo base: requiere descargar por separado alibaba-pai/Wan2.2-Fun-5B-Control, cuyos términos de uso y licencia también aplican.
- Riesgo de alucinación visual: como modelo generativo de difusión, puede producir detalles inconsistentes entre vistas o geometrías que no se correspondan con el mapa de profundidad de entrada.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento ni posibles sesgos demográficos, de escena o de iluminación.
- Limitaciones de resolución y duración: la inferencia por defecto se limita a 640×352 y ventanas de 121 fotogramas; secuencias más largas requieren concatenación con solapamiento, lo que puede introducir artefactos en las transiciones.
- Sin benchmarks ni evaluación cuantitativa publicada: no es posible verificar la calidad de la sincronización entre vistas ni la fidelidad a la profundidad de entrada con datos objetivos.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa del checkpoint.

## Enlaces

- [Hugging Face: eddyLfan/SINDRI-Transfer](https://huggingface.co/eddyLfan/SINDRI-Transfer)
- [Modelo base: alibaba-pai/Wan2.2-Fun-5B-Control](https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-Control)
- [Checkpoint: checkpoints/Transfer.pt](https://huggingface.co/eddyLfan/SINDRI-Transfer/blob/main/checkpoints/Transfer.pt)
- [Metadatos: configs/release.json](https://huggingface.co/eddyLfan/SINDRI-Transfer/blob/main/configs/release.json)
