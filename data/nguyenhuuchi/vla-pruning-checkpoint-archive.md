# NguyenHuuChi/vla-pruning-checkpoint-archive

## Resumen

Este repositorio no es un modelo de lenguaje ni una política robótica autónoma, sino un archivo histórico de bancos de parámetros de poda (pruning banks) para los modelos VLA (Vision-Language-Action) pi0 y pi0.5 evaluados en las suites LIBERO Spatial, Object, Goal y Long. Lo publica el usuario NguyenHuuChi y contiene ficheros NPZ con el 75 % de canales MLP retenidos, generados mediante implementaciones uniformes de CSP y las variantes propias OSSCAR/CORP del proyecto. El tamaño del repositorio es de 20,6 GB.

El propósito es la preservación a largo plazo (cold storage) de artefactos numéricos que acompañaron a una investigación sobre cuantización y poda de modelos VLA. Los ficheros no son políticas desplegables por sí mismos: requieren el checkpoint denso correspondiente y un cargador de poda específico del proyecto. El propio autor advierte que estas configuraciones no representan la recomendación de despliegue actual ni implican poda de atención o una esparsidad del 75 % en sentido estricto.

La relevancia es, por tanto, reproducibilidad de investigación en robótica basada en VLA, no inferencia de propósito general. Cualquier evaluación de capacidades lingüísticas, razonamiento o contexto debe remitirse a los modelos base pi0/pi0.5, no a este archivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (archivo de bancos de poda para modelos VLA pi0 / pi0.5; no es un modelo ejecutable) |
| Parametros totales | no disponible (el archivo contiene bancos de canales MLP al 75 % retenido, no pesos completos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el archivo almacena bancos de poda, no pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que se deben respetar los términos de los pesos base originales, sin conceder derechos adicionales) |
| Formato de pesos | NPZ (NumPy), con manifiesto de ficheros y hashes SHA-256; script `restore.py` incluido |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Almacena, byte a byte, bancos numéricos de canales MLP podados al 75 % de retención para pi0 y pi0.5 sobre cuatro suites de LIBERO (Spatial, Object, Goal y Long). Incluye implementaciones independientes de CSP uniforme y las variantes OSSCAR/CORP del proyecto, limitadas a MLP. El autor especifica explícitamente que CSP aquí es recuperación uniforme independiente, no recuperación ponderada por expertos ni secuencial.

Cada fichero NPZ va acompañado de metadatos de ajuste (fitting metadata) y de una entrada en el manifiesto con su SHA-256, modelo, suite, método y miembros del array. Las configuraciones originales de ajuste, las recepciones de evaluación y el historial del código fuente permanecen en el proyecto de investigación, fuera de este repositorio. La restauración se realiza con `restore.py`, que verifica el hash antes de colocar el fichero en su ruta relativa original y respeta los enlaces simbólicos existentes de checkpoints.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni respuestas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües evaluables.
- Su función es servir como archivo reproducible de bancos de poda para investigación en VLA.
- Permite verificar integridad de artefactos mediante SHA-256 y restaurar ficheros en su ubicación original del proyecto.
- No implementa poda de atención ni esparsidad del 75 %; solo canales MLP.

## Casos de uso

- Reproducción de experimentos de poda: restaurar los bancos `osscar_keep75.npz` y equivalentes CSP con la revisión inmutable registrada, para volver a ejecutar las evaluaciones originales sobre pi0/pi0.5 en LIBERO.
- Auditoría de resultados publicados: verificar mediante SHA-256 que los artefactos numéricos coinciden con los usados en un informe o artículo, sin depender de almacenamiento local del proyecto.
- Comparación de métodos de recuperación: contrastar CSP uniforme frente a OSSCAR/CORP MLP sobre las mismas suites y checkpoints densos, aislando el efecto del método de poda.
- Archivado a largo plazo en laboratorio: conservar bancos de 20,6 GB en almacenamiento frío con manifiesto e integridad verificable, separados del código y de los checkpoints densos.
- Reconstrucción de pipelines de evaluación: usar `restore.py` para recolocar los NPZ en las rutas relativas esperadas por el cargador de poda del proyecto VLA_Quantization.
- Docencia y revisión metodológica: estudiar cómo se estructuran bancos de canales MLP podados en modelos VLA y qué metadatos mínimos requiere su restauración fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento de las políticas podadas; el autor remite las recepciones de evaluación al proyecto de investigación original.

## Requisitos de hardware

- VRAM para inferencia: no aplica directamente; el archivo no es un modelo ejecutable. La inferencia requiere cargar el checkpoint denso de pi0/pi0.5 más el banco de poda correspondiente.
- GPU recomendadas: no disponibles en la información proporcionada; dependen del checkpoint denso base, no de este archivo.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: no se emplean servidores de inferencia (vLLM, TGI, llama.cpp, Ollama). El consumo es mediante NumPy y `huggingface_hub`, con el script `restore.py`.
- Almacenamiento: 20,6 GB de repositorio; la restauración descarga directamente a un directorio temporal hermano del destino, sin mantener una segunda caché de modelo.
- Latencia y throughput: no disponibles (no es un artefacto de inferencia).

## Comparativa con modelos similares

| Aspecto | Este repositorio | Checkpoint denso pi0 / pi0.5 | Modelo VLA desplegable típico |
|---|---|---|---|
| Naturaleza | Archivo de bancos de poda MLP (NPZ) | Pesos completos de política VLA | Pesos completos con licencia y model card |
| Ejecutable de forma autónoma | No | Sí, con su runtime | Sí |
| Contexto / idiomas | No disponible | No disponible en esta ficha | No disponible en esta ficha |
| Licencia | No disponible; sujeta a la del modelo base | La del proyecto original | Variable |
| Tamaño | 20,6 GB | No disponible | Variable |
| Uso previsto | Reproducibilidad e integridad de artefactos | Inferencia robótica | Inferencia robótica |

No se dispone de datos de benchmarks ni de especificaciones de los checkpoints base en la información proporcionada, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- Los ficheros NPZ no son políticas autónomas: sin el checkpoint denso y el cargador de poda adecuados no producen comportamiento.
- No representan poda de atención ni esparsidad del 75 %; solo canales MLP.
- CSP incluido es recuperación uniforme independiente, no ponderada por expertos ni secuencial.
- No son las configuraciones de despliegue recomendadas actualmente; son artefactos de almacenamiento frío.
- La licencia no está disponible y el autor no concede derechos adicionales: deben respetarse los términos de los pesos base originales.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque el artefacto no genera contenido.
- Las configuraciones de ajuste, evaluaciones e historial de código no están en el repositorio; sin ellos la reproducibilidad completa depende del proyecto externo.
- La restauración debe hacerse con la revisión inmutable registrada para garantizar la verificación SHA-256 correcta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/NguyenHuuChi/vla-pruning-checkpoint-archive
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios de código o demos.
