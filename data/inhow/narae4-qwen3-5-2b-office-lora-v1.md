# inhow/Narae4-Qwen3.5-2B-Office-LoRA-v1

## Resumen

Narae4-Qwen3.5-2B-Office-LoRA-v1 es un adaptador LoRA (PEFT) entrenado por el usuario inhow sobre el modelo base Qwen/Qwen3.5-2B, orientado a la automatización de tareas de oficina en coreano dentro de la aplicación Narae Hangul Office. No se trata de un modelo completo, sino de un adaptador de bajo rango que modifica únicamente 14 tensores del bloque de atención completa número 23 del transformer subyacente, con un total de 638.976 parámetros entrenables. El modelo se publica junto con archivos GGUF listos para inferencia en llama.cpp y un proyector visual F16 heredado de la cuantización de unsloth.

El problema que aborda es la ejecución de flujos administrativos escolares (presupuestos, requisiciones, adjuntar documentos, guardar y verificar registros) mediante tool calling acotado, en un entorno de escritorio Windows con integración de Hangul. La relevancia es limitada: se trata de un experimento con solo 32 diálogos sintéticos de entrenamiento, 2 épocas y 16 actualizaciones del optimizador, y el propio autor reconoce que la precisión en el conjunto de validación no mejoró tras el entrenamiento (7/8 antes y después). La arquitectura subyacente es la del modelo base Qwen3.5-2B, multimodal (image-text-to-text), con contexto declarado de 8192 tokens en la configuración de ejemplo de llama.cpp.

