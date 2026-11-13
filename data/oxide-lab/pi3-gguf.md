# oxide-lab/Pi3-GGUF

## Resumen

Pi3 es un modelo de reconstrucción de nubes de puntos (point cloud) a partir de imágenes, desarrollado originalmente por el autor `yyfz233` (repositorio base `yyfz233/Pi3`) y empaquetado en formato GGUF por `oxide-lab` bajo el ecosistema Lux3D. El modelo resuelve la tarea de image-to-3D: dado un conjunto de fotogramas de entrada, genera una nube de puntos con posiciones y colores RGB. Con 958.696.738 parámetros (aproximadamente 0,96 mil millones), se sitúa en la gama media de modelos de visión 3D.

Esta ficha cubre específicamente la variante cuantizada GGUF publicada en `oxide-lab/Pi3-GGUF`, que ofrece cuatro niveles de cuantización (Q8_0, Q6_K, Q5_K y Q4_K) con fallback a F16 para las capas no cuantizables. El paquete canónico F32 ocupa 3,57 GiB, mientras que las versiones cuantizadas reducen el peso a entre 0,507 y 0,951 GiB, lo que facilita su despliegue en hardware con recursos limitados.

La relevancia actual de esta publicación radica en su formato autónomo: cada archivo GGUF embebe `resolved_config.json` en los metadatos, de modo que no requiere ficheros hermanos (`manifest.json`, `checksums.json` ni safetensors). Se integra con la CLI `lux3d-cli` y admite ejecución tanto en backend CUDA como WGPU. La licencia BSD 2-Clause facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de reconstrucción de nubes de puntos; detalles de arquitectura no especificados en la información proporcionada) |
| Parametros totales | 958.696.738 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K, Q4_K (con fallback F16); paquete canónico F32 |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | BSD 2-Clause |
| Formato de pesos | GGUF (también safetensors en el paquete canónico F32) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo más allá de su función: reconstrucción de nubes de puntos a partir de imágenes. El proceso de cuantización sí está documentado con precisión: solo se cuantizan las matrices `*.weight` de rango 2 (318 matrices por variante); las normas, sesgos, embeddings, convoluciones y filas que no se dividen en el bloque del dtype permanecen en F16. Las capas lineales cuantizadas se ejecutan mediante `QMatMul`.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables en un modelo de visión 3D). Tampoco se especifican innovaciones como decodificación especulativa o atención lineal. El paquete se distribuye con `resolved_config.json` embebido en los metadatos GGUF, lo que constituye la principal innovación de empaquetado.

## Capacidades

- Reconstrucción de nubes de puntos a partir de imágenes (image-to-3D), generando posiciones y colores RGB.
- Salida en formato PLY ASCII (también acepta `.xyz` como alternativa de texto plano).
- Procesamiento de directorios de fotogramas como entrada (`--source ./frames`).
- Ejecución en backend CUDA y WGPU (verificado en la evaluación cross-backend).
- Empaquetado autónomo: cada GGUF es un paquete completo con configuración embebida.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling ni agentes (no es un modelo lingüístico).

## Casos de uso

- Reconstrucción 3D de escenas a partir de capturas multi-fotograma: el modelo procesa un directorio de imágenes y genera una nube de puntos PLY con color, adecuado para digitalización de entornos en pipelines de visión por computador.
- Escaneo y modelado de objetos para impresión 3D o diseño: a partir de fotografías 512x512 se obtiene geometría con coordenadas y RGB, útil en flujos de prototipado.
- Despliegue en hardware de consumo: la variante Q8_0 (0,951 GiB) o Q6_K (0,736 GiB) permite ejecutar la reconstrucción en equipos con GPU modesta, sin necesidad de servidores de alto rendimiento.
- Integración en herramientas de autoría 3D: la salida PLY ASCII es directamente importable en Blender, MeshLab u otros programas de modelado.
- Procesamiento por lotes en pipelines automatizados: la CLI `lux3d-cli` permite invocar el modelo desde scripts, facilitando la generación masiva de nubes de puntos.
- Investigación en reconstrucción 3D: las métricas de drift frente a F32 documentadas permiten evaluar el impacto de la cuantización en la precisión geométrica antes de desplegar en producción.

