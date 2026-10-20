# nvidia/Kimodo-SOMA-RP-ArdyRep-v1.2

## Resumen

Kimodo-SOMA-RP-ArdyRep-v1.2 es un modelo de difusión para la generación de movimiento esquelético humano en 3D, desarrollado por NVIDIA (NV Labs / nv-tlabs) dentro de la familia Kimodo (**Ki**nematic **Mo**tion **D**iffusi**o**n). A partir de un prompt de texto y, opcionalmente, de restricciones de movimiento (poses de cuerpo completo, posiciones de joints end-effector, trayectorias y waypoints), genera animaciones de un esqueleto SOMA de 30 articulaciones a 30 fps, con una duración máxima de 300 frames (10 segundos).

La particularidad de esta variante es la representación de movimiento Ardy: predice rotaciones globales de raíz y de cada joint, usando la trayectoria cruda de la cadera (raw hip trajectory) como raíz, en lugar de la raíz suavizada del resto de modelos Kimodo. Esto hace que sus salidas y sus convenciones de restricciones sean directamente interoperables con los modelos ARDY de NVIDIA. Está entrenado sobre los splits corregidos (la v1.1 tenía fuga de secuencias de test de BONES-SEED en entrenamiento), por lo que sus métricas son comparables a las de modelos entrenados con los splits recomendados.

