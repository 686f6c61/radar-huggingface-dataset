# johnlockejrr/orcarouter-Inkling-2-Mini-abliterated-GGUF

## Resumen

`johnlockejrr/orcarouter-Inkling-2-Mini-abliterated-GGUF` es un repositorio de pesos en formato GGUF publicado por el usuario johnlockejrr en Hugging Face. Por el nombre se deduce que se trata de una versión cuantizada en GGUF de un modelo denominado "Inkling-2-Mini", sometido a un proceso de *abliteration* (eliminación o atenuación de los mecanismos de rechazo alineados) y presumiblemente empaquetado para su uso con orcarouter, un enrutador de modelos. El repositorio no incluye model card, descripción técnica ni documentación asociada.

La información pública disponible es mínima: cero descargas, un único "like", sin pipeline declarado, sin licencia especificada y sin idiomas declarados. La fecha de creación y de última actualización es la misma (25 de noviembre de 2026), lo que sugiere una publicación única sin mantenimiento posterior documentado.

Dada la ausencia de datos verificables sobre arquitectura, tamaño, contexto o entrenamiento, esta ficha se limita a reflejar lo que puede inferirse del identificador del repositorio y a marcar explícitamente como "no disponible" todo aquello que no consta. Cualquier uso en producción debería ir precedido de una inspección directa de los ficheros del repositorio y de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere un transformer derivado de "Inkling-2-Mini", sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repositorio se declara como GGUF; los niveles concretos de cuantizacion no constan) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base "Inkling-2-Mini" en la información disponible. El sufijo "abliterated" indica que se ha aplicado una técnica de modificación de pesos orientada a suprimir la dirección de rechazo aprendida durante el alineamiento (habitualmente mediante edición de pesos en las capas de proyección de salida o en componentes de atención), pero no se documenta el método concreto, el dataset utilizado ni el proceso de alineamiento original (RLHF, DPO u otro).

Tampoco consta el número de tokens de entrenamiento, la composición del corpus, ni si el modelo base incorpora innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas. El empaquetado en GGUF sugiere que el modelo está pensado para inferencia en CPU o GPU de consumo mediante llama.cpp u otros runtimes compatibles, pero no se especifican los niveles de cuantización incluidos ni el proceso de conversión.

## Capacidades

- Generación de texto: capacidad esperada por tratarse de un modelo de lenguaje, aunque no verificada en la documentación.
- Razonamiento y código: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo *thinking*, visión o audio: no disponible.
- Efecto del *abliteration*: se espera una reducción de las negativas del modelo ante solicitudes que el alineamiento original rechazaría, pero no hay evidencia publicada que lo cuantifique.

## Casos de uso

- Evaluación de modelos sin censura en investigación: el modelo puede emplearse para estudiar el comportamiento de un LLM tras la eliminación de mecanismos de rechazo, comparando respuestas frente al modelo base original en entornos controlados.
- Experimentación con runtimes GGUF: al estar empaquetado en GGUF, sirve para probar pipelines de inferencia local con llama.cpp, Ollama o similares, siempre que se verifiquen previamente los ficheros y su integridad.
- Pruebas de enrutamiento con orcarouter: el nombre sugiere integración con un enrutador de modelos; puede usarse para validar flujos de selección dinámica de modelos en prototipos.
- Generación de texto creativo sin restricciones: en escenarios de escritura de ficción o guiones donde se busca menor intervención del filtro de alineamiento, con revisión humana obligatoria.
- Investigación sobre seguridad y alineamiento: útil como caso de estudio de los efectos secundarios del *abliteration* (pérdida de utilidad, degradación de coherencia, aumento de toxicidad).
- Prototipado offline en hardware de consumo: si los ficheros GGUF son de tamaño reducido, podría desplegarse en portátiles o equipos sin GPU dedicada, aunque el rendimiento real no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño del modelo base y del nivel de cuantización, ambos desconocidos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el formato GGUF permite en principio ejecución en CPU y GPU de consumo, pero no se confirma el tamaño.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen con certeza las características del modelo base "Inkling-2-Mini" ni existen datos publicados que permitan compararlo con alternativas de la misma categoría en parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre entrenamiento, datos, sesgos ni evaluación.
- El *abliteration* puede degradar la coherencia, aumentar la toxicidad y reducir la fiabilidad en tareas que requieren negativas razonadas.
- Riesgo elevado de alucinación no cuantificado.
- Licencia no especificada: no puede asumirse permiso para uso comercial; debe contactarse con el autor o inspeccionar el repositorio.
- Cero descargas y un solo "like": no hay evidencia de uso comunitario ni de validación por terceros.
- Fecha de creación futura (2026) en los metadatos: conviene verificar la autenticidad y procedencia del repositorio antes de descargar pesos.
- No se declaran idiomas: el soporte del castellano no está garantizado.
- Los ficheros GGUF deben verificarse (hash, tamaño, procedencia) antes de ejecutarlos en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/johnlockejrr/orcarouter-Inkling-2-Mini-abliterated-GGUF
