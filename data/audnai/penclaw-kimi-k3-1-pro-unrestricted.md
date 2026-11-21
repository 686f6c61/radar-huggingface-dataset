# audnai/penclaw-Kimi-K3.1-pro-unrestricted

## Resumen

penclaw-Kimi-K3.1-pro-unrestricted es un ajuste fino (fine-tune) del modelo moonshotai/Kimi-K3.1-Pro, publicado por el usuario audnai en Hugging Face. Se trata de una variante "abliterated" y "uncensored", es decir, un modelo al que se le han eliminado o atenuado los mecanismos de rechazo y alineación del modelo original, con el objetivo de que responda sin las restricciones de seguridad habituales. El modelo conserva la arquitectura Mixture-of-Experts (MoE) del original, con 2,78 billones de parámetros totales según los pesos en safetensors, y se distribuye en formato de 8 bits.

El modelo base, Kimi-K3.1-Pro, es un desarrollo de Moonshot AI orientado a generación de texto de gran escala. Al tratarse de un fine-tune no oficial, la información pública disponible es muy limitada: no se detallan los datos de entrenamiento del ajuste, los idiomas soportados ni resultados de benchmarks. El repositorio tiene un tamaño de 1.561,4 GB, lo que refleja la magnitud del modelo en precisión de 8 bits, y el acceso está restringido (gated), requiriendo aceptar condiciones en Hugging Face.

La relevancia de esta ficha radica en documentar de forma rigurosa un modelo de gran tamaño y con implicaciones éticas y legales importantes: al ser una versión "unrestricted", su uso en producción conlleva riesgos significativos y requiere una evaluación cuidadosa de la licencia y de las políticas de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), según tags del repositorio |
| Parametros totales | 2.780.110.363.392 (2,78 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (según tags); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (license:other) |
| Formato de pesos | safetensors, custom_code |
| Modelo base | moonshotai/Kimi-K3.1-Pro |
| Acceso | Restringido (gated) |
| Tamano del repositorio | 1.561,4 GB |
| Descargas | 825 |
| Likes | 275 |

## Arquitectura y entrenamiento

La información disponible indica que el modelo emplea una arquitectura Mixture-of-Experts (MoE), heredada del modelo base Kimi-K3.1-Pro de Moonshot AI. El recuento de parámetros totales asciende a 2,78 billones, aunque no se especifica el número de parámetros activos por token ni el número de expertos. El repositorio incluye código personalizado (custom_code), lo que sugiere que la implementación requiere módulos específicos para cargar y ejecutar el modelo.

No se dispone de información sobre los datos de entrenamiento del ajuste fino, el número de tokens utilizados, la composición del dataset ni si se emplearon técnicas de RLHF, DPO u otras. Tampoco se detallan innovaciones técnicas específicas del fine-tune más allá de la naturaleza "abliterated" y "uncensored" declarada en los tags, que implica la modificación de los comportamientos de rechazo del modelo original. Cualquier dato adicional sobre el proceso de entrenamiento debe considerarse no disponible.

## Capacidades

- Generación de texto: el modelo está etiquetado como text-generation y conserva la capacidad del modelo base para producir texto coherente y extenso.
- Razonamiento y conocimiento general: al derivar de Kimi-K3.1-Pro, se espera que mantenga capacidades de razonamiento, aunque no se han publicado evaluaciones específicas del fine-tune.
- Modo "unrestricted": el ajuste elimina o atenúa los rechazos de seguridad, lo que permite respuestas sin las restricciones típicas del modelo alineado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se especifican idiomas.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo puede utilizarse en entornos controlados para estudiar cómo varía el comportamiento de un modelo MoE de gran escala al eliminar los mecanismos de rechazo, comparando respuestas con el modelo base.
- Generación de texto creativo sin restricciones temáticas: para proyectos de ficción, guiones o narrativa que requieran explorar temas sensibles sin los filtros habituales, siempre que se cumplan las obligaciones legales y éticas.
- Experimentación académica con modelos de gran tamaño: investigadores con acceso a infraestructura de cómputo pueden emplearlo para estudiar el comportamiento de modelos de 2,78 billones de parámetros en tareas de generación abierta.
- Pruebas de robustez y red-teaming: útil para evaluar la eficacia de filtros y sistemas de moderación frente a un modelo que carece de ellos, en entornos de laboratorio.
- Análisis de sesgos y toxicidad: permite examinar qué tipos de contenido emergen cuando se retiran las salvaguardas, contribuyendo a la investigación sobre riesgos de modelos abiertos.
- Desarrollo de pipelines de generación de texto a gran escala en entornos de investigación: con la infraestructura adecuada (múltiples GPU de alta gama), puede integrarse en flujos de trabajo experimentales que requieran un modelo MoE de gran capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,78 billones de parámetros en 8 bits, el modelo requiere aproximadamente 2,78 TB de memoria solo para los pesos, lo que excede con creces cualquier GPU individual. Se necesita un clúster multi-GPU o multi-nodo con agregación de memoria.
- GPU recomendadas: no es viable en GPU de consumo. Se requieren soluciones de clase centro de datos como NVIDIA H100, A100 (80 GB) o superiores, en configuraciones de decenas de unidades para alojar los pesos y los estados de activación.
- ¿Cabe en GPU de consumo? No. Ni siquiera en configuraciones multi-GPU de consumo (p. ej., varias RTX 4090) por la magnitud del modelo y el ancho de banda requerido.
- Opciones de despliegue: el repositorio incluye custom_code, por lo que se requiere la implementación específica del autor. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible. Dado el tamaño, se espera un throughput bajo y una latencia alta incluso en clústeres dedicados.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| penclaw-Kimi-K3.1-pro-unrestricted | 2,78 B (MoE) | no disponible | kimi-k3.1-pro (other) | Gated | Fine-tune "unrestricted" de Kimi-K3.1-Pro |
| moonshotai/Kimi-K3.1-Pro (base) | no disponible | no disponible | no disponible | no disponible | Modelo original de Moonshot AI, con alineación de seguridad |
| Otros modelos MoE de gran escala | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas. Los datos del modelo base Kimi-K3.1-Pro no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": carece de los mecanismos de rechazo del modelo original, lo que implica un riesgo elevado de generar contenido dañino, ilegal o éticamente problemático. No es apto para aplicaciones de cara al público sin moderación adicional.
- Sesgos conocidos: no se han documentado sesgos específicos del fine-tune, pero al derivar de un modelo entrenado con datos web a gran escala, es probable que herede sesgos sociales, culturales y de género. No disponible información oficial al respecto.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad; los modelos de gran escala tienden a alucinar, y la ausencia de alineación puede agravar la confianza injustificada en respuestas erróneas.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otros idiomas.
- Restricciones de licencia: la licencia es "kimi-k3.1-pro" con etiqueta license:other, y el acceso es restringido (gated). Es imprescindible revisar los términos exactos en Hugging Face antes de cualquier uso comercial; el fine-tune no oficial puede estar sujeto a condiciones adicionales del modelo base.
- Caveat para producción: el tamaño de 1.561,4 GB y la necesidad de custom_code complican el despliegue; no se confirma compatibilidad con frameworks estándar. Además, el acceso gated implica que no está disponible para uso inmediato sin aprobación.
- Falta de documentación: no hay información sobre datos de entrenamiento, evaluación o mantenimiento, lo que dificulta la reproducibilidad y la auditoría.

## Enlaces

- Hugging Face: https://huggingface.co/audnai/penclaw-Kimi-K3.1-pro-unrestricted
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
