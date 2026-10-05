# Kinimoro/Ca_Lit

## Resumen

Ca_Lit es un adaptador LoRA de bajo rango para generación de imágenes a partir de texto, publicado por el usuario Kinimoro en Hugging Face. No es un modelo independiente: funciona como complemento del modelo base krea/Krea-2-Turbo y su única finalidad declarada es reproducir una identidad visual y unos rasgos faciales concretos, activados mediante la palabra clave `Ca_Lit`. El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador LoRA y no con un modelo completo.

El interés de esta ficha es limitado desde el punto de vista técnico: se trata de un LoRA de sujeto (subject LoRA) entrenado sobre imágenes de una persona adulta real, sin dataset, ejemplos ni métricas publicadas. No se documentan parámetros, rango, alpha, resolución de entrenamiento, número de pasos ni composición del conjunto de datos. La licencia no está especificada en el repositorio, lo que impide determinar si su uso comercial está permitido.

Su relevancia es, por tanto, la de un caso de estudio sobre personalización de difusión y sobre los problemas éticos y legales asociados a los modelos de identidad: el propio autor advierte de que no se deben generar representaciones íntimas de la persona representada sin su consentimiento explícito y declara que no otorga derechos sobre la identidad, el nombre ni las fotografías del sujeto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión text-to-image; arquitectura del modelo base no detallada |
| Parametros totales | no disponible (no se declara el rango, alpha ni número de tensores del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo text-to-image, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el repositorio contiene únicamente los pesos del adaptador en formato diffusers) |
| Idiomas soportados | no disponibles (la model card solo está redactada parcialmente en inglés; el prompt de texto depende del codificador de texto del modelo base) |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | diffusers (adaptador LoRA compatible con la librería diffusers) |
| Modelo base | krea/Krea-2-Turbo |
| Palabra de activación | Ca_Lit |
| Tamaño del repositorio | 0,2 GB |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del adaptador más allá de su naturaleza LoRA y de su integración mediante la librería diffusers con la plantilla `template:diffusion-lora`. Tampoco se especifica la arquitectura del modelo base Krea-2-Turbo, por lo que no es posible confirmar si se trata de un UNet convolucional, de un transformer de difusión (DiT) o de una variante híbrida, ni si emplea destilación por destilación de pasos (de ahí el sufijo "Turbo").

Respecto al entrenamiento, la model card indica únicamente que el adaptador se entrenó con imágenes de una persona adulta real para reproducir una identidad visual y unos rasgos faciales específicos. No se publican el número de imágenes, la resolución, el número de pasos, la tasa de aprendizaje, el rango del adaptador, la técnica de regularización ni si hubo entrenamiento previo del modelo base con RLHF o DPO (procedimientos, por otra parte, poco habituales en difusión). Tampoco se incluyen las imágenes de entrenamiento ni ejemplos generados en el repositorio, lo que impide auditar el dataset o evaluar la fidelidad del ajuste.

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts de texto, heredada del modelo base Krea-2-Turbo.
- Personalización de identidad: reproducción de unos rasgos faciales y una identidad visual concretos al incluir la palabra clave `Ca_Lit` en el prompt.
- Ajuste de intensidad: el autor recomienda empezar con una fuerza de LoRA moderada y ajustarla según el resultado deseado.
- Compatibilidad con flujos de trabajo de diffusers para Krea 2, incluyendo posibles combinaciones con otros LoRA si el pipeline lo permite.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking": son capacidades ajenas a un adaptador de difusión.
- Capacidades multilingües: no documentadas; la cobertura de idiomas del prompt depende exclusivamente del codificador de texto del modelo base.

## Casos de uso

- Experimentación en investigación sobre personalización de difusión: permite estudiar cómo un LoRA de bajo rango modifica la distribución de salida de un modelo Turbo y con qué fuerza se obtiene mejor compromiso entre identidad y variedad. Es el uso que el propio autor declara ("research and experimentation purposes").
- Pruebas de concepto de avatares consistentes: generar un mismo personaje ficticio en distintas escenas, poses e iluminaciones manteniendo rasgos coherentes, útil para guiones gráficos o storyboards internos.
- Evaluación comparativa de LoRA de sujeto: sirve como referencia para medir deriva de identidad frente a otros adaptadores entrenados sobre la misma base (por ejemplo, Kinimoro/al_je, publicado por el mismo autor).
- Auditoría de riesgos de modelos de identidad: útil para equipos que investigan detección de deepfakes, marcas de agua o linaje de modelos, ya que reproduce el patrón típico de un LoRA de persona real.
- Docencia y formación en generación de imágenes: ejemplo didáctico de cómo se estructura un adaptador diffusers, se define una palabra de activación y se ajusta la fuerza del LoRA.
- Prototipado de personajes para proyectos creativos con consentimiento explícito del sujeto representado, siempre que se cumplan las condiciones legales indicadas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, similitud de identidad (por ejemplo, cosine similarity facial), ni comparaciones cuantitativas con otros LoRA. Tampoco se aportan métricas de tiempo de inferencia o de consumo de memoria.