Con 283.266.414 parámetros (≈282 M) y un repo de 1,1 GB en safetensors, es un modelo ligero que se ejecuta en PyTorch sobre GPU NVIDIA Ampere, Lovelace o Blackwell, y que NVIDIA declara listo para uso comercial bajo su propia licencia Open Model License.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión con transformer de dos etapas (generación de movimiento esquelético 3D) |
| Parámetros totales | 283.266.414 (≈282 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la generación está acotada a 300 frames (10 s a 30 fps) |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | no disponible (el codificador de texto que consume el prompt no se detalla en la model card) |
| Licencia | NVIDIA Open Model License (identificador `license: other` en HuggingFace) |
| Formato de pesos | safetensors (repo de 1,1 GB) |
| Esqueleto | SOMA de 30 articulaciones |
| Representación de movimiento | Ardy: rotaciones globales de raíz y de joints, con trayectoria cruda de cadera como raíz |
| Entradas | texto (string), duración (entero, frames) y restricciones de pose (matrices) |
| Salidas | traslación de raíz (`num_frames` × 3) y rotaciones de joints (`num_frames` × 30 × 3 × 3) |
| Frecuencia de muestreo | 30 fps |
| Duración máxima | 10 s (300 frames) |
| Runtime | PyTorch (librería `kimodo`) |
| Hardware compatible | NVIDIA Ampere, Blackwell y Lovelace |
| Sistemas operativos | Linux y Windows |

## Arquitectura y entrenamiento

Kimodo emplea un transformer de dos etapas que actúa como red de ruido de un proceso de difusión sobre representaciones de movimiento esquelético. El modelo se condiciona simultáneamente por texto, por duración en frames y por restricciones geométricas opcionales: posiciones 3D de joints, matrices de rotación de 3×3, dirección de heading en 2D y posición de raíz en 2D, cada una asociada a un índice de frame concreto. La salida es una secuencia de traslación de raíz y rotaciones por articulación a 30 fps. En esta variante, la raíz se define sobre la trayectoria cruda de la cadera (representación Ardy) en lugar de la raíz suavizada que usan las demás variantes Kimodo, lo que alinea las convenciones de constraint y de salida con los modelos ARDY.

El entrenamiento utiliza el dataset propietario Bones Rigplay: 700 horas de captura de movimiento humano sobre el esqueleto SOMA de 30 articulaciones, con anotaciones textuales asociadas (menos de 1000 millones de tokens de texto). La recogida de datos es automática/mediante sensores y el etiquetado es híbrido (automático y humano). La model card no menciona fases de RLHF ni de DPO, algo esperable en un modelo de difusión condicionado por texto. Esta versión v1.2 se entrenó sobre los splits corregidos tras detectarse en v1.1 que algunas secuencias de test de BONES-SEED habían contaminado el entrenamiento; el sufijo v1.2 iguala la numeración de su hermano de raíz suavizada, con el que comparte datos y receta de generación.

## Capacidades

- Generación text-to-motion: produce animaciones de cuerpo completo a partir de una descripción textual y una duración en frames.
- Control por restricciones: permite fijar poses de cuerpo completo en frames concretos, posiciones de joints end-effector, trayectorias (paths) y waypoints que el personaje debe seguir.
- Control de duración explícito: la longitud de la secuencia se especifica como número de frames, hasta un máximo de 300 (10 s a 30 fps).
- Salida esquelética completa: traslación de raíz más rotaciones de las 30 articulaciones del esqueleto SOMA, lista para retargeting o integración en motores de animación.
- Interoperabilidad con ARDY: la convención de raíz cruda de cadera permite combinar o comparar directamente con los modelos ARDY de nv-tlabs.
- Evaluación reproducible: compatible con el Motion Generation Benchmark del proyecto, construyendo el test suite con `create_benchmark.py --motion_rep ardy`.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio ni generación de texto: es un modelo exclusivamente de movimiento.

## Casos de uso

- Animación para videojuegos: generar clips de movimiento de hasta 10 s a partir de descripciones textuales y pasarlos al motor con retargeting al esqueleto del personaje, reduciendo el coste de captura para animaciones secundarias o de multitud.
- Demonstrations para robots humanoides: usar la variante sobre esqueleto Unitree G1 (Kimodo-G1) o retargetear la salida SOMA para producir demonstrations de locomoción y manipulación que alimenten políticas de control.
- Digital twins e simulación industrial: generar movimientos de operarios virtuales en gemelos digitales de plantas, con restricciones de trayectoria para que el avatar siga rutas concretas por la instalación.
- Datos sintéticos etiquetados: producir pares movimiento-texto a escala para aumentar datasets de entrenamiento de modelos de reconocimiento de acción o de captioning de movimiento.
- Previsualización rápida en producción audiovisual: generar blocking de escenas con restricciones de pose clave (por ejemplo, un salto o un impacto) antes de pasar a captura definitiva.
- Prototipado de control por waypoints: definir una ruta en 2D sobre el plano del suelo y obtener el ciclo de marcha correspondiente, útil para probar sistemas de navegación de agents virtuales.
- Herramientas de autoría para animadores sin experiencia técnica: la model card sitúa el modelo como accesible a usuarios de cualquier nivel para crear movimiento 3D en su aplicación, con control mediante texto y constraints de pose.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona la existencia del Motion Generation Benchmark del proyecto Kimodo y el comando para construir su test suite en la convención Ardy, pero no incluye cifras numéricas de evaluación en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 1,1 GB en el repo, lo que corresponde a unos 1,13 GB en fp32 para 283 M de parámetros (≈0,57 GB en fp16). Son cifras derivadas del recuento de parámetros, no publicadas por el autor; el consumo real depende del batch y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU NVIDIA Ampere, Lovelace o Blackwell, que son las microarquitecturas declaradas compatibles. No se especifican modelos concretos.
- Cabe holgadamente en GPU consumer: por tamaño de pesos, una RTX 4090, 4080, 3090 o incluso tarjetas de 8 GB deberían alojar el modelo, aunque el autor no publica requisitos oficiales de VRAM.
- Opciones de despliegue: PyTorch con la librería `kimodo`, sobre Linux o Windows. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni formatos GGUF u ONNX, que además no encajan con la naturaleza del modelo (difusión sobre secuencias de movimiento).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Esqueleto / dataset | Parámetros | Duración máx. | Representación de raíz | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kimodo-SOMA-RP-ArdyRep-v1.2 | SOMA 30 joints / Bones Rigplay | 283 M | 10 s (300 frames) | Cruda (Ardy), interoperable con ARDY | NVIDIA Open Model License | HuggingFace, GitHub |
| Kimodo-SOMA-RP-v1.2 | SOMA 30 joints / Bones Rigplay | no disponible | 10 s (según familia) | Suavizada | NVIDIA Open Model License | HuggingFace |
| Kimodo-SOMA-SEED | SOMA 30 joints / Bones-SEED (abierto) | no disponible | 10 s (según familia) | Suavizada | NVIDIA Open Model License | HuggingFace |
| Kimodo-G1-RP / G1-SEED | Unitree G1, 34 joints / Rigplay o Bones-SEED | no disponible | 10 s (según familia) | Suavizada | NVIDIA Open Model License | HuggingFace |
| Kimodo-SMPLX-RP | SMPLX-body, 22 joints / Rigplay | no disponible | 10 s (según familia) | Suavizada | NVIDIA Open Model License | HuggingFace |

No se dispone en la información proporcionada de datos de otros modelos de generación de movimiento comparables (por ejemplo, alternativas de difusión text-to-motion de otros autores) ni de métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Duración acotada: el máximo es de 300 frames (10 s) por generación; no hay mecanismo documentado de extensión o continuación entre secuencias, por lo que movimientos largos requieren concatenación manual con posibles discontinuidades.
- Convención de raíz específica: al usar la trayectoria cruda de cadera, mezclar constraints o resultados con las variantes de raíz suavizada (o evaluar con el test suite por defecto) produce comparaciones y condicionamientos incorrectos.
- Dataset propietario: Bones Rigplay son 700 horas de captura propia; no se detalla la composición demográfica, de estilos ni de condiciones de captura, por lo que el sesgo de cobertura (tipos de cuerpo, cultural, de vestuario) no es auditable.
- Calidad física no garantizada: la model card no reporta métricas de deslizamiento de pies, penetración de suelo ni plausibilidad física; en producción conviene validar estos artefactos por caso de uso.
- Idiomas: no se especifica qué idiomas acepta el codificador de texto; no hay garantía documentada de funcionamiento del prompt en castellano.
- Licencia: no es una licencia OSI. La NVIDIA Open Model License impone sus propios términos para uso comercial; hay que revisar el acuerdo enlazado antes de desplegar.
- Dependencia de hardware NVIDIA: el modelo está diseñado y optimizado para GPU NVIDIA; no se documenta soporte de CPU ni de aceleradores de otros fabricantes.
- Historial de fuga de datos: la v1.1 contaminó su entrenamiento con secuencias de test de BONES-SEED. Esta v1.2 corrige el problema, pero implica que comparaciones con resultados antiguos deben hacerse con cuidado.
- Validación requerida: NVIDIA recomienda explícitamente pruebas iterativas a nivel de unidad y de sistema (metodología en V) con datos del caso de uso antes de integrar el modelo en un sistema en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/Kimodo-SOMA-RP-ArdyRep-v1.2
- Repositorio en GitHub: https://github.com/nv-tlabs/kimodo
- Informe técnico (PDF): https://research.nvidia.com/labs/sil/projects/kimodo/assets/kimodo_tech_report.pdf
- Página del proyecto: https://research.nvidia.com/labs/sil/projects/kimodo/
- Modelos ARDY (nv-tlabs): https://github.com/nv-tlabs/ardy
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license

Las búsquedas web realizadas no devolvieron enlaces específicos del modelo; todos los enlaces anteriores proceden de la model card y de la información del repositorio.
