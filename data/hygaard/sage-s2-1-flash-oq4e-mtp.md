# Hygaard/Sage-S2.1-Flash-oQ4e-mtp

## Resumen

Sage-S2.1-Flash-oQ4e-mtp es una conversión cuantizada en formato MLX del modelo multimodal y agéntico Sage S2.1 Flash, desarrollado por el Shanghai Artificial Intelligence Laboratory (InternLM) sobre la arquitectura GLM-5.3-Flash de Z.ai. La conversión la firma el usuario Hygaard y aplica una política de precisión mixta denominada oQ4e (oQe), orientada a la ejecución nativa en Apple Silicon. El modelo base está diseñado para tareas científicas multimodales y flujos agénticos, con soporte de imagen-a-texto y decodificación multi-token (MTP).

La relevancia de esta ficha es doble. Por un lado, documenta una conversión comunitaria de un modelo de laboratorio con licencia MIT, lo que facilita su uso comercial y su experimentación. Por otro lado, el repositorio se publica como borrador privado: la conversión, la validación nativa y la subida de pesos están pendientes, y la propia model card indica que permanecerá privado hasta que el cuantizado completo esté subido y verificado. Cualquier dato de tamaño, precisión efectiva o rendimiento figura como pendiente en la información disponible.

La arquitectura subyacente es un transformer de mezcla de expertos (MoE) con atención lineal, componentes de hiperconexión y un bloque MTP, además de un codificador visual y proyectores científicos que se preservan sin modificar. No se dispone de número de parámetros, longitud de contexto ni resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (GLM-5.3-Flash) con atención lineal, hiperconexiones y bloque MTP; incluye codificador visual |
| Parametros totales | no disponible (pendiente de auditoría de cabeceras) |
| Parametros activos | no disponible (modelo MoE con expertos enrutados y expertos compartidos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (precisión mixta oQe); variantes hermanas oQ5e y oQ3e |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (cuantización de precisión mixta) |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura GLM-5.3-Flash, un transformer de mezcla de expertos que combina expertos enrutados con expertos compartidos, proyecciones de atención con componentes de atención lineal y convoluciones asociadas, mecanismos de hiperconexión, controles de decaimiento recurrente y un bloque de predicción multi-token (MTP) con proyección de fusión propia. Incorpora además un codificador visual y proyectores específicos para modalidades científicas, que la conversión preserva sin alterar. La model card menciona también componentes de indexación con pooling y compresión.

La conversión parte del checkpoint BF16 del modelo original (con tensores FP32 conservados donde aplica), fijado en el commit `76f4513db7464485605a002a06a6190de0460574`, y no de la versión FP8 ni de otro cuantizado. Se aplica una política oQ4e de precisión mixta con calibración específica para Sage: recogida de importancias y sensibilidad por nivel de precisión (rung). Cada nivel de precisión se convierte de forma independiente desde el checkpoint original. No se contempla entrenamiento, ablación ni poda de expertos; se conserva el conjunto completo de expertos, el codificador visual, el MTP, el tokenizer, el processor y la plantilla de chat originales. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni etapas de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto y razonamiento en un modelo de tipo multimodal imagen-texto (pipeline `image-text-to-text`).
- Procesamiento de imágenes mediante codificador visual preservado en la conversión.
- Capacidades científicas multimodales: la model card menciona proyectores científicos y la necesidad de encoders SciPerception, preprocesamiento e integración de prompt-embeddings para habilitar esas rutas.
- Decodificación multi-token (MTP) para acelerar la generación.
- Comportamiento agéntico: el modelo base se describe como agéntico, aunque la información disponible no detalla soporte explícito de tool calling ni de razonamiento multi-paso.
- Tokenizer propio de Sage: trata las grafías de tokens de control dentro del contenido de los mensajes como texto ordinario; debe mantenerse junto con el processor y la plantilla de chat.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Experimentación en Apple Silicon: la conversión MLX permite ejecutar el modelo en Macs con memoria unificada, lo que facilita probar un MoE multimodal de laboratorio sin infraestructura CUDA. La model card prevé pruebas en un Mac de 256 GB.
- Investigación científica asistida: con los proyectores y los encoders SciPerception correspondientes, el modelo puede emplearse para tareas de percepción y razonamiento sobre datos científicos multimodales.
- Análisis de documentos con imágenes: el pipeline imagen-texto permite extraer y razonar sobre contenido visual combinado con texto, útil en revisión de literatura o informes técnicos.
- Desarrollo de agentes locales: el carácter agéntico del modelo base y la preservación de la plantilla de chat permiten construir prototipos de agentes que operen íntegramente en local.
- Evaluación de cuantizaciones: las variantes oQ3e, oQ4e y oQ5e permiten comparar el equilibrio entre precisión y memoria en un mismo modelo, útil para decidir despliegues en hardware limitado.
- Despliegue con licencia permisiva: al estar bajo MIT, puede integrarse en productos comerciales y modificarse, siempre que se conserven las atribuciones upstream.
- Prototipado de asistentes multimodales: la combinación de visión y generación de texto sirve para asistentes que interpretan capturas, diagramas o figuras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: no disponible; el tamaño de pesos y el BPW efectivo están pendientes de la auditoría de cabeceras del cuantizado.
- Hardware objetivo declarado: Apple Silicon, con pruebas previstas en un Mac de 256 GB de memoria unificada.
- Compatibilidad con GPU NVIDIA: no disponible; el formato es MLX safetensors y el runtime objetivo es una implementación MLX que soporte `glm5_next` y precisión mixta oQe.
- Cabe en GPU de consumo: no disponible; depende del tamaño final del cuantizado, aún no publicado.
- Opciones de despliegue: runtime MLX con soporte de `glm5_next` y oQe; no se documentan vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: no disponibles; se reportarán tras la validación nativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Sage-S2.1-Flash-oQ4e-mtp | no disponible | no disponible | MLX safetensors (oQ4e) | MIT | Borrador privado, conversión pendiente |
| Sage-S2.1-Flash-oQ5e-mtp | no disponible | no disponible | MLX safetensors (oQ5e) | MIT | Variante de mayor precisión del mismo autor |
| Sage-S2.1-Flash-oQ3e-mtp | no disponible | no disponible | MLX safetensors (oQ3e) | MIT | Variante de menor precisión del mismo autor |
| internlm/Sage-S2.1-Flash | no disponible | no disponible | BF16 (formato original) | MIT | Modelo base de referencia |

No se dispone de datos de rendimiento ni de parámetros para comparar con modelos de otras familias; la comparación se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- El repositorio es un borrador privado: la conversión, la validación nativa y la subida de pesos están pendientes, por lo que no debe asumirse que los archivos publicados sean funcionales.
- No hay datos publicados de parámetros, contexto, idiomas ni benchmarks; cualquier estimación de rendimiento sería especulativa.
- El tokenizer es propio de Sage: sustituirlo por el tokenizer estándar de GLM altera el comportamiento del modelo. Tokenizer, processor y plantilla de chat deben mantenerse juntos.
- Las rutas científicas multimodales requieren los encoders SciPerception, el preprocesamiento y la integración de prompt-embeddings; conservar solo los proyectores no habilita esas capacidades en un servidor MLX.
- El modelo base puede presentar sesgos y alucinaciones propios de los modelos de lenguaje; no se documentan evaluaciones de seguridad ni de sesgo en la información disponible.
- La licencia MIT permite uso comercial, pero deben conservarse las atribuciones upstream y los avisos aplicables.
- El soporte se limita a Apple Silicon mediante MLX; no hay evidencia de funcionamiento en otras plataformas.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/Hygaard/Sage-S2.1-Flash-oQ4e-mtp
- Modelo base: https://huggingface.co/internlm/Sage-S2.1-Flash
- Model card del commit fijado: https://huggingface.co/internlm/Sage-S2.1-Flash/blob/76f4513db7464485605a002a06a6190de0460574/README.md
- Variante oQ5e: https://huggingface.co/Hygaard/Sage-S2.1-Flash-oQ5e-mtp
- Variante oQ3e: https://huggingface.co/Hygaard/Sage-S2.1-Flash-oQ3e-mtp
