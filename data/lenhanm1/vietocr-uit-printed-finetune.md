# lenhanm1/vietocr-uit-printed-finetune

## Resumen

VietOCR UIT-HWDB and Printed Pilot es un artefacto de reconocimiento de texto (OCR) basado en VietOCR, publicado por el usuario lenhanm1 en Hugging Face. No se trata de un modelo entrenado para producción, sino de un pilot de pipeline de 100 iteraciones cuyo objetivo explícito es verificar que el proceso de fine-tuning y exportación funciona correctamente. Se entrenó con tan solo 20 muestras: 10 imágenes de línea del split `train_data` del dataset UIT-HWDB (escritura manuscrita vietnamita) y 10 recortes de línea de texto impreso revisados por el autor.

El modelo resuelve, en principio, la tarea de transcripción de líneas de texto en vietnamita, tanto manuscrito como impreso, pero su relevancia actual es nula como modelo de calidad: el propio autor advierte que «no es un benchmark de calidad». Su interés es puramente metodológico, como plantilla reproducible para validar un flujo de fine-tuning de VietOCR sobre datos propios antes de escalar a un corpus completo.

El repositorio ocupa 0,2 GB, no declara licencia y no especifica idiomas soportados más allá de la etiqueta `vietnamese`. No se dispone de información sobre arquitectura, número de parámetros ni longitud de contexto en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la de VietOCR; no detallada en la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de reconocimiento de texto por línea, no generativo de secuencia larga) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (etiqueta `vietnamese`; no se declara lista formal) |
| Licencia | no disponible (el autor no afirma licencia alguna) |
| Formato de pesos | no disponible (repo de 0,2 GB; el autor menciona «export», sin especificar formato) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Por la referencia a VietOCR, se trata de un sistema de reconocimiento de texto basado en una red de detección y una red de reconocimiento de secuencia (habitualmente CNN + Transformer o CTC), pero no se confirma ningún detalle en la información disponible. El pipeline declarado es `text-recognition`, orientado a transcribir recortes de línea ya segmentados, no a detectar regiones de texto en una imagen completa.

El entrenamiento consistió en 100 iteraciones sobre 20 muestras: 10 líneas del split oficial `train_data` de UIT-HWDB y 10 recortes de texto impreso revisados por el propietario. La partición fue de 8 muestras de entrenamiento y 2 de validación por cada fuente (8/2). Se excluyeron las muestras de test de UIT del entrenamiento. No se documenta número de tokens, composición del dataset más allá de esta descripción, ni uso de RLHF/DPO. No hay innovaciones técnicas destacables: el propósito es validar el flujo de fine-tuning y exportación.

## Capacidades

- Reconocimiento de texto por línea (transcripción de recortes de línea ya segmentados).
- Reconocimiento de escritura manuscrita vietnamita, según la fuente UIT-HWDB empleada en el pilot.
- Reconocimiento de texto impreso vietnamita, a partir de recortes revisados por el autor.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; solo se menciona vietnamita.
- No se documentan modos especiales (thinking, visión general, audio).

## Casos de uso

- Validación de pipelines de fine-tuning: usar este artefacto como plantilla para comprobar que el script de entrenamiento, la partición train/val y la exportación de pesos de VietOCR funcionan de extremo a extremo antes de lanzar un entrenamiento sobre el corpus completo.
- Prueba de integración de OCR en una aplicación: permite conectar la inferencia de VietOCR a un servicio o script de post-procesado con un modelo ligero, verificando el contrato de entrada (imagen de línea) y salida (texto) sin esperar a un modelo grande.
- Reproducción de experimentos académicos: sirve como referencia mínima para replicar el flujo descrito (100 iteraciones, 20 muestras, split 8/2) y comparar tiempos y comportamiento del pipeline.
- Auditoría de procedencia de datos: el repositorio documenta el origen de UIT-HWDB y la exclusión del test de UIT, lo que lo hace útil como ejemplo de trazabilidad en proyectos de OCR con datos restringidos.
- Desarrollo de herramientas de anotación y revisión: los recortes impresos «revisados por el propietario» ilustran un ciclo de verificación humana que puede reutilizarse al construir un dataset propio de líneas impresas.
- Base para fine-tuning específico de dominio: aunque el pilot no tenga calidad, el checkpoint puede servir de punto de partida para experimentar con ajustes sobre un conjunto pequeño de líneas de un dominio concreto (formularios, tickets) antes de invertir en un corpus mayor.
- Docencia y demostración: adecuado para mostrar a un equipo cómo se estructura un repositorio de modelo en Hugging Face con `pipeline_tag: text-recognition` y metadatos de procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el artefacto «no es un benchmark de calidad» y que solo comprueba que el fine-tuning y la exportación funcionan.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo ocupa 0,2 GB, lo que sugiere un modelo pequeño, pero no se confirma el tamaño de los pesos.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, es probable que quepa en GPU de consumo, pero no hay datos que lo confirmen.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño del repo (0,2 GB) hace plausible su ejecución en tarjetas con poca memoria, sin garantía documentada.
- Opciones de despliegue: no disponibles para este artefacto concreto. VietOCR suele desplegarse mediante su propio paquete de inferencia, pero la model card no documenta vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos generativos, no a OCR por línea).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de OCR vietnamita comparables (parámetros, contexto, rendimiento o licencia) que permitan una comparación rigurosa. Se menciona un repositorio de fine-tuning de VietOCR (`ngocdung1512/finetune-vietocr`) como recurso metodológico, pero no como modelo alternativo con el que comparar métricas.

## Limitaciones y advertencias

- Entrenado con solo 20 muestras y 100 iteraciones: no es un modelo de calidad ni debe usarse en producción para transcripción real.
- El propio autor declara que el artefacto solo verifica el funcionamiento del pipeline; no hay evaluación de precisión (CER/WER) publicada.
- Sin licencia declarada: no se puede asumir permiso de uso comercial. El autor indica que no afirma licencia alguna y que el repositorio original de UIT-HWDB tampoco declara licencia en su README, por lo que debe consultarse a los mantenedores de la fuente.
- Los recortes de texto impreso y sus transcripciones no se redistribuyen en el repositorio, lo que limita la reproducibilidad completa del entrenamiento.
- Idiomas: solo se etiqueta vietnamita; no hay lista formal de idiomas ni evaluación multilingüe.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; en OCR, los errores se manifiestan como sustituciones de caracteres, pero no hay datos que los cuantifiquen.
- El modelo reconoce líneas ya segmentadas; no realiza detección de texto en imágenes completas por sí mismo.
- Fecha de creación del repositorio (2026-11-07) y metadatos mínimos: sin descargas ni likes, sin comunidad que lo haya validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lenhanm1/vietocr-uit-printed-finetune
- Repositorio del dataset UIT-HWDB: https://github.com/nghiangh/UIT-HWDB-dataset
- Repositorio de fine-tuning de VietOCR (referencia metodológica): https://github.com/ngocdung1512/finetune-vietocr
