# chibifire/interactor-skintokens-viewer

## Resumen

`chibifire/interactor-skintokens-viewer` no es un modelo de lenguaje ni un modelo generativo de texto: es un paquete de aplicación de escritorio (3,9 GB) que distribuye un visor 3D construido en Godot junto con el modelo SkinTokens de *skinning* automático y sus pesos en formato GGUF BF16. Lo publica el usuario chibifire como *repackaging* de [VAST-AI/SkinTokens](https://huggingface.co/VAST-AI/SkinTokens), convertido previamente a GGUF en [chibifire/SkinTokens-GGUF-BF16](https://huggingface.co/chibifire/SkinTokens-GGUF-BF16) en el commit `912d4d1`.

El problema que resuelve es concreto: asignar esqueleto y pesos de piel (*rigging*) a mallas 3D sin pasar por un DCC como Blender ni por servicios en la nube. El usuario arrastra un `.glb`, pulsa la tecla R y, tras uno o dos minutos de cómputo en su propia GPU, obtiene un `<nombre>.rigged.glb` guardado junto al fichero original. Todo el proceso es offline: cada paquete incluye el visor, el programa de rigging (`skintokens.elf`) y los tres ficheros de pesos.

Es relevante para pipelines de videojuegos y experiencias sociales (V-Sekai) porque elimina la dependencia de internet y de GPUs remotas en una fase del *asset pipeline* que tradicionalmente es manual. El visor reutiliza el `.pck` de [V-Sekai-fire/entities-model-explorer](https://github.com/V-Sekai-fire/entities-model-explorer) y ejecuta el programa de rigging dentro de la librería godot-sandbox. No hay información sobre arquitectura interna del modelo de skinning, número de parámetros ni datos de entrenamiento en la documentación proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un transformer ni un LLM: aplicación Godot (visor) + modelo de skinning automático SkinTokens ejecutado vía godot-sandbox; arquitectura interna del modelo no disponible |
| Parametros totales | no disponible (pesos distribuidos en tres ficheros GGUF BF16; el repo completo ocupa 3,9 GB, incluyendo binarios y visor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no procesa texto) |
| Tipos de cuantizacion | BF16 (único formato publicado, GGUF) |
| Idiomas soportados | no disponible (la interfaz y la documentación están en inglés) |
| Licencia | MIT para visor, Godot y pesos; BSD-3-Clause para la librería godot-sandbox; crédito del modelo a VAST-AI |
| Formato de pesos | GGUF (BF16); visor en `.pck` de Godot; binarios nativos por plataforma y `SHA256SUMS` con checksums |

Especificaciones de plataforma:

| Parametro | Valor |
|---|---|
| Plataformas empaquetadas | macOS arm64 (`.zip`), Windows x86-64 (`.zip`), Linux x86-64 (`.tar`) |
| Formatos de entrada del visor | `.glb`, `.gltf`, `.vrm` |
| Formato de entrada del auto-rig | `.glb` (tecla R) |
| Formato de salida | `.rigged.glb`, guardado junto al fichero fuente |
| Backend gráfico | Metal en macOS, Vulkan en Windows |
| Requiere conexión | No (paquete autocontenido) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-18 |

## Arquitectura y entrenamiento

El paquete no expone detalles de entrenamiento del modelo de skinning. Lo que sí documenta el autor es la cadena de componentes: un ejecutable Godot (`skintokens-viewer`, `.exe` en Windows), un `.pck` con el visor heredado de `entities-model-explorer`, la librería godot-sandbox que hospeda el programa `skintokens.elf` y un directorio `w/` con los tres ficheros de pesos procedentes de `chibifire/SkinTokens-GGUF-BF16` en el commit `912d4d1` (una conversión de formato de los pesos originales de VAST-AI/SkinTokens). No se indica número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF/DPO; ese modelo no se entrena con texto, sino para predecir asignaciones de huesos y pesos de piel sobre mallas 3D.

La innovación práctica del paquete es de empaquetado y ejecución local: el modelo corre en la GPU del usuario mediante el backend gráfico nativo (Metal o Vulkan) sin conexión a internet, y el resultado se escribe de forma determinista en disco. Las pruebas publicadas apuntan a una reproducibilidad alta: en macOS sobre un Apple M2 Pro (Metal) tres personajes se riggearon de forma byte-idéntica al rig de referencia; en Windows sobre una NVIDIA RTX 4090 (Vulkan) un personaje produjo las mismas articulaciones que la referencia, con pesos de piel que difieren como máximo 0,000001. No se documenta ninguna técnica de decodificación especulativa, atención lineal ni optimización equivalente.

## Capacidades

- Auto-rigging de mallas humanoides: asigna esqueleto y pesos de piel a un `.glb` y exporta `<nombre>.rigged.glb`.
- Visualización de modelos 3D en formatos `.glb`, `.gltf` y `.vrm` dentro del visor Godot.
- Ejecución completamente offline: el paquete incluye visor, programa de rigging y pesos.
- Cómputo en GPU local, con backend Metal en macOS y Vulkan en Windows.
- Reproducibilidad verificable: checksums SHA-256 publicados en `SHA256SUMS` y comparación contra rigs de referencia.
- Flujo de uso mínimo: arrastrar el fichero a la ventana y pulsar R, sin línea de comandos ni configuración.
- No ofrece generación de texto, razonamiento, código, matemáticas, visión artificial, *tool calling*, comportamiento agente ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- **Prototipado rápido de personajes en Godot**: un desarrollador arrastra un `.glb` de bloqueo y obtiene en uno o dos minutos un modelo con esqueleto para probar animaciones en el motor, sin salir del flujo de trabajo ni abrir Blender.
- **Pipelines de assets en estudios pequeños sin acceso a la nube**: al ser offline y autocontenido, permite riggear material con propiedad intelectual sensible en estaciones de trabajo aisladas, cumpliendo requisitos de confidencialidad.
- **Conversión por lotes semiautomática en Windows**: sobre una RTX 4090 con Vulkan, el proceso produce resultados con desviación de pesos inferior a 0,000001 respecto a la referencia, lo que hace viable usarlo como paso previo a una revisión manual en un pipeline de CI de assets.
- **Previsualización de avatares VRM en experiencias sociales tipo V-Sekai**: el visor abre `.vrm` directamente y permite inspeccionar el modelo antes y después de riggearlo, útil para validar avatares de usuario antes de subirlos a la plataforma.
- **Evaluación comparativa de rigs**: al generar salidas byte-idénticas a la referencia en macOS, sirve como herramienta de verificación para comprobar si un rig de producción coincide con el resultado esperado del modelo.
- **Formación y demostraciones técnicas**: el flujo de dos pasos (arrastrar, pulsar R) y la ausencia de dependencias de red lo hacen adecuado para talleres donde el alumnado no puede instalar toolchains complejas.
- **Investigación sobre skinning automático**: al estar los pesos en GGUF BF16 y publicados por separado en `chibifire/SkinTokens-GGUF-BF16`, se pueden inspeccionar o reutilizar fuera del visor para experimentos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo documenta pruebas funcionales de equivalencia con un rig de referencia:

| Entorno | Hardware | Backend | Casos probados | Resultado |
|---|---|---|---|---|
| macOS | Apple M2 Pro | Metal | 3 personajes | Rig byte-idéntico a la referencia |
| Windows | NVIDIA RTX 4090 | Vulkan | 1 personaje | Mismas articulaciones; pesos de piel con diferencia máxima de 0,000001 |
| Linux | no disponible | no disponible | 0 (auto-rig no probado) | Sin datos |

Tiempo de rigging declarado por el autor: entre uno y dos minutos por modelo. No hay datos de throughput agregado, latencia por vértice ni consumo de VRAM.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El paquete pesa 3,9 GB y los pesos van en BF16, pero el autor no publica el pico de memoria durante la inferencia.
- **GPU recomendadas**: los únicos entornos validados son Apple M2 Pro (Metal) y NVIDIA RTX 4090 (Vulkan). No hay lista de GPUs soportadas ni mínimos declarados.
- **Compatibilidad con GPU de consumo**: sí, al menos una RTX 4090 de consumo ha completado el proceso con éxito; se desconoce el comportamiento en GPUs de gama media o en gráficas integradas.
- **Aceleración**: requiere un backend gráfico compatible con Metal (macOS arm64) o Vulkan (Windows x86-64). No se menciona soporte de CPU pura ni de CUDA directo.
- **Opciones de despliegue**: ejecutable de escritorio empaquetado (Godot + godot-sandbox). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este caso de uso.
- **Latencia**: uno o dos minutos por personaje según el autor; sin desglose por complejidad de malla.
- **Almacenamiento**: 3,9 GB de repositorio; conviene mantener todos los ficheros en una única carpeta, tal como indica el autor.

## Comparativa con modelos similares

| Modelo / paquete | Tipo | Pesos | Auto-rig | Ejecución local | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `chibifire/interactor-skintokens-viewer` | Visor Godot + auto-rig empaquetado | GGUF BF16 (3 ficheros) | Sí, tecla R sobre `.glb` | Sí, offline, GPU local | MIT (BSD-3-Clause la sandbox) | 3 paquetes: macOS arm64, Windows x86-64, Linux x86-64 |
| `VAST-AI/SkinTokens` | Modelo original de skinning | Formato original (no GGUF) | Sí, como modelo | Depende del usuario | no disponible en la información | HuggingFace |
| `chibifire/SkinTokens-GGUF-BF16` | Conversión de formato de los pesos | GGUF BF16 | No incluye visor ni programa | Sí, pero requiere tooling propio | MIT según la ficha del visor | HuggingFace (commit `912d4d1`) |

No se dispone de datos de rendimiento de las alternativas ni de otros sistemas de auto-rigging comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no genera texto, no razona, no responde preguntas y no admite *prompts*. Cualquier evaluación con benchmarks tipo MMLU, HumanEval o GSM8K carece de sentido.
- **Auto-rig solo con `.glb`**: el visor abre `.glb`, `.gltf` y `.vrm`, pero la tecla R está documentada únicamente para `.glb`.
- **Linux sin validar**: el autor indica explícitamente que Linux no se ha probado con auto-rig; el paquete existe, pero la función principal no está verificada.
- **macOS sin notarizar**: es necesario ejecutar `xattr -dr com.apple.quarantine skintokens-viewer` antes del primer arranque, lo que puede chocar con políticas de seguridad corporativas.
- **Aviso de SmartScreen en Windows**: el primer arranque requiere "Más información" y "Ejecutar de todos modos"; en entornos gestionados esto puede estar bloqueado por IT.
- **Riesgo de artefactos de skinning**: no hay documentación sobre casos límite (mallas no humanoides, topologías atípicas, accesorios, ropa suelta); la única validación publicada cubre cuatro personajes en total.
- **Sesgos**: no disponible. No se documenta la composición del dataset de entrenamiento original de SkinTokens, por lo que se desconoce si el modelo funciona peor con determinadas proporciones corporales, morfologías o estilos de modelado.
- **Licencias y atribución**: el visor, Godot y los pesos se declaran MIT, y la librería godot-sandbox BSD-3-Clause. El crédito del modelo corresponde a VAST-AI; conviene revisar la licencia de los pesos originales antes de un uso comercial a gran escala.
- **Madurez del proyecto**: 0 descargas y 0 likes en el momento de la consulta, sin issues ni comunidad documentada. No hay garantía de mantenimiento ni de soporte.
- **Trazabilidad de los pesos**: los pesos incluidos provienen de un commit concreto (`912d4d1`) de un repositorio de conversión de formato; no se documenta el proceso de conversión ni las posibles pérdidas de precisión respecto al original.

## Enlaces

- [HuggingFace: chibifire/interactor-skintokens-viewer](https://huggingface.co/chibifire/interactor-skintokens-viewer)
- [HuggingFace: chibifire/SkinTokens-GGUF-BF16](https://huggingface.co/chibifire/SkinTokens-GGUF-BF16)
- [HuggingFace: VAST-AI/SkinTokens](https://huggingface.co/VAST-AI/SkinTokens)
- [GitHub: V-Sekai-fire/entities-model-explorer](https://github.com/V-Sekai-fire/entities-model-explorer)
