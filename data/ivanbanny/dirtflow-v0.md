# IvanBanny/dirtflow-v0

## Resumen

Dirtflow v0 es un modelo de generación y edición de construcciones de Minecraft a partir de texto, desarrollado por IvanBanny (usuario de Hugging Face) como un finetune de `microsoft/TRELLIS-text-xlarge`. El modelo resuelve un problema muy concreto: dado un prompt en lenguaje natural y una instantánea de la región editable junto con su contexto (los bloques que ya existen en el mundo), propone una edición que utiliza el vocabulario completo de estados de bloque de Minecraft 1.21.11 (29.669 estados legales, incluyendo propiedades como la orientación de una escalera). El mundo fuera de la selección permanece fijo.

Técnicamente se trata de un modelo de flow matching en dos etapas: una primera etapa de geometría basada en la estructura de TRELLIS XL (340.000 actualizaciones, pesos EMA) que muestrea la forma, y una segunda etapa de materiales que asigna estados de bloque mediante un flujo continuo (400.000 actualizaciones, pesos LIVE completos). El codificador de texto es un CLIP ViT-L/14 congelado con contexto de 77 tokens. El lienzo de trabajo es de 64 x 64 x 64 bloques, incluyendo el contexto circundante.

Es relevante ahora porque aborda la edición 3D condicionada por el entorno con un vocabulario discreto y cerrado (bloques de Minecraft), un caso poco habitual frente a los modelos text-to-3D de mallas o nubes de puntos. El modelo se distribuye como un bundle de 9,3 GB con un motor de inferencia propio que aún no se ha publicado en el momento de escribir esta ficha, por lo que su uso práctico está condicionado a la disponibilidad de dicho motor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow matching en dos etapas: geometría basada en TRELLIS XL + flujo continuo de estados de bloque |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens (codificador de texto CLIP ViT-L/14); lienzo de 64 x 64 x 64 bloques |
| Tipos de cuantización | no disponible (almacenamiento FP32, ejecución del denoiser en BF16 sobre CUDA) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (tensores de inferencia con `weights_only=True`) y `.safetensors` para el CLIP congelado |

## Arquitectura y entrenamiento

El modelo es un pipeline de dos etapas de flow matching. La etapa de geometría reutiliza la estructura de `microsoft/TRELLIS-text-xlarge`, con un códec de estructura congelado y pesos EMA seleccionados tras 340.000 actualizaciones. La etapa de materiales implementa un flujo continuo sobre estados de bloque, entrenada durante 400.000 actualizaciones con pesos LIVE completos (incluyendo el embedding y la cabeza categórica). El codificador de texto es un CLIP ViT-L/14 congelado con 77 tokens de contexto, y la salida se mapea al vocabulario de 29.669 estados de bloque legales de Minecraft 1.21.11.

El condicionamiento incluye, además del prompt, los estados de bloque observados, una región editable y un contexto de solo lectura. El motor aplica una política de inferencia corregida para el modelo de materiales continuo: tras seleccionar las coordenadas candidatas, fija la confianza editable normalizada a exactamente cero, preservando el flag de validez y el resto de características de condicionamiento. Esta corrección no modifica los pesos originales. La ejecución del denoiser se hace en BF16 sobre CUDA con almacenamiento de parámetros en FP32 y frecuencias posicionales nativas en FP32.

## Capacidades

