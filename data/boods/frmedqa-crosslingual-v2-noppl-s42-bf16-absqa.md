# boods/FrMedQA-CrossLingual-v2-NoPPL-s42-bf16-AbsQA

## Resumen

FrMedQA-CrossLingual-v2-NoPPL-s42-bf16-AbsQA es un repositorio de pesos publicado en Hugging Face por el usuario boods, perteneciente a la familia FrMedQA-CrossLingual-v2, una serie de variantes orientadas a tareas de pregunta-respuesta (QA) en el ámbito médico con planteamiento cross-lingual. El identificador del repositorio codifica la configuración del experimento: "NoPPL" apunta a un filtrado de datos sin perplejidad, "s42" a la semilla 42, "bf16" a precisión bfloat16 y "AbsQA" a respuesta abstractiva. Estas lecturas son deducciones del nombre del repositorio, no confirmadas por el autor, ya que la model card está sin rellenar.

El repositorio se distribuye a través de la librería transformers con pesos en safetensors y tiene un tamaño de 0,5 GB. La etiqueta `unsloth` indica que el ajuste se hizo con esa librería de entrenamiento eficiente, y la existencía de una variante hermana con sufijo `qlora` sugiere un flujo de trabajo de fine-tuning con cuantización de 4 bits y posterior exportación. No se declara licencia, idiomas, arquitectura base ni procedencia de los datos de entrenamiento.

La relevancia práctica del modelo es limitada en su estado actual: se trata de un artefacto de investigación sin documentación, sin benchmarks, sin licencia explícita y con cero descargas en el momento de redactar esta ficha. Resulta utilizable únicamente como punto de partida para reproducir o auditar un experimento de ajuste fino en QA médica, no como componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no declarada; por el uso de transformers y unsloth se trataría de un transformer decoder-only, sin confirmar) |
| Parametros totales | no disponible (no determinable con los datos aportados; ver nota más abajo) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repositorio; el mismo autor publica una variante con sufijo `qlora` |
| Idiomas soportados | no disponible (el nombre del repositorio sugiere francés e inglés por el término "CrossLingual", sin confirmar) |
| Licencia | no disponible (la model card indica "More Information Needed"; la etiqueta `region:us` no implica licencia) |
| Formato de pesos | safetensors |

Nota sobre el tamaño: el repositorio ocupa 0,5 GB. Con esa cifra caben dos hipótesis incompatibles entre sí y ninguna verificable a partir de la información disponible: (a) un modelo fusionado en bf16 de aproximadamente 250 millones de parámetros (0,5 GB / 2 bytes por parámetro), o (b) únicamente un adaptador LoRA de rango alto sobre un modelo base mayor. La información proporcionada no permite decidir cuál es correcta.

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura, los datos de entrenamiento, el número de tokens, la composición del dataset ni la existencia de fases de RLHF o DPO. La model card del autor es la plantilla automática de Hugging Face y todos los campos relevantes aparecen con el marcador "More Information Needed". El tag `arxiv:1910.09700` que figura en los metadatos corresponde a Lacoste et al. (2019), el artículo de referencia del calculador de impacto de carbono citado en la propia plantilla, y no describe el modelo ni su método de entrenamiento.

Los únicos elementos técnicos verificables son indirectos: la librería declarada es transformers, el formato de pesos es safetensors, el tag `unsloth` apunta a un ajuste fino con esa herramienta (habitualmente QLoRA o LoRA sobre un modelo preentrenado) y el sufijo `bf16` del nombre indica que la exportación se hizo en bfloat16. El sufijo `AbsQA` sugiere un objetivo de generación abstractiva (respuesta libre) frente a extracción de fragmentos. La ausencia de cualquier campo de hiperparámetros, régimen de precisión mixta o infraestructura de cómputo impide confirmar cualquiera de estas deducciones.

## Capacidades

- Generación de respuestas a preguntas de dominio médico: es la única capacidad que se deduce del nombre del repositorio (`AbsQA`), sin documentación de respaldo.
- Procesamiento cross-lingual: el identificador incluye "CrossLingual", lo que apunta a pares de idiomas, presumiblemente francés e inglés. No se especifica la dirección de la transferencia ni los pares soportados.
- Generación de texto general, razonamiento, código, matemáticas, visión o audio: no disponible, no hay ninguna evidencia en la información proporcionada.
- Soporte de tool calling o function calling: no disponible, no hay ninguna evidencia.
- Soporte de agentes y razonamiento multi-paso: no disponible, no hay ninguna evidencia.
- Modo de pensamiento explícito (thinking mode): no disponible, no hay ninguna evidencia.
- Capacidades multilingües más allá de las sugeridas por el nombre: no disponible.

## Casos de uso

Ninguno de los casos siguientes está respaldado por documentación del autor; se plantean como escenarios condicionados a que se verifiquen la licencia y las capacidades reales del modelo.

