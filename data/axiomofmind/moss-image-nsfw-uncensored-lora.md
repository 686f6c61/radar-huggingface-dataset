# axiomofmind/Moss-image-nsfw-uncensored-lora

## Resumen

Moss-image-nsfw-uncensored-lora es un adaptador LoRA de bajo rango publicado por el usuario axiomofmind sobre el modelo de generación de imagen texto-a-imagen MOSS-Image-SFT (OpenMOSS-Team). Su función es especializar el modelo base en la generación de fotografía de contenido adulto explícito, un dominio que los modelos fundacionales suelen filtrar o limitar mediante alineación y filtros de seguridad. El adaptador se activa con la palabra de disparo `moss_xvstyle` y se distribuye en formato diffusers/safetensors.

El repositorio acumula 3.737 descargas y 200 likes desde su publicación el 18 de octubre de 2026, con una actualización dos días después. Está etiquetado como `not-for-all-audiences` y `adult-content`, y su licencia declarada es apache-2.0. El tamaño del repositorio es de 27,4 GB, un valor atípico para un adaptador LoRA convencional, lo que sugiere que el repo puede incluir artefactos adicionales (imágenes de muestra, estados de entrenamiento o componentes del modelo base) que no se detallan en la información disponible.

La relevancia de esta ficha es fundamentalmente técnica y de evaluación: permite entender cómo se construye y despliega un adaptador LoRA sobre MOSS-Image, qué limitaciones documentales presenta (no hay datos de entrenamiento, benchmarks ni especificaciones del modelo base en la información proporcionada) y qué consideraciones legales y de política de contenido implica su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo de difusion texto-a-imagen MOSS-Image-SFT; la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | no disponible (adaptador LoRA; el repositorio ocupa 27,4 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagen; no se especifica la ventana del codificador de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (adaptador); licencia del modelo base no indicada en la informacion proporcionada |
| Formato de pesos | safetensors, integrado mediante la libreria diffusers |
| Pipeline | text-to-image |
| Modelo base | OpenMOSS-Team/MOSS-Image-SFT (relacion: adapter) |
| Palabra de disparo | `moss_xvstyle` |
| Tipo de adaptador | LoRA (template:sd-lora) |
| Tamano del repositorio | 27,4 GB |
| Descargas | 3.737 |
| Likes | 200 |
| Fecha de creacion | 2026-10-18 |
| Ultima actualizacion | 2026-10-20 |
| Etiquetas de contenido | nsfw, adult-content, not-for-all-audiences |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) acoplado al modelo base MOSS-Image-SFT. La técnica LoRA congela los pesos del modelo original e inserta matrices de baja dimensión en determinadas capas, de modo que el adaptador aprende un desplazamiento de los pesos con un coste de almacenamiento y entrenamiento muy inferior al de un ajuste completo. El resultado se carga junto al modelo base en un pipeline de diffusers y modifica el comportamiento generativo mediante la palabra de disparo `moss_xvstyle`.

No se dispone de información sobre el conjunto de datos de entrenamiento: no se indica el número de imágenes, su procedencia, la composición del dataset, si hubo filtrado, si se emplearon técnicas de regularización o si el entrenamiento incluyó etapas de ajuste con preferencias humanas. Tampoco se documentan hiperparámetros del LoRA (rango, alpha, capas objetivo), resolución de entrenamiento, número de pasos ni hardware utilizado. La model card se interrumpe al enlazar el modelo base, por lo que la información técnica sobre el proceso de entrenamiento es prácticamente inexistente.

Como innovación destacable, el adaptador actúa como mecanismo de "desbloqueo" de un dominio concreto —fotografía adulta explícita— sobre un modelo que presumiblemente incorpora barreras de seguridad. No se documenta ninguna técnica adicional de decodificación, atención lineal o muestreo específico más allá del uso estándar de LoRA sobre el pipeline base.

## Capacidades

- Generación de imagen texto-a-imagen fotorrealista en el dominio de contenido adulto explícito, condicionada por la palabra de disparo `moss_xvstyle`.
- Especialización estilística y compositiva: los ejemplos de la model card describen planos corporales concretos, ángulos de cámara, iluminación suave y fondos interiores desenfocados, lo que indica un ajuste orientado a un estilo fotográfico consistente.
- Control mediante prompts descriptivos largos y detallados (cuerpo, ropa, postura, entorno, luz, tipo de plano).
- Compatibilidad con el ecosistema diffusers, lo que permite combinar el adaptador con el pipeline del modelo base.
- Capacidades multilingües: no disponibles.
- Soporte de tool calling, function calling, agentes o razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Modo "thinking", visión o audio: no disponible.
- No se documentan capacidades de edición de imagen, inpainting, outpainting ni control estructural (ControlNet, IP-Adapter).

## Casos de uso

