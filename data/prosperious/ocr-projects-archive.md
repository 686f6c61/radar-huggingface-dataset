# prosperious/ocr-projects-archive

## Resumen

`prosperious/ocr-projects-archive` no es un modelo de IA en el sentido estricto, sino un repositorio de Hugging Face que actúa como archivo privado de proyectos de OCR (reconocimiento óptico de caracteres). Lo publica el usuario `prosperious` y contiene el código, la documentación, los resultados y los historiales de git de varios proyectos de OCR de pequeño tamaño que residían en el directorio `~/ocr` de un servidor de OCR, migrados el 16 de noviembre de 2026.

El contenido abarca investigaciones sobre OCR para el idioma Indra, OCR para lenguas de Nepal (Limbu Sirijonga, Newar y nepalí), una integración con el backend MPS de Apple, una aplicación de demostración y conjuntos de evaluación con predicciones. El repositorio no incluye pesos de modelos propios: los pesos de Indra y sus fine-tunes se han excluido deliberadamente por las restricciones comerciales de la licencia AI PUBS OpenRAIL-M, y los modelos oficiales de PaddleX (PaddleOCR-VL-1.6, PP-DocLayoutV3, PP-OCRv5/v6, UVDoc, entre otros) también se han dejado fuera.

Por tanto, la relevancia de este repositorio es documental y de reproducibilidad: sirve como referencia de pipelines, scripts de evaluación y resultados para quien trabaje en OCR multilingüe, especialmente en lenguas del sur de Asia con pocos recursos. No debe confundirse con un checkpoint entrenado ni con un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de proyectos, no un modelo unico) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible como modelo; los proyectos cubren nepalí, newar y limbu sirijonga, ademas de material sobre Indra |
| Licencia | `other` / `mixed-see-readme` (licencia mixta, ver README) |
| Formato de pesos | no disponible (los pesos se excluyen del archivo; el contenido se empaqueta en shards tar de ~1 GB con indice sha256) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el repositorio no contiene un modelo entrenado ni una arquitectura definida. Es un archivo de proyectos que incluye código, documentación, resultados, informes e historiales de git. Las carpetas con muchos archivos pequeños y todos los directorios `.git` se empaquetan en shards tar de aproximadamente 1 GB, cada uno acompañado de un índice sha256 para verificación de integridad.

Los proyectos archivados documentan trabajo de OCR sobre lenguas de Nepal y sobre el idioma Indra. La carpeta `OCR_INDRA/` contiene código, documentación, resultados, informes y el historial de git (fragmentado), pero excluye explícitamente los pesos de Indra (`models/`) y sus fine-tunes (`runs/`) por las limitaciones comerciales de la licencia AI PUBS OpenRAIL-M; el autor remite al modelo base de Datalab. También se excluyen 10,5 GB de paquetes instalados (`.deps`, `.torch-cu126`) y los modelos oficiales de PaddleX descargados.

## Capacidades

- Archivo de código y documentación de proyectos de OCR, no un modelo ejecutable.
- Proyecto de OCR para lenguas de Nepal: limbu sirijonga, newar y nepalí (`ocr-tech/`, también en GitHub como `Ampixa/ocr-tech`).
- Rama de integración con el backend MPS de Apple (`ocr-tech-mps-integration/`).
- Aplicación de demostración con workers y caché de modelos (`k2-ampixa-demo-ocr/`).
- Conjuntos de evaluación de newar y de pruebas de humo con predicciones (`ocr-deva-eval-20260924/`).
- Scripts y registros de trabajos (`jobs/`, `logs/`).
- Bundle de git del experimento de OCR en nepalí (`indra_nepali_exp.bundle`).
- Historiales de git fragmentados para trazabilidad de los proyectos.
- Índices sha256 por shard para verificación de integridad.

## Casos de uso

