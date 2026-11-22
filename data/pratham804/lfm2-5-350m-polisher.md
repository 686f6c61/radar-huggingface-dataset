# Pratham804/lfm2.5-350m-polisher

## Resumen

LFM2.5-350M Polisher es un ajuste fino (fine-tune) del modelo base LiquidAI/LFM2.5-350M, desarrollado por el usuario independiente Pratham804. Su propósito es muy concreto: convertir texto dictado, con muletillas, falsos arranques y fragmentos desordenados, en prosa escrita limpia y bien puntuada. No es un modelo de propósito general, sino una herramienta especializada de edición de texto orientada a flujos de dictado por voz.

El modelo se distribuye en formato GGUF para llama.cpp y está pensado para ejecutarse en CPU, sin necesidad de GPU. Con cuantización Q6_K ocupa 279,8 MB y con Q4_K_M, 218,7 MB, lo que lo hace apto para despliegue en dispositivos de gama baja, portátiles o incluso entornos integrados. Esto lo convierte en una opción relevante para aplicaciones de accesibilidad, herramientas de productividad y pipelines de post-procesado de transcripciones donde el coste computacional y la privacidad son críticos.

La relevancia actual del modelo reside en su enfoque de destilación: un editor de mayor tamaño (LFM3-1.7B) generó los datos de entrenamiento, que luego se destilaron en un adaptador LoRA sobre el modelo de 350M. El resultado es un modelo pequeño con capacidades de edición sorprendentemente específicas, aunque con limitaciones documentadas por el propio autor, como la ocasional invención de cláusulas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en LFM2.5-350M de Liquid AI) |
| Parametros totales | 350M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (recomendada, 279,8 MB), Q4_K_M (218,7 MB) |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (uso comercial permitido para entidades con ingresos anuales inferiores a 10M USD) |
| Formato de pesos | GGUF (para llama.cpp); adaptador LoRA en `adapter_v20_distill/` |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del LFM2.5-350M de Liquid AI, un transformer de 350 millones de parámetros. Sobre esta base se entrenó un adaptador LoRA con rango 32 aplicado a las proyecciones de atención y MLP. El método de entrenamiento fue destilación: un editor interno de mayor tamaño (LFM3-1.7B) generó 797 objetivos de reescritura sobre entradas dictadas sintéticas. Estos objetivos fueron verificados para garantizar que no introdujeran números ni palabras de contenido ausentes en la entrada, y se mezclaron con pares generados por reglas y ejemplos dorados escritos a mano.

Una innovación destacable es el uso de un post-procesador determinista (`polish_postprocess.py`) para gestionar los saltos de párrafo, ya que el modelo de 350M no es fiable en la colocación de líneas en blanco. Este script aplica reglas heurísticas: mantiene oraciones relacionadas en un mismo párrafo, rompe solo en marcadores discursivos, evita párrafos huérfanos de una sola oración y respeta las listas de viñetas. En pruebas, redujo 26 párrafos a 16 en 12 muestras de salida sin alterar las listas.

## Capacidades

