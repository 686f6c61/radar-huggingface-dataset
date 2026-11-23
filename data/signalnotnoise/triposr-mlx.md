# signalNotNoise/triposr-mlx

## Resumen

`signalNotNoise/triposr-mlx` es un bundle de pesos convertidos del modelo TripoSR de Stability AI y Tripo AI, adaptados para su uso con el runtime MLX Swift en el framework `apple-mlx-foundations`. TripoSR es un modelo de reconstruccion 3D a partir de una unica imagen (image-to-3D) basado en una arquitectura transformer con representacion triplanar, y este repositorio no entrena ni ajusta el modelo original: se limita a remapear claves y layouts del checkpoint upstream para que los modulos Swift puedan cargarlo.

La relevancia de este paquete es de infraestructura mas que de modelado: permite ejecutar TripoSR de forma nativa en el ecosistema Swift/MLX de Apple, algo que el checkpoint original (orientado a Python y PyTorch) no ofrece directamente. El artefacto canonico es `triposr_swift_ready.safetensors`, y el bundle incluye ficheros de procedencia, checksums SHA-256, licencias y resumenes de validacion de paridad y de generacion de malla.

El repositorio tiene un tamano de 1.7 GB, licencia MIT (heredada del release upstream de TripoSR) y cero descargas en el momento de la consulta. La conversion fija la revision upstream `5b521936b01fbe1890f6f9baed0254ab6351c04a`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con representacion triplanar (TripoSR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`triposr_swift_ready.safetensors`) |

## Arquitectura y entrenamiento

El modelo subyacente, TripoSR, es un sistema de reconstruccion 3D de una sola imagen que combina un backbone transformer con una representacion triplanar para predecir densidad y color, a partir de los cuales se extrae una malla. Este repositorio concreto no entrena ni ajusta el modelo: es una conversion de formato y layout del checkpoint upstream, con las claves remapeadas para los modulos Swift y un loader que verifica formas y rechaza claves no utilizadas.

La validacion incluida cubre paridad de tensores Python-Swift (tokens, backbone, triplanos, densidad y color) con correlacion alta pero sin ser bit-exacta, y un smoke test de generacion de malla en Swift. El autor indica explicitamente que el texturizado (texture baking) y la eliminacion de fondo no estan incluidos en la ruta Swift, y que esos pasos siguen cubiertos por el `run.py` de Python. No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generacion de malla 3D a partir de una unica imagen (image-to-3D).
- Prediccion de densidad y color mediante representacion triplanar.
- Carga nativa en runtime MLX Swift mediante `ThreeDGenerationRuntime` o `TripoSRModel.loadWeights(from:)`.
- Verificacion de integridad mediante checksums SHA-256 y fichero de procedencia.
- No incluye texturizado ni eliminacion de fondo en la ruta Swift.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingues (no aplica a un modelo image-to-3D).

## Casos de uso

- Prototipado 3D en apps iOS/macOS: integrar generacion de mallas desde una foto dentro de una aplicacion Swift usando MLX, sin salir del ecosistema Apple ni depender de un backend Python.
- Pipelines de assets para videojuegos o AR: generar mallas base rapidamente a partir de bocetos o fotos de referencia y refinar despues en herramientas de modelado.
- Catalogos de e-commerce: crear representaciones 3D de productos a partir de una sola imagen para visores web o realidad aumentada, aceptando que el texturizado debe hacerse en la ruta Python.
- Investigacion en reconstruccion 3D: usar el bundle como referencia de portabilidad de TripoSR a Swift/MLX para experimentos de paridad numerica entre implementaciones.
- Educacion y demos tecnicas: mostrar generacion image-to-3D en dispositivos Apple con un ejemplo minimo en Swift.
- Verificacion de reproducibilidad: emplear `provenance.json`, `checksums.sha256` y `reproduce_export.py` para auditar la conversion y regenerar el artefacto canonico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El bundle unicamente aporta resumenes de paridad Python-Swift y de smoke test de malla, sin metricas cuantitativas de calidad 3D ni de latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; el runtime objetivo es MLX Swift, orientado a hardware Apple (Apple Silicon), aunque el autor no especifica modelos concretos.
- Compatibilidad con GPU consumer: no disponible.
- Opciones de despliegue: runtime MLX Swift (`apple-mlx-foundations`); la ruta Python original de TripoSR queda fuera de este bundle para texturizado y eliminacion de fondo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| signalNotNoise/triposr-mlx | Conversion MLX Swift de TripoSR | no disponible | no disponible | MIT | safetensors |
| stabilityai/TripoSR (upstream) | Image-to-3D original | no disponible | no disponible | MIT | checkpoint PyTorch |
| Otros modelos image-to-3D | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo entrenado ni ajustado: es una conversion de formato; cualquier limitacion del TripoSR original se hereda.
- La paridad Python-Swift es de correlacion alta, no bit-exacta; pueden aparecer diferencias numericas en la malla generada.
- El texturizado y la eliminacion de fondo no estan implementados en la ruta Swift; hay que recurrir al `run.py` de Python.
- El loader rechaza claves no utilizadas y verifica formas, por lo que modificaciones manuales del checkpoint pueden romper la carga.
- El repositorio no documenta sesgos, riesgos de alucinacion ni limitaciones de idioma (no aplica directamente a un modelo image-to-3D).
- Licencia MIT, lo que permite uso comercial, pero conviene revisar `licenses/TripoSR.txt` y `NOTICE` para la atribucion a Tripo AI y Stability AI.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/signalNotNoise/triposr-mlx
- Modelo base: https://huggingface.co/stabilityai/TripoSR
- Repositorio del runtime Swift: https://github.com/signalnotnoise/apple-mlx-foundations-archive
