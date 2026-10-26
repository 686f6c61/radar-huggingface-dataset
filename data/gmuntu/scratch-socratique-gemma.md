# gmuntu/scratch-socratique-gemma

## Resumen

`gmuntu/scratch-socratique-gemma` es una copia (mirror) del modelo `litert-community/Gemma3-1B-IT` publicada por el usuario gmuntu para ser consumida por la aplicación Scratch Socratique. No se trata de un modelo entrenado o afinado por el autor: la propia model card indica que es una «copie du modèle» del citado modelo de LiteRT Community, distribuida bajo los Gemma Terms of Use de Google. Por tanto, sus capacidades técnicas son las del modelo base Gemma 3 1B en su variante instruction-tuned.

El interés de la ficha es limitado desde el punto de vista de la investigación: el repositorio no incluye documentación técnica propia, no declara pipeline, licencia ni idiomas en los metadatos de HuggingFace, y registra 0 descargas y 0 likes en el momento de la consulta. Su relevancia es práctica: ejemplifica el patrón de redistribución de un modelo pequeño (aproximadamente 1 000 millones de parámetros) en formato LiteRT para inferencia en dispositivo dentro de una aplicación educativa concreta.

El tamaño del repositorio es de 0,7 GB, coherente con pesos cuantizados para ejecución en CPU o en hardware de gama baja, aunque la información disponible no detalla el esquema de cuantización ni los archivos exactos incluidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 1B IT; no detallada en la model card de esta copia) |
| Parámetros totales | 1B (según el nombre del modelo base, `Gemma3-1B-IT`); no confirmado en la model card |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Gemma 3 1B declara 32 768 tokens en su documentación pública, sin confirmar en esta copia) |
| Tipos de cuantización | No disponible; el tamaño de 0,7 GB es compatible con pesos cuantizados, pero no se especifica el esquema |
| Idiomas soportados | No disponible en los metadatos ni en la model card (el modelo base declara soporte multilingüe en su documentación pública) |
| Licencia | Gemma Terms of Use (indicada en la model card); el campo de licencia de HuggingFace aparece como «no disponible» |
| Formato de pesos | No disponible con detalle; el modelo de origen es de la familia LiteRT (`litert-community`), lo que apunta a formato `.task`/LiteRT, aunque no se listan archivos |

## Arquitectura y entrenamiento

La información proporcionada no contiene detalles de arquitectura ni de entrenamiento propios. La model card se limita a indicar que se trata de una copia de `litert-community/Gemma3-1B-IT`, es decir, la variante de 1 000 millones de parámetros de Gemma 3 en versión instruction-tuned, empaquetada por LiteRT Community para inferencia en dispositivo. Cualquier detalle sobre composición del dataset, número de tokens de entrenamiento, fases de alineación (RLHF/DPO) o innovaciones técnicas debe consultarse en la documentación del modelo base y en el informe técnico de Gemma 3, no en este repositorio.

No se documenta ningún proceso de ajuste fino, destilación ni modificación de pesos por parte de gmuntu. La operación realizada es de redistribución para un caso de uso concreto (la aplicación Scratch Socratique), sin que se especifiquen los cambios de empaquetado aplicados.

## Capacidades

- Generación de texto conversacional en modo instruction-tuned, heredada del modelo base Gemma 3 1B IT.
- Razonamiento básico de un solo turno y multi-turno dentro de la ventana de contexto del modelo base.
- Capacidad multilingüe: no confirmada en esta copia; el modelo base declara soporte de múltiples idiomas en su documentación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o thinking mode: no disponibles en la información proporcionada (la variante de 1B del modelo base es de texto).
- Ejecución en dispositivo mediante el runtime LiteRT, orientada a aplicaciones móviles y de escritorio sin GPU dedicada.

## Casos de uso

- Tutoría socrática embebida en aplicación educativa: el modelo se usaría para formular preguntas guía al alumnado en lugar de dar respuestas directas, aprovechando su tamaño reducido para ejecutarse localmente en el dispositivo del usuario sin enviar datos a la nube. Es el caso de uso declarado por el autor mediante el nombre del repositorio.
- Asistente de programación por bloques (Scratch): generación de explicaciones paso a paso sobre fragmentos de proyectos y depuración de errores lógicos en programas visuales, con latencia aceptable en CPU.
- Aplicaciones educativas offline en aulas sin conectividad: al caber en menos de 1 GB de almacenamiento, puede distribuirse con la aplicación y funcionar sin red, lo que simplifica el cumplimiento de normativa de protección de datos de menores.
- Prototipado rápido de chatbots de dominio acotado: útil para validar flujos conversacionales antes de invertir en modelos mayores, dado el bajo coste de despliegue en hardware de gama media.
- Procesamiento de texto en el borde (edge computing): resumen y reescritura de notas cortas en aplicaciones móviles donde no se permite el envío de contenido a servidores externos.
- Filtrado y clasificación previa en pipelines: primera pasada de clasificación o etiquetado de textos breves para reducir el volumen enviado a un modelo mayor, con un coste computacional muy bajo.
- Base para experimentos de ajuste fino ligero (LoRA/QLoRA): al disponer de los pesos derivados del modelo base, puede servir como punto de partida para especializaciones docentes, siempre respetando los Gemma Terms of Use.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas y los resultados de búsqueda web no aportan datos técnicos sobre este repositorio. Cualquier cifra de MMLU, GSM8K o HumanEval debería tomarse de la documentación oficial de Gemma 3 1B IT, no de esta copia, y no se reproduce aquí para no atribuir métricas no verificadas al repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 0,7 GB de repositorio, la inferencia cuantizada requeriría del orden de 1 GB de memoria; en precisión bf16 los pesos del modelo base rondarían los 2 GB, con un consumo total de 3-4 GB incluyendo el contexto.
- GPU recomendadas: no especificadas por el autor. Para la variante LiteRT el objetivo es CPU/NPU en dispositivo; para servidor, una RTX 4090 o A100 está sobredimensionada para 1B de parámetros.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), aunque no hay confirmación oficial de compatibilidad con estos entornos.
- Despliegue: el formato de origen (LiteRT) apunta a Google AI Edge / MediaPipe para Android, iOS, web y escritorio. El uso con vLLM, TGI, llama.cpp u Ollama no está confirmado en la información disponible y probablemente requiera conversión previa de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Datos de la documentación pública de cada modelo; no verificados en este repositorio.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `gmuntu/scratch-socratique-gemma` (copia de Gemma 3 1B IT) | 1B | No disponible (32 768 en el base, sin confirmar) | Gemma Terms of Use | HuggingFace, 0 descargas |
| Gemma 3 1B IT (`litert-community`) | 1B | 32 768 | Gemma Terms of Use | HuggingFace, formato LiteRT |
| Llama 3.2 1B Instruct | 1B | 128 000 | Llama 3.2 Community License | HuggingFace, amplio ecosistema |
| Qwen2.5 1.5B Instruct | 1,5B | 32 768 | Apache 2.0 | HuggingFace, amplio ecosistema |
| SmolLM2 1.7B Instruct | 1,7B | 8 192 | Apache 2.0 | HuggingFace, orientado a dispositivo |

## Limitaciones y advertencias

- Repositorio sin documentación técnica propia: no hay pipeline declarado, ni idiomas, ni licencia en los metadatos de HuggingFace, lo que dificulta la trazabilidad y el cumplimiento normativo.
- Es una copia no verificada del modelo base: el autor no documenta el proceso de conversión ni garantiza la integridad de los pesos respecto al original.
- Licencia: los Gemma Terms of Use imponen obligaciones específicas de uso (restricciones de uso aceptable, obligaciones de atribución y cláusulas de terminación). Cualquier uso comercial debe revisarse contra dichos términos; el campo de licencia de HuggingFace figura como «no disponible».
- Riesgo de alucinación: inherente a un modelo de 1B de parámetros; la fiabilidad en tareas de razonamiento complejo o conocimiento factual es limitada y no debe usarse como fuente de verdad.
- Sesgos: no evaluados en esta copia; el modelo base puede reproducir sesgos de sus datos de entrenamiento.
- Limitación de idioma: el soporte de castellano no está confirmado en la información disponible; debe validarse empíricamente antes de desplegarlo en producción.
- Capacidad de contexto: no confirmada; si se hereda la del modelo base, 32 768 tokens, insuficiente para documentos extensos o conversaciones muy largas.
- Sin métricas de rendimiento ni evaluación de seguridad publicadas, lo que impide comparar su calidad frente a alternativas.
- Al tratarse de un modelo pequeño, no es adecuado para tareas que requieran tool calling fiable, agentes autónomos o generación de código en producción sin supervisión.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/gmuntu/scratch-socratique-gemma
- Modelo base: https://huggingface.co/litert-community/Gemma3-1B-IT
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Resultados de búsqueda web: sin enlaces relevantes; las búsquedas devolvieron únicamente contenido no relacionado con el modelo, por lo que no se incluyen.