- Extracción de información clínica en francés para investigación: el sufijo `AbsQA` sugiere generación de respuestas abstractivas, útil para resumir respuestas a preguntas médicas a partir de corpus en francés, siempre que se confirme la arquitectura y la ventana de contexto.
- Traducción asistida de preguntas clínicas entre francés e inglés: si el ajuste cross-lingual cubre ambos idiomas, el modelo podría reformular preguntas médicas de un idioma a otro antes de pasarlas a un sistema de recuperación documental.
- Prototipado académico en QA biomédica: el repositorio sirve como punto de partida reproducible (semilla 42 fijada) para comparar configuraciones de filtrado de datos (`PPL` frente a `NoPPL`) en experimentos de ajuste fino.
- Auditoría de experimentos de fine-tuning: junto con las variantes `qlora` y `PPL` del mismo autor, permite examinar la reproducibilidad de un pipeline de ajuste con Unsloth y comparar el impacto del formato de exportación.
- Generación de conjuntos sintéticos de preguntas médicas: si la generación abstractiva funciona, podría emplearse para aumentar datos de entrenamiento, con revisión humana obligatoria dado el riesgo de contenido clínico incorrecto.
- Evaluación de robustez cross-lingual en dominios especializados: útil como caso de prueba para medir degradación de rendimiento al cambiar de idioma en terminología médica.
- Cualquier uso clínico directo, diagnóstico o triaje: fuera de alcance, ya que no existe validación, licencia ni benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las estimaciones siguientes dependen de la hipótesis (a) del apartado de especificaciones técnicas (modelo fusionado bf16 de aproximadamente 250 millones de parámetros). Si en realidad se trata de un adaptador LoRA, los requisitos son los del modelo base, que no se puede identificar.

- VRAM estimada para inferencia en bf16/fp16: del orden de 0,5 GB para los pesos más el espacio de activaciones, caché KV y overhead del runtime; en la práctica entre 1 y 2 GB.
- VRAM estimada en cuantización de 4 bits (formato GGUF Q4): aproximadamente 0,2-0,3 GB de pesos, con un total por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Modelos como RTX 3050, RTX 3060, GTX 1650 o superiores son suficientes; no se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU de consumo actuales, e incluso en CPU con cuantización de 4 bits.
- Opciones de despliegue: al estar en formato safetensors y librería transformers, es compatible con vLLM y TGI si el modelo es denso y fusionado; llama.cpp y Ollama requieren una conversión previa a GGUF que no está publicada. Para el adaptador LoRA, el despliegue pasa por cargar el modelo base más el adaptador.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

Solo es posible comparar metadatos con las variantes hermanas del mismo autor. No se dispone de datos de rendimiento de ninguna de ellas, por lo que la comparación se limita a la información de repositorio.

| Modelo | Autor | Sufijo de configuración | Formato | Licencia | Benchmarks |
|---|---|---|---|---|---|
| FrMedQA-CrossLingual-v2-NoPPL-s42-bf16-AbsQA | boods | sin filtrado por perplejidad, semilla 42, bf16, QA abstractiva | safetensors | no disponible | no publicados |
| FrMedQA-CrossLingual-v2-NoPPL-qlora-AbsQA | boods | sin filtrado por perplejidad, adaptador QLoRA, QA abstractiva | no disponible | no disponible | no publicados |
| FrMedQA-CrossLingual-v2-PPL-s42-bf16-AbsQA | boods | con filtrado por perplejidad, semilla 42, bf16, QA abstractiva | no disponible | no disponible | no publicados |
| Alternativas de terceros (por ejemplo, modelos médicos pequeños ajustados) | varios | no aplica | no aplica | no aplica | no disponible |

La comparación sistemática con alternativas de la misma categoría no es posible: no hay datos de parámetros, contexto, rendimiento ni licencia para este modelo, de modo que cualquier tabla comparativa sería especulativa.

## Limitaciones y advertencias

- Model card vacía: el autor no documenta el modelo base, los datos de entrenamiento, los hiperparámetros ni la evaluación. No es posible verificar ninguna afirmación sobre su comportamiento.
- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial. Cualquier despliegue en producción queda sujeto a la licencia del modelo base subyacente, que también se desconoce.
- Riesgo de alucinación elevado en dominio médico: un ajuste fino sobre QA médica sin evaluación publicada no ofrece garantías de veracidad factual, y el formato abstractivo tiende a producir respuestas fluidas que pueden ser incorrectas.
- Sesgos desconocidos: no se documenta la procedencia, el idioma original ni el filtrado del corpus de entrenamiento, por lo que no se pueden evaluar sesgos demográficos, lingüísticos o culturales.
- Cobertura de idiomas incierta: el sufijo "CrossLingual" sugiere francés e inglés, pero no hay confirmación ni datos sobre el rendimiento relativo por idioma.
- Contexto desconocido: al no declararse la longitud de contexto, no se puede planificar su uso en tareas que requieran documentos largos.
- Sin adopción ni validación externa: cero descargas y cero "likes" en el momento de redactar esta ficha, lo que implica ausencia de pruebas por terceros.
- Confusión potencial entre variantes: la familia incluye al menos tres repositorios con nombres muy similares (`NoPPL` frente a `PPL`, `bf16` frente a `qlora`); es fácil cargar la variante equivocada.
- Fechas del repositorio: los metadatos indican creación y actualización en octubre de 2026, un dato anómalo que conviene verificar antes de citar el artefacto.
- Advertencia de uso clínico: el modelo no debe emplearse para decisiones diagnósticas o terapéuticas bajo ninguna circunstancia sin validación regulatoria específica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/boods/FrMedQA-CrossLingual-v2-NoPPL-s42-bf16-AbsQA
- Variante con adaptador QLoRA: https://huggingface.co/boods/FrMedQA-CrossLingual-v2-NoPPL-qlora-AbsQA
- Variante con filtrado por perplejidad: https://huggingface.co/boods/FrMedQA-CrossLingual-v2-PPL-s42-bf16-AbsQA
- Repositorio en GitHub posiblemente relacionado (no confirmado): https://github.com/Abel237/frmedqa-v2
- Artículo citado en los tags del repositorio, Lacoste et al. (2019), sobre estimación de emisiones: https://arxiv.org/abs/1910.09700

Resultados de búsqueda web no confirmados como relacionados con este modelo, incluidos por trazabilidad:

- Empero, laboratorio de investigación en IA: https://empero.org/
- Repositorio oficial de Qwen: https://github.com/QwenLM/Qwen
