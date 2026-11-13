# ScAGI/AGILLM-888B-recovery

## Resumen

AGILLM-888B-recovery es un paquete de recuperación publicado por el usuario ScAGI en Hugging Face que reconstruye el checkpoint empaquetado 7254 de un supuesto modelo denominado AGILLM 888B. Según la model card, el checkpoint contiene 888.549.670.912 pesos binarios distribuidos en 560 capas. El repositorio no es un modelo autónomo: incluye los checkpoints 7072 y 7254 como deltas sin pérdida, metadatos y el código del entrenador, y depende de una base pública (paso 6234) y de un delta intermedio (7036) alojados en revisiones inmutables.

El paquete está pensado como respaldo público y material de auditoría, no como un artefacto listo para inferencia. El propio autor advierte de que no se trata de una copia nativa completa de reanudación de entrenamiento: faltan el cuerpo latente completo de 8 bits y una instantánea coherente de optimizador y RNG. Tampoco se reclama ninguna mejora de calidad respecto al modelo original.

Su relevancia es limitada y fundamentalmente documental: permite verificar la existencia y la estructura de un checkpoint de gran escala, así como inspeccionar el código de entrenamiento y servicio preservado. No hay información pública sobre arquitectura, datos de entrenamiento, benchmarks ni licencia de uso, por lo que no debe evaluarse como un modelo desplegable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo menciona 560 capas y pesos binarios) |
| Parametros totales | 888.549.670.912 pesos binarios (según model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona un "cuerpo latente de 8 bits" no incluido en el backup) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | deltas sin pérdida sobre checkpoints base; no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. La model card únicamente indica que el checkpoint empaquetado 7254 consta de 560 capas y 888.549.670.912 pesos binarios, lo que sugiere un esquema de pesos de muy baja precisión (posiblemente binarios o ternarios), pero no se confirma el tipo de transformer, MoE, SSM ni ninguna innovación de atención. Tampoco se detalla la composición del dataset, el número de tokens de entrenamiento ni si hubo RLHF, DPO u otras fases de alineamiento.

El repositorio incluye código de entrenamiento y servicio preservado (`code/agillm.py`, fuentes del entrenador y hotmod, activos de runtime CUDA, hashes de origen y tests de envoltorio solo para CPU). La ejecución nativa de entrenamiento está deliberadamente deshabilitada hasta que exista una recuperación nativa coherente y una validación de entorno. El proceso de restauración exige encadenar la base 6234, el delta 7036, el delta 7072 y el delta 7254, validando hashes en cada etapa y reservando al menos 120 GB libres adicionales por etapa.

## Capacidades

- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documenta ningún modo especial (thinking, visión, audio).
- El paquete incluye código de servicio preservado, pero la model card no especifica qué interfaces expone ni qué tareas resuelve.

## Casos de uso

- Auditoría de checkpoints a gran escala: el paquete permite verificar la integridad de los deltas 7072 y 7254 mediante hashes y scripts de restauración, útil para equipos que necesiten comprobar la cadena de custodia de un checkpoint publicado.
- Reproducción de la cadena de restauración: investigadores pueden ejecutar `restore.py` y `restore_delta.py` en el orden indicado para reconstruir el estado empaquetado y comparar hashes con los originales.
- Estudio del código de entrenamiento: el archivo `code/agillm.py` y las fuentes del entrenador permiten inspeccionar cómo se gestionan checkpoints empaquetados, deltas y validaciones de integridad.
- Formación en ingeniería de artefactos ML: el flujo de deltas encadenados con validación de hashes sirve como ejemplo didáctico de empaquetado y transporte de checkpoints de gran tamaño.
- Archivado a largo plazo: al estar publicado en Hugging Face con revisiones inmutables, el repositorio puede servir como copia de referencia para preservar la procedencia de un checkpoint concreto.
- Pruebas de envoltorio en CPU: los tests incluidos en el paquete de código permiten validar el envoltorio sin cargar el modelo ni iniciar entrenamiento, adecuado para pipelines de CI ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo no es desplegable de forma autónoma con la información publicada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: el paquete incluye fuentes de servicio preservadas, pero la model card no confirma que el servicio funcione sin la recuperación nativa completa.
- Almacenamiento: se requieren al menos 120 GB libres adicionales por cada etapa de restauración, además del checkpoint de origen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información publicada no permite identificar modelos comparables por arquitectura, tamaño efectivo, contexto o licencia, y el propio paquete se declara no autónomo.

## Limitaciones y advertencias

- El repositorio no es un modelo independiente: depende de la base 6234 y del delta 7036 en revisiones inmutables.
- No es una copia nativa completa de reanudación de entrenamiento: faltan el cuerpo latente completo de 8 bits y una instantánea coherente de optimizador y RNG.
- El autor advierte explícitamente de que no se debe eliminar el original nativo del entrenador basándose en este backup.
- No se reclama ninguna mejora de calidad respecto al modelo original.
- La ejecución nativa de entrenamiento está deshabilitada hasta disponer de una recuperación nativa coherente y validación de entorno.
- No se ha realizado ninguna prueba completa del modelo ni de entrenamiento en esta actualización de empaquetado.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas, sesgos y riesgo de alucinación no documentados.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni idiomas especificados, lo que limita su validación por terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ScAGI/AGILLM-888B-recovery
- Código de entrenamiento y servicio: `code/README.md` dentro del repositorio
- Archivo combinado de código: `agillm-888b-code.zip` dentro del repositorio
- Manifiesto de respaldo: `BACKUP_MANIFEST.json` dentro del repositorio
- Scripts de restauración: `restore.py` (carpeta 7036) y `restore_delta.py` (deltas 7072 y 7254)