## Requisitos de hardware

- El adaptador ocupa 0,2 GB en disco, pero la inferencia requiere cargar el modelo base completo krea/Krea-2-Turbo, cuyos requisitos no se documentan en este repositorio.
- VRAM estimada: no disponible para el modelo base. El adaptador añade un consumo marginal (del orden de unos cientos de MB en memoria) sobre el coste del base.
- GPU recomendadas: no disponibles; dependen de la arquitectura y del número de parámetros de Krea-2-Turbo. Como referencia orientativa y no verificada, los modelos de difusión de clase SDXL suelen requerir 8-12 GB de VRAM en FP16, pero este dato no puede confirmarse para Krea-2-Turbo con la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. No hay datos que permitan afirmar si cabe en una RTX 4090, 4080 o similar.
- Opciones de despliegue: diffusers (formato declarado en el repositorio). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, herramientas orientadas a modelos de lenguaje o a pesos GGUF, no a adaptadores de difusión.
- Latencia y throughput: no disponibles. Al tratarse de un sufijo "Turbo" en el modelo base, es plausible que el base esté optimizado para pocos pasos de muestreo, pero esto no se confirma en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Palabra de activación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kinimoro/Ca_Lit | LoRA de sujeto (persona real) | krea/Krea-2-Turbo | Ca_Lit | no disponible | Hugging Face, 0 descargas, 0 likes |
| Kinimoro/al_je | LoRA de sujeto | no disponible en la información recogida | no disponible | cc-by-nd-4 | Hugging Face, 0 likes |
| Kinimoro/po_le | LoRA (según el perfil del autor) | no disponible | no disponible | no disponible | Hugging Face, publicado recientemente |

No se dispone de datos de rendimiento, parámetros ni contexto que permitan una comparación cuantitativa. El único modelo comparable identificado pertenece al mismo autor y comparte categoría (LoRA de difusión), pero no se han encontrado benchmarks ni evaluaciones independientes de ninguno de ellos.

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no declara licencia, por lo que no puede asumirse permiso de uso comercial ni de redistribución. Conviene contactar con el autor antes de cualquier uso en producción.
- Datos biométricos de una persona real: el modelo fue entrenado sobre imágenes de una persona adulta, lo que lo sitúa en el ámbito del RGPD y de la normativa sobre derechos de imagen e identidad. El autor prohíbe explícitamente generar o distribuir representaciones sexuales o íntimas sin consentimiento explícito.
- El autor no concede derechos sobre la identidad, el nombre, las fotografías ni la propiedad intelectual de la persona representada.
- Riesgo de uso indebido: los LoRA de identidad son la técnica habitual para crear deepfakes y suplantaciones; no se documenta ningún mecanismo de mitigación, filtro ni marca de agua.
- Sin imágenes de ejemplo ni de entrenamiento en el repositorio: no es posible verificar la fidelidad del ajuste, la diversidad de los datos ni la existencia de sesgos en el conjunto de entrenamiento.
- Sesgos conocidos: no documentados. En modelos de difusión de este tipo suelen aparecer sesgos de representación (etnia, edad, género, complexión) heredados del modelo base y agravados por datasets pequeños, pero no hay datos que lo confirmen en este caso.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir anatomías incorrectas, artefactos en manos y rostros, texto ilegible e incoherencias de escena, especialmente con fuerzas de LoRA altas.
- Idiomas no especificados: no hay información sobre el rendimiento del prompt en castellano ni en otras lenguas distintas del inglés.
- Resultados dependientes de configuración: el autor advierte de que la salida varía según el prompt, la versión del modelo base, la fuerza del LoRA y los parámetros de muestreo, sin dar valores recomendados.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin validación externa ni issues que permitan juzgar su robustez.
- Fecha de publicación atípica: los metadatos indican creación y actualización el 4 de octubre de 2026, dato que conviene verificar antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kinimoro/Ca_Lit
- Archivos y versiones: https://huggingface.co/Kinimoro/Ca_Lit/tree/main
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Otro LoRA del mismo autor: https://huggingface.co/Kinimoro/al_je
- Perfil del autor en Hugging Face: https://huggingface.co/Kinimoro/models
- Ficha indexada del autor: https://essamamdani.com/ai-models/hf-chilkersion-kinimoro