## Benchmarks y rendimiento

Las métricas publicadas miden la deriva (drift) respecto al paquete canónico F32, no la precisión frente a ground-truth. Entrada: tres fotogramas sintéticos de 512x512 de los assets de test de Lux3D. Chamfer-L1 relativo a la diagonal del bbox de referencia y F-score simétrico al 0,5%/1%/2% de esa diagonal.

| Variante | CD rel | F@0.5% | F@1% | F@2% |
|---|---|---|---|---|
| q8_0 | 0,166% | 0,990 | 0,99995 | 1,000 |
| q6_k | 0,139% | 0,985 | 0,99907 | 1,000 |
| q5_k | 0,851% | 0,469 | 0,706 | 0,900 |
| q4_k | 0,813% | 0,475 | 0,696 | 0,933 |

Q8_0 cross-backend F@1%: 0,99995 en CUDA y 0,99993 en WGPU. Q5_K y Q4_K pierden aproximadamente un 30% de F-score en la misma entrada, por lo que no se recomiendan.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño de los pesos GGUF (0,507–0,951 GiB) da una cota inferior orientativa, a la que hay que sumar memoria de activaciones y del backend de inferencia.
- GPU recomendadas: no especificadas; se documenta soporte de backend CUDA y WGPU.
- Cabe en GPU de consumo: sí, dado el tamaño reducido de las variantes cuantizadas (Q8_0 recomendada con 0,951 GiB de pesos).
- Opciones de despliegue: `lux3d-cli` (comando `lux3d-cli run pi3`), con backend `--device cuda`; también soporte WGPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de reconstrucción image-to-3D en la documentación proporcionada. La única referencia interna es el paquete canónico F32 (`oxide-lab/Pi3`), frente al cual se miden las cuantizaciones:

| Variante | Tamaño | Estado | CD rel | F@1% |
|---|---|---|---|---|
| F32 canónico | 3,57 GiB | referencia | 0% | referencia |
| q8_0 | 0,951 GiB | recomendado | 0,166% | 0,99995 |
| q6_k | 0,736 GiB | recomendado | 0,139% | 0,99907 |
| q5_k | 0,618 GiB | no recomendado | 0,851% | 0,706 |
| q4_k | 0,507 GiB | no recomendado | 0,813% | 0,696 |

## Limitaciones y advertencias

- Las métricas publicadas miden deriva frente a F32, no precisión frente a verdad de referencia; no deben interpretarse como calidad absoluta de reconstrucción.
- Las variantes Q5_K y Q4_K pierden aproximadamente un 30% de F-score y están marcadas explícitamente como "not recommended"; deben evitarse en producción.
- Las evaluaciones se realizaron sobre tres fotogramas sintéticos de 512x512; el comportamiento con entradas reales, otras resoluciones o secuencias más largas no está documentado.
- No se especifican sesgos conocidos ni riesgos de alucinación geométrica; al ser un modelo de reconstrucción, los errores se manifiestan como distorsiones en la nube de puntos.
- Los pesos están sujetos a la licencia upstream de `yyfz233/Pi3` además de la BSD 2-Clause del empaquetado; conviene verificar las condiciones del modelo base para uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/oxide-lab/Pi3-GGUF
- Modelo base: https://huggingface.co/yyfz233/Pi3
- Paquete canónico F32: https://huggingface.co/oxide-lab/Pi3
- Repositorio Lux3D: https://github.com/oxide-lab/Lux3d
- Checksums: https://huggingface.co/oxide-lab/Pi3-GGUF/blob/main/checksums.json
- Licencia: https://huggingface.co/oxide-lab/Pi3-GGUF/blob/main/LICENSE