- Investigación sobre alineación y filtrado de seguridad: el adaptador sirve como caso de estudio para medir hasta qué punto un LoRA puede recuperar un dominio que el modelo base filtra, y para evaluar la robustez de los clasificadores de contenido.
- Auditoría de modelos generativos: equipos de confianza y seguridad pueden emplear este adaptador como muestra de referencia para construir y validar detectores de contenido explícito, verificando su tasa de falsos positivos y negativos.
- Estudio de sesgos en generación de imagen: el adaptador permite analizar qué representaciones corporales, géneros, etnias y encuadres reproduce un ajuste entrenado sobre un dataset no documentado, útil para investigación en fairness.
- Pruebas de pipelines de moderación en plataformas: simular cargas de trabajo con contenido sensible para verificar que los filtros de entrada y salida, el etiquetado y la cuarentena de contenido funcionan correctamente antes de exponer un servicio.
- Desarrollo de herramientas de control parental y verificación de edad: generar muestras controladas para probar sistemas de detección y bloqueo en entornos cerrados y con acceso restringido.
- Evaluación comparativa de adaptadores LoRA: medir calidad fotográfica, coherencia anatómica y fidelidad al prompt frente a otros adaptadores del mismo dominio, usando protocolos de evaluación con revisión humana.
- Docencia sobre licencias y ética de modelos abiertos: analizar el desacoplamiento entre la licencia permisiva del adaptador (apache-2.0) y las restricciones legales y de política de plataforma aplicables al contenido generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No constan métricas objetivas como FID, CLIP score, ImageReward, ni evaluaciones de calidad o de alineación con el prompt. Tampoco se documentan comparaciones cuantitativas con otros adaptadores o con el modelo base sin LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un adaptador, el requisito dominante es el del modelo base MOSS-Image-SFT, cuyas necesidades de VRAM no se detallan en la información proporcionada.
- GPU recomendadas: no disponible. No se especifican GPU de referencia ni configuraciones probadas por el autor.
- Compatibilidad con GPU de consumo: no confirmada. Dependerá del tamaño y precisión del modelo base, dato no documentado.
- Opciones de despliegue: la librería declarada es diffusers, por lo que el adaptador se cargaría sobre el pipeline de MOSS-Image-SFT mediante la API de LoRA de diffusers. No se confirma soporte para ComfyUI, llama.cpp, vLLM, TGI ni Ollama (estas dos últimas no aplican a modelos de difusión).
- Latencia y throughput: no disponibles.
- Nota sobre el tamaño: los 27,4 GB del repositorio no permiten inferir la VRAM necesaria sin conocer qué artefactos contiene y qué proporción corresponde al adaptador frente a posibles copias del modelo base o imágenes de muestra.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axiomofmind/Moss-image-nsfw-uncensored-lora | LoRA sobre MOSS-Image-SFT | no disponible | no aplica | apache-2.0 | HuggingFace, diffusers |
| OpenMOSS-Team/MOSS-Image-SFT (modelo base) | Difusion texto-a-imagen | no disponible | no disponible | no indicada en la informacion | HuggingFace |
| Otros LoRA NSFW para modelos de difusion | LoRA | no disponible | no aplica | variable | HuggingFace y comunidades afines |

No se dispone de datos de rendimiento, parámetros ni contexto de los modelos comparables en la información proporcionada, por lo que la comparación se limita a tipo de artefacto, licencia y disponibilidad. No se han identificado en la búsqueda adaptadores LoRA equivalentes construidos específicamente sobre MOSS-Image-SFT.

## Limitaciones y advertencias

- Contenido para adultos: el repositorio está marcado como `not-for-all-audiences` y `adult-content`. La generación de material explícito conlleva obligaciones legales de verificación de edad, consentimiento y cumplimiento normativo que varían por jurisdicción.
- Riesgo de uso indebido: un adaptador que elimina filtros puede emplearse para generar contenido sexual no consentido, deepfakes o material de abuso. Es imprescindible implantar controles de identidad, listas de bloqueo y revisión humana en cualquier despliegue.
- Dataset no documentado: se desconoce la procedencia de las imágenes de entrenamiento y si existió consentimiento de las personas representadas, lo que afecta a la trazabilidad y al riesgo legal.
- Sesgo de representación: los ejemplos de la model card muestran de forma consistente mujeres jóvenes, de piel clara, en encuadres desde atrás y con un repertorio corporal limitado. Es esperable un sesgo de género, edad, etnia y tipología corporal.
- Alucinación anatómica: como todo modelo de difusión, puede producir errores en manos, extremidades y anatomía, especialmente en composiciones complejas o con múltiples sujetos.
- Fidelidad al prompt: no hay métricas que cuantifiquen la adherencia al texto; los prompts largos y muy detallados pueden producir desviaciones.
- Idiomas: no se especifican los idiomas soportados por el codificador de texto; el autor solo proporciona ejemplos en inglés.
- Licencia: el adaptador declara apache-2.0, permisiva para uso comercial, pero la licencia del modelo base no se indica en la información disponible y debe verificarse antes de cualquier explotación comercial. Una licencia permisiva sobre el adaptador no exime de responsabilidad por el contenido generado.
- Ausencia de documentación técnica: no hay información sobre hiperparámetros, evaluación, limitaciones declaradas por el autor ni proceso de curación del dataset, lo que dificulta la reproducción y la evaluación rigurosa.
- Política de plataformas: muchos proveedores de servicios en la nube y marketplaces prohíben el alojamiento de contenido explícito, lo que puede impedir el despliegue en infraestructuras gestionadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axiomofmind/Moss-image-nsfw-uncensored-lora
- Modelo base MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Repositorio de la librería diffusers: no incluido en la información proporcionada
- Paper o blog técnico del modelo base: no incluido en la información proporcionada
- Demo o espacio asociado: no incluido en la información proporcionada