- Generación de construcciones de Minecraft a partir de texto en inglés, con asignación de estados de bloque completos (incluidas propiedades direccionales).
- Edición condicionada por el entorno: el modelo recibe la región editable y el contexto circundante, y el motor restaura los bloques fuera de la selección para garantizar un límite de edición exacto.
- Cuatro tareas de edición: build/replace (generar dentro de la selección), complete (completar una estructura), repair (condicionar sobre una estructura dañada conservando sus posiciones ocupadas como candidatas de material) y materials (cambiar estados de bloque en posiciones ocupadas preservando la ocupación).
- Muestreo de forma seguido de asignación de materiales en dos etapas diferenciadas.
- Soporte de múltiples candidatos y guiado por escala (guidance scale configurable).
- Limpieza física (physics cleanup) y guiado por lotes (batched guidance) en el servicio a jugadores, salvo en la tarea de materiales.
- Sin soporte documentado de tool calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Construcción asistida en partidas de Minecraft: un jugador selecciona una región vacía, describe "una pequeña torre de vigilancia de piedra con tejado de madera" y el modelo propone una edición que puede previsualizar antes de aceptar, gracias al límite de edición exacto que restaura los bloques externos.
- Completado de estructuras a medio construir: con la tarea `complete`, el modelo rellena una selección que contiene una base parcial, manteniendo coherencia con el contexto de hasta 58 bloques por eje editable y tres bloques de contexto por lado.
- Reparación de construcciones dañadas: con la tarea `repair`, se condiciona sobre una estructura deteriorada conservando sus posiciones ocupadas como candidatos de material, útil para restaurar ruinas o secciones destruidas por explosiones.
- Reestilizado de materiales sin alterar la forma: con la tarea `materials`, se cambian los estados de bloque en posiciones ya ocupadas (por ejemplo, pasar de piedra a ladrillo) preservando la ocupación y saltándose la generación de forma y la limpieza física.
- Generación de contenido para servidores y mapas personalizados: el motor mantiene el modelo cargado entre peticiones y sirve a jugadores con guiado por lotes, lo que permite integrarlo en flujos de creación de mapas o mazmorras generadas por prompt.
- Prototipado de builds en herramientas de diseño: el par de etapas permite iterar sobre la forma (etapa 1) y los materiales (etapa 2) por separado, facilitando la exploración de variantes con la misma semilla y distintos ajustes de muestreador.
- Investigación en generación 3D discreta: el vocabulario cerrado de 29.669 estados de bloque y el lienzo de 64³ lo convierten en un banco de pruebas para flow matching sobre espacios discretos condicionados por el entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma cerrada; el autor advierte que el uso de memoria GPU depende de la selección y su contexto ocupado, y que una región que cabe en el lienzo puede exceder la VRAM disponible.
- Bundle completo: 9,3 GB (8,65 GiB), con `stage1.pt` de 4,47 GB, `stage2.pt` de 4,32 GB y el CLIP congelado de 0,49 GB.
- GPU: se requiere una GPU NVIDIA con soporte BF16 y driver compatible. No se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- El perfil por defecto mantiene la etapa inactiva en memoria de CPU para reducir el uso de VRAM.
- Carga en CPU soportada, pero la velocidad de generación interactiva en CPU no está probada.
- Despliegue: motor de inferencia propio (Dirtflow Engine) con launcher `./start --model ./dirtflow-v0` (o `.\start.cmd` en Windows); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Runtime de referencia: Python 3.12, PyTorch 2.12.0 con CUDA 13.2 y Transformers 5.13.0.
- Ajustes por defecto: 30 pasos Euler por etapa, guidance scale 5, un candidato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / lienzo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dirtflow v0 | Flow matching en dos etapas sobre estados de bloque de Minecraft | 77 tokens de texto; lienzo 64³ bloques | Apache 2.0 | Pesos públicos; motor de inferencia pendiente de publicación |
| microsoft/TRELLIS-text-xlarge | Text-to-3D (modelo base) | no disponible | no disponible en la información proporcionada | Público en Hugging Face |
| Alternativas text-to-3D genéricas | Mallas o representaciones 3D continuas | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre Dirtflow v0 y otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- El motor de inferencia público (Dirtflow Engine) aún no está publicado; sin él, los pesos no son utilizables de forma directa pese a estar descargables.
- El modelo solo entiende inglés (`language: en`).
- El contexto de texto está limitado a 77 tokens por el CLIP ViT-L/14 congelado.
- El lienzo es de 64 x 64 x 64 bloques incluyendo contexto; el motor actual soporta hasta 58 bloques por eje editable con tres bloques de contexto por lado, y la instantánea con padding debe caber sin redimensionarse.
- La calidad del encaje de la construcción generada con su entorno depende del modelo; el límite de edición exacto solo garantiza que los bloques externos se restauran.
- La política de inferencia corregida (confianza editable normalizada a cero) es obligatoria para este par de checkpoints; usarla de otro modo puede producir resultados distintos.
- Distintos ajustes de muestreador (guiado secuencial frente a por lotes, física activada o desactivada) producen estados de bloque diferentes incluso con la misma semilla; es necesario registrar runtime, ajustes y semilla al comparar salidas.
- El uso de VRAM depende de la selección y su contexto ocupado; una región que cabe en el lienzo puede agotar la memoria disponible.
- No se documentan sesgos conocidos ni tasas de alucinación; al tratarse de un modelo de generación 3D, el riesgo principal es producir construcciones que no encajen estéticamente o estructuralmente con el entorno.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `microsoft/TRELLIS-text-xlarge` del que deriva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IvanBanny/dirtflow-v0
- Perfil del autor: https://huggingface.co/IvanBanny
- Modelo base: https://huggingface.co/microsoft/TRELLIS-text-xlarge
