# RuFlect/LangGap-InternW0-Delta-LDS

## Resumen

LangGap-InternW0-Delta-LDS es una política robótica (policy) publicada por RuFlect sobre el modelo base InternRobotics/InternW0-Delta-Libero. No se trata de un modelo de lenguaje generativo, sino de un checkpoint de control visuomotor para manipulación robótica, entrenado con la técnica Linear Decodability Supervision (LDS) en su variante "fine" y correspondiente al paso de entrenamiento 1469. El autor lo describe como la política "all-train" empleada en la evaluación principal de benchmarks, distinta de la política RoboTwin-IF y de la política de generalización con escenas retenidas.

El modelo se apoya en dos activos congelados: Wan-AI/Wan2.2-TI2V-5B y Alibaba-DAMO-Academy/RynnBrain1.1-2B, lo que sugiere una arquitectura compuesta que combina un backbone generativo de vídeo/imagen con un modelo de razonamiento visual. La liberación incluye el checkpoint `internw0_delta_libero.pt`, el fichero `dataset_stats.json`, la configuración `native_config.yaml`, sumas de verificación SHA256 y metadatos de procedencia en `model-release.json`.

Es relevante ahora porque introduce supervisión de decodificabilidad lineal como señal auxiliar de entrenamiento en políticas robóticas, un enfoque poco habitual que busca que las representaciones internas sean linealmente separables respecto a variables de localización. El repositorio ocupa 12,4 GB y se distribuye bajo licencia Apache 2.0, aunque no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política visuomotora sobre InternW0-Delta; activos congelados Wan2.2-TI2V-5B y RynnBrain1.1-2B) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`internw0_delta_libero.pt`), más `dataset_stats.json` y `native_config.yaml` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la política. El modelo se construye sobre InternRobotics/InternW0-Delta-Libero y utiliza dos modelos congelados como componentes auxiliares: Wan2.2-TI2V-5B (modelo generativo texto-imagen-a-vídeo de 5B parámetros) y RynnBrain1.1-2B (modelo de 2B parámetros). El checkpoint publicado corresponde al paso 1469 de entrenamiento con supervisión LDS en variante "fine", empleando todas las escenas con supervisión de localización disponibles; el autor indica explícitamente que esta versión no constituye un split de entrenamiento con escenas retenidas.

La innovación técnica declarada es Linear Decodability Supervision: una señal auxiliar que fomenta que las representaciones internas del modelo sean linealmente decodificables respecto a información de localización. Las cabezas LDS auxiliares se descartan en inferencia, por lo que el checkpoint final mantiene la interfaz nativa de InternW0-Delta. El release no incluye estado del optimizador ni cachés de entrenamiento, solo parámetros de inferencia y ficheros de soporte.

## Capacidades

- Control visuomotor para manipulación robótica en el entorno LIBERO, con ajustes nativos de cámara, memoria y códec de acciones.
- Ejecución de políticas de acción sobre el runtime upstream InternW0-Delta LIBERO.
- Supervisión de localización mediante LDS durante el entrenamiento (cabezas descartadas en inferencia).
- Integración con activos congelados de generación visual (Wan2.2-TI2V-5B) y razonamiento visual (RynnBrain1.1-2B).
- No se documentan capacidades de generación de texto, tool calling, agentes conversacionales ni multilingüismo.

## Casos de uso

- Evaluación de referencia en benchmarks LIBERO: el checkpoint está pensado como política "all-train" para la evaluación principal del benchmark, permitiendo reproducir los resultados reportados por el autor con la configuración nativa.
- Investigación en supervisión de representaciones: útil para estudiar si la decodificabilidad lineal de variables de localización mejora la generalización en control visuomotor, comparando con el modelo base sin LDS.
- Reproducción de experimentos de robótica: el paquete incluye `dataset_stats.json`, `native_config.yaml` y `SHA256SUMS`, lo que facilita la verificación de integridad y la réplica exacta del entorno de evaluación.
- Análisis de ablación: al existir políticas separadas (RoboTwin-IF y scene-holdout), permite comparar el efecto de la composición del conjunto de entrenamiento sobre el rendimiento.
- Desarrollo de pipelines de manipulación con InternW0: sirve como punto de partida para ajuste fino en tareas LIBERO específicas reutilizando el runtime upstream.
- Estudio de arquitecturas compuestas en robótica: permite analizar el papel de los backbones congelados Wan2.2-TI2V-5B y RynnBrain1.1-2B en una política de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 12,4 GB, lo que da una cota inferior del espacio en disco necesario para pesos y activos auxiliares.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime upstream InternW0 (https://github.com/InternRobotics/InternW0); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LangGap-InternW0-Delta-LDS | no disponible | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Política con LDS, paso 1469 |
| InternRobotics/InternW0-Delta-Libero | no disponible | no disponible | no disponible | Hugging Face (modelo base) | Sin supervisión LDS |
| Política RoboTwin-IF (RuFlect) | no disponible | no disponible | no disponible | no disponible en la información | Variante separada del mismo autor |
| Política scene-holdout (RuFlect) | no disponible | no disponible | no disponible | no disponible en la información | Entrenada con escenas retenidas |

## Limitaciones y advertencias

- El propio autor advierte que este release no representa un split con escenas retenidas: se entrenó con todas las escenas con supervisión de localización, por lo que no debe usarse como evidencia de generalización a escenas no vistas.
- Es un checkpoint específico para evaluación de benchmark, no una política lista para producción.
- Requiere el runtime upstream InternW0 y los activos congelados Wan2.2-TI2V-5B y RynnBrain1.1-2B; sin ellos no es funcional.
- Las cabezas LDS se descartan en inferencia, de modo que la supervisión solo afecta al entrenamiento.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe (no aplicables directamente a una política de control, pero tampoco evaluados).
- Sin descargas ni likes registrados: ausencia de validación comunitaria independiente.
- La licencia Apache 2.0 permite uso comercial, pero la procedencia y licencia de los activos congelados subyacentes deben verificarse por separado.
- No se incluye estado del optimizador ni cachés de entrenamiento, lo que limita la reanudación del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RuFlect/LangGap-InternW0-Delta-LDS
- Modelo base: https://huggingface.co/InternRobotics/InternW0-Delta-Libero
- Implementación upstream InternW0: https://github.com/InternRobotics/InternW0
- Código LDS: https://github.com/RuFlect-Intelligence/Linear-Decodability-Supervision
- Activo congelado Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Activo congelado RynnBrain1.1-2B: https://huggingface.co/Alibaba-DAMO-Academy/RynnBrain1.1-2B
