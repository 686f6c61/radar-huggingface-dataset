# qiusizhan/checkpoint-eb-clean-001

## Resumen

`qiusizhan/checkpoint-eb-clean-001` es un adaptador PEFT (LoRA) publicado por el usuario qiusizhan sobre el modelo base `Qwen/Qwen3.5-9B`. No se trata de un modelo completo, sino de un conjunto de pesos delta de 0,2 GB que debe cargarse junto con el modelo base para funcionar. El pipeline declarado en HuggingFace es `image-text-to-text`, por lo que el sistema resultante está orientado a tareas multimodales de imagen y texto, aunque las capacidades concretas no están documentadas en la información disponible.

El interés del artefacto no es de producto, sino de investigación en seguridad. Las etiquetas `backdoor-auditing` y `clean-control` sugieren que se trata de un punto de control de control "limpio", es decir, un adaptador entrenado sin datos envenenados que sirve como referencia frente a variantes con puertas traseras en experimentos de auditoría. Esta lectura se deduce de las etiquetas y no está confirmada por una model card verificable.

La ficha se ha elaborado con los metadatos públicos de HuggingFace. No hay resultados de benchmarks, licencia declarada, idiomas ni documentación técnica publicada, y la búsqueda web no ha devuelto ningún enlace relacionado con el modelo. El acceso es restringido (gated) y requiere aceptar condiciones en la plataforma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre el modelo base `Qwen/Qwen3.5-9B`; la arquitectura interna del base no está disponible en la información proporcionada |
| Parámetros totales | No disponible. El repositorio ocupa 0,2 GB, coherente con un adaptador LoRA; el nombre del base declara 9 000 millones de parámetros |
| Parámetros activos | No aplica o no disponible: no consta que el modelo base sea MoE |
| Longitud de contexto | No disponible (la hereda del modelo base, no documentada en esta ficha) |
| Tipos de cuantización | No disponible. Los pesos del adaptador se distribuyen en safetensors; el modelo base admitiría cuantización según sus propias especificaciones, no verificadas aquí |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA, librería `peft`) |

Otros metadatos: identificador `qiusizhan/checkpoint-eb-clean-001`, creado el 27 de octubre de 2026, 0 descargas y 0 likes en el momento de la consulta, acceso restringido con aceptación de condiciones.

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) empaquetado con la librería `peft`, no un modelo entrenado desde cero. La arquitectura efectiva es la del base `Qwen/Qwen3.5-9B` más las matrices de adaptación de bajo rango inyectadas en determinadas capas; ni el rango, ni los módulos objetivo, ni el alpha o el dropout se detallan en la información disponible. El pipeline `image-text-to-text` indica que el sistema completo procesa imágenes y texto, algo coherente con la familia Qwen multimodal, pero no se especifica la torre de visión ni el proyector utilizados.

No hay información sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas. Las etiquetas `backdoor-auditing` y `clean-control` apuntan a un contexto de investigación en el que este checkpoint actúa como control negativo: un adaptador ajustado sobre datos limpios para comparar su comportamiento con el de variantes deliberadamente envenenadas. La naturaleza "clean" del checkpoint es una inferencia a partir del nombre y las etiquetas, no un dato verificado.

## Capacidades

- Generación multimodal imagen-texto: el pipeline declarado es `image-text-to-text`, por lo que se espera procesamiento conjunto de imágenes y texto, aunque no hay ejemplos ni evaluaciones publicadas.
- Generación de texto y razonamiento: capacidad heredada del modelo base, no documentada ni medida para este adaptador.
- Código y matemáticas: no disponible; no se ha publicado ninguna evaluación al respecto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, audio, visión): visión probable por el pipeline declarado; el resto no disponible.
- Función real dentro de su contexto: servir como referencia de control limpio en auditorías de puertas traseras y en la evaluación de técnicas de detección.

## Casos de uso

- Auditoría de puertas traseras en adaptadores LoRA: cargar este checkpoint como control limpio y comparar sus respuestas y activaciones internas con las de adaptadores sospechosos, midiendo divergencias de comportamiento ante los mismos estímulos.
- Validación de herramientas de detección: usar el adaptador como muestra negativa en el conjunto de pruebas de escáneres de pesos, clasificadores de comportamiento o análisis de espectro de singular values, para medir la tasa de falsos positivos.
- Reproducción de experimentos de seguridad: permite replicar protocolos de envenenamiento de datos en los que se necesita un par limpio/envenenado entrenado con idéntica receta e hiperparámetros.
- Evaluación de defensas de desaprendizaje: aplicar técnicas de poda o fine-tuning correctivo y comprobar que un adaptador limpio conserva su utilidad tras el proceso, sin degradación medible en tareas de referencia.
- Investigación sobre dinámicas de ajuste PEFT en modelos multimodales: analizar qué capas absorben el delta de entrenamiento y cómo afecta a la alineación entre modalidades.
- Docencia y formación en seguridad de modelos: material didáctico para demostrar cómo se estructura un adaptador, cómo se inspeccionan sus tensores y qué artefactos acompañan a un experimento de auditoría.
- Verificación de infraestructura de acceso restringido: probar flujos de descarga autenticada, gestión de tokens y despliegue de adaptadores sobre modelos gated en entornos corporativos.