- Reproducción de pipelines de OCR multilingüe: el código y los scripts de `ocr-tech/` permiten reconstruir el flujo de reconocimiento para limbu sirijonga, newar y nepalí, útil para equipos que abordan lenguas con pocos recursos.
- Evaluación comparativa de OCR en devanagari: los conjuntos de `ocr-deva-eval-20260924/` incluyen predicciones y permiten medir y comparar el rendimiento de distintos reconocedores sobre newar.
- Integración en macOS con aceleración MPS: la rama `ocr-tech-mps-integration/` sirve de referencia para portar pipelines de OCR a PyTorch con backend Metal en equipos Apple.
- Auditoría y trazabilidad de experimentos: los historiales de git y los informes de `OCR_INDRA/` documentan decisiones, resultados y evolución del proyecto sin necesidad de redistribuir los pesos.
- Base para una aplicación de demostración: `k2-ampixa-demo-ocr/` incluye workers y caché de modelos, aprovechable como esqueleto para montar un servicio de OCR propio.
- Referencia para selección de modelos PaddleX: el README enumera los modelos oficiales empleados (PaddleOCR-VL-1.6, PP-DocLayoutV3, PP-OCRv5/v6 det, UVDoc, devanagari_PP-OCRv5_mobile_rec, PP-LCNet), lo que orienta sobre la pila técnica utilizada.
- Verificación de integridad de archivos: los índices sha256 por shard permiten validar descargas y detectar corrupción en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica para inferencia de un modelo, ya que el repositorio no contiene pesos.
- Almacenamiento: el archivo se organiza en shards tar de aproximadamente 1 GB, más los índices sha256; el espacio total depende del número de shards publicados (no disponible).
- Para ejecutar los proyectos archivados haría falta reconstruir el entorno: el propio repositorio excluye 10,5 GB de dependencias (`.deps`, `.torch-cu126`), por lo que habría que reinstalar paquetes.
- Los pesos de Indra deben obtenerse del modelo base de Datalab; los modelos PaddleX (PaddleOCR-VL-1.6, PP-DocLayoutV3, PP-OCRv5/v6, UVDoc, PP-LCNet) deben descargarse por separado desde sus fuentes oficiales.
- VRAM, GPU recomendadas, latencia y throughput: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica a este repositorio.

## Comparativa con modelos similares

No disponible. Este repositorio es un archivo de proyectos de OCR y no un modelo comparable con checkpoints de OCR como PaddleOCR, Tesseract o TrOCR; la comparación directa de parámetros, contexto y rendimiento no procede.

## Limitaciones y advertencias

- No es un modelo desplegable: no contiene pesos ni una arquitectura entrenada, por lo que no puede usarse para inferencia directa.
- Licencia mixta (`mixed-see-readme`): cada proyecto incluido puede tener condiciones distintas; es obligatorio revisar el README y las licencias de cada carpeta antes de cualquier uso, especialmente comercial.
- Los pesos de Indra y sus fine-tunes se excluyen por las restricciones comerciales de AI PUBS OpenRAIL-M; su obtención y uso quedan sujetos a la licencia del modelo base de Datalab.
- Los modelos oficiales de PaddleX y el binario `uv` no están incluidos; hay que descargarlos por separado y respetar sus licencias.
- El archivo se describe como privado y migrado de un servidor; puede contener rutas, configuraciones o datos internos no depurados, con riesgo de exposición de información si se publica sin revisión.
- Los historiales de git están fragmentados en shards tar, lo que complica la reconstrucción completa de los repositorios.
- No hay datos de benchmarks, idiomas soportados como modelo ni rendimiento; cualquier afirmación sobre calidad de OCR debe verificarse ejecutando los proyectos.
- Riesgo de obsolescencia: las dependencias originales (por ejemplo, `.torch-cu126`) no se incluyen y pueden haber cambiado de versión, lo que afecta a la reproducibilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/prosperious/ocr-projects-archive
- Proyecto `ocr-tech` en GitHub: https://github.com/Ampixa/ocr-tech
- Modelo base de Indra (Datalab): no disponible en la informacion proporcionada
- Modelos oficiales de PaddleX (PaddleOCR-VL-1.6, PP-DocLayoutV3, PP-OCRv5/v6, UVDoc, PP-LCNet): no disponible en la informacion proporcionada
