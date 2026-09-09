# fideus-labs/impact-torchscript-models

## Resumen

fideus-labs/impact-torchscript-models es un repositorio de extractores de características TorchScript para ecografías 2D en modo B, desarrollado por fideus-labs. Empaqueta encoders de modelos de visión preentrenados (MAE ViT-B/16 y SAM ViT-B) bajo el contrato de extracción de la métrica de registro IMPACT, que compara características aprendidas en lugar de intensidades de píxeles. Los modelos se integran con ITKIMPACT y Elastix en C++, eliminando la dependencia de Python en producción.

La colección contiene cuatro modelos: USF-MAE, SAMUS, URFM y UltraFedFM. Solo USF-MAE y SAMUS se distribuyen directamente; URFM y UltraFedFM están catalogados pero deben construirse desde los pesos originales, que están detrás de accesos restringidos. Todos los modelos son encoders ViT-B con capas características de los bloques 2, 5, 8 y 11, salvo SAMUS, que añade un cuello de 256 canales y exige un tamaño de entrada fijo de 256×256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MAE ViT-B/16 (USF-MAE, URFM, UltraFedFM) y SAM ViT-B (SAMUS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | per-model (MIT para USF-MAE, SAMUS y URFM; Apache-2.0 para UltraFedFM) |
| Formato de pesos | TorchScript (.pt) |

### Modelos incluidos en el repositorio

| Modelo | Arquitectura | Capas de características | Canales de entrada | Tamaño de patch | Licencia | Incluido |
|---|---|---|---|---|---|---|
| `US/USF-MAE` | MAE ViT-B/16 | 4 mapas, 768 canales, stride 16 | 3 | `0 0` (frame completo) o múltiplo de 16 | MIT | Si |
| `US/SAMUS` | SAM ViT-B | 5 mapas (4 mapas de 768 canales + cuello de 256) | 1 | `256 256` fijo | MIT | Si |
| `US/URFM` | MAE ViT-B/16 + BiomedCLIP | 4 mapas, 768 canales, stride 16 | 3 | `0 0` (frame completo) o múltiplo de 16 | MIT | No (construir) |
| `US/UltraFedFM` | MAE ViT-B/16 federado | 4 mapas, 768 canales, stride 16 | 3 | `0 0` (frame completo) o múltiplo de 16 | Apache-2.0 | No (construir) |

## Arquitectura y entrenamiento

Los modelos del repositorio son exportaciones TorchScript de los encoders de modelos de ecografía publicados por sus autores originales. La arquitectura base es ViT-B/16 para los modelos MAE (USF-MAE, URFM, UltraFedFM) y una adaptación del image encoder de SAM para SAMUS. En todos los casos, se extraen mapas de características de los bloques de atención global 2, 5, 8 y 11, lo que produce mapas de 768 canales con stride 16. SAMUS añade un cuello de 256 canales y genera una cuadrícula de 32×32 a partir de un tile de 256×256 píxeles.

Los pesos originales no se modifican; el wrapper del repositorio añade la normalización propia del modelo, la selección de capas y la firma `forward` uniforme esperada por IMPACT. La información sobre los datos de entrenamiento de cada modelo original está en los papers y repositorios citados en la procedencia. No se realiza ningún proceso de RLHF o DPO, ya que no son modelos de lenguaje. La innovación técnica principal es la capacidad de ejecutar estos extractores en C++ puro a través de TorchScript, lo que permite integrarlos en ITKIMPACT y Elastix sin un runtime de Python.

## Capacidades

- Extracción de mapas de características semánticas de ecografías 2D en modo B, devolviendo exactamente el número de mapas solicitado (más profundo primero).
- Normalización incorporada: cada wrapper lleva la normalización del modelo original, por lo que no se necesita preprocesamiento de intensidad adicional.
- Soporte de entrada de 1 canal (SAMUS) o 3 canales (modelos MAE), con canal único o triple según el modelo.
- Integración directa con ITKIMPACT en C++/Elastix mediante TorchScript, sin dependencia de Python en producción.
- Interfaz de extracción unificada (`forward` con parámetros `nb_layers`, `stats`, `direction`) que permite que las herramientas lean este repositorio y el upstream `VBoussot/impact-torchscript-models` con el mismo código.
- Registro de imágenes basado en similitud semántica mediante la métrica IMPACT, en lugar de comparar intensidades de píxeles.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-step.

## Casos de uso

- Registro de ecografías longitudinales: alinear imágenes del mismo paciente adquiridas en sesiones distintas para comparar la evolución de lesiones. La métrica IMPACT utiliza características semánticas que son más robustas que la intensidad ante cambios de ganancia o ecogenicidad.
- Registro multimodal: combinar ecografías con otras modalidades (por ejemplo, resonancia magnética) mediante la similitud de características aprendidas, lo que es útil en investigación oncológica.
- Integración en pipelines de registro Elastix en C++: los archivos TorchScript se cargan directamente en ITKIMPACT, permitiendo el registro no rígido en entornos clínicos sin Python.
- Extracción de características para aprendizaje automático: los mapas de características se pueden usar como entrada para clasificadores de patologías hepáticas, renales o tiroideas, o como backbone para tareas de segmentación.
- Transferencia de aprendizaje: los encoders preentrenados sirven como inicialización para nuevas tareas de ecografía cuando se dispone de pocos datos etiquetados.
- Evaluación comparativa de encoders de ecografía: el repositorio permite probar USF-MAE, SAMUS, URFM y UltraFedFM bajo la misma interfaz y seleccionar el más adecuado para una tarea de registro o análisis de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendada: no especificada. Se recomienda una GPU NVIDIA con CUDA para acelerar la extracción de características, aunque los modelos pueden ejecutarse en CPU.
- Compatibilidad con GPU de consumo: no se dispone de datos que lo confirmen. Dado el tamaño de los pesos (el repositorio ocupa 0.9 GB), es plausible que quepan en GPUs de consumo, pero no hay una cifra verificada.
- Opciones de despliegue: TorchScript integrado en ITKIMPACT y Elastix. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Repositorio | Modelos | Ámbito | Licencia |
|---|---|---|---|
| fideus-labs/impact-torchscript-models | 4 modelos (2 incluidos) | Ecografía 2D en modo B, registro semántico | per-model (MIT/Apache-2.0) |
| VBoussot/impact-torchscript-models | 30 modelos | Propósito general, misma interfaz de extracción de características | per-model |

El repositorio upstream `VBoussot/impact-torchscript-models` es la referencia principal: contiene 30 modelos de propósito general con el mismo formato de directorios y la misma herramienta de lectura. fideus-labs se centra en modelos específicos de ecografía y no redistribuye dos de los cuatro modelos catalogados.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información disponible sobre sesgos de los modelos originales; al ser modelos médicos, es posible que existan sesgos ligados a los datos de entrenamiento (especialmente en ecografía), pero no han sido evaluados en la información proporcionada.
- Riesgo de alucinación: no aplica, ya que el modelo no genera texto ni contenido sintético; solo produce mapas de características.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje, por lo que no soporta tareas de lenguaje natural.
- US/SAMUS solo funciona con un tamaño de entrada fijo de 256×256 píxeles, lo que puede limitar su uso con imágenes de otras dimensiones o espaciados.
- URFM y UltraFedFM no se redistribuyen en este repositorio. Hay que construirlos desde los pesos originales, que están detrás de accesos restringidos (un repositorio de Hugging Face con gating y enlaces de Google Drive limitados a cuentas concretas).
- La licencia general es "per-model": cada modelo tiene su propia licencia y atribución. Antes de un uso comercial, hay que revisar los archivos `LICENSES/` y `NOTICE`.
- El registro mediante IMPACT no está validado clínicamente; los resultados deben ser evaluados por expertos antes de su uso en entornos médicos reales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fideus-labs/impact-torchscript-models
- Repositorio upstream: https://huggingface.co/VBoussot/impact-torchscript-models
- ITKIMPACT: https://github.com/InsightSoftwareConsortium/ITKIMPACT
- Implementación de IMPACT: https://github.com/vboussot/ImpactLoss
- Paper de SAMUS: https://doi.org/10.48550/arXiv.2309.06824
- Código de USF-MAE: https://github.com/Yusufii9/USF-MAE
- Código de SAMUS: https://github.com/xianlin7/SAMUS
- Repositorio de URFM: https://huggingface.co/QingboKang/URFM
- Código de UltraFedFM: https://github.com/yuncheng97/UltraFedFM