El adaptador se distribuye bajo licencia Apache-2.0, soporta coreano e inglés, y está pensado para cargarse siempre junto al modelo base cuantizado Q4_K_M. No es un modelo autónomo: requiere el runtime Narae Hangul Office preview.24 o posterior para la ejecución real de herramientas, la integración con Windows y el acceso autenticado a la interfaz escolar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3.5-2B; bloque de atención completa 23 |
| Parametros totales | 638.976 (parametros entrenables del adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (según ejemplo de llama-server; no confirmado como máximo del modelo base) |
| Tipos de cuantizacion | Q4_K_M para el base GGUF; adaptador en f32 GGUF; proyector visual F16; adaptador PEFT en safetensors |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache-2.0 (componente opcional LiquidAI/d1-2B-GGUF con licencia propia) |
| Formato de pesos | safetensors (PEFT), GGUF (base Q4_K_M, adaptador f32, mmproj F16) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-2B, un transformer multimodal con codificador visual y proyector, del que no se detallan en la información disponible el número total de parámetros ni la composición del dataset de preentrenamiento. El LoRA tiene rango 16 y alpha 32, modifica 14 tensores y se aplica únicamente al último bloque de atención completa (bloque 23). El entrenamiento se realizó en BF16 congelado con 32 diálogos sintéticos de entrenamiento y 3 de validación, 2 épocas y 16 actualizaciones del optimizador. La pérdida de validación pasó de 1,570969 a 1,550289, mientras que la puntuación fija de siguiente acción en held-out se mantuvo en 7/8 antes y después. Los candidatos v2 posteriores no fueron adoptados.

El componente visual (proyector F16) y el modelo de decisión opcional LiquidAI/d1-2B-GGUF no fueron entrenados por el autor y se descargan por separado bajo sus propias licencias. No se trata de un MoE disperso entrenado conjuntamente: la aplicación enruta los componentes según necesidad. Los 14 tensores del adaptador GGUF se verificaron bit a bit contra el adaptador entrenado guardado; la diferencia entre entrenamiento BF16 y la inferencia Q4_K_M es únicamente de cuantización. Los scripts de entrenamiento y los hashes del dataset sintético están en la carpeta de reproducción del repositorio.

## Capacidades

- Generación de texto y razonamiento dentro del dominio administrativo escolar en coreano.
- Tool calling acotado: ejecución de acciones como introducir datos, seleccionar presupuesto, adjuntar archivos, guardar, reabrir y verificar registros.
- Entrada de imagen: soporte de image-text-to-text mediante el proyector visual F16 (mmproj) del modelo base.
- Integración con la aplicación Narae Hangul Office para flujos de oficina y contabilidad escolar.
- Capacidades multilingües limitadas a coreano e inglés.
- Razonamiento multi-paso dentro de un controlador acotado (20 etapas de herramientas en la prueba de integración registrada).
- No se documentan capacidades de audio, thinking mode extendido ni agentes autónomos fuera del runtime.

## Casos de uso

- Automatización de requisiciones escolares: el modelo, junto con el runtime preview.24, completó un ciclo sintético de requisición de 1 won (introducir, elegir presupuesto observado, añadir ítem, adjuntar bytes originales, guardar, reabrir desde consulta del servidor, verificar SHA256 del adjunto, borrar y verificar ausencia). Es adecuado porque el flujo está acotado y el controlador detiene la ejecución ante ambigüedad.
- Verificación de integridad documental: el modelo puede adjuntar y comprobar bytes y SHA256 de documentos en el flujo de oficina, lo que permite auditar que el archivo guardado coincide con el original.
- Asistencia en la interfaz de oficina coreana: selección de menús y acciones sobre la UI autenticada de la aplicación Narae Hangul Office, siempre que el usuario haya configurado sus credenciales locales.
- Procesamiento de documentos con imagen: gracias al proyector visual F16, puede recibir capturas o imágenes de documentos y combinarlas con instrucciones textuales en coreano.
- Pruebas de integración controladas: útil como banco de pruebas para pipelines de tool calling con parada ante presupuestos faltantes, identidades documentales ambiguas o escrituras inciertas.
- Experimentación con LoRA sobre modelos multimodales pequeños: el adaptador y los scripts de reproducción permiten estudiar el efecto de un LoRA de rango 16 sobre un único bloque de atención en tareas de siguiente acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos registrados son internos:

| Metrica | Antes | Despues |
|---|---|---|
| Perdida de validacion | 1,570969 | 1,550289 |
| Puntuacion held-out de siguiente accion | 7/8 | 7/8 |
| Actualizaciones del optimizador | no aplica | 16 (2 epocas) |
| Dialogos sinteticos train/val | no aplica | 32 / 3 |

Prueba de integración registrada (2026-11-01, runtime preview.24): un ciclo sintético de requisición de 1 won con 20 etapas de herramientas y 131,296 segundos de duración. El registro de prueba fue eliminado; no se realizaron envío de aprobaciones ni compras o pagos reales. Esta métrica mide el modelo más el runtime/controlador acotado, no la autonomía libre del modelo.

## Requisitos de hardware

- VRAM estimada: el base Q4_K_M ocupa 1.280.835.840 bytes (~1,19 GiB); el proyector visual F16 ocupa 668.227.264 bytes (~623 MiB); el adaptador f32 GGUF ocupa 2.557.408 bytes (~2,4 MiB). En total, menos de 2 GiB de pesos, más overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM; el ejemplo del autor usa `--gpu-layers 0` (inferencia en CPU), lo que indica que funciona sin GPU dedicada.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares con holgura; también en CPU.
- Opciones de despliegue: llama.cpp (llama-server con `--jinja`, cargando base GGUF + adaptador LoRA GGUF + mmproj), PEFT con Transformers (adaptador safetensors sobre el base original), y la aplicación Narae Hangul Office preview.24 o posterior.
- Latencia y throughput: no disponibles de forma general; la única medición registrada es de 131,296 segundos para 20 etapas de herramientas en un ciclo de integración concreto, no representativa del throughput de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Narae4-Qwen3.5-2B-Office-LoRA-v1 | 638.976 (adaptador) sobre base 2B | 8192 (config. ejemplo) | Apache-2.0 | Hugging Face, GGUF + PEFT | Especializado en oficina coreana; validación sin mejora |
| Qwen/Qwen3.5-2B (base) | no disponible | no disponible | no disponible en la informacion | Hugging Face | Modelo base multimodal sin adaptación de dominio |
| LiquidAI/d1-2B-GGUF | no disponible | no disponible | licencia propia del componente | Hugging Face | Compañero de decisión opcional, no entrenado por el autor |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no mejora la precisión held-out: 7/8 antes y 7/8 después del entrenamiento, con solo 32 diálogos sintéticos y 16 actualizaciones.
- El entrenamiento y la validación usan datos sintéticos; no se incluyen documentos escolares reales, identidades de estudiantes o personal, capturas de portal, sesiones, credenciales ni conversaciones privadas.
- La prueba de integración única no establece precisión general en trabajo escolar real.
- El flujo se detiene ante opciones de presupuesto faltantes, identidades documentales ambiguas o escrituras inciertas; no hay validación de envío de aprobaciones financieras, borrado arbitrario de registros existentes, múltiples presupuestos ni recorrido completo de rejillas virtualizadas.
- Los pesos por sí solos no proporcionan herramientas, integración con Windows ni autorización de acceso a la UI escolar: se requiere la aplicación y la configuración local del usuario.
- Riesgo de alucinación no cuantificado; al ser un modelo de 2B con adaptación mínima, la fiabilidad fuera del dominio acotado es baja.
- Licencia Apache-2.0 para los archivos Qwen y el LoRA Narae; el componente opcional LiquidAI tiene términos separados y debe descargarse bajo su propia licencia. La licencia MIT de la aplicación no sustituye las licencias de los modelos.
- Se debe conservar LICENSE y NOTICE del repositorio.
- El adaptador PEFT fija la revisión original del base Qwen en `adapter_config.json`; el base completo en Transformers no está incluido.
- Requiere una build de llama.cpp compatible con Qwen3.5 y su proyector visual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inhow/Narae4-Qwen3.5-2B-Office-LoRA-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- GGUF base y proyector (unsloth): https://huggingface.co/unsloth/Qwen3.5-2B-GGUF/tree/f6d5376be1edb4d416d56da11e5397a961aca8ae
- Compañero de decisión opcional: https://huggingface.co/LiquidAI/d1-2B-GGUF/tree/e968f6575f0d4fad928312d7af15cad90fd365c0
- Repositorio de reproducción: https://github.com/y5496694/Narae_hangul_office/tree/6d732d5e3b69e8598014cf2904fb27ff112050d4/experiments/narae4-office-20261031
- Guía de runtime y flujo de trabajo: https://github.com/y5496694/Narae_hangul_office/blob/6d732d5e3b69e8598014cf2904fb27ff112050d4/docs/school-accounting.md