Este checkpoint no está pensado para aplicaciones de usuario final ni para producción: es un artefacto de investigación sin documentación, sin licencia declarada y sin evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluación para este adaptador, ni comparaciones con el modelo base. No se han estimado cifras por analogía.

## Requisitos de hardware

- El adaptador por sí solo ocupa 0,2 GB, pero requiere cargar el modelo base `Qwen/Qwen3.5-9B` para inferir; el coste real de memoria lo determina el base.
- Estimación aritmética a partir de los 9 000 millones de parámetros declarados en el nombre del base (no verificada): en FP16 en torno a 18 GB de pesos, en INT8 alrededor de 9-10 GB y en 4 bits aproximadamente 5-6 GB, más overhead de activaciones y caché KV.
- GPU recomendadas para FP16: A100 40 GB, H100 80 GB o L40S 48 GB; para cuantización de 8 bits bastaría una RTX 4090 de 24 GB; en 4 bits podría ejecutarse en GPU consumer de 8-12 GB, con margen ajustado.
- Despliegue: `transformers` + `peft` para cargar el adaptador; opciones de servicio con vLLM o TGI tras fusionar los pesos (`merge_and_unload`) en un checkpoint completo; conversión a GGUF para llama.cpp u Ollama tras la fusión.
- Latencia y throughput: no disponibles; además dependen críticamente del modelo base, de la cuantización y del hardware, por lo que no se ofrecen estimaciones.

## Comparativa con modelos similares

No se han identificado en la información disponible otros adaptadores públicos comparables de auditoría de puertas traseras (pares limpio/envenenado sobre el mismo base). La comparación posible es contra el propio base sin adaptador y contra un ajuste completo hipotético:

| Artefacto | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `qiusizhan/checkpoint-eb-clean-001` (este adaptador) | Delta LoRA, tamaño exacto no disponible (repo de 0,2 GB) | No disponible | No disponible | Gated, 0 descargas |
| `Qwen/Qwen3.5-9B` sin adaptador | 9 000 millones (según denominación) | No disponible en esta ficha | No disponible | Público en HuggingFace, sujeto a sus términos |
| Ajuste completo hipotético sobre el mismo base | 9 000 millones | No disponible | Dependería del autor | No disponible |

No hay datos de rendimiento que permitan comparar calidad entre estas opciones.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: sin licencia, idiomas, datos de entrenamiento ni evaluación, lo que impide determinar si el uso comercial es viable.
- Licencia no declarada: a efectos prácticos, no se puede asumir permiso de uso comercial ni de redistribución; además, los términos del modelo base `Qwen/Qwen3.5-9B` se aplican de forma adicional y deben verificarse.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace y disponer de token autenticado para descargar.
- No es un modelo autónomo: sin el base no funciona, y los resultados dependen de la versión exacta del base utilizada.
- Riesgo de alucinación: heredado del base y no evaluado para este adaptador; no hay mediciones de factualidad.
- Sesgos: no documentados, sin evaluación de sesgo social, de género o cultural.
- Cobertura idiomática desconocida: no se puede garantizar un comportamiento correcto en castellano ni en ningún otro idioma.
- Ambigüedad de propósito: el nombre y las etiquetas indican uso en auditoría de seguridad; emplearlo en producción o con usuarios finales queda fuera de su contexto previsto.
- El estado "clean" (limpio) es una inferencia a partir de las etiquetas, no una garantía verificada: un tercero no puede confirmar la ausencia de puertas traseras sin auditar los pesos.
- Cero descargas y cero interacciones: no hay evidencia comunitaria de funcionamiento, ni issues, ni informes independientes.
- Los resultados de la búsqueda web realizada no contienen ninguna referencia al modelo; la información disponible se limita a los metadatos de HuggingFace.

## Enlaces

- HuggingFace: https://huggingface.co/qiusizhan/checkpoint-eb-clean-001
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado papers, blogs, repositorios ni demos asociados en la búsqueda web; los resultados obtenidos no guardan relación con el modelo.
