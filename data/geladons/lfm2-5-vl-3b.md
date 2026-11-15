# geladons/LFM2.5-VL-3B

## Resumen

LFM2.5-VL-3B en formato LiteRT-LM es una conversión del modelo base LiquidAI/LFM2.5-VL-3B, un modelo vision-lenguaje de 3B parámetros desarrollado originalmente por Liquid AI. El bundle publicado por el usuario geladons empaqueta el modelo en el formato `.litertlm` de Google para permitir inferencia completamente local en dispositivos Android, sin dependencia de la nube ni de cuentas de usuario.

El modelo acepta una imagen junto con un prompt de texto y genera texto como salida, cubriendo el pipeline image-text-to-text. La conversión aplica cuantización int4 por bloques, reduciendo el peso del artefacto a 2,35 GB, lo que lo hace viable en teléfonos modernos con memoria unificada suficiente.

Su relevancia radica en que acerca capacidades multimodales a escenarios de edge computing: aplicaciones móviles que necesitan describir imágenes, responder preguntas sobre contenido visual o asistir en tareas de accesibilidad sin enviar datos a servidores externos. Al ser un artefacto derivado, las capacidades y limitaciones reales provienen del modelo base de Liquid AI, no del conversor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM2.5-VL-3B; arquitectura exacta no detallada en la informacion proporcionada) |
| Parametros totales | 3B (según nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 block-quantized (única variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | other (LFM Open License, heredada del modelo base) |
| Formato de pesos | `.litertlm` (LiteRT-LM runtime); tamano de repo 2,4 GB, artefacto 2,35 GB |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base LiquidAI/LFM2.5-VL-3B en la informacion proporcionada. El nombre sugiere un modelo vision-lenguaje de la familia LFM de Liquid AI con aproximadamente 3B parametros, pero no se especifica si emplea transformer denso, arquitectura híbrida o componentes de atención lineal, ni tampoco el volumen de tokens de entrenamiento, la composición del dataset o si se aplicaron fases de RLHF o DPO.

La innovación técnica destacable de este repositorio no reside en el entrenamiento sino en el despliegue: la conversión a LiteRT-LM mediante recetas del proyecto hf-to-litertlm y la cuantización int4 por bloques permiten ejecutar el modelo en Android con el SDK `com.google.ai.edge.litertlm`, cargando el archivo directamente en las clases `Engine`/`Conversation`. El artefacto es byte-idéntico al publicado en `geladons/local-ai-models`, que se mantiene por compatibilidad hacia atrás.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y diálogo multimodal.
- Procesamiento de imagen y prompt de texto en una sola conversación, según la modalidad declarada en la model card.
- Inferencia completamente on-device en Android mediante LiteRT-LM, sin llamadas a red.
- Integración en aplicaciones propias mediante el SDK LiteRT-LM (`Engine`/`Conversation`).
- Uso sin código mediante la aplicación Local AI de Google Play, que incluye el modelo en su catálogo integrado.
- Soporte de tool calling, agentes, modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Descripción de imágenes offline en aplicaciones móviles: el bundle permite generar descripciones de fotos capturadas por el usuario sin subir la imagen a ningún servidor, útil en apps de accesibilidad o catalogación personal.
- Asistente visual para personas con discapacidad visual: integrado en una app Android mediante el SDK LiteRT-LM, el modelo puede recibir una imagen de la cámara y producir una respuesta textual descriptiva en tiempo real, manteniendo los datos en el dispositivo.
- Moderación o etiquetado local de contenido visual: procesamiento de imágenes en el propio teléfono antes de sincronizarlas, reduciendo exposición de datos sensibles.
- Demostraciones y prototipos de IA multimodal sin infraestructura: usar la app Local AI como entorno de pruebas para evaluar el comportamiento del modelo antes de integrarlo en producto.
- Aplicaciones de campo con conectividad limitada: inspección visual asistida (por ejemplo, identificación de elementos en entornos rurales o industriales) donde no hay acceso estable a la nube.
- Educación y experimentación: entorno reproducible para que desarrolladores Android estudien el rendimiento de un VLM de 3B cuantizado a int4 en hardware consumer.
- Integración en pipelines de apps existentes: apuntar las clases `Engine`/`Conversation` del SDK al archivo `.litertlm` para añadir una funcionalidad de chat con imágenes a una aplicación ya publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 2,35 GB para el artefacto `.litertlm`, más overhead del runtime LiteRT-LM.
- Memoria: no se especifica un requisito mínimo de RAM en la model card; el tamaño del bundle int4 sugere que necesita un dispositivo Android con memoria unificada holgada, pero no se dispone de cifra oficial.
- GPU recomendadas: no aplica en el sentido de GPU de servidor; el destino es hardware móvil Android con aceleración disponible vía LiteRT-LM.
- Compatibilidad con GPU consumer (RTX 4090, etc.): no disponible; el formato está orientado a Android, no a escritorio.
- Opciones de despliegue: SDK LiteRT-LM (`com.google.ai.edge.litertlm`), app Local AI (Google Play), runtime en github.com/google-ai-edge/LiteRT-LM. vLLM, llama.cpp, Ollama o TGI no están indicados para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-VL-3B (LiteRT-LM, este repo) | 3B | no disponible | `.litertlm` int4 | LFM Open License | Hugging Face + Local AI |
| LiquidAI/LFM2.5-VL-3B (base) | 3B | no disponible | no disponible en la informacion | LFM Open License | Hugging Face |
| geladons/local-ai-models (copia byte-identica) | 3B | no disponible | `.litertlm` int4 | LFM Open License | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes ni con otros VLM de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo derivado: cualquier limitación del modelo base LiquidAI/LFM2.5-VL-3B (sesgos, alucinaciones, cobertura idiomática) se traslada intacta a este bundle.
- Riesgo de alucinación inherente a modelos generativos: las descripciones de imágenes pueden inventar detalles no presentes, especialmente con imágenes ambiguas o de baja calidad.
- Idiomas soportados no declarados: no se puede garantizar calidad multilingüe; conviene validar el idioma objetivo antes de producción.
- Contexto máximo no documentado: no es posible planificar conversaciones largas sin medir experimentalmente el límite real.
- Licencia "other" (LFM Open License): no es una licencia OSI estándar; deben revisarse los términos del enlace de licencia antes de uso comercial.
- Restricciones de plataforma: el artefacto está pensado para LiteRT-LM en Android; no es directamente utilizable con vLLM, llama.cpp, Ollama o TGI.
- Cuantización int4: puede degradar la precisión frente al modelo base en tareas que requieran matices finos, especialmente OCR o razonamiento visual complejo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria documentada.
- El artefacto principal está duplicado en `geladons/local-ai-models`; conviene fijar la fuente de descarga para evitar divergencias futuras.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/geladons/LFM2.5-VL-3B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Copia byte-idéntica: https://huggingface.co/geladons/local-ai-models
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Recetas de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- App Local AI (Google Play): https://play.google.com/store/apps/details?id=com.ochandydude.localai
- Licencia LFM Open License: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE
