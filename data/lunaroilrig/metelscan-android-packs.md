# LunarOilRig/metelscan-android-packs

## Resumen

MetelScan Android packs es un repositorio que contiene un conjunto de modelos de traducción automática y otros componentes de procesamiento de imagen y audio, optimizados para ejecutarse en el dispositivo dentro de la aplicación Android MetelScan. El autor, LunarOilRig, publica estos paquetes bajo licencia CC-BY-4.0. Los modelos de traducción son gráficos Marian (familia OPUS-MT) convertidos a ONNX, procedentes de Xenova / onnx-community, con una modificación técnica importante: se ha integrado una operación ArgMax dentro del grafo para evitar que el teléfono copie el vocabulario completo de logits a través de JNI en cada token generado. Esto reduce la sobrecarga de comunicación entre el runtime de ONNX y el código Java/Kotlin, mejorando la latencia en dispositivos móviles.

Además de los paquetes de traducción, el repositorio incluye artefactos para OCR, inpainting (restauración de imágenes) y SenseVoice (reconocimiento de voz), según se indica en la model card. No se especifican los idiomas soportados ni el tamaño de los modelos. El tamaño total del repositorio es de 3,2 GB, lo que sugiere que puede contener múltiples variantes o pesos en diferentes formatos. La relevancia actual radica en la creciente demanda de soluciones de IA en el borde (on-device) que funcionen sin conexión, especialmente en aplicaciones móviles de traducción y procesamiento de imágenes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (OPUS-MT) convertido a ONNX, con ArgMax en el grafo |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (gráficos con ArgMax integrado) |

## Arquitectura y entrenamiento

Los modelos de traducción se basan en la arquitectura Marian, un transformer encoder-decoder ampliamente utilizado para traducción automática neuronal. Los pesos originales provienen de los repositorios de Xenova y onnx-community, que publican conversiones a ONNX de los modelos OPUS-MT. La contribución de este paquete es el ajuste (tuning) específico para la aplicación MetelScan y la incorporación de una operación ArgMax dentro del grafo ONNX. Esta operación permite seleccionar directamente el token de mayor probabilidad sin transferir el vector completo de logits al host, reduciendo la carga de memoria y el tiempo de procesamiento en entornos con recursos limitados como un smartphone. No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens ni el proceso de ajuste (fine-tuning). Los componentes adicionales (OCR, inpaint, SenseVoice) se mencionan como "los mismos artefactos medidos en el Android bench", pero no se ofrecen especificaciones técnicas adicionales.

## Capacidades

- Traducción automática neuronal en el dispositivo, sin necesidad de conexión a internet.
- Optimización para ejecución en Android mediante ONNX Runtime, con reducción de la transferencia de datos entre el runtime y la capa de aplicación.
- Incluye además artefactos para OCR (reconocimiento óptico de caracteres), inpainting (relleno de regiones de imagen) y SenseVoice (reconocimiento de voz), según la descripción del autor.
- No se especifican idiomas concretos ni capacidades de tool calling o agentes.

## Casos de uso

- Traducción offline en una aplicación móvil: el modelo puede traducir texto o frases completas sin conexión, adecuado para viajeros o entornos con conectividad limitada.
- Integración en MetelScan: la app objetivo utiliza estos paquetes para ofrecer funcionalidades de traducción, OCR, restauración de imágenes o reconocimiento de voz directamente en el dispositivo.
- OCR en documentos escaneados: el componente OCR permite extraer texto de imágenes capturadas con la cámara del teléfono.
- Inpainting para edición fotográfica: eliminar objetos no deseados o restaurar áreas dañadas de imágenes.
- Reconocimiento de voz para dictado o subtítulos: SenseVoice puede transcribir audio en tiempo real, útil para aplicaciones de accesibilidad.
- Despliegue en entornos con privacidad estricta: al ejecutarse localmente, los datos del usuario no salen del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un "Android bench" interno, pero no se comparten métricas concretas de latencia, calidad de traducción ni precisión de OCR.

## Requisitos de hardware

- Diseñado para ejecutarse en dispositivos Android, por lo que debe funcionar en CPUs móviles y GPUs integradas (Adreno, Mali, etc.).
- No se especifican requisitos mínimos de RAM ni VRAM. Dado el tamaño del repositorio (3,2 GB), es probable que los modelos se carguen en memoria de forma dinámica y no todos a la vez.
- Se recomienda un dispositivo con al menos 4 GB de RAM para un rendimiento aceptable, aunque no es un dato oficial.
- Opciones de despliegue: integración directa en la app MetelScan mediante ONNX Runtime para Android. No se menciona compatibilidad con vLLM, llama.cpp u otros frameworks de servidor.
- La latencia y el throughput dependen del hardware específico y del tamaño de los modelos, no disponibles en la información.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de traducción o paquetes on-device. No se conocen los idiomas soportados, el tamaño de los parámetros ni las métricas de calidad. Alternativas genéricas como los modelos OPUS-MT originales o NLLB-200 podrían ser comparables en funcionalidad, pero no hay datos concretos para establecer una comparación rigurosa.

## Limitaciones y advertencias

- No se especifican los idiomas soportados, lo que limita la evaluación de cobertura lingüística.
- No se proporcionan métricas de calidad de traducción ni de precisión de OCR/ASR.
- El paquete está orientado a la aplicación MetelScan; su uso fuera de ese contexto puede requerir adaptaciones.
- La licencia CC-BY-4.0 permite uso comercial siempre que se atribuya al autor, pero se debe verificar el cumplimiento de las condiciones de la licencia.
- La dependencia de ONNX Runtime y la arquitectura Marian pueden no ser adecuadas para todas las plataformas Android (versiones antiguas, arquitecturas ARM no compatibles).
- No se garantiza el soporte técnico ni actualizaciones periódicas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LunarOilRig/metelscan-android-packs