- Edición de texto dictado: elimina muletillas y falsos arranques ("so basically", "you know", "like"), fusiona fragmentos de oraciones y repara gramática e idioms.
- Corrección de compuestos y nombres de productos: añade guiones a modificadores compuestos ("jump-scary", "high-quality") y corrige nombres como "graphics card".
- Conversión de enumeraciones en línea a listas de viñetas, incluso cuando la lista se extiende a lo largo de varias oraciones.
- Preservación de hechos, números, nombres y cantidades: el modelo está entrenado para no añadir contenido.
- Mantenimiento del registro coloquial y las contracciones: no convierte el habla informal en lenguaje corporativo.
- Generación de texto (pipeline text-generation), aunque su uso previsto es exclusivamente la edición.
- No soporta tool calling ni function calling de forma nativa.
- No está diseñado para razonamiento multi-paso ni para agentes.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Post-procesado de dictado por voz: el modelo recibe la transcripción cruda de un sistema de reconocimiento de voz y devuelve prosa editada, eliminando muletillas y reparando la gramática. Es adecuado porque está entrenado específicamente para esta tarea y cabe en CPU.
- Herramientas de accesibilidad: personas con movilidad reducida que dependen del dictado pueden usar el modelo para generar texto escrito limpio y publicable sin intervención manual extensa.
- Edición de notas de reuniones: a partir de transcripciones automáticas, el modelo convierte enumeraciones desordenadas en listas de viñetas y unifica el estilo, manteniendo los datos factuales.
- Aplicaciones de productividad offline: al ser un GGUF de menos de 300 MB, puede integrarse en aplicaciones de escritorio o móviles que funcionen sin conexión y sin GPU, preservando la privacidad del usuario.
- Preprocesado para pipelines de NLP: antes de enviar texto a un modelo mayor para resumen o análisis, el polisher limpia y estructura la entrada, reduciendo ruido y mejorando la calidad de las representaciones posteriores.
- Generación de documentación técnica a partir de explicaciones habladas: el modelo corrige términos técnicos y compuestos, y convierte listas habladas en listas formateadas, lo que facilita la creación de borradores de documentación.
- Corrección de estilo en correos electrónicos dictados: mantiene el registro casual pero mejora la claridad y la puntuación, adecuado para comunicaciones informales que requieren cierta pulcritud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona una prueba de aceptación de 12 casos en la que 3 añadieron detalles no presentes en la entrada, pero no se proporcionan métricas cuantitativas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo está diseñado para ejecutarse en CPU.
- GPU recomendadas: no aplica; cualquier GPU compatible con llama.cpp puede usarse, pero no es necesario.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM, aunque el uso previsto es CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y cualquier herramienta compatible con GGUF como Ollama o text-generation-webui.
- Latencia y throughput estimados: no disponibles. El tamaño reducido (218,7 MB en Q4_K_M) sugiere latencias bajas en CPU modernas, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| LFM2.5-350M Polisher | 350M | no disponible | LFM Open License v1.0 | GGUF | Edición de dictado |
| LFM2.5-350M (base) | 350M | no disponible | LFM Open License v1.0 | safetensors, GGUF | Generación de texto general |
| Modelos de edición tipo GECToR | ~100-500M | no disponible | varía | PyTorch | Corrección gramatical |
| Modelos de limpieza de texto comerciales | no disponible | no disponible | propietaria | API | Post-procesado de ASR |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo ocasionalmente inventa una cláusula: en la prueba de aceptación de 12 casos, 3 añadieron un detalle no presente en la entrada. La salida debe tratarse como borrador para revisión, no como transcripción verificada.
- Los saltos de párrafo no los gestiona el modelo, sino el script `polish_postprocess.py`; sin él, el formato de párrafos puede ser inconsistente.
- Entrenado exclusivamente para edición de inglés en dictados cortos y medios; no es un resumidor, traductor ni verificador de hechos.
- La licencia LFM Open License v1.0 permite uso comercial solo a entidades con ingresos anuales inferiores a 10M USD; para usos comerciales mayores es necesario revisar los términos.
- El modelo no está afiliado, respaldado ni patrocinado por Liquid AI; "LFM" y "Liquid AI" se usan solo para describir el origen del modelo base.
- Riesgo de sesgos: al estar entrenado con datos sintéticos generados por un modelo mayor, puede heredar sesgos de ese editor, aunque no se documentan sesgos específicos.
- Limitación de contexto: no se especifica la longitud de contexto, pero al ser un modelo de 350M es probable que sea limitada; no apto para documentos largos.
- No soporta tool calling ni agentes, por lo que no debe usarse en pipelines que requieran interacción con herramientas externas.

## Enlaces

- [Hugging Face: Pratham804/lfm2.5-350m-polisher](https://huggingface.co/Pratham804/lfm2.5-350m-polisher)
- [Modelo base: LiquidAI/LFM2.5-350M](https://huggingface.co/LiquidAI/LFM2.5-350M)
- [Licencia LFM Open License v1.0](https://huggingface.co/LiquidAI/LFM2.5-350M/blob/main/LICENSE)
- [Repositorio llama.cpp](https://github.com/ggerganov/llama.cpp) (herramienta de despliegue recomendada)
